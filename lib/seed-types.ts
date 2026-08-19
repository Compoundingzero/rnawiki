import type {
  entityTypeEnum,
  regulatoryCategoryEnum,
  claimTypeEnum,
  claimEventTypeEnum,
  developmentGateEnum,
} from '@/db/schema'
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

/**
 * A recorded event in a claim's development history: a null result, a safety limit, a design
 * limit, a stopped programme. Three rules govern every one of these, and all three exist because
 * the alternative is an editorialised "what went wrong" section that nobody can check:
 *
 * 1. `sourceKey` is REQUIRED. It must name a source already listed in the same seed file's
 *    `evidenceSources`, and every sentence below must be written from what that source itself
 *    recorded. The DB column is NOT NULL for the same reason. An event with no source is not a
 *    weaker event, it is opinion.
 * 2. A null endpoint is never generalised into "the treatment does not work".
 *    `whatItDoesNotEstablish` exists to hold that line in the data, not just in the component.
 *    Absence of evidence and evidence of no effect are different — docs/evidence-classification.md.
 * 3. `eventDate` is omitted unless the source itself records a date. A publication year is not a
 *    date; do not manufacture one to make a timeline look fuller.
 */
export interface SeedClaimEvent {
  sourceKey: string // matches SeedEvidenceSource.key
  eventType: (typeof claimEventTypeEnum.enumValues)[number]
  developmentGate: (typeof developmentGateEnum.enumValues)[number]
  plainSummary: string
  whatItSuggests: string
  whatItDoesNotEstablish: string
  eventDate?: string // ISO date, only when the cited source records one
  displayPriority?: number
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
  // Optional and frequently absent. A claim with no recorded events is the normal case, not a gap
  // to fill — see SeedClaimEvent.
  claimEvents?: SeedClaimEvent[]
  comprehensionQuestions?: SeedComprehensionQuestion[]
}

export interface SeedComprehensionQuestion {
  question: string
  options: string[]
  correctOptionIndex: number
  explanation: string
  /**
   * Position within the claim's set. 0 is the CENTRAL Proof Boundary question, and it is the only
   * one the published clarity aggregate is computed from (lib/comprehension.ts,
   * `getAggregateForClaim`).
   *
   * Optional here and defaulted to the array index by scripts/seed.ts, because the index is what
   * the file's own ordering already means. It used to be neither set nor defaulted, so every
   * seeded question took the column default of 0 — including both of BPC-157's, which left two
   * rows tied at 0 and the "central" question chosen by whatever order Postgres returned. Set it
   * explicitly when a file's array order is not the intended display order.
   */
  displayOrder?: number
}

export interface SeedFile {
  /**
   * The date the sources in this file were actually read and the answers written against them —
   * the same thing `SeedRegulatoryStatus.checkedDate` records, one level up.
   *
   * REQUIRED, and it is the only value allowed to fill `claims.checkedAt`. The record prints
   * "This answer last checked <date>", and that used to be `claims.updatedAt`: a database write
   * timestamp that moved every time `db:seed` ran and, in this corpus, printed a day later than
   * the as-of date written inside the answer itself. Set it to the date the research notes at the
   * top of the file carry. Do not set it to "today" to make a record look fresh; nothing here is
   * re-verified by running the seed script again.
   */
  researchDate: string // ISO date (YYYY-MM-DD), UTC
  entity: SeedEntity
  evidenceSources: SeedEvidenceSource[]
}
