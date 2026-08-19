import type { Metadata } from 'next'
import { NotFoundNotice } from '@/components/notice/NotFoundNotice'

/**
 * Not-found inside the reader chrome. This is what a reader sees when a page in this group calls
 * notFound() — most often `/r/<slug>` for a slug that is not published — so the header and footer
 * from the group layout stay in place and the reader never loses the site.
 *
 * ACCEPTED LIMIT, documented so it is not rediscovered as a bug.
 *
 * On Next.js 15.5.23, a `notFound()` thrown from a PAGE component does not server-render this
 * notice. Next emits its own error document instead — `<html id="__next_error__">` with an empty
 * suspense boundary, `<div hidden><template id="B:0"></template></div>` — and the notice text
 * reaches the reader only from the RSC flight payload, i.e. only once JavaScript runs. With
 * JavaScript disabled the body of `/r/<missing-slug>` and `/embed/claim/<missing-id>` is blank.
 * The status code is still 404 and the page is still noindex, so nothing incorrect is served; the
 * loss is the recovery copy and the search box.
 *
 * It is the framework's behaviour, not this file's, and it was checked rather than assumed. A
 * one-line page whose whole body is `notFound()` reproduces it; so does the same page with the
 * group's not-found removed, falling back to `app/not-found.tsx`; so does the route with
 * `revalidate` swapped for `force-dynamic`, and with the 404 decided in `generateMetadata` before
 * any streaming begins. This component itself renders correctly — an unmatched address such as
 * `/nonexistent` never enters a page component and shows the full notice in the server HTML.
 *
 * The fixes that would work are both worse than the defect. `generateStaticParams` plus
 * `dynamicParams: false` would make Next answer unknown slugs from the router the way it answers
 * `/nonexistent`, but it would also mean a newly published record 404s until the next deploy, and
 * Railway's build container cannot reach the database to enumerate slugs (CLAUDE.md, "Gotchas").
 * Serving the 404 document straight from middleware, the way `lib/gone-notice.ts` serves the 410,
 * would add a database lookup to every request for every record page — the site's busiest path —
 * to improve an error page. Re-test on the next Next.js upgrade: if a `notFound()` from a page
 * starts server-rendering this component, delete this note.
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
