'use client'

import Link from 'next/link'
import { AlertTriangle, CheckCircle2, LoaderCircle, RefreshCw, Search } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { useApp } from '@/components/app-context'
import {
  AGENT_REVIEW_DECISIONS,
  AGENT_REVIEW_DECISION_LABELS,
  AGENT_REVIEW_DECISION_EXPLANATIONS,
  AGENT_REVIEW_LANES,
  AGENT_REVIEW_OCCURRENCE_STATES,
  AGENT_REVIEW_SEVERITIES,
  AGENT_REVIEW_STATES,
  agentReviewCapabilityScopeKey,
  canReviewAgentEvidence,
  isCurrentAgentReviewRequest,
  type AgentReviewDecision,
  type AgentReviewLane,
  type AgentReviewOccurrenceStateFilter,
  type AgentReviewSeverity,
  type AgentReviewStateFilter,
} from '@/lib/agent-review-policy'
import type {
  AgentReviewDecisionRecord,
  AgentReviewQueueDetail,
  AgentReviewQueueItem,
  AgentReviewQueueList,
} from '@/lib/queries/agent-review-queue'

interface ApiFailure {
  error?: string
  code?: string
}

class WorkbenchRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message)
    this.name = 'WorkbenchRequestError'
  }
}

async function privateRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  const text = await response.text()
  let body: unknown = {}
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      throw new WorkbenchRequestError(
        'RNAWiki could not read the server response. Nothing was changed.',
        response.status,
      )
    }
  }
  if (!response.ok) {
    const failure = body as ApiFailure
    throw new WorkbenchRequestError(
      failure.error ?? `The request failed (${response.status}).`,
      response.status,
      failure.code,
    )
  }
  return body as T
}

function utc(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date)
}

function label(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/gu, '$1 $2')
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./u, (letter) => letter.toUpperCase())
}

function readingText(reading: Record<string, unknown>, key: string): string | null {
  const value = reading[key]
  return typeof value === 'string' && value.trim() ? value : null
}

function stateLabel(item: AgentReviewQueueItem): string {
  if (item.state === 'DECIDED') return 'Decision recorded'
  if (item.state === 'EVIDENCE_CHANGED') return 'Evidence changed'
  return 'Awaiting review'
}

function stateClasses(item: AgentReviewQueueItem): string {
  if (item.state === 'DECIDED') return 'border-emerald-600/20 bg-emerald-50 text-emerald-800'
  if (item.state === 'EVIDENCE_CHANGED') return 'border-amber-600/20 bg-amber-50 text-amber-900'
  return 'border-blue-600/20 bg-blue-50 text-blue-800'
}

export interface AgentReviewWorkbenchProps {
  initialList?: AgentReviewQueueList
  initialError?: string
}

interface Filters {
  query: string
  agent: string
  reason: string
  severity: '' | AgentReviewSeverity
  lane: '' | AgentReviewLane
  provenanceTier: string
  state: '' | AgentReviewStateFilter
  occurrenceState: '' | AgentReviewOccurrenceStateFilter
  sourceChanged: boolean
  conflict: boolean
  freshnessDrift: boolean
  coverageGap: boolean
  chemistryIdentity: boolean
  quantitativeIntegrity: boolean
}

const EMPTY_FILTERS: Filters = {
  query: '',
  agent: '',
  reason: '',
  severity: '',
  lane: '',
  provenanceTier: '',
  state: '',
  occurrenceState: '',
  sourceChanged: false,
  conflict: false,
  freshnessDrift: false,
  coverageGap: false,
  chemistryIdentity: false,
  quantitativeIntegrity: false,
}

function listUrl(filters: Filters, offset = 0): string {
  const query = new URLSearchParams({ limit: '40', offset: String(offset) })
  for (const [key, value] of Object.entries(filters)) {
    if (value) query.set(key, String(value))
  }
  return `/api/agent-review-queue?${query.toString()}`
}

interface ObservationRow {
  path: string
  value: string
}

function observationRows(value: unknown, path = '', rows: ObservationRow[] = []): ObservationRow[] {
  if (rows.length >= 200) return rows
  if (Array.isArray(value)) {
    value.forEach((entry, index) => observationRows(entry, `${path}[${index}]`, rows))
    return rows
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value as Record<string, unknown>).sort(
      ([left], [right]) => left.localeCompare(right),
    )) {
      observationRows(entry, path ? `${path}.${key}` : key, rows)
    }
    return rows
  }
  rows.push({ path: path || 'value', value: value === null ? 'null' : String(value) })
  return rows
}

function QueueItemButton(input: {
  item: AgentReviewQueueItem
  selected: boolean
  onSelect: () => void
}) {
  const { item } = input
  return (
    <button
      type="button"
      onClick={input.onSelect}
      aria-pressed={input.selected}
      className={`w-full rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:ring-offset-2 ${
        input.selected
          ? 'border-[#0071E3]/40 bg-blue-50/60'
          : 'border-black/[0.08] bg-white hover:border-black/20'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-[#1D1D1F]">{item.medicine.name}</p>
          <p className="mt-0.5 break-all font-mono text-[10px] text-[#6E6E73]">{item.fieldPath}</p>
        </div>
        <span
          className={`rounded-full border px-2 py-1 text-[10px] font-bold ${stateClasses(item)}`}
        >
          {stateLabel(item)}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#424245]">{item.question}</p>
      <p className="mt-2 line-clamp-3 text-[10px] leading-4 text-[#6E6E73]">
        {item.scoreExplanation}
      </p>
      {item.calibrationMessage && (
        <p className="mt-2 text-[10px] font-semibold text-amber-800">{item.calibrationMessage}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-[#424245]">
        <span className="rounded-full bg-[#F5F5F7] px-2 py-1">{item.agent.id}</span>
        <span className="rounded-full bg-[#F5F5F7] px-2 py-1">{label(item.reason)}</span>
        <span className="rounded-full bg-[#F5F5F7] px-2 py-1">{label(item.severity)}</span>
        <span className="rounded-full bg-[#F5F5F7] px-2 py-1">
          Occurrence: {label(item.occurrenceState)}
        </span>
        <span className="rounded-full bg-[#F5F5F7] px-2 py-1">Score {item.score}</span>
      </div>
      <p className="mt-3 text-[10px] text-[#6E6E73]">
        {item.sourceCount} source {item.sourceCount === 1 ? 'reading' : 'readings'} ·{' '}
        {item.decisionEventCount} decision {item.decisionEventCount === 1 ? 'event' : 'events'}
      </p>
    </button>
  )
}

function DecisionHistory({ decisions }: { decisions: readonly AgentReviewDecisionRecord[] }) {
  if (decisions.length === 0) {
    return <p className="text-sm text-[#6E6E73]">No reviewer has decided this candidate yet.</p>
  }
  return (
    <ol className="space-y-3" aria-label="Decision event history">
      {decisions.map((decision) => (
        <li key={decision.id} className="rounded-2xl border border-black/[0.08] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="text-xs text-[#1D1D1F]">
              {AGENT_REVIEW_DECISION_LABELS[decision.decision]}
            </strong>
            <time className="text-[10px] text-[#6E6E73]" dateTime={decision.decidedAt}>
              {utc(decision.decidedAt)}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#424245]">
            {decision.explanation}
          </p>
          <p className="mt-2 text-[10px] text-[#6E6E73]">
            {decision.reviewer.name} (@{decision.reviewer.handle}) · occurrence{' '}
            {decision.occurrenceKey.slice(0, 12)}
            {decision.evidenceChanged ? ' · evidence differs from current' : ''}
          </p>
        </li>
      ))}
    </ol>
  )
}

function HistoryPagination(input: {
  label: string
  offset: number
  limit: number
  count: number
  hasMore: boolean
  onPage?: (offset: number) => void
}) {
  const first = input.count === 0 ? 0 : input.offset + 1
  const last = input.count === 0 ? 0 : input.offset + input.count
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#6E6E73]">
      <p>
        Showing {first}–{last} {input.label} in newest-first order.
      </p>
      <div className="flex gap-2">
        {input.offset > 0 && (
          <button
            type="button"
            onClick={() => input.onPage?.(Math.max(0, input.offset - input.limit))}
            className="rounded-full border border-black/15 px-3 py-1.5 font-bold text-[#0071E3]"
          >
            Newer
          </button>
        )}
        {input.hasMore && (
          <button
            type="button"
            onClick={() => input.onPage?.(input.offset + input.limit)}
            className="rounded-full border border-black/15 px-3 py-1.5 font-bold text-[#0071E3]"
          >
            Older
          </button>
        )}
      </div>
    </div>
  )
}

export function AgentEvidenceDetail(input: {
  detail: AgentReviewQueueDetail | null
  loading: boolean
  error: string | null
  saving: boolean
  notice: string | null
  onDecision: (decision: AgentReviewDecision, explanation: string) => Promise<void>
  onOccurrenceHistoryPage?: (offset: number) => void
  onDecisionHistoryPage?: (offset: number) => void
}) {
  const [decision, setDecision] = useState<AgentReviewDecision>('NEEDS_MORE_EVIDENCE')
  const [explanation, setExplanation] = useState('')
  const detail = input.detail

  useEffect(() => {
    setDecision('NEEDS_MORE_EVIDENCE')
    setExplanation('')
  }, [detail?.occurrenceKey])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!detail?.liveDecision.ready || !explanation.trim() || input.saving) return
    await input.onDecision(decision, explanation)
    setExplanation('')
  }

  if (input.loading) {
    return (
      <div
        role="status"
        className="flex min-h-64 items-center justify-center gap-2 text-sm text-[#6E6E73]"
      >
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading exact evidence…
      </div>
    )
  }
  if (input.error) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-600/20 bg-red-50 p-4 text-sm text-red-900"
      >
        {input.error}
      </div>
    )
  }
  if (!detail) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-3xl bg-[#F5F5F7] p-8 text-center text-sm text-[#6E6E73]">
        Choose a candidate to inspect its exact evidence and decision history.
      </div>
    )
  }

  return (
    <article className="space-y-7" aria-labelledby="agent-review-detail-title">
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6E6E73]">
              {detail.agent.id} · {label(detail.reason)}
            </p>
            <h2
              id="agent-review-detail-title"
              className="mt-1 text-2xl font-extrabold text-[#1D1D1F]"
            >
              {detail.medicine.name}
            </h2>
            <p className="mt-1 break-all font-mono text-[11px] text-[#6E6E73]">
              {detail.fieldPath}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${stateClasses(detail)}`}
          >
            {stateLabel(detail)}
          </span>
        </div>
        <p className="text-sm font-semibold leading-6 text-[#1D1D1F]">{detail.question}</p>
        <p className="text-sm leading-6 text-[#424245]">{detail.basis}</p>
        <dl className="grid gap-3 rounded-2xl bg-[#F5F5F7] p-4 text-xs sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="font-bold">Score</dt>
            <dd>{detail.score}</dd>
          </div>
          <div>
            <dt className="font-bold">Severity / lane</dt>
            <dd>
              {label(detail.severity)} · {label(detail.lane)}
            </dd>
          </div>
          <div>
            <dt className="font-bold">Provenance</dt>
            <dd>{label(detail.provenanceTier)}</dd>
          </div>
          <div>
            <dt className="font-bold">Occurrence state</dt>
            <dd>{label(detail.occurrenceState)}</dd>
          </div>
          <div>
            <dt className="font-bold">Sources</dt>
            <dd>{detail.sourceCount}</dd>
          </div>
          <div>
            <dt className="font-bold">Agent version</dt>
            <dd className="font-mono">{detail.agent.version}</dd>
          </div>
          <div>
            <dt className="font-bold">Reason schema</dt>
            <dd className="font-mono">{detail.agent.reasonSchemaVersion}</dd>
          </div>
          <div>
            <dt className="font-bold">Corpus version</dt>
            <dd className="break-all font-mono text-[10px]">{detail.corpusVersion}</dd>
          </div>
          <div>
            <dt className="font-bold">Observed</dt>
            <dd>{utc(detail.timestamps.observedAt)}</dd>
          </div>
        </dl>
      </header>

      {detail.evidenceChanged && (
        <div className="flex gap-3 rounded-2xl border border-amber-600/20 bg-amber-50 p-4 text-sm text-amber-950">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            This conceptual candidate has an earlier occurrence. Decisions on older evidence do not
            decide this occurrence.
          </p>
        </div>
      )}

      <section className="space-y-3" aria-labelledby="live-medicine-value-heading">
        <h3 id="live-medicine-value-heading" className="text-lg font-extrabold text-[#1D1D1F]">
          Current stored medicine value
        </h3>
        <p className="text-sm leading-6 text-[#424245]">
          This is the exact value currently stored at <code>{detail.fieldPath}</code>, checked
          independently from the agent observation.
        </p>
        {detail.liveDecision.storedField.state === 'present' ? (
          <pre className="max-h-96 overflow-auto rounded-2xl bg-[#111114] p-4 text-[11px] leading-5 text-[#F5F5F7]">
            {JSON.stringify(detail.liveDecision.storedField.value, null, 2)}
          </pre>
        ) : (
          <p className="rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-4 text-sm text-[#424245]">
            No literal value is stored at this field path. The agent observation below is detector
            context, not a medicine value.
          </p>
        )}
        <p className="break-all font-mono text-[10px] text-[#6E6E73]">
          Live context digest: {detail.liveDecision.contextDigest}
        </p>
        {!detail.liveDecision.ready && (
          <div
            role="alert"
            className="flex gap-3 rounded-2xl border border-amber-600/20 bg-amber-50 p-4 text-sm text-amber-950"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              This occurrence cannot be decided because its stored value or exact source binding no
              longer matches the imported review snapshot. Run the deterministic agent again and
              reload the queue.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="agent-observation-heading">
        <h3 id="agent-observation-heading" className="text-lg font-extrabold text-[#1D1D1F]">
          Agent observation (detector context)
        </h3>
        <pre className="max-h-96 overflow-auto rounded-2xl bg-[#111114] p-4 text-[11px] leading-5 text-[#F5F5F7]">
          {JSON.stringify(detail.evidence.observation, null, 2)}
        </pre>
        <h4 className="text-xs font-bold text-[#1D1D1F]">Structured observation fields</h4>
        <dl className="grid gap-2 rounded-2xl border border-black/[0.08] p-4 text-xs sm:grid-cols-2">
          {observationRows(detail.evidence.observation).map((row) => (
            <div key={row.path} className="min-w-0">
              <dt className="break-all font-mono text-[10px] font-bold text-[#6E6E73]">
                {row.path}
              </dt>
              <dd className="break-words text-[#1D1D1F]">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="break-all font-mono text-[10px] text-[#6E6E73]">
          Evidence digest: {detail.evidence.digest}
        </p>
      </section>

      <section className="space-y-3" aria-labelledby="source-readings-heading">
        <h3 id="source-readings-heading" className="text-lg font-extrabold text-[#1D1D1F]">
          Source readings
        </h3>
        {detail.evidence.sourceReadings.length === 0 ? (
          <p className="text-sm text-[#6E6E73]">
            No source reading was recorded for this occurrence.
          </p>
        ) : (
          <ol className="space-y-4">
            {detail.evidence.sourceReadings.map((reading, index) => {
              const sourceLabel = readingText(reading, 'label') ?? `Source ${index + 1}`
              const sourceMetadata = detail.evidence.sourceMetadata[index]
              const version = sourceMetadata?.version ?? null
              const liveBinding = detail.liveDecision.sourceBindings.find(
                (binding) =>
                  binding.sourceReadingDigest === detail.evidence.sourceReadingDigests[index],
              )
              return (
                <li
                  key={`${sourceLabel}-${index}`}
                  className="rounded-2xl border border-black/[0.08] bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    {detail.evidence.sourceLinks[index] ? (
                      <a
                        href={detail.evidence.sourceLinks[index]!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-[#0071E3] hover:underline"
                      >
                        {sourceLabel}
                      </a>
                    ) : (
                      <strong className="text-sm text-[#1D1D1F]">{sourceLabel}</strong>
                    )}
                    <span className="font-mono text-[10px] text-[#6E6E73]">
                      {readingText(reading, 'kind') ?? 'source'}:
                      {readingText(reading, 'identifier') ?? 'unidentified'}
                    </span>
                  </div>
                  <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="font-bold">Version</dt>
                      <dd>{version ?? 'Not recorded'}</dd>
                    </div>
                    <div>
                      <dt className="font-bold">Retrieved</dt>
                      <dd>
                        {readingText(reading, 'retrievedAt')
                          ? utc(readingText(reading, 'retrievedAt') as string)
                          : 'Not recorded'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold">Effective date</dt>
                      <dd>{sourceMetadata?.effectiveDate ?? 'Not recorded'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-bold">Recorded snapshot digest</dt>
                      <dd className="break-all font-mono text-[10px]">
                        {detail.evidence.sourceReadingDigests[index] ?? 'Not recorded'}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-bold">Current exact source binding</dt>
                      <dd className="break-all font-mono text-[10px]">
                        {liveBinding?.matches.length
                          ? liveBinding.matches
                              .map((match) => `${match.medicineSlug}:${match.path}`)
                              .join(', ')
                          : 'Not found in the current stored medicine background'}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-bold">Locator</dt>
                      <dd className="break-all">
                        {readingText(reading, 'locator') ?? 'Not recorded'}
                      </dd>
                    </div>
                  </dl>
                  {readingText(reading, 'excerpt') && (
                    <blockquote className="mt-3 whitespace-pre-wrap border-l-2 border-[#0071E3] pl-3 text-xs leading-5 text-[#424245]">
                      {readingText(reading, 'excerpt')}
                    </blockquote>
                  )}
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-bold text-[#0071E3]">
                      Canonical source record
                    </summary>
                    <pre className="mt-2 max-h-72 overflow-auto rounded-xl bg-[#F5F5F7] p-3 text-[10px] leading-4 text-[#424245]">
                      {JSON.stringify(reading, null, 2)}
                    </pre>
                  </details>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="ranking-features-heading">
        <h3 id="ranking-features-heading" className="text-lg font-extrabold text-[#1D1D1F]">
          Deterministic ranking
        </h3>
        <p className="text-sm leading-6 text-[#424245]">{detail.scoreExplanation}</p>
        {detail.calibrationMessage && (
          <p className="rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900">
            {detail.calibrationMessage}
          </p>
        )}
        <dl className="grid gap-2 rounded-2xl bg-[#F5F5F7] p-4 text-xs sm:grid-cols-2">
          {Object.entries(detail.rankingFeatures)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, value]) => (
              <div key={key} className="min-w-0">
                <dt className="font-mono text-[10px] font-bold text-[#6E6E73]">{key}</dt>
                <dd className="break-words text-[#1D1D1F]">
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </dd>
              </div>
            ))}
        </dl>
      </section>

      <section className="space-y-3" aria-labelledby="occurrence-history-heading">
        <h3 id="occurrence-history-heading" className="text-lg font-extrabold text-[#1D1D1F]">
          Prior occurrences
        </h3>
        {detail.priorOccurrences.length === 0 ? (
          <p className="text-sm text-[#6E6E73]">This is the first occurrence of the candidate.</p>
        ) : (
          <ol className="space-y-3">
            {detail.priorOccurrences.map((occurrence) => {
              const changed = Object.entries(occurrence.changesFromCurrent)
                .filter(([, value]) => value)
                .map(([key]) => label(key))
              return (
                <li key={occurrence.occurrenceKey} className="rounded-2xl bg-[#F5F5F7] p-4 text-xs">
                  <p className="break-all font-mono text-[10px]">{occurrence.occurrenceKey}</p>
                  <p className="mt-2 text-[#424245]">
                    Agent {occurrence.agentVersion} · corpus {occurrence.corpusVersion.slice(0, 12)}{' '}
                    · {occurrence.sourceCount} sources
                  </p>
                  <p className="mt-1 text-[#6E6E73]">
                    Changed: {changed.join(', ') || 'No canonical evidence field'}
                  </p>
                </li>
              )
            })}
          </ol>
        )}
        <HistoryPagination
          label="prior occurrences"
          {...detail.historyPagination.occurrences}
          count={detail.priorOccurrences.length}
          onPage={input.onOccurrenceHistoryPage}
        />
      </section>

      <section className="space-y-3" aria-labelledby="decision-history-heading">
        <h3 id="decision-history-heading" className="text-lg font-extrabold text-[#1D1D1F]">
          Decision history
        </h3>
        <DecisionHistory decisions={detail.decisions} />
        <HistoryPagination
          label="decision events"
          {...detail.historyPagination.decisions}
          count={detail.decisions.length}
          onPage={input.onDecisionHistoryPage}
        />
      </section>

      <section
        className="rounded-3xl border border-black/[0.08] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
        aria-labelledby="record-decision-heading"
      >
        <h3 id="record-decision-heading" className="text-lg font-extrabold text-[#1D1D1F]">
          Record a decision event
        </h3>
        <p className="mt-2 text-xs leading-5 text-[#6E6E73]">
          A later event may reverse an earlier one. This records review memory only; it does not
          edit the medicine or choose a source. Choosing correction needed does not create a
          correction draft or handoff.
        </p>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <fieldset disabled={!detail.liveDecision.ready || input.saving}>
            <legend className="text-xs font-bold text-[#1D1D1F]">Outcome</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {AGENT_REVIEW_DECISIONS.map((outcome) => (
                <label
                  key={outcome}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/[0.1] p-3 text-xs"
                >
                  <input
                    type="radio"
                    name="decision"
                    value={outcome}
                    checked={decision === outcome}
                    onChange={() => setDecision(outcome)}
                  />
                  <span>
                    <strong className="block">{AGENT_REVIEW_DECISION_LABELS[outcome]}</strong>
                    <span className="mt-1 block leading-4 text-[#6E6E73]">
                      {AGENT_REVIEW_DECISION_EXPLANATIONS[outcome]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-xs font-bold text-[#1D1D1F]">
            Explanation
            <textarea
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              required
              disabled={!detail.liveDecision.ready || input.saving}
              maxLength={4000}
              rows={5}
              className="mt-2 w-full resize-y rounded-xl border border-black/15 px-3 py-2 text-sm font-normal focus:border-[#0071E3] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
              placeholder="State what you checked and why this outcome follows from the recorded evidence."
            />
          </label>
          {input.notice && (
            <p role="status" className="flex gap-2 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {input.notice}
            </p>
          )}
          <button
            type="submit"
            disabled={!detail.liveDecision.ready || input.saving || !explanation.trim()}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#0071E3] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {input.saving && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {detail.latestDecision ? 'Append decision event' : 'Record decision'}
          </button>
        </form>
      </section>
    </article>
  )
}

export function AgentReviewWorkbench({ initialList, initialError }: AgentReviewWorkbenchProps) {
  const { currentUser } = useApp()
  const accountId = currentUser?.id ?? null
  const canReview = canReviewAgentEvidence(currentUser ?? {})
  const capabilityScopeKey = agentReviewCapabilityScopeKey(currentUser)
  const capabilityScopeRef = useRef(capabilityScopeKey)
  capabilityScopeRef.current = capabilityScopeKey
  const accountRef = useRef(accountId)
  accountRef.current = accountId
  const scopeGenerationRef = useRef(0)
  const actionRequestRef = useRef<{
    generation: number
    occurrenceKey: string | null
    controller: AbortController | null
  }>({ generation: 0, occurrenceKey: null, controller: null })
  const [draftFilters, setDraftFilters] = useState<Filters>(EMPTY_FILTERS)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [items, setItems] = useState<AgentReviewQueueItem[]>(
    initialList?.items ? [...initialList.items] : [],
  )
  const [hasMore, setHasMore] = useState(initialList?.hasMore ?? false)
  const [isLoading, setIsLoading] = useState(initialList === undefined && !initialError)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [listError, setListError] = useState<string | null>(initialError ?? null)
  const [selectedOccurrence, setSelectedOccurrence] = useState<string | null>(null)
  const [occurrenceHistoryOffset, setOccurrenceHistoryOffset] = useState(0)
  const [decisionHistoryOffset, setDecisionHistoryOffset] = useState(0)
  const [detail, setDetail] = useState<AgentReviewQueueDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const [stateCapabilityScopeKey, setStateCapabilityScopeKey] = useState(capabilityScopeKey)

  useEffect(() => {
    scopeGenerationRef.current += 1
    actionRequestRef.current.controller?.abort()
    actionRequestRef.current = {
      generation: actionRequestRef.current.generation + 1,
      occurrenceKey: null,
      controller: null,
    }
    setItems([])
    setHasMore(false)
    setSelectedOccurrence(null)
    setOccurrenceHistoryOffset(0)
    setDecisionHistoryOffset(0)
    setDetail(null)
    setIsLoading(canReview)
    setIsLoadingMore(false)
    setDetailLoading(false)
    setSaving(false)
    setListError(null)
    setDetailError(null)
    setNotice(null)
    setStateCapabilityScopeKey(capabilityScopeKey)

    return () => {
      scopeGenerationRef.current += 1
      actionRequestRef.current.controller?.abort()
      actionRequestRef.current.generation += 1
      actionRequestRef.current.occurrenceKey = null
      actionRequestRef.current.controller = null
    }
  }, [canReview, capabilityScopeKey])

  useEffect(() => {
    if (!canReview) {
      setItems([])
      setDetail(null)
      setSelectedOccurrence(null)
      setIsLoading(false)
      return
    }
    const controller = new AbortController()
    const scopeGeneration = scopeGenerationRef.current
    setIsLoading(true)
    setListError(null)
    setItems([])
    setHasMore(false)
    void privateRequest<AgentReviewQueueList>(listUrl(filters), { signal: controller.signal })
      .then((result) => {
        if (
          !controller.signal.aborted &&
          accountRef.current === accountId &&
          capabilityScopeRef.current === capabilityScopeKey &&
          scopeGenerationRef.current === scopeGeneration
        ) {
          setItems([...result.items])
          setHasMore(result.hasMore)
        }
      })
      .catch((error) => {
        if (
          !controller.signal.aborted &&
          accountRef.current === accountId &&
          capabilityScopeRef.current === capabilityScopeKey &&
          scopeGenerationRef.current === scopeGeneration
        ) {
          setListError(error instanceof Error ? error.message : 'The review queue could not load.')
        }
      })
      .finally(() => {
        if (
          !controller.signal.aborted &&
          accountRef.current === accountId &&
          capabilityScopeRef.current === capabilityScopeKey &&
          scopeGenerationRef.current === scopeGeneration
        ) {
          setIsLoading(false)
        }
      })
    return () => controller.abort()
  }, [accountId, canReview, capabilityScopeKey, filters, reload])

  useEffect(() => {
    if (!canReview || !selectedOccurrence || stateCapabilityScopeKey !== capabilityScopeKey) {
      setDetail(null)
      setDetailLoading(false)
      return
    }
    const controller = new AbortController()
    const scopeGeneration = scopeGenerationRef.current
    setDetailLoading(true)
    setDetailError(null)
    void privateRequest<{ detail: AgentReviewQueueDetail }>(
      `/api/agent-review-queue?occurrence=${encodeURIComponent(selectedOccurrence)}&occurrenceHistoryOffset=${occurrenceHistoryOffset}&decisionHistoryOffset=${decisionHistoryOffset}`,
      { signal: controller.signal },
    )
      .then((result) => {
        if (
          !controller.signal.aborted &&
          accountRef.current === accountId &&
          capabilityScopeRef.current === capabilityScopeKey &&
          scopeGenerationRef.current === scopeGeneration
        ) {
          setDetail(result.detail)
        }
      })
      .catch((error) => {
        if (
          !controller.signal.aborted &&
          accountRef.current === accountId &&
          capabilityScopeRef.current === capabilityScopeKey &&
          scopeGenerationRef.current === scopeGeneration
        ) {
          setDetail(null)
          setDetailError(error instanceof Error ? error.message : 'Exact evidence could not load.')
        }
      })
      .finally(() => {
        if (
          !controller.signal.aborted &&
          accountRef.current === accountId &&
          capabilityScopeRef.current === capabilityScopeKey &&
          scopeGenerationRef.current === scopeGeneration
        ) {
          setDetailLoading(false)
        }
      })
    return () => controller.abort()
  }, [
    accountId,
    canReview,
    capabilityScopeKey,
    reload,
    occurrenceHistoryOffset,
    decisionHistoryOffset,
    selectedOccurrence,
    stateCapabilityScopeKey,
  ])

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSelectedOccurrence(null)
    setOccurrenceHistoryOffset(0)
    setDecisionHistoryOffset(0)
    setDetail(null)
    setNotice(null)
    setFilters({ ...draftFilters })
  }

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return
    const requestAccountId = accountId
    const requestScope = capabilityScopeKey
    const scopeGeneration = scopeGenerationRef.current
    const controller = new AbortController()
    setIsLoadingMore(true)
    setListError(null)
    try {
      const result = await privateRequest<AgentReviewQueueList>(listUrl(filters, items.length), {
        signal: controller.signal,
      })
      if (
        controller.signal.aborted ||
        accountRef.current !== requestAccountId ||
        capabilityScopeRef.current !== requestScope ||
        scopeGenerationRef.current !== scopeGeneration
      ) {
        return
      }
      setItems((current) => [...current, ...result.items])
      setHasMore(result.hasMore)
    } catch (error) {
      if (
        !controller.signal.aborted &&
        accountRef.current === requestAccountId &&
        capabilityScopeRef.current === requestScope &&
        scopeGenerationRef.current === scopeGeneration
      ) {
        setListError(error instanceof Error ? error.message : 'More candidates could not load.')
      }
    } finally {
      if (
        !controller.signal.aborted &&
        accountRef.current === requestAccountId &&
        capabilityScopeRef.current === requestScope &&
        scopeGenerationRef.current === scopeGeneration
      ) {
        setIsLoadingMore(false)
      }
    }
  }

  const decide = async (decision: AgentReviewDecision, explanation: string) => {
    if (!accountScopeIsCurrent || !accountId || !detail?.liveDecision.ready || saving) return
    const submitted = detail
    actionRequestRef.current.controller?.abort()
    const controller = new AbortController()
    const requestGeneration = actionRequestRef.current.generation + 1
    const scopeGeneration = scopeGenerationRef.current
    actionRequestRef.current = {
      generation: requestGeneration,
      occurrenceKey: submitted.occurrenceKey,
      controller,
    }
    setSaving(true)
    setDetailError(null)
    setNotice(null)
    try {
      await privateRequest('/api/agent-review-queue', {
        method: 'POST',
        body: JSON.stringify({
          occurrenceKey: submitted.occurrenceKey,
          evidenceDigest: submitted.evidenceDigest,
          liveContextDigest: submitted.liveDecision.contextDigest,
          decision,
          explanation,
        }),
        signal: controller.signal,
      })
      if (
        capabilityScopeRef.current !== capabilityScopeKey ||
        !isCurrentAgentReviewRequest({
          accountId,
          currentAccountId: accountRef.current,
          occurrenceKey: submitted.occurrenceKey,
          currentOccurrenceKey: actionRequestRef.current.occurrenceKey,
          requestGeneration,
          currentRequestGeneration: actionRequestRef.current.generation,
          scopeGeneration,
          currentScopeGeneration: scopeGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        return
      }
      setNotice('The decision event was appended. No medical record was changed.')
      setDecisionHistoryOffset(0)
      setReload((value) => value + 1)
    } catch (error) {
      const requestIsCurrent =
        capabilityScopeRef.current === capabilityScopeKey &&
        isCurrentAgentReviewRequest({
          accountId,
          currentAccountId: accountRef.current,
          occurrenceKey: submitted.occurrenceKey,
          currentOccurrenceKey: actionRequestRef.current.occurrenceKey,
          requestGeneration,
          currentRequestGeneration: actionRequestRef.current.generation,
          scopeGeneration,
          currentScopeGeneration: scopeGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      if (!requestIsCurrent) return
      if (error instanceof WorkbenchRequestError && error.status === 409) {
        setDetailError(`${error.message} The queue is being reloaded.`)
        setReload((value) => value + 1)
      } else {
        setDetailError(
          error instanceof Error ? error.message : 'The decision could not be recorded.',
        )
      }
    } finally {
      if (
        capabilityScopeRef.current === capabilityScopeKey &&
        isCurrentAgentReviewRequest({
          accountId,
          currentAccountId: accountRef.current,
          occurrenceKey: submitted.occurrenceKey,
          currentOccurrenceKey: actionRequestRef.current.occurrenceKey,
          requestGeneration,
          currentRequestGeneration: actionRequestRef.current.generation,
          scopeGeneration,
          currentScopeGeneration: scopeGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        actionRequestRef.current.controller = null
        setSaving(false)
      }
    }
  }

  // State is masked synchronously during an account/capability switch, before effect cleanup runs.
  const accountScopeIsCurrent = canReview && stateCapabilityScopeKey === capabilityScopeKey
  const visibleItems = accountScopeIsCurrent ? items : []
  const visibleHasMore = accountScopeIsCurrent && hasMore
  const visibleIsLoading = accountScopeIsCurrent ? isLoading : canReview
  const visibleIsLoadingMore = accountScopeIsCurrent && isLoadingMore
  const visibleSelectedOccurrence = accountScopeIsCurrent ? selectedOccurrence : null
  const visibleDetail = accountScopeIsCurrent ? detail : null
  const visibleDetailLoading = accountScopeIsCurrent ? detailLoading : canReview
  const visibleDetailError = accountScopeIsCurrent ? detailError : null
  const visibleSaving = accountScopeIsCurrent && saving
  const visibleNotice = accountScopeIsCurrent ? notice : null
  const visibleListError = accountScopeIsCurrent ? listError : null

  const selectOccurrence = (occurrenceKey: string) => {
    actionRequestRef.current.controller?.abort()
    actionRequestRef.current = {
      generation: actionRequestRef.current.generation + 1,
      occurrenceKey: null,
      controller: null,
    }
    setSelectedOccurrence(occurrenceKey)
    setOccurrenceHistoryOffset(0)
    setDecisionHistoryOffset(0)
    setDetail(null)
    setDetailError(null)
    setSaving(false)
    setNotice(null)
  }

  const clearFilters = () => {
    setDraftFilters({ ...EMPTY_FILTERS })
    setFilters({ ...EMPTY_FILTERS })
    setSelectedOccurrence(null)
    setOccurrenceHistoryOffset(0)
    setDecisionHistoryOffset(0)
    setDetail(null)
    setNotice(null)
  }

  if (!canReview) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-amber-600/20 bg-amber-50 p-4 text-sm text-amber-950"
      >
        Your session no longer has access to this private queue.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={applyFilters}
        className="grid gap-3 rounded-3xl border border-black/[0.08] bg-white p-4 sm:grid-cols-2 xl:grid-cols-6"
        aria-label="Filter agent review candidates"
      >
        <label className="text-xs font-bold text-[#424245] xl:col-span-2">
          Search
          <span className="relative mt-1 block">
            <Search
              className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#6E6E73]"
              aria-hidden="true"
            />
            <input
              value={draftFilters.query}
              onChange={(event) =>
                setDraftFilters((value) => ({ ...value, query: event.target.value }))
              }
              className="h-9 w-full rounded-xl border border-black/15 pl-9 pr-3 font-normal"
              placeholder="Medicine, field, agent, reason"
            />
          </span>
        </label>
        <label className="text-xs font-bold text-[#424245]">
          Agent
          <input
            value={draftFilters.agent}
            onChange={(event) =>
              setDraftFilters((value) => ({ ...value, agent: event.target.value }))
            }
            className="mt-1 h-9 w-full rounded-xl border border-black/15 px-3 font-normal"
          />
        </label>
        <label className="text-xs font-bold text-[#424245]">
          Reason
          <input
            value={draftFilters.reason}
            onChange={(event) =>
              setDraftFilters((value) => ({ ...value, reason: event.target.value }))
            }
            className="mt-1 h-9 w-full rounded-xl border border-black/15 px-3 font-normal"
          />
        </label>
        <label className="text-xs font-bold text-[#424245]">
          Severity
          <select
            value={draftFilters.severity}
            onChange={(event) =>
              setDraftFilters((value) => ({
                ...value,
                severity: event.target.value as Filters['severity'],
              }))
            }
            className="mt-1 h-9 w-full rounded-xl border border-black/15 px-2 font-normal"
          >
            <option value="">All</option>
            {AGENT_REVIEW_SEVERITIES.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-[#424245]">
          Audience lane
          <select
            value={draftFilters.lane}
            onChange={(event) =>
              setDraftFilters((value) => ({
                ...value,
                lane: event.target.value as Filters['lane'],
              }))
            }
            className="mt-1 h-9 w-full rounded-xl border border-black/15 px-2 font-normal"
          >
            <option value="">All</option>
            {AGENT_REVIEW_LANES.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-[#424245]">
          Provenance tier
          <input
            value={draftFilters.provenanceTier}
            onChange={(event) =>
              setDraftFilters((value) => ({ ...value, provenanceTier: event.target.value }))
            }
            className="mt-1 h-9 w-full rounded-xl border border-black/15 px-3 font-normal"
            placeholder="All tiers"
          />
        </label>
        <label className="text-xs font-bold text-[#424245]">
          State
          <select
            value={draftFilters.state}
            onChange={(event) =>
              setDraftFilters((value) => ({
                ...value,
                state: event.target.value as Filters['state'],
              }))
            }
            className="mt-1 h-9 w-full rounded-xl border border-black/15 px-2 font-normal"
          >
            <option value="">All</option>
            {AGENT_REVIEW_STATES.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-[#424245]">
          Occurrence
          <select
            value={draftFilters.occurrenceState}
            onChange={(event) =>
              setDraftFilters((value) => ({
                ...value,
                occurrenceState: event.target.value as Filters['occurrenceState'],
              }))
            }
            className="mt-1 h-9 w-full rounded-xl border border-black/15 px-2 font-normal"
          >
            <option value="">All current states</option>
            {AGENT_REVIEW_OCCURRENCE_STATES.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="grid gap-2 rounded-2xl bg-[#F5F5F7] p-3 sm:grid-cols-2 xl:col-span-6 xl:grid-cols-6">
          <legend className="px-1 text-xs font-bold text-[#424245]">Deterministic flags</legend>
          {(
            [
              ['sourceChanged', 'Source changed'],
              ['conflict', 'Source conflict'],
              ['freshnessDrift', 'Freshness drift'],
              ['coverageGap', 'Coverage gap'],
              ['chemistryIdentity', 'Chemistry identity'],
              ['quantitativeIntegrity', 'Quantitative integrity'],
            ] as const
          ).map(([key, text]) => (
            <label
              key={key}
              className="flex min-h-9 items-center gap-2 text-xs font-semibold text-[#424245]"
            >
              <input
                type="checkbox"
                checked={draftFilters[key]}
                onChange={(event) =>
                  setDraftFilters((value) => ({ ...value, [key]: event.target.checked }))
                }
              />
              {text}
            </label>
          ))}
        </fieldset>
        <div className="flex items-end gap-2 xl:col-span-2">
          <button
            type="submit"
            className="h-9 rounded-full bg-[#1D1D1F] px-5 text-xs font-bold text-white"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="h-9 rounded-full px-4 text-xs font-bold text-[#0071E3]"
          >
            Clear
          </button>
        </div>
      </form>

      {visibleListError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-600/20 bg-red-50 p-4 text-sm text-red-900"
        >
          {visibleListError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(19rem,0.8fr)_minmax(0,1.2fr)]">
        <section aria-labelledby="agent-candidate-list-heading" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="agent-candidate-list-heading" className="text-lg font-extrabold text-[#1D1D1F]">
              Active candidates
            </h2>
            <button
              type="button"
              onClick={() => setReload((value) => value + 1)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0071E3]"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Reload
            </button>
          </div>
          {visibleIsLoading ? (
            <div
              role="status"
              className="flex min-h-48 items-center justify-center gap-2 rounded-2xl bg-[#F5F5F7] text-sm text-[#6E6E73]"
            >
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading active candidates…
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-2xl bg-[#F5F5F7] p-6 text-center">
              <p className="text-sm font-bold text-[#1D1D1F]">
                No active candidates match these filters.
              </p>
              <p className="mt-2 text-xs leading-5 text-[#6E6E73]">
                This is an empty queue, not evidence that the corpus has been medically verified.
              </p>
            </div>
          ) : (
            <ul className="space-y-3" aria-label="Active agent review candidates">
              {visibleItems.map((item) => (
                <li key={item.occurrenceKey}>
                  <QueueItemButton
                    item={item}
                    selected={visibleSelectedOccurrence === item.occurrenceKey}
                    onSelect={() => selectOccurrence(item.occurrenceKey)}
                  />
                </li>
              ))}
            </ul>
          )}
          {visibleHasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={visibleIsLoadingMore}
              className="w-full rounded-full border border-black/15 py-2 text-xs font-bold text-[#1D1D1F] disabled:opacity-50"
            >
              {visibleIsLoadingMore ? 'Loading…' : 'Load more candidates'}
            </button>
          )}
        </section>

        <section
          aria-label="Selected candidate evidence"
          className="min-w-0 rounded-3xl border border-black/[0.08] bg-white p-4 sm:p-6"
        >
          <AgentEvidenceDetail
            detail={visibleDetail}
            loading={visibleDetailLoading}
            error={visibleDetailError}
            saving={visibleSaving}
            notice={visibleNotice}
            onDecision={decide}
            onOccurrenceHistoryPage={setOccurrenceHistoryOffset}
            onDecisionHistoryPage={setDecisionHistoryOffset}
          />
        </section>
      </div>

      <p className="text-xs text-[#6E6E73]">
        Return to the{' '}
        <Link href="/review-queue" className="font-bold text-[#0071E3] hover:underline">
          main review queue
        </Link>
        .
      </p>
    </div>
  )
}
