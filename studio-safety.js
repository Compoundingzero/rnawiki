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

// The execution snapshot deliberately excludes validation timestamps and prose summaries that can
// change without changing an instruction. It does include every field of every CURRENT warning:
// if a corpus edit adds or changes a warning, Start must see a different content address. Sorting
// object keys and warning rows makes the address independent of implementation-only key/order
// changes while preserving every value the reader can be shown.
function snapshotValue(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) return value.map((entry) => snapshotValue(entry));
  if (!value || typeof value !== 'object') return null;
  const out = {};
  Object.keys(value).sort().forEach((name) => {
    if (value[name] !== undefined && typeof value[name] !== 'function') out[name] = snapshotValue(value[name]);
  });
  return out;
}
function snapshotSafety(result) {
  const warn = (result && Array.isArray(result.warn) ? result.warn : [])
    .map((warning) => snapshotValue(warning))
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return { warn };
}

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
  { id: 'interaction-unknown', mirrors: 'assertInteractionCoverage',
    says: 'A private draft may hold as many compounds as its creator wants. Public publication fails closed until an authored rule reaches every exact pair. Individually tagged compounds are not pair coverage.' },
  { id: 'danger-interaction', mirrors: 'assertInteractionSources',
    says: 'A combination the rules flag as dangerous stays in a private draft with its cited warning, but public publication is refused.' },
  { id: 'unreviewed-creator-copy', mirrors: 'assertClaimTextIntact',
    says: 'Free-text titles and notes may be kept in a private draft, but they cannot become public health copy until a human review workflow approves them.' },
  { id: 'animal-only-evidence', mirrors: 'assertHumanEvidenceStars',
    says: 'A compound whose evidence is animal-only carries that label, rendered live from the master entry.' },
];

// init({data, interactions, exercises, foods, functions})
function init(corpora) {
  const D = corpora.data, EX = corpora.exercises, FD = corpora.foods;
  const functions = Array.isArray(corpora.functions) ? corpora.functions
    : (corpora.functionIds || []).map((id) => ({ id }));
  if (!D) throw new Error('studio-safety.init needs the compound corpus (site/data.js)');
  if (!EX || !FD) throw new Error('studio-safety.init needs exercises and foods too — server.js historically loaded ONLY data.js into its vm sandbox. Add the other two to the SAME load; a second loader is a second corpus.');
  C = {
    compounds: D.compounds || [],
    byId: Object.fromEntries((D.compounds || []).map((c) => [c.id, c])),
    problems: (D.graph || {}).problems || [],
    exById: Object.fromEntries((EX.exercises || []).map((e) => [e.id, e])),
    foodById: Object.fromEntries((FD.foods || []).map((f) => [f.id, f])),
    ladders: D.doseLadders || {},
    fnIds: new Set(functions.map((f) => f.id)),
    fnById: Object.fromEntries(functions.map((f) => [f.id, f])),
  };
  ENGINE.init(D, corpora.interactions);
  return C;
}

function ready() { return !!C; }

const key = (it) => it.k + ':' + it.id;

function problem(pid) {
  return C.problems.find((x) => x.id === pid) || null;
}

function rootCause(pid, rcid) {
  const p = problem(pid); if (!p) return null;
  return (p.root_causes || []).find((x) => x.id === rcid) || null;
}

function canonicalRoute(pid, rid) {
  const p = problem(pid); if (!p) return null;
  return (p.routes || []).find((x) => x.id === rid) || null;
}

function plainCorpusText(value) {
  return String(value || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// A public branch needs one explicit first action and an explicit weekly rhythm. The creator still
// builds with the same ordered item list; this small object merely makes the execution contract
// machine-readable. It deliberately carries no prose: fit, tracking and stop guidance come from
// the governed Topic -> Route corpus below, so a correction reaches every branch that uses it.
function validateExecution(spec, requireExecution, refuse) {
  const execution = spec && spec.execution;
  if (execution == null) {
    if (requireExecution) refuse('shape', 'Choose the first action and confirm the weekly schedule before publishing.');
    return null;
  }
  if (typeof execution !== 'object' || Array.isArray(execution)) {
    refuse('shape', 'Protocol execution must name one first action.');
    return null;
  }
  const extra = Object.keys(execution).filter((k) => k !== 'v' && k !== 'primary');
  if (execution.v !== 1 || extra.length || typeof execution.primary !== 'string') {
    refuse('shape', 'Protocol execution is {v:1, primary:"kind:id"}; it carries no creator-written health copy.');
    return null;
  }
  const itemKeys = (spec.items || []).filter((it) => it && typeof it === 'object').map(key);
  if (itemKeys.filter((k) => k === execution.primary).length !== 1) {
    refuse('shape', 'The first action must be one item in this protocol.');
  }
  (spec.items || []).forEach((it) => {
    if (it && typeof it === 'object' && it.days === undefined) {
      refuse('shape', 'Confirm the days for every item before publishing. Choose Every day or specific weekdays.', it);
    }
  });
  return { v: 1, primary: execution.primary };
}

function executionGuide(topicId, routeId, spec, execution) {
  const p = topicId ? problem(topicId) : null;
  const route = p && routeId ? canonicalRoute(topicId, routeId) : null;
  if (!p || !route) return null;
  const safety = p.safety || {}, plan = p.plan || {};
  const first = execution && execution.primary
    ? execution.primary
    : ((spec.items || [])[0] ? key(spec.items[0]) : null);
  return {
    v: 1,
    contract: execution ? 'execution-v1' : 'legacy-v1',
    primary: first,
    fit: {
      summary: (route.fit && (route.fit.symptoms || route.fit.diagnostic)) || route.diagnostic || route.plain || '',
      lab: (route.fit && route.fit.labMarker) || '',
      confused_with: (route.fit && route.fit.confusedWith) || '',
      limits: (route.fit && route.fit.limits) || '',
    },
    check_in: {
      metric: safety.metric || '',
      checkpoint: safety.checkpoint || '',
    },
    stop: {
      // Topic-level troubleshooting often names one specific route (for example, sleep) and must
      // never be copied onto another creator branch (for example, iron). The authored reassessment
      // block is the shared safety boundary; the visible instruction only tells the reader how to
      // use that boundary and invents no clinical timing or claim.
      issue: 'Any warning sign below appears',
      horizon: 'Stop now',
      action: 'Stop this plan and follow the care guidance below.',
      red_flags: plainCorpusText(plan.reassess || ''),
    },
  };
}

// ---- THE FIVE RULES ---------------------------------------------------------------------------

// R1 — unknown entity. Mirrors assertInteractionCoverage, which is the gate that asserts every
// compound in the corpus is a thing the engine can reason about. Today POST /api/share-plan trims
// each element to 80 characters and stores it, and GET /api/shared-plan echoes it verbatim to
// anyone holding the code: an unauthenticated, publicly readable, arbitrary-text store. An id that
// does not resolve is not a typo to tolerate, it is text somebody chose.
function r1(items, publish, refuse) {
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
    if (it.k === 'x') {
      // A public movement is an instruction somebody will execute. Missing volume cannot inherit
      // 3×10 from a renderer because no governed record chose those numbers. Private drafts may
      // remain incomplete; publication requires the creator to make both bounded choices.
      if (publish && (it.sets === undefined || it.reps === undefined)) {
        refuse('unknown-entity', 'Set both movement sets and reps before publishing. RNAwiki does not fill missing movement volume with 3 × 10.', it);
      }
      if (it.sets !== undefined && (!Number.isInteger(it.sets) || it.sets < 1 || it.sets > 10)) {
        refuse('unknown-entity', 'Movement sets must be a whole number from 1 to 10.', it);
      }
      if (it.reps !== undefined && (!Number.isInteger(it.reps) || it.reps < 1 || it.reps > 30)) {
        refuse('unknown-entity', 'Movement reps must be a whole number from 1 to 30.', it);
      }
    }
    if (it.k === 'fn' && it.target !== undefined) {
      const fn = C.fnById[it.id] || {};
      const min = Number(fn.step) || 1;
      const max = Number(fn.target) * 4;
      const value = it.target;
      const aligned = Number.isFinite(value) && Math.abs((value / min) - Math.round(value / min)) < 1e-9;
      if (!Number.isFinite(max) || max <= 0) {
        refuse('unknown-entity', 'This tool has no governed numeric target to override.', it);
      } else if (!Number.isFinite(value) || value < min || value > max || !aligned) {
        refuse('unknown-entity', `This tool's target must be a number from ${min} to ${max} in steps of ${min}.`, it);
      }
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
    const v = it.dose;
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

// R5 — THE OVERLAP-REPERCUSSION CHECKER.
// A creator can keep any number of compounds in a PRIVATE draft and see every known/unknown row.
// Publication is a different boundary: an uncovered exact pair is uncertainty about the proposed
// combination, and a danger row is a known health repercussion. Both fail closed. A warning is not
// informed consent for strangers who never spoke to the creator.
//
// Coverage is recorded even for a refusal. An empty warn list can mean "nothing found" or "nothing
// checkable", and those are not the same sentence. Detection remains site/ixn-engine.js, the same
// matcher the builder and reader use.
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
  cov.unknown = cov.unknown_pairs.length;
  if (list.length < 2) return cov;

  // A public multi-compound protocol is an instruction to combine exact pairs. It may only be
  // published when an authored rule reaches EVERY pair. Previously caffeine + magnesium passed as
  // “2 of 2 compounds covered” merely because each carried a tag used somewhere else in the
  // corpus. That is not evidence about their pairing. Missing pair data is unknown, not safe.
  // THE FAIL-SAFE CLAUSE. A pair no authored rule reaches produces no flag, and "no flag" is
  // indistinguishable from "checked and clear" unless the boundary refuses to call it publishable.
  if (cov.state !== 'complete' && cov.of > 0) {
    const message = `Not checked: ${cov.unknown} of ${cov.of} exact pairing${cov.of === 1 ? '' : 's'} here ${cov.unknown === 1 ? 'has' : 'have'} no authored rule. Unknown is not safe.`;
    const row = { id: 'unknown-pairs', tier: 'unknown', title: 'Some of these combinations have not been checked', unknown: cov.unknown_pairs };
    if (publish) refuse('interaction-unknown', message, null, row);
    else warn('interaction-unknown', 'unknown', message, null, row);
  }
  const r = ENGINE.stackInteractions(list);
  (r.flags || []).forEach((f) => {
    const who = (f.involved || []).join(' + ');
    const msg = `${f.title}${who ? ' — ' + who : ''}. ${f.why || ''}${f.action ? ' What to do: ' + f.action : ''}`.trim();
    // EVERY ROW CARRIES ITS SOURCE onto the stored verdict, so the warning a reader eventually sees
    // on the published protocol cites the same reference the creator was shown at save time.
    // `plain` is the one-sentence, no-jargon version; assertInteractionSources() requires both.
    const row = {
      id: f.id, tier: f.tier, title: f.title, why: f.why, action: f.action, involved: f.involved,
      src: f.src || '', srcLabel: f.srcLabel || '', srcQuote: f.srcQuote || '',
      conf: f.conf || 'none', plain: f.plain || '',
    };
    if (f.tier === 'danger' && publish) refuse('danger-interaction', msg, null, row);
    else warn(f.tier === 'danger' ? 'danger-interaction' : 'interaction', f.tier, msg, null, row);
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
function validate({ spec, base_pid, base_rcid, topic_id, route_id, publish, require_execution }) {
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

  let resolvedTopicId = topic_id || null;
  let resolvedRouteId = route_id || null;
  let rc = null;
  let route = null;
  let routeRoots = [];

  // New rows bind directly to Topic → Route. Legacy rows may still arrive as (base_pid, base_rcid);
  // every official root emitted by parse.js now carries route_id, so the old pair resolves to the
  // same canonical route. When both forms are present they must agree — no silent fallback, no
  // borrowing a root cause from another route to obtain its plan blocks.
  if (!!base_pid !== !!base_rcid) {
    refuse('shape', 'A legacy protocol base needs both base_pid and base_rcid, or neither.');
  } else if (base_pid && base_rcid) {
    rc = rootCause(base_pid, base_rcid);
    if (!rc) {
      refuse('shape', `RNAwiki has no official root ${base_pid}/${base_rcid} to build this on.`);
    } else if (!rc.route_id) {
      refuse('shape', `Official root ${base_pid}/${base_rcid} has no canonical route_id. Publication fails closed until the route registry is rebuilt.`);
    } else {
      if (resolvedTopicId && resolvedTopicId !== base_pid) {
        refuse('shape', `Topic ${resolvedTopicId} does not match legacy base topic ${base_pid}.`);
      }
      if (resolvedRouteId && resolvedRouteId !== rc.route_id) {
        refuse('shape', `Route ${resolvedRouteId} does not match ${base_pid}/${base_rcid}, which belongs to ${rc.route_id}.`);
      }
      resolvedTopicId = resolvedTopicId || base_pid;
      resolvedRouteId = resolvedRouteId || rc.route_id;
    }
  }

  if (!!resolvedTopicId !== !!resolvedRouteId) {
    refuse('shape', 'A protocol route needs both topic_id and route_id, or neither.');
  } else if (resolvedTopicId && resolvedRouteId) {
    route = canonicalRoute(resolvedTopicId, resolvedRouteId);
    if (!route) {
      refuse('shape', `RNAwiki has no route ${resolvedTopicId}/${resolvedRouteId} to build this on.`);
    } else if (route.branchable !== true) {
      refuse('shape', `Route ${resolvedTopicId}/${resolvedRouteId} is not open for creator branches.`);
    }

    // A route may have no legacy official root at all; that is why routes exist. Where one or more
    // roots do attach, carry every avoid-movement term into R2 rather than choosing root_causes[0].
    if (route) {
      const p = problem(resolvedTopicId);
      const roots = (p.root_causes || []).filter((x) => x.route_id === resolvedRouteId);
      routeRoots = roots;
      if (!rc) {
        if (roots.length === 1) rc = roots[0];
        else if (roots.length > 1) rc = {
          avoid_movements: [...new Set(roots.flatMap((x) => Array.isArray(x.avoid_movements) ? x.avoid_movements : []))],
        };
      }
    }
  }

  // Private drafts may exist before their author decides where they belong. A public medical
  // instruction may not: without a canonical Topic -> Route binding it cannot be discovered,
  // checked against route-specific rules, enrolled exactly, or discussed without context.
  if (publish && (!resolvedTopicId || !resolvedRouteId)) {
    refuse('shape', 'Choose the topic and route this protocol belongs to before publishing it.');
  }

  const execution = validateExecution(spec, !!require_execution, refuse);
  r1(spec.items, !!publish, refuse);
  if (spec.note !== undefined && (typeof spec.note !== 'string' || spec.note.length > 500)) {
    refuse('shape', 'A protocol note is a short string or nothing.');
  }
  // An uncovered route is a legitimate creator opportunity, but it has no inherited movement
  // contraindication record. Until that route receives an explicit movement-safety review, a
  // private draft may hold movements with a visible warning and public publication fails closed.
  const hasMovement = spec.items.some((it) => it && it.k === 'x');
  if (route && !routeRoots.length && hasMovement) {
    const message = 'This route has no reviewed movement-safety record yet. Keep the movement in your private draft or submit the route for safety review before publishing it.';
    if (publish) refuse('contraindicated-move', message);
    else warn('contraindicated-move', 'unknown', message);
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

  const cleanItems = spec.items.map((it) => {
    if (!it || typeof it !== 'object' || Array.isArray(it)) return it;
    const copy = Object.assign({}, it);
    if (Array.isArray(copy.days)) copy.days = copy.days.slice().sort((a, b) => a - b);
    return copy;
  });
  const cleanSpec = { v: 1, items: cleanItems };
  if (typeof spec.note === 'string') cleanSpec.note = spec.note.slice(0, 500);
  if (execution) cleanSpec.execution = execution;
  const guide = executionGuide(resolvedTopicId, resolvedRouteId, cleanSpec, execution);
  return {
    ok: refusals.length === 0,
    refusals,
    warn: warns,
    coverage,
    topic_id: resolvedTopicId,
    route_id: resolvedRouteId,
    base_pid: base_pid || null,
    base_rcid: base_rcid || null,
    spec: cleanSpec,
    guide,
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
  const out = { v: 1, items };
  const note = patch.note !== undefined ? patch.note : base.note;
  const execution = Object.prototype.hasOwnProperty.call(patch, 'execution') ? patch.execution : base.execution;
  if (note !== undefined && note !== null) out.note = note;
  if (execution !== undefined && execution !== null) out.execution = execution;
  return out;
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
  if (JSON.stringify(next.execution) !== JSON.stringify(base.execution)) {
    patch.execution = next.execution === undefined ? null : next.execution;
  }
  ['add', 'drop', 'move'].forEach((k) => { if (!patch[k].length) delete patch[k]; });
  if (!Object.keys(patch.set).length) delete patch.set;
  return patch;
}

module.exports = { RULES, KINDS, OVERRIDE_KEYS, MAX_ITEMS, MAX_DEPTH, init, ready, validate, resolve, apply, diff, snapshotSafety };
