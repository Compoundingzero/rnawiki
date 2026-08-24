// Atomic publication gate for programme-level medical conclusions.
//
// Reviewers sign a proposal assembled exclusively from locked, normalized persistence. The
// publication request carries only that proposal digest; it cannot supply or override scientific
// evidence. The same proposal is rebuilt immediately before the public pointer changes.

import { and, asc, eq, inArray, notInArray } from 'drizzle-orm'

import { db } from '@/db'
import { ApiError } from '@/lib/api-response'
import {
  claims,
  developmentProgrammes,
  evidenceNodes,
  evidenceReviewTasks,
  evidenceSources,
  programmeContributionImplementations,
  programmeContributionProposals,
  programmeCurrentPublications,
  programmeFreshnessStates,
  programmeTrials,
  programmeVerdictAdjudications,
  programmeVerdictReviews,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  programmeVerdictSourceMetadataSnapshots,
  programmeVerdictTrialSnapshots,
  trialInterpretabilityAssessments,
  users,
} from '@/db/schema'
import {
  buildLockedProgrammeVerdictProposal,
  type LockedProgrammeVerdictProposal,
} from '@/lib/queries/programme-verdict-proposal'
import { activeProgrammeVerdictQualifications } from '@/lib/queries/programme-verdict-workflow'

export { prepareProgrammeVerdictProposal } from '@/lib/queries/programme-verdict-proposal'

export type ProgrammeVerdictPublicationErrorCode =
  | 'revision_not_found'
  | 'programme_not_found'
  | 'not_publication_candidate'
  | 'publication_invariant'
  | 'stale_revision_lineage'
  | 'proposal_digest_mismatch'
  | 'stale_review_digest'
  | 'invalid_reviewer_identity'
  | 'insufficient_independent_reviews'
  | 'unresolved_review'
  | 'invalid_engine_provenance'
  | 'publisher_not_authorized'
  | 'stale_source_review_task'

export class ProgrammeVerdictPublicationError extends ApiError {
  override readonly code: ProgrammeVerdictPublicationErrorCode

  constructor(code: ProgrammeVerdictPublicationErrorCode, message: string) {
    super(
      code === 'revision_not_found'
        ? 404
        : code === 'publisher_not_authorized'
          ? 403
          : code === 'proposal_digest_mismatch'
            ? 422
            : 409,
      message,
      code,
    )
    this.name = 'ProgrammeVerdictPublicationError'
    this.code = code
  }
}

export interface PublishProgrammeVerdictInput {
  revisionId: string
  /** Authenticated steward/admin responsible for the atomic public-pointer change. */
  publisherUserId: string
  /** Exact digest returned by prepareProgrammeVerdictProposal and signed by every reviewer. */
  expectedProposalDigest: string
}

export interface PublishedProgrammeVerdictResult {
  revisionId: string
  programmeId: string
  previousRevisionId: string | null
  publishedAt: Date
  proposalDigest: string
  /** True only when this exact, request-equivalent revision is already authoritative. */
  alreadyPublished: boolean
}

type VerdictRow = typeof programmeVerdictRevisions.$inferSelect

/**
 * Kept intentionally tolerant at the function boundary so malformed legacy/caller rows are
 * rejected explicitly rather than being treated as name-based principals. The database schema is
 * stricter: reviewerUserId and the signed provenance fields are NOT NULL.
 */
interface ReviewRow {
  id: string
  reviewerUserId: string | null
  reviewerName: string
  decision: (typeof programmeVerdictReviews.$inferSelect)['decision']
  isIndependent: boolean
  conflictsOfInterestAttested?: boolean
  expertiseTags?: (typeof programmeVerdictReviews.$inferSelect)['expertiseTags']
  proposalDigestAlgorithm?: string
  proposalDigest?: string
  engineVersion?: string
  inputDigestAlgorithm?: string
  inputDigest?: string
  reviewedAt: Date
  qualificationVerified?: boolean
  standingVerified?: boolean
}

interface AdjudicationRow {
  adjudicatorUserId: string
  decision: (typeof programmeVerdictAdjudications.$inferSelect)['decision']
  proposalDigestAlgorithm: string
  proposalDigest: string
  engineVersion: string
  inputDigestAlgorithm: string
  inputDigest: string
  adjudicatedAt: Date
  qualificationVerified: boolean
  standingVerified: boolean
  independentVerified: boolean
}

interface ReviewBinding {
  proposalDigest: string
  engineVersion: string
  inputDigest: string
}

interface ReviewConsensus {
  approvedReviewerKeys: string[]
  reviewedAt: Date
}

function isSha256(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value)
}

/** Exactly two immutable qualified decisions; disagreement requires one bound adjudication. */
export function programmeVerdictReviewConsensus(
  reviews: readonly ReviewRow[],
  authorUserId: string | null,
  binding?: ReviewBinding,
  adjudication?: AdjudicationRow | null,
): ReviewConsensus {
  // Never fall back to mutable/display names. A null principal makes the review set unusable.
  if (reviews.some((review) => !review.reviewerUserId?.trim())) {
    throw new ProgrammeVerdictPublicationError(
      'insufficient_independent_reviews',
      'Every counted programme verdict review requires an authenticated immutable reviewer id.',
    )
  }

  if (
    binding &&
    reviews.some(
      (review) =>
        review.proposalDigestAlgorithm !== 'sha256' ||
        review.proposalDigest !== binding.proposalDigest ||
        review.engineVersion !== binding.engineVersion ||
        review.inputDigestAlgorithm !== 'sha256' ||
        review.inputDigest !== binding.inputDigest,
    )
  ) {
    throw new ProgrammeVerdictPublicationError(
      'stale_review_digest',
      'At least one review is bound to a different proposal or RNA Intelligence input.',
    )
  }

  const reviewerIds = reviews.map((review) => review.reviewerUserId as string)
  if (new Set(reviewerIds).size !== reviews.length) {
    throw new ProgrammeVerdictPublicationError(
      'invalid_reviewer_identity',
      'Each canonical reviewer may record exactly one immutable decision per candidate.',
    )
  }
  if (reviews.length !== 2) {
    throw new ProgrammeVerdictPublicationError(
      'insufficient_independent_reviews',
      'Exactly two qualified independent reviewers must decide the current proposal.',
    )
  }
  if (
    reviews.some(
      (review) =>
        !review.isIndependent ||
        review.reviewerUserId === authorUserId ||
        (binding &&
          (review.conflictsOfInterestAttested !== true ||
            (review.expertiseTags?.length ?? 0) === 0 ||
            review.qualificationVerified !== true ||
            review.standingVerified !== true)),
    )
  ) {
    throw new ProgrammeVerdictPublicationError(
      'insufficient_independent_reviews',
      'Both reviewers must remain independent, trusted, conflict-attested, and actively qualified for their recorded expertise.',
    )
  }

  const [first, second] = reviews
  if (first!.decision === second!.decision && first!.decision !== 'APPROVE') {
    throw new ProgrammeVerdictPublicationError(
      'unresolved_review',
      'Both reviewers recorded an adverse decision; this candidate cannot be published.',
    )
  }

  let decidedAt = Math.max(first!.reviewedAt.getTime(), second!.reviewedAt.getTime())
  if (first!.decision !== second!.decision) {
    if (
      !adjudication ||
      !binding ||
      adjudication.proposalDigestAlgorithm !== 'sha256' ||
      adjudication.proposalDigest !== binding.proposalDigest ||
      adjudication.engineVersion !== binding.engineVersion ||
      adjudication.inputDigestAlgorithm !== 'sha256' ||
      adjudication.inputDigest !== binding.inputDigest ||
      !adjudication.qualificationVerified ||
      !adjudication.standingVerified ||
      !adjudication.independentVerified
    ) {
      throw new ProgrammeVerdictPublicationError(
        'unresolved_review',
        'The two reviewers disagree. A qualified independent steward must adjudicate the exact proposal.',
      )
    }
    if (adjudication.decision !== 'APPROVE') {
      throw new ProgrammeVerdictPublicationError(
        'unresolved_review',
        'The adjudicator did not approve this candidate for publication.',
      )
    }
    decidedAt = Math.max(decidedAt, adjudication.adjudicatedAt.getTime())
  }

  return {
    approvedReviewerKeys: reviewerIds.map((reviewerUserId) => `user:${reviewerUserId}`).sort(),
    reviewedAt: new Date(decidedAt),
  }
}

function assertStoredProposalProvenance(
  candidate: VerdictRow,
  expectedProposalDigest: string,
): void {
  if (
    candidate.proposalDigestAlgorithm !== 'sha256' ||
    !isSha256(candidate.proposalDigest) ||
    candidate.proposalDigest !== expectedProposalDigest
  ) {
    throw new ProgrammeVerdictPublicationError(
      'proposal_digest_mismatch',
      'The requested proposal digest does not match the immutable prepared revision.',
    )
  }
  if (
    !candidate.engineVersion?.trim() ||
    candidate.inputDigestAlgorithm !== 'sha256' ||
    !isSha256(candidate.inputDigest)
  ) {
    throw new ProgrammeVerdictPublicationError(
      'invalid_engine_provenance',
      'The revision is missing valid RNA Intelligence engine provenance.',
    )
  }
}

async function lockedReviewConsensus(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  candidate: VerdictRow,
): Promise<ReviewConsensus> {
  const reviews = await tx
    .select({
      id: programmeVerdictReviews.id,
      reviewerUserId: programmeVerdictReviews.reviewerUserId,
      reviewerName: programmeVerdictReviews.reviewerName,
      decision: programmeVerdictReviews.decision,
      isIndependent: programmeVerdictReviews.isIndependent,
      conflictsOfInterestAttested: programmeVerdictReviews.conflictsOfInterestAttested,
      expertiseTags: programmeVerdictReviews.expertiseTags,
      proposalDigestAlgorithm: programmeVerdictReviews.proposalDigestAlgorithm,
      proposalDigest: programmeVerdictReviews.proposalDigest,
      engineVersion: programmeVerdictReviews.engineVersion,
      inputDigestAlgorithm: programmeVerdictReviews.inputDigestAlgorithm,
      inputDigest: programmeVerdictReviews.inputDigest,
      reviewedAt: programmeVerdictReviews.reviewedAt,
      reviewerTrustTier: users.trustTier,
      reviewerIsAdmin: users.isAdmin,
    })
    .from(programmeVerdictReviews)
    .innerJoin(users, eq(users.id, programmeVerdictReviews.reviewerUserId))
    .where(eq(programmeVerdictReviews.verdictRevisionId, candidate.id))
    .orderBy(asc(programmeVerdictReviews.reviewedAt), asc(programmeVerdictReviews.id))
    .for('share')

  const implementationRows = await tx
    .select({ contributionAuthorUserId: programmeContributionProposals.authorUserId })
    .from(programmeContributionImplementations)
    .innerJoin(
      programmeContributionProposals,
      eq(programmeContributionProposals.id, programmeContributionImplementations.proposalId),
    )
    .where(eq(programmeContributionImplementations.verdictRevisionId, candidate.id))
    .limit(1)
    .for('share')
  const contributionAuthorUserId = implementationRows[0]?.contributionAuthorUserId ?? null
  const qualifiedReviews: ReviewRow[] = []
  for (const review of reviews) {
    const active = await activeProgrammeVerdictQualifications(tx, review.reviewerUserId)
    qualifiedReviews.push({
      ...review,
      isIndependent: review.isIndependent && review.reviewerUserId !== contributionAuthorUserId,
      qualificationVerified:
        review.expertiseTags.length > 0 &&
        review.expertiseTags.every((tag) => active.includes(tag)),
      standingVerified:
        review.reviewerIsAdmin ||
        review.reviewerTrustTier === 'trusted' ||
        review.reviewerTrustTier === 'steward',
    })
  }

  const adjudicationRows = await tx
    .select({
      adjudication: programmeVerdictAdjudications,
      adjudicatorTrustTier: users.trustTier,
      adjudicatorIsAdmin: users.isAdmin,
    })
    .from(programmeVerdictAdjudications)
    .innerJoin(users, eq(users.id, programmeVerdictAdjudications.adjudicatorUserId))
    .where(eq(programmeVerdictAdjudications.verdictRevisionId, candidate.id))
    .limit(1)
    .for('share')
  const adjudicationEntry = adjudicationRows[0]
  let adjudication: AdjudicationRow | null = null
  if (adjudicationEntry) {
    const row = adjudicationEntry.adjudication
    const active = await activeProgrammeVerdictQualifications(tx, row.adjudicatorUserId)
    adjudication = {
      adjudicatorUserId: row.adjudicatorUserId,
      decision: row.decision,
      proposalDigestAlgorithm: row.proposalDigestAlgorithm,
      proposalDigest: row.proposalDigest,
      engineVersion: row.engineVersion,
      inputDigestAlgorithm: row.inputDigestAlgorithm,
      inputDigest: row.inputDigest,
      adjudicatedAt: row.adjudicatedAt,
      qualificationVerified:
        row.expertiseTags.length > 0 && row.expertiseTags.every((tag) => active.includes(tag)),
      standingVerified:
        adjudicationEntry.adjudicatorIsAdmin ||
        adjudicationEntry.adjudicatorTrustTier === 'steward',
      independentVerified:
        row.adjudicatorUserId !== candidate.authorUserId &&
        row.adjudicatorUserId !== contributionAuthorUserId &&
        qualifiedReviews.every((review) => review.reviewerUserId !== row.adjudicatorUserId),
    }
  }

  return programmeVerdictReviewConsensus(
    qualifiedReviews,
    candidate.authorUserId,
    {
      proposalDigest: candidate.proposalDigest as string,
      engineVersion: candidate.engineVersion as string,
      inputDigest: candidate.inputDigest as string,
    },
    adjudication,
  )
}

async function promoteReviewedEvidenceBundle(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  proposal: LockedProgrammeVerdictProposal,
  publishedAt: Date,
): Promise<void> {
  const candidateClaimRows = await tx
    .select({ id: claims.id, claimKey: claims.claimKey, reviewStatus: claims.reviewStatus })
    .from(claims)
    .where(
      and(
        eq(claims.programmeId, proposal.programmeId),
        inArray(claims.id, proposal.reviewedClaimIds),
      ),
    )
    .orderBy(asc(claims.id))
    .for('update')
  const claimsToPublish = candidateClaimRows.filter((row) => row.reviewStatus !== 'PUBLISHED')
  if (claimsToPublish.length > 0) {
    await tx
      .update(claims)
      .set({ reviewStatus: 'SUPERSEDED', supersededAt: publishedAt })
      .where(
        and(
          eq(claims.programmeId, proposal.programmeId),
          eq(claims.reviewStatus, 'PUBLISHED'),
          inArray(claims.claimKey, [...new Set(claimsToPublish.map((row) => row.claimKey))]),
          notInArray(claims.id, proposal.reviewedClaimIds),
        ),
      )
    const promotedClaims = await tx
      .update(claims)
      .set({ reviewStatus: 'PUBLISHED', publishedAt, supersededAt: null })
      .where(
        and(
          inArray(
            claims.id,
            claimsToPublish.map((row) => row.id),
          ),
          inArray(claims.reviewStatus, ['DRAFT', 'MACHINE_CHECKED', 'APPROVED']),
        ),
      )
      .returning({ id: claims.id })
    if (promotedClaims.length !== claimsToPublish.length) {
      throw new ProgrammeVerdictPublicationError(
        'publication_invariant',
        'A reviewed claim revision changed while its bundle was being published.',
      )
    }
  }

  if (proposal.reviewedEvidenceNodeIds.length > 0) {
    const candidateNodeRows = await tx
      .select({
        id: evidenceNodes.id,
        nodeType: evidenceNodes.nodeType,
        reviewStatus: evidenceNodes.reviewStatus,
      })
      .from(evidenceNodes)
      .where(
        and(
          eq(evidenceNodes.programmeId, proposal.programmeId),
          inArray(evidenceNodes.id, proposal.reviewedEvidenceNodeIds),
        ),
      )
      .orderBy(asc(evidenceNodes.id))
      .for('update')
    const nodesToPublish = candidateNodeRows.filter((row) => row.reviewStatus !== 'PUBLISHED')
    if (nodesToPublish.length > 0) {
      await tx
        .update(evidenceNodes)
        .set({ reviewStatus: 'SUPERSEDED', supersededAt: publishedAt })
        .where(
          and(
            eq(evidenceNodes.programmeId, proposal.programmeId),
            eq(evidenceNodes.reviewStatus, 'PUBLISHED'),
            inArray(evidenceNodes.nodeType, [
              ...new Set(nodesToPublish.map((row) => row.nodeType)),
            ]),
            notInArray(evidenceNodes.id, proposal.reviewedEvidenceNodeIds),
          ),
        )
      const promotedNodes = await tx
        .update(evidenceNodes)
        .set({ reviewStatus: 'PUBLISHED', publishedAt, supersededAt: null })
        .where(
          and(
            inArray(
              evidenceNodes.id,
              nodesToPublish.map((row) => row.id),
            ),
            inArray(evidenceNodes.reviewStatus, ['DRAFT', 'MACHINE_CHECKED', 'APPROVED']),
          ),
        )
        .returning({ id: evidenceNodes.id })
      if (promotedNodes.length !== nodesToPublish.length) {
        throw new ProgrammeVerdictPublicationError(
          'publication_invariant',
          'A reviewed evidence-node revision changed while its bundle was being published.',
        )
      }
    }
  }

  if (proposal.reviewedInterpretabilityAssessmentIds.length > 0) {
    const candidateAssessmentRows = await tx
      .select({
        id: trialInterpretabilityAssessments.id,
        programmeTrialId: trialInterpretabilityAssessments.programmeTrialId,
        criterion: trialInterpretabilityAssessments.criterion,
        reviewStatus: trialInterpretabilityAssessments.reviewStatus,
      })
      .from(trialInterpretabilityAssessments)
      .where(
        and(
          eq(trialInterpretabilityAssessments.programmeId, proposal.programmeId),
          inArray(
            trialInterpretabilityAssessments.id,
            proposal.reviewedInterpretabilityAssessmentIds,
          ),
        ),
      )
      .orderBy(asc(trialInterpretabilityAssessments.id))
      .for('update')
    const assessmentsToPublish = candidateAssessmentRows.filter(
      (row) => row.reviewStatus !== 'PUBLISHED',
    )
    for (const assessment of assessmentsToPublish) {
      await tx
        .update(trialInterpretabilityAssessments)
        .set({ reviewStatus: 'SUPERSEDED', supersededAt: publishedAt })
        .where(
          and(
            eq(trialInterpretabilityAssessments.programmeId, proposal.programmeId),
            eq(trialInterpretabilityAssessments.programmeTrialId, assessment.programmeTrialId),
            eq(trialInterpretabilityAssessments.criterion, assessment.criterion),
            eq(trialInterpretabilityAssessments.reviewStatus, 'PUBLISHED'),
            notInArray(
              trialInterpretabilityAssessments.id,
              proposal.reviewedInterpretabilityAssessmentIds,
            ),
          ),
        )
    }
    if (assessmentsToPublish.length > 0) {
      const promotedAssessments = await tx
        .update(trialInterpretabilityAssessments)
        .set({ reviewStatus: 'PUBLISHED', publishedAt, supersededAt: null })
        .where(
          and(
            inArray(
              trialInterpretabilityAssessments.id,
              assessmentsToPublish.map((row) => row.id),
            ),
            inArray(trialInterpretabilityAssessments.reviewStatus, [
              'DRAFT',
              'MACHINE_CHECKED',
              'APPROVED',
            ]),
          ),
        )
        .returning({ id: trialInterpretabilityAssessments.id })
      if (promotedAssessments.length !== assessmentsToPublish.length) {
        throw new ProgrammeVerdictPublicationError(
          'publication_invariant',
          'A reviewed interpretability revision changed while its bundle was being published.',
        )
      }
    }
  }
}

async function synchronizePublishedStagingBaseline(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  proposal: LockedProgrammeVerdictProposal,
  publishedAt: Date,
): Promise<void> {
  const scopeRows = await tx
    .select()
    .from(programmeVerdictScopeSnapshots)
    .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, proposal.revisionId))
    .limit(1)
    .for('share')
  const scope = scopeRows[0]
  if (!scope) {
    throw new ProgrammeVerdictPublicationError(
      'publication_invariant',
      'The exact published programme-scope snapshot is missing.',
    )
  }
  const programmeRows = await tx
    .update(developmentProgrammes)
    .set({
      drugId: scope.drugId,
      slug: scope.slug,
      title: scope.title,
      indication: scope.indication,
      targetPopulation: scope.targetPopulation,
      jurisdiction: scope.jurisdiction,
      sponsor: scope.sponsor,
      partners: scope.partners,
      status: scope.status,
      highestPhaseReached: scope.highestPhaseReached,
      route: scope.route,
      doseExposureContext: scope.doseExposureContext,
      startDate: scope.startDate,
      endDate: scope.endDate,
      rawStoppingReason: scope.rawStoppingReason,
      stoppingReasonCategory: scope.stoppingReasonCategory,
      updatedAt: publishedAt,
    })
    .where(eq(developmentProgrammes.id, proposal.programmeId))
    .returning({ id: developmentProgrammes.id })
  if (!programmeRows[0]) {
    throw new ProgrammeVerdictPublicationError(
      'publication_invariant',
      'The published programme staging baseline could not be synchronized.',
    )
  }

  const trialSnapshots = await tx
    .select()
    .from(programmeVerdictTrialSnapshots)
    .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, proposal.revisionId))
    .orderBy(asc(programmeVerdictTrialSnapshots.programmeTrialId))
    .for('share')
  if (trialSnapshots.length !== proposal.reviewedTrialIds.length) {
    throw new ProgrammeVerdictPublicationError(
      'publication_invariant',
      'The published trial snapshot bundle is incomplete.',
    )
  }
  for (const trial of trialSnapshots) {
    const rows = await tx
      .update(programmeTrials)
      .set({
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
        lastVerifiedAt: trial.lastVerifiedAt,
        updatedAt: publishedAt,
      })
      .where(
        and(
          eq(programmeTrials.id, trial.programmeTrialId),
          eq(programmeTrials.programmeId, proposal.programmeId),
        ),
      )
      .returning({ id: programmeTrials.id })
    if (!rows[0]) {
      throw new ProgrammeVerdictPublicationError(
        'publication_invariant',
        `Published trial ${trial.programmeTrialId} could not be synchronized.`,
      )
    }
  }

  const sourceMetadata = await tx
    .select()
    .from(programmeVerdictSourceMetadataSnapshots)
    .where(eq(programmeVerdictSourceMetadataSnapshots.verdictRevisionId, proposal.revisionId))
    .orderBy(asc(programmeVerdictSourceMetadataSnapshots.sourceId))
    .for('share')
  for (const source of sourceMetadata) {
    const rows = await tx
      .update(evidenceSources)
      .set({
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
        updatedAt: publishedAt,
      })
      .where(eq(evidenceSources.id, source.sourceId))
      .returning({ id: evidenceSources.id })
    if (!rows[0]) {
      throw new ProgrammeVerdictPublicationError(
        'publication_invariant',
        `Published source ${source.sourceId} could not be synchronized.`,
      )
    }
  }
}

/**
 * Publishes one exact reviewed programme verdict revision and atomically advances its authoritative
 * public pointer. Prior revisions remain intact as SUPERSEDED lineage.
 */
export async function publishProgrammeVerdictRevision(
  input: PublishProgrammeVerdictInput,
): Promise<PublishedProgrammeVerdictResult> {
  if (!isSha256(input.expectedProposalDigest)) {
    throw new ProgrammeVerdictPublicationError(
      'proposal_digest_mismatch',
      'expectedProposalDigest must be a lowercase SHA-256 digest.',
    )
  }

  return db.transaction(async (tx) => {
    const candidateRows = await tx
      .select()
      .from(programmeVerdictRevisions)
      .where(eq(programmeVerdictRevisions.id, input.revisionId))
      .limit(1)
      .for('update')
    const candidate = candidateRows[0]
    if (!candidate) {
      throw new ProgrammeVerdictPublicationError(
        'revision_not_found',
        'No programme verdict revision matches this id.',
      )
    }

    const publisherRows = await tx
      .select({ id: users.id, trustTier: users.trustTier, isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, input.publisherUserId))
      .limit(1)
      .for('share')
    const publisher = publisherRows[0]
    if (!publisher || (!publisher.isAdmin && publisher.trustTier !== 'steward')) {
      throw new ProgrammeVerdictPublicationError(
        'publisher_not_authorized',
        'Canonical publication requires an authenticated steward or administrator.',
      )
    }

    const pointerRows = await tx
      .select()
      .from(programmeCurrentPublications)
      .where(eq(programmeCurrentPublications.programmeId, candidate.programmeId))
      .limit(1)
      .for('update')
    const pointer = pointerRows[0] ?? null

    assertStoredProposalProvenance(candidate, input.expectedProposalDigest)

    // An idempotent retry is valid only for the same signed proposal and authoritative pointer.
    if (candidate.reviewStatus === 'PUBLISHED') {
      if (pointer?.verdictRevisionId !== candidate.id || !candidate.publishedAt) {
        throw new ProgrammeVerdictPublicationError(
          'publication_invariant',
          'A PUBLISHED revision is not the authoritative programme pointer.',
        )
      }
      await lockedReviewConsensus(tx, candidate)
      return {
        revisionId: candidate.id,
        programmeId: candidate.programmeId,
        previousRevisionId: candidate.previousVerdictRevisionId,
        publishedAt: candidate.publishedAt,
        proposalDigest: candidate.proposalDigest as string,
        alreadyPublished: true,
      }
    }

    if (candidate.reviewStatus !== 'APPROVED') {
      throw new ProgrammeVerdictPublicationError(
        'not_publication_candidate',
        `A ${candidate.reviewStatus} verdict revision cannot be published. Two qualified independent approvals, or an approving adjudication after disagreement, must close the review first.`,
      )
    }

    // This rebuild locks and reads the complete persisted graph and reruns RNA Intelligence.
    const proposal = await buildLockedProgrammeVerdictProposal(tx, candidate.id)
    if (
      proposal.proposalDigest !== input.expectedProposalDigest ||
      proposal.proposalDigest !== candidate.proposalDigest ||
      proposal.engineVersion !== candidate.engineVersion ||
      proposal.inputDigest !== candidate.inputDigest
    ) {
      throw new ProgrammeVerdictPublicationError(
        'proposal_digest_mismatch',
        'Persisted proposal content changed after human review; prepare a new verdict revision.',
      )
    }

    const consensus = await lockedReviewConsensus(tx, candidate)
    if (candidate.previousVerdictRevisionId !== proposal.previousRevisionId) {
      throw new ProgrammeVerdictPublicationError(
        'stale_revision_lineage',
        'The candidate predecessor no longer exactly matches the current public revision.',
      )
    }

    let previousRevision: VerdictRow | null = null
    if (proposal.previousRevisionId) {
      const previousRows = await tx
        .select()
        .from(programmeVerdictRevisions)
        .where(eq(programmeVerdictRevisions.id, proposal.previousRevisionId))
        .limit(1)
        .for('update')
      previousRevision = previousRows[0] ?? null
      if (
        !previousRevision ||
        previousRevision.programmeId !== candidate.programmeId ||
        previousRevision.reviewStatus !== 'PUBLISHED' ||
        pointer?.verdictRevisionId !== previousRevision.id
      ) {
        throw new ProgrammeVerdictPublicationError(
          'stale_revision_lineage',
          'The authoritative predecessor changed before publication.',
        )
      }
    } else if (pointer) {
      throw new ProgrammeVerdictPublicationError(
        'stale_revision_lineage',
        'The candidate omitted the current authoritative predecessor.',
      )
    }

    const publishedAt = new Date()
    await promoteReviewedEvidenceBundle(tx, proposal, publishedAt)
    if (previousRevision) {
      const superseded = await tx
        .update(programmeVerdictRevisions)
        .set({ reviewStatus: 'SUPERSEDED', supersededAt: publishedAt })
        .where(
          and(
            eq(programmeVerdictRevisions.id, previousRevision.id),
            eq(programmeVerdictRevisions.reviewStatus, 'PUBLISHED'),
          ),
        )
        .returning({ id: programmeVerdictRevisions.id })
      if (!superseded[0]) {
        throw new ProgrammeVerdictPublicationError(
          'publication_invariant',
          'The previous publication changed while it was being superseded.',
        )
      }
    }

    const published = await tx
      .update(programmeVerdictRevisions)
      .set({
        reviewStatus: 'PUBLISHED',
        reviewedAt: consensus.reviewedAt,
        publishedAt,
        supersededAt: null,
      })
      .where(
        and(
          eq(programmeVerdictRevisions.id, candidate.id),
          eq(programmeVerdictRevisions.reviewStatus, 'APPROVED'),
        ),
      )
      .returning({ id: programmeVerdictRevisions.id })
    if (!published[0]) {
      throw new ProgrammeVerdictPublicationError(
        'publication_invariant',
        'The candidate changed while it was being published.',
      )
    }
    await synchronizePublishedStagingBaseline(tx, proposal, publishedAt)

    const implementationRows = await tx
      .select()
      .from(programmeContributionImplementations)
      .where(eq(programmeContributionImplementations.verdictRevisionId, candidate.id))
      .limit(1)
      .for('update')
    const implementation = implementationRows[0]
    if (
      implementation?.sourceReviewTaskId &&
      implementation.sourceId &&
      implementation.sourceSnapshotId
    ) {
      const taskRows = await tx
        .select()
        .from(evidenceReviewTasks)
        .where(eq(evidenceReviewTasks.id, implementation.sourceReviewTaskId))
        .limit(1)
        .for('update')
      const freshnessRows = await tx
        .select()
        .from(programmeFreshnessStates)
        .where(
          and(
            eq(programmeFreshnessStates.programmeId, candidate.programmeId),
            eq(programmeFreshnessStates.sourceId, implementation.sourceId),
          ),
        )
        .limit(1)
        .for('update')
      const task = taskRows[0]
      const freshness = freshnessRows[0]
      if (
        !task ||
        !freshness ||
        task.programmeId !== candidate.programmeId ||
        task.sourceId !== implementation.sourceId ||
        task.triggerSnapshotId !== implementation.sourceSnapshotId ||
        !['OPEN', 'IN_REVIEW', 'BLOCKED'].includes(task.status) ||
        freshness.pendingSnapshotId !== implementation.sourceSnapshotId
      ) {
        throw new ProgrammeVerdictPublicationError(
          'stale_source_review_task',
          'The exact source-review task or pending snapshot changed before publication.',
        )
      }
      const freshnessAdvanced = await tx
        .update(programmeFreshnessStates)
        .set({
          currentSnapshotId: implementation.sourceSnapshotId,
          pendingSnapshotId: null,
          freshnessStatus: 'CURRENT',
          lastVerifiedAt: publishedAt,
          updatedAt: publishedAt,
        })
        .where(
          and(
            eq(programmeFreshnessStates.programmeId, candidate.programmeId),
            eq(programmeFreshnessStates.sourceId, implementation.sourceId),
            eq(programmeFreshnessStates.pendingSnapshotId, implementation.sourceSnapshotId),
          ),
        )
        .returning({ programmeId: programmeFreshnessStates.programmeId })
      if (!freshnessAdvanced[0]) {
        throw new ProgrammeVerdictPublicationError(
          'stale_source_review_task',
          'The pending source snapshot changed while the canonical bundle was being published.',
        )
      }
      const taskResolved = await tx
        .update(evidenceReviewTasks)
        .set({
          status: 'RESOLVED',
          resolutionNote: `Resolved by publication of exact canonical bundle ${candidate.id}.`,
          resolvedByUserId: publisher.id,
          resolutionVerdictRevisionId: candidate.id,
          resolvedAt: publishedAt,
          updatedAt: publishedAt,
        })
        .where(
          and(
            eq(evidenceReviewTasks.id, task.id),
            inArray(evidenceReviewTasks.status, ['OPEN', 'IN_REVIEW', 'BLOCKED']),
          ),
        )
        .returning({ id: evidenceReviewTasks.id })
      if (!taskResolved[0]) {
        throw new ProgrammeVerdictPublicationError(
          'stale_source_review_task',
          'The source-review task changed while the canonical bundle was being published.',
        )
      }
    }

    if (pointer) {
      const advanced = await tx
        .update(programmeCurrentPublications)
        .set({ verdictRevisionId: candidate.id, publishedAt })
        .where(
          and(
            eq(programmeCurrentPublications.programmeId, candidate.programmeId),
            eq(
              programmeCurrentPublications.verdictRevisionId,
              proposal.previousRevisionId as string,
            ),
          ),
        )
        .returning({ programmeId: programmeCurrentPublications.programmeId })
      if (!advanced[0]) {
        throw new ProgrammeVerdictPublicationError(
          'publication_invariant',
          'The public pointer changed while publication was committing.',
        )
      }
    } else {
      await tx.insert(programmeCurrentPublications).values({
        programmeId: candidate.programmeId,
        verdictRevisionId: candidate.id,
        publishedAt,
      })
    }

    return {
      revisionId: candidate.id,
      programmeId: candidate.programmeId,
      previousRevisionId: proposal.previousRevisionId,
      publishedAt,
      proposalDigest: proposal.proposalDigest,
      alreadyPublished: false,
    }
  })
}
