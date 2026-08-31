# Four-audience evidence coverage

Generated deterministically from the checked-in public snapshot by
`scripts/audit/four-audience-evidence-coverage.ts`.

**Snapshot generated:** 2026-08-31T23:07:00.238Z

**Measurement digest:** `dc5189d25ce7084020023023fd0ad256cb4ce8220ef397bb881e3728362fe381`

This is a source-bound evidence eligibility report. It is not an answer-rate claim. The fixed six
questions produce 59,130 registry pairs over 9,855 records,
but a registry pair may be an explicit non-answer. Only 4,319 observed pairs meet
the conservative source-bound rules below.

## Ordinary-reader questions

| Question                                             | Canonical intent               | Eligible records | Share | Measurement        |
| ---------------------------------------------------- | ------------------------------ | ---------------: | ----: | ------------------ |
| What is this medicine used or studied for?           | `purpose`                      |            2,751 | 27.9% | Exact for snapshot |
| What happened to people in the cited study or label? | `bottom-line`, `measurement`   |               18 |  0.2% | Exact for snapshot |
| How large was the measured result?                   | `results-magnitude`            |               18 |  0.2% | Exact for snapshot |
| What important harm or limitation was recorded?      | `harms`, `meaning-limitations` |            1,510 | 15.3% | Exact for snapshot |
| Who might this evidence not apply to?                | `applicability`                |               22 |  0.2% | Exact for snapshot |
| What is unknown, conflicting or stale?               | `unknowns`                     |                0 |  0.0% | Lower bound        |

**All six:** 0 records. No record meets the first five rules, so the all-six count is exactly zero even though runtime stale bindings are not exported.

## Chemistry identity

| Measure                                            |       Records |
| -------------------------------------------------- | ------------: |
| Source-bound recorded-background formula or weight |         3,103 |
| Legacy molecular formula or structure              |         3,258 |
| — with SMILES                                      |         3,204 |
| — with formula                                     |         3,258 |
| Union available to the canonical dossier           | 4,307 (43.7%) |

The union keeps both canonical identity paths. It does not count a name or registry identifier as a
chemical structure.

## Biotech research coverage

| Source-bound field set             |  Records |
| ---------------------------------- | -------: |
| Recorded use or studied purpose    |    2,751 |
| Recorded mechanism statement       |    1,632 |
| Pivotal endpoint and result        |       18 |
| Study applicability and population |       22 |
| All four conservative core sets    | 0 (0.0%) |

This is a conservative structured-coverage measure, not a claim that the full biotech lens is
complete. Dose, comparator, endpoint hierarchy, adverse events, failures, unreported outcomes,
freshness and review history remain visible as recorded or explicitly absent in the projection.

## Quantitative uncertainty

The corpus holds 22 qualifying key-study results across 18 records.
15 results across 14 records carry uncertainty printed by their
source (68.2% of qualifying results).

## Source conflict

Only comparable readings with `comparisonState: differ` count: **0 fields** across
**0 records**. The 12 `not_comparable` fields remain separate and
are not disagreements.

| Comparison state       | Fields |
| ---------------------- | -----: |
| `agree`                |  1,282 |
| `differ`               |      0 |
| `not_comparable`       |     12 |
| `insufficient_context` |    387 |
| `not_classified`       |      0 |

Unmapped differing fields: none.

## Exact stale bindings

Measurement state: **not observable in checked in public snapshot**.
The checked-in public snapshot does not export the runtime driftedSources projection. Absence is not reported as zero.

| Measure                                           |          Value |
| ------------------------------------------------- | -------------: |
| Public rows exposing the exact runtime projection |              0 |
| Confirmed exact bindings                          | not observable |
| Records with confirmed drift                      | not observable |

## Source-read boundary

| Measure                                        |   Records |
| ---------------------------------------------- | --------: |
| At least one qualifying source excerpt         |     3,093 |
| **No source excerpt read**                     | **6,762** |
| At least one qualifying source object recorded |     9,855 |
| **No qualifying source recorded**              |     **0** |

A qualifying source object without a quotable excerpt remains provenance, but it is not counted as a clinical source read.

## Denominators and limits

- Public medicine rows: 9,857.
- Recorded-background records measured: 9,855.
- Deliberate public rows outside the recorded-background export: 2.
- The report measures the checked-in public snapshot, not scientific knowledge outside the sources RNAWiki recorded.
- The source-bound eligibility counts are not claims that every eligible field is already rendered as an answered registry passage.
- The snapshot has 0 current programme publications; the recorded-background rules therefore provide the observable ordinary-question evidence in this run.
- Question-level stale is database-backed runtime state and is not observable in this checked-in public snapshot unless driftedSources is explicitly exported.
- A registry pointer without a source excerpt never counts as a clinical source read.
- not_comparable remains separate from source conflict.

## Reproduce

`node --import tsx scripts/audit/four-audience-evidence-coverage.ts --check`

Input hashes are recorded in the generated JSON report.
