/**
 * Shared vocabulary for the programme-scoped evidence model.
 *
 * These tuples are the single source of truth for both TypeScript and PostgreSQL enums. Keeping
 * them outside db/schema.ts also lets deterministic validation and background source adapters use
 * the exact database vocabulary without importing the database layer.
 */

export const PROGRAMME_STATUSES = [
  'PLANNED',
  'RECRUITING',
  'ACTIVE',
  'COMPLETED',
  'APPROVED',
  'PAUSED',
  'STOPPED',
  'WITHDRAWN',
  'UNKNOWN',
] as const
export type ProgrammeStatus = (typeof PROGRAMME_STATUSES)[number]

export const STOPPING_REASON_CATEGORIES = [
  'EFFICACY',
  'SAFETY',
  'CANDIDATE_PHARMACOKINETICS',
  'TISSUE_DELIVERY',
  'SELECTIVITY_OR_OFF_TARGET',
  'RECRUITMENT',
  'FUNDING',
  'BUSINESS_STRATEGY',
  'ACQUISITION_OR_PORTFOLIO_REPRIORITISATION',
  'DOSE_SELECTION',
  'POPULATION_SELECTION',
  'ENDPOINT_SELECTION',
  'OPERATIONAL_EXECUTION',
  'RESULTS_UNAVAILABLE',
  'UNKNOWN',
] as const
export type StoppingReasonCategory = (typeof STOPPING_REASON_CATEGORIES)[number]

export const STOPPED_PROGRAMME_VERDICTS = [
  'IDEA_FAILED',
  'MOLECULE_FAILED',
  'TEST_UNANSWERED',
] as const
export type StoppedProgrammeVerdict = (typeof STOPPED_PROGRAMME_VERDICTS)[number]

export const EVIDENCE_NODE_TYPES = [
  'HUMAN_EXPOSURE',
  'USEFUL_EXPOSURE',
  'TARGET_ENGAGEMENT',
  'BIOLOGICAL_RESPONSE',
  'PATIENT_OUTCOME',
] as const
export type EvidenceNodeType = (typeof EVIDENCE_NODE_TYPES)[number]

export const EVIDENCE_STATES = [
  'CONFIRMED',
  'CONTRADICTED',
  'UNKNOWN',
  'NOT_MEASURED',
  'MIXED',
] as const
export type EvidenceState = (typeof EVIDENCE_STATES)[number]

export const CLAIM_NATURES = [
  'MEASURED',
  'SPONSOR_REPORTED',
  'REGULATORY_FINDING',
  'RNAWIKI_JUDGEMENT',
  'UNKNOWN',
] as const
export type ClaimNature = (typeof CLAIM_NATURES)[number]

export const CLAIM_DIRECTIONS = [
  'INCREASE',
  'DECREASE',
  'NO_CHANGE',
  'MIXED',
  'NOT_APPLICABLE',
  'UNKNOWN',
] as const
export type ClaimDirection = (typeof CLAIM_DIRECTIONS)[number]

export const EVIDENCE_REVIEW_STATUSES = [
  'DRAFT',
  'MACHINE_CHECKED',
  'AWAITING_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED',
  'PUBLISHED',
  'SUPERSEDED',
] as const
export type EvidenceReviewStatus = (typeof EVIDENCE_REVIEW_STATUSES)[number]

export const VERDICT_CONFIDENCE_LEVELS = ['HIGH', 'MODERATE', 'LOW', 'VERY_LOW', 'UNKNOWN'] as const
export type VerdictConfidence = (typeof VERDICT_CONFIDENCE_LEVELS)[number]

export const EVIDENCE_SOURCE_TYPES = [
  'CLINICAL_TRIAL_REGISTRY',
  'REGULATORY_RECORD',
  'REGULATORY_SAFETY_COMMUNICATION',
  'PEER_REVIEWED_PUBLICATION',
  'PUBLICATION_METADATA',
  'SPONSOR_DISCLOSURE',
  'MOLECULAR_DATABASE',
  'OTHER',
  'UNKNOWN',
] as const
export type EvidenceSourceType = (typeof EVIDENCE_SOURCE_TYPES)[number]

export const SOURCE_HIERARCHIES = ['PRIMARY', 'SECONDARY', 'TERTIARY', 'UNKNOWN'] as const
export type SourceHierarchy = (typeof SOURCE_HIERARCHIES)[number]

export const SOURCE_CORRECTION_STATUSES = [
  'CURRENT',
  'CORRECTED',
  'RETRACTED',
  'WITHDRAWN',
  'EXPRESSION_OF_CONCERN',
  'UNKNOWN',
] as const
export type SourceCorrectionStatus = (typeof SOURCE_CORRECTION_STATUSES)[number]

export const CLAIM_SOURCE_RELATIONSHIPS = ['SUPPORTS', 'CONTRADICTS', 'CONTEXT'] as const
export type ClaimSourceRelationship = (typeof CLAIM_SOURCE_RELATIONSHIPS)[number]

export const EVIDENCE_NODE_CLAIM_RELATIONSHIPS = ['SUPPORTS', 'CONTRADICTS', 'QUALIFIES'] as const
export type EvidenceNodeClaimRelationship = (typeof EVIDENCE_NODE_CLAIM_RELATIONSHIPS)[number]

export const VERDICT_CLAIM_RELATIONSHIPS = [
  'SUPPORTING',
  'CONTRADICTORY',
  'CANDIDATE_LIMITATION',
] as const
export type VerdictClaimRelationship = (typeof VERDICT_CLAIM_RELATIONSHIPS)[number]

export const VERDICT_REVIEW_DECISIONS = ['APPROVE', 'CHANGES_REQUESTED', 'REJECT'] as const
export type VerdictReviewDecision = (typeof VERDICT_REVIEW_DECISIONS)[number]

export const VERDICT_REVIEWER_EXPERTISE_TAGS = [
  'CLINICAL_PHARMACOLOGY',
  'THERAPEUTIC_AREA_MEDICINE',
  'BIOSTATISTICS',
  'TOXICOLOGY',
  'PHARMACOKINETICS',
  'REGULATORY_SCIENCE',
  'CLINICAL_DEVELOPMENT',
] as const
export type VerdictReviewerExpertiseTag = (typeof VERDICT_REVIEWER_EXPERTISE_TAGS)[number]

export const PROGRAMME_UPDATE_STATUSES = [
  'NOT_ASSESSED',
  'CURRENT',
  'NEW_EVIDENCE',
  'REVIEW_REQUIRED',
  'REVIEW_IN_PROGRESS',
  'OUTDATED',
  'SOURCE_UNAVAILABLE',
  'CHECK_FAILED',
] as const
export type ProgrammeUpdateStatus = (typeof PROGRAMME_UPDATE_STATUSES)[number]

/** A failed source check is known failure; UNKNOWN means no reliable result exists. */
export const SOURCE_CHECK_STATUSES = [
  'NOT_CHECKED',
  'SUCCEEDED',
  'FAILED',
  'SOURCE_UNAVAILABLE',
  'UNKNOWN',
] as const
export type SourceCheckStatus = (typeof SOURCE_CHECK_STATUSES)[number]

export const SOURCE_FRESHNESS_STATUSES = [
  'NOT_ASSESSED',
  'CURRENT',
  'DUE',
  'STALE',
  'NEW_EVIDENCE',
  'REVIEW_IN_PROGRESS',
  'SOURCE_UNAVAILABLE',
  'CHECK_FAILED',
  'UNKNOWN',
] as const
export type SourceFreshnessStatus = (typeof SOURCE_FRESHNESS_STATUSES)[number]

export const DEPENDENT_SURFACE_TYPES = [
  'PROGRAMME_SUMMARY',
  'PROGRAMME_STATUS',
  'EVIDENCE_NODE',
  'MECHANISM_MAP',
  'TIMELINE',
  'VERDICT',
  'SAFETY_LANGUAGE',
  'SEARCH_DOCUMENT',
  'BROWSE_CARD',
  'HOMEPAGE_CARD',
  'METADATA',
  'STRUCTURED_DATA',
  'API_OUTPUT',
] as const
export type DependentSurfaceType = (typeof DEPENDENT_SURFACE_TYPES)[number]

/** How directly a reviewed mechanism stage was observed. This is displayed, never inferred. */
export const MECHANISM_EVIDENCE_BASES = [
  'MEASURED_IN_PEOPLE',
  'MEASURED_OUTSIDE_PEOPLE',
  'PREDICTED',
  'UNKNOWN',
] as const
export type MechanismEvidenceBasis = (typeof MECHANISM_EVIDENCE_BASES)[number]

/** Only source-authored, decision-changing events may be persisted. RNAWiki events are derived. */
export const PROGRAMME_TIMELINE_EVENT_TYPES = [
  'PROGRAMME_MILESTONE',
  'FIRST_HUMAN_ADMINISTRATION',
  'PHASE_PROGRESSION',
  'IMPORTANT_RESULT',
  'SAFETY_SIGNAL',
  'REGULATORY_ACTION',
  'PAUSE_OR_TERMINATION',
  'LICENSING_OR_ACQUISITION',
] as const
export type ProgrammeTimelineEventType = (typeof PROGRAMME_TIMELINE_EVENT_TYPES)[number]

export const PROGRAMME_TIMELINE_DATE_BASES = ['ACTUAL', 'PLANNED', 'REPORTED_UNCLEAR'] as const
export type ProgrammeTimelineDateBasis = (typeof PROGRAMME_TIMELINE_DATE_BASES)[number]

export interface ProgrammePresentationClaimLinkReadModel {
  claimId: string
  relationship: EvidenceNodeClaimRelationship
}

/** What one exact saved source supports in relation to the displayed stage or event. */
export interface ProgrammePresentationSourceClaimBindingReadModel {
  claimId: string
  relationship: EvidenceNodeClaimRelationship
  plainLanguageText: string
}

/** Exact immutable source-version provenance shown in review, public reads and history. */
export interface ProgrammePresentationSourceReadModel {
  sourceId: string
  sourceSnapshotId: string
  sourceType: EvidenceSourceType
  externalIdentifier: string | null
  canonicalLocator: string
  title: string | null
  publisher: string | null
  publicationDate: string | null
  retrievedAt: string
  contentHash: string
  claimBindings: ProgrammePresentationSourceClaimBindingReadModel[]
}

export interface ProgrammePresentationMechanismStepReadModel {
  stepKey: string
  stepOrder: number
  plainTitle: string
  plainDescription: string
  technicalDescription: string | null
  evidenceBasis: MechanismEvidenceBasis
  claimLinks: ProgrammePresentationClaimLinkReadModel[]
  sources: ProgrammePresentationSourceReadModel[]
}

export interface ProgrammePresentationTimelineEventReadModel {
  eventKey: string
  eventDate: string
  eventType: ProgrammeTimelineEventType
  dateBasis: ProgrammeTimelineDateBasis
  plainTitle: string
  plainDescription: string
  technicalDescription: string | null
  programmeTrialId: string | null
  sourceId: string
  sourceSnapshotId: string
  claimLinks: ProgrammePresentationClaimLinkReadModel[]
  source: ProgrammePresentationSourceReadModel
}

export interface ProgrammePresentationReadModel {
  schemaVersion: 'programme-presentation/v1'
  mechanismSteps: ProgrammePresentationMechanismStepReadModel[]
  timelineEvents: ProgrammePresentationTimelineEventReadModel[]
}

export interface ProgrammePresentationPublicationReadModel {
  revisionId: string
  revisionNumber: number
  publishedAt: string
  supersededAt: string | null
}

export const REVIEW_IMPACT_LEVELS = [
  'LOW_RISK_EXACT_DATA',
  'INTERPRETIVE_REVIEW_REQUIRED',
  'POSSIBLE_VERDICT_IMPACT',
  'SAFETY_CRITICAL_REVIEW',
] as const
export type ReviewImpactLevel = (typeof REVIEW_IMPACT_LEVELS)[number]

export const TRIAL_STATUSES = [
  'NOT_YET_RECRUITING',
  'RECRUITING',
  'ENROLLING_BY_INVITATION',
  'ACTIVE_NOT_RECRUITING',
  'COMPLETED',
  'SUSPENDED',
  'TERMINATED',
  'WITHDRAWN',
  'UNKNOWN',
] as const
export type TrialStatus = (typeof TRIAL_STATUSES)[number]

export const TRIAL_RESULTS_STATUSES = ['AVAILABLE', 'UNAVAILABLE', 'NOT_POSTED', 'UNKNOWN'] as const
export type TrialResultsStatus = (typeof TRIAL_RESULTS_STATUSES)[number]

export const TRIAL_ENROLMENT_TYPES = ['ACTUAL', 'ESTIMATED', 'UNKNOWN'] as const
export type TrialEnrolmentType = (typeof TRIAL_ENROLMENT_TYPES)[number]

export const HUMAN_STUDY_STATUSES = ['YES', 'NO', 'UNKNOWN'] as const
export type HumanStudyStatus = (typeof HUMAN_STUDY_STATUSES)[number]

export const STUDY_INTERPRETABILITY_CRITERIA = [
  'STATISTICAL_POWER',
  'POPULATION_SELECTION',
  'DOSE_EXPOSURE_ADEQUACY',
  'ENDPOINT_VALIDITY',
  'DURATION_OPERATIONAL_INTEGRITY',
] as const
export type StudyInterpretabilityCriterion = (typeof STUDY_INTERPRETABILITY_CRITERIA)[number]

export const STUDY_INTERPRETABILITY_STATES = ['YES', 'NO', 'UNCLEAR', 'NOT_REPORTED'] as const
export type StudyInterpretabilityState = (typeof STUDY_INTERPRETABILITY_STATES)[number]

export const MONITOR_RUN_STATUSES = [
  'QUEUED',
  'RUNNING',
  'SUCCEEDED',
  'FAILED',
  'SOURCE_UNAVAILABLE',
  'CANCELLED',
  'UNKNOWN',
] as const
export type MonitorRunStatus = (typeof MONITOR_RUN_STATUSES)[number]

export const EVIDENCE_REVIEW_TASK_STATUSES = [
  'OPEN',
  'IN_REVIEW',
  'BLOCKED',
  'RESOLVED',
  'DISMISSED',
] as const
export type EvidenceReviewTaskStatus = (typeof EVIDENCE_REVIEW_TASK_STATUSES)[number]

/** Stable dependency paths for the separately editable 10-second summary. */
export const PROGRAMME_SUMMARY_FIELD_PATHS = [
  'summary.plainMechanism',
  'summary.bestSupportedFinding',
  'summary.mainLimitation',
] as const
export type ProgrammeSummaryFieldPath = (typeof PROGRAMME_SUMMARY_FIELD_PATHS)[number]

/** Stable dependency paths for every visible, independently reviewable verdict field. */
export const PROGRAMME_VERDICT_FIELD_PATHS = [
  'verdict.publicLabel',
  'verdict.professionalLabel',
  'verdict.oneSentenceReason',
  'verdict.scope.indication',
  'verdict.scope.population',
  'verdict.scope.doseExposure',
  'verdict.scope.period',
  'verdict.scope.trials',
  'verdict.scope.outcome',
  'verdict.whatWasDisproven',
  'verdict.whatWasNotDisproven',
  'verdict.whatRemainsUnknown',
  'verdict.confidence',
  'verdict.confidenceExplanation',
  'verdict.conditionsThatWouldChangeVerdict',
] as const
export type ProgrammeVerdictFieldPath = (typeof PROGRAMME_VERDICT_FIELD_PATHS)[number]

export function isStoppedProgramme(status: ProgrammeStatus): boolean {
  return status === 'STOPPED' || status === 'WITHDRAWN'
}

export function isTerminalSourceCheckFailure(status: SourceCheckStatus): boolean {
  return status === 'FAILED' || status === 'SOURCE_UNAVAILABLE'
}

export interface ProgrammeSelectorItem {
  id: string
  slug: string
  title: string
  indication: string | null
  targetPopulation: string | null
  status: ProgrammeStatus
  updateStatus: ProgrammeUpdateStatus
  hasPublishedVerdict: boolean
}

export interface EvidenceSourceSnapshotReadModel {
  id: string
  sourceId: string
  sourceType: EvidenceSourceType
  externalIdentifier: string | null
  canonicalLocator: string
  title: string | null
  publisher: string | null
  publicationDate: string | null
  correctionStatus: SourceCorrectionStatus
  hierarchy: SourceHierarchy
  retrievedAt: string
  sourcePublishedAt: string | null
  lastVerifiedAt: string | null
  contentHash: string
  sourceLocator: string | null
  relationship: ClaimSourceRelationship
}

export interface PublishedClaimReadModel {
  id: string
  claimKey: string
  revisionNumber: number
  programmeTrialId: string | null
  trialIdentifier: string | null
  evidenceNodeType: EvidenceNodeType | null
  nature: ClaimNature
  plainLanguageText: string
  technicalText: string | null
  population: string | null
  intervention: string | null
  comparator: string | null
  dose: string | null
  route: string | null
  duration: string | null
  endpoint: string | null
  endpointHierarchy: string | null
  outcomeType: string | null
  numericValue: string | null
  numericUnit: string | null
  uncertaintyInterval: string | null
  direction: ClaimDirection
  timepoint: string | null
  reviewerInterpretation: string | null
  lastVerifiedAt: string | null
  publishedAt: string
  sources: EvidenceSourceSnapshotReadModel[]
}

export interface PublishedEvidenceNodeReadModel {
  id: string
  nodeType: EvidenceNodeType
  revisionNumber: number
  state: EvidenceState
  plainSummary: string | null
  professionalSummary: string | null
  rationale: string | null
  lastVerifiedAt: string | null
  publishedAt: string
  supportingClaimIds: string[]
  contradictingClaimIds: string[]
  qualifyingClaimIds: string[]
}

export interface PublishedProgrammeVerdictReadModel {
  id: string
  revisionNumber: number
  programmeStatusAtReview: ProgrammeStatus
  verdictCode: StoppedProgrammeVerdict | null
  publicLabel: string
  professionalLabel: string
  indicationScope: string
  populationScope: string
  doseExposureScope: string
  periodScope: string
  trialScope: string
  outcomeScope: string
  plainMechanism: string
  bestSupportedFinding: string
  mainLimitation: string
  oneSentenceReason: string
  whatWasDisproven: string[]
  whatWasNotDisproven: string[]
  whatRemainsUnknown: string[]
  confidence: VerdictConfidence
  confidenceExplanation: string | null
  conditionsThatWouldChangeVerdict: string[]
  authorName: string
  conflictsOfInterest: string | null
  engineVersion: string
  inputDigestAlgorithm: string
  inputDigest: string
  reviewedAt: string
  publishedAt: string
  reviewers: ProgrammeVerdictReviewReadModel[]
  supportingClaimIds: string[]
  contradictoryClaimIds: string[]
}

export interface ProgrammeVerdictReviewReadModel {
  id: string
  reviewerName: string
  reviewerOrcidSnapshot: string | null
  expertiseTags: VerdictReviewerExpertiseTag[]
  decision: VerdictReviewDecision
  isIndependent: boolean
  conflictsOfInterest: string | null
  reviewNote: string | null
  reviewedAt: string
}

export interface ProgrammeDependencyReadModel {
  id: string
  programmeId: string
  claimId: string
  dependentSurfaceType: DependentSurfaceType
  evidenceNodeId: string | null
  verdictRevisionId: string | null
  fieldPath: string
  impactLevel: ReviewImpactLevel
}

export interface ProgrammeFreshnessReadModel {
  sourceId: string
  sourceTitle: string | null
  sourceType: EvidenceSourceType
  checkStatus: SourceCheckStatus
  freshnessStatus: SourceFreshnessStatus
  currentSnapshotId: string | null
  pendingSnapshotId: string | null
  lastCheckAttemptAt: string | null
  lastSuccessfulCheckAt: string | null
  lastVerifiedAt: string | null
  nextCheckDueAt: string | null
  consecutiveFailures: number
}

export interface TrialRegistrySnapshotReadModel {
  sourceId: string
  sourceType: EvidenceSourceType
  externalIdentifier: string | null
  canonicalLocator: string
  sourceTitle: string | null
  snapshotId: string
  contentHash: string
  retrievedAt: string
  lastVerifiedAt: string | null
}

export interface TrialInterpretabilityReadModel {
  id: string
  criterion: StudyInterpretabilityCriterion
  state: StudyInterpretabilityState
  revisionNumber: number
  explanation: string | null
  lastVerifiedAt: string | null
  publishedAt: string
  supportingClaimIds: string[]
  contradictingClaimIds: string[]
  qualifyingClaimIds: string[]
}

export interface ProgrammeTrialReadModel {
  id: string
  trialIdentifier: string
  title: string | null
  phase: string | null
  status: TrialStatus
  enrolment: number | null
  enrolmentType: TrialEnrolmentType
  startDate: string | null
  primaryCompletionDate: string | null
  completionDate: string | null
  humanStudyStatus: HumanStudyStatus
  lastVerifiedAt: string | null
  registrySnapshot: TrialRegistrySnapshotReadModel | null
  interpretability: TrialInterpretabilityReadModel[]
}

export interface ProgrammeEvidenceReadModel {
  medicine: {
    id: string
    slug: string
    name: string
    modality: string
  }
  programmes: ProgrammeSelectorItem[]
  selectedProgramme: null | {
    id: string
    slug: string
    title: string
    indication: string | null
    targetPopulation: string | null
    jurisdiction: string | null
    sponsor: string | null
    partners: string[]
    status: ProgrammeStatus
    highestPhaseReached: string | null
    route: string | null
    doseExposureContext: string | null
    startDate: string | null
    endDate: string | null
    rawStoppingReason: string | null
    stoppingReasonCategory: StoppingReasonCategory
    updateStatus: ProgrammeUpdateStatus
    trials: ProgrammeTrialReadModel[]
    claims: PublishedClaimReadModel[]
    evidenceNodes: PublishedEvidenceNodeReadModel[]
    verdict: PublishedProgrammeVerdictReadModel | null
    presentation: ProgrammePresentationReadModel | null
    publicationHistory: ProgrammePresentationPublicationReadModel[]
    freshness: ProgrammeFreshnessReadModel[]
  }
}
