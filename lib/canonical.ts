const SITE_URL = process.env.SITE_URL ?? 'https://rnawiki.com'

export function entityUrl(slug: string): string {
  return `${SITE_URL}/r/${slug}`
}

export function entityPath(slug: string): string {
  return `/r/${slug}`
}

export function claimAnchorUrl(entitySlug: string, claimSlug: string): string {
  return `${entityUrl(entitySlug)}#claim-${claimSlug}`
}

export function embedUrl(claimId: number): string {
  return `${SITE_URL}/embed/claim/${claimId}`
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length <= 200
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Legacy route -> new route/status mapping, per docs/legacy-removal-map.md.
 * Loaded from the database (legacy_redirects table) at request time by middleware;
 * this pure function is the piece unit tests exercise directly.
 */
export interface LegacyRedirectRule {
  fromPath: string
  toPath: string | null
  statusCode: 301 | 410
}

export function resolveLegacyRedirect(
  path: string,
  rules: LegacyRedirectRule[]
): { statusCode: 301 | 410; location: string | null } | null {
  const rule = rules.find((r) => r.fromPath === path)
  if (!rule) return null
  return { statusCode: rule.statusCode, location: rule.toPath }
}
