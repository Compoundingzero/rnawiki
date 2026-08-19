'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

/**
 * One row at every width. On mobile the nav collapses behind a menu button so the header cannot
 * wrap into the three stacked rows the previous version produced at 390px.
 *
 * Client component only because of the menu toggle and the active-route check; it renders no
 * content that a reader needs, so nothing important depends on JavaScript. The search control is
 * suppressed on the homepage, where the hero search is the primary one.
 */
const NAV = [
  { href: '/compounds', label: 'Browse' },
  { href: '/evidence', label: 'How it works' },
]

const MENU = [
  ...NAV,
  { href: '/updates', label: 'Changes' },
  { href: '/corrections', label: 'Corrections' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isHome = pathname === '/'

  const current = (href: string) => (pathname === href ? 'page' : undefined)

  return (
    <header className="site-header">
      <div className="page site-header__inner">
        <Link href="/" className="wordmark">
          RNAwiki
        </Link>

        <nav className="site-nav" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={current(item.href)}>
              {item.label}
            </Link>
          ))}
          {!isHome && <HeaderSearchForm />}
        </nav>

        <div className="header-controls">
          {!isHome && (
            <Link href="/search" className="header-btn" aria-label="Search">
              <SearchIcon />
            </Link>
          )}
          <button
            type="button"
            className="header-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu" id="mobile-menu">
          <nav className="page" aria-label="Menu">
            <ul>
              {MENU.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} aria-current={current(item.href)} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}

function HeaderSearchForm() {
  return (
    // Named, because /search and /compounds each render a search form of their own: two
    // unlabelled search landmarks give a screen-reader user two identical destinations with
    // no way to tell which is which.
    <form
      role="search"
      aria-label="Site search"
      action="/search"
      method="get"
      className="search search--compact"
      style={{ maxWidth: '15rem' }}
    >
      <label htmlFor="header-q" className="skip-link">
        Search RNAwiki
      </label>
      <input id="header-q" name="q" type="search" className="search__input" placeholder="Search" />
    </form>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
