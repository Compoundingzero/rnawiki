/**
 * Copy for the server-error notice, shared by `app/global-error.tsx` (any route, including the
 * root layout itself) and `app/(public)/error.tsx` (a reader route, which keeps the site chrome).
 * One source so the two cannot drift, the same reason lib/notice-copy.ts and lib/gone-notice.ts
 * exist for the 404 and 410 surfaces.
 *
 * WHAT THIS REPLACES. There was no error boundary anywhere in the app — no `global-error.tsx`, no
 * `error.tsx` at any level. With the database unreachable, every reader route returned 500 and the
 * body a reader saw was Next.js's own developer copy: "Application error: a server-side exception
 * has occurred while loading localhost (see the server logs for more information). Digest:
 * 3297275791" — framework wording naming the internal hostname and telling a member of the public
 * to read server logs. With JavaScript disabled the same responses rendered a blank white page.
 *
 * The wording below states the one thing a reader of an evidence site needs to hear during an
 * outage, which is that nothing about the evidence has changed — a page that fails to load is not
 * a page that was withdrawn — and offers a retry. It carries no digest, no status code and no
 * stack trace: those belong in the server log, and a digest is not something a reader can act on.
 * Voice is RNAwiki's own, never "we", per docs/writing-style.md.
 */

export const ERROR_TITLE = 'This page could not be loaded.'

export const ERROR_BODY =
  'Something on RNAwiki’s side failed while building this page. Nothing about the evidence has changed, and no record has been withdrawn — the page simply could not be assembled just now.'

export const ERROR_RETRY = 'Reloading in a minute usually resolves it.'
