// The whole corpus, page by page.
//
// This route is NOT in the master reference wireframe, and it exists for a reason the wireframe
// never had to face: the wireframe held six medicines, so a search box reached all of them. This
// corpus holds every FDA-registered active moiety and every NIH-listed supplement ingredient, and
// a search box only reaches what the reader already knows to type. Without a browsable index, the
// other several thousand records are unreachable — by a reader and by a crawler.
//
// So it is built to look like it always belonged: the reference's cards, pills, spacing and
// language throughout, and nothing invented to fill it.
//
// Every filter is a querystring parameter, which is the whole design. It keeps this a server
// component (no client-side filter state), it makes every filtered view a real URL that can be
// linked, bookmarked and crawled, and it means the page works with JavaScript disabled — the
// filters are links and the pager is links.

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { listDrugs, type DossierDepth } from '@/lib/queries/drugs'
import { getCurrentUser } from '@/lib/session'
import {
  APPROVAL_STATUSES,
  DRUG_MODALITIES,
  type ApprovalStatus,
  type DrugDossier,
  type DrugModality,
} from '@/lib/types'

// Railway's build container cannot resolve `postgres.railway.internal`. A DB-backed route with no
// dynamic segment is a prerender candidate, so without this the production build fails here while
// passing locally.
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 60

const DEPTHS: NonNullable<DossierDepth>[] = ['flagship', 'curated', 'stub']

/** Plain English for the curation depth. Never a quality score — it is a statement about how much
 *  of the record has been written, and nothing else. */
const DEPTH_LABEL: Record<NonNullable<DossierDepth>, string> = {
  flagship: 'Flagship dossier',
  curated: 'Curated dossier',
  stub: 'Identity record',
}

// ---------------------------------------------------------------------------
// Querystring
// ---------------------------------------------------------------------------

type SearchParams = Record<string, string | string[] | undefined>

/** `?modality=a&modality=b` arrives as an array. One filter, one value: take the first. */
function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

/**
 * A value is accepted only if it is a member of the vocabulary. An unknown string is dropped
 * rather than passed to the query: `?modality=<script>` must produce the unfiltered list, not an
 * error page and not an echo of whatever was typed.
 */
function oneOf<T extends string>(raw: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.find((candidate) => candidate === raw)
}

function pageNumber(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? '1', 10)
  return Number.isFinite(parsed) && parsed > 1 ? parsed : 1
}

interface BrowseFilters {
  modality?: DrugModality
  approvalStatus?: ApprovalStatus
  depth?: NonNullable<DossierDepth>
  page: number
}

function readFilters(params: SearchParams): BrowseFilters {
  const filters: BrowseFilters = { page: pageNumber(single(params.page)) }

  const modality = oneOf(single(params.modality), DRUG_MODALITIES)
  if (modality) filters.modality = modality

  const approvalStatus = oneOf(single(params.approvalStatus), APPROVAL_STATUSES)
  if (approvalStatus) filters.approvalStatus = approvalStatus

  const depth = oneOf(single(params.depth), DEPTHS)
  if (depth) filters.depth = depth

  return filters
}

/** Rebuilds `/browse?...` from a filter set. Page 1 is left implicit so the canonical view of a
 *  filter has one URL rather than two. */
function browseHref(filters: BrowseFilters): string {
  const query = new URLSearchParams()
  if (filters.modality) query.set('modality', filters.modality)
  if (filters.approvalStatus) query.set('approvalStatus', filters.approvalStatus)
  if (filters.depth) query.set('depth', filters.depth)
  if (filters.page > 1) query.set('page', String(filters.page))
  const suffix = query.toString()
  return suffix.length > 0 ? `/browse?${suffix}` : '/browse'
}

/** The filters as a sentence, for the heading and the page description. */
function describeFilters(filters: BrowseFilters): string | null {
  const parts = [
    filters.modality,
    filters.approvalStatus,
    filters.depth ? DEPTH_LABEL[filters.depth] : undefined,
  ].filter((part): part is string => typeof part === 'string')
  return parts.length > 0 ? parts.join(' · ') : null
}

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

function FilterRow<T extends string>({
  label,
  options,
  active,
  hrefFor,
}: {
  label: string
  options: readonly T[]
  active: T | undefined
  /** `undefined` is the "All" link: it clears this filter and keeps the others. */
  hrefFor: (value: T | undefined) => string
}) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block px-1">
        {label}
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Link
          href={hrefFor(undefined)}
          aria-current={active === undefined ? 'true' : undefined}
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer ${
            active === undefined
              ? 'text-[#0071E3] bg-blue-50 border-[#0071E3]/20'
              : 'text-[#6E6E73] bg-white border-black/[0.06] hover:text-[#1D1D1F]'
          }`}
        >
          All
        </Link>
        {options.map((option) => (
          <Link
            key={option}
            href={hrefFor(option)}
            aria-current={active === option ? 'true' : undefined}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition cursor-pointer ${
              active === option
                ? 'text-[#0071E3] bg-blue-50 border-[#0071E3]/20'
                : 'text-[#6E6E73] bg-white border-black/[0.06] hover:text-[#1D1D1F]'
            }`}
          >
            {option}
          </Link>
        ))}
      </div>
    </div>
  )
}

function DrugCard({ drug }: { drug: DrugDossier }) {
  // The verdict when the record has one, the plain-language indication otherwise. A stub with
  // neither shows no summary line at all rather than a manufactured one.
  const summary = drug.oneSentenceVerdict.trim() || drug.patientFriendlyIndication.trim()
  const depth = drug.dossierDepth ?? 'stub'

  return (
    <li>
      <Link
        href={`/d/${drug.id}`}
        className="group block bg-white hover:bg-[#FAFAFC] rounded-3xl p-5 sm:p-6 border border-black/[0.08] hover:border-[#0071E3]/40 shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,113,227,0.08)] transition-all cursor-pointer space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition min-w-0">
            {drug.name}{' '}
            {drug.tradeName && (
              <span className="text-sm text-[#86868B] font-normal">({drug.tradeName})</span>
            )}
          </h2>
          <ArrowRight
            className="w-4 h-4 text-[#86868B] group-hover:text-[#0071E3] group-hover:translate-x-0.5 transition shrink-0 mt-1"
            aria-hidden="true"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-[#0071E3] bg-blue-50 px-2.5 py-0.5 rounded-full border border-[#0071E3]/20">
            {drug.modality}
          </span>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            {drug.approvalStatus}
          </span>
          <span className="text-[11px] font-semibold text-[#6E6E73] bg-black/[0.04] px-2.5 py-0.5 rounded-full">
            {DEPTH_LABEL[depth]}
          </span>
        </div>

        {summary && (
          <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">{summary}</p>
        )}
      </Link>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

type BrowsePageProps = { searchParams: Promise<SearchParams> }

export async function generateMetadata({ searchParams }: BrowsePageProps): Promise<Metadata> {
  // Next.js 15: `searchParams` is a Promise, exactly like `params`.
  const filters = readFilters(await searchParams)
  const description = describeFilters(filters)

  return {
    title: description ? `Browse: ${description}` : 'Browse every medicine',
    description: description
      ? `Every medicine on RNAwiki filed under ${description}.`
      : 'Every medicine RNAwiki holds a record for, from flagship dossiers to identity records built from public regulatory data.',
    alternates: { canonical: browseHref(filters) },
  }
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const filters = readFilters(await searchParams)

  const [user, result] = await Promise.all([
    getCurrentUser(),
    listDrugs({
      limit: PAGE_SIZE,
      offset: (filters.page - 1) * PAGE_SIZE,
      ...(filters.modality ? { modality: filters.modality } : {}),
      ...(filters.approvalStatus ? { approvalStatus: filters.approvalStatus } : {}),
      ...(filters.depth ? { depth: filters.depth } : {}),
    }),
  ])

  const { items, total } = result
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const firstOnPage = total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1
  const lastOnPage = (filters.page - 1) * PAGE_SIZE + items.length

  // `total` is a real `count(*)` over the same filter, from the same query as the rows
  // (`listDrugs` reads it with a window function). It is never a rounded headline number.
  const countLine =
    total === 0
      ? 'No records match this filter.'
      : `Showing ${firstOnPage.toLocaleString('en-GB')}–${lastOnPage.toLocaleString('en-GB')} of ${total.toLocaleString('en-GB')} ${total === 1 ? 'record' : 'records'}`

  return (
    <AppShell initialUser={user}>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
        <header className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] block">
            The whole corpus
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
            Browse every medicine
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
            Flagship dossiers, curated records, and identity records built from public regulatory
            data. A record with no verdict yet says so; nothing here is filled in to look complete.
          </p>
        </header>

        {/* Filters. Links, not buttons — so each one is a URL, and so they work without
            JavaScript. Choosing a filter always returns to page 1. */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
          <FilterRow
            label="Modality"
            options={DRUG_MODALITIES}
            active={filters.modality}
            hrefFor={(value) => browseHref({ ...filters, page: 1, modality: value })}
          />
          <FilterRow
            label="Approval status"
            options={APPROVAL_STATUSES}
            active={filters.approvalStatus}
            hrefFor={(value) => browseHref({ ...filters, page: 1, approvalStatus: value })}
          />
          <FilterRow
            label="Record depth"
            options={DEPTHS}
            active={filters.depth}
            hrefFor={(value) => browseHref({ ...filters, page: 1, depth: value })}
          />
        </section>

        <p className="text-[11px] font-semibold text-[#86868B] px-1 tabular-nums">{countLine}</p>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-2">
            <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
              Nothing matches this combination of filters.
            </p>
            <Link
              href="/browse"
              className="text-xs font-bold text-[#0071E3] hover:underline cursor-pointer inline-block"
            >
              Clear the filters
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((drug) => (
              <DrugCard key={drug.id} drug={drug} />
            ))}
          </ul>
        )}

        {/* Pager. Rendered only when there is more than one page, and each side disappears at the
            end rather than turning into a dead control. */}
        {lastPage > 1 && (
          <nav
            aria-label="Corpus pages"
            className="flex items-center justify-between gap-3 pt-2"
          >
            {filters.page > 1 ? (
              <Link
                href={browseHref({ ...filters, page: filters.page - 1 })}
                rel="prev"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0071E3] hover:text-[#0077ED] transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Previous</span>
              </Link>
            ) : (
              <span />
            )}

            <span className="text-[11px] font-semibold text-[#86868B] tabular-nums">
              Page {filters.page.toLocaleString('en-GB')} of {lastPage.toLocaleString('en-GB')}
            </span>

            {filters.page < lastPage ? (
              <Link
                href={browseHref({ ...filters, page: filters.page + 1 })}
                rel="next"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0071E3] hover:text-[#0077ED] transition cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </AppShell>
  )
}
