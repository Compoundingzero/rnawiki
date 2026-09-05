# Corpus 20k — final measurement against the live site (2026-09-05)

Every figure below was measured against `https://rnawiki.com` after Tier 3 landed, or read from
production PostgreSQL with read-only SQL. The extractor (`scripts/corpus-20k/gate2/extract.py`),
the scorer (`scripts/corpus-20k/overlap/measure.py`, seed 20260904, 128 permutations, 5-gram
shingles, exhaustive) and the size-matched folds (`scripts/corpus-20k/gate2/folds.py`,
fold size 324) are the same code Gate 1b and Gate 2 ran. Machine form: `summary.json`.

## What was fetched

| Set | URLs | 200 | Source |
| --- | ---: | ---: | --- |
| Dossier pages (draws ∪ indexed ∪ samples) | 1,592 | 1,592 | union of the seeded draws, `sitemaps/tier-1.xml` + `tier-2.xml`, the eight samples |
| Sitemap children, non-dossier | 1,853 | 1,853 | `sitemaps/browse.xml` (1,843), `sitemaps/pages.xml` (10) |
| Sitemap files | 9 | 9 | `sitemap.xml` and its four children |
| Tier 3 noindex check | 5 | 5 | random Tier 3 slugs |
| Merged-slug redirect check | 7 | 7 (6×308, 1×200) | keys merged by identity pass 3 |
| Sample pages, markup checks | 8 | 8 | the eight sample URLs |
| `robots.txt` | 1 | 1 | — |

Concurrency 4 throughout; 9.58 pages/second end to end on the dossier fetch. Every request is
appended to `data/corpus-20k/legal/requests.log` (14,510 → 17,985 lines).

## Uniqueness — positional nearest neighbour

| Set | Pages | Median | p90 | Above 0.20 | Null expectation |
| --- | ---: | ---: | ---: | ---: | ---: |
| Indexed set, size-matched (324-page folds) | 636 | **0.188** | 0.334 | 208 | 0.263 at 324 draws |
| Indexed set, all pairs | 636 | **0.196** | 0.577 | 277 | 0.363 at 636 draws |
| Indexed set, prose only (declared markup removed) | 636 | 0.105 | 0.418 | 108 | 0.278 |
| Seeded 803 draw (candidate population) | 798 | 0.300 | 0.511 | 769 | 0.486 |
| Seeded 803 draw, size-matched to 324 | 324 | 0.276 | 0.486 | — | 0.403 |
| Seeded 324 draw | 322 | 0.275 | 0.418 | 277 | 0.395 |

Target: median ≤ 0.20 on the indexed set (R3). Met at both the size-matched and the all-pairs
reading. The draws are the *candidate* population — mostly pages below the indexing threshold that
carry `noindex` — and sit where Gate 2 recorded them.

## Uniqueness — lexical nearest neighbour

| Set | Pages | Median | p90 | Null expectation |
| --- | ---: | ---: | ---: | ---: |
| Indexed set, size-matched | 636 | **0.353** | 0.456 | 0.426 at 324 draws |
| Indexed set, all pairs | 636 | **0.369** | 0.580 | 0.498 at 636 draws |
| Indexed set, prose only | 636 | 0.426 | 0.606 | 0.546 |
| Seeded 803 draw | 798 | 0.478 | 0.657 | 0.620 |
| Seeded 324 draw | 322 | 0.455 | 0.582 | 0.550 |

Target: ≤ 0.40 (R3). Met on the indexed set at both readings.

## Controls

| Control | Positional median | Reading |
| --- | ---: | --- |
| Indexed set as served | 0.196 | — |
| `control:other` — each page's text replaced with another page's | 0.562 | the scorer detects copied text |
| `control:self` — each page filled with more of its own text | 0.195 | length alone does not move the figure |
| Random pair, indexed set | 0.099 | the null floor |

## Shared-word share

Share of a page's word occurrences whose word appears on more than 90 % of the other pages in the
same set.

| Set | Median | p90 |
| --- | ---: | ---: |
| Indexed set, with markup rows | 0.431 | 0.504 |
| Indexed set, prose only (markup rows removed) | 0.369 | 0.411 |
| 604 like-for-like medicines, new pages | 0.207 | 0.303 |
| 604 like-for-like medicines, live baseline before | **0.796** | 0.902 |
| 251 like-for-like medicines, new pages | 0.194 | 0.294 |
| 251 like-for-like medicines, live baseline before | **0.786** | — |

## Like for like — the same medicines, before and after

The 604 medicines of the 803 draw that resolved on the live site before the corpus deployed, and
the 251 surviving medicines of the 252-medicine set from the 324 draw. Same extractor, same scorer.
"Before" is the recorded live baseline in `data/corpus-20k/gate2/report.md`.

| Measure | Before (604) | After (604) | Before (251) | After (251) |
| --- | ---: | ---: | ---: | ---: |
| Positional nearest neighbour, median | **0.799** | **0.278** | 0.786 | 0.263 |
| Positional p90 | 0.895 | 0.486 | 0.877 | 0.407 |
| Lexical nearest neighbour, median | 0.697 | 0.458 | 0.680 | 0.442 |
| Shared-word share, median | **0.796** | **0.207** | 0.786 | 0.194 |
| Median tokens per page | 6,800 | 716 | 7,174 | 700 |

## Text density

Crawl figure: visible characters of the whole document ÷ HTML bytes. Baseline 8.3 %.

| Set | Median | Min | Max |
| --- | ---: | ---: | ---: |
| Indexed set (636), live | **10.65 %** | 7.42 % | 13.70 % |
| Indexed set (636), pre-deploy build | 10.90 % | 7.66 % | 13.96 % |
| All 1,592 fetched dossiers | 9.06 % | — | — |
| Tier 1 pages fetched (805) | 10.30 % | — | — |
| Tier 2 pages fetched (785) | 7.36 % | — | — |
| Indexed set, reading column only | 9.10 % | — | — |

The pre-deploy-to-live drop is the Phase 5d JSON-LD block: more bytes, no extra visible text.

## Production — pages by tier and model

| Tier | LONGEVITY | CLINICAL | DEVELOPMENT | Total |
| --- | ---: | ---: | ---: | ---: |
| Tier 1 | 1,109 | 610 | 0 | 1,719 |
| Tier 2 | 0 | 4,477 | 0 | 4,477 |
| Tier 3 | 0 | 0 | 22,636 | 22,636 |
| **Total** | **1,109** | **5,087** | **22,636** | **28,832** |

| Page type | Pages |
| --- | ---: |
| longevity | 1,109 |
| withdrawn | 610 |
| clinical | 4,477 |
| development | 5,466 |
| stub | 17,170 |

## Production — indexing, suppression, withdrawal

| Figure | Tier 1 | Tier 2 | Tier 3 | Total |
| --- | ---: | ---: | ---: | ---: |
| Pages | 1,719 | 4,477 | 22,636 | 28,832 |
| Indexable | 610 | 26 | 0 | **636** |
| Suppressed | 755 | 1,062 | 17,451 | **19,268** |
| Not suppressed | 964 | 3,415 | 5,185 | 9,564 |
| Withdrawn | 663 | 0 | 0 | **663** |

| Check | Result |
| --- | --- |
| Indexable rows in the database | 636 |
| URLs in `tier-1.xml` + `tier-2.xml` | 636 |
| In the sitemap but not indexable, or indexable but not in the sitemap | 0 / 0 |
| Withdrawn pages inside the indexed set | 34 |
| `medicine_slug_redirects` rows | 870 |
| Migrations applied | 26 |
| Legacy `drugs` rows | 9,859 |

## Production — derived sections fired per seed

`page_seeds` rows. Seeds 1 (bioavailability gap) and 11 (animal-only ceiling) have no row anywhere;
seed 7 (sex-specific divergence) keeps 36 stored rows but renders no question.

| Seed | Section | All pages | Indexable pages |
| ---: | --- | ---: | ---: |
| 2 | N-of-1 designability | 600 | 333 |
| 3 | Failure autopsy | 2,771 | 537 |
| 4 | Endpoint mismatch | 1,054 | 603 |
| 5 | Stack interaction graph | 575 | 28 |
| 6 | Time-to-signal | 2 | 1 |
| 7 | Sex-specific divergence (discarded; renders nothing) | 36 | 27 |
| 8 | Evidence provenance timeline | 2,574 | 473 |
| 9 | What would change this | 890 | 258 |
| 10 | Source contradiction | 191 | 12 |
| 12 | Registry-to-publication gap | 6,086 | 626 |
| 13 | Same-target lineage | 2,164 | 0 |
| 14 | Spontaneous-report disproportion | 969 | 33 |
| 15 | Evidence age (rendered inside human-data) | 7,257 | 634 |
| 16 | Trial size ceiling | 8,615 | 636 |
| 17 | Jurisdiction divergence | 182 | 63 |

Rendered question blocks are a different quantity: 38 distinct blocks render on production, several
of them derived from fields rather than from a seed row.

| Block on indexable pages | Pages | Block | Pages |
| --- | ---: | --- | ---: |
| trial-size | 636 | interactions | 256 |
| unreported | 626 | dose-shape | 170 |
| human-data | 603 | clocks | 84 |
| ladder | 603 | jurisdiction | 63 |
| stopped | 595 | trial-history | 33 |
| biomarkers | 582 | indication | 33 |
| ongoing | 573 | faers-unlisted | 33 |
| dose-studied | 543 | itp | 27 |
| faers | 526 | contradiction | 12 |
| pathway | 492 | classification | 7 |
| provenance | 473 | withdrawn | 5 |
| fasting-exercise | 415 | time-to-signal | 1 |
| n-of-1 | 325 | — | — |
| supervision | 287 | — | — |
| kinetics | 282 | — | — |
| what-would-settle | 258 | — | — |

## Production — question strings (R7)

| Population | Pages | Question rows | Distinct strings | Most-repeated string | Share of pages | Limit |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Indexable pages | 636 | 8,543 | 8,464 | 2 pages | **0.31 %** | 30 % |
| Whole corpus | 11,313 | 60,667 | 58,525 | 62 pages | 0.55 % | — |

The most-repeated indexed string is a stopped-trial question that two pages sharing a display name
both carry. The corpus-wide leader is a same-target lineage question naming one protein target.

## Production — suppression safety

| Check | Result |
| --- | ---: |
| Suppressed pages holding a seed 1, 2 or 6 row | 0 |
| Suppressed pages rendering an n-of-1, time-to-signal or bioavailability block | 0 |
| S10-only pages rendering a supervision block | 0 |
| S10-only pages rendering a classification block instead | 4,620 |

## Load throughput per tier

Wall clock of the whole loader command against production PostgreSQL, from
`data/corpus-20k/deploy/tier-*.json`. Deployment-plan floor: 1 page/second.

| Tier | Pages | Batches | Seconds | Pages/second | Headroom |
| --- | ---: | ---: | ---: | ---: | ---: |
| Tier 1 | 1,719 | 7 | 117.4 | **14.64** | 14.6× |
| Tier 2 | 4,477 | 18 | 194.0 | **23.08** | 23.1× |
| Tier 3 | 22,636 | 91 | 535.0 | **42.31** | 42.3× |

No separate server render rate was timed; the live fetch of 1,592 dossier pages at 4 concurrent ran
at 9.58 pages/second.

## Tier 3 noindex verification

Five Tier 3 slugs drawn by `md5(key || 'measure-final')` order from production.

| URL | Status | `meta robots` | In any sitemap child |
| --- | ---: | --- | ---: |
| `/d/opicinumab` | 200 | `noindex, follow` | 0 |
| `/d/azintamide` | 200 | `noindex, follow` | 0 |
| `/d/rocastine` | 200 | `noindex, follow` | 0 |
| `/d/sovaprevir` | 200 | `noindex, follow` | 0 |
| `/d/eniporide` | 200 | `noindex, follow` | 0 |

`robots.txt` disallows only `/api/` and `/healthz`, so Tier 3 stays crawlable and unindexed as R6
requires.

## The eight sample pages

| Role | URL | Tier | Model | Indexable | Fields | Questions | HTML bytes | Visible chars | Crawl | JSON-LD | noindex |
| --- | --- | ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Data-rich Tier 1 | `https://rnawiki.com/d/metformin` | 1 | LONGEVITY | yes | 16 | 17 | 246,491 | 30,817 | 12.50 % | yes | no |
| Mid Tier 1 | `https://rnawiki.com/d/cysteamine` | 1 | LONGEVITY | yes | 11 | 14 | 133,122 | 13,643 | 10.25 % | yes | no |
| Withdrawn arc | `https://rnawiki.com/d/rofecoxib` | 1 | LONGEVITY | yes | 11 | 11 | 121,451 | 10,039 | 8.27 % | yes | no |
| Suppression class (S1, S3, S4, S6) | `https://rnawiki.com/d/sirolimus` | 1 | LONGEVITY | yes | 16 | 18 | 259,299 | 33,942 | 13.09 % | yes | no |
| Formerly-withdrawn control | `https://rnawiki.com/d/amlodipine` | 1 | LONGEVITY | yes | 14 | 16 | 200,241 | 22,673 | 11.32 % | yes | no |
| Tier 2 standard | `https://rnawiki.com/d/carbidopa-levodopa` | 2 | CLINICAL | no | 5 | 8 | 77,936 | 6,677 | 8.57 % | no | yes |
| Tier 3 experimental | `https://rnawiki.com/d/cdx-3379` | 3 | DEVELOPMENT | no | 7 | 6 | 57,733 | 3,839 | 6.65 % | no | yes |
| Tier 3 near-empty stub | `https://rnawiki.com/d/1-2-distearoyl-sn-glycero-3-phosphocholine` | 3 | DEVELOPMENT | no | 1 | 0 | 28,445 | 1,431 | 5.03 % | no | yes |

Every sample serves exactly one `<main>` and one `<h1>`. JSON-LD is present on every indexable
sample and absent from every `noindex` one, which is the Phase 5d fix holding on the live site.

## Binding thresholds

| Requirement | Target | Measured | Result |
| --- | --- | ---: | --- |
| R3 positional uniqueness, indexed set | median ≤ 0.20 | 0.188 size-matched, 0.196 all pairs | pass |
| R3 lexical uniqueness, indexed set | median ≤ 0.40 | 0.353 size-matched, 0.369 all pairs | pass |
| R7 most-repeated question string | ≤ 30 % of indexed pages | 0.31 % | pass |
| R6 Tier 3 noindex, out of sitemaps, not disallowed | all three | 5 of 5, 0 in sitemaps, robots allows | pass |
| R8 no previously indexed slug without 200/301/308 | 0 failures | 0 of 1,599 dossier URLs, 0 of 1,853 sitemap URLs | pass |
| R13 load throughput | ≥ 1 page/second | 14.6 / 23.1 / 42.3 | pass |
| Suppressed page rendering a seed 1/2/6 block | 0 | 0 | pass |

## Issues carried out of this measurement

| # | Issue |
| ---: | --- |
| 1 | Seven of the 1,127 draw keys no longer exist — identity pass 3 merged them after Gate 1b drew the samples. The 803 draw measures 798 pages, the 324 draw 322, the like-for-like second set 251 rather than 252. Six old slugs answer 308 to the merged parent and `inclisiran` answers 200 under a new key, so no indexed URL was orphaned. |
| 2 | `measure.py --sample` truncates a page key at its first comma, silently dropping COMBO keys (10 of 798, 7 of 604, 3 of 636 on a first pass). Worked around by writing one NDJSON per set, as Gate 2 did; the scorer was not edited mid-measurement. Fix before the next run. |
| 3 | The live indexed figures reproduce the pre-deploy Gate 2 recheck to six decimal places; mean and max differ in the fifth decimal, so one or two pages differ slightly. The deployed pages' visible text is otherwise the text Gate 2 measured. |
| 4 | Crawl text-to-HTML on the same 636 pages fell 10.90 % → 10.65 % because the Phase 5d JSON-LD block adds bytes and no visible text. |
| 5 | The indexed set's all-pairs positional p90 is 0.577 and 277 of 636 pages sit above 0.20. R3 binds the median; the tail is the display-name and target-lineage pairs Gate 2 already recorded. |
| 6 | Production suppressed is 19,268 of 28,832. `data/corpus-20k/suppression/summary.json` records 19,335 of 28,943 — a pre-pass-3 population, not the same set. |
| 7 | `page_seeds` holds no seed 1 or seed 11 row anywhere, and no seed 13 row on any indexable page. Seed 7 keeps 36 stored rows after the Phase 5a decision to discard it but renders nothing: 0 of 60,667 question strings name a sex. Bookkeeping, not page content. |
| 8 | Tier 2 contributes 26 of the 636 indexed pages, so the 7–10 present-field promotion band recorded in Phase 5a has not been exercised. |

## Files

| Path | What | In the repository |
| --- | --- | --- |
| `data/corpus-20k/final/summary.json` | every figure above, machine-readable | yes |
| `data/corpus-20k/final/report.md` | this report | yes |
| `data/corpus-20k/final/lists/*.txt` | the key list of each measured set | yes |
| `data/corpus-20k/final/runs/*/summary.json`, `run.json`, `per-page.ndjson`, `above-target.ndjson` | scorer output per set | yes |
| `data/corpus-20k/legal/requests.log` | every request made by this stage | yes |
| `data/corpus-20k/final/html-text/live-dossiers.ndjson` | extracted visible text of 1,592 live dossier pages (18 MB) | workstation only |
| `data/corpus-20k/final/pages/*.ndjson` | one page file per measured set (42 MB) | workstation only |
| `data/corpus-20k/final/runs/*/pages.duckdb`, `control-*.duckdb` | scorer stores (122 MB) | workstation only |

The large artifacts stay on the workstation under the Phase 5c decision that corpus data is not
pushed to GitHub.
