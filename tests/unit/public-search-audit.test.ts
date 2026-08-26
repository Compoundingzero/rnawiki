import { describe, expect, it } from 'vitest'

import {
  auditPublicSearch,
  isEvidencePagePath,
  parseAuditArguments,
  parsePublicHtml,
  parseRobotsTxt,
  parseSitemapXml,
  type AuditOptions,
} from '@/scripts/quality/audit-public-search'

const ORIGIN = 'https://audit.example'

function htmlPage({
  title = 'Unique title',
  description = 'Unique description',
  canonical = '/',
  robots,
  body = '<h1>Page heading</h1>',
  jsonLd = '{"@context":"https://schema.org","@type":"WebPage"}',
}: {
  title?: string
  description?: string
  canonical?: string | null
  robots?: string
  body?: string
  jsonLd?: string | null
} = {}): string {
  return `<!doctype html><html><head>
    <title>${title}</title>
    <meta name="description" content="${description}">
    ${canonical === null ? '' : `<link rel="canonical" href="${canonical}">`}
    ${robots ? `<meta name="robots" content="${robots}">` : ''}
    ${jsonLd === null ? '' : `<script type="application/ld+json">${jsonLd}</script>`}
  </head><body>${body}</body></html>`
}

function mockFetch(fixtures: Record<string, Response>): typeof fetch {
  return (async (input: string | URL) => {
    const url = new URL(String(input))
    return (
      fixtures[`${url.pathname}${url.search}`] ??
      new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } })
    )
  }) as typeof fetch
}

function options(overrides: Partial<AuditOptions> = {}): AuditOptions {
  return {
    origin: new URL(ORIGIN),
    sitemapPath: '/sitemap.xml',
    maxUrls: 100,
    timeoutMs: 1_000,
    ...overrides,
  }
}

function crawlableRobots(origin = ORIGIN): Response {
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`, {
    status: 200,
    headers: { 'content-type': 'text/plain' },
  })
}

describe('public search audit parsing', () => {
  it('extracts server-rendered search, provenance and review signals', () => {
    const parsed = parsePublicHtml(
      htmlPage({
        title: 'Medicine &amp; evidence',
        description: 'Reviewed evidence summary',
        canonical: '/d/example',
        robots: 'index, follow',
        body: `<main>
          <h1>Medicine evidence</h1>
          <section id="sources"><a data-source-id="snapshot-1" href="https://example.org/source">Source</a></section>
          <p>Last reviewed 24 August 2026</p>
          <a href="/how-it-works">How this works</a>
        </main>`,
      }),
    )

    expect(parsed).toMatchObject({
      title: 'Medicine & evidence',
      description: 'Reviewed evidence summary',
      h1Count: 1,
      canonicals: ['/d/example'],
      noindex: false,
      internalLinkCandidates: ['https://example.org/source', '/how-it-works'],
      invalidJsonLd: [],
      hasVisibleSources: true,
      hasVisibleReviewStatus: true,
    })
  })

  it('reports malformed structured data and unsafe search or structured metadata', () => {
    const malformed = parsePublicHtml(
      htmlPage({
        description: 'Buy online with a dosage protocol',
        jsonLd: '{not-json',
      }),
    )
    expect(malformed.invalidJsonLd[0]).toMatch(/JSON-LD block 1/)
    expect(malformed.unsafeMetadata).toContainEqual({
      field: 'description',
      value: 'Buy online with a dosage protocol',
    })

    const structured = parsePublicHtml(
      htmlPage({
        jsonLd: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'MedicalEntity',
          dosage: 'Do not publish this field',
        }),
      }),
    )
    expect(structured.unsafeMetadata).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: '$jsonld[1].dosage' })]),
    )
  })

  it('parses sitemap indexes and URL sets without a DOM dependency', () => {
    expect(
      parseSitemapXml(
        '<sitemapindex><sitemap><loc>https://audit.example/one.xml</loc></sitemap></sitemapindex>',
      ),
    ).toEqual({ kind: 'index', locations: ['https://audit.example/one.xml'] })
    expect(
      parseSitemapXml(
        '<urlset><url><loc>https://audit.example/</loc></url><url><loc>/how-it-works</loc></url></urlset>',
      ),
    ).toEqual({ kind: 'urlset', locations: ['https://audit.example/', '/how-it-works'] })
  })

  it('parses canonical sitemap advertising and full-crawl search-bot blocks from robots.txt', () => {
    expect(
      parseRobotsTxt(`
        User-agent: GPTBot
        User-agent: OAI-SearchBot
        Disallow: / # exact full-site block

        User-agent: *
        Disallow: /
        Sitemap: https://audit.example/sitemap.xml
      `),
    ).toEqual({
      sitemapLocations: ['https://audit.example/sitemap.xml'],
      crawlBlockingAgents: ['*', 'oai-searchbot'],
    })
  })

  it('detects major crawler blocks and gives an equally specific Allow rule precedence', () => {
    expect(
      parseRobotsTxt(`
        User-agent: Googlebot
        Disallow: /

        User-agent: Bingbot
        Disallow: /
        Allow: /

        User-agent: OAI-SearchBot
        Disallow: /*
      `).crawlBlockingAgents,
    ).toEqual(['googlebot', 'oai-searchbot'])
  })

  it('uses a specific crawler group instead of the wildcard group for that crawler', () => {
    expect(
      parseRobotsTxt(`
        User-agent: *
        Disallow: /

        User-agent: Googlebot
        Allow: /
      `).crawlBlockingAgents,
    ).toEqual(['*'])
  })

  it('limits source and review requirements to public evidence/entity routes', () => {
    expect(isEvidencePagePath('/d/inclisiran')).toBe(true)
    expect(isEvidencePagePath('/d/inclisiran/programme/orion-10')).toBe(true)
    expect(isEvidencePagePath('/t/NCT01234567')).toBe(true)
    expect(isEvidencePagePath('/d/inclisiran/history')).toBe(false)
    expect(isEvidencePagePath('/browse')).toBe(false)
  })
})

describe('public search audit crawl', () => {
  it('finds every required production/search audit failure with actionable URLs', async () => {
    const rootBody = `
      <h1>Home</h1>
      <a href="/alpha">Alpha</a>
      <a href="/hidden">Hidden</a>
      <a href="/omitted">Omitted</a>
      <a href="/broken">Broken</a>
      <a href="/missing">Missing metadata</a>
      <a href="/bad-json">Bad JSON-LD</a>
      <a href="/unsafe">Unsafe metadata</a>
      <a href="/d/no-sources">No provenance</a>
      <a href="/d/unreviewed-stub">Noindex stub</a>
      <a href="/canonical-redirect">Redirecting canonical</a>
      <a href="https://external.example/missing">External links are outside scope</a>
    `
    const fixtures: Record<string, Response> = {
      '/robots.txt': crawlableRobots(),
      '/sitemap.xml': new Response(
        `<urlset>
          <url><loc>${ORIGIN}/</loc></url>
          <url><loc>${ORIGIN}/alpha</loc></url>
          <url><loc>${ORIGIN}/hidden</loc></url>
          <url><loc>${ORIGIN}/canonical-redirect</loc></url>
          <url><loc>${ORIGIN}/sitemap-redirect</loc></url>
        </urlset>`,
        { status: 200, headers: { 'content-type': 'application/xml' } },
      ),
      '/': new Response(
        htmlPage({
          title: 'Duplicate title',
          description: 'Duplicate description',
          body: rootBody,
        }),
        { status: 200, headers: { 'content-type': 'text/html' } },
      ),
      '/alpha': new Response(
        htmlPage({
          title: 'Duplicate title',
          description: 'Duplicate description',
          canonical: '/alpha',
        }),
        { status: 200, headers: { 'content-type': 'text/html' } },
      ),
      '/hidden': new Response(htmlPage({ canonical: '/hidden', robots: 'noindex, follow' }), {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
      '/omitted': new Response(htmlPage({ canonical: '/omitted', title: 'Omitted title' }), {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
      '/missing': new Response(
        htmlPage({ canonical: null, title: 'Missing fields', body: '<main>No heading</main>' }),
        { status: 200, headers: { 'content-type': 'text/html' } },
      ),
      '/bad-json': new Response(
        htmlPage({ canonical: '/bad-json', title: 'Bad JSON', jsonLd: '{bad' }),
        { status: 200, headers: { 'content-type': 'text/html' } },
      ),
      '/unsafe': new Response(
        htmlPage({
          canonical: '/unsafe',
          title: 'Unsafe page',
          description: 'Buy online with a dosage protocol',
        }),
        { status: 200, headers: { 'content-type': 'text/html' } },
      ),
      '/d/no-sources': new Response(
        htmlPage({ canonical: '/d/no-sources', title: 'Evidence without provenance' }),
        { status: 200, headers: { 'content-type': 'text/html' } },
      ),
      '/d/unreviewed-stub': new Response(
        htmlPage({
          canonical: '/d/unreviewed-stub',
          title: 'Stub',
          robots: 'noindex, follow',
        }),
        { status: 200, headers: { 'content-type': 'text/html' } },
      ),
      '/canonical-redirect': new Response(
        htmlPage({ canonical: '/old-canonical', title: 'Canonical redirect test' }),
        { status: 200, headers: { 'content-type': 'text/html' } },
      ),
      '/old-canonical': new Response('', {
        status: 301,
        headers: { location: '/canonical-redirect' },
      }),
      '/sitemap-redirect': new Response('', {
        status: 302,
        headers: { location: '/alpha' },
      }),
      '/broken': new Response('Gone', {
        status: 404,
        headers: { 'content-type': 'text/plain' },
      }),
    }

    const result = await auditPublicSearch(options(), mockFetch(fixtures))
    const codes = new Set(result.issues.map(({ code }) => code))

    expect([...codes]).toEqual(
      expect.arrayContaining([
        'duplicate-title',
        'duplicate-description',
        'missing-h1',
        'missing-canonical',
        'canonical-to-redirect',
        'redirect-url-in-sitemap',
        'indexable-url-omitted-from-sitemap',
        'noindex-url-in-sitemap',
        'broken-internal-link',
        'invalid-json-ld',
        'unsafe-metadata-field',
        'page-without-sources',
        'page-without-review-status',
      ]),
    )
    expect(result.errors).toBeGreaterThan(0)
    expect(
      result.issues.find(
        ({ code, url }) => code === 'broken-internal-link' && url === `${ORIGIN}/broken`,
      )?.detail,
    ).toContain(`linked from ${ORIGIN}/`)
    expect(
      result.issues.find(
        ({ code, url }) => code === 'page-without-sources' && url === `${ORIGIN}/d/unreviewed-stub`,
      )?.severity,
    ).toBe('warning')
  })

  it('returns a clean result for a sourced, reviewed canonical evidence page', async () => {
    const body = `<main>
      <h1>Reviewed medicine evidence</h1>
      <section id="sources"><a data-source-id="snapshot-1" href="https://source.example/paper">Saved source</a></section>
      <p>Last reviewed 24 August 2026</p>
    </main>`
    const fixtures = {
      '/robots.txt': crawlableRobots(),
      '/sitemap.xml': new Response(`<urlset><url><loc>${ORIGIN}/d/reviewed</loc></url></urlset>`, {
        status: 200,
        headers: { 'content-type': 'application/xml' },
      }),
      '/': new Response('', {
        status: 302,
        headers: { location: '/d/reviewed' },
      }),
      '/d/reviewed': new Response(
        htmlPage({
          canonical: '/d/reviewed',
          title: 'Reviewed medicine evidence',
          description: 'Reviewed, source-linked evidence for one medicine use.',
          body,
        }),
        { status: 200, headers: { 'content-type': 'text/html' } },
      ),
    }

    const result = await auditPublicSearch(options(), mockFetch(fixtures))
    expect(result).toMatchObject({ errors: 0, warnings: 0, pagesAudited: 1, sitemapUrls: 1 })
    expect(result.issues).toEqual([])
  })

  it('rejects a wrong-host canonical with the same path without fetching either host as a target', async () => {
    const requested: string[] = []
    const fixtures: Record<string, Response> = {
      '/robots.txt': crawlableRobots(),
      '/sitemap.xml': new Response(`<urlset><url><loc>${ORIGIN}/</loc></url></urlset>`, {
        status: 200,
        headers: { 'content-type': 'application/xml' },
      }),
      '/': new Response(
        htmlPage({
          canonical: 'https://wrong-origin.example/',
          title: 'Wrong canonical origin',
          description: 'A complete page whose canonical uses the wrong origin.',
        }),
        { status: 200, headers: { 'content-type': 'text/html' } },
      ),
    }
    const fetchImplementation = (async (input: string | URL) => {
      const url = new URL(String(input))
      requested.push(url.href)
      if (url.origin !== ORIGIN) throw new Error(`Unexpected cross-origin fetch: ${url.href}`)
      return fixtures[url.pathname] ?? new Response('Not found', { status: 404 })
    }) as typeof fetch

    const result = await auditPublicSearch(options(), fetchImplementation)

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'canonical-origin-mismatch',
          severity: 'error',
          url: `${ORIGIN}/`,
        }),
        expect.objectContaining({ code: 'noncanonical-url-in-sitemap', severity: 'error' }),
      ]),
    )
    expect(requested.filter((url) => url === `${ORIGIN}/`)).toHaveLength(1)
    expect(requested.some((url) => url.startsWith('https://wrong-origin.example'))).toBe(false)
  })

  it('rejects a fragment-bearing canonical instead of treating it as self-canonical', async () => {
    const fixtures: Record<string, Response> = {
      '/robots.txt': crawlableRobots(),
      '/sitemap.xml': new Response(`<urlset><url><loc>${ORIGIN}/</loc></url></urlset>`, {
        status: 200,
        headers: { 'content-type': 'application/xml' },
      }),
      '/': new Response(
        htmlPage({
          canonical: '/#answer',
          title: 'Fragment canonical',
          description: 'A complete page whose canonical incorrectly identifies one fragment.',
        }),
        { status: 200, headers: { 'content-type': 'text/html' } },
      ),
    }

    const result = await auditPublicSearch(options(), mockFetch(fixtures))

    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'canonical-fragment', severity: 'error' }),
        expect.objectContaining({ code: 'noncanonical-url-in-sitemap', severity: 'error' }),
      ]),
    )
  })

  it('fails a production-like origin when robots blocks search crawl or omits its sitemap', async () => {
    const fixtures: Record<string, Response> = {
      '/robots.txt': new Response(
        `User-agent: *\nDisallow: /\nUser-agent: OAI-SearchBot\nDisallow: /\nSitemap: https://wrong.example/sitemap.xml\n`,
        { status: 200, headers: { 'content-type': 'text/plain' } },
      ),
      '/sitemap.xml': new Response(`<urlset><url><loc>${ORIGIN}/</loc></url></urlset>`, {
        status: 200,
        headers: { 'content-type': 'application/xml' },
      }),
      '/': new Response(htmlPage(), {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    }

    const result = await auditPublicSearch(options(), mockFetch(fixtures))
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'robots-blocks-public-crawl', severity: 'error' }),
        expect.objectContaining({
          code: 'robots-missing-canonical-sitemap',
          severity: 'error',
        }),
      ]),
    )
  })

  it('reports the same robots defects as warnings on the loopback development default', async () => {
    const loopbackOrigin = 'http://127.0.0.1:3000'
    const fixtures: Record<string, Response> = {
      '/robots.txt': new Response(`User-agent: *\nDisallow: /\n`, {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      }),
      '/sitemap.xml': new Response(`<urlset><url><loc>${loopbackOrigin}/</loc></url></urlset>`, {
        status: 200,
        headers: { 'content-type': 'application/xml' },
      }),
      '/': new Response(htmlPage(), {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    }

    const result = await auditPublicSearch(
      options({ origin: new URL(loopbackOrigin) }),
      mockFetch(fixtures),
    )
    expect(result.errors).toBe(0)
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'robots-blocks-public-crawl', severity: 'warning' }),
        expect.objectContaining({
          code: 'robots-missing-canonical-sitemap',
          severity: 'warning',
        }),
      ]),
    )
  })
})

describe('public search audit CLI safety', () => {
  it('defaults only to a loopback origin and accepts an explicit deployment origin', () => {
    expect(parseAuditArguments([], {} as NodeJS.ProcessEnv).origin.href).toBe(
      'http://127.0.0.1:3000/',
    )
    expect(parseAuditArguments(['--origin', 'https://rnawiki.com']).origin.href).toBe(
      'https://rnawiki.com/',
    )
  })

  it('rejects origins with credentials or route paths and invalid limits', () => {
    expect(() => parseAuditArguments(['--origin', 'https://user:secret@example.com'])).toThrow(
      /credentials/,
    )
    expect(() => parseAuditArguments(['--origin', 'https://example.com/private'])).toThrow(
      /without a path/,
    )
    expect(() => parseAuditArguments(['--max-urls', '2'])).toThrow(/10 to 10000/)
  })
})
