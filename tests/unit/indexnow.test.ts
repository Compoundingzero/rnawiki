import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  INDEXNOW_MAX_URLS_PER_BATCH,
  notifyEligibleProgrammePublication,
  notifyExplicitIndexNowChange,
  type IndexNowEnvironment,
} from '@/lib/seo/indexnow'
import type { MedicinePublicationIndexabilityReport } from '@/lib/seo/publication-indexability'

const enabledEnvironment: IndexNowEnvironment = {
  NODE_ENV: 'production',
  SEO_DEPLOYMENT_ENV: 'production',
  SITE_URL: 'https://rnawiki.com',
  INDEXNOW_ENABLED: 'true',
  INDEXNOW_KEY: 'rnawiki-indexnow-key',
  INDEXNOW_TIMEOUT_MS: '100',
}

function fetchSuccess() {
  const mock = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(null, { status: 200 }),
  )
  return mock as typeof mock & typeof fetch
}

function logger() {
  return { info: vi.fn(), warn: vi.fn() }
}

function eligibilityReport(
  index: boolean,
  programmeId = 'programme-indexnow',
): MedicinePublicationIndexabilityReport {
  return {
    medicineId: 'internal-medicine-id',
    medicineName: 'Example medicine',
    canonicalSlug: 'example-medicine',
    selectedProgrammeId: programmeId,
    freshness: index ? 'current' : 'stale',
    issues: index
      ? []
      : [
          {
            code: 'public_content_not_current',
            explanation: 'The public content is not current.',
          },
        ],
    decision: index
      ? {
          index: true,
          follow: true,
          reason: 'indexable_reviewed_publication',
          canonicalSlug: 'example-medicine',
          lastPublicContentUpdate: new Date('2026-08-25T00:00:00.000Z'),
        }
      : {
          index: false,
          follow: true,
          reason: 'public_content_not_current',
          canonicalSlug: 'example-medicine',
          lastPublicContentUpdate: null,
        },
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('IndexNow notification boundary', () => {
  it.each([
    [{ ...enabledEnvironment, INDEXNOW_ENABLED: 'false' }, 'disabled'],
    [{ ...enabledEnvironment, INDEXNOW_KEY: '' }, 'missing_key'],
    [
      { ...enabledEnvironment, INDEXNOW_KEY_LOCATION: 'https://other.example/indexnow-key.txt' },
      'invalid_configuration',
    ],
  ] as const)(
    'is a database and network no-op when configuration is %s',
    async (environment, reason) => {
      const fetchImpl = fetchSuccess()
      const loadEligibility = vi.fn()

      const result = await notifyEligibleProgrammePublication('programme-indexnow', {
        environment,
        fetchImpl,
        loadEligibility,
        logger: logger(),
      })

      expect(result).toMatchObject({ outcome: 'skipped', reason })
      expect(loadEligibility).not.toHaveBeenCalled()
      expect(fetchImpl).not.toHaveBeenCalled()
    },
  )

  it('submits only deduplicated, canonical, same-origin URLs without query strings or fragments', async () => {
    const fetchImpl = fetchSuccess()
    const result = await notifyExplicitIndexNowChange(
      {
        change: 'removal',
        urls: [
          'https://rnawiki.com/d/example-medicine',
          'https://rnawiki.com/d/example-medicine',
          'https://rnawiki.com/d/example-medicine?programme=legacy',
          'https://rnawiki.com/d/example-medicine#history',
          'https://other.example/d/example-medicine',
          'http://rnawiki.com/d/example-medicine',
        ],
      },
      { environment: enabledEnvironment, fetchImpl, logger: logger() },
    )

    expect(result).toMatchObject({
      outcome: 'submitted',
      acceptedUrlCount: 1,
      rejectedUrlCount: 4,
      batchCount: 1,
    })
    const payload = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body))
    expect(payload.urlList).toEqual(['https://rnawiki.com/d/example-medicine'])
    expect(payload.key).toBe(enabledEnvironment.INDEXNOW_KEY)
    expect(payload.keyLocation).toBe('https://rnawiki.com/indexnow-key.txt')
    expect(JSON.stringify(payload.urlList)).not.toMatch(/[?#]/)
  })

  it('splits large explicit changes into requests capped at 10,000 URLs', async () => {
    const fetchImpl = fetchSuccess()
    const urls = Array.from(
      { length: INDEXNOW_MAX_URLS_PER_BATCH + 1 },
      (_unused, index) => `https://rnawiki.com/retired/${index}`,
    )

    const result = await notifyExplicitIndexNowChange(
      { change: 'deletion', urls },
      { environment: enabledEnvironment, fetchImpl, logger: logger() },
    )

    expect(result).toMatchObject({
      outcome: 'submitted',
      acceptedUrlCount: INDEXNOW_MAX_URLS_PER_BATCH + 1,
      batchCount: 2,
    })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    const batchSizes = fetchImpl.mock.calls.map(
      (call) => JSON.parse(String(call[1]?.body)).urlList.length,
    )
    expect(batchSizes).toEqual([INDEXNOW_MAX_URLS_PER_BATCH, 1])
  })

  it('times out and reports a network failure without rejecting the caller', async () => {
    vi.useFakeTimers()
    const log = logger()
    const fetchImpl = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Timed out', 'AbortError')),
          )
        }),
    ) as unknown as typeof fetch

    const notification = notifyExplicitIndexNowChange(
      { change: 'redirect', urls: ['https://rnawiki.com/c/old-medicine'] },
      { environment: enabledEnvironment, fetchImpl, logger: log },
    )
    await vi.advanceTimersByTimeAsync(100)

    await expect(notification).resolves.toMatchObject({
      outcome: 'failed',
      batchCount: 1,
      failedBatchCount: 1,
    })
    expect(log.warn).toHaveBeenCalledWith(
      '[seo.indexnow_failed]',
      expect.stringContaining('AbortError'),
    )
  })

  it('suppresses a publication that fails the re-queried shared policy', async () => {
    const fetchImpl = fetchSuccess()
    const loadEligibility = vi.fn().mockResolvedValue([eligibilityReport(false)])

    const result = await notifyEligibleProgrammePublication('programme-indexnow', {
      environment: enabledEnvironment,
      fetchImpl,
      loadEligibility,
      logger: logger(),
    })

    expect(result).toMatchObject({ outcome: 'skipped', reason: 'publication_not_indexable' })
    expect(loadEligibility).toHaveBeenCalledOnce()
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('submits only the eligible canonical base dossier for the newly published default programme', async () => {
    const fetchImpl = fetchSuccess()
    const loadEligibility = vi
      .fn()
      .mockResolvedValue([
        eligibilityReport(true, 'another-programme'),
        eligibilityReport(true, 'programme-indexnow'),
      ])

    const result = await notifyEligibleProgrammePublication('programme-indexnow', {
      environment: enabledEnvironment,
      fetchImpl,
      loadEligibility,
      logger: logger(),
    })

    expect(result.outcome).toBe('submitted')
    expect(loadEligibility).toHaveBeenCalledOnce()
    const payload = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body))
    expect(payload.urlList).toEqual(['https://rnawiki.com/d/example-medicine'])
  })

  it('logs an eligibility re-query failure and resolves without making a network request', async () => {
    const fetchImpl = fetchSuccess()
    const log = logger()
    const loadEligibility = vi.fn().mockRejectedValue(new Error('database unavailable'))

    await expect(
      notifyEligibleProgrammePublication('programme-indexnow', {
        environment: enabledEnvironment,
        fetchImpl,
        loadEligibility,
        logger: log,
      }),
    ).resolves.toMatchObject({ outcome: 'failed', reason: 'eligibility_requery_failed' })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(log.warn).toHaveBeenCalledWith(
      '[seo.indexnow_eligibility_failed]',
      expect.not.stringContaining('database unavailable'),
    )
  })
})
