import { describe, expect, it } from 'vitest'

import { buildIndexNowBatches, INDEXNOW_MAX_URLS_PER_BATCH } from '@/lib/seo/indexnow'
import {
  DEFAULT_INDEXNOW_LEDGER,
  indexableCanonicalUrls,
  indexNowLedgerEntry,
  parseSubmitIndexNowArguments,
  sitemapSubmissionUrls,
  tierSitemapUrl,
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
      urlSet: 'tier-1-sitemap',
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
      urlSet: 'legacy-publication',
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

describe('corpus tier submission', () => {
  it('reads a tier from the sitemap by default and refuses a tier that is in no sitemap', () => {
    expect(parseSubmitIndexNowArguments([]).tier).toBeNull()
    expect(parseSubmitIndexNowArguments([]).source).toBe('sitemap')
    expect(parseSubmitIndexNowArguments(['--tier', '1']).tier).toBe(1)
    expect(parseSubmitIndexNowArguments(['--tier=2', '--source=db']).source).toBe('db')
    expect(() => parseSubmitIndexNowArguments(['--tier', '3'])).toThrow(/no sitemap/)
    expect(() => parseSubmitIndexNowArguments(['--tier', '0'])).toThrow(/--tier must be 1 or 2/)
    expect(() => parseSubmitIndexNowArguments(['--source', 'guess'])).toThrow(/sitemap or db/)
    // Reading rows instead of the served document is still one tier's rows, never everything.
    expect(() => parseSubmitIndexNowArguments(['--source', 'db'])).toThrow(/needs --tier/)
  })

  it('names the sitemap child a tier is served from', () => {
    expect(tierSitemapUrl(ORIGIN, 1)).toBe(`${ORIGIN}/sitemaps/tier-1.xml`)
    expect(tierSitemapUrl(ORIGIN, 2)).toBe(`${ORIGIN}/sitemaps/tier-2.xml`)
  })

  it('announces exactly the dossier URLs the served child lists, and nothing else', () => {
    const fixture = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${ORIGIN}/d/metformin</loc><lastmod>2026-09-05T00:00:00.000Z</lastmod></url>
  <url><loc>${ORIGIN}/d/rofecoxib</loc></url>
  <url><loc>${ORIGIN}/d/metformin</loc></url>
  <url><loc>${ORIGIN}/browse/type/longevity</loc></url>
  <url><loc>https://elsewhere.example/d/copied</loc></url>
  <url><loc>not a url</loc></url>
</urlset>`

    // Sorted, deduplicated, this origin only, dossiers only: a withheld URL cannot appear because
    // the list is read out of the document the deployment served.
    expect(sitemapSubmissionUrls(fixture, ORIGIN)).toEqual([
      `${ORIGIN}/d/metformin`,
      `${ORIGIN}/d/rofecoxib`,
    ])
  })

  it('finds no URL in a child a deployment serves empty', () => {
    const empty = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`
    expect(sitemapSubmissionUrls(empty, ORIGIN)).toEqual([])
  })
})
