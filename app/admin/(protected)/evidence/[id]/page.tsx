import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { evidenceSources } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { updateEvidenceSource } from '../actions'
import { EvidenceSourceForm } from '../EvidenceSourceForm'
import * as ui from '@/lib/admin/ui'

export const metadata: Metadata = { title: 'Edit evidence source', robots: { index: false, follow: false } }

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function EditEvidenceSourcePage({ params, searchParams }: Props) {
  const [{ id }, { error, success }] = await Promise.all([params, searchParams])
  const sourceId = Number.parseInt(id, 10)
  if (!Number.isFinite(sourceId)) notFound()

  const [source] = await db.select().from(evidenceSources).where(eq(evidenceSources.id, sourceId)).limit(1)
  if (!source) notFound()

  return (
    <div style={ui.page}>
      <p style={{ marginBottom: 'var(--space-2)' }}>
        <Link href="/admin/evidence">← Evidence sources</Link>
      </p>
      <h1 style={ui.h1}>{source.title}</h1>

      {error && <p style={ui.errorBanner}>{error}</p>}
      {success && <p style={ui.successBanner}>{success}</p>}

      <div style={ui.sectionCard}>
        <EvidenceSourceForm
          action={updateEvidenceSource.bind(null, source.id)}
          submitLabel="Save changes"
          values={{
            title: source.title,
            authors: source.authors ?? '',
            publicationYear: source.publicationYear ? String(source.publicationYear) : '',
            journalOrIssuer: source.journalOrIssuer ?? '',
            doi: source.doi ?? '',
            pmid: source.pmid ?? '',
            clinicalTrialId: source.clinicalTrialId ?? '',
            regulatoryUrl: source.regulatoryUrl ?? '',
            sourceType: source.sourceType,
            studyDesign: source.studyDesign ?? '',
            experimentalModel: source.experimentalModel ?? '',
            species: source.species ?? '',
            sampleSize: source.sampleSize ? String(source.sampleSize) : '',
            endpoint: source.endpoint ?? '',
            retractionStatus: source.retractionStatus ?? '',
          }}
        />
      </div>
    </div>
  )
}
