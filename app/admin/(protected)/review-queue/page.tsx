import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { claims, entities, reviewDecisionEnum } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import { reviewClaim, reviewEntity } from './actions'
import * as ui from '@/lib/admin/ui'

export const metadata: Metadata = { title: 'Review queue', robots: { index: false, follow: false } }

interface Props {
  searchParams: Promise<{ error?: string; success?: string }>
}

async function getClaimsAwaitingReview() {
  return db
    .select({
      id: claims.id,
      consumerQuestion: claims.consumerQuestion,
      proofBoundaryStage: claims.proofBoundaryStage,
      version: claims.version,
      entityName: entities.canonicalName,
    })
    .from(claims)
    .innerJoin(entities, eq(claims.entityId, entities.id))
    .where(eq(claims.publicationStatus, 'scientific_review_required'))
    .orderBy(desc(claims.updatedAt))
}

async function getEntitiesAwaitingReview() {
  return db
    .select({ id: entities.id, canonicalName: entities.canonicalName, bottomLine: entities.bottomLine })
    .from(entities)
    .where(eq(entities.publicationStatus, 'scientific_review_required'))
    .orderBy(desc(entities.updatedAt))
}

function DecisionForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form action={action} style={{ marginTop: 'var(--space-2)' }}>
      <div style={{ ...ui.flexRow, alignItems: 'flex-start' }}>
        <select name="decision" required style={{ ...ui.select, width: 'auto' }} defaultValue="approved">
          {reviewDecisionEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {v.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <input name="comments" placeholder="Comments (optional)" style={{ ...ui.input, maxWidth: '22rem' }} />
        <button type="submit" style={ui.buttonSecondary}>
          Record review
        </button>
      </div>
    </form>
  )
}

export default async function ReviewQueuePage({ searchParams }: Props) {
  const [{ error, success }, pendingClaims, pendingEntities, user] = await Promise.all([
    searchParams,
    getClaimsAwaitingReview(),
    getEntitiesAwaitingReview(),
    getCurrentUser(),
  ])

  const canReview = user?.role === 'administrator' || user?.role === 'scientific_reviewer'

  return (
    <div style={ui.page}>
      <h1 style={ui.h1}>Review queue</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>
        Claims and entities awaiting scientific review. Recording a decision here writes a `reviews` row under
        your account and advances the item&apos;s publication status — this is what makes &quot;Reviewed by&quot; on the
        public page honest.
      </p>

      {error && <p style={ui.errorBanner}>{error}</p>}
      {success && <p style={ui.successBanner}>{success}</p>}

      {!canReview && (
        <p style={ui.errorBanner}>
          Your role ({user?.role}) cannot record a review decision. Only scientific reviewers and administrators can.
        </p>
      )}

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={ui.h2}>Claims ({pendingClaims.length})</h2>
        {pendingClaims.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)' }}>Nothing waiting.</p>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {pendingClaims.map((c) => (
              <div key={c.id} style={ui.sectionCard}>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  <Link href={`/admin/claims/${c.id}`}>{c.consumerQuestion}</Link>
                </p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {c.entityName} · {PROOF_BOUNDARY_LABELS[c.proofBoundaryStage]} · version {c.version}
                </p>
                {canReview && <DecisionForm action={reviewClaim.bind(null, c.id)} />}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={ui.h2}>Entities ({pendingEntities.length})</h2>
        {pendingEntities.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)' }}>Nothing waiting.</p>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {pendingEntities.map((e) => (
              <div key={e.id} style={ui.sectionCard}>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  <Link href={`/admin/entities/${e.id}`}>{e.canonicalName}</Link>
                </p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{e.bottomLine}</p>
                {canReview && <DecisionForm action={reviewEntity.bind(null, e.id)} />}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
