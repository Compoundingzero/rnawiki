# Phase 2 source integration — precedence rules

**Status:** fixed 2026-09-06 (Phase 2 integration). Written by
`scripts/revamp/integrate_sources.py`; outputs `data/revamp/fields-v2/` (rendering set) and
`data/revamp/fields-v2-gated/` (licence-gated `pgx`, excluded from rendering and from every
presence count). Machine-readable run record: `data/revamp/fields-v2/integration-summary.json`.

The integration reads the corpus-20k field batches and every cleared Phase 2 mapped source, and
writes per-page records in the same schema, 1,000 pages per batch. It never reads DDInter.

## 1. Provenance

Every value row a source contributes carries

```json
{"source": "openfda-label", "source_record_id": "...", "source_url": "https://…",
 "source_date": "2026-05-26", "licence": "CC0 1.0 Universal"}
```

and every field entry carries the full list of contributing provenance objects under `sources`, so
a merged field names every source that stands behind it. `licence` is the licence of that row, under
its short name: a source can publish more than one, and the HSA source is the case that fixed the
rule — its data.gov.sg product listing is under the Singapore Open Data Licence 1.0 while the
Misuse of Drugs Act and Poisons Act schedules are under the Singapore Statutes Online terms, so the
row's own licence text decides and the source's licence is only the fallback. The licence text
exactly as each source publishes it is listed per source in `integration-summary.json`
(`licence_full_text_as_published`, one entry per distinct text) and in `docs/data/LICENSES.md`,
which remains the licence register.

## 2. The two rules that decide most of the merge

**Keep the incumbent unless the new source is strictly more specific.** The corpus value stays where
it is and the new source is added beside it under its own key. A new source replaces an incumbent
value only in the three cases named in §4 (a null reason, an `unknown` status a register now states,
and a `not-applicable` whose stated reason a non-ChEMBL source supersedes).

**A negative register finding never makes a field `present`.** "Not found in the HSA Listing of
Registered Therapeutic Products as of 2026-08-07", an Inxight `interactionFound: false` row, an ARTG
status that was never retrieved, a UK block that reads "UK register not cleared for this run" — all
of these are written into the value so the page can render them under Operating Rule 9, and none of
them counts toward presence. Presence is computed over affirmative rows only. A label section is
affirmative: the section exists and is quoted verbatim, including a section whose own words are
"No drug-drug interaction studies have been performed."

## 3. Specificity ladders, per field

| Field | Ladder, most specific first | What the merge does |
| --- | --- | --- |
| `interactions` | openFDA label `drug_interactions` sentences (tier A) · Inxight curated DDI rows (tier B) · the corpus's own label extraction | tier A sentences under `labelStatements`, tier B rows under `curatedInteractions` with `interactionFound` kept true or false; the corpus's `cyp` and `transporters` lists are untouched |
| `kinetics`, `labelKinetics` | openFDA label `pharmacokinetics` · Inxight FRDB parameter rows · the corpus value | label prose under `labelStatements`, the FRDB numeric rows under `curatedParameters`; a recorded `not-applicable` (NA-COMBINATION) is never overwritten |
| `cyp_profile` (new) | openFDA label extraction (enzyme, role, strength, basis, sentence) · Inxight DDI rows whose target is an enzyme or transporter | merged by (enzyme, role); every merged row lists all its evidence and sources |
| `adverseEvents` | openFDA `warnings_and_cautions` and `overdosage` · Inxight curated adverse-event rows · DrugCentral FAERS | label sections and curated rows merge in. DrugCentral FAERS is written to the `faers` field, which is the model's home for it, and `adverseEvents` carries only a cross-reference to it — a FAERS row alone never makes `adverseEvents` present, so one source is never counted twice |
| `faers` | the corpus value · DrugCentral FAERS disproportionality rows | filled only where the corpus holds none; counts of spontaneous reports, never an incidence |
| `indication` | openFDA `indications_and_usage` (the regulatory text) · DrugCentral OMOP indication and off-label rows · Inxight uses with an approved/off-label flag | the label statement is the statement; the structured rows and the curated uses are added beside it |
| `contraindications` (new) | openFDA `contraindications` · DrugCentral OMOP contraindication rows | |
| `boxedWarning` (new) | openFDA `boxed_warning` only | |
| `regulatory` | per jurisdiction, the national register first | see §5 |
| `controlled` (new) | per jurisdiction, the scheduled list itself | US DEA schedule as recorded on the openFDA NDC product record; AU SUSMP schedule with Schedules 8 and 9 flagged; SG the Misuse of Drugs Act 1973 First and Fourth Schedules, the Poisons Act 1938 Schedule and the Poisons Rules schedules read from Singapore Statutes Online, each entry carrying its statute, schedule, item number and statute version date, with the HSA forensic classification recorded beside them and labelled a supply restriction rather than a controlled-drug schedule |
| `target` | ChEMBL / Open Targets mechanism (the corpus value) · Inxight targets · DrugCentral `act_table` · IUPHAR/BPS · UniProt target records | merged by ChEMBL target id, else UniProt accession, else upper-cased name; every merged target lists every source that named it |
| `mechanismClass` | ChEMBL action types (the corpus value) · Inxight pharmacologic class · DrugCentral MeSH pharmacologic action · IUPHAR ligand action | |
| `potency` (new) | ChEMBL activities carrying a pChEMBL value | grouped per target, assay type and standard type, with n, median, min and max |
| `publicationYears` (new) | ChEMBL `compound_record` document years | |
| `patentStatus` | FDA Orange Book · FDA Purple Book | see §6 |
| `withdrawal` | the withdrawn rule in `docs/specs/field-models.md` · ChEMBL `drug_warning` reason · Inxight marketing status | see §4 |
| `sponsor`, `whyStopped`, `trialHistory` | the corpus value · the ClinicalTrials.gov snapshot | filled only where the corpus holds none |
| `registry` (new) | ClinicalTrials.gov API v2 snapshot 2026-09-01 | the per-page aggregate: trial count, phases, statuses, design, enrolment, results posted, stop reasons, and completion dates split into ACTUAL, ESTIMATED and unstated |
| `identifiers` (new) | PubChem (cid, mw, tpsa, xlogp) · UniProt accessions · GSRS substance class | |

## 4. The three replacements

1. **A null reason.** `withdrawal` keeps its recorded `withdrawn` boolean unchanged — that boolean is
   fixed by the rule in `docs/specs/field-models.md` and this integration never moves it. Where the
   recorded value has no reason and ChEMBL `drug_warning` states one, the reason is filled and
   `reasonSource` names the row it came from. Every stated reason is also kept in `statedReasons`.
2. **An `unknown` status a register now states.** In `regulatory`, a jurisdiction block whose status
   is missing or `unknown` takes the register's status, and the previous value is kept under
   `previousStatus`.
3. **A `not-applicable` whose stated reason is superseded.** The corpus marks `target` and
   `mechanismClass` `not-applicable` on 3,971 pages because "no ChEMBL identifier for this page, so
   the ChEMBL mechanism table cannot be keyed to it". Inxight, DrugCentral, IUPHAR and UniProt are
   keyed on UNII, InChIKey and accession, not on a ChEMBL molecule id. Where one of them states a
   target for such a page the field becomes `present` and the entry records `supersededRule` with
   the previous state and the previous note, so the change is visible on the record itself.

## 5. `regulatory`, per jurisdiction

| Jurisdiction | Source of the status line | Notes |
| --- | --- | --- |
| US | the corpus's Drugs@FDA and Orange Book reading, unchanged | Inxight US marketing status added under `curatedMarketingStatus`; DrugCentral's FDA approval row added under `drugCentral` |
| EU | EMA medicines register | records merged by EMA product number; `Authorised` sets the status; DrugCentral's EMA row recorded beside it |
| JP | PMDA List of Approved Products (New Drugs), English | DrugCentral's PMDA flag is cross-checked and any disagreement is written into `discrepancy` in words; neither reading overrides the other |
| AU | TGA Poisons Standard (SUSMP), June 2026 | `artgStatus` is `null` and `artgStatusNote` carries the recorded reason: the ARTG was not retrieved because the TGA copyright notice permits reproduction for personal or internal organisational use only and eBS disallows all crawling |
| SG | HSA Listing of Registered Therapeutic Products | written on 100 % of pages from `data/sources/hsa-singapore/regulatory-sg-status.parquet`: `registered` on 1,594 pages with the product count and forensic classification, and `not found in the HSA Listing of Registered Therapeutic Products as of 2026-08-07` on 27,238. Only `registered` is affirmative. The block also carries the Singapore controlled-substance status in one line and points at the `controlled` field for the schedules themselves |
| UK | none | the block reads `UK register not cleared for this run` with the reason: the MHRA products database and emc publish no bulk or API route under terms permitting reuse, so nothing was retrieved (`docs/revamp/BLOCKERS.md#mhra-emc`) |
| CA | the corpus's Health Canada reading, unchanged | this run added no Canadian source |

Inxight marketing status is recorded for every jurisdiction it names, under
`curatedMarketingStatusByJurisdiction`, with the note that Inxight is a curated record of upstream
product registers and is not itself a national register. Only its US rows contribute to a status.

The field is written onto DEVELOPMENT records as well, which the DEVELOPMENT model did not carry
before. Gate G2 requires a Singapore registration status on 100 % of pages, and the SUSMP, EMA,
PMDA and HSA registers hold facts about Tier 3 substances.

## 6. `patentStatus` eligibility

A page is **eligible** when it holds an FDA Orange Book product record (a US-approved small
molecule) or an FDA Purple Book product record (a licensed biologic). Eligibility is stated on every
page in the entry's own value:

* eligible and filled → `present`, with the Orange Book patent rows and their expiry dates, the
  exclusivity rows and their expiry dates, the reference-listed-drug flag, the therapeutic
  equivalence codes, the first generic ANDA approval date, and the Purple Book exclusivity block for
  a biologic;
* eligible with nothing listed → `absent`, with the note that the page is eligible and the FDA data
  files list no patent or exclusivity for it;
* not eligible → `not-applicable`, with the reason naming both registers and the file dates they
  were read on (Orange Book 2026-08-14, Purple Book 2026-08-31).

Measured on this run: 3,606 pages eligible, 3,606 filled.

## 7. Multi-ingredient products

The mappers already resolve every product to its components: a combination product's record reaches
each component's page, and additionally the combination page when the page's recorded component set
is exactly the set of resolved components. This integration consumes rows already keyed to a page
and adds no further fan-out. Every mapped key in every source is a corpus page key, verified before
the run.

## 8. The licence gate

PharmGKB/ClinPGx and CPIC rows are loaded and written, as `pgx` entries flagged
`licence_gated: true`, to `data/revamp/fields-v2-gated/` — a separate tree that the census, the
threshold derivation and the rendering set never read. 1,309 pages hold a `pgx` entry. They enter
the rendering set only on the decision recorded in `docs/revamp/BLOCKERS.md#clinpgx`.

## 9. Idempotency

Every run rewrites both output trees from the corpus files and the mapped parquets, clearing stale
batches first, so re-running after a source lands changes the answer with no manual step. The one
day-dependent value is `lastVerified`, which takes `--run-date` and defaults to the current date.

## 10. What an unfilled field says

A field this run did not fill still names every source that was searched for it. `consulted` on an
`absent` or `not-applicable` entry carries the corpus's own list plus the Phase 2 sources and their
dataset dates, so a page renders "not found in [sources checked, date]" rather than a blank, as
Operating Rule 9 requires. The lists are held in `ALSO_CONSULTED` in
`scripts/revamp/integrate_sources.py` and cover `interactions`, `adverseEvents`, `indication`,
`kinetics`, `labelKinetics`, `faers`, `withdrawal`, `target` and `mechanismClass`; the eight new
fields carry theirs from the builder that writes them.
