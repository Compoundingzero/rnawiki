import type { Metadata } from 'next'
import Link from 'next/link'
import { searchEntitiesAndClaims } from '@/lib/search'
import { SearchResults } from './SearchResults'

// Reads ?q= via Next's searchParams (a Promise as of Next 15) and queries the database directly
// in this server component — no client-side fetch, so results render before any JavaScript runs
// and the page works with JavaScript disabled. The plain <form method="get" action="/search">
// below is what makes typing a query and pressing enter/submit work without JavaScript too: it's
// a normal browser navigation to /search?q=..., which this same page then serves.
//
// force-dynamic for the same reason as app/(public)/page.tsx and app/sitemap.ts: this route has
// no dynamic segment, and Railway's build container cannot reach the database.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search',
  // Internal search-results pages are near-duplicates of the canonical /r/[slug] pages they link
  // to; keep them out of the index but fully crawlable/followable so the links still get found.
  robots: { index: false, follow: true },
}

interface Props {
  searchParams: Promise<{ q?: string | string[] }>
}

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const query = firstValue(params.q).trim()
  const results = query ? await searchEntitiesAndClaims(query) : []

  return (
    <div className="page page-top">
      <header className="reading">
        <h1>Search RNAwiki</h1>
        <p className="lead muted" style={{ marginTop: 'var(--s4)' }}>
          Search a medicine, supplement, treatment or health claim.
        </p>
      </header>

      <form role="search" method="get" action="/search" className="search" style={{ marginTop: 'var(--s5)' }}>
        <label htmlFor="q" className="skip-link">
          Search a medicine, supplement, treatment or health claim
        </label>
        <input
          id="q"
          name="q"
          type="search"
          className="search__input"
          defaultValue={query}
          placeholder="Name or health claim"
          autoComplete="off"
        />
        <button type="submit" className="search__btn">
          Search
        </button>
      </form>

      {query === '' && (
        <p className="reading muted section-sm">
          Type a name or a health claim above, or{' '}
          <Link href="/compounds">browse everything RNAwiki covers</Link>.
        </p>
      )}

      {query !== '' && results.length === 0 && (
        <section className="reading stack section-sm">
          <p className="lead" role="status">
            RNAwiki couldn&apos;t find a matching answer.
          </p>
          <p className="muted">Try a shorter name or a different part of the question.</p>
          <p>
            <Link href="/compounds">Browse everything RNAwiki covers</Link>
          </p>
        </section>
      )}

      {results.length > 0 && (
        <section className="section-sm">
          <p className="muted reading" role="status">
            {results.length} answer{results.length === 1 ? '' : 's'} for “{query}”
          </p>
          <SearchResults results={results} />
        </section>
      )}
    </div>
  )
}
