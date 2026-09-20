# Medicine-page research queue: denominator and source audit

Measured from the local artifacts on 2026-09-19 with:

```bash
node --import tsx scripts/research/coverage-queue.ts --limit 0
```

The command reads only committed/local data, prints JSON, and neither fetches nor changes a dossier. A queue signal is a prompt to inspect evidence, not a clinical claim, proof of safety, or permission to publish. The inventory artifact was built on 2026-09-12; the corpus tier and openFDA mapping artifacts were built earlier. Re-run their generating pipelines before treating this as a live-site census.

## The three denominators

| Scope                       |  Count | Meaning                                                                                                                                                     |
| --------------------------- | -----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/d` inventory              | 10,250 | `corpus_pages UNION drugs` slugs in the local database at inventory build time.                                                                             |
| Merged background envelopes |  9,855 | Slug-keyed `medicine-background/v1` records in `ALL_RECORDED_BACKGROUND`; all 9,855 match the inventory. This is source context, not a reviewed conclusion. |
| Tier identity CSV           | 28,832 | Separate corpus-stage rows; 9,360 slugs match the `/d` inventory, and 890 do not. Tier counts cannot be projected onto all `/d` pages.                      |

The 395 inventory pages without a background envelope are not simply “missing data”: 391 have a local corpus page and four have neither a corpus page nor a background envelope. Conversely, 8,548 inventory pages have a background envelope but no local corpus page; 1,307 have both. These four mutually exclusive cells total 10,250.

The exact `/d`-to-tier join yields 1,694 Tier 1, 3,401 Tier 2, 4,265 Tier 3 and 890 unmatched pages. In the matched groups, the background envelope supplies recorded uses on 671, 2,040 and 28 pages respectively; a recorded mechanism on 546, 1,123 and 14; and a boxed product-label warning on 219, 415 and four. The unmatched group additionally has 243 recorded uses, 83 mechanisms and 25 boxed warnings. These are stored module presences, not vetted reader summaries.

## Source availability is a different scope

`data/sources/openfda-label/coverage.json` reports 124,706 mapped rows and 2,357 exact-UNII-matched pages across the **28,832-page source-mapper corpus**: 597 Tier 1, 1,539 Tier 2 and 221 Tier 3. It reports 1,872 pages with a contraindications section, 726 with a boxed-warning section and 1,351 with an overdosage section. These figures cannot be assigned to the 10,250 `/d` inventory without an exact page-key join to the mapping. They also describe raw product-label text, not a substance-wide conclusion or beginner-ready wording. Name-only candidates remain unconfirmed and are not counted as source matches.

The current `/d` inventory has 6,513 pages with one or more recorded human-result cards, but **zero pages with a reviewed claim**. Only 18 background envelopes have a `pivotalResults` module and none stores the optional `trialContext` extension required to bind a result to the exact condition, intervention, formulation and source before it appears as a scoped result. Do not convert the 6,513-card figure into 6,513 publishable findings or charts.

## Work cohorts, not automatic publication priorities

The CLI assigns one deterministic primary lane per page, with identity blockers first, then source-recorded safety, result scope, acquisition and thin records. A final baseline lane captures the pages with existing context and no earlier flag. Lanes are mutually exclusive and **sum to all 10,250 inventory slugs**; signals may overlap. This is an editorial workload order, not a ranking of medical urgency or publication readiness.

| Lane                        | Pages | Why it enters the queue                                                                                                                                        |
| --------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity review             |   956 | A correction hold, unresolved substance type, or a name-family record; the exact identity must be settled before carrying another substance's evidence across. |
| Product-label safety review | 1,625 | A stored boxed warning or contraindication merits product-specific scope and qualified translation.                                                            |
| Human-result scope review   | 4,540 | A recorded result card remains after the two prior lanes, but no claim is reviewed.                                                                            |
| Background acquisition      |    65 | No background envelope remains after higher-priority signals.                                                                                                  |
| Thin-record review          | 2,632 | No recorded use, mechanism or human-result card remains after higher-priority signals.                                                                         |
| Baseline claim review       |   432 | Existing context avoids the earlier lanes, but the first-screen wording, exact source binding and scope still require verification; **not “ready.”**           |

Signals across all pages include 621 shared-name families, 335 unresolved substance types, 122 unresolved availability states, one correction hold, 663 stored boxed warnings, 1,529 stored contraindication sets, and 395 missing background envelopes. A missing UNII in 3,142 existing background envelopes is a **linkage limitation**, not proof the identity is wrong. Thirty-seven envelopes carry combination-product context; no component should inherit a combination's finding without an exact source check.

Examples and reproducible views:

```bash
node --import tsx scripts/research/coverage-queue.ts --lane identity_review --limit 25
node --import tsx scripts/research/coverage-queue.ts --lane product_label_safety_review --limit 25
node --import tsx scripts/research/coverage-queue.ts --lane baseline_claim_review --limit 25
node --import tsx scripts/research/coverage-queue.ts --slug metformin
npx vitest run tests/unit/research-coverage-queue.test.ts
```

The research gate for any proposed sentence remains: confirm exact substance/product and route, inspect the specific source and date, preserve use/population/comparator/time and uncertainty, bind each decision-relevant sentence to that source, obtain qualified review, then use the existing publication transaction. The CLI does none of those judgments. Its source-mapper totals are deliberately reported separately from `/d` page counts to prevent a false coverage claim.
