'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

/**
 * Compact global search in the masthead. Suppressed on the homepage, where the
 * hero search is the primary control — the spec's rule against two full-size
 * search inputs competing on one screen.
 *
 * Progressive enhancement: it is a real GET form to /search, so it works with
 * JavaScript disabled; the router push only avoids a full navigation when JS is
 * available.
 */
export function HeaderSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState('')

  if (pathname === '/') return null

  return (
    <form
      role="search"
      action="/search"
      method="get"
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) router.push(`/search?q=${encodeURIComponent(value.trim())}`)
      }}
      style={{ display: 'flex', gap: 'var(--s2)' }}
    >
      <label htmlFor="masthead-search" className="skip-link">
        Search RNAwiki
      </label>
      <input
        id="masthead-search"
        name="q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search"
        className="field"
        style={{ width: '12rem', minHeight: '2.25rem', padding: '0.35em 0.7em', fontSize: 'var(--size-small)' }}
      />
    </form>
  )
}
