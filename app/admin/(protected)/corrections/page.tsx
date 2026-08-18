import type { Metadata } from 'next'
import { db } from '@/db'
import { correctionSubmissions, entities, claims, moderationStatusEnum } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { resolveCorrection } from './actions'

export const metadata: Metadata = { title: 'Corrections', robots: { index: false, follow: false } }

interface Props {
  searchParams: Promise<{ status?: string; error?: string; success?: string }>
}

async function getCorrections(status?: string) {
  const rows = await db
    .select({
      id: correctionSubmissions.id,
      entityId: correctionSubmissions.entityId,
      claimId: correctionSubmissions.claimId,
      category: correctionSubmissions.category,
      message: correctionSubmissions.message,
      proposedSource: correctionSubmissions.proposedSource,
      moderationStatus: correctionSubmissions.moderationStatus,
      resolution: correctionSubmissions.resolution,
      publicCorrectionEntry: correctionSubmissions.publicCorrectionEntry,
      createdAt: correctionSubmissions.createdAt,
    })
    .from(correctionSubmissions)
    .where(status ? eq(correctionSubmissions.moderationStatus, status as (typeof moderationStatusEnum.enumValues)[number]) : undefined)
    .orderBy(desc(correctionSubmissions.createdAt))

  // Resolve human-readable labels for the targeted entity/claim without N+1'ing per row in a
  // large deployment — fine at this scale, kept simple per the brief.
  const withLabels = await Promise.all(
    rows.map(async (row) => {
      let target = 'Unattached'
      if (row.claimId) {
        const [c] = await db.select({ consumerQuestion: claims.consumerQuestion }).from(claims).where(eq(claims.id, row.claimId)).limit(1)
        target = c ? `Claim: ${c.consumerQuestion}` : `Claim #${row.claimId} (deleted)`
      } else if (row.entityId) {
        const [e] = await db.select({ canonicalName: entities.canonicalName }).from(entities).where(eq(entities.id, row.entityId)).limit(1)
        target = e ? `Entity: ${e.canonicalName}` : `Entity #${row.entityId} (deleted)`
      }
      return { ...row, target }
    })
  )
  return withLabels
}

export default async function AdminCorrectionsPage({ searchParams }: Props) {
  const { status, error, success } = await searchParams
  const rows = await getCorrections(status)

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <p className="eyebrow">{rows.length} submissions</p>
          <h1 className="h1" style={{ marginTop: 'var(--s2)' }}>
            Corrections
          </h1>
        </div>
      </div>

      {error && (
        <div className="callout" data-tone="danger" role="alert" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Not saved</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{error}</p>
        </div>
      )}
      {success && (
        <div className="callout" role="status" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Saved</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{success}</p>
        </div>
      )}

      <form method="GET" className="admin-form admin-form--inline" style={{ marginBottom: 'var(--s6)' }}>
        <div className="admin-field">
          <label htmlFor="status" className="admin-label">
            Moderation status
          </label>
          <select id="status" name="status" defaultValue={status ?? ''} className="field">
            <option value="">All statuses</option>
            {moderationStatusEnum.enumValues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-actions">
          <button type="submit" className="btn">
            Filter
          </button>
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
          No corrections match this filter.
        </p>
      ) : (
        <ul className="admin-list">
          {rows.map((row) => (
            <li key={row.id} style={{ borderBottom: 'var(--hairline) solid var(--border)', padding: 'var(--s5) 0' }}>
              <div className="admin-head" style={{ marginBottom: 'var(--s3)' }}>
                <div>
                  <p className="eyebrow">
                    {row.category.replace(/_/g, ' ')} · {row.createdAt.toISOString().slice(0, 10)}
                  </p>
                  <p className="h4" style={{ marginTop: 'var(--s2)' }}>
                    {row.target}
                  </p>
                </div>
                <span className="tag" data-state={row.moderationStatus}>
                  {row.moderationStatus}
                </span>
              </div>

              <p className="prose measure" style={{ fontSize: 'var(--size-small)' }}>
                {row.message}
              </p>

              {(row.proposedSource || row.resolution || row.publicCorrectionEntry) && (
                <dl className="speclabel" style={{ marginTop: 'var(--s4)' }}>
                  {row.proposedSource && (
                    <div className="speclabel__row">
                      <dt className="speclabel__key">Proposed source</dt>
                      <dd className="speclabel__val" style={{ margin: 0, wordBreak: 'break-word' }}>
                        {row.proposedSource}
                      </dd>
                    </div>
                  )}
                  {row.resolution && (
                    <div className="speclabel__row">
                      <dt className="speclabel__key">Resolution</dt>
                      <dd className="speclabel__val" style={{ margin: 0 }}>
                        {row.resolution}
                      </dd>
                    </div>
                  )}
                  {row.publicCorrectionEntry && (
                    <div className="speclabel__row">
                      <dt className="speclabel__key">Published as</dt>
                      <dd className="speclabel__val" style={{ margin: 0 }}>
                        {row.publicCorrectionEntry}
                      </dd>
                    </div>
                  )}
                </dl>
              )}

              {row.moderationStatus === 'pending' && (
                <form action={resolveCorrection.bind(null, row.id)} className="admin-form" style={{ marginTop: 'var(--s5)' }}>
                  <div className="admin-field">
                    <label className="admin-label" htmlFor={`status-${row.id}`}>
                      New status
                    </label>
                    <select id={`status-${row.id}`} name="moderationStatus" required className="field" defaultValue="resolved">
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label className="admin-label" htmlFor={`resolution-${row.id}`}>
                      Resolution note
                    </label>
                    <textarea id={`resolution-${row.id}`} name="resolution" required className="field" />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label" htmlFor={`public-${row.id}`}>
                      Public correction entry (optional)
                    </label>
                    <textarea
                      id={`public-${row.id}`}
                      name="publicCorrectionEntry"
                      aria-describedby={`public-help-${row.id}`}
                      className="field"
                    />
                    <p id={`public-help-${row.id}`} className="admin-help">
                      If filled in, this text is what surfaces publicly as a correction.
                    </p>
                  </div>
                  <div className="admin-actions">
                    <button type="submit" className="btn btn--primary">
                      Save resolution
                    </button>
                  </div>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
