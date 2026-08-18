import * as ui from '@/lib/admin/ui'

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
    <form action={action}>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Bibliographic (importable)</h3>
      <div style={ui.fieldWrap}>
        <label htmlFor="title" style={ui.label}>
          Title
        </label>
        <input id="title" name="title" defaultValue={values.title} required style={ui.input} />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="authors" style={ui.label}>
          Authors
        </label>
        <input id="authors" name="authors" defaultValue={values.authors} style={ui.input} />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="publicationYear" style={ui.label}>
          Publication year
        </label>
        <input id="publicationYear" name="publicationYear" type="number" defaultValue={values.publicationYear} style={ui.input} />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="journalOrIssuer" style={ui.label}>
          Journal or issuer
        </label>
        <input id="journalOrIssuer" name="journalOrIssuer" defaultValue={values.journalOrIssuer} style={ui.input} />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="doi" style={ui.label}>
          DOI
        </label>
        <input id="doi" name="doi" defaultValue={values.doi} style={ui.input} />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="pmid" style={ui.label}>
          PMID
        </label>
        <input id="pmid" name="pmid" defaultValue={values.pmid} style={ui.input} />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="clinicalTrialId" style={ui.label}>
          Clinical trial ID (NCT number)
        </label>
        <input id="clinicalTrialId" name="clinicalTrialId" defaultValue={values.clinicalTrialId} style={ui.input} />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="regulatoryUrl" style={ui.label}>
          Regulatory URL
        </label>
        <input id="regulatoryUrl" name="regulatoryUrl" type="url" defaultValue={values.regulatoryUrl} style={ui.input} />
      </div>

      <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Editorial judgment (always manual)</h3>
      <div style={ui.fieldWrap}>
        <label htmlFor="sourceType" style={ui.label}>
          Source type
        </label>
        <input
          id="sourceType"
          name="sourceType"
          defaultValue={values.sourceType}
          required
          style={ui.input}
          placeholder="e.g. randomized controlled trial, animal study (rat), systematic review"
        />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="studyDesign" style={ui.label}>
          Study design
        </label>
        <input id="studyDesign" name="studyDesign" defaultValue={values.studyDesign} style={ui.input} />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="experimentalModel" style={ui.label}>
          Experimental model
        </label>
        <input id="experimentalModel" name="experimentalModel" defaultValue={values.experimentalModel} style={ui.input} placeholder="e.g. rat Achilles tendon" />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="species" style={ui.label}>
          Species
        </label>
        <input id="species" name="species" defaultValue={values.species} style={ui.input} />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="sampleSize" style={ui.label}>
          Sample size
        </label>
        <input id="sampleSize" name="sampleSize" type="number" defaultValue={values.sampleSize} style={ui.input} />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="endpoint" style={ui.label}>
          Endpoint
        </label>
        <textarea id="endpoint" name="endpoint" defaultValue={values.endpoint} style={ui.textareaSmall} />
      </div>
      <div style={ui.fieldWrap}>
        <label htmlFor="retractionStatus" style={ui.label}>
          Retraction status
        </label>
        <input id="retractionStatus" name="retractionStatus" defaultValue={values.retractionStatus} style={ui.input} placeholder="leave blank unless corrected or retracted" />
      </div>

      <button type="submit" style={ui.buttonPrimary}>
        {submitLabel}
      </button>
    </form>
  )
}
