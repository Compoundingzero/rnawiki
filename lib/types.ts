import type { ProofBoundaryStage, EvidenceStatus, EvidenceRelationship, EvidenceChangeType } from './evidence'
import type { ClaimEventType, DevelopmentGate } from './claim-events'

export interface MechanismStepView {
  id: number
  displayOrder: number
  technicalLabel: string
  plainLanguageExplanation: string
  evidenceContext: string
  status: EvidenceStatus
  sourceLinks: string[]
}

export interface EvidenceSourceView {
  id: number
  title: string
  authors: string | null
  publicationYear: number | null
  journalOrIssuer: string | null
  doi: string | null
  pmid: string | null
  clinicalTrialId: string | null
  regulatoryUrl: string | null
  sourceType: string
  studyDesign: string | null
  species: string | null
  sampleSize: number | null
  endpoint: string | null
  retractionStatus: string | null
}

export interface ClaimEvidenceView {
  relationship: EvidenceRelationship
  claimPartAddressed: string
  directlyMeasuredResult: string
  independentGroupStatus: boolean
  source: EvidenceSourceView
}

/**
 * One recorded event that did not support a claim. Only ever built from a `published` row in
 * `claim_events`, and always carries the source it came from — `source` is non-nullable here
 * because the column is NOT NULL by design (db/schema.ts): an event with no citation is opinion.
 */
export interface ClaimEventView {
  id: number
  eventType: ClaimEventType
  developmentGate: DevelopmentGate
  plainSummary: string
  whatItSuggests: string
  whatItDoesNotEstablish: string
  eventDate: Date | null
  source: EvidenceSourceView
}

/** One entry in the public "how this answer changed" history for a claim. */
export interface EvidenceChangeView {
  id: number
  changeType: EvidenceChangeType
  previousBoundary: ProofBoundaryStage | null
  newBoundary: ProofBoundaryStage | null
  explanation: string
  /** A URL or citation string as stored — `evidence_changes.source` is free text, not a join. */
  source: string
  publicationDate: Date
}

export interface ReviewView {
  reviewerName: string | null
  reviewerCredentials: string | null
  decision: 'approved' | 'rejected' | 'needs_changes'
  reviewDate: Date
  /**
   * `reviews.reviewedVersion` — the `claims.version` the reviewer read.
   *
   * BLOCKING: an approval is an approval of the text that existed when it was given. The column
   * was written on every review and read by nothing, so an editor bumping the version and
   * rewriting the answer left the page still asserting that a reviewer approved it. Any component
   * or route printing an approval must compare this against the claim's current version.
   */
  reviewedVersion: number
}

export interface ProofCardView {
  id: number
  slug: string
  entitySlug: string
  /** Needed publicly: an evidence position is meaningless for a regulatory, access or
      mechanism claim, and printing one there endorsed a logistics answer as regulator-reviewed. */
  claimType: 'mechanism' | 'effectiveness' | 'safety' | 'regulatory' | 'access' | 'claimed_use'
  consumerQuestion: string
  directAnswer: string
  measuredFinding: string
  inference: string
  proofBoundaryStage: ProofBoundaryStage
  proofBoundaryExplanation: string
  remainingUnknown: string
  evidenceNeededNext: string
  evidence: ClaimEvidenceView[]
  lastReviewedAt: Date | null
  reviewStatus: 'published' | 'draft' | 'editorially_complete' | 'scientific_review_required' | 'approved' | 'needs_update' | 're_review'
  review: ReviewView | null
  /** `claims.version`. Editorial content version — it is not a review or approval count. */
  version: number
  /** `claims.updatedAt`. When the record was last edited, never when the science was last checked
      by a reviewer. `review` is the only thing that may produce a "reviewed" sentence. */
  lastCheckedAt: Date
  /**
   * `claims.checkedAt`. When an EDITOR last read the cited sources and checked this answer against
   * them — a recorded human act, null when nobody has recorded one.
   *
   * It exists because `lastCheckedAt` above is a database write timestamp and the record printed it
   * under the words "This answer last checked". Re-running `db:seed` advanced that date without
   * anyone checking anything, and in the seeded corpus it printed a day later than the as-of date
   * written inside the answer's own text. Null is a real and expected value: render the honest
   * "last edited" sentence from `lastCheckedAt` rather than presenting a write as a check.
   * Still not a scientific review — only `review` may produce a "reviewed" sentence.
   */
  checkedAt: Date | null
  /** Published claim events only. Drafts must never reach a public view or the API. */
  events: ClaimEventView[]
  /** Public evidence changes for this claim, newest first. */
  changes: EvidenceChangeView[]
}

export interface EntityHeaderView {
  canonicalName: string
  aliases: string[]
  entityType: string
  regulatoryCategory: string
  jurisdiction: string
  statusCheckedDate: Date | null
  lastScientificReviewDate: Date | null
  reviewStatus: string
}
