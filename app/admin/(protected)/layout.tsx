import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireUser, AuthError } from '@/lib/auth'

export const metadata: Metadata = { robots: { index: false, follow: false } }

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/entities', label: 'Entities' },
  { href: '/admin/claims', label: 'Claims' },
  { href: '/admin/evidence', label: 'Evidence sources' },
  { href: '/admin/review-queue', label: 'Review queue' },
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
    <>
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>
      <header className="admin-bar">
        <div className="admin-bar__inner">
          <Link href="/admin" className="admin-bar__mark">
            RNAwiki · Editorial
          </Link>
          <nav aria-label="Admin" className="admin-nav">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="admin-bar__who">
            <span>
              {user.name} · {ROLE_LABELS[user.role] ?? user.role}
            </span>
            <form action="/api/admin/logout" method="POST">
              <button type="submit" className="btn">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="admin-main">{children}</main>
    </>
  )
}
