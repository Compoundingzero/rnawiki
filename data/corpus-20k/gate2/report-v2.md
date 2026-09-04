# Gate 2 recheck — the same measurement on the fixed code and data (2026-09-05)

The first Gate 2 run passed on overlap but left three defects, one of which stopped the Tier 1 load
outright and one of which meant the loader and Gate 1b were counting two different quantities. Phase
5a fixed those, plus the withdrawn rule, identity pass 3, the S10 wording, the seed 13 duplicates and
the CLINICAL frames. This run redoes the whole measurement on the fixed build and then applies the
threshold deploy procedure that Phase 2d fixed.

**Result: index at 11, not 7.** The threshold-7 set of 2,249 pages misses the rule by two
thousandths — a size-matched cumulative positional median of **0.202454** against a `<= 0.20`
requirement — and its lexical median, 0.453, is above R3's 0.40 as well. The 636 pages at threshold
11 measure **0.188161** size-matched, **0.195831** over all pairs and **0.368746** lexical, inside
every target. `data/corpus-20k/deploy/threshold.json` records the decision.

Every earlier defect is closed: the Tier 1 load runs to completion, the loader's present-field count
now agrees with Gate 1b's to the page at both thresholds, no sample overflows 320 px, and the
S10-only page asks about classification rather than asserting a supervision requirement.

## What was measured, and on what

| Step          | What                                                                                                                                                                                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database      | a disposable local database `rnawiki_gate2v2_test`, migrated 0001–0025, carrying the legacy `drugs` (9,859), `inventory_resolutions` (9,859) and `medicine_slug_redirects` (5) rows copied from the working database so slug assignment meets what Phase 5 will meet. Dropped at the end.                                                         |
| Load          | `scripts/corpus-20k/load/materialise.ts --indexable-threshold 7`. **All** of Tier 1 (1,719) and Tier 2 (4,477), plus Tier 3 batch 1 (250), which still holds both Tier 3 samples. 6,446 pages. Markers under `gate2/load-markers-v2/`; the `batch.ts` checkpoint ran under a scratch state root, so `data/corpus-20k/state.json` was not touched. |
| Build         | an isolated copy of the worktree under the scratchpad with its own `.next` (`node_modules` and `data` symlinked), `next build` (66.6 s), `next start` on port 3111.                                                                                                                                                                               |
| Extractor     | `scripts/corpus-20k/gate2/extract.py`, unchanged.                                                                                                                                                                                                                                                                                                 |
| Harness       | `scripts/corpus-20k/overlap/measure.py` unchanged (seed 20260904, 128 permutations, 5-gram shingles), exhaustive on every set. Size-matched folds by `scripts/corpus-20k/gate2/folds.py` at fold size 324, the same construction Gate 1b used.                                                                                                    |
| Fetch         | 2,249 pages at threshold 7, every one HTTP 200, 74.5 pages/second. The 636 pages at threshold 11 are the subset of those, scored as their own set.                                                                                                                                                                                                |
| Live baseline | **not refetched.** The like-for-like before/after is the one already recorded in `report.md`: the same 604 medicines measured 0.799 positional and 0.796 shared-word share on the live site. Nothing about the live site changed between the runs; what changed is our side, and this report measures our side.                                   |

## The three loader defects, closed

**The NUL byte.** Tier 1 now loads all 7 batches. The loader strips ASCII control characters where
the row is built and counts them: 3 characters inside 2 names across Tier 1 and Tier 2 — the celecoxib,
rabies-vaccine and tramadol strings the first run found. The corpus files on disk are unchanged.

**The augmented fields.** `liftTopLevelFields` now reads a top-level entry that carries a string
`state` exactly the way `page-text.ts` does: 6,171 `doseStudied` and 5,068 `approvalDate` entries
reached `page_fields` this run. The consequence is the number that matters:

| Threshold | Gate 1b v4 (page-text model) | This load (`present_field_count`) |
| --------: | ---------------------------: | --------------------------------: |
|         7 |                        2,249 |                         **2,249** |
|        11 |                          636 |                           **636** |

The two counts are now the same quantity. The first run disagreed by 117 pages at threshold 11, and
the measurement had to be reported as conservative. It no longer does.

**Horizontal overflow at 320 px.** 0 of 7 samples overflow. `documentElement.scrollWidth` is exactly
320 on all seven at a 320 px viewport, `carbidopa-levodopa` and `sirolimus` included.

## The threshold decision

The procedure fixed in Phase 2d: render the threshold-7 set through HTML and measure; index at 7 if
the size-matched cumulative median is `<= 0.20` **and** the all-pairs median is `<= 0.30`, else index
at 11 with 7–10 as the promotion criterion.

| Measure                                                    | Threshold 7 (2,249 pages) | Threshold 11 (636 pages) | Rule                                  |
| ---------------------------------------------------------- | ------------------------: | -----------------------: | ------------------------------------- |
| Size-matched cumulative positional median (324-page folds) |              **0.202454** |             **0.188161** | `<= 0.20` — 7 **fails**, 11 passes    |
| All-pairs positional median                                |                  0.256167 |                 0.195831 | `<= 0.30` — both pass                 |
| Positional p90 (size-matched / all pairs)                  |       0.277586 / 0.678161 |      0.333633 / 0.576669 | reported                              |
| Lexical median (size-matched / all pairs)                  |   0.402850 / **0.453177** |      0.352953 / 0.368746 | `<= 0.40` — 7 **fails**, 11 passes    |
| Pages above 0.20, size-matched                             |            1,184 of 2,249 |               208 of 636 | reported                              |
| Pages above 0.30, size-matched                             |              162 of 2,249 |                73 of 636 | reported                              |
| Prose only, positional median                              |                  0.131295 |                 0.104789 | reported                              |
| Shared-word share, with markup / prose only                |       0.376243 / 0.312849 |      0.430757 / 0.369318 | reported, not a target                |
| Median tokens per page                                     |                     1,425 |                    2,124 | reported                              |
| Random-pair positional median (null)                       |                  0.068660 |                 0.099073 | the floor the set sits above          |
| Expected nearest neighbour at this size (null)             |                  0.359898 |                 0.362602 | the observed maxima are well below it |
| Control: other page's text                                 |                  0.559477 |                 0.562565 | the harness reads the pages           |
| Control: more of the page's own text                       |                  0.254694 |                 0.195271 | ≈ the observed value                  |
| Crawl text-to-HTML, median (baseline 8.3 %)                |                    9.88 % |              **10.90 %** | must rise ✓                           |
| RSC payload, median share of the document                  |                   62.96 % |                  63.08 % | reduced, still the open item          |

**Decision: 11.** 636 pages carry `index,follow`; 7–10 present fields is the promotion band, to be
re-measured when those pages gain fields. Threshold 7 misses on two counts, not one: the size-matched
positional median by 0.0025 and the lexical median by 0.053.

The two thresholds are not two different corpora — 636 of the 2,249 are the same pages. What the
extra 1,613 pages add is 1,613 pages holding 7 to 10 fields, and a page with 7 fields has less of its
own to say. The set median moves accordingly. This is the same honest limit Phase 2b recorded, read
at a finer grain.

### Shared-word share, stated plainly

The statistic counts the share of a page's word occurrences whose word appears on more than 90 % of
the other pages in the same set. It rises as a set gets smaller and more uniform in subject, so the
threshold-11 figure (0.431) is _higher_ than the threshold-7 figure (0.376) while the positional
overlap is lower — a smaller, more data-rich, more subject-uniform set shares more vocabulary and
fewer sentence positions. Against the live site's 0.796 on the same medicines, both are a long way
down. Removing declared markup takes them to 0.369 and 0.313.

## The seven samples

Same seven slugs as run 1, so the two runs are comparable. Their field counts moved because identity
pass 3, the withdrawn rule and the augmented-field fix all landed in between.

| Role                   | Slug                                         | Tier | Page type   | Fields | Questions | Indexable at 11           |
| ---------------------- | -------------------------------------------- | ---: | ----------- | -----: | --------: | ------------------------- |
| Data-rich Tier 1       | `metformin`                                  |    1 | longevity   |     16 |        17 | yes                       |
| Mid Tier 1             | `cysteamine`                                 |    1 | longevity   |     11 |        14 | yes                       |
| Withdrawn arc          | `amlodipine`                                 |    1 | longevity   |     14 |        16 | yes                       |
| Suppression class      | `sirolimus`                                  |    1 | longevity   |     16 |        18 | yes                       |
| Tier 2 standard        | `carbidopa-levodopa`                         |    2 | clinical    |      5 |         8 | no                        |
| Tier 3 experimental    | `cdx-3379`                                   |    3 | development |      7 |         6 | no (Tier 3 never indexes) |
| Tier 3 near-empty stub | `1,2-distearoyl-sn-glycero-3-phosphocholine` |    3 | stub        |      1 |         0 | no                        |

### Payload and text density

Crawl figure = visible characters of the whole document / HTML bytes (baseline 8.3 %). Live figure =
`body.innerText / documentElement.outerHTML` in Chromium after hydration (baseline 0.07 %).

| Sample                        | HTML bytes | Visible chars |   Crawl | Reading column | Live (desktop) | RSC bytes | RSC share |
| ----------------------------- | ---------: | ------------: | ------: | -------------: | -------------: | --------: | --------: |
| metformin                     |    242,080 |        30,760 | 12.71 % |        11.49 % |          3.8 % |   153,413 |    63.4 % |
| cysteamine                    |    129,130 |        13,620 | 10.55 % |         8.59 % |          5.5 % |    80,985 |    62.7 % |
| amlodipine                    |    195,853 |        22,616 | 11.55 % |        10.13 % |          4.2 % |   124,430 |    63.5 % |
| sirolimus                     |    255,130 |        33,885 | 13.28 % |        12.07 % |          3.9 % |   161,138 |    63.2 % |
| carbidopa-levodopa            |     77,740 |         6,646 |  8.55 % |         6.48 % |          5.3 % |    48,307 |    62.1 % |
| cdx-3379                      |     57,657 |         3,820 |  6.62 % |         4.91 % |          4.7 % |    35,567 |    61.7 % |
| 1,2-distearoyl…phosphocholine |     28,389 |         1,414 |  4.98 % |         3.50 % |          3.3 % |    16,757 |    59.0 % |

The exact per-sample rows are in `summary-v2.json`; the table above rounds. Across the 636 indexed
pages the crawl figure runs 7.66 %–13.96 %, median 10.90 %, against the 8.3 % baseline; the live
figure runs 3.3 %–5.5 % against 0.07 %.

### Interface checks at 320 px and desktop

| Check                                      | Result                                                                                                                                                                                                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Horizontal overflow at 320 px              | **0 of 7.** `documentElement.scrollWidth` = 320 = `innerWidth` on every sample                                                                                                                                                                            |
| Elements wider than the viewport           | four samples hold some, and every one is the evidence-ladder `<svg>` inside `div.cd-ladder-scroll`, its own `overflow-x` container. Wide content scrolling inside its own container is what the requirement asks for; the document itself does not scroll |
| Heading order                              | h1 → h2 (question) → h3 (revealed group) on all seven at both widths; exactly one h1; no level skipped                                                                                                                                                    |
| Body contrast                              | minimum **16.145 : 1** (target ≥ 7 : 1)                                                                                                                                                                                                                   |
| Grey rows contrast                         | minimum **4.865 : 1** (target ≥ 4.5 : 1)                                                                                                                                                                                                                  |
| Keyboard                                   | every `<details>` summary, contents link and provenance anchor took focus with a visible ring; **0** required targets without one, at both widths                                                                                                         |
| Badge below 480 px                         | in flow, not in the left margin, on every sample that has blocks                                                                                                                                                                                          |
| Empty elements                             | **0** across all 2,249 fetched pages and the seven samples                                                                                                                                                                                                |
| Placeholder phrases                        | 6 pages of 2,249 match the placeholder expression; see below                                                                                                                                                                                              |
| Frozen home search bar at 1440 / 375 / 320 | **0.00 px** difference from the committed baseline on every box                                                                                                                                                                                           |

The frozen-bar DOM path reads `body>div[2]>main>div>section[1]>div[2]>div[1]>input` against the
recorded baseline string `body>div[3]>main>div>section>div[1]>div>input[1]`. Every measured box is
identical to the hundredth of a pixel; this is the notation-and-ancestor-index difference already
reported in run 1, and a person who wants the string to match should re-record it against this build.

### Suppression

1,935 of the 6,446 loaded pages are suppressed. **0** hold a seed 1, 2 or 6 row and **0** render one.

`sirolimus` carries S1, S3, S4 and S6; its supervision block is ordinal 0, the first thing after the
header, and it is a question block rather than a banner, as the template requires.

The S10 wording is fixed. `astaxanthin-2` is a Tier 1, non-stub page whose only class is S10, and it
renders a **classification** block, not a supervision block:

> **Q1 What classification does ASTAXANTHIN carry?** No regulator classification is recorded for
> ASTAXANTHIN.

The question no longer asserts a requirement the body then withdraws.

### Questions

8,543 question rows over the 636 indexed pages, **8,464 distinct strings**; the most-repeated string
appears on **2** pages, 0.31 % against R7's 30 % limit. Over the wider 2,249-page threshold-7 set:
24,084 rows, 23,747 distinct, most-repeated again on 2 pages (0.09 %).

## Observations, not blockers

- **The placeholder regular expression matches six pages, and five are the source's own words**:
  "robust null epigenetic findings" (metformin, sitagliptin-metformin), "PKA-null cells"
  (vasopressin), "Telomere Biology Disorders (TBD)" (quercetin), "a yet undefined
  PPAR-gamma-independent mechanism" (troglitazone). The sixth is real but is not ours: for
  NCT00801905 ClinicalTrials.gov records the literal string `undefined` as `whyStopped`, and the
  2026-09-01 snapshot confirms it. `nepafenac` prints it quoted in the block sentence and unquoted in
  the revealed row. Printing a register's exact word is the rule; printing it unquoted next to two
  real reasons reads like a bug. Worth quoting in the row as well.
- **`amlodipine` is no longer flagged withdrawn.** The Phase 5a withdrawn rule requires no remaining
  active application in the register, and amlodipine keeps a Health Canada `APPROVED` entry, so the
  flag came off — exactly the spot check the first run asked for. The sample slug is kept so the two
  runs compare, but it no longer exercises the withdrawn arc. 663 of the 6,446 loaded pages are still flagged withdrawn, 34 of them inside the
  636-page indexed set; a withdrawn page should be added to the sample list before Phase 5b.
- **The RSC payload is still 59–63 % of every document.** Unchanged from run 1 and still the
  disclosure spec's open item, not a Gate 2 blocker.
- **Load throughput was not separately timed in this run.** The first Gate 2 run measured 110.3
  pages/second against the deployment plan's floor of 1, on the same loader and machine.

## Files

- `data/corpus-20k/gate2/summary-v2.json` — every figure here, machine-readable
- `data/corpus-20k/deploy/threshold.json` — the deploy decision
- `data/corpus-20k/gate2/lists-v2/*.tsv` — the threshold-7, threshold-11 and sample slug lists
- `data/corpus-20k/gate2/pages-v2/*.ndjson` — the extracted HTML text of all 2,249 pages
- `data/corpus-20k/gate2/runs-v2/*/` — one directory per measured set, plus the two fold runs
- `data/corpus-20k/gate2/html-audit-v2.json`, `html-audit-v2-samples.json` — text-to-HTML, RSC
  bytes, empty elements, blocks
- `data/corpus-20k/gate2/browser-checks-v2.json` — the Chromium checks and the frozen-bar measurement
- `data/corpus-20k/gate2/load-markers-v2/` — the load's batch markers
