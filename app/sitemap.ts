import type { MetadataRoute } from 'next'
import { listPublishedEntities } from '@/lib/queries/entities'
import { entityUrl } from '@/lib/canonical'

// Same fallback convention as lib/canonical.ts's own SITE_URL (see that file, and
// app/layout.tsx / app/updates/feed.xml/route.ts, which duplicate it the same way).
const SITE_URL = process.env.SITE_URL ?? 'https://rnawiki.com'

// Static, always-present routes. Deliberately excludes /admin/**, /api/**, /embed/** (see
// app/robots.ts) and every route the old product served that this rebuild removed — those are
// 410 or 301 in middleware.ts, never listed here. See docs/legacy-removal-map.md.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/search', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/methodology', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/updates', priority: 0.6, changeFrequency: 'daily' },
  { path: '/corrections', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedEntities = await listPublishedEntities()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const entityEntries: MetadataRoute.Sitemap = publishedEntities.map((entity) => ({
    url: entityUrl(entity.slug),
    lastModified: entity.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticEntries, ...entityEntries]
}
