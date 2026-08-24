import { describe, expect, it, vi } from 'vitest'
import { drizzle } from 'drizzle-orm/node-postgres'

import type { Db } from '@/db'
import * as evidenceSchema from '@/db/schema'
import {
  deriveClinicalTrialsObservationIdempotencyKey,
  runDueClinicalTrialsSourceBatch,
  type DueClinicalTrialsSource,
} from '@/lib/evidence/clinical-trials-source-sync'
import { parseClinicalTrialsSourceSyncArgs } from '@/lib/evidence/clinical-trials-source-sync-cli'
import { buildDueClinicalTrialsSourcesQuery } from '@/lib/evidence/clinical-trials-source-sync-drizzle'
import type { SourceMonitorResult } from '@/lib/evidence/source-monitor'

function dueSource(
  sourceId: string,
  overrides: Partial<DueClinicalTrialsSource> = {},
): DueClinicalTrialsSource {
  return {
    programmeId: `programme-${sourceId}`,
    sourceId,
    externalIdentifier: 'NCT12345678',
    lastSuccessfulCheckAt: new Date('2026-08-20T10:00:00.000Z'),
    nextCheckDueAt: new Date('2026-08-22T10:00:00.000Z'),
    ...overrides,
  }
}

function monitorResult(overrides: Partial<SourceMonitorResult> = {}): SourceMonitorResult {
  return {
    runId: 'monitor-1',
    disposition: 'COMPLETED',
    status: 'SUCCEEDED',
    attemptNumber: 1,
    snapshotId: 'snapshot-1',
    snapshotInserted: true,
    changedFieldCount: 0,
    changes: [],
    affectedClaimIds: [],
    affectedSurfacePaths: [],
    highestImpact: null,
    reviewTaskIds: [],
    currentSnapshotId: 'snapshot-1',
    pendingSnapshotId: null,
    errorCode: null,
    nextRetryAt: null,
    ...overrides,
  }
}

describe('ClinicalTrials.gov scheduled source sync', () => {
  it('derives a durable observation key that survives retry deadline movement', () => {
    const source = dueSource('source-1')
    const rescheduledRetry = {
      ...source,
      externalIdentifier: ' nct12345678 ',
      nextCheckDueAt: new Date('2026-08-22T10:15:00.000Z'),
    }

    expect(deriveClinicalTrialsObservationIdempotencyKey(rescheduledRetry)).toBe(
      deriveClinicalTrialsObservationIdempotencyKey(source),
    )
    expect(
      deriveClinicalTrialsObservationIdempotencyKey({
        ...source,
        lastSuccessfulCheckAt: new Date('2026-08-22T10:16:00.000Z'),
      }),
    ).not.toBe(deriveClinicalTrialsObservationIdempotencyKey(source))
  })

  it('makes first checks due without bypassing future NOT_CHECKED or failed deadlines', () => {
    const database = drizzle.mock({ schema: evidenceSchema }) as unknown as Db
    const observedAt = new Date('2026-08-22T12:00:00.000Z')
    const statement = buildDueClinicalTrialsSourcesQuery(database, {
      observedAt,
      limit: 25,
    }).toSQL()
    const sql = statement.sql.replace(/\s+/g, ' ')

    expect(sql).toMatch(
      /\("programme_freshness_states"\."check_status" = \$\d+ and "programme_freshness_states"\."next_check_due_at" is null\)/,
    )
    expect(sql).toMatch(/or "programme_freshness_states"\."next_check_due_at" <= \$\d+/)
    expect(statement.params).toContain(observedAt.toISOString())
  })

  it('uses a stable initial watermark before the first successful observation', () => {
    const source = dueSource('source-1', {
      lastSuccessfulCheckAt: null,
      nextCheckDueAt: null,
    })

    expect(deriveClinicalTrialsObservationIdempotencyKey(source)).toMatch(
      /^ctgov_observation_[0-9a-f]{64}$/,
    )
    expect(
      deriveClinicalTrialsObservationIdempotencyKey({
        ...source,
        nextCheckDueAt: new Date('2026-08-22T10:15:00.000Z'),
      }),
    ).toBe(deriveClinicalTrialsObservationIdempotencyKey(source))
  })

  it('bounds selection, isolates each monitor failure, and returns ordered machine data', async () => {
    const sources = [
      dueSource('source-1'),
      dueSource('source-2'),
      dueSource('source-3'),
      dueSource('source-4'),
    ]
    const queryDueSources = vi.fn(async () => sources)
    const monitorSource = vi.fn(async ({ sourceId }: { sourceId: string }) => {
      if (sourceId === 'source-2')
        throw Object.assign(new Error('database connection lost'), { code: '08006' })
      if (sourceId === 'source-3') {
        return monitorResult({
          runId: 'monitor-3',
          status: 'RUNNING',
          disposition: 'IN_PROGRESS',
          snapshotId: null,
          currentSnapshotId: null,
        })
      }
      return monitorResult({ runId: `monitor-${sourceId}` })
    })
    const times = [new Date('2026-08-22T12:00:00.000Z'), new Date('2026-08-22T12:00:01.000Z')]

    const summary = await runDueClinicalTrialsSourceBatch({
      dependencies: { queryDueSources, monitorSource },
      limit: 3,
      concurrency: 2,
      now: () => times.shift()!,
    })

    expect(queryDueSources).toHaveBeenCalledWith({
      observedAt: new Date('2026-08-22T12:00:00.000Z'),
      limit: 3,
    })
    expect(monitorSource).toHaveBeenCalledTimes(3)
    expect(monitorSource.mock.calls.map(([input]) => input.sourceId)).not.toContain('source-4')
    expect(summary).toMatchObject({
      schemaVersion: 'clinical-trials-source-sync/v1',
      startedAt: '2026-08-22T12:00:00.000Z',
      finishedAt: '2026-08-22T12:00:01.000Z',
      limit: 3,
      concurrency: 2,
      counts: {
        selected: 3,
        succeeded: 1,
        failed: 1,
        inProgress: 1,
        idempotentReplays: 0,
      },
    })
    expect(summary.results.map((result) => result.sourceId)).toEqual([
      'source-1',
      'source-2',
      'source-3',
    ])
    expect(summary.results[1]).toMatchObject({
      outcome: 'FAILED',
      errorCode: '08006',
      errorMessage: 'database connection lost',
      monitorRunId: null,
    })
  })

  it('reports stored retries and idempotent replays without another scheduling primitive', async () => {
    const source = dueSource('source-1')
    const summary = await runDueClinicalTrialsSourceBatch({
      dependencies: {
        queryDueSources: async () => [source],
        monitorSource: async () =>
          monitorResult({
            disposition: 'IDEMPOTENT_REPLAY',
            snapshotInserted: false,
          }),
      },
      now: () => new Date('2026-08-22T12:00:00.000Z'),
    })

    expect(summary.counts).toMatchObject({
      selected: 1,
      succeeded: 1,
      idempotentReplays: 1,
    })
    expect(summary.results[0]).toMatchObject({
      outcome: 'SUCCEEDED',
      disposition: 'IDEMPOTENT_REPLAY',
    })
  })

  it('contains an invalid due row without aborting the remaining sources', async () => {
    const monitorSource = vi.fn(async () => monitorResult())
    const summary = await runDueClinicalTrialsSourceBatch({
      dependencies: {
        queryDueSources: async () => [
          dueSource('invalid-source', { externalIdentifier: 'EUCTR-123' }),
          dueSource('valid-source'),
        ],
        monitorSource,
      },
      now: () => new Date('2026-08-22T12:00:00.000Z'),
    })

    expect(summary.counts).toMatchObject({ selected: 2, failed: 1, succeeded: 1 })
    expect(summary.results[0]).toMatchObject({
      outcome: 'FAILED',
      errorCode: 'DUE_SOURCE_INVALID',
      idempotencyKey: null,
    })
    expect(monitorSource).toHaveBeenCalledTimes(1)
    expect(monitorSource).toHaveBeenCalledWith(
      expect.objectContaining({ sourceId: 'valid-source' }),
    )
  })

  it('rejects unbounded operator settings before querying', async () => {
    const queryDueSources = vi.fn(async () => [])

    await expect(
      runDueClinicalTrialsSourceBatch({
        dependencies: { queryDueSources, monitorSource: vi.fn() },
        limit: 101,
      }),
    ).rejects.toThrow('limit must be an integer between 1 and 100')
    expect(queryDueSources).not.toHaveBeenCalled()
  })

  it('rejects missing, zero, duplicate, and out-of-range CLI option values', () => {
    expect(() => parseClinicalTrialsSourceSyncArgs(['--limit'])).toThrow(
      '--limit requires a positive integer',
    )
    expect(() => parseClinicalTrialsSourceSyncArgs(['--limit', '0'])).toThrow(
      '--limit must be between 1 and 100',
    )
    expect(() => parseClinicalTrialsSourceSyncArgs(['--limit', '1', '--limit', '2'])).toThrow(
      'Duplicate source-sync option: --limit',
    )
    expect(() => parseClinicalTrialsSourceSyncArgs(['--concurrency', '11'])).toThrow(
      '--concurrency must be between 1 and 10',
    )
    expect(parseClinicalTrialsSourceSyncArgs(['--concurrency', '2', '--limit', '7'])).toEqual({
      limit: 7,
      concurrency: 2,
    })
  })
})
