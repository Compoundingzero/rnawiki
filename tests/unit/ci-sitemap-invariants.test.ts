import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  SITEMAP_CHILDREN,
  cappedEntries,
  hubsSitemapEntries,
  populatedSitemapChildren,
  sitemapChildEntries,
  tierSitemapEntries,
  type SitemapEntry,
} from '@/lib/corpus/sitemap'

/**
 * Phase 6.3 (docs/specs/ci-checks.md): the sitemap and noindex invariants, as a required pre-merge
 * check that reads only files this repository carries.
 *
 * Operating Rule 7 of `docs/specs/revamp-2026-09.md` fixes four of them, and each is one case
 * below: Tier 3 is in no sitemap child; the hubs child carries hubs and nothing else, and is
 * advertised only where hubs exist; no child exceeds the protocol's 50,000 URLs; `app/robots.ts` is
 * byte-identical to the snapshot `scripts/revamp/ci_sample.py` committed.
 *
 * The corpus itself is not in CI, so the records come from fixtures. What is under test is the
 * selection code in `lib/corpus/sitemap.ts` — which records it lets through — not the corpus.
 */

const loadReports = vi.hoisted(() => vi.fn())
const loadContributorProfiles = vi.hoisted(() => vi.fn())
const listDrugs = vi.hoisted(() => vi.fn())
const listHubRoutes = vi.hoisted(() => vi.fn())
const countHubs = vi.hoisted(() => vi.fn())
const loadCorpusFacetRecords = vi.hoisted(() => vi.fn())

vi.mock('@/lib/seo/publication-indexability', () => ({
  loadMedicineSitemapIndexabilityReports: loadReports,
  SITEMAP_MAX_URLS: 50_000,
}))
vi.mock('@/lib/queries/users', () => ({
  listIndexableContributorProfilesForSitemap: loadContributorProfiles,
}))
vi.mock('@/lib/queries/drugs', () => ({ listDrugs }))
vi.mock('@/lib/hubs/queries', () => ({ listHubRoutes, countHubs }))
vi.mock('@/lib/corpus/facets', () => ({
  CORPUS_FACETS: [],
  corpusFacetValues: async () => [],
  loadCorpusFacetRecords,
  FACET_LETTER_SPLIT_THRESHOLD: 300,
  letterBuckets: () => [],
  recordsForLetter: () => [],
}))

const REPO_ROOT = path.resolve(__dirname, '..', '..')
const SITEMAP_MAX_URLS = 50_000

interface FixtureRecord {
  key: string
  slug: string
  tier: 1 | 2 | 3
  indexable: boolean
  updatedAt: Date
  values: { [facet: string]: string[] }
}

function record(slug: string, tier: 1 | 2 | 3, indexable: boolean): FixtureRecord {
  return {
    key: `KEY:${slug}`,
    slug,
    tier,
    indexable,
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
    values: {},
  }
}

/**
 * A corpus holding all three tiers, including the case Operating Rule 7 is about: a Tier 3 record
 * whose `indexable` flag is true. The load sets that flag false for every Tier 3 record; the
 * fixture sets it true so the sitemap's own rule is what the case measures, not the loader's.
 */
const RECORDS = [
  record('tier-1-indexable', 1, true),
  record('tier-1-below-threshold', 1, false),
  record('tier-2-indexable', 2, true),
  record('tier-3-stub', 3, false),
  record('tier-3-flagged-indexable', 3, true),
]

function paths(entries: SitemapEntry[]): string[] {
  return entries.map((entry) => entry.path)
}

describe('sitemap and noindex invariants (Operating Rule 7)', () => {
  afterEach(() => {
    loadReports.mockReset()
    loadContributorProfiles.mockReset()
    listDrugs.mockReset()
    listHubRoutes.mockReset()
    countHubs.mockReset()
    loadCorpusFacetRecords.mockReset()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('lists no Tier 3 URL in any sitemap child, and has no Tier 3 child at all', async () => {
    loadCorpusFacetRecords.mockResolvedValue(RECORDS)
    listDrugs.mockResolvedValue({ items: [], total: 1 })
    listHubRoutes.mockResolvedValue([{ type: 'target', slug: 'mtor' }])
    countHubs.mockResolvedValue(1)
    loadContributorProfiles.mockResolvedValue([])
    // A legacy publication for a slug the corpus holds as Tier 3: the pages child must defer to
    // the corpus record, which is the rule that keeps a Tier 3 URL out of this child too.
    loadReports.mockResolvedValue([
      {
        medicineId: 'legacy-tier-3',
        medicineName: 'Legacy tier 3',
        canonicalSlug: 'tier-3-stub',
        selectedProgrammeId: null,
        freshness: 'unknown',
        issues: [],
        decision: {
          index: true,
          follow: true,
          reason: 'indexable_provenance_bound_legacy_flagship',
          canonicalSlug: 'tier-3-stub',
          lastPublicContentUpdate: new Date('2026-08-01T00:00:00.000Z'),
        },
      },
    ])

    expect(SITEMAP_CHILDREN).not.toContain('tier-3')

    const tier3Slugs = RECORDS.filter((row) => row.tier === 3).map((row) => `/d/${row.slug}`)
    for (const child of SITEMAP_CHILDREN) {
      const listed = paths(await sitemapChildEntries(child))
      for (const url of tier3Slugs) {
        expect(listed, `${child}.xml lists ${url}`).not.toContain(url)
      }
    }

    expect(paths(await tierSitemapEntries(1))).toEqual(['/d/tier-1-indexable'])
    expect(paths(await tierSitemapEntries(2))).toEqual(['/d/tier-2-indexable'])
  })

  it('carries hubs and only hubs in the hubs child, and advertises it only where hubs exist', async () => {
    loadCorpusFacetRecords.mockResolvedValue(RECORDS)
    listDrugs.mockResolvedValue({ items: [], total: 1 })
    loadContributorProfiles.mockResolvedValue([])
    loadReports.mockResolvedValue([])
    listHubRoutes.mockResolvedValue([
      { type: 'target', slug: 'mtor' },
      { type: 'pathway', slug: 'autophagy' },
    ])
    countHubs.mockResolvedValue(2)

    const hubs = paths(await hubsSitemapEntries())
    expect(hubs).toEqual(['/h', '/h/target/mtor', '/h/pathway/autophagy'])
    // A hub lists its Tier 3 members; their URLs are not advertised here or anywhere.
    expect(hubs.some((url) => url.startsWith('/d/'))).toBe(false)
    expect(await populatedSitemapChildren()).toContain('hubs')

    listHubRoutes.mockResolvedValue([])
    countHubs.mockResolvedValue(0)
    expect(await hubsSitemapEntries()).toEqual([])
    expect(await populatedSitemapChildren()).not.toContain('hubs')
  })

  it('serves no child beyond the protocol limit of 50,000 URLs, and says so when it caps one', async () => {
    const overflowing = Array.from({ length: SITEMAP_MAX_URLS + 1 }, (_unused, index) => ({
      path: `/d/record-${index}`,
    }))
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})

    const capped = cappedEntries('tier-1', overflowing)
    expect(capped).toHaveLength(SITEMAP_MAX_URLS)
    expect(capped.at(-1)?.path).toBe(`/d/record-${SITEMAP_MAX_URLS - 1}`)
    expect(errors).toHaveBeenCalledWith(
      '[seo.sitemap_over_protocol_limit]',
      JSON.stringify({ sitemap: 'tier-1', total: SITEMAP_MAX_URLS + 1, limit: SITEMAP_MAX_URLS }),
    )

    // At the limit exactly, nothing is dropped and nothing is logged.
    errors.mockClear()
    const atTheLimit = overflowing.slice(0, SITEMAP_MAX_URLS)
    expect(cappedEntries('tier-1', atTheLimit)).toHaveLength(SITEMAP_MAX_URLS)
    expect(errors).not.toHaveBeenCalled()

    loadCorpusFacetRecords.mockResolvedValue(RECORDS)
    listDrugs.mockResolvedValue({ items: [], total: 1 })
    listHubRoutes.mockResolvedValue([{ type: 'target', slug: 'mtor' }])
    countHubs.mockResolvedValue(1)
    loadContributorProfiles.mockResolvedValue([])
    loadReports.mockResolvedValue([])
    for (const child of SITEMAP_CHILDREN) {
      const entries = await sitemapChildEntries(child)
      expect(cappedEntries(child, entries).length, `${child}.xml`).toBeLessThanOrEqual(
        SITEMAP_MAX_URLS,
      )
    }
  })

  it('keeps app/robots.ts byte-identical to the committed snapshot', () => {
    const live = readFileSync(path.join(REPO_ROOT, 'app', 'robots.ts'))
    const snapshot = readFileSync(
      path.join(REPO_ROOT, 'data', 'revamp', 'ci-sample', 'robots.ts.snapshot'),
    )
    expect(
      live.equals(snapshot),
      'app/robots.ts differs from data/revamp/ci-sample/robots.ts.snapshot. Operating Rule 7 ' +
        'holds robots.txt unchanged for this run. If the change is intended, refresh the snapshot ' +
        'with `.venv-corpus/bin/python scripts/revamp/ci_sample.py` and say why in the worklog.',
    ).toBe(true)
  })
})
