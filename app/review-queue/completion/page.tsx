import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AppShell } from '@/components/AppShell'
import {
  canViewCompletionReview,
  COMPLETION_REVIEW_DECISION_LABELS,
  COMPLETION_REVIEW_DECISION_MEANINGS,
  COMPLETION_REVIEW_DECISIONS,
  COMPLETION_REVIEW_EXPLANATION_MAX_LENGTH,
  COMPLETION_REVIEW_QUEUE_DESCRIPTIONS,
  COMPLETION_REVIEW_QUEUE_KINDS,
  COMPLETION_REVIEW_QUEUE_LABELS,
  isCompletionReviewQueueKind,
  type CompletionReviewQueueKind,
} from '@/lib/completion-review-policy'
import {
  listCompletionReviewQueue,
  type CompletionReviewQueueCounts,
  type CompletionReviewQueueItem,
} from '@/lib/queries/completion-review'
import { pageRobotsMetadata } from '@/lib/seo/deployment'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Completion and identity review',
  robots: pageRobotsMetadata({ index: false, follow: false }),
}

const PAGE_SIZE = 25
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const OUTCOME_MESSAGES: Record<string, string> = {
  recorded: 'The decision was recorded.',
  stale_assessment:
    'The record was assessed again before the decision arrived. Reload this page and read the current sections before deciding.',
  not_found: 'No completion assessment is stored for that record, so no decision was recorded.',
  section_not_assessed:
    'That section does not apply to the record, so no decision was recorded against it.',
  invalid_decision:
    'No decision was recorded. Check the section, the outcome and the explanation, then try again.',
  not_authorized: 'This account may not record a decision here.',
  internal_error: 'The decision was not recorded. Try again.',
}

function queueCount(counts: CompletionReviewQueueCounts, kind: CompletionReviewQueueKind): number {
  if (kind === 'incomplete') return counts.incomplete
  if (kind === 'human-read') return counts.humanRead
  return counts.identity
}

function queueHref(kind: CompletionReviewQueueKind, offset: number): string {
  const query = new URLSearchParams({ kind })
  if (offset > 0) query.set('offset', String(offset))
  return `/review-queue/completion?${query.toString()}`
}

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function readOffset(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '0', 10)
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return Math.min(parsed, 100_000)
}

function RecordCard({
  item,
  kind,
  offset,
  highlighted,
}: {
  item: CompletionReviewQueueItem
  kind: CompletionReviewQueueKind
  offset: number
  highlighted: boolean
}) {
  const anchor = `record-${item.drugId}`
  const sectionFieldId = `section-${item.drugId}`
  const decisionFieldId = `decision-${item.drugId}`
  const explanationFieldId = `explanation-${item.drugId}`
  const canLink = SLUG_PATTERN.test(item.slug)
  const decidable = new Set(item.decidableSectionIds)

  return (
    <li
      id={anchor}
      className={`space-y-4 rounded-3xl border bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-6 ${
        highlighted ? 'border-[#0071E3]' : 'border-black/[0.08]'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-extrabold text-[#1D1D1F]">
            {canLink ? (
              <Link href={`/d/${item.slug}`} className="hover:underline">
                {item.name}
              </Link>
            ) : (
              item.name
            )}
          </h3>
          <p className="mt-1 text-xs text-[#6E6E73]">
            {item.entityClassLabel} · {item.resolutionStatusLabel}
          </p>
        </div>
        <p className="text-[11px] font-semibold tabular-nums text-[#424245]">
          {item.terminalSectionCount} of {item.applicableSectionCount} sections settled
        </p>
      </div>

      {item.openSections.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6E6E73]">
            Sections still open
          </h4>
          <ul className="space-y-2 text-xs leading-5 text-[#424245]">
            {item.openSections.map((section) => (
              <li key={section.id}>
                <span className="font-bold">{section.label}</span> — {section.stateLabel}
                <span className="block text-[#6E6E73]">{section.basis}</span>
                {section.blockedReason && (
                  <span className="block">Before it can settle: {section.blockedReason}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {item.humanReadSections.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6E6E73]">
            A person reading the named source could add something
          </h4>
          <ul className="space-y-2 text-xs leading-5 text-[#424245]">
            {item.humanReadSections.map((section) => (
              <li key={section.id}>
                <span className="font-bold">{section.label}</span> — {section.stateLabel}
                <span className="block text-[#6E6E73]">{section.basis}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {item.attributionWarnings.length > 0 && (
        <section className="space-y-2 rounded-2xl bg-[#F5F5F7] p-4">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6E6E73]">
            Identity warnings
          </h4>
          <p className="text-[11px] leading-4 text-[#6E6E73]">
            Private to this screen. A warning is a reason to look. It is not evidence that two
            records are one thing, and the record names below never reach a public page or an
            export.
          </p>
          <ul className="space-y-2 text-xs leading-5 text-[#424245]">
            {item.attributionWarnings.map((warning) => (
              <li key={warning.code}>
                <span className="font-bold">{warning.label}</span>
                <span className="block text-[#6E6E73]">{warning.detail}</span>
                {warning.relatedSlugs.length > 0 && (
                  <span className="block font-mono text-[10px] text-[#6E6E73]">
                    Records named in this warning: {warning.relatedSlugs.join(', ')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {item.recentDecisions.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6E6E73]">
            Decisions already recorded
          </h4>
          <ul className="space-y-2 text-xs leading-5 text-[#424245]">
            {item.recentDecisions.map((decision) => (
              <li key={decision.id}>
                <span className="font-bold">{decision.sectionLabel}</span> —{' '}
                {decision.decisionLabel}
                <span className="block text-[#6E6E73]">
                  {decision.reviewerHandle ? `@${decision.reviewerHandle}` : 'Account removed'} ·{' '}
                  {decision.createdAt.slice(0, 10)} ·{' '}
                  {decision.appliesToCurrentAssessment
                    ? 'answers the current assessment'
                    : 'answers an earlier assessment'}
                </span>
                <span className="block">{decision.explanation}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {item.assessmentInputDigest ? (
        <form
          method="post"
          action="/api/completion-review"
          className="space-y-3 rounded-2xl border border-black/[0.08] p-4"
        >
          <input type="hidden" name="drugId" value={item.drugId} />
          <input type="hidden" name="assessmentInputDigest" value={item.assessmentInputDigest} />
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="offset" value={String(offset)} />
          <fieldset className="space-y-3 border-0 p-0">
            <legend className="text-[11px] font-bold uppercase tracking-wider text-[#6E6E73]">
              Record a review decision
            </legend>

            <div className="space-y-1">
              <label htmlFor={sectionFieldId} className="block text-xs font-bold text-[#1D1D1F]">
                Section this decision answers
              </label>
              <select
                id={sectionFieldId}
                name="sectionId"
                required
                defaultValue={item.decidableSectionIds[0] ?? item.sections[0]?.id ?? ''}
                className="w-full rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-xs text-[#1D1D1F]"
              >
                {item.sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.label} — {section.stateLabel}
                    {decidable.has(section.id) ? ' (open work)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor={decisionFieldId} className="block text-xs font-bold text-[#1D1D1F]">
                What you decided
              </label>
              <select
                id={decisionFieldId}
                name="decision"
                required
                defaultValue="ACKNOWLEDGED"
                className="w-full rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-xs text-[#1D1D1F]"
              >
                {COMPLETION_REVIEW_DECISIONS.map((value) => (
                  <option key={value} value={value}>
                    {COMPLETION_REVIEW_DECISION_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor={explanationFieldId}
                className="block text-xs font-bold text-[#1D1D1F]"
              >
                What you checked and what you concluded
              </label>
              <textarea
                id={explanationFieldId}
                name="explanation"
                required
                rows={3}
                maxLength={COMPLETION_REVIEW_EXPLANATION_MAX_LENGTH}
                className="w-full rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-xs text-[#1D1D1F]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex min-h-9 items-center rounded-full bg-[#0071E3] px-4 text-xs font-bold text-white"
            >
              Record decision
            </button>
          </fieldset>
        </form>
      ) : (
        <p className="text-xs text-[#6E6E73]">
          This record has no completion assessment stored yet, so there is nothing here to decide
          about.
        </p>
      )}

      <details className="text-[11px] text-[#6E6E73]">
        <summary className="cursor-pointer font-bold">Technical detail</summary>
        <dl className="mt-2 space-y-1 font-mono">
          <div>
            <dt className="inline font-bold">record id: </dt>
            <dd className="inline">{item.drugId}</dd>
          </div>
          <div>
            <dt className="inline font-bold">slug: </dt>
            <dd className="inline">{item.slug}</dd>
          </div>
          <div>
            <dt className="inline font-bold">entity class: </dt>
            <dd className="inline">{item.entityClass ?? 'none'}</dd>
          </div>
          <div>
            <dt className="inline font-bold">resolution status: </dt>
            <dd className="inline">{item.resolutionStatus ?? 'none'}</dd>
          </div>
          <div>
            <dt className="inline font-bold">identity confidence: </dt>
            <dd className="inline">{item.identityConfidence ?? 'none'}</dd>
          </div>
          <div>
            <dt className="inline font-bold">assessment input digest: </dt>
            <dd className="inline break-all">{item.assessmentInputDigest ?? 'none'}</dd>
          </div>
          <div>
            <dt className="inline font-bold">open section states: </dt>
            <dd className="inline">
              {item.openSections.map((section) => `${section.id}=${section.state}`).join(' ') ||
                'none'}
            </dd>
          </div>
          <div>
            <dt className="inline font-bold">warning codes: </dt>
            <dd className="inline">
              {item.attributionWarnings.map((warning) => warning.code).join(' ') || 'none'}
            </dd>
          </div>
        </dl>
      </details>
    </li>
  )
}

export default async function CompletionReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await getCurrentUser()
  if (!user || !canViewCompletionReview(user)) notFound()

  const params = await searchParams
  const requestedKind = firstParam(params.kind) ?? 'incomplete'
  const kind: CompletionReviewQueueKind = isCompletionReviewQueueKind(requestedKind)
    ? requestedKind
    : 'incomplete'
  const offset = readOffset(firstParam(params.offset))
  const outcome = firstParam(params.outcome)
  const highlightedRecord = firstParam(params.record)

  const page = await listCompletionReviewQueue({ kind, limit: PAGE_SIZE, offset })
  const shown = page.items.length
  const previousOffset = Math.max(0, page.offset - page.limit)
  const nextOffset = page.offset + page.limit
  const outcomeMessage = outcome ? OUTCOME_MESSAGES[outcome] : undefined

  return (
    <AppShell initialUser={user}>
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">
            Editor diagnostic
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-4xl">
            Completion and identity review
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-[#6E6E73]">
            Three queues over stored rows: records whose completion assessment still has an open
            section, records where a person reading the named source could add something the parser
            could not read, and records whose identity resolution carries an attribution warning.
          </p>
          <p className="max-w-3xl text-sm leading-6 text-[#6E6E73]">
            A decision recorded here is a note about review work. It does not change an assessment,
            a medicine record or any public page, and it cannot be edited or deleted afterwards. A
            correction travels the ordinary contribution path; a disputed identity reaches the
            owner-curated redirect ledger only when a person takes it there.
          </p>
          <Link
            href="/review-queue"
            className="inline-flex min-h-6 items-center text-xs font-bold text-[#0071E3] hover:underline"
          >
            Back to review queue
          </Link>
        </header>

        {outcomeMessage && (
          <p
            role="status"
            className="rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-4 text-sm text-[#1D1D1F]"
          >
            {outcomeMessage}
          </p>
        )}

        <nav aria-label="Queue filters" className="flex flex-wrap gap-2">
          {COMPLETION_REVIEW_QUEUE_KINDS.map((value) => (
            <Link
              key={value}
              href={queueHref(value, 0)}
              aria-current={value === kind ? 'page' : undefined}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                value === kind
                  ? 'border-[#0071E3] bg-[#0071E3] text-white'
                  : 'border-black/[0.12] bg-white text-[#1D1D1F] hover:underline'
              }`}
            >
              {COMPLETION_REVIEW_QUEUE_LABELS[value]} ({queueCount(page.counts, value)})
            </Link>
          ))}
        </nav>

        <section className="space-y-4">
          <h2 className="text-xl font-extrabold tracking-tight text-[#1D1D1F]">
            {COMPLETION_REVIEW_QUEUE_LABELS[kind]}
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-[#6E6E73]">
            {COMPLETION_REVIEW_QUEUE_DESCRIPTIONS[kind]}
          </p>
          <p className="text-xs font-semibold tabular-nums text-[#424245]">
            {shown === 0
              ? 'No records in this queue right now.'
              : `Showing ${page.offset + 1} to ${page.offset + shown} of ${page.total}.`}
          </p>

          {shown > 0 && (
            <ul className="space-y-4" aria-label={COMPLETION_REVIEW_QUEUE_LABELS[kind]}>
              {page.items.map((item) => (
                <RecordCard
                  key={item.drugId}
                  item={item}
                  kind={kind}
                  offset={page.offset}
                  highlighted={item.drugId === highlightedRecord}
                />
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-4">
            {page.offset > 0 && (
              <Link
                href={queueHref(kind, previousOffset)}
                className="inline-flex min-h-6 items-center text-xs font-bold text-[#0071E3] hover:underline"
              >
                Previous records
              </Link>
            )}
            {nextOffset < page.total && (
              <Link
                href={queueHref(kind, nextOffset)}
                className="inline-flex min-h-6 items-center text-xs font-bold text-[#0071E3] hover:underline"
              >
                More records
              </Link>
            )}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-extrabold tracking-tight text-[#1D1D1F]">
            What each outcome claims
          </h2>
          <dl className="space-y-2 text-sm leading-6 text-[#424245]">
            {COMPLETION_REVIEW_DECISIONS.map((value) => (
              <div key={value}>
                <dt className="font-bold text-[#1D1D1F]">
                  {COMPLETION_REVIEW_DECISION_LABELS[value]}
                </dt>
                <dd>{COMPLETION_REVIEW_DECISION_MEANINGS[value]}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </AppShell>
  )
}
