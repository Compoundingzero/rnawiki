import { describe, expect, it } from 'vitest'

import {
  diffNormalizedFacts,
  EvidenceSourceFetchError,
  type EvidenceSourceAdapter,
  type NormalizedFact,
  type SourceDiff,
  type SourceIdentifier,
  type SourceSnapshot,
} from '@/lib/evidence/source-adapter'
import {
  runSourceMonitor,
  type AffectedProgrammeDependency,
  type AffectedSourceInterpretability,
  type NewEvidenceReviewTask,
  type NewStoredSourceReviewTaskDelta,
  type NewStoredSourceSnapshot,
  type SourceMonitorFreshnessRecord,
  type SourceMonitorRepository,
  type SourceMonitorRunRecord,
  type SourceMonitorTransaction,
  type StoredEvidenceReviewTask,
  type StoredSourceSnapshot,
  type SupersededReviewTaskDismissal,
} from '@/lib/evidence/source-monitor'
import type { EvidenceReviewTaskStatus, ProgrammeUpdateStatus } from '@/lib/evidence/types'
import { sha256Hex } from '@/lib/rna-intelligence/evidence-digest'
import { stableJsonStringify } from '@/lib/stable-json'

const identifier: SourceIdentifier = { kind: 'NCT', value: 'NCT12345678' }
const PROGRAMME_ID = 'programme-1'
const SOURCE_ID = 'source-1'

function clone<T>(value: T): T {
  return structuredClone(value)
}

type MemoryEvidenceReviewTask = Omit<NewEvidenceReviewTask, 'status'> & {
  status: EvidenceReviewTaskStatus
  resolutionNote: string | null
  resolvedAt: Date | null
}

class MemoryMonitorRepository implements SourceMonitorRepository, SourceMonitorTransaction {
  readonly runs = new Map<string, SourceMonitorRunRecord>()
  readonly freshness = new Map<string, SourceMonitorFreshnessRecord>()
  readonly snapshots = new Map<string, StoredSourceSnapshot>()
  readonly tasks = new Map<string, MemoryEvidenceReviewTask>()
  readonly sourceDeltas = new Map<string, NewStoredSourceReviewTaskDelta>()
  readonly programmeStatuses = new Map<string, ProgrammeUpdateStatus>()
  affectedClaimIds: string[] = []
  dependencies: AffectedProgrammeDependency[] = []
  affectedInterpretability: AffectedSourceInterpretability[] = []

  transaction<T>(work: (transaction: SourceMonitorTransaction) => Promise<T>): Promise<T> {
    return work(this)
  }

  async ensureMonitorRun(run: SourceMonitorRunRecord): Promise<void> {
    if (!this.runs.has(run.id)) this.runs.set(run.id, clone(run))
  }

  async getMonitorRunForUpdate(runId: string): Promise<SourceMonitorRunRecord | null> {
    return clone(this.runs.get(runId) ?? null)
  }

  async updateMonitorRun(runId: string, patch: Partial<SourceMonitorRunRecord>): Promise<void> {
    const current = this.runs.get(runId)
    if (!current) throw new Error(`Missing run ${runId}`)
    this.runs.set(runId, { ...current, ...clone(patch) })
  }

  async ensureFreshness(programmeId: string, sourceId: string): Promise<void> {
    const key = `${programmeId}:${sourceId}`
    if (this.freshness.has(key)) return
    this.freshness.set(key, {
      programmeId,
      sourceId,
      currentSnapshotId: null,
      pendingSnapshotId: null,
      checkStatus: 'NOT_CHECKED',
      freshnessStatus: 'NOT_ASSESSED',
      lastCheckAttemptAt: null,
      lastSuccessfulCheckAt: null,
      lastVerifiedAt: null,
      nextCheckDueAt: null,
      consecutiveFailures: 0,
      lastErrorCode: null,
      lastErrorMessage: null,
      newEvidenceDetectedAt: null,
    })
  }

  async getFreshnessForUpdate(
    programmeId: string,
    sourceId: string,
  ): Promise<SourceMonitorFreshnessRecord | null> {
    return clone(this.freshness.get(`${programmeId}:${sourceId}`) ?? null)
  }

  async updateFreshness(
    programmeId: string,
    sourceId: string,
    patch: Partial<SourceMonitorFreshnessRecord>,
  ): Promise<void> {
    const key = `${programmeId}:${sourceId}`
    const current = this.freshness.get(key)
    if (!current) throw new Error(`Missing freshness ${key}`)
    this.freshness.set(key, { ...current, ...clone(patch) })
  }

  async updateProgrammeStatus(programmeId: string, status: ProgrammeUpdateStatus): Promise<void> {
    this.programmeStatuses.set(programmeId, status)
  }

  async getSnapshot(snapshotId: string): Promise<StoredSourceSnapshot | null> {
    return clone(this.snapshots.get(snapshotId) ?? null)
  }

  async getLatestSnapshot(sourceId: string): Promise<StoredSourceSnapshot | null> {
    const matches = [...this.snapshots.values()]
      .filter((snapshot) => snapshot.sourceId === sourceId)
      .sort((a, b) => {
        const time = b.retrievedAt.getTime() - a.retrievedAt.getTime()
        return time === 0 ? b.id.localeCompare(a.id) : time
      })
    return clone(matches[0] ?? null)
  }

  async findSnapshotByHash(
    sourceId: string,
    contentHash: string,
  ): Promise<StoredSourceSnapshot | null> {
    return clone(
      [...this.snapshots.values()].find(
        (snapshot) => snapshot.sourceId === sourceId && snapshot.contentHash === contentHash,
      ) ?? null,
    )
  }

  async insertSnapshotIfAbsent(snapshot: NewStoredSourceSnapshot): Promise<StoredSourceSnapshot> {
    const existing = await this.findSnapshotByHash(snapshot.sourceId, snapshot.contentHash)
    if (existing) return existing
    const stored: StoredSourceSnapshot = {
      id: snapshot.id,
      sourceId: snapshot.sourceId,
      previousSnapshotId: snapshot.previousSnapshotId,
      retrievedAt: snapshot.retrievedAt,
      contentHash: snapshot.contentHash,
      structuredData: clone(snapshot.structuredData),
      rawSnapshotLocator: snapshot.rawSnapshotLocator,
    }
    this.snapshots.set(stored.id, stored)
    return clone(stored)
  }

  async listAffectedClaimIds(): Promise<string[]> {
    return [...this.affectedClaimIds]
  }

  async listDependencies(): Promise<AffectedProgrammeDependency[]> {
    return clone(this.dependencies)
  }

  async listAffectedInterpretability(): Promise<AffectedSourceInterpretability[]> {
    return clone(this.affectedInterpretability)
  }

  async insertReviewTaskIfAbsent(task: NewEvidenceReviewTask): Promise<void> {
    if (!this.tasks.has(task.id)) {
      this.tasks.set(task.id, clone({ ...task, resolutionNote: null, resolvedAt: null }))
    }
  }

  async insertSourceReviewTaskDeltaIfAbsent(delta: NewStoredSourceReviewTaskDelta): Promise<void> {
    if (!this.sourceDeltas.has(delta.reviewTaskId)) {
      this.sourceDeltas.set(delta.reviewTaskId, clone(delta))
    }
  }

  async dismissSupersededReviewTasks(input: SupersededReviewTaskDismissal): Promise<string[]> {
    const dismissed: string[] = []
    for (const [id, task] of this.tasks) {
      if (
        task.programmeId !== input.programmeId ||
        task.sourceId !== input.sourceId ||
        task.id === input.activeReviewTaskId ||
        !['OPEN', 'IN_REVIEW', 'BLOCKED'].includes(task.status)
      ) {
        continue
      }
      this.tasks.set(
        id,
        clone({
          ...task,
          status: 'DISMISSED',
          resolutionNote: input.activeReviewTaskId
            ? `Superseded by review task ${input.activeReviewTaskId} for newer pending source snapshot ${input.supersedingSnapshotId}.`
            : `The source returned to verified baseline snapshot ${input.supersedingSnapshotId}; this pending review is no longer actionable.`,
          resolvedAt: input.dismissedAt,
          updatedAt: input.dismissedAt,
        }),
      )
      dismissed.push(id)
    }
    return dismissed.sort()
  }

  async listReviewTasksForRun(
    programmeId: string,
    sourceId: string,
    snapshotId: string,
    monitorRunId: string,
  ): Promise<StoredEvidenceReviewTask[]> {
    return clone(
      [...this.tasks.values()].filter(
        (task) =>
          task.programmeId === programmeId &&
          task.sourceId === sourceId &&
          task.triggerSnapshotId === snapshotId &&
          task.monitorRunId === monitorRunId,
      ),
    )
  }
}

interface FakePayload {
  facts: NormalizedFact[]
}

function sourceSnapshot(
  value: string | number,
  retrievedAt: string,
  risk: NormalizedFact['risk'] = 'LOW_RISK_EXACT',
  adapterKey = 'fake-registry/v1',
): SourceSnapshot {
  const payload: FakePayload = {
    facts: [
      {
        path: 'trial.overallStatus',
        value,
        risk,
        sourceIdentifier: identifier,
      },
    ],
  }
  return {
    adapterKey,
    identifier,
    canonicalLocator: 'https://example.test/NCT12345678',
    retrievedAt,
    contentHash: sha256Hex(stableJsonStringify(payload)),
    payload,
  }
}

class QueueAdapter implements EvidenceSourceAdapter {
  fetchCalls = 0

  constructor(
    private readonly outcomes: Array<SourceSnapshot | Error>,
    readonly key = 'fake-registry/v1',
  ) {}

  supports(candidate: SourceIdentifier): boolean {
    return candidate.kind === 'NCT'
  }

  async fetch(): Promise<SourceSnapshot> {
    this.fetchCalls += 1
    const outcome = this.outcomes.shift()
    if (!outcome) throw new Error('No fake source outcome remains.')
    if (outcome instanceof Error) throw outcome
    return clone(outcome)
  }

  async normalize(snapshot: SourceSnapshot): Promise<NormalizedFact[]> {
    return clone((snapshot.payload as FakePayload).facts)
  }

  async diff(previous: SourceSnapshot | null, current: SourceSnapshot): Promise<SourceDiff> {
    return diffNormalizedFacts(
      previous ? await this.normalize(previous) : [],
      await this.normalize(current),
      previous?.contentHash,
      current.contentHash,
    )
  }
}

function run(
  repository: MemoryMonitorRepository,
  adapter: QueueAdapter,
  idempotencyKey: string,
  now: Date,
  overrides: Partial<Parameters<typeof runSourceMonitor>[0]> = {},
) {
  return runSourceMonitor({
    repository,
    adapter,
    identifier,
    sourceId: SOURCE_ID,
    programmeId: PROGRAMME_ID,
    idempotencyKey,
    now: () => now,
    retryDelayMs: 1_000,
    nextCheckAfterMs: 60_000,
    ...overrides,
  })
}

describe('runSourceMonitor', () => {
  it('records an initial immutable baseline and marks it current without inventing a change', async () => {
    const repository = new MemoryMonitorRepository()
    const adapter = new QueueAdapter([sourceSnapshot('RECRUITING', '2026-08-22T00:00:00.000Z')])

    const result = await run(repository, adapter, 'scheduled-2026-08-22', new Date('2026-08-22Z'))

    expect(result).toMatchObject({
      status: 'SUCCEEDED',
      disposition: 'COMPLETED',
      changedFieldCount: 0,
      pendingSnapshotId: null,
      snapshotInserted: true,
    })
    expect(result.currentSnapshotId).toBe(result.snapshotId)
    expect(repository.snapshots.size).toBe(1)
    expect(repository.tasks.size).toBe(0)
    expect(repository.freshness.get(`${PROGRAMME_ID}:${SOURCE_ID}`)).toMatchObject({
      checkStatus: 'SUCCEEDED',
      freshnessStatus: 'CURRENT',
      currentSnapshotId: result.snapshotId,
      pendingSnapshotId: null,
    })
  })

  it('de-duplicates snapshots and does not fetch again for scheduler redelivery', async () => {
    const first = sourceSnapshot('RECRUITING', '2026-08-22T00:00:00.000Z')
    const changed = sourceSnapshot('COMPLETED', '2026-08-23T00:00:00.000Z')
    const repository = new MemoryMonitorRepository()
    const adapter = new QueueAdapter([first, changed, changed])

    await run(repository, adapter, 'day-1', new Date('2026-08-22Z'))
    const second = await run(repository, adapter, 'day-2', new Date('2026-08-23Z'))
    const replay = await run(repository, adapter, 'day-2', new Date('2026-08-23T00:01:00Z'))
    const sameHashNewRun = await run(repository, adapter, 'day-3', new Date('2026-08-24Z'))

    expect(second).toMatchObject({ changedFieldCount: 1, highestImpact: 'LOW_RISK_EXACT_DATA' })
    expect(replay).toMatchObject({
      disposition: 'IDEMPOTENT_REPLAY',
      snapshotInserted: false,
    })
    expect(sameHashNewRun).toMatchObject({ changedFieldCount: 0, snapshotInserted: false })
    expect(adapter.fetchCalls).toBe(3)
    expect(repository.runs.size).toBe(3)
    expect(repository.snapshots.size).toBe(2)
    expect(repository.tasks.size).toBe(0)
  })

  it('holds a changed snapshot pending and creates one durable task for affected claims', async () => {
    const repository = new MemoryMonitorRepository()
    const adapterKey = 'clinicaltrials.gov/v2'
    const adapter = new QueueAdapter(
      [
        sourceSnapshot('RECRUITING', '2026-08-22T00:00:00.000Z', 'LOW_RISK_EXACT', adapterKey),
        sourceSnapshot('TERMINATED', '2026-08-23T00:00:00.000Z', 'LOW_RISK_EXACT', adapterKey),
      ],
      adapterKey,
    )
    const baseline = await run(repository, adapter, 'day-1', new Date('2026-08-22Z'))
    repository.affectedClaimIds = ['claim-1']
    repository.dependencies = [
      {
        claimId: 'claim-1',
        dependentSurfaceType: 'VERDICT',
        evidenceNodeId: null,
        verdictRevisionId: 'verdict-1',
        fieldPath: 'oneSentenceReason',
        impactLevel: 'POSSIBLE_VERDICT_IMPACT',
      },
      {
        claimId: 'claim-1',
        dependentSurfaceType: 'PROGRAMME_SUMMARY',
        evidenceNodeId: null,
        verdictRevisionId: null,
        fieldPath: 'summary.mainLimitation',
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED',
      },
    ]
    repository.affectedInterpretability = [
      { assessmentId: 'assessment-1', criterion: 'DURATION_OPERATIONAL_INTEGRITY' },
    ]

    const changed = await run(repository, adapter, 'day-2', new Date('2026-08-23Z'))
    const replay = await run(repository, adapter, 'day-2', new Date('2026-08-23T00:01:00Z'))

    expect(changed).toMatchObject({
      highestImpact: 'POSSIBLE_VERDICT_IMPACT',
      currentSnapshotId: baseline.snapshotId,
      pendingSnapshotId: changed.snapshotId,
      affectedClaimIds: ['claim-1'],
    })
    expect(changed.reviewTaskIds).toHaveLength(1)
    expect(changed.affectedSurfacePaths).toEqual([
      'PROGRAMME_SUMMARY:summary.mainLimitation',
      'VERDICT:verdict-1:oneSentenceReason',
    ])
    expect(repository.tasks.size).toBe(1)
    expect(repository.sourceDeltas.get(changed.reviewTaskIds[0]!)).toMatchObject({
      baselineSnapshotId: baseline.snapshotId,
      pendingSnapshotId: changed.snapshotId,
      action: 'NEEDS_SCIENTIFIC_REVISION',
      changedTrialFields: [
        {
          path: 'trial.overallStatus',
          before: 'RECRUITING',
          after: 'TERMINATED',
          risk: 'LOW_RISK_EXACT',
        },
      ],
      affectedInterpretability: [
        {
          assessmentId: 'assessment-1',
          criterion: 'DURATION_OPERATIONAL_INTEGRITY',
          reasonCode: 'LINKED_CLAIM_SOURCE_CHANGED',
        },
      ],
      scientificRevisionRequirements: [
        {
          kind: 'CLAIM',
          id: 'claim-1',
          fieldPath: 'claim.sourceSnapshot',
          reasonCode: 'LINKED_CLAIM_SOURCE_CHANGED',
        },
        {
          kind: 'INTERPRETABILITY',
          id: 'assessment-1',
          fieldPath: 'interpretability.DURATION_OPERATIONAL_INTEGRITY',
          reasonCode: 'LINKED_CLAIM_SOURCE_CHANGED',
        },
      ],
      deltaDigestAlgorithm: 'sha256',
      deltaDigest: expect.stringMatching(/^[0-9a-f]{64}$/),
    })
    expect(replay.reviewTaskIds).toEqual(changed.reviewTaskIds)
    expect(repository.tasks.size).toBe(1)
    expect(repository.programmeStatuses.get(PROGRAMME_ID)).toBe('REVIEW_REQUIRED')
    expect(repository.freshness.get(`${PROGRAMME_ID}:${SOURCE_ID}`)).toMatchObject({
      freshnessStatus: 'NEW_EVIDENCE',
      currentSnapshotId: baseline.snapshotId,
      pendingSnapshotId: changed.snapshotId,
    })
  })

  it('atomically supersedes the older open task when a second distinct snapshot becomes pending', async () => {
    const repository = new MemoryMonitorRepository()
    const adapterKey = 'clinicaltrials.gov/v2'
    const adapter = new QueueAdapter(
      [
        sourceSnapshot('RECRUITING', '2026-08-22T00:00:00.000Z', 'LOW_RISK_EXACT', adapterKey),
        sourceSnapshot(
          'ACTIVE_NOT_RECRUITING',
          '2026-08-23T00:00:00.000Z',
          'LOW_RISK_EXACT',
          adapterKey,
        ),
        sourceSnapshot('COMPLETED', '2026-08-24T00:00:00.000Z', 'LOW_RISK_EXACT', adapterKey),
      ],
      adapterKey,
    )
    repository.affectedClaimIds = ['claim-1']

    const baseline = await run(repository, adapter, 'day-1', new Date('2026-08-22Z'))
    const first = await run(repository, adapter, 'day-2', new Date('2026-08-23Z'))
    const second = await run(repository, adapter, 'day-3', new Date('2026-08-24Z'))

    expect(first.reviewTaskIds).toHaveLength(1)
    expect(second.reviewTaskIds).toHaveLength(1)
    expect(second.reviewTaskIds[0]).not.toBe(first.reviewTaskIds[0])
    expect(second).toMatchObject({
      currentSnapshotId: baseline.snapshotId,
      pendingSnapshotId: second.snapshotId,
      highestImpact: 'INTERPRETIVE_REVIEW_REQUIRED',
    })
    expect(repository.tasks.get(first.reviewTaskIds[0]!)).toMatchObject({
      status: 'DISMISSED',
      resolvedAt: new Date('2026-08-24Z'),
      resolutionNote: expect.stringContaining(second.reviewTaskIds[0]!),
    })
    expect(repository.tasks.get(second.reviewTaskIds[0]!)).toMatchObject({
      status: 'OPEN',
      triggerSnapshotId: second.snapshotId,
      resolvedAt: null,
    })
    expect(repository.sourceDeltas.get(second.reviewTaskIds[0]!)).toMatchObject({
      baselineSnapshotId: baseline.snapshotId,
      pendingSnapshotId: second.snapshotId,
      changedTrialFields: [
        {
          path: 'trial.overallStatus',
          before: 'RECRUITING',
          after: 'COMPLETED',
          risk: 'LOW_RISK_EXACT',
        },
      ],
    })
    expect(repository.freshness.get(`${PROGRAMME_ID}:${SOURCE_ID}`)).toMatchObject({
      currentSnapshotId: baseline.snapshotId,
      pendingSnapshotId: second.snapshotId,
      freshnessStatus: 'NEW_EVIDENCE',
    })
  })

  it('dismisses the pending task and clears review state when the source returns to baseline', async () => {
    const repository = new MemoryMonitorRepository()
    const adapter = new QueueAdapter([
      sourceSnapshot('RECRUITING', '2026-08-22T00:00:00.000Z'),
      sourceSnapshot('COMPLETED', '2026-08-23T00:00:00.000Z'),
      sourceSnapshot('RECRUITING', '2026-08-24T00:00:00.000Z'),
    ])
    repository.affectedClaimIds = ['claim-1']

    const baseline = await run(repository, adapter, 'day-1', new Date('2026-08-22Z'))
    const pending = await run(repository, adapter, 'day-2', new Date('2026-08-23Z'))
    const reverted = await run(repository, adapter, 'day-3', new Date('2026-08-24Z'))

    expect(reverted).toMatchObject({
      snapshotId: baseline.snapshotId,
      currentSnapshotId: baseline.snapshotId,
      pendingSnapshotId: null,
      highestImpact: null,
      reviewTaskIds: [],
    })
    expect(repository.tasks.get(pending.reviewTaskIds[0]!)).toMatchObject({
      status: 'DISMISSED',
      resolutionNote: expect.stringContaining('returned to verified baseline'),
    })
    expect(repository.programmeStatuses.get(PROGRAMME_ID)).toBe('CURRENT')
  })

  it('creates a review task for an interpretive adapter diff even without linked claims', async () => {
    const repository = new MemoryMonitorRepository()
    const adapter = new QueueAdapter([
      sourceSnapshot('baseline', '2026-08-22T00:00:00.000Z'),
      sourceSnapshot(
        'interpretation changed',
        '2026-08-23T00:00:00.000Z',
        'INTERPRETIVE_REVIEW_REQUIRED',
      ),
    ])
    await run(repository, adapter, 'day-1', new Date('2026-08-22Z'))

    const result = await run(repository, adapter, 'day-2', new Date('2026-08-23Z'))

    expect(result.highestImpact).toBe('INTERPRETIVE_REVIEW_REQUIRED')
    expect(result.pendingSnapshotId).toBe(result.snapshotId)
    expect(result.reviewTaskIds).toHaveLength(1)
    expect(repository.tasks.values().next().value).toMatchObject({
      affectedClaimIds: [],
      affectedSurfacePaths: [],
      status: 'OPEN',
    })
    const reason = repository.tasks.values().next().value?.reason ?? ''
    expect(reason).toContain('A person must review what the change means')
    expect(reason).not.toContain('INTERPRETIVE_REVIEW_REQUIRED')
  })

  it('records failure, respects retry time, and resumes the same logical run once', async () => {
    const repository = new MemoryMonitorRepository()
    const adapter = new QueueAdapter([
      new EvidenceSourceFetchError('Temporary registry outage', {
        code: 'FAKE_OUTAGE',
        retryable: true,
        sourceUnavailable: true,
      }),
      sourceSnapshot('RECRUITING', '2026-08-22T00:00:01.000Z'),
    ])
    const startedAt = new Date('2026-08-22T00:00:00.000Z')

    const failed = await run(repository, adapter, 'retryable-run', startedAt)
    const tooSoon = await run(
      repository,
      adapter,
      'retryable-run',
      new Date('2026-08-22T00:00:00.500Z'),
    )
    const recovered = await run(
      repository,
      adapter,
      'retryable-run',
      new Date('2026-08-22T00:00:01.000Z'),
    )

    expect(failed).toMatchObject({
      status: 'SOURCE_UNAVAILABLE',
      disposition: 'RETRY_SCHEDULED',
      attemptNumber: 1,
      errorCode: 'FAKE_OUTAGE',
    })
    expect(tooSoon.disposition).toBe('RETRY_SCHEDULED')
    expect(recovered).toMatchObject({
      status: 'SUCCEEDED',
      disposition: 'COMPLETED',
      attemptNumber: 2,
    })
    expect(adapter.fetchCalls).toBe(2)
    expect(repository.runs.size).toBe(1)
    expect(repository.freshness.get(`${PROGRAMME_ID}:${SOURCE_ID}`)).toMatchObject({
      checkStatus: 'SUCCEEDED',
      freshnessStatus: 'CURRENT',
      consecutiveFailures: 0,
      lastErrorCode: null,
    })
  })

  it('does not retry a non-retryable adapter contract failure', async () => {
    const repository = new MemoryMonitorRepository()
    const malformed = sourceSnapshot('RECRUITING', '2026-08-22T00:00:00.000Z')
    malformed.contentHash = 'not-sha256'
    const adapter = new QueueAdapter([malformed])

    const failed = await run(repository, adapter, 'malformed-run', new Date('2026-08-22Z'))
    const replay = await run(repository, adapter, 'malformed-run', new Date('2026-08-23Z'))

    expect(failed).toMatchObject({
      status: 'FAILED',
      disposition: 'RETRY_EXHAUSTED',
      errorCode: 'SNAPSHOT_HASH_INVALID',
      nextRetryAt: null,
    })
    expect(replay.disposition).toBe('RETRY_EXHAUSTED')
    expect(adapter.fetchCalls).toBe(1)
    expect(repository.snapshots.size).toBe(0)
  })

  it('reclaims a stale running lease after a worker crash without creating a second run', async () => {
    const repository = new MemoryMonitorRepository()
    const malformed = sourceSnapshot('RECRUITING', '2026-08-22T00:00:00.000Z')
    malformed.contentHash = 'bad-hash'
    const adapter = new QueueAdapter([
      malformed,
      sourceSnapshot('RECRUITING', '2026-08-22T00:10:00.000Z'),
    ])
    const first = await run(repository, adapter, 'worker-crash', new Date('2026-08-22Z'))
    const stored = repository.runs.get(first.runId)!
    repository.runs.set(first.runId, {
      ...stored,
      status: 'RUNNING',
      attemptNumber: 1,
      maxAttempts: 3,
      startedAt: new Date('2026-08-22T00:00:00.000Z'),
      finishedAt: null,
      errorCode: null,
      errorMessage: null,
    })

    const recovered = await run(
      repository,
      adapter,
      'worker-crash',
      new Date('2026-08-22T00:10:00.000Z'),
      { runningLeaseMs: 60_000 },
    )

    expect(recovered).toMatchObject({
      runId: first.runId,
      status: 'SUCCEEDED',
      attemptNumber: 2,
    })
    expect(repository.runs.size).toBe(1)
    expect(repository.snapshots.size).toBe(1)
    expect(adapter.fetchCalls).toBe(2)
  })
})
