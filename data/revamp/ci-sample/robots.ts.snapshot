import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

import { configuredSiteOrigin, isCanonicalProductionDeployment } from '@/lib/seo/deployment'
import { isCanonicalRequestHost } from '@/lib/seo/canonical-production-origin.mjs'

// Evaluate deployment variables at request time. A production-mode staging build must not inherit
// the public site's crawl rules merely because Next.js sets NODE_ENV=production.
export const dynamic = 'force-dynamic'

const BLOCK_EVERY_CRAWLER: MetadataRoute.Robots = {
  rules: [{ userAgent: '*', disallow: '/' }],
}

async function requestHost(): Promise<string | null> {
  try {
    return (await headers()).get('host')
  } catch {
    // No request scope, so nothing can be crawling. Fail closed.
    return null
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (!isCanonicalProductionDeployment()) return BLOCK_EVERY_CRAWLER

  // The deployment check above reads environment variables, so it cannot tell one hostname from
  // another. A platform-generated service domain aimed at the same container answers with the same
  // variables and would otherwise serve a second crawlable copy of every URL on the site. Only the
  // canonical hostname gets the public crawl rules.
  if (!isCanonicalRequestHost(await requestHost())) return BLOCK_EVERY_CRAWLER

  const siteOrigin = configuredSiteOrigin()

  const publicContentRule = {
    allow: '/',
    disallow: ['/api/', '/healthz'],
  }

  return {
    rules: [
      { userAgent: '*', ...publicContentRule },
      // ChatGPT search discovery is intentionally allowed to crawl the same public content.
      { userAgent: 'OAI-SearchBot', ...publicContentRule },
      // GPTBot is currently allowed; this separate rule makes that policy explicit and reviewable.
      { userAgent: 'GPTBot', ...publicContentRule },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin,
  }
}
