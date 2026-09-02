import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  CircleMinus,
  CircleX,
  ExternalLink,
  GitCompareArrows,
  History,
} from 'lucide-react'

import { AdvancedEvidenceDisclosure } from '@/components/AdvancedEvidenceDisclosure'
import { AnnotatedMedicineText } from '@/components/AnnotatedMedicineText'
import { CommunityCommentary } from '@/components/CommunityCommentary'
import { DossierContributionActions } from '@/components/DossierContributionActions'
import { LegacyIdentityCorrectionActions } from '@/components/LegacyIdentityCorrectionActions'
import { MedicineBackgroundDisclosure } from '@/components/MedicineBackgroundDisclosure'
import {
  DossierPharmacokinetics,
  DossierProgrammeFailure,
  DossierSafetyEvidence,
} from '@/components/dossier/DossierDynamicEvidenceModules'
import { CitationExportPanel } from '@/components/dossier/CitationExportPanel'
import { DossierEvidenceIntroduction } from '@/components/dossier/DossierEvidenceIntroduction'
import { DossierAccountActionsGuard } from '@/components/dossier/DossierAccountActionsGuard'
import { DossierAudienceLensSelector } from '@/components/dossier/DossierAudienceLensSelector'
import { DossierCompletionAssessment } from '@/components/dossier/DossierCompletionAssessment'
import { DossierEvidencePath, evidenceNodeAnchorId } from '@/components/dossier/DossierEvidencePath'
import { DossierOtherProgrammes } from '@/components/dossier/DossierOtherProgrammes'
import { DossierHeader } from '@/components/dossier/DossierHeader'
import { DossierSectionNavigator } from '@/components/dossier/DossierSectionNavigator'
import { dossierAudienceLensProjections } from '@/lib/dossier-audience-lenses'
import { dossierNavigatorSections } from '@/lib/dossier-navigator-sections'
import { DossierNavigation } from '@/components/dossier/DossierNavigation'
import { DossierOutcomeComparison } from '@/components/dossier/DossierOutcomeComparison'
import { DossierQuestionCoverage } from '@/components/dossier/DossierQuestionCoverage'
import { DossierResearchQuestion } from '@/components/dossier/DossierResearchQuestion'
import {
  hasResolvedProgrammeMechanismSupport,
  TenSecondAnswer,
} from '@/components/dossier/TenSecondAnswer'
import {
  hasMedicineRecordContext,
  MedicineRecordContextSections,
} from '@/components/MedicineRecordContextSections'
import type {
  DossierFreshnessState,
  EvidenceClaimView,
  EvidenceClaimNature,
  EvidenceDisplayState,
  EvidenceNodeState,
  EvidenceNodeTechnicalDetailView,
  EvidenceSourceView,
  MedicineDossierViewModel,
  ProgrammeSourceClaimBindingView,
  ProgrammeTimelineEventView,
  StudyView,
} from '@/lib/medicine-dossier-view-model'
import { GENERAL_RESEARCH_SUMMARY_COPY } from '@/lib/public-medicine-language'
import {
  COMMON_PUBLIC_MEDICINE_CONTEXT,
  endpointHierarchyContextItem,
  outcomeTypeContextItem,
  publicMedicineStudyDayContextItems,
  type PublicMedicineContextItem,
} from '@/lib/public-medicine-context'
import { medicineTextContextMatches } from '@/lib/annotated-medicine-text'
import type {
  MechanismEvidenceBasis,
  ProgrammeTimelineDateBasis,
  ProgrammeTimelineEventType,
  VerdictReviewerExpertiseTag,
} from '@/lib/evidence/types'

interface MedicineDossierV2Props {
  dossier: MedicineDossierViewModel
}

const evidenceStyle: Record<
  EvidenceDisplayState,
  { label: string; badge: string; border: string }
> = {
  measured: {
    label: 'Measured directly',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    border: 'border-emerald-200/70',
  },
  inferred: {
    label: 'Indirect conclusion',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    border: 'border-amber-200/70',
  },
  unknown: {
    label: 'Not answered',
    badge: 'bg-[#F5F5F7] text-[#6E6E73] border-black/[0.08]',
    border: 'border-black/[0.08]',
  },
  failed: {
    label: 'Expected change was not found',
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
    border: 'border-rose-200/70',
  },
  conclusion_shift: {
    label: 'Answer changed after new information',
    badge: 'bg-blue-50 text-[#0066CC] border-blue-200',
    border: 'border-blue-200/70',
  },
  recorded_context: {
    label: `${GENERAL_RESEARCH_SUMMARY_COPY.label} · not reviewed for one use`,
    badge: 'bg-blue-50 text-[#0066CC] border-blue-200',
    border: 'border-blue-200/70',
  },
}

const evidenceNodeStyle: Record<
  EvidenceNodeState,
  { label: string; badge: string; border: string }
> = {
  confirmed: {
    label: 'Evidence supports this step',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    border: 'border-emerald-200/70',
  },
  contradicted: {
    label: 'Evidence points against this step',
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
    border: 'border-rose-200/70',
  },
  unknown: {
    label: 'Not enough information',
    badge: 'bg-[#F5F5F7] text-[#6E6E73] border-black/[0.12]',
    border: 'border-black/[0.1]',
  },
  not_measured: {
    label: 'Not measured',
    badge: 'border-dashed bg-white text-[#6E6E73] border-black/20',
    border: 'border-dashed border-black/20',
  },
  mixed: {
    label: 'Studies point in different directions',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    border: 'border-amber-200/70',
  },
  recorded_context: {
    label: `${GENERAL_RESEARCH_SUMMARY_COPY.label} · not reviewed for one use`,
    badge: 'bg-blue-50 text-[#0066CC] border-blue-200',
    border: 'border-blue-200/70',
  },
}

const claimNatureLabel: Record<EvidenceClaimNature, string> = {
  measured: 'Measured',
  sponsor_reported: 'Reported by the company or organisation running the study',
  regulatory_finding: 'Finding from a medicine regulator',
  rnawiki_judgement: 'Human reviewer interpretation',
  mixed: 'Built from more than one kind of evidence',
  unknown: 'Source type not recorded',
}

const reviewerExpertiseLabel: Record<VerdictReviewerExpertiseTag, string> = {
  CLINICAL_PHARMACOLOGY: 'How medicines work in people (clinical pharmacology)',
  THERAPEUTIC_AREA_MEDICINE: 'Medicine in this disease area',
  BIOSTATISTICS: 'Medical statistics',
  TOXICOLOGY: 'Medicine safety and toxicology',
  PHARMACOKINETICS: 'How the body handles medicines',
  REGULATORY_SCIENCE: 'Medicine regulation',
  CLINICAL_DEVELOPMENT: 'Clinical trial development',
}

const mechanismEvidenceBasisLabel: Record<MechanismEvidenceBasis, string> = {
  MEASURED_IN_PEOPLE: 'This step was measured in people',
  MEASURED_OUTSIDE_PEOPLE: 'This step was measured only in laboratory or non-human work',
  PREDICTED: 'This step is still a prediction',
  UNKNOWN: 'It is not yet known whether this step happens',
}

const timelineEventTypeLabel: Record<ProgrammeTimelineEventType, string> = {
  PROGRAMME_MILESTONE: 'Major research milestone',
  FIRST_HUMAN_ADMINISTRATION: 'First given to a person',
  PHASE_PROGRESSION: 'Moved to a new testing stage',
  IMPORTANT_RESULT: 'Important result',
  SAFETY_SIGNAL: 'Important safety finding',
  REGULATORY_ACTION: 'Decision by a medicine regulator',
  PAUSE_OR_TERMINATION: 'Research paused or stopped',
  LICENSING_OR_ACQUISITION: 'Licensing or ownership change',
}

const timelineDateBasisLabel: Record<ProgrammeTimelineDateBasis, string> = {
  ACTUAL: 'Date occurred',
  PLANNED: 'Planned date',
  REPORTED_UNCLEAR: 'Date reported; timing unclear',
}

const freshnessStyle: Record<DossierFreshnessState, string> = {
  current: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  stale: 'bg-rose-50 text-rose-800 border-rose-200',
  review_required: 'bg-amber-50 text-amber-800 border-amber-200',
  unknown: 'bg-[#F5F5F7] text-[#6E6E73] border-black/[0.08]',
}

const sourceFreshnessLabel: Record<DossierFreshnessState, string> = {
  current: 'Checked',
  stale: 'May be out of date',
  review_required: 'Source change under review',
  unknown: 'Check not completed',
}

function Eyebrow({
  children,
  tone = 'muted',
}: {
  children: React.ReactNode
  tone?: 'muted' | 'blue' | 'amber' | 'rose' | 'emerald' | 'violet'
}) {
  const color =
    tone === 'blue'
      ? 'text-[#0066CC]'
      : tone === 'amber'
        ? 'text-amber-700'
        : tone === 'rose'
          ? 'text-rose-700'
          : tone === 'emerald'
            ? 'text-emerald-700'
            : tone === 'violet'
              ? 'text-violet-700'
              : 'text-[#6E6E73]'
  return <p className={`text-[11px] font-bold uppercase tracking-[0.13em] ${color}`}>{children}</p>
}

/**
 * One shared heading scale for the top-level dossier sections. Each section keeps its own eyebrow
 * colour and wording so a reader scrolling quickly can tell the sections apart at a glance.
 */
function SectionHeader({
  eyebrow,
  tone = 'blue',
  headingId,
  title,
  children,
  meta,
}: {
  eyebrow: React.ReactNode
  tone?: 'muted' | 'blue' | 'amber' | 'rose' | 'emerald' | 'violet'
  headingId: string
  title: React.ReactNode
  children?: React.ReactNode
  meta?: React.ReactNode
}) {
  return (
    <header className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="max-w-3xl space-y-1.5">
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <h3
          id={headingId}
          className="text-2xl font-[650] leading-tight tracking-[-0.02em] text-[#1D1D1F] sm:text-[32px]"
        >
          {title}
        </h3>
        {children && <p className="text-base leading-7 text-[#515154]">{children}</p>}
      </div>
      {meta && <div className="shrink-0 pb-1">{meta}</div>}
    </header>
  )
}

function StatusBadge({ state }: { state: EvidenceDisplayState }) {
  const style = evidenceStyle[state]
  const icon =
    state === 'measured' ? (
      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
    ) : state === 'failed' ? (
      <CircleX className="h-3 w-3" aria-hidden="true" />
    ) : state === 'conclusion_shift' ? (
      <GitCompareArrows className="h-3 w-3" aria-hidden="true" />
    ) : state === 'inferred' ? (
      <CircleAlert className="h-3 w-3" aria-hidden="true" />
    ) : (
      <CircleHelp className="h-3 w-3" aria-hidden="true" />
    )
  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-5 ${style.badge}`}
    >
      {icon}
      {style.label}
    </span>
  )
}

function EvidenceNodeStatusBadge({ state }: { state: EvidenceNodeState }) {
  const style = evidenceNodeStyle[state]
  const icon =
    state === 'confirmed' ? (
      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
    ) : state === 'contradicted' ? (
      <CircleX className="h-3 w-3" aria-hidden="true" />
    ) : state === 'not_measured' ? (
      <CircleMinus className="h-3 w-3" aria-hidden="true" />
    ) : state === 'mixed' ? (
      <GitCompareArrows className="h-3 w-3" aria-hidden="true" />
    ) : (
      <CircleHelp className="h-3 w-3" aria-hidden="true" />
    )

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-5 ${style.badge}`}
    >
      {icon}
      {style.label}
    </span>
  )
}

function ClaimNatureBadge({ nature }: { nature: EvidenceClaimNature }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-md border border-black/[0.08] bg-[#F5F5F7] px-2 py-1 text-xs font-semibold leading-5 text-[#6E6E73]">
      Evidence type: {claimNatureLabel[nature]}
    </span>
  )
}

function claimRelationshipLabel(relationship: ProgrammeSourceClaimBindingView['relationship']) {
  if (relationship === 'SUPPORTS') return 'Supports'
  if (relationship === 'QUALIFIES') return 'Qualifies'
  if (relationship === 'CONTEXT') return 'Adds context'
  return 'Contradicts'
}

function SourceLinks({
  contextItems = [],
  ids,
  sources,
  claimBindings,
  testId,
  numbered = false,
  compact = false,
  heading,
  ariaLabel = 'Sources linked to this statement',
  idPrefix,
}: {
  contextItems?: readonly PublicMedicineContextItem[]
  ids: string[]
  sources: Map<string, EvidenceSourceView>
  claimBindings?: ProgrammeSourceClaimBindingView[]
  testId?: string
  numbered?: boolean
  compact?: boolean
  heading?: string
  ariaLabel?: string
  idPrefix?: string
}) {
  const linked = ids.flatMap((id) => {
    const source = sources.get(id)
    return source ? [source] : []
  })
  if (linked.length === 0) return null

  if (compact) {
    return (
      <div
        className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5 border-t border-black/[0.07] pt-2 text-xs"
        aria-label={ariaLabel}
        data-testid={testId}
      >
        <span className="font-semibold text-[#6E6E73]">Sources</span>
        <ol className="flex flex-wrap gap-1.5">
          {linked.map((source, index) => {
            const bindings =
              claimBindings?.filter((binding) => binding.sourceId === source.id) ?? []
            const accessibleDetail = bindings
              .map((binding) => {
                return `${claimRelationshipLabel(binding.relationship)}: ${binding.statement}`
              })
              .join('. ')
            const citationLabel = `Source ${index + 1}: ${source.label}${accessibleDetail ? `. ${accessibleDetail}` : ''}`
            const citation = `[${index + 1}]`

            return (
              <li
                key={source.id}
                id={idPrefix ? `${idPrefix}-source-${source.id}` : undefined}
                data-source-id={source.id}
                data-claim-ids={bindings.map((binding) => binding.claimId).join(' ')}
                data-source-relationships={bindings
                  .map((binding) => binding.relationship)
                  .join(' ')}
              >
                {source.href ? (
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={citationLabel}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-black/[0.08] bg-white px-2 font-bold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
                  >
                    {citation}
                  </a>
                ) : (
                  <span
                    aria-label={citationLabel}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-black/[0.08] bg-white px-2 font-bold text-[#6E6E73]"
                  >
                    {citation}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  const items = linked.map((source) => (
    <li
      key={source.id}
      id={idPrefix ? `${idPrefix}-source-${source.id}` : undefined}
      className="min-w-0 max-w-full"
      data-source-id={source.id}
    >
      {source.href ? (
        <a
          href={source.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 max-w-full items-center gap-1 text-sm font-semibold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
        >
          <AnnotatedMedicineText
            as="span"
            className="min-w-0 break-words"
            contexts={medicineTextContextMatches(source.label, contextItems)}
            text={source.label}
          />
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <span className="break-all text-sm leading-6 text-[#6E6E73]">
          {source.canonicalLocator ?? source.label}
        </span>
      )}
      {source.identifier && source.identifier !== source.label && (
        <p className="mt-0.5 break-all font-mono text-xs leading-5 text-[#6E6E73]">
          {source.identifier}
        </p>
      )}
      {claimBindings
        ?.filter((binding) => binding.sourceId === source.id)
        .map((binding) => {
          const statementContexts = medicineTextContextMatches(binding.statement, contextItems)
          return (
            <p
              key={`${binding.claimId}:${binding.relationship}`}
              className="mt-1 max-w-xl break-words text-sm leading-6 text-[#6E6E73]"
              data-testid="source-claim-binding"
              data-claim-id={binding.claimId}
              data-source-relationship={binding.relationship}
            >
              {claimRelationshipLabel(binding.relationship)}:{' '}
              {statementContexts.length > 0 ? (
                <AnnotatedMedicineText
                  as="span"
                  contexts={statementContexts}
                  text={binding.statement}
                />
              ) : (
                binding.statement
              )}
            </p>
          )
        })}
    </li>
  ))

  if (numbered) {
    return (
      <div className="mt-3 border-t border-black/[0.07] pt-3" data-testid={testId}>
        {heading && <h3 className="text-xs font-bold text-[#424245]">{heading}</h3>}
        <ol className="mt-1 list-decimal space-y-2 pl-5" aria-label={ariaLabel}>
          {items}
        </ol>
      </div>
    )
  }

  return (
    <ul
      className="mt-3 flex min-w-0 flex-wrap gap-x-3 gap-y-1"
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {items}
    </ul>
  )
}

function LegacyEvidenceTechnicalDetails({
  contextItems,
  detail,
}: {
  contextItems: readonly PublicMedicineContextItem[]
  detail: EvidenceNodeTechnicalDetailView
}) {
  const fields = [
    { annotate: true, label: 'Full technical wording', value: detail.technicalDetails },
    {
      annotate: true,
      label: 'Measurement named in the source notes',
      value: detail.measuredMetric,
    },
    { annotate: true, label: 'Assumption named in the source notes', value: detail.inferredClaim },
    { annotate: false, label: 'Evidence source as stored', value: detail.evidenceSource },
    { annotate: false, label: 'Stored audit flag', value: detail.auditFlag },
  ].filter((field): field is { annotate: boolean; label: string; value: string } =>
    Boolean(field.value),
  )

  if (fields.length === 0) return null

  return (
    <details className="mt-2 border-t border-black/[0.07] pt-1">
      <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
        Technical evidence details
      </summary>
      <div className="pb-1">
        <p className="text-sm leading-6 text-[#6E6E73]">
          These fields come from research notes collected across the medicine as a whole. They have
          not been checked against one specific question or linked to its exact sources.
        </p>
        <dl
          className="mt-3 space-y-3 rounded-xl bg-[#F5F5F7] p-4 text-sm leading-6"
          data-testid="legacy-technical-evidence"
        >
          {fields.map(({ annotate, label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="font-semibold text-[#1D1D1F]">{label}</dt>
              <dd
                className={`mt-0.5 [overflow-wrap:anywhere] text-[#424245] ${
                  label === 'Stored audit flag' ? 'font-mono text-xs' : ''
                }`}
              >
                {annotate ? (
                  <AnnotatedMedicineText
                    as="span"
                    contexts={medicineTextContextMatches(value, contextItems)}
                    text={value}
                  />
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  )
}

function EmptyEvidence({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/[0.12] bg-white/60 p-5 text-sm leading-6 text-[#6E6E73]">
      {children}
    </div>
  )
}

function readableStoredLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase())
}

function reviewerDecisionSentence({
  name,
  decision,
  independent,
  reviewedAt,
}: NonNullable<MedicineDossierViewModel['conclusion']>['reviewers'][number]): string {
  const normalizedDecision = normalizedStoredCode(decision)
  const action =
    normalizedDecision === 'APPROVE' || normalizedDecision === 'APPROVED'
      ? 'approved this conclusion'
      : normalizedDecision === 'REJECT' || normalizedDecision === 'REJECTED'
        ? 'did not approve this conclusion'
        : normalizedDecision === 'CHANGES_REQUESTED' || normalizedDecision === 'REQUEST_CHANGES'
          ? 'requested changes to this conclusion'
          : `recorded a ${readableStoredLabel(decision).toLowerCase()} decision on this conclusion`
  return `Saved reviewer name: ${name}. This reviewer ${action}${independent ? ' independently' : ''} on ${formatPublicDate(reviewedAt)}.`
}

const publicDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

function formatPublicDate(value: string): string {
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) ? value : publicDateFormatter.format(parsed)
}

function normalizedStoredCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')
}

function endpointHierarchyLabel(value: string): string {
  return endpointHierarchyContextItem(value).plainMeaning
}

function studyEndpointLabel(endpointHierarchy?: string): string {
  if (!endpointHierarchy) return 'Result measured'
  const normalized = normalizedStoredCode(endpointHierarchy)
  const isPrimary = normalized === 'PRIMARY' || normalized === 'PRIMARY_ENDPOINT'
  return isPrimary ? 'Main result the study set out to measure' : 'Result measured'
}

function outcomeTypeContext(value: string): string {
  return outcomeTypeContextItem(value).plainMeaning
}

function directionLabel(direction: NonNullable<EvidenceClaimView['direction']>): string {
  const labels: Record<NonNullable<EvidenceClaimView['direction']>, string> = {
    INCREASE: 'Increased',
    DECREASE: 'Decreased',
    NO_CHANGE: 'No clear change',
    MIXED: 'Mixed directions',
    NOT_APPLICABLE: 'Not applicable',
    UNKNOWN: 'Not reported',
  }
  return labels[direction]
}

function participantCountTypeLabel(type: StudyView['enrolmentType']): string {
  if (type === 'ACTUAL') return 'Actual count'
  if (type === 'ESTIMATED') return 'Estimated count'
  return 'Count type not available'
}

function publicStudyNameContextItem(name: string): PublicMedicineContextItem {
  return {
    key: `study-name:${name.toLocaleLowerCase('en').replace(/[^a-z0-9]+/g, '-')}`,
    plainMeaning: 'The name researchers gave this study',
    technicalTerm: name,
    definition:
      'A study name works like a book title: it helps people identify the study, but it does not describe what the study found.',
  }
}

function StudyCard({
  contextItems,
  study,
  sources,
}: {
  contextItems: readonly PublicMedicineContextItem[]
  study: StudyView
  sources: Map<string, EvidenceSourceView>
}) {
  const hasResult = Boolean(study.result)
  const isPValueDetail = Boolean(
    study.technicalResult && /(?:\bp[- ]?value\b|\bp\s*[<=>])/iu.test(study.technicalResult),
  )
  const state: EvidenceDisplayState = study.state === 'measured' ? 'measured' : study.state
  const legacyNamedRegistry = study.id.match(/^(.+?)\s*\((NCT\d{8})\)\s*$/iu)
  const nctNumber = study.id.match(/\bNCT\d{8}\b/iu)?.[0]
  const displayTitle = study.title ?? legacyNamedRegistry?.[1]?.trim() ?? 'Research study'
  const studyNameContext = publicStudyNameContextItem(displayTitle)
  const explainStudyName = /\b(?:ORION|VICTORION)[-\s]?\d+\b/iu.test(displayTitle)
  const phaseMeaning = study.phase
    ? /phase\s*1\b/iu.test(study.phase)
      ? `${study.phase} — early-stage human study`
      : /phase\s*2\b/iu.test(study.phase)
        ? `${study.phase} — mid-stage human study`
        : /phase\s*3\b/iu.test(study.phase)
          ? `${study.phase} — later-stage human study`
          : /phase\s*4\b/iu.test(study.phase)
            ? `${study.phase} — study after approval`
            : study.phase
    : undefined

  const resultStateBadge = hasResult ? (
    state === 'measured' ? (
      <span className="inline-flex max-w-full rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold leading-5 text-emerald-800">
        Result available
      </span>
    ) : (
      <StatusBadge state={state} />
    )
  ) : (
    <span className="inline-flex max-w-full rounded-full border border-black/[0.08] bg-[#F5F5F7] px-2.5 py-1 text-xs font-semibold leading-5 text-[#6E6E73]">
      No result on this page
    </span>
  )

  return (
    <details
      className="group/study min-w-0 overflow-hidden rounded-2xl border border-black/[0.09] bg-white"
      data-testid="study-card"
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071E3] sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block break-words text-base font-bold leading-6 text-[#1D1D1F]">
            <AnnotatedMedicineText
              as="span"
              text={displayTitle}
              contexts={
                explainStudyName ? medicineTextContextMatches(displayTitle, [studyNameContext]) : []
              }
            />
          </span>
          <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-5 text-[#515154]">
            {phaseMeaning && <span>{phaseMeaning}</span>}
            {study.sampleSize && (
              <span>{study.sampleSize.toLocaleString('en-US')} participants</span>
            )}
          </span>
          {study.result && (
            <span className="mt-2 block break-words text-sm leading-6 text-[#424245]">
              {study.result}
            </span>
          )}
          <span className="mt-2 block">{resultStateBadge}</span>
        </span>
        <span
          className="mt-1 shrink-0 text-xl font-normal text-[#0066CC] transition-transform group-open/study:rotate-45 motion-reduce:transition-none"
          aria-hidden="true"
        >
          +
        </span>
      </summary>

      <div className="min-w-0 border-t border-black/[0.07] px-4 pb-5 pt-4 sm:px-5">
        <dl
          className="grid min-w-0 gap-x-5 gap-y-3 text-sm leading-6 text-[#515154] sm:grid-cols-2"
          data-testid="study-design-metadata"
        >
          <div className="min-w-0 sm:col-span-2">
            <dt>{nctNumber ? 'ClinicalTrials.gov study number' : 'Study reference'}</dt>
            <dd className="mt-0.5 min-w-0 break-words font-mono font-semibold text-[#424245]">
              <AnnotatedMedicineText
                as="span"
                text={nctNumber ?? study.id}
                contexts={medicineTextContextMatches(nctNumber ?? study.id, [
                  COMMON_PUBLIC_MEDICINE_CONTEXT.studyIdentifier,
                  studyNameContext,
                  ...contextItems,
                ])}
              />
            </dd>
          </div>
          {study.status && (
            <div className="min-w-0">
              <dt>Study status</dt>
              <dd className="mt-0.5 break-words font-semibold text-[#424245]">
                <AnnotatedMedicineText
                  as="span"
                  contexts={medicineTextContextMatches(study.status, contextItems)}
                  text={study.status}
                />
              </dd>
            </div>
          )}
          {study.phase && (
            <div className="min-w-0">
              <dt>Testing stage</dt>
              <dd className="mt-0.5 break-words font-semibold text-[#424245]">
                <AnnotatedMedicineText
                  as="span"
                  contexts={medicineTextContextMatches(phaseMeaning ?? study.phase, contextItems)}
                  text={phaseMeaning ?? study.phase}
                />
              </dd>
            </div>
          )}
          {study.studyType && (
            <div className="min-w-0 sm:col-span-2">
              <dt>How the study was run</dt>
              <dd className="mt-0.5 break-words font-semibold text-[#424245]">
                <AnnotatedMedicineText
                  as="span"
                  contexts={medicineTextContextMatches(study.studyType, contextItems)}
                  text={study.studyType}
                />
              </dd>
            </div>
          )}
        </dl>

        {study.result && (
          <div className="mt-4 rounded-2xl border border-[#0071E3]/15 bg-blue-50 p-4 sm:p-5">
            <p className="text-xs font-bold text-[#0066CC]">What researchers found</p>
            <AnnotatedMedicineText
              className="mt-1 break-words text-base font-semibold leading-6 text-[#1D1D1F]"
              text={study.result}
              contexts={medicineTextContextMatches(study.result, contextItems)}
            />
          </div>
        )}

        {(study.sampleSize || study.endpoint || (hasResult && study.replication)) && (
          <dl className="mt-4 space-y-3 text-sm leading-6">
            {study.endpoint && (
              <div>
                <dt className="text-[#6E6E73]">{studyEndpointLabel(study.endpointHierarchy)}</dt>
                <dd className="mt-0.5 [overflow-wrap:anywhere] font-semibold text-[#424245]">
                  <AnnotatedMedicineText
                    as="span"
                    text={study.endpoint}
                    contexts={medicineTextContextMatches(study.endpoint, contextItems)}
                  />
                </dd>
              </div>
            )}
            {study.sampleSize && (
              <div>
                <dt className="text-[#6E6E73]">
                  Participants ({participantCountTypeLabel(study.enrolmentType).toLowerCase()})
                </dt>
                <dd className="mt-0.5 font-semibold text-[#1D1D1F]">
                  {study.sampleSize.toLocaleString('en-US')}
                </dd>
              </div>
            )}
            {hasResult && study.replication && (
              <div>
                <dt className="text-[#6E6E73]">Did another study find something similar?</dt>
                <dd
                  className="mt-0.5 [overflow-wrap:anywhere] text-[#424245]"
                  data-testid="study-replication"
                >
                  <AnnotatedMedicineText
                    as="span"
                    contexts={medicineTextContextMatches(study.replication, contextItems)}
                    text={study.replication}
                  />
                </dd>
              </div>
            )}
          </dl>
        )}

        {study.technicalResult && (
          <details className="mt-3 border-t border-black/[0.07] pt-2">
            <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
              {isPValueDetail && !hasResult
                ? 'Statistical test only (size of the change not available)'
                : hasResult
                  ? 'Statistical detail'
                  : 'Result availability detail'}
            </summary>
            <AnnotatedMedicineText
              className="[overflow-wrap:anywhere] font-mono text-xs leading-5 text-[#424245]"
              contexts={medicineTextContextMatches(study.technicalResult, contextItems)}
              text={study.technicalResult}
              testId="study-technical-result"
            />
            {isPValueDetail && (
              <p className="mt-2 text-sm leading-6 text-[#6E6E73]">
                This number describes how compatible the result is with no difference; it is not the
                size or importance of the effect.
              </p>
            )}
          </details>
        )}

        {study.sourceIds && study.sourceIds.length > 0 && (
          <SourceLinks contextItems={contextItems} ids={study.sourceIds} sources={sources} />
        )}

        {study.interpretability && study.interpretability.length > 0 && (
          <div
            className="mt-5 border-t border-black/[0.07] pt-4"
            data-testid="study-interpretability"
          >
            <ul className="space-y-4">
              {study.interpretability.map((assessment) => {
                const assessmentLabel =
                  assessment.state === 'yes'
                    ? 'Yes'
                    : assessment.state === 'no'
                      ? 'No'
                      : assessment.state === 'unclear'
                        ? 'Unclear'
                        : 'Not reported'
                const assessmentStyle =
                  assessment.state === 'yes'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : assessment.state === 'no'
                      ? 'border-rose-200 bg-rose-50 text-rose-800'
                      : assessment.state === 'unclear'
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : 'border-black/[0.1] bg-[#F5F5F7] text-[#6E6E73]'
                return (
                  <li key={assessment.id} className="min-w-0">
                    <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:justify-between">
                      <AnnotatedMedicineText
                        className="[overflow-wrap:anywhere] text-sm font-semibold leading-6 text-[#1D1D1F]"
                        contexts={medicineTextContextMatches(assessment.question, contextItems)}
                        text={assessment.question}
                      />
                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-xs font-semibold leading-5 ${assessmentStyle}`}
                      >
                        {assessmentLabel}
                      </span>
                    </div>
                    {assessment.explanation && (
                      <AnnotatedMedicineText
                        className="mt-1 [overflow-wrap:anywhere] text-sm leading-6 text-[#6E6E73]"
                        contexts={medicineTextContextMatches(assessment.explanation, contextItems)}
                        text={assessment.explanation}
                      />
                    )}
                    <SourceLinks
                      contextItems={contextItems}
                      ids={assessment.sourceIds}
                      sources={sources}
                      claimBindings={assessment.sourceClaimBindings}
                    />
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </details>
  )
}

function KeyOutcomesSection({
  contextItems,
  dossier,
  sources,
}: {
  contextItems: readonly PublicMedicineContextItem[]
  dossier: MedicineDossierViewModel
  sources: Map<string, EvidenceSourceView>
}) {
  if (dossier.keyOutcomes.length === 0) return null
  const isLegacy = dossier.bindingState === 'legacy_record'

  return (
    <section
      id="key-outcomes"
      aria-labelledby="outcomes-heading"
      className="scroll-mt-24 space-y-4"
    >
      <div className="space-y-1">
        <Eyebrow tone={isLegacy ? 'amber' : 'blue'}>
          {isLegacy ? 'Findings across the research' : 'The results that matter here'}
        </Eyebrow>
        <h3 id="outcomes-heading" className="text-xl font-bold text-[#1D1D1F]">
          {isLegacy
            ? GENERAL_RESEARCH_SUMMARY_COPY.heading
            : 'What was measured and what is still uncertain'}
        </h3>
        <p className="text-sm leading-6 text-[#6E6E73]">
          {isLegacy
            ? GENERAL_RESEARCH_SUMMARY_COPY.boundary
            : 'Measured means the study recorded it directly. Inferred means the sources point to it, but the study did not measure it directly. Unknown means the available sources do not answer it yet.'}
        </p>
      </div>
      <ul className="divide-y divide-black/[0.07] overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
        {dossier.keyOutcomes.map((outcome) => {
          const exactResult = outcome.numericValue
            ? `${outcome.numericValue}${outcome.numericUnit ? ` ${outcome.numericUnit}` : ''}`
            : undefined
          const details = [
            ['What was measured', outcome.endpoint],
            [
              'Was this a main or additional result?',
              outcome.endpointHierarchy
                ? endpointHierarchyLabel(outcome.endpointHierarchy)
                : undefined,
            ],
            ['Medicine or treatment group', outcome.intervention],
            ['Comparison group', outcome.comparator],
            ['Exact result', exactResult],
            ['How uncertain is this estimate?', outcome.uncertaintyInterval],
            [
              'Direction of change',
              outcome.direction ? directionLabel(outcome.direction) : undefined,
            ],
            ['When measured', outcome.timepoint],
            [
              'What kind of result is this?',
              outcome.outcomeType ? outcomeTypeContext(outcome.outcomeType) : undefined,
            ],
          ].filter((entry): entry is [string, string] => Boolean(entry[1]))

          return (
            <li key={outcome.id} className="min-w-0 space-y-3 p-4 sm:p-5">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-5 text-[#0066CC]">
                    {isLegacy
                      ? (outcome.legacyGroupLabel ?? GENERAL_RESEARCH_SUMMARY_COPY.findingLabel)
                      : 'Reported result'}
                  </p>
                  <AnnotatedMedicineText
                    className="mt-1 [overflow-wrap:anywhere] text-sm leading-6 text-[#424245]"
                    contexts={medicineTextContextMatches(outcome.label, contextItems)}
                    text={outcome.label}
                  />
                </div>
                {!isLegacy && (
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {outcome.claimNature && <ClaimNatureBadge nature={outcome.claimNature} />}
                    <StatusBadge state={outcome.state} />
                  </div>
                )}
              </div>
              {details.length > 0 && (
                <dl className="grid min-w-0 gap-3 text-sm leading-6 text-[#6E6E73] lg:grid-cols-2">
                  {details.map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <dt>{label}</dt>
                      <dd className="[overflow-wrap:anywhere] font-semibold text-[#424245]">
                        <AnnotatedMedicineText
                          as="span"
                          contexts={medicineTextContextMatches(value, [
                            ...(label === 'When measured'
                              ? publicMedicineStudyDayContextItems(value)
                              : []),
                            ...contextItems,
                          ])}
                          text={value}
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              <SourceLinks
                contextItems={contextItems}
                ids={outcome.sourceIds}
                sources={sources}
                claimBindings={outcome.sourceClaimBindings}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function DevelopmentTimeline({
  contextItems,
  events,
  sources,
}: {
  contextItems: readonly PublicMedicineContextItem[]
  events: readonly ProgrammeTimelineEventView[]
  sources: Map<string, EvidenceSourceView>
}) {
  if (events.length === 0) return null

  return (
    <section
      id="development-timeline"
      data-testid="programme-decision-timeline"
      aria-labelledby="development-timeline-heading"
      className="scroll-mt-24 space-y-4"
    >
      <div className="space-y-1">
        <Eyebrow tone="blue">What changed over time</Eyebrow>
        <h3 id="development-timeline-heading" className="text-xl font-bold text-[#1D1D1F]">
          Events that changed what happened next
        </h3>
        <p className="text-sm leading-6 text-[#6E6E73]">
          We show events that changed the answer or what researchers did next. A page update is not
          a study result, and a future date is a plan—not proof that it happened.
        </p>
      </div>
      <ol className="relative ml-2 space-y-5 border-l border-black/[0.12] pl-5">
        {events.map((entry) => (
          <li
            key={entry.id}
            className="relative min-w-0"
            data-testid="programme-timeline-event"
            data-provenance={entry.provenance}
          >
            <span
              className="absolute -left-[1.56rem] top-1.5 h-2 w-2 rounded-full bg-[#0071E3] ring-4 ring-[#F5F5F7]"
              aria-hidden="true"
            />
            <time dateTime={entry.date} className="text-xs font-semibold text-[#0066CC]">
              {formatPublicDate(entry.date)}
            </time>
            <p className="mt-1 [overflow-wrap:anywhere] text-sm font-semibold leading-6 text-[#1D1D1F]">
              <AnnotatedMedicineText
                as="span"
                contexts={medicineTextContextMatches(entry.title, contextItems)}
                text={entry.title}
              />
            </p>
            <AnnotatedMedicineText
              className="mt-0.5 [overflow-wrap:anywhere] text-sm leading-6 text-[#6E6E73]"
              contexts={medicineTextContextMatches(entry.description, contextItems)}
              text={entry.description}
            />
            {entry.provenance === 'source' ? (
              <>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#6E6E73]">
                  {timelineEventTypeLabel[entry.eventType as ProgrammeTimelineEventType]}
                  {entry.dateBasis ? ` · ${timelineDateBasisLabel[entry.dateBasis]}` : ''}
                </p>
                {entry.technicalDetail && (
                  <details className="mt-1">
                    <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                      Technical detail
                    </summary>
                    <AnnotatedMedicineText
                      className="[overflow-wrap:anywhere] text-sm leading-6 text-[#6E6E73]"
                      contexts={medicineTextContextMatches(entry.technicalDetail, contextItems)}
                      text={entry.technicalDetail}
                      testId="timeline-technical-detail"
                    />
                  </details>
                )}
                <SourceLinks
                  contextItems={contextItems}
                  ids={entry.sourceIds}
                  sources={sources}
                  claimBindings={entry.sourceClaimBindings}
                  testId="timeline-event-source-links"
                />
              </>
            ) : (
              <p className="mt-1 text-xs font-semibold leading-5 text-[#6E6E73]">
                Page update · not a study result
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function ConclusionReviewDetails({
  conclusion,
}: {
  conclusion: NonNullable<MedicineDossierViewModel['conclusion']>
}) {
  return (
    <section
      aria-labelledby="who-reviewed-heading"
      className="rounded-2xl border border-black/[0.08] bg-white p-5"
      data-testid="conclusion-review-details"
    >
      <h4 id="who-reviewed-heading" className="text-lg font-bold text-[#1D1D1F]">
        Who reviewed this answer?
      </h4>
      <p className="mt-2 text-base leading-7 text-[#515154]">
        {conclusion.authorHandle ? (
          <>
            Written by{' '}
            <Link
              href={`/u/${encodeURIComponent(conclusion.authorHandle)}`}
              className="font-semibold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
            >
              @{conclusion.authorHandle}
            </Link>
            {conclusion.authorName && (
              <span className="text-sm text-[#6E6E73]">
                {' '}
                · saved author name: {conclusion.authorName}
              </span>
            )}
          </>
        ) : (
          <>
            Saved author name:{' '}
            <span className="font-semibold text-[#1D1D1F]">{conclusion.authorName}</span>
          </>
        )}
      </p>
      {conclusion.reviewers.length > 0 ? (
        <ul className="mt-3 divide-y divide-black/[0.07]" aria-label="Conclusion review records">
          {conclusion.reviewers.map((reviewer) => (
            <li key={reviewer.id} className="min-w-0 py-3 first:pt-0 last:pb-0">
              <p className="break-words text-base leading-7 text-[#424245]">
                {reviewerDecisionSentence(reviewer)}
              </p>
              {reviewer.expertiseTags.length > 0 && (
                <p className="mt-1 break-words text-sm leading-6 text-[#515154]">
                  <span className="font-semibold text-[#424245]">
                    RNAWiki review areas recorded for this decision:{' '}
                  </span>
                  {reviewer.expertiseTags.map((tag) => reviewerExpertiseLabel[tag]).join(' · ')}
                </p>
              )}
              {reviewer.orcid && (
                <a
                  href={`https://orcid.org/${reviewer.orcid}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open the ORCID supplied for ${reviewer.name} in a new tab`}
                  className="mt-1 inline-flex min-h-11 max-w-full items-center gap-1 break-all text-sm font-semibold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
                >
                  ORCID supplied by this account: {reviewer.orcid}
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-base leading-7 text-[#515154]">
          No public reviewer record is available on this page.
        </p>
      )}
      {(conclusion.conflictsOfInterest ||
        conclusion.reviewers.some((reviewer) => reviewer.conflictsOfInterest)) && (
        <details className="mt-3 border-t border-black/[0.07] pt-2">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
            Conflicts of interest
          </summary>
          <p className="mb-1 text-sm leading-6 text-[#515154]">
            Financial, work, or personal ties that could affect someone’s judgment.
          </p>
          {conclusion.conflictsOfInterest && (
            <p className="break-words text-sm leading-6 text-[#424245]">
              Author: {conclusion.conflictsOfInterest}
            </p>
          )}
          {conclusion.reviewers
            .filter((reviewer) => reviewer.conflictsOfInterest)
            .map((reviewer) => (
              <p key={reviewer.id} className="break-words text-sm leading-6 text-[#424245]">
                {reviewer.name}: {reviewer.conflictsOfInterest}
              </p>
            ))}
        </details>
      )}
    </section>
  )
}

export function MedicineDossierV2({ dossier }: MedicineDossierV2Props) {
  const isPublishedProgramme = dossier.bindingState === 'published_programme'
  const isUnpublishedProgramme = dossier.bindingState === 'programme_unpublished'
  const sourceById = new Map(dossier.sources.map((source) => [source.id, source]))
  const findingEvidenceCandidate =
    dossier.readerSummary.whatStudiesFoundSourceFieldPath === 'summary.bestSupportedFinding'
      ? dossier.summaryEvidence?.['summary.bestSupportedFinding']
      : undefined
  const limitationEvidenceCandidate =
    dossier.readerSummary.biggestLimitSourceFieldPath === 'summary.mainLimitation'
      ? dossier.summaryEvidence?.['summary.mainLimitation']
      : undefined
  const mechanismEvidenceCandidate = dossier.summaryEvidence?.['summary.plainMechanism']
  const findingEvidence =
    findingEvidenceCandidate && findingEvidenceCandidate.sourceClaimBindings.length > 0
      ? findingEvidenceCandidate
      : undefined
  const limitationEvidence =
    limitationEvidenceCandidate && limitationEvidenceCandidate.sourceClaimBindings.length > 0
      ? limitationEvidenceCandidate
      : undefined
  const mechanismEvidence =
    mechanismEvidenceCandidate && mechanismEvidenceCandidate.sourceClaimBindings.length > 0
      ? mechanismEvidenceCandidate
      : undefined
  const mechanismPreviewAllowed = hasResolvedProgrammeMechanismSupport(dossier)
  const mechanismEntries = [
    ['Where in the body?', dossier.mechanismSummary.where],
    ['What does it tell the body to do?', dossier.mechanismSummary.change],
    ['What did researchers actually measure?', dossier.mechanismSummary.observed],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))
  // The contextual hover/tap experiment has been retired. Keep this compatibility prop empty
  // while the detailed evidence components are progressively reduced to ordinary static text.
  const advancedContextItems: readonly PublicMedicineContextItem[] = []
  const exactWordingContextMatches: ReturnType<typeof medicineTextContextMatches> = []
  const hasReadyProgrammeFailure = dossier.dynamicModules?.programmeFailure.status === 'ready'
  const hasReadySafety = dossier.dynamicModules?.safety.status === 'ready'
  const hasReadyPharmacokinetics = dossier.dynamicModules?.pharmacokinetics.status === 'ready'
  const hasEvidenceSupport = Boolean(
    dossier.readerSummary.exactText ||
    findingEvidence ||
    limitationEvidence ||
    dossier.conclusion ||
    dossier.evidenceNodes.length > 0 ||
    hasReadyProgrammeFailure,
  )
  const hasAdvancedEvidence =
    hasEvidenceSupport ||
    dossier.studies.length > 0 ||
    dossier.keyOutcomes.length > 0 ||
    dossier.mechanismSteps.length > 0 ||
    mechanismEntries.length > 0 ||
    hasReadySafety ||
    hasReadyPharmacokinetics ||
    hasReadyProgrammeFailure ||
    dossier.sources.length > 0 ||
    Boolean(dossier.conclusion)
  const canonicalEvidenceChain =
    dossier.bindingState === 'published_programme' && dossier.evidenceNodes.length === 5
  const firstEvidenceGap = canonicalEvidenceChain
    ? dossier.evidenceNodes.find((node) => node.state !== 'confirmed')
    : undefined
  const sourcedTimelineEvents = dossier.timelineEvents.filter(
    (event) =>
      event.provenance === 'source' &&
      event.sourceIds.length > 0 &&
      event.sourceIds.some((sourceId) => sourceById.has(sourceId)),
  )
  // RNAWiki publication and revision dates add useful context only when there is at least one
  // source-authored programme event to anchor the timeline.
  const recordedTimeline = (
    sourcedTimelineEvents.length > 0
      ? dossier.timelineEvents.filter(
          (event) =>
            event.provenance === 'rnawiki' ||
            sourcedTimelineEvents.some(({ id }) => id === event.id),
        )
      : []
  ).sort((left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id))
  const studiesWithResults = dossier.studies.filter((study) => Boolean(study.result))
  const studiesWithoutResults = dossier.studies.filter((study) => !study.result)
  const studiesWithReportedParticipants = studiesWithResults.filter(
    (study) => typeof study.sampleSize === 'number' && study.sampleSize > 0,
  )
  const reportedParticipantTotal = studiesWithReportedParticipants.reduce(
    (total, study) => total + (study.sampleSize ?? 0),
    0,
  )
  const participantCountBreakdown = (['ACTUAL', 'ESTIMATED', 'UNKNOWN'] as const).flatMap(
    (enrolmentType) => {
      const studies = studiesWithReportedParticipants.filter(
        (study) => (study.enrolmentType ?? 'UNKNOWN') === enrolmentType,
      )
      if (studies.length === 0) return []
      return [
        {
          enrolmentType,
          studyCount: studies.length,
          participantCount: studies.reduce((total, study) => total + (study.sampleSize ?? 0), 0),
        },
      ]
    },
  )
  const recordedStudyPhases = [...new Set(dossier.studies.flatMap((study) => study.phase ?? []))]
  const recordedStudyTypes = [...new Set(dossier.studies.flatMap((study) => study.studyType ?? []))]
  const recordedStudyDesignText = [...recordedStudyPhases, ...recordedStudyTypes].join(' · ')
  const recordedStudyDesignContextItems: readonly PublicMedicineContextItem[] = []
  const hasMedicineContext = hasMedicineRecordContext(dossier.medicineRecord)
  const hasStudyEvidence =
    dossier.keyOutcomes.length > 0 || dossier.studies.length > 0 || hasReadySafety
  const hasMechanismExplanation = dossier.mechanismSteps.length > 0 || mechanismEntries.length > 0
  const hasMechanism = hasMechanismExplanation || hasReadyPharmacokinetics
  const hasSafetyBackground = Boolean(dossier.medicineRecord.safetyAndAdministration)
  const safetyHref =
    dossier.dynamicModules?.safety.status === 'ready'
      ? '#selected-programme-safety'
      : hasSafetyBackground
        ? '#safety-and-administration'
        : undefined
  /*
   * The floating navigator doubles as this record's coverage map. It is computed from the record
   * rather than fixed, because two thirds of the corpus holds four modules and a fixed contents list
   * would send those readers to twenty-one empty destinations.
   */
  const navigatorSections = dossierNavigatorSections(dossier)
  const audienceLenses = dossierAudienceLensProjections(dossier)

  return (
    <div className="min-h-screen min-w-0 bg-[#F5F5F7] px-4 pb-20 pt-4 sm:px-8 sm:pt-6">
      <article className="mx-auto w-full max-w-[1180px] space-y-6">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="min-w-0">
            <DossierHeader dossier={dossier} />
          </div>
          <div className="min-w-0">
            <TenSecondAnswer
              dossier={dossier}
              mechanismPreviewAllowed={mechanismPreviewAllowed}
              safetyHref={safetyHref}
              comparison={
                dossier.dynamicModules?.outcomeComparison.status === 'ready' ? (
                  <DossierOutcomeComparison
                    module={dossier.dynamicModules.outcomeComparison}
                    sources={sourceById}
                  />
                ) : undefined
              }
            />
          </div>
        </div>

        <AdvancedEvidenceDisclosure
          navigation={
            <DossierNavigation
              hasEvidence={hasEvidenceSupport}
              hasMechanism={hasMechanism}
              hasStudyEvidence={hasStudyEvidence}
              safetyHref={safetyHref}
            />
          }
        >
          <div className="mt-8 space-y-10 pt-3 sm:mt-10 sm:pt-5">
            <DossierAudienceLensSelector projections={audienceLenses} />

            <DossierEvidenceIntroduction dossier={dossier} />

            <DossierResearchQuestion dossier={dossier} />

            {hasEvidenceSupport && (
              <section
                id="evidence-support"
                aria-labelledby="evidence-support-heading"
                className="scroll-mt-24 space-y-5 border-t border-black/[0.08] pt-8"
              >
                <SectionHeader
                  eyebrow="What the evidence supports"
                  tone="blue"
                  headingId="evidence-support-heading"
                  title="How far does the evidence reach?"
                >
                  Start with the reviewed answer, then follow each recorded step to the point where
                  the evidence stops or becomes uncertain.
                </SectionHeader>

                {dossier.readerSummary.exactText && (
                  <details className="rounded-2xl border border-black/[0.08] bg-white px-4 sm:px-5">
                    <summary className="flex min-h-12 cursor-pointer items-center font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                      Read the full research wording
                    </summary>
                    <AnnotatedMedicineText
                      className="border-t border-black/[0.07] py-4 text-base leading-7 text-[#424245]"
                      contexts={exactWordingContextMatches}
                      text={dossier.readerSummary.exactText}
                      testId="exact-wording-annotated"
                    />
                  </details>
                )}

                {(findingEvidence || limitationEvidence) && (
                  <details className="rounded-2xl border border-black/[0.08] bg-white px-4 sm:px-5">
                    <summary className="flex min-h-12 cursor-pointer items-center font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                      Sources linked to the short answer
                    </summary>
                    <div className="space-y-4 border-t border-black/[0.07] py-4">
                      {findingEvidence && (
                        <div>
                          <h4 className="text-sm font-semibold text-[#1D1D1F]">
                            What studies found
                          </h4>
                          <SourceLinks
                            contextItems={advancedContextItems}
                            ids={findingEvidence.sourceIds}
                            sources={sourceById}
                            claimBindings={findingEvidence.sourceClaimBindings}
                            heading="Sources linked to this finding"
                            ariaLabel="Sources linked to the short study finding"
                            testId="finding-adjacent-sources"
                          />
                        </div>
                      )}
                      {limitationEvidence && (
                        <div>
                          <h4 className="text-sm font-semibold text-[#1D1D1F]">Main limit</h4>
                          <SourceLinks
                            contextItems={advancedContextItems}
                            ids={limitationEvidence.sourceIds}
                            sources={sourceById}
                            claimBindings={limitationEvidence.sourceClaimBindings}
                            heading="Sources linked to this limit"
                            ariaLabel="Sources linked to the short answer limitation"
                            testId="limitation-adjacent-sources"
                          />
                        </div>
                      )}
                    </div>
                  </details>
                )}

                {dossier.conclusion && (
                  <section
                    aria-labelledby="programme-conclusion-heading"
                    className="space-y-6 rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6"
                  >
                    <header className="space-y-2">
                      <Eyebrow tone="blue">Reviewed answer for this use</Eyebrow>
                      <h3
                        id="programme-conclusion-heading"
                        className="text-2xl font-bold tracking-[-0.025em] text-[#1D1D1F]"
                      >
                        <AnnotatedMedicineText
                          as="span"
                          contexts={medicineTextContextMatches(
                            dossier.conclusion.publicLabel,
                            advancedContextItems,
                          )}
                          text={dossier.conclusion.publicLabel}
                        />
                      </h3>
                      <details>
                        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                          Professional term for this conclusion
                        </summary>
                        <AnnotatedMedicineText
                          className="text-sm leading-6 text-[#424245]"
                          contexts={medicineTextContextMatches(
                            dossier.conclusion.professionalLabel,
                            advancedContextItems,
                          )}
                          text={dossier.conclusion.professionalLabel}
                        />
                        {dossier.conclusion.code && (
                          <code className="mt-1 block break-all text-xs leading-5 text-[#6E6E73]">
                            Database code: {dossier.conclusion.code}
                          </code>
                        )}
                      </details>
                      {dossier.conclusion.reason !== dossier.readerSummary.takeaway &&
                        dossier.conclusion.reason !== dossier.mechanismSummary.observed && (
                          <AnnotatedMedicineText
                            className="pt-1 text-sm leading-6 text-[#1D1D1F]"
                            contexts={medicineTextContextMatches(
                              dossier.conclusion.reason,
                              advancedContextItems,
                            )}
                            text={dossier.conclusion.reason}
                          />
                        )}
                    </header>

                    <div className="rounded-2xl bg-[#F5F5F7] p-4 sm:p-5">
                      <Eyebrow>What this answer applies to</Eyebrow>
                      <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                        {Object.entries({
                          'Use studied': dossier.conclusion.scope.indication,
                          'People studied': dossier.conclusion.scope.population,
                          'Dose or amount of drug': dossier.conclusion.scope.doseExposure,
                          'Time covered': dossier.conclusion.scope.period,
                          'Studies included': dossier.conclusion.scope.trials,
                          'Result the answer is based on': dossier.conclusion.scope.outcome,
                        }).map(([label, value]) => (
                          <div key={label} className="min-w-0">
                            <dt className="text-[#6E6E73]">{label}</dt>
                            <dd className="mt-0.5 break-words font-semibold leading-5 text-[#1D1D1F]">
                              <AnnotatedMedicineText
                                as="span"
                                contexts={medicineTextContextMatches(value, advancedContextItems)}
                                text={value}
                              />
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-3">
                      {[
                        ['What the studies make unlikely', dossier.conclusion.whatWasDisproven],
                        ['What could still be true', dossier.conclusion.whatWasNotDisproven],
                        [
                          'Questions the studies did not answer',
                          dossier.conclusion.whatRemainsUnknown,
                        ],
                      ].map(([heading, entries]) => (
                        <div key={heading as string} className="min-w-0">
                          <h4 className="text-sm font-bold text-[#1D1D1F]">{heading as string}</h4>
                          {(entries as string[]).length > 0 ? (
                            <ul className="mt-2 space-y-2 text-sm leading-6 text-[#6E6E73]">
                              {(entries as string[]).map((entry) => (
                                <li key={entry} className="break-words">
                                  <AnnotatedMedicineText
                                    as="span"
                                    contexts={medicineTextContextMatches(
                                      entry,
                                      advancedContextItems,
                                    )}
                                    text={entry}
                                  />
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-sm leading-6 text-[#6E6E73]">
                              Reviewers did not list anything here.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-black/[0.07] pt-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <Eyebrow>How certain are reviewers?</Eyebrow>
                          <AnnotatedMedicineText
                            className="mt-1 text-sm font-bold text-[#1D1D1F]"
                            contexts={medicineTextContextMatches(
                              dossier.conclusion.confidence,
                              advancedContextItems,
                            )}
                            text={dossier.conclusion.confidence}
                          />
                          {dossier.conclusion.confidenceExplanation && (
                            <AnnotatedMedicineText
                              className="mt-2 text-sm leading-6 text-[#6E6E73]"
                              contexts={medicineTextContextMatches(
                                dossier.conclusion.confidenceExplanation,
                                advancedContextItems,
                              )}
                              text={dossier.conclusion.confidenceExplanation}
                            />
                          )}
                        </div>
                        {dossier.conclusion.conditionsThatWouldChangeVerdict.length > 0 && (
                          <div>
                            <Eyebrow>What new information could change this answer?</Eyebrow>
                            <ul className="mt-2 space-y-2 text-sm leading-6 text-[#6E6E73]">
                              {dossier.conclusion.conditionsThatWouldChangeVerdict.map(
                                (condition) => (
                                  <li key={condition} className="break-words">
                                    <AnnotatedMedicineText
                                      as="span"
                                      contexts={medicineTextContextMatches(
                                        condition,
                                        advancedContextItems,
                                      )}
                                      text={condition}
                                    />
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                <DossierProgrammeFailure
                  module={dossier.dynamicModules?.programmeFailure}
                  nodes={canonicalEvidenceChain ? dossier.evidenceNodes : []}
                  sources={sourceById}
                />

                {dossier.evidenceNodes.length > 0 && (
                  <section
                    id="evidence-chain"
                    aria-labelledby="evidence-chain-heading"
                    className="scroll-mt-24 space-y-4"
                  >
                    <SectionHeader
                      eyebrow={
                        dossier.bindingState === 'legacy_record'
                          ? 'Across the published research'
                          : 'How the evidence connects'
                      }
                      tone={dossier.bindingState === 'legacy_record' ? 'amber' : 'blue'}
                      headingId="evidence-chain-heading"
                      title={
                        dossier.bindingState === 'legacy_record'
                          ? 'General research findings'
                          : 'Which steps actually happened?'
                      }
                      meta={
                        <span className="font-mono text-xs uppercase tracking-wide text-[#6E6E73]">
                          {dossier.bindingState === 'published_programme'
                            ? 'This use only'
                            : isUnpublishedProgramme
                              ? 'No reviewed answer yet'
                              : 'Background across studies'}
                        </span>
                      }
                    />
                    {dossier.bindingState === 'legacy_record' && (
                      <p className="max-w-2xl text-sm leading-6 text-[#6E6E73]">
                        These are separate findings collected across the research. They are not an
                        ordered chain and have not been reviewed as an answer to this specific
                        question.
                      </p>
                    )}
                    {canonicalEvidenceChain && (
                      <div className="space-y-3">
                        <DossierEvidencePath nodes={dossier.evidenceNodes} />
                        <div
                          className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm leading-6 ${
                            firstEvidenceGap
                              ? 'border-amber-200 bg-amber-50 text-amber-950'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-950'
                          }`}
                        >
                          {firstEvidenceGap ? (
                            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          ) : (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          )}
                          <p className="break-words">
                            {firstEvidenceGap ? (
                              <>
                                <span className="font-semibold">
                                  {firstEvidenceGap.state === 'contradicted'
                                    ? 'First step that did not happen as expected'
                                    : 'First unanswered step'}
                                  : step {firstEvidenceGap.order}, {firstEvidenceGap.label}.
                                </span>{' '}
                                {firstEvidenceGap.state === 'contradicted'
                                  ? 'The reviewed sources point against this step.'
                                  : firstEvidenceGap.state === 'not_measured'
                                    ? 'The studies did not measure this step.'
                                    : firstEvidenceGap.state === 'mixed'
                                      ? 'The reviewed studies point in different directions.'
                                      : 'The available sources do not answer this step yet.'}{' '}
                                Later steps are still reported separately; they do not fill this
                                gap.
                              </>
                            ) : (
                              <span className="font-semibold">
                                Reviewed sources support every step shown here.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                    {dossier.evidenceNodes.length > 0 ? (
                      dossier.bindingState === 'legacy_record' ? (
                        <ul className="space-y-3">
                          {dossier.evidenceNodes.map((node) => (
                            <li key={node.id} className="min-w-0 rounded-2xl bg-white p-5">
                              <h4 className="[overflow-wrap:anywhere] text-base font-semibold leading-6 text-[#1D1D1F]">
                                <AnnotatedMedicineText
                                  as="span"
                                  contexts={medicineTextContextMatches(
                                    node.title,
                                    advancedContextItems,
                                  )}
                                  text={node.title}
                                />
                              </h4>
                              <AnnotatedMedicineText
                                className="mt-2 [overflow-wrap:anywhere] text-sm leading-6 text-[#424245]"
                                contexts={medicineTextContextMatches(
                                  node.summary,
                                  advancedContextItems,
                                )}
                                text={node.summary}
                              />
                              <SourceLinks
                                contextItems={advancedContextItems}
                                ids={node.sourceIds}
                                sources={sourceById}
                              />
                              {node.technicalDetail && (
                                <LegacyEvidenceTechnicalDetails
                                  contextItems={advancedContextItems}
                                  detail={node.technicalDetail}
                                />
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ol className="space-y-2.5">
                          {dossier.evidenceNodes.map((node, index) => {
                            const style = evidenceNodeStyle[node.state]
                            return (
                              <li
                                key={node.id}
                                id={evidenceNodeAnchorId(node.order)}
                                className={`relative min-w-0 rounded-2xl border bg-white p-4 sm:p-5 ${style.border}`}
                              >
                                {index < dossier.evidenceNodes.length - 1 && (
                                  <span
                                    aria-hidden="true"
                                    className={`pointer-events-none absolute -bottom-[11px] left-6 h-[11px] w-px ${
                                      !firstEvidenceGap || node.order < firstEvidenceGap.order
                                        ? 'bg-emerald-500/55'
                                        : node.order === firstEvidenceGap.order
                                          ? 'h-1.5 w-1.5 -translate-x-[2.5px] rounded-full bg-[#6E6E73]'
                                          : 'border-l border-dashed border-black/25'
                                    }`}
                                  />
                                )}
                                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                                  <span
                                    className="mt-1 font-mono text-xs text-[#0066CC]"
                                    aria-hidden="true"
                                  >
                                    {String(node.order).padStart(2, '0')}
                                  </span>
                                  <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex min-w-0 flex-col items-start justify-between gap-2 sm:flex-row sm:gap-4">
                                      <div className="min-w-0">
                                        <Eyebrow>{node.label}</Eyebrow>
                                        <h4 className="mt-1 break-words text-sm font-semibold leading-5 text-[#1D1D1F]">
                                          <AnnotatedMedicineText
                                            as="span"
                                            contexts={medicineTextContextMatches(
                                              node.title,
                                              advancedContextItems,
                                            )}
                                            text={node.title}
                                          />
                                        </h4>
                                      </div>
                                      <EvidenceNodeStatusBadge state={node.state} />
                                    </div>
                                    <AnnotatedMedicineText
                                      className="break-words text-sm leading-6 text-[#6E6E73]"
                                      contexts={medicineTextContextMatches(
                                        node.summary,
                                        advancedContextItems,
                                      )}
                                      text={node.summary}
                                    />
                                    {((node.claims?.length ?? 0) > 0 ||
                                      node.sourceIds.length > 0 ||
                                      node.technicalDetail) && (
                                      /* One step open at a time: the native exclusive-accordion
                                         name keeps every step's detail in the server HTML while
                                         reading one step closes the previous one. */
                                      <details className="pt-1" name="evidence-chain-step">
                                        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                                          Details and sources
                                        </summary>
                                        {node.claims && node.claims.length > 0 && (
                                          <ul className="space-y-3 pb-1">
                                            {node.claims.map((claim) => (
                                              <li
                                                key={claim.id}
                                                className="min-w-0 rounded-xl bg-[#F5F5F7] p-3"
                                              >
                                                <ClaimNatureBadge nature={claim.nature} />
                                                {(claim.nodeRelationships?.length ?? 0) > 0 && (
                                                  <p className="mt-2 text-xs font-semibold leading-5 text-[#515154]">
                                                    Relationship to this step:{' '}
                                                    {claim.nodeRelationships
                                                      ?.map((relationship) =>
                                                        claimRelationshipLabel(relationship),
                                                      )
                                                      .join(' · ')}
                                                  </p>
                                                )}
                                                <AnnotatedMedicineText
                                                  className="mt-2 break-words text-sm leading-6 text-[#1D1D1F]"
                                                  contexts={medicineTextContextMatches(
                                                    claim.text,
                                                    advancedContextItems,
                                                  )}
                                                  text={claim.text}
                                                />
                                                {(claim.population ||
                                                  claim.intervention ||
                                                  claim.comparator ||
                                                  claim.dose ||
                                                  claim.route ||
                                                  claim.duration ||
                                                  claim.endpoint ||
                                                  claim.endpointHierarchy ||
                                                  claim.outcomeType ||
                                                  claim.direction ||
                                                  claim.timepoint ||
                                                  claim.exactResult ||
                                                  claim.uncertaintyInterval ||
                                                  claim.lastVerifiedAt) && (
                                                  <dl className="mt-3 grid gap-2 text-sm leading-6 text-[#6E6E73]">
                                                    {claim.population && (
                                                      <div>
                                                        <dt>People studied</dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          <AnnotatedMedicineText
                                                            as="span"
                                                            contexts={medicineTextContextMatches(
                                                              claim.population,
                                                              advancedContextItems,
                                                            )}
                                                            text={claim.population}
                                                          />
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.intervention && (
                                                      <div>
                                                        <dt>Medicine or treatment group</dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          <AnnotatedMedicineText
                                                            as="span"
                                                            contexts={medicineTextContextMatches(
                                                              claim.intervention,
                                                              advancedContextItems,
                                                            )}
                                                            text={claim.intervention}
                                                          />
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.comparator && (
                                                      <div>
                                                        <dt>What it was compared with</dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          <AnnotatedMedicineText
                                                            as="span"
                                                            contexts={medicineTextContextMatches(
                                                              claim.comparator,
                                                              advancedContextItems,
                                                            )}
                                                            text={claim.comparator}
                                                          />
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.dose && (
                                                      <div>
                                                        <dt>Dose or amount</dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          <AnnotatedMedicineText
                                                            as="span"
                                                            contexts={medicineTextContextMatches(
                                                              claim.dose,
                                                              advancedContextItems,
                                                            )}
                                                            text={claim.dose}
                                                          />
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.route && (
                                                      <div>
                                                        <dt>How it was given</dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          <AnnotatedMedicineText
                                                            as="span"
                                                            contexts={medicineTextContextMatches(
                                                              claim.route,
                                                              advancedContextItems,
                                                            )}
                                                            text={claim.route}
                                                          />
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.duration && (
                                                      <div>
                                                        <dt>Time studied</dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          <AnnotatedMedicineText
                                                            as="span"
                                                            contexts={medicineTextContextMatches(
                                                              claim.duration,
                                                              [
                                                                ...publicMedicineStudyDayContextItems(
                                                                  claim.duration,
                                                                ),
                                                                ...advancedContextItems,
                                                              ],
                                                            )}
                                                            text={claim.duration}
                                                          />
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.endpoint && (
                                                      <div>
                                                        <dt>What researchers measured</dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          <AnnotatedMedicineText
                                                            as="span"
                                                            contexts={medicineTextContextMatches(
                                                              claim.endpoint,
                                                              advancedContextItems,
                                                            )}
                                                            text={claim.endpoint}
                                                          />
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.endpointHierarchy && (
                                                      <div>
                                                        <dt>
                                                          Was this a main or additional result?
                                                        </dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          {endpointHierarchyLabel(
                                                            claim.endpointHierarchy,
                                                          )}
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.outcomeType && (
                                                      <div>
                                                        <dt>What kind of result is this?</dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          {outcomeTypeContext(claim.outcomeType)}
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.direction && (
                                                      <div>
                                                        <dt>Direction of change</dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          {directionLabel(claim.direction)}
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.timepoint && (
                                                      <div>
                                                        <dt>When it was measured</dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          <AnnotatedMedicineText
                                                            as="span"
                                                            contexts={medicineTextContextMatches(
                                                              claim.timepoint,
                                                              [
                                                                ...publicMedicineStudyDayContextItems(
                                                                  claim.timepoint,
                                                                ),
                                                                ...advancedContextItems,
                                                              ],
                                                            )}
                                                            text={claim.timepoint}
                                                          />
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.exactResult && (
                                                      <div>
                                                        <dt>Exact number</dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          <AnnotatedMedicineText
                                                            as="span"
                                                            contexts={medicineTextContextMatches(
                                                              claim.exactResult,
                                                              advancedContextItems,
                                                            )}
                                                            text={claim.exactResult}
                                                          />
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.uncertaintyInterval && (
                                                      <div>
                                                        <dt>How uncertain is this estimate?</dt>
                                                        <dd className="break-words font-semibold text-[#424245]">
                                                          <AnnotatedMedicineText
                                                            as="span"
                                                            contexts={medicineTextContextMatches(
                                                              claim.uncertaintyInterval,
                                                              advancedContextItems,
                                                            )}
                                                            text={claim.uncertaintyInterval}
                                                          />
                                                        </dd>
                                                      </div>
                                                    )}
                                                    {claim.lastVerifiedAt && (
                                                      <div>
                                                        <dt>Source last checked</dt>
                                                        <dd className="font-semibold text-[#424245]">
                                                          {claim.lastVerifiedAt.slice(0, 10)}
                                                        </dd>
                                                      </div>
                                                    )}
                                                  </dl>
                                                )}
                                                {claim.technicalText && (
                                                  <details className="mt-2">
                                                    <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                                                      Show the technical wording
                                                    </summary>
                                                    <p className="break-words pb-1 text-sm leading-6 text-[#6E6E73]">
                                                      <AnnotatedMedicineText
                                                        as="span"
                                                        contexts={medicineTextContextMatches(
                                                          claim.technicalText,
                                                          advancedContextItems,
                                                        )}
                                                        text={claim.technicalText}
                                                      />
                                                    </p>
                                                  </details>
                                                )}
                                                <SourceLinks
                                                  contextItems={advancedContextItems}
                                                  ids={claim.sourceIds}
                                                  sources={sourceById}
                                                  claimBindings={claim.sourceClaimBindings}
                                                />
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                        {node.technicalDetail && (
                                          <LegacyEvidenceTechnicalDetails
                                            contextItems={advancedContextItems}
                                            detail={node.technicalDetail}
                                          />
                                        )}
                                        <SourceLinks
                                          contextItems={advancedContextItems}
                                          ids={node.sourceIds}
                                          sources={sourceById}
                                        />
                                      </details>
                                    )}
                                  </div>
                                </div>
                              </li>
                            )
                          })}
                        </ol>
                      )
                    ) : (
                      <EmptyEvidence>
                        No reviewed evidence steps have been published for this use.
                      </EmptyEvidence>
                    )}
                    {dossier.bindingState !== 'legacy_record' && (
                      <p className="flex items-start gap-2 text-sm leading-6 text-[#6E6E73]">
                        <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        “Not answered” does not mean failure. It means the study did not measure
                        this step or there is not enough information. We only say a step did not
                        happen when reviewers found sources pointing against it.
                      </p>
                    )}
                  </section>
                )}
              </section>
            )}

            {hasStudyEvidence && (
              <section
                id="study-measurements"
                aria-labelledby="study-measurements-heading"
                className="scroll-mt-24 space-y-6 border-t border-black/[0.08] pt-8"
              >
                <SectionHeader
                  eyebrow="Studies and measurements"
                  tone="blue"
                  headingId="study-measurements-heading"
                  title="What did the studies measure?"
                >
                  Results are shown in the record’s stored order. Open a study for its design,
                  statistical detail, limits, and linked sources.
                </SectionHeader>

                <KeyOutcomesSection
                  contextItems={advancedContextItems}
                  dossier={dossier}
                  sources={sourceById}
                />

                <DossierSafetyEvidence
                  module={dossier.dynamicModules?.safety}
                  sources={sourceById}
                />

                {dossier.studies.length > 0 && (
                  <section
                    id="evidence-depth"
                    aria-labelledby="evidence-depth-heading"
                    className="scroll-mt-24 space-y-4"
                  >
                    <span id="who-was-studied" className="block scroll-mt-24" aria-hidden="true" />
                    <div className="space-y-1">
                      <Eyebrow tone={dossier.bindingState === 'legacy_record' ? 'amber' : 'blue'}>
                        {dossier.bindingState === 'legacy_record'
                          ? 'Research at a glance'
                          : 'Study numbers at a glance'}
                      </Eyebrow>
                      <h3 id="evidence-depth-heading" className="text-lg font-bold text-[#1D1D1F]">
                        {dossier.bindingState === 'legacy_record'
                          ? 'Studies included in this summary'
                          : 'How many studies have results here?'}
                      </h3>
                    </div>
                    <dl className="divide-y divide-black/[0.07] border-y border-black/[0.08] text-sm">
                      <div className="min-w-0 py-3">
                        <dt className="leading-5 text-[#6E6E73]">
                          Studies with a result on this page
                        </dt>
                        <dd className="mt-1 text-lg font-bold text-[#1D1D1F]">
                          {studiesWithResults.length.toLocaleString()}
                        </dd>
                      </div>
                      <div className="min-w-0 py-3">
                        <dt className="leading-5 text-[#6E6E73]">
                          People enrolled in studies with results
                        </dt>
                        <dd className="mt-1 break-words font-semibold leading-6 text-[#1D1D1F]">
                          {studiesWithReportedParticipants.length > 0 ? (
                            <>
                              <p>
                                {reportedParticipantTotal.toLocaleString()} participants across{' '}
                                {studiesWithReportedParticipants.length.toLocaleString()}{' '}
                                {studiesWithReportedParticipants.length === 1 ? 'study' : 'studies'}
                              </p>
                              <ul className="mt-2 space-y-1 font-normal text-[#424245]">
                                {participantCountBreakdown.map((group) => (
                                  <li key={group.enrolmentType}>
                                    {participantCountTypeLabel(group.enrolmentType)}:{' '}
                                    {group.participantCount.toLocaleString()} across{' '}
                                    {group.studyCount.toLocaleString()}{' '}
                                    {group.studyCount === 1 ? 'study' : 'studies'}
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            'No participant count is linked to an available result'
                          )}
                        </dd>
                      </div>
                      <div className="min-w-0 py-3">
                        <dt className="leading-5 text-[#6E6E73]">
                          Still running or no result on this page
                        </dt>
                        <dd className="mt-1 text-lg font-bold text-[#1D1D1F]">
                          {studiesWithoutResults.length.toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                    <p className="text-sm leading-6 text-[#6E6E73]">
                      These counts show how much information is on this page. They do not by
                      themselves prove that the medicine is safe or helpful. Studies without a
                      result are not included in the number of people above.
                    </p>
                    {recordedStudyDesignText && (
                      <details>
                        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                          Testing stages and how the studies were run
                        </summary>
                        <AnnotatedMedicineText
                          className="text-sm leading-6 text-[#6E6E73]"
                          contexts={medicineTextContextMatches(
                            recordedStudyDesignText,
                            recordedStudyDesignContextItems,
                          )}
                          text={recordedStudyDesignText}
                          testId="recorded-study-design"
                        />
                      </details>
                    )}
                  </section>
                )}

                {dossier.studies.length > 0 && (
                  <section
                    id="studies"
                    aria-labelledby="studies-heading"
                    className="scroll-mt-24 space-y-4"
                  >
                    <div className="space-y-1">
                      <Eyebrow tone={dossier.bindingState === 'legacy_record' ? 'amber' : 'blue'}>
                        {dossier.bindingState === 'legacy_record'
                          ? 'Study-by-study detail'
                          : 'What each study can tell us'}
                      </Eyebrow>
                      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <h3 id="studies-heading" className="text-xl font-bold text-[#1D1D1F]">
                          {dossier.bindingState === 'legacy_record'
                            ? 'What each study reports'
                            : 'Results, limits and how each study was run'}
                        </h3>
                        <p className="shrink-0 font-mono text-xs leading-5 text-[#6E6E73]">
                          {studiesWithResults.length} with a reported result ·{' '}
                          {dossier.studies.length} recorded
                        </p>
                      </div>
                      <p className="text-sm leading-6 text-[#6E6E73]">
                        Studies with a reported result are separated from ongoing studies and
                        records where no result is available.
                      </p>
                    </div>
                    {studiesWithResults.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-base font-semibold text-[#1D1D1F]">
                          Studies with a result on this page
                        </h4>
                        <div className="space-y-3">
                          {studiesWithResults.map((study) => (
                            <StudyCard
                              key={study.id}
                              contextItems={advancedContextItems}
                              study={study}
                              sources={sourceById}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {studiesWithoutResults.length > 0 && (
                      <details className="group/studies rounded-2xl border border-black/[0.08] bg-white px-4">
                        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                          Still running or no result on this page ({studiesWithoutResults.length})
                          <span
                            className="text-lg font-normal text-[#0066CC] transition-transform group-open/studies:rotate-45 motion-reduce:transition-none"
                            aria-hidden="true"
                          >
                            +
                          </span>
                        </summary>
                        <div className="space-y-3 border-t border-black/[0.07] py-4">
                          {studiesWithoutResults.map((study) => (
                            <StudyCard
                              key={study.id}
                              contextItems={advancedContextItems}
                              study={study}
                              sources={sourceById}
                            />
                          ))}
                        </div>
                      </details>
                    )}
                  </section>
                )}
              </section>
            )}

            {hasMechanism && (
              <section
                id="mechanism-map"
                data-testid="programme-mechanism-map"
                aria-labelledby="mechanism-heading"
                className="scroll-mt-24 space-y-5 border-t border-black/[0.08] pt-8"
              >
                <div id="how-it-works" className="scroll-mt-24">
                  <SectionHeader
                    eyebrow={
                      dossier.bindingState === 'legacy_record'
                        ? 'How researchers think it works'
                        : 'Inside the body'
                    }
                    tone={dossier.bindingState === 'legacy_record' ? 'amber' : 'violet'}
                    headingId="mechanism-heading"
                    title={
                      hasMechanismExplanation
                        ? 'How the medicine is expected to work'
                        : 'What happened after it was given?'
                    }
                  >
                    {!hasMechanismExplanation
                      ? 'This section shows reviewed measurements of how the medicine moved through the body. The stored time labels are not treated as a complete chronological sequence.'
                      : dossier.bindingState === 'legacy_record'
                        ? 'These possible steps were collected across studies. They have not been checked against one specific use or linked to the exact source for every statement.'
                        : 'Each card shows one expected step. Its label says whether people, laboratory work, or neither has shown that step. Human reviewers decide what the science means.'}
                  </SectionHeader>
                </div>
                {mechanismEntries.length > 0 && (
                  <section
                    aria-labelledby="mechanism-overview-heading"
                    className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white"
                    data-testid="mechanism-location-summary"
                  >
                    <header className="border-b border-black/[0.07] px-5 py-4">
                      <h4
                        id="mechanism-overview-heading"
                        className="text-base font-semibold text-[#1D1D1F]"
                      >
                        Where it acts
                      </h4>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-[#6E6E73]">
                        This text map follows only the body location, change, and measurement saved
                        in this record.
                      </p>
                    </header>
                    <dl className="divide-y divide-black/[0.07] lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                      {mechanismEntries.map(([label, value]) => (
                        <div key={label} className="min-w-0 px-5 py-4">
                          <dt className="text-sm font-semibold leading-5 text-[#515154]">
                            {label}
                          </dt>
                          <dd className="mt-1 break-words text-base font-medium leading-7 text-[#1D1D1F]">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {mechanismEvidence && (
                      <div className="border-t border-black/[0.07] px-5 pb-4">
                        <SourceLinks
                          contextItems={advancedContextItems}
                          ids={mechanismEvidence.sourceIds}
                          sources={sourceById}
                          claimBindings={mechanismEvidence.sourceClaimBindings}
                          heading="Sources linked to this reviewed explanation"
                          ariaLabel="Sources linked to the reviewed mechanism explanation"
                          testId="mechanism-adjacent-sources"
                        />
                      </div>
                    )}
                  </section>
                )}
                <DossierPharmacokinetics
                  module={dossier.dynamicModules?.pharmacokinetics}
                  sources={sourceById}
                />
                {dossier.mechanismSteps.length > 0 ? (
                  <ol className="min-w-0 space-y-3" aria-label="Ordered mechanism stages">
                    {dossier.mechanismSteps.map((step, index) => (
                      <li
                        key={step.id}
                        className="relative flex min-w-0 gap-3 rounded-2xl border border-[#0071E3]/12 bg-white p-4 shadow-[0_1px_8px_rgba(0,0,0,0.025)]"
                        data-testid="programme-mechanism-stage"
                      >
                        <span
                          className="shrink-0 font-mono text-xs font-semibold text-[#0066CC]"
                          aria-label={`Stage ${step.order}`}
                        >
                          {String(step.order).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 space-y-1.5">
                          <h4 className="text-sm font-semibold leading-5 text-[#1D1D1F]">
                            <AnnotatedMedicineText
                              as="span"
                              contexts={medicineTextContextMatches(
                                step.title,
                                advancedContextItems,
                              )}
                              text={step.title}
                              testId="mechanism-step-title"
                            />
                          </h4>
                          <AnnotatedMedicineText
                            className="break-words text-sm leading-6 text-[#6E6E73]"
                            contexts={medicineTextContextMatches(
                              step.plainLanguage,
                              advancedContextItems,
                            )}
                            text={step.plainLanguage}
                          />
                          {step.evidenceBasis && (
                            <p
                              className="inline-flex max-w-full rounded-full border border-black/[0.08] bg-[#F5F5F7] px-2 py-1 text-xs font-semibold leading-5 text-[#424245]"
                              data-testid="mechanism-evidence-basis"
                            >
                              {mechanismEvidenceBasisLabel[step.evidenceBasis]}
                            </p>
                          )}
                          {(step.technicalDetail || step.sourceIds.length > 0) && (
                            <details className="pt-1">
                              <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                                Technical detail and sources
                              </summary>
                              {step.technicalDetail && (
                                <AnnotatedMedicineText
                                  className="break-words text-sm leading-6 text-[#6E6E73]"
                                  contexts={medicineTextContextMatches(
                                    step.technicalDetail,
                                    advancedContextItems,
                                  )}
                                  text={step.technicalDetail}
                                  testId="mechanism-technical-detail"
                                />
                              )}
                              <SourceLinks
                                contextItems={advancedContextItems}
                                ids={step.sourceIds}
                                sources={sourceById}
                                claimBindings={step.sourceClaimBindings}
                                testId="mechanism-stage-source-links"
                              />
                            </details>
                          )}
                        </div>
                        {index < dossier.mechanismSteps.length - 1 && (
                          <>
                            <span
                              className="absolute -bottom-3 left-5 h-3 border-l border-[#0071E3]/35"
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </section>
            )}

            {dossier.programmes.length > 1 && (
              <DossierOtherProgrammes programmes={dossier.programmes} />
            )}

            <DossierQuestionCoverage dossier={dossier} />

            <DossierCompletionAssessment dossier={dossier} />

            <section
              id="sources"
              aria-labelledby="sources-heading"
              className="scroll-mt-24 space-y-4"
            >
              <span id="sources-review" className="block scroll-mt-24" aria-hidden="true" />
              <div id="review-history" className="scroll-mt-24 border-t border-black/[0.08] pt-8">
                <SectionHeader
                  eyebrow="Sources, review and changes"
                  tone="blue"
                  headingId="sources-heading"
                  title="Where did this answer come from?"
                >
                  See who reviewed the answer, the exact sources they used, and what changed between
                  published versions.
                </SectionHeader>
              </div>

              {dossier.conclusion && <ConclusionReviewDetails conclusion={dossier.conclusion} />}

              <section
                aria-labelledby="last-checked-heading"
                className="border-y border-black/[0.08] py-4"
              >
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4
                      id="last-checked-heading"
                      className="text-base font-semibold text-[#1D1D1F]"
                    >
                      When was it last checked?
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-[#515154]">
                      The label reflects whether the saved sources and answer are due for another
                      review.
                    </p>
                  </div>
                  <span
                    className={`max-w-full shrink-0 break-words rounded-full border px-2.5 py-1 text-xs font-semibold leading-5 ${freshnessStyle[dossier.freshness]}`}
                  >
                    {dossier.freshnessLabel}
                  </span>
                </div>
              </section>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#1D1D1F]">Sources</h4>
                <p className="max-w-2xl text-base leading-7 text-[#515154]">
                  “Saved” is when RNAWiki stored a copy. “Last checked” is when someone most
                  recently confirmed the link. A linked source supports only the statement it is
                  connected to, not automatically the whole answer.
                </p>
              </div>

              {dossier.sources.length > 0 ? (
                <ul className="divide-y divide-black/[0.06] rounded-2xl bg-white px-5">
                  {dossier.sources.map((source) => (
                    <li
                      key={source.id}
                      id={`source-${source.id}`}
                      className="scroll-mt-24 py-4"
                      data-source-id={source.id}
                    >
                      <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                          {source.href ? (
                            <a
                              href={source.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-11 max-w-full items-center gap-1.5 break-words text-sm font-semibold leading-6 text-[#1D1D1F] hover:text-[#0071E3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
                            >
                              <AnnotatedMedicineText
                                as="span"
                                contexts={medicineTextContextMatches(
                                  source.label,
                                  advancedContextItems,
                                )}
                                text={source.label}
                              />
                              <ExternalLink
                                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                          ) : source.canonicalLocator ? (
                            <p className="break-all text-sm font-semibold leading-6 text-[#1D1D1F]">
                              {source.canonicalLocator}
                            </p>
                          ) : (
                            <AnnotatedMedicineText
                              className="break-words text-sm font-semibold leading-6 text-[#1D1D1F]"
                              contexts={medicineTextContextMatches(
                                source.label,
                                advancedContextItems,
                              )}
                              text={source.label}
                            />
                          )}
                          <div className="mt-1 flex min-w-0 flex-wrap gap-x-3 gap-y-1 font-mono text-xs leading-5 text-[#6E6E73]">
                            {source.identifier && (
                              <span className="break-all">{source.identifier}</span>
                            )}
                            {source.retrievedAt && <span>Saved {source.retrievedAt}</span>}
                            {source.verifiedAt && <span>Last checked {source.verifiedAt}</span>}
                          </div>
                          {source.snapshotHash && (
                            <details className="mt-1">
                              <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                                Exact saved copy details
                              </summary>
                              <code className="block break-all font-mono text-xs leading-5 text-[#6E6E73]">
                                Source fingerprint sha256:{source.snapshotHash}
                              </code>
                            </details>
                          )}
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-1 text-xs font-semibold leading-5 ${freshnessStyle[source.freshness]}`}
                        >
                          {sourceFreshnessLabel[source.freshness]}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {dossier.sources.length > 0 && (
                <CitationExportPanel
                  medicineName={dossier.name}
                  programmeLabel={dossier.selectedProgrammeLabel}
                  pagePath={`/d/${dossier.slug}`}
                  sources={dossier.sources.map((source) => ({
                    id: source.id,
                    label: source.label,
                    href: source.href,
                    identifier: source.identifier,
                    retrievedAt: source.retrievedAt,
                    verifiedAt: source.verifiedAt,
                  }))}
                />
              )}

              <DevelopmentTimeline
                contextItems={advancedContextItems}
                events={recordedTimeline}
                sources={sourceById}
              />

              <section
                aria-labelledby="record-checks-heading"
                className={`rounded-2xl p-5 ${
                  isPublishedProgramme
                    ? 'bg-emerald-50'
                    : isUnpublishedProgramme
                      ? 'bg-amber-50'
                      : 'bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isPublishedProgramme ? (
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
                      aria-hidden="true"
                    />
                  ) : (
                    <CircleAlert
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#0066CC]"
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0 space-y-1.5">
                    <h4
                      id="record-checks-heading"
                      className="text-base font-semibold text-[#1D1D1F]"
                    >
                      What the software checked — not what the science means
                    </h4>
                    <p className="text-sm leading-6 text-[#424245]">
                      {isPublishedProgramme
                        ? 'Software checked that the question, saved sources, dates, linked statements, and update status fit together. People still decide what the science means.'
                        : isUnpublishedProgramme
                          ? 'A use has been identified, but no reviewed conclusion is public. General research text is not treated as proof for this use.'
                          : 'This general research summary has not passed the source-and-review checks used for question-specific answers. Those checks require each important statement to be linked to one use, an exact saved source, and a reviewed version.'}
                    </p>
                    {dossier.machineFindingCodes.length > 0 && (
                      <details>
                        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                          Technical check codes
                        </summary>
                        <p className="break-all font-mono text-xs uppercase leading-5 tracking-wide text-[#6E6E73]">
                          {dossier.machineFindingCodes.join(' · ')}
                        </p>
                      </details>
                    )}
                  </div>
                </div>
              </section>

              <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
                <div className="flex items-start gap-3">
                  <History className="mt-0.5 h-4 w-4 shrink-0 text-[#6E6E73]" aria-hidden="true" />
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-[#1D1D1F]">
                      Technical record details
                    </h4>
                    {dossier.bindingState === 'published_programme' && (
                      <p className="text-sm leading-6 text-[#515154]">
                        Reviewers connect every important statement to the exact source they read.
                        They note whether it supports the answer, points against it, or simply adds
                        context before an updated answer is published.
                      </p>
                    )}
                    {(dossier.review.revisionId ||
                      dossier.review.engineVersion ||
                      dossier.review.inputDigest ||
                      dossier.review.reviewedAt ||
                      dossier.review.reviewerLabel) && (
                      <details>
                        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                          Show versions and software identifiers
                        </summary>
                        <div className="flex min-w-0 flex-wrap gap-x-3 gap-y-1 font-mono text-xs leading-5 text-[#6E6E73]">
                          {dossier.review.revisionId && (
                            <span>Record ID {dossier.review.revisionId}</span>
                          )}
                          {dossier.review.engineVersion && (
                            <span>{dossier.review.engineVersion}</span>
                          )}
                          {dossier.review.inputDigest && (
                            <span className="break-all">
                              Check input {dossier.review.inputDigest.slice(0, 12)}
                            </span>
                          )}
                          {dossier.review.reviewedAt && (
                            <span>Reviewed {dossier.review.reviewedAt}</span>
                          )}
                          {dossier.review.reviewerLabel && (
                            <span>By {dossier.review.reviewerLabel}</span>
                          )}
                        </div>
                      </details>
                    )}
                    <Link
                      href={dossier.review.historyHref}
                      className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
                    >
                      See what changed on this page
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {!hasAdvancedEvidence && (
              <EmptyEvidence>
                There is not enough reviewed information for this use to show the detailed evidence
                sections yet. Missing sections are left blank instead of being filled with claims
                that reviewers have not checked.
              </EmptyEvidence>
            )}
          </div>
        </AdvancedEvidenceDisclosure>

        {hasMedicineContext && (
          <MedicineBackgroundDisclosure>
            <MedicineRecordContextSections
              bindingState={dossier.bindingState}
              context={dossier.medicineRecord}
              contextItems={advancedContextItems}
            />
          </MedicineBackgroundDisclosure>
        )}

        <DossierAccountActionsGuard>
          <div className="space-y-6">
            <section aria-labelledby="dossier-utilities-heading" className="space-y-3 pt-2">
              <h2 id="dossier-utilities-heading" className="sr-only">
                Contribute to this medicine page
              </h2>
              {dossier.bindingState === 'legacy_record' ? (
                <LegacyIdentityCorrectionActions
                  slug={dossier.slug}
                  name={dossier.name}
                  tradeName={dossier.tradeName}
                />
              ) : (
                <DossierContributionActions dossier={dossier} />
              )}
            </section>

            <CommunityCommentary
              medicineSlug={dossier.slug}
              initialNotes={dossier.medicineRecord.communityNotes}
            />
          </div>
        </DossierAccountActionsGuard>

        <nav
          aria-label="Related RNAWiki pages"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-black/[0.08] pt-6 text-xs font-medium text-[#6E6E73]"
        >
          <Link
            href="/browse"
            className="inline-flex min-h-11 items-center hover:text-[#0A66D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8]"
          >
            Browse all medicines
          </Link>
          <Link
            href="/review-queue"
            className="inline-flex min-h-11 items-center hover:text-[#0A66D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8]"
          >
            Review queue
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex min-h-11 items-center hover:text-[#0A66D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8]"
          >
            How this works
          </Link>
        </nav>
      </article>
      <DossierSectionNavigator sections={navigatorSections} medicineName={dossier.name} />
    </div>
  )
}
