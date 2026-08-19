// The public revision history for one record.
//
// This page is the product's evidence that the wiki layer is real. Every proposed edit appears
// here — published, queued, rejected by a human, or rejected by the engine — with who wrote it,
// what standing they had at the time, exactly which fields moved, and the deterministic hash of
// the structure the engine swept. Rows are append-only in the database (`db/schema.ts`), so this
// list is a record, not a report: nothing on it can be quietly amended later.
//
// Not in the reference wireframe, which had no server and therefore no history to point at. The
// card language is the reference's throughout.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { eq, inArray } from 'drizzle-orm'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { db } from '@/db'
import { drugs, users } from '@/db/schema'
import { AppShell } from '@/components/AppShell'
import { listRevisionsForDrug } from '@/lib/queries/revisions'
import { getCurrentUser } from '@/lib/session'
import { TIER_LABEL } from '@/lib/trust'
import type { Revision, RevisionStatus } from '@/lib/types'

/**
 * Newest first, capped. A record with thousands of revisions would otherwise render thousands of
 * cards in one response; the page says out loud when it is showing a window rather than the whole
 * history, because a truncated list presented as complete is exactly the kind of quiet lie this
 * site exists to catch.
 */
const HISTORY_LIMIT = 200

type HistoryPageProps = { params: Promise<{ slug: string }> }

/**
 * Identity only: the four columns the heading needs.
 *
 * Written here rather than routed through `lib/queries/drugs.ts` because that module has no
 * identity-sized read — `getDrugBySlug` returns the whole dossier plus a second query for its
 * community notes, and pulling several kilobytes of jsonb to print a name in an <h1> is the exact
 * habit the header of that file warns against. `getDrugIdBySlug` is close but cannot supply a name
 * for a record whose history is empty.
 */
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

/**
 * Public handles for a set of author ids, in one query.
 *
 * A revision row denormalises the author's NAME at submission time so the credit it was signed
 * with survives a later rename — but it does not store a handle, and a handle is the thing a
 * profile URL is built from. Resolving it live is also the correct behaviour: if somebody changes
 * their handle, every historical link should follow them, and a snapshot would rot into 404s.
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

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

/** Plain English for a machine vocabulary. The pill colour is never the only signal. */
const STATUS_LABEL: Record<RevisionStatus, string> = {
  published: 'Published',
  pending_review: 'Waiting for review',
  rejected: 'Declined by a reviewer',
  machine_rejected: 'Rejected by the structure check',
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

/**
 * A fixed UTC rendering rather than `toLocaleString`.
 *
 * The reader's timezone is not knowable on the server, and an immutable ledger that prints a
 * different timestamp depending on who is looking is not much of a ledger. UTC is stated in the
 * string so the reader can convert it themselves.
 */
function formatTimestamp(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  const month = MONTHS[parsed.getUTCMonth()] ?? ''
  const hours = String(parsed.getUTCHours()).padStart(2, '0')
  const minutes = String(parsed.getUTCMinutes()).padStart(2, '0')
  return `${parsed.getUTCDate()} ${month} ${parsed.getUTCFullYear()}, ${hours}:${minutes} UTC`
}

function RevisionCard({ revision, handle }: { revision: Revision; handle: string | undefined }) {
  return (
    <li className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
      {/* Status and timestamp */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[revision.status]}`}
        >
          {STATUS_LABEL[revision.status]}
        </span>
        <time dateTime={revision.createdAt} className="text-[11px] text-[#86868B] tabular-nums">
          {formatTimestamp(revision.createdAt)}
        </time>
      </div>

      {/* Author, standing at the time of writing, ORCID */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {handle ? (
          <Link
            href={`/u/${handle}`}
            className="font-bold text-[#0071E3] hover:underline cursor-pointer"
          >
            {revision.authorName}
          </Link>
        ) : (
          // No account behind the name: an anonymous submission, or an account since deleted.
          // The stored name still stands; there is simply no profile to point at.
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

      {/* Field-level diff, exactly as `diffDossiers` recorded it at submission time. */}
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

      {/* The engine's own digest. Present only when a sweep actually passed — there is no
          "unverified" counterpart badge, because absence is the honest signal. */}
      {revision.machineVerified && revision.verificationHash && (
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Machine-verified structure</span>
          <span aria-hidden="true">&middot;</span>
          <code className="font-mono tracking-tight">{revision.verificationHash}</code>
        </p>
      )}

      {/* The human decision, when one has been made. */}
      {revision.reviewedAt && (
        <div className="pt-3 border-t border-black/[0.05] space-y-1 text-[11px] text-[#86868B]">
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

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: HistoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const drug = await loadDrugIdentity(slug)
  if (!drug) return { title: 'Revision history', robots: { index: false, follow: true } }

  return {
    title: `Revision history — ${drug.name}`,
    description: `Every edit ever proposed to the ${drug.name} dossier on RNAwiki: who wrote it, which fields moved, and what the deterministic structure check said.`,
    alternates: { canonical: `/d/${drug.slug}/history` },
  }
}

export default async function RevisionHistoryPage({ params }: HistoryPageProps) {
  const { slug } = await params

  const [user, drug] = await Promise.all([getCurrentUser(), loadDrugIdentity(slug)])
  if (!drug) notFound()

  const revisions = await listRevisionsForDrug(drug.id, HISTORY_LIMIT)
  const handles = await loadAuthorHandles(
    revisions
      .map((revision) => revision.authorUserId)
      .filter((id): id is string => typeof id === 'string'),
  )

  const isTruncated = revisions.length === HISTORY_LIMIT

  return (
    <AppShell initialUser={user}>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
        <header className="space-y-4">
          <Link
            href={`/d/${drug.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] hover:text-[#0077ED] transition cursor-pointer group"
          >
            <ArrowLeft
              className="w-4 h-4 group-hover:-translate-x-0.5 transition shrink-0"
              aria-hidden="true"
            />
            <span>Back to {drug.name}</span>
          </Link>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B] block">
              Revision history
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
              {drug.name}{' '}
              {drug.tradeName && (
                <span className="text-xl sm:text-2xl text-[#86868B] font-normal">
                  ({drug.tradeName})
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
              Every edit ever proposed to this record, newest first — published, waiting, or
              declined. Rows are written once and never rewritten, so this is the whole account of
              how the dossier came to say what it says.
            </p>
          </div>
        </header>

        {revisions.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-2">
            <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
              No edits have been proposed to this record yet.
            </p>
            <Link
              href={`/d/${drug.slug}`}
              className="text-xs font-bold text-[#0071E3] hover:underline cursor-pointer inline-block"
            >
              Open the dossier and make the first one
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {revisions.map((revision) => (
                <RevisionCard
                  key={revision.id}
                  revision={revision}
                  handle={
                    revision.authorUserId ? handles.get(revision.authorUserId) : undefined
                  }
                />
              ))}
            </ul>

            {isTruncated && (
              <p className="text-[11px] text-[#86868B] text-center leading-relaxed">
                Showing the {HISTORY_LIMIT} most recent revisions. Older ones are still stored and
                are still part of the record.
              </p>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
