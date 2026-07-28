#!/usr/bin/env node
// build/regulatory_class.js — author the per-compound `regulatory_class` spine.
//
// WHY: `build/prerender.js` currently classifies compounds with two regexes (RX_BY_NAME /
// OTC_OVERRIDE) as a declared stopgap (revision 2, Patch 1). Regexes are the wrong home for a
// safety-critical field — the next compound added silently mis-classifies. This script emits a
// reviewable data file, `data/regulatory_class.json`, that becomes the source of truth. Once
// `build/parse.js` merges it into each compound (see MERGE NOTE at the bottom), `regClass()` reads
// `c.regulatory_class` directly and the regexes are deleted for good.
//
// It is seeded from the SAME classifier logic that shipped in Patch 1, so the seed reproduces the
// verified live behaviour exactly. Human-authored OVERRIDES then fix the 9 unclassified bundles
// and any SG-HSA specifics the emoji badges get wrong. Every row is tagged `source` so a reviewer
// sees at a glance what a human decided vs what the badge implied.
//
// Run: node build/regulatory_class.js   ->   data/regulatory_class.json
//
// CLASSES (7):
//   supplement  — dietary supplement / food-category; sold OTC. Renders in a consumer Stack.
//   otc         — a medicine sold OTC / general-sale (e.g. low-dose NSAID). Renders in a Stack.
//   pharmacy    — SG "Pharmacy-only (P)" medicine: no script, but a pharmacist must hand it over.
//   prescription— SG "Prescription-only (POM)": needs a doctor's script. NEVER in a consumer Stack.
//   controlled  — controlled/scheduled substance (HSA/CNB, or WADA-prohibited hormone/PED).
//   unapproved  — not approved for human use in SG/most markets; grey-market only.
//   unknown     — could not classify; treated as "check locally", never rendered in a Stack.
//
// Only `supplement` and `otc` are consumer-renderable. `pharmacy` is surfaced in the Medical block
// (a pharmacist gate is still a gate), so it groups with prescription for rendering purposes.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site');

global.window = {};
require(path.join(SITE, 'data.js'));
const D = global.window.RNAWIKI_DATA;

// ---- the shipped Patch-1 classifier, verbatim (the seed) ----
const RX_BY_NAME = /\b(statin|atorvastatin|rosuvastatin|simvastatin|tretinoin|isotretinoin|retinoid|finasteride|dutasteride|minoxidil|ssri|sertraline|escitalopram|fluoxetine|pde-?5|sildenafil|tadalafil|bremelanotide|pt-?141|naltrexone|bupropion|ezetimibe|spironolactone|anastrozole|exemestane|letrozole|clomiphene|enclomiphene|metformin|acarbose|semaglutide|tirzepatide|liraglutide|rapamycin|sirolimus|levothyroxine|liothyronine|estradiol|hrt|erythropoietin|\bepo\b|hcg|chorionic|yohimbine|modafinil|armodafinil|methylphenidate|amphetamine|lisdexamfetamine|testosterone|trt|oxandrolone|nandrolone|trenbolone|clenbuterol|zolpidem|trazodone)\b/i;
const CONTROLLED_BY_NAME = /\b(methylphenidate|amphetamine|lisdexamfetamine|modafinil|armodafinil|testosterone|trt|oxandrolone|nandrolone|trenbolone|erythropoietin|\bepo\b|zolpidem)\b/i;
const OTC_OVERRIDE = /^(Vitamin D3|Iron$|Calcium|Magnesium|Zinc|Melatonin)/;
function seedClass(c) {
  const ap = c.approvals || [];
  if (ap.includes('⚫') || CONTROLLED_BY_NAME.test(c.name)) return 'controlled';
  if (OTC_OVERRIDE.test(c.name)) return 'supplement';
  if (ap.includes('🔵') || c.isRx || RX_BY_NAME.test(c.name)) return 'prescription';
  if (ap.includes('🔴')) return 'unapproved';
  if (ap.includes('🟡')) return 'supplement';
  if (ap.includes('🟢')) return 'otc';
  return 'unknown';
}

// ---- HUMAN OVERRIDES ----
// keyed by EXACT compound name. Each: { class, sg, why, split? }
//  - sg: the plain-language Singapore status shown to a reader.
//  - split: true flags a bundle entry that mixes regulatory classes and should be split into
//           separate compounds. Until then it takes its MOST-RESTRICTIVE member's class.
const OVERRIDES = {
  // --- the 9 unclassified "(brief)" bundles (empty approvals, no name hit) ---
  'Agmatine · Glycerol · Theacrine (brief)': { class: 'supplement', sg: 'Sold as dietary supplements in Singapore.', why: 'All three are supplement-category.' },
  'Synephrine · Higenamine · Orlistat (brief)': { class: 'prescription', sg: 'Mixed: synephrine is a supplement, higenamine is WADA-prohibited for athletes, orlistat is a pharmacy/prescription weight-loss medicine.', why: 'Bundle contains orlistat (a medicine) and higenamine (WADA-banned) — most-restrictive wins.', split: true },
  'Cerebrolysin · ARA-290 (brief)': { class: 'unapproved', sg: 'Not approved for human use in Singapore; research/grey-market peptides only.', why: 'Both are unapproved biologics/peptides.' },
  'Elderberry · Andrographis · Lactoferrin · Colostrum (brief)': { class: 'supplement', sg: 'Sold as dietary/immune supplements in Singapore.', why: 'All supplement-category.' },
  'Niacinamide · Biotin · Azelaic acid (brief)': { class: 'supplement', sg: 'Niacinamide/biotin are supplements; low-strength azelaic acid is a cosmetic/OTC topical.', why: 'Supplement + OTC topical; none are POM at the doses discussed.', split: true },
  'DIM / Calcium-D-Glucarate · Vitex · Iron (brief)': { class: 'supplement', sg: 'Sold as dietary supplements in Singapore.', why: 'All supplement-category.' },
  'Strontium · Silica (brief)': { class: 'supplement', sg: 'Strontium citrate and silica are sold as supplements; strontium ranelate (a bone-drug salt) is prescription — this entry refers to the supplement salts.', why: 'Supplement salts, not the ranelate drug.', split: true },
  'Huperzine A · Ginkgo · Panax Ginseng · Uridine (brief)': { class: 'supplement', sg: 'Sold as nootropic/herbal supplements in Singapore.', why: 'All supplement-category.' },
  'PQQ · Ergothioneine · Carnosine · Quercetin (brief)': { class: 'supplement', sg: 'Sold as dietary supplements in Singapore.', why: 'All supplement-category.' },
  // --- SG-HSA specifics the badge/regex get almost-right but should be named precisely ---
  'Minoxidil': { class: 'pharmacy', sg: 'Topical minoxidil (Regaine) is Pharmacy-only (P) in Singapore — no prescription, but bought from a pharmacist. Oral minoxidil is prescription-only.', why: 'Topical is P, not full POM; the regex over-restricted it to prescription.' },
  'Red Yeast Rice · Ezetimibe (brief)': { class: 'prescription', sg: 'Red yeast rice is a supplement; ezetimibe is a prescription cholesterol medicine.', why: 'Bundle mixes a supplement with a POM — most-restrictive wins.', split: true },
  'Letrozole · Raloxifene · Cabergoline · Pregnenolone · Proviron (brief)': { class: 'prescription', sg: 'All prescription medicines (Proviron/mesterolone is also a controlled anabolic).', why: 'Correctly caught by the regex; naming it explicitly.', split: true },
  'Z-drugs (Zolpidem/Ambien) · Trazodone · Doxylamine (brief)': { class: 'prescription', sg: 'Zolpidem is a controlled hypnotic (POM + schedule); trazodone is POM; doxylamine is a Pharmacy-only sedating antihistamine.', why: 'Most-restrictive: zolpidem is controlled, but the bundle is dispensed as prescription/pharmacy.', split: true },
};

// Plain-language SG status per class, used when no per-compound `sg` override is given.
const SG_DEFAULT = {
  supplement: 'Sold as a dietary supplement in Singapore (general sale).',
  otc: 'Available over the counter in Singapore (general sale).',
  pharmacy: 'Pharmacy-only (P) medicine in Singapore — no prescription, but a pharmacist must supply it.',
  prescription: 'Prescription-only medicine (POM) in Singapore — a doctor must prescribe it; not sold OTC.',
  controlled: 'Controlled substance in Singapore (HSA / CNB, or WADA-prohibited for athletes).',
  unapproved: 'Not approved for human use in Singapore or most markets; grey-market supply only.',
  unknown: 'Regulatory status unclear — check the HSA before buying.',
};

const rows = D.compounds.filter((c) => !c.isNote).map((c) => {
  const seed = seedClass(c);
  const ov = OVERRIDES[c.name];
  const cls = ov ? ov.class : seed;
  return {
    id: c.id,
    name: c.name,
    regulatory_class: cls,
    consumer_renderable: cls === 'supplement' || cls === 'otc',
    sg_hsa_status: ov && ov.sg ? ov.sg : SG_DEFAULT[cls],
    // approvals[] restructured to what it actually means: which agency approved which molecule for
    // what. We can only assert the agency badge here; molecule+indication is the human-authored TODO.
    approvals: (c.approvals || []).map((badge) => ({ badge, molecule: null, indication: null })),
    source: ov ? 'human-override' : (seed === 'unknown' ? 'UNCLASSIFIED' : 'seed'),
    needs_split: !!(ov && ov.split),
    needs_human_review: !ov && (seed === 'unknown' || seed === 'prescription' || seed === 'controlled'),
    _seed_was: seed,
    _override_why: ov ? ov.why : undefined,
  };
});

const dist = {};
rows.forEach((r) => { dist[r.regulatory_class] = (dist[r.regulatory_class] || 0) + 1; });

const payload = {
  generated_by: 'build/regulatory_class.js',
  note: 'Source of truth for compound regulatory class. Merged into each compound by build/parse.js. ' +
        'Once every row is source:"human-override" or reviewed, delete RX_BY_NAME/OTC_OVERRIDE from build/prerender.js.',
  classes: Object.keys(SG_DEFAULT),
  distribution: dist,
  renderable_count: rows.filter((r) => r.consumer_renderable).length,
  needs_split_count: rows.filter((r) => r.needs_split).length,
  needs_review_count: rows.filter((r) => r.needs_human_review).length,
  compounds: rows,
};

const OUT = path.join(ROOT, 'data', 'regulatory_class.json');
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
console.log(`[regclass] wrote ${OUT}`);
console.log(`[regclass] ${rows.length} compounds | distribution:`, JSON.stringify(dist));
console.log(`[regclass] renderable: ${payload.renderable_count} | needs split: ${payload.needs_split_count} | needs review: ${payload.needs_review_count}`);
console.log(`[regclass] still UNCLASSIFIED:`, rows.filter((r) => r.regulatory_class === 'unknown').map((r) => r.name).join(', ') || '(none)');

// ---- MERGE NOTE for build/parse.js ----
// After parse.js builds `compounds`, before it writes site/data.js, add:
//
//   const REG = JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','regulatory_class.json'),'utf8'));
//   const regById = Object.fromEntries(REG.compounds.map(r => [r.id, r]));
//   compounds.forEach(c => { const r = regById[c.id]; if (r) {
//     c.regulatory_class = r.regulatory_class;
//     c.sg_hsa_status    = r.sg_hsa_status;
//   }});
//
// Then in build/prerender.js: `regClass()` already returns `c.regulatory_class` when present
// (added in Patch 1). The regexes stay only as the fallback for any compound not yet in the file,
// and `sgAvail()` can read `c.sg_hsa_status` for a precise SG line instead of the generic one.
