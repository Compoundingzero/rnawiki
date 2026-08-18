import { entityTypeEnum, regulatoryCategoryEnum, publicationStatusEnum } from '@/db/schema'
import * as ui from '@/lib/admin/ui'

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
    <form action={action}>
      <div style={ui.fieldWrap}>
        <label htmlFor="canonicalName" style={ui.label}>
          Canonical name
        </label>
        <input id="canonicalName" name="canonicalName" defaultValue={values.canonicalName} required style={ui.input} />
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="slug" style={ui.label}>
          Slug
        </label>
        <input id="slug" name="slug" defaultValue={values.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" style={ui.input} />
        <p style={ui.helpText}>Lowercase letters, numbers, and hyphens only. This becomes /r/&#123;slug&#125;.</p>
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="aliases" style={ui.label}>
          Aliases
        </label>
        <input id="aliases" name="aliases" defaultValue={values.aliases} style={ui.input} />
        <p style={ui.helpText}>Comma-separated, e.g. &quot;BPC157, PL 14736&quot;.</p>
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="entityType" style={ui.label}>
          Entity type
        </label>
        <select id="entityType" name="entityType" defaultValue={values.entityType} required style={ui.select}>
          {entityTypeEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {humanize(v)}
            </option>
          ))}
        </select>
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="regulatoryCategory" style={ui.label}>
          Regulatory category
        </label>
        <select id="regulatoryCategory" name="regulatoryCategory" defaultValue={values.regulatoryCategory} required style={ui.select}>
          {regulatoryCategoryEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {humanize(v)}
            </option>
          ))}
        </select>
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="shortDescription" style={ui.label}>
          Short description
        </label>
        <textarea id="shortDescription" name="shortDescription" defaultValue={values.shortDescription} required style={ui.textareaSmall} />
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="bottomLine" style={ui.label}>
          Bottom line
        </label>
        <textarea id="bottomLine" name="bottomLine" defaultValue={values.bottomLine} required style={ui.textareaSmall} />
        <p style={ui.helpText}>2–3 sentences. The caveat must live in the same sentence as the claim.</p>
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="accessRealityNote" style={ui.label}>
          Access reality note
        </label>
        <textarea id="accessRealityNote" name="accessRealityNote" defaultValue={values.accessRealityNote} style={ui.textareaSmall} />
        <p style={ui.helpText}>Delivery burden context only — never self-use or procurement instructions.</p>
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="publicationStatus" style={ui.label}>
          Publication status
        </label>
        <select id="publicationStatus" name="publicationStatus" defaultValue={values.publicationStatus} required style={ui.select}>
          {publicationStatusEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {humanize(v)}
            </option>
          ))}
        </select>
        {!canPublish && (
          <p style={ui.helpText}>
            Only administrators can move status to &quot;published&quot; (enforced on save, not just in this menu).
            Use &quot;approved&quot; and ask an administrator to publish.
          </p>
        )}
      </div>

      <button type="submit" style={ui.buttonPrimary}>
        {submitLabel}
      </button>
    </form>
  )
}
