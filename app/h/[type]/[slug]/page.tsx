/**
 * `/h/<type>/<slug>` — one hub page (docs/specs/hubs.md §2).
 *
 * In order: the title and the one-line definition with its source and date; the comparison table
 * over every member; the synthesis, four to eight sentences generated from that table and the
 * members' derived sections; the member list grouped by role, each with its own first question; and
 * the sources consulted.
 *
 * Nothing on this page is written at render time. Every sentence and every cell was computed by
 * `scripts/revamp/hubs_build.py` from stored fields and loaded by `scripts/revamp/hubs_load.ts`.
 */
import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AppShell } from '@/components/AppShell'
import { HubMembers } from '@/components/hubs/HubMembers'
import { HubSynthesis } from '@/components/hubs/HubSynthesis'
import { HubTable } from '@/components/hubs/HubTable'
import { loadHubPage } from '@/lib/hubs/queries'
import { HUB_TYPE_LABEL, isHubType } from '@/lib/hubs/types'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
import { getCurrentUser } from '@/lib/session'

/** Next.js 15: route params arrive as a Promise and must be awaited. */
type HubPageProps = { params: Promise<{ type: string; slug: string }> }

const loadHub = cache(loadHubPage)

async function readParams(props: HubPageProps) {
  const { type, slug } = await props.params
  if (!isHubType(type)) return null
  const page = await loadHub(type, slug)
  return page
}

export async function generateMetadata(props: HubPageProps): Promise<Metadata> {
  const page = await readParams(props)
  if (!page) return { title: 'Group not found | RNAWiki' }
  const { hub } = page
  return {
    title: `${hub.name}: ${hub.memberCount} records | RNAWiki`,
    description:
      `${hub.definition} ${hub.memberCount} records in this corpus, ` +
      `${hub.approvedCount} approved in at least one register.`,
    alternates: { canonical: `/h/${hub.type}/${hub.slug}` },
    robots: pageRobotsMetadata({ index: true, follow: true }),
  }
}

export default async function HubPage(props: HubPageProps) {
  const [user, page] = await Promise.all([getCurrentUser(), readParams(props)])
  if (!page) notFound()
  const { hub, members, syntheses } = page

  return (
    <AppShell initialUser={user}>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        <header className="space-y-3">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-widest">
            <Link
              className="font-bold text-[#6E6E73] underline underline-offset-2 focus-visible:outline focus-visible:outline-2"
              href="/h"
            >
              Groups
            </Link>
            <span className="text-[#6E6E73]"> · {HUB_TYPE_LABEL[hub.type]}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
            {hub.name}
          </h1>
          {/* §2 item 1: the definition, its source and the date it was read, on one line. */}
          <p className="text-sm text-[#1D1D1F] leading-relaxed">
            {hub.definition}
            <span className="text-[#6E6E73]"> — {hub.definitionSource}</span>
          </p>
        </header>

        <HubTable hubName={hub.name} hubType={hub.type} members={members} />

        <HubSynthesis hubType={hub.type} syntheses={syntheses} />

        <HubMembers members={members} />

        <section aria-labelledby="hub-sources-heading" className="space-y-2">
          <h2 className="text-xl font-bold text-[#1D1D1F]" id="hub-sources-heading">
            Sources
          </h2>
          <ul className="text-xs text-[#6E6E73] leading-relaxed space-y-1.5">
            <li>Group definition: {hub.definitionSource}.</li>
            <li>
              Approval by jurisdiction and the Singapore forensic classification: the registration
              block on each member page, which names the register and the date it was read.
            </li>
            <li>
              Generic availability: the FDA Orange Book and Purple Book data files, through each
              member&apos;s patent block.
            </li>
            <li>
              Trials and posted results: ClinicalTrials.gov registrations recorded against each
              member.
            </li>
            <li>
              Membership evidence, per member:{' '}
              <span className="font-mono">hub_members.membership_evidence</span>, which names the
              stored row that put the page in this group.
            </li>
          </ul>
        </section>
      </div>
    </AppShell>
  )
}
