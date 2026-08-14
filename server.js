// RNAwiki server: serves the static site AND a small JSON API for accounts,
// community edits, and comments (Postgres via db.js). Zero web framework.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('node:zlib');
const db = require('./db');
const { clientIp } = require('./request-ip');

const DIR = path.join(__dirname, 'site');
// Does the built landing page still carry the interest form's seven answer panels? Read once, at
// boot, off the page that was actually built — never assumed in either direction. The panels were
// removed on 2026-08-09 with the form, so the `/?state=` handler far below is dark; if they are ever
// restored it starts working again with no edit. See the note at that handler.
let _hasPanels = null;
function HAS_ANSWER_PANELS() {
  if (_hasPanels === null) {
    try { _hasPanels = fs.readFileSync(path.join(DIR, 'home.html'), 'utf8').indexOf('class="i-state i-s-ok"') >= 0; }
    catch (e) { _hasPanels = false; }
  }
  return _hasPanels;
}
// Cache-busting: a short hash of the built assets, recomputed on each boot (i.e. each deploy).
// Injected as ?v=<hash> into every HTML response so browsers always fetch the current build —
// no hard-refresh needed — while HTML/JS/CSS are served no-cache so the CDN can't pin them.
const ASSET_VER = (() => {
  try {
    const h = crypto.createHash('sha1');
    // W5b: head.js is in the hash because it is the route -> <title>/description map every page
    // now loads. A build that changes a title and not this hash would serve the new HTML with the
    // previous head map still cached, and the tab would go back to saying the old thing.
    // W7: ixn-engine.js is in the hash for the same reason head.js is — it is THE interaction
    // matcher, loaded by every page, and a stale cached copy would give a reader a different
    // safety verdict from the one this deploy's data.js and interactions.js were gated against.
    for (const f of ['app.js', 'styles.css', 'data.js', 'facts.js', 'interactions.js', 'ixn-engine.js', 'head.js', 'foods.js', 'exercises.js', 'businesses.js']) { try { h.update(fs.readFileSync(path.join(DIR, f))); } catch (e) {} }
    return h.digest('hex').slice(0, 10);
  } catch (e) { return String(Date.now()); }
})();
function versionAssets(html) {
  // expose the version so app.js can cache-bust the lazy-loaded datasets (foods/exercises/businesses.js)
  html = String(html).replace('</head>', `<script>window.__V="${ASSET_VER}"</script></head>`);
  // W5b: head.js joins the list. It is regenerated on every build and holds the <title> and
  // description of all 620 routes, so a stale cached copy would put the previous deploy's titles
  // back in the tab on every route the SPA renders.
  return html.replace(/((?:src|href)=")(\/?(?:app\.js|styles\.css|data\.js|facts\.js|interactions\.js|ixn-engine\.js|head\.js))(?:\?v=[^"]*)?(")/g, (m, a, b, c) => a + b + '?v=' + ASSET_VER + c);
}
// ---- A QUERY STRING IS NOT A PAGE (2026-08-06) -------------------------------------------------
// MEASURED with curl against this server on all 8 parameterised URL shapes the codebase can
// produce — /solve?q= /az?q= /stack?ids= /plan?cohort= /body/leg?fma= /c/<slug>?utm_source=
// /protocol/<p>/<c>?by= and the bare clean twins: every one answered HTTP 200 carrying
// `<meta name="robots" content="index,follow,max-image-preview:large,…">`, and none carried an
// X-Robots-Tag. /solve?q=knee%20pain is 57,258 B against /solve's 55,298 B — a materially DIFFERENT
// document, offered to Google as indexable under the SAME <title> and the SAME description. `q` is
// free text typed by the reader (the home hero is a real <form action="/solve" method="get">), so
// that is an unbounded family of near-identical result pages on a young domain, and each of those
// URLs is a stranger's symptom description.
//
// The self-canonical is already correct on 8 of 8 (they all point at the clean path) — but
// rel=canonical is a HINT. This is a directive, and unlike a robots.txt Disallow it also removes
// anything already indexed. DELIBERATELY NOT robots.txt: a disallowed URL is never FETCHED, so a
// noindex on it is never READ, and Google can still index a disallowed URL title-only from a link.
//
// Measured safe against the sitemap: 0 of the 568 <loc> entries contains a "?", so no URL this
// site asks to be indexed can be hit by this rule.
//
// A HEADER, not a <meta>, for two reasons: endHtml() is the single exit for text/html so one line
// covers every one of the ~40 call sites including the ones that do body surgery, and it needs no
// template to cooperate. HTML ONLY — /styles.css, /app.js, /data.js, /head.js are served by
// sendAsset() and are untouched, so Googlebot can still fetch every render resource.
function endHtml(res, html, code) {
  const _qs = String((res.req && res.req.url) || '').indexOf('?');
  if (_qs >= 0) res.setHeader('X-Robots-Tag', 'noindex, follow');
  // res.req is the request this response belongs to (node >= 12.17) — used so the ~40 endHtml call
  // sites do not all have to be rewritten to thread `req` through just to read Accept-Encoding
  // and If-None-Match.
  sendBody(res.req, res, Buffer.from(versionAssets(html), 'utf8'), {
    type: 'text/html; charset=utf-8', ext: '.html', cacheControl: 'no-cache', code: code || 200,
  });
}
const PORT = process.env.PORT || 3000;
const CONFIGURED_SECRET = String(process.env.SESSION_SECRET || '');
// Read-only/local mode gets an ephemeral key. Account-enabled deployments must provide their own
// long random secret and are refused at boot below if they do not.
const SECRET = CONFIGURED_SECRET || crypto.randomBytes(32).toString('hex');
// Containment flags are fail-closed. Features that publish health-adjacent activity or make
// aggregate efficacy claims are not available merely because their old tables still exist.
const FEATURES = Object.freeze({
  researchCollection: process.env.RESEARCH_COLLECTION === '1',
  publicCommunity: process.env.PUBLIC_COMMUNITY === '1',
  publicProfiles: process.env.PUBLIC_PROFILES === '1',
  publicOutcomeAggregates: process.env.PUBLIC_OUTCOME_AGGREGATES === '1',
  sharedPlans: process.env.SHARED_PLANS === '1',
});

// ---- REFUSE TO SERVE A HOME PAGE THAT CONTRADICTS THE RUNNING CONFIGURATION (2026-08-13) --------
// The landing page prints the state of the contribution loop as three NOW / NOT YET rows, and those
// rows are baked at BUILD time from the emitted documents (see CAPS in build/prerender.js). Feature
// flags are read HERE, at BOOT. Those are two different clocks: setting PUBLIC_COMMUNITY=1 on
// Railway without a rebuild would leave every reader on the front door being told there are no
// comments and no votes while the API happily serves both.
//
// ONE-DIRECTIONAL, deliberately. Understating what the site can do is the safe failure — a reader
// is never harmed by being told a feature is missing when it works. Overstating is the one this
// project has been bitten by, so only that direction refuses to boot.
// THE NEEDLE COMES FROM THE FILE THAT WRITES IT (2026-08-14). This used to hold a hand-copied
// 32-character fragment — 'No comments, no votes, no points' — of a sentence authored in
// build/landing.js. Two independent copies of one string at two different lengths, with nothing
// asserting they agree: any reword that happened to preserve the first 32 characters would have
// left the guard passing over a page it no longer describes. Now it imports the sentence.
// Both contained rows are checked, not just the community one. Only the first had a guard, so a
// deployment could have served "Nothing here lists what other people have built" while
// /api/protocols/new was live.
if (FEATURES.publicCommunity) {
  try {
    const homeDoc = fs.readFileSync(path.join(__dirname, 'site', 'home.html'), 'utf8');
    const LANDING_COPY = require('./build/landing.js');
    [[LANDING_COPY.STATE_NEGATIVE_COMMUNITY, 'there are no comments, no votes and no points'],
      [LANDING_COPY.STATE_NEGATIVE_DISCOVER, 'nothing here lists what other people have built']]
      .forEach(([sentence, what]) => {
        if (!sentence) {
          console.error('[server] build/landing.js no longer exports the state-row sentences this guard '
            + 'compares against. A guard that cannot find its subject passes vacuously — retarget it.');
          process.exit(1);
        }
        if (homeDoc.indexOf(sentence) >= 0) {
          console.error(`[server] PUBLIC_COMMUNITY=1 but site/home.html still tells every reader ${what}. `
            + 'The landing page states the loop from the built documents, not from this flag. '
            + 'Rebuild (npm run prestart) with the flag set before serving.');
          process.exit(1);
        }
      });
  } catch (e) {
    console.error('[server] PUBLIC_COMMUNITY=1 and the landing copy could not be read to check that the '
      + 'landing page agrees with it —', e.code || e.message);
    process.exit(1);
  }
}
// Anything missing from this map is served as application/octet-stream — "unknown binary file".
// That is what silently broke search indexing: sitemap.xml and robots.txt are the two files a
// crawler MUST be able to identify, and neither had an entry. Google Search Console answered
// "Invalid sitemap address" for a sitemap that was present, valid and listing 564 URLs, because
// the label on the envelope said binary. robots.txt was mislabelled the same way, for a month.
// assertServedFileTypes() in build/prerender.js is what stops this returning: the defect is
// invisible from the page, so nothing short of a build check will catch it.
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png',
  '.xml': 'application/xml; charset=utf-8',      // sitemap.xml — Google rejects octet-stream
  '.txt': 'text/plain; charset=utf-8',           // robots.txt — same class of defect
  '.webmanifest': 'application/manifest+json',
  '.glb': 'model/gltf-binary',                   // /anatomy/leg.glb
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.woff2': 'font/woff2', '.woff': 'font/woff',
};

// ---------- transfer: compression + cache validators (W1, 2026-08-01) ----------
// WHAT WAS BROKEN, measured on this server before the change:
//   GET /data.js with `Accept-Encoding: br, gzip, deflate` -> 200, 11,662,047 bytes, and the
//   response carried no Content-Encoding, no ETag and no Last-Modified. Its only cache header was
//   `Cache-Control: no-cache`, which means "you may cache this but revalidate before reuse" — and
//   there was nothing to revalidate WITH, so every revalidation was a full re-download. Proven:
//   `If-Modified-Since: Sat, 01 Jan 2040` and `If-None-Match: "abc"` both returned 200 with the
//   whole body. The ?v=<hash> cache-buster injected by versionAssets() was therefore doing no work
//   at all: it changed the URL on every deploy, but the URL it changed away from could never have
//   produced a 304 anyway.
//
// WHAT PRODUCTION ACTUALLY DOES (W0 left this as an open question; measured 2026-08-01):
//   Cloudflare fronts rnawiki.com and DOES brotli-compress on the fly — `Accept-Encoding: br` gets
//   `content-encoding: br` and 3,268,924 wire bytes. So the origin's missing compression was
//   half-hidden. It is still worth fixing twice over: the build-time q11 sibling is 2,391,843 B
//   (877,081 B better than the edge's on-the-fly pass, on every uncached load), and every response
//   came back `cf-cache-status: EXPIRED` because a response with no validator cannot be
//   revalidated — so the edge re-pulled all 11.66 MB uncompressed from Railway each time.
//
// THE SHAPE OF THE FIX: validators are computed here for every static and HTML response, the
// conditional-GET headers are honoured, and the encoded copy is either read off disk (built by
// build/precompress.js) or produced on the fly for small bodies only. Nothing is compressed
// synchronously above OTF_MAX — brotli q11 on data.js takes 15.9 s, which is a build step, not a
// request handler.
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.svg', '.xml', '.txt']);
const OTF_MAX = 262144;          // on-the-fly ceiling (bytes). Bigger than this must be precompressed.
const OTF_MIN = 512;             // below this, framing overhead eats the saving
const OTF_CACHE = new Map();     // etag|encoding -> Buffer
const OTF_MAX_ENTRIES = 400;     // ~2 MB at the observed 5 KB/page compressed size

// Accept-Encoding, honouring `q=0` — which is a REFUSAL, not a low preference. A naive
// indexOf('gzip') would ship a gzip body to a client that explicitly said `gzip;q=0`.
function pickEncoding(req) {
  const raw = req && req.headers && req.headers['accept-encoding'];
  if (!raw) return null;
  let br = false, gz = false;
  for (const part of String(raw).split(',')) {
    const bits = part.trim().split(';');
    const name = bits[0].trim().toLowerCase();
    const qp = bits.slice(1).map((s) => s.trim()).find((s) => s.slice(0, 2) === 'q=');
    const q = qp ? parseFloat(qp.slice(2)) : 1;
    if (!(q > 0)) continue;
    if (name === 'br') br = true;
    else if (name === 'gzip') gz = true;
    else if (name === '*') { br = true; gz = true; }
  }
  return br ? 'br' : gz ? 'gzip' : null;
}

function etagOf(buf) {
  return '"' + buf.length.toString(16) + '-' + crypto.createHash('sha1').update(buf).digest('base64url').slice(0, 20) + '"';
}

// If-None-Match takes precedence over If-Modified-Since (RFC 9110 §13.1.3 / §15.4.5). Weak
// comparison on both sides: a 304 promises the same REPRESENTATION, and the identity copy and its
// .br sibling are the same representation, so the W/ prefix is irrelevant here.
function isFresh(req, etag, lastMod) {
  if (!req || (req.method !== 'GET' && req.method !== 'HEAD')) return false;
  const inm = req.headers['if-none-match'];
  if (inm) {
    const want = etag.replace(/^W\//, '');
    return String(inm).split(',').some((t) => { const x = t.trim(); return x === '*' || x.replace(/^W\//, '') === want; });
  }
  const ims = req.headers['if-modified-since'];
  if (ims && lastMod) {
    const then = Date.parse(ims), mine = Date.parse(lastMod);
    return Number.isFinite(then) && Number.isFinite(mine) && mine <= then;
  }
  return false;
}

// Compress a small body, memoised by ETag so a hot page is compressed once per boot rather than
// once per reader. Quality is deliberately low (br 5 / gzip 6): this runs on the request path.
function compressSmall(buf, want, etag) {
  const key = etag + '|' + want;
  const hit = OTF_CACHE.get(key);
  if (hit) return hit;
  let out;
  try {
    out = want === 'br'
      ? zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length } })
      : zlib.gzipSync(buf, { level: 6 });
  } catch (e) { return null; }
  if (out.length >= buf.length) return null;      // never ship a "compressed" copy that is bigger
  if (OTF_CACHE.size >= OTF_MAX_ENTRIES) OTF_CACHE.clear();
  OTF_CACHE.set(key, out);
  return out;
}

// The single exit for in-memory bodies (all HTML). Validators first, then encoding.
function sendBody(req, res, buf, opts) {
  const o = opts || {};
  const code = o.code || 200;
  res.setHeader('Vary', 'Accept-Encoding');
  if (o.cacheControl) res.setHeader('Cache-Control', o.cacheControl);
  // Validators only on 200. A 304 is a promise that the origin would otherwise have answered 200,
  // so tagging the 404/410 pages from serveMissing() would invite a client to keep reusing a cached
  // error page as if it were the resource.
  let etag = null;
  if (code === 200) {
    etag = o.etag || etagOf(buf);
    res.setHeader('ETag', etag);
    if (o.lastModified) res.setHeader('Last-Modified', o.lastModified);
    if (isFresh(req, etag, o.lastModified)) { res.writeHead(304); return res.end(); }
  }
  let out = buf, enc = null;
  if (COMPRESSIBLE.has(o.ext) && buf.length >= OTF_MIN && buf.length <= OTF_MAX) {
    const want = pickEncoding(req);
    // The memo key must ALWAYS be content-derived. On the non-200 path `etag` is null, and a null
    // key would make every error page share one cache slot and serve each other's bodies.
    const z = want ? compressSmall(buf, want, etag || etagOf(buf)) : null;
    if (z) { out = z; enc = want; }
  }
  if (enc) res.setHeader('Content-Encoding', enc);
  res.writeHead(code, { 'Content-Type': o.type || 'application/octet-stream', 'Content-Length': out.length });
  res.end(out);
}

// The single exit for files on disk. The validator is derived from the SOURCE file (size + mtime),
// NOT from the bytes actually sent — that is what makes one ETag correct across the identity copy
// and both precompressed siblings, so a client that switches encoding still gets a clean 304.
function sendAsset(req, res, file, st, ext, code) {
  const status = code || 200;
  const etag = '"' + st.size.toString(16) + '-' + Math.floor(st.mtimeMs).toString(16) + '"';
  // Truncated to whole seconds before formatting, so Last-Modified and the If-Modified-Since it
  // will come back as are the same instant. Without the truncation an unmodified file looks
  // fractionally newer than the date we ourselves sent and never 304s.
  const lastMod = new Date(Math.floor(st.mtimeMs / 1000) * 1000).toUTCString();
  res.setHeader('Vary', 'Accept-Encoding');
  res.setHeader('ETag', etag);
  res.setHeader('Last-Modified', lastMod);
  // Cache-Control is UNCHANGED from before this commit on purpose: no-cache for js/css/json (so the
  // CDN cannot pin a build), nothing for images. `no-cache` only ever meant "revalidate"; the point
  // of this change is that there is now something to revalidate against, so the revalidation costs
  // ~200 bytes instead of 11.66 MB.
  if (ext === '.js' || ext === '.css' || ext === '.json') res.setHeader('Cache-Control', 'no-cache');
  if (status === 200 && isFresh(req, etag, lastMod)) { res.writeHead(304); return res.end(); }
  const finish = (buf, enc) => {
    if (enc) res.setHeader('Content-Encoding', enc);
    res.writeHead(status, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Content-Length': buf.length });
    res.end(buf);
  };
  const want = COMPRESSIBLE.has(ext) ? pickEncoding(req) : null;
  const identity = () => fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    if (want && data.length >= OTF_MIN && data.length <= OTF_MAX) {
      const z = compressSmall(data, want, etag);
      if (z) return finish(z, want);
    }
    finish(data, null);
  });
  if (!want) return identity();
  const sib = file + (want === 'br' ? '.br' : '.gz');
  fs.stat(sib, (e2, s2) => {
    // A sibling older than its source is a build that did not rerun. Serving it would ship the
    // previous deploy's data.js to every reader while the identity copy on disk was correct —
    // a silent, invisible content regression. Fall back to identity instead.
    // Compared in whole SECONDS, matching build/precompress.js: fs.utimesSync writes whole-ms
    // mtimes while APFS reports sub-ms ones on the source, so a strict ms comparison would call a
    // perfectly current sibling stale and quietly serve 11.66 MB of identity to every reader.
    if (e2 || !s2.isFile() || Math.floor(s2.mtimeMs / 1000) < Math.floor(st.mtimeMs / 1000)) return identity();
    fs.readFile(sib, (e3, d3) => (e3 ? identity() : finish(d3, want)));
  });
}
const EDITABLE = ['mechanism', 'target', 'plain', 'protocol', 'watch', 'bottom'];
// DOMAIN_LAYER REMOVED 2026-08-08 — ONE ACCOUNT TYPE. It mapped an account's expert domain to the
// one protocol layer that account was allowed to edit ({physio:'move', dietitian:'fuel',
// pharmacist:'stack'}), and its last reader was the "apply for an expert role" endpoint that went
// with it. A lookup table of professions is how a second account type grows back.
// DOMAIN_LABEL REMOVED 2026-08-08 — ONE ACCOUNT TYPE. It turned an account's `domain` into a
// public-facing job title ("Movement contributor", "Pharmacology contributor") and its last reader
// was serveProfileShell, deleted below with the rest of the crawlable professional portfolio.
const SITE_URL = (process.env.SITE_URL || 'https://rnawiki.com').replace(/\/$/, '');
// AI food-photo scanner (opt-in: does nothing until ANTHROPIC_API_KEY is set).
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';   // enables Gmail sign-in when set
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const SCAN_CAP = Number(process.env.SCAN_CAP || 25);          // scans/user/day — cost control
const SCAN_MODEL = process.env.SCAN_MODEL || 'claude-haiku-4-5-20251001'; // cheapest vision tier

async function scanFood(imageB64, mediaType) {
  const prompt = `You are a nutrition estimator. Identify the single food or dish in this photo (include Singapore hawker dishes and packaged foods). Estimate ONE typical serving. Respond with ONLY a JSON object — no prose, no markdown fences:
{"name": string, "serving": string, "kcal": number, "protein_g": number, "carbs_g": number, "sugar_g": number, "fat_g": number, "fiber_g": number, "sodium_mg": number, "confidence": "low"|"medium"|"high"}
If there is no identifiable food, return {"name": null}. Values are plain numbers with no units.`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: SCAN_MODEL, max_tokens: 400,
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageB64 } },
        { type: 'text', text: prompt },
      ] }],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error('anthropic ' + r.status);
  const j = await r.json();
  let text = ((j.content && j.content[0] && j.content[0].text) || '').trim().replace(/```json|```/g, '');
  const mm = text.match(/\{[\s\S]*\}/); if (!mm) throw new Error('no json in response');
  const d = JSON.parse(mm[0]);
  if (!d.name) return { name: null };
  const num = (x) => (x === 0 || x) && isFinite(x) ? Number(x) : null;
  return {
    name: String(d.name).slice(0, 80), serving: String(d.serving || 'estimated serving').slice(0, 60),
    scanned: true, sg_local: false, tags: [],
    kcal: num(d.kcal), protein_g: num(d.protein_g), carbs_g: num(d.carbs_g), sugar_g: num(d.sugar_g),
    fat_g: num(d.fat_g), fiber_g: num(d.fiber_g), sodium_mg: num(d.sodium_mg),
    _note: d.confidence ? `${d.confidence} confidence` : null,
  };
}

// ---------- helpers ----------
function hashPassword(pw, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const h = crypto.scryptSync(pw, salt, 64).toString('hex');
  return salt + ':' + h;
}
function verifyPassword(pw, stored) {
  const [salt, h] = String(stored).split(':');
  if (!salt || !h) return false;
  const cand = crypto.scryptSync(pw, salt, 64);
  const known = Buffer.from(h, 'hex');
  return cand.length === known.length && crypto.timingSafeEqual(cand, known);
}
function parseCookies(req) {
  const out = {}; const c = req.headers.cookie; if (!c) return out;
  c.split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return out;
}
// The default cap is deliberately small. Most POST handlers take the default and every one of them
// validates down to a few hundred bytes of allow-listed fields (longest: proposals.change 4000,
// feedback.body 2000, comments.body 2000) — but the old 1e5 default let each buffer 100 KB, so the
// write guard's own 15-request burst allowed 1.5 MB of in-memory string per IP per burst on
// endpoints that then throw 99% of it away. Handlers that genuinely need more pass an explicit cap
// (edits 5e4, foods 8e4, plan 2e5, scan 4e5, clinician-interest 1.6e6, share-plan 2e4).
// OVER-CAP BEHAVIOUR, corrected 2026-08-01 after measuring it. The old code called req.destroy()
// the moment the cap was passed. That kills the connection, so the caller never receives the
// handler's `400 Bad request` — in Chrome the fetch() rejects with an opaque "TypeError: Failed to
// fetch", measured. With the default coming down from 1e5 to 1.6e4 that path gets hit far more
// often, so it now has to behave. Two thresholds instead of one:
//   over `cap`      -> stop accumulating and DROP what we have (this is the memory control, and it
//                      is the whole point), but keep draining so 'end' fires and the handler can
//                      answer a real 400 that a human can read;
//   over `HARD_CAP` -> a genuine flood, not a fat form. Kill the socket.
const BODY_HARD_CAP = 8e6;
function readBody(req, maxBytes) {
  const cap = maxBytes || 1.6e4;
  return new Promise((resolve) => {
    let data = ''; let seen = 0; let tooBig = false;
    // Check BEFORE appending. The old order appended first, so one socket chunk could carry the
    // buffer up to ~64 KB past the cap before the check fired.
    req.on('data', c => {
      seen += c.length;
      if (seen > BODY_HARD_CAP) { tooBig = true; data = ''; return req.destroy(); }
      if (tooBig) return;
      if (data.length + c.length > cap) { tooBig = true; data = ''; return; }   // drain, do not destroy
      data += c;
    });
    req.on('end', () => { if (tooBig) return resolve(null); try { resolve(data ? (/x-www-form-urlencoded/i.test(req.headers['content-type']||'') ? ((q)=>Object.fromEntries(new URLSearchParams(q))) : JSON.parse)(data) : {}); } catch (e) { resolve(null); } });
    req.on('error', () => resolve(null));
    req.on('aborted', () => resolve(null));
  });
}
function json(res, code, obj, headers) {
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json' }, headers || {}));
  res.end(JSON.stringify(obj));
}
function clean(s, max) { return String(s == null ? '' : s).trim().slice(0, max || 4000); }
// Strict positive-integer path segment. parseInt() is wrong for route ids in two directions:
// parseInt('abc') is NaN, which Postgres rejects with a 500, and parseInt('20x') is 20, which
// silently serves record 20 from a URL that was never a valid id. Returns 0 on anything that
// is not purely digits, so the existing `if (!id) return 400` guards do the right thing.
function pathId(s) { return /^\d{1,9}$/.test(String(s == null ? '' : s)) ? parseInt(s, 10) : 0; }
// CSV export helpers for the super-admin control room (member + waitlist extraction).
function csvCell(v) { const s = v == null ? '' : String(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function csvExport(res, filename, headers, rows) {
  const lines = [headers.map(csvCell).join(',')];
  for (const r of rows) lines.push(r.map(csvCell).join(','));
  const body = '﻿' + lines.join('\r\n'); // UTF-8 BOM so Excel opens it cleanly
  res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` });
  res.end(body);
}

// ---------- reputation ----------
// Points per action. Idempotent via rep_events UNIQUE(user,kind,ref): the same action can never
// award twice (re-voting, re-sharing the same day, re-merging the same proposal, etc.).
// ---- POINTS ARE PAID FOR WHAT SOMEBODY ELSE ACCEPTED, NOT FOR WHAT YOU DID (2026-08-13) -------
// The old table paid on ACTION: vote 2, comment 3, edit 10, food_log 5, share 10. Every one of
// those is a thing you can do to yourself, alone, as many times as you like. Once points buy avatar
// items, that table stops being a reward and becomes a PRICE LIST for flooding the community — and
// the cheapest strategy is to upvote everything, comment on everything and share everything.
//
// On a health site the signal that gets destroyed by that is the only one worth having: which
// protocol actually helped somebody. So the rule is now that a point is minted only when a SECOND
// PERSON has accepted or been helped by what you did:
//   merged      an edit you suggested was accepted into the corpus
//   helpful     someone else marked your comment or flag as useful
//   liked       someone else found a protocol you published useful
//   proposal    a change you proposed was taken up
// Nothing pays for volume. vote, comment, share and food_log are deliberately ZERO — you may still
// do all four, they simply do not mint currency. food_log paid people to enter health data about
// themselves, which was the worst of the seven.
// assertGamificationConfinement() checks the shape of this table; do not add an action-priced row.
const REWARDS = { merged: 200, proposal: 50, helpful: 10, liked: 5 };
const REWARDS_UNPAID = ['vote', 'comment', 'share', 'food_log', 'edit'];

// ---- THE AVATAR CATALOGUE ---------------------------------------------------------------------
// Eight items, two slots, no merchandise. Deliberately NOT the jacket-and-trainers shop from the
// concept video: items that look like physical goods imply a shop that ships them, and
// docs/PRODUCTION_REVAMP_STATE.md rules out a marketplace and a redeemable currency for reasons
// that have not changed. A ring colour and a small shape are identity without commerce — they
// cannot be bought with money, cannot be sold, cannot be transferred, and buy nothing but themselves.
// The costs are set so the cheapest item needs one accepted contribution, not one afternoon of clicking.
const AVATAR_ITEMS = [
  { id: 'ring-slate',  slot: 'ring', cost: 0,   label: 'Slate ring' },
  { id: 'ring-teal',   slot: 'ring', cost: 10,  label: 'Teal ring' },
  { id: 'ring-amber',  slot: 'ring', cost: 50,  label: 'Amber ring' },
  { id: 'ring-violet', slot: 'ring', cost: 200, label: 'Violet ring' },
  { id: 'mark-none',   slot: 'mark', cost: 0,   label: 'No mark' },
  { id: 'mark-dot',    slot: 'mark', cost: 10,  label: 'Dot' },
  { id: 'mark-bar',    slot: 'mark', cost: 50,  label: 'Bar' },
  { id: 'mark-helix',  slot: 'mark', cost: 200, label: 'Helix' },
];
function avatarState(u) {
  const av = (u && u.avatar) || {};
  const owned = Array.isArray(u && u.avatar_owned) ? u.avatar_owned : [];
  const free = AVATAR_ITEMS.filter((x) => x.cost === 0).map((x) => x.id);
  const all = free.concat(owned.filter((x) => free.indexOf(x) < 0));
  const earned = (u && u.reputation_points) || 0;
  const spent = (u && u.avatar_spent) || 0;
  return {
    avatar: { ring: av.ring || 'ring-slate', mark: av.mark || 'mark-none' },
    owned: all, earned, spent, balance: Math.max(0, earned - spent),
    items: AVATAR_ITEMS,
  };
}
async function award(userId, kind, ref, pts) {
  // The ledger is part of the contained community/reward product, not a side effect that should
  // keep accumulating while its UI and anti-abuse contract are switched off.
  if (!FEATURES.publicCommunity || !userId || !db.enabled) return;
  // An UNPAID kind is a deliberate no-op, not a missing price. Call sites for vote/comment/edit
  // still exist and still fire; they simply mint nothing, because paying for an action somebody
  // can repeat alone is what turns a reward into a farm. If you are here because points "stopped
  // working" for one of these, that is the fix working — do not add a row to REWARDS.
  if (REWARDS_UNPAID.indexOf(kind) >= 0) return;
  const points = pts != null ? pts : (REWARDS[kind] || 0);
  if (!points) return;
  try {
    const r = await db.query(
      `INSERT INTO rep_events(user_id,kind,ref,points) VALUES($1,$2,$3,$4)
       ON CONFLICT (user_id,kind,ref) DO NOTHING RETURNING id`, [userId, kind, String(ref), points]);
    if (r.rows[0]) await db.query('UPDATE users SET reputation_points = reputation_points + $1 WHERE id=$2', [points, userId]);
  } catch (e) { console.error('[award]', e.message); }
}
// addBadge() REMOVED 2026-08-08. Its only two callers granted 'verified-expert', and a general
// badge-granting helper sitting in the file is an invitation to grant the next one. If RNAwiki
// ever awards a badge again it must be for something the site can itself observe and prove —
// "logged 30 days", not "is a pharmacist" — and that will need its own function, written then.
// users.badges is left in db.js and still read by /api/u/:handle; it is [] on every row.
function safeUrl(s, max) {
  const v = clean(s, max || 200);
  if (!v) return '';
  return /^https?:\/\/[^\s]+$/i.test(v) ? v : '';
}

// ---------- outcome loop helpers ----------
function todayUTC() { return new Date().toISOString().slice(0, 10); }
// A streak stays alive through today until a full day is missed: if today isn't checked yet, count
// back from yesterday; otherwise from today. Uses UTC day boundaries consistently.
function streakFromDays(daySet) {
  const iso = d => d.toISOString().slice(0, 10);
  let d = new Date(todayUTC() + 'T00:00:00Z'), streak = 0;
  if (!daySet.has(iso(d))) d.setUTCDate(d.getUTCDate() - 1);
  while (daySet.has(iso(d))) { streak++; d.setUTCDate(d.getUTCDate() - 1); }
  return streak;
}
// participant = the signed-in user, else a SERVER-MINTED anonymous id carried in a signed, httpOnly,
// SameSite=Lax cookie. It is NEVER read from the request body.
//
// WHAT WAS BROKEN (measured 2026-08-01, hydrated Chrome against a real Postgres): the key was
// `clean(extra.voterKey, 64)` straight from the POST body, so ONE browser session posting 12
// made-up voterKeys to /api/experiments/start created 12 rows in the public ledger, and a fresh
// paint of /protocol/knee-pain/patellofemoral-pain then rendered
// `🧬 12 people are building this plan` (app.js:3927, shown once running >= 3). Same forged keys
// moved /api/stats and minted reputation: 25 points per distinct 'ob:'+key (referral award) and
// 5 per distinct 'forkclone:'+id+':'+key, both idempotent only on the caller's own string.
// app.js records that the previous `N people helped` counter was DELETED on 2026-07-28 for exactly
// this reason. Product constraint 5 (never fabricate counts) is the binding rule.
//
// CONSTRAINT 3 (anonymous-first) is preserved exactly: no account, no email, no fingerprint — an
// opaque random id the server hands out. It is minted ONLY when the reader chooses to participate
// (a write); pure reading never sets it, so a crawler or a casual reader is never tagged.
//
// MIGRATION: the client's localStorage key (app.js VOTER_KEY) is simply ignored from now on.
// app.js still sends it in five calls; that is harmless dead weight, not a coordinated release.
const ANON_COOKIE = 'rw_pid';
const ANON_MAX_AGE = 2 * 365 * 86400;
function anonSign(id) { return crypto.createHmac('sha256', SECRET).update('anon:' + id).digest('base64url').slice(0, 27); }
function anonRead(req) {
  const raw = parseCookies(req)[ANON_COOKIE]; if (!raw) return null;
  const i = raw.lastIndexOf('.'); if (i <= 0) return null;
  const id = raw.slice(0, i), sig = raw.slice(i + 1);
  if (!/^[A-Za-z0-9_-]{16,32}$/.test(id)) return null;
  const want = Buffer.from(anonSign(id)), got = Buffer.from(sig);
  if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return null;
  return id;
}
// Never clobber another Set-Cookie already on the response (the session cookie).
function appendCookie(res, c) {
  const cur = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', cur ? [].concat(cur, c) : [c]);
}
function anonMint(res) {
  const id = crypto.randomBytes(16).toString('base64url');
  appendCookie(res, `${ANON_COOKIE}=${id}.${anonSign(id)}; HttpOnly; Path=/; Max-Age=${ANON_MAX_AGE}; SameSite=Lax; Secure`);
  return id;
}
async function resolveParticipant(req, res, opts) {
  const u = await currentUser(req);
  if (u) return { key: 'u:' + u.id, user: u };
  let id = anonRead(req);
  if (!id && res && !(opts && opts.readOnly)) id = anonMint(res);
  return { key: id ? 'v:' + id : null, user: null };
}
async function getOrCreateExperiment(part, pid, rcid) {
  const r = await db.query(`INSERT INTO experiments(participant,user_id,problem_id,root_cause_id)
    VALUES($1,$2,$3,$4) ON CONFLICT (participant,problem_id,root_cause_id) DO UPDATE SET participant=EXCLUDED.participant
    RETURNING id,status,outcome`, [part.key, part.user ? part.user.id : null, pid, rcid]);
  return r.rows[0];
}
async function checkinDays(expId) {
  const cr = await db.query("SELECT to_char(day,'YYYY-MM-DD') AS day FROM experiment_checkins WHERE experiment_id=$1 ORDER BY day DESC LIMIT 90", [expId]);
  return new Set(cr.rows.map(x => x.day));
}
// Builder identity (Phase 5). Level is a pure function of experiments the participant has run to an
// outcome — no new state, just a view of the loop data. Same ladder used everywhere.
const LEVELS = [{ key: 'builder', name: 'Builder', min: 0 }, { key: 'experimenter', name: 'Experimenter', min: 1 }, { key: 'veteran', name: 'Veteran', min: 3 }, { key: 'architect', name: 'Architect', min: 10 }];
function levelFor(completed) {
  let cur = LEVELS[0], next = null;
  for (let i = 0; i < LEVELS.length; i++) { if (completed >= LEVELS[i].min) cur = LEVELS[i]; else { next = LEVELS[i]; break; } }
  return { key: cur.key, name: cur.name, next: next ? { name: next.name, at: next.min } : null };
}
// Monday (UTC) of the current week — for the weekly check-in goal.
function weekStartUTC() { const d = new Date(todayUTC() + 'T00:00:00Z'); const dow = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - dow); return d.toISOString().slice(0, 10); }

const ADMIN_USER = (process.env.ADMIN_USER || '').toLowerCase();
// The single super-admin: only this account sees the consolidated control room and can
// verify accounts / approve root-cause changes.
//
// SECURITY (fixed 2026-07-28): this used to compare users.email against a literal address.
// users.email is user-supplied, is never verified at /api/register, and had no UNIQUE index —
// so `POST /api/register {"email":"<the literal>"}` minted a super-admin session in one request.
// Super-admin is now decided on immutable identifiers only: the SERIAL primary key, or the
// Google subject. Neither can be chosen by a registrant. NEVER key this on email again.
const SUPERADMIN_ID = parseInt(process.env.SUPERADMIN_ID || '3', 10) || 0;
const SUPERADMIN_GOOGLE_SUB = String(process.env.SUPERADMIN_GOOGLE_SUB || '');
const isSuper = u => !!(u && (
  (SUPERADMIN_ID && Number(u.id) === SUPERADMIN_ID) ||
  (SUPERADMIN_GOOGLE_SUB && u.google_sub && String(u.google_sub) === SUPERADMIN_GOOGLE_SUB)
));
// Outcome-data moat: consent-notice version + validation allow-lists (reject anything off-list)
const CONSENT_VERSION = 'v2-2026-08-explicit';
// The wording a reader agreed to when they made their profile public. Stored ON the consent row and
// on the user, so a later change to the disclosure is visible as a version somebody has not seen
// yet rather than being applied retroactively to a decision made about different words.
// BUMP THIS whenever the disclosure copy in renderMe() changes materially.
const PUBLIC_PROFILE_DISCLOSURE = 'v1-2026-08-published-only';
const AGE_BANDS = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const SEXES = ['male', 'female', 'other', 'prefer_not'];
const ETHNICITIES = ['chinese', 'malay', 'indian', 'other', 'prefer_not'];
const CHECKIN_PHASES = ['baseline', 'd30', 'd90'];
const BLOOD_MARKERS = ['hba1c', 'fasting_glucose', 'ldl', 'hdl', 'triglycerides', 'total_chol', 'bp_sys', 'bp_dia', 'testosterone', 'shbg', 'tsh', 'ft4', 'ferritin', 'crp', 'vit_d', 'hscrp', 'a1c',
  'apob', 'lpa', 'fasting_insulin', 'estradiol', 'dhea_s', 'egfr', 'alt', 'uric_acid', 'homa_ir'];   // high-value adds: metabolic, cardiovascular, hormonal, longevity
const STOP_REASONS = ['didnt_work', 'side_effects', 'too_hard', 'cost', 'got_better', 'other'];   // why a user discontinued (persistence data)
const EXTRA_KEYS = ['mood_freq', 'sleep_quality', 'vitality', 'pain_interference'];               // category-specific outcome items, each an int 0..10
const inList = (v, list) => list.includes(v) ? v : null;
const intOr = (v, lo, hi) => { const n = parseInt(v, 10); return (Number.isFinite(n) && n >= lo && n <= hi) ? n : null; };
// keep only whitelisted extra keys with sane int values → safe JSONB, no injection of arbitrary shape
function cleanExtra(o) { if (!o || typeof o !== 'object') return null; const out = {}; for (const k of EXTRA_KEYS) { const n = intOr(o[k], 0, 10); if (n != null) out[k] = n; } return Object.keys(out).length ? out : null; }
// how many relevant-panel peer approvals move a change to 'peer_approved' (awaiting the
// superadmin's final approval before it goes live). Peer approval never publishes on its own.
const PANEL_THRESHOLD = 1;
async function currentUser(req) {
  const sid = parseCookies(req).sid;
  if (!sid || !db.enabled) return null;
  // 2026-08-08 · ONE ACCOUNT TYPE. domain, credential, domain_verified, requested_domain and
  // application_status are no longer selected here. Nothing writes them, no gate reads them, and
  // the session object is what becomes `ME` in the browser — so while they were on it, every page
  // in the SPA could branch on "what kind of professional is this". Now none can.
  const r = await db.query('SELECT u.id, u.username, u.email, u.google_sub, u.role, u.reputation_points, u.socials, u.badges, u.profile_views, u.booking_clicks FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token=$1 AND s.expires_at > now()', [sid]);
  const u = r.rows[0];
  if (u && ADMIN_USER && u.username.toLowerCase() === ADMIN_USER) u.role = 'admin';
  if (u && isSuper(u)) u.role = 'admin';           // the superadmin always has admin powers
  if (u) u.is_super = isSuper(u);
  return u || null;
}
async function hasExplicitResearchConsent(userId) {
  if (!FEATURES.researchCollection || !userId) return false;
  const r = await db.query(`SELECT decision FROM consent_records
    WHERE user_id=$1 AND purpose='research' ORDER BY created_at DESC, id DESC LIMIT 1`, [userId]);
  return !!(r.rows[0] && r.rows[0].decision === true);
}
async function verifyGoogleIdentity(credential) {
  if (!GOOGLE_CLIENT_ID) return { status: 503, error: 'Google sign-in is not enabled on this server.' };
  if (!credential) return { status: 400, error: 'Missing Google credential' };
  let p;
  try {
    const vr = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential), { signal: AbortSignal.timeout(10000) });
    if (!vr.ok) throw new Error('tokeninfo ' + vr.status);
    p = await vr.json();
  } catch (_) { return { status: 401, error: 'Could not verify Google sign-in' }; }
  if (p.aud !== GOOGLE_CLIENT_ID) return { status: 401, error: 'Google token was issued for a different app' };
  if (!(p.iss === 'accounts.google.com' || p.iss === 'https://accounts.google.com')) return { status: 401, error: 'Bad token issuer' };
  if (p.email_verified === false || p.email_verified === 'false') return { status: 401, error: 'Your Google email is not verified' };
  if (!p.sub) return { status: 401, error: 'Google sign-in did not provide an account identifier' };
  return {
    sub: String(p.sub),
    email: String(p.email || '').trim().toLowerCase(),
    name: String(p.name || ''),
  };
}
function setSessionCookie(res, token) {
  const days = 30;
  // appendCookie, not setHeader: a response may already carry the anonymous participant cookie,
  // and raw setHeader would silently drop whichever of the two was set first.
  appendCookie(res, `sid=${token}; HttpOnly; Path=/; Max-Age=${days * 86400}; SameSite=Lax; Secure`);
}
// (The same-origin guard now lives with the rest of the write hardening, below — see sameOrigin()
// near WRITE_METHODS. An earlier duplicate of this name sat here and was shadowed by it, because
// function declarations hoist and the later one wins for every caller. It has been removed: it
// returned TRUE for a request with no Origin, which is the OPPOSITE of the policy actually
// enforced, so anyone reading server.js top-down learned the wrong rule. Proven dead before
// deletion — a POST with a Chrome UA and neither Origin nor Referer returns
// 403 "Cross-origin writes are not accepted.", a response only the surviving version can produce.)

// ---- Email nudges (Resend) — activates when RESEND_API_KEY is set; otherwise the "due" list still shows in Control Room ----
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'RNAwiki <hello@rnawiki.com>';
// Full compound catalogue, loaded once in an isolated context. Kept after the Telegram
// removal because the Control Room attributes reported side-effects to specific compounds
// through COMPOUND_BY_ID below. The interaction engine (interactions.js) was only ever read
// by the bot's /stack command and is no longer loaded here.
let SITE_DATA = null;
// W7 (2026-08-09): exercises.js, foods.js and interactions.js join the SAME load. The Protocol
// Studio's save-time engine has to be able to answer "is this a real exercise id" and "is this a
// real food id" — POST /api/share-plan currently trims an arbitrary string to 80 characters, stores
// it as a move id, and GET /api/shared-plan echoes it publicly — and it has to be able to run the
// interaction matcher. ONE sandbox, not four: a second loader is a second corpus, which is the
// defect class this codebase has caught repeatedly.
let SITE_EXERCISES = null, SITE_FOODS = null, SITE_IXN = null;
try {
  const vm = require('vm');
  const sb = { window: {} };
  for (const f of ['data.js', 'exercises.js', 'foods.js', 'interactions.js']) {
    vm.runInNewContext(fs.readFileSync(path.join(DIR, f), 'utf8'), sb, { filename: f });
  }
  SITE_DATA = sb.window.RNAWIKI_DATA;
  SITE_EXERCISES = sb.window.RNAWIKI_EXERCISES;
  SITE_FOODS = sb.window.RNAWIKI_FOODS;
  SITE_IXN = sb.window.RNAWIKI_INTERACTIONS;
} catch (e) { console.error('[data] catalogue load failed:', e.message); }
// compound id -> {name, isRx, badge} — used to attribute reported side-effects in the Control Room
const COMPOUND_BY_ID = {};
if (SITE_DATA && Array.isArray(SITE_DATA.compounds)) SITE_DATA.compounds.forEach(c => { COMPOUND_BY_ID[c.id] = { name: c.name, isRx: !!c.isRx, badge: c.badge || '' }; });
// ===== Email nudge engine — milestone check-ins and the daily reminder digest =====
const PROBLEM_NAME = (() => { try { const g = require('./data/clinical_graph.json'); const m = {}; (g.problems || []).forEach(p => { m[p.id] = p.name; }); return m; } catch (e) { return {}; } })();
// HTML escape for email bodies. (Was tgEsc, shared with the bot; the bot is gone, the emails remain.)
function htmlEsc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
// problem/root-cause index + keystone, keyed "pid/rcid".
// NOTE: this was named PROTO_INDEX and lived in the Telegram block, but it is NOT bot-specific —
// buildReminderLines() reads it to compose the daily reminder EMAIL. Deleting it with the bot
// would have silently emptied every reminder email. Kept, renamed.
const PROTO_INDEX = {};
try {
  const g = require('./data/clinical_graph.json'); const ks = require('./data/keystones.json');
  g.problems.forEach(p => p.root_causes.forEach(rc => {
    PROTO_INDEX[p.id + '/' + rc.id] = { problem: p.name, rc: rc.name.replace(/\s*\([^)]*\)/, ''), keystone: ks[rc.id] || null, nt: rc.nutrient_targets || {} };
  }));
} catch (e) { console.error('[proto] index load failed:', e.message); }
// ---- Protocol functions (mirrors site/app.js PLAN_FUNCTIONS — keep the two in sync) ----
// Same story: read by the reminder email, not only by the bot. The two entries that used to
// carry `tgOnly: true` ('wake', 'sunlight') are reminder-kind functions; email now delivers
// them, so the flag is gone rather than the functions.
const PLAN_FUNCTIONS = [
  { id: 'walk', icon: '🚶', name: 'Post-meal walk timer', kind: 'timer', target: 10, unit: 'min', how: 'A 10-min walk after your biggest meal blunts the glucose spike.', match: ['glucose', 'insulin', 'blood sugar', 'metabolic', 'diabet', 'a1c'] },
  { id: 'breath', icon: '🌬️', name: 'Box-breathing timer', kind: 'timer', target: 4, unit: 'min', how: '4 minutes of 4-4-4-4 breathing when stress hits.', match: ['anx', 'stress', 'cortisol', 'panic', 'overwhelm', 'nervous'] },
  { id: 'plants', icon: '🥦', name: 'Plant-diversity counter', kind: 'counter', target: 30, unit: 'plants', period: 'week', how: '30+ different plants a week feeds a diverse microbiome.', match: ['gut', 'microbiome', 'fiber', 'digest', 'bloat', 'ibs', 'constipat'] },
  { id: 'steps', icon: '👟', name: 'Daily step counter', kind: 'counter', target: 8000, unit: 'steps', period: 'day', how: 'Log steps toward 8,000/day.', match: ['fat', 'weight', 'cardio', 'endur', 'sedentary', 'circulation'] },
  { id: 'hydration', icon: '💧', name: 'Hydration counter', kind: 'counter', target: 8, unit: 'glasses', period: 'day', how: 'Target 8 glasses a day.', match: ['energy', 'skin', 'headache', 'focus', 'fatigue', 'kidney'] },
  { id: 'protein', icon: '🥩', name: 'Protein-per-meal', kind: 'counter', target: 4, unit: 'protein meals', period: 'day', how: 'A palm of protein per meal. Aim for 3–4 a day — no weighing.', match: ['muscle', 'strength', 'hypertrophy', 'sarcopenia', 'lean mass', 'menopause', 'craving', 'appetite', 'satiety'] },
  { id: 'fermented', icon: '🥬', name: 'Fermented-foods counter', kind: 'counter', target: 3, unit: 'servings', period: 'day', how: 'Yoghurt, kefir, kimchi, sauerkraut, kombucha.', match: ['gut', 'microbiome', 'digest', 'bloat', 'ibs', 'immun', 'inflamm'] },
  { id: 'pain', icon: '🚦', name: 'Pain traffic-light', kind: 'triage', how: 'After rehab: 🟢 fine / 🟡 sore / 🔴 sharp — progress, hold or back off.', match: ['pain', 'knee', 'back', 'neck', 'shoulder', 'hip', 'tendin', 'tendon', 'joint', 'stiff', 'ache', 'rehab', 'sciatic', 'plantar'] },
  { id: 'eatwin', icon: '⏳', name: 'Eating-window', kind: 'window', target: 10, how: 'First bite to kitchen closed, against a 10h target.', match: ['insulin', 'glucose', 'visceral', 'belly', 'fat', 'metabolic', 'fasting', 'blood sugar'] },
  { id: 'bp', icon: '🩺', name: 'Home blood-pressure', kind: 'bp', how: 'Log your readings and see when they need a doctor.', match: ['blood pressure', 'hypertension', 'bp', 'cardiovascular', 'cholesterol'] },
  { id: 'adhere', icon: '📅', name: 'Daily-dose adherence', kind: 'adherence', how: 'Mark each day you apply it — track your streak.', match: ['hair', 'minoxidil', 'finasteride', 'tretinoin', 'acne', 'skin', 'hormonal treatment', 'thyroid'] },
  { id: 'win', icon: '🌟', name: 'One small win', kind: 'log', how: 'Naming one tiny win a day lifts low mood.', match: ['depress', 'low mood', 'anhedonia', 'burnout', 'motivation'] },
  { id: 'symptom', icon: '📈', name: 'Symptom check', kind: 'scale', trend: true, scale: [{ v: 1, e: '😣' }, { v: 2, e: '😕' }, { v: 3, e: '😐' }, { v: 4, e: '🙂' }, { v: 5, e: '😄' }], how: 'How you feel today — see the trend over time.', match: ['menopause', 'hot flash', 'migraine', 'headache', 'acne', 'breakout', 'brain fog', 'fog', 'inflamm', 'flare', 'ibs', 'mood'] },
  { id: 'readiness', icon: '🔋', name: 'Readiness check', kind: 'scale', scale: [{ v: 1, e: '😴', label: 'Wiped', g: 'take it easy or rest today' }, { v: 2, e: '😐', label: 'OK', g: 'train as planned' }, { v: 3, e: '💪', label: 'Fresh', g: 'good day to push' }], how: 'How recovered you feel — push or back off.', match: ['overtrain', 'recovery', 'under-recover', 'fatigue', 'plateau', 'burnout'] },
  { id: 'sigh', icon: '🌬️', name: 'Physiological sigh', kind: 'timer', target: 2, unit: 'min', how: 'Two inhales through the nose, one long exhale. Repeat 2 min.', match: ['anx', 'panic', 'cortisol', 'overwhelm', 'nervous', 'racing'] },
  { id: 'craving', icon: '🌊', name: 'Craving-surf timer', kind: 'timer', target: 10, unit: 'min', how: 'When a craving hits, do something else for 10 min — it almost always passes.', match: ['craving', 'appetite', 'sugar', 'snack', 'binge'] },
  { id: 'focus', icon: '🎯', name: 'Focus blocks', kind: 'counter', target: 4, unit: 'blocks', period: 'day', how: 'Write your ONE next step, do a 25-min block. Aim for 4/day.', match: ['focus', 'adhd', 'concentration', 'brain fog', 'procrastin', 'distract', 'productivity'] },
  { id: 'zone2', icon: '🏃', name: 'Zone-2 minutes', kind: 'counter', target: 150, unit: 'min', period: 'week', step: 10, match: ['endur', 'longevity', 'healthspan', 'vo2', 'vascular', 'stamina', 'aerobic'], how: 'Easy conversational-pace minutes. Aim for 150 a week.' },
  { id: 'sleepwin', icon: '🛏️', name: 'Sleep-window tracker', kind: 'sleep', how: 'CBT-I sleep restriction — track sleep efficiency and when to shift your bedtime.', match: ['sleep', 'insomnia', 'fall asleep', 'waking', 'awake', 'circadian', 'tired', 'jet lag', 'restless'] },
  { id: 'wake', icon: '⏰', name: 'Fixed wake-time reminder', kind: 'reminder', how: 'A constant wake time anchors your body clock — a nightly nudge to protect wind-down.', match: ['sleep', 'insomnia', 'circadian', 'tired', 'wake', 'jet lag'] },
  { id: 'sunlight', icon: '☀️', name: 'Morning-sunlight reminder', kind: 'reminder', how: '10 min of morning light sets your clock — a reminder within an hour of waking.', match: ['mood', 'vitamin d', 'seasonal', 'depress', 'low energy', 'winter'] },
];
function fnById(id) { return PLAN_FUNCTIONS.find(f => f.id === id); }

// ===== THE PROTOCOL STUDIO — the save-time safety engine (W7, 2026-08-09) =====================
// A user-built protocol is user-generated MEDICAL content. Every gate that makes the authored
// corpus honest runs in build/parse.js and build/prerender.js, at BUILD time, over files on disk.
// A user protocol is written afterwards, by somebody else, into a database row no build will ever
// see. So the same rules run again at SAVE, out of ONE module (./studio-safety.js) that
// build/parse.js also loads — see assertStudioSafetyMirrorsBuildGates(), which fails the build if a
// build gate in the safety family ever loses its save-time twin.
//
// It is initialised HERE, once, from the SAME vm sandbox the rest of this file reads, and from
// PLAN_FUNCTIONS above rather than from a retyped list of tool ids. If the corpus failed to load,
// STUDIO_READY is false and every Studio endpoint answers with that, in words — a validator that
// cannot see the corpus must never return "ok".
const STUDIO = require('./studio-safety.js');
let STUDIO_READY = false;
try {
  STUDIO.init({
    data: SITE_DATA, interactions: SITE_IXN, exercises: SITE_EXERCISES, foods: SITE_FOODS,
    functionIds: PLAN_FUNCTIONS.map(f => f.id),
  });
  STUDIO_READY = true;
  console.log('[studio] save-time safety ready — %d rules, %d compounds, %d exercises, %d foods, %d tools.',
    STUDIO.RULES.length, (SITE_DATA.compounds || []).length, (SITE_EXERCISES.exercises || []).length,
    (SITE_FOODS.foods || []).length, PLAN_FUNCTIONS.length);
} catch (e) { console.error('[studio] save-time safety UNAVAILABLE:', e.message); }
// The one answer a broken validator is allowed to give.
function studioDown(res) {
  return json(res, 503, { error: 'The safety checker could not load its own corpus, so nothing can be checked and nothing will be saved. That is a fault at this end, not a problem with your protocol.', refusals: [], warn: [], coverage: null });
}
// A protocol code: base64url over 6 random bytes, minted here. Same shape and same minting as
// shared_plans.code — never derived from the title, never enumerable.
function studioCode() { return crypto.randomBytes(6).toString('base64url'); }
// Public Studio titles are never caller-written copy. A 90-character limit does not review a
// medical claim, and titles appear on profile pages and public protocol pages. Prefer the governed
// problem/pattern labels already in the corpus; a rootless collection gets a deliberately neutral
// name. The creator's chosen title remains useful only on their private draft.
function publicProtocolTitle(pid, rcid) {
  const p = pid && rcid ? PROTO_INDEX[pid + '/' + rcid] : null;
  return p ? `${p.problem} — ${p.rc} protocol` : 'Custom RNAwiki protocol';
}
async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
    });
    if (!r.ok) { console.error('[email] send failed', r.status, (await r.text().catch(() => '')).slice(0, 200)); return false; }
    return true;
  } catch (e) { console.error('[email]', e.message); return false; }
}
// When someone replies to a shared "explain it back" post, ping the original author on their
// linked Telegram chat and by email (whichever they have). Never notifies a user of their own reply.
async function notifyReply(parentId, slug, replier, body) {
  try {
    const p = (await db.query('SELECT user_id, handle FROM explain_posts WHERE id=$1', [parentId])).rows[0];
    if (!p || !p.user_id) return;                              // parent was anonymous — nobody to notify
    if (replier && replier.id === p.user_id) return;           // don't notify yourself
    const eh = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const name = (replier && replier.username) ? replier.username : 'Someone';
    const nameSlug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const cname = (SITE_DATA && Array.isArray(SITE_DATA.compounds) && (SITE_DATA.compounds.find(x => nameSlug(x.name) === slug) || {}).name) || slug;
    const snippet = String(body || '').slice(0, 220);
    const link = `${SITE_URL}/#/c/${slug}`;
    // (The Telegram notification branch was removed 2026-07-28 with the bot. Email is now the
    // only reply notification channel.)
    const usr = (await db.query('SELECT email, email_off FROM users WHERE id=$1', [p.user_id])).rows[0];
    if (usr && usr.email && !usr.email_off) {
      sendEmail(usr.email, `${name} replied to your explanation of ${cname}`,
        `<div style="font-family:system-ui,sans-serif;max-width:520px"><p><b>${eh(name)}</b> replied to the explanation of <b>${eh(cname)}</b> you shared on RNAwiki:</p><blockquote style="border-left:3px solid #10b981;margin:0;padding:.4rem 0 .4rem 1rem;color:#334">${eh(snippet)}</blockquote><p style="margin-top:1rem"><a href="${link}" style="background:#10b981;color:#fff;padding:.5rem 1rem;border-radius:8px;text-decoration:none">Read the discussion →</a></p></div>`
      ).catch(() => {});
    }
  } catch (e) { console.error('[explain] notify:', e.message); }
}
// Pure: given a plan + a done(pid,rcid,phase)->bool predicate, return the most-pressing due milestone or null.
function computeDuePhase(plan, doneHas, today) {
  const protos = (plan && Array.isArray(plan.protocols)) ? plan.protocols : [];
  for (const pr of protos) {
    if (!pr.pid || !pr.rcid || !pr.startedAt) continue;
    const days = Math.floor((Date.parse(today + 'T00:00:00Z') - Date.parse(pr.startedAt + 'T00:00:00Z')) / 86400000);
    if (!Number.isFinite(days)) continue;
    if (days >= 90 && !doneHas(pr.pid, pr.rcid, 'd90')) return { pr, phase: 'd90', days };
    if (days >= 30 && !doneHas(pr.pid, pr.rcid, 'd30')) return { pr, phase: 'd30', days };
  }
  return null;
}
// Which consented users have a milestone check-in due (d30/d90) — computed in 2 queries, then in JS.
async function listDueCheckins() {
  if (!db.enabled || !FEATURES.researchCollection) return [];
  const today = new Date().toISOString().slice(0, 10);
  const users = (await db.query(`SELECT u.id, u.email, u.username, u.last_checkin_email, u.email_nudge_hour, p.plan
    FROM users u JOIN current_research_consent c ON c.user_id=u.id AND c.decision=true
    JOIN user_plans p ON p.user_id=u.id WHERE u.email IS NOT NULL AND u.email_off IS NOT TRUE`)).rows;
  if (!users.length) return [];
  const done = (await db.query('SELECT user_id, pid, rcid, phase FROM research_outcome_checkins WHERE user_id = ANY($1)', [users.map(u => u.id)])).rows;
  const doneKey = new Set(done.map(d => d.user_id + '|' + d.pid + '|' + d.rcid + '|' + d.phase));
  const out = [];
  for (const u of users) {
    const due = computeDuePhase(u.plan, (pid, rcid, ph) => doneKey.has(u.id + '|' + pid + '|' + rcid + '|' + ph), today);
    if (due) out.push({ user: u, pr: due.pr, phase: due.phase, days: due.days });
  }
  return out;
}
async function sendCheckinEmail(d) {
  const name = PROBLEM_NAME[d.pr.pid] || 'your protocol';
  const wk = d.phase === 'd90' ? '90 days' : '30 days';
  const link = `${SITE_URL}/#/plan`;
  const subject = `You're ${wk} into your ${name} protocol — 2-min check-in?`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
    <h2 style="font-size:20px">How's it going with ${htmlEsc(name)}?</h2>
    <p style="font-size:15px;line-height:1.5">You've been at it for <b>${wk}</b>. A 20-second check-in tells you whether it's working — and helps everyone with the same problem.</p>
    <p><a href="${link}" style="display:inline-block;background:#2f6f4f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px">Log my ${htmlEsc(wk)} check-in →</a></p>
    <p style="font-size:12px;color:#888;line-height:1.5">Anonymous &amp; optional. You're getting this because you consented to help RNAwiki learn what works. Manage or withdraw anytime in your account.</p>
  </div>`;
  return sendEmail(d.user.email, subject, html);
}
// ---- Daily reminder email — bundles EVERY nudge the user selected (keystone + tools), web parity of the TG daily nudge ----
// Reads the saved plan: keystone(s) from PROTO_INDEX + each selected tool from PLAN_FUNCTIONS. Returns [] if nothing to remind.
function buildReminderLines(plan) {
  const protos = (plan && Array.isArray(plan.protocols)) ? plan.protocols : [];
  const lines = [], seen = new Set();
  for (const pr of protos) {
    const info = PROTO_INDEX[(pr.pid || '') + '/' + (pr.rcid || '')];
    if (info && info.keystone && info.keystone.one && !seen.has('k:' + pr.pid + pr.rcid)) {
      seen.add('k:' + pr.pid + pr.rcid);
      lines.push({ icon: '⭐', label: info.keystone.one, sub: info.keystone.why || '' });
    }
    const fns = Array.isArray(pr.functions) ? pr.functions : [];
    for (const fid of fns) { const f = fnById(fid); if (f && !seen.has(fid)) { seen.add(fid); lines.push({ icon: f.icon, label: f.name, sub: f.how || '' }); } }
  }
  return lines;
}
function buildReminderEmail(plan, due) {
  const lines = buildReminderLines(plan);
  if (!lines.length && !due) return null;
  const link = `${SITE_URL}/#/plan`;
  const items = lines.map(l => `<li style="margin:0 0 10px;font-size:15px;line-height:1.45"><span style="font-size:17px">${l.icon}</span> <b>${htmlEsc(l.label)}</b>${l.sub ? `<br><span style="color:#666;font-size:13px">${htmlEsc(l.sub)}</span>` : ''}</li>`).join('');
  const ci = due ? `<div style="margin:18px 0;padding:12px 14px;background:#f0f7f3;border-radius:10px;font-size:14px">📋 You're <b>${due.phase === 'd90' ? '90 days' : '30 days'}</b> into your ${htmlEsc(PROBLEM_NAME[due.pr.pid] || 'protocol')} — a 20-second check-in is due. It's in your tracker.</div>` : '';
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
    <h2 style="font-size:20px;margin:0 0 4px">Today's plan ⭐</h2>
    <p style="font-size:14px;color:#666;margin:0 0 16px">Your reminders for today — tick them off in the tracker.</p>
    <ul style="list-style:none;padding:0;margin:0">${items}</ul>
    ${ci}
    <p style="margin:20px 0 0"><a href="${link}" style="display:inline-block;background:#2f6f4f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px">Open my tracker →</a></p>
    <p style="font-size:12px;color:#999;line-height:1.5;margin-top:18px">You turned on daily reminders. Turn them off anytime under "Your data &amp; privacy" in your account.</p>
  </div>`;
  return { subject: 'Your RNAwiki plan for today ⭐', html };
}
let EMAIL_TIMER = null, EMAIL_REMIND_TIMER = null;
async function emailNudgeTick() {
  if (!RESEND_API_KEY || !db.enabled) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const cutoff = new Date(Date.now() - 13 * 86400000).toISOString().slice(0, 10);   // ~14-day gap between nudges
    const due = await listDueCheckins();
    for (const d of due) {
      if (d.user.email_nudge_hour != null) continue;                                   // daily-reminder users get the check-in line there — don't double-email
      if (d.user.last_checkin_email && d.user.last_checkin_email > cutoff) continue;   // emailed recently — don't spam
      const ok = await sendCheckinEmail(d);
      if (ok) await db.query('UPDATE users SET last_checkin_email=$2 WHERE id=$1', [d.user.id, today]);
    }
  } catch (e) { console.error('[email] nudge tick:', e.message); }
}
// Daily reminder digest — TZ-aware 5-min tick: fires once/day at each user's chosen local hour.
async function emailReminderTick() {
  if (!RESEND_API_KEY || !db.enabled) return;
  try {
    const now = new Date(); const nowUtcMin = now.getUTCHours() * 60 + now.getUTCMinutes(); const today = now.toISOString().slice(0, 10);
    const rows = (await db.query(`SELECT u.id, u.email, u.email_nudge_hour, u.email_tz_offset, p.plan
      FROM users u JOIN user_plans p ON p.user_id=u.id
      WHERE u.email IS NOT NULL AND u.email_off IS NOT TRUE AND u.email_nudge_hour IS NOT NULL AND (u.email_last_nudge IS NULL OR u.email_last_nudge <> $1)`, [today])).rows;
    for (const u of rows) {
      const localMin = (((nowUtcMin + (u.email_tz_offset ?? 480)) % 1440) + 1440) % 1440;  // ?? not || — a real 0 (UTC) must stay 0
      if (Math.floor(localMin / 60) !== u.email_nudge_hour) continue;                   // not this user's hour yet
      const done = FEATURES.researchCollection
        ? (await db.query('SELECT pid, rcid, phase FROM research_outcome_checkins WHERE user_id=$1', [u.id])).rows
        : [];
      const doneSet = new Set(done.map(d => d.pid + '|' + d.rcid + '|' + d.phase));
      const due = computeDuePhase(u.plan, (pid, rcid, ph) => doneSet.has(pid + '|' + rcid + '|' + ph), today);
      const mail = buildReminderEmail(u.plan, due);
      const alsoCheckin = (due && mail) ? ', last_checkin_email=$2' : '';
      await db.query(`UPDATE users SET email_last_nudge=$2${alsoCheckin} WHERE id=$1`, [u.id, today]);  // mark before send → never double-fire in a day
      if (mail) await sendEmail(u.email, mail.subject, mail.html);
    }
  } catch (e) { console.error('[email] reminder tick:', e.message); }
}
async function sendWinbackEmail(email, name, days) {
  const link = `${SITE_URL}/#/plan`;
  const subject = `Your ${name} protocol is still here 👋`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
    <h2 style="font-size:20px;margin:0 0 6px">Pick up where you left off</h2>
    <p style="font-size:15px;line-height:1.5">It's been about <b>${days} days</b> since you last worked on your ${htmlEsc(name)} protocol. Your plan, streak history and progress are all still saved — you can jump straight back in.</p>
    <p style="font-size:15px;line-height:1.5">Even one small action today keeps the momentum going.</p>
    <p style="margin:20px 0 0"><a href="${link}" style="display:inline-block;background:#2f6f4f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px">Back to my protocol →</a></p>
    <p style="font-size:12px;color:#999;line-height:1.5;margin-top:18px">Don't want these? Turn off emails anytime under "Your data &amp; privacy" in your account.</p>
  </div>`;
  return sendEmail(email, subject, html);
}
// Win back users who drifted: no tracking activity for 10+ days, on a started protocol, not on daily reminders,
// not active on Telegram, no check-in email lately — capped once/21 days. (Covers the "inactive user" trigger.)
async function emailWinbackTick() {
  if (!RESEND_API_KEY || !db.enabled) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const cutoff21 = new Date(Date.now() - 21 * 86400000).toISOString().slice(0, 10);
    const cutoff7 = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const rows = (await db.query(`SELECT u.id, u.email, p.plan, to_char(p.updated_at,'YYYY-MM-DD') AS last_active
      FROM users u JOIN user_plans p ON p.user_id=u.id
      WHERE u.email IS NOT NULL AND u.email_off IS NOT TRUE AND u.email_nudge_hour IS NULL
        AND p.updated_at < now() - interval '10 days'
        AND (u.last_winback_email IS NULL OR u.last_winback_email < $1)
        AND (u.last_checkin_email IS NULL OR u.last_checkin_email < $2)`,
      // The removed clause was: AND NOT EXISTS (SELECT 1 FROM telegram_users t WHERE
      // t.user_id=u.id AND t.last_active > now() - interval '10 days'). Its intent was "do not
      // win back someone who is active on another channel". With the bot gone there is no other
      // channel, and web activity is already covered by `p.updated_at < now() - interval
      // '10 days'` above, so the condition is subsumed rather than dropped. Verified before
      // removal: the audience count was identical with and without it (1 row either way).
      [cutoff21, cutoff7])).rows;
    for (const u of rows) {
      const protos = (u.plan && Array.isArray(u.plan.protocols)) ? u.plan.protocols : [];
      if (!protos.length) continue;   // never actually started a protocol
      const name = PROBLEM_NAME[protos[0].pid] || 'your';
      const days = Math.max(10, Math.floor((Date.parse(today + 'T00:00:00Z') - Date.parse(u.last_active + 'T00:00:00Z')) / 86400000));
      await db.query('UPDATE users SET last_winback_email=$2 WHERE id=$1', [u.id, today]);   // mark before send → never double-fire
      await sendWinbackEmail(u.email, name, days);
    }
  } catch (e) { console.error('[email] winback tick:', e.message); }
}
async function email6hTick() { await emailNudgeTick(); await emailWinbackTick(); }   // sequential so milestone marks last_checkin_email before winback checks it
// ===== Newsletter REMOVED 2026-08-06 ===========================================================
// The audience half of the email system is gone with the newsletter: RESEND_AUDIENCE_ID,
// resendAddContact(), resendUnsubscribe(), welcomeEmail() and EMAIL_RE. Caller census taken
// before deleting — each had exactly ONE call site and every one of those call sites was inside
// /api/subscribe or /api/unsubscribe, both removed in this same commit.
//
// KEPT ON PURPOSE, because it is the machinery a future creator-broadcast feature needs and none
// of it belonged to the newsletter: sendEmail() (5 call sites before this commit, 4 survive — the
// deleted one was the welcome email), RESEND_API_KEY (16 occurrences before, 12 after; the 4 that
// went were the two guards and two Authorization headers inside the deleted Resend-audience
// helpers), emailNudgeTick(), emailReminderTick(), emailWinbackTick(),
// sendWinbackEmail(), email6hTick(), emailStartScheduler(), EMAIL_TIMER/EMAIL_REMIND_TIMER, and
// every users-table email column in db.js. Those send to people who HAVE an account and asked
// for reminders; the newsletter was a separate opt-in list of strangers.

function emailStartScheduler() {
  if (!db.enabled || EMAIL_TIMER) return;
  if (!RESEND_API_KEY) { console.log('[email] RESEND_API_KEY not set — nudge emails dormant (due list still visible in Control Room).'); return; }
  EMAIL_TIMER = setInterval(email6hTick, 6 * 60 * 60 * 1000);      // milestone check-ins + inactivity win-back — every 6h
  setTimeout(() => email6hTick().catch(() => {}), 60 * 1000);      // and once shortly after boot
  EMAIL_REMIND_TIMER = setInterval(emailReminderTick, 5 * 60 * 1000);  // daily reminder digest — TZ-aware 5-min tick
  console.log('[email] check-in+winback (6h) + daily-reminder (5-min) schedulers started.');
}
// ---------- unauthenticated write hardening ----------
// Every unauthenticated POST was forgeable: resolveParticipant() USED TO trust a body-supplied
// voterKey (closed 2026-08-01 — the id is now server-minted in the signed rw_pid cookie), and two
// curl calls could move the public counters. Three cheap layers, no dependencies, applied at
// the single api() chokepoint so a new endpoint cannot forget to opt in.
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const RL_BUCKETS = new Map();          // ip -> { tokens, ts }
const RL_BURST = 15;                   // burst allowance per IP
const RL_REFILL_MS = 4000;             // +1 token per 4s (~15/min sustained)
const RL_MAX_KEYS = 5000;              // bound memory; evict oldest when exceeded

function rateAllow(ip) {
  const now = Date.now();
  let b = RL_BUCKETS.get(ip);
  if (!b) {
    if (RL_BUCKETS.size >= RL_MAX_KEYS) {              // cheap sweep of the stalest half
      const stale = [...RL_BUCKETS.entries()].sort((a, c) => a[1].ts - c[1].ts).slice(0, RL_MAX_KEYS / 2);
      stale.forEach(([k]) => RL_BUCKETS.delete(k));
    }
    b = { tokens: RL_BURST, ts: now }; RL_BUCKETS.set(ip, b);
  }
  b.tokens = Math.min(RL_BURST, b.tokens + Math.floor((now - b.ts) / RL_REFILL_MS));
  b.ts = now;
  if (b.tokens <= 0) return false;
  b.tokens -= 1;
  return true;
}
// A browser always sends Origin on a cross-document POST. Requiring it (or a matching Referer)
// blocks both CSRF and the trivial `curl -d` forgery that moved the counters.
function sameOrigin(req) {
  const host = String(req.headers.host || '').toLowerCase();
  if (!host) return false;
  const originOf = (v) => { try { return new URL(v).host.toLowerCase(); } catch (e) { return null; } };
  const o = req.headers.origin ? originOf(req.headers.origin) : null;
  if (o) return o === host;
  const r = req.headers.referer ? originOf(req.headers.referer) : null;
  if (r) return r === host;
  return false;                                        // no Origin and no Referer on a write → refuse
}
// Speed bump only — the rate limit and origin check are the real controls.
function looksAutomated(req) {
  const ua = String(req.headers['user-agent'] || '');
  if (!ua) return true;
  return /\b(curl|wget|python-requests|python-urllib|libwww|httpie|scrapy|go-http-client|java|okhttp|axios\/|node-fetch|postman)\b/i.test(ua);
}
// ---- GET-side counters ----
// The chokepoint above guards WRITE_METHODS only, which is correct — reads must stay anonymous and
// unthrottled. But three GET handlers perform an UPDATE ... + 1: /api/track (booking_clicks),
// /api/shared-plan (shared_plans.clicks) and /api/u/:handle (profile_views). All three are numbers
// RNAwiki shows to the expert they describe, and all three move for a bare `curl` with no Origin
// and no browser UA — measured, 21 consecutive curl GETs of /api/track all returned 204 and all
// reached the UPDATE. A count anyone can inflate from a shell loop — or that a crawler or a
// link-prefetcher inflates by accident — is a fabricated count under product constraint 5.
// Count each (ip, counter, target) at most once per 6h and never count something that announces
// itself as automated. Deliberately its OWN map, NOT rateAllow(): sharing the write bucket would
// let a crawler exhaust a real user's write budget.
const CT_SEEN = new Map();                 // 'ip|kind|target' -> ts
const CT_TTL_MS = 6 * 60 * 60 * 1000;
const CT_MAX_KEYS = 20000;
function countOnce(req, kind, target) {
  if (looksAutomated(req)) return false;
  const now = Date.now(), k = clientIp(req) + '|' + kind + '|' + String(target);
  const prev = CT_SEEN.get(k);
  if (prev && now - prev < CT_TTL_MS) return false;
  if (CT_SEEN.size >= CT_MAX_KEYS) {
    for (const [kk, ts] of CT_SEEN) if (now - ts >= CT_TTL_MS) CT_SEEN.delete(kk);
    if (CT_SEEN.size >= CT_MAX_KEYS) CT_SEEN.clear();
  }
  CT_SEEN.set(k, now);
  return true;
}
// ---- /interest: the topic allowlist and the signup cap ---------------------------------------
// The nine chips are authored ONCE, in data/site_config.json, and reach this file the same way
// COMPOUND_ALIASES and SOLVE_INDEX do — parsed out of site/data.js at boot, below. Until that read
// happens the list is empty, and an empty list FAILS CLOSED: an unrecognised topic is stored as
// NULL, never as itself. That column answers "what do most people name", so a value a hand-written
// POST could invent would be a fabricated count.
let INTEREST_TOPICS = [];
// The chokepoint's own bucket is 15 writes per burst, shared with every other POST on the site
// (~15/min sustained = ~21,600 a day from one IP). That is the right shape for a logger and the
// wrong shape for a signup form, which a real person submits ONCE. Ten STORED addresses per IP per
// rolling 24h: generous enough that a household, an office or a Singapore CGNAT range never sees
// it, and three orders of magnitude below what the chokepoint alone allows.
// Deliberately its own map and not rateAllow(), for the reason already written above CT_SEEN: a
// flood here must not be able to exhaust a real reader's budget for the logger or the plan builder.
// Nothing in it is ever written to the database — see the note on interest_signups in db.js.
const INT_SEEN = new Map();                 // ip -> [timestamps inside the last 24h]
const INT_PER_DAY = 10;
const INT_TTL_MS = 24 * 60 * 60 * 1000;
const INT_MAX_KEYS = 20000;
function interestAllow(ip) {
  const now = Date.now();
  if (INT_SEEN.size >= INT_MAX_KEYS) {
    for (const [k, v] of INT_SEEN) if (!v.some((t) => now - t < INT_TTL_MS)) INT_SEEN.delete(k);
    if (INT_SEEN.size >= INT_MAX_KEYS) INT_SEEN.clear();
  }
  const a = (INT_SEEN.get(ip) || []).filter((t) => now - t < INT_TTL_MS);
  INT_SEEN.set(ip, a);
  if (a.length >= INT_PER_DAY) return false;
  a.push(now);
  return true;
}
// Returns true if the request was blocked (and the response already sent).
function writeBlocked(req, res) {
  if (!sameOrigin(req)) { json(res, 403, { error: 'Cross-origin writes are not accepted.' }); return true; }
  if (looksAutomated(req)) { json(res, 403, { error: 'Automated writes are not accepted.' }); return true; }
  if (!rateAllow(clientIp(req))) { json(res, 429, { error: 'Too many writes — slow down a moment.' }, { 'Retry-After': '10' }); return true; }
  return false;
}

// ---------- API ----------
async function api(req, res, url) {
  // Harden every write at one place. GET/HEAD are untouched, so reading stays fully anonymous.
  if (WRITE_METHODS.has(req.method) && writeBlocked(req, res)) return;
  // url keeps its query string (handlers parse ?goal=/?ids=/?problem= from it);
  // routing uses the path portion only.
  const parts = url.split('?')[0].split('/').filter(Boolean); // ['api', ...]
  const seg = parts.slice(1);
  // public client config (works even if the DB is down, so the UI can adapt)
  if (seg[0] === 'config' && req.method === 'GET') return json(res, 200, {
    googleClientId: GOOGLE_CLIENT_ID || null,
    dbEnabled: db.enabled,
    features: {
      researchCollection: FEATURES.researchCollection,
      publicCommunity: FEATURES.publicCommunity,
      publicProfiles: FEATURES.publicProfiles,
      publicOutcomeAggregates: FEATURES.publicOutcomeAggregates,
      sharedPlans: FEATURES.sharedPlans,
    },
  });
  // lightweight lead tracking (fire-and-forget beacon) — always 204, no-ops without a DB
  if (seg[0] === 'track' && req.method === 'GET') {
    const q = new URL('http://x/' + url).searchParams;
    const e = clean(q.get('e'), 20), handle = clean(q.get('u'), 24);
    // The single easiest number on the site to fabricate: per-username, caller-chosen, no dedupe of
    // any kind, and it is the lead-gen metric shown to the expert whose booking link it counts.
    // NOTE the definition change: genuine repeat clicks by the same person inside 6h now count once,
    // which is what a click-THROUGH metric should mean anyway. Say so wherever it is displayed.
    if (db.enabled && e === 'booking' && handle && countOnce(req, 'booking', handle)) db.query('UPDATE users SET booking_clicks = booking_clicks + 1 WHERE lower(username)=lower($1)', [handle]).catch(() => {});
    res.writeHead(204); return res.end();
  }
  // Public photo proxy for user-submitted food images: serves the inline data-URL upload. (The
  // bot token is never exposed in a public URL. <img src="/api/foodphoto?id=123"> works on the website.
  if (seg[0] === 'foodphoto' && req.method === 'GET') {
    // This route sits above the generic community gate, so it MUST carry its own. Without it a
    // sequential id exposed pending/private uploads even while every community screen was off.
    if (!FEATURES.publicCommunity || !db.enabled) { res.writeHead(404); return res.end(); }
    const id = +clean(new URL('http://x/' + url).searchParams.get('id'), 12);
    if (!id) { res.writeHead(404); return res.end(); }
    try {
      const fr = (await db.query("SELECT data FROM user_foods WHERE id=$1 AND status='active'", [id])).rows[0]; const d = fr && fr.data;
      // web-uploaded photo: a data URL stored inline — decode and serve directly
      if (d && typeof d.photo_data === 'string') {
        const mm = d.photo_data.match(/^data:(image\/(?:png|jpeg|webp));base64,(.*)$/);
        if (!mm) { res.writeHead(404); return res.end(); }
        const buf = Buffer.from(mm[2], 'base64');
        res.writeHead(200, { 'Content-Type': mm[1], 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
        return res.end(buf);
      }
      // Bot photo uploads are gone with the Telegram integration (removed 2026-07-28).
      // Only web-uploaded photos (stored inline as a data URL above) are served.
      res.writeHead(404); return res.end();
    } catch (e) { res.writeHead(404); return res.end(); }
  }
  // ---- /interest — the interest-capture form (public, no account, WORKS WITH NO JAVASCRIPT) ----
  // Registered HERE, ABOVE the `if (!db.enabled) return json(res, 503, …)` on the next line, and
  // that placement is the whole point. This is a real <form method="post">, so a reader whose
  // browser does not run JavaScript NAVIGATES to whatever it returns.
  // MEASURED on the shipped code, real headless Chrome at 390x844 with JavaScript DISABLED, a
  // native form submit to the one public no-account intake endpoint this site already has:
  //     final URL  http://localhost:8099/api/clinician-interest
  //     status     503, content-type application/json
  //     body       {"error":"Accounts are not available right now."}
  // — no page, no heading, no way back, and a refresh re-posts. ~90% of this site's traffic never
  // runs JavaScript, so that IS the experience for ~90% of everyone who fills the form in.
  // Every exit below is therefore a 303 to /?state=…, which means the reader always lands
  // on a real page, a refresh cannot re-post, and endHtml() stamps `X-Robots-Tag: noindex, follow`
  // on every one of those "?" URLs automatically (see the note above endHtml).
  //
  // THE WRITE GUARD NEEDED NO CHANGE, and that was verified rather than assumed. The same measured
  // submit above carried `origin: http://localhost:8099`, a `referer`, a Chrome user-agent and
  // `content-type: application/x-www-form-urlencoded`, so sameOrigin() + looksAutomated() +
  // rateAllow() at the top of api() all pass it, and readBody() already parses that content type.
  // A bare `curl -d` still gets 403. What the chokepoint does NOT stop is a hand-forged Origin
  // header — it says so itself ("speed bump only"). The controls that bound the damage HERE are the
  // closed topic vocabulary, interestAllow()'s ten stored addresses per IP per day, and
  // UNIQUE(email), which makes a resubmit a no-op rather than another row.
  if (seg[0] === 'interest' && !seg[1] && req.method === 'POST') {
    // #answer: the answer panels sit immediately above the form, not at the top of the page, so
    // that bad / rate / down put the explanation directly above the form the reader has to use
    // again. Measured at 390x844 on the built page: it is ~4,400 px tall with the form in the last
    // section, so without the fragment a reader who has just submitted is returned to the headline
    // and has to scroll five screens to find out what happened. The target carries tabindex="-1",
    // so the browser moves FOCUS there as well as scrolling — the announcement a screen-reader user
    // needs, with no JavaScript anywhere on the path.
    const see = (q) => { res.writeHead(303, { Location: '/?' + q + '#answer', 'Cache-Control': 'no-store' }); res.end(); };
    const b = await readBody(req, 4e3);              // two questions and an address; nothing here is large
    if (!b) return see('state=bad');
    const email = clean(b.email, 160).toLowerCase();
    const topicIn = clean(b.topic, 24);
    const topic = INTEREST_TOPICS.indexOf(topicIn) >= 0 ? topicIn : null;
    // A HIDDEN FIELD IS STILL SUBMITTED. The free-text box is revealed by CSS :checked, and
    // `display:none` does not stop a control being serialised — measured in Chrome: choose
    // "Something else", type into it, change your mind and choose "Hip", and the body carries BOTH
    // `topic=hip` AND the stale words. The reader's answer is "Hip". Keep the words only when they
    // ARE the answer, rather than storing a second, contradictory answer to the same question.
    const other = topic === 'other' ? (clean(b.topic_other, 60) || null) : null;
    const creator = ['1', 'on', 'true'].indexOf(String(b.creator == null ? '' : b.creator).toLowerCase()) >= 0;
    // Carried back so the page can re-check the chip the reader already chose. The ADDRESS is
    // deliberately NOT carried back: it would sit in browser history, in the Referer of the next
    // link they click and in every access log in between, and it is the one field on the form that
    // is retyped in three seconds.
    const keep = (topic ? '&topic=' + encodeURIComponent(topic) : '') + (creator ? '&creator=1' : '');
    // The browser's own `required` + type="email" already refuse an empty field and "not an
    // address" with JavaScript off. They do NOT refuse "a@b" — measured, that submits. So this is
    // the check that matters, not a duplicate of one the browser already does.
    if (!/^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/.test(email)) return see('state=bad' + keep);
    if (!db.enabled) return see('state=down' + keep);
    if (!interestAllow(clientIp(req))) return see('state=rate' + keep);
    try {
      const r = await db.query(
        `INSERT INTO interest_signups(email, topic, topic_other, creator, remove_token)
         VALUES($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING RETURNING remove_token`,
        [email, topic, other, creator, crypto.randomBytes(24).toString('base64url')]);
      // DO NOTHING, not DO UPDATE: a second submission is answered with "you were already on the
      // list, and your first answer is the one that counts" — which is true, and is why there is no
      // second row and (later) no second email.
      if (!r.rows[0]) return see('state=dupe');
      return see('state=ok&t=' + r.rows[0].remove_token);
    } catch (e) { console.error('[interest]', e.message); return see('state=down' + keep); }
  }
  // Removal. A POST, reached from a button on GET /?state=remove&t=…, NOT a GET — a link
  // that deletes is a row an email link-scanner or a browser prefetcher can remove on the reader's
  // behalf without them ever seeing the page. The unguessable token IS the authorisation, and the
  // only thing it can do is delete the one row it belongs to.
  if (seg[0] === 'interest' && seg[1] === 'remove' && !seg[2] && req.method === 'POST') {
    const see = (q) => { res.writeHead(303, { Location: '/?' + q + '#answer', 'Cache-Control': 'no-store' }); res.end(); };
    const b = await readBody(req, 2e3) || {};
    const tok = clean(b.t, 48);
    // A malformed token, an unknown token and a token that was already used all get the SAME
    // answer, and that answer is a true sentence in every one of those cases: the address is not on
    // the list. Telling them apart would turn this URL into an oracle for probing tokens.
    if (!/^[A-Za-z0-9_-]{16,48}$/.test(tok)) return see('state=removed');
    if (!db.enabled) return see('state=down');
    try { await db.query('DELETE FROM interest_signups WHERE remove_token=$1', [tok]); }
    catch (e) { console.error('[interest remove]', e.message); return see('state=down'); }
    return see('state=removed');
  }
  // ---- POST /api/protocols/check — the Studio DRY RUN ----------------------------------------
  // Registered HERE, ABOVE the `if (!db.enabled)` line below, and that placement is the point. This
  // is the call the builder makes on every change so the reader sees a refusal WHILE assembling,
  // not after they tap Publish. It reads the corpus and writes nothing, so it has no business
  // needing a database — and "a user must not publish a dangerous pairing without it being shown"
  // cannot be true if the SHOWING goes dark whenever Postgres does. Same engine, same answer, no
  // write, no account.
  if (seg[0] === 'protocols' && seg[1] === 'check' && !seg[2] && req.method === 'POST') {
    if (!STUDIO_READY) return studioDown(res);
    if (!sameOrigin(req)) return json(res, 403, { error: 'Bad origin' });
    const b = await readBody(req, 2e5) || {};
    let v;
    try {
      v = STUDIO.validate({ spec: b.spec, base_pid: clean(b.base_pid, 64) || null, base_rcid: clean(b.base_rcid, 64) || null, publish: b.status === 'published' });
    } catch (e) { console.error('[studio check]', e.message); return studioDown(res); }
    // validate() short-circuits on a malformed spec and returns WITHOUT a `safety` key — the shape
    // refusal at studio-safety.js:225 is the live example. Reading v.safety.says unguarded turned
    // every badly-shaped request into a 500 "Server error", so the one message that tells the user
    // what is wrong with their protocol never reached them. Measured: POST with {items:[…]} instead
    // of {spec:{v:1,items:[…]}} -> TypeError: Cannot read properties of undefined (reading 'says').
    return json(res, 200, {
      ok: v.ok, refusals: v.refusals, warn: v.warn, coverage: v.coverage,
      says: v.safety ? v.safety.says : null,
      engine: v.safety ? v.safety.engine : null,
    });
  }

  if (!db.enabled) return json(res, 503, { error: 'Accounts are not available right now.' });
  const method = req.method;

  if (method !== 'GET' && !sameOrigin(req)) return json(res, 403, { error: 'Bad origin' });

  // These routes used to become public simply because a dormant table and handler existed. Keep
  // them unavailable until moderation, consent, review and deletion contracts are independently
  // approved. A 404 avoids advertising a half-launched social surface.
  const communityRoots = new Set([
    'explain', 'comments', 'votes', 'rep', 'forks', 'pulse', 'helped',
    'edits', 'proposals', 'contributors', 'protocol-contributors',
    'rootcause-changes', 'rootcause-overlay', 'foods', 'protocol-requests',
  ]);
  if (!FEATURES.publicCommunity && communityRoots.has(seg[0])) return json(res, 404, { error: 'Community is not available yet.' });
  if (!FEATURES.publicCommunity && seg[0] === 'protocols' && seg[1] === 'used') return json(res, 404, { error: 'Community is not available yet.' });
  // /api/protocols/new — THE MISSING BRIDGE (added 2026-08-13). Until now a creator could publish a
  // protocol and NOTHING on this site listed it: /api/protocols/used had no render path and no
  // caller, so "create a protocol so the next person finds it" ended nowhere. That is step 6 of the
  // founder's customer flow, and it was the only step with no code behind it at all.
  // Gated with the rest of the community surface, and it returns an EMPTY LIST rather than an error
  // when nothing is published, so the landing strip can render an honest empty state either way.
  if (!FEATURES.publicCommunity && seg[0] === 'protocols' && seg[1] === 'new') return json(res, 404, { error: 'Community is not available yet.' });
  if (!FEATURES.publicCommunity && seg[0] === 'protocols' && seg[1] === 'variants') return json(res, 404, { error: 'Community is not available yet.' });
  if (!FEATURES.publicCommunity && seg[0] === 'protocols' && seg[2] === 'like') return json(res, 404, { error: 'Community is not available yet.' });
  if (!FEATURES.publicProfiles && seg[0] === 'u') return json(res, 404, { error: 'Public profiles are not available yet.' });
  if (!FEATURES.publicOutcomeAggregates && seg[0] === 'outcomes' && seg[1] === 'public') return json(res, 404, { error: 'Public outcome aggregates are not available.' });
  if (!FEATURES.publicOutcomeAggregates && seg[0] === 'ledger') return json(res, 404, { error: 'Public outcome aggregates are not available.' });
  if (!FEATURES.sharedPlans && (seg[0] === 'share-plan' || seg[0] === 'shared-plan')) return json(res, 404, { error: 'Plan sharing is not available yet.' });
  if (!FEATURES.researchCollection && seg[0] === 'experiments') return json(res, 404, { error: 'Personal observations are not available yet.' });
  if (!FEATURES.researchCollection && seg[0] === 'admin' && ['outcomes', 'signals', 'research'].includes(seg[1])) return json(res, 404, { error: 'Research reporting is not available.' });

  // --- "Explain it back" community discussion (compound / pathway pages) ---
  if (seg[0] === 'explain') {
    const q = new URL('http://x/' + url).searchParams;
    if (method === 'GET') {
      const slug = clean(q.get('slug'), 80);
      if (!slug) return json(res, 400, { error: 'No slug' });
      const u = await currentUser(req).catch(() => null);
      const rows = (await db.query('SELECT id, parent_id, user_id, handle, body, created_at FROM explain_posts WHERE slug=$1 ORDER BY created_at ASC LIMIT 400', [slug])).rows;
      const byId = {};
      rows.forEach(r => { byId[r.id] = { id: r.id, user: r.handle || 'Someone', anon: !r.handle, mine: !!(u && r.user_id === u.id), body: r.body, ts: r.created_at, replies: [] }; });
      const top = [];
      rows.forEach(r => { const n = byId[r.id]; if (r.parent_id && byId[r.parent_id]) byId[r.parent_id].replies.push(n); else if (!r.parent_id) top.push(n); });
      top.reverse(); // newest explanations first
      return json(res, 200, { posts: top, total: rows.length, signedIn: !!u });
    }
    if (method === 'POST') {
      const b = await readBody(req, 1e4); if (!b) return json(res, 400, { error: 'Bad request' });
      const slug = clean(b.slug, 80);
      const body = String(b.body || '').replace(/\s+\n/g, '\n').trim().slice(0, 1500);
      const parentId = b.parent_id ? Math.max(0, parseInt(b.parent_id, 10)) || null : null;
      if (!slug) return json(res, 400, { error: 'No slug' });
      if (body.length < 4) return json(res, 400, { error: 'Write a little more first.' });
      const u = await currentUser(req).catch(() => null);
      // Light anti-spam. The "(or per anonymous IP burst)" half of the old comment described
      // protection that did not exist: the whole check sat inside `if (u)`, so the ONE path with no
      // account — the one that writes a public row rendered on compound and pathway pages — was the
      // only unthrottled one. Its sole limiter was the chokepoint bucket, i.e. ~900 posts/hour/IP.
      // Anonymous posts are now capped by volume rather than by IP (IP is unreliable behind
      // Railway's proxy), the same shape /api/subscribe used before it was deleted. 20/10min is well above
      // real demand — there are ~20 JS-executing sessions per day sitewide.
      if (u) {
        const rc = (await db.query("SELECT count(*)::int n FROM explain_posts WHERE user_id=$1 AND created_at > now() - interval '10 minutes'", [u.id])).rows[0];
        if (rc && rc.n >= 12) return json(res, 429, { error: 'Slow down a moment — you have posted a lot just now.' });
      } else {
        const ac = (await db.query("SELECT count(*)::int n FROM explain_posts WHERE user_id IS NULL AND created_at > now() - interval '10 minutes'")).rows[0];
        if (ac && ac.n >= 20) return json(res, 429, { error: 'A lot of anonymous posts just arrived — try again in a few minutes, or sign in to post now.' });
      }
      // parent_id was taken on trust: any integer was accepted, and notifyReply() looks the row up
      // by id alone — it never checks the parent is on the slug being replied to. So an
      // unauthenticated caller could aim a reply at ANY post id and have the server email that
      // post's author 220 attacker-chosen characters, repeatedly, from RNAwiki's own sending
      // domain. The body is htmlEsc'd, so the exposure is volume, content and sender reputation
      // rather than injection. Resolving the parent against the slug closes both that amplifier and
      // the mis-threading; `parent_id IS NULL` additionally enforces the one level of nesting the
      // renderer above actually displays.
      let parent = null;
      if (parentId) {
        parent = (await db.query('SELECT id FROM explain_posts WHERE id=$1 AND slug=$2 AND parent_id IS NULL', [parentId, slug])).rows[0] || null;
        if (!parent) return json(res, 400, { error: 'That discussion has moved — reload the page and try again.' });
      }
      const ins = (await db.query('INSERT INTO explain_posts(slug, parent_id, user_id, handle, body) VALUES($1,$2,$3,$4,$5) RETURNING id', [slug, parent ? parent.id : null, u ? u.id : null, u ? u.username : null, body])).rows[0];
      if (parent) notifyReply(parent.id, slug, u, body).catch(() => {});
      return json(res, 200, { ok: true, id: ins.id, signedIn: !!u });
    }
    return json(res, 405, { error: 'Method not allowed' });
  }

  // --- auth ---
  if (seg[0] === 'register' && method === 'POST') {
    // SECURITY (2026-07-28): password registration is closed by default. It accepted an
    // arbitrary unverified email, had no confirmation step and no password-reset path, and was
    // the entry point for the super-admin escalation above. Google sign-in (/api/auth/google)
    // remains open and still creates accounts, so signup is not blocked — only this path is.
    // Set ALLOW_PASSWORD_REGISTRATION=1 to re-open it (existing accounts can still log in).
    if (process.env.ALLOW_PASSWORD_REGISTRATION !== '1') {
      return json(res, 403, { error: 'Password sign-up is closed. Please use "Continue with Google".' });
    }
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    if (b.adultConfirmed !== true) return json(res, 400, { error: 'RNAwiki accounts are currently available only to people aged 18 or older.' });
    const username = clean(b.username, 24), email = clean(b.email, 120), password = String(b.password || '');
    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) return json(res, 400, { error: 'Username: 3–24 letters, numbers, _ . -' });
    if (password.length < 8) return json(res, 400, { error: 'Password must be at least 8 characters' });
    try {
      const r = await db.query('INSERT INTO users(username,email,pass) VALUES($1,$2,$3) RETURNING id,username,role,email', [username, email || null, hashPassword(password)]);
      const u = r.rows[0]; const token = crypto.randomBytes(24).toString('hex');
      await db.query('INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2, now()+interval \'30 days\')', [token, u.id]);
      setSessionCookie(res, token);
      return json(res, 200, { user: { id: u.id, username: u.username, role: u.role, email: u.email, is_super: isSuper(u) } });
    } catch (e) {
      if (e.code === '23505') return json(res, 409, { error: 'That username is taken' });
      console.error(e); return json(res, 500, { error: 'Server error' });
    }
  }
  if (seg[0] === 'login' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    if (b.adultConfirmed !== true) return json(res, 400, { error: 'Confirm that you are 18 or older to sign in.' });
    const username = clean(b.username, 24), password = String(b.password || '');
    const r = await db.query('SELECT id,username,email,role,pass FROM users WHERE username=$1', [username]);
    const u = r.rows[0];
    if (!u || !verifyPassword(password, u.pass)) return json(res, 401, { error: 'Wrong username or password' });
    const token = crypto.randomBytes(24).toString('hex');
    await db.query('INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2, now()+interval \'30 days\')', [token, u.id]);
    setSessionCookie(res, token);
    return json(res, 200, { user: { id: u.id, username: u.username, role: u.role, email: u.email, is_super: isSuper(u) } });
  }
  if (seg[0] === 'logout' && method === 'POST') {
    const sid = parseCookies(req).sid; if (sid) await db.query('DELETE FROM sessions WHERE token=$1', [sid]);
    res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure');
    return json(res, 200, { ok: true });
  }
  if (seg[0] === 'me' && method === 'GET') {
    const u = await currentUser(req); return json(res, 200, { user: u });
  }
  if (seg[0] === 'account' && !seg[1] && method === 'DELETE') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    const b = await readBody(req, 1024) || {};
    if (b.confirm !== 'DELETE') return json(res, 400, { error: 'Type DELETE to confirm account deletion.' });
    const participant = 'u:' + u.id;
    // Account erasure is one all-or-nothing unit. SET NULL foreign keys deliberately preserve
    // community rows during an ordinary user deletion, so every authored/public row and every
    // pseudonymous participant key must be removed explicitly here. Published Studio rows stay as
    // non-identifying tombstones because remixes may depend on their internal immutable spec.
    await db.transaction(async q => {
      await q('UPDATE explain_posts SET parent_id=NULL WHERE parent_id IN (SELECT id FROM explain_posts WHERE user_id=$1)', [u.id]);
      await q('DELETE FROM explain_posts WHERE user_id=$1', [u.id]);
      await q('DELETE FROM protocol_forks WHERE user_id=$1', [u.id]);
      await q('DELETE FROM shared_plans WHERE author_user_id=$1', [u.id]);
      await q('DELETE FROM partners WHERE submitted_by=$1', [u.id]);
      await q('DELETE FROM user_foods WHERE submitted_by=$1', [u.id]);
      await q('DELETE FROM protocol_requests WHERE submitted_by=$1', [u.id]);
      await q('DELETE FROM rootcause_changes WHERE submitted_by=$1', [u.id]);
      await q(`DELETE FROM feedback WHERE user_id=$1 OR
        ($2::text <> '' AND contact IS NOT NULL AND lower(contact)=lower($2))`, [u.id, u.email || '']);
      await q(`DELETE FROM interest_signups WHERE $1::text <> '' AND lower(email)=lower($1)`, [u.email || '']);
      await q('DELETE FROM experiments WHERE user_id=$1 OR participant=$2', [u.id, participant]);
      await q('DELETE FROM votes WHERE voter_key=$1', [participant]);
      await q('DELETE FROM fork_clones WHERE voter_key=$1', [participant]);
      await q('DELETE FROM studio_clones WHERE voter_key=$1', [participant]);
      await q('DELETE FROM helped_people WHERE voter_key=$1', [participant]);
      await q('DELETE FROM referrals WHERE participant=$1 OR referrer=$1', [participant]);
      await q("DELETE FROM studio_protocols WHERE user_id=$1 AND status='draft'", [u.id]);
      await q(`UPDATE studio_protocols SET user_id=NULL, status='withdrawn', title='Withdrawn protocol', updated_at=now()
        WHERE user_id=$1`, [u.id]);
      await q('DELETE FROM users WHERE id=$1', [u.id]);
    });
    res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure');
    return json(res, 200, { ok: true, deleted: true });
  }
  // Unified plan object (the omnichannel spine). GET returns the account's saved plan; POST saves it.
  // Anonymous users keep the plan in localStorage and merge it up here on login (client-side).
  if (seg[0] === 'plan' && method === 'GET') {
    const u = await currentUser(req); if (!u) return json(res, 200, { plan: null });
    const r = await db.query('SELECT plan FROM user_plans WHERE user_id=$1', [u.id]);
    return json(res, 200, { plan: r.rows[0] ? r.rows[0].plan : null });
  }
  if (seg[0] === 'plan' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in to save your plan' });
    const b = await readBody(req, 2e5); if (!b || typeof b.plan !== 'object') return json(res, 400, { error: 'Bad request' });
    await db.query(`INSERT INTO user_plans(user_id,plan,updated_at) VALUES($1,$2,now())
      ON CONFLICT(user_id) DO UPDATE SET plan=EXCLUDED.plan, updated_at=now()`, [u.id, JSON.stringify(b.plan)]);
    return json(res, 200, { ok: true });
  }
  // Share a built protocol to clients: mint a short code that carries the exact selections
  if (seg[0] === 'share-plan' && method === 'POST') {
    const b = await readBody(req, 2e4); const pid = clean(b && b.pid, 64), rcid = clean(b && b.rcid, 64);
    if (!pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    const u = await currentUser(req);
    const sel = (b && b.plan && typeof b.plan === 'object') ? b.plan : {};
    // Bound the CONTENT, not only the count. slice(0,100) capped how many entries were stored but
    // not how big each one was, and every entry is echoed verbatim to anyone holding the code
    // (GET /api/shared-plan) — i.e. an unauthenticated, publicly-readable arbitrary-text store:
    // one 100 KB POST bought one permanent 100 KB public blob, repeatable at the burst rate.
    // These are ids (move/compound/function slugs), so 80 chars is generous. Cleaning each element
    // also drops the non-string case, which survived Array.isArray + slice.
    const ids = (a, n) => Array.isArray(a) ? a.filter(x => typeof x === 'string').map(x => clean(x, 80)).filter(Boolean).slice(0, n) : undefined;
    const plan = { moves: ids(sel.moves, 100), supps: sel.supps === 'none' ? 'none' : ids(sel.supps, 100), functions: ids(sel.functions, 20) };
    const code = crypto.randomBytes(6).toString('base64url');
    await db.query('INSERT INTO shared_plans(code,author_user_id,pid,rcid,plan) VALUES($1,$2,$3,$4,$5)', [code, u ? u.id : null, pid, rcid, JSON.stringify(plan)]);
    return json(res, 200, { code, url: `${SITE_URL}/#/s/${code}` });
  }

  // Public cohort stat for a protocol — k-anonymised (only when >=20 people have a 30/90-day outcome).
  if (seg[0] === 'outcomes' && seg[1] === 'public' && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams; const pid = clean(q.get('pid'), 64), rcid = clean(q.get('rcid'), 64);
    if (!pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    const r = (await db.query(`SELECT COUNT(DISTINCT user_id) AS n, COUNT(DISTINCT user_id) FILTER (WHERE improvement>=1) AS better
      FROM research_outcome_checkins WHERE pid=$1 AND rcid=$2 AND phase IN ('d30','d90') AND improvement IS NOT NULL`, [pid, rcid])).rows[0];
    const n = +r.n; if (n < 20) return json(res, 200, { stat: null }); // k-anonymity floor
    return json(res, 200, { stat: { n, pct: Math.round(+r.better / n * 100) } });
  }

  // ===== Outcome-data moat: consent / profile / check-ins / markers / wearables / my-data =====
  if (seg[0] === 'consent') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    if (method === 'GET') {
      const r = await db.query(`SELECT decision AS consent_research, version, created_at AS consented_at
        FROM consent_records WHERE user_id=$1 AND purpose='research'
        ORDER BY created_at DESC, id DESC LIMIT 1`, [u.id]);
      return json(res, 200, { consent: r.rows[0] || null, version: CONSENT_VERSION, collectionEnabled: FEATURES.researchCollection });
    }
    if (method === 'POST') {
      const b = await readBody(req) || {};
      if (typeof b.research !== 'boolean') return json(res, 400, { error: 'research must be true or false.' });
      const on = b.research;
      await db.transaction(async q => {
        await q(`INSERT INTO consent_records(user_id,purpose,version,decision,source)
          VALUES($1,'research',$2,$3,'user_action')`, [u.id, CONSENT_VERSION, on]);
        await q(`INSERT INTO user_consent(user_id,consent_research,version,consented_at,withdrawn_at)
          VALUES($1,$2,$3, CASE WHEN $2 THEN now() END, CASE WHEN $2 THEN NULL ELSE now() END)
          ON CONFLICT(user_id) DO UPDATE SET consent_research=$2, version=$3,
            consented_at=CASE WHEN $2 THEN COALESCE(user_consent.consented_at, now()) ELSE user_consent.consented_at END,
            withdrawn_at=CASE WHEN $2 THEN NULL ELSE now() END`, [u.id, on, CONSENT_VERSION]);
      });
      return json(res, 200, { ok: true, research: on, collectionEnabled: FEATURES.researchCollection });
    }
  }
  // ===== THE PUBLIC PROFILE, AS A DECISION SOMEBODY MAKES (2026-08-14) =========================
  // `users.public_profile_enabled` shipped `DEFAULT false` in db.js and appeared in executable code
  // exactly twice: that DDL line, and the read in GET /api/u/:handle. NOTHING SET IT. No endpoint,
  // no admin action, no migration. So PUBLIC_PROFILES=1 was a flag that could only ever be on and
  // do nothing: every /u/<handle> would clear the feature check and then 404 at the query, for
  // every account, forever. This is the missing half.
  //
  // WHY IT IS A CONSENT RECORD AND NOT A SETTING. docs/PRODUCTION_REVAMP_STATE.md: "Consent choices
  // are append-only and include their source." A boolean column answers "is it on now"; it cannot
  // answer "did this person ever agree, and when, and to what wording" — which is the question that
  // matters if the disclosure changes, or if the flag is switched off and later back on. The two
  // sibling columns this writes (public_profile_disclosure_version, public_profile_published_at)
  // have existed unused in db.js since the schema was written, for exactly this.
  //
  // OFF IS ALWAYS ALLOWED. Turning it ON requires the capability to be enabled; turning it OFF does
  // not, and must not — otherwise rolling the environment variable back would strand every account
  // that had opted in, public in the database with no way for its owner to withdraw.
  if (seg[0] === 'profile' && seg[1] === 'public' && !seg[2] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    const b = await readBody(req, 1024) || {};
    if (typeof b.public !== 'boolean') return json(res, 400, { error: 'public must be true or false.' });
    const on = b.public;
    if (on && !FEATURES.publicProfiles) return json(res, 404, { error: 'Public profiles are not available yet.' });
    await db.transaction(async q => {
      await q(`INSERT INTO consent_records(user_id,purpose,version,decision,source)
        VALUES($1,'public_profile',$2,$3,'user_action')`, [u.id, PUBLIC_PROFILE_DISCLOSURE, on]);
      // published_at is set ONCE, on the first time it went public, and survives being switched
      // off — it records when the page first existed, which is not the same question as whether it
      // exists now.
      await q(`UPDATE users SET public_profile_enabled=$1, public_profile_disclosure_version=$2,
          public_profile_published_at = CASE WHEN $1 THEN COALESCE(public_profile_published_at, now()) ELSE public_profile_published_at END
        WHERE id=$3`, [on, PUBLIC_PROFILE_DISCLOSURE, u.id]);
    });
    return json(res, 200, { ok: true, public: on, version: PUBLIC_PROFILE_DISCLOSURE });
  }
  if (seg[0] === 'profile' && seg[1] === 'public' && !seg[2] && method === 'GET') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    const r = await db.query(`SELECT public_profile_enabled AS "public", public_profile_disclosure_version AS version
      FROM users WHERE id=$1`, [u.id]);
    const row = r.rows[0] || {};
    return json(res, 200, {
      public: !!row.public,
      version: row.version || null,
      current: PUBLIC_PROFILE_DISCLOSURE,
      available: FEATURES.publicProfiles,
      handle: u.username,
      // Printed by the client verbatim, so no surface can restate the scope in its own words.
      shows: 'Your username, the month you joined, and the protocols you chose to publish. Nothing you read, plan, log or follow.',
    });
  }
  // Opt-in daily reminder email (keystone + selected nudge tools) — service feature, no research consent needed
  if (seg[0] === 'email-reminders') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    if (method === 'GET') {
      const r = await db.query('SELECT email_nudge_hour, email_tz_offset, email_off FROM users WHERE id=$1', [u.id]);
      const row = r.rows[0] || {};
      return json(res, 200, { enabled: row.email_nudge_hour != null, hour: row.email_nudge_hour, tzOffset: row.email_tz_offset, hasEmail: !!u.email, emailReady: !!RESEND_API_KEY, emailOff: !!row.email_off });
    }
    if (method === 'POST') {
      const b = await readBody(req) || {};
      if (typeof b.allOff === 'boolean') {   // global suppress — turns every RNAwiki email off/on
        await db.query('UPDATE users SET email_off=$2 WHERE id=$1', [u.id, b.allOff]);
        return json(res, 200, { ok: true, emailOff: b.allOff });
      }
      if (!u.email) return json(res, 400, { error: 'Add an email to your account first to get reminders' });
      const on = !!b.enabled;
      const hour = on ? intOr(b.hour, 0, 23) : null;
      if (on && hour == null) return json(res, 400, { error: 'Pick an hour (0–23)' });
      const tz = intOr(b.tzOffset, -720, 840);
      await db.query('UPDATE users SET email_nudge_hour=$2, email_tz_offset=COALESCE($3, email_tz_offset) WHERE id=$1', [u.id, hour, tz]);
      return json(res, 200, { ok: true, enabled: on, hour });
    }
  }
  // `!seg[1]` added 2026-08-08. This branch matched EVERY /api/profile/* path, so after the
  // deletion of POST /api/profile/domain the old expert-application URL still answered 200 {ok:true}
  // and quietly wrote an empty demographics row. A deleted endpoint that still says yes is worse
  // than one that says no; it now falls through to the 404 at the end of this handler.
  if (seg[0] === 'profile' && !seg[1]) {
    const u = await currentUser(req); if (!u) return json(res, method === 'GET' ? 200 : 401, method === 'GET' ? { profile: null } : { error: 'Sign in' });
    if (method === 'GET') { const r = await db.query('SELECT age_band, sex, ethnicity, conditions, height_cm, meds FROM user_profile WHERE user_id=$1', [u.id]); return json(res, 200, { profile: r.rows[0] || null }); }
    if (method === 'POST') {
      if (!(await hasExplicitResearchConsent(u.id))) return json(res, 403, { error: 'Explicit research consent is required before health profile data can be stored.' });
      const b = await readBody(req) || {};
      const age = inList(b.age_band, AGE_BANDS), sex = inList(b.sex, SEXES), eth = inList(b.ethnicity, ETHNICITIES);
      const conds = Array.isArray(b.conditions) ? b.conditions.filter(c => typeof c === 'string').map(c => clean(c, 40)).slice(0, 20) : [];
      const height = intOr(b.height_cm, 80, 250);  // sane human range; null if absent
      const meds = Array.isArray(b.meds) ? b.meds.filter(x => typeof x === 'string' && x.trim()).map(x => clean(x, 60)).slice(0, 30) : [];
      await db.query(`INSERT INTO user_profile(user_id,age_band,sex,ethnicity,conditions,height_cm,meds,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,now())
        ON CONFLICT(user_id) DO UPDATE SET age_band=$2, sex=$3, ethnicity=$4, conditions=$5,
          height_cm=COALESCE($6, user_profile.height_cm), meds=$7, updated_at=now()`, [u.id, age, sex, eth, JSON.stringify(conds), height, JSON.stringify(meds)]);
      return json(res, 200, { ok: true });
    }
  }
  if (seg[0] === 'checkin') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    if (method === 'GET') { // which phases are already done for a protocol
      const q = new URL('http://x/' + url).searchParams; const pid = clean(q.get('pid'), 64), rcid = clean(q.get('rcid'), 64);
      const r = await db.query('SELECT phase FROM outcome_checkins WHERE user_id=$1 AND pid=$2 AND rcid=$3', [u.id, pid, rcid]);
      return json(res, 200, { done: r.rows.map(x => x.phase) });
    }
    if (method === 'POST') {
      if (!(await hasExplicitResearchConsent(u.id))) return json(res, 403, { error: 'Explicit research consent is required before check-in data can be stored.' });
      const b = await readBody(req) || {};
      const pid = clean(b.pid, 64), rcid = clean(b.rcid, 64), phase = inList(b.phase, CHECKIN_PHASES);
      if (!pid || !rcid || !phase) return json(res, 400, { error: 'Missing pid/rcid/phase' });
      const stop = (b.still_on === false) ? inList(b.stop_reason, STOP_REASONS) : null;   // only meaningful when they stopped
      const sideFx = clean(b.side_effects, 300) || null;
      const extra = cleanExtra(b.extra);
      await db.query(`INSERT INTO outcome_checkins(user_id,pid,rcid,phase,symptom_0_10,improvement,adherence_pct,still_on,note,stop_reason,side_effects,extra)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT(user_id,pid,rcid,phase) DO UPDATE SET symptom_0_10=$5, improvement=$6, adherence_pct=$7, still_on=$8, note=$9, stop_reason=$10, side_effects=$11, extra=$12, created_at=now()`,
        [u.id, pid, rcid, phase, intOr(b.symptom_0_10, 0, 10), intOr(b.improvement, -3, 3), intOr(b.adherence_pct, 0, 100), b.still_on == null ? null : !!b.still_on, clean(b.note, 500) || null, stop, sideFx, extra ? JSON.stringify(extra) : null]);
      return json(res, 200, { ok: true });
    }
  }
  if (seg[0] === 'markers') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    if (method === 'GET') { const r = await db.query('SELECT id, marker, value, unit, taken_on FROM blood_markers WHERE user_id=$1 ORDER BY taken_on DESC NULLS LAST, id DESC LIMIT 200', [u.id]); return json(res, 200, { markers: r.rows }); }
    if (method === 'POST') {
      if (!(await hasExplicitResearchConsent(u.id))) return json(res, 403, { error: 'Explicit research consent is required before marker data can be stored.' });
      const b = await readBody(req) || {}; const marker = inList(b.marker, BLOOD_MARKERS);
      const value = (b.value != null && Number.isFinite(+b.value)) ? +b.value : null;
      if (!marker || value == null) return json(res, 400, { error: 'Missing marker/value' });
      const taken = /^\d{4}-\d{2}-\d{2}$/.test(b.taken_on || '') ? b.taken_on : null;
      await db.query('INSERT INTO blood_markers(user_id,marker,value,unit,taken_on) VALUES($1,$2,$3,$4,$5)', [u.id, marker, value, clean(b.unit, 16) || null, taken]);
      return json(res, 200, { ok: true });
    }
  }
  if (seg[0] === 'wearable' && method === 'GET') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    const r = await db.query(`SELECT to_char(day,'YYYY-MM-DD') AS day, steps, sleep_min, resting_hr, weight_kg, waist_cm FROM wearable_daily WHERE user_id=$1 ORDER BY day DESC LIMIT 120`, [u.id]);
    return json(res, 200, { wearables: r.rows });
  }
  if (seg[0] === 'wearable' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    if (!(await hasExplicitResearchConsent(u.id))) return json(res, 403, { error: 'Explicit research consent is required before wearable data can be stored.' });
    const b = await readBody(req) || {}; const day = /^\d{4}-\d{2}-\d{2}$/.test(b.day || '') ? b.day : null; if (!day) return json(res, 400, { error: 'Bad day' });
    const waist = (b.waist_cm != null && +b.waist_cm >= 40 && +b.waist_cm <= 200) ? +b.waist_cm : null;
    await db.query(`INSERT INTO wearable_daily(user_id,day,steps,sleep_min,resting_hr,weight_kg,waist_cm,source) VALUES($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT(user_id,day) DO UPDATE SET steps=COALESCE($3,wearable_daily.steps), sleep_min=COALESCE($4,wearable_daily.sleep_min), resting_hr=COALESCE($5,wearable_daily.resting_hr), weight_kg=COALESCE($6,wearable_daily.weight_kg), waist_cm=COALESCE($7,wearable_daily.waist_cm), source=$8`,
      [u.id, day, intOr(b.steps, 0, 100000), intOr(b.sleep_min, 0, 1440), intOr(b.resting_hr, 20, 220), (b.weight_kg != null && +b.weight_kg > 0 && +b.weight_kg < 400) ? +b.weight_kg : null, waist, clean(b.source, 24) || 'manual']);
    return json(res, 200, { ok: true });
  }
  if (seg[0] === 'mydata') { // PDPA access + deletion rights over one's own research data
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in' });
    if (method === 'GET') {
      const [c, consentHistory, p, ck, bm, wd, observations, observationCheckins] = await Promise.all([
        db.query('SELECT consent_research,version,consented_at,withdrawn_at FROM user_consent WHERE user_id=$1', [u.id]),
        db.query(`SELECT purpose,version,decision,source,created_at FROM consent_records
          WHERE user_id=$1 ORDER BY created_at ASC,id ASC`, [u.id]),
        db.query('SELECT age_band,sex,ethnicity,conditions,height_cm,meds FROM user_profile WHERE user_id=$1', [u.id]),
        db.query('SELECT pid,rcid,phase,symptom_0_10,improvement,adherence_pct,still_on,note,stop_reason,side_effects,extra,created_at FROM outcome_checkins WHERE user_id=$1', [u.id]),
        db.query('SELECT marker,value,unit,taken_on FROM blood_markers WHERE user_id=$1', [u.id]),
        db.query('SELECT day,steps,sleep_min,resting_hr,weight_kg,waist_cm FROM wearable_daily WHERE user_id=$1', [u.id]),
        db.query('SELECT id,problem_id,root_cause_id,status,outcome,started_at,outcome_at FROM experiments WHERE user_id=$1 ORDER BY started_at ASC,id ASC', [u.id]),
        db.query(`SELECT c.experiment_id,c.day,c.created_at FROM experiment_checkins c
          JOIN experiments e ON e.id=c.experiment_id WHERE e.user_id=$1 ORDER BY c.day ASC,c.id ASC`, [u.id]),
      ]);
      return json(res, 200, {
        account: { username: u.username, email: u.email }, consent: c.rows[0] || null,
        consentHistory: consentHistory.rows, profile: p.rows[0] || null, checkins: ck.rows,
        markers: bm.rows, wearables: wd.rows, personalObservations: observations.rows,
        personalObservationCheckins: observationCheckins.rows,
      });
    }
    if (method === 'DELETE') { // erase research data, keep the account + their tracker
      await db.transaction(async q => {
        await q(`INSERT INTO consent_records(user_id,purpose,version,decision,source)
          VALUES($1,'research',$2,false,'data_deletion')`, [u.id, CONSENT_VERSION]);
        await q('DELETE FROM experiments WHERE user_id=$1 OR participant=$2', [u.id, 'u:' + u.id]);
        await q('DELETE FROM outcome_checkins WHERE user_id=$1', [u.id]);
        await q('DELETE FROM blood_markers WHERE user_id=$1', [u.id]);
        await q('DELETE FROM wearable_daily WHERE user_id=$1', [u.id]);
        await q('DELETE FROM user_profile WHERE user_id=$1', [u.id]);
        await q(`INSERT INTO user_consent(user_id,consent_research,version,withdrawn_at)
          VALUES($1,false,$2,now()) ON CONFLICT(user_id) DO UPDATE SET consent_research=false,
          version=$2, withdrawn_at=now()`, [u.id, CONSENT_VERSION]);
      });
      return json(res, 200, { ok: true });
    }
  }
  if (seg[0] === 'shared-plan' && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams; const code = clean(q.get('code'), 32);
    const r = await db.query('SELECT code,author_user_id,pid,rcid,plan FROM shared_plans WHERE code=$1', [code]);
    if (!r.rows[0]) return json(res, 404, { error: 'Not found' });
    // A share code is a public URL, so every preview-unfurl (WhatsApp, Telegram, Slack) and every
    // reload counted as a click. This is the number a trainer would use to judge whether sharing
    // works — instrumentation, which is what W1 exists to make trustworthy.
    if (countOnce(req, 'shareclick', code)) db.query('UPDATE shared_plans SET clicks=clicks+1 WHERE code=$1', [code]).catch(() => {});
    const row = r.rows[0]; let author = null;
    if (row.author_user_id) { try { const a = (await db.query('SELECT username FROM users WHERE id=$1', [row.author_user_id])).rows[0]; author = a ? a.username : null; } catch (e) {} }
    return json(res, 200, { pid: row.pid, rcid: row.rcid, plan: row.plan || {}, author });
  }
  // Explicit linking is deliberately a separate, authenticated action. A Google token that happens
  // to carry the same email as an unlinked password account is never proof of ownership of that
  // RNAwiki account: legacy registration did not verify email addresses.
  if (seg[0] === 'auth' && seg[1] === 'google' && seg[2] === 'link' && !seg[3] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in with your RNAwiki password before linking Google.' });
    const b = await readBody(req) || {};
    const identity = await verifyGoogleIdentity(b.credential);
    if (identity.error) return json(res, identity.status, { error: identity.error });
    if (u.google_sub && u.google_sub !== identity.sub) return json(res, 409, { error: 'This RNAwiki account is already linked to a different Google account.' });
    const owner = (await db.query('SELECT id FROM users WHERE google_sub=$1', [identity.sub])).rows[0];
    if (owner && owner.id !== u.id) return json(res, 409, { error: 'That Google account is already linked to another RNAwiki account.' });
    let emailToStore = null;
    if (!u.email && identity.email) {
      const emailOwner = (await db.query('SELECT id FROM users WHERE lower(email)=lower($1)', [identity.email])).rows[0];
      if (!emailOwner || emailOwner.id === u.id) emailToStore = identity.email;
    }
    let linked;
    try {
      linked = (await db.query(`UPDATE users SET google_sub=$1, email=COALESCE(email,$2)
        WHERE id=$3 AND (google_sub IS NULL OR google_sub=$1) RETURNING id`, [identity.sub, emailToStore, u.id])).rows[0];
    } catch (e) {
      if (e.code === '23505') return json(res, 409, { error: 'That Google account or email is already linked to another RNAwiki account.' });
      throw e;
    }
    if (!linked) return json(res, 409, { error: 'This RNAwiki account was linked elsewhere before this request completed. Reload and try again.' });
    return json(res, 200, { ok: true, user: await currentUser(req) });
  }
  if (seg[0] === 'auth' && seg[1] === 'google' && !seg[2] && method === 'POST') {
    const b = await readBody(req) || {};
    if (b.adultConfirmed !== true) return json(res, 400, { error: 'Confirm that you are 18 or older to sign in.' });
    const identity = await verifyGoogleIdentity(b.credential);
    if (identity.error) return json(res, identity.status, { error: identity.error });
    const { sub, email } = identity;
    try {
      // Sign-in resolves by Google's immutable subject only. Matching an unverified legacy email
      // returns a recoverable conflict and asks the person to authenticate that RNAwiki account;
      // this endpoint never mutates google_sub on an existing password account.
      let u = (await db.query('SELECT id,username,role,email,google_sub FROM users WHERE google_sub=$1', [sub])).rows[0];
      if (!u && email) {
        const emailOwner = (await db.query('SELECT id FROM users WHERE lower(email)=lower($1)', [email])).rows[0];
        if (emailOwner) return json(res, 409, {
          error: 'An RNAwiki account already uses this email. Sign in with its password, then link Google from your account settings.',
          code: 'explicit_link_required',
        });
      }
      if (!u) {
        let base = (email.split('@')[0] || identity.name || 'user').toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 20) || 'user';
        if (base.length < 3) base += 'user';
        let uname = base;
        for (let tries = 0; !u && tries <= 8; tries++) {
          try {
            u = (await db.query(`INSERT INTO users(username,email,google_sub) VALUES($1,$2,$3)
              RETURNING id,username,role,email,google_sub`, [uname, email || null, sub])).rows[0];
          } catch (e) {
            if (e.code !== '23505') throw e;
            // Concurrent callbacks for the same Google subject converge on the one row. An email
            // collision still requires explicit linking; only a username collision is retried.
            u = (await db.query('SELECT id,username,role,email,google_sub FROM users WHERE google_sub=$1', [sub])).rows[0];
            if (u) break;
            if (email) {
              const emailOwner = (await db.query('SELECT id FROM users WHERE lower(email)=lower($1)', [email])).rows[0];
              if (emailOwner) return json(res, 409, {
                error: 'An RNAwiki account already uses this email. Sign in with its password, then link Google from your account settings.',
                code: 'explicit_link_required',
              });
            }
            if (tries === 8) throw e;
            uname = base + Math.floor(1000 + Math.random() * 9000);
          }
        }
      }
      if (ADMIN_USER && u.username.toLowerCase() === ADMIN_USER) u.role = 'admin';
      const token = crypto.randomBytes(24).toString('hex');
      await db.query('INSERT INTO sessions(token,user_id,expires_at) VALUES($1,$2, now()+interval \'30 days\')', [token, u.id]);
      setSessionCookie(res, token);
      u.is_super = isSuper(u);
      return json(res, 200, { user: u });
    } catch (e) { console.error('[google-auth]', e.message); return json(res, 500, { error: 'Sign-in failed' }); }
  }

  // --- comments ---
  if (seg[0] === 'comments' && seg[1] === 'recent' && method === 'GET') {
    const r = await db.query('SELECT c.id,c.goal_id,c.body,c.created_at,u.username FROM comments c JOIN users u ON u.id=c.user_id ORDER BY c.created_at DESC LIMIT 8');
    return json(res, 200, { comments: r.rows });
  }
  if (seg[0] === 'comments' && method === 'GET') {
    const goal = clean(new URL('http://x/' + url).searchParams.get('goal'), 80);
    if (!goal) return json(res, 400, { error: 'goal required' });
    const r = await db.query('SELECT c.id,c.goal_id,c.body,c.created_at,u.username,c.user_id FROM comments c JOIN users u ON u.id=c.user_id WHERE c.goal_id=$1 ORDER BY c.created_at DESC LIMIT 200', [goal]);
    return json(res, 200, { comments: r.rows });
  }
  if (seg[0] === 'comments' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to comment' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const goalId = clean(b.goalId, 80), body = clean(b.body, 2000);
    if (!goalId || !body) return json(res, 400, { error: 'Write something first' });
    const r = await db.query('INSERT INTO comments(goal_id,user_id,body) VALUES($1,$2,$3) RETURNING id,goal_id,body,created_at', [goalId, u.id, body]);
    await award(u.id, 'comment', r.rows[0].id);
    return json(res, 200, { comment: Object.assign(r.rows[0], { username: u.username, user_id: u.id }) });
  }
  if (seg[0] === 'comments' && seg[1] && method === 'DELETE') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Not signed in' });
    const id = pathId(seg[1]); if (!id) return json(res, 400, { error: 'bad id' });
    await db.query('DELETE FROM comments WHERE id=$1 AND (user_id=$2 OR $3=\'admin\')', [id, u.id, u.role]);
    return json(res, 200, { ok: true });
  }

  // --- edits ---
  if (seg[0] === 'edits' && seg[1] === 'recent' && method === 'GET') {
    const r = await db.query('SELECT e.compound_id,e.compound_name,e.note,e.created_at,u.username FROM edits e JOIN users u ON u.id=e.user_id ORDER BY e.created_at DESC LIMIT 10');
    return json(res, 200, { edits: r.rows });
  }
  if (seg[0] === 'edits' && seg[1] && method === 'GET') {
    const cid = clean(seg[1], 40);
    const cur = await db.query('SELECT e.fields,e.note,e.created_at,u.username FROM edits e JOIN users u ON u.id=e.user_id WHERE e.compound_id=$1 ORDER BY e.created_at DESC LIMIT 1', [cid]);
    const hist = await db.query('SELECT e.note,e.created_at,u.username FROM edits e JOIN users u ON u.id=e.user_id WHERE e.compound_id=$1 ORDER BY e.created_at DESC LIMIT 20', [cid]);
    return json(res, 200, { current: cur.rows[0] || null, history: hist.rows });
  }
  if (seg[0] === 'edits' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to edit' });
    // 2026-08-08 · ONE ACCOUNT TYPE. The second half of this condition used to be
    // `u.domain === 'pharmacist' && u.domain_verified` — the professional tier riding on the
    // super-admin check — and the 403 body asserted a credential for a programme that does not
    // exist. site/app.js already told the reader the honest version; client and server now agree.
    // `u.role` is left alone: it is only ever 'admin' for the owner, and that is the only
    // distinction this site has.
    if (u.role !== 'admin') return json(res, 403, { error: 'Compound pages are edited by the site maintainer. Use Suggest an edit on the page to send a correction — corrections are welcome and wanted.' });
    // 6 EDITABLE fields x 6000 chars + note ~= 36 KB — the one default-cap handler that legitimately
    // exceeds the 16 KB default. Authenticated and role-gated, so a larger ceiling is acceptable.
    const b = await readBody(req, 5e4); if (!b) return json(res, 400, { error: 'Bad request' });
    const cid = clean(b.compoundId, 40); const name = clean(b.compoundName, 120);
    if (!cid || !b.fields || typeof b.fields !== 'object') return json(res, 400, { error: 'Nothing to save' });
    const fields = {};
    for (const k of EDITABLE) if (b.fields[k] != null) fields[k] = clean(b.fields[k], 6000);
    const note = clean(b.note, 200);
    const er = await db.query('INSERT INTO edits(compound_id,compound_name,user_id,fields,note) VALUES($1,$2,$3,$4,$5) RETURNING id', [cid, name, u.id, JSON.stringify(fields), note || null]);
    await award(u.id, 'edit', er.rows[0].id);
    return json(res, 200, { ok: true, by: u.username });
  }

  // --- Tier 1: frictionless community votes (no account needed) ---
  if (seg[0] === 'votes' && method === 'GET') {
    const ids = clean(new URL('http://x/' + url).searchParams.get('ids'), 500).split(',').map(s => s.trim()).filter(Boolean).slice(0, 30);
    if (!ids.length) return json(res, 200, { scores: {} });
    const r = await db.query(
      `SELECT target_id, SUM(CASE WHEN value>0 THEN 1 ELSE 0 END)::int AS up,
              SUM(CASE WHEN value<0 THEN 1 ELSE 0 END)::int AS down
       FROM votes WHERE target_id = ANY($1) GROUP BY target_id`, [ids]);
    const scores = {}; r.rows.forEach(x => scores[x.target_id] = { up: x.up, down: x.down });
    return json(res, 200, { scores });
  }
  if (seg[0] === 'votes' && method === 'POST') {
    const b = await readBody(req, 2048); if (!b) return json(res, 400, { error: 'Bad request' });
    // voter_key is server-issued ('u:<id>' or 'v:<cookie id>'), so UNIQUE(target_id,voter_key)
    // actually means one vote per person instead of one vote per string the caller invented.
    const part = await resolveParticipant(req, res);
    const targetId = clean(b.targetId, 120), voterKey = part.key;
    const value = b.value > 0 ? 1 : b.value < 0 ? -1 : 0;
    if (!targetId || !voterKey) return json(res, 400, { error: 'Missing vote' });
    if (value === 0) { // toggle off
      await db.query('DELETE FROM votes WHERE target_id=$1 AND voter_key=$2', [targetId, voterKey]);
    } else {
      await db.query(`INSERT INTO votes(target_id,voter_key,value) VALUES($1,$2,$3)
        ON CONFLICT (target_id,voter_key) DO UPDATE SET value=$3, created_at=now()`, [targetId, voterKey, value]);
    }
    const r = await db.query(`SELECT SUM(CASE WHEN value>0 THEN 1 ELSE 0 END)::int AS up,
      SUM(CASE WHEN value<0 THEN 1 ELSE 0 END)::int AS down FROM votes WHERE target_id=$1`, [targetId]);
    // reputation: a signed-in voter earns points once per target (idempotent)
    if (value !== 0) { const vu = await currentUser(req); if (vu) await award(vu.id, 'vote', targetId); }
    return json(res, 200, { score: { up: r.rows[0].up || 0, down: r.rows[0].down || 0 } });
  }

  // POST /api/profile/domain REMOVED 2026-08-08 — ONE ACCOUNT TYPE.
  // It let any signed-in account apply to become a second, higher kind of account: it wrote
  // requested_domain, a free-text credential and a backlink, and set application_status='pending'.
  // Its own error copy said "that link exchange is how I verify experts" — a verification
  // programme that does not exist and that /corrections publishes as a past mistake.
  // api.setDomain in site/app.js had ZERO call sites, so nothing in a browser could reach it; a
  // signed-in curl could. There is now no way for an account to ask to become a different kind of
  // account, which is the point.
  // The users.domain / domain_verified / credential / requested_domain / application_status /
  // role_backlink columns are deliberately left in db.js: dropping a column is irreversible and
  // every one of them is null or false today. Drop them in a later, deliberate commit.
  // The "update your public socials / booking link" writer was REMOVED 2026-08-10, and it was
  // DEAD TWICE OVER. Both deaths are recorded because each is a pattern this repo has been bitten
  // by before:
  //   1. UNREACHABLE ON THE SERVER. `if (seg[0] === 'profile' && !seg[1])` — the demographics
  //      branch ~250 lines above — matches the identical path, handles POST and RETURNS. This
  //      branch could never run. (Verified by reading the if/return chain; it could not be
  //      exercised locally because db.enabled is false with no DATABASE_URL.)
  //   2. UNREACHABLE IN THE BROWSER. site/app.js defined `saveProfile` TWICE in one object
  //      literal — the socials one, then the demographics one ~75 lines later — and in a JS object
  //      literal the later key wins. All three call sites send demographics.
  // So users.socials is {} on every row and always was. It carried `booking_link`, lead-gen
  // plumbing for the professional tier abolished on 2026-08-08, and GET /api/u/:handle was still
  // PUBLISHING it — an Instagram handle beside somebody's health protocols. A public field nothing
  // can fill is a public field waiting to be filled, and a signed-in curl could still fill this one
  // if the shadowing above it were ever removed.
  // The users.socials COLUMN stays in db.js: dropping a column is irreversible and this repo
  // applies that discipline deliberately (see newsletter_subscribers, telegram_*). Drop it by hand
  // once this has shipped and nothing 500s.
  // --- reputation: client-driven awards (login required, daily-idempotent) ---
  if (seg[0] === 'rep' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    const b = await readBody(req) || {};
    const kind = clean(b.kind, 20);
    if (kind !== 'food_log' && kind !== 'share') return json(res, 400, { error: 'unknown action' });
    const day = new Date().toISOString().slice(0, 10); // once per day per kind
    await award(u.id, kind, day);
    const rp = (await db.query('SELECT reputation_points FROM users WHERE id=$1', [u.id])).rows[0];
    return json(res, 200, { ok: true, reputation_points: rp ? rp.reputation_points : 0 });
  }
  // --- public profile: ONLY what this account deliberately published. Not a portfolio, not a
  // credential, and not a profession — one account type. ---
  if (seg[0] === 'u' && seg[1] && method === 'GET') {
    const handle = clean(seg[1], 24);
    // Fail closed for legacy accounts. A username, an account, and even a published protocol do
    // not constitute consent to a public identity page; only the explicit profile-publication
    // decision can satisfy this query.
    const ur = await db.query(`SELECT id,username,created_at FROM users
      WHERE lower(username)=lower($1) AND public_profile_enabled=true`, [handle]);
    const uu = ur.rows[0];
    if (!uu) return json(res, 404, { error: 'No such user' });
    // ---- WHAT A STRANGER MAY SEE, AND WHY EACH ONE IS ON THE LIST (2026-08-10) -----------------
    //   username    the handle THEY chose. RNAwiki asks for no real name anywhere and holds no
    //               photograph — there is no avatar/photo/real-name column in users, and
    //               assertProfileDisclosesOnlyPublished() in build/parse.js keeps it that way.
    //   joined      the MONTH, never the day. A join date to the day is a correlation key against
    //               everything else somebody signed up to that afternoon.
    //   published   the protocols this account PUBLISHED. Publishing is the one deliberately
    //               public act an account can perform here: it needs an account, and the publish
    //               sheet in site/app.js itemises what becomes public before the tap. A DRAFT IS
    //               NEVER LISTED, and neither is a withdrawn one.
    //   clones      how many people STARTED each one. "MOST USED", never "works best" — nothing
    //               on this site measures how well anything worked and no column here could.
    //
    // ---- WHAT IS DELIBERATELY GONE. THIS IS THE POINT OF THE ENDPOINT. -------------------------
    //   reputation_points / socials / badges — all three were still on the wire into a page that
    //     had already been deleted.
    //     · badges is [] on every row (addBadge() was deleted 2026-08-08).
    //     · socials is {} on every row AND CAN NEVER BE ANYTHING ELSE — the writer that filled it
    //       was unreachable twice over (see the note where it used to be, below). It carried
    //       `booking_link`, lead-gen plumbing for the professional tier abolished 2026-08-08, and
    //       an Instagram handle printed beside somebody's health protocols is a de-anonymisation
    //       key. A public field nothing can fill is a public field waiting to be filled.
    //     · reputation_points is a ledger of self-reported taps: POST /api/rep accepts kind ∈
    //       {food_log, share} and nothing else, because PHASE2 is false. Publishing a score built
    //       from "I tapped a button today" as standing, to an audience of three accounts, is a
    //       status fiction. It stays in the database and comes off the wire.
    //   counts / accepted — proposal, edit and comment counts. Proposals and edits cannot be
    //     created at all while PHASE2 is false; comments can, on a GOAL page, and "3 comments on
    //     Lose fat" under a handle is a disclosure the commenter never agreed to publish here.
    //   profile_views — the UPDATE goes with the payload. The comment it replaces says the number
    //     was bot-dominated, and a counter nothing renders is a write with no reader.
    //
    // ---- AND NOTHING THIS ACCOUNT FOLLOWS. THERE IS NO FIELD FOR IT TO APPEAR IN. --------------
    // A plan, a 7-day log and a clone are the three ways somebody follows a protocol here. The
    // first two never leave the device (PLAN_KEY / TRACK_KEY in localStorage) and the third is
    // keyed to an anonymous browser key in studio_clones(code, voter_key) — no user_id — so "which
    // protocols does @alice follow" is not merely unrendered, it is not answerable in SQL. Keep it
    // that way. "@alice follows the herpes protocol" is a health disclosure about a named person.
    // DO NOT ADD ONE BEHIND A TOGGLE: a toggle is a thing somebody flips before they understand
    // what it publishes, and the person who flips it is the person least able to afford the leak.
    const pub = await db.query(`SELECT code,title,base_pid,base_rcid,clones,published_at FROM studio_protocols
      WHERE user_id=$1 AND status='published' ORDER BY published_at DESC LIMIT 50`, [uu.id]);
    return json(res, 200, {
      user: {
        username: uu.username,
        joined: uu.created_at ? new Date(uu.created_at).toISOString().slice(0, 7) : null,
      },
      // AN ALLOWLIST IMPLEMENTED AS A SPREAD IS NOT AN ALLOWLIST (2026-08-14). This was
      // `Object.assign({}, p, {title})`, which put base_pid, base_rcid and a full-precision
      // `published_at TIMESTAMPTZ` on the public wire — while `joined` two lines above is truncated
      // to the MONTH precisely because a date-to-the-day is a correlation key. site/app.js renders
      // none of the three, so it was disclosure with no reader. The gate that guards this payload
      // (assertProfileDisclosesOnlyPublished) bans seven column names it already knows about, so a
      // new column added to the SELECT would have reached the wire silently. Named fields only.
      published: pub.rows.map((p) => ({
        code: p.code,
        title: publicProtocolTitle(p.base_pid, p.base_rcid),
        clones: p.clones || 0,
      })),
      clonesMean: 'How many people started it. Not how well it worked — nothing here measures that.',
      shows: 'Only what this account published on purpose. Nothing it reads, plans, logs or follows.',
    });
  }
  // The three /api/steward endpoints (GET /api/steward, POST /api/steward/adopt,
  // POST /api/steward/release) were REMOVED 2026-08-08 — ONE ACCOUNT TYPE.
  // Stewardship let one account "own" a protocol page and put their clinic and booking link on
  // top of it, and it was gated on `if (!u.domain_verified)` — the flag that can no longer be
  // granted at all. A protocol belongs to no one; site/app.js has said exactly that in a comment
  // since July while this file served the opposite. api.steward, api.adoptProtocol and
  // api.releaseProtocol all had ZERO call sites, so no reader could reach these; a signed-in curl
  // could, and /api/steward (GET) needed no account whatsoever.
  // The `stewardships` table is left in db.js for now. Once this has shipped and nothing 500s,
  // remove its CREATE so a fresh database never has it and DROP it by hand — the discipline
  // db.js already applies to newsletter_subscribers and telegram_*.
  // --- local partners (backlink-verified lead-gen) ---
  if (seg[0] === 'partners' && method === 'GET') {
    const cat = clean(new URL('http://x/' + url).searchParams.get('category'), 60);
    const r = cat
      ? await db.query("SELECT name,type,location,link,serves FROM partners WHERE status='active' AND serves=$1 ORDER BY created_at DESC LIMIT 6", [cat])
      : await db.query("SELECT name,type,location,link,serves FROM partners WHERE status='active' ORDER BY created_at DESC LIMIT 30");
    return json(res, 200, { partners: r.rows });
  }
  if (seg[0] === 'partners' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const name = clean(b.name, 80), type = clean(b.type, 20), location = clean(b.location, 60);
    const link = safeUrl(b.link), backlink = safeUrl(b.backlink_url), serves = clean(b.serves, 60);
    if (!name || !link || !backlink) return json(res, 400, { error: 'Business name, your website, and the page where you linked to RNAwiki are all required.' });
    if (!/rnawiki\.com|rnawiki\.ai|rna-wiki\.com/i.test(backlink)) return json(res, 400, { error: 'The backlink page must link to rnawiki.com — that link exchange is how listings stay free.' });
    const u = await currentUser(req);
    const r = await db.query('INSERT INTO partners(name,type,location,link,backlink_url,serves,submitted_by) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [name, type || null, location || null, link, backlink, serves || null, u ? u.id : null]);
    return json(res, 200, { ok: true, id: r.rows[0].id, status: 'pending' });
  }
  // --- crowdsourced local foods (anyone submits; a verified dietitian verifies) ---
  if (seg[0] === 'foods' && !seg[1] && method === 'GET') {
    const r = await db.query("SELECT id,name,serving,data FROM user_foods WHERE status='active' ORDER BY created_at DESC LIMIT 500");
    // Strip the heavy photo data URL from the bulk list (served lazily via /api/foodphoto); keep a light `photo` flag.
    const foods = r.rows.map(f => { const d = Object.assign({}, f.data); const has = !!(d.photo_data || d.photo_file_id); delete d.photo_data; delete d.photo_file_id; if (has) d.photo = 1; return { id: f.id, name: f.name, serving: f.serving, data: d }; });
    return json(res, 200, { foods });
  }
  if (seg[0] === 'foods' && seg[1] === 'pending' && method === 'GET') {
    const u = await currentUser(req); if (!u || u.role !== 'admin') return json(res, 403, { error: 'The food queue is not enabled for this account.' });
    const r = await db.query("SELECT f.id,f.name,f.serving,f.data,f.created_at,uu.username AS by FROM user_foods f LEFT JOIN users uu ON uu.id=f.submitted_by WHERE f.status='pending' ORDER BY f.created_at ASC LIMIT 100");
    return json(res, 200, { foods: r.rows });
  }
  if (seg[0] === 'foods' && !seg[1] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to add a food' });
    // 8e4, sized from a MEASUREMENT rather than from the 400000 literal below. app.js's own
    // resizeImage(file, 256) is the only producer of photo_data; driven in Chrome against a
    // worst-case 4032x3024 pure-noise photo (JPEG-incompressible) it emits a 35,131-char data URL.
    // 8e4 is >2x that, plus the ~30 numeric nutrient fields. This handler must NOT take the 1.6e4
    // default — that would reject every photo upload with a bare 'Bad request'.
    const b = await readBody(req, 8e4); if (!b) return json(res, 400, { error: 'Bad request' });
    const name = clean(b.name, 80), serving = clean(b.serving, 60);
    if (!name) return json(res, 400, { error: 'Food name is required' });
    const num = (x) => (x === 0 || x) && isFinite(x) ? Number(x) : null;
    const data = { kcal: num(b.kcal), protein_g: num(b.protein_g), carbs_g: num(b.carbs_g), sugar_g: num(b.sugar_g), fat_g: num(b.fat_g), fiber_g: num(b.fiber_g) };
    // optional micronutrients — the SAME 17-field model as foods.json and the Telegram bot (allowlist)
    const MICROS = ['sodium_mg', 'potassium_mg', 'calcium_mg', 'magnesium_mg', 'iron_mg', 'zinc_mg', 'vitamin_c_mg', 'vitamin_d_iu', 'omega3_mg', 'choline_mg', 'glycine_g'];
    MICROS.forEach((k) => { const val = num(b[k]); if (val != null) data[k] = val; });
    // optional photo — a small client-resized data URL; capped so it can't bloat the row.
    // 60000, was 400000. The 400 KB allowance never described anything real: the only producer is
    // app.js resizeImage(file, 256), measured at 35,131 chars on a worst-case 12 MP noise photo,
    // so the old literal was 11x larger than the largest payload the client can emit and admitted
    // 365 KB of anything-else straight into the row's JSONB.
    const photo = typeof b.photo_data === 'string' && /^data:image\/(png|jpe?g|webp);base64,/.test(b.photo_data) && b.photo_data.length < 60000 ? b.photo_data : null;
    if (photo) data.photo_data = photo;
    // a correction to an existing food carries its id — once approved it overrides that food
    const corrects = clean(b.corrects, 40); if (corrects) data.corrects = corrects;
    // Every user submission is pending. A new food is still a nutrition claim and an uploaded
    // photo; "not a correction" is not a review state.
    const status = 'pending';
    const r = await db.query('INSERT INTO user_foods(name,serving,data,submitted_by,status) VALUES($1,$2,$3,$4,$5) RETURNING id', [name, serving || null, JSON.stringify(data), u.id, status]);
    await award(u.id, 'food_submit', 'food:' + r.rows[0].id, 20);
    return json(res, 200, { ok: true, id: r.rows[0].id, status });
  }
  // --- "request a protocol" board ---
  if (seg[0] === 'protocol-requests' && !seg[1] && method === 'GET') {
    const r = await db.query("SELECT id,request,detail,votes,status,created_at FROM protocol_requests WHERE status IN ('open','building') ORDER BY votes DESC, created_at DESC LIMIT 60");
    return json(res, 200, { requests: r.rows });
  }
  if (seg[0] === 'protocol-requests' && !seg[1] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to request a protocol' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const request = clean(b.request, 120), detail = clean(b.detail, 1000);
    if (!request) return json(res, 400, { error: 'Describe the problem or goal you want a protocol for' });
    const r = await db.query('INSERT INTO protocol_requests(request,detail,submitted_by) VALUES($1,$2,$3) RETURNING id', [request, detail || null, u.id]);
    await award(u.id, 'request', 'req:' + r.rows[0].id, 5);
    return json(res, 200, { ok: true, id: r.rows[0].id });
  }
  if (seg[0] === 'protocol-requests' && seg[1] && seg[2] === 'vote' && method === 'POST') {
    await readBody(req, 512); const id = pathId(seg[1]);
    const part = await resolveParticipant(req, res); const voterKey = part.key;
    if (!voterKey || !id) return json(res, 400, { error: 'Missing vote' });
    const ins = await db.query("INSERT INTO votes(target_id,voter_key,value) VALUES($1,$2,1) ON CONFLICT (target_id,voter_key) DO NOTHING RETURNING id", ['req:' + id, voterKey]);
    if (ins.rows[0]) await db.query('UPDATE protocol_requests SET votes=votes+1 WHERE id=$1', [id]);
    const r = await db.query('SELECT votes FROM protocol_requests WHERE id=$1', [id]);
    return json(res, 200, { votes: r.rows[0] ? r.rows[0].votes : 0 });
  }
  if (seg[0] === 'admin' && seg[1] === 'requests' && seg[2] && method === 'POST') {
    const u = await currentUser(req); if (!u || u.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const id = pathId(seg[2]); const b = await readBody(req) || {};
    const status = ['open', 'building', 'done', 'declined'].includes(b.status) ? b.status : 'open';
    await db.query('UPDATE protocol_requests SET status=$1 WHERE id=$2', [status, id]);
    return json(res, 200, { ok: true });
  }
  // ===== THE PROTOCOL STUDIO (W7, 2026-08-09) ================================================
  // Everything here goes through STUDIO.validate() — the same five rules the build enforces over
  // the authored corpus, run again over a row the build will never see. The dry-run twin of this
  // (POST /api/protocols/check) is registered further up, above the database guard, so the reader
  // is shown a refusal while assembling even when Postgres is down.
  //
  // ANONYMOUS BUILD AND SAVE, AN ACCOUNT ONLY TO PUBLISH. Reading, assembling, saving a draft and
  // running a protocol all work with no account. Publishing puts a name and a date on a document
  // other people will read, and "built by nobody" is the fabricated-account defect.
  // ---- THE AVATAR (2026-08-13) ---------------------------------------------------------------
  // Cosmetics only, and they exist on ONE surface: the reader's own profile. See
  // assertGamificationConfinement() in build/prerender.js, which fails the build if a point, a
  // balance or an avatar token appears in any protocol, problem or compound document. That gate is
  // the actual product decision here — the cosmetics themselves are deliberately small.
  //
  // SPENDING DOES NOT REDUCE YOUR STANDING. `reputation_points` is a lifetime record of what you
  // contributed and it never goes down; `avatar_spent` is a separate counter, and the balance is
  // the difference. Buying a colour must not erase the fact that you fixed something.
  if (seg[0] === 'avatar' && !seg[1] && method === 'GET') {
    const u = await currentUser(req);
    if (!u) return json(res, 401, { error: 'Sign in to see your avatar.' });
    return json(res, 200, avatarState(u));
  }
  if (seg[0] === 'avatar' && !seg[1] && method === 'POST') {
    const u = await currentUser(req);
    if (!u) return json(res, 401, { error: 'Sign in first.' });
    // `b` WAS NEVER DECLARED HERE (fixed 2026-08-14). Every other POST branch in this function
    // reads its own body — `const b = await readBody(req, …)` — and this one, added with the avatar
    // shop on 2026-08-13, referenced `b.item` without one. `b` is not in scope in api(): the only
    // other declarations are block-scoped `const b` inside sibling branches and a `let b` inside
    // rateAllow(). So the reference threw and EVERY purchase answered 500, from the hour the shop
    // shipped. It was invisible because the client swallows a failed buy into a toast and the
    // reader assumes they cannot afford it.
    const b = await readBody(req, 1024) || {};
    const want = clean(String(b.item || ''), 32);
    const item = AVATAR_ITEMS.find((x) => x.id === want);
    if (!item) return json(res, 400, { error: 'No such item.' });
    const st = avatarState(u);
    const owned = st.owned.indexOf(item.id) >= 0;
    if (!owned && st.balance < item.cost) {
      return json(res, 422, { error: `That costs ${item.cost} points and you have ${st.balance}. Points come from things other people found useful — see your profile for where yours came from.` });
    }
    const nextOwned = owned ? st.owned : st.owned.concat([item.id]);
    const nextSpent = owned ? (u.avatar_spent || 0) : (u.avatar_spent || 0) + item.cost;
    const av = Object.assign({}, st.avatar, { [item.slot]: item.id });
    try {
      await db.query('UPDATE users SET avatar=$1, avatar_owned=$2, avatar_spent=$3 WHERE id=$4',
        [JSON.stringify(av), JSON.stringify(nextOwned), nextSpent, u.id]);
    } catch (e) { console.error('[avatar]', e.message); return json(res, 500, { error: 'Could not save that.' }); }
    const fresh = await currentUser(req);
    return json(res, 200, avatarState(fresh || u));
  }

  // ---- CREATOR VARIANTS FOR ONE ROOT CAUSE (2026-08-13) --------------------------------------
  // The founder's requirement: "When a user searches /protocol/chronic-fatigue/iron-anemia and
  // multiple creators have made overlapping protocols, the route must resolve to a comparison view.
  // Default to the highest-liked protocol. Show alternative creator versions in a secondary rail
  // with: Creator Handle, Like Count, and Reputation."
  //
  // ORDERED BY likes DESC, published_at DESC — the "default to the highest-liked" clause, done in
  // the index (idx_studio_variants) rather than in the client, so the default cannot drift between
  // the two documents.
  //
  // WHAT A LIKE COUNTS, AND WHAT IT MUST NEVER BE READ AS. It counts people who found a WRITE-UP
  // useful. It is not an outcome, and there is no outcome column in studio_protocols — see the
  // comment on protocol_likes in db.js. Every surface that prints this number has to say what it
  // counts, because "highest-liked protocol" one word short of its meaning becomes "the one that
  // works best", which at this sample size is noise and in Singapore is a health claim.
  if (seg[0] === 'protocols' && seg[1] === 'variants' && !seg[2] && method === 'GET') {
    if (!db.enabled) return json(res, 200, { variants: [] });
    // `qp` DID NOT EXIST IN THIS SCOPE (fixed 2026-08-14). It is declared in serveStatic(), a
    // different function; api() has none, and every other handler here reads its query with
    // `new URL('http://x/' + url).searchParams`. So this line threw a ReferenceError and the
    // endpoint answered 500 to every caller — from the hour it was written. It was invisible for
    // the same reason the avatar defect was: the route 404s behind PUBLIC_COMMUNITY, so no test and
    // no reader could reach the body, and the browser suite runs with no Postgres, which returns
    // 503 above this line. It surfaced within a minute of the flag going on in production.
    const qp = new URL('http://x/' + url).searchParams;
    const pid = clean(qp.get('pid') || '', 64), rcid = clean(qp.get('rcid') || '', 64);
    if (!pid || !rcid) return json(res, 400, { error: 'pid and rcid are required' });
    try {
      // ---- TWO THINGS LEFT THIS PAYLOAD ON 2026-08-14 -----------------------------------------
      // `u.reputation_points AS rep`. The rail rendered it as "N points from contributing" on all
      // 52 protocol pages — a lifetime score beside the thing a reader is choosing to put in their
      // body. assertGamificationConfinement() keeps points off every prerendered health document;
      // this arrived in the HYDRATED one, through an endpoint, and so walked around the gate.
      //
      // `p.title`, the RAW STORED COLUMN. Every other public projection re-derives the title
      // through publicProtocolTitle() from the governed problem and root cause — /used:2201,
      // /mine:2222, the profile:1921, the read-one branch:2284. This one returned whatever string
      // is in the row. Today no path publishes a row without rewriting its title at INSERT, so
      // nothing leaks yet; the state doc's rule is nonetheless "their stored custom titles are
      // never returned on public surfaces", and one draft-to-publish UPDATE would have made this
      // the surface that broke it. base_pid/base_rcid are already selected, so the fix is free.
      const r = await db.query(`SELECT p.code, p.base_pid, p.base_rcid, p.likes, p.clones, p.published_at,
          u.username AS handle
        FROM studio_protocols p LEFT JOIN users u ON u.id = p.user_id
        WHERE p.base_pid=$1 AND p.base_rcid=$2 AND p.status='published'
        ORDER BY p.likes DESC, p.published_at DESC LIMIT 12`, [pid, rcid]);
      return json(res, 200, { variants: r.rows.map((x) => ({
        code: x.code, title: publicProtocolTitle(x.base_pid, x.base_rcid),
        likes: x.likes || 0, clones: x.clones || 0,
        handle: x.handle || null, at: x.published_at,
      })) });
    } catch (e) { console.error('[protocols/variants]', e.message); return json(res, 200, { variants: [] }); }
  }

  // One like per browser per protocol. UNIQUE(code, voter_key) is what makes the counter honest —
  // re-tapping cannot inflate it, and no account is needed to like, the same contract cloning has.
  if (seg[0] === 'protocols' && seg[1] && seg[2] === 'like' && method === 'POST') {
    if (!db.enabled) return json(res, 503, { error: 'Not available.' });
    const code = clean(seg[1], 16);
    // The same anonymous participant cookie the 7-day logger and studio_clones use — resolved
    // through resolveParticipant(), not invented here, so one browser is one identity everywhere.
    const part = await resolveParticipant(req, res);
    try {
      const ins = await db.query('INSERT INTO protocol_likes(code,voter_key) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING id', [code, part.key]);
      if (ins.rows.length) await db.query('UPDATE studio_protocols SET likes = likes + 1 WHERE code=$1', [code]);
      const r = await db.query('SELECT likes FROM studio_protocols WHERE code=$1', [code]);
      if (!r.rows.length) return json(res, 404, { error: 'No such protocol' });
      return json(res, 200, { likes: r.rows[0].likes || 0, counted: ins.rows.length > 0 });
    } catch (e) { console.error('[protocols/like]', e.message); return json(res, 500, { error: 'Could not record that.' }); }
  }

  // Recently published protocols, newest first. Reads only what a public projection may carry: the
  // code, the governed title, what it is built on, its like count and its author's handle. No spec,
  // no note, no user id — the same allowlist discipline the profile projection uses.
  if (seg[0] === 'protocols' && seg[1] === 'new' && !seg[2] && method === 'GET') {
    if (!db.enabled) return json(res, 200, { protocols: [] });
    const qp = new URL('http://x/' + url).searchParams;   // see the note in /variants above
    const lim = Math.min(12, Math.max(1, parseInt(qp.get('limit') || '6', 10) || 6));
    try {
      // p.title is NOT selected: the comment above says "the governed title" and this returned the
      // raw stored column, the same defect /api/protocols/variants carried. Every other public
      // projection derives it through publicProtocolTitle(), and now so does this one.
      const r = await db.query(`SELECT p.code, p.base_pid, p.base_rcid, p.likes, p.published_at,
          u.username AS handle
        FROM studio_protocols p LEFT JOIN users u ON u.id = p.user_id
        WHERE p.status='published' ORDER BY p.published_at DESC LIMIT $1`, [lim]);
      return json(res, 200, { protocols: r.rows.map((x) => ({
        code: x.code, title: publicProtocolTitle(x.base_pid, x.base_rcid),
        pid: x.base_pid, rcid: x.base_rcid,
        likes: x.likes || 0, handle: x.handle || null, at: x.published_at,
      })) });
    } catch (e) { console.error('[protocols/new]', e.message); return json(res, 200, { protocols: [] }); }
  }

  if (seg[0] === 'protocols' && !seg[1] && method === 'POST') {
    if (!STUDIO_READY) return studioDown(res);
    const u = await currentUser(req);
    const b = await readBody(req, 2e5); if (!b) return json(res, 400, { error: 'Bad request' });
    const publish = b.status === 'published';
    const draftTitle = clean(b.title, 90);
    if (!publish && !draftTitle) return json(res, 400, { error: 'Name your private draft' });
    if (publish && !u) return json(res, 401, { error: 'Publishing puts your name on it, so publishing needs an account. Building one, saving it and running it do not.' });
    let v;
    try { v = STUDIO.validate({ spec: b.spec, base_pid: clean(b.base_pid, 64) || null, base_rcid: clean(b.base_rcid, 64) || null, publish }); }
    catch (e) { console.error('[studio save]', e.message); return studioDown(res); }
    // The 422 body carries the ENGINE'S OWN text and nothing the caller sent, so the client cannot
    // dress a refusal up in a friendlier sentence and it cannot become a reflected-content sink.
    if (!v.ok) return json(res, 422, { error: 'This protocol was not saved.', refusals: v.refusals, warn: v.warn, coverage: v.coverage, says: v.safety.says });
    const code = studioCode();
    const title = publish ? publicProtocolTitle(v.base_pid, v.base_rcid) : draftTitle;
    await db.query(`INSERT INTO studio_protocols(code,user_id,parent_code,depth,base_pid,base_rcid,title,spec,safety,status,published_at)
      VALUES($1,$2,NULL,0,$3,$4,$5,$6,$7,$8,$9)`,
    [code, u ? u.id : null, v.base_pid, v.base_rcid, title, JSON.stringify(v.spec), JSON.stringify(v.safety),
      publish ? 'published' : 'draft', publish ? new Date() : null]);
    return json(res, 200, { code, url: `${SITE_URL}/p/${code}`, status: publish ? 'published' : 'draft', warn: v.warn, coverage: v.coverage, says: v.safety.says });
  }
  // A REMIX STORES ONLY ITS DIFFERENCES. The client sends the resolved spec it edited; the server
  // diffs it against the resolved PARENT and stores the patch. The diff happens here and not in the
  // browser deliberately: a remix tab can sit open for an hour while its parent changes, and only
  // the server can diff against what the parent is now.
  if (seg[0] === 'protocols' && seg[1] && seg[2] === 'remix' && method === 'POST') {
    if (!STUDIO_READY) return studioDown(res);
    const u = await currentUser(req);
    const b = await readBody(req, 2e5); if (!b) return json(res, 400, { error: 'Bad request' });
    const parent = (await db.query("SELECT * FROM studio_protocols WHERE code=$1 AND status='published'", [clean(seg[1], 16)])).rows[0];
    if (!parent) return json(res, 404, { error: 'No such protocol' });
    if (parent.depth >= STUDIO.MAX_DEPTH) return json(res, 422, { error: `This remix chain is already ${STUDIO.MAX_DEPTH} deep. Start a fresh protocol instead — past that, nobody can tell what changed from what.` });
    const base = await STUDIO.resolve(parent, (c) => db.query('SELECT * FROM studio_protocols WHERE code=$1', [c]).then(r => r.rows[0]));
    if (!base.ok) return json(res, 422, { error: base.error });
    const publish = b.status === 'published';
    if (publish && !u) return json(res, 401, { error: 'Publishing puts your name on it, so publishing needs an account.' });
    // Validated as the FULLY RESOLVED protocol, not as the patch. A change that is harmless on its
    // own can resolve into a danger pairing with something it inherited.
    let v;
    try { v = STUDIO.validate({ spec: b.spec, base_pid: parent.base_pid, base_rcid: parent.base_rcid, publish }); }
    catch (e) { console.error('[studio remix]', e.message); return studioDown(res); }
    if (!v.ok) return json(res, 422, { error: 'This remix was not saved.', refusals: v.refusals, warn: v.warn, coverage: v.coverage, says: v.safety.says });
    const patch = STUDIO.diff(base.spec, v.spec);
    const code = studioCode();
    const title = publish ? publicProtocolTitle(parent.base_pid, parent.base_rcid)
      : (clean(b.title, 90) || ('Remix of ' + parent.title));
    await db.query(`INSERT INTO studio_protocols(code,user_id,parent_code,depth,base_pid,base_rcid,title,spec,safety,status,published_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [code, u ? u.id : null, parent.code, parent.depth + 1, parent.base_pid, parent.base_rcid,
      title, JSON.stringify(patch), JSON.stringify(v.safety),
      publish ? 'published' : 'draft', publish ? new Date() : null]);
    return json(res, 200, { code, url: `${SITE_URL}/p/${code}`, storedBytes: JSON.stringify(patch).length, warn: v.warn, coverage: v.coverage, says: v.safety.says });
  }
  // MOST USED. Never "works best". Sorted by clone count, which counts whether people STARTED it.
  // `means` travels with the list so no surface can relabel it on its own.
  if (seg[0] === 'protocols' && seg[1] === 'used' && !seg[2] && method === 'GET') {
    // Named fields, not a spread, for the same reason as the profile projection above: p.title is
    // the raw stored column and was travelling under the derived one.
    const r = await db.query(`SELECT p.code,p.base_pid,p.base_rcid,p.clones,p.published_at,u.username AS by_user
      FROM studio_protocols p LEFT JOIN users u ON u.id=p.user_id
      WHERE p.status='published' AND p.clones > 0 ORDER BY p.clones DESC, p.published_at DESC LIMIT 12`);
    return json(res, 200, {
      protocols: r.rows.map((p) => ({
        code: p.code, title: publicProtocolTitle(p.base_pid, p.base_rcid),
        clones: p.clones || 0, by_user: p.by_user || null,
      })),
      label: 'MOST USED', means: 'How many people started it. Not how well it worked — nothing here measures that.',
    });
  }
  // WHAT YOU MADE (2026-08-10). Registered ABOVE the read-one branch on purpose: that branch
  // matches `seg[1] && !seg[2]`, so /api/protocols/mine would otherwise resolve as code='mine' and
  // 404. Before this, POST /api/protocols handed back a code and the author never saw a list of
  // their own work again — there was no way to find out what you had published, and therefore no
  // way to take any of it down.
  // DRAFTS ARE INCLUDED HERE AND NOWHERE ELSE. This is the only reader in the codebase that may
  // see status='draft', because a draft is a private document and /me is the only private page.
  // `joined` travels with it so /me can print the join MONTH without a second request; it is the
  // month, never the day, for the same reason GET /api/u/:handle truncates it.
  if (seg[0] === 'protocols' && seg[1] === 'mine' && !seg[2] && method === 'GET') {
    const u = await currentUser(req); if (!u) return json(res, 200, { protocols: [], signedIn: false });
    const r = await db.query(`SELECT code,title,status,clones,base_pid,base_rcid,parent_code,published_at,updated_at
      FROM studio_protocols WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 100`, [u.id]);
    // Read separately: currentUser() deliberately does not select created_at, and its row is what
    // becomes `ME` in every browser. Reading it here keeps the join date to the one page that
    // prints it instead of putting it on every session object on the site.
    const jr = await db.query('SELECT created_at FROM users WHERE id=$1', [u.id]);
    const joinedAt = jr.rows[0] && jr.rows[0].created_at;
    return json(res, 200, {
      protocols: r.rows.map((p) => p.status === 'published' ? Object.assign({}, p, { title: publicProtocolTitle(p.base_pid, p.base_rcid) }) : p), signedIn: true,
      joined: joinedAt ? new Date(joinedAt).toISOString().slice(0, 7) : null,
      clonesMean: 'How many people started it. Not how well it worked — nothing here measures that.',
    });
  }
  // WITHDRAW. studio_protocols.status has supported 'withdrawn' since the table was written and
  // the read-one branch below already renders that state — but NOTHING COULD EVER SET IT.
  // Publishing was irreversible from the site. That is the privacy defect, not a missing nicety: a
  // protocol title is something a person writes about their own body, and "you can take it down"
  // has to be a fact before the publish sheet is allowed to say it.
  // The row is KEPT, not deleted, exactly as the DDL comment specifies: remixes of it still have to
  // resolve through it, and people linked to it. The page then says it was withdrawn instead of
  // 404ing an address somebody shared.
  // user_id is IN THE WHERE CLAUSE rather than checked afterwards — the only account that can
  // withdraw a protocol is the one that wrote it, and there is no owner override. ONE ACCOUNT TYPE.
  if (seg[0] === 'protocols' && seg[1] && seg[2] === 'withdraw' && !seg[3] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Sign in to withdraw a protocol.' });
    await readBody(req, 512);
    const r = await db.query("UPDATE studio_protocols SET status='withdrawn', updated_at=now() WHERE code=$1 AND user_id=$2 AND status='published' RETURNING code", [clean(seg[1], 16), u.id]);
    if (!r.rows[0]) return json(res, 404, { error: 'No published protocol of yours has that code.' });
    return json(res, 200, {
      ok: true, code: r.rows[0].code, status: 'withdrawn',
      says: 'Withdrawn. Nobody new can start it and it is off Most Used. The link still opens and says you withdrew it, because other people may have remixed it and their copies have to keep resolving.',
    });
  }
  // One clone per browser, no account. The fork_clones pattern, minus the reputation award: that
  // award embedded the CALLER's voter key in its idempotency ref, which made public reputation
  // unbounded. Nothing here writes to a leaderboard about a person.
  if (seg[0] === 'protocols' && seg[1] && seg[2] === 'clone' && method === 'POST') {
    const code = clean(seg[1], 16); await readBody(req, 512);
    if (!code) return json(res, 400, { error: 'Missing' });
    const r = (await db.query("SELECT * FROM studio_protocols WHERE code=$1 AND status='published'", [code])).rows[0];
    if (!r) return json(res, 404, { error: 'No such protocol' });
    // A clone is a self-directed action, not an analytics-only tap. Re-run the CURRENT publish
    // rules before recording it: a protocol that was publishable last month may now contain a
    // reclassified substance or an incompletely covered compound set. The read page hides its
    // spec in that state; this prevents a direct API call from bypassing the same containment.
    if (!STUDIO_READY) return studioDown(res);
    const resolved = await STUDIO.resolve(r, (c) => db.query('SELECT * FROM studio_protocols WHERE code=$1', [c]).then(x => x.rows[0]));
    if (!resolved.ok) return json(res, 422, { error: resolved.error, status: 'review_required' });
    let current;
    try { current = STUDIO.validate({ spec: resolved.spec, base_pid: r.base_pid, base_rcid: r.base_rcid, publish: true }); }
    catch (e) { console.error('[studio clone]', e.message); return studioDown(res); }
    if (!current.ok) return json(res, 422, {
      error: 'This protocol needs review before anybody can start or remix it.', status: 'review_required',
      refusals: current.refusals, warn: current.warn, coverage: current.coverage,
      says: current.safety ? current.safety.says : null,
    });
    const part = await resolveParticipant(req, res); const voterKey = part.key;
    if (!voterKey) return json(res, 400, { error: 'Missing' });
    const ins = await db.query('INSERT INTO studio_clones(code,voter_key) VALUES($1,$2) ON CONFLICT (code,voter_key) DO NOTHING RETURNING id', [code, voterKey]);
    if (ins.rows[0]) await db.query('UPDATE studio_protocols SET clones=clones+1 WHERE code=$1', [code]);
    return json(res, 200, { ok: true, code, counted: !!ins.rows[0] });
  }
  // Read one. Resolves the remix chain, and REVALIDATES against the corpus as it is TODAY — the
  // stored verdict says what was true when it was saved, and a compound can be re-rated or
  // reclassified afterwards. Both are returned, labelled, so a reader can see the difference rather
  // than being handed a stale clearance.
  if (seg[0] === 'protocols' && seg[1] && !seg[2] && method === 'GET') {
    const code = clean(seg[1], 16);
    const row = (await db.query('SELECT p.*, u.username AS by_user FROM studio_protocols p LEFT JOIN users u ON u.id=p.user_id WHERE p.code=$1', [code])).rows[0];
    if (!row || row.status === 'draft') return json(res, 404, { error: 'No such protocol' });
    const publicTitle = publicProtocolTitle(row.base_pid, row.base_rcid);
    if (row.status === 'withdrawn') {
      // Kept, not 404ed: people linked to this, and remixes of it still resolve through it.
      return json(res, 200, { code, status: 'withdrawn', title: publicTitle, by_user: row.by_user || null, spec: null, says: 'The person who wrote this withdrew it.' });
    }
    const r = await STUDIO.resolve(row, (c) => db.query('SELECT * FROM studio_protocols WHERE code=$1', [c]).then(x => x.rows[0]));
    if (!r.ok) return json(res, 200, { code, status: 'unresolvable', title: publicTitle, spec: null, says: r.error });
    // Revalidate as PUBLIC content. Draft mode intentionally turns some hard stops into notes so
    // the owner can keep editing a private copy; using it here let a once-published protocol keep
    // exposing steps after the current publish contract would refuse them. If the checker cannot
    // complete, or the current rules refuse the resolved spec, the public endpoint returns no
    // actionable spec at all. The stored verdict remains for audit, never as a fallback clearance.
    const checkedAt = new Date().toISOString();
    if (!STUDIO_READY) return json(res, 200, {
      code, status: 'review_required', previous_status: row.status, title: publicTitle,
      by_user: row.by_user || null, spec: null, reviewRequired: true,
      says: 'This protocol is temporarily unavailable because RNAwiki could not run its current publication checks. No steps or remix are available.',
      safetyWhenSaved: row.safety,
      safetyNow: { refusals: [{ rule: 'checker-unavailable', message: 'Current publication checks could not run.', item: null, row: null }], warn: [], coverage: null, says: 'Current publication checks could not run.', at: checkedAt },
    });
    let v;
    try { v = STUDIO.validate({ spec: r.spec, base_pid: row.base_pid, base_rcid: row.base_rcid, publish: true }); }
    catch (e) {
      console.error('[studio read]', e.message);
      return json(res, 200, {
        code, status: 'review_required', previous_status: row.status, title: publicTitle,
        by_user: row.by_user || null, spec: null, reviewRequired: true,
        says: 'This protocol is temporarily unavailable because RNAwiki could not run its current publication checks. No steps or remix are available.',
        safetyWhenSaved: row.safety,
        safetyNow: { refusals: [{ rule: 'checker-unavailable', message: 'Current publication checks could not run.', item: null, row: null }], warn: [], coverage: null, says: 'Current publication checks could not run.', at: checkedAt },
      });
    }
    const now = {
      refusals: v.refusals, warn: v.warn, coverage: v.coverage,
      says: v.safety ? v.safety.says : ((v.refusals[0] && v.refusals[0].message) || 'Current publication checks did not pass.'),
      at: v.safety ? v.safety.at : checkedAt,
    };
    if (!v.ok) return json(res, 200, {
      code, status: 'review_required', previous_status: row.status, title: publicTitle,
      by_user: row.by_user || null, base_pid: row.base_pid, base_rcid: row.base_rcid,
      parent_code: row.parent_code, depth: row.depth, clones: row.clones,
      published_at: row.published_at, spec: null, reviewRequired: true,
      says: 'This protocol no longer passes RNAwiki\'s current publication checks. Its steps and remix control are hidden until it is reviewed.',
      safetyWhenSaved: row.safety, safetyNow: now,
    });
    return json(res, 200, {
      code, status: row.status, title: publicTitle, by_user: row.by_user || null,
      base_pid: row.base_pid, base_rcid: row.base_rcid, parent_code: row.parent_code, depth: row.depth,
      clones: row.clones, published_at: row.published_at, spec: r.spec,
      safetyWhenSaved: row.safety, safetyNow: now,
    });
  }

  // --- protocol forks (community variations — UGC engine) ---
  if (seg[0] === 'forks' && seg[1] === 'popular' && method === 'GET') {
    // real stacks rank above demo fixtures; as real ones accumulate they push demos past the limit
    const r = await db.query("SELECT f.id,f.title,f.problem_id,f.root_cause_id,f.clones,u.username AS by_user FROM protocol_forks f LEFT JOIN users u ON u.id=f.user_id WHERE f.clones > 0 ORDER BY f.is_demo ASC, f.clones DESC, f.created_at DESC LIMIT 12");
    return json(res, 200, { forks: r.rows });
  }
  if (seg[0] === 'forks' && !seg[1] && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams;
    const problem = clean(q.get('problem'), 80), rc = clean(q.get('rc'), 80);
    if (!problem || !rc) return json(res, 200, { forks: [] });
    // Auto-swap: show demo/seed stacks only while NO real stack exists for this exact problem+cause.
    // The moment a real user shares one here, every demo for this cause drops out automatically.
    const r = await db.query("SELECT f.id,f.title,f.note,f.stack,f.clones,f.created_at,u.username AS by_user FROM protocol_forks f LEFT JOIN users u ON u.id=f.user_id WHERE f.problem_id=$1 AND f.root_cause_id=$2 AND (f.is_demo = false OR NOT EXISTS (SELECT 1 FROM protocol_forks r WHERE r.problem_id=$1 AND r.root_cause_id=$2 AND r.is_demo = false)) ORDER BY f.clones DESC, f.created_at DESC LIMIT 30", [problem, rc]);
    return json(res, 200, { forks: r.rows });
  }
  if (seg[0] === 'forks' && !seg[1] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to fork a protocol' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const problem_id = clean(b.problem_id, 80), root_cause_id = clean(b.root_cause_id, 80), title = clean(b.title, 80), note = clean(b.note, 500);
    if (!problem_id || !root_cause_id || !title) return json(res, 400, { error: 'Name your variation' });
    const stack = Array.isArray(b.stack) ? b.stack.filter((x) => typeof x === 'string').slice(0, 30) : [];
    const r = await db.query('INSERT INTO protocol_forks(problem_id,root_cause_id,user_id,title,note,stack) VALUES($1,$2,$3,$4,$5,$6) RETURNING id', [problem_id, root_cause_id, u.id, title, note || null, JSON.stringify(stack)]);
    await award(u.id, 'fork', 'fork:' + r.rows[0].id, 10);
    return json(res, 200, { ok: true, id: r.rows[0].id });
  }
  if (seg[0] === 'forks' && seg[1] && seg[2] === 'clone' && method === 'POST') {
    // Two public effects per call: the `clones` sort key for /api/forks/popular, and
    // award(..., 'forkclone:'+id+':'+voterKey, 5). award() is idempotent only on UNIQUE(user,kind,ref)
    // and ref embedded the CALLER's string, so reputation into the public leaderboard was unbounded.
    const id = pathId(seg[1]); await readBody(req, 512);
    const part = await resolveParticipant(req, res); const voterKey = part.key;
    if (!id || !voterKey) return json(res, 400, { error: 'Missing' });
    const fr = await db.query('SELECT * FROM protocol_forks WHERE id=$1', [id]); const f = fr.rows[0]; if (!f) return json(res, 404, { error: 'No such fork' });
    const ins = await db.query('INSERT INTO fork_clones(fork_id,voter_key) VALUES($1,$2) ON CONFLICT (fork_id,voter_key) DO NOTHING RETURNING id', [id, voterKey]);
    if (ins.rows[0]) { await db.query('UPDATE protocol_forks SET clones=clones+1 WHERE id=$1', [id]); if (f.user_id) await award(f.user_id, 'fork_clone', 'forkclone:' + id + ':' + voterKey, 5); }
    return json(res, 200, { ok: true, stack: f.stack, problem_id: f.problem_id, root_cause_id: f.root_cause_id, title: f.title });
  }
  if (seg[0] === 'forks' && seg[1] && method === 'GET') {
    const id = pathId(seg[1]); if (!id) return json(res, 404, { error: 'No such fork' });
    const r = await db.query("SELECT f.id,f.title,f.note,f.stack,f.clones,f.problem_id,f.root_cause_id,f.created_at,u.username AS by_user FROM protocol_forks f LEFT JOIN users u ON u.id=f.user_id WHERE f.id=$1", [id]);
    if (!r.rows[0]) return json(res, 404, { error: 'No such fork' });
    return json(res, 200, { fork: r.rows[0] });
  }
  // --- community pulse: a live feed of recent activity (forks, expert edits, discussion, foods) ---
  if (seg[0] === 'pulse' && method === 'GET') {
    const q = (sql) => db.query(sql).then((r) => r.rows).catch(() => []);
    const [forks, edits, comments, foods] = await Promise.all([
      // 2026-08-08: all three of these carried `u.domain, u.domain_verified AS verified` — a feed
      // item was going to say WHICH KIND OF PROFESSIONAL did the thing, and `verified` was going
      // out over the wire as a per-item boolean. Both columns are dead and this endpoint has no
      // caller in site/app.js; the feed now reports the act and who did it, which is all it knows.
      q("SELECT f.id, f.title, f.problem_id, f.root_cause_id, f.created_at AS at, u.username AS actor FROM protocol_forks f JOIN users u ON u.id=f.user_id ORDER BY f.created_at DESC LIMIT 8"),
      q("SELECT p.problem_id, p.root_cause_id, p.layer, p.created_at AS at, u.username AS actor FROM proposals p JOIN users u ON u.id=p.user_id WHERE p.status='endorsed' ORDER BY p.created_at DESC LIMIT 8"),
      q("SELECT c.goal_id, c.created_at AS at, u.username AS actor FROM comments c JOIN users u ON u.id=c.user_id ORDER BY c.created_at DESC LIMIT 8"),
      q("SELECT f.name, f.created_at AS at, u.username AS actor FROM user_foods f JOIN users u ON u.id=f.submitted_by WHERE f.status='active' ORDER BY f.created_at DESC LIMIT 5"),
    ]);
    const items = []
      .concat(forks.map((r) => Object.assign({ type: 'fork' }, r)))
      .concat(edits.map((r) => Object.assign({ type: 'edit' }, r)))
      .concat(comments.map((r) => Object.assign({ type: 'comment' }, r)))
      .concat(foods.map((r) => Object.assign({ type: 'food' }, r)))
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 14);
    return json(res, 200, { pulse: items });
  }
  // --- wiki-improvement feedback (open to everyone) ---
  if (seg[0] === 'feedback' && !seg[1] && method === 'POST') {
    const u = await currentUser(req);
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const body = clean(b.body, 2000); if (!body) return json(res, 400, { error: 'Tell me what to improve' });
    const kind = ['idea', 'wrong', 'other'].includes(b.kind) ? b.kind : 'idea';
    await db.query('INSERT INTO feedback(body,page,kind,user_id,contact) VALUES($1,$2,$3,$4,$5)',
      [body, clean(b.page, 200) || null, kind, u ? u.id : null, clean(b.contact, 120) || null]);
    // WAS: award(u.id, 'feedback', 'fb:' + Date.now(), 2) — a millisecond timestamp is unique on every
    // call, so UNIQUE(user_id,kind,ref) could never fire and the ledger's own idempotency promise did
    // not hold on the one surface with no account-age check and no content check. It is not awarded
    // at all now: sending feedback is an action you take alone, and those do not mint points. The
    // point for it arrives as 'helpful' if somebody else acts on it.
    return json(res, 200, { ok: true });
  }
  // POST /api/clinician-interest CLOSED 2026-08-08 — the handler is deleted, so the path falls
  // through to the 404 at the end of this dispatcher.
  // It accepted, with NO ACCOUNT and NO EMAIL VERIFICATION, a name, an email, a profession, a
  // country, a PROFESSIONAL LICENCE NUMBER and a base64 PHOTOGRAPH OF A CREDENTIAL DOCUMENT (up to
  // ~1.2 MB). Its intake page (/gp) was removed on 2026-07-30 and api.submitClinicianInterest in
  // site/app.js had ZERO call sites, so for over a month the only thing that could reach it was a
  // hand-written request. An earlier audit noticed exactly that and responded by shrinking the
  // size cap from 6e6 to 1.6e6 — it made the open door narrower instead of shutting it. Collecting
  // government identity documents for a verification programme that has been abolished is the
  // largest data liability on this site, and it is now shut.
  // ---- clinician_interest AND GET /api/clinician-photo REMOVED 2026-08-11 (D-5, P0-P3) ----------
  // The note that used to sit here said the rows were deliberately kept so the owner could see and
  // export them, and that deleting them was Felix's decision. He made it: "delete. i do not need to
  // collect any licence number and credentials."
  //
  // So the whole thing is gone — the endpoint, both admin tables, the CSV export, the DDL and the
  // table itself (dropped from production the same day). MEASURED before dropping: 2 rows, from
  // 2026-07-07 and 2026-07-12, 0 photographs and 0 licence numbers ever submitted. The column that
  // made this "the largest data liability on this site" was never once filled — the form was
  // closed before anybody used it that way.
  //
  // Nothing replaces it. There is no professional tier, no verification programme and no reason for
  // this site to hold anybody's government identity document; assertOneAccountType() in
  // build/parse.js already fails the build on a professional-tier surface, and the intake pattern
  // is banned there by name. The right amount of somebody else's licence number to store is none.
  // ---------- the outcome loop: experiments · check-ins · results ledger ----------
  // ---- GET /api/stats REMOVED 2026-08-11 (P0-P12) ----------------------------------------------
  // MEASURED against production on the day it was removed:
  //     curl https://rnawiki.com/api/stats  ->  {"experiments":20,"improved":1,"helped":19}
  // Unauthenticated, and `improved/experiments` is a site-wide EFFICACY RATIO — 1 in 20. Product
  // constraint 5 and AGENT_RULES both forbid publishing one: n=20 self-selected, self-reported,
  // uncontrolled check-ins is not a result, and any number shaped like a success rate is read as
  // one. The forged-key path documented at server.js:429 moved this same figure, so it was also a
  // number an anonymous caller could set.
  //
  // Nothing rendered it. `api.stats()` in site/app.js had ZERO call sites (measured: one match for
  // `stats(` in 10,286 lines, the definition itself), so this endpoint had no reader but a crawler
  // or a scraper. The wrapper is deleted with it — a client method for a route that 404s is the
  // next person's twenty minutes.
  //
  // Deliberately NOT replaced with a gated/aggregated version. The honest home-page counter is the
  // one the site already renders: how many people are RUNNING a protocol, which claims nothing
  // about whether it worked. `helped_people` and the `helped` figure keep their own uses below.
  // record a "stack built" engagement (idempotent per person) for the people-helped counter
  // /api/subscribe and /api/unsubscribe REMOVED 2026-08-06 with the newsletter. They were the only
  // readers of newsletter_subscribers and the only callers of resendAddContact/resendUnsubscribe/
  // welcomeEmail/EMAIL_RE. Both paths now fall through to the 404 at the end of this dispatcher.
  if (seg[0] === 'helped' && method === 'POST') {
    // helped_people.voter_key is the PRIMARY KEY, and one forged key was one more "person helped"
    // in the aggregate GET /api/stats served until 2026-08-11 (removed; see the tombstone above).
    // The table is kept because it is the idempotency record for this ping, not a published figure.
    // Nothing in the body is trusted; drain and drop.
    await readBody(req, 512);
    const part = await resolveParticipant(req, res); const voterKey = part.key;
    if (!voterKey) return json(res, 400, { error: 'Missing' });
    try { await db.query('INSERT INTO helped_people(voter_key) VALUES($1) ON CONFLICT (voter_key) DO NOTHING', [voterKey]); } catch (e) {}
    return json(res, 200, { ok: true });
  }
  // public aggregate for one protocol (the Results Ledger)
  if (seg[0] === 'ledger' && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams;
    const pid = clean(q.get('problem'), 80), rcid = clean(q.get('rc'), 80);
    if (!pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    const r = await db.query(`SELECT count(*)::int AS total,
      count(*) FILTER (WHERE status='running')::int AS running,
      count(*) FILTER (WHERE outcome='better')::int AS better,
      count(*) FILTER (WHERE outcome='same')::int AS same,
      count(*) FILTER (WHERE outcome='worse')::int AS worse
      FROM research_experiments WHERE problem_id=$1 AND root_cause_id=$2`, [pid, rcid]);
    return json(res, 200, r.rows[0]);
  }
  // my state for one protocol (running? streak? checked today? outcome?)
  if (seg[0] === 'experiments' && seg[1] === 'mine' && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams;
    const pid = clean(q.get('problem'), 80), rcid = clean(q.get('rc'), 80);
    // GET: read the cookie, never the ?voterKey query param, and never mint on a read. Before this,
    // anyone could read back any participant's streak, level and referral count by replaying a key
    // that app.js puts in the query string (so: proxy logs, Referer headers). readOnly:true is the
    // line that keeps "reading is fully anonymous" literally true.
    const part = await resolveParticipant(req, res, { readOnly: true });
    const blank = { experiment: null, streak: 0, checkedToday: false, level: null, completedTotal: 0, runningTotal: 0, checkinsThisWeek: 0, cohortSize: 0, weekLabel: '', onboarded: 0 };
    if (!part.key || !pid || !rcid) return json(res, 200, blank);
    const er = await db.query('SELECT id,status,outcome,started_at FROM experiments WHERE participant=$1 AND problem_id=$2 AND root_cause_id=$3', [part.key, pid, rcid]);
    const exp = er.rows[0];
    // participant-wide identity (across all their protocols) → level
    const tot = await db.query("SELECT count(*) FILTER (WHERE outcome IS NOT NULL)::int AS completed, count(*) FILTER (WHERE status='running')::int AS running FROM experiments WHERE participant=$1", [part.key]);
    const completedTotal = tot.rows[0].completed, runningTotal = tot.rows[0].running, level = levelFor(completedTotal);
    // cohort: people who started THIS protocol in my start week (or the current week if I haven't started)
    const wkExpr = exp ? '(SELECT started_at FROM experiments WHERE id=$3)' : 'now()';
    const cr = await db.query(`SELECT count(*)::int AS n, to_char(date_trunc('week', ${wkExpr}), 'IYYY-"W"IW') AS wk
      FROM research_experiments WHERE problem_id=$1 AND root_cause_id=$2 AND date_trunc('week', started_at)=date_trunc('week', ${wkExpr})`, exp ? [pid, rcid, exp.id] : [pid, rcid]);
    const cohortSize = cr.rows[0].n, weekLabel = cr.rows[0].wk;
    const onboarded = (await db.query('SELECT count(*)::int AS n FROM referrals WHERE referrer=$1', [part.key])).rows[0].n;
    if (!exp) return json(res, 200, Object.assign({}, blank, { level, completedTotal, runningTotal, cohortSize, weekLabel, onboarded }));
    const set = await checkinDays(exp.id);
    const ws = weekStartUTC();
    const checkinsThisWeek = [...set].filter(d => d >= ws).length;
    return json(res, 200, { experiment: { status: exp.status, outcome: exp.outcome, started_at: exp.started_at }, streak: streakFromDays(set), checkedToday: set.has(todayUTC()), level, completedTotal, runningTotal, checkinsThisWeek, cohortSize, weekLabel, onboarded });
  }
  if (seg[0] === 'experiments' && seg[1] === 'start' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const pid = clean(b.problemId, 80), rcid = clean(b.rootCauseId, 80);
    const part = await resolveParticipant(req, res);
    if (!part.key) return json(res, 400, { error: 'Could not identify you — enable cookies or sign in' });
    if (!part.user || !(await hasExplicitResearchConsent(part.user.id))) return json(res, 403, { error: 'Sign in and explicitly opt in before storing a personal observation.' });
    if (!pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    const exp = await getOrCreateExperiment(part, pid, rcid);
    await db.query("UPDATE experiments SET status='running' WHERE id=$1", [exp.id]);
    if (part.user) await award(part.user.id, 'experiment', 'start:' + exp.id, 10);
    // referral first-touch attribution: credit the sharer whose link brought this participant in
    const ref = clean(b.ref, 80);
    if (ref && ref !== part.key) {
      let referrer = null;
      if (ref.startsWith('u:')) { const uu = await db.query('SELECT id FROM users WHERE lower(username)=lower($1)', [ref.slice(2)]); if (uu.rows[0]) referrer = 'u:' + uu.rows[0].id; }
      else if (ref.startsWith('v:')) referrer = ref;
      if (referrer && referrer !== part.key) {
        const ins = await db.query('INSERT INTO referrals(referrer,participant) VALUES($1,$2) ON CONFLICT (participant) DO NOTHING RETURNING id', [referrer, part.key]);
        if (ins.rows[0] && referrer.startsWith('u:')) await award(parseInt(referrer.slice(2), 10), 'onboard', 'ob:' + part.key, 25);
      }
    }
    return json(res, 200, { ok: true, experimentId: exp.id, streak: 0 });
  }
  if (seg[0] === 'experiments' && seg[1] === 'checkin' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const pid = clean(b.problemId, 80), rcid = clean(b.rootCauseId, 80);
    const part = await resolveParticipant(req, res);
    if (!part.key || !pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    if (!part.user || !(await hasExplicitResearchConsent(part.user.id))) return json(res, 403, { error: 'Sign in and explicitly opt in before storing a personal observation.' });
    const exp = await getOrCreateExperiment(part, pid, rcid);
    const day = todayUTC();
    await db.query('INSERT INTO experiment_checkins(experiment_id,day) VALUES($1,$2) ON CONFLICT (experiment_id,day) DO NOTHING', [exp.id, day]);
    if (part.user) await award(part.user.id, 'checkin', 'ci:' + exp.id + ':' + day, 3);
    const set = await checkinDays(exp.id);
    return json(res, 200, { ok: true, streak: streakFromDays(set), checkedToday: true });
  }
  if (seg[0] === 'experiments' && seg[1] === 'outcome' && method === 'POST') {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const pid = clean(b.problemId, 80), rcid = clean(b.rootCauseId, 80);
    const outcome = ['better', 'same', 'worse'].includes(b.outcome) ? b.outcome : null;
    if (!outcome) return json(res, 400, { error: 'Pick better, same, or worse' });
    // Highest-consequence of the three: `outcome` is caller-chosen from {better,same,worse} and
    // lands in the aggregate served by GET /api/ledger. An efficacy claim assembled from forged
    // rows is precisely what product constraint 5 forbids.
    const part = await resolveParticipant(req, res);
    if (!part.key || !pid || !rcid) return json(res, 400, { error: 'Missing protocol' });
    if (!part.user || !(await hasExplicitResearchConsent(part.user.id))) return json(res, 403, { error: 'Sign in and explicitly opt in before storing a personal observation.' });
    const exp = await getOrCreateExperiment(part, pid, rcid);
    await db.query("UPDATE experiments SET outcome=$1, status='completed', outcome_at=now() WHERE id=$2", [outcome, exp.id]);
    if (part.user) await award(part.user.id, 'outcome', 'oc:' + exp.id, 15);
    return json(res, 200, { ok: true, outcome });
  }
  // --- one-click CSV export of members / waitlist (super-admin only) ---
  if (seg[0] === 'admin' && seg[1] === 'export' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const type = clean(new URL('http://x/' + url).searchParams.get('type'), 20);
    const researchExportTypes = new Set(['checkins', 'markers', 'wearables']);
    if (researchExportTypes.has(type) && !FEATURES.researchCollection) {
      return json(res, 404, { error: 'Research exports are not available.' });
    }
    // `type=clinicians` REMOVED 2026-08-11 with the table (D-5). It exported name, email,
    // profession, country, licence number and whether a credential photograph was on file.
    // It falls through to the 400 at the end of this handler.
    // --- Research dataset exports (anonymous: pseudonymous user_id join key, no name/email) ---
    // Stable, non-reversible pseudonym so the exported dataset can't be joined back to a real identity.
    const anonId = uid => 'S' + crypto.createHmac('sha256', SECRET).update('anon:' + uid).digest('hex').slice(0, 12);
    if (type === 'checkins') {   // the core outcome dataset, joined to demographics — no identity, only pseudonym + demographics + outcomes
      const r = await db.query(`SELECT c.user_id, c.pid, c.rcid, c.phase, c.symptom_0_10, c.improvement, c.adherence_pct, c.still_on, c.stop_reason, c.side_effects, c.extra,
        p.age_band, p.sex, p.ethnicity, p.conditions, p.height_cm, p.meds, to_char(c.created_at,'YYYY-MM-DD"T"HH24:MI:SSZ') AS created_at
        FROM research_outcome_checkins c LEFT JOIN research_user_profile p ON p.user_id=c.user_id ORDER BY c.user_id, c.created_at`);
      return csvExport(res, 'rnawiki-checkins.csv',
        ['subject', 'pid', 'rcid', 'phase', 'symptom_0_10', 'improvement', 'adherence_pct', 'still_on', 'stop_reason', 'side_effects', 'extra', 'age_band', 'sex', 'ethnicity', 'conditions', 'height_cm', 'meds', 'created_at'],
        r.rows.map(x => [anonId(x.user_id), x.pid, x.rcid, x.phase, x.symptom_0_10, x.improvement, x.adherence_pct, x.still_on, x.stop_reason, x.side_effects, x.extra ? JSON.stringify(x.extra) : '', x.age_band, x.sex, x.ethnicity, Array.isArray(x.conditions) ? x.conditions.join('|') : '', x.height_cm, Array.isArray(x.meds) ? x.meds.join('|') : '', x.created_at]));
    }
    if (type === 'markers') {
      const r = await db.query(`SELECT user_id, marker, value, unit, to_char(taken_on,'YYYY-MM-DD') AS taken_on FROM research_blood_markers ORDER BY user_id, marker, taken_on`);
      return csvExport(res, 'rnawiki-markers.csv', ['subject', 'marker', 'value', 'unit', 'taken_on'],
        r.rows.map(x => [anonId(x.user_id), x.marker, x.value, x.unit, x.taken_on]));
    }
    if (type === 'wearables') {
      const r = await db.query(`SELECT user_id, to_char(day,'YYYY-MM-DD') AS day, steps, sleep_min, resting_hr, weight_kg, waist_cm FROM research_wearable_daily ORDER BY user_id, day`);
      return csvExport(res, 'rnawiki-wearables.csv', ['subject', 'day', 'steps', 'sleep_min', 'resting_hr', 'weight_kg', 'waist_cm'],
        r.rows.map(x => [anonId(x.user_id), x.day, x.steps, x.sleep_min, x.resting_hr, x.weight_kg, x.waist_cm]));
    }
    // 2026-08-08: the role / domain / domain_verified columns are out of this export. They were
    // three columns that read 'user', empty and false on every row ever written, and a CSV with a
    // "domain_verified" header invites the reader to believe some row could say true.
    const r = await db.query('SELECT username,email,reputation_points,created_at FROM users ORDER BY created_at DESC');
    return csvExport(res, 'rnawiki-members.csv', ['username', 'email', 'reputation', 'joined'],
      r.rows.map(x => [x.username, x.email, x.reputation_points, x.created_at && x.created_at.toISOString()]));
  }
  if (seg[0] === 'admin' && seg[1] === 'feedback' && seg[2] && method === 'POST') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const id = pathId(seg[2]); const b = await readBody(req) || {};
    const status = ['open', 'done', 'archived'].includes(b.status) ? b.status : 'done';
    await db.query('UPDATE feedback SET status=$1 WHERE id=$2', [status, id]);
    return json(res, 200, { ok: true });
  }
  // --- root-cause governance: experts propose add/remove; the relevant panel endorses ---
  if (seg[0] === 'rootcause-changes' && !seg[1] && method === 'GET') {
    const problem = clean(new URL('http://x/' + url).searchParams.get('problem'), 80);
    const where = problem ? 'WHERE c.problem_id=$1' : "WHERE c.status='pending'";
    const params = problem ? [problem] : [];
    const meId = (await currentUser(req) || {}).id || 0;
    const r = await db.query(`SELECT c.id,c.problem_id,c.action,c.root_cause_id,c.name,c.diagnostic,c.domains,c.rationale,c.status,c.created_at,
      u.username AS by_user,
      (SELECT count(*) FROM rootcause_endorsements e WHERE e.change_id=c.id) AS endorsements,
      (SELECT count(*) FROM rootcause_endorsements e WHERE e.change_id=c.id AND e.user_id=$${params.length + 1}) AS mine
      FROM rootcause_changes c LEFT JOIN users u ON u.id=c.submitted_by ${where} ORDER BY c.created_at DESC LIMIT 100`, [...params, meId]);
    return json(res, 200, { changes: r.rows, threshold: PANEL_THRESHOLD });
  }
  if (seg[0] === 'rootcause-changes' && !seg[1] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    // 2026-08-08 · ONE ACCOUNT TYPE — `|| !u.domain_verified` removed (see users.role in db.js).
    if (u.role !== 'admin') return json(res, 403, { error: 'Proposing a root-cause change is not enabled for this account.' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const problem_id = clean(b.problem_id, 80), action = b.action === 'remove' ? 'remove' : 'add';
    if (!problem_id) return json(res, 400, { error: 'Missing problem' });
    const domains = Array.isArray(b.domains) ? b.domains.filter(d => typeof d === 'string').slice(0, 5) : [];
    const rationale = clean(b.rationale, 800);
    let root_cause_id = clean(b.root_cause_id, 80), name = clean(b.name, 120), diagnostic = clean(b.diagnostic, 400);
    if (action === 'add') {
      if (!name) return json(res, 400, { error: 'Name the root cause you want to add' });
      root_cause_id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'rc-' + Date.now();
    } else if (!root_cause_id) return json(res, 400, { error: 'Missing root cause to remove' });
    const r = await db.query('INSERT INTO rootcause_changes(problem_id,action,root_cause_id,name,diagnostic,domains,rationale,submitted_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id',
      [problem_id, action, root_cause_id, name || null, diagnostic || null, JSON.stringify(domains), rationale || null, u.id]);
    await award(u.id, 'rc_change', 'rcc:' + r.rows[0].id, 15);
    return json(res, 200, { ok: true, id: r.rows[0].id });
  }
  if (seg[0] === 'rootcause-changes' && seg[1] && seg[2] === 'endorse' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    const id = pathId(seg[1]);
    const cr = await db.query('SELECT * FROM rootcause_changes WHERE id=$1', [id]);
    const ch = cr.rows[0]; if (!ch) return json(res, 404, { error: 'No such change' });
    if (ch.status !== 'pending') return json(res, 400, { error: 'Already decided' });
    // 2026-08-08 · ONE ACCOUNT TYPE. This used to admit a "panel" — accounts carrying
    // domain_verified whose domain the root cause names — alongside the owner. There is no tier
    // and no panel; the only distinction the site recognises is the owner's own control room.
    const onPanel = isSuper(u) || u.role === 'admin';
    if (!onPanel) return json(res, 403, { error: 'Endorsing this change is not enabled for this account.' });
    await db.query('INSERT INTO rootcause_endorsements(change_id,user_id,domain) VALUES($1,$2,$3) ON CONFLICT (change_id,user_id) DO NOTHING', [id, u.id, null]);   /* `u.domain` -> null, 2026-08-08: the session no longer carries a profession */
    await award(u.id, 'rc_endorse', 'rcc:' + id, 5);
    const cnt = await db.query('SELECT count(*)::int AS n FROM rootcause_endorsements WHERE change_id=$1', [id]);
    let status = ch.status;
    // A peer approval never publishes. It moves the change to 'peer_approved' — awaiting the
    // superadmin's final approval, which is the only thing that makes it live.
    if (cnt.rows[0].n >= PANEL_THRESHOLD) { await db.query("UPDATE rootcause_changes SET status='peer_approved' WHERE id=$1 AND status='pending'", [id]); status = 'peer_approved'; }
    return json(res, 200, { ok: true, endorsements: cnt.rows[0].n, status });
  }
  if (seg[0] === 'rootcause-overlay' && method === 'GET') {
    const r = await db.query("SELECT problem_id,action,root_cause_id,name,diagnostic,domains FROM rootcause_changes WHERE status='approved' ORDER BY created_at ASC");
    return json(res, 200, { overlay: r.rows });
  }
  if (seg[0] === 'admin' && seg[1] === 'rootcause-changes' && seg[2] && method === 'POST') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const id = pathId(seg[2]); const b = await readBody(req) || {};
    const status = ['approved', 'rejected', 'pending'].includes(b.status) ? b.status : 'approved';
    await db.query('UPDATE rootcause_changes SET status=$1, decided_by=$2 WHERE id=$3', [status, u.id, id]);
    return json(res, 200, { ok: true });
  }
  // --- consolidated super-admin control room: everything the superadmin needs in one call ---
  // Cohort outcomes — the data moat, aggregated (super-admin only).
  if (seg[0] === 'admin' && seg[1] === 'outcomes' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const rows = (await db.query(`
      SELECT pid, rcid,
        COUNT(*) FILTER (WHERE phase='baseline') AS baseline_n,
        COUNT(*) FILTER (WHERE phase='d30') AS d30_n,
        COUNT(*) FILTER (WHERE phase='d90') AS d90_n,
        COUNT(*) FILTER (WHERE phase='d30' AND improvement>=1) AS d30_imp,
        COUNT(*) FILTER (WHERE phase='d90' AND improvement>=1) AS d90_imp,
        ROUND(AVG(adherence_pct) FILTER (WHERE phase IN ('d30','d90'))) AS avg_adh
      FROM research_outcome_checkins GROUP BY pid, rcid
      ORDER BY d90_n DESC, d30_n DESC, baseline_n DESC`)).rows;
    const delta = (await db.query(`
      WITH base AS (SELECT user_id,pid,rcid,symptom_0_10 s FROM research_outcome_checkins WHERE phase='baseline' AND symptom_0_10 IS NOT NULL),
           lastc AS (SELECT DISTINCT ON (user_id,pid,rcid) user_id,pid,rcid,symptom_0_10 s
                     FROM research_outcome_checkins WHERE phase IN ('d30','d90') AND symptom_0_10 IS NOT NULL
                     ORDER BY user_id,pid,rcid,(phase='d90') DESC)
      SELECT b.pid,b.rcid, ROUND(AVG(b.s-l.s)::numeric,1) AS delta, COUNT(*) AS n
      FROM base b JOIN lastc l USING(user_id,pid,rcid) GROUP BY b.pid,b.rcid`)).rows;
    const dmap = {}; delta.forEach(d => { dmap[d.pid + '/' + d.rcid] = { delta: d.delta, n: d.n }; });
    rows.forEach(r => { const d = dmap[r.pid + '/' + r.rcid]; r.symptom_delta = d ? d.delta : null; r.delta_n = d ? d.n : 0; });
    const totals = (await db.query(`SELECT
      (SELECT COUNT(*) FROM current_research_consent WHERE decision=true) AS consented,
      (SELECT COUNT(*) FROM research_outcome_checkins) AS checkins,
      (SELECT COUNT(*) FROM (SELECT DISTINCT pid,rcid FROM research_outcome_checkins) t) AS protocols`)).rows[0];
    return json(res, 200, { rows, totals });
  }
  // High-value signal breakdowns for the Control Room — super-admin only (owner's own dataset, no k-anon floor)
  if (seg[0] === 'admin' && seg[1] === 'signals' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    const [stopReasons, sideFx, sideFxSamples, whtr, waistN, medsUsers, topMeds, extras] = await Promise.all([
      db.query(`SELECT stop_reason, COUNT(*)::int n FROM research_outcome_checkins WHERE stop_reason IS NOT NULL GROUP BY stop_reason ORDER BY n DESC`),
      db.query(`SELECT COUNT(*)::int n, COUNT(DISTINCT user_id)::int users FROM research_outcome_checkins WHERE side_effects IS NOT NULL`),
      db.query(`SELECT pid, side_effects FROM research_outcome_checkins WHERE side_effects IS NOT NULL ORDER BY created_at DESC LIMIT 15`),
      db.query(`WITH lastw AS (SELECT DISTINCT ON (user_id) user_id, waist_cm FROM research_wearable_daily WHERE waist_cm IS NOT NULL ORDER BY user_id, day DESC)
        SELECT COUNT(*)::int n, ROUND(AVG(w.waist_cm / p.height_cm)::numeric,3) AS avg_whtr,
          COUNT(*) FILTER (WHERE w.waist_cm / p.height_cm >= 0.5)::int AS at_risk
        FROM lastw w JOIN research_user_profile p ON p.user_id=w.user_id AND p.height_cm IS NOT NULL`),
      db.query(`SELECT COUNT(DISTINCT user_id)::int n FROM research_wearable_daily WHERE waist_cm IS NOT NULL`),
      db.query(`SELECT COUNT(*)::int n FROM research_user_profile WHERE jsonb_array_length(meds) > 0`),
      db.query(`SELECT lower(trim(m.med)) AS med, COUNT(*)::int AS n FROM research_user_profile p, jsonb_array_elements_text(p.meds) AS m(med) WHERE jsonb_array_length(p.meds) > 0 GROUP BY 1 ORDER BY n DESC LIMIT 15`),
      db.query(`SELECT e.k AS key, ROUND(AVG(e.v::numeric),2) AS avg, COUNT(*)::int AS n FROM research_outcome_checkins oc, jsonb_each_text(oc.extra) AS e(k,v) WHERE oc.extra IS NOT NULL GROUP BY e.k ORDER BY n DESC`),
    ]);
    const due = await listDueCheckins().catch(() => []);
    const nudgesSent = (await db.query('SELECT COUNT(*)::int n FROM users WHERE last_checkin_email IS NOT NULL')).rows[0].n;
    return json(res, 200, {
      stopReasons: stopReasons.rows, sideFx: sideFx.rows[0], sideFxSamples: sideFxSamples.rows,
      whtr: whtr.rows[0], waistN: waistN.rows[0].n, medsUsers: medsUsers.rows[0].n, topMeds: topMeds.rows, extras: extras.rows,
      nudges: { due: due.length, emailConfigured: !!RESEND_API_KEY, sent: nudgesSent },
    });
  }
  // Research-grade insights — the highest-value analyses, super-admin only (owner's dataset, no k-anon floor)
  if (seg[0] === 'admin' && seg[1] === 'research' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    // 1) Within-person biomarker before→after (needs ≥2 readings of a marker for a user)
    const biomarkerDeltas = (await db.query(`
      WITH pairs AS (
        SELECT user_id, marker,
          (array_agg(value ORDER BY taken_on ASC NULLS FIRST, id ASC))[1] AS v0,
          (array_agg(value ORDER BY taken_on DESC NULLS LAST, id DESC))[1] AS v1
        FROM research_blood_markers WHERE value IS NOT NULL
        GROUP BY user_id, marker HAVING COUNT(*) >= 2)
      SELECT marker, COUNT(*)::int AS users, ROUND(AVG(v1 - v0)::numeric, 2) AS avg_delta,
        COUNT(*) FILTER (WHERE v1 < v0)::int AS fell, COUNT(*) FILTER (WHERE v1 > v0)::int AS rose
      FROM pairs GROUP BY marker ORDER BY users DESC`)).rows;
    // 2) Responder phenotype — % reporting improvement, split by demographic dimension
    const phenotype = (await db.query(`
      SELECT dim, k, COUNT(*)::int n, COUNT(*) FILTER (WHERE improvement>=1)::int better FROM (
        SELECT 'age' dim, p.age_band k, oc.improvement FROM research_outcome_checkins oc JOIN research_user_profile p ON p.user_id=oc.user_id WHERE oc.phase IN ('d30','d90') AND oc.improvement IS NOT NULL AND p.age_band IS NOT NULL
        UNION ALL SELECT 'sex', p.sex, oc.improvement FROM research_outcome_checkins oc JOIN research_user_profile p ON p.user_id=oc.user_id WHERE oc.phase IN ('d30','d90') AND oc.improvement IS NOT NULL AND p.sex IS NOT NULL
        UNION ALL SELECT 'ethnicity', p.ethnicity, oc.improvement FROM research_outcome_checkins oc JOIN research_user_profile p ON p.user_id=oc.user_id WHERE oc.phase IN ('d30','d90') AND oc.improvement IS NOT NULL AND p.ethnicity IS NOT NULL
      ) t GROUP BY dim, k ORDER BY dim, n DESC`)).rows;
    const byCondition = (await db.query(`
      SELECT cond AS k, COUNT(*)::int n, COUNT(*) FILTER (WHERE oc.improvement>=1)::int better
      FROM research_outcome_checkins oc JOIN research_user_profile p ON p.user_id=oc.user_id, jsonb_array_elements_text(p.conditions) AS cond
      WHERE oc.phase IN ('d30','d90') AND oc.improvement IS NOT NULL GROUP BY cond ORDER BY n DESC`)).rows;
    // 3) What's NOT working — negative results by protocol
    const negativeResults = (await db.query(`
      SELECT pid, rcid, COUNT(*)::int n,
        COUNT(*) FILTER (WHERE improvement <= 0)::int no_improve,
        COUNT(*) FILTER (WHERE stop_reason='didnt_work')::int didnt_work,
        ROUND(AVG(improvement)::numeric,2) avg_imp
      FROM research_outcome_checkins WHERE phase IN ('d30','d90')
      GROUP BY pid, rcid HAVING COUNT(*) >= 1 ORDER BY didnt_work DESC, no_improve DESC LIMIT 20`)).rows;
    // 4) Adverse events attributed to the compounds the user was taking (association, not causation)
    const sfxRows = (await db.query(`SELECT user_id, pid, rcid FROM research_outcome_checkins WHERE side_effects IS NOT NULL`)).rows;
    const adverseByCompound = [];
    if (sfxRows.length) {
      const uids = [...new Set(sfxRows.map(r => r.user_id))];
      const plans = (await db.query('SELECT user_id, plan FROM user_plans WHERE user_id = ANY($1)', [uids])).rows;
      const planBy = {}; plans.forEach(p => { planBy[p.user_id] = p.plan; });
      const tally = {};
      for (const r of sfxRows) {
        const plan = planBy[r.user_id]; const protos = (plan && Array.isArray(plan.protocols)) ? plan.protocols : [];
        const pr = protos.find(x => x.pid === r.pid && x.rcid === r.rcid) || protos[0];
        const supps = (pr && Array.isArray(pr.supps)) ? pr.supps : [];
        for (const sid of supps) { tally[sid] = (tally[sid] || 0) + 1; }
      }
      for (const sid of Object.keys(tally)) {
        const c = COMPOUND_BY_ID[sid] || { name: sid, isRx: false, badge: '' };
        adverseByCompound.push({ compound: c.name, n: tally[sid], isRx: c.isRx, badge: c.badge });
      }
      adverseByCompound.sort((a, b) => b.n - a.n);
    }
    return json(res, 200, { biomarkerDeltas, phenotype, byCondition, negativeResults, adverseByCompound: adverseByCompound.slice(0, 20) });
  }
  if (seg[0] === 'admin' && seg[1] === 'overview' && method === 'GET') {
    const u = await currentUser(req); if (!isSuper(u)) return json(res, 403, { error: 'Super-admin only' });
    // 2026-08-08: the `experts` query is gone from this payload — ONE ACCOUNT TYPE. It selected
    // every account with a domain or a requested_domain, and fed the Control Room's
    // "Verified-badge applications" table, which is deleted. Nothing can write those columns now,
    // so the query could only ever have returned an empty array; shipping an empty array under
    // the key `experts` is how the table gets rebuilt.
    const [partners, foods, requests, rcc, feedback, proposals, cedits, members, memberCount] = await Promise.all([
      db.query('SELECT id,name,type,location,link,backlink_url,serves,status,created_at FROM partners ORDER BY status ASC, created_at DESC LIMIT 200'),
      db.query("SELECT f.id,f.name,f.serving,f.data,f.status,f.created_at,u.username AS by_user FROM user_foods f LEFT JOIN users u ON u.id=f.submitted_by WHERE f.status='pending' ORDER BY f.created_at ASC LIMIT 200"),
      db.query("SELECT id,request,detail,votes,status,created_at FROM protocol_requests ORDER BY (status='open') DESC, votes DESC, created_at DESC LIMIT 100"),
      db.query(`SELECT c.id,c.problem_id,c.action,c.root_cause_id,c.name,c.diagnostic,c.domains,c.rationale,c.status,c.created_at,u.username AS by_user,
        (SELECT count(*)::int FROM rootcause_endorsements e WHERE e.change_id=c.id) AS endorsements
        FROM rootcause_changes c LEFT JOIN users u ON u.id=c.submitted_by ORDER BY (c.status='peer_approved') DESC, (c.status='pending') DESC, c.created_at DESC LIMIT 100`),
      db.query("SELECT f.id,f.body,f.page,f.kind,f.contact,f.status,f.created_at,u.username AS by_user FROM feedback f LEFT JOIN users u ON u.id=f.user_id WHERE f.status='open' ORDER BY f.created_at DESC LIMIT 200"),
      db.query(`SELECT p.id,p.problem_id,p.root_cause_id,p.layer,p.domain,p.change,p.evidence,p.status,p.created_at,u.username AS by_user,
        (SELECT COUNT(*)::int FROM proposal_actions a WHERE a.proposal_id=p.id AND a.action='endorse') AS endorsements
        FROM proposals p JOIN users u ON u.id=p.user_id WHERE p.status='pending' ORDER BY p.created_at ASC LIMIT 100`),
      db.query("SELECT e.id,e.compound_id,e.compound_name,e.note,e.created_at,u.username AS by_user FROM edits e JOIN users u ON u.id=e.user_id ORDER BY e.created_at DESC LIMIT 60"),
      // 2026-08-08: was `SELECT username,email,role,domain,domain_verified,…`. Those three told the
      // Control Room's Members table what KIND of account each row was, and all three are dead
      // letters — role is 'user' on every row including the owner's (it is only ever elevated in
      // memory), domain is null and domain_verified is false. Rendering them produced a Role
      // column that read "member" for everybody, the owner included. is_owner is computed with the
      // same isSuper() the request path uses, so the one distinction that exists is the one shown.
      db.query('SELECT id,username,email,google_sub,reputation_points,created_at FROM users ORDER BY created_at DESC LIMIT 500'),
      db.query('SELECT count(*)::int AS n FROM users'),
      // The clinician_interest query was the tenth element here until 2026-08-11 (D-5). The table
      // is dropped; the Control Room has no clinician tab to feed.
    ]);
    // google_sub is used to decide is_owner and then dropped — it is an identity secret, not a
    // column the Control Room needs to see.
    const memberRows = members.rows.map(m => ({ username: m.username, email: m.email, reputation_points: m.reputation_points, created_at: m.created_at, is_owner: isSuper(m) }));
    return json(res, 200, { partners: partners.rows, foods: foods.rows, requests: requests.rows, rootcauseChanges: rcc.rows, feedback: feedback.rows, proposals: proposals.rows, compoundEdits: cedits.rows, members: memberRows, memberCount: memberCount.rows[0].n, threshold: PANEL_THRESHOLD });
  }
  if (seg[0] === 'foods' && seg[1] && seg[2] === 'verify' && method === 'POST') {
    const u = await currentUser(req); if (!u || u.role !== 'admin') return json(res, 403, { error: 'The food queue is not enabled for this account.' });
    const id = pathId(seg[1]); const b = await readBody(req) || {};
    const status = ['active', 'rejected'].includes(b.status) ? b.status : 'active';
    const r = await db.query('UPDATE user_foods SET status=$1, verified_by=$2 WHERE id=$3 RETURNING id,name,status', [status, u.id, id]);
    if (!r.rows[0]) return json(res, 404, { error: 'No such food' });
    return json(res, 200, { ok: true, food: r.rows[0] });
  }
  if (seg[0] === 'admin' && seg[1] === 'partners' && method === 'GET') {
    const u = await currentUser(req); if (!u || u.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const r = await db.query('SELECT id,name,type,location,link,backlink_url,serves,status,created_at FROM partners ORDER BY status ASC, created_at DESC LIMIT 200');
    return json(res, 200, { partners: r.rows });
  }
  if (seg[0] === 'admin' && seg[1] === 'partners' && seg[2] && method === 'POST') {
    const u = await currentUser(req); if (!u || u.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const id = pathId(seg[2]); const b = await readBody(req) || {};
    const status = ['active', 'rejected', 'pending'].includes(b.status) ? b.status : 'active';
    const r = await db.query('UPDATE partners SET status=$1 WHERE id=$2 RETURNING id,name,status', [status, id]);
    if (!r.rows[0]) return json(res, 404, { error: 'No such partner' });
    return json(res, 200, { ok: true, partner: r.rows[0] });
  }
  if (seg[0] === 'proposals' && method === 'GET') {
    const sp = new URL('http://x/' + url).searchParams;
    const pid = clean(sp.get('problem'), 60), rcid = clean(sp.get('rc'), 60);
    if (!pid || !rcid) return json(res, 400, { error: 'problem & rc required' });
    const r = await db.query(
      `SELECT p.id,p.layer,p.domain,p.change,p.evidence,p.status,p.created_at,u.username,
        (SELECT COUNT(*)::int FROM proposal_actions a WHERE a.proposal_id=p.id AND a.action='endorse') AS endorsements,
        (SELECT COUNT(*)::int FROM proposal_actions a WHERE a.proposal_id=p.id AND a.action='flag') AS flags
       FROM proposals p JOIN users u ON u.id=p.user_id
       WHERE p.problem_id=$1 AND p.root_cause_id=$2 ORDER BY p.created_at DESC LIMIT 100`, [pid, rcid]);
    return json(res, 200, { proposals: r.rows });
  }
  // `!seg[1]` added 2026-08-08. Without it this branch swallowed /api/proposals/<id>/endorse and
  // /api/proposals/<id>/flag, whose own handlers sit 20 lines below and never ran — measured:
  // POST /api/proposals/1/endorse returned THIS handler's 403 body. That made both of those gates
  // unreadable as evidence of anything, which matters when the gate is the thing under audit.
  if (seg[0] === 'proposals' && !seg[1] && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    // 2026-08-08 · ONE ACCOUNT TYPE. Three gates stood here — "Set your expert domain first
    // (physio / dietitian / pharmacist)", "Get your expert role verified first (Pro dashboard) to
    // edit protocols", and a per-domain layer lock that told the caller which kind of expert they
    // were. All three described a second account type, and the middle one asserted a verification
    // programme that does not exist. Section editing is Phase 2 and is not launched (PHASE2 =
    // false in site/app.js, and api.addProposal has zero call sites), so the honest gate is the
    // one the rest of the site uses: the owner, and nobody else, until there is a real answer to
    // "who may edit a protocol".
    if (u.role !== 'admin') return json(res, 403, { error: 'Editing a protocol section is not enabled for this account. Use Suggest an edit on the page to send a correction — corrections are welcome and wanted.' });
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Bad request' });
    const pid = clean(b.problemId, 60), rcid = clean(b.rootCauseId, 60), layer = clean(b.layer, 12);
    const change = clean(b.change, 4000), evidence = clean(b.evidence, 500);
    if (!pid || !rcid || !change) return json(res, 400, { error: 'Describe the change' });
    const r = await db.query(
      `INSERT INTO proposals(problem_id,root_cause_id,layer,domain,user_id,change,evidence)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,created_at`, [pid, rcid, layer, null, u.id, change, evidence || null]);   /* `u.domain` -> null, 2026-08-08 (the column is nullable now; see db.js) */
    await award(u.id, 'proposal', r.rows[0].id);
    return json(res, 200, { ok: true, id: r.rows[0].id });
  }
  if (seg[0] === 'proposals' && seg[1] && seg[2] === 'endorse' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    // 2026-08-08 · ONE ACCOUNT TYPE. Three gates stood here and all three described a tier: an
    // account had to hold a `domain`, could not approve its own row, and could only approve a row
    // whose domain matched its own ("Only another physio … Cross-domain experts may Flag
    // instead"). Nobody holds a domain and nobody can be granted one, so the honest gate is the
    // owner's, and the queue that feeds it is Phase-2 plumbing that is not launched.
    if (!isSuper(u) && u.role !== 'admin') return json(res, 403, { error: 'Approving a proposed edit is not enabled for this account.' });
    const id = pathId(seg[1]); if (!id) return json(res, 400, { error: 'bad id' });
    const pr = (await db.query('SELECT domain,user_id FROM proposals WHERE id=$1', [id])).rows[0];
    if (!pr) return json(res, 404, { error: 'Proposal not found' });
    const ins = await db.query(`INSERT INTO proposal_actions(proposal_id,user_id,action) VALUES($1,$2,'endorse')
      ON CONFLICT (proposal_id,user_id,action) DO NOTHING RETURNING id`, [id, u.id]);
    await db.query(`UPDATE proposals SET status='endorsed' WHERE id=$1 AND status!='flagged'`, [id]);
    // 2026-08-08 · THE BADGE IS GONE. These two lines called addBadge(<user>, 'verified-expert')
    // and wrote that literal string into users.badges — the site minting a professional credential
    // for a person nobody has verified, which is the exact thing /corrections publishes as a past
    // mistake. MEASURED: against Postgres 16 on a scratch database, one authenticated
    // POST /api/proposals/2/endorse left `SELECT badges FROM users` reading ["verified-expert"].
    // On the shipped site it could not be reached, but only because a routing shadow (fixed in
    // this same commit) swallowed the endorse route — an accident, not a decision, and the fix
    // would have switched the badge on. The award of points stays: points count what somebody
    // did, which is true. A badge asserts what somebody IS, which nothing here can establish.
    if (ins.rows[0]) {
      await award(pr.user_id, 'merged', id);
      await award(u.id, 'merged', 'endorse:' + id);
    }
    // (the "reviewing keeps your stewardships alive" write went with the stewardship endpoints)
    return json(res, 200, { ok: true });
  }
  if (seg[0] === 'proposals' && seg[1] && seg[2] === 'flag' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in' });
    // 2026-08-08 · ONE ACCOUNT TYPE — same reasoning as the endorse handler above. The old rule
    // ("Same-domain experts endorse, not flag") sorted accounts into professions to decide who
    // could object to what. There are no professions here.
    if (!isSuper(u) && u.role !== 'admin') return json(res, 403, { error: 'Rejecting a proposed edit is not enabled for this account.' });
    const id = pathId(seg[1]); if (!id) return json(res, 400, { error: 'bad id' });
    const pr = (await db.query('SELECT domain FROM proposals WHERE id=$1', [id])).rows[0];
    if (!pr) return json(res, 404, { error: 'Proposal not found' });
    const b = await readBody(req) || {};
    await db.query(`INSERT INTO proposal_actions(proposal_id,user_id,action,note) VALUES($1,$2,'flag',$3)
      ON CONFLICT (proposal_id,user_id,action) DO UPDATE SET note=$3`, [id, u.id, clean(b.note, 500) || null]);
    await db.query(`UPDATE proposals SET status='flagged' WHERE id=$1`, [id]);
    return json(res, 200, { ok: true });
  }

  // --- AI food-photo scan (logged-in, capped, opt-in) ---
  if (seg[0] === 'scan' && method === 'POST') {
    const u = await currentUser(req); if (!u) return json(res, 401, { error: 'Please sign in to scan food photos.' });
    if (!ANTHROPIC_API_KEY) return json(res, 503, { error: 'Photo scanning is not switched on yet. Use the barcode scanner or log by name.' });
    const cnt = await db.query("SELECT COUNT(*)::int AS n FROM scans WHERE user_id=$1 AND created_at > now() - interval '1 day'", [u.id]);
    if (cnt.rows[0].n >= SCAN_CAP) return json(res, 429, { error: `Daily photo-scan limit reached (${SCAN_CAP}/day). Use the free barcode scanner or log by name.` });
    const b = await readBody(req, 4e5); if (!b || !b.image) return json(res, 400, { error: 'No image' });
    const mediaType = /^image\/(jpeg|png|webp|gif)$/.test(b.mediaType || '') ? b.mediaType : 'image/jpeg';
    try {
      const food = await scanFood(b.image, mediaType);
      await db.query('INSERT INTO scans(user_id, kcal) VALUES($1,$2)', [u.id, (food && food.kcal != null) ? Math.round(food.kcal) : null]);
      if (!food || !food.name) return json(res, 200, { food: null });
      const note = food._note; delete food._note;
      return json(res, 200, { food, note });
    } catch (e) { console.error('[scan]', e.message); return json(res, 502, { error: 'Could not analyse the image right now.' }); }
  }

  // --- public contributor showcase: counts of things people actually did here ---
  if (seg[0] === 'contributors' && method === 'GET') {
    // 2026-08-08: the `experts` query was REMOVED. It was
    //   SELECT username, domain, credential FROM users WHERE domain_verified = true
    // on a PUBLIC, UNAUTHENTICATED endpoint — so a free-text credential that a user typed about
    // THEMSELVES would have been published to anyone who asked for it, the moment a badge was
    // granted. It returned an empty array only because its WHERE clause matched nothing, and a
    // query that is safe only because nothing satisfies it is not safe. The key is kept as a
    // constant empty array so any cached client still parses the response shape.
    const experts = { rows: [] };
    const board = await db.query(`SELECT u.username,
        (SELECT COUNT(*)::int FROM edits e WHERE e.user_id=u.id) AS edits,
        (SELECT COUNT(*)::int FROM comments c WHERE c.user_id=u.id) AS comments,
        (SELECT COUNT(*)::int FROM proposals p WHERE p.user_id=u.id) AS proposals
      FROM users u ORDER BY (
        (SELECT COUNT(*) FROM edits e WHERE e.user_id=u.id) +
        (SELECT COUNT(*) FROM comments c WHERE c.user_id=u.id) +
        (SELECT COUNT(*) FROM proposals p WHERE p.user_id=u.id)) DESC LIMIT 25`);
    const leaderboard = board.rows.filter(r => (r.edits + r.comments + r.proposals) > 0);
    // `domain, domain_verified` dropped from this SELECT 2026-08-08: they are null/false on every
    // row and cannot become anything else, so shipping them told the client a profession existed.
    const top = await db.query(`SELECT username, reputation_points, socials
      FROM users WHERE reputation_points > 0 ORDER BY reputation_points DESC, username ASC LIMIT 5`);
    return json(res, 200, { experts: experts.rows, leaderboard, top: top.rows });
  }

  // --- top 3 contributors on a specific protocol (comments + proposals here) ---
  if (seg[0] === 'protocol-contributors' && method === 'GET') {
    const q = new URL('http://x/' + url).searchParams;
    const pid = clean(q.get('problem'), 60), rcid = clean(q.get('rc'), 60);
    if (!pid || !rcid) return json(res, 400, { error: 'problem & rc required' });
    const key = `p:${pid}:${rcid}`;
    // `u.domain, u.domain_verified` dropped 2026-08-08 — same reason as /api/contributors above.
    // ALSO FIXED HERE, and it is not a consequence of that: this query ended
    // `ORDER BY (comments + edits) DESC`, and Postgres accepts an output alias in ORDER BY only as
    // a bare name, never inside an expression. So the statement failed to parse and THIS ENDPOINT
    // HAS ALWAYS RETURNED 500 — reproduced verbatim in psql against the pre-change SQL:
    // `ERROR: column "comments" does not exist`. It had zero callers in site/app.js, which is the
    // only reason nobody found out. Wrapping the projection in a subselect makes the aliases real
    // columns, which is the smallest change that makes the intended ordering legal.
    const r = await db.query(`SELECT * FROM (
        SELECT u.username, u.reputation_points, u.socials,
          (SELECT COUNT(*)::int FROM comments c WHERE c.user_id=u.id AND c.goal_id=$3) AS comments,
          (SELECT COUNT(*)::int FROM proposals p WHERE p.user_id=u.id AND p.problem_id=$1 AND p.root_cause_id=$2) AS edits
        FROM users u
        WHERE u.id IN (SELECT user_id FROM comments WHERE goal_id=$3
                       UNION SELECT user_id FROM proposals WHERE problem_id=$1 AND root_cause_id=$2)
      ) t ORDER BY (t.comments + t.edits) DESC, t.reputation_points DESC LIMIT 3`, [pid, rcid, key]);
    return json(res, 200, { contributors: r.rows });
  }

  // GET /api/admin/experts and POST /api/admin/verify-domain REMOVED 2026-08-08 — ONE ACCOUNT TYPE.
  // These two were the ONLY code paths in the repo that ever set users.domain_verified = true.
  // With them gone the flag cannot be granted by anyone, including the owner, so every account on
  // this site is provably the same kind of account. That is a stronger guarantee than a policy:
  // there is no button, and there is no endpoint behind where the button was.
  // PROVE IT: `/usr/bin/grep -an "domain_verified *= *true" server.js` must return nothing.

  return json(res, 404, { error: 'Not found' });
}

// ---------- static ----------
function sendFile(res, file, code) {
  const ext = path.extname(file);
  // HTML is rewritten at send time by versionAssets(), so it can never be served from a
  // precompressed sibling — it goes through endHtml -> sendBody and is compressed in memory.
  if (ext === '.html') {
    return fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      endHtml(res, data, code);
    });
  }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('Not found'); }
    sendAsset(res.req, res, file, st, ext, code);
  });
}
// serveProfileShell() REMOVED 2026-08-08. /u/:handle now serves the plain SPA shell, like every
// other route the build does not prerender.
//
// MEASURED, both documents, against a DB-enabled server (Postgres 16, scratch db):
//   PRERENDERED (curl /u/ownerfelix): <title>ownerfelix · RNAwiki</title>,
//     <meta name="description" content="ownerfelix's contribution record on RNAwiki — 1375
//     reputation. Stewarded protocols, accepted edits, and professional links.">,
//     <link rel="canonical" href="https://rnawiki.com/u/ownerfelix">, and a JSON-LD Person
//     carrying the same sentence.
//   HYDRATED (headless Chrome, /u/felix): the HOME PAGE — title "RNAwiki — translate the code of
//     human performance into real results", h1 "Turned away, priced out, or told it was nothing.",
//     1,029 words — because site/app.js redirects the retired /u route to "/".
// So this function was injecting a crawlable claim of "stewarded protocols" and "professional
// links" into a document that, for anybody running JavaScript, is the landing page. ~90% of this
// site's traffic never runs JavaScript, so the crawler's copy is the one that mattered, and it
// asserted the one thing the owner has banned twice. A previous fix stripped the literal
// " (verified expert)" from this same string and left the rest of the sentence standing; the
// sentence was the claim.
// Both documents now say the same thing, which is what the two-document rule is for.
function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.split('?')[0]);
  const qp = new URLSearchParams(url.split('?')[1] || '');
  // /plan is a device-specific utility page, not a public search result. It remains followable so
  // a crawler can discover its links to the public wiki, while the page itself stays out of the
  // index. The matching meta directive is authored in build/prerender.js and site/app.js.
  if (p === '/plan' || p === '/plan/') res.setHeader('X-Robots-Tag', 'noindex, follow');
  // /p, the published-protocol index, needs the same treatment and for a sharper reason: 'p' is in
  // NOINDEX_ROUTES, but that list is only consulted by the SPA-shell branch further down. Once
  // build/prerender.js emits site/p.html the static lookup answers first and returns, so the route
  // list never runs and the header would be absent — measured on /az, which is served that way and
  // carries no X-Robots-Tag at all. Followable, so a crawler can still walk from it into the public
  // wiki, but not indexed: it is a frame whose contents are drawn from a database at read time.
  if (p === '/p' || p === '/p/') res.setHeader('X-Robots-Tag', 'noindex, follow');
  // /exercise and its 873 children, for the same reason: they emit real documents now, so the
  // static lookup answers before NOINDEX_SHELL_ROUTES is consulted and the header would be absent.
  // Followable so a crawler can walk from a movement into the muscle and protocol pages it links —
  // which is the entire point of prerendering them — but not indexed while the prose is still the
  // open free-exercise-db dataset. Flip both this and the shell()'s `robots` together.
  if (p === '/exercise' || p.startsWith('/exercise/')) res.setHeader('X-Robots-Tag', 'noindex, follow');
  // Retired progress links encoded a handle and food log directly in the URL. Never render,
  // preview or preserve those parameters: redirects keep the public protocol route while removing
  // health state from browser history, Referer headers, proxy logs and social crawlers.
  if ((/^\/protocol\//.test(p) && (qp.has('by') || qp.has('s') || qp.has('log'))) || (/^\/stack\/?$/.test(p) && qp.has('ids'))) {
    res.statusCode = 302;
    res.setHeader('Location', p);
    res.setHeader('Cache-Control', 'no-store');
    return res.end();
  }
  // ---- /solve?q= FOR READERS WITHOUT JAVASCRIPT (2026-08-01, W2/D11) --------------------------
  // The home hero is a REAL <form action="/solve" method="get">, so the site's FIRST call to action
  // lands the ~90% of readers who never run JS on /solve?q=<their words>. Measured before this:
  // /solve and /solve?q=knee%20pain were the same 16,222 bytes, so they were shown the unfiltered
  // list with no acknowledgement of what they had typed, and no field to correct it in.
  //
  // This does NO body surgery. Everything it needs -- both headings, the term slots, and one card
  // per problem -- is authored in build/prerender.js and hidden by CSS. The server only:
  //   (a) injects one <style> that hides the NON-matching cards (never a display value it has to
  //       restore, so no layout knowledge leaks into this file) and `order:`s the matches,
  //   (b) flips #q-hits or #q-none visible with a single id-keyed substitution,
  //   (c) fills <em class="q-term"> and the input's value.
  // Same pattern the newsletter completion state on "/" used until 2026-08-06; this is now the only
  // place on the site that does it, so treat it as the reference implementation. The query is never
  // logged and never reaches analytics -- it is a symptom description typed by a stranger.
  if (p === '/solve' && (qp.get('q') || '').trim()) {
    const q = String(qp.get('q')).slice(0, 120);
    return fs.readFile(path.join(DIR, 'solve.html'), 'utf8', (e, html) => {
      if (e) return sendFile(res, path.join(DIR, 'index.html'));
      const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const guidance = solveGuidance(q);
      const hits = guidance ? [] : searchSolve(q);
      const ids = hits.map((h) => h.id);
      let css;
      if (guidance) {
        css = '';
        html = html.replace(`id="q-${guidance === 'urgent' ? 'urgent' : 'review'}"`, `id="q-${guidance === 'urgent' ? 'urgent' : 'review'}" data-on`);
      } else if (ids.length) {
        const off = SOLVE_INDEX.problems.map((x) => x.id).filter((id) => ids.indexOf(id) < 0);
        css = '#q-hits .solve-card{order:99}'
          + ids.map((id, i) => `#q-hits .solve-card[data-pid="${id}"]{order:${i}}`).join('')
          + (off.length ? off.map((id) => `#q-hits .solve-card[data-pid="${id}"]`).join(',') + '{display:none}' : '');
        html = html.replace('id="q-hits"', 'id="q-hits" data-on');
        // Honest heading: say "mentions" when nothing matched the problem's NAME, only its body text.
        if (hits[0].s < 18) html = html.replace('>Closest match for <', '>Nothing is named this — these mention <');
      } else {
        css = '';
        html = html.replace('id="q-none"', 'id="q-none" data-on');
      }
      html = html
        .replace(/<em class="q-term"><\/em>/g, `<em class="q-term">“${esc(q)}”</em>`)
        .replace('id="solve-q" name="q" type="search" value=""', `id="solve-q" name="q" type="search" value="${esc(q)}"`)
        .replace('</head>', `<style id="q-filter">${css}</style></head>`);
      endHtml(res, html);
    });
  }
  // ---- /?state= — THE ANSWER, FOR READERS WITHOUT JAVASCRIPT (2026-08-08) ---------------------
  // Was /interest?state= for part of one day. The interest page was merged into the home page on the
  // owner's instruction ("there will no longer be 2 landing pages"), so the form, the seven panels
  // and both substitution targets are in home.html now and this handler follows them. /interest and
  // any query on it 301s here — see LEGACY_REDIRECTS — so a URL already handed to a reader still
  // lands on the answer it was minted for.
  // POST /api/interest 303s back to here with the answer in the query string. This is the same
  // pattern as /solve?q= above, which the note there calls the reference implementation, and which
  // is what the newsletter's ?subscribed=1 / ?suberr= did until 2026-08-06.
  //
  // NO BODY SURGERY, and the contract with the page is deliberately as small as it can be:
  //   1. `data-state="<state>"` is stamped on the <html> ELEMENT. Not on a wrapper div — the <html>
  //      tag is written by the shell, exists on every prerendered document, is the one element
  //      hydration cannot destroy, and needs no cooperation from the page's body markup at all.
  //      The page's stylesheet reveals its own panel with html[data-state="ok"] .istate-ok{…}.
  //   2. On `ok` only: the removal link. <a class="i-rm" href=""></a> gets the href and the visible
  //      URL. This is the reader's ONLY copy of that token, because nothing sends email yet.
  //   3. On `remove` only: <input type="hidden" name="t" value=""> gets the token, so the confirm
  //      panel's button POSTs it. GET NEVER DELETES.
  // A substitution that finds nothing is logged loudly rather than swallowed, because the failure
  // it produces — a page that says "here is your link" and shows none — is silent otherwise.
  //
  // THE STATES, all seven authored in the page and hidden by its own CSS:
  //   ok       stored, and here is the link that deletes it
  //   dupe     that address was already on the list; nothing changed and there is no second row
  //   bad      that address did not look like an address; NOTHING WAS SAVED
  //   rate     too many signups from this connection today; nothing was saved
  //   down     the database is unreachable; nothing was saved, and it is my fault not yours
  //   remove   are you sure? (a button, not a link)
  //   removed  that address is not on the list
  //
  // 2026-08-09 — THIS BRANCH IS NOW DARK, AND DELIBERATELY LEFT IN PLACE. The interest form and its
  // seven answer panels were removed from the landing page on the owner's instruction ("i just need
  // 1 CTA: search and protocol"). POST /api/interest, POST /api/interest/remove and the table are
  // untouched and still work — nothing was dropped — but there is no longer a panel on "/" for an
  // answer to be revealed in, so stamping data-state would produce a page with a state on it and
  // nothing to show, and both substitutions would log a miss on every hit. `HAS_ANSWER_PANELS` reads
  // the page that was actually built rather than assuming either way, so if the panels ever come
  // back this handler starts working again with no edit. An arrival with ?state= (a stale bookmark,
  // or a /interest?state=ok&t=… redirect) is served the ordinary landing page at 200 — which is what
  // an unrecognised ?state= has always been served.
  // LEFT BEHIND, for the record: a reader who was handed a removal link before today can no longer
  // press it from the page. The endpoint still accepts the POST. See the commit message.
  if (p === '/' && qp.get('state') && HAS_ANSWER_PANELS()) {
    const STATES = ['ok', 'dupe', 'bad', 'rate', 'down', 'remove', 'removed'];
    let state = STATES.indexOf(String(qp.get('state'))) >= 0 ? String(qp.get('state')) : '';
    const tok = /^[A-Za-z0-9_-]{16,48}$/.test(String(qp.get('t') || '')) ? String(qp.get('t')) : '';
    // A removal URL with no usable token has nothing to confirm, so there is nothing to ask about.
    // The only true sentence left is the one `removed` already says.
    if (state === 'remove' && !tok) state = 'removed';
    // An unrecognised ?state= is not an error, it is somebody's stale bookmark or a hand-typed
    // query: fall through to the ordinary home page rather than 404ing the site's front door.
    if (!state) return fs.readFile(path.join(DIR, 'home.html'), (e, html) => (e ? sendFile(res, path.join(DIR, 'index.html')) : endHtml(res, html)));
    return fs.readFile(path.join(DIR, 'home.html'), 'utf8', (e, html) => {
      // No page: fall back to the SPA shell, which is what "/" itself does when home.html is
      // missing. Loud in the log, because this is a redirect target that stopped existing.
      if (e) { console.error('[interest] /?state=' + state + ' but site/home.html is missing —', e.code); return sendFile(res, path.join(DIR, 'index.html')); }
      const need = (before, after, what) => {
        if (html.indexOf(before) < 0) { console.error('[interest] the page has no ' + what + ' — /?state=' + state + ' cannot fill it in. Expected the literal: ' + before); return; }
        html = html.split(before).join(after);
      };
      if (/<html\b/.test(html)) html = html.replace(/<html\b/, `<html data-state="${state}"`);
      else console.error('[interest] no <html> element in site/home.html — the state cannot be stamped.');
      if (state === 'ok' && tok) {
        const href = '/?state=remove&t=' + tok;
        // The href carries #answer for the same reason the 303s above do; the visible text does
        // not, because this string is the reader's ONLY copy of that URL (nothing sends email yet)
        // and it is the one they may write down or paste. A trailing #answer in printed link text
        // is noise.
        need('<a class="i-rm" href=""></a>', `<a class="i-rm" href="${escHtml(href)}#answer">${escHtml(SITE_URL + href)}</a>`, 'removal link (a.i-rm)');
      }
      if (state === 'remove') need('<input type="hidden" name="t" value="">', `<input type="hidden" name="t" value="${escHtml(tok)}">`, 'removal token field');
      // THE CHIP THE READER ALREADY CHOSE. The POST handler above builds `keep` precisely so the
      // form they land on is the form they left, and until this block existed nothing read it: the
      // browser ended on ?state=down&topic=hip&creator=1 with every control back at its
      // default, so a reader whose address had a typo re-answered question 1 from scratch. There is
      // no JavaScript on this page, so `checked` has to be written into the markup, and this
      // handler is the only thing that knows. Validated against the SAME INTEREST_TOPICS list
      // POST /api/interest matched it against, so a hand-typed ?topic= cannot pre-check an answer
      // the write path would discard. Deliberately NOT done for the address — see the note in the
      // POST handler on why that one is not carried back.
      const back = String(qp.get('topic') || '');
      if (back && INTEREST_TOPICS.indexOf(back) >= 0) {
        need(`id="i-f-${back}" value="${back}" required`, `id="i-f-${back}" value="${back}" required checked`, `the "${back}" chip`);
      }
      if (qp.get('creator') === '1') {
        need('<input class="i-o" type="checkbox" name="creator" id="i-f-ck" value="1">', '<input class="i-o" type="checkbox" name="creator" id="i-f-ck" value="1" checked>', 'the creator checkbox');
      }
      endHtml(res, html);
    });
  }
  // "/" serves the prerendered crawlable home if present, else the SPA shell
  if (p === '/') {
    return fs.readFile(path.join(DIR, 'home.html'), (e, html) => {
      if (e) return sendFile(res, path.join(DIR, 'index.html'));
      // The `?subscribed=1` / `?suberr=` un-hide lived here until 2026-08-06. It revealed the
      // newsletter's `.nl-done` / `.nl-bad` paragraph for readers without JS. Its only producer was
      // the 303 in /api/subscribe and its only target was a paragraph in nlBlock(); all three are
      // gone, so this is now a substitution with nothing to match. "/" serves home.html verbatim.
      endHtml(res, html);
    });
  }
  const safe = path.normalize(p).replace(/^(\.\.[/\\])+/, '');
  const file = path.join(DIR, safe);
  if (!file.startsWith(DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  // The precompressed siblings written by build/precompress.js live beside their sources inside
  // site/, so without this they would be directly fetchable at /data.js.br — a second, crawlable
  // URL for the same bytes, served as application/octet-stream with no Content-Encoding (i.e. a
  // download of brotli soup). They are an encoding of an existing resource, not a resource.
  // A hard 404, not serveMissing() — serveMissing falls through to the SPA shell at HTTP 200 for
  // any path outside GENERATED_ROUTES, and a 200 is an invitation to index it.
  if (/\.(br|gz)$/.test(safe)) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Not found'); }
  fs.stat(file, (err, st) => {
    if (!err && st.isFile()) {
      const ext = path.extname(file);
      if (ext === '.html') return fs.readFile(file, (e, d) => (e ? serveMissing(res, safe) : endHtml(res, d)));
      return sendAsset(req, res, file, st, ext, 200);
    }
    // clean-path routing: try the prerendered <path>.html for crawlable SEO pages
    if (!path.extname(file)) {
      return fs.readFile(file + '.html', (e2, html) => {
        if (!e2) return endHtml(res, html);
        return serveMissing(res, safe);
      });
    }
    serveMissing(res, safe);
  });
}

// Added 2026-07-28. Every unknown path used to fall through to index.html at HTTP 200. For a
// generated content route that is WORSE than a soft-404: index.html uses relative script srcs, so
// /compare/gone resolves data.js to /compare/data.js and the visitor gets a BLANK WHITE PAGE at
// HTTP 200, which a crawler reads as a real, thin page. This matters now because tightening the
// compare generator (no prescription/controlled/unapproved pairs) took /compare from 404 URLs to
// 107 -- 297 URLs that were previously indexed no longer exist.
//
// Content routes are fully enumerated by the prerenderer, so "no file" means "no such page":
//   /compare/*  -> 410 Gone      (deliberately withdrawn; tells Google to drop it and stop retrying)
//   other route -> 404 Not Found
// Anything else still gets the SPA shell, so client-side routing keeps working.
// /newsletter was folded into the home page (2026-07-28) and the newsletter was removed entirely
// (2026-08-06). KEEP the redirect rather than deleting it: the URL sat in the footer of every
// prerendered page for over a month and is in Google's index, and an unknown top-level path here
// falls through to the SPA shell at HTTP 200 (measured: /nope -> 200, 4,871 B), i.e. a soft 404.
// The target moved from '/#newsletter' to '/' because that fragment no longer exists.
// /interest was folded into the home page on 2026-08-08 for the same reason and by the same route:
// the URL was published, is in the sitemap that shipped, and every removal link handed out so far
// is on that host path. It may never 404, and an unknown top-level path here falls through to the
// SPA shell at HTTP 200 — i.e. a soft 404, which is worse.
// /corrections was deleted on 2026-08-13 and its full log moved, verbatim, to /methodology under
// "What has already been wrong". The route was in the published sitemap and carried the site's
// public error record, so it 301s to where that record now lives rather than 404ing. Not a 410:
// nothing was withdrawn, it moved. build/withdrawn.json carries the same reason.
const LEGACY_REDIRECTS = { '/newsletter': '/', '/interest': '/', '/corrections': '/methodology' };

// ---- COMPOUND SHORT-NAME ALIASES (2026-07-30) ------------------------------------------------
// "do not ever leave a page as an error." /c/creatine, /c/collagen, /c/testosterone and /c/insulin
// all 404'd, because the entries are named "Creatine Monohydrate", "Collagen Peptides" and so on —
// and the short form is exactly what a reader types. Built at parse time from each compound's own
// name; only unambiguous aliases are kept, plus a small curated set where the automatic rule has to
// be overruled (see ALIAS_OVERRIDE in build/parse.js — "insulin" must reach the medicine, not the
// anabolic-misuse entry). 257 aliases, so this whole class of dead end is gone.
const COMPARE_BY_SLUG = new Map();   // slug(compound name) -> { id, name, slug }
const COMPARE_RESTRICTED = new Set(); // slugs whose compound may not be ranked against a supplement
const escHtml = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let COMPOUND_ALIASES = {};
// The /solve?q= search index, authored once in build/parse.js. This exists so the ~90% of readers
// who never run JavaScript get an answer to the query they typed into the home hero's real GET
// form. Before this, /solve and /solve?q=<anything> were the same 16,222 bytes.
let SOLVE_INDEX = { problems: [], stop: [] };
try {
  const dj = fs.readFileSync(path.join(__dirname, 'site', 'data.js'), 'utf8');
  const m = dj.match(/^window\.RNAWIKI_DATA = ([\s\S]*);\s*$/);
  if (m) {
    const _d = JSON.parse(m[1]);
    COMPOUND_ALIASES = _d.compoundAliases || {};
    // /interest's chips, authored in data/site_config.json and carried here by build/parse.js.
    // One definition for the page that renders the radios and the endpoint that validates them.
    INTEREST_TOPICS = ((((_d.site || {}).interest || {}).topics) || []).map((t) => t.id).filter(Boolean);
    const _g = _d.graph || {};
    SOLVE_INDEX = {
      problems: (_g.problems || []).map((p) => ({
        id: p.id, name: p.solveName || '', hay: p.solveHay || '',
        alias: p.solveAlias || '', phrases: p.solvePhrases || [],
      })),
      stop: _g.solveStopwords || [],
    };
    // W4.5: the corpus behind the /compare withdrawal notice (see compareVerdict below). Same slug
    // rule as build/prerender.js:171 and the same restricted set as its isConsumerRenderable(), so
    // the notice is derived from the record rather than typed next to it.
    (_d.compounds || []).forEach((c) => {
      const sl = String(c.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (!sl) return;
      COMPARE_BY_SLUG.set(sl, { id: c.id, name: c.name, slug: sl });
      if (!['supplement', 'otc'].includes(c.regulatory_class)) COMPARE_RESTRICTED.add(sl);
    });
  }
  console.log('[server] compound aliases loaded:', Object.keys(COMPOUND_ALIASES).length);
  console.log('[server] solve index loaded:', SOLVE_INDEX.problems.length, 'problems');
  console.log('[server] compare slugs loaded:', COMPARE_BY_SLUG.size, '(' + COMPARE_RESTRICTED.size + ' restricted)');
  console.log('[server] interest topics loaded:', INTEREST_TOPICS.length, INTEREST_TOPICS.length ? '(' + INTEREST_TOPICS.join(', ') + ')' : '— POST /api/interest will store every topic as NULL');
} catch (e) { console.warn('[server] no compound aliases:', e.message); }

// Safety-sensitive searches are routed before fuzzy matching. Keep these patterns identical to
// solveGuidance() in site/app.js: the no-JS document and hydrated page must never disagree about
// whether a query is safe to approximate.
function solveGuidance(q) {
  const s = String(q || '').toLowerCase().replace(/[^a-z0-9']+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!s) return null;
  const urgent = [
    /\bchest ?pains?\b/, /\bchest (pressure|tightness|discomfort)\b/, /\b(my )?chest (hurts?|aches?|is tight)\b/,
    /\b(pain|ache|pressure|tightness|discomfort) (in|across) (my |the )?chest\b/, /\bheart attack\b/, /\bstroke\b/,
    /\bface droop\b/, /\bone sided (weakness|numbness)\b/, /\b(weakness|numbness) (on|down) (my |the )?(left|right|one) side\b/,
    /\bthunderclap headache\b/, /\b(sudden|new) (slurred speech|speech difficulty|confusion|one sided weakness)\b/,
    /\b(cannot|can't|cant|can not|unable to) breathe\b/, /\b(cannot|can't|cant|can not|unable to) catch (my )?breath\b/,
    /\b(trouble|difficulty|hard|struggl\w*) (to )?breath(e|ing)\b/, /\bshortness of breath\b/, /\bbreathless\b/, /\banaphyla\w*\b/,
    /\boverdose\b/, /\bpoison(ed|ing)?\b/,
    /\b(unconscious|unresponsive|passed out|fainted|fainting)\b/, /\bseizures?\b/, /\bsevere bleeding\b/,
    /\bsuicid\w*\b/, /\bsuicdal\b/, /\bself harm\w*\b/, /\bself injur\w*\b/, /\b(kill\w*|hurt\w*) myself\b/,
    /\b(want to die|end my life|take my own life|don't want to live|dont want to live|better off dead|no reason to live)\b/,
  ];
  if (urgent.some(re => re.test(s))) return 'urgent';
  const review = [
    /\b(pregnan\w*|pregn\w*|pregant|pregancy|pregnacy|pregnet|pregnent|pregenan\w*|pregrant)\b/,
    /\bbreast ?feed\w*\b/, /\b(infant|child|children|teenager|under 18)\b/,
    /\b(warfarin|anticoagulant|blood thinner|lithium|digoxin)\b/,
    /\b(drug|medicine|medication) interaction\b/, /\bcombine (my )?(drugs|medicines|medications)\b/,
    /\bcombine (a |my )?(supplement|compound)s? with (a |my )?(drug|medicine|medication)s?\b/,
  ];
  if (review.some(re => re.test(s))) return 'professional_review';
  const interactionIntent = /\b(take|taking|use|using|mix|mixing|combine|combining|stack|stacking|pair|pairing)\b(?:\s+[a-z0-9']+){1,10}\s+\b(with|and|plus|alongside|together with)\b(?:\s+[a-z0-9']+){1,10}\b/;
  const namedMedicine = /\b(warfarin|coumadin|sertraline|zoloft|fluoxetine|prozac|escitalopram|lexapro|lithium|digoxin|metformin|semaglutide|ozempic|wegovy|tirzepatide|mounjaro|insulin|levothyroxine|ibuprofen|naproxen|aspirin|paracetamol|acetaminophen|statins?|atorvastatin|antidepressants?|antibiotics?|birth control|ephedrine)\b/;
  const namedSupplement = /\b(creatine|magnesium|zinc|melatonin|ashwagandha|berberine|turmeric|curcumin|caffeine|fish oil|omega ?3|vitamin ?[a-k]|multivitamin|st john'?s wort|protein powder|supplements?|herbals?|herbs?)\b/;
  const joiningWord = /\b(with|and|plus|alongside|together with)\b/;
  return interactionIntent.test(s) || (namedMedicine.test(s) && namedSupplement.test(s) && joiningWord.test(s))
    ? 'professional_review'
    : null;
}

// The SAME scoring loop as rankProblems() in site/app.js. Both read the index above; the weights
// and the 0.34 relative cut must stay identical or the crawler document and the hydrated document
// answer the same query differently. scripts/smoke.mjs asserts they do not (solve-q-parity).
// A boolean substring filter was tried first and measured useless: "low testosterone" matched
// 37 of 41 problems, "cant sleep" 28. This ranks, and it never hides the full list.
function searchSolve(q) {
  if (solveGuidance(q)) return [];
  const stop = SOLVE_INDEX.stop;
  const T = [...new Set(String(q || '').toLowerCase().replace(/[^a-z0-9']+/g, ' ').split(' ')
    .filter((t) => t.length >= 3 && stop.indexOf(t) < 0))].slice(0, 8);
  if (!T.length) return [];
  const nq = ' ' + String(q || '').toLowerCase().replace(/[^a-z0-9']+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  const sc = SOLVE_INDEX.problems.map((p) => {
    const al = p.alias || '';
    let s = 0;
    // Tier 0 — an authored alias phrase from data/solve_aliases.json, scored ONCE. Same rule and
    // same weight as rankProblems() in site/app.js; if you change one, change the other.
    if ((p.phrases || []).some((ph) => nq.indexOf(ph.slice(1, -1)) >= 0)) s += 40;
    T.forEach((t) => {
      const st = t.length >= 6 ? t.slice(0, 5) : null;
      if (p.name === ' ' + t + ' ') s += 30;
      else if (p.name.indexOf(' ' + t + ' ') >= 0) s += 18;
      else if (al.indexOf(' ' + t + ' ') >= 0) s += 14;
      else if (p.name.indexOf(' ' + t) >= 0) s += 10;   // word PREFIX, not substring — see app.js
      else if (p.hay.indexOf(' ' + t + ' ') >= 0) s += 4;
      else if (p.hay.indexOf(t) >= 0) s += 1;
      else if (st && (p.name.indexOf(st) >= 0 || al.indexOf(st) >= 0 || p.hay.indexOf(st) >= 0)) s += 1;
    });
    return { id: p.id, s, len: p.name.length };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.len - b.len);
  if (!sc.length) return [];
  const cut = sc[0].s * 0.34;
  return sc.filter((x) => x.s >= cut).slice(0, 3);
}

const GENERATED_ROUTES = ['c', 'compare', 'protocol', 'target', 'pathway', 'muscle', 'goal', 'learn', 'physiology', 'energy'];

// Routes site/app.js route() answers but build/prerender.js does not emit a file for. They must
// still get the SPA shell at 200; everything NOT in this list and not in GENERATED_ROUTES is a real
// 404. Read off every `parts[0] === '…'` branch in app.js — keep it in step with that, or a working
// page starts answering 404. `progress` is the one the smoke test caught when this list was missing.
const SPA_ONLY_ROUTES = [
  'about', 'admin', 'anatomy', 'az', 'body', 'browse', 'exercise', 'fork', 'fuel',
  'legend', 'me', 'p', 'pathways', 'plan', 'progress', 's', 'solve', 'stack',
  'studio', 'u', 'where',
];
// ---- ROUTES WHOSE CHILDREN ARE A CLOSED SET (2026-08-13) -------------------------------------
// MEASURED LIVE: https://rnawiki.com/fuel/zzz/qqq answered 200 with
// <meta name="robots" content="index,follow"> and a canonical to itself. So did every other
// invented pair — /fuel/<anything>/<anything> was an UNBOUNDED INDEXABLE URL SPACE, which is one of
// the concrete reasons a site "doesn't show up on Google": a crawler that can generate infinite
// distinct 200s spends its budget there instead of on the 567 real pages.
// `fuel` is in SPA_ONLY_ROUTES because /fuel itself is an SPA index — but its CHILDREN are exactly
// the 52 emitted /fuel/<pid>/<rcid> documents and nothing else. Anything under one of these
// prefixes that the build did not emit is a real 404, not a shell.
// 'exercise' JOINED THIS SET on 2026-08-14, the moment it started emitting documents. Its children
// are now exactly the 873 files build/prerender.js writes, so anything else at /exercise/<x> is an
// invented URL — and answering one with the SPA shell at HTTP 200 is the soft 404 that made
// /fuel/<anything>/<anything> an unbounded indexable space. Measured before the change:
// /exercise/nope -> 200.
const CLOSED_CHILD_ROUTES = new Set(['fuel', 'problem', 'protocol', 'goal', 'compare', 'target', 'pathway', 'muscle', 'exercise']);
// ---- 'clinic', 'pro', 'pros', 'stewardship' LEFT THIS LIST ON 2026-08-11 -----------------------
// All four were surfaces of the abolished professional/clinician tier, and all four were RETIRED
// INSIDE app.js route() — the branch is
//     ['pros','pro','stewardship','contributors','for-clinicians','clinic','u','gp'] -> home()
// with a `history.replaceState(null, '', '/')`. So each answered HTTP 200 and rendered the LANDING
// PAGE under its own self-canonical URL, then quietly rewrote the address bar. Four more copies of
// the home page, and the deeper /clinic branches below that one (`parts[0] === 'clinic' && parts[3]`
// at app.js:10180 and :10278) were unreachable dead code — the retired branch sets parts.length = 0
// first, and the file's own comment on the next line says "dead:".
//
// Being in this list is what turned that into an indexable duplicate: without it, an unknown root
// segment is a real 404. Felix asked for everything requiring a clinician to be removed, and a
// retired route that impersonates the home page is worse than a 404 for a reader, a crawler and
// anybody reading this file. They 404 now.
// W7 C7 (2026-08-10): 'studio' and 'p'.
// MEASURED before this: `curl localhost:8099/studio` -> 404 and `curl localhost:8099/p/abc` -> 404,
// while POST /api/protocols has been minting `${SITE_URL}/p/${code}` as the share URL since
// 2026-08-09. The one endpoint whose whole job is to hand somebody a link was handing out a link
// this server answers 404 to.
// Neither is prerendered, and that is deliberate: both are interactive views over live database
// rows, so a prerendered twin would be a stale document with somebody else's protocol in it.
// assertLinkGraph stays green because nothing in an emitted .html links to either path — every
// inbound link is `#/studio` or `#/p/<code>`, and norm() in prerender.js returns null for an href
// beginning with '#'. The cost, stated rather than hidden: a crawler and a no-JS reader cannot
// reach the Studio. That is the correct trade for a builder, and it is why the Studio is NOT in
// the global nav — a nav link that does nothing for 90% of traffic is worse than no link.
// 'p' is safe as a one-letter prefix: the prerendered-file lookup runs BEFORE this list, and the
// only root paths beginning with p are pathway/, pathways.html, physiology/, plan.html, problem/
// and protocol/ — all matched as whole segments. 'u' is the existing precedent for a one-letter
// live route.

// ---- THE PRIVATE SHELL SET (2026-08-10) -------------------------------------------------------
// Of the routes above, these render ONE PERSON: their own page, somebody else's, or a document one
// reader wrote. MEASURED, PRERENDERED document, curl against localhost:8099 on this branch:
//     GET /u/felix   -> 200, <meta name="robots" content="index,follow,max-image-preview:large">
//     GET /p/abc123  -> 200, the same
//     GET /studio    -> 200, the same
//     GET /progress  -> 200, the same
// All four fall through serveMissing() to site/index.html, whose head is the HOME PAGE's head — so
// every one of them invited Google to index it, and /p/<code> is the URL POST /api/protocols has
// been minting as the share link since 2026-08-09. The one endpoint whose whole job is to hand
// somebody a link was handing out an indexable one.
//
// A page listing a named person's health protocols does not belong in a search index. Publishing
// is a link you hand out, not a listing you get found by.
//
// DELIBERATELY NOT robots.txt — see the note at the top of this file: a disallowed URL is never
// FETCHED, so the noindex inside it is never read, and anything already indexed stays indexed. A
// directive is the only thing that removes it.
//
// site/app.js holds the same list as PRIVATE_ROUTES, because the HYDRATED document needs the same
// directive; part (3) of assertProfileDisclosesOnlyPublished() in build/parse.js fails the build if
// the two ever diverge. (That comment named a function `assertPrivateRoutesAgree()` that has never
// existed under that name — corrected 2026-08-11 so nobody goes looking for a gate by grepping it.)
// Part (4) of the same gate is the one that would have caught /clinic, /exercise and /fork: it
// requires every SPA-only route with no prerendered file to be classified into one of the two
// noindex lists.
const NOINDEX_ROUTES = ['admin', 'me', 'p', 'progress', 's', 'studio', 'u'];

// `clinic` ADDED 2026-08-11 (P0-P2). MEASURED on production that morning:
//     curl -D- https://rnawiki.com/clinic  ->  200, no X-Robots-Tag at all, 1,148 words of the
//     LANDING PAGE, self-canonical to /clinic.
// It belongs in THIS list rather than the shell list below because of what the route actually
// renders once JavaScript runs: `/clinic/<handle>/<problem>/<root-cause>` is one named clinician's
// home-care protocol for one named health problem (app.js:9650 writes the title
// "<problem> — home-care protocol from @<handle>"). That is the same disclosure class as /u and /p —
// a handle joined to a health condition — and it is the exact join the profile-disclosure gate
// exists to keep out of a search index.

// ---- THIN SPA SHELLS (2026-08-11, P0-P2) ------------------------------------------------------
// These are NOT private. They are noindexed because of what the PRERENDERED document contains:
// nothing. The build emits no file for them, so a crawler gets the SPA shell — the HOME page's
// head, self-canonical to the thin URL — and the hydrated body is a two-word placeholder
// ("Loading exercise…" app.js:9998, "Loading variation…" app.js:9999). ~90% of traffic never runs
// JavaScript, so for almost every requester these URLs are duplicate-content soft 404s.
//   · fork — MEASURED live 2026-08-11: 200, no X-Robots-Tag.
//   · exercise LEFT THIS LIST on 2026-08-14, under the rule stated at the bottom of this comment:
//     build/prerender.js now emits site/exercise.html plus 873 site/exercise/<id>.html documents
//     with the muscles worked, the steps, the alternatives and the protocols that use the movement.
//     They carry their own noindex,follow in their bytes and an X-Robots-Tag is set for them in
//     serveStatic(), because the static-file lookup answers before this list is ever consulted.
//   · fuel@3 — the same defect, found by the gate below rather than by any audit. `site/fuel/` holds
//     41 problem directories and no `fuel.html`, so the CHOOSER at bare /fuel fell through to the
//     shell while all 52 `/fuel/<problem>/<root-cause>` children are correctly `noindex,follow`.
//     Noindexing the parent costs nothing: none of the children are in the sitemap either (D-7).
//
// `@N` MEANS: a shell only at fewer than N segments; at N or more this route HAS a prerendered
// document and must keep the directive that document carries. Without it the hydrated /fuel/<p>/<rc>
// would be rewritten to `noindex,nofollow` while its own prerendered bytes say `noindex,follow` —
// one document saying two things, the defect this whole block exists to prevent. Server-side the
// qualifier is belt-and-braces (the prerendered-file lookup runs first), but the two lists must stay
// TEXTUALLY IDENTICAL to the mirror in site/app.js, because that is what the build gate diffs.
//
// The honest fix for all three is a prerendered document with real content. Until one exists, the
// document that IS served must not invite indexing. Remove a route from this list at the moment it
// starts emitting a file — the gate in build/parse.js will then require it to be classified again.
const NOINDEX_SHELL_ROUTES = ['fork', 'fuel@3'];
const isShellNoindex = (seg) => NOINDEX_SHELL_ROUTES.some((e) => {
  const at = e.indexOf('@');
  return at < 0 ? e === seg[0] : e.slice(0, at) === seg[0] && seg.length < +e.slice(at + 1);
});
const isNoindexRoute = (seg) => NOINDEX_ROUTES.includes(seg[0]) || isShellNoindex(seg);

// Private SPA routes still need an honest first document. Without this rewrite, a crawler or link
// unfurler receives the landing page title and description until JavaScript runs, while a reader
// ends on the route-specific identity below. The browser smoke gate compares both documents and
// fails if these strings drift from setPageMeta() in site/app.js.
function spaShellMeta(seg) {
  const suffix = ' · RNAwiki';
  if (seg[0] === 'studio') return {
    title: 'Protocol Studio — build a protocol and have it checked' + suffix,
    description: 'Assemble compounds, movements, Singapore foods and daily tools into one protocol, and see every dangerous pairing as you build it. No account needed to build, keep or run it.',
  };
  if (seg[0] === 'me') return {
    title: 'Your page — what you follow and what you built' + suffix,
    description: 'Your plan, your logged days and the protocols you built. It works with no account, it is not indexed, and nothing on it is public.',
  };
  if (seg[0] === 'p' && seg[1]) return {
    title: 'A protocol somebody built' + suffix,
    description: 'A protocol built and published by a reader on RNAwiki, re-checked against the corpus as it is today. Reading it needs no account.',
  };
  if (seg[0] === 'u' && seg[1]) return {
    title: '@' + String(seg[1]).slice(0, 24) + suffix,
    description: 'The protocols this person published on RNAwiki. Nothing they read, plan, log or follow appears here.',
  };
  return null;
}
function rewriteSpaShellHead(html, seg) {
  const meta = spaShellMeta(seg);
  if (!meta) return html;
  const title = escHtml(meta.title);
  const description = escHtml(meta.description);
  const canonical = 'https://rnawiki.com/' + seg.map((part) => encodeURIComponent(part)).join('/');
  return String(html)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`)
    .replace('<meta name="twitter:image"', `<meta name="twitter:title" content="${title}">\n<meta name="twitter:description" content="${description}">\n<meta name="twitter:image"`);
}

// ---- W4.5 (2026-08-02) · A WITHDRAWAL NOTICE MUST NOT INVENT ITS OWN REASON -------------------
// Every unknown /compare/* URL used to answer HTTP 410 with ONE hard-coded sentence: "I removed the
// head-to-head comparisons that pitted a prescription or controlled medicine against a supplement."
// That sentence is true of the 2026-07-28 policy withdrawal and false of everything else, and
// "everything else" is not hypothetical. MEASURED (curl, localhost:8099, 2026-08-02): the three
// URLs that were in the published sitemap at W0 and are not in it now —
//     /compare/creatine-monohydrate-vs-sodium-bicarbonate
//     /compare/sodium-bicarbonate-vs-vitamin-d3-k2
//     /compare/sodium-bicarbonate-vs-whey-casein-protein
// each returned 410 with that paragraph verbatim. All six compounds involved are
// `regulatory_class: supplement`. Nothing was withdrawn on policy grounds; Sodium Bicarbonate fell
// from rank 8 to rank 9 of the `muscle` goal when EPO was re-filed into that category, and the
// generator only pairs a goal's top eight. So the site told a reader — and told Google, with the
// one status code that means "never come back" — a reason that its own corpus contradicts.
//
// The answer is now DERIVED from the two compound slugs in the URL, so the copy cannot drift from
// the data. Three cases, three honest answers:
//   * one side is prescription / controlled / unapproved / pharmacy  -> 410, the policy sentence,
//     which is now only ever printed when it is TRUE of the pair being asked for.
//   * both sides are consumer compounds -> 404, and it says what actually happened: the pair is not
//     currently published, both compounds are still here, and here are their two pages. 404 rather
//     than 410 because 410 asserts permanence, and a page that a ranking cut removed is a page a
//     ranking cut can restore. Claiming less is the safe direction.
//   * either slug is not a compound -> 404, no reason offered, because none is known.
// Built from site/data.js at boot, next to COMPOUND_ALIASES, so there is no second corpus to keep
// in step. `pharmacy` is deliberately NOT consumer-renderable — that mirrors isConsumerRenderable()
// in build/prerender.js, which is the predicate the generator itself uses.
function compareVerdict(seg) {
  // seg = ['compare', '<slugA>-vs-<slugB>'] — anything else is not a comparison address at all.
  if (seg.length !== 2 || !COMPARE_BY_SLUG.size) return null;
  const s = seg[1];
  let a = null, b = null;
  // Split on every "-vs-" and keep the split where BOTH halves are real compounds; a compound name
  // could in principle slug to something containing "-vs-", so the first split is not assumed.
  for (let i = s.indexOf('-vs-'); i >= 0; i = s.indexOf('-vs-', i + 1)) {
    const l = COMPARE_BY_SLUG.get(s.slice(0, i)), r = COMPARE_BY_SLUG.get(s.slice(i + 4));
    if (l && r) { a = l; b = r; break; }
  }
  if (!a || !b) return null;
  const restricted = [a, b].filter((c) => COMPARE_RESTRICTED.has(c.slug));
  return { a, b, restricted };
}
function serveMissing(res, safe) {
  const seg = String(safe || '').split('/').filter(Boolean);
  if (seg.length && GENERATED_ROUTES.includes(seg[0])) {
    let code = 404;
    let title = 'Page not found';
    let body = 'That page does not exist. It may have been renamed.';
    let links = '<p><a href="/solve">Browse problems and goals</a> · <a href="/stack">Compound index</a> · <a href="/">Home</a></p>';
    if (seg[0] === 'compare') {
      const v = compareVerdict(seg);
      const pageOf = (c) => `<a href="/c/${escHtml(c.slug)}">${escHtml(c.name)}</a>`;
      if (v && v.restricted.length) {
        code = 410;
        title = 'This comparison has been withdrawn';
        body = `I removed the head-to-head comparisons that pitted a prescription or controlled medicine against a supplement. ${v.restricted.map((c) => escHtml(c.name)).join(' and ')} ${v.restricted.length > 1 ? 'are' : 'is'} in that group. Ranking a medicine you cannot buy against one you can was not a comparison worth publishing, so this page is gone for good rather than temporarily unavailable.`;
        links = `<p>Both pages are still here: ${pageOf(v.a)} · ${pageOf(v.b)}</p>`
          + '<p><a href="/compare">Every comparison that is published</a> · <a href="/solve">Browse problems and goals</a> · <a href="/">Home</a></p>';
      } else if (v) {
        title = 'This comparison is not published';
        body = `Nothing about ${escHtml(v.a.name)} or ${escHtml(v.b.name)} has been withdrawn — both pages are still here. A head-to-head only gets built when the two compounds are both in the top eight by evidence strength for a goal they share, and these two are not, so there is no page at this address right now. That can change when the evidence does.`;
        links = `<p>Read them instead: ${pageOf(v.a)} · ${pageOf(v.b)}</p>`
          + '<p><a href="/compare">Every comparison that is published</a> · <a href="/az">Every compound, A–Z</a> · <a href="/">Home</a></p>';
      } else {
        title = 'No comparison at this address';
        body = 'There is no head-to-head at this address, and I cannot tell which two compounds it was meant to name. The full list of published comparisons is below.';
        links = '<p><a href="/compare">Every comparison that is published</a> · <a href="/az">Every compound, A–Z</a> · <a href="/">Home</a></p>';
      }
    }
    return endHtml(res, `<!doctype html><html lang="en-SG"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${title} · RNAwiki</title><link rel="stylesheet" href="/styles.css">
</head><body><main class="article" style="max-width:44rem;margin:4rem auto;padding:0 1.25rem">
<h1>${title}</h1><p>${body}</p>
${links}
</main></body></html>`, code);
  }
  // Routes the SPA genuinely serves but the build does not prerender — /progress is the live
  // example, and the smoke test caught it when the first version of this block 404'd it.
  // Derived from every `parts[0] === '…'` branch in site/app.js route(); the prerendered prefixes
  // are already handled above, so only the SPA-only ones belong here.
  // Depth matters. /me takes no segment after it and /u takes exactly one, so /me/x used to render
  // the whole private page and /u/ used to render the HOME page under a /u/ URL — both HTTP 200,
  // both soft 404s. Measured on this branch before the guard. The others are prefix routes whose
  // own renderer decides what a bad id means, so they keep the shell.
  const SPA_EXACT = { me: 1, progress: 1, plan: 1, solve: 1, stack: 1, az: 1, browse: 1, where: 1, about: 1, legend: 1, anatomy: 1, pathways: 1 };
  const SPA_ONE_ARG = { u: 1, p: 1 };
  // A RANGE, because /studio takes an OPTIONAL code and the two fixed-arity maps could not say so.
  // `studio` sat in SPA_EXACT, so /studio/<code> — the address site/app.js navigates to itself the
  // moment somebody taps "Remix this", and the only address a remix in progress has — answered 404
  // on any direct load, reload or shared link. Measured on this branch before the change:
  //   GET /studio          200      GET /studio/abc123   404
  // Bounded rather than open: /studio/a/b is still a 404, so this does not reopen the unbounded
  // indexable space that /fuel/<anything>/<anything> was. Both are noindex either way.
  const SPA_MAX_ARGS = { studio: 2 };
  // SPA_N_ARGS held { clinic: 4 } for about an hour on 2026-08-11. Then the hydrated check showed
  // /clinic/<handle>/<problem>/<rc> rendering the HOME page too — the route is retired in app.js and
  // its deeper branches are dead code — so the whole prefix left SPA_ONLY_ROUTES and 404s at the
  // top of this function instead. The map stays, empty, because the next route with a fixed arity
  // should use it rather than inventing a third mechanism beside SPA_EXACT and SPA_ONE_ARG.
  const SPA_N_ARGS = {};
  if (seg.length && SPA_ONLY_ROUTES.includes(seg[0])) {
    // A CLOSED-CHILD ROUTE'S CHILDREN ARE THE EMITTED DOCUMENTS AND NOTHING ELSE. Reaching here
    // with more than one segment means the static-file lookup above already MISSED — the build
    // emitted no such page — so this is an invented URL, and answering it with the SPA shell at 200
    // is what turned /fuel/<anything>/<anything> into an unbounded indexable space. The bare prefix
    // (/fuel with no children) still gets its shell, because that one is a real SPA index.
    if (CLOSED_CHILD_ROUTES.has(seg[0]) && seg.length > 1) return notFoundPage(res);
    if (SPA_EXACT[seg[0]] && seg.length > 1) return notFoundPage(res);
    if (SPA_ONE_ARG[seg[0]] && seg.length !== 2) return notFoundPage(res);
    if (SPA_N_ARGS[seg[0]] && seg.length !== SPA_N_ARGS[seg[0]]) return notFoundPage(res);
    if (SPA_MAX_ARGS[seg[0]] && seg.length > SPA_MAX_ARGS[seg[0]]) return notFoundPage(res);
    if (!isNoindexRoute(seg)) return sendFile(res, path.join(DIR, 'index.html'));
    // TWO DIRECTIVES, DELIBERATELY, AND THEY ARE NOT REDUNDANT.
    //   · the HEADER is what a crawler that never parses the body obeys, and it is the one that
    //     applies to a HEAD request;
    //   · the META REWRITE stops the served BYTES contradicting the header. Google resolves a
    //     conflict by taking the most restrictive, so either alone would work — but a document
    //     that says index in its head and noindex in its headers is one document saying two
    //     things, which is the defect class this file keeps finding.
    // nofollow as well as noindex: the links out of a personal page are that person's protocols,
    // and a crawler should not be walking from a handle to the pages that handle touched.
    // (endHtml() overwrites the header with "noindex, follow" when the URL carries a query string.
    // Still noindex, and the meta tag in the bytes still says nofollow, so the restrictive reading
    // holds either way.)
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return fs.readFile(path.join(DIR, 'index.html'), 'utf8', (e, html) => {
      if (e) { res.writeHead(404); return res.end('Not found'); }
      html = rewriteSpaShellHead(html, seg);
      endHtml(res, html.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex,nofollow">'));
    });
  }

  // Anything else is a SOFT 404: the SPA shell at HTTP 200, carrying
  // `robots: index,follow`, which then hydrates to an <h1> reading "Not found".
  //
  // Measured before this change:
  //   GET /this-does-not-exist  -> 200, index,follow,max-image-preview:large
  //   GET /c/not-a-compound     -> 404, noindex          (correct, because 'c' is a known prefix)
  //
  // So a typo, a stale inbound link or a crawler probing a guessed path all invited Google to index
  // a "Not found" page as a real one. On a four-week-old domain fighting to get indexed at all, soft
  // 404s are actively harmful: they spend crawl budget and dilute the set of pages Google trusts.
  // There is no legitimate unknown route to protect — assertLinkGraph keeps the SPA-only allowlist
  // EMPTY, so nothing on this site links to a path that serves a blank shell.
  return notFoundPage(res);
}

// One 404 page, so the SPA-depth guard above and the unknown-path fallback cannot drift apart.
function notFoundPage(res) {
  res.setHeader('X-Robots-Tag', 'noindex');
  return endHtml(res, `<!doctype html><html lang="en-SG"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Page not found · RNAwiki</title><link rel="stylesheet" href="/styles.css">
</head><body><main class="article" style="max-width:44rem;margin:4rem auto;padding:0 1.25rem">
<h1>Page not found</h1><p>There is nothing at this address. It may have been renamed, or the link that
sent you here may be wrong.</p>
<p><a href="/">Start from the beginning</a> · <a href="/solve">Browse problems and goals</a> · <a href="/az">Every compound, A–Z</a></p>
</main></body></html>`, 404);
}

// Added 2026-07-28. The server set no security headers at all: no CSP, HSTS,
// X-Content-Type-Options or Referrer-Policy anywhere. Five res.setHeader calls, no new dependency
// (helmet would be a third npm dep for this). The CSP is deliberately permissive on inline
// script/style because the SPA and the prerendered pages both inline them; it still blocks
// third-party script origins, framing, and form posts to another host, and it is what would have
// contained the mdInline injection sink had that ever been reachable by user input.
const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    // ---- static.cloudflareinsights.com REMOVED FROM THIS LINE 2026-08-11 (D-21) ----------------
    // Cloudflare Web Analytics is auto-injected by the CDN. It was CSP-blocked from the day these
    // headers shipped and was allowlisted deliberately later, on the argument that Search Console
    // only sees the SEARCH side and goes blind the moment a reader lands.
    //
    // What its beacon sends is `location.href` and `document.title`. On this site those two strings
    // are: `/solve?q=<the symptoms the reader just typed>` and the name of a compound. A reader
    // typing "blood in stool" into a health site is the single most sensitive string this product
    // ever handles, and it was being handed to a third party with their IP beside it.
    //
    // Those are the TWO EXACT CHANNELS site/app.js's own analytics module was engineered to avoid,
    // 130 lines of it: an ALLOWLIST that reduces every URL to a route template ('/t/compound'), a
    // closed event vocabulary that fails shut, referrer reduced to an external origin, no cookie,
    // no localStorage, nothing written to the device. It reports which pages get read — the exact
    // job the Cloudflare beacon was allowlisted for — without ever seeing a query string or a
    // compound name. It is live (GA4, A_GA4 in app.js) and its payload is documented in
    // docs/EVENT_SCHEMA.md.
    //
    // So the beacon was not buying anything the site did not already have, and it was paying for it
    // with the reader's typed symptoms. Blocking it at the CSP stops the script executing.
    // Cloudflare will keep injecting the tag until it is switched off in the dashboard, which needs
    // an account login — that step is Felix's, and it is belt to this brace, not a substitute.
    //
    // 'wasm-unsafe-eval' lets the self-hosted meshopt decoder (site/vendor/three/meshopt_decoder) run its
    // tiny WASM to decompress the 3D body-map GLBs. It permits WebAssembly only — NOT JS eval() — so it is
    // materially narrower than 'unsafe-eval'. Without it the 3D model never decodes (CSP blocks the decode).
    "script-src 'self' 'wasm-unsafe-eval' 'unsafe-inline' https://accounts.google.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    // pubchem.ncbi.nlm.nih.gov is fetched by app.js:744 for the molecular formula / weight chips on
    // every compound page carrying a CID (150 of 170). Blocking it did not throw anything a user
    // could see — the chips are `hidden` until the fetch resolves, so they just never appeared.
    // The *images* from the same host kept working the whole time because img-src allows https:,
    // which is exactly why this looked fine on a visual check.
    "connect-src 'self' https://accounts.google.com https://pubchem.ncbi.nlm.nih.gov",
    // sketchfab.com is the 3D muscle model embedded on all 17 /muscle pages (MUSCLE_MODEL_DEFAULT
    // in both renderers). Shipping this CSP without it silently broke the single most visual
    // element on the site — the page still rendered, the iframe just never loaded, so nothing
    // failed loudly enough to notice. Caught by watching the browser console, not the HTML.
    // If you add another embed, it has to be listed here or it will fail the same quiet way.
    "frame-src https://accounts.google.com https://sketchfab.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=()',
};

const server = http.createServer((req, res) => {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
  const url = req.url;
  const _redir = LEGACY_REDIRECTS[url.split('?')[0].replace(/\/+$/, '') || '/'];
  // THE QUERY STRING TRAVELS WITH IT (2026-08-08), and that is not tidiness. At the moment this
  // deploys, a reader mid-submit is 303'd by the OLD container to /interest?state=ok&t=<token>, and
  // that URL is the only copy of their removal token that will ever exist — nothing on this site
  // sends email. Dropping the query would delete it in front of them. /?state=ok&t=… is rendered by
  // the handler in serveStatic, so the redirect lands them exactly where they were going.
  if (_redir) { const _q = url.indexOf('?'); res.writeHead(301, { Location: _redir + (_q >= 0 ? url.slice(_q) : '') }); res.end(); return; }
  const _cm = url.split('?')[0].match(/^\/c\/([^/]+)\/?$/);
  if (_cm) {
    const _target = COMPOUND_ALIASES[decodeURIComponent(_cm[1]).toLowerCase()];
    if (_target) { res.writeHead(301, { Location: '/c/' + _target }); res.end(); return; }
  }
  if (url.startsWith('/api/')) {
    api(req, res, url).catch(e => { console.error(e); json(res, 500, { error: 'Server error' }); });
    return;
  }
  serveStatic(req, res, url);
});

db.init().then(() => {
  // The anonymous participant cookie is only as good as SECRET. With the built-in default, the
  // HMAC key is a public constant in a public repo, anyone can forge `rw_pid`, and the fix above
  // is theatre. Same key also pseudonymises the research export, so an unset value makes that
  // "non-reversible" id reversible by anyone with the repo. Say so loudly at boot.
  if (db.enabled && CONFIGURED_SECRET.length < 32) {
    console.error('[security] refusing to start: SESSION_SECRET must contain at least 32 characters when accounts are enabled.');
    process.exitCode = 1;
    return;
  }
  server.listen(PORT, () => console.log('RNAwiki serving on :' + PORT + (db.enabled ? ' (accounts on)' : ' (read-only)')));
  if (db.enabled) emailStartScheduler();
}).catch(e => {
  // A process serving API routes against a partially initialized schema is not a degraded mode;
  // it is a privacy and integrity failure. Railway can restart a failed process after Postgres
  // recovers, but it must never receive traffic before the schema transaction succeeds.
  console.error('[db] init failed; server not started:', e.message);
  process.exitCode = 1;
  if (db.pool) db.pool.end().catch(() => {});
});
