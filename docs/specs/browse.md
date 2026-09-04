# Browse (R12) — every indexed record within three clicks of the home page

**Status:** designed 2026-09-04 (Fable). Built by Opus in Phase 4.

## Entry points (click 1 from home, via the facet strip)

Five facet indexes, each one page listing its facet values with counts as markup rows:

- **Class**: ATC first level where ChEMBL records an ATC code (stored on `corpus_pages.atc_codes`,
  CC BY-SA noted in licence_notes), else the entity class (stored on `corpus_pages.entity_class`
  for every model by the loader). Pages with neither do not appear in this facet.
- **Pathway**: the LONGEVITY field 8 vocabulary (mTOR, AMPK, sirtuin, senolytic, autophagy, NAD+,
  IGF-1) plus "other named".
- **Evidence tier**: top organism rung with human data yes/no (eight rungs × 2).
- **Regulatory status**: per jurisdiction (US, EU, CA) × status (approved, withdrawn, supplement/OTC,
  controlled, unknown).
- **Tier / model**: Longevity, Clinical, Withdrawn arc, Development (Tier 3 listed but its records
  are noindex and the facet page carries `rel="nofollow"` on Tier 3 links to limit inbound links, R6).

## Facet pages (click 2)

One page per facet value, 60 records per page, ordered by present-field count then name; when a
value holds more than 300 records it splits by initial letter (A–Z sub-pages, each ≤ 300, paginated
at 60). Every record row = the badge triplet (as markup) + name + one value-bearing question string
(the first derived question) — so rows differ per record and repeat no prose. Rows are `<li>` with
data attributes, never sentences.

## Record (click 3)

Home → facet index → facet page (or its letter sub-page → page n) → record. The longest path is
home → facet index → letter sub-page → page n → record, which is four clicks for a value above 300
records in one letter; the letter split keeps that rare. The orphan audit after each deployment
reports the click depth distribution and lists any indexed record deeper than three.

## Sitemap and indexing

A sitemap index (`/sitemap.xml` → `/sitemaps/tier-1.xml`, `/sitemaps/tier-2.xml`,
`/sitemaps/browse.xml`, `/sitemaps/pages.xml`), each ≤ 50,000 URLs, covering indexed tiers only.
Tier 3 pages carry `<meta name="robots" content="noindex, follow">` and are absent from every
sitemap and never robots-disallowed. Browse pagination pages are indexable and self-canonical
(the earlier fix stands).

## Internal search

Ranks Tier 1, then Tier 2, then Tier 3; a Tier 3 stub shows its field count in the result row so a
reader knows before clicking.
