import type { Metadata } from 'next'
import Link from 'next/link'
import { createEvidenceSource } from '../actions'
import { EvidenceSourceForm } from '../EvidenceSourceForm'

export const metadata: Metadata = { title: 'New evidence source', robots: { index: false, follow: false } }

interface Props {
  searchParams: Promise<{
    error?: string
    title?: string
    authors?: string
    publicationYear?: string
    journalOrIssuer?: string
    doi?: string
    pmid?: string
  }>
}

export default async function NewEvidenceSourcePage({ searchParams }: Props) {
  const sp = await searchParams

  return (
    <div className="admin-page">
      <p className="metaline" style={{ marginBottom: 'var(--s4)' }}>
        <Link href="/admin/evidence">← Evidence sources</Link>
      </p>
      <h1 className="h1" style={{ marginBottom: 'var(--s5)' }}>
        New evidence source
      </h1>

      {sp.error && (
        <div className="callout" data-tone="danger" role="alert" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Not saved</p>
          <p style={{ fontSize: 'var(--size-small)' }}>{sp.error}</p>
        </div>
      )}
      {sp.title && (
        <div className="callout" role="status" style={{ marginBottom: 'var(--s5)' }}>
          <p className="callout__title">Bibliographic details imported</p>
          <p style={{ fontSize: 'var(--size-small)' }}>
            Fill in the source type and study details below before saving. Nothing in the second group was
            auto-filled.
          </p>
        </div>
      )}

      <EvidenceSourceForm
        action={createEvidenceSource}
        submitLabel="Create evidence source"
        values={{
          title: sp.title ?? '',
          authors: sp.authors ?? '',
          publicationYear: sp.publicationYear ?? '',
          journalOrIssuer: sp.journalOrIssuer ?? '',
          doi: sp.doi ?? '',
          pmid: sp.pmid ?? '',
          clinicalTrialId: '',
          regulatoryUrl: '',
          sourceType: '',
          studyDesign: '',
          experimentalModel: '',
          species: '',
          sampleSize: '',
          endpoint: '',
          retractionStatus: '',
        }}
      />
    </div>
  )
}
