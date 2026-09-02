import { describe, expect, it } from 'vitest'

import {
  auditDossierReachability,
  dossierSlugFromPath,
  parseAuditArguments,
  type ReachabilityOptions,
} from '@/scripts/quality/audit-public-search'

const ORIGIN = 'https://audit.example'

function html(body: string): Response {
  return new Response(
    `<!doctype html><html><head><title>t</title></head><body>${body}</body></html>`,
    {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    },
  )
}

function sitemap(slugs: readonly string[]): Response {
  const urls = slugs.map((slug) => `<url><loc>${ORIGIN}/d/${slug}</loc></url>`).join('')
  return new Response(
    `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { status: 200, headers: { 'content-type': 'application/xml' } },
  )
}

function options(patch: Partial<ReachabilityOptions> = {}): ReachabilityOptions {
  return {
    origin: new URL(ORIGIN),
    sitemapPath: '/sitemap.xml',
    maxUrls: 50,
    timeoutMs: 1_000,
    maxDepth: 6,
    ...patch,
  }
}

describe('canonical dossier reachability audit', () => {
  it('reports the sitemap slugs that no link path from / or /browse reaches', async () => {
    const pages: Record<string, string> = {
      '/': '<a href="/browse">Browse</a>',
      '/browse': '<a href="/d/aspirin">Aspirin</a><a href="/browse?page=2">Next</a>',
      '/browse?page=2': '<a href="/d/ibuprofen">Ibuprofen</a>',
    }
    const result = await auditDossierReachability(options(), async (input) => {
      const url = new URL(String(input))
      if (url.pathname === '/sitemap.xml') return sitemap(['aspirin', 'ibuprofen', 'orphan-record'])
      const body = pages[`${url.pathname}${url.search}`]
      return body === undefined ? new Response('missing', { status: 404 }) : html(body)
    })

    expect(result.sitemapDossierSlugs).toBe(3)
    expect(result.reachableDossierSlugs).toBe(2)
    expect(result.orphanSlugs).toEqual(['orphan-record'])
    expect(result.reachableSlugsMissingFromSitemap).toEqual([])
    expect(result.truncated).toBe(false)
    expect(result.note).toMatch(/orphan only for this crawl bound/)
  })

  it('reports a linked dossier the sitemap omits without calling it an orphan', async () => {
    const result = await auditDossierReachability(options(), async (input) => {
      const url = new URL(String(input))
      if (url.pathname === '/sitemap.xml') return sitemap(['aspirin'])
      if (url.pathname === '/') return html('<a href="/browse">Browse</a>')
      if (url.pathname === '/browse') {
        return html('<a href="/d/aspirin">A</a><a href="/d/unlisted">U</a>')
      }
      return new Response('missing', { status: 404 })
    })

    expect(result.orphanSlugs).toEqual([])
    expect(result.reachableSlugsMissingFromSitemap).toEqual(['unlisted'])
  })

  it('stops at the depth bound and reports the pages beyond it as unreached', async () => {
    const pages: Record<string, string> = {
      '/': '<a href="/browse">Browse</a>',
      '/browse': '<a href="/browse?page=2">Next</a>',
      '/browse?page=2': '<a href="/browse?page=3">Next</a>',
      '/browse?page=3': '<a href="/d/deep-record">Deep</a>',
    }
    const result = await auditDossierReachability(options({ maxDepth: 1 }), async (input) => {
      const url = new URL(String(input))
      if (url.pathname === '/sitemap.xml') return sitemap(['deep-record'])
      const body = pages[`${url.pathname}${url.search}`]
      return body === undefined ? new Response('missing', { status: 404 }) : html(body)
    })

    expect(result.orphanSlugs).toEqual(['deep-record'])
    expect(result.pagesVisited).toBeLessThanOrEqual(3)
  })

  it('reads one canonical dossier segment and refuses anything deeper', () => {
    expect(dossierSlugFromPath('/d/inclisiran')).toBe('inclisiran')
    expect(dossierSlugFromPath('/d/inclisiran/')).toBe('inclisiran')
    expect(dossierSlugFromPath('/d/inclisiran/history')).toBeNull()
    expect(dossierSlugFromPath('/browse')).toBeNull()
  })

  it('parses the orphan-audit mode flags with a bounded depth and a report path', () => {
    const parsed = parseAuditArguments(
      ['--orphan-audit', '--max-depth', '8', '--out', 'docs/audits/discovery/orphan-audit.json'],
      {} as NodeJS.ProcessEnv,
    )
    expect(parsed.orphanAudit).toBe(true)
    expect(parsed.maxDepth).toBe(8)
    expect(parsed.outFile).toBe('docs/audits/discovery/orphan-audit.json')
    expect(parseAuditArguments([], {} as NodeJS.ProcessEnv).orphanAudit).toBe(false)
    expect(() => parseAuditArguments(['--max-depth', '0'])).toThrow(/1 to 100/)
  })
})
