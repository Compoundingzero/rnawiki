import { and, asc, count, eq, inArray, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  developmentProgrammes,
  drugs,
  programmeContributionImplementations,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
} from '@/db/schema'

export interface CanonicalQueueCandidate {
  id: string
  proposalId: string | null
  reviewStatus: string
  createdAt: string
  medicine: { slug: string; name: string }
  programme: { slug: string; title: string }
}

/** Prepared manual and contribution-derived candidates share the same canonical review queue. */
export async function listCanonicalQueueCandidates(args: {
  limit: number
  offset: number
}): Promise<{ candidates: CanonicalQueueCandidate[]; total: number }> {
  const activeStatuses = ['AWAITING_REVIEW', 'APPROVED'] as const
  const hasActionableSourceBinding = sql`not exists (
    select 1
    from programme_contribution_implementations source_implementation
    inner join evidence_review_tasks source_task
      on source_task.id = source_implementation.source_review_task_id
    left join programme_freshness_states source_freshness
      on source_freshness.programme_id = source_implementation.programme_id
      and source_freshness.source_id = source_implementation.source_id
    where source_implementation.verdict_revision_id = ${programmeVerdictRevisions.id}
      and source_implementation.source_review_task_id is not null
      and (
        source_task.status not in ('OPEN', 'IN_REVIEW', 'BLOCKED')
        or source_task.trigger_snapshot_id is distinct from source_implementation.source_snapshot_id
        or source_freshness.pending_snapshot_id is distinct from source_implementation.source_snapshot_id
      )
  )`
  const [rows, countRows] = await Promise.all([
    db
      .select({
        id: programmeVerdictRevisions.id,
        proposalId: programmeContributionImplementations.proposalId,
        reviewStatus: programmeVerdictRevisions.reviewStatus,
        createdAt: programmeVerdictRevisions.createdAt,
        medicineSlug: drugs.slug,
        medicineName: drugs.name,
        programmeSlug: programmeVerdictScopeSnapshots.slug,
        programmeTitle: programmeVerdictScopeSnapshots.title,
      })
      .from(programmeVerdictRevisions)
      .leftJoin(
        programmeContributionImplementations,
        eq(programmeContributionImplementations.verdictRevisionId, programmeVerdictRevisions.id),
      )
      .innerJoin(
        developmentProgrammes,
        eq(developmentProgrammes.id, programmeVerdictRevisions.programmeId),
      )
      .innerJoin(
        programmeVerdictScopeSnapshots,
        eq(programmeVerdictScopeSnapshots.verdictRevisionId, programmeVerdictRevisions.id),
      )
      .innerJoin(drugs, eq(drugs.id, developmentProgrammes.drugId))
      .where(
        and(
          inArray(programmeVerdictRevisions.reviewStatus, [...activeStatuses]),
          hasActionableSourceBinding,
        ),
      )
      .orderBy(asc(programmeVerdictRevisions.createdAt), asc(programmeVerdictRevisions.id))
      .limit(args.limit)
      .offset(args.offset),
    db
      .select({ value: count() })
      .from(programmeVerdictRevisions)
      .innerJoin(
        programmeVerdictScopeSnapshots,
        eq(programmeVerdictScopeSnapshots.verdictRevisionId, programmeVerdictRevisions.id),
      )
      .where(
        and(
          inArray(programmeVerdictRevisions.reviewStatus, [...activeStatuses]),
          hasActionableSourceBinding,
        ),
      ),
  ])
  return {
    candidates: rows.map((row) => ({
      id: row.id,
      proposalId: row.proposalId,
      reviewStatus: row.reviewStatus,
      createdAt: row.createdAt.toISOString(),
      medicine: { slug: row.medicineSlug, name: row.medicineName },
      programme: { slug: row.programmeSlug, title: row.programmeTitle },
    })),
    total: countRows[0]?.value ?? 0,
  }
}
