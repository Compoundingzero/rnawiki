import { describe, expect, it } from 'vitest'

import {
  parseMonitorArguments,
  readDiscoverySignals,
  runWithConcurrency,
  summarizeMonitorRecords,
  type MonitorRecord,
} from '@/scripts/discovery/monitor-discovery'

function record(patch: Partial<MonitorRecord> = {}): MonitorRecord {
  return {
    slug: 'inclisiran',
    url: 'https://rnawiki.com/d/inclisiran',
    checkedAt: '2026-09-01T00:00:00.000Z',
    page: {
      url: 'https://rnawiki.com/d/inclisiran',
      status: 200,
      finalUrl: 'https://rnawiki.com/d/inclisiran',
      robotsMeta: 'index, follow',
      canonical: 'https://rnawiki.com/d/inclisiran',
      hasJsonLd: true,
      xRobotsTag: null,
    },
    api: {
      url: 'https://rnawiki.com/api/drugs/inclisiran',
      status: 200,
      contentType: 'application/json',
    },
    state: 'DISCOVERY_READY',
    blockers: [],
    ...patch,
  }
}

describe('discovery monitor arguments', () => {
  it('defaults to the canonical origin, four slots and a polite delay', () => {
    const options = parseMonitorArguments([])
    expect(options.origin.href).toBe('https://rnawiki.com/')
    expect(options.concurrency).toBe(4)
    expect(options.delayMs).toBe(250)
    expect(options.input).toBeNull()
    expect(options.resume).toBe(false)
  })

  it('accepts an explicit origin, a sitemap input and a bounded run', () => {
    const options = parseMonitorArguments([
      '--origin',
      'http://127.0.0.1:3000',
      '--input',
      './sitemap.xml',
      '--limit',
      '25',
      '--resume',
    ])
    expect(options.origin.href).toBe('http://127.0.0.1:3000/')
    expect(options.input).toBe('./sitemap.xml')
    expect(options.limit).toBe(25)
    expect(options.resume).toBe(true)
  })

  it('rejects credentials, route paths, unknown options and out-of-range slots', () => {
    expect(() => parseMonitorArguments(['--origin', 'https://a:b@example.com'])).toThrow(
      /credentials/,
    )
    expect(() => parseMonitorArguments(['--origin', 'https://example.com/x'])).toThrow(
      /without a path/,
    )
    expect(() => parseMonitorArguments(['--concurrency', '99'])).toThrow(/1 to 8/)
    expect(() => parseMonitorArguments(['--unknown'])).toThrow(/Unknown option/)
  })
})

describe('served discovery signals', () => {
  it('reads the robots directive, the canonical href and the structured-data block', () => {
    const html = `<html><head>
      <meta name="viewport" content="width=device-width">
      <meta name="robots" content="noindex, follow">
      <link rel="preload" href="/x.css">
      <link rel="canonical" href="https://rnawiki.com/d/inclisiran">
      <script type="application/ld+json">{"@type":"Drug"}</script>
    </head><body></body></html>`

    expect(readDiscoverySignals(html)).toEqual({
      robotsMeta: 'noindex, follow',
      canonical: 'https://rnawiki.com/d/inclisiran',
      hasJsonLd: true,
    })
  })

  it('reports absent signals as absent rather than guessing', () => {
    expect(readDiscoverySignals('<html><head></head><body>page</body></html>')).toEqual({
      robotsMeta: null,
      canonical: null,
      hasJsonLd: false,
    })
  })
})

describe('bounded concurrency', () => {
  it('never exceeds the slot count and preserves input order', async () => {
    let active = 0
    let peak = 0
    const results = await runWithConcurrency([1, 2, 3, 4, 5, 6, 7], 3, async (item) => {
      active += 1
      peak = Math.max(peak, active)
      await new Promise((done) => setTimeout(done, 1))
      active -= 1
      return item * 2
    })

    expect(results).toEqual([2, 4, 6, 8, 10, 12, 14])
    expect(peak).toBeLessThanOrEqual(3)
  })

  it('handles an empty list without starting a slot', async () => {
    expect(await runWithConcurrency([], 4, async () => 'never')).toEqual([])
  })
})

describe('monitor summary', () => {
  it('counts readiness and blockers and says what readiness is not', () => {
    const summary = summarizeMonitorRecords(
      'https://rnawiki.com',
      [
        record(),
        record({
          slug: 'other',
          url: 'https://rnawiki.com/d/other',
          state: null,
          blockers: ['noindex_meta', 'no_structured_data'],
          api: { url: 'https://rnawiki.com/api/drugs/other', status: 500, contentType: '' },
        }),
      ],
      {
        startedAt: '2026-09-01T00:00:00.000Z',
        finishedAt: '2026-09-01T00:05:00.000Z',
        sitemapDossierUrls: 9_900,
        resumedFromCheckpoint: 1,
      },
    )

    expect(summary).toMatchObject({
      checked: 2,
      discoveryReady: 1,
      notDiscoveryReady: 1,
      apiAvailable: 1,
      sitemapDossierUrls: 9_900,
      resumedFromCheckpoint: 1,
      blockerCounts: { noindex_meta: 1, no_structured_data: 1 },
    })
    expect(summary.note).toMatch(/not a record of crawling, indexing or citation/)
  })
})
