import type { Metadata } from 'next'
import Link from 'next/link'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG">
      <body>
        <a
          href="#main"
          style={{
            position: 'absolute',
            left: -9999,
            top: 0,
          }}
          className="skip-link"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}

function SiteHeader() {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4rem',
          gap: 'var(--space-6)',
        }}
      >
        <Link
          href="/"
          style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)', textDecoration: 'none' }}
        >
          RNAwiki
        </Link>
        <nav style={{ display: 'flex', gap: 'var(--space-6)', fontSize: '0.95rem' }} aria-label="Primary">
          <Link href="/search" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            Search
          </Link>
          <Link href="/methodology" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            Methodology
          </Link>
          <Link href="/updates" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            Evidence Updates
          </Link>
          <Link href="/corrections" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            Corrections
          </Link>
        </nav>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        marginTop: 'var(--space-12)',
        padding: 'var(--space-8) 0',
        color: 'var(--color-text-faint)',
        fontSize: '0.85rem',
      }}
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <p style={{ margin: 0, maxWidth: '44rem' }}>
          RNAwiki explains research evidence. It does not provide medical advice, diagnosis, dosing, or
          instructions for obtaining or using unapproved substances.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Link href="/methodology" style={{ color: 'var(--color-text-faint)' }}>
            Methodology
          </Link>
          <Link href="/privacy" style={{ color: 'var(--color-text-faint)' }}>
            Privacy
          </Link>
          <Link href="/updates" style={{ color: 'var(--color-text-faint)' }}>
            Evidence updates
          </Link>
          <Link href="/corrections" style={{ color: 'var(--color-text-faint)' }}>
            Corrections
          </Link>
          <a href="https://github.com/Compoundingzero/rnawiki" style={{ color: 'var(--color-text-faint)' }}>
            Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
