import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { entities, regulatoryStatuses, claims, regulatoryCategoryEnum, publicationStatusEnum } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/auth'
import {
  updateEntity,
  publishEntity,
  addRegulatoryStatus,
  updateRegulatoryStatus,
  deleteRegulatoryStatus,
} from '../actions'
import { EntityForm } from '../EntityForm'
import * as ui from '@/lib/admin/ui'

export const metadata: Metadata = { title: 'Edit entity', robots: { index: false, follow: false } }

function humanize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
}

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function EditEntityPage({ params, searchParams }: Props) {
  const [{ id }, { error, success }, user] = await Promise.all([params, searchParams, getCurrentUser()])
  const entityId = Number.parseInt(id, 10)
  if (!Number.isFinite(entityId)) notFound()

  const [entity] = await db.select().from(entities).where(eq(entities.id, entityId)).limit(1)
  if (!entity) notFound()

  const [regStatuses, entityClaims] = await Promise.all([
    db.select().from(regulatoryStatuses).where(eq(regulatoryStatuses.entityId, entityId)).orderBy(desc(regulatoryStatuses.checkedDate)),
    db
      .select({ id: claims.id, slug: claims.slug, consumerQuestion: claims.consumerQuestion, publicationStatus: claims.publicationStatus })
      .from(claims)
      .where(eq(claims.entityId, entityId))
      .orderBy(claims.displayPriority),
  ])

  const isAdmin = user?.role === 'administrator'

  return (
    <div style={ui.page}>
      <p style={{ marginBottom: 'var(--space-2)' }}>
        <Link href="/admin/entities">← Entities</Link>
      </p>
      <div style={{ ...ui.flexRow, justifyContent: 'space-between' }}>
        <h1 style={ui.h1}>{entity.canonicalName}</h1>
        <span style={ui.statusBadgeStyle(entity.publicationStatus)}>{entity.publicationStatus.replace(/_/g, ' ')}</span>
      </div>

      {error && <p style={ui.errorBanner}>{error}</p>}
      {success && <p style={ui.successBanner}>{success}</p>}

      {isAdmin && entity.publicationStatus === 'approved' && (
        <form action={publishEntity.bind(null, entity.id)} style={{ marginBottom: 'var(--space-6)' }}>
          <button type="submit" style={ui.buttonPrimary}>
            Publish this entity
          </button>
        </form>
      )}

      <section style={ui.sectionCard}>
        <h2 style={ui.h2}>Details</h2>
        <EntityForm
          action={updateEntity.bind(null, entity.id)}
          canPublish={isAdmin}
          submitLabel="Save changes"
          values={{
            canonicalName: entity.canonicalName,
            slug: entity.slug,
            aliases: entity.aliases.join(', '),
            entityType: entity.entityType,
            shortDescription: entity.shortDescription,
            bottomLine: entity.bottomLine,
            regulatoryCategory: entity.regulatoryCategory,
            accessRealityNote: entity.accessRealityNote ?? '',
            publicationStatus: entity.publicationStatus,
          }}
        />
      </section>

      <section style={ui.sectionCard}>
        <h2 style={ui.h2}>Regulatory statuses</h2>
        {regStatuses.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)' }}>No jurisdictions recorded yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            {regStatuses.map((rs) => (
              <details key={rs.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                  {rs.jurisdiction} — {humanize(rs.legalCategory)} (checked {rs.checkedDate.toISOString().slice(0, 10)})
                </summary>
                <form action={updateRegulatoryStatus.bind(null, rs.id)} style={{ marginTop: 'var(--space-3)' }}>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`jurisdiction-${rs.id}`}>
                      Jurisdiction
                    </label>
                    <input id={`jurisdiction-${rs.id}`} name="jurisdiction" defaultValue={rs.jurisdiction} required style={ui.input} />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`legalCategory-${rs.id}`}>
                      Legal category
                    </label>
                    <select id={`legalCategory-${rs.id}`} name="legalCategory" defaultValue={rs.legalCategory} required style={ui.select}>
                      {regulatoryCategoryEnum.enumValues.map((v) => (
                        <option key={v} value={v}>
                          {humanize(v)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`approvedIndications-${rs.id}`}>
                      Approved indications
                    </label>
                    <input id={`approvedIndications-${rs.id}`} name="approvedIndications" defaultValue={rs.approvedIndications ?? ''} style={ui.input} />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`statusStatement-${rs.id}`}>
                      Status statement
                    </label>
                    <textarea id={`statusStatement-${rs.id}`} name="statusStatement" defaultValue={rs.statusStatement} required style={ui.textareaSmall} />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`source-${rs.id}`}>
                      Source URL
                    </label>
                    <input id={`source-${rs.id}`} name="source" type="url" defaultValue={rs.source} required style={ui.input} />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`checkedDate-${rs.id}`}>
                      Checked date
                    </label>
                    <input
                      id={`checkedDate-${rs.id}`}
                      name="checkedDate"
                      type="date"
                      defaultValue={rs.checkedDate.toISOString().slice(0, 10)}
                      required
                      style={ui.input}
                    />
                  </div>
                  <div style={ui.fieldWrap}>
                    <label style={ui.label} htmlFor={`reviewStatus-${rs.id}`}>
                      Review status
                    </label>
                    <select id={`reviewStatus-${rs.id}`} name="reviewStatus" defaultValue={rs.reviewStatus} required style={ui.select}>
                      {publicationStatusEnum.enumValues.map((v) => (
                        <option key={v} value={v}>
                          {humanize(v)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={ui.flexRow}>
                    <button type="submit" style={ui.buttonSecondary}>
                      Save
                    </button>
                  </div>
                </form>
                <form action={deleteRegulatoryStatus.bind(null, rs.id)} style={{ marginTop: 'var(--space-2)' }}>
                  <button type="submit" style={ui.buttonDanger}>
                    Remove this jurisdiction
                  </button>
                </form>
              </details>
            ))}
          </div>
        )}

        <h3 style={{ fontSize: '0.95rem' }}>Add a jurisdiction</h3>
        <form action={addRegulatoryStatus.bind(null, entity.id)}>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-jurisdiction">
              Jurisdiction
            </label>
            <input id="new-jurisdiction" name="jurisdiction" required style={ui.input} placeholder="e.g. United States" />
          </div>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-legalCategory">
              Legal category
            </label>
            <select id="new-legalCategory" name="legalCategory" required style={ui.select} defaultValue={regulatoryCategoryEnum.enumValues[0]}>
              {regulatoryCategoryEnum.enumValues.map((v) => (
                <option key={v} value={v}>
                  {humanize(v)}
                </option>
              ))}
            </select>
          </div>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-approvedIndications">
              Approved indications
            </label>
            <input id="new-approvedIndications" name="approvedIndications" style={ui.input} />
          </div>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-statusStatement">
              Status statement
            </label>
            <textarea id="new-statusStatement" name="statusStatement" required style={ui.textareaSmall} />
          </div>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-source">
              Source URL
            </label>
            <input id="new-source" name="source" type="url" required style={ui.input} />
          </div>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-checkedDate">
              Checked date
            </label>
            <input id="new-checkedDate" name="checkedDate" type="date" required style={ui.input} />
          </div>
          <div style={ui.fieldWrap}>
            <label style={ui.label} htmlFor="new-reviewStatus">
              Review status
            </label>
            <select id="new-reviewStatus" name="reviewStatus" required style={ui.select} defaultValue="draft">
              {publicationStatusEnum.enumValues.map((v) => (
                <option key={v} value={v}>
                  {humanize(v)}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" style={ui.buttonSecondary}>
            Add jurisdiction
          </button>
        </form>
      </section>

      <section style={ui.sectionCard}>
        <div style={{ ...ui.flexRow, justifyContent: 'space-between' }}>
          <h2 style={{ ...ui.h2, margin: 0 }}>Claims for this entity ({entityClaims.length})</h2>
          <Link href={`/admin/claims/new?entityId=${entity.id}`} style={ui.buttonSecondary}>
            New claim
          </Link>
        </div>
        {entityClaims.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)', marginTop: 'var(--space-3)' }}>No claims yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 'var(--space-3) 0 0', padding: 0, display: 'grid', gap: 'var(--space-2)' }}>
            {entityClaims.map((c) => (
              <li key={c.id} style={ui.flexRow}>
                <Link href={`/admin/claims/${c.id}`}>{c.consumerQuestion}</Link>
                <span style={ui.statusBadgeStyle(c.publicationStatus)}>{c.publicationStatus.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
