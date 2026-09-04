/**
 * The Phase 5 deployment verifier (docs/specs/deployment-plan.md, step 6): what it reads from a
 * served deployment, and what it refuses to call a pass.
 */
import { describe, expect, it } from 'vitest'

import {
  evenSample,
  hasNoindex,
  metaRobots,
  parseArguments,
  robotsDisallows,
  vendorLinks,
  verifyLive,
} from '@/scripts/corpus-20k/deploy/verify-live'

const ORIGIN = 'https://rnawiki.com'

function options(extra: string[] = []) {
  return parseArguments([
    '--base-url',
    ORIGIN,
    '--delay-ms',
    '0',
    '--dispositions',
    'tests/fixtures/does-not-exist.ndjson',
    ...extra,
  ])
}

const INDEX = `<sitemapindex><sitemap><loc>${ORIGIN}/sitemaps/tier-1.xml</loc></sitemap></sitemapindex>`

function urlset(paths: readonly string[]): string {
  return `<urlset>${paths.map((path) => `<url><loc>${ORIGIN}${path}</loc></url>`).join('')}</urlset>`
}

function dossier(body = ''): string {
  return `<html><head><title>x</title></head><body>${body}</body></html>`
}

const ROBOTS_PUBLIC = 'User-agent: *\nAllow: /\nDisallow: /api/\n'
const ROBOTS_BLOCKED = 'User-agent: *\nDisallow: /\n'

function serve(
  pages: Record<string, { body?: string; status?: number; headers?: Record<string, string> }>,
) {
  const requested: string[] = []
  const fetchImpl = (async (input: string | URL) => {
    const url = String(input)
    requested.push(url)
    const page = pages[url]
    if (!page) return new Response('missing', { status: 404 })
    return new Response(page.body ?? '', { status: page.status ?? 200, headers: page.headers })
  }) as never
  return { requested, fetchImpl }
}

describe('reading what a deployment serves', () => {
  it('reads robots for the wildcard group only, and lets Allow win', () => {
    expect(robotsDisallows(ROBOTS_PUBLIC, '/d/').blocked).toBe(false)
    expect(robotsDisallows(ROBOTS_PUBLIC, '/api/').blocked).toBe(true)
    expect(robotsDisallows(ROBOTS_BLOCKED, '/d/').blocked).toBe(true)
    expect(robotsDisallows('User-agent: Bingbot\nDisallow: /d/\n', '/d/').blocked).toBe(false)
  })

  it('reads the last robots meta tag and the noindex directive inside it', () => {
    expect(metaRobots('<meta name="robots" content="noindex, follow">')).toBe('noindex, follow')
    expect(hasNoindex('noindex, follow')).toBe(true)
    expect(hasNoindex('index, follow')).toBe(false)
    expect(hasNoindex(null)).toBe(false)
  })

  it('names a selling host and an affiliate shape, and ignores a register', () => {
    const hits = vendorLinks(
      [
        'https://clinicaltrials.gov/study/NCT01',
        'https://www.amazon.com/dp/B000',
        'https://example.com/thing?utm_medium=affiliate',
        'https://rnawiki.com/d/x',
      ],
      'rnawiki.com',
    )
    expect(hits).toEqual([
      'https://www.amazon.com/dp/B000',
      'https://example.com/thing?utm_medium=affiliate',
    ])
  })

  it('samples evenly and repeatably', () => {
    expect(evenSample([1, 2, 3], 7)).toEqual([1, 2, 3])
    expect(evenSample([1, 2, 3, 4, 5, 6], 3)).toEqual([1, 3, 5])
  })
})

describe('the verifier against a served deployment', () => {
  it('passes every check a correct deployment satisfies', async () => {
    const { fetchImpl } = serve({
      [`${ORIGIN}/sitemap.xml`]: { body: INDEX },
      [`${ORIGIN}/sitemaps/tier-1.xml`]: { body: urlset(['/d/rapamycin']) },
      [`${ORIGIN}/d/rapamycin`]: {
        body: dossier('<a href="https://clinicaltrials.gov/study/NCT01">source</a>'),
      },
      [`${ORIGIN}/browse/type/development`]: { body: dossier('<a href="/d/dev-1">x</a>') },
      [`${ORIGIN}/d/dev-1`]: {
        body: '<html><head><meta name="robots" content="noindex, follow"></head><body></body></html>',
      },
      [`${ORIGIN}/robots.txt`]: { body: ROBOTS_PUBLIC },
    })
    const report = await verifyLive(options(), fetchImpl)
    const byId = Object.fromEntries(report.checks.map((check) => [check.id, check.status]))

    expect(byId['sitemap-index']).toBe('PASS')
    expect(byId['samples-200']).toBe('PASS')
    expect(byId['tier-3-noindex']).toBe('PASS')
    expect(byId['robots-allows-dossiers']).toBe('PASS')
    expect(byId['no-vendor-hosts']).toBe('PASS')
    // Nothing supplied a redirect or a suppressed page, and neither is invented as a pass.
    expect(byId['redirects']).toBe('NOT RUN')
    expect(byId['suppression']).toBe('NOT RUN')
    expect(report.ok).toBe(true)
    expect(report.externalHosts).toEqual(['clinicaltrials.gov'])
  })

  it('fails a Tier 3 record that is indexable or listed in a sitemap', async () => {
    const { fetchImpl } = serve({
      [`${ORIGIN}/sitemap.xml`]: { body: INDEX },
      [`${ORIGIN}/sitemaps/tier-1.xml`]: { body: urlset(['/d/dev-1']) },
      [`${ORIGIN}/d/dev-1`]: { body: dossier() },
      [`${ORIGIN}/robots.txt`]: { body: ROBOTS_PUBLIC },
    })
    const report = await verifyLive(options(['--tier3', '/d/dev-1']), fetchImpl)
    const tier3 = report.checks.find((check) => check.id === 'tier-3-noindex')

    expect(tier3?.status).toBe('FAIL')
    expect(tier3?.failures).toEqual([
      '/d/dev-1 carries no noindex directive',
      '/d/dev-1 appears in a sitemap child',
    ])
    expect(report.ok).toBe(false)
  })

  it('accepts 308 as well as 301 for an old slug, and fails anything else', async () => {
    const { fetchImpl } = serve({
      [`${ORIGIN}/sitemap.xml`]: { body: INDEX },
      [`${ORIGIN}/sitemaps/tier-1.xml`]: { body: urlset(['/d/rapamycin']) },
      [`${ORIGIN}/d/rapamycin`]: { body: dossier() },
      [`${ORIGIN}/robots.txt`]: { body: ROBOTS_PUBLIC },
      [`${ORIGIN}/d/old-308`]: { status: 308, headers: { location: `${ORIGIN}/d/rapamycin` } },
      [`${ORIGIN}/d/old-301`]: { status: 301, headers: { location: `${ORIGIN}/d/rapamycin` } },
      [`${ORIGIN}/d/old-200`]: { body: dossier() },
    })
    const report = await verifyLive(
      options(['--redirect', '/d/old-308', '--redirect', '/d/old-301', '--redirect', '/d/old-200']),
      fetchImpl,
    )
    const redirects = report.checks.find((check) => check.id === 'redirects')

    expect(redirects?.status).toBe('FAIL')
    expect(redirects?.failures).toEqual(['/d/old-200 answered 200'])
  })

  it('fails a suppressed page that renders a seed 1, 2 or 6 block', async () => {
    const { fetchImpl } = serve({
      [`${ORIGIN}/sitemap.xml`]: { body: INDEX },
      [`${ORIGIN}/sitemaps/tier-1.xml`]: { body: urlset(['/d/quarantined']) },
      [`${ORIGIN}/d/quarantined`]: {
        body: dossier(
          '<section data-block="supervision"></section><section data-block="n-of-1"></section>',
        ),
      },
      [`${ORIGIN}/robots.txt`]: { body: ROBOTS_PUBLIC },
    })
    const report = await verifyLive(options(), fetchImpl)
    const suppression = report.checks.find((check) => check.id === 'suppression')

    expect(suppression?.status).toBe('FAIL')
    expect(suppression?.failures).toEqual(['/d/quarantined renders the n-of-1 block'])
  })

  it('reads a site-wide crawler block on a non-canonical host as the rule it is', async () => {
    const { fetchImpl } = serve({
      [`http://localhost:3000/sitemap.xml`]: {
        body: INDEX.replace(/https:\/\/rnawiki\.com/g, 'http://localhost:3000'),
      },
      [`http://localhost:3000/sitemaps/tier-1.xml`]: { body: '<urlset></urlset>' },
      [`http://localhost:3000/robots.txt`]: { body: ROBOTS_BLOCKED },
    })
    const local = parseArguments(['--base-url', 'http://localhost:3000', '--delay-ms', '0'])
    const report = await verifyLive(local, fetchImpl)
    const robots = report.checks.find((check) => check.id === 'robots-allows-dossiers')

    expect(robots?.status).toBe('PASS')
    expect(robots?.detail).toContain('non-canonical deployment')
  })

  it('fails a sitemap child over the 50,000 URL ceiling', async () => {
    const many = Array.from({ length: 50_001 }, (_value, index) => `/d/x${index}`)
    const { fetchImpl } = serve({
      [`${ORIGIN}/sitemap.xml`]: { body: INDEX },
      [`${ORIGIN}/sitemaps/tier-1.xml`]: { body: urlset(many) },
      [`${ORIGIN}/robots.txt`]: { body: ROBOTS_PUBLIC },
    })
    const report = await verifyLive(options(['--samples', '1']), fetchImpl)
    const sitemap = report.checks.find((check) => check.id === 'sitemap-index')

    expect(sitemap?.status).toBe('FAIL')
    expect(sitemap?.failures?.[0]).toContain('over the 50000 ceiling')
  })

  it('counts a check it could not run as a failure under --require-all', async () => {
    const { fetchImpl } = serve({
      [`${ORIGIN}/sitemap.xml`]: { body: INDEX },
      [`${ORIGIN}/sitemaps/tier-1.xml`]: { body: urlset(['/d/rapamycin']) },
      [`${ORIGIN}/d/rapamycin`]: { body: dossier() },
      [`${ORIGIN}/robots.txt`]: { body: ROBOTS_PUBLIC },
    })
    const report = await verifyLive(options(['--require-all']), fetchImpl)
    expect(report.notRun).toBeGreaterThan(0)
    expect(report.ok).toBe(false)
  })
})
