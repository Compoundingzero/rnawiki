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
 *
 * A <section>, not a <div>, and that one letter is the whole of its v2 treatment. Both hosts
 * render it as the only child of `<main class="page doc">`, so as a section it matches
 * `.doc > section` and takes the same panel — surface, hairline, radius, shadow, padding — that
 * every other section on every other document page takes. As a div it matched nothing, and the
 * 404 was the one page on the site still rendering as bare text on the page ground: a reader who
 * mistyped a URL was shown a page that looked like a different, older product.
 * `.reading` comes off with the div. The panel is already sized by its container (`--page-doc`,
 * which is --measure plus the gutters and the panel's own padding), so a second cap inside it
 * would narrow the column by the padding twice and leave the panel with an empty right column —
 * the exact defect the wide-shell block at the end of app/globals.css exists to prevent.
 */
export function NotFoundNotice() {
  return (
    <section className="stack-4">
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
    </section>
  )
}
