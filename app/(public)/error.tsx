'use client'

import Link from 'next/link'
import { ERROR_BODY, ERROR_RETRY, ERROR_TITLE } from '@/lib/error-copy'

/**
 * The error boundary for every reader route in this group. It keeps the header and footer from the
 * group layout, so a reader who hits a failure has not lost the site.
 *
 * `'use client'` is required by Next.js for an error boundary — the file cannot be a server
 * component. It renders static markup only: no state, no effects, and the recovery controls are a
 * plain link and a `reset()` button rather than anything that has to fetch. The `reset` prop is
 * accepted and wired to a button because that is the boundary's own retry, but the two links below
 * it are ordinary anchors, so a reader with JavaScript disabled still has somewhere to go.
 *
 * Nothing here reads the `error` object. Its `message` is the framework's, its `digest` is a hash
 * for the server log, and neither is information a reader can use — printing them was the previous
 * behaviour and it named the internal hostname.
 *
 * PARTIAL, and the limit is the framework's. Verified against a real production build with the
 * database pointed at a dead host: with JavaScript on, a reader now gets this notice inside the
 * site's own header and footer instead of Next's "Application error: a server-side exception has
 * occurred while loading <hostname> (see the server logs for more information). Digest: ...".
 * With JavaScript off the body is still empty, because Next delivers a boundary's replacement
 * content in the RSC flight payload rather than in the server HTML — the same limit documented at
 * length in app/(public)/not-found.tsx, and not something this file can reach. The status code is
 * 500 either way, and nothing incorrect is served in either case.
 */
export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page doc">
      <div className="reading stack-4">
        <h1>{ERROR_TITLE}</h1>
        <p className="lead muted">{ERROR_BODY}</p>
        <p className="muted">{ERROR_RETRY}</p>
        <p>
          <button type="button" className="btn" onClick={reset}>
            Try again
          </button>
        </p>
        <p>
          <Link href="/compounds">Browse everything on RNAwiki</Link>
        </p>
        <p>
          <Link href="/">Go to the home page</Link>
        </p>
      </div>
    </div>
  )
}
