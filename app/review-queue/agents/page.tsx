import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AppShell } from '@/components/AppShell'
import { canReviewAgentEvidence } from '@/lib/agent-review-policy'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
import { getCurrentUser } from '@/lib/session'
import { AgentReviewWorkbench } from './AgentReviewWorkbench'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Agent evidence review',
  robots: pageRobotsMetadata({ index: false, follow: false }),
}

export default async function AgentReviewQueuePage() {
  const user = await getCurrentUser()
  if (!user || !canReviewAgentEvidence(user)) notFound()

  return (
    <AppShell initialUser={user}>
      <main className="mx-auto w-full max-w-7xl space-y-7 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">
            Private evidence workbench
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-4xl">
            Agent evidence review
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-[#6E6E73]">
            Review deterministic observations against the exact evidence stored for the current
            agent run. Decisions append review memory; they never rewrite a medicine, choose a
            source, or publish a correction.
          </p>
        </header>
        <AgentReviewWorkbench />
      </main>
    </AppShell>
  )
}
