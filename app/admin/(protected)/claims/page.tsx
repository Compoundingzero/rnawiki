import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { claims, entities, publicationStatusEnum } from '@/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import * as ui from '@/lib/admin/ui'

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
    <div style={ui.page}>
      <div style={{ ...ui.flexRow, justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <h1 style={{ ...ui.h1, margin: 0 }}>Claims ({rows.length})</h1>
        <Link href="/admin/claims/new" style={ui.buttonPrimary}>
          New claim
        </Link>
      </div>

      <form method="GET" style={{ ...ui.flexRow, marginBottom: 'var(--space-6)' }}>
        <div>
          <label htmlFor="entityId" style={ui.label}>
            Entity
          </label>
          <select id="entityId" name="entityId" defaultValue={entityId ?? ''} style={ui.select}>
            <option value="">All entities</option>
            {entityOptions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.canonicalName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" style={ui.label}>
            Status
          </label>
          <select id="status" name="status" defaultValue={status ?? ''} style={ui.select}>
            <option value="">All statuses</option>
            {publicationStatusEnum.enumValues.map((v) => (
              <option key={v} value={v}>
                {v.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" style={{ ...ui.buttonSecondary, alignSelf: 'end' }}>
          Filter
        </button>
        {(entityId || status) && (
          <Link href="/admin/claims" style={{ alignSelf: 'end', fontSize: '0.85rem' }}>
            Clear filters
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <p style={{ color: 'var(--color-text-faint)' }}>No claims match these filters.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={ui.th}>Entity</th>
                <th style={ui.th}>Question</th>
                <th style={ui.th}>Type</th>
                <th style={ui.th}>Proof Boundary</th>
                <th style={ui.th}>Status</th>
                <th style={ui.th}>Last reviewed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td style={ui.td}>
                    <Link href={`/admin/claims?entityId=${c.entityId}`}>{c.entityName}</Link>
                  </td>
                  <td style={ui.td}>
                    <Link href={`/admin/claims/${c.id}`}>{c.consumerQuestion}</Link>
                  </td>
                  <td style={ui.td}>{c.claimType.replace(/_/g, ' ')}</td>
                  <td style={ui.td}>{PROOF_BOUNDARY_LABELS[c.proofBoundaryStage]}</td>
                  <td style={ui.td}>
                    <span style={ui.statusBadgeStyle(c.publicationStatus)}>{c.publicationStatus.replace(/_/g, ' ')}</span>
                  </td>
                  <td style={ui.td}>{c.lastReviewedAt ? c.lastReviewedAt.toISOString().slice(0, 10) : 'never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
