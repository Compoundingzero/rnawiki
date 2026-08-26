// Public, append-only revision history for one medicine record.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { eq, inArray } from 'drizzle-orm'
import { AlertTriangle, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react'
import { db } from '@/db'
import { drugs, users } from '@/db/schema'
import { AppShell } from '@/components/AppShell'
import { listRevisionsForDrug } from '@/lib/queries/revisions'
import { getCurrentUser } from '@/lib/session'
import { resolveSafeSourceLocator } from '@/lib/source-locator'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
import { TIER_LABEL } from '@/lib/trust'
import {
  LEGACY_REVISION_HISTORY_PAGE_SIZE,
  legacyRevisionChangeCountLabel,
  legacyRevisionHistoryPageHref,
  legacyRevisionTransitionLabel,
  parseLegacyRevisionHistoryPage,
} from '@/lib/legacy-revision-history'
import type { Revision, RevisionStatus } from '@/lib/types'

type HistoryPageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ page?: string | string[] }>
}

async function loadDrugIdentity(
  slug: string,
): Promise<{ id: string; slug: string; name: string; tradeName: string | null } | null> {
  const rows = await db
    .select({ id: drugs.id, slug: drugs.slug, name: drugs.name, tradeName: drugs.tradeName })
    .from(drugs)
    .where(eq(drugs.slug, slug))
    .limit(1)
  return rows[0] ?? null
}

async function loadAuthorHandles(userIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(userIds)]
  if (unique.length === 0) return new Map()

  const rows = await db
    .select({ id: users.id, handle: users.handle })
    .from(users)
    .where(inArray(users.id, unique))

  return new Map(rows.map((row) => [row.id, row.handle]))
}

const STATUS_LABEL: Record<RevisionStatus, string> = {
  published: 'Published',
  pending_review: 'Waiting for review',
  rejected: 'Declined by a reviewer',
  machine_rejected: 'Automated checks found an error',
}

const STATUS_STYLE: Record<RevisionStatus, string> = {
  published: 'text-emerald-800 bg-emerald-50 border-emerald-500/20',
  pending_review: 'text-amber-800 bg-amber-50 border-amber-500/20',
  rejected: 'text-rose-800 bg-rose-50 border-rose-500/20',
  machine_rejected: 'text-rose-800 bg-rose-50 border-rose-500/20',
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function formatTimestamp(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  const month = MONTHS[parsed.getUTCMonth()] ?? ''
  const hours = String(parsed.getUTCHours()).padStart(2, '0')
  const minutes = String(parsed.getUTCMinutes()).padStart(2, '0')
  return `${parsed.getUTCDate()} ${month} ${parsed.getUTCFullYear()}, ${hours}:${minutes} UTC`
}

function RevisionCard({ revision, handle }: { revision: Revision; handle: string | undefined }) {
  const statusLabel = revision.quarantine
    ? 'Archived — not reviewable'
    : STATUS_LABEL[revision.status]
  const statusStyle = revision.quarantine
    ? 'text-slate-700 bg-slate-100 border-slate-300'
    : STATUS_STYLE[revision.status]
  const sourceHref = revision.identityCorrection
    ? (resolveSafeSourceLocator(revision.identityCorrection.sourceUrl)?.href ?? null)
    : null

  return (
    <li className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusStyle}`}>
          {statusLabel}
        </span>
        <time dateTime={revision.createdAt} className="text-[11px] text-[#6E6E73] tabular-nums">
          {formatTimestamp(revision.createdAt)}
        </time>
      </div>

      <div className="flex items-center gap-2 flex-wrap text-xs">
        {handle ? (
          <Link
            href={`/u/${handle}`}
            className="font-bold text-[#0071E3] hover:underline cursor-pointer"
          >
            {revision.authorName}
          </Link>
        ) : (
          <span className="font-bold text-[#1D1D1F]">{revision.authorName}</span>
        )}
        <span className="text-[10px] font-semibold text-[#6E6E73] bg-black/[0.04] px-2 py-0.5 rounded-full">
          {TIER_LABEL[revision.authorTrustTier]}
        </span>
        {revision.authorOrcid && (
          <a
            href={`https://orcid.org/${revision.authorOrcid}`}
            rel="noopener noreferrer"
            target="_blank"
            className="font-mono text-[10px] text-[#6E6E73] hover:text-[#0071E3] hover:underline"
          >
            ORCID {revision.authorOrcid}
          </a>
        )}
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73]">
          Why the contributor proposed this
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[#424245] sm:text-sm">{revision.summary}</p>
      </div>

      {revision.changedFields.length > 0 && (
        <div className="rounded-2xl bg-[#F5F5F7] p-3.5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73] block">
            {revision.changedFields.length}{' '}
            {legacyRevisionChangeCountLabel(
              revision.status,
              revision.quarantine !== null,
              revision.changedFields.length,
            )}
          </span>
          <ul className="space-y-1.5">
            {revision.changedFields.map((change) => (
              <li key={change.field} className="text-[11px] leading-relaxed">
                <span className="font-bold text-[#1D1D1F]">{change.label}</span>{' '}
                <span className="text-[#6E6E73]">{change.before}</span>
                <span className="text-[#6E6E73]" aria-hidden="true">
                  {' '}
                  &rarr;{' '}
                </span>
                <span className="sr-only">
                  {' '}
                  {legacyRevisionTransitionLabel(
                    revision.status,
                    revision.quarantine !== null,
                  )}{' '}
                </span>
                <span className="text-[#1D1D1F]">{change.after}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {revision.identityCorrection && (
        <div className="space-y-1 rounded-2xl border border-black/[0.08] p-4 text-[11px] leading-5">
          <p className="font-bold text-[#1D1D1F]">Source supplied by the contributor</p>
          {sourceHref ? (
            <a
              href={sourceHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open source page: ${revision.identityCorrection.sourceTitle}`}
              className="inline-flex min-h-11 items-center gap-1.5 break-words font-semibold text-[#0071E3] hover:underline"
            >
              {revision.identityCorrection.sourceTitle}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          ) : (
            <p className="font-semibold text-[#424245]">
              {revision.identityCorrection.sourceTitle}
            </p>
          )}
          <p className="break-all font-mono text-[10px] text-[#6E6E73]">
            {revision.identityCorrection.sourceUrl}
          </p>
        </div>
      )}

      {revision.quarantine && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[11px] leading-5 text-slate-700">
          <p className="flex items-center gap-1.5 font-bold text-slate-900">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            System history note
          </p>
          <p className="mt-1">{revision.quarantine.systemReason}</p>
          <time dateTime={revision.quarantine.quarantinedAt} className="mt-1 block tabular-nums">
            Archived {formatTimestamp(revision.quarantine.quarantinedAt)}
          </time>
        </div>
      )}

      {revision.machineVerified && revision.verificationHash && (
        <details className="rounded-2xl border border-black/[0.06] p-3 text-[11px] text-[#424245]">
          <summary className="flex min-h-11 cursor-pointer items-center gap-1.5 font-semibold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Earlier structure check
          </summary>
          <p className="mt-2 leading-5">
            The earlier editor recorded that its narrow structure check passed. This does not say
            that the medicine works, is safe, or that the proposed edit was correct.
          </p>
          <p className="mt-1 break-all font-mono text-[10px] text-[#6E6E73]">
            Check reference: {revision.verificationHash}
          </p>
        </details>
      )}

      {revision.reviewedAt && (
        <div className="pt-3 border-t border-black/[0.05] space-y-1 text-[11px] text-[#6E6E73]">
          <p>
            Reviewed {formatTimestamp(revision.reviewedAt)}
            {revision.reviewedByName ? ` by ${revision.reviewedByName}` : ''}
          </p>
          {revision.reviewNote && <p className="text-[#424245]">{revision.reviewNote}</p>}
        </div>
      )}
    </li>
  )
}

export async function generateMetadata({ params }: HistoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const drug = await loadDrugIdentity(slug)
  if (!drug) {
    return {
      title: 'Revision history',
      robots: pageRobotsMetadata({ index: false, follow: true }),
    }
  }

  return {
    title: `Revision history — ${drug.name}`,
    description: `Past edits for ${drug.name}, including who submitted each change, what was suggested or published, and what reviewers decided.`,
    alternates: { canonical: `/d/${drug.slug}/history` },
    robots: pageRobotsMetadata({ index: false, follow: true }),
  }
}

export default async function RevisionHistoryPage({ params, searchParams }: HistoryPageProps) {
  const { slug } = await params
  const page = parseLegacyRevisionHistoryPage((await searchParams)?.page)

  const [user, drug] = await Promise.all([getCurrentUser(), loadDrugIdentity(slug)])
  if (!drug) notFound()

  const revisionWindow = await listRevisionsForDrug(
    drug.id,
    LEGACY_REVISION_HISTORY_PAGE_SIZE + 1,
    (page - 1) * LEGACY_REVISION_HISTORY_PAGE_SIZE,
  )
  const hasOlderPage = revisionWindow.length > LEGACY_REVISION_HISTORY_PAGE_SIZE
  const revisions = revisionWindow.slice(0, LEGACY_REVISION_HISTORY_PAGE_SIZE)
  const handles = await loadAuthorHandles(
    revisions
      .map((revision) => revision.authorUserId)
      .filter((id): id is string => typeof id === 'string'),
  )

  return (
    <AppShell initialUser={user}>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
        <header className="space-y-4">
          <Link
            href={`/d/${drug.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066CC] hover:text-[#005BB5] transition cursor-pointer group"
          >
            <ArrowLeft
              className="w-4 h-4 group-hover:-translate-x-0.5 transition shrink-0"
              aria-hidden="true"
            />
            <span>Back to {drug.name}</span>
          </Link>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73] block">
              Edit history
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
              {drug.name}{' '}
              {drug.tradeName && (
                <span className="text-xl sm:text-2xl text-[#6E6E73] font-normal">
                  ({drug.tradeName})
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
              Past proposals and published edits appear here, newest first. Each entry says whether
              it was published, is waiting for review, was declined, or was archived when RNAWiki
              introduced stricter source and review safeguards. Earlier entries cannot be changed or
              removed.
            </p>
          </div>
        </header>

        {revisions.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-2">
            <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
              {page === 1
                ? 'No edits have been suggested for this medicine page yet.'
                : 'No edits appear on this page. Use “Newer edits” to return to an earlier page.'}
            </p>
            {page === 1 && (
              <Link
                href={`/d/${drug.slug}`}
                className="text-xs font-bold text-[#0071E3] hover:underline cursor-pointer inline-block"
              >
                Open the medicine page and suggest the first edit
              </Link>
            )}
          </div>
        ) : (
          <ul className="space-y-4">
            {revisions.map((revision) => (
              <RevisionCard
                key={revision.id}
                revision={revision}
                handle={revision.authorUserId ? handles.get(revision.authorUserId) : undefined}
              />
            ))}
          </ul>
        )}

        {(page > 1 || hasOlderPage) && (
          <nav
            aria-label="Revision history pages"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.08] bg-white p-3"
          >
            {page > 1 ? (
              <Link
                href={legacyRevisionHistoryPageHref(drug.slug, page - 1)}
                rel="prev"
                className="inline-flex min-h-11 items-center rounded-xl px-3 text-xs font-bold text-[#0066CC] hover:bg-[#F5F5F7] hover:text-[#005BB5]"
              >
                Newer edits
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="text-[11px] font-semibold text-[#6E6E73]">Page {page}</span>
            {hasOlderPage ? (
              <Link
                href={legacyRevisionHistoryPageHref(drug.slug, page + 1)}
                rel="next"
                className="inline-flex min-h-11 items-center rounded-xl px-3 text-xs font-bold text-[#0066CC] hover:bg-[#F5F5F7] hover:text-[#005BB5]"
              >
                Older edits
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </nav>
        )}
      </div>
    </AppShell>
  )
}
