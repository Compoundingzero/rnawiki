// The letter sub-page of a large facet value: the same sixty-record list, restricted to records
// whose name starts with one letter (docs/specs/browse.md).

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
  recordsForLetter,
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
  facetLetterHref,
  facetValueHref,
} from '../../../facet-view'

export const dynamic = 'force-dynamic'

type LetterPageProps = {
  params: Promise<{ facet: string; value: string; letter: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function readPage(params: Record<string, string | string[] | undefined>): number {
  for (const name of Object.keys(params)) if (name !== 'page') notFound()
  const raw = params.page
  if (Array.isArray(raw)) notFound()
  const page = parseBrowsePage(raw)
  if (page === null) notFound()
  return page
}

function letterLabel(letter: string): string {
  return letter === 'other' ? 'Other' : letter.toUpperCase()
}

export async function generateMetadata({
  params,
  searchParams,
}: LetterPageProps): Promise<Metadata> {
  const [{ facet: requestedFacet, value, letter }, query] = await Promise.all([
    params,
    searchParams,
  ])
  const facet = corpusFacet(requestedFacet)
  if (!facet) {
    return { title: 'Not found', robots: pageRobotsMetadata({ index: false, follow: true }) }
  }
  const page = readPage(query)
  const label = facetValueLabel(facet.id, value)
  const title = `${label}, ${letterLabel(letter)}`
  return {
    title: page > 1 ? `${title} — page ${page}` : title,
    description: `${facet.label}: records filed under ${label} whose name starts with ${letterLabel(letter)}.`,
    alternates: { canonical: facetLetterHref(facet.id, value, letter, page) },
    robots: pageRobotsMetadata({ index: true, follow: true }),
  }
}

export default async function FacetLetterPage({ params, searchParams }: LetterPageProps) {
  const [{ facet: requestedFacet, value, letter }, query] = await Promise.all([
    params,
    searchParams,
  ])
  const facet = corpusFacet(requestedFacet)
  if (!facet) notFound()
  const page = readPage(query)

  const [user, all] = await Promise.all([
    getCurrentUser(),
    corpusFacetValueRecords(facet.id, value),
  ])
  // A letter sub-page exists only where the value is large enough to have been split, so one
  // record can never be reachable at two addresses.
  if (all.length <= FACET_LETTER_SPLIT_THRESHOLD) notFound()

  const records = recordsForLetter(all, letter)
  if (records.length === 0) notFound()

  const lastPage = lastBrowsePage(records.length)
  if (page > lastPage) notFound()
  const first = (page - 1) * FACET_PAGE_SIZE
  const shown = records.slice(first, first + FACET_PAGE_SIZE)
  const label = facetValueLabel(facet.id, value)

  return (
    <AppShell initialUser={user}>
      <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-3">
          <span className="block text-[11px] font-bold uppercase tracking-widest text-[color:var(--ink-3,#6E6E73)]">
            <a
              href={facetValueHref(facet.id, value)}
              className="text-[color:var(--accent,#0071E3)] hover:underline"
            >
              {label}
            </a>
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--ink-0,#1D1D1F)] sm:text-4xl">
            {page > 1
              ? `${label}, ${letterLabel(letter)}, page ${page} of ${lastPage}`
              : `${label}, ${letterLabel(letter)}`}
          </h1>
          <p
            data-record-count={records.length}
            className="text-xs font-semibold tabular-nums text-[color:var(--ink-3,#6E6E73)]"
          >
            {countLine(records.length, first + 1, first + shown.length)}
          </p>
        </header>

        <FacetNav current={facet.id} />

        <LetterList facet={facet.id} value={value} buckets={letterBuckets(all)} />

        <RecordList records={shown} />

        <FacetPager
          page={page}
          lastPage={lastPage}
          hrefFor={(candidate) => facetLetterHref(facet.id, value, letter, candidate)}
          label={`${label} ${letterLabel(letter)} pages`}
        />
      </div>
    </AppShell>
  )
}
