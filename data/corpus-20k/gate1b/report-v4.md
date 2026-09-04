# Gate 1b — measurement v4 (Phase 2d)

**Run 2026-09-05 (Phase 2d).** Same harness, same definitions, same seeds, same derivation as
`gate1b_v2.py`: matched 803 and 324 draws, size-matched 803-page folds, the same bucket rule.
It supersedes `report-v2.md`; v1 and v2 stay on disk.

**What changed in the pages between v3 and v4.** Three Phase 5a data fixes, no template change.
The withdrawn rule was narrowed so that a register's 'no remaining entry' reading sets the flag
only when no other register still records an active, approved or marketed entry (438 -> 668 pages
withdrawn; amlodipine is no longer withdrawn), which moves pages into Tier 1. Identity pass 3
merged 111 salt-named structureless records into their parent moiety (28,943 -> 28,832 pages).
The loader and the renderer now read doseStudied and approvalDate from the same place, so the
present-field count that decides indexing is one number, not two.

**Result: a threshold clears.** The rule selects **10 present fields** — bucket median
0.188, cumulative 0.174, both at or below 0.20 — for an indexed set of
**1,057 pages**. In v2 no count qualified at all. The size-matched pooled median is
0.2900, which is *above* v2's 0.2493, and the reason is measured below: it is not the
same set of pages.

## The one comparison that is like for like

v4 indexes 5,858 candidates against v2's 4,511. A pooled median over a different set of
pages is not a before-and-after, so the v4 render is also scored on exactly the pages v2 measured:

| Set of pages | Pages | Positional median |
| --- | ---: | ---: |
| v2, as v2 measured them | 4,511 | 0.2493 |
| the same pages, v4 render | 4,511 | 0.2600 |
| of those, pages no CLINICAL template touches | 1,287 | **0.1809** |
| of those, pages that gained a CLINICAL block | 3,224 | 0.2727 |
| newly indexed by the three templates | 1,347 | 0.3816 |

Read plainly: **the evidence-age fix worked.** On pages the new templates never touch, the
positional median is 0.1809 — below the 0.20 target, and below v2's 0.2493 on the same
basis. What raises the pooled figure is the material the three CLINICAL templates add: the pages
they newly index are thin (median 2 present fields, 169 words) and score 0.3816, and the
blocks they add to pages that were already indexed move those from below target to 0.2727.

## Harness fit

Re-validated at the 803 draw of the v4 render, as R3 requires before any corpus-scale figure is
quoted: positional delta median 0.0, p90 0.021641, max 0.193391; lexical delta median
0.0. The rule is *unfit above 0.02 median delta*. **Fit.**

## Results per set

| Set | Pages | Positional median | p90 | > 0.20 | > 0.30 | Lexical median | Shared-word share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| (a) indexed set, all-against-all | 5,858 | 0.368 | 0.635 | 5,004 | 3,698 | 0.514 | 0.147 |
| (a) indexed set, size-matched folds | 5,858 | 0.290 | 0.453 | 4,210 | 2,795 | 0.448 | 0.147 |
| (b) matched 803 draw | 803 | 0.270 | 0.449 | 484 | 377 | 0.450 | 0.151 |
| (b) matched 324 draw | 324 | 0.290 | 0.422 | 238 | 147 | 0.426 | 0.145 |
| (c) live baseline, 803 (carried forward) | 803 | 0.647 | 0.793 | 803 | 796 | 0.615 | 0.559 |
| (c) live baseline, 324 (carried forward) | 324 | 0.611 | 0.810 | 324 | 313 | 0.585 | 0.550 |
| full corpus, all pages | 28,832 | 0.711 | 0.800 | 27,964 | 26,313 | 0.675 | 0.330 |
| sensitivity: prose only | 5,858 | 0.356 | 0.737 | 4,596 | 3,565 | 0.552 | 0.033 |

**Corpus size.** The null model still prices the rise with candidate count: expected
nearest-neighbour positional is 0.384 at 324 draws, 0.432 at 803 and 0.621 at
5,858, against observed 0.290, 0.270 and 0.368. The pages stay more distinct than
size alone would produce. That is not the gate; the gate is the 0.20 size-matched target.

## The threshold rule

Present-field buckets on the size-matched basis. The rule: the smallest count whose own bucket
median and whose cumulative median are both at or below 0.20.

| Present fields | Pages | Positional median | p90 | Lexical median | Cumulative pages | Cumulative positional median |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 8 | 0.296 | 0.342 | 0.435 | 5,858 | 0.290 |
| 1 | 859 | 0.404 | 0.461 | 0.554 | 5,850 | 0.290 |
| 2 | 889 | 0.382 | 0.461 | 0.539 | 4,991 | 0.270 |
| 3 | 667 | 0.370 | 0.421 | 0.503 | 4,102 | 0.256 |
| 4 | 452 | 0.323 | 0.421 | 0.469 | 3,435 | 0.231 |
| 5 | 371 | 0.316 | 0.410 | 0.436 | 2,983 | 0.210 |
| 6 | 363 | 0.288 | 0.610 | 0.431 | 2,612 | 0.202 |
| 7 | 339 | 0.256 | 0.520 | 0.426 | 2,249 | 0.191 |
| 8 | 369 | 0.219 | 0.409 | 0.410 | 1,910 | 0.184 |
| 9 | 484 | 0.207 | 0.330 | 0.387 | 1,541 | 0.181 |
| **10** | 421 | 0.188 | 0.290 | 0.374 | 1,057 | 0.174 |
| 11 | 164 | 0.172 | 0.328 | 0.323 | 636 | 0.158 |
| 12 | 159 | 0.170 | 0.310 | 0.303 | 472 | 0.151 |
| 13 | 137 | 0.151 | 0.300 | 0.297 | 313 | 0.146 |
| 14 | 151 | 0.144 | 0.290 | 0.287 | 176 | 0.143 |
| 15 | 23 | 0.135 | 0.174 | 0.271 | 25 | 0.135 |
| 16 | 2 | 0.133 | 0.154 | 0.249 | 2 | 0.133 |

- **Threshold: 10 present fields.** Boundary bucket median 0.188; cumulative 0.174;
  cumulative lexical 0.326 (target 0.40).
- **Indexed: 1,057 pages** — Tier 1 719, Tier 2 338.
- Below the threshold: Tier 1 986, Tier 2 3,815 → noindex, reachable, promotable on more data.
- The cumulative-only threshold — the looser reading, cumulative median at or below 0.20 with no
  condition on the boundary bucket — is **7**, for 2,249 pages at cumulative
  0.191. That is v1's threshold and, to one page, v1's indexed count (2,267).
  Which reading governs is Felix's call, not this run's: the rule as written selects 10.

The indexed set is much smaller than v1's 2,267. That is the same finding as the table above,
read through the rule: the three CLINICAL templates add 1,325 thin candidates and add a block
to 3,267 more, and thin pages carrying a common block are what the bucket rule prunes.

## Standing sentences

Over the 5,858 indexed candidates, every sentence a page asserts in prose — the
question line and the two paragraphs, with the provenance anchor removed — counted once per page:

- **prose sentences on more than 5 % of indexed pages: 0.**
- 98,518 distinct prose sentences. The most repeated is
  `C.` on 214 pages (3.7 %) — a fragment the audit's
  sentence splitter cuts out of a verbatim source value, not a sentence any page asserts. The
  splitter is deliberately over-eager: it cuts at every full stop, so a run it reports is at worst
  shorter than the sentence a reader sees, never longer.
- Revealed-row labels are markup and are reported separately: 45 labels appear on more
  than 5 % of indexed pages, the most common being
  `US` (72 %), `CA` (71 %), `EU` (68 %), `completed` (63 %), `Trial` (62 %), `phase2` (53 %).

Four standing sentences the v2 render carried were found by this audit and removed before the
measurement: `No later publication is recorded.` (the evidence-age block, now gone),
`The label records no other value.` (666 pages), `No study record accompanies it.` (378 pages) and
the provenance event list without its years (1,099 pages). Where a page has nothing of its own to
say in paragraph 2, no paragraph 2 is written.

## What the pages above target share

- above 0.20 (4,210 pages): 38.2 % mean of shared 5-grams from lines the template
  calls markup, 21.3 % from block prose and rows, 40.5 % from runs crossing a line
  boundary; median 3 present fields, 368 words.
- above 0.30 (2,795 pages): 34.7 % mean of shared 5-grams from lines the template
  calls markup, 23.1 % from block prose and rows, 42.2 % from runs crossing a line
  boundary; median 3 present fields, 292 words.
- the indexed set as a whole: median 5 present fields, 500 words.

## Questions

11,313 pages carry questions; 58,525 distinct strings; the most repeated string is on
0.21 % of pages (`What became of the other 61 compounds aimed at TUBB?`), far under the 30 % R7 limit.
Highest template share 29.9 % (trial-size), reported for information. Five-gram Jaccard between
the question sets of 2,000 random page pairs: 0.002746. Forbidden-word violations: 0.

## Diff against v1 and v2 — one table

| Measure | v1 (Phase 2b) | v2 (Phase 2c) | v4 (this run) | v2 → v4 |
| --- | ---: | ---: | ---: | ---: |
| Pages rendered | 28,966 | 28,943 | 28,832 | -111 |
| Indexed candidates (Tier 1 + 2 with >= 1 question) | 4,562 | 4,558 | 5,858 | +1,300 |
| Positional median, 324 draw | 0.192 | 0.206 | 0.290 | +0.084 |
| Positional median, 803 draw | 0.205 | 0.247 | 0.270 | +0.023 |
| Positional median, size-matched folds | 0.208 | 0.249 | 0.290 | +0.041 |
| Positional median, indexed all-pairs | 0.303 | 0.312 | 0.368 | +0.056 |
| Positional median, full corpus | 0.711 | 0.711 | 0.711 | +0.000 |
| Lexical median, size-matched folds | 0.435 | 0.460 | 0.448 | -0.012 |
| Shared-word share, indexed | 0.159 | 0.173 | 0.147 | -0.026 |
| Shared-word share, prose only | 0.048 | 0.070 | 0.033 | -0.037 |
| Threshold (present fields) | 7 | none clears | 10 | — |
| Boundary bucket median | 0.197 | none clears | 0.188 | — |
| Indexed pages | 2,267 | 0 | 1,057 | +1,057 |
| Tier 1 below threshold | 449 | 1,478 | 986 | -492 |
| Tier 2 below threshold | 1,846 | 3,080 | 3,815 | +735 |
| Pages with questions, corpus | 10,071 | 10,063 | 11,313 | +1,250 |
| Distinct question strings | 43,674 | 59,101 | 58,525 | -576 |
| Standing prose sentences over 5% of indexed pages | — | 3 | 0 | -3 |

## Deferred, unchanged

Crawl text-to-HTML still needs rendered HTML and remains Gate 2 work, against the 8.3 % crawl and
0.07 % live baselines.

## Files

- `data/corpus-20k/gate1b/summary-v4.json` — every figure here, machine-readable
- `data/corpus-20k/gate1b/runs-v4/*/` — one directory per measured set
- `data/corpus-20k/gate1b/matched-per-page-v4.json`, `matched-pooled-v4.json`,
  `buckets-matched-v4.json`, `threshold-v4.json`, `page-meta-v4.json`, `indexed-keys-v4.txt`
- `data/corpus-20k/gate1b/shared-content-v4.json` — the 5-gram attribution
- `data/corpus-20k/gate1b/validation-v4/validation.json` — the harness fit run
- `data/corpus-20k/render/text/standing-sentences.json` — the standing-sentence audit
- `data/corpus-20k/render/v4/pages-*.ndjson` — harness inputs built from the v4 render
- `scripts/corpus-20k/overlap/gate1b_v4.py` — the driver
