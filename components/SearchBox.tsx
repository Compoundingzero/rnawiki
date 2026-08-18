'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * Primary reference search. A labelled GET form, not a conversational input —
 * it works with JavaScript disabled, and the query lives in the URL so results
 * are shareable.
 */
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
      style={{ display: 'flex', gap: 'var(--s2)', maxWidth: '34rem' }}
    >
      <label htmlFor="site-search" className="skip-link">
        Search a compound, claim or source
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search a compound, claim or source"
        className="field"
      />
      <button type="submit" className="btn btn--primary" style={{ flex: 'none' }}>
        Search
      </button>
    </form>
  )
}
