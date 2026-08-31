import { afterEach, describe, expect, it, vi } from 'vitest'

const loadReports = vi.hoisted(() => vi.fn())
const loadContributorProfiles = vi.hoisted(() => vi.fn())

vi.mock('@/lib/seo/publication-indexability', () => ({
  loadMedicineSitemapIndexabilityReports: loadReports,
}))
vi.mock('@/lib/queries/users', () => ({
  listIndexableContributorProfilesForSitemap: loadContributorProfiles,
}))

describe('generated sitemap behavior', () => {
  afterEach(() => {
    loadReports.mockReset()
    loadContributorProfiles.mockReset()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('emits only eligible canonical slugs and uses the publication event as lastmod', async () => {
    vi.stubEnv('SITE_URL', 'https://rnawiki.com/')
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

    const { default: sitemap } = await import('@/app/sitemap')
    const entries = await sitemap()
    const dossierEntries = entries.filter((entry) => new URL(entry.url).pathname.startsWith('/d/'))

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
    ])
    expect(dossierEntries.some((entry) => entry.url.endsWith('/thin-import'))).toBe(false)
    expect(entries).toContainEqual({
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
      '/datasets/enzyme-transporter-negatives',
      '/datasets/source-consensus',
      '/datasets/silence-ledger',
      '/datasets/coverage-ledger',
    ])
    expect(entries.some((entry) => entry.url.includes('?'))).toBe(false)
    expect(entries.some((entry) => /review-queue|history/.test(entry.url))).toBe(false)
    expect(entries.some((entry) => /\/about$|\/corrections$/.test(entry.url))).toBe(false)
  })
})
