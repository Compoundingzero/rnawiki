import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { entities, claims, correctionSubmissions, revisions, users } from '@/db/schema'
import { count, desc, eq, isNull, lt, or } from 'drizzle-orm'

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

/** Counts by publication status, as a specimen label rather than a row of tiles. */
function CountLabel({ rows, empty }: { rows: { status: string; total: number }[]; empty: string }) {
  if (rows.length === 0) return <p className="muted" style={{ fontSize: 'var(--size-small)' }}>{empty}</p>
  return (
    <dl className="speclabel">
      {rows.map((row) => (
        <div key={row.status} className="speclabel__row">
          <dt className="speclabel__key">{row.status.replace(/_/g, ' ')}</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {row.total}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default async function AdminDashboardPage() {
  const [{ entityCounts, claimCounts }, staleClaims, pendingCorrections, recentRevisions] = await Promise.all([
    getStatusCounts(),
    getStaleClaims(),
    getPendingCorrectionsCount(),
    getRecentRevisions(),
  ])

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <p className="eyebrow">Editorial workbench</p>
          <h1 className="h1" style={{ marginTop: 'var(--s2)' }}>
            Dashboard
          </h1>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 'var(--s6)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
        }}
      >
        <section>
          <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>
            Entities by status
          </p>
          <CountLabel rows={entityCounts} empty="No entities yet." />
        </section>

        <section>
          <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>
            Claims by status
          </p>
          <CountLabel rows={claimCounts} empty="No claims yet." />
        </section>

        <section>
          <p className="eyebrow" style={{ marginBottom: 'var(--s3)' }}>
            Queue
          </p>
          <dl className="speclabel">
            <div className="speclabel__row">
              <dt className="speclabel__key">Corrections pending</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                <Link href="/admin/corrections">{pendingCorrections}</Link>
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Stale claims</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                {staleClaims.length}
                {staleClaims.length === 25 ? '+' : ''}
              </dd>
            </div>
            <div className="speclabel__row">
              <dt className="speclabel__key">Revisions listed</dt>
              <dd className="speclabel__val" style={{ margin: 0 }}>
                {recentRevisions.length}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <hr className="rule" />

      <section>
        <div className="section-head">
          <h2 className="h2">Not reviewed in {STALE_DAYS}+ days</h2>
          <span className="eyebrow" style={{ flex: 'none' }}>
            {staleClaims.length}
            {staleClaims.length === 25 ? '+' : ''}
          </span>
        </div>
        {staleClaims.length === 0 ? (
          <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
            Nothing stale right now.
          </p>
        ) : (
          <table className="admin-table">
            <caption className="eyebrow" style={{ textAlign: 'left', paddingBottom: 'var(--s3)' }}>
              Claims whose last review predates the {STALE_DAYS}-day threshold
            </caption>
            <thead>
              <tr>
                <th scope="col">Entity</th>
                <th scope="col">Claim</th>
                <th scope="col">Status</th>
                <th scope="col">Last reviewed</th>
              </tr>
            </thead>
            <tbody>
              {staleClaims.map((c) => (
                <tr key={c.id}>
                  <td data-label="Entity">{c.entityName}</td>
                  <td data-label="Claim">
                    <Link href={`/admin/claims/${c.id}`}>{c.consumerQuestion}</Link>
                  </td>
                  <td data-label="Status">
                    <span className="tag" data-state={c.publicationStatus}>
                      {c.publicationStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td data-label="Last reviewed" style={{ fontFamily: 'var(--font-mono)' }}>
                    {c.lastReviewedAt ? c.lastReviewedAt.toISOString().slice(0, 10) : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <hr className="rule" />

      <section>
        <div className="section-head">
          <h2 className="h2">Recent revisions</h2>
        </div>
        {recentRevisions.length === 0 ? (
          <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
            No revisions recorded yet.
          </p>
        ) : (
          <table className="admin-table">
            <caption className="eyebrow" style={{ textAlign: 'left', paddingBottom: 'var(--s3)' }}>
              The 20 most recent field changes, from the revisions table
            </caption>
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">By</th>
                <th scope="col">Record</th>
                <th scope="col">Field</th>
                <th scope="col">New value</th>
              </tr>
            </thead>
            <tbody>
              {recentRevisions.map((r) => (
                <tr key={r.id}>
                  <td data-label="When" style={{ fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    {r.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
                  </td>
                  <td data-label="By">{r.changedByName}</td>
                  <td data-label="Record" style={{ fontFamily: 'var(--font-mono)' }}>
                    {r.reviewableType} #{r.reviewableId}
                  </td>
                  <td data-label="Field" style={{ fontFamily: 'var(--font-mono)' }}>
                    {r.fieldChanged}
                  </td>
                  <td data-label="New value" style={{ maxWidth: '22rem' }}>
                    {r.newValue ?? 'Not recorded'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
