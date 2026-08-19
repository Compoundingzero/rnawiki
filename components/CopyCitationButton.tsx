'use client'

import { useState } from 'react'

export function CopyCitationButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  // Quiet, not primary. It sits inside the record's utilities panel beside two other quiet
  // controls, and the action colour is reserved for things the reader came to operate — not for
  // the site asking to be redistributed in the middle of an answer.
  return (
    <button
      type="button"
      className="btn btn--quiet"
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
