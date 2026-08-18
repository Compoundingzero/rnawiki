import { claimTypeEnum, publicationStatusEnum } from '@/db/schema'
import { PROOF_BOUNDARY_STAGES, PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import * as ui from '@/lib/admin/ui'

function humanize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
}

export interface ClaimFormValues {
  entityId: number | ''
  slug: string
  claimType: string
  consumerQuestion: string
  directAnswer: string
  measuredFinding: string
  inference: string
  proofBoundaryStage: string
  proofBoundaryExplanation: string
  remainingUnknown: string
  evidenceNeededNext: string
  mechanismSummary: string
  outcomeSummary: string
  publicationStatus: string
  displayPriority: number
}

export interface EntityOption {
  id: number
  canonicalName: string
}

export function ClaimForm({
  action,
  values,
  entityOptions,
  canPublish,
  submitLabel,
  lockEntity,
}: {
  action: (formData: FormData) => void | Promise<void>
  values: ClaimFormValues
  entityOptions: EntityOption[]
  canPublish: boolean
  submitLabel: string
  lockEntity?: boolean
}) {
  return (
    <form action={action}>
      <div style={ui.fieldWrap}>
        <label htmlFor="entityId" style={ui.label}>
          Entity
        </label>
        <select id="entityId" name="entityId" defaultValue={values.entityId} required disabled={lockEntity} style={ui.select}>
          <option value="" disabled>
            Choose an entity…
          </option>
          {entityOptions.map((e) => (
            <option key={e.id} value={e.id}>
              {e.canonicalName}
            </option>
          ))}
        </select>
        {lockEntity && <p style={ui.helpText}>Entity cannot be changed after creation from this form.</p>}
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="slug" style={ui.label}>
          Slug
        </label>
        <input id="slug" name="slug" defaultValue={values.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" style={ui.input} />
        <p style={ui.helpText}>Unique per entity, e.g. &quot;tendon-healing&quot;.</p>
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="claimType" style={ui.label}>
          Claim type
        </label>
        <select id="claimType" name="claimType" defaultValue={values.claimType} required style={ui.select}>
          {claimTypeEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {humanize(v)}
            </option>
          ))}
        </select>
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="consumerQuestion" style={ui.label}>
          Consumer question
        </label>
        <input id="consumerQuestion" name="consumerQuestion" defaultValue={values.consumerQuestion} required style={ui.input} placeholder="Does it improve tendon healing?" />
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="directAnswer" style={ui.label}>
          Direct answer
        </label>
        <textarea id="directAnswer" name="directAnswer" defaultValue={values.directAnswer} required style={ui.textareaSmall} />
        <p style={ui.helpText}>1–2 sentences. The caveat must be in the same sentence as the claim.</p>
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="measuredFinding" style={ui.label}>
          What was measured
        </label>
        <textarea id="measuredFinding" name="measuredFinding" defaultValue={values.measuredFinding} required style={ui.textareaSmall} />
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="inference" style={ui.label}>
          What is being inferred
        </label>
        <textarea id="inference" name="inference" defaultValue={values.inference} required style={ui.textareaSmall} />
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="proofBoundaryStage" style={ui.label}>
          Proof Boundary stage
        </label>
        <select id="proofBoundaryStage" name="proofBoundaryStage" defaultValue={values.proofBoundaryStage} required style={ui.select}>
          {PROOF_BOUNDARY_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {PROOF_BOUNDARY_LABELS[stage]}
            </option>
          ))}
        </select>
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="proofBoundaryExplanation" style={ui.label}>
          Proof Boundary explanation
        </label>
        <textarea id="proofBoundaryExplanation" name="proofBoundaryExplanation" defaultValue={values.proofBoundaryExplanation} required style={ui.textareaSmall} />
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="remainingUnknown" style={ui.label}>
          What remains unknown
        </label>
        <textarea id="remainingUnknown" name="remainingUnknown" defaultValue={values.remainingUnknown} required style={ui.textareaSmall} />
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="evidenceNeededNext" style={ui.label}>
          What evidence would move the boundary
        </label>
        <textarea id="evidenceNeededNext" name="evidenceNeededNext" defaultValue={values.evidenceNeededNext} required style={ui.textareaSmall} />
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="mechanismSummary" style={ui.label}>
          Mechanism summary (optional)
        </label>
        <textarea id="mechanismSummary" name="mechanismSummary" defaultValue={values.mechanismSummary} style={ui.textareaSmall} />
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="outcomeSummary" style={ui.label}>
          Outcome summary (optional)
        </label>
        <textarea id="outcomeSummary" name="outcomeSummary" defaultValue={values.outcomeSummary} style={ui.textareaSmall} />
      </div>

      <div style={ui.fieldWrap}>
        <label htmlFor="displayPriority" style={ui.label}>
          Display priority
        </label>
        <input id="displayPriority" name="displayPriority" type="number" defaultValue={values.displayPriority} style={ui.input} />
        <p style={ui.helpText}>Higher shows first under &quot;Most searched claims&quot;.</p>
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
          </p>
        )}
      </div>

      <button type="submit" style={ui.buttonPrimary}>
        {submitLabel}
      </button>
    </form>
  )
}
