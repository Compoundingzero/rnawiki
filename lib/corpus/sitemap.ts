/**
 * The sitemap index and its four children (R6, docs/specs/browse.md, docs/specs/deployment-plan.md).
 *
 * `/sitemap.xml` is an index; `/sitemaps/tier-1.xml`, `/sitemaps/tier-2.xml`, `/sitemaps/browse.xml`
 * and `/sitemaps/pages.xml` are its children, each capped at the protocol's 50,000 URLs.
 *
 * Two rules decide what may appear:
 *
 *  - A corpus record is listed only where `corpus_pages.indexable` is true, which the load sets to
 *    false for every Tier 3 record and for anything under the Gate 1b present-field threshold. A
 *    Tier 3 page carries `noindex, follow` and is reachable through browse, so it is never
 *    robots-disallowed and never in a sitemap.
 *  - Where a corpus record exists for a slug, that record decides the URL's eligibility. The legacy
 *    publication report is consulted only for slugs the corpus has not loaded, so a slug can never
 *    be advertised by one source while the other withholds it.
 */
import { lastBrowsePage } from '@/lib/browse-pagination'
import {
  CORPUS_FACETS,
  corpusFacetValues,
  loadCorpusFacetRecords,
  FACET_LETTER_SPLIT_THRESHOLD,
  letterBuckets,
  recordsForLetter,
  type CorpusFacetRecord,
} from '@/lib/corpus/facets'
import { PUBLIC_DATASET_IDS } from '@/lib/public-datasets'
import { listDrugs } from '@/lib/queries/drugs'
import { listIndexableContributorProfilesForSitemap } from '@/lib/queries/users'
import {
  loadMedicineSitemapIndexabilityReports,
  SITEMAP_MAX_URLS,
} from '@/lib/seo/publication-indexability'

export const SITEMAP_CHILDREN = ['tier-1', 'tier-2', 'browse', 'pages'] as const
export type SitemapChildName = (typeof SITEMAP_CHILDREN)[number]

export function isSitemapChildName(value: string): value is SitemapChildName {
  return (SITEMAP_CHILDREN as readonly string[]).includes(value)
}

export interface SitemapEntry {
  path: string
  lastModified?: Date
  changeFrequency?: 'daily' | 'weekly' | 'monthly'
  priority?: number
}

const FACET_PAGE_SIZE = 60

// ---------------------------------------------------------------------------
// Children
// ---------------------------------------------------------------------------

/** Indexed corpus records of one deployment tier. Tier 3 is never a child name, so never listed. */
export async function tierSitemapEntries(tier: 1 | 2): Promise<SitemapEntry[]> {
  const records = await loadCorpusFacetRecords()
  return records
    .filter((record) => record.indexable && record.tier === tier)
    .sort((left, right) => left.slug.localeCompare(right.slug, 'en'))
    .map((record) => ({
      path: `/d/${encodeURIComponent(record.slug)}`,
      lastModified: record.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: tier === 1 ? 0.8 : 0.6,
    }))
}

/**
 * Every browse surface: the medicine list's own pages, the five facet indexes, and each facet
 * value's pages. These are the only internal links to most records, so a crawler that never
 * reaches them never follows a link to the corpus.
 */
export async function browseSitemapEntries(): Promise<SitemapEntry[]> {
  const [browseTotal, records] = await Promise.all([
    listDrugs({ limit: 1, offset: 0 }).then((result) => result.total),
    loadCorpusFacetRecords(),
  ])

  const entries: SitemapEntry[] = [
    { path: '/browse', changeFrequency: 'daily', priority: 0.8 },
    ...Array.from({ length: Math.max(0, lastBrowsePage(browseTotal) - 1) }, (_unused, index) => ({
      path: `/browse?page=${index + 2}`,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    })),
  ]

  for (const facet of CORPUS_FACETS) {
    const values = await corpusFacetValues(facet.id)
    if (values.length === 0) continue
    entries.push({ path: `/browse/${facet.id}`, changeFrequency: 'weekly', priority: 0.7 })
    for (const value of values) {
      const base = `/browse/${facet.id}/${encodeURIComponent(value.id)}`
      entries.push({ path: base, changeFrequency: 'weekly', priority: 0.6 })
      if (value.count > FACET_LETTER_SPLIT_THRESHOLD) {
        const inValue = records.filter((record: CorpusFacetRecord) =>
          record.values[facet.id].includes(value.id),
        )
        for (const bucket of letterBuckets(inValue)) {
          const letterBase = `${base}/${encodeURIComponent(bucket.id)}`
          const pages = lastBrowsePage(recordsForLetter(inValue, bucket.id).length)
          for (let page = 1; page <= pages; page += 1) {
            entries.push({
              path: page === 1 ? letterBase : `${letterBase}?page=${page}`,
              changeFrequency: 'weekly',
              priority: 0.5,
            })
          }
        }
        continue
      }
      const pages = Math.max(1, Math.ceil(value.count / FACET_PAGE_SIZE))
      for (let page = 2; page <= pages; page += 1) {
        entries.push({ path: `${base}?page=${page}`, changeFrequency: 'weekly', priority: 0.5 })
      }
    }
  }

  return entries
}

/** The written site: static routes, legacy dossiers the corpus has not replaced, and profiles. */
export async function pagesSitemapEntries(): Promise<SitemapEntry[]> {
  const [reports, contributorProfiles, records] = await Promise.all([
    loadMedicineSitemapIndexabilityReports(),
    listIndexableContributorProfilesForSitemap(),
    loadCorpusFacetRecords(),
  ])

  const corpusSlugs = new Set(records.map((record) => record.slug))

  const staticRoutes: SitemapEntry[] = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/datasets', changeFrequency: 'weekly', priority: 0.7 },
    ...PUBLIC_DATASET_IDS.map((dataset) => ({
      path: `/datasets/${dataset}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    { path: '/how-it-works', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/editorial-policy', changeFrequency: 'monthly', priority: 0.6 },
  ]

  const dossiers: SitemapEntry[] = reports.flatMap((report) => {
    const { decision } = report
    if (!decision.index || !decision.canonicalSlug || !decision.lastPublicContentUpdate) return []
    // A slug the corpus holds is answered by the corpus template, and `corpus_pages.indexable`
    // already decided whether it belongs in `tier-1.xml` or `tier-2.xml`.
    if (corpusSlugs.has(decision.canonicalSlug)) return []
    return [
      {
        path: `/d/${encodeURIComponent(decision.canonicalSlug)}`,
        lastModified: decision.lastPublicContentUpdate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
    ]
  })

  const profiles: SitemapEntry[] = contributorProfiles.map((profile) => ({
    path: `/u/${encodeURIComponent(profile.handle)}`,
    lastModified: profile.lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  }))

  return [...staticRoutes, ...dossiers, ...profiles]
}

export async function sitemapChildEntries(name: SitemapChildName): Promise<SitemapEntry[]> {
  if (name === 'tier-1') return tierSitemapEntries(1)
  if (name === 'tier-2') return tierSitemapEntries(2)
  if (name === 'browse') return browseSitemapEntries()
  return pagesSitemapEntries()
}

/** Which children the index advertises: a child with no URLs is left out rather than served empty. */
export async function populatedSitemapChildren(): Promise<SitemapChildName[]> {
  const records = await loadCorpusFacetRecords()
  const populated: SitemapChildName[] = []
  if (records.some((record) => record.indexable && record.tier === 1)) populated.push('tier-1')
  if (records.some((record) => record.indexable && record.tier === 2)) populated.push('tier-2')
  populated.push('browse', 'pages')
  return populated
}

// ---------------------------------------------------------------------------
// XML
// ---------------------------------------------------------------------------

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** One sitemap file may carry at most 50,000 URLs; the overflow is dropped and logged, never served. */
export function cappedEntries(name: string, entries: SitemapEntry[]): SitemapEntry[] {
  if (entries.length <= SITEMAP_MAX_URLS) return entries
  console.error(
    '[seo.sitemap_over_protocol_limit]',
    JSON.stringify({ sitemap: name, total: entries.length, limit: SITEMAP_MAX_URLS }),
  )
  return entries.slice(0, SITEMAP_MAX_URLS)
}

export function renderUrlset(origin: string, entries: readonly SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(`${origin}${entry.path}`)}</loc>`]
      if (entry.lastModified)
        parts.push(`    <lastmod>${entry.lastModified.toISOString()}</lastmod>`)
      if (entry.changeFrequency) parts.push(`    <changefreq>${entry.changeFrequency}</changefreq>`)
      if (entry.priority !== undefined) parts.push(`    <priority>${entry.priority}</priority>`)
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function renderSitemapIndex(origin: string, children: readonly SitemapChildName[]): string {
  const body = children
    .map(
      (child) =>
        `  <sitemap>\n    <loc>${escapeXml(`${origin}/sitemaps/${child}.xml`)}</loc>\n  </sitemap>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`
}
