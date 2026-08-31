# Release A — regeneration report

One pass over the openFDA archive, incorporating every extraction and consensus repair. Machine
readable companion: `release-a-regeneration.json`.

## Archive

| Fact             | Value                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Manifest         | <https://api.fda.gov/download.json>                                   |
| Export date      | **2026-08-28** — the same export the pre-repair corpus was built from |
| Label partitions | 14 · 1,770.9 MB                                                       |
| Labels examined  | 262,271                                                               |
| Labels indexed   | **80,444**                                                            |
| Labels skipped   | 181,827                                                               |
| Presence stream  | 87,096                                                                |
| Location         | `~/rnawiki-ingest-data/openfda`, outside the repository               |
| Per-file SHA-256 | `~/rnawiki-ingest-data/archive-hashes.txt`                            |

The export date matching matters. A different export would have confounded a parser repair with a
source change, and no measured difference below could have been attributed to either.

## Commands

```bash
RNAWIKI_INGEST_DATA=~/rnawiki-ingest-data npx tsx scripts/ingest/download.ts
python3 scripts/background/index-openfda-labels.py ~/rnawiki-ingest-data/openfda \
        ~/rnawiki-ingest-data/label-index.ndjson /tmp/medicine-rows.json \
        --presence=~/rnawiki-ingest-data/label-presence.ndjson
npx tsx scripts/background/build-extracted-background.ts ~/rnawiki-ingest-data/label-index.ndjson
npx tsx scripts/background/build-source-consensus.ts ~/rnawiki-ingest-data/label-index.ndjson \
  --retrieved-at=2026-08-30
npm run check:medicine-content
npm run audit:denial-corpus
```

## Measured, before and after

| Metric                                   | Before |     After |
| ---------------------------------------- | -----: | --------: |
| **Values equal to their own dispersion** | **23** |     **0** |
| Numeric pharmacokinetic values checked   |  2,489 |     2,552 |
| Extracted records                        |  3,256 |     3,276 |
| Consensus fields                         |  1,626 |     1,670 |
| Records at the old interaction cap of 12 |    200 |        33 |
| Records holding **more** than 12 signals |      0 |   **466** |
| Largest interaction signal count         |     12 |   **164** |
| Interaction roles asserted               |    796 |     4,439 |
| Interaction roles denied                 |  1,724 | **7,261** |
| Polarity not recorded                    |  2,365 |     7,824 |
| Explicit non-establishment               |  1,361 |     1,365 |

Consensus comparison states, from the unit-aware contract: **agree 1,427 · differ 231 ·
not_comparable 12.** The pre-repair Boolean reported 234 disjoint; that number was wrong in both
directions and the two are not comparable as a like-for-like.

> Historical measurement only. Release B1 subsequently found that unit comparability was not enough:
> the parser had not structurally extracted population or formulation context. The B1 artifact
> retains these readings but moves distinct otherwise-comparable pairs to `insufficient_context`.
> Its current generated counts are the release source of truth.

## The 23 historical records

All 23 rechecked individually. **None stores a dispersion.** Twenty store the exact mean the
pre-repair audit predicted. Three store a different sentence's mean, from the same label:

| Record                              | Now stored    | Pre-repair audit predicted | Why                                                                                                                                     |
| ----------------------------------- | ------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `atovaquone` half-life              | 62.5 ± 35.3 h | 82                         | The parser now matches the primary IV elimination sentence rather than the rifampin-comparison sentence. Both are real; both are means. |
| `choriogonadotropin-alfa` half-life | 4.5 ± 0.5 h   | 29                         | hCG has a two-compartment profile. This is the **initial** half-life; 29 h is the terminal. The parser matches the first stated.        |
| `rimantadine` half-life             | 25.4 ± 6.3 h  | 32                         | The single-dose elimination statement rather than the 71–79-year-old subgroup.                                                          |

These moved because the parser matches a different sentence, not because a defect survived. Each is
a mean correctly read from a printed sentence with its excerpt stored beside it.

## Why the interaction numbers moved so far

Two repairs compounded. Removing the alphabetical cap stopped discarding counterparties past the
twelfth, and widening the identity key from the counterparty name to the whole statement stopped
discarding a second sentence about the same enzyme. The denial count rising from 1,724 to 7,261 is
mostly the second: a label saying "is a substrate of CYP3A4" in one place and "does not inhibit
CYP3A4" in another previously kept only whichever came first.

## The defect the regeneration itself exposed

The first index run reported `wrote 0 labels, skipped 0` **and exited 0**, because
`index-openfda-labels.py` discovered partitions by openFDA's published `*.json.zip` name while
`scripts/ingest/download.ts` saves each one as `label-NN.zip`. Had regeneration continued, it would
have rebuilt the corpus from an empty index and deleted every extracted record, green all the way.

That is the DSLD failure in a new place — a refusal arriving as success. Both names are now
accepted, and a run that indexes zero labels raises.

## A correction made to the contract, not to the metric

A consensus field carrying a single distinct reading was reported as `insufficient_context`, which
buried 1,288 of 1,670 fields in a state meaning "we could not tell". A consensus field exists only
where two or more documents stated the value, so one distinct reading means every document printed
the same thing — the strongest agreement observable here. It now reads `agree`.

This was changed because it was wrong, not to make a gate pass.

## Generated-output hashes

```
797f52298881cfca0f9b8362fc11718a05ae62b1d3f8418f91ab72e06d1c8221  extracted-background.generated.ts
583ceca998e6361dce1b7c31d3a2a478ed1b3a44d0130d2ae52a586c534443f1  source-consensus.generated.ts
5ea328207ab7b1fce94bbcde37e36da6d7e4e5c48fd7c2b755a5ca382cfcba58  baseline.json (measurement digest)
```

Pre-repair hashes are in `~/rnawiki-ingest-data/pre-repair-snapshot/pre-repair-hashes.txt`.

## Gate

`typecheck` · `lint` · `check:copy` (0 hits) · `format` · `drizzle-kit check` · **1,770 unit tests
across 129 files** · all **9,855** envelopes validating under `background-2.4.0`.

No curated batch file changed. Extraction skipped all 155 curated records.

## Still open at the end of this regeneration

- `data/manifest.json` still declares CC BY-SA 4.0 and is regenerated by the exporter, so the licence
  audit line stays red until an export runs against the authoritative database.
- Question-level `conflicting` and `stale`, engine-finding persistence verification, and
  `recordedBackground` in the public export are not yet done.
