export const CANONICAL_PRODUCTION_ORIGIN: 'https://rnawiki.com'

export interface CanonicalProductionEnvironment {
  NODE_ENV?: string
  SITE_URL?: string
  SEO_DEPLOYMENT_ENV?: string
  RAILWAY_ENVIRONMENT_NAME?: string
  VERCEL_ENV?: string
}

export function isExactCanonicalSiteUrl(siteUrl: string | undefined): boolean
export function isCanonicalProductionOrigin(environment?: CanonicalProductionEnvironment): boolean
