# Selected field dictionary

This page explains the fields most useful to readers. It is not an exhaustive list of every legacy
property in `drugs/*.ndjson`; for example, older rows can also contain `auditPointsCount` and
`deliverySystem`. The application type definitions live in [`lib/types.ts`](../lib/types.ts).

Read `manifest.json.generatedAt` for the checked-in artifact timestamp. The current files are a
repaired legacy snapshot, not the output of a fresh database export. Its original shallow serializer
lost properties inside nested objects. Empty `{}` fields and `{}` array elements were removed rather
than filled with invented values, so nested object detail is unavailable in this checked-in
snapshot. Fields below that contain nested objects — notably `aliases`, `conditionContext`,
`mechanismSteps`, `keyAudits`, `measuredVsInferredSummary`, `trials`, `molecularSchema`, `pricing`,
`substitutes`, and `communityNotes` — describe the authoritative database/export schema, not a
promise that the repaired files contain those details. A fresh database export is required to
restore them. Retained manifest counts and flat CSV `trial_count` values can therefore be non-zero
while the corresponding repaired NDJSON array is empty.

The checked-in snapshot has only the legacy dossier shape. The revised exporter is set to add the
normalized `programmeEvidence` object on a future successful run against the authoritative
database. In a snapshot that contains it, `programmeEvidence` is authoritative for a reviewed
programme conclusion.

## Identity

| Field        | Type           | Notes                                                                                                                                                                         |
| ------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`, `slug` | string         | The same value. The slug is the public identifier and the URL.                                                                                                                |
| `url`        | string         | `https://rnawiki.com/d/{slug}`                                                                                                                                                |
| `name`       | string         | Display name of the active substance. FDA data is ALL CAPS; this is title-cased.                                                                                              |
| `tradeName`  | string \| null | Brand names, `/` separated. Combination-product brands are excluded.                                                                                                          |
| `sponsor`    | string         | The application holder, preferring the earliest approved NDA or BLA. Repackagers are filtered out. Empty for supplements, which have no application and therefore no sponsor. |
| `aliases[]`  | array          | Other names that reach this record in search: `{ alias, kind }`. `kind` is one of `inn`, `usan`, `ban`, `brand`, `salt_form`, `common_name`, `systematic`.                    |

## Classification

| Field            | Type           | Notes                                                                                                                                                                                                      |
| ---------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modality`       | enum           | One of nine kinds, from small molecule to gene therapy. Derived from published USAN/INN name stems, the FDA application type, and what the label itself says — never from a guess about a particular drug. |
| `approvalStatus` | enum           | Includes `Controlled / No Approved Use` and `Withdrawn from Market`. `EMA Approved` is never assigned by the pipeline: nothing in the US sources supports that claim.                                      |
| `approvalYear`   | number \| null | Year of the earliest approved original NDA or BLA.                                                                                                                                                         |
| `dossierDepth`   | enum           | `flagship`, `curated` or `stub`. See the README — this is the field to read first.                                                                                                                         |

## What it is for

| Field                       | Type           | Notes                                                                                                                                                |
| --------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `indication`                | string         | Quoted from the label's indications section, trimmed at a sentence boundary.                                                                         |
| `patientFriendlyIndication` | string         | Extracted from that text by documented rules, never composed. Empty when the rules do not fire.                                                      |
| `conditionContext`          | object \| null | `conditionExplainer`, `whyItMatters`, `whoTakesThis`, `clinicalGoals`. On a `curated` record `whyItMatters` is empty: nothing in a label answers it. |

## What it does

| Field              | Type           | Notes                                                                                                                    |
| ------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `laymanHowItWorks` | string         | On `flagship`, written plainly. On `curated`, the label's own mechanism passage, opening "From the FDA-approved label:". |
| `targetGene`       | string         | Only where a label states it outright. Deliberately low-recall: a wrong target is worse than none.                       |
| `targetProtein`    | string         | Editorial. Usually empty outside `flagship`.                                                                             |
| `mechanismSteps[]` | array          | The step-by-step carousel: `step`, `title`, `laymanDesc`, `molecularDetail`, `iconName`, `visualStage`. Editorial.       |
| `anatomicalSite`   | string \| null | Where the drug acts. Editorial.                                                                                          |

The database still carries a legacy medicine-wide `oneSentenceVerdict` for compatibility with old
dossier reads. The dataset exporter omits it because it has no safe programme scope.

## Evidence

| Field                                | Type           | Notes                                                                                                                                                                                                    |
| ------------------------------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keyAudits[]`                        | array          | The point of the site. `category` is `measured`, `inferred`, `failed` or `conclusion_shift`, separating what a study showed from what people claim from it. Editorial.                                   |
| `measuredVsInferredSummary`          | object \| null | The same split as four lists.                                                                                                                                                                            |
| `trials[]`                           | array          | `trialId` is a real registration number. **`endpointMet: false` on a machine-added trial means "not recorded"** — the registry carries registrations, not results. `statisticalPValue` says so in words. |
| `auditConfidence`, `confidenceScore` | enum, 0–100    | Editorial reading of how settled the evidence is. **Not a computed probability.** 0 on anything not hand-researched.                                                                                     |
| `hasDiscrepancy`                     | boolean        | Set by hand when sources conflict.                                                                                                                                                                       |

## Normalized programme evidence (next-export schema)

These fields are not present in the checked-in repaired snapshot. They describe the output the
revised exporter will write on a future successful run against the authoritative database.

| Field                                                            | Type           | Notes                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `programmeEvidence.schemaVersion`                                | string         | Currently `public-medicine-projection/v1`.                                                                                                                                                                                                    |
| `programmeEvidence.selectedSummary.kind`                         | enum           | `reviewed_programme`, `programme_indication`, `medicine_indication`, or `identity_only`. This is the compact summary selected for home/browse cards.                                                                                          |
| `programmeEvidence.selectedSummary.text`                         | string \| null | Reviewed programme reason, scoped programme indication, legacy identity-layer indication, or null. Read `binding` before displaying it.                                                                                                       |
| `programmeEvidence.selectedSummary.binding`                      | object         | Explicit source binding. A `programme_publication` binding includes programme id/slug, verdict revision id/number, and input digest; `programme` binds only to an unpublished programme; `medicine_identity` binds only to the medicine slug. |
| `programmeEvidence.programmes[]`                                 | array          | Every normalized development programme for this medicine, in deterministic display order.                                                                                                                                                     |
| `programmeEvidence.programmes[].id`, `.slug`, `.title`           | string         | Stable internal programme id, shareable slug, and display title.                                                                                                                                                                              |
| `programmeEvidence.programmes[].indication`, `.targetPopulation` | string \| null | Programme scope. Null means it has not been recorded.                                                                                                                                                                                         |
| `programmeEvidence.programmes[].status`                          | enum           | Normalized programme status, such as `RECRUITING`, `COMPLETED`, `STOPPED`, or `UNKNOWN`.                                                                                                                                                      |
| `programmeEvidence.programmes[].currentPublication`              | object \| null | Null unless the authoritative current-publication pointer resolves to the exact `PUBLISHED` revision.                                                                                                                                         |
| `currentPublication.verdictRevisionId`, `.revisionNumber`        | string, number | Immutable published verdict revision selected by the authoritative pointer.                                                                                                                                                                   |
| `currentPublication.inputDigestAlgorithm`, `.inputDigest`        | string         | `sha256` and the deterministic RNA Intelligence input digest signed by review.                                                                                                                                                                |
| `currentPublication.proposalDigestAlgorithm`, `.proposalDigest`  | string         | `sha256` and the digest of the complete persisted proposal bundle reviewed for publication.                                                                                                                                                   |
| `currentPublication.sourceSnapshotIds[]`                         | string[]       | Sorted, unique ids of immutable source snapshots in the reviewed verdict, evidence-node, study-check, mechanism, timeline and trial graph.                                                                                                    |
| `currentPublication.publicLabel`, `.oneSentenceReason`           | string         | Reviewed public wording for this programme only.                                                                                                                                                                                              |
| `currentPublication.indicationScope`, `.populationScope`         | string         | The indication and population to which the conclusion applies.                                                                                                                                                                                |
| `currentPublication.trialScope`, `.outcomeScope`, `.confidence`  | string         | Reviewed trial/outcome boundary and confidence label.                                                                                                                                                                                         |
| `currentPublication.engineVersion`, `.publishedAt`               | string         | Deterministic engine version and ISO 8601 publication time.                                                                                                                                                                                   |

### Additional CSV columns in the next-export schema

These columns are also absent from the checked-in CSV. After regeneration, the CSV represents one
selected programme binding per medicine; use NDJSON for the complete list.

| Column                                    | Notes                                                                               |
| ----------------------------------------- | ----------------------------------------------------------------------------------- |
| `selected_programme_slug`                 | Programme used by the compact public projection, or the first normalized programme. |
| `current_publication_revision_id`         | Exact current verdict revision for that selected programme.                         |
| `current_publication_revision_number`     | Human-readable version number of that revision.                                     |
| `current_publication_input_digest`        | SHA-256 RNA Intelligence input digest for the publication.                          |
| `current_publication_source_snapshot_ids` | Sorted snapshot ids separated with `;`; blank when there is no current publication. |

## Chemistry

| Field                                                                        | Type            | Notes                                                                                                                                                   |
| ---------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `molecularSchema.smilesString`                                               | string          | The connection table, from PubChem.                                                                                                                     |
| `molecularSchema.sequence5to3`                                               | string          | Nucleotide or amino-acid sequence where one exists.                                                                                                     |
| `chemicalFormula`, `molecularWeight`                                         | string          | Computed from the structure, not copied.                                                                                                                |
| `mfeDeltaG`                                                                  | number          | Folding free energy in kcal/mol at 37 °C, from a Zuker-style fold over published Turner 2004 parameters. Negative; more negative is more firmly folded. |
| `gcContentPercent`, `readingFrameValid`, `startCodonFound`, `stopCodonFound` |                 | Computed by the sequence check.                                                                                                                         |
| `logP`                                                                       | number          | An **estimate** by atomic contribution, not a measurement.                                                                                              |
| `isMachineVerified`, `verificationHash`                                      | boolean, string | Set only by a passing structure check. The hash is reproducible from the stored internal input and does not say the medicine works or is safe.          |
| `molecularSchema.laboratoryWorkflow`                                         | not exported    | Operational laboratory instructions are withheld from the public dataset. Their absence is deliberate, not evidence that no internal record exists.     |

## Cost

| Field                              | Type   | Notes                                                                                                               |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| `pricing.retailPricePerDoseOrYear` | string | On `curated` records, what pharmacies pay, from the CMS NADAC survey, with its effective date. Not a patient price. |
| `pricing.synthesisCostPerDose`     | string | Cost of production. Requires a published study; empty rather than estimated.                                        |
| `pricing.openPatentNotes`          | string | Where the figures came from.                                                                                        |

## Alternatives

| Field                          | Type  | Notes                                                                                               |
| ------------------------------ | ----- | --------------------------------------------------------------------------------------------------- |
| `substitutes.conventionalRx[]` | array | Other medicines for the same job, with typical cost.                                                |
| `substitutes.naturalFoods[]`   | array | Dietary alternatives with `dailyUsage` — **the amount the cited study used**, not a recommendation. |
| `substitutes.homeRemedies[]`   | array | Non-drug approaches with their evidence and cautions.                                               |

## Provenance and history

| Field                           | Type     | Notes                                                                                                                                                     |
| ------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sourceProvenance[]`            | string[] | Every source that contributed to this record.                                                                                                             |
| `revisionCount`, `lastEditedAt` |          | Edit history. Full history at `/d/{slug}/history`.                                                                                                        |
| `recentAuditDate`               | string   | When a person last reviewed the record.                                                                                                                   |
| `communityNotes[]`              | array    | Published notes. `isVerifiedDoctor` reflects the author's **current** verification, so a withdrawn approval removes the badge from everything they wrote. |
