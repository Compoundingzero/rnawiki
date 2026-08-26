import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { generateMetadata as browseMetadata } from '@/app/browse/page'

describe('sitemap discovery contract', () => {
  it('uses one shared publication report rather than rebuilding route-level eligibility', () => {
    const sitemapSource = readFileSync(join(process.cwd(), 'app/sitemap.ts'), 'utf8')
    const projectionSource = readFileSync(
      join(process.cwd(), 'lib/seo/publication-indexability.ts'),
      'utf8',
    )

    expect(sitemapSource).toContain('loadMedicineSitemapIndexabilityReports')
    expect(sitemapSource).not.toContain('drugs.updatedAt')
    expect(sitemapSource).not.toContain('/review-queue')
    expect(sitemapSource).not.toContain('/history')
    expect(sitemapSource).not.toContain('?programme=')
    expect(projectionSource).toContain('programmeCurrentPublications.publishedAt')
    expect(projectionSource).toContain('programmeFreshnessStates.freshnessStatus')
    expect(projectionSource).toContain('programmeVerdictReviews.isIndependent} = true')
    expect(projectionSource).not.toContain("programmeVerdictReviews.decision} = 'APPROVE'")
    expect(projectionSource).toContain("eq(drugs.dossierDepth, 'flagship')")
    expect(projectionSource).not.toContain("eq(drugs.dossierDepth, 'curated')")
  })

  it('keeps an unpublished programme from replacing the reviewed default dossier answer', () => {
    const source = readFileSync(join(process.cwd(), 'lib/queries/programme-evidence.ts'), 'utf8')

    expect(source).toContain('publishedAt} desc nulls last')
  })
})

describe('browse search metadata', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SEO_DEPLOYMENT_ENV', 'production')
    vi.stubEnv('SITE_URL', 'https://rnawiki.com')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('indexes only the unfiltered canonical first page', async () => {
    const canonical = await browseMetadata({ searchParams: Promise.resolve({}) })
    expect(canonical.alternates).toEqual({ canonical: '/browse' })
    expect(canonical.robots).toEqual({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    })

    for (const searchParams of [{ modality: 'Small Molecule' }, { page: '1' }, { page: '2' }]) {
      const variant = await browseMetadata({ searchParams: Promise.resolve(searchParams) })
      expect(variant.alternates).toEqual({ canonical: '/browse' })
      expect(variant.robots).toEqual({
        index: false,
        follow: true,
        googleBot: { index: false, follow: true },
      })
    }
  })

  it('cannot broaden a staging deployment through nested page metadata', async () => {
    vi.stubEnv('SEO_DEPLOYMENT_ENV', 'staging')

    const metadata = await browseMetadata({ searchParams: Promise.resolve({}) })
    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    })
  })

  it.each([
    ['unknown key', { campaign: 'x' }],
    ['unknown value', { modality: 'magic' }],
    ['duplicate key', { modality: ['Small Molecule', 'Small Molecule'] }],
    ['empty filter', { depth: '' }],
    ['empty page', { page: '' }],
    ['invalid page', { page: '2junk' }],
  ])('rejects an %s instead of creating another crawlable result', async (_label, searchParams) => {
    await expect(browseMetadata({ searchParams: Promise.resolve(searchParams) })).rejects.toThrow()
  })
})

describe('robots deployment boundary', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  async function loadRobots() {
    vi.resetModules()
    const { default: robots } = await import('@/app/robots')
    return robots()
  }

  it('blocks every crawler outside the canonical production deployment', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SEO_DEPLOYMENT_ENV', 'staging')
    vi.stubEnv('SITE_URL', 'https://preview.example.test')

    expect(await loadRobots()).toEqual({ rules: [{ userAgent: '*', disallow: '/' }] })
  })

  it('fails closed when a production build has no explicit deployment marker', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SEO_DEPLOYMENT_ENV', '')
    vi.stubEnv('RAILWAY_ENVIRONMENT_NAME', '')
    vi.stubEnv('VERCEL_ENV', '')
    vi.stubEnv('SITE_URL', 'https://rnawiki.com')

    expect(await loadRobots()).toEqual({ rules: [{ userAgent: '*', disallow: '/' }] })
  })

  it('explicitly allows search and GPT crawlers on canonical production content', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SEO_DEPLOYMENT_ENV', 'production')
    vi.stubEnv('SITE_URL', 'https://rnawiki.com')

    expect(await loadRobots()).toEqual({
      rules: [
        { userAgent: '*', allow: '/', disallow: ['/api/', '/healthz'] },
        { userAgent: 'OAI-SearchBot', allow: '/', disallow: ['/api/', '/healthz'] },
        { userAgent: 'GPTBot', allow: '/', disallow: ['/api/', '/healthz'] },
      ],
      sitemap: 'https://rnawiki.com/sitemap.xml',
      host: 'https://rnawiki.com',
    })
  })
})
