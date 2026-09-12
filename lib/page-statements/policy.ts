/**
 * Who may review a proposed wording, and how much review the wording needs.
 *
 * This extends the two standing systems rather than adding a third. Editorial standing is
 * `users.trust_tier` plus `users.is_admin`, the same predicate `canReviewLegacyIdentityCorrection`
 * and the contribution review guard already use. Scientific qualification is the existing
 * append-only ledger `programme_verdict_reviewer_qualification_events`, read through
 * `activeProgrammeVerdictQualifications`. Nothing here mints a new reviewer role.
 *
 * The one thing that did not exist is a restricted state: the schema had no way to say an account
 * may read but not review. `users.restricted_at` and `account_restriction_events` add it, because
 * the alternative was a moderation decision living in review code where nobody could audit it.
 */
import type { VerdictReviewerExpertiseTag } from '@/lib/evidence/types'

import {
  QUALIFIED_APPROVALS_REQUIRED,
  type PageStatementChangeCategory,
  type PageStatementKey,
  type PageStatementRiskClass,
  type PageStatementReviewEligibilityReason,
} from './types'

/* -------------------------------------------------------- risk derivation */

/** Categories whose meaning is never only editorial. */
const SCIENTIFIC_CATEGORIES: ReadonlySet<PageStatementChangeCategory> = new Set([
  'factual_accuracy',
  'missing_limitation',
  'evidence_classification',
  'source_correction',
  'identity_correction',
  'formulation_correction',
])

/** Categories that always reach a reader's safety. */
const HIGH_RISK_CATEGORIES: ReadonlySet<PageStatementChangeCategory> = new Set([
  'safety_correction',
  'interaction_correction',
])

/**
 * Wording that puts a change into the high-risk class whatever the member filed it as. A safety
 * edit submitted as a typo is still a safety edit, so the server derives the class and the
 * caller's opinion is only a hint.
 */
const HIGH_RISK_TEXT =
  /\b(?:warning|contraindicat\w*|interact\w*|pregnan\w*|breastfeed\w*|nursing|overdose|toxic\w*|fatal|death|emergency|hospital|withdraw\w*|recall(?:ed)?|suspend(?:ed)? (?:licence|license)|boxed|black box|prescri\w*|dose|dosage|mg\b|contraindication)\b/i

/**
 * Wording that changes what the evidence is said to show. A sentence that gains or loses one of
 * these is not a rewording, whichever box the member ticked.
 */
const SCIENTIFIC_TEXT =
  /\b(?:trial|study|studies|randomi[sz]ed|evidence|result|outcome|effect|reduc\w*|increas\w*|improv\w*|lower\w*|prevent\w*|caus\w*|associat\w*|biomarker|placebo|participants?|people|patients?|animal|mice|rats?|percent|%)\b/i

export interface RiskInput {
  statementKey: PageStatementKey
  changeCategory: PageStatementChangeCategory
  currentText: string
  proposedText: string
}

/**
 * The class the server acts on. Always the highest of: the category's floor, what the current
 * wording already carried, and what the proposed wording introduces.
 */
export function derivePageStatementRiskClass(input: RiskInput): PageStatementRiskClass {
  const both = `${input.currentText}\n${input.proposedText}`
  if (HIGH_RISK_CATEGORIES.has(input.changeCategory)) return 'high_risk'
  if (HIGH_RISK_TEXT.test(both)) return 'high_risk'
  if (SCIENTIFIC_CATEGORIES.has(input.changeCategory)) return 'scientific_meaning'
  // A sentence whose meaning-bearing words changed is a change of meaning, not of style.
  const currentScientific = input.currentText.match(SCIENTIFIC_TEXT) ?? []
  const proposedScientific = input.proposedText.match(SCIENTIFIC_TEXT) ?? []
  const sameTerms =
    currentScientific.length === proposedScientific.length &&
    currentScientific.every(
      (term, index) => term.toLowerCase() === proposedScientific[index]?.toLowerCase(),
    )
  if (!sameTerms) return 'scientific_meaning'
  return 'copy_only'
}

export function requiredQualifiedApprovals(riskClass: PageStatementRiskClass): number {
  return QUALIFIED_APPROVALS_REQUIRED[riskClass]
}

/* -------------------------------------------------- qualification relevance */

const ALL_TAGS: ReadonlyArray<VerdictReviewerExpertiseTag> = [
  'CLINICAL_PHARMACOLOGY',
  'THERAPEUTIC_AREA_MEDICINE',
  'BIOSTATISTICS',
  'TOXICOLOGY',
  'PHARMACOKINETICS',
  'REGULATORY_SCIENCE',
  'CLINICAL_DEVELOPMENT',
]

/**
 * Which recorded qualifications count as relevant to a given change.
 *
 * For a change to what the evidence says, any of the recorded specialities is relevant: the seven
 * tags are the ones RNAWiki grants, and each of them is a reason to trust a reading of a trial. For
 * a safety change the set narrows to the fields that judge harm, exposure and regulatory status.
 */
export function relevantQualifications(
  riskClass: PageStatementRiskClass,
  changeCategory: PageStatementChangeCategory,
): ReadonlyArray<VerdictReviewerExpertiseTag> {
  if (riskClass === 'copy_only') return []
  if (riskClass === 'scientific_meaning') return ALL_TAGS
  if (changeCategory === 'interaction_correction') {
    return ['CLINICAL_PHARMACOLOGY', 'PHARMACOKINETICS', 'TOXICOLOGY', 'THERAPEUTIC_AREA_MEDICINE']
  }
  return [
    'CLINICAL_PHARMACOLOGY',
    'THERAPEUTIC_AREA_MEDICINE',
    'TOXICOLOGY',
    'PHARMACOKINETICS',
    'REGULATORY_SCIENCE',
  ]
}

export function qualificationIsRelevant(
  held: ReadonlyArray<VerdictReviewerExpertiseTag>,
  riskClass: PageStatementRiskClass,
  changeCategory: PageStatementChangeCategory,
): boolean {
  const relevant = new Set(relevantQualifications(riskClass, changeCategory))
  if (relevant.size === 0) return false
  return held.some((tag) => relevant.has(tag))
}

/* ------------------------------------------------------------- eligibility */

export interface ReviewActor {
  id: string
  name: string
  orcid?: string | null
  trustTier?: string | null
  isAdmin?: boolean | null
  restrictedAt?: Date | string | null
}

/**
 * How one account is counted once. An ORCID identifies a person; a user id identifies only an
 * account. Two accounts that publish under the same ORCID are one reviewer, and the database's
 * partial unique index on this value is what refuses the second vote.
 */
export function reviewerIdentityKey(actor: Pick<ReviewActor, 'id' | 'orcid'>): string {
  return actor.orcid ? `orcid:${actor.orcid.toLowerCase()}` : `user:${actor.id}`
}

export function accountIsRestricted(actor: Pick<ReviewActor, 'restrictedAt'>): boolean {
  return actor.restrictedAt !== null && actor.restrictedAt !== undefined
}

/** The standing bar for recording a decision. Identical to the one contribution review uses. */
export function mayReviewPageStatements(actor: ReviewActor | null): boolean {
  if (!actor) return false
  if (accountIsRestricted(actor)) return false
  return actor.isAdmin === true || actor.trustTier === 'trusted' || actor.trustTier === 'steward'
}

/** Proposing needs an account in good standing, not reviewer standing. */
export function mayProposePageStatements(actor: ReviewActor | null): boolean {
  return actor !== null && !accountIsRestricted(actor)
}

/** Rolling back a published wording, or holding one, is a steward or administrator action. */
export function mayAdministerPageStatements(actor: ReviewActor | null): boolean {
  if (!actor || accountIsRestricted(actor)) return false
  return actor.isAdmin === true || actor.trustTier === 'steward'
}

export interface EligibilityInput {
  viewer: ReviewActor | null
  authorUserId: string
  reviewStatus: string
  proposalStatus: string
  /** Decisions already recorded and still counting. */
  recordedReviewers: ReadonlyArray<{ userId: string; identityKey: string }>
}

/**
 * Why a viewer may or may not decide. The order matters: the first problem that applies is the one
 * shown, so nobody is told about a second obstacle while the first still stands.
 */
export function pageStatementReviewEligibility(input: EligibilityInput): {
  canReview: boolean
  reason: PageStatementReviewEligibilityReason
} {
  const deny = (reason: PageStatementReviewEligibilityReason) => ({ canReview: false, reason })

  if (!input.viewer) return deny('signed_out')
  if (input.proposalStatus !== 'submitted' && input.proposalStatus !== 'open')
    return deny('not_open')
  if (
    input.reviewStatus === 'approved' ||
    input.reviewStatus === 'changes_requested' ||
    input.reviewStatus === 'rejected'
  ) {
    return deny('review_complete')
  }
  if (input.viewer.id === input.authorUserId) return deny('author_cannot_review')
  if (accountIsRestricted(input.viewer)) return deny('account_restricted')
  if (!mayReviewPageStatements(input.viewer)) return deny('insufficient_trust')
  if (input.recordedReviewers.some((review) => review.userId === input.viewer?.id)) {
    return deny('already_reviewed')
  }
  const identityKey = reviewerIdentityKey(input.viewer)
  if (input.recordedReviewers.some((review) => review.identityKey === identityKey)) {
    return deny('duplicate_identity')
  }
  return { canReview: true, reason: 'eligible' }
}
