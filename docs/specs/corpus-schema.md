# Corpus pages schema (Phase 5, migration 0024)

**Status:** designed 2026-09-04 (Fable). Built by Opus as a Drizzle migration with a replay test on a
disposable database. Nothing reviewed or published in the programme tables is touched; the legacy
`drugs` rows stay and are linked by slug.

## Tables

- `corpus_pages` — one row per canonical page: `key` (PK, the R1 key), `slug` (unique; existing slug
  where KEEP/RETAIN, else derived from the display name with a collision suffix), `display_name`,
  `model` (LONGEVITY | CLINICAL | DEVELOPMENT), `tier` (1 | 2 | 3), `page_type` (longevity |
  clinical | withdrawn | development | stub), `indexable` (bool, from Gate 1b), `suppressed` (bool),
  `suppression_classes` (text[]), `present_field_count`, `structure_inchikey`, `unii`, `chembl_id`,
  `pubchem_cid`, `cas`, `rxcui`, `legacy_drug_id` (nullable FK to `drugs.id`), `identity_rank`,
  `identity_rule`, `licence_notes` (text[]; e.g. "ChEMBL fields CC BY-SA"), `created_at`,
  `updated_at`, `corpus_digest` (sha256 of the page's field payload; the export/agents chain reads it).
- `page_synonyms` — `key`, `name`, `kind` (inn | usan | ban | jan | brand | salt | code | fragment |
  common), `source`.
- `page_fields` — `key`, `field` (the model field id), `state` (present | absent | not-applicable),
  `value` (jsonb, verbatim), `source_kind`, `source_id`, `source_url`, `source_date`, `last_verified`,
  `verbatim` (bool). PK (key, field, ordinal).
- `page_seeds` — `key`, `seed` (1–17), `values` (jsonb), `sources` (jsonb), `computed_at`. Rows for
  seeds 1, 2 and 6 cannot exist for a suppressed key (CHECK via a trigger that reads
  `corpus_pages.suppressed`).
- `page_questions` — `key`, `ordinal`, `block`, `template`, `text`, `paragraph_1`, `paragraph_2`,
  `anchors` (jsonb: [{paragraph, source_kind, source_id, source_date}]), `revealed` (jsonb rows).
- `page_relations` — `key`, `relation` (ester-of | prodrug-of | stereoisomer-of | racemate-of |
  biosimilar-of | contains | isotopologue-of | same-target | shares-enzyme), `target_key`, `label`,
  `source`. Bipartite by construction for same-target/shares-enzyme (page → node → page is
  materialised only as page → node rows, never page → page prose).
- `page_sources` — the source list per page: `key`, `source_kind`, `source_id`, `source_url`,
  `source_date`, `title`, `licence`.
- `page_registry_studies` — `key`, `nct`, `role`, `matched_name` (links to the stored registry
  snapshot rows; aggregates are computed at read time from these rows, not stored as prose).
- `medicine_slug_redirects` (existing) gains the 864 REDIRECT rows; `corpus_pages.slug` for those
  targets is the surviving slug.

## Indexability and sitemap

`indexable` = tier ∈ {1,2} AND present_field_count ≥ Gate 1b threshold AND page_type ≠ stub. The
sitemap index reads `corpus_pages` where `indexable`; Tier 3 never appears; `pageRobotsMetadata`
returns noindex,follow for non-indexable pages.

## Freshness (R9 design only)

`page_fields.source_date` and `last_verified` per row. Cadence design (not built in this run):
often-changing fields (ongoing trials, FAERS, regulatory status, withdrawal) re-verified monthly
from the same bulk files; rarely-changing (kinetics, mechanism, ITP, ladder) re-verified on source
release (ChEMBL release, MPD update) or yearly; a verification pass writes `last_verified` only
when the value is unchanged and opens a review task when it changed, never a silent rewrite.
