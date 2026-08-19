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

/**
 * NOT a <details>, deliberately. This block renders inside `RecordUtilities`, which is itself the
 * one permitted level-2 disclosure inside the level-1 Evidence Record. Wrapping this in its own
 * <details> made a third disclosure level, which the information hierarchy caps at two: a reader
 * three controls deep has lost track of what they opened, and every level added is another thing
 * standing between the question and the evidence. So the snippet is simply present once the
 * utilities panel is open.
 *
 * The live preview stays behind an explicit control for a different reason, and it is not a
 * hierarchy one: the preview is a real iframe hitting a real route, a record page carries one of
 * these per claim, and rendering them all would load four extra documents nobody asked for. A
 * button mounts one on request. Without JavaScript the snippet and the copy target are still fully
 * readable; only the optional preview is unavailable, which is the correct thing to lose.
 */
export function EmbedCodeBox({ claimId, claimQuestion }: { claimId: number; claimQuestion: string }) {
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN)
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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
    // minWidth:0 keeps the block shrinkable inside a narrow column, so nothing here can push the
    // page into horizontal overflow.
    <div className="stack" style={{ minWidth: 0, maxWidth: '100%' }}>
      <h6>Embed this answer</h6>

      <p className="small">
        The embed shows the claim, how far its evidence goes, and a link back to the full record. The wording
        cannot be edited by the site that embeds it.
      </p>

      <pre className="code">
        <code>{snippet}</code>
      </pre>

      <div className="tools">
        <button type="button" onClick={handleCopy} className="btn btn--quiet">
          {copied ? 'Embed code copied' : 'Copy embed code'}
        </button>
        <button type="button" onClick={() => setShowPreview((v) => !v)} className="btn btn--quiet">
          {showPreview ? 'Hide preview' : 'Show preview'}
        </button>
      </div>

      {showPreview && (
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
  )
}
