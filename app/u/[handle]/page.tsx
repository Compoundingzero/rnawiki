// The public contributor profile.
//
// WHAT THIS PAGE MAY NOT SHOW, and why that is enforced somewhere else: no email address, no
// medical licence or NPI number, no steward's private verification note, no count of rejected
// edits. It cannot show them because `getContributorProfile` does not select them — the boundary
// is drawn in the query (`lib/queries/users.ts`), not in this component's discipline. If a future
// page needs one of those columns it needs a different function and a stated reason.
//
// The verified-physician badge requires stored verification; self-declaration is not enough.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, FileText } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { getContributorProfile } from '@/lib/queries/users'
import { getCurrentUser } from '@/lib/session'
import { TIER_DESCRIPTION, TIER_LABEL } from '@/lib/trust'

type ProfilePageProps = { params: Promise<{ handle: string }> }

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

/** Fixed UTC. A contribution ledger that reads differently depending on the viewer's timezone is
 *  not a ledger. */
function formatDate(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  const month = MONTHS[parsed.getUTCMonth()] ?? ''
  return `${parsed.getUTCDate()} ${month} ${parsed.getUTCFullYear()}`
}

function formatMonth(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  const month = MONTHS[parsed.getUTCMonth()] ?? ''
  return `${month} ${parsed.getUTCFullYear()}`
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="p-4 rounded-2xl bg-[#F5F5F7] space-y-0.5">
      <span className="text-2xl font-black text-[#1D1D1F] font-mono block tabular-nums">
        {value.toLocaleString('en-GB')}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73] block">
        {label}
      </span>
    </div>
  )
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { handle } = await params
  const profile = await getContributorProfile(handle)

  if (!profile) {
    return { title: 'Contributor not found', robots: { index: false, follow: true } }
  }

  return {
    title: `${profile.name} (@${profile.handle})`,
    description: `${profile.name} contributes to RNAWiki as a ${TIER_LABEL[profile.trustTier].toLowerCase()}. Their medicine-record proposals accepted for implementation are timestamped and public.`,
    alternates: { canonical: `/u/${profile.handle}` },
  }
}

export default async function ContributorProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params

  const [user, profile] = await Promise.all([getCurrentUser(), getContributorProfile(handle)])
  if (!profile) notFound()

  return (
    <AppShell initialUser={user}>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
        {/* Identity */}
        <header className="space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73] block">
            Contributor
          </span>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
              {profile.name}
            </h1>
            <p className="font-mono text-sm text-[#6E6E73]">@{profile.handle}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Earned, never self-declared. See the header of this file. */}
            {profile.isVerifiedDoctor && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] bg-[#0071E3]/10 px-3 py-1 rounded-full border border-[#0071E3]/20">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Verified physician</span>
              </span>
            )}
            <span className="text-xs font-semibold text-[#6E6E73] bg-black/[0.04] px-3 py-1 rounded-full">
              {TIER_LABEL[profile.trustTier]}
            </span>
            <span className="text-xs text-[#6E6E73]">Joined {formatMonth(profile.joinedDate)}</span>
          </div>

          {/* Credentials appear only beside a verified state — the query already withholds them
              otherwise, so this renders nothing rather than an unverified claim. */}
          {(profile.medicalSpecialty || profile.institution) && (
            <p className="text-xs text-[#6E6E73]">
              {[profile.medicalSpecialty, profile.institution].filter(Boolean).join(' · ')}
            </p>
          )}

          {profile.orcid && (
            <p className="text-xs">
              <a
                href={`https://orcid.org/${profile.orcid}`}
                rel="noopener noreferrer"
                target="_blank"
                className="font-mono text-[#0071E3] hover:underline"
              >
                ORCID {profile.orcid}
              </a>
            </p>
          )}
        </header>

        {/* Standing copy is shared with the account panel. Scientific review qualification is a
            separate record and is not inferred from this label. */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73] block">
              Contributor level
            </span>
            <p className="text-xs sm:text-sm text-[#424245] leading-relaxed">
              {TIER_DESCRIPTION[profile.trustTier]}
            </p>
          </div>

          {/* The database derives accepted contributions from normalized terminal review states.
              Legacy name and trade-name corrections are intentionally a separate metric. */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard value={profile.acceptedEditCount} label="Accepted contributions" />
            <StatCard value={profile.noteCount} label="Community notes" />
          </div>
        </section>

        {/* Contributions */}
        <section className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73] px-1 block">
            Accepted for implementation
          </span>

          {profile.recentContributions.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-2">
              <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
                No medicine-record proposals from this contributor have been accepted for
                implementation yet.
              </p>
              <Link
                href="/browse"
                className="text-xs font-bold text-[#0071E3] hover:underline cursor-pointer inline-block"
              >
                Browse medicines
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {profile.recentContributions.map((contribution) => (
                <li
                  key={contribution.revisionId}
                  className="bg-white rounded-3xl p-5 border border-black/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-2"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <Link
                      href={`/d/${contribution.drugSlug}`}
                      className="text-sm font-bold text-[#1D1D1F] hover:text-[#0071E3] transition cursor-pointer"
                    >
                      {contribution.drugName}
                    </Link>
                    <time
                      dateTime={contribution.createdAt}
                      className="text-[11px] text-[#6E6E73] tabular-nums shrink-0"
                    >
                      {formatDate(contribution.createdAt)}
                    </time>
                  </div>

                  <p className="text-xs text-[#424245] leading-relaxed">{contribution.summary}</p>
                </li>
              ))}
            </ul>
          )}

          <p className="flex items-start gap-1.5 text-[11px] text-[#6E6E73] leading-relaxed px-1">
            <FileText className="w-3 h-3 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Two independent reviewers assessed it; agreement resolves it, while disagreement needs
              a separate qualified steward’s recorded decision. Acceptance still does not publish
              the medical conclusion.
            </span>
          </p>
        </section>
      </div>
    </AppShell>
  )
}
