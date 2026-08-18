import Link from 'next/link'
import { PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import { entityPath } from '@/lib/canonical'
import type { SearchResult } from '@/lib/search'

/**
 * Record metadata that accompanies a result but does not come out of the search query itself.
 * Optional per result: a claim with no review date contributes no date row rather than a
 * placeholder.
 */
export interface SearchResultDetail {
  claimType: string
  lastReviewedAt: Date | null
}

/**
 * Pure presentation: renders a non-empty list of search results as hairline-separated rows.
 * Callers (app/(public)/search/page.tsx) own the "no query yet" / "no results" empty states —
 * this component only ever sees results that exist. Server component, no interactivity, so it
 * renders identically with JavaScript disabled.
 *
 * Each row carries enough of the record to judge it without navigating: which compound it belongs
 * to, what kind of claim it is, the answer sentence, where the evidence stops, and when the claim
 * was last reviewed.
 */
export function SearchResults({
  results,
  details,
}: {
  results: SearchResult[]
  details?: Map<number, SearchResultDetail>
}) {
  return (
    <ul className="rows">
      {results.map((result) => {
        const detail = details?.get(result.claimId)
        const lastReviewed = detail?.lastReviewedAt ? detail.lastReviewedAt.toISOString().slice(0, 10) : null
        return (
          <li key={result.claimId} className="row">
            <Link
              href={`${entityPath(result.entitySlug)}#claim-${result.claimSlug}`}
              className="row__link"
            >
              <div>
                <span className="eyebrow">
                  {result.entityName} · Claim
                  {detail ? ` · ${detail.claimType.replace(/_/g, ' ')}` : ''}
                </span>
                <div className="row__name" style={{ marginTop: '0.15rem' }}>
                  {result.consumerQuestion}
                </div>
                <p className="row__desc">{result.directAnswer}</p>
                <div className="row__meta">
                  {/* Long stage labels must wrap rather than push the row off a 375px screen. */}
                  <span className="tag" style={{ whiteSpace: 'normal' }}>
                    Proof Boundary — {PROOF_BOUNDARY_LABELS[result.proofBoundaryStage]}
                  </span>
                </div>
                {lastReviewed && (
                  <p className="metaline" style={{ marginTop: 'var(--s2)' }}>
                    <span>
                      Last reviewed <b>{lastReviewed}</b>
                    </span>
                  </p>
                )}
              </div>
              <span className="row__chev" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
