#!/usr/bin/env node
// Focused regression test for the public interaction-coverage contract. This is intentionally
// database-free: it exercises the exact pure validator used by check, save, clone and public read.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ window: {}, console });
for (const name of ['data.js', 'interactions.js', 'exercises.js', 'foods.js']) {
  const file = path.join(ROOT, 'site', name);
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}

const require = createRequire(import.meta.url);
const safety = require(path.join(ROOT, 'studio-safety.js'));
const TEST_FUNCTIONS = [{ id: 'test-counter', target: 10, step: 2 }, { id: 'test-log' }];
safety.init({
  data: context.window.RNAWIKI_DATA,
  interactions: context.window.RNAWIKI_INTERACTIONS,
  exercises: context.window.RNAWIKI_EXERCISES,
  foods: context.window.RNAWIKI_FOODS,
  functions: TEST_FUNCTIONS,
});

const graph = context.window.RNAWIKI_DATA.graph;
const safetyTopic = (graph.problems || []).find((p) => (p.routes || []).some((r) => r.branchable === true));
const safetyRoute = safetyTopic && safetyTopic.routes.find((r) => r.branchable === true);
assert.ok(safetyTopic && safetyRoute, 'the publication tests need one governed route');

const check = (ids, publish = true) => safety.validate({
  spec: { v: 1, items: ids.map((id) => ({ k: 'c', id })) },
  topic_id: safetyTopic.id,
  route_id: safetyRoute.id,
  publish,
});

// ---- THE PUBLICATION BOUNDARY -----------------------------------------------------------------
// Drafts remain useful with any number of compounds: every exact pair is enumerated and every
// warning is visible. Public publication fails closed on an unknown exact pair or a known danger
// row. A warning is not a safety clearance for a reader who never spoke to the creator.

// Caffeine and magnesium are each tagged elsewhere in the corpus, but no authored rule covers
// their exact pairing. This was the production false-green regression; it must stay explicit.
const none = check(['c1', 'c5']);
assert.equal(none.coverage.state, 'none');
assert.deepEqual([none.coverage.checked, none.coverage.of], [0, 1]);
assert.equal(none.coverage.unit, 'pairs');
assert.equal(none.coverage.unknown, 1);
assert.equal(none.ok, false, 'an unknown exact pair must not cross the public boundary');
const noneRefusal = none.refusals.find((x) => x.rule === 'interaction-unknown');
assert.ok(noneRefusal, 'an uncovered public pair must refuse');
assert.equal(noneRefusal.message, 'Not checked: 1 of 1 exact pairing here has no authored rule. Unknown is not safe.');
assert.deepEqual(noneRefusal.row.unknown, [['Caffeine', 'Magnesium']], 'the refusal names the exact uncovered pair');

const noneDraft = check(['c1', 'c5'], false);
assert.equal(noneDraft.ok, true, 'the same pair may stay in a private draft');
assert.ok(noneDraft.warn.some((x) => x.rule === 'interaction-unknown'));
assert.ok(!noneDraft.refusals.some((x) => x.rule === 'interaction-unknown'));

// Three compounds, one authored pair and two unknown ones. The count must be numeric and exact;
// the old path rendered "undefined of 3" because it read a field coverage never created.
const partial = check(['c3', 'c74', 'c0']);
assert.equal(partial.coverage.state, 'partial');
assert.deepEqual([partial.coverage.checked, partial.coverage.of], [1, 3]);
assert.equal(partial.coverage.unknown, 2);
assert.equal(partial.ok, false);
assert.equal(partial.coverage.unknown_pairs.length, 2);
assert.match(partial.refusals.find((x) => x.rule === 'interaction-unknown').message, /^Not checked: 2 of 3 exact pairings/);

// Five compounds remain legal in a draft and all ten exact pairs are still enumerated. Publication
// is refused because eight of those pairs are uncovered, not because the list has five entries.
const many = check(['c0', 'c2', 'c4', 'c5', 'c6']);
assert.equal(many.ok, false);
assert.equal(many.coverage.of, 10, 'every exact pair is still enumerated');
assert.equal(many.coverage.unknown, 8);
const manyDraft = check(['c0', 'c2', 'c4', 'c5', 'c6'], false);
assert.equal(manyDraft.ok, true, 'there is no arbitrary two-compound draft limit');
assert.deepEqual(manyDraft.coverage, many.coverage);

// Magnesium + zinc has an authored timing rule that names both members of the exact pair.
const complete = check(['c5', 'c6']);
assert.equal(complete.coverage.state, 'complete');
assert.deepEqual([complete.coverage.checked, complete.coverage.of], [1, 1]);
assert.equal(complete.ok, true);
assert.ok(complete.warn.some((x) => x.rule === 'interaction'));
const completeSnapshotSafety = safety.snapshotSafety(complete);
assert.ok(completeSnapshotSafety.warn.length, 'the execution snapshot must retain a current warning');
const reorderedSnapshotSafety = safety.snapshotSafety({ warn: complete.warn.slice().reverse() });
assert.deepEqual(reorderedSnapshotSafety, completeSnapshotSafety,
  'warning order alone must not mint a different execution snapshot');
const changedSnapshotSafety = safety.snapshotSafety({ warn: complete.warn.concat({
  rule: 'corpus-update', message: 'New current guidance.', item: 'c5', row: null,
}) });
assert.notDeepEqual(changedSnapshotSafety, completeSnapshotSafety,
  'adding current safety guidance must change the execution snapshot projection');

// Omega-3 + resveratrol both thin the blood, and both are freely available. Complete coverage does
// not turn a documented danger into permission to publish it. The refused row keeps its citation.
const knownDanger = check(['c3', 'c74']);
assert.equal(knownDanger.coverage.state, 'complete');
assert.equal(knownDanger.ok, false, 'a danger interaction must refuse public publication');
const dangerRow = knownDanger.refusals.find((x) => x.rule === 'danger-interaction');
assert.ok(dangerRow, 'a danger interaction must produce a refusal row');
assert.ok(!knownDanger.warn.some((x) => x.rule === 'danger-interaction'));
const knownDangerDraft = check(['c3', 'c74'], false);
assert.equal(knownDangerDraft.ok, true, 'a private draft keeps the cited danger warning');
assert.ok(knownDangerDraft.warn.some((x) => x.rule === 'danger-interaction'));
assert.equal(dangerRow.row.tier, 'danger');
assert.ok((dangerRow.row.involved || []).length >= 2, 'the refused row must name who is involved');
assert.ok(dangerRow.row.src, 'a danger warning must cite a source');
assert.ok(dangerRow.row.plain, 'a danger warning must carry its plain-language line');

const single = check(['c0']);
assert.equal(single.coverage.state, 'not_applicable');
assert.equal(single.coverage.of, 0);
assert.equal(single.coverage.compound_of, 1);
assert.equal(single.ok, true);
assert.match(single.safety.says, /no pairing to check/i);
assert.equal(single.guide.contract, 'legacy-v1', 'an existing published row without the new execution object stays readable');

// New publication has a deliberately tiny execution contract: the creator's ordered list names
// one first action, and every item carries explicit weekdays. Fit, check-in and stop copy remain
// governed corpus fields; no creator-written health claim is admitted through execution metadata.
const strictBase = {
  spec: {
    v: 1,
    items: [{ k: 'c', id: 'c0', days: [0, 1, 2, 3, 4, 5, 6] }],
    execution: { v: 1, primary: 'c:c0' },
  },
  topic_id: safetyTopic.id,
  route_id: safetyRoute.id,
  publish: true,
  require_execution: true,
};
const strict = safety.validate(strictBase);
assert.equal(strict.ok, true, 'a complete executable branch may publish');
assert.deepEqual(strict.spec.execution, { v: 1, primary: 'c:c0' });
assert.deepEqual(strict.spec.items[0].days, [0, 1, 2, 3, 4, 5, 6]);
assert.equal(strict.guide.contract, 'execution-v1');
assert.equal(strict.guide.primary, 'c:c0');
assert.ok(strict.guide.fit.summary, 'the canonical route supplies fit guidance');
assert.ok(strict.guide.check_in.metric && strict.guide.check_in.checkpoint, 'the canonical topic supplies a check-in and review point');
assert.ok(strict.guide.stop.issue && strict.guide.stop.horizon && strict.guide.stop.action && strict.guide.stop.red_flags,
  'the canonical topic supplies stop and red-flag guidance');
assert.equal(strict.guide.stop.issue, 'Any warning sign below appears',
  'a creator route must use the shared care boundary, not a different route\'s troubleshooting issue');
assert.doesNotMatch(strict.guide.stop.red_flags, /[*_`#]/,
  'governed safety copy crosses the JSON boundary as plain text, not visible markdown punctuation');

const strictBare = safety.validate({ ...strictBase, spec: { v: 1, items: strictBase.spec.items } });
assert.equal(strictBare.ok, false, 'a new public catalog list without an execution contract must refuse');
assert.ok(strictBare.refusals.some((x) => x.rule === 'shape' && /first action/i.test(x.message)));

const strictImplicitDays = safety.validate({
  ...strictBase,
  spec: { v: 1, items: [{ k: 'c', id: 'c0' }], execution: { v: 1, primary: 'c:c0' } },
});
assert.equal(strictImplicitDays.ok, false, 'new publication may not hide an every-day default in absence');
assert.ok(strictImplicitDays.refusals.some((x) => x.rule === 'shape' && /days for every item/i.test(x.message)));

const strictForeignPrimary = safety.validate({
  ...strictBase,
  spec: { ...strictBase.spec, execution: { v: 1, primary: 'c:not-here' } },
});
assert.equal(strictForeignPrimary.ok, false);
assert.ok(strictForeignPrimary.refusals.some((x) => x.rule === 'shape' && /first action must be one item/i.test(x.message)));

const strictCreatorCopy = safety.validate({
  ...strictBase,
  spec: { ...strictBase.spec, execution: { v: 1, primary: 'c:c0', approach: 'Guaranteed cure.' } },
});
assert.equal(strictCreatorCopy.ok, false, 'execution metadata may not smuggle creator health copy into public output');

const remixedExecution = {
  v: 1,
  items: [
    { k: 'c', id: 'c5', days: [1, 3, 5] },
    { k: 'c', id: 'c0', days: [0, 1, 2, 3, 4, 5, 6] },
  ],
  execution: { v: 1, primary: 'c:c5' },
};
assert.deepEqual(safety.apply(strictBase.spec, safety.diff(strictBase.spec, remixedExecution)), remixedExecution,
  'a remix patch must preserve the changed primary action and explicit schedule');

// Short free text is not reviewed merely because it fits a character limit. It remains useful in
// a private draft, but cannot cross the public boundary until an approval workflow exists.
const noteSpec = { v: 1, items: [{ k: 'c', id: 'c0', note: 'This cures everything.' }], note: 'Guaranteed result.' };
const noteDraft = safety.validate({ spec: noteSpec, base_pid: null, base_rcid: null, publish: false });
assert.equal(noteDraft.ok, true);
assert.ok(noteDraft.warn.some((x) => x.rule === 'unreviewed-creator-copy'));
const notePublic = safety.validate({ spec: noteSpec, base_pid: null, base_rcid: null, publish: true });
assert.equal(notePublic.ok, false);
assert.ok(notePublic.refusals.some((x) => x.rule === 'unreviewed-creator-copy'));

// A private draft may be unbound while its author is still deciding where it belongs. Publication
// may not create a context-free "Custom" health instruction that Start cannot enroll exactly.
const unboundDraft = safety.validate({ spec: { v: 1, items: [{ k: 'c', id: 'c0' }] }, publish: false });
assert.equal(unboundDraft.ok, true);
const unboundPublic = safety.validate({ spec: { v: 1, items: [{ k: 'c', id: 'c0' }] }, publish: true });
assert.equal(unboundPublic.ok, false);
assert.ok(unboundPublic.refusals.some((x) => x.rule === 'shape' && /topic and route/i.test(x.message)));

// R4 IS UNMOVED. A public protocol may still not instruct anyone to take a prescription-only,
// controlled or unapproved substance — CLAUDE.md: "Do not add an override button around a refusal."
const restricted = (() => {
  const rx = context.window.RNAWIKI_DATA.compounds.find((c) => ['prescription', 'controlled', 'unapproved'].includes(c.regulatory_class));
  return rx ? check([rx.id]) : null;
})();
assert.ok(restricted, 'the corpus must still hold a restricted compound for this assertion to mean anything');
assert.equal(restricted.ok, false, 'a restricted substance must still refuse to publish');
assert.ok(restricted.refusals.some((x) => x.rule === 'restricted-substance'));

// ---- TOPIC → ROUTE: THE CANONICAL CREATOR BASE ------------------------------------------------
// There are 224 authored reasons but only 52 old official roots. Every reason must now be a stable,
// independently bindable route. The five official roots that deliberately match no reason are
// explicit umbrella routes; none may fall through to reason #1.
assert.equal(graph.route_registry_version, 1);
const problems = graph.problems || [];
const routes = problems.flatMap((p) => (p.routes || []).map((r) => ({ p, r })));
const authoredRoutes = routes.filter(({ r }) => r.source === 'authored_reason');
const legacyRoutes = routes.filter(({ r }) => r.source === 'legacy_official_root');
assert.equal(authoredRoutes.length, 224, 'all 224 authored reasons must be canonical routes');
assert.equal(legacyRoutes.length, 5, 'all five unmapped official roots must be explicit umbrella routes');
assert.equal(routes.length, 229);
for (const p of problems) {
  assert.ok(p.safety && p.safety.metric && p.safety.checkpoint && p.safety.stopIssue && p.safety.stopHorizon && p.safety.stopFix,
    `${p.id} must supply the check-in and stop guidance every creator branch derives`);
  assert.ok(p.plan && p.plan.reassess, `${p.id} must supply the red-flag guidance every creator branch derives`);
  for (const r of p.routes || []) assert.ok(r.fit && r.fit.symptoms, `${p.id}/${r.id} must supply route fit guidance`);
}
assert.equal(new Set(routes.map(({ r }) => r.id)).size, routes.length, 'route ids must be globally unique');

const bound = (pid, rcid) => safety.validate({
  spec: { v: 1, items: [{ k: 'c', id: 'c0' }] }, base_pid: pid, base_rcid: rcid, publish: true,
});
const routeBound = (pid, rid, extra = {}) => safety.validate({
  spec: { v: 1, items: [{ k: 'c', id: 'c0' }] }, topic_id: pid, route_id: rid, publish: true, ...extra,
});

let boundRoutes = 0;
let boundRoots = 0;
for (const p of problems) {
  const expectedKind = p.kind === 'want' ? 'starting_point' : 'possible_cause';
  const authored = (p.routes || []).filter((r) => r.source === 'authored_reason');
  assert.equal(authored.length, (p.why?.causes || []).length, `${p.id} must expose every authored reason`);

  for (const cause of p.why?.causes || []) {
    assert.ok(cause.route_id, `${p.id}/${cause.name} must carry route_id`);
    assert.equal(cause.route_kind, expectedKind);
    const r = (p.routes || []).find((x) => x.id === cause.route_id);
    assert.ok(r, `${p.id}/${cause.name} route_id must resolve in p.routes`);
    assert.equal(r.cause_key, cause.name);
  }

  for (const r of p.routes || []) {
    assert.equal(r.branchable, true, `${p.id}/${r.id} must explicitly be open for a creator branch`);
    assert.ok(r.id.startsWith(`${p.id}--`));
    assert.ok(r.route_kind === expectedKind || r.route_kind === 'umbrella');
    const v = routeBound(p.id, r.id);
    assert.ok(!v.refusals.some((x) => x.rule === 'shape'), `${p.id}/${r.id} must be a bindable route`);
    assert.equal(v.topic_id, p.id);
    assert.equal(v.route_id, r.id);
    boundRoutes++;
  }

  for (const rc of p.root_causes || []) {
    assert.ok(rc.route_id, `${p.id}/${rc.id} must carry route_id`);
    const r = (p.routes || []).find((x) => x.id === rc.route_id);
    assert.ok(r, `${p.id}/${rc.id} route_id must resolve in p.routes`);
    assert.ok(r.official_rcids.includes(rc.id), `${p.id}/${rc.id} must be attached back to its route`);
    const v = bound(p.id, rc.id);
    assert.ok(!v.refusals.some((x) => x.rule === 'shape'), `${p.id}/${rc.id} legacy base must resolve through its canonical route`);
    assert.equal(v.topic_id, p.id);
    assert.equal(v.route_id, rc.route_id);
    assert.equal(v.base_pid, p.id);
    assert.equal(v.base_rcid, rc.id);
    boundRoots++;
  }
}
assert.equal(boundRoutes, 229);
assert.equal(boundRoots, 52);
assert.equal(routes.reduce((n, { r }) => n + r.official_rcids.length, 0), 52);
assert.equal(legacyRoutes.reduce((n, { r }) => n + r.official_rcids.length, 0), 5);
assert.ok(legacyRoutes.every(({ r }) => r.route_kind === 'umbrella' && r.fit.limits), 'legacy umbrellas must state why they do not map to one reason');

// Unknown, crossed and half-specified provenance refuses instead of degrading to a custom plan.
const sample = problems.find((p) => (p.routes || []).length > 1);
const foreign = routeBound(sample.id, 'not-a-real-route');
assert.equal(foreign.ok, false);
assert.ok(foreign.refusals.some((x) => x.rule === 'shape'));
const otherProblem = problems.find((p) => p.id !== sample.id && (p.routes || []).length);
const crossed = routeBound(sample.id, otherProblem.routes[0].id);
assert.equal(crossed.ok, false, 'a real route borrowed from a different topic must refuse');
const halfRoute = safety.validate({ spec: { v: 1, items: [{ k: 'c', id: 'c0' }] }, topic_id: sample.id, publish: true });
assert.equal(halfRoute.ok, false);
assert.ok(halfRoute.refusals.some((x) => x.rule === 'shape'));
const halfLegacy = safety.validate({ spec: { v: 1, items: [{ k: 'c', id: 'c0' }] }, base_pid: sample.id, publish: true });
assert.equal(halfLegacy.ok, false);

const rootedRoute = routes.find(({ r }) => r.official_rcids.length);
const rootedRc = rootedRoute.p.root_causes.find((rc) => rc.id === rootedRoute.r.official_rcids[0]);
const consistent = routeBound(rootedRoute.p.id, rootedRoute.r.id, { base_pid: rootedRoute.p.id, base_rcid: rootedRc.id });
assert.equal(consistent.ok, true, 'matching new and legacy provenance may travel together during migration');
const otherRouteSameTopic = rootedRoute.p.routes.find((r) => r.id !== rootedRoute.r.id);
assert.ok(otherRouteSameTopic, 'the provenance mismatch test needs another route under the same topic');
const mismatched = routeBound(rootedRoute.p.id, otherRouteSameTopic.id,
  { base_pid: rootedRoute.p.id, base_rcid: rootedRc.id });
assert.equal(mismatched.ok, false, 'new and legacy provenance may not disagree');

// Wire-level contract: the pure rule is useful only if every new publication boundary invokes it,
// while public reads deliberately omit the strict-new flag so immutable legacy links survive.
const serverSource = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const appSource = fs.readFileSync(path.join(ROOT, 'site', 'app.js'), 'utf8');
assert.match(serverSource, /protocols'\s*&&\s*seg\[1\]\s*===\s*'check'[\s\S]*?require_execution:\s*b\.status\s*===\s*'published'/,
  'the database-free publish check must require execution-v1');
assert.ok((serverSource.match(/require_execution:\s*publish/g) || []).length >= 2,
  'root publication and remix publication must both require execution-v1');
assert.match(serverSource, /function studioExecutionSnapshot\(checked\)[\s\S]*?JSON\.stringify\(\{\s*spec:\s*checked\.spec,\s*guide:\s*checked\.guide,\s*safety\s*\}\)/,
  'the immutable enrollment hash must cover normalized steps, derived guidance and current warnings');
assert.match(serverSource, /const currentSnapshot\s*=\s*studioExecutionSnapshot\(current\)[\s\S]*?b\.snapshot_hash\s*!==\s*currentSnapshot\.hash/,
  'Start must refuse a stale expected execution-and-safety hash before it records a start');
assert.match(serverSource, /snapshot_safety:\s*executionSnapshot\.safety,\s*legacy_snapshot_hash:\s*executionSnapshot\.legacyHash/,
  'the public reader must return both canonical current warnings and a migration witness for old enrollments');
assert.match(serverSource, /spec:\s*v\.spec,\s*guide:\s*v\.guide/,
  'the public JSON reader must return normalized execution and its governed guide');
assert.match(serverSource, /publicStudioGuide\(checked\.guide,\s*items\)/,
  'the no-JavaScript public protocol must show governed execution guidance');
assert.match(appSource, /function stPublishSpec\(\)[\s\S]*?execution:\s*\{\s*v:\s*1,\s*primary:/,
  'Studio must build the small execution object from the ordered editor the creator already uses');
assert.match(appSource, /const publishSpec\s*=\s*stPublishSpec\(\)[\s\S]*?checkProtocol\(publishSpec,[\s\S]*?spec:\s*publishSpec/,
  'both the preflight and the final save must use the same normalized publication spec');
assert.match(appSource, /executionGuideHtml\(d\.guide,\s*primaryView,\s*true\)/,
  'the hydrated public protocol must show the governed guide');
assert.match(appSource, /executionGuideHtml\(enrollment\.guide,[\s\S]*?false\)/,
  'Today must retain and show the exact guide captured at Start');
assert.match(appSource, /cloned\.snapshot_hash\s*!==\s*d\.snapshot_hash/,
  'Start must refuse a source whose normalized plan, governed guide or current warnings changed while the page was open');
assert.match(appSource, /cloneProtocol\(code,\s*d\.snapshot_hash\)/,
  'the client must send the hash it read so the server can reject drift before counting the start');
assert.match(appSource, /enrollment\.snapshot_hash\s*===\s*live\.snapshot_hash/,
  'Today must compare a current-contract enrollment with its live execution-and-safety address');
assert.match(appSource, /enrollment\.snapshot_hash\s*===\s*live\.legacy_snapshot_hash/,
  'Today must migrate old spec-and-guide enrollment addresses without treating every old start as changed');
assert.match(appSource, /const newWarnings[\s\S]*?Current safety guidance[\s\S]*?newWarnings\.map\(\(warning\)\s*=>\s*stFlagCard/,
  'Today must render a warning added after Start and leave execution paused');

// Routes with no official protocol have no inherited avoid-movement record. They remain open for
// food/compound/tool branches, but a movement stays private until that route is reviewed.
const uncovered = routes.find(({ r }) => r.source === 'authored_reason' && r.official_rcids.length === 0);
const movementId = context.window.RNAWIKI_EXERCISES.exercises[0] && context.window.RNAWIKI_EXERCISES.exercises[0].id;
assert.ok(uncovered && movementId, 'the movement-safety test needs an uncovered route and an exercise');
const uncoveredMovementSpec = { v: 1, items: [{ k: 'x', id: movementId }] };
const uncoveredMovementPublic = safety.validate({ spec: uncoveredMovementSpec, topic_id: uncovered.p.id, route_id: uncovered.r.id, publish: true });
assert.equal(uncoveredMovementPublic.ok, false);
assert.ok(uncoveredMovementPublic.refusals.some((x) => x.rule === 'contraindicated-move' && /no reviewed movement-safety record/i.test(x.message)));
const uncoveredMovementDraft = safety.validate({ spec: uncoveredMovementSpec, topic_id: uncovered.p.id, route_id: uncovered.r.id, publish: false });
assert.equal(uncoveredMovementDraft.ok, true);
assert.ok(uncoveredMovementDraft.warn.some((x) => x.rule === 'contraindicated-move'));

// The UI constrains these controls, but the server must reject a caller that bypasses the UI.
// Negative sets, object-valued reps and impossible tool targets may never become public steps.
const rootedForOverrides = routes.find(({ r }) => r.official_rcids.length > 0);
const missingVolumeSpec = { v: 1, items: [{ k: 'x', id: movementId }] };
const missingVolumeDraft = safety.validate({ spec: missingVolumeSpec, topic_id: rootedForOverrides.p.id, route_id: rootedForOverrides.r.id, publish: false });
assert.ok(!missingVolumeDraft.refusals.some((x) => x.rule === 'unknown-entity'), 'a private draft may leave movement volume undecided');
const missingVolumePublic = safety.validate({ spec: missingVolumeSpec, topic_id: rootedForOverrides.p.id, route_id: rootedForOverrides.r.id, publish: true });
assert.equal(missingVolumePublic.ok, false, 'a public movement may not rely on an invented 3 × 10');
assert.ok(missingVolumePublic.refusals.some((x) => x.rule === 'unknown-entity' && /sets and reps/i.test(x.message)),
  'public movement without explicit sets/reps needs a volume refusal');
const badOverrides = [
  { k: 'x', id: movementId, sets: -999 },
  { k: 'x', id: movementId, reps: { html: 'nonsense' } },
  { k: 'fn', id: 'test-counter', target: -1e99 },
  { k: 'fn', id: 'test-counter', target: 7 },
  { k: 'fn', id: 'test-log', target: 1 },
];
for (const item of badOverrides) {
  const v = safety.validate({ spec: { v: 1, items: [item] }, topic_id: rootedForOverrides.p.id, route_id: rootedForOverrides.r.id, publish: true });
  assert.equal(v.ok, false, `invalid override must refuse: ${JSON.stringify(item)}`);
  assert.ok(v.refusals.some((x) => x.rule === 'unknown-entity'), `invalid override needs an entity-shape refusal: ${JSON.stringify(item)}`);
}
const validOverrides = safety.validate({
  spec: { v: 1, items: [{ k: 'x', id: movementId, sets: 3, reps: 10 }, { k: 'fn', id: 'test-counter', target: 8 }] },
  topic_id: rootedForOverrides.p.id, route_id: rootedForOverrides.r.id, publish: true,
});
assert.ok(!validOverrides.refusals.some((x) => x.rule === 'unknown-entity'), 'valid UI-range overrides must remain accepted');

console.log('[studio-safety] publication boundary OK — exact unknown counts, unknown/danger public refusals, unlimited private draft compounds, restricted substances still refused');
console.log('[studio-safety] canonical routes OK — %d topics, %d authored reasons + %d legacy umbrellas, %d official roots attached; unknown/crossed/partial provenance refused',
  problems.length, authoredRoutes.length, legacyRoutes.length, boundRoots);
