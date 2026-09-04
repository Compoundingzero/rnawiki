/**
 * The children of the sitemap index: `/sitemaps/tier-1.xml`, `/sitemaps/tier-2.xml`,
 * `/sitemaps/browse.xml` and `/sitemaps/pages.xml`. Any other name is not found, so `tier-3.xml`
 * cannot exist even as an empty document.
 */
import {
  cappedEntries,
  isSitemapChildName,
  renderUrlset,
  sitemapChildEntries,
} from '@/lib/corpus/sitemap'
import { configuredSiteOrigin } from '@/lib/seo/deployment'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CHILD_CACHE_TTL_MS = 15 * 60 * 1000
const cache = new Map<string, { builtAt: number; body: string }>()

/** Next.js 15: route params arrive as a Promise. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
): Promise<Response> {
  const { name: requested } = await params
  const name = requested.endsWith('.xml') ? requested.slice(0, -4) : requested
  if (!isSitemapChildName(name)) {
    // A name outside the four children is not a sitemap. `tier-3` fails here rather than being
    // served as an empty document that a crawler could mistake for a complete answer.
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' },
    })
  }

  const held = cache.get(name)
  let body: string
  if (held && Date.now() - held.builtAt < CHILD_CACHE_TTL_MS) {
    body = held.body
  } else {
    const entries = cappedEntries(name, await sitemapChildEntries(name))
    body = renderUrlset(configuredSiteOrigin(), entries)
    cache.set(name, { builtAt: Date.now(), body })
    console.info('[seo.sitemap_child]', JSON.stringify({ sitemap: name, urls: entries.length }))
  }

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900',
    },
  })
}
