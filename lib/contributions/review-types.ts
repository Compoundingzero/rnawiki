import type { ContributionReviewStatus } from '@/lib/contributions/types'
import type { VerdictReviewDecision, VerdictReviewerExpertiseTag } from '@/lib/evidence/types'

/** Safe public-profile boundary shared by contributor, reviewer, and adjudicator attribution. */
export interface ContributionPublicAttribution {
  name: string
  handle: string
  orcid?: string
}

export interface ContributionReviewStateView {
  status: ContributionReviewStatus
  reviewCount: number
  /** Review policy frozen when the proposal entered review: 2 before migration 0015, 3 after. */
  requiredReviewCount: number
  consensus: VerdictReviewDecision | null
  updatedAt: string
  resolvedAt: string | null
}

export interface ContributionReviewView {
  id: string
  reviewer: ContributionPublicAttribution
  expertiseTags: VerdictReviewerExpertiseTag[]
  decision: VerdictReviewDecision
  independenceAttested: true
  conflictsOfInterest: string
  conflictsOfInterestAttested: true
  reviewNote: string | null
  reviewedAt: string
}

export interface ContributionAdjudicationView {
  id: string
  adjudicator: ContributionPublicAttribution
  expertiseTags: VerdictReviewerExpertiseTag[]
  decision: VerdictReviewDecision
  rationale: string
  conflictsOfInterest: string
  conflictsOfInterestAttested: true
  adjudicatedAt: string
}

export const CONTRIBUTION_REVIEW_ELIGIBILITY_REASONS = [
  'ELIGIBLE',
  'AUTHOR_CANNOT_REVIEW',
  'INSUFFICIENT_TRUST',
  'ALREADY_REVIEWED',
  'REVIEW_COMPLETE',
  'ADJUDICATION_REQUIRED',
] as const
export type ContributionReviewEligibilityReason =
  (typeof CONTRIBUTION_REVIEW_ELIGIBILITY_REASONS)[number]

export const CONTRIBUTION_ADJUDICATION_ELIGIBILITY_REASONS = [
  'ELIGIBLE',
  'NOT_IN_DISAGREEMENT',
  'AUTHOR_CANNOT_ADJUDICATE',
  'REVIEWER_CANNOT_ADJUDICATE',
  'STEWARD_REQUIRED',
  'ALREADY_ADJUDICATED',
] as const
export type ContributionAdjudicationEligibilityReason =
  (typeof CONTRIBUTION_ADJUDICATION_ELIGIBILITY_REASONS)[number]

export interface ContributionReviewReadResponse {
  reviewState: ContributionReviewStateView
  eligibility: {
    canReview: boolean
    reason: ContributionReviewEligibilityReason
  }
  adjudicationEligibility: {
    canAdjudicate: boolean
    reason: ContributionAdjudicationEligibilityReason
  }
  myReview: ContributionReviewView | null
  /** Empty while a potential reviewer is blind and has not yet submitted their own decision. */
  reviews: ContributionReviewView[]
  adjudication: ContributionAdjudicationView | null
}

/** Public queue audit. Decisions remain blind until agreement resolves or disagreement is public. */
export interface PublicContributionReviewAudit {
  reviewState: ContributionReviewStateView
  reviews: ContributionReviewView[]
  adjudication: ContributionAdjudicationView | null
}
