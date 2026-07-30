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
    // A stranded tail of a few words reads as a mistake; fold it back.
    if (mdWc(cur.join(' ')) < 25 && out.length) out[out.length - 1] += ' ' + cur.join(' ');
    else out.push(cur.join(' '));
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
    case 'controlled': return { tag: 'Controlled substance', body: 'A controlled substance in Singapore (HSA / CNB) and most other countries. Illegal to buy, sell or possess without authorisation. Listed here for completeness only.' };
    case 'prescription': return { tag: 'Prescription only', body: 'A prescription-only medicine. In Singapore it is dispensed by a licensed pharmacy against a doctor\'s prescription — it is not sold over the counter, and buying it from an online marketplace or an overseas seller is both unlawful and unsafe. Speak to a GP or polyclinic.' };
    case 'pharmacy': return { tag: 'Pharmacy medicine', body: 'A pharmacy-only medicine — sold from behind the counter after a pharmacist\'s advice, not off the open shelf.' };
    case 'unapproved': return { tag: 'Not approved', body: 'Not approved for human use in Singapore or most markets. Grey-market supply only: dose, purity and legality are all uncertain.' };
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
    .sort((a, b) => (b.f.sg_local - a.f.sg_local) || (b.h - a.h)).slice(0, 6).map((x) => x.f);
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

function shell({ route, title, desc, jsonld, body, breadcrumbs, ogImage, ogType, robots }) {
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
<noscript><style>.reveal,.reveal *{opacity:1!important;transform:none!important}</style></noscript>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧬</text></svg>">
${crumbLd}${ld}
</head>
<body>
<a class="skip-link" href="#app">Skip to content</a>
<div id="route-status" role="status" aria-live="polite" class="sr-only"></div>
<header class="topbar">
  <a href="/" class="brand">🧬 RNA<span>wiki</span></a>
  <div class="search-wrap"><input id="search" type="search" placeholder="Search 170 compounds, protocols, terms…" autocomplete="off" spellcheck="false"><div id="search-results" class="search-results" hidden></div></div>
  <nav class="topnav">
    <a href="/solve" class="nav-solve">Solve</a><a href="/plan">My Plan</a><a href="/learn">Learn</a>
  </nav>
  <span id="account-slot" class="account-slot"></span>
  <button id="menu-btn" class="menu-btn" aria-label="Menu">☰</button>
</header>
<main id="app">${body}</main>
<footer class="foot"><div>💡 Not medical advice · <a href="/solve">Solve</a> · <a href="/#newsletter">Newsletter</a> · <a href="/plan">My Plan</a> · <a href="/stack">Stack</a> · <a href="/browse">Browse</a> · <a href="/anatomy">Anatomy</a> · <a href="/pathways">Pathways</a> · <a href="/az">A–Z</a> · <a href="/legend">Legend</a> · <a href="/about">About</a></div><div class="foot-stats" id="foot-stats"></div></footer>
<script src="/data.js"></script>
<script src="/facts.js"></script>
<script src="/interactions.js"></script>
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
    b.cost ? card('💰', 'Cost per dose', mdSafe(b.cost.perDose || '') + (b.cost.note ? `<p class="biof-note">${mdSafe(b.cost.note)}</p>` : '')) : '',
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
  const compareHtml = cmpLinks.length ? `<h2>Compare ${esc(c.name)}</h2><ul>${cmpLinks.slice(0, 8).map((x) => `<li><a href="${x.route}">${esc(c.name)} vs ${esc(x.other)}</a></li>`).join('')}</ul>` : '';
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
    <p><b>Evidence:</b> ${stars(c.stars)} · <b>Status:</b> ${(c.approvalLabels || []).join(', ')}</p>
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
    // The star is a whole-compound summary, not an answer to "does it work for MY use", and it was
    // leading the FAQPage answer on all 170 /c/ pages -- i.e. it was the sentence answer engines
    // quoted. The authored bottom line is the honest answer; the star stays on the page, in the
    // badge row where its scope is visible, rather than inside a structured-data efficacy claim.
    (c.bottom || c.plain) ? { q: `Does ${c.name} actually work?`, a: `${snip(c.bottom || c.plain, 260)}` } : null,
    c.protocol ? { q: `How do you take ${c.name}?`, a: snip(c.protocol, 300) } : null,
    c.watch ? { q: `What are the risks or side effects of ${c.name}?`, a: snip(c.watch, 300) } : null,
    (c.approvalLabels || []).length ? { q: `Is ${c.name} legal or approved?`, a: `Regulatory status: ${(c.approvalLabels || []).join(', ')}.` } : null,
  ]);
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: c.name,
    about: { '@type': 'Drug', name: c.name }, description: (c.plain || c.bottom || '').slice(0, 300),
    url: SITE_URL + route, inLanguage: 'en', publisher: PUB.publisher, isPartOf: PUB.isPartOf, dateModified: PUB.dateModified,
  }].concat(cqa.ld || []);
  add(route, shell({ route, title: `${c.name}: dosage, evidence & uses · RNAwiki`, desc: cleanDesc(c.plain || c.bottom || c.mechanism || c.name), jsonld, ogImage: renderOgCard(`og/c/${slug(c.name)}.png`, { kind: 'Compound · ' + (c.category || ''), title: c.name, sub: cleanDesc(c.plain || c.bottom || c.mechanism, 120), starN: c.stars, rx: c.isRx }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: c.name, route }], body: body + cqa.html }));
});

// comparison pages ([A] vs [B]) — high-intent long-tail, non-thin (two full profiles + honest verdict)
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
  const verdict = `We do not publish an indication-specific evidence grade for ${a.name} or ${b.name} for ${gl}, so we are not going to name a winner. `
    + `The star ratings shown below are whole-compound summaries across everything each has been studied for — they are not a grade for this use, and comparing them here would be misleading. `
    + `What actually differs is mechanism, side-effect profile, interactions, availability and cost. Those are compared in full below.`;
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
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: `${a.name} vs ${b.name}`, description: `Compare ${a.name} and ${b.name} for ${gl}.`, url: SITE_URL + route, inLanguage: 'en', publisher: PUB.publisher, isPartOf: PUB.isPartOf, dateModified: PUB.dateModified }].concat(faq.ld || []);
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
  const goalLd = { '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: `${g.label} — what actually helps`, description: `Compounds ranked by human evidence for ${g.label.toLowerCase()}.`, url: SITE_URL + route, inLanguage: 'en', publisher: PUB.publisher, isPartOf: PUB.isPartOf, dateModified: PUB.dateModified };
  add(route, shell({ route, title: `${g.label}: what actually helps (ranked by evidence) · RNAwiki`, desc: `Compounds and full protocols that help you ${g.label.toLowerCase()}, ranked by human evidence — plain English, honest verdicts.`, jsonld: goalLd, ogImage: renderOgCard(`og/goal/${g.id}.png`, { kind: 'Goal', title: g.label, sub: 'What actually helps you ' + g.label.toLowerCase() + ' — ranked by human evidence.' }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: g.label, route }], body }));
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
    // Cause NAMES only, never the bodies -- the bodies are the unverified 995-step chain corpus.
    // NOTE: cause_learn.json is keyed by PROBLEM id ("knee-pain"), not root-cause id. Keying it
    // on rc.id silently renders nothing on all 52 pages rather than failing -- the same
    // looks-complete-but-empty join that this codebase keeps producing. Verified: CAUSE[p.id].
    const causeNames = ((CAUSE[p.id] || {}).causes || []).map((c) => c && c.name).filter(Boolean).slice(0, 8);
    const safety = `
      ${plan.reassess ? `<section class="plan-reassess">
        <h3>When to reassess or see a doctor</h3>
        ${mdBlocks(plan.reassess, mdSafe)}
        <p class="esc-note">If something is severe, sudden, or getting rapidly worse, do not work
        through a protocol — in Singapore call <b>995</b> for an emergency, or go to A&amp;E.
        A polyclinic or GP is the right first stop for anything persistent.</p>
      </section>` : ''}
      ${timeline.length ? `<h3>What to expect, and by when</h3>
        <ul>${timeline.map((t) => `<li><b>${esc(t.when)}</b> — ${mdSafe(t.what)}</li>`).join('')}</ul>` : ''}
      ${causeNames.length ? `<h3>Other things that cause this</h3>
        <p>${causeNames.map(esc).join(' · ')}</p>` : ''}
      ${siblings.length ? `<h3>Other root causes of ${esc(p.name)}</h3>
        <p class="muted">If the description above does not sound like you, it is probably one of these.</p>
        <ul>${siblings.map((s) => `<li><a href="/protocol/${p.id}/${s.id}">${esc(s.name.replace(/\s*\([^)]*\)/, ''))}</a></li>`).join('')}</ul>` : ''}`;
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
      <h3>Stack — supplements with human trial evidence for this use</h3>
      ${stack.length
        ? `<ul>${stack.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a> — ${stars(c.stars)}</li>`).join('')}</ul>`
        : `<p>No supplement has trial evidence specific to this problem that we'd put our name to. That is the honest answer, not an omission.</p>`}
      ${med.length ? `<h3>Medical options — discuss with a doctor</h3>
        <p>These are prescription or controlled medicines. We list them so you know they exist and can raise them with a clinician. They are not recommendations, they are not ranked, and we do not give doses for them here.</p>
        <ul>${med.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a></li>`).join('')}</ul>` : ''}
      ${safety}
      <p><a href="/fuel/${p.id}/${rc.id}">Open the Fuel Tracker for this protocol →</a></p>
      <p class="review-state">Written with AI assistance and edited by a human. <b>Not yet reviewed by a clinician.</b> <a href="/methodology">How this page was made</a> · <a href="/corrections">Corrections</a></p>
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
    add(route, shell({ route, title: `${p.name} (${rcShort.toLowerCase()}): exercises, supplements & what works · RNAwiki`, desc: `${p.name} — ${rc.name}: the exercises to fix it, foods to fuel it, and evidence-ranked supplements. A full root-cause protocol. Not medical advice.`, jsonld: protoLd, ogImage: renderOgCard(`og/protocol/${p.id}/${rc.id}.png`, { kind: 'Protocol · ' + (p.category || ''), title: p.name, sub: rc.plain || rc.diagnostic || rc.name }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }, { name: p.name, route }], body: body + pqa.html }));
  });
});

// targets
(D.targets || []).forEach((t) => {
  const route = '/target/' + tkey(t.sym);
  const list = t.compoundIds.map((id) => D.compounds.find((c) => c.id === id)).filter(Boolean);
  const body = `${crumbHtml([{ name: 'Home', route: '/' }, { name: 'Browse', route: '/browse' }, { name: t.sym }])}
    <h1>${esc(t.sym)}</h1><p>${esc(t.name)} — the molecular target that ${list.length} compounds in the wiki act on.</p>
    ${t.pomNotice ? `<div class="pom-notice"><b>⚕️ Prescription-only medicines are named on this page.</b> ${mdSafe(t.pomNotice.text)}</div>` : ''}
    ${t.explainer ? `<div>${t.explainer.html}</div>` : ''}
    ${/* 103 target pages averaged 175 words against 117,232 words of authored target_learn content.
          These were the LAST layer held back by the stage-2 gate audit, and correctly so: 37 of them
          named a prescription-only medicine with no status anywhere on the page. That is now
          generated from regulatory_class.json (see parse.js) rather than hand-written, so it cannot
          rot as the corpus grows, and the emission is safe to turn on. */ ''}
    ${learnFlatHtml(t)}
    <h2>Compounds acting on ${esc(t.sym)}</h2><ul>${list.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a></li>`).join('')}</ul>`;
  add(route, shell({ route, title: `${t.sym} — molecular target & the compounds that hit it · RNAwiki`, desc: `${t.sym}: ${(t.name || '').slice(0, 130)}. Learn what it does and every compound that acts on it.`, ogImage: renderOgCard(`og/target/${tkey(t.sym)}.png`, { kind: 'Molecular target', title: t.sym, sub: cleanDesc((t.explainer && t.explainer.html || '').replace(/<[^>]+>/g, ' ').replace(/^\s*In one line:\s*/i, ''), 120) }), breadcrumbs: [{ name: 'Home', route: '/' }, { name: t.sym, route }], body }));
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

function learnFlatHtml(e, opts) {
  if (!e) return '';
  const P = (t) => mdBlocks(t, mdSafe);
  const out = [];
  // — 30 seconds —
  if (e.hook && e.hook.payoff) out.push(`<p class="lf-payoff">${mdSafe(e.hook.payoff)}</p>`);
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
    out.push('<h2>How it actually works, step by step</h2>');
    if (e.cascade) out.push(e.cascade);
    out.push(`<ol class="lf-steps">${e.mechSteps.map((m) => {
      const t = m.t ? `<b>${mdSafe(m.t)}</b>` : '';
      const d = m.d ? ` ${mdSafe(m.d)}` : '';
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
  if (e.expertLens) out.push(`<h2>How an expert reasons with this</h2>${P(e.expertLens)}${(e.widgets || {}).expertLens || ''}`);
  // RETRIEVAL DEVICES (added 2026-07-28). I originally left selfTest and canExplain out as
  // "checklists, not exposition". A design review pushed back and was right: retrieval practice IS
  // learning content, and their absence is a large part of why a 7,500-word page still reads as
  // thin. 15,565 words of it were crawler-invisible. What makes the page feel like a course is not
  // more prose — it is the question you cannot yet answer, and the claim you can now make.
  if (Array.isArray(e.canExplain) && e.canExplain.length) {
    out.push(`<h2>What you can explain after this</h2><ul class="lf-can">${e.canExplain.map((c) => `<li>${mdSafe(c)}</li>`).join('')}</ul>`);
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
  return out.length ? `<section class="learn-flat">${out.join('')}</section>` : '';
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
  add(route, shell({ route, title: `${m.title.replace(/^MODULE\s*\d+\s*[—-]\s*/i, '')} · RNAwiki Foundations`, desc: `Foundations: ${m.title}`, breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Foundations', route: '/learn' }], body: `<div class="article">${foundationsDiagram(i)}${m.html || ''}${learnFlatHtml(m.expand)}${learnScaffold(m)}</div>` }));
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
    <h2>What this muscle actually does</h2>
    <p>Each movement below is animated — the grey part stays still, the teal part is what this muscle moves.</p>
    <div class="afig-grid">${(a.action_figures || []).join('') || (a.actions || []).map((x) => `<p>${esc(x)}</p>`).join('')}</div>
    <h2>How the muscle works</h2><p>${esc(m.mechanism)}</p>
    <p><b>Fibre-type bias:</b> ${esc(m.fiber_bias)}</p><p><b>Functional role:</b> ${esc(m.functional_role)}</p>
    <h2>Common problems</h2><ul>${(m.common_problems || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>Training & stretching</h2><p>${esc(m.training || '')}</p><p>${esc(m.stretching || '')}</p>
    ${(m.problems || []).length ? `<h2>Fix or train this</h2><ul>${m.problems.map((pid) => { const pr = GRAPH.problems.find((x) => x.id === pid); return pr ? `<li><a href="/protocol/${pid}/${pr.root_causes[0].id}">${esc(pr.name)}</a></li>` : ''; }).join('')}</ul>` : ''}${learnFlatHtml(m.expand)}</div>`;
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
    <p><b>Byproduct:</b> ${esc(e.byproduct)}</p><p><b>Recovery:</b> ${esc(e.recovery)}</p><p><b>Training:</b> ${esc(e.training)}</p>${learnFlatHtml(e.expand)}</div>`;
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
    ${(() => { const cs = (p.compounds || []).map((n) => findCpt(n)).filter(Boolean); const seen = new Set(); const u = cs.filter((c) => !seen.has(c.id) && seen.add(c.id)); return u.length ? `<h2>Compounds that act on this</h2><ul>${u.map((c) => `<li><a href="/c/${slug(c.name)}">${esc(c.name)}</a></li>`).join('')}</ul>` : ''; })()}${learnFlatHtml(p.expand)}</div>`;
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

// solve hub
// FIXED 2026-07-28: this listed only root_causes[0] of each problem, so of the 52 protocol pages
// exactly 41 had a funnel entry and the other 11 were reachable only from a compound page or the
// sitemap. Every root cause is its own page with its own protocol, so list them all -- and name the
// cause, because "Knee pain" three times is not a useful set of links to a crawler or a reader.
add('/solve', shell({ route: '/solve', title: 'Solve a problem or reach a goal — protocol engine · RNAwiki', desc: 'Tell us the problem to fix or goal to reach. Get a full Move · Fuel · Stack protocol for the root cause, localised for Singapore.', breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'Solve', route: '/solve' }], body: `<h1>Stop guessing. Start solving.</h1><p>Pick a problem or goal and get a full protocol — the movement to fix it, Singapore foods to fuel it, and evidence-ranked compounds. Each problem is broken into its root causes, because the fix depends on which one you have.</p>${GRAPH.problems.map((p) => `<h2>${esc(p.name)}</h2><ul>${p.root_causes.map((rc) => `<li><a href="/protocol/${p.id}/${rc.id}">${esc(p.name)} — ${esc(rc.name.replace(/\s*\([^)]*\)/, ''))}</a></li>`).join('')}</ul>`).join('')}` }));

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
    .map((p) => `<a class="seed-chip" data-pid="${esc(p.id)}" href="/protocol/${esc(p.id)}/${esc(p.root_causes[0].id)}">${p.icon || ''} ${esc(p.name)}</a>`)
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
      <p class="hero-lead">Start from the other end. Name the problem &mdash; we&rsquo;ll show you the
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
      the <b>human</b> evidence. Each one says up front how many you can actually buy in Singapore.</p>
      <ul class="gi-list">${goalLinks}</ul>
    </section>

    ${nlBlock('home-close', false)}`;

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
    desc: 'RNAwiki is a free, evidence-ranked wiki of compounds, protocols and pathways, written for Singapore. What is inside, how it is built, how to read it — and what it is not.',
    breadcrumbs: [{ name: 'Home', route: '/' }, { name: 'About', route: '/about' }],
    body: `<div class="article"><h1>About RNAwiki</h1>
      <div class="disclaimer"><strong>Not medical advice.</strong> Everything here is educational. Nothing on this site recommends taking any substance. Prescription, controlled and non-approved compounds are documented for completeness, and documenting something is not endorsing it. If you have a health problem, see a clinician — in Singapore, a GP or polyclinic, and <b>995</b> or A&amp;E in an emergency.</div>
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
        <li><strong>Availability</strong> is shown separately, for Singapore: over the counter,
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
      <h2>Regulatory badges</h2>
      <p>A badge says who has <em>approved</em> a molecule. <strong>It is not a statement about where you can buy it.</strong> A medicine can be approved and still be prescription-only.</p>
      <ul>${Object.entries(D.approvalLabels || {}).map(([b, l]) => `<li><b>${b}</b> — ${esc(l)}</li>`).join('')}</ul>
      <h2>Availability</h2>
      <p>Availability is shown separately from approval, for Singapore: over the counter, pharmacy medicine, prescription only, controlled, or not approved. Where a compound is prescription-only we say so and do not give a dose.</p>
      <p><a href="/about">More about how this site is made →</a></p></div>` }));

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
    desc: 'The master signalling pathways behind every compound on RNAwiki — GPCR/cAMP, nuclear receptors, mTOR, AMPK, NO/cGMP and more, each with the compounds that act on it.',
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
const now = new Date().toISOString().slice(0, 10);
const urls = ['/', '/solve', '/browse', '/az', '/about', '/learn', '/pathways', '/legend', ...pages.map((p) => p.route)];
const uniq = [...new Set(urls)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniq.map((u) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>${u === '/' ? '1.0' : u.startsWith('/protocol') || u.startsWith('/c/') ? '0.8' : '0.6'}</priority></url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(SITE, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(SITE, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`[prerender] wrote ${written} static pages + sitemap.xml (${uniq.length} urls) + robots.txt; swept ${swept} stale files`);
console.log(`[prerender] base URL: ${SITE_URL}`);
