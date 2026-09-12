/**
 * Analytics on a plain corpus document, under the same choice the React shell offers.
 *
 * `components/GoogleAnalytics.tsx` is the shell's copy of this behaviour. Both read the same rules
 * from `lib/google-analytics.ts` — the stored-consent key, the measurement-id shape, the path
 * sanitiser and the paths that are never measured — so a reader's choice, the cookie names and the
 * fields sent are one policy with one implementation, and only the DOM differs.
 *
 * No tag is loaded and no cookie is written before a reader has allowed it, and a browser sending
 * Global Privacy Control or Do Not Track is recorded as denied without being asked.
 */
import {
  analyticsPageTitle,
  GOOGLE_ANALYTICS_CONSENT_STORAGE_KEY,
  GOOGLE_ANALYTICS_PREFERENCES_EVENT,
  googleAnalyticsMeasurementId,
  sanitizeAnalyticsPathname,
  sanitizeAnalyticsReferrer,
  shouldMeasureAnalyticsPath,
  type GoogleAnalyticsConsent,
} from '@/lib/google-analytics'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function storedConsent(): GoogleAnalyticsConsent | null {
  try {
    const value = window.localStorage.getItem(GOOGLE_ANALYTICS_CONSENT_STORAGE_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

function persistConsent(value: GoogleAnalyticsConsent): void {
  try {
    window.localStorage.setItem(GOOGLE_ANALYTICS_CONSENT_STORAGE_KEY, value)
  } catch {
    // A blocked storage API must never cause analytics to load without a choice.
  }
}

function privacySignalDenies(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  return nav.globalPrivacyControl === true || navigator.doNotTrack === '1'
}

function expireCookies(): void {
  const names = document.cookie
    .split(';')
    .map((part) => part.split('=', 1)[0]?.trim() ?? '')
    .filter((name) => /^_ga(?:_|$)/.test(name))
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.rnawiki.com; SameSite=Lax`
  }
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function choicePanel(onChoose: (choice: GoogleAnalyticsConsent) => void): HTMLElement {
  const panel = element(
    'section',
    'fixed inset-x-3 bottom-3 z-[110] mx-auto max-w-2xl rounded-2xl border border-black/[0.1] bg-white p-4 text-left shadow-[0_16px_50px_rgba(0,0,0,0.16)] sm:bottom-5 sm:flex sm:items-center sm:gap-5 sm:p-5',
  )
  panel.setAttribute('aria-label', 'Analytics choices')
  const copy = element('div', 'min-w-0 flex-1')
  copy.append(
    element('h2', 'text-sm font-bold text-[#1D1D1F]', 'Analytics choices'),
    element(
      'p',
      'mt-1 text-xs leading-5 text-[#5C5C61]',
      'Allow Google Analytics to count page visits and scrolls. Medicine searches, form entries, account details and URL query values are excluded.',
    ),
  )
  const actions = element('div', 'mt-3 flex shrink-0 flex-wrap gap-2 sm:mt-0 sm:justify-end')
  const deny = element(
    'button',
    'min-h-11 rounded-full border border-black/[0.12] bg-white px-4 text-xs font-bold text-[#424245] transition hover:bg-[#F5F5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]',
    'Not now',
  )
  const allow = element(
    'button',
    'min-h-11 rounded-full bg-[#0066CC] px-4 text-xs font-bold text-white transition hover:bg-[#0056B3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2',
    'Allow analytics',
  )
  deny.type = 'button'
  allow.type = 'button'
  deny.addEventListener('click', () => onChoose('denied'))
  allow.addEventListener('click', () => onChoose('granted'))
  actions.append(deny, allow)
  panel.append(copy, actions)
  return panel
}

function loadTag(measurementId: string): void {
  window.dataLayer = window.dataLayer || []
  const gtag: (...args: unknown[]) => void = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments)
  }
  window.gtag = gtag
  gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  gtag('js', new Date())
  gtag('config', measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: window.location.origin + window.location.pathname,
    page_referrer: '',
  })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  script.addEventListener('load', () => {
    const path = sanitizeAnalyticsPathname(window.location.pathname)
    if (!shouldMeasureAnalyticsPath(path)) return
    const pageLocation = `${window.location.origin}${path}`
    const referrer = sanitizeAnalyticsReferrer(document.referrer, window.location.origin)
    gtag('set', { page_location: pageLocation, page_path: path, page_referrer: referrer })
    gtag('event', 'page_view', {
      page_title: analyticsPageTitle(path, document.title),
      page_location: pageLocation,
      page_path: path,
      page_referrer: referrer,
    })
  })
  document.head.append(script)
}

export function startAnalytics(rawMeasurementId: string | null): void {
  const measurementId = googleAnalyticsMeasurementId(rawMeasurementId ?? undefined)
  if (!measurementId) return

  let panel: HTMLElement | null = null
  const closePanel = (): void => {
    panel?.remove()
    panel = null
  }
  const choose = (choice: GoogleAnalyticsConsent): void => {
    const wasGranted = storedConsent() === 'granted'
    persistConsent(choice)
    closePanel()
    if (choice === 'granted') {
      loadTag(measurementId)
      return
    }
    if (wasGranted) {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
      expireCookies()
      window.location.reload()
    }
  }
  const openPanel = (): void => {
    if (panel) return
    panel = choicePanel(choose)
    document.body.append(panel)
  }

  const saved = storedConsent()
  if (saved === 'granted') loadTag(measurementId)
  else if (saved === null && privacySignalDenies()) persistConsent('denied')
  else if (saved === null) openPanel()

  window.addEventListener(GOOGLE_ANALYTICS_PREFERENCES_EVENT, openPanel)

  /*
   * No control is appended to the footer any more. The consent panel still opens on a first visit,
   * and still opens on the `rnawiki:analytics-preferences` event, which is what /privacy dispatches.
   * Putting the button in the footer of every page made a consent control part of the site's
   * furniture; the right to change the choice is unaffected and now has a page that explains it.
   */
}
