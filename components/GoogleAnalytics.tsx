'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

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

interface NavigatorWithPrivacySignal extends Navigator {
  globalPrivacyControl?: boolean
}

function storedConsent(): GoogleAnalyticsConsent | null {
  try {
    const value = window.localStorage.getItem(GOOGLE_ANALYTICS_CONSENT_STORAGE_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

function persistConsent(value: GoogleAnalyticsConsent) {
  try {
    window.localStorage.setItem(GOOGLE_ANALYTICS_CONSENT_STORAGE_KEY, value)
  } catch {
    // A blocked storage API must never cause analytics to load without a choice.
  }
}

function privacySignalDeniesAnalytics(): boolean {
  const navigatorWithPrivacy = navigator as NavigatorWithPrivacySignal
  return navigatorWithPrivacy.globalPrivacyControl === true || navigator.doNotTrack === '1'
}

function expireGoogleAnalyticsCookies() {
  const names = document.cookie
    .split(';')
    .map((part) => part.split('=', 1)[0]?.trim() ?? '')
    .filter((name) => /^_ga(?:_|$)/.test(name))

  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.rnawiki.com; SameSite=Lax`
  }
}

function AnalyticsChoice({ onChoose }: { onChoose: (choice: GoogleAnalyticsConsent) => void }) {
  return (
    <section
      aria-label="Analytics choices"
      className="fixed inset-x-3 bottom-3 z-[110] mx-auto max-w-2xl rounded-2xl border border-black/[0.1] bg-white p-4 text-left shadow-[0_16px_50px_rgba(0,0,0,0.16)] sm:bottom-5 sm:flex sm:items-center sm:gap-5 sm:p-5"
    >
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-bold text-[#1D1D1F]">Analytics choices</h2>
        <p className="mt-1 text-xs leading-5 text-[#5C5C61]">
          Allow Google Analytics to count page visits and scrolls. Medicine searches, form entries,
          account details and URL query values are excluded.
        </p>
      </div>
      <div className="mt-3 flex shrink-0 flex-wrap gap-2 sm:mt-0 sm:justify-end">
        <button
          type="button"
          onClick={() => onChoose('denied')}
          className="min-h-11 rounded-full border border-black/[0.12] bg-white px-4 text-xs font-bold text-[#424245] transition hover:bg-[#F5F5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={() => onChoose('granted')}
          className="min-h-11 rounded-full bg-[#0066CC] px-4 text-xs font-bold text-white transition hover:bg-[#0056B3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
        >
          Allow analytics
        </button>
      </div>
    </section>
  )
}

export function AnalyticsPreferencesButton() {
  const measurementId = googleAnalyticsMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
  if (!measurementId) return null

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(GOOGLE_ANALYTICS_PREFERENCES_EVENT))}
      className="text-[#6E6E73] transition hover:text-[#0071E3] hover:underline"
    >
      Analytics choices
    </button>
  )
}

export function GoogleAnalytics({ measurementId }: { measurementId: string | null }) {
  const pathname = usePathname()
  const [consent, setConsent] = useState<GoogleAnalyticsConsent | null>(null)
  const [showChoice, setShowChoice] = useState(false)
  const [tagReady, setTagReady] = useState(false)
  const previousLocation = useRef<string | null>(null)

  useEffect(() => {
    if (!measurementId) return

    const saved = storedConsent()
    if (saved) {
      setConsent(saved)
    } else if (privacySignalDeniesAnalytics()) {
      persistConsent('denied')
      setConsent('denied')
    } else {
      setShowChoice(true)
    }

    const openPreferences = () => setShowChoice(true)
    window.addEventListener(GOOGLE_ANALYTICS_PREFERENCES_EVENT, openPreferences)
    return () => window.removeEventListener(GOOGLE_ANALYTICS_PREFERENCES_EVENT, openPreferences)
  }, [measurementId])

  useEffect(() => {
    if (!measurementId || consent !== 'granted' || !tagReady || !window.gtag) return

    const safePathname = sanitizeAnalyticsPathname(pathname)
    if (!shouldMeasureAnalyticsPath(safePathname)) return

    const pageLocation = `${window.location.origin}${safePathname}`
    const pageReferrer =
      previousLocation.current ??
      sanitizeAnalyticsReferrer(document.referrer, window.location.origin)

    window.gtag('set', {
      page_location: pageLocation,
      page_path: safePathname,
      page_referrer: pageReferrer,
    })
    window.gtag('event', 'page_view', {
      page_title: analyticsPageTitle(safePathname, document.title),
      page_location: pageLocation,
      page_path: safePathname,
      page_referrer: pageReferrer,
    })
    previousLocation.current = pageLocation
  }, [consent, measurementId, pathname, tagReady])

  if (!measurementId) return null

  const choose = (choice: GoogleAnalyticsConsent) => {
    const wasGranted = consent === 'granted'
    persistConsent(choice)
    setConsent(choice)
    setShowChoice(false)

    if (choice === 'denied' && wasGranted) {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
      expireGoogleAnalyticsCookies()
      window.location.reload()
    }
  }

  const escapedMeasurementId = JSON.stringify(measurementId)

  return (
    <>
      {consent === 'granted' ? (
        <>
          <Script id="rnawiki-google-analytics-bootstrap" strategy="afterInteractive">
            {`
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  analytics_storage: 'granted',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
gtag('js', new Date());
gtag('config', ${escapedMeasurementId}, {
  send_page_view: false,
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
  page_location: window.location.origin + window.location.pathname,
  page_referrer: ''
});
            `}
          </Script>
          <Script
            id="rnawiki-google-analytics"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
            strategy="afterInteractive"
            onLoad={() => setTagReady(true)}
          />
        </>
      ) : null}
      {showChoice ? <AnalyticsChoice onChoose={choose} /> : null}
    </>
  )
}
