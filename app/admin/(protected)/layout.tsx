import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireUser, AuthError } from '@/lib/auth'

export const metadata: Metadata = { robots: { index: false, follow: false } }

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/entities', label: 'Entities' },
  { href: '/admin/claims', label: 'Claims' },
  { href: '/admin/evidence', label: 'Evidence Sources' },
  { href: '/admin/review-queue', label: 'Review Queue' },
  { href: '/admin/corrections', label: 'Corrections' },
]

const ROLE_LABELS: Record<string, string> = {
  administrator: 'Administrator',
  editor: 'Editor',
  scientific_reviewer: 'Scientific reviewer',
}

// This layout wraps every authenticated /admin/** screen. Login lives at app/admin/login/page.tsx,
// a sibling outside this (protected) route group — putting the requireUser() redirect here too
// would make /admin/login redirect to itself in a loop, since a layout's redirect() runs before
// any of its children (including the login page) ever render.
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  let user
  try {
    user = await requireUser()
  } catch (err) {
    if (err instanceof AuthError) {
      redirect('/admin/login')
    }
    throw err
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
        }}
      >
        <div
          style={{
            maxWidth: '72rem',
            margin: '0 auto',
            padding: '0 var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            height: '3.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
            <Link
              href="/admin"
              style={{ fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none', fontSize: '1rem' }}
            >
              RNAwiki Admin
            </Link>
            <nav aria-label="Admin" style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '0.88rem' }}>
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>
              {user.name} · {ROLE_LABELS[user.role] ?? user.role}
            </span>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                style={{
                  border: '1px solid var(--color-border-strong)',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.3em 0.7em',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  color: 'var(--color-text)',
                }}
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
