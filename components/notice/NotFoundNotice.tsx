import Link from 'next/link'
import { SearchBox } from '@/components/SearchBox'

/**
 * The body of both not-found pages — `app/not-found.tsx` (any unmatched address)
 * and `app/(public)/not-found.tsx` (a record slug that does not resolve). One
 * component so the two cannot drift into saying different things.
 *
 * It states what happened in plain words, offers the search form, and then lists
 * the routes that do exist. No apology, no illustration, no diagnostic detail: a
 * reader who mistyped a slug gains nothing from a status code or a stack trace.
 */
const DESTINATIONS: { href: string; label: string; note: string }[] = [
  { href: '/compounds', label: 'All compounds', note: 'Every published compound record.' },
  { href: '/', label: 'RNAwiki home', note: 'Start from the index.' },
  { href: '/corrections', label: 'Report a broken link', note: 'If a link that used to work now fails, say so.' },
  { href: '/gone', label: 'Removed pages', note: 'Why some addresses from the earlier version were withdrawn.' },
]

export function NotFoundNotice() {
  return (
    <div className="measure">
      <p className="eyebrow">Not found</p>
      <h1 className="h1" style={{ marginBlock: 'var(--s3) var(--s4)' }}>
        Nothing at this address
      </h1>
      <p className="lead measure" style={{ marginBottom: 'var(--s5)' }}>
        No record matches this address. The link may be out of date, or a slug may have been mistyped.
      </p>

      <SearchBox />

      <hr className="rule" />

      <div className="section-head">
        <h2 className="h2">Where to go instead</h2>
      </div>
      <ul className="rows">
        {DESTINATIONS.map((d) => (
          <li key={d.href} className="row">
            <Link href={d.href} className="row__link">
              <div>
                <div className="row__name">{d.label}</div>
                <p className="row__desc">{d.note}</p>
              </div>
              <span className="row__chev" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
