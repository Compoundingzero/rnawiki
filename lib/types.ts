import type { ProofBoundaryStage, EvidenceStatus, EvidenceRelationship } from './evidence'

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

export interface ReviewView {
  reviewerName: string | null
  reviewerCredentials: string | null
  decision: 'approved' | 'rejected' | 'needs_changes'
  reviewDate: Date
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
