export const CANONICAL_PRODUCTION_ORIGIN = 'https://rnawiki.com'

/**
 * Return the explicit deployment marker used by Railway, Vercel, or an operator override.
 * An explicitly present empty override stays empty instead of silently falling through.
 *
 * @param {{SEO_DEPLOYMENT_ENV?: string, RAILWAY_ENVIRONMENT_NAME?: string, VERCEL_ENV?: string}} environment
 */
function deploymentMarker(environment) {
  return (
    environment.SEO_DEPLOYMENT_ENV ??
    environment.RAILWAY_ENVIRONMENT_NAME ??
    environment.VERCEL_ENV ??
    ''
  )
    .trim()
    .toLowerCase()
}

/**
 * The URL parser's optional root slash is the only equivalent spelling. Every other raw spelling
 * fails closed, including credentials, an explicit port (even 443), non-root path, query, hash,
 * whitespace, case variants, and malformed URLs.
 *
 * @param {string | undefined} siteUrl
 */
export function isExactCanonicalSiteUrl(siteUrl) {
  return siteUrl === CANONICAL_PRODUCTION_ORIGIN || siteUrl === `${CANONICAL_PRODUCTION_ORIGIN}/`
}

/**
 * One shared crawler/indexing predicate for runtime metadata and build-time response headers.
 * `SITE_URL` is mandatory; there is deliberately no production fallback.
 *
 * @param {{NODE_ENV?: string, SITE_URL?: string, SEO_DEPLOYMENT_ENV?: string, RAILWAY_ENVIRONMENT_NAME?: string, VERCEL_ENV?: string}} [environment]
 */
export function isCanonicalProductionOrigin(environment = process.env) {
  return (
    environment.NODE_ENV === 'production' &&
    deploymentMarker(environment) === 'production' &&
    isExactCanonicalSiteUrl(environment.SITE_URL)
  )
}
