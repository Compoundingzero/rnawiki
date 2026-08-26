import type { Metadata } from 'next'
import Link from 'next/link'

import { AppShell } from '@/components/AppShell'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Editorial and Evidence Policy',
  description:
    'RNAWiki policy for programme scope, sources, human review, uncertainty, conflicts, corrections and publication.',
  alternates: { canonical: '/editorial-policy' },
}

const POLICIES = [
  {
    title: 'Scope before conclusion',
    text: 'Every reviewed conclusion is confined to one defined use, population, dose or exposure, time period and set of trials. Evidence from one programme is not silently generalized to the whole medicine.',
  },
  {
    title: 'Exact saved sources',
    text: 'Important claims link to immutable source snapshots. A later source change creates review work; it does not rewrite the already published record without a new reviewed publication.',
  },
  {
    title: 'People judge meaning',
    text: 'Software checks structure and consistency. Identified people author the candidate and qualified independent reviewers assess the exact version and its recorded conflicts of interest before publication.',
  },
  {
    title: 'Unknown remains unknown',
    text: 'Not measured, unknown, mixed, contradicted and confirmed are distinct states. Missing information is not filled with generated medical content or converted into a negative result.',
  },
  {
    title: 'Corrections preserve history',
    text: 'A correction or challenge is attributed, source-linked and reviewed. Publishing a successor moves the public pointer to a complete reviewed version while earlier versions remain available in the public history.',
  },
] as const

export default async function EditorialPolicyPage() {
  const user = await getCurrentUser()

  return (
    <AppShell initialUser={user}>
      <article className="mx-auto w-full max-w-2xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">
            Editorial policy
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-5xl">
            How an evidence answer earns publication.
          </h1>
          <p className="text-sm leading-7 text-[#424245] sm:text-base">
            These rules describe the public publication boundary enforced by RNAWiki’s evidence
            model. They do not imply that every medicine identity record has completed review.
          </p>
        </header>

        <ol className="space-y-4">
          {POLICIES.map((policy, index) => (
            <li
              key={policy.title}
              className="rounded-3xl border border-black/[0.08] bg-white p-6 sm:p-7"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#0071E3]">
                Policy {index + 1}
              </p>
              <h2 className="mt-2 text-lg font-bold text-[#1D1D1F]">{policy.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[#424245]">{policy.text}</p>
            </li>
          ))}
        </ol>

        <nav aria-label="Related policies" className="flex flex-wrap gap-4 text-sm font-bold">
          <Link href="/how-it-works" className="text-[#0066CC] hover:underline">
            Evidence methodology
          </Link>
          <Link href="/review-queue" className="text-[#0066CC] hover:underline">
            Public review queue
          </Link>
        </nav>
      </article>
    </AppShell>
  )
}
