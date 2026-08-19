'use client'

import Link from 'next/link'
import './globals.css'
import { ERROR_BODY, ERROR_RETRY, ERROR_TITLE } from '@/lib/error-copy'

/**
 * The last-resort error boundary: it catches failures in the root layout itself, and any route
 * outside `app/(public)` — /embed, /admin, /gone — where the group-level boundary does not apply.
 *
 * It replaces the whole document, which is why it renders its own <html> and <body>: that is the
 * contract for `global-error.tsx`, not a stylistic choice. It also brings its own stylesheet
 * import, because the root layout is exactly what may have failed.
 *
 * Same rule as app/(public)/error.tsx: nothing here reads the `error` object. Before this file
 * existed, a database outage served Next.js's own copy — "Application error: a server-side
 * exception has occurred while loading localhost (see the server logs for more information)",
 * naming the internal hostname — and, with JavaScript disabled, an empty white page.
 *
 * The masthead is inlined rather than imported from components/notice/NoticeMasthead.tsx on
 * purpose: this boundary must not depend on any module that could itself be part of the failure.
 * `next/link` is the exception, because it is a framework primitive rather than site code, and it
 * renders a real <a href> into the HTML, so the way out still works with JavaScript disabled.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-SG">
      <body>
        <header className="site-header">
          <div className="page site-header__inner">
            <Link href="/" className="wordmark">
              RNAwiki
            </Link>
          </div>
        </header>
        <main id="main" className="page doc">
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
              <Link href="/">Go to the home page</Link>
            </p>
          </div>
        </main>
      </body>
    </html>
  )
}
