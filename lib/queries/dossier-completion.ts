import { and, desc, eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import {
  dossierCompletionAssessments,
  inventoryResolutions,
  sourceSearchRecords,
} from '@/db/schema'
import { buildTrialRegistrationsView } from '@/lib/dossier'
import {
  dossierCompletionAssessmentView,
  type DossierCompletionAssessmentView,
} from '@/lib/dossier-completion/view'
import type { InventoryResolutionState } from '@/lib/inventory/types'
import type { TrialRegistrationsView } from '@/lib/types'

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

/**
 * The search kind the registry pass writes (scripts/dossier-completion/match-trial-registry.ts).
 * Spelled here rather than imported, because that module is an operator command with a `main`.
 */
export const CLINICALTRIALS_SEARCH_KIND = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION' as const

/**
 * The ranked registrations for one record, read from the most recent successful registry pass.
 * Null when no pass has run, the pass failed, or it matched nothing: the completion assessment
 * states each of those outcomes, and this loader never turns one into an empty list on the page.
 */
export async function getTrialRegistrationsForDrug(
  drugId: string,
): Promise<TrialRegistrationsView | null> {
  const rows = await db
    .select({
      sourceIdentifier: sourceSearchRecords.sourceIdentifier,
      requestedAt: sourceSearchRecords.requestedAt,
      matched: sourceSearchRecords.matched,
    })
    .from(sourceSearchRecords)
    .where(
      and(
        eq(sourceSearchRecords.drugId, drugId),
        eq(sourceSearchRecords.searchKind, CLINICALTRIALS_SEARCH_KIND),
        eq(sourceSearchRecords.status, 'SUCCEEDED'),
      ),
    )
    .orderBy(desc(sourceSearchRecords.requestedAt))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  return buildTrialRegistrationsView({
    sourceIdentifier: row.sourceIdentifier,
    requestedAt: row.requestedAt,
    envelope: row.matched[0],
  })
}
