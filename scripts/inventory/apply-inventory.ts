import 'dotenv/config'
import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { inventoryResolutions, medicineSlugRedirects } from '@/db/schema'
import { resolveInventory, type InventoryResolutionResult } from '@/lib/inventory/resolve'

import { loadInventoryRows } from './resolve-inventory'

/**
 * Writes the inventory resolution into the database and records every duplicate as a redirect.
 *
 * The redirect ledger is the single source the public route follows, so a duplicate row becomes a
 * one-hop permanent redirect the moment its ledger row exists. Each ledger row carries the exact
 * deterministic evidence as its rationale. The write is idempotent: an unchanged resolution changes
 * nothing, and a ledger row that already exists is left alone. Nothing here deletes a medicine row.
 *
 *   npx tsx scripts/inventory/apply-inventory.ts            apply
 *   npx tsx scripts/inventory/apply-inventory.ts --dry-run  report only
 */

export async function applyInventoryResolution(
  result: InventoryResolutionResult,
  options: { dryRun: boolean },
): Promise<{ resolutionsWritten: number; redirectsWritten: number; redirectsExisting: number }> {
  if (!result.summary.accountingBalanced) throw new Error('inventory accounting does not balance')
  if (result.summary.manualReviewRequired > 0) {
    throw new Error(
      `${result.summary.manualReviewRequired} record(s) require manual identity review; refusing to apply`,
    )
  }
  let resolutionsWritten = 0
  let redirectsWritten = 0
  let redirectsExisting = 0

  await db.transaction(async (tx) => {
    for (const resolution of result.resolutions) {
      const values = {
        drugId: resolution.originalRecordId,
        resolverVersion: resolution.resolverVersion,
        resolutionStatus: resolution.resolutionStatus,
        entityClass: resolution.entityClass,
        entityClassRule: resolution.entityClassRule,
        canonicalDrugId: resolution.canonicalEntityId,
        canonicalSlug: resolution.canonicalSlug,
        redirectTargetSlug: resolution.redirectTarget,
        identityConfidence: resolution.identityConfidenceState,
        identitySources: resolution.identitySources,
        attributionWarnings: resolution.attributionWarnings,
        resolutionEvidence: resolution.resolutionEvidence,
        contentDigest: resolution.contentDigest,
      }
      if (!options.dryRun) {
        const written = await tx
          .insert(inventoryResolutions)
          .values(values)
          .onConflictDoUpdate({
            target: inventoryResolutions.drugId,
            set: { ...values, resolvedAt: sql`now()` },
            // Re-running over unchanged inputs must not move resolvedAt.
            setWhere: sql`${inventoryResolutions.contentDigest} <> ${values.contentDigest} or ${inventoryResolutions.resolverVersion} <> ${values.resolverVersion} or ${inventoryResolutions.resolutionStatus} <> ${values.resolutionStatus}`,
          })
          .returning({ drugId: inventoryResolutions.drugId })
        resolutionsWritten += written.length
      }

      if (resolution.resolutionStatus === 'DUPLICATE_OF_CANONICAL_ENTITY') {
        const existing = await tx
          .select({ oldSlug: medicineSlugRedirects.oldSlug })
          .from(medicineSlugRedirects)
          .where(sql`${medicineSlugRedirects.oldSlug} = ${resolution.originalSlug}`)
          .limit(1)
        if (existing[0]) {
          redirectsExisting += 1
          continue
        }
        if (!options.dryRun) {
          await tx.insert(medicineSlugRedirects).values({
            oldSlug: resolution.originalSlug,
            targetDrugId: resolution.canonicalEntityId,
            reason: 'MERGED',
            rationale: `${resolution.resolverVersion}: ${resolution.resolutionEvidence.join('; ')}`,
          })
        }
        redirectsWritten += 1
      }
    }
  })
  return { resolutionsWritten, redirectsWritten, redirectsExisting }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  try {
    const { rows, ledger } = await loadInventoryRows()
    const result = resolveInventory(rows, ledger)
    const outcome = await applyInventoryResolution(result, { dryRun })
    console.log(
      `[inventory] ${dryRun ? 'dry run' : 'applied'}: ${outcome.resolutionsWritten} resolution row(s) written, ${outcome.redirectsWritten} redirect(s) ${dryRun ? 'would be ' : ''}created, ${outcome.redirectsExisting} already present`,
    )
  } finally {
    await closeDatabasePool()
  }
}

if (process.argv[1]?.endsWith('apply-inventory.ts')) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  })
}
