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
import { ENTITY_TYPE_LABELS, REGULATORY_CATEGORY_LABELS } from '@/lib/labels'

export const metadata: Metadata = { title: 'Edit entity', robots: { index: false, follow: false } }

/** Workflow-only vocabulary (publication/review status) — never shown to a reader. */
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
    <div className="admin-page">
      <p className="metaline" style={{ marginBottom: 'var(--s4)' }}>
        <Link href="/admin/entities">← Entities</Link>
      </p>

      <div className="admin-head">
        <div>
          <p className="eyebrow">Entity record · {ENTITY_TYPE_LABELS[entity.entityType]}</p>
          <h1 className="h1" style={{ marginTop: 'var(--s2)' }}>
            {entity.canonicalName}
          </h1>
          <p className="metaline" style={{ marginTop: 'var(--s2)' }}>
            <span>/r/{entity.slug}</span>
            <span>Updated {entity.updatedAt.toISOString().slice(0, 10)}</span>
          </p>
        </div>
        <span className="tag" data-state={entity.publicationStatus}>
          {entity.publicationStatus.replace(/_/g, ' ')}
        </span>
      </div>

      {error && (
        <div className="callout" data-tone="danger" role="alert" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Not saved</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{error}</p>
        </div>
      )}
      {success && (
        <div className="callout" role="status" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Saved</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{success}</p>
        </div>
      )}

      {isAdmin && entity.publicationStatus === 'approved' && (
        <form action={publishEntity.bind(null, entity.id)} style={{ marginBottom: 'var(--s5)' }}>
          <button type="submit" className="btn btn--primary">
            Publish this entity
          </button>
        </form>
      )}

      <section>
        <div className="section-head">
          <h2 className="h2">Details</h2>
        </div>
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

      <hr className="rule" />

      <section>
        <div className="section-head">
          <h2 className="h2">Regulatory statuses</h2>
          <span className="eyebrow" style={{ flex: 'none' }}>
            {regStatuses.length} recorded
          </span>
        </div>

        {regStatuses.length === 0 ? (
          <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
            No jurisdictions recorded yet.
          </p>
        ) : (
          <ul className="admin-list">
            {regStatuses.map((rs) => (
              <li key={rs.id}>
                <details className="admin-disclosure">
                  <summary>
                    <span>{rs.jurisdiction}</span>
                    <span className="eyebrow">
                      {REGULATORY_CATEGORY_LABELS[rs.legalCategory]} · checked {rs.checkedDate.toISOString().slice(0, 10)}
                    </span>
                  </summary>
                  <div className="admin-disclosure__body">
                    <form action={updateRegulatoryStatus.bind(null, rs.id)} className="admin-form">
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`jurisdiction-${rs.id}`}>
                          Jurisdiction
                        </label>
                        <input id={`jurisdiction-${rs.id}`} name="jurisdiction" defaultValue={rs.jurisdiction} required className="field" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`legalCategory-${rs.id}`}>
                          Legal category
                        </label>
                        <select id={`legalCategory-${rs.id}`} name="legalCategory" defaultValue={rs.legalCategory} required className="field">
                          {regulatoryCategoryEnum.enumValues.map((v) => (
                            <option key={v} value={v}>
                              {REGULATORY_CATEGORY_LABELS[v]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`approvedIndications-${rs.id}`}>
                          Approved indications
                        </label>
                        <input id={`approvedIndications-${rs.id}`} name="approvedIndications" defaultValue={rs.approvedIndications ?? ''} className="field" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`statusStatement-${rs.id}`}>
                          Status statement
                        </label>
                        <textarea id={`statusStatement-${rs.id}`} name="statusStatement" defaultValue={rs.statusStatement} required className="field" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`source-${rs.id}`}>
                          Source URL
                        </label>
                        <input id={`source-${rs.id}`} name="source" type="url" defaultValue={rs.source} required className="field" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`checkedDate-${rs.id}`}>
                          Checked date
                        </label>
                        <input
                          id={`checkedDate-${rs.id}`}
                          name="checkedDate"
                          type="date"
                          defaultValue={rs.checkedDate.toISOString().slice(0, 10)}
                          required
                          className="field"
                        />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label" htmlFor={`reviewStatus-${rs.id}`}>
                          Review status
                        </label>
                        <select id={`reviewStatus-${rs.id}`} name="reviewStatus" defaultValue={rs.reviewStatus} required className="field">
                          {publicationStatusEnum.enumValues.map((v) => (
                            <option key={v} value={v}>
                              {humanize(v)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="admin-actions">
                        <button type="submit" className="btn">
                          Save jurisdiction
                        </button>
                      </div>
                    </form>
                    <form action={deleteRegulatoryStatus.bind(null, rs.id)}>
                      <button type="submit" className="btn btn--danger">
                        Remove this jurisdiction
                      </button>
                    </form>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}

        <h3 className="h4" style={{ margin: 'var(--s6) 0 var(--s4)' }}>
          Add a jurisdiction
        </h3>
        <form action={addRegulatoryStatus.bind(null, entity.id)} className="admin-form">
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-jurisdiction">
              Jurisdiction
            </label>
            <input id="new-jurisdiction" name="jurisdiction" required className="field" placeholder="e.g. United States" />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-legalCategory">
              Legal category
            </label>
            <select id="new-legalCategory" name="legalCategory" required className="field" defaultValue={regulatoryCategoryEnum.enumValues[0]}>
              {regulatoryCategoryEnum.enumValues.map((v) => (
                <option key={v} value={v}>
                  {REGULATORY_CATEGORY_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-approvedIndications">
              Approved indications
            </label>
            <input id="new-approvedIndications" name="approvedIndications" className="field" />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-statusStatement">
              Status statement
            </label>
            <textarea id="new-statusStatement" name="statusStatement" required className="field" />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-source">
              Source URL
            </label>
            <input id="new-source" name="source" type="url" required className="field" />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-checkedDate">
              Checked date
            </label>
            <input id="new-checkedDate" name="checkedDate" type="date" required className="field" />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="new-reviewStatus">
              Review status
            </label>
            <select id="new-reviewStatus" name="reviewStatus" required className="field" defaultValue="draft">
              {publicationStatusEnum.enumValues.map((v) => (
                <option key={v} value={v}>
                  {humanize(v)}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-actions">
            <button type="submit" className="btn">
              Add jurisdiction
            </button>
          </div>
        </form>
      </section>

      <hr className="rule" />

      <section>
        <div className="section-head">
          <h2 className="h2">Claims</h2>
          <Link href={`/admin/claims/new?entityId=${entity.id}`} style={{ flex: 'none', fontSize: 'var(--size-small)' }}>
            New claim →
          </Link>
        </div>
        {entityClaims.length === 0 ? (
          <p className="muted" style={{ fontSize: 'var(--size-small)' }}>
            No claims yet.
          </p>
        ) : (
          <ul className="rows">
            {entityClaims.map((c) => (
              <li key={c.id} className="row">
                <Link href={`/admin/claims/${c.id}`} className="row__link">
                  <div>
                    <span className="eyebrow">{c.slug}</span>
                    <div className="row__name" style={{ marginTop: '0.15rem', fontSize: 'var(--size-body)' }}>
                      {c.consumerQuestion}
                    </div>
                  </div>
                  <span className="tag" data-state={c.publicationStatus}>
                    {c.publicationStatus.replace(/_/g, ' ')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
