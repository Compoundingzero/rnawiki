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

// Caffeine and magnesium are each tagged elsewhere in the corpus, but no authored rule covers
// their exact pairing. This was the production false-green regression.
const none = check(['c1', 'c5']);
assert.equal(none.coverage.state, 'none');
assert.deepEqual([none.coverage.checked, none.coverage.of], [0, 1]);
assert.equal(none.coverage.unit, 'pairs');
assert.equal(none.ok, false);
assert.ok(none.refusals.some((x) => x.rule === 'interaction-coverage'));
assert.match(none.safety.says, /unknown, not safe/i);

// Caffeine + ephedrine has an authored danger rule; the two pairs involving creatine do not.
const partial = check(['c1', 'c25', 'c0']);
assert.equal(partial.coverage.state, 'partial');
assert.deepEqual([partial.coverage.checked, partial.coverage.of], [1, 3]);
assert.equal(partial.ok, false);
assert.ok(partial.refusals.some((x) => x.rule === 'interaction-coverage'));
assert.match(partial.safety.says, /incomplete/i);

// Private drafts remain editable, but they carry the same explicit unknown state.
const partialDraft = check(['c1', 'c25', 'c0'], false);
assert.equal(partialDraft.ok, true);
assert.equal(partialDraft.coverage.state, 'partial');
assert.match(partialDraft.safety.says, /unknown, not safe/i);

// Magnesium + zinc has an authored timing rule that names both members of the exact pair.
const complete = check(['c5', 'c6']);
assert.equal(complete.coverage.state, 'complete');
assert.deepEqual([complete.coverage.checked, complete.coverage.of], [1, 1]);
assert.equal(complete.ok, true);
assert.ok(!complete.refusals.some((x) => x.rule === 'interaction-coverage'));
assert.ok(complete.warn.some((x) => x.rule === 'interaction'));

const knownDanger = check(['c1', 'c25']);
assert.equal(knownDanger.coverage.state, 'complete');
assert.deepEqual([knownDanger.coverage.checked, knownDanger.coverage.of], [1, 1]);
assert.equal(knownDanger.ok, false);
assert.ok(knownDanger.refusals.some((x) => x.rule === 'danger-interaction'));

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

console.log('[studio-safety] coverage states and public fail-closed rules OK');
