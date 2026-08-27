import { and, asc, eq, gt, inArray, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  evidenceReviewTasks,
  programmeContributionAdjudications,
  programmeContributionProposals,
  programmeContributionReviews,
  programmeContributionReviewStates,
  programmeFreshnessStates,
  users,
} from '@/db/schema'
import type {
  ContributionAdjudicationEligibilityReason,
  ContributionAdjudicationView,
  ContributionPublicAttribution,
  ContributionReviewEligibilityReason,
  ContributionReviewReadResponse,
  ContributionReviewStateView,
  ContributionReviewView,
  PublicContributionReviewAudit,
} from '@/lib/contributions/review-types'
import type {
  ContributionAdjudicationDecisionInput,
  ContributionReviewDecisionInput,
} from '@/lib/contributions/review-validation'
import type { ContributionReviewStatus } from '@/lib/contributions/types'
import { newId } from '@/lib/ids'
import { ApiError } from '@/lib/api-response'

type ReadExecutor = Pick<typeof db, 'select'>
type LineageLockExecutor = Pick<typeof db, 'execute'>
type UserRow = typeof users.$inferSelect
type ProposalRow = typeof programmeContributionProposals.$inferSelect
type StateRow = typeof programmeContributionReviewStates.$inferSelect

interface InternalReview {
  reviewerUserId: string
  value: ContributionReviewView
}

interface InternalAdjudication {
  adjudicatorUserId: string
  value: ContributionAdjudicationView
}

export class ContributionReviewError extends ApiError {
  constructor(status: number, message: string, code: string) {
    super(status, message, code)
    this.name = 'ContributionReviewError'
  }
}

async function lockContributionLineage(
  database: LineageLockExecutor,
  proposal: Pick<ProposalRow, 'programmeId' | 'proposalKey'>,
): Promise<void> {
  await database.execute(
    sql`select pg_advisory_xact_lock(hashtextextended(${proposal.programmeId} || chr(31) || ${proposal.proposalKey}, 0))`,
  )
}

async function hasNewerSubmittedRevision(
  database: ReadExecutor,
  proposal: Pick<ProposalRow, 'programmeId' | 'proposalKey' | 'revisionNumber'>,
): Promise<boolean> {
  const rows = await database
    .select({ id: programmeContributionProposals.id })
    .from(programmeContributionProposals)
    .where(
      and(
        eq(programmeContributionProposals.programmeId, proposal.programmeId),
        eq(programmeContributionProposals.proposalKey, proposal.proposalKey),
        eq(programmeContributionProposals.status, 'SUBMITTED'),
        gt(programmeContributionProposals.revisionNumber, proposal.revisionNumber),
      ),
    )
    .limit(1)
  return rows.length > 0
}

function publicAttribution(args: {
  name: string
  handle: string
  orcid: string | null
}): ContributionPublicAttribution {
  return {
    name: args.name,
    handle: args.handle,
    ...(args.orcid ? { orcid: args.orcid } : {}),
  }
}

function consensusForStatus(status: ContributionReviewStatus) {
  switch (status) {
    case 'ACCEPTED_FOR_IMPLEMENTATION':
      return 'APPROVE' as const
    case 'CHANGES_REQUESTED':
      return 'CHANGES_REQUESTED' as const
    case 'REJECTED':
      return 'REJECT' as const
    default:
      return null
  }
}

function serializeState(row: StateRow): ContributionReviewStateView {
  return {
    status: row.status,
    reviewCount: row.reviewCount,
    requiredReviewCount: row.requiredApprovals,
    consensus: consensusForStatus(row.status),
    updatedAt: row.updatedAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  }
}

async function loadProposal(
  database: ReadExecutor,
  proposalId: string,
): Promise<ProposalRow | null> {
  const rows = await database
    .select()
    .from(programmeContributionProposals)
    .where(eq(programmeContributionProposals.id, proposalId))
    .limit(1)
  return rows[0] ?? null
}

async function loadViewer(database: ReadExecutor, viewerUserId: string): Promise<UserRow | null> {
  const rows = await database.select().from(users).where(eq(users.id, viewerUserId)).limit(1)
  return rows[0] ?? null
}

async function loadReviewState(
  database: ReadExecutor,
  proposalId: string,
): Promise<StateRow | null> {
  const rows = await database
    .select()
    .from(programmeContributionReviewStates)
    .where(eq(programmeContributionReviewStates.proposalId, proposalId))
    .limit(1)
  return rows[0] ?? null
}

async function loadReviews(database: ReadExecutor, proposalId: string): Promise<InternalReview[]> {
  const rows = await database
    .select({
      review: programmeContributionReviews,
      reviewerHandle: users.handle,
    })
    .from(programmeContributionReviews)
    .innerJoin(users, eq(users.id, programmeContributionReviews.reviewerUserId))
    .where(eq(programmeContributionReviews.proposalId, proposalId))
    .orderBy(asc(programmeContributionReviews.reviewedAt), asc(programmeContributionReviews.id))

  return rows.map(({ review, reviewerHandle }) => ({
    reviewerUserId: review.reviewerUserId,
    value: {
      id: review.id,
      reviewer: publicAttribution({
        name: review.reviewerNameSnapshot,
        handle: reviewerHandle,
        orcid: review.reviewerOrcidSnapshot,
      }),
      expertiseTags: review.expertiseTags,
      decision: review.decision,
      independenceAttested: true,
      conflictsOfInterest: review.conflictsOfInterest,
      conflictsOfInterestAttested: true,
      reviewNote: review.reviewNote,
      reviewedAt: review.reviewedAt.toISOString(),
    },
  }))
}

async function loadAdjudication(
  database: ReadExecutor,
  proposalId: string,
): Promise<InternalAdjudication | null> {
  const rows = await database
    .select({
      adjudication: programmeContributionAdjudications,
      adjudicatorHandle: users.handle,
    })
    .from(programmeContributionAdjudications)
    .innerJoin(users, eq(users.id, programmeContributionAdjudications.adjudicatorUserId))
    .where(eq(programmeContributionAdjudications.proposalId, proposalId))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  return {
    adjudicatorUserId: row.adjudication.adjudicatorUserId,
    value: {
      id: row.adjudication.id,
      adjudicator: publicAttribution({
        name: row.adjudication.adjudicatorNameSnapshot,
        handle: row.adjudicatorHandle,
        orcid: row.adjudication.adjudicatorOrcidSnapshot,
      }),
      expertiseTags: row.adjudication.expertiseTags,
      decision: row.adjudication.decision,
      rationale: row.adjudication.rationale,
      conflictsOfInterest: row.adjudication.conflictsOfInterest,
      conflictsOfInterestAttested: true,
      adjudicatedAt: row.adjudication.adjudicatedAt.toISOString(),
    },
  }
}

function mayReview(user: UserRow): boolean {
  return user.isAdmin || user.trustTier === 'trusted' || user.trustTier === 'steward'
}

function mayAdjudicate(user: UserRow): boolean {
  return user.isAdmin || user.trustTier === 'steward'
}

function reviewEligibility(args: {
  proposal: ProposalRow
  state: StateRow
  viewer: UserRow
  reviews: InternalReview[]
}): { canReview: boolean; reason: ContributionReviewEligibilityReason } {
  if (args.viewer.id === args.proposal.authorUserId) {
    return { canReview: false, reason: 'AUTHOR_CANNOT_REVIEW' }
  }
  if (!mayReview(args.viewer)) {
    return { canReview: false, reason: 'INSUFFICIENT_TRUST' }
  }
  if (args.reviews.some((review) => review.reviewerUserId === args.viewer.id)) {
    return { canReview: false, reason: 'ALREADY_REVIEWED' }
  }
  if (args.state.status === 'DISAGREEMENT') {
    return { canReview: false, reason: 'ADJUDICATION_REQUIRED' }
  }
  if (
    args.state.status !== 'AWAITING_REVIEWS' &&
    args.state.status !== 'AWAITING_SECOND_REVIEW' &&
    args.state.status !== 'AWAITING_THIRD_REVIEW'
  ) {
    return { canReview: false, reason: 'REVIEW_COMPLETE' }
  }
  return { canReview: true, reason: 'ELIGIBLE' }
}

function adjudicationEligibility(args: {
  proposal: ProposalRow
  state: StateRow
  viewer: UserRow
  reviews: InternalReview[]
  adjudication: InternalAdjudication | null
}): {
  canAdjudicate: boolean
  reason: ContributionAdjudicationEligibilityReason
} {
  if (args.adjudication) {
    return { canAdjudicate: false, reason: 'ALREADY_ADJUDICATED' }
  }
  if (args.state.status !== 'DISAGREEMENT') {
    return { canAdjudicate: false, reason: 'NOT_IN_DISAGREEMENT' }
  }
  if (args.viewer.id === args.proposal.authorUserId) {
    return { canAdjudicate: false, reason: 'AUTHOR_CANNOT_ADJUDICATE' }
  }
  if (args.reviews.some((review) => review.reviewerUserId === args.viewer.id)) {
    return { canAdjudicate: false, reason: 'REVIEWER_CANNOT_ADJUDICATE' }
  }
  if (!mayAdjudicate(args.viewer)) {
    return { canAdjudicate: false, reason: 'STEWARD_REQUIRED' }
  }
  return { canAdjudicate: true, reason: 'ELIGIBLE' }
}

async function buildReadResponse(args: {
  database: ReadExecutor
  proposal: ProposalRow
  viewer: UserRow
}): Promise<ContributionReviewReadResponse> {
  // This helper also runs on a single PostgreSQL transaction client after writes. Keep reads
  // sequential: node-postgres does not support concurrent queries on one client, and the final
  // state must be observed after the decision trigger has completed.
  const state = await loadReviewState(args.database, args.proposal.id)
  const reviews = await loadReviews(args.database, args.proposal.id)
  const adjudication = await loadAdjudication(args.database, args.proposal.id)
  if (!state) {
    throw new ContributionReviewError(
      409,
      'This submitted proposal is missing its review workflow state.',
      'review_state_missing',
    )
  }

  const eligibility = reviewEligibility({
    proposal: args.proposal,
    state,
    viewer: args.viewer,
    reviews,
  })
  const adjudicatorEligibility = adjudicationEligibility({
    proposal: args.proposal,
    state,
    viewer: args.viewer,
    reviews,
    adjudication,
  })
  const own = reviews.find((review) => review.reviewerUserId === args.viewer.id) ?? null
  const resolvedOrDisagreed =
    state.status === 'DISAGREEMENT' ||
    state.status === 'ACCEPTED_FOR_IMPLEMENTATION' ||
    state.status === 'CHANGES_REQUESTED' ||
    state.status === 'REJECTED'
  const visibleReviews = own || resolvedOrDisagreed ? reviews.map((review) => review.value) : []

  return {
    reviewState: serializeState(state),
    eligibility,
    adjudicationEligibility: adjudicatorEligibility,
    myReview: own?.value ?? null,
    reviews: visibleReviews,
    adjudication: adjudication?.value ?? null,
  }
}

async function requireReviewableProposal(
  database: ReadExecutor,
  proposalId: string,
): Promise<ProposalRow> {
  const proposal = await loadProposal(database, proposalId)
  if (!proposal) {
    throw new ContributionReviewError(404, 'Contribution proposal not found.', 'not_found')
  }
  if (proposal.status !== 'SUBMITTED' || !proposal.contentDigest) {
    throw new ContributionReviewError(
      409,
      'Only a submitted, frozen contribution proposal can be reviewed.',
      'proposal_not_submitted',
    )
  }
  if (proposal.sourceReviewTaskId && proposal.sourceReviewSnapshotId) {
    const sourceBindingRows = await database
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
          eq(evidenceReviewTasks.id, proposal.sourceReviewTaskId),
          eq(evidenceReviewTasks.programmeId, proposal.programmeId),
          eq(evidenceReviewTasks.triggerSnapshotId, proposal.sourceReviewSnapshotId),
          inArray(evidenceReviewTasks.status, ['OPEN', 'IN_REVIEW', 'BLOCKED']),
          eq(programmeFreshnessStates.pendingSnapshotId, proposal.sourceReviewSnapshotId),
        ),
      )
      .limit(1)
    if (!sourceBindingRows[0]) {
      throw new ContributionReviewError(
        409,
        'A newer saved source version superseded this contribution. Review the replacement source task instead.',
        'source_task_superseded',
      )
    }
  }
  return proposal
}

async function requireViewer(database: ReadExecutor, viewerUserId: string): Promise<UserRow> {
  const viewer = await loadViewer(database, viewerUserId)
  if (!viewer) {
    throw new ContributionReviewError(401, 'Sign in to continue.', 'unauthenticated')
  }
  return viewer
}

export async function getContributionReviewState(args: {
  proposalId: string
  viewerUserId: string
}): Promise<ContributionReviewReadResponse> {
  const [proposal, viewer] = await Promise.all([
    requireReviewableProposal(db, args.proposalId),
    requireViewer(db, args.viewerUserId),
  ])
  return buildReadResponse({ database: db, proposal, viewer })
}

/**
 * Batch projection for the signed-out public queue. Decisions stay hidden while reviews are still
 * being collected so an earlier decision cannot anchor a later reviewer. Once the recorded
 * decisions produce a resolution or visible disagreement, the safe attributed audit is public; raw
 * account ids and private account fields never leave here.
 */
export async function listPublicContributionReviewAudits(
  proposalIds: readonly string[],
): Promise<Record<string, PublicContributionReviewAudit>> {
  if (proposalIds.length === 0) return {}

  const [stateRows, reviewRows, adjudicationRows] = await Promise.all([
    db
      .select()
      .from(programmeContributionReviewStates)
      .where(inArray(programmeContributionReviewStates.proposalId, [...proposalIds])),
    db
      .select({ review: programmeContributionReviews, reviewerHandle: users.handle })
      .from(programmeContributionReviews)
      .innerJoin(users, eq(users.id, programmeContributionReviews.reviewerUserId))
      .where(inArray(programmeContributionReviews.proposalId, [...proposalIds]))
      .orderBy(asc(programmeContributionReviews.reviewedAt), asc(programmeContributionReviews.id)),
    db
      .select({
        adjudication: programmeContributionAdjudications,
        adjudicatorHandle: users.handle,
      })
      .from(programmeContributionAdjudications)
      .innerJoin(users, eq(users.id, programmeContributionAdjudications.adjudicatorUserId))
      .where(inArray(programmeContributionAdjudications.proposalId, [...proposalIds])),
  ])

  const reviewsByProposal = new Map<string, ContributionReviewView[]>()
  for (const { review, reviewerHandle } of reviewRows) {
    const values = reviewsByProposal.get(review.proposalId) ?? []
    values.push({
      id: review.id,
      reviewer: publicAttribution({
        name: review.reviewerNameSnapshot,
        handle: reviewerHandle,
        orcid: review.reviewerOrcidSnapshot,
      }),
      expertiseTags: review.expertiseTags,
      decision: review.decision,
      independenceAttested: true,
      conflictsOfInterest: review.conflictsOfInterest,
      conflictsOfInterestAttested: true,
      reviewNote: review.reviewNote,
      reviewedAt: review.reviewedAt.toISOString(),
    })
    reviewsByProposal.set(review.proposalId, values)
  }

  const adjudicationByProposal = new Map<string, ContributionAdjudicationView>()
  for (const { adjudication, adjudicatorHandle } of adjudicationRows) {
    adjudicationByProposal.set(adjudication.proposalId, {
      id: adjudication.id,
      adjudicator: publicAttribution({
        name: adjudication.adjudicatorNameSnapshot,
        handle: adjudicatorHandle,
        orcid: adjudication.adjudicatorOrcidSnapshot,
      }),
      expertiseTags: adjudication.expertiseTags,
      decision: adjudication.decision,
      rationale: adjudication.rationale,
      conflictsOfInterest: adjudication.conflictsOfInterest,
      conflictsOfInterestAttested: true,
      adjudicatedAt: adjudication.adjudicatedAt.toISOString(),
    })
  }

  return Object.fromEntries(
    stateRows.map((state) => {
      const decisionsArePublic =
        state.status === 'DISAGREEMENT' ||
        state.status === 'ACCEPTED_FOR_IMPLEMENTATION' ||
        state.status === 'CHANGES_REQUESTED' ||
        state.status === 'REJECTED'
      return [
        state.proposalId,
        {
          reviewState: serializeState(state),
          reviews: decisionsArePublic ? (reviewsByProposal.get(state.proposalId) ?? []) : [],
          adjudication: decisionsArePublic
            ? (adjudicationByProposal.get(state.proposalId) ?? null)
            : null,
        },
      ]
    }),
  )
}

function throwReviewEligibility(reason: ContributionReviewEligibilityReason): never {
  switch (reason) {
    case 'AUTHOR_CANNOT_REVIEW':
      throw new ContributionReviewError(
        403,
        'You cannot review your own contribution proposal.',
        'self_review',
      )
    case 'INSUFFICIENT_TRUST':
      throw new ContributionReviewError(
        403,
        'Reviewing contribution proposals requires a trusted editor, steward, or administrator.',
        'reviewer_ineligible',
      )
    case 'ALREADY_REVIEWED':
      throw new ContributionReviewError(
        409,
        'Your review is already recorded and cannot be changed.',
        'review_already_submitted',
      )
    case 'ADJUDICATION_REQUIRED':
      throw new ContributionReviewError(
        409,
        'The independent reviews disagree; a steward adjudication is required.',
        'adjudication_required',
      )
    case 'REVIEW_COMPLETE':
      throw new ContributionReviewError(
        409,
        'This contribution review has already reached a decision.',
        'review_complete',
      )
    case 'ELIGIBLE':
      throw new Error('Eligible contribution reviewer was rejected unexpectedly.')
  }
}

export async function submitContributionReview(args: {
  proposalId: string
  reviewerUserId: string
  input: ContributionReviewDecisionInput
}): Promise<ContributionReviewReadResponse> {
  return db.transaction(async (tx) => {
    let proposal = await requireReviewableProposal(tx, args.proposalId)
    await lockContributionLineage(tx, proposal)
    proposal = await requireReviewableProposal(tx, args.proposalId)
    if (await hasNewerSubmittedRevision(tx, proposal)) {
      throw new ContributionReviewError(
        409,
        'A newer submitted revision has superseded this proposal for review.',
        'proposal_superseded',
      )
    }
    const stateRows = await tx
      .select()
      .from(programmeContributionReviewStates)
      .where(eq(programmeContributionReviewStates.proposalId, proposal.id))
      .limit(1)
      .for('update')
    if (!stateRows[0]) {
      throw new ContributionReviewError(
        409,
        'Review workflow state is missing.',
        'review_state_missing',
      )
    }

    const viewer = await requireViewer(tx, args.reviewerUserId)
    const reviews = await loadReviews(tx, proposal.id)
    const eligibility = reviewEligibility({
      proposal,
      state: stateRows[0],
      viewer,
      reviews,
    })
    if (!eligibility.canReview) throwReviewEligibility(eligibility.reason)

    await tx.insert(programmeContributionReviews).values({
      id: newId('contribreview'),
      proposalId: proposal.id,
      reviewerUserId: viewer.id,
      reviewerNameSnapshot: viewer.name,
      reviewerOrcidSnapshot: viewer.orcid,
      expertiseTags: args.input.expertiseTags,
      decision: args.input.decision,
      independenceAttested: true,
      conflictsOfInterest: args.input.conflictsOfInterest,
      conflictsOfInterestAttested: true,
      reviewNote: args.input.reviewNote ?? null,
      contentDigestAlgorithm: proposal.contentDigestAlgorithm,
      contentDigest: proposal.contentDigest!,
    })

    return buildReadResponse({ database: tx, proposal, viewer })
  })
}

function throwAdjudicationEligibility(reason: ContributionAdjudicationEligibilityReason): never {
  switch (reason) {
    case 'AUTHOR_CANNOT_ADJUDICATE':
      throw new ContributionReviewError(
        403,
        'The contribution author cannot adjudicate this proposal.',
        'author_cannot_adjudicate',
      )
    case 'REVIEWER_CANNOT_ADJUDICATE':
      throw new ContributionReviewError(
        403,
        'An ordinary reviewer cannot adjudicate the same proposal.',
        'reviewer_cannot_adjudicate',
      )
    case 'STEWARD_REQUIRED':
      throw new ContributionReviewError(
        403,
        'Adjudication requires a steward or administrator.',
        'adjudicator_ineligible',
      )
    case 'ALREADY_ADJUDICATED':
      throw new ContributionReviewError(
        409,
        'This disagreement has already been adjudicated.',
        'already_adjudicated',
      )
    case 'NOT_IN_DISAGREEMENT':
      throw new ContributionReviewError(
        409,
        'Adjudication is available only after independent reviews disagree.',
        'not_in_disagreement',
      )
    case 'ELIGIBLE':
      throw new Error('Eligible contribution adjudicator was rejected unexpectedly.')
  }
}

export async function adjudicateContributionReview(args: {
  proposalId: string
  adjudicatorUserId: string
  input: ContributionAdjudicationDecisionInput
}): Promise<ContributionReviewReadResponse> {
  return db.transaction(async (tx) => {
    let proposal = await requireReviewableProposal(tx, args.proposalId)
    await lockContributionLineage(tx, proposal)
    proposal = await requireReviewableProposal(tx, args.proposalId)
    const stateRows = await tx
      .select()
      .from(programmeContributionReviewStates)
      .where(eq(programmeContributionReviewStates.proposalId, proposal.id))
      .limit(1)
      .for('update')
    const state = stateRows[0]
    if (!state) {
      throw new ContributionReviewError(
        409,
        'Review workflow state is missing.',
        'review_state_missing',
      )
    }

    const viewer = await requireViewer(tx, args.adjudicatorUserId)
    const reviews = await loadReviews(tx, proposal.id)
    const existingAdjudication = await loadAdjudication(tx, proposal.id)
    const eligibility = adjudicationEligibility({
      proposal,
      state,
      viewer,
      reviews,
      adjudication: existingAdjudication,
    })
    if (!eligibility.canAdjudicate) throwAdjudicationEligibility(eligibility.reason)

    await tx.insert(programmeContributionAdjudications).values({
      id: newId('contribadjud'),
      proposalId: proposal.id,
      adjudicatorUserId: viewer.id,
      adjudicatorNameSnapshot: viewer.name,
      adjudicatorOrcidSnapshot: viewer.orcid,
      expertiseTags: args.input.expertiseTags,
      decision: args.input.decision,
      rationale: args.input.rationale,
      conflictsOfInterest: args.input.conflictsOfInterest,
      conflictsOfInterestAttested: true,
      contentDigestAlgorithm: proposal.contentDigestAlgorithm,
      contentDigest: proposal.contentDigest!,
    })

    return buildReadResponse({ database: tx, proposal, viewer })
  })
}
