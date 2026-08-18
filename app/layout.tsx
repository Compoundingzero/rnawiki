import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = process.env.SITE_URL ?? 'https://rnawiki.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RNAwiki — see where the evidence actually ends',
    template: '%s — RNAwiki',
  },
  description:
    'Search a peptide, supplement, emerging medicine, or CRISPR treatment. See what researchers measured, what people infer from it, and what remains unknown.',
  openGraph: {
    siteName: 'RNAwiki',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    types: {
      'application/rss+xml': '/updates/feed.xml',
    },
  },
}

// Deliberately bare — no site chrome here. The public marketing/reading chrome (SiteHeader/
// SiteFooter) lives in app/(public)/layout.tsx and applies only to public reader routes.
// /admin (its own layout) and /embed (intentionally chromeless, meant for third-party iframes)
// both sit outside the (public) route group specifically so they never inherit it — Next.js
// layouts nest and cannot be hidden by a child, so keeping this root shell empty is the only way
// to give those two areas different chrome.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG">
      <body>{children}</body>
    </html>
  )
}
