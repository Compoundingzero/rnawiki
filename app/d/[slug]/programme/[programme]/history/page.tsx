// Read-only history for one development programme. It shows each published conclusion, what that
// conclusion covers, and the people who reviewed it.

import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, ExternalLink, GitCommitHorizontal, ShieldCheck } from 'lucide-react'

import { AppShell } from '@/components/AppShell'
import type {
  MechanismEvidenceBasis,
  ProgrammeTimelineDateBasis,
  ProgrammeTimelineEventType,
  VerdictReviewDecision,
} from '@/lib/evidence/types'
import {
  getPublicProgrammeVerdictHistory,
  type PublicProgrammePresentationSource,
  type PublicProgrammeVerdictHistoryRevision,
  type PublicProgrammeVerdictPresentation,
} from '@/lib/queries/public-programme-verdict-history'
import { getCurrentUser } from '@/lib/session'
import { resolveSafeSourceLocator } from '@/lib/source-locator'

type ProgrammeVerdictHistoryPageProps = {
  params: Promise<{ slug: string; programme: string }>
}

const loadHistory = cache((medicineSlug: string, programmeSlug: string) =>
  getPublicProgrammeVerdictHistory(medicineSlug, programmeSlug),
)

const REVIEW_DECISION_LABEL: Record<VerdictReviewDecision, string> = {
  APPROVE: 'Approved',
  CHANGES_REQUESTED: 'Changes requested',
  REJECT: 'Rejected',
}

const ADJUDICATION_DECISION_LABEL: Record<VerdictReviewDecision, string> = {
  APPROVE: 'Approved for publication',
  CHANGES_REQUESTED: 'Changes required before publication',
  REJECT: 'Not approved for publication',
}

const MECHANISM_BASIS_LABEL: Record<MechanismEvidenceBasis, string> = {
  MEASURED_IN_PEOPLE: 'Measured in people',
  MEASURED_OUTSIDE_PEOPLE: 'Measured outside people',
  PREDICTED: 'Predicted',
  UNKNOWN: 'Not yet known',
}

const TIMELINE_EVENT_LABEL: Record<ProgrammeTimelineEventType, string> = {
  PROGRAMME_MILESTONE: 'Programme milestone',
  FIRST_HUMAN_ADMINISTRATION: 'First given to a person',
  PHASE_PROGRESSION: 'Study phase changed',
  IMPORTANT_RESULT: 'Important result',
  SAFETY_SIGNAL: 'Important safety finding',
  REGULATORY_ACTION: 'Regulatory decision',
  PAUSE_OR_TERMINATION: 'Programme paused or stopped',
  LICENSING_OR_ACQUISITION: 'Licensing or ownership change',
}

const TIMELINE_DATE_LABEL: Record<ProgrammeTimelineDateBasis, string> = {
  ACTUAL: 'Date occurred',
  PLANNED: 'Planned date',
  REPORTED_UNCLEAR: 'Date reported; timing unclear',
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** Stable UTC rendering keeps the same public ledger date for every reader. */
function formatTimestamp(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  const month = MONTHS[parsed.getUTCMonth()] ?? ''
  const hours = String(parsed.getUTCHours()).padStart(2, '0')
  const minutes = String(parsed.getUTCMinutes()).padStart(2, '0')
  return `${parsed.getUTCDate()} ${month} ${parsed.getUTCFullYear()}, ${hours}:${minutes} UTC`
}

function formatDate(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  const month = MONTHS[parsed.getUTCMonth()] ?? ''
  return `${parsed.getUTCDate()} ${month} ${parsed.getUTCFullYear()}`
}

function PresentationSourceRow({ source }: { source: PublicProgrammePresentationSource }) {
  const href = resolveSafeSourceLocator(source.canonicalLocator)?.href ?? null
  return (
    <div
      className="mt-2 min-w-0 rounded-xl border border-black/[0.07] bg-[#F5F5F7] p-3"
      data-testid="history-presentation-source-snapshot"
    >
      <p className="break-words text-[11px] font-semibold leading-5 text-[#1D1D1F]">
        {source.title || source.externalIdentifier || 'Saved source'}
      </p>
      <p className="mt-1 text-[10px] leading-4 text-[#6E6E73]">
        Exact source version saved {formatTimestamp(source.retrievedAt)}
      </p>
      {source.claimBindings.map((binding) => (
        <p
          key={`${binding.claimId}:${binding.relationship}`}
          className="mt-1 break-words text-[10px] leading-4 text-[#424245]"
        >
          {binding.relationship === 'SUPPORTS'
            ? 'Supports'
            : binding.relationship === 'QUALIFIES'
              ? 'Adds context'
              : 'Contradicts'}
          : {binding.plainLanguageText}
        </p>
      ))}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex min-h-11 max-w-full items-center gap-1 break-all text-[10px] font-semibold text-[#0066CC] hover:underline"
        >
          {source.externalIdentifier || 'Open source'}
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
        </a>
      ) : (
        <p className="mt-1 break-all text-[10px] leading-4 text-[#6E6E73]">
          {source.canonicalLocator}
        </p>
      )}
      <details className="mt-1">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-[10px] font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
          Technical source-version details
        </summary>
        <p className="break-all font-mono text-[9px] leading-4 text-[#6E6E73]">
          Saved version {source.sourceSnapshotId}
        </p>
        <p className="break-all font-mono text-[9px] leading-4 text-[#6E6E73]">
          Source fingerprint sha256:{source.contentHash}
        </p>
      </details>
    </div>
  )
}

function HistoryPresentation({
  revisionNumber,
  presentation,
}: {
  revisionNumber: number
  presentation: PublicProgrammeVerdictPresentation
}) {
  const mechanismSteps = [...presentation.mechanismSteps].sort(
    (left, right) => left.stepOrder - right.stepOrder || left.stepKey.localeCompare(right.stepKey),
  )
  const timelineEvents = [...presentation.timelineEvents].sort(
    (left, right) =>
      left.eventDate.localeCompare(right.eventDate) || left.eventKey.localeCompare(right.eventKey),
  )
  const mechanismHeading = `revision-${revisionNumber}-mechanism`
  const timelineHeading = `revision-${revisionNumber}-timeline`

  return (
    <section
      className="mt-6 space-y-5 border-t border-black/[0.06] pt-5"
      aria-label={`Exact presentation for version ${revisionNumber}`}
      data-testid="history-presentation-snapshot"
    >
      <div className="space-y-1">
        <h3
          id={mechanismHeading}
          className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73]"
        >
          Mechanism map in this version
        </h3>
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          These are the exact reviewed stages and saved source versions attached to this published
          conclusion. “Measured in people” comes from a human study, and “measured outside people”
          comes from laboratory or non-human work. “Predicted” is a reviewer-assigned expectation,
          not a measurement. RNA Intelligence checks that the stage has a linked statement and saved
          source version; it does not judge the scientific model or reasoning behind the prediction.
          “Not yet known” means the reviewed sources do not establish it.
        </p>
      </div>
      <ol
        className={`grid min-w-0 gap-3 ${
          mechanismSteps.length === 3
            ? 'md:grid-cols-3'
            : mechanismSteps.length === 4
              ? 'md:grid-cols-4'
              : 'md:grid-cols-5'
        }`}
        aria-labelledby={mechanismHeading}
      >
        {mechanismSteps.map((step) => (
          <li
            key={step.stepKey}
            className="min-w-0 rounded-2xl border border-black/[0.08] p-3"
            data-testid="history-mechanism-stage"
          >
            <p className="text-[9px] font-semibold text-[#0066CC]">Stage {step.stepOrder}</p>
            <h4 className="mt-1 break-words text-xs font-bold leading-5 text-[#1D1D1F]">
              {step.plainTitle}
            </h4>
            <p className="mt-1 break-words text-[11px] leading-5 text-[#424245]">
              {step.plainDescription}
            </p>
            <p className="mt-2 inline-flex rounded-full border border-black/[0.08] bg-[#F5F5F7] px-2 py-1 text-[9px] font-semibold leading-4 text-[#424245]">
              Evidence: {MECHANISM_BASIS_LABEL[step.evidenceBasis]}
            </p>
            {step.technicalDescription && (
              <details className="mt-1">
                <summary className="inline-flex min-h-11 cursor-pointer items-center text-[10px] font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                  Technical detail
                </summary>
                <p className="break-words text-[10px] leading-5 text-[#6E6E73]">
                  {step.technicalDescription}
                </p>
              </details>
            )}
            {step.sources.map((source) => (
              <PresentationSourceRow key={source.sourceSnapshotId} source={source} />
            ))}
          </li>
        ))}
      </ol>

      {timelineEvents.length > 0 && (
        <section aria-labelledby={timelineHeading}>
          <h3
            id={timelineHeading}
            className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73]"
          >
            Source events in this version
          </h3>
          <p className="mt-1 text-[11px] leading-5 text-[#6E6E73]">
            Publication and replacement dates are shown at the top of this version. The events below
            come from saved external sources. “Date occurred” means the source reports that the
            event happened; “planned date” is a schedule, not a completed event; and “timing
            unclear” means the source did not make that distinction clear.
          </p>
          <ol className="mt-3 space-y-3">
            {timelineEvents.map((event) => (
              <li
                key={event.eventKey}
                className="min-w-0 rounded-2xl border border-black/[0.08] p-4"
                data-testid="history-timeline-event"
              >
                <time
                  dateTime={event.eventDate}
                  className="text-[10px] font-semibold text-[#0066CC]"
                >
                  {formatDate(event.eventDate)}
                </time>
                <p className="mt-1 break-words text-xs font-bold leading-5 text-[#1D1D1F]">
                  {event.plainTitle}
                </p>
                <p className="mt-1 break-words text-[11px] leading-5 text-[#424245]">
                  {event.plainDescription}
                </p>
                <p className="mt-1 text-[10px] leading-4 text-[#6E6E73]">
                  {TIMELINE_EVENT_LABEL[event.eventType]} · {TIMELINE_DATE_LABEL[event.dateBasis]}
                </p>
                {event.technicalDescription && (
                  <details className="mt-1">
                    <summary className="inline-flex min-h-11 cursor-pointer items-center text-[10px] font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                      Technical detail
                    </summary>
                    <p className="break-words text-[10px] leading-5 text-[#6E6E73]">
                      {event.technicalDescription}
                    </p>
                  </details>
                )}
                <PresentationSourceRow source={event.source} />
              </li>
            ))}
          </ol>
        </section>
      )}
    </section>
  )
}

function plainCodeLabel(value: string): string {
  const words = value.toLocaleLowerCase('en-US').replaceAll('_', ' ')
  return words.charAt(0).toLocaleUpperCase('en-US') + words.slice(1)
}

const CONCLUSION_CATEGORY_LABELS: Record<string, string> = {
  IDEA_FAILED: 'The biological idea was not supported in this defined programme',
  MOLECULE_FAILED: 'This medicine candidate did not work in this defined programme',
  TEST_UNANSWERED: 'This defined programme did not answer the question',
}

function VerdictHistoryCard({
  revision,
  previousRevision,
}: {
  revision: PublicProgrammeVerdictHistoryRevision
  previousRevision: PublicProgrammeVerdictHistoryRevision | undefined
}) {
  const scopeEntries = [
    ['Use studied', revision.scope.indication],
    ['People studied', revision.scope.population],
    ['Dose or exposure studied', revision.scope.doseExposure],
    ['Time period', revision.scope.period],
    ['Studies included', revision.scope.trials],
    ['Outcome assessed', revision.scope.outcome],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()))

  const statusLabel = revision.isCurrent
    ? 'Current published conclusion'
    : revision.status === 'SUPERSEDED'
      ? 'Earlier published conclusion'
      : 'Published conclusion'
  const reviewsDisagree = new Set(revision.reviews.map((review) => review.decision)).size > 1

  return (
    <article
      id={`revision-${revision.revisionNumber}`}
      className="min-w-0 scroll-mt-24 rounded-3xl border border-black/[0.08] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-7"
      aria-labelledby={`revision-${revision.revisionNumber}-heading`}
    >
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              revision.isCurrent
                ? 'border-emerald-600/20 bg-emerald-50 text-emerald-800'
                : 'border-black/[0.08] bg-[#F5F5F7] text-[#6E6E73]'
            }`}
          >
            {statusLabel}
          </span>
          <span className="text-[11px] font-semibold text-[#6E6E73]">
            Version {revision.revisionNumber}
          </span>
        </div>
        <div className="flex min-w-0 flex-col items-start gap-1 sm:items-end">
          {revision.publishedAt && (
            <time
              dateTime={revision.publishedAt}
              className="break-words text-[11px] tabular-nums text-[#6E6E73]"
            >
              Published {formatTimestamp(revision.publishedAt)}
            </time>
          )}
          {revision.supersededAt && (
            <time
              dateTime={revision.supersededAt}
              className="break-words text-[11px] tabular-nums text-[#6E6E73]"
            >
              Replaced {formatTimestamp(revision.supersededAt)}
            </time>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#6E6E73]">
          <span>Status when reviewed: {plainCodeLabel(revision.programmeStatusAtReview)}</span>
          <span aria-hidden="true">&middot;</span>
          <span>How certain reviewers were: {plainCodeLabel(revision.confidence)}</span>
          {revision.verdictCode && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>
                Conclusion category:{' '}
                {CONCLUSION_CATEGORY_LABELS[revision.verdictCode] ??
                  plainCodeLabel(revision.verdictCode)}
              </span>
            </>
          )}
        </div>

        <h2
          id={`revision-${revision.revisionNumber}-heading`}
          className="break-words text-xl font-extrabold leading-tight tracking-tight text-[#1D1D1F] sm:text-2xl"
        >
          {revision.publicLabel}
        </h2>
        {revision.professionalLabel.trim() &&
          revision.professionalLabel.trim() !== revision.publicLabel.trim() && (
            <p className="break-words text-xs leading-relaxed text-[#6E6E73]">
              Clinical wording: {revision.professionalLabel}
            </p>
          )}
      </div>

      {revision.oneSentenceReason.trim() && (
        <section className="mt-5 rounded-2xl bg-[#F5F5F7] p-4" aria-label="Recorded reason">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73]">
            Why reviewers reached this conclusion
          </h3>
          <p className="mt-1.5 break-words text-sm leading-relaxed text-[#424245]">
            {revision.oneSentenceReason}
          </p>
          {revision.confidenceExplanation?.trim() && (
            <p className="mt-2 break-words text-xs leading-relaxed text-[#6E6E73]">
              {revision.confidenceExplanation}
            </p>
          )}
        </section>
      )}

      {scopeEntries.length > 0 && (
        <section className="mt-6" aria-labelledby={`revision-${revision.revisionNumber}-scope`}>
          <h3
            id={`revision-${revision.revisionNumber}-scope`}
            className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73]"
          >
            What this conclusion covers
          </h3>
          <dl className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {scopeEntries.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-bold text-[#1D1D1F]">{label}</dt>
                <dd className="mt-0.5 break-words text-xs leading-relaxed text-[#6E6E73]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {revision.presentation && (
        <HistoryPresentation
          revisionNumber={revision.revisionNumber}
          presentation={revision.presentation}
        />
      )}

      <section
        className="mt-6 border-t border-black/[0.06] pt-5"
        aria-labelledby={`revision-${revision.revisionNumber}-review`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3
            id={`revision-${revision.revisionNumber}-review`}
            className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73]"
          >
            Who reviewed it
          </h3>
          {revision.reviewedAt && (
            <time dateTime={revision.reviewedAt} className="break-words text-[11px] text-[#6E6E73]">
              Review completed {formatTimestamp(revision.reviewedAt)}
            </time>
          )}
        </div>

        <p className="mt-3 break-words text-xs leading-relaxed text-[#424245]">
          Written by <span className="font-bold text-[#1D1D1F]">{revision.authorName}</span>
        </p>
        {revision.authorConflictsOfInterest?.trim() && (
          <p className="mt-1 break-words text-[11px] leading-relaxed text-[#6E6E73]">
            Author conflict-of-interest disclosure: {revision.authorConflictsOfInterest}
          </p>
        )}

        {revision.reviews.length > 0 ? (
          <ol className="mt-3 space-y-2.5">
            {revision.reviews.map((review, reviewIndex) => (
              <li
                key={review.id}
                className="min-w-0 rounded-2xl border border-black/[0.06] px-3.5 py-3 text-xs"
              >
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                  <p className="flex min-w-0 flex-wrap items-center gap-1.5 break-words font-bold text-[#1D1D1F]">
                    {review.decision === 'APPROVE' && (
                      <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                    )}
                    <span>{review.reviewerName}</span>
                    <span className="font-medium text-[#6E6E73]">
                      &mdash; {REVIEW_DECISION_LABEL[review.decision]}
                    </span>
                  </p>
                  <time
                    dateTime={review.reviewedAt}
                    className="break-words text-[10px] text-[#6E6E73]"
                  >
                    {formatTimestamp(review.reviewedAt)}
                  </time>
                </div>
                {review.isIndependent && (
                  <p className="mt-1 text-[10px] font-semibold text-emerald-800">
                    Reviewer worked independently
                  </p>
                )}
                {review.reviewerOrcid && (
                  <p className="mt-1 text-[11px] leading-relaxed text-[#6E6E73]">
                    Researcher identity:{' '}
                    <a
                      data-testid={`revision-${revision.revisionNumber}-reviewer-${reviewIndex + 1}-orcid`}
                      href={`https://orcid.org/${review.reviewerOrcid}`}
                      rel="external noreferrer"
                      className="font-semibold text-[#0066CC] hover:underline"
                      aria-label={`ORCID record for ${review.reviewerName}`}
                    >
                      ORCID {review.reviewerOrcid}
                    </a>
                  </p>
                )}
                <p className="mt-1 break-words text-[11px] leading-relaxed text-[#6E6E73]">
                  Scientific qualifications used:{' '}
                  {review.expertiseTags.length > 0
                    ? review.expertiseTags.map(plainCodeLabel).join(', ')
                    : 'No qualification label was recorded'}
                </p>
                {review.reviewNote?.trim() && (
                  <p className="mt-2 break-words leading-relaxed text-[#424245]">
                    {review.reviewNote}
                  </p>
                )}
                {review.conflictsOfInterest?.trim() && (
                  <p className="mt-1 break-words text-[11px] leading-relaxed text-[#6E6E73]">
                    Reviewer conflict-of-interest disclosure: {review.conflictsOfInterest}
                  </p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-xs text-[#6E6E73]">
            No reviewer names or notes were recorded for public display.
          </p>
        )}

        {(reviewsDisagree || revision.adjudication) && (
          <section
            data-testid={`revision-${revision.revisionNumber}-adjudication`}
            className="mt-4 rounded-2xl border border-amber-700/15 bg-amber-50/60 p-4"
            aria-labelledby={`revision-${revision.revisionNumber}-adjudication-heading`}
          >
            <h4
              id={`revision-${revision.revisionNumber}-adjudication-heading`}
              className="text-xs font-extrabold text-[#1D1D1F]"
            >
              How a review disagreement was settled
            </h4>
            <p className="mt-1.5 break-words text-xs leading-relaxed text-[#424245]">
              {reviewsDisagree
                ? 'The two independent reviewers reached different decisions. A third person with the required scientific qualifications checked the same proposed conclusion and evidence record. This final check is called adjudication.'
                : 'A third person with the required scientific qualifications checked the proposed conclusion and evidence record before publication.'}
            </p>

            {revision.adjudication ? (
              <div className="mt-3 space-y-2 border-t border-amber-900/10 pt-3">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                  <p
                    data-testid={`revision-${revision.revisionNumber}-adjudicator`}
                    className="break-words text-xs leading-relaxed text-[#424245]"
                  >
                    Decision made by{' '}
                    <span className="font-bold text-[#1D1D1F]">
                      {revision.adjudication.adjudicatorName}
                    </span>
                    {' · '}
                    <span className="font-semibold text-[#1D1D1F]">
                      {ADJUDICATION_DECISION_LABEL[revision.adjudication.decision]}
                    </span>
                  </p>
                  <time
                    dateTime={revision.adjudication.adjudicatedAt}
                    className="break-words text-[10px] text-[#6E6E73]"
                  >
                    Decision recorded {formatTimestamp(revision.adjudication.adjudicatedAt)}
                  </time>
                </div>

                {revision.adjudication.adjudicatorOrcid && (
                  <p className="text-[11px] leading-relaxed text-[#6E6E73]">
                    Researcher identity:{' '}
                    <a
                      data-testid={`revision-${revision.revisionNumber}-adjudicator-orcid`}
                      href={`https://orcid.org/${revision.adjudication.adjudicatorOrcid}`}
                      rel="external noreferrer"
                      className="font-semibold text-[#0066CC] hover:underline"
                      aria-label={`ORCID record for ${revision.adjudication.adjudicatorName}`}
                    >
                      ORCID {revision.adjudication.adjudicatorOrcid}
                    </a>
                  </p>
                )}

                <p className="break-words text-[11px] leading-relaxed text-[#6E6E73]">
                  Expertise used:{' '}
                  {revision.adjudication.expertiseTags.map(plainCodeLabel).join(', ')}
                </p>
                <div>
                  <p className="text-[11px] font-bold text-[#1D1D1F]">
                    Why this final decision was made
                  </p>
                  <p className="mt-0.5 break-words text-xs leading-relaxed text-[#424245]">
                    {revision.adjudication.rationale}
                  </p>
                </div>
                <p className="break-words text-[11px] leading-relaxed text-[#6E6E73]">
                  Conflict-of-interest disclosure from the final decision-maker:{' '}
                  {revision.adjudication.conflictsOfInterest}
                </p>
              </div>
            ) : (
              <p className="mt-2 break-words text-[11px] leading-relaxed text-[#6E6E73]">
                No separate adjudication record was attached to this historical publication.
              </p>
            )}
          </section>
        )}
      </section>

      <footer className="mt-5 flex min-w-0 flex-wrap items-start justify-between gap-3 border-t border-black/[0.06] pt-4 text-[11px] text-[#6E6E73]">
        {(revision.engineVersion || revision.inputDigest) && (
          <details className="min-w-0">
            <summary className="inline-flex min-h-9 cursor-pointer items-center font-semibold text-[#0066CC]">
              Technical record details
            </summary>
            <div className="flex min-w-0 flex-col gap-1 pb-1">
              {revision.engineVersion && (
                <span className="inline-flex min-w-0 items-center gap-1.5 break-all">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                  Automated checks: {revision.engineVersion}
                </span>
              )}
              {revision.inputDigest && (
                <code
                  title={`${revision.inputDigestAlgorithm}:${revision.inputDigest}`}
                  className="break-all font-mono"
                  aria-label={`Record fingerprint ${revision.inputDigestAlgorithm} ${revision.inputDigest}`}
                >
                  Record fingerprint: {revision.inputDigestAlgorithm}:
                  {revision.inputDigest.slice(0, 12)}&hellip;
                </code>
              )}
            </div>
          </details>
        )}

        {previousRevision && (
          <Link
            href={`#revision-${previousRevision.revisionNumber}`}
            className="inline-flex items-center gap-1.5 font-semibold text-[#0066CC] hover:underline"
          >
            <GitCommitHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Earlier version {previousRevision.revisionNumber}
          </Link>
        )}
      </footer>
    </article>
  )
}

export async function generateMetadata({
  params,
}: ProgrammeVerdictHistoryPageProps): Promise<Metadata> {
  const { slug, programme } = await params
  const history = await loadHistory(slug, programme)
  if (!history) {
    return { title: 'Conclusion history', robots: { index: false, follow: true } }
  }

  return {
    title: `Conclusion history — ${history.programme.title}`,
    description: `Published reviewed answers for ${history.programme.title}, including what each answer covers and who reviewed it.`,
    alternates: {
      canonical: `/d/${history.medicine.slug}/programme/${history.programme.slug}/history`,
    },
  }
}

export default async function ProgrammeVerdictHistoryPage({
  params,
}: ProgrammeVerdictHistoryPageProps) {
  const { slug, programme } = await params
  const [viewer, history] = await Promise.all([getCurrentUser(), loadHistory(slug, programme)])
  if (!history) notFound()

  const revisionsById = new Map(history.revisions.map((revision) => [revision.id, revision]))
  const dossierHref = `/d/${history.medicine.slug}?programme=${encodeURIComponent(history.programme.slug)}`

  return (
    <AppShell initialUser={viewer}>
      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-5">
          <Link
            href={dossierHref}
            className="group inline-flex max-w-full min-w-0 items-center gap-1.5 text-xs font-semibold text-[#0066CC] transition hover:text-[#005BB5]"
          >
            <ArrowLeft
              className="h-4 w-4 shrink-0 transition group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            <span className="min-w-0 break-words">Back to {history.medicine.name}</span>
          </Link>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">
              Conclusion history
            </p>
            <h1 className="break-words text-3xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-4xl">
              {history.programme.title}
            </h1>
            <p className="break-words text-xs font-semibold text-[#6E6E73]">
              {history.medicine.name} &middot; Research status:{' '}
              {plainCodeLabel(history.programme.status)}
            </p>
            {history.programme.indication?.trim() && (
              <p className="max-w-2xl break-words text-sm leading-relaxed text-[#424245]">
                {history.programme.indication}
              </p>
            )}
            <p className="max-w-2xl text-xs leading-relaxed text-[#6E6E73]">
              This page follows one use of the medicine, the people studied, the dose, and the
              studies. Each answer applies only to that use—not every use of the medicine. Drafts
              and work awaiting review are not public.
            </p>
          </div>
        </header>

        {history.revisions.length === 0 ? (
          <section className="rounded-3xl border border-black/[0.08] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-8">
            <h2 className="text-lg font-extrabold text-[#1D1D1F]">No published conclusion yet</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6E6E73]">
              RNAWiki has not published a reviewed answer for this use.
            </p>
            <Link
              href={dossierHref}
              className="mt-4 inline-block text-xs font-bold text-[#0066CC] hover:underline"
            >
              Return to the medicine summary
            </Link>
          </section>
        ) : (
          <ol className="space-y-5" aria-label="Published conclusion history">
            {history.revisions.map((revision) => (
              <li key={revision.id}>
                <VerdictHistoryCard
                  revision={revision}
                  previousRevision={
                    revision.previousVerdictRevisionId
                      ? revisionsById.get(revision.previousVerdictRevisionId)
                      : undefined
                  }
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </AppShell>
  )
}
