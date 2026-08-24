import { createHash } from 'node:crypto'

import type { SourceMonitorResult } from './source-monitor'

const NCT_IDENTIFIER_PATTERN = /^NCT\d{8}$/

export const DEFAULT_CLINICAL_TRIALS_SYNC_LIMIT = 25
export const MAX_CLINICAL_TRIALS_SYNC_LIMIT = 100
export const DEFAULT_CLINICAL_TRIALS_SYNC_CONCURRENCY = 4
export const MAX_CLINICAL_TRIALS_SYNC_CONCURRENCY = 10

export interface DueClinicalTrialsSource {
  programmeId: string
  sourceId: string
  externalIdentifier: string
  /** Stable observation watermark. It changes only after a successful source check. */
  lastSuccessfulCheckAt: Date | null
  /** Scheduling metadata only; deliberately excluded from the idempotency key. */
  nextCheckDueAt: Date | null
}

export interface QueryDueClinicalTrialsSourcesInput {
  observedAt: Date
  limit: number
}

export interface MonitorDueClinicalTrialsSourceInput {
  programmeId: string
  sourceId: string
  idempotencyKey: string
}

export interface ClinicalTrialsSourceSyncDependencies {
  queryDueSources(
    input: QueryDueClinicalTrialsSourcesInput,
  ): Promise<readonly DueClinicalTrialsSource[]>
  monitorSource(input: MonitorDueClinicalTrialsSourceInput): Promise<SourceMonitorResult>
}

export interface RunDueClinicalTrialsSourceBatchInput {
  dependencies: ClinicalTrialsSourceSyncDependencies
  limit?: number
  concurrency?: number
  now?: () => Date
}

export type ClinicalTrialsSourceSyncOutcome = 'SUCCEEDED' | 'FAILED' | 'IN_PROGRESS'

export interface ClinicalTrialsSourceSyncItemResult {
  programmeId: string
  sourceId: string
  externalIdentifier: string
  observationWatermark: string
  dueAt: string | null
  idempotencyKey: string | null
  outcome: ClinicalTrialsSourceSyncOutcome
  monitorRunId: string | null
  disposition: SourceMonitorResult['disposition'] | null
  status: SourceMonitorResult['status'] | null
  attemptNumber: number | null
  snapshotId: string | null
  changedFieldCount: number
  reviewTaskCount: number
  errorCode: string | null
  errorMessage: string | null
  nextRetryAt: string | null
}

export interface ClinicalTrialsSourceSyncSummary {
  schemaVersion: 'clinical-trials-source-sync/v1'
  startedAt: string
  finishedAt: string
  limit: number
  concurrency: number
  counts: {
    selected: number
    succeeded: number
    failed: number
    inProgress: number
    idempotentReplays: number
  }
  results: ClinicalTrialsSourceSyncItemResult[]
}

function assertValidDate(value: Date, field: string): void {
  if (!Number.isFinite(value.getTime())) throw new TypeError(`${field} must be a valid Date.`)
}

function boundedInteger(
  value: number | undefined,
  fallback: number,
  maximum: number,
  field: string,
): number {
  const resolved = value ?? fallback
  if (!Number.isInteger(resolved) || resolved < 1 || resolved > maximum) {
    throw new TypeError(`${field} must be an integer between 1 and ${maximum}.`)
  }
  return resolved
}

function normalizedNctIdentifier(value: string): string {
  const normalized = value.trim().toUpperCase()
  if (!NCT_IDENTIFIER_PATTERN.test(normalized)) {
    throw new TypeError(`ClinicalTrials.gov source identifier is invalid: ${value}`)
  }
  return normalized
}

function lengthPrefixed(parts: readonly string[]): string {
  return parts.map((part) => `${part.length}:${part}`).join('|')
}

export function clinicalTrialsObservationWatermark(source: DueClinicalTrialsSource): string {
  if (source.lastSuccessfulCheckAt === null) return 'NEVER_SUCCEEDED'
  assertValidDate(source.lastSuccessfulCheckAt, 'lastSuccessfulCheckAt')
  return source.lastSuccessfulCheckAt.toISOString()
}

/**
 * Durable key for one observation cycle. A retry deadline may move between attempts, so it is not
 * part of the key. The last-success watermark advances only when the monitor completes a source
 * observation, making scheduler redelivery and adapter retries converge on the same monitor run.
 */
export function deriveClinicalTrialsObservationIdempotencyKey(
  source: DueClinicalTrialsSource,
): string {
  const material = lengthPrefixed([
    'clinical-trials-source-sync/v1',
    source.programmeId,
    source.sourceId,
    normalizedNctIdentifier(source.externalIdentifier),
    clinicalTrialsObservationWatermark(source),
  ])
  return `ctgov_observation_${createHash('sha256').update(material, 'utf8').digest('hex')}`
}

function errorDetails(error: unknown): { code: string; message: string } {
  const candidate = error as { code?: unknown; message?: unknown }
  const code =
    typeof candidate?.code === 'string' && candidate.code.trim()
      ? candidate.code.trim().slice(0, 120)
      : 'MONITOR_INVOCATION_FAILED'
  const message =
    typeof candidate?.message === 'string' && candidate.message.trim()
      ? candidate.message.trim().slice(0, 2_000)
      : 'The source monitor failed without an error message.'
  return { code, message }
}

function operationalOutcome(result: SourceMonitorResult): ClinicalTrialsSourceSyncOutcome {
  if (result.status === 'SUCCEEDED') return 'SUCCEEDED'
  if (result.status === 'QUEUED' || result.status === 'RUNNING') return 'IN_PROGRESS'
  return 'FAILED'
}

async function monitorOne(
  source: DueClinicalTrialsSource,
  monitorSource: ClinicalTrialsSourceSyncDependencies['monitorSource'],
): Promise<ClinicalTrialsSourceSyncItemResult> {
  let common: Pick<
    ClinicalTrialsSourceSyncItemResult,
    | 'programmeId'
    | 'sourceId'
    | 'externalIdentifier'
    | 'observationWatermark'
    | 'dueAt'
    | 'idempotencyKey'
  > = {
    programmeId: source.programmeId,
    sourceId: source.sourceId,
    externalIdentifier: source.externalIdentifier.trim().toUpperCase(),
    observationWatermark: 'UNAVAILABLE',
    dueAt: null,
    idempotencyKey: null,
  }

  try {
    if (!source.programmeId.trim() || !source.sourceId.trim()) {
      throw new TypeError('Due source programmeId and sourceId are required.')
    }
    if (source.nextCheckDueAt) assertValidDate(source.nextCheckDueAt, 'nextCheckDueAt')
    const externalIdentifier = normalizedNctIdentifier(source.externalIdentifier)
    const observationWatermark = clinicalTrialsObservationWatermark(source)
    const idempotencyKey = deriveClinicalTrialsObservationIdempotencyKey(source)
    common = {
      ...common,
      externalIdentifier,
      observationWatermark,
      dueAt: source.nextCheckDueAt?.toISOString() ?? null,
      idempotencyKey,
    }
    const result = await monitorSource({
      programmeId: source.programmeId,
      sourceId: source.sourceId,
      idempotencyKey,
    })
    return {
      ...common,
      outcome: operationalOutcome(result),
      monitorRunId: result.runId,
      disposition: result.disposition,
      status: result.status,
      attemptNumber: result.attemptNumber,
      snapshotId: result.snapshotId,
      changedFieldCount: result.changedFieldCount,
      reviewTaskCount: result.reviewTaskIds.length,
      errorCode: result.errorCode,
      errorMessage: null,
      nextRetryAt: result.nextRetryAt?.toISOString() ?? null,
    }
  } catch (error) {
    const failure = errorDetails(error)
    return {
      ...common,
      outcome: 'FAILED',
      monitorRunId: null,
      disposition: null,
      status: null,
      attemptNumber: null,
      snapshotId: null,
      changedFieldCount: 0,
      reviewTaskCount: 0,
      errorCode: common.idempotencyKey === null ? 'DUE_SOURCE_INVALID' : failure.code,
      errorMessage: failure.message,
      nextRetryAt: null,
    }
  }
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  work: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let nextIndex = 0

  const worker = async (): Promise<void> => {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      const item = items[index]
      if (item !== undefined) results[index] = await work(item)
    }
  }

  const workerCount = Math.min(concurrency, items.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}

/** Runs one bounded, dependency-injected scheduled observation batch. */
export async function runDueClinicalTrialsSourceBatch(
  input: RunDueClinicalTrialsSourceBatchInput,
): Promise<ClinicalTrialsSourceSyncSummary> {
  const limit = boundedInteger(
    input.limit,
    DEFAULT_CLINICAL_TRIALS_SYNC_LIMIT,
    MAX_CLINICAL_TRIALS_SYNC_LIMIT,
    'limit',
  )
  const concurrency = boundedInteger(
    input.concurrency,
    DEFAULT_CLINICAL_TRIALS_SYNC_CONCURRENCY,
    MAX_CLINICAL_TRIALS_SYNC_CONCURRENCY,
    'concurrency',
  )
  const now = input.now ?? (() => new Date())
  const startedAt = now()
  assertValidDate(startedAt, 'now()')

  const due = await input.dependencies.queryDueSources({ observedAt: startedAt, limit })
  const selected = due.slice(0, limit)
  const results = await mapWithConcurrency(selected, concurrency, (source) =>
    monitorOne(source, input.dependencies.monitorSource),
  )
  const finishedAt = now()
  assertValidDate(finishedAt, 'now()')

  return {
    schemaVersion: 'clinical-trials-source-sync/v1',
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    limit,
    concurrency,
    counts: {
      selected: results.length,
      succeeded: results.filter((result) => result.outcome === 'SUCCEEDED').length,
      failed: results.filter((result) => result.outcome === 'FAILED').length,
      inProgress: results.filter((result) => result.outcome === 'IN_PROGRESS').length,
      idempotentReplays: results.filter((result) => result.disposition === 'IDEMPOTENT_REPLAY')
        .length,
    },
    results,
  }
}
