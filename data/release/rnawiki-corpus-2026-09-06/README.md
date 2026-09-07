# RNAWiki open drug corpus, 2026-09-06

A record of what is known about 28,818 substances and substance combinations: identity, field values, drug-interaction rows with the rule that produced each one, registration, patent and controlled-substance blocks, Tier 3 sections and derived sections.

The compilation is released under CC BY-SA 4.0. The upstream records inside it stay under their own licences: every value names its source and that source's licence, and `LICENSES.md` carries the full licence text as published, with the retrieval date and the terms for each one. Attribution for a source that requires it is the wording in `LICENSES.md`, not this file.

## What is in the release

| File | Rows | What it holds |
| --- | --- | --- |
| `pages.ndjson` | 28,818 | one record per page: key, slug, display name, tier, model, identifiers, synonyms, merge history, relations to other pages, and the applicable/present field counts |
| `fields.ndjson` | 28,832 | one record per page holding its field values (498,067 values kept, 4,927 omitted for licence) — each value carries its state, source, source date and licence, and `omittedFields` names every field left out and why |
| `interactions.parquet` | 535,118 | interaction rows in tiers A (a statement read from a drug label), B (a curated interaction record) and C (predicted from mechanism), each with `rule_id`, `derivation`, `source`, `source_url` and `licence` |
| `blocks/registration.parquet` | 220,877 | the registration block as rendered, with provenance |
| `blocks/patent.parquet` | 28,832 | the patent block as rendered, with provenance |
| `blocks/controlled.parquet` | 8,738 | the controlled block as rendered, with provenance |
| `tier3-sections.parquet` | 30,036 | the per-compound Tier 3 sections with the fields each sentence was built from |
| `derived/seed-*.ndjson` | 46,918 | the derived sections, one file per seed, each record carrying the values and sources it was computed from |
| `LICENSES.md` | — | every source, its URL, retrieval date, licence and terms |
| `CITATION.cff` | — | citation metadata |
| `SHA256SUMS` | — | SHA256 of every file above |

## Tiers, and what a missing value means

Tier 1 (Longevity), Tier 2 (Clinical) and Tier 3 (Development) are the three field models the corpus uses; a page's tier decides which fields can apply to it at all. A field that is `absent` was looked for and not found, and the `note` says where it was looked for. A field that is `not-applicable` cannot apply to that page's model. Neither is a gap in the data and neither should be read as a negative finding: an interaction that no source records is recorded as not found in the sources checked on the date checked, never as an absence of interaction.

## Licence gate

A value is in this release only where its source's row in `LICENSES.md` records that redistribution and commercial use are both permitted. Those sources are:

| Source | Licence | Class |
| --- | --- | --- |
| ATC classification as distributed by ChEMBL 37 (atc_class) | CC BY-SA 3.0 | cc-by-sa |
| ChEMBL 37 | CC BY-SA 3.0 | cc-by-sa |
| ChEMBL 37 drug_warning (the corpus writes this token for withdrawal reasons) | CC BY-SA 3.0 | cc-by-sa |
| ClinicalTrials.gov API v2 | Public domain (US Government work) | public-domain |
| ClinicalTrials.gov API v2 studies snapshot | Public domain (US Government work) | public-domain |
| DrugCentral 2023 | CC BY-SA 4.0 | cc-by-sa |
| Drugs@FDA (openFDA) | CC0 1.0 Universal | public-domain |
| European Medicines Agency medicines register | EMA copyright and limited reproduction notice | open-attribution |
| FDA Orange Book and Purple Book data files | Public domain (US Government work) | public-domain |
| GSRS public data export (FDA/NCATS) | Public domain | public-domain |
| HSA Listing of Registered Therapeutic Products (data.gov.sg) | Singapore Open Data Licence 1.0 | open-attribution |
| Health Canada Drug Product Database | Open Government Licence – Canada 2.0 | open-attribution |
| IUPHAR/BPS Guide to PHARMACOLOGY 2026.2 | CC BY-SA 4.0 (contents); ODbL (database) | cc-by-sa |
| NCATS Inxight Drugs | Public domain (US Government work) | public-domain |
| NIA ITP lifespan workbooks via JAX Mouse Phenome Database | MPD terms: contributors waive copyright; cite the ITP publication | open-attribution |
| Open Targets Platform 26.06 | CC0 1.0 | public-domain |
| Open Targets Platform 26.06 (FAERS) | CC0 1.0 | public-domain |
| Open Targets Platform 26.06 (drug warnings) | CC0 1.0 | public-domain |
| PMDA List of Approved Products (New Drugs), English | Public Data License 1.0 (Japan) | open-attribution |
| Poisons Standard (SUSMP), Therapeutic Goods (Poisons Standard—June 2026) Instrument 2026, F2026L00633, Federal Register of Legislation | CC BY 4.0 | cc-by |
| PubChem | Public domain (NIH/NCBI) | public-domain |
| PubMed E-utilities metadata (NLM) | Public domain | public-domain |
| Singapore Statutes Online (AGC) | AGC Terms of Use clause 13 permission | open-attribution |
| UniProtKB release 2026_03 | CC BY 4.0 | cc-by |
| composite of the registers above | per constituent register | open-attribution |
| openFDA NDC | CC0 1.0 Universal | public-domain |
| openFDA drug label / DailyMed SPL | CC0 1.0 Universal | public-domain |
| openFDA drug label / DailyMed SPL, through the corpus's recorded-background registry | CC0 1.0 Universal | public-domain |
| openFDA enforcement | CC0 1.0 Universal | public-domain |

Excluded, and why:

| Source | Licence | Why it is not here |
| --- | --- | --- |
| CPIC | CC0 1.0 | carried only alongside the ClinPGx rows, which are excluded |
| DDInter 2.0 | CC BY-NC-SA 4.0 | non-commercial |
| DrugBank | No licence held | no DrugBank licence is held |
| Europe PMC | Europe PMC terms: metadata and abstracts reusable; full text per article licence | the values are verbatim sentences whose licence is the individual article's and is not established per record |
| MHRA products database and emc | No reuse licence | no licence |
| PharmGKB / ClinPGx | CC BY-SA 4.0 with added no-sale and research-purpose conditions | the added conditions are not a free redistribution grant |

DDInter 2.0 and the ClinPGx/PharmGKB pharmacogenomic rows are not merely filtered out of this build: they are held outside the corpus entirely, at `data/validation/ddinter` and `data/revamp/fields-v2-gated`, and the build reads neither path.

## Per-field provenance

| Field | Sources that fill it in this release |
| --- | --- |
| `adverseEvents` | NCATS Inxight Drugs, openFDA drug label / DailyMed SPL |
| `biomarkers` | ClinicalTrials.gov API v2 |
| `boxedWarning` | openFDA drug label / DailyMed SPL |
| `contraindications` | DrugCentral 2023, openFDA drug label / DailyMed SPL |
| `controlled` | HSA Listing of Registered Therapeutic Products (data.gov.sg), Poisons Standard (SUSMP), Therapeutic Goods (Poisons Standard—June 2026) Instrument 2026, F2026L00633, Federal Register of Legislation, openFDA NDC |
| `cyp_profile` | NCATS Inxight Drugs, openFDA drug label / DailyMed SPL |
| `endpointType` | RNAWiki (computed) |
| `everDosedInHumans` | ChEMBL 37, ClinicalTrials.gov API v2 |
| `faers` | DrugCentral 2023, Open Targets Platform 26.06, Open Targets Platform 26.06 (FAERS) |
| `highestPhase` | ChEMBL 37, ClinicalTrials.gov API v2 |
| `humanCeiling` | ClinicalTrials.gov API v2 |
| `identifiers` | GSRS public data export (FDA/NCATS), PubChem, UniProtKB release 2026_03 |
| `indication` | DrugCentral 2023, NCATS Inxight Drugs, openFDA drug label / DailyMed SPL |
| `interactions` | NCATS Inxight Drugs, openFDA drug label / DailyMed SPL |
| `itp` | NIA ITP lifespan workbooks via JAX Mouse Phenome Database |
| `kinetics` | NCATS Inxight Drugs, openFDA drug label / DailyMed SPL |
| `labelKinetics` | NCATS Inxight Drugs, openFDA drug label / DailyMed SPL |
| `mechanismClass` | ChEMBL 37, DrugCentral 2023, IUPHAR/BPS Guide to PHARMACOLOGY 2026.2, NCATS Inxight Drugs |
| `ongoingTrials` | ClinicalTrials.gov API v2 |
| `patentStatus` | FDA Orange Book and Purple Book data files |
| `pathway` | ChEMBL 37, Open Targets Platform 26.06 |
| `potency` | ChEMBL 37 |
| `publicationYears` | ChEMBL 37 |
| `registry` | ClinicalTrials.gov API v2 |
| `regulatory` | DrugCentral 2023, European Medicines Agency medicines register, HSA Listing of Registered Therapeutic Products (data.gov.sg), NCATS Inxight Drugs, PMDA List of Approved Products (New Drugs), English, Poisons Standard (SUSMP), Therapeutic Goods (Poisons Standard—June 2026) Instrument 2026, F2026L00633, Federal Register of Legislation, composite of the registers above |
| `relatedOnTarget` | ChEMBL 37 |
| `sponsor` | ClinicalTrials.gov API v2 |
| `target` | ChEMBL 37, DrugCentral 2023, IUPHAR/BPS Guide to PHARMACOLOGY 2026.2, NCATS Inxight Drugs, Open Targets Platform 26.06, UniProtKB release 2026_03 |
| `trialFailures` | ClinicalTrials.gov API v2, ClinicalTrials.gov API v2 studies snapshot |
| `trialHistory` | ClinicalTrials.gov API v2 studies snapshot, PubMed E-utilities metadata (NLM) |
| `whyStopped` | ClinicalTrials.gov API v2 |
| `withdrawal` | ChEMBL 37 drug_warning (the corpus writes this token for withdrawal reasons), European Medicines Agency medicines register, Open Targets Platform 26.06 (drug warnings), composite of the registers above, openFDA enforcement |

## Known gaps in this build

`pages.ndjson` is built from the identity pass and `fields.ndjson` from the field pass, and the two disagree on 118 pages: 66 pages carry field values but no identity record, and 52 identity records carry no measured field counts. The keys are listed in `build-summary.json` under `consistency`. Neither file was padded to hide the difference.

## How it was built

`scripts/revamp/build_release.py`, run on 2026-09-06T06:02:58+00:00 against git commit `0d698573667651ba09ef45ed9958042ea509907a`. Inputs: `data/revamp/identity/canonical-v3.ndjson`, `data/revamp/fields-v2`, `data/revamp/interactions/interactions.parquet`, `data/revamp/blocks`, `data/revamp/tier3-sections.parquet` and `data/revamp/derived-v2`.
