# Data card — the RNAWiki evidence record (2026-09-10)

## What the numbers mean

| Number | What it counts                                                              | Where                                                |
| ------ | --------------------------------------------------------------------------- | ---------------------------------------------------- |
| 8,987  | Legacy medicine rows the public discovery filter shows on the live homepage | `countDrugs()` under `publicMedicineDiscoveryFilter` |
| 9,859  | Rows in the legacy `drugs` table (local copy)                               | `drugs`                                              |
| 9,852  | Legacy rows with a completion assessment                                    | `dossier_completion_assessments`                     |
| 28,832 | Identity pages in the revamp corpus (three tiers)                           | `data/revamp/identity/canonical-v7.ndjson`           |
| 1,698  | Tier-1 pages loaded into the rebuild database on 2026-09-10                 | `corpus_pages` (local)                               |
| 294    | Pages that pass the indexability ruler (thresholds v14)                     | `data/revamp/thresholds-v14.json`                    |
| 0      | Pages with a reviewed conclusion for any use                                | `programme_current_publications`, `reviewed_claims`  |

An inventory count is not a completeness count. The homepage's "medicine records" figure is the
number of identity rows, not the number of dossiers with a reviewed answer, which is zero.

## Sources and licences

Per-source licences, retrieval dates and reuse terms are recorded in `docs/data/LICENSES.md` and
`docs/specs/corpus-20k-sources.md`. Sources in the loaded record: ClinicalTrials.gov (US
Government work; snapshot 2026-09-01T09:00:05, 601,158 studies, fields listed in the snapshot
manifest — no arm groups), openFDA / DailyMed labels (public domain), Open Targets adverse-event
signals (CC0; reaction-term counts, not report counts), ChEMBL (CC BY-SA), PubChem, GSRS, NCATS
Inxight, DrugCentral (CC BY-SA), Europe PMC metadata, the Orange and Purple Books, HSA Singapore
listing (Singapore Open Data Licence), SUSMP (CC BY), PMDA and Health Canada listings. DDInter 2.0
is CC BY-NC-SA and is used for validation only, never rendered.

## Provenance state

- Corpus rows carry a source label, record id, URL and date (`page_sources`, `page_fields`), not a
  content hash and not a foreign key to `source_snapshots`. The v3 page labels these citations
  "recorded source, not a stored snapshot".
- `reviewed_claims.source_snapshot_ids` references immutable `source_snapshots` rows. Every public
  claim sentence therefore binds to an exact snapshot; every corpus fact binds to a dated record.
- The ledger `entity_corrections` records every repair with before/after/reason/evidence.

## Known contamination and quarantine state

- creatine ↔ Tribulus terrestris: corrected locally (synonym and five studies removed, six ledger
  rows). Not yet applied to production.
- 173 legacy rows keyed by a PubChem name lookup, 26 returning multi-component structures; 127
  M-SALT merges across name families with confirmed errors (glycine ← ferrous bisglycinate and
  aluminium–zirconium antiperspirants; Cu-64 dotatate ← Lu-177 oxodotreotide; amfetamine ←
  amphetamine combination). Listed in the audit as fixtures 5–7; not yet corrected.
- `creatine-gluconate` is a separate `K4` page inheriting creatine's registry set.
- 50,114 of 326,420 registry matches (15.4 %) came through an other-name; 94 pages truncated at the
  500-study cap; 286 pages with a maximum enrolment above 100,000; 2,290 pages whose "longest"
  study has a planned completion.

## Completion states

Every Decision Card field on a v3 page carries one of eight explicit states
(`docs/evidence-and-outcome-taxonomy.md`). On 2026-09-10 the four gold pages resolve as: what it
is — verified (register + identity class); why people use it — awaiting review (legacy indication
shown as recorded, unreviewed) or no qualifying evidence (creatine); best-supported result —
awaiting review (no reviewed claim) on all four; serious concern — verified from the boxed warning
where one is stored (semaglutide, metformin), otherwise no qualifying evidence; supervision —
verified; human evidence — verified from role classification; last check — verified.

## Privacy

No personal data is in the record. Analytics send only page views after consent, with query
strings and fragments stripped; the page path still names the substance viewed. The stack checker
and experiment planner, when built, keep their inputs in the browser only
(`docs/privacy-and-medical-safety-boundaries.md`).

## Regeneration

`npm run db:migrate` · loader commands in `docs/rnawiki-biohacker-rebuild-audit.md` §Commands ·
`npx tsx scripts/dossier-v3/backfill-trial-roles.ts --all` ·
`npx tsx scripts/dossier-v3/apply-identity-corrections.ts <file> --apply`.
