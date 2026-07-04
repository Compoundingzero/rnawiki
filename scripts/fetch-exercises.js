#!/usr/bin/env node
// Phase-1 pipeline: fetch the real free-exercise-db (873 exercises, MIT/public),
// normalise it, and derive a clinical "move_tag" layer by muscle/name rules.
//
// Anti-hallucination note: exercises, muscles, instructions and image paths are
// REAL (from the upstream JSON). The clinical move_tags are DERIVED by transparent
// keyword rules below (the same technique parse.js already uses for goals/pathways).
// We do NOT invent per-exercise medical claims — clinical prescription parameters
// and contraindications live on the root-cause in data/clinical_graph.json, which
// is the clinically correct place for them.
//
// Run: node scripts/fetch-exercises.js  ->  data/clinical_exercises.json

const fs = require('fs');
const path = require('path');

const SRC = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const OUT = path.join(__dirname, '..', 'data', 'clinical_exercises.json');

// Clinical movement patterns ("move_tags"). Each maps to real exercises via muscles
// and/or name keywords. Root causes in the MECE graph reference these tags.
const MOVE_TAGS = [
  { tag: 'vmo_knee_strengthening', label: 'Knee / VMO strengthening', muscles: ['quadriceps'], any: ['squat', 'leg extension', 'step-up', 'step up', 'lunge', 'leg press', 'wall sit', 'terminal knee'] },
  { tag: 'posterior_chain', label: 'Posterior chain (glute/hamstring/back)', muscles: ['glutes', 'hamstrings', 'lower back'], any: ['hip thrust', 'bridge', 'deadlift', 'good morning', 'romanian', 'hyperextension', 'kettlebell swing', 'nordic'] },
  { tag: 'core_stability', label: 'Core / lumbar stability', muscles: ['abdominals', 'lower back'], any: ['plank', 'dead bug', 'bird dog', 'pallof', 'bird-dog', 'anti-rotation', 'hollow', 'stir'] },
  { tag: 'scapular_stability', label: 'Scapular / upper-back stability', muscles: ['traps', 'shoulders', 'middle back'], any: ['face pull', 'row', 'scapular', 'y raise', 'shrug', 'reverse fly', 'band pull'] },
  { tag: 'rotator_cuff', label: 'Rotator cuff', muscles: ['shoulders'], any: ['external rotation', 'internal rotation', 'cuff', 'l-raise', 'cuban'] },
  { tag: 'hip_mobility', label: 'Hip mobility / stability', muscles: ['abductors', 'adductors', 'glutes'], any: ['hip', 'clamshell', 'monster walk', 'fire hydrant', 'pigeon', '90/90'] },
  { tag: 'ankle_foot', label: 'Ankle / foot / calf', muscles: ['calves'], any: ['calf raise', 'ankle', 'heel', 'tibialis', 'toe'] },
  { tag: 'wrist_elbow_tendon', label: 'Wrist / elbow tendon loading', muscles: ['forearms'], any: ['wrist curl', 'reverse curl', 'forearm', 'wrist extension', 'grip', 'tyler twist'] },
  { tag: 'neck_deep_flexor', label: 'Neck / deep flexor', muscles: ['neck'], any: ['neck', 'chin tuck', 'cervical'] },
  { tag: 'thoracic_mobility', label: 'Thoracic / chest opening', muscles: ['chest', 'middle back', 'lats'], any: ['thoracic', 'extension', 'cat', 'cobra', 'wall slide', 'foam roll'] },
  { tag: 'compound_strength', label: 'Big compound strength', muscles: [], any: ['squat', 'deadlift', 'bench press', 'overhead press', 'pull-up', 'pull up', 'chin-up', 'row', 'clean', 'snatch'] },
  { tag: 'hypertrophy_upper', label: 'Upper-body hypertrophy', muscles: ['chest', 'biceps', 'triceps', 'shoulders', 'lats'], any: ['curl', 'press', 'fly', 'pushdown', 'extension', 'raise'] },
  { tag: 'hypertrophy_lower', label: 'Lower-body hypertrophy', muscles: ['quadriceps', 'hamstrings', 'glutes'], any: ['squat', 'lunge', 'leg press', 'leg curl', 'leg extension', 'split squat'] },
  { tag: 'conditioning_aerobic', label: 'Aerobic conditioning', muscles: [], categories: ['cardio'], any: ['run', 'row', 'bike', 'jump rope', 'sprint', 'burpee', 'elliptical'] },
  { tag: 'power_plyometric', label: 'Power / plyometric', muscles: [], categories: ['plyometrics', 'olympic weightlifting'], any: ['jump', 'box', 'clean', 'snatch', 'throw', 'bound', 'hop'] },
  { tag: 'grip_loaded_carry', label: 'Grip / loaded carry', muscles: ['forearms', 'traps'], any: ['carry', 'farmer', 'grip', 'hold', 'hang', 'shrug'] },
  { tag: 'balance_proprioception', label: 'Balance / proprioception', muscles: [], any: ['balance', 'single leg', 'single-leg', 'bosu', 'stability', 'stork'] },
  { tag: 'mobility_stretch', label: 'Mobility / stretching', muscles: [], categories: ['stretching'], any: ['stretch', 'mobility', 'foam roll'] },
  { tag: 'low_impact_deload', label: 'Low-impact / deload', muscles: [], any: ['stretch', 'walk', 'swim', 'band', 'isometric', 'wall'] },
  { tag: 'bone_loading', label: 'Bone-loading / axial', muscles: [], any: ['squat', 'deadlift', 'press', 'lunge', 'step-up', 'jump', 'carry'] },
];

function tagsFor(ex) {
  const name = (ex.name || '').toLowerCase();
  const prim = (ex.primaryMuscles || []).map((s) => s.toLowerCase());
  const cat = (ex.category || '').toLowerCase();
  const out = [];
  for (const t of MOVE_TAGS) {
    const muscleHit = (t.muscles || []).some((m) => prim.includes(m));
    const catHit = (t.categories || []).includes(cat);
    const nameHit = (t.any || []).some((k) => name.includes(k));
    // require a name/category signal, or a muscle signal for muscle-defined tags
    if (nameHit || catHit || (muscleHit && (t.muscles || []).length)) out.push(t.tag);
  }
  return out;
}

// score for "top exercise" selection: prefer beginner/bodyweight/compound, with images
function usefulness(ex) {
  let s = 0;
  if (ex.level === 'beginner') s += 3; else if (ex.level === 'intermediate') s += 1;
  if (ex.equipment === 'body only') s += 2;
  else if (['dumbbell', 'bands', 'kettlebells', 'cable'].includes(ex.equipment)) s += 1;
  if (ex.mechanic === 'compound') s += 1;
  if ((ex.images || []).length) s += 1;
  if ((ex.instructions || []).length >= 3) s += 1;
  return s;
}

(async () => {
  console.log('[exercises] fetching free-exercise-db ...');
  const res = await fetch(SRC, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error('exercise-db fetch failed ' + res.status);
  const raw = await res.json();
  console.log('[exercises] got', raw.length, 'exercises');

  const exercises = raw.map((e) => ({
    id: e.id,
    name: e.name,
    force: e.force || null,
    level: e.level || null,
    mechanic: e.mechanic || null,
    equipment: e.equipment || null,
    primaryMuscles: e.primaryMuscles || [],
    secondaryMuscles: e.secondaryMuscles || [],
    instructions: e.instructions || [],
    category: e.category || null,
    image: (e.images && e.images[0]) ? IMG_BASE + e.images[0] : null,
    move_tags: tagsFor(e),
    score: usefulness(e),
  }));

  // build a tag -> ranked exercise-id index for fast protocol generation
  const byTag = {};
  for (const t of MOVE_TAGS) byTag[t.tag] = [];
  for (const ex of exercises) for (const tag of ex.move_tags) byTag[tag].push(ex.id);
  for (const tag of Object.keys(byTag)) {
    byTag[tag].sort((a, b) => {
      const ea = exercises.find((x) => x.id === a), eb = exercises.find((x) => x.id === b);
      return eb.score - ea.score;
    });
  }

  const payload = {
    source: SRC,
    license: 'free-exercise-db (public domain / MIT images)',
    generated_by: 'scripts/fetch-exercises.js',
    move_tag_defs: MOVE_TAGS.map(({ tag, label }) => ({ tag, label })),
    exercises,
    byTag,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload));
  const coverage = MOVE_TAGS.map((t) => `${t.tag}:${byTag[t.tag].length}`).join(', ');
  console.log('[exercises] tag coverage ->', coverage);
  console.log('[exercises] wrote', OUT, '(' + exercises.length + ' exercises)');
})().catch((e) => { console.error('[exercises] FAILED', e.message); process.exit(1); });
