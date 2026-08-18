import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/db'
import { entities } from '@/db/schema'
import { desc } from 'drizzle-orm'
import * as ui from '@/lib/admin/ui'

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
    <div style={ui.page}>
      <div style={{ ...ui.flexRow, justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ ...ui.h1, margin: 0 }}>Entities ({rows.length})</h1>
        <Link href="/admin/entities/new" style={ui.buttonPrimary}>
          New entity
        </Link>
      </div>

      {rows.length === 0 ? (
        <p style={{ color: 'var(--color-text-faint)' }}>No entities yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={ui.table}>
            <thead>
              <tr>
                <th style={ui.th}>Name</th>
                <th style={ui.th}>Type</th>
                <th style={ui.th}>Regulatory category</th>
                <th style={ui.th}>Status</th>
                <th style={ui.th}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td style={ui.td}>
                    <Link href={`/admin/entities/${e.id}`}>{e.canonicalName}</Link>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-faint)' }}>/{e.slug}</div>
                  </td>
                  <td style={ui.td}>{e.entityType.replace(/_/g, ' ')}</td>
                  <td style={ui.td}>{e.regulatoryCategory.replace(/_/g, ' ')}</td>
                  <td style={ui.td}>
                    <span style={ui.statusBadgeStyle(e.publicationStatus)}>{e.publicationStatus.replace(/_/g, ' ')}</span>
                  </td>
                  <td style={ui.td}>{e.updatedAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
