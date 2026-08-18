import type { Metadata } from 'next'
import { NotFoundNotice } from '@/components/notice/NotFoundNotice'

/**
 * Not-found inside the reader chrome. This is what a reader sees when a page in this group calls
 * notFound() — most often `/r/<slug>` for a slug that is not published — so the header and footer
 * from the group layout stay in place and the reader never loses the site.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function PublicNotFound() {
  return (
    <div className="page doc">
      <NotFoundNotice />
    </div>
  )
}
