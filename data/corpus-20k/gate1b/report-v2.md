# Gate 1b — re-measure after the Phase 2c identity merges

**Run 2026-09-04 (Phase 2c).** This is the single re-measure Phase 2b reserved when it recorded a
provisional PROCEED. It supersedes `report.md` / `summary.json`, which stay on disk as the v1
record.

**Result: Gate 1b does not clear.** The size-matched positional median is **0.249** against the
0.20 target, and **no present-field count satisfies the threshold rule**, so the rule selects no
indexable set at all. The cause is measured and specific: derived seed 15 (evidence age), which
fired on zero pages in Phase 2b, now fires on **3,689 of the 4,558 indexed pages (80.9 %)** and
carries a standing paragraph and standing rows. Remove that one block and the measurement returns
to the Phase 2b result almost exactly (0.211 pooled, threshold 7, 2,266 indexed). Nothing else
regressed.

## What was measured, and how it matches Phase 2b

Same renderer definition, same harness, same sets, same seeds. The text under measure is the
re-rendered page text at `data/corpus-20k/render/text/batch-0001…0029.ndjson` (step `page-text-v2`,
28,943 pages, all checkpointed): header, every question block (question, paragraph 1, paragraph 2,
the revealed rows inside the server-delivered `<details>`), the identifiers panel, relations rows,
source list, and the stub sentence where a page has no question. Excluded by rule: site header and
nav, footer, contents rail, definitions page, licence and revision lines, and the repeated "Show the
evidence" control label. Row cap 20, unchanged.

The Phase 2b driver that assembled the harness inputs was never committed, so its sets were
reconstructed from the committed v1 artefacts and **verified before use**:

- the seeded draws are `default_rng(20260904)`, 803 drawn first and then 324, over the sorted
  indexed key list — both reconstructed key sets match the v1 files exactly;
- the size-matched basis is `default_rng(20260904).permutation` of the same sorted list, cut into
  consecutive 803-page folds, with the short last fold padded back to 803 from the same generator
  and only its own members kept — the reconstructed fold order matches the v1 key order exactly;
- running the reconstructed fold pipeline on the v1 page text reproduces **all 4,562 rows** of
  `matched-per-page.json`, positional, lexical and shared-word share, with **0 mismatches**.

The live baselines (set c) are not re-run: they read `data/drugs/*.ndjson` through the committed
`build_validation_corpus.py`, no drug record changed in Phase 2c, and the same caveat as Phase 2b
applies — that text is exported field paths and values, not rendered prose, so it is a before, not a
like-for-like before.

## Harness fit

Re-validated at the 803 draw of the re-rendered text, as R3 requires before any corpus-scale figure
is quoted: positional delta **median 0.0**, p90 0.036088, max 0.127216; lexical delta median 0.0;
613 of 803 pages get the identical partner. The rule is *unfit above 0.02 median delta*. **Fit.**

## Results per set

| Set | Pages | Positional median | p90 | > 0.20 | > 0.30 | Lexical median | Shared-word share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (a) indexed set, all-against-all | 4,558 | 0.312 | 0.690 | 3,981 | 2,399 | 0.513 | 0.173 |
| (a) indexed set, size-matched folds | 4,558 | **0.249** | 0.420 | 3,927 | 1,275 | 0.460 | 0.173 |
| (b) matched 803 draw | 803 | 0.247 | 0.415 | 691 | 186 | 0.465 | 0.182 |
| (b) matched 324 draw | 324 | 0.206 | 0.375 | 184 | 53 | 0.440 | 0.162 |
| (c) live baseline, 803 (carried forward) | 803 | 0.647 | 0.794 | 803 | 796 | 0.615 | 0.559 |
| (c) live baseline, 324 (carried forward) | 324 | 0.611 | 0.810 | 324 | 313 | 0.585 | 0.550 |
| full corpus, all 28,943 | 28,943 | 0.711 | 0.800 | 28,385 | 26,961 | 0.683 | 0.333 |
| sensitivity: prose only | 4,558 | 0.347 | 0.773 | 4,018 | 3,462 | 0.560 | 0.070 |

**Corpus size, as before.** The null model still prices the rise with candidate count: expected
nearest-neighbour positional is 0.300 at 324 draws, 0.391 at 803 and 0.657 at 4,558, against
observed 0.206, 0.247 and 0.312. The pages remain more distinct than size alone would produce.
That is not the gate. The gate is the 0.20 size-matched target, and the size-matched basis misses
it — at every present-field count.

**Controls.** `control:other` positional median 0.556, `control:self` 0.304, median tokens 1,314.
Padding a page with another page's words still roughly doubles the score; padding it with its own
does not move it. The measure still responds to the thing it names.

## The threshold rule selects nothing

Present-field buckets on the size-matched basis. The rule: the smallest count whose own bucket
median and whose cumulative median are both at or below 0.20.

| Present fields | Pages | Positional median | p90 | Lexical median | Cumulative pages | Cumulative positional median |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 6 | 0.332 | 0.380 | 0.465 | 4,558 | 0.249 |
| 1 | 286 | 0.377 | 0.531 | 0.609 | 4,552 | 0.249 |
| 2 | 374 | 0.309 | 0.432 | 0.556 | 4,266 | 0.243 |
| 3 | 438 | 0.290 | 0.401 | 0.515 | 3,892 | 0.240 |
| 4 | 449 | 0.266 | 0.437 | 0.507 | 3,454 | 0.237 |
| 5 | 371 | 0.250 | 0.376 | 0.476 | 3,005 | 0.232 |
| 6 | 368 | 0.250 | 0.784 | 0.479 | 2,634 | 0.231 |
| 7 | 348 | 0.250 | 0.548 | 0.480 | 2,266 | 0.226 |
| 8 | 374 | 0.238 | 0.379 | 0.445 | 1,918 | 0.223 |
| 9 | 481 | 0.232 | 0.386 | 0.425 | 1,544 | 0.221 |
| 10 | 425 | 0.222 | 0.287 | 0.400 | 1,063 | 0.216 |
| 11 | 165 | 0.213 | 0.356 | 0.345 | 638 | 0.213 |
| 12 | 161 | 0.213 | 0.356 | 0.321 | 473 | 0.212 |
| 13 | 136 | 0.209 | 0.413 | 0.313 | 312 | 0.209 |
| 14 | 152 | 0.208 | 0.308 | 0.301 | 176 | 0.211 |
| 15 | 22 | 0.216 | 0.287 | 0.279 | 24 | 0.216 |
| 16 | 2 | 0.253 | 0.280 | 0.275 | 2 | 0.253 |

No row qualifies. The lowest bucket median is 0.208 at 14 present fields; the lowest cumulative
median is 0.209 at 13. Under the rule as written:

- **Indexed: 0 pages.**
- **Boundary overlap: none** — there is no boundary bucket.
- **Tier 2 below the threshold: 3,080** (every Tier 2 candidate), plus the 1,644 Tier 2 pages that
  fire no question at all.
- **Tier 1 below the threshold: 1,478** (every Tier 1 candidate), plus 20 Tier 1 pages that fire no
  question.

At full indexed-set scale no bucket comes close either: the lowest bucket median is 0.230 at 14
present fields, and 11 of the 17 buckets sit above 0.30. That figure is reported for completeness
and is not the gate basis.

## The cause, measured

Line frequencies over the indexed set, v1 against v2, isolate three strings that were absent from
the Phase 2b render and are now on most pages:

| Line | v2 pages | v2 share | v1 share |
| --- | ---: | ---: | ---: |
| `No later publication is recorded.` | 3,689 | 80.9 % | 0 |
| `asOf <date>` | 3,689 | 80.9 % | 0 |
| `yearsSince <n>` | 3,441 | 75.5 % | 0 |

They are the paragraph 2 and the revealed rows of one block: **derived seed 15, evidence age**,
which Phase 2b discarded under the 40-page floor (the aggregate lacked `lastCompletionDate`) and
Phase 2c retried successfully — it now fires on 7,332 pages corpus-wide. A rendered example:

```
The last human test of Sennosides A and B finished in 2022 — what has changed since?
2022: the completion year of the last recorded human test of Sennosides A and B.
No later publication is recorded.
asOf 2026-09-04
latest 2022-03-01; trial completion; studies whose registry overall status is COMPLETED; NCT…
yearsSince 4
```

Paragraph 2 is a standing caveat, and two of the three rows are standing labels. This is the exact
failure Phase 2b measured and fixed mid-stage — a standing paragraph 2 on every block gave 0.428 at
the 803 draw — and the constraint it breaks is the same one: *shared sentences on ONE linked page*.
The question heading and paragraph 1 carry page-specific values but also a long fixed run ("the
completion year of the last recorded human test of"), which is why the block, not just its standing
lines, is what the measurement responds to.

Two sensitivity runs, both on the size-matched basis, both labelled as sensitivities and neither a
decision — the pages as rendered today carry the block, and the figures above are the ones that
stand:

| Sensitivity | Pooled positional median | Threshold | Indexed |
| --- | ---: | ---: | ---: |
| as rendered | 0.249 | none clears | 0 |
| drop the three standing lines only | 0.226 | 10 | 1,063 |
| drop the whole evidence-age block (3,689 pages) | **0.211** | **7** | **2,266** (1,029 Tier 1 + 1,237 Tier 2) |

With the block removed, boundary 0.200, cumulative 0.183, cumulative lexical 0.380, Tier 1 below
449, Tier 2 below 1,843 — the Phase 2b numbers, within rounding. No other part of the Phase 2c work
moved the measurement: the identity merges changed the corpus by 23 pages and the indexed set by 4.

## What the pages above target share

For each page above target on the size-matched basis, its shared 5-grams with its nearest
neighbour, attributed to the line they came from:

- above 0.20 (3,927 pages): 21.9 % mean from lines the template calls markup, 37.2 % mean from
  block prose and rows, 40.9 % mean from runs that cross a line boundary;
- above 0.30 (1,275 pages): 21.1 % mean markup, 35.8 % mean prose, 43.1 % mean spanning.

The balance has moved since Phase 2b (32.2 % markup / 26.6 % prose above 0.20 then; 21.9 % / 37.2 %
now). The shared material is now mostly prose, not field rows — consistent with a standing paragraph
rather than with thin pages. The pages above 0.30 remain thin (median 4 present fields, 298 words,
against 6 and 575 across the indexed set), so both mechanisms are present; the new one is the larger.

The prose-only sensitivity says the same from the other side: stripping declared-markup lines now
*raises* the positional median (0.312 → 0.347), and the shared-word share falls only to 0.070
(0.048 in Phase 2b) because the standing sentence is prose and survives the strip.

## The full corpus, and Tier 3

All 28,943 rendered pages: positional median 0.711, median 86 tokens — unchanged from Phase 2b.
18,880 carry no question. Shared-word share by tier: Tier 1 0.088, Tier 2 0.151, Tier 3 0.405. The
measured case for R6 is unchanged: Tier 3 stubs stay noindex and out of the sitemap, and are not
robots-disallowed.

## Diff against v1 — one table

| Measure | v1 (Phase 2b) | v2 (this run) | Change |
| --- | ---: | ---: | ---: |
| Pages rendered | 28,966 | 28,943 | −23 |
| Indexed candidates (Tier 1 + 2 with ≥ 1 question) | 4,562 | 4,558 | −4 |
| Positional median, 324 draw | 0.192 | 0.206 | +0.014 |
| Positional median, 803 draw | 0.205 | 0.247 | +0.042 |
| Positional median, size-matched folds | 0.208 | 0.249 | +0.041 |
| Positional median, indexed all-pairs | 0.303 | 0.312 | +0.009 |
| Positional median, full corpus | 0.711 | 0.711 | 0.000 |
| Lexical median, size-matched folds | 0.435 | 0.460 | +0.025 |
| Shared-word share, indexed | 0.159 | 0.173 | +0.014 |
| Shared-word share, prose only | 0.048 | 0.070 | +0.022 |
| Threshold (present fields) | 7 | none clears | — |
| Boundary bucket median | 0.197 | — | — |
| Indexed pages | 2,267 | 0 | −2,267 |
| Tier 1 below threshold | 449 | 1,478 | +1,029 |
| Tier 2 noindex (below threshold) | 1,846 | 3,080 | +1,234 |
| Tier 1 + Tier 2 firing no question | 1,665 | 1,664 | −1 |
| Harness fit (positional delta median) | 0.0, fit | 0.0, fit | — |

## Deferred, unchanged

Crawl text-to-HTML still needs rendered HTML and remains Gate 2 work, against the 8.3 % crawl and
0.07 % live baselines.

## Files

- `data/corpus-20k/gate1b/summary-v2.json` — every figure here, machine-readable
- `data/corpus-20k/gate1b/runs-v2/*/` — one directory per measured set: `summary.json`,
  `per-page.ndjson`, `above-target.ndjson`, `run.json`
- `data/corpus-20k/gate1b/matched-per-page-v2.json`, `matched-pooled-v2.json`,
  `buckets-matched-v2.json`, `threshold-v2.json`, `page-meta-v2.json`, `indexed-keys-v2.txt`
- `data/corpus-20k/gate1b/shared-content-v2.json` — the 5-gram attribution
- `data/corpus-20k/gate1b/sensitivity-nostanding-v2.json`,
  `sensitivity-no-evidence-age-v2.json` — the two sensitivities
- `data/corpus-20k/gate1b/validation-v2/validation.json` — the harness fit run
- `data/corpus-20k/render/v2/pages-*.ndjson` — harness inputs rebuilt from the re-rendered text
- `scripts/corpus-20k/overlap/gate1b_v2.py` — the driver (`build | folds | buckets | shared`)
