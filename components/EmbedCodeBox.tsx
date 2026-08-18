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

export function EmbedCodeBox({ claimId, claimQuestion }: { claimId: number; claimQuestion: string }) {
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const embedPath = `/embed/claim/${claimId}`
  const embedUrl = `${origin}${embedPath}`
  const snippet = `<iframe src="${embedUrl}" title="RNAwiki: ${claimQuestion}" width="100%" height="${PREVIEW_HEIGHT}" style="border:1px solid #dedad0;border-radius:6px;max-width:100%" loading="lazy"></iframe>`

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
    <details>
      <summary
        style={{
          display: 'inline-block',
          cursor: 'pointer',
          border: '1px solid var(--color-border-strong)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.3em 0.7em',
          fontSize: '0.82rem',
          color: 'var(--color-text)',
        }}
      >
        Embed
      </summary>

      <div
        style={{
          marginTop: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          maxWidth: '32rem',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Paste this into any page to show this claim, its current Proof Boundary, and a link back to the full
          evidence. The wording cannot be edited by the embedding site.
        </p>

        <pre
          style={{
            margin: 0,
            padding: 'var(--space-3)',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          <code>{snippet}</code>
        </pre>

        <button
          type="button"
          onClick={handleCopy}
          style={{
            alignSelf: 'flex-start',
            border: '1px solid var(--color-border-strong)',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.3em 0.7em',
            fontSize: '0.82rem',
            cursor: 'pointer',
            color: 'var(--color-text)',
          }}
        >
          {copied ? 'Copied' : 'Copy embed code'}
        </button>

        <div>
          <p
            style={{
              margin: '0 0 var(--space-2)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--color-text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            Preview
          </p>
          <iframe
            src={embedPath}
            title={`Embed preview: ${claimQuestion}`}
            loading="lazy"
            style={{
              width: '100%',
              height: `${PREVIEW_HEIGHT}px`,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '100%',
            }}
          />
        </div>
      </div>
    </details>
  )
}
