import { createHash } from 'node:crypto'

import { and, asc, eq, inArray, isNull, or } from 'drizzle-orm'

import { db, type Db } from '@/db'
import {
  claimSourceLinks,
  claims,
  developmentProgrammes,
  evidenceNodeClaims,
  evidenceNodes,
  evidenceReviewTaskSourceDeltas,
  evidenceReviewTasks,
  evidenceSources,
  programmeContributionImplementations,
  programmeContributionProposals,
  programmeContributionReviewStates,
  programmeCurrentPublications,
  programmeDependencies,
  programmeFreshnessStates,
  programmeTrials,
  programmeVerdictClaims,
  programmeVerdictEvidenceNodes,
  programmeVerdictInterpretabilityAssessments,
  programmeVerdictMechanismStepClaims,
  programmeVerdictMechanismSteps,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  programmeVerdictSourceMetadataSnapshots,
  programmeVerdictTrialSnapshots,
  programmeVerdictTimelineEventClaims,
  programmeVerdictTimelineEvents,
  programmeVerdictTrials,
  sourceSnapshots,
  trialInterpretabilityAssessments,
  trialInterpretabilityClaims,
} from '@/db/schema'
import {
  PROGRAMME_SUMMARY_FIELD_PATHS,
  PROGRAMME_VERDICT_FIELD_PATHS,
  isStoppedProgramme,
  type ProgrammeSummaryFieldPath,
  type ProgrammeVerdictFieldPath,
  type ReviewImpactLevel,
  type ProgrammePresentationClaimLinkReadModel,
  type ProgrammePresentationReadModel,
  type ProgrammePresentationSourceReadModel,
  type StudyInterpretabilityCriterion,
  type StudyInterpretabilityState,
} from '@/lib/evidence/types'
import {
  runEvidenceIntelligence,
  type EvidenceChange,
  type EvidenceClaim,
  type EvidenceDependency,
  type EvidenceEntityRef,
  type EvidenceEngineVersion,
  type EvidenceIntelligenceInput,
  type EvidenceNode,
  type EvidenceProgrammePresentation,
  type EvidenceSource,
  type EvidenceTrial,
  type PlainLanguageSection,
  type ProgrammeVerdict,
  type SourceResolutionStatus,
  type StudyInterpretability,
} from '@/lib/rna-intelligence'
import { stableJsonStringify } from '@/lib/stable-json'

export type ProgrammeVerdictProposalErrorCode =
  | 'revision_not_found'
  | 'programme_not_found'
  | 'not_proposal_candidate'
  | 'immutable_published_revision'
  | 'programme_scope_mismatch'
  | 'invalid_stopped_verdict_scope'
  | 'missing_stopped_verdict'
  | 'missing_as_of_date'
  | 'stale_revision_lineage'
  | 'missing_trial_scope'
  | 'missing_supporting_claim'
  | 'unpublished_claim'
  | 'unbound_engine_evidence'
  | 'missing_summary_dependency'
  | 'missing_verdict_dependency'
  | 'pending_evidence_review'
  | 'invalid_contribution_implementation'
  | 'invalid_presentation'
  | 'engine_blocked'

export class ProgrammeVerdictProposalError extends Error {
  readonly code: ProgrammeVerdictProposalErrorCode

  constructor(code: ProgrammeVerdictProposalErrorCode, message: string) {
    super(message)
    this.name = 'ProgrammeVerdictProposalError'
    this.code = code
  }
}

export interface PreparedProgrammeVerdictProposal {
  revisionId: string
  programmeId: string
  proposalDigestAlgorithm: 'sha256'
  proposalDigest: string
  engineVersion: EvidenceEngineVersion
  inputDigestAlgorithm: 'sha256'
  inputDigest: string
}

export interface LockedProgrammeVerdictProposal extends PreparedProgrammeVerdictProposal {
  candidate: typeof programmeVerdictRevisions.$inferSelect
  programme: typeof developmentProgrammes.$inferSelect
  previousRevisionId: string | null
  engineInput: EvidenceIntelligenceInput
  reviewedTrialIds: string[]
  reviewedTrials: TrialRow[]
  reviewedClaimIds: string[]
  reviewedClaims: ClaimRow[]
  reviewedEvidenceNodeIds: string[]
  reviewedEvidenceNodes: EvidenceNodeRow[]
  reviewedInterpretabilityAssessmentIds: string[]
  reviewedInterpretabilityAssessments: InterpretabilityAssessmentRow[]
  reviewedSourceIds: string[]
  reviewedSources: EvidenceSourceRow[]
  reviewedSourceSnapshotIds: string[]
  reviewedSourceSnapshots: SourceSnapshotRow[]
  verdictClaimLinks: VerdictClaimLinkRow[]
  nodeClaimLinks: NodeClaimLinkRow[]
  assessmentClaimLinks: AssessmentClaimLinkRow[]
  mechanismSteps: MechanismStepRow[]
  mechanismStepClaimLinks: MechanismStepClaimLinkRow[]
  timelineEvents: TimelineEventRow[]
  timelineEventClaimLinks: TimelineEventClaimLinkRow[]
  presentation: ProgrammePresentationReadModel | null
  claimSourceLinks: ClaimSourceLinkRow[]
  dependencies: ProgrammeDependencyRow[]
  summaryClaims: Map<ProgrammeSummaryFieldPath, string[]>
  verdictClaims: Map<ProgrammeVerdictFieldPath, string[]>
  contributionImplementation: CanonicalContributionImplementation | null
}

export interface CanonicalContributionImplementation {
  proposalId: string
  proposalKey: string
  contributionDigest: string
  sourceReviewTaskId: string | null
  sourceId: string | null
  sourceSnapshotId: string | null
}

type Transaction = Parameters<Parameters<Db['transaction']>[0]>[0]
type VerdictRow = typeof programmeVerdictRevisions.$inferSelect
type TrialRow = typeof programmeTrials.$inferSelect
type TrialSnapshotRow = typeof programmeVerdictTrialSnapshots.$inferSelect
type ClaimRow = typeof claims.$inferSelect
type EvidenceNodeRow = typeof evidenceNodes.$inferSelect
type InterpretabilityAssessmentRow = typeof trialInterpretabilityAssessments.$inferSelect
type EvidenceSourceRow = typeof evidenceSources.$inferSelect
type SourceSnapshotRow = typeof sourceSnapshots.$inferSelect
type VerdictClaimLinkRow = Pick<
  typeof programmeVerdictClaims.$inferSelect,
  'claimId' | 'relationship'
>
type NodeClaimLinkRow = Pick<
  typeof evidenceNodeClaims.$inferSelect,
  'evidenceNodeId' | 'claimId' | 'relationship'
>
type AssessmentClaimLinkRow = Pick<
  typeof trialInterpretabilityClaims.$inferSelect,
  'assessmentId' | 'claimId' | 'relationship'
>
type ClaimSourceLinkRow = typeof claimSourceLinks.$inferSelect
type MechanismStepRow = typeof programmeVerdictMechanismSteps.$inferSelect
type MechanismStepClaimLinkRow = Pick<
  typeof programmeVerdictMechanismStepClaims.$inferSelect,
  'stepKey' | 'claimId' | 'relationship'
>
type TimelineEventRow = typeof programmeVerdictTimelineEvents.$inferSelect
type TimelineEventClaimLinkRow = Pick<
  typeof programmeVerdictTimelineEventClaims.$inferSelect,
  'eventKey' | 'claimId' | 'relationship'
>
type ProgrammeDependencyRow = typeof programmeDependencies.$inferSelect
type AssessmentRow = typeof trialInterpretabilityAssessments.$inferSelect

function programmeWithReviewedScope(
  programme: typeof developmentProgrammes.$inferSelect,
  scope: typeof programmeVerdictScopeSnapshots.$inferSelect | undefined,
): typeof developmentProgrammes.$inferSelect {
  if (!scope) return programme
  return {
    ...programme,
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
  }
}

function trialWithReviewedSnapshot(
  trial: TrialRow,
  snapshot: TrialSnapshotRow | undefined,
): TrialRow {
  if (!snapshot) return trial
  return {
    ...trial,
    id: snapshot.programmeTrialId,
    programmeId: snapshot.programmeId,
    trialIdentifier: snapshot.trialIdentifier,
    title: snapshot.title,
    phase: snapshot.phase,
    status: snapshot.status,
    resultsStatus: snapshot.resultsStatus,
    enrolment: snapshot.enrolment,
    enrolmentType: snapshot.enrolmentType,
    startDate: snapshot.startDate,
    primaryCompletionDate: snapshot.primaryCompletionDate,
    completionDate: snapshot.completionDate,
    humanStudyStatus: snapshot.humanStudyStatus,
    registrySourceId: snapshot.registrySourceId,
    registrySnapshotId: snapshot.registrySnapshotId,
    lastVerifiedAt: snapshot.lastVerifiedAt,
  }
}

const ENDPOINT_HIERARCHIES = new Set(['PRIMARY', 'SECONDARY', 'EXPLORATORY', 'NOT_APPLICABLE'])
const OUTCOME_TYPES = new Set(['PATIENT_OUTCOME', 'SURROGATE', 'SAFETY', 'OPERATIONAL', 'OTHER'])
const OPEN_REVIEW_TASK_STATUSES = new Set(['OPEN', 'IN_REVIEW', 'BLOCKED'])
const BLOCKING_IMPACTS = new Set<ReviewImpactLevel>([
  'INTERPRETIVE_REVIEW_REQUIRED',
  'POSSIBLE_VERDICT_IMPACT',
  'SAFETY_CRITICAL_REVIEW',
])
const REVIEWABLE_GRAPH_STATUSES = new Set(['DRAFT', 'MACHINE_CHECKED', 'APPROVED', 'PUBLISHED'])
const IMPACT_PRIORITY: Record<ReviewImpactLevel, number> = {
  LOW_RISK_EXACT_DATA: 0,
  INTERPRETIVE_REVIEW_REQUIRED: 1,
  POSSIBLE_VERDICT_IMPACT: 2,
  SAFETY_CRITICAL_REVIEW: 3,
}

function sha256(value: unknown): string {
  return createHash('sha256').update(stableJsonStringify(value), 'utf8').digest('hex')
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort()
}

function strongestImpact(values: readonly ReviewImpactLevel[]): ReviewImpactLevel {
  return (
    [...values].sort((left, right) => IMPACT_PRIORITY[right] - IMPACT_PRIORITY[left])[0] ??
    'INTERPRETIVE_REVIEW_REQUIRED'
  )
}

function dateValue(value: string | Date | null): string | undefined {
  if (value === null) return undefined
  return typeof value === 'string' ? value : value.toISOString().slice(0, 10)
}

function timestampDate(value: Date | null): string | undefined {
  return value?.toISOString().slice(0, 10)
}

function nonempty(value: string | null): string | undefined {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function endpointHierarchy(value: string | null): EvidenceClaim['endpointHierarchy'] {
  return value && ENDPOINT_HIERARCHIES.has(value)
    ? (value as EvidenceClaim['endpointHierarchy'])
    : undefined
}

function outcomeType(value: string | null): EvidenceClaim['outcomeType'] {
  return value && OUTCOME_TYPES.has(value) ? (value as EvidenceClaim['outcomeType']) : undefined
}

function sourceResolutionStatus(
  freshness: typeof programmeFreshnessStates.$inferSelect | undefined,
): SourceResolutionStatus {
  if (freshness?.checkStatus === 'SOURCE_UNAVAILABLE') return 'TEMPORARILY_UNAVAILABLE'
  if (freshness?.currentSnapshotId) return 'RESOLVABLE'
  return 'UNRESOLVABLE'
}

function trialSubjectType(row: TrialRow): EvidenceTrial['subjectType'] {
  if (row.humanStudyStatus === 'YES') return 'HUMAN'
  if (row.humanStudyStatus === 'UNKNOWN') return 'UNKNOWN'
  return 'OTHER'
}

function aggregateInterpretabilityState(
  assessments: readonly AssessmentRow[],
  criterion: StudyInterpretabilityCriterion,
): StudyInterpretabilityState {
  const values = assessments
    .filter((assessment) => assessment.criterion === criterion)
    .map((assessment) => assessment.state)
  if (values.length === 0) return 'NOT_REPORTED'
  if (values.includes('NO')) return 'NO'
  if (values.includes('UNCLEAR')) return 'UNCLEAR'
  if (values.includes('NOT_REPORTED')) return 'NOT_REPORTED'
  return 'YES'
}

function requiredVerdictPaths(): ProgrammeVerdictFieldPath[] {
  // Empty/unknown displays are still editorial conclusions. Every public field is therefore
  // traceable even when its reviewed value is an empty list or an explicit unknown.
  return [...PROGRAMME_VERDICT_FIELD_PATHS]
}

function dependencyTarget(
  row: typeof programmeDependencies.$inferSelect,
  candidateId: string,
  programmeId: string,
): EvidenceEntityRef {
  if (row.dependentSurfaceType === 'EVIDENCE_NODE' && row.evidenceNodeId) {
    return { type: 'EVIDENCE_NODE', id: row.evidenceNodeId, field: row.fieldPath }
  }
  if (row.dependentSurfaceType === 'VERDICT') {
    return { type: 'VERDICT', id: candidateId, field: row.fieldPath }
  }
  if (row.dependentSurfaceType === 'PROGRAMME_SUMMARY') {
    return { type: 'SUMMARY', id: `${candidateId}:summary`, field: row.fieldPath }
  }
  if (row.dependentSurfaceType === 'PROGRAMME_STATUS') {
    return { type: 'PROGRAMME', id: programmeId, field: row.fieldPath }
  }
  if (row.dependentSurfaceType === 'MECHANISM_MAP' && row.verdictRevisionId) {
    const stepKey = /^mechanism\.([a-z0-9][a-z0-9_-]{0,63})\./.exec(row.fieldPath)?.[1]
    return {
      type: 'MECHANISM_STEP',
      id: `${candidateId}:mechanism:${stepKey ?? row.fieldPath}`,
      field: row.fieldPath,
    }
  }
  if (row.dependentSurfaceType === 'TIMELINE') {
    const eventKey = /^timeline\.([a-z0-9][a-z0-9_-]{0,63})\./.exec(row.fieldPath)?.[1]
    if (row.verdictRevisionId && eventKey) {
      return {
        type: 'TIMELINE_EVENT',
        id: `${candidateId}:timeline:${eventKey}`,
        field: row.fieldPath,
      }
    }
    return { type: 'TIMELINE', id: programmeId, field: row.fieldPath }
  }
  if (row.dependentSurfaceType === 'SEARCH_DOCUMENT') {
    return { type: 'SEARCH_DOCUMENT', id: programmeId, field: row.fieldPath }
  }
  if (row.dependentSurfaceType === 'HOMEPAGE_CARD') {
    return { type: 'HOMEPAGE_CARD', id: programmeId, field: row.fieldPath }
  }
  if (row.dependentSurfaceType === 'API_OUTPUT') {
    return { type: 'API_DOCUMENT', id: programmeId, field: row.fieldPath }
  }
  return { type: 'METADATA', id: programmeId, field: row.fieldPath }
}

function canonicalCandidate(candidate: VerdictRow) {
  return {
    id: candidate.id,
    programmeId: candidate.programmeId,
    revisionNumber: candidate.revisionNumber,
    previousVerdictRevisionId: candidate.previousVerdictRevisionId,
    programmeStatusAtReview: candidate.programmeStatusAtReview,
    verdictCode: candidate.verdictCode,
    proposalAsOfDate: candidate.proposalAsOfDate,
    ...(candidate.presentationSchemaVersion
      ? { presentationSchemaVersion: candidate.presentationSchemaVersion }
      : {}),
    publicLabel: candidate.publicLabel,
    professionalLabel: candidate.professionalLabel,
    indicationScope: candidate.indicationScope,
    populationScope: candidate.populationScope,
    doseExposureScope: candidate.doseExposureScope,
    periodScope: candidate.periodScope,
    trialScope: candidate.trialScope,
    outcomeScope: candidate.outcomeScope,
    plainMechanism: candidate.plainMechanism,
    bestSupportedFinding: candidate.bestSupportedFinding,
    mainLimitation: candidate.mainLimitation,
    oneSentenceReason: candidate.oneSentenceReason,
    whatWasDisproven: candidate.whatWasDisproven,
    whatWasNotDisproven: candidate.whatWasNotDisproven,
    whatRemainsUnknown: candidate.whatRemainsUnknown,
    confidence: candidate.confidence,
    confidenceExplanation: candidate.confidenceExplanation,
    conditionsThatWouldChangeVerdict: candidate.conditionsThatWouldChangeVerdict,
    authorUserId: candidate.authorUserId,
    authorName: candidate.authorName,
    conflictsOfInterest: candidate.conflictsOfInterest,
    sourceDependent: candidate.sourceDependent,
    adjudicationRationale: candidate.adjudicationRationale,
    adjudicatorUserId: candidate.adjudicatorUserId,
  }
}

function plainLanguageSections(candidate: VerdictRow): PlainLanguageSection[] {
  const verdictEntity = { type: 'VERDICT' as const, id: candidate.id }
  const sections: PlainLanguageSection[] = [
    {
      id: `${candidate.id}:public-label`,
      entity: { ...verdictEntity, field: 'publicLabel' },
      kind: 'OTHER',
      text: candidate.publicLabel,
    },
    {
      id: `${candidate.id}:reason`,
      entity: { ...verdictEntity, field: 'oneSentenceReason' },
      kind: 'VERDICT_REASON',
      text: candidate.oneSentenceReason,
    },
  ]
  const optional = [
    ['confidence-explanation', 'confidenceExplanation', candidate.confidenceExplanation],
    ...candidate.whatWasDisproven.map((text, index) => [
      `disproven-${index}`,
      'whatWasDisproven',
      text,
    ]),
    ...candidate.whatWasNotDisproven.map((text, index) => [
      `not-disproven-${index}`,
      'whatWasNotDisproven',
      text,
    ]),
    ...candidate.whatRemainsUnknown.map((text, index) => [
      `unknown-${index}`,
      'whatRemainsUnknown',
      text,
    ]),
    ...candidate.conditionsThatWouldChangeVerdict.map((text, index) => [
      `change-condition-${index}`,
      'conditionsThatWouldChangeVerdict',
      text,
    ]),
  ] as Array<[string, string, string | null]>
  for (const [id, field, text] of optional) {
    if (!nonempty(text)) continue
    sections.push({
      id: `${candidate.id}:${id}`,
      entity: { ...verdictEntity, field },
      kind: 'OTHER',
      text: text ?? '',
    })
  }
  return sections
}

function presentationPlainLanguageSections(
  candidateId: string,
  mechanismSteps: readonly MechanismStepRow[],
  timelineEvents: readonly TimelineEventRow[],
): PlainLanguageSection[] {
  return [
    ...mechanismSteps.flatMap((step) => [
      {
        id: `${candidateId}:mechanism:${step.stepKey}:title`,
        entity: {
          type: 'MECHANISM_STEP' as const,
          id: `${candidateId}:mechanism:${step.stepKey}`,
          field: 'plainTitle',
        },
        kind: 'OTHER' as const,
        text: step.plainTitle,
      },
      {
        id: `${candidateId}:mechanism:${step.stepKey}:description`,
        entity: {
          type: 'MECHANISM_STEP' as const,
          id: `${candidateId}:mechanism:${step.stepKey}`,
          field: 'plainDescription',
        },
        kind: 'OTHER' as const,
        text: step.plainDescription,
      },
    ]),
    ...timelineEvents.flatMap((event) => [
      {
        id: `${candidateId}:timeline:${event.eventKey}:title`,
        entity: {
          type: 'TIMELINE_EVENT' as const,
          id: `${candidateId}:timeline:${event.eventKey}`,
          field: 'plainTitle',
        },
        kind: 'OTHER' as const,
        text: event.plainTitle,
      },
      {
        id: `${candidateId}:timeline:${event.eventKey}:description`,
        entity: {
          type: 'TIMELINE_EVENT' as const,
          id: `${candidateId}:timeline:${event.eventKey}`,
          field: 'plainDescription',
        },
        kind: 'OTHER' as const,
        text: event.plainDescription,
      },
    ]),
  ]
}

/**
 * Builds the exact review proposal from rows locked in the caller's transaction.
 *
 * No caller-supplied scientific object is accepted. Exact revision-link tables define the graph,
 * and exact source-snapshot IDs remain in the proposal digest even though the engine's claim
 * contract addresses sources by stable source ID.
 */
export async function buildLockedProgrammeVerdictProposal(
  tx: Transaction,
  revisionId: string,
): Promise<LockedProgrammeVerdictProposal> {
  const candidateRows = await tx
    .select()
    .from(programmeVerdictRevisions)
    .where(eq(programmeVerdictRevisions.id, revisionId))
    .limit(1)
    .for('update')
  const candidate = candidateRows[0]
  if (!candidate) {
    throw new ProgrammeVerdictProposalError(
      'revision_not_found',
      'No programme verdict revision matches this id.',
    )
  }

  const programmeRows = await tx
    .select()
    .from(developmentProgrammes)
    .where(eq(developmentProgrammes.id, candidate.programmeId))
    .limit(1)
    .for('update')
  const liveProgramme = programmeRows[0]
  if (!liveProgramme) {
    throw new ProgrammeVerdictProposalError(
      'programme_not_found',
      'This verdict revision points at a missing development programme.',
    )
  }
  const scopeRows = await tx
    .select()
    .from(programmeVerdictScopeSnapshots)
    .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, candidate.id))
    .limit(1)
    .for('share')
  const programme = programmeWithReviewedScope(liveProgramme, scopeRows[0])

  const pointerRows = await tx
    .select()
    .from(programmeCurrentPublications)
    .where(eq(programmeCurrentPublications.programmeId, programme.id))
    .limit(1)
    .for('update')
  const pointer = pointerRows[0] ?? null
  const previousRevisionId = pointer?.verdictRevisionId ?? null

  const implementationRows = await tx
    .select()
    .from(programmeContributionImplementations)
    .where(eq(programmeContributionImplementations.verdictRevisionId, candidate.id))
    .limit(1)
    .for('share')
  const implementation = implementationRows[0] ?? null
  let contributionImplementation: CanonicalContributionImplementation | null = null
  if (implementation) {
    const proposalRows = await tx
      .select({
        proposal: programmeContributionProposals,
        reviewStatus: programmeContributionReviewStates.status,
      })
      .from(programmeContributionProposals)
      .innerJoin(
        programmeContributionReviewStates,
        eq(programmeContributionReviewStates.proposalId, programmeContributionProposals.id),
      )
      .where(eq(programmeContributionProposals.id, implementation.proposalId))
      .limit(1)
      .for('share')
    const accepted = proposalRows[0]
    if (
      !accepted ||
      accepted.proposal.status !== 'SUBMITTED' ||
      accepted.reviewStatus !== 'ACCEPTED_FOR_IMPLEMENTATION' ||
      accepted.proposal.programmeId !== candidate.programmeId ||
      accepted.proposal.proposalKey !== implementation.proposalKey ||
      accepted.proposal.authorUserId !== candidate.authorUserId ||
      accepted.proposal.contentDigestAlgorithm !== implementation.contributionDigestAlgorithm ||
      accepted.proposal.contentDigest !== implementation.contributionDigest ||
      accepted.proposal.sourceReviewTaskId !== implementation.sourceReviewTaskId ||
      accepted.proposal.sourceReviewSnapshotId !== implementation.sourceSnapshotId
    ) {
      throw new ProgrammeVerdictProposalError(
        'invalid_contribution_implementation',
        'This candidate is not bound to one unchanged, accepted contribution proposal.',
      )
    }
    contributionImplementation = {
      proposalId: implementation.proposalId,
      proposalKey: implementation.proposalKey,
      contributionDigest: implementation.contributionDigest,
      sourceReviewTaskId: implementation.sourceReviewTaskId,
      sourceId: implementation.sourceId,
      sourceSnapshotId: implementation.sourceSnapshotId,
    }
  }

  if (candidate.programmeStatusAtReview !== programme.status) {
    throw new ProgrammeVerdictProposalError(
      'programme_scope_mismatch',
      'The programme status changed after this verdict was drafted.',
    )
  }
  if (candidate.verdictCode && !isStoppedProgramme(programme.status)) {
    throw new ProgrammeVerdictProposalError(
      'invalid_stopped_verdict_scope',
      'A stopped-programme verdict is valid only for a STOPPED or WITHDRAWN programme.',
    )
  }
  if (isStoppedProgramme(programme.status) && !candidate.verdictCode) {
    throw new ProgrammeVerdictProposalError(
      'missing_stopped_verdict',
      'A STOPPED or WITHDRAWN programme requires an explicit stopped-programme verdict code.',
    )
  }
  if (!candidate.proposalAsOfDate) {
    throw new ProgrammeVerdictProposalError(
      'missing_as_of_date',
      'The proposal requires an explicit persisted engine as-of date.',
    )
  }
  if (candidate.previousVerdictRevisionId !== previousRevisionId) {
    throw new ProgrammeVerdictProposalError(
      'stale_revision_lineage',
      'The candidate predecessor must exactly match the current published revision.',
    )
  }
  const currentRevisionNumber = pointer
    ? ((
        await tx
          .select({ revisionNumber: programmeVerdictRevisions.revisionNumber })
          .from(programmeVerdictRevisions)
          .where(eq(programmeVerdictRevisions.id, pointer.verdictRevisionId))
          .limit(1)
          .for('share')
      )[0]?.revisionNumber ?? 0)
    : 0
  const laterLineageRows = await tx
    .select({
      id: programmeVerdictRevisions.id,
      revisionNumber: programmeVerdictRevisions.revisionNumber,
      previousVerdictRevisionId: programmeVerdictRevisions.previousVerdictRevisionId,
      reviewStatus: programmeVerdictRevisions.reviewStatus,
      proposalPreparedAt: programmeVerdictRevisions.proposalPreparedAt,
    })
    .from(programmeVerdictRevisions)
    .where(eq(programmeVerdictRevisions.programmeId, candidate.programmeId))
    .orderBy(asc(programmeVerdictRevisions.revisionNumber))
    .for('share')
  const priorCandidateRows = laterLineageRows.filter(
    (row) => row.id !== candidate.id && row.revisionNumber > currentRevisionNumber,
  )
  const dismissedSourceCandidateRows =
    priorCandidateRows.length === 0
      ? []
      : await tx
          .select({ verdictRevisionId: programmeContributionImplementations.verdictRevisionId })
          .from(programmeContributionImplementations)
          .innerJoin(
            evidenceReviewTasks,
            eq(evidenceReviewTasks.id, programmeContributionImplementations.sourceReviewTaskId),
          )
          .where(
            and(
              inArray(
                programmeContributionImplementations.verdictRevisionId,
                priorCandidateRows.map((row) => row.id),
              ),
              eq(evidenceReviewTasks.status, 'DISMISSED'),
            ),
          )
          .for('share')
  const dismissedSourceCandidateIds = new Set(
    dismissedSourceCandidateRows.map((row) => row.verdictRevisionId),
  )
  const priorCandidatesAreClosed = priorCandidateRows.every(
    (row) =>
      row.revisionNumber < candidate.revisionNumber &&
      row.previousVerdictRevisionId === previousRevisionId &&
      row.proposalPreparedAt !== null &&
      (row.reviewStatus === 'CHANGES_REQUESTED' || dismissedSourceCandidateIds.has(row.id)),
  )
  const expectedRevisionNumber = Math.max(
    currentRevisionNumber,
    ...priorCandidateRows.map((row) => row.revisionNumber),
  )
  if (!priorCandidatesAreClosed || candidate.revisionNumber !== expectedRevisionNumber + 1) {
    throw new ProgrammeVerdictProposalError(
      'stale_revision_lineage',
      'A candidate must be the next programme revision after the current publication and any terminal versions sent back for changes or invalidated by a superseded source task.',
    )
  }

  const trialLinkRows = await tx
    .select({ programmeTrialId: programmeVerdictTrials.programmeTrialId })
    .from(programmeVerdictTrials)
    .where(eq(programmeVerdictTrials.verdictRevisionId, candidate.id))
    .orderBy(asc(programmeVerdictTrials.programmeTrialId))
    .for('share')
  const trialIds = uniqueSorted(trialLinkRows.map((row) => row.programmeTrialId))
  if (trialIds.length === 0) {
    throw new ProgrammeVerdictProposalError(
      'missing_trial_scope',
      'The verdict requires at least one normalized programme-trial scope link.',
    )
  }
  const liveTrialRows = await tx
    .select()
    .from(programmeTrials)
    .where(
      and(eq(programmeTrials.programmeId, programme.id), inArray(programmeTrials.id, trialIds)),
    )
    .orderBy(asc(programmeTrials.id))
    .for('update')
  if (liveTrialRows.length !== trialIds.length) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'One or more normalized trial-scope links do not resolve inside this programme.',
    )
  }
  const trialSnapshotRows = await tx
    .select()
    .from(programmeVerdictTrialSnapshots)
    .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, candidate.id))
    .orderBy(asc(programmeVerdictTrialSnapshots.programmeTrialId))
    .for('share')
  if (scopeRows[0] && trialSnapshotRows.length !== trialIds.length) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'Every reviewed trial requires a verdict-scoped immutable snapshot.',
    )
  }
  const trialSnapshotById = new Map(trialSnapshotRows.map((row) => [row.programmeTrialId, row]))
  const trialRows = liveTrialRows.map((trial) =>
    trialWithReviewedSnapshot(trial, trialSnapshotById.get(trial.id)),
  )

  const nodeLinkRows = await tx
    .select({ evidenceNodeId: programmeVerdictEvidenceNodes.evidenceNodeId })
    .from(programmeVerdictEvidenceNodes)
    .where(eq(programmeVerdictEvidenceNodes.verdictRevisionId, candidate.id))
    .orderBy(asc(programmeVerdictEvidenceNodes.evidenceNodeId))
    .for('share')
  const nodeIds = uniqueSorted(nodeLinkRows.map((row) => row.evidenceNodeId))
  const nodeRows =
    nodeIds.length === 0
      ? []
      : await tx
          .select()
          .from(evidenceNodes)
          .where(
            and(eq(evidenceNodes.programmeId, programme.id), inArray(evidenceNodes.id, nodeIds)),
          )
          .orderBy(asc(evidenceNodes.id))
          .for('update')
  if (
    nodeRows.length !== nodeIds.length ||
    nodeRows.some((row) => !REVIEWABLE_GRAPH_STATUSES.has(row.reviewStatus))
  ) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'Every reviewed evidence node must resolve to an exact reviewable revision.',
    )
  }
  if (new Set(nodeRows.map((row) => row.nodeType)).size !== nodeRows.length) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'A verdict bundle may contain only one evidence-node revision per node type.',
    )
  }

  const assessmentLinkRows = await tx
    .select({ assessmentId: programmeVerdictInterpretabilityAssessments.assessmentId })
    .from(programmeVerdictInterpretabilityAssessments)
    .where(eq(programmeVerdictInterpretabilityAssessments.verdictRevisionId, candidate.id))
    .orderBy(asc(programmeVerdictInterpretabilityAssessments.assessmentId))
    .for('share')
  const assessmentIds = uniqueSorted(assessmentLinkRows.map((row) => row.assessmentId))
  const assessmentRows =
    assessmentIds.length === 0
      ? []
      : await tx
          .select()
          .from(trialInterpretabilityAssessments)
          .where(
            and(
              eq(trialInterpretabilityAssessments.programmeId, programme.id),
              inArray(trialInterpretabilityAssessments.id, assessmentIds),
            ),
          )
          .orderBy(asc(trialInterpretabilityAssessments.id))
          .for('update')
  if (
    assessmentRows.length !== assessmentIds.length ||
    assessmentRows.some(
      (row) =>
        !REVIEWABLE_GRAPH_STATUSES.has(row.reviewStatus) ||
        !trialIds.includes(row.programmeTrialId),
    )
  ) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'Every reviewed interpretability answer must be a reviewable revision for a scoped trial.',
    )
  }
  if (
    new Set(assessmentRows.map((row) => `${row.programmeTrialId}:${row.criterion}`)).size !==
    assessmentRows.length
  ) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'A verdict bundle may contain only one interpretability revision per trial criterion.',
    )
  }

  const mechanismSteps = await tx
    .select()
    .from(programmeVerdictMechanismSteps)
    .where(eq(programmeVerdictMechanismSteps.verdictRevisionId, candidate.id))
    .orderBy(
      asc(programmeVerdictMechanismSteps.stepOrder),
      asc(programmeVerdictMechanismSteps.stepKey),
    )
    .for('share')
  const mechanismStepClaimLinks = await tx
    .select({
      stepKey: programmeVerdictMechanismStepClaims.stepKey,
      claimId: programmeVerdictMechanismStepClaims.claimId,
      relationship: programmeVerdictMechanismStepClaims.relationship,
    })
    .from(programmeVerdictMechanismStepClaims)
    .where(eq(programmeVerdictMechanismStepClaims.verdictRevisionId, candidate.id))
    .orderBy(
      asc(programmeVerdictMechanismStepClaims.stepKey),
      asc(programmeVerdictMechanismStepClaims.claimId),
      asc(programmeVerdictMechanismStepClaims.relationship),
    )
    .for('share')
  const timelineEvents = await tx
    .select()
    .from(programmeVerdictTimelineEvents)
    .where(eq(programmeVerdictTimelineEvents.verdictRevisionId, candidate.id))
    .orderBy(
      asc(programmeVerdictTimelineEvents.eventDate),
      asc(programmeVerdictTimelineEvents.eventKey),
    )
    .for('share')
  const timelineEventClaimLinks = await tx
    .select({
      eventKey: programmeVerdictTimelineEventClaims.eventKey,
      claimId: programmeVerdictTimelineEventClaims.claimId,
      relationship: programmeVerdictTimelineEventClaims.relationship,
    })
    .from(programmeVerdictTimelineEventClaims)
    .where(eq(programmeVerdictTimelineEventClaims.verdictRevisionId, candidate.id))
    .orderBy(
      asc(programmeVerdictTimelineEventClaims.eventKey),
      asc(programmeVerdictTimelineEventClaims.claimId),
      asc(programmeVerdictTimelineEventClaims.relationship),
    )
    .for('share')
  if (
    candidate.presentationSchemaVersion === null &&
    (mechanismSteps.length > 0 ||
      mechanismStepClaimLinks.length > 0 ||
      timelineEvents.length > 0 ||
      timelineEventClaimLinks.length > 0)
  ) {
    throw new ProgrammeVerdictProposalError(
      'invalid_presentation',
      'Unversioned candidates cannot carry presentation rows outside their signed proposal.',
    )
  }
  if (
    candidate.presentationSchemaVersion === 'programme-presentation/v1' &&
    (mechanismSteps.length < 3 || mechanismSteps.length > 5)
  ) {
    throw new ProgrammeVerdictProposalError(
      'invalid_presentation',
      'programme-presentation/v1 requires three to five reviewed mechanism stages.',
    )
  }

  const verdictClaimLinks = await tx
    .select({
      claimId: programmeVerdictClaims.claimId,
      relationship: programmeVerdictClaims.relationship,
    })
    .from(programmeVerdictClaims)
    .where(eq(programmeVerdictClaims.verdictRevisionId, candidate.id))
    .orderBy(asc(programmeVerdictClaims.claimId), asc(programmeVerdictClaims.relationship))
    .for('share')
  const supportingClaimIds = uniqueSorted(
    verdictClaimLinks.filter((row) => row.relationship === 'SUPPORTING').map((row) => row.claimId),
  )
  if (supportingClaimIds.length === 0) {
    throw new ProgrammeVerdictProposalError(
      'missing_supporting_claim',
      'A programme verdict requires at least one supporting claim revision.',
    )
  }

  const nodeClaimLinks =
    nodeIds.length === 0
      ? []
      : await tx
          .select({
            evidenceNodeId: evidenceNodeClaims.evidenceNodeId,
            claimId: evidenceNodeClaims.claimId,
            relationship: evidenceNodeClaims.relationship,
          })
          .from(evidenceNodeClaims)
          .where(inArray(evidenceNodeClaims.evidenceNodeId, nodeIds))
          .orderBy(
            asc(evidenceNodeClaims.evidenceNodeId),
            asc(evidenceNodeClaims.claimId),
            asc(evidenceNodeClaims.relationship),
          )
          .for('share')
  const assessmentClaimLinks =
    assessmentIds.length === 0
      ? []
      : await tx
          .select({
            assessmentId: trialInterpretabilityClaims.assessmentId,
            claimId: trialInterpretabilityClaims.claimId,
            relationship: trialInterpretabilityClaims.relationship,
          })
          .from(trialInterpretabilityClaims)
          .where(inArray(trialInterpretabilityClaims.assessmentId, assessmentIds))
          .orderBy(
            asc(trialInterpretabilityClaims.assessmentId),
            asc(trialInterpretabilityClaims.claimId),
            asc(trialInterpretabilityClaims.relationship),
          )
          .for('share')
  const reviewedClaimIds = uniqueSorted([
    ...verdictClaimLinks.map((row) => row.claimId),
    ...nodeClaimLinks.map((row) => row.claimId),
    ...assessmentClaimLinks.map((row) => row.claimId),
    ...mechanismStepClaimLinks.map((row) => row.claimId),
    ...timelineEventClaimLinks.map((row) => row.claimId),
  ])
  const claimRows = await tx
    .select()
    .from(claims)
    .where(and(eq(claims.programmeId, programme.id), inArray(claims.id, reviewedClaimIds)))
    .orderBy(asc(claims.id))
    .for('update')
  if (claimRows.length !== reviewedClaimIds.length) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'One or more proposal claim links do not resolve inside this programme.',
    )
  }
  if (claimRows.some((claim) => !REVIEWABLE_GRAPH_STATUSES.has(claim.reviewStatus))) {
    throw new ProgrammeVerdictProposalError(
      'unpublished_claim',
      'Every claim in the reviewed proposal graph must be an exact reviewable revision.',
    )
  }
  if (new Set(claimRows.map((claim) => claim.claimKey)).size !== claimRows.length) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'A verdict bundle may contain only one claim revision per logical claim key.',
    )
  }

  const claimSourceRows = await tx
    .select()
    .from(claimSourceLinks)
    .where(inArray(claimSourceLinks.claimId, reviewedClaimIds))
    .orderBy(
      asc(claimSourceLinks.claimId),
      asc(claimSourceLinks.sourceSnapshotId),
      asc(claimSourceLinks.relationship),
    )
    .for('share')

  // A source refresh may intentionally leave an unchanged reviewed statement on the source
  // version that supported it while a separate accepted statement cites the new version. That
  // exception is safe only when the old binding is copied exactly from the immutable publication
  // immediately preceding this candidate. Loading that graph here also makes the exception carry
  // forward through later unrelated revisions without treating arbitrary historical snapshots as
  // current evidence.
  let previousClaimSourceRows: ClaimSourceLinkRow[] = []
  let previousTrialSnapshotRows: TrialSnapshotRow[] = []
  let previousTimelineEventRows: TimelineEventRow[] = []
  if (previousRevisionId) {
    const [
      previousVerdictClaimRows,
      previousNodeLinkRows,
      previousAssessmentLinkRows,
      previousMechanismClaimRows,
      previousTimelineClaimRows,
    ] = await Promise.all([
      tx
        .select({ claimId: programmeVerdictClaims.claimId })
        .from(programmeVerdictClaims)
        .where(eq(programmeVerdictClaims.verdictRevisionId, previousRevisionId))
        .for('share'),
      tx
        .select({ evidenceNodeId: programmeVerdictEvidenceNodes.evidenceNodeId })
        .from(programmeVerdictEvidenceNodes)
        .where(eq(programmeVerdictEvidenceNodes.verdictRevisionId, previousRevisionId))
        .for('share'),
      tx
        .select({ assessmentId: programmeVerdictInterpretabilityAssessments.assessmentId })
        .from(programmeVerdictInterpretabilityAssessments)
        .where(
          eq(programmeVerdictInterpretabilityAssessments.verdictRevisionId, previousRevisionId),
        )
        .for('share'),
      tx
        .select({ claimId: programmeVerdictMechanismStepClaims.claimId })
        .from(programmeVerdictMechanismStepClaims)
        .where(eq(programmeVerdictMechanismStepClaims.verdictRevisionId, previousRevisionId))
        .for('share'),
      tx
        .select({ claimId: programmeVerdictTimelineEventClaims.claimId })
        .from(programmeVerdictTimelineEventClaims)
        .where(eq(programmeVerdictTimelineEventClaims.verdictRevisionId, previousRevisionId))
        .for('share'),
    ])
    const previousNodeIds = uniqueSorted(previousNodeLinkRows.map((row) => row.evidenceNodeId))
    const previousAssessmentIds = uniqueSorted(
      previousAssessmentLinkRows.map((row) => row.assessmentId),
    )
    const [previousNodeClaimRows, previousAssessmentClaimRows] = await Promise.all([
      previousNodeIds.length === 0
        ? Promise.resolve([])
        : tx
            .select({ claimId: evidenceNodeClaims.claimId })
            .from(evidenceNodeClaims)
            .where(inArray(evidenceNodeClaims.evidenceNodeId, previousNodeIds))
            .for('share'),
      previousAssessmentIds.length === 0
        ? Promise.resolve([])
        : tx
            .select({ claimId: trialInterpretabilityClaims.claimId })
            .from(trialInterpretabilityClaims)
            .where(inArray(trialInterpretabilityClaims.assessmentId, previousAssessmentIds))
            .for('share'),
    ])
    const previousReviewedClaimIds = uniqueSorted([
      ...previousVerdictClaimRows.map((row) => row.claimId),
      ...previousNodeClaimRows.map((row) => row.claimId),
      ...previousAssessmentClaimRows.map((row) => row.claimId),
      ...previousMechanismClaimRows.map((row) => row.claimId),
      ...previousTimelineClaimRows.map((row) => row.claimId),
    ])
    ;[previousClaimSourceRows, previousTrialSnapshotRows, previousTimelineEventRows] =
      await Promise.all([
        previousReviewedClaimIds.length === 0
          ? Promise.resolve([])
          : tx
              .select()
              .from(claimSourceLinks)
              .where(inArray(claimSourceLinks.claimId, previousReviewedClaimIds))
              .for('share'),
        tx
          .select()
          .from(programmeVerdictTrialSnapshots)
          .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, previousRevisionId))
          .for('share'),
        tx
          .select()
          .from(programmeVerdictTimelineEvents)
          .where(eq(programmeVerdictTimelineEvents.verdictRevisionId, previousRevisionId))
          .for('share'),
      ])
  }
  const citedSourceSnapshotIds = uniqueSorted([
    ...claimSourceRows.map((row) => row.sourceSnapshotId),
    ...trialRows.flatMap((row) => (row.registrySnapshotId ? [row.registrySnapshotId] : [])),
    ...timelineEvents.map((event) => event.sourceSnapshotId),
  ])
  const citedSnapshotRows =
    citedSourceSnapshotIds.length === 0
      ? []
      : await tx
          .select()
          .from(sourceSnapshots)
          .where(inArray(sourceSnapshots.id, citedSourceSnapshotIds))
          .orderBy(asc(sourceSnapshots.id))
          .for('share')
  if (citedSnapshotRows.length !== citedSourceSnapshotIds.length) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'Every reviewed citation must resolve to an exact immutable source snapshot.',
    )
  }
  // Sign the complete immutable ancestry for every cited source version. A monitor may supersede
  // more than one still-pending version before review finishes; keeping the whole chain in the
  // engine input makes baseline -> A -> B (and later) transitions independently verifiable.
  const citedSourceIds = uniqueSorted(citedSnapshotRows.map((snapshot) => snapshot.sourceId))
  const sourceLineageRows =
    citedSourceIds.length === 0
      ? []
      : await tx
          .select({
            id: sourceSnapshots.id,
            sourceId: sourceSnapshots.sourceId,
            previousSnapshotId: sourceSnapshots.previousSnapshotId,
          })
          .from(sourceSnapshots)
          .where(inArray(sourceSnapshots.sourceId, citedSourceIds))
  const lineageBySnapshotId = new Map(sourceLineageRows.map((row) => [row.id, row]))
  const reviewedSourceSnapshotIdSet = new Set<string>()
  for (const cited of citedSnapshotRows) {
    const visited = new Set<string>()
    let cursor: string | null = cited.id
    while (cursor && !visited.has(cursor)) {
      visited.add(cursor)
      reviewedSourceSnapshotIdSet.add(cursor)
      cursor = lineageBySnapshotId.get(cursor)?.previousSnapshotId ?? null
    }
  }
  const reviewedSourceSnapshotIds = [...reviewedSourceSnapshotIdSet].sort()
  const snapshotRows =
    reviewedSourceSnapshotIds.length === citedSnapshotRows.length
      ? citedSnapshotRows
      : await tx
          .select()
          .from(sourceSnapshots)
          .where(inArray(sourceSnapshots.id, reviewedSourceSnapshotIds))
          .orderBy(asc(sourceSnapshots.id))
          .for('share')
  if (snapshotRows.length !== reviewedSourceSnapshotIds.length) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'Every cited source-snapshot predecessor must resolve inside the signed review bundle.',
    )
  }

  const sourceIds = uniqueSorted(snapshotRows.map((snapshot) => snapshot.sourceId))
  const sourceRows =
    sourceIds.length === 0
      ? []
      : await tx
          .select()
          .from(evidenceSources)
          .where(inArray(evidenceSources.id, sourceIds))
          .orderBy(asc(evidenceSources.id))
          .for('share')
  if (sourceRows.length !== sourceIds.length) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'Every reviewed snapshot must resolve to a stored evidence-source identity.',
    )
  }
  const sourceMetadataRows =
    sourceIds.length === 0
      ? []
      : await tx
          .select()
          .from(programmeVerdictSourceMetadataSnapshots)
          .where(
            and(
              eq(programmeVerdictSourceMetadataSnapshots.verdictRevisionId, candidate.id),
              inArray(programmeVerdictSourceMetadataSnapshots.sourceId, sourceIds),
            ),
          )
          .orderBy(asc(programmeVerdictSourceMetadataSnapshots.sourceId))
          .for('share')
  if (scopeRows[0] && sourceMetadataRows.length !== sourceIds.length) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'Every reviewed source requires verdict-scoped immutable metadata.',
    )
  }
  const sourceMetadataById = new Map(sourceMetadataRows.map((row) => [row.sourceId, row]))
  const reviewedSourceRows = sourceRows.map((source) => {
    const snapshot = sourceMetadataById.get(source.id)
    return snapshot
      ? {
          ...source,
          sourceType: snapshot.sourceType,
          externalIdentifier: snapshot.externalIdentifier,
          canonicalLocator: snapshot.canonicalLocator,
          title: snapshot.title,
          publisher: snapshot.publisher,
          sponsor: snapshot.sponsor,
          publicationDate: snapshot.publicationDate,
          correctionStatus: snapshot.correctionStatus,
          jurisdiction: snapshot.jurisdiction,
          hierarchy: snapshot.hierarchy,
        }
      : source
  })

  const freshnessRows =
    sourceIds.length === 0
      ? []
      : await tx
          .select()
          .from(programmeFreshnessStates)
          .where(
            and(
              eq(programmeFreshnessStates.programmeId, programme.id),
              inArray(programmeFreshnessStates.sourceId, sourceIds),
            ),
          )
          .orderBy(asc(programmeFreshnessStates.sourceId))
          .for('share')
  const freshnessBySource = new Map(freshnessRows.map((row) => [row.sourceId, row]))
  const snapshotDescendsFrom = (
    sourceId: string,
    descendantSnapshotId: string,
    ancestorSnapshotId: string,
  ): boolean => {
    const visited = new Set<string>()
    let cursor: string | null = descendantSnapshotId
    while (cursor && !visited.has(cursor)) {
      if (cursor === ancestorSnapshotId) return true
      visited.add(cursor)
      const row = lineageBySnapshotId.get(cursor)
      if (!row || row.sourceId !== sourceId) return false
      cursor = row.previousSnapshotId
    }
    return false
  }
  if (
    contributionImplementation?.sourceId &&
    (!sourceIds.includes(contributionImplementation.sourceId) ||
      !reviewedSourceSnapshotIds.includes(contributionImplementation.sourceSnapshotId as string))
  ) {
    throw new ProgrammeVerdictProposalError(
      'invalid_contribution_implementation',
      'The exact monitored source snapshot is not cited by this candidate evidence graph.',
    )
  }
  for (const sourceId of sourceIds) {
    const freshness = freshnessBySource.get(sourceId)
    const boundPendingSnapshotId =
      contributionImplementation?.sourceId === sourceId
        ? contributionImplementation.sourceSnapshotId
        : null
    const directlyCitedSnapshotIds = uniqueSorted(
      citedSnapshotRows
        .filter((snapshot) => snapshot.sourceId === sourceId)
        .map((snapshot) => snapshot.id),
    )
    const currentReviewableSnapshotId = boundPendingSnapshotId ?? freshness?.currentSnapshotId
    const currentReviewableSnapshot = currentReviewableSnapshotId
      ? citedSnapshotRows.find((snapshot) => snapshot.id === currentReviewableSnapshotId)
      : null
    const predecessorSnapshotId = boundPendingSnapshotId
      ? (freshness?.currentSnapshotId ?? null)
      : (currentReviewableSnapshot?.previousSnapshotId ?? null)
    const allowedCitationSnapshotIds = [currentReviewableSnapshotId, predecessorSnapshotId]
    const directlyCitesCurrentSnapshot =
      !!currentReviewableSnapshotId &&
      (claimSourceRows.some((link) => link.sourceSnapshotId === currentReviewableSnapshotId) ||
        trialRows.some((trial) => trial.registrySnapshotId === currentReviewableSnapshotId))
    if (
      !freshness?.currentSnapshotId ||
      !currentReviewableSnapshot ||
      directlyCitedSnapshotIds.length === 0 ||
      !directlyCitesCurrentSnapshot ||
      directlyCitedSnapshotIds.some(
        (snapshotId) => !allowedCitationSnapshotIds.includes(snapshotId),
      )
    ) {
      throw new ProgrammeVerdictProposalError(
        'unbound_engine_evidence',
        `Every direct citation for source ${sourceId} must use its exact current reviewable snapshot or an unchanged binding retained from the exact previous publication.`,
      )
    }
    if (
      boundPendingSnapshotId &&
      (freshness.pendingSnapshotId !== boundPendingSnapshotId ||
        !directlyCitedSnapshotIds.includes(boundPendingSnapshotId) ||
        !freshness.currentSnapshotId ||
        !snapshotDescendsFrom(sourceId, boundPendingSnapshotId, freshness.currentSnapshotId))
    ) {
      throw new ProgrammeVerdictProposalError(
        'invalid_contribution_implementation',
        `The accepted contribution is not bound to source ${sourceId}’s exact pending snapshot and immutable current-snapshot lineage.`,
      )
    }

    if (predecessorSnapshotId && directlyCitedSnapshotIds.includes(predecessorSnapshotId)) {
      const claimBindingWasPublished = (link: ClaimSourceLinkRow) =>
        previousClaimSourceRows.some(
          (previous) =>
            previous.programmeId === link.programmeId &&
            previous.claimId === link.claimId &&
            previous.sourceSnapshotId === link.sourceSnapshotId &&
            previous.relationship === link.relationship &&
            previous.sourceLocator === link.sourceLocator,
        )
      const trialBindingWasPublished = (trial: TrialRow) =>
        previousTrialSnapshotRows.some(
          (previous) =>
            previous.programmeId === trial.programmeId &&
            previous.programmeTrialId === trial.id &&
            previous.registrySourceId === trial.registrySourceId &&
            previous.registrySnapshotId === trial.registrySnapshotId,
        )
      const timelineBindingWasPublished = (event: TimelineEventRow) =>
        previousTimelineEventRows.some(
          (previous) =>
            previous.programmeId === event.programmeId &&
            previous.eventKey === event.eventKey &&
            previous.sourceId === event.sourceId &&
            previous.sourceSnapshotId === event.sourceSnapshotId,
        )
      if (
        claimSourceRows.some(
          (link) =>
            link.sourceSnapshotId === predecessorSnapshotId && !claimBindingWasPublished(link),
        ) ||
        trialRows.some(
          (trial) =>
            trial.registrySnapshotId === predecessorSnapshotId && !trialBindingWasPublished(trial),
        ) ||
        timelineEvents.some(
          (event) =>
            event.sourceSnapshotId === predecessorSnapshotId && !timelineBindingWasPublished(event),
        )
      ) {
        throw new ProgrammeVerdictProposalError(
          'unbound_engine_evidence',
          `Source ${sourceId}’s previously published snapshot may remain only on an unchanged claim, trial, or timeline binding from the exact previous publication.`,
        )
      }
    }
    if (freshness.pendingSnapshotId && freshness.pendingSnapshotId !== boundPendingSnapshotId) {
      throw new ProgrammeVerdictProposalError(
        'pending_evidence_review',
        `Source ${sourceId} has a pending snapshot that requires review.`,
      )
    }
  }

  const dependencyRows = await tx
    .select()
    .from(programmeDependencies)
    .where(
      and(
        eq(programmeDependencies.programmeId, programme.id),
        or(
          eq(programmeDependencies.verdictRevisionId, candidate.id),
          ...(nodeIds.length > 0 ? [inArray(programmeDependencies.evidenceNodeId, nodeIds)] : []),
          and(
            isNull(programmeDependencies.verdictRevisionId),
            isNull(programmeDependencies.evidenceNodeId),
            inArray(programmeDependencies.claimId, reviewedClaimIds),
          ),
        ),
      ),
    )
    .orderBy(
      asc(programmeDependencies.dependentSurfaceType),
      asc(programmeDependencies.fieldPath),
      asc(programmeDependencies.claimId),
      asc(programmeDependencies.id),
    )
    .for('share')
  const reviewedClaimSet = new Set(reviewedClaimIds)
  if (dependencyRows.some((row) => !reviewedClaimSet.has(row.claimId))) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'Every proposal dependency must resolve to a claim revision in the reviewed graph.',
    )
  }
  const unrelatedTimelineDependency = dependencyRows.find(
    (row) =>
      row.dependentSurfaceType === 'TIMELINE' &&
      !(
        trialIds.some((trialId) => row.fieldPath.startsWith(`trial.${trialId}.`)) ||
        (row.verdictRevisionId === candidate.id &&
          timelineEvents.some((event) => row.fieldPath.startsWith(`timeline.${event.eventKey}.`)))
      ),
  )
  if (unrelatedTimelineDependency) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      `Timeline dependency ${unrelatedTimelineDependency.id} does not target a trial in the exact candidate bundle.`,
    )
  }
  const unrelatedProgrammeStatusDependency = dependencyRows.find(
    (row) =>
      row.dependentSurfaceType === 'PROGRAMME_STATUS' && !row.fieldPath.startsWith('programme.'),
  )
  if (unrelatedProgrammeStatusDependency) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      `Programme-status dependency ${unrelatedProgrammeStatusDependency.id} does not target this programme's canonical field vocabulary.`,
    )
  }

  const summaryClaims = new Map<ProgrammeSummaryFieldPath, string[]>()
  for (const path of PROGRAMME_SUMMARY_FIELD_PATHS) summaryClaims.set(path, [])
  const verdictClaims = new Map<ProgrammeVerdictFieldPath, string[]>()
  for (const path of PROGRAMME_VERDICT_FIELD_PATHS) verdictClaims.set(path, [])
  for (const dependency of dependencyRows) {
    if (
      dependency.verdictRevisionId !== candidate.id ||
      dependency.impactLevel === 'LOW_RISK_EXACT_DATA'
    ) {
      continue
    }
    if (
      dependency.dependentSurfaceType === 'PROGRAMME_SUMMARY' &&
      PROGRAMME_SUMMARY_FIELD_PATHS.includes(dependency.fieldPath as ProgrammeSummaryFieldPath)
    ) {
      summaryClaims.get(dependency.fieldPath as ProgrammeSummaryFieldPath)?.push(dependency.claimId)
    }
    if (
      dependency.dependentSurfaceType === 'VERDICT' &&
      PROGRAMME_VERDICT_FIELD_PATHS.includes(dependency.fieldPath as ProgrammeVerdictFieldPath)
    ) {
      verdictClaims.get(dependency.fieldPath as ProgrammeVerdictFieldPath)?.push(dependency.claimId)
    }
  }
  for (const path of PROGRAMME_SUMMARY_FIELD_PATHS) {
    const ids = uniqueSorted(summaryClaims.get(path) ?? [])
    summaryClaims.set(path, ids)
    if (ids.length === 0) {
      throw new ProgrammeVerdictProposalError(
        'missing_summary_dependency',
        `${path} requires a reviewed, revision-scoped claim dependency.`,
      )
    }
  }
  for (const path of requiredVerdictPaths()) {
    const ids = uniqueSorted(verdictClaims.get(path) ?? [])
    verdictClaims.set(path, ids)
    if (ids.length === 0) {
      throw new ProgrammeVerdictProposalError(
        'missing_verdict_dependency',
        `${path} requires a reviewed, revision-scoped claim dependency.`,
      )
    }
  }

  const reviewTaskRows = await tx
    .select()
    .from(evidenceReviewTasks)
    .where(eq(evidenceReviewTasks.programmeId, programme.id))
    .orderBy(asc(evidenceReviewTasks.id))
    .for('share')
  let boundSourceReviewTask: typeof evidenceReviewTasks.$inferSelect | null = null
  let boundSourceReviewDelta: typeof evidenceReviewTaskSourceDeltas.$inferSelect | null = null
  if (contributionImplementation?.sourceReviewTaskId) {
    const boundTask = reviewTaskRows.find(
      (task) => task.id === contributionImplementation.sourceReviewTaskId,
    )
    if (
      !boundTask ||
      !OPEN_REVIEW_TASK_STATUSES.has(boundTask.status) ||
      boundTask.sourceId !== contributionImplementation.sourceId ||
      boundTask.triggerSnapshotId !== contributionImplementation.sourceSnapshotId
    ) {
      throw new ProgrammeVerdictProposalError(
        'invalid_contribution_implementation',
        'The monitored source task bound to this contribution is stale or no longer open.',
      )
    }
    boundSourceReviewTask = boundTask
    const deltaRows = await tx
      .select()
      .from(evidenceReviewTaskSourceDeltas)
      .where(
        eq(
          evidenceReviewTaskSourceDeltas.reviewTaskId,
          contributionImplementation.sourceReviewTaskId,
        ),
      )
      .limit(1)
      .for('share')
    const delta = deltaRows[0] ?? null
    if (
      delta &&
      (delta.programmeId !== programme.id ||
        delta.sourceId !== boundTask.sourceId ||
        delta.pendingSnapshotId !== boundTask.triggerSnapshotId)
    ) {
      throw new ProgrammeVerdictProposalError(
        'invalid_contribution_implementation',
        'The monitored source task has a mismatched immutable field-level delta.',
      )
    }
    boundSourceReviewDelta = delta
  }
  const relevantSurfacePaths = new Set(
    dependencyRows.flatMap((row) => [
      row.fieldPath,
      `${row.dependentSurfaceType}:${row.fieldPath}`,
      ...(row.verdictRevisionId
        ? [`${row.dependentSurfaceType}:${row.verdictRevisionId}:${row.fieldPath}`]
        : []),
      ...(row.evidenceNodeId
        ? [`${row.dependentSurfaceType}:${row.evidenceNodeId}:${row.fieldPath}`]
        : []),
    ]),
  )
  const unresolvedTask = reviewTaskRows.find(
    (task) =>
      task.id !== contributionImplementation?.sourceReviewTaskId &&
      OPEN_REVIEW_TASK_STATUSES.has(task.status) &&
      BLOCKING_IMPACTS.has(task.impactLevel) &&
      (sourceIds.includes(task.sourceId) ||
        task.affectedClaimIds.some((id) => reviewedClaimSet.has(id)) ||
        task.affectedSurfacePaths.some((path) => relevantSurfacePaths.has(path)) ||
        task.programmeId === programme.id),
  )
  if (unresolvedTask) {
    throw new ProgrammeVerdictProposalError(
      'pending_evidence_review',
      `Evidence review task ${unresolvedTask.id} must be resolved before this proposal can be reviewed.`,
    )
  }

  const sourceIdsByClaim = new Map<string, string[]>()
  for (const claimId of reviewedClaimIds) {
    sourceIdsByClaim.set(
      claimId,
      uniqueSorted(
        claimSourceRows
          .filter((link) => link.claimId === claimId)
          .map(
            (link) =>
              snapshotRows.find((snapshot) => snapshot.id === link.sourceSnapshotId)?.sourceId ??
              '',
          )
          .filter(Boolean),
      ),
    )
  }

  const supportingSnapshotIdsByClaim = new Map<string, string[]>()
  for (const claimId of reviewedClaimIds) {
    supportingSnapshotIdsByClaim.set(
      claimId,
      uniqueSorted(
        claimSourceRows
          .filter((link) => link.claimId === claimId && link.relationship === 'SUPPORTS')
          .map((link) => link.sourceSnapshotId),
      ),
    )
  }
  const claimById = new Map(claimRows.map((claim) => [claim.id, claim]))
  const presentationSource = (
    sourceSnapshotId: string,
    targetClaimLinks: readonly ProgrammePresentationClaimLinkReadModel[],
  ): ProgrammePresentationSourceReadModel => {
    const snapshot = snapshotRows.find((row) => row.id === sourceSnapshotId)
    const source = snapshot
      ? reviewedSourceRows.find((row) => row.id === snapshot.sourceId)
      : undefined
    if (!snapshot || !source) {
      throw new ProgrammeVerdictProposalError(
        'invalid_presentation',
        'Every presentation source must resolve to exact signed source and snapshot rows.',
      )
    }
    return {
      sourceId: source.id,
      sourceSnapshotId: snapshot.id,
      sourceType: source.sourceType,
      externalIdentifier: source.externalIdentifier,
      canonicalLocator: source.canonicalLocator,
      title: source.title,
      publisher: source.publisher,
      publicationDate: source.publicationDate,
      retrievedAt: snapshot.retrievedAt.toISOString(),
      contentHash: snapshot.contentHash,
      claimBindings: targetClaimLinks.flatMap((link) => {
        if (!(supportingSnapshotIdsByClaim.get(link.claimId) ?? []).includes(snapshot.id)) return []
        const claim = claimById.get(link.claimId)
        if (!claim) {
          throw new ProgrammeVerdictProposalError(
            'invalid_presentation',
            'Every presentation source binding must resolve to an exact reviewed claim.',
          )
        }
        return [
          {
            claimId: link.claimId,
            relationship: link.relationship,
            plainLanguageText: claim.plainLanguageText,
          },
        ]
      }),
    }
  }
  const presentation: ProgrammePresentationReadModel | null =
    candidate.presentationSchemaVersion === 'programme-presentation/v1'
      ? {
          schemaVersion: 'programme-presentation/v1',
          mechanismSteps: mechanismSteps.map((step) => {
            const claimLinks = mechanismStepClaimLinks
              .filter((link) => link.stepKey === step.stepKey)
              .map(({ claimId, relationship }) => ({ claimId, relationship }))
            const sourceSnapshotIds = uniqueSorted(
              claimLinks.flatMap((link) => supportingSnapshotIdsByClaim.get(link.claimId) ?? []),
            )
            return {
              stepKey: step.stepKey,
              stepOrder: step.stepOrder,
              plainTitle: step.plainTitle,
              plainDescription: step.plainDescription,
              technicalDescription: step.technicalDescription,
              evidenceBasis: step.evidenceBasis,
              claimLinks,
              sources: sourceSnapshotIds.map((snapshotId) =>
                presentationSource(snapshotId, claimLinks),
              ),
            }
          }),
          timelineEvents: timelineEvents.map((event) => {
            const claimLinks = timelineEventClaimLinks
              .filter((link) => link.eventKey === event.eventKey)
              .map(({ claimId, relationship }) => ({ claimId, relationship }))
            return {
              eventKey: event.eventKey,
              eventDate: event.eventDate,
              eventType: event.eventType,
              dateBasis: event.dateBasis,
              plainTitle: event.plainTitle,
              plainDescription: event.plainDescription,
              technicalDescription: event.technicalDescription,
              programmeTrialId: event.programmeTrialId,
              sourceId: event.sourceId,
              sourceSnapshotId: event.sourceSnapshotId,
              claimLinks,
              source: presentationSource(event.sourceSnapshotId, claimLinks),
            }
          }),
        }
      : null
  const enginePresentation: EvidenceProgrammePresentation | undefined = presentation
    ? {
        schemaVersion: presentation.schemaVersion,
        verdictRevisionId: candidate.id,
        programmeId: programme.id,
        mechanismSteps: presentation.mechanismSteps.map((step) => ({
          id: step.stepKey,
          programmeId: programme.id,
          order: step.stepOrder,
          plainTitle: step.plainTitle,
          plainDescription: step.plainDescription,
          ...(step.technicalDescription ? { technicalDescription: step.technicalDescription } : {}),
          evidenceBasis: step.evidenceBasis,
          claimLinks: step.claimLinks.map((link) => ({
            ...link,
            supportingSourceSnapshotIds: supportingSnapshotIdsByClaim.get(link.claimId) ?? [],
          })),
        })),
        timelineEvents: presentation.timelineEvents.map((event) => ({
          id: event.eventKey,
          programmeId: programme.id,
          date: event.eventDate,
          eventType: event.eventType,
          dateBasis: event.dateBasis,
          plainTitle: event.plainTitle,
          plainDescription: event.plainDescription,
          ...(event.technicalDescription
            ? { technicalDescription: event.technicalDescription }
            : {}),
          ...(event.programmeTrialId ? { trialId: event.programmeTrialId } : {}),
          sourceId: event.sourceId,
          sourceSnapshotId: event.sourceSnapshotId,
          claimLinks: event.claimLinks.map((link) => ({
            ...link,
            supportingSourceSnapshotIds: supportingSnapshotIdsByClaim.get(link.claimId) ?? [],
          })),
        })),
      }
    : undefined

  const engineClaims: EvidenceClaim[] = claimRows.map((claim) => ({
    id: claim.id,
    medicineId: programme.drugId,
    programmeId: programme.id,
    isProgrammeLevel: true,
    ...(claim.programmeTrialId ? { trialId: claim.programmeTrialId } : {}),
    ...(claim.evidenceNodeType ? { evidenceNodeType: claim.evidenceNodeType } : {}),
    nature: claim.nature,
    direction: claim.direction,
    plainLanguageText: claim.plainLanguageText,
    ...(claim.technicalText ? { technicalText: claim.technicalText } : {}),
    sourceIds: sourceIdsByClaim.get(claim.id) ?? [],
    ...(claim.numericValue === null ? {} : { numericValue: claim.numericValue }),
    numericUnitRequired: claim.numericUnitRequired,
    ...(claim.numericUnit ? { unit: claim.numericUnit } : {}),
    ...(claim.resultDate ? { resultDate: claim.resultDate } : {}),
    ...(claim.participantOutcome === null ? {} : { participantOutcome: claim.participantOutcome }),
    ...(claim.comparatorValue
      ? {
          comparatorResult: {
            value: claim.comparatorValue,
            ...(claim.comparatorGroup ? { group: claim.comparatorGroup } : {}),
          },
        }
      : {}),
    ...(endpointHierarchy(claim.endpointHierarchy)
      ? { endpointHierarchy: endpointHierarchy(claim.endpointHierarchy) }
      : {}),
    ...(outcomeType(claim.outcomeType) ? { outcomeType: outcomeType(claim.outcomeType) } : {}),
    ...(claim.presentedAsPatientBenefit === null
      ? {}
      : { presentedAsPatientBenefit: claim.presentedAsPatientBenefit }),
    ...(claim.exploratoryNatureDisclosed === null
      ? {}
      : { exploratoryNatureDisclosed: claim.exploratoryNatureDisclosed }),
    stoppingReason: claim.stoppingReason,
    ...(claim.conflictsWithClaimIds.length > 0
      ? { conflictsWithClaimIds: uniqueSorted(claim.conflictsWithClaimIds) }
      : {}),
    ...(timestampDate(claim.lastVerifiedAt)
      ? { lastVerifiedDate: timestampDate(claim.lastVerifiedAt) }
      : {}),
  }))

  const engineTrials: EvidenceTrial[] = trialRows.map((trial) => ({
    id: trial.id,
    registrationId: trial.trialIdentifier,
    medicineId: programme.drugId,
    programmeId: programme.id,
    indication: programme.indication ?? '',
    subjectType: trialSubjectType(trial),
    ...(dateValue(trial.startDate) ? { startDate: dateValue(trial.startDate) } : {}),
    ...(dateValue(trial.completionDate) ? { endDate: dateValue(trial.completionDate) } : {}),
    resultsStatus: trial.resultsStatus,
  }))

  const assessmentSupportingClaimIds = (criterion: StudyInterpretabilityCriterion): string[] => {
    const assessmentIdsForCriterion = new Set(
      assessmentRows.filter((row) => row.criterion === criterion).map((row) => row.id),
    )
    return uniqueSorted(
      assessmentClaimLinks
        .filter(
          (link) =>
            link.relationship === 'SUPPORTS' && assessmentIdsForCriterion.has(link.assessmentId),
        )
        .map((link) => link.claimId),
    )
  }
  const studyInterpretability: StudyInterpretability | undefined =
    assessmentRows.length === 0
      ? undefined
      : {
          statisticalPower: aggregateInterpretabilityState(assessmentRows, 'STATISTICAL_POWER'),
          populationSelection: aggregateInterpretabilityState(
            assessmentRows,
            'POPULATION_SELECTION',
          ),
          exposureAdequacy: aggregateInterpretabilityState(
            assessmentRows,
            'DOSE_EXPOSURE_ADEQUACY',
          ),
          endpointValidity: aggregateInterpretabilityState(assessmentRows, 'ENDPOINT_VALIDITY'),
          durationAndOperationalIntegrity: aggregateInterpretabilityState(
            assessmentRows,
            'DURATION_OPERATIONAL_INTEGRITY',
          ),
          supportingClaimIdsByCriterion: {
            STATISTICAL_POWER: assessmentSupportingClaimIds('STATISTICAL_POWER'),
            POPULATION_SELECTION: assessmentSupportingClaimIds('POPULATION_SELECTION'),
            DOSE_EXPOSURE_ADEQUACY: assessmentSupportingClaimIds('DOSE_EXPOSURE_ADEQUACY'),
            ENDPOINT_VALIDITY: assessmentSupportingClaimIds('ENDPOINT_VALIDITY'),
            DURATION_OPERATIONAL_INTEGRITY: assessmentSupportingClaimIds(
              'DURATION_OPERATIONAL_INTEGRITY',
            ),
          },
        }

  const stoppingReasonClaimIds = uniqueSorted(
    claimRows.filter((claim) => claim.stoppingReason).map((claim) => claim.id),
  )
  const engineNodes: EvidenceNode[] = nodeRows.map((node) => ({
    id: node.id,
    programmeId: programme.id,
    type: node.nodeType,
    state: node.state,
    visible: node.visible,
    supportingClaimIds: uniqueSorted(
      nodeClaimLinks
        .filter((link) => link.evidenceNodeId === node.id && link.relationship === 'SUPPORTS')
        .map((link) => link.claimId),
    ),
    contradictingClaimIds: uniqueSorted(
      nodeClaimLinks
        .filter((link) => link.evidenceNodeId === node.id && link.relationship === 'CONTRADICTS')
        .map((link) => link.claimId),
    ),
    ...(node.presentedAsPositive === null ? {} : { presentedAsPositive: node.presentedAsPositive }),
    ...(node.presentedAsNegative === null ? {} : { presentedAsNegative: node.presentedAsNegative }),
  }))

  const contradictoryClaimIds = uniqueSorted(
    verdictClaimLinks
      .filter((link) => link.relationship === 'CONTRADICTORY')
      .map((link) => link.claimId),
  )
  const candidateLimitationClaimIds = uniqueSorted(
    verdictClaimLinks
      .filter((link) => link.relationship === 'CANDIDATE_LIMITATION')
      .map((link) => link.claimId),
  )
  const engineVerdicts: ProgrammeVerdict[] = candidate.verdictCode
    ? [
        {
          id: candidate.id,
          medicineId: programme.drugId,
          programmeId: programme.id,
          code: candidate.verdictCode,
          scope: {
            indication: candidate.indicationScope,
            population: candidate.populationScope,
            doseOrExposure: candidate.doseExposureScope,
            period: candidate.periodScope,
            trialIds,
            outcome: candidate.outcomeScope,
          },
          supportingClaimIds,
          contradictoryClaimIds,
          candidateLimitationClaimIds,
          reviewStatus: 'AWAITING_REVIEW',
          sourceDependent: candidate.sourceDependent,
          ...(candidate.adjudicationRationale && candidate.adjudicatorUserId
            ? {
                adjudicatedException: {
                  rationale: candidate.adjudicationRationale,
                  adjudicatorId: candidate.adjudicatorUserId,
                },
              }
            : {}),
        },
      ]
    : []

  const engineSources: EvidenceSource[] = reviewedSourceRows.map((source) => {
    const trial = trialRows.find((row) => row.registrySourceId === source.id)
    return {
      id: source.id,
      sourceType: source.sourceType,
      externalIdentifier: source.externalIdentifier ?? '',
      canonicalLocator: source.canonicalLocator,
      title: source.title ?? '',
      publisher: source.publisher ?? '',
      hierarchy: source.hierarchy,
      resolutionStatus: sourceResolutionStatus(freshnessBySource.get(source.id)),
      ...(source.publicationDate ? { publicationDate: source.publicationDate } : {}),
      correctionStatus: source.correctionStatus,
      programmeId: programme.id,
      ...(trial ? { trialId: trial.id } : {}),
      ...(source.jurisdiction ? { jurisdiction: source.jurisdiction } : {}),
    }
  })

  const sourceClaimDependencies: EvidenceDependency[] = uniqueSorted(
    claimSourceRows.map((link) => {
      const sourceId = snapshotRows.find(
        (snapshot) => snapshot.id === link.sourceSnapshotId,
      )?.sourceId
      return sourceId ? `${sourceId}\u001f${link.claimId}` : ''
    }),
  )
    .filter(Boolean)
    .map((key) => {
      const [sourceId, claimId] = key.split('\u001f') as [string, string]
      return {
        from: { type: 'SOURCE' as const, id: sourceId },
        to: { type: 'CLAIM' as const, id: claimId },
        impact: strongestImpact(
          dependencyRows
            .filter((dependency) => dependency.claimId === claimId)
            .map((dependency) => dependency.impactLevel),
        ),
      }
    })
  const engineDependencies: EvidenceDependency[] = [
    ...sourceClaimDependencies,
    ...dependencyRows.map((dependency) => ({
      from: { type: 'CLAIM' as const, id: dependency.claimId },
      to: dependencyTarget(dependency, candidate.id, programme.id),
      impact: dependency.impactLevel,
    })),
  ]
  const engineChanges: EvidenceChange[] = boundSourceReviewTask
    ? [
        {
          entity: {
            type: 'SOURCE',
            id: boundSourceReviewTask.sourceId,
          },
          // A SOURCE change must name fields on the source itself. The parser-derived delta is
          // authoritative when present; affectedSurfacePaths names downstream review targets and
          // may correctly be empty when a registry source does not support a reviewed claim.
          // Keep the task paths only as a compatibility fallback for legacy task-bound
          // corrections that predate persisted structured source deltas.
          changedFields: uniqueSorted(
            boundSourceReviewDelta
              ? boundSourceReviewDelta.changedTrialFields.map((change) => change.path)
              : boundSourceReviewTask.affectedSurfacePaths,
          ),
          snapshotId: boundSourceReviewTask.triggerSnapshotId,
        },
      ]
    : []
  const engineInput: EvidenceIntelligenceInput = {
    asOfDate: candidate.proposalAsOfDate,
    medicine: { id: programme.drugId },
    programmes: [
      {
        id: programme.id,
        medicineId: programme.drugId,
        indication: programme.indication ?? '',
        population: programme.targetPopulation ?? '',
        ...(programme.doseExposureContext ? { doseOrExposure: programme.doseExposureContext } : {}),
        ...(programme.jurisdiction ? { jurisdiction: programme.jurisdiction } : {}),
        status: programme.status,
        ...(dateValue(programme.startDate) ? { startDate: dateValue(programme.startDate) } : {}),
        ...(dateValue(programme.endDate) ? { endDate: dateValue(programme.endDate) } : {}),
        currentVerdictId: candidate.verdictCode ? candidate.id : undefined,
        stoppingReasonCategory: programme.stoppingReasonCategory,
        ...(stoppingReasonClaimIds.length > 0 ? { stoppingReasonClaimIds } : {}),
        ...(studyInterpretability ? { studyInterpretability } : {}),
      },
    ],
    trials: engineTrials,
    sources: engineSources,
    sourceSnapshots: snapshotRows.map((snapshot) => ({
      id: snapshot.id,
      sourceId: snapshot.sourceId,
      retrievedAt: snapshot.retrievedAt.toISOString(),
      contentHash: snapshot.contentHash,
      ...(snapshot.previousSnapshotId ? { previousSnapshotId: snapshot.previousSnapshotId } : {}),
    })),
    claims: engineClaims,
    evidenceNodes: engineNodes,
    verdicts: engineVerdicts,
    ...(enginePresentation ? { presentation: enginePresentation } : {}),
    tenSecondSummaries: [
      {
        id: `${candidate.id}:summary`,
        programmeId: programme.id,
        plainMechanism: {
          text: candidate.plainMechanism ?? '',
          supportingClaimIds: summaryClaims.get('summary.plainMechanism') ?? [],
        },
        bestSupportedFinding: {
          text: candidate.bestSupportedFinding ?? '',
          supportingClaimIds: summaryClaims.get('summary.bestSupportedFinding') ?? [],
        },
        mainLimitation: {
          text: candidate.mainLimitation ?? '',
          supportingClaimIds: summaryClaims.get('summary.mainLimitation') ?? [],
        },
      },
    ],
    plainLanguageSections: [
      ...plainLanguageSections(candidate),
      ...(enginePresentation
        ? presentationPlainLanguageSections(candidate.id, mechanismSteps, timelineEvents)
        : []),
    ],
    dependencies: engineDependencies,
    changes: engineChanges,
  }
  const report = runEvidenceIntelligence(engineInput)
  if (!report.canPublish) {
    throw new ProgrammeVerdictProposalError(
      'engine_blocked',
      `RNA Intelligence blocked proposal preparation with ${report.blocks.length} finding(s): ${report.blocks
        .slice(0, 3)
        .map((finding) => finding.code)
        .join(', ')}.`,
    )
  }

  const proposalDigest = sha256({
    schemaVersion: presentation ? 'programme-verdict-proposal/v2' : 'programme-verdict-proposal/v1',
    candidate: canonicalCandidate(candidate),
    expectedCurrentRevisionId: previousRevisionId,
    contributionImplementation,
    sourceReviewTask: boundSourceReviewTask
      ? {
          id: boundSourceReviewTask.id,
          sourceId: boundSourceReviewTask.sourceId,
          triggerSnapshotId: boundSourceReviewTask.triggerSnapshotId,
          impactLevel: boundSourceReviewTask.impactLevel,
          reason: boundSourceReviewTask.reason,
          affectedClaimIds: uniqueSorted(boundSourceReviewTask.affectedClaimIds),
          affectedSurfacePaths: uniqueSorted(boundSourceReviewTask.affectedSurfacePaths),
          sourceDelta: boundSourceReviewDelta
            ? {
                schemaVersion: boundSourceReviewDelta.schemaVersion,
                action: boundSourceReviewDelta.action,
                baselineSnapshotId: boundSourceReviewDelta.baselineSnapshotId,
                pendingSnapshotId: boundSourceReviewDelta.pendingSnapshotId,
                adapterKey: boundSourceReviewDelta.adapterKey,
                changedTrialFields: boundSourceReviewDelta.changedTrialFields,
                affectedClaimIds: uniqueSorted(boundSourceReviewDelta.affectedClaimIds),
                affectedInterpretability: boundSourceReviewDelta.affectedInterpretability,
                affectedSurfacePaths: uniqueSorted(boundSourceReviewDelta.affectedSurfacePaths),
                scientificRevisionRequirements:
                  boundSourceReviewDelta.scientificRevisionRequirements,
                deltaDigestAlgorithm: boundSourceReviewDelta.deltaDigestAlgorithm,
                deltaDigest: boundSourceReviewDelta.deltaDigest,
              }
            : null,
        }
      : null,
    trialLinks: trialIds,
    evidenceNodeLinks: nodeIds,
    interpretabilityAssessmentLinks: assessmentIds,
    verdictClaimLinks,
    nodeClaimLinks,
    assessmentClaimLinks,
    ...(presentation
      ? {
          presentation,
          mechanismStepClaimLinks,
          timelineEventClaimLinks,
        }
      : {}),
    claimSourceLinks: claimSourceRows,
    dependencies: dependencyRows.map((row) => ({
      id: row.id,
      claimId: row.claimId,
      dependentSurfaceType: row.dependentSurfaceType,
      evidenceNodeId: row.evidenceNodeId,
      verdictRevisionId: row.verdictRevisionId,
      fieldPath: row.fieldPath,
      impactLevel: row.impactLevel,
    })),
    freshness: freshnessRows.map((row) => ({
      programmeId: row.programmeId,
      sourceId: row.sourceId,
      currentSnapshotId: row.currentSnapshotId,
      pendingSnapshotId: row.pendingSnapshotId,
      checkStatus: row.checkStatus,
      freshnessStatus: row.freshnessStatus,
      lastSuccessfulCheckAt: row.lastSuccessfulCheckAt?.toISOString() ?? null,
      lastVerifiedAt: row.lastVerifiedAt?.toISOString() ?? null,
    })),
    engineVersion: report.engineVersion,
    inputDigestAlgorithm: report.inputDigestAlgorithm,
    inputDigest: report.inputDigest,
    engineInput,
    // Bind the complete scientific persistence rows, not only the narrower engine projection. This
    // makes a post-review change to trial metadata, claim wording, interpretability rationale,
    // source metadata or immutable snapshot content invalidate the review bundle deterministically.
    persistedGraph: {
      programme: {
        id: programme.id,
        drugId: programme.drugId,
        slug: programme.slug,
        title: programme.title,
        indication: programme.indication,
        targetPopulation: programme.targetPopulation,
        jurisdiction: programme.jurisdiction,
        sponsor: programme.sponsor,
        partners: programme.partners,
        status: programme.status,
        highestPhaseReached: programme.highestPhaseReached,
        route: programme.route,
        doseExposureContext: programme.doseExposureContext,
        startDate: programme.startDate,
        endDate: programme.endDate,
        rawStoppingReason: programme.rawStoppingReason,
        stoppingReasonCategory: programme.stoppingReasonCategory,
      },
      trials: trialRows.map(({ createdAt: _createdAt, updatedAt: _updatedAt, ...trial }) => trial),
      claims: claimRows.map(({ createdAt: _createdAt, ...claim }) => claim),
      evidenceNodes: nodeRows.map(({ createdAt: _createdAt, ...node }) => node),
      interpretabilityAssessments: assessmentRows.map(
        ({ createdAt: _createdAt, ...assessment }) => assessment,
      ),
      sources: reviewedSourceRows.map(
        ({ createdAt: _createdAt, updatedAt: _updatedAt, ...source }) => source,
      ),
      sourceSnapshots: snapshotRows.map(({ createdAt: _createdAt, ...snapshot }) => snapshot),
      ...(presentation
        ? {
            mechanismSteps: mechanismSteps.map(({ createdAt: _createdAt, ...step }) => step),
            timelineEvents: timelineEvents.map(({ createdAt: _createdAt, ...event }) => event),
          }
        : {}),
    },
  })

  return {
    revisionId: candidate.id,
    programmeId: programme.id,
    proposalDigestAlgorithm: 'sha256',
    proposalDigest,
    engineVersion: report.engineVersion,
    inputDigestAlgorithm: report.inputDigestAlgorithm,
    inputDigest: report.inputDigest,
    candidate,
    programme,
    previousRevisionId,
    engineInput,
    reviewedTrialIds: trialIds,
    reviewedTrials: trialRows,
    reviewedClaimIds,
    reviewedClaims: claimRows,
    reviewedEvidenceNodeIds: nodeIds,
    reviewedEvidenceNodes: nodeRows,
    reviewedInterpretabilityAssessmentIds: assessmentIds,
    reviewedInterpretabilityAssessments: assessmentRows,
    reviewedSourceIds: sourceIds,
    reviewedSources: reviewedSourceRows,
    reviewedSourceSnapshotIds,
    reviewedSourceSnapshots: snapshotRows,
    verdictClaimLinks,
    nodeClaimLinks,
    assessmentClaimLinks,
    mechanismSteps,
    mechanismStepClaimLinks,
    timelineEvents,
    timelineEventClaimLinks,
    presentation,
    claimSourceLinks: claimSourceRows,
    dependencies: dependencyRows,
    summaryClaims,
    verdictClaims,
    contributionImplementation,
  }
}

async function persistVerdictScopedMetadata(
  tx: Transaction,
  proposal: LockedProgrammeVerdictProposal,
): Promise<void> {
  const programme = proposal.programme
  await tx
    .insert(programmeVerdictScopeSnapshots)
    .values({
      verdictRevisionId: proposal.revisionId,
      programmeId: proposal.programmeId,
      drugId: programme.drugId,
      slug: programme.slug,
      title: programme.title,
      indication: programme.indication,
      targetPopulation: programme.targetPopulation,
      jurisdiction: programme.jurisdiction,
      sponsor: programme.sponsor,
      partners: programme.partners,
      status: programme.status,
      highestPhaseReached: programme.highestPhaseReached,
      route: programme.route,
      doseExposureContext: programme.doseExposureContext,
      startDate: programme.startDate,
      endDate: programme.endDate,
      rawStoppingReason: programme.rawStoppingReason,
      stoppingReasonCategory: programme.stoppingReasonCategory,
    })
    .onConflictDoNothing()

  await tx
    .insert(programmeVerdictTrialSnapshots)
    .values(
      proposal.reviewedTrials.map((trial) => ({
        verdictRevisionId: proposal.revisionId,
        programmeId: proposal.programmeId,
        programmeTrialId: trial.id,
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
      })),
    )
    .onConflictDoNothing()

  if (proposal.reviewedSourceIds.length === 0) return
  const sources = await tx
    .select()
    .from(evidenceSources)
    .where(inArray(evidenceSources.id, proposal.reviewedSourceIds))
    .orderBy(asc(evidenceSources.id))
    .for('share')
  if (sources.length !== proposal.reviewedSourceIds.length) {
    throw new ProgrammeVerdictProposalError(
      'unbound_engine_evidence',
      'Every reviewed source requires an immutable metadata snapshot.',
    )
  }
  await tx
    .insert(programmeVerdictSourceMetadataSnapshots)
    .values(
      sources.map((source) => ({
        verdictRevisionId: proposal.revisionId,
        programmeId: proposal.programmeId,
        sourceId: source.id,
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
      })),
    )
    .onConflictDoNothing()
}

/** Transaction-scoped preparation used by atomic candidate materialization. */
export async function prepareLockedProgrammeVerdictProposal(
  tx: Transaction,
  revisionId: string,
): Promise<PreparedProgrammeVerdictProposal> {
  const candidateRows = await tx
    .select({ reviewStatus: programmeVerdictRevisions.reviewStatus })
    .from(programmeVerdictRevisions)
    .where(eq(programmeVerdictRevisions.id, revisionId))
    .limit(1)
    .for('update')
  const status = candidateRows[0]?.reviewStatus
  if (!status) {
    throw new ProgrammeVerdictProposalError(
      'revision_not_found',
      'No programme verdict revision matches this id.',
    )
  }
  if (status === 'PUBLISHED' || status === 'SUPERSEDED') {
    throw new ProgrammeVerdictProposalError(
      'immutable_published_revision',
      'Published and superseded verdict revisions are immutable.',
    )
  }
  if (status !== 'DRAFT') {
    throw new ProgrammeVerdictProposalError(
      'not_proposal_candidate',
      `A ${status} proposal cannot be re-prepared; create a new revision.`,
    )
  }

  let proposal = await buildLockedProgrammeVerdictProposal(tx, revisionId)
  await persistVerdictScopedMetadata(tx, proposal)
  // Rebuild from the persisted scope/source snapshots. This is the exact object reviewers sign
  // and the public read later consumes; live catalogue metadata is no longer an implicit input.
  proposal = await buildLockedProgrammeVerdictProposal(tx, revisionId)
  const preparedAt = new Date()
  await tx
    .update(programmeVerdictRevisions)
    .set({
      reviewStatus: 'AWAITING_REVIEW',
      engineVersion: proposal.engineVersion,
      inputDigestAlgorithm: proposal.inputDigestAlgorithm,
      inputDigest: proposal.inputDigest,
      proposalDigestAlgorithm: proposal.proposalDigestAlgorithm,
      proposalDigest: proposal.proposalDigest,
      proposalPreparedAt: preparedAt,
      reviewedAt: null,
    })
    .where(eq(programmeVerdictRevisions.id, revisionId))

  return {
    revisionId: proposal.revisionId,
    programmeId: proposal.programmeId,
    proposalDigestAlgorithm: proposal.proposalDigestAlgorithm,
    proposalDigest: proposal.proposalDigest,
    engineVersion: proposal.engineVersion,
    inputDigestAlgorithm: proposal.inputDigestAlgorithm,
    inputDigest: proposal.inputDigest,
  }
}

/** Prepares and freezes the exact digest reviewers must sign. */
export async function prepareProgrammeVerdictProposal(
  revisionId: string,
): Promise<PreparedProgrammeVerdictProposal> {
  return db.transaction((tx) => prepareLockedProgrammeVerdictProposal(tx, revisionId))
}
