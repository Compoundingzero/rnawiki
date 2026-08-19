'use client'

// The last resort: the error boundary for a failure in the root layout itself.
//
// When this renders, `app/layout.tsx` did not — so it has to supply its own <html> and <body>, and
// `app/globals.css` is NOT applied. Every rule here is therefore an inline style rather than a
// Tailwind class: a class name would resolve to nothing on exactly the one page that cannot afford
// to look broken. The palette and the shapes are still the reference wireframe's, written out by
// hand: #F5F5F7 ground, #1D1D1F ink, #86868B secondary, #0071E3 accent, large radii.
//
// Same rule as `app/error.tsx`: no stack trace, no server message. Only Next.js's opaque digest,
// which is the one string that connects a reader's report to a line in the server log.

import type { CSSProperties } from 'react'

const page: CSSProperties = {
  minHeight: '100vh',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4rem 1rem',
  backgroundColor: '#F5F5F7',
  color: '#1D1D1F',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  WebkitFontSmoothing: 'antialiased',
}

const card: CSSProperties = {
  width: '100%',
  maxWidth: '28rem',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  alignItems: 'center',
}

const heading: CSSProperties = {
  fontSize: '1.75rem',
  lineHeight: 1.2,
  fontWeight: 800,
  letterSpacing: '-0.02em',
  margin: 0,
}

const body: CSSProperties = {
  fontSize: '0.875rem',
  lineHeight: 1.6,
  color: '#6E6E73',
  margin: 0,
}

const button: CSSProperties = {
  appearance: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.625rem 1.25rem',
  borderRadius: '1rem',
  backgroundColor: '#0071E3',
  color: '#FFFFFF',
  fontSize: '0.875rem',
  fontWeight: 700,
}

const digest: CSSProperties = {
  fontSize: '0.6875rem',
  color: '#86868B',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  margin: 0,
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={page}>
        <main style={card}>
          <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            RNA<span style={{ color: '#0071E3' }}>wiki</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 400, color: '#86868B' }}>.com</span>
          </span>

          <h1 style={heading}>The site failed to load.</h1>

          <p style={body}>
            Something broke before the page could be built. Nothing you did caused it. Reloading
            usually works; if it does not, it is ours to fix.
          </p>

          <button type="button" onClick={reset} style={button}>
            Reload
          </button>

          {error.digest && <p style={digest}>Reference {error.digest}</p>}
        </main>
      </body>
    </html>
  )
}
