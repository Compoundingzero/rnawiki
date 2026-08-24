import type { Metadata } from 'next'
import Link from 'next/link'
import { and, eq, inArray } from 'drizzle-orm'
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FilePenLine,
  Network,
  PencilLine,
  RefreshCw,
  Scale,
} from 'lucide-react'

import { AppShell } from '@/components/AppShell'
import { db } from '@/db'
import {
  programmeContributionImplementations,
  programmeContributionProposals,
  users,
} from '@/db/schema'
import {
  CONTRIBUTION_REVIEW_STATUSES,
  type ContributionSourceRefreshDeltaSnapshot,
  type ContributionReviewStatus,
} from '@/lib/contributions/types'
import {
  listPublicPendingContributionProposals,
  type PublicContributionProposal,
} from '@/lib/queries/programme-contributions'
import {
  listCanonicalQueueCandidates,
  type CanonicalQueueCandidate,
} from '@/lib/queries/programme-verdict-queue'
import {
  countPublicSourceReviewTasks,
  listPublicSourceReviewTasks,
  type PublicSourceReviewTask,
} from '@/lib/queries/public-source-review-tasks'
import { countPendingRevisions, listPendingRevisions } from '@/lib/queries/revisions'
import { getCurrentUser } from '@/lib/session'
import { resolveSafeSourceLocator } from '@/lib/source-locator'
import { TIER_LABEL } from '@/lib/trust'
import type { Revision } from '@/lib/types'
import { canReviewLegacyIdentityCorrection } from '@/lib/legacy-revision-review'
import { CanonicalPublicationPanel } from './CanonicalPublicationPanel'
import { ContributionReviewPanel } from './ContributionReviewPanel'
import { FeedbackReviewPanel } from './FeedbackReviewPanel'
import { PhysicianVerificationReviewPanel } from './PhysicianVerificationReviewPanel'
import { ReviewActions } from './ReviewActions'
import { ReviewerQualificationPanel } from './ReviewerQualificationPanel'
import { SourceRefreshAuthoringPanel } from './SourceRefreshAuthoringPanel'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50
const MAX_MERGED_PAGES = 20
const REVIEW_STATUS_FILTERS: Array<{ value: ContributionReviewStatus | null; label: string }> = [
  { value: null, label: 'Open work' },
  { value: 'AWAITING_REVIEWS', label: 'Awaiting first review' },
  { value: 'AWAITING_SECOND_REVIEW', label: 'Awaiting second review' },
  { value: 'DISAGREEMENT', label: 'Reviewers disagree' },
  { value: 'ACCEPTED_FOR_IMPLEMENTATION', label: 'Ready to prepare' },
  { value: 'CHANGES_REQUESTED', label: 'Changes requested' },
  { value: 'REJECTED', label: 'Rejected' },
]

function queueHref(status: ContributionReviewStatus | null, page = 1): string {
  const query = new URLSearchParams()
  if (status) query.set('status', status)
  if (page > 1) query.set('page', String(page))
  const suffix = query.toString()
  return suffix ? `/review-queue?${suffix}` : '/review-queue'
}

async function loadAuthorHandles(userIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(userIds)]
  if (unique.length === 0) return new Map()
  const rows = await db
    .select({ id: users.id, handle: users.handle })
    .from(users)
    .where(inArray(users.id, unique))
  return new Map(rows.map((row) => [row.id, row.handle]))
}

async function loadCandidateRevisionIds(proposalIds: string[]): Promise<Map<string, string>> {
  if (proposalIds.length === 0) return new Map()
  const rows = await db
    .select({
      proposalId: programmeContributionImplementations.proposalId,
      revisionId: programmeContributionImplementations.verdictRevisionId,
    })
    .from(programmeContributionImplementations)
    .where(inArray(programmeContributionImplementations.proposalId, [...new Set(proposalIds)]))
  return new Map(rows.map((row) => [row.proposalId, row.revisionId]))
}

async function loadSubmittedSourceReviewTaskIds(taskIds: string[]): Promise<Set<string>> {
  const unique = [...new Set(taskIds)]
  if (unique.length === 0) return new Set()
  const rows = await db
    .select({ taskId: programmeContributionProposals.sourceReviewTaskId })
    .from(programmeContributionProposals)
    .where(
      and(
        inArray(programmeContributionProposals.sourceReviewTaskId, unique),
        eq(programmeContributionProposals.status, 'SUBMITTED'),
      ),
    )
  return new Set(rows.flatMap((row) => (row.taskId ? [row.taskId] : [])))
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

function formatTimestamp(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return iso
  const month = MONTHS[parsed.getUTCMonth()] ?? ''
  const hours = String(parsed.getUTCHours()).padStart(2, '0')
  const minutes = String(parsed.getUTCMinutes()).padStart(2, '0')
  return `${parsed.getUTCDate()} ${month} ${parsed.getUTCFullYear()}, ${hours}:${minutes} UTC`
}

function ageLabel(iso: string, now = Date.now()): string {
  const submitted = new Date(iso).getTime()
  if (!Number.isFinite(submitted)) return 'Age unavailable'
  const hours = Math.max(0, Math.floor((now - submitted) / 3_600_000))
  if (hours < 1) return 'Submitted less than an hour ago'
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} waiting`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} waiting`
}

function humanize(value: string): string {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, (letter) => letter.toUpperCase())
}

function reviewStatusLabel(status: ContributionReviewStatus): string {
  return REVIEW_STATUS_FILTERS.find((filter) => filter.value === status)?.label ?? humanize(status)
}

const FIELD_LABELS: Record<string, string> = {
  'programme.title': 'Development programme name',
  'programme.indication': 'Indication',
  'programme.targetPopulation': 'People included',
  'programme.status': 'Development status',
  'programme.highestPhaseReached': 'Highest phase reached',
  'programme.route': 'How the medicine was given',
  'programme.doseExposureContext': 'Dose and exposure details',
  'programme.rawStoppingReason': 'Recorded stopping reason',
  'programme.stoppingReasonCategory': 'Category for why development stopped',
  'summary.plainMechanism': 'How it was meant to work',
  'summary.bestSupportedFinding': 'Best-supported finding',
  'summary.mainLimitation': 'Main limitation',
  'verdict.verdictCode': 'Conclusion about a stopped programme',
  'verdict.publicLabel': 'Public conclusion',
  'verdict.professionalLabel': 'Clinical wording of the conclusion',
  'verdict.oneSentenceReason': 'Short reason for the conclusion',
  'verdict.scope.indication': 'Use covered by the conclusion',
  'verdict.scope.population': 'People covered by the conclusion',
  'verdict.scope.doseExposure': 'Dose or exposure covered by the conclusion',
  'verdict.scope.period': 'Time period covered by the conclusion',
  'verdict.scope.trials': 'Trials covered by the conclusion',
  'verdict.scope.outcome': 'Outcome covered by the conclusion',
  'verdict.whatWasDisproven': 'What was disproven',
  'verdict.whatWasNotDisproven': 'What was not disproven',
  'verdict.whatRemainsUnknown': 'What remains unknown',
  'verdict.confidence': 'Confidence in the conclusion',
  'verdict.confidenceExplanation': 'Confidence explanation',
  'verdict.conditionsThatWouldChangeVerdict': 'What would change the conclusion',
  'evidenceNode.state': 'Evidence step status',
  'evidenceNode.plainSummary': 'Evidence step summary for readers',
  'evidenceNode.professionalSummary': 'Clinical summary of the evidence step',
  'evidenceNode.rationale': 'Reasoning for the evidence step',
}

function fieldLabel(path: string): string {
  return FIELD_LABELS[path] ?? 'Linked evidence field'
}

function publicValue(value: unknown): string {
  if (typeof value === 'string') return value.trim() || 'No value recorded.'
  if (Array.isArray(value)) {
    const text = value.filter((item): item is string => typeof item === 'string').join('\n')
    return text || 'No value recorded.'
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return 'No value recorded.'
}

const ENUM_VALUE_LABELS: Record<string, string> = {
  EFFICACY: 'Did not work well enough',
  SAFETY: 'Safety concern',
  CANDIDATE_PHARMACOKINETICS: 'How the body absorbed, distributed, or cleared the medicine',
  TISSUE_DELIVERY: 'Delivery to the intended tissue',
  SELECTIVITY_OR_OFF_TARGET: 'Effects on unintended genes or proteins',
  RECRUITMENT: 'Could not recruit enough participants',
  FUNDING: 'Funding ended',
  BUSINESS_STRATEGY: 'Company strategy changed',
  ACQUISITION_OR_PORTFOLIO_REPRIORITISATION: 'Company acquisition or change in priorities',
  DOSE_SELECTION: 'Dose selection',
  POPULATION_SELECTION: 'Choice of people included in the study',
  ENDPOINT_SELECTION: 'Choice of the result being measured',
  OPERATIONAL_EXECUTION: 'Problems running the study',
  RESULTS_UNAVAILABLE: 'Results are not available',
  IDEA_FAILED: 'The biological idea was not supported in this defined programme',
  MOLECULE_FAILED: 'This medicine candidate did not work in this defined programme',
  TEST_UNANSWERED: 'This defined programme did not answer the question',
  CONFIRMED: 'Supported',
  CONTRADICTED: 'Contradicted',
  NOT_MEASURED: 'Not measured',
}

const ENUM_DISPLAY_FIELDS = new Set([
  'programme.status',
  'programme.stoppingReasonCategory',
  'verdict.verdictCode',
  'verdict.confidence',
  'evidenceNode.state',
])

function publicFieldValue(field: string, value: unknown): string {
  if (ENUM_DISPLAY_FIELDS.has(field) && typeof value === 'string') {
    return ENUM_VALUE_LABELS[value] ?? humanize(value)
  }
  return publicValue(value)
}

function proposedValue(proposal: PublicContributionProposal): string {
  if (proposal.proposedStoppedVerdict) {
    return (
      ENUM_VALUE_LABELS[proposal.proposedStoppedVerdict] ??
      humanize(proposal.proposedStoppedVerdict)
    )
  }
  if (proposal.proposedText) return proposal.proposedText
  if (!proposal.selectedField) return 'No authored replacement.'
  return publicFieldValue(proposal.selectedField, proposal.proposedValue)
}

function correctionCategory(path: string): string {
  if (path === 'evidenceNode.state') return 'Evidence step status'
  if (path.startsWith('evidenceNode.')) return 'Evidence statement'
  if (path.includes('mechanism')) return 'Mechanism'
  return 'Medicine or programme details'
}

const CLAIM_NATURE_LABELS: Record<string, string> = {
  MEASURED: 'Measured result',
  SPONSOR_REPORTED: 'Reported by the sponsor',
  REGULATORY_FINDING: 'Regulator finding',
  RNAWIKI_JUDGEMENT: 'Human reviewer interpretation',
  UNKNOWN: 'Not yet classified',
}

const AFFECTS_LABELS: Record<string, string> = {
  DISPROVEN: 'Could change what was ruled out',
  OPEN_QUESTIONS: 'Could change open questions',
  BOTH: 'Could change both',
}

const IMPACT_LABELS: Record<string, string> = {
  LOW_RISK_EXACT_DATA: 'Exact-data change',
  INTERPRETIVE_REVIEW_REQUIRED: 'Needs scientific interpretation',
  POSSIBLE_VERDICT_IMPACT: 'Could change the conclusion',
  SAFETY_CRITICAL_REVIEW: 'Needs safety review',
}

const EVIDENCE_STEP_LABELS: Record<string, string> = {
  HUMAN_EXPOSURE: 'Medicine reached the body',
  USEFUL_EXPOSURE: 'Enough medicine reached the relevant tissue',
  TARGET_ENGAGEMENT: 'The intended gene or protein was affected',
  BIOLOGICAL_RESPONSE: 'A biological change was measured',
  PATIENT_OUTCOME: 'A change in patient health was measured',
}

const CHECK_MESSAGE_LABELS: Record<string, string> = {
  selected_field_present: 'The proposal does not identify the exact information to change.',
  proposal_target_matches_type: 'The selected information does not match the chosen proposal type.',
  evidence_node_scope:
    'The selected evidence step is missing or does not belong to this development programme.',
  current_verdict_available: 'There is no current published conclusion to challenge.',
  proposed_content_present: 'The proposal does not include replacement information.',
  proposed_value_shape: 'The replacement information is not in the expected format.',
  source_complete: 'The source needs a type, an identifier, and a valid web link.',
  claim_nature_known:
    'The proposal must say whether the information was measured, reported by the study sponsor, found by a regulator, or interpreted by a human reviewer.',
  reasoning_complete: 'The proposal must explain what is wrong or missing and why.',
  conclusion_scope_declared:
    'The proposal must say whether it changes what was ruled out, what remains unknown, or both.',
  coi_attested: 'A complete conflict-of-interest disclosure is required, even when there is none.',
  stopped_verdict_scope:
    'A conclusion about why development failed can be proposed only for a stopped or withdrawn programme.',
  stopped_verdict_target:
    'This conclusion category requires a stopped or withdrawn programme and a proposed replacement.',
  stopped_verdict_value_shape:
    'The proposed conclusion category must be submitted on its own, without a second replacement value.',
  dependency_graph_coverage:
    'This information is not yet linked to every page or section it may affect. A reviewer must check for missing links.',
}

function plainCheckMessage(check: { code: string; message: string }): string {
  return CHECK_MESSAGE_LABELS[check.code] ?? check.message
}

function surfaceLabel(surfaceType: string): string {
  const labels: Record<string, string> = {
    PROGRAMME_SUMMARY: '10-second summary',
    PROGRAMME_STATUS: 'programme status',
    EVIDENCE_NODE: 'evidence step',
    TIMELINE: 'development timeline',
    VERDICT: 'programme conclusion',
    SAFETY_LANGUAGE: 'safety interpretation',
    SEARCH_DOCUMENT: 'search results',
    BROWSE_CARD: 'browse card',
    HOMEPAGE_CARD: 'homepage card',
    METADATA: 'page title and description',
    STRUCTURED_DATA: 'data read by search engines',
    API_OUTPUT: 'public API output',
  }
  return labels[surfaceType] ?? 'other linked public information'
}

function sourceTaskSurfaceLabel(path: string): string {
  const parts = path.split(':')
  const surface = surfaceLabel(parts[0] ?? '')
  const fieldPath = parts.at(-1) ?? ''
  const field = FIELD_LABELS[fieldPath]
  return field ? `${surface}: ${field}` : surface
}

const SOURCE_FIELD_LABELS: Record<string, string> = {
  'trial.identifier': 'ClinicalTrials.gov study number',
  'trial.overallStatus': 'Study status',
  'trial.hasResults': 'Results posted',
  'trial.enrollment.count': 'Number of participants',
  'trial.enrollment.type': 'Participant count type',
  'trial.phases': 'Study phase',
  'trial.startDate': 'Start date',
  'trial.primaryCompletionDate': 'Primary completion date',
  'trial.completionDate': 'Completion date',
  'trial.sponsor.name': 'Lead sponsor',
  'trial.sponsor.class': 'Sponsor type',
  'trial.registryRecord': 'Other registry details',
}

function sourceFactValue(value: string | number | boolean | null): string {
  if (value === null) return 'Not reported'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString('en-US')
  const trimmed = value.trim()
  if (!trimmed) return 'Not reported'
  return /^[A-Z][A-Z0-9_]*$/.test(trimmed) ? humanize(trimmed) : trimmed
}

function SourceDeltaComparison({ delta }: { delta: ContributionSourceRefreshDeltaSnapshot }) {
  return (
    <section aria-label="Registry field changes" className="rounded-2xl bg-[#F5F5F7] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
        Registry fields read by RNAWiki
      </p>
      <div className="mt-3 space-y-3">
        {delta.changedTrialFields.map((change) => (
          <article key={change.path} className="rounded-xl border border-black/[0.08] bg-white p-3">
            <h3 className="text-xs font-semibold text-[#1D1D1F]">
              {SOURCE_FIELD_LABELS[change.path] ?? 'Registry field'}
            </h3>
            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#6E6E73]">
                  Saved comparison reference
                </dt>
                <dd className="mt-0.5 break-words text-[11px] leading-5 text-[#424245]">
                  {sourceFactValue(change.before)}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-wide text-[#0066CC]">
                  New saved version
                </dt>
                <dd className="mt-0.5 break-words text-[11px] leading-5 text-[#1D1D1F]">
                  {sourceFactValue(change.after)}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <p className="mt-3 break-all font-mono text-[9px] leading-4 text-[#6E6E73]">
        Comparison reference {delta.deltaDigest.slice(0, 16)}
      </p>
    </section>
  )
}

function QueueBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-black/[0.08] bg-[#F5F5F7] px-2.5 py-1 text-[10px] font-semibold uppercase leading-4 tracking-wide text-[#424245]">
      {children}
    </span>
  )
}

function QueuedRevision({
  revision,
  handle,
  showActions,
  viewerAccountId,
}: {
  revision: Revision
  handle: string | undefined
  showActions: boolean
  viewerAccountId: string | null
}) {
  const correction = revision.identityCorrection
  if (!correction) return null
  const sourceHref = resolveSafeSourceLocator(correction.sourceUrl)?.href ?? null

  return (
    <article className="min-w-0 space-y-4 rounded-3xl border border-black/[0.08] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-6">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
            <FilePenLine className="h-3.5 w-3.5 text-[#0071E3]" aria-hidden="true" />
            Medicine identity correction
          </p>
          <Link
            href={`/d/${revision.drugSlug}`}
            className="mt-1 block break-words text-lg font-extrabold tracking-tight text-[#1D1D1F] transition hover:text-[#0071E3]"
          >
            {revision.drugName}
          </Link>
        </div>
        <div className="text-right text-[10px] leading-4 text-[#6E6E73]">
          <time dateTime={revision.createdAt}>{formatTimestamp(revision.createdAt)}</time>
          <p>{ageLabel(revision.createdAt)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {handle ? (
          <Link href={`/u/${handle}`} className="font-bold text-[#0071E3] hover:underline">
            {revision.authorName}
          </Link>
        ) : (
          <span className="font-bold text-[#1D1D1F]">{revision.authorName}</span>
        )}
        <QueueBadge>{TIER_LABEL[revision.authorTrustTier]}</QueueBadge>
        {revision.authorOrcid && (
          <a
            href={`https://orcid.org/${revision.authorOrcid}`}
            rel="noopener noreferrer"
            target="_blank"
            className="break-all font-mono text-[10px] text-[#6E6E73] hover:text-[#0071E3] hover:underline"
          >
            ORCID {revision.authorOrcid}
          </a>
        )}
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#6E6E73]">
          Why the contributor proposed this
        </p>
        <p className="mt-1 break-words text-xs leading-6 text-[#424245] sm:text-sm">
          {revision.summary}
        </p>
      </div>

      {revision.changedFields.length > 0 && (
        <div className="space-y-2 rounded-2xl bg-[#F5F5F7] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#6E6E73]">
            Affected fields
          </p>
          <ul className="space-y-2">
            {revision.changedFields.map((change) => (
              <li key={change.field} className="break-words text-[11px] leading-5">
                <strong className="text-[#1D1D1F]">{change.label}:</strong>{' '}
                <span className="text-[#6E6E73]">{change.before || 'Not recorded'}</span>
                <span aria-hidden="true"> → </span>
                <span className="sr-only"> changed to </span>
                <span className="text-[#1D1D1F]">{change.after || 'Not recorded'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-1 rounded-2xl border border-black/[0.08] p-4 text-[11px] leading-5">
        <p className="font-bold text-[#1D1D1F]">Source supplied by the contributor</p>
        {sourceHref ? (
          <a
            href={sourceHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 break-words font-semibold text-[#0071E3] hover:underline"
            aria-label={`Open source page: ${correction.sourceTitle}`}
          >
            {correction.sourceTitle}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </a>
        ) : (
          <p className="font-semibold text-[#424245]">{correction.sourceTitle}</p>
        )}
        <p className="break-all font-mono text-[10px] text-[#6E6E73]">{correction.sourceUrl}</p>
        <p className="text-[#6E6E73]">
          RNAWiki does not fetch or endorse this page automatically. The reviewer must open it and
          check that it supports the proposed name.
        </p>
      </div>

      <Link
        href={`/d/${revision.drugSlug}/history`}
        className="inline-flex min-h-11 items-center text-[11px] font-bold text-[#0071E3] hover:underline"
      >
        Full history of this record
      </Link>

      {showActions && viewerAccountId && (
        <ReviewActions
          revisionId={revision.id}
          drugName={revision.drugName}
          viewerAccountId={viewerAccountId}
        />
      )}
    </article>
  )
}

function ContributionProposalCard({
  proposal,
  candidateRevisionId,
}: {
  proposal: PublicContributionProposal
  candidateRevisionId?: string
}) {
  const warnings = proposal.machineChecks.checks.filter((check) => check.status === 'WARN')
  const blockers = proposal.machineChecks.checks.filter((check) => check.status === 'FAIL')
  const surfaces = [
    ...new Set(
      proposal.impactPreview.affectedSurfaces.map((surface) =>
        surfaceLabel(surface.dependentSurfaceType),
      ),
    ),
  ]
  const isChallenge = proposal.proposalType === 'VERDICT_CHALLENGE'
  const isSourceRefresh = proposal.proposalType === 'SOURCE_REFRESH'
  const Icon = isSourceRefresh ? RefreshCw : isChallenge ? Scale : PencilLine
  const sourceHref = resolveSafeSourceLocator(proposal.source.locator)?.href ?? null

  return (
    <article className="min-w-0 space-y-5 rounded-3xl border border-black/[0.08] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-6">
      <header className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
            <Icon className="h-3.5 w-3.5 text-[#0071E3]" aria-hidden="true" />
            {isSourceRefresh
              ? 'Exact source refresh'
              : isChallenge
                ? 'Challenge to a conclusion'
                : 'Correction'}
          </p>
          <Link
            href={`/d/${proposal.medicine.slug}?programme=${encodeURIComponent(proposal.programme.slug)}`}
            className="mt-1 block break-words text-lg font-extrabold tracking-tight text-[#1D1D1F] transition hover:text-[#0071E3]"
          >
            {proposal.medicine.name}
          </Link>
          <p className="mt-1 break-words text-xs font-semibold leading-5 text-[#424245]">
            {proposal.programme.title} · {humanize(proposal.programme.status)}
          </p>
        </div>
        <div className="text-right text-[10px] leading-4 text-[#6E6E73]">
          <time dateTime={proposal.submittedAt}>{formatTimestamp(proposal.submittedAt)}</time>
          {proposal.reviewState.resolvedAt ? (
            <p>
              Review resolved{' '}
              <time dateTime={proposal.reviewState.resolvedAt}>
                {formatTimestamp(proposal.reviewState.resolvedAt)}
              </time>
            </p>
          ) : (
            <p>{ageLabel(proposal.submittedAt)}</p>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <QueueBadge>
          {isSourceRefresh
            ? 'Exact registry facts only'
            : isChallenge
              ? 'Challenge to a conclusion'
              : correctionCategory(proposal.selectedField!)}
        </QueueBadge>
        {proposal.claimNature && (
          <QueueBadge>
            {CLAIM_NATURE_LABELS[proposal.claimNature] ?? humanize(proposal.claimNature)}
          </QueueBadge>
        )}
        {proposal.affects && (
          <QueueBadge>{AFFECTS_LABELS[proposal.affects] ?? humanize(proposal.affects)}</QueueBadge>
        )}
        <QueueBadge>{reviewStatusLabel(proposal.reviewState.status)}</QueueBadge>
      </div>

      <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-5 text-[#6E6E73]">
        <span>Contributor:</span>
        <Link
          href={`/u/${proposal.author.handle}`}
          className="font-semibold text-[#0066CC] hover:underline"
        >
          {proposal.author.name}
        </Link>
        {proposal.author.orcid && (
          <a
            href={`https://orcid.org/${proposal.author.orcid}`}
            target="_blank"
            rel="noreferrer"
            className="break-all font-mono text-[9px] hover:text-[#0066CC] hover:underline"
          >
            ORCID {proposal.author.orcid}
          </a>
        )}
      </p>

      {isSourceRefresh && proposal.sourceRefreshDeltaSnapshot ? (
        <SourceDeltaComparison delta={proposal.sourceRefreshDeltaSnapshot} />
      ) : (
        <section aria-label="Proposed field change" className="rounded-2xl bg-[#F5F5F7] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
            {fieldLabel(proposal.selectedField!)}
          </p>
          <dl className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
            <div className="min-w-0 rounded-xl border border-black/[0.08] bg-white p-3">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
                Current
              </dt>
              <dd className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[#424245]">
                {publicFieldValue(proposal.selectedField!, proposal.structuredDiff.currentValue)}
              </dd>
            </div>
            <div className="min-w-0 rounded-xl border border-blue-200 bg-blue-50 p-3">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#0066CC]">
                Proposed
              </dt>
              <dd className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[#1D1D1F]">
                {proposedValue(proposal)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-black/[0.08] p-4">
          <h3 className="text-xs font-semibold text-[#1D1D1F]">
            {isSourceRefresh
              ? 'What the contributor could and could not change'
              : 'Why it was submitted'}
          </h3>
          {isSourceRefresh ? (
            <p className="mt-2 break-words text-[11px] leading-5 text-[#424245]">
              RNAWiki’s software produced every before-and-after value from the official registry.
              The contributor could disclose conflicts but could not write a replacement statement
              or conclusion.
            </p>
          ) : (
            <>
              <p className="mt-2 break-words text-[11px] leading-5 text-[#424245]">
                <strong>Wrong or missing:</strong> {proposal.whatWasWrongOrMissing}
              </p>
              <p className="mt-2 break-words text-[11px] leading-5 text-[#424245]">
                <strong>Reasoning:</strong> {proposal.reasoning}
              </p>
            </>
          )}
          {proposal.evidenceNode && (
            <p className="mt-2 break-words text-[10px] leading-4 text-[#6E6E73]">
              <strong>Evidence step affected:</strong> {proposal.evidenceNode.label} —{' '}
              {proposal.evidenceNode.title} (
              {EVIDENCE_STEP_LABELS[proposal.evidenceNode.nodeType] ??
                humanize(proposal.evidenceNode.nodeType)}
              )
            </p>
          )}
        </section>

        <section className="min-w-0 rounded-2xl border border-black/[0.08] p-4">
          <h3 className="text-xs font-semibold text-[#1D1D1F]">Source</h3>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-[#6E6E73]">
            {humanize(proposal.source.type)}
          </p>
          {sourceHref ? (
            <a
              href={sourceHref}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex min-h-11 max-w-full items-center gap-1.5 break-all text-[11px] font-semibold leading-5 text-[#0071E3] hover:underline"
            >
              {proposal.source.identifier}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          ) : (
            <p className="mt-1 break-all text-[11px] font-semibold leading-5 text-[#424245]">
              {proposal.source.identifier}
            </p>
          )}
          <details className="mt-2">
            <summary className="inline-flex min-h-11 cursor-pointer items-center text-[11px] font-semibold text-[#0071E3]">
              Conflict-of-interest disclosure
            </summary>
            <p className="break-words text-[11px] leading-5 text-[#424245]">
              {proposal.conflictsOfInterest}
            </p>
            <p className="mt-1 text-[10px] text-[#6E6E73]">
              Contributor confirmed this disclosure:{' '}
              {proposal.conflictsOfInterestAttested ? 'Yes' : 'No'}
            </p>
          </details>
        </section>
      </div>

      <section className="grid min-w-0 gap-4 rounded-2xl bg-[#F5F5F7] p-4 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F]">
            {blockers.length === 0 ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" />
            )}
            Automated completeness checks
          </p>
          <p className="mt-1 text-[11px] leading-5 text-[#424245]">
            {blockers.length} {blockers.length === 1 ? 'blocker' : 'blockers'} · {warnings.length}{' '}
            {warnings.length === 1 ? 'warning' : 'warnings'}
          </p>
          <p className="mt-1 text-[10px] leading-4 text-[#6E6E73]">
            These rules find missing or inconsistent information. They do not decide whether a
            medical statement is correct.
          </p>
          {warnings.length > 0 && (
            <ul className="mt-2 space-y-1.5 text-[11px] leading-5 text-amber-900">
              {warnings.map((warning) => (
                <li key={warning.code} className="break-words">
                  Warning: {plainCheckMessage(warning)}
                </li>
              ))}
            </ul>
          )}
          {blockers.length > 0 && (
            <ul className="mt-2 space-y-1.5 text-[11px] leading-5 text-rose-900">
              {blockers.map((blocker) => (
                <li key={blocker.code} className="break-words">
                  Blocker: {plainCheckMessage(blocker)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F]">
            <Network className="h-4 w-4 shrink-0 text-[#0071E3]" aria-hidden="true" />
            What else may need updating
          </p>
          {surfaces.length > 0 ? (
            <ul className="mt-2 space-y-1 text-[11px] leading-5 text-[#424245]">
              {surfaces.map((surface) => (
                <li key={surface}>• {surface}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[11px] leading-5 text-amber-900">
              This field is not yet linked to other displayed information. A reviewer must check
              whether any links are missing.
            </p>
          )}
          {proposal.impactPreview.highestImpactLevel && (
            <p className="mt-2 text-[10px] uppercase tracking-wide text-[#6E6E73]">
              {IMPACT_LABELS[proposal.impactPreview.highestImpactLevel] ??
                humanize(proposal.impactPreview.highestImpactLevel)}
            </p>
          )}
        </div>
      </section>

      <footer>
        <p className="break-all font-mono text-[9px] uppercase leading-4 tracking-wide text-[#6E6E73]">
          Submitted version {proposal.revisionNumber} · reference{' '}
          {proposal.contentDigest.slice(0, 16)}
        </p>
        <ContributionReviewPanel
          proposalId={proposal.id}
          medicineName={proposal.medicine.name}
          initialState={proposal.reviewState}
          publicReviews={proposal.reviews}
          publicAdjudication={proposal.adjudication}
        />
        {proposal.reviewState.status === 'ACCEPTED_FOR_IMPLEMENTATION' && (
          <CanonicalPublicationPanel
            proposalId={proposal.id}
            initialRevisionId={candidateRevisionId}
            initialReviewStatus={proposal.reviewState.status}
            medicineName={proposal.medicine.name}
            programmeTitle={proposal.programme.title}
            medicineHref={`/d/${proposal.medicine.slug}?programme=${encodeURIComponent(proposal.programme.slug)}`}
            compact
          />
        )}
      </footer>
    </article>
  )
}

function SourceReviewTaskCard({
  task,
  alreadySubmitted,
}: {
  task: PublicSourceReviewTask
  alreadySubmitted: boolean
}) {
  const sourceHref = resolveSafeSourceLocator(task.source.locator)?.href ?? null
  return (
    <article className="min-w-0 space-y-4 rounded-3xl border border-black/[0.08] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-6">
      <header className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
            <RefreshCw className="h-3.5 w-3.5 text-[#0071E3]" aria-hidden="true" />
            Source changed
          </p>
          <Link
            href={`/d/${task.medicine.slug}?programme=${encodeURIComponent(task.programme.slug)}`}
            className="mt-1 block break-words text-lg font-extrabold tracking-tight text-[#1D1D1F] transition hover:text-[#0071E3]"
          >
            {task.medicine.name}
          </Link>
          <p className="mt-1 break-words text-xs font-semibold leading-5 text-[#424245]">
            {task.programme.title}
          </p>
        </div>
        <div className="text-right text-[10px] leading-4 text-[#6E6E73]">
          <time dateTime={task.createdAt}>{formatTimestamp(task.createdAt)}</time>
          <p>{ageLabel(task.createdAt)}</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <QueueBadge>Source changed</QueueBadge>
        <QueueBadge>{humanize(task.status)}</QueueBadge>
        <QueueBadge>{IMPACT_LABELS[task.impactLevel] ?? humanize(task.impactLevel)}</QueueBadge>
      </div>

      <p className="break-words text-xs leading-6 text-[#424245]">{task.reason}</p>

      {task.sourceRefreshDeltaSnapshot && (
        <SourceDeltaComparison delta={task.sourceRefreshDeltaSnapshot} />
      )}

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <section className="min-w-0 rounded-2xl bg-[#F5F5F7] p-4">
          <h3 className="text-xs font-semibold text-[#1D1D1F]">Pages or sections to recheck</h3>
          {task.affectedSurfacePaths.length > 0 ? (
            <ul className="mt-2 space-y-1 text-[11px] leading-5 text-[#424245]">
              {task.affectedSurfacePaths.map((path) => (
                <li key={path} className="break-words">
                  • {sourceTaskSurfaceLabel(path)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[11px] leading-5 text-[#6E6E73]">
              No public page or section is linked yet. A reviewer must check whether any links are
              missing.
            </p>
          )}
          <p className="mt-2 text-[10px] text-[#6E6E73]">
            {task.affectedClaimIds.length} affected evidence{' '}
            {task.affectedClaimIds.length === 1 ? 'statement' : 'statements'}
          </p>
        </section>

        <section className="min-w-0 rounded-2xl border border-black/[0.08] p-4">
          <h3 className="text-xs font-semibold text-[#1D1D1F]">Changed source</h3>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-[#6E6E73]">
            {humanize(task.source.type)}
          </p>
          {sourceHref ? (
            <a
              href={sourceHref}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex min-h-11 max-w-full items-center gap-1.5 break-all text-[11px] font-semibold leading-5 text-[#0071E3] hover:underline"
            >
              {task.source.identifier ?? task.source.title ?? 'Open source'}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </a>
          ) : (
            <p className="mt-1 break-all text-[11px] font-semibold leading-5 text-[#424245]">
              {task.source.identifier ?? task.source.title ?? 'Source locator unavailable'}
            </p>
          )}
        </section>
      </div>

      <p className="flex items-start gap-2 border-t border-black/[0.07] pt-4 text-[11px] font-semibold leading-5 text-[#424245]">
        <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-[#0071E3]" aria-hidden="true" />
        Waiting for a person to review the change. RNAWiki saved the updated source but did not
        rewrite any evidence statement or conclusion automatically.
      </p>
      <SourceRefreshAuthoringPanel task={task} alreadySubmitted={alreadySubmitted} />
    </article>
  )
}

type QueueEntry =
  | { kind: 'legacy'; id: string; timestamp: string; revision: Revision }
  | {
      kind: 'contribution'
      id: string
      timestamp: string
      proposal: PublicContributionProposal
    }
  | { kind: 'source'; id: string; timestamp: string; task: PublicSourceReviewTask }
  | {
      kind: 'canonical'
      id: string
      timestamp: string
      candidate: CanonicalQueueCandidate
    }

export const metadata: Metadata = {
  title: 'Review queue',
  description:
    'Submitted corrections, challenges to published conclusions, and changed sources waiting for human review on RNAWiki.',
  alternates: { canonical: '/review-queue' },
}

type ReviewQueuePageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function ReviewQueuePage({ searchParams }: ReviewQueuePageProps) {
  const params = await searchParams
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page
  const parsedPage = Number.parseInt(rawPage ?? '1', 10)
  const page = Number.isFinite(parsedPage) ? Math.min(MAX_MERGED_PAGES, Math.max(1, parsedPage)) : 1
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status
  const selectedReviewStatus = (CONTRIBUTION_REVIEW_STATUSES as readonly string[]).includes(
    rawStatus ?? '',
  )
    ? (rawStatus as ContributionReviewStatus)
    : null
  const includeNonContributionWork = selectedReviewStatus === null
  const windowSize = page * PAGE_SIZE

  const [
    user,
    revisions,
    legacyTotal,
    contributions,
    sourceTasks,
    sourceTotal,
    canonicalCandidates,
  ] = await Promise.all([
    getCurrentUser(),
    includeNonContributionWork
      ? listPendingRevisions({ limit: windowSize, offset: 0 })
      : Promise.resolve([]),
    includeNonContributionWork ? countPendingRevisions() : Promise.resolve(0),
    listPublicPendingContributionProposals({
      limit: windowSize,
      offset: 0,
      ...(selectedReviewStatus ? { reviewStatus: selectedReviewStatus } : {}),
    }),
    includeNonContributionWork
      ? listPublicSourceReviewTasks({ limit: windowSize, offset: 0 })
      : Promise.resolve([]),
    includeNonContributionWork ? countPublicSourceReviewTasks() : Promise.resolve(0),
    includeNonContributionWork
      ? listCanonicalQueueCandidates({ limit: windowSize, offset: 0 })
      : Promise.resolve({ candidates: [], total: 0 }),
  ])

  const candidateRevisionIds = await loadCandidateRevisionIds(
    contributions.proposals.map((proposal) => proposal.id),
  )
  const submittedSourceReviewTaskIds = await loadSubmittedSourceReviewTaskIds(
    sourceTasks.map((task) => task.id),
  )

  const merged: QueueEntry[] = [
    ...revisions.map((revision): QueueEntry => ({
      kind: 'legacy',
      id: revision.id,
      timestamp: revision.createdAt,
      revision,
    })),
    ...contributions.proposals.map((proposal): QueueEntry => ({
      kind: 'contribution',
      id: proposal.id,
      timestamp: proposal.submittedAt,
      proposal,
    })),
    ...sourceTasks.map((task): QueueEntry => ({
      kind: 'source',
      id: task.id,
      timestamp: task.createdAt,
      task,
    })),
    ...canonicalCandidates.candidates.map((candidate): QueueEntry => ({
      kind: 'canonical',
      id: candidate.id,
      timestamp: candidate.createdAt,
      candidate,
    })),
  ].sort(
    (left, right) =>
      left.timestamp.localeCompare(right.timestamp) || left.id.localeCompare(right.id),
  )

  const pageEntries = merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const total = legacyTotal + contributions.total + sourceTotal + canonicalCandidates.total
  const lastPage = Math.min(MAX_MERGED_PAGES, Math.max(1, Math.ceil(total / PAGE_SIZE)))
  const reachedMergedWindow = total > MAX_MERGED_PAGES * PAGE_SIZE && page === lastPage
  const selectedFilterLabel =
    REVIEW_STATUS_FILTERS.find((filter) => filter.value === selectedReviewStatus)?.label ??
    (selectedReviewStatus ? humanize(selectedReviewStatus) : 'Open work')
  const showLegacyActions = canReviewLegacyIdentityCorrection(user)
  const showQualificationControls = Boolean(user && (user.isAdmin || user.trustTier === 'steward'))
  const handles = await loadAuthorHandles(
    pageEntries.flatMap((entry) =>
      entry.kind === 'legacy' && entry.revision.authorUserId ? [entry.revision.authorUserId] : [],
    ),
  )

  return (
    <AppShell initialUser={user}>
      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">
            Public review queue
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-4xl">
            {selectedReviewStatus ? selectedFilterLabel : 'Evidence awaiting review'}
          </h1>
          <p className="max-w-2xl text-xs leading-6 text-[#6E6E73] sm:text-sm">
            {selectedReviewStatus ? (
              <>
                This view groups submitted proposals by review status. “Ready to prepare” means a
                steward may now build a proposed update for another two-person review. It does not
                mean the public medicine record has changed.
              </>
            ) : (
              <>
                Corrections, challenges to conclusions about a specific development programme,
                changed sources, and medicine-name corrections appear here oldest first. Automated
                rules flag missing or inconsistent information, but people decide what the evidence
                means.
              </>
            )}
          </p>
          <p className="text-[11px] font-semibold tabular-nums text-[#6E6E73]">
            {total === 0
              ? selectedReviewStatus
                ? `No ${selectedFilterLabel?.toLowerCase()} records.`
                : 'Nothing is waiting.'
              : `${total.toLocaleString('en-GB')} ${total === 1 ? 'item' : 'items'} ${
                  selectedReviewStatus ? `in ${selectedFilterLabel?.toLowerCase()}` : 'waiting'
                }`}
          </p>
          <ul aria-label="Queue categories" className="flex flex-wrap gap-2 pt-1">
            <li>
              <QueueBadge>Medicine identity correction</QueueBadge>
            </li>
            <li>
              <QueueBadge>Correction</QueueBadge>
            </li>
            <li>
              <QueueBadge>Challenge to a conclusion</QueueBadge>
            </li>
            <li>
              <QueueBadge>Source changed</QueueBadge>
            </li>
            <li>
              <QueueBadge>Proposed published update</QueueBadge>
            </li>
          </ul>
          <nav aria-label="Contribution review status" className="pt-2">
            <ul className="flex flex-wrap gap-2">
              {REVIEW_STATUS_FILTERS.map((filter) => {
                const selected = filter.value === selectedReviewStatus
                return (
                  <li key={filter.value ?? 'open'}>
                    <Link
                      href={queueHref(filter.value)}
                      aria-current={selected ? 'page' : undefined}
                      className={`inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] ${
                        selected
                          ? 'border-[#0071E3] bg-blue-50 text-[#0066CC]'
                          : 'border-black/[0.08] bg-white text-[#424245] hover:bg-[#F5F5F7]'
                      }`}
                    >
                      {filter.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </header>

        {showQualificationControls && (
          <section className="space-y-3" aria-label="Private steward and administrator work">
            <ReviewerQualificationPanel />
            <PhysicianVerificationReviewPanel />
            <FeedbackReviewPanel />
          </section>
        )}

        {total > 0 && (
          <div className="space-y-2 rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-[11px] leading-5 text-[#6E6E73]">
            <p>
              Reviewers cannot see each other’s identity or decision until they submit their own.
              Programme evidence proposals are prepared as one fixed version, checked by RNA
              Intelligence, and reviewed again before publication. A medicine-name correction uses
              one independent reviewer. Authors cannot review or settle disagreement on their own
              submission. A public medical conclusion changes only through the separate programme
              publication check.
            </p>
            {!showLegacyActions && legacyTotal > 0 && (
              <p>
                Decisions on edits from the older system require a trusted editor, steward, or
                administrator account.
              </p>
            )}
          </div>
        )}

        {pageEntries.length === 0 ? (
          <div className="space-y-2 rounded-3xl border border-black/[0.08] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-8">
            <p className="text-xs leading-6 text-[#6E6E73] sm:text-sm">
              {selectedReviewStatus
                ? `No ${selectedFilterLabel?.toLowerCase()} contribution records are available.`
                : 'No evidence work is waiting for review right now.'}
            </p>
            <Link
              href="/browse"
              className="inline-flex min-h-11 items-center text-xs font-bold text-[#0071E3] hover:underline"
            >
              Browse medicines
            </Link>
          </div>
        ) : (
          <ol
            className="space-y-4"
            aria-label={
              selectedReviewStatus ? `${selectedFilterLabel} records` : 'Items waiting for review'
            }
          >
            {pageEntries.map((entry) => (
              <li key={`${entry.kind}:${entry.id}`} className="min-w-0">
                {entry.kind === 'legacy' ? (
                  <QueuedRevision
                    revision={entry.revision}
                    handle={
                      entry.revision.authorUserId
                        ? handles.get(entry.revision.authorUserId)
                        : undefined
                    }
                    showActions={
                      showLegacyActions && entry.revision.authorUserId !== (user?.id ?? null)
                    }
                    viewerAccountId={user?.id ?? null}
                  />
                ) : entry.kind === 'contribution' ? (
                  <ContributionProposalCard
                    proposal={entry.proposal}
                    candidateRevisionId={candidateRevisionIds.get(entry.proposal.id)}
                  />
                ) : entry.kind === 'source' ? (
                  <SourceReviewTaskCard
                    task={entry.task}
                    alreadySubmitted={submittedSourceReviewTaskIds.has(entry.task.id)}
                  />
                ) : (
                  <CanonicalPublicationPanel
                    proposalId={entry.candidate.proposalId}
                    initialRevisionId={entry.candidate.id}
                    initialReviewStatus={entry.candidate.reviewStatus}
                    medicineName={entry.candidate.medicine.name}
                    programmeTitle={entry.candidate.programme.title}
                    medicineHref={`/d/${entry.candidate.medicine.slug}?programme=${encodeURIComponent(entry.candidate.programme.slug)}`}
                  />
                )}
              </li>
            ))}
          </ol>
        )}

        {lastPage > 1 && (
          <nav
            aria-label="Queue pages"
            className="flex min-h-11 items-center justify-between gap-3"
          >
            {page > 1 ? (
              <Link
                href={queueHref(selectedReviewStatus, page - 1)}
                rel="prev"
                className="inline-flex min-h-11 items-center text-xs font-bold text-[#0071E3] hover:underline"
              >
                Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-[11px] font-semibold tabular-nums text-[#6E6E73]">
              Page {page.toLocaleString('en-GB')} of {lastPage.toLocaleString('en-GB')}
            </span>
            {page < lastPage ? (
              <Link
                href={queueHref(selectedReviewStatus, page + 1)}
                rel="next"
                className="inline-flex min-h-11 items-center text-xs font-bold text-[#0071E3] hover:underline"
              >
                Next
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        {reachedMergedWindow && (
          <p className="rounded-2xl bg-[#F5F5F7] px-4 py-3 text-[11px] leading-5 text-[#6E6E73]">
            This view shows the first {MAX_MERGED_PAGES * PAGE_SIZE} oldest matching items. The
            remaining records are still stored, but this screen does not display them.
          </p>
        )}
      </div>
    </AppShell>
  )
}
