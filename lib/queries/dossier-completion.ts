import { eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import { dossierCompletionAssessments, inventoryResolutions } from '@/db/schema'
import {
  dossierCompletionAssessmentView,
  type DossierCompletionAssessmentView,
} from '@/lib/dossier-completion/view'
import type { InventoryResolutionState } from '@/lib/inventory/types'

export interface InventoryResolutionView {
  resolutionStatus: InventoryResolutionState
  entityClass: string
  canonicalSlug: string
  redirectTargetSlug: string | null
  identityConfidence: string
  identifierSharedWithOtherRecords: boolean
  resolverVersion: string
}

function toResolutionView(row: typeof inventoryResolutions.$inferSelect): InventoryResolutionView {
  return {
    resolutionStatus: row.resolutionStatus,
    entityClass: row.entityClass,
    canonicalSlug: row.canonicalSlug,
    redirectTargetSlug: row.redirectTargetSlug,
    identityConfidence: row.identityConfidence,
    // The page may say that an identifier is shared; it never names or links the other records.
    identifierSharedWithOtherRecords: row.attributionWarnings.some(
      (warning) => warning.code === 'SHARED_REGISTRY_IDENTIFIER',
    ),
    resolverVersion: row.resolverVersion,
  }
}

export async function getInventoryResolutionForDrug(
  drugId: string,
): Promise<InventoryResolutionView | null> {
  const rows = await db
    .select()
    .from(inventoryResolutions)
    .where(eq(inventoryResolutions.drugId, drugId))
    .limit(1)
  return rows[0] ? toResolutionView(rows[0]) : null
}

export async function getCompletionAssessmentForDrug(
  drugId: string,
): Promise<DossierCompletionAssessmentView | null> {
  const rows = await db
    .select()
    .from(dossierCompletionAssessments)
    .where(eq(dossierCompletionAssessments.drugId, drugId))
    .limit(1)
  return rows[0] ? dossierCompletionAssessmentView(rows[0]) : null
}

/** Bulk reader for the exporter and audits: one map per table, keyed by drug id. */
export async function loadCompletionSurfaces(drugIds?: readonly string[]): Promise<{
  resolutions: Map<string, InventoryResolutionView>
  assessments: Map<string, DossierCompletionAssessmentView>
}> {
  const resolutionRows =
    drugIds && drugIds.length > 0
      ? await db
          .select()
          .from(inventoryResolutions)
          .where(inArray(inventoryResolutions.drugId, [...drugIds]))
      : await db.select().from(inventoryResolutions)
  const assessmentRows =
    drugIds && drugIds.length > 0
      ? await db
          .select()
          .from(dossierCompletionAssessments)
          .where(inArray(dossierCompletionAssessments.drugId, [...drugIds]))
      : await db.select().from(dossierCompletionAssessments)
  return {
    resolutions: new Map(resolutionRows.map((row) => [row.drugId, toResolutionView(row)])),
    assessments: new Map(
      assessmentRows.map((row) => [row.drugId, dossierCompletionAssessmentView(row)]),
    ),
  }
}
