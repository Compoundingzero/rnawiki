import 'dotenv/config'
import { and, eq, inArray } from 'drizzle-orm'

import { MEDICINE_NAME_INDEX } from './seed-data/background/name-index.generated'

/**
 * Writes the searchable-name index into `drug_aliases`.
 *
 * Search already knew how to use aliases — `searchDrugs` joins the table and ranks an exact alias
 * near an exact name. What it never had was aliases: only the full ingest wrote any, and only about
 * sixty hand-curated international spellings, so a seeded database had none at all and a reader
 * typing the name printed on their box got nothing. Measured against the label archive, 78% of
 * brand names and 77% of generic names returned no result.
 *
 * Shipping the index with the dataset, the way `apply:background` ships recorded background, makes
 * search work wherever the data is applied rather than only where a full ingest has run.
 *
 * The write is additive and idempotent. Aliases this index owns are replaced for the medicines it
 * covers; aliases written by ingestion for medicines it does not cover are left alone, and a
 * conflict on the unique (drug_id, lower(alias)) index is skipped rather than overwritten, so a
 * curated spelling always survives a rerun.
 *
 * Usage:
 *   npx tsx scripts/apply-name-index.ts [--check]
 */

const BATCH_SIZE = 500
/** Kinds this index writes. A curated `inn`/`usan` row is never touched. */
type OwnedAliasKind = 'brand' | 'salt_form' | 'common_name'

async function main() {
  const checkOnly = process.argv.includes('--check')
  const entries = Object.entries(MEDICINE_NAME_INDEX)
  const aliasCount = entries.reduce((total, [, aliases]) => total + aliases.length, 0)
  console.log(`[names] ${aliasCount} alias(es) across ${entries.length} medicine(s)`)

  // Every alias must be a non-empty string within the column's width, checked before any write so
  // a malformed index fails loudly rather than half-applying.
  const malformed = entries.flatMap(([slug, aliases]) =>
    aliases
      .filter((entry) => entry.alias.trim().length === 0 || entry.alias.length > 300)
      .map((entry) => `${slug}: ${JSON.stringify(entry.alias).slice(0, 60)}`),
  )
  if (malformed.length > 0) {
    console.error(`[names] ${malformed.length} malformed alias(es):`)
    for (const entry of malformed.slice(0, 10)) console.error(`    ${entry}`)
    process.exit(1)
  }
  if (checkOnly) {
    console.log('[names] index is well formed')
    return
  }

  const [{ db }, { drugAliases, drugs }, { newId }] = await Promise.all([
    import('@/db'),
    import('@/db/schema'),
    import('@/lib/ids'),
  ])

  // Slugs are resolved to ids in one pass rather than per medicine: 2,000 round trips to learn
  // 2,000 ids is the difference between a deploy step and a deploy that looks hung.
  const slugs = entries.map(([slug]) => slug)
  const idBySlug = new Map<string, string>()
  for (let offset = 0; offset < slugs.length; offset += BATCH_SIZE) {
    const rows = await db
      .select({ id: drugs.id, slug: drugs.slug })
      .from(drugs)
      .where(inArray(drugs.slug, slugs.slice(offset, offset + BATCH_SIZE)))
    for (const row of rows) idBySlug.set(row.slug, row.id)
  }

  const rows: Array<{
    id: string
    drugId: string
    alias: string
    kind: OwnedAliasKind
    source: string
  }> = []
  let missingMedicines = 0
  for (const [slug, aliases] of entries) {
    const drugId = idBySlug.get(slug)
    if (!drugId) {
      missingMedicines += 1
      continue
    }
    for (const entry of aliases) {
      rows.push({
        id: newId('alias'),
        drugId,
        alias: entry.alias.trim(),
        kind: entry.kind,
        source: 'openFDA published label name',
      })
    }
  }

  // Only the kinds this index owns are cleared, so an ingest-written INN spelling survives.
  const drugIds = [...new Set(rows.map((row) => row.drugId))]
  for (let offset = 0; offset < drugIds.length; offset += BATCH_SIZE) {
    const batch = drugIds.slice(offset, offset + BATCH_SIZE)
    await db
      .delete(drugAliases)
      .where(
        and(
          eq(drugAliases.source, 'openFDA published label name'),
          inArray(drugAliases.drugId, batch),
        ),
      )
  }

  let written = 0
  for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
    const inserted = await db
      .insert(drugAliases)
      .values(rows.slice(offset, offset + BATCH_SIZE))
      .onConflictDoNothing()
      .returning({ id: drugAliases.id })
    written += inserted.length
  }

  console.log(
    `[names] wrote ${written} alias row(s) · ${rows.length - written} already present · ${missingMedicines} medicine(s) in the index had no row`,
  )
  process.exit(0)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
