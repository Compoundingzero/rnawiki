'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { evidenceSources } from '@/db/schema'
import { requireUser, AuthError } from '@/lib/auth'
import { fetchMetadataByDoi, fetchMetadataByPmid, MetadataImportError } from '@/lib/metadata-import'
import { formToObject, redirectWithError, redirectWithSuccess, nullIfEmpty, toIntOrNull } from '@/lib/admin/forms'

async function requireEditorOrAdmin() {
  try {
    return await requireUser(['administrator', 'editor'])
  } catch (err) {
    if (err instanceof AuthError) redirect('/admin/login')
    throw err
  }
}

// ---------------------------------------------------------------------------
// Metadata import — fetches ONLY bibliographic fields (title/authors/year/journal/doi/pmid)
// and hands them back as a prefilled /admin/evidence/new URL. Nothing is written to the
// database here: sourceType/studyDesign/species/sampleSize/endpoint remain manual, editorial,
// typed-by-a-human fields on the create form (TASK section 6).
// ---------------------------------------------------------------------------

export async function importFromDoi(formData: FormData): Promise<void> {
  await requireEditorOrAdmin()
  const doi = String(formData.get('doi') ?? '').trim()
  if (!doi) redirectWithError('/admin/evidence', 'Enter a DOI to import.')

  try {
    const meta = await fetchMetadataByDoi(doi)
    const params = new URLSearchParams({
      title: meta.title,
      authors: meta.authors ?? '',
      publicationYear: meta.publicationYear ? String(meta.publicationYear) : '',
      journalOrIssuer: meta.journalOrIssuer ?? '',
      doi: meta.doi ?? '',
      pmid: meta.pmid ?? '',
    })
    redirect(`/admin/evidence/new?${params.toString()}`)
  } catch (err) {
    if (err instanceof MetadataImportError) {
      redirectWithError('/admin/evidence', err.message)
    }
    throw err
  }
}

export async function importFromPmid(formData: FormData): Promise<void> {
  await requireEditorOrAdmin()
  const pmid = String(formData.get('pmid') ?? '').trim()
  if (!pmid) redirectWithError('/admin/evidence', 'Enter a PMID to import.')

  try {
    const meta = await fetchMetadataByPmid(pmid)
    const params = new URLSearchParams({
      title: meta.title,
      authors: meta.authors ?? '',
      publicationYear: meta.publicationYear ? String(meta.publicationYear) : '',
      journalOrIssuer: meta.journalOrIssuer ?? '',
      doi: meta.doi ?? '',
      pmid: meta.pmid ?? '',
    })
    redirect(`/admin/evidence/new?${params.toString()}`)
  } catch (err) {
    if (err instanceof MetadataImportError) {
      redirectWithError('/admin/evidence', err.message)
    }
    throw err
  }
}

// ---------------------------------------------------------------------------
// Manual create/edit — every field here is a human editorial judgment call, including the
// bibliographic ones when typed directly rather than imported.
// ---------------------------------------------------------------------------

const evidenceSourceSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.'),
  authors: z.string().optional().default(''),
  publicationYear: z.string().optional().default(''),
  journalOrIssuer: z.string().optional().default(''),
  doi: z.string().optional().default(''),
  pmid: z.string().optional().default(''),
  clinicalTrialId: z.string().optional().default(''),
  regulatoryUrl: z.string().optional().default(''),
  sourceType: z.string().trim().min(1, 'Source type is required (e.g. "randomized controlled trial").'),
  studyDesign: z.string().optional().default(''),
  experimentalModel: z.string().optional().default(''),
  species: z.string().optional().default(''),
  sampleSize: z.string().optional().default(''),
  endpoint: z.string().optional().default(''),
  retractionStatus: z.string().optional().default(''),
})

function toValues(data: z.infer<typeof evidenceSourceSchema>) {
  return {
    title: data.title,
    authors: nullIfEmpty(data.authors),
    publicationYear: toIntOrNull(data.publicationYear),
    journalOrIssuer: nullIfEmpty(data.journalOrIssuer),
    doi: nullIfEmpty(data.doi),
    pmid: nullIfEmpty(data.pmid),
    clinicalTrialId: nullIfEmpty(data.clinicalTrialId),
    regulatoryUrl: nullIfEmpty(data.regulatoryUrl),
    sourceType: data.sourceType,
    studyDesign: nullIfEmpty(data.studyDesign),
    experimentalModel: nullIfEmpty(data.experimentalModel),
    species: nullIfEmpty(data.species),
    sampleSize: toIntOrNull(data.sampleSize),
    endpoint: nullIfEmpty(data.endpoint),
    retractionStatus: nullIfEmpty(data.retractionStatus),
  }
}

export async function createEvidenceSource(formData: FormData): Promise<void> {
  await requireEditorOrAdmin()

  const parsed = evidenceSourceSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError('/admin/evidence/new', parsed.error.issues[0]?.message ?? 'Invalid input.')
  }

  const [created] = await db.insert(evidenceSources).values(toValues(parsed.data)).returning()
  if (!created) throw new Error('Evidence source insert returned no row.')

  redirectWithSuccess(`/admin/evidence/${created.id}`, 'Evidence source created.')
}

export async function updateEvidenceSource(evidenceSourceId: number, formData: FormData): Promise<void> {
  await requireEditorOrAdmin()

  const [existing] = await db.select({ id: evidenceSources.id }).from(evidenceSources).where(eq(evidenceSources.id, evidenceSourceId)).limit(1)
  if (!existing) redirectWithError('/admin/evidence', 'Evidence source not found.')

  const parsed = evidenceSourceSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError(`/admin/evidence/${evidenceSourceId}`, parsed.error.issues[0]?.message ?? 'Invalid input.')
  }

  await db.update(evidenceSources).set(toValues(parsed.data)).where(eq(evidenceSources.id, evidenceSourceId))

  redirectWithSuccess(`/admin/evidence/${evidenceSourceId}`, 'Evidence source updated.')
}
