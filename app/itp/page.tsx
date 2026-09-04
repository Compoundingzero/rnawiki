// The shared Interventions Testing Program reference page (docs/specs/derived-content.md, seed 19:
// kept as ONE reference page rather than a per-compound dossier section).
//
// Every row is read from the corpus tables at request time and printed as the workbook or the
// publication records it. Nothing on this page is averaged, ranked or converted.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AppShell } from '@/components/AppShell'
import { listItpCompounds, type ItpCompoundRecord } from '@/lib/queries/corpus-itp'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
import { getCurrentUser } from '@/lib/session'
import '@/lib/corpus/tokens.css'

// Reads the corpus tables and the signed-in user, and has no dynamic path segment. Railway's build
// container cannot reach the database, so this route must not be a prerender candidate.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'The Interventions Testing Program: recorded mouse cohorts',
  description:
    'The mouse cohorts recorded for each compound tested by the NIA Interventions Testing Program, printed as the published workbooks and papers state them.',
  alternates: { canonical: '/itp' },
  robots: pageRobotsMetadata({ index: true, follow: true }),
}

const SEX_LABEL: Record<string, string> = { f: 'Female', m: 'Male' }

interface CohortTableRow {
  slug: string
  displayName: string
  tier: number
  cohortYear: string | null
  ageAtStartMonthsAsWritten: string | null
  agentAsWritten: string | null
  armCode: string | null
  armLabel: string | null
  doseAsWritten: string | null
  doseSource: string | null
  file: string | null
  animalsBySex: Map<string, number>
}

interface PublicationGroup {
  id: string
  pmid: string | null
  recordId: string | null
  year: string | null
  title: string | null
  url: string | null
  sourceDate: string | null
  sentences: string[]
  compounds: Array<{ slug: string; displayName: string; tier: number }>
}

function cohortRows(records: ItpCompoundRecord[]): CohortTableRow[] {
  const rows: CohortTableRow[] = []
  for (const record of records) {
    for (const cohort of record.cohorts) {
      rows.push({
        slug: record.slug,
        displayName: record.displayName,
        tier: record.tier,
        cohortYear: cohort.cohortYear,
        ageAtStartMonthsAsWritten: cohort.ageAtStartMonthsAsWritten,
        agentAsWritten: cohort.agentAsWritten,
        armCode: cohort.armCode,
        armLabel: cohort.armLabel,
        doseAsWritten: cohort.doseAsWritten,
        doseSource: cohort.doseSource,
        file: cohort.file,
        animalsBySex: new Map(
          cohort.animalsRecordedPerSex.map((entry) => [entry.sex, entry.animals]),
        ),
      })
    }
  }
  return rows
}

/** One block per publication, so a paper naming several compounds is quoted once. */
function publicationGroups(records: ItpCompoundRecord[]): PublicationGroup[] {
  const groups = new Map<string, PublicationGroup>()
  for (const record of records) {
    for (const publication of record.publications) {
      const id =
        publication.pmid ?? publication.sourceId ?? publication.title ?? publication.outcomeSentence
      const existing = groups.get(id)
      const group: PublicationGroup = existing ?? {
        id,
        pmid: publication.pmid,
        recordId: publication.sourceId,
        year: publication.year,
        title: publication.title,
        url: publication.url,
        sourceDate: publication.sourceDate,
        sentences: [],
        compounds: [],
      }
      if (!group.sentences.includes(publication.outcomeSentence)) {
        group.sentences.push(publication.outcomeSentence)
      }
      if (!group.compounds.some((compound) => compound.slug === record.slug)) {
        group.compounds.push({
          slug: record.slug,
          displayName: record.displayName,
          tier: record.tier,
        })
      }
      groups.set(id, group)
    }
  }
  return [...groups.values()].sort((a, b) => (b.year ?? '').localeCompare(a.year ?? ''))
}

function sexColumns(rows: CohortTableRow[]): string[] {
  const seen = new Set<string>()
  for (const row of rows) for (const sex of row.animalsBySex.keys()) seen.add(sex)
  return [...seen].sort()
}

function RecordLink({
  slug,
  displayName,
  tier,
}: {
  slug: string
  displayName: string
  tier: number
}) {
  return (
    <Link
      href={`/d/${slug}`}
      rel={tier === 3 ? 'nofollow' : undefined}
      className="underline underline-offset-2"
      style={{ color: 'var(--corpus-ink-0)' }}
    >
      {displayName}
    </Link>
  )
}

function PublicationBlock({ group }: { group: PublicationGroup }) {
  return (
    <article className="space-y-2 border-t pt-5" style={{ borderColor: 'var(--corpus-hairline)' }}>
      {group.title && (
        <h3
          className="text-base font-semibold leading-snug"
          style={{ fontFamily: 'var(--corpus-serif)', color: 'var(--corpus-ink-0)' }}
        >
          {group.title}
        </h3>
      )}

      <dl
        className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
        style={{ color: 'var(--corpus-ink-2)' }}
      >
        <div className="flex gap-1">
          <dt>Organism</dt>
          <dd style={{ color: 'var(--corpus-ink-1)' }}>mouse</dd>
        </div>
        {(group.pmid ?? group.recordId) && (
          <div className="flex gap-1">
            <dt>{group.pmid ? 'PubMed identifier (PMID)' : 'Europe PMC record'}</dt>
            <dd>
              {group.url ? (
                <a
                  href={group.url}
                  rel="noreferrer"
                  className="underline underline-offset-2"
                  style={{ color: 'var(--corpus-ink-1)' }}
                >
                  {group.pmid ?? group.recordId}
                </a>
              ) : (
                <span style={{ color: 'var(--corpus-ink-1)' }}>{group.pmid ?? group.recordId}</span>
              )}
            </dd>
          </div>
        )}
        {group.year && (
          <div className="flex gap-1">
            <dt>Published</dt>
            <dd style={{ color: 'var(--corpus-ink-1)' }}>{group.year}</dd>
          </div>
        )}
        {group.sourceDate && (
          <div className="flex gap-1">
            <dt>Record read</dt>
            <dd style={{ color: 'var(--corpus-ink-1)' }}>{group.sourceDate}</dd>
          </div>
        )}
      </dl>

      <ul className="space-y-2">
        {group.sentences.map((sentence) => (
          <li
            key={sentence}
            className="border-l-2 pl-3 text-[15px] leading-relaxed"
            style={{ borderColor: 'var(--corpus-accent)', color: 'var(--corpus-ink-0)' }}
          >
            <q>{sentence}</q>
          </li>
        ))}
      </ul>

      <p
        className="flex flex-wrap gap-x-2 gap-y-1 text-xs"
        style={{ color: 'var(--corpus-ink-2)' }}
      >
        <span>Recorded for</span>
        {group.compounds.map((compound) => (
          <RecordLink key={compound.slug} {...compound} />
        ))}
      </p>
    </article>
  )
}

export default async function ItpReferencePage() {
  const [user, records] = await Promise.all([getCurrentUser(), listItpCompounds()])
  if (records.length === 0) notFound()

  const rows = cohortRows(records)
  const sexes = sexColumns(rows)
  const groups = publicationGroups(records)
  const notes = [...new Set(records.map((record) => record.note).filter(Boolean))] as string[]
  const workbooks = [...new Set(rows.map((row) => row.file).filter(Boolean))].sort() as string[]
  const doseSources = [
    ...new Set(rows.map((row) => row.doseSource).filter(Boolean)),
  ].sort() as string[]
  const lastVerified = [
    ...new Set(records.map((record) => record.lastVerified).filter(Boolean)),
  ].sort() as string[]

  return (
    <AppShell initialUser={user}>
      <div className="mx-auto w-full max-w-[44rem] px-4 py-10 sm:px-6 sm:py-16">
        <header className="space-y-4">
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: 'var(--corpus-serif)', color: 'var(--corpus-ink-0)' }}
          >
            The Interventions Testing Program
          </h1>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            The Interventions Testing Program (ITP) is a mouse lifespan study programme of the
            United States National Institute on Aging. RNAWiki reads the cohort workbooks published
            through the Jackson Laboratory Mouse Phenome Database, and prints the rows they contain.
          </p>
          <p className="text-[15px] leading-relaxed" style={{ color: 'var(--corpus-ink-1)' }}>
            A cohort is named for the year its mice were bred, so C2015 is the cohort bred in 2015.
            The table gives the source&rsquo;s own name for each study arm, the dose exactly as the
            source prints it with its unit, the number of mice recorded for each sex, and the age at
            which the arm started. Where the only recorded dose is a number with no unit, the cell
            says so instead of printing the number: a concentration without its unit is not a dose.
            No median, percentage change or survival figure is calculated from these rows on this
            page. {records.length} compounds in the corpus have at least one recorded cohort.
          </p>
        </header>

        <section className="mt-10 space-y-4">
          <h2
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: 'var(--corpus-serif)', color: 'var(--corpus-ink-0)' }}
          >
            Mouse cohorts
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <caption className="sr-only">
                Mouse cohorts recorded by the Interventions Testing Program, one row per compound
                and cohort
              </caption>
              <thead>
                <tr
                  className="border-b text-left text-xs"
                  style={{ borderColor: 'var(--corpus-hairline)', color: 'var(--corpus-ink-2)' }}
                >
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Compound
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Cohort
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Study arm
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Dose as the source prints it
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Age at start (months)
                  </th>
                  {sexes.map((sex) => (
                    <th key={sex} scope="col" className="py-2 pr-3 font-semibold">
                      {SEX_LABEL[sex] ?? sex} mice
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.slug}-${row.cohortYear ?? ''}-${row.armCode ?? ''}`}
                    className="border-b align-top"
                    style={{ borderColor: 'var(--corpus-hairline)' }}
                  >
                    <th scope="row" className="py-2 pr-3 text-left font-normal">
                      <RecordLink slug={row.slug} displayName={row.displayName} tier={row.tier} />
                    </th>
                    <td className="py-2 pr-3" style={{ color: 'var(--corpus-ink-1)' }}>
                      {row.cohortYear}
                    </td>
                    <td className="py-2 pr-3" style={{ color: 'var(--corpus-ink-1)' }}>
                      {row.armLabel}
                    </td>
                    <td className="py-2 pr-3" style={{ color: 'var(--corpus-ink-1)' }}>
                      {row.doseAsWritten ?? (
                        <span style={{ color: 'var(--corpus-ink-2)' }}>
                          no dose with a unit recorded
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3" style={{ color: 'var(--corpus-ink-1)' }}>
                      {row.ageAtStartMonthsAsWritten}
                    </td>
                    {sexes.map((sex) => (
                      <td key={sex} className="py-2 pr-3" style={{ color: 'var(--corpus-ink-1)' }}>
                        {row.animalsBySex.get(sex)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details
            className="rounded-xl border p-4"
            style={{ borderColor: 'var(--corpus-hairline)' }}
          >
            <summary
              className="cursor-pointer text-sm font-semibold"
              style={{ color: 'var(--corpus-ink-0)' }}
            >
              Show the workbook rows
            </summary>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-sm">
                <caption className="sr-only">
                  The identifiers each cohort row carries in the source workbook
                </caption>
                <thead>
                  <tr
                    className="border-b text-left text-xs"
                    style={{ borderColor: 'var(--corpus-hairline)', color: 'var(--corpus-ink-2)' }}
                  >
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Compound
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Cohort
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Agent as the workbook writes it
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Arm code
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Workbook
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={`workbook-${row.slug}-${row.cohortYear ?? ''}-${row.armCode ?? ''}`}
                      className="border-b align-top"
                      style={{ borderColor: 'var(--corpus-hairline)' }}
                    >
                      <th scope="row" className="py-2 pr-3 text-left font-normal">
                        {row.displayName}
                      </th>
                      <td className="py-2 pr-3" style={{ color: 'var(--corpus-ink-1)' }}>
                        {row.cohortYear}
                      </td>
                      <td className="py-2 pr-3" style={{ color: 'var(--corpus-ink-1)' }}>
                        {row.agentAsWritten}
                      </td>
                      <td
                        className="py-2 pr-3 font-mono text-xs"
                        style={{ color: 'var(--corpus-ink-2)' }}
                      >
                        {row.armCode}
                      </td>
                      <td
                        className="py-2 pr-3 font-mono text-xs"
                        style={{ color: 'var(--corpus-ink-2)' }}
                      >
                        {row.file}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>

        {groups.length > 0 && (
          <section className="mt-12 space-y-5">
            <h2
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: 'var(--corpus-serif)', color: 'var(--corpus-ink-0)' }}
            >
              Reported outcomes
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--corpus-ink-2)' }}>
              Each sentence below is quoted from the publication record named with it, without
              change. A paper that names several compounds is quoted once and linked to each of
              them.
            </p>
            {groups.map((group) => (
              <PublicationBlock key={group.id} group={group} />
            ))}
          </section>
        )}

        <section className="mt-12 space-y-3">
          <h2
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: 'var(--corpus-serif)', color: 'var(--corpus-ink-0)' }}
          >
            Where these rows come from
          </h2>
          <dl className="space-y-2 text-sm" style={{ color: 'var(--corpus-ink-1)' }}>
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold">Source</dt>
              <dd>
                <a
                  href="https://phenome.jax.org/projects/ITP1"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  Jackson Laboratory Mouse Phenome Database, ITP project
                </a>
              </dd>
            </div>
            {workbooks.length > 0 && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold">Workbooks read</dt>
                <dd className="font-mono text-xs" style={{ color: 'var(--corpus-ink-2)' }}>
                  {workbooks.join(', ')}
                </dd>
              </div>
            )}
            {doseSources.length > 0 && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold">Dose column read from</dt>
                <dd>{doseSources.join('; ')}</dd>
              </div>
            )}
            {lastVerified.length > 0 && (
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold">Last verified</dt>
                <dd>{lastVerified.join(', ')}</dd>
              </div>
            )}
            <div className="flex flex-wrap gap-x-2">
              <dt className="font-semibold">Reuse</dt>
              <dd>
                Contributors to the Mouse Phenome Database waive copyright in the deposited data.
                Quoted sentences stay with their publisher.
              </dd>
            </div>
          </dl>
          {notes.map((note) => (
            <p
              key={note}
              className="text-xs leading-relaxed"
              style={{ color: 'var(--corpus-ink-2)' }}
            >
              {note}
            </p>
          ))}
          <p className="text-sm">
            <Link href="/definitions" className="underline underline-offset-2">
              Definitions
            </Link>
          </p>
        </section>
      </div>
    </AppShell>
  )
}
