import type { Metadata } from 'next'
import Link from 'next/link'
import { PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import { entityPath } from '@/lib/canonical'
import { EVIDENCE_CHANGE_TYPE_LABELS, getRecentEvidenceChanges, type EvidenceChangeItem } from './evidence-changes'

// Force dynamic rather than static+ISR — see app/sitemap.ts for why: this route has no dynamic
// segment, so Next would otherwise try to prerender it at build time, which fails on Railway
// (the DB is only reachable at runtime, not from the build container).
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Evidence updates',
  description:
    'What changed on RNAwiki and why — new controlled trials, regulatory decisions, safety warnings, retractions, and every time a Proof Boundary moved.',
}

/** Visually hidden, still announced — the arrow between two stages is decoration, the word is not. */
const SR_ONLY: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
}

function changeLink(change: EvidenceChangeItem): string | null {
  if (change.entitySlug && change.claimSlug) return `${entityPath(change.entitySlug)}#claim-${change.claimSlug}`
  if (change.entitySlug) return entityPath(change.entitySlug)
  return null
}

export default async function UpdatesPage() {
  const changes = await getRecentEvidenceChanges(100)

  return (
    <div className="wrap" style={{ paddingBlock: 'var(--s7)' }}>
      <div style={{ maxWidth: '56rem' }}>
        <header className="measure">
          <p className="eyebrow">Change log</p>
          <h1 className="display" style={{ marginBlock: 'var(--s3) var(--s4)' }}>
            Evidence updates
          </h1>
          <p className="lead">
            What changed on RNAwiki and why: new controlled trials, regulatory decisions, safety warnings,
            retractions or corrections, independent replications, and any time a Proof Boundary moved.
          </p>
          <p className="metaline" style={{ marginTop: 'var(--s4)' }}>
            <a href="/updates/feed.xml">Subscribe via RSS</a>
            <span>
              <b>{changes.length}</b> {changes.length === 1 ? 'entry' : 'entries'} shown, newest first
            </span>
          </p>
        </header>

        <hr className="rule" />

        {changes.length === 0 ? (
          <p className="muted">No evidence updates recorded yet.</p>
        ) : (
          <ol className="rows">
            {changes.map((change) => {
              const link = changeLink(change)
              const linkLabel = change.claimQuestion ?? change.entityName ?? null
              return (
                <li key={change.id} className="row">
                  <div className="row__link" style={{ display: 'block' }}>
                    <p className="eyebrow">
                      <span>{change.publicationDate.toISOString().slice(0, 10)}</span>
                      {change.entityName && (
                        <>
                          <span aria-hidden="true"> · </span>
                          <span>{change.entityName}</span>
                        </>
                      )}
                    </p>

                    <p style={{ marginTop: 'var(--s2)' }}>
                      <span className="tag">{EVIDENCE_CHANGE_TYPE_LABELS[change.changeType]}</span>
                    </p>

                    <p className="prose measure" style={{ marginTop: 'var(--s3)' }}>
                      {change.explanation}
                    </p>

                    {change.previousBoundary && change.newBoundary && (
                      <p className="metaline" style={{ marginTop: 'var(--s3)' }}>
                        <span>
                          Boundary <b>{PROOF_BOUNDARY_LABELS[change.previousBoundary]}</b>{' '}
                          <span aria-hidden="true">→</span>
                          <span style={SR_ONLY}>moved to</span>{' '}
                          <b>{PROOF_BOUNDARY_LABELS[change.newBoundary]}</b>
                        </span>
                      </p>
                    )}

                    <p className="metaline" style={{ marginTop: 'var(--s3)' }}>
                      <a href={change.source} target="_blank" rel="noopener noreferrer">
                        Source ↗
                      </a>
                      {link && linkLabel && <Link href={link}>{linkLabel}</Link>}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
