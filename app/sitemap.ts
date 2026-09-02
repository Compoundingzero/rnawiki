import type { MetadataRoute } from 'next'

import { PUBLIC_DATASET_IDS } from '@/lib/public-datasets'
import { listIndexableContributorProfilesForSitemap } from '@/lib/queries/users'
import {
  loadMedicineSitemapIndexabilityReports,
  SITEMAP_MAX_URLS,
} from '@/lib/seo/publication-indexability'

// Avoid a database lookup during builds, when Railway's private database hostname is unavailable.
export const dynamic = 'force-dynamic'

const configuredSiteUrl = process.env.SITE_URL ?? 'https://rnawiki.com'
const siteOrigin = (() => {
  try {
    return new URL(configuredSiteUrl).origin
  } catch {
    return 'https://rnawiki.com'
  }
})()

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${siteOrigin}/`, changeFrequency: 'daily', priority: 1 },
  { url: `${siteOrigin}/browse`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${siteOrigin}/datasets`, changeFrequency: 'weekly', priority: 0.7 },
  ...PUBLIC_DATASET_IDS.map((dataset) => ({
    url: `${siteOrigin}/datasets/${dataset}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  })),
  { url: `${siteOrigin}/how-it-works`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${siteOrigin}/editorial-policy`, changeFrequency: 'monthly', priority: 0.6 },
]

/**
 * The merged projection reads every canonical record; building it costs several seconds against
 * the full corpus. A crawler fetching the sitemap repeatedly must not pay that each time, and the
 * eligible set changes only when an assessment, publication or profile changes, so one process
 * keeps its last answer for a short window. Correctness never depends on this cache: a cold
 * process rebuilds from the database, and a stale window only delays a new URL by minutes.
 */
const SITEMAP_CACHE_TTL_MS = 15 * 60 * 1000
let cachedSitemap: { builtAt: number; entries: MetadataRoute.Sitemap } | null = null

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (cachedSitemap && Date.now() - cachedSitemap.builtAt < SITEMAP_CACHE_TTL_MS) {
    return cachedSitemap.entries
  }
  const entries = await buildSitemap()
  cachedSitemap = { builtAt: Date.now(), entries }
  return entries
}

async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const [reports, contributorProfiles] = await Promise.all([
    loadMedicineSitemapIndexabilityReports(),
    listIndexableContributorProfilesForSitemap(),
  ])
  const dossiers: MetadataRoute.Sitemap = reports.flatMap((report) => {
    const { decision } = report
    if (!decision.index || !decision.canonicalSlug || !decision.lastPublicContentUpdate) return []
    return [
      {
        url: `${siteOrigin}/d/${decision.canonicalSlug}`,
        lastModified: decision.lastPublicContentUpdate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
    ]
  })
  const profiles: MetadataRoute.Sitemap = contributorProfiles.map((profile) => ({
    url: `${siteOrigin}/u/${encodeURIComponent(profile.handle)}`,
    lastModified: profile.lastModified,
    changeFrequency: 'monthly',
    priority: 0.4,
  }))

  const entries = [...STATIC_ROUTES, ...dossiers, ...profiles]
  console.info(
    '[seo.sitemap_size]',
    JSON.stringify({
      staticRoutes: STATIC_ROUTES.length,
      dossiers: dossiers.length,
      contributorProfiles: profiles.length,
      total: entries.length,
      limit: SITEMAP_MAX_URLS,
    }),
  )
  if (entries.length <= SITEMAP_MAX_URLS) return entries

  // One sitemap file may carry at most 50,000 URLs. Serving more produces an invalid document, so
  // drop the overflow deterministically (dossiers are already slug-ordered) and say so in the log.
  // The fix is to shard the eligible projection, not to raise this bound.
  console.error(
    '[seo.sitemap_over_protocol_limit]',
    JSON.stringify({ total: entries.length, limit: SITEMAP_MAX_URLS }),
  )
  return entries.slice(0, SITEMAP_MAX_URLS)
}
