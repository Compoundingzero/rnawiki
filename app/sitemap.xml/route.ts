/**
 * `/sitemap.xml` — a sitemap index, not a list of URLs (R6).
 *
 * The corpus is larger than one sitemap file may carry, so the index points at four children and
 * each child stays inside the protocol's 50,000-URL limit. Tier 3 records are not a child and are
 * in no child: they carry `noindex, follow`, stay reachable through browse, and are never
 * robots-disallowed.
 */
import { configuredSiteOrigin } from '@/lib/seo/deployment'
import { populatedSitemapChildren, renderSitemapIndex } from '@/lib/corpus/sitemap'

// Railway's build container cannot resolve the private database host, and this route reads it.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * The index changes only when a tier is loaded, and a crawler may re-fetch it often. One process
 * keeps its last answer for a short window; a cold process rebuilds it from the database.
 */
const INDEX_CACHE_TTL_MS = 15 * 60 * 1000
let cached: { builtAt: number; body: string } | null = null

export async function GET(): Promise<Response> {
  if (!cached || Date.now() - cached.builtAt >= INDEX_CACHE_TTL_MS) {
    const children = await populatedSitemapChildren()
    cached = { builtAt: Date.now(), body: renderSitemapIndex(configuredSiteOrigin(), children) }
    console.info('[seo.sitemap_index]', JSON.stringify({ children }))
  }
  return new Response(cached.body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900',
    },
  })
}
