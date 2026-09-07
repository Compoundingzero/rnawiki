/**
 * `/h` — the hub index (docs/specs/hubs.md §3).
 *
 * The three hub kinds, and within each kind every hub in alphabetical order with its member count.
 * This page is the only navigation a hub needs: the link-graph check requires that no hub is
 * unreachable from here. The home page keeps its frozen search bar and gains nothing.
 */
import type { Metadata } from 'next'
import Link from 'next/link'

import { AppShell } from '@/components/AppShell'
import { listHubs } from '@/lib/hubs/queries'
import {
  HUB_TYPES,
  HUB_TYPE_DESCRIPTION,
  HUB_TYPE_LABEL,
  type HubIndexRow,
  type HubType,
} from '@/lib/hubs/types'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
import { getCurrentUser } from '@/lib/session'

// Railway's build container cannot resolve the private database host, and a database-backed route
// with no dynamic segment is a prerender candidate.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Groups: targets, mechanism classes and pathways | RNAWiki',
  description:
    'Every group of medicine records that share a protein target, an ATC mechanism class or a ' +
    'longevity pathway, with the number of records in each.',
  alternates: { canonical: '/h' },
  robots: pageRobotsMetadata({ index: true, follow: true }),
}

function HubTypeSection({ type, rows }: { type: HubType; rows: HubIndexRow[] }) {
  if (rows.length === 0) return null
  return (
    <section aria-labelledby={`hub-type-${type}`} className="space-y-3">
      <h2 className="text-xl font-bold text-[#1D1D1F]" id={`hub-type-${type}`}>
        {HUB_TYPE_LABEL[type]} groups{' '}
        <span className="font-normal text-[#6E6E73]">({rows.length})</span>
      </h2>
      <p className="text-xs text-[#6E6E73] leading-relaxed">{HUB_TYPE_DESCRIPTION[type]}</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {rows.map((hub) => (
          <li className="text-sm leading-relaxed" key={hub.hubId}>
            <Link
              className="text-[#0B5FFF] underline underline-offset-2 focus-visible:outline focus-visible:outline-2"
              href={`/h/${hub.type}/${hub.slug}`}
            >
              {hub.name}
            </Link>{' '}
            <span className="text-[#6E6E73]">
              {hub.memberCount} {hub.memberCount === 1 ? 'record' : 'records'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default async function HubIndexPage() {
  const [user, hubs] = await Promise.all([getCurrentUser(), listHubs()])
  const byType = new Map<HubType, HubIndexRow[]>()
  for (const type of HUB_TYPES) byType.set(type, [])
  for (const hub of hubs) byType.get(hub.type)?.push(hub)

  return (
    <AppShell initialUser={user}>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <header className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73] block">
            Groups
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
            Targets, mechanism classes and pathways
          </h1>
          <p className="text-sm text-[#6E6E73] leading-relaxed">
            {hubs.length.toLocaleString('en-GB')} groups. A group holds every record whose stored
            fields name the same protein target, the same Anatomical Therapeutic Chemical (ATC)
            level-4 class, or the same longevity pathway. Each group page compares its records side
            by side and says what the registers, labels and trial registry hold, with dates.
          </p>
        </header>

        {HUB_TYPES.map((type) => (
          <HubTypeSection key={type} rows={byType.get(type) ?? []} type={type} />
        ))}
      </div>
    </AppShell>
  )
}
