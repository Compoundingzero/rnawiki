// Paginated medicine index. Filters live in the URL, so filtered views can be linked, bookmarked,
// crawled, and used without client-side JavaScript.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import {
  BROWSE_PAGE_SIZE,
  browsePageLinks,
  lastBrowsePage,
  parseBrowsePage,
} from '@/lib/browse-pagination'
import { listDrugs, type DossierDepth } from '@/lib/queries/drugs'
import { getPublicMedicineProjections } from '@/lib/queries/public-medicine-projection'
import {
  buildLegacyMedicineProjection,
  toPublicMedicineCardView,
  type PublicMedicineProjection,
} from '@/lib/public-medicine-projection'
import { publicApprovalStatusLabel, publicMedicineTypeLabel } from '@/lib/public-medicine-language'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
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

const DEPTHS: NonNullable<DossierDepth>[] = ['flagship', 'curated', 'stub']

/** Plain English for the curation depth. Never a quality score — it is a statement about how much
 *  of the record has been written, and nothing else. */
const DEPTH_LABEL: Record<NonNullable<DossierDepth>, string> = {
  flagship: 'Detailed record',
  curated: 'Expanded record',
  stub: 'Basic record',
}

// ---------------------------------------------------------------------------
// Querystring
// ---------------------------------------------------------------------------

type SearchParams = Record<string, string | string[] | undefined>

const ALLOWED_BROWSE_PARAMS = new Set(['modality', 'approvalStatus', 'depth', 'page'])

function hasParam(params: SearchParams, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(params, name)
}

/** Duplicate query keys create multiple crawlable spellings and are never a valid filter. */
function strictSingle(params: SearchParams, name: string): string | undefined {
  const value = params[name]
  if (Array.isArray(value)) notFound()
  return value
}

function strictOneOf<T extends string>(
  params: SearchParams,
  name: string,
  allowed: readonly T[],
): T | undefined {
  if (!hasParam(params, name)) return undefined
  const raw = strictSingle(params, name)
  const match = allowed.find((candidate) => candidate === raw)
  if (!match) notFound()
  return match
}

interface BrowseFilters {
  modality?: DrugModality
  approvalStatus?: ApprovalStatus
  depth?: NonNullable<DossierDepth>
  page: number
}

function readFilters(params: SearchParams): BrowseFilters {
  for (const name of Object.keys(params)) {
    if (!ALLOWED_BROWSE_PARAMS.has(name)) notFound()
  }

  const hasExplicitPage = hasParam(params, 'page')
  const rawPage = strictSingle(params, 'page')
  if (hasExplicitPage && rawPage === '') notFound()
  const page = parseBrowsePage(rawPage)
  if (page === null) notFound()
  const filters: BrowseFilters = { page }

  const modality = strictOneOf(params, 'modality', DRUG_MODALITIES)
  if (modality) filters.modality = modality

  const approvalStatus = strictOneOf(params, 'approvalStatus', APPROVAL_STATUSES)
  if (approvalStatus) filters.approvalStatus = approvalStatus

  const depth = strictOneOf(params, 'depth', DEPTHS)
  if (depth) filters.depth = depth

  return filters
}

function hasBrowseFilter(filters: BrowseFilters): boolean {
  return Boolean(filters.modality || filters.approvalStatus || filters.depth)
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
  labelFor = (value) => value,
}: {
  label: string
  options: readonly T[]
  active: T | undefined
  /** `undefined` is the "All" link: it clears this filter and keeps the others. */
  hrefFor: (value: T | undefined) => string
  labelFor?: (value: T) => string
}) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73] block px-1">
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
            {labelFor(option)}
          </Link>
        ))}
      </div>
    </div>
  )
}

function DrugCard({
  drug,
  projection,
}: {
  drug: DrugDossier
  projection: PublicMedicineProjection
}) {
  const card = toPublicMedicineCardView(projection)
  const depth = drug.dossierDepth ?? 'stub'

  return (
    <li>
      <Link
        href={card.href}
        className="group block bg-white hover:bg-[#FAFAFC] rounded-3xl p-5 sm:p-6 border border-black/[0.08] hover:border-[#0071E3]/40 shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,113,227,0.08)] transition-all cursor-pointer space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition min-w-0">
            {drug.name}{' '}
            {drug.tradeName && (
              <span className="text-sm text-[#6E6E73] font-normal">({drug.tradeName})</span>
            )}
          </h2>
          <ArrowRight
            className="w-4 h-4 text-[#6E6E73] group-hover:text-[#0071E3] group-hover:translate-x-0.5 transition shrink-0 mt-1"
            aria-hidden="true"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-[#0071E3] bg-blue-50 px-2.5 py-0.5 rounded-full border border-[#0071E3]/20">
            {publicMedicineTypeLabel(drug.modality)}
          </span>
          <span className="rounded-full border border-black/[0.08] bg-[#F5F5F7] px-2.5 py-0.5 text-[11px] font-semibold text-[#424245]">
            {publicApprovalStatusLabel(drug.approvalStatus)}
          </span>
          <span className="text-[11px] font-semibold text-[#6E6E73] bg-black/[0.04] px-2.5 py-0.5 rounded-full">
            {DEPTH_LABEL[depth]}
          </span>
        </div>

        {card.context && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73]">
            {card.context}
          </p>
        )}
        {card.summary.text && (
          <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">{card.summary.text}</p>
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
  // Each page of the unfiltered list holds a different sixty records, so page two is a distinct
  // page rather than a copy of page one, and it is the only internal link to the records it lists.
  // Filter combinations stay out of the index: they re-cut the same records into many overlapping
  // URLs. Indexability and the canonical address are now decided separately, because a page that
  // says "do not index me" while pointing at a different address gives a crawler two conflicting
  // instructions about the same URL.
  const indexable = !hasBrowseFilter(filters)

  return {
    title: description
      ? `Browse: ${description}`
      : filters.page > 1
        ? `Browse medicine records — page ${filters.page}`
        : 'Browse medicine records',
    description: description
      ? `RNAWiki medicine records filed under ${description}.`
      : 'Browse every medicine record on RNAWiki, from detailed records to basic records that identify the medicine and its regulatory status.',
    // Every view points at itself. `browseHref` leaves page one implicit, so `/browse?page=1`
    // still resolves to `/browse` rather than becoming a second address for the same list.
    alternates: { canonical: browseHref(filters) },
    robots: pageRobotsMetadata({ index: indexable, follow: true }),
  }
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const filters = readFilters(await searchParams)

  const [user, result] = await Promise.all([
    getCurrentUser(),
    listDrugs({
      limit: BROWSE_PAGE_SIZE,
      offset: (filters.page - 1) * BROWSE_PAGE_SIZE,
      ...(filters.modality ? { modality: filters.modality } : {}),
      ...(filters.approvalStatus ? { approvalStatus: filters.approvalStatus } : {}),
      ...(filters.depth ? { depth: filters.depth } : {}),
    }),
  ])

  const { items, total } = result
  const lastPage = lastBrowsePage(total)
  if (filters.page > lastPage) notFound()
  if (total === 0 && hasBrowseFilter(filters)) notFound()

  const projections = await getPublicMedicineProjections(items.map((drug) => drug.id))
  const firstOnPage = total === 0 ? 0 : (filters.page - 1) * BROWSE_PAGE_SIZE + 1
  const lastOnPage = (filters.page - 1) * BROWSE_PAGE_SIZE + items.length

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
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73] block">
            Medicine library
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
            {filters.page > 1
              ? `Browse medicines, page ${filters.page} of ${lastPage}`
              : 'Browse medicines'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
            Some records contain detailed evidence; others currently contain only basic identity and
            regulatory information. Reviewed conclusions appear only when they are available for a
            specific use and group of people.
          </p>
        </header>

        {/* Filters. Links, not buttons — so each one is a URL, and so they work without
            JavaScript. Choosing a filter always returns to page 1. */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
          <FilterRow
            label="Medicine type"
            options={DRUG_MODALITIES}
            active={filters.modality}
            hrefFor={(value) => browseHref({ ...filters, page: 1, modality: value })}
            labelFor={publicMedicineTypeLabel}
          />
          <FilterRow
            label="Approval status"
            options={APPROVAL_STATUSES}
            active={filters.approvalStatus}
            hrefFor={(value) => browseHref({ ...filters, page: 1, approvalStatus: value })}
            labelFor={publicApprovalStatusLabel}
          />
          <FilterRow
            label="Amount of information"
            options={DEPTHS}
            active={filters.depth}
            hrefFor={(value) => browseHref({ ...filters, page: 1, depth: value })}
            labelFor={(value) => DEPTH_LABEL[value]}
          />
        </section>

        <p className="text-[11px] font-semibold text-[#6E6E73] px-1 tabular-nums">{countLine}</p>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-2">
            <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
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
              <DrugCard
                key={drug.id}
                drug={drug}
                projection={
                  projections.get(drug.id) ??
                  buildLegacyMedicineProjection({
                    medicineSlug: drug.id,
                    patientFriendlyIndication: drug.patientFriendlyIndication,
                    indication: drug.indication,
                  })
                }
              />
            ))}
          </ul>
        )}

        {/* Pager. Rendered only when there is more than one page, and each side disappears at the
            end rather than turning into a dead control. */}
        {lastPage > 1 && (
          <nav
            aria-label="Medicine list pages"
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

            {/* Numbered jumps keep every page a few hops from the first, so a crawler that follows
                links reaches every record; `next` alone put the last page 165 hops away. */}
            <ol
              aria-label={`Page ${filters.page.toLocaleString('en-GB')} of ${lastPage.toLocaleString('en-GB')}`}
              className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-semibold tabular-nums text-[#6E6E73]"
            >
              {browsePageLinks(filters.page, lastPage).map((page) => (
                <li key={page}>
                  {page === filters.page ? (
                    <span aria-current="page" className="px-1 text-[#1D1D1F]">
                      {page.toLocaleString('en-GB')}
                    </span>
                  ) : (
                    <Link
                      href={browseHref({ ...filters, page })}
                      className="inline-flex min-h-8 items-center px-1 text-[#0071E3] hover:text-[#0077ED] transition"
                    >
                      {page.toLocaleString('en-GB')}
                    </Link>
                  )}
                </li>
              ))}
            </ol>

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
