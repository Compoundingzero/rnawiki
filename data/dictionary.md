# Field dictionary

Every field in `drugs/*.ndjson`. The site uses these same shapes — the definitions live in
[`lib/types.ts`](../lib/types.ts).

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

| Field                | Type           | Notes                                                                                                                    |
| -------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `oneSentenceVerdict` | string         | Editorial. Present on `flagship` records.                                                                                |
| `laymanHowItWorks`   | string         | On `flagship`, written plainly. On `curated`, the label's own mechanism passage, opening "From the FDA-approved label:". |
| `targetGene`         | string         | Only where a label states it outright. Deliberately low-recall: a wrong target is worse than none.                       |
| `targetProtein`      | string         | Editorial. Usually empty outside `flagship`.                                                                             |
| `mechanismSteps[]`   | array          | The step-by-step carousel: `step`, `title`, `laymanDesc`, `molecularDetail`, `iconName`, `visualStage`. Editorial.       |
| `anatomicalSite`     | string \| null | Where the drug acts. Editorial.                                                                                          |

## Evidence

| Field                                | Type           | Notes                                                                                                                                                                                                    |
| ------------------------------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keyAudits[]`                        | array          | The point of the site. `category` is `measured`, `inferred`, `failed` or `conclusion_shift`, separating what a study showed from what people claim from it. Editorial.                                   |
| `measuredVsInferredSummary`          | object \| null | The same split as four lists.                                                                                                                                                                            |
| `trials[]`                           | array          | `trialId` is a real registration number. **`endpointMet: false` on a machine-added trial means "not recorded"** — the registry carries registrations, not results. `statisticalPValue` says so in words. |
| `auditConfidence`, `confidenceScore` | enum, 0–100    | Editorial reading of how settled the evidence is. **Not a computed probability.** 0 on anything not hand-researched.                                                                                     |
| `hasDiscrepancy`                     | boolean        | Set by hand when sources conflict.                                                                                                                                                                       |

## Chemistry

| Field                                                                        | Type            | Notes                                                                                                                                                                    |
| ---------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `molecularSchema.smilesString`                                               | string          | The connection table, from PubChem.                                                                                                                                      |
| `molecularSchema.sequence5to3`                                               | string          | Nucleotide or amino-acid sequence where one exists.                                                                                                                      |
| `chemicalFormula`, `molecularWeight`                                         | string          | Computed from the structure, not copied.                                                                                                                                 |
| `mfeDeltaG`                                                                  | number          | Folding free energy in kcal/mol at 37 °C, from a Zuker-style fold over published Turner 2004 parameters. Negative; more negative is more firmly folded.                  |
| `gcContentPercent`, `readingFrameValid`, `startCodonFound`, `stopCodonFound` |                 | Computed by the sequence check.                                                                                                                                          |
| `logP`                                                                       | number          | An **estimate** by atomic contribution, not a measurement.                                                                                                               |
| `isMachineVerified`, `verificationHash`                                      | boolean, string | Set only by a passing engine sweep. The hash is over the structure and the workflow — re-runnable, and independent of the clock.                                         |
| `laboratoryWorkflow[]`                                                       | array           | Steps with `phase` and `dependsOnStepId`, validated as a directed acyclic graph in forward phase order. On controlled substances these describe analysis, not synthesis. |

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
