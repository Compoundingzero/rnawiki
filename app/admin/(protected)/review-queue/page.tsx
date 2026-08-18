import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { claims, entities, reviewDecisionEnum } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import { PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import { reviewClaim, reviewEntity } from './actions'

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

function DecisionForm({
  action,
  idPrefix,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>
  idPrefix: string
  label: string
}) {
  return (
    <form action={action} className="admin-form admin-form--inline" style={{ marginTop: 'var(--s4)' }}>
      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-decision`}>
          Decision
        </label>
        <select id={`${idPrefix}-decision`} name="decision" required className="field" defaultValue="approved">
          {reviewDecisionEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {v.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor={`${idPrefix}-comments`}>
          Comments (optional)
        </label>
        <input id={`${idPrefix}-comments`} name="comments" className="field" style={{ minWidth: '16rem' }} />
      </div>
      <div className="admin-actions">
        <button type="submit" className="btn">
          Record review of {label}
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
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <p className="eyebrow">{pendingClaims.length + pendingEntities.length} awaiting review</p>
          <h1 className="h1" style={{ marginTop: 'var(--s2)' }}>
            Review queue
          </h1>
        </div>
      </div>

      <p className="prose measure" style={{ fontSize: 'var(--size-small)', marginBottom: 'var(--s5)' }}>
        Recording a decision here writes a row in <code>reviews</code> under the signed-in account and advances the
        item&apos;s publication status. That row is the only thing that lets a public page say a claim was reviewed.
      </p>

      {error && (
        <div className="callout" data-tone="danger" role="alert" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Not recorded</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{error}</p>
        </div>
      )}
      {success && (
        <div className="callout" role="status" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Recorded</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{success}</p>
        </div>
      )}

      {!canReview && (
        <div className="callout" data-tone="warning" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Read only</p>
          <p style={{ fontSize: 'var(--size-small)' }}>
            The {user?.role ?? 'current'} role cannot record a review decision. Only scientific reviewers and
            administrators can.
          </p>
        </div>
      )}

      <section>
        <div className="section-head">
          <h2 className="h2">Claims</h2>
          <span className="eyebrow" style={{ flex: 'none' }}>
            {pendingClaims.length} waiting
          </span>
        </div>
        {pendingClaims.length === 0 ? (
          <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
            Nothing waiting.
          </p>
        ) : (
          <ul className="admin-list">
            {pendingClaims.map((c) => (
              <li key={c.id} style={{ borderBottom: 'var(--hairline) solid var(--border)', padding: 'var(--s5) 0' }}>
                <p className="eyebrow">
                  {c.entityName} · version {c.version}
                </p>
                <p className="h4" style={{ marginBlock: 'var(--s2)' }}>
                  <Link href={`/admin/claims/${c.id}`}>{c.consumerQuestion}</Link>
                </p>
                <p className="metaline">
                  <span>{PROOF_BOUNDARY_LABELS[c.proofBoundaryStage]}</span>
                </p>
                {canReview && (
                  <DecisionForm
                    action={reviewClaim.bind(null, c.id)}
                    idPrefix={`claim-${c.id}`}
                    label="this claim"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr className="rule" />

      <section>
        <div className="section-head">
          <h2 className="h2">Entities</h2>
          <span className="eyebrow" style={{ flex: 'none' }}>
            {pendingEntities.length} waiting
          </span>
        </div>
        {pendingEntities.length === 0 ? (
          <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
            Nothing waiting.
          </p>
        ) : (
          <ul className="admin-list">
            {pendingEntities.map((e) => (
              <li key={e.id} style={{ borderBottom: 'var(--hairline) solid var(--border)', padding: 'var(--s5) 0' }}>
                <p className="h4">
                  <Link href={`/admin/entities/${e.id}`}>{e.canonicalName}</Link>
                </p>
                <p className="prose measure" style={{ fontSize: 'var(--size-small)', marginTop: 'var(--s2)' }}>
                  {e.bottomLine}
                </p>
                {canReview && (
                  <DecisionForm
                    action={reviewEntity.bind(null, e.id)}
                    idPrefix={`entity-${e.id}`}
                    label="this entity"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
