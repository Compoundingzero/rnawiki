// A facet index: every value of one dimension, with its record count, one click from the home
// page's facet strip and one click from any record row (docs/specs/browse.md, R12).

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AppShell } from '@/components/AppShell'
import { corpusFacet, corpusFacetValues } from '@/lib/corpus/facets'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
import { getCurrentUser } from '@/lib/session'

import { FacetNav, FacetValueList, facetIndexHref } from '../facet-view'

// A dynamic segment is not enough on its own: this route reads the database, and Railway's build
// container cannot resolve the private database host while collecting pages.
export const dynamic = 'force-dynamic'

type FacetIndexProps = { params: Promise<{ facet: string }> }

export async function generateMetadata({ params }: FacetIndexProps): Promise<Metadata> {
  const { facet: requested } = await params
  const facet = corpusFacet(requested)
  if (!facet) {
    return { title: 'Not found', robots: pageRobotsMetadata({ index: false, follow: true }) }
  }
  return {
    title: `Browse by ${facet.label.toLowerCase()}`,
    description: facet.description,
    alternates: { canonical: facetIndexHref(facet.id) },
    robots: pageRobotsMetadata({ index: true, follow: true }),
  }
}

export default async function FacetIndexPage({ params }: FacetIndexProps) {
  const { facet: requested } = await params
  const facet = corpusFacet(requested)
  if (!facet) notFound()

  const [user, values] = await Promise.all([getCurrentUser(), corpusFacetValues(facet.id)])
  if (values.length === 0) notFound()

  return (
    <AppShell initialUser={user}>
      <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--ink-0,#1D1D1F)] sm:text-4xl">
            {facet.label}
          </h1>
          <p className="text-sm leading-relaxed text-[color:var(--ink-3,#6E6E73)]">
            {facet.description}
          </p>
        </header>

        <FacetNav current={facet.id} />

        <FacetValueList facet={facet.id} values={values} />
      </div>
    </AppShell>
  )
}
