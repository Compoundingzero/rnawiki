// RNAwiki — THE PROTOCOL STUDIO SAFETY ENGINE (W7, 2026-08-09)
//
// A user-built protocol is user-generated MEDICAL content.
//
// Every safety rule on this site is enforced by a function in build/parse.js or
// build/prerender.js, running over files on disk, before a deploy. A user protocol is written
// AFTERWARDS, by somebody else, into a database row that no build will ever read. This module is
// the twin: the same rules, at SAVE.
//
// IT IS PURE. No require('pg'), no fs, no network. That is not tidiness — build/parse.js
// require()s this file inside a gate, so anything with a side effect here becomes a side effect of
// the build, and a module that read DATABASE_URL would break the build on a machine that has none.
//
// IT OWNS NO CORPUS. init() is handed the already-loaded corpora. A second copy of the corpus is
// the defect class this codebase has caught repeatedly.
//
// IT OWNS NO MATCHER. The interaction verdict comes from site/ixn-engine.js, which is also what
// site/app.js and build/parse.js read, so the refusal a person hits at save is the same row they
// were already shown while building. assertOneInteractionMatcher() enforces that.
'use strict';

const ENGINE = require('./site/ixn-engine.js');

let C = null;

// The kinds an item may be. Anything else is refused by R1, deliberately: a Studio that accepts an
// unknown `k` today accepts whatever the next feature invents, unvalidated.
const KINDS = { c: 'compound', x: 'exercise', f: 'food', fn: 'tool' };

// Keys an item may carry beyond k/id. EVERY ONE IS AN OVERRIDE, AND ABSENCE MEANS INHERITANCE.
// There is no `name`, no `text`, no `instructions` and no `evidence` key, and there must never be
// one: the moment a protocol can carry its own copy of a compound's text, a correction to the
// master stops reaching the people running it.
const OVERRIDE_KEYS = {
  c: ['dose', 'days', 'note'],
  x: ['sets', 'reps', 'days', 'note'],
  f: ['days', 'note'],
  fn: ['target', 'days'],
};

const MAX_ITEMS = 60;
const MAX_DEPTH = 8;

// EVERY SAVE-TIME RULE NAMES THE BUILD GATE IT MIRRORS.
// assertStudioSafetyMirrorsBuildGates() in build/parse.js checks this list in BOTH directions:
// forward (the named gate exists) and backward (every gate in its SAFETY_FAMILY appears here).
// Deleting an entry fails the build. That is the point — the failure mode this guards against is
// not that a twin is wrong, it is that somebody adds a SIXTH build gate next year and never writes
// its twin. Nothing would fail; user protocols would just quietly stop being held to one more rule
// than they used to be.
const RULES = [
  { id: 'unknown-entity', mirrors: 'assertInteractionCoverage',
    says: 'Every item must be an id this corpus actually holds, carrying only keys a protocol may override.' },
  { id: 'contraindicated-move', mirrors: 'assertAvoidMovements',
    says: 'A protocol may not prescribe a movement its own root cause tells people to avoid.' },
  { id: 'uncapped-dose', mirrors: 'assertDoseCalculators',
    says: 'A dose override is accepted only where RNAwiki publishes a machine-readable ceiling, only from that compound’s own ladder, and never above the ceiling.' },
  { id: 'restricted-substance', mirrors: 'assertRegulatoryAxes',
    says: 'A published protocol may not instruct anyone to take a prescription-only, controlled or unapproved substance.' },
  { id: 'interaction-coverage', mirrors: 'assertInteractionCoverage',
    says: 'A public protocol containing two or more compounds requires an authored rule for every exact pair. Individually tagged compounds are not pair coverage; missing coverage is unknown, never safe.' },
  { id: 'unreviewed-creator-copy', mirrors: 'assertClaimTextIntact',
    says: 'Free-text titles and notes may be kept in a private draft, but they cannot become public health copy until a human review workflow approves them.' },
  { id: 'animal-only-evidence', mirrors: 'assertHumanEvidenceStars',
    says: 'A compound whose evidence is animal-only carries that label, rendered live from the master entry.' },
];

// init({data, interactions, exercises, foods, functionIds})
function init(corpora) {
  const D = corpora.data, EX = corpora.exercises, FD = corpora.foods;
  if (!D) throw new Error('studio-safety.init needs the compound corpus (site/data.js)');
  if (!EX || !FD) throw new Error('studio-safety.init needs exercises and foods too — server.js historically loaded ONLY data.js into its vm sandbox. Add the other two to the SAME load; a second loader is a second corpus.');
  C = {
    compounds: D.compounds || [],
    byId: Object.fromEntries((D.compounds || []).map((c) => [c.id, c])),
    problems: (D.graph || {}).problems || [],
    exById: Object.fromEntries((EX.exercises || []).map((e) => [e.id, e])),
    foodById: Object.fromEntries((FD.foods || []).map((f) => [f.id, f])),
    ladders: D.doseLadders || {},
    fnIds: new Set(corpora.functionIds || []),
  };
  ENGINE.init(D, corpora.interactions);
  return C;
}

function ready() { return !!C; }

const key = (it) => it.k + ':' + it.id;

function rootCause(pid, rcid) {
  const p = C.problems.find((x) => x.id === pid); if (!p) return null;
  return (p.root_causes || []).find((x) => x.id === rcid) || null;
}

// ---- THE FIVE RULES ---------------------------------------------------------------------------

// R1 — unknown entity. Mirrors assertInteractionCoverage, which is the gate that asserts every
// compound in the corpus is a thing the engine can reason about. Today POST /api/share-plan trims
// each element to 80 characters and stores it, and GET /api/shared-plan echoes it verbatim to
// anyone holding the code: an unauthenticated, publicly readable, arbitrary-text store. An id that
// does not resolve is not a typo to tolerate, it is text somebody chose.
function r1(items, refuse) {
  items.forEach((it) => {
    if (!it || typeof it !== 'object') return refuse('unknown-entity', 'An item in this protocol is not an item.');
    if (!KINDS[it.k]) return refuse('unknown-entity', `"${String(it.k).slice(0, 24)}" is not a kind of thing this site holds.`, it);
    const ok = it.k === 'c' ? !!C.byId[it.id]
      : it.k === 'x' ? !!C.exById[it.id]
        : it.k === 'f' ? !!C.foodById[it.id]
          : C.fnIds.has(it.id);
    if (!ok) return refuse('unknown-entity', `No ${KINDS[it.k]} on RNAwiki has the id "${String(it.id).slice(0, 40)}".`, it);
    const allowed = OVERRIDE_KEYS[it.k] || [];
    Object.keys(it).forEach((k) => {
      if (k === 'k' || k === 'id' || allowed.includes(k)) return;
      refuse('unknown-entity', `"${String(k).slice(0, 24)}" is not something a protocol may override on a ${KINDS[it.k]}. A protocol stores ids and adjustments; it never stores its own copy of the text.`, it);
    });
    if (it.days !== undefined) {
      const d = it.days;
      if (!Array.isArray(d) || !d.length || d.length > 7 || d.some((n) => !Number.isInteger(n) || n < 0 || n > 6) || new Set(d).size !== d.length) {
        refuse('unknown-entity', 'Days must be a list of distinct weekday numbers, 0 (Sunday) to 6.', it);
      }
    }
    if (it.note !== undefined && (typeof it.note !== 'string' || it.note.length > 240)) {
      refuse('unknown-entity', 'A per-item note is a short string or nothing.', it);
    }
  });
}

// R2 — contraindicated movement. Mirrors assertAvoidMovements (build/parse.js), which exists
// because rotator-cuff impingement prescribes "avoid painful overhead loading" and the computed
// exercise list rendered an overhead cable press as movement #1.
// HONEST SCOPE, stated rather than implied: 2 of 52 root causes carry avoid_movements today
// (neck-shoulder/upper-cross and neck-shoulder/rotator-cuff-impinge). This rule reaches exactly
// those two, and validate() reports how many terms it actually checked so a "0 refusals" answer on
// the other 50 cannot be mistaken for a clearance.
function r2(items, rc, refuse) {
  const avoid = (rc && Array.isArray(rc.avoid_movements)) ? rc.avoid_movements : [];
  if (!avoid.length) return 0;
  items.filter((it) => it.k === 'x').forEach((it) => {
    const e = C.exById[it.id]; if (!e) return;
    const hay = ((e.name || '') + ' ' + (e.move_tags || []).join(' ') + ' ' + (e.primaryMuscles || []).join(' '))
      .toLowerCase().replace(/_/g, ' ');
    const hit = avoid.find((a) => hay.includes(String(a).toLowerCase()));
    if (hit) refuse('contraindicated-move', `${e.name} is a "${hit}" movement, and this protocol's own root cause tells people to avoid exactly that.`, it);
  });
  return avoid.length;
}

// R3 — uncapped dose. Mirrors assertDoseCalculators (build/parse.js). The ladder is generated at
// build time from the compound's own authored capValue/capUnit; 7 of 171 have an open ladder and
// each of the other 164 carries the specific reason it does not. A dose that is not ON the ladder
// is refused even when it is under the ceiling, because the ladder is what makes "the user cannot
// type raw data" true on the SERVER and not merely in the UI.
function r3(items, refuse) {
  items.filter((it) => it.k === 'c' && it.dose !== undefined).forEach((it) => {
    const c = C.byId[it.id]; const nm = c ? c.name : it.id;
    const lad = C.ladders[it.id];
    if (!lad || lad.locked) {
      return refuse('uncapped-dose', `RNAwiki publishes no machine-readable dose ceiling for ${nm}, so a dose here could not be checked against anything. ${lad ? lad.why + ' ' : ''}The protocol can still include it — it will show the dose the compound's own page publishes.`, it);
    }
    const v = (it.dose && typeof it.dose === 'object') ? it.dose.v : it.dose;
    if (typeof v !== 'number' || !isFinite(v)) return refuse('uncapped-dose', `A dose has to be a number chosen from the ladder ${nm} publishes.`, it);
    if (!lad.rungs.includes(v)) return refuse('uncapped-dose', `${v}${lad.unit} is not one of the steps offered for ${nm}. Doses are chosen from a ladder, not typed — a typed dose is an uncapped dose calculator, and this site refuses to publish one of those.`, it);
    if (v > lad.cap) refuse('uncapped-dose', `${v}${lad.unit} is above the ${lad.cap}${lad.unit} ceiling RNAwiki publishes for ${nm}.`, it);
  });
}

// R4 — restricted substance. Mirrors assertRegulatoryAxes (build/parse.js) and CLAUDE.md rules 6
// and 7. 95 of 171 compounds are authored consumer_renderable:false (prescription 38, unapproved
// 34, controlled 22, pharmacy 1) — their own /c/ pages refuse to render self-dosing. A PUBLISHED
// protocol is the advertising surface: Medicines Act 1975 s.51 + the Medicines (Medical
// Advertisements) Regulations carry a prior-permit requirement and no educational exemption. So
// publishing one is refused unconditionally. Keeping one in a PRIVATE draft is allowed and carries
// the compound's own authored supply sentence, because somebody already prescribed a medicine
// should be able to write it into their own record. (That split is the owner's to confirm; the
// stricter alternative is to refuse it everywhere.)
function r4(items, publish, refuse, warn) {
  items.filter((it) => it.k === 'c').forEach((it) => {
    const c = C.byId[it.id]; if (!c || c.consumer_renderable !== false) return;
    const tag = (c.supply || {}).tag || 'Not a general-sale substance';
    if (publish) refuse('restricted-substance', `${c.name} — ${tag}. A protocol anyone can open is a public instruction to take it, and RNAwiki does not publish those. It stays in your own copy.`, it);
    else warn('restricted-substance', 'note', `${c.name} — ${tag}. This stays in your own copy; it cannot be published.`, it);
  });
}

// R5 — the interaction engine may not SILENTLY ACCEPT a pairing it flags as dangerous.
// The verdict comes from site/ixn-engine.js, the same matcher interactionPanel() renders from.
// A danger row refuses the publish and carries the row's own title/why/action, so the client
// cannot invent a friendlier message. blunt and timing rows do NOT refuse — they are recorded and
// printed on the protocol.
// AND COVERAGE IS RECORDED, ALWAYS. A compound the engine holds no firable pharmacology for can
// never produce a flag, so an empty warn list can mean "nothing found" or "nothing checkable", and
// those are not the same sentence. interactionPanel() has had that exact bug fixed twice.
function r5(items, publish, refuse, warn) {
  const list = items.filter((it) => it.k === 'c').map((it) => C.byId[it.id]).filter(Boolean);
  const pairs = ENGINE.pairCoverage(list);
  const compounds = ENGINE.covered(list);
  const cov = {
    checked: pairs.authored,
    of: pairs.total,
    unit: 'pairs',
    state: pairs.state,
    compound_checked: compounds.length,
    compound_of: list.length,
    unknown_pairs: pairs.pairs.filter((p) => !p.covered).map((p) => p.names),
  };
  if (list.length < 2) return cov;

  // A public multi-compound protocol is an instruction to combine exact pairs. It may only be
  // published when an authored rule reaches EVERY pair. Previously caffeine + magnesium passed as
  // “2 of 2 compounds covered” merely because each carried a tag used somewhere else in the
  // corpus. That is not evidence about their pairing. Missing pair data is unknown, not safe.
  if (publish && cov.state !== 'complete') {
    refuse('interaction-coverage',
      `Pair guidance is ${cov.state === 'none' ? 'absent' : 'incomplete'}: RNAwiki has an authored rule for ${cov.checked} of ${cov.of} exact pair${cov.of === 1 ? '' : 's'}. A public protocol with more than one compound needs a rule for every pair. Missing coverage is unknown, not safe; remove an unknown pairing or keep this as a private draft.`);
  }
  const r = ENGINE.stackInteractions(list);
  (r.flags || []).forEach((f) => {
    const who = (f.involved || []).join(' + ');
    const msg = `${f.title}${who ? ' — ' + who : ''}. ${f.why || ''}${f.action ? ' What to do: ' + f.action : ''}`.trim();
    if (f.tier === 'danger') {
      if (publish) refuse('danger-interaction', msg, null, { id: f.id, tier: f.tier, title: f.title, why: f.why, action: f.action, involved: f.involved });
      else warn('danger-interaction', 'danger', msg, null, { id: f.id, tier: f.tier, title: f.title, why: f.why, action: f.action, involved: f.involved });
    } else {
      warn('interaction', f.tier, msg, null, { id: f.id, tier: f.tier, title: f.title, why: f.why, action: f.action, involved: f.involved });
    }
  });
  return cov;
}

// D1 — animal-only evidence. NOT a refusal. 7 of 171 compounds carry animalOnly, capped at 2 stars
// and badge-labelled by assertHumanEvidenceStars(). The label is rendered live from the master at
// read time and never copied into the row, so a re-rating reaches every protocol that used it.
function d1(items, warn) {
  items.filter((it) => it.k === 'c').forEach((it) => {
    const c = C.byId[it.id];
    if (c && c.animalOnly) warn('animal-only-evidence', 'note', `${c.name}: ${c.badge || 'animal evidence only'}`, it);
  });
}

// R6 — unreviewed creator copy. A length limit does not make user text clinically reviewed:
// "cures cancer" is fourteen characters. Until a real ReviewRecord-backed approval queue exists,
// notes remain useful in private drafts but cannot cross the public boundary. Public titles are
// separately generated by server.js from the governed problem/root-cause corpus.
function r6(spec, publish, refuse, warn) {
  const hasRowNote = (spec.items || []).some((it) => it && typeof it.note === 'string' && it.note.trim());
  const hasProtocolNote = typeof spec.note === 'string' && spec.note.trim();
  if (!hasRowNote && !hasProtocolNote) return;
  const message = 'Creator notes can stay in this private draft, but RNAwiki cannot publish them until a human review workflow is available. Remove the notes to publish the reviewed blocks now.';
  if (publish) refuse('unreviewed-creator-copy', message);
  else warn('unreviewed-creator-copy', 'note', message);
}

// ---- validate ---------------------------------------------------------------------------------
function validate({ spec, base_pid, base_rcid, publish }) {
  if (!C) throw new Error('studio-safety.validate() called before init()');
  const refusals = [], warns = [];
  const refuse = (rule, message, item, row) => refusals.push({ rule, message, item: item ? key(item) : null, row: row || null });
  const warn = (rule, tier, message, item, row) => warns.push({ rule, tier, message, item: item ? key(item) : null, row: row || null });

  if (!spec || typeof spec !== 'object' || Array.isArray(spec) || spec.v !== 1 || !Array.isArray(spec.items)) {
    return { ok: false, refusals: [{ rule: 'shape', message: 'A protocol is {v:1, items:[…]}.', item: null, row: null }], warn: [], coverage: null };
  }
  if (!spec.items.length) refuse('shape', 'An empty protocol is not a protocol. Add at least one thing to do.');
  if (spec.items.length > MAX_ITEMS) refuse('shape', `A protocol tops out at ${MAX_ITEMS} items. Past that nobody does it, and a stated limit is more honest than an unbounded store.`);
  const seen = new Set();
  spec.items.forEach((it) => { if (!it || typeof it !== 'object') return; const k = key(it); if (seen.has(k)) refuse('shape', `${k} is in this protocol twice.`, it); seen.add(k); });

  const rc = (base_pid && base_rcid) ? rootCause(base_pid, base_rcid) : null;
  if (base_pid && !rc) refuse('shape', `RNAwiki has no root cause ${base_pid}/${base_rcid} to build this on.`);

  r1(spec.items, refuse);
  if (spec.note !== undefined && (typeof spec.note !== 'string' || spec.note.length > 500)) {
    refuse('shape', 'A protocol note is a short string or nothing.');
  }
  const avoidTermsChecked = r2(spec.items, rc, refuse);
  r3(spec.items, refuse);
  r4(spec.items, !!publish, refuse, warn);
  const coverage = r5(spec.items, !!publish, refuse, warn);
  r6(spec, !!publish, refuse, warn);
  d1(spec.items, warn);

  // The ❔ sentence, written once, here, and printed verbatim by whatever renders the protocol.
  // "0 of 6" is not a clearance and this is the string that says so.
  const says = !coverage || coverage.compound_of === 0
    ? 'No compounds in this protocol, so there was nothing to cross-check.'
    : coverage.state === 'not_applicable'
      ? 'Only one compound here, so there is no pairing to check.'
      : coverage.state === 'complete'
      ? `RNAwiki has narrow authored guidance for all ${coverage.of} exact pair${coverage.of === 1 ? '' : 's'} in this protocol. Read those rows; this is not a broad safety clearance.`
      : coverage.state === 'partial'
        ? `Pair guidance is incomplete: RNAwiki has an authored rule for ${coverage.checked} of ${coverage.of} exact pairs. Every remaining pair is unknown, not safe.`
        : `No pair guidance: RNAwiki has an authored rule for 0 of ${coverage.of} exact pairs. An empty result is unknown, not safe.`;

  return {
    ok: refusals.length === 0,
    refusals,
    warn: warns,
    coverage,
    base_pid: base_pid || null,
    base_rcid: base_rcid || null,
    spec: { v: 1, items: spec.items, note: typeof spec.note === 'string' ? spec.note.slice(0, 500) : null },
    safety: {
      engine: ENGINE.stamp(),
      at: new Date().toISOString(),
      refusals, warn: warns, coverage, says,
      avoidTermsChecked,
    },
  };
}

// ---- resolve + apply + diff (the remix half) ---------------------------------------------------
// A root protocol stores a FULL spec; a remix stores ONLY its differences. resolve() walks the
// parent chain and applies each patch. The chain is bounded BOTH by studio_protocols.depth <= 8 and
// by the counter here, because a denormalised column can be wrong and a cycle must not hang a
// request.
async function resolve(row, fetchByCode, _n) {
  _n = _n || 0;
  if (_n > MAX_DEPTH) return { ok: false, error: 'This remix chain is deeper than eight. It cannot be resolved.' };
  if (!row.parent_code) {
    // An orphaned diff — parent_code was nulled by ON DELETE SET NULL while depth says otherwise —
    // is unresolvable and must SAY so, never render as an empty protocol.
    if (row.depth > 0) return { ok: false, error: 'The protocol this was remixed from has been removed, so this remix cannot be rebuilt.' };
    return { ok: true, spec: row.spec };
  }
  const parent = await fetchByCode(row.parent_code);
  if (!parent) return { ok: false, error: 'The protocol this was remixed from has been removed, so this remix cannot be rebuilt.' };
  const base = await resolve(parent, fetchByCode, _n + 1);
  if (!base.ok) return base;
  return { ok: true, spec: apply(base.spec, row.spec) };
}

function apply(base, patch) {
  const items = (base.items || []).map((x) => Object.assign({}, x));
  const idx = (k) => items.findIndex((x) => key(x) === k);
  (patch.drop || []).forEach((k) => { const i = idx(k); if (i >= 0) items.splice(i, 1); });
  Object.entries(patch.set || {}).forEach(([k, ov]) => {
    const i = idx(k); if (i < 0) return;
    Object.entries(ov).forEach(([f, v]) => { if (v === null) delete items[i][f]; else items[i][f] = v; });
  });
  (patch.add || []).forEach((it) => { if (idx(key(it)) < 0) items.push(it); });
  (patch.move || []).forEach(([k, to]) => {
    const i = idx(k); if (i < 0) return;
    const [it] = items.splice(i, 1);
    items.splice(Math.max(0, Math.min(items.length, to)), 0, it);
  });
  return { v: 1, items, note: patch.note !== undefined ? patch.note : base.note };
}

// diff(base, next) -> the smallest patch that turns base into next. Computed on the SERVER, not in
// the browser: a remix tab can sit open while its parent changes, and only the server can diff
// against what the parent is NOW.
function diff(base, next) {
  const bk = new Map((base.items || []).map((x) => [key(x), x]));
  const nk = new Map((next.items || []).map((x) => [key(x), x]));
  const patch = { v: 1, add: [], drop: [], set: {}, move: [] };
  bk.forEach((_, k) => { if (!nk.has(k)) patch.drop.push(k); });
  nk.forEach((n, k) => {
    const b = bk.get(k);
    if (!b) { patch.add.push(n); return; }
    const d = {};
    new Set(Object.keys(b).concat(Object.keys(n))).forEach((f) => {
      if (f === 'k' || f === 'id') return;
      if (JSON.stringify(b[f]) !== JSON.stringify(n[f])) d[f] = n[f] === undefined ? null : n[f];
    });
    if (Object.keys(d).length) patch.set[k] = d;
  });
  // Order is compared on what SURVIVES into next, so a drop above an item does not report every
  // item below it as moved.
  const survivors = (base.items || []).map(key).filter((k) => nk.has(k));
  (next.items || []).map(key).forEach((k, i) => {
    if (survivors[i] !== k && bk.has(k)) patch.move.push([k, i]);
  });
  if (next.note !== base.note) patch.note = next.note === undefined ? null : next.note;
  ['add', 'drop', 'move'].forEach((k) => { if (!patch[k].length) delete patch[k]; });
  if (!Object.keys(patch.set).length) delete patch.set;
  return patch;
}

module.exports = { RULES, KINDS, OVERRIDE_KEYS, MAX_ITEMS, MAX_DEPTH, init, ready, validate, resolve, apply, diff };
