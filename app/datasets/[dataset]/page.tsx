import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  Braces,
  CalendarDays,
  Database,
  Download,
  ExternalLink,
  FileCheck2,
} from 'lucide-react'

import { AppShell } from '@/components/AppShell'
import { DatasetCorrectionButton } from '@/components/datasets/DatasetCorrectionButton'
import {
  isPublicDatasetId,
  PUBLIC_DATASET_MAX_LIMIT,
  PUBLIC_DATASET_MAX_OFFSET,
  PUBLIC_DATASET_MAX_QUERY_LENGTH,
  type PublicDatasetCell,
  type PublicDatasetConsensusReadingRecord,
  type PublicDatasetDescriptor,
  type PublicDatasetField,
  type PublicDatasetRow,
  type PublicDatasetSentenceRecord,
  type PublicDatasetSourceRecord,
  queryPublicDataset,
} from '@/lib/public-datasets'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

interface DatasetPageProps {
  params: Promise<{ dataset: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const READER_PAGE_SIZE = 10

const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 })

function generatedDate(value: string): string {
  return value.slice(0, 10)
}

function singleValue(value: string | string[] | undefined, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed && trimmed.length <= maxLength ? trimmed : undefined
}

function readerQuery(searchParams: Record<string, string | string[] | undefined>) {
  const rawOffset = singleValue(searchParams.offset, 12)
  const offset = rawOffset && /^\d+$/u.test(rawOffset) ? Number(rawOffset) : 0
  return {
    q: singleValue(searchParams.q, PUBLIC_DATASET_MAX_QUERY_LENGTH),
    state: singleValue(searchParams.state, 64),
    meaning: singleValue(searchParams.meaning, 64),
    field: singleValue(searchParams.field, 64),
    role: singleValue(searchParams.role, 64),
    counterparty: singleValue(searchParams.counterparty, 80),
    route: singleValue(searchParams.route, 80),
    module: singleValue(searchParams.module, 80),
    limit: READER_PAGE_SIZE,
    offset: Number.isInteger(offset) && offset <= PUBLIC_DATASET_MAX_OFFSET ? offset : 0,
  }
}

function persistedParameters(
  descriptor: PublicDatasetDescriptor,
  query: Awaited<ReturnType<typeof queryPublicDataset>>['query'],
  options: { offset: number; limit?: number; format?: 'csv' },
): URLSearchParams {
  const parameters = new URLSearchParams()
  for (const filter of descriptor.filters) {
    const value = query[filter.parameter]
    if (typeof value === 'string' && value.length > 0) parameters.set(filter.parameter, value)
  }
  parameters.set('limit', String(options.limit ?? query.limit))
  if (options.offset > 0) parameters.set('offset', String(options.offset))
  if (options.format) parameters.set('format', options.format)
  return parameters
}

function readerHref(
  descriptor: PublicDatasetDescriptor,
  query: Awaited<ReturnType<typeof queryPublicDataset>>['query'],
  offset: number,
): string {
  const parameters = persistedParameters(descriptor, query, { offset })
  parameters.delete('limit')
  const suffix = parameters.toString()
  return `/datasets/${descriptor.id}${suffix ? `?${suffix}` : ''}`
}

function SourceRecord({ source }: { source: PublicDatasetSourceRecord }) {
  const identifier = `${source.sourceKind}:${source.sourceIdentifier}`
  return (
    <div className="rounded-xl border border-black/[0.07] bg-[#F5F5F7] p-3">
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#6E6E73]">
        <span>{source.sourceKind}</span>
        <span aria-hidden="true">·</span>
        <span>Retrieved {source.retrievedAt}</span>
      </div>
      {source.sourceHref ? (
        <a
          href={source.sourceHref}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block break-all font-mono text-[10px] font-semibold text-[#0066CC] hover:underline"
        >
          {identifier}
          <span className="sr-only"> (opens source in a new tab)</span>
        </a>
      ) : (
        <p className="mt-2 break-all font-mono text-[10px] text-[#424245]">{identifier}</p>
      )}
      <p className="mt-1 text-[11px] text-[#6E6E73]">{source.sourceLabel}</p>
      <p className="mt-1 text-[11px] text-[#6E6E73]">
        {source.sourceVersion ? `Version ${source.sourceVersion}` : 'Version not recorded'}
        {source.sourceEffectiveDate
          ? ` · Effective ${source.sourceEffectiveDate}`
          : ' · Effective date not recorded'}
      </p>
      {source.sourceLocator && (
        <p className="mt-1 break-all font-mono text-[10px] text-[#6E6E73]">
          {source.sourceLocator}
        </p>
      )}
      {source.excerpt && (
        <blockquote className="mt-2 border-l-2 border-[#0071E3]/30 pl-3 text-xs leading-5 text-[#1D1D1F]">
          {source.excerpt}
        </blockquote>
      )}
    </div>
  )
}

function formatCell(
  value: PublicDatasetCell | undefined,
  type: PublicDatasetField['type'],
): ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="text-[#86868B]">Not recorded</span>
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return number.format(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-[#86868B]">None recorded</span>
    if (type === 'sentence[]') {
      const sentences = value as PublicDatasetSentenceRecord[]
      return (
        <ol className="space-y-3">
          {sentences.map((sentence, index) => (
            <li
              key={`${sentence.sourceKind}:${sentence.sourceIdentifier}:${sentence.labelSection ?? ''}:${index}`}
              className="rounded-xl border border-black/[0.07] bg-[#F5F5F7] p-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#6E6E73]">
                <span>{sentence.polarity}</span>
                <span aria-hidden="true">·</span>
                <span>{sentence.labelSection ?? 'Section not recorded'}</span>
                <span aria-hidden="true">·</span>
                <span>Retrieved {sentence.retrievedAt}</span>
              </div>
              {sentence.sourceHref ? (
                <a
                  href={sentence.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all font-mono text-[10px] font-semibold text-[#0066CC] hover:underline"
                >
                  {sentence.sourceKind}:{sentence.sourceIdentifier}
                  <span className="sr-only"> (opens source in a new tab)</span>
                </a>
              ) : (
                <p className="mt-2 break-all font-mono text-[10px] text-[#424245]">
                  {sentence.sourceKind}:{sentence.sourceIdentifier}
                </p>
              )}
              {sentence.sourceLabel && (
                <p className="mt-1 text-[11px] text-[#6E6E73]">{sentence.sourceLabel}</p>
              )}
              <p className="mt-1 text-[11px] text-[#6E6E73]">
                {sentence.sourceVersion
                  ? `Version ${sentence.sourceVersion}`
                  : 'Version not recorded'}
                {sentence.sourceEffectiveDate
                  ? ` · Effective ${sentence.sourceEffectiveDate}`
                  : ' · Effective date not recorded'}
              </p>
              {sentence.sourceLocator && (
                <p className="mt-1 break-all font-mono text-[10px] text-[#6E6E73]">
                  {sentence.sourceLocator}
                </p>
              )}
              <blockquote className="mt-2 border-l-2 border-[#0071E3]/30 pl-3 text-xs leading-5 text-[#1D1D1F]">
                {sentence.excerpt}
              </blockquote>
            </li>
          ))}
        </ol>
      )
    }
    if (type === 'source[]') {
      return (
        <ol className="space-y-3">
          {(value as PublicDatasetSourceRecord[]).map((source, index) => (
            <li
              key={`${source.sourceKind}:${source.sourceIdentifier}:${source.retrievedAt}:${index}`}
            >
              <SourceRecord source={source} />
            </li>
          ))}
        </ol>
      )
    }
    if (type === 'consensus-reading[]') {
      return (
        <ol className="space-y-4">
          {(value as PublicDatasetConsensusReadingRecord[]).map((reading, readingIndex) => (
            <li
              key={`${reading.display}:${reading.unit ?? ''}:${reading.populationContext}:${readingIndex}`}
              className="rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-4"
            >
              <p className="font-bold text-[#1D1D1F]">{reading.display}</p>
              <dl className="mt-2 grid gap-2 text-[11px] text-[#424245] sm:grid-cols-3">
                <div>
                  <dt className="font-bold text-[#6E6E73]">Numeric value</dt>
                  <dd>
                    {reading.numeric === null ? 'Not parsed' : number.format(reading.numeric)}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-[#6E6E73]">Unit</dt>
                  <dd>{reading.unit ?? 'Not recorded'}</dd>
                </div>
                <div>
                  <dt className="font-bold text-[#6E6E73]">Source records</dt>
                  <dd>{number.format(reading.sourceCount)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] leading-5 text-[#424245]">
                <strong>Population and context:</strong> {reading.populationContext}
              </p>
              <details className="mt-3">
                <summary className="min-h-11 cursor-pointer py-3 text-xs font-bold text-[#0066CC]">
                  Show all {number.format(reading.sources.length)} source records
                </summary>
                <ol className="space-y-3 pt-1">
                  {reading.sources.map((source, sourceIndex) => (
                    <li
                      key={`${source.sourceKind}:${source.sourceIdentifier}:${source.retrievedAt}:${sourceIndex}`}
                    >
                      <SourceRecord source={source} />
                    </li>
                  ))}
                </ol>
              </details>
            </li>
          ))}
        </ol>
      )
    }
    const strings = value as string[]
    return (
      <ul className="space-y-1">
        {strings.map((entry, index) => (
          <li key={`${entry}-${index}`} className="break-words">
            {entry}
          </li>
        ))}
      </ul>
    )
  }
  return <span className="break-words">{value}</span>
}

function SampleRows({
  rows,
  schema,
  offset,
}: {
  rows: PublicDatasetRow[]
  schema: PublicDatasetField[]
  offset: number
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-black/[0.08] bg-white p-5 text-sm text-[#424245]">
        This projection currently has no rows.
      </p>
    )
  }

  return (
    <ol className="space-y-4">
      {rows.map((row, rowIndex) => (
        <li
          key={`${String(row.medicineSlug ?? row.field ?? 'row')}-${rowIndex}`}
          className="min-w-0 rounded-2xl border border-black/[0.08] bg-white p-5"
        >
          <p className="mb-4 text-[10px] font-bold uppercase tracking-wider text-[#6E6E73]">
            Projected row {offset + rowIndex + 1}
          </p>
          <dl className="grid min-w-0 gap-x-6 gap-y-4 sm:grid-cols-2">
            {schema.map((field) => (
              <div
                key={field.key}
                className={`min-w-0 border-t border-black/[0.06] pt-3 ${['sentence[]', 'source[]', 'consensus-reading[]'].includes(field.type) ? 'sm:col-span-2' : ''}`}
              >
                <dt className="text-[11px] font-bold text-[#6E6E73]">{field.label}</dt>
                <dd className="mt-1 min-w-0 text-xs leading-5 text-[#1D1D1F]">
                  {formatCell(row[field.key], field.type)}
                </dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ol>
  )
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">{eyebrow}</p>
        <h2 className="text-xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-2xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

export async function generateMetadata({ params }: DatasetPageProps): Promise<Metadata> {
  const { dataset } = await params
  if (!isPublicDatasetId(dataset)) notFound()
  const page = await queryPublicDataset(dataset, { limit: 1 })
  return {
    title: page.dataset.shortTitle,
    description: `${page.dataset.purpose} ${page.dataset.doesNotMean}`,
    alternates: { canonical: `/datasets/${dataset}` },
  }
}

export default async function DatasetDetailPage({ params, searchParams }: DatasetPageProps) {
  const [{ dataset }, rawSearchParams] = await Promise.all([params, searchParams])
  if (!isPublicDatasetId(dataset)) notFound()

  const [user, page] = await Promise.all([
    getCurrentUser(),
    queryPublicDataset(dataset, readerQuery(rawSearchParams)),
  ])
  const descriptor: PublicDatasetDescriptor = page.dataset
  const jsonParameters = persistedParameters(descriptor, page.query, {
    offset: page.query.offset,
  })
  const csvParameters = persistedParameters(descriptor, page.query, {
    offset: page.query.offset,
    limit: PUBLIC_DATASET_MAX_LIMIT,
    format: 'csv',
  })
  const jsonHref = `${descriptor.apiPath}?${jsonParameters}`
  const csvHref = `${descriptor.apiPath}?${csvParameters}`
  const firstRow = page.rows.length === 0 ? 0 : page.query.offset + 1
  const lastRow = page.rows.length === 0 ? 0 : page.query.offset + page.rows.length

  return (
    <AppShell initialUser={user}>
      <article className="mx-auto w-full max-w-4xl space-y-12 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-5">
          <Link
            href="/datasets"
            className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#0066CC] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All public datasets
          </Link>
          <div className="max-w-3xl space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">
              Public dataset
            </p>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#1D1D1F] sm:text-5xl">
              {descriptor.title}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[#424245]">{descriptor.purpose}</p>
          </div>

          <div className="rounded-2xl border border-amber-900/15 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
            <strong>What this does not mean:</strong> {descriptor.doesNotMean}
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
              <dt className="flex items-center gap-2 text-[11px] font-bold text-[#6E6E73]">
                <Database className="h-4 w-4 text-[#0066CC]" aria-hidden="true" />
                Public rows
              </dt>
              <dd className="mt-2 text-xl font-extrabold tabular-nums text-[#1D1D1F]">
                {number.format(descriptor.rowCount)}
              </dd>
            </div>
            <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
              <dt className="flex items-center gap-2 text-[11px] font-bold text-[#6E6E73]">
                <CalendarDays className="h-4 w-4 text-[#0066CC]" aria-hidden="true" />
                Generated
              </dt>
              <dd className="mt-2 text-sm font-bold text-[#1D1D1F]">
                <time dateTime={descriptor.generatedAt}>
                  {generatedDate(descriptor.generatedAt)}
                </time>
              </dd>
            </div>
            <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
              <dt className="flex items-center gap-2 text-[11px] font-bold text-[#6E6E73]">
                <FileCheck2 className="h-4 w-4 text-[#0066CC]" aria-hidden="true" />
                Schema version
              </dt>
              <dd className="mt-2 break-words font-mono text-xs font-semibold text-[#1D1D1F]">
                {descriptor.version}
              </dd>
            </div>
          </dl>
        </header>

        <Section eyebrow="Coverage" title="What this run contains">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {descriptor.coverage.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-black/[0.07] bg-white p-4"
              >
                <dt className="text-[11px] font-bold text-[#6E6E73]">{metric.label}</dt>
                <dd className="mt-1 text-lg font-extrabold tabular-nums text-[#1D1D1F]">
                  {typeof metric.value === 'number' ? number.format(metric.value) : metric.value}
                </dd>
                {metric.detail && (
                  <dd className="mt-2 text-[11px] leading-5 text-[#6E6E73]">{metric.detail}</dd>
                )}
              </div>
            ))}
          </dl>
        </Section>

        <Section eyebrow="Method" title="How the rows were made">
          <div className="rounded-3xl border border-black/[0.08] bg-white p-6 sm:p-7">
            <ol className="space-y-4 text-sm leading-6 text-[#424245]">
              {descriptor.methodology.map((step, index) => (
                <li key={step} className="grid grid-cols-[1.75rem_1fr] gap-3">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0071E3]/10 text-[11px] font-extrabold text-[#0066CC]"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        <Section eyebrow="Limits" title="Read these before using a row">
          <ul className="space-y-3 rounded-3xl border border-black/[0.08] bg-white p-6 text-sm leading-6 text-[#424245] sm:p-7">
            {descriptor.sourceLimitations.map((limitation) => (
              <li key={limitation} className="flex gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6E6E73]"
                  aria-hidden="true"
                />
                <span>{limitation}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section eyebrow="Provenance" title="Source examples">
          <div className="space-y-3">
            {descriptor.sourceExamples.map((example) => (
              <div
                key={`${example.label}-${example.sourceIdentifier ?? ''}`}
                className="rounded-2xl border border-black/[0.08] bg-white p-5"
              >
                <h3 className="text-sm font-bold text-[#1D1D1F]">{example.label}</h3>
                <p className="mt-1 text-xs leading-5 text-[#6E6E73]">{example.detail}</p>
                {example.sourceIdentifier &&
                  (example.sourceHref ? (
                    <a
                      href={example.sourceHref}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all font-mono text-[11px] font-semibold text-[#0066CC] hover:underline"
                    >
                      {example.sourceIdentifier}
                      <span className="sr-only"> (opens source in a new tab)</span>
                    </a>
                  ) : (
                    <p className="mt-2 break-all font-mono text-[11px] text-[#424245]">
                      {example.sourceIdentifier}
                    </p>
                  ))}
                {example.excerpt && (
                  <blockquote className="mt-3 border-l-2 border-[#0071E3]/30 pl-3 text-xs leading-5 text-[#424245]">
                    {example.excerpt}
                  </blockquote>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs leading-5 text-[#6E6E73]">
            Artifact used for this view:{' '}
            <code className="break-all">{descriptor.sourceArtifact}</code>. The reader resolves the
            current run first and uses the checked-in compatibility run only when a current artifact
            is absent.
          </p>
        </Section>

        <Section eyebrow="Schema" title="Fields in the public projection">
          <div
            className="overflow-x-auto rounded-2xl border border-black/[0.08] bg-white"
            tabIndex={0}
            aria-label="Public dataset field definitions"
          >
            <table className="w-full min-w-[42rem] border-collapse text-left text-xs">
              <thead className="bg-[#F5F5F7] text-[#424245]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Field
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Meaning
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                {descriptor.schema.map((field) => (
                  <tr key={field.key}>
                    <th
                      scope="row"
                      className="px-4 py-3 align-top font-mono font-semibold text-[#1D1D1F]"
                    >
                      {field.key}
                    </th>
                    <td className="px-4 py-3 align-top font-mono text-[#6E6E73]">{field.type}</td>
                    <td className="px-4 py-3 align-top leading-5 text-[#424245]">
                      {field.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section eyebrow="Reader" title="Search and filter the rows">
          <form
            method="get"
            action={`/datasets/${descriptor.id}`}
            className="grid gap-4 rounded-3xl border border-black/[0.08] bg-white p-5 sm:grid-cols-2 sm:p-6"
          >
            <div className="sm:col-span-2">
              <label htmlFor="dataset-search" className="text-xs font-bold text-[#1D1D1F]">
                Search public fields
              </label>
              <input
                id="dataset-search"
                name="q"
                type="search"
                maxLength={PUBLIC_DATASET_MAX_QUERY_LENGTH}
                defaultValue={page.query.q ?? ''}
                className="mt-2 min-h-11 w-full rounded-xl border border-black/[0.14] bg-white px-3 text-sm text-[#1D1D1F] outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
              />
              <p className="mt-1 text-[11px] leading-5 text-[#6E6E73]">
                {descriptor.filters.find((filter) => filter.parameter === 'q')?.description}
              </p>
            </div>
            {descriptor.filters
              .filter((filter) => filter.parameter !== 'q')
              .map((filter) => (
                <div key={filter.parameter}>
                  <label
                    htmlFor={`dataset-filter-${filter.parameter}`}
                    className="text-xs font-bold text-[#1D1D1F]"
                  >
                    {filter.label}
                  </label>
                  <select
                    id={`dataset-filter-${filter.parameter}`}
                    name={filter.parameter}
                    defaultValue={page.query[filter.parameter] ?? ''}
                    className="mt-2 min-h-11 w-full rounded-xl border border-black/[0.14] bg-white px-3 text-sm text-[#1D1D1F] outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
                  >
                    <option value="">All</option>
                    {filter.values?.map((value) => (
                      <option key={value} value={value}>
                        {value.replaceAll('_', ' ')}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] leading-5 text-[#6E6E73]">{filter.description}</p>
                </div>
              ))}
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0071E3] px-5 text-xs font-bold text-white transition hover:bg-[#0077ED]"
              >
                Apply search and filters
              </button>
              <Link
                href={`/datasets/${descriptor.id}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full px-4 text-xs font-bold text-[#0066CC] hover:underline"
              >
                Clear
              </Link>
            </div>
          </form>

          <p className="text-sm leading-6 text-[#424245]" aria-live="polite">
            Showing {number.format(firstRow)}–{number.format(lastRow)} of{' '}
            {number.format(page.total)} matching rows. Filters and search terms remain attached when
            you move between pages or open the API view.
          </p>
          <SampleRows rows={page.rows} schema={descriptor.schema} offset={page.query.offset} />
          {(page.previousOffset !== null || page.nextOffset !== null) && (
            <nav
              aria-label="Dataset result pages"
              className="flex items-center justify-between gap-4"
            >
              {page.previousOffset === null ? (
                <span />
              ) : (
                <Link
                  href={readerHref(descriptor, page.query, page.previousOffset)}
                  className="inline-flex min-h-11 items-center rounded-full border border-black/[0.1] bg-white px-4 text-xs font-bold text-[#0066CC] hover:border-[#0071E3]/30"
                >
                  Previous page
                </Link>
              )}
              {page.nextOffset !== null && (
                <Link
                  href={readerHref(descriptor, page.query, page.nextOffset)}
                  className="inline-flex min-h-11 items-center rounded-full border border-black/[0.1] bg-white px-4 text-xs font-bold text-[#0066CC] hover:border-[#0071E3]/30"
                >
                  Next page
                </Link>
              )}
            </nav>
          )}
        </Section>

        <Section eyebrow="Access" title="Query or download the projection">
          <div className="space-y-5 rounded-3xl border border-black/[0.08] bg-white p-6 sm:p-7">
            <div className="flex flex-wrap gap-3">
              <a
                href={jsonHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0071E3] px-4 text-xs font-bold text-white transition hover:bg-[#0077ED]"
              >
                <Braces className="h-4 w-4" aria-hidden="true" />
                View this filtered page as JSON
              </a>
              <a
                href={csvHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.1] bg-white px-4 text-xs font-bold text-[#1D1D1F] transition hover:border-[#0071E3]/30 hover:text-[#0066CC]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download up to 200 filtered CSV rows
              </a>
            </div>

            <div className="min-w-0 rounded-2xl bg-[#111827] p-4 text-slate-100">
              <code
                className="block overflow-x-auto whitespace-nowrap text-xs"
                tabIndex={0}
                aria-label="Filtered dataset API request"
              >
                GET {jsonHref}
              </code>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#1D1D1F]">Allowed query parameters</h3>
              <dl className="mt-3 space-y-3">
                {descriptor.filters.map((filter) => (
                  <div
                    key={filter.parameter}
                    className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4"
                  >
                    <dt className="font-mono text-xs font-semibold text-[#0066CC]">
                      {filter.parameter}
                    </dt>
                    <dd className="text-xs leading-5 text-[#424245]">
                      {filter.description}
                      {filter.values && filter.values.length <= 18 && (
                        <span className="block break-words text-[#6E6E73]">
                          Values: {filter.values.join(', ')}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
                <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
                  <dt className="font-mono text-xs font-semibold text-[#0066CC]">limit / offset</dt>
                  <dd className="text-xs leading-5 text-[#424245]">
                    Pagination is required. limit is at most {PUBLIC_DATASET_MAX_LIMIT}; offset is
                    bounded. Set format=csv for the same projected page as a download.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Section>

        <Section eyebrow="Reuse and corrections" title="Keep the boundary attached">
          <div className="space-y-4 rounded-3xl border border-black/[0.08] bg-white p-6 text-sm leading-6 text-[#424245] sm:p-7">
            <p>
              <a href={descriptor.licence.url} className="font-bold text-[#0066CC] hover:underline">
                {descriptor.licence.name}
                <ExternalLink className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
              </a>{' '}
              applies to {descriptor.licence.scope}
            </p>
            <p>
              Cite RNAWiki, this dataset identifier, and the generated date. Keep the “does not
              mean” statement with any downstream display so a corpus measurement is not mistaken
              for medical advice.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <DatasetCorrectionButton />
              <Link
                href={descriptor.correctionHref}
                className="inline-flex min-h-11 items-center justify-center rounded-full px-3 text-xs font-bold text-[#0066CC] hover:underline"
              >
                Read the correction policy
              </Link>
            </div>
          </div>
        </Section>
      </article>
    </AppShell>
  )
}
