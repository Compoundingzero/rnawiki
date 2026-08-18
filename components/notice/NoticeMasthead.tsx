import Link from 'next/link'

/**
 * One ruled line carrying the wordmark, for the pages that sit outside the reader chrome in
 * `app/(public)/layout.tsx` — the global not-found page and `/gone`. Both are terminal notices
 * reached without a working route, so they carry identity and a way home and nothing else: no
 * nav, no search bar. The body of each page says where to go.
 *
 * It borrows `.site-header` and `.wordmark` from the real header so the two cannot look like
 * different sites.
 */
export function NoticeMasthead() {
  return (
    <header className="site-header">
      <div className="page site-header__inner">
        <Link href="/" className="wordmark">
          RNAwiki
        </Link>
      </div>
    </header>
  )
}
