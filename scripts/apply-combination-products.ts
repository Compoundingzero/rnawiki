import 'dotenv/config'
import { eq, inArray } from 'drizzle-orm'

import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import { COMBINATION_PRODUCTS } from './seed-data/background/combination-products.generated'

/**
 * Creates the medicine rows for combination products, and the aliases that reach them.
 *
 * These pages did not exist. The corpus aggregates one record per active moiety, so a product with
 * two moieties belonged to neither and had no page — amoxicillin with clavulanate,
 * sulfamethoxazole with trimethoprim, carbidopa with levodopa, sacubitril with valsartan,
 * buprenorphine with naloxone. A reader searching any of their brand names found nothing.
 *
 * The write is additive and idempotent. A slug that already exists is left completely alone: this
 * script never edits an existing medicine, because a curated record must not be overwritten by a
 * generated one. Re-running refreshes only the recorded background of rows this script created.
 *
 * Every record is validated by the background engine again here, against the same rules the rest of
 * the corpus passes, so a dataset that drifted from the engine cannot reach a live page.
 *
 * Usage:
 *   npx tsx scripts/apply-combination-products.ts [--check]
 */

const BATCH_SIZE = 200
/** Marks the rows this script owns, so a rerun can refresh them without touching anything else. */
const PROVENANCE = 'rnawiki:combination-product'
/** `sourceProvenance` is a list of the sources an identity was built from. */
const PROVENANCE_LIST = [PROVENANCE, 'openFDA published label'] as const

/**
 * Joins brand names into the trade-name field without overflowing it.
 *
 * Counting names rather than characters overflowed on one product whose four brand names ran to 421
 * characters against a 400-character column. Every brand is still reachable through the alias rows
 * this script writes; the trade-name field is only the display line.
 */
function joinWithinLimit(names: readonly string[], limit: number): string {
  const parts: string[] = []
  let length = 0
  for (const name of names) {
    const trimmed = name.trim()
    const cost = trimmed.length + (parts.length > 0 ? 3 : 0)
    if (length + cost > limit) break
    parts.push(trimmed)
    length += cost
  }
  return parts.join(' / ')
}

async function main() {
  const checkOnly = process.argv.includes('--check')
  console.log(`[combinations] ${COMBINATION_PRODUCTS.length} product record(s)`)

  let failures = 0
  for (const product of COMBINATION_PRODUCTS) {
    const report = runBackgroundIntelligence(product.background)
    if (!report.passed) {
      failures += 1
      console.error(
        `[combinations] ${product.slug}: ${report.findings.map((finding) => finding.code).join(', ')}`,
      )
    }
  }
  if (failures > 0) {
    console.error(`[combinations] ${failures} record(s) failed the background engine`)
    process.exit(1)
  }
  console.log(
    `[combinations] all records pass ${runBackgroundIntelligence(COMBINATION_PRODUCTS[0]!.background).engineVersion}`,
  )
  if (checkOnly) return

  const [{ db }, { drugAliases, drugs }, { newId }] = await Promise.all([
    import('@/db'),
    import('@/db/schema'),
    import('@/lib/ids'),
  ])

  // Existing slugs are resolved first so the script can tell a row it created from one it must not
  // touch. A curated medicine that happens to share a slug wins, always.
  const slugs = COMBINATION_PRODUCTS.map((product) => product.slug)
  const existing = new Map<string, { id: string; sourceProvenance: string[] }>()
  for (let offset = 0; offset < slugs.length; offset += BATCH_SIZE) {
    const rows = await db
      .select({ id: drugs.id, slug: drugs.slug, sourceProvenance: drugs.sourceProvenance })
      .from(drugs)
      .where(inArray(drugs.slug, slugs.slice(offset, offset + BATCH_SIZE)))
    for (const row of rows) {
      existing.set(row.slug, { id: row.id, sourceProvenance: row.sourceProvenance ?? [] })
    }
  }

  let created = 0
  let refreshed = 0
  let leftAlone = 0
  const aliasRows: Array<{
    id: string
    drugId: string
    alias: string
    kind: 'brand'
    source: string
  }> = []

  for (const product of COMBINATION_PRODUCTS) {
    const held = existing.get(product.slug)
    if (held && !held.sourceProvenance.includes(PROVENANCE)) {
      // Someone else's row. Not this script's to change.
      leftAlone += 1
      continue
    }

    let drugId = held?.id
    if (!drugId) {
      drugId = newId('drug')
      await db.insert(drugs).values({
        id: drugId,
        slug: product.slug,
        name: product.name,
        // A combination of small molecules is what nearly all of these are; the field is a coarse
        // display category and a wrong guess here would be a claim, so it stays at the value the
        // ingredients support.
        modality: 'Small Molecule',
        approvalStatus: 'FDA Approved',
        sourceProvenance: [...PROVENANCE_LIST],
        recordedBackground: product.background,
        tradeName: joinWithinLimit(product.brandNames, 400),
      })
      created += 1
    } else {
      await db
        .update(drugs)
        .set({ recordedBackground: product.background, name: product.name })
        .where(eq(drugs.id, drugId))
      refreshed += 1
    }

    // Every brand name reaches the page, which is the point: a reader types Augmentin, not
    // "amoxicillin and clavulanate".
    for (const brand of product.brandNames) {
      const trimmed = brand.trim()
      if (trimmed.length < 3 || trimmed.length > 300) continue
      aliasRows.push({
        id: newId('alias'),
        drugId,
        alias: trimmed,
        kind: 'brand',
        source: PROVENANCE,
      })
    }
  }

  let aliasesWritten = 0
  for (let offset = 0; offset < aliasRows.length; offset += BATCH_SIZE) {
    const inserted = await db
      .insert(drugAliases)
      .values(aliasRows.slice(offset, offset + BATCH_SIZE))
      .onConflictDoNothing()
      .returning({ id: drugAliases.id })
    aliasesWritten += inserted.length
  }

  console.log(
    `[combinations] created ${created} · refreshed ${refreshed} · left alone ${leftAlone} · ${aliasesWritten} brand alias(es) written`,
  )
  process.exit(0)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
