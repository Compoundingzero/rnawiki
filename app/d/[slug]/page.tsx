// The canonical medicine dossier route. It prefers the single authoritative published programme
// revision, selected through a shareable query parameter, and falls back honestly for legacy or
// identified-but-unpublished programmes.

import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { MedicineDossierV2 } from '@/components/MedicineDossierV2'
import { getDrugBySlug, incrementViewCount } from '@/lib/queries/drugs'
import {
  getProgrammeEvidenceByMedicineSlug,
  programmeReferenceExists,
} from '@/lib/queries/programme-evidence'
import { isMedicineSavedBySlug } from '@/lib/queries/saved-drugs'
import { programmeEvidenceMedicineDossierView } from '@/lib/programme-dossier-view'
import { drugJsonLd, serialiseJsonLd } from '@/lib/json-ld'
import { publicApprovalStatusLabel, publicMedicineTypeLabel } from '@/lib/public-medicine-language'
import { getCurrentUser } from '@/lib/session'

const siteUrl = process.env.SITE_URL ?? 'https://rnawiki.com'

/**
 * `generateMetadata` and the page body both need the reader and the record, and Next.js calls them
 * as two separate renders of the same request. `cache` collapses that: identical arguments inside
 * one request resolve to one database round trip instead of two. The viewer id is part of the key
 * because `getDrugBySlug` resolves each note's `hasUpvoted` for that viewer, so a cached copy
 * belonging to somebody else would be wrong rather than merely stale.
 */
const loadViewer = cache(getCurrentUser)

const loadDossier = cache((slug: string, viewerUserId: string | undefined) =>
  getDrugBySlug(slug, viewerUserId),
)

const loadProgrammeEvidence = cache((slug: string, programmeRef: string | null) =>
  getProgrammeEvidenceByMedicineSlug(slug, programmeRef),
)

/** Next.js 15: route params and search params arrive as Promises and must be awaited. */
type DossierPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ programme?: string | string[] }>
}

function selectedProgramme(value: string | string[] | undefined): string | null {
  const selected = Array.isArray(value) ? value[0] : value
  return selected?.trim() || null
}

export async function generateMetadata({
  params,
  searchParams,
}: DossierPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const programmeRef = selectedProgramme(query.programme)
  const viewer = await loadViewer()
  const [drug, programmeEvidence] = await Promise.all([
    loadDossier(slug, viewer?.id),
    loadProgrammeEvidence(slug, programmeRef),
  ])

  if (!drug) {
    // A 404 must not be indexable, and it has no record to describe.
    return { title: 'Medicine not found', robots: { index: false, follow: true } }
  }

  if (
    programmeRef &&
    programmeEvidence &&
    !programmeReferenceExists(programmeEvidence, programmeRef)
  ) {
    return { title: 'Development programme not found', robots: { index: false, follow: true } }
  }

  const dossier = programmeEvidence
    ? programmeEvidenceMedicineDossierView(drug, programmeEvidence)
    : null
  const title = drug.tradeName ? `${drug.name} (${drug.tradeName})` : drug.name

  // The verdict is the sentence the record exists to deliver, so it is the description whenever
  // there is one. A stub has no verdict yet; the recorded indication is then the accurate summary,
  // and nothing is composed out of thin air to fill the tag.
  const description =
    dossier?.verdict.trim() ||
    (dossier?.bindingState === 'programme_unpublished'
      ? `${drug.name}: RNAWiki has not published a reviewed conclusion for ${dossier.selectedProgrammeLabel} yet.`
      : '') ||
    drug.oneSentenceVerdict.trim() ||
    drug.patientFriendlyIndication.trim() ||
    drug.indication.trim() ||
    `${drug.name}: ${publicMedicineTypeLabel(drug.modality)}, ${publicApprovalStatusLabel(drug.approvalStatus)}.`

  const publishedProgramme = programmeEvidence?.selectedProgramme?.slug
  const path = publishedProgramme
    ? `/d/${drug.id}?programme=${encodeURIComponent(publishedProgramme)}`
    : `/d/${drug.id}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      title: `${title} — RNAWiki`,
      description,
      url: path,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — RNAWiki`,
      description,
    },
  }
}

export default async function DossierPage({ params, searchParams }: DossierPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const programmeRef = selectedProgramme(query.programme)
  const viewer = await loadViewer()
  const [drug, programmeEvidence] = await Promise.all([
    loadDossier(slug, viewer?.id),
    loadProgrammeEvidence(slug, programmeRef),
  ])

  if (!drug) notFound()
  if (
    programmeRef &&
    programmeEvidence &&
    !programmeReferenceExists(programmeEvidence, programmeRef)
  ) {
    notFound()
  }

  // Deliberately not awaited into the render path. A view counter is the least important thing on
  // this page: `incrementViewCount` swallows its own failures, and blocking the dossier on an
  // UPDATE would let a lock wait turn a readable record into a slow one.
  void incrementViewCount(drug.id)

  const dossier = programmeEvidence
    ? programmeEvidenceMedicineDossierView(drug, programmeEvidence)
    : programmeEvidenceMedicineDossierView(drug, {
        medicine: {
          id: drug.id,
          slug: drug.id,
          name: drug.name,
          modality: drug.modality,
        },
        programmes: [],
        selectedProgramme: null,
      })
  const selectedPath =
    dossier.bindingState !== 'legacy_record' && dossier.selectedProgrammeId
      ? `/d/${drug.id}?programme=${encodeURIComponent(dossier.selectedProgrammeId)}`
      : `/d/${drug.id}`
  const jsonLd = drugJsonLd(drug, `${siteUrl}${selectedPath}`, dossier)
  const initialSaved = viewer ? await isMedicineSavedBySlug(viewer.id, drug.id) : false

  return (
    <>
      {/*
        The one place in this codebase that injects raw HTML. `serialiseJsonLd` escapes `<`, `>`
        and `&` first — see the header of lib/json-ld.ts for why that escaping, and not the CSP,
        is what stops a drug name in the database from closing this script tag.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serialiseJsonLd(jsonLd) }}
      />
      <AppShell initialUser={viewer}>
        <MedicineDossierV2 dossier={dossier} initialSaved={initialSaved} />
      </AppShell>
    </>
  )
}
