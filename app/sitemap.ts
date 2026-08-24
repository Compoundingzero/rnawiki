// The sitemap is sharded below the protocol's 50,000-URL limit. `generateSitemaps` serves shards at
// `/sitemap/<id>.xml`; `app/robots.ts` lists them and carries the matching shard-size constant.

import type { MetadataRoute } from 'next'
import { asc } from 'drizzle-orm'
import { db } from '@/db'
import { drugs } from '@/db/schema'
import { countDrugs, publicMedicineFilter } from '@/lib/queries/drugs'

// Avoid a database lookup during builds, when Railway's private database hostname is unavailable.
export const dynamic = 'force-dynamic'

/**
 * Drug URLs per shard. Below the protocol's 50,000 ceiling with room to spare, so the handful of
 * static routes that ride along in shard 0 cannot push it over, and so a shard stays a reasonable
 * size to generate inside one request.
 *
 * Keep this value equal to `DRUG_URLS_PER_SITEMAP` in `app/robots.ts`. Next.js metadata routes
 * cannot share it through an extra export without failing route validation.
 */
const DRUG_URLS_PER_SITEMAP = 45_000

const siteUrl = process.env.SITE_URL ?? 'https://rnawiki.com'

/** Only shard 0 carries these, so they appear exactly once across the whole sitemap set. */
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${siteUrl}/`, changeFrequency: 'daily', priority: 1 },
  { url: `${siteUrl}/browse`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${siteUrl}/how-it-works`, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${siteUrl}/review-queue`, changeFrequency: 'hourly', priority: 0.4 },
]

export async function generateSitemaps(): Promise<Array<{ id: number }>> {
  let total = 0
  try {
    total = await countDrugs()
  } catch (error) {
    // A database outage should degrade sitemap generation to one shard, not fail the deployment.
    console.warn('[sitemap] falling back to a single shard: the corpus count failed', error)
  }

  const shardCount = Math.max(1, Math.ceil(total / DRUG_URLS_PER_SITEMAP))
  return Array.from({ length: shardCount }, (_unused, id) => ({ id }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const shard = Number.isFinite(id) && id > 0 ? Math.trunc(id) : 0

  // Select only sitemap fields and order by slug so shard boundaries stay stable between requests.
  const rows = await db
    .select({ slug: drugs.slug, updatedAt: drugs.updatedAt })
    .from(drugs)
    .where(publicMedicineFilter)
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
