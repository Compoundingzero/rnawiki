// Curated Singapore food seed — REAL values, hand-sourced.
//
// Why this exists: HPB's SG FoodID portal (pphtpc.hpb.gov.sg/web/sgfoodid) is a
// client-rendered SPA with no public data API, so it cannot be scraped cleanly.
// Rather than fabricate an endpoint, we seed the most-logged SG hawker dishes with
// values consistent with HPB's published Energy & Nutrient Composition tables
// (macros + sodium are well established for these dishes) and add protocol-relevant
// whole foods with standard food-composition micronutrient values.
//
// HONESTY RULE: a nutrient is `null` when a reliable per-serving value is not known
// (do NOT write 0 — the tracker treats null as "not reported", not "contains none").
// Whole-food micros use standard composition values (USDA/typical). Numbers are
// rounded, per the stated serving. This is nutrition guidance, not lab-grade data.
//
// Fields (per serving): kcal, protein_g, carbs_g, sugar_g, fat_g, fiber_g, sodium_mg,
// vitamin_c_mg, vitamin_d_iu, calcium_mg, magnesium_mg, zinc_mg, iron_mg,
// potassium_mg, omega3_mg, glycine_g, choline_mg

const N = null;
function f(name, serving, tags, v) {
  return { name, serving, sg_local: true, source: 'seed', tags: tags || [], ...defaults, ...v };
}
const defaults = {
  kcal: N, protein_g: N, carbs_g: N, sugar_g: N, fat_g: N, fiber_g: N, sodium_mg: N,
  vitamin_c_mg: N, vitamin_d_iu: N, calcium_mg: N, magnesium_mg: N, zinc_mg: N,
  iron_mg: N, potassium_mg: N, omega3_mg: N, glycine_g: N, choline_mg: N,
};

// ---- SG hawker & local dishes (1 typical plate/bowl) ----
const HAWKER = [
  f('Hainanese Chicken Rice', '1 plate (~450g)', ['high-glycemic'], { kcal: 607, protein_g: 23, carbs_g: 75, sugar_g: 2, fat_g: 23, fiber_g: 1, sodium_mg: 1220, glycine_g: 1.2 }),
  f('Char Kway Teow', '1 plate (~350g)', ['high-glycemic', 'high-fat'], { kcal: 744, protein_g: 23, carbs_g: 76, sugar_g: 6, fat_g: 38, fiber_g: 3, sodium_mg: 1460 }),
  f('Laksa', '1 bowl (~500g)', ['high-fat', 'high-sodium'], { kcal: 590, protein_g: 22, carbs_g: 55, sugar_g: 6, fat_g: 32, fiber_g: 3, sodium_mg: 2200 }),
  f('Nasi Lemak (with fried chicken)', '1 plate', ['high-glycemic', 'high-fat'], { kcal: 790, protein_g: 28, carbs_g: 80, sugar_g: 5, fat_g: 40, fiber_g: 3, sodium_mg: 1300 }),
  f('Bak Chor Mee (dry)', '1 bowl', ['high-glycemic'], { kcal: 511, protein_g: 22, carbs_g: 68, sugar_g: 4, fat_g: 16, fiber_g: 3, sodium_mg: 1590 }),
  f('Fishball Noodle Soup', '1 bowl', [], { kcal: 340, protein_g: 20, carbs_g: 52, sugar_g: 3, fat_g: 6, fiber_g: 2, sodium_mg: 1420 }),
  f('Wanton Mee (dry)', '1 bowl', ['high-glycemic'], { kcal: 409, protein_g: 19, carbs_g: 59, sugar_g: 5, fat_g: 11, fiber_g: 3, sodium_mg: 1330 }),
  f('Roti Prata (2 plain + curry)', '2 pieces + curry', ['high-glycemic', 'high-fat'], { kcal: 560, protein_g: 12, carbs_g: 66, sugar_g: 4, fat_g: 27, fiber_g: 3, sodium_mg: 900 }),
  f('Economic Rice (3 veg + 1 meat)', '1 plate', [], { kcal: 620, protein_g: 25, carbs_g: 78, sugar_g: 6, fat_g: 22, fiber_g: 5, sodium_mg: 1200, vitamin_c_mg: 15 }),
  f('Yong Tau Foo (soup, 6 pcs + noodle)', '1 bowl', ['balanced'], { kcal: 380, protein_g: 24, carbs_g: 45, sugar_g: 5, fat_g: 11, fiber_g: 5, sodium_mg: 1500, calcium_mg: 120 }),
  f('Chicken Breast (steamed, no skin)', '150g', ['high-protein', 'lean'], { kcal: 248, protein_g: 47, carbs_g: 0, sugar_g: 0, fat_g: 5, fiber_g: 0, sodium_mg: 105, zinc_mg: 1.5, choline_mg: 130, glycine_g: 2.1 }),
  f('Fish Soup (sliced, with rice)', '1 bowl', ['high-protein', 'lean'], { kcal: 420, protein_g: 33, carbs_g: 45, sugar_g: 3, fat_g: 11, fiber_g: 2, sodium_mg: 1600, omega3_mg: 400, vitamin_d_iu: 120 }),
  f('Thunder Tea Rice (Lei Cha)', '1 bowl', ['high-fiber', 'balanced'], { kcal: 450, protein_g: 18, carbs_g: 65, sugar_g: 6, fat_g: 12, fiber_g: 10, sodium_mg: 900, magnesium_mg: 90, vitamin_c_mg: 30 }),
  f('Popiah', '1 roll', ['high-fiber'], { kcal: 240, protein_g: 8, carbs_g: 34, sugar_g: 8, fat_g: 8, fiber_g: 5, sodium_mg: 650, vitamin_c_mg: 18 }),
  f('Soya Bean Milk (unsweetened)', '1 cup (250ml)', [], { kcal: 80, protein_g: 7, carbs_g: 4, sugar_g: 1, fat_g: 4, fiber_g: 1, sodium_mg: 30, calcium_mg: 60, magnesium_mg: 40 }),
  f('Kaya Toast set (2 toast, no drink)', '2 slices', ['high-glycemic', 'high-sugar'], { kcal: 380, protein_g: 8, carbs_g: 42, sugar_g: 18, fat_g: 20, fiber_g: 1, sodium_mg: 480 }),
  f('Teh Tarik (with condensed milk)', '1 cup', ['high-sugar'], { kcal: 170, protein_g: 3, carbs_g: 28, sugar_g: 26, fat_g: 5, fiber_g: 0, sodium_mg: 55, calcium_mg: 90 }),
  f('Kopi (with condensed milk)', '1 cup', ['high-sugar'], { kcal: 115, protein_g: 2, carbs_g: 20, sugar_g: 19, fat_g: 3, fiber_g: 0, sodium_mg: 40 }),
];

// ---- protocol-relevant whole foods (standard composition micros) ----
const WHOLE = [
  f('Kiwi fruit', '1 fruit (~75g)', ['vitamin-c', 'anti-inflammatory'], { kcal: 42, protein_g: 0.8, carbs_g: 10, sugar_g: 6, fiber_g: 2, vitamin_c_mg: 64, potassium_mg: 215, magnesium_mg: 12 }),
  f('Orange', '1 medium (~130g)', ['vitamin-c'], { kcal: 62, protein_g: 1.2, carbs_g: 15, sugar_g: 12, fiber_g: 3, vitamin_c_mg: 70, calcium_mg: 52, potassium_mg: 237 }),
  f('Red bell pepper', '1 cup raw (~150g)', ['vitamin-c', 'collagen-synthesis'], { kcal: 39, protein_g: 1.5, carbs_g: 9, sugar_g: 6, fiber_g: 3, vitamin_c_mg: 190, potassium_mg: 314 }),
  f('Guava', '1 fruit (~55g)', ['vitamin-c'], { kcal: 37, protein_g: 1.4, carbs_g: 8, sugar_g: 5, fiber_g: 3, vitamin_c_mg: 125, potassium_mg: 229 }),
  f('Salmon (cooked)', '150g fillet', ['omega-3', 'high-protein', 'anti-inflammatory'], { kcal: 280, protein_g: 40, fat_g: 13, sodium_mg: 90, omega3_mg: 3500, vitamin_d_iu: 800, potassium_mg: 700, zinc_mg: 0.6, choline_mg: 140 }),
  f('Sardines (canned in water)', '1 tin (~90g)', ['omega-3', 'calcium', 'high-protein'], { kcal: 180, protein_g: 22, fat_g: 10, sodium_mg: 400, omega3_mg: 1400, calcium_mg: 350, vitamin_d_iu: 180, iron_mg: 2.5 }),
  f('Eggs (2, whole, cooked)', '2 large', ['high-protein', 'choline'], { kcal: 156, protein_g: 13, fat_g: 11, sodium_mg: 140, choline_mg: 294, vitamin_d_iu: 90, zinc_mg: 1.3, glycine_g: 0.5 }),
  f('Greek yogurt (plain, nonfat)', '1 cup (~170g)', ['high-protein', 'calcium', 'probiotic'], { kcal: 100, protein_g: 17, carbs_g: 6, sugar_g: 6, fat_g: 0, sodium_mg: 60, calcium_mg: 190, magnesium_mg: 20, zinc_mg: 1 }),
  f('Spinach (cooked)', '1 cup (~180g)', ['magnesium', 'iron', 'nitrate'], { kcal: 41, protein_g: 5, carbs_g: 7, fiber_g: 4, sodium_mg: 125, magnesium_mg: 157, iron_mg: 6, calcium_mg: 245, potassium_mg: 839, vitamin_c_mg: 18 }),
  f('Pumpkin seeds', '1 oz (~28g)', ['magnesium', 'zinc'], { kcal: 151, protein_g: 7, carbs_g: 5, fiber_g: 2, fat_g: 13, magnesium_mg: 150, zinc_mg: 2.2, iron_mg: 2.3 }),
  f('Oysters (cooked)', '6 medium (~85g)', ['zinc', 'high-protein'], { kcal: 68, protein_g: 8, fat_g: 2, sodium_mg: 175, zinc_mg: 32, iron_mg: 6, omega3_mg: 600, vitamin_d_iu: 270 }),
  f('Lean beef (cooked)', '150g', ['high-protein', 'zinc', 'iron', 'creatine'], { kcal: 320, protein_g: 47, fat_g: 14, sodium_mg: 90, zinc_mg: 9, iron_mg: 4, choline_mg: 140, glycine_g: 2.4 }),
  f('Bone broth', '1 cup (250ml)', ['glycine', 'collagen-synthesis', 'gut'], { kcal: 50, protein_g: 9, sodium_mg: 500, glycine_g: 2.5, calcium_mg: 15, magnesium_mg: 6 }),
  f('Gelatin / collagen peptides', '1 scoop (~11g)', ['glycine', 'collagen-synthesis'], { kcal: 40, protein_g: 10, sodium_mg: 30, glycine_g: 2.2 }),
  f('Whey protein isolate', '1 scoop (~30g)', ['high-protein', 'leucine'], { kcal: 120, protein_g: 25, carbs_g: 2, sugar_g: 1, fat_g: 1, sodium_mg: 60, calcium_mg: 130, glycine_g: 0.4 }),
  f('Tofu (firm)', '150g', ['high-protein', 'calcium', 'magnesium'], { kcal: 220, protein_g: 24, carbs_g: 5, fat_g: 13, sodium_mg: 20, calcium_mg: 525, magnesium_mg: 88, iron_mg: 4 }),
  f('Blueberries', '1 cup (~148g)', ['polyphenol', 'anti-inflammatory'], { kcal: 84, protein_g: 1, carbs_g: 21, sugar_g: 15, fiber_g: 4, vitamin_c_mg: 14, potassium_mg: 114 }),
  f('Broccoli (cooked)', '1 cup (~156g)', ['vitamin-c', 'fiber', 'sulforaphane'], { kcal: 55, protein_g: 4, carbs_g: 11, fiber_g: 5, sodium_mg: 64, vitamin_c_mg: 101, calcium_mg: 62, potassium_mg: 457, magnesium_mg: 33 }),
  f('Almonds', '1 oz (~28g)', ['magnesium', 'healthy-fat', 'vitamin-e'], { kcal: 164, protein_g: 6, carbs_g: 6, fiber_g: 4, fat_g: 14, magnesium_mg: 76, calcium_mg: 76, potassium_mg: 208 }),
  f('Oats (rolled, dry)', '1/2 cup (~40g)', ['fiber', 'beta-glucan', 'low-glycemic'], { kcal: 150, protein_g: 5, carbs_g: 27, sugar_g: 1, fiber_g: 4, magnesium_mg: 55, iron_mg: 1.7, zinc_mg: 1.5 }),
  f('Sweet potato (baked)', '1 medium (~150g)', ['low-glycemic', 'vitamin-a', 'fiber'], { kcal: 130, protein_g: 3, carbs_g: 30, sugar_g: 9, fiber_g: 5, potassium_mg: 540, vitamin_c_mg: 20, magnesium_mg: 33 }),
  f('Avocado', '1/2 fruit (~100g)', ['healthy-fat', 'potassium', 'fiber'], { kcal: 160, protein_g: 2, carbs_g: 9, fiber_g: 7, fat_g: 15, potassium_mg: 485, magnesium_mg: 29 }),
  f('Dark leafy salad (mixed)', '2 cups', ['fiber', 'nitrate', 'folate'], { kcal: 20, protein_g: 2, carbs_g: 4, fiber_g: 2, sodium_mg: 30, vitamin_c_mg: 25, potassium_mg: 300, magnesium_mg: 25 }),
  f('Cottage cheese (low-fat)', '1 cup (~225g)', ['high-protein', 'casein', 'calcium'], { kcal: 180, protein_g: 25, carbs_g: 8, sugar_g: 7, fat_g: 5, sodium_mg: 700, calcium_mg: 138 }),
  f('Tuna (canned in water)', '1 tin (~100g)', ['high-protein', 'lean', 'omega-3'], { kcal: 116, protein_g: 26, fat_g: 1, sodium_mg: 320, omega3_mg: 300, vitamin_d_iu: 60, zinc_mg: 0.6 }),
  f('Dark chocolate (85%)', '2 squares (~20g)', ['magnesium', 'polyphenol'], { kcal: 120, protein_g: 2, carbs_g: 8, sugar_g: 4, fiber_g: 2, fat_g: 9, magnesium_mg: 45, iron_mg: 2 }),
];

module.exports = [...HAWKER, ...WHOLE];
