import type { MetadataRoute } from 'next'

// Same fallback convention as lib/canonical.ts's own SITE_URL.
const SITE_URL = process.env.SITE_URL ?? 'https://rnawiki.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/api/v1/'],
      // /api/v1/** is the public, documented API (docs/api.md) and is explicitly allowed
      // above despite the broader /api/ disallow below — robots.txt matches the longest
      // (most specific) rule, so /api/v1/search still resolves to "allow".
      disallow: ['/admin', '/admin/', '/api', '/api/', '/embed', '/embed/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
