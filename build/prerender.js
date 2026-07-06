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
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const tkey = (s) => s.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
const stars = (n) => '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));
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
function shell({ route, title, desc, jsonld, body, breadcrumbs }) {
  const url = SITE_URL + route;
  const ld = [].concat(jsonld || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('');
  const crumbLd = breadcrumbs ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: SITE_URL + b.route })),
  })}</script>` : '';
  return `<!DOCTYPE html>
<html lang="en-SG">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="geo.region" content="SG"><meta name="geo.placename" content="Singapore">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:locale" content="en_SG">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE_URL}/og.png">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="stylesheet" href="/styles.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧬</text></svg>">
${crumbLd}${ld}
</head>
<body>
<header class="topbar">
  <a href="/" class="brand">🧬 RNA<span>wiki</span></a>
  <div class="search-wrap"><input id="search" type="search" placeholder="Search 220+ compounds, protocols, terms…" autocomplete="off" spellcheck="false"><div id="search-results" class="search-results" hidden></div></div>
  <nav class="topnav">
    <a href="/solve" class="nav-solve">Solve</a><a href="/learn">Learn</a><a href="/fuel">Fuel</a>
    <a href="/stack">Stack <span id="stack-badge" class="stack-badge" hidden>0</span></a><a href="/pros">For pros</a>
  </nav>
  <span id="account-slot" class="account-slot"></span>
  <button id="menu-btn" class="menu-btn" aria-label="Menu">☰</button>
</header>
<main id="app">${body}</main>
<footer class="foot"><div>💡 Not medical advice · <a href="/solve">Solve</a> · <a href="/browse">Browse</a> · <a href="/anatomy">Anatomy</a> · <a href="/pathways">Pathways</a> · <a href="/az">A–Z</a> · <a href="/pros">For pros</a> · <a href="/legend">Legend</a> · <a href="/about">About</a></div><div class="foot-stats" id="foot-stats"></div></footer>
<script src="/data.js"></script>
<script src="/app.js"></script>
</body>
</html>`;
}

const crumbHtml = (items) => `<div class="crumbs">${items.map((it, i) => it.route ? `<a href="${it.route}">${esc(it.name)}</a>` : `<span>${esc(it.name)}</span>`).join('<span class="sep">›</span>')}</div>`;

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
// compounds
D.compounds.forEach((c) => {
  const route = '/c/' + slug(c.name);
  const goalLinks = (c.goalIds || []).map((g) => `<a href="/goal/${g}">${esc(goalById[g].label)}</a>`).join(' · ');
  const usedIn = compoundProtocols[c.id] || [];
  const usedInHtml = usedIn.length ? `<h2>Used in these protocols</h2><ul>${usedIn.slice(0, 8).map((u) => `<li><a href="${u.route}">${esc(u.name)}</a></li>`).join('')}</ul>` : '';
  const pathLink = (c.pathwayIds || []).length && D.pathways[c.pathwayIds[0]] ? `<p><b>How it works:</b> <a href="/pathway/${c.pathwayIds[0]}">the ${esc(D.pathways[c.pathwayIds[0]].shortLabel)} pathway →</a></p>` : '';
  const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: c.category, route: '/' }, { name: c.name }])}
    <div class="detail"><h1>${esc(c.name)}</h1>
    <p><b>Evidence:</b> ${stars(c.stars)} · <b>Status:</b> ${(c.approvalLabels || []).join(', ')}</p>
    ${c.plain ? `<h2>In plain English</h2><p>${esc(c.plain)}</p>` : ''}
    ${c.mechanism ? `<h2>How it works</h2><p>${esc(c.mechanism)}</p>` : ''}
    ${c.protocol ? `<h2>Protocol</h2><p>${esc(c.protocol)}</p>` : ''}
    ${c.watch ? `<h2>Watch out</h2><p>${esc(c.watch)}</p>` : ''}
    ${c.bottom ? `<h2>Bottom line</h2><p>${esc(c.bottom)}</p>` : ''}
    ${goalLinks ? `<p><b>Helps with:</b> ${goalLinks}</p>` : ''}
    ${pathLink}
    ${usedInHtml}</div>`;
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: c.name,
    about: { '@type': 'Drug', name: c.name }, description: (c.plain || c.bottom || '').slice(0, 300),
    url: SITE_URL + route, inLanguage: 'en-SG',
  };
  add(route, shell({ route, title: `${c.name} — evidence, mechanism & how it works · RNAwiki`, desc: (c.plain || c.bottom || c.mechanism || c.name).slice(0, 155), jsonld, breadcrumbs: [{ name: 'Home', route: '/' }, { name: c.name, route }], body }));
});

// goals
D.goals.forEach((g) => {
  const route = '/goal/' + g.id;
  const list = D.compounds.filter((c) => c.goalIds.includes(g.id)).sort((a, b) => b.stars - a.stars).slice(0, 30);
  const protos = GRAPH.problems.filter((p) => p.root_causes.some((rc) => (rc.goal_ids || []).includes(g.id)));
  const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: g.label }])}
    <h1>${g.icon} ${esc(g.label)}</h1>
    <p>${list.length} compounds that help you ${esc(g.label.toLowerCase())}, ranked by strength of human evidence — in plain English, localised for Singapore.</p>
    <ul>${list.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a> — ${stars(c.stars)}</li>`).join('')}</ul>
    ${protos.length ? `<h2>Full protocols</h2><ul>${protos.map((p) => `<li><a href="/protocol/${p.id}/${p.root_causes[0].id}">${esc(p.name)} — Move, Fuel &amp; Stack</a></li>`).join('')}</ul>` : ''}`;
  add(route, shell({ route, title: `${g.label} — what actually helps · RNAwiki`, desc: `Compounds and full protocols that help you ${g.label.toLowerCase()}, ranked by human evidence. Plain English, honest verdicts, localised for Singapore.`, breadcrumbs: [{ name: 'Home', route: '/' }, { name: g.label, route }], body }));
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
      <h3>Move — the mechanics that fix it${rc.prescription ? `: ${esc(rc.prescription.scheme)}` : ''}</h3>
      ${rc.prescription ? `<p>${esc(rc.prescription.detail)}</p>` : ''}
      ${move.length ? `<ul>${move.map((e) => `<li>${esc(e.name)}</li>`).join('')}</ul>` : ''}
      <h3>Fuel — Singapore foods to fuel it</h3>
      ${fuel.length ? `<ul>${fuel.map((f) => `<li>${esc(f.name)}${f.sg_local ? ' (local SG)' : ''}</li>`).join('')}</ul>` : ''}
      ${nt ? `<p><b>Daily nutrient targets:</b> ${esc(nt)}</p>` : ''}
      <h3>Stack — evidence-ranked compounds</h3>
      <ul>${stack.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a> — ${stars(c.stars)}</li>`).join('')}</ul>
      <p><a href="/fuel/${p.id}/${rc.id}">Open the Fuel Tracker for this protocol →</a></p>
      <p><em>Educational protocol, not medical advice.</em></p>`;
    const protoLd = {
      '@context': 'https://schema.org', '@type': 'MedicalWebPage', inLanguage: 'en-SG',
      name: `${p.name} — ${rc.name} protocol`, description: (rc.diagnostic || p.name),
      about: { '@type': 'MedicalCondition', name: p.name },
      audience: { '@type': 'MedicalAudience', geographicArea: { '@type': 'AdministrativeArea', name: 'Singapore' } },
      lastReviewed: '2026-07-06', url: SITE_URL + route,
    };
    add(route, shell({ route, title: `${p.name} in Singapore — how to fix ${rc.name.replace(/\s*\([^)]*\)/, '').toLowerCase()} (Move · Fuel · Stack) · RNAwiki`, desc: `${p.name} (${rc.name}): the exercises to fix it, Singapore foods to fuel it, and evidence-ranked supplements — a full root-cause protocol for Singapore. Not medical advice.`, jsonld: protoLd, breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }, { name: p.name, route }], body }));
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
  add(route, shell({ route, title: `${t.sym} — molecular target & the compounds that hit it · RNAwiki`, desc: `${t.sym}: ${(t.name || '').slice(0, 130)}. Learn what it does and every compound that acts on it.`, breadcrumbs: [{ name: 'Home', route: '/' }, { name: t.sym, route }], body }));
});

// pathways + learn
D.pathways.forEach((p, i) => {
  const route = '/pathway/' + i;
  add(route, shell({ route, title: `${p.shortLabel} pathway explained · RNAwiki`, desc: `The ${p.shortLabel} pathway in plain English, and the compounds that pull it.`, breadcrumbs: [{ name: 'Home', route: '/' }, { name: p.shortLabel, route }], body: `<div class="article"><h1>${esc(p.shortLabel)}</h1>${p.html || ''}</div>` }));
});
D.modules.forEach((m, i) => {
  const route = '/learn/' + i;
  add(route, shell({ route, title: `${m.title.replace(/^MODULE\s*\d+\s*[—-]\s*/i, '')} · RNAwiki Foundations`, desc: `Foundations: ${m.title}`, breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Foundations', route: '/learn' }], body: `<div class="article">${m.html || ''}</div>` }));
});

// ---- anatomy & physiology: crawlable muscle / energy-system / metabolism pages ----
const ANAT = D.anatomy || { muscles: [], energy_systems: [], metabolism: [] };
const anatCrumb = (name, route) => [{ name: 'Home', route: '/' }, { name: 'Anatomy', route: '/anatomy' }, { name, route }];
ANAT.muscles.forEach((m) => {
  const route = '/muscle/' + m.id; const a = m.anatomy || {};
  const body = `<div class="article"><h1>${esc(m.name)}</h1><p>${esc(m.overview)}</p>
    <h2>Anatomy</h2><p><b>Muscles:</b> ${esc(m.group)}</p><p><b>Origin:</b> ${esc(a.origin || '')}</p><p><b>Insertion:</b> ${esc(a.insertion || '')}</p>
    <p><b>Actions:</b></p><ul>${(a.actions || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>How the muscle works</h2><p>${esc(m.mechanism)}</p>
    <p><b>Fibre-type bias:</b> ${esc(m.fiber_bias)}</p><p><b>Functional role:</b> ${esc(m.functional_role)}</p>
    <h2>Common problems</h2><ul>${(m.common_problems || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>Training & stretching</h2><p>${esc(m.training || '')}</p><p>${esc(m.stretching || '')}</p></div>`;
  add(route, shell({ route, title: `${m.name} — anatomy, function & training · RNAwiki`, desc: (m.overview || '').slice(0, 155), breadcrumbs: anatCrumb(m.name, route), body }));
});
ANAT.energy_systems.forEach((e) => {
  const route = '/energy/' + e.id;
  const body = `<div class="article"><h1>${esc(e.name)}</h1><p>${esc(e.overview)}</p>
    <p><b>Duration:</b> ${esc(e.duration)} · <b>Intensity:</b> ${esc(e.intensity)} · <b>Fuel:</b> ${esc(e.fuel)} · <b>Oxygen:</b> ${esc(e.oxygen)}</p>
    <h2>How it works</h2><ol>${(e.steps || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    <h2>What it powers</h2><ul>${(e.powers || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <p><b>Byproduct:</b> ${esc(e.byproduct)}</p><p><b>Recovery:</b> ${esc(e.recovery)}</p><p><b>Training:</b> ${esc(e.training)}</p></div>`;
  add(route, shell({ route, title: `${e.name} — how it fuels muscle · RNAwiki`, desc: (e.overview || '').slice(0, 155), breadcrumbs: anatCrumb(e.name, route), body }));
});
ANAT.metabolism.forEach((p) => {
  const route = '/physiology/' + p.id;
  const steps = p.how_it_works || p.how_insulin_is_made || p.steps || [];
  const body = `<div class="article"><h1>${esc(p.name)}</h1><p>${esc(p.overview)}</p>
    <h2>How it works</h2><ol>${steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    ${p.what_insulin_does ? `<h2>What insulin does</h2><ul>${p.what_insulin_does.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${p.when_it_matters ? `<h2>Why it matters</h2><p>${esc(p.when_it_matters)}</p>` : ''}
    <p><b>Key hormones:</b> ${(p.hormones || []).map(esc).join(', ')}</p></div>`;
  add(route, shell({ route, title: `${p.name} — the physiology in plain English · RNAwiki`, desc: (p.plain || p.overview || '').slice(0, 155), breadcrumbs: anatCrumb(p.name, route), body }));
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
  add('/pros', shell({ route: '/pros', title: 'For health professionals in Singapore — contribute, get featured, get leads · RNAwiki', desc: 'Physiotherapists, dietitians, nutritionists and pharmacists in Singapore: improve the protocols in your field and get featured on them — profile, booking link and local leads. Free.', breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'For pros', route: '/pros' }], body: `<div class="article"><h1>Contribute your expertise. Get featured. Get local leads.</h1><p>RNAwiki is where Singaporeans come to fix a problem or reach a goal. No one owns a protocol — but the verified experts who keep each one accurate get featured on it, with a link to their profile and booking. Contribute in your field and the leads come to you.</p><h2>How it works</h2><ol><li><b>Get verified</b> — prove your credential and link us from your site.</li><li><b>Improve a protocol</b> — edit the movement, nutrition or compounds in your field.</li><li><b>Get featured &amp; get leads</b> — your profile and booking sit on every protocol you improve.</li></ol><p><a href="/solve">See the protocols you could improve →</a></p></div>` }));
}
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
      <div class="kicker">The open protocol engine · Singapore</div>
      <h1>DNA is the idea that never came to life. RNA is the action.</h1>
      <p class="hero-lead">DNA is a blueprint locked in a vault. RNA is the messenger, the architect, and the builder — it reads the code and makes it real. RNAwiki is the RNA for your health: name a problem or a goal, and we build the exact movement, food, and supplements that fix its root cause — with every supplement broken down to its compounds, pathways, and molecular targets, and every food to the nutrients that matter, all in plain English.</p>
      <p><a class="cta-primary" href="/solve">Build my protocol →</a></p>
    </section>
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
    route: '/',
    title: 'RNAwiki — Stop guessing, start solving. Precision health protocols for Singapore',
    desc: 'Fix the root cause, not the symptom. Get a precision Move · Fuel · Stack protocol for pain, metabolic, sleep, hormonal, cognitive, longevity and performance goals — evidence-ranked and localised for Singapore.',
    jsonld: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'RNAwiki', url: SITE_URL + '/', description: 'Precision, root-cause health protocols localised for Singapore.' },
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
