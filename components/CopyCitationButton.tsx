'use client'

import { useState } from 'react'

export function CopyCitationButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // Clipboard API unavailable — silently no-op rather than throwing in the UI.
        }
      }}
      style={{
        border: '1px solid var(--color-border-strong)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.3em 0.7em',
        fontSize: '0.82rem',
        cursor: 'pointer',
        color: 'var(--color-text)',
      }}
    >
      {copied ? 'Copied' : 'Copy with source'}
    </button>
  )
}
