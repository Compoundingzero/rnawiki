import Link from 'next/link'
import { PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import { entityPath } from '@/lib/canonical'
import type { SearchResult } from '@/lib/search'

/**
 * Pure presentation: renders a non-empty list of search results. Callers (app/search/page.tsx)
 * own the "no query yet" / "no results" empty states — this component only ever sees results
 * that exist. Server component, no interactivity, so it renders identically with JavaScript
 * disabled.
 */
export function SearchResults({ results }: { results: SearchResult[] }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-4)' }}>
      {results.map((result) => (
        <li key={result.claimId}>
          <Link
            href={`${entityPath(result.entitySlug)}#claim-${result.claimSlug}`}
            style={{
              display: 'block',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4) var(--space-6)',
              textDecoration: 'none',
              color: 'inherit',
              background: 'var(--color-surface)',
            }}
          >
            <p
              style={{
                margin: '0 0 var(--space-1)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-text-faint)',
              }}
            >
              {result.entityName}
            </p>
            <h2 style={{ margin: '0 0 var(--space-2)', fontSize: '1.1rem' }}>{result.consumerQuestion}</h2>
            <p style={{ margin: '0 0 var(--space-3)', fontSize: '0.98rem', color: 'var(--color-text-muted)' }}>
              {result.directAnswer}
            </p>
            <p
              style={{
                margin: 0,
                display: 'inline-block',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                color: 'var(--color-accent-strong)',
                borderTop: '2px solid var(--color-accent)',
                paddingTop: 'var(--space-2)',
              }}
            >
              Proof Boundary — {PROOF_BOUNDARY_LABELS[result.proofBoundaryStage]}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
