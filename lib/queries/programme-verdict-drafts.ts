import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db, type Db } from '@/db'
import {
  evidenceReviewTasks,
  programmeContributionImplementations,
  programmeCurrentPublications,
  programmeDependencies,
  programmeVerdictClaims,
  programmeVerdictEvidenceNodes,
  programmeVerdictInterpretabilityAssessments,
  programmeVerdictMechanismStepClaims,
  programmeVerdictMechanismSteps,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  programmeVerdictSourceMetadataSnapshots,
  programmeVerdictTimelineEventClaims,
  programmeVerdictTimelineEvents,
  programmeVerdictTrialSnapshots,
  programmeVerdictTrials,
  users,
} from '@/db/schema'
import { ApiError } from '@/lib/api-response'
import { newId } from '@/lib/ids'

const PRESENTATION_SCHEMA_VERSION = 'programme-presentation/v1'

export const programmeVerdictDraftCloneSchema = z
  .object({
    programmeId: z.string().trim().min(1).max(64),
    conflictsOfInterest: z.string().trim().min(1).max(4_000),
  })
  .strict()

export interface ProgrammeVerdictDraftCloneResult {
  revisionId: string
  programmeId: string
  previousVerdictRevisionId: string
  revisionNumber: number
  presentationSchemaVersion: string | null
  reviewStatus: 'DRAFT'
  proposalPreparedAt: null
  reused: boolean
}

export class ProgrammeVerdictDraftError extends ApiError {
  constructor(status: number, message: string, code: string) {
    super(status, message, code)
    this.name = 'ProgrammeVerdictDraftError'
  }
}

type Transaction = Parameters<Parameters<Db['transaction']>[0]>[0]

async function requireSteward(tx: Transaction, actorUserId: string) {
  const rows = await tx.select().from(users).where(eq(users.id, actorUserId)).limit(1).for('share')
  const actor = rows[0]
  if (!actor || (!actor.isAdmin && actor.trustTier !== 'steward')) {
    throw new ProgrammeVerdictDraftError(
      403,
      'Only a steward or administrator may create a canonical draft.',
      'draft_not_authorized',
    )
  }
  return actor
}

function resultFrom(
  row: typeof programmeVerdictRevisions.$inferSelect,
  reused: boolean,
): ProgrammeVerdictDraftCloneResult {
  if (
    row.reviewStatus !== 'DRAFT' ||
    row.proposalPreparedAt !== null ||
    !row.previousVerdictRevisionId
  ) {
    throw new ProgrammeVerdictDraftError(
      500,
      'The cloned canonical draft has invalid lineage or preparation state.',
      'draft_state_invalid',
    )
  }
  return {
    revisionId: row.id,
    programmeId: row.programmeId,
    previousVerdictRevisionId: row.previousVerdictRevisionId,
    revisionNumber: row.revisionNumber,
    presentationSchemaVersion: row.presentationSchemaVersion,
    reviewStatus: 'DRAFT',
    proposalPreparedAt: null,
    reused,
  }
}

/**
 * Clone the exact current public bundle into an editable, unprepared DRAFT. No first-publication
 * fallback exists here: a source-only programme must not acquire an invented conclusion.
 */
export async function createProgrammeVerdictDraftFromCurrentPublication(args: {
  programmeId: string
  actorUserId: string
  conflictsOfInterest: string
}): Promise<ProgrammeVerdictDraftCloneResult> {
  return db.transaction(async (tx) => {
    const actor = await requireSteward(tx, args.actorUserId)
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended('programme-verdict-draft:' || ${args.programmeId}, 0))`,
    )

    const currentRows = await tx
      .select({ verdict: programmeVerdictRevisions })
      .from(programmeCurrentPublications)
      .innerJoin(
        programmeVerdictRevisions,
        eq(programmeVerdictRevisions.id, programmeCurrentPublications.verdictRevisionId),
      )
      .where(eq(programmeCurrentPublications.programmeId, args.programmeId))
      .limit(1)
      .for('update')
    const current = currentRows[0]?.verdict
    if (!current || current.reviewStatus !== 'PUBLISHED') {
      throw new ProgrammeVerdictDraftError(
        409,
        'An existing published programme conclusion is required before it can be cloned into a new draft.',
        'current_publication_required',
      )
    }

    const successorRows = await tx
      .select()
      .from(programmeVerdictRevisions)
      .where(
        and(
          eq(programmeVerdictRevisions.programmeId, args.programmeId),
          eq(programmeVerdictRevisions.previousVerdictRevisionId, current.id),
          inArray(programmeVerdictRevisions.reviewStatus, [
            'DRAFT',
            'MACHINE_CHECKED',
            'AWAITING_REVIEW',
            'APPROVED',
          ]),
        ),
      )
      .orderBy(desc(programmeVerdictRevisions.revisionNumber))
      .for('update')
    const dismissedSourceCandidateRows =
      successorRows.length === 0
        ? []
        : await tx
            .select({ verdictRevisionId: programmeContributionImplementations.verdictRevisionId })
            .from(programmeContributionImplementations)
            .innerJoin(
              evidenceReviewTasks,
              eq(evidenceReviewTasks.id, programmeContributionImplementations.sourceReviewTaskId),
            )
            .where(
              and(
                inArray(
                  programmeContributionImplementations.verdictRevisionId,
                  successorRows.map((row) => row.id),
                ),
                eq(evidenceReviewTasks.status, 'DISMISSED'),
              ),
            )
            .for('share')
    const dismissedSourceCandidateIds = new Set(
      dismissedSourceCandidateRows.map((row) => row.verdictRevisionId),
    )
    const actionableSuccessors = successorRows.filter(
      (row) => !dismissedSourceCandidateIds.has(row.id),
    )
    const reusable = actionableSuccessors.find(
      (row) =>
        row.reviewStatus === 'DRAFT' &&
        row.proposalPreparedAt === null &&
        row.authorUserId === actor.id,
    )
    if (reusable && actionableSuccessors.length === 1) {
      if (reusable.conflictsOfInterest !== args.conflictsOfInterest) {
        throw new ProgrammeVerdictDraftError(
          409,
          'An editable draft already exists for this steward and public predecessor with a different conflict-of-interest statement.',
          'draft_request_conflict',
        )
      }
      return resultFrom(reusable, true)
    }
    if (actionableSuccessors.length > 0) {
      throw new ProgrammeVerdictDraftError(
        409,
        'Another editable, review-ready, or approved successor already exists for this public conclusion.',
        'successor_candidate_exists',
      )
    }

    const latestRows = await tx
      .select({ revisionNumber: programmeVerdictRevisions.revisionNumber })
      .from(programmeVerdictRevisions)
      .where(eq(programmeVerdictRevisions.programmeId, args.programmeId))
      .orderBy(desc(programmeVerdictRevisions.revisionNumber))
      .limit(1)
      .for('share')
    const revisionId = newId('verdict')
    const clonedAt = new Date()
    const revisionNumber = (latestRows[0]?.revisionNumber ?? 0) + 1

    const scopeRows = await tx
      .select()
      .from(programmeVerdictScopeSnapshots)
      .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, current.id))
      .limit(1)
      .for('share')
    const scope = scopeRows[0]
    if (!scope) {
      throw new ProgrammeVerdictDraftError(
        409,
        'The current publication is missing its immutable programme-scope snapshot.',
        'current_publication_incomplete',
      )
    }

    const trialLinks = await tx
      .select()
      .from(programmeVerdictTrials)
      .where(eq(programmeVerdictTrials.verdictRevisionId, current.id))
      .orderBy(asc(programmeVerdictTrials.programmeTrialId))
      .for('share')
    const trialSnapshots = await tx
      .select()
      .from(programmeVerdictTrialSnapshots)
      .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, current.id))
      .orderBy(asc(programmeVerdictTrialSnapshots.programmeTrialId))
      .for('share')
    const nodeLinks = await tx
      .select()
      .from(programmeVerdictEvidenceNodes)
      .where(eq(programmeVerdictEvidenceNodes.verdictRevisionId, current.id))
      .orderBy(asc(programmeVerdictEvidenceNodes.evidenceNodeId))
      .for('share')
    const assessmentLinks = await tx
      .select()
      .from(programmeVerdictInterpretabilityAssessments)
      .where(eq(programmeVerdictInterpretabilityAssessments.verdictRevisionId, current.id))
      .orderBy(asc(programmeVerdictInterpretabilityAssessments.assessmentId))
      .for('share')
    const verdictClaimLinks = await tx
      .select()
      .from(programmeVerdictClaims)
      .where(eq(programmeVerdictClaims.verdictRevisionId, current.id))
      .orderBy(asc(programmeVerdictClaims.claimId))
      .for('share')
    const dependencies = await tx
      .select()
      .from(programmeDependencies)
      .where(eq(programmeDependencies.verdictRevisionId, current.id))
      .orderBy(asc(programmeDependencies.id))
      .for('share')
    const mechanismSteps = await tx
      .select()
      .from(programmeVerdictMechanismSteps)
      .where(eq(programmeVerdictMechanismSteps.verdictRevisionId, current.id))
      .orderBy(asc(programmeVerdictMechanismSteps.stepOrder))
      .for('share')
    const mechanismClaims = await tx
      .select()
      .from(programmeVerdictMechanismStepClaims)
      .where(eq(programmeVerdictMechanismStepClaims.verdictRevisionId, current.id))
      .orderBy(
        asc(programmeVerdictMechanismStepClaims.stepKey),
        asc(programmeVerdictMechanismStepClaims.claimId),
      )
      .for('share')
    const timelineEvents = await tx
      .select()
      .from(programmeVerdictTimelineEvents)
      .where(eq(programmeVerdictTimelineEvents.verdictRevisionId, current.id))
      .orderBy(
        asc(programmeVerdictTimelineEvents.eventDate),
        asc(programmeVerdictTimelineEvents.eventKey),
      )
      .for('share')
    const timelineClaims = await tx
      .select()
      .from(programmeVerdictTimelineEventClaims)
      .where(eq(programmeVerdictTimelineEventClaims.verdictRevisionId, current.id))
      .orderBy(
        asc(programmeVerdictTimelineEventClaims.eventKey),
        asc(programmeVerdictTimelineEventClaims.claimId),
      )
      .for('share')
    const sourceMetadata = await tx
      .select()
      .from(programmeVerdictSourceMetadataSnapshots)
      .where(eq(programmeVerdictSourceMetadataSnapshots.verdictRevisionId, current.id))
      .orderBy(asc(programmeVerdictSourceMetadataSnapshots.sourceId))
      .for('share')

    if (trialLinks.length === 0 || trialSnapshots.length !== trialLinks.length) {
      throw new ProgrammeVerdictDraftError(
        409,
        'The current publication has an incomplete immutable trial bundle.',
        'current_publication_incomplete',
      )
    }
    if (
      current.presentationSchemaVersion === PRESENTATION_SCHEMA_VERSION &&
      (mechanismSteps.length < 3 || mechanismSteps.length > 5)
    ) {
      throw new ProgrammeVerdictDraftError(
        409,
        'The current publication has an incomplete immutable presentation bundle.',
        'current_publication_incomplete',
      )
    }

    const inserted = await tx
      .insert(programmeVerdictRevisions)
      .values({
        ...current,
        id: revisionId,
        revisionNumber,
        previousVerdictRevisionId: current.id,
        reviewStatus: 'DRAFT',
        authorUserId: actor.id,
        authorName: actor.name,
        conflictsOfInterest: args.conflictsOfInterest,
        adjudicationRationale: null,
        adjudicatorUserId: null,
        proposalAsOfDate: clonedAt.toISOString().slice(0, 10),
        engineVersion: null,
        inputDigest: null,
        proposalDigest: null,
        proposalPreparedAt: null,
        createdAt: clonedAt,
        reviewedAt: null,
        publishedAt: null,
        supersededAt: null,
      })
      .returning()
    const draft = inserted[0]
    if (!draft) {
      throw new ProgrammeVerdictDraftError(500, 'Draft creation returned no row.', 'draft_missing')
    }
    await tx.insert(programmeVerdictScopeSnapshots).values({
      ...scope,
      verdictRevisionId: revisionId,
      capturedAt: clonedAt,
    })
    await tx.insert(programmeVerdictTrials).values(
      trialLinks.map((row) => ({
        programmeId: row.programmeId,
        verdictRevisionId: revisionId,
        programmeTrialId: row.programmeTrialId,
      })),
    )
    await tx.insert(programmeVerdictTrialSnapshots).values(
      trialSnapshots.map((row) => ({
        ...row,
        verdictRevisionId: revisionId,
        capturedAt: clonedAt,
      })),
    )
    if (nodeLinks.length > 0) {
      await tx.insert(programmeVerdictEvidenceNodes).values(
        nodeLinks.map((row) => ({
          programmeId: row.programmeId,
          verdictRevisionId: revisionId,
          evidenceNodeId: row.evidenceNodeId,
        })),
      )
    }
    if (assessmentLinks.length > 0) {
      await tx.insert(programmeVerdictInterpretabilityAssessments).values(
        assessmentLinks.map((row) => ({
          programmeId: row.programmeId,
          verdictRevisionId: revisionId,
          assessmentId: row.assessmentId,
        })),
      )
    }
    if (verdictClaimLinks.length > 0) {
      await tx.insert(programmeVerdictClaims).values(
        verdictClaimLinks.map((row) => ({
          programmeId: row.programmeId,
          verdictRevisionId: revisionId,
          claimId: row.claimId,
          relationship: row.relationship,
        })),
      )
    }
    if (mechanismSteps.length > 0) {
      await tx.insert(programmeVerdictMechanismSteps).values(
        mechanismSteps.map((row) => ({
          ...row,
          verdictRevisionId: revisionId,
          createdAt: clonedAt,
        })),
      )
    }
    if (mechanismClaims.length > 0) {
      await tx.insert(programmeVerdictMechanismStepClaims).values(
        mechanismClaims.map((row) => ({
          ...row,
          verdictRevisionId: revisionId,
          createdAt: clonedAt,
        })),
      )
    }
    if (timelineEvents.length > 0) {
      await tx.insert(programmeVerdictTimelineEvents).values(
        timelineEvents.map((row) => ({
          ...row,
          verdictRevisionId: revisionId,
          createdAt: clonedAt,
        })),
      )
    }
    if (timelineClaims.length > 0) {
      await tx.insert(programmeVerdictTimelineEventClaims).values(
        timelineClaims.map((row) => ({
          ...row,
          verdictRevisionId: revisionId,
          createdAt: clonedAt,
        })),
      )
    }
    if (dependencies.length > 0) {
      await tx.insert(programmeDependencies).values(
        dependencies.map((row) => ({
          ...row,
          id: newId('dependency'),
          verdictRevisionId: revisionId,
          createdAt: clonedAt,
          updatedAt: clonedAt,
        })),
      )
    }
    if (sourceMetadata.length > 0) {
      await tx.insert(programmeVerdictSourceMetadataSnapshots).values(
        sourceMetadata.map((row) => ({
          ...row,
          verdictRevisionId: revisionId,
          capturedAt: clonedAt,
        })),
      )
    }

    return resultFrom(draft, false)
  })
}
