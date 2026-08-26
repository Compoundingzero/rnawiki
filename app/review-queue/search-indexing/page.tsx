import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AppShell } from '@/components/AppShell'
import { canManageInternalReview } from '@/lib/internal-review-policy'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
import { loadMedicinePublicationIndexabilityReports } from '@/lib/seo/publication-indexability'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search indexing report',
  robots: pageRobotsMetadata({ index: false, follow: false }),
}

function formatDate(value: Date | null): string {
  if (!value) return 'No public date'
  return value.toISOString().slice(0, 10)
}

export default async function SearchIndexingReportPage() {
  const user = await getCurrentUser()
  if (!user || !canManageInternalReview(user)) notFound()

  const reports = await loadMedicinePublicationIndexabilityReports()
  const indexableCount = reports.filter((report) => report.decision.index).length

  return (
    <AppShell initialUser={user}>
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">
            Editor diagnostic
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-4xl">
            Search indexing report
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-[#6E6E73]">
            This report applies the same fail-closed publication policy as dossier metadata and the
            XML sitemap. It reports stored workflow and monitoring state; it does not grade medical
            evidence or suggest replacement claims.
          </p>
          <p className="text-xs font-semibold tabular-nums text-[#424245]">
            {indexableCount} of {reports.length} public medicine identities are currently eligible.
          </p>
          <Link
            href="/review-queue"
            className="inline-flex min-h-6 items-center text-xs font-bold text-[#0071E3] hover:underline"
          >
            Back to review queue
          </Link>
        </header>

        <ul className="space-y-4" aria-label="Medicine indexing decisions">
          {reports.map((report) => {
            const canonicalSlug = report.decision.canonicalSlug
            const canLink = Boolean(
              canonicalSlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(canonicalSlug),
            )
            return (
              <li
                key={report.medicineId}
                className="space-y-3 rounded-3xl border border-black/[0.08] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#1D1D1F]">
                      {canLink ? (
                        <Link href={`/d/${canonicalSlug}`} className="hover:underline">
                          {report.medicineName}
                        </Link>
                      ) : (
                        report.medicineName
                      )}
                    </h2>
                    <p className="mt-1 font-mono text-[11px] text-[#6E6E73]">
                      slug: {report.canonicalSlug} · internal id: {report.medicineId}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                      report.decision.index
                        ? 'border-emerald-600/20 bg-emerald-50 text-emerald-800'
                        : 'border-amber-600/20 bg-amber-50 text-amber-900'
                    }`}
                  >
                    {report.decision.index ? 'Indexable' : 'Noindex'}
                  </span>
                </div>

                <dl className="grid gap-2 text-xs text-[#424245] sm:grid-cols-3">
                  <div>
                    <dt className="font-bold">Selected programme</dt>
                    <dd className="mt-0.5 font-mono text-[11px]">
                      {report.selectedProgrammeId ?? 'No current publication'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold">Source freshness</dt>
                    <dd className="mt-0.5">{report.freshness.replace('_', ' ')}</dd>
                  </div>
                  <div>
                    <dt className="font-bold">Public content date</dt>
                    <dd className="mt-0.5">
                      {formatDate(report.decision.lastPublicContentUpdate)}
                    </dd>
                  </div>
                </dl>

                {report.issues.length > 0 && (
                  <div className="rounded-2xl bg-[#F5F5F7] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#6E6E73]">
                      Why this page is excluded
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-[#424245]">
                      {report.issues.map((issue) => (
                        <li key={issue.code}>
                          {issue.explanation}{' '}
                          <span className="font-mono text-[10px] text-[#6E6E73]">
                            ({issue.code})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </AppShell>
  )
}
