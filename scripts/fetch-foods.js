#!/usr/bin/env node
// Phase-1 pipeline: build data/foods.json for the Fuel Tracker.
//   1. Curated SG seed (scripts/sg_food_seed.js) — real hawker + whole-food values.
//   2. OpenFoodFacts Singapore packaged foods (live API, retried; baked to static).
// Output is a unified schema + a lightweight predictive-search index. Runs at build
// time so production makes ZERO API calls (keeps the site free + fast + rate-limit safe).
//
// Run: node scripts/fetch-foods.js  ->  data/foods.json

const fs = require('fs');
const path = require('path');
const seed = require('./sg_food_seed');

const OUT = path.join(__dirname, '..', 'data', 'foods.json');
const PAGES = Number(process.env.OFF_PAGES || 4);   // ~100 products/page
const PAGE_SIZE = 100;

const OFF_FIELDS = [
  'product_name', 'brands', 'serving_size', 'nutriments', 'nutriscore_grade', 'countries_tags',
].join(',');

function num(x) { return (x === 0 || x) && isFinite(x) ? Number(x) : null; }
function g2mg(x) { const n = num(x); return n == null ? null : Math.round(n * 1000); }

// map an OFF product (nutriments are per 100g) to our unified schema
function fromOFF(p) {
  const n = p.nutriments || {};
  const name = (p.product_name || '').trim();
  if (!name) return null;
  const kcal = num(n['energy-kcal_100g']);
  const protein = num(n.proteins_100g);
  if (kcal == null && protein == null) return null;   // skip empty records
  return {
    name: p.brands ? `${name} (${p.brands.split(',')[0].trim()})` : name,
    serving: '100 g',
    sg_local: false,
    source: 'openfoodfacts',
    tags: [],
    kcal, protein_g: protein,
    carbs_g: num(n.carbohydrates_100g),
    sugar_g: num(n.sugars_100g),
    fat_g: num(n.fat_100g),
    fiber_g: num(n.fiber_100g),
    sodium_mg: g2mg(n.sodium_100g),
    vitamin_c_mg: g2mg(n['vitamin-c_100g']),
    vitamin_d_iu: num(n['vitamin-d_100g']) != null ? Math.round(num(n['vitamin-d_100g']) * 40000000) : null, // g -> IU (1µg=40IU)
    calcium_mg: g2mg(n.calcium_100g),
    magnesium_mg: g2mg(n.magnesium_100g),
    zinc_mg: g2mg(n.zinc_100g),
    iron_mg: g2mg(n.iron_100g),
    potassium_mg: g2mg(n.potassium_100g),
    omega3_mg: g2mg(n['omega-3-fat_100g']),
    glycine_g: null,
    choline_mg: null,
  };
}

async function fetchPage(page) {
  const url = `https://world.openfoodfacts.org/api/v2/search?countries_tags_en=singapore&fields=${OFF_FIELDS}&page_size=${PAGE_SIZE}&page=${page}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'PBswiki/1.0 (build-time; contact felix)' }, signal: AbortSignal.timeout(20000) });
      if (r.status === 429 || r.status === 503) throw new Error('rate ' + r.status);
      if (!r.ok) throw new Error('http ' + r.status);
      const j = await r.json();
      return j.products || [];
    } catch (e) {
      console.warn(`[foods] OFF page ${page} attempt ${attempt} failed: ${e.message}`);
      await new Promise((res) => setTimeout(res, attempt * 2500));
    }
  }
  return [];
}

function dedupeKey(name) { return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40); }

(async () => {
  const foods = [...seed];
  const seen = new Set(foods.map((f) => dedupeKey(f.name)));

  let offCount = 0;
  for (let p = 1; p <= PAGES; p++) {
    const products = await fetchPage(p);
    if (!products.length) { console.warn(`[foods] page ${p} empty — stopping`); break; }
    for (const prod of products) {
      const f = fromOFF(prod);
      if (!f) continue;
      const k = dedupeKey(f.name);
      if (seen.has(k)) continue;
      seen.add(k); foods.push(f); offCount++;
    }
    console.log(`[foods] page ${p}: kept ${offCount} OFF foods so far`);
  }

  // assign stable ids + a search haystack
  foods.forEach((f, i) => { f.id = 'f' + i; f.hay = (f.name + ' ' + (f.tags || []).join(' ')).toLowerCase(); });

  const payload = {
    generated_by: 'scripts/fetch-foods.js',
    sources: { seed: seed.length, openfoodfacts: offCount },
    note: 'null nutrient = not reported (not zero). Hawker macros ~ HPB composition; whole-food micros ~ standard tables.',
    nutrient_keys: ['kcal', 'protein_g', 'carbs_g', 'sugar_g', 'fat_g', 'fiber_g', 'sodium_mg',
      'vitamin_c_mg', 'vitamin_d_iu', 'calcium_mg', 'magnesium_mg', 'zinc_mg', 'iron_mg', 'potassium_mg', 'omega3_mg', 'glycine_g', 'choline_mg'],
    foods,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload));
  console.log(`[foods] wrote ${OUT}: ${foods.length} foods (${seed.length} seed + ${offCount} OFF)`);
})().catch((e) => { console.error('[foods] FAILED', e.message); process.exit(1); });
