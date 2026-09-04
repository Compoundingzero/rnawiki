/**
 * The orphan audit's two additions (docs/specs/browse.md, R12): reading a sitemap index into its
 * children before collecting dossier URLs, and measuring how many clicks each indexed record is
 * from the home page.
 */
import { describe, expect, it } from 'vitest'

import {
  isSitemapIndex,
  measureClickDepth,
  pageLinks,
  parseMonitorArguments,
  readSitemapDossierUrls,
  selectedSitemapChildren,
  sitemapIndexChildren,
  streamSitemapDossierUrls,
  tierSitemapChild,
} from '@/scripts/discovery/monitor-discovery'

const ORIGIN = 'https://rnawiki.com'

const INDEX_XML = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${ORIGIN}/sitemaps/tier-1.xml</loc></sitemap>
  <sitemap><loc>${ORIGIN}/sitemaps/tier-2.xml</loc></sitemap>
  <sitemap><loc>https://elsewhere.example/sitemaps/tier-3.xml</loc></sitemap>
</sitemapindex>`

function urlset(paths: readonly string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${ORIGIN}${path}</loc></url>`).join('\n')}
</urlset>`
}

function options(patch: Partial<ReturnType<typeof parseMonitorArguments>> = {}) {
  return { ...parseMonitorArguments(['--delay-ms', '0']), ...patch }
}

function html(links: readonly string[]): string {
  return `<html><body>${links.map((href) => `<a href="${href}">x</a>`).join('')}</body></html>`
}

function serve(pages: Record<string, string>) {
  const requested: string[] = []
  const fetchImpl = async (input: string | URL) => {
    const url = String(input)
    requested.push(url)
    const body = pages[url]
    if (body === undefined) {
      return new Response('missing', { status: 404 }) as unknown as Response
    }
    return new Response(body, { status: 200 }) as unknown as Response
  }
  return { requested, fetchImpl: fetchImpl as never }
}

describe('following a sitemap index', () => {
  it('tells an index from a urlset and keeps only same-origin children', () => {
    expect(isSitemapIndex(INDEX_XML)).toBe(true)
    expect(isSitemapIndex(urlset(['/d/rapamycin']))).toBe(false)
    expect(sitemapIndexChildren(INDEX_XML, ORIGIN)).toEqual([
      `${ORIGIN}/sitemaps/tier-1.xml`,
      `${ORIGIN}/sitemaps/tier-2.xml`,
    ])
    expect(sitemapIndexChildren(urlset(['/d/rapamycin']), ORIGIN)).toEqual([])
  })

  it('collects the dossier URLs the children list, not the index itself', async () => {
    const { fetchImpl } = serve({
      [`${ORIGIN}/sitemaps/tier-1.xml`]: urlset(['/d/rapamycin', '/browse/class']),
      [`${ORIGIN}/sitemaps/tier-2.xml`]: urlset(['/d/metformin', '/d/rapamycin']),
    })
    const result = await readSitemapDossierUrls(INDEX_XML, options(), fetchImpl)

    expect(result.urls.sort()).toEqual([`${ORIGIN}/d/metformin`, `${ORIGIN}/d/rapamycin`])
    expect(result.documentsRead).toBe(3)
    expect(result.children).toHaveLength(2)
    expect(result.unreadableChildren).toEqual([])
  })

  it('records a child that did not answer instead of passing over it', async () => {
    const { fetchImpl } = serve({
      [`${ORIGIN}/sitemaps/tier-1.xml`]: urlset(['/d/rapamycin']),
    })
    const result = await readSitemapDossierUrls(INDEX_XML, options(), fetchImpl)

    expect(result.urls).toEqual([`${ORIGIN}/d/rapamycin`])
    expect(result.unreadableChildren).toEqual([
      { url: `${ORIGIN}/sitemaps/tier-2.xml`, reason: 'HTTP 404' },
    ])
  })

  it('reads a plain urlset without asking for a child', async () => {
    const { requested, fetchImpl } = serve({})
    const result = await readSitemapDossierUrls(urlset(['/d/rapamycin']), options(), fetchImpl)
    expect(result.urls).toEqual([`${ORIGIN}/d/rapamycin`])
    expect(requested).toEqual([])
  })
})

describe('click depth from the home page', () => {
  it('keeps only same-origin links and drops the fragment', () => {
    const links = pageLinks(
      html(['/browse/class', '#main', 'https://example.com/x', '/d/rapamycin#q1']),
      `${ORIGIN}/`,
      ORIGIN,
    )
    expect(links.sort()).toEqual([`${ORIGIN}/browse/class`, `${ORIGIN}/d/rapamycin`])
  })

  it('counts home to facet index to facet page to record as three clicks', async () => {
    const { fetchImpl } = serve({
      [`${ORIGIN}/`]: html(['/browse/class']),
      [`${ORIGIN}/browse/class`]: html(['/browse/class/atc-c']),
      [`${ORIGIN}/browse/class/atc-c`]: html(['/d/rapamycin']),
    })
    const report = await measureClickDepth([`${ORIGIN}/d/rapamycin`], options(), fetchImpl)

    expect(report.distribution).toEqual({ '3': 1 })
    expect(report.deeperThanThree).toEqual([])
    expect(report.unreachable).toBe(0)
    expect(report.budgetExhausted).toBe(false)
  })

  it('lists a record that takes four clicks and counts one nothing links to', async () => {
    const { fetchImpl } = serve({
      [`${ORIGIN}/`]: html(['/browse/class']),
      [`${ORIGIN}/browse/class`]: html(['/browse/class/atc-c']),
      [`${ORIGIN}/browse/class/atc-c`]: html(['/browse/class/atc-c/m']),
      [`${ORIGIN}/browse/class/atc-c/m`]: html(['/d/metformin']),
    })
    const report = await measureClickDepth(
      [`${ORIGIN}/d/metformin`, `${ORIGIN}/d/orphaned`],
      options(),
      fetchImpl,
    )

    expect(report.distribution).toEqual({ '4': 1 })
    expect(report.deeperThanThree).toEqual([`${ORIGIN}/d/metformin`])
    expect(report.deeperThanThreeTotal).toBe(1)
    expect(report.unreachable).toBe(1)
  })

  it('says so when it ran out of budget rather than calling the rest orphans', async () => {
    const { fetchImpl } = serve({ [`${ORIGIN}/`]: html(['/browse/class']) })
    const report = await measureClickDepth(
      [`${ORIGIN}/d/rapamycin`],
      options({ clickDepthBudget: 1 }),
      fetchImpl,
    )

    expect(report.pagesWalked).toBe(1)
    expect(report.budgetExhausted).toBe(true)
    expect(report.unreachable).toBe(1)
    expect(report.note).toContain('--click-depth-budget')
  })

  it('never walks a machine surface', async () => {
    const { requested, fetchImpl } = serve({
      [`${ORIGIN}/`]: html(['/api/search?q=a', '/sitemap.xml', '/sitemaps/tier-1.xml', '/healthz']),
    })
    await measureClickDepth([], options(), fetchImpl)
    expect(requested).toEqual([`${ORIGIN}/`])
  })
})

describe('reading one child at a time', () => {
  it("hands each child's URLs over as it reads it, and holds no second document", async () => {
    const { fetchImpl, requested } = serve({
      [`${ORIGIN}/sitemaps/tier-1.xml`]: urlset(['/d/rapamycin', '/browse/class']),
      [`${ORIGIN}/sitemaps/tier-2.xml`]: urlset(['/d/metformin']),
    })
    const handed: Array<{ child: string | null; urls: string[] }> = []
    const result = await streamSitemapDossierUrls(
      INDEX_XML,
      options(),
      fetchImpl,
      (urls, child) => {
        // The next child is requested only after this callback returns, so at most one child's URLs
        // are in play at a time.
        handed.push({ child, urls })
        expect(requested).toHaveLength(handed.length)
      },
    )

    expect(handed).toEqual([
      { child: `${ORIGIN}/sitemaps/tier-1.xml`, urls: [`${ORIGIN}/d/rapamycin`] },
      { child: `${ORIGIN}/sitemaps/tier-2.xml`, urls: [`${ORIGIN}/d/metformin`] },
    ])
    expect(result.documentsRead).toBe(3)
  })

  it('scopes the run to one tier when asked, and says so when the index does not name it', async () => {
    expect(parseMonitorArguments([]).tier).toBeNull()
    expect(parseMonitorArguments(['--tier', '2']).tier).toBe(2)
    expect(() => parseMonitorArguments(['--tier', '3'])).toThrow(/1 to 2/)
    expect(tierSitemapChild(ORIGIN, 1)).toBe(`${ORIGIN}/sitemaps/tier-1.xml`)

    expect(selectedSitemapChildren(INDEX_XML, options({ tier: 1 }))).toEqual({
      children: [`${ORIGIN}/sitemaps/tier-1.xml`],
      missing: [],
    })

    const onlyTierTwo = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${ORIGIN}/sitemaps/tier-2.xml</loc></sitemap>
</sitemapindex>`
    expect(selectedSitemapChildren(onlyTierTwo, options({ tier: 1 }))).toEqual({
      children: [],
      missing: [{ url: `${ORIGIN}/sitemaps/tier-1.xml`, reason: 'not named by the sitemap index' }],
    })
  })

  it('reads only the named tier, leaving its siblings unrequested', async () => {
    const { fetchImpl, requested } = serve({
      [`${ORIGIN}/sitemaps/tier-1.xml`]: urlset(['/d/rapamycin']),
      [`${ORIGIN}/sitemaps/tier-2.xml`]: urlset(['/d/metformin']),
    })
    const result = await readSitemapDossierUrls(INDEX_XML, options({ tier: 1 }), fetchImpl)

    expect(result.urls).toEqual([`${ORIGIN}/d/rapamycin`])
    expect(result.children).toEqual([`${ORIGIN}/sitemaps/tier-1.xml`])
    expect(requested).toEqual([`${ORIGIN}/sitemaps/tier-1.xml`])
  })
})
