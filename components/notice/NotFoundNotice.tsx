import Link from 'next/link'
import { NOT_FOUND_BODY, NOT_FOUND_SEARCH_LABEL, NOT_FOUND_TITLE } from '@/lib/notice-copy'

/**
 * The body of both not-found pages — `app/not-found.tsx` (any unmatched address) and
 * `app/(public)/not-found.tsx` (a record slug that does not resolve). One component so the two
 * cannot drift into saying different things.
 *
 * It states what happened, offers the search form, and points at the two routes worth offering.
 * No apology beyond the heading, no illustration, no status code: a reader who mistyped a slug
 * gains nothing from a stack trace. The search form is a plain GET form, so it works with
 * JavaScript disabled.
 */
export function NotFoundNotice() {
  return (
    <div className="reading stack-4">
      <h1>{NOT_FOUND_TITLE}</h1>
      <p className="lead muted">{NOT_FOUND_BODY}</p>

      <form role="search" action="/search" method="get" className="search search--compact">
        <label htmlFor="notfound-q" className="skip-link">
          {NOT_FOUND_SEARCH_LABEL}
        </label>
        <input
          id="notfound-q"
          name="q"
          type="search"
          className="search__input"
          placeholder={NOT_FOUND_SEARCH_LABEL}
          autoComplete="off"
        />
        <button type="submit" className="search__btn">
          Search
        </button>
      </form>

      <p>
        <Link href="/compounds">Browse everything on RNAwiki</Link>
      </p>
      <p>
        <Link href="/">Go to the home page</Link>
      </p>
    </div>
  )
}
