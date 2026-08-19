// The dossier page — the reference wireframe's `currentView === 'drug'` branch, as a route.
//
// Everything visible is rendered by `components/DrugDossierView.tsx`, which is the section-for-
// section port of the reference. This file does the four things a route has to do that a wireframe
// never did: resolve the slug, 404 honestly when nothing matches, describe the record to crawlers
// and social cards, and publish machine-readable structured data.

import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { DrugDossierView } from '@/components/DrugDossierView'
import { getDrugBySlug, incrementViewCount } from '@/lib/queries/drugs'
import { drugJsonLd, serialiseJsonLd } from '@/lib/json-ld'
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

/** Next.js 15: route params arrive as a Promise and must be awaited. */
type DossierPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: DossierPageProps): Promise<Metadata> {
  const { slug } = await params
  const viewer = await loadViewer()
  const drug = await loadDossier(slug, viewer?.id)

  if (!drug) {
    // A 404 must not be indexable, and it has no record to describe.
    return { title: 'Medicine not found', robots: { index: false, follow: true } }
  }

  const title = drug.tradeName ? `${drug.name} (${drug.tradeName})` : drug.name

  // The verdict is the sentence the record exists to deliver, so it is the description whenever
  // there is one. A stub has no verdict yet; the recorded indication is then the honest summary,
  // and nothing is composed out of thin air to fill the tag.
  const description =
    drug.oneSentenceVerdict.trim() ||
    drug.patientFriendlyIndication.trim() ||
    drug.indication.trim() ||
    `${drug.name}: ${drug.modality}, ${drug.approvalStatus}.`

  const path = `/d/${drug.id}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      title: `${title} — RNAwiki`,
      description,
      url: path,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — RNAwiki`,
      description,
    },
  }
}

export default async function DossierPage({ params }: DossierPageProps) {
  const { slug } = await params
  const viewer = await loadViewer()
  const drug = await loadDossier(slug, viewer?.id)

  if (!drug) notFound()

  // Deliberately not awaited into the render path. A view counter is the least important thing on
  // this page: `incrementViewCount` swallows its own failures, and blocking the dossier on an
  // UPDATE would let a lock wait turn a readable record into a slow one.
  void incrementViewCount(drug.id)

  const jsonLd = drugJsonLd(drug, `${siteUrl}/d/${drug.id}`)

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
        <DrugDossierView drug={drug} />
      </AppShell>
    </>
  )
}
