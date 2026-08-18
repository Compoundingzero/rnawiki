export interface EvidenceSourceFormValues {
  title: string
  authors: string
  publicationYear: string
  journalOrIssuer: string
  doi: string
  pmid: string
  clinicalTrialId: string
  regulatoryUrl: string
  sourceType: string
  studyDesign: string
  experimentalModel: string
  species: string
  sampleSize: string
  endpoint: string
  retractionStatus: string
}

export function EvidenceSourceForm({
  action,
  values,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>
  values: EvidenceSourceFormValues
  submitLabel: string
}) {
  return (
    <form action={action} className="admin-form">
      {/* The split below is the point of this form: the first group can be imported,
          the second is editorial judgment and is never auto-filled. */}
      <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'grid', gap: 'var(--s4)' }}>
        <legend className="eyebrow" style={{ padding: 0, marginBottom: 'var(--s2)' }}>
          Bibliographic — importable
        </legend>

        <div className="admin-field">
          <label htmlFor="title" className="admin-label">
            Title
          </label>
          <input id="title" name="title" defaultValue={values.title} required className="field" />
        </div>
        <div className="admin-field">
          <label htmlFor="authors" className="admin-label">
            Authors
          </label>
          <input id="authors" name="authors" defaultValue={values.authors} className="field" />
        </div>
        <div className="admin-field">
          <label htmlFor="publicationYear" className="admin-label">
            Publication year
          </label>
          <input id="publicationYear" name="publicationYear" type="number" defaultValue={values.publicationYear} className="field" />
        </div>
        <div className="admin-field">
          <label htmlFor="journalOrIssuer" className="admin-label">
            Journal or issuer
          </label>
          <input id="journalOrIssuer" name="journalOrIssuer" defaultValue={values.journalOrIssuer} className="field" />
        </div>
        <div className="admin-field">
          <label htmlFor="doi" className="admin-label">
            DOI
          </label>
          <input id="doi" name="doi" defaultValue={values.doi} className="field" />
        </div>
        <div className="admin-field">
          <label htmlFor="pmid" className="admin-label">
            PMID
          </label>
          <input id="pmid" name="pmid" defaultValue={values.pmid} className="field" />
        </div>
        <div className="admin-field">
          <label htmlFor="clinicalTrialId" className="admin-label">
            Clinical trial ID (NCT number)
          </label>
          <input id="clinicalTrialId" name="clinicalTrialId" defaultValue={values.clinicalTrialId} className="field" />
        </div>
        <div className="admin-field">
          <label htmlFor="regulatoryUrl" className="admin-label">
            Regulatory URL
          </label>
          <input id="regulatoryUrl" name="regulatoryUrl" type="url" defaultValue={values.regulatoryUrl} className="field" />
        </div>
      </fieldset>

      <hr className="rule-tight" />

      <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'grid', gap: 'var(--s4)' }}>
        <legend className="eyebrow" style={{ padding: 0, marginBottom: 'var(--s2)' }}>
          Editorial judgment — always manual
        </legend>

        <div className="admin-field">
          <label htmlFor="sourceType" className="admin-label">
            Source type
          </label>
          <input
            id="sourceType"
            name="sourceType"
            defaultValue={values.sourceType}
            required
            className="field"
            placeholder="e.g. randomized controlled trial, animal study (rat), systematic review"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="studyDesign" className="admin-label">
            Study design
          </label>
          <input id="studyDesign" name="studyDesign" defaultValue={values.studyDesign} className="field" />
        </div>
        <div className="admin-field">
          <label htmlFor="experimentalModel" className="admin-label">
            Experimental model
          </label>
          <input
            id="experimentalModel"
            name="experimentalModel"
            defaultValue={values.experimentalModel}
            className="field"
            placeholder="e.g. rat Achilles tendon"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="species" className="admin-label">
            Species
          </label>
          <input id="species" name="species" defaultValue={values.species} className="field" />
        </div>
        <div className="admin-field">
          <label htmlFor="sampleSize" className="admin-label">
            Sample size
          </label>
          <input id="sampleSize" name="sampleSize" type="number" defaultValue={values.sampleSize} className="field" />
        </div>
        <div className="admin-field">
          <label htmlFor="endpoint" className="admin-label">
            Endpoint
          </label>
          <textarea id="endpoint" name="endpoint" defaultValue={values.endpoint} className="field" />
        </div>
        <div className="admin-field">
          <label htmlFor="retractionStatus" className="admin-label">
            Retraction status
          </label>
          <input
            id="retractionStatus"
            name="retractionStatus"
            defaultValue={values.retractionStatus}
            aria-describedby="retractionStatus-help"
            className="field"
          />
          <p id="retractionStatus-help" className="admin-help">
            Leave blank unless the source has been corrected or retracted.
          </p>
        </div>
      </fieldset>

      <div className="admin-actions">
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
