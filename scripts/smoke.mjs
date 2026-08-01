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
  // W4: the OTHER branch of the $0 split. 8 of 52 root causes have no free first step and say so
  // instead of inventing one; on those, Phase 2 must render OPEN, because hiding the only thing
  // the page has behind a step the reader cannot take would be worse than the defect.
  ['protocol-nophase1', '/protocol/hair-loss/dht-sensitivity'],
  // Same template class again, and the route where resolveCompound() linked the wrong molecule:
  // its "oral butyrate" plan item pointed at HMB (β-Hydroxy β-Methylbutyrate). See the
  // planItemLinksNameTheirOwnRef assertion — the invariant it checks holds on all 52 protocol
  // routes (365 linked items measured hydrated), but only this one carries the item that broke it.
  ['protocol-linkref', '/protocol/gut-health/dysbiosis'],
  // Same template class, but a route whose correct open cause is NOT the first one. The route
  // above is one of the 32 whose correct index IS 0, so it cannot detect D3 or its regression.
  ['protocol-rc', '/protocol/knee-pain/patellar-tendinopathy'],
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
  // Same template class, with a query. /solve?q= used to render byte-identically to /solve
  // (#app.innerHTML 11,797 chars on every query), so the unqueried route above cannot detect D11.
  ['solve-q', '/solve?q=knee%20pain'],
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
  // D13 (commit 7c832be): /problem/* is the differential-diagnosis hub — where /solve, every
  // protocol and every breadcrumb send a reader to work out which of their 4-7 causes they have.
  // Measured hydrated at 390x844 on all 41 pages before the fix: the first protocol link sat at 98%
  // of a 29,844 px page on 41/41, there was no escalation block on any of them, 0 of 224 causes had
  // an anchor or a next step, and 0 of 861 plan items were linked. This asserts the ORDER, which is
  // what the defect actually was. Prove it by moving ${causeCascadeFlat(p)} back above
  // ${problemDifferential(p, causes)} in build/prerender.js — firstProtocolPct jumps back to 98.
  '/problem/knee-pain': [{
    name: 'problemPageIsADifferential',
    why: 'D13: escalation, every tell, and a route to a protocol must all come BEFORE the mechanism prose, and every #cause-N must resolve',
    evaluate: () => {
      const app = document.querySelector('#app') || document.body;
      const H = document.documentElement.scrollHeight;
      const y = el => Math.round(el.getBoundingClientRect().top + window.scrollY);
      if (!document.getElementById('red-flags')) return 'no #red-flags escalation block';
      if (!/not medical advice/i.test(app.innerText)) return '#red-flags does not say the page is not medical advice';
      const dx = document.getElementById('which-one');
      if (!dx) return 'no #which-one differential block';
      const rows = dx.querySelectorAll('.dx-row');
      const causes = app.querySelectorAll('.cause-flat-item');
      if (rows.length !== causes.length) return `${rows.length} differential rows for ${causes.length} causes`;
      if (dx.querySelectorAll('.dx-tell').length !== rows.length) return 'a differential row has no tell';
      if (y(dx) > 844 * 4) return `the differential starts at ${y(dx)}px, below the 4th screen`;
      const proto = [...app.querySelectorAll('a[href]')].find(a => /(^|\/)protocol\//.test(a.getAttribute('href')));
      if (!proto) return 'no link to a protocol anywhere on the page';
      const pct = Math.round(100 * y(proto) / H);
      if (pct > 40) return `the first protocol link is at ${pct}% of page height (was 98% — this is the defect)`;
      const ids = new Set([...causes].map(c => c.id).filter(Boolean));
      if (ids.size !== causes.length) return `${ids.size} of ${causes.length} cause blocks have an id`;
      const jumps = [...app.querySelectorAll('a[href^="#cause-"]')];
      if (!jumps.length) return 'no #cause-N jump links';
      const dead = jumps.filter(a => !document.getElementById(a.getAttribute('href').slice(1)));
      if (dead.length) return `${dead.length} of ${jumps.length} #cause-N links resolve to nothing`;
      const next = [...causes].filter(c => c.querySelector('.cf-next a[href^="/protocol/"]')).length;
      if (next !== causes.length) return `${next} of ${causes.length} causes offer a protocol at the end`;
      const lis = [...app.querySelectorAll('.cf-fixes li')];
      const linked = lis.filter(li => li.querySelector('a[href^="/c/"]')).length;
      if (!linked) return `0 of ${lis.length} plan items link to the compound they name`;
      return null;
    },
  }],
  // W2.5 (2026-08-01): a plan item must link to the compound IT NAMES. site/app.js's
  // resolveCompound() ended in a last-resort pass that flattened both slugs and asked for a bare
  // substring, so a ref could match a fragment inside a longer chemical word. Measured hydrated at
  // 390x844 on this route: the item "Daily fermented foods (yoghurt, kefir, kimchi) … oral butyrate
  // is an optional adjunct" (authored ref "Butyrate") linked to #/c/hmb-hydroxy-methylbutyrate,
  // because "hmbhydroxymethylbutyrate" contains "butyrate". HMB is a leucine metabolite for muscle.
  // The prerendered document rendered the same item as plain text (prerender.js:findCpt has no
  // substring pass), so the two documents disagreed on exactly this item and only a hydrated check
  // can see it.
  // This asserts the PROPERTY, not the algorithm: the linked compound's name and the authored ref
  // must share whole words — either the ref's words appear as a run inside the compound's name
  // ("B12" inside "B-Complex / B12 / Methylfolate / B6"), or the compound's name appears as a run
  // inside the ref ("Magnesium" inside "Magnesium glycinate"). Letters inside a longer word are not
  // a shared name. Verified hydrated over all 52 protocol routes: 1,110 rendered plan items, all
  // 1,110 matched to their authored fix, 365 of them linked, 0 violations after the fix.
  // Prove this gate by restoring the old pass 5 in site/app.js —
  // `|| D.compounds.find(c => flat(slug(c.name)).includes(flat(s)))` with `const flat = x =>
  // x.split('-').join('')` — and rebuilding: this route fails and names the item.
  '/protocol/gut-health/dysbiosis': [{
    name: 'planItemLinksNameTheirOwnRef',
    why: 'W2.5: a plan item that links to a compound page must link to the compound it names — "Butyrate" linked to HMB',
    evaluate: () => {
      const norm = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const sl = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const run = (hay, ndl) => {
        for (let i = 0; i + ndl.length <= hay.length; i++) {
          let ok = true;
          for (let j = 0; j < ndl.length; j++) if (hay[i + j] !== ndl[j]) { ok = false; break; }
          if (ok) return true;
        }
        return false;
      };
      const pid = location.pathname.split('/')[2];
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      if (!p) return `no problem ${pid} in the shipped data`;
      const fixes = [];
      ((p.why || {}).causes || []).forEach(c => (c.fixes || []).forEach(f => fixes.push(f)));
      const lis = [...document.querySelectorAll('#app li')].filter(li => li.querySelector('.fix-kind'));
      if (!lis.length) return 'no plan items rendered on this protocol page';
      let linked = 0, unmatched = 0;
      for (const li of lis) {
        const t = norm(li.textContent);
        const f = fixes.find(x => x.what && t.endsWith(norm(x.what)));
        if (!f) { unmatched++; continue; }
        const a = li.querySelector('a[href*="/c/"]');
        if (!a) continue;
        linked++;
        const href = a.getAttribute('href');
        if (!f.ref) return `a plan item links to ${href} while authoring no ref at all: "${li.textContent.trim().slice(0, 70)}"`;
        const ct = href.replace(/^#?\/c\//, '').split('-');
        const rt = sl(f.ref).split('-');
        if (!run(ct, rt) && !run(rt, ct))
          return `the plan item whose ref is ${JSON.stringify(f.ref)} links to ${href}, whose name does not contain that word — a reader clicking "${li.textContent.trim().slice(0, 60)}" lands on a different molecule`;
      }
      if (unmatched) return `${unmatched} of ${lis.length} rendered plan items match no authored fix — the text match this assertion relies on has drifted, so it can no longer see the defect`;
      if (!linked) return `0 of ${lis.length} plan items link to a compound — resolveCompound() has stopped resolving`;
      return null;
    },
  }],
  // D10 (commit e7a19ef): /solve is the funnel entrance. It used to link every card to
  // `#/protocol/{pid}/{root_causes[0].id}`, so a JS reader saw 41 of the 52 protocol URLs and 0
  // /problem URLs while the crawler document had all 52 — 11 protocol URLs unreachable. Prove this
  // gate by reverting solveCard() to a single <a href="#/protocol/${p.id}/${p.root_causes[0].id}">.
  // The data-native clause is separate and just as load-bearing: /problem is KEEP_PRERENDERED, so a
  // /problem link without it leaves the /solve DOM sitting under a /problem URL.
  '/solve': [{
    name: 'solveReachesEveryProtocolAndProblem',
    why: 'D10: /solve must reach all 52 protocol URLs and all 41 problem URLs, and every /problem link must carry data-native',
    evaluate: () => {
      const G = window.RNAWIKI_DATA.graph;
      const want = [];
      G.problems.forEach(p => p.root_causes.forEach(rc => want.push('/protocol/' + p.id + '/' + rc.id)));
      const A = [...document.querySelectorAll('#app a[href]')].map(a => a.getAttribute('href').replace(/^#/, ''));
      const missP = want.filter(u => A.indexOf(u) < 0);
      if (missP.length) return `${missP.length} of ${want.length} protocol URLs unreachable, e.g. ${missP.slice(0, 3).join(', ')}`;
      const missProb = G.problems.map(p => '/problem/' + p.id).filter(u => A.indexOf(u) < 0);
      if (missProb.length) return `${missProb.length} of ${G.problems.length} problem URLs unreachable, e.g. ${missProb.slice(0, 3).join(', ')}`;
      const noNative = [...document.querySelectorAll('#app a[href^="/problem/"]')].filter(a => !a.hasAttribute('data-native')).length;
      if (noNative) return `${noNative} /problem link(s) missing data-native — KEEP_PRERENDERED means the click would leave the /solve DOM in place under a /problem URL`;
      return null;
    },
  }],
  // D11 (commits e7a19ef + d6df0f8): the query must change the page and round-trip into the field.
  // Prove this gate by reverting route() to `html = solvePage()`.
  '/solve?q=knee%20pain': [{
    name: 'solveQueryIsRead',
    why: 'D11: ?q= was split off in route() and thrown away — every query rendered the same 11,797-char #app with no <input> in it',
    evaluate: () => {
      const inp = document.getElementById('solve-q');
      if (!inp) return 'no #solve-q field on /solve';
      if (inp.value !== 'knee pain') return `#solve-q value is ${JSON.stringify(inp.value)}, expected "knee pain"`;
      const hits = document.querySelector('#q-hits');
      if (!hits || !hits.querySelector('.solve-card')) return 'no ranked matches rendered for q=knee pain';
      const first = hits.querySelector('.solve-card').dataset.pid;
      if (first !== 'knee-pain') return `top match is ${first}, expected knee-pain`;
      return null;
    },
  }],
  // D3 (commit da1e71e): the protocol page must expand the cause its own URL is about. Before the
  // fix app.js hard-coded `open` on index 0, so this route printed "Patellar tendinopathy (tendon
  // overload)" in its header and expanded "Hip & quad weakness with patellofemoral pain" — on 20
  // of 52 protocol URLs. Index 2 is what data/cause_map.json binds knee-pain/patellar-tendinopathy
  // to ("Training-load error (patellar tendinopathy)"); if that entry is ever re-authored, this
  // number must move with it. Selector-only, because the runner below tests element presence —
  // which is why app.js stamps data-cause-index on every accordion. The exclusive-group invariant
  // means one [open] existing implies no sibling is open.
  '/protocol/knee-pain/patellar-tendinopathy': [{
    name: 'urlRootCauseIsTheOpenCause',
    selector: '#p-causes .cause-acc[data-cause-index="2"][open]',
    why: 'D3: the accordion must open the cause data/cause_map.json binds to this URL, not index 0',
  }],
  // W1 visible degradation (commit 587c056): when /api/rootcause-overlay fails, the protocol page
  // must SAY the community cause layer is missing instead of silently showing the built-in list.
  // Gated on the request having actually failed, so this assertion is a no-op — not a false
  // failure — on a machine that runs with a real DATABASE_URL.
  // W4: the $0 split, on the branch that HAS a Phase 1. Measured hydrated at 390x844 in the
  // DEFAULT DOM state on all 52 protocol routes before it: "Phase 1"/"Phase 2" 0/52, "$0" 1/52,
  // any hold-everything-constant instruction 0/52, and the page's own free single habit at
  // median y 17,687 px = 94% depth, 7,732 px BELOW the first supplement link, on 52/52.
  // Every value below is read from the SHIPPED DATA at assertion time, so re-selecting a Phase 1
  // cannot silently leave the page printing the old one.
  // Prove this gate by moving ${phase1Section(problem, rc)} below ${protocolLayers(...)} in
  // renderProtocol(), or by deleting the `open` state logic so Phase 2 renders open on a route
  // that has a Phase 1.
  '/protocol/hair-loss/dht-sensitivity': [{
    name: 'phase1SaysSoWhenThereIsNoFreeStep',
    why: 'W4: 8 of 52 root causes have no $0 first step. They must say so, not invent one — and their Phase 2 must not be hidden behind a step the reader cannot take',
    evaluate: () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      const rc = p.root_causes.find(x => x.id === rcid);
      const app = document.querySelector('#app');
      if (rc.phase1) return 'this root cause now carries a Phase 1 — pick a different smoke route for the no-free-step branch';
      if (!rc.phase1None) return 'no rc.phase1None — build/parse.js should have refused to build';
      const sec = app.querySelector('#phase-1');
      if (!sec) return 'no #phase-1 section';
      if (!sec.hasAttribute('data-phase1-none')) return 'the section does not declare that there is no $0 version of this protocol';
      if (app.querySelectorAll('.p1-action').length !== 1) return `${app.querySelectorAll('.p1-action').length} .p1-action elements — expected exactly 1`;
      if ((sec.textContent || '').indexOf(rc.phase1None) < 0) return 'the authored reason is not printed, so the page states a bare refusal';
      const d = app.querySelector('#phase-2');
      if (!d) return 'no #phase-2 container';
      if (!d.open) return 'Phase 2 is COLLAPSED on a route with no Phase 1 — the only thing this page has is hidden behind a step the reader cannot take';
      return null;
    },
  }],
  '/protocol/knee-pain/patellofemoral-pain': [{
    name: 'phase1IsOneFreeThingAndComesFirst',
    why: 'W4: the free first step must be one thing, cost nothing, be quoted from the page own plan, come before the stack, and keep Phase 2 collapsed until it is started or skipped',
    evaluate: () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      const rc = p.root_causes.find(x => x.id === rcid);
      const app = document.querySelector('#app');
      if (!rc.phase1) return 'this root cause carries no Phase 1 — build/parse.js should have refused to build, or pick a different smoke route';
      const sec = app.querySelector('#phase-1');
      if (!sec) return 'no #phase-1 section — nothing on the page names a first step that costs nothing';
      const acts = app.querySelectorAll('.p1-action');
      if (acts.length !== 1) return `${acts.length} .p1-action elements — Phase 1 is ONE intervention, not a list`;
      if (sec.getAttribute('data-phase1-action') !== rc.phase1.action)
        return `the action on the page is not the one the build selected (${JSON.stringify(sec.getAttribute('data-phase1-action'))} vs ${JSON.stringify(rc.phase1.action)})`;
      if (acts[0].textContent.trim() !== rc.phase1.action) return 'the printed action is not the selected action';
      if (sec.getAttribute('data-phase1-cost') !== 'none') return 'Phase 1 does not declare that it costs nothing';
      const txt = (sec.textContent || '').replace(/\s+/g, ' ');
      if (txt.indexOf(rc.phase1.quote) < 0) return 'the authored sentence the action was condensed from is not printed';
      if (!/one variable at a time/i.test(txt)) return 'Phase 1 never tells the reader to hold everything else constant, so the 7 days measure nothing';
      // the metric is the W2 structure REUSED, not a second one authored here
      const m = (p.safety || {}).metric;
      if (!m || txt.indexOf(m) < 0) return 'Phase 1 does not name the same tracked metric the safety card promotes';
      if (app.querySelectorAll('[data-primary-metric]').length !== 1) return 'more than one primary metric on the page';
      // ORDER, in DOM terms: free before paid.
      const order = [...app.querySelectorAll('*')];
      const stack = app.querySelector('#p-stack');
      if (!stack) return 'no #p-stack';
      if (order.indexOf(sec) > order.indexOf(stack)) return 'Phase 1 comes AFTER the supplement stack — the free step must precede the paid one';
      const firstRec = Math.min(
        order.indexOf(app.querySelector('.fix-kind.fk-compound')) >>> 0,
        order.indexOf(app.querySelector('.adopt-plan')) >>> 0,
        order.indexOf(stack) >>> 0);
      if (order.indexOf(sec) > firstRec) return 'Phase 1 comes after the first supplement recommendation on the page';
      // Phase 2 collapsed on a fresh (anonymous, no-localStorage) visit
      const d = app.querySelector('#phase-2');
      if (!d) return 'no #phase-2 container — the stack must be behind an optional second phase';
      if (d.open) return 'Phase 2 is OPEN on a first visit — the split does nothing if the paid half is already unrolled';
      return null;
    },
  }, {
    name: 'rcOverlayNotice',
    onlyIfRequestFailed: /^\/api\/rootcause-overlay$/,
    selector: '#p-causes [data-api-absent="rootcause-overlay"]',
    why: 'D42: the root-cause overlay 503s and nothing on the page tells the reader',
  }, {
    // D2: hydration used to DELETE safety content the crawler receives. Measured hydrated at
    // 390x844 with every <details> expanded, on all 52 protocol routes, before the fix:
    // "Move —" 0/52 · "Fuel —" 0/52 · "Stack —" 0/52 · "Daily nutrient targets" 0/52 ·
    // "call your local emergency number" 2/52 · "995" 0/52 — against 52/52 for each in the
    // prerendered document, while the hydrated footer still claimed "Nutrient targets are general
    // adult guidance with a stated reason". Every number below is read from the SHIPPED DATA at
    // assertion time, so re-authoring a root cause cannot silently drop a target from the page.
    // Prove this gate by deleting `${protocolLayers(problem, rc, P)}` from renderProtocol(), or by
    // deleting the .esc-note <p> from planSection() — each failure names itself.
    name: 'hydratedProtocolKeepsWhatTheCrawlerGets',
    why: 'D2: Move/Fuel/Stack, every authored nutrient target, and the emergency-number escalation must survive hydration',
    evaluate: () => {
      const [, , pid, rcid] = location.pathname.split('/');
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      const rc = p.root_causes.find(x => x.id === rcid);
      const app = document.querySelector('#app');
      const txt = (app.textContent || '').replace(/\s+/g, ' ');
      for (const [id, word] of [['p-move', 'Move —'], ['p-fuel', 'Fuel —'], ['p-stack', 'Stack —']]) {
        if (!document.getElementById(id)) return `no #${id} section`;
        if (txt.indexOf(word) < 0) return `#${id} exists but the page never says "${word}"`;
      }
      // every authored nutrient target, with its number and unit
      const tg = Object.entries(rc.nutrient_targets || {});
      if (!tg.length) return 'this root cause authors no nutrient target — pick a different smoke route';
      if (txt.indexOf('Daily nutrient targets') < 0) return 'no "Daily nutrient targets" block';
      const missing = tg.filter(([, t]) => txt.indexOf(String(t.target) + (t.unit || '')) < 0);
      if (missing.length) return `${missing.length} of ${tg.length} nutrient targets are not printed`;
      // the escalation path, and every number in it
      const re = document.querySelector('.plan-reassess .esc-note');
      if (!re) return 'no escalation note inside the red-flag card';
      const nums = ['999', '911', '112', '995', '000'].filter(x => re.textContent.indexOf(x) < 0);
      if (nums.length) return `the escalation note omits ${nums.join(', ')}`;
      // red flags before the first supplement — a stack recommendation must never outrank them.
      // W4 (2026-08-02): this compared getBoundingClientRect().top. #p-stack is about to live
      // inside <details id="phase-2">, closed by default, so the y-comparison was expected to
      // read y(card) === 0 and invert on every protocol route.
      // The predicted inversion DOES NOT HAPPEN — measured, not assumed. The element this
      // assertion actually reads, #p-stack .st-card, keeps a real rect inside the closed
      // <details> (top 18,152 px, height 227 px, display block, contentVisibility "visible"), so
      // the old predicate fired on 0/2 smoke routes.
      // BUT GEOMETRY IN THERE IS NOT TRUSTWORTHY, and that IS measured
      // (out/w4int_after_geom.json, hydrated 390x844, 52/52, reproduced 4/4 on one route):
      // #p-stack ITSELF returns a ZERO rect while its own descendant .st-card returns 18,152 px
      // IN THE SAME evaluate. Any collapsed subtree can report either. So the geometry form of
      // this assertion was one selector change away from silently comparing against zero.
      // DOM order is what "above" means here and it does not depend on a UA's current choice
      // about laying out collapsed content.
      const order = [...app.querySelectorAll('*')];
      const card = document.querySelector('#p-stack .st-card');
      if (card && order.indexOf(document.querySelector('.plan-reassess')) > order.indexOf(card))
        return 'the first supplement card sits ABOVE the red-flag block';
      // the Stack is what the regulator calls a supplement/OTC, never a prescription medicine
      const rx = document.querySelectorAll('#p-stack .st-card.rx').length;
      if (rx) return `${rx} prescription/controlled compound(s) rendered inside the Stack`;
      // the tab must name the root cause, not just the problem
      const short = rc.name.replace(/\s*\([^)]*\)/, '').toLowerCase();
      if (document.title.toLowerCase().indexOf(short.slice(0, 24)) < 0)
        return `document.title ${JSON.stringify(document.title)} does not name the root cause`;
      return null;
    },
  }, {
    // W2 safety structure. Measured hydrated at 390x844 in the DEFAULT DOM state on all 52 protocol
    // routes before this: a labelled stop-rule element 0/52, a named tracking metric 0/52, and the
    // 🚩 card BELOW the page's first supplement recommendation on 52/52 (median y 11,023 px against
    // 8,914 px, on an 18,430 px page). Note WHICH recommendation comes first: not the Stack, but the
    // "💊 Supplement" fix line inside the open cause accordion — the assertion above compares
    // against #p-stack and so cannot see that, which is why this one exists.
    // Both structures are promoted from the page's own authored plan by data/protocol_safety.json
    // and gated in build/parse.js; this checks they survived hydration and stayed in front.
    // Prove this gate by moving ${safetyFirstSection(problem)} back below
    // ${causesSection(...)} in renderProtocol(), or by deleting either data attribute.
    name: 'safetyStructureLeadsTheProtocol',
    why: 'W2: the red flags, the one tracked metric and the stop rule must come before the first thing the page recommends',
    evaluate: () => {
      const [, , pid] = location.pathname.split('/');
      const p = window.RNAWIKI_DATA.graph.problems.find(x => x.id === pid);
      const app = document.querySelector('#app');
      const s = p.safety;
      if (!s) return `problem ${pid} carries no promoted safety structure — build/parse.js should have refused to build`;
      const metric = app.querySelector('[data-primary-metric]');
      const stop = app.querySelector('[data-stop-rule]');
      if (!metric) return 'no [data-primary-metric] element — nothing names the one thing this protocol is judged by';
      if (!stop) return 'no [data-stop-rule] element — nothing states the point at which the answer is to stop';
      if (metric.getAttribute('data-primary-metric') !== s.metric)
        return `the metric on the page is not the one the build promoted (${JSON.stringify(metric.getAttribute('data-primary-metric'))} vs ${JSON.stringify(s.metric)})`;
      // W2.5: the attribute is the stop rule's OWN horizon, not a timeline rung. It used to be
      // `checkpoint`, which is the last timeline `when` on 41 of 41 problems and agreed with the
      // rule only by luck — /protocol/skin-aging/* headed "MONTHS 6–12" over "after 12 weeks".
      // Assert both that the attribute matches the build AND that the visible header prints it,
      // so a renderer that keeps the attribute and drops the text cannot pass.
      if (stop.getAttribute('data-horizon') !== (s.stopHorizon || ''))
        return `the stop rule names horizon ${JSON.stringify(stop.getAttribute('data-horizon'))}, the build promoted ${JSON.stringify(s.stopHorizon)}`;
      if (s.stopHorizon && stop.textContent.indexOf('The stop rule · ' + s.stopHorizon) < 0)
        return `the stop rule's header does not print the horizon its own rule names (${JSON.stringify(s.stopHorizon)})`;
      if (s.stopHorizon && s.stopIssue.indexOf(s.stopHorizon) < 0)
        return `the horizon on the page (${JSON.stringify(s.stopHorizon)}) is not named by the rule it heads (${JSON.stringify(s.stopIssue)})`;
      const txt = (app.textContent || '').replace(/\s+/g, ' ');
      if (txt.indexOf(s.metricSource.replace(/\*/g, '')) < 0)
        return 'the metric label is printed without the authored sentence it was promoted from';
      // ORDER is the assertion. The first recommendation on the page is the earliest of: a
      // "Supplement" fix line in the cause accordion, the "add the supplements" button, or the Stack.
      const idx = el => (el ? [...app.querySelectorAll('*')].indexOf(el) : Infinity);
      const red = app.querySelector('.plan-reassess');
      if (!red) return 'no red-flag block';
      const firstRec = Math.min(idx(app.querySelector('.fix-kind.fk-compound')), idx(app.querySelector('.adopt-plan')), idx(document.getElementById('p-stack')));
      if (firstRec === Infinity) return 'no supplement recommendation found on the page — pick a different smoke route';
      const worst = Math.max(idx(red), idx(metric), idx(stop));
      if (worst > firstRec) return 'the safety structure comes AFTER the first supplement recommendation — this is the defect';
      return null;
    },
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
      // Two kinds of assertion. `selector` is presence-only and covers most defects. `evaluate`
      // exists for the ones that are a RELATION between things on the page — "every protocol URL
      // in the graph is reachable from here" cannot be written as a CSS selector. It runs in the
      // page and returns null to pass, or the failure message.
      if (a.evaluate) {
        const msg = await page.evaluate(a.evaluate).catch(e => 'threw: ' + (e && e.message ? e.message : String(e)));
        if (msg) add(`ASSERTION ${a.name} FAILED — ${msg} — ${a.why}`);
        continue;
      }
      const present = await page.$(a.selector).then(x => !!x).catch(() => false);
      if (!present) add(`ASSERTION ${a.name} FAILED — expected ${a.selector} — ${a.why}`);
    }

    rows.push({ cls, route, status, con: consoleErrors.length, pe: pageErrors.length, bad: badRequests.length });
    await page.close();
  }

  // ------------------------------------------------- /solve?q= cross-document parity
  // The ?q= ranking exists TWICE: rankProblems() in site/app.js for the SPA, and searchSolve() in
  // server.js for the ~90% who never run JavaScript. Both read the same parse.js-authored index, so
  // the only way they can diverge is a weight edited in one file and not the other. That divergence
  // is silent — each document looks fine on its own. This is the only check that sees both.
  // The server expresses its ranking as injected `#q-hits .solve-card[data-pid=…]{order:N}` rules;
  // the SPA expresses it as the DOM order of #q-hits cards. They must be the same list.
  // Prove this gate by changing a single weight in server.js searchSolve() (e.g. 18 -> 4).
  for (const q of ['knee pain', 'belly fat', 'low testosterone', 'insomnia', 'zzzznonsense']) {
    const u = '/solve?q=' + encodeURIComponent(q);
    let pre, hyd;
    try {
      const html = await (await fetch(BASE + u)).text();
      pre = /id="q-none" data-on/.test(html) ? ['(none)']
        : [...html.matchAll(/#q-hits \.solve-card\[data-pid="([a-z0-9-]+)"\]\{order:(\d+)\}/g)]
          .map(m => ({ id: m[1], o: +m[2] })).sort((a, b) => a.o - b.o).map(x => x.id);
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844 });
      await page.goto(BASE + u, { waitUntil: 'networkidle2', timeout: 45000 });
      await new Promise(r => setTimeout(r, 700));
      hyd = await page.evaluate(() => document.querySelector('#q-hits.q-empty') ? ['(none)']
        : [...document.querySelectorAll('#q-hits .solve-card')].map(c => c.dataset.pid));
      await page.close();
    } catch (e) {
      fail.push(`solve-q-parity ${JSON.stringify(q)}: harness error — ${e && e.message ? e.message : String(e)}`);
      continue;
    }
    if (JSON.stringify(pre) !== JSON.stringify(hyd)) {
      fail.push(`ASSERTION solveQParity FAILED — q=${JSON.stringify(q)}: prerendered ranks [${pre.join(', ')}] but hydrated ranks [${hyd.join(', ')}] — server.js searchSolve() and site/app.js rankProblems() have drifted`);
    }
  }

  // ------------------------------------------------- /solve?q= ranking: the regression battery
  // W2.5(d). The parity check above only asserts the two runtimes AGREE — they agreed perfectly
  // while both were wrong. This asserts they are RIGHT, against the phrasings a reader actually
  // types. Measured before the fix: 9 of these 20 ranked the wrong problem #1, and not narrowly —
  // "hair falling out" returned insomnia (its name owns "falling"), "lose weight" returned pcos as
  // its only hit, "balding" returned nothing at all. Plus the invariant the ranking has always
  // claimed: every problem is #1 for its own display name.
  // Both read the server's ranking, which is the ~90% document; app.js is pinned to it by the
  // parity check. PROVED by reintroduction: cutting data/solve_aliases.json's "hair-loss" list
  // down to ["hair"] and rebuilding makes this print
  //   ASSERTION solveBattery FAILED — q="balding" ranks (none) first, expected hair-loss
  // Measured while proving it: deleting "the" from graph.solveStopwords does NOT fail this gate
  // any more, because the alias phrase now outscores the spurious name-word hit. The stopword and
  // word-prefix changes are still right (see build/parse.js) — they are just no longer the thing
  // holding these 20 up. The alias layer is: without it the battery scores 11/20.
  {
    const topOf = async (q) => {
      const html = await (await fetch(BASE + '/solve?q=' + encodeURIComponent(q))).text();
      if (/id="q-none" data-on/.test(html)) return '(none)';
      const hits = [...html.matchAll(/#q-hits \.solve-card\[data-pid="([a-z0-9-]+)"\]\{order:(\d+)\}/g)]
        .map(m => ({ id: m[1], o: +m[2] })).sort((a, b) => a.o - b.o);
      return hits.length ? hits[0].id : '(none)';
    };
    const BATTERY = [
      ['hair falling out', 'hair-loss'], ['lose weight', 'fat-loss-plateau'], ['tired all the time', 'chronic-fatigue'],
      ['knee hurts', 'knee-pain'], ['high blood pressure', 'blood-pressure'], ['cant sleep', 'insomnia'],
      ['balding', 'hair-loss'], ['belly fat', 'visceral-fat'], ['brain fog', 'brain-fog'], ['cant focus', 'adhd-focus'],
      ['always exhausted', 'chronic-fatigue'], ['wake up at 3am', 'sleep-maintenance'], ['build muscle', 'hypertrophy'],
      ['live longer', 'longevity'], ['bloating', 'gut-health'], ['plantar fasciitis', 'ankle-foot'],
      ['tennis elbow', 'elbow-wrist'], ['low testosterone', 'low-testosterone'], ['keep getting sick', 'immunity'],
      ['cant lose weight', 'fat-loss-plateau'],
    ];
    try {
      for (const [q, want] of BATTERY) {
        const top = await topOf(q);
        if (top !== want) fail.push(`ASSERTION solveBattery FAILED — q=${JSON.stringify(q)} ranks ${top} first, expected ${want} — /solve does not answer the words a reader types`);
      }
      // …and nothing at all for a query with no answer, so the ranking cannot pass by matching
      // everything.
      const none = await topOf('zzzznonsense');
      if (none !== '(none)') fail.push(`ASSERTION solveBattery FAILED — a nonsense query ranked ${none} first`);
      // the invariant: every problem is #1 for its own name
      const dj = await (await fetch(BASE + '/data.js')).text();
      const G = JSON.parse(dj.match(/^window\.RNAWIKI_DATA = ([\s\S]*);\s*$/)[1]).graph;
      for (const p of G.problems) {
        const top = await topOf(p.name);
        if (top !== p.id) fail.push(`ASSERTION solveBattery FAILED — the problem "${p.name}" is not the top hit for its own name (got ${top})`);
      }
    } catch (e) { fail.push('solveBattery: harness error — ' + (e && e.message ? e.message : String(e))); }
  }

  // ------------------------------------------------- Back button on a KEEP_PRERENDERED route
  // W2.5(a): /problem is in KEEP_PRERENDERED, so route() returns the KEEP sentinel and never
  // writes #app. Before the fix, Back from a protocol restored the URL and left the PROTOCOL on
  // screen on 41 of 41 /problem routes (URL returned 41/41, DOM returned 0/41): /problem/knee-pain
  // showed h1 "Knee Pain" / 3,363 words / 0 cause anchors instead of the 8,490-word differential.
  // The per-route runner above cannot express this -- it is a relation between two navigations.
  // Prove this gate by deleting the `html === KEEP && ... && !KEEP_LIVE` branch from route().
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(BASE + '/problem/knee-pain', { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT });
    await new Promise(r => setTimeout(r, SETTLE_MS));
    const before = await page.evaluate(() => ({
      h1: document.querySelector('#app h1').textContent.trim(),
      causes: document.querySelectorAll('#app [id^="cause-"]').length,
    }));
    const went = await page.evaluate(() => {
      const a = [...document.querySelectorAll('#app a')].find(x =>
        (x.getAttribute('href') || '').indexOf('/protocol/') === 0 && !x.hasAttribute('data-native'));
      if (!a) return false; a.click(); return true;
    });
    if (!went) fail.push('ASSERTION backButtonRestoresKeptDocument FAILED — /problem/knee-pain has no in-app protocol link to navigate away with');
    else {
      await new Promise(r => setTimeout(r, SETTLE_MS));
      await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => { });
      await new Promise(r => setTimeout(r, SETTLE_MS));
      const after = await page.evaluate(() => ({
        path: location.pathname,
        h1: document.querySelector('#app h1').textContent.trim(),
        causes: document.querySelectorAll('#app [id^="cause-"]').length,
      }));
      if (after.path !== '/problem/knee-pain' || after.h1 !== before.h1 || after.causes !== before.causes)
        fail.push(`ASSERTION backButtonRestoresKeptDocument FAILED — Back landed on ${after.path} showing h1 ${JSON.stringify(after.h1)} with ${after.causes} cause anchors; expected /problem/knee-pain, ${JSON.stringify(before.h1)}, ${before.causes} — the address bar and the document disagree`);
    }
    await page.close();
  } catch (e) { fail.push('backButtonRestoresKeptDocument: harness error — ' + (e && e.message ? e.message : String(e))); }

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
