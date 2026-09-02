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

describe('dossier discovery surface contract', () => {
  // The behavioral gate lives in tests/unit/seo-metadata.test.ts. This contract pins the wiring:
  // both the meta description and the social-card image must derive from the one shared
  // projection over the same canonical route and default-programme dossier view, instead of the
  // card rebuilding its own answer from a second projection that can drift.
  it('derives the social card from the same projection as the meta description', () => {
    const pageSource = readFileSync(join(process.cwd(), 'app/d/[slug]/page.tsx'), 'utf8')
    const imageSource = readFileSync(
      join(process.cwd(), 'app/d/[slug]/opengraph-image.tsx'),
      'utf8',
    )

    expect(pageSource).toContain('dossierDiscoveryProjection')
    expect(pageSource).toContain('dossierMetadataDescription(input)')

    expect(imageSource).toContain('dossierDiscoveryProjection')
    expect(imageSource).toContain('dossierSocialPreview')
    expect(imageSource).toContain('resolvePublicMedicineRoute')
    expect(imageSource).toContain('getProgrammeEvidenceByMedicineSlug')
    expect(imageSource).toContain('programmeEvidenceMedicineDossierView')
    // The card must not rebuild its answer from the browse/home card projection.
    expect(imageSource).not.toContain('getPublicMedicineProjections')
    expect(imageSource).not.toContain('cardSummary')
  })
})

let requestHost: string | null = 'rnawiki.com'
vi.mock('next/headers', () => ({
  headers: async () => new Headers(requestHost === null ? {} : { host: requestHost }),
}))

describe('browse search metadata', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SEO_DEPLOYMENT_ENV', 'production')
    vi.stubEnv('SITE_URL', 'https://rnawiki.com')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  const INDEXED = {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  }
  const NOT_INDEXED = { index: false, follow: true, googleBot: { index: false, follow: true } }

  it('indexes every page of the unfiltered record list', async () => {
    // Page two onwards lists a different sixty records and carries the only internal link to them.
    // Leaving those pages out of the index left 99% of the corpus with no link a crawler follows.
    for (const [searchParams, canonical] of [
      [{}, '/browse'],
      [{ page: '1' }, '/browse'],
      [{ page: '2' }, '/browse?page=2'],
      [{ page: '165' }, '/browse?page=165'],
    ] as const) {
      const metadata = await browseMetadata({ searchParams: Promise.resolve(searchParams) })
      expect(metadata.alternates, `canonical for ${JSON.stringify(searchParams)}`).toEqual({
        canonical,
      })
      expect(metadata.robots, `robots for ${JSON.stringify(searchParams)}`).toEqual(INDEXED)
    }
  })

  it('keeps filter combinations out of the index and pointing at themselves', async () => {
    // A filtered view re-cuts records that are already listed elsewhere, so it stays unindexed. It
    // still points at itself: saying "do not index me" while naming a different address gives a
    // crawler two conflicting instructions about one URL.
    for (const [searchParams, canonical] of [
      [{ modality: 'Small Molecule' }, '/browse?modality=Small+Molecule'],
      [{ depth: 'flagship', page: '3' }, '/browse?depth=flagship&page=3'],
    ] as const) {
      const metadata = await browseMetadata({ searchParams: Promise.resolve(searchParams) })
      expect(metadata.alternates, `canonical for ${JSON.stringify(searchParams)}`).toEqual({
        canonical,
      })
      expect(metadata.robots, `robots for ${JSON.stringify(searchParams)}`).toEqual(NOT_INDEXED)
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
    requestHost = 'rnawiki.com'
  })

  async function loadRobots() {
    vi.resetModules()
    const { default: robots } = await import('@/app/robots')
    return robots()
  }

  it('blocks every crawler on a hostname that is not the canonical one', async () => {
    // A platform-generated service domain aimed at the same container answers with the same
    // environment variables, so only the request's own Host header can tell the two apart.
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SEO_DEPLOYMENT_ENV', 'production')
    vi.stubEnv('SITE_URL', 'https://rnawiki.com')

    for (const host of [
      'doswiki-production.up.railway.app',
      'rnawiki.com.example.test',
      '',
      null,
    ]) {
      requestHost = host
      expect(await loadRobots(), `host ${JSON.stringify(host)}`).toEqual({
        rules: [{ userAgent: '*', disallow: '/' }],
      })
    }
  })

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
