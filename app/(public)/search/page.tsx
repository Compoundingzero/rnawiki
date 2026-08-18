import type { Metadata } from 'next'
import Link from 'next/link'
import { inArray } from 'drizzle-orm'
import { db } from '@/db'
import { claims } from '@/db/schema'
import { searchEntitiesAndClaims } from '@/lib/search'
import { SearchResults, type SearchResultDetail } from './SearchResults'

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

/**
 * Per-result record metadata the search query itself does not return: what kind of claim it is,
 * and when it was last reviewed. Read straight from the claims table for the ids already found —
 * lib/search.ts owns ranking and stays untouched. Claims with no review date are simply absent
 * from the map, and the row then prints no date rather than inventing one.
 */
async function getResultDetails(claimIds: number[]): Promise<Map<number, SearchResultDetail>> {
  if (claimIds.length === 0) return new Map()
  const rows = await db
    .select({ id: claims.id, claimType: claims.claimType, lastReviewedAt: claims.lastReviewedAt })
    .from(claims)
    .where(inArray(claims.id, claimIds))
  return new Map(rows.map((r) => [r.id, { claimType: r.claimType, lastReviewedAt: r.lastReviewedAt }]))
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const query = firstValue(params.q).trim()
  const results = query ? await searchEntitiesAndClaims(query) : []
  const details = await getResultDetails(results.map((r) => r.claimId))

  return (
    <div className="wrap" style={{ paddingBlock: 'var(--s7) var(--s7)' }}>
      <header className="measure" style={{ marginBottom: 'var(--s6)' }}>
        <p className="eyebrow">Reference search</p>
        <h1 className="h1" style={{ marginBlock: 'var(--s2) var(--s3)' }}>
          Search
        </h1>
        <p className="prose" style={{ marginBottom: 'var(--s5)' }}>
          Searches published compound records and every claim recorded under them. Names, aliases and claim
          questions are all indexed.
        </p>

        <form role="search" method="get" action="/search" style={{ maxWidth: '34rem' }}>
          <label htmlFor="search-q" className="eyebrow" style={{ display: 'block', marginBottom: 'var(--s2)' }}>
            Compound, alias or question
          </label>
          <div style={{ display: 'flex', gap: 'var(--s2)' }}>
            <input
              id="search-q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Name, alias, or a question"
              className="field"
            />
            <button type="submit" className="btn btn--primary" style={{ flex: 'none' }}>
              Search
            </button>
          </div>
        </form>
      </header>

      <hr className="rule-tight" style={{ marginBottom: 'var(--s5)' }} />

      {query === '' && (
        <div className="measure stack">
          <p className="prose">
            Enter a compound name, one of its aliases, or the question you actually want answered. Results show
            where the evidence for that claim stops before you open the record.
          </p>
          <p>
            <Link href="/compounds">Browse the compound index →</Link>
          </p>
        </div>
      )}

      {query !== '' && results.length === 0 && (
        <div className="measure stack">
          <p className="metaline" role="status">
            <span>
              No results for <b>{query}</b>
            </span>
          </p>
          <p className="prose">
            Nothing in the corpus matches that. Try the compound&apos;s common name, an alias, or a shorter phrase
            from the question.
          </p>
          <p>
            <Link href="/compounds">Browse the compound index →</Link>
          </p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="metaline" role="status" style={{ marginBottom: 'var(--s4)' }}>
            <span>
              {results.length} result{results.length === 1 ? '' : 's'} for <b>{query}</b>
            </span>
          </p>
          <SearchResults results={results} details={details} />
        </>
      )}
    </div>
  )
}
