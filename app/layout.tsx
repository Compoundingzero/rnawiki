import type { Metadata } from 'next'
import { fontVariables } from './fonts'
import './globals.css'

const SITE_URL = process.env.SITE_URL ?? 'https://rnawiki.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RNAwiki — evidence, mechanisms and uncertainty',
    template: '%s — RNAwiki',
  },
  description:
    'An independent evidence reference for drugs, supplements and experimental compounds: what was measured, what is inferred from it, and what remains unknown.',
  openGraph: { siteName: 'RNAwiki', type: 'website' },
  twitter: { card: 'summary_large_image' },
  alternates: { types: { 'application/rss+xml': '/updates/feed.xml' } },
}

// Deliberately bare. Reader chrome lives in app/(public)/layout.tsx; /admin and
// /embed sit outside that group so they inherit no site furniture.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG" className={fontVariables}>
      <body>{children}</body>
    </html>
  )
}
