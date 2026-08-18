import type { Metadata } from 'next'
import { db } from '@/db'
import { correctionSubmissions, entities, claims, moderationStatusEnum } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { resolveCorrection } from './actions'
import * as ui from '@/lib/admin/ui'

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
    <div style={ui.page}>
      <h1 style={ui.h1}>Corrections ({rows.length})</h1>

      {error && <p style={ui.errorBanner}>{error}</p>}
      {success && <p style={ui.successBanner}>{success}</p>}

      <form method="GET" style={{ ...ui.flexRow, marginBottom: 'var(--space-6)' }}>
        <select name="status" defaultValue={status ?? ''} style={{ ...ui.select, width: 'auto' }}>
          <option value="">All statuses</option>
          {moderationStatusEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <button type="submit" style={ui.buttonSecondary}>
          Filter
        </button>
      </form>

      {rows.length === 0 ? (
        <p style={{ color: 'var(--color-text-faint)' }}>No corrections match this filter.</p>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {rows.map((row) => (
            <div key={row.id} style={ui.sectionCard}>
              <div style={{ ...ui.flexRow, justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{row.target}</p>
                <span style={ui.badge}>{row.moderationStatus}</span>
              </div>
              <p style={{ margin: 'var(--space-2) 0', fontSize: '0.8rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {row.category.replace(/_/g, ' ')} · {row.createdAt.toISOString().slice(0, 10)}
              </p>
              <p style={{ margin: 0 }}>{row.message}</p>
              {row.proposedSource && (
                <p style={{ margin: 'var(--space-2) 0 0', fontSize: '0.88rem' }}>
                  <strong>Proposed source:</strong> {row.proposedSource}
                </p>
              )}
              {row.resolution && (
                <p style={{ margin: 'var(--space-2) 0 0', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                  <strong>Resolution:</strong> {row.resolution}
                </p>
              )}

              {row.moderationStatus === 'pending' && (
                <form action={resolveCorrection.bind(null, row.id)} style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`status-${row.id}`}>
                      New status
                    </label>
                    <select id={`status-${row.id}`} name="moderationStatus" required style={{ ...ui.select, width: 'auto' }} defaultValue="resolved">
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`resolution-${row.id}`}>
                      Resolution note
                    </label>
                    <textarea id={`resolution-${row.id}`} name="resolution" required style={ui.textareaSmall} />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`public-${row.id}`}>
                      Public correction entry (optional)
                    </label>
                    <textarea id={`public-${row.id}`} name="publicCorrectionEntry" style={ui.textareaSmall} />
                    <p style={ui.helpText}>If filled in, this text is what surfaces publicly as a correction.</p>
                  </div>
                  <button type="submit" style={ui.buttonPrimary}>
                    Save resolution
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
