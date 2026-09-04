# Coverage report — Phase 2 (R4, R11, R15), re-measured after the Phase 2b augment

| Item | Value |
| --- | --- |
| Generated | 2026-09-05 |
| Spec | `docs/specs/field-models.md` |
| Inputs | `fields/{longevity,clinical,development}/batch-*.ndjson`, `tiers/model-assignment.ndjson`, `suppression/assignments.ndjson` |
| Machine form | `data/corpus-20k/fields/coverage-summary.json` |
| Tier rule | `data/corpus-20k/tiers/promotion-rule.md` |
| Pages counted | 28,832 |
| Counting rule | within one model only; `present` counts, denominator is the applicable fields of that model on that page |

## Gate 1 figure, re-measured

| Figure | Value | Threshold | Meets |
| --- | ---: | ---: | --- |
| Tier 1 (LONGEVITY model) median present fields of 15 | 10 | ≥ 8 | yes |

## Per model

| Model | Pages | Fields | Median present | Mean present | Median applicable | Mean applicable | Mean present ÷ applicable |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| LONGEVITY | 1,109 | 15 | 10 | 9.666 | 15 | 14.985 | 64.5% |
| CLINICAL | 5,087 | 9 | 3 | 3.399 | 9 | 8.525 | 39.3% |
| DEVELOPMENT | 22,636 | 8 | 2 | 2.113 | 7 | 6.475 | 32.5% |

## LONGEVITY (15 fields) — per field

| Field | Present | Absent | Not applicable | Present % of applicable |
| --- | ---: | ---: | ---: | ---: |
| 1 Hallmark of aging | 545 | 564 | 0 | 49.1% |
| 2 Model-organism ladder | 1,080 | 29 | 0 | 97.4% |
| 3 NIA ITP | 51 | 1,058 | 0 | 4.6% |
| 4 Endpoint type per finding | 1,081 | 28 | 0 | 97.5% |
| 5 Human evidence ceiling | 1,058 | 51 | 0 | 95.4% |
| 6 Epigenetic clocks | 96 | 1,013 | 0 | 8.7% |
| 7 Dose-response shape | 775 | 334 | 0 | 69.9% |
| 8 Pathway | 677 | 432 | 0 | 61.0% |
| 9 Kinetics | 491 | 601 | 17 | 45.0% |
| 10 Interactions | 683 | 426 | 0 | 61.6% |
| 11 Trial failures | 813 | 296 | 0 | 73.3% |
| 12 Biomarkers measured | 1,002 | 107 | 0 | 90.4% |
| 13 Regulatory status by jurisdiction | 892 | 217 | 0 | 80.4% |
| 14 Ongoing trials | 861 | 248 | 0 | 77.6% |
| 15 FAERS signal | 615 | 494 | 0 | 55.5% |

## LONGEVITY (15 fields) — histogram of present-field counts

| Present fields | Pages | Share |
| ---: | ---: | ---: |
| 0 | 4 | 0.4% |
| 1 | 15 | 1.4% |
| 2 | 7 | 0.6% |
| 3 | 7 | 0.6% |
| 4 | 25 | 2.3% |
| 5 | 36 | 3.2% |
| 6 | 85 | 7.7% |
| 7 | 70 | 6.3% |
| 8 | 87 | 7.8% |
| 9 | 113 | 10.2% |
| 10 | 140 | 12.6% |
| 11 | 173 | 15.6% |
| 12 | 164 | 14.8% |
| 13 | 158 | 14.2% |
| 14 | 23 | 2.1% |
| 15 | 2 | 0.2% |
| **Total** | **1,109** | **100.0%** |

## CLINICAL (9 fields) — per field

| Field | Present | Absent | Not applicable | Present % of applicable |
| --- | ---: | ---: | ---: | ---: |
| Indication (label) | 2,422 | 2,061 | 604 | 54.0% |
| Label kinetics | 1,240 | 3,243 | 604 | 27.7% |
| 10 Interactions | 695 | 3,788 | 604 | 15.5% |
| Adverse events | 1,445 | 3,038 | 604 | 32.2% |
| 15 FAERS signal | 1,805 | 3,282 | 0 | 35.5% |
| Trial history | 3,531 | 1,556 | 0 | 69.4% |
| 11 Trial failures | 1,823 | 3,264 | 0 | 35.8% |
| 13 Regulatory status by jurisdiction | 3,811 | 1,276 | 0 | 74.9% |
| Withdrawal status | 517 | 4,570 | 0 | 10.2% |

## CLINICAL (9 fields) — histogram of present-field counts

| Present fields | Pages | Share |
| ---: | ---: | ---: |
| 0 | 299 | 5.9% |
| 1 | 1,065 | 20.9% |
| 2 | 1,087 | 21.4% |
| 3 | 664 | 13.1% |
| 4 | 460 | 9.0% |
| 5 | 273 | 5.4% |
| 6 | 323 | 6.3% |
| 7 | 453 | 8.9% |
| 8 | 423 | 8.3% |
| 9 | 40 | 0.8% |
| **Total** | **5,087** | **100.0%** |

## DEVELOPMENT (8 fields) — per field

| Field | Present | Absent | Not applicable | Present % of applicable |
| --- | ---: | ---: | ---: | ---: |
| Molecular target | 2,452 | 16,213 | 3,971 | 13.1% |
| Mechanism class | 2,533 | 16,132 | 3,971 | 13.6% |
| Highest phase reached | 11,487 | 11,149 | 0 | 50.7% |
| Why development stopped | 1,811 | 20,825 | 0 | 8.0% |
| Sponsor | 4,736 | 17,900 | 0 | 20.9% |
| Patent status | 0 | 35 | 22,601 | 0.0% |
| Ever dosed in humans | 22,636 | 0 | 0 | 100.0% |
| Related compounds on the same target | 2,167 | 16,498 | 3,971 | 11.6% |

## DEVELOPMENT (8 fields) — histogram of present-field counts

| Present fields | Pages | Share |
| ---: | ---: | ---: |
| 0 | 0 | 0.0% |
| 1 | 11,145 | 49.2% |
| 2 | 6,025 | 26.6% |
| 3 | 2,039 | 9.0% |
| 4 | 1,031 | 4.6% |
| 5 | 742 | 3.3% |
| 6 | 902 | 4.0% |
| 7 | 752 | 3.3% |
| 8 | 0 | 0.0% |
| **Total** | **22,636** | **100.0%** |

## DEVELOPMENT without the always-present field

| Measure | With `everDosedInHumans` | Without it |
| --- | ---: | ---: |
| Median present | 2 | 1 |
| Mean present | 2.113 | 1.113 |
| Pages with 0 present | 0 | 11,145 |

## Tier sizes

| Tier | Definition | Pages | Suppressed | Suppressed % | Unknown-class (S10) |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 | LONGEVITY model ∪ withdrawn (any model) | 1,719 | 755 | 43.9% | 76 |
| 2 | CLINICAL model, not withdrawn | 4,477 | 1,062 | 23.7% | 178 |
| 3 | DEVELOPMENT model, not withdrawn | 22,636 | 17,451 | 77.1% | 17,306 |
| — | **Total** | **28,832** | **19,268** | **66.8%** | — |

## Tier 1 composition

| Set | Pages |
| --- | ---: |
| LONGEVITY model | 1,109 |
| Withdrawn (any model, R11) | 663 |
| Overlap (LONGEVITY and withdrawn) | 53 |
| Union = Tier 1 | 1,719 |
| — withdrawn promoted out of CLINICAL | 610 |
| — withdrawn promoted out of DEVELOPMENT | 0 |

## Stubs (R15: fewer than 3 present fields)

| Tier | Pages | Stubs | Share |
| --- | ---: | ---: | ---: |
| 2 | 4,477 | 2,084 | 46.5% |
| 3 | 22,636 | 17,170 | 75.9% |

## R11 — withdrawn pages and stated reasons

| Figure | Pages | Share |
| --- | ---: | ---: |
| Withdrawn pages | 663 | 100.0% |
| With a stated reason from any source | 282 | 42.5% |
| Without a stated reason | 381 | 57.5% |

| Reason source | Pages |
| --- | ---: |
| `fields.withdrawal.value.reason` | 1 |
| `model-assignment.withdrawnReasonSource.reason` | 281 |

| Withdrawn pages by model | Pages |
| --- | ---: |
| CLINICAL | 610 |
| LONGEVITY | 53 |

## Validation

| Check | Result |
| --- | --- |
| Pages in `model-assignment.ndjson` | 28,832 |
| Pages with exactly one field record | 28,832 |
| Duplicate keys within a model | 0 |
| Field records filed under the wrong model | 0 |
| Records with a missing or unmodelled field | 0 |

## Limits and issues

| # | Statement |
| ---: | --- |
| 1 | DEVELOPMENT patentStatus is present on 0 of 22,636 pages (22,601 not-applicable, 35 absent): no Tier 3 page keys an approved US application in the openFDA Orange Book export, so the field adds nothing to Tier 3 coverage. |
| 2 | DEVELOPMENT everDosedInHumans is present on 22,636 of 22,636 pages, so it never discriminates. Excluding it the DEVELOPMENT median present count is 1 and 11,145 pages hold no other present field. |
| 3 | LONGEVITY pathway is present on 677 of 1,109 pages; 60 pages were assigned to the model by the pathway reason. Since Phase 2b the field also admits a cited Europe PMC abstract sentence that names the compound, a pathway term and a mechanism verb together. |
| 4 | LONGEVITY itp (51) and clocks (96) are present on under 9% of the model. They are the two fields that most distinguish a longevity page from a clinical one. |
| 5 | No LONGEVITY page reaches 15 of 15 present fields; the maximum observed is 15 (2 pages). |
| 6 | 381 of 663 withdrawn pages (57.5%) carry no stated reason. EMA and Health Canada record a status and not a reason, and TGA, PMDA and the WHO consolidated withdrawn list were never cleared. R11 reports this figure; it is not closed by this stage. |
| 7 | Tier 3 is 17,451 of 22,636 suppressed (77.1%), of which 17,306 come from the S10 unknown-class default rather than a matched safety class. |
| 8 | 17,170 of 22,636 Tier 3 pages (75.9%) hold fewer than 3 present fields (R15 stubs), and 2,084 of 4,477 Tier 2 pages do as well. |
| 9 | LONGEVITY assignment by registry-ageing-term no longer admits a page whose only ageing term is the bare word "age-related" (Phase 2b recut): an age-related condition such as age-related macular degeneration is not longevity work. Pages with any other ageing term, an ITP entry, broad-slice membership or a pathway reason are unaffected. |
| 10 | CLINICAL carries not-applicable on 604 pages for each of indication, labelKinetics, interactions and adverseEvents: records with no label in any cleared register. The CLINICAL denominator is therefore 9 applicable fields on 4,483 pages and 5 on 604. |
| 11 | doseStudied (field 15b) and approvalDate sit beside `fields` on the record, not inside it: docs/specs/field-models.md makes them sub-fields of field 9 and of the withdrawal / regulatory fields, so they change no coverage denominator and no present count. |
