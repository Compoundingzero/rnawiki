/**
 * A group page, and the group index, as whole HTML documents (step 6.1).
 *
 * The reason is the one `lib/corpus/document.tsx` gives: an App Router page ships its rendered text
 * twice, once as HTML and once inside the inlined React Server Components stream. Hubs are
 * indexable and in the sitemap, so they leave the page pipeline with the records.
 *
 * Nothing on either page is written at render time. Every sentence and every cell was computed by
 * `scripts/revamp/hubs_build.py` and loaded by `scripts/revamp/hubs_load.ts`.
 */
import { DocumentShell } from '@/components/document/DocumentShell'
import { HubMembers } from '@/components/hubs/HubMembers'
import { HubSynthesis } from '@/components/hubs/HubSynthesis'
import { HubTable } from '@/components/hubs/HubTable'
import { documentResponse } from '@/lib/document/render'
import { googleAnalyticsMeasurementId } from '@/lib/google-analytics'
import {
  HUB_TYPES,
  HUB_TYPE_DESCRIPTION,
  HUB_TYPE_LABEL,
  type HubIndexRow,
  type HubPage,
  type HubType,
} from '@/lib/hubs/types'

function measurementId(): string | null {
  return googleAnalyticsMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
}

export function hubDocumentResponse(page: HubPage): Promise<Response> {
  const { hub, members, syntheses } = page
  const description =
    `${hub.definition} ${hub.memberCount} records in this corpus, ` +
    `${hub.approvedCount} approved in at least one register.`
  return documentResponse(
    <DocumentShell
      analyticsMeasurementId={measurementId()}
      canonicalPath={`/h/${hub.type}/${hub.slug}`}
      description={description}
      ogType="website"
      robots={{ index: true, follow: true }}
      title={`${hub.name}: ${hub.memberCount} records | RNAWiki`}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        <header className="space-y-3">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-widest">
            <a
              className="font-bold text-[#6E6E73] underline underline-offset-2 focus-visible:outline focus-visible:outline-2"
              href="/h"
            >
              Groups
            </a>
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
    </DocumentShell>,
  )
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
            <a
              className="text-[#0B5FFF] underline underline-offset-2 focus-visible:outline focus-visible:outline-2"
              href={`/h/${hub.type}/${hub.slug}`}
            >
              {hub.name}
            </a>{' '}
            <span className="text-[#6E6E73]">
              {hub.memberCount} {hub.memberCount === 1 ? 'record' : 'records'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function hubIndexDocumentResponse(hubs: HubIndexRow[]): Promise<Response> {
  const byType = new Map<HubType, HubIndexRow[]>()
  for (const type of HUB_TYPES) byType.set(type, [])
  for (const hub of hubs) byType.get(hub.type)?.push(hub)

  return documentResponse(
    <DocumentShell
      analyticsMeasurementId={measurementId()}
      canonicalPath="/h"
      description={
        'Every group of medicine records that share a protein target, an ATC mechanism class or a ' +
        'longevity pathway, with the number of records in each.'
      }
      ogType="website"
      robots={{ index: true, follow: true }}
      title="Groups: targets, mechanism classes and pathways | RNAWiki"
    >
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
    </DocumentShell>,
  )
}
