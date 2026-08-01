#!/usr/bin/env node
/**
 * scripts/smoke.mjs — boot smoke test. The gate that would have caught D42.
 *
 * WHAT IT DOES
 *   1. Boots `node server.js` on a spare port, in the read-only run mode (DATABASE_URL deliberately
 *      removed from the child env) so the result is identical on every machine.
 *   2. Drives a real headless Chrome over one route of EVERY template class.
 *   3. Fails the process (exit 1) on ANY of:
 *        · a non-200 main-document response
 *        · an uncaught JS exception (pageerror) or unhandled promise rejection
 *        · a failed same-origin subresource whose {status, path} is not on ALLOWED_REQUEST_FAILURES
 *        · a console error whose text is not on CONSOLE_ALLOWLIST, or that exceeds the number of
 *          allowlisted request failures actually observed on that page (so a NEW silent failure
 *          cannot hide behind the existing ones)
 *        · a page that hydrates to notFound() ("Not found"), loses its <h1>, or ends with != 1 <h1>
 *        · a break in a W0 invariant that held on 564/564: lang="en", the skip link, exactly one
 *          <h1>, zero inline onclick handlers, the role="status" route announcer
 *        · a documented per-route DOM assertion that does not hold
 *
 * WHY THE ALLOWLIST IS A CEILING, NOT A FLOOR
 *   Everything on it is a 503 caused by running with no Postgres. If a machine DOES have a
 *   DATABASE_URL the endpoints answer 200, the allowlisted failures simply do not occur, and the
 *   gate still passes. Nothing here asserts that a 503 must happen.
 *
 * INSTALL (once, and it deliberately touches neither package.json nor package-lock.json, so the
 * Railway build — which runs `npm ci` against that lockfile — cannot be affected by it):
 *      npm i --no-save puppeteer-core
 *
 * RUN:      npm run smoke
 * FULL:     npm run gate          (build && smoke)
 * NOT in prestart — Railway must never need Chrome to boot.
 */
import { spawn } from 'node:child_process';
import net from 'node:net';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SETTLE_MS = Number(process.env.SMOKE_SETTLE_MS || 1200);
const NAV_TIMEOUT = 45000;

// ---------------------------------------------------------------- routes
// One route per template class. `/` first so a total boot failure is reported against the home page.
const ROUTES = [
  ['home', '/'],
  ['compound', '/c/creatine-monohydrate'],
  ['protocol', '/protocol/knee-pain/patellofemoral-pain'],
  ['problem', '/problem/knee-pain'],                       // KEEP_PRERENDERED
  ['target', '/target/AR'],
  ['compare-index', '/compare'],                           // KEEP_PRERENDERED + mounted picker
  ['compare-pair', '/compare/caffeine-vs-creatine-monohydrate'],
  ['muscle', '/muscle/abdominals'],
  ['pathway', '/pathway/0'],
  ['pathways', '/pathways'],
  ['goal', '/goal/muscle'],
  ['learn-index', '/learn'],
  ['learn-module', '/learn/0'],
  ['energy', '/energy/atp-pcr'],
  ['physiology', '/physiology/insulin-blood-sugar'],
  ['fuel', '/fuel/knee-pain/patellofemoral-pain'],
  ['body', '/body'],
  ['body-region', '/body/leg'],
  ['about', '/about'],
  ['anatomy', '/anatomy'],
  ['az', '/az'],
  ['browse', '/browse'],
  ['corrections', '/corrections'],                         // KEEP_PRERENDERED
  ['legend', '/legend'],
  ['methodology', '/methodology'],                         // KEEP_PRERENDERED
  ['plan', '/plan'],
  ['progress', '/progress'],
  ['solve', '/solve'],
  ['stack', '/stack'],
  ['where', '/where'],
];

// ------------------------------------------------- documented failure allowlist
// Every entry is "this request is expected to fail when the site runs with no database".
// Adding one is a deliberate act: write down WHY, and what the user sees instead.
const ALLOWED_REQUEST_FAILURES = [
  { status: 503, path: /^\/api\/me$/, why: 'no DB: signed-out; header renders the Sign in button' },
  { status: 503, path: /^\/api\/rootcause-overlay$/, why: 'no DB: community cause overlay unavailable; the protocol page STATES the absence (see the rcOverlayNotice assertion)' },
  { status: 503, path: /^\/api\/edits\/[^/]+$/, why: 'no DB: compound page shows the base text, no community edit layer' },
  { status: 503, path: /^\/api\/explain$/, why: 'no DB: community "explain it" thread unavailable' },
  { status: 503, path: /^\/api\/comments$/, why: 'no DB: page discussion unavailable' },
  { status: 503, path: /^\/api\/ledger$/, why: 'no DB: protocol adoption ledger unavailable' },
  { status: 503, path: /^\/api\/outcomes\/public$/, why: 'no DB: aggregate outcome stat stays dark (a gated feature anyway)' },
  { status: 503, path: /^\/api\/votes$/, why: 'no DB: vote counts unavailable' },
  { status: 503, path: /^\/api\/experiments\/mine$/, why: 'no DB: personal streak unavailable' },
  { status: 503, path: /^\/api\/protocol-requests$/, why: 'no DB: /solve request board unavailable' },
  { status: 503, path: /^\/api\/forks$/, why: 'no DB: protocol variations unavailable' },
  { status: 503, path: /^\/api\/forks\/popular$/, why: 'no DB: /stack popular variations unavailable' },
  { status: 503, path: /^\/api\/foods$/, why: 'no DB: /fuel user-submitted foods unavailable' },
  { status: 503, path: /^\/api\/partners$/, why: 'no DB: local partners unavailable' },
  { status: 503, path: /^\/api\/pulse$/, why: 'no DB: site activity pulse unavailable' },
  { status: 503, path: /^\/api\/contributors$/, why: 'no DB: contributor leaderboard unavailable' },
  { status: 503, path: /^\/api\/rootcause-changes$/, why: 'no DB: proposed cause changes unavailable' },
];

// Console errors that are allowed AT ALL. The 503 line is additionally budget-capped below: Chrome
// logs exactly one of these per failed request, so more of them than allowlisted failed requests
// means something new started failing.
const CONSOLE_ALLOWLIST = [
  {
    re: /^Failed to load resource: the server responded with a status of 503 \(Service Unavailable\)$/,
    budgeted: true,
    why: 'Chrome logs one line per failed subresource; each must map to an ALLOWED_REQUEST_FAILURES entry',
  },
];

// ----------------------------------------------- per-route DOM assertions
// Keep these few and load-bearing. Each names the defect it locks down.
const ASSERTIONS = {
  // W1 visible degradation (commit 587c056): when /api/rootcause-overlay fails, the protocol page
  // must SAY the community cause layer is missing instead of silently showing the built-in list.
  // Gated on the request having actually failed, so this assertion is a no-op — not a false
  // failure — on a machine that runs with a real DATABASE_URL.
  '/protocol/knee-pain/patellofemoral-pain': [{
    name: 'rcOverlayNotice',
    onlyIfRequestFailed: /^\/api\/rootcause-overlay$/,
    selector: '#p-causes [data-api-absent="rootcause-overlay"]',
    why: 'D42: the root-cause overlay 503s and nothing on the page tells the reader',
  }],
};

// ---------------------------------------------------------------- helpers
const bold = s => (process.stdout.isTTY ? `\x1b[1m${s}\x1b[0m` : s);
const fail = [];

function freePort() {
  return new Promise((res, rej) => {
    const s = net.createServer();
    s.once('error', rej);
    s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
  });
}

function get(url) {
  return new Promise(res => {
    const r = http.get(url, x => { x.resume(); res(x.statusCode); });
    r.on('error', () => res(0));
    r.setTimeout(2000, () => { r.destroy(); res(0); });
  });
}

async function waitForServer(base, child, ms = 40000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (child.exitCode !== null) throw new Error(`server exited early with code ${child.exitCode}`);
    if (await get(base + '/') === 200) return;
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error(`server did not answer 200 on ${base}/ within ${ms}ms`);
}

async function loadPuppeteer() {
  try { return (await import('puppeteer-core')).default; }
  catch {
    console.error('\n✖ smoke: puppeteer-core is not installed.\n'
      + '  npm i --no-save puppeteer-core\n'
      + '  (--no-save on purpose: this must not enter package.json or package-lock.json,\n'
      + '   because the Railway build runs npm ci against that lockfile.)\n');
    process.exit(1);
  }
}

function chromePath() {
  if (process.env.CHROME) return process.env.CHROME;
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  const hit = candidates.find(p => { try { return fs.statSync(p).isFile(); } catch { return false; } });
  if (!hit) {
    console.error('\n✖ smoke: no Chrome found. Set CHROME=/path/to/chrome.\n  tried:\n   ' + candidates.join('\n   ') + '\n');
    process.exit(1);
  }
  return hit;
}

// ---------------------------------------------------------------- main
const port = await freePort();
const BASE = `http://127.0.0.1:${port}`;
const env = { ...process.env, PORT: String(port), NODE_ENV: 'test' };
// Deterministic run mode: the gate must behave the same on a laptop with a local Postgres and on a
// clean checkout. SMOKE_DATABASE_URL is the deliberate opt-in for exercising the write backend.
if (process.env.SMOKE_DATABASE_URL) env.DATABASE_URL = process.env.SMOKE_DATABASE_URL;
else delete env.DATABASE_URL;

console.log(bold(`\n▸ smoke: booting server.js on :${port} (${env.DATABASE_URL ? 'DB on' : 'read-only, no DB'})`));
const child = spawn(process.execPath, ['server.js'], { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
const serverLog = [];
child.stdout.on('data', d => serverLog.push(String(d)));
child.stderr.on('data', d => serverLog.push(String(d)));

let browser;
try {
  await waitForServer(BASE, child);
  const puppeteer = await loadPuppeteer();
  browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const rows = [];
  for (const [cls, route] of ROUTES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

    const consoleErrors = [];
    const pageErrors = [];
    const badRequests = [];   // {status, path}
    const netFailures = [];   // DNS/abort/etc
    // SAME-ORIGIN ONLY. Muscle pages embed a Sketchfab iframe (which in turn calls sentry.io);
    // in a headless sandbox those cross-origin requests abort non-deterministically. Gating on
    // them would make this gate flaky, and a flaky gate gets switched off. Third-party embeds are
    // out of scope; everything RNAwiki serves is in scope.
    const ours = u => u.startsWith(BASE);
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', e => pageErrors.push(String(e).slice(0, 300)));
    page.on('requestfailed', q => { if (ours(q.url())) netFailures.push(`${q.method()} ${q.url()} ${(q.failure() || {}).errorText || ''}`); });
    page.on('response', r => {
      if (r.status() >= 400 && ours(r.url())) {
        let p = r.url();
        try { p = new URL(r.url()).pathname; } catch { }
        badRequests.push({ status: r.status(), path: p, url: r.url() });
      }
    });

    // Unhandled promise rejections are NOT reported as pageerror by CDP, and this codebase is full
    // of un-awaited async calls (route() fires renderProtocol/renderPlan/mountBody and never catches).
    // Collect them in-page and read them back with the DOM measurement.
    await page.evaluateOnNewDocument(() => {
      window.__smokeRejections = [];
      window.addEventListener('unhandledrejection', e => {
        const r = e.reason;
        window.__smokeRejections.push(String((r && (r.stack || r.message)) || r).slice(0, 300));
      });
    });

    let status = 0, dom = null, navErr = null;
    try {
      const resp = await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT });
      status = resp ? resp.status() : 0;
      await new Promise(r => setTimeout(r, SETTLE_MS));
      dom = await page.evaluate(() => {
        const h1s = [...document.querySelectorAll('h1')];
        return {
          h1Count: h1s.length,
          h1: (h1s[0]?.textContent || '').trim().slice(0, 120),
          lang: document.documentElement.lang,
          skipLink: !!document.querySelector('a[href="#main"], a[href="#app"]'),
          announcer: document.querySelectorAll('[role="status"][aria-live="polite"]').length,
          inlineOnclick: document.querySelectorAll('[onclick]').length,
          appChildren: (document.getElementById('app')?.children.length) || 0,
          rejections: (window.__smokeRejections || []).slice(0, 10),
        };
      });
    } catch (e) { navErr = String(e).slice(0, 200); }

    const add = msg => fail.push(`${route}  ${msg}`);

    if (navErr) add(`navigation failed — ${navErr}`);
    if (status !== 200) add(`main document returned ${status} (expected 200)`);
    pageErrors.forEach(e => add(`UNCAUGHT JS EXCEPTION — ${e}`));
    (dom?.rejections || []).forEach(r => add(`UNHANDLED PROMISE REJECTION — ${r}`));

    // failed subresources
    const allowedFailures = [];
    for (const b of badRequests) {
      if (b.path === route && b.status === status) continue; // already reported as the main document
      const hit = ALLOWED_REQUEST_FAILURES.find(a => a.status === b.status && a.path.test(b.path));
      if (hit) allowedFailures.push(b);
      else add(`UNDOCUMENTED FAILED REQUEST — ${b.status} ${b.path}  (add it to ALLOWED_REQUEST_FAILURES with a reason, or fix it)`);
    }
    netFailures.forEach(f => add(`REQUEST DID NOT COMPLETE — ${f}`));

    // console errors
    let budget = allowedFailures.length;
    for (const c of consoleErrors) {
      const hit = CONSOLE_ALLOWLIST.find(a => a.re.test(c));
      if (!hit) { add(`CONSOLE ERROR (not allowlisted) — ${c.slice(0, 200)}`); continue; }
      if (hit.budgeted) {
        if (budget > 0) budget--;
        else add(`CONSOLE ERROR beyond the allowlisted-failure budget — ${c.slice(0, 160)}`);
      }
    }

    // structural invariants (W0: held on 564/564 — do not regress)
    if (dom) {
      if (dom.h1Count !== 1) add(`expected exactly one <h1>, found ${dom.h1Count}`);
      if (!dom.h1) add('page has no <h1> text');
      if (dom.h1 === 'Not found') add('hydrates to notFound() — the SPA has no renderer for this route');
      if (dom.lang !== 'en') add(`documentElement.lang = "${dom.lang}" (expected "en")`);
      if (!dom.skipLink) add('skip link is gone');
      if (dom.announcer < 1) add('role="status" aria-live="polite" route announcer is gone');
      if (dom.inlineOnclick) add(`${dom.inlineOnclick} inline onclick handler(s) — the site is CSP-clean, keep it that way`);
      if (dom.appChildren === 0) add('#app is empty after hydration');
    }

    // documented per-route assertions
    for (const a of (ASSERTIONS[route] || [])) {
      const gate = !a.onlyIfRequestFailed || badRequests.some(f => a.onlyIfRequestFailed.test(f.path));
      if (!gate) continue;
      const present = await page.$(a.selector).then(x => !!x).catch(() => false);
      if (!present) add(`ASSERTION ${a.name} FAILED — expected ${a.selector} — ${a.why}`);
    }

    rows.push({ cls, route, status, con: consoleErrors.length, pe: pageErrors.length, bad: badRequests.length });
    await page.close();
  }

  const w = Math.max(...rows.map(r => r.route.length));
  console.log(bold(`\n  class            route${' '.repeat(Math.max(0, w - 5))}  http  console  pageerr  failed-req`));
  for (const r of rows) {
    console.log(`  ${r.cls.padEnd(15)}  ${r.route.padEnd(w)}  ${String(r.status).padStart(4)}  ${String(r.con).padStart(7)}  ${String(r.pe).padStart(7)}  ${String(r.bad).padStart(10)}`);
  }
} catch (e) {
  fail.push(`harness: ${e && e.message ? e.message : String(e)}`);
} finally {
  if (browser) await browser.close().catch(() => { });
  child.kill('SIGTERM');
  await new Promise(r => setTimeout(r, 300));
  if (child.exitCode === null) child.kill('SIGKILL');
}

if (fail.length) {
  console.error(bold(`\n✖ SMOKE FAILED — ${fail.length} problem${fail.length === 1 ? '' : 's'}\n`));
  fail.forEach(f => console.error('  · ' + f));
  if (serverLog.length) console.error('\n  server output:\n' + serverLog.join('').split('\n').map(l => '    ' + l).join('\n'));
  console.error('');
  process.exit(1);
}
console.log(bold(`\n✔ SMOKE PASSED — ${ROUTES.length} routes, ${ROUTES.length} template classes, 0 undocumented errors\n`));
process.exit(0);
