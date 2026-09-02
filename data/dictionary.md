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

## Record identity and dossier completion

Every NDJSON medicine row in a `drugs/2` snapshot carries two objects that say what the record is
and how much of it has been settled. Read `manifest.json` for the file's `schemaVersion`: a
`drugs/1` snapshot predates both fields.

`inventoryResolution` is the reader-facing subset of the identity decision for that record. It never
names another record.

| Field                                                  | Type           | Notes                                                                                                                                                                  |
| ------------------------------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inventoryResolution.resolutionStatus`                 | enum           | `CANONICAL_ENTITY`, `DUPLICATE_OF_CANONICAL_ENTITY`, `ALIAS_OF_CANONICAL_ENTITY`, `HISTORICAL_REDIRECT`, `INVALID_IDENTITY_GONE` or `MANUAL_IDENTITY_REVIEW_REQUIRED`. |
| `inventoryResolution.entityClass`                      | enum           | What kind of thing the row is. It selects which dossier sections apply and is not a quality ranking.                                                                   |
| `inventoryResolution.canonicalSlug`                    | string         | The address this entity is served at. Equal to the record's own slug on a canonical record.                                                                            |
| `inventoryResolution.redirectTargetSlug`               | string \| null | Set only on a resolving status; one hop, and the same entity described twice.                                                                                          |
| `inventoryResolution.identityConfidence`               | enum           | `REGISTRY_IDENTIFIER_RECORDED`, `NAME_ONLY` or `PLACEHOLDER`.                                                                                                          |
| `inventoryResolution.identifierSharedWithOtherRecords` | boolean        | True when a registry identifier on this row is also recorded on another row. **Not merge evidence.** The other rows are never named in any public file.                |
| `inventoryResolution.resolverVersion`                  | string         | The resolver that produced the decision.                                                                                                                               |

`dossierCompletion` is a summary of the completion assessment for that record: the status, the two
counts, and one state per applicable section. Every state describes the sources RNAWiki read for
that section, never the medicine.

The basis sentence behind a state, the counts it rests on and the exact sources read are **not** on
the medicine row. They are published in full in `dossier-completion/dossier-completion-NNN.ndjson`,
keyed by the same slug. Restating them on every medicine row more than doubled `drugs/` to repeat
bytes the completion files already carry.

| Field                                      | Type   | Notes                                                                                                              |
| ------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------ |
| `dossierCompletion.status`                 | enum   | `COMPLETE` when every applicable section carries one of the ten terminal states, otherwise `INCOMPLETE`.           |
| `dossierCompletion.contentChangedAt`       | string | When the inputs behind the assessment last moved. Re-running the resolver over unchanged inputs does not move it.  |
| `dossierCompletion.resolverVersion`        | string | The resolver that produced the assessment.                                                                         |
| `dossierCompletion.applicableSectionCount` | number | How many of the twenty sections apply to this kind of record.                                                      |
| `dossierCompletion.terminalSectionCount`   | number | Applicable sections that reached a terminal state.                                                                 |
| `dossierCompletion.sectionStates`          | object | One entry per applicable section: the section id mapped to the state it reached. No basis text and no source refs. |

A state such as `NOT_MEASURED`, `NO_QUALIFYING_EVIDENCE_AFTER_SEARCH` or `RESULTS_NOT_POSTED` is an
outcome, not a gap: it says a source was read or a dated search was run and what it returned. Keep
them apart from each other and from `NOT_APPLICABLE`, which says the section cannot apply to this
kind of record.

### `inventory-resolution.ndjson`

One line per original medicine record, sorted by `originalSlug`, covering every stored row including
the placeholder identities the medicine files leave out.

| Field                                                     | Type     | Notes                                                                                                                    |
| --------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `originalRecordId`, `originalSlug`, `originalName`        | string   | The stored record this line resolves.                                                                                    |
| `entityClass`, `entityClassRule`                          | string   | The kind decided, and the rule from the fixed class table that decided it.                                               |
| `resolutionStatus`, `canonicalSlug`, `redirectTargetSlug` | string   | The outcome and the address for the entity. `redirectTargetSlug` is null unless the status resolves elsewhere.           |
| `identityConfidence`                                      | enum     | What the identity rests on.                                                                                              |
| `identitySourceKinds[]`                                   | string[] | Kinds of registry identifier read from the row, such as `UNII` or `PUBCHEM_CID`. Kinds only; the values stay on the row. |
| `attributionWarningCodes[]`                               | string[] | Warning codes only. The records a warning was raised against are never published.                                        |
| `resolutionEvidence[]`                                    | string[] | Deterministic evidence behind a non-canonical outcome. It can name the address a record resolves to: one entity, twice.  |
| `contentDigest`, `resolverVersion`                        | string   | SHA-256 over the exact stored inputs, and the resolver that read them.                                                   |

### `dossier-completion/dossier-completion-NNN.ndjson`

One line per canonical entity, sorted by `slug` and split into files of 1,000 lines, exactly like
`drugs/drugs-NNN.ndjson`. Read the shards in numeric order, or concatenate them: `cat
data/dossier-completion/*.ndjson`. A record that resolves to another address has no line here; read
the line for the address it resolves to.

Each file's row count, byte length and SHA-256 are declared separately in `manifest.json`.

| Field                                                      | Type     | Notes                                                                                                      |
| ---------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `slug`, `name`, `entityClass`                              | string   | The canonical record and the class that selected its sections.                                             |
| `status`, `applicableSectionCount`, `terminalSectionCount` |          | The same three values as the row-level object above.                                                       |
| `nonTerminalSectionIds[]`                                  | string[] | Sections still waiting on something. Empty exactly when the status is `COMPLETE`.                          |
| `humanReadSuggestedSectionIds[]`                           | string[] | Sections where a person reading the named source could add something the parser did not. Never a blocker.  |
| `sections[]`                                               | array    | `sectionId`, `state`, `basisKind`, `basis`, `sourceRefs[]` and, where the basis rests on counts, `counts`. |
| `inputDigest`, `resolverVersion`, `contentChangedAt`       | string   | The digest over the inputs read, the resolver, and when those inputs last moved.                           |

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
