import type { Metadata } from 'next'
import './admin.css'

// Everything under /admin — including the login screen, which sits outside the
// (protected) group — shares one wrapper so app/admin/admin.css loads once and
// every rule in it can stay scoped to .admin. No authorization happens here;
// that lives in app/admin/(protected)/layout.tsx.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin">{children}</div>
}
