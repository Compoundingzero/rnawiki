'use client'

import { useEffect, useState } from 'react'

// Same fallback convention as lib/canonical.ts's SITE_URL — but this file ships to the
// browser, and lib/canonical.ts reads process.env.SITE_URL at module scope, which is not a
// NEXT_PUBLIC_ variable and so is never inlined into client bundles (referencing it here would
// evaluate to undefined/throw at runtime instead of the real value). Reading
// window.location.origin after mount gives the real origin without that risk, with this same
// literal as the pre-hydration fallback.
const DEFAULT_ORIGIN = 'https://rnawiki.com'
const PREVIEW_HEIGHT = 340

// The iframe snippet carries literal values, not tokens: it runs on a third-party page that has
// never seen app/globals.css. These match --border and --radius-md.
const SNIPPET_BORDER = '#d5dcd7'
const SNIPPET_RADIUS = '6px'

export function EmbedCodeBox({ claimId, claimQuestion }: { claimId: number; claimQuestion: string }) {
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const embedPath = `/embed/claim/${claimId}`
  const embedUrl = `${origin}${embedPath}`
  const snippet = `<iframe src="${embedUrl}" title="RNAwiki: ${claimQuestion}" width="100%" height="${PREVIEW_HEIGHT}" style="border:1px solid ${SNIPPET_BORDER};border-radius:${SNIPPET_RADIUS};max-width:100%" loading="lazy"></iframe>`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — silently no-op rather than throwing in the UI.
    }
  }

  return (
    // minWidth:0 keeps the expanded panel shrinkable when this sits in a flex row of
    // controls, so opening it can never push the page into horizontal overflow.
    <details style={{ minWidth: 0, maxWidth: '100%' }}>
      <summary
        className="btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          listStyle: 'none',
          cursor: 'pointer',
        }}
      >
        Embed
      </summary>

      <div className="stack" style={{ marginTop: 'var(--s4)', maxWidth: '34rem' }}>
        <p className="prose" style={{ fontSize: 'var(--size-small)' }}>
          This renders the claim, the stage its evidence reaches, and a link back to the full record. The wording
          cannot be edited by the embedding site.
        </p>

        <pre
          style={{
            margin: 0,
            padding: 'var(--s3)',
            background: 'var(--surface-sunk)',
            border: 'var(--hairline) solid var(--border)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--size-meta)',
            lineHeight: 1.5,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          <code>{snippet}</code>
        </pre>

        <div>
          <button type="button" onClick={handleCopy} className="btn">
            {copied ? 'Embed code copied' : 'Copy embed code'}
          </button>
        </div>

        <div>
          <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>
            Preview
          </p>
          <iframe
            src={embedPath}
            title={`Embed preview: ${claimQuestion}`}
            loading="lazy"
            style={{
              width: '100%',
              maxWidth: '100%',
              height: `${PREVIEW_HEIGHT}px`,
              border: 'var(--hairline) solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          />
        </div>
      </div>
    </details>
  )
}
