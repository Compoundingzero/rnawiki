#!/usr/bin/env node
// Enrich data/clinical_exercises.json. Idempotent, no network. Adds to every exercise:
//   kind             'stretch' | 'mobility' | 'strengthen'
//   alternatives     ids that train the SAME primary muscle by another route
//
// ---- REWRITTEN 2026-08-11. WHAT THIS FILE USED TO DO, AND WHY IT STOPPED ----------------------
// Felix: "remove anything that requires a clinician and try to make it up by replacing it with
// higher quality higher value information for the audience."
//
// This script produced three things that only a clinician could have made true, and it made all
// three up:
//
//   1. `prescription` — sets, reps, tempo and rest for every movement, from a table keyed on
//      training level. MEASURED before the rewrite: 873 of 873 records carried one and 873 of 873
//      were `source:'default'`. Not one was ever authored. Every stretch on the site read
//      "2 × 30s hold · rest 20s" because a constant said so, including Frog Hops.
//      A number nobody measured, printed beside a movement, is a prescription with no prescriber.
//
//   2. `regression_id` / `progression_id` — an Easier/Harder ladder chained within `move_tags[0]`
//      by training level, WITHOUT LOOKING AT MUSCLES AT ALL. MEASURED: 1,007 edges, of which 276
//      linked movements sharing no primary muscle and 100 "easier" edges raised equipment demand.
//      Ab Crunch Machine --harder--> Atlas Stones (abdominals -> lower back). Alternate Hammer Curl
//      --harder--> Alternating Kettlebell Press (biceps -> shoulders). "Easier" and "harder" are
//      clinical judgements about a person; the tags could not carry one, so they invented it.
//
//   3. `kind`, from the upstream category alone — so all 123 records the free-exercise-db files
//      under "stretching" became static stretches, jumps included.
//
// WHAT REPLACES THEM IS DERIVED FROM FIELDS THAT ACTUALLY SAY IT. The dataset knows
// primaryMuscles, secondaryMuscles, equipment, force (push/pull/static), mechanic
// (compound/isolation), level and the instruction steps. Everything below is computed from those
// and is true by construction:
//
//   · `alternatives` answers the question a reader in a Singapore gym actually has — "the machine
//     is taken / I have no barbell, what else hits this?" Every edge shares a primary muscle and
//     the same force and mechanic; different equipment ranks first. It asserts nothing about
//     difficulty, safety or suitability, so it needs no clinician to be true.
//   · `kind` reads the movement's own name and steps, so a jump cannot be served as a hold.
//   · There is no prescription. The site says so, in words, where the numbers used to be.
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

// A movement filed under "stretching" that describes a jump, a hop, a swing or a loaded squat is
// not a static stretch, and serving it as a 30-second hold is how Frog Hops reached a knee-pain
// protocol under "🧘 Stretches" with a passive-stretch sensation cue. The upstream category is a
// library shelf; these words are the movement itself, so they win.
// Matched against the NAME and the INSTRUCTION STEPS, because the steps are where "jump", "drive",
// "explode" and "swing" actually appear.
// TWO predicates, deliberately, because they answer two different questions and one regex tuned
// for both would be wrong for both.
//
// NOT_A_STATIC_HOLD is broad on purpose: it decides whether a record the upstream library shelved
// under "stretching" is really something you hold still. A squat, a lunge and a leg raise are all
// active movements, so all three disqualify — that breadth is correct HERE and would be absurd
// anywhere else.
const NOT_A_STATIC_HOLD = /\b(jump|jumps|jumping|hop|hops|hopping|bound|bounds|leap|skip|skipping|swing|swings|swinging|throw|throws|sprint|explod\w*|plyo\w*|drive up|push off|kick|kicks|kicking|squat|squats|lunge|lunges|raise|raises|crunch|twist\w* rapidly)\b/i;
const isDynamic = (ex) => NOT_A_STATIC_HOLD.test(String(ex.name || '')) || NOT_A_STATIC_HOLD.test((ex.instructions || []).join(' '));

// EXPLOSIVE is narrow on purpose: it decides whether offering movement B in place of movement A
// raises what the movement demands of a joint. Only genuinely ballistic patterns count.
// It exists because `category` alone let "Freehand Jump Squat" through — the upstream library files
// it under "strength", and it is a jump. The record's own NAME is the more reliable witness, which
// is the same lesson as the stretch shelf.
const EXPLOSIVE = /\b(jump|jumps|jumping|jumped|hop|hops|hopping|bound|bounds|bounding|leap|leaps|plyo\w*|explod\w*|ballistic|snatch|clean and jerk|jerk|sprint|sprints|throw|throws|slam|slams|kip|kipping|depth drop)\b/i;
const isExplosive = (ex) => EXPLOSIVE.test(String(ex.name || '')) || String(ex.category || '').toLowerCase() === 'plyometrics';

// Equipment ordered by how much a reader needs to have. Only used to RANK alternatives so the
// no-kit option surfaces first — never to claim one is easier than another.
const EQUIP_DEMAND = {
  'body only': 0, 'foam roll': 0, 'bands': 1, 'exercise ball': 1,
  'medicine ball': 2, 'dumbbell': 2, 'kettlebells': 2, other: 2,
  cable: 3, machine: 3, barbell: 4, 'e-z curl bar': 4,
};
const demand = (ex) => EQUIP_DEMAND[String(ex.equipment || '').toLowerCase()] ?? 2;

function main() {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  // ---- 1. kind, from the movement's own words --------------------------------------------------
  const counts = { stretch: 0, mobility: 0, strengthen: 0 };
  data.exercises.forEach((ex) => {
    const shelved = STRETCH_CATEGORIES.has((ex.category || '').toLowerCase());
    ex.kind = !shelved ? 'strengthen' : (isDynamic(ex) ? 'mobility' : 'stretch');
    counts[ex.kind]++;
    // The fabricated prescription is DELETED, not recomputed. `prescription` now exists only where
    // a human authored one; 0 records qualify today, and 0 is the honest number. assertNoDefault-
    // Prescription() in build/parse.js fails the build if a `source:'default'` ever comes back.
    if (ex.prescription && ex.prescription.source === 'default') delete ex.prescription;
  });

  // ---- 2. alternatives: same primary muscle, same movement, other kit ---------------------------
  // The rule, in full: share at least one PRIMARY muscle; agree on `force` and `mechanic` where
  // both records state them (a push is not an alternative to a pull, and an isolation is not an
  // alternative to a compound); same kind, so a stretch is never offered in place of a lift; and
  // SAME CATEGORY.
  //
  // The category clause was added after the first hydrated check of this feature, which offered
  // "Bench Jump" as a swap for a dumbbell lunge on the patellofemoral-knee-pain protocol. Every
  // other clause was satisfied — same primary muscle, same force, same mechanic, less equipment —
  // and it was still the wrong suggestion, because a plyometric jump is not a like-for-like
  // exchange for a strength movement whatever muscle it shares.
  //
  // The alternative to fixing that with a contraindication list is worth stating: only 2 of 52 root
  // causes carry `avoid_movements`, so a per-cause filter would have covered 2 protocols and left
  // 50 exposed, and authoring the other 50 is precisely the clinical work this rewrite exists to
  // stop inventing. `category` is a field on the record. It needs nobody's judgement, and it holds
  // on all 52. 1,358 of the 4,691 edges crossed a category before this clause.
  // Ranked: different equipment first (that is the question being answered), then lower equipment
  // demand, then more shared primary muscles, then name. Capped at 6.
  const CAP = 6;
  let withAlts = 0, edges = 0;
  data.exercises.forEach((ex) => {
    const mine = new Set(ex.primaryMuscles || []);
    if (!mine.size) { ex.alternatives = []; return; }
    const cand = data.exercises.filter((o) => {
      if (o.id === ex.id || o.kind !== ex.kind) return false;
      if ((o.category || '') !== (ex.category || '')) return false;
      // Never swap UP into a ballistic movement. The reverse is allowed: offering a non-jump in
      // place of a jump takes demand off the joint, which is the safe direction.
      if (isExplosive(o) && !isExplosive(ex)) return false;
      if (!(o.primaryMuscles || []).some((m) => mine.has(m))) return false;
      if (ex.force && o.force && ex.force !== o.force) return false;
      if (ex.mechanic && o.mechanic && ex.mechanic !== o.mechanic) return false;
      return true;
    });
    const shared = (o) => (o.primaryMuscles || []).filter((m) => mine.has(m)).length;
    cand.sort((a, b) =>
      (a.equipment === ex.equipment) - (b.equipment === ex.equipment)
      || demand(a) - demand(b)
      || shared(b) - shared(a)
      || String(a.name).localeCompare(String(b.name)));
    ex.alternatives = cand.slice(0, CAP).map((o) => o.id);
    if (ex.alternatives.length) withAlts++;
    edges += ex.alternatives.length;
  });

  // ---- 3. the ladder and its bounty are gone ---------------------------------------------------
  // regression_id / progression_id / needs_scaling_bounty are deleted from every record rather than
  // left null: a null field is an invitation to fill it, and the thing that filled it last time was
  // a level table. If an easier/harder relation is ever wanted, it has to be authored per pair by
  // somebody qualified to say so — which is the point of not having it.
  data.exercises.forEach((ex) => {
    delete ex.regression_id; delete ex.progression_id; delete ex.needs_scaling_bounty;
  });

  console.log(`[enrich] kind: ${counts.strengthen} strengthen · ${counts.stretch} static stretch · ${counts.mobility} dynamic mobility (reclassified out of "stretching")`);
  console.log(`[enrich] alternatives: ${edges} edges across ${withAlts}/${data.exercises.length} movements, every one sharing a primary muscle`);
  console.log('[enrich] prescription: 0 records carry one — the 873 defaults are deleted');

  // schema 4: kind gained 'mobility', prescription left, regression/progression/bounty deleted.
  data.schema_version = 4;
  data.tag_muscles = TAG_MUSCLES;
  // 1-space indent, matching scripts/fetch-exercises.js, which is what wrote this file first.
  // The previous line here was a bare JSON.stringify(data) — running it collapsed 37,846 lines to
  // one and produced a diff nobody could review. A data file's formatting is part of its interface.
  fs.writeFileSync(FILE, JSON.stringify(data, null, 1));
  console.log(`[enrich] wrote ${data.exercises.length} movements, schema 4.`);
}
main();
