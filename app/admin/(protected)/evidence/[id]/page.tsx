import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { evidenceSources } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { updateEvidenceSource } from '../actions'
import { EvidenceSourceForm } from '../EvidenceSourceForm'

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
    <div className="admin-page">
      <p className="metaline" style={{ marginBottom: 'var(--s4)' }}>
        <Link href="/admin/evidence">← Evidence sources</Link>
      </p>

      <div className="admin-head">
        <div>
          <p className="eyebrow">Source record</p>
          <h1 className="h1" style={{ marginTop: 'var(--s2)' }}>
            {source.title}
          </h1>
        </div>
        {source.retractionStatus && (
          <span className="tag" data-flag="retraction">
            {source.retractionStatus}
          </span>
        )}
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
  )
}
