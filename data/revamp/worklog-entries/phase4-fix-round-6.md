### Phase 4 — fix round 6, the two rules of §16

`docs/specs/phase4-generators.md` §16 items 1 and 2, from the lead's reading of measure v10. Both
are generator changes; no page was edited.

**Commands, in the order they were run.**

```
.venv-corpus/bin/python scripts/revamp/interactions_build.py --run-date 2026-09-06
.venv-corpus/bin/python scripts/revamp/page_blocks.py
npx tsx scripts/revamp/page_text_v5.ts --out data/revamp/render-v11
npx tsx scripts/revamp/page_text_v5.ts --with-furniture --out data/revamp/render-v11
rm -rf data/revamp/render-v10
.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py -q
npx vitest run tests/unit/corpus-suppression-block.test.ts tests/unit/corpus-render-safety.test.ts \
    tests/unit/hubs-render.test.ts tests/unit/corpus-document.test.ts \
    tests/unit/corpus-20k/page-text.test.ts
npm run typecheck ; npm run lint ; npm run test:unit
rm -rf .next/cache ; npm run gate
.venv-corpus/bin/python scripts/revamp/self_audit.py --base-url http://127.0.0.1:PORT \
    --out data/revamp/self-audit-round6.json
```

---

#### 1. The supervision block is never truncated (§16 item 1)

`buildBlockBody` ended with `.slice(0, 2)` — the two-paragraph discipline every question answer is
held to — and the supervision block was held to it as well, so the third and later clauses were
dropped before the page was written. Glofitamab, whose record carries S1, S3, S4 and S6, stated
neither its hazardous-medicine class nor its boxed warning.

The cap is a rule about an answer that develops. The supervision answer enumerates: one clause per
class the suppression pass recorded, each a separate recorded fact with its own evidence and its own
source, in the order S1–S9 that `supervisionClauses` already returns them in. It is now painted as a
list, one clause per item, and it is not capped.

- `scripts/corpus-20k/render/page-text.ts`: `BlockBody` gains `list[]`, parallel to `paragraphs[]`;
  the supervision builder pushes each clause through a new `item()` that marks it a list item; the
  final `.slice(0, 2)` applies to every block whose `q.block` is not `supervision`. The render and
  the page apply the same rule because both call this one function.
- `lib/corpus/dossier-page.ts`: `CorpusParagraph` gains `listItem?: true`, carried beside the
  furniture flag through the dose filter. A list item is never marked "Interpretation": a
  supervision clause names the register that stated its class inside its own sentence, so labelling
  the second, third and fourth clause of an enumeration an interpretation would call a citation an
  inference.
- `components/dossier/corpus/QuestionBlock.tsx`: a run of list items paints as one
  `<ul class="cd-clauses">` of `<li class="cd-clause">`, everything else as a paragraph, in the
  builder's own order — so a block that paints clauses and then this record's study scope paints the
  list and then the paragraph, and the render writes the same lines in the same order.
- `lib/corpus/suppression-classes.ts`: the stub path (`supervisionBlock`, for a record below the
  stub floor with no question rows) marks its paragraphs the same way, so both paths paint one
  shape.
- `lib/corpus/dossier.css`: `.cd-clauses` / `.cd-clause`, marker inside the measure.
- `docs/specs/dossier-template.md` records the one exception to "exactly two paragraphs".

**Scope, over `data/revamp/render-v11`.** 1,763 pages paint a supervision answer, unchanged. The
clauses they paint: **1,195 pages one, 379 two, 131 three, 52 four, 6 five**. Under the cap the
same 1,763 pages painted one or two and nothing else (v10: 1,195 and 568), so **189 pages** now
state a third clause and **58** a fourth or fifth. Glofitamab (`K1:06P3KLK2J8`) states its ATC class
carrying the hazardous-medicine source, its embryo-fetal risk and its boxed warning, where it used
to state the first two.

**Tests.** `tests/test_render_safety.py::test_the_supervision_block_paints_every_recorded_class_clause`
reads the render and fails unless some page paints four class clauses — under the cap the maximum
any page could paint was two, so the rule cannot pass on a render the cap produced.
`tests/unit/corpus-suppression-block.test.ts` adds three cases: the stub path paints four `<li>`
clauses in S1–S9 order; `buildBlockBody` returns four paragraphs for four classes and five for five,
all marked list items; and every other block is still capped at two.

---

#### 2. Disabled interaction rules publish nothing (§16 item 2)

`data/revamp/interaction-validation.json` disables three rules and
`docs/specs/interaction-rules.md` §7 states them with their reasons:
**C2-shared-target-same-direction** (43,068 predicted pairs, not one adjudicated or documented by
any label), **C3-additive-hepatotoxic** (six pairs, none adjudicated) and
**C3-additive-nephrotoxic** (no member term in the cleared vocabularies, so it fires on nothing).
The published parquet was originally written by passing `--disable` twice on the command line, and a
later re-run without those flags published the rows again: the parquet on disk carried **92,476** C2
rows and **12** hepatotoxic rows, and they reached `page_interactions` and the rendered pages.

- `scripts/revamp/interactions_build.py` now reads the disabled list from the measurement's own
  output (`disabled_rules()`), unions it with anything `--disable` adds, and writes
  `interactions.parquet` through `write_published`, which **refuses the file** if any row carries a
  disabled rule id and names the rule and the count. `--disable` can add to the list and can never
  take anything off it. `interactions-all-rules.parquet` still carries every rule, because that is
  the table `validate_interactions.py` measures.
- The direction trace of a rule that reads an action word off two stored rows names the **field path
  of each action row and the record it sits on** —
  `action pair: fields.target.value.mergedTargets[].evidence[].pharmacology on K1:… (Agonist) x
  fields.target.value.mergedTargets[].evidence[].pharmacology on K1:… (Agonist), both read as
  activate` — instead of stating the reading as a sentence ("action words Inhibitor and Inhibitor
  both read as inhibit"), which names no record and cannot be executed. That sentence is what failed
  check (a) 16 and 32 times in draws 8 and 9.
- `scripts/revamp/slop_draw.py` gains the `action pair` class in `resolve_trace`. It executes the
  claim: the side of the pair that is this page must reach a recorded value on this page's own
  stored record, the other side must be a page the corpus holds, and both action words must be
  present.

**The rebuild.** `interactions-all-rules.parquet` **630,620** rows; `interactions.parquet`
**538,132** — **92,488 rows refused** (C2 92,476, hepatotoxic 12, nephrotoxic 0). Zero C2 rows are
published. Tier C falls to **177,611** rows on **770** pages, which is the reduction from 3,650
pages to 772 that `docs/specs/interaction-rules.md` §7 predicted when it recorded the disable.
`build-summary.json` records `disabled_rules` as all three.

`page_blocks.py` re-joined the bundles from the published parquet: **3,543** pages carry an
interaction row, **25,289** carry only the checked-sources statement, **0** carry no checked-sources
statement at all — the pages C2 used to reach keep the statement of what was checked and when, as
§7 requires.

**Tests.** `tests/test_render_safety.py::test_no_published_interaction_row_carries_a_disabled_rule_id`
reads every interaction line of every page bundle and fails on a disabled rule id;
`test_a_shared_target_direction_trace_names_its_two_action_rows` runs `resolve_trace` over the new
trace shape and over two negative probes (a counterpart the corpus does not hold, an action row the
record does not carry).

---

#### The re-render

`data/revamp/render-v11/{text,text-with-furniture,provenance}`, **28,657 pages**. Furniture-free
**9,230,774** words (v10: 10,307,613); with furniture **13,157,611** (v10: 14,173,186).
**1,087,950** provenance entries, **0** without a trace (v10: 1,191,686). The fall is the 92,488
refused interaction rows leaving the pages they were on; the supervision change adds words on 189
pages. `data/revamp/render-v10` was deleted after v11 was written: one render revision is kept.

**Common lines and page length** (`common-line-share-v11.json`). Furniture-free: **7** lines carried
by more than half of the 28,657 pages, **6.9660 %** of the corpus's words, median page **122** words
(v10: 7 lines, 6.2382 %, 129). With furniture: **20** lines, **32.3508 %**, median **273** (v10: 20,
29.7548 %, 278). The share rises because the denominator falls: the same seven lines over a corpus
with a million fewer words.

---

#### Three readers of the page that had to learn the new element

The clauses moved from `<p class="cd-paragraph">` to `<li class="cd-clause">`, and three checks
read the page by selector rather than by text. Each was corrected to read the element the page now
paints; none of the rules they enforce changed.

- **`scripts/revamp/self_audit.py`** read `section[data-block="supervision"] p.cd-paragraph`, which
  after the change matched only the block's study-scope paragraph. The rule "every supervision
  clause carries its own source" then read that paragraph as the block's one clause and failed on
  five pages. It now reads `li.cd-clause` and `p.cd-paragraph` together, in document order — the
  clauses first, the scope sentence last, which is the order the rules already assumed — and the
  question-block rules read `li.cd-clause` beside the paragraphs so a clause is still checked for a
  register application row and a storage key.
- **`scripts/corpus-20k/gate2/browser-checks.ts`** measured contrast over `p.cd-paragraph`,
  `h1.cd-title` and `h2.cd-question`; `li.cd-clause` joins them, so the supervision block's body is
  not a block of body text left unmeasured.
- **`scripts/revamp/dom_parity.py`** needed nothing: it compares `main.innerText`, and a list item
  is a line there like any other.

**The self-audit** (`data/revamp/self-audit-round6.json`): **30/30 pages, 10/10 hubs, 15 rules,
3,382 rule applications, 0 failures**.

#### Migrations, tests and the gate

The schema did not change: this round adds no migration. Migrations **0000–0033** were replayed
from empty on the disposable database (34 rows in `__drizzle_migrations`), which is where the
measurement build was loaded.

- `.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py`:
  **51 passed** (48 at measure v10; the three new cases are this round's). No skip: the parity rule
  reads `data/revamp/render-v11/dom-parity.json`, written this round by `dom_parity.py` over 200
  pages of the v11 build — **0 painted lines missing from the render, 0 render lines missing from
  the page, 0 out of order**.
- `npx vitest run` on the five component files touched: **111 passed**.
  `npm run test:unit`: **180 files, 2,654 passed, 9 skipped** (2,651 at v10).
- `npm run typecheck`: clean. `npm run lint`: **0 errors, 38 warnings**, none on a file this round
  changed. `npm run format`: clean.
- **`npm run gate`**, after `rm -rf .next/cache`: every stage green except one, and that one is not
  this change's. `npm run check:copy` exits 1 on **three occurrences of the word "harness"** in
  `docs/worklogs/revamp-2026-09.md` — the measure-v9 entry's sentence about the workflow harness
  killing a multi-minute command, and the two later sentences that quote it. `scripts/quality/
  slop-scan.mjs` reads "harness" as promotional copy. The worklog is append-only and this round
  does not edit it, so the stage is recorded failing with its exact cause rather than made to pass.
  Everything else ran and passed in order: `typecheck`, `lint`, `check:medicine-content`,
  `audit:denial-corpus`, `agents:check`, `agents:import:check`, `check:agent-datasets`,
  `check:four-audience-coverage`, `check:source-consensus-snapshot`, `check:dataset-export`
  (24 files, 279 tests), `check:seo`, `format`, `drizzle-kit check`, `test:unit`,
  `test:integration` (26 files, 167 tests, on its own disposable database), `build`, and `test:e2e`
  (**30 passed**, on its own disposable database).
