import Link from 'next/link'
import { Wordmark } from '@/components/brand/Wordmark'

/**
 * A single ruled line carrying the wordmark, for the pages that sit outside the
 * reader chrome in `app/(public)/layout.tsx` — the global not-found page and
 * `/gone`. Both are terminal notices reached without a working route, so they
 * carry identity and a way home, and nothing else: no nav, no search bar. The
 * body of each page lists where to go.
 */
export function NoticeMasthead() {
  return (
    <header className="masthead">
      <div className="wrap masthead__inner">
        <Link href="/" style={{ textDecoration: 'none' }} aria-label="RNAwiki, home">
          <Wordmark />
        </Link>
      </div>
    </header>
  )
}
