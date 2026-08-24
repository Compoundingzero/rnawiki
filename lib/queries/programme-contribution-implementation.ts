import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'

import { db, type Db } from '@/db'
import {
  claimSourceLinks,
  claims,
  developmentProgrammes,
  drugAliases,
  drugs,
  evidenceNodeClaims,
  evidenceNodes,
  evidenceReviewTaskSourceDeltas,
  evidenceReviewTasks,
  evidenceSources,
  programmeContributionImplementations,
  programmeContributionProposals,
  programmeContributionReviewStates,
  programmeContributionSourceTaskResolutions,
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
  users,
} from '@/db/schema'
import { isEvidenceNodeContributionField } from '@/lib/contributions/types'
import type {
  ContributionSelectedField,
  ContributionSourceRefreshDeltaSnapshot,
} from '@/lib/contributions/types'
import { ApiError } from '@/lib/api-response'
import type { DependentSurfaceType, ProgrammeStatus } from '@/lib/evidence/types'
import { ClinicalTrialsGovAdapter } from '@/lib/evidence/adapters/clinical-trials-gov'
import {
  clinicalTrialsEnrollmentType,
  clinicalTrialsExactDate,
  clinicalTrialsPhaseLabel,
  clinicalTrialsProgrammeStatus,
  clinicalTrialsResultsStatus,
  clinicalTrialsTrialStatus,
  parseClinicalTrialsRegistryFacts,
} from '@/lib/evidence/clinical-trial-programme-onboarding'
import type { NormalizedFact, SourceSnapshot } from '@/lib/evidence/source-adapter'
import { newId } from '@/lib/ids'
import {
  EVIDENCE_ENGINE_VERSION,
  EVIDENCE_PRESENTATION_ENGINE_VERSION,
} from '@/lib/rna-intelligence'
import { stableJsonStringify } from '@/lib/stable-json'
import {
  prepareLockedProgrammeVerdictProposal,
  type PreparedProgrammeVerdictProposal,
} from '@/lib/queries/programme-verdict-proposal'

type Transaction = Parameters<Parameters<Db['transaction']>[0]>[0]
type Proposal = typeof programmeContributionProposals.$inferSelect

export type ContributionImplementationErrorCode =
  | 'proposal_not_found'
  | 'not_accepted'
  | 'not_authorized'
  | 'stale_public_baseline'
  | 'source_review_required'
  | 'needs_scientific_revision'
  | 'stale_source_review_task'
  | 'claim_rewrite_required'
  | 'coupled_change_required'
  | 'invalid_accepted_proposal'

export class ContributionImplementationError extends ApiError {
  override readonly code: ContributionImplementationErrorCode

  constructor(code: ContributionImplementationErrorCode, message: string) {
    super(
      code === 'proposal_not_found' ? 404 : code === 'not_authorized' ? 403 : 409,
      message,
      code,
    )
    this.name = 'ContributionImplementationError'
    this.code = code
  }
}

export interface MaterializedContributionCandidate extends PreparedProgrammeVerdictProposal {
  outcome: 'CANONICAL_CANDIDATE'
  proposalId: string
  reused: boolean
}

export interface ResolvedUnpublishedSourceTask {
  outcome: 'UNPUBLISHED_SOURCE_TASK_RESOLVED'
  proposalId: string
  programmeId: string
  sourceReviewTaskId: string
  sourceSnapshotId: string
  resolvedAt: string
  reused: boolean
  createsConclusion: false
}

export type AcceptedContributionImplementationResult =
  MaterializedContributionCandidate | ResolvedUnpublishedSourceTask

function normalizeLocator(value: string): string {
  try {
    const url = new URL(value)
    url.hash = ''
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '')
    return url.toString().replace(/\/$/, '')
  } catch {
    return value.trim().replace(/\/+$/, '')
  }
}

function sourceRefreshDeltaSnapshot(
  row: typeof evidenceReviewTaskSourceDeltas.$inferSelect,
): ContributionSourceRefreshDeltaSnapshot {
  if (
    row.schemaVersion !== 'rna-intelligence/source-refresh-delta-v1' ||
    row.deltaDigestAlgorithm !== 'sha256'
  ) {
    throw new ContributionImplementationError(
      'stale_source_review_task',
      'The source task uses an unsupported saved change format.',
    )
  }
  return {
    version: row.schemaVersion,
    reviewTaskId: row.reviewTaskId,
    programmeId: row.programmeId,
    sourceId: row.sourceId,
    baselineSnapshotId: row.baselineSnapshotId,
    pendingSnapshotId: row.pendingSnapshotId,
    adapterKey: row.adapterKey,
    action: row.action,
    changedTrialFields: row.changedTrialFields,
    affectedClaimIds: row.affectedClaimIds,
    affectedInterpretability: row.affectedInterpretability,
    affectedSurfacePaths: row.affectedSurfacePaths,
    scientificRevisionRequirements: row.scientificRevisionRequirements,
    deltaDigestAlgorithm: 'sha256',
    deltaDigest: row.deltaDigest,
  }
}

function isStopped(status: ProgrammeStatus): boolean {
  return status === 'STOPPED' || status === 'WITHDRAWN'
}

function contributionSurfaceType(args: {
  fieldPath: string
  evidenceNodeId: string | null
}): DependentSurfaceType {
  if (args.evidenceNodeId) return 'EVIDENCE_NODE'
  if (args.fieldPath.startsWith('summary.')) return 'PROGRAMME_SUMMARY'
  if (args.fieldPath.startsWith('verdict.')) return 'VERDICT'
  if (args.fieldPath.startsWith('programme.')) return 'PROGRAMME_STATUS'
  if (args.fieldPath.startsWith('trial.')) return 'TIMELINE'
  return 'METADATA'
}

function storedAdapterSnapshot(
  source: typeof evidenceSources.$inferSelect,
  snapshot: typeof sourceSnapshots.$inferSelect,
): SourceSnapshot {
  return {
    adapterKey: 'clinicaltrials.gov/v2',
    identifier: { kind: 'NCT', value: source.externalIdentifier ?? '' },
    canonicalLocator: source.canonicalLocator,
    retrievedAt: snapshot.retrievedAt.toISOString(),
    contentHash: snapshot.contentHash,
    payload: snapshot.structuredData,
  }
}

function factValue(facts: readonly NormalizedFact[], path: string): NormalizedFact['value'] | null {
  return facts.find((fact) => fact.path === path)?.value ?? null
}

async function pendingClinicalTrialUpdate(args: {
  tx: Transaction
  proposal: Proposal
  cited: Awaited<ReturnType<typeof resolveCitedSource>>
  trialSnapshots: Array<typeof programmeVerdictTrialSnapshots.$inferSelect>
}) {
  if (!args.cited.task || args.cited.source.sourceType !== 'CLINICAL_TRIAL_REGISTRY') return null
  const nctId = args.cited.source.externalIdentifier?.trim().toUpperCase()
  if (!nctId || !/^NCT\d{8}$/.test(nctId)) {
    throw new ContributionImplementationError(
      'stale_source_review_task',
      'The ClinicalTrials.gov task has no unambiguous NCT identifier.',
    )
  }
  const matches = args.trialSnapshots.filter(
    (trial) =>
      trial.registrySourceId === args.cited.source.id ||
      trial.trialIdentifier.trim().toUpperCase() === nctId,
  )
  if (matches.length !== 1) {
    throw new ContributionImplementationError(
      'stale_source_review_task',
      'The pending ClinicalTrials.gov snapshot must map to exactly one trial in this candidate.',
    )
  }
  const previousId = args.cited.freshness.currentSnapshotId
  if (!previousId) {
    throw new ContributionImplementationError(
      'stale_source_review_task',
      'The ClinicalTrials.gov task has no exact current snapshot to compare.',
    )
  }
  const previousRows = await args.tx
    .select()
    .from(sourceSnapshots)
    .where(
      and(eq(sourceSnapshots.id, previousId), eq(sourceSnapshots.sourceId, args.cited.source.id)),
    )
    .limit(1)
    .for('share')
  const previous = previousRows[0]
  if (!previous) {
    throw new ContributionImplementationError(
      'stale_source_review_task',
      'The current ClinicalTrials.gov comparison snapshot is missing.',
    )
  }
  const adapter = new ClinicalTrialsGovAdapter()
  const before = storedAdapterSnapshot(args.cited.source, previous)
  const after = storedAdapterSnapshot(args.cited.source, args.cited.snapshot)
  const [diff, facts] = await Promise.all([adapter.diff(before, after), adapter.normalize(after)])
  const allowedPaths = new Set([
    'trial.identifier',
    'trial.overallStatus',
    'trial.hasResults',
    'trial.enrollment.count',
    'trial.enrollment.type',
    'trial.phases',
    'trial.startDate',
    'trial.primaryCompletionDate',
    'trial.completionDate',
    'trial.sponsor.name',
    'trial.sponsor.class',
  ])
  if (
    !diff.changed ||
    diff.changes.some(
      (change) => change.path === 'trial.registryRecord' || !allowedPaths.has(change.path),
    )
  ) {
    throw new ContributionImplementationError(
      'source_review_required',
      'This registry change contains unclassified fields. A source steward must classify it before the task can be resolved.',
    )
  }
  if (
    args.proposal.proposalType === 'SOURCE_REFRESH' &&
    stableJsonStringify(diff.changes) !==
      stableJsonStringify(args.proposal.sourceRefreshDeltaSnapshot?.changedTrialFields ?? null)
  ) {
    throw new ContributionImplementationError(
      'stale_source_review_task',
      'The saved parser comparison no longer matches the exact verified-to-pending registry snapshots.',
    )
  }
  const returnedNct = factValue(facts, 'trial.identifier')
  if (typeof returnedNct !== 'string' || returnedNct.toUpperCase() !== nctId) {
    throw new ContributionImplementationError(
      'stale_source_review_task',
      'The pending registry snapshot does not identify the trial attached to this task.',
    )
  }
  const overallStatus = factValue(facts, 'trial.overallStatus')
  const hasResults = factValue(facts, 'trial.hasResults')
  const enrolment = factValue(facts, 'trial.enrollment.count')
  const enrolmentType = factValue(facts, 'trial.enrollment.type')
  const phases = factValue(facts, 'trial.phases')
  const startDate = factValue(facts, 'trial.startDate')
  const primaryCompletionDate = factValue(facts, 'trial.primaryCompletionDate')
  const completionDate = factValue(facts, 'trial.completionDate')
  const derivedProgrammeStatus = clinicalTrialsProgrammeStatus(
    typeof overallStatus === 'string' ? overallStatus : null,
  )
  if (
    args.proposal.selectedField === 'programme.status' &&
    replacementText(args.proposal) !== derivedProgrammeStatus
  ) {
    throw new ContributionImplementationError(
      'invalid_accepted_proposal',
      'The accepted programme status does not match the exact normalized registry status.',
    )
  }
  return {
    programmeTrialId: matches[0]!.programmeTrialId,
    trialIdentifier: nctId,
    phase: clinicalTrialsPhaseLabel(typeof phases === 'string' ? phases.split('|') : []),
    status: clinicalTrialsTrialStatus(typeof overallStatus === 'string' ? overallStatus : null),
    resultsStatus: clinicalTrialsResultsStatus(typeof hasResults === 'boolean' ? hasResults : null),
    enrolment: typeof enrolment === 'number' && Number.isSafeInteger(enrolment) ? enrolment : null,
    enrolmentType: clinicalTrialsEnrollmentType(
      typeof enrolmentType === 'string' ? enrolmentType : null,
    ),
    startDate: clinicalTrialsExactDate(typeof startDate === 'string' ? startDate : null),
    primaryCompletionDate: clinicalTrialsExactDate(
      typeof primaryCompletionDate === 'string' ? primaryCompletionDate : null,
    ),
    completionDate: clinicalTrialsExactDate(
      typeof completionDate === 'string' ? completionDate : null,
    ),
    registrySourceId: args.cited.source.id,
    registrySnapshotId: args.cited.snapshot.id,
    lastVerifiedAt: args.cited.snapshot.lastVerifiedAt ?? args.cited.snapshot.retrievedAt,
    sponsor:
      typeof factValue(facts, 'trial.sponsor.name') === 'string'
        ? (factValue(facts, 'trial.sponsor.name') as string)
        : null,
    programmeStatus: derivedProgrammeStatus,
    highestPhaseReached: clinicalTrialsPhaseLabel(
      typeof phases === 'string' ? phases.split('|') : [],
    ),
    programmeStartDate: clinicalTrialsExactDate(typeof startDate === 'string' ? startDate : null),
    programmeEndDate: clinicalTrialsExactDate(
      typeof completionDate === 'string' ? completionDate : null,
    ),
  }
}

function replacement(proposal: Proposal): string | string[] {
  if (proposal.selectedField === 'verdict.verdictCode') {
    if (!proposal.proposedStoppedVerdict) {
      throw new ContributionImplementationError(
        'invalid_accepted_proposal',
        'The accepted verdict-code proposal has no structured replacement value.',
      )
    }
    return proposal.proposedStoppedVerdict
  }
  if (proposal.proposedValue !== null) return proposal.proposedValue
  const text = proposal.proposedText?.trim()
  if (!text) {
    throw new ContributionImplementationError(
      'invalid_accepted_proposal',
      'The accepted proposal has no replacement value.',
    )
  }
  return text
}

function replacementText(proposal: Proposal): string {
  const value = replacement(proposal)
  return Array.isArray(value) ? value.join('; ') : value
}

function applyProgrammeField(
  scope: typeof programmeVerdictScopeSnapshots.$inferInsert,
  field: ContributionSelectedField,
  value: string | string[],
): void {
  if (Array.isArray(value)) return
  switch (field) {
    case 'programme.title':
      scope.title = value
      break
    case 'programme.indication':
      scope.indication = value
      break
    case 'programme.targetPopulation':
      scope.targetPopulation = value
      break
    case 'programme.status':
      scope.status = value as ProgrammeStatus
      break
    case 'programme.highestPhaseReached':
      scope.highestPhaseReached = value
      break
    case 'programme.route':
      scope.route = value
      break
    case 'programme.doseExposureContext':
      scope.doseExposureContext = value
      break
    case 'programme.rawStoppingReason':
      scope.rawStoppingReason = value
      break
    case 'programme.stoppingReasonCategory':
      scope.stoppingReasonCategory = value as typeof scope.stoppingReasonCategory
      break
  }
}

function applyVerdictField(
  verdict: typeof programmeVerdictRevisions.$inferInsert,
  field: ContributionSelectedField,
  value: string | string[],
): void {
  switch (field) {
    case 'summary.plainMechanism':
      if (!Array.isArray(value)) verdict.plainMechanism = value
      break
    case 'summary.bestSupportedFinding':
      if (!Array.isArray(value)) verdict.bestSupportedFinding = value
      break
    case 'summary.mainLimitation':
      if (!Array.isArray(value)) verdict.mainLimitation = value
      break
    case 'verdict.verdictCode':
      if (!Array.isArray(value)) verdict.verdictCode = value as typeof verdict.verdictCode
      break
    case 'verdict.publicLabel':
      if (!Array.isArray(value)) verdict.publicLabel = value
      break
    case 'verdict.professionalLabel':
      if (!Array.isArray(value)) verdict.professionalLabel = value
      break
    case 'verdict.oneSentenceReason':
      if (!Array.isArray(value)) verdict.oneSentenceReason = value
      break
    case 'verdict.scope.indication':
      if (!Array.isArray(value)) verdict.indicationScope = value
      break
    case 'verdict.scope.population':
      if (!Array.isArray(value)) verdict.populationScope = value
      break
    case 'verdict.scope.doseExposure':
      if (!Array.isArray(value)) verdict.doseExposureScope = value
      break
    case 'verdict.scope.period':
      if (!Array.isArray(value)) verdict.periodScope = value
      break
    case 'verdict.scope.trials':
      if (!Array.isArray(value)) verdict.trialScope = value
      break
    case 'verdict.scope.outcome':
      if (!Array.isArray(value)) verdict.outcomeScope = value
      break
    case 'verdict.whatWasDisproven':
      if (Array.isArray(value)) verdict.whatWasDisproven = value
      break
    case 'verdict.whatWasNotDisproven':
      if (Array.isArray(value)) verdict.whatWasNotDisproven = value
      break
    case 'verdict.whatRemainsUnknown':
      if (Array.isArray(value)) verdict.whatRemainsUnknown = value
      break
    case 'verdict.confidence':
      if (!Array.isArray(value)) verdict.confidence = value as typeof verdict.confidence
      break
    case 'verdict.confidenceExplanation':
      if (!Array.isArray(value)) verdict.confidenceExplanation = value
      break
    case 'verdict.conditionsThatWouldChangeVerdict':
      if (Array.isArray(value)) verdict.conditionsThatWouldChangeVerdict = value
      break
  }
}

async function resolveCitedSource(tx: Transaction, proposal: Proposal) {
  if (!proposal.sourceType || !proposal.sourceLocator || !proposal.sourceIdentifier) {
    throw new ContributionImplementationError(
      'invalid_accepted_proposal',
      'The accepted proposal is missing its frozen source citation.',
    )
  }

  if (proposal.sourceReviewTaskId && proposal.sourceReviewSnapshotId) {
    const rows = await tx
      .select({
        task: evidenceReviewTasks,
        source: evidenceSources,
        snapshot: sourceSnapshots,
        freshness: programmeFreshnessStates,
        delta: evidenceReviewTaskSourceDeltas,
      })
      .from(evidenceReviewTasks)
      .innerJoin(evidenceSources, eq(evidenceSources.id, evidenceReviewTasks.sourceId))
      .innerJoin(
        sourceSnapshots,
        and(
          eq(sourceSnapshots.id, evidenceReviewTasks.triggerSnapshotId),
          eq(sourceSnapshots.sourceId, evidenceReviewTasks.sourceId),
        ),
      )
      .innerJoin(
        programmeFreshnessStates,
        and(
          eq(programmeFreshnessStates.programmeId, evidenceReviewTasks.programmeId),
          eq(programmeFreshnessStates.sourceId, evidenceReviewTasks.sourceId),
        ),
      )
      .leftJoin(
        evidenceReviewTaskSourceDeltas,
        eq(evidenceReviewTaskSourceDeltas.reviewTaskId, evidenceReviewTasks.id),
      )
      .where(
        and(
          eq(evidenceReviewTasks.id, proposal.sourceReviewTaskId),
          eq(evidenceReviewTasks.programmeId, proposal.programmeId),
          eq(evidenceReviewTasks.triggerSnapshotId, proposal.sourceReviewSnapshotId),
          inArray(evidenceReviewTasks.status, ['OPEN', 'IN_REVIEW', 'BLOCKED']),
        ),
      )
      .limit(1)
      // The parser delta is the nullable side for legacy task-bound corrections. PostgreSQL cannot
      // lock a nullable outer-join relation, so lock only the actionable identity/freshness rows and
      // the immutable source snapshot selected through inner joins.
      .for('update', {
        of: [evidenceReviewTasks, evidenceSources, sourceSnapshots, programmeFreshnessStates],
      })
    const binding = rows[0]
    if (
      !binding ||
      binding.freshness.pendingSnapshotId !== proposal.sourceReviewSnapshotId ||
      binding.source.sourceType !== proposal.sourceType ||
      binding.source.externalIdentifier?.trim().toLowerCase() !==
        proposal.sourceIdentifier.trim().toLowerCase() ||
      normalizeLocator(binding.source.canonicalLocator) !== normalizeLocator(proposal.sourceLocator)
    ) {
      throw new ContributionImplementationError(
        'stale_source_review_task',
        'The accepted proposal no longer matches this programme’s exact pending source task.',
      )
    }
    if (proposal.proposalType === 'SOURCE_REFRESH') {
      if (!binding.delta || !proposal.sourceRefreshDeltaSnapshot) {
        throw new ContributionImplementationError(
          'stale_source_review_task',
          'The accepted source refresh is missing its parser-derived saved change.',
        )
      }
      const delta = sourceRefreshDeltaSnapshot(binding.delta)
      if (
        delta.action === 'NEEDS_SCIENTIFIC_REVISION' ||
        delta.scientificRevisionRequirements.length > 0
      ) {
        throw new ContributionImplementationError(
          'needs_scientific_revision',
          'This source change affects scientific claims or interpretation. Revise those items explicitly before canonical implementation.',
        )
      }
      if (
        binding.freshness.currentSnapshotId !== delta.baselineSnapshotId ||
        delta.pendingSnapshotId !== binding.snapshot.id ||
        stableJsonStringify(delta) !== stableJsonStringify(proposal.sourceRefreshDeltaSnapshot)
      ) {
        throw new ContributionImplementationError(
          'stale_source_review_task',
          'The accepted source refresh no longer matches the exact parser-derived task change.',
        )
      }
    }
    return binding
  }

  const sourceRows = await tx
    .select()
    .from(evidenceSources)
    .where(
      and(
        eq(evidenceSources.sourceType, proposal.sourceType),
        sql`lower(${evidenceSources.externalIdentifier}) = lower(${proposal.sourceIdentifier})`,
      ),
    )
    .orderBy(asc(evidenceSources.id))
    .for('share')
  const source = sourceRows.find(
    (row) => normalizeLocator(row.canonicalLocator) === normalizeLocator(proposal.sourceLocator!),
  )
  if (
    !source ||
    source.correctionStatus === 'RETRACTED' ||
    source.correctionStatus === 'WITHDRAWN'
  ) {
    throw new ContributionImplementationError(
      'source_review_required',
      'This citation is not a current, verified RNAWiki source. A source steward must review it before implementation.',
    )
  }
  const freshnessRows = await tx
    .select()
    .from(programmeFreshnessStates)
    .where(
      and(
        eq(programmeFreshnessStates.programmeId, proposal.programmeId),
        eq(programmeFreshnessStates.sourceId, source.id),
      ),
    )
    .limit(1)
    .for('share')
  const freshness = freshnessRows[0]
  if (!freshness?.currentSnapshotId || freshness.pendingSnapshotId) {
    throw new ContributionImplementationError(
      'source_review_required',
      'This citation has no verified current snapshot, or it has a newer change awaiting review.',
    )
  }
  const snapshots = await tx
    .select()
    .from(sourceSnapshots)
    .where(
      and(
        eq(sourceSnapshots.id, freshness.currentSnapshotId),
        eq(sourceSnapshots.sourceId, source.id),
      ),
    )
    .limit(1)
    .for('share')
  if (!snapshots[0]) {
    throw new ContributionImplementationError(
      'source_review_required',
      'The verified citation snapshot is missing.',
    )
  }
  return { task: null, source, snapshot: snapshots[0], freshness, delta: null }
}

async function snapshotLineageIncludes(args: {
  tx: Transaction
  sourceId: string
  descendantSnapshotId: string
  ancestorSnapshotId: string
}): Promise<boolean> {
  const rows = await args.tx
    .select({ id: sourceSnapshots.id, previousSnapshotId: sourceSnapshots.previousSnapshotId })
    .from(sourceSnapshots)
    .where(eq(sourceSnapshots.sourceId, args.sourceId))
  const previousById = new Map(rows.map((row) => [row.id, row.previousSnapshotId]))
  const visited = new Set<string>()
  let cursor: string | null = args.descendantSnapshotId
  while (cursor && !visited.has(cursor)) {
    if (cursor === args.ancestorSnapshotId) return true
    visited.add(cursor)
    cursor = previousById.get(cursor) ?? null
  }
  return false
}

function unpublishedProgrammeField(
  programme: typeof developmentProgrammes.$inferSelect,
  field: ContributionSelectedField,
): unknown {
  switch (field) {
    case 'programme.title':
      return programme.title
    case 'programme.indication':
      return programme.indication
    case 'programme.targetPopulation':
      return programme.targetPopulation
    case 'programme.status':
      return programme.status
    case 'programme.highestPhaseReached':
      return programme.highestPhaseReached
    case 'programme.route':
      return programme.route
    case 'programme.doseExposureContext':
      return programme.doseExposureContext
    case 'programme.rawStoppingReason':
      return programme.rawStoppingReason
    case 'programme.stoppingReasonCategory':
      return programme.stoppingReasonCategory
    default:
      return undefined
  }
}

async function resolveStrictlyUnpublishedSourceTask(args: {
  tx: Transaction
  proposal: Proposal
  actorUserId: string
}): Promise<ResolvedUnpublishedSourceTask> {
  const { tx, proposal } = args
  if (!proposal.sourceReviewTaskId || !proposal.sourceReviewSnapshotId) {
    throw new ContributionImplementationError(
      'stale_public_baseline',
      'This programme has no public conclusion. A new conclusion requires a complete evidence authoring workflow.',
    )
  }
  const graphRows = await Promise.all([
    tx
      .select({ id: claims.id })
      .from(claims)
      .where(eq(claims.programmeId, proposal.programmeId))
      .limit(1)
      .for('share'),
    tx
      .select({ id: evidenceNodes.id })
      .from(evidenceNodes)
      .where(eq(evidenceNodes.programmeId, proposal.programmeId))
      .limit(1)
      .for('share'),
    tx
      .select({ id: trialInterpretabilityAssessments.id })
      .from(trialInterpretabilityAssessments)
      .where(eq(trialInterpretabilityAssessments.programmeId, proposal.programmeId))
      .limit(1)
      .for('share'),
    tx
      .select({ id: programmeVerdictRevisions.id })
      .from(programmeVerdictRevisions)
      .where(eq(programmeVerdictRevisions.programmeId, proposal.programmeId))
      .limit(1)
      .for('share'),
    tx
      .select({ id: programmeDependencies.id })
      .from(programmeDependencies)
      .where(eq(programmeDependencies.programmeId, proposal.programmeId))
      .limit(1)
      .for('share'),
  ])
  if (graphRows.some((rows) => rows.length > 0)) {
    throw new ContributionImplementationError(
      'stale_public_baseline',
      'This programme has scientific evidence but no public conclusion. Complete the full evidence-and-verdict workflow instead of resolving it as metadata.',
    )
  }
  const cited = await resolveCitedSource(tx, proposal)
  if (!cited.task || cited.source.sourceType !== 'CLINICAL_TRIAL_REGISTRY') {
    throw new ContributionImplementationError(
      'source_review_required',
      'Only an exact task-bound ClinicalTrials.gov record can use the conclusion-free metadata path.',
    )
  }
  const programmeRows = await tx
    .select({ programme: developmentProgrammes, medicine: drugs })
    .from(developmentProgrammes)
    .innerJoin(drugs, eq(drugs.id, developmentProgrammes.drugId))
    .where(eq(developmentProgrammes.id, proposal.programmeId))
    .limit(1)
    .for('update')
  const programmeEntry = programmeRows[0]
  if (!programmeEntry) {
    throw new ContributionImplementationError(
      'stale_public_baseline',
      'The unpublished programme no longer exists.',
    )
  }
  if (
    stableJsonStringify(
      unpublishedProgrammeField(programmeEntry.programme, proposal.selectedField!),
    ) !== stableJsonStringify(proposal.currentValueSnapshot?.value)
  ) {
    throw new ContributionImplementationError(
      'stale_public_baseline',
      'The unpublished programme changed after this correction was submitted.',
    )
  }
  const aliases = await tx
    .select({ alias: drugAliases.alias })
    .from(drugAliases)
    .where(eq(drugAliases.drugId, programmeEntry.medicine.id))
    .orderBy(asc(drugAliases.alias))
    .for('share')
  const nctId = cited.source.externalIdentifier?.trim().toUpperCase()
  if (!nctId || !/^NCT\d{8}$/.test(nctId)) {
    throw new ContributionImplementationError(
      'stale_source_review_task',
      'The registry source does not have one valid NCT identifier.',
    )
  }
  const facts = parseClinicalTrialsRegistryFacts(
    storedAdapterSnapshot(cited.source, cited.snapshot),
    nctId,
    {
      id: programmeEntry.medicine.id,
      slug: programmeEntry.medicine.slug,
      name: programmeEntry.medicine.name,
      aliases: aliases.map((row) => row.alias),
    },
  )
  const exactProgrammeValues: Partial<Record<ContributionSelectedField, unknown>> = {
    'programme.title': facts.briefTitle,
    'programme.indication': facts.conditions.length > 0 ? facts.conditions.join('; ') : null,
    'programme.status': clinicalTrialsProgrammeStatus(facts.overallStatus),
    'programme.highestPhaseReached': clinicalTrialsPhaseLabel(facts.phases),
  }
  const exactSelectedValue = exactProgrammeValues[proposal.selectedField!]
  if (
    exactSelectedValue === undefined ||
    stableJsonStringify(replacement(proposal)) !== stableJsonStringify(exactSelectedValue)
  ) {
    throw new ContributionImplementationError(
      'source_review_required',
      'This correction is not an exact programme field verified by the registry parser. A full evidence workflow is required.',
    )
  }
  const trialRows = await tx
    .select()
    .from(programmeTrials)
    .where(
      and(
        eq(programmeTrials.programmeId, proposal.programmeId),
        eq(programmeTrials.trialIdentifier, nctId),
      ),
    )
    .for('update')
  if (trialRows.length !== 1) {
    throw new ContributionImplementationError(
      'stale_source_review_task',
      'The registry correction must map to exactly one normalized trial.',
    )
  }
  const resolvedAt = new Date()
  const startDate = clinicalTrialsExactDate(facts.startDate)
  const primaryCompletionDate = clinicalTrialsExactDate(facts.primaryCompletionDate)
  const completionDate = clinicalTrialsExactDate(facts.completionDate)
  await tx
    .update(developmentProgrammes)
    .set({
      title: facts.briefTitle,
      indication: facts.conditions.length > 0 ? facts.conditions.join('; ') : null,
      sponsor: facts.sponsor,
      status: clinicalTrialsProgrammeStatus(facts.overallStatus),
      highestPhaseReached: clinicalTrialsPhaseLabel(facts.phases),
      startDate,
      endDate: completionDate,
      updateStatus: 'CURRENT',
      updatedAt: resolvedAt,
    })
    .where(eq(developmentProgrammes.id, proposal.programmeId))
  await tx
    .update(programmeTrials)
    .set({
      title: facts.briefTitle,
      phase: clinicalTrialsPhaseLabel(facts.phases),
      status: clinicalTrialsTrialStatus(facts.overallStatus),
      resultsStatus: clinicalTrialsResultsStatus(facts.hasResults),
      enrolment: facts.enrollmentCount,
      enrolmentType: clinicalTrialsEnrollmentType(facts.enrollmentType),
      startDate,
      primaryCompletionDate,
      completionDate,
      registrySourceId: cited.source.id,
      registrySnapshotId: cited.snapshot.id,
      lastVerifiedAt: cited.snapshot.lastVerifiedAt ?? cited.snapshot.retrievedAt,
      updatedAt: resolvedAt,
    })
    .where(eq(programmeTrials.id, trialRows[0]!.id))
  await tx
    .update(evidenceSources)
    .set({
      title: facts.briefTitle,
      sponsor: facts.sponsor,
      updatedAt: resolvedAt,
    })
    .where(eq(evidenceSources.id, cited.source.id))
  await tx.insert(programmeContributionSourceTaskResolutions).values({
    proposalId: proposal.id,
    programmeId: proposal.programmeId,
    proposalKey: proposal.proposalKey,
    sourceReviewTaskId: cited.task.id,
    sourceId: cited.source.id,
    sourceSnapshotId: cited.snapshot.id,
    resolvedByUserId: args.actorUserId,
    contributionDigestAlgorithm: 'sha256',
    contributionDigest: proposal.contentDigest!,
    createdAt: resolvedAt,
  })
  const freshnessRows = await tx
    .update(programmeFreshnessStates)
    .set({
      currentSnapshotId: cited.snapshot.id,
      pendingSnapshotId: null,
      freshnessStatus: 'CURRENT',
      lastVerifiedAt: resolvedAt,
      updatedAt: resolvedAt,
    })
    .where(
      and(
        eq(programmeFreshnessStates.programmeId, proposal.programmeId),
        eq(programmeFreshnessStates.sourceId, cited.source.id),
        eq(programmeFreshnessStates.pendingSnapshotId, cited.snapshot.id),
      ),
    )
    .returning({ programmeId: programmeFreshnessStates.programmeId })
  if (!freshnessRows[0]) {
    throw new ContributionImplementationError(
      'stale_source_review_task',
      'The pending registry snapshot changed while this correction was being finalized.',
    )
  }
  const taskRows = await tx
    .update(evidenceReviewTasks)
    .set({
      status: 'RESOLVED',
      resolutionNote: `Exact registry metadata accepted in contribution ${proposal.id}; no conclusion was created.`,
      resolvedByUserId: args.actorUserId,
      resolutionVerdictRevisionId: null,
      resolutionContributionProposalId: proposal.id,
      resolvedAt,
      updatedAt: resolvedAt,
    })
    .where(
      and(
        eq(evidenceReviewTasks.id, cited.task.id),
        inArray(evidenceReviewTasks.status, ['OPEN', 'IN_REVIEW', 'BLOCKED']),
      ),
    )
    .returning({ id: evidenceReviewTasks.id })
  if (!taskRows[0]) {
    throw new ContributionImplementationError(
      'stale_source_review_task',
      'The registry review task changed while this correction was being finalized.',
    )
  }
  return {
    outcome: 'UNPUBLISHED_SOURCE_TASK_RESOLVED',
    proposalId: proposal.id,
    programmeId: proposal.programmeId,
    sourceReviewTaskId: cited.task.id,
    sourceSnapshotId: cited.snapshot.id,
    resolvedAt: resolvedAt.toISOString(),
    reused: false,
    createsConclusion: false,
  }
}

/**
 * Turns one unchanged accepted contribution into a fully prepared canonical candidate. The entire
 * graph clone, selected edit, exact citation, RNA Intelligence B–H run, and digest freeze share one
 * transaction: any failed scientific gate rolls every new row back.
 */
export async function materializeAcceptedContributionCandidate(args: {
  proposalId: string
  implementedByUserId: string
}): Promise<AcceptedContributionImplementationResult> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended('canonical-contribution:' || ${args.proposalId}, 0))`,
    )

    const actorRows = await tx
      .select()
      .from(users)
      .where(eq(users.id, args.implementedByUserId))
      .limit(1)
      .for('share')
    const actor = actorRows[0]
    if (!actor || (!actor.isAdmin && actor.trustTier !== 'steward')) {
      throw new ContributionImplementationError(
        'not_authorized',
        'Canonical implementation requires a steward or administrator.',
      )
    }

    const existingRows = await tx
      .select({
        implementation: programmeContributionImplementations,
        verdict: programmeVerdictRevisions,
      })
      .from(programmeContributionImplementations)
      .innerJoin(
        programmeVerdictRevisions,
        eq(programmeVerdictRevisions.id, programmeContributionImplementations.verdictRevisionId),
      )
      .where(eq(programmeContributionImplementations.proposalId, args.proposalId))
      .limit(1)
      .for('share')
    if (existingRows[0]) {
      const { verdict, implementation } = existingRows[0]
      const expectedEngineVersion =
        verdict.presentationSchemaVersion === 'programme-presentation/v1'
          ? EVIDENCE_PRESENTATION_ENGINE_VERSION
          : verdict.presentationSchemaVersion === null
            ? EVIDENCE_ENGINE_VERSION
            : null
      if (
        !verdict.proposalDigest ||
        expectedEngineVersion === null ||
        verdict.engineVersion !== expectedEngineVersion ||
        !verdict.inputDigest
      ) {
        throw new ContributionImplementationError(
          'invalid_accepted_proposal',
          'The existing implementation is incomplete and requires steward investigation.',
        )
      }
      return {
        outcome: 'CANONICAL_CANDIDATE',
        proposalId: implementation.proposalId,
        revisionId: verdict.id,
        programmeId: verdict.programmeId,
        proposalDigestAlgorithm: 'sha256',
        proposalDigest: verdict.proposalDigest,
        engineVersion: expectedEngineVersion,
        inputDigestAlgorithm: 'sha256',
        inputDigest: verdict.inputDigest,
        reused: true,
      }
    }

    const existingSourceResolutionRows = await tx
      .select()
      .from(programmeContributionSourceTaskResolutions)
      .where(eq(programmeContributionSourceTaskResolutions.proposalId, args.proposalId))
      .limit(1)
      .for('share')
    const existingSourceResolution = existingSourceResolutionRows[0]
    if (existingSourceResolution) {
      return {
        outcome: 'UNPUBLISHED_SOURCE_TASK_RESOLVED',
        proposalId: existingSourceResolution.proposalId,
        programmeId: existingSourceResolution.programmeId,
        sourceReviewTaskId: existingSourceResolution.sourceReviewTaskId,
        sourceSnapshotId: existingSourceResolution.sourceSnapshotId,
        resolvedAt: existingSourceResolution.createdAt.toISOString(),
        reused: true,
        createsConclusion: false,
      }
    }

    const proposalRows = await tx
      .select({
        proposal: programmeContributionProposals,
        reviewStatus: programmeContributionReviewStates.status,
        author: users,
      })
      .from(programmeContributionProposals)
      .innerJoin(
        programmeContributionReviewStates,
        eq(programmeContributionReviewStates.proposalId, programmeContributionProposals.id),
      )
      .innerJoin(users, eq(users.id, programmeContributionProposals.authorUserId))
      .where(eq(programmeContributionProposals.id, args.proposalId))
      .limit(1)
      .for('update')
    const accepted = proposalRows[0]
    if (!accepted) {
      throw new ContributionImplementationError(
        'proposal_not_found',
        'No contribution proposal matches this id.',
      )
    }
    const proposal = accepted.proposal
    const isSourceRefresh = proposal.proposalType === 'SOURCE_REFRESH'
    const sourceRefreshReady =
      isSourceRefresh &&
      proposal.sourceRefreshDeltaSnapshot?.action === 'CANONICAL_REFRESH' &&
      proposal.sourceRefreshDeltaSnapshot.scientificRevisionRequirements.length === 0 &&
      proposal.selectedField === null &&
      proposal.currentValueSnapshot === null
    if (
      proposal.status !== 'SUBMITTED' ||
      accepted.reviewStatus !== 'ACCEPTED_FOR_IMPLEMENTATION' ||
      !proposal.contentDigest ||
      (isSourceRefresh
        ? !sourceRefreshReady
        : !proposal.selectedField || !proposal.currentValueSnapshot)
    ) {
      if (
        isSourceRefresh &&
        proposal.sourceRefreshDeltaSnapshot?.action === 'NEEDS_SCIENTIFIC_REVISION'
      ) {
        throw new ContributionImplementationError(
          'needs_scientific_revision',
          'This source task requires explicit scientific revisions and cannot be implemented as an automatic fact refresh.',
        )
      }
      throw new ContributionImplementationError(
        'not_accepted',
        'Only a frozen proposal accepted by the contribution-review workflow can be implemented.',
      )
    }

    const pointerRows = await tx
      .select({ pointer: programmeCurrentPublications, verdict: programmeVerdictRevisions })
      .from(programmeCurrentPublications)
      .innerJoin(
        programmeVerdictRevisions,
        eq(programmeVerdictRevisions.id, programmeCurrentPublications.verdictRevisionId),
      )
      .where(eq(programmeCurrentPublications.programmeId, proposal.programmeId))
      .limit(1)
      .for('update')
    const current = pointerRows[0]
    if (!isSourceRefresh && !current && proposal.currentVerdictRevisionId === null) {
      return resolveStrictlyUnpublishedSourceTask({
        tx,
        proposal,
        actorUserId: actor.id,
      })
    }
    if (
      !current ||
      current.verdict.reviewStatus !== 'PUBLISHED' ||
      current.verdict.id !== proposal.currentVerdictRevisionId
    ) {
      throw new ContributionImplementationError(
        'stale_public_baseline',
        'The public conclusion changed after this contribution was submitted. Review a new proposal against the current version.',
      )
    }
    const scopeRows = await tx
      .select()
      .from(programmeVerdictScopeSnapshots)
      .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, current.verdict.id))
      .limit(1)
      .for('share')
    const currentScope = scopeRows[0]
    if (!currentScope) {
      throw new ContributionImplementationError(
        'stale_public_baseline',
        'The current publication has no immutable programme-scope snapshot.',
      )
    }

    const cited = await resolveCitedSource(tx, proposal)
    const value = isSourceRefresh ? null : replacement(proposal)
    const revisionId = newId('verdict')
    const materializedAt = new Date()
    const latestRevisionRows = await tx
      .select({ revisionNumber: programmeVerdictRevisions.revisionNumber })
      .from(programmeVerdictRevisions)
      .where(eq(programmeVerdictRevisions.programmeId, proposal.programmeId))
      .orderBy(desc(programmeVerdictRevisions.revisionNumber))
      .limit(1)
      .for('share')
    const nextRevisionNumber = (latestRevisionRows[0]?.revisionNumber ?? 0) + 1
    const candidate: typeof programmeVerdictRevisions.$inferInsert = {
      ...current.verdict,
      id: revisionId,
      revisionNumber: nextRevisionNumber,
      previousVerdictRevisionId: current.verdict.id,
      reviewStatus: 'DRAFT',
      authorUserId: proposal.authorUserId,
      authorName: accepted.author.name,
      conflictsOfInterest: proposal.conflictsOfInterest,
      adjudicationRationale: null,
      adjudicatorUserId: null,
      proposalAsOfDate: materializedAt.toISOString().slice(0, 10),
      engineVersion: null,
      inputDigest: null,
      proposalDigest: null,
      proposalPreparedAt: null,
      createdAt: materializedAt,
      reviewedAt: null,
      publishedAt: null,
      supersededAt: null,
    }
    const candidateScope: typeof programmeVerdictScopeSnapshots.$inferInsert = {
      ...currentScope,
      verdictRevisionId: revisionId,
      capturedAt: materializedAt,
    }
    if (!isSourceRefresh && proposal.selectedField && value !== null) {
      applyProgrammeField(candidateScope, proposal.selectedField, value)
      applyVerdictField(candidate, proposal.selectedField, value)
    }
    candidate.programmeStatusAtReview = candidateScope.status
    if (isStopped(candidateScope.status) !== Boolean(candidate.verdictCode)) {
      throw new ContributionImplementationError(
        'coupled_change_required',
        'This status change also requires a compatible verdict-code change. Submit and review the coupled scientific change explicitly.',
      )
    }
    await tx.insert(programmeVerdictRevisions).values(candidate)
    await tx.insert(programmeVerdictScopeSnapshots).values(candidateScope)

    const [
      trialLinks,
      trialSnapshots,
      nodeLinks,
      assessmentLinks,
      verdictClaimLinks,
      verdictDeps,
      mechanismSteps,
      mechanismStepClaims,
      timelineEvents,
      timelineEventClaims,
    ] = await Promise.all([
      tx
        .select()
        .from(programmeVerdictTrials)
        .where(eq(programmeVerdictTrials.verdictRevisionId, current.verdict.id))
        .orderBy(asc(programmeVerdictTrials.programmeTrialId))
        .for('share'),
      tx
        .select()
        .from(programmeVerdictTrialSnapshots)
        .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, current.verdict.id))
        .orderBy(asc(programmeVerdictTrialSnapshots.programmeTrialId))
        .for('share'),
      tx
        .select()
        .from(programmeVerdictEvidenceNodes)
        .where(eq(programmeVerdictEvidenceNodes.verdictRevisionId, current.verdict.id))
        .orderBy(asc(programmeVerdictEvidenceNodes.evidenceNodeId))
        .for('share'),
      tx
        .select()
        .from(programmeVerdictInterpretabilityAssessments)
        .where(
          eq(programmeVerdictInterpretabilityAssessments.verdictRevisionId, current.verdict.id),
        )
        .orderBy(asc(programmeVerdictInterpretabilityAssessments.assessmentId))
        .for('share'),
      tx
        .select()
        .from(programmeVerdictClaims)
        .where(eq(programmeVerdictClaims.verdictRevisionId, current.verdict.id))
        .orderBy(asc(programmeVerdictClaims.claimId))
        .for('share'),
      tx
        .select()
        .from(programmeDependencies)
        .where(eq(programmeDependencies.verdictRevisionId, current.verdict.id))
        .orderBy(asc(programmeDependencies.id))
        .for('share'),
      tx
        .select()
        .from(programmeVerdictMechanismSteps)
        .where(eq(programmeVerdictMechanismSteps.verdictRevisionId, current.verdict.id))
        .orderBy(asc(programmeVerdictMechanismSteps.stepOrder))
        .for('share'),
      tx
        .select()
        .from(programmeVerdictMechanismStepClaims)
        .where(eq(programmeVerdictMechanismStepClaims.verdictRevisionId, current.verdict.id))
        .orderBy(
          asc(programmeVerdictMechanismStepClaims.stepKey),
          asc(programmeVerdictMechanismStepClaims.claimId),
        )
        .for('share'),
      tx
        .select()
        .from(programmeVerdictTimelineEvents)
        .where(eq(programmeVerdictTimelineEvents.verdictRevisionId, current.verdict.id))
        .orderBy(
          asc(programmeVerdictTimelineEvents.eventDate),
          asc(programmeVerdictTimelineEvents.eventKey),
        )
        .for('share'),
      tx
        .select()
        .from(programmeVerdictTimelineEventClaims)
        .where(eq(programmeVerdictTimelineEventClaims.verdictRevisionId, current.verdict.id))
        .orderBy(
          asc(programmeVerdictTimelineEventClaims.eventKey),
          asc(programmeVerdictTimelineEventClaims.claimId),
        )
        .for('share'),
    ])
    if (trialLinks.length === 0 || trialSnapshots.length !== trialLinks.length) {
      throw new ContributionImplementationError(
        'stale_public_baseline',
        'The current publication has an incomplete immutable trial bundle.',
      )
    }

    if (cited.task) {
      const currentSourceSnapshotId = cited.freshness.currentSnapshotId
      if (
        !currentSourceSnapshotId ||
        !(await snapshotLineageIncludes({
          tx,
          sourceId: cited.source.id,
          descendantSnapshotId: cited.snapshot.id,
          ancestorSnapshotId: currentSourceSnapshotId,
        }))
      ) {
        throw new ContributionImplementationError(
          'stale_source_review_task',
          'The pending source version is not in the exact immutable lineage of the currently verified version.',
        )
      }
      const nodeIds = nodeLinks.map((row) => row.evidenceNodeId)
      const assessmentIds = assessmentLinks.map((row) => row.assessmentId)
      const [nodeClaimLinks, assessmentClaimLinks] = await Promise.all([
        nodeIds.length > 0
          ? tx
              .select({ claimId: evidenceNodeClaims.claimId })
              .from(evidenceNodeClaims)
              .where(inArray(evidenceNodeClaims.evidenceNodeId, nodeIds))
              .for('share')
          : Promise.resolve([]),
        assessmentIds.length > 0
          ? tx
              .select({ claimId: trialInterpretabilityClaims.claimId })
              .from(trialInterpretabilityClaims)
              .where(inArray(trialInterpretabilityClaims.assessmentId, assessmentIds))
              .for('share')
          : Promise.resolve([]),
      ])
      const reviewedClaimIds = [
        ...new Set([
          ...verdictClaimLinks.map((row) => row.claimId),
          ...nodeClaimLinks.map((row) => row.claimId),
          ...assessmentClaimLinks.map((row) => row.claimId),
          ...mechanismStepClaims.map((row) => row.claimId),
          ...timelineEventClaims.map((row) => row.claimId),
        ]),
      ]
      const citedClaimSnapshots =
        reviewedClaimIds.length > 0
          ? await tx
              .select({
                claimId: claimSourceLinks.claimId,
                sourceSnapshotId: claimSourceLinks.sourceSnapshotId,
              })
              .from(claimSourceLinks)
              .innerJoin(sourceSnapshots, eq(sourceSnapshots.id, claimSourceLinks.sourceSnapshotId))
              .where(
                and(
                  eq(claimSourceLinks.programmeId, proposal.programmeId),
                  inArray(claimSourceLinks.claimId, reviewedClaimIds),
                  eq(sourceSnapshots.sourceId, cited.source.id),
                ),
              )
              .orderBy(asc(claimSourceLinks.claimId), asc(claimSourceLinks.sourceSnapshotId))
              .for('share')
          : []
      if (citedClaimSnapshots.some((row) => row.sourceSnapshotId !== currentSourceSnapshotId)) {
        throw new ContributionImplementationError(
          'claim_rewrite_required',
          'A reviewed claim cites a different source lineage. Rewrite that claim explicitly before implementing this pending update.',
        )
      }
      if (
        trialSnapshots.some(
          (row) =>
            row.registrySourceId === cited.source.id &&
            row.registrySnapshotId !== currentSourceSnapshotId,
        )
      ) {
        throw new ContributionImplementationError(
          'claim_rewrite_required',
          'A reviewed trial cites a different source lineage. Rewrite that trial evidence explicitly before implementing this pending update.',
        )
      }
      if (
        timelineEvents.some(
          (row) =>
            row.sourceId === cited.source.id && row.sourceSnapshotId !== currentSourceSnapshotId,
        )
      ) {
        throw new ContributionImplementationError(
          'claim_rewrite_required',
          'A timeline event is not tied to the pending snapshot’s one exact current predecessor. Rewrite that event explicitly before implementation.',
        )
      }
    }

    const clinicalTrialUpdate = await pendingClinicalTrialUpdate({
      tx,
      proposal,
      cited,
      trialSnapshots,
    })
    if (clinicalTrialUpdate && trialSnapshots.length === 1) {
      candidateScope.status = clinicalTrialUpdate.programmeStatus
      candidateScope.highestPhaseReached = clinicalTrialUpdate.highestPhaseReached
      candidateScope.sponsor = clinicalTrialUpdate.sponsor
      candidateScope.startDate = clinicalTrialUpdate.programmeStartDate
      candidateScope.endDate = clinicalTrialUpdate.programmeEndDate
      candidate.programmeStatusAtReview = candidateScope.status
      if (isStopped(candidateScope.status) !== Boolean(candidate.verdictCode)) {
        throw new ContributionImplementationError(
          'needs_scientific_revision',
          'The exact registry status would make the current conclusion internally inconsistent. Revise the stopped-programme conclusion explicitly before publication.',
        )
      }
      await tx
        .update(programmeVerdictScopeSnapshots)
        .set({
          status: candidateScope.status,
          highestPhaseReached: candidateScope.highestPhaseReached,
          sponsor: candidateScope.sponsor,
          startDate: candidateScope.startDate,
          endDate: candidateScope.endDate,
        })
        .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, revisionId))
      await tx
        .update(programmeVerdictRevisions)
        .set({ programmeStatusAtReview: candidate.programmeStatusAtReview })
        .where(eq(programmeVerdictRevisions.id, revisionId))
    }
    const candidateTrialSnapshots = trialSnapshots.map((row) =>
      clinicalTrialUpdate?.programmeTrialId === row.programmeTrialId
        ? { ...row, ...clinicalTrialUpdate }
        : row,
    )
    await tx.insert(programmeVerdictTrials).values(
      trialLinks.map((row) => ({
        programmeId: row.programmeId,
        verdictRevisionId: revisionId,
        programmeTrialId: row.programmeTrialId,
      })),
    )
    await tx.insert(programmeVerdictTrialSnapshots).values(
      candidateTrialSnapshots.map((row) => ({
        ...row,
        verdictRevisionId: revisionId,
        capturedAt: materializedAt,
      })),
    )
    if (assessmentLinks.length > 0) {
      await tx.insert(programmeVerdictInterpretabilityAssessments).values(
        assessmentLinks.map((row) => ({
          programmeId: row.programmeId,
          verdictRevisionId: revisionId,
          assessmentId: row.assessmentId,
        })),
      )
    }
    if (
      current.verdict.presentationSchemaVersion === 'programme-presentation/v1' &&
      (mechanismSteps.length < 3 || mechanismSteps.length > 5)
    ) {
      throw new ContributionImplementationError(
        'stale_public_baseline',
        'The current publication has an incomplete immutable presentation bundle.',
      )
    }
    if (mechanismSteps.length > 0) {
      await tx.insert(programmeVerdictMechanismSteps).values(
        mechanismSteps.map((row) => ({
          ...row,
          verdictRevisionId: revisionId,
          createdAt: materializedAt,
        })),
      )
    }
    if (mechanismStepClaims.length > 0) {
      await tx.insert(programmeVerdictMechanismStepClaims).values(
        mechanismStepClaims.map((row) => ({
          ...row,
          verdictRevisionId: revisionId,
          createdAt: materializedAt,
        })),
      )
    }
    if (timelineEvents.length > 0) {
      await tx.insert(programmeVerdictTimelineEvents).values(
        timelineEvents.map((row) => ({
          ...row,
          verdictRevisionId: revisionId,
          createdAt: materializedAt,
        })),
      )
    }
    if (timelineEventClaims.length > 0) {
      await tx.insert(programmeVerdictTimelineEventClaims).values(
        timelineEventClaims.map((row) => ({
          ...row,
          verdictRevisionId: revisionId,
          createdAt: materializedAt,
        })),
      )
    }

    let candidateNodeIds = nodeLinks.map((row) => row.evidenceNodeId)
    let newEvidenceNodeId: string | null = null
    if (proposal.selectedField && isEvidenceNodeContributionField(proposal.selectedField)) {
      if (!proposal.evidenceNodeId || !candidateNodeIds.includes(proposal.evidenceNodeId)) {
        throw new ContributionImplementationError(
          'stale_public_baseline',
          'The selected evidence node is not part of the current published conclusion.',
        )
      }
      const nodeRows = await tx
        .select()
        .from(evidenceNodes)
        .where(eq(evidenceNodes.id, proposal.evidenceNodeId))
        .limit(1)
        .for('share')
      const oldNode = nodeRows[0]
      if (!oldNode) {
        throw new ContributionImplementationError(
          'stale_public_baseline',
          'The selected evidence-node revision is missing.',
        )
      }
      newEvidenceNodeId = newId('node')
      const newNode: typeof evidenceNodes.$inferInsert = {
        ...oldNode,
        id: newEvidenceNodeId,
        revisionNumber: oldNode.revisionNumber + 1,
        previousEvidenceNodeId: oldNode.id,
        reviewStatus: 'DRAFT',
        authorUserId: proposal.authorUserId,
        createdAt: materializedAt,
        publishedAt: null,
        supersededAt: null,
      }
      if (proposal.selectedField === 'evidenceNode.state' && !Array.isArray(value)) {
        newNode.state = value as typeof newNode.state
      } else if (proposal.selectedField === 'evidenceNode.plainSummary' && !Array.isArray(value)) {
        newNode.plainSummary = value
      } else if (
        proposal.selectedField === 'evidenceNode.professionalSummary' &&
        !Array.isArray(value)
      ) {
        newNode.professionalSummary = value
      } else if (proposal.selectedField === 'evidenceNode.rationale' && !Array.isArray(value)) {
        newNode.rationale = value
      }
      await tx.insert(evidenceNodes).values(newNode)
      const oldNodeClaims = await tx
        .select()
        .from(evidenceNodeClaims)
        .where(eq(evidenceNodeClaims.evidenceNodeId, oldNode.id))
        .orderBy(asc(evidenceNodeClaims.claimId))
        .for('share')
      if (oldNodeClaims.length > 0) {
        await tx.insert(evidenceNodeClaims).values(
          oldNodeClaims.map((row) => ({
            programmeId: row.programmeId,
            evidenceNodeId: newEvidenceNodeId as string,
            claimId: row.claimId,
            relationship: row.relationship,
          })),
        )
      }
      const oldNodeDeps = await tx
        .select()
        .from(programmeDependencies)
        .where(eq(programmeDependencies.evidenceNodeId, oldNode.id))
        .orderBy(asc(programmeDependencies.id))
        .for('share')
      if (oldNodeDeps.length > 0) {
        await tx.insert(programmeDependencies).values(
          oldNodeDeps.map((row) => ({
            ...row,
            id: newId('dependency'),
            evidenceNodeId: newEvidenceNodeId,
            verdictRevisionId: null,
            createdAt: materializedAt,
          })),
        )
      }
      candidateNodeIds = candidateNodeIds.map((id) =>
        id === oldNode.id ? (newEvidenceNodeId as string) : id,
      )
    }
    if (candidateNodeIds.length > 0) {
      await tx.insert(programmeVerdictEvidenceNodes).values(
        candidateNodeIds.map((evidenceNodeId) => ({
          programmeId: proposal.programmeId,
          verdictRevisionId: revisionId,
          evidenceNodeId,
        })),
      )
    }

    const inheritedVerdictClaimLinks = verdictClaimLinks.map((row) => ({
      programmeId: row.programmeId,
      verdictRevisionId: revisionId,
      claimId: row.claimId,
      relationship: row.relationship,
    }))
    if (isSourceRefresh) {
      if (inheritedVerdictClaimLinks.length > 0) {
        await tx.insert(programmeVerdictClaims).values(inheritedVerdictClaimLinks)
      }
    } else {
      const selectedField = proposal.selectedField
      if (!selectedField) {
        throw new ContributionImplementationError(
          'invalid_accepted_proposal',
          'The accepted correction has no exact target field.',
        )
      }
      const claimId = newId('claim')
      await tx.insert(claims).values({
        id: claimId,
        programmeId: proposal.programmeId,
        claimKey: `accepted.${proposal.proposalKey}`.slice(0, 128),
        revisionNumber: 1,
        evidenceNodeType: newEvidenceNodeId
          ? (
              await tx
                .select({ nodeType: evidenceNodes.nodeType })
                .from(evidenceNodes)
                .where(eq(evidenceNodes.id, newEvidenceNodeId))
                .limit(1)
            )[0]?.nodeType
          : null,
        nature: proposal.claimNature ?? 'UNKNOWN',
        direction: 'NOT_APPLICABLE',
        reviewStatus: 'DRAFT',
        plainLanguageText: replacementText(proposal),
        technicalText: proposal.reasoning,
        reviewerInterpretation: proposal.whatWasWrongOrMissing,
        stoppingReason: selectedField === 'programme.stoppingReasonCategory',
        authorUserId: proposal.authorUserId,
        createdAt: materializedAt,
      })
      await tx.insert(claimSourceLinks).values({
        programmeId: proposal.programmeId,
        claimId,
        relationship: 'SUPPORTS',
        sourceSnapshotId: cited.snapshot.id,
        sourceLocator: cited.source.canonicalLocator,
      })
      await tx.insert(programmeVerdictClaims).values([
        ...inheritedVerdictClaimLinks,
        {
          programmeId: proposal.programmeId,
          verdictRevisionId: revisionId,
          claimId,
          relationship: 'SUPPORTING' as const,
        },
      ])
      if (newEvidenceNodeId) {
        await tx.insert(evidenceNodeClaims).values({
          programmeId: proposal.programmeId,
          evidenceNodeId: newEvidenceNodeId,
          claimId,
          relationship: 'SUPPORTS',
        })
      }

      const contributionDependencyPaths = [
        selectedField,
        ...(cited.task?.affectedSurfacePaths ?? []),
      ].filter((path, index, paths) => paths.indexOf(path) === index)
      await tx.insert(programmeDependencies).values(
        contributionDependencyPaths.map((fieldPath) => {
          const evidenceNodeId = fieldPath === selectedField ? newEvidenceNodeId : null
          const dependentSurfaceType = contributionSurfaceType({ fieldPath, evidenceNodeId })
          return {
            id: newId('dependency'),
            programmeId: proposal.programmeId,
            claimId,
            dependentSurfaceType,
            evidenceNodeId,
            verdictRevisionId:
              dependentSurfaceType === 'VERDICT' || dependentSurfaceType === 'PROGRAMME_SUMMARY'
                ? revisionId
                : null,
            fieldPath,
            impactLevel:
              fieldPath === selectedField
                ? (proposal.impactPreview?.highestImpactLevel ?? 'INTERPRETIVE_REVIEW_REQUIRED')
                : (cited.task?.impactLevel ?? 'INTERPRETIVE_REVIEW_REQUIRED'),
            createdAt: materializedAt,
          }
        }),
      )
    }
    if (verdictDeps.length > 0) {
      await tx.insert(programmeDependencies).values(
        verdictDeps.map((row) => ({
          ...row,
          id: newId('dependency'),
          verdictRevisionId: revisionId,
          evidenceNodeId: null,
          createdAt: materializedAt,
        })),
      )
    }
    const currentSourceMetadata = await tx
      .select()
      .from(programmeVerdictSourceMetadataSnapshots)
      .where(eq(programmeVerdictSourceMetadataSnapshots.verdictRevisionId, current.verdict.id))
      .orderBy(asc(programmeVerdictSourceMetadataSnapshots.sourceId))
      .for('share')
    const metadata = currentSourceMetadata
      .filter((row) => !(cited.task && row.sourceId === cited.source.id))
      .map((row) => ({ ...row, verdictRevisionId: revisionId, capturedAt: materializedAt }))
    if (!metadata.some((row) => row.sourceId === cited.source.id)) {
      metadata.push({
        verdictRevisionId: revisionId,
        programmeId: proposal.programmeId,
        sourceId: cited.source.id,
        sourceType: cited.source.sourceType,
        externalIdentifier: cited.source.externalIdentifier,
        canonicalLocator: cited.source.canonicalLocator,
        title: cited.source.title,
        publisher: cited.source.publisher,
        sponsor: clinicalTrialUpdate?.sponsor ?? cited.source.sponsor,
        publicationDate: cited.source.publicationDate,
        correctionStatus: cited.source.correctionStatus,
        jurisdiction: cited.source.jurisdiction,
        hierarchy: cited.source.hierarchy,
        capturedAt: materializedAt,
      })
    }
    await tx.insert(programmeVerdictSourceMetadataSnapshots).values(metadata)

    await tx.insert(programmeContributionImplementations).values({
      proposalId: proposal.id,
      programmeId: proposal.programmeId,
      proposalKey: proposal.proposalKey,
      verdictRevisionId: revisionId,
      implementedByUserId: actor.id,
      contributionDigestAlgorithm: 'sha256',
      contributionDigest: proposal.contentDigest,
      sourceReviewTaskId: cited.task?.id ?? null,
      sourceId: cited.task ? cited.source.id : null,
      sourceSnapshotId: cited.task ? cited.snapshot.id : null,
      createdAt: materializedAt,
    })

    const prepared = await prepareLockedProgrammeVerdictProposal(tx, revisionId)
    return {
      outcome: 'CANONICAL_CANDIDATE',
      proposalId: proposal.id,
      ...prepared,
      reused: false,
    }
  })
}
