#!/usr/bin/env node
// Phase-2: build the MECE root-cause graph -> data/clinical_graph.json
//
// Design decisions (blindspots the raw z.ai prompt missed):
//  - WANTS + NEEDS. The problem set deliberately blends clinical NEEDS (pain,
//    metabolic disease, sleep, mood) with aesthetic/longevity WANTS (skin, hair,
//    muscle, healthspan) — because PBswiki is a "wants-first" wiki.
//  - WIRED, NOT ISLAND. Every root cause links to the EXISTING data: `goal_ids`
//    (the 16 site goals), `pathway_ids` (the 16 master pathways) and `compounds`
//    (name fragments matched against the real 165-compound compendium at runtime).
//    move_tags match scripts/fetch-exercises.js; fuel_tags match scripts/sg_food_seed.js.
//  - GROUNDED TARGETS. nutrient_targets use defensible values (near/above RDA with a
//    stated reason), typed 'goal' (hit it) or 'limit' (stay under). Not medical advice.
//
// Run: node scripts/build-graph.js  ->  data/clinical_graph.json

const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'data', 'clinical_graph.json');

// ---- nutrient target presets (per day, adult; 'goal' = reach, 'limit' = cap) ----
const U = { mg: 'mg', g: 'g', iu: 'IU' };
function T(target, unit, type, why) { return { target, unit, type, why }; }
const PRESET = {
  collagen: {
    protein_g: T(100, U.g, 'goal', 'substrate for new collagen'),
    vitamin_c_mg: T(300, U.mg, 'goal', 'cofactor for prolyl/lysyl hydroxylase in collagen crosslinking'),
    glycine_g: T(10, U.g, 'goal', 'most abundant amino acid in collagen'),
    sugar_g: T(30, U.g, 'limit', 'limit glycation, which stiffens collagen'),
  },
  muscle: {
    protein_g: T(130, U.g, 'goal', '~1.6–2.2 g/kg drives muscle protein synthesis'),
    kcal: T(2400, U.mg && 'kcal', 'goal', 'adequate energy for anabolism'),
  },
  anti_inflam: {
    omega3_mg: T(2000, U.mg, 'goal', 'EPA/DHA lower inflammatory eicosanoids'),
    fiber_g: T(30, U.g, 'goal', 'feeds anti-inflammatory short-chain fatty acids'),
    sugar_g: T(30, U.g, 'limit', 'excess sugar is pro-inflammatory'),
  },
  glucose: {
    fiber_g: T(35, U.g, 'goal', 'blunts glucose excursions'),
    protein_g: T(100, U.g, 'goal', 'improves satiety & glycemic response'),
    magnesium_mg: T(400, U.mg, 'goal', 'cofactor for insulin signalling'),
    sugar_g: T(25, U.g, 'limit', 'reduce glycemic load'),
  },
  bone: {
    calcium_mg: T(1000, U.mg, 'goal', 'bone mineral substrate'),
    vitamin_d_iu: T(2000, U.iu, 'goal', 'calcium absorption'),
    magnesium_mg: T(400, U.mg, 'goal', 'bone matrix & vitamin-D activation'),
    protein_g: T(90, U.g, 'goal', 'collagen bone matrix'),
  },
  sleep: {
    magnesium_mg: T(400, U.mg, 'goal', 'supports GABAergic calming'),
    sugar_g: T(25, U.g, 'limit', 'evening glucose swings fragment sleep'),
  },
  cognitive: {
    omega3_mg: T(2000, U.mg, 'goal', 'DHA is structural in neuronal membranes'),
    choline_mg: T(500, U.mg, 'goal', 'acetylcholine precursor'),
  },
  energy: {
    iron_mg: T(18, U.mg, 'goal', 'oxygen transport; deficiency causes fatigue'),
    vitamin_c_mg: T(90, U.mg, 'goal', 'enhances non-heme iron absorption'),
    magnesium_mg: T(400, U.mg, 'goal', 'ATP is biologically active as Mg-ATP'),
  },
  skin: {
    vitamin_c_mg: T(300, U.mg, 'goal', 'collagen synthesis + antioxidant'),
    omega3_mg: T(1500, U.mg, 'goal', 'skin barrier & anti-inflammatory'),
    protein_g: T(90, U.g, 'goal', 'collagen/keratin substrate'),
    zinc_mg: T(15, U.mg, 'goal', 'skin repair & sebum regulation'),
    sugar_g: T(25, U.g, 'limit', 'glycation ages skin (AGEs)'),
  },
  hair: {
    iron_mg: T(18, U.mg, 'goal', 'low ferritin is a common hair-loss driver'),
    zinc_mg: T(15, U.mg, 'goal', 'follicle keratin & DHT modulation'),
    protein_g: T(100, U.g, 'goal', 'keratin substrate'),
  },
  testosterone: {
    zinc_mg: T(15, U.mg, 'goal', 'deficiency lowers testosterone'),
    vitamin_d_iu: T(2000, U.iu, 'goal', 'associated with androgen status'),
    magnesium_mg: T(400, U.mg, 'goal', 'frees testosterone from SHBG'),
  },
  immune: {
    vitamin_c_mg: T(200, U.mg, 'goal', 'supports immune cell function'),
    zinc_mg: T(15, U.mg, 'goal', 'innate & adaptive immunity'),
    vitamin_d_iu: T(2000, U.iu, 'goal', 'immune modulation'),
  },
  gut: {
    fiber_g: T(35, U.g, 'goal', 'feeds the microbiome / butyrate'),
    sugar_g: T(30, U.g, 'limit', 'excess sugar shifts dysbiosis'),
  },
  fatloss: {
    protein_g: T(130, U.g, 'goal', 'preserves lean mass in a deficit + satiety'),
    fiber_g: T(30, U.g, 'goal', 'satiety'),
    sugar_g: T(25, U.g, 'limit', 'manage energy balance'),
  },
  endurance: {
    iron_mg: T(18, U.mg, 'goal', 'oxygen delivery / VO2'),
    sodium_mg: T(2000, U.mg, 'goal', 'electrolyte for training in SG heat'),
  },
  bp: {
    potassium_mg: T(3500, U.mg, 'goal', 'counters sodium, relaxes vessels'),
    sodium_mg: T(2000, U.mg, 'limit', 'high sodium raises blood pressure'),
    magnesium_mg: T(400, U.mg, 'goal', 'vasodilation'),
  },
  lipids: {
    fiber_g: T(35, U.g, 'goal', 'soluble fiber lowers LDL'),
    omega3_mg: T(2000, U.mg, 'goal', 'lowers triglycerides'),
    sugar_g: T(25, U.g, 'limit', 'sugar raises triglycerides'),
  },
};
function targets(...keys) { return Object.assign({}, ...keys.map((k) => PRESET[k])); }

// domains for stewardship
const PHYSIO = 'physio', DIET = 'dietitian', PHARM = 'pharmacist';

// helper builders
function rc(o) {
  return {
    id: o.id, name: o.name, diagnostic: o.diagnostic || '',
    move_tags: o.move || [], fuel_tags: o.fuel || [], pathway_ids: o.pathways || [],
    goal_ids: o.goals || [], compounds: o.compounds || [],
    nutrient_targets: o.nutrients || {},
    prescription: o.rx || null,
    required_expert_domains: o.domains || [PHYSIO, DIET, PHARM],
  };
}
function P(id, name, icon, kind, category, causes) {
  return { id, name, icon, kind, category, root_causes: causes };
}

// ============================ THE PROBLEM SET ============================
const problems = [
  // ---------- A. Musculoskeletal / pain (NEEDS) ----------
  P('knee-pain', 'Knee Pain', '🦵', 'need', 'Musculoskeletal', [
    rc({ id: 'patellar-tendinopathy', name: 'Patellar tendinopathy (tendon overload)', diagnostic: 'Pain just below the kneecap; worse with jumping, stairs, deep squats.',
      move: ['vmo_knee_strengthening', 'low_impact_deload'], fuel: ['collagen-synthesis', 'vitamin-c', 'high-protein', 'glycine'],
      pathways: [13], goals: ['joints', 'recovery'], compounds: ['Collagen Peptides', 'Vitamin C', 'Omega-3', 'BPC-157', 'Glucosamine'],
      nutrients: targets('collagen'), rx: { scheme: 'Heavy-slow resistance', detail: '3×/week, 3–4 sets, tempo 3-0-3, 6–8 reps at heavy load; pain ≤4/10 during and settled by next morning.' } }),
    rc({ id: 'knee-oa', name: 'Early osteoarthritis (cartilage wear)', diagnostic: 'Stiffness after rest, aching with load, sometimes crepitus; age 40+.',
      move: ['vmo_knee_strengthening', 'hypertrophy_lower', 'low_impact_deload'], fuel: ['anti-inflammatory', 'omega-3', 'high-fiber'],
      pathways: [13], goals: ['joints'], compounds: ['Glucosamine + Chondroitin', 'Boswellia', 'Omega-3', 'Collagen Peptides', 'Astaxanthin'],
      nutrients: targets('anti_inflam', 'collagen'), rx: { scheme: 'Progressive quad loading', detail: 'Build quadriceps strength (leg press, wall sits) 2–3×/week; low-impact conditioning to offload the joint.' } }),
  ]),
  P('low-back-pain', 'Lower Back Pain', '🔙', 'need', 'Musculoskeletal', [
    rc({ id: 'weak-posterior-chain', name: 'Weak posterior chain / deconditioning', diagnostic: 'Dull ache with prolonged sitting or bending; eases with movement.',
      move: ['posterior_chain', 'core_stability', 'hip_mobility'], fuel: ['high-protein', 'anti-inflammatory'],
      pathways: [13], goals: ['recovery', 'muscle'], compounds: ['Omega-3', 'Magnesium', 'Collagen Peptides', 'Creatine'],
      nutrients: targets('anti_inflam', 'muscle'), rx: { scheme: 'McGill big-3 + hip hinge', detail: 'Daily core endurance (bird-dog, side plank, curl-up); hip-hinge strength (RDL, hip thrust) 2–3×/week.' } }),
    rc({ id: 'poor-core-stability', name: 'Poor motor control / core stability', diagnostic: 'Recurrent "tweaks" with sudden or loaded movements.',
      move: ['core_stability', 'posterior_chain'], fuel: ['high-protein'], pathways: [], goals: ['recovery'],
      compounds: ['Magnesium', 'Omega-3'], nutrients: targets('anti_inflam'), rx: { scheme: 'Anti-movement core', detail: 'Pallof press, dead bug, planks — train the core to resist motion before adding load.' } }),
  ]),
  P('neck-shoulder', 'Neck & Shoulder Pain', '💆', 'need', 'Musculoskeletal', [
    rc({ id: 'upper-cross', name: 'Upper-cross posture (desk/phone)', diagnostic: 'Tight upper traps, rounded shoulders, tension headaches.',
      move: ['scapular_stability', 'thoracic_mobility', 'neck_deep_flexor'], fuel: ['anti-inflammatory', 'magnesium'],
      pathways: [13], goals: ['recovery'], compounds: ['Magnesium', 'Omega-3'], nutrients: targets('anti_inflam', 'sleep'),
      rx: { scheme: 'Postural re-balance', detail: 'Strengthen deep neck flexors + lower traps (chin tucks, face pulls, Y-raises); open thoracic spine daily.' } }),
    rc({ id: 'rotator-cuff-impinge', name: 'Rotator-cuff impingement', diagnostic: 'Painful arc lifting the arm overhead; night pain on that shoulder.',
      move: ['rotator_cuff', 'scapular_stability'], fuel: ['collagen-synthesis', 'anti-inflammatory'], pathways: [13], goals: ['joints', 'recovery'],
      compounds: ['BPC-157', 'Collagen Peptides', 'Omega-3'], nutrients: targets('collagen'),
      rx: { scheme: 'Cuff + scap control', detail: 'External-rotation and scapular work daily at low load; avoid painful overhead loading until controlled.' } }),
  ]),
  P('hip-mobility', 'Hip Pain & Stiffness', '🦿', 'need', 'Musculoskeletal', [
    rc({ id: 'glute-weakness', name: 'Glute weakness / hip instability', diagnostic: 'Lateral hip ache, poor single-leg control, knee caves in on squats.',
      move: ['hip_mobility', 'posterior_chain', 'balance_proprioception'], fuel: ['high-protein'], pathways: [], goals: ['recovery', 'muscle'],
      compounds: ['Creatine', 'Collagen Peptides'], nutrients: targets('muscle'), rx: { scheme: 'Glute activation + strength', detail: 'Clamshells, monster walks, hip thrusts, single-leg work 3×/week.' } }),
  ]),
  P('elbow-wrist', 'Wrist / Elbow Tendinitis', '💪', 'need', 'Musculoskeletal', [
    rc({ id: 'lateral-epicondylopathy', name: 'Tendon overuse (tennis/golfer elbow)', diagnostic: 'Pain at the outer/inner elbow with gripping or lifting.',
      move: ['wrist_elbow_tendon', 'grip_loaded_carry'], fuel: ['collagen-synthesis', 'vitamin-c', 'high-protein'], pathways: [13], goals: ['joints', 'recovery'],
      compounds: ['Collagen Peptides', 'Vitamin C', 'BPC-157', 'TB-500'], nutrients: targets('collagen'),
      rx: { scheme: 'Eccentric/isometric loading', detail: 'Heavy isometrics for pain relief, then slow eccentric wrist work daily; load management.' } }),
  ]),
  P('ankle-foot', 'Ankle / Foot Pain', '🦶', 'need', 'Musculoskeletal', [
    rc({ id: 'achilles-tendinopathy', name: 'Achilles tendinopathy', diagnostic: 'Morning stiffness and pain at the heel-cord; worse with running.',
      move: ['ankle_foot', 'balance_proprioception'], fuel: ['collagen-synthesis', 'vitamin-c'], pathways: [13], goals: ['joints', 'recovery'],
      compounds: ['Collagen Peptides', 'Vitamin C', 'Omega-3'], nutrients: targets('collagen'),
      rx: { scheme: 'Alfredson eccentric calf', detail: 'Eccentric heel drops (straight + bent knee) daily, progressing load over 12 weeks.' } }),
  ]),
  P('sarcopenia', 'Muscle Loss (Sarcopenia)', '📉', 'need', 'Musculoskeletal', [
    rc({ id: 'anabolic-resistance', name: 'Anabolic resistance + low protein (aging)', diagnostic: 'Losing strength/muscle with age; low protein intake; less activity.',
      move: ['compound_strength', 'hypertrophy_lower', 'bone_loading'], fuel: ['high-protein', 'leucine'], pathways: [2, 5], goals: ['muscle'],
      compounds: ['Whey / Casein Protein', 'Creatine', 'HMB', 'Vitamin D3', 'EAAs / BCAAs'], nutrients: targets('muscle', 'bone'),
      rx: { scheme: 'Progressive resistance', detail: 'Full-body resistance 2–3×/week; 1.6–2.2 g/kg protein spread across meals with ~2.5 g leucine each.' } }),
  ]),

  // ---------- B. Metabolic (NEEDS) ----------
  P('insulin-resistance', 'Insulin Resistance', '🩸', 'need', 'Metabolic', [
    rc({ id: 'poor-glucose-disposal', name: 'Poor glucose disposal / inactivity', diagnostic: 'Rising fasting glucose or HbA1c, post-meal energy crashes.',
      move: ['compound_strength', 'conditioning_aerobic', 'hypertrophy_lower'], fuel: ['low-glycemic', 'high-fiber', 'high-protein'], pathways: [3, 5], goals: ['fatloss', 'heart'],
      compounds: ['Berberine', 'Metformin', 'Myo-Inositol', 'Acarbose', 'Magnesium'], nutrients: targets('glucose'),
      rx: { scheme: 'Muscle as glucose sink', detail: 'Resistance training + post-meal walks; build muscle to soak up glucose.' } }),
    rc({ id: 'visceral-adiposity', name: 'Visceral adiposity driving resistance', diagnostic: 'Central/belly fat, high waist circumference.',
      move: ['conditioning_aerobic', 'compound_strength'], fuel: ['high-protein', 'high-fiber', 'low-glycemic'], pathways: [3], goals: ['fatloss'],
      compounds: ['Semaglutide', 'Tirzepatide', 'Berberine', 'Green Tea Extract'], nutrients: targets('glucose', 'fatloss'),
      rx: { scheme: 'Deficit + protein', detail: 'Moderate energy deficit, high protein/fiber, daily steps; resistance to protect lean mass.' } }),
  ]),
  P('visceral-fat', 'Belly / Visceral Fat', '🔥', 'want', 'Metabolic', [
    rc({ id: 'energy-surplus', name: 'Chronic energy surplus', diagnostic: 'Gradual central weight gain; more calories in than out.',
      move: ['conditioning_aerobic', 'compound_strength', 'hypertrophy_lower'], fuel: ['high-protein', 'high-fiber', 'low-glycemic'], pathways: [3], goals: ['fatloss'],
      compounds: ['Semaglutide', 'Tirzepatide', 'Caffeine', 'Green Tea Extract', 'Berberine'], nutrients: targets('fatloss'),
      rx: { scheme: 'Deficit + steps + lifting', detail: '~300–500 kcal deficit, 8–10k steps, resistance 3×/week to keep muscle.' } }),
    rc({ id: 'cortisol-fat', name: 'Cortisol / stress-driven storage', diagnostic: 'Stress eating, poor sleep, fat gain despite "eating okay".',
      move: ['conditioning_aerobic', 'mobility_stretch', 'low_impact_deload'], fuel: ['high-protein', 'anti-inflammatory'], pathways: [10], goals: ['fatloss', 'stress'],
      compounds: ['Ashwagandha', 'Rhodiola Rosea', 'Magnesium'], nutrients: targets('fatloss', 'sleep'),
      rx: { scheme: 'Stress + sleep first', detail: 'Prioritise sleep and stress load; avoid crushing cardio that raises cortisol further.' } }),
  ]),
  P('chronic-fatigue', 'Chronic Fatigue / Low Energy', '🔋', 'need', 'Metabolic', [
    rc({ id: 'iron-anemia', name: 'Low iron / anemia', diagnostic: 'Tired, breathless on exertion, pale; heavy periods or low intake.',
      move: ['low_impact_deload', 'conditioning_aerobic'], fuel: ['iron', 'vitamin-c', 'high-protein'], pathways: [11], goals: ['endurance'],
      compounds: ['Iron', 'Vitamin C', 'B-Complex'], nutrients: targets('energy'), rx: { scheme: 'Confirm then correct', detail: 'Check ferritin; pair iron-rich foods with vitamin C; avoid coffee/tea with iron meals.' } }),
    rc({ id: 'mito-inefficiency', name: 'Mitochondrial inefficiency', diagnostic: 'Persistent low energy despite adequate sleep and iron.',
      move: ['conditioning_aerobic', 'low_impact_deload'], fuel: ['omega-3', 'magnesium'], pathways: [11, 12], goals: ['endurance', 'longevity'],
      compounds: ['CoQ10 / Ubiquinol', 'Creatine', 'PQQ', 'Alpha-Lipoic Acid', 'NMN / NR'], nutrients: targets('energy'),
      rx: { scheme: 'Aerobic base', detail: 'Zone-2 cardio to build mitochondrial density; support with CoQ10/creatine.' } }),
  ]),
  P('cravings', 'Sugar Cravings & Appetite', '🍬', 'need', 'Metabolic', [
    rc({ id: 'glycemic-swings', name: 'Blood-sugar swings', diagnostic: 'Strong cravings 2–3h after carb-heavy meals; energy rollercoaster.',
      move: ['conditioning_aerobic'], fuel: ['high-protein', 'high-fiber', 'low-glycemic'], pathways: [3], goals: ['fatloss'],
      compounds: ['Berberine', 'Semaglutide', 'Myo-Inositol'], nutrients: targets('glucose'),
      rx: { scheme: 'Protein-forward meals', detail: 'Lead meals with protein + fiber; avoid naked carbs; walk after eating.' } }),
  ]),
  P('thyroid', 'Thyroid Slowdown', '🦋', 'need', 'Metabolic', [
    rc({ id: 'subclinical-hypothyroid', name: 'Sluggish thyroid / nutrient deficits', diagnostic: 'Cold, fatigue, weight gain, dry skin; consider TSH testing.',
      move: ['compound_strength', 'low_impact_deload'], fuel: ['high-protein'], pathways: [1], goals: ['fatloss', 'skin'],
      compounds: ['Iodine / Selenium', 'Zinc', 'T3 / T4 Thyroid'], nutrients: targets('skin'),
      rx: { scheme: 'Test, don\'t guess', detail: 'Thyroid meds are prescription — confirm labs with a doctor; ensure iodine/selenium/zinc sufficiency.' } }),
  ]),
  P('blood-pressure', 'High Blood Pressure', '🫀', 'need', 'Metabolic', [
    rc({ id: 'endothelial-sodium', name: 'Endothelial dysfunction + sodium/potassium imbalance', diagnostic: 'Elevated readings; high-sodium diet; low fruit/veg.',
      move: ['conditioning_aerobic', 'low_impact_deload'], fuel: ['nitrate', 'potassium', 'high-fiber'], pathways: [4], goals: ['heart'],
      compounds: ['Beetroot / Dietary Nitrate', 'Magnesium', 'Omega-3', 'L-Citrulline'], nutrients: targets('bp'),
      rx: { scheme: 'DASH pattern + cardio', detail: 'Cut sodium, raise potassium (veg/fruit), aerobic exercise most days.' } }),
  ]),
  P('cholesterol', 'High Cholesterol / Lipids', '🧈', 'need', 'Metabolic', [
    rc({ id: 'ldl-fiber', name: 'High LDL / low soluble fiber', diagnostic: 'Elevated LDL on labs; low fiber, high saturated fat intake.',
      move: ['conditioning_aerobic'], fuel: ['high-fiber', 'omega-3', 'beta-glucan'], pathways: [13], goals: ['heart'],
      compounds: ['Citrus Bergamot', 'Red Yeast Rice', 'Statins', 'Omega-3', 'Berberine'], nutrients: targets('lipids'),
      rx: { scheme: 'Fiber + activity', detail: 'Soluble fiber (oats, legumes), replace sat-fat with unsaturated, aerobic exercise.' } }),
  ]),

  // ---------- C. Cognitive / mood (NEEDS) ----------
  P('brain-fog', 'Brain Fog', '🌫️', 'need', 'Cognitive', [
    rc({ id: 'neuroinflammation', name: 'Neuroinflammation / poor metabolic control', diagnostic: 'Cloudy thinking, worse after poor sleep or high-sugar meals.',
      move: ['conditioning_aerobic'], fuel: ['omega-3', 'low-glycemic', 'anti-inflammatory', 'choline'], pathways: [13, 11], goals: ['focus'],
      compounds: ['Omega-3', 'Citicoline (CDP-Choline)', 'Lion\'s Mane', 'Creatine'], nutrients: targets('cognitive', 'glucose'),
      rx: { scheme: 'Sleep + blood sugar', detail: 'Fix sleep and glycemic swings first; aerobic exercise for cerebral blood flow.' } }),
  ]),
  P('anxiety', 'Anxiety', '😰', 'need', 'Cognitive', [
    rc({ id: 'gaba-deficit', name: 'Low GABAergic tone / over-arousal', diagnostic: 'Racing thoughts, tension, trouble winding down.',
      move: ['conditioning_aerobic', 'mobility_stretch'], fuel: ['magnesium'], pathways: [6, 10], goals: ['stress'],
      compounds: ['L-Theanine', 'Magnesium', 'Ashwagandha', 'Saffron', 'Apigenin'], nutrients: targets('sleep'),
      rx: { scheme: 'Down-regulate', detail: 'Zone-2 cardio, breathing/mobility work, magnesium; L-theanine for acute calm.' } }),
  ]),
  P('low-mood', 'Low Mood / Depression', '🌧️', 'need', 'Cognitive', [
    rc({ id: 'monoamine-inflammation', name: 'Low monoamines + inflammation', diagnostic: 'Persistent low mood, anhedonia, low drive.',
      move: ['conditioning_aerobic', 'compound_strength'], fuel: ['omega-3', 'anti-inflammatory'], pathways: [7, 13], goals: ['stress'],
      compounds: ['Omega-3', 'Saffron', '5-HTP / L-Tryptophan', 'Vitamin D3', 'SSRIs'], nutrients: targets('cognitive', 'anti_inflam'),
      rx: { scheme: 'Exercise as first-line', detail: 'Regular aerobic + resistance exercise has antidepressant effect; seek care for persistent symptoms.' } }),
  ]),
  P('adhd-focus', 'Focus / ADHD', '🎯', 'want', 'Cognitive', [
    rc({ id: 'dopamine-deficit', name: 'Low dopaminergic drive / distractibility', diagnostic: 'Difficulty sustaining attention, task-switching, motivation dips.',
      move: ['conditioning_aerobic'], fuel: ['high-protein', 'choline'], pathways: [7, 8], goals: ['focus'],
      compounds: ['Caffeine', 'L-Tyrosine', 'L-Theanine', 'Alpha-GPC', 'Methylphenidate'], nutrients: targets('cognitive'),
      rx: { scheme: 'Movement + protein AM', detail: 'Morning exercise and protein; caffeine+theanine stack; clinical assessment for ADHD.' } }),
  ]),
  P('memory', 'Memory Decline', '🧩', 'need', 'Cognitive', [
    rc({ id: 'cholinergic-decline', name: 'Cholinergic / vascular decline', diagnostic: 'Word-finding, forgetfulness with age; cardiovascular risk factors.',
      move: ['conditioning_aerobic', 'compound_strength'], fuel: ['omega-3', 'choline'], pathways: [8, 4], goals: ['focus', 'longevity'],
      compounds: ['Omega-3', 'Citicoline (CDP-Choline)', 'Lion\'s Mane', 'Bacopa Monnieri'], nutrients: targets('cognitive'),
      rx: { scheme: 'Vascular + cognitive load', detail: 'Aerobic fitness protects the brain; novel learning; manage BP and glucose.' } }),
  ]),
  P('burnout', 'Burnout', '🕯️', 'need', 'Cognitive', [
    rc({ id: 'hpa-dysregulation', name: 'HPA-axis dysregulation', diagnostic: 'Exhaustion, cynicism, "wired but tired", poor recovery.',
      move: ['mobility_stretch', 'low_impact_deload', 'conditioning_aerobic'], fuel: ['magnesium', 'anti-inflammatory'], pathways: [10], goals: ['stress'],
      compounds: ['Ashwagandha', 'Rhodiola Rosea', 'Magnesium', 'L-Theanine'], nutrients: targets('sleep', 'anti_inflam'),
      rx: { scheme: 'Deload + restore', detail: 'Reduce total load, protect sleep, gentle movement; adaptogens support the stress response.' } }),
  ]),

  // ---------- D. Sleep (NEEDS) ----------
  P('insomnia', 'Trouble Falling Asleep', '🌙', 'need', 'Sleep', [
    rc({ id: 'circadian-misalign', name: 'Circadian misalignment / hyperarousal', diagnostic: 'Can\'t switch off at night; late light/screen exposure.',
      move: ['conditioning_aerobic', 'mobility_stretch'], fuel: ['magnesium'], pathways: [0, 6], goals: ['sleep'],
      compounds: ['Melatonin', 'Magnesium', 'L-Theanine', 'Apigenin', 'Glycine'], nutrients: targets('sleep'),
      rx: { scheme: 'Light + wind-down', detail: 'Morning light, dim evenings, consistent wake time; low-dose melatonin 30–60 min before bed.' } }),
  ]),
  P('sleep-maintenance', 'Waking Through the Night', '⏰', 'need', 'Sleep', [
    rc({ id: 'cortisol-glucose-night', name: 'Nighttime cortisol / glucose swings', diagnostic: 'Wake at 3–4am, hard to fall back asleep.',
      move: ['low_impact_deload'], fuel: ['magnesium', 'low-glycemic'], pathways: [10], goals: ['sleep'],
      compounds: ['Magnesium', 'Glycine', 'Ashwagandha', 'DSIP'], nutrients: targets('sleep'),
      rx: { scheme: 'Stabilise evening', detail: 'Avoid alcohol and late sugar; magnesium/glycine; manage stress load.' } }),
  ]),
  P('shift-work', 'Shift Work / Jet Lag', '✈️', 'need', 'Sleep', [
    rc({ id: 'circadian-desync', name: 'Circadian desynchrony', diagnostic: 'Rotating shifts or travel; body clock out of phase.',
      move: ['conditioning_aerobic'], fuel: ['low-glycemic'], pathways: [0], goals: ['sleep'],
      compounds: ['Melatonin', 'Caffeine', 'L-Theanine'], nutrients: targets('sleep'),
      rx: { scheme: 'Time light & caffeine', detail: 'Strategic light exposure, timed melatonin to shift the clock, caffeine early in the shift only.' } }),
  ]),

  // ---------- E. Hormonal (NEEDS + WANTS) ----------
  P('low-testosterone', 'Low Testosterone', '⚡', 'need', 'Hormonal', [
    rc({ id: 'lifestyle-suppressed-t', name: 'Lifestyle-suppressed testosterone', diagnostic: 'Low drive, fatigue, poor recovery; overweight, poor sleep, high stress.',
      move: ['compound_strength', 'hypertrophy_lower', 'bone_loading'], fuel: ['high-protein', 'zinc'], pathways: [9, 1], goals: ['hormones', 'muscle'],
      compounds: ['Vitamin D3', 'Zinc', 'Tongkat Ali', 'Boron', 'Magnesium'], nutrients: targets('testosterone'),
      rx: { scheme: 'Lift, sleep, lean out', detail: 'Heavy resistance training, fix sleep and body-fat, ensure zinc/vit-D/magnesium before considering TRT.' } }),
    rc({ id: 'primary-hypogonadism', name: 'Primary hypogonadism (clinical)', diagnostic: 'Confirmed low T on repeat morning labs with symptoms.',
      move: ['compound_strength'], fuel: ['high-protein'], pathways: [9], goals: ['hormones'],
      compounds: ['Testosterone (TRT)', 'HCG', 'Enclomiphene / Clomiphene'], nutrients: targets('testosterone'),
      domains: [DIET, PHARM], rx: { scheme: 'Medical management', detail: 'TRT/enclomiphene are prescription — requires physician workup and monitoring.' } }),
  ]),
  P('menopause', 'Menopause Symptoms', '🌡️', 'need', 'Hormonal', [
    rc({ id: 'estrogen-decline', name: 'Estrogen decline', diagnostic: 'Hot flushes, sleep disruption, mood and bone changes.',
      move: ['compound_strength', 'bone_loading', 'balance_proprioception'], fuel: ['calcium', 'high-protein'], pathways: [1], goals: ['hormones', 'bone'],
      compounds: ['Estradiol / Menopausal HRT', 'Vitamin D3', 'Calcium', 'Magnesium'], nutrients: targets('bone'),
      domains: [DIET, PHARM], rx: { scheme: 'Strength + bone protection', detail: 'Resistance & impact training for bone/muscle; HRT is a physician decision.' } }),
  ]),
  P('low-libido', 'Low Libido', '❤️‍🔥', 'want', 'Hormonal', [
    rc({ id: 'vascular-hormonal-libido', name: 'Vascular / hormonal / stress', diagnostic: 'Reduced desire or performance; overlaps with stress, sleep, blood flow.',
      move: ['conditioning_aerobic', 'compound_strength'], fuel: ['nitrate', 'zinc'], pathways: [4, 9, 14], goals: ['sexual', 'hormones'],
      compounds: ['L-Citrulline', 'PDE-5 Inhibitors', 'Tongkat Ali', 'PT-141', 'Yohimbine'], nutrients: targets('testosterone'),
      rx: { scheme: 'Blood flow + hormones', detail: 'Cardiovascular fitness, address stress/sleep, ensure testosterone status; PDE-5 is prescription.' } }),
  ]),
  P('bone-density', 'Bone Density / Osteoporosis', '🦴', 'need', 'Hormonal', [
    rc({ id: 'low-bmd', name: 'Low bone mineral density', diagnostic: 'Low DEXA score, fracture risk, post-menopausal or low intake.',
      move: ['bone_loading', 'compound_strength', 'balance_proprioception'], fuel: ['calcium', 'high-protein'], pathways: [1], goals: ['bone'],
      compounds: ['Calcium', 'Vitamin D3', 'Magnesium', 'Strontium'], nutrients: targets('bone'),
      rx: { scheme: 'Load the skeleton', detail: 'Progressive resistance + impact + balance; ensure calcium/vit-D/protein.' } }),
  ]),
  P('pcos', 'PCOS / Hormonal Weight', '⚖️', 'need', 'Hormonal', [
    rc({ id: 'insulin-androgen', name: 'Insulin resistance + high androgens', diagnostic: 'Irregular cycles, weight gain, acne, hair changes.',
      move: ['compound_strength', 'conditioning_aerobic'], fuel: ['low-glycemic', 'high-fiber', 'high-protein'], pathways: [3, 5], goals: ['fatloss', 'hormones'],
      compounds: ['Myo-Inositol', 'Berberine', 'Metformin', 'Semaglutide'], nutrients: targets('glucose', 'fatloss'),
      domains: [DIET, PHARM], rx: { scheme: 'Insulin-first', detail: 'Resistance training + fiber/protein; inositol/berberine to improve insulin sensitivity.' } }),
  ]),

  // ---------- F. Longevity & aesthetics (WANTS — Felix's emphasis) ----------
  P('skin-aging', 'Skin Aging / Wrinkles', '✨', 'want', 'Longevity & Aesthetics', [
    rc({ id: 'collagen-loss-glycation', name: 'Collagen loss + glycation', diagnostic: 'Fine lines, loss of firmness, dullness with age/UV/sugar.',
      move: ['low_impact_deload'], fuel: ['collagen-synthesis', 'vitamin-c', 'omega-3', 'high-protein'], pathways: [13, 15], goals: ['skin', 'longevity'],
      compounds: ['Collagen Peptides', 'Vitamin C', 'Tretinoin', 'Astaxanthin', 'Omega-3', 'GHK-Cu'], nutrients: targets('skin'),
      rx: { scheme: 'Protect + rebuild', detail: 'Daily sunscreen, topical retinoid, collagen + vitamin C; limit sugar to reduce glycation.' } }),
    rc({ id: 'uv-oxidative', name: 'UV / oxidative damage', diagnostic: 'Sun spots, photoaging, uneven tone.',
      move: [], fuel: ['polyphenol', 'anti-inflammatory', 'vitamin-c'], pathways: [13], goals: ['skin'],
      compounds: ['Astaxanthin', 'Niacinamide', 'Vitamin C', 'Sulforaphane'], nutrients: targets('skin', 'anti_inflam'),
      domains: [DIET], rx: null }),
  ]),
  P('acne', 'Acne / Skin Clarity', '🧼', 'want', 'Longevity & Aesthetics', [
    rc({ id: 'sebum-insulin', name: 'Sebum + insulin/androgen-driven', diagnostic: 'Oily skin, breakouts along jaw/chin; worse with high-glycemic diet.',
      move: ['conditioning_aerobic'], fuel: ['low-glycemic', 'zinc', 'omega-3'], pathways: [1, 13], goals: ['skin'],
      compounds: ['Zinc', 'Tretinoin', 'Niacinamide', 'Omega-3'], nutrients: targets('skin', 'glucose'),
      domains: [DIET, PHARM], rx: { scheme: 'Lower glycemic load', detail: 'Reduce high-GI foods and dairy if triggering; zinc; topical retinoid/niacinamide.' } }),
  ]),
  P('hair-loss', 'Hair Loss / Thinning', '💇', 'want', 'Longevity & Aesthetics', [
    rc({ id: 'dht-sensitivity', name: 'DHT-sensitive (pattern) hair loss', diagnostic: 'Receding hairline/crown thinning; family history.',
      move: [], fuel: ['zinc', 'high-protein'], pathways: [1], goals: ['skin', 'hormones'],
      compounds: ['Finasteride / Dutasteride', 'Minoxidil', 'Zinc'], nutrients: targets('hair'),
      domains: [DIET, PHARM], rx: { scheme: 'Block + stimulate', detail: 'Finasteride lowers DHT; minoxidil stimulates follicles (both need consistency & medical advice).' } }),
    rc({ id: 'nutrient-deficiency-hair', name: 'Nutrient deficiency (iron/zinc/protein)', diagnostic: 'Diffuse shedding; low ferritin, low protein, or crash dieting.',
      move: [], fuel: ['iron', 'zinc', 'high-protein', 'vitamin-c'], pathways: [], goals: ['skin'],
      compounds: ['Iron', 'Zinc', 'Collagen Peptides', 'Niacinamide'], nutrients: targets('hair'),
      domains: [DIET], rx: { scheme: 'Refeed the follicle', detail: 'Restore adequate protein/iron/zinc; check ferritin; avoid aggressive deficits.' } }),
  ]),
  P('longevity', 'Longevity / Healthspan', '⏳', 'want', 'Longevity & Aesthetics', [
    rc({ id: 'cellular-senescence', name: 'Senescence & mitochondrial decline', diagnostic: 'Optimising healthspan; reducing "zombie cell" and mitochondrial aging.',
      move: ['compound_strength', 'conditioning_aerobic', 'bone_loading'], fuel: ['anti-inflammatory', 'high-fiber', 'polyphenol'], pathways: [15, 12, 3], goals: ['longevity'],
      compounds: ['NMN / NR', 'Fisetin', 'Spermidine', 'Urolithin A', 'Rapamycin', 'Ca-AKG', 'GlyNAC'], nutrients: targets('anti_inflam'),
      rx: { scheme: 'Fitness is the drug', detail: 'VO2max and strength are the strongest longevity signals; add sleep, muscle mass, metabolic health.' } }),
    rc({ id: 'mtor-overactivation', name: 'Chronic mTOR over-activation', diagnostic: 'Constant surplus/over-feeding; interested in autophagy.',
      move: ['conditioning_aerobic'], fuel: ['low-glycemic', 'high-fiber'], pathways: [2, 3, 15], goals: ['longevity'],
      compounds: ['Rapamycin', 'Metformin', 'Spermidine', 'Resveratrol / Pterostilbene'], nutrients: targets('glucose'),
      domains: [DIET, PHARM], rx: { scheme: 'Cycle growth & repair', detail: 'Balance anabolic (training/protein) with periods of lower feeding to allow autophagy.' } }),
  ]),
  P('inflammation', 'Chronic Inflammation', '🔥', 'need', 'Longevity & Aesthetics', [
    rc({ id: 'low-grade-inflammation', name: 'Chronic low-grade inflammation', diagnostic: 'Elevated CRP, aches, slow recovery, "inflammaging".',
      move: ['conditioning_aerobic', 'mobility_stretch'], fuel: ['omega-3', 'anti-inflammatory', 'high-fiber', 'polyphenol'], pathways: [13], goals: ['recovery', 'longevity'],
      compounds: ['Omega-3', 'Boswellia', 'Sulforaphane', 'Astaxanthin'], nutrients: targets('anti_inflam'),
      rx: { scheme: 'Diet + movement', detail: 'Omega-3, colourful plants/fiber, regular movement, sleep; reduce sugar and visceral fat.' } }),
  ]),
  P('gut-health', 'Gut Health', '🌱', 'want', 'Longevity & Aesthetics', [
    rc({ id: 'dysbiosis', name: 'Dysbiosis / low fiber diversity', diagnostic: 'Bloating, irregularity, low plant diversity in diet.',
      move: ['low_impact_deload'], fuel: ['high-fiber', 'probiotic'], pathways: [13], goals: ['gut'],
      compounds: ['Probiotics', 'Prebiotics (Inulin, GOS, PHGG) & Butyrate', 'L-Glutamine', 'Zinc-Carnosine'], nutrients: targets('gut'),
      domains: [DIET], rx: { scheme: 'Feed the microbiome', detail: '30+ plant types/week, fermented foods, soluble + resistant fibers; ease in to avoid bloating.' } }),
  ]),
  P('immunity', 'Immunity', '🛡️', 'want', 'Longevity & Aesthetics', [
    rc({ id: 'micronutrient-immune', name: 'Micronutrient gaps / immune resilience', diagnostic: 'Frequent colds, slow recovery, run-down.',
      move: ['conditioning_aerobic', 'low_impact_deload'], fuel: ['vitamin-c', 'zinc', 'probiotic'], pathways: [13], goals: ['immune'],
      compounds: ['Vitamin D3', 'Zinc', 'Vitamin C', 'Beta-Glucans', 'Medicinal Mushrooms'], nutrients: targets('immune'),
      domains: [DIET], rx: { scheme: 'Foundations', detail: 'Sleep, vitamin D/zinc sufficiency, moderate exercise; vitamin C/zinc at symptom onset.' } }),
  ]),

  // ---------- G. Performance (WANTS) ----------
  P('hypertrophy', 'Build Muscle (Plateau)', '💪', 'want', 'Performance', [
    rc({ id: 'stimulus-recovery', name: 'Insufficient stimulus or recovery', diagnostic: 'Gains stalled; training hard but not progressing.',
      move: ['hypertrophy_upper', 'hypertrophy_lower', 'compound_strength'], fuel: ['high-protein', 'leucine'], pathways: [2, 5], goals: ['muscle'],
      compounds: ['Creatine', 'Whey / Casein Protein', 'EAAs / BCAAs', 'HMB', 'Beta-Alanine'], nutrients: targets('muscle'),
      rx: { scheme: 'Progressive overload', detail: 'Add volume/load progressively, 10–20 hard sets/muscle/week, 1.6–2.2 g/kg protein, sleep.' } }),
  ]),
  P('strength-plateau', 'Strength Plateau', '🏋️', 'want', 'Performance', [
    rc({ id: 'neural-recovery', name: 'Neural efficiency + recovery limits', diagnostic: 'Top lifts stuck; grinding reps, poor recovery.',
      move: ['compound_strength', 'power_plyometric'], fuel: ['high-protein'], pathways: [2], goals: ['muscle'],
      compounds: ['Creatine', 'Beta-Alanine', 'Caffeine', 'Sodium Bicarbonate'], nutrients: targets('muscle'),
      rx: { scheme: 'Periodise', detail: 'Lower-rep heavy work, manage fatigue with a deload, ensure recovery/sleep.' } }),
  ]),
  P('fat-loss-plateau', 'Fat Loss Plateau', '📉', 'want', 'Performance', [
    rc({ id: 'metabolic-adaptation', name: 'Metabolic adaptation / adherence drift', diagnostic: 'Weight loss stalled despite "the same" diet.',
      move: ['compound_strength', 'conditioning_aerobic'], fuel: ['high-protein', 'high-fiber', 'low-glycemic'], pathways: [3], goals: ['fatloss'],
      compounds: ['Caffeine', 'Green Tea Extract', 'Semaglutide', 'Yohimbine'], nutrients: targets('fatloss'),
      rx: { scheme: 'Audit + adjust', detail: 'Re-measure intake/steps, protein high, add resistance to protect BMR; consider a diet break.' } }),
  ]),
  P('endurance-plateau', 'Endurance Plateau', '🏃', 'want', 'Performance', [
    rc({ id: 'aerobic-base', name: 'Thin aerobic base / iron status', diagnostic: 'Pace/HR not improving; possible low iron in endurance athletes.',
      move: ['conditioning_aerobic', 'power_plyometric'], fuel: ['iron', 'vitamin-c', 'omega-3'], pathways: [11], goals: ['endurance'],
      compounds: ['Beetroot / Dietary Nitrate', 'Iron', 'Beta-Alanine', 'Creatine', 'Caffeine'], nutrients: targets('endurance'),
      rx: { scheme: 'Polarised training', detail: '80% easy zone-2 volume + 20% hard intervals; check ferritin; fuel carbs around sessions.' } }),
  ]),
  P('pre-workout', 'Pre-Workout Energy', '⚡', 'want', 'Performance', [
    rc({ id: 'low-readiness', name: 'Low training readiness', diagnostic: 'Flat, unmotivated, underperforming sessions.',
      move: ['conditioning_aerobic'], fuel: ['high-protein'], pathways: [0, 4], goals: ['muscle', 'endurance'],
      compounds: ['Caffeine', 'L-Citrulline', 'Beta-Alanine', 'Creatine', 'L-Tyrosine'], nutrients: targets('muscle'),
      rx: { scheme: 'Time your stimulants', detail: 'Caffeine 3–6 mg/kg ~45 min pre; citrulline for pump; ensure sleep/hydration underlie it.' } }),
  ]),
  P('overtraining', 'Overtraining / Under-recovery', '🥵', 'need', 'Performance', [
    rc({ id: 'autonomic-imbalance', name: 'Autonomic imbalance / systemic fatigue', diagnostic: 'Falling performance, high resting HR, poor sleep, irritability.',
      move: ['mobility_stretch', 'low_impact_deload'], fuel: ['high-protein', 'anti-inflammatory'], pathways: [10, 13], goals: ['recovery', 'stress'],
      compounds: ['Ashwagandha', 'Magnesium', 'Omega-3', 'Rhodiola Rosea', 'Creatine'], nutrients: targets('anti_inflam', 'muscle'),
      rx: { scheme: 'Deload, refuel, sleep', detail: 'Cut volume 40–60% for 1–2 weeks, raise calories/protein, prioritise sleep; then rebuild.' } }),
  ]),
];

// ---- validation & write ----
const seenIds = new Set();
let rcCount = 0;
for (const p of problems) {
  if (seenIds.has(p.id)) throw new Error('duplicate problem id ' + p.id);
  seenIds.add(p.id);
  const rcIds = new Set();
  for (const c of p.root_causes) {
    if (rcIds.has(c.id)) throw new Error(`dup root-cause ${c.id} in ${p.id}`);
    rcIds.add(c.id); rcCount++;
  }
}
const domains = {
  physio: { label: 'Physiotherapy', layer: 'Move', color: '#2563eb' },
  dietitian: { label: 'Dietetics', layer: 'Fuel', color: '#16a34a' },
  pharmacist: { label: 'Pharmacist / MD', layer: 'Stack', color: '#9333ea' },
};
const payload = {
  generated_by: 'scripts/build-graph.js',
  disclaimer: 'Educational protocols, not medical advice. Nutrient targets are general adult guidance with stated rationale.',
  domains,
  categories: [...new Set(problems.map((p) => p.category))],
  problems,
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload));
console.log(`[graph] ${problems.length} problems, ${rcCount} root causes across ${payload.categories.length} categories`);
console.log('[graph] categories:', payload.categories.join(' | '));
console.log('[graph] wrote', OUT);
