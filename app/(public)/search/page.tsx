import type { Metadata } from 'next'
import { searchEntitiesAndClaims } from '@/lib/search'
import { SearchResults } from './SearchResults'

// Reads ?q= via Next's searchParams (a Promise as of Next 15) and queries the database directly
// in this server component — no client-side fetch, so results render before any JavaScript runs
// and the page works with JavaScript disabled. The plain <form method="get" action="/search">
// below is what makes typing a query and pressing enter/submit work without JavaScript too: it's
// a normal browser navigation to /search?q=..., which this same page then serves.
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
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <section style={{ maxWidth: '38rem', marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '1.7rem', marginBottom: 'var(--space-4)' }}>Search</h1>
        <form role="search" method="get" action="/search" style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <label htmlFor="search-q" style={{ position: 'absolute', left: -9999 }}>
            Search a compound, treatment, or claim
          </label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={query}
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
      </section>

      {query === '' && (
        <p style={{ color: 'var(--color-text-muted)' }}>
          Search a compound, treatment, or a question like &ldquo;does BPC-157 heal tendons?&rdquo;
        </p>
      )}

      {query !== '' && results.length === 0 && (
        <div style={{ maxWidth: '38rem' }}>
          <p style={{ margin: 0 }}>
            No results for &ldquo;{query}&rdquo;.
          </p>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Try the compound&apos;s common name, an alias, or a shorter phrase from your question.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p style={{ color: 'var(--color-text-faint)', fontSize: '0.85rem', marginBottom: 'var(--space-4)' }}>
            {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
          </p>
          <SearchResults results={results} />
        </>
      )}
    </div>
  )
}
