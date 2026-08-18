import 'dotenv/config'
import { db } from '@/db'
import { legacyRedirects } from '@/db/schema'

/**
 * Seeds explicit /c/{old-slug} -> /r/{new-slug} 301 rows for the launch entities whose old
 * legacy slug does not match (or cannot be assumed to match) its new slug — see
 * docs/legacy-removal-map.md for the full audit. Every other old compound page is handled by
 * middleware.ts's dynamic same-slug lookup and needs no row here.
 *
 * Idempotent: safe to re-run (upserts on the unique fromPath).
 *
 * bpc-157: verified against the crawled legacy route inventory (git tag
 *   legacy-rnawiki-before-proof-boundary, audit/v19/live_route_inventory.csv) — the old site
 *   served /c/bpc-157, and the new entity (scripts/seed-data/bpc-157.ts) uses the same slug.
 *   A row is included for explicitness and audit trail, though middleware's dynamic fallback
 *   would already redirect this one correctly on its own.
 *
 * rapamycin: the old site served /c/rapamycin-sirolimus (confirmed in the same route
 *   inventory), but the new entity (scripts/seed-data/rapamycin-longevity.ts) is seeded under
 *   entity.slug 'rapamycin', not 'rapamycin-sirolimus'. The slugs differ, so this is exactly
 *   the case middleware's same-slug dynamic fallback CANNOT handle — an explicit row is
 *   required. NOTE: this deliberately does not match the literal slug ('rapamycin-longevity')
 *   given for this task, because neither side of that literal instruction is real: no
 *   /c/rapamycin-longevity page ever existed in the old site, and no /r/rapamycin-longevity
 *   entity exists in this build — seeding it as instructed would 301 to a 404. See
 *   docs/legacy-removal-map.md for the full explanation. If scripts/seed-data/
 *   rapamycin-longevity.ts's entity.slug changes before launch, update the toPath below to
 *   match.
 *
 * casgevy: the old site never had a compound page for Casgevy (gene-editing treatments are a
 *   new entity type introduced by this rebuild; absence confirmed against the same route
 *   inventory), so there is no real historical URL to redirect from. Included anyway, at the
 *   letter of this task's instruction, as a harmless no-op safety net — if any external link
 *   ever guesses /c/casgevy, it now goes to the right place instead of a bare 410. It is also
 *   redundant with middleware's dynamic fallback, since old-slug === new-slug here.
 */
const ROWS: { fromPath: string; toPath: string; note: string }[] = [
  {
    fromPath: '/c/bpc-157',
    toPath: '/r/bpc-157',
    note: 'Old compound page migrated to the Proof Boundary entity at the same slug (launch entity).',
  },
  {
    fromPath: '/c/rapamycin-sirolimus',
    toPath: '/r/rapamycin',
    note:
      "Old slug 'rapamycin-sirolimus' differs from the new entity's slug 'rapamycin' (launch entity) — verified against the legacy route inventory and scripts/seed-data/rapamycin-longevity.ts. Update toPath if that seed file's entity.slug changes before launch.",
  },
  {
    fromPath: '/c/casgevy',
    toPath: '/r/casgevy',
    note:
      'No /c/casgevy page existed in the old site (Casgevy is new to this rebuild) — this row is a harmless safety net, not a migration of real old content.',
  },
]

async function main() {
  for (const row of ROWS) {
    await db
      .insert(legacyRedirects)
      .values({ fromPath: row.fromPath, toPath: row.toPath, statusCode: 301, note: row.note })
      .onConflictDoUpdate({
        target: legacyRedirects.fromPath,
        set: { toPath: row.toPath, statusCode: 301, note: row.note },
      })
    console.log(`[seed-legacy-redirects] ${row.fromPath} -> ${row.toPath} (301)`)
  }
  console.log(`[seed-legacy-redirects] done: ${ROWS.length} row(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed-legacy-redirects] failed:', err)
    process.exit(1)
  })
