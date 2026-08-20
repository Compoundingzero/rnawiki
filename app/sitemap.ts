// The sitemap, sharded.
//
// THE ARITHMETIC, DONE RATHER THAN ASSUMED. The sitemap protocol caps one file at 50,000 URLs, and
// Next.js enforces the same limit. This corpus is not six records: it is every FDA-registered
// active moiety plus every NIH-listed supplement ingredient, it is built by a bulk ingest that
// grows every time it runs, and "8,000 fits comfortably" is a statement with a shelf life. So the
// shard count is computed from a real `count(*)` on every request and the file is written to shard
// correctly the first time it needs to, instead of silently truncating the corpus at 50,000 the
// day it crosses that line.
//
// Exporting `generateSitemaps` means the sitemaps are served at `/sitemap/0.xml`,
// `/sitemap/1.xml`, … rather than at `/sitemap.xml`. `app/robots.ts` lists every shard, which is
// how a crawler finds them all — see the matching constant there.

import type { MetadataRoute } from 'next'
import { asc } from 'drizzle-orm'
import { db } from '@/db'
import { drugs } from '@/db/schema'
import { countDrugs } from '@/lib/queries/drugs'

// Railway's build container cannot resolve `postgres.railway.internal`. This route has no dynamic
// segment, so without this it is a prerender candidate and the production build fails here while
// passing locally.
export const dynamic = 'force-dynamic'

/**
 * Drug URLs per shard. Below the protocol's 50,000 ceiling with room to spare, so the handful of
 * static routes that ride along in shard 0 cannot push it over, and so a shard stays a reasonable
 * size to generate inside one request.
 *
 * MUST match `DRUG_URLS_PER_SITEMAP` in `app/robots.ts`. The two files cannot share a constant:
 * both are Next.js metadata routes, and a metadata route that exports anything Next does not
 * recognise fails the build's own export check.
 */
const DRUG_URLS_PER_SITEMAP = 45_000

const siteUrl = process.env.SITE_URL ?? 'https://rnawiki.com'

/** Only shard 0 carries these, so they appear exactly once across the whole sitemap set. */
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1 },
  { url: `${siteUrl}/browse`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${siteUrl}/how-editing-works`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${siteUrl}/methodology`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${siteUrl}/review-queue`, changeFrequency: 'hourly', priority: 0.4 },
]

export async function generateSitemaps(): Promise<Array<{ id: number }>> {
  let total = 0
  try {
    total = await countDrugs()
  } catch (error) {
    // If Next.js ever evaluates this during the build rather than at request time, the database is
    // unreachable and the count throws. A missing sitemap is a bad day for search traffic; a
    // failed deploy is a bad day for everyone, so this degrades to one shard rather than throwing.
    console.warn('[sitemap] falling back to a single shard: the corpus count failed', error)
  }

  const shardCount = Math.max(1, Math.ceil(total / DRUG_URLS_PER_SITEMAP))
  return Array.from({ length: shardCount }, (_unused, id) => ({ id }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const shard = Number.isFinite(id) && id > 0 ? Math.trunc(id) : 0

  // A lean, explicit projection rather than `listDrugs`: that helper returns whole dossiers and
  // caps a page at 100 rows, which is the right shape for a browse card and entirely the wrong one
  // for 45,000 URLs. Ordered by slug so the shard boundaries are stable between requests — an
  // unordered window would let a record fall between two shards and vanish from the sitemap.
  const rows = await db
    .select({ slug: drugs.slug, updatedAt: drugs.updatedAt })
    .from(drugs)
    .orderBy(asc(drugs.slug))
    .limit(DRUG_URLS_PER_SITEMAP)
    .offset(shard * DRUG_URLS_PER_SITEMAP)

  const dossiers: MetadataRoute.Sitemap = rows.map((row) => ({
    url: `${siteUrl}/d/${row.slug}`,
    lastModified: row.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return shard === 0 ? [...STATIC_ROUTES, ...dossiers] : dossiers
}
