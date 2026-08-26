import type { Metadata } from 'next'

import { isCanonicalProductionOrigin } from '@/lib/seo/canonical-production-origin.mjs'

export { isCanonicalProductionOrigin } from '@/lib/seo/canonical-production-origin.mjs'

export interface SeoDeploymentEnvironment {
  NODE_ENV?: string
  SITE_URL?: string
  SEO_DEPLOYMENT_ENV?: string
  RAILWAY_ENVIRONMENT_NAME?: string
  VERCEL_ENV?: string
}

export function configuredSiteOrigin(environment: SeoDeploymentEnvironment = process.env): string {
  try {
    return new URL(environment.SITE_URL ?? 'https://rnawiki.com').origin
  } catch {
    return 'https://rnawiki.com'
  }
}

/** Build one absolute same-origin application URL without inheriting a trailing SITE_URL slash. */
export function configuredPublicUrl(
  pathname: `/${string}`,
  environment: SeoDeploymentEnvironment = process.env,
): string {
  const url = new URL(configuredSiteOrigin(environment))
  url.pathname = pathname
  url.search = ''
  url.hash = ''
  return url.toString()
}

/** A missing, malformed, preview, non-HTTPS or differently hosted deployment fails closed. */
export function isCanonicalProductionDeployment(
  environment: SeoDeploymentEnvironment = process.env,
): boolean {
  return isCanonicalProductionOrigin(environment)
}

/** Root metadata guard. Route-level noindex may narrow this but must never broaden staging. */
export function rootRobotsMetadata(
  environment: SeoDeploymentEnvironment = process.env,
): NonNullable<Metadata['robots']> {
  if (!isCanonicalProductionDeployment(environment)) {
    return {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    }
  }

  return {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  }
}

/**
 * Apply one route's narrower decision without allowing nested metadata to broaden a preview build.
 * Next.js replaces nested metadata objects rather than deep-merging them, so every route that sets
 * `robots` must pass through this guard instead of assuming the root object will survive.
 */
export function pageRobotsMetadata(
  decision: { index: boolean; follow: boolean },
  environment: SeoDeploymentEnvironment = process.env,
): NonNullable<Metadata['robots']> {
  if (!isCanonicalProductionDeployment(environment)) return rootRobotsMetadata(environment)

  if (!decision.index) {
    return {
      index: false,
      follow: decision.follow,
      googleBot: { index: false, follow: decision.follow },
    }
  }

  return {
    index: true,
    follow: decision.follow,
    googleBot: {
      index: true,
      follow: decision.follow,
      'max-image-preview': 'large',
    },
  }
}
