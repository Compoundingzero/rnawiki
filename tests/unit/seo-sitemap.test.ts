import { afterEach, describe, expect, it, vi } from 'vitest'

import { PUBLIC_DATASET_IDS } from '@/lib/public-datasets'

const loadReports = vi.hoisted(() => vi.fn())
const loadContributorProfiles = vi.hoisted(() => vi.fn())
const listDrugs = vi.hoisted(() => vi.fn())

vi.mock('@/lib/seo/publication-indexability', () => ({
  loadMedicineSitemapIndexabilityReports: loadReports,
  SITEMAP_MAX_URLS: 50_000,
}))
vi.mock('@/lib/queries/users', () => ({
  listIndexableContributorProfilesForSitemap: loadContributorProfiles,
}))
// The sitemap needs the browse list's own record count so it cannot advertise a page number the
// browse route would answer as not found.
vi.mock('@/lib/queries/drugs', () => ({ listDrugs }))
// The sitemap children read the corpus through one module. Mocking it keeps this a unit test and
// keeps the corpus out of the pages child, which is the file these cases are about.
vi.mock('@/lib/corpus/facets', () => ({
  CORPUS_FACETS: [],
  corpusFacetValues: async () => [],
  loadCorpusFacetRecords: async () => [],
  FACET_LETTER_SPLIT_THRESHOLD: 300,
  letterBuckets: () => [],
  recordsForLetter: () => [],
}))

describe('generated sitemap behavior', () => {
  afterEach(() => {
    loadReports.mockReset()
    loadContributorProfiles.mockReset()
    listDrugs.mockReset()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('emits only eligible canonical slugs and uses the publication event as lastmod', async () => {
    vi.stubEnv('SITE_URL', 'https://rnawiki.com/')
    listDrugs.mockResolvedValue({ items: [], total: 3 })
    const publishedAt = new Date('2026-08-20T10:00:00.000Z')
    const contributionAcceptedAt = new Date('2026-08-21T09:00:00.000Z')
    loadContributorProfiles.mockResolvedValue([
      { handle: 'evidence-reviewer', lastModified: contributionAcceptedAt },
    ])
    loadReports.mockResolvedValue([
      {
        medicineId: 'internal-eligible-id',
        medicineName: 'Eligible',
        canonicalSlug: 'eligible-medicine',
        selectedProgrammeId: 'programme-eligible',
        freshness: 'current',
        issues: [],
        decision: {
          index: true,
          follow: true,
          reason: 'indexable_reviewed_publication',
          canonicalSlug: 'eligible-medicine',
          lastPublicContentUpdate: publishedAt,
        },
      },
      {
        medicineId: 'bound-legacy-flagship',
        medicineName: 'Bound legacy flagship',
        canonicalSlug: 'bound-legacy-flagship',
        selectedProgrammeId: null,
        freshness: 'unknown',
        issues: [],
        decision: {
          index: true,
          follow: true,
          reason: 'indexable_provenance_bound_legacy_flagship',
          canonicalSlug: 'bound-legacy-flagship',
          lastPublicContentUpdate: new Date('2026-08-01T00:00:00.000Z'),
        },
      },
      {
        medicineId: 'thin-import',
        medicineName: 'Thin import',
        canonicalSlug: 'thin-import',
        selectedProgrammeId: null,
        freshness: 'unknown',
        issues: [
          {
            code: 'legacy_dossier_not_flagship',
            explanation: 'The record is not a flagship.',
          },
        ],
        decision: {
          index: false,
          follow: true,
          reason: 'legacy_dossier_not_flagship',
          canonicalSlug: 'thin-import',
          lastPublicContentUpdate: null,
        },
      },
      {
        medicineId: 'canonical-record-id',
        medicineName: 'Canonical record',
        canonicalSlug: 'canonical-record',
        selectedProgrammeId: null,
        freshness: 'unknown',
        issues: [],
        decision: {
          index: true,
          follow: true,
          reason: 'indexable_canonical_record',
          canonicalSlug: 'canonical-record',
          lastPublicContentUpdate: new Date('2026-08-22T00:00:00.000Z'),
        },
      },
      {
        medicineId: 'internal-stale-id',
        medicineName: 'Stale',
        canonicalSlug: 'stale-medicine',
        selectedProgrammeId: 'programme-stale',
        freshness: 'stale',
        issues: [
          {
            code: 'public_content_not_current',
            explanation: 'Stored content is stale.',
          },
        ],
        decision: {
          index: false,
          follow: true,
          reason: 'public_content_not_current',
          canonicalSlug: 'stale-medicine',
          lastPublicContentUpdate: null,
        },
      },
    ])

    const { pagesSitemapEntries } = await import('@/lib/corpus/sitemap')
    const entries = (await pagesSitemapEntries()).map((entry) => ({
      ...entry,
      url: `https://rnawiki.com${entry.path}`,
    }))
    const dossierEntries = entries
      .filter((entry) => entry.path.startsWith('/d/'))
      .map(({ path: _path, ...entry }) => entry)

    expect(dossierEntries).toEqual([
      {
        url: 'https://rnawiki.com/d/eligible-medicine',
        lastModified: publishedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: 'https://rnawiki.com/d/bound-legacy-flagship',
        lastModified: new Date('2026-08-01T00:00:00.000Z'),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: 'https://rnawiki.com/d/canonical-record',
        lastModified: new Date('2026-08-22T00:00:00.000Z'),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ])
    expect(dossierEntries.some((entry) => entry.url.endsWith('/thin-import'))).toBe(false)
    expect(entries.map(({ path: _path, ...entry }) => entry)).toContainEqual({
      url: 'https://rnawiki.com/u/evidence-reviewer',
      lastModified: contributionAcceptedAt,
      changeFrequency: 'monthly',
      priority: 0.4,
    })
    expect(
      entries
        .map((entry) => new URL(entry.url).pathname)
        .filter((pathname) => pathname === '/datasets' || pathname.startsWith('/datasets/')),
    ).toEqual([
      '/datasets',
      // One page per declared public dataset, in declaration order and with nothing extra.
      ...PUBLIC_DATASET_IDS.map((dataset) => `/datasets/${dataset}`),
    ])
    // The only query-string URLs are the later pages of the unfiltered record list. Those pages
    // carry the sole internal link to nearly every record, so leaving them out of the sitemap and
    // out of the index left the corpus reachable by sitemap alone.
    expect(entries.filter((entry) => entry.url.includes('?'))).toEqual([])
    expect(entries.some((entry) => /review-queue|history/.test(entry.url))).toBe(false)
    expect(entries.some((entry) => /\/about$|\/corrections$/.test(entry.url))).toBe(false)
  })

  it('emits each medicine once and stays inside the 50,000-URL sitemap protocol limit', async () => {
    vi.stubEnv('SITE_URL', 'https://rnawiki.com')
    listDrugs.mockResolvedValue({ items: [], total: 9_900 })
    loadContributorProfiles.mockResolvedValue([])
    const lastPublicContentUpdate = new Date('2026-08-22T00:00:00.000Z')
    loadReports.mockResolvedValue(
      Array.from({ length: 9_900 }, (_unused, index) => {
        const slug = `medicine-${String(index).padStart(5, '0')}`
        return {
          medicineId: `id-${index}`,
          medicineName: slug,
          canonicalSlug: slug,
          selectedProgrammeId: null,
          freshness: 'unknown',
          issues: [],
          decision: {
            index: true,
            follow: true,
            reason: 'indexable_canonical_record',
            canonicalSlug: slug,
            lastPublicContentUpdate,
          },
        }
      }),
    )

    const { browseSitemapEntries, pagesSitemapEntries } = await import('@/lib/corpus/sitemap')
    const entries = (await pagesSitemapEntries()).map((entry) => ({
      ...entry,
      url: `https://rnawiki.com${entry.path}`,
    }))
    const dossierUrls = entries
      .map((entry) => entry.path)
      .filter((pathname) => pathname.startsWith('/d/'))

    expect(dossierUrls).toHaveLength(9_900)
    expect(new Set(dossierUrls).size).toBe(9_900)
    expect(entries.length).toBeLessThan(50_000)

    // Page two through the last page of the browse list, and no filtered view.
    const browseUrls = (await browseSitemapEntries())
      .map((entry) => `https://rnawiki.com${entry.path}`)
      .filter((url) => url.includes('/browse?'))
    expect(browseUrls).toEqual(
      Array.from(
        { length: 164 },
        (_unused, index) => `https://rnawiki.com/browse?page=${index + 2}`,
      ),
    )
  })

  it('advertises no browse page beyond the one the browse route would serve', async () => {
    vi.stubEnv('SITE_URL', 'https://rnawiki.com')
    loadContributorProfiles.mockResolvedValue([])
    loadReports.mockResolvedValue([])

    for (const [total, expected] of [
      [0, []],
      [1, []],
      [60, []],
      [61, ['https://rnawiki.com/browse?page=2']],
      [180, ['https://rnawiki.com/browse?page=2', 'https://rnawiki.com/browse?page=3']],
    ] as const) {
      listDrugs.mockResolvedValue({ items: [], total })
      vi.resetModules()
      const { browseSitemapEntries } = await import('@/lib/corpus/sitemap')
      const entries = await browseSitemapEntries()
      expect(
        entries
          .map((entry) => `https://rnawiki.com${entry.path}`)
          .filter((url) => url.includes('/browse?')),
        `total ${total}`,
      ).toEqual(expected)
    }
  })
})
