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
const crypto = require('crypto'); // per-page sitemap lastmod hashes (see "sitemap + robots" below)

// ---- BLOCK RENDERER (2026-07-28) ----------------------------------------------------------
// Two measured defects in how authored prose reaches the page, both presentation-only:
//
//   1. MARKDOWN LISTS RENDERED AS PROSE. 87 blocks in learn_expand.json (8,721 words) are authored
//      as "- item\n\n- item". Both renderers wrapped the whole thing in one <p>, and HTML collapses
//      the newlines — so /pathway/6 shipped a 558-word wall of text with literal dashes in it. The
//      longest "paragraphs" on the site were never paragraphs.
//   2. SLABS. 913 blocks run past 90 words; the reader gets no landing place. Splitting at sentence
//      boundaries takes the 90th percentile from 215 words to 93 with zero re-authoring.
//
// This changes not one word of content — it only decides where a block ends. Verified lossless
// across all 45 courses (0 words added or lost).
// `inline` is passed in because the two documents escape differently: app.js formats-then-escapes
// (mdInline), prerender.js escapes-then-formats (mdSafe). Do not hardcode either one here.
const MD_ABBR = /(?:\b(?:et al|vs|i\.e|e\.g|cf|approx|Dr|Prof|Mr|Mrs|Ms|St|Fig|No|ca|resp|incl|max|min|avg|ie|eg)\.)$/i;
function mdSentences(text) {
  const out = []; let buf = '';
  // Judged in context: a decimal (p<0.05), an abbreviation (et al.), an initial (J. Smith) and a
  // real full stop are indistinguishable to a naive /[.!?]\s/ split.
  for (let i = 0; i < text.length; i++) {
    buf += text[i];
    if (!/[.!?]/.test(text[i])) continue;
    const next = text.slice(i + 1);
    if (!/^\s/.test(next)) continue;
    if (/^\s*$/.test(next)) break;
    if (!/^\s+["'“(]?[A-Z0-9]/.test(next)) continue;
    if (MD_ABBR.test(buf.trimEnd())) continue;
    if (/\b[A-Z]\.$/.test(buf.trimEnd())) continue;
    out.push(buf.trim()); buf = '';
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}
const mdWc = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
function mdChunk(block, MAX, TARGET) {
  if (mdWc(block) <= MAX) return [block];
  const sents = mdSentences(block);
  if (sents.length < 2) return [block];         // one giant sentence — leave it whole, don't maim it
  const out = []; let cur = [];
  for (const s of sents) {
    // Close the current chunk BEFORE the sentence that would burst it, not after. Appending first
    // and checking after let a 64-word chunk plus a 70-word sentence ship as 134 words — which is
    // how /learn/0 kept a 135-word paragraph through the first pass of this fix.
    if (cur.length && mdWc(cur.join(' ') + ' ' + s) > MAX) { out.push(cur.join(' ')); cur = []; }
    cur.push(s);
    if (mdWc(cur.join(' ')) >= TARGET) { out.push(cur.join(' ')); cur = []; }
  }
  if (cur.length) {
    // A stranded tail of a few words reads as a mistake, so fold it back — but ONLY if the merged
    // paragraph still respects MAX. Without that guard this rule defeated the limit it sits inside:
    // biceps mechStep[4] is 5 sentences of 4/24/27/34/12 words, the first four flush at exactly 89,
    // and folding the 12-word tail back produced a 101-word paragraph. Every "why is this still
    // over 90?" I chased today traced to here, not to the sentence splitter.
    const tail = cur.join(' ');
    if (mdWc(tail) < 25 && out.length && mdWc(out[out.length - 1] + ' ' + tail) <= MAX) {
      out[out.length - 1] += ' ' + tail;
    } else out.push(tail);
  }
  return out;
}
function mdBlocks(text, inline, MAX, TARGET) {
  MAX = MAX || 90; TARGET = TARGET || 65;
  const src = String(text || '').trim();
  if (!src) return '';
  const out = [];
  let list = null;      // { ord: bool, items: [] }
  const flushList = () => {
    if (!list) return;
    const tag = list.ord ? 'ol' : 'ul';
    out.push(`<${tag} class="md-list">${list.items.map((it) => `<li>${inline(it)}</li>`).join('')}</${tag}>`);
    list = null;
  };
  // Split on blank lines first, then walk each block line by line so a list authored with single
  // newlines and a list authored with blank lines between items both come out as one <ul>.
  for (const block of src.split(/\n\n+/)) {
    const lines = block.split('\n');
    let para = [];
    const flushPara = () => {
      const t = para.join(' ').trim(); para = [];
      if (!t) return;
      flushList();
      mdChunk(t, MAX, TARGET).forEach((c) => out.push(`<p>${inline(c)}</p>`));
    };
    for (const raw of lines) {
      const m = raw.match(/^\s*(?:([-*•])|(\d+)[.)])\s+(.*)$/);
      if (m) {
        flushPara();
        const ord = !!m[2];
        if (!list || list.ord !== ord) { flushList(); list = { ord, items: [] }; }
        list.items.push(m[3]);
      } else if (list && /^\s+\S/.test(raw) && raw.trim()) {
        list.items[list.items.length - 1] += ' ' + raw.trim();   // indented continuation of an item
      } else if (raw.trim()) {
        if (list) flushList();
        para.push(raw.trim());
      }
    }
    flushPara();
  }
  flushList();
  return out.join('');
}


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
// The per-problem plan: context / working / reassess / timeline / troubleshooting. `reassess` names
// a doctor, clinician, A&E or polyclinic on all 41 problems and is the best-written safety text on
// the site -- and until 2026-07-28 NONE of it reached the prerendered document. See the protocol
// emit below.
const PLAN = readJSON(path.join(ROOT, 'data', 'protocol_plan.json')) || {};
// compound_learn, indexed by the compound NAME as it appears in D.compounds. The file is keyed by
// slug and each entry also carries a `name`, so index on both and prefer the explicit name.
const LEARN_RAW = readJSON(path.join(ROOT, 'data', 'compound_learn.json')) || {};
const LEARN_BY_NAME = {};
Object.keys(LEARN_RAW).forEach((k) => {
  const e = LEARN_RAW[k];
  if (!e || typeof e !== 'object') return;
  if (e.name) LEARN_BY_NAME[e.name] = e;
  LEARN_BY_NAME['__slug__' + k] = e;
});
const CAUSE = readJSON(path.join(ROOT, 'data', 'cause_learn.json')) || {};
const GRAPH = D.graph || { problems: [], domains: {} };

// ---- helpers ----
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// strip inline markdown (bold/italic/links/code) to clean text before esc, so raw ** never renders
const mds = (s) => String(s == null ? '' : s).replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, '$1$2').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`([^`]+)`/g, '$1');
// Meta descriptions: strip markdown and truncate at a word boundary (no mid-word "…Nia" cuts).
const cleanDesc = (s, max = 155) => {
  let t = String(s || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  t = t.slice(0, max); const sp = t.lastIndexOf(' ');
  return (sp > max * 0.6 ? t.slice(0, sp) : t).replace(/[\s,;:.\-—–]+$/, '') + '…';
};
// Inline markdown -> HTML, ESCAPE FIRST then format. That order matters: site/app.js's mdInline
// does the reverse (it extracts links before escaping and interpolates the URL raw), which makes
// it an attribute-injection sink. This one cannot be, because by the time any formatting runs
// there are no live angle brackets or quotes left. Bold and italic only -- no links, no raw HTML.
const mdSafe = (s) => esc(String(s == null ? '' : s))
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*(?!\*)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const tkey = (s) => s.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
const stars = (n) => '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));
// Singapore availability from approval status (see app.js sgAvailability) + shared-pathway synergy.
const sgAvail = (c) => {
  switch (regClass(c)) {
    case 'controlled': return { tag: 'Controlled substance', body: 'A controlled substance in most countries, including Singapore (HSA / CNB). Illegal to buy, sell or possess without authorisation almost everywhere, though the exact schedule differs by country. Listed here for completeness only.' };
    case 'prescription': return { tag: 'Prescription only', body: 'A prescription-only medicine in most countries: dispensed by a licensed pharmacy against a doctor\'s prescription, not sold over the counter. Buying it from an online marketplace or an overseas seller is unsafe, and in many countries unlawful. Classification varies — check the rules where you live, and speak to a doctor.' };
    case 'pharmacy': return { tag: 'Pharmacy medicine', body: 'A pharmacy-only medicine — sold from behind the counter after a pharmacist\'s advice, not off the open shelf.' };
    case 'unapproved': return { tag: 'Not approved', body: 'Not approved for human use in most markets, Singapore included. Grey-market supply only: dose, purity and legality are all uncertain wherever you are.' };
    case 'supplement':
    // Named retailers removed 2026-07-28: they read as a purchase recommendation, and in Singapore
    // "where to buy" copy is the kind of string that attracts the Medicines Act 1975 s.51
    // advertising regime. The useful part for a reader is the purity criterion, not the shop.
    case 'otc': return { tag: 'Available over the counter', body: 'Widely available over the counter. Look for a third-party-tested / GMP mark (USP, NSF or Informed Sport) and check the dose per serving.' };
    default: return { tag: 'Check locally', body: 'Availability and legal status vary by country — check your national regulator (in Singapore, the HSA) before buying.' };
  }
};
const derivedStacks = (c) => {
  const pw = new Set(c.pathwayIds || []); if (!pw.size) return [];
  return D.compounds.filter((o) => o.id !== c.id && !o.isNote && (o.pathwayIds || []).some((i) => pw.has(i))).sort((a, b) => b.stars - a.stars).slice(0, 4);
};
// The interaction checker's verdict on a pathway-sibling pair, precomputed by
// assertInteractionCoverage() in build/parse.js. Read, never recomputed: a third copy of the tag
// matcher is a third thing that can drift, and the number this site publishes is only true while
// every copy agrees.
const TIER_ICON = { danger: '☠️', blunt: '🔻', timing: '⏰' };
const pairFlag = (a, b) => { const P = D.pairFlags || {}; return P[a.id + '|' + b.id] || P[b.id + '|' + a.id] || null; };

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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1a2b"/><stop offset="1" stop-color="#0e1420"/></linearGradient><linearGradient id="a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#2f7de0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#b)"/><rect width="1200" height="8" fill="url(#a)"/><text x="72" y="112" font-family="Roboto" font-weight="700" font-size="40"><tspan fill="#38bdf8">RNA</tspan><tspan fill="#ffffff">wiki</tspan></text><text x="1128" y="112" text-anchor="end" font-family="Roboto" font-weight="700" font-size="23" fill="#64748b">${xe((kind || '').toUpperCase())}</text>${titleSvg}${starsSvg}${subSvg}<text x="72" y="580" font-family="Roboto" font-weight="700" font-size="28" fill="#38bdf8">rnawiki.com<tspan fill="#64748b" font-weight="400">  ·  free · evidence-ranked</tspan></text></svg>`;
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
// ---- regulatory classification (replaces the unreliable c.isRx flag) ----
// c.isRx misses statins, SSRIs, PDE-5 inhibitors, finasteride, tretinoin, minoxidil
// and Contrave (all badged 🟢 "FDA Approved"), and wrongly flags vitamin D3 and iron.
// 🟢 means "approved by a regulator", NOT "buy it off a shelf". Nothing keys on isRx again.
// STOPGAP: the RX_BY_NAME / OTC_OVERRIDE regexes are a bridge. The real fix is the
// `regulatory_class` field authored per compound in the source data (see revision 3, item 2);
// the day every compound carries it, delete both regexes and read c.regulatory_class directly.
const RX_BY_NAME = /\b(statin|atorvastatin|rosuvastatin|simvastatin|tretinoin|isotretinoin|retinoid|finasteride|dutasteride|minoxidil|ssri|sertraline|escitalopram|fluoxetine|pde-?5|sildenafil|tadalafil|bremelanotide|pt-?141|naltrexone|bupropion|ezetimibe|spironolactone|anastrozole|exemestane|letrozole|clomiphene|enclomiphene|metformin|acarbose|semaglutide|tirzepatide|liraglutide|rapamycin|sirolimus|levothyroxine|liothyronine|estradiol|hrt|erythropoietin|\bepo\b|hcg|chorionic|yohimbine|modafinil|armodafinil|methylphenidate|amphetamine|lisdexamfetamine|testosterone|trt|oxandrolone|nandrolone|trenbolone|clenbuterol|zolpidem|trazodone)\b/i;
const CONTROLLED_BY_NAME = /\b(methylphenidate|amphetamine|lisdexamfetamine|modafinil|armodafinil|testosterone|trt|oxandrolone|nandrolone|trenbolone|erythropoietin|\bepo\b|zolpidem)\b/i;
const OTC_OVERRIDE = /^(Vitamin D3|Iron$|Calcium|Magnesium|Zinc|Melatonin)/; // mis-flagged isRx in the data
function regClass(c) {
  if (c.regulatory_class) return c.regulatory_class;   // authored field wins once it exists
  const ap = c.approvals || [];
  if (ap.includes('⚫') || CONTROLLED_BY_NAME.test(c.name)) return 'controlled';
  if (OTC_OVERRIDE.test(c.name)) return 'supplement';
  if (ap.includes('🔵') || c.isRx || RX_BY_NAME.test(c.name)) return 'prescription';
  if (ap.includes('🔴')) return 'unapproved';
  if (ap.includes('🟡')) return 'supplement';
  if (ap.includes('🟢')) return 'otc';
  return 'unknown';
}
const isConsumerRenderable = (c) => ['supplement', 'otc'].includes(regClass(c));
// Explicit nutrient labels. The old /_\w+$/ regex ate the type suffix AND the discriminator
// ('_c' / '_d'), collapsing vitamin_c_mg and vitamin_d_iu both to "vitamin". A map fails
// visibly on an unknown key instead of silently mislabelling.
const NUTRIENT_LABEL = {
  protein_g: 'protein', kcal: 'energy', fiber_g: 'fibre', sugar_g: 'added sugar',
  omega3_mg: 'omega-3 (EPA+DHA)', vitamin_c_mg: 'vitamin C', vitamin_d_iu: 'vitamin D',
  calcium_mg: 'calcium', magnesium_mg: 'magnesium', zinc_mg: 'zinc', iron_mg: 'iron',
  potassium_mg: 'potassium', sodium_mg: 'sodium', glycine_g: 'glycine', choline_mg: 'choline',
};
const nutrientLabel = (k) => NUTRIENT_LABEL[k] || k.replace(/_(mg|g|iu|kcal|mcg|ug)$/i, '').replace(/_/g, ' ');
function protoStack(rc) {
  const picked = [], ids = new Set();
  (rc.compounds || []).forEach((n) => {
    const c = findCpt(n);
    if (!c || ids.has(c.id)) return;
    if (!isConsumerRenderable(c)) return;   // Rx / controlled / unapproved never render in a Stack
    ids.add(c.id); picked.push(c);
  });
  return picked;                             // no pool padding, no slice-to-six
}
// Prescription items authored into rc.compounds are still real editorial content. Surface them
// in a separate, non-recommending block that names the gate rather than the product.
function protoMedical(rc) {
  return (rc.compounds || []).map(findCpt).filter(Boolean)
    .filter((c) => !isConsumerRenderable(c))
    .filter((c, i, a) => a.findIndex((x) => x.id === c.id) === i);
}
function protoFuel(rc) {
  if (!FO) return [];
  const want = new Set(rc.fuel_tags || []);
  return FO.foods.map((f) => ({ f, h: (f.tags || []).filter((t) => want.has(t)).length })).filter((x) => x.h > 0)
    // Ranked by how many of THIS cause's nutrient targets the food actually hits — not by whether
    // it is on the Singapore list. The old comparator put sg_local first, so every reader anywhere
    // got Singapore hawker food ahead of the food that best fits their target. Singapore items are
    // still labelled, and still win ties, but they no longer outrank a better nutritional match.
    .sort((a, b) => (b.h - a.h) || (b.f.sg_local - a.f.sg_local) || a.f.name.localeCompare(b.f.name))
    .slice(0, 6).map((x) => x.f);
}
// Curated rows only. The tag join (protocol -> muscle group -> first 3 exercises under that
// tag) produced lists that contradicted the page's own prescription text on 48 of the 49
// protocols that rendered one — including internal rotation on a page prescribing external
// rotation. Until protocol_exercise is populated, the prescription prose IS the exercise list.
function protoMove(rc) {
  if (!EX || !Array.isArray(rc.protocol_exercise)) return [];
  return rc.protocol_exercise
    .map((r) => { const e = EX.exercises.find((x) => x.id === r.exercise_id); return e ? { ...e, ...r } : null; })
    .filter(Boolean);
}

// ---- page shell ----
// ---- HEADING ANCHORS + CONTENTS CARD (2026-07-28) --------------------------------------------
// Measured: 19-29 good headings per page and **0 of ~6,000 carried an id**, so there was no table
// of contents, no deep link, no scroll-spy and no "you are here" anywhere on the site. A reader
// four screens into a 33-screen document could not tell whether they were a quarter or three
// quarters through.
//
// Done as ONE post-process pass over the assembled body rather than at the ~80 <h2> template sites
// in this file. Editing 80 sites is 80 chances to drift, and `mdBlocks()` has no heading path at
// all, so the "add it where headings are emitted" instinct would have missed most of them.
// Deliberately conservative: only <h2>/<h3> with NO existing attributes are touched, inner tags are
// stripped before slugging, and a de-dup counter runs even though the corpus currently has 0
// collisions — the corpus grows.
function anchorHeadings(html) {
  const seen = new Map();
  const heads = [];
  const out = String(html || '').replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (m, lvl, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    if (!text) return m;
    let slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
    if (!slug) return m;
    const n = (seen.get(slug) || 0) + 1;
    seen.set(slug, n);
    if (n > 1) slug = `${slug}-${n}`;
    heads.push({ level: +lvl, text, slug });
    return `<h${lvl} id="${slug}"><a class="hanchor" href="#${slug}" aria-label="Link to this section">#</a>${inner}</h${lvl}>`;
  });
  return { html: out, heads };
}

// The contents card. On mobile `.cpd-toc` is `overflow-x:auto; flex-wrap:nowrap`, which turns 18
// pills into a one-row scroller showing about three — weak orientation, and the reader has to
// discover it. So: a plain contents CARD on mobile (answers "what is in here and how long", which
// is the actual complaint) and the sticky pill row from 900px up.
// NOTE the top offset. `.topbar` is `position:sticky; top:0; z-index:50`, so anything inside <main>
// that sticks at top:0 slides underneath it and is unreadable. 58px is this codebase's existing
// house value for that offset (`.scrolly-track{top:58px}`).
function tocHtml(heads, minutes) {
  const h2 = heads.filter((h) => h.level === 2);
  if (h2.length < 4) return '';
  return `<nav class="cpd-toc pagetoc" aria-label="Contents">
    <span class="toc-lbl">On this page${minutes ? ` · ${minutes} min read` : ''}</span>
    ${h2.map((h) => `<a href="#${h.slug}">${esc(h.text)}</a>`).join('')}
  </nav>`;
}

// ---- GLOSSARY IN THE PRERENDERED DOCUMENT (2026-07-30) ---------------------------------------
// The site already has a working glossary — but only in the SPA. `glossarize()` runs from five
// call sites in app.js and produces 18 spans on /pathway/6. `prerender.js` has NEVER emitted one:
// git shows the glossary shipped 2026-07-04, this file was created 2026-07-05, and
// `git log -S gloss` on it returns nothing, ever. So the ~90% of readers who do not run JS have
// never had a definition available, on any page, while the footer promised them one.
//
// Two glossaries had also grown independently (40 + 83 terms, 19 defined twice with conflicting
// wordings). Merged and extended to 214 terms; coverage of hard-term hits on /pathway/6 was 7%.
//
// The operative variable turned out not to be jargon DENSITY — /muscle/biceps, the page the owner
// calls perfect, is the 10th densest of 45 courses. It is UNGLOSSED REFERENT-FREE terms: biceps
// leaves 8 hard terms unglossed and most are body-locatable (elbow, grip, tendon); the pathway
// page leaves 16 and none are. You cannot fix that by shortening — only by attaching a meaning at
// the point of use.
const { glossify: _glossify, compile: _compileGloss } = require('./glossify.js');
const GLOSSARY = readJSON(path.join(ROOT, 'data', 'glossary.json')) || {};
const GLOSS_COMPILED = _compileGloss(GLOSSARY);
let _glossLinks = 0;

function shell({ route, title, desc, jsonld, body, breadcrumbs, ogImage, ogType, robots, canonical }) {
  // Anchor every heading and build the contents card from what we actually emitted, so the TOC can
  // never list a section that is not there (or miss one that is).
  // Gloss BEFORE anchoring so heading ids are computed from clean text, and never inside a heading.
  // Suppress any term that is the page's own subject — defining "receptor" on the receptor page is
  // noise. rank-1 terms only, at most 2 per section, no page cap (a fixed cap starved the end of
  // every long page: deciles 8-10 of /pathway/6 got zero).
  if (route !== '/' && GLOSS_COMPILED) {
    const _h1 = (String(body).match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ''])[1].replace(/<[^>]+>/g, '').toLowerCase();
    const _sup = Object.keys(GLOSSARY).filter((k) => _h1.includes(k));
    try {
      const _g = _glossify(body, { glossary: GLOSSARY, compiled: GLOSS_COMPILED, suppress: _sup, maxRank: 1, perSection: 2, perPage: Infinity });
      body = _g.html; _glossLinks += _g.links;
    } catch (e) { /* a glossing failure must never cost the page */ }
  }
  const _an = anchorHeadings(body);
  const _words = String(_an.html).replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const _mins = Math.max(1, Math.round(_words / 230));
  // NOT on the home page. The contents card is right for a 33-screen course; on a landing page
  // whose whole job is two CTAs it lands between the headline and the lead, stays pinned for the
  // entire scroll at >=900px, and offers 12 competing destinations on top of the primary ask.
  // Also excluded from the index pages, which are already lists of links.
  const _noToc = route === '/' || ['/solve', '/browse', '/az', '/pathways', '/legend', '/learn'].includes(route);
  const _toc = (!_noToc && _words > 700) ? tocHtml(_an.heads, _mins) : '';
  // Insert after the first </h1> so the reader gets title -> what's in here -> content.
  body = _toc ? _an.html.replace(/<\/h1>/, `</h1>${_toc}`) : _an.html;
  const img = ogImage || (SITE_URL + '/og.png');
  const url = SITE_URL + (canonical || route);   // canonical overrides self-reference (see /body)
  const ld = [].concat(jsonld || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('');
  const crumbLd = breadcrumbs ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: SITE_URL + b.route })),
  })}</script>` : '';
  return `<!DOCTYPE html>
<!-- lang was "en-SG" on all 577 pages while og:locale said "en_US" on 576 of them — the two
     tags contradicted each other sitewide, and both narrowed a site that is written for
     readers anywhere. Plain "en" is the honest signal: one language, no country claim. -->
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
<meta property="og:locale" content="en">
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
<noscript><style>.reveal,.reveal *{opacity:1!important;transform:none!important}</style></noscript>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧬</text></svg>">
${crumbLd}${ld}
</head>
<body>
<a class="skip-link" href="#app">Skip to content</a>
<div id="route-status" role="status" aria-live="polite" class="sr-only"></div>
<header class="topbar">
  <a href="/" class="brand">🧬 RNA<span>wiki</span></a>
  ${/* W4.5 (2026-08-02): the count is READ FROM THE CORPUS. It was typed as "170" and the corpus
        has held 171 since before W0 — measured hydrated at 390x844 on /, /c/creatine-monohydrate
        and /az: this header printed "Search 170 compounds…" on 3 of 3 while the /az toolbar on the
        SAME PAGE printed "Filter 171 compounds by name…", because that one interpolates
        D.compounds.length. A number a reader can check on the next line down, and it was wrong.
        assertCorpusCountCopy() below fails the build on any served document that disagrees. */ ''}
  <div class="search-wrap"><input id="search" type="search" placeholder="Search ${D.compounds.length} compounds, protocols, terms…" autocomplete="off" spellcheck="false"><div id="search-results" class="search-results" hidden></div></div>
  ${/* W5c (2026-08-02): A-Z AND BROWSE WERE IN THE FOOTER ONLY. Measured hydrated at 390x844 on
        /az: opening the ☰ drawer gave exactly four links — /solve, /where, /plan, /learn — and
        neither of the site's two INDEX pages was among them. On desktop that costs nothing: the
        footer is two screens away. On a phone it is the whole cost, because /problem pages have
        a median height of 29,844px, so "every compound, A-Z" was 35 phone screens below the
        reader on the pages most likely to make them want it. They are drawer-only (.nav-more is
        display:none until .topnav.open) so the desktop bar keeps its four-item shape. */ ''}
  <nav class="topnav">
    <a href="/solve" class="nav-solve">Solve</a><a href="/where">Where it hurts</a><a href="/plan">My Plan</a><a href="/learn">Learn</a><a href="/az" class="nav-more">A&ndash;Z</a><a href="/browse" class="nav-more">Browse</a>
  </nav>
  <span id="account-slot" class="account-slot"></span>
  <button id="menu-btn" class="menu-btn" aria-label="Menu">☰</button>
</header>
<main id="app">${body}</main>
<footer class="foot"><div>💡 Not medical advice · <a href="/solve">Solve</a> · <a href="/where">Where it hurts</a> · <a href="/#newsletter">Newsletter</a> · <a href="/plan">My Plan</a> · <a href="/stack">Stack</a> · <a href="/browse">Browse</a> · <a href="/anatomy">Anatomy</a> · <a href="/pathways">Pathways</a> · <a href="/az">A–Z</a> · <a href="/legend">Legend</a> · <a href="/about">About</a></div><div class="foot-stats" id="foot-stats"></div></footer>
<script src="/data.js"></script>
<script src="/facts.js"></script>
<script src="/interactions.js"></script>
${/* W5b: the generated route -> [title, description] map. Must load BEFORE app.js, because
      setPageMeta() runs inside the first route() call. It is written by this same script from
      the bytes of these very pages — see "ONE HEAD, TWO DOCUMENTS" below. */ ''}
<script src="/head.js"></script>
<script src="/app.js"></script>
</body>
</html>`;
}

// Build-time pick of a representative daily fact for the prerendered homepage (crawlers + first paint).
// Returns the fact OBJECT, not markup: the card is built once, in homeBody, so the kicker copy and the
// card structure have exactly one definition. app.js then patches .df-text / .df-link IN PLACE on
// hydration (refreshDailyFact) because this stamp is frozen at deploy time and a container can run
// for days -- the fact is date-derived, so a build-stamped one goes stale. Patching two text nodes is
// not a second renderer; re-emitting the card would be.
function dailyFactObj() {
  try {
    const src = fs.readFileSync(path.join(SITE, 'facts.js'), 'utf8');
    const m = src.match(/window\.RNAWIKI_FACTS\s*=\s*(\[[\s\S]*\]);/);
    if (!m) return null;
    const facts = eval(m[1]);
    if (!facts || !facts.length) return null;
    return facts[Math.floor(Date.now() / 864e5) % facts.length];
  } catch (e) { return null; }
}

const crumbHtml = (items) => `<div class="crumbs">${items.map((it, i) => it.route ? `<a href="${it.route}">${esc(it.name)}</a>` : `<span>${esc(it.name)}</span>`).join('<span class="sep">›</span>')}</div>`;

// ---- W4 · LOOP B (2026-08-02): THE STACK-AUDIT HOOK ------------------------------------------
// One person's own offer, on all 52 protocol pages, in BOTH documents. site/app.js emits the
// identical markup — if only one of them carried it, a crawler and a reader would see different
// pages, which is the D2/D33 defect class this branch has already fixed four times.
//
// It is placed OUTSIDE the collapsed Phase 2 <details>, immediately after it. Inside, it would be
// invisible until the reader opened the drawer, which is exactly the audience least likely to need
// it: this is aimed at somebody who ALREADY takes a stack.
//
// THREE THINGS THE COPY MUST DO, and the single-voice and no-credential gates already fail the
// build on the opposite:
//   · one person speaking ("I"), never an organisation and never a service;
//   · no credential, stated or implied — the scope line says plainly that this is not a clinician
//     and not medical advice;
//   · no brand, no product, nothing to buy (constraint 1).
// The handle is read from data/site_config.json; with none configured the block does not render at
// all rather than printing a link to nowhere.
function stackAuditCallout() {
  const h = (SITE_X.x || {}).handle, url = (SITE_X.x || {}).profile;
  if (!h || !url) return '';
  return `<aside class="stack-audit">
    <h3>Taking a complex supplement stack right now?</h3>
    <p>I go through stacks by hand and look for the same three things: two compounds doing the same job, fillers you are paying for, and doses too low to do anything. Post yours in a reply to me on X and I will break it down, free.</p>
    <p><a class="sa-x" href="${esc(url)}" rel="noopener">𝕏 @${esc(h)} on X →</a></p>
    <p class="sa-scope">I am not a clinician and this is not medical advice. It is one person reading labels against the evidence already on this site — and if something on your list needs a prescription, that conversation belongs with a doctor or pharmacist, not with me.</p>
  </aside>`;
}

// ---- SEO entities & structured-data helpers ----
const BUILD_DATE = new Date().toISOString().slice(0, 10); // real freshness signal for dateModified/lastReviewed
// The publisher entity (E-E-A-T). Referenced by @id from every clinical page; defined in full on home.
// W4 (2026-08-02): sameAs is read from data/site_config.json via data.site, not typed here. This
// object is emitted into every prerendered page, so a hard-coded handle here was the widest-reach
// copy of the string on the site. assertHandleFromConfig() in build/parse.js fails the build if it
// comes back.
const SITE_X = (D.site || { x: {}, links: {} });
const ORG = { '@context': 'https://schema.org', '@type': 'Organization', '@id': SITE_URL + '/#org', name: SITE_NAME, url: SITE_URL + '/', logo: SITE_URL + '/og.png',
  sameAs: [SITE_X.x.profile, (SITE_X.links || {}).substack, (SITE_X.links || {}).github].filter(Boolean) };
const WEBSITE = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE_URL + '/#website', url: SITE_URL + '/', name: SITE_NAME, inLanguage: 'en', publisher: { '@id': SITE_URL + '/#org' },
  // Sitelinks search box. index.html declared this for months while /az ignored ?q= entirely, so it
  // promised Google a search that dropped the query. app.js now reads the parameter (see azQuery),
  // which is the only reason this belongs here. Google crawls '/' -> home.html, so declaring it
  // only in the index.html shell put it on a document the canonical home never serves.
  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: SITE_URL + '/az?q={search_term_string}' }, 'query-input': 'required name=search_term_string' } };
const PUB = { publisher: { '@id': SITE_URL + '/#org' }, isPartOf: { '@id': SITE_URL + '/#website' }, dateModified: BUILD_DATE };
// ---- SEO length budgets (2026-07-31) ---------------------------------------------------------
// Measured across the built site: 100% of /protocol titles ran to ~101 chars and 100% of their
// descriptions to ~178, against Google's ~60 / ~155 display budgets. So on the flagship page type
// every single search result showed a cut-off title AND a cut-off description — the two pieces of
// text whose entire job is to earn the click. These trim at a word boundary so nothing ends
// mid-word, and they leave the " · RNAwiki" suffix intact because that is the brand signal.
const SUFFIX = ' \u00b7 RNAwiki';
function seoTitle(main, max = 60) {
  main = String(main || '').replace(/\s+/g, ' ').trim();
  // Budget against the ESCAPED length. "&" becomes "&amp;" in the emitted document, so a title that
  // measures 58 raw can ship at 62 — which is how 30 compound titles stayed over budget after the
  // first pass at this. Trim word-by-word until what we actually emit fits.
  const fits = (t) => esc(t + SUFFIX).length <= max;
  if (fits(main)) return main + SUFFIX;
  let words = main.split(' ');
  while (words.length > 1 && !fits(words.join(' '))) words.pop();
  let out = tidyTail(words.join(' '));
  // A single word can still be too long (a very long compound name); hard-cut it as a last resort.
  while (out.length > 1 && !fits(out)) out = out.slice(0, -1);
  return tidyTail(out) + SUFFIX;
}
// W5b (2026-08-02): TRIMMING AT A WORD BOUNDARY IS NOT THE SAME AS ENDING ON A WORD.
// Measured on the built site, 620 served routes, prerendered document: 49 titles ended on a
// connector that promised something the title never delivered \u2014 34 on "&"
// ("2,4-Dinitrophenol (DNP): dosage, evidence & \u00b7 RNAwiki"), 3 on "\u00b7"
// ("Elderberry \u00b7 Andrographis \u00b7 Lactoferrin \u00b7 \u00b7 RNAwiki"), 9 on an opening bracket with no
// partner, 3 on "/" or "+". The old tail-strip listed only [\s,;:\u2014-], so every one of those
// characters survived. These are the exact strings that ship as the <title>, the og:title, the
// tab, the bookmark and \u2014 from W5b onwards \u2014 the hydrated document too, so a dangling connector
// is now a defect in both documents at once.
// An unmatched "(" is dropped WITH the fragment it opened: "Cagrilintide (\u00b1 CagriSema" reads as a
// truncation error, and "Cagrilintide" is simply true.
function tidyTail(t) {
  let out = String(t).replace(/[\s,;:&+/|\u00b7\u2013\u2014-]+$/, '');
  const depth = (s) => { let d = 0; for (const ch of s) { if (ch === '(') d++; else if (ch === ')') d = Math.max(0, d - 1); } return d; };
  while (depth(out) > 0 && out.indexOf('(') >= 0) {
    out = out.slice(0, out.lastIndexOf('(')).replace(/[\s,;:&+/|\u00b7\u2013\u2014-]+$/, '');
  }
  return out;
}
function seoDesc(text, max = 155) {
  const s2 = stripMd(text).replace(/\s+/g, ' ').trim();
  const fits = (t) => esc(t).length <= max;              // escaped length, same reason as seoTitle
  if (fits(s2)) return s2;
  let words = s2.split(' ');
  while (words.length > 1 && !fits(words.join(' ') + '\u2026')) words.pop();
  return words.join(' ').replace(/[\s,;:]+$/, '') + '\u2026';
}
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
// opts.noSitemap: emit the page (so it is served, linked and link-graph-checked) but keep it
// out of sitemap.xml. For utility views that must not be a dead end for a reader without
// JavaScript, but are not search destinations and would read as near-duplicates if indexed.
function add(route, html, opts) { pages.push({ route, html, noSitemap: !!(opts && opts.noSitemap) }); }

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
    // Never generate a "which works better" superiority comparison that involves a prescription,
    // controlled or unapproved medicine. Advertising a POM to the public (and ranking it against a
    // supplement) is exactly what Singapore reg 7 prohibits. Only supplement/OTC pairs are generated.
    if (!isConsumerRenderable(a) || !isConsumerRenderable(b)) continue;
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

// Daily-fact reverse map — surface each fact on the compound page it references (SEO hook + enrichment).
let factByHref = {};
try {
  const fsrc = fs.readFileSync(path.join(SITE, 'facts.js'), 'utf8');
  const fm = fsrc.match(/window\.RNAWIKI_FACTS\s*=\s*(\[[\s\S]*\]);/);
  if (fm) eval('factByHref = (' + fm[1] + ').reduce(function(o,f){o[f.href]=f;return o;},{})');
} catch (e) { factByHref = {}; }

// ---- BIOHACKER / NUTRITIONIST LAYER, PRERENDERED (2026-07-28) --------------------------------
// All 170 compounds carry `c.bio` — form, biomarkers, cofactors, food-first, cost, dosing, timing,
// cycling, contraindications, quality, non-responders, synergy — and this renderer emitted none of
// it. ~430 words per compound reaching only the ~10% of traffic that runs JavaScript.
//
// ★ THE RESTRICTED PATH IS REGULATORY, NOT COSMETIC. ★
// 83 of 170 compounds are `access: prescription` or `unapproved`. For those the SPA deliberately
// shows a DIFFERENT set of cards — no dosing, no cycling, no timing, no cost-per-dose, no
// food-first, no "buy this form" — because publishing a self-administration protocol for a
// prescription-only medicine is exactly what Medicines Act 1975 s.51 prohibits, and there is no
// educational exemption. A second renderer that quietly forgot that check would put a DIY dose for
// semaglutide on a public page. So the access check is the FIRST thing here, and a build-time
// assertion below proves no restricted compound ever emits a self-dosing card.
function bioFlatHtml(c) {
  const b = c.bio;
  if (!b) return '';
  const card = (ico, title, inner) => inner ? `<div class="biof-card"><h3>${ico} ${esc(title)}</h3>${inner}</div>` : '';
  const line = (label, v) => v ? `<p><b>${esc(label)}:</b> ${mdSafe(v)}</p>` : '';
  const marks = (heading) => (Array.isArray(b.biomarkers) && b.biomarkers.length)
    ? card('🩸', heading, `<table class="biof-tbl"><thead><tr><th>Marker</th><th>What it tells you</th><th>Target / note</th></tr></thead><tbody>${
      b.biomarkers.map((m) => `<tr><td><b>${mdSafe(m.marker)}</b>${m.when ? `<br><small>${mdSafe(m.when)}</small>` : ''}</td><td>${mdSafe(m.why)}</td><td>${mdSafe(m.range || '')}</td></tr>`).join('')}</tbody></table>`)
    : '';
  const contra = (heading) => (Array.isArray(b.contra) && b.contra.length)
    ? card('⛔', heading, `<ul>${b.contra.map((x) => `<li><b>${mdSafe(x.flag)}:</b> ${mdSafe(x.advice)}</li>`).join('')}</ul>`) : '';

  // ---- restricted ----
  if (b.access === 'prescription' || b.access === 'unapproved') {
    const rx = b.access === 'prescription';
    const cards = [
      rx && b.typicalDose ? card('⚖️', 'Typical dose — set by a doctor', `${mdSafe(b.typicalDose.line)}<p class="biof-note">The usual prescribed range, shown for reference only — <b>not a dose to take on your own</b>. Only a qualified doctor can decide if and how much you should take.</p>`) : '',
      b.overdose ? card('☠️', 'Overdose — signs and dangers', mdSafe(b.overdose.line)) : '',
      b.misuse ? card('⚠️', rx ? 'Dangers of not taking it as prescribed' : 'Why there is no safe DIY dose', mdSafe(b.misuse.line)) : '',
      marks(rx ? 'What a doctor monitors' : 'What harm shows up in labs'),
      contra('Who must not take it'),
    ].filter(Boolean);
    if (!cards.length && !b.accessNote) return '';
    return `<section class="biof"><h2>🛡️ Using it safely — what to know</h2>
      <p class="biof-sub">This is a ${rx ? 'prescription-only medicine' : 'compound not approved for human use'}. The notes below are educational, not medical advice — always follow a qualified professional.</p>
      ${b.accessNote ? `<p class="biof-access">${mdSafe(b.accessNote)}</p>` : ''}
      <div class="biof-cards">${cards.join('')}</div></section>`;
  }

  // ---- open (supplement / OTC) ----
  const cards = [
    b.form ? card('💊', 'Form & bioavailability', line('Buy', b.form.buy) + line('Skip', b.form.avoid) + line('With food', b.form.withFood) + line('Absorption', b.form.bioavailability)) : '',
    marks('Biomarkers to track'),
    b.cofactors ? card('🔗', 'Cofactors & interactions', ['needs', 'depletes', 'antagonists'].map((k) => Array.isArray(b.cofactors[k]) && b.cofactors[k].length
      ? `<p><b>${k === 'needs' ? 'Needs alongside it' : k === 'depletes' ? 'It depletes' : 'Works against it'}:</b></p><ul>${b.cofactors[k].map((x) => `<li><b>${mdSafe(x.nutrient || x.name || '')}</b> — ${mdSafe(x.role || x.why || '')}</li>`).join('')}</ul>` : '').join('')) : '',
    b.foodFirst ? card('🥗', 'Food first', mdSafe(b.foodFirst.line) + (b.foodFirst.note ? `<p class="biof-note">${mdSafe(b.foodFirst.note)}</p>` : '')) : '',
    b.dosing ? card('⚖️', 'Dose', (b.dosing.flat ? `<p>${mdSafe(b.dosing.flat)}</p>` : '') + (b.dosing.perKg ? `<p><b>${mdSafe(String(b.dosing.perKg))} ${mdSafe(b.dosing.unit || '')}</b> per kg of bodyweight${b.dosing.capValue ? `, capped at ${mdSafe(String(b.dosing.capValue))} ${mdSafe(b.dosing.capUnit || b.dosing.unit || '')}` : ''}.</p>` : '') + (b.dosing.note ? `<p class="biof-note">${mdSafe(b.dosing.note)}</p>` : '')) : '',
    b.timing ? card('⏰', 'Timing', mdSafe(b.timing.line)) : '',
    b.cycling ? card('🔄', 'Cycling', mdSafe(b.cycling.line)) : '',
    contra('Personalised cautions'),
    b.quality ? card('🔬', 'Quality — what to look for', mdSafe(b.quality.line)) : '',
    b.nonResponders ? card('🤷', 'If it does nothing for you', mdSafe(b.nonResponders.line)) : '',
    Array.isArray(b.synergy) && b.synergy.length ? card('🤝', 'Pairs well with', `<ul>${b.synergy.map((x) => `<li><b>${mdSafe(x.with)}</b> — ${mdSafe(x.why)}</li>`).join('')}</ul>`) : '',
    b.cost ? card('\ud83d\udcb0', 'Cost per dose', mdSafe(b.cost.perDose || '') + (b.cost.note ? `<p class="biof-note">${mdSafe(b.cost.note)}</p>` : '') + `<p class="biof-note">Singapore retail, as an order-of-magnitude guide \u2014 about 0.75 of this in US dollars, and cheaper in bulk almost everywhere.</p>`) : '',
  ].filter(Boolean);
  if (!cards.length) return '';
  return `<section class="biof"><h2>🧪 Practical use — form, dose, timing and what to watch</h2>
    <div class="biof-cards">${cards.join('')}</div></section>`;
}

// ★ REGULATORY GATE — runs before a single compound page is written. ★
// bioFlatHtml() branches on b.access, and a future edit that reorders those branches, or adds a
// card above the check, would silently publish a self-administration protocol for a prescription
// medicine. Assert the property directly on the OUTPUT rather than trusting the code shape.
{
  const BANNED = [
    ['Form &amp; bioavailability', 'tells a reader which form to buy'],
    ['Food first', 'frames a prescription medicine as a nutrition choice'],
    ['Cycling', 'a self-administration schedule'],
    ['Timing', 'a self-administration schedule'],
    ['Cost per dose', 'prices it as a consumer purchase'],
    ['Pairs well with', 'recommends stacking it'],
    ['Practical use — form, dose, timing', 'the entire open-access heading'],
  ];
  const bad = [];
  D.compounds.forEach((c) => {
    const b = c.bio; if (!b) return;
    if (b.access !== 'prescription' && b.access !== 'unapproved') return;
    const html = bioFlatHtml(c);
    BANNED.forEach(([needle, why]) => { if (html.includes(needle)) bad.push(`${c.name}: emits "${needle}" — ${why}`); });
  });
  if (bad.length) {
    console.error('[prerender] REGULATORY — restricted compounds emitted self-administration content:');
    bad.slice(0, 12).forEach((x) => console.error('  ✗ ' + x));
    console.error('  Medicines Act 1975 s.51 has no educational exemption. Refusing to build.');
    process.exit(1);
  }
  const n = D.compounds.filter((c) => c.bio && (c.bio.access === 'prescription' || c.bio.access === 'unapproved')).length;
  console.log(`[prerender] bio layer: ${n} restricted compounds pass the no-self-dosing gate`);
}

// compounds
D.compounds.forEach((c) => {
  const route = '/c/' + slug(c.name);
  const cpdFact = factByHref['/c/' + slug(c.name)];
  const goalLinks = (c.goalIds || []).map((g) => `<a href="/goal/${g}">${esc(goalById[g].label)}</a>`).join(' · ');
  const usedIn = compoundProtocols[c.id] || [];
  const usedInHtml = usedIn.length ? `<h2>Used in these protocols</h2><ul>${usedIn.slice(0, 8).map((u) => `<li><a href="${u.route}">${esc(u.name)}</a></li>`).join('')}</ul>` : '';
  const cmpLinks = compoundCompareLinks[c.id] || [];
  // Cap raised 8 -> 12 (2026-07-30). At 8, a pair that ranked ninth on BOTH of its two compounds
  // had no inbound link anywhere on the site: /compare/magnesium-vs-vitamin-d3-k2 and
  // /compare/l-citrulline-citrulline-malate-vs-omega-3-epa-dha were published and unreachable by
  // browsing. The most-compared compound has 12 pairs, so 12 truncates nothing.
  const compareHtml = cmpLinks.length ? `<h2>Compare ${esc(c.name)}</h2><ul>${cmpLinks.slice(0, 12).map((x) => `<li><a href="${x.route}">${esc(c.name)} vs ${esc(x.other)}</a></li>`).join('')}</ul>` : '';
  // ---- INTERNAL LINKS TO /target/ (added 2026-07-28) ----------------------------------------
  // prerender.js emitted ZERO `/target/` hrefs anywhere, so 102 of the 103 target pages had no
  // inbound link from the site and were reachable only from sitemap.xml. Search Console confirms
  // the consequence: of 151 URLs in "Crawled - currently not indexed", exactly ONE is a /target/
  // page. They are not being judged thin and they are not canonical duplicates — Google has
  // largely never crawled them. A sitemap gets a URL known; internal links get it crawled.
  // Every compound already NAMES its molecular targets, so the link costs no new authoring.
  // Key trials WITH their verified PMIDs, in the crawlable document (added 2026-07-28). 136 refs
  // were resolved by the propose-only resolver and then checked one by one BY A HUMAN against the
  // finding each is attached to — that human pass is what makes them citations rather than
  // guesses, and it caught a wrong paper (GHK-Cu) plus 16 claims that needed correcting. A
  // citation only a JavaScript user can see is half a citation, so they render here too.
  const cle = LEARN_BY_NAME[c.name] || LEARN_BY_NAME['__slug__' + slug(c.name)];
  const trialsArr = (cle && cle.evi && Array.isArray(cle.evi.trials)) ? cle.evi.trials.filter((t) => t && t.finding) : [];
  const trialsHtml = trialsArr.length ? `<h2>The key trials behind this</h2><ul>${trialsArr.map((t) =>
      `<li>${mdSafe(t.finding)}${t.ref ? ` <span class="bt-ref">— ${esc(t.ref)}</span>` : ''}`
      + `${t.pmid ? ` <a class="bt-pmid" href="https://pubmed.ncbi.nlm.nih.gov/${esc(t.pmid)}/" rel="noopener">PMID ${esc(t.pmid)}</a>` : ''}</li>`).join('')}</ul>` : '';
  const tSet = new Set((D.targets || []).map((t) => tkey(t.sym)));
  const tLinks = (c.targets || [])
    .filter((t) => tSet.has(tkey(t.sym)))
    .filter((t, i, a) => a.findIndex((x) => tkey(x.sym) === tkey(t.sym)) === i);
  const targetLinksHtml = tLinks.length
    ? `<h2>Molecular targets ${esc(c.name)} acts on</h2><ul>${tLinks.map((t) => {
        const full = (D.targets || []).find((x) => tkey(x.sym) === tkey(t.sym));
        const n = full ? (full.compoundIds || []).length : 0;
        return `<li><a href="/target/${tkey(t.sym)}">${esc(t.sym)}</a>${full && full.name && full.name.toLowerCase() !== t.sym.toLowerCase() ? ` — ${esc(full.name)}` : ''}${n > 1 ? ` <span class="muted">(${n} compounds act here)</span>` : ''}</li>`;
      }).join('')}</ul>`
    : '';
  const pathLink = (c.pathwayIds || []).length && D.pathways[c.pathwayIds[0]] ? `<p><b>How it works:</b> <a href="/pathway/${c.pathwayIds[0]}">the ${esc(D.pathways[c.pathwayIds[0]].shortLabel)} pathway →</a></p>` : '';
  const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: c.category, route: '/' }, { name: c.name }])}
    <div class="detail"><h1>${esc(c.name)}</h1>
    <p><b>Evidence:</b> ${stars(c.stars)} ${c.stars ? `(${c.stars} of 5)` : '(not yet rated)'} · <b>Regulator status:</b> ${(c.badgeLabels || []).join(', ') || 'none recorded'} · <b>How you get it:</b> ${esc((c.supply || {}).tag || '')}</p>
    ${cpdFact ? `<div class="cpd-fact"><span class="cf-k">💡 Did you know?</span> <span class="cf-t">${cpdFact.t}</span></div>` : ''}
    ${c.plain ? `<h2>In plain English</h2><p>${esc(mds(c.plain))}</p>` : ''}
    ${c.mechanism ? `<h2>How it works</h2><p>${esc(mds(c.mechanism))}</p>` : ''}
    ${c.target ? `<h2>Molecular target &amp; official sources</h2><p>${mdLinks(c.target)}</p>` : ''}
    ${/* THE COMPOUND PAGE WAS 614 WORDS PRERENDERED AND 4,705 HYDRATED (2026-07-28).
          157 of 170 compounds carry a full learn layer — hook, bigIdea, analogy, mechSteps with
          687 prediction prompts, myths, canExplain, selfTest — on the compound object itself, and
          this renderer emitted none of it. The compound page is the most important page type on
          the site and ~87% of it was reaching only the ~10% of traffic that runs JavaScript.
          The shape of `c` already matches what learnFlatHtml expects, so this is a one-line join —
          which is the recurring shape of this project's defects: authored well, connected to
          nothing. */ ''}
    ${learnFlatHtml(c)}
    ${bioFlatHtml(c)}
    ${targetLinksHtml}
    ${trialsHtml}
    ${c.protocol ? `<h2>Protocol</h2><p>${mdSafe(c.protocol)}</p>` : ''}
    ${c.watch ? `<h2>Watch out</h2><p>${mdSafe(c.watch)}</p>` : ''}
    ${c.bottom ? `<h2>Bottom line</h2><p>${mdSafe(c.bottom)}</p>` : ''}
    ${goalLinks ? `<p><b>Helps with:</b> ${goalLinks}</p>` : ''}
    ${c.evidence ? `<h2>The human evidence</h2><p>${esc(String(c.evidence).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, ''))}</p>` : ''}
    ${(() => {
      // W3.5 (2026-08-02): "often paired with" was a pairing recommendation nobody wrote — a
      // machine inference from a shared pathway id, printed under the heading "Stacks with" in the
      // document ~90% of readers get. Measured over the shipped corpus with the site's own
      // stackInteractions(): 133 of 171 compound pages printed 523 of these and the checker flags
      // 80, of which 63 are DANGER tier (out/w35h_contra.json). Citrulline recommended PDE-5
      // inhibitors directly above its own "Avoid combining with … can drop blood pressure
      // dangerously"; six GLP-1 pages recommended each other under a duplicate-therapy rule; the
      // DNP page recommended four compounds under a rule titled "DNP — do not use".
      // The pairing claim is gone, the pathway fact stays, and any pair the checker flags now
      // carries that flag inline. Verdicts come from D.pairFlags, computed once in build/parse.js,
      // so this document and the SPA cannot disagree about the same two molecules.
      const sg = sgAvail(c); const d = derivedStacks(c); const strip = (t) => String(t || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '');
      const dList = d.map((o) => {
        const f = pairFlag(c, o);
        const link = `<a href="/c/${slug(o.name)}">${esc(o.name)}</a>`;
        return f ? `${link} — ${TIER_ICON[f.tier]} ${esc(f.title)}` : link;
      }).join(', ');
      return `${c.stacksWith ? `<h2>Stacks with</h2><p>${esc(strip(c.stacksWith))}</p>` : ''}${d.length ? `<h2>Acts on the same pathway</h2><p>Computed from shared pathways, not a suggestion to combine them: ${dList}.</p>` : ''}
        ${c.avoid ? `<h2>Avoid combining with</h2><p>${esc(strip(c.avoid))}</p>` : ''}
        <h2>Availability &amp; where to buy</h2><p><b>${esc(sg.tag)}.</b> ${sg.body.replace(/<\/?b>/g, '')}${c.cost ? ' ' + esc(strip(c.cost)) : ''}</p>`;
    })()}
    ${pathLink}
    ${usedInHtml}${compareHtml}</div>`;
  const cqa = faqBlock([
    // The star is a whole-compound summary, not an answer to "does it work for MY use", and it was
    // leading the FAQPage answer on all 170 /c/ pages -- i.e. it was the sentence answer engines
    // quoted. The authored bottom line is the honest answer; the star stays on the page, in the
    // badge row where its scope is visible, rather than inside a structured-data efficacy claim.
    (c.bottom || c.plain) ? { q: `Does ${c.name} actually work?`, a: `${snip(c.bottom || c.plain, 260)}` } : null,
    c.protocol ? { q: `How do you take ${c.name}?`, a: snip(c.protocol, 300) } : null,
    c.watch ? { q: `What are the risks or side effects of ${c.name}?`, a: snip(c.watch, 300) } : null,
    // W5a: answers BOTH axes. It used to answer only with the approval badges, which on 24 of 171
    // compounds contradicted the authored regulatory class — so a crawler was told "OTC Supplement"
    // for a compound the same build classes prescription-only.
    ((c.badgeLabels || []).length || (c.supply || {}).tag) ? { q: `Is ${c.name} legal or approved?`, a: `${(c.badgeLabels || []).length ? `Regulator status: ${(c.badgeLabels || []).join(', ')}. ` : ''}How you get it: ${(c.supply || {}).tag || 'check your regulator'}.${(c.supply || {}).why ? ` ${(c.supply || {}).why}` : ''}` } : null,
  ]);
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: c.name,
    about: { '@type': 'Drug', name: c.name }, description: cleanDesc(c.plain || c.bottom || '', 300),
    url: SITE_URL + route, inLanguage: 'en', publisher: PUB.publisher, isPartOf: PUB.isPartOf, dateModified: PUB.dateModified,
  }].concat(cqa.ld || []);
  add(route, shell({ route, title: seoTitle(`${c.name}: dosage, evidence & uses`), desc: seoDesc(c.plain || c.bottom || c.mechanism || c.metaSummary || c.name), jsonld, ogImage: renderOgCard(`og/c/${slug(c.name)}.png`, { kind: 'Compound · ' + (c.category || ''), title: c.name, sub: cleanDesc(c.plain || c.bottom || c.mechanism || c.metaSummary, 120), starN: c.stars, rx: c.isRx }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: c.name, route }], body: body + cqa.html }));
});

// ---- W5d (2026-08-02): D30 — A 123-PAGE CLUSTER WITH ZERO INTERNAL EDGES ---------------------
// Measured hydrated at 390x844 on all 123 published pairs (qa/out/w5cdi/before-390.json): every
// page contained exactly two anchors matching /compare/, and both were the breadcrumb. Links to
// another PAIR: 0 on 123 of 123. A reader who has just decided that neither of these two is right
// for them has nowhere to go except back to the index; a crawler sees 123 leaves hanging off one
// hub instead of a connected cluster.
// The edges are not invented — they are the pairs this generator already published, filtered to
// the ones sharing a compound with this page, which is exactly the "what else was this compared
// against" question the reader is holding. Capped at 4 per compound so the block stays a signpost
// rather than a second index, and ordered by the other compound's evidence strength then its name
// so the ordering is a stated rule and not the map's insertion order.
const compareSiblings = (() => {
  const byCompound = {};
  comparePairs.forEach(({ a, b }) => {
    const route = `/compare/${slug(a.name)}-vs-${slug(b.name)}`;
    (byCompound[a.id] = byCompound[a.id] || []).push({ other: b, route });
    (byCompound[b.id] = byCompound[b.id] || []).push({ other: a, route });
  });
  Object.values(byCompound).forEach((l) => l.sort((x, y) => (y.other.stars - x.other.stars) || x.other.name.localeCompare(y.other.name)));
  return (a, b, self) => {
    const seen = new Set([self]);
    const take = (c) => (byCompound[c.id] || []).filter((x) => !seen.has(x.route) && !seen.has(x.route + '#') && seen.add(x.route)).slice(0, 4);
    return { a: take(a), b: take(b) };
  };
})();
// The SAME data the prerendered block is built from, published for site/app.js — one generator,
// like the head map and the verdict map above. The two documents use different href forms
// (/compare/... vs #/compare/...), so what crosses is the data, not the markup.
const siblingByRoute = {};
const siblingBlock = (a, b, self, href) => {
  const g = compareSiblings(a, b, self);
  siblingByRoute[self] = [[a.name, g.a.map((x) => [x.other.name, x.route])], [b.name, g.b.map((x) => [x.other.name, x.route])]].filter((c) => c[1].length);
  const col = (c, list) => list.length
    ? `<div class="cmp-sib-col"><div class="cmp-sib-h">${esc(c.name)} also compared with</div><ul>${list.map((x) => `<li><a href="${href(x.route)}">${esc(x.other.name)}</a></li>`).join('')}</ul></div>`
    : '';
  if (!g.a.length && !g.b.length) return '';
  return `<div class="cmp-sib"><h2>Other head-to-heads with these two</h2>${col(a, g.a)}${col(b, g.b)}</div>`;
};

// comparison pages ([A] vs [B]) — high-intent long-tail, non-thin (two full profiles + honest verdict)
const verdictByRoute = {};
comparePairs.forEach(({ a, b, goalLabel, goalId }) => {
  const route = `/compare/${slug(a.name)}-vs-${slug(b.name)}`;
  const gl = goalLabel.toLowerCase();
  // VERDICT — REWRITTEN 2026-07-28. This used to declare a winner "for {goal}" from the difference
  // between two star ratings. That is a category error: the star is a single WHOLE-COMPOUND rating
  // covering everything the compound has been studied for, not a grade for this indication. So the
  // page was answering "which is better for fat loss?" with a number that is not about fat loss —
  // and it emitted that answer into FAQPage JSON-LD, which is the part answer engines quote back.
  // Until claims.json carries a per-(compound x indication) grade, the honest answer is that we do
  // not have one, and the page's real value is the side-by-side profile below it.
  /* verdict is built below, from the rows this pair actually has — see the W5d block. */
  // W5c (2026-08-02): D6. See the note in site/app.js renderComparison() — the second compound's
  // column had a median right edge of 597px against a 390px viewport on 123/123 pairs, inside an
  // overflow-x:auto wrapper that gives the reader no sign anything is off-screen. The table stacks
  // below 600px; `.cmp-who` is the per-cell label that tells a stacked value which compound it
  // belongs to, aria-hidden because the column header already carries that for AT. The explicit
  // roles are load-bearing: `display:block` on a table strips its implicit ARIA roles, and the
  // stacked layout clips <thead> instead of display:none so it stays in the accessibility tree.
  const who = (n) => `<span class="cmp-who" aria-hidden="true">${esc(n)}</span>`;
  // W5d (2026-08-02): D40 — A BARE EM-DASH IS NOT AN ANSWER, IT IS A SHRUG.
  // Measured hydrated at 390x844 on all 123 published pairs (qa/out/w5cdi/before-390.json): 11
  // routes rendered a tbody cell whose entire content was "—", always the BOTTOM LINE row, always
  // Iron or Vitamin C (Ascorbate) — the two consumer-renderable compounds of the 34 in the corpus
  // with an empty `bottom`. On a page that exists to put two things side by side, an em-dash in
  // one column reads as a statement about the compound ("nothing to say about this one") when it
  // is a statement about the corpus. `blank()` says which of the two it is; the row disappears
  // entirely when NEITHER side has the field, because a row of two shrugs is worse than no row.
  const blank = '<span class="cmp-none">Not written up yet</span>';
  const has = (v) => !!(v && String(v).replace(/<[^>]*>/g, '').replace(/[—\s]/g, ''));
  const cmp = (k, va, vb) => (!has(va) && !has(vb)) ? '' : `<tr role="row"><th role="rowheader" scope="row">${esc(k)}</th><td role="cell">${who(a.name)}${has(va) ? va : blank}</td><td role="cell">${who(b.name)}${has(vb) ? vb : blank}</td></tr>`;
  // ---- W5d (2026-08-02): D18 — THE VERDICT PROMISED FIVE THINGS AND THE PAGE HAD ONE ----------
  // Measured hydrated at 390x844 on all 123 published pairs (qa/out/w5cdi/before-390.json). The
  // verdict ended "What actually differs is mechanism, side-effect profile, interactions,
  // availability and cost." Searching the rest of the page, OUTSIDE the verdict paragraph:
  //     cost           4 of 123        interactions   0 of 123
  //     side-effects   0 of 123        dose/dosage   11 of 123
  // Four of the five named dimensions existed nowhere on the page. Meanwhile the first table row
  // showed unequal star counts on 78 of 123 (gap >= 2 on 18), so the TABLE ranked while the PROSE
  // refused to — and the hydrated meta description advertised an "honest verdict".
  //
  // THE REFUSAL TO RANK STAYS. It is correct and it is deliberate: the star is a whole-compound
  // rating across everything a compound has been studied for, not a grade for this indication, and
  // until claims.json carries a per-(compound x indication) grade there is no honest winner to
  // name. What was wrong was not the refusal — it was following the refusal with a list of five
  // things the reader could decide on instead, four of which were not there.
  //
  // SO THE PAGE NOW CARRIES THEM. Every one of these fields is authored, per compound, and was
  // already being rendered on the compound's own page; the comparison simply never asked for them:
  //     watch  -> "Side effects to watch"        60 of 171 compounds, at least one side on 66/123
  //     avoid  -> "Don't combine it with"        20 of 171,                                 90/123
  //     cost   -> "Roughly what it costs"        42 of 171,                                118/123
  //     supply -> "How you get it"              171 of 171,                                123/123
  // Nothing is invented: a row appears only where a compound's own record has the field, and the
  // D40 helper above prints a stated absence rather than a dash where only one side has it.
  //
  // AND THE VERDICT IS BUILT FROM THE ROWS THAT WERE ACTUALLY EMITTED, not from a list typed next
  // to them. That is the whole point — the same class of defect as "Covers all 170 compounds" and
  // "Search 170 compounds": a sentence that does not have to agree with the thing it describes.
  // assertCompareDimensions() below fails the build if they ever disagree again.
  //
  // D19 IS THE SAME SENTENCE. It said "Those are compared in full below" and "The star ratings
  // shown below", and the table bottom is ABOVE the verdict top on 123/123 measured hydrated. Both
  // now say "above", which is where the table is.
  const ROWS = [
    ['Human evidence', stars(a.stars), stars(b.stars)],
    ['Legal status', esc((a.approvalLabels || []).join(', ')), esc((b.approvalLabels || []).join(', '))],
    ['How you get it', esc(((a.supply || {}).tag) || sgAvail(a).tag), esc(((b.supply || {}).tag) || sgAvail(b).tag)],
    ['How it works', esc(snip(a.mechanism, 240)), esc(snip(b.mechanism, 240))],
    ['In plain English', esc(snip(a.plain, 240)), esc(snip(b.plain, 240))],
    ['Side effects to watch', esc(snip(a.watch, 220)), esc(snip(b.watch, 220))],
    ["Don't combine it with", esc(snip(a.avoid, 220)), esc(snip(b.avoid, 220))],
    ['Roughly what it costs', esc(snip(a.cost, 200)), esc(snip(b.cost, 200))],
    ['Bottom line', esc(snip(a.bottom, 200)), esc(snip(b.bottom, 200))],
  ];
  // The dimensions this page ACTUALLY carries, in the order the reader meets them. "Human
  // evidence" is deliberately not in the list: it is the one row the verdict refuses to decide on.
  const dims = ROWS.filter(([k, va, vb]) => k !== 'Human evidence' && (has(va) || has(vb))).map(([k]) => k.charAt(0).toLowerCase() + k.slice(1));   // lower only the first letter, or "In plain English" becomes "in plain english"
  const andList = (xs) => xs.length < 2 ? (xs[0] || '') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1];
  const verdict = `I do not publish an indication-specific evidence grade for ${a.name} or ${b.name} for ${gl}, so I am not going to name a winner. `
    + `The star ratings in the table above are whole-compound summaries across everything each has been studied for — they are not a grade for this use, and ranking them here would be misleading. `
    + `Decide on the rows instead. For this pair the table above compares them on ${andList(dims)} — read down it and stop at the first row where the difference matters to you. That is your answer, and it is one only you can give.`;
  const table = `<div class="cmp-wrap"><table class="cmp-table" role="table"><thead><tr role="row"><th role="columnheader"></th><th role="columnheader" scope="col"><a href="/c/${slug(a.name)}">${esc(a.name)}</a></th><th role="columnheader" scope="col"><a href="/c/${slug(b.name)}">${esc(b.name)}</a></th></tr></thead><tbody>
    ${ROWS.map(([k, va, vb]) => cmp(k, va, vb)).join('\n    ')}
  </tbody></table></div>`;
  const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: 'Compare', route: '/compare' }, { name: `${a.name} vs ${b.name}` }])}
    <div class="detail"><h1>${esc(a.name)} vs ${esc(b.name)}</h1>
    <p>Both are used for <a href="/goal/${goalId}">${esc(gl)}</a>. Side by side on ${esc(andList(dims))}. No winner is named — the section under the table says why.</p>
    ${table}
    <h2>Which is better for ${esc(gl)}?</h2><p>${esc(verdict)}</p>
    ${siblingBlock(a, b, route, (r) => r)}
    <p>Full breakdowns: <a href="/c/${slug(a.name)}">${esc(a.name)}</a> · <a href="/c/${slug(b.name)}">${esc(b.name)}</a>.</p>
    <div class="page-cta"><a class="cta-primary" href="/solve">🎯 Build your own Move · Fuel · Stack protocol →</a></div></div>`;
  const faq = faqBlock([
    { q: `Is ${a.name} or ${b.name} better for ${gl}?`, a: verdict },
    { q: `What's the difference between ${a.name} and ${b.name}?`, a: `${a.name}: ${snip(a.bottom || a.plain, 130)} — ${b.name}: ${snip(b.bottom || b.plain, 130)}` },
  ]);
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: `${a.name} vs ${b.name}`, description: `Compare ${a.name} and ${b.name} for ${gl}.`, url: SITE_URL + route, inLanguage: 'en', publisher: PUB.publisher, isPartOf: PUB.isPartOf, dateModified: PUB.dateModified }].concat(faq.ld || []);
  // W5b (2026-08-02): D33. The verdict is written HERE and read by site/app.js, for the same reason
  // the head is (see "ONE HEAD, TWO DOCUMENTS"). Two generators wrote this paragraph and it was
  // string-equal across the two documents on 0 of 123 pairs — the prerendered one names the goal
  // and says "comparing them here would be misleading"; the hydrated one said "for this use" and
  // dropped that clause. It is also the text of the FAQPage JSON-LD answer, which is the sentence
  // an answer engine quotes back, so the paragraph Google was quoting was not the paragraph on the
  // page. The goal label rides along because the <h2> and the FAQ question both name it, and the
  // two generators disagreed about it on 4 of 123.
  verdictByRoute[route] = [verdict, gl, goalId];
  add(route, shell({ route, title: seoTitle(`${a.name} vs ${b.name}: which works better?`), desc: seoDesc(`${a.name} vs ${b.name} for ${gl}: human evidence, mechanism, safety and availability compared.`), jsonld, breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Compare', route: '/compare' }, { name: `${a.name} vs ${b.name}`, route }], body: body + faq.html }));
});

// goals
D.goals.forEach((g) => {
  const route = '/goal/' + g.id;
  const list = D.compounds.filter((c) => c.goalIds.includes(g.id)).sort((a, b) => b.stars - a.stars).slice(0, 30);
  const protos = GRAPH.problems.filter((p) => p.root_causes.some((rc) => (rc.goal_ids || []).includes(g.id)));
  const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: g.label }])}
    <h1>${g.icon} ${esc(g.label)}</h1>
    ${/* The goal page had the same defect as the home cards: "18 compounds that help you lose
          fat" where 18 of the 18 are prescription-only. Caught by the new goal-count gate, not by
          me — I fixed the home page and never looked here. */ ''}
    <p>${(() => { const RX = new Set(['prescription', 'controlled', 'unapproved']);
      const open = list.filter((c) => !RX.has(c.regulatory_class)).length; const rx = list.length - open;
      return rx ? `${open} you can buy and ${rx} that need a prescription` : `${open} compounds`; })()} that help you ${esc(g.label.toLowerCase())}, ranked by strength of human evidence — in plain English, with honest verdicts.</p>
    ${/* W5b (2026-08-02): D36 — THE CRAWLER GOT LESS THAN THE READER, on all 16 of these.
          Measured over the 68 reference routes, prerendered body words against fully-expanded
          hydrated words at 1280x900, 0 pageerrors: 17 routes served the crawler under half of what
          a reader sees, and 16 of the 17 are /goal/* — /goal/hormones 211 vs 1,765 (0.12),
          /goal/longevity 208 vs 1,623, /goal/muscle 225 vs 1,441, /goal/focus 170 vs 1,150. This
          is the OPPOSITE direction to D2 and it had exactly one cause: the reader gets a cpdCard
          per compound (category, the one-line mechanism, the approval badges), and the crawler got
          a bare name and a star row. Every field below is already on this page's own data and
          already shown to the reader — nothing new is authored, and no claim is added that the SPA
          does not make. `mds` is this file's markdown-stripper, `snip` its word-boundary trim. */ ''}
    <ul class="goal-list">${list.map((c) => {
      // `metaSummary` last: the 13 "(brief)" bundles carry no mechanism/plain/bottom, and it is the
      // fallback build/parse.js derives from the entry's own members for exactly this reason (it is
      // what their <meta description> uses). Without it those entries are a bare name here, which
      // is the defect this line exists to fix, one row at a time.
      const line = snip(c.mechanism || c.plain || c.bottom || c.metaSummary || '', 190);
      const labels = (c.approvalLabels || []).join(', ');
      return `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a> — ${stars(c.stars)}`
        + `${c.category ? ` · <span class="gl-cat">${esc(c.category)}</span>` : ''}`
        + `${labels ? ` · ${esc(labels)}` : ''}`
        + `${line ? `<br><span class="gl-why">${esc(line)}</span>` : ''}</li>`;
    }).join('')}</ul>
    ${protos.length ? `<h2>Full protocols</h2><ul>${protos.map((p) => `<li><a href="/protocol/${p.id}/${p.root_causes[0].id}">${esc(p.name)} — Move, Fuel &amp; Stack</a></li>`).join('')}</ul>` : ''}`;
  const goalLd = { '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: `${g.label} — what actually helps`, description: `Compounds ranked by human evidence for ${g.label.toLowerCase()}.`, url: SITE_URL + route, inLanguage: 'en', publisher: PUB.publisher, isPartOf: PUB.isPartOf, dateModified: PUB.dateModified };
  add(route, shell({ route, title: seoTitle(`${g.label}: what actually helps`), desc: `Compounds and full protocols that help you ${g.label.toLowerCase()}, ranked by human evidence — plain English, honest verdicts.`, jsonld: goalLd, ogImage: renderOgCard(`og/goal/${g.id}.png`, { kind: 'Goal', title: g.label, sub: 'What actually helps you ' + g.label.toLowerCase() + ' — ranked by human evidence.' }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: g.label, route }], body }));
});

// FLAT prerender of the cause cascade (Move 1, 2026-07). The 224-cause / 995-step "why" corpus
// (site/app.js causesSection -> bioJourney) rendered ONLY in the SPA, so the ~90% of traffic that
// never runs JS, and Google, never saw the site's core mechanism content. Round-5 random sampling
// put corpus overstatement at 3% (the 27% figure was a worst-neighbourhood bound, retired). This
// emits it crawlably: escape-then-format via mdSafe (NEVER app.js's mdInline sink), routed through
// mdBlocks so nothing ships as a wall of text, and with NO .chapter/display:none so nothing hides.
const CC_TAG = { trigger: 'the trigger', mediator: 'the mechanism', structure: 'the anatomy', amplifier: 'what makes it worse', tissue: 'in the tissue', outcome: 'the result', symptom: 'the symptom' };
const tierLabel = (t) => t >= 3 ? 'Well-established mechanism' : t === 2 ? 'Reasonably established' : 'Emerging — mechanistic / limited human data';
// Move 3B: a `structure` chain node links into the body — a structures.json id → its group's /muscle
// page, or an anatomy group id → that page. If a ref doesn't resolve, render plain text (no broken link).
const STRUCT_BY_ID = {}; (D.structures || []).forEach((s) => { STRUCT_BY_ID[s.id] = s; });
const MUSCLE_GROUP_IDS = new Set((((D.anatomy || {}).muscles) || []).map((m) => m.id));
function structureHref(ref) {
  if (!ref) return null;
  if (STRUCT_BY_ID[ref]) return '/muscle/' + STRUCT_BY_ID[ref].groupId;
  if (MUSCLE_GROUP_IDS.has(ref)) return '/muscle/' + ref;
  return null;
}
function causeChainFlat(chain) {
  return (chain || []).map((n) => {
    const lay = n.lay ? `<p class="bjf-lay"><strong>${mdSafe(n.lay)}</strong></p>` : '';
    const href = (n.type === 'structure' && n.ref) ? structureHref(n.ref) : null;
    const nodeLabel = href ? `<a href="${href}">${mdSafe(n.node)}</a>` : mdSafe(n.node);
    const node = n.node ? `<p class="bjf-node"><span class="bjf-tag">${esc(CC_TAG[n.type] || 'the science')}</span> ${nodeLabel}</p>` : '';
    const say = n.say ? mdBlocks(n.say, mdSafe) : '';
    return `<div class="bjf-step">${lay}${node}${say}</div>`;
  }).join('');
}
// ---- a plan item ------------------------------------------------------------------------------
// Two defects, both measured hydrated on all 41 /problem/* pages on 2026-08-01:
//
// 1. NOTHING WAS LINKED. 861 `.cf-fixes li` rendered, 0 of them containing an `a[href]` — while the
//    SPA's own protocol pages link the identical items (app.js:5281 links kind==='compound' when
//    resolveCompound() hits). So the crawler document, which is the one ~90% of readers get, named
//    a compound and offered no way to reach the page about it. This links them with findCpt(), the
//    resolver already in this file — deliberately NOT app.js's resolveCompound(), whose 5th pass is
//    a flattened substring match. findCpt resolves 270 of the 283 kind:"compound" items; the other
//    13 render as plain text rather than as a wrong link (acne "Benzoyl peroxide"; B12 x3 in
//    brain-fog/low-mood/memory; memory "Folate + B6/B12"; menopause "Fezolinetant" /
//    "Micronized progesterone" / "Vaginal estrogen"; hair-loss "Ketoconazole"; gut-health
//    "Butyrate"; immunity "Magnesium glycinate"; pcos "magnesium_mg"; thyroid — no ref at all).
//
// 2. THE CHIP DID NOT SAY WHAT THE REGULATOR SAYS. It printed the authored `kind` verbatim, and 20
//    of the 270 resolvable kind:"compound" items resolve to a compound the regulator does not treat
//    as a supplement: Semaglutide, Tirzepatide, Estradiol/Menopausal HRT x4, Tretinoin x2, PT-141
//    x2, Melatonin x3, Red Yeast Rice · Ezetimibe x2 (prescription/pharmacy) and BPC-157 x3,
//    GHK-Cu x2 (unapproved). The chip is now derived from regClass() of the compound the item
//    actually resolves to — i.e. from the FDA's or the relevant regulator's current classification,
//    never from the authored kind and never from anyone's opinion. All 171 compounds now carry an
//    authored `regulatory_class`, so regClass() reads that field on 171/171 and its legacy name
//    regexes never fire. Nothing here implies that a person has reviewed anything.
const REG_CHIP = {
  supplement: 'Supplement', otc: 'Over the counter', pharmacy: 'Pharmacy medicine',
  prescription: 'Prescription only', controlled: 'Controlled substance', unapproved: 'Not approved',
};
const KIND_CHIP = { behavior: 'Behaviour', behaviour: 'Behaviour', food: 'Food', rx: 'Prescription only', compound: 'Compound', other: 'Other' };
function fixItemHtml(f) {
  // kind:"rx" items stay unlinked, for parity with the SPA (app.js:5281 links kind==='compound'
  // only). 16 of the 93 rx items carry a ref; linking them would be new prescription-medicine link
  // surface beyond what the protocol pages already ship, which is not this change's concern.
  const c = (f.kind === 'compound' && f.ref) ? findCpt(f.ref) : null;
  const cls = c ? regClass(c) : String(f.kind || 'other');
  const label = c ? (REG_CHIP[cls] || KIND_CHIP.compound) : (KIND_CHIP[cls] || KIND_CHIP.other);
  const what = mdSafe(f.what || '');
  return `<li><span class="cf-kind ck-${esc(slug(cls) || 'other')}">${esc(label)}</span> ${c ? `<a href="/c/${slug(c.name)}">${what}</a>` : what}</li>`;
}
function causeCascadeFlat(p) {
  const w = CAUSE[p.id]; if (!w || !Array.isArray(w.causes) || !w.causes.length) return '';
  const causes = w.causes.slice().sort((a, b) => (a.rank || 9) - (b.rank || 9));
  const items = causes.map((c, i) => {
    const hook = c.hook ? `<p class="cf-hook">${mdSafe(c.hook)}</p>` : '';
    const ki = c.keyInsight ? `<p class="cf-key"><strong>The key insight:</strong> ${mdSafe(c.keyInsight)}</p>` : '';
    const chain = c.chain && c.chain.length ? `<h4>The pathway — step by step</h4>${causeChainFlat(c.chain)}` : '';
    const sym = (c.tell && c.tell.symptoms) ? `<p class="cf-tell"><strong>Is this you?</strong> ${mdSafe(String(c.tell.symptoms).replace(/\s*Honest tiering:.*$/i, '').trim())}</p>` : '';
    const conf = c.evidenceTier ? `<p class="cf-conf"><small>How well established is this mechanism: <b>${esc(tierLabel(c.evidenceTier))}</b> — this rates the causal link, not how much a given fix will help you.</small></p>` : '';
    const fixes = Array.isArray(c.fixes) && c.fixes.length ? `<h4>Your plan if this is your cause</h4><p class="muted">Work down the list — cheapest and safest first. The tag on each step is the regulator’s current classification, not a recommendation.</p><ul class="cf-fixes">${c.fixes.map(fixItemHtml).join('')}</ul>` : '';
    const deeper = c.plain ? `<div class="cf-deeper"><p><strong>Go deeper — the full mechanism.</strong></p>${mdBlocks(c.plain, mdSafe)}</div>` : '';
    // id="cause-N" is what the differential index above jumps to. N is the sorted position, which
    // equals c.rank on 224/224 causes (checked against data/cause_learn.json), so the number in the
    // index, the number in this heading and the fragment are the same number.
    return `<div class="cause-flat-item" id="cause-${i + 1}"><h3>Cause ${c.rank || i + 1}: ${mdSafe(c.name)}</h3>${hook}${ki}${chain}${sym}${conf}${fixes}${deeper}${causeNext(p, c, causes.length)}</div>`;
  }).join('');
  return `<section class="cause-flat"><h2>What’s actually causing this — the ${causes.length} common cause${causes.length !== 1 ? 's' : ''} in full</h2>${w.intro ? mdBlocks(w.intro, mdSafe) : ''}<p class="muted">Ranked by leverage (#1 fixes the most). Each is a self-contained explanation and plan. If you have not read the side-by-side tells yet, <a href="#which-one">start there</a> — it is much faster.</p>${items}</section>`;
}

// ---- the three blocks that turn /problem into a differential ----------------------------------
// MEASURED HYDRATED, 390x844, all 41 pages, default DOM, before this change (out/w2d13_before.json):
//   · median page height 29,844 px = 35.4 phone screens
//   · the FIRST link to a protocol sat at 98% of that height on 41/41 (min 98, max 99, median
//     y = 29,346 px). The page a reader is sent to by /solve, by every protocol and by every
//     breadcrumb had its exit at the very bottom.
//   · "reassess" 0/41 and "not medical advice" 0/41, while data/protocol_plan.json has a written
//     `reassess` block for 41/41 problems that has been live on all 52 /protocol/* pages since
//     2026-07-28. The decision hub was the one page in the funnel with no escalation layer.
//   · the fields that let a reader tell two causes APART — confusedWith (208/224) and
//     tell.labMarker (216/224) — were authored and rendered nowhere in either document.
//   · the 224 `.cf-tell` paragraphs were spread over the whole page: cause #1's tell at a median
//     y of 5,137 px, #6's at 31,797 px. Comparing the first cause against the last cost a
//     ~26,000 px scroll, which is the real reason the page could not be used as a differential.
// So: escalation first, then every tell in one block, then the way out — before the 30,000 px of
// mechanism prose rather than after it.

// 1. Escalation. Rendered from the authored `reassess` text; no new clinical claim is made here.
function problemRedFlags(p) {
  const plan = PLAN[p.id] || {};
  if (!plan.reassess) return '';
  return `<section class="prob-redflags plan-reassess" id="red-flags">
    <h2>First — when this is not a self-care problem</h2>
    ${mdBlocks(plan.reassess, mdSafe)}
    <p class="esc-note">If something is severe, sudden, or getting rapidly worse, do not work
    through a protocol — <b>call your local emergency number</b> and go to an emergency department.
    (It is 995 in Singapore, 999 in the UK and much of Asia, 911 in North America, 112 across
    Europe, 000 in Australia.) For anything persistent, a family doctor or polyclinic is the right
    first stop.</p>
    <p class="esc-note"><b>This page is information, not medical advice.</b> No clinician has
    reviewed it, and nothing on it is a diagnosis.</p>
  </section>`;
}

// 2. The differential: every cause's discriminating text in one block, in reading order.
function problemDifferential(p, causes) {
  const rows = causes.map((c, i) => {
    const n = i + 1;
    const tell = (c.tell && c.tell.symptoms) ? String(c.tell.symptoms).replace(/\s*Honest tiering:.*$/i, '').trim() : '';
    const lab = (c.tell && c.tell.labMarker) ? String(c.tell.labMarker).trim() : '';
    return `<li class="dx-row">
      <p class="dx-name"><a href="#cause-${n}"><b>${n}. ${mdSafe(c.name)}</b></a></p>
      ${c.hook ? `<p class="dx-hook">${mdSafe(c.hook)}</p>` : ''}
      ${tell ? `<p class="dx-tell"><span class="dx-lbl">The tell</span> ${mdSafe(tell)}</p>` : ''}
      ${c.confusedWith ? `<p class="dx-conf"><span class="dx-lbl">Often mistaken for</span> ${mdSafe(c.confusedWith)}</p>` : ''}
      ${lab ? `<p class="dx-lab"><span class="dx-lbl">What a test would show</span> ${mdSafe(lab)}</p>` : ''}
      <p class="dx-go"><a href="#cause-${n}">The mechanism and the plan for cause ${n} →</a></p></li>`;
  }).join('');
  // The <h2> stays BARE. anchorHeadings() (prerender.js:331) only matches `<h([23])>` with no
  // attributes, so an authored id here would silently drop the heading out of the contents card and
  // lose its # anchor. The jump target lives on the <section> instead.
  return `<section class="prob-dx" id="which-one" aria-label="Which cause is yours">
    <h2>Which one is you? — the ${causes.length} causes side by side</h2>
    <p class="muted">Ranked by leverage: #1 is the cause that, fixed, changes the most for the most
    people. Read the tells, pick the closest, jump straight to it. More than one can be true at
    once, and this is a reading aid rather than a diagnosis — the “what a test would show” lines
    say what a doctor would order, not what you should conclude on your own.</p>
    <ol class="dx-list">${rows}</ol></section>`;
}

// 3. The way out, stated exactly as honestly as the data supports. The bind from a root cause (what
// a /protocol/<problem>/<root_cause> URL names) to a cause on this page is the authored, build-gated
// join in data/cause_map.json, folded onto each root cause as `cause_key` by build/parse.js. It
// covers 47 of the 52 root causes and therefore 47 of the 224 causes; the other 5 root causes are
// deliberately unmapped because they are umbrellas over several causes. NOTHING is guessed here:
// word-overlap matching was tried on this exact surface once already and rejected (see the comment
// above causeCascadeSummary), and the counts below are computed per page, never hard-coded.
function protocolRoute(p, causes) {
  const rcs = p.root_causes || [];
  if (!rcs.length) return '';
  const links = rcs.map((rc) => `<a href="/protocol/${p.id}/${rc.id}">${esc(rc.name.replace(/\s*\([^)]*\)/, ''))}</a>`).join(' · ');
  const bound = rcs.filter((rc) => rc.cause_key).length;
  const nC = causes.length;
  const head = rcs.length === 1
    ? `${esc(p.name)} has <b>one</b> full protocol — the movements, the food and the compounds — written around the root cause ${links}.`
    : `${esc(p.name)} has <b>${rcs.length}</b> full protocols — the movements, the food and the compounds — each written around one root cause: ${links}.`;
  const honest = bound
    ? `${bound} of the ${nC} cause${nC === 1 ? '' : 's'} below ${bound === 1 ? 'is' : 'are'} matched to ${rcs.length === 1 ? 'it' : 'one of them'}. For the ${nC - bound} that ${nC - bound === 1 ? 'is' : 'are'} not, the step-by-step plan inside the cause is what this site has — there is no separate protocol to send you to, and pretending otherwise would be worse than saying so.`
    : `None of the ${nC} causes below is matched to ${rcs.length === 1 ? 'it' : 'one of them'} individually: ${rcs.length === 1 ? 'that root cause is' : 'those root causes are'} an umbrella over several of them. The step-by-step plan inside each cause is what this site has for that cause.`;
  return `<section class="prob-route" id="the-plan">
    <h2>Where the full plan lives</h2><p>${head}</p><p class="prob-route-honest">${honest}</p></section>`;
}

// The footer of one cause: the protocol authored for THIS cause if there is one, and the way back.
function causeNext(p, c, nCauses) {
  const rc = (p.root_causes || []).find((r) => r.cause_key === c.name);
  const back = `<p class="cf-next-up"><a href="#which-one">↑ Back to the ${nCauses} causes side by side</a></p>`;
  if (rc) {
    return `<div class="cf-next"><p><b>The full protocol for this cause:</b>
      <a href="/protocol/${p.id}/${rc.id}">${esc(p.name)} — ${esc(rc.name.replace(/\s*\([^)]*\)/, ''))}</a>
      — the movements, the Singapore food and the compounds, in one plan.</p>${back}</div>`;
  }
  const rcs = p.root_causes || [];
  const links = rcs.map((r) => `<a href="/protocol/${p.id}/${r.id}">${esc(r.name.replace(/\s*\([^)]*\)/, ''))}</a>`).join(' · ');
  const nFix = Array.isArray(c.fixes) ? c.fixes.length : 0;
  return `<div class="cf-next"><p><b>No full protocol is written for this cause.</b> The
    ${nFix}-step plan above is what this site has for it. ${rcs.length
      ? `${esc(p.name)}'s protocol${rcs.length === 1 ? ' is' : 's are'} written around ${rcs.length === 1 ? 'a different root cause' : 'other root causes'}: ${links}.`
      : ''}</p>${back}</div>`;
}

// The cascade in ONE LINE PER CAUSE, for the root-cause pages. Measured before this change: the 21
// root-cause pages that share a problem with a sibling were 94-97% identical to that sibling, because
// causeCascadeFlat(p) is keyed by PROBLEM and rendered in full on every one of them — roughly 7,000
// of each page's 7,800 words were the same text as the page next door. Google treats that as
// duplicate content on the site's flagship page type. The full cascade now lives once, at
// /problem/<id>; each root-cause page names every cause and links there.
// NOT auto-matched to "the one cause this page is about": word-overlap matching scored 19 of 21, but
// its weak matches were wrong (skin-aging's "UV / oxidative damage" matched "smoking and air
// pollution"). Computing an edge that should be curated is the mistake this project already made
// with exercise tags. Listing all of them, correctly, beats guessing one.
function causeCascadeSummary(p) {
  const w = CAUSE[p.id]; if (!w || !Array.isArray(w.causes) || !w.causes.length) return '';
  const causes = w.causes.slice().sort((a, b) => (a.rank || 9) - (b.rank || 9));
  const items = causes.map((c, i) => `<li><b>${mdSafe(c.name)}</b>${c.hook ? ` — ${mdSafe(c.hook)}` : ''}</li>`).join('');
  return `<section class="cause-brief"><h2>Why ${esc(p.name.toLowerCase())} happens — the ${causes.length} common cause${causes.length !== 1 ? 's' : ''}</h2>
    <ul class="cause-brief-list">${items}</ul>
    <p><a href="/problem/${p.id}" data-native>Read the full breakdown of all ${causes.length} causes — the pathway, the tell, and the plan for each →</a></p></section>`;
}

// ---- /problem/<id> — the cascade's canonical home --------------------------------------------
// The "why this happens" corpus is authored per PROBLEM, not per root cause, and had no page of its
// own, so it was being stamped onto every root-cause page instead. This gives it one URL. The
// breadcrumb trail already read Home > Solve > <problem>, so this is the page that trail always
// implied existed.
GRAPH.problems.forEach((p) => {
  const w = CAUSE[p.id]; if (!w || !Array.isArray(w.causes) || !w.causes.length) return;
  const route = `/problem/${p.id}`;
  const causes = w.causes.slice().sort((a, b) => (a.rank || 9) - (b.rank || 9));
  // Order is the whole change: escalation, then the differential, then the exit — all of it above
  // the 30,000 px of mechanism prose that used to come first. The old bottom-of-page "The full
  // protocols" list is gone because protocolRoute() carries the same links near the top and every
  // cause block now carries them again at the point of decision.
  const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }, { name: p.name }])}
    <h1>${p.icon || ''} Why ${esc(p.name.toLowerCase())} happens</h1>
    <p class="lede">The same symptom has different causes, and they need different fixes — so this
    page starts with the ${causes.length} cause${causes.length === 1 ? '' : 's'} side by side and how to
    tell them apart, then gives the mechanism and the plan for each.</p>
    ${problemRedFlags(p)}
    ${problemDifferential(p, causes)}
    ${protocolRoute(p, causes)}
    ${causeCascadeFlat(p)}
    <p class="review-state">Written with AI assistance and edited by a human. <b>Not yet reviewed by a clinician.</b> <a href="/methodology" data-native>How this page was made</a> · <a href="/corrections" data-native>Corrections</a></p>`;
  add(route, shell({
    route,
    title: seoTitle(`Why ${p.name.toLowerCase()} happens: every cause`),
    desc: seoDesc(`The ${w.causes.length} common causes of ${p.name.toLowerCase()} — the mechanism behind each, how to tell which is yours, and what to do about it.`),
    jsonld: [{ '@context': 'https://schema.org', '@type': 'MedicalWebPage', inLanguage: 'en',
      name: `Why ${p.name} happens`, about: { '@type': 'MedicalCondition', name: p.name },
      url: SITE_URL + route, publisher: PUB.publisher, isPartOf: PUB.isPartOf, dateModified: PUB.dateModified }],
    breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }, { name: p.name, route }],
    body,
  }));
});

// protocols
GRAPH.problems.forEach((p) => {
  p.root_causes.forEach((rc) => {
    const route = `/protocol/${p.id}/${rc.id}`;
    const stack = protoStack(rc), med = protoMedical(rc), fuel = protoFuel(rc), move = protoMove(rc);
    const nt = Object.entries(rc.nutrient_targets || {}).map(([k, t]) => `${nutrientLabel(k)}: ${t.target}${t.unit} (${t.type})`).join(', ');

    // ---- THE SAFETY LAYER (added 2026-07-28) ----------------------------------------------
    // Measured across all 52 prerendered protocol files BEFORE this change:
    //   "See a doctor" 0/52 · "red flag" 0/52 · "emergency" 0/52 · "A&E" 0/52 · "995" 0/52
    //   "reassess" 0/52 · "pregnan" 0/52 · "warfarin" 0/52     ... while "HowTo" was 52/52.
    // So the escalation layer reached 0% of the ~90% of traffic that never runs JavaScript,
    // while the star-ranked supplement stack and a HowTo schema reached 100% of it. Meanwhile
    // protocol_plan.reassess names a doctor, clinician, A&E or polyclinic on 41 of 41 problems
    // and is well written. It was authored, and connected to nothing. This emits it.
    const plan = PLAN[p.id] || {};
    const timeline = Array.isArray(plan.timeline) ? plan.timeline : [];
    // Sibling root causes: the same problem's other causes, so a reader who is on the wrong one
    // has a way out of it. (Also gives the 11 off-funnel causes an inbound link.)
    const siblings = (p.root_causes || []).filter((x) => x.id !== rc.id);
    // The full cause bodies (chain/lay/say/keyInsight/fixes) are now emitted crawlably by
    // causeCascadeFlat(p) higher in the body (Move 1, 2026-07). cause_learn.json is keyed by
    // PROBLEM id ("knee-pain"), not root-cause id -- causeCascadeFlat reads CAUSE[p.id] for that
    // reason (keying on rc.id silently renders nothing, the looks-complete-but-empty join trap).
    // ---- THE SAFETY STRUCTURE, ABOVE THE RECOMMENDATIONS (2026-08-01, W2) ------------------
    // This block used to render BELOW the Stack and the Medical options on 52/52 prerendered
    // pages — the escalation text sat under the recommendations it qualifies, in the document
    // ~90% of readers get. The same inversion was measured hydrated (median y 11,023 px for the
    // 🚩 card against 8,914 px for the first supplement line). It is hoisted here, and given the
    // two structures the page never had: the ONE metric this protocol is judged by, and the point
    // at which the honest answer is to stop and get help.
    // Every string comes from data/protocol_plan.json via data/protocol_safety.json, which selects
    // rather than writes and is gated by assertProtocolSafety() in build/parse.js. Class names
    // match site/app.js exactly, so the two documents render the same thing.
    const sfy = p.safety;
    // ---- W4 (2026-08-02): PHASE 1 — ONE FREE THING, FOR 7 DAYS ----------------------------
    // MEASURED HYDRATED at 390x844 in the DEFAULT DOM state on all 52 /protocol/* routes before
    // this (out/w4int_before.json): "Phase 1"/"Phase 2" 0/52 · "$0" 1/52 · any instruction to
    // hold everything else constant 0/52 · the ⭐ keystone card — the page's own free single
    // habit — at median y 17,687 px = 94% of a median 18,939 px page on 52/52, and 7,732 px
    // BELOW the first supplement link (median y 9,698 px, 54%) on 52/52.
    // NOTHING HERE IS WRITTEN BY THIS FILE. rc.phase1 is SELECTED from this root cause's own
    // keystone / prescription / behaviour fix by data/protocol_phase1.json and gated by
    // assertPhase1() in build/parse.js. The metric is problem.safety.metric — the same W2
    // structure printed above, not a second one. The horizon is p.phase1Signal, which is
    // timeline[1].when verbatim; on 39 of the 44 routes that have a Phase 1 it lands AFTER day 7,
    // so the copy says the week tests whether you can do it, not whether it works.
    // On the 8 root causes with no free lever this prints that, with the authored reason.
    // Inventing one for hair-loss/dht-sensitivity (finasteride and minoxidil) is the fabrication
    // class W3.5 closed. Class names and data-* attributes match site/app.js exactly, so the two
    // documents render the same thing — D2/D33 is the class where they do not.
    const p1 = rc.phase1;
    const p1Sig = p.phase1Signal || '';
    const p1In7 = !!p.phase1SignalWithin7;
    const phase1 = p1 ? `<section class="phase1" id="phase-1" data-phase1-action="${esc(p1.action)}" data-phase1-cost="${esc(p1.cost)}" data-phase1-class="${esc(p1.class)}">
        <div class="p1-badge">Phase 1 · 7 days · $0 · one thing</div>
        <p class="p1-action">${esc(p1.action)}</p>
        <p class="p1-quote">Selected from this protocol’s own plan: “${esc(p1.quote)}”</p>
        <dl class="p1-facts">
          <div class="p1-fact"><dt>Watch</dt><dd>${sfy ? esc(sfy.metric) : 'the one thing this protocol is judged by'} <a href="#red-flags">— why this one ↑</a></dd></div>
          <div class="p1-fact"><dt>When it moves</dt><dd>${p1In7
            ? `This protocol’s own timeline puts the first change at <b>${esc(p1Sig)}</b>, inside these 7 days.`
            : `This protocol’s own timeline does not expect a change until <b>${esc(p1Sig)}</b> — after these 7 days end. So the week is a test of whether you can do it daily, not of whether it works.`}</dd></div>
          <div class="p1-fact"><dt>A partial result</dt><dd>You did it on most of the 7 days${sfy ? ` and the thing you are tracking — “${esc(sfy.metric)}” —` : ' and the thing you are tracking'} has not moved. ${p1In7
            ? `That is a weak signal rather than a failure — ${esc(p1Sig)} is the very end of this week.`
            : `That is the expected result, because ${esc(p1Sig)} is after this week ends.`} If you could not do it on most days, that is the useful answer too: make it smaller and run the week again.</dd></div>
        </dl>
        <p class="p1-constant"><b>Change nothing else for the 7 days.</b> Not the supplements you already take, not your training, not your diet. One variable at a time — change two things and you will not know which one did it, and the week tells you nothing.</p>
      </section>` : (rc.phase1None ? `<section class="phase1 phase1-none" id="phase-1" data-phase1-none>
        <div class="p1-badge p1-badge-none">Phase 1 · there is no $0 version of this one</div>
        <p class="p1-action">This protocol has no free first step.</p>
        <p class="p1-quote">${esc(rc.phase1None)}</p>
        <p class="p1-constant">Every other protocol here opens with one thing that costs nothing. This one does not, and saying otherwise would mean inventing a lever this page’s own sources do not contain. Read the rest, and take it to a doctor or pharmacist before you buy anything.</p>
      </section>` : '');
    const redflags = `
      ${plan.reassess ? `<section class="safety-first" id="red-flags">
        <div class="plan-card plan-reassess">
          <h3>First — when this is not a self-care problem</h3>
          ${mdBlocks(plan.reassess, mdSafe)}
          <p class="esc-note">If something is severe, sudden, or getting rapidly worse, do not work
          through a protocol — <b>call your local emergency number</b> and go to an emergency
          department. (It is 995 in Singapore, 999 in the UK and much of Asia, 911 in North America,
          112 across Europe, 000 in Australia.) For anything persistent, a family doctor or
          polyclinic is the right first stop.</p>
          <p class="esc-note"><b>This page is information, not medical advice.</b> No clinician has
          reviewed it, and nothing on it is a diagnosis.</p>
        </div>
        ${sfy ? `<div class="safety-grid">
          <div class="sf-card track-metric" data-primary-metric="${esc(sfy.metric)}">
            <span class="sf-k">The one thing to track</span>
            <b class="sf-v">${esc(sfy.metric)}</b>
            <p class="sf-src">${mdSafe(sfy.metricSource)}</p>
            <p class="sf-base">Write down where it is <b>today</b> — that is the baseline you will
            compare against at ${esc(sfy.checkpoint)}.</p>
          </div>
          <div class="sf-card stop-rule" data-stop-rule data-horizon="${esc(sfy.stopHorizon || '')}">
            <span class="sf-k">The stop rule${sfy.stopHorizon ? ' · ' + esc(sfy.stopHorizon) : ''}</span>
            <b class="sf-v">${esc(sfy.stopIssue)}</b>
            <p class="sf-src">${mdSafe(sfy.stopFix)}</p>
          </div>
        </div>` : ''}
      </section>` : ''}`;
    const safety = `
      ${timeline.length ? `<h3>What to expect, and by when</h3>
        <ul>${timeline.map((t) => `<li><b>${esc(t.when)}</b> — ${mdSafe(t.what)}</li>`).join('')}</ul>` : ''}
      ${siblings.length ? `<h3>Other root causes of ${esc(p.name)}</h3>
        <p class="muted">If the description above does not sound like you, it is probably one of these.</p>
        <ul>${siblings.map((s) => `<li><a href="/protocol/${p.id}/${s.id}">${esc(s.name.replace(/\s*\([^)]*\)/, ''))}</a></li>`).join('')}</ul>` : ''}`;
    const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }, { name: p.name }])}
      <h1>${p.icon || ''} ${esc(p.name)}</h1><h2>${esc(rc.name)}</h2>
      ${rc.diagnostic ? `<p>${esc(rc.diagnostic)}</p>` : ''}
      ${redflags}
      ${phase1}
      ${/* W4 (2026-08-02): suppressed on the 38 of 52 routes whose Phase 1 was SELECTED FROM THIS
            VERY KEYSTONE — otherwise the page prints the same authored sentence twice. site/app.js
            carries the identical condition; if the two drift, a crawler and a reader disagree
            about whether this card exists, which is the D33 defect class. */''}
      ${(rc.keystone && !(rc.phase1 && rc.phase1.from === 'keystone')) ? `<div class="keystone-card"><div class="ks-badge">⭐ Your one keystone</div><p class="ks-one">${esc(rc.keystone.one)}</p><p class="ks-why">${esc(rc.keystone.why)}</p></div>` : ''}
      ${causeCascadeSummary(p)}
      <h3>Move — the mechanics that fix it${rc.prescription ? `: ${esc(rc.prescription.scheme)}` : ''}</h3>
      <p class="p-maint-note">The full programme, for after the 7 days. Phase 1 is one piece of this, done alone.</p>
      ${rc.prescription ? `<p>${esc(rc.prescription.detail)}</p>` : ''}
      ${move.length ? `<ul>${move.map((e) => `<li>${esc(e.name)}</li>`).join('')}</ul>` : ''}
      <h3>Fuel — what to keep eating anyway</h3>
      <p class="p-maint-note">Maintenance, not the experiment. Keep eating the way you already eat
      during Phase 1 — changing your food and your one Phase 1 habit in the same week means the
      week tells you nothing.</p>
      ${fuel.length ? `<ul>${fuel.map((f) => `<li>${esc(f.name)}${f.sg_local ? ' (sold in SG)' : ''}</li>`).join('')}</ul>` : ''}
      ${nt ? `<p><b>Daily nutrient targets:</b> ${esc(nt)}</p>` : ''}
      <details class="phase2" id="phase-2"${p1 ? '' : ' open'}>
        <summary><span class="p2-k">Phase 2 · optional</span> The targeted stack — only after Phase 1</summary>
        <div class="p2-body">
        <h3>Stack — supplements with human trial evidence for this use</h3>
        ${stack.length
          ? `<ul>${stack.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a> — ${stars(c.stars)}</li>`).join('')}</ul>`
          : `<p>No supplement has trial evidence specific to this problem that I'd put my name to. That is the honest answer, not an omission.</p>`}
        ${med.length ? `<h3>Medical options — discuss with a doctor</h3>
          <p>These are prescription or controlled medicines. I list them so you know they exist and can raise them with a clinician. They are not recommendations, they are not ranked, and I do not give doses for them here.</p>
          <ul>${med.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a></li>`).join('')}</ul>` : ''}
        </div>
      </details>
      ${stackAuditCallout()}
      ${safety}
      <p><a href="/fuel/${p.id}/${rc.id}">Open the Fuel Tracker for this protocol — targets, foods and why each one →</a></p>
      <p class="review-state">Written with AI assistance and edited by a human. <b>Not yet reviewed by a clinician.</b> <a href="/methodology" data-native>How this page was made</a> · <a href="/corrections" data-native>Corrections</a></p>
      <p><em>Educational protocol, not medical advice.</em></p>`;
    const rcShort = rc.name.replace(/\s*\([^)]*\)/, '');
    const moveNames = move.slice(0, 5).map((e) => e.name).join(', ');
    const fuelNames = fuel.slice(0, 5).map((f) => f.name).join(', ');
    const stackNames = stack.slice(0, 5).map((c) => c.name).join(', ');
    const pqa = faqBlock([
      rc.diagnostic ? { q: `What causes ${p.name.toLowerCase()}?`, a: `${rc.name}. ${snip(rc.diagnostic, 240)}` } : null,
      (rc.prescription || move.length) ? { q: `What exercises help ${p.name.toLowerCase()}?`, a: `${rc.prescription ? rc.prescription.detail : ''}${move.length ? ` Key movements: ${moveNames}.` : ''}`.trim() } : null,
      fuel.length ? { q: `What should you eat for ${p.name.toLowerCase()}?`, a: `Foods that support it: ${fuelNames}.` } : null,
      stack.length ? { q: `What supplements help ${p.name.toLowerCase()}?`, a: `Evidence-ranked options: ${stackNames}.` } : null,
    ]);
    const howto = (move.length || fuel.length || stack.length) ? { '@context': 'https://schema.org', '@type': 'HowTo', name: `How to address ${p.name} — ${rcShort}`, description: snip(rc.diagnostic || p.name, 200), step: [
      (rc.prescription || move.length) ? { '@type': 'HowToStep', name: 'Move', text: rc.prescription ? rc.prescription.detail : `Corrective movement: ${moveNames}.` } : null,
      fuel.length ? { '@type': 'HowToStep', name: 'Fuel', text: `Eat to support recovery: ${fuelNames}.` } : null,
      stack.length ? { '@type': 'HowToStep', name: 'Stack', text: `Evidence-ranked supplements to consider: ${stackNames}.` } : null,
    ].filter(Boolean) } : null;
    const protoLd = [{
      '@context': 'https://schema.org', '@type': 'MedicalWebPage', inLanguage: 'en',
      name: `${p.name} — ${rc.name} protocol`, description: (rc.diagnostic || p.name),
      about: { '@type': 'MedicalCondition', name: p.name },
      // audience:MedicalAudience/Patient removed — it asserted these pages address patients of a
      // condition (an intended-use claim), including on brain-fog & burnout where there is none.
      // lastReviewed removed — it stamped the build date as if a clinician had reviewed the page.
      // Re-add both per-page only when a named reviewer actually checks it. dateModified is honest.
      url: SITE_URL + route, publisher: PUB.publisher, isPartOf: PUB.isPartOf, dateModified: PUB.dateModified,
    }].concat(howto || []).concat(pqa.ld || []);
    add(route, shell({ route, title: seoTitle(`${p.name}: ${rcShort.toLowerCase()}`), desc: seoDesc(`${p.name} — ${rcShort}: the exercises, foods and evidence-ranked compounds for this root cause.`), jsonld: protoLd, ogImage: renderOgCard(`og/protocol/${p.id}/${rc.id}.png`, { kind: 'Protocol · ' + (p.category || ''), title: p.name, sub: rc.plain || rc.diagnostic || rc.name }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }, { name: p.name, route }], body: body + pqa.html }));

    // ---- the Fuel Tracker's readable twin ----------------------------------------------------
    // Added 2026-07-30. Every protocol page links to /fuel/<problem>/<cause>, and not one of those
    // 52 routes had a page: they fell through to the empty SPA shell, so the link read "Open the
    // Fuel Tracker" and delivered a blank white document to the ~90% of readers who do not run
    // JavaScript. Logging your own day genuinely needs JavaScript. The targets, the foods, and the
    // reason behind each target do not — and `nutrient_targets[k].why` is authored for every target
    // and rendered in exactly one place on the whole site, inside the tracker widget (app.js), so
    // it has never been visible to a crawler or a no-JS reader at all. This emits it.
    // noindex + kept out of the sitemap: this is a utility view, and its food list overlaps the
    // protocol page's, so it should be reachable and readable without competing in search.
    {
      const tgts = Object.entries(rc.nutrient_targets || {});
      const cols = tgts.map(([k]) => k).filter((k) => k !== 'kcal').slice(0, 5);
      const num = (v) => (v === null || v === undefined || v === '' ? '—' : v);
      const fuelRoute = `/fuel/${p.id}/${rc.id}`;
      const fbody = `${crumbHtml([{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }, { name: p.name, route }, { name: 'Fuel' }])}
        <h1>Fuel — ${esc(p.name)}</h1><h2>${esc(rc.name)}</h2>
        <p class="lede">What to eat for this cause, how much of it, and why each target is the
        target. The day-by-day log needs JavaScript; everything below does not.</p>
        ${tgts.length ? `<h2>Daily targets, and why</h2>
          <div class="tbl-wrap"><table class="fuel-tbl"><thead><tr><th>Nutrient</th><th>Target</th><th>Why this one</th></tr></thead><tbody>
          ${tgts.map(([k, t]) => `<tr><td><b>${esc(nutrientLabel(k))}</b></td><td>${esc(String(t.target))}${esc(t.unit || '')}${t.type ? ` <span class="muted">(${esc(t.type)})</span>` : ''}</td><td>${esc(t.why || '—')}</td></tr>`).join('')}
          </tbody></table></div>` : ''}
        ${fuel.length ? `<h2>Foods that move these numbers</h2>
          <p>Chosen because they carry the nutrients above. Marked items are on the Singapore list — hawker dishes
          and the staples sold there — kept because they are the best-documented set I have; the rest
          are generic foods you can find almost anywhere.</p>
          <div class="tbl-wrap"><table class="fuel-tbl"><thead><tr><th>Food</th><th>Serving</th><th>kcal</th>${cols.map((k) => `<th>${esc(nutrientLabel(k))}</th>`).join('')}</tr></thead><tbody>
          ${fuel.map((f) => `<tr><td><b>${esc(f.name)}</b>${f.sg_local ? ' <span class="sg-chip">sold in SG</span>' : ''}</td><td>${esc(f.serving || '—')}</td><td>${num(f.kcal)}</td>${cols.map((k) => `<td>${num(f[k])}</td>`).join('')}</tr>`).join('')}
          </tbody></table></div>
          <p class="muted">A dash means that value is not recorded for that food, not that it contains none.</p>` : ''}
        <h2>Using this</h2>
        <p>Food is the slowest lever on this list and the one that holds. Hit the targets from meals
        first; a supplement is for the gap you cannot close that way, which is why the compounds sit
        on the protocol page rather than this one.</p>
        <p><a href="${route}">← Back to the full ${esc(p.name)} protocol</a> — the movements, the
        evidence-ranked compounds, and when to see a clinician instead.</p>
        <p class="review-state">Written with AI assistance and edited by a human. <b>Not yet reviewed by a clinician.</b> <a href="/methodology" data-native>How this page was made</a> · <a href="/corrections" data-native>Corrections</a></p>
        <p><em>Educational, not medical advice. Nutrient targets are general adult guidance.</em></p>`;
      add(fuelRoute, shell({
        route: fuelRoute, robots: 'noindex,follow',
        // W5b: these 52 titles were the only ones on the site that hand-appended " · RNAwiki"
        // instead of going through seoTitle(), so they never met the 60-char budget every other
        // page is trimmed to — 51 of the 52 were over it, up to 93 chars
        // ("Fuel for High Blood Pressure — endothelial dysfunction + sodium/potassium imbalance").
        // Nothing caught it because nothing had ever looked at a <title> until assertHeadParity().
        title: seoTitle(`Fuel for ${p.name} — ${rcShort.toLowerCase()}`),
        desc: seoDesc(`Daily nutrient targets for ${p.name} (${rcShort.toLowerCase()}), why each one, and the everyday foods that hit them.`),
        breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }, { name: p.name, route }, { name: 'Fuel', route: fuelRoute }],
        body: fbody,
      }), { noSitemap: true });
    }
  });
});

// targets
(D.targets || []).forEach((t) => {
  const route = '/target/' + tkey(t.sym);
  const list = t.compoundIds.map((id) => D.compounds.find((c) => c.id === id)).filter(Boolean);
  // ---- W5d (2026-08-02): D17 — THE TITLE PROMISED A LIST AND 77 PAGES HAD ONE ITEM -----------
  // Measured hydrated at 390x844 on all 103 /target routes (qa/out/w5cdi/before-390.json). The
  // <title> read "<SYM>: the compounds that hit it" and the meta description ended "and every
  // compound that acts on it", on 103 of 103. The actual compound-link count per page:
  //     1 -> 77 routes · 2 -> 17 · 3 -> 6 · 4 -> 1 · 5 -> 1 · 11 -> 1
  // So on 77 of 103 pages the search result, the tab and the share card all promised a list, and
  // the page held one item. The on-page "· N COMPOUNDS" badge was already honest — the counts were
  // never wrong, only the framing built on top of them. This is the same defect class as
  // "Covers all 170 compounds" and "Search 170 compounds": a phrase typed next to a number that
  // did not have to agree with it. The number is now the phrase.
  const nC = list.length;
  const nWord = nC === 1 ? 'the one compound' : `all ${nC} compounds`;
  const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: 'Browse', route: '/browse' }, { name: t.sym }])}
    <h1>${esc(t.sym)}</h1><p>${esc(t.name)} — the molecular target that ${nC === 1 ? 'one compound in the wiki acts on' : `${nC} compounds in the wiki act on`}.</p>
    ${t.pomNotice ? `<div class="pom-notice"><b>⚕️ Prescription-only medicines are named on this page.</b> ${mdSafe(t.pomNotice.text)}</div>` : ''}
    ${t.explainer ? `<div>${t.explainer.html}</div>` : ''}
    ${/* 103 target pages averaged 175 words against 117,232 words of authored target_learn content.
          These were the LAST layer held back by the stage-2 gate audit, and correctly so: 37 of them
          named a prescription-only medicine with no status anywhere on the page. That is now
          generated from regulatory_class.json (see parse.js) rather than hand-written, so it cannot
          rot as the corpus grows, and the emission is safe to turn on. */ ''}
    ${learnFlatHtml(t)}
    <h2>${nC === 1 ? 'The compound acting on' : `The ${nC} compounds acting on`} ${esc(t.sym)}</h2><ul>${list.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a></li>`).join('')}</ul>`;
  add(route, shell({ route, title: seoTitle(nC === 1 ? `${t.sym}: the one compound that hits it` : `${t.sym}: the ${nC} compounds that hit it`), desc: seoDesc(`${t.sym}: ${t.name || ''}. What it does, and ${nWord} in the wiki that ${nC === 1 ? 'acts' : 'act'} on it.`), ogImage: renderOgCard(`og/target/${tkey(t.sym)}.png`, { kind: 'Molecular target', title: t.sym, sub: cleanDesc((t.explainer && t.explainer.html || '').replace(/<[^>]+>/g, ' ').replace(/^\s*In one line:\s*/i, ''), 120) }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: t.sym, route }], body }));
});

// pathways + learn
// ---- the learn layer, rendered FLAT for the prerendered document ----------------------------
// Added 2026-07-28 (Phase 2, canary). Until now build/prerender.js referenced `.expand` ZERO times:
// it emitted only `p.html` for /pathway/i, so all 16 live pathway pages together carried 4,888
// words against ~106,534 authored. ~95% of the layer was invisible to the ~90% of traffic that
// never runs JavaScript.
//
// Deliberately a NEW flat renderer rather than a call into site/app.js's:
//  - `styles.css:2436` is `.chapter{display:none}`. Reusing the SPA's chaptered renderer would ship
//    60-80% of the words inside hidden elements — published but invisible, the worst of both.
//  - v4 established that a shared module CANNOT render these pages anyway: the SPA composition
//    embeds IIFE-scoped variables.
// So this owns its own markup and uses no `.chapter` class anywhere.
//
// Ordered as progressive disclosure — the 30-second answer, then the 5-minute understanding, then
// the deep layer — so the same page serves a skimmer and a reader without two sets of content.
// selfTest and canExplain are NOT emitted: they are self-assessment checklists, not exposition, and
// they read as filler to a crawler. That is the honest reason; it is not a risk mitigation.
// Prerender twin of site/app.js's pathwayDiagram(). Deliberately the same markup and the same CSS
// classes, so the crawlable page and the hydrated page show the SAME map rather than two variants.
// This is the only diagrammatic element on a pathway page: a design review measured ZERO svg/img/
// table/canvas content elements across all 16 pages in both renderers, on a site whose owner is a
// visual learner building a visual knowledge graph.
function pathwayDiagramHtml(spec, hub) {
  if (!spec) return '';
  const goalByLabel = {};
  (D.goals || []).forEach((g) => { goalByLabel[String(g.label).toLowerCase()] = g; });
  const chip = (label, cls) => { const c = findCpt(label); return c
    ? `<a class="pd-chip ${cls}" href="/c/${slug(c.name)}">${esc(label)}</a>`
    : `<span class="pd-chip ${cls}">${esc(label)}</span>`; };
  const eff = (label, dir) => `<span class="pd-eff ${dir}"><span class="pd-arrow">${dir === 'up' ? '\u25b2' : '\u25bc'}</span>${esc(label)}</span>`;
  const goalChip = (label) => { const g = goalByLabel[String(label).toLowerCase()]; return g
    ? `<a class="pd-goal" href="/goal/${g.id}">${esc(g.icon || '')} ${esc(g.label)}</a>`
    : `<span class="pd-goal">${esc(label)}</span>`; };
  const on = (spec.on || []).map((x) => chip(x, 'on')).join('');
  const off = (spec.off || []).map((x) => chip(x, 'off')).join('');
  const up = (spec.up || []).map((x) => eff(x, 'up')).join('');
  const down = (spec.down || []).map((x) => eff(x, 'down')).join('');
  const goals = (spec.goals || []).map(goalChip).join('');
  if (!(on || off || up || down)) return '';
  return `<div class="pdiagram">
    <div class="pd-legend"><b>How to read this map.</b> Left = what flips this system on or off. Middle = the system itself. Right = what it changes in your body.</div>
    <div class="pd-flow">
      <div class="pd-col">${on ? `<div class="pd-coltitle green">Switches it ON</div><div class="pd-chips">${on}</div>` : ''}${off ? `<div class="pd-coltitle red">Switches it OFF</div><div class="pd-chips">${off}</div>` : ''}</div>
      <div class="pd-arrowcol"><span class="pd-flowarrow"></span></div>
      <div class="pd-hubwrap"><div class="pd-hub">${esc(hub)}</div></div>
      <div class="pd-arrowcol"><span class="pd-flowarrow"></span></div>
      <div class="pd-col">${up ? `<div class="pd-coltitle">Turns UP</div><div class="pd-chips">${up}</div>` : ''}${down ? `<div class="pd-coltitle">Turns DOWN</div><div class="pd-chips">${down}</div>` : ''}</div>
    </div>
    ${goals ? `<div class="pd-goals"><span class="pd-goalslbl">Helps with</span>${goals}</div>` : ''}
  </div>`;
}


// ---- SECTION SPLIT + CHECKPOINT (2026-07-28) -------------------------------------------------
// Felix: "in each of the broken up sections, add visual interactions or something to help the user
// synthesize the information better."
//
// What I tested and REJECTED first, so the reasoning is on the record:
//  - Linking the ALL-CAPS terms: only 3% of the 2,076 distinct terms resolve to a page, and the
//    most frequent are AND / NOT / THE / BOTH — emphasis, not vocabulary. No link layer exists.
//  - Pairing each section with its authored "you can now explain X" statement: the counts are
//    almost exactly 1:1 (491 sections, 510 statements) and keyword matching hits 85%, but the
//    arrays are only 20% ORDER-ALIGNED, so a specific claim would be attached to the wrong
//    section most of the time. A visibly wrong "you can now explain this" costs more trust than
//    the device buys.
//
// What survives is honest and covers every section: split the rendered prose so a reader meets one
// idea at a time, and end each section with a checkpoint that forces the "do I actually have this?"
// decision. Nothing is hidden from crawlers (<details> keeps content in the DOM) and no word moves.
function splitSection(html, keep) {
  const s = String(html || '');
  // Paragraph boundaries first — the common case.
  const parts = s.split(/(?<=<\/p>)/).filter((x) => x.trim());
  if (parts.length > keep + 1) {
    return { head: parts.slice(0, keep).join(''), rest: parts.slice(keep).join(''), n: parts.length - keep };
  }
  // LIST FALLBACK (2026-07-28). Measured: 35% of /pathway/6's deep-dive words sit inside a single
  // <ul> — section 5 is 91% list, 558 of 612 words — versus 6% on /muscle/biceps. Counting only
  // </p> meant the splitter did nothing at all on exactly the sections the owner kept calling
  // walls, while appearing to work everywhere else. Same treatment, 6x different effect: that is
  // why one page felt fixed and the other did not.
  const m = s.match(/^([\s\S]*?)<(ul|ol)([^>]*)>([\s\S]*?)<\/\2>([\s\S]*)$/);
  if (m) {
    const [, before, tag, attrs, inner, after] = m;
    const items = inner.split(/(?<=<\/li>)/).filter((x) => x.trim());
    if (items.length > keep + 1) {
      return {
        head: `${before}<${tag}${attrs}>${items.slice(0, keep).join('')}</${tag}>`,
        rest: `<${tag}${attrs}>${items.slice(keep).join('')}</${tag}>${after}`,
        n: items.length - keep,
      };
    }
  }
  return { head: s, rest: '', n: 0 };
}

function sectionCheckpoint(id, label) {
  return `<div class="dd-check"><label><input type="checkbox" class="ddc"><span>I've got this</span></label>` +
    `<span class="ddc-hint">${label}</span></div>`;
}

// ---- PARTS IN THE FLAT DOCUMENT (2026-07-30) -------------------------------------------------
// The prerendered course page is 9,513 words labelled "41 min read" as ONE continuous scroll,
// while the SPA presents the identical content as six named chapters. It is not structureless —
// it has a contents card and 18 anchored headings — but it gives the reader no sense of PARTS, so
// "41 minutes" reads as one indivisible obligation rather than six things.
// Deliberately NOT <details> around each part: collapsing 9,500 words in the crawled document is
// the 85%-hidden defect this project spent two days removing. This is pure typography — a labelled
// divider at each boundary. Nothing hides, nothing moves, no word changes, and the reader gets the
// same map the app gives them.
function partDivider(n, total) {
  // The labels live INSIDE the function on purpose. As a module-level `const` they were in the
  // temporal dead zone when learnFlatHtml ran during module execution — the fifth time a
  // use-before-initialization has bitten this file (DATA_DIR twice, mdWc, GLOSSARY, now this).
  // `node --check` catches none of them; only running the build does.
  const L = ['The big picture', 'The mechanism', 'Going deeper', 'How an expert reasons', 'Prove it'];
  // W5b (2026-08-02): "of 5" WAS A LIE ON 260 DOCUMENTS. Five dividers are written below but four
  // of them are conditional on the entry actually having that content, and the numbers were
  // hardcoded 1..5 — so a page carrying only parts 1, 2 and 5 printed "Part 1 of 5", "Part 2 of 5",
  // "Part 5 of 5" and the reader spent the whole page looking for parts 3 and 4, which do not
  // exist in that document. Measured in the prerendered document: 103/103 /target and 157/171 /c
  // = 260 routes. The count is now deferred to renumberParts() below, which counts the dividers
  // this page actually emitted. Same words, a true number.
  return `<div class="lf-part" role="separator" data-part-label="${esc(L[n - 1])}">`
    + `<span class="lf-part-n"></span><span class="lf-part-t">${L[n - 1]}</span></div>`;
}
// Second pass, because the total is not knowable until the last conditional block has run.
// One regex over the whole emitted block, one counter, so the visible label and the accessible
// name can never disagree — they are written from the same two numbers in the same replacement.
function renumberParts(html) {
  const RE = /<div class="lf-part" role="separator" data-part-label="([^"]*)"><span class="lf-part-n"><\/span>/g;
  const total = (html.match(RE) || []).length;
  if (!total) return html;
  let i = 0;
  return html.replace(RE, (m, label) => {
    i++;
    return `<div class="lf-part" role="separator" aria-label="Part ${i} of ${total}: ${label}">`
      + `<span class="lf-part-n">Part ${i} of ${total}</span>`;
  });
}

function learnFlatHtml(e, opts) {
  if (!e) return '';
  const P = (t) => mdBlocks(t, mdSafe);
  const out = [];
  // Nothing to divide if there is nothing to show. Pushing the divider unconditionally gave 13
  // multi-compound bundle entries an otherwise-empty learn section (learn-flat pages 305 -> 318).
  const _hasAny = !!(e.hook || e.bigIdea || e.analogy || e.fundamentals
    || (Array.isArray(e.mechSteps) && e.mechSteps.length) || (Array.isArray(e.deepDive) && e.deepDive.length)
    || e.expertLens || (Array.isArray(e.myths) && e.myths.length) || (Array.isArray(e.selfTest) && e.selfTest.length));
  if (!_hasAny) return '';
  // — 30 seconds —
  out.push(partDivider(1, 5));
  if (e.hook && e.hook.payoff) out.push(`<div class="lf-payoff">${mdBlocks(e.hook.payoff, mdSafe)}</div>`);
  if (opts && opts.diagram) out.push(opts.diagram);
  if (e.bigIdea) out.push(`<h2>The big idea</h2>${P(e.bigIdea)}`);
  if (Array.isArray(e.hook && e.hook.questions) && e.hook.questions.length) {
    out.push(`<h2>Questions this answers</h2><ul>${e.hook.questions.map((q) => `<li>${mdSafe(q)}</li>`).join('')}</ul>`);
  }
  // — 5 minutes —
  if (e.analogy) out.push(`<h2>An analogy that holds up</h2>${P(e.analogy)}${(e.widgets || {}).analogy || ''}`);
  if (e.fundamentals) out.push(`<h2>The fundamentals underneath it</h2>${P(e.fundamentals)}${(e.widgets || {}).fundamentals || ''}`);
  if (Array.isArray(e.mechSteps) && e.mechSteps.length) {
    // Lead with the animated cascade, THEN the steps. The picture is the map; the prose is the
    // detail you go to once you know where you are. This order was the whole point of the
    // progressive-disclosure work and the mechanism section was still doing it backwards.
    out.push(partDivider(2, 5));
    out.push('<h2>How it actually works, step by step</h2>');
    if (e.cascade) out.push(e.cascade);
    out.push(`<ol class="lf-steps">${e.mechSteps.map((m) => {
      const t = m.t ? `<b>${mdSafe(m.t)}</b>` : '';
      // Split the step description like every other prose block. It was going through mdSafe()
      // alone, so a 95-word multi-sentence description shipped as one paragraph inside the reveal.
      const d = m.d ? mdBlocks(m.d, mdSafe) : '';
      const fx = m.fx ? `<div class="lf-fx">${mdSafe(m.fx)}</div>` : '';
      // PREDICT-THEN-REVEAL. 235 of 340 mechSteps carry an authored `predict` prompt and this
      // renderer referenced it ZERO times, so the best learning device in the corpus reached only
      // the ~10% of readers who run JS. <details> is native: no JavaScript, works everywhere.
      // REGRESSION FIX (2026-07-28, same day I shipped the bug). Putting the step TITLE inside the
      // <details> meant "How it actually works, step by step" rendered as nine question boxes and
      // nothing else: 787 of 1,101 words collapsed, 0 step titles visible, in the document ~90% of
      // readers get. A reader who scrolled to the mechanism was shown no mechanism.
      // The title and its effect line now always render; only the explanation sits behind the
      // prompt. The spine of the cascade is visible whether or not anyone opens anything.
      // NOTE on the prompts themselves: `predict` is authored as a LOOK-AHEAD on some pages
      // (pathway:gaba-glutamate is 9/9 look-ahead — step 1 asks which ion triggers release, which
      // is step 2) but as a same-step check on most others (a random sample of 10 across courses,
      // compounds and targets came out 3 look-ahead / 7 same-step). So there is NO global
      // off-by-one to apply — shifting every prompt would break the ~70% that are already correct.
      // Keeping the title visible is what makes both kinds survivable: the reader can always see
      // where they are in the sequence, so a forward-looking prompt reads as a bridge, not a
      // mismatch. Logged for a proper per-step pass.
      const head = `<div class="ms-head">${t}${fx}</div>`;
      const pred = m.predict
        ? `<details class="pred"><summary>${mdSafe(m.predict)}</summary><div class="pred-a">${d}</div></details>`
        : `<div class="ms-body">${d}</div>`;
      return `<li>${head}${pred}</li>`;
    }).join('')}</ol>`);
  }
  // — the deep layer —
  if (Array.isArray(e.myths) && e.myths.length) {
    // Same defect, 1,127 myths on 302 pages: the claim and its correction printed together, so the
    // reader never has to decide whether they believed it. Stating a belief before it is corrected
    // is most of what makes a myth stick.
    out.push(`<h2>Common misconceptions</h2><div class="lf-myths">${e.myths.map((m) =>
      `<details class="pred myth"><summary>${mdSafe(m.myth || '')}</summary><div class="pred-a">${mdSafe(m.truth || '')}</div></details>`).join('')}</div>`);
  }
  if (Array.isArray(e.deepDive) && e.deepDive.length) {
    // ---- DEEP-DIVE REBUILD (2026-07-28) ------------------------------------------------------
    // This block is ~48% of a course page and was the only major field with no design applied to
    // it: one generic <h2>Going deeper</h2> followed by 9-11 near-identical <h3> + prose runs.
    // Measured on /pathway/6 and /muscle/biceps: 22-25 consecutive mobile screens with no visual,
    // no link and no interactive element. That is the wall.
    //
    // Three changes, none of which touch a word of the content:
    //  1. h3 -> h2. The authored headings are excellent ("The gabapentin lie, and other names that
    //     deceive") and were buried a level down, where the type scale renders them at 16.32px
    //     against 16px body text in the SAME colour — a bold line, not a landmark. Promoting them
    //     also puts them in the contents card, which is where they earn their keep.
    //  2. A numbered eyebrow, "Deep dive · 3 of 11". Deleting the "Going deeper" wrapper removes
    //     the only signal that a new KIND of content has begun, and 11 more h2 with no grouping is
    //     its own problem. The counter restores the boundary and adds the finiteness the page had
    //     nowhere else: the reader can see there is an end.
    //  3. A visible DECK — the section's own first sentence, promoted to larger type between the
    //     heading and the body. Verified on 432 of 491 sections (88%) at a <=32-word gate; median
    //     18 words. The sentence MOVES, it is not duplicated, so nothing is added and nothing is
    //     hidden. Deliberately NOT <details>: collapsing 141,932 words one day after this site
    //     finished un-hiding an 85%-hidden document would be the same mistake wearing a new hat.
    const ddSplit = (body) => {
      const t = String(body || '').trim();
      const sents = mdSentences(t);
      if (sents.length < 2) return { deck: '', rest: t };
      const first = sents[0];
      if (mdWc(first) > 32) return { deck: '', rest: t };
      return { deck: first, rest: t.slice(t.indexOf(first) + first.length).trim() };
    };
    const n = e.deepDive.length;
    out.push(partDivider(3, 5));
    out.push(e.deepDive.map((d, i) => {
      const { deck, rest } = ddSplit(d.body);
      return `<section class="dd">
        <p class="dd-eyebrow">Deep dive · ${i + 1} of ${n}</p>
        <h2>${mdSafe(d.h || '')}</h2>
        ${deck ? `<p class="dd-deck">${mdSafe(deck)}</p>` : ''}
        ${/* THE WIDGET GOES BEFORE THE PROSE, NOT AFTER (2026-07-30).
              Measured: 73% of pathway sort items and 59% of muscle ones had their label AND their
              rationale appearing verbatim in the paragraph immediately above them. A quiz whose
              answer you have just read is not a quiz — it is more words, which is precisely the
              "wordy" complaint. Asked BEFORE the prose, the same widget becomes a reason to read:
              you commit, then the section pays it off. Zero content changes, pure ordering. */ ''}
        ${((e.widgets || {})[String(i)]) || ''}
        ${(() => {
          const sp = splitSection(P(rest), 2);
          return sp.rest
            ? `${sp.head}<details class="dd-more"><summary>Keep going — ${sp.n} more ${sp.n === 1 ? 'part' : 'parts'} of this idea</summary>${sp.rest}</details>`
            : sp.head;
        })()}
        ${sectionCheckpoint(`${i}`, 'Ticked sections fade, so the page shows you what is left')}
      </section>`;
    }).join(''));
  }
  if (e.expertLens) out.push(partDivider(4, 5) + `<h2>How an expert reasons with this</h2>${P(e.expertLens)}${(e.widgets || {}).expertLens || ''}`);
  // RETRIEVAL DEVICES (added 2026-07-28). I originally left selfTest and canExplain out as
  // "checklists, not exposition". A design review pushed back and was right: retrieval practice IS
  // learning content, and their absence is a large part of why a 7,500-word page still reads as
  // thin. 15,565 words of it were crawler-invisible. What makes the page feel like a course is not
  // more prose — it is the question you cannot yet answer, and the claim you can now make.
  if (Array.isArray(e.canExplain) && e.canExplain.length) {
    out.push(partDivider(5, 5) + `<h2>What you can explain after this</h2><ul class="lf-can">${e.canExplain.map((c) => `<li>${mdSafe(c)}</li>`).join('')}</ul>`);
  }
  if (Array.isArray(e.selfTest) && e.selfTest.length) {
    // PARITY FIX. app.js:1588 already renders these answers behind a reveal; this renderer printed
    // them in a <dl> right under the question. 1,137 questions across 305 pages whose entire
    // retrieval value was destroyed by the markup — and once again the PRERENDERED document, the
    // one ~90% of readers get, was the degraded twin. Same defect class as the pathway diagram
    // that rendered on 0 of 16 pages. A question with its answer printed beneath it is not a
    // question, it is prose.
    out.push(`<h2>Check yourself</h2><div class="lf-test">${e.selfTest.map((t) =>
      `<details class="pred qa"><summary>${mdSafe(t.q || '')}</summary><div class="pred-a">${mdSafe(t.a || '')}</div></details>`).join('')}</div>`);
  }
  if (Array.isArray(e.connections) && e.connections.length) {
    out.push(`<h2>What this connects to</h2><dl class="lf-conn">${e.connections.map((c) =>
      `<dt>${mdSafe(c.to || '')}</dt><dd>${mdSafe(c.why || '')}</dd>`).join('')}</dl>`);
  }
  return out.length ? `<section class="learn-flat">${renumberParts(out.join(''))}</section>` : '';
}

D.pathways.forEach((p, i) => {
  const route = '/pathway/' + i;
  const pwFact = factByHref['/pathway/' + i];
  const pwFactHtml = pwFact ? `<div class="cpd-fact"><span class="cf-k">💡 Did you know?</span> <span class="cf-t">${pwFact.t}</span></div>` : '';
  add(route, shell({ route, title: `${p.shortLabel} pathway explained · RNAwiki`, desc: `The ${p.shortLabel} pathway in plain English, and the compounds that pull it.`, ogImage: renderOgCard(`og/pathway/${i}.png`, { kind: 'Pathway', title: p.shortLabel, sub: p.oneLine || '' }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: p.shortLabel, route }], body: `<div class="article"><h1>${esc(p.shortLabel)}</h1>${pwFactHtml}${p.html || ''}${learnFlatHtml(p.expand, { diagram: pathwayDiagramHtml(p.diagram, p.shortLabel) })}</div>` }));
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
const learnScaffold = (m) => {
  if (!m.learn) return '';
  const t = (m.learn.takeaways || []).length ? `<div class="learn-takeaways"><div class="lt-h">✅ Key takeaways</div><ul>${m.learn.takeaways.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
  const q = (m.learn.quiz || []).length ? `<div class="learn-quiz"><div class="lq-h">🧠 Check yourself</div>${m.learn.quiz.map((x, qi) => `<details class="lq-item"><summary><span class="lq-n">Q${qi + 1}</span> ${esc(x.q)}</summary><div class="lq-a">${esc(x.a)}</div></details>`).join('')}</div>` : '';
  return t + q;
};
D.modules.forEach((m, i) => {
  const route = '/learn/' + i;
  add(route, shell({ route, title: seoTitle(`${m.title.replace(/^MODULE\s*\d+\s*[—-]\s*/i, '')}`), desc: `Foundations: ${m.title}`, breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Foundations', route: '/learn' }], body: `<div class="article">${foundationsDiagram(i)}${m.html || ''}${learnFlatHtml(m.expand)}${learnScaffold(m)}</div>` }));
});

// ---- anatomy & physiology: crawlable muscle / energy-system / metabolism pages ----
const ANAT = D.anatomy || { muscles: [], energy_systems: [], metabolism: [] };
const anatCrumb = (name, route) => [{ name: 'Home', route: '/' }, { name: 'Anatomy', route: '/anatomy' }, { name, route }];

// ---- inline learning visuals (self-authored SVG + one verified embeddable 3D model; no fragile hotlinks) ----
// Default 3D viewer: "Anatomy of the Human Muscular System" by jossangelbd (Sketchfab, embeddable). A verified
// physiotherapist can override per-muscle by adding "model_embed" to that muscle in data/anatomy.json.
const MUSCLE_MODEL_DEFAULT = 'https://sketchfab.com/models/75cc6aa94b5c4ed88f9810770d614ac1/embed?ui_theme=dark&autospin=0.15&ui_infos=0&ui_watermark=0&ui_hint=0&transparent=0';
function muscle3D(m, legFma, legName) {
  // LEG groups have a first-party BodyParts3D model that lights this muscle's origin/insertion bones and
  // animates its action — a far better teacher than a generic stock render, and FMA-keyed to this page.
  // Promote it. Groups without their own geometry keep the Sketchfab viewer (it works); an unbuilt one
  // shows the "being added" note. The CTA opens on ONE representative sub-muscle (legName), so the copy
  // names it rather than claiming the whole group lights up.
  if (legFma) return `<h2>This muscle in 3D</h2>
    <a class="cta-3d cta-3d-hero" href="/body/leg?fma=${encodeURIComponent(legFma)}">
      <span class="cta-3d-hero-ico" aria-hidden="true">🦿</span>
      <span class="cta-3d-hero-txt"><b>Open the interactive 3D leg</b><span>Opens on the ${esc((legName || m.name).toLowerCase())} — its origin and insertion bones light up and it moves through its action. Every ${esc(m.name.toLowerCase())} muscle is tappable there too.</span></span>
      <span class="cta-3d-hero-go" aria-hidden="true">▶</span>
    </a>
    <p class="fig-credit">A first-party 3D model built from BodyParts3D (© DBCLS, CC-BY-SA), FMA-keyed to the anatomy on this page — not a generic render.</p>`;
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
  // Granular sub-muscles (structures.json) whose groupId is this group — crawlable, both documents.
  const subs = (D.structures || []).filter((s) => s.groupId === m.id);
  const LEG3D_M = { quadriceps: 1, hamstrings: 1, glutes: 1, calves: 1 };
  const f3dM = subs.find((s) => s.fma);
  const legFmaM = (LEG3D_M[m.id] && f3dM) ? f3dM.fma : null; // the first-party 3D now leads muscle3D()
  const legNameM = (LEG3D_M[m.id] && f3dM) ? f3dM.name : null;
  const subHtml = subs.length ? `<h2>The individual muscles in this group</h2>
    <p>“${esc(m.group || m.name)}” is really several separate muscles. Here is each one — where it runs, what it does, and how to find it on your own body.</p>
    <div class="submuscle-list">${subs.map((s) => `<div class="submuscle"><h3>${esc(s.name)}${s.plainName ? ` <span class="sm-plain">${esc(s.plainName)}</span>` : ''}</h3><p class="sm-oi"><span class="sm-k">Runs from</span> ${esc((s.origin && s.origin.attachTo) || '—')} <span class="sm-k">to</span> ${esc((s.insertion && s.insertion.attachTo) || '—')}</p>${(s.actions && s.actions.length) ? `<p class="sm-act"><span class="sm-k">What it does</span> ${esc(s.actions.join('; '))}</p>` : ''}${s.locate ? `<p class="sm-locate"><span class="sm-k">Find it on yourself</span> ${esc(s.locate)}</p>` : ''}${(s.fma && LEG3D_M[m.id]) ? `<p class="sm-3d"><a href="/body/leg?fma=${encodeURIComponent(s.fma)}">See the ${esc(s.name.toLowerCase())} in the interactive 3D leg →</a></p>` : ''}</div>`).join('')}</div>` : '';
  const body = `<div class="article"><h1>${esc(m.name)}</h1><p>${esc(m.overview)}</p>
    ${muscle3D(m, legFmaM, legNameM)}
    <h2>Anatomy</h2><p><b>Muscles:</b> ${esc(m.group)}</p><p><b>Origin:</b> ${esc(a.origin || '')}</p><p><b>Insertion:</b> ${esc(a.insertion || '')}</p>
    <h2>What this muscle actually does</h2>
    <p>Each movement below is animated — the grey part stays still, the teal part is what this muscle moves.</p>
    <div class="afig-grid">${(a.action_figures || []).join('') || (a.actions || []).map((x) => `<p>${esc(x)}</p>`).join('')}</div>
    ${subHtml}
    <h2>How the muscle works</h2><p>${esc(m.mechanism)}</p>
    <p><b>Fibre-type bias:</b> ${esc(m.fiber_bias)}</p><p><b>Functional role:</b> ${esc(m.functional_role)}</p>
    <h2>Common problems</h2><ul>${(m.common_problems || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>Training & stretching</h2><p>${esc(m.training || '')}</p><p>${esc(m.stretching || '')}</p>
    ${(m.problems || []).length ? `<h2>Fix or train this</h2><ul>${m.problems.map((pid) => { const pr = GRAPH.problems.find((x) => x.id === pid); return pr ? `<li><a href="/protocol/${pid}/${pr.root_causes[0].id}">${esc(pr.name)}</a></li>` : ''; }).join('')}</ul>` : ''}${learnFlatHtml(m.expand)}</div>`;
  add(route, shell({ route, title: seoTitle(`${m.name}: anatomy, function and training`), desc: seoDesc(m.overview || ''), ogImage: renderOgCard(`og/muscle/${m.id}.png`, { kind: 'Muscle · ' + (m.region || ''), title: m.name, sub: m.overview }), breadcrumbs: anatCrumb(m.name, route), body }));
});
// /body and /body/leg — crawlable shell for the 3D body map (Move 7). The <canvas> is a JS-only
// enhancement (app.js mountBody lazy-loads bodymap.js); this prerendered page is a real muscle index
// for Google + the ~90% no-JS traffic, per the two-document rule.
(function addBodyShell() {
  // Keep this list in sync with bodyShell() in site/app.js. tibialis-anterior is browsable in 3D but
  // has no group page, so its "(full page)" link is guarded by MUSCLE_GROUP_IDS (a dead link would
  // fail assertLinkGraph). No "peel back the layers" — there is no layer control in the UI.
  const legGroups = ['quadriceps', 'hamstrings', 'glutes', 'calves', 'tibialis-anterior'];
  const legSubs = legGroups.reduce((acc, g) => acc.concat((D.structures || []).filter((s) => s.groupId === g)), []).filter((s) => s.fma);
  const twin = legSubs.map((s) => `<li><a href="/body/leg?fma=${encodeURIComponent(s.fma)}">${esc(s.name)}</a>${s.plainName ? ' — ' + esc(s.plainName) : ''}${MUSCLE_GROUP_IDS.has(s.groupId) ? ` <a href="/muscle/${esc(s.groupId)}">(full page)</a>` : ''}</li>`).join('');
  const body = `<div class="article body-shell"><h1>Interactive 3D body — the leg</h1>
    <p>Spin a 3D anatomical model of the leg and tap any muscle to see the bones it attaches to — origin and insertion — and watch it move. This page lists every muscle in the model; the interactive 3D above is an enhancement for capable devices.</p>
    <div id="bm-canvas" class="bm-canvas"></div>
    <h2>The leg muscles</h2><ul class="body-twin">${twin}</ul>
    <p><a href="/anatomy">← All muscle groups</a></p></div>`;
  // /body and /body/leg were byte-identical and each self-canonicalised, so we published two URLs
  // claiming to be the canonical version of the same page. /body/leg is the one with a model behind
  // it; /body is the hub. Both are emitted (the SPA routes both), but /body/leg carries the canonical
  // and /body is marked noindex so only one competes.
  ['/body', '/body/leg'].forEach((route) => add(route, shell({
    route,
    canonical: '/body/leg',
    robots: route === '/body' ? 'noindex,follow' : undefined,
    title: seoTitle('Interactive 3D body: the muscles and how they move'),
    desc: seoDesc('Rotate a 3D leg model and tap any muscle to see the bones it attaches to — origin and insertion — and watch it perform its action, on the body.'),
    breadcrumbs: anatCrumb('Interactive 3D body', '/body/leg'), body })));
})();
// /where — "Where does it hurt?" reverse funnel (Move 4). Text index is the crawlable/a11y core; the
// SVG is an aria-hidden visual map. Both prebuilt in parse.js so this matches the hydrated document.
(function addWhere() {
  if (!D.bodyWhereIndex) return;
  const body = `<div class="article where-page"><div class="kicker">Start from your body</div><h1>Where does it hurt?</h1>
    <p class="where-lead">Point to where it hurts — knee, lower back, neck, hip, shoulder, ankle, elbow — and see the likely cause, the protocol, and a 3-question cause-finder.</p>
    <div class="where-wrap"><div class="body-where">${D.bodyWhereSvg || ''}</div>${D.bodyWhereIndex}</div>
    <p class="where-foot"><a href="/body">Or explore the muscles in 3D →</a></p></div>`;
  add('/where', shell({ route: '/where', title: seoTitle('Where does it hurt? Find the cause and the fix'), desc: seoDesc('Point to where it hurts — knee, lower back, neck, hip, shoulder, ankle, elbow — and get the likely cause, the protocol, and a 3-question cause-finder. Free.'), breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Where does it hurt?', route: '/where' }], body }));
})();
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
    <p><b>Byproduct:</b> ${esc(e.byproduct)}</p><p><b>Recovery:</b> ${esc(e.recovery)}</p><p><b>Training:</b> ${esc(e.training)}</p>${learnFlatHtml(e.expand)}</div>`;
  add(route, shell({ route, title: seoTitle(`${e.name}: how it fuels muscle`), desc: seoDesc(e.overview || ''), ogImage: renderOgCard(`og/energy/${e.id}.png`, { kind: 'Energy system', title: e.name.split('(')[0].trim(), sub: e.plain || e.overview }), breadcrumbs: anatCrumb(e.name, route), body }));
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
    ${(() => { const cs = (p.compounds || []).map((n) => findCpt(n)).filter(Boolean); const seen = new Set(); const u = cs.filter((c) => !seen.has(c.id) && seen.add(c.id)); return u.length ? `<h2>Compounds that act on this</h2><ul>${u.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a></li>`).join('')}</ul>` : ''; })()}${learnFlatHtml(p.expand)}</div>`;
  add(route, shell({ route, title: seoTitle(`${p.name}: the physiology in plain English`), desc: seoDesc(p.plain || p.overview || ''), ogImage: renderOgCard(`og/physiology/${p.id}.png`, { kind: 'Physiology', title: p.name, sub: p.plain || p.overview }), breadcrumbs: anatCrumb(p.name, route), body }));
});
{
  const route = '/anatomy';
  // W5b (2026-08-02): D36, the 17th starved reference route. Measured: 95 prerendered body words
  // against 370 fully-expanded hydrated (ratio 0.26). The reader's tiles carry the exercise and
  // stretch counts per muscle, each energy system's duration and intensity, and the one-line plain
  // English for each metabolism page; the crawler got three lists of bare names. Every field below
  // is the one the SPA tile already shows — anatomyIndex() in site/app.js — so this adds no claim
  // the reader is not already given.
  const body = `<div class="article"><h1>Anatomy &amp; physiology</h1><p>The body behind the protocol — muscles, the energy systems that fuel them, and the metabolism behind every food and supplement.</p>
    <h2>Energy systems</h2><p>How muscles are powered, from a one-second max effort to an all-day walk.</p>
    <ul>${ANAT.energy_systems.map((e) => `<li><a href="/energy/${e.id}">${esc(e.name)}</a>${e.duration ? ` — ${esc(e.duration)}` : ''}${e.intensity ? `, ${esc(e.intensity)}` : ''}${e.fuel ? `. Fuel: ${esc(e.fuel)}` : ''}</li>`).join('')}</ul>
    <h2>Metabolism &amp; physiology</h2><p>How the body makes and manages its fuel — the science under every nutrition and supplement protocol.</p>
    <ul>${ANAT.metabolism.map((p) => `<li><a href="/physiology/${p.id}">${esc(p.name)}</a>${p.plain || p.overview ? ` — ${esc(snip(p.plain || p.overview, 180))}` : ''}</li>`).join('')}</ul>
    <h2>Muscles</h2><p>The anatomy, mechanics and training of every major muscle group.</p>
    <ul>${ANAT.muscles.map((m) => `<li><a href="/muscle/${m.id}">${esc(m.name)}</a>${m.region ? ` — ${esc(m.region)}` : ''}${m.exercise_count || m.stretch_count ? `, ${m.exercise_count || 0} exercise${(m.exercise_count || 0) === 1 ? '' : 's'} and ${m.stretch_count || 0} stretch${(m.stretch_count || 0) === 1 ? '' : 'es'}` : ''}</li>`).join('')}</ul></div>`;
  add(route, shell({ route, title: seoTitle('Anatomy & physiology: muscles, energy, metabolism'), desc: seoDesc('The body behind the protocol: every major muscle, the energy systems that fuel movement, and the metabolism behind nutrition and supplements — in plain English.'), breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Anatomy', route }], body }));
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
  add('/learn', shell({ route: '/learn', title: 'Learn — how the body works and how to read RNAwiki', desc: seoDesc('A guided primer: start from your goal, follow it down to the movement, food, compound, target and pathway. Energy systems, metabolism and muscle anatomy in plain English.'), breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Learn', route: '/learn' }], body }));
}
{ // Stack builder
  const top = D.compounds.slice().sort((a, b) => b.stars - a.stars).slice(0, 40);
  add('/stack', shell({ route: '/stack', title: seoTitle('Stack Builder: combine and check interactions'), desc: 'Build a supplement stack, see combined goal coverage, shared pathways and synergy, and flag prescription vs OTC — then save and share it. Singapore.', breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Stack', route: '/stack' }], body: `<div class="article"><h1>Stack Builder</h1><p>Add compounds from any page, see combined goal coverage, the pathways you're hitting and shared targets, and which items need medical supervision. Your stack saves locally and is shareable by link.</p><h2>Popular compounds to stack</h2><ul>${top.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a> — ${stars(c.stars)}</li>`).join('')}</ul></div>` }));
}

// solve hub
// FIXED 2026-07-28: this listed only root_causes[0] of each problem, so of the 52 protocol pages
// exactly 41 had a funnel entry and the other 11 were reachable only from a compound page or the
// sitemap. Every root cause is its own page with its own protocol, so list them all -- and name the
// cause, because "Knee pain" three times is not a useful set of links to a crawler or a reader.
// /solve, the funnel entrance, in the CRAWLER document. Two jobs it did not do before:
//   1. It listed 52 protocol links and ZERO /problem links, so the differential -- the thing that
//      answers "which of my 4-7 possible causes is it" -- was not reachable from the entrance in
//      either document. Now every problem leads with /problem/{id}; its protocols nest under it.
//   2. The home hero is a real <form action="/solve" method="get">, so the ~90% of readers who
//      never run JS arrive here at /solve?q=<their words>. This page had no field showing what they
//      typed and no acknowledgement of it: /solve and /solve?q=knee%20pain were byte-identical,
//      16,222 B each (curl, 2026-08-01). The hidden #q-hits / #q-none blocks below are what
//      server.js reveals and orders for those readers -- see searchSolve in server.js. They are
//      authored HERE so the words have one source; the server only injects a <style> and fills two
//      text slots, exactly as it already does for the newsletter notice on "/".
// NOTE for anyone editing the strings below: server.js matches `id="q-hits"`, `id="q-none"`,
// `<em class="q-term"></em>` and the input's attribute run VERBATIM. Reword them there too.
const solveCardPre = (p) => {
  const nc = ((p.why && p.why.causes) || []).length;
  const nr = p.root_causes.length;
  return `<div class="solve-card" data-kind="${p.kind}" data-pid="${esc(p.id)}">`
    + `<a class="s-main" href="/problem/${p.id}" data-native>`
    + `<span class="s-ico" aria-hidden="true">${p.icon || '•'}</span>`
    + `<span class="s-body"><b>${esc(p.name)}</b>`
    + `<small>${esc(p.category)} · ${p.kind === 'want' ? 'goal' : 'problem'}</small>`
    + `<span class="s-diff">${nc} possible cause${nc === 1 ? '' : 's'} · ${nr} with a protocol</span>`
    + `<span class="s-go">See which one fits you →</span></span></a>`
    + `<div class="s-rcs"><span class="s-rcs-k">Already know the cause?</span>`
    + p.root_causes.map((rc) => `<a class="s-rc" href="/protocol/${p.id}/${rc.id}">${esc(rc.name.replace(/\s*\([^)]*\)/, ''))}</a>`).join('')
    + `</div></div>`;
};
const solveCats = [...new Set(GRAPH.problems.map((p) => p.category))];
add('/solve', shell({ route: '/solve', title: 'Solve a problem or reach a goal — protocol engine · RNAwiki', desc: `Name the problem or goal. See its likely causes first — ${GRAPH.problems.length} problems, ${GRAPH.problems.reduce((a, p) => a + ((p.why && p.why.causes) || []).length, 0)} documented causes — then one Move · Fuel · Stack protocol for the cause you pick.`, breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }], body: `<h1>Stop guessing. Start solving.</h1>`
  + `<p>Name the problem you want to fix or the goal you want to reach. You get the likely causes first — because the same symptom has different causes and they need different fixes — then one protocol for the cause you pick: the movement to fix it, Singapore foods to fuel it, and evidence-ranked compounds to support it.</p>`
  + `<form class="solve-q" action="/solve" method="get" role="search"><label class="sr-only" for="solve-q">Describe the problem or goal in your own words</label>`
  + `<input id="solve-q" name="q" type="search" value="" autocomplete="off" spellcheck="false" placeholder="In your own words — &quot;sore knee going downstairs&quot;">`
  + `<button class="cta-primary" type="submit">Find it →</button></form>`
  + `<p class="where-cta"><a href="/where">🧍 Not sure what it's called? Point to where it hurts →</a></p>`
  + `<section class="q-panel" id="q-hits"><h2 class="q-h">Closest match for <em class="q-term"></em></h2>`
  + `<div class="solve-grid q-list">${GRAPH.problems.map(solveCardPre).join('')}</div>`
  + `<p class="q-all"><a href="#solve-all">Not it? All ${GRAPH.problems.length} problems and goals ↓</a></p></section>`
  + `<section class="q-panel q-empty" id="q-none"><h2 class="q-h">Nothing here matches <em class="q-term"></em></h2>`
  + `<p>RNAwiki covers ${GRAPH.problems.length} problems and goals. Yours is not one of them yet. Point to where it hurts and work back from the body, or read the full list below.</p>`
  + `<p class="q-acts"><a class="q-alt" href="/where">🧍 Point to where it hurts →</a></p></section>`
  + `<h2 class="solve-all-h" id="solve-all">All ${GRAPH.problems.length} problems and goals</h2>`
  + solveCats.map((cat) => `<div class="solve-section"><h3>${esc(cat)}</h3><div class="solve-grid">${GRAPH.problems.filter((p) => p.category === cat).map(solveCardPre).join('')}</div></div>`).join('') }));

// ---- THE HOME PAGE: ONE DOCUMENT, ONE SOURCE -------------------------------------------------
// Written to home.html. server.js serves it for "/", and site/app.js CAPTURES it at boot rather
// than rendering a second copy (see HOME_HTML there). Until 2026-07-30 there were TWO
// hand-maintained home pages -- `homeBody` here and `home()` in app.js -- and they had drifted
// into genuinely different pages: this one had no search input and no seed chips, so the ~90% of
// traffic that never runs JavaScript could not use the page's FIRST call to action at all, while
// the SPA had no problem list and no crawlable goal labels. That is the sixth recorded instance on
// this project of a prerendered page and its hydrated twin drifting apart. There is now no twin:
// this string is the only definition of the home page that exists.
//
// The page is a funnel with exactly two conversion targets and nothing else:
//   CTA #1  the protocol search in the hero, plus pre-filled chips (which ARE CTA #1, pre-typed)
//   CTA #2  the newsletter -- the MAIN ask -- stated once in full, once as a closing line
//
// Cut from this document, with the reason each cut costs nothing:
//   * the 7-category / 52-link "Start a protocol" farm -- all 52 hrefs are byte-identical to the
//     ones on /solve (verified: 0 links on home are absent from /solve), and /solve is in the
//     topbar nav AND the footer of all 514 pages, so every protocol page stays 2 hops from home.
//   * `.why-rna` -- 108 words of brand etymology. It answers "why is this site called RNAwiki?",
//     which is nobody's reason for arriving. Moved verbatim to /about, which is prerendered and
//     already holds the site's disclaimer. Nothing is destroyed.
//   * `.how-3` -- the same three steps as the worked example, told abstractly. One explanation of
//     one thing, and the concrete one wins.
//   * `#home-stat` (empty renderer) and `.home-stacks-sec` (/api/forks/popular returns [] since the
//     demo forks were deleted; measured 0px tall). Both rendered nothing in either document.
{
  const RX_CLASS = new Set(['prescription', 'controlled', 'unapproved']);

  // ---- the worked example ---------------------------------------------------------------------
  // Replaces the `.scrolly` scrollytelling block. Measured at 1440x900 before removal: 1800px, or
  // 40% of a 4,549px page, for 160 words and zero calls to action. It revealed nothing on scroll,
  // because `.sy-step{opacity:.62}` dims steps rather than hiding them -- every word was already
  // legible at first paint, so two screens of scrolling changed only the opacity. Its height was
  // `200vh`, a function of the viewport rather than of its content. Below 820px
  // `.scrolly-stage{display:none}` removed the phone mock, which was its only explanatory element,
  // so on a phone it explained nothing. And it lived only in app.js, so 90% of readers never saw
  // the site's single best argument at all.
  //
  // `/pros` still uses .scrolly / .scrolly-track / .scrolly-stage / .sy-step / .sy-frame / .sy-bar /
  // .sy-dots / .phone / .pf-bar. NONE of those rules are touched. This block is namespaced `.wex-`.
  //
  // EVERY FIGURE HERE IS READ FROM THE RECORD THAT RENDERS /protocol/knee-pain/patellofemoral-pain.
  // The old mock hard-coded "Protein 1.6 g/kg" while the protocol page says 100 g -- a fabricated
  // number in the demo of an evidence site. The fix is not to correct the constant, it is to stop
  // having a constant: rc.prescription, rc.nutrient_targets, rc.keystone and protoStack(rc) are the
  // same accessors the protocol page uses, so the demo cannot contradict the product. If the record
  // changes, this block changes with it.
  const WEX = (() => {
    const p = GRAPH.problems.find((x) => x.id === 'knee-pain');
    const rc = p && (p.root_causes || []).find((r) => r.id === 'patellofemoral-pain');
    if (!p || !rc || !rc.prescription || !rc.nutrient_targets || !rc.keystone) {
      // Hard gate, deliberately. This is the home page's central explanatory block; dropping it
      // silently would leave a landing page that asks for an email having demonstrated nothing.
      // package.json prestart is `node build/parse.js && node build/prerender.js` with no
      // `|| echo`, so exiting here stops the deploy -- which is the correct outcome.
      console.error('[prerender] FATAL: the home worked example requires knee-pain / '
        + 'patellofemoral-pain to carry prescription, nutrient_targets and keystone. '
        + 'Repair the record, or repoint WEX at another root cause.');
      process.exit(1);
    }
    const short = (s) => esc(String(s).replace(/\s*\([^)]*\)/, ''));
    // The three options are this problem's real root causes, in data order.
    const opts = p.root_causes.map((r) => `<li${r.id === rc.id ? ' class="on"' : ''}>${short(r.name)}${r.id === rc.id ? '<b>&#10003;</b>' : ''}</li>`).join('');
    // protoStack() already excludes prescription / controlled / unapproved compounds, so this block
    // can never advertise a prescription-only medicine no matter what is authored into rc.compounds.
    const stack = protoStack(rc);
    const stackLine = stack.map((c) => `${esc(c.name)} ${stars(c.stars)}`).join(' &middot; ');
    const T = Object.entries(rc.nutrient_targets);
    const foods = protoFuel(rc).slice(0, 3).map((f) => f.name).join(', ');
    // Illustrative fill levels for the tracker. Labelled as an example day in .wex-fine below --
    // they are the one thing on this block that is not read from the corpus, so they are named.
    const FILL = [82, 64, 95, 71];
    // Name, TARGET VALUE, an example fill, and the authored reason the target exists. The target
    // value is the number the old hard-coded mock got wrong, so it is rendered straight from
    // rc.nutrient_targets and it appears exactly once on the page -- here, next to its reason.
    const bars = T.map(([k, t], i) => {
      const w = FILL[i % FILL.length];
      return `<li><span>${nutrientLabel(k)} <b>${t.target}${t.unit}</b></span><em>${w}%</em>`
        + `<i class="wex-bar" style="--w:${w}%"></i><small>${esc(t.why || '')}</small></li>`;
    }).join('');
    return `
    <section class="wex" id="how-it-works" aria-labelledby="wex-h">
      <p class="wex-kick">One real search, start to finish</p>
      <h2 id="wex-h">Someone typed <span class="wex-q">knee pain going downstairs</span>.<br>This is everything the site handed back.</h2>
      <ol class="wex-chain">
        <li class="wex-card">
          <span class="wex-n">1</span>
          <h3>One question &mdash; not a diagnosis</h3>
          <p class="wex-ask">${esc(p.name)} has ${p.root_causes.length} root causes. Which one fits?</p>
          <ul class="wex-opts">${opts}</ul>
          <p class="wex-out"><span>Root cause</span><b>${esc(rc.name)}</b></p>
          <p class="wex-ks"><b>&#11088; If you do one thing:</b> ${esc(rc.keystone.one)}</p>
        </li>
        <li class="wex-card">
          <span class="wex-n">2</span>
          <h3>The protocol for <em>that</em> cause</h3>
          <p class="wex-line"><span class="pf-l mv">Move</span><b>${esc(rc.prescription.scheme)}</b><small>${esc(rc.prescription.detail)}</small></p>
          <p class="wex-line"><span class="pf-l st">Stack</span><b>${stackLine}</b><small>stars = strength of the <i>human</i> evidence for this use</small></p>
          ${/* The numbers deliberately do NOT appear here: they are stated once, in card 3, next to
                the reason each one exists. Listing them twice cost ~60px of duplicated list on a
                phone and said nothing the second time. */ ''}
          <p class="wex-line"><span class="pf-l fl">Fuel</span><b>${T.length} daily nutrient targets</b><small>hit from local food${foods ? ` &mdash; ${esc(foods)}` : ''}</small></p>
        </li>
        <li class="wex-card">
          <span class="wex-n">3</span>
          <h3>And <em>why</em> every number is there</h3>
          <ul class="wex-bars">${bars}</ul>
          <p class="wex-out"><span>What changes</span><b>You stop taking things on faith and start watching a number move.</b></p>
        </li>
      </ol>
      <p class="wex-foot">No account, no payment, nothing to buy. One sentence and one tap.
        <a class="wex-back" href="#top" data-scroll="top" data-focus-search>Do it with yours &rarr;</a></p>
      <p class="wex-fine">A real protocol from this site &mdash; <a href="/protocol/${p.id}/${rc.id}">read the whole thing</a>.
        The percentages in step 3 are an example day, not data. Educational, not medical advice.</p>
    </section>`;
  })();

  // ---- the goal index -------------------------------------------------------------------------
  // Unlike the 52 protocol links, these 16 cannot be cut: there is no /goals index page, and /az
  // and /browse carry zero /goal/ links (verified), so home is the only hub these 16 pages have.
  const goalLinks = D.goals.map((g) => {
    const inGoal = D.compounds.filter((c) => (c.goalIds || []).includes(g.id));
    const open = inGoal.filter((c) => !RX_CLASS.has(c.regulatory_class)).length;
    const rx = inGoal.length - open;
    // MEDICINES ACT 1975 s.51 -- this split is not decoration. A bare "18 compounds" under Lose Fat
    // when most of them are prescription-only is a promotional count for medicines the reader cannot
    // legally obtain, on the site's most promotional surface. It used to be computed twice, in two
    // slightly different wordings; now there is one definition and it reaches both documents.
    const label = rx ? `${open} you can buy &middot; ${rx} prescription-only`
      : `${open} compound${open === 1 ? '' : 's'}`;
    return `<li><a href="/goal/${g.id}"><span class="gi-i">${g.icon}</span><span class="gi-b">${esc(g.label)}</span><span class="gi-n">${label}</span></a></li>`;
  }).join('');

  // ---- seed chips ------------------------------------------------------------------------------
  // Real anchors to a real protocol page, so they work with JavaScript off -- that is the whole
  // reason they now live in this document. bindHome() upgrades them to the triage modal when JS is
  // running (preventDefault), which is what they did before, for the 10%.
  const SEEDS = ['Knee Pain', 'Trouble Falling Asleep', 'Brain Fog', 'Belly / Visceral Fat', 'Low Testosterone', 'Longevity / Healthspan'];
  const seedChips = SEEDS
    .map((n) => (GRAPH.problems || []).find((p) => p.name.toLowerCase() === n.toLowerCase()))
    .filter((p) => p && (p.root_causes || []).length)
    // /problem, not /protocol/<p>/<root_causes[0]>: a chip that names a PROBLEM must not silently
    // choose which of its 4-7 authored causes the reader has. 31 of the 41 problems ship exactly
    // one root cause, so `root_causes[0]` was a diagnosis dressed as a shortcut. data-native
    // because /problem is prerender-only (KEEP_PRERENDERED).
    .map((p) => `<a class="seed-chip" data-pid="${esc(p.id)}" href="/problem/${esc(p.id)}" data-native>${p.icon || ''} ${esc(p.name)}</a>`)
    .join('');
  const nProblems = (D.meta.counts && D.meta.counts.problems) || (GRAPH.problems || []).length;

  // ---- the newsletter, defined once and rendered twice ------------------------------------------
  // `full` carries the loss-framed copy and the Watanabe figures; the close block is a one-line
  // restatement so the page never terminates without an ask. Two placements of one CTA is not two
  // CTAs. The copy itself is unchanged -- it is loss-framed, cited to a live PMID, and US$-prefixed
  // so it cannot be misread as SGD.
  //
  // .nl-done / .nl-bad are the NO-JS COMPLETION STATE. /api/subscribe already answers a native form
  // post with a 303 to /?subscribed=1#newsletter (server.js), but this document had no confirmation
  // element for it to land on, and the SPA's copy of that message lived only in app.js -- so the
  // ~90% were redirected to a page that looked exactly as it had before they subscribed. server.js
  // un-hides the right one when it serves "/" with the query.
  const nlBlock = (source, full) => `
    <section class="nl-home${full ? '' : ' nl-close-sec'}"${full ? ' id="newsletter"' : ''}>
      <div class="nl-home-inner">
        <p class="nl-done">&#10003; You&rsquo;re in. Check your inbox for a welcome email &mdash; the one-click unsubscribe is in it, so you never have to hunt for one.</p>
        <p class="nl-bad">That email address didn&rsquo;t look right &mdash; try again.</p>
        <div class="nl-eyebrow">Free weekly &middot; no spam &middot; one click to leave</div>
        ${full ? `<h2>Medicine that doesn&rsquo;t work still sends you a bill.</h2>
        <p class="nl-lede">The evidence on what you were given is public. It just isn&rsquo;t written
        for you &mdash; so you pay, and you hope. That gap is not an accident of nature; it is the one
        thing standing between you and a decision you could have made yourself.</p>
        <div class="nl-cost">
          <div class="nl-fig"><b>US$2,481</b><span>the average extra cost, per person, when a
            prescription simply doesn&rsquo;t do its job</span></div>
          <div class="nl-fig"><b>16%</b><span>of the entire national health bill &mdash; US$528bn a
            year &mdash; spent on medication that didn&rsquo;t work as intended</span></div>
        </div>
        <p class="nl-src">Watanabe, McInnis &amp; Hirsch, <i>Annals of Pharmacotherapy</i> 2018 &middot;
          <a href="https://pubmed.ncbi.nlm.nih.gov/29577766/" rel="noopener">PMID 29577766</a>
          &middot; US figures. No Singapore equivalent has been published.</p>
        <p class="nl-turn">You cannot fix a health system. You can stop being the person it happens to.</p>`
      : `<h2>One email a week. It might be about something you are taking right now.</h2>`}
        <form class="nl-form" data-nl data-source="${source}" method="post" action="/api/subscribe" novalidate>
          <label class="sr-only" for="nl-e-${source}">Your email address</label>
          <input id="nl-e-${source}" class="nl-input" type="email" name="email" required
            autocomplete="email" inputmode="email" placeholder="you@example.com">
          <input type="hidden" name="source" value="${source}">
          <input class="nl-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button class="nl-btn" type="submit">Send me the weekly email &rarr;</button>
          <p class="nl-status" data-nl-status role="status" aria-live="polite"></p>
        </form>
        <p class="nl-fine">${full
      ? 'One email a week &mdash; what actually changed in the evidence for a drug or supplement you might be taking, in plain English. Not medical advice, and never a substitute for seeing a clinician.'
      : 'Unsubscribe in one click. Not medical advice.'}</p>
      </div>
    </section>`;

  // ---- the daily fact --------------------------------------------------------------------------
  // Kept, moved, relabelled. It is the only actual sample of the product on the page. It used to sit
  // at 17% depth, above the argument, where its job was to send the reader to /c/l-tyrosine -- i.e.
  // out of the funnel before either CTA. Below the newsletter and relabelled, the same block becomes
  // evidence of what subscribing gets you. The `.df-text` / `.df-link` hooks are load-bearing:
  // app.js patches those two nodes in place on hydration, because the stamp below is frozen at
  // deploy time and the fact is date-derived.
  const FACT = dailyFactObj();
  const factBlock = FACT ? `
    <section class="daily-fact">
      <div class="df-card">
        <div class="df-top"><span class="df-kicker">&#128161; A sample of what lands</span><span class="df-meta">one like this, free, every week</span></div>
        <p class="df-text">${FACT.t}</p>
        <a class="df-link" href="${FACT.href}">${esc(FACT.label)}</a>
      </div>
    </section>` : '';

  const homeBody = `
    <section class="hero funnel-hero" id="top">
      <div class="kicker">Free &middot; no account &middot; nothing here is for sale</div>
      <h1>You know what you were told to take.<br><span class="lead">You were never shown what it&rsquo;s for.</span></h1>
      <p class="hero-lead">Start from the other end. Name the problem &mdash; I&rsquo;ll show you the
      <b>root cause underneath it</b>, then the movement, the food and the compounds that act on
      <i>that cause</i>, each one ranked by how good the human evidence actually is. Not a shopping
      list. The reasoning you were never handed.</p>
      ${/* A REAL <form>, so CTA #1 exists for the ~90%: GET /solve?q=... lands on the prerendered
            52-link protocol index. bindHome() preventDefaults it and runs the existing
            suggestProtocols() / openIntake() path when JS is available. */ ''}
      <form class="funnel" id="hero-solve" action="/solve" method="get" role="search">
        <div class="funnel-search">
          <span class="fs-ico">&#128269;</span>
          <input id="hero-solve-input" name="q" type="text" autocomplete="off"
            placeholder="What&rsquo;s wrong, or what do you want to fix?"
            aria-label="What is wrong, or what do you want to fix?">
          <div id="hero-solve-out" class="funnel-out" hidden></div>
        </div>
        <button id="hero-solve-btn" class="cta-primary funnel-btn" type="submit">Show me the root cause &rarr;</button>
      </form>
      <div class="seed-row">${seedChips}<a class="seed-all" href="/solve">or see all ${nProblems} &rarr;</a></div>
      <p class="hero-note">Free &middot; no account &middot; <b>no affiliate links</b> &middot; says so out loud when the evidence is thin</p>
    </section>

    ${WEX}

    ${nlBlock('home', true)}

    ${factBlock}

    <section class="goal-index">
      <h2>Or start from a goal</h2>
      <p class="gi-sub">${D.goals.length} goals, ${D.compounds.length} compounds, ranked by the strength of
      the <b>human</b> evidence. Each one says up front what you can actually buy without a prescription.</p>
      <ul class="gi-list">${goalLinks}</ul>
    </section>

    ${nlBlock('home-close', false)}`;

  // write directly (not via add()) so "/home" never leaks into the sitemap; canonical is "/"
  fs.writeFileSync(path.join(SITE, 'home.html'), shell({
    route: '/', ogType: 'website',
    // W5b: was 77 chars — "…Precision root-cause health protocols". It is the one title on the site
    // that never went through seoTitle(), so it never met the 60-char budget every other page is
    // trimmed to, and Google cut it after "start solving." — losing the entire half that says what
    // the site is. Shortened rather than exempted: an exemption on the highest-traffic page is a
    // gate that does not cover the page that matters most. Same words, same order, 59 chars.
    title: 'RNAwiki — Stop guessing, start solving. Root-cause protocols',
    desc: seoDesc('Fix the root cause, not the symptom. Get a precision Move · Fuel · Stack protocol for pain, metabolic, sleep, hormonal, cognitive, longevity and performance goals — evidence-ranked, honest, in plain English.'),
    jsonld: [WEBSITE, ORG],
    breadcrumbs: [{ name: 'Home', route: '/' }],
    body: homeBody,
  }));
}

// ---- write files ----
let written = 0;
// ---- the five index pages that were in the sitemap but never prerendered -------------------
// Added 2026-07-28. /browse, /az, /about, /pathways and /legend were hand-appended to the sitemap
// below and never passed to add(), so all five served a ~3.5 kB empty SPA shell canonicalised to
// "/" — i.e. Google was told they existed, then given nothing. /about was worse than a soft-404:
// site/app.js deliberately rewrote the URL bar to "/" and rendered the homepage, discarding a fully
// authored aboutPage() that contains THE SITE'S ONLY DISCLAIMER. These are also the natural
// crawlable indexes for 170 compounds and 16 pathways, so leaving them blank forfeited the site's
// best internal-linking surface.
{
  const cnt = D.meta.counts || {};
  const cats = [...new Set(D.compounds.map((c) => c.category).filter(Boolean))].sort();
  const byCat = {};
  D.compounds.forEach((c) => { (byCat[c.category] = byCat[c.category] || []).push(c); });
  const azSorted = D.compounds.slice().sort((a, b) => a.name.localeCompare(b.name));
  const letterOf = (n) => { const ch = n.replace(/^[^A-Za-z0-9]+/, '').charAt(0).toUpperCase(); return /[A-Z]/.test(ch) ? ch : '#'; };
  const byLetter = {};
  azSorted.forEach((c) => { (byLetter[letterOf(c.name)] = byLetter[letterOf(c.name)] || []).push(c); });
  const link = (c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a> — ${stars(c.stars)}</li>`;

  add('/about', shell({
    route: '/about', title: 'About RNAwiki — what it is, how it is made, and its limits',
    desc: seoDesc('RNAwiki is a free, evidence-ranked wiki of compounds, protocols and pathways, open to readers anywhere. What is inside, how it is built, how to read it — and what it is not.'),
    breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'About', route: '/about' }],
    body: `<div class="article"><h1>About RNAwiki</h1>
      <div class="disclaimer"><strong>Not medical advice.</strong> Everything here is educational. Nothing on this site recommends taking any substance. Prescription, controlled and non-approved compounds are documented for completeness, and documenting something is not endorsing it. If you have a health problem, see a clinician. In an emergency, call your local emergency number — <b>999</b>, <b>911</b>, <b>112</b>, <b>995</b> or <b>000</b> depending on where you are — or go to an emergency department.</div>
      ${/* MOVED HERE 2026-07-30 from the home page's `.why-rna` section, verbatim. It is good
            writing and it is not deleted -- but it answers "why is this site called RNAwiki?",
            which is not a question anyone arrives with, and on the landing page it cost the search
            box 330px of the reader's attention. Here it reaches someone who has already been
            served and may actually want it. */ ''}
      <h2>Why &ldquo;RNA&rdquo;? DNA is the blueprint. RNA is the builder.</h2>
      <p>Most people idolise DNA — the master code locked in the vault. But DNA does nothing on its own; a blueprint can't pour concrete. RNA is the action: the messenger and builder that reads your code and builds the proteins, tissue, and enzymes that become your physical reality. Every adaptation you force — a heavy lift, recovery from DOMS, a longevity protocol — is a wave of RNA translating your genes into a stronger, longer-lived you. RNAwiki is the messenger: it turns the foundational code of exercise science, biomechanics, and longevity into results you can use today.</p>
      <h2>What is inside</h2>
      <p><strong>${cnt.compounds || D.compounds.length} compounds</strong> across <strong>${cats.length} categories</strong>, <strong>${(GRAPH.problems || []).length} problems</strong> broken down into their root causes, and <strong>${(D.pathways || []).length} master pathways</strong> with their molecular targets. Each compound carries a plain-English explanation, the named receptor or enzyme it acts on, a link to the official gene or compound record, and an honest verdict.</p>
      <h2>How to use this site — start here</h2>
      <p><strong>Start from what you want to change, not from a compound.</strong> That is the one
      instruction that matters. Searching "ashwagandha" tells you about a plant. Starting from
      "I can't fall asleep" tells you which of the several different things causing that you
      actually have — and the fix is different for each.</p>
      <ol class="about-steps">
        <li><strong>Name the problem or goal.</strong> Go to <a href="/solve">Solve</a> and pick it.
        41 problems, each broken into its root causes.</li>
        <li><strong>Pick your root cause.</strong> Every problem lists 1–5. This is the step most
        health advice skips, and it is why most health advice fails: insomnia from a late body clock
        and insomnia from night-time cortisol need opposite interventions. If the description does
        not sound like you, open a sibling cause — they are linked at the bottom of every protocol.</li>
        <li><strong>Read the protocol in order: Move → Fuel → Stack.</strong> That order is
        deliberate. Movement and food change more, more cheaply and more safely, than any
        supplement. The Stack is last because it should be.</li>
        <li><strong>Check "When to reassess or see a doctor" before you start.</strong> It is on
        every protocol page. Some things on this site are not self-treatable and the page will say
        so plainly.</li>
        <li><strong>Follow the science down as far as you want.</strong> Each compound links to the
        <a href="/pathways">pathway</a> it works through and the molecular targets it acts on. That
        is the layer that turns a list of supplements into an understanding — learn one pathway and
        you have explained a whole family of compounds at once.</li>
      </ol>

      <h2>How to read the signals</h2>
      <ul class="about-key">
        <li><strong>★ Stars</strong> rate <em>human</em> evidence for a compound <em>overall</em>.
        They are not a grade for your specific goal, and they are not a prediction of how well it
        will work for you. Animal-only evidence is capped at two stars and labelled.
        <a href="/legend">Full key →</a></li>
        <li><strong>Badges</strong> say who <em>approved</em> a molecule. A badge is
        <em>not</em> a statement about where you can buy it — a medicine can be approved and still
        be prescription-only.</li>
        <li><strong>Availability</strong> is shown separately from approval — over the counter,
        pharmacy medicine, prescription only, controlled, or not approved.</li>
        <li><strong>Prescription medicines appear in a separate block</strong> headed "Medical
        options — discuss with a doctor". They are never in the Stack, never ranked, and never
        given a dose here. They are listed so you know they exist and can raise them with a
        clinician.</li>
        <li><strong>Where the evidence is thin, contested or animal-only, the page says so.</strong>
        Hedging is not weakness here — an unhedged claim is the thing to distrust.</li>
      </ul>

      <h2>What this site will not do</h2>
      <ul class="about-key">
        <li>It will not tell you what to buy, or name a brand to buy. Nothing is for sale and there
        are no affiliate links.</li>
        <li>It will not give doses for prescription medicines.</li>
        <li>It will not diagnose you. The root-cause quiz is a way to narrow reading, not a
        clinical assessment.</li>
        <li>It will not pretend to certainty it does not have.</li>
      </ul>

      <h2>How it is made, and its limits</h2>
      <p>Pages are drafted with AI assistance and edited by a human. <strong>They are not reviewed
      by a clinician.</strong> Star ratings summarise the human evidence for a compound overall, not
      for your specific use.</p>
      <p><strong>Found something wrong?</strong> That is the most useful thing you can send. Errors
      here should be fixed rather than defended — corrections are welcome and wanted.</p>

      <h2>Where to go next</h2>
      <ul><li><a href="/solve">Solve a problem or reach a goal</a></li><li><a href="/az">Every compound, A–Z</a></li><li><a href="/browse">Browse by category</a></li><li><a href="/pathways">The master pathways</a></li><li><a href="/learn">Start learning from the beginning</a></li></ul>
    </div>` }));

  add('/legend', shell({
    route: '/legend', title: 'Legend — what the stars, badges and colours mean · RNAwiki',
    desc: 'How to read RNAwiki: the 1–5 star human-evidence scale, the regulatory badges, and what each one does and does not claim.',
    breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Legend', route: '/legend' }],
    body: `<div class="article"><h1>How to read RNAwiki</h1>
      <h2>Evidence stars</h2>
      <p>Stars rate <strong>human</strong> evidence for a compound overall — not for your particular goal, and not how well it will work for you. Animal-only evidence is capped at two stars and labelled.</p>
      <ul>
        <li>${stars(5)} — consistent, replicated human trials</li>
        <li>${stars(4)} — good human evidence, some inconsistency</li>
        <li>${stars(3)} — mixed or limited human trials</li>
        <li>${stars(2)} — early, small, or animal-only evidence</li>
        <li>${stars(1)} — mechanistic or anecdotal only</li>
      </ul>
      <h2>Regulator status — the colours</h2>
      <p>A colour says what the <strong>FDA, or the relevant regulator for that molecule, currently calls it</strong>. <strong>It is not a statement about where you can buy it</strong>, and it is not anyone here's opinion. A medicine can be approved and still be prescription-only.</p>
      <ul>${Object.entries(D.approvalLabels || {}).map(([b, l]) => `<li><b>${b}</b> — ${esc(l)}</li>`).join('')}</ul>
      <h2>How you get it — the separate question</h2>
      <p>Availability is shown separately from approval, as its own statement on every compound: no prescription needed, over the counter, pharmacy medicine, prescription only, controlled, or not approved for human use. The classification shown is Singapore's, because that is the one regulator I track in full — it is a good guide almost everywhere, but check your own country's rules before assuming. Where a compound is prescription-only the page says so and gives no dose.</p>
      <h2>Who decides any of this</h2>
      <p>No clinician has reviewed these pages. Nothing here is a professional's opinion, an endorsement, or medical advice, and no colour or star should be read as one. The stars are an editorial rating of the published <strong>human</strong> evidence, applied by one consistent rule across every compound. The colours are not a judgement at all — they are a regulator's current call on that molecule, recorded rather than formed here. Where the two disagree they are shown disagreeing: a compound can be approved and still have weak evidence for what you want it for, and the reverse.</p>
      <p><a href="/methodology">How a page here is made →</a> · <a href="/corrections">Corrections →</a> · <a href="/about">More about how this site is made →</a></p></div>` }));

  // ---- /methodology and /corrections ---------------------------------------------------------
  // Added 2026-07-30. Every one of the 52 protocol pages ends with the line "Written with AI
  // assistance and edited by a human. Not yet reviewed by a clinician. How this page was made ·
  // Corrections" — and BOTH of those links pointed at routes that did not exist, in any form. No
  // static page, no SPA route, no server handler: they fell through to the SPA shell and served the
  // home page's title at HTTP 200. So the site invited scrutiny of its own method and of its own
  // errors, and sent every reader who accepted the invitation to a dead end. That is worse than
  // omitting the line: a broken "how was this made?" link is a claim of transparency with nothing
  // behind it. These two pages are the credibility spine the trust line was already promising.
  add('/methodology', shell({
    route: '/methodology', title: 'How a page on RNAwiki is made · RNAwiki',
    desc: seoDesc('The full method behind every page: where the writing comes from, what "AI-assisted, human-edited, not clinician-reviewed" actually means, how evidence is rated, and the automated checks that can refuse to publish.'),
    breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'How a page is made', route: '/methodology' }],
    body: `<div class="article"><h1>How a page here is made</h1>
      <p class="lede">Most health sites ask you to trust the output. This page describes the process
      instead, so you can judge it — including the parts that should make you cautious.</p>

      <h2>Who writes it</h2>
      <p>Pages are drafted with AI assistance and edited by a human. <strong>They are not reviewed by
      a clinician.</strong> That sentence appears at the foot of every protocol, and it is meant
      literally: no doctor, physiotherapist or dietitian has signed off on this content. If a page
      ever claims a professional reviewer, it is stating a fact about a specific named person — and
      no page does, today.</p>
      <p>Nothing here is written for a sponsor. Nothing is for sale, there are no affiliate links,
      and no commercial product or supplement brand is ever named as something to buy. Independent
      testing standards (NSF, USP, Informed Sport, IFOS) are named, because "look for third-party
      testing" is advice you can act on without being sold to.</p>

      <h2>Where the words come from</h2>
      <p>The site is generated, not hand-maintained page by page. A build step reads the source —
      markdown for the compound corpus, structured data files for causes, pathways, molecular
      targets, exercises and protocol plans — and writes every page from it. The consequence worth
      knowing: <strong>a correction made once propagates everywhere that claim appears</strong>, and
      an error made once does the same. That is why the automated checks below exist.</p>

      <h2>How evidence is rated</h2>
      <p>The 1–5 star rating summarises <strong>human</strong> evidence for a compound overall — not
      for your particular goal, and not how well it will work for you. Animal-only evidence is capped
      at two stars and has to say "animal" on the page. This is enforced at build time rather than by
      editorial discipline, because it had previously failed: one compound was showing five stars off
      rodent data. <a href="/legend">The full scale is on the legend page →</a></p>
      <p>Where a page cites a trial, the citation is bound to a real record and links out to it —
      usually PubMed or Europe PMC, where a large share of the papers are free to read in full. A
      citation here is a pointer you are meant to follow, not a decoration.</p>

      <h2>What I will not publish</h2>
      <ul class="about-key">
        <li><strong>No doses for prescription medicines.</strong> Prescription-only and controlled
        medicines are documented so you know they exist and can raise them with a clinician. They are
        listed, not ranked, and never recommended.</li>
        <li><strong>No head-to-head "which is better" comparison involving a prescription medicine.</strong>
        Ranking a medicine you cannot buy against a supplement you can is not a useful comparison, and
        in Singapore advertising a prescription-only medicine to the public is prohibited outright —
        the Medicines Act 1975 and its advertising regulations carry no educational exemption.</li>
        <li><strong>No diagnosis.</strong> The root-cause questions narrow your reading. They are not
        a clinical assessment.</li>
        <li><strong>No certainty I do not have.</strong> Where the honest answer is "no supplement has
        trial evidence for this", the page says that instead of filling the space.</li>
      </ul>

      <h2>The checks that can stop a release</h2>
      <p>Editorial rules that live only in someone's head get rediscovered as bugs. So the rules that
      matter most are executable, and a failure blocks publication rather than filing a ticket. The
      build currently refuses to ship if:</p>
      <ul class="about-key">
        <li>an animal-only compound shows more than two stars, or carries a rating badge that does not
        say "animal";</li>
        <li>a page names a prescription or controlled substance without stating that it is prescription
        or controlled;</li>
        <li>a restricted compound's page would render self-dosing instructions;</li>
        <li>a dose calculator lacks a machine-readable maximum (a milligram/gram slip once made one
        calculator understate a dose a thousandfold);</li>
        <li>a protocol would prescribe a movement that the same page tells you to avoid;</li>
        <li>an evidence claim is not bound to a record in the claims file;</li>
        <li>any compound is missing from the goal taxonomy;</li>
        <li>a machine-readable data block would be emitted in a form search engines silently discard;</li>
        <li>a page links to a route that does not exist, or a page is published with nothing linking
        to it;</li>
        <li>any page would claim a review, a verification or a professional credential — no expert has
        been verified here and no clinician has reviewed this content, so the build refuses to publish
        a sentence that says otherwise, and equally refuses to publish if the record of the false
        credentials this site once displayed is deleted from the corrections log.</li>
      </ul>
      <p>Each of these exists because that exact defect shipped at least once.</p>

      <h2>The limits you should hold in mind</h2>
      <ul class="about-key">
        <li>No clinician review. This is the largest one.</li>
        <li>A star rating is a summary of a literature, and summaries lose information. The page body
        is where the honest detail is; read it before acting on a number.</li>
        <li>Coverage is uneven. Some compounds have a deep evidence layer, others a short profile.</li>
        <li>Availability and regulatory status differ between countries and change over time, and this site is a snapshot. Where I state a legal classification it is Singapore's unless I say otherwise.</li>
      </ul>

      <h2>Found something wrong?</h2>
      <p>That is the most useful thing you can send. Errors here should be fixed rather than defended.
      <a href="/corrections" data-native>See what has already been corrected, and how to report one →</a></p>
      <p><a href="/legend">How to read the stars and badges →</a> · <a href="/about">About RNAwiki →</a></p>
      </div>` }));

  add('/corrections', shell({
    route: '/corrections', title: 'Corrections — what RNAwiki got wrong, and fixed · RNAwiki',
    desc: 'A public log of substantive corrections to published claims on RNAwiki, and how to report an error you have found.',
    breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Corrections', route: '/corrections' }],
    body: `<div class="article"><h1>Corrections</h1>
      <p class="lede">A site with no corrections page is not a site with no errors. This is the log of
      substantive corrections to published health claims — what was wrong, and what replaced it.</p>

      <h2>How to report one</h2>
      <p>Use the feedback link on any page, or write to
      <a href="mailto:hello@rnawiki.com">hello@rnawiki.com</a>. The most useful report names the page,
      quotes the sentence, and says what the source actually shows. You do not need to be polite about
      it and you do not need a credential.</p>
      <p>Claims are corrected at their source, so a fix propagates to every page that repeats it —
      usually within a day.</p>

      <h2>Corrections made</h2>
      <p>This log begins on 27 July 2026, when the site was first audited end to end. It covers
      corrections to published claims; routine editing and code changes are not listed.</p>

      <h3>A trial figure attributed to the wrong study</h3>
      <p>The clenbuterol page repeated a widely quoted "+39% fat oxidation" and attached it to the
      randomised controlled trial in healthy humans. The controlled trial reports no such thing — it
      measured a fat-mass change of 0.00 kg. The 39% comes from a separate open-label, uncontrolled
      study of six men, measured 140 minutes after a single dose. The number is now shown with its
      real source and its real design, next to the controlled result it was being used to dress up.</p>

      <h3>Animal data was earning human evidence ratings</h3>
      <p>The star rating was taking the highest evidence grade on a compound regardless of species, so
      compounds with strong rodent data and thin human data could display a high human-evidence rating.
      Rapamycin was the clearest case at five stars; it now shows three, which is what its human
      evidence supports. Animal-only compounds are capped at two stars and labelled, and the build
      refuses to publish if that is ever violated again.</p>

      <h3>Prescription medicines described as available over the counter</h3>
      <p>The site was reading a regulatory approval badge as if it were a supply classification. Seven
      prescription-only medicines consequently displayed as available from ordinary retailers, while a
      common vitamin displayed as prescription-only. Approval and availability are now separate fields
      and are stated separately.</p>

      <h3>A protocol prescribing the movement it told you to avoid</h3>
      <p>The rotator-cuff protocol listed an overhead press, on a page whose own advice was to avoid
      overhead loading. The exercise tags behind it had been assigned by muscle group rather than by
      function. Tags are now derived from the movement itself, and a protocol that would prescribe a
      movement it contraindicates fails the build.</p>

      <h3>A dose calculator returning milligrams where grams were correct</h3>
      <p>One calculator produced a result a thousand times too small. Every calculator now carries a
      machine-readable maximum and is checked at build time.</p>

      <h3>Anxiety listing no first-line treatment</h3>
      <p>The anxiety protocol discussed supplements without naming cognitive behavioural therapy or
      SSRIs — the treatments with the strongest evidence for the condition. Omitting them made the
      supplement evidence look stronger by comparison than it is. Both are now named.</p>

      <h3>A bone-health claim stated backwards</h3>
      <p>The menopause protocol inverted the direction of an effect on bone density. Corrected.</p>

      <h3>A triage questionnaire with no cardiac red flag</h3>
      <p>The neck-and-shoulder questionnaire screened for nerve and structural warning signs but not
      for the cardiac presentation its own escalation text opened with. It now screens for it, and
      withholds the protocol in favour of emergency advice when it fires.</p>

      <h3>A trial cited to the wrong journal</h3>
      <p>A phenibut trial was credited to <em>Drug Testing and Analysis</em>; it was published in
      <em>Pharmacopsychiatry</em>. The page body had the right journal in the text while the citation
      had the wrong one — the page was contradicting itself.</p>

      <h3>Microdosing conclusions drawn from full-dose trials</h3>
      <p>The psilocybin entry presented five trials together under a microdosing heading. Four used
      full 10–25 mg doses with psychological support; the one genuine microdosing trial — self-blinded,
      placebo-controlled, 191 completers — found the microdose and placebo groups improved equally.
      Nothing on the page distinguished them, so four strong full-dose results read as support for
      microdosing. The entry now states the distinction before the results.</p>

      <h3>Compounds ranked against the wrong goals</h3>
      <p>72 of 387 goal assignments were wrong, including a wakefulness-promoting drug ranked first
      under "Sleep Better". The taxonomy was rebuilt and is now checked at build time.</p>

      <h3>Reviewer credentials that were not real</h3>
      <p>This is the worst one, and it is published here because a corrections log that leaves out
      its worst entry is not a corrections log.</p>
      <p>The site displayed community protocols attributed to a <em>"verified physiotherapist"</em>,
      alongside other named contributor accounts. None of those people existed. The accounts and
      their content were seeded demonstration data, and the verification badge was not backed by any
      check — there was no verification process behind it at all. Everything in that cluster has
      been deleted.</p>
      <p>The wording around it went too. The site said verified clinicians stewarded protocols in
      their field, that a verified dietitian checked corrections to food data, that a verified
      physiotherapist could attach anatomy models, and that a verified expert would build a
      requested protocol. None of that was happening. There are no verified professionals here, no
      programme that verifies anyone, and no clinician has reviewed this content — which is what the
      line at the foot of every protocol page has always said, and is now the only thing the site
      says on the subject.</p>

      <h3>Citations audited end to end</h3>
      <p>Every citation in the corpus was checked against its record. Across two passes, 244
      citations were bound to verified sources, 58 claims were corrected to match what the source
      actually reports, and 8 were rejected outright and removed. Where no source could be found for a
      claim, the claim was removed rather than left standing.</p>

      <p><a href="/methodology" data-native>How a page here is made →</a> · <a href="/legend">How to read the stars →</a></p>
      </div>` }));

  // ---- /compare index ------------------------------------------------------------------------
  // Added 2026-07-30. Every one of the 119 comparison pages carried a breadcrumb to "/compare" —
  // in the visible trail AND in the BreadcrumbList data Google reads — and /compare was not a page.
  // Worse than a 404: serveMissing() answers anything under /compare with HTTP 410 Gone, which is
  // the correct answer for a withdrawn comparison and precisely the wrong one for the parent of a
  // live section. So each of the 119 pages told Google its own parent was permanently deleted.
  // The index also removes the last two link orphans: compound pages cap their comparison list at
  // eight, so a pair ranked ninth on BOTH of its compounds had nothing anywhere pointing to it.
  {
    const byGoal = new Map();
    comparePairs.forEach(({ a, b, goalId }) => {
      if (!byGoal.has(goalId)) byGoal.set(goalId, []);
      byGoal.get(goalId).push({ a, b, route: `/compare/${slug(a.name)}-vs-${slug(b.name)}` });
    });
    const groups = [...byGoal.entries()]
      .map(([gid, list]) => ({ g: goalById[gid], list: list.sort((x, y) => x.a.name.localeCompare(y.a.name)) }))
      .filter((x) => x.g)
      .sort((x, y) => y.list.length - x.list.length);
    const total = comparePairs.size;
    add('/compare', shell({
      route: '/compare', title: `Head-to-head: ${total} supplement comparisons · RNAwiki`,
      desc: seoDesc(`Every side-by-side comparison on RNAwiki — ${total} pairs of supplements that are used for the same goal, compared on human evidence, mechanism, safety and availability.`),
      breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Compare', route: '/compare' }],
      body: `<div class="article"><h1>Head-to-head comparisons</h1>
        <p class="lede">${total} pairs of compounds that people actually weigh against each other,
        because they are used for the same goal. Each page puts the two side by side on human
        evidence, mechanism, side effects, interactions and roughly what each costs.</p>
        <p>Only supplements and over-the-counter compounds are compared this way. I do not publish a
        "which works better" page that ranks a prescription or controlled medicine against a
        supplement — you cannot act on that comparison, and in Singapore advertising a
        prescription-only medicine to the public is prohibited. <a href="/methodology" data-native>How these pages
        are made →</a></p>
        <div id="cmp-tool"></div>
        ${groups.map(({ g, list }) => `<h2>${esc(g.label)}</h2>
          <p><a href="/goal/${g.id}">Everything for ${esc(String(g.label).toLowerCase())} →</a></p>
          <ul>${list.map((x) => `<li><a href="${x.route}">${esc(x.a.name)} vs ${esc(x.b.name)}</a></li>`).join('')}</ul>`).join('')}
        <p><a href="/az">Every compound, A–Z →</a> · <a href="/browse">Browse by category →</a></p>
        </div>` }));
  }

  // ---- /plan ---------------------------------------------------------------------------------
  // Added 2026-07-30. "My Plan" sits in the top navigation of all 521 pages, which made it the
  // single most-linked destination on the site — and it had never been prerendered. A reader
  // without JavaScript, which is roughly nine in ten, clicked it and got a blank white document;
  // Google was served the same blank document canonicalised to "/", i.e. told the most-linked page
  // on the site was a duplicate of the home page. The live plan genuinely needs JavaScript (it is
  // per-reader state), but "needs JavaScript to show YOUR plan" is not a reason to serve nothing to
  // everyone else: what a plan is, and how to start one, is ordinary explainable content. The SPA
  // replaces this the moment it boots, so a reader with a plan never sees it.
  add('/plan', shell({
    route: '/plan', title: 'My Plan — build one plan from your root cause · RNAwiki',
    desc: seoDesc('One plan, built from the root cause of your problem: the movements to fix it, the foods to fuel it, and the compounds with human evidence for it. Free, no account needed.'),
    breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'My Plan', route: '/plan' }],
    body: `<div class="article"><h1>My Plan</h1>
      <p class="lede">One plan, in one place, built from the <em>cause</em> of your problem rather
      than its name. Your plan lives in this browser — there is no account to create and nothing to
      pay.</p>
      <p><strong>If you already have a plan, it will appear here in a moment.</strong> It is stored
      on your own device, so it loads when the page does. If you are reading with JavaScript turned
      off, this page cannot show it — everything else below works either way.</p>

      <h2>How a plan gets built</h2>
      <ol class="about-steps">
        <li><strong>Name the problem or the goal.</strong> Start at <a href="/solve">Solve</a>, or
        <a href="/where">point to where it hurts</a> if you do not know what it is called.</li>
        <li><strong>Find which cause you actually have.</strong> Most problems here have several,
        and the fix is different for each — the same knee pain has a different answer depending on
        whether the tendon, the joint surface or the hip is driving it. Each protocol opens with a
        short set of questions that narrows it.</li>
        <li><strong>Start the plan.</strong> That pulls the movements, the foods and the
        evidence-ranked compounds for <em>that cause</em> into one list.</li>
        <li><strong>Work it, then reassess.</strong> Every protocol states how long to give it
        before you judge it, what "working" looks like, and the point at which the answer is a
        clinician rather than another supplement.</li>
      </ol>

      <h2>Start from something concrete</h2>
      <ul>
        <li><a href="/solve">Every problem and goal, with its root causes</a></li>
        <li><a href="/where">Point to where it hurts</a> — for pain you cannot name</li>
        <li><a href="/stack">The compound index</a> — if you already know what you are looking at</li>
        <li><a href="/az">All ${D.compounds.length} compounds, A–Z</a></li>
      </ul>

      <h2>What a plan is not</h2>
      <p>It is not a prescription and not a diagnosis. It is a reading list with an order, built
      from the same evidence the rest of the site shows you. Prescription and controlled medicines
      are never added to a plan and never dosed here. <a href="/methodology" data-native>How these
      pages are made →</a></p>
      </div>` }));

  add('/az', shell({
    route: '/az', title: `All ${D.compounds.length} compounds A–Z · RNAwiki`,
    desc: `Every compound on RNAwiki, listed A to Z with its human-evidence rating — supplements, prescription medicines and non-approved research compounds.`,
    breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'A–Z', route: '/az' }],
    body: `<div class="article"><h1>Every compound, A–Z</h1>
      <p>All ${D.compounds.length} compounds, with their human-evidence rating. <a href="/legend">What the stars mean →</a></p>
      ${Object.keys(byLetter).sort().map((L) => `<h2>${esc(L)}</h2><ul>${byLetter[L].map(link).join('')}</ul>`).join('')}</div>` }));

  add('/browse', shell({
    route: '/browse', title: 'Browse compounds by category · RNAwiki',
    desc: `Browse all ${D.compounds.length} compounds by category — nootropics, longevity, hormones, performance, recovery and more, each evidence-ranked.`,
    breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Browse', route: '/browse' }],
    body: `<div class="article"><h1>Browse by category</h1>
      <p>${D.compounds.length} compounds across ${cats.length} categories. Prefer to start from a problem instead? <a href="/solve">Start there →</a></p>
      ${cats.map((cat) => `<h2>${esc(cat)}</h2><ul>${byCat[cat].slice().sort((a, b) => b.stars - a.stars).map(link).join('')}</ul>`).join('')}</div>` }));

  // ---- newsletter landing page ---------------------------------------------------------------
  // Built for one job: get the email. Conversion decisions, and why each one:
  //  - ONE ask. No nav bait, no secondary CTA above the form.
  //  - The form is ABOVE the fold and needs ONE field. Every extra field costs signups, and a name
  //    is not needed to send a weekly email.
  //  - The headline promises a SPECIFIC thing, not "subscribe to our newsletter".
  //  - Objections are answered ON the page (how often, what it is not, how to leave) because the
  //    unanswered ones are what stop people typing.
  //  - Credibility is the site's REAL numbers only. No subscriber count, no testimonials, no
  //    "join N readers" — this site had a fabricated-credibility cluster removed on 2026-07-28 and
  //    is not getting another one. When there is nothing honest to boast about, boast about the
  //    work instead.
  //  - The form is prerendered, so it is visible before any JavaScript runs.
  const nCompounds = D.compounds.length;
  const n5 = D.compounds.filter((c) => c.stars === 5).length;
  const nLow = D.compounds.filter((c) => c.stars <= 2).length;
  const nAnimal = D.compounds.filter((c) => c.animalOnly).length;
  const nTrials = (() => { let n = 0; Object.keys(LEARN_RAW).forEach((k) => { const e = LEARN_RAW[k]; if (e && e.evi && Array.isArray(e.evi.trials)) n += e.evi.trials.filter((t) => t && t.ref).length; }); return n; })();
  const nPmid = (() => { let n = 0; Object.keys(LEARN_RAW).forEach((k) => { const e = LEARN_RAW[k]; if (e && e.evi && Array.isArray(e.evi.trials)) n += e.evi.trials.filter((t) => t && t.pmid).length; }); return n; })();
  const nProblems = (GRAPH.problems || []).length;
  const nProtocols = (GRAPH.problems || []).reduce((n, p) => n + (p.root_causes || []).length, 0);
  const signupForm = (source, cta) => `<form class="nl-form" data-nl data-source="${esc(source)}" novalidate>
      <label class="sr-only" for="nl-email-${esc(source)}">Your email address</label>
      <input id="nl-email-${esc(source)}" class="nl-input" type="email" name="email" required
             autocomplete="email" inputmode="email" placeholder="you@example.com" aria-describedby="nl-note-${esc(source)}">
      <input class="nl-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="nl-btn" type="submit">${esc(cta)}</button>
      <p class="nl-status" data-nl-status role="status" aria-live="polite"></p>
      <p class="nl-note" id="nl-note-${esc(source)}">One email a week. Unsubscribe in one click. No spam, ever.</p>
    </form>`;

  // /newsletter RETIRED 2026-07-28. The signup now lives on the home page, which is where the
  // reader already is. server.js 301s /newsletter -> / so the ~515 footer links and any shared
  // links keep working; the footer link itself now points at the home anchor.


  add('/pathways', shell({
    route: '/pathways', title: `The ${(D.pathways || []).length} master pathways · RNAwiki`,
    desc: seoDesc('The master signalling pathways behind every compound on RNAwiki — GPCR/cAMP, nuclear receptors, mTOR, AMPK, NO/cGMP and more, each with the compounds that act on it.'),
    breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Pathways', route: '/pathways' }],
    body: `<div class="article"><h1>The master pathways</h1>
      <p>Almost every compound here works through one of these. Learning the pathway once explains a whole family of compounds at a time — this is the layer that turns a list into an understanding.</p>
      <ul>${(D.pathways || []).map((p, i) => {
        const nm = String(p.name || p.title || ('Pathway ' + (i + 1))).replace(/^PATHWAY\s*\d+\s*[—-]\s*/i, '');
        const n = D.compounds.filter((c) => (c.pathwayIds || []).includes(i)).length;
        return `<li><a href="/pathway/${i}">${esc(nm)}</a>${n ? ` — ${n} compound${n === 1 ? '' : 's'}` : ''}</li>`;
      }).join('')}</ul>
      <p><a href="/learn">Start from the beginning →</a> · <a href="/about">About RNAwiki →</a></p></div>` }));
}

pages.forEach(({ route, html }) => {
  const file = path.join(SITE, route.replace(/^\//, '') + '.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html); written++;
});

// ---- W5b (2026-08-02): ONE HEAD, TWO DOCUMENTS -----------------------------------------------
// THE DEFECT. This site serves a prerendered document to a crawler and a client-rendered one to a
// reader, and until now each wrote its own <title> and description. Measured hydrated in headless
// Chrome at 1280x900 with a 900 ms settle over all 620 served routes (0 non-200, 0 pageerrors):
//   · 135 routes ended hydration with the tab reading "RNAwiki — translate the code of human
//     performance into real results" and 151 with the homepage description — every one of them
//     with a correct, specific prerendered <title> (0 of the 135 were generic before hydration).
//     Pure hydration loss: /az, all 41 /problem, all 17 /muscle, all 52 /fuel, /legend, /about …
//   · hydrated title == prerendered title on 127/620; description on 69/620.
//   · title != og:title in the SAME hydrated document on 493/620 — three different strings in one
//     head. /target/AR: <title> "AR — the molecular target and every compound that hits it",
//     og:title "AR: the compounds that hit it", description "AR: AR androgen receptor"
//     (a hard .slice(0,120) that stops mid-sentence) against og:description
//     "AR: AR androgen receptor. What it does, and every compound that acts on it."
//
// WHY A MAP AND NOT A SECOND COPY OF THE RULES. site/app.js used to derive its own titles from the
// corpus. That is two generators for one string, and they drifted on 493 of 620 routes without one
// line of either being wrong on its own — the classic two-sources-of-truth split this codebase
// keeps paying for. The head is now GENERATED ONCE, here, and READ by app.js. The map is not
// re-derived from the corpus either: it is parsed back out of the bytes that were just written to
// disk, so what app.js sets is definitionally what the crawler was served. assertHeadParity()
// below fails the build if any of that stops being true.
const HEAD_UNESC = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const headMap = {};
const headFrom = (route, html) => {
  const t = html.match(/<title>([\s\S]*?)<\/title>/);
  const d = html.match(/<meta name="description" content="([^"]*)"/);
  headMap[route] = [HEAD_UNESC(t ? t[1] : ''), HEAD_UNESC(d ? d[1] : '')];
};
pages.forEach(({ route, html }) => headFrom(route, html));
// "/" is written straight to home.html (so "/home" never leaks into the sitemap) and is therefore
// not in `pages`. It is the ONE route where the SPA default and the prerendered head were closest
// to each other and still not equal: the served home title is "RNAwiki — Stop guessing, start
// solving. Precision root-cause health protocols" and app.js's built-in default was "RNAwiki —
// translate the code of human performance into real results". Read it back off disk, same as the
// lastmod hash does.
try { headFrom('/', fs.readFileSync(path.join(SITE, 'home.html'), 'utf8')); } catch (e) { /* assertHeadParity fails loudly below */ }
fs.writeFileSync(path.join(SITE, 'head.js'),
  '// GENERATED by build/prerender.js — do not edit. One <title>/description per served route,\n'
  + '// parsed back out of the prerendered bytes so site/app.js cannot drift from the crawler.\n'
  + 'window.RNAWIKI_HEAD=' + JSON.stringify(headMap) + ';\n'
  + '// The /compare verdict paragraph, its goal label and goal id, per pair. Same reason: it is\n'
  + '// the text of the FAQPage JSON-LD answer AND the paragraph on the page, and two generators\n'
  + '// wrote it differently on 123 of 123 pairs.\n'
  + 'window.RNAWIKI_VERDICT=' + JSON.stringify(verdictByRoute) + ';\n'
  + '// W5d/D30: the sibling comparisons for each pair — [[compoundName, [[otherName, route], …]], …].\n'
  + '// Every /compare page contained exactly two /compare/ anchors and both were the breadcrumb:\n'
  + '// links to another PAIR were 0 on 123 of 123. Generated here so both documents draw the same\n'
  + '// edges from the same rule (top 4 per compound by evidence, then name).\n'
  + 'window.RNAWIKI_CMPSIB=' + JSON.stringify(siblingByRoute) + ';\n');
console.log('[prerender] wrote head.js — %d routes, %d KB', Object.keys(headMap).length,
  Math.round(fs.statSync(path.join(SITE, 'head.js')).size / 1024));

// ---- sweep stale output (Patch 8) ----
// The generator is otherwise additive-only: unpublishing a page (Patch 7, or the kill-list)
// removes it from `pages` but leaves its HTML on disk, still served on direct hit and still in
// Google's index. Delete any *.html under a generated root that we did NOT write this run.
// Never sweeps the SITE root itself — index.html / app.js / styles.css / data.js are hand-authored.
const writtenPaths = new Set(pages.map(({ route }) => path.join(SITE, route.replace(/^\//, '') + '.html')));
const genRoots = new Set(pages.map(({ route }) => route.replace(/^\//, '').split('/')[0])
  .filter((seg) => seg && fs.existsSync(path.join(SITE, seg)) && fs.statSync(path.join(SITE, seg)).isDirectory()));
let swept = 0;
(function () {
  const sweep = (dir) => { for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) sweep(p);
    else if (f.endsWith('.html') && !writtenPaths.has(p)) { fs.unlinkSync(p); swept++; } } };
  genRoots.forEach((r) => sweep(path.join(SITE, r)));
})();


// sitemap + robots
//
// PER-PAGE lastmod (2026-08-01). Until now every one of the 564 <url> entries carried the SAME
// value -- `new Date()` read at build time -- so the sitemap asserted that all 564 pages had
// changed, on every single build. Measured before the fix: with ZERO content edited and the build
// clock moved forward 9 days, all 564 lastmod values moved to 2026-08-09. `site/` is ephemeral on
// Railway (prestart regenerates it on every boot), so a container restart with no commit behind it
// re-stamped all 564 as well. Google's own documentation says it ignores lastmod on a site where
// the value is not consistently accurate, so this field was not merely useless here -- it was
// spending the one crawl-prioritisation signal a static site gets, on noise.
//
// A page's lastmod is now the date its own OUTPUT last changed. `build/lastmod.json` is the
// committed record of route -> [content hash, date]. If this build's hash matches the record, the
// recorded date is reused; if it differs, or the route is new, today is stamped and the record
// updated. COMMIT build/lastmod.json alongside any content change -- it is the only part of this
// that survives the ephemeral container. If it goes stale the failure mode is the OLD behaviour
// (a page restamped as changed when it was not), never a page claiming to be older than it is.
//
// TWO fields are normalised out of the hash. Both are stamped by the clock rather than authored,
// and leaving either in would make every page hash-different every day -- reinstating the exact
// bug this replaces:
//   1. JSON-LD "dateModified", which is BUILD_DATE (see line ~485) on every clinical page.
//   2. The home page's <section class="daily-fact">, which rotates on Date.now()/864e5. app.js
//      already re-patches .df-text/.df-link in place on hydration precisely because the build's
//      copy goes stale, so the build's copy is not treated as the document's content anywhere else
//      either. Rotating trivia is not a content revision.
const now = new Date().toISOString().slice(0, 10);
const LASTMOD_FILE = path.join(ROOT, 'build', 'lastmod.json');
const lastmodPrev = (() => {
  try { return JSON.parse(fs.readFileSync(LASTMOD_FILE, 'utf8')); } catch (e) { return {}; }
})();
const lastmodNext = {};
const lmHash = (html) => crypto.createHash('sha256').update(String(html)
  .replace(/"dateModified":"[^"]*"/g, '"dateModified":"@"')
  .replace(/<section class="daily-fact">[\s\S]*?<\/section>/, '<section class="daily-fact">@</section>'))
  .digest('hex').slice(0, 16);

const htmlByRoute = new Map(pages.map(({ route, html }) => [route, html]));
// "/" is written straight to home.html rather than via add() (so "/home" never leaks into the
// sitemap), which means it is not in `pages`. Read it back off disk -- it was written this run.
try { htmlByRoute.set('/', fs.readFileSync(path.join(SITE, 'home.html'), 'utf8')); } catch (e) { /* handled by the lmUnknown branch */ }

let lmKept = 0, lmMoved = 0, lmUnknown = 0;
function lastmodFor(route) {
  const html = htmlByRoute.get(route);
  if (html === undefined) { lmUnknown++; return now; } // no output to compare against: stamp today, which is the old behaviour
  const h = lmHash(html);
  const prev = lastmodPrev[route];
  const unchanged = !!(prev && prev[0] === h && /^\d{4}-\d{2}-\d{2}$/.test(prev[1]));
  const date = unchanged ? prev[1] : now;
  unchanged ? lmKept++ : lmMoved++;
  lastmodNext[route] = [h, date];
  return date;
}

const urls = ['/', '/solve', '/browse', '/az', '/about', '/learn', '/pathways', '/legend', ...pages.filter((p) => !p.noSitemap).map((p) => p.route)];
const uniq = [...new Set(urls)];

// ---- build-time assertion: THE ROUTE UNIVERSE MAY NOT SHRINK BY ACCIDENT ----------------------
// Added 2026-08-02 (W4.5). Every route on this site is generated, so the published set moves when
// the CORPUS moves — and nothing was watching that. Three URLs left the sitemap between 2026-08-01
// and 2026-08-02 with no line of output, no diff anyone would read as a deletion, and no decision:
//   /compare/creatine-monohydrate-vs-sodium-bicarbonate
//   /compare/sodium-bicarbonate-vs-vitamin-d3-k2
//   /compare/sodium-bicarbonate-vs-whey-casein-protein
// Re-filing EPO out of SARMs and into MUSCLE/STRENGTH (commit 3dbf586, an interaction-tag fix)
// pushed Sodium Bicarbonate from rank 8 to rank 9 of the `muscle` goal, and the comparison
// generator pairs a goal's top eight. A tag fix silently unpublished three indexed pages, and the
// server then answered them 410 Gone with a reason that was not true (commit c873c0c).
//
// GROWTH IS NEVER AN ERROR. Only SHRINKAGE is, because a route that disappears is a URL already in
// Google's index and already in somebody's history that now answers 404 or 410. Every drop must be
// written down in build/withdrawn.json — route -> [date, reason] — by a human who looked at it.
// The build does NOT record it for you: a record the build keeps for itself acknowledges nothing.
//
// STALE ENTRIES FAIL TOO. A route listed as withdrawn while it is being published is a false line
// in the one file that exists to be true, and that is exactly what happens when a ranking cut
// swings back.
//
// ORDER MATTERS: this runs BEFORE sitemap.xml and build/lastmod.json are written. lastmod.json is
// the only memory of what was published last time; overwriting it and then failing would erase the
// evidence and let the next run pass silently.
// PROVE IT by adding any route to build/lastmod.json that this build does not emit (or by deleting
// one of the three entries from build/withdrawn.json).
const WITHDRAWN_FILE = path.join(ROOT, 'build', 'withdrawn.json');
(function assertRouteUniverse() {
  const prev = Object.keys(lastmodPrev);
  const withdrawn = (() => {
    try { return JSON.parse(fs.readFileSync(WITHDRAWN_FILE, 'utf8')); } catch (e) { return {}; }
  })();
  const nowSet = new Set(uniq);
  const bad = [];
  if (prev.length) {
    const dropped = prev.filter((r) => !nowSet.has(r));
    const unrecorded = dropped.filter((r) => !withdrawn[r]);
    if (unrecorded.length) {
      console.error('\n[prerender] ROUTE UNIVERSE SHRANK — refusing to build.');
      console.error(`  ${prev.length} routes were published last build, ${uniq.length} are published now, and ${unrecorded.length} of the ${dropped.length} dropped route(s) are not written down.`);
      console.error('  These URLs are in the published sitemap that shipped, and will start answering 404/410:');
      unrecorded.slice(0, 20).forEach((r) => console.error('    ✗ ' + r));
      if (unrecorded.length > 20) console.error(`    … and ${unrecorded.length - 20} more`);
      console.error('\n  If that is intended, say so in build/withdrawn.json — one line each, with the real reason:');
      unrecorded.slice(0, 20).forEach((r) => console.error(`    ${JSON.stringify(r)}: [${JSON.stringify(now)}, "why"],`));
      console.error('  If it is NOT intended, the corpus moved under the generator. Find what changed rank.\n');
      bad.push('unrecorded');
    } else if (dropped.length) {
      console.log(`[prerender] route universe: ${prev.length} -> ${uniq.length}; ${dropped.length} route(s) dropped, all recorded in build/withdrawn.json.`);
    }
  }
  const resurrected = Object.keys(withdrawn).filter((r) => nowSet.has(r));
  if (resurrected.length) {
    console.error('\n[prerender] build/withdrawn.json IS STALE — refusing to build.');
    console.error('  These routes are listed as withdrawn and are being published by this very run:');
    resurrected.slice(0, 20).forEach((r) => console.error(`    ✗ ${r}  (recorded: ${JSON.stringify(withdrawn[r])})`));
    console.error('  Delete those lines. A withdrawal record that is not true is worse than no record.\n');
    bad.push('stale');
  }
  if (bad.length) process.exit(1);
  console.log(`[prerender] route universe OK — ${uniq.length} published, ${Object.keys(withdrawn).length} recorded withdrawal(s), 0 unaccounted drops.`);
})();

// Every file type this site publishes must be one server.js can name.
//
// A missing entry is invisible from the page: the bytes are correct, the status is 200, and nothing
// in the served document looks wrong. Only the label on the envelope is missing, and it falls back
// to application/octet-stream — "unknown binary file". That is exactly how sitemap.xml and
// robots.txt shipped for a month: Google Search Console answered "Invalid sitemap address" for a
// sitemap that was present, valid, and listing 564 URLs. A crawler cannot use a file it cannot
// identify, so the whole site stayed unindexed for a reason no page could show.
(function assertServedFileTypes() {
  const server = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
  const block = server.slice(server.indexOf('const TYPES = {'));
  const known = new Set((block.slice(0, block.indexOf('};')).match(/'(\.[a-z0-9]+)'\s*:/g) || [])
    .map((s) => s.match(/'(\.[a-z0-9]+)'/)[1]));

  const seen = new Map();                       // extension -> an example file, for the error text
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (/\.(br|gz)$/.test(e.name)) continue;  // precompressed twins inherit their source's type
      const ext = path.extname(e.name).toLowerCase();
      if (ext && !seen.has(ext)) seen.set(ext, path.relative(ROOT, full));
    }
  })(SITE);

  const missing = [...seen.entries()].filter(([ext]) => !known.has(ext));
  if (missing.length) {
    console.error('\n[prerender] SERVED FILE TYPE ASSERTION FAILED — refusing to build:');
    missing.forEach(([ext, example]) => console.error(
      `  ✗ ${example} is published, but server.js TYPES has no '${ext}' entry, so it would be sent as`
      + ` application/octet-stream. A crawler cannot identify it and the page itself looks fine.`));
    console.error('  Add the extension to TYPES in server.js. Do not delete the file to silence this.');
    process.exit(1);
  }
  console.log(`[prerender] served file types OK — ${seen.size} extension(s) published, every one named by server.js.`);
})();

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniq.map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${lastmodFor(u)}</lastmod><changefreq>weekly</changefreq><priority>${u === '/' ? '1.0' : u.startsWith('/protocol') || u.startsWith('/c/') ? '0.8' : '0.6'}</priority></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(SITE, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(SITE, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
// One route per line so a content change shows up as a readable diff, not a one-line blob.
fs.writeFileSync(LASTMOD_FILE, '{\n' + Object.keys(lastmodNext).sort()
  .map((r) => `  ${JSON.stringify(r)}: ${JSON.stringify(lastmodNext[r])}`).join(',\n') + '\n}\n');

console.log(`[prerender] wrote ${written} static pages + sitemap.xml (${uniq.length} urls) + robots.txt; swept ${swept} stale files`);
console.log(`[prerender] sitemap lastmod: ${lmKept} unchanged (date kept), ${lmMoved} changed -> ${now}${lmUnknown ? `, ${lmUnknown} with no prerendered output (stamped today)` : ''}`);

// ---- build-time assertion: ONE PAGEVIEW PER VISIT, AND ONLY EVER A TEMPLATE NAME --------------
// Added 2026-08-03 (W5.5). The pageview beacon had two properties nothing was watching, and one of
// them was already false.
//
// (1) EXACTLY ONE PAGEVIEW PER VISIT. route() is bound to BOTH `popstate` and `hashchange`, and
//     Chrome fires both for a single same-document fragment change, so route() ran twice for
//     something that is not a navigation at all. MEASURED HYDRATED at 390x844 and 1440x900 with
//     the A_CODE kill switch and the navigator.webdriver suppressor flipped in flight (the repo
//     was not modified to measure it), 0 pageerrors:
//       · clicking the SKIP LINK on /c/creatine-monohydrate — the first keyboard action available
//         on every page on this site — emitted ["/t/compound","/t/compound"];
//       · one "#red-flags" jump inside /protocol/knee-pain/knee-oa emitted
//         ["/t/protocol","/t/protocol"];
//       · with the root-cause overlay endpoint returning rows, ONE document load emitted two
//         pageviews on every route, because boot does `if (applyRcOverlay(ov)) route();` — that is
//         the production configuration, so every page on the site counted double;
//       · one legacy #/ hash-router navigation emitted two.
//     The fix is the `pathPart !== _aLastPath` guard at the pv call site in site/app.js. This gate
//     holds it there: exactly one RNA_A.pv() call site, and that call site guarded.
//
// (2) A PAGEVIEW MAY NEVER CARRY A URL, ONLY A TEMPLATE NAME. aTemplate() is an ALLOWLIST that
//     fails closed to /t/other, and that is the whole privacy argument for this beacon: a route
//     template added tomorrow and forgotten in A_TPL degrades to /t/other, it can never leak
//     /c/pde-5-inhibitors-… or /problem/erectile-dysfunction. A gate that only read app.js could
//     not see that, because the thing that has to fail closed is the PUBLISHED ROUTE SET, which
//     lives here. So this replays aTemplate() over all `uniq` published routes and refuses to
//     build if any of them resolves to anything that is not a literal public path or /t/<template>.
//     Today: 568 routes -> 28 distinct values, 0 outside the vocabulary, 0 segments uncovered.
//     Coverage is reported, never enforced: /t/other is the SAFE answer, so a new segment landing
//     there is a note to the maintainer, not a build failure. Enforcing coverage would create
//     pressure to add entries to A_TPL, which is the direction that leaks.
//
// PROVE IT by reintroducing either bug: drop the `pathPart !== _aLastPath` guard in site/app.js
// (check 1a/1b fails), add a second RNA_A.pv() call site (1c), or make aTemplate() return the raw
// path — e.g. `return '/' + parts.join('/')` — and this refuses to build naming the routes (2).
(function assertPageviewIntegrity() {
  const appSrc = fs.readFileSync(path.join(ROOT, 'site', 'app.js'), 'utf8');
  if (appSrc.indexOf('RNA_A') < 0) { console.log('[prerender] pageview gate: no analytics in site/app.js — nothing to check.'); return; }
  const bad = [];

  // --- (1) one pageview per visit ---
  const calls = (appSrc.match(/RNA_A\.pv\(/g) || []).length;
  if (calls !== 1) bad.push(`site/app.js has ${calls} RNA_A.pv() call site(s); there must be exactly 1. A second sender is a second pageview per visit, and nothing downstream can tell the two apart.`);
  const GUARD = "if (pathPart !== _aLastPath) { _aLastPath = pathPart; try { RNA_A.pv(parts); } catch (e) { } }";
  if (appSrc.indexOf(GUARD) < 0) bad.push(`the RNA_A.pv() call site is not guarded by the last-path check. route() re-runs on things that are not navigations — a fragment click fires popstate AND hashchange, and the root-cause overlay re-routes at boot — so without the guard one visit is counted two or three times. Restore exactly:\n      ${GUARD}`);
  const decls = (appSrc.match(/let _aLastPath\b/g) || []).length;
  if (decls !== 1) bad.push(`expected exactly 1 \`let _aLastPath\` declaration in site/app.js, found ${decls} — the guard's memory must be one variable in route()'s closure, or it resets and stops guarding.`);
  const listeners = ["window.addEventListener('popstate', route);", "window.addEventListener('hashchange', route);"].filter((s) => appSrc.indexOf(s) >= 0);
  if (listeners.length !== 2) bad.push(`expected route() to be bound to both popstate and hashchange, found ${listeners.length} of 2 — if that changed, re-measure the double-count before relaxing anything here.`);

  // --- (2) the beacon vocabulary vs the published route set ---
  // PIN aTemplate() ITSELF FIRST. The route replay below reconstructs aTemplate from A_PUBLIC and
  // A_TPL, so it can only prove that the VOCABULARY covers the corpus — it is blind to a change in
  // the function body. Measured: with only the replay in place, rewriting the fallback to
  // `return p;` (the whole URL, /c/pde-5-inhibitors-… and all) built green. So the three lines that
  // decide what leaves the browser are pinned verbatim, and the replay checks them against the
  // corpus. Both halves are needed; neither is sufficient.
  const ATPL_BODY = [
    '  function aTemplate(parts) {',
    "    const p = '/' + (parts || []).join('/');",
    '    if (A_PUBLIC.indexOf(p) >= 0) return p;',
    "    if (!parts || !parts.length) return '/';",
    "    return '/t/' + (A_TPL[parts[0]] || 'other');",
    '  }',
  ].join('\n');
  if (appSrc.indexOf(ATPL_BODY) < 0) bad.push(`aTemplate() in site/app.js is not the function this gate and docs/EVENT_SCHEMA.md describe. It is the single point where a reader's URL is turned into a template name, and every privacy claim about this beacon rests on its last line falling through to /t/other. Restore exactly:\n${ATPL_BODY.split('\n').map((l) => '      ' + l).join('\n')}`);
  const mPub = appSrc.match(/const A_PUBLIC = \[([\s\S]*?)\];/);
  const mTpl = appSrc.match(/const A_TPL = \{([\s\S]*?)\};/);
  if (!mPub || !mTpl) bad.push('could not parse A_PUBLIC / A_TPL out of site/app.js — this gate cannot verify what the beacon sends, so it refuses rather than passing blind.');
  else {
    const A_PUBLIC = (mPub[1].match(/'([^']+)'/g) || []).map((s) => s.slice(1, -1));
    const A_TPL = {};
    mTpl[1].replace(/\/\/[^\n]*/g, '').split(',').forEach((kv) => {
      const m = kv.match(/([A-Za-z_$][\w$]*|'[^']+')\s*:\s*'([^']+)'/);
      if (m) A_TPL[m[1].replace(/'/g, '')] = m[2];
    });
    if (!A_PUBLIC.length || !Object.keys(A_TPL).length) bad.push('A_PUBLIC or A_TPL parsed empty — refusing to build rather than declaring a vocabulary check that checked nothing.');
    // A_PUBLIC IS THE ONE PLACE A REAL URL MAY TRAVEL VERBATIM, so what may go in it is a rule, not
    // a judgement call. Every entry must be a single-segment path — an index, which names no
    // compound, condition, muscle or protocol. The moment a second segment is allowed, the list
    // stops being "routes that encode no health interest" and becomes an exemption anyone can widen
    // one line at a time, which is how an allowlist quietly becomes a blocklist.
    A_PUBLIC.filter((p) => p.split('/').filter(Boolean).length > 1).forEach((p) => {
      bad.push(`A_PUBLIC contains "${p}", which has more than one path segment. A deeper path names a specific compound, condition or protocol, and sending it verbatim discloses the reader's health interest — the exact thing this beacon is built to withhold. Only top-level index routes belong in A_PUBLIC; everything else goes through A_TPL.`);
    });
    // aTemplate(), replayed exactly as site/app.js defines it.
    const aTemplate = (parts) => {
      const p = '/' + parts.join('/');
      if (A_PUBLIC.indexOf(p) >= 0) return p;
      if (!parts.length) return '/';
      return '/t/' + (A_TPL[parts[0]] || 'other');
    };
    const emitted = new Map(), leaks = [], uncovered = new Map();
    uniq.forEach((r) => {
      const parts = r.split('?')[0].split('/').filter(Boolean);
      const t = aTemplate(parts);
      emitted.set(t, (emitted.get(t) || 0) + 1);
      if (!(A_PUBLIC.indexOf(t) >= 0 || t === '/' || /^\/t\/[a-z-]+$/.test(t))) leaks.push({ r, t });
      const seg = parts[0] || '';
      if (parts.length && A_PUBLIC.indexOf('/' + parts.join('/')) < 0 && !A_TPL[seg]) uncovered.set(seg, (uncovered.get(seg) || 0) + 1);
    });
    if (leaks.length) {
      bad.push(`${leaks.length} published route(s) would send something that is neither a literal public path nor /t/<template> — that is a URL leaving this site attached to a reader, and on this corpus a URL is a health disclosure. First offenders:\n` +
        leaks.slice(0, 8).map((x) => `      ${x.r}  ->  ${x.t}`).join('\n'));
    }
    if (!bad.length) {
      const cov = [...uncovered.entries()].sort((a, b) => b[1] - a[1]);
      console.log(`[prerender] pageview integrity OK — 1 guarded pv call site; ${uniq.length} published routes collapse to ${emitted.size} template values, 0 leaks, ${cov.length} segment(s) falling through to /t/other${cov.length ? ': ' + cov.map(([k, v]) => `/${k} x${v}`).join(', ') : ''}.`);
    }
  }

  if (bad.length) {
    console.error('\n[prerender] PAGEVIEW INTEGRITY GATE FAILED — refusing to build:');
    bad.forEach((m) => console.error('  ✗ ' + m));
    console.error('  Read docs/EVENT_SCHEMA.md. One visit is one pageview, and only a template name travels.');
    process.exit(1);
  }
})();

// ---- build-time assertion: A COUNT OF THE CORPUS MUST EQUAL THE CORPUS -------------------------
// Added 2026-08-02 (W4.5). The header search placeholder read "Search 170 compounds, protocols,
// terms…" on every one of the 568 prerendered documents, and site/index.html read "Search 170
// compounds, pathways, terms…" — two different sentences, one wrong number. The corpus has held
// 171 since before W0 (D.compounds.length, site/data.js).
// MEASURED HYDRATED, real browser at 390x844, 0 pageerrors (qa/out/w45c_before.json): "/",
// "/c/creatine-monohydrate" and "/az" all printed "Search 170 compounds, protocols, terms…" in the
// persistent header — and on /az the toolbar directly below it printed "Filter 171 compounds by
// name…", because THAT one interpolates D.compounds.length. The site contradicted itself about its
// own size, on the same screen, at the top of every page. Product constraint 5 is "never fabricate
// counts", and this is the count a reader meets first.
// The prerendered header is now interpolated. site/index.html is the one served document the build
// does not generate, so it is checked here rather than trusted: this gate walks every .html under
// site/ and fails on any corpus count that disagrees with site/data.js, printing the exact string
// to type. Only sentences that state the SIZE OF THE CORPUS are listed — per-page counts ("3
// compounds act here") are real measurements of something else and are none of this gate's business.
// PROVE IT by putting 170 back in either place.
(function assertCorpusCountCopy() {
  const N = D.compounds.length;
  const CLAIMS = [
    { re: /Search (\d+) compounds/g, what: 'the header search placeholder', fix: (n) => `Search ${n} compounds` },
    { re: /— (\d+) compounds and full Move/g, what: 'the SPA shell meta description', fix: (n) => `— ${n} compounds and full Move` },
  ];
  const bad = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    if (!e.name.endsWith('.html')) return;
    // HTML comments are stripped first. A comment that QUOTES the old wrong string — which is how
    // site/index.html records why its number is hand-typed — is a note to the next editor, not a
    // claim to a reader. Without this the gate fails on its own explanation, which is how it first
    // behaved.
    const h = fs.readFileSync(p, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    CLAIMS.forEach((c) => {
      c.re.lastIndex = 0;
      let m;
      while ((m = c.re.exec(h))) {
        if (Number(m[1]) !== N) bad.push({ file: path.relative(ROOT, p), what: c.what, saw: m[0], want: c.fix(N) });
      }
    });
  });
  walk(SITE);
  if (bad.length) {
    console.error('\n[prerender] A COUNT OF THE CORPUS DOES NOT MATCH THE CORPUS — refusing to build.');
    console.error(`  site/data.js holds ${N} compounds. These served documents say otherwise:`);
    const shown = new Map();
    bad.forEach((b) => { const k = b.saw + '|' + b.what; shown.set(k, (shown.get(k) || { ...b, n: 0 }));
      shown.get(k).n++; });
    [...shown.values()].forEach((b) => console.error(`    ✗ ${b.what}: "${b.saw}" on ${b.n} document(s), e.g. ${b.file}\n        change it to "${b.want}" (or interpolate D.compounds.length)`));
    console.error('');
    process.exit(1);
  }
  console.log(`[prerender] corpus counts OK — every served document states ${N} compounds.`);
})();

// ---- build-time assertion: THE TWO DOCUMENTS MUST AGREE ABOUT WHAT THE PAGE IS ----------------
// W5b (2026-08-02). Nothing on this project has ever checked the <head>, and the head is the only
// part of a page that is entirely metadata about itself — nobody notices it is wrong by reading.
// Measured over all 620 served routes, hydrated Chrome 1280x900, 900 ms settle, 0 pageerrors:
// 135 tabs read "RNAwiki — translate the code…" on pages whose prerendered title was correct,
// title == prerendered title on 127/620, title != og:title in the same document on 493/620,
// 49 prerendered titles ended on a dangling "&" / "·" / "(" / "/", and 103 /target descriptions
// were a hard .slice(0,120) that stopped mid-sentence.
//
// FOUR THINGS, and the first is the load-bearing one:
//  1. EVERY served route has an entry in site/head.js. A route with no entry is a route where
//     app.js falls back to the site default — which is precisely defect D7, one page at a time.
//  2. The map's strings ARE the bytes of the emitted document. The map is parsed out of that HTML,
//     so this is a check that the parse worked and that no page shipped an empty head, not a
//     tautology: an empty <title> or a missing description is caught here.
//  3. No title ends on a connector or an unclosed bracket (tidyTail's job), and none is over the
//     60-char SERP budget it was trimmed to.
//  4. site/app.js actually READS the map. A map nothing consumes is 148 KB of dead weight and 620
//     routes back to the site default; `node --check` cannot see that, so it is asserted here in
//     the same way the goal-count gate reads app.js.
// PROVE IT by deleting the RNAWIKI_HEAD lookup from setPageMeta() in site/app.js, or by putting
// the old tail-strip back in tidyTail() (a title then ships ending in "&" and this gate names it).
(function assertHeadParity() {
  const bad = [];
  const routes = Object.keys(headMap);
  routes.forEach((r) => {
    const [t, d] = headMap[r] || [];
    if (!t || !t.trim()) { bad.push(`${r}: emitted an empty <title>`); return; }
    if (!d || !d.trim()) bad.push(`${r}: emitted an empty meta description — a page with nothing to say about itself in a search result or a share card`);
    if (/[&+/|·–—([:;,-]$/.test(t.replace(SUFFIX, '').trim())) bad.push(`${r}: title ends on a dangling connector — "${t}"`);
    if (esc(t).length > 60) bad.push(`${r}: title is ${esc(t).length} escaped chars against the 60-char budget seoTitle() trimmed it to — "${t}"`);
    // Descriptions get the same treatment as titles, and for the same reason: the ones that broke
    // the budget were the hand-written singletons that never went through seoDesc() — /, /about,
    // /methodology, /learn, /plan, at 170-213 chars. Every generated page already fits.
    if (d && esc(d).length > 155) bad.push(`${r}: description is ${esc(d).length} escaped chars against seoDesc()'s 155-char budget — wrap it in seoDesc() rather than trimming by eye — "${String(d).slice(0, 90)}…"`);
  });
  pages.forEach(({ route }) => { if (!headMap[route]) bad.push(`${route}: is served but has no entry in site/head.js — app.js will fall back to the site default on it, which is D7`); });
  if (!headMap['/']) bad.push('"/" has no entry in site/head.js — the home page is not in `pages` (it is written to home.html), so it has to be read back off disk explicitly or it is the one route the map silently misses');
  const APP = fs.readFileSync(path.join(SITE, 'app.js'), 'utf8');
  if (!/RNAWIKI_HEAD/.test(APP)) bad.push('site/app.js never reads window.RNAWIKI_HEAD — the generated head map reaches no reader, and every route hydrates back to the site default title and description (D7/D8)');
  // W5b/D33: the same contract for the /compare verdict. It is the visible paragraph AND the text
  // of the FAQPage JSON-LD answer, so when the two generators drifted, the sentence an answer
  // engine quotes stopped being the sentence on the page — measured string-equal on 0 of 123 pairs.
  if (!/RNAWIKI_VERDICT/.test(APP)) bad.push('site/app.js never reads window.RNAWIKI_VERDICT — the /compare verdict goes back to being written twice, and the FAQPage JSON-LD answer stops matching the paragraph a reader sees (D33)');
  pages.filter((p) => /^\/compare\/.+-vs-/.test(p.route)).forEach((p) => {
    const v = verdictByRoute[p.route];
    if (!v || !v[0]) { bad.push(`${p.route}: is a published comparison with no entry in the generated verdict map`); return; }
    // The map must hold the string this page actually shipped, not a second construction of it.
    if (p.html.indexOf(esc(v[0])) < 0) bad.push(`${p.route}: the verdict in the generated map is not the verdict in the emitted document`);
    if (p.html.indexOf(JSON.stringify(v[0]).slice(1, -1)) < 0) bad.push(`${p.route}: the FAQPage JSON-LD answer is not the verdict in the generated map — the paragraph an answer engine quotes and the paragraph on the page have come apart again`);
  });
  const SHELL = fs.readFileSync(path.join(SITE, 'c', slug(D.compounds[0].name) + '.html'), 'utf8');
  if (SHELL.indexOf('src="/head.js"') < 0) bad.push('the page shell does not load /head.js — the map exists on disk and no document asks for it');
  if (SHELL.indexOf('src="/head.js"') > SHELL.indexOf('src="/app.js"')) bad.push('/head.js loads AFTER /app.js — setPageMeta() runs inside the first route() call, so the map would be undefined exactly when it is needed');
  if (bad.length) {
    console.error('\n[prerender] THE HEAD DOES NOT SURVIVE HYDRATION — refusing to build.');
    bad.slice(0, 40).forEach((b) => console.error('    ✗ ' + b));
    if (bad.length > 40) console.error(`    … and ${bad.length - 40} more`);
    console.error('');
    process.exit(1);
  }
  console.log(`[prerender] head parity OK — ${routes.length} routes carry a title and a description, app.js reads them, 0 dangling titles.`);
})();

// ---- build-time assertion: THE FRAGMENTS THIS FILE PUBLISHES MUST BE RESOLVABLE ---------------
// W5b (2026-08-02). Measured hydrated at 390x844 over all 620 served routes, 0 pageerrors
// (qa/out/w5b_anchors_before.json): 7,339 of 8,080 in-page anchor targets published here — the
// fragments Google turns into "jump to section" links — resolved to NOTHING once the SPA rebuilt
// #app, on 574 of 620 pages. 13,475 anchor elements point at them. /c/caffeine published 36 and
// all 36 were dead.
// site/app.js anchorizeHeadings() closes most of that by deriving each id from the heading's own
// text with the same rule anchorHeadings() uses above. The six compound sections it cannot reach —
// the SPA renders them as `<div class="callout" id="sec-plain">` with the label in a <span>, so
// there is no heading to slugify — are carried by an explicit alias table in app.js, admitted only
// where BOTH renderers print the same authored field.
// THIS GATE IS THE HALF THAT ROTS. Rename a heading here and the alias table in app.js silently
// stops matching; nothing would report it, and 600-odd fragments would go quietly dead again.
// PROVE IT by renaming "<h2>Bottom line</h2>" to "<h2>The bottom line</h2>" in the compound body.
(function assertAnchorAliases() {
  const APP = fs.readFileSync(path.join(SITE, 'app.js'), 'utf8');
  const m = APP.match(/const ANCHOR_ALIASES = \{([\s\S]*?)\};/);
  if (!m) { console.error('\n[prerender] site/app.js has no ANCHOR_ALIASES table — the six compound sections a crawler is given fragments for become unreachable after hydration. Refusing to build.\n'); process.exit(1); }
  const slugs = [...m[1].matchAll(/'([a-z0-9-]+)'\s*:\s*'([a-z0-9-]+)'/g)].map((x) => ({ pub: x[1], spa: x[2] }));
  const compoundPages = pages.filter((p) => /^\/c\//.test(p.route));
  const bad = [];
  if (!slugs.length) bad.push('ANCHOR_ALIASES parsed to zero entries — the table is there and this gate cannot read it, which is the same as no gate');
  slugs.forEach(({ pub, spa }) => {
    const n = compoundPages.filter((p) => p.html.indexOf(`id="${pub}"`) >= 0).length;
    if (!n) bad.push(`site/app.js aliases "#${pub}" -> "#${spa}", but NO compound page publishes id="${pub}" any more — a heading was renamed here and the alias is now pointing at a fragment nobody links to`);
    if (!APP.includes(`id="${spa}"`) && !APP.includes(`'${spa}'`) && !APP.includes(`sec-${spa.replace(/^sec-/, '')}`)) bad.push(`site/app.js aliases "#${pub}" -> "#${spa}", but app.js never emits that id`);
  });
  if (bad.length) {
    console.error('\n[prerender] A PUBLISHED DEEP LINK HAS NOTHING TO LAND ON — refusing to build.');
    bad.forEach((b) => console.error('    ✗ ' + b));
    console.error('');
    process.exit(1);
  }
  console.log(`[prerender] anchor aliases OK — ${slugs.length} published fragments the SPA renders under another id, all still published here.`);
})();

// ---- build-time assertion: A COUNT OF THE PARTS MUST EQUAL THE PARTS --------------------------
// W5b (2026-08-02). learnFlatHtml() writes five part dividers and four of them are conditional on
// the entry having that content, but the numbers were hardcoded partDivider(1,5) … partDivider(5,5).
// So a page carrying only parts 1, 2 and 5 printed "Part 1 of 5", "Part 2 of 5", "Part 5 of 5" and
// sent the reader looking for two parts that are not in that document. Measured in the prerendered
// document before the fix: 260 routes — 157 of 171 /c and 103 of 103 /target — emitted 3 dividers
// each while claiming 5, and 45 emitted the full 5. Same defect class as "Covers all 170 compounds"
// and "Search 170 compounds": a number typed next to content that does not have to agree with it.
// PROVE IT by putting a literal back — partDivider(5, 5) instead of the renumber pass.
(function assertPartNumbering() {
  const bad = [];
  let files = 0, dividers = 0;
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    if (!e.name.endsWith('.html')) return;
    const h = fs.readFileSync(p, 'utf8');
    const vis = [...h.matchAll(/<span class="lf-part-n">Part (\d+) of (\d+)<\/span>/g)].map((m) => [+m[1], +m[2]]);
    if (!vis.length) return;
    files++; dividers += vis.length;
    const rel = path.relative(ROOT, p);
    const total = vis[0][1];
    if (vis.length !== total) bad.push(`${rel}: prints "of ${total}" but the document contains ${vis.length} part${vis.length === 1 ? '' : 's'} — the reader is sent looking for ${total - vis.length} that are not there`);
    vis.forEach(([n, tot], i) => {
      if (n !== i + 1) bad.push(`${rel}: part ${i + 1} is labelled "Part ${n}"`);
      if (tot !== total) bad.push(`${rel}: one divider says "of ${tot}" and another says "of ${total}"`);
    });
    // The accessible name is a second copy of the same two numbers, and a second copy is a second
    // chance to disagree. Screen-reader users get the aria-label, not the span.
    const aria = [...h.matchAll(/class="lf-part" role="separator" aria-label="Part (\d+) of (\d+):/g)].map((m) => [+m[1], +m[2]]);
    if (aria.length !== vis.length || aria.some((a, i) => a[0] !== vis[i][0] || a[1] !== vis[i][1])) {
      bad.push(`${rel}: the aria-labels and the visible part numbers disagree — ${JSON.stringify(aria)} vs ${JSON.stringify(vis)}`);
    }
  });
  walk(SITE);
  if (bad.length) {
    console.error('\n[prerender] A PART COUNT DOES NOT MATCH THE PARTS — refusing to build.');
    bad.slice(0, 20).forEach((b) => console.error('    ✗ ' + b));
    if (bad.length > 20) console.error(`    … and ${bad.length - 20} more`);
    console.error('');
    process.exit(1);
  }
  console.log(`[prerender] part numbering OK — ${dividers} dividers across ${files} documents, every one numbered 1..N of its own N.`);
})();

// ---- build-time assertion: A LIST OF LINKS IS NOT A PAGE -------------------------------------
// W5b (2026-08-02), D36 — the mirror image of D2, and the one nobody was looking for. D2 is
// hydration deleting content the crawler has. This is the crawler being handed a stub of a page
// the reader gets in full. Measured over 68 reference routes, prerendered body words against
// fully-expanded hydrated words at 1280x900, 0 pageerrors (qa/out/w5b_starve_before.json): 17
// served the crawler UNDER HALF of what a reader sees — /goal/hormones 211 vs 1,765 (0.12),
// /goal/longevity 208 vs 1,623, /goal/muscle 225 vs 1,441, /anatomy 95 vs 370. Sixteen of the 17
// were /goal/*, and the cause was one line: the reader gets a card per compound carrying the
// category, the one-line mechanism and the approval labels; the crawler got a name and a star row.
//
// A build gate cannot measure the hydrated document, so it does not try. It asserts the thing that
// was actually wrong and is checkable here: on these pages, an entry in a list must SAY SOMETHING
// about what it links to. Bare-link lists are how a page becomes a stub without anyone deciding it
// should be one.
// PROVE IT by deleting the `line` from the /goal list item, or the region and counts from /anatomy.
(function assertReferencePagesDescribeWhatTheyList() {
  const bad = [];
  const check = (route, minDescribed) => {
    const pg = pages.find((p) => p.route === route);
    if (!pg) { bad.push(`${route}: no prerendered page`); return; }
    const main = (pg.html.split('<main id="app">')[1] || '').split('</main>')[0];
    // Only the page's ENTITY list. /goal also carries a "Full protocols" list whose link TEXT is
    // the description ("Knee Pain — Move, Fuel & Stack"), which the words-outside-the-link measure
    // below cannot see and would wrongly fail. Scoping is honest here: the measured defect was the
    // compound list, and a check that fires on a list that is fine teaches people to widen the
    // floor until it fires on nothing.
    const scope = route === '/anatomy' ? main : (main.match(/<ul class="goal-list">[\s\S]*?<\/ul>/) || [''])[0];
    const items = [...scope.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
    if (items.length < 3) return;                       // not a list page
    // Words that are NOT inside the link text — the description, not the name.
    const described = items.filter((it) => {
      const noLink = it.replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
      return noLink.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length >= 4;
    }).length;
    const pct = described / items.length;
    if (pct < minDescribed) bad.push(`${route}: ${described} of ${items.length} list entries say anything about what they link to (${Math.round(pct * 100)}%, floor ${Math.round(minDescribed * 100)}%) — the reader is shown a card per entry and the crawler is being handed a bare list of names`);
  };
  D.goals.forEach((g) => check('/goal/' + g.id, 0.9));
  check('/anatomy', 0.9);
  if (bad.length) {
    console.error('\n[prerender] A REFERENCE PAGE IS A STUB FOR THE CRAWLER — refusing to build.');
    bad.forEach((b) => console.error('    ✗ ' + b));
    console.error('');
    process.exit(1);
  }
  console.log(`[prerender] reference pages OK — ${D.goals.length + 1} list pages, every entry describes what it links to.`);
})();

// ---- build-time assertion: structured data ----------------------------------------------------
// Added 2026-07-30. Two blocks on the home page shipped without "@context" for months. Google
// silently discards a block with no @context, so the WebSite and Organization entities -- the two
// that carry the sitelinks search box and the brand panel -- were being emitted, served, and thrown
// away, with nothing anywhere reporting a problem. Valid JSON is not the bar; a block can parse
// perfectly and still be invisible. 1,260 of 1,262 blocks were correct, which is exactly why this
// went unnoticed: an eyeball check of any random page would have passed.
(function assertStructuredData() {
  const bad = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    if (!e.name.endsWith('.html')) return;
    const html = fs.readFileSync(p, 'utf8');
    (html.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g) || []).forEach((blk) => {
      const body = blk.replace(/^[^>]*>/, '').replace(/<\/script>$/, '');
      let j; try { j = JSON.parse(body); } catch (err) { bad.push(`${p}: JSON-LD does not parse — ${err.message}`); return; }
      if (!j['@context']) bad.push(`${p}: @type=${[].concat(j['@graph'] || j).map((x) => x['@type']).join(',')} has no @context — Google discards this block`);
    });
  });
  walk(SITE);
  if (bad.length) {
    console.error('\n[prerender] STRUCTURED-DATA ASSERTION FAILED — refusing to build:');
    bad.slice(0, 20).forEach((m) => console.error('  \u2717 ' + m));
    if (bad.length > 20) console.error(`  … and ${bad.length - 20} more`);
    process.exit(1);
  }
  console.log('[prerender] structured data OK — every JSON-LD block parses and declares @context.');
})();

// ---- build-time assertion: /problem/* is still a differential ----------------------------------
// Added 2026-08-01 with the D13 restructure. The defect this locks down was invisible on the page
// that contained it: every block was present and correct, in the wrong ORDER, so the reader met
// 30,000 px of mechanism prose before any of the three things they came for. Measured hydrated on
// all 41 pages: the first protocol link at 98% of page height on 41/41, no escalation block on any
// of them, 0 of 224 causes carrying an anchor or a next step, 0 of 861 plan items linked.
//
// This checks the PRERENDERED documents, which is also the hydrated DOM here — /problem is one of
// the three KEEP_PRERENDERED routes (app.js:6204), so app.js never rewrites it. It is a whole-corpus
// check because smoke.mjs only visits /problem/knee-pain, and a per-problem data gap (a missing
// `reassess`, a cause with no fixes) would slip past a single-route gate.
//
// NOTE the deploy-gate asymmetry: `prestart` is `node build/parse.js && (node build/prerender.js ||
// echo …)`, so a process.exit(1) HERE does not stop a Railway deploy — it ships the previous page.
// It does fail `npm run build`, which is the gate the workflow actually runs before a commit.
(function assertProblemSpine() {
  const bad = [];
  let checked = 0, causesSeen = 0, linkedItems = 0, planItems = 0;
  pages.filter((pg) => /^\/problem\//.test(pg.route)).forEach((pg) => {
    checked++;
    const h = pg.html;
    const at = (re) => { const m = h.match(re); return m ? m.index : -1; };
    const iRed = at(/id="red-flags"/);
    const iDx = at(/id="which-one"/);
    const iRoute = at(/id="the-plan"/);
    const iProse = at(/class="cause-flat"/);
    const iProto = at(/href="\/protocol\//);
    if (iRed < 0) bad.push(`${pg.route}: no #red-flags escalation block (data/protocol_plan.json.reassess missing?)`);
    if (!/not medical advice/i.test(h)) bad.push(`${pg.route}: does not say the page is not medical advice`);
    if (iDx < 0) bad.push(`${pg.route}: no #which-one differential block`);
    if (iRoute < 0) bad.push(`${pg.route}: no #the-plan route-out block`);
    if (iProse < 0) { bad.push(`${pg.route}: no .cause-flat prose section`); return; }
    // THE ORDER IS THE ASSERTION. Anything else and the reader is back where they started.
    if (iRed > iProse) bad.push(`${pg.route}: the escalation block comes AFTER the mechanism prose`);
    if (iDx > iProse) bad.push(`${pg.route}: the differential comes AFTER the mechanism prose`);
    if (iRoute > iProse) bad.push(`${pg.route}: the route to a protocol comes AFTER the mechanism prose`);
    if (iProto < 0 || iProto > iProse) bad.push(`${pg.route}: the first protocol link is inside or after the mechanism prose (this is the 98%-of-page-height defect)`);
    // Every #cause-N must resolve. assertLinkGraph cannot see these: norm() returns null for a
    // "#..." href, so in-page fragments are outside its reach by design.
    const ids = new Set((h.match(/id="cause-\d+"/g) || []).map((s) => s.slice(4, -1)));
    const jumps = [...new Set((h.match(/href="#(cause-\d+)"/g) || []).map((s) => s.slice(7, -1)))];
    if (!jumps.length) bad.push(`${pg.route}: no #cause-N jump links`);
    jumps.forEach((j) => { if (!ids.has(j)) bad.push(`${pg.route}: #${j} resolves to nothing`); });
    const nCause = (h.match(/class="cause-flat-item"/g) || []).length;
    const nRow = (h.match(/class="dx-row"/g) || []).length;
    const nTell = (h.match(/class="dx-tell"/g) || []).length;
    const nNext = (h.match(/class="cf-next"/g) || []).length;
    causesSeen += nCause;
    if (nRow !== nCause) bad.push(`${pg.route}: ${nRow} differential rows for ${nCause} causes`);
    if (nTell !== nCause) bad.push(`${pg.route}: ${nTell} tells for ${nCause} causes — a cause a reader cannot recognise cannot be chosen`);
    if (nNext !== nCause) bad.push(`${pg.route}: ${nNext} end-of-cause next steps for ${nCause} causes`);
    if (ids.size !== nCause) bad.push(`${pg.route}: ${ids.size} anchors for ${nCause} causes`);
    const lis = h.match(/<li><span class="cf-kind[\s\S]*?<\/li>/g) || [];
    planItems += lis.length;
    linkedItems += lis.filter((li) => /<a href="\/c\//.test(li)).length;
  });
  if (checked && !linkedItems) bad.push(`0 of ${planItems} plan items link to the compound they name — fixItemHtml() has stopped resolving`);
  if (bad.length) {
    console.error('\n[prerender] /problem SPINE ASSERTION FAILED — refusing to build:');
    bad.slice(0, 20).forEach((m) => console.error('  ✗ ' + m));
    if (bad.length > 20) console.error(`  … and ${bad.length - 20} more`);
    process.exit(1);
  }
  console.log('[prerender] /problem spine OK — %d pages: escalation, %d tells and a protocol route all above the prose; %d/%d plan items linked.', checked, causesSeen, linkedItems, planItems);
})();

// ---- build-time assertion: /protocol/* puts the red flags above the recommendations ------------
// Added 2026-08-01 (W2). The defect: on 52/52 prerendered protocol pages the escalation block was
// emitted AFTER the Stack and the Medical options — the reader of the document ~90% of traffic gets
// met a star-ranked supplement list before anything told them which knee pain is not a self-care
// problem. The same inversion was measured hydrated (median y 11,023 px for the 🚩 card against
// 8,914 px for the first supplement line, on an 18,430 px page).
// Prove this gate by moving ${redflags} back below ${med.length ? ... : ''} in the protocol body.
(function assertProtocolSpine() {
  const bad = [];
  let checked = 0;
  pages.filter((pg) => /^\/protocol\//.test(pg.route)).forEach((pg) => {
    checked++;
    const h = pg.html;
    const at = (re) => { const m = h.match(re); return m ? m.index : -1; };
    const iRed = at(/id="red-flags"/);
    // NOT /<h3>Stack — /: anchorHeadings() rewrites every h3 into `<h3 id=…><a class="hanchor">#</a>`
    // by the time the page is written, so that pattern never matches and the ordering clause below
    // would be skipped on 52/52 — a gate over an empty set, which always passes. Match the TEXT.
    const iStack = at(/Stack — supplements with human trial evidence/);
    const iMetric = at(/data-primary-metric="/);
    const iStop = at(/data-stop-rule/);
    if (iRed < 0) { bad.push(`${pg.route}: no #red-flags escalation block`); return; }
    if (iStack < 0) { bad.push(`${pg.route}: no Stack heading — this assertion can no longer see the thing it orders against`); return; }
    if (iMetric < 0) bad.push(`${pg.route}: no [data-primary-metric] element — nothing names the one thing this protocol is judged by`);
    if (iStop < 0) bad.push(`${pg.route}: no [data-stop-rule] element — nothing states the point at which the answer is to stop`);
    if (!/not medical advice/i.test(h)) bad.push(`${pg.route}: does not say the page is not medical advice`);
    if (iRed > iStack) bad.push(`${pg.route}: the escalation block comes AFTER the supplement stack — this is the defect`);
    // ---- W4 (2026-08-02): PHASE 1 IS ONE FREE THING, AND IT COMES FIRST ---------------------
    // build/parse.js gates the DATA. This gates the RENDERED page, which is what a reader and a
    // crawler actually get. The action-element count is the half of "exactly one intervention"
    // that a text check on the data cannot prove: a conjunction ban stops a sentence joining two
    // things, only counting the rendered elements stops the section becoming a list.
    // PROVE IT by emitting a second <p class="p1-action"> in the phase1 template, or by moving
    // ${phase1} below the Stack: the build stops and names the route.
    const iP1 = at(/id="phase-1"/);
    if (iP1 < 0) bad.push(`${pg.route}: no #phase-1 section — every protocol must state its ONE $0 first step, or state that it has none`);
    else {
      if (iP1 > iStack) bad.push(`${pg.route}: Phase 1 comes AFTER the supplement stack — the free step must precede the paid one`);
      const nAct = (h.match(/class="p1-action"/g) || []).length;
      if (nAct !== 1) bad.push(`${pg.route}: Phase 1 renders ${nAct} action elements — it is ONE intervention, not a list`);
      const none = /data-phase1-none/.test(h);
      if (!none) {
        if (!/data-phase1-cost="none"/.test(h)) bad.push(`${pg.route}: Phase 1 does not declare that it costs nothing`);
        if (!/one variable at a time/i.test(h)) bad.push(`${pg.route}: Phase 1 never tells the reader to hold everything else constant, so the 7 days measure nothing`);
      }
    }
    const iP2 = at(/id="phase-2"/);
    if (iP2 < 0) bad.push(`${pg.route}: no #phase-2 container — the stack must be behind an optional second phase`);
    else if (iP1 >= 0 && iP2 < iP1) bad.push(`${pg.route}: Phase 2 is emitted before Phase 1`);
    // ---- W4 · LOOP B (2026-08-02): the stack-audit hook, in the document a crawler gets --------
    // It has to be OUTSIDE the Phase 2 <details>, or it is invisible until a reader opens a drawer
    // aimed at the readers who need it least. `iP2close` is the end of that element; the callout
    // must come after it. And it must carry its scope line: an offer to go through somebody's
    // supplement stack, made by a person who is not a clinician, has to say so in the same breath.
    // PROVE IT by moving ${stackAuditCallout()} inside the <div class="p2-body">, or by deleting
    // the "not a clinician" sentence: the build stops and names all 52 routes.
    const iSA = at(/class="stack-audit"/);
    if (iSA < 0) bad.push(`${pg.route}: no stack-audit callout — the one loop this site has is missing from the crawler's document`);
    else {
      const iP2close = h.indexOf('</details>', iP2);
      if (iP2close >= 0 && iSA < iP2close) bad.push(`${pg.route}: the stack-audit callout is inside the collapsed Phase 2 drawer, so it is invisible to the reader it is aimed at`);
      const sa = h.slice(iSA, iSA + 1600);
      if (!/not a clinician/i.test(sa)) bad.push(`${pg.route}: the stack-audit offer never says it is not from a clinician — an offer to go through somebody's supplements has to state its scope in the same breath`);
      if (!/not medical advice/i.test(sa)) bad.push(`${pg.route}: the stack-audit offer never says it is not medical advice`);
    }
    if (iMetric >= 0 && iMetric > iStack) bad.push(`${pg.route}: the tracked metric comes after the supplement stack`);
    if (iStop >= 0 && iStop > iStack) bad.push(`${pg.route}: the stop rule comes after the supplement stack`);
    // The header over the stop rule must name the horizon THE RULE names. It printed a timeline
    // rung until 2026-08-01: /protocol/skin-aging/* headed "The stop rule · Months 6–12" directly
    // over "No visible change after 12 weeks", i.e. up to 4x longer before the reader is told to
    // seek help. parse.js gates the DATA; this gates the RENDERED page, which is the thing a
    // reader and a crawler actually get.
    // PROVE IT by reverting the stop-rule header in this file alone: the attribute then carries
    // the horizon while the text carries the checkpoint, and the build stops on all 52.
    const mHz = h.match(/data-stop-rule data-horizon="([^"]*)"/);
    if (mHz && mHz[1] && h.indexOf(`The stop rule · ${mHz[1]}`) < 0) {
      bad.push(`${pg.route}: the stop-rule header does not name the horizon the rule names ("${mHz[1]}")`);
    }
  });
  if (bad.length) {
    console.error('\n[prerender] /protocol SPINE ASSERTION FAILED — refusing to build:');
    bad.slice(0, 20).forEach((m) => console.error('  ✗ ' + m));
    if (bad.length > 20) console.error(`  … and ${bad.length - 20} more`);
    process.exit(1);
  }
  console.log('[prerender] /protocol spine OK — %d pages: red flags, a named metric and a stop rule all above the stack.', checked);
})();

// ---- build-time assertion: the internal link graph ---------------------------------------------
// Added 2026-07-30. Two failures in this one class shipped in a single evening, and neither could be
// caught by looking at the page that contained the bug:
//   * /where was published with nothing on the site linking to it — a page nobody could reach.
//   * /methodology, /corrections and /compare were linked from 52, 52 and 119 pages respectively and
//     none of the three existed. /compare answered HTTP 410 Gone, so 119 pages were telling Google
//     their own parent had been permanently deleted.
// Both directions matter and both are invisible locally: a dead link looks fine on the page that
// emits it, and an orphan looks fine on itself. Only the whole graph shows either one, so the whole
// graph is what gets checked. This runs over the PRERENDERED documents deliberately — that is the
// document ~90% of readers and every crawler receive.
(function assertLinkGraph() {
  // Routes that legitimately have no prerendered page: interactive app views that need JavaScript
  // and state to mean anything. They are deliberately kept out of the sitemap. Adding to this list
  // is a decision to serve a crawler an empty shell, so keep it short and justified.
  // Emptied on 2026-07-30: /plan and every /fuel/ route are prerendered now, so nothing on the
  // site links to a route that serves a blank shell any more. Adding to these lists is a decision
  // to hand a crawler and a no-JS reader an empty document, so keep them empty if you can.
  const SPA_ONLY = [];
  const SPA_PREFIX = [];
  const emitted = new Set(pages.map((p) => p.route));
  emitted.add('/');

  const isKnown = (u) => {
    if (emitted.has(u)) return true;
    if (SPA_ONLY.includes(u) || SPA_PREFIX.some((p) => u.startsWith(p))) return true;
    // An href that carries a file extension is an asset (/styles.css, /og.png) and is checked on
    // disk. An extensionless href is a ROUTE, and a route counts as live only if THIS run emitted
    // it — deliberately not "a file of that name exists". site/ is never wiped between builds, so
    // a page dropped from the generator leaves its .html behind, and every /compare/* page creates
    // a site/compare/ directory. Trusting either would make a genuinely dead link look alive and
    // silence this gate at the exact moment it is needed. Verified: with that fallback in place,
    // deleting the /compare index left all 119 dead breadcrumbs undetected.
    if (!/\.[a-z0-9]{2,5}$/i.test(u)) return false;
    return fs.existsSync(path.join(SITE, u.replace(/^\//, '')));
  };
  const norm = (href, from) => {
    if (!href) return null;
    let h = String(href).trim();
    if (/^(https?:|mailto:|tel:|javascript:|data:|#)/i.test(h)) return null;
    h = h.split('#')[0].split('?')[0];
    if (!h) return null;
    if (!h.startsWith('/')) h = path.posix.normalize((from === '/' ? '/' : path.posix.dirname(from) + '/') + h);
    return (h.length > 1 ? h.replace(/\/+$/, '') : h) || '/';
  };

  const dead = new Map();          // dead target -> Set(pages linking to it)
  const inbound = new Map();       // emitted route -> count of OTHER pages linking to it
  emitted.forEach((r) => inbound.set(r, 0));
  const seen = new Set();          // "from|to", so one page linking twice still counts once

  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) return walk(p);
    if (!e.name.endsWith('.html')) return;
    let from = '/' + path.relative(SITE, p).replace(/\.html$/, '');
    if (from === '/home' || from === '/index') from = '/';
    const html = fs.readFileSync(p, 'utf8');
    for (const m of html.matchAll(/href\s*=\s*"([^"]*)"/g)) {
      const to = norm(m[1], from);
      if (!to || to === from) continue;
      if (!isKnown(to)) {
        if (!dead.has(to)) dead.set(to, new Set());
        dead.get(to).add(from);
        continue;
      }
      const key = from + '|' + to;
      if (inbound.has(to) && !seen.has(key)) { seen.add(key); inbound.set(to, inbound.get(to) + 1); }
    }
  });
  walk(SITE);

  const orphans = [...inbound.entries()].filter(([r, n]) => r !== '/' && n === 0).map(([r]) => r);
  const fail = [];
  [...dead.entries()].sort((a, b) => b[1].size - a[1].size).forEach(([to, srcs]) => {
    fail.push(`dead link -> ${to}  (linked from ${srcs.size} page${srcs.size === 1 ? '' : 's'}, e.g. ${[...srcs].slice(0, 3).join(', ')})`);
  });
  orphans.forEach((r) => fail.push(`orphan page ${r} — published, but no other page links to it`));

  if (fail.length) {
    console.error('\n[prerender] LINK-GRAPH ASSERTION FAILED — refusing to build:');
    fail.slice(0, 25).forEach((m) => console.error('  ✗ ' + m));
    if (fail.length > 25) console.error(`  … and ${fail.length - 25} more`);
    console.error('  Either give the target a page, or give the page an inbound link. Do not delete the link to silence this.');
    process.exit(1);
  }
  const thin = [...inbound.entries()].filter(([r, n]) => r !== '/' && n === 1).length;
  console.log(`[prerender] link graph OK — ${emitted.size} routes, 0 dead links, 0 orphans (${thin} reachable from a single page).`);
})();

// ---- build-time assertion: A COLOUR TOKEN MUST BE READABLE ON THE PAGE IT IS PRINTED ON --------
// W5c (2026-08-02). Contrast was measured, fixed by eye and then re-broken twice in this codebase's
// history, because nothing checks it. Measured hydrated at 390x844 with chFade disabled and every
// <details>/.chapter expanded, full alpha-composited TreeWalker over 13 routes
// (qa/out/w5cdi/before-390.json), 20.7-46.9% of visible text nodes failed WCAG AA — and the top of
// that list was not 500 mistakes, it was four hex values in :root:
//     --faint  #8b97a6  2.79:1  ~450 failing nodes      --star   #d97706  2.99:1  209 nodes
//     --accent #0d9488  3.52:1 as text / 3.74:1 under white text   --green #059669  3.77:1
// This gate computes the real WCAG 1.4.3 ratio for every token listed below against all three page
// backgrounds and refuses to build below 4.5:1. It reads site/styles.css, so it cannot be satisfied
// by a comment.
// SECOND CHECK, a different defect class, and the one nobody would ever look for: this site HAS NO
// DARK THEME — no dark :root, and site/app.js never sets data-theme (0 occurrences). Five
// `prefers-color-scheme:dark` blocks nonetheless lightened TEXT ONLY, leaving the light background
// underneath. Measured with the OS in dark appearance: .ck-behavior rgb(74,222,128) at 3.44:1 and
// .fk-compound rgb(196,181,253) at 3.16:1 on the same chips a light-mode reader sees at 5:1+. A
// dark-scheme block may set a colour only if it also sets the background that colour sits on.
// PROVE IT by putting --faint:#8b97a6 back, or by adding
// `@media(prefers-color-scheme:dark){.foo{color:#4ade80}}` — each fails by name.
(function assertContrastTokens() {
  const CSS = fs.readFileSync(path.join(SITE, 'styles.css'), 'utf8');
  const bad = [];
  const root = CSS.match(/:root\{([\s\S]*?)\n\}/);
  if (!root) { console.error('\n[prerender] site/styles.css has no :root token block — refusing to build.\n'); process.exit(1); }
  const tok = {};
  [...root[1].matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)].forEach((m) => { tok[m[1]] = m[2]; });
  const rgb = (h) => {
    let s = h.replace('#', '');
    if (s.length === 3) s = s.split('').map((c) => c + c).join('');
    return [0, 2, 4].map((i) => parseInt(s.substr(i, 2), 16));
  };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(rgb(a)), l2 = lum(rgb(b)); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  // The three surfaces every one of these tokens is actually printed on.
  const SURFACES = ['--bg', '--panel', '--panel2'];
  // Tokens used as TEXT on those surfaces. Each one below was measured failing before W5c; the list
  // is not decorative — adding a token here is what stops it drifting back.
  const AS_TEXT = ['--ink', '--head', '--muted', '--faint', '--link', '--star', '--green', '--yellow', '--orange', '--accent'];
  // Tokens used as a BACKGROUND with --accent-ink (white) printed on them.
  const AS_FILL = ['--accent'];
  AS_TEXT.forEach((t) => {
    if (!tok[t]) { bad.push(`:root has no ${t} — a token this gate is written about has been renamed or deleted, so the check silently stopped covering it`); return; }
    SURFACES.forEach((s) => {
      if (!tok[s]) { bad.push(`:root has no ${s}`); return; }
      const r = ratio(tok[t], tok[s]);
      if (r < 4.5) bad.push(`${t} (${tok[t]}) on ${s} (${tok[s]}) is ${r.toFixed(2)}:1 — WCAG AA needs 4.5:1 for the body sizes this token is printed at, and the 3:1 large-text exemption needs 18.66px bold or 24px`);
    });
  });
  AS_FILL.forEach((t) => {
    if (!tok[t] || !tok['--accent-ink']) return;
    const r = ratio(tok['--accent-ink'], tok[t]);
    if (r < 4.5) bad.push(`--accent-ink (${tok['--accent-ink']}) on ${t} (${tok[t]}) is ${r.toFixed(2)}:1 — that is every filled button and every numbered step marker on the site`);
  });
  // A dark-scheme block may not repaint text and leave the light background it sits on.
  const darkBlocks = [...CSS.matchAll(/@media\s*\(prefers-color-scheme\s*:\s*dark\)\s*\{([\s\S]*?)\n?\}\s*(?=\n|$)/g)];
  darkBlocks.forEach((m) => {
    const body = m[1];
    [...body.matchAll(/([^{}]+)\{([^{}]*)\}/g)].forEach((r) => {
      const decls = r[2];
      if (/(^|;)\s*color\s*:/.test(decls) && !/background/.test(decls)) {
        bad.push(`@media(prefers-color-scheme:dark) repaints the TEXT of "${r[1].trim().slice(0, 60)}" and sets no background — this site has no dark :root and app.js never sets data-theme, so that light text lands on the light --panel a dark-mode reader still gets`);
      }
    });
  });
  if (bad.length) {
    console.error('\n[prerender] A COLOUR TOKEN IS NOT READABLE ON THE PAGE IT IS PRINTED ON — refusing to build.');
    bad.forEach((b) => console.error('    ✗ ' + b));
    console.error('');
    process.exit(1);
  }
  console.log(`[prerender] contrast tokens OK — ${AS_TEXT.length} text tokens × ${SURFACES.length} surfaces all ≥4.5:1, white-on-accent ${ratio(tok['--accent-ink'], tok['--accent']).toFixed(2)}:1, ${darkBlocks.length} dark-scheme block(s) all set their own background.`);
})();

// ---- build-time assertion: --accent-ink IS THE INK FOR THE ACCENT FILL, AND NOTHING ELSE ------
// W5c (2026-08-02). --accent-ink is #ffffff. Five rules used it as a plain text colour on a white
// or near-white surface, which is not "low contrast", it is INVISIBLE. Measured hydrated at
// 390x844, default DOM state, 0 pageerrors (qa/out/w5cdi/before-390.json):
//   /solve  .where-cta a   rgb(255,255,255) on rgb(255,255,255) = EXACTLY 1.00:1, rendered
//           302x65 px — the only route into /where from the site's main funnel page.
//   /where  .where-page .kicker  1.06:1 on --bg.
//   /where  .bw-prob:hover / .bw-find:hover — 31 controls that vanish under a desktop pointer.
//   /fuel   .sg-chip — the same bug, in the prerendered document only (the SPA drops the chip).
// This gate does not measure colours; assertContrastTokens() above does that. It enforces the
// TOKEN'S CONTRACT, which is the thing that actually went wrong: if a rule prints in --accent-ink,
// the same rule has to say what accent-coloured surface it is printing on. A background of
// --panel / --bg / --panel2 / white / transparent, or no background at all, is the defect.
// PROVE IT by putting `color:var(--accent-ink)` back on .where-cta a.
(function assertAccentInkOnAccent() {
  const CSS = fs.readFileSync(path.join(SITE, 'styles.css'), 'utf8');
  const bad = [];
  let checked = 0;
  const WHITEISH = /var\(--panel2?\)|var\(--bg\)|var\(--line[a-z-]*\)|#fff\b|#ffffff\b|\bwhite\b|\btransparent\b|\bnone\b/i;
  [...CSS.matchAll(/([^{}\/]+)\{([^{}]*)\}/g)].forEach((m) => {
    const sel = m[1].trim().replace(/\s+/g, ' '), decls = m[2];
    if (!/color\s*:\s*var\(--accent-ink\)/.test(decls)) return;
    checked++;
    const bgm = decls.match(/background(?:-color)?\s*:\s*([^;]+)/);
    if (!bgm) { bad.push(`"${sel.slice(0, 70)}" prints in --accent-ink (#ffffff) and sets no background — it inherits whatever is behind it, and every page surface on this site is white or near-white`); return; }
    if (WHITEISH.test(bgm[1])) bad.push(`"${sel.slice(0, 70)}" prints in --accent-ink (#ffffff) on background ${bgm[1].trim()} — that is white on white`);
  });
  if (!checked) bad.push('no rule uses --accent-ink at all — either the token was renamed (and this gate silently stopped covering anything) or the accent buttons lost their ink');
  if (bad.length) {
    console.error('\n[prerender] TEXT IS BEING PRINTED IN THE ACCENT INK ON A WHITE SURFACE — refusing to build.');
    bad.forEach((b) => console.error('    ✗ ' + b));
    console.error('');
    process.exit(1);
  }
  console.log(`[prerender] accent ink OK — ${checked} rules print in --accent-ink, every one of them on an accent-coloured background.`);
})();
// ---- build-time assertion: THE VERDICT MAY ONLY NAME WHAT THE PAGE ACTUALLY SHOWS -------------
// W5d (2026-08-02). Measured hydrated at 390x844 on all 123 published pairs
// (qa/out/w5cdi/before-390.json). The verdict ended "What actually differs is mechanism,
// side-effect profile, interactions, availability and cost." Searching the page OUTSIDE the
// verdict paragraph: cost 4/123, interactions 0/123, side-effects 0/123, dose 11/123. Four of the
// five named dimensions existed nowhere on the page, on essentially every pair — while row 1
// showed unequal star counts on 78/123, so the table ranked while the prose refused to.
// The refusal to rank is correct and is untouched. What this gate enforces is the other half: a
// sentence that lists what to decide on instead must list things that are on the page. It parses
// the dimensions back OUT OF THE PROSE and matches them against the row headers actually emitted,
// so it cannot be satisfied by the data structure the prose was supposed to be built from.
// It also enforces D19 — the same sentence used to say "compared in full below" and "the star
// ratings shown below" while the table bottom is ABOVE the verdict top on 123/123.
// PROVE IT by adding a dimension the table does not have, e.g. appending " and cost" to the
// verdict's dimension list, or by changing "the table above" back to "below".
(function assertCompareDimensions() {
  const bad = [];
  let checked = 0, named = 0;
  pages.filter((p) => /^\/compare\/.+-vs-/.test(p.route)).forEach((p) => {
    checked++;
    const v = (verdictByRoute[p.route] || [])[0] || '';
    if (!v) { bad.push(`${p.route}: no verdict`); return; }
    if (/\bbelow\b/i.test(v)) bad.push(`${p.route}: the verdict points the reader "below" — the comparison table is ABOVE it on 123 of 123 pairs measured, and everything below is an FAQ that quotes this paragraph back`);
    const m = v.match(/compares them on ([^—]+) — read down/);
    if (!m) { bad.push(`${p.route}: the verdict no longer names the dimensions it is asking the reader to decide on, so this gate cannot check that they exist`); return; }
    const dims = m[1].split(/,\s*|\s+and\s+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
    if (!dims.length) { bad.push(`${p.route}: the verdict names zero dimensions`); return; }
    const tbody = (p.html.split('<tbody>')[1] || '').split('</tbody>')[0];
    const heads = [...tbody.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((x) => x[1].replace(/<[^>]*>/g, '').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim().toLowerCase());
    dims.forEach((d) => {
      named++;
      if (!heads.includes(d)) bad.push(`${p.route}: the verdict tells the reader to decide on "${d}", and the table has no such row (it has: ${heads.join(' · ')})`);
    });
    // ...and the reverse, so a row can't be added and left out of the sentence.
    heads.filter((h) => h && h !== 'human evidence').forEach((h) => {
      if (!dims.includes(h)) bad.push(`${p.route}: the table has a "${h}" row the verdict does not mention — the sentence is supposed to be built from the rows, not typed next to them`);
    });
  });
  if (!checked) bad.push('no published comparison pages were checked — this gate is running over an empty set');
  if (bad.length) {
    console.error('\n[prerender] THE VERDICT NAMES SOMETHING THE PAGE DOES NOT HAVE — refusing to build.');
    bad.slice(0, 20).forEach((b) => console.error('    ✗ ' + b));
    if (bad.length > 20) console.error(`    … and ${bad.length - 20} more`);
    console.error('');
    process.exit(1);
  }
  console.log(`[prerender] comparison verdicts OK — ${checked} pairs, ${named} named dimensions, every one an actual row, 0 pointing "below".`);
})();

// ---- build-time assertion: A MOBILE-ONLY CONTROL MUST STAY MOBILE-ONLY ------------------------
// W5c FOLLOW-UP (2026-08-02). The tap-target commit put `.menu-btn` into a shared rule reading
// `min-height:44px;display:inline-flex`, which sits AFTER `.menu-btn{display:none}` and therefore
// overrode it at every width. Measured at 1440x900: computed display "flex", 44x44 — the ☰ was
// rendering on DESKTOP, beside the full nav bar it exists to replace.
// Nothing caught it. Every gate on this project asserts that something is PRESENT, correct or
// large enough; none asserts that a control is ABSENT where it should be, and the smoke run drives
// a single 390px viewport where the button is supposed to appear. It was found by looking at a
// screenshot — which is the standing lesson from the /body/leg 3D fix, and it cost a re-render to
// find that a passing gate suite had already hidden.
// The rule this enforces is narrow and exact: any control whose base rule hides it may only be
// un-hidden inside a media query. `display` for such a control is set once, where its behaviour is.
// PROVE IT by adding `.menu-btn` back to the shared 44px rule.
(function assertMobileOnlyControls() {
  const CSS2 = fs.readFileSync(path.join(SITE, 'styles.css'), 'utf8');
  const bad = [];
  // Blocks nested inside @media are stripped first, so what is left is the unconditional cascade.
  let top = CSS2, prev = null;
  while (top !== prev) { prev = top; top = top.replace(/@media[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, ''); }
  const MOBILE_ONLY = ['.menu-btn'];
  MOBILE_ONLY.forEach((sel) => {
    const rules = [...top.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].split(',').some((x) => x.trim() === sel || x.trim().endsWith(' ' + sel)));
    if (!rules.length) { bad.push(`${sel} has no unconditional rule at all — this gate has stopped covering it`); return; }
    const displays = rules.map((m) => (m[2].match(/(?:^|;)\s*display\s*:\s*([^;]+)/) || [])[1]).filter(Boolean).map((x) => x.trim());
    if (!displays.length) { bad.push(`${sel} is never hidden outside a media query — it is supposed to be a phone-only control`); return; }
    displays.forEach((d) => {
      if (d !== 'none') bad.push(`${sel} is set to display:${d} OUTSIDE a media query — it is a phone-only control, and an unconditional display overrides the "display:none" that keeps it off the desktop header next to the full nav it replaces`);
    });
  });
  if (bad.length) {
    console.error('\n[prerender] A PHONE-ONLY CONTROL IS SHOWING ON DESKTOP — refusing to build.');
    bad.forEach((b) => console.error('    ✗ ' + b));
    console.error('');
    process.exit(1);
  }
  console.log(`[prerender] phone-only controls OK — ${MOBILE_ONLY.length} control(s), hidden unconditionally and revealed only inside a media query.`);
})();

// ---- build-time assertion: ANONYMOUS-FIRST IS A BEHAVIOUR, NOT A SENTENCE ---------------------
// W5d (2026-08-02). Product constraint 3 is that reading, logging and the $0 protocol must work
// with NO ACCOUNT, and the site says so out loud in four served places:
//   / hero kicker   "Free · no account · nothing here is for sale"
//   / hero note     "Free · no account · no affiliate links"
//   /about          "Free, no paywall, no account needed."
//   /plan lede      "Your plan lives in this browser — there is no account to create"
// Measured against the code, three things contradicted that:
//   1. site/app.js opened the SIGN-UP MODAL, unprompted, 500 ms after a reader accepted a shared
//      protocol into their plan — landing them on /plan, the page that says there is no account to
//      create. The deleted line's own comment read "client makes an account to keep it", and that
//      was the false part: the plan is in localStorage and is kept either way. An account only
//      SYNCS it, which /plan offers on the reader's own initiative.
//   2. the auth modal said "Sign in to log food, comment and edit pages" and "Create an account to
//      log your meals" — while the barcode scanner's own modal says "no account or AI needed" and
//      the 7-day $0 logger is device-local by design. Four surfaces, two answers.
//   3. the header "Sign in" was `.acct-btn.primary` — the only FILLED accent button in the header,
//      on all 568 routes, next to the hero kicker above. A filled primary button is a page's main
//      call to action, and an optional account is not the main call to action of an
//      anonymous-first site.
// What an account actually unlocks is short and server-side: /api/plan (sync to another device),
// /api/comments, /api/edits, /api/profile, /api/checkin, /api/markers, /api/mydata, /api/rep.
// This gate cannot be a smoke test: the path that opened the modal is the SHARED-protocol view,
// which needs a database, and the read-only run mode has none. So it is a source assertion, and
// each of its three checks names a specific regression route rather than a mood.
// PROVE IT by wrapping any openAuth() call in a setTimeout, by putting `primary` back on the
// sign-in button, or by deleting "do not need" from the register copy.
(function assertAnonymousFirst() {
  const APP3 = fs.readFileSync(path.join(SITE, 'app.js'), 'utf8');
  const bad = [];
  // 1. an account prompt the reader did not ask for
  [...APP3.matchAll(/setTimeout\(([^;]{0,240})/g)].forEach((m) => {
    if (/openAuth\s*\(/.test(m[1])) bad.push(`site/app.js opens the account modal from inside a setTimeout — "${m[1].replace(/\s+/g, ' ').slice(0, 110)}…". An account prompt the reader did not tap for is the opposite of anonymous-first, whatever the copy underneath it says`);
  });
  // 2. the header control must not be the page's primary call to action
  const si = APP3.match(/id="signin-btn"[^`]*/) || APP3.match(/class="acct-btn[^"]*"[^>]*id="signin-btn"/);
  const siLine = (APP3.match(/^.*id="signin-btn".*$/m) || [''])[0];
  if (!siLine) bad.push('site/app.js no longer renders a #signin-btn — this gate has stopped covering the header control');
  else {
    if (/class="acct-btn[^"]*\bprimary\b/.test(siLine)) bad.push('the header "Sign in" button carries .primary — the only filled accent button on 568 routes, next to a hero that says "Free · no account". An optional account is not the site\'s main call to action');
    if (!/aria-label="[^"]*optional/i.test(siLine)) bad.push('the header "Sign in" button does not say in its accessible name that an account is optional — the visible label has no room for it and the surrounding copy is four screens away');
  }
  // 3. the modal must lead with what needs no account
  const modal = (APP3.match(/<p class="modal-sub">([\s\S]{0,700}?)<\/p>/) || [])[1] || '';
  if (!modal) bad.push('site/app.js has no auth modal sub-copy — this gate has stopped covering what the modal claims');
  else {
    if (!/do not need|optional/i.test(modal)) bad.push(`the auth modal does not tell the reader an account is optional: "${modal.replace(/\s+/g, ' ').slice(0, 140)}…"`);
    if (/log (your meals|food)/i.test(modal)) bad.push('the auth modal still claims an account is needed to log food — the barcode scanner says "no account or AI needed" and the 7-day logger is device-local, so that is two answers on one site');
  }
  if (bad.length) {
    console.error('\n[prerender] THE SITE SAYS "NO ACCOUNT" AND THEN ASKS FOR ONE — refusing to build.');
    bad.forEach((b) => console.error('    ✗ ' + b));
    console.error('');
    process.exit(1);
  }
  console.log('[prerender] anonymous-first OK — 0 unprompted account modals, the header control is not the page CTA, and the modal says an account is optional.');
})();

// ---- build-time assertion: A COUNT IN A TITLE MUST BE THE COUNT ON THE PAGE -------------------
// W5d (2026-08-02). Measured hydrated at 390x844 on all 103 /target routes
// (qa/out/w5cdi/before-390.json): the <title> read "<SYM>: the compounds that hit it" and the
// description ended "and every compound that acts on it", on 103/103 — while the actual
// compound-link count per page was 1 on 77 routes, 2 on 17, 3 on 6, 4 on 1, 5 on 1 and 11 on 1.
// 77 pages promised a list in the search result, the browser tab and the share card, and held one
// item. The on-page "· N COMPOUNDS" badge was already honest; only the framing built on top of it
// was not. Same defect class as "Covers all 170 compounds" and "Search 170 compounds".
// This gate reads the number back out of the emitted <title> and counts the actual /c/ links in
// the emitted list, so it cannot be satisfied by the variable the title was supposed to use.
// PROVE IT by putting `seoTitle(`${t.sym}: the compounds that hit it`)` back.
(function assertTargetCounts() {
  const bad = [];
  let checked = 0;
  pages.filter((p) => /^\/target\//.test(p.route)).forEach((p) => {
    checked++;
    const t = (p.html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    // split on the heading TEXT, not the whole tag: shell() injects an <a class="hanchor"> into
    // every h2, so anything anchored to "<h2 ...>" matches nothing and this gate would fail on all
    // 103 while looking like it had found something.
    const parts = p.html.split(/compounds? acting on/i);
    const listBlock = parts.length > 1 ? parts[parts.length - 1] : '';
    const links = new Set([...listBlock.matchAll(/href="(\/c\/[^"]+)"/g)].map((m) => m[1]));
    const n = links.size;
    if (!n) { bad.push(`${p.route}: the compound list is empty or the heading was renamed, so this gate cannot count it`); return; }
    const claimed = (t.match(/the (\d+) compounds that hit it/) || [])[1];
    if (claimed === undefined) {
      if (n !== 1 || !/the one compound that hits it/.test(t)) bad.push(`${p.route}: <title> "${t}" states no compound count, and the page lists ${n}`);
      return;
    }
    if (+claimed !== n) bad.push(`${p.route}: <title> claims ${claimed} compounds and the page lists ${n} — "${t}"`);
    if (n === 1) bad.push(`${p.route}: <title> uses the plural for a single compound — "${t}"`);
  });
  if (!checked) bad.push('no /target pages were checked — this gate is running over an empty set');
  if (bad.length) {
    console.error('\n[prerender] A TITLE PROMISES A LIST THE PAGE DOES NOT HAVE — refusing to build.');
    bad.slice(0, 20).forEach((b) => console.error('    ✗ ' + b));
    if (bad.length > 20) console.error(`    … and ${bad.length - 20} more`);
    console.error('');
    process.exit(1);
  }
  console.log(`[prerender] target counts OK — ${checked} pages, every <title> count equal to the compounds actually listed.`);
})();

// ---- build-time assertion: THE COMPARISON CLUSTER MUST BE CONNECTED --------------------------
// W5d (2026-08-02). Measured hydrated at 390x844 on all 123 published pairs
// (qa/out/w5cdi/before-390.json): every page contained exactly two anchors matching /compare/, and
// both were the breadcrumb. Links to another PAIR: 0 on 123 of 123. A 123-page cluster with no
// internal edges — a reader who has just decided neither of these two is right has nowhere to go
// but back to the index, and a crawler sees 123 leaves hanging off one hub.
// assertLinkGraph below already proves no link is dead and no page is an orphan. This proves the
// stronger thing it cannot: that the edges EXIST, that each page carries exactly the number the
// generated map says it should (so a rendering bug cannot quietly drop them), and that site/app.js
// reads the same map — because the SPA replaces #app wholesale, so a block only the prerenderer
// draws reaches a crawler and not a reader.
// PROVE IT by deleting the siblingBlock() call from the comparison body, or by removing the
// RNAWIKI_CMPSIB lookup from site/app.js.
(function assertCompareCluster() {
  const bad = [];
  let checked = 0, edges = 0, isolated = 0;
  const published = new Set(pages.map((x) => x.route));
  pages.filter((p) => /^\/compare\/.+-vs-/.test(p.route)).forEach((p) => {
    checked++;
    const expect = (siblingByRoute[p.route] || []).reduce((n, c) => n + c[1].length, 0);
    const got = [...p.html.matchAll(/href="(\/compare\/[^"]*-vs-[^"]*)"/g)].map((m) => m[1]).filter((r) => r !== p.route);
    if (!expect) { isolated++; return; }
    if (got.length !== expect) bad.push(`${p.route}: the sibling map holds ${expect} lateral link(s) and the page emitted ${got.length}`);
    got.forEach((r) => { if (!published.has(r)) bad.push(`${p.route}: links laterally to ${r}, which is not a published comparison`); });
    edges += got.length;
  });
  if (!checked) bad.push('no published comparison pages were checked — this gate is running over an empty set');
  if (isolated > checked * 0.1) bad.push(`${isolated} of ${checked} comparison pages have no sibling at all — the cluster has come apart, not just this page`);
  const APP2 = fs.readFileSync(path.join(SITE, 'app.js'), 'utf8');
  if (!/RNAWIKI_CMPSIB/.test(APP2)) bad.push('site/app.js never reads window.RNAWIKI_CMPSIB — the lateral links reach a crawler and not a reader, which is exactly the split D2/D33 were');
  if (bad.length) {
    console.error('\n[prerender] THE COMPARISON CLUSTER HAS NO INTERNAL LINKS — refusing to build.');
    bad.slice(0, 20).forEach((b) => console.error('    ✗ ' + b));
    if (bad.length > 20) console.error(`    … and ${bad.length - 20} more`);
    console.error('');
    process.exit(1);
  }
  console.log(`[prerender] comparison cluster OK — ${edges} lateral edges across ${checked} pairs, ${isolated} with no sibling, app.js reads the map.`);
})();

// ---- build-time assertion: A TABLE CELL MUST SAY SOMETHING ------------------------------------
// W5d (2026-08-02). Measured hydrated at 390x844 on all 123 published pairs
// (qa/out/w5cdi/before-390.json): 11 routes rendered a tbody cell whose entire content was "—",
// always the BOTTOM LINE row, always Iron or Vitamin C (Ascorbate) — the two consumer-renderable
// compounds among the 34 in the corpus with an empty `bottom`. On a page whose whole job is to put
// two things side by side, an em-dash in one column reads as a statement about that compound when
// it is a statement about the corpus. This gate covers all 123 published documents, which is 123x
// the coverage a single smoke route can give; the hydrated twin is covered by
// `anAbsentValueSaysSoInWords` in scripts/smoke.mjs on /compare/caffeine-vs-iron, the pair that
// actually has the gap — a gate over an empty set always passes.
// PROVE IT by putting `${va || '—'}` back in the cmp() helper above.
(function assertNoBareDashCells() {
  const bad = [];
  let cells = 0, pagesChecked = 0;
  pages.filter((p) => /^\/compare\/.+-vs-/.test(p.route)).forEach((p) => {
    pagesChecked++;
    const tbody = p.html.split('<tbody>')[1];
    if (!tbody) { bad.push(`${p.route}: comparison table has no <tbody>`); return; }
    [...tbody.split('</tbody>')[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].forEach((m) => {
      cells++;
      // strip the aria-hidden per-cell compound label and any markup, then ask what is left
      const txt = m[1].replace(/<span class="cmp-who"[\s\S]*?<\/span>/g, '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim();
      if (!txt) bad.push(`${p.route}: a comparison cell is empty`);
      else if (/^[—–-]+$/.test(txt)) bad.push(`${p.route}: a comparison cell reads only "${txt}" — in a two-column comparison that is read as a fact about the compound, and it is a fact about the corpus`);
    });
  });
  if (!pagesChecked) bad.push('no published comparison pages were checked — this gate is running over an empty set and would pass whatever happened');
  if (bad.length) {
    console.error('\n[prerender] A COMPARISON CELL SAYS NOTHING — refusing to build.');
    bad.slice(0, 20).forEach((b) => console.error('    ✗ ' + b));
    if (bad.length > 20) console.error(`    … and ${bad.length - 20} more`);
    console.error('');
    process.exit(1);
  }
  console.log(`[prerender] comparison cells OK — ${cells} cells across ${pagesChecked} pairs, none empty and none a bare dash.`);
})();
console.log(`[prerender] base URL: ${SITE_URL}`);
