import type { entityTypeEnum, regulatoryCategoryEnum, claimTypeEnum } from '@/db/schema'
import type { ProofBoundaryStage, EvidenceStatus, EvidenceRelationship } from './evidence'

/**
 * The shape every scripts/seed-data/*.ts file must default-export. scripts/seed.ts imports
 * these and inserts them via Drizzle. Every source cited here must be a real, checkable
 * DOI/PMID/NCT/regulatory URL verified at research time — do not invent citations.
 */
export interface SeedEntity {
  canonicalName: string
  slug: string
  aliases: string[]
  entityType: (typeof entityTypeEnum.enumValues)[number]
  shortDescription: string
  bottomLine: string
  regulatoryCategory: (typeof regulatoryCategoryEnum.enumValues)[number]
  accessRealityNote?: string
  regulatoryStatuses: SeedRegulatoryStatus[]
  claims: SeedClaim[]
}

export interface SeedRegulatoryStatus {
  jurisdiction: string
  legalCategory: (typeof regulatoryCategoryEnum.enumValues)[number]
  approvedIndications?: string
  statusStatement: string
  source: string // primary regulatory source URL
  checkedDate: string // ISO date, the date this was actually verified
}

export interface SeedEvidenceSource {
  key: string // local reference key used by SeedClaimEvidence.sourceKey within this file
  title: string
  authors?: string
  publicationYear?: number
  journalOrIssuer?: string
  doi?: string
  pmid?: string
  clinicalTrialId?: string
  regulatoryUrl?: string
  sourceType: string // e.g. "randomized controlled trial", "animal study (rat)", "case series", "FDA approval letter"
  studyDesign?: string
  experimentalModel?: string
  species?: string
  sampleSize?: number
  endpoint?: string
  retractionStatus?: string
}

export interface SeedClaimEvidence {
  sourceKey: string // matches SeedEvidenceSource.key
  relationship: EvidenceRelationship
  claimPartAddressed: string
  directlyMeasuredResult: string
  independentGroupStatus?: boolean
}

export interface SeedMechanismStep {
  displayOrder: number
  technicalLabel: string
  plainLanguageExplanation: string
  evidenceContext: string
  status: EvidenceStatus
  sourceLinks?: string[]
}

export interface SeedClaim {
  slug: string
  claimType: (typeof claimTypeEnum.enumValues)[number]
  consumerQuestion: string
  directAnswer: string // 1-2 sentences, the caveat MUST be in the same sentence as the claim
  measuredFinding: string
  inference: string
  proofBoundaryStage: ProofBoundaryStage
  proofBoundaryExplanation: string
  remainingUnknown: string
  evidenceNeededNext: string
  mechanismSummary?: string
  outcomeSummary?: string
  displayPriority?: number
  mechanismSteps?: SeedMechanismStep[]
  evidence: SeedClaimEvidence[]
  comprehensionQuestions?: SeedComprehensionQuestion[]
}

export interface SeedComprehensionQuestion {
  question: string
  options: string[]
  correctOptionIndex: number
  explanation: string
}

export interface SeedFile {
  entity: SeedEntity
  evidenceSources: SeedEvidenceSource[]
}
