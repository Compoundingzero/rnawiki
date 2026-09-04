// One facet value: sixty records a page, ordered by how much of the record is filled in and then
// by name. Above three hundred records the value splits by initial letter first, so no single list
// runs to hundreds of screens (docs/specs/browse.md).

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AppShell } from '@/components/AppShell'
import { lastBrowsePage, parseBrowsePage } from '@/lib/browse-pagination'
import {
  corpusFacet,
  corpusFacetValueRecords,
  facetValueLabel,
  FACET_LETTER_SPLIT_THRESHOLD,
  letterBuckets,
} from '@/lib/corpus/facets'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
import { getCurrentUser } from '@/lib/session'

import {
  FACET_PAGE_SIZE,
  FacetNav,
  FacetPager,
  LetterList,
  RecordList,
  countLine,
  facetValueHref,
} from '../../facet-view'

export const dynamic = 'force-dynamic'

type FacetValueProps = {
  params: Promise<{ facet: string; value: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Only `page` is a valid query here; anything else would be a second address for one list. */
function readPage(params: Record<string, string | string[] | undefined>): number {
  for (const name of Object.keys(params)) if (name !== 'page') notFound()
  const raw = params.page
  if (Array.isArray(raw)) notFound()
  const page = parseBrowsePage(raw)
  if (page === null) notFound()
  return page
}

export async function generateMetadata({
  params,
  searchParams,
}: FacetValueProps): Promise<Metadata> {
  const [{ facet: requestedFacet, value }, query] = await Promise.all([params, searchParams])
  const facet = corpusFacet(requestedFacet)
  if (!facet) {
    return { title: 'Not found', robots: pageRobotsMetadata({ index: false, follow: true }) }
  }
  const page = readPage(query)
  const label = facetValueLabel(facet.id, value)
  return {
    title: page > 1 ? `${label} — page ${page}` : label,
    description: `${facet.label}: records filed under ${label}.`,
    alternates: { canonical: facetValueHref(facet.id, value, page) },
    robots: pageRobotsMetadata({ index: true, follow: true }),
  }
}

export default async function FacetValuePage({ params, searchParams }: FacetValueProps) {
  const [{ facet: requestedFacet, value }, query] = await Promise.all([params, searchParams])
  const facet = corpusFacet(requestedFacet)
  if (!facet) notFound()
  const page = readPage(query)

  const [user, records] = await Promise.all([
    getCurrentUser(),
    corpusFacetValueRecords(facet.id, value),
  ])
  if (records.length === 0) notFound()

  const label = facetValueLabel(facet.id, value)
  const split = records.length > FACET_LETTER_SPLIT_THRESHOLD
  if (split && page > 1) notFound()

  const lastPage = lastBrowsePage(records.length)
  if (!split && page > lastPage) notFound()

  const first = (page - 1) * FACET_PAGE_SIZE
  const shown = split ? [] : records.slice(first, first + FACET_PAGE_SIZE)

  return (
    <AppShell initialUser={user}>
      <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-3">
          <span className="block text-[11px] font-bold uppercase tracking-widest text-[color:var(--ink-3,#6E6E73)]">
            {facet.label}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--ink-0,#1D1D1F)] sm:text-4xl">
            {page > 1 ? `${label}, page ${page} of ${lastPage}` : label}
          </h1>
          <p
            data-record-count={records.length}
            className="text-xs font-semibold tabular-nums text-[color:var(--ink-3,#6E6E73)]"
          >
            {split
              ? `${records.length.toLocaleString('en-GB')} records, listed by first letter`
              : countLine(records.length, first + 1, first + shown.length)}
          </p>
        </header>

        <FacetNav current={facet.id} />

        {split ? (
          <LetterList facet={facet.id} value={value} buckets={letterBuckets(records)} />
        ) : (
          <>
            <RecordList records={shown} />
            <FacetPager
              page={page}
              lastPage={lastPage}
              hrefFor={(candidate) => facetValueHref(facet.id, value, candidate)}
              label={`${label} pages`}
            />
          </>
        )}
      </div>
    </AppShell>
  )
}
