// The public review queue.
//
// Public on purpose, and that is the whole idea: an edit that a machine could not fault is
// visible to everyone while it waits for a person, so the queue can be audited by anyone who
// suspects it is being used to bury inconvenient corrections. Reading it needs no account.
// Deciding needs standing (`trusted`/`steward`) or an administrator, and the server checks that
// again on every decision — see docs/api-contract.md.
//
// Not in the master reference wireframe, which had no server, no contributors and no queue. The
// card language is the reference's throughout.

import type { Metadata } from 'next'
import Link from 'next/link'
import { inArray } from 'drizzle-orm'
import { ShieldCheck } from 'lucide-react'
import { db } from '@/db'
import { users } from '@/db/schema'
import { AppShell } from '@/components/AppShell'
import { countPendingRevisions, listPendingRevisions } from '@/lib/queries/revisions'
import { getCurrentUser } from '@/lib/session'
import { TIER_LABEL } from '@/lib/trust'
import type { CommentUser, Revision, TrustTier } from '@/lib/types'
import { ReviewActions } from './ReviewActions'

// Railway's build container cannot resolve `postgres.railway.internal`. A DB-backed route with no
// dynamic segment is a prerender candidate, so without this the production build fails here while
// passing locally.
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

/**
 * Who may decide. Mirrors `POST /api/revisions/:id/review` in docs/api-contract.md — the server is
 * the gate, and this list only decides whether the controls are drawn.
 */
const REVIEWER_TIERS: TrustTier[] = ['trusted', 'steward']

function canReview(user: CommentUser | null): boolean {
  if (!user) return false
  if (user.isAdmin) return true
  return user.trustTier !== undefined && REVIEWER_TIERS.includes(user.trustTier)
}

/**
 * Public handles for a set of author ids, in one query. A revision denormalises the author's name
 * so credit survives a rename, but not their handle, and a handle is what a profile URL is built
 * from — so it is resolved live and a changed handle keeps every historical link working.
 *
 * Only `id` and `handle` are selected. Nothing else on a `users` row belongs on a public page.
 */
async function loadAuthorHandles(userIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(userIds)]
  if (unique.length === 0) return new Map()

  const rows = await db
    .select({ id: users.id, handle: users.handle })
    .from(users)
    .where(inArray(users.id, unique))

  return new Map(rows.map((row) => [row.id, row.handle]))
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

/** Fixed UTC, not the reader's locale: a queue where two people see different submission times
 *  cannot be reasoned about together. */
function formatTimestamp(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  const month = MONTHS[parsed.getUTCMonth()] ?? ''
  const hours = String(parsed.getUTCHours()).padStart(2, '0')
  const minutes = String(parsed.getUTCMinutes()).padStart(2, '0')
  return `${parsed.getUTCDate()} ${month} ${parsed.getUTCFullYear()}, ${hours}:${minutes} UTC`
}

function QueuedRevision({
  revision,
  handle,
  showActions,
}: {
  revision: Revision
  handle: string | undefined
  showActions: boolean
}) {
  return (
    <li className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <Link
          href={`/d/${revision.drugSlug}`}
          className="text-lg font-extrabold text-[#1D1D1F] hover:text-[#0071E3] tracking-tight transition cursor-pointer"
        >
          {revision.drugName}
        </Link>
        <time dateTime={revision.createdAt} className="text-[11px] text-[#86868B] tabular-nums">
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
            className="font-mono text-[10px] text-[#86868B] hover:text-[#0071E3] hover:underline"
          >
            ORCID {revision.authorOrcid}
          </a>
        )}
      </div>

      <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">{revision.summary}</p>

      {revision.changedFields.length > 0 && (
        <div className="rounded-2xl bg-[#F5F5F7] p-3.5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block">
            {revision.changedFields.length}{' '}
            {revision.changedFields.length === 1 ? 'field changed' : 'fields changed'}
          </span>
          <ul className="space-y-1.5">
            {revision.changedFields.map((change) => (
              <li key={change.field} className="text-[11px] leading-relaxed">
                <span className="font-bold text-[#1D1D1F]">{change.label}</span>{' '}
                <span className="text-[#86868B]">{change.before}</span>
                <span className="text-[#86868B]" aria-hidden="true">
                  {' '}
                  &rarr;{' '}
                </span>
                <span className="sr-only"> changed to </span>
                <span className="text-[#1D1D1F]">{change.after}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Everything in this queue passed the sweep — that is the entry condition — so the hash is
          the reviewer's handle on which structure was checked. It is the engine's own digest, not
          a string composed here. */}
      {revision.machineVerified && revision.verificationHash && (
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Machine-verified structure</span>
          <span aria-hidden="true">&middot;</span>
          <code className="font-mono tracking-tight">{revision.verificationHash}</code>
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap text-[11px]">
        <Link
          href={`/d/${revision.drugSlug}/history`}
          className="font-bold text-[#0071E3] hover:underline cursor-pointer"
        >
          Full history of this record
        </Link>
      </div>

      {showActions && <ReviewActions revisionId={revision.id} drugName={revision.drugName} />}
    </li>
  )
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Review queue',
  description:
    'Edits that passed every machine check on RNAwiki and are waiting for a person to read them. Public, so the queue itself can be audited.',
  alternates: { canonical: '/review-queue' },
}

type ReviewQueuePageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function ReviewQueuePage({ searchParams }: ReviewQueuePageProps) {
  // Next.js 15: `searchParams` is a Promise, exactly like `params`.
  const params = await searchParams
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page
  const parsedPage = Number.parseInt(rawPage ?? '1', 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 1 ? parsedPage : 1

  const [user, revisions, total] = await Promise.all([
    getCurrentUser(),
    // ORDER: oldest first. That is `listPendingRevisions`' own documented decision, not an
    // oversight here — a queue sorted newest-first starves the unlucky submission at the bottom,
    // which is the failure mode that kills review queues. The heading says so out loud.
    listPendingRevisions({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    countPendingRevisions(),
  ])

  const handles = await loadAuthorHandles(
    revisions
      .map((revision) => revision.authorUserId)
      .filter((id): id is string => typeof id === 'string'),
  )

  const showActions = canReview(user)
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <AppShell initialUser={user}>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
        <header className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] block">
            Open review queue
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
            Waiting for a human
          </h1>
          {/* The one line the brief asks for: what this queue is. */}
          <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
            These edits passed every machine check — the sequence, the thermodynamics and the
            laboratory protocol graph — and are now waiting for a person to read them. Oldest at
            the top, so nothing waits forever. Anyone can read this page; deciding takes an
            account with review standing.
          </p>
          <p className="text-[11px] font-semibold text-[#86868B] tabular-nums">
            {total === 0
              ? 'Nothing is waiting.'
              : `${total.toLocaleString('en-GB')} ${total === 1 ? 'edit' : 'edits'} waiting`}
          </p>
        </header>

        {!showActions && total > 0 && (
          <p className="text-[11px] text-[#86868B] leading-relaxed bg-white rounded-2xl px-4 py-3 border border-black/[0.06]">
            {/* Stated rather than implied. A reader with no controls should know why, and know
                that the queue is not hiding anything from them. */}
            You are reading the queue. Approving or returning an edit needs a trusted-editor or
            steward account — standing that is earned by accepted edits, never granted on request.
          </p>
        )}

        {revisions.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-2">
            <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
              No edits are waiting for review right now.
            </p>
            <Link
              href="/browse"
              className="text-xs font-bold text-[#0071E3] hover:underline cursor-pointer inline-block"
            >
              Browse the corpus
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {revisions.map((revision) => (
              <QueuedRevision
                key={revision.id}
                revision={revision}
                handle={revision.authorUserId ? handles.get(revision.authorUserId) : undefined}
                showActions={showActions}
              />
            ))}
          </ul>
        )}

        {lastPage > 1 && (
          <nav aria-label="Queue pages" className="flex items-center justify-between gap-3 pt-2">
            {page > 1 ? (
              <Link
                href={page - 1 === 1 ? '/review-queue' : `/review-queue?page=${page - 1}`}
                rel="prev"
                className="text-xs font-bold text-[#0071E3] hover:text-[#0077ED] transition cursor-pointer"
              >
                Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-[11px] font-semibold text-[#86868B] tabular-nums">
              Page {page.toLocaleString('en-GB')} of {lastPage.toLocaleString('en-GB')}
            </span>
            {page < lastPage ? (
              <Link
                href={`/review-queue?page=${page + 1}`}
                rel="next"
                className="text-xs font-bold text-[#0071E3] hover:text-[#0077ED] transition cursor-pointer"
              >
                Next
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
