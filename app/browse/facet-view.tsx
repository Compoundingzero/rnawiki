/**
 * Shared markup for the corpus facet indexes and facet pages (docs/specs/browse.md).
 *
 * Every repeated element here is markup: the navigation between indexes, the count on a value row,
 * the badge triplet on a record row and the pager. No row is a sentence, and nothing is written
 * about a record beyond the words the corpus already recorded for it.
 *
 * Colour comes from the corpus ramp in `lib/corpus/tokens.css` (`--corpus-*`), the same ramp the
 * dossier template and the home corpus sections use, so browse changes with the ramp instead of
 * standing on its own unprefixed names. The literal after each comma is the ramp's own light value
 * and is only reached where the stylesheet has not loaded; no palette value changed here.
 */
import Link from 'next/link'

import '@/lib/corpus/tokens.css'

import { browsePageLinks } from '@/lib/browse-pagination'
import {
  CORPUS_FACETS,
  recordBadges,
  type CorpusFacetId,
  type CorpusFacetIndexValue,
  type CorpusFacetRecord,
  type FacetLetterBucket,
  type FacetSubPage,
} from '@/lib/corpus/facets'

/** Records listed on one facet page. The sitemap paginates by the same number. */
export const FACET_PAGE_SIZE = 60

export function facetIndexHref(facet: CorpusFacetId): string {
  return `/browse/${facet}`
}

export function facetValueHref(facet: CorpusFacetId, value: string, page = 1): string {
  const base = `/browse/${facet}/${encodeURIComponent(value)}`
  return page > 1 ? `${base}?page=${page}` : base
}

export function facetLetterHref(
  facet: CorpusFacetId,
  value: string,
  letter: string,
  page = 1,
): string {
  const base = `/browse/${facet}/${encodeURIComponent(value)}/${encodeURIComponent(letter)}`
  return page > 1 ? `${base}?page=${page}` : base
}

const LINK = 'text-[color:var(--corpus-accent,#0071E3)] hover:underline focus-visible:underline'
// The accent measures 4.70:1 on the white card and 4.31:1 on the page ground (#F5F5F7), so any
// small link that sits directly on the ground fails WCAG 1.4.3 at 4.5:1. Those links take the
// darker ink token from the same ramp (9.2:1 on the ground, 12.6:1 on white). No palette value
// changed: the accent is still the link colour everywhere it has a card behind it.
const LINK_ON_GROUND =
  'text-[color:var(--corpus-ink-1,#424245)] hover:underline focus-visible:underline'
const INK = 'text-[color:var(--corpus-ink-0,#1D1D1F)]'
const MUTED = 'text-[color:var(--corpus-ink-2,#6E6E73)]'
const CARD =
  'rounded-2xl border border-[color:var(--corpus-hairline,rgba(0,0,0,0.08))] bg-[color:var(--corpus-surface-0,#FFFFFF)]'

/** The five entry points, on every index and facet page, so no page is a dead end. */
export function FacetNav({ current }: { current?: CorpusFacetId }) {
  return (
    <nav aria-label="Browse by" className="space-y-2">
      <span className={`block text-[11px] font-bold uppercase tracking-widest ${MUTED}`}>
        Browse by
      </span>
      <ul className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {CORPUS_FACETS.map((facet) => (
          <li key={facet.id}>
            <Link
              href={facetIndexHref(facet.id)}
              aria-current={facet.id === current ? 'page' : undefined}
              className={`inline-flex min-h-8 items-center rounded-full border border-[color:var(--corpus-hairline,rgba(0,0,0,0.08))] px-3 text-xs font-semibold ${
                facet.id === current ? INK : LINK_ON_GROUND
              }`}
            >
              {facet.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/browse"
            className={`inline-flex min-h-8 items-center text-xs ${LINK_ON_GROUND}`}
          >
            Full medicine list
          </Link>
        </li>
      </ul>
    </nav>
  )
}

function subPageHref(facet: CorpusFacetId, value: string, subPage: FacetSubPage): string {
  return subPage.letter === undefined
    ? facetValueHref(facet, value, subPage.page)
    : facetLetterHref(facet, value, subPage.letter, subPage.page)
}

/**
 * The list pages beneath one facet value, linked from the index itself.
 *
 * This is what keeps the browse spec's three-click guarantee: without these links a record on a
 * letter sub-page or on the second page of a value is home → facet index → facet value → page →
 * record, which is four. Each link is a label and a count, never a sentence.
 */
function SubPageList({
  facet,
  value,
  subPages,
}: {
  facet: CorpusFacetId
  value: CorpusFacetIndexValue
  subPages: readonly FacetSubPage[]
}) {
  if (subPages.length === 0) return null
  return (
    <ul aria-label={`${value.label} pages`} className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 px-1">
      {subPages.map((subPage) => (
        <li
          key={`${subPage.letter ?? ''}-${subPage.page}`}
          data-sub-page={subPage.label}
          data-count={subPage.count}
        >
          <Link
            href={subPageHref(facet, value.id, subPage)}
            aria-label={`${value.label}, ${subPage.label}`}
            className={`inline-flex min-h-8 items-center px-1 text-[11px] font-semibold tabular-nums ${LINK_ON_GROUND}`}
          >
            {subPage.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** Facet values with their counts. The count is a number in its own element, never a sentence. */
export function FacetValueList({
  facet,
  values,
}: {
  facet: CorpusFacetId
  values: readonly CorpusFacetIndexValue[]
}) {
  return (
    <ul className="space-y-2">
      {values.map((value) => (
        <li key={value.id} data-facet={facet} data-value={value.id} data-count={value.count}>
          <Link
            href={facetValueHref(facet, value.id)}
            className={`flex items-baseline justify-between gap-4 ${CARD} px-4 py-3 text-sm font-semibold ${LINK}`}
          >
            <span>{value.label}</span>
            <span className={`text-xs tabular-nums font-semibold ${MUTED}`}>
              {value.count.toLocaleString('en-GB')}
            </span>
          </Link>
          <SubPageList facet={facet} value={value} subPages={value.subPages} />
        </li>
      ))}
    </ul>
  )
}

/** Initial-letter sub-pages, used where one facet value holds more records than a list should. */
export function LetterList({
  facet,
  value,
  buckets,
}: {
  facet: CorpusFacetId
  value: string
  buckets: readonly FacetLetterBucket[]
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {buckets.map((bucket) => (
        <li key={bucket.id} data-letter={bucket.id} data-count={bucket.count}>
          <Link
            href={facetLetterHref(facet, value, bucket.id)}
            className={`inline-flex min-h-9 items-center gap-2 rounded-xl border border-[color:var(--corpus-hairline,rgba(0,0,0,0.08))] px-3 text-sm font-semibold ${LINK_ON_GROUND}`}
          >
            <span>{bucket.label}</span>
            <span className={`text-xs tabular-nums font-normal ${MUTED}`}>
              {bucket.count.toLocaleString('en-GB')}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * One record row: the badge triplet as markup, the recorded name, and the record's first derived
 * question. A Tier 3 record is noindex, so its link carries `rel="nofollow"` (R6).
 */
function RecordRow({ record }: { record: CorpusFacetRecord }) {
  const badges = recordBadges(record)
  return (
    <li
      data-slug={record.slug}
      data-tier={record.tier}
      data-model={record.model}
      data-present-fields={record.presentFieldCount}
      data-applicable-fields={record.applicableFieldCount}
      className={`${CARD} p-4`}
    >
      <p className="flex flex-wrap items-center gap-1.5">
        {badges.map((badge) => (
          <span
            key={badge.kind}
            data-badge={badge.kind}
            className={`rounded-full border border-[color:var(--corpus-hairline,rgba(0,0,0,0.08))] px-2 py-0.5 text-[11px] font-semibold ${MUTED}`}
          >
            {badge.label}
          </span>
        ))}
      </p>
      <h2 className="mt-2 text-base font-bold tracking-tight">
        <Link
          href={`/d/${encodeURIComponent(record.slug)}`}
          rel={record.tier === 3 ? 'nofollow' : undefined}
          className={LINK}
        >
          {record.name}
        </Link>
      </h2>
      {record.firstQuestion ? (
        <p data-question className={`mt-1 text-sm ${MUTED}`}>
          {record.firstQuestion}
        </p>
      ) : null}
    </li>
  )
}

export function RecordList({ records }: { records: readonly CorpusFacetRecord[] }) {
  return (
    <ul className="space-y-3">
      {records.map((record) => (
        <RecordRow key={record.slug} record={record} />
      ))}
    </ul>
  )
}

/** The same numbered pager the medicine list uses, so no page of a list sits far from the first. */
export function FacetPager({
  page,
  lastPage,
  hrefFor,
  label,
}: {
  page: number
  lastPage: number
  hrefFor: (page: number) => string
  label: string
}) {
  if (lastPage <= 1) return null
  return (
    <nav aria-label={label} className="flex items-center justify-between gap-3 pt-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={`text-xs font-bold ${LINK_ON_GROUND}`}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <ol
        aria-label={`Page ${page.toLocaleString('en-GB')} of ${lastPage.toLocaleString('en-GB')}`}
        className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-semibold tabular-nums ${MUTED}`}
      >
        {browsePageLinks(page, lastPage).map((candidate) => (
          <li key={candidate}>
            {candidate === page ? (
              <span aria-current="page" className={`px-1 ${INK}`}>
                {candidate.toLocaleString('en-GB')}
              </span>
            ) : (
              <Link
                href={hrefFor(candidate)}
                className={`inline-flex min-h-8 items-center px-1 ${LINK_ON_GROUND}`}
              >
                {candidate.toLocaleString('en-GB')}
              </Link>
            )}
          </li>
        ))}
      </ol>
      {page < lastPage ? (
        <Link href={hrefFor(page + 1)} rel="next" className={`text-xs font-bold ${LINK_ON_GROUND}`}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}

/** `Showing 1–60 of 1,204 records`, built from the same array the rows come from. */
export function countLine(total: number, first: number, last: number): string {
  if (total === 0) return 'No records here yet.'
  return `Showing ${first.toLocaleString('en-GB')}–${last.toLocaleString('en-GB')} of ${total.toLocaleString('en-GB')} ${total === 1 ? 'record' : 'records'}`
}
