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
/**
 * Whether a request arrived on the canonical hostname.
 *
 * The predicate below reads environment variables only, so it cannot tell one hostname from
 * another: a platform-generated service domain pointed at the same container passes it and serves
 * a second crawlable copy of every URL. This compares the request's own Host header instead. An
 * absent, malformed or different host fails closed.
 *
 * @param {string | null | undefined} host The request Host header.
 * @param {{SITE_URL?: string}} [environment]
 */
export function isCanonicalRequestHost(host, environment = process.env) {
  if (typeof host !== 'string' || host.trim() === '') return false
  try {
    return (
      new URL(environment.SITE_URL ?? CANONICAL_PRODUCTION_ORIGIN).host ===
      host.trim().toLowerCase()
    )
  } catch {
    return false
  }
}

export function isCanonicalProductionOrigin(environment = process.env) {
  return (
    environment.NODE_ENV === 'production' &&
    deploymentMarker(environment) === 'production' &&
    isExactCanonicalSiteUrl(environment.SITE_URL)
  )
}
