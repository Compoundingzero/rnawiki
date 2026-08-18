import type { Metadata } from 'next'
import Link from 'next/link'
import { entityPath } from '@/lib/canonical'
import { isoDate, plainHumanEvidence, readableDate } from '@/lib/evidence-view'
import { EVIDENCE_CHANGE_TYPE_LABELS, getRecentEvidenceChanges, type EvidenceChangeItem } from './evidence-changes'

// Force dynamic rather than static+ISR — see app/sitemap.ts for why: this route has no dynamic
// segment, so Next would otherwise try to prerender it at build time, which fails on Railway
// (the DB is only reachable at runtime, not from the build container).
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Changes',
  description:
    'What changed on RNAwiki and why: new controlled trials, regulatory decisions, safety warnings, retractions, and every time the evidence behind a claim moved.',
}

function changeLink(change: EvidenceChangeItem): string | null {
  if (change.entitySlug && change.claimSlug) return `${entityPath(change.entitySlug)}#claim-${change.claimSlug}`
  if (change.entitySlug) return entityPath(change.entitySlug)
  return null
}

export default async function UpdatesPage() {
  const changes = await getRecentEvidenceChanges(100)

  return (
    <div className="page doc">
      <header className="reading stack">
        <h1>Changes</h1>
        <p className="lead muted">
          What changed on a record and why: new controlled trials, regulatory decisions, safety warnings,
          retractions, independent replications, and any time the evidence behind a claim moved.
        </p>
        <p className="small">
          <a href="/updates/feed.xml">Subscribe by RSS</a>
        </p>
      </header>

      <section className="section-sm">
        {changes.length === 0 ? (
          <p className="muted">No changes have been recorded yet.</p>
        ) : (
          <ol className="entries reading">
            {changes.map((change) => {
              const link = changeLink(change)
              const subject = change.claimQuestion ?? change.entityName
              const moved = change.previousBoundary && change.newBoundary

              return (
                <li key={change.id}>
                  <p className="entry__meta">
                    <time dateTime={isoDate(change.publicationDate)}>{readableDate(change.publicationDate)}</time>
                    <span aria-hidden="true"> · </span>
                    {EVIDENCE_CHANGE_TYPE_LABELS[change.changeType]}
                  </p>

                  {subject && (
                    <p className="entry__h">{link ? <Link href={link}>{subject}</Link> : subject}</p>
                  )}

                  <p className="muted">{change.explanation}</p>

                  {moved && (
                    <p className="small" style={{ marginTop: 'var(--s3)' }}>
                      How far the evidence goes: {plainHumanEvidence(change.previousBoundary)}{' '}
                      <span aria-hidden="true">→</span>
                      <span className="sr-only">changed to</span> {plainHumanEvidence(change.newBoundary)}.
                    </p>
                  )}

                  <p className="small" style={{ marginTop: 'var(--s3)' }}>
                    <a href={change.source} target="_blank" rel="noopener noreferrer">
                      The source behind this change
                    </a>
                  </p>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}
