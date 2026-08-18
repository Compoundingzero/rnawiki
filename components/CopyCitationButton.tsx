'use client'

import { useState } from 'react'

export function CopyCitationButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // Clipboard API unavailable — silently no-op rather than throwing in the UI.
        }
      }}
    >
      {copied ? 'Citation copied' : 'Copy with source'}
    </button>
  )
}
