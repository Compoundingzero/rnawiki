/**
 * RNA Intelligence 2.0 evidence contract.
 *
 * This module deliberately has no database, UI, network, or clock dependency. Callers normalize
 * persisted records into this shape, provide an explicit `asOfDate`, and receive the same report
 * for the same input. The engine validates structure and consistency; it never authors a medical
 * claim or selects a scientific verdict.
 */

import type {
  ClaimDirection,
  ClaimNature,
  EvidenceNodeClaimRelationship,
  EvidenceNodeType,
  EvidenceReviewStatus,
  EvidenceSourceType,
  EvidenceState,
  ProgrammeStatus,
  MechanismEvidenceBasis,
  ProgrammeTimelineDateBasis,
  ProgrammeTimelineEventType,
  ReviewImpactLevel,
  SourceCorrectionStatus,
  SourceHierarchy,
  StoppedProgrammeVerdict,
  StoppingReasonCategory,
  StudyInterpretabilityCriterion,
  StudyInterpretabilityState,
} from '../evidence/types'
import type { EvidenceRuleCode } from './evidence-rule-catalog'

export { EVIDENCE_RULE_CODES, EVIDENCE_RULE_CODES_BY_GROUP } from './evidence-rule-catalog'
export type { EvidenceRuleCode } from './evidence-rule-catalog'

export type {
  ClaimDirection,
  ClaimNature,
  EvidenceNodeClaimRelationship,
  EvidenceNodeType,
  EvidenceReviewStatus,
  EvidenceSourceType,
  EvidenceState,
  ProgrammeStatus,
  MechanismEvidenceBasis,
  ProgrammeTimelineDateBasis,
  ProgrammeTimelineEventType,
  ReviewImpactLevel,
  SourceCorrectionStatus,
  SourceHierarchy,
  StoppedProgrammeVerdict,
  StoppingReasonCategory,
  StudyInterpretabilityCriterion,
  StudyInterpretabilityState,
} from '../evidence/types'

export const EVIDENCE_ENGINE_VERSION = 'rna-intelligence/evidence-2.0.1' as const
export const EVIDENCE_PRESENTATION_ENGINE_VERSION = 'rna-intelligence/evidence-2.1.0' as const
export type EvidenceEngineVersion =
  typeof EVIDENCE_ENGINE_VERSION | typeof EVIDENCE_PRESENTATION_ENGINE_VERSION

/** Backwards-readable engine alias for the canonical evidence review vocabulary. */
export type ReviewStatus = EvidenceReviewStatus

export type EvidenceFindingLevel = 'BLOCK' | 'WARNING' | 'REVIEW_IMPACT'
export type EvidenceRuleGroup = 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'

export type EvidenceEntityType =
  | 'MEDICINE'
  | 'PROGRAMME'
  | 'TRIAL'
  | 'CLAIM'
  | 'EVIDENCE_NODE'
  | 'MECHANISM_STEP'
  | 'SOURCE'
  | 'SOURCE_SNAPSHOT'
  | 'VERDICT'
  | 'SUMMARY'
  | 'TIMELINE'
  | 'TIMELINE_EVENT'
  | 'METADATA'
  | 'SEARCH_DOCUMENT'
  | 'HOMEPAGE_CARD'
  | 'API_DOCUMENT'
  | 'COUNT'
  | 'DEPENDENCY'
  | 'ENGINE_INPUT'

export interface EvidenceEntityRef {
  type: EvidenceEntityType
  id: string
  field?: string
}

/**
 * Every finding is actionable without parsing its prose. Codes are stable API vocabulary; the
 * message and corrective action are ordinary language for contributors and reviewers.
 */
export interface EvidenceFinding {
  level: EvidenceFindingLevel
  group: EvidenceRuleGroup
  code: EvidenceRuleCode
  message: string
  affectedEntity: EvidenceEntityRef
  affectedField: string
  correctiveAction: string
  sourceId?: string
  claimId?: string
}

export interface EvidenceMedicine {
  id: string
}

export type DevelopmentPhase =
  'DISCOVERY' | 'PRECLINICAL' | 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'REGULATORY' | 'APPROVED'

export interface ProgrammePhaseEvent {
  id: string
  phase: DevelopmentPhase
  date: string
  /** Required when a later milestone legitimately appears to move backwards in phase. */
  orderingExceptionReason?: string
}

/** Engine field name mapped to the canonical study-interpretability state. */
export type InterpretabilityState = StudyInterpretabilityState

export interface StudyInterpretability {
  statisticalPower: InterpretabilityState
  populationSelection: InterpretabilityState
  exposureAdequacy: InterpretabilityState
  endpointValidity: InterpretabilityState
  durationAndOperationalIntegrity: InterpretabilityState
  /** Each displayed answer carries its own evidence links; one shared list cannot prove this. */
  supportingClaimIdsByCriterion: Record<StudyInterpretabilityCriterion, string[]>
}

export interface EvidenceProgramme {
  id: string
  medicineId: string
  indication: string
  population: string
  doseOrExposure?: string
  jurisdiction?: string
  approvalIsJurisdictionSpecific?: boolean
  /** Set by a structured editor when one programme scope combines materially different cohorts. */
  combinesDistinctPopulations?: boolean
  status: ProgrammeStatus
  startDate?: string
  endDate?: string
  currentVerdictId?: string
  stoppingReasonCategory?: StoppingReasonCategory
  stoppingReasonClaimIds?: string[]
  phaseEvents?: ProgrammePhaseEvent[]
  studyInterpretability?: StudyInterpretability
}

export type TrialSubjectType = 'HUMAN' | 'ANIMAL' | 'IN_VITRO' | 'OTHER' | 'UNKNOWN'
export type TrialResultsStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'NOT_POSTED' | 'UNKNOWN'

export interface EvidenceTrial {
  id: string
  registrationId: string
  medicineId: string
  programmeId: string
  indication: string
  subjectType: TrialSubjectType
  startDate?: string
  endDate?: string
  resultsStatus: TrialResultsStatus
}

export type EndpointHierarchy = 'PRIMARY' | 'SECONDARY' | 'EXPLORATORY' | 'NOT_APPLICABLE'
export type OutcomeType = 'PATIENT_OUTCOME' | 'SURROGATE' | 'SAFETY' | 'OPERATIONAL' | 'OTHER'

export interface ComparatorResult {
  value: number | string
  group?: string
}

export interface EvidenceClaim {
  id: string
  medicineId: string
  /** Required when `isProgrammeLevel` is true. */
  programmeId?: string
  isProgrammeLevel: boolean
  trialId?: string
  evidenceNodeType?: EvidenceNodeType
  nature: ClaimNature
  direction: ClaimDirection
  plainLanguageText: string
  technicalText?: string
  sourceIds: string[]
  numericValue?: number | string
  numericUnitRequired?: boolean
  unit?: string
  resultDate?: string
  participantOutcome?: boolean
  comparatorResult?: ComparatorResult
  endpointHierarchy?: EndpointHierarchy
  outcomeType?: OutcomeType
  presentedAsPatientBenefit?: boolean
  exploratoryNatureDisclosed?: boolean
  stoppingReason?: boolean
  conflictsWithClaimIds?: string[]
  lastVerifiedDate?: string
}

export type SourceResolutionStatus = 'RESOLVABLE' | 'TEMPORARILY_UNAVAILABLE' | 'UNRESOLVABLE'

export interface EvidenceSource {
  id: string
  sourceType: EvidenceSourceType
  externalIdentifier: string
  canonicalLocator: string
  title: string
  publisher: string
  hierarchy: SourceHierarchy
  resolutionStatus: SourceResolutionStatus
  publicationDate?: string
  correctionStatus?: SourceCorrectionStatus
  programmeId?: string
  trialId?: string
  jurisdiction?: string
}

export interface EvidenceSourceSnapshot {
  id: string
  sourceId: string
  retrievedAt: string
  contentHash: string
  previousSnapshotId?: string
}

export interface EvidenceNode {
  id: string
  programmeId: string
  type: EvidenceNodeType
  state: EvidenceState
  visible: boolean
  supportingClaimIds: string[]
  contradictingClaimIds: string[]
  /** Presentation assertions supplied by the view model, checked here before publication. */
  presentedAsPositive?: boolean
  presentedAsNegative?: boolean
}

export interface VerdictScope {
  indication: string
  population: string
  doseOrExposure?: string
  period?: string
  trialIds: string[]
  outcome: string
}

export interface AdjudicatedException {
  rationale: string
  adjudicatorId: string
}

export interface ProgrammeVerdict {
  id: string
  medicineId: string
  programmeId?: string
  code: StoppedProgrammeVerdict
  scope: VerdictScope
  supportingClaimIds: string[]
  contradictoryClaimIds: string[]
  /** Claims describing a candidate-specific PK, delivery, selectivity, safety, or dose limitation. */
  candidateLimitationClaimIds: string[]
  reviewStatus: ReviewStatus
  sourceDependent?: boolean
  adjudicatedException?: AdjudicatedException
}

export interface SummaryPart {
  text: string
  supportingClaimIds: string[]
}

export interface TenSecondSummary {
  id: string
  programmeId: string
  plainMechanism: SummaryPart
  bestSupportedFinding: SummaryPart
  mainLimitation: SummaryPart
  /** Other visible words before the evidence-expansion control, such as scope metadata. */
  additionalFirstScreenText?: string
}

export type PlainLanguageSectionKind =
  'TEN_SECOND' | 'CLAIM' | 'VERDICT_REASON' | 'EVIDENCE_EXPLANATION' | 'OTHER'

export interface NumericStatementContext {
  value: string
  comparator?: string
  timepoint?: string
}

export interface PlainLanguageSection {
  id: string
  entity: EvidenceEntityRef
  kind: PlainLanguageSectionKind
  text: string
  /** Complex terms that this section explicitly defines before using. */
  definedTerms?: string[]
  /** Structured contexts avoid guessing which prose number belongs to which result. */
  numericStatements?: NumericStatementContext[]
}

/** Engine field name mapped to the canonical dependency review-impact vocabulary. */
export type DependencyImpact = ReviewImpactLevel

export interface EvidenceDependency {
  from: EvidenceEntityRef
  to: EvidenceEntityRef
  impact: DependencyImpact
}

export interface EvidenceChange {
  entity: EvidenceEntityRef
  changedFields: string[]
  /** Source/fact changes must identify the immutable snapshot that caused the change. */
  snapshotId?: string
}

export interface EvidencePresentationClaimLink {
  claimId: string
  relationship: EvidenceNodeClaimRelationship
  /** Exact immutable versions whose claim-source relationship is SUPPORTS. */
  supportingSourceSnapshotIds: string[]
}

export interface EvidenceMechanismStep {
  id: string
  programmeId: string
  order: number
  plainTitle: string
  plainDescription: string
  technicalDescription?: string
  evidenceBasis: MechanismEvidenceBasis
  claimLinks: EvidencePresentationClaimLink[]
}

export interface EvidenceTimelineEvent {
  id: string
  programmeId: string
  date: string
  eventType: ProgrammeTimelineEventType
  dateBasis: ProgrammeTimelineDateBasis
  plainTitle: string
  plainDescription: string
  technicalDescription?: string
  trialId?: string
  sourceId: string
  sourceSnapshotId: string
  claimLinks: EvidencePresentationClaimLink[]
}

export interface EvidenceProgrammePresentation {
  schemaVersion: 'programme-presentation/v1'
  verdictRevisionId: string
  programmeId: string
  mechanismSteps: EvidenceMechanismStep[]
  timelineEvents: EvidenceTimelineEvent[]
}

export interface FreshnessPolicy {
  defaultMaxAgeDays: number
  maxAgeDaysBySourceType?: Record<string, number>
}

export interface ReadabilityPolicy {
  maxSentenceWords: number
  maxParagraphWords: number
  maxFirstScreenWords: number
  allowedAcronyms: string[]
  complexTerms: string[]
  absolutePhrases: string[]
}

export interface EvidenceIntelligencePolicy {
  freshness: FreshnessPolicy
  readability: ReadabilityPolicy
  vaguePopulationLabels: string[]
}

export interface EvidenceIntelligenceInput {
  /** Explicit date makes freshness checks deterministic. The engine never reads the system clock. */
  asOfDate: string
  medicine: EvidenceMedicine
  programmes: EvidenceProgramme[]
  trials: EvidenceTrial[]
  sources: EvidenceSource[]
  sourceSnapshots: EvidenceSourceSnapshot[]
  claims: EvidenceClaim[]
  evidenceNodes: EvidenceNode[]
  verdicts: ProgrammeVerdict[]
  /** Omitted for legacy proposal/v1 inputs so their serialized bytes and digest remain unchanged. */
  presentation?: EvidenceProgrammePresentation
  tenSecondSummaries?: TenSecondSummary[]
  plainLanguageSections?: PlainLanguageSection[]
  dependencies?: EvidenceDependency[]
  changes?: EvidenceChange[]
  policy?: PartialEvidenceIntelligencePolicy
}

export interface PartialEvidenceIntelligencePolicy {
  freshness?: Partial<FreshnessPolicy>
  readability?: Partial<ReadabilityPolicy>
  vaguePopulationLabels?: string[]
}

export type FreshnessState =
  'CHECKED' | 'EVIDENCE_MAY_BE_OUT_OF_DATE' | 'SOURCE_UNAVAILABLE' | 'AUDIT_NOT_COMPLETED'

export interface SourceFreshnessResult {
  sourceId: string
  state: FreshnessState
  lastCheckedDate?: string
  ageDays?: number
  maxAgeDays: number
}

export interface DependencyImpactResult {
  entity: EvidenceEntityRef
  impact: DependencyImpact
  via: EvidenceEntityRef
}

export interface EvidenceImpactPlan {
  affected: DependencyImpactResult[]
  affectedClaimIds: string[]
  affectedEvidenceNodeIds: string[]
  affectedProgrammeIds: string[]
  affectedSurfaces: EvidenceEntityRef[]
  highestImpact: DependencyImpact | null
  requiresHumanReview: boolean
  preserveCurrentPublishedRevisionUntilReview: boolean
}

export interface EvidenceIntelligenceReport {
  engineVersion: EvidenceEngineVersion
  /** SHA-256 digest of engine version + canonical input. No runtime timestamp is included. */
  inputDigestAlgorithm: 'sha256'
  inputDigest: string
  canPublish: boolean
  findings: EvidenceFinding[]
  blocks: EvidenceFinding[]
  warnings: EvidenceFinding[]
  reviewImpacts: EvidenceFinding[]
  freshness: SourceFreshnessResult[]
  impactPlan: EvidenceImpactPlan
  /** Scientific meaning always remains a reviewer decision. */
  humanJudgment: {
    required: true
    verdictSelectedByEngine: false
    statement: string
  }
}
