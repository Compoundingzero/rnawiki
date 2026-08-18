// Known-good slugs for the three entities scripts/seed-data/*.ts is expected to seed, read
// directly from those files on 2026-08-18.
//
// NOTE: the task brief that scoped this test suite referred to the third entity's slug as
// "rapamycin-longevity", but the actual seed file (scripts/seed-data/rapamycin-longevity.ts)
// sets `slug: 'rapamycin'` — the filename and the URL slug differ. These specs use the real
// seeded slug (`rapamycin`) so they match what /r/[slug] will actually resolve once seeding
// runs; if the seed file's slug is ever renamed to match the filename, update SEEDED_SLUGS.rapamycin
// here and every spec that imports it updates automatically.
export const SEEDED_SLUGS = {
  bpc157: 'bpc-157',
  casgevy: 'casgevy',
  rapamycin: 'rapamycin',
} as const

export const SEEDED_ENTITY_NAME = 'BPC-157'
