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
safety.init({
  data: context.window.RNAWIKI_DATA,
  interactions: context.window.RNAWIKI_INTERACTIONS,
  exercises: context.window.RNAWIKI_EXERCISES,
  foods: context.window.RNAWIKI_FOODS,
  functionIds: [],
});

const check = (ids, publish = true) => safety.validate({
  spec: { v: 1, items: ids.map((id) => ({ k: 'c', id })) },
  base_pid: null,
  base_rcid: null,
  publish,
});

// ---- THE OVERLAP-REPERCUSSION CONTRACT (rewritten 2026-08-13) --------------------------------
// This block used to assert that a multi-compound protocol REFUSES to publish. On the founder's
// instruction that refusal is gone: a creator may add as many compounds as they want, and what
// used to block the publish now travels with it as a warning the reader cannot dismiss.
// What is still asserted, and matters more than it did before:
//   · an uncovered pair is reported as UNCHECKED, never as safe (the fail-safe clause)
//   · a danger pair still produces a danger-tier row, still names its members, and now carries a
//     citation, because the warning is the only thing left between it and a reader
//   · R4 still hard-refuses restricted substances — that refusal did NOT move

// Caffeine and magnesium are each tagged elsewhere in the corpus, but no authored rule covers
// their exact pairing. This was the production false-green regression; it must stay explicit.
const none = check(['c1', 'c5']);
assert.equal(none.coverage.state, 'none');
assert.deepEqual([none.coverage.checked, none.coverage.of], [0, 1]);
assert.equal(none.coverage.unit, 'pairs');
assert.equal(none.ok, true, 'a two-compound protocol publishes now');
assert.ok(none.warn.some((x) => x.rule === 'interaction-unknown'), 'an uncovered pair must warn');
assert.ok(!none.refusals.some((x) => x.rule === 'interaction-unknown'), 'and must not refuse');
assert.match(none.warn.find((x) => x.rule === 'interaction-unknown').message, /not the same as safe/i);

// Three compounds, one authored pair and two unknown ones. Publishes, and says which are unknown.
const partial = check(['c3', 'c74', 'c0']);
assert.equal(partial.coverage.state, 'partial');
assert.deepEqual([partial.coverage.checked, partial.coverage.of], [1, 3]);
assert.equal(partial.ok, true);
assert.equal(partial.coverage.unknown_pairs.length, 2);

// MORE THAN TWO COMPOUNDS IS THE WHOLE POINT OF THE CHANGE. Five publishes.
// Every id here is a freely available supplement: mixing a controlled one in would make this an
// assertion about R4 rather than about the compound limit, which is how the first draft failed.
const many = check(['c0', 'c2', 'c4', 'c5', 'c6']);
assert.equal(many.ok, true, 'a five-compound protocol must publish');
assert.equal(many.coverage.of, 10, 'every exact pair is still enumerated');

// Magnesium + zinc has an authored timing rule that names both members of the exact pair.
const complete = check(['c5', 'c6']);
assert.equal(complete.coverage.state, 'complete');
assert.deepEqual([complete.coverage.checked, complete.coverage.of], [1, 1]);
assert.equal(complete.ok, true);
assert.ok(complete.warn.some((x) => x.rule === 'interaction'));

// Omega-3 + resveratrol both thin the blood, and both are freely available — so this is the pair
// that actually exercises the new contract. It PUBLISHES now, and the warning it publishes with has
// to carry everything a reader needs to judge it, including where the claim comes from.
const knownDanger = check(['c3', 'c74']);
assert.equal(knownDanger.coverage.state, 'complete');
assert.equal(knownDanger.ok, true, 'a danger interaction no longer refuses the publish');
const dangerRow = knownDanger.warn.find((x) => x.rule === 'danger-interaction');
assert.ok(dangerRow, 'a danger interaction must still produce a danger row');
assert.equal(dangerRow.tier, 'danger');
assert.ok((dangerRow.row.involved || []).length >= 2, 'the row must name who is involved');
assert.ok(dangerRow.row.src, 'a danger warning must cite a source');
assert.ok(dangerRow.row.plain, 'a danger warning must carry its plain-language line');

const single = check(['c0']);
assert.equal(single.coverage.state, 'not_applicable');
assert.equal(single.coverage.of, 0);
assert.equal(single.coverage.compound_of, 1);
assert.equal(single.ok, true);
assert.match(single.safety.says, /no pairing to check/i);

// Short free text is not reviewed merely because it fits a character limit. It remains useful in
// a private draft, but cannot cross the public boundary until an approval workflow exists.
const noteSpec = { v: 1, items: [{ k: 'c', id: 'c0', note: 'This cures everything.' }], note: 'Guaranteed result.' };
const noteDraft = safety.validate({ spec: noteSpec, base_pid: null, base_rcid: null, publish: false });
assert.equal(noteDraft.ok, true);
assert.ok(noteDraft.warn.some((x) => x.rule === 'unreviewed-creator-copy'));
const notePublic = safety.validate({ spec: noteSpec, base_pid: null, base_rcid: null, publish: true });
assert.equal(notePublic.ok, false);
assert.ok(notePublic.refusals.some((x) => x.rule === 'unreviewed-creator-copy'));

// R4 IS UNMOVED. A public protocol may still not instruct anyone to take a prescription-only,
// controlled or unapproved substance — CLAUDE.md: "Do not add an override button around a refusal."
const restricted = (() => {
  const rx = context.window.RNAWIKI_DATA.compounds.find((c) => ['prescription', 'controlled', 'unapproved'].includes(c.regulatory_class));
  return rx ? check([rx.id]) : null;
})();
assert.ok(restricted, 'the corpus must still hold a restricted compound for this assertion to mean anything');
assert.equal(restricted.ok, false, 'a restricted substance must still refuse to publish');
assert.ok(restricted.refusals.some((x) => x.rule === 'restricted-substance'));

console.log('[studio-safety] overlap-repercussion contract OK — multi-compound publishes, unknown pairs warn, danger warns with a citation, restricted still refuses');
