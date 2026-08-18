'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SearchBox() {
  const router = useRouter()
  const [value, setValue] = useState('')

  return (
    <form
      role="search"
      action="/search"
      method="get"
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) router.push(`/search?q=${encodeURIComponent(value.trim())}`)
      }}
      style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}
    >
      <label htmlFor="site-search" style={{ position: 'absolute', left: -9999 }}>
        Search a compound, treatment, or claim
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search a compound, treatment, or claim"
        style={{
          flex: 1,
          maxWidth: '26rem',
          padding: '0.7em 1em',
          fontSize: '1rem',
          border: '1px solid var(--color-border-strong)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '0.7em 1.3em',
          fontSize: '1rem',
          fontWeight: 600,
          border: 'none',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-accent)',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Search
      </button>
    </form>
  )
}
