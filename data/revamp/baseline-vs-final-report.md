# Baseline 0.3 against the corpus-20k FINAL REPORT

Measured 2026-09-05 against https://rnawiki.com with the corpus-20k scripts unchanged.
Baseline figures: `data/revamp/baseline.json`. FINAL REPORT: `docs/worklogs/corpus-20k.md`,
machine form `data/corpus-20k/final/summary.json`.

| Figure | FINAL REPORT | Baseline 0.3 | Verdict | Stated in |
| --- | ---: | ---: | --- | --- |
| Positional, seeded 803 draw (798 pages) | 0.300000 | 0.300000 | match | data/corpus-20k/final/report.md, cited by the FINAL REPORT |
| Positional, 803 draw size-matched to 324 | 0.275916 | 0.275916 | match | data/corpus-20k/final/report.md, cited by the FINAL REPORT |
| Positional, seeded 324 draw (322 pages) | 0.275490 | 0.275490 | match | data/corpus-20k/final/report.md, cited by the FINAL REPORT |
| Positional, like-for-like 604 medicines | 0.277962 | 0.277962 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Positional, like-for-like 251 medicines | 0.263006 | 0.263006 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Positional, indexed set, size-matched | 0.188161 | 0.188161 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Positional, indexed set, all pairs | 0.195831 | 0.195831 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Positional, indexed set, prose only | 0.104789 | 0.104789 | match | data/corpus-20k/final/report.md, cited by the FINAL REPORT |
| Positional p90, indexed set, all pairs | 0.576669 | 0.576669 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Lexical, seeded 803 draw | 0.478208 | 0.478208 | match | data/corpus-20k/final/report.md, cited by the FINAL REPORT |
| Lexical, seeded 324 draw | 0.454566 | 0.454566 | match | data/corpus-20k/final/report.md, cited by the FINAL REPORT |
| Lexical, indexed set, size-matched | 0.352953 | 0.352953 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Lexical, indexed set, all pairs | 0.368746 | 0.368746 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Lexical, indexed set, prose only | 0.425715 | 0.425715 | match | data/corpus-20k/final/report.md, cited by the FINAL REPORT |
| Shared-word share, 604 medicines | 0.206851 | 0.206851 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Shared-word share, 251 medicines | 0.194226 | 0.194226 | match | data/corpus-20k/final/report.md, cited by the FINAL REPORT |
| Shared-word share, indexed with markup rows | 0.430757 | 0.430757 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Shared-word share, indexed prose only | 0.369318 | 0.369318 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Crawl text-to-HTML, indexed median | 0.106490 | 0.106490 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Crawl text-to-HTML, all 1,592 fetched | 0.090550 | 0.090550 | match | data/corpus-20k/final/report.md, cited by the FINAL REPORT |
| Control: other page's text | 0.562496 | 0.562496 | match | data/corpus-20k/final/report.md, cited by the FINAL REPORT |
| Control: more of the page's own text | 0.195271 | 0.195271 | match | data/corpus-20k/final/report.md, cited by the FINAL REPORT |
| Null expectation, positional, 636 pages | 0.362602 | 0.362602 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Pages, Tier 1 | 1,719 | 1,719 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Pages, Tier 2 | 4,477 | 4,477 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Pages, Tier 3 | 22,636 | 22,636 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Indexed, Tier 1 (live sitemap) | 610 | 610 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Indexed, Tier 2 (live sitemap) | 26 | 26 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Indexed, Tier 3 (live sitemap) | 0 | 0 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Indexable rows in the database | 636 | 636 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Suppressed, Tier 1 | 755 | 755 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Suppressed, Tier 2 | 1,062 | 1,062 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Suppressed, Tier 3 | 17,451 | 17,451 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Withdrawn pages | 663 | 663 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Redirect rows | 870 | 870 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Migrations applied | 26 | 26 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Legacy drugs rows | 9,859 | 9,859 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Pages above 0.20 positional, indexed all pairs | 277 | 277 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Pages fetched 200 | 1,592 | 1,592 | match | data/corpus-20k/final/report.md, cited by the FINAL REPORT |
| Seed 2 fires, corpus-wide | 600 | 600 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 3 fires, corpus-wide | 2,771 | 2,771 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 4 fires, corpus-wide | 1,054 | 1,054 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 5 fires, corpus-wide | 575 | 575 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 6 fires, corpus-wide | 2 | 2 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 7 fires, corpus-wide | 36 | 36 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 8 fires, corpus-wide | 2,574 | 2,574 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 9 fires, corpus-wide | 890 | 890 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 10 fires, corpus-wide | 191 | 191 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 12 fires, corpus-wide | 6,086 | 6,086 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 13 fires, corpus-wide | 2,164 | 2,164 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 14 fires, corpus-wide | 969 | 969 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 15 fires, corpus-wide | 7,257 | 7,257 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 16 fires, corpus-wide | 8,615 | 8,615 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 17 fires, corpus-wide | 182 | 182 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 2 fires, indexable | 333 | 333 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 3 fires, indexable | 537 | 537 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 4 fires, indexable | 603 | 603 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 5 fires, indexable | 28 | 28 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 6 fires, indexable | 1 | 1 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 7 fires, indexable | 27 | 27 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 8 fires, indexable | 473 | 473 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 9 fires, indexable | 258 | 258 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 10 fires, indexable | 12 | 12 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 12 fires, indexable | 626 | 626 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 14 fires, indexable | 33 | 33 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 15 fires, indexable | 634 | 634 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 16 fires, indexable | 636 | 636 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Seed 17 fires, indexable | 63 | 63 | match | docs/worklogs/corpus-20k.md FINAL REPORT |
| Live text-to-HTML, samples (range) | 0.033-0.055 | 0.033-0.055 | match | docs/worklogs/corpus-20k.md FINAL REPORT |

69 of 69 figures reproduce; 0 differ beyond rounding.

## Notes recorded rather than silently carried

- **Live text-to-HTML (innerText/outerHTML), samples.** The FINAL REPORT states 3.3-5.5 %. The artefact behind that band is data/corpus-20k/gate2/browser-checks-v2.json, a Phase 5a run of the same script against http://localhost:3111 over seven samples (rofecoxib absent, amlodipine in its place), not against the live site. This baseline runs the same script unchanged against https://rnawiki.com over all eight samples: the range over both viewport widths is 0.033-0.055, the same band; read at desktop width alone it is 0.038-0.055 with a median of 0.0455. The live band therefore confirms the reported one and supplies the per-sample live figures the report did not hold.
- **Positional median, 803 and 324 draw rows of the FINAL REPORT before/after table.** The FINAL REPORT's before/after table labels its two positional rows '803 draw (798 pages after merges)' 0.799 -> 0.278 and '324 draw (322)' 0.786 -> 0.263. Those after values are the like-for-like sets of data/corpus-20k/final/report.md - the 604 medicines (0.277962) and the 251 medicines (0.263006) that resolved on the live site before the corpus deployed - not the seeded draws themselves, which measure 0.300 (798 pages) and 0.275 (322 pages). This baseline reproduces all four figures and records them separately so the Phase 1 comparison cannot conflate them.
