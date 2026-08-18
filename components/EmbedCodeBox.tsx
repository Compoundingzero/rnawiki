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
// never seen app/globals.css. These match --border and --radius-sm.
const SNIPPET_BORDER = '#d2d2d7'
const SNIPPET_RADIUS = '8px'

export function EmbedCodeBox({ claimId, claimQuestion }: { claimId: number; claimQuestion: string }) {
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN)
  const [copied, setCopied] = useState(false)
  // The preview is a real iframe hitting a real route. A record page carries one of these per
  // claim, so mounting them all up front would load four extra documents nobody asked for —
  // it mounts when the reader opens this panel, and not before.
  const [opened, setOpened] = useState(false)

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
    // minWidth:0 keeps the expanded panel shrinkable inside a narrow column, so opening it can
    // never push the page into horizontal overflow.
    <details
      className="disclosure disclosure--inline"
      style={{ minWidth: 0, maxWidth: '100%' }}
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open) setOpened(true)
      }}
    >
      <summary>Embed this answer</summary>

      <div className="disclosure__body stack">
        <p className="small">
          The embed shows the claim, how far its evidence goes, and a link back to the full record. The wording
          cannot be edited by the site that embeds it.
        </p>

        <pre className="code">
          <code>{snippet}</code>
        </pre>

        <div>
          <button type="button" onClick={handleCopy} className="btn">
            {copied ? 'Embed code copied' : 'Copy embed code'}
          </button>
        </div>

        {opened && (
          <div>
            <p className="small muted" style={{ marginBottom: 'var(--s2)' }}>
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
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
          </div>
        )}
      </div>
    </details>
  )
}
