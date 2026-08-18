import type { Metadata } from 'next'
import Link from 'next/link'
import { createEvidenceSource } from '../actions'
import { EvidenceSourceForm } from '../EvidenceSourceForm'
import * as ui from '@/lib/admin/ui'

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
    <div style={ui.page}>
      <p style={{ marginBottom: 'var(--space-2)' }}>
        <Link href="/admin/evidence">← Evidence sources</Link>
      </p>
      <h1 style={ui.h1}>New evidence source</h1>

      {sp.error && <p style={ui.errorBanner}>{sp.error}</p>}
      {sp.title && (
        <p style={ui.successBanner}>
          Bibliographic details imported. Fill in the source type and study details below before saving.
        </p>
      )}

      <div style={ui.sectionCard}>
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
    </div>
  )
}
