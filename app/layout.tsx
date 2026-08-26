import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { googleAnalyticsMeasurementId } from '@/lib/google-analytics'
import { configuredPublicUrl, configuredSiteOrigin, rootRobotsMetadata } from '@/lib/seo/deployment'
import { HOME_METADATA } from '@/lib/seo/metadata'
import './globals.css'

// next/font serves these from the application origin.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const siteOrigin = configuredSiteOrigin()
const analyticsMeasurementId = googleAnalyticsMeasurementId(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
)

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: `${HOME_METADATA.title} | RNAWiki`,
    template: '%s | RNAWiki',
  },
  description: HOME_METADATA.description,
  applicationName: 'RNAWiki',
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'RNAWiki',
    title: `${HOME_METADATA.title} | RNAWiki`,
    description: HOME_METADATA.description,
    url: configuredPublicUrl('/'),
  },
  twitter: {
    card: 'summary_large_image',
    title: `${HOME_METADATA.title} | RNAWiki`,
    description: HOME_METADATA.description,
  },
  robots: rootRobotsMetadata(),
}

export const viewport: Viewport = {
  themeColor: '#F5F5F7',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#F5F5F7] text-[#1D1D1F] antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:text-[#0071E3] focus:shadow-lg"
        >
          Skip to content
        </a>
        {children}
        <GoogleAnalytics measurementId={analyticsMeasurementId} />
      </body>
    </html>
  )
}
