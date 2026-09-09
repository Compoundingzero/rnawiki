### [PENDING-TIMESTAMP] Phase 4 — measure v10 (after fix round 5, with the S1/S4 clause merge)

The same ruler as measures v6 through v9, on the fix-round-5 render, every check against one build
and one at a time. One generator change was made before the checks: the S1/S4 supervision clause
merge the lead decided after reading fix round 5, which that round measured and recorded but did
not apply.

**The S1/S4 merge, applied.** On an antineoplastic record the ATC group is both the World Health
Organization therapeutic class S1 records and the hazardous-medicine class S4 reads off the same
code, so the block printed the group twice:

```
Its World Health Organization ATC class is L01CA, Vinca alkaloids and analogues (WHO ATC via ChEMBL/EMA).
A hazardous-medicine class covers it: L01CA, Vinca alkaloids and analogues (WHO ATC L01, NIOSH list not fetched).
```

One recorded classification stated as two claims, the second reading as the first with the register
swapped. The two are now one clause naming the class once and carrying both sources:

```
Its World Health Organization ATC class is L01CA, Vinca alkaloids and analogues (WHO ATC via ChEMBL/EMA; hazardous-medicine class, NIOSH list not fetched).
```

- `supervisionClauses` (`lib/corpus/suppression-labels.ts`) folds an S4 evidence row into the S1
  clause where the two name the same ATC code, and only where both classes would otherwise print a
  clause of their own, so a record carrying just one of them states exactly what it stated before.
  The S4 row contributes S4's own ground in words plus whatever its source states beyond the ATC
  basis the clause already names: `hazardousSourceWords` turns "WHO ATC L01 (NIOSH list not
  fetched)" into "hazardous-medicine class, NIOSH list not fetched", because repeating "WHO ATC
  L01" inside the same brackets would cite the same register twice. An S4 row naming a class S1 did
  not, or the word "cytotoxic" in a label, is a different fact and keeps its own clause.
- Scope, over `data/revamp/suppression/assignments-v2.ndjson` (28,832 records): **432** records
  carry both S1 and S4 and **428** of them name the same ATC class in both; the other four are the
  label-text path and keep two clauses. No other pair of classes shares an ATC code on any record,
  so the rule is scoped to S1 and S4 by the data as well as by the decision. In the render **396**
  pages print the merged clause and **24** still print an S4 clause of their own.
- `docs/specs/suppression-classes.md` carries the rule beside the clause table.
- `tests/test_render_safety.py` gains
  `test_one_atc_class_is_named_by_one_supervision_clause`: over every supervision answer in the
  render, no S4 clause may name an ATC code an S1 clause on the same page also names, and at least
  one record must render the merged clause carrying both sources.

**Commands, in order.**

```
npx tsx scripts/revamp/page_text_v5.ts --out data/revamp/render-v10
npx tsx scripts/revamp/page_text_v5.ts --with-furniture --out data/revamp/render-v10
.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py -q
npx vitest run tests/unit/corpus-suppression-block.test.ts tests/unit/corpus-render-safety.test.ts \
    tests/unit/hubs-render.test.ts
npm run lint ; npm run test:unit
.venv-corpus/bin/python scripts/revamp/derive_threshold.py --fields-dir data/revamp/fields-v2 \
    --assignments data/revamp/tiers/model-assignment-v2.ndjson \
    --text-dir data/revamp/render-v10/text \
    --with-furniture-text-dir data/revamp/render-v10/text-with-furniture \
    --out data/revamp/thresholds-v10.json
.venv-corpus/bin/python scripts/revamp/derive_threshold.py --fields-dir data/revamp/fields-v2 \
    --assignments data/revamp/tiers/model-assignment-v2.ndjson \
    --text-dir data/revamp/render-v10/text-with-furniture \
    --out data/revamp/thresholds-v10-with-furniture.json
.venv-corpus/bin/python scripts/revamp/common_line_share.py data/revamp/render-v10/text \
    data/revamp/render-v10/text-with-furniture data/corpus-20k/render/text \
    --out data/revamp/common-line-share-v10.json
# disposable database rnawiki_test_1788985466_4a45079c37, created and dropped by this run:
#   createdb; npx tsx db/migrate.ts (0000-0033, 34 rows);
#   pg_restore --data-only -t drugs -t inventory_resolutions from
#     rnawiki-backups/corpus-20k-2026-09-05/rnawiki-pre-corpus-20k.pgcustom (9,859 + 9,859 rows);
#   materialise.ts --tier {1,3,2} --revamp --thresholds data/revamp/thresholds-v10.json
#     --no-checkpoint; scripts/revamp/hubs_load.ts; rm -rf .next/cache; npm run build;
#   npx next start -p 3211
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3211 \
    --seed 20260905 --sample 1000 --csv data/revamp/rendered-dups-v10.csv \
    --summary data/revamp/rendered-dups-v10-summary.json
.venv-corpus/bin/python scripts/revamp/rendered_dup_check.py --base-url http://127.0.0.1:3211 \
    --seed 20260905 --indexable-keys data/revamp/indexable-keys-after.txt \
    --csv data/revamp/rendered-dups-v10-prior-set.csv \
    --summary data/revamp/rendered-dups-v10-prior-set-summary.json
.venv-corpus/bin/python scripts/revamp/redirect_check.py --base-url http://127.0.0.1:3211 \
    --out data/revamp/redirect-check-v10-local.json
.venv-corpus/bin/python scripts/revamp/link_graph_check.py --base-url http://127.0.0.1:3211 \
    --thresholds <abs>/data/revamp/thresholds-v10.json \
    --presence <abs>/data/revamp/presence-applicable-v10.ndjson \
    --out data/revamp/hubs/link-graph-v10.json
curl the sitemap index, its five children and /sitemaps/tier-3.xml
git diff origin/main -- app/robots.ts
npx tsx scripts/corpus-20k/gate2/browser-checks.ts --base http://127.0.0.1:3211 \
    --out data/revamp/browser-checks-v10.json
jsonld split check over 20 indexable and 20 noindex pages -> data/revamp/jsonld-v10.json
.venv-corpus/bin/python scripts/revamp/payload_audit.py --base-url http://127.0.0.1:3211 \
    --pages data/revamp/payload-audit-pages.txt --out data/revamp/payload-audit-v10.json
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3211 \
    --seed 20260914 --per-tier 20 --text-dir data/revamp/render-v10/text \
    --out-dir data/revamp/slop-draws/draw-8
.venv-corpus/bin/python scripts/revamp/slop_draw.py --base-url http://127.0.0.1:3211 \
    --seed 20260915 --per-tier 20 --text-dir data/revamp/render-v10/text \
    --out-dir data/revamp/slop-draws/draw-9
.venv-corpus/bin/python scripts/revamp/ci_sample.py
# the four required pre-merge checks in a git-archive clean room with no corpus
```

Server stopped, disposable database dropped, `.next/cache`, `data/revamp/rendered-text`, the clean
room and this run's overlap caches deleted.

**The re-render.** `data/revamp/render-v10/{text,text-with-furniture,provenance}`, **28,657 pages**,
rewritten in place; furniture-free **10,307,613** words, with furniture **14,173,186**; every
sentence carries a trace (1,191,686 provenance entries, 0 without).

The merge moved **374** pages, +996 words net, and the two directions are both the
two-paragraph question-block cap at `scripts/corpus-20k/render/page-text.ts:2043` (see the finding
below): on **227** pages the S4 clause was already past the cap and unpainted, so folding its source
into the S1 clause put six words of evidence back on the page; on the rest a painted S4 clause was
replaced or a later clause moved up into the freed slot. The pre-merge render was re-created from
the committed generator to measure this, reproduced fix round 5's 10,306,617 words exactly, and was
deleted.

**The ruler (`data/revamp/thresholds-v10.json`, furniture-free, the gate figure).**

| | Tier 1 | Tier 2 | Tier 3 |
| --- | --- | --- | --- |
| threshold | **20** | **20** | none |
| indexable | **293** | **1** | **0** |
| positional, all pairs (line 0.20) | **0.182320** | 0.0 | — |
| lexical, size-matched (line 0.353) | **0.348795** | 0.0 | — |
| v9 | 20 · 298 · 0.190322 · 0.349741 | 20 · 1 · 0 · 0 | none · 0 |
| thresholds-after (the 11-of-15 ruler) | 12 · 1,061 · 0.160173 · 0.328660 | 20 · 1 · 0 · 0 | none · 0 |

Tier 1 clears both lines. Tier 2 selects 20 and one page, both figures 0.0 on a one-page set. Tier 3
selects **no threshold**: no present-field count at or above the stub floor produces a set that
holds both lines, which is the unchanged rule's own answer and not a decision taken here. The five
pages Tier 1 loses against v9 are fix round 5's tier map and label mapping, not the merge: the v9
file was written before §15(3) moved 556 pages out of CLINICAL and before 11,392 label rows left the
corpus. Loaded: **293** indexable rows (Tier 1 292 + Tier 2 1; the 293rd Tier 1 page is the `oysk`
duplicate hold, `noindex,follow` whatever its field count says). Tier sizes loaded: **1,697 / 3,787
/ 23,173**, 710 hubs, 12,524 members, 258 aliases, 1 hub held.

`derive_threshold.py` gained `--assignments`, defaulting to the same
`data/revamp/tiers/model-assignment-v2.ndjson` the constant already named, so a run states which
tier map it measured. The rule that reads it is unchanged.

**The with-furniture reading, recorded beside the gate and never selecting.** The 293-page set the
furniture-free text selected scores **0.203791** positional and **0.359006** lexical on the
with-furniture text — both over the lines, which is why §11 makes the furniture-free figure the gate
figure. Tier 2's one page scores 0 on both.

Run separately over the with-furniture text as its own ruler (`thresholds-v10-with-furniture.json`, 2 h 14 min, the Tier 3 leg over 23,173 pages being the long one), Tier 1 selects **23** with **46** indexable at positional **0.184023** and lexical **0.334879**, Tier 2 selects 20 with its one page, and Tier 3 again selects nothing. v9's same run read 23 with 48 at 0.188294 and 0.333771, so the honest absence statements Operating Rule 9 requires still cost the same three present fields and the same order of magnitude in pages, and the two pages of the difference are fix round 5's tier map and label mapping, as in the gate figure.

**Common lines and page length** (`common-line-share-v10.json`). Furniture-free: 7 lines carried by
more than half of the 28,657 pages, **6.2382 %** of the corpus's words, median page **129** words
(v9: 6.9652 %, 125). With furniture: 20 lines, **29.7548 %**, median **278** (v9: 32.4959 %, 275).
The corpus-20k v4 render, on the same script: 4 lines, 5.0536 %, median 80.

**Rendered duplicate check** (`rendered-dups-v10.csv`/`-summary.json`, 293 indexable + 709 published
hubs + a 996-page noindex sample of a 28,076 frame, 1,998 pages rendered at 390 and 1,280 px, 9.4
minutes): **0 indexable pairs**, **0 hub-to-hub pairs**, **0 hub-to-page pairs**, 31,506 pairs
flagged in all (31,502 stub-template, 2 identical-trial-set, 2 unclassified-overlap; none touching
an indexable page). The one recorded issue, "1 indexable slugs have no key in the corpus records",
is the same one v9 carried.

Over the **1,062-key pre-Phase-4 comparison set** (`indexable-keys-after.txt`, of which 1,048 have a
slug in this corpus and 1,041 rendered): **84 indexable pairs** — biosimilar 32, identical-trial-set
32, unclassified-overlap 14, stub-template 6, against v9's 82. That set is the one the old
threshold-11 ruler named; the v10 ruler does not call those pages indexable and the figure is
carried for comparison only.

**Redirects** (`redirect-check-v10-local.json`): plan universe **9,857**, served directly 8,863, one
hop 1,044, **0 orphans, 0 chains, 0 conflicts**; live **8,884 × 200 and 973 × 308, 0 failures**.
Identical to v7, v8 and v9.

**Link graph** (`hubs/link-graph-v10.json`): **PASS**, all seven rules. 714 hubs in the data files,
**709 published**, 12,607 member rows, every published hub answering 200, **6,052** member links
answering 200, 294 indexable leaves each in a hub or with a recorded reason.
`inDataFilesNotPublished` names the same five as v9: the four the loader refuses for having fewer
than five loadable members and `target/hdac8`, the held hub.

**Sitemap.** Index lists five children and no more: `tier-1` **292**, `tier-2` **1**, `browse`
**1,837**, `hubs` **710** (709 published hubs plus `/h`), `pages` **10**. `/sitemaps/tier-3.xml`
answers **404**. `app/robots.ts` is byte-identical to `origin/main`.

**Frozen home search bar** (`browser-checks-v10.json`): **0.00 px** against
`data/corpus-20k/gate2/browser-checks-v2.json` on every box value at 1440, 375 and 320 px, same DOM
path at all three. Per sample (7 pages): one `<h1>`, no horizontal overflow at 320 px, no element
without a focus ring, and the stand-in-text probe empty on every sample and width.

**JSON-LD** (`jsonld-v10.json`, seed 20260914). Twenty indexable pages: **exactly one**
`application/ld+json` block on each. Twenty noindex pages drawn across the three tiers: **zero**
blocks. All forty carry exactly one `<main>`; no failure.

**Payload** (`payload-audit-v10.json`, the pinned 108 pages): 108 of 108 measured, RSC dossier share
of the document **0.0**, dossier text repeated in the RSC stream **0.0**, live text-to-HTML median
**0.150259** over all 108, **0.150226** over the 100-page indexable draw and 0.174606 over the eight
step-0.3 samples. Above step 6.1's **0.15** floor and below its 0.25 target; median document bytes
70,530.0 and median dossier text 21,813.0 against v9's 69,406.5 and 21,455.5.

**Slop draws 8 and 9 — the gate does not pass.** Sixty pages each, 20 per tier, seeds 20260914 and
20260915, check (b) over the masked block with the sentence-level literal reading beside it, parity
by `dom_parity.py`'s own extraction:

| | draw 8 (seed 20260914) | draw 9 (seed 20260915) |
| --- | --- | --- |
| pages rendered | 60 of 60 | 60 of 60 |
| sentences | 1,120 | 1,139 |
| (a) traces to a stored field | **16 failures** | **32 failures** |
| (b) masked block on ≤ 0.5 % of pages | **0 failures** | **0 failures** |
| (b) sentence-level literal, reported only | 73 | 57 |
| (c) no label naming a device | **0 failures** | **0 failures** |
| render/DOM parity | 0 / 0 / 0 | 0 / 0 / 0 |
| `pages.md` words | 34,252 | 32,662 |

Parity is this round's own reading and not the previous round's: `render-v10/dom-parity.json` is
the file fix round 5 wrote and was not re-run here, and §12 makes the slop draw's comparison
`dom_parity.py`'s own extraction, so the 0 / 0 / 0 above is 120 pages of the v10 build measured by
that comparison.

Against draws 6 and 7 that is (b) 4 → **0** on both draws: the two shapes §15(4) named — the register
status line inside a question block and the mechanism block's kept prose — are gone from the render,
and no shape replaced them. (c) and parity stay clean.

(a) moved the other way, 0 → 16 and 32, and it is one generator, on three pages of each draw: the
**Tier C shared-target interaction rule's `direction` provenance**. `interactions_build.py` writes
it as `action words Inhibitor and Inhibitor both read as inhibit` (also `Agonist`/`Agonist` →
`activate`, `Agonist`/`Partial Agonist`, `Agonist`/`Positive Allosteric Modulator`, `INHIBITOR`/
`INHIBITOR`), and `slop_draw.resolve_trace` has no branch that recognises that shape, so the trace
classifies as `unrecognised` and every sentence carrying it fails (a). The rule C2 rows were on no
page draws 6 and 7 sampled — their trace table records `additive class: resolved 60` and no
unrecognised trace — so this is a shape the earlier draws did not meet rather than a regression the
merge caused. Which side is corrected — the trace the rule writes, or the classifier that reads it —
is the lead's call, and every artefact for that reading is in `data/revamp/slop-draws/draw-8/` and
`draw-9/` (`report.json`, `pages.md`).

**Two findings for the lead's reading, recorded and not fixed here.**

1. **The supervision block prints at most two clauses.** §15(1) says one clause per recorded class,
   and the block builds them all, but `buildBlockBody` ends with `.slice(0, 2)`
   (`scripts/corpus-20k/render/page-text.ts:2043`) — the two-paragraph discipline every question
   block is held to — so the third and later clauses are dropped before the page is written. Over
   the 28,832 assignment records the merged builder produces more than two clauses on **225**
   records (154 produce three, 64 produce four, 7 produce five); in the render **568** pages print
   two clauses and **1,195** print one. Glofitamab, whose record carries S1, S3, S4 and S6, prints
   the first two and states neither its hazardous-medicine class nor its boxed warning in the
   supervision answer. This is the cap, not the merge: it held before the merge too, and it is why
   the merge added words on 227 pages.
2. **Seed 8, the provenance timeline, has no records to check.**
   `test_the_provenance_timeline_fires_only_on_three_dated_events_in_order` reads
   `data/revamp/derived-v2/seed-08.ndjson`, which is a corpus file and gitignored, so under
   `--sample` the rule skipped itself and `tests/conftest.py` turned that skip into a failure — the
   one red check in the first clean-room run. The rule is about what the derivation wrote rather
   than about what a page painted, so no render sample can carry it: it is named in `SAMPLE_SKIPS`
   with its reason and its workstation command, and `docs/specs/ci-checks.md` now lists four rules
   that cannot run in CI instead of three. It runs on the workstation and passes there.

**Tests.** `.venv-corpus/bin/python -m pytest tests/test_render_safety.py tests/test_hub_dedupe.py`:
**48 passed** (47 at fix round 5; the new case is the one). `npx vitest run` on the three component
files touched: **94 passed**. `npm run lint`: 0 errors, 38 warnings, none on a file this round
changed. `npm run test:unit`: **180 files, 2,651 passed, 9 skipped**.

**The CI sample, refreshed** (`data/revamp/ci-sample/`). `ci_sample.py` reads the newest ruler pair
and the newest render, which are now `thresholds-v10.json` + `presence-applicable-v10.ndjson`
(**294** indexable leaves, **266** of them hub members) and `data/revamp/render-v10`. Two things had
to change for it to read v10 at all:

- `page_text_v5.ts` writes the provenance map once, on the furniture-free run, under `provenance/`;
  `ci_sample.py` looked only for `provenance-with-furniture/` and refused the render. It now reads
  whichever of the two names the render on disk holds and keeps writing the sample file under the
  name `tests/conftest.py` points `PROVENANCE_DIR` at.
- The draw gains a requirement, `supervision-merged-atc-clause`, so a page rendering the merged
  clause is always in the sample and the rule that asserts it saw one has something to check
  (drawn: `HOLD:existing:fludarabine`, `HOLD:existing:vincristine`, `K1:00DPD30SOY`).

The sample is **200 pages** (tier 1: 63, tier 2: 67, tier 3: 70), **1,647,454 bytes** in 8 files,
inside the 5 MB cap. `package.json`, `.github/workflows/revamp-checks.yml` and
`docs/specs/ci-checks.md` now name the v10 pair and the v10 render; the v8 pair is deleted.

**The four required pre-merge checks, run outside the working copy**
(`data/revamp/ci-sample/local-run.json`): `git archive HEAD` into a temporary directory, this
change's files copied in beside it, a fresh virtual environment from
`scripts/revamp/requirements-ci.txt`, and no corpus (`fields-v2`, `render-v10`, `page-blocks` and
`derived-v2` all absent there). **All five commands exit 0**: slug union current (9,907 slugs),
redirect plan written, link graph clean, sitemap invariants 4 passed, rendering rules **38 passed,
4 skipped**. One negative probe per check is recorded with the message it fails with.

**Outputs.** `data/revamp/thresholds-v10.json`/`.md`, `presence-applicable-v10.ndjson`,
`field-census-applicable-v10.csv`, `common-line-share-v10.json`, `rendered-dups-v10.csv`/
`-summary.json`, `rendered-dups-v10-prior-set.csv`/`-summary.json`, `redirect-check-v10-local.json`,
`hubs/link-graph-v10.json`, `browser-checks-v10.json`, `jsonld-v10.json`, `payload-audit-v10.json`,
`slop-draws/draw-8/{report.json,pages.md}`, `slop-draws/draw-9/{report.json,pages.md}`,
`ci-sample/{thresholds-v10.json,presence-applicable-v10-hub-members.ndjson,robots.ts.snapshot,
local-run.json,render/*}`, `data/revamp/render-v10/{text,text-with-furniture,provenance}`.
