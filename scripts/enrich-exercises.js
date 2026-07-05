#!/usr/bin/env node
// Enrich data/clinical_exercises.json with the clinical scaling schema (Phase 2, Prompt 1).
// Idempotent, no network. Adds to every exercise:
//   kind             'stretch' | 'strengthen'  — derived from the free-exercise-db category
//   prescription     { sets, reps|hold, tempo?, rest, cue?, source:'default' }
//                    honest CATEGORY-LEVEL defaults (not exercise-specific clinical Rx) so the
//                    UI is usable on day 1; real prescriptions arrive via expert micro-bounties
//   regression_id    null  — an easier variation (filled by a Physio micro-bounty)
//   progression_id   null  — a harder variation (filled by a Physio micro-bounty)
//   needs_scaling_bounty  true for clinically-used strengthening moves that still lack scaling
//
// Run:  node scripts/enrich-exercises.js   (then: node build/parse.js)

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'clinical_exercises.json');

const STRETCH_CATEGORIES = new Set(['stretching']);

// Authoritative tag → target-muscle map (mirrors MOVE_TAGS in fetch-exercises.js).
// Lets the protocol engine pick region-appropriate STRETCHES (which are muscle-tagged, not
// clinically tagged) by matching a root cause's target muscles — no fabricated data.
const TAG_MUSCLES = {
  vmo_knee_strengthening: ['quadriceps'],
  posterior_chain: ['glutes', 'hamstrings', 'lower back'],
  core_stability: ['abdominals', 'lower back'],
  scapular_stability: ['traps', 'shoulders', 'middle back'],
  rotator_cuff: ['shoulders'],
  hip_mobility: ['abductors', 'adductors', 'glutes'],
  ankle_foot: ['calves'],
  wrist_elbow_tendon: ['forearms'],
  neck_deep_flexor: ['neck'],
  thoracic_mobility: ['chest', 'middle back', 'lats'],
  compound_strength: ['quadriceps', 'glutes', 'chest', 'lats', 'shoulders'],
  hypertrophy_upper: ['chest', 'biceps', 'triceps', 'shoulders', 'lats'],
  hypertrophy_lower: ['quadriceps', 'hamstrings', 'glutes'],
  grip_loaded_carry: ['forearms', 'traps'],
  bone_loading: ['quadriceps', 'glutes', 'lower back'],
};

// generic, defensible defaults by kind + training level — clearly marked source:'default'
function defaultPrescription(ex) {
  const kind = ex.kind;
  if (kind === 'stretch') {
    return { sets: 2, hold: '30s', rest: '20s', cue: 'ease to mild tension, never pain', source: 'default' };
  }
  const level = (ex.level || 'intermediate').toLowerCase();
  const byLevel = {
    beginner: { sets: 3, reps: '10-12', tempo: '2-1-2', rest: '60s' },
    intermediate: { sets: 3, reps: '8-12', tempo: '3-1-1', rest: '90s' },
    expert: { sets: 4, reps: '5-8', tempo: '3-0-1', rest: '120s' },
  };
  return Object.assign({ source: 'default' }, byLevel[level] || byLevel.intermediate);
}

const LEVEL = { beginner: 0, intermediate: 1, expert: 2 };

function main() {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  let stretch = 0, strengthen = 0;
  data.exercises.forEach((ex) => {
    ex.kind = STRETCH_CATEGORIES.has((ex.category || '').toLowerCase()) ? 'stretch' : 'strengthen';
    if (ex.kind === 'stretch') stretch++; else strengthen++;
    if (!ex.prescription || ex.prescription.source === 'default') ex.prescription = defaultPrescription(ex);
  });

  // Real Easier/Harder: within each movement tag, chain strengthening exercises by training level
  // (beginner→intermediate→expert). Each move's regression = the next-easier in the same pattern,
  // progression = the next-harder. Uses real exercises from the DB — no fabricated variations.
  const byTag = {};
  data.exercises.forEach((ex) => {
    if (ex.kind !== 'strengthen') return;
    (ex.move_tags || []).forEach((t) => { (byTag[t] = byTag[t] || []).push(ex); });
  });
  Object.keys(byTag).forEach((t) => byTag[t].sort((a, b) =>
    (LEVEL[a.level] ?? 1) - (LEVEL[b.level] ?? 1) || String(a.id).localeCompare(String(b.id))));

  let withReg = 0, withProg = 0;
  data.exercises.forEach((ex) => {
    ex.regression_id = null; ex.progression_id = null;
    if (ex.kind === 'strengthen') {
      const t = (ex.move_tags || [])[0];
      const list = t ? byTag[t] : null;
      if (list) {
        const lvl = LEVEL[ex.level] ?? 1;
        const overlap = (o) => { const s = new Set(ex.move_tags || []); return (o.move_tags || []).filter((x) => s.has(x)).length; };
        // Candidates a genuine level EASIER / HARDER (same-level is not real scaling). From the
        // CLOSEST such level, pick the most similar move (most shared tags) — keeps the swap relevant.
        const pick = (dir) => {
          const cand = list.filter((o) => o.id !== ex.id && (dir < 0 ? (LEVEL[o.level] ?? 1) < lvl : (LEVEL[o.level] ?? 1) > lvl));
          if (!cand.length) return null;
          const lv = dir < 0 ? Math.max(...cand.map((o) => LEVEL[o.level] ?? 1)) : Math.min(...cand.map((o) => LEVEL[o.level] ?? 1));
          return cand.filter((o) => (LEVEL[o.level] ?? 1) === lv)
            .sort((a, b) => overlap(b) - overlap(a) || String(a.id).localeCompare(String(b.id)))[0];
        };
        const reg = pick(-1), prog = pick(1);
        if (reg) ex.regression_id = reg.id;
        if (prog) ex.progression_id = prog.id;
      }
    }
    if (ex.regression_id) withReg++;
    if (ex.progression_id) withProg++;
    // a bounty is only "open" if the move is clinically used yet the easiest & hardest in its
    // pattern (so genuinely has no easier/harder to link) — rare now that chains are populated.
    ex.needs_scaling_bounty = ex.kind === 'strengthen' && (ex.move_tags || []).length > 0
      && !ex.regression_id && !ex.progression_id;
  });

  data.schema_version = 3;
  data.tag_muscles = TAG_MUSCLES;
  fs.writeFileSync(FILE, JSON.stringify(data));
  console.log(`Enriched ${data.exercises.length} → stretch ${stretch}, strengthen ${strengthen}; with regression ${withReg}, with progression ${withProg}`);
}
main();
