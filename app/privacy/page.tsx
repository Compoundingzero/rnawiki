import type { Metadata } from 'next'
import Link from 'next/link'

import { AppShell } from '@/components/AppShell'
import { AnalyticsPreferencesButton } from '@/components/GoogleAnalytics'
import { googleAnalyticsMeasurementId } from '@/lib/google-analytics'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What RNAWiki measures, what it never sends, and how to change or withdraw the analytics choice.',
  alternates: { canonical: '/privacy' },
  robots: pageRobotsMetadata({ index: true, follow: true }),
}

/**
 * The one place a reader changes what RNAWiki measures.
 *
 * This page exists because the control had to go somewhere. It used to be a footer item labelled
 * "Analytics choices" on every page, which put a consent control in the site's furniture and
 * explained nothing about what the choice covered. Removing it without a replacement would have
 * taken away a right, so the control moved here and the explanation came with it.
 *
 * The wording of the analytics paragraph is carried over from the editorial policy page, which was
 * the only place on the site that said what is measured and what is excluded.
 */
export default async function PrivacyPage() {
  const user = await getCurrentUser()
  const analyticsConfigured = Boolean(
    googleAnalyticsMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
  )

  return (
    <AppShell initialUser={user}>
      <article className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">Privacy</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-4xl">
            What RNAWiki measures, and how to say no.
          </h1>
          <p className="text-sm leading-7 text-[#424245]">
            Reading RNAWiki needs no account and no choice from you. Everything below is about one
            optional thing: whether we count visits.
          </p>
        </header>

        <section aria-labelledby="analytics-h" className="space-y-4">
          <h2 className="text-lg font-bold text-[#1D1D1F]" id="analytics-h">
            Analytics
          </h2>
          <div className="space-y-3 rounded-3xl border border-black/[0.08] bg-white p-6 text-sm leading-7 text-[#424245] sm:p-7">
            <p>
              Google Analytics loads only after a visitor allows it. Until then no analytics script
              runs and no analytics cookie is set. If your browser sends a Global Privacy Control
              signal or Do Not Track, the answer is recorded as no without asking.
            </p>
            <p>
              When it is allowed, RNAWiki excludes medicine searches, anything typed into a form,
              account details and the query part of a URL. Advertising signals and personalisation
              are switched off. Pages under the review queue are not measured at all.
            </p>
            <p>
              The choice is stored in your own browser. Changing it to no expires the analytics
              cookies for this site immediately.
            </p>
            {analyticsConfigured ? (
              <p className="pt-1">
                <span className="inline-flex items-center rounded-full border border-black/[0.12] px-1">
                  <AnalyticsPreferencesButton />
                </span>
              </p>
            ) : (
              <p className="text-[#6E6E73]">
                No analytics is configured on this deployment, so there is nothing to allow or
                withdraw here.
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="accounts-h" className="space-y-4">
          <h2 className="text-lg font-bold text-[#1D1D1F]" id="accounts-h">
            Accounts and contributions
          </h2>
          <div className="space-y-3 rounded-3xl border border-black/[0.08] bg-white p-6 text-sm leading-7 text-[#424245] sm:p-7">
            <p>
              An account is needed only to comment, to suggest a wording or to review one. What you
              contribute is public and attributed: a proposal, a review decision and a published
              correction all carry the name on the account that made them, and stay in the record.
            </p>
            <p>
              A review decision records the conflicts of interest the reviewer declared and the
              qualifications they held at the time. The qualification records themselves are not
              public; a page says only that a relevant qualification was verified.
            </p>
            <p>
              Reader feedback may include a contact address. Only a steward or an administrator can
              see it. For anonymous feedback RNAWiki stores a day-specific coded identifier to limit
              repeated spam, never the original internet address, and that identifier is not shown
              in any queue or public response.
            </p>
          </div>
        </section>

        <nav aria-label="Related pages" className="flex flex-wrap gap-4 text-sm font-bold">
          <Link className="text-[#0066CC] hover:underline" href="/how-it-works">
            How RNAWiki works
          </Link>
          <Link
            className="text-[#0066CC] hover:underline"
            href="/how-it-works#review-and-corrections"
          >
            Review and corrections
          </Link>
        </nav>
      </article>
    </AppShell>
  )
}
