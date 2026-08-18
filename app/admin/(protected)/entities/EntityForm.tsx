import { entityTypeEnum, regulatoryCategoryEnum, publicationStatusEnum } from '@/db/schema'
import { ENTITY_TYPE_LABELS, REGULATORY_CATEGORY_LABELS } from '@/lib/labels'

// Publication status has no shared label map — it is workflow vocabulary that never
// reaches a reader. Entity type and regulatory category do, so those come from
// lib/labels.ts rather than being re-derived here ("Rna treatment" was the tell).
function humanize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
}

export interface EntityFormValues {
  canonicalName: string
  slug: string
  aliases: string // comma-separated
  entityType: string
  shortDescription: string
  bottomLine: string
  regulatoryCategory: string
  accessRealityNote: string
  publicationStatus: string
}

export function EntityForm({
  action,
  values,
  canPublish,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>
  values: EntityFormValues
  canPublish: boolean
  submitLabel: string
}) {
  return (
    <form action={action} className="admin-form">
      <div className="admin-field">
        <label htmlFor="canonicalName" className="admin-label">
          Canonical name
        </label>
        <input id="canonicalName" name="canonicalName" defaultValue={values.canonicalName} required className="field" />
      </div>

      <div className="admin-field">
        <label htmlFor="slug" className="admin-label">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={values.slug}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          aria-describedby="slug-help"
          className="field"
        />
        <p id="slug-help" className="admin-help">
          Lowercase letters, numbers, and hyphens only. This becomes /r/&#123;slug&#125;.
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor="aliases" className="admin-label">
          Aliases
        </label>
        <input
          id="aliases"
          name="aliases"
          defaultValue={values.aliases}
          aria-describedby="aliases-help"
          className="field"
        />
        <p id="aliases-help" className="admin-help">
          Comma-separated, e.g. &quot;BPC157, PL 14736&quot;.
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor="entityType" className="admin-label">
          Entity type
        </label>
        <select id="entityType" name="entityType" defaultValue={values.entityType} required className="field">
          {entityTypeEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {ENTITY_TYPE_LABELS[v]}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-field">
        <label htmlFor="regulatoryCategory" className="admin-label">
          Regulatory category
        </label>
        <select
          id="regulatoryCategory"
          name="regulatoryCategory"
          defaultValue={values.regulatoryCategory}
          required
          className="field"
        >
          {regulatoryCategoryEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {REGULATORY_CATEGORY_LABELS[v]}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-field">
        <label htmlFor="shortDescription" className="admin-label">
          Short description
        </label>
        <textarea
          id="shortDescription"
          name="shortDescription"
          defaultValue={values.shortDescription}
          required
          className="field"
        />
      </div>

      <div className="admin-field">
        <label htmlFor="bottomLine" className="admin-label">
          Bottom line
        </label>
        <textarea
          id="bottomLine"
          name="bottomLine"
          defaultValue={values.bottomLine}
          required
          aria-describedby="bottomLine-help"
          className="field"
        />
        <p id="bottomLine-help" className="admin-help">
          2–3 sentences. The caveat must live in the same sentence as the claim.
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor="accessRealityNote" className="admin-label">
          Access reality note
        </label>
        <textarea
          id="accessRealityNote"
          name="accessRealityNote"
          defaultValue={values.accessRealityNote}
          aria-describedby="accessRealityNote-help"
          className="field"
        />
        <p id="accessRealityNote-help" className="admin-help">
          Delivery burden context only — never self-use or procurement instructions.
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor="publicationStatus" className="admin-label">
          Publication status
        </label>
        <select
          id="publicationStatus"
          name="publicationStatus"
          defaultValue={values.publicationStatus}
          required
          aria-describedby={canPublish ? undefined : 'publicationStatus-help'}
          className="field"
        >
          {publicationStatusEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {humanize(v)}
            </option>
          ))}
        </select>
        {!canPublish && (
          <p id="publicationStatus-help" className="admin-help">
            Only administrators can move status to &quot;published&quot; (enforced on save, not just in this menu).
            Use &quot;approved&quot; and ask an administrator to publish.
          </p>
        )}
      </div>

      <div className="admin-actions">
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
