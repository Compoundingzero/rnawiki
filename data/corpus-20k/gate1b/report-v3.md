# Gate 1b — measurement v3 (Phase 2d)

**Run 2026-09-05 (Phase 2d).** Same harness, same definitions, same seeds, same derivation as
`gate1b_v2.py`: matched 803 and 324 draws, size-matched 803-page folds, the same bucket rule.
It supersedes `report-v2.md`; v1 and v2 stay on disk.

**What changed in the pages between v2 and v3.** Derived seed 15 (evidence age) no longer renders
as a block: its year and record are one sentence inside the human-data block's paragraph 2, and its
revealed row is the NCT and the completion date, with no `asOf` and no `yearsSince` label. Three
CLINICAL templates were added (label indication, registers-only, trial history), which gave a
question to 1,325 CLINICAL pages that fired none before. Four paragraph-2
fallbacks that were the same sentence on many pages were removed or given the page's own values.
The suppression classes were re-run over the pass-2 corpus with S1 narrowed to ATC N01A.

**Result: a threshold clears.** The rule selects **11 present fields** — bucket median
0.181, cumulative 0.173, both at or below 0.20 — for an indexed set of
**638 pages**. In v2 no count qualified at all. The size-matched pooled median is
0.2654, which is *above* v2's 0.2493, and the reason is measured below: it is not the
same set of pages.

## The one comparison that is like for like

v3 indexes 5,883 candidates against v2's 4,558, because the three CLINICAL templates give a first
question to thin pages that previously had none. A pooled median over a different set of pages is
not a before-and-after. Scoring the v3 render on exactly the 4,558 pages v2 measured:

| Set of pages | Pages | Positional median |
| --- | ---: | ---: |
| v2, as v2 measured them | 4,558 | 0.2493 |
| the same pages, v3 render | 4,558 | 0.2449 |
| of those, pages no CLINICAL template touches | 1,291 | **0.1907** |
| of those, pages that gained a CLINICAL block | 3,267 | 0.2500 |
| newly indexed by the three templates | 1,325 | 0.3774 |

Read plainly: **the evidence-age fix worked.** On pages the new templates never touch, the
positional median is 0.1907 — below the 0.20 target, and below v2's 0.2493 on the same
basis. What raises the pooled figure is the material the three CLINICAL templates add: the pages
they newly index are thin (median 2 present fields, 137 words) and score 0.3774, and the
blocks they add to pages that were already indexed move those from below target to 0.2500.

## Harness fit

Re-validated at the 803 draw of the v3 render, as R3 requires before any corpus-scale figure is
quoted: positional delta median 0.0, p90 0.049239, max 0.211266; lexical delta median
0.0. The rule is *unfit above 0.02 median delta*. **Fit.**

## Results per set

| Set | Pages | Positional median | p90 | > 0.20 | > 0.30 | Lexical median | Shared-word share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (a) indexed set, all-against-all | 5,883 | 0.357 | 0.613 | 4,925 | 3,638 | 0.534 | 0.180 |
| (a) indexed set, size-matched folds | 5,883 | 0.265 | 0.447 | 4,356 | 2,454 | 0.464 | 0.180 |
| (b) matched 803 draw | 803 | 0.245 | 0.447 | 536 | 308 | 0.459 | 0.180 |
| (b) matched 324 draw | 324 | 0.250 | 0.382 | 231 | 96 | 0.437 | 0.174 |
| (c) live baseline, 803 (carried forward) | 803 | 0.647 | 0.793 | 803 | 796 | 0.615 | 0.559 |
| (c) live baseline, 324 (carried forward) | 324 | 0.611 | 0.810 | 324 | 313 | 0.585 | 0.550 |
| full corpus, all pages | 28,943 | 0.711 | 0.800 | 28,026 | 26,464 | 0.681 | 0.330 |
| sensitivity: prose only | 5,883 | 0.356 | 0.686 | 4,759 | 3,746 | 0.569 | 0.046 |

**Corpus size.** The null model still prices the rise with candidate count: expected
nearest-neighbour positional is 0.374 at 324 draws, 0.423 at 803 and 0.485 at
5,883, against observed 0.250, 0.245 and 0.357. The pages stay more distinct than
size alone would produce. That is not the gate; the gate is the 0.20 size-matched target.

## The threshold rule

Present-field buckets on the size-matched basis. The rule: the smallest count whose own bucket
median and whose cumulative median are both at or below 0.20.

| Present fields | Pages | Positional median | p90 | Lexical median | Cumulative pages | Cumulative positional median |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 6 | 0.305 | 0.340 | 0.451 | 5,883 | 0.265 |
| 1 | 847 | 0.400 | 0.447 | 0.580 | 5,877 | 0.265 |
| 2 | 888 | 0.402 | 0.448 | 0.579 | 5,030 | 0.250 |
| 3 | 670 | 0.347 | 0.422 | 0.534 | 4,142 | 0.237 |
| 4 | 457 | 0.286 | 0.408 | 0.489 | 3,472 | 0.215 |
| 5 | 378 | 0.269 | 0.408 | 0.458 | 3,015 | 0.211 |
| 6 | 371 | 0.250 | 0.679 | 0.453 | 2,637 | 0.205 |
| 7 | 348 | 0.215 | 0.473 | 0.447 | 2,266 | 0.199 |
| 8 | 374 | 0.206 | 0.388 | 0.425 | 1,918 | 0.194 |
| 9 | 481 | 0.202 | 0.270 | 0.399 | 1,544 | 0.191 |
| 10 | 425 | 0.201 | 0.251 | 0.386 | 1,063 | 0.183 |
| **11** | 165 | 0.181 | 0.287 | 0.331 | 638 | 0.173 |
| 12 | 161 | 0.173 | 0.356 | 0.307 | 473 | 0.170 |
| 13 | 136 | 0.171 | 0.317 | 0.298 | 312 | 0.168 |
| 14 | 152 | 0.156 | 0.287 | 0.286 | 176 | 0.157 |
| 15 | 22 | 0.168 | 0.287 | 0.288 | 24 | 0.166 |
| 16 | 2 | 0.156 | 0.163 | 0.266 | 2 | 0.156 |

- **Threshold: 11 present fields.** Boundary bucket median 0.181; cumulative 0.173;
  cumulative lexical 0.303 (target 0.40).
- **Indexed: 638 pages** — Tier 1 617, Tier 2 21.
- Below the threshold: Tier 1 870, Tier 2 4,375 → noindex, reachable, promotable on more data.
- The cumulative-only threshold — the looser reading, cumulative median at or below 0.20 with no
  condition on the boundary bucket — is **7**, for 2,266 pages at cumulative
  0.199. That is v1's threshold and, to one page, v1's indexed count (2,267).
  Which reading governs is Felix's call, not this run's: the rule as written selects 11.

The indexed set is much smaller than v1's 2,267. That is the same finding as the table above,
read through the rule: the three CLINICAL templates add 1,325 thin candidates and add a block
to 3,267 more, and thin pages carrying a common block are what the bucket rule prunes.

## Standing sentences

Over the 5,883 indexed candidates, every sentence a page asserts in prose — the
question line and the two paragraphs, with the provenance anchor removed — counted once per page:

- **prose sentences on more than 5 % of indexed pages: 0.**
- 101,722 distinct prose sentences. The most repeated is
  `C.` on 214 pages (3.6 %) — a fragment the audit's
  sentence splitter cuts out of a verbatim source value, not a sentence any page asserts. The
  splitter is deliberately over-eager: it cuts at every full stop, so a run it reports is at worst
  shorter than the sentence a reader sees, never longer.
- Revealed-row labels are markup and are reported separately: 44 labels appear on more
  than 5 % of indexed pages, the most common being
  `completed` (63 %), `Trial` (62 %), `CA` (55 %), `phase2` (53 %), `phase3` (51 %), `phase1` (49 %).

Four standing sentences the v2 render carried were found by this audit and removed before the
measurement: `No later publication is recorded.` (the evidence-age block, now gone),
`The label records no other value.` (666 pages), `No study record accompanies it.` (378 pages) and
the provenance event list without its years (1,099 pages). Where a page has nothing of its own to
say in paragraph 2, no paragraph 2 is written.

## What the pages above target share

- above 0.20 (4,356 pages): 39.1 % mean of shared 5-grams from lines the template
  calls markup, 26.8 % from block prose and rows, 34.1 % from runs crossing a line
  boundary; median 3 present fields, 327 words.
- above 0.30 (2,454 pages): 32.1 % mean of shared 5-grams from lines the template
  calls markup, 31.9 % from block prose and rows, 36.0 % from runs crossing a line
  boundary; median 2 present fields, 189 words.
- the indexed set as a whole: median 5 present fields, 457 words.

## Questions

11,388 pages carry questions; 59,040 distinct strings; the most repeated string is on
0.21 % of pages (`What became of the other 61 compounds aimed at TUBB?`), far under the 30 % R7 limit.
Highest template share 30.1 % (trial-size), reported for information. Five-gram Jaccard between
the question sets of 2,000 random page pairs: 0.004498. Forbidden-word violations: 0.

## Diff against v1 and v2 — one table

| Measure | v1 (Phase 2b) | v2 (Phase 2c) | v3 (this run) | v2 → v3 |
| --- | ---: | ---: | ---: | ---: |
| Pages rendered | 28,966 | 28,943 | 28,943 | +0 |
| Indexed candidates (Tier 1 + 2 with >= 1 question) | 4,562 | 4,558 | 5,883 | +1,325 |
| Positional median, 324 draw | 0.192 | 0.206 | 0.250 | +0.044 |
| Positional median, 803 draw | 0.205 | 0.247 | 0.245 | -0.002 |
| Positional median, size-matched folds | 0.208 | 0.249 | 0.265 | +0.016 |
| Positional median, indexed all-pairs | 0.303 | 0.312 | 0.357 | +0.045 |
| Positional median, full corpus | 0.711 | 0.711 | 0.711 | +0.000 |
| Lexical median, size-matched folds | 0.435 | 0.460 | 0.464 | +0.004 |
| Shared-word share, indexed | 0.159 | 0.173 | 0.180 | +0.007 |
| Shared-word share, prose only | 0.048 | 0.070 | 0.046 | -0.024 |
| Threshold (present fields) | 7 | none clears | 11 | — |
| Boundary bucket median | 0.197 | none clears | 0.181 | — |
| Indexed pages | 2,267 | 0 | 638 | +638 |
| Tier 1 below threshold | 449 | 1,478 | 870 | -608 |
| Tier 2 below threshold | 1,846 | 3,080 | 4,375 | +1,295 |
| Pages with questions, corpus | 10,071 | 10,063 | 11,388 | +1,325 |
| Distinct question strings | 43,674 | 59,101 | 59,040 | -61 |
| Standing prose sentences over 5% of indexed pages | — | 3 | 0 | -3 |

## Deferred, unchanged

Crawl text-to-HTML still needs rendered HTML and remains Gate 2 work, against the 8.3 % crawl and
0.07 % live baselines.

## Files

- `data/corpus-20k/gate1b/summary-v3.json` — every figure here, machine-readable
- `data/corpus-20k/gate1b/runs-v3/*/` — one directory per measured set
- `data/corpus-20k/gate1b/matched-per-page-v3.json`, `matched-pooled-v3.json`,
  `buckets-matched-v3.json`, `threshold-v3.json`, `page-meta-v3.json`, `indexed-keys-v3.txt`
- `data/corpus-20k/gate1b/shared-content-v3.json` — the 5-gram attribution
- `data/corpus-20k/gate1b/validation-v3/validation.json` — the harness fit run
- `data/corpus-20k/render/text/standing-sentences.json` — the standing-sentence audit
- `data/corpus-20k/render/v3/pages-*.ndjson` — harness inputs built from the v3 render
- `scripts/corpus-20k/overlap/gate1b_v3.py` — the driver
