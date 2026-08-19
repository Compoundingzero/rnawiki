import type { MetadataRoute } from 'next'
import { listPublishedEntities } from '@/lib/queries/entities'
import { entityUrl } from '@/lib/canonical'

// Same fallback convention as lib/canonical.ts's own SITE_URL (see that file, and
// app/layout.tsx / app/updates/feed.xml/route.ts, which duplicate it the same way).
const SITE_URL = process.env.SITE_URL ?? 'https://rnawiki.com'

// Force dynamic (render per-request) rather than the default static generation. Railway's build
// container has no network path to postgres.railway.internal — that hostname only resolves at
// runtime, inside the deployed service's own network — so any attempt to prerender this route
// at build time (the default for a route with no dynamic segments) fails the deploy outright.
// This applies to every route below that queries the database and has no dynamic segments;
// dynamic routes like /r/[slug] are unaffected since Next never tries to statically render them
// without an explicit generateStaticParams.
export const dynamic = 'force-dynamic'

// Static, always-present routes. Deliberately excludes /admin/**, /api/**, /embed/** (see
// app/robots.ts) and every route the old product served that this rebuild removed — those are
// 410 or 301 in middleware.ts, never listed here. See docs/legacy-removal-map.md.
//
// TWO CORRECTIONS, both of them the list disagreeing with the pages themselves.
//
// `/search` is gone from this list. It sets `robots: { index: false, follow: true }` and serves
// `<meta name="robots" content="noindex, follow">`, so submitting it here asked a crawler to index
// the one page the site asks it not to — contradictory signals from the same site, and a "Submitted
// URL marked noindex" error in Search Console. /embed/** is already excluded for exactly this
// reason.
//
// `/compounds`, `/evidence` and `/licensing` are added. All three return 200 with no robots meta,
// all three are linked from the header or footer of every page, and /compounds is the browse index
// — the crawl path to every record. Nothing excluded them on purpose; they simply were not added
// when they were built.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/compounds', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/evidence', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/methodology', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/updates', priority: 0.6, changeFrequency: 'daily' },
  { path: '/corrections', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/licensing', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedEntities = await listPublishedEntities()

  // `lastModified` for a static route is the newest published entity's updatedAt, not `new Date()`.
  // Stamping "now" on every fetch told crawlers all six pages changed every time the sitemap was
  // read, twice in two seconds, which makes the field carry no information at all. These pages are
  // explainer copy that changes when the corpus does, so the corpus's own newest timestamp is the
  // honest answer; with no published entity yet there is nothing to date and the field is omitted.
  const corpusLastModified = publishedEntities.reduce<Date | undefined>(
    (newest, entity) => (!newest || entity.updatedAt > newest ? entity.updatedAt : newest),
    undefined
  )

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: corpusLastModified,
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
