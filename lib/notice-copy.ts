/**
 * Copy for the not-found notice, shared by `app/not-found.tsx` (any unmatched address) and
 * `app/(public)/not-found.tsx` (a record slug that does not resolve). One source so the two
 * cannot drift into saying different things — the same reason `lib/gone-notice.ts` holds the
 * wording for the two 410 surfaces.
 *
 * Deliberate exception, and the only one on the site: `NOT_FOUND_TITLE` says "we". Everywhere
 * else RNAwiki speaks as itself and never as a first-person plural, because the site is run by
 * one person and an invented "we" is exactly the kind of borrowed institutional voice
 * docs/writing-style.md exists to prevent. This one line is a browser-style apology for a broken
 * address, not a statement about who runs the site, and the owner's brief specifies it verbatim.
 * Do not copy the pattern into any other page.
 */

export const NOT_FOUND_TITLE = "We couldn't find that page."

export const NOT_FOUND_BODY =
  'The address may be out of date, or a word in it may be misspelled. Try searching for the compound or the health claim instead.'

export const NOT_FOUND_SEARCH_LABEL = 'Search a name or health claim'
