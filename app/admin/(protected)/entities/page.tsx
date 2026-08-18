import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { entities } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { ENTITY_TYPE_LABELS, REGULATORY_CATEGORY_LABELS } from '@/lib/labels'

export const metadata: Metadata = { title: 'Entities', robots: { index: false, follow: false } }

async function getEntities() {
  return db
    .select({
      id: entities.id,
      canonicalName: entities.canonicalName,
      slug: entities.slug,
      entityType: entities.entityType,
      regulatoryCategory: entities.regulatoryCategory,
      publicationStatus: entities.publicationStatus,
      updatedAt: entities.updatedAt,
    })
    .from(entities)
    .orderBy(desc(entities.updatedAt))
}

export default async function AdminEntitiesPage() {
  const rows = await getEntities()

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div>
          <p className="eyebrow">{rows.length} records</p>
          <h1 className="h1" style={{ marginTop: 'var(--s2)' }}>
            Entities
          </h1>
        </div>
        <Link href="/admin/entities/new" className="btn btn--primary">
          New entity
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
          No entities yet.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Type</th>
              <th scope="col">Regulatory category</th>
              <th scope="col">Status</th>
              <th scope="col">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td data-label="Name">
                  <Link href={`/admin/entities/${e.id}`}>{e.canonicalName}</Link>
                  <span className="admin-table__sub">/r/{e.slug}</span>
                </td>
                <td data-label="Type">{ENTITY_TYPE_LABELS[e.entityType]}</td>
                <td data-label="Regulatory">{REGULATORY_CATEGORY_LABELS[e.regulatoryCategory]}</td>
                <td data-label="Status">
                  <span className="tag" data-state={e.publicationStatus}>
                    {e.publicationStatus.replace(/_/g, ' ')}
                  </span>
                </td>
                <td data-label="Updated" style={{ fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  {e.updatedAt.toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
