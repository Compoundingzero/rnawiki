import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { entities, claims, correctionSubmissions, revisions, users } from '@/db/schema'
import { count, desc, eq, isNull, lt, or } from 'drizzle-orm'
import * as ui from '@/lib/admin/ui'

export const metadata: Metadata = { title: 'Admin dashboard', robots: { index: false, follow: false } }

const STALE_DAYS = 180

async function getStatusCounts() {
  const [entityCounts, claimCounts] = await Promise.all([
    db.select({ status: entities.publicationStatus, total: count() }).from(entities).groupBy(entities.publicationStatus),
    db.select({ status: claims.publicationStatus, total: count() }).from(claims).groupBy(claims.publicationStatus),
  ])
  return { entityCounts, claimCounts }
}

async function getStaleClaims() {
  const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000)
  return db
    .select({
      id: claims.id,
      slug: claims.slug,
      consumerQuestion: claims.consumerQuestion,
      lastReviewedAt: claims.lastReviewedAt,
      publicationStatus: claims.publicationStatus,
      entityName: entities.canonicalName,
      entitySlug: entities.slug,
    })
    .from(claims)
    .innerJoin(entities, eq(claims.entityId, entities.id))
    .where(or(isNull(claims.lastReviewedAt), lt(claims.lastReviewedAt, cutoff)))
    .orderBy(claims.lastReviewedAt)
    .limit(25)
}

async function getPendingCorrectionsCount() {
  const [row] = await db
    .select({ total: count() })
    .from(correctionSubmissions)
    .where(eq(correctionSubmissions.moderationStatus, 'pending'))
  return row?.total ?? 0
}

async function getRecentRevisions() {
  return db
    .select({
      id: revisions.id,
      reviewableType: revisions.reviewableType,
      reviewableId: revisions.reviewableId,
      fieldChanged: revisions.fieldChanged,
      newValue: revisions.newValue,
      createdAt: revisions.createdAt,
      changedByName: users.name,
    })
    .from(revisions)
    .innerJoin(users, eq(revisions.changedByUserId, users.id))
    .orderBy(desc(revisions.createdAt))
    .limit(20)
}

export default async function AdminDashboardPage() {
  const [{ entityCounts, claimCounts }, staleClaims, pendingCorrections, recentRevisions] = await Promise.all([
    getStatusCounts(),
    getStaleClaims(),
    getPendingCorrectionsCount(),
    getRecentRevisions(),
  ])

  return (
    <div style={ui.page}>
      <h1 style={ui.h1}>Dashboard</h1>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={ui.h2}>Entities by status</h2>
        <div style={ui.statGrid}>
          {entityCounts.length === 0 && <p style={{ color: 'var(--color-text-faint)' }}>No entities yet.</p>}
          {entityCounts.map((row) => (
            <div key={row.status} style={ui.statTile}>
              <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>{row.total}</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                {row.status.replace(/_/g, ' ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={ui.h2}>Claims by status</h2>
        <div style={ui.statGrid}>
          {claimCounts.length === 0 && <p style={{ color: 'var(--color-text-faint)' }}>No claims yet.</p>}
          {claimCounts.map((row) => (
            <div key={row.status} style={ui.statTile}>
              <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>{row.total}</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                {row.status.replace(/_/g, ' ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={ui.h2}>
          Pending corrections:{' '}
          <Link href="/admin/corrections" style={{ color: 'var(--color-accent-strong)' }}>
            {pendingCorrections}
          </Link>
        </h2>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={ui.h2}>
          Claims not reviewed in {STALE_DAYS}+ days ({staleClaims.length}{staleClaims.length === 25 ? '+' : ''})
        </h2>
        {staleClaims.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)' }}>Nothing stale right now.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={ui.table}>
              <thead>
                <tr>
                  <th style={ui.th}>Entity</th>
                  <th style={ui.th}>Claim</th>
                  <th style={ui.th}>Status</th>
                  <th style={ui.th}>Last reviewed</th>
                </tr>
              </thead>
              <tbody>
                {staleClaims.map((c) => (
                  <tr key={c.id}>
                    <td style={ui.td}>{c.entityName}</td>
                    <td style={ui.td}>
                      <Link href={`/admin/claims/${c.id}`}>{c.consumerQuestion}</Link>
                    </td>
                    <td style={ui.td}>
                      <span style={ui.statusBadgeStyle(c.publicationStatus)}>
                        {c.publicationStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={ui.td}>
                      {c.lastReviewedAt ? c.lastReviewedAt.toISOString().slice(0, 10) : 'never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 style={ui.h2}>Recent revisions</h2>
        {recentRevisions.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)' }}>No revisions recorded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={ui.table}>
              <thead>
                <tr>
                  <th style={ui.th}>When</th>
                  <th style={ui.th}>By</th>
                  <th style={ui.th}>Type</th>
                  <th style={ui.th}>Field</th>
                  <th style={ui.th}>New value</th>
                </tr>
              </thead>
              <tbody>
                {recentRevisions.map((r) => (
                  <tr key={r.id}>
                    <td style={ui.td}>{r.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
                    <td style={ui.td}>{r.changedByName}</td>
                    <td style={ui.td}>
                      {r.reviewableType} #{r.reviewableId}
                    </td>
                    <td style={ui.td}>{r.fieldChanged}</td>
                    <td style={{ ...ui.td, maxWidth: '24rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.newValue ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
