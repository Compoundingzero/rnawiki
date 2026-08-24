import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'

import { db, type Db } from '@/db'
import {
  evidenceReviewTasks,
  programmeContributionImplementations,
  programmeContributionProposals,
  programmeFreshnessStates,
  programmeVerdictAdjudications,
  programmeVerdictReviewerQualificationEvents,
  programmeVerdictReviews,
  programmeVerdictRevisions,
  programmeVerdictTrialSnapshots,
  users,
} from '@/db/schema'
import { ApiError } from '@/lib/api-response'
import {
  VERDICT_REVIEWER_EXPERTISE_TAGS,
  type VerdictReviewDecision,
  type VerdictReviewerExpertiseTag,
} from '@/lib/evidence/types'
import { newId } from '@/lib/ids'
import { buildLockedProgrammeVerdictProposal } from '@/lib/queries/programme-verdict-proposal'
import { runEvidenceIntelligence } from '@/lib/rna-intelligence'
import { stableJsonStringify } from '@/lib/stable-json'

type Transaction = Parameters<Parameters<Db['transaction']>[0]>[0]
type Executor = Pick<Transaction, 'select'>

export class ProgrammeVerdictWorkflowError extends ApiError {
  constructor(status: number, message: string, code: string, details?: unknown) {
    super(status, message, code, details)
    this.name = 'ProgrammeVerdictWorkflowError'
  }
}

function uniqueTags(tags: readonly VerdictReviewerExpertiseTag[]): VerdictReviewerExpertiseTag[] {
  return [...new Set(tags)].sort() as VerdictReviewerExpertiseTag[]
}

function optionalIso(value: Date | null): string | null {
  return value?.toISOString() ?? null
}

export async function activeProgrammeVerdictQualifications(
  executor: Executor,
  reviewerUserId: string,
): Promise<VerdictReviewerExpertiseTag[]> {
  const events = await executor
    .select({
      expertiseTag: programmeVerdictReviewerQualificationEvents.expertiseTag,
      action: programmeVerdictReviewerQualificationEvents.action,
      createdAt: programmeVerdictReviewerQualificationEvents.createdAt,
      id: programmeVerdictReviewerQualificationEvents.id,
    })
    .from(programmeVerdictReviewerQualificationEvents)
    .where(eq(programmeVerdictReviewerQualificationEvents.reviewerUserId, reviewerUserId))
    .orderBy(
      desc(programmeVerdictReviewerQualificationEvents.createdAt),
      desc(programmeVerdictReviewerQualificationEvents.id),
    )
  const latest = new Map<VerdictReviewerExpertiseTag, string>()
  for (const event of events) {
    if (!latest.has(event.expertiseTag)) latest.set(event.expertiseTag, event.action)
  }
  return [...latest.entries()]
    .filter(([, action]) => action === 'GRANT')
    .map(([tag]) => tag)
    .sort()
}

export async function recordProgrammeVerdictQualification(args: {
  reviewerUserId: string
  expertiseTag: VerdictReviewerExpertiseTag
  action: 'GRANT' | 'REVOKE'
  reason: string
  authorizedByUserId: string
}) {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended('verdict-qualification:' || ${args.reviewerUserId} || ':' || ${args.expertiseTag}, 0))`,
    )
    const [authorizerRows, reviewerRows] = await Promise.all([
      tx.select().from(users).where(eq(users.id, args.authorizedByUserId)).limit(1).for('share'),
      tx.select().from(users).where(eq(users.id, args.reviewerUserId)).limit(1).for('share'),
    ])
    const authorizer = authorizerRows[0]
    const reviewer = reviewerRows[0]
    if (!authorizer || (!authorizer.isAdmin && authorizer.trustTier !== 'steward')) {
      throw new ProgrammeVerdictWorkflowError(
        403,
        'Only a steward or administrator may grant scientific review qualifications.',
        'qualification_not_authorized',
      )
    }
    if (!reviewer) {
      throw new ProgrammeVerdictWorkflowError(404, 'Reviewer not found.', 'reviewer_not_found')
    }
    if (reviewer.id === authorizer.id) {
      throw new ProgrammeVerdictWorkflowError(
        422,
        'A steward cannot grant or revoke their own qualification.',
        'qualification_self_action',
      )
    }
    const reason = args.reason.trim()
    if (!reason) {
      throw new ProgrammeVerdictWorkflowError(
        422,
        'Record the evidence for this qualification decision.',
        'qualification_reason_required',
      )
    }
    const active = await activeProgrammeVerdictQualifications(tx, reviewer.id)
    if ((args.action === 'GRANT') === active.includes(args.expertiseTag)) {
      throw new ProgrammeVerdictWorkflowError(
        409,
        `This qualification is already ${args.action === 'GRANT' ? 'active' : 'inactive'}.`,
        'qualification_state_unchanged',
      )
    }
    const rows = await tx
      .insert(programmeVerdictReviewerQualificationEvents)
      .values({
        id: newId('qualification'),
        reviewerUserId: reviewer.id,
        expertiseTag: args.expertiseTag,
        action: args.action,
        authorizedByUserId: authorizer.id,
        reason,
      })
      .returning()
    return rows[0]!
  })
}

export async function listProgrammeVerdictQualificationRoster(viewerUserId: string) {
  const viewerRows = await db.select().from(users).where(eq(users.id, viewerUserId)).limit(1)
  const viewer = viewerRows[0]
  if (!viewer || (!viewer.isAdmin && viewer.trustTier !== 'steward')) {
    throw new ProgrammeVerdictWorkflowError(
      403,
      'Only a steward or administrator may view qualification controls.',
      'qualification_not_authorized',
    )
  }
  const reviewerRows = await db
    .select({
      id: users.id,
      name: users.name,
      handle: users.handle,
      orcid: users.orcid,
      trustTier: users.trustTier,
      isAdmin: users.isAdmin,
    })
    .from(users)
    .orderBy(asc(users.name), asc(users.id))
  const roster = await Promise.all(
    reviewerRows.map(async (reviewer) => ({
      ...reviewer,
      activeQualifications: await activeProgrammeVerdictQualifications(db, reviewer.id),
    })),
  )
  const events = await db
    .select({
      id: programmeVerdictReviewerQualificationEvents.id,
      reviewerName: users.name,
      reviewerUserId: programmeVerdictReviewerQualificationEvents.reviewerUserId,
      expertiseTag: programmeVerdictReviewerQualificationEvents.expertiseTag,
      action: programmeVerdictReviewerQualificationEvents.action,
      reason: programmeVerdictReviewerQualificationEvents.reason,
      authorizedByUserId: programmeVerdictReviewerQualificationEvents.authorizedByUserId,
      createdAt: programmeVerdictReviewerQualificationEvents.createdAt,
    })
    .from(programmeVerdictReviewerQualificationEvents)
    .innerJoin(users, eq(users.id, programmeVerdictReviewerQualificationEvents.reviewerUserId))
    .orderBy(
      desc(programmeVerdictReviewerQualificationEvents.createdAt),
      desc(programmeVerdictReviewerQualificationEvents.id),
    )
    .limit(100)
  return {
    roster,
    events: events.map((event) => ({ ...event, createdAt: event.createdAt.toISOString() })),
    availableQualifications: [...VERDICT_REVIEWER_EXPERTISE_TAGS],
  }
}

async function lockedCandidate(tx: Transaction, revisionId: string) {
  const rows = await tx
    .select()
    .from(programmeVerdictRevisions)
    .where(eq(programmeVerdictRevisions.id, revisionId))
    .limit(1)
    .for('update')
  const candidate = rows[0]
  if (!candidate) {
    throw new ProgrammeVerdictWorkflowError(404, 'Canonical candidate not found.', 'not_found')
  }
  if (candidate.reviewStatus !== 'AWAITING_REVIEW' && candidate.reviewStatus !== 'APPROVED') {
    throw new ProgrammeVerdictWorkflowError(
      409,
      `A ${candidate.reviewStatus} candidate is not accepting review decisions.`,
      'not_reviewable',
    )
  }
  if (!candidate.proposalDigest || !candidate.engineVersion || !candidate.inputDigest) {
    throw new ProgrammeVerdictWorkflowError(
      409,
      'This candidate has not completed RNA Intelligence preparation.',
      'candidate_not_prepared',
    )
  }
  const implementationRows = await tx
    .select({
      sourceReviewTaskId: programmeContributionImplementations.sourceReviewTaskId,
      sourceSnapshotId: programmeContributionImplementations.sourceSnapshotId,
      programmeId: programmeContributionImplementations.programmeId,
      sourceId: programmeContributionImplementations.sourceId,
    })
    .from(programmeContributionImplementations)
    .where(eq(programmeContributionImplementations.verdictRevisionId, candidate.id))
    .limit(1)
    .for('share')
  const implementation = implementationRows[0]
  if (implementation?.sourceReviewTaskId) {
    const actionableBindingRows = await tx
      .select({ id: evidenceReviewTasks.id })
      .from(evidenceReviewTasks)
      .innerJoin(
        programmeFreshnessStates,
        and(
          eq(programmeFreshnessStates.programmeId, evidenceReviewTasks.programmeId),
          eq(programmeFreshnessStates.sourceId, evidenceReviewTasks.sourceId),
        ),
      )
      .where(
        and(
          eq(evidenceReviewTasks.id, implementation.sourceReviewTaskId),
          eq(evidenceReviewTasks.programmeId, implementation.programmeId),
          eq(evidenceReviewTasks.sourceId, implementation.sourceId!),
          eq(evidenceReviewTasks.triggerSnapshotId, implementation.sourceSnapshotId!),
          inArray(evidenceReviewTasks.status, ['OPEN', 'IN_REVIEW', 'BLOCKED']),
          eq(programmeFreshnessStates.pendingSnapshotId, implementation.sourceSnapshotId!),
        ),
      )
      .limit(1)
      .for('share')
    if (!actionableBindingRows[0]) {
      throw new ProgrammeVerdictWorkflowError(
        409,
        'A newer saved source version superseded this candidate. Review the replacement source task instead.',
        'source_task_superseded',
      )
    }
  }
  return candidate
}

async function qualifiedActor(
  tx: Transaction,
  userId: string,
  requestedTags: readonly VerdictReviewerExpertiseTag[],
  stewardOnly = false,
) {
  const rows = await tx.select().from(users).where(eq(users.id, userId)).limit(1).for('share')
  const actor = rows[0]
  const trusted =
    actor && (actor.isAdmin || actor.trustTier === 'trusted' || actor.trustTier === 'steward')
  const steward = actor && (actor.isAdmin || actor.trustTier === 'steward')
  if (!trusted || (stewardOnly && !steward)) {
    throw new ProgrammeVerdictWorkflowError(
      403,
      stewardOnly
        ? 'Canonical adjudication requires a qualified steward or administrator.'
        : 'Canonical review requires a trusted editor, steward, or administrator.',
      'reviewer_not_authorized',
    )
  }
  const active = await activeProgrammeVerdictQualifications(tx, userId)
  const tags = uniqueTags(requestedTags)
  if (tags.length === 0 || tags.some((tag) => !active.includes(tag))) {
    throw new ProgrammeVerdictWorkflowError(
      403,
      'Choose at least one active, steward-granted qualification. Profile expertise alone does not count.',
      'reviewer_not_qualified',
      { activeQualifications: active },
    )
  }
  return { actor, active, tags }
}

export async function submitProgrammeVerdictReview(args: {
  revisionId: string
  reviewerUserId: string
  expectedProposalDigest: string
  decision: VerdictReviewDecision
  expertiseTags: VerdictReviewerExpertiseTag[]
  isIndependent: boolean
  conflictsOfInterest: string
  conflictsOfInterestAttested: boolean
  reviewNote?: string | null
}) {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended('canonical-review:' || ${args.revisionId}, 0))`,
    )
    const candidate = await lockedCandidate(tx, args.revisionId)
    if (candidate.proposalDigest !== args.expectedProposalDigest) {
      throw new ProgrammeVerdictWorkflowError(
        409,
        'The candidate changed. Reload the exact proposal before reviewing it.',
        'proposal_digest_mismatch',
      )
    }
    const { actor, tags } = await qualifiedActor(tx, args.reviewerUserId, args.expertiseTags)
    const implementationRows = await tx
      .select({ authorUserId: programmeContributionProposals.authorUserId })
      .from(programmeContributionImplementations)
      .innerJoin(
        programmeContributionProposals,
        eq(programmeContributionProposals.id, programmeContributionImplementations.proposalId),
      )
      .where(eq(programmeContributionImplementations.verdictRevisionId, candidate.id))
      .limit(1)
      .for('share')
    if (
      !args.isIndependent ||
      actor.id === candidate.authorUserId ||
      actor.id === implementationRows[0]?.authorUserId
    ) {
      throw new ProgrammeVerdictWorkflowError(
        422,
        'The candidate author or contribution author cannot review this conclusion.',
        'review_not_independent',
      )
    }
    if (!args.conflictsOfInterestAttested || !args.conflictsOfInterest.trim()) {
      throw new ProgrammeVerdictWorkflowError(
        422,
        'Declare conflicts of interest and confirm the declaration.',
        'coi_required',
      )
    }
    if (args.decision !== 'APPROVE' && !args.reviewNote?.trim()) {
      throw new ProgrammeVerdictWorkflowError(
        422,
        'Explain any requested change or rejection.',
        'review_note_required',
      )
    }
    const existing = await tx
      .select({ id: programmeVerdictReviews.id })
      .from(programmeVerdictReviews)
      .where(
        and(
          eq(programmeVerdictReviews.verdictRevisionId, candidate.id),
          eq(programmeVerdictReviews.reviewerUserId, actor.id),
        ),
      )
      .limit(1)
      .for('share')
    const countRows = await tx
      .select({ id: programmeVerdictReviews.id, decision: programmeVerdictReviews.decision })
      .from(programmeVerdictReviews)
      .where(eq(programmeVerdictReviews.verdictRevisionId, candidate.id))
      .for('share')
    if (existing[0]) {
      throw new ProgrammeVerdictWorkflowError(
        409,
        'Each person may record exactly one immutable decision for a candidate.',
        'review_already_recorded',
      )
    }
    if (countRows.length >= 2) {
      throw new ProgrammeVerdictWorkflowError(
        409,
        'This candidate already has its two independent decisions.',
        'review_quorum_full',
      )
    }
    const reviewInsert: typeof programmeVerdictReviews.$inferInsert = {
      id: newId('verdictreview'),
      verdictRevisionId: candidate.id,
      reviewerUserId: actor.id,
      reviewerName: actor.name,
      reviewerOrcidSnapshot: actor.orcid,
      expertiseTags: tags,
      decision: args.decision,
      isIndependent: true,
      conflictsOfInterest: args.conflictsOfInterest.trim(),
      conflictsOfInterestAttested: true,
      proposalDigestAlgorithm: 'sha256',
      proposalDigest: candidate.proposalDigest,
      engineVersion: candidate.engineVersion as string,
      inputDigestAlgorithm: 'sha256',
      inputDigest: candidate.inputDigest as string,
      reviewNote: args.reviewNote?.trim() || null,
    }
    const rows = await tx.insert(programmeVerdictReviews).values(reviewInsert).returning()
    const recordedReviews = [...countRows, rows[0]!]
    if (recordedReviews.length === 2) {
      const decisions = new Set(recordedReviews.map((review) => review.decision))
      if (decisions.size === 1) {
        const derivedStatus = decisions.has('APPROVE') ? 'APPROVED' : 'CHANGES_REQUESTED'
        await tx
          .update(programmeVerdictRevisions)
          .set({ reviewStatus: derivedStatus, reviewedAt: new Date() })
          .where(eq(programmeVerdictRevisions.id, candidate.id))
      }
    }
    return rows[0]!
  })
}

export async function adjudicateProgrammeVerdict(args: {
  revisionId: string
  adjudicatorUserId: string
  expectedProposalDigest: string
  decision: VerdictReviewDecision
  expertiseTags: VerdictReviewerExpertiseTag[]
  rationale: string
  conflictsOfInterest: string
  conflictsOfInterestAttested: boolean
}) {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended('canonical-review:' || ${args.revisionId}, 0))`,
    )
    const candidate = await lockedCandidate(tx, args.revisionId)
    if (candidate.proposalDigest !== args.expectedProposalDigest) {
      throw new ProgrammeVerdictWorkflowError(
        409,
        'The candidate changed. Reload it before adjudicating.',
        'proposal_digest_mismatch',
      )
    }
    const { actor, tags } = await qualifiedActor(
      tx,
      args.adjudicatorUserId,
      args.expertiseTags,
      true,
    )
    const reviews = await tx
      .select()
      .from(programmeVerdictReviews)
      .where(eq(programmeVerdictReviews.verdictRevisionId, candidate.id))
      .orderBy(asc(programmeVerdictReviews.reviewedAt), asc(programmeVerdictReviews.id))
      .for('share')
    if (reviews.length !== 2 || reviews[0]!.decision === reviews[1]!.decision) {
      throw new ProgrammeVerdictWorkflowError(
        409,
        'Adjudication is available only after two independent reviewers disagree.',
        'adjudication_not_required',
      )
    }
    if (
      actor.id === candidate.authorUserId ||
      reviews.some((review) => review.reviewerUserId === actor.id)
    ) {
      throw new ProgrammeVerdictWorkflowError(
        422,
        'The adjudicator must be independent of the author and both reviewers.',
        'adjudicator_not_independent',
      )
    }
    if (
      !args.rationale.trim() ||
      !args.conflictsOfInterest.trim() ||
      !args.conflictsOfInterestAttested
    ) {
      throw new ProgrammeVerdictWorkflowError(
        422,
        'Record the adjudication rationale and confirmed conflict declaration.',
        'adjudication_incomplete',
      )
    }
    const adjudicationInsert: typeof programmeVerdictAdjudications.$inferInsert = {
      id: newId('adjudication'),
      verdictRevisionId: candidate.id,
      adjudicatorUserId: actor.id,
      adjudicatorNameSnapshot: actor.name,
      adjudicatorOrcidSnapshot: actor.orcid,
      expertiseTags: tags,
      decision: args.decision,
      rationale: args.rationale.trim(),
      conflictsOfInterest: args.conflictsOfInterest.trim(),
      conflictsOfInterestAttested: true,
      proposalDigestAlgorithm: 'sha256',
      proposalDigest: candidate.proposalDigest,
      engineVersion: candidate.engineVersion as string,
      inputDigestAlgorithm: 'sha256',
      inputDigest: candidate.inputDigest as string,
    }
    const rows = await tx
      .insert(programmeVerdictAdjudications)
      .values(adjudicationInsert)
      .returning()
    await tx
      .update(programmeVerdictRevisions)
      .set({
        reviewStatus: args.decision === 'APPROVE' ? 'APPROVED' : 'CHANGES_REQUESTED',
        reviewedAt: new Date(),
      })
      .where(eq(programmeVerdictRevisions.id, candidate.id))
    return rows[0]!
  })
}

export async function getProgrammeVerdictWorkflowState(args: {
  revisionId: string
  viewerUserId: string
}) {
  const exact = await db.transaction((tx) =>
    buildLockedProgrammeVerdictProposal(tx, args.revisionId),
  )
  const machineReport = runEvidenceIntelligence(exact.engineInput)
  const [candidateRows, reviewRows, adjudicationRows, activeQualifications, viewerRows] =
    await Promise.all([
      db
        .select({
          verdict: programmeVerdictRevisions,
          implementation: programmeContributionImplementations,
        })
        .from(programmeVerdictRevisions)
        .leftJoin(
          programmeContributionImplementations,
          eq(programmeContributionImplementations.verdictRevisionId, programmeVerdictRevisions.id),
        )
        .where(eq(programmeVerdictRevisions.id, args.revisionId))
        .limit(1),
      db
        .select()
        .from(programmeVerdictReviews)
        .where(eq(programmeVerdictReviews.verdictRevisionId, args.revisionId))
        .orderBy(asc(programmeVerdictReviews.reviewedAt), asc(programmeVerdictReviews.id)),
      db
        .select()
        .from(programmeVerdictAdjudications)
        .where(eq(programmeVerdictAdjudications.verdictRevisionId, args.revisionId))
        .limit(1),
      activeProgrammeVerdictQualifications(db, args.viewerUserId),
      db
        .select({ id: users.id, trustTier: users.trustTier, isAdmin: users.isAdmin })
        .from(users)
        .where(eq(users.id, args.viewerUserId))
        .limit(1),
    ])
  const row = candidateRows[0]
  if (!row) throw new ProgrammeVerdictWorkflowError(404, 'Candidate not found.', 'not_found')
  if (
    row.verdict.proposalDigest !== exact.proposalDigest ||
    row.verdict.inputDigest !== machineReport.inputDigest
  ) {
    throw new ProgrammeVerdictWorkflowError(
      409,
      'The prepared candidate no longer matches its exact signed bundle.',
      'candidate_digest_mismatch',
    )
  }
  const proposalRows = row.implementation
    ? await db
        .select()
        .from(programmeContributionProposals)
        .where(eq(programmeContributionProposals.id, row.implementation.proposalId))
        .limit(1)
    : []
  const contribution = proposalRows[0] ?? null
  const viewer = viewerRows[0] ?? null
  const changedVsCurrent: Array<{
    path: string
    before: unknown
    after: unknown
    source: 'accepted-contribution' | 'normalized-source-snapshot'
  }> = []
  if (contribution?.selectedField && contribution.currentValueSnapshot) {
    changedVsCurrent.push({
      path: contribution.selectedField,
      before: contribution.currentValueSnapshot.value,
      after:
        contribution.selectedField === 'verdict.verdictCode'
          ? contribution.proposedStoppedVerdict
          : (contribution.proposedValue ?? contribution.proposedText),
      source: 'accepted-contribution',
    })
  }
  if (exact.previousRevisionId) {
    const [beforeTrials, afterTrials] = await Promise.all([
      db
        .select()
        .from(programmeVerdictTrialSnapshots)
        .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, exact.previousRevisionId))
        .orderBy(asc(programmeVerdictTrialSnapshots.programmeTrialId)),
      db
        .select()
        .from(programmeVerdictTrialSnapshots)
        .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, exact.revisionId))
        .orderBy(asc(programmeVerdictTrialSnapshots.programmeTrialId)),
    ])
    const beforeByTrial = new Map(beforeTrials.map((trial) => [trial.programmeTrialId, trial]))
    const exactTrialFields = [
      'trialIdentifier',
      'title',
      'phase',
      'status',
      'resultsStatus',
      'enrolment',
      'enrolmentType',
      'startDate',
      'primaryCompletionDate',
      'completionDate',
      'registrySourceId',
      'registrySnapshotId',
    ] as const
    for (const after of afterTrials) {
      const before = beforeByTrial.get(after.programmeTrialId)
      for (const field of exactTrialFields) {
        if (stableJsonStringify(before?.[field] ?? null) === stableJsonStringify(after[field])) {
          continue
        }
        changedVsCurrent.push({
          path: `trial.${after.programmeTrialId}.${field}`,
          before: before?.[field] ?? null,
          after: after[field],
          source: 'normalized-source-snapshot',
        })
      }
    }
  }
  const finalReviewState =
    reviewRows.length === 2 ||
    Boolean(adjudicationRows[0]) ||
    row.verdict.reviewStatus === 'PUBLISHED' ||
    row.verdict.reviewStatus === 'SUPERSEDED'
  const viewerHasReviewed = reviewRows.some((review) => review.reviewerUserId === args.viewerUserId)
  const viewerIsAuthor =
    row.verdict.authorUserId === args.viewerUserId ||
    contribution?.authorUserId === args.viewerUserId
  const viewerHasReviewerStanding = Boolean(
    viewer && (viewer.isAdmin || viewer.trustTier === 'trusted' || viewer.trustTier === 'steward'),
  )
  const viewerHasStewardStanding = Boolean(
    viewer && (viewer.isAdmin || viewer.trustTier === 'steward'),
  )
  const decisions = reviewRows.map((review) => review.decision)
  const reviewersDisagree = decisions.length === 2 && decisions[0] !== decisions[1]
  const reviewEligibility = (() => {
    if (row.verdict.reviewStatus !== 'AWAITING_REVIEW') {
      return { canReview: false, reason: 'This version is not accepting reviewer decisions.' }
    }
    if (reviewRows.length >= 2) {
      return { canReview: false, reason: 'Both independent decisions are already recorded.' }
    }
    if (viewerHasReviewed) {
      return { canReview: false, reason: 'Your permanent decision is already recorded.' }
    }
    if (viewerIsAuthor) {
      return {
        canReview: false,
        reason: 'The author of this version or its submitted correction cannot review it.',
      }
    }
    if (!viewerHasReviewerStanding) {
      return {
        canReview: false,
        reason:
          'This account has not been approved as a trusted reviewer, steward or administrator.',
      }
    }
    if (activeQualifications.length === 0) {
      return {
        canReview: false,
        reason: 'A steward has not granted this account a qualification for this review.',
      }
    }
    return { canReview: true, reason: null }
  })()
  const adjudicationEligibility = (() => {
    if (!reviewersDisagree) {
      return {
        canAdjudicate: false,
        reason: 'A final steward decision is needed only when the two reviewers disagree.',
      }
    }
    if (adjudicationRows[0]) {
      return { canAdjudicate: false, reason: 'The final steward decision is already recorded.' }
    }
    if (viewerIsAuthor) {
      return {
        canAdjudicate: false,
        reason:
          'The author of this version or its submitted correction cannot settle the disagreement.',
      }
    }
    if (viewerHasReviewed) {
      return {
        canAdjudicate: false,
        reason: 'A reviewer of this version cannot also make the final steward decision.',
      }
    }
    if (!viewerHasStewardStanding) {
      return {
        canAdjudicate: false,
        reason: 'Only a qualified steward or administrator can settle this disagreement.',
      }
    }
    if (activeQualifications.length === 0) {
      return {
        canAdjudicate: false,
        reason: 'This steward has no active qualification for the subject under review.',
      }
    }
    return { canAdjudicate: true, reason: null }
  })()
  return {
    revisionId: row.verdict.id,
    programmeId: row.verdict.programmeId,
    reviewStatus: row.verdict.reviewStatus,
    proposalDigestAlgorithm: row.verdict.proposalDigestAlgorithm,
    proposalDigest: row.verdict.proposalDigest,
    engineVersion: row.verdict.engineVersion,
    inputDigestAlgorithm: row.verdict.inputDigestAlgorithm,
    inputDigest: row.verdict.inputDigest,
    proposalPreparedAt: row.verdict.proposalPreparedAt?.toISOString() ?? null,
    contributionProposalId: row.implementation?.proposalId ?? null,
    sourceReviewTaskId: row.implementation?.sourceReviewTaskId ?? null,
    activeQualifications,
    availableQualifications: [...VERDICT_REVIEWER_EXPERTISE_TAGS],
    exactBundle: {
      digestAlgorithm: 'sha256' as const,
      digest: exact.proposalDigest,
      asOfDate: exact.engineInput.asOfDate,
      programme: exact.engineInput.programmes[0] ?? null,
      programmeScope: {
        id: exact.programme.id,
        drugId: exact.programme.drugId,
        slug: exact.programme.slug,
        title: exact.programme.title,
        indication: exact.programme.indication,
        targetPopulation: exact.programme.targetPopulation,
        jurisdiction: exact.programme.jurisdiction,
        sponsor: exact.programme.sponsor,
        partners: exact.programme.partners,
        status: exact.programme.status,
        highestPhaseReached: exact.programme.highestPhaseReached,
        route: exact.programme.route,
        doseExposureContext: exact.programme.doseExposureContext,
        startDate: exact.programme.startDate,
        endDate: exact.programme.endDate,
        rawStoppingReason: exact.programme.rawStoppingReason,
        stoppingReasonCategory: exact.programme.stoppingReasonCategory,
      },
      verdict: exact.engineInput.verdicts[0] ?? null,
      tenSecondSummary: exact.engineInput.tenSecondSummaries?.[0] ?? null,
      publicConclusion: {
        presentationSchemaVersion: exact.candidate.presentationSchemaVersion,
        verdictCode: exact.candidate.verdictCode,
        publicLabel: exact.candidate.publicLabel,
        professionalLabel: exact.candidate.professionalLabel,
        oneSentenceReason: exact.candidate.oneSentenceReason,
        indicationScope: exact.candidate.indicationScope,
        populationScope: exact.candidate.populationScope,
        doseExposureScope: exact.candidate.doseExposureScope,
        periodScope: exact.candidate.periodScope,
        trialScope: exact.candidate.trialScope,
        outcomeScope: exact.candidate.outcomeScope,
        plainMechanism: exact.candidate.plainMechanism,
        bestSupportedFinding: exact.candidate.bestSupportedFinding,
        mainLimitation: exact.candidate.mainLimitation,
        whatWasDisproven: exact.candidate.whatWasDisproven,
        whatWasNotDisproven: exact.candidate.whatWasNotDisproven,
        whatRemainsUnknown: exact.candidate.whatRemainsUnknown,
        confidence: exact.candidate.confidence,
        confidenceExplanation: exact.candidate.confidenceExplanation,
        conditionsThatWouldChangeVerdict: exact.candidate.conditionsThatWouldChangeVerdict,
      },
      trials: exact.engineInput.trials,
      trialSnapshots: exact.reviewedTrials.map((trial) => ({
        id: trial.id,
        programmeId: trial.programmeId,
        trialIdentifier: trial.trialIdentifier,
        title: trial.title,
        phase: trial.phase,
        status: trial.status,
        resultsStatus: trial.resultsStatus,
        enrolment: trial.enrolment,
        enrolmentType: trial.enrolmentType,
        startDate: trial.startDate,
        primaryCompletionDate: trial.primaryCompletionDate,
        completionDate: trial.completionDate,
        humanStudyStatus: trial.humanStudyStatus,
        registrySourceId: trial.registrySourceId,
        registrySnapshotId: trial.registrySnapshotId,
        lastVerifiedAt: optionalIso(trial.lastVerifiedAt),
      })),
      evidenceNodes: exact.engineInput.evidenceNodes,
      evidenceNodeRecords: exact.reviewedEvidenceNodes.map((node) => ({
        id: node.id,
        programmeId: node.programmeId,
        nodeType: node.nodeType,
        revisionNumber: node.revisionNumber,
        previousEvidenceNodeId: node.previousEvidenceNodeId,
        state: node.state,
        reviewStatus: node.reviewStatus,
        plainSummary: node.plainSummary,
        professionalSummary: node.professionalSummary,
        rationale: node.rationale,
        visible: node.visible,
        presentedAsPositive: node.presentedAsPositive,
        presentedAsNegative: node.presentedAsNegative,
        lastVerifiedAt: optionalIso(node.lastVerifiedAt),
        publishedAt: optionalIso(node.publishedAt),
        supersededAt: optionalIso(node.supersededAt),
      })),
      claims: exact.engineInput.claims,
      claimRecords: exact.reviewedClaims.map((claim) => ({
        id: claim.id,
        programmeId: claim.programmeId,
        claimKey: claim.claimKey,
        revisionNumber: claim.revisionNumber,
        previousClaimId: claim.previousClaimId,
        programmeTrialId: claim.programmeTrialId,
        evidenceNodeType: claim.evidenceNodeType,
        nature: claim.nature,
        reviewStatus: claim.reviewStatus,
        plainLanguageText: claim.plainLanguageText,
        technicalText: claim.technicalText,
        population: claim.population,
        intervention: claim.intervention,
        comparator: claim.comparator,
        dose: claim.dose,
        route: claim.route,
        duration: claim.duration,
        endpoint: claim.endpoint,
        endpointHierarchy: claim.endpointHierarchy,
        outcomeType: claim.outcomeType,
        numericValue: claim.numericValue,
        numericUnitRequired: claim.numericUnitRequired,
        numericUnit: claim.numericUnit,
        resultDate: claim.resultDate,
        participantOutcome: claim.participantOutcome,
        comparatorValue: claim.comparatorValue,
        comparatorGroup: claim.comparatorGroup,
        presentedAsPatientBenefit: claim.presentedAsPatientBenefit,
        exploratoryNatureDisclosed: claim.exploratoryNatureDisclosed,
        stoppingReason: claim.stoppingReason,
        conflictsWithClaimIds: claim.conflictsWithClaimIds,
        uncertaintyInterval: claim.uncertaintyInterval,
        direction: claim.direction,
        timepoint: claim.timepoint,
        reviewerInterpretation: claim.reviewerInterpretation,
        lastVerifiedAt: optionalIso(claim.lastVerifiedAt),
        publishedAt: optionalIso(claim.publishedAt),
        supersededAt: optionalIso(claim.supersededAt),
      })),
      interpretabilityRecords: exact.reviewedInterpretabilityAssessments.map((assessment) => ({
        id: assessment.id,
        programmeId: assessment.programmeId,
        programmeTrialId: assessment.programmeTrialId,
        criterion: assessment.criterion,
        state: assessment.state,
        revisionNumber: assessment.revisionNumber,
        previousAssessmentId: assessment.previousAssessmentId,
        reviewStatus: assessment.reviewStatus,
        explanation: assessment.explanation,
        lastVerifiedAt: optionalIso(assessment.lastVerifiedAt),
        publishedAt: optionalIso(assessment.publishedAt),
        supersededAt: optionalIso(assessment.supersededAt),
      })),
      sources: exact.engineInput.sources,
      sourceRecords: exact.reviewedSources.map((source) => ({
        id: source.id,
        sourceType: source.sourceType,
        externalIdentifier: source.externalIdentifier,
        canonicalLocator: source.canonicalLocator,
        title: source.title,
        publisher: source.publisher,
        sponsor: source.sponsor,
        publicationDate: source.publicationDate,
        correctionStatus: source.correctionStatus,
        jurisdiction: source.jurisdiction,
        hierarchy: source.hierarchy,
      })),
      sourceSnapshots: exact.engineInput.sourceSnapshots,
      sourceSnapshotRecords: exact.reviewedSourceSnapshots.map((snapshot) => ({
        id: snapshot.id,
        sourceId: snapshot.sourceId,
        previousSnapshotId: snapshot.previousSnapshotId,
        retrievedAt: snapshot.retrievedAt.toISOString(),
        sourcePublishedAt: optionalIso(snapshot.sourcePublishedAt),
        lastVerifiedAt: optionalIso(snapshot.lastVerifiedAt),
        hashAlgorithm: snapshot.hashAlgorithm,
        contentHash: snapshot.contentHash,
        metadataHash: snapshot.metadataHash,
        permittedExcerpt: snapshot.permittedExcerpt,
        rawSnapshotLocator: snapshot.rawSnapshotLocator,
      })),
      ...(exact.presentation ? { presentation: exact.presentation } : {}),
      dependencies: exact.engineInput.dependencies,
      publicationLinks: {
        verdictClaims: exact.verdictClaimLinks.map((link) => ({
          programmeId: exact.programmeId,
          verdictRevisionId: exact.revisionId,
          claimId: link.claimId,
          relationship: link.relationship,
        })),
        evidenceNodeClaims: exact.nodeClaimLinks.map((link) => ({
          programmeId: exact.programmeId,
          evidenceNodeId: link.evidenceNodeId,
          claimId: link.claimId,
          relationship: link.relationship,
        })),
        interpretabilityClaims: exact.assessmentClaimLinks.map((link) => ({
          programmeId: exact.programmeId,
          assessmentId: link.assessmentId,
          claimId: link.claimId,
          relationship: link.relationship,
        })),
        claimSources: exact.claimSourceLinks.map((link) => ({
          programmeId: link.programmeId,
          claimId: link.claimId,
          sourceSnapshotId: link.sourceSnapshotId,
          relationship: link.relationship,
          sourceLocator: link.sourceLocator,
        })),
        dependencies: exact.dependencies.map((dependency) => ({
          id: dependency.id,
          programmeId: dependency.programmeId,
          claimId: dependency.claimId,
          dependentSurfaceType: dependency.dependentSurfaceType,
          evidenceNodeId: dependency.evidenceNodeId,
          verdictRevisionId: dependency.verdictRevisionId,
          fieldPath: dependency.fieldPath,
          impactLevel: dependency.impactLevel,
        })),
      },
      changes: exact.engineInput.changes ?? [],
    },
    changedVsCurrent,
    viewerHasReviewed,
    reviewQuorumFinal: finalReviewState,
    reviewEligibility,
    adjudicationEligibility,
    machineReport: {
      engineVersion: machineReport.engineVersion,
      inputDigestAlgorithm: machineReport.inputDigestAlgorithm,
      inputDigest: machineReport.inputDigest,
      canPublish: machineReport.canPublish,
      findings: machineReport.findings,
      freshness: machineReport.freshness,
      impactPlan: machineReport.impactPlan,
      humanJudgment: machineReport.humanJudgment,
    },
    reviews: reviewRows.map((review) => {
      const visible =
        finalReviewState || viewerHasReviewed || review.reviewerUserId === args.viewerUserId
      return {
        id: review.id,
        reviewerName: visible ? review.reviewerName : null,
        reviewerOrcid: visible ? review.reviewerOrcidSnapshot : null,
        expertiseTags: visible ? review.expertiseTags : null,
        decision: visible ? review.decision : null,
        isIndependent: visible ? review.isIndependent : null,
        conflictsOfInterest: visible ? review.conflictsOfInterest : null,
        reviewNote: visible ? review.reviewNote : null,
        reviewedAt: visible ? review.reviewedAt.toISOString() : null,
      }
    }),
    adjudication: adjudicationRows[0]
      ? {
          adjudicatorName: adjudicationRows[0].adjudicatorNameSnapshot,
          adjudicatorOrcid: adjudicationRows[0].adjudicatorOrcidSnapshot,
          expertiseTags: adjudicationRows[0].expertiseTags,
          decision: adjudicationRows[0].decision,
          rationale: adjudicationRows[0].rationale,
          conflictsOfInterest: adjudicationRows[0].conflictsOfInterest,
          adjudicatedAt: adjudicationRows[0].adjudicatedAt.toISOString(),
        }
      : null,
  }
}
