import { claimTypeEnum, publicationStatusEnum } from '@/db/schema'
import { PROOF_BOUNDARY_STAGES, PROOF_BOUNDARY_LABELS } from '@/lib/evidence'

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
    <form action={action} className="admin-form">
      <div className="admin-field">
        <label htmlFor="entityId" className="admin-label">
          Entity
        </label>
        <select
          id="entityId"
          name="entityId"
          defaultValue={values.entityId}
          required
          disabled={lockEntity}
          aria-describedby={lockEntity ? 'entityId-help' : undefined}
          className="field"
        >
          <option value="" disabled>
            Choose an entity…
          </option>
          {entityOptions.map((e) => (
            <option key={e.id} value={e.id}>
              {e.canonicalName}
            </option>
          ))}
        </select>
        {lockEntity && (
          <p id="entityId-help" className="admin-help">
            Entity cannot be changed after creation from this form.
          </p>
        )}
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
          Unique per entity, e.g. &quot;tendon-healing&quot;.
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor="claimType" className="admin-label">
          Claim type
        </label>
        <select id="claimType" name="claimType" defaultValue={values.claimType} required className="field">
          {claimTypeEnum.enumValues.map((v) => (
            <option key={v} value={v}>
              {humanize(v)}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-field">
        <label htmlFor="consumerQuestion" className="admin-label">
          Consumer question
        </label>
        <input
          id="consumerQuestion"
          name="consumerQuestion"
          defaultValue={values.consumerQuestion}
          required
          className="field"
          placeholder="Does it improve tendon healing?"
        />
      </div>

      <div className="admin-field">
        <label htmlFor="directAnswer" className="admin-label">
          Direct answer
        </label>
        <textarea
          id="directAnswer"
          name="directAnswer"
          defaultValue={values.directAnswer}
          required
          aria-describedby="directAnswer-help"
          className="field"
        />
        <p id="directAnswer-help" className="admin-help">
          1–2 sentences. The caveat must be in the same sentence as the claim.
        </p>
      </div>

      <div className="admin-field">
        <label htmlFor="measuredFinding" className="admin-label">
          What was measured
        </label>
        <textarea id="measuredFinding" name="measuredFinding" defaultValue={values.measuredFinding} required className="field" />
      </div>

      <div className="admin-field">
        <label htmlFor="inference" className="admin-label">
          What is being inferred
        </label>
        <textarea id="inference" name="inference" defaultValue={values.inference} required className="field" />
      </div>

      <div className="admin-field">
        <label htmlFor="proofBoundaryStage" className="admin-label">
          Proof Boundary stage
        </label>
        <select id="proofBoundaryStage" name="proofBoundaryStage" defaultValue={values.proofBoundaryStage} required className="field">
          {PROOF_BOUNDARY_STAGES.map((stage, i) => (
            <option key={stage} value={stage}>
              {i + 1}. {PROOF_BOUNDARY_LABELS[stage]}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-field">
        <label htmlFor="proofBoundaryExplanation" className="admin-label">
          Proof Boundary explanation
        </label>
        <textarea
          id="proofBoundaryExplanation"
          name="proofBoundaryExplanation"
          defaultValue={values.proofBoundaryExplanation}
          required
          className="field"
        />
      </div>

      <div className="admin-field">
        <label htmlFor="remainingUnknown" className="admin-label">
          What remains unknown
        </label>
        <textarea id="remainingUnknown" name="remainingUnknown" defaultValue={values.remainingUnknown} required className="field" />
      </div>

      <div className="admin-field">
        <label htmlFor="evidenceNeededNext" className="admin-label">
          What evidence would move the boundary
        </label>
        <textarea id="evidenceNeededNext" name="evidenceNeededNext" defaultValue={values.evidenceNeededNext} required className="field" />
      </div>

      <div className="admin-field">
        <label htmlFor="mechanismSummary" className="admin-label">
          Mechanism summary (optional)
        </label>
        <textarea id="mechanismSummary" name="mechanismSummary" defaultValue={values.mechanismSummary} className="field" />
      </div>

      <div className="admin-field">
        <label htmlFor="outcomeSummary" className="admin-label">
          Outcome summary (optional)
        </label>
        <textarea id="outcomeSummary" name="outcomeSummary" defaultValue={values.outcomeSummary} className="field" />
      </div>

      <div className="admin-field">
        <label htmlFor="displayPriority" className="admin-label">
          Display priority
        </label>
        <input
          id="displayPriority"
          name="displayPriority"
          type="number"
          defaultValue={values.displayPriority}
          aria-describedby="displayPriority-help"
          className="field"
        />
        <p id="displayPriority-help" className="admin-help">
          Higher sorts earlier where claims are listed together.
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
