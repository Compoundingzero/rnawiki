import type { Metadata } from 'next'
import { NoticeMasthead } from '@/components/notice/NoticeMasthead'
import { NotFoundNotice } from '@/components/notice/NotFoundNotice'

/**
 * The global not-found page: any address that matches no route at all, including ones outside the
 * reader chrome. It renders inside the bare root layout, so it brings its own masthead. A request
 * that lands inside `app/(public)` and calls notFound() is caught earlier, by
 * `app/(public)/not-found.tsx`, and keeps the header and footer.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function GlobalNotFound() {
  return (
    <>
      <NoticeMasthead />
      <main id="main" className="page doc">
        <NotFoundNotice />
      </main>
    </>
  )
}
