import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = process.env.SITE_URL ?? 'https://rnawiki.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RNAwiki — see what was actually tested',
    template: '%s — RNAwiki',
  },
  description:
    'Search a medicine, supplement or treatment. RNAwiki shows what researchers measured, what people infer and what is still unknown.',
  openGraph: { siteName: 'RNAwiki', type: 'website' },
  twitter: { card: 'summary_large_image' },
  alternates: { types: { 'application/rss+xml': '/updates/feed.xml' } },
}

// Bare shell. Reader chrome is in app/(public)/layout.tsx; /admin and /embed sit outside that
// group so they inherit none of it.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG">
      <body>{children}</body>
    </html>
  )
}
