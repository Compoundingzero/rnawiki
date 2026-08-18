import Link from 'next/link'

// The public reader chrome (search/methodology/updates/corrections nav + footer disclaimer).
// Applies to every route nested under this (public) group — the group segment itself is
// stripped from the URL, so app/(public)/page.tsx is still "/", app/(public)/r/[slug]/page.tsx
// is still "/r/[slug]", etc. /admin and /embed intentionally live outside this group.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
    </>
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
          flexWrap: 'wrap',
          rowGap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-6)',
          gap: 'var(--space-4)',
        }}
      >
        <Link
          href="/"
          style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)', textDecoration: 'none' }}
        >
          RNAwiki
        </Link>
        <nav
          style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: '0.95rem' }}
          aria-label="Primary"
        >
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
