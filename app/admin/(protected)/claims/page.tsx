import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { claims, entities, publicationStatusEnum } from '@/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { PROOF_BOUNDARY_LABELS, stageRank, PROOF_BOUNDARY_STAGES } from '@/lib/evidence'

export const metadata: Metadata = { title: 'Claims', robots: { index: false, follow: false } }

interface Props {
  searchParams: Promise<{ entityId?: string; status?: string }>
}

async function getEntityOptions() {
  return db.select({ id: entities.id, canonicalName: entities.canonicalName }).from(entities).orderBy(entities.canonicalName)
}

async function getClaims(entityId?: number, status?: string) {
  const conditions = []
  if (entityId) conditions.push(eq(claims.entityId, entityId))
  if (status) conditions.push(eq(claims.publicationStatus, status as (typeof publicationStatusEnum.enumValues)[number]))
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  return db
    .select({
      id: claims.id,
      consumerQuestion: claims.consumerQuestion,
      claimType: claims.claimType,
      proofBoundaryStage: claims.proofBoundaryStage,
      publicationStatus: claims.publicationStatus,
      lastReviewedAt: claims.lastReviewedAt,
      entityName: entities.canonicalName,
      entityId: entities.id,
    })
    .from(claims)
    .innerJoin(entities, eq(claims.entityId, entities.id))
    .where(whereClause)
    .orderBy(desc(claims.updatedAt))
}

export default async function AdminClaimsPage({ searchParams }: Props) {
  const { entityId, status } = await searchParams
  const entityIdNum = entityId ? Number.parseInt(entityId, 10) : undefined

  const [rows, entityOptions] = await Promise.all([
    getClaims(Number.isFinite(entityIdNum) ? entityIdNum : undefined, status),
    getEntityOptions(),
  ])

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <p className="eyebrow">{rows.length} records</p>
          <h1 className="h1" style={{ marginTop: 'var(--s2)' }}>
            Claims
          </h1>
        </div>
        <Link href="/admin/claims/new" className="btn btn--primary">
          New claim
        </Link>
      </div>

      <form method="GET" className="admin-form admin-form--inline" style={{ marginBottom: 'var(--s6)' }}>
        <div className="admin-field">
          <label htmlFor="entityId" className="admin-label">
            Entity
          </label>
          <select id="entityId" name="entityId" defaultValue={entityId ?? ''} className="field">
            <option value="">All entities</option>
            {entityOptions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.canonicalName}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="status" className="admin-label">
            Status
          </label>
          <select id="status" name="status" defaultValue={status ?? ''} className="field">
            <option value="">All statuses</option>
            {publicationStatusEnum.enumValues.map((v) => (
              <option key={v} value={v}>
                {v.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-actions">
          <button type="submit" className="btn">
            Filter
          </button>
          {(entityId || status) && <Link href="/admin/claims">Clear</Link>}
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
          No claims match these filters.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Entity</th>
              <th scope="col">Question</th>
              <th scope="col">Type</th>
              <th scope="col">Proof Boundary</th>
              <th scope="col">Status</th>
              <th scope="col">Last reviewed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td data-label="Entity">
                  <Link href={`/admin/claims?entityId=${c.entityId}`}>{c.entityName}</Link>
                </td>
                <td data-label="Question">
                  <Link href={`/admin/claims/${c.id}`}>{c.consumerQuestion}</Link>
                </td>
                <td data-label="Type">{c.claimType.replace(/_/g, ' ')}</td>
                <td data-label="Boundary">
                  {PROOF_BOUNDARY_LABELS[c.proofBoundaryStage]}
                  <span className="admin-table__sub">
                    stage {stageRank(c.proofBoundaryStage) + 1} of {PROOF_BOUNDARY_STAGES.length}
                  </span>
                </td>
                <td data-label="Status">
                  <span className="tag" data-state={c.publicationStatus}>
                    {c.publicationStatus.replace(/_/g, ' ')}
                  </span>
                </td>
                <td data-label="Reviewed" style={{ fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  {c.lastReviewedAt ? c.lastReviewedAt.toISOString().slice(0, 10) : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
