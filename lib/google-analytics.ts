export const GOOGLE_ANALYTICS_CONSENT_STORAGE_KEY = 'rnawiki_analytics_consent_v1'
export const GOOGLE_ANALYTICS_PREFERENCES_EVENT = 'rnawiki:analytics-preferences'

export type GoogleAnalyticsConsent = 'granted' | 'denied'

const GOOGLE_ANALYTICS_ID = /^G-[A-Z0-9]{6,20}$/
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/g

export function googleAnalyticsMeasurementId(value: string | undefined): string | null {
  const candidate = value?.trim() ?? ''
  return GOOGLE_ANALYTICS_ID.test(candidate) ? candidate : null
}

export function sanitizeAnalyticsPathname(value: string): string {
  const withoutQueryOrHash = value.split(/[?#]/, 1)[0]?.replace(CONTROL_CHARACTERS, '') ?? ''
  const pathname = withoutQueryOrHash.startsWith('/') ? withoutQueryOrHash : '/'
  const normalized = pathname.replace(/\/{2,}/g, '/') || '/'

  // Public profile handles are account identifiers. Keep the route cohort without transmitting the
  // handle itself.
  if (/^\/u\/[^/]+(?:\/|$)/.test(normalized)) return '/u/[profile]'

  return normalized
}

export function shouldMeasureAnalyticsPath(pathname: string): boolean {
  return !['/api', '/healthz', '/review-queue', '/_next'].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function sanitizeAnalyticsReferrer(value: string, siteOrigin: string): string {
  if (!value) return ''

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return ''

    const pathname =
      url.origin === siteOrigin ? sanitizeAnalyticsPathname(url.pathname) : url.pathname
    return `${url.origin}${pathname}`
  } catch {
    return ''
  }
}

export function analyticsPageTitle(pathname: string, documentTitle: string): string {
  return pathname === '/u/[profile]' ? 'Contributor profile | RNAWiki' : documentTitle
}
