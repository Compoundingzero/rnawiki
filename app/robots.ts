// robots.txt.
//
// Everything is crawlable except `/api/`, which serves JSON to this site's own client components
// and to anyone who wants the data — it is not secret, it is simply not content, and indexing it
// spends a crawler's budget on payloads that duplicate the pages it already has.
//
// The sitemap list is computed rather than hard-coded because `app/sitemap.ts` shards: it exports
// `generateSitemaps`, so the files live at `/sitemap/0.xml`, `/sitemap/1.xml`, … and a crawler
// finds the ones past the first only if they are named here.

import type { MetadataRoute } from 'next'
import { countDrugs } from '@/lib/queries/drugs'

// Railway's build container cannot resolve `postgres.railway.internal`, and this route reads the
// corpus count. No dynamic segment means prerender candidate, which means a failed production
// build without this line.
export const dynamic = 'force-dynamic'

/**
 * MUST match `DRUG_URLS_PER_SITEMAP` in `app/sitemap.ts`, which is where the shards are actually
 * cut. The two files cannot share a constant: both are Next.js metadata routes, and a metadata
 * route that exports anything Next does not recognise fails the build's own export check. If you
 * change one, change the other in the same commit.
 */
const DRUG_URLS_PER_SITEMAP = 45_000

const siteUrl = process.env.SITE_URL ?? 'https://rnawiki.com'

export default async function robots(): Promise<MetadataRoute.Robots> {
  let total = 0
  try {
    total = await countDrugs()
  } catch (error) {
    // robots.txt is the file that decides whether the site is crawled at all. If the database is
    // unreachable, still serve the rules and point at the first shard, which always exists.
    console.warn('[robots] falling back to a single sitemap: the corpus count failed', error)
  }

  const shardCount = Math.max(1, Math.ceil(total / DRUG_URLS_PER_SITEMAP))
  const sitemaps = Array.from(
    { length: shardCount },
    (_unused, id) => `${siteUrl}/sitemap/${id}.xml`,
  )

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: sitemaps,
    host: siteUrl,
  }
}
