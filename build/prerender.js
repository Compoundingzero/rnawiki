#!/usr/bin/env node
// Build-time SEO prerenderer. The site is a client-rendered SPA, which search
// engines index poorly. This emits a crawlable static HTML page per entity
// (compound / goal / protocol / target / pathway / learn) with real content in
// the markup, unique <title> + meta description, canonical URL, Open Graph,
// Twitter, JSON-LD, and Singapore locale/geo targeting. Each page also loads the
// SPA, so a human visitor gets the full interactive experience (hydration).
// Also writes sitemap.xml + robots.txt.
//
// Run after build/parse.js. Reads site/data.js + data/*.json.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const SITE_NAME = process.env.SITE_NAME || 'RNAwiki';
// Canonical/OG/sitemap origin. Defaults to the target domain; override with SITE_URL env
// on Railway if serving from a different host (e.g. the *.up.railway.app URL before DNS cutover).
const SITE_URL = (process.env.SITE_URL || 'https://rnawiki.com').replace(/\/$/, '');

// ---- load data (data.js assigns to window global) ----
global.window = {};
require(path.join(SITE, 'data.js'));
const D = global.window.RNAWIKI_DATA;
const readJSON = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } };
const EX = readJSON(path.join(ROOT, 'data', 'clinical_exercises.json'));
const FO = readJSON(path.join(ROOT, 'data', 'foods.json'));
const GRAPH = D.graph || { problems: [], domains: {} };

// ---- helpers ----
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Meta descriptions: strip markdown and truncate at a word boundary (no mid-word "…Nia" cuts).
const cleanDesc = (s, max = 155) => {
  let t = String(s || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  t = t.slice(0, max); const sp = t.lastIndexOf(' ');
  return (sp > max * 0.6 ? t.slice(0, sp) : t).replace(/[\s,;:.\-—–]+$/, '') + '…';
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const tkey = (s) => s.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
const stars = (n) => '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));
// Singapore availability from approval status (see app.js sgAvailability) + shared-pathway synergy.
const sgAvail = (c) => {
  const ap = c.approvals || [];
  if (ap.includes('⚫')) return { tag: 'Controlled substance', body: 'A controlled substance in most countries — illegal to buy, sell or possess without authorisation (in Singapore: HSA / CNB). Education only.' };
  if (c.isRx) return { tag: 'Prescription only', body: 'Prescription-only — a doctor must prescribe it. Not sold over the counter. (In Singapore: HSA-regulated.)' };
  if (ap.includes('🔴')) return { tag: 'Not widely approved', body: 'Not approved for general sale in most markets (Singapore included). Grey-market only — dose, purity and legality uncertain.' };
  if (ap.includes('🟡') || ap.includes('🟢')) return { tag: 'Available over the counter', body: 'Widely available OTC — e.g. iHerb (ships worldwide); in Singapore also Guardian, Watsons, GNC, Shopee / Lazada. Look for a third-party-tested / GMP mark and check the dose per serving.' };
  return { tag: 'Check locally', body: 'Availability and legal status vary by country — check your national regulator (in Singapore, the HSA) before buying.' };
};
const derivedStacks = (c) => {
  const pw = new Set(c.pathwayIds || []); if (!pw.size) return [];
  return D.compounds.filter((o) => o.id !== c.id && !o.isNote && (o.pathwayIds || []).some((i) => pw.has(i))).sort((a, b) => b.stars - a.stars).slice(0, 4);
};

// ---- per-page Open Graph card generator (branded 1200×630 PNG per entity) ----
// Uses @resvg/resvg-js + a bundled font (works on Railway's minimal container). If either is
// missing it returns null and the page falls back to the site-wide /og.png — never fails the build.
let Resvg = null, ogFonts = [];
try {
  Resvg = require('@resvg/resvg-js').Resvg;
  ogFonts = ['Sans-Regular.ttf', 'Sans-Bold.ttf'].map((f) => path.join(ROOT, 'assets', 'fonts', f)).filter((f) => fs.existsSync(f));
  if (!ogFonts.length) Resvg = null;
} catch (e) { Resvg = null; }
const xe = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function wrapText(str, maxChars, maxLines) {
  const words = String(str || '').replace(/[*_`]/g, '').split(/\s+/).filter(Boolean); const lines = []; let cur = '';
  for (const w of words) { if (!cur) { cur = w; continue; } if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w; else { lines.push(cur); cur = w; } }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/[\s,;:.]+$/, '') + '…'; }
  return lines;
}
function starPolys(n, x, y, size) {
  let out = '';
  for (let s = 0; s < 5; s++) { const cx = x + s * (size * 1.18) + size / 2, cy = y; const pts = [];
    for (let i = 0; i < 10; i++) { const ang = Math.PI / 5 * i - Math.PI / 2; const r = (i % 2 ? size * 0.2 : size * 0.5); pts.push((cx + Math.cos(ang) * r).toFixed(1) + ',' + (cy + Math.sin(ang) * r).toFixed(1)); }
    out += `<polygon points="${pts.join(' ')}" fill="${s < n ? '#f59e0b' : 'none'}" stroke="#f59e0b" stroke-width="2"/>`; }
  return out;
}
function ogCardSvg({ kind, title, sub, starN, rx }) {
  const tLines = wrapText(title, 22, 2); const tSize = tLines.length > 1 ? 58 : 70;
  let ty = 288 - (tLines.length - 1) * 34;
  const titleSvg = tLines.map((l, i) => `<text x="72" y="${ty + i * (tSize + 8)}" font-family="Roboto" font-weight="700" font-size="${tSize}" fill="#ffffff">${xe(l)}</text>`).join('');
  let yy = ty + (tLines.length - 1) * (tSize + 8) + 62;
  let starsSvg = '';
  if (starN != null) { starsSvg = starPolys(starN, 74, yy, 26) + (rx ? `<rect x="266" y="${yy - 21}" width="188" height="42" rx="8" fill="#fff1f0" stroke="#f5c2bd"/><text x="280" y="${yy + 8}" font-family="Roboto" font-weight="700" font-size="23" fill="#b3261e">Prescription</text>` : ''); yy += 58; }
  const subSvg = (sub ? wrapText(sub, 62, 2) : []).map((l, i) => `<text x="72" y="${yy + i * 40}" font-family="Roboto" font-size="31" fill="#9fb3c8">${xe(l)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1a2b"/><stop offset="1" stop-color="#0e1420"/></linearGradient><linearGradient id="a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#2f7de0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#b)"/><rect width="1200" height="8" fill="url(#a)"/><text x="72" y="112" font-family="Roboto" font-weight="700" font-size="40"><tspan fill="#38bdf8">RNA</tspan><tspan fill="#ffffff">wiki</tspan></text><text x="1128" y="112" text-anchor="end" font-family="Roboto" font-weight="700" font-size="23" fill="#64748b">${xe((kind || '').toUpperCase())}</text>${titleSvg}${starsSvg}${subSvg}<text x="72" y="580" font-family="Roboto" font-weight="700" font-size="28" fill="#38bdf8">rnawiki.com<tspan fill="#64748b" font-weight="400">  ·  Singapore</tspan></text></svg>`;
}
let ogCount = 0;
function renderOgCard(relPath, opts) {
  if (!Resvg) return null;
  try {
    const png = new Resvg(ogCardSvg(opts), { font: { fontFiles: ogFonts, loadSystemFonts: false, defaultFontFamily: 'Roboto' }, background: '#0e1420' }).render().asPng();
    const out = path.join(SITE, relPath); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, png); ogCount++;
    return SITE_URL + '/' + relPath.replace(/\\/g, '/');
  } catch (e) { return null; }
}
const goalById = {}; D.goals.forEach((g) => goalById[g.id] = g);
const cptByName = {}; D.compounds.forEach((c) => cptByName[c.name.toLowerCase()] = c);
function findCpt(label) {
  const l = String(label).toLowerCase().trim(); if (cptByName[l]) return cptByName[l];
  for (const c of D.compounds) { const n = c.name.toLowerCase(); if (n.startsWith(l + ' ') || n.startsWith(l + ' (') || (l.length > 4 && n.startsWith(l))) return c; }
  return null;
}
function protoStack(rc) {
  const picked = [], ids = new Set();
  (rc.compounds || []).forEach((n) => { const c = findCpt(n); if (c && !ids.has(c.id)) { ids.add(c.id); picked.push(c); } });
  const pool = D.compounds.filter((c) => (rc.goal_ids || []).some((g) => (c.goalIds || []).includes(g)) || (rc.pathway_ids || []).some((p) => (c.pathwayIds || []).includes(p))).sort((a, b) => b.stars - a.stars);
  pool.forEach((c) => { if (!ids.has(c.id)) { ids.add(c.id); picked.push(c); } });
  return picked.slice(0, 6);
}
function protoFuel(rc) {
  if (!FO) return [];
  const want = new Set(rc.fuel_tags || []);
  return FO.foods.map((f) => ({ f, h: (f.tags || []).filter((t) => want.has(t)).length })).filter((x) => x.h > 0)
    .sort((a, b) => (b.f.sg_local - a.f.sg_local) || (b.h - a.h)).slice(0, 6).map((x) => x.f);
}
function protoMove(rc) {
  if (!EX) return [];
  const out = [], seen = new Set();
  (rc.move_tags || []).forEach((t) => (EX.byTag[t] || []).slice(0, 3).forEach((id) => { if (!seen.has(id)) { seen.add(id); const e = EX.exercises.find((x) => x.id === id); if (e) out.push(e); } }));
  return out.slice(0, 4);
}

// ---- page shell ----
function shell({ route, title, desc, jsonld, body, breadcrumbs, ogImage, ogType, robots }) {
  const img = ogImage || (SITE_URL + '/og.png');
  const url = SITE_URL + route;
  const ld = [].concat(jsonld || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('');
  const crumbLd = breadcrumbs ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: SITE_URL + b.route })),
  })}</script>` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="${robots || 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'}">
<meta property="og:type" content="${ogType || 'article'}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(img)}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="stylesheet" href="/styles.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧬</text></svg>">
${crumbLd}${ld}
</head>
<body>
<header class="topbar">
  <a href="/" class="brand">🧬 RNA<span>wiki</span></a>
  <div class="search-wrap"><input id="search" type="search" placeholder="Search 170 compounds, protocols, terms…" autocomplete="off" spellcheck="false"><div id="search-results" class="search-results" hidden></div></div>
  <nav class="topnav">
    <a href="/solve" class="nav-solve">Solve</a><a href="/learn">Learn</a><a href="/fuel">Fuel</a>
    <a href="/stack">Stack <span id="stack-badge" class="stack-badge" hidden>0</span></a><a href="/for-clinicians">For pros</a>
  </nav>
  <span id="account-slot" class="account-slot"></span>
  <button id="menu-btn" class="menu-btn" aria-label="Menu">☰</button>
</header>
<main id="app">${body}</main>
<footer class="foot"><div>💡 Not medical advice · <a href="/solve">Solve</a> · <a href="/browse">Browse</a> · <a href="/anatomy">Anatomy</a> · <a href="/pathways">Pathways</a> · <a href="/az">A–Z</a> · <a href="/for-clinicians">For pros &amp; clinicians</a> · <a href="/legend">Legend</a> · <a href="/about">About</a></div><div class="foot-stats" id="foot-stats"></div></footer>
<script src="/data.js"></script>
<script src="/facts.js"></script>
<script src="/interactions.js"></script>
<script src="/app.js"></script>
</body>
</html>`;
}

// Build-time pick of a representative daily fact for the prerendered homepage (crawlers + first paint).
// The client re-renders the true "today" fact on hydration; this just needs to be a real, valid one.
function prerenderDailyFact() {
  try {
    const src = fs.readFileSync(path.join(SITE, 'facts.js'), 'utf8');
    const m = src.match(/window\.RNAWIKI_FACTS\s*=\s*(\[[\s\S]*\]);/);
    if (!m) return '';
    const facts = eval(m[1]);
    if (!facts || !facts.length) return '';
    const f = facts[Math.floor(Date.now() / 864e5) % facts.length];
    return `
    <section class="daily-fact">
      <div class="df-card">
        <div class="df-top"><span class="df-kicker">💡 Did you know?</span><span class="df-meta">a new fact every day</span></div>
        <p class="df-text">${f.t}</p>
        <a class="df-link" href="${f.href}">${esc(f.label)}</a>
      </div>
    </section>`;
  } catch (e) { return ''; }
}

const crumbHtml = (items) => `<div class="crumbs">${items.map((it, i) => it.route ? `<a href="${it.route}">${esc(it.name)}</a>` : `<span>${esc(it.name)}</span>`).join('<span class="sep">›</span>')}</div>`;

// ---- SEO entities & structured-data helpers ----
const BUILD_DATE = new Date().toISOString().slice(0, 10); // real freshness signal for dateModified/lastReviewed
// The publisher entity (E-E-A-T). Referenced by @id from every clinical page; defined in full on home.
const ORG = { '@type': 'Organization', '@id': SITE_URL + '/#org', name: SITE_NAME, url: SITE_URL + '/', logo: SITE_URL + '/og.png',
  sameAs: ['https://twitter.com/Compoundingzero', 'https://compoundingzero.substack.com', 'https://github.com/Compoundingzero'] };
const WEBSITE = { '@type': 'WebSite', '@id': SITE_URL + '/#website', url: SITE_URL + '/', name: SITE_NAME, inLanguage: 'en', publisher: { '@id': SITE_URL + '/#org' } };
const PUB = { publisher: { '@id': SITE_URL + '/#org' }, isPartOf: { '@id': SITE_URL + '/#website' }, dateModified: BUILD_DATE };
const stripMd = (t) => String(t == null ? '' : t).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`>#]+/g, '').replace(/\s+/g, ' ').trim();
// Trim to a word boundary so answers never cut mid-word.
const snip = (t, max = 300) => { const s = stripMd(t); if (s.length <= max) return s; const cut = s.slice(0, max); return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:]$/, '') + '…'; };
// Render authored markdown links as crawlable HTML (for the molecular-target citations = E-E-A-T signal).
function mdLinks(t) {
  t = String(t || ''); let out = '', last = 0, re = /\[([^\]]+)\]\(([^)]+)\)/g, m;
  const bold = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  while ((m = re.exec(t))) { out += bold(t.slice(last, m.index)); out += `<a href="${esc(m[2])}" target="_blank" rel="nofollow noopener">${esc(m[1])}</a>`; last = m.index + m[0].length; }
  return out + bold(t.slice(last));
}
// Build a visible FAQ section + matching FAQPage JSON-LD from real fields. Google requires the two to
// match, so both come from the same source. Needs ≥2 real Q&As or it renders nothing (no thin markup).
function faqBlock(qas) {
  const items = qas.filter((x) => x && x.q && x.a && String(x.a).trim().length > 8);
  if (items.length < 2) return { html: '', ld: null };
  const html = `<section class="faq"><h2>Common questions</h2>${items.map((x) => `<details class="faq-q"><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join('')}</section>`;
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) };
  return { html, ld };
}

// ---- renderers ----
const pages = []; // {route, html}
function add(route, html) { pages.push({ route, html }); }

// reverse index: which protocols explicitly list each compound (the "Used in" module + flow)
const compoundProtocols = {};
GRAPH.problems.forEach((p) => p.root_causes.forEach((rc) => {
  const seen = new Set();
  (rc.compounds || []).forEach((n) => {
    const c = findCpt(n);
    if (c && !seen.has(c.id)) { seen.add(c.id); (compoundProtocols[c.id] = compoundProtocols[c.id] || []).push({ name: p.name, route: `/protocol/${p.id}/${rc.id}` }); }
  });
}));

// ---- comparison pairs (Phase 9 long-tail): compounds sharing a goal, both "full", top by evidence ----
// Non-thin by construction — each page is two full profiles side-by-side + an honest evidence verdict.
const fullForCompare = D.compounds.filter((c) => c.mechanism && c.plain);
const comparePairs = new Map(); // canonical "slugA|slugB" -> {a, b, goalLabel, goalId}
D.goals.forEach((g) => {
  const list = fullForCompare.filter((c) => (c.goalIds || []).includes(g.id)).sort((a, b) => b.stars - a.stars).slice(0, 8);
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    let a = list[i], b = list[j];
    if (slug(a.name) > slug(b.name)) { const t = a; a = b; b = t; } // canonical alphabetical
    const key = slug(a.name) + '|' + slug(b.name);
    if (!comparePairs.has(key)) comparePairs.set(key, { a, b, goalLabel: g.label, goalId: g.id });
  }
});
// reverse index for internal linking off each compound page (so comparison pages aren't SEO orphans)
const compoundCompareLinks = {};
comparePairs.forEach(({ a, b }) => {
  const route = `/compare/${slug(a.name)}-vs-${slug(b.name)}`;
  (compoundCompareLinks[a.id] = compoundCompareLinks[a.id] || []).push({ other: b.name, route });
  (compoundCompareLinks[b.id] = compoundCompareLinks[b.id] || []).push({ other: a.name, route });
});

// compounds
D.compounds.forEach((c) => {
  const route = '/c/' + slug(c.name);
  const goalLinks = (c.goalIds || []).map((g) => `<a href="/goal/${g}">${esc(goalById[g].label)}</a>`).join(' · ');
  const usedIn = compoundProtocols[c.id] || [];
  const usedInHtml = usedIn.length ? `<h2>Used in these protocols</h2><ul>${usedIn.slice(0, 8).map((u) => `<li><a href="${u.route}">${esc(u.name)}</a></li>`).join('')}</ul>` : '';
  const cmpLinks = compoundCompareLinks[c.id] || [];
  const compareHtml = cmpLinks.length ? `<h2>Compare ${esc(c.name)}</h2><ul>${cmpLinks.slice(0, 8).map((x) => `<li><a href="${x.route}">${esc(c.name)} vs ${esc(x.other)}</a></li>`).join('')}</ul>` : '';
  const pathLink = (c.pathwayIds || []).length && D.pathways[c.pathwayIds[0]] ? `<p><b>How it works:</b> <a href="/pathway/${c.pathwayIds[0]}">the ${esc(D.pathways[c.pathwayIds[0]].shortLabel)} pathway →</a></p>` : '';
  const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: c.category, route: '/' }, { name: c.name }])}
    <div class="detail"><h1>${esc(c.name)}</h1>
    <p><b>Evidence:</b> ${stars(c.stars)} · <b>Status:</b> ${(c.approvalLabels || []).join(', ')}</p>
    ${c.plain ? `<h2>In plain English</h2><p>${esc(c.plain)}</p>` : ''}
    ${c.mechanism ? `<h2>How it works</h2><p>${esc(c.mechanism)}</p>` : ''}
    ${c.target ? `<h2>Molecular target &amp; official sources</h2><p>${mdLinks(c.target)}</p>` : ''}
    ${c.protocol ? `<h2>Protocol</h2><p>${esc(c.protocol)}</p>` : ''}
    ${c.watch ? `<h2>Watch out</h2><p>${esc(c.watch)}</p>` : ''}
    ${c.bottom ? `<h2>Bottom line</h2><p>${esc(c.bottom)}</p>` : ''}
    ${goalLinks ? `<p><b>Helps with:</b> ${goalLinks}</p>` : ''}
    ${c.evidence ? `<h2>The human evidence</h2><p>${esc(String(c.evidence).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, ''))}</p>` : ''}
    ${(() => {
      const sg = sgAvail(c); const d = derivedStacks(c); const strip = (t) => String(t || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '');
      return `${c.stacksWith || d.length ? `<h2>Stacks with</h2>${c.stacksWith ? `<p>${esc(strip(c.stacksWith))}</p>` : ''}${d.length ? `<p>Shares a pathway — often paired with: ${d.map((o) => `<a href="/c/${slug(o.name)}">${esc(o.name)}</a>`).join(', ')}.</p>` : ''}` : ''}
        ${c.avoid ? `<h2>Avoid combining with</h2><p>${esc(strip(c.avoid))}</p>` : ''}
        <h2>Availability &amp; where to buy</h2><p><b>${esc(sg.tag)}.</b> ${sg.body.replace(/<\/?b>/g, '')}${c.cost ? ' ' + esc(strip(c.cost)) : ''}</p>`;
    })()}
    ${pathLink}
    ${usedInHtml}${compareHtml}</div>`;
  const cqa = faqBlock([
    (c.bottom || c.plain) ? { q: `Does ${c.name} actually work?`, a: `Human-evidence rating: ${c.stars} of 5. ${snip(c.bottom || c.plain, 240)}` } : null,
    c.protocol ? { q: `How do you take ${c.name}?`, a: snip(c.protocol, 300) } : null,
    c.watch ? { q: `What are the risks or side effects of ${c.name}?`, a: snip(c.watch, 300) } : null,
    (c.approvalLabels || []).length ? { q: `Is ${c.name} legal or approved?`, a: `Regulatory status: ${(c.approvalLabels || []).join(', ')}.` } : null,
  ]);
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: c.name,
    about: { '@type': 'Drug', name: c.name }, description: (c.plain || c.bottom || '').slice(0, 300),
    url: SITE_URL + route, inLanguage: 'en', lastReviewed: BUILD_DATE, publisher: PUB.publisher, isPartOf: PUB.isPartOf, dateModified: PUB.dateModified,
  }].concat(cqa.ld || []);
  add(route, shell({ route, title: `${c.name}: dosage, evidence & uses · RNAwiki`, desc: cleanDesc(c.plain || c.bottom || c.mechanism || c.name), jsonld, ogImage: renderOgCard(`og/c/${slug(c.name)}.png`, { kind: 'Compound · ' + (c.category || ''), title: c.name, sub: cleanDesc(c.plain || c.bottom || c.mechanism, 120), starN: c.stars, rx: c.isRx }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: c.name, route }], body: body + cqa.html }));
});

// comparison pages ([A] vs [B]) — high-intent long-tail, non-thin (two full profiles + honest verdict)
comparePairs.forEach(({ a, b, goalLabel, goalId }) => {
  const route = `/compare/${slug(a.name)}-vs-${slug(b.name)}`;
  const gl = goalLabel.toLowerCase();
  const verdict = a.stars === b.stars
    ? `Both carry a comparable human-evidence rating (${stars(a.stars)}). Choose on mechanism fit, side-effects, availability and cost rather than evidence strength alone — they work through different mechanisms.`
    : `${(a.stars > b.stars ? a : b).name} has the stronger human-evidence rating (${stars(Math.max(a.stars, b.stars))} vs ${stars(Math.min(a.stars, b.stars))}), but the right choice still depends on your goal, tolerance and budget.`;
  const cmp = (k, va, vb) => `<tr><th>${esc(k)}</th><td>${va}</td><td>${vb}</td></tr>`;
  const table = `<div class="cmp-wrap"><table class="cmp-table"><thead><tr><th></th><th><a href="/c/${slug(a.name)}">${esc(a.name)}</a></th><th><a href="/c/${slug(b.name)}">${esc(b.name)}</a></th></tr></thead><tbody>
    ${cmp('Human evidence', stars(a.stars), stars(b.stars))}
    ${cmp('Legal status', esc((a.approvalLabels || []).join(', ') || '—'), esc((b.approvalLabels || []).join(', ') || '—'))}
    ${cmp('How it works', esc(snip(a.mechanism, 240)), esc(snip(b.mechanism, 240)))}
    ${cmp('In plain English', esc(snip(a.plain, 240)), esc(snip(b.plain, 240)))}
    ${cmp('Bottom line', esc(snip(a.bottom || '—', 200)), esc(snip(b.bottom || '—', 200)))}
    ${cmp('Availability', esc(sgAvail(a).tag), esc(sgAvail(b).tag))}
  </tbody></table></div>`;
  const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: 'Compare', route: '/compare' }, { name: `${a.name} vs ${b.name}` }])}
    <div class="detail"><h1>${esc(a.name)} vs ${esc(b.name)}</h1>
    <p>Both are used for <a href="/goal/${goalId}">${esc(gl)}</a>. Here's how they compare on human evidence, mechanism, safety and availability — in plain English.</p>
    ${table}
    <h2>Which is better for ${esc(gl)}?</h2><p>${esc(verdict)}</p>
    <p>Full breakdowns: <a href="/c/${slug(a.name)}">${esc(a.name)}</a> · <a href="/c/${slug(b.name)}">${esc(b.name)}</a>.</p>
    <div class="page-cta"><a class="cta-primary" href="/solve">🎯 Build your own Move · Fuel · Stack protocol →</a></div></div>`;
  const faq = faqBlock([
    { q: `Is ${a.name} or ${b.name} better for ${gl}?`, a: verdict },
    { q: `What's the difference between ${a.name} and ${b.name}?`, a: `${a.name}: ${snip(a.bottom || a.plain, 130)} — ${b.name}: ${snip(b.bottom || b.plain, 130)}` },
  ]);
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: `${a.name} vs ${b.name}`, description: `Compare ${a.name} and ${b.name} for ${gl}.`, url: SITE_URL + route, inLanguage: 'en', lastReviewed: BUILD_DATE, publisher: PUB.publisher, isPartOf: PUB.isPartOf, dateModified: PUB.dateModified }].concat(faq.ld || []);
  add(route, shell({ route, title: `${a.name} vs ${b.name}: which works better? · RNAwiki`, desc: `${a.name} vs ${b.name} for ${gl}: human evidence, mechanism, safety and availability compared — plain English, honest verdict.`, jsonld, breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Compare', route: '/compare' }, { name: `${a.name} vs ${b.name}`, route }], body: body + faq.html }));
});

// goals
D.goals.forEach((g) => {
  const route = '/goal/' + g.id;
  const list = D.compounds.filter((c) => c.goalIds.includes(g.id)).sort((a, b) => b.stars - a.stars).slice(0, 30);
  const protos = GRAPH.problems.filter((p) => p.root_causes.some((rc) => (rc.goal_ids || []).includes(g.id)));
  const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: g.label }])}
    <h1>${g.icon} ${esc(g.label)}</h1>
    <p>${list.length} compounds that help you ${esc(g.label.toLowerCase())}, ranked by strength of human evidence — in plain English, with honest verdicts.</p>
    <ul>${list.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a> — ${stars(c.stars)}</li>`).join('')}</ul>
    ${protos.length ? `<h2>Full protocols</h2><ul>${protos.map((p) => `<li><a href="/protocol/${p.id}/${p.root_causes[0].id}">${esc(p.name)} — Move, Fuel &amp; Stack</a></li>`).join('')}</ul>` : ''}`;
  const goalLd = { '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: `${g.label} — what actually helps`, description: `Compounds ranked by human evidence for ${g.label.toLowerCase()}.`, url: SITE_URL + route, inLanguage: 'en', lastReviewed: BUILD_DATE, publisher: PUB.publisher, isPartOf: PUB.isPartOf, dateModified: PUB.dateModified };
  add(route, shell({ route, title: `${g.label}: what actually helps (ranked by evidence) · RNAwiki`, desc: `Compounds and full protocols that help you ${g.label.toLowerCase()}, ranked by human evidence — plain English, honest verdicts.`, jsonld: goalLd, ogImage: renderOgCard(`og/goal/${g.id}.png`, { kind: 'Goal', title: g.label, sub: 'What actually helps you ' + g.label.toLowerCase() + ' — ranked by human evidence.' }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: g.label, route }], body }));
});

// protocols
GRAPH.problems.forEach((p) => {
  p.root_causes.forEach((rc) => {
    const route = `/protocol/${p.id}/${rc.id}`;
    const stack = protoStack(rc), fuel = protoFuel(rc), move = protoMove(rc);
    const nt = Object.entries(rc.nutrient_targets || {}).map(([k, t]) => `${k.replace(/_\w+$/, '').replace(/_/g, ' ')}: ${t.target}${t.unit} (${t.type})`).join(', ');
    const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }, { name: p.name }])}
      <h1>${p.icon || ''} ${esc(p.name)}</h1><h2>${esc(rc.name)}</h2>
      ${rc.diagnostic ? `<p>${esc(rc.diagnostic)}</p>` : ''}
      ${rc.keystone ? `<div class="keystone-card"><div class="ks-badge">⭐ Your one keystone</div><p class="ks-one">${esc(rc.keystone.one)}</p><p class="ks-why">${esc(rc.keystone.why)}</p></div>` : ''}
      <h3>Move — the mechanics that fix it${rc.prescription ? `: ${esc(rc.prescription.scheme)}` : ''}</h3>
      ${rc.prescription ? `<p>${esc(rc.prescription.detail)}</p>` : ''}
      ${move.length ? `<ul>${move.map((e) => `<li>${esc(e.name)}</li>`).join('')}</ul>` : ''}
      <h3>Fuel — foods to fuel it</h3>
      ${fuel.length ? `<ul>${fuel.map((f) => `<li>${esc(f.name)}${f.sg_local ? ' (local SG)' : ''}</li>`).join('')}</ul>` : ''}
      ${nt ? `<p><b>Daily nutrient targets:</b> ${esc(nt)}</p>` : ''}
      <h3>Stack — evidence-ranked compounds</h3>
      <ul>${stack.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a> — ${stars(c.stars)}</li>`).join('')}</ul>
      <p><a href="/fuel/${p.id}/${rc.id}">Open the Fuel Tracker for this protocol →</a></p>
      <p><em>Educational protocol, not medical advice.</em></p>`;
    const rcShort = rc.name.replace(/\s*\([^)]*\)/, '');
    const moveNames = move.slice(0, 5).map((e) => e.name).join(', ');
    const fuelNames = fuel.slice(0, 5).map((f) => f.name).join(', ');
    const stackNames = stack.slice(0, 5).map((c) => c.name).join(', ');
    const pqa = faqBlock([
      rc.diagnostic ? { q: `What causes ${p.name.toLowerCase()}?`, a: `${rc.name}. ${snip(rc.diagnostic, 240)}` } : null,
      move.length ? { q: `What exercises help ${p.name.toLowerCase()}?`, a: `Key movements: ${moveNames}.` } : null,
      fuel.length ? { q: `What should you eat for ${p.name.toLowerCase()}?`, a: `Foods that support it: ${fuelNames}.` } : null,
      stack.length ? { q: `What supplements help ${p.name.toLowerCase()}?`, a: `Evidence-ranked options: ${stackNames}.` } : null,
    ]);
    const howto = (move.length || fuel.length || stack.length) ? { '@context': 'https://schema.org', '@type': 'HowTo', name: `How to address ${p.name} — ${rcShort}`, description: snip(rc.diagnostic || p.name, 200), step: [
      move.length ? { '@type': 'HowToStep', name: 'Move', text: `Corrective movement: ${moveNames}.` } : null,
      fuel.length ? { '@type': 'HowToStep', name: 'Fuel', text: `Eat to support recovery: ${fuelNames}.` } : null,
      stack.length ? { '@type': 'HowToStep', name: 'Stack', text: `Evidence-ranked supplements to consider: ${stackNames}.` } : null,
    ].filter(Boolean) } : null;
    const protoLd = [{
      '@context': 'https://schema.org', '@type': 'MedicalWebPage', inLanguage: 'en',
      name: `${p.name} — ${rc.name} protocol`, description: (rc.diagnostic || p.name),
      about: { '@type': 'MedicalCondition', name: p.name },
      audience: { '@type': 'MedicalAudience', audienceType: 'Patient' },
      lastReviewed: BUILD_DATE, url: SITE_URL + route, publisher: PUB.publisher, isPartOf: PUB.isPartOf, dateModified: PUB.dateModified,
    }].concat(howto || []).concat(pqa.ld || []);
    add(route, shell({ route, title: `${p.name} (${rcShort.toLowerCase()}): exercises, supplements & what works · RNAwiki`, desc: `${p.name} — ${rc.name}: the exercises to fix it, foods to fuel it, and evidence-ranked supplements. A full root-cause protocol. Not medical advice.`, jsonld: protoLd, ogImage: renderOgCard(`og/protocol/${p.id}/${rc.id}.png`, { kind: 'Protocol · ' + (p.category || ''), title: p.name, sub: rc.plain || rc.diagnostic || rc.name }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }, { name: p.name, route }], body: body + pqa.html }));
  });
});

// targets
(D.targets || []).forEach((t) => {
  const route = '/target/' + tkey(t.sym);
  const list = t.compoundIds.map((id) => D.compounds.find((c) => c.id === id)).filter(Boolean);
  const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: 'Browse', route: '/browse' }, { name: t.sym }])}
    <h1>${esc(t.sym)}</h1><p>${esc(t.name)} — the molecular target that ${list.length} compounds in the wiki act on.</p>
    ${t.explainer ? `<div>${t.explainer.html}</div>` : ''}
    <h2>Compounds acting on ${esc(t.sym)}</h2><ul>${list.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a></li>`).join('')}</ul>`;
  add(route, shell({ route, title: `${t.sym} — molecular target & the compounds that hit it · RNAwiki`, desc: `${t.sym}: ${(t.name || '').slice(0, 130)}. Learn what it does and every compound that acts on it.`, ogImage: renderOgCard(`og/target/${tkey(t.sym)}.png`, { kind: 'Molecular target', title: t.sym, sub: cleanDesc((t.explainer && t.explainer.html || '').replace(/<[^>]+>/g, ' ').replace(/^\s*In one line:\s*/i, ''), 120) }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: t.sym, route }], body }));
});

// pathways + learn
D.pathways.forEach((p, i) => {
  const route = '/pathway/' + i;
  add(route, shell({ route, title: `${p.shortLabel} pathway explained · RNAwiki`, desc: `The ${p.shortLabel} pathway in plain English, and the compounds that pull it.`, ogImage: renderOgCard(`og/pathway/${i}.png`, { kind: 'Pathway', title: p.shortLabel, sub: p.oneLine || '' }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: p.shortLabel, route }], body: `<div class="article"><h1>${esc(p.shortLabel)}</h1>${p.html || ''}</div>` }));
});
function foundationsDiagram(i) {
  const C = { blue: '#2563eb', teal: '#0d9488', slate: '#475569', red: '#b3261e', amber: '#d97706', line: '#64748b', mut: '#94a3b8', green: '#059669' };
  const box = (x, y, w, h, label, fill, sub) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" fill-opacity="0.12" stroke="${fill}" stroke-width="1.5"/><text x="${x + w / 2}" y="${sub ? y + h / 2 - 2 : y + h / 2 + 4}" text-anchor="middle" font-size="13" font-weight="700" fill="${fill}">${label}</text>${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" font-size="10" fill="${C.line}">${sub}</text>` : ''}</g>`;
  const arr = (x1, y1, x2, y2, col) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col || C.line}" stroke-width="2.2" marker-end="url(#fd-a)"/>`;
  const t = (x, y, txt, col, size, anchor, ital) => `<text x="${x}" y="${y}" font-size="${size || 10.5}" fill="${col || C.line}" text-anchor="${anchor || 'middle'}"${ital ? ' font-style="italic"' : ''}>${txt}</text>`;
  const dash = (x1, y1, x2, y2, col) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col || C.mut}" stroke-width="1.3" stroke-dasharray="5 4"/>`;
  const rows5 = (data) => data.map((r, k) => { const y = 20 + k * 56; return box(40, y, 290, 44, r[0], r[2]) + arr(330, y + 22, 398, y + 22) + box(400, y, 320, 44, r[1], C.slate); }).join('');
  const D = [
    ['760 300', 'From gene to protein — and the four protein types a drug targets.',
      box(120, 24, 140, 48, 'DNA', C.slate, 'the blueprint') + box(310, 24, 140, 48, 'RNA', C.teal, 'the builder') + box(500, 24, 140, 48, 'Protein', C.blue, 'the machine') +
      arr(260, 48, 310, 48) + t(285, 40, 'transcribe', C.mut, 9, 'middle', true) + arr(450, 48, 500, 48) + t(475, 40, 'translate', C.mut, 9, 'middle', true) +
      arr(380, 72, 380, 104) + t(380, 124, 'Most proteins are one of 4 types a drug can target:', C.line, 11) +
      box(20, 140, 170, 60, 'Receptor', C.blue, 'receives signals') + box(210, 140, 160, 60, 'Enzyme', C.teal, 'speeds reactions') +
      box(390, 140, 170, 60, 'Transporter', C.slate, 'moves molecules') + box(580, 140, 160, 60, 'Ion channel', C.red, 'gates charge') +
      box(150, 236, 460, 44, 'Bind the right protein → change what the cell does', C.amber)],
    ['760 400', 'ADME — and how a dose rises, peaks, then halves (its half-life).',
      box(20, 18, 160, 48, 'Absorption', C.teal, 'into the blood') + box(215, 18, 160, 48, 'Distribution', C.slate, 'to the tissues') +
      box(410, 18, 160, 48, 'Metabolism', C.blue, 'liver breaks it down') + box(605, 18, 150, 48, 'Excretion', C.red, 'kidney clears it') +
      arr(180, 42, 215, 42) + arr(375, 42, 410, 42) + arr(570, 42, 605, 42) +
      `<line x1="80" y1="130" x2="80" y2="330" stroke="${C.mut}" stroke-width="1.4"/><line x1="80" y1="330" x2="710" y2="330" stroke="${C.mut}" stroke-width="1.4"/>` +
      `<path d="M80,328 C 150,328 190,170 235,160 C 330,140 470,270 700,312" fill="none" stroke="${C.teal}" stroke-width="2.6"/>` +
      dash(80, 160, 235, 160) + t(86, 153, 'peak level (Cmax)', C.line, 10, 'start') +
      dash(80, 245, 395, 245) + dash(395, 245, 395, 330) + t(395, 348, 'one half-life', C.amber, 10) +
      t(400, 372, 'time after the dose →', C.mut, 10.5) + t(96, 120, 'drug in blood', C.mut, 10, 'start')],
    ['780 360', 'The dose–response curve: potency (EC50), efficacy (the ceiling), agonist vs antagonist.',
      `<line x1="90" y1="70" x2="90" y2="300" stroke="${C.mut}" stroke-width="1.4"/><line x1="90" y1="300" x2="560" y2="300" stroke="${C.mut}" stroke-width="1.4"/>` +
      `<path d="M100,294 C 210,292 240,270 300,195 C 340,140 380,108 450,102 C 520,97 545,96 555,95" fill="none" stroke="${C.blue}" stroke-width="2.6"/>` +
      dash(90, 195, 300, 195) + dash(300, 195, 300, 300) + t(300, 316, 'EC50 · potency', C.amber, 10) +
      dash(90, 100, 555, 100) + t(96, 93, 'ceiling · efficacy', C.line, 10, 'start') +
      t(96, 60, 'effect', C.mut, 10, 'start') + t(330, 338, 'dose →', C.mut, 10.5) +
      box(600, 78, 165, 58, 'Agonist', C.green, 'turns the target ON') + box(600, 156, 165, 58, 'Antagonist', C.red, 'blocks it — flattens') +
      box(600, 234, 165, 54, 'Partial agonist', C.amber, 'lower ceiling')],
    ['760 370', 'The evidence hierarchy — the higher the tier, the more the stars.',
      `<polygon points="380,34 660,330 100,330" fill="${C.teal}" fill-opacity="0.06" stroke="${C.mut}" stroke-width="1.4"/>` +
      dash(318, 100, 442, 100) + dash(263, 158, 497, 158) + dash(208, 216, 552, 216) + dash(153, 274, 607, 274) +
      t(380, 74, 'Meta-analyses', C.green, 12) + t(380, 132, 'Randomised trials (RCTs)', C.teal, 12) +
      t(380, 190, 'Cohort / observational', C.slate, 11.5) + t(380, 248, 'Case reports & series', C.slate, 11.5) +
      t(380, 304, 'Anecdote · opinion · mechanism', C.mut, 11) +
      arr(64, 322, 64, 52, C.green) + t(64, 44, 'stronger', C.green, 10) + t(64, 340, 'weaker', C.mut, 10) + t(700, 190, '↑ earns more stars', C.line, 10, 'middle', true)],
    ['760 310', 'What every entry shows you — and what each part means.',
      rows5([['Approval badge', 'legal status — OTC, Rx or banned', C.amber], ['Evidence stars', 'how strong the human proof is', C.teal], ['Technical mechanism', 'the gene / receptor it acts on', C.blue], ['Molecular target', 'an official link to verify it', C.slate], ['In plain English', 'what it actually means for you', C.green]])]
  ];
  const d = D[i]; if (!d) return '';
  return `<figure class="learn-fig pd-fig"><svg viewBox="0 0 ${d[0]}" role="img" aria-label="${esc(d[1])}"><defs><marker id="fd-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="${C.line}"/></marker></defs>${d[2]}</svg><figcaption class="fig-credit">${esc(d[1])}</figcaption></figure>`;
}
D.modules.forEach((m, i) => {
  const route = '/learn/' + i;
  add(route, shell({ route, title: `${m.title.replace(/^MODULE\s*\d+\s*[—-]\s*/i, '')} · RNAwiki Foundations`, desc: `Foundations: ${m.title}`, breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Foundations', route: '/learn' }], body: `<div class="article">${foundationsDiagram(i)}${m.html || ''}</div>` }));
});

// ---- anatomy & physiology: crawlable muscle / energy-system / metabolism pages ----
const ANAT = D.anatomy || { muscles: [], energy_systems: [], metabolism: [] };
const anatCrumb = (name, route) => [{ name: 'Home', route: '/' }, { name: 'Anatomy', route: '/anatomy' }, { name, route }];

// ---- inline learning visuals (self-authored SVG + one verified embeddable 3D model; no fragile hotlinks) ----
// Default 3D viewer: "Anatomy of the Human Muscular System" by jossangelbd (Sketchfab, embeddable). A verified
// physiotherapist can override per-muscle by adding "model_embed" to that muscle in data/anatomy.json.
const MUSCLE_MODEL_DEFAULT = 'https://sketchfab.com/models/75cc6aa94b5c4ed88f9810770d614ac1/embed?ui_theme=dark&autospin=0.15&ui_infos=0&ui_watermark=0&ui_hint=0&transparent=0';
function muscle3D(m) {
  if (!m.model_embed) return `<h2>This muscle in 3D</h2>
    <p class="fig-credit">A 3D model specific to the ${esc(m.name.toLowerCase())} is being added — its origin, insertion and action are detailed below.</p>`;
  return `<h2>This muscle in 3D</h2>
    <figure class="model-embed"><iframe title="${esc(m.name)} — interactive 3D anatomy" src="${m.model_embed}" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen loading="lazy" frameborder="0"></iframe></figure>
    <p class="fig-credit">Drag to rotate · scroll to zoom — see the shape, origin and insertion of the ${esc(m.name.toLowerCase())}. 3D model via Sketchfab (CC-BY).</p>`;
}
// Energy-system power curve: relative power (%) across time. Highlights the page's own system.
const ENERGY_CURVES = {
  labels: ['0s', '10s', '30s', '1m', '2m', '5m+'],
  x: [70, 165, 260, 355, 470, 600],
  systems: [
    { id: 'atp-pcr', name: 'ATP–PCr', color: '#f59e0b', p: [100, 78, 24, 8, 3, 1] },
    { id: 'glycolytic', name: 'Glycolytic', color: '#ef4444', p: [18, 74, 80, 58, 26, 8] },
    { id: 'oxidative', name: 'Oxidative', color: '#38bdf8', p: [8, 16, 30, 44, 52, 54] },
  ],
};
function energyChart(activeId) {
  const C = ENERGY_CURVES, W = 660, H = 340, y0 = 250, py = (v) => y0 - v * 2.05;
  const grid = C.x.map((x, i) => `<line x1="${x}" y1="40" x2="${x}" y2="${y0}" stroke="#1e293b" stroke-width="1"/><text x="${x}" y="${y0 + 22}" text-anchor="middle" font-size="13" fill="#64748b">${C.labels[i]}</text>`).join('');
  const curves = C.systems.map((s) => {
    const active = s.id === activeId;
    const pts = s.p.map((v, i) => `${C.x[i]},${py(v)}`).join(' ');
    const area = active ? `<polygon points="${C.x[0]},${y0} ${pts} ${C.x[C.x.length - 1]},${y0}" fill="${s.color}" opacity="0.12"/>` : '';
    return `${area}<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="${active ? 4 : 2}" stroke-linecap="round" stroke-linejoin="round" opacity="${active ? 1 : 0.45}"/>`;
  }).join('');
  const legend = C.systems.map((s, i) => `<rect x="${72 + i * 190}" y="300" width="26" height="4" rx="2" fill="${s.color}" opacity="${s.id === activeId ? 1 : 0.45}"/><text x="${104 + i * 190}" y="305" font-size="13" font-weight="${s.id === activeId ? 700 : 400}" fill="${s.id === activeId ? '#e2e8f0' : '#94a3b8'}">${s.name}${s.id === activeId ? ' — this page' : ''}</text>`).join('');
  return `<figure class="learn-fig"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Relative power output of the three energy systems over time; the ${activeId} system is highlighted.">
    <text x="70" y="26" font-size="14" font-weight="700" fill="#cbd5e1">Relative power output over time</text>
    <line x1="70" y1="${y0}" x2="620" y2="${y0}" stroke="#334155" stroke-width="1.5"/>
    <line x1="70" y1="40" x2="70" y2="${y0}" stroke="#334155" stroke-width="1.5"/>
    <text x="30" y="150" font-size="12" fill="#64748b" transform="rotate(-90 30 150)" text-anchor="middle">power →</text>
    ${grid}${curves}${legend}
  </svg></figure>
  <p class="fig-credit">Every all-out effort recruits all three systems at once — this shows which one <em>dominates</em> as the seconds tick by.</p>`;
}
ANAT.muscles.forEach((m) => {
  const route = '/muscle/' + m.id; const a = m.anatomy || {};
  const body = `<div class="article"><h1>${esc(m.name)}</h1><p>${esc(m.overview)}</p>
    ${muscle3D(m)}
    <h2>Anatomy</h2><p><b>Muscles:</b> ${esc(m.group)}</p><p><b>Origin:</b> ${esc(a.origin || '')}</p><p><b>Insertion:</b> ${esc(a.insertion || '')}</p>
    <p><b>Actions:</b></p><ul>${(a.actions || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>How the muscle works</h2><p>${esc(m.mechanism)}</p>
    <p><b>Fibre-type bias:</b> ${esc(m.fiber_bias)}</p><p><b>Functional role:</b> ${esc(m.functional_role)}</p>
    <h2>Common problems</h2><ul>${(m.common_problems || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>Training & stretching</h2><p>${esc(m.training || '')}</p><p>${esc(m.stretching || '')}</p>
    ${(m.problems || []).length ? `<h2>Fix or train this</h2><ul>${m.problems.map((pid) => { const pr = GRAPH.problems.find((x) => x.id === pid); return pr ? `<li><a href="/protocol/${pid}/${pr.root_causes[0].id}">${esc(pr.name)}</a></li>` : ''; }).join('')}</ul>` : ''}</div>`;
  add(route, shell({ route, title: `${m.name} — anatomy, function & training · RNAwiki`, desc: (m.overview || '').slice(0, 155), ogImage: renderOgCard(`og/muscle/${m.id}.png`, { kind: 'Muscle · ' + (m.region || ''), title: m.name, sub: m.overview }), breadcrumbs: anatCrumb(m.name, route), body }));
});
function metabolicMill(active) {
  const C = { fat: '#b5533a', carb: '#475569', prot: '#2563eb', mito: '#0d9488', atp: '#d97706', line: '#64748b' };
  const op = z => z === 'out' ? 1 : z === 'imm' ? (active === 'atp-pcr' ? 1 : .32) : z === 'ana' ? (active === 'glycolytic' ? 1 : .32) : z === 'glyc' ? ((active === 'glycolytic' || active === 'oxidative') ? 1 : .32) : (active === 'oxidative' ? 1 : .32);
  const box = (x, y, w, h, label, fill, z, sub) => `<g opacity="${op(z)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${fill}" fill-opacity="0.12" stroke="${fill}" stroke-width="1.5"/><text x="${x + w / 2}" y="${sub ? y + h / 2 - 1 : y + h / 2 + 4}" text-anchor="middle" font-size="12.5" font-weight="700" fill="${fill}">${label}</text>${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 13}" text-anchor="middle" font-size="9.5" fill="${C.line}">${sub}</text>` : ''}</g>`;
  const arr = (x1, y1, x2, y2, z, col) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col || C.line}" stroke-width="2" marker-end="url(#mm-a)" opacity="${op(z)}"/>`;
  const lbl = (x, y, t, z, col) => `<text x="${x}" y="${y}" font-size="10" font-style="italic" fill="${col || C.line}" opacity="${op(z)}" text-anchor="middle">${t}</text>`;
  const nm = { 'atp-pcr': 'ATP–PCr (phosphagen)', glycolytic: 'anaerobic glycolytic', oxidative: 'aerobic oxidative' }[active] || active;
  return `<figure class="learn-fig mm-fig"><svg viewBox="0 0 760 590" role="img" aria-label="How fats, carbohydrates and protein become ATP; ${esc(nm)} route highlighted.">
    <defs><marker id="mm-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="${C.line}"/></marker></defs>
    ${box(40, 14, 190, 36, 'FATS · triglyceride', C.fat, 'fat')}${box(285, 14, 190, 36, 'CARBOHYDRATE', C.carb, 'glyc')}${box(530, 14, 190, 36, 'PROTEIN', C.prot, 'prot')}
    ${arr(135, 50, 135, 66, 'fat')}${arr(380, 50, 380, 66, 'glyc')}${arr(625, 50, 625, 66, 'prot')}
    ${box(40, 66, 190, 30, 'Fatty acids + glycerol', C.fat, 'fat')}${box(285, 66, 190, 30, 'Glucose', C.carb, 'glyc')}${box(530, 66, 190, 30, 'Amino acids', C.prot, 'prot')}
    ${arr(380, 96, 380, 116, 'glyc')}${box(285, 116, 190, 40, 'Glycolysis', C.carb, 'glyc', 'net +2 ATP · fast')}
    ${arr(380, 156, 380, 172, 'glyc')}${box(320, 172, 120, 30, 'Pyruvate', C.carb, 'glyc')}
    ${box(120, 172, 120, 30, 'Lactate', C.carb, 'ana')}${arr(320, 187, 244, 187, 'ana')}${lbl(283, 166, 'no O₂ → fatigue', 'ana', C.fat)}
    <line x1="20" y1="250" x2="740" y2="250" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="6 5"/><text x="738" y="244" font-size="10.5" fill="#94a3b8" text-anchor="end">↑ Cytosol (sarcoplasm) — no oxygen needed</text><text x="738" y="268" font-size="10.5" fill="#94a3b8" text-anchor="end">↓ Mitochondria — needs oxygen (O₂)</text>
    ${arr(135, 96, 135, 300, 'fat')}${box(40, 300, 190, 32, 'β-oxidation', C.fat, 'fat')}
    ${arr(625, 96, 625, 118, 'prot')}${box(530, 118, 190, 32, 'Deamination', C.prot, 'prot')}${lbl(625, 168, '→ into glycolysis or Krebs', 'prot')}
    ${arr(380, 202, 380, 304, 'glyc')}${arr(230, 320, 318, 320, 'fat')}${box(318, 304, 124, 34, 'Acetyl-CoA', C.mito, 'mito')}
    ${arr(442, 320, 560, 320, 'mito')}${box(560, 305, 150, 30, 'Ketone bodies', C.prot, 'mito')}
    ${arr(380, 338, 380, 386, 'mito')}${box(285, 386, 190, 40, 'Krebs cycle', C.mito, 'mito', 'citric-acid cycle')}
    ${arr(380, 426, 380, 452, 'mito')}${box(262, 452, 236, 32, 'Electron transport chain', C.mito, 'mito')}
    ${arr(380, 484, 380, 516, 'mito')}${box(302, 516, 158, 48, '⚡ ATP', C.atp, 'out')}
    ${box(540, 408, 200, 78, 'Creatine phosphate → ATP', C.atp, 'imm', 'instant · 0–10s · skips the mill')}${arr(540, 470, 462, 522, 'imm', C.atp)}
  </svg><figcaption class="fig-credit">The metabolic mill — how each fuel is broken down and fed into ATP. Lit path: the <b>${esc(nm)}</b> system.</figcaption></figure>`;
}
ANAT.energy_systems.forEach((e) => {
  const route = '/energy/' + e.id;
  const body = `<div class="article"><h1>${esc(e.name)}</h1><p>${esc(e.overview)}</p>
    ${energyChart(e.id)}
    <h2>The metabolic pathway — where the energy comes from</h2>${metabolicMill(e.id)}
    <p><b>Duration:</b> ${esc(e.duration)} · <b>Intensity:</b> ${esc(e.intensity)} · <b>Fuel:</b> ${esc(e.fuel)} · <b>Oxygen:</b> ${esc(e.oxygen)}</p>
    <h2>How it works</h2><ol>${(e.steps || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    <h2>What it powers</h2><ul>${(e.powers || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <p><b>Byproduct:</b> ${esc(e.byproduct)}</p><p><b>Recovery:</b> ${esc(e.recovery)}</p><p><b>Training:</b> ${esc(e.training)}</p></div>`;
  add(route, shell({ route, title: `${e.name} — how it fuels muscle · RNAwiki`, desc: (e.overview || '').slice(0, 155), ogImage: renderOgCard(`og/energy/${e.id}.png`, { kind: 'Energy system', title: e.name.split('(')[0].trim(), sub: e.plain || e.overview }), breadcrumbs: anatCrumb(e.name, route), body }));
});
function physioDiagram(id) {
  const C = { glu: '#475569', ins: '#0d9488', mito: '#0d9488', fat: '#b5533a', prot: '#2563eb', atp: '#d97706', line: '#64748b', up: '#059669', down: '#b3261e', mut: '#94a3b8' };
  const box = (x, y, w, h, label, fill, sub) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" fill-opacity="0.12" stroke="${fill}" stroke-width="1.5"/><text x="${x + w / 2}" y="${sub ? y + h / 2 - 2 : y + h / 2 + 4}" text-anchor="middle" font-size="13" font-weight="700" fill="${fill}">${label}</text>${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" font-size="10.5" fill="${C.line}">${sub}</text>` : ''}</g>`;
  const arr = (x1, y1, x2, y2, col) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col || C.line}" stroke-width="2.2" marker-end="url(#pd-a)"/>`;
  const t = (x, y, txt, col, size, anchor, ital) => `<text x="${x}" y="${y}" font-size="${size || 10.5}" fill="${col || C.line}" text-anchor="${anchor || 'middle'}"${ital ? ' font-style="italic"' : ''}>${txt}</text>`;
  const D = {
    'insulin-blood-sugar': ['760 400', 'How insulin is released, and what it tells your body to do.',
      box(280, 16, 200, 44, 'Blood glucose ↑', C.glu, 'after a meal') + arr(380, 60, 380, 80) +
      box(240, 80, 280, 52, 'Pancreas β-cell senses it', C.ins, 'glucose → ATP↑ → Ca²⁺ → release') +
      t(534, 110, '← GLP-1 / GIP (gut) amplify it', C.line, 10.5, 'start', true) + arr(380, 132, 380, 152) +
      box(300, 152, 160, 44, 'INSULIN', C.ins, 'released into blood') +
      arr(380, 196, 140, 232) + arr(380, 196, 380, 232) + arr(380, 196, 620, 232) +
      box(30, 232, 220, 62, 'Muscle & fat', C.glu, 'GLUT4 opens → glucose in') +
      box(270, 232, 220, 62, 'Liver', C.glu, 'store glycogen · stop new glucose') +
      box(510, 232, 220, 62, 'Fat', C.fat, 'store fat · block fat-burning') +
      arr(380, 294, 380, 330) + box(180, 330, 400, 46, 'Fed state → store & build, pause fat-burning', C.atp)],
    'glucose-conversion': ['810 380', 'Blood glucose is held in a tight range by four conversions.',
      box(300, 150, 170, 66, 'Blood glucose', C.ins, 'kept in a tight range') +
      box(605, 150, 185, 66, 'Glycogen store', C.glu, 'liver + muscle') +
      box(20, 150, 185, 66, 'New glucose', C.glu, 'gluconeogenesis') +
      box(300, 300, 170, 56, 'Burned for energy', C.atp, 'glycolysis → ATP') +
      arr(470, 170, 605, 170) + t(537, 162, 'store (insulin)', C.up, 10) +
      arr(605, 200, 470, 200) + t(537, 218, 'release (glucagon)', C.down, 10) +
      arr(205, 183, 300, 183) + t(112, 240, 'from lactate · amino acids · glycerol', C.mut, 9, 'middle', true) +
      arr(385, 216, 385, 300)],
    'fat-management': ['900 300', 'Fat is stored when insulin is high and burned when it is low.',
      box(20, 110, 160, 64, 'Glucose + dietary fat', C.glu, 'fed · high insulin') +
      box(250, 100, 160, 84, 'FAT CELL', C.fat, 'triglyceride store') +
      box(490, 110, 160, 64, 'Fatty acids + glycerol', C.fat, 'released to blood') +
      box(720, 110, 160, 64, 'Muscle mitochondria', C.mito, 'β-oxidation → ATP') +
      arr(180, 142, 250, 142) + t(215, 128, 'store', C.up, 10) + t(215, 160, 'lipogenesis', C.mut, 9, 'middle', true) +
      arr(410, 142, 490, 142) + t(450, 126, 'burn · lipolysis', C.down, 9.5) + t(450, 160, 'low insulin', C.mut, 9, 'middle', true) +
      arr(650, 142, 720, 142) + t(685, 128, 'travel', C.mut, 9.5, 'middle', true) + t(685, 160, '+ carnitine', C.mut, 9, 'middle', true) +
      box(230, 230, 440, 46, 'Insulin is the gate — you burn fat mainly when insulin is LOW', C.atp)],
    'protein-muscle-turnover': ['760 400', 'Muscle grows when building outpaces breakdown.',
      box(40, 20, 300, 40, 'BUILD — synthesis (MPS)', C.up) + box(420, 20, 300, 40, 'BREAK DOWN — (MPB)', C.down) +
      box(40, 78, 300, 40, 'Resistance training', C.up) + box(40, 126, 300, 40, 'Protein + leucine → mTOR ↑', C.up) +
      box(40, 174, 300, 40, 'Testosterone · growth hormone', C.up) + box(40, 222, 300, 40, 'Insulin — blocks breakdown', C.up) +
      box(420, 78, 300, 40, 'Fasting / low energy → AMPK ↑', C.down) + box(420, 126, 300, 40, 'Cortisol', C.down) +
      `<line x1="380" y1="72" x2="380" y2="268" stroke="${C.mut}" stroke-width="1.4" stroke-dasharray="5 5"/>` +
      box(150, 320, 460, 52, 'Net muscle GAIN when build > break down', C.up)]
  };
  const d = D[id]; if (!d) return '';
  return `<figure class="learn-fig pd-fig"><svg viewBox="0 0 ${d[0]}" role="img" aria-label="${esc(d[1])}"><defs><marker id="pd-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="${C.line}"/></marker></defs>${d[2]}</svg><figcaption class="fig-credit">${esc(d[1])}</figcaption></figure>`;
}
ANAT.metabolism.forEach((p) => {
  const route = '/physiology/' + p.id;
  const steps = p.how_it_works || p.how_insulin_is_made || p.steps || [];
  const body = `<div class="article"><h1>${esc(p.name)}</h1><p>${esc(p.overview)}</p>
    ${physioDiagram(p.id)}
    <h2>How it works</h2><ol>${steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    ${p.what_insulin_does ? `<h2>What insulin does</h2><ul>${p.what_insulin_does.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${p.when_it_matters ? `<h2>Why it matters</h2><p>${esc(p.when_it_matters)}</p>` : ''}
    <p><b>Key hormones:</b> ${(p.hormones || []).map(esc).join(', ')}</p>
    ${(() => { const cs = (p.compounds || []).map((n) => findCpt(n)).filter(Boolean); const seen = new Set(); const u = cs.filter((c) => !seen.has(c.id) && seen.add(c.id)); return u.length ? `<h2>Compounds that act on this</h2><ul>${u.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a></li>`).join('')}</ul>` : ''; })()}</div>`;
  add(route, shell({ route, title: `${p.name} — the physiology in plain English · RNAwiki`, desc: (p.plain || p.overview || '').slice(0, 155), ogImage: renderOgCard(`og/physiology/${p.id}.png`, { kind: 'Physiology', title: p.name, sub: p.plain || p.overview }), breadcrumbs: anatCrumb(p.name, route), body }));
});
{
  const route = '/anatomy';
  const body = `<div class="article"><h1>Anatomy &amp; physiology</h1><p>The body behind the protocol — muscles, the energy systems that fuel them, and the metabolism behind every food and supplement.</p>
    <h2>Muscles</h2><ul>${ANAT.muscles.map((m) => `<li><a href="/muscle/${m.id}">${esc(m.name)}</a></li>`).join('')}</ul>
    <h2>Energy systems</h2><ul>${ANAT.energy_systems.map((e) => `<li><a href="/energy/${e.id}">${esc(e.name)}</a></li>`).join('')}</ul>
    <h2>Metabolism</h2><ul>${ANAT.metabolism.map((p) => `<li><a href="/physiology/${p.id}">${esc(p.name)}</a></li>`).join('')}</ul></div>`;
  add(route, shell({ route, title: 'Anatomy & physiology — muscles, energy systems & metabolism · RNAwiki', desc: 'The body behind the protocol: every major muscle, the energy systems that fuel movement, and the metabolism behind nutrition and supplements — in plain English.', breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Anatomy', route }], body }));
}

// --- hub pages: previously shipped an empty shell (invisible to Google + social) ---
{ // Learn — the on-ramp / structured primer, using the ownership map as its literal structure
  const ANAT = D.anatomy || { muscles: [], energy_systems: [], metabolism: [] };
  const li = (arr, href) => arr.map(href).join('');
  const body = `<div class="article"><h1>Learn — how to read RNAwiki</h1>
    <p>New here? The whole site is one map: <b>a problem → the protocol that fixes it → the compounds in it → the target each compound hits → the pathway it belongs to → the physiology underneath</b>. Start at the top and drill down only as far as you want.</p>
    <h2>1. Start here — get a plan</h2><p>Name a problem or goal and get a Move · Fuel · Stack protocol: <a href="/solve">Solve →</a></p>
    <h2>2. Foundations (the basics)</h2><ul>${D.modules.map((m, i) => `<li><a href="/learn/${i}">${esc(m.title.replace(/^MODULE\s*\d+\s*[—-]\s*/i, ''))}</a></li>`).join('')}</ul>
    <h2>3. Energy systems</h2><ul>${li(ANAT.energy_systems, (e) => `<li><a href="/energy/${e.id}">${esc(e.name)}</a></li>`)}</ul>
    <h2>4. Metabolism &amp; physiology</h2><ul>${li(ANAT.metabolism, (p) => `<li><a href="/physiology/${p.id}">${esc(p.name)}</a></li>`)}</ul>
    <h2>5. Muscle anatomy</h2><ul>${li(ANAT.muscles, (m) => `<li><a href="/muscle/${m.id}">${esc(m.name)}</a></li>`)}</ul>
    <h2>6. The systems (advanced)</h2><p>The 16 master <a href="/pathways">pathways</a> and their molecular targets — the deepest layer, for when you want to know <i>why</i>.</p></div>`;
  add('/learn', shell({ route: '/learn', title: 'Learn — how the body works and how to read RNAwiki (Singapore)', desc: 'A guided primer: start from your goal, follow it down to the movement, food, compound, target and pathway. Energy systems, metabolism and muscle anatomy in plain English.', breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Learn', route: '/learn' }], body }));
}
{ // Stack builder
  const top = D.compounds.slice().sort((a, b) => b.stars - a.stars).slice(0, 40);
  add('/stack', shell({ route: '/stack', title: 'Supplement Stack Builder — combine & check interactions · RNAwiki', desc: 'Build a supplement stack, see combined goal coverage, shared pathways and synergy, and flag prescription vs OTC — then save and share it. Singapore.', breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Stack', route: '/stack' }], body: `<div class="article"><h1>Stack Builder</h1><p>Add compounds from any page, see combined goal coverage, the pathways you're hitting and shared targets, and which items need medical supervision. Your stack saves locally and is shareable by link.</p><h2>Popular compounds to stack</h2><ul>${top.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a> — ${stars(c.stars)}</li>`).join('')}</ul></div>` }));
}
{ // For pros
  add('/pros', shell({ route: '/pros', title: 'For health professionals — help build the protocols · RNAwiki', desc: 'Physiotherapists, dietitians, nutritionists, pharmacists and clinics: help peer-review and shape the protocols in your field, and get featured on the ones patients follow. Join the founding list — no account needed.', breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'For pros', route: '/pros' }], body: `<div class="article"><h1>Help build the protocols your patients already follow.</h1><p>RNAwiki turns root causes into evidence-ranked Move · Fuel · Stack protocols people run and report back on. We're opening a first group of founding clinicians and partner businesses to peer-review and sharpen the clinical logic — the assessment questions, the safety flags, the protocol itself — attributed to the patients following it.</p><h2>How it works</h2><ol><li><b>Register your interest</b> — a two-minute founding list, no account needed.</li><li><b>Shape your specialty's logic</b> — physios shape movement, dietitians shape fuel, pharmacists shape the stack.</li><li><b>Get featured &amp; get leads</b> — your profile and booking sit on every protocol you improve.</li></ol><p><a href="/for-clinicians">Join the founding list →</a></p></div>` }));
}
// For clinicians & businesses — the interest/waitlist page (crawlable; SPA hydrates the form)
add('/for-clinicians', shell({ route: '/for-clinicians', ogType: 'website', title: 'For clinicians & health businesses — join the founding list · RNAwiki', desc: 'Physiotherapists, dietitians, pharmacists, doctors, clinics and health brands: help peer-review and shape the protocols patients follow, and get featured on them. Two-minute founding list — no account needed.', breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'For clinicians', route: '/for-clinicians' }], body: `<div class="article"><h1>Help build &amp; peer-review the protocols your patients already follow.</h1><p>RNAwiki turns root causes into evidence-ranked Move · Fuel · Stack protocols people run and report back on. We're opening a first group of <b>founding clinicians and partner businesses</b> to sharpen the clinical logic in their field — the assessment questions, the safety flags, the protocol itself — attributed to the patients following it.</p><h2>What you get</h2><ul><li><b>Attribution, not data entry</b> — your name on protocols people are actively running, with real outcomes proving they work.</li><li><b>Own your specialty's logic</b> — physios shape movement, dietitians shape fuel, pharmacists shape the stack; differential questions and red-flags included.</li><li><b>Founding status</b> — the first 50 are named as founding contributors.</li><li><b>Warm leads, later</b> — patients running your protocol are pre-qualified for your clinic when the marketplace opens.</li></ul><p>It takes two minutes and needs no account — just tell us who you are and what you'd improve first.</p></div>` }));

// solve hub
add('/solve', shell({ route: '/solve', title: 'Solve a problem or reach a goal — protocol engine · RNAwiki', desc: 'Tell us the problem to fix or goal to reach. Get a full Move · Fuel · Stack protocol for the root cause, localised for Singapore.', breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }], body: `<h1>Stop guessing. Start solving.</h1><p>Pick a problem or goal and get a full protocol — the movement to fix it, Singapore foods to fuel it, and evidence-ranked compounds.</p><ul>${GRAPH.problems.map((p) => `<li><a href="/protocol/${p.id}/${p.root_causes[0].id}">${esc(p.name)}</a></li>`).join('')}</ul>` }));

// ---- crawlable home page (SPA shell has an empty body; this gives Google real content) ----
// Written to home.html; the server serves it for "/" and falls back to index.html.
{
  const byCat = {};
  GRAPH.problems.forEach((p) => { (byCat[p.category] = byCat[p.category] || []).push(p); });
  const problemList = Object.keys(byCat).map((cat) => `<section><h2>${esc(cat)}</h2><ul class="seo-links">${byCat[cat]
    .map((p) => `<li><a href="/protocol/${p.id}/${p.root_causes[0].id}">${esc(p.name)}</a></li>`).join('')}</ul></section>`).join('');
  const goalLinks = D.goals.map((g) => `<li><a href="/goal/${g.id}">${esc(g.label)}</a></li>`).join('');
  const homeBody = `
    <section class="hero funnel-hero">
      <div class="kicker">The open protocol engine</div>
      <h1>DNA is the idea that never came to life. RNA is the action.</h1>
      <p class="hero-lead">DNA is a blueprint locked in a vault. RNA is the messenger, the architect, and the builder — it reads the code and makes it real. RNAwiki is the RNA for your health: name a problem or a goal, and we build the exact movement, food, and supplements that fix its root cause — with every supplement broken down to its compounds, pathways, and molecular targets, and every food to the nutrients that matter, all in plain English.</p>
      <p><a class="cta-primary" href="/solve">Build my protocol →</a></p>
    </section>
    ${prerenderDailyFact()}
    <section class="how-3"><h2>How it works</h2>
      <ol><li><b>Diagnose</b> — tell us your pain or goal and answer one clinical question to find the exact root cause.</li>
      <li><b>Execute</b> — get your precision protocol: the movement, evidence-ranked compounds, and biological targets for your recovery.</li>
      <li><b>Fuel</b> — log your local Singaporean meals and watch your nutrient bars fill toward the targets that heal your issue.</li></ol>
    </section>
    <section class="why-rna"><h2>Why RNA? DNA is the blueprint. RNA is the builder.</h2>
      <p>Most people idolise DNA — the master code locked in the vault. But DNA does nothing on its own; a blueprint can't pour concrete. RNA is the action: the messenger and builder that reads your code and builds the proteins, tissue, and enzymes that become your physical reality. Every adaptation you force — a heavy lift, recovery from DOMS, a longevity protocol — is a wave of RNA translating your genes into a stronger, longer-lived you. RNAwiki is the messenger: it turns the foundational code of exercise science, biomechanics, and longevity into results you can use today.</p></section>
    <section><h2>Start a protocol</h2>${problemList}</section>
    <section><h2>Or browse by goal</h2><ul class="seo-links">${goalLinks}</ul></section>`;
  // write directly (not via add()) so "/home" never leaks into the sitemap; canonical is "/"
  fs.writeFileSync(path.join(SITE, 'home.html'), shell({
    route: '/', ogType: 'website',
    title: 'RNAwiki — Stop guessing, start solving. Precision root-cause health protocols',
    desc: 'Fix the root cause, not the symptom. Get a precision Move · Fuel · Stack protocol for pain, metabolic, sleep, hormonal, cognitive, longevity and performance goals — evidence-ranked, honest, in plain English.',
    jsonld: [WEBSITE, ORG],
    breadcrumbs: [{ name: 'Home', route: '/' }],
    body: homeBody,
  }));
}

// ---- write files ----
let written = 0;
pages.forEach(({ route, html }) => {
  const file = path.join(SITE, route.replace(/^\//, '') + '.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html); written++;
});

// sitemap + robots
const now = new Date().toISOString().slice(0, 10);
const urls = ['/', '/solve', '/browse', '/az', '/about', '/learn', '/pathways', '/legend', ...pages.map((p) => p.route)];
const uniq = [...new Set(urls)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniq.map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>${u === '/' ? '1.0' : u.startsWith('/protocol') || u.startsWith('/c/') ? '0.8' : '0.6'}</priority></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(SITE, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(SITE, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`[prerender] wrote ${written} static pages + sitemap.xml (${uniq.length} urls) + robots.txt`);
console.log(`[prerender] base URL: ${SITE_URL}`);
