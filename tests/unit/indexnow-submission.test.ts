import { describe, expect, it } from 'vitest'

import { buildIndexNowBatches, INDEXNOW_MAX_URLS_PER_BATCH } from '@/lib/seo/indexnow'
import {
  DEFAULT_INDEXNOW_LEDGER,
  indexableCanonicalUrls,
  indexNowLedgerEntry,
  parseSubmitIndexNowArguments,
  type IndexableDecisionReport,
} from '@/scripts/discovery/indexnow-submission'

const ORIGIN = 'https://rnawiki.com'
const contentDate = new Date('2026-08-22T00:00:00.000Z')

function decisionReport(
  index: boolean,
  canonicalSlug: string | null,
  lastPublicContentUpdate: Date | null = contentDate,
): IndexableDecisionReport {
  return { decision: { index, canonicalSlug, lastPublicContentUpdate } }
}

describe('IndexNow submission arguments', () => {
  it('is a dry run unless --submit is passed', () => {
    expect(parseSubmitIndexNowArguments([]).dryRun).toBe(true)
    expect(parseSubmitIndexNowArguments(['--dry-run']).dryRun).toBe(true)
    expect(parseSubmitIndexNowArguments(['--submit']).dryRun).toBe(false)
    expect(parseSubmitIndexNowArguments([]).outFile).toBe(DEFAULT_INDEXNOW_LEDGER)
  })

  it('reads the origin from the flag, then the environment, then the canonical default', () => {
    expect(parseSubmitIndexNowArguments(['--origin', 'https://staging.example']).origin.href).toBe(
      'https://staging.example/',
    )
    expect(
      parseSubmitIndexNowArguments([], { SITE_URL: 'https://other.example' }).origin.href,
    ).toBe('https://other.example/')
    expect(parseSubmitIndexNowArguments([]).origin.href).toBe('https://rnawiki.com/')
    // A development SITE_URL is not an IndexNow origin; the canonical default stands instead.
    expect(
      parseSubmitIndexNowArguments([], { SITE_URL: 'http://localhost:3000' }).origin.href,
    ).toBe('https://rnawiki.com/')
  })

  it('refuses a plain-HTTP origin, credentials, a path and an unknown option', () => {
    expect(() => parseSubmitIndexNowArguments(['--origin', 'http://rnawiki.com'])).toThrow(/HTTPS/)
    expect(() => parseSubmitIndexNowArguments(['--origin', 'https://a:b@x.example'])).toThrow(
      /credentials/,
    )
    expect(() => parseSubmitIndexNowArguments(['--origin', 'https://x.example/p'])).toThrow(
      /without a path/,
    )
    expect(() => parseSubmitIndexNowArguments(['--nope'])).toThrow(/Unknown option/)
  })
})

describe('submission URL projection', () => {
  it('submits exactly the URLs the sitemap would emit', () => {
    expect(
      indexableCanonicalUrls(
        [
          decisionReport(true, 'inclisiran'),
          decisionReport(false, 'excluded-medicine'),
          decisionReport(true, null),
          decisionReport(true, 'no-public-date', null),
          decisionReport(true, 'aspirin'),
          decisionReport(true, 'inclisiran'),
        ],
        ORIGIN,
      ),
    ).toEqual([`${ORIGIN}/d/aspirin`, `${ORIGIN}/d/inclisiran`])
  })
})

describe('submission batching', () => {
  it('splits at the IndexNow request limit and rejects foreign or query URLs', () => {
    const urls = Array.from(
      { length: INDEXNOW_MAX_URLS_PER_BATCH + 5 },
      (_unused, index) => `${ORIGIN}/d/medicine-${index}`,
    )
    const { batches, rejectedUrlCount } = buildIndexNowBatches(
      [...urls, 'https://elsewhere.example/d/x', `${ORIGIN}/d/x?programme=1`],
      ORIGIN,
    )

    expect(batches).toHaveLength(2)
    expect(batches[0]).toHaveLength(INDEXNOW_MAX_URLS_PER_BATCH)
    expect(batches[1]).toHaveLength(5)
    expect(rejectedUrlCount).toBe(2)
  })
})

describe('submission ledger', () => {
  it('records counts, batch sizes and HTTP statuses, and never the key', () => {
    const entry = indexNowLedgerEntry({
      submittedAt: '2026-09-01T00:00:00.000Z',
      mode: 'submitted',
      origin: ORIGIN,
      eligibleUrlCount: 9_900,
      batches: [Array.from({ length: 9_900 }, (_unused, index) => `${ORIGIN}/d/m-${index}`)],
      rejectedUrlCount: 3,
      outcomes: [{ batchSize: 9_900, status: 202 }],
    })

    expect(entry).toMatchObject({
      mode: 'submitted',
      eligibleUrlCount: 9_900,
      acceptedUrlCount: 9_900,
      rejectedUrlCount: 3,
      batchCount: 1,
      batchSizes: [9_900],
      failedBatchCount: 0,
    })
    expect(JSON.stringify(entry)).not.toMatch(/key/i)
  })

  it('counts a failed batch and names the guard when a run refused to submit', () => {
    const entry = indexNowLedgerEntry({
      submittedAt: '2026-09-01T00:00:00.000Z',
      mode: 'dry_run',
      origin: ORIGIN,
      eligibleUrlCount: 2,
      batches: [[`${ORIGIN}/d/a`, `${ORIGIN}/d/b`]],
      rejectedUrlCount: 0,
      outcomes: [{ batchSize: 2, status: 0, error: 'AbortError' }],
      refusedReason: 'deployment_guard_or_key_not_configured',
    })

    expect(entry.failedBatchCount).toBe(1)
    expect(entry.refusedReason).toBe('deployment_guard_or_key_not_configured')
  })
})
