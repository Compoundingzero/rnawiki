import type { Metadata } from 'next'
import Link from 'next/link'
import { PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import { entityPath } from '@/lib/canonical'
import { EVIDENCE_CHANGE_TYPE_LABELS, getRecentEvidenceChanges, type EvidenceChangeItem } from './evidence-changes'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Evidence updates',
  description:
    'What changed on RNAwiki and why — new controlled trials, regulatory decisions, safety warnings, retractions, and every time a Proof Boundary moved.',
}

function changeLink(change: EvidenceChangeItem): string | null {
  if (change.entitySlug && change.claimSlug) return `${entityPath(change.entitySlug)}#claim-${change.claimSlug}`
  if (change.entitySlug) return entityPath(change.entitySlug)
  return null
}

export default async function UpdatesPage() {
  const changes = await getRecentEvidenceChanges(100)

  return (
    <div className="container prose-width" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>Evidence updates</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', margin: 0 }}>
          A record of what changed on RNAwiki and why: new controlled trials, regulatory decisions, safety
          warnings, retractions or corrections, independent replications, and any time a Proof Boundary moved.
        </p>
        <p style={{ marginTop: 'var(--space-3)' }}>
          <a href="/updates/feed.xml">Subscribe via RSS</a>
        </p>
      </header>

      {changes.length === 0 ? (
        <p style={{ color: 'var(--color-text-faint)' }}>No evidence updates recorded yet.</p>
      ) : (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-6)' }}>
          {changes.map((change) => {
            const link = changeLink(change)
            const linkLabel = change.claimQuestion ?? change.entityName ?? null
            return (
              <li
                key={change.id}
                style={{ borderLeft: '3px solid var(--color-border-strong)', paddingLeft: 'var(--space-4)' }}
              >
                <p
                  style={{
                    margin: '0 0 var(--space-1)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    color: 'var(--color-accent-strong)',
                  }}
                >
                  {EVIDENCE_CHANGE_TYPE_LABELS[change.changeType]}
                </p>
                <p style={{ margin: '0 0 var(--space-2)', fontSize: '0.85rem', color: 'var(--color-text-faint)' }}>
                  {change.publicationDate.toISOString().slice(0, 10)}
                  {change.entityName ? ` · ${change.entityName}` : ''}
                </p>
                <p style={{ margin: '0 0 var(--space-2)' }}>{change.explanation}</p>
                {change.previousBoundary && change.newBoundary && (
                  <p style={{ margin: '0 0 var(--space-2)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    Proof Boundary: {PROOF_BOUNDARY_LABELS[change.previousBoundary]} →{' '}
                    {PROOF_BOUNDARY_LABELS[change.newBoundary]}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: '0.85rem', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <a href={change.source} target="_blank" rel="noopener noreferrer">
                    Source
                  </a>
                  {link && linkLabel && <Link href={link}>{linkLabel}</Link>}
                </p>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
