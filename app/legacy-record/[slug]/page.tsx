// The medicine records the corpus does not hold, served as the React dossier they have always been.
//
// The public URL is `/d/<slug>`: `app/d/[slug]/route.ts` writes a corpus record as a plain HTML
// document and forwards everything else here over the loopback interface (step 6.1,
// lib/document/legacy-forward.ts). Nothing links to this path and nothing may reach it directly,
// so a request without the forwarding token is a 404. Every canonical, redirect and indexing
// decision below is still made about `/d/<slug>`.

import { cache } from 'react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { MedicineDossierV2 } from '@/components/MedicineDossierV2'
import { LEGACY_FORWARD_HEADER, legacyForwardToken } from '@/lib/document/legacy-forward'
import {
  getDrugBySlug,
  getPublicDrugBySlug,
  incrementViewCount,
  resolvePublicMedicineRoute,
} from '@/lib/queries/drugs'
import {
  getProgrammeEvidenceByMedicineSlug,
  programmeReferenceExists,
} from '@/lib/queries/programme-evidence'
import { programmeEvidenceMedicineDossierView } from '@/lib/programme-dossier-view'
import { dossierJsonLdGraph, serialiseJsonLd } from '@/lib/json-ld'
import { configuredPublicUrl, configuredSiteOrigin, pageRobotsMetadata } from '@/lib/seo/deployment'
import { decideDossierIndexability } from '@/lib/seo/dossier-indexability'
import {
  dossierDiscoveryProjection,
  dossierMetadataDescription,
  dossierMetadataTitle,
} from '@/lib/seo/metadata'
import { getCurrentUser } from '@/lib/session'

const siteOrigin = configuredSiteOrigin()

/** Request-local caches deduplicate the public route/evidence reads shared by metadata and body.
 * The viewer id remains part of the personalised dossier key because note votes are viewer-specific.
 */
const loadViewer = cache(getCurrentUser)
const loadCanonicalRoute = cache(resolvePublicMedicineRoute)

const loadPublicDossier = cache(getPublicDrugBySlug)

/** A request that did not come from `/d/<slug>`'s own route handler is not answered at all. */
async function forwardedFromDossierRoute(): Promise<boolean> {
  const requestHeaders = await headers()
  return requestHeaders.get(LEGACY_FORWARD_HEADER) === legacyForwardToken()
}

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

  const route = await loadCanonicalRoute(slug)
  if (!route) {
    return {
      title: 'Medicine not found',
      robots: pageRobotsMetadata({ index: false, follow: true }),
    }
  }

  const [drug, programmeEvidence] = await Promise.all([
    loadPublicDossier(route.canonicalSlug),
    loadProgrammeEvidence(route.canonicalSlug, programmeRef),
  ])

  if (!drug) {
    // A 404 must not be indexable, and it has no record to describe.
    return {
      title: 'Medicine not found',
      robots: pageRobotsMetadata({ index: false, follow: true }),
    }
  }

  if (
    programmeRef &&
    programmeEvidence &&
    !programmeReferenceExists(programmeEvidence, programmeRef)
  ) {
    return {
      title: 'Development programme not found',
      robots: pageRobotsMetadata({ index: false, follow: true }),
    }
  }

  const dossier = programmeEvidence
    ? programmeEvidenceMedicineDossierView(drug, programmeEvidence)
    : null
  // The same shared projection feeds this description and the generated social-card image
  // (opengraph-image.tsx), so the two discovery surfaces cannot drift onto different review
  // gates or different stored answer fields.
  const { decision, input } = dossierDiscoveryProjection(drug, dossier)
  const title = dossierMetadataTitle(drug.name)
  const description = dossierMetadataDescription(input)
  const path = `/d/${route.canonicalSlug}`
  // Programme query parameters are a shareable UI state, not a separate search landing page.
  const mayIndex = decision?.index === true && programmeRef === null

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: pageRobotsMetadata({ index: mayIndex, follow: true }),
    openGraph: {
      type: 'article',
      title: `${title} | RNAWiki`,
      description,
      url: path,
      // The card is a route of the public path, not of this internal one, so it is named here
      // rather than discovered from a metadata file beside this page.
      images: [{ url: `${path}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | RNAWiki`,
      description,
    },
  }
}

export default async function LegacyMedicineRecordPage({ params, searchParams }: DossierPageProps) {
  if (!(await forwardedFromDossierRoute())) notFound()
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const programmeRef = selectedProgramme(query.programme)
  const viewer = await loadViewer()
  const route = await loadCanonicalRoute(slug)
  if (!route) notFound()
  if (route.canonicalSlug !== slug) {
    const queryString = programmeRef ? `?programme=${encodeURIComponent(programmeRef)}` : ''
    permanentRedirect(`/d/${encodeURIComponent(route.canonicalSlug)}${queryString}`)
  }

  const [drug, programmeEvidence] = await Promise.all([
    loadDossier(route.canonicalSlug, viewer?.id),
    loadProgrammeEvidence(route.canonicalSlug, programmeRef),
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
  const selectedPath: `/${string}` = `/d/${route.canonicalSlug}`
  const decision = decideDossierIndexability(drug, dossier)
  const jsonLd = dossierJsonLdGraph(drug, dossier, {
    eligible: decision.index && programmeRef === null,
    siteUrl: siteOrigin,
    url: configuredPublicUrl(selectedPath),
  })
  return (
    <>
      {/*
        The one place in this codebase that injects raw HTML. `serialiseJsonLd` escapes `<`, `>`
        and `&` first — see the header of lib/json-ld.ts for why that escaping, and not the CSP,
        is what stops a drug name in the database from closing this script tag.
      */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialiseJsonLd(jsonLd) }}
        />
      )}
      <AppShell initialUser={viewer}>
        <MedicineDossierV2 dossier={dossier} />
      </AppShell>
    </>
  )
}
