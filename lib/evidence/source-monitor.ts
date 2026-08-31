import { createHash } from 'node:crypto'

import {
  EvidenceSourceFetchError,
  type EvidenceSourceAdapter,
  type SourceDiff,
  type SourceFieldChange,
  type SourceIdentifier,
  type SourceSnapshot,
} from './source-adapter'
import type {
  DependentSurfaceType,
  MonitorRunStatus,
  ProgrammeUpdateStatus,
  ReviewImpactLevel,
  SourceCheckStatus,
  SourceFreshnessStatus,
  StudyInterpretabilityCriterion,
} from './types'
import { stableJsonStringify } from '../stable-json'

const IMPACT_RANK: Record<ReviewImpactLevel, number> = {
  LOW_RISK_EXACT_DATA: 0,
  INTERPRETIVE_REVIEW_REQUIRED: 1,
  POSSIBLE_VERDICT_IMPACT: 2,
  SAFETY_CRITICAL_REVIEW: 3,
}

export interface SourceMonitorRunRecord {
  id: string
  adapterKey: string
  sourceId: string
  programmeId: string | null
  snapshotId: string | null
  status: MonitorRunStatus
  attemptNumber: number
  maxAttempts: number
  changedFieldCount: number
  startedAt: Date | null
  finishedAt: Date | null
  nextRetryAt: Date | null
  errorCode: string | null
  errorMessage: string | null
}

export interface SourceMonitorFreshnessRecord {
  programmeId: string
  sourceId: string
  currentSnapshotId: string | null
  pendingSnapshotId: string | null
  checkStatus: SourceCheckStatus
  freshnessStatus: SourceFreshnessStatus
  lastCheckAttemptAt: Date | null
  lastSuccessfulCheckAt: Date | null
  lastVerifiedAt: Date | null
  nextCheckDueAt: Date | null
  consecutiveFailures: number
  lastErrorCode: string | null
  lastErrorMessage: string | null
  newEvidenceDetectedAt: Date | null
}

export interface StoredSourceSnapshot {
  id: string
  sourceId: string
  previousSnapshotId: string | null
  retrievedAt: Date
  contentHash: string
  structuredData: Record<string, unknown>
  rawSnapshotLocator: string | null
}

export interface AffectedProgrammeDependency {
  claimId: string
  dependentSurfaceType: DependentSurfaceType
  evidenceNodeId: string | null
  verdictRevisionId: string | null
  fieldPath: string
  impactLevel: ReviewImpactLevel
}

export interface StoredEvidenceReviewTask {
  id: string
  programmeId: string
  sourceId: string
  triggerSnapshotId: string
  monitorRunId: string | null
  impactLevel: ReviewImpactLevel
  affectedClaimIds: string[]
  affectedSurfacePaths: string[]
}

export interface NewStoredSourceSnapshot extends StoredSourceSnapshot {
  hashAlgorithm: 'sha256'
  lastVerifiedAt: Date
}

export interface NewEvidenceReviewTask extends StoredEvidenceReviewTask {
  status: 'OPEN'
  reason: string
  createdAt: Date
  updatedAt: Date
}

export interface SupersededReviewTaskDismissal {
  programmeId: string
  sourceId: string
  /** Null when the upstream source returned exactly to the verified baseline. */
  activeReviewTaskId: string | null
  supersedingSnapshotId: string
  dismissedAt: Date
}

export interface AffectedSourceInterpretability {
  assessmentId: string
  criterion: StudyInterpretabilityCriterion
}

export interface NewStoredSourceReviewTaskDelta {
  reviewTaskId: string
  programmeId: string
  sourceId: string
  baselineSnapshotId: string
  pendingSnapshotId: string
  adapterKey: string
  schemaVersion: 'rna-intelligence/source-refresh-delta-v1'
  action: 'CANONICAL_REFRESH' | 'NEEDS_SCIENTIFIC_REVISION'
  changedTrialFields: SourceFieldChange[]
  affectedClaimIds: string[]
  affectedInterpretability: Array<
    AffectedSourceInterpretability & { reasonCode: 'LINKED_CLAIM_SOURCE_CHANGED' }
  >
  affectedSurfacePaths: string[]
  scientificRevisionRequirements: Array<{
    kind: 'CLAIM' | 'INTERPRETABILITY' | 'PRESENTATION' | 'UNCLASSIFIED_SOURCE_CHANGE'
    id: string | null
    fieldPath: string
    reasonCode: 'SOURCE_FIELD_NOT_NORMALIZED_EXACT' | 'LINKED_CLAIM_SOURCE_CHANGED'
  }>
  deltaDigestAlgorithm: 'sha256'
  deltaDigest: string
  createdAt: Date
}

export interface SourceMonitorTransaction {
  ensureMonitorRun(run: SourceMonitorRunRecord, createdAt: Date): Promise<void>
  getMonitorRunForUpdate(runId: string): Promise<SourceMonitorRunRecord | null>
  updateMonitorRun(
    runId: string,
    patch: Partial<SourceMonitorRunRecord>,
    updatedAt: Date,
  ): Promise<void>

  ensureFreshness(programmeId: string, sourceId: string, updatedAt: Date): Promise<void>
  getFreshnessForUpdate(
    programmeId: string,
    sourceId: string,
  ): Promise<SourceMonitorFreshnessRecord | null>
  updateFreshness(
    programmeId: string,
    sourceId: string,
    patch: Partial<SourceMonitorFreshnessRecord> & { updatedAt: Date },
  ): Promise<void>
  updateProgrammeStatus(
    programmeId: string,
    status: ProgrammeUpdateStatus,
    updatedAt: Date,
  ): Promise<void>

  getSnapshot(snapshotId: string): Promise<StoredSourceSnapshot | null>
  getLatestSnapshot(sourceId: string): Promise<StoredSourceSnapshot | null>
  findSnapshotByHash(sourceId: string, contentHash: string): Promise<StoredSourceSnapshot | null>
  insertSnapshotIfAbsent(snapshot: NewStoredSourceSnapshot): Promise<StoredSourceSnapshot>

  listAffectedClaimIds(programmeId: string, sourceId: string): Promise<string[]>
  listDependencies(
    programmeId: string,
    claimIds: readonly string[],
  ): Promise<AffectedProgrammeDependency[]>
  listAffectedInterpretability(
    programmeId: string,
    sourceId: string,
    affectedClaimIds: readonly string[],
  ): Promise<AffectedSourceInterpretability[]>
  insertReviewTaskIfAbsent(task: NewEvidenceReviewTask): Promise<void>
  insertSourceReviewTaskDeltaIfAbsent(delta: NewStoredSourceReviewTaskDelta): Promise<void>
  dismissSupersededReviewTasks(input: SupersededReviewTaskDismissal): Promise<string[]>
  listReviewTasksForRun(
    programmeId: string,
    sourceId: string,
    snapshotId: string,
    monitorRunId: string,
  ): Promise<StoredEvidenceReviewTask[]>
}

export interface SourceMonitorRepository {
  transaction<T>(work: (transaction: SourceMonitorTransaction) => Promise<T>): Promise<T>
}

export interface RunSourceMonitorInput {
  repository: SourceMonitorRepository
  adapter: EvidenceSourceAdapter
  identifier: SourceIdentifier
  sourceId: string
  programmeId: string
  /** Stable scheduler/job key. Reusing it retries or replays the same logical run. */
  idempotencyKey: string
  maxAttempts?: number
  retryDelayMs?: number
  /** A RUNNING attempt older than this can be reclaimed after a worker crash. */
  runningLeaseMs?: number
  nextCheckAfterMs?: number
  now?: () => Date
}

export type SourceMonitorDisposition =
  'COMPLETED' | 'IDEMPOTENT_REPLAY' | 'IN_PROGRESS' | 'RETRY_SCHEDULED' | 'RETRY_EXHAUSTED'

export interface SourceMonitorResult {
  runId: string
  disposition: SourceMonitorDisposition
  status: MonitorRunStatus
  attemptNumber: number
  snapshotId: string | null
  snapshotInserted: boolean
  changedFieldCount: number
  changes: SourceFieldChange[]
  affectedClaimIds: string[]
  affectedSurfacePaths: string[]
  highestImpact: ReviewImpactLevel | null
  reviewTaskIds: string[]
  currentSnapshotId: string | null
  pendingSnapshotId: string | null
  errorCode: string | null
  nextRetryAt: Date | null
}

class AdapterContractError extends Error {
  readonly code: string
  readonly retryable: boolean
  readonly sourceUnavailable = false

  constructor(code: string, message: string, retryable = false, options?: { cause?: unknown }) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'AdapterContractError'
    this.code = code
    this.retryable = retryable
  }
}

function stableId(prefix: string, parts: readonly string[]): string {
  const material = parts.map((part) => `${part.length}:${part}`).join('|')
  return `${prefix}_${createHash('sha256').update(material, 'utf8').digest('hex').slice(0, 48)}`
}

function maxImpact(first: ReviewImpactLevel | null, second: ReviewImpactLevel): ReviewImpactLevel {
  if (first === null) return second
  return IMPACT_RANK[first] >= IMPACT_RANK[second] ? first : second
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort()
}

function payloadRecord(payload: unknown): Record<string, unknown> {
  if (payload !== null && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload as Record<string, unknown>
  }
  return { value: payload }
}

function asAdapterSnapshot(
  snapshot: StoredSourceSnapshot,
  adapterKey: string,
  identifier: SourceIdentifier,
): SourceSnapshot {
  return {
    adapterKey,
    identifier,
    canonicalLocator: snapshot.rawSnapshotLocator ?? '',
    retrievedAt: snapshot.retrievedAt.toISOString(),
    contentHash: snapshot.contentHash,
    payload: snapshot.structuredData,
  }
}

function validateFetchedSnapshot(
  adapter: EvidenceSourceAdapter,
  identifier: SourceIdentifier,
  snapshot: SourceSnapshot,
): void {
  if (snapshot.adapterKey !== adapter.key) {
    throw new AdapterContractError(
      'ADAPTER_KEY_MISMATCH',
      `Adapter ${adapter.key} returned a snapshot labelled ${snapshot.adapterKey}.`,
    )
  }
  if (
    snapshot.identifier.kind !== identifier.kind ||
    snapshot.identifier.value.trim().toLocaleUpperCase('en-US') !==
      identifier.value.trim().toLocaleUpperCase('en-US')
  ) {
    throw new AdapterContractError(
      'SNAPSHOT_IDENTIFIER_MISMATCH',
      'The fetched snapshot identifier does not match the monitored source identifier.',
    )
  }
  if (!/^[0-9a-f]{64}$/.test(snapshot.contentHash)) {
    throw new AdapterContractError(
      'SNAPSHOT_HASH_INVALID',
      'The source adapter did not return a 64-character lowercase SHA-256 content hash.',
    )
  }
  if (!Number.isFinite(Date.parse(snapshot.retrievedAt))) {
    throw new AdapterContractError(
      'SNAPSHOT_RETRIEVED_AT_INVALID',
      'The source adapter returned an invalid retrieval timestamp.',
    )
  }
}

function validateDiff(diff: SourceDiff, previousHash: string, currentHash: string): SourceDiff {
  if (diff.previousHash !== previousHash || diff.currentHash !== currentHash) {
    throw new AdapterContractError(
      'SOURCE_DIFF_HASH_MISMATCH',
      'The adapter diff does not identify the snapshots that were compared.',
    )
  }
  const changes = [...diff.changes].sort((a, b) => a.path.localeCompare(b.path))
  if (new Set(changes.map((change) => change.path)).size !== changes.length) {
    throw new AdapterContractError(
      'SOURCE_DIFF_DUPLICATE_PATH',
      'The adapter returned more than one diff entry for the same field path.',
    )
  }
  if (diff.changed !== changes.length > 0) {
    throw new AdapterContractError(
      'SOURCE_DIFF_CHANGED_FLAG_MISMATCH',
      'The adapter diff changed flag does not match its field-level changes.',
    )
  }
  return { ...diff, changes }
}

function taskSurfacePath(dependency: AffectedProgrammeDependency): string {
  const target = dependency.evidenceNodeId ?? dependency.verdictRevisionId
  return target
    ? `${dependency.dependentSurfaceType}:${target}:${dependency.fieldPath}`
    : `${dependency.dependentSurfaceType}:${dependency.fieldPath}`
}

function reviewReason(
  changes: readonly SourceFieldChange[],
  impact: ReviewImpactLevel,
  blockingReasons: readonly string[] = [],
): string {
  const fieldLabels: Record<string, string> = {
    'trial.identifier': 'study registration number',
    'trial.overallStatus': 'study status',
    'trial.hasResults': 'whether results are posted',
    'trial.enrollment.count': 'number enrolled',
    'trial.enrollment.type': 'whether enrolment is actual or estimated',
    'trial.phases': 'study phase',
    'trial.startDate': 'start date',
    'trial.primaryCompletionDate': 'main completion date',
    'trial.completionDate': 'completion date',
    'trial.sponsor.name': 'lead sponsor',
    'trial.sponsor.class': 'sponsor type',
    'trial.registryRecord': 'other details in the registry record',
  }
  const changedFields = changes
    .map((change) => fieldLabels[change.path] ?? 'a source field')
    .filter((label, index, labels) => labels.indexOf(label) === index)
  const instruction: Record<ReviewImpactLevel, string> = {
    LOW_RISK_EXACT_DATA:
      'A person must confirm the exact update before RNAWiki changes linked material.',
    INTERPRETIVE_REVIEW_REQUIRED:
      'A person must review what the change means before RNAWiki changes linked material.',
    POSSIBLE_VERDICT_IMPACT:
      'A person must check whether this changes the programme conclusion before it is published.',
    SAFETY_CRITICAL_REVIEW:
      'A qualified safety reviewer must check this change before any linked safety wording is published.',
  }
  const dependencyNote =
    blockingReasons.length > 0
      ? ` RNAWiki left the update pending because ${blockingReasons.join(', ')}.`
      : ''
  return `The source changed: ${changedFields.join(', ')}. ${instruction[impact]}${dependencyNote}`
}

function sourceReviewTaskDelta(args: {
  reviewTaskId: string
  programmeId: string
  sourceId: string
  baselineSnapshotId: string
  pendingSnapshotId: string
  adapterKey: string
  changes: readonly SourceFieldChange[]
  affectedClaimIds: readonly string[]
  affectedInterpretability: readonly AffectedSourceInterpretability[]
  affectedSurfacePaths: readonly string[]
  createdAt: Date
}): NewStoredSourceReviewTaskDelta {
  const changedTrialFields = [...args.changes].sort((left, right) =>
    left.path.localeCompare(right.path),
  )
  const affectedClaimIds = uniqueSorted(args.affectedClaimIds)
  const affectedInterpretability = [...args.affectedInterpretability]
    .map((assessment) => ({
      ...assessment,
      reasonCode: 'LINKED_CLAIM_SOURCE_CHANGED' as const,
    }))
    .sort((left, right) =>
      `${left.assessmentId}:${left.criterion}`.localeCompare(
        `${right.assessmentId}:${right.criterion}`,
      ),
    )
  const affectedSurfacePaths = uniqueSorted(args.affectedSurfacePaths)
  const fieldRequirements = changedTrialFields
    .filter((change) => change.risk === 'INTERPRETIVE_REVIEW_REQUIRED')
    .map((change) => ({
      kind:
        change.path === 'trial.registryRecord'
          ? ('UNCLASSIFIED_SOURCE_CHANGE' as const)
          : ('PRESENTATION' as const),
      id: null,
      fieldPath: change.path,
      reasonCode: 'SOURCE_FIELD_NOT_NORMALIZED_EXACT' as const,
    }))
  const claimRequirements = affectedClaimIds.map((claimId) => ({
    kind: 'CLAIM' as const,
    id: claimId,
    fieldPath: 'claim.sourceSnapshot',
    reasonCode: 'LINKED_CLAIM_SOURCE_CHANGED' as const,
  }))
  const interpretabilityRequirements = affectedInterpretability.map((assessment) => ({
    kind: 'INTERPRETABILITY' as const,
    id: assessment.assessmentId,
    fieldPath: `interpretability.${assessment.criterion}`,
    reasonCode: 'LINKED_CLAIM_SOURCE_CHANGED' as const,
  }))
  const scientificRevisionRequirements = [
    ...fieldRequirements,
    ...claimRequirements,
    ...interpretabilityRequirements,
  ].sort((left, right) =>
    `${left.kind}:${left.id ?? ''}:${left.fieldPath}`.localeCompare(
      `${right.kind}:${right.id ?? ''}:${right.fieldPath}`,
    ),
  )
  const action =
    scientificRevisionRequirements.length === 0
      ? ('CANONICAL_REFRESH' as const)
      : ('NEEDS_SCIENTIFIC_REVISION' as const)
  const payload = {
    version: 'rna-intelligence/source-refresh-delta-v1' as const,
    reviewTaskId: args.reviewTaskId,
    programmeId: args.programmeId,
    sourceId: args.sourceId,
    baselineSnapshotId: args.baselineSnapshotId,
    pendingSnapshotId: args.pendingSnapshotId,
    adapterKey: args.adapterKey,
    action,
    changedTrialFields,
    affectedClaimIds,
    affectedInterpretability,
    affectedSurfacePaths,
    scientificRevisionRequirements,
  }
  return {
    reviewTaskId: args.reviewTaskId,
    programmeId: args.programmeId,
    sourceId: args.sourceId,
    baselineSnapshotId: args.baselineSnapshotId,
    pendingSnapshotId: args.pendingSnapshotId,
    adapterKey: args.adapterKey,
    schemaVersion: 'rna-intelligence/source-refresh-delta-v1',
    action,
    changedTrialFields,
    affectedClaimIds,
    affectedInterpretability,
    affectedSurfacePaths,
    scientificRevisionRequirements,
    deltaDigestAlgorithm: 'sha256',
    deltaDigest: createHash('sha256').update(stableJsonStringify(payload), 'utf8').digest('hex'),
    createdAt: args.createdAt,
  }
}

function resultDisposition(run: SourceMonitorRunRecord, now: Date): SourceMonitorDisposition {
  if (run.status === 'RUNNING') return 'IN_PROGRESS'
  if (run.status === 'SUCCEEDED') return 'IDEMPOTENT_REPLAY'
  if (run.attemptNumber >= run.maxAttempts || run.nextRetryAt === null) return 'RETRY_EXHAUSTED'
  return run.nextRetryAt > now ? 'RETRY_SCHEDULED' : 'IDEMPOTENT_REPLAY'
}

async function storedResult(
  transaction: SourceMonitorTransaction,
  run: SourceMonitorRunRecord,
  now: Date,
): Promise<SourceMonitorResult> {
  const freshness = await transaction.getFreshnessForUpdate(run.programmeId ?? '', run.sourceId)
  const tasks = run.snapshotId
    ? await transaction.listReviewTasksForRun(
        run.programmeId ?? '',
        run.sourceId,
        run.snapshotId,
        run.id,
      )
    : []
  let highestImpact: ReviewImpactLevel | null = null
  for (const task of tasks) highestImpact = maxImpact(highestImpact, task.impactLevel)

  return {
    runId: run.id,
    disposition: resultDisposition(run, now),
    status: run.status,
    attemptNumber: run.attemptNumber,
    snapshotId: run.snapshotId,
    snapshotInserted: false,
    changedFieldCount: run.changedFieldCount,
    changes: [],
    affectedClaimIds: uniqueSorted(tasks.flatMap((task) => task.affectedClaimIds)),
    affectedSurfacePaths: uniqueSorted(tasks.flatMap((task) => task.affectedSurfacePaths)),
    highestImpact,
    reviewTaskIds: tasks.map((task) => task.id).sort(),
    currentSnapshotId: freshness?.currentSnapshotId ?? null,
    pendingSnapshotId: freshness?.pendingSnapshotId ?? null,
    errorCode: run.errorCode,
    nextRetryAt: run.nextRetryAt,
  }
}

async function claimRun(
  input: RunSourceMonitorInput,
  runId: string,
  now: Date,
  maxAttempts: number,
  runningLeaseMs: number,
): Promise<SourceMonitorResult | null> {
  return input.repository.transaction(async (transaction) => {
    await transaction.ensureMonitorRun(
      {
        id: runId,
        adapterKey: input.adapter.key,
        sourceId: input.sourceId,
        programmeId: input.programmeId,
        snapshotId: null,
        status: 'QUEUED',
        attemptNumber: 1,
        maxAttempts,
        changedFieldCount: 0,
        startedAt: null,
        finishedAt: null,
        nextRetryAt: null,
        errorCode: null,
        errorMessage: null,
      },
      now,
    )
    await transaction.ensureFreshness(input.programmeId, input.sourceId, now)

    const run = await transaction.getMonitorRunForUpdate(runId)
    if (!run) throw new Error(`Monitor run ${runId} was not available after insertion.`)

    if (run.adapterKey !== input.adapter.key || run.sourceId !== input.sourceId) {
      throw new Error(`Idempotency key collision for monitor run ${runId}.`)
    }

    if (run.status === 'RUNNING') {
      const leaseExpired =
        run.startedAt === null || now.getTime() - run.startedAt.getTime() >= runningLeaseMs
      if (!leaseExpired) return storedResult(transaction, run, now)

      if (run.attemptNumber >= run.maxAttempts) {
        const freshness = await transaction.getFreshnessForUpdate(input.programmeId, input.sourceId)
        const errorCode = 'MONITOR_RUN_LEASE_EXPIRED'
        const errorMessage = 'The source-monitor worker lease expired before completion.'
        await transaction.updateMonitorRun(
          runId,
          {
            status: 'FAILED',
            finishedAt: now,
            nextRetryAt: null,
            errorCode,
            errorMessage,
          },
          now,
        )
        if (freshness) {
          await transaction.updateFreshness(input.programmeId, input.sourceId, {
            checkStatus: 'FAILED',
            freshnessStatus: 'CHECK_FAILED',
            lastCheckAttemptAt: now,
            nextCheckDueAt: null,
            consecutiveFailures: freshness.consecutiveFailures + 1,
            lastErrorCode: errorCode,
            lastErrorMessage: errorMessage,
            updatedAt: now,
          })
          await transaction.updateProgrammeStatus(input.programmeId, 'CHECK_FAILED', now)
        }
        return storedResult(
          transaction,
          {
            ...run,
            status: 'FAILED',
            finishedAt: now,
            nextRetryAt: null,
            errorCode,
            errorMessage,
          },
          now,
        )
      }

      await transaction.updateMonitorRun(
        runId,
        {
          attemptNumber: run.attemptNumber + 1,
          startedAt: now,
          finishedAt: null,
          nextRetryAt: null,
          errorCode: null,
          errorMessage: null,
        },
        now,
      )
      return null
    }

    if (run.status === 'SUCCEEDED' || run.status === 'CANCELLED') {
      return storedResult(transaction, run, now)
    }

    if (run.status !== 'QUEUED') {
      const retryable = run.nextRetryAt !== null && run.attemptNumber < run.maxAttempts
      if (!retryable || (run.nextRetryAt && run.nextRetryAt > now)) {
        return storedResult(transaction, run, now)
      }
      await transaction.updateMonitorRun(
        runId,
        {
          status: 'RUNNING',
          attemptNumber: run.attemptNumber + 1,
          startedAt: now,
          finishedAt: null,
          nextRetryAt: null,
          errorCode: null,
          errorMessage: null,
        },
        now,
      )
      return null
    }

    await transaction.updateMonitorRun(
      runId,
      {
        status: 'RUNNING',
        startedAt: now,
        finishedAt: null,
      },
      now,
    )
    return null
  })
}

interface FailureClassification {
  code: string
  message: string
  retryable: boolean
  sourceUnavailable: boolean
}

function classifyFailure(error: unknown): FailureClassification {
  if (error instanceof EvidenceSourceFetchError || error instanceof AdapterContractError) {
    return {
      code: error.code.slice(0, 120),
      message: error.message.slice(0, 2_000),
      retryable: error.retryable,
      sourceUnavailable: error.sourceUnavailable,
    }
  }
  if (error instanceof TypeError) {
    return {
      code: 'SOURCE_ADAPTER_INPUT_INVALID',
      message: error.message.slice(0, 2_000),
      retryable: false,
      sourceUnavailable: false,
    }
  }
  return {
    code: 'SOURCE_ADAPTER_FAILED',
    message:
      error instanceof Error ? error.message.slice(0, 2_000) : 'Unknown source-adapter error.',
    retryable: true,
    sourceUnavailable: false,
  }
}

async function recordFailure(
  input: RunSourceMonitorInput,
  runId: string,
  error: unknown,
  now: Date,
  retryDelayMs: number,
): Promise<SourceMonitorResult> {
  const failure = classifyFailure(error)
  return input.repository.transaction(async (transaction) => {
    const run = await transaction.getMonitorRunForUpdate(runId)
    if (!run) throw new Error(`Monitor run ${runId} disappeared while recording a failure.`)
    if (run.status !== 'RUNNING') return storedResult(transaction, run, now)

    const canRetry = failure.retryable && run.attemptNumber < run.maxAttempts
    const nextRetryAt = canRetry ? new Date(now.getTime() + retryDelayMs * run.attemptNumber) : null
    const status: MonitorRunStatus = failure.sourceUnavailable ? 'SOURCE_UNAVAILABLE' : 'FAILED'
    const checkStatus: SourceCheckStatus = failure.sourceUnavailable
      ? 'SOURCE_UNAVAILABLE'
      : 'FAILED'
    const freshnessStatus: SourceFreshnessStatus = failure.sourceUnavailable
      ? 'SOURCE_UNAVAILABLE'
      : 'CHECK_FAILED'
    const programmeStatus: ProgrammeUpdateStatus = failure.sourceUnavailable
      ? 'SOURCE_UNAVAILABLE'
      : 'CHECK_FAILED'

    const freshness = await transaction.getFreshnessForUpdate(input.programmeId, input.sourceId)
    if (!freshness) throw new Error('Freshness state was not initialized for the monitor run.')

    await transaction.updateMonitorRun(
      runId,
      {
        status,
        finishedAt: now,
        nextRetryAt,
        errorCode: failure.code,
        errorMessage: failure.message,
      },
      now,
    )
    await transaction.updateFreshness(input.programmeId, input.sourceId, {
      checkStatus,
      freshnessStatus,
      lastCheckAttemptAt: now,
      nextCheckDueAt: nextRetryAt,
      consecutiveFailures: freshness.consecutiveFailures + 1,
      lastErrorCode: failure.code,
      lastErrorMessage: failure.message,
      updatedAt: now,
    })
    await transaction.updateProgrammeStatus(input.programmeId, programmeStatus, now)

    const updated: SourceMonitorRunRecord = {
      ...run,
      status,
      finishedAt: now,
      nextRetryAt,
      errorCode: failure.code,
      errorMessage: failure.message,
    }
    return storedResult(transaction, updated, now)
  })
}

async function computeDiff(
  adapter: EvidenceSourceAdapter,
  previous: StoredSourceSnapshot,
  current: SourceSnapshot,
  identifier: SourceIdentifier,
): Promise<SourceDiff> {
  try {
    const diff = await adapter.diff(asAdapterSnapshot(previous, adapter.key, identifier), current)
    return validateDiff(diff, previous.contentHash, current.contentHash)
  } catch (error) {
    if (error instanceof AdapterContractError) throw error
    throw new AdapterContractError(
      'SOURCE_DIFF_FAILED',
      error instanceof Error ? error.message : 'The adapter could not compute a source diff.',
      true,
      { cause: error },
    )
  }
}

async function completeSuccess(
  input: RunSourceMonitorInput,
  runId: string,
  fetched: SourceSnapshot,
  now: Date,
  nextCheckAfterMs: number,
): Promise<SourceMonitorResult> {
  return input.repository.transaction(async (transaction) => {
    const run = await transaction.getMonitorRunForUpdate(runId)
    if (!run) throw new Error(`Monitor run ${runId} disappeared before completion.`)
    if (run.status !== 'RUNNING') return storedResult(transaction, run, now)

    const freshness = await transaction.getFreshnessForUpdate(input.programmeId, input.sourceId)
    if (!freshness) throw new Error('Freshness state was not initialized for the monitor run.')

    const latest = await transaction.getLatestSnapshot(input.sourceId)
    const comparisonId =
      freshness.pendingSnapshotId ?? freshness.currentSnapshotId ?? latest?.id ?? null
    const previous = comparisonId ? await transaction.getSnapshot(comparisonId) : null
    if (comparisonId && !previous) {
      throw new Error(`Freshness state points to missing snapshot ${comparisonId}.`)
    }

    const existing = await transaction.findSnapshotByHash(input.sourceId, fetched.contentHash)
    const snapshotId = stableId('snapshot', [input.sourceId, fetched.contentHash])
    const stored =
      existing ??
      (await transaction.insertSnapshotIfAbsent({
        id: snapshotId,
        sourceId: input.sourceId,
        previousSnapshotId: latest && latest.contentHash !== fetched.contentHash ? latest.id : null,
        retrievedAt: new Date(fetched.retrievedAt),
        hashAlgorithm: 'sha256',
        contentHash: fetched.contentHash,
        structuredData: payloadRecord(fetched.payload),
        rawSnapshotLocator: fetched.canonicalLocator,
        lastVerifiedAt: now,
      }))
    const snapshotInserted = existing === null

    let diff: SourceDiff = {
      changed: false,
      ...(previous ? { previousHash: previous.contentHash } : {}),
      currentHash: fetched.contentHash,
      changes: [],
    }
    if (previous && previous.contentHash !== fetched.contentHash) {
      diff = await computeDiff(input.adapter, previous, fetched, input.identifier)
    }

    // `changes` describes what arrived since the latest observed snapshot. A review task, however,
    // must always freeze the cumulative delta from the still-public baseline. Otherwise baseline
    // -> A -> B would incorrectly label an A -> B fragment as if it described baseline -> B.
    const changes = diff.changes
    const baseline = freshness.currentSnapshotId
      ? await transaction.getSnapshot(freshness.currentSnapshotId)
      : null
    if (freshness.currentSnapshotId && !baseline) {
      throw new Error(`Freshness state points to missing snapshot ${freshness.currentSnapshotId}.`)
    }
    let reviewChanges = changes
    if (freshness.pendingSnapshotId && baseline) {
      reviewChanges =
        baseline.contentHash === fetched.contentHash
          ? []
          : (await computeDiff(input.adapter, baseline, fetched, input.identifier)).changes
    }
    const affectedClaimIds =
      reviewChanges.length === 0
        ? []
        : uniqueSorted(await transaction.listAffectedClaimIds(input.programmeId, input.sourceId))
    const dependencies =
      affectedClaimIds.length === 0
        ? []
        : await transaction.listDependencies(input.programmeId, affectedClaimIds)
    const affectedSurfacePaths = uniqueSorted(dependencies.map(taskSurfacePath))

    let highestImpact: ReviewImpactLevel | null = null
    for (const change of reviewChanges) {
      highestImpact = maxImpact(
        highestImpact,
        change.risk === 'LOW_RISK_EXACT' ? 'LOW_RISK_EXACT_DATA' : 'INTERPRETIVE_REVIEW_REQUIRED',
      )
    }
    for (const dependency of dependencies) {
      highestImpact = maxImpact(highestImpact, dependency.impactLevel)
    }
    // A source change touching an existing claim always needs a person: immutable claims and their
    // meaning are never silently rewritten even when the upstream registry field is exact.
    if (affectedClaimIds.length > 0) {
      highestImpact = maxImpact(highestImpact, 'INTERPRETIVE_REVIEW_REQUIRED')
    }
    // Every observed source change is review work. Exact registry fields are lower-risk and can use
    // the reviewed canonical-refresh path, but the scheduled monitor never writes them itself.
    const reviewImpact = reviewChanges.length > 0 ? highestImpact : null
    const requiresReview = reviewImpact !== null
    const alreadyPendingThisSnapshot = freshness.pendingSnapshotId === stored.id
    const reviewTaskId =
      reviewImpact && !alreadyPendingThisSnapshot
        ? stableId('review', [runId, input.programmeId, input.sourceId, stored.id, reviewImpact])
        : null
    if (reviewTaskId && reviewImpact) {
      await transaction.insertReviewTaskIfAbsent({
        id: reviewTaskId,
        programmeId: input.programmeId,
        sourceId: input.sourceId,
        triggerSnapshotId: stored.id,
        monitorRunId: runId,
        impactLevel: reviewImpact,
        status: 'OPEN',
        reason: reviewReason(reviewChanges, reviewImpact),
        affectedClaimIds,
        affectedSurfacePaths,
        createdAt: now,
        updatedAt: now,
      })
    }

    const retainExistingPending = Boolean(freshness.pendingSnapshotId) && alreadyPendingThisSnapshot
    const hasPending = requiresReview || retainExistingPending
    const pendingSnapshotId = requiresReview
      ? stored.id
      : retainExistingPending
        ? freshness.pendingSnapshotId
        : null
    const currentSnapshotId = hasPending ? freshness.currentSnapshotId : stored.id
    const freshnessStatus: SourceFreshnessStatus = hasPending ? 'NEW_EVIDENCE' : 'CURRENT'
    const programmeStatus: ProgrammeUpdateStatus = hasPending ? 'REVIEW_REQUIRED' : 'CURRENT'
    const nextCheckDueAt = new Date(now.getTime() + nextCheckAfterMs)

    await transaction.updateFreshness(input.programmeId, input.sourceId, {
      currentSnapshotId,
      pendingSnapshotId,
      checkStatus: 'SUCCEEDED',
      freshnessStatus,
      lastCheckAttemptAt: now,
      lastSuccessfulCheckAt: now,
      ...(hasPending ? {} : { lastVerifiedAt: now }),
      nextCheckDueAt,
      consecutiveFailures: 0,
      lastErrorCode: null,
      lastErrorMessage: null,
      newEvidenceDetectedAt: requiresReview
        ? now
        : retainExistingPending
          ? freshness.newEvidenceDetectedAt
          : null,
      updatedAt: now,
    })
    if (
      reviewTaskId &&
      freshness.currentSnapshotId &&
      input.adapter.key === 'clinicaltrials.gov/v2'
    ) {
      const affectedInterpretability = await transaction.listAffectedInterpretability(
        input.programmeId,
        input.sourceId,
        affectedClaimIds,
      )
      await transaction.insertSourceReviewTaskDeltaIfAbsent(
        sourceReviewTaskDelta({
          reviewTaskId,
          programmeId: input.programmeId,
          sourceId: input.sourceId,
          baselineSnapshotId: freshness.currentSnapshotId,
          pendingSnapshotId: stored.id,
          adapterKey: input.adapter.key,
          changes: reviewChanges,
          affectedClaimIds,
          affectedInterpretability,
          affectedSurfacePaths,
          createdAt: now,
        }),
      )
    }
    if (reviewTaskId) {
      // The freshness row now points at this task's exact snapshot. In the same transaction, close
      // every older open task for this programme/source so a superseded snapshot cannot remain an
      // actionable queue item or block the replacement candidate. Dismissal preserves the task as
      // an immutable audit record; it never pretends that the older source change was reviewed.
      await transaction.dismissSupersededReviewTasks({
        programmeId: input.programmeId,
        sourceId: input.sourceId,
        activeReviewTaskId: reviewTaskId,
        supersedingSnapshotId: stored.id,
        dismissedAt: now,
      })
    } else if (freshness.pendingSnapshotId && pendingSnapshotId === null) {
      // A registry can correct itself back to the exact verified baseline. Close the obsolete task
      // without inventing a replacement task whose baseline and pending snapshots would be equal.
      await transaction.dismissSupersededReviewTasks({
        programmeId: input.programmeId,
        sourceId: input.sourceId,
        activeReviewTaskId: null,
        supersedingSnapshotId: stored.id,
        dismissedAt: now,
      })
    }
    await transaction.updateProgrammeStatus(input.programmeId, programmeStatus, now)
    await transaction.updateMonitorRun(
      runId,
      {
        snapshotId: stored.id,
        status: 'SUCCEEDED',
        changedFieldCount: changes.length,
        finishedAt: now,
        nextRetryAt: null,
        errorCode: null,
        errorMessage: null,
      },
      now,
    )

    return {
      runId,
      disposition: 'COMPLETED',
      status: 'SUCCEEDED',
      attemptNumber: run.attemptNumber,
      snapshotId: stored.id,
      snapshotInserted,
      changedFieldCount: changes.length,
      changes,
      affectedClaimIds,
      affectedSurfacePaths,
      highestImpact,
      reviewTaskIds: reviewTaskId ? [reviewTaskId] : [],
      currentSnapshotId,
      pendingSnapshotId,
      errorCode: null,
      nextRetryAt: null,
    }
  })
}

/**
 * Fetches and records one logical source-monitor run.
 *
 * Fetching happens outside a database transaction; all snapshot/freshness/task state changes are
 * committed atomically afterward. The deterministic run, snapshot, and task IDs make scheduler
 * redelivery safe. No claim, evidence node, trial fact, programme fact, verdict, or current
 * publication is ever updated here. Every changed snapshot stays pending for human review.
 */
export async function runSourceMonitor(input: RunSourceMonitorInput): Promise<SourceMonitorResult> {
  const maxAttempts = input.maxAttempts ?? 3
  const retryDelayMs = input.retryDelayMs ?? 5 * 60_000
  const runningLeaseMs = input.runningLeaseMs ?? 10 * 60_000
  const nextCheckAfterMs = input.nextCheckAfterMs ?? 24 * 60 * 60_000
  if (!input.idempotencyKey.trim()) throw new TypeError('idempotencyKey is required.')
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new TypeError('maxAttempts must be a positive integer.')
  }
  if (!Number.isFinite(retryDelayMs) || retryDelayMs < 0) {
    throw new TypeError('retryDelayMs must be a non-negative number.')
  }
  if (!Number.isFinite(runningLeaseMs) || runningLeaseMs < 1) {
    throw new TypeError('runningLeaseMs must be a positive number.')
  }
  if (!Number.isFinite(nextCheckAfterMs) || nextCheckAfterMs < 1) {
    throw new TypeError('nextCheckAfterMs must be a positive number.')
  }

  const now = (input.now ?? (() => new Date()))()
  const runId = stableId('monitor', [
    input.programmeId,
    input.sourceId,
    input.adapter.key,
    input.idempotencyKey,
  ])
  const claimed = await claimRun(input, runId, now, maxAttempts, runningLeaseMs)
  if (claimed) return claimed

  let fetched: SourceSnapshot
  try {
    if (!input.adapter.supports(input.identifier)) {
      throw new AdapterContractError(
        'SOURCE_IDENTIFIER_UNSUPPORTED',
        `Adapter ${input.adapter.key} does not support ${input.identifier.kind}:${input.identifier.value}.`,
      )
    }
    fetched = await input.adapter.fetch(input.identifier)
    validateFetchedSnapshot(input.adapter, input.identifier, fetched)
  } catch (error) {
    return recordFailure(input, runId, error, now, retryDelayMs)
  }

  try {
    return await completeSuccess(input, runId, fetched, now, nextCheckAfterMs)
  } catch (error) {
    if (error instanceof AdapterContractError || error instanceof EvidenceSourceFetchError) {
      return recordFailure(input, runId, error, now, retryDelayMs)
    }
    // Persistence and transaction failures are not source failures. Leave the RUNNING row intact
    // for operational recovery instead of corrupting freshness/error telemetry with a false label.
    throw error
  }
}
