import { and, asc, eq, inArray, sql } from 'drizzle-orm'

import { db, type Db } from '@/db'
import {
  claimSourceLinks,
  claims,
  developmentProgrammes,
  evidenceNodeClaims,
  evidenceNodes,
  evidenceSources,
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
  programmeVerdictTimelineEventClaims,
  programmeVerdictTimelineEvents,
  programmeVerdictTrialSnapshots,
  programmeVerdictTrials,
  sourceSnapshots,
  trialInterpretabilityAssessments,
  trialInterpretabilityClaims,
  users,
} from '@/db/schema'
import { ApiError } from '@/lib/api-response'
import {
  PROGRAMME_SUMMARY_FIELD_PATHS,
  PROGRAMME_VERDICT_FIELD_PATHS,
  isStoppedProgramme,
} from '@/lib/evidence/types'
import {
  PROGRAMME_FIRST_VERDICT_AUTHORING_SCHEMA_VERSION,
  canonicalFirstVerdictBundleDigest,
  canonicalizeFirstVerdictBundle,
  deterministicFirstVerdictId,
  programmeFirstVerdictAuthoringBundleSchema,
  type ProgrammeFirstVerdictAuthoringBundle,
} from '@/lib/programme-first-verdict-authoring'
import {
  buildLockedProgrammeVerdictProposal,
  ProgrammeVerdictProposalError,
  type LockedProgrammeVerdictProposal,
} from '@/lib/queries/programme-verdict-proposal'
import { stableJsonStringify } from '@/lib/stable-json'

type Transaction = Parameters<Parameters<Db['transaction']>[0]>[0]

export type ProgrammeFirstVerdictAuthoringOutcome = 'WOULD_CREATE' | 'CREATED' | 'ALREADY_EXISTS'

interface ProgrammeCompleteVerdictAuthoringResult {
  schemaVersion: typeof PROGRAMME_FIRST_VERDICT_AUTHORING_SCHEMA_VERSION
  mode: 'DRY_RUN' | 'COMMIT'
  outcome: ProgrammeFirstVerdictAuthoringOutcome
  programmeId: string
  revisionId: string
  revisionNumber: number
  previousVerdictRevisionId: string | null
  bundleDigestAlgorithm: 'sha256'
  bundleDigest: string
  reviewStatus: 'DRAFT'
  proposalPreparedAt: null
  reused: boolean
  validation: {
    engineVersion: string
    inputDigestAlgorithm: 'sha256'
    inputDigest: string
    proposalDigestAlgorithm: 'sha256'
    proposalDigest: string
  }
}

export interface ProgrammeFirstVerdictAuthoringResult extends ProgrammeCompleteVerdictAuthoringResult {
  previousVerdictRevisionId: null
}

export interface ProgrammeSuccessorVerdictAuthoringResult extends ProgrammeCompleteVerdictAuthoringResult {
  previousVerdictRevisionId: string
}

export class ProgrammeFirstVerdictAuthoringError extends ApiError {
  constructor(status: number, message: string, code: string, details?: unknown) {
    super(status, message, code, details)
    this.name = 'ProgrammeFirstVerdictAuthoringError'
  }
}

class DryRunRollback extends Error {
  constructor(readonly result: ProgrammeCompleteVerdictAuthoringResult) {
    super('Rollback a validated complete-verdict dry run.')
    this.name = 'DryRunRollback'
  }
}

function exactId(kind: string, revisionId: string, localKey: string): string {
  return deterministicFirstVerdictId([kind, revisionId, localKey])
}

function asDate(value: string | null): Date | null {
  return value === null ? null : new Date(value)
}

function resultFromProposal(args: {
  proposal: LockedProgrammeVerdictProposal
  bundleDigest: string
  mode: 'DRY_RUN' | 'COMMIT'
  outcome: ProgrammeFirstVerdictAuthoringOutcome
  reused: boolean
  previousVerdictRevisionId: string | null
  errorPrefix: 'first_draft' | 'successor_draft'
  draftLabel: string
}): ProgrammeCompleteVerdictAuthoringResult {
  if (
    args.proposal.candidate.reviewStatus !== 'DRAFT' ||
    args.proposal.candidate.proposalPreparedAt !== null ||
    args.proposal.candidate.previousVerdictRevisionId !== args.previousVerdictRevisionId
  ) {
    throw new ProgrammeFirstVerdictAuthoringError(
      500,
      `The ${args.draftLabel} left the required unprepared DRAFT state.`,
      `${args.errorPrefix}_state_invalid`,
    )
  }
  return {
    schemaVersion: PROGRAMME_FIRST_VERDICT_AUTHORING_SCHEMA_VERSION,
    mode: args.mode,
    outcome: args.outcome,
    programmeId: args.proposal.programmeId,
    revisionId: args.proposal.revisionId,
    revisionNumber: args.proposal.candidate.revisionNumber,
    previousVerdictRevisionId: args.previousVerdictRevisionId,
    bundleDigestAlgorithm: 'sha256',
    bundleDigest: args.bundleDigest,
    reviewStatus: 'DRAFT',
    proposalPreparedAt: null,
    reused: args.reused,
    validation: {
      engineVersion: args.proposal.engineVersion,
      inputDigestAlgorithm: 'sha256',
      inputDigest: args.proposal.inputDigest,
      proposalDigestAlgorithm: 'sha256',
      proposalDigest: args.proposal.proposalDigest,
    },
  }
}

function persistedMismatch(
  message: string,
  errorPrefix: 'first_draft' | 'successor_draft' = 'first_draft',
): never {
  throw new ProgrammeFirstVerdictAuthoringError(409, message, `${errorPrefix}_idempotency_conflict`)
}

function sameInstant(left: Date | null, right: Date): boolean {
  return left !== null && left.getTime() === right.getTime()
}

async function validatePersistedServerContext(args: {
  tx: Transaction
  proposal: LockedProgrammeVerdictProposal
  liveProgramme: typeof developmentProgrammes.$inferSelect
  actorName: string
  errorPrefix: 'first_draft' | 'successor_draft'
}): Promise<void> {
  const { tx, proposal, liveProgramme } = args
  const candidate = proposal.candidate
  const [
    scopeRows,
    trialSnapshotRows,
    sourceMetadataRows,
    liveTrialRows,
    liveSourceRows,
    verdictTrialLinks,
    verdictClaimLinks,
    verdictNodeLinks,
    verdictAssessmentLinks,
    mechanismClaimLinks,
    timelineClaimLinks,
    nodeClaimRows,
    assessmentClaimRows,
  ] = await Promise.all([
    tx
      .select()
      .from(programmeVerdictScopeSnapshots)
      .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, candidate.id))
      .for('share'),
    tx
      .select()
      .from(programmeVerdictTrialSnapshots)
      .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, candidate.id))
      .orderBy(asc(programmeVerdictTrialSnapshots.programmeTrialId))
      .for('share'),
    tx
      .select()
      .from(programmeVerdictSourceMetadataSnapshots)
      .where(eq(programmeVerdictSourceMetadataSnapshots.verdictRevisionId, candidate.id))
      .orderBy(asc(programmeVerdictSourceMetadataSnapshots.sourceId))
      .for('share'),
    tx
      .select()
      .from(programmeTrials)
      .where(inArray(programmeTrials.id, proposal.reviewedTrialIds))
      .orderBy(asc(programmeTrials.id))
      .for('share'),
    tx
      .select()
      .from(evidenceSources)
      .where(inArray(evidenceSources.id, proposal.reviewedSourceIds))
      .orderBy(asc(evidenceSources.id))
      .for('share'),
    tx
      .select({ createdAt: programmeVerdictTrials.createdAt })
      .from(programmeVerdictTrials)
      .where(eq(programmeVerdictTrials.verdictRevisionId, candidate.id))
      .for('share'),
    tx
      .select({ createdAt: programmeVerdictClaims.createdAt })
      .from(programmeVerdictClaims)
      .where(eq(programmeVerdictClaims.verdictRevisionId, candidate.id))
      .for('share'),
    tx
      .select({ createdAt: programmeVerdictEvidenceNodes.createdAt })
      .from(programmeVerdictEvidenceNodes)
      .where(eq(programmeVerdictEvidenceNodes.verdictRevisionId, candidate.id))
      .for('share'),
    tx
      .select({ createdAt: programmeVerdictInterpretabilityAssessments.createdAt })
      .from(programmeVerdictInterpretabilityAssessments)
      .where(eq(programmeVerdictInterpretabilityAssessments.verdictRevisionId, candidate.id))
      .for('share'),
    tx
      .select({ createdAt: programmeVerdictMechanismStepClaims.createdAt })
      .from(programmeVerdictMechanismStepClaims)
      .where(eq(programmeVerdictMechanismStepClaims.verdictRevisionId, candidate.id))
      .for('share'),
    tx
      .select({ createdAt: programmeVerdictTimelineEventClaims.createdAt })
      .from(programmeVerdictTimelineEventClaims)
      .where(eq(programmeVerdictTimelineEventClaims.verdictRevisionId, candidate.id))
      .for('share'),
    tx
      .select({ createdAt: evidenceNodeClaims.createdAt })
      .from(evidenceNodeClaims)
      .where(inArray(evidenceNodeClaims.evidenceNodeId, proposal.reviewedEvidenceNodeIds))
      .for('share'),
    proposal.reviewedInterpretabilityAssessmentIds.length === 0
      ? Promise.resolve([])
      : tx
          .select({ createdAt: trialInterpretabilityClaims.createdAt })
          .from(trialInterpretabilityClaims)
          .where(
            inArray(
              trialInterpretabilityClaims.assessmentId,
              proposal.reviewedInterpretabilityAssessmentIds,
            ),
          )
          .for('share'),
  ])

  const scope = scopeRows[0]
  if (scopeRows.length !== 1 || !scope) {
    persistedMismatch(
      'The existing deterministic draft changed its frozen programme scope.',
      args.errorPrefix,
    )
  }
  const expectedScope = {
    programmeId: liveProgramme.id,
    drugId: liveProgramme.drugId,
    slug: liveProgramme.slug,
    title: liveProgramme.title,
    indication: liveProgramme.indication,
    targetPopulation: liveProgramme.targetPopulation,
    jurisdiction: liveProgramme.jurisdiction,
    sponsor: liveProgramme.sponsor,
    partners: liveProgramme.partners,
    status: liveProgramme.status,
    highestPhaseReached: liveProgramme.highestPhaseReached,
    route: liveProgramme.route,
    doseExposureContext: liveProgramme.doseExposureContext,
    startDate: liveProgramme.startDate,
    endDate: liveProgramme.endDate,
    rawStoppingReason: liveProgramme.rawStoppingReason,
    stoppingReasonCategory: liveProgramme.stoppingReasonCategory,
  }
  const actualScope = {
    programmeId: scope.programmeId,
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

  const expectedTrials = liveTrialRows.map((trial) => ({
    programmeId: trial.programmeId,
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
  }))
  const actualTrials = trialSnapshotRows.map((trial) => ({
    programmeId: trial.programmeId,
    programmeTrialId: trial.programmeTrialId,
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
  }))
  const expectedSources = liveSourceRows.map((source) => ({
    programmeId: candidate.programmeId,
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
  }))
  const actualSources = sourceMetadataRows.map((source) => ({
    programmeId: source.programmeId,
    sourceId: source.sourceId,
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
  }))
  if (
    scope.verdictRevisionId !== candidate.id ||
    stableJsonStringify(actualScope) !== stableJsonStringify(expectedScope) ||
    stableJsonStringify(actualTrials) !== stableJsonStringify(expectedTrials) ||
    stableJsonStringify(actualSources) !== stableJsonStringify(expectedSources)
  ) {
    persistedMismatch(
      'The existing deterministic draft no longer equals its server-frozen provenance context.',
      args.errorPrefix,
    )
  }

  const createdAt = candidate.createdAt
  const replayCheckedAt = new Date()
  const serverTimestamps = [
    scope.capturedAt,
    ...trialSnapshotRows.map((row) => row.capturedAt),
    ...sourceMetadataRows.map((row) => row.capturedAt),
    ...proposal.reviewedClaims.map((row) => row.createdAt),
    ...proposal.reviewedEvidenceNodes.map((row) => row.createdAt),
    ...proposal.reviewedInterpretabilityAssessments.map((row) => row.createdAt),
    ...proposal.mechanismSteps.map((row) => row.createdAt),
    ...proposal.timelineEvents.map((row) => row.createdAt),
    ...proposal.claimSourceLinks.map((row) => row.createdAt),
    ...proposal.dependencies.flatMap((row) => [row.createdAt, row.updatedAt]),
    ...verdictTrialLinks.map((row) => row.createdAt),
    ...verdictClaimLinks.map((row) => row.createdAt),
    ...verdictNodeLinks.map((row) => row.createdAt),
    ...verdictAssessmentLinks.map((row) => row.createdAt),
    ...mechanismClaimLinks.map((row) => row.createdAt),
    ...timelineClaimLinks.map((row) => row.createdAt),
    ...nodeClaimRows.map((row) => row.createdAt),
    ...assessmentClaimRows.map((row) => row.createdAt),
  ]
  if (
    candidate.authorName !== args.actorName ||
    candidate.programmeStatusAtReview !== liveProgramme.status ||
    candidate.engineVersion !== null ||
    candidate.inputDigestAlgorithm !== 'sha256' ||
    candidate.inputDigest !== null ||
    candidate.proposalDigestAlgorithm !== 'sha256' ||
    candidate.proposalDigest !== null ||
    candidate.adjudicationRationale !== null ||
    candidate.adjudicatorUserId !== null ||
    candidate.reviewedAt !== null ||
    candidate.publishedAt !== null ||
    candidate.supersededAt !== null ||
    candidate.createdAt > replayCheckedAt ||
    candidate.createdAt.toISOString().slice(0, 10) !== candidate.proposalAsOfDate ||
    serverTimestamps.some((timestamp) => !sameInstant(timestamp, createdAt))
  ) {
    persistedMismatch(
      'The existing deterministic draft changed a server-owned invariant.',
      args.errorPrefix,
    )
  }

  const verifiedAtValues = [
    ...proposal.reviewedClaims.map((row) => row.lastVerifiedAt),
    ...proposal.reviewedEvidenceNodes.map((row) => row.lastVerifiedAt),
    ...proposal.reviewedInterpretabilityAssessments.map((row) => row.lastVerifiedAt),
  ]
  if (verifiedAtValues.some((timestamp) => timestamp && timestamp > createdAt)) {
    persistedMismatch(
      'The existing deterministic draft contains verification metadata after its authoring time.',
      args.errorPrefix,
    )
  }
}

function persistedBundleFromProposal(
  proposal: LockedProgrammeVerdictProposal,
  errorPrefix: 'first_draft' | 'successor_draft' = 'first_draft',
  idNamespace: 'first' | 'successor' = 'first',
): ProgrammeFirstVerdictAuthoringBundle {
  const mismatch = (message: string): never => persistedMismatch(message, errorPrefix)
  const candidate = proposal.candidate
  if (
    !candidate.proposalAsOfDate ||
    !candidate.conflictsOfInterest ||
    candidate.presentationSchemaVersion !== 'programme-presentation/v1'
  ) {
    mismatch('The existing deterministic draft is missing authored bundle metadata.')
  }
  const claimKeyById = new Map(proposal.reviewedClaims.map((claim) => [claim.id, claim.claimKey]))
  const requireClaimKey = (claimId: string): string =>
    claimKeyById.get(claimId) ??
    mismatch('The existing deterministic draft contains an unbound claim link.')

  const sourceById = new Map(proposal.reviewedSources.map((source) => [source.id, source]))
  const snapshotById = new Map(
    proposal.reviewedSourceSnapshots.map((snapshot) => [snapshot.id, snapshot]),
  )
  if (proposal.claimSourceLinks.some((link) => link.relationship !== 'SUPPORTS')) {
    mismatch('The existing deterministic draft changed a claim citation relationship.')
  }
  for (const link of proposal.claimSourceLinks) {
    const snapshot = snapshotById.get(link.sourceSnapshotId)
    const source = snapshot ? sourceById.get(snapshot.sourceId) : undefined
    if (!source || link.sourceLocator !== source.canonicalLocator) {
      mismatch('The existing deterministic draft changed a server-resolved source link.')
    }
  }

  const summary = Object.fromEntries(
    PROGRAMME_SUMMARY_FIELD_PATHS.map((fieldPath) => [
      fieldPath,
      proposal.dependencies
        .filter(
          (dependency) =>
            dependency.verdictRevisionId === candidate.id &&
            dependency.dependentSurfaceType === 'PROGRAMME_SUMMARY' &&
            dependency.fieldPath === fieldPath,
        )
        .map((dependency) => requireClaimKey(dependency.claimId)),
    ]),
  ) as ProgrammeFirstVerdictAuthoringBundle['dependencies']['summary']
  const verdict = Object.fromEntries(
    PROGRAMME_VERDICT_FIELD_PATHS.map((fieldPath) => [
      fieldPath,
      proposal.dependencies
        .filter(
          (dependency) =>
            dependency.verdictRevisionId === candidate.id &&
            dependency.dependentSurfaceType === 'VERDICT' &&
            dependency.fieldPath === fieldPath,
        )
        .map((dependency) => requireClaimKey(dependency.claimId)),
    ]),
  ) as ProgrammeFirstVerdictAuthoringBundle['dependencies']['verdict']

  const persistedBundle = programmeFirstVerdictAuthoringBundleSchema.safeParse({
    schemaVersion: PROGRAMME_FIRST_VERDICT_AUTHORING_SCHEMA_VERSION,
    programmeId: proposal.programmeId,
    proposalAsOfDate: candidate.proposalAsOfDate,
    conflictsOfInterest: candidate.conflictsOfInterest,
    programmeTrialIds: proposal.reviewedTrialIds,
    claims: proposal.reviewedClaims.map((claim) => ({
      claimKey: claim.claimKey,
      programmeTrialId: claim.programmeTrialId,
      evidenceNodeType: claim.evidenceNodeType,
      nature: claim.nature,
      direction: claim.direction,
      plainLanguageText: claim.plainLanguageText,
      technicalText: claim.technicalText,
      population: claim.population,
      intervention: claim.intervention,
      comparator: claim.comparator,
      dose: claim.dose,
      route: claim.route,
      duration: claim.duration,
      endpoint: claim.endpoint,
      endpointHierarchy: claim.endpointHierarchy,
      outcomeType: claim.outcomeType,
      numericValue: claim.numericValue,
      numericUnitRequired: claim.numericUnitRequired,
      numericUnit: claim.numericUnit,
      resultDate: claim.resultDate,
      participantOutcome: claim.participantOutcome,
      comparatorValue: claim.comparatorValue,
      comparatorGroup: claim.comparatorGroup,
      presentedAsPatientBenefit: claim.presentedAsPatientBenefit,
      exploratoryNatureDisclosed: claim.exploratoryNatureDisclosed,
      stoppingReason: claim.stoppingReason,
      conflictsWithClaimKeys: claim.conflictsWithClaimIds.map(requireClaimKey),
      uncertaintyInterval: claim.uncertaintyInterval,
      timepoint: claim.timepoint,
      reviewerInterpretation: claim.reviewerInterpretation,
      lastVerifiedAt: claim.lastVerifiedAt?.toISOString() ?? null,
      sourceSnapshotIds: proposal.claimSourceLinks
        .filter((link) => link.claimId === claim.id)
        .map((link) => link.sourceSnapshotId),
    })),
    evidenceNodes: proposal.reviewedEvidenceNodes.map((node) => ({
      nodeType: node.nodeType,
      state: node.state,
      plainSummary: node.plainSummary,
      professionalSummary: node.professionalSummary,
      rationale: node.rationale,
      visible: node.visible,
      presentedAsPositive: node.presentedAsPositive,
      presentedAsNegative: node.presentedAsNegative,
      lastVerifiedAt: node.lastVerifiedAt?.toISOString() ?? null,
      claimLinks: proposal.nodeClaimLinks
        .filter((link) => link.evidenceNodeId === node.id)
        .map((link) => ({
          claimKey: requireClaimKey(link.claimId),
          relationship: link.relationship,
        })),
    })),
    interpretabilityAssessments: proposal.reviewedInterpretabilityAssessments.map((assessment) => ({
      programmeTrialId: assessment.programmeTrialId,
      criterion: assessment.criterion,
      state: assessment.state,
      explanation: assessment.explanation,
      lastVerifiedAt: assessment.lastVerifiedAt?.toISOString() ?? null,
      claimLinks: proposal.assessmentClaimLinks
        .filter((link) => link.assessmentId === assessment.id)
        .map((link) => ({
          claimKey: requireClaimKey(link.claimId),
          relationship: link.relationship,
        })),
    })),
    conclusion: {
      verdictCode: candidate.verdictCode,
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
      sourceDependent: candidate.sourceDependent,
      claimLinks: proposal.verdictClaimLinks.map((link) => ({
        claimKey: requireClaimKey(link.claimId),
        relationship: link.relationship,
      })),
    },
    dependencies: { summary, verdict },
    presentation: {
      mechanismSteps: proposal.mechanismSteps.map((step) => ({
        stepKey: step.stepKey,
        stepOrder: step.stepOrder,
        plainTitle: step.plainTitle,
        plainDescription: step.plainDescription,
        technicalDescription: step.technicalDescription,
        evidenceBasis: step.evidenceBasis,
        claimLinks: proposal.mechanismStepClaimLinks
          .filter((link) => link.stepKey === step.stepKey)
          .map((link) => ({
            claimKey: requireClaimKey(link.claimId),
            relationship: link.relationship,
          })),
      })),
      timelineEvents: proposal.timelineEvents.map((event) => ({
        eventKey: event.eventKey,
        eventDate: event.eventDate,
        eventType: event.eventType,
        dateBasis: event.dateBasis,
        plainTitle: event.plainTitle,
        plainDescription: event.plainDescription,
        technicalDescription: event.technicalDescription,
        programmeTrialId: event.programmeTrialId,
        sourceSnapshotId: event.sourceSnapshotId,
        claimLinks: proposal.timelineEventClaimLinks
          .filter((link) => link.eventKey === event.eventKey)
          .map((link) => ({
            claimKey: requireClaimKey(link.claimId),
            relationship: link.relationship,
          })),
      })),
    },
  })
  if (!persistedBundle.success) {
    return mismatch(
      'The existing deterministic draft no longer satisfies the authored bundle contract.',
    )
  }
  const bundle = persistedBundle.data

  const nodeIdByType = new Map(
    proposal.reviewedEvidenceNodes.map((node) => [node.nodeType, node.id]),
  )
  const expectedDependencies = [
    ...PROGRAMME_SUMMARY_FIELD_PATHS.flatMap((fieldPath) =>
      bundle.dependencies.summary[fieldPath].map((claimKey) => ({
        id: exactId(`${idNamespace}-dependency`, candidate.id, `summary:${fieldPath}:${claimKey}`),
        claimKey,
        dependentSurfaceType: 'PROGRAMME_SUMMARY',
        evidenceNodeId: null,
        verdictRevisionId: candidate.id,
        fieldPath,
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED',
      })),
    ),
    ...PROGRAMME_VERDICT_FIELD_PATHS.flatMap((fieldPath) =>
      bundle.dependencies.verdict[fieldPath].map((claimKey) => ({
        id: exactId(`${idNamespace}-dependency`, candidate.id, `verdict:${fieldPath}:${claimKey}`),
        claimKey,
        dependentSurfaceType: 'VERDICT',
        evidenceNodeId: null,
        verdictRevisionId: candidate.id,
        fieldPath,
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED',
      })),
    ),
    ...bundle.evidenceNodes.flatMap((node) =>
      node.claimLinks.map((link) => ({
        id: exactId(
          `${idNamespace}-dependency`,
          candidate.id,
          `node:${node.nodeType}:${link.claimKey}`,
        ),
        claimKey: link.claimKey,
        dependentSurfaceType: 'EVIDENCE_NODE',
        evidenceNodeId: nodeIdByType.get(node.nodeType) ?? null,
        verdictRevisionId: null,
        fieldPath: `evidenceNodes.${node.nodeType}.summary`,
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED',
      })),
    ),
    ...bundle.presentation.mechanismSteps.flatMap((step) =>
      step.claimLinks.map((link) => ({
        id: exactId(
          `${idNamespace}-dependency`,
          candidate.id,
          `mechanism:${step.stepKey}:${link.claimKey}`,
        ),
        claimKey: link.claimKey,
        dependentSurfaceType: 'MECHANISM_MAP',
        evidenceNodeId: null,
        verdictRevisionId: candidate.id,
        fieldPath: `mechanism.${step.stepKey}.plainDescription`,
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED',
      })),
    ),
    ...bundle.presentation.timelineEvents.flatMap((event) =>
      event.claimLinks.map((link) => ({
        id: exactId(
          `${idNamespace}-dependency`,
          candidate.id,
          `timeline:${event.eventKey}:${link.claimKey}`,
        ),
        claimKey: link.claimKey,
        dependentSurfaceType: 'TIMELINE',
        evidenceNodeId: null,
        verdictRevisionId: candidate.id,
        fieldPath: `timeline.${event.eventKey}.plainDescription`,
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED',
      })),
    ),
  ].sort((left, right) => left.id.localeCompare(right.id))
  const actualDependencies = proposal.dependencies
    .map((dependency) => ({
      id: dependency.id,
      claimKey: requireClaimKey(dependency.claimId),
      dependentSurfaceType: dependency.dependentSurfaceType,
      evidenceNodeId: dependency.evidenceNodeId,
      verdictRevisionId: dependency.verdictRevisionId,
      fieldPath: dependency.fieldPath,
      impactLevel: dependency.impactLevel,
    }))
    .sort((left, right) => left.id.localeCompare(right.id))
  if (JSON.stringify(actualDependencies) !== JSON.stringify(expectedDependencies)) {
    mismatch('The existing deterministic draft changed its derived dependency graph.')
  }

  return canonicalizeFirstVerdictBundle(bundle)
}

function latestBy<Row>(
  rows: readonly Row[],
  key: (row: Row) => string,
  revision: (row: Row) => number,
) {
  const latest = new Map<string, Row>()
  for (const row of rows) {
    const value = key(row)
    const prior = latest.get(value)
    if (!prior || revision(row) > revision(prior)) latest.set(value, row)
  }
  return latest
}

async function requireSteward(
  tx: Transaction,
  actorUserId: string,
  authoringMode: 'FIRST' | 'SUCCESSOR' = 'FIRST',
) {
  const actorRows = await tx
    .select()
    .from(users)
    .where(eq(users.id, actorUserId))
    .limit(1)
    .for('share')
  const actor = actorRows[0]
  if (!actor || (!actor.isAdmin && actor.trustTier !== 'steward')) {
    throw new ProgrammeFirstVerdictAuthoringError(
      403,
      authoringMode === 'FIRST'
        ? 'Only an existing steward or administrator may author a first canonical draft.'
        : 'Only an existing steward or administrator may author a complete successor draft.',
      authoringMode === 'FIRST' ? 'first_draft_not_authorized' : 'successor_draft_not_authorized',
    )
  }
  return actor
}

async function terminalCandidateGraphIds(tx: Transaction, verdictIds: readonly string[]) {
  if (verdictIds.length === 0) {
    return {
      claimIds: new Set<string>(),
      nodeIds: new Set<string>(),
      assessmentIds: new Set<string>(),
    }
  }
  const [
    verdictClaims,
    mechanismClaims,
    timelineClaims,
    verdictDependencyClaims,
    nodeLinks,
    assessmentLinks,
  ] = await Promise.all([
    tx
      .select({ claimId: programmeVerdictClaims.claimId })
      .from(programmeVerdictClaims)
      .where(inArray(programmeVerdictClaims.verdictRevisionId, verdictIds))
      .for('share'),
    tx
      .select({ claimId: programmeVerdictMechanismStepClaims.claimId })
      .from(programmeVerdictMechanismStepClaims)
      .where(inArray(programmeVerdictMechanismStepClaims.verdictRevisionId, verdictIds))
      .for('share'),
    tx
      .select({ claimId: programmeVerdictTimelineEventClaims.claimId })
      .from(programmeVerdictTimelineEventClaims)
      .where(inArray(programmeVerdictTimelineEventClaims.verdictRevisionId, verdictIds))
      .for('share'),
    tx
      .select({ claimId: programmeDependencies.claimId })
      .from(programmeDependencies)
      .where(inArray(programmeDependencies.verdictRevisionId, verdictIds))
      .for('share'),
    tx
      .select({ evidenceNodeId: programmeVerdictEvidenceNodes.evidenceNodeId })
      .from(programmeVerdictEvidenceNodes)
      .where(inArray(programmeVerdictEvidenceNodes.verdictRevisionId, verdictIds))
      .for('share'),
    tx
      .select({ assessmentId: programmeVerdictInterpretabilityAssessments.assessmentId })
      .from(programmeVerdictInterpretabilityAssessments)
      .where(inArray(programmeVerdictInterpretabilityAssessments.verdictRevisionId, verdictIds))
      .for('share'),
  ])
  const nodeIds = [...new Set(nodeLinks.map((row) => row.evidenceNodeId))]
  const assessmentIds = [...new Set(assessmentLinks.map((row) => row.assessmentId))]
  const [nodeClaims, nodeDependencyClaims, assessmentClaims] = await Promise.all([
    nodeIds.length === 0
      ? Promise.resolve([])
      : tx
          .select({ claimId: evidenceNodeClaims.claimId })
          .from(evidenceNodeClaims)
          .where(inArray(evidenceNodeClaims.evidenceNodeId, nodeIds))
          .for('share'),
    nodeIds.length === 0
      ? Promise.resolve([])
      : tx
          .select({ claimId: programmeDependencies.claimId })
          .from(programmeDependencies)
          .where(inArray(programmeDependencies.evidenceNodeId, nodeIds))
          .for('share'),
    assessmentIds.length === 0
      ? Promise.resolve([])
      : tx
          .select({ claimId: trialInterpretabilityClaims.claimId })
          .from(trialInterpretabilityClaims)
          .where(inArray(trialInterpretabilityClaims.assessmentId, assessmentIds))
          .for('share'),
  ])
  return {
    claimIds: new Set([
      ...verdictClaims.map((row) => row.claimId),
      ...mechanismClaims.map((row) => row.claimId),
      ...timelineClaims.map((row) => row.claimId),
      ...verdictDependencyClaims.map((row) => row.claimId),
      ...nodeClaims.map((row) => row.claimId),
      ...nodeDependencyClaims.map((row) => row.claimId),
      ...assessmentClaims.map((row) => row.claimId),
    ]),
    nodeIds: new Set(nodeIds),
    assessmentIds: new Set(assessmentIds),
  }
}

function isTerminalOrPublicGraphRow(
  reviewStatus: string,
  id: string,
  terminalIds: ReadonlySet<string>,
): boolean {
  return reviewStatus === 'PUBLISHED' || reviewStatus === 'SUPERSEDED' || terminalIds.has(id)
}

function validateProgrammeVerdictCompatibility(
  programme: typeof developmentProgrammes.$inferSelect,
  bundle: ProgrammeFirstVerdictAuthoringBundle,
  errorPrefix: 'first_draft' | 'successor_draft' = 'first_draft',
): void {
  if (isStoppedProgramme(programme.status) !== Boolean(bundle.conclusion.verdictCode)) {
    throw new ProgrammeFirstVerdictAuthoringError(
      422,
      isStoppedProgramme(programme.status)
        ? 'A stopped or withdrawn programme requires an explicit stopped-programme verdict.'
        : 'A stopped-programme verdict cannot be attached to an active programme.',
      `${errorPrefix}_verdict_scope_mismatch`,
    )
  }
}

function activeOrInvalidPriorCandidate(
  row: typeof programmeVerdictRevisions.$inferSelect,
): boolean {
  return !(
    row.reviewStatus === 'CHANGES_REQUESTED' &&
    row.proposalPreparedAt !== null &&
    row.previousVerdictRevisionId === null
  )
}

async function validatedExistingDraft(args: {
  tx: Transaction
  rows: readonly (typeof programmeVerdictRevisions.$inferSelect)[]
  programme: typeof developmentProgrammes.$inferSelect
  actorUserId: string
  actorName: string
  conflictsOfInterest: string
  bundleDigest: string
  commit: boolean
  previousVerdictRevisionId: string | null
  idNamespace: 'first' | 'successor'
  errorPrefix: 'first_draft' | 'successor_draft'
  draftLabel: string
}): Promise<ProgrammeCompleteVerdictAuthoringResult | null> {
  for (const row of args.rows) {
    if (row.reviewStatus !== 'DRAFT' || row.proposalPreparedAt !== null) continue
    const expectedId = deterministicFirstVerdictId([
      `${args.idNamespace}-verdict`,
      args.programme.id,
      ...(args.previousVerdictRevisionId ? [args.previousVerdictRevisionId] : []),
      String(row.revisionNumber),
      args.bundleDigest,
    ])
    if (row.id !== expectedId) continue
    if (
      row.previousVerdictRevisionId !== args.previousVerdictRevisionId ||
      row.authorUserId !== args.actorUserId ||
      row.conflictsOfInterest !== args.conflictsOfInterest ||
      row.presentationSchemaVersion !== 'programme-presentation/v1'
    ) {
      throw new ProgrammeFirstVerdictAuthoringError(
        409,
        `The deterministic ${args.draftLabel} id is occupied by a different authoring state.`,
        `${args.errorPrefix}_idempotency_conflict`,
      )
    }
    let proposal: LockedProgrammeVerdictProposal
    try {
      proposal = await buildLockedProgrammeVerdictProposal(args.tx, row.id)
    } catch (error) {
      if (error instanceof ProgrammeVerdictProposalError) {
        persistedMismatch(
          'The existing deterministic draft no longer forms the exact validated authored graph.',
          args.errorPrefix,
        )
      }
      throw error
    }
    if (
      proposal.reviewedClaims.some(
        (claim) =>
          claim.id !== exactId(`${args.idNamespace}-claim`, row.id, claim.claimKey) ||
          claim.authorUserId !== args.actorUserId ||
          claim.reviewStatus !== 'DRAFT' ||
          claim.publishedAt !== null ||
          claim.supersededAt !== null,
      ) ||
      proposal.reviewedEvidenceNodes.some(
        (node) =>
          node.id !== exactId(`${args.idNamespace}-node`, row.id, node.nodeType) ||
          node.authorUserId !== args.actorUserId ||
          node.reviewStatus !== 'DRAFT' ||
          node.publishedAt !== null ||
          node.supersededAt !== null,
      ) ||
      proposal.reviewedInterpretabilityAssessments.some((assessment) => {
        const key = `${assessment.programmeTrialId}\u001f${assessment.criterion}`
        return (
          assessment.id !== exactId(`${args.idNamespace}-assessment`, row.id, key) ||
          assessment.authorUserId !== args.actorUserId ||
          assessment.reviewStatus !== 'DRAFT' ||
          assessment.publishedAt !== null ||
          assessment.supersededAt !== null
        )
      })
    ) {
      persistedMismatch(
        'The existing deterministic draft changed a server-owned row invariant.',
        args.errorPrefix,
      )
    }
    await validatePersistedServerContext({
      tx: args.tx,
      proposal,
      liveProgramme: args.programme,
      actorName: args.actorName,
      errorPrefix: args.errorPrefix,
    })
    const persistedDigest = canonicalFirstVerdictBundleDigest(
      persistedBundleFromProposal(proposal, args.errorPrefix, args.idNamespace),
    )
    if (persistedDigest !== args.bundleDigest) {
      persistedMismatch(
        'The existing deterministic draft no longer equals the supplied bundle.',
        args.errorPrefix,
      )
    }
    return resultFromProposal({
      proposal,
      bundleDigest: args.bundleDigest,
      mode: args.commit ? 'COMMIT' : 'DRY_RUN',
      outcome: 'ALREADY_EXISTS',
      reused: true,
      previousVerdictRevisionId: args.previousVerdictRevisionId,
      errorPrefix: args.errorPrefix,
      draftLabel: args.draftLabel,
    })
  }
  return null
}

async function authorCompleteProgrammeVerdictDraft(args: {
  actorUserId: string
  bundle: ProgrammeFirstVerdictAuthoringBundle | unknown
  commit?: boolean
  authoringMode: 'FIRST' | 'SUCCESSOR'
}): Promise<ProgrammeCompleteVerdictAuthoringResult> {
  const bundle = programmeFirstVerdictAuthoringBundleSchema.parse(args.bundle)
  const bundleDigest = canonicalFirstVerdictBundleDigest(bundle)
  const commit = args.commit === true
  const successor = args.authoringMode === 'SUCCESSOR'
  const idNamespace = successor ? 'successor' : 'first'
  const errorPrefix = successor ? 'successor_draft' : 'first_draft'
  const draftLabel = successor ? 'complete successor draft' : 'first-publication draft'

  try {
    return await db.transaction(async (tx) => {
      const actor = await requireSteward(tx, args.actorUserId, args.authoringMode)
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtextextended('programme-verdict-draft:' || ${bundle.programmeId}, 0))`,
      )

      const programmeRows = await tx
        .select()
        .from(developmentProgrammes)
        .where(eq(developmentProgrammes.id, bundle.programmeId))
        .limit(1)
        .for('update')
      const programme = programmeRows[0]
      if (!programme) {
        throw new ProgrammeFirstVerdictAuthoringError(
          404,
          'The identified development programme does not exist.',
          `${errorPrefix}_programme_not_found`,
        )
      }
      validateProgrammeVerdictCompatibility(programme, bundle, errorPrefix)

      const pointerRows = await tx
        .select()
        .from(programmeCurrentPublications)
        .where(eq(programmeCurrentPublications.programmeId, programme.id))
        .limit(1)
        .for('update')
      const currentPointer = pointerRows[0] ?? null
      if (!successor && currentPointer) {
        throw new ProgrammeFirstVerdictAuthoringError(
          409,
          'This programme already has a canonical publication; clone its current bundle instead.',
          'first_draft_current_publication_exists',
        )
      }
      if (successor && !currentPointer) {
        throw new ProgrammeFirstVerdictAuthoringError(
          409,
          'A published canonical bundle is required before a complete successor can be authored.',
          'successor_draft_current_publication_required',
        )
      }
      const previousVerdictRevisionId = currentPointer?.verdictRevisionId ?? null
      if (successor) {
        const currentVerdictRows = await tx
          .select({ reviewStatus: programmeVerdictRevisions.reviewStatus })
          .from(programmeVerdictRevisions)
          .where(eq(programmeVerdictRevisions.id, previousVerdictRevisionId!))
          .limit(1)
          .for('share')
        if (currentVerdictRows[0]?.reviewStatus !== 'PUBLISHED') {
          throw new ProgrammeFirstVerdictAuthoringError(
            409,
            'The canonical pointer does not identify a published predecessor.',
            'successor_draft_current_publication_invalid',
          )
        }
      }

      const priorVerdicts = await tx
        .select()
        .from(programmeVerdictRevisions)
        .where(eq(programmeVerdictRevisions.programmeId, programme.id))
        .orderBy(asc(programmeVerdictRevisions.revisionNumber))
        .for('update')
      const reused = await validatedExistingDraft({
        tx,
        rows: priorVerdicts,
        programme,
        actorUserId: actor.id,
        actorName: actor.name,
        conflictsOfInterest: bundle.conflictsOfInterest,
        bundleDigest,
        commit,
        previousVerdictRevisionId,
        idNamespace,
        errorPrefix,
        draftLabel,
      })
      if (reused) return reused
      const conflicting = successor
        ? priorVerdicts.find(
            (row) =>
              row.previousVerdictRevisionId === previousVerdictRevisionId &&
              ['DRAFT', 'MACHINE_CHECKED', 'AWAITING_REVIEW', 'APPROVED'].includes(
                row.reviewStatus,
              ),
          )
        : priorVerdicts.find(activeOrInvalidPriorCandidate)
      if (conflicting) {
        throw new ProgrammeFirstVerdictAuthoringError(
          409,
          successor
            ? 'A different active successor already exists for the current public bundle.'
            : 'A different active or non-terminal first-publication candidate already exists.',
          `${errorPrefix}_candidate_conflict`,
          { revisionId: conflicting.id, reviewStatus: conflicting.reviewStatus },
        )
      }
      const terminalGraph = await terminalCandidateGraphIds(
        tx,
        priorVerdicts
          .filter((row) =>
            ['PUBLISHED', 'SUPERSEDED', 'CHANGES_REQUESTED'].includes(row.reviewStatus),
          )
          .map((row) => row.id),
      )

      const revisionNumber = (priorVerdicts.at(-1)?.revisionNumber ?? 0) + 1
      const revisionId = deterministicFirstVerdictId([
        `${idNamespace}-verdict`,
        programme.id,
        ...(previousVerdictRevisionId ? [previousVerdictRevisionId] : []),
        String(revisionNumber),
        bundleDigest,
      ])
      const authoredAt = new Date()
      if (bundle.proposalAsOfDate !== authoredAt.toISOString().slice(0, 10)) {
        throw new ProgrammeFirstVerdictAuthoringError(
          422,
          `A new ${draftLabel} must use the transaction current UTC date as its as-of date.`,
          `${errorPrefix}_as_of_date_not_current`,
        )
      }
      const futureVerification = [
        ...bundle.claims.map((claim) => claim.lastVerifiedAt),
        ...bundle.evidenceNodes.map((node) => node.lastVerifiedAt),
        ...bundle.interpretabilityAssessments.map((assessment) => assessment.lastVerifiedAt),
      ].find((timestamp) => timestamp && new Date(timestamp) > authoredAt)
      if (futureVerification) {
        throw new ProgrammeFirstVerdictAuthoringError(
          422,
          'Claim, evidence-node and interpretability verification times cannot be after the transaction authoring time.',
          `${errorPrefix}_verification_timestamp_in_future`,
        )
      }

      const trialRows = await tx
        .select()
        .from(programmeTrials)
        .where(
          and(
            eq(programmeTrials.programmeId, programme.id),
            inArray(programmeTrials.id, bundle.programmeTrialIds),
          ),
        )
        .orderBy(asc(programmeTrials.id))
        .for('share')
      if (trialRows.length !== bundle.programmeTrialIds.length) {
        throw new ProgrammeFirstVerdictAuthoringError(
          422,
          'Every scoped trial must be one exact normalized trial from this programme.',
          `${errorPrefix}_trial_scope_mismatch`,
        )
      }
      const trialMissingRegistryProvenance = trialRows.find(
        (trial) => !trial.registrySourceId || !trial.registrySnapshotId,
      )
      if (trialMissingRegistryProvenance) {
        throw new ProgrammeFirstVerdictAuthoringError(
          422,
          `Scoped trial ${trialMissingRegistryProvenance.id} is missing its exact registry source and snapshot.`,
          `${errorPrefix}_trial_registry_provenance_missing`,
        )
      }

      const directSnapshotIds = [
        ...bundle.claims.flatMap((claim) => claim.sourceSnapshotIds),
        ...bundle.presentation.timelineEvents.map((event) => event.sourceSnapshotId),
        ...trialRows.flatMap((trial) =>
          trial.registrySnapshotId ? [trial.registrySnapshotId] : [],
        ),
      ].filter((id, index, ids) => ids.indexOf(id) === index)
      const snapshotBindings = await tx
        .select({
          snapshot: sourceSnapshots,
          source: evidenceSources,
          freshness: programmeFreshnessStates,
        })
        .from(sourceSnapshots)
        .innerJoin(evidenceSources, eq(evidenceSources.id, sourceSnapshots.sourceId))
        .innerJoin(
          programmeFreshnessStates,
          and(
            eq(programmeFreshnessStates.programmeId, programme.id),
            eq(programmeFreshnessStates.sourceId, sourceSnapshots.sourceId),
          ),
        )
        .where(inArray(sourceSnapshots.id, directSnapshotIds))
        .orderBy(asc(sourceSnapshots.id))
        .for('share')
      if (snapshotBindings.length !== directSnapshotIds.length) {
        throw new ProgrammeFirstVerdictAuthoringError(
          422,
          'Every citation must resolve to an existing immutable source snapshot with a freshness record for this programme.',
          `${errorPrefix}_snapshot_not_found`,
        )
      }
      const asOfEnd = new Date(`${bundle.proposalAsOfDate}T23:59:59.999Z`)
      for (const binding of snapshotBindings) {
        if (
          binding.freshness.currentSnapshotId !== binding.snapshot.id ||
          binding.freshness.pendingSnapshotId !== null ||
          binding.freshness.checkStatus !== 'SUCCEEDED' ||
          binding.freshness.freshnessStatus !== 'CURRENT' ||
          binding.freshness.lastSuccessfulCheckAt === null ||
          binding.freshness.lastSuccessfulCheckAt > authoredAt ||
          binding.freshness.lastSuccessfulCheckAt > asOfEnd ||
          binding.freshness.nextCheckDueAt === null ||
          binding.freshness.nextCheckDueAt < asOfEnd ||
          binding.snapshot.retrievedAt > authoredAt ||
          (binding.snapshot.lastVerifiedAt !== null && binding.snapshot.lastVerifiedAt > authoredAt)
        ) {
          throw new ProgrammeFirstVerdictAuthoringError(
            422,
            `Source snapshot ${binding.snapshot.id} is not this programme's exact current, fully checked version.`,
            `${errorPrefix}_snapshot_not_current`,
          )
        }
        if (
          binding.source.correctionStatus === 'RETRACTED' ||
          binding.source.correctionStatus === 'WITHDRAWN'
        ) {
          throw new ProgrammeFirstVerdictAuthoringError(
            422,
            `Source ${binding.source.id} is retracted or withdrawn.`,
            `${errorPrefix}_source_unusable`,
          )
        }
      }
      const snapshotById = new Map(
        snapshotBindings.map((binding) => [binding.snapshot.id, binding]),
      )
      for (const trial of trialRows) {
        const registryBinding = snapshotById.get(trial.registrySnapshotId!)
        if (!registryBinding || registryBinding.source.id !== trial.registrySourceId) {
          throw new ProgrammeFirstVerdictAuthoringError(
            422,
            `Scoped trial ${trial.id} does not bind its exact registry snapshot to its registry source.`,
            `${errorPrefix}_trial_registry_provenance_mismatch`,
          )
        }
      }

      const existingClaimRows = await tx
        .select()
        .from(claims)
        .where(
          and(
            eq(claims.programmeId, programme.id),
            inArray(
              claims.claimKey,
              bundle.claims.map((claim) => claim.claimKey),
            ),
          ),
        )
        .orderBy(asc(claims.claimKey), asc(claims.revisionNumber))
        .for('share')
      const latestClaimByKey = latestBy(
        existingClaimRows,
        (row) => row.claimKey,
        (row) => row.revisionNumber,
      )
      for (const row of existingClaimRows) {
        if (!isTerminalOrPublicGraphRow(row.reviewStatus, row.id, terminalGraph.claimIds)) {
          throw new ProgrammeFirstVerdictAuthoringError(
            409,
            `Claim lineage ${row.claimKey} already has an active, unbound revision.`,
            `${errorPrefix}_claim_lineage_conflict`,
          )
        }
      }
      const claimIdByKey = new Map(
        bundle.claims.map((claim) => [
          claim.claimKey,
          exactId(`${idNamespace}-claim`, revisionId, claim.claimKey),
        ]),
      )

      const existingNodeRows =
        bundle.evidenceNodes.length === 0
          ? []
          : await tx
              .select()
              .from(evidenceNodes)
              .where(
                and(
                  eq(evidenceNodes.programmeId, programme.id),
                  inArray(
                    evidenceNodes.nodeType,
                    bundle.evidenceNodes.map((node) => node.nodeType),
                  ),
                ),
              )
              .orderBy(asc(evidenceNodes.nodeType), asc(evidenceNodes.revisionNumber))
              .for('share')
      const latestNodeByType = latestBy(
        existingNodeRows,
        (row) => row.nodeType,
        (row) => row.revisionNumber,
      )
      for (const row of existingNodeRows) {
        if (!isTerminalOrPublicGraphRow(row.reviewStatus, row.id, terminalGraph.nodeIds)) {
          throw new ProgrammeFirstVerdictAuthoringError(
            409,
            `Evidence-node lineage ${row.nodeType} already has an active, unbound revision.`,
            `${errorPrefix}_node_lineage_conflict`,
          )
        }
      }
      const nodeIdByType = new Map(
        bundle.evidenceNodes.map((node) => [
          node.nodeType,
          exactId(`${idNamespace}-node`, revisionId, node.nodeType),
        ]),
      )

      const existingAssessmentRows = await tx
        .select()
        .from(trialInterpretabilityAssessments)
        .where(
          and(
            eq(trialInterpretabilityAssessments.programmeId, programme.id),
            inArray(trialInterpretabilityAssessments.programmeTrialId, bundle.programmeTrialIds),
          ),
        )
        .orderBy(
          asc(trialInterpretabilityAssessments.programmeTrialId),
          asc(trialInterpretabilityAssessments.criterion),
          asc(trialInterpretabilityAssessments.revisionNumber),
        )
        .for('share')
      const assessmentLogicalKey = (trialId: string, criterion: string) =>
        `${trialId}\u001f${criterion}`
      const latestAssessmentByKey = latestBy(
        existingAssessmentRows,
        (row) => assessmentLogicalKey(row.programmeTrialId, row.criterion),
        (row) => row.revisionNumber,
      )
      for (const row of existingAssessmentRows) {
        const key = assessmentLogicalKey(row.programmeTrialId, row.criterion)
        if (!isTerminalOrPublicGraphRow(row.reviewStatus, row.id, terminalGraph.assessmentIds)) {
          throw new ProgrammeFirstVerdictAuthoringError(
            409,
            `Interpretability lineage ${key} already has an active, unbound revision.`,
            `${errorPrefix}_assessment_lineage_conflict`,
          )
        }
      }
      const assessmentIdByKey = new Map(
        bundle.interpretabilityAssessments.map((assessment) => {
          const key = assessmentLogicalKey(assessment.programmeTrialId, assessment.criterion)
          return [key, exactId(`${idNamespace}-assessment`, revisionId, key)]
        }),
      )

      await tx.insert(programmeVerdictRevisions).values({
        id: revisionId,
        programmeId: programme.id,
        revisionNumber,
        previousVerdictRevisionId,
        reviewStatus: 'DRAFT',
        programmeStatusAtReview: programme.status,
        verdictCode: bundle.conclusion.verdictCode,
        proposalAsOfDate: bundle.proposalAsOfDate,
        presentationSchemaVersion: 'programme-presentation/v1',
        publicLabel: bundle.conclusion.publicLabel,
        professionalLabel: bundle.conclusion.professionalLabel,
        indicationScope: bundle.conclusion.indicationScope,
        populationScope: bundle.conclusion.populationScope,
        doseExposureScope: bundle.conclusion.doseExposureScope,
        periodScope: bundle.conclusion.periodScope,
        trialScope: bundle.conclusion.trialScope,
        outcomeScope: bundle.conclusion.outcomeScope,
        plainMechanism: bundle.conclusion.plainMechanism,
        bestSupportedFinding: bundle.conclusion.bestSupportedFinding,
        mainLimitation: bundle.conclusion.mainLimitation,
        oneSentenceReason: bundle.conclusion.oneSentenceReason,
        whatWasDisproven: bundle.conclusion.whatWasDisproven,
        whatWasNotDisproven: bundle.conclusion.whatWasNotDisproven,
        whatRemainsUnknown: bundle.conclusion.whatRemainsUnknown,
        confidence: bundle.conclusion.confidence,
        confidenceExplanation: bundle.conclusion.confidenceExplanation,
        conditionsThatWouldChangeVerdict: bundle.conclusion.conditionsThatWouldChangeVerdict,
        authorUserId: actor.id,
        authorName: actor.name,
        conflictsOfInterest: bundle.conflictsOfInterest,
        sourceDependent: bundle.conclusion.sourceDependent,
        adjudicationRationale: null,
        adjudicatorUserId: null,
        engineVersion: null,
        inputDigest: null,
        proposalDigest: null,
        proposalPreparedAt: null,
        createdAt: authoredAt,
        reviewedAt: null,
        publishedAt: null,
        supersededAt: null,
      })
      await tx.insert(programmeVerdictScopeSnapshots).values({
        verdictRevisionId: revisionId,
        programmeId: programme.id,
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
        capturedAt: authoredAt,
      })
      await tx.insert(programmeVerdictTrials).values(
        trialRows.map((trial) => ({
          programmeId: programme.id,
          verdictRevisionId: revisionId,
          programmeTrialId: trial.id,
          createdAt: authoredAt,
        })),
      )
      await tx.insert(programmeVerdictTrialSnapshots).values(
        trialRows.map((trial) => ({
          verdictRevisionId: revisionId,
          programmeId: programme.id,
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
          capturedAt: authoredAt,
        })),
      )

      await tx.insert(claims).values(
        bundle.claims.map((claim) => {
          const prior = latestClaimByKey.get(claim.claimKey)
          return {
            id: claimIdByKey.get(claim.claimKey)!,
            programmeId: programme.id,
            claimKey: claim.claimKey,
            revisionNumber: (prior?.revisionNumber ?? 0) + 1,
            previousClaimId: prior?.id ?? null,
            programmeTrialId: claim.programmeTrialId,
            evidenceNodeType: claim.evidenceNodeType,
            nature: claim.nature,
            reviewStatus: 'DRAFT' as const,
            plainLanguageText: claim.plainLanguageText,
            technicalText: claim.technicalText,
            population: claim.population,
            intervention: claim.intervention,
            comparator: claim.comparator,
            dose: claim.dose,
            route: claim.route,
            duration: claim.duration,
            endpoint: claim.endpoint,
            endpointHierarchy: claim.endpointHierarchy,
            outcomeType: claim.outcomeType,
            numericValue: claim.numericValue,
            numericUnitRequired: claim.numericUnitRequired,
            numericUnit: claim.numericUnit,
            resultDate: claim.resultDate,
            participantOutcome: claim.participantOutcome,
            comparatorValue: claim.comparatorValue,
            comparatorGroup: claim.comparatorGroup,
            presentedAsPatientBenefit: claim.presentedAsPatientBenefit,
            exploratoryNatureDisclosed: claim.exploratoryNatureDisclosed,
            stoppingReason: claim.stoppingReason,
            conflictsWithClaimIds: claim.conflictsWithClaimKeys.map((key) =>
              claimIdByKey.get(key)!,
            ),
            uncertaintyInterval: claim.uncertaintyInterval,
            direction: claim.direction,
            timepoint: claim.timepoint,
            reviewerInterpretation: claim.reviewerInterpretation,
            lastVerifiedAt: asDate(claim.lastVerifiedAt),
            authorUserId: actor.id,
            createdAt: authoredAt,
            publishedAt: null,
            supersededAt: null,
          }
        }),
      )
      await tx.insert(claimSourceLinks).values(
        bundle.claims.flatMap((claim) =>
          claim.sourceSnapshotIds.map((snapshotId) => ({
            programmeId: programme.id,
            claimId: claimIdByKey.get(claim.claimKey)!,
            sourceSnapshotId: snapshotId,
            relationship: 'SUPPORTS' as const,
            sourceLocator: snapshotById.get(snapshotId)!.source.canonicalLocator,
            createdAt: authoredAt,
          })),
        ),
      )

      if (bundle.evidenceNodes.length > 0) {
        await tx.insert(evidenceNodes).values(
          bundle.evidenceNodes.map((node) => {
            const prior = latestNodeByType.get(node.nodeType)
            return {
              id: nodeIdByType.get(node.nodeType)!,
              programmeId: programme.id,
              nodeType: node.nodeType,
              revisionNumber: (prior?.revisionNumber ?? 0) + 1,
              previousEvidenceNodeId: prior?.id ?? null,
              state: node.state,
              reviewStatus: 'DRAFT' as const,
              plainSummary: node.plainSummary,
              professionalSummary: node.professionalSummary,
              rationale: node.rationale,
              visible: node.visible,
              presentedAsPositive: node.presentedAsPositive,
              presentedAsNegative: node.presentedAsNegative,
              lastVerifiedAt: asDate(node.lastVerifiedAt),
              authorUserId: actor.id,
              createdAt: authoredAt,
              publishedAt: null,
              supersededAt: null,
            }
          }),
        )
        await tx.insert(evidenceNodeClaims).values(
          bundle.evidenceNodes.flatMap((node) =>
            node.claimLinks.map((link) => ({
              programmeId: programme.id,
              evidenceNodeId: nodeIdByType.get(node.nodeType)!,
              claimId: claimIdByKey.get(link.claimKey)!,
              relationship: link.relationship,
              createdAt: authoredAt,
            })),
          ),
        )
        await tx.insert(programmeVerdictEvidenceNodes).values(
          bundle.evidenceNodes.map((node) => ({
            programmeId: programme.id,
            verdictRevisionId: revisionId,
            evidenceNodeId: nodeIdByType.get(node.nodeType)!,
            createdAt: authoredAt,
          })),
        )
      }

      if (bundle.interpretabilityAssessments.length > 0) {
        await tx.insert(trialInterpretabilityAssessments).values(
          bundle.interpretabilityAssessments.map((assessment) => {
            const key = assessmentLogicalKey(assessment.programmeTrialId, assessment.criterion)
            const prior = latestAssessmentByKey.get(key)
            return {
              id: assessmentIdByKey.get(key)!,
              programmeId: programme.id,
              programmeTrialId: assessment.programmeTrialId,
              criterion: assessment.criterion,
              state: assessment.state,
              revisionNumber: (prior?.revisionNumber ?? 0) + 1,
              previousAssessmentId: prior?.id ?? null,
              reviewStatus: 'DRAFT' as const,
              explanation: assessment.explanation,
              lastVerifiedAt: asDate(assessment.lastVerifiedAt),
              authorUserId: actor.id,
              createdAt: authoredAt,
              publishedAt: null,
              supersededAt: null,
            }
          }),
        )
        await tx.insert(trialInterpretabilityClaims).values(
          bundle.interpretabilityAssessments.flatMap((assessment) => {
            const key = assessmentLogicalKey(assessment.programmeTrialId, assessment.criterion)
            return assessment.claimLinks.map((link) => ({
              programmeId: programme.id,
              assessmentId: assessmentIdByKey.get(key)!,
              claimId: claimIdByKey.get(link.claimKey)!,
              relationship: link.relationship,
              createdAt: authoredAt,
            }))
          }),
        )
        await tx.insert(programmeVerdictInterpretabilityAssessments).values(
          bundle.interpretabilityAssessments.map((assessment) => {
            const key = assessmentLogicalKey(assessment.programmeTrialId, assessment.criterion)
            return {
              programmeId: programme.id,
              verdictRevisionId: revisionId,
              assessmentId: assessmentIdByKey.get(key)!,
              createdAt: authoredAt,
            }
          }),
        )
      }

      await tx.insert(programmeVerdictClaims).values(
        bundle.conclusion.claimLinks.map((link) => ({
          programmeId: programme.id,
          verdictRevisionId: revisionId,
          claimId: claimIdByKey.get(link.claimKey)!,
          relationship: link.relationship,
          createdAt: authoredAt,
        })),
      )

      await tx.insert(programmeVerdictMechanismSteps).values(
        bundle.presentation.mechanismSteps.map((step) => ({
          verdictRevisionId: revisionId,
          programmeId: programme.id,
          stepKey: step.stepKey,
          stepOrder: step.stepOrder,
          plainTitle: step.plainTitle,
          plainDescription: step.plainDescription,
          technicalDescription: step.technicalDescription,
          evidenceBasis: step.evidenceBasis,
          createdAt: authoredAt,
        })),
      )
      await tx.insert(programmeVerdictMechanismStepClaims).values(
        bundle.presentation.mechanismSteps.flatMap((step) =>
          step.claimLinks.map((link) => ({
            verdictRevisionId: revisionId,
            programmeId: programme.id,
            stepKey: step.stepKey,
            claimId: claimIdByKey.get(link.claimKey)!,
            relationship: link.relationship,
            createdAt: authoredAt,
          })),
        ),
      )
      if (bundle.presentation.timelineEvents.length > 0) {
        await tx.insert(programmeVerdictTimelineEvents).values(
          bundle.presentation.timelineEvents.map((event) => {
            const source = snapshotById.get(event.sourceSnapshotId)!.source
            return {
              verdictRevisionId: revisionId,
              programmeId: programme.id,
              eventKey: event.eventKey,
              eventDate: event.eventDate,
              eventType: event.eventType,
              dateBasis: event.dateBasis,
              plainTitle: event.plainTitle,
              plainDescription: event.plainDescription,
              technicalDescription: event.technicalDescription,
              programmeTrialId: event.programmeTrialId,
              sourceId: source.id,
              sourceSnapshotId: event.sourceSnapshotId,
              createdAt: authoredAt,
            }
          }),
        )
        await tx.insert(programmeVerdictTimelineEventClaims).values(
          bundle.presentation.timelineEvents.flatMap((event) =>
            event.claimLinks.map((link) => ({
              verdictRevisionId: revisionId,
              programmeId: programme.id,
              eventKey: event.eventKey,
              claimId: claimIdByKey.get(link.claimKey)!,
              relationship: link.relationship,
              createdAt: authoredAt,
            })),
          ),
        )
      }

      const dependencies = [
        ...PROGRAMME_SUMMARY_FIELD_PATHS.flatMap((fieldPath) =>
          bundle.dependencies.summary[fieldPath].map((claimKey) => ({
            id: exactId(
              `${idNamespace}-dependency`,
              revisionId,
              `summary:${fieldPath}:${claimKey}`,
            ),
            programmeId: programme.id,
            claimId: claimIdByKey.get(claimKey)!,
            dependentSurfaceType: 'PROGRAMME_SUMMARY' as const,
            evidenceNodeId: null,
            verdictRevisionId: revisionId,
            fieldPath,
            impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
            createdAt: authoredAt,
            updatedAt: authoredAt,
          })),
        ),
        ...PROGRAMME_VERDICT_FIELD_PATHS.flatMap((fieldPath) =>
          bundle.dependencies.verdict[fieldPath].map((claimKey) => ({
            id: exactId(
              `${idNamespace}-dependency`,
              revisionId,
              `verdict:${fieldPath}:${claimKey}`,
            ),
            programmeId: programme.id,
            claimId: claimIdByKey.get(claimKey)!,
            dependentSurfaceType: 'VERDICT' as const,
            evidenceNodeId: null,
            verdictRevisionId: revisionId,
            fieldPath,
            impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
            createdAt: authoredAt,
            updatedAt: authoredAt,
          })),
        ),
        ...bundle.evidenceNodes.flatMap((node) =>
          node.claimLinks.map((link) => ({
            id: exactId(
              `${idNamespace}-dependency`,
              revisionId,
              `node:${node.nodeType}:${link.claimKey}`,
            ),
            programmeId: programme.id,
            claimId: claimIdByKey.get(link.claimKey)!,
            dependentSurfaceType: 'EVIDENCE_NODE' as const,
            evidenceNodeId: nodeIdByType.get(node.nodeType)!,
            verdictRevisionId: null,
            fieldPath: `evidenceNodes.${node.nodeType}.summary`,
            impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
            createdAt: authoredAt,
            updatedAt: authoredAt,
          })),
        ),
        ...bundle.presentation.mechanismSteps.flatMap((step) =>
          step.claimLinks.map((link) => ({
            id: exactId(
              `${idNamespace}-dependency`,
              revisionId,
              `mechanism:${step.stepKey}:${link.claimKey}`,
            ),
            programmeId: programme.id,
            claimId: claimIdByKey.get(link.claimKey)!,
            dependentSurfaceType: 'MECHANISM_MAP' as const,
            evidenceNodeId: null,
            verdictRevisionId: revisionId,
            fieldPath: `mechanism.${step.stepKey}.plainDescription`,
            impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
            createdAt: authoredAt,
            updatedAt: authoredAt,
          })),
        ),
        ...bundle.presentation.timelineEvents.flatMap((event) =>
          event.claimLinks.map((link) => ({
            id: exactId(
              `${idNamespace}-dependency`,
              revisionId,
              `timeline:${event.eventKey}:${link.claimKey}`,
            ),
            programmeId: programme.id,
            claimId: claimIdByKey.get(link.claimKey)!,
            dependentSurfaceType: 'TIMELINE' as const,
            evidenceNodeId: null,
            verdictRevisionId: revisionId,
            fieldPath: `timeline.${event.eventKey}.plainDescription`,
            impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
            createdAt: authoredAt,
            updatedAt: authoredAt,
          })),
        ),
      ]
      await tx.insert(programmeDependencies).values(dependencies)

      const sourceById = new Map(
        snapshotBindings.map((binding) => [binding.source.id, binding.source]),
      )
      await tx.insert(programmeVerdictSourceMetadataSnapshots).values(
        [...sourceById.values()].map((source) => ({
          verdictRevisionId: revisionId,
          programmeId: programme.id,
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
          capturedAt: authoredAt,
        })),
      )

      const proposal = await buildLockedProgrammeVerdictProposal(tx, revisionId)
      const result = resultFromProposal({
        proposal,
        bundleDigest,
        mode: commit ? 'COMMIT' : 'DRY_RUN',
        outcome: commit ? 'CREATED' : 'WOULD_CREATE',
        reused: false,
        previousVerdictRevisionId,
        errorPrefix,
        draftLabel,
      })
      if (!commit) throw new DryRunRollback(result)
      return result
    })
  } catch (error) {
    if (error instanceof DryRunRollback) return error.result
    if (error instanceof ProgrammeVerdictProposalError) {
      throw new ProgrammeFirstVerdictAuthoringError(
        422,
        error.message,
        `${errorPrefix}_validation_${error.code}`,
      )
    }
    throw error
  }
}

/**
 * Import a complete, human-authored first canonical graph and validate it with the exact proposal
 * builder. Nothing is prepared or published here. A failed builder run rolls the whole import back.
 */
export async function authorFirstProgrammeVerdictDraft(args: {
  actorUserId: string
  bundle: ProgrammeFirstVerdictAuthoringBundle | unknown
  commit?: boolean
}): Promise<ProgrammeFirstVerdictAuthoringResult> {
  const result = await authorCompleteProgrammeVerdictDraft({ ...args, authoringMode: 'FIRST' })
  if (result.previousVerdictRevisionId !== null) {
    throw new ProgrammeFirstVerdictAuthoringError(
      500,
      'First-publication authoring returned successor lineage.',
      'first_draft_state_invalid',
    )
  }
  return result as ProgrammeFirstVerdictAuthoringResult
}

/**
 * Import a complete, human-authored replacement graph against the exact current publication.
 * The new bundle remains an unprepared DRAFT and cannot affect public reads until the independent
 * prepare, review and publish workflow succeeds.
 */
export async function authorSuccessorProgrammeVerdictDraft(args: {
  actorUserId: string
  bundle: ProgrammeFirstVerdictAuthoringBundle | unknown
  commit?: boolean
}): Promise<ProgrammeSuccessorVerdictAuthoringResult> {
  const result = await authorCompleteProgrammeVerdictDraft({ ...args, authoringMode: 'SUCCESSOR' })
  if (result.previousVerdictRevisionId === null) {
    throw new ProgrammeFirstVerdictAuthoringError(
      500,
      'Successor authoring returned first-publication lineage.',
      'successor_draft_state_invalid',
    )
  }
  return result as ProgrammeSuccessorVerdictAuthoringResult
}
