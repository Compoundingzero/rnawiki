import { asc, count, eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import {
  developmentProgrammes,
  drugs,
  evidenceReviewTaskSourceDeltas,
  evidenceReviewTasks,
  evidenceSources,
} from '@/db/schema'
import type { ContributionSourceRefreshDeltaSnapshot } from '@/lib/contributions/types'

const PUBLIC_OPEN_TASK_STATUSES = ['OPEN', 'IN_REVIEW', 'BLOCKED'] as const

export interface PublicSourceReviewTask {
  id: string
  category: 'SOURCE_FRESHNESS_UPDATE'
  medicine: { slug: string; name: string }
  programme: { id: string; slug: string; title: string }
  status: (typeof PUBLIC_OPEN_TASK_STATUSES)[number]
  impactLevel: string
  reason: string
  affectedClaimIds: string[]
  affectedSurfacePaths: string[]
  reviewSnapshotId: string
  sourceRefreshDeltaSnapshot: ContributionSourceRefreshDeltaSnapshot | null
  source: {
    type: string
    title?: string
    identifier?: string
    locator: string
  }
  createdAt: string
}

/**
 * Public, non-sensitive source-monitor work. Raw snapshots, assignee identity, retry errors and
 * reviewer notes deliberately stay out of this projection.
 */
export async function listPublicSourceReviewTasks(opts: {
  limit: number
  offset: number
}): Promise<PublicSourceReviewTask[]> {
  const rows = await db
    .select({
      id: evidenceReviewTasks.id,
      status: evidenceReviewTasks.status,
      impactLevel: evidenceReviewTasks.impactLevel,
      reason: evidenceReviewTasks.reason,
      affectedClaimIds: evidenceReviewTasks.affectedClaimIds,
      affectedSurfacePaths: evidenceReviewTasks.affectedSurfacePaths,
      reviewSnapshotId: evidenceReviewTasks.triggerSnapshotId,
      createdAt: evidenceReviewTasks.createdAt,
      medicineSlug: drugs.slug,
      medicineName: drugs.name,
      programmeId: developmentProgrammes.id,
      programmeSlug: developmentProgrammes.slug,
      programmeTitle: developmentProgrammes.title,
      sourceType: evidenceSources.sourceType,
      sourceTitle: evidenceSources.title,
      sourceIdentifier: evidenceSources.externalIdentifier,
      sourceLocator: evidenceSources.canonicalLocator,
      sourceRefreshDelta: evidenceReviewTaskSourceDeltas,
    })
    .from(evidenceReviewTasks)
    .innerJoin(developmentProgrammes, eq(evidenceReviewTasks.programmeId, developmentProgrammes.id))
    .innerJoin(drugs, eq(developmentProgrammes.drugId, drugs.id))
    .innerJoin(evidenceSources, eq(evidenceReviewTasks.sourceId, evidenceSources.id))
    .leftJoin(
      evidenceReviewTaskSourceDeltas,
      eq(evidenceReviewTaskSourceDeltas.reviewTaskId, evidenceReviewTasks.id),
    )
    .where(inArray(evidenceReviewTasks.status, [...PUBLIC_OPEN_TASK_STATUSES]))
    .orderBy(asc(evidenceReviewTasks.createdAt), asc(evidenceReviewTasks.id))
    .limit(Math.max(1, Math.trunc(opts.limit)))
    .offset(Math.max(0, Math.trunc(opts.offset)))

  return rows.map((row) => ({
    id: row.id,
    category: 'SOURCE_FRESHNESS_UPDATE',
    medicine: { slug: row.medicineSlug, name: row.medicineName },
    programme: {
      id: row.programmeId,
      slug: row.programmeSlug,
      title: row.programmeTitle,
    },
    status: row.status as PublicSourceReviewTask['status'],
    impactLevel: row.impactLevel,
    reason: row.reason,
    affectedClaimIds: row.affectedClaimIds,
    affectedSurfacePaths: row.affectedSurfacePaths,
    reviewSnapshotId: row.reviewSnapshotId,
    sourceRefreshDeltaSnapshot:
      row.sourceRefreshDelta?.schemaVersion === 'rna-intelligence/source-refresh-delta-v1' &&
      row.sourceRefreshDelta.deltaDigestAlgorithm === 'sha256'
        ? {
            version: row.sourceRefreshDelta.schemaVersion,
            reviewTaskId: row.sourceRefreshDelta.reviewTaskId,
            programmeId: row.sourceRefreshDelta.programmeId,
            sourceId: row.sourceRefreshDelta.sourceId,
            baselineSnapshotId: row.sourceRefreshDelta.baselineSnapshotId,
            pendingSnapshotId: row.sourceRefreshDelta.pendingSnapshotId,
            adapterKey: row.sourceRefreshDelta.adapterKey,
            action: row.sourceRefreshDelta.action,
            changedTrialFields: row.sourceRefreshDelta.changedTrialFields,
            affectedClaimIds: row.sourceRefreshDelta.affectedClaimIds,
            affectedInterpretability: row.sourceRefreshDelta.affectedInterpretability,
            affectedSurfacePaths: row.sourceRefreshDelta.affectedSurfacePaths,
            scientificRevisionRequirements: row.sourceRefreshDelta.scientificRevisionRequirements,
            deltaDigestAlgorithm: 'sha256',
            deltaDigest: row.sourceRefreshDelta.deltaDigest,
          }
        : null,
    source: {
      type: row.sourceType,
      ...(row.sourceTitle ? { title: row.sourceTitle } : {}),
      ...(row.sourceIdentifier ? { identifier: row.sourceIdentifier } : {}),
      locator: row.sourceLocator,
    },
    createdAt: row.createdAt.toISOString(),
  }))
}

export async function countPublicSourceReviewTasks(): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(evidenceReviewTasks)
    .where(inArray(evidenceReviewTasks.status, [...PUBLIC_OPEN_TASK_STATUSES]))
  return rows[0]?.value ?? 0
}
