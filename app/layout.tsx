import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

// Self-hosted at build time by next/font. The reference wireframe linked these from
// fonts.googleapis.com; serving them from our own origin keeps `font-src 'self'` in the CSP
// honest and removes a render-blocking third-party round trip.
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

const siteUrl = process.env.SITE_URL ?? 'https://rnawiki.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RNAwiki — Open Drug Evidence Audit Layer',
    template: '%s — RNAwiki',
  },
  description:
    'The open-access drug wiki: plain-English verdicts on any medicine, the real chemical synthesis cost behind the pharmacy price, and evidence-backed alternatives.',
  applicationName: 'RNAwiki',
  openGraph: {
    type: 'website',
    siteName: 'RNAwiki',
    title: 'RNAwiki — Open Drug Evidence Audit Layer',
    description:
      'Records exactly what was measured, what was inferred, what failed, and how conclusions changed.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RNAwiki — Open Drug Evidence Audit Layer',
    description:
      'Records exactly what was measured, what was inferred, what failed, and how conclusions changed.',
  },
  robots: { index: true, follow: true },
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
      </body>
    </html>
  )
}
