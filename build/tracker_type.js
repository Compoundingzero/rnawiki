#!/usr/bin/env node
// build/tracker_type.js — assign the report §2.6 Response-Tracker type (1–5) to all 52 protocols.
// Emits data/tracker_type.json. Merge into clinical_graph root_causes as a required field, then
// /plan and /protocol render the right baseline→re-check→decision-rule instead of the bogus
// one-leg movement screen (which has <50% inter-rater agreement — report §2.6).
//
//   1 Provocation & tolerance  — mechanical MSK / tendon (2wk tolerance, 12wk strength)
//   2 Visible lesion count     — skin / hair (12wk min, fixed on-device photo protocol)
//   3 Symptom diary            — gut / sleep / mood / energy / focus (2wk baseline, 2–3 nums/day)
//   4 Measured marker          — BP / weight / waist / blood panel (window per marker; beat the noise)
//   5 None, deliberately       — prevention / longevity / asymptomatic risk (say: no short-term signal)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const GRAPH = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'clinical_graph.json'), 'utf8'));

// keyword → type, ordered by specificity (first match wins)
const RULES = [
  [/(knee|back|neck|shoulder|hip|elbow|wrist|ankle|foot|rotator|achilles|tendin|cross|posterior-chain|core|posture|impinge|sarcopenia|bone-density|low-bmd)/i, 1],
  [/(acne|eczema|psoriasis|hair|sebum|dht|skin|dermat)/i, 2],
  [/(gut|dysbios|sleep|insomnia|mood|depress|fatigue|brain-fog|adhd|focus|anxiety|stress|burnout|hpa|headache|migraine|craving|shift-work|circadian|cognit|neuroinflamm|monoamine)/i, 3],
  [/(blood-pressure|hypertens|cholesterol|ldl|lipid|insulin-resistance|glycem|visceral|fat-loss|metabolic-adaptation|thyroid|hypothyroid|pcos|testosterone|hypogonad|endothel|sodium)/i, 4],
  [/(longevity|mtor|immunit|micronutrient|prevention|asymptomatic)/i, 5],
];
// explicit overrides where a keyword collides (e.g. bone-density is asymptomatic-risk despite MSK words)
const OVERRIDE = {
  'bone-density/low-bmd': 5,        // asymptomatic until fracture — act on population risk, no daily signal
  'longevity/mtor-overactivation': 5,
  'immunity/micronutrient-immune': 3, // you feel infections; a symptom diary is the honest short-term signal
  'low-testosterone/primary-hypogonadism': 4, // the marker (serum T) is the tracker, not a symptom diary
};

const WINDOW = {
  1: '2 weeks tolerance, 12 weeks strength', 2: '12 weeks minimum, stated loudly',
  3: '2-week baseline before starting', 4: 'per marker: BP 2wk · lipids 8–12wk · HbA1c 12wk · waist/weight 4wk',
  5: 'no short-term window — you are acting on population risk',
};

const rows = [];
(GRAPH.problems || []).forEach((p) => (p.root_causes || []).forEach((rc) => {
  const key = `${p.id}/${rc.id}`;
  const hay = `${p.id} ${p.name} ${p.category || ''} ${rc.id} ${rc.name}`;
  let type = OVERRIDE[key];
  if (!type) for (const [re, t] of RULES) { if (re.test(hay)) { type = t; break; } }
  if (!type) type = 3; // safest default: a symptom diary claims the least
  rows.push({ protocol: key, name: `${p.name} — ${rc.name}`, trackerType: type, window: WINDOW[type], source: OVERRIDE[key] ? 'override' : 'rule' });
}));

const dist = {}; rows.forEach((r) => dist[r.trackerType] = (dist[r.trackerType] || 0) + 1);
fs.writeFileSync(path.join(ROOT, 'data', 'tracker_type.json'), JSON.stringify({
  note: 'Response-Tracker type per protocol (report §2.6). Merge as required field on each root_cause. Photos for type 2 stay ON-DEVICE (uploading them creates a PDPA obligation).',
  distribution: dist, protocols: rows,
}, null, 2));
console.log(`[tracker] ${rows.length} protocols | distribution:`, JSON.stringify(dist));
rows.forEach((r) => console.log(`  T${r.trackerType} ${r.source === 'override' ? '*' : ' '} ${r.protocol}`));
