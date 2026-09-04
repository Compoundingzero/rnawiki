# Corpus 20k — repo and database map

Survey 0b. Working database `postgresql://admin@localhost:5432/rnawiki_corpus_completion`,
read-only, PG18 client at `/opt/homebrew/opt/postgresql@18/bin/psql`. Measured 2026-09-04.
Worktree `RNAwiki-corpus-completion`, branch `main`.

Corpus scalars: `drugs` 9,859 rows · `inventory_resolutions` CANONICAL_ENTITY 9,852,
DUPLICATE_OF_CANONICAL_ENTITY 5, INVALID_IDENTITY_GONE 2 · `drug_aliases` 27,859 ·
`dossier_completion_assessments` 9,852 (all COMPLETE, all `terminal_section_count` = 20) ·
`source_search_records` 23,273 · `evidence_reading_units` 273,110 · `development_programmes` 0 ·
`programme_current_publications` 0 · `medicine_slug_redirects` 5.

---

## 1. Identity

### Storage locations

| Key         | Exact path                                                            | Canonical coverage |
| ----------- | --------------------------------------------------------------------- | -----------------: |
| UNII        | `drugs.recorded_background -> 'registryIdentifiers' ->> 'unii'`       |              6,711 |
| PubChem CID | `drugs.recorded_background -> 'registryIdentifiers' ->> 'pubchemCid'` |              2,081 |
| InChIKey    | not stored                                                            |                  0 |
| ChEMBL id   | `drugs.recorded_background -> 'registryIdentifiers' ->> 'chemblId'`   |              1,208 |
| CAS         | `drugs.recorded_background -> 'registryIdentifiers' ->> 'casNumber'`  |              2,738 |
| RxCUI       | `drugs.recorded_background -> 'registryIdentifiers' ->> 'rxcui'`      |              4,766 |

Any of the six: 6,739. None of the six: 3,113. Written to
`data/corpus-20k/identity-coverage.json`.

Other identifiers on the same population: `emaSubstanceId` 2,375, `drugBankId` 2,245, `ecNumber`
1,354, `chebiId` 1,224, `innIdentifier` 922, `ncbiTaxonomyId` 820.

InChIKey: `grep -i inchi` returns zero hits in `drugs.recorded_background`,
`drugs.molecular_schema`, `data/registries/*.json`, `data/recorded-background.ndjson` and
`data/inventory-resolution.ndjson` (the 30 apparent hits are the brand string
`Brainchild Nutritionals`). No column, no key, no file holds one.

### Column and file inventory

- `drugs.molecular_schema` (jsonb, 3,285 non-null). Keys: `structureType`, `isMachineVerified`,
  `laboratoryWorkflow` (3,285); `molecularWeight` 3,272; `chemicalFormula` 3,259;
  `lastVerifiedTimestamp`/`verificationHash` 3,213; `smilesString` 3,204; `logP` 3,175;
  `targetReceptorAffinity` 432; `sequence5to3` 40; nucleic-acid checks 16–18. No registry
  identifier lives here.
- `drugs.recorded_background` (jsonb, 9,855 non-null). Module key counts across all rows:
  `authoredAt`/`version` 9,855, `provenanceTier` 9,700, `sourceMaterial` 7,126,
  `registryIdentifiers` 6,741, `productListing` 5,998, `labelPresence` 5,941, `supplementMarket`
  5,350, `supplementIngredient` 3,887, `attribution` 3,260, `molecularIdentity` 3,218,
  `biologicalIdentity` 2,999, `recordedUses` 2,982, `regulatoryApproval` 2,505, `productVariants`
  2,243, `populationStatements` 1,996, `mechanism` 1,766, `safety` 1,693, `pharmacokinetics`
  1,405, `commonAdverseReactions` 909, `interactionSignals` 757, `sourceConsensus` 734,
  `costContext` 626, `nameFamily` 621, `anatomyTargets` 91, `composition` 37, `titration` 27,
  `applicability` 22, `pivotalResults` 18.
  - `registryIdentifiers` sub-keys: `source`, `unii`, `rxcui`, `casNumber`, `emaSubstanceId`,
    `drugBankId`, `pubchemCid`, `ecNumber`, `chebiId`, `chemblId`, `innIdentifier`,
    `ncbiTaxonomyId`.
  - `molecularIdentity` sub-keys: `molecularWeight` (3,152), `molecularFormula` (2,509) only.
  - `biologicalIdentity` sub-keys: `source`, `lineageAsRecorded`, `matchedOn`,
    `commonNamesAsRecorded`, `rankAsRecorded`, `scientificName` (2,999 each), `partAsRecorded`
    (1,647).
- `drug_aliases` — columns `id`, `drug_id`, `alias`, `kind` (enum `alias_kind`, default
  `common_name`), `source`. Unique on `(drug_id, lower(alias))`. 27,859 rows. No identifier
  column; identifiers are not stored as aliases.
- `inventory_resolutions.identity_sources` (jsonb array) — elements
  `{ kind, path, identifier }`, e.g.
  `{"kind":"FDA_APPLICATION","path":"recordedBackground.regulatoryApproval.earliestApplicationNumber","identifier":"NDA001546"}`.
  Occurrence counts over canonical rows: `FDA_NDC` 30,430, `FDA_LABEL_SET` 24,892, `UNII` 6,711,
  `RXCUI` 4,766, `DSLD_INGREDIENT_GROUP` 3,884, `NCBI_TAXONOMY` 3,065, `CAS` 2,738,
  `FDA_APPLICATION` 2,399, `PUBCHEM_CID` 2,081. There is no `CHEMBL` source kind.
- `inventory_resolutions.resolution_evidence` (jsonb array of plain strings), e.g.
  `["canonical record for exact-name duplicates: \"fructo-oligosaccharides\""]`,
  `["placeholder identity: slug \"header\", name \"Header\""]`.
- `inventory_resolutions.identity_confidence` — `REGISTRY_IDENTIFIER_RECORDED` 9,802,
  `NAME_ONLY` 50.
- `data/registries/compound-identity-background.json` (1,480,319 bytes) — slug-keyed
  `medicine-background/v1` envelopes carrying `molecularIdentity.molecularFormula` and
  `.molecularWeight` only, each with a `source` block `{kind: "PUBCHEM", identifier: <CID>, label,
retrievedAt}`. The CID appears only inside `source.identifier`.
- `data/registries/biological-identity.json` (2,016,809 bytes) — slug-keyed envelopes with
  `biologicalIdentity.{scientificName, rankAsRecorded, lineageAsRecorded, commonNamesAsRecorded,
matchedOn, source{kind:"NCBI_TAXONOMY", identifier}}`.
- `data/inventory-resolution.ndjson` (6,288,771 bytes) — one line per `drugs` row:
  `attributionWarningCodes`, `canonicalSlug`, `contentDigest`, `entityClass`, `entityClassRule`,
  `identityConfidence`, `identitySourceKinds`, `originalName`, `originalRecordId`, `originalSlug`,
  `redirectTargetSlug`, `resolutionEvidence`, `resolutionStatus`, `resolverVersion`. Note this
  export carries `identitySourceKinds` (kind strings) but **not** the identifiers themselves.
  A second copy exists at `data/inventory/inventory-resolution.ndjson`.

---

## 2. Ingestion pipeline (npm script → input → output → must not overwrite)

| npm script                                       | Entry file                                                                            | Input                                                                                               | Output                                                                                                                                                                                                                                    | Must not overwrite                                                                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `ingest:download`                                | `scripts/ingest/download.ts` (139 ln)                                                 | openFDA download manifest over network                                                              | `rnawiki-ingest-data/openfda/*` (~1.9 GB, resumable by advertised size)                                                                                                                                                                   | any file already on disk at the manifest size                                                                                           |
| `ingest:structures`                              | `scripts/ingest/build-structures.ts`                                                  | PubChem cache                                                                                       | structure cache under `scripts/ingest/paths.ts` `CACHE_FILES`                                                                                                                                                                             | curated `molecular_schema`                                                                                                              |
| `ingest`                                         | `scripts/ingest/run.ts` (258 ln)                                                      | `rnawiki-ingest-data/openfda/*` via `ingest/openfda.ts`, DSLD via `ingest/dsld.ts`, structure cache | `drugs` rows + `drug_aliases`                                                                                                                                                                                                             | curated narrative fields and any reviewed record; `--dry-run` is the no-write mode                                                      |
| `enrich`                                         | `scripts/enrich/run.ts` (579 ln)                                                      | `drugs` rows, openFDA aggregate, NADAC, ClinicalTrials, botanical/biologic lookups                  | fills `drugs` fields that have a public source; runs `runFullDeterministicSweep`                                                                                                                                                          | fields with no public source; reviewed content                                                                                          |
| `completion:label-index`                         | `scripts/dossier-completion/build-label-sections-index.ts` (189 ln)                   | `rnawiki-ingest-data/label-index.ndjson`, `label-presence.ndjson`                                   | `rnawiki-ingest-data/label-sections-index.json` (28,521,639 bytes)                                                                                                                                                                        | the fixed `readSections` vocabulary — a section outside it is "not read", never "absent"                                                |
| `completion:snapshot`                            | `scripts/dossier-completion/fetch-clinicaltrials-snapshot.ts` (254 ln)                | ClinicalTrials.gov API v2, paged                                                                    | `rnawiki-ingest-data/clinicaltrials/<ts>/{studies.ndjson,manifest.json,checkpoint.json}`                                                                                                                                                  | an existing dated snapshot; stores registry facts only, never an outcome value                                                          |
| `completion:match-trials`                        | `scripts/dossier-completion/match-trial-registry.ts` (221 ln)                         | one dated snapshot + canonical entity names/aliases                                                 | `source_search_records` rows (exact-name pass)                                                                                                                                                                                            | ambiguous aliases are excluded, not guessed                                                                                             |
| `completion:pubmed`                              | `scripts/dossier-completion/run-pubmed-searches.ts` (199 ln)                          | NCBI E-utilities, ≤3 req/s                                                                          | `rnawiki-ingest-data/pubmed/clinical-trial-searches.ndjson` (9,852 lines)                                                                                                                                                                 | a failed attempt must not become a zero                                                                                                 |
| `completion:pubmed:import`                       | `scripts/dossier-completion/import-pubmed-searches.ts` (95 ln)                        | that NDJSON                                                                                         | `source_search_records` (`PUBMED_ESEARCH_CLINICAL_TRIAL`)                                                                                                                                                                                 | a success is never replaced by a failure                                                                                                |
| `completion:run` / `:check`                      | `scripts/dossier-completion/run-completion.ts` (451 ln)                               | `drugs`, `inventory_resolutions`, label-sections index, search records                              | `dossier_completion_assessments` upsert keyed by `drug_id`                                                                                                                                                                                | `content_changed_at` moves only when `input_digest` moves                                                                               |
| `inventory:resolve` / `:check`                   | `scripts/inventory/resolve-inventory.ts` (175 ln)                                     | `drugs` rows via `loadInventoryRows`                                                                | `data/inventory/*` deterministic artifacts                                                                                                                                                                                                | `--check` writes nothing; artifacts must match byte for byte                                                                            |
| `inventory:apply`                                | `scripts/inventory/apply-inventory.ts` (111 ln)                                       | resolution result                                                                                   | `inventory_resolutions`, `medicine_slug_redirects`                                                                                                                                                                                        | never deletes a medicine row; refuses when accounting is unbalanced or `manualReviewRequired > 0`; an existing ledger row is left alone |
| `background:curated-gap`                         | `scripts/background/build-curated-gap-extraction.ts` (288 ln)                         | deterministic label extractor over hand-curated slugs                                               | `data/registries/curated-gap-extraction.json` (1,749,238 bytes)                                                                                                                                                                           | additive only — never overwrites a curated module a person wrote                                                                        |
| `export:dataset`                                 | `scripts/export/dataset.ts` (872 ln)                                                  | `drugs`, `drug_aliases`, `inventory_resolutions`, `dossier_completion_assessments`                  | `data/` — `drugs/drugs-001..010.ndjson`, `drugs.csv`, `recorded-background.ndjson` (64,906,246 bytes), `source-consensus.ndjson`, `inventory-resolution.ndjson`, `dossier-completion/dossier-completion-001..010.ndjson`, `manifest.json` | has a shrinkage guard; does not verify its own hashes                                                                                   |
| `agents:run` / `agents:check`                    | `scripts/agents/run-agents.ts` (134 ln)                                               | `data/recorded-background.ndjson`                                                                   | `data/agents/current/*` (11 files + `manifest.json`)                                                                                                                                                                                      | never touches `data/agents/*.json` (pre-repair audit evidence); runs the graph twice and fails on any byte difference                   |
| `agents:import` / `:check`                       | `scripts/agents/import-current.ts` (41 ln) → `scripts/agents/load-current-package.ts` | `data/agents/current/*`                                                                             | append-only agent run/candidate/membership rows + mutable current-run pointer                                                                                                                                                             | never writes a medicine fact; an identical replay is a no-op                                                                            |
| `attach:agent-datasets` / `check:agent-datasets` | `scripts/agents/attach-current-to-dataset-manifest.ts` (119 ln)                       | `data/agents/current/manifest.json`, `data/manifest.json`                                           | adds the agent manifest as a `files[]` entry with `sha256`                                                                                                                                                                                | refuses unless `data/manifest.json` declares `CC BY 4.0 — see LICENSE-DATA`; `--check` fails on difference                              |

Registry builders under `scripts/background/` are **not** wired to npm scripts (except
`background:curated-gap`, `build:molecular`, `verify:background`) and write slug-keyed JSON into
`data/registries/`: `build-biological-identity.ts` → `biological-identity.json`,
`build-compound-identity-background.ts` → `compound-identity-background.json`,
`build-label-presence.ts` → `label-presence.json`, `build-product-listing.ts` →
`product-listing.json`, `build-regulatory-approval.ts` → `regulatory-approval.json`,
`build-source-material.ts` → `source-material.json`, `build-substance-backed-background.ts` →
`substance-backed-background.json`, `build-supplement-background.ts` →
`supplement-background.json`, `build-supplement-ingredient.ts` → `supplement-ingredient.json`,
`build-name-family.ts` → `name-family.json`, `build-combination-row-composition.ts` →
`combination-row-composition.json`, `build-acquisition-cost.ts` → `acquisition-cost.json`.
`build-product-registry.ts`, `build-substance-registry.ts` and `build-combination-products.ts`
name outputs (`product-registry.json`, `substance-registry.json`, `combination-products.json`)
that are **not present** on disk.

`apply:background` (`scripts/apply-recorded-background.ts`) writes only the
`drugs.recorded_background` column keyed by slug, after validating every envelope with the
background engine; `CORPUS_VERSION = 'openfda-2026-08-28'`. It never creates a medicine row.

---

## 3. openFDA and other archives on disk

Root: `/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/rnawiki-ingest-data/` (3.2 GB total).

`openfda/` (4.4 GB apparent, 18 files):

| File                                |                                                                                                                                                                                            Bytes | mtime                  |                                                Records |
| ----------------------------------- | -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | ---------------------- | -----------------------------------------------------: |
| `drug-drugsfda-0001-of-0001.json`   |                                                                                                                                                                                      124,941,056 | 2026-08-28 14:47       | `meta.results.total` 29,298; `last_updated` 2026-08-28 |
| `drug-ndc-0001-of-0001.json`        |                                                                                                                                                                                      246,324,514 | 2026-08-28 14:47       |                     137,590; `last_updated` 2026-08-28 |
| `drug-orangebook-0001-of-0001.json` |                                                                                                                                                                                       41,164,691 | 2026-08-28 14:47       |                      48,664; `last_updated` 2026-08-28 |
| `label-01.zip` … `label-14.zip`     | 137,479,556 / 149,547,990 / 144,000,859 / 144,100,401 / 131,471,532 / 142,372,689 / 149,285,143 / 143,921,655 / 131,543,655 / 135,545,593 / 152,912,608 / 137,468,598 / 139,437,961 / 17,881,816 | 2026-08-30 23:27–23:31 |                              not counted from the zips |

`archive-hashes.txt` (395 bytes) holds SHA-256 for `label-01.zip` through `label-05.zip` only —
partitions 06–14 have no recorded hash. No dates are stored in that file; the dates above are
filesystem mtimes.

Derived label artifacts at the root:

- `label-index.ndjson` — 1,609,861,681 bytes, 2026-08-30 23:38, **80,444 lines**. Per-line keys:
  `setId`, `declaredSubstanceCount`, `effectiveTime`, `brandNames`, `genericNames`,
  `substanceNames`, `routes`, `unii`, `rxcui`, `sections`, `score`. Built by
  `scripts/background/index-openfda-labels.py`. **No `dea_schedule` field.**
- `label-presence.ndjson` — 19,089,248 bytes, 2026-08-30 23:38, **87,096 lines**. Keys: `setId`,
  `names`, `declared`, `productTypes`, `routes`, `effectiveTime`.
- `label-sections-index.json` — 28,521,639 bytes, 2026-09-02 10:39. Schema
  `rnawiki-label-sections-index/v1`, `builtAt` 2026-09-02T02:39:02.412Z,
  `labelIndexSha256` `c679e72d…ccb9`, `presenceSha256` `daa24e17…823d`, `labels` 87,141,
  `proseLabels` 80,443, 21 `readSections`, `entries[]` of
  `{setId, names, declared, productTypes, effectiveTime, sections[]}`.

`clinicaltrials/20260901T090005/` (2026-09-02 10:44):
`studies.ndjson` 815,589,780 bytes; `manifest.json` 1,164 bytes; `checkpoint.json` 940 bytes.
Manifest: schema `rnawiki-clinicaltrials-snapshot/v1`, API v2.0.5, `dataTimestamp`
2026-09-01T09:00:05, `consistent: true`, 30 fields, pageSize 1000, 602 pages,
**601,158 studies**, `studiesSha256` `00b7ca20…5e27`. Fields include `HasResults`,
`WhyStopped`, `PrimaryOutcomeMeasure`, `DesignAllocation`, `DesignMasking` — and **no** outcome
value fields.

`pubmed/clinical-trial-searches.ndjson` — 2026-09-02 10:38, **9,852 lines** (one per canonical
entity).

`models/Xenova/bge-small-en-v1.5/` (2026-09-02 15:34): `onnx/model.onnx` 133,093,490 bytes,
`tokenizer.json` 711,396, `config.json` 683, `tokenizer_config.json` 366.

Also present: `backups/rnawiki-production-20260831T010225.dump` (11,042,943 bytes) and
`pre-repair-snapshot/` (`extracted-background.generated.ts` 24,559,311,
`enzyme-and-transporter-documentation.json` 2,882,915, `source-consensus.generated.ts` 3,508,056,
`baseline.json` 16,733, `pre-repair-hashes.txt` 384).

---

## 4. Entity-class rules

Enum `inventory_entity_class`: `APPROVED_MEDICINE`, `APPROVED_BIOLOGIC`,
`INVESTIGATIONAL_MEDICINE`, `OFF_LABEL_OR_COMPOUNDED`, `WITHDRAWN_MEDICINE`,
`CONTROLLED_NO_APPROVED_USE`, `COMBINATION_PRODUCT`, `BOTANICAL_OR_ORGANISM_PREPARATION`,
`SUPPLEMENT_INGREDIENT`, `MARKETED_PRODUCT_INGREDIENT`, `REGISTRY_ONLY_IDENTITY`, `PLACEHOLDER`.

Rules live in `lib/inventory/entity-class.ts` (166 lines), evaluated in order; the matched string
is stored verbatim in `inventory_resolutions.entity_class_rule`. Supporting files:
`lib/inventory/entity-class-types.ts` (15), `lib/inventory/resolve.ts` (491),
`lib/inventory/types.ts` (121).

| Rule (line)                                                                                                     | Class                             | Rows (all statuses) |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------: |
| rule-1 placeholder identity (98)                                                                                | PLACEHOLDER                       |                   2 |
| rule-2 recorded composition with more than one active ingredient (103)                                          | COMBINATION_PRODUCT               |                  21 |
| rule-3 approval status Withdrawn from Market (109)                                                              | WITHDRAWN_MEDICINE                |                  29 |
| rule-4 approval status Controlled / No Approved Use (115)                                                       | CONTROLLED_NO_APPROVED_USE        |                  21 |
| rule-5 approved, but every label naming it is OTC alongside other substances and no Drugs@FDA application (121) | MARKETED_PRODUCT_INGREDIENT       |                 284 |
| rule-6 approved status with a biologic modality (128)                                                           | APPROVED_BIOLOGIC                 |                 492 |
| rule-7 approved status (130)                                                                                    | APPROVED_MEDICINE                 |               2,344 |
| rule-8 phase 2, phase 3 or pre-clinical status (135)                                                            | INVESTIGATIONAL_MEDICINE          |                 391 |
| rule-9 approval status Off-Label / Compounded (141)                                                             | OFF_LABEL_OR_COMPOUNDED           |                 128 |
| rule-10 recorded biological (taxonomy) identity (147)                                                           | BOTANICAL_OR_ORGANISM_PREPARATION |               2,758 |
| rule-11 recorded supplement ingredient or supplement market module (153)                                        | SUPPLEMENT_INGREDIENT             |               3,025 |
| rule-12 recorded label presence, product listing or regulatory application (159)                                | MARKETED_PRODUCT_INGREDIENT       |                 359 |
| rule-13 no product, supplement or organism module (164)                                                         | REGISTRY_ONLY_IDENTITY            |                   5 |

Canonical-only entity-class counts: SUPPLEMENT_INGREDIENT 3,023 ·
BOTANICAL_OR_ORGANISM_PREPARATION 2,758 · APPROVED_MEDICINE 2,342 ·
MARKETED_PRODUCT_INGREDIENT 643 · APPROVED_BIOLOGIC 492 · INVESTIGATIONAL_MEDICINE 390 ·
OFF_LABEL_OR_COMPOUNDED 128 · WITHDRAWN_MEDICINE 29 · COMBINATION_PRODUCT 21 ·
CONTROLLED_NO_APPROVED_USE 21 · REGISTRY_ONLY_IDENTITY 5.

Rules 3, 4, 6, 7, 8 and 9 key off `drugs.approval_status` and `drugs.modality`, which for
hand-curated records come from `scripts/seed-data/`. Canonical `approval_status` distribution:
Non-FDA / Dietary Supplement 6,145 · FDA Approved 3,128 · Pre-clinical / Open Source 378 ·
Off-Label / Compounded 128 · Withdrawn from Market 29 · Controlled / No Approved Use 21 ·
Accelerated Approval 9 · Phase 2 Investigational 7 · Phase 3 Clinical Trial 5 · EMA Approved 2.

Seed files (`scripts/seed-data/`, 47 entries, composed in `index.ts` as `ALL_SEED_DOSSIERS` and
filtered into `SEED_DOSSIERS`), record counts by `slug:` declarations:
`controlled-psychoactive.ts` 12,705 lines / 32 records; `performance-and-grey-market.ts` 13,955
lines / 35 records; `peptide.ts` 3,048 lines / 7 records. Also present:
`withdrawn-and-restricted.ts`, `nutraceutical-core.ts`, `nutraceutical-botanical.ts`,
`small-molecule-{cardiometabolic,neuro,infectious-onc}.ts`, `antibody.ts`, `biologic.ts`,
`sirna.ts`, `aso.ts`, `mrna.ts`, `gene-therapy.ts`, `enriched-batch-1..30.ts`, and
`scripts/seed-data/background/` (generated). Per CLAUDE.md, batches 19, 20 and 27–30 are
user-owned and must not be edited.

---

## 5. Safety-relevant fields available to R2 suppression

Counts are over the 9,852 canonical records unless stated.

| Field                                   | Exact location                                                                                                                                                                                                                                                                                          |                                                                                     Canonical count |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------: |
| FDA pharmacologic class (EPC/MoA/PE/CS) | `drugs.recorded_background->'productListing'->'pharmacologicClassesAsRecorded'` (jsonb array of strings, e.g. `"Copper Chelator [EPC]"`, `"Metal Chelating Activity [MoA]"`); source registry `data/registries/product-listing.json`; upstream `rnawiki-ingest-data/openfda/drug-ndc-0001-of-0001.json` |                                          1,833 with ≥1 class (module present on 5,998 rows overall) |
| Boxed-warning presence                  | `drugs.recorded_background->'safety'->'boxedWarning'` (module `safety` present on 1,693)                                                                                                                                                                                                                |                                                                                                 663 |
| Contraindications                       | `drugs.recorded_background->'safety'->'contraindications'`                                                                                                                                                                                                                                              |                                                                                               1,529 |
| Boxed warning at label level            | `rnawiki-ingest-data/label-sections-index.json` `entries[].sections` contains `boxed_warning`                                                                                                                                                                                                           |                                                                             12,325 of 87,141 labels |
| Pregnancy                               | label-sections index `sections` contains `pregnancy` 27,444 labels; `use_in_specific_populations` 20,489; `nursing_mothers` 14,136. Recorded modules: `populationStatements`                                                                                                                            | 1,996 records carry `populationStatements`; text matching `pregnancy categor` appears in 67 records |
| Abuse/dependence proxy                  | label-sections index `sections` contains `drug_abuse_and_dependence`                                                                                                                                                                                                                                    |                                                                                        7,016 labels |
| DEA schedule                            | **not stored anywhere.** No `dea_schedule` in `label-index.ndjson`, no key in `registryIdentifiers`, no registry file, and a regex for `dea schedule` / `csa schedule` / `schedule I–V` over `recorded_background` returns **0**                                                                        |                                                                                                   0 |
| REMS                                    | no field; the literal `REMS` appears in `recorded_background` text of **2** records                                                                                                                                                                                                                     |                                                                                                   2 |
| Adverse reactions                       | `drugs.recorded_background->'commonAdverseReactions'`                                                                                                                                                                                                                                                   |                                                                                                 909 |
| Interaction signals                     | `drugs.recorded_background->'interactionSignals'`                                                                                                                                                                                                                                                       |                                                                                                 757 |
| Entity class                            | `inventory_resolutions.entity_class` (see §4) — the only field that already partitions controlled / withdrawn / off-label populations                                                                                                                                                                   |                                                                                               9,852 |
| Approval status                         | `drugs.approval_status` (enum)                                                                                                                                                                                                                                                                          |                                                                                               9,852 |
| Which label sections were even read     | `label-sections-index.json` `readSections` (21 names)                                                                                                                                                                                                                                                   |                                                                                                   — |

Consequence for R2: schedule status and REMS must be sourced fresh; they cannot be derived from
what is on disk. `entity_class` (`CONTROLLED_NO_APPROVED_USE`, `WITHDRAWN_MEDICINE`,
`OFF_LABEL_OR_COMPOUNDED`) plus `boxedWarning` and the `drug_abuse_and_dependence` label-section
flag are the only in-hand signals.

---

## 6. Overlap measure

The exhaustive 52,326-pair / 324-record measurement recorded in
`docs/worklogs/page-overlap-diagnosis.md` (135 lines, measured 2026-09-03) has **no retained
scoring script**. What survives:

- `tmp/build-sample.ts` (3,464 bytes, 2026-09-03 04:29) — sampler. Reads `DATABASE_URL`; joins
  `drugs` × `inventory_resolutions` (`resolution_status='CANONICAL_ENTITY'`) ×
  `dossier_completion_assessments`, selecting `slug`, `name`, `entity_class`, `sections`,
  `applicable_section_count`, `terminal_section_count`; strata are
  `EXACT_SOURCE_BACKED`, `EXACT_STRUCTURED_SOURCE_DATA`, `REVIEWED_INTERPRETATION`,
  `SOURCE_STATED_NON_ESTABLISHMENT`, `REPRESENTED_SOURCE_CONFLICT`. Writes `$SAMPLE_DIR/sample.json`.
- `tmp/fetch-sample.ts` (1,913 bytes, same timestamp) — fetches `https://rnawiki.com/d/<slug>`,
  extracts the `<main>` element, strips script/style/svg and tags, resumes from an existing
  `$SAMPLE_DIR/pages.json`, writes `$SAMPLE_DIR/pages.json` with
  `{title, description, text, htmlBytes}` per slug.

`tmp/` is gitignored (`.gitignore:8`), so neither file is in history and the pairwise scorer,
the masking pass, the random-deletion control and the embedding step were never committed. The
`$SAMPLE_DIR` output directory is not present on disk. Memory behaviour is therefore
unmeasurable from the repository; the scale is 324 pages × ~5,138 median visible words held in
memory for O(n²) = 52,326 comparisons.

The only committed overlap-adjacent tool is `scripts/quality/repetition-scan.mjs` (60 lines): a
fixed 8-gram (`const N = 8`) repeated-phrase scan over files named on `process.argv`, keeping
grams with `n >= 3` occurrences across `>= 2` files, printing the top 25. It is a corpus-text
scanner, not a pairwise page comparator, and it holds one `Map` of every 8-gram in the files
passed to it.

Numbers to reproduce within 0.02 for R3 (from the worklog): lexical 0.651 raw / 0.400 shared-text
removed / 0.444 random control; positional five-word 0.645 / 0.266 / 0.116; semantic cosine
0.948 / 0.892 / 0.930.

---

## 7. Public rendering

### Route tree

- `app/d/[slug]/page.tsx` (195 ln) — dossier route. `cache`d loader; `permanentRedirect` on a
  ledger hit; imports `AppShell`, `MedicineDossierV2`, `programmeEvidenceMedicineDossierView`
  (`lib/programme-dossier-view.ts`), `dossierJsonLdGraph`/`serialiseJsonLd` (`lib/json-ld.ts`),
  `pageRobotsMetadata`/`configuredSiteOrigin` (`lib/seo/deployment.ts`),
  `decideDossierIndexability` (`lib/seo/dossier-indexability.ts`), `getCurrentUser`.
  `robots` is set at lines 69, 82, 93 (forced `index:false, follow:true`) and 114
  (`index: mayIndex`).
- `app/d/[slug]/opengraph-image.tsx`, `app/d/[slug]/history/page.tsx`,
  `app/d/[slug]/programme/[programme]/history/page.tsx`.
- Other public routes: `app/page.tsx`, `app/browse/page.tsx` (447 ln), `app/datasets/`,
  `app/datasets/[dataset]/`, `app/c/[slug]`, `app/r/[slug]`, `app/t/compound/[slug]`,
  `app/u/[handle]`, `app/how-it-works`, `app/editorial-policy`, `app/llms.txt`,
  `app/indexnow-key.txt`, `app/sitemap.ts` (117 ln), `app/robots.ts` (51 ln), `app/manifest.ts`,
  `app/healthz`.

### Component tree under the dossier

`components/MedicineDossierV2.tsx` (2,832 ln) is the root. It imports:

| Component                                                                                                                                                                                   | File                                                                                                                                                                   | Renders                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `DossierHeader`                                                                                                                                                                             | `components/dossier/DossierHeader.tsx`                                                                                                                                 | identity header                                                            |
| `DossierNavigation`, `DossierSectionNavigator`                                                                                                                                              | `components/dossier/DossierNavigation.tsx`, `DossierSectionNavigator.tsx` (sections from `lib/dossier-navigator-sections.ts`)                                          | in-page navigation                                                         |
| `DossierAudienceLensSelector`                                                                                                                                                               | `components/dossier/DossierAudienceLensSelector.tsx` (projections from `lib/dossier-audience-lenses.ts`)                                                               | audience lens control                                                      |
| `DossierEvidenceIntroduction`                                                                                                                                                               | `components/dossier/DossierEvidenceIntroduction.tsx` (84 ln)                                                                                                           | fixed explanatory intro                                                    |
| `DossierResearchQuestion`, `DossierQuestionCoverage`                                                                                                                                        | `components/dossier/DossierResearchQuestion.tsx`, `DossierQuestionCoverage.tsx` (registry `lib/dossier-question-registry.ts`, issues `lib/dossier-question-issues.ts`) | question framing and coverage                                              |
| `DossierEvidencePath`                                                                                                                                                                       | `components/dossier/DossierEvidencePath.tsx`                                                                                                                           | `#evidence-chain` (line 1660), five evidence nodes, `evidenceNodeAnchorId` |
| `DossierOutcomeComparison`, `KeyOutcomesSection` (local, line 942)                                                                                                                          | `components/dossier/DossierOutcomeComparison.tsx`                                                                                                                      | `#key-outcomes` (line 956)                                                 |
| `DevelopmentTimeline` (local, line 1060)                                                                                                                                                    | —                                                                                                                                                                      | `#development-timeline` (line 1073)                                        |
| `ConclusionReviewDetails` (local, line 1154)                                                                                                                                                | —                                                                                                                                                                      | `#who-reviewed-heading`; programme conclusion at line 1494/1501            |
| `RegisteredTrials`, `TrialResults`                                                                                                                                                          | `components/dossier/RegisteredTrials.tsx`, `TrialResults.tsx`                                                                                                          | registry trials and posted results                                         |
| `DossierCompletionAssessment`                                                                                                                                                               | `components/dossier/DossierCompletionAssessment.tsx`                                                                                                                   | the 20-section completeness table                                          |
| `DossierOtherProgrammes`                                                                                                                                                                    | `components/dossier/DossierOtherProgrammes.tsx`                                                                                                                        | sibling programmes                                                         |
| `MedicineBackgroundDisclosure`                                                                                                                                                              | `components/MedicineBackgroundDisclosure.tsx` (83 ln)                                                                                                                  | recorded-background wrapper                                                |
| `AdvancedEvidenceDisclosure`                                                                                                                                                                | `components/AdvancedEvidenceDisclosure.tsx` (90 ln)                                                                                                                    | technical disclosure                                                       |
| `CitationExportPanel`                                                                                                                                                                       | `components/dossier/CitationExportPanel.tsx`                                                                                                                           | citation export                                                            |
| `CommunityCommentary`, `DossierContributionActions`, `LegacyIdentityCorrectionActions`, `DossierAccountActionsGuard`                                                                        | respective files                                                                                                                                                       | contribution controls                                                      |
| `AnnotatedMedicineText`                                                                                                                                                                     | `components/AnnotatedMedicineText.tsx` (+ `lib/annotated-medicine-text.ts`)                                                                                            | glossary-annotated prose                                                   |
| local `SourceLinks` (334), `LegacyEvidenceTechnicalDetails` (502), `StudyCard` (661), `StatusBadge` (270), `EvidenceNodeStatusBadge` (294), `ClaimNatureBadge` (319), `EmptyEvidence` (565) | —                                                                                                                                                                      | evidence primitives                                                        |

`components/MedicineRecordContextSections.tsx` (889 ln) renders the recorded-background sections
under `<div id="medicine-record-context">` (line 172), with anchors in this source order:
`why-developed`, `safety-and-administration` (sub-headings `background-administration-heading`,
`background-safety-heading`, `background-delivery-heading`), `who-was-studied-record`,
`recorded-uses`, `what-is-in-it`, `recorded-mechanism`, `recorded-harms`, `commonly-reported`,
`recorded-populations`, `after-a-dose`, `studied-schedule`, `recorded-products`, `handled-by`,
`chemical-identity`, `where-it-acts-map` (`components/dossier/AnatomyTargetMap.tsx`),
`what-every-label-says`, `what-this-name-can-mean`, `what-kind-of-material`,
`what-organism-it-is`, `when-it-was-approved`, `listed-products`, `label-archive-presence`,
`supplement-ingredient-record`, `supplement-market`, `recorded-trial-results`,
`other-approaches`, `food-and-supplement-context`, `cost-context`, `recorded-cost-context`,
`common-questions`, `registry-identifiers`, `molecular-record`.
`hasMedicineRecordContext()` (line 150) gates the whole block.

### The 20-section order

The order is a TypeScript constant, not a database constraint. `lib/dossier-completion/types.ts:51`
`DOSSIER_SECTION_IDS` — `identity`, `regulatory-status`, `recorded-uses`, `mechanism`,
`pharmacokinetics`, `molecular-identity`, `safety-statements`, `population-statements`,
`adverse-reactions`, `interaction-signals`, `product-variants`, `cost-context`,
`source-consensus`, `biological-identity`, `supplement-market`, `trial-registry`,
`trial-results`, `trial-eligibility`, `literature-search`, `reviewed-conclusion`. Applied at
`lib/dossier-completion/resolve.ts:1151` and `lib/dossier-completion/view.ts:107` (`SECTION_ORDER`).

The check constraints actually on `dossier_completion_assessments` are:
`_sections_shape` (`jsonb_typeof(sections)='array' AND jsonb_array_length(sections) =
applicable_section_count`), `_counts`, `_status_agrees`, `_digest`. They enforce cardinality and
status agreement, not the 20-name order — the worklog's phrase "enforced by a check constraint"
is imprecise; the constraint enforces that the stored array is exactly as long as the applicable
count, and the ordering is enforced in code.

Section-state totals across all 9,852 assessments (197,040 section rows):
`NO_QUALIFYING_EVIDENCE_AFTER_SEARCH` 93,130 · `EXACT_STRUCTURED_SOURCE_DATA` 57,542 ·
`NOT_APPLICABLE` 32,848 · `EXACT_SOURCE_BACKED` 12,374 · `RESULTS_NOT_POSTED` 1,138 ·
`SOURCE_STATED_NOT_ESTABLISHED` 8. Evidence-bearing sections per canonical record (the four
source-backed states) run 2–18; the mode is 5 (2,543 records), and 4,814 records have ≤4.

### Fixed explanatory copy

`lib/public-medicine-language.ts` (823 ln) — `GENERAL_RESEARCH_SUMMARY_COPY` (line 37),
`publicMedicineTypeLabel`, `publicApprovalStatusLabel`, `safeStoredReaderSentence` (186),
`buildLegacyReaderSummary` (722), `buildPublishedProgrammeReaderSummary` (767),
`buildUnpublishedProgrammeReaderSummary` (808).
`lib/dossier-ordinary-reader-glossary.ts` (255 ln) — first-use acronym expansions.
`components/dossier/DossierEvidenceIntroduction.tsx` (84 ln) — the introduction block.
Additional literal copy is inline in `MedicineDossierV2.tsx` and
`MedicineRecordContextSections.tsx`.

### `app/browse`

`export const dynamic = 'force-dynamic'` (line 36). `BROWSE_PAGE_SIZE = 60`,
`MAX_BROWSE_PAGE = 10_000`, `BROWSE_PAGE_STRIDE = 10`, `lastBrowsePage()`, `parseBrowsePage()`,
`browsePageLinks()` in `lib/browse-pagination.ts`. `searchParams` is awaited (Next 15).

### `app/sitemap.ts`

`export const dynamic = 'force-dynamic'`; 15-minute in-process cache
(`SITEMAP_CACHE_TTL_MS`). Composed of `STATIC_ROUTES` (`/`, `/browse`, `/datasets`, one per
`PUBLIC_DATASET_IDS`, `/how-it-works`, `/editorial-policy`), `browsePages` (page 2 … `lastBrowsePage(total)`),
`dossiers` from `loadMedicineSitemapIndexabilityReports()` filtered on
`decision.index && decision.canonicalSlug && decision.lastPublicContentUpdate`, and contributor
`profiles`. Logs `[seo.sitemap_size]`; over `SITEMAP_MAX_URLS` (50,000) it logs
`[seo.sitemap_over_protocol_limit]` and truncates. **It is a single sitemap file, not a sitemap
index** — R6 requires one.

### `app/robots.ts`

`export const dynamic = 'force-dynamic'`. Returns `BLOCK_EVERY_CRAWLER` (`disallow: '/'`) unless
`isCanonicalProductionDeployment()` **and** `isCanonicalRequestHost(host)`
(`lib/seo/canonical-production-origin.mjs`). Otherwise `allow: '/'`,
`disallow: ['/api/', '/healthz']`, with explicit duplicate rules for `OAI-SearchBot` and
`GPTBot`, plus `sitemap` and `host`.

### noindex mechanism

Two layers: per-page Next.js metadata via `pageRobotsMetadata()` in `lib/seo/deployment.ts:67`
(emits `robots` / `googleBot` `index:false, follow:<decision>` and falls back to
`rootRobotsMetadata()` on any non-canonical deployment), driven by
`decideDossierIndexability()` → `lib/seo/dossier-indexability.ts` →
`explainMedicineIndexability()` in `lib/seo/indexability.ts` (three admitting paths:
`indexable_reviewed_publication`, `indexable_provenance_bound_legacy_flagship`,
`indexable_canonical_record`, with an ordered auditable reason list and
`MINIMUM_INDEPENDENT_PROGRAMME_REVIEWS = 2`); plus a site-wide
`X-Robots-Tag: noindex, nofollow, noarchive` response header applied to `/(.*)` in
`next.config.mjs:60,75` on every non-canonical deployment. Excluded pages stay crawlable by
design (`lib/seo/indexability.ts:117`) so the `noindex` can be seen.

### IndexNow and audits

- `discovery:indexnow` → `scripts/discovery/submit-indexnow.ts` (175 ln). Reads the same
  eligibility projection as the sitemap, so it cannot announce a URL the sitemap withholds. Dry
  run unless `--submit`, and even then gated by `lib/seo/indexnow.ts` canonical-production guard
  plus origin match. Appends one line per run to a submission ledger. Key served at
  `app/indexnow-key.txt`.
- `discovery:monitor` → `scripts/discovery/monitor-discovery.ts` (463 ln). Read-only GETs of every
  canonical dossier URL from a sitemap; default origin `https://rnawiki.com`, concurrency 4
  (max 8). Writes a resumable NDJSON checkpoint and a summary JSON under `docs/audits/discovery`.
  Decides one state, `DISCOVERY_READY`. States in `scripts/discovery/discovery-states.ts`.
- `audit:search` → `scripts/quality/audit-public-search.ts` (1,223 ln). Crawler-side orphan and
  metadata audit. Defaults: origin `http://127.0.0.1:3000`, `MAX_URLS` 1,000, `MAX_DEPTH` 6,
  timeout 10,000 ms, orphan report `docs/audits/discovery/orphan-audit.json`. Carries
  `UNSAFE_METADATA_KEY` / `UNSAFE_METADATA_VALUE` regexes that fail on dose, dosage, protocol,
  synthesis, reagent, recipe, acquisition, pricing, supplier and purchase strings in metadata.

---

## 8. Dataset export and the recorded-background digest chain

`data/manifest.json` (23,692 bytes, `generatedAt` 2026-09-03T05:18:41.972Z, `source`
`https://rnawiki.com`, `licence` `CC BY 4.0 — see LICENSE-DATA`). `counts`: total 9,857,
flagship 489, curated 9,368, stub 0, withStructure 3,204, withTrials 6,513, withPrice 946,
machineVerified 3,213, aliases 27,859, programmes 0, currentProgrammePublications 0,
canonicalEntities 9,852, redirectedIdentities 5, goneIdentities 2, completeDossiers 9,852,
incompleteDossiers 0, agentRuns 10, agentCandidates 3,155, agentFindings 42,857.
`files[]` (25 entries, each `{path, rows, bytes, sha256, schemaVersion, mediaType, licence,
description}`): `data/drugs/drugs-001..010.ndjson`, `data/drugs.csv`,
`data/recorded-background.ndjson`, `data/source-consensus.ndjson`,
`data/inventory-resolution.ndjson`, `data/dossier-completion/dossier-completion-001..010.ndjson`,
`data/agents/current/manifest.json`.

**The digest that is compared: `data/recorded-background.ndjson`.**

1. `scripts/agents/current-run.ts:342` computes `corpusDigest = valueDigest(corpus)` over the
   normalized recorded-background corpus and stamps it into every artifact
   (`artifact.corpus = { commit, digest }`, line 458) and into
   `data/agents/current/manifest.json` (`corpusDigest`, `corpusCommit`, `records`, line 512).
   Current values: `corpusCommit` `fd8fbfce925103a876035e7c9227ef2efa162305`, `corpusDigest`
   `6556ad3bd7abd547f64ac9d69084bb998311651702c6983a75297533b84f3f88`, `records` 9,855,
   `runDate` 2026-09-03, `seed` 20260828, `schema` `rnawiki-current-agent-manifest/v1`.
2. `scripts/agents/load-current-package.ts:313` fails if any artifact's `corpus.digest` differs
   from the manifest's.
3. `scripts/agents/load-current-package.ts:379–381` recomputes the digest twice: once over the
   **worktree** bytes of `data/recorded-background.ndjson`, and once over
   `git show <corpusCommit>:data/recorded-background.ndjson` — skipped only when `.git` is absent
   (Railway's runtime image), where the worktree check still runs. Mismatch throws
   `Current agent manifest totals do not match the checked-in package`.
4. `lib/agents/persistence.ts:179` re-checks manifest vs artifact digest at import;
   `lib/agents/persistence.ts:310` compares the **stored** database digest against
   `loaded.manifest.corpusDigest`.
5. `scripts/agents/attach-current-to-dataset-manifest.ts` writes
   `data/agents/current/manifest.json` into `data/manifest.json` `files[]` with its own sha256
   and refuses unless the dataset manifest declares `CC BY 4.0 — see LICENSE-DATA`;
   `check:agent-datasets` fails on any difference.
6. `scripts/check/dataset-export.ts` (818 ln) recomputes every `files[].sha256` from disk with no
   network and no database, deliberately separate from the exporter that wrote them. It cannot
   detect a truncated read; that is the exporter's shrinkage guard.

**Build order (three deployments failed before this was found):** `export:dataset` →
commit `data/recorded-background.ndjson` → `agents:run` → `attach:agent-datasets`.

---

## 9. Deployment

`railway.toml` — `[build] builder = "NIXPACKS"`; `[deploy]`
`preDeployCommand = "npm run db:migrate && npm run apply:name-index && npm run agents:import"`,
`healthcheckPath = "/healthz"`, `healthcheckTimeout = 120`,
`restartPolicyType = "ON_FAILURE"`, `restartPolicyMaxRetries = 3`. Medical evidence is never
written by the hook; reviewed corpus transitions are separate operator actions
(`apply:b1-source-consensus-transition`).

`railway.source-sync.toml` — the ClinicalTrials.gov worker service. Custom Config Path
`/railway.source-sync.toml`; `buildCommand = "./node_modules/.bin/tsc --noEmit"`;
`preDeployCommand = "node --import tsx db/migrate.ts"`;
`startCommand = "node --import tsx scripts/source-sync-worker.ts"`;
`cronSchedule = "0 */6 * * *"`; `restartPolicyMaxRetries = 1`. Deploy via
`npm run deploy:source-sync` (`scripts/deploy-source-sync.ts`), check with
`npm run check:source-sync-deploy`.

TLS: `db/ssl.ts`. `PGSSLSERVERNAME` requires `PGSSLROOTCERT` (line 84) — verifying against a name
other than the host dialled is only accepted with a deliberately pinned CA. With a CA and no
server name: `{ rejectUnauthorized: true, ca }` (line 90); with both: `{ rejectUnauthorized: true,
… }` (line 107); default `{ rejectUnauthorized: true }` (line 115). There is no bypass.
Production writes use CA `/Users/admin/rnawiki-backups/railway/postgres-root.crt` with
`PGSSLSERVERNAME=localhost`. `db/migrate.ts:13` notes `sslmode` must not go in the connection
string.

Gate: `npm run gate` = `typecheck && lint && check:copy && check:medicine-content &&
audit:denial-corpus && agents:check && agents:import:check && check:agent-datasets &&
check:four-audience-coverage && check:source-consensus-snapshot && check:dataset-export &&
check:seo && format && npx drizzle-kit check && test:unit && test:integration && build &&
test:e2e`.
`test:integration` and `test:e2e` both wrap through
`scripts/with-disposable-database.ts` (`test:integration:raw` = `vitest run tests/integration`,
`test:e2e:raw` = `playwright test`). `check:seo` runs 22 named unit test files including
`seo-sitemap`, `seo-deployment`, `dossier-indexability`, `indexnow`, `indexnow-submission`,
`discovery-orphan-audit`, `discovery-monitor`, `public-medicine-discovery`,
`public-search-audit`, `json-ld`.
Every database-backed route without a dynamic path segment must set
`export const dynamic = 'force-dynamic'`.

---

## 10. Semantic engine

Library: `lib/semantic/` — `units.ts`, `search.ts`, `lexical.ts`, `lookups.ts`,
`scope-gates.ts`, `result-debugger.ts`. Versions exported as `SEMANTIC_PROJECTOR_VERSION` and
`SCOPE_GATE_VERSION`.

Scripts: `semantic:project` → `scripts/semantic/project-units.ts` (279 ln, writes
`evidence_reading_units`; `projectionInputDigest`, `UNIT_ASSERTIONS`, `UNIT_KINDS`);
`semantic:benchmark` → `scripts/semantic/benchmark.ts` (585 ln, `applyScopeGates`,
`buildEntityIndex`, label tables); `semantic:query` → `scripts/semantic/query.ts` (159 ln), whose
header states verbatim: **"Operator entry point for the evidence engine. Not wired to any page.
Three modes, all read-only"**.

`evidence_reading_units` holds 273,110 rows. `data/semantic/units-summary.json` (2,655 bytes).

**Public path: no.** The only `lib/semantic` import outside `scripts/` is
`app/api/result-debugger/route.ts:8` (`buildCorrectionRow`, `resultDebuggerCorrectionSchema`),
which is gated by `requireAgentReviewer` from `lib/session` — the same steward/administrator
capability as the agent evidence queue — and writes `result_debugger_corrections`. No page
component imports `lib/semantic`, and the Drizzle table symbol `evidenceReadingUnits` has zero
references under `app/`, `lib/` and `components/`.
The embedding model at `rnawiki-ingest-data/models/Xenova/bge-small-en-v1.5/` is loaded only by
offline scripts: `@huggingface/transformers` 4.2.0 is a runtime dependency, and its only two
import sites are `scripts/semantic/benchmark.ts:283` and
`scripts/trial-results/phase5-measure.ts:263`, both dynamic `await import(...)`.
