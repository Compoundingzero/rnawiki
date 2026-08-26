import type { MetadataRoute } from 'next'

import { listIndexableContributorProfilesForSitemap } from '@/lib/queries/users'
import { loadMedicineSitemapIndexabilityReports } from '@/lib/seo/publication-indexability'

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
  { url: `${siteOrigin}/how-it-works`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${siteOrigin}/editorial-policy`, changeFrequency: 'monthly', priority: 0.6 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  return [...STATIC_ROUTES, ...dossiers, ...profiles]
}
