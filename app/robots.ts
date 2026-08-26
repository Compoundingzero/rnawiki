import type { MetadataRoute } from 'next'
import { configuredSiteOrigin, isCanonicalProductionDeployment } from '@/lib/seo/deployment'

// Evaluate deployment variables at request time. A production-mode staging build must not inherit
// the public site's crawl rules merely because Next.js sets NODE_ENV=production.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  if (!isCanonicalProductionDeployment()) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

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
