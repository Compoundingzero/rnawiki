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
import { MedicineContextDisclosure } from '@/components/MedicineContextDisclosure'
import {
  hasMedicineRecordContext,
  MedicineRecordContextSections,
} from '@/components/MedicineRecordContextSections'
import { SaveMedicineButton } from '@/components/SaveMedicineButton'
import type {
  DossierFreshnessState,
  EvidenceClaimView,
  EvidenceClaimNature,
  EvidenceDisplayState,
  EvidenceNodeState,
  EvidenceNodeTechnicalDetailView,
  EvidenceSourceView,
  MechanismStepView,
  MedicineDossierViewModel,
  ProgrammeTimelineEventView,
  StudyView,
} from '@/lib/medicine-dossier-view-model'
import { publicApprovalStatusLabel } from '@/lib/public-medicine-language'
import {
  COMMON_PUBLIC_MEDICINE_CONTEXT,
  collectPublicMedicineText,
  dedupePublicMedicineContextItems,
  detectPublicMedicineContextItems,
  endpointHierarchyContextItem,
  outcomeTypeContextItem,
  publicMedicineStudyDayContextItems,
  studyReviewContextItem,
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
  initialSaved?: boolean
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
    label: 'Older note · not reviewed for this use',
    badge: 'bg-[#F5F5F7] text-[#6E6E73] border-black/[0.08]',
    border: 'border-black/[0.08]',
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
    label: 'Older note · not reviewed for this use',
    badge: 'bg-[#F5F5F7] text-[#6E6E73] border-black/[0.12]',
    border: 'border-black/[0.1]',
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
  tone?: 'muted' | 'blue' | 'amber'
}) {
  const color =
    tone === 'blue' ? 'text-[#0066CC]' : tone === 'amber' ? 'text-amber-700' : 'text-[#6E6E73]'
  return <p className={`font-mono text-xs uppercase tracking-[0.1em] ${color}`}>{children}</p>
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

function SourceLinks({
  contextItems = [],
  ids,
  sources,
  claimBindings,
  testId,
}: {
  contextItems?: readonly PublicMedicineContextItem[]
  ids: string[]
  sources: Map<string, EvidenceSourceView>
  claimBindings?: MechanismStepView['sourceClaimBindings']
  testId?: string
}) {
  const linked = ids.flatMap((id) => {
    const source = sources.get(id)
    return source ? [source] : []
  })
  if (linked.length === 0) return null

  return (
    <ul
      className="mt-3 flex min-w-0 flex-wrap gap-x-3 gap-y-1"
      aria-label="Sources linked to this statement"
      data-testid={testId}
    >
      {linked.map((source) => (
        <li key={source.id} className="min-w-0 max-w-full">
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
                >
                  {binding.relationship === 'SUPPORTS'
                    ? 'Supports'
                    : binding.relationship === 'QUALIFIES'
                      ? 'Adds context'
                      : 'Contradicts'}
                  :{' '}
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
      ))}
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
    { annotate: true, label: 'Measurement named in the record', value: detail.measuredMetric },
    { annotate: true, label: 'Assumption named in the record', value: detail.inferredClaim },
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
          These fields come from the older medicine-wide audit. They have not been linked to one
          specific question or passed the newer source-and-record checks.
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

function advancedEvidenceHeading(dossier: MedicineDossierViewModel): string {
  if (dossier.bindingState === 'legacy_record') return 'What the older record is based on'

  const status = dossier.selectedProgrammeStatus.toUpperCase()
  if (status === 'STOPPED' || status === 'WITHDRAWN') {
    return 'What the studies and sources showed before the research stopped'
  }
  if (status === 'APPROVED' || status === 'COMPLETED') {
    return 'How reviewers reached this answer'
  }
  if (status === 'PLANNED' || status === 'RECRUITING' || status === 'ACTIVE') {
    return 'What is known so far'
  }
  return 'How reviewers reached this answer'
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
  return `${name} ${action}${independent ? ' independently' : ''} on ${formatPublicDate(reviewedAt)}.`
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
  return 'Count type not recorded'
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

function publicStudyName(study: StudyView): string | undefined {
  const storedText = study.title ?? study.id
  return storedText.match(/\b(?:ORION|VICTORION)(?:-[A-Z0-9]+)+\b/iu)?.[0]
}

function publicStudyNamesInText(values: readonly string[]): string[] {
  const seen = new Set<string>()
  const names: string[] = []
  for (const value of values) {
    for (const match of value.matchAll(/\b(?:ORION|VICTORION)(?:-[A-Z0-9]+)+\b/giu)) {
      const name = match[0]
      const key = name.toLocaleLowerCase('en-US')
      if (seen.has(key)) continue
      seen.add(key)
      names.push(name)
    }
  }
  return names
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
  const displayTitle = study.title ?? legacyNamedRegistry?.[1]?.trim() ?? 'Recorded study'
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

  return (
    <article className="min-w-0 rounded-2xl bg-white p-5">
      <div className="flex min-w-0 flex-col items-start justify-between gap-3 sm:flex-row">
        <div className="min-w-0">
          <h4 className="[overflow-wrap:anywhere] text-base font-bold leading-6 text-[#1D1D1F]">
            <AnnotatedMedicineText
              as="span"
              text={displayTitle}
              contexts={
                explainStudyName ? medicineTextContextMatches(displayTitle, [studyNameContext]) : []
              }
            />
          </h4>
          <dl
            className="mt-2 flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-xs leading-5 text-[#6E6E73]"
            data-testid="study-design-metadata"
          >
            <div className="flex min-w-0 gap-1">
              <dt>{nctNumber ? 'ClinicalTrials.gov study number:' : 'Study record:'}</dt>
              <dd className="break-all font-semibold text-[#424245]">
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
              <div className="flex min-w-0 gap-1">
                <dt>Study status:</dt>
                <dd className="break-words font-semibold text-[#424245]">
                  <AnnotatedMedicineText
                    as="span"
                    contexts={medicineTextContextMatches(study.status, contextItems)}
                    text={study.status}
                  />
                </dd>
              </div>
            )}
            {study.phase && (
              <div className="flex min-w-0 gap-1">
                <dt>Phase:</dt>
                <dd className="break-words font-semibold text-[#424245]">
                  <AnnotatedMedicineText
                    as="span"
                    contexts={medicineTextContextMatches(phaseMeaning ?? study.phase, contextItems)}
                    text={phaseMeaning ?? study.phase}
                  />
                </dd>
              </div>
            )}
            {study.studyType && (
              <div className="flex min-w-0 gap-1">
                <dt>Study type:</dt>
                <dd className="break-words font-semibold text-[#424245]">
                  <AnnotatedMedicineText
                    as="span"
                    contexts={medicineTextContextMatches(study.studyType, contextItems)}
                    text={study.studyType}
                  />
                </dd>
              </div>
            )}
          </dl>
        </div>
        {hasResult ? (
          state === 'measured' ? (
            <span className="inline-flex shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold leading-5 text-emerald-800">
              Result available
            </span>
          ) : (
            <StatusBadge state={state} />
          )
        ) : (
          <span className="inline-flex shrink-0 rounded-full border border-black/[0.08] bg-[#F5F5F7] px-2.5 py-1 text-xs font-semibold leading-5 text-[#6E6E73]">
            No result on this page
          </span>
        )}
      </div>

      {study.result && (
        <div className="mt-4 rounded-2xl bg-blue-50 p-4">
          <p className="text-xs font-semibold text-[#0066CC]">What researchers found</p>
          <AnnotatedMedicineText
            className="mt-1 [overflow-wrap:anywhere] text-base font-semibold leading-6 text-[#1D1D1F]"
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
              ? 'Statistical test only (size of the change not recorded)'
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
                  />
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </article>
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
          {isLegacy ? 'From the older medicine record' : 'The results that matter here'}
        </Eyebrow>
        <h3 id="outcomes-heading" className="text-xl font-bold text-[#1D1D1F]">
          {isLegacy
            ? 'What the older record reports'
            : 'What was measured and what is still uncertain'}
        </h3>
        <p className="text-sm leading-6 text-[#6E6E73]">
          {isLegacy
            ? 'These are older medicine-wide notes. They have not been re-checked for this one use of the medicine.'
            : 'Measured means the study recorded it directly. Inferred means the sources point to it, but the study did not measure it directly. Unknown means the available sources do not answer it yet.'}
        </p>
      </div>
      <ul className="grid gap-2.5">
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
            <li key={outcome.id} className="min-w-0 space-y-3 rounded-2xl bg-white p-5">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-5 text-[#6E6E73]">
                    {isLegacy ? (outcome.legacyGroupLabel ?? 'Older note') : 'Reported result'}
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
              <SourceLinks contextItems={contextItems} ids={outcome.sourceIds} sources={sources} />
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

export function MedicineDossierV2({ dossier, initialSaved = false }: MedicineDossierV2Props) {
  const isPublishedProgramme = dossier.bindingState === 'published_programme'
  const isUnpublishedProgramme = dossier.bindingState === 'programme_unpublished'
  const sourceById = new Map(dossier.sources.map((source) => [source.id, source]))
  const mechanismEntries = [
    ['Where in the body?', dossier.mechanismSummary.where],
    ['What does it tell the body to do?', dossier.mechanismSummary.change],
    ['What did researchers actually measure?', dossier.mechanismSummary.observed],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))
  const suppliedFirstReadTerms = medicineTextContextMatches(
    dossier.readerSummary.takeaway,
    dossier.readerSummary.terms,
  ).map(({ context }) => context)
  const firstReadTerms = dedupePublicMedicineContextItems(
    [
      ...detectPublicMedicineContextItems([dossier.readerSummary.takeaway]),
      ...suppliedFirstReadTerms,
    ],
    5,
  )
  const firstReadContextMatches = medicineTextContextMatches(
    dossier.readerSummary.takeaway,
    firstReadTerms,
  )
  const structuredContextTerms = [
    ...dossier.evidenceNodes.flatMap((node) =>
      (node.claims ?? []).flatMap((claim) => [
        claim.endpointHierarchy ? endpointHierarchyContextItem(claim.endpointHierarchy) : undefined,
        claim.outcomeType ? outcomeTypeContextItem(claim.outcomeType) : undefined,
      ]),
    ),
    ...dossier.studies.flatMap((study) => [
      study.endpointHierarchy ? endpointHierarchyContextItem(study.endpointHierarchy) : undefined,
      ...(study.interpretability ?? []).map((assessment) =>
        studyReviewContextItem(assessment.question, assessment.professionalTerm),
      ),
    ]),
    ...dossier.keyOutcomes.flatMap((outcome) => [
      outcome.endpointHierarchy
        ? endpointHierarchyContextItem(outcome.endpointHierarchy)
        : undefined,
      outcome.outcomeType ? outcomeTypeContextItem(outcome.outcomeType) : undefined,
    ]),
  ]
  const publicDossierText = collectPublicMedicineText({
    readerSummary: dossier.readerSummary,
    mechanismSummary: dossier.mechanismSummary,
    mainLimitation: dossier.mainLimitation,
    evidenceNodes: dossier.evidenceNodes,
    studies: dossier.studies,
    keyOutcomes: dossier.keyOutcomes,
    mechanismSteps: dossier.mechanismSteps,
    timelineEvents: dossier.timelineEvents,
    conclusion: dossier.conclusion,
    medicineRecord: dossier.medicineRecord,
    sources: dossier.sources,
  })
  const dossierStudyNameTerms = dedupePublicMedicineContextItems([
    ...dossier.studies.flatMap((study) => {
      const name = publicStudyName(study)
      return name ? [publicStudyNameContextItem(name)] : []
    }),
    ...publicStudyNamesInText(publicDossierText).map(publicStudyNameContextItem),
  ])
  const advancedContextItems = dedupePublicMedicineContextItems([
    ...dossier.readerSummary.terms,
    ...dossierStudyNameTerms,
    ...structuredContextTerms,
    ...detectPublicMedicineContextItems(publicDossierText),
  ])
  const exactWordingContextMatches = dossier.readerSummary.exactText
    ? medicineTextContextMatches(dossier.readerSummary.exactText, advancedContextItems)
    : []
  const hasAdvancedEvidence =
    dossier.evidenceNodes.length > 0 ||
    dossier.studies.length > 0 ||
    dossier.keyOutcomes.length > 0 ||
    dossier.mechanismSteps.length > 0 ||
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
  const recordedStudyDesignContextItems = dedupePublicMedicineContextItems([
    ...advancedContextItems,
    ...detectPublicMedicineContextItems(
      recordedStudyPhases.map((phase) => `${phase} — testing stage`),
    ),
  ])
  const hasMedicineContext = hasMedicineRecordContext(dossier.medicineRecord)
  const statusBadgeText =
    dossier.statusBadge.kind === 'medicine_approval'
      ? `Approval status: ${publicApprovalStatusLabel(dossier.statusBadge.value)}`
      : `Research status: ${readableStoredLabel(dossier.statusBadge.value)}`
  const sectionLinks = [
    dossier.keyOutcomes.length > 0 ? ['Results', 'key-outcomes'] : null,
    dossier.evidenceNodes.length > 0
      ? [
          dossier.bindingState === 'legacy_record'
            ? 'Older evidence notes'
            : 'How the evidence connects',
          'evidence-chain',
        ]
      : null,
    dossier.studies.length > 0 ? ['Study numbers', 'evidence-depth'] : null,
    dossier.studies.length > 0 ? ['Study details', 'studies'] : null,
    dossier.mechanismSteps.length > 0 ? ['How it works', 'mechanism-map'] : null,
    recordedTimeline.length > 0 ? ['Timeline', 'development-timeline'] : null,
    ['Sources & review', 'sources-review'],
  ].filter((entry): entry is [string, string] => entry !== null)

  return (
    <div className="min-h-screen min-w-0 bg-[#F5F5F7] px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
      <article className="mx-auto w-full max-w-[760px] space-y-5">
        <header className="space-y-2 pb-1">
          <Eyebrow tone="blue">Medicine summary</Eyebrow>
          <h1 className="break-words text-[34px] font-bold leading-[1.08] tracking-[-0.035em] text-[#1D1D1F] sm:text-[44px]">
            {dossier.name}
          </h1>
          {dossier.tradeName && (
            <AnnotatedMedicineText
              className="break-words text-base font-medium text-[#6E6E73]"
              contexts={medicineTextContextMatches(dossier.tradeName, advancedContextItems)}
              text={dossier.tradeName}
            />
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="max-w-full break-words rounded-full bg-[#F5F5F7] px-2.5 py-1 text-xs font-semibold leading-5 text-[#424245]">
              <AnnotatedMedicineText
                as="span"
                contexts={medicineTextContextMatches(statusBadgeText, advancedContextItems)}
                text={statusBadgeText}
              />
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E6E73]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isPublishedProgramme
                    ? 'bg-emerald-600'
                    : isUnpublishedProgramme
                      ? 'bg-amber-600'
                      : 'bg-[#0071E3]'
                }`}
                aria-hidden="true"
              />
              {isPublishedProgramme
                ? 'Reviewed answer'
                : isUnpublishedProgramme
                  ? 'Research identified'
                  : 'Older record'}
            </span>
          </div>
          <SaveMedicineButton medicineSlug={dossier.slug} initialSaved={initialSaved} />
        </header>

        <section
          aria-labelledby="programme-scope-heading"
          className="rounded-2xl border border-black/[0.09] bg-white px-4 py-4 sm:px-5"
        >
          <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <Eyebrow>What is this medicine being used or studied for?</Eyebrow>
              <h2 id="programme-scope-heading" className="sr-only">
                Use being studied
              </h2>
              <AnnotatedMedicineText
                className="break-words text-sm font-semibold leading-5 text-[#1D1D1F] sm:text-[15px]"
                contexts={medicineTextContextMatches(
                  dossier.selectedProgrammeLabel,
                  advancedContextItems,
                )}
                text={dossier.selectedProgrammeLabel}
                testId="selected-use-question"
              />
              <p className="text-sm leading-6 text-[#6E6E73]">
                {isPublishedProgramme
                  ? 'This answer covers only this use and these people. Other uses can have different answers.'
                  : isUnpublishedProgramme
                    ? 'RNAWiki has found a specific use and its studies, but reviewers have not published an answer yet.'
                    : 'This older record describes the medicine as a whole. It is not separated by the problem being treated, the people, the dose or the studies.'}
              </p>
            </div>
            {dossier.programmes.length > 1 && (
              <details className="group relative w-full sm:w-auto sm:shrink-0">
                <summary
                  aria-label="Change the question this page answers"
                  className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-1.5 rounded-full bg-blue-50 px-3 text-sm font-semibold text-[#0066CC] hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
                >
                  Change
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-open:rotate-90 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </summary>
                <div className="absolute left-0 z-20 mt-2 w-64 max-w-[calc(100vw-4rem)] rounded-2xl border border-black/[0.1] bg-white p-2 shadow-xl sm:left-auto sm:right-0">
                  <p className="px-3 pb-1 pt-2 font-mono text-xs uppercase tracking-wide text-[#6E6E73]">
                    Choose another question
                  </p>
                  <p className="px-3 pb-2 text-sm leading-6 text-[#6E6E73]">
                    Each option covers a particular medical use, group of people, dose and set of
                    studies.
                  </p>
                  <ul
                    className="max-h-72 overflow-y-auto"
                    aria-label="Other questions about this medicine"
                  >
                    {dossier.programmes.map((programme) => {
                      const content = (
                        <>
                          <span className="block break-words text-sm font-semibold leading-5 text-[#1D1D1F]">
                            <AnnotatedMedicineText
                              as="span"
                              contexts={medicineTextContextMatches(
                                programme.label,
                                advancedContextItems,
                              )}
                              text={programme.label}
                            />
                          </span>
                          <span className="mt-0.5 block text-xs leading-5 text-[#6E6E73]">
                            Research status: {readableStoredLabel(programme.status)}
                            {programme.selected ? ' · Selected' : ''}
                          </span>
                        </>
                      )

                      return (
                        <li key={programme.id}>
                          {programme.href ? (
                            <Link
                              href={programme.href}
                              aria-current={programme.selected ? 'page' : undefined}
                              className={`block min-h-11 rounded-xl px-3 py-2 hover:bg-[#F5F5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] ${
                                programme.selected ? 'bg-blue-50' : ''
                              }`}
                            >
                              {content}
                            </Link>
                          ) : (
                            <span
                              aria-current={programme.selected ? 'page' : undefined}
                              className="block min-h-11 rounded-xl bg-blue-50 px-3 py-2"
                            >
                              {content}
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </details>
            )}
          </div>
        </section>

        <section
          aria-labelledby="plain-language-summary-heading"
          className="rounded-[22px] bg-white p-5 sm:p-7"
        >
          <Eyebrow tone={dossier.bindingState === 'legacy_record' ? 'amber' : 'blue'}>
            {dossier.bindingState === 'legacy_record'
              ? 'What the older record says'
              : dossier.bindingState === 'published_programme'
                ? 'What researchers found'
                : 'No reviewed answer yet'}
          </Eyebrow>
          <h2 id="plain-language-summary-heading" className="sr-only">
            {dossier.bindingState === 'legacy_record'
              ? 'What the older record says'
              : 'Plain-language answer'}
          </h2>
          {dossier.readerSummary.takeaway ? (
            <AnnotatedMedicineText
              className="mt-3 text-[17px] font-semibold leading-[1.48] tracking-[-0.018em] text-[#1D1D1F] sm:text-xl sm:leading-[1.5]"
              contexts={firstReadContextMatches}
              text={dossier.readerSummary.takeaway}
              testId="first-read-annotated-summary"
            />
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#6E6E73]">
              No reviewed plain-language answer has been published.
            </p>
          )}
          {firstReadContextMatches.length > 0 && (
            <p className="mt-3 text-xs leading-5 text-[#6E6E73]">
              Dotted phrases have plain explanations. Hover, focus or tap.
            </p>
          )}
          {dossier.readerSummary.exactText &&
            dossier.readerSummary.exactText !== dossier.readerSummary.takeaway && (
              <details className="group/exact mt-3 border-t border-black/[0.07] pt-2">
                <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                  Read the professional wording
                </summary>
                {exactWordingContextMatches.length > 0 && (
                  <p className="pb-1 text-xs leading-5 text-[#6E6E73]">
                    The original wording is kept below. Dotted phrases have plain explanations.
                    Hover, focus or tap.
                  </p>
                )}
                <AnnotatedMedicineText
                  className="pb-1 [overflow-wrap:anywhere] text-sm leading-6 text-[#424245]"
                  contexts={exactWordingContextMatches}
                  text={dossier.readerSummary.exactText}
                  testId="exact-wording-annotated"
                />
              </details>
            )}
        </section>

        {dossier.mainLimitation && (
          <section
            aria-labelledby="limitation-heading"
            className="rounded-[20px] bg-amber-50 px-5 py-5 sm:px-6"
          >
            <Eyebrow tone="amber">What this does not tell us yet</Eyebrow>
            <h2 id="limitation-heading" className="sr-only">
              Main evidence limitation
            </h2>
            <AnnotatedMedicineText
              className="mt-2 text-sm font-semibold leading-[1.55] text-[#1D1D1F] sm:text-base"
              contexts={medicineTextContextMatches(dossier.mainLimitation, advancedContextItems)}
              text={dossier.mainLimitation}
            />
          </section>
        )}

        {mechanismEntries.length > 0 && (
          <details
            className="group/mechanism overflow-hidden rounded-[20px] border border-black/[0.08] bg-white"
            data-testid="first-read-mechanism"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm font-semibold text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071E3] [&::-webkit-details-marker]:hidden">
              How does it work?
              <span
                className="text-lg font-normal text-[#0066CC] transition-transform group-open/mechanism:rotate-45 motion-reduce:transition-none"
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <section
              aria-label="How the medicine is intended to work"
              className="grid gap-2.5 border-t border-black/[0.07] bg-[#F5F5F7] p-3 lg:grid-cols-3"
            >
              {mechanismEntries.map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-2xl bg-white px-4 py-4 sm:px-5">
                  <Eyebrow>{label}</Eyebrow>
                  <AnnotatedMedicineText
                    className="mt-1.5 [overflow-wrap:anywhere] text-sm font-semibold leading-6 text-[#1D1D1F]"
                    contexts={medicineTextContextMatches(value, advancedContextItems)}
                    text={value}
                  />
                </div>
              ))}
            </section>
          </details>
        )}

        <AdvancedEvidenceDisclosure>
          <div className="mt-12 space-y-8 border-t border-black/[0.08] pt-9">
            <header className="space-y-2">
              <Eyebrow tone="blue">Behind the answer</Eyebrow>
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-[#1D1D1F]">
                {advancedEvidenceHeading(dossier)}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[#6E6E73]">
                Start with the result, then open the study details, source links and reviewer record
                only when you need them.
              </p>
            </header>

            <nav
              aria-label="Dossier sections"
              className="flex flex-wrap gap-2 text-sm font-semibold"
            >
              {sectionLinks.map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-black/[0.08] bg-white px-3.5 py-2 text-[#424245] hover:text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
                >
                  {label}
                </a>
              ))}
            </nav>

            <MedicineContextDisclosure
              label="Explain study words"
              items={advancedContextItems}
              variant="section"
              testId="advanced-study-language"
            />

            {dossier.conclusion && (
              <section
                aria-labelledby="programme-conclusion-heading"
                className="space-y-6 rounded-[22px] bg-white p-5 sm:p-7"
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
                    ['Questions the studies did not answer', dossier.conclusion.whatRemainsUnknown],
                  ].map(([heading, entries]) => (
                    <div key={heading as string} className="min-w-0">
                      <h4 className="text-sm font-bold text-[#1D1D1F]">{heading as string}</h4>
                      {(entries as string[]).length > 0 ? (
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-[#6E6E73]">
                          {(entries as string[]).map((entry) => (
                            <li key={entry} className="break-words">
                              <AnnotatedMedicineText
                                as="span"
                                contexts={medicineTextContextMatches(entry, advancedContextItems)}
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
                          {dossier.conclusion.conditionsThatWouldChangeVerdict.map((condition) => (
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
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <footer className="border-t border-black/[0.07] pt-5 text-sm leading-6 text-[#6E6E73]">
                  <p>
                    Authored by{' '}
                    <span className="font-semibold text-[#1D1D1F]">
                      {dossier.conclusion.authorName}
                    </span>
                  </p>
                  {dossier.conclusion.reviewers.length > 0 && (
                    <ul className="mt-2 space-y-1" aria-label="Conclusion review records">
                      {dossier.conclusion.reviewers.map((reviewer) => (
                        <li key={reviewer.id} className="min-w-0 rounded-xl bg-[#F5F5F7] p-3">
                          <p className="break-words text-[#424245]">
                            {reviewerDecisionSentence(reviewer)}
                          </p>
                          {reviewer.expertiseTags.length > 0 && (
                            <p className="mt-1 break-words text-sm leading-6">
                              <span className="font-semibold text-[#424245]">
                                Relevant review background:{' '}
                              </span>
                              {reviewer.expertiseTags
                                .map((tag) => reviewerExpertiseLabel[tag])
                                .join(' · ')}
                            </p>
                          )}
                          {reviewer.orcid && (
                            <a
                              href={`https://orcid.org/${reviewer.orcid}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Open ${reviewer.name}’s ORCID researcher identity record in a new tab`}
                              className="mt-1 inline-flex min-h-11 max-w-full items-center gap-1 break-all text-sm font-semibold text-[#0066CC] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
                            >
                              Researcher identity record (ORCID) {reviewer.orcid}
                              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                              <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {(dossier.conclusion.conflictsOfInterest ||
                    dossier.conclusion.reviewers.some(
                      (reviewer) => reviewer.conflictsOfInterest,
                    )) && (
                    <details className="mt-2">
                      <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-[#0066CC]">
                        Conflicts of interest
                      </summary>
                      <p className="mb-1 text-sm leading-6 text-[#6E6E73]">
                        Financial, work, or personal ties that could affect someone’s judgment.
                      </p>
                      {dossier.conclusion.conflictsOfInterest && (
                        <p className="break-words">
                          Author:{' '}
                          <AnnotatedMedicineText
                            as="span"
                            contexts={medicineTextContextMatches(
                              dossier.conclusion.conflictsOfInterest,
                              advancedContextItems,
                            )}
                            text={dossier.conclusion.conflictsOfInterest}
                          />
                        </p>
                      )}
                      {dossier.conclusion.reviewers
                        .filter((reviewer) => reviewer.conflictsOfInterest)
                        .map((reviewer) => (
                          <p key={reviewer.id} className="break-words">
                            {reviewer.name}:{' '}
                            <AnnotatedMedicineText
                              as="span"
                              contexts={medicineTextContextMatches(
                                reviewer.conflictsOfInterest ?? '',
                                advancedContextItems,
                              )}
                              text={reviewer.conflictsOfInterest ?? ''}
                            />
                          </p>
                        ))}
                    </details>
                  )}
                </footer>
              </section>
            )}

            <KeyOutcomesSection
              contextItems={advancedContextItems}
              dossier={dossier}
              sources={sourceById}
            />

            {dossier.evidenceNodes.length > 0 && (
              <section
                id="evidence-chain"
                aria-labelledby="evidence-chain-heading"
                className="scroll-mt-24 space-y-4"
              >
                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-1">
                    <Eyebrow tone={dossier.bindingState === 'legacy_record' ? 'amber' : 'blue'}>
                      {dossier.bindingState === 'legacy_record'
                        ? 'From the older medicine record'
                        : 'How the evidence connects'}
                    </Eyebrow>
                    <h3 id="evidence-chain-heading" className="text-xl font-bold text-[#1D1D1F]">
                      {dossier.bindingState === 'legacy_record'
                        ? 'Older evidence notes'
                        : 'Which steps actually happened?'}
                    </h3>
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wide text-[#6E6E73]">
                    {dossier.bindingState === 'published_programme'
                      ? 'This use only'
                      : isUnpublishedProgramme
                        ? 'No reviewed answer yet'
                        : 'Older medicine record'}
                  </span>
                </div>
                {dossier.bindingState === 'legacy_record' && (
                  <p className="max-w-2xl text-sm leading-6 text-[#6E6E73]">
                    These are separate notes from the older medicine-wide record. They are not an
                    ordered chain and have not been reviewed for this specific use.
                  </p>
                )}
                {canonicalEvidenceChain && (
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
                                : 'The available sources do not answer this step yet.'}
                        </>
                      ) : (
                        <span className="font-semibold">
                          Reviewed sources support every step shown here.
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {dossier.evidenceNodes.length > 0 ? (
                  dossier.bindingState === 'legacy_record' ? (
                    <ul className="grid gap-3 sm:grid-cols-2">
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
                            className={`relative min-w-0 rounded-2xl border bg-white p-4 sm:p-5 ${style.border}`}
                          >
                            {index < dossier.evidenceNodes.length - 1 && (
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -bottom-[11px] left-6 h-[11px] w-px bg-black/15"
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
                                <SourceLinks
                                  contextItems={advancedContextItems}
                                  ids={node.sourceIds}
                                  sources={sourceById}
                                />
                                {node.claims && node.claims.length > 0 && (
                                  <details className="pt-1">
                                    <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                                      View evidence details
                                    </summary>
                                    <ul className="space-y-3 pb-1">
                                      {node.claims.map((claim) => (
                                        <li
                                          key={claim.id}
                                          className="min-w-0 rounded-xl bg-[#F5F5F7] p-3"
                                        >
                                          <ClaimNatureBadge nature={claim.nature} />
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
                                                  <dt>Was this a main or additional result?</dt>
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
                                              <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC]">
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
                                          />
                                        </li>
                                      ))}
                                    </ul>
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
                    “Not answered” does not mean failure. It means the study did not measure this
                    step or there is not enough information. We only say a step did not happen when
                    reviewers found sources pointing against it.
                  </p>
                )}
              </section>
            )}

            {dossier.studies.length > 0 && (
              <section
                id="evidence-depth"
                aria-labelledby="evidence-depth-heading"
                className="scroll-mt-24 space-y-4 rounded-[22px] bg-white p-5 sm:p-7"
              >
                <div className="space-y-1">
                  <Eyebrow tone={dossier.bindingState === 'legacy_record' ? 'amber' : 'blue'}>
                    {dossier.bindingState === 'legacy_record'
                      ? 'Older study numbers'
                      : 'Study numbers at a glance'}
                  </Eyebrow>
                  <h3 id="evidence-depth-heading" className="text-xl font-bold text-[#1D1D1F]">
                    {dossier.bindingState === 'legacy_record'
                      ? 'Recorded study details'
                      : 'How many studies have results here?'}
                  </h3>
                </div>
                <dl className="grid gap-4 text-sm sm:grid-cols-3">
                  <div className="min-w-0 rounded-2xl bg-[#F5F5F7] p-4">
                    <dt className="leading-5 text-[#6E6E73]">Studies with a result on this page</dt>
                    <dd className="mt-1 text-lg font-bold text-[#1D1D1F]">
                      {studiesWithResults.length.toLocaleString()}
                    </dd>
                  </div>
                  <div className="min-w-0 rounded-2xl bg-[#F5F5F7] p-4">
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
                        'No participant count is linked to a recorded result'
                      )}
                    </dd>
                  </div>
                  <div className="min-w-0 rounded-2xl bg-[#F5F5F7] p-4">
                    <dt className="leading-5 text-[#6E6E73]">
                      Still running or no result on this page
                    </dt>
                    <dd className="mt-1 text-lg font-bold text-[#1D1D1F]">
                      {studiesWithoutResults.length.toLocaleString()}
                    </dd>
                  </div>
                </dl>
                <p className="text-sm leading-6 text-[#6E6E73]">
                  These counts show how much information is on this page. They do not by themselves
                  prove that the medicine is safe or helpful. Studies without a result are not
                  included in the number of people above.
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
                      ? 'Older study record'
                      : 'What each study can tell us'}
                  </Eyebrow>
                  <h3 id="studies-heading" className="text-xl font-bold text-[#1D1D1F]">
                    {dossier.bindingState === 'legacy_record'
                      ? 'Recorded study details'
                      : 'Results, limits and how each study was run'}
                  </h3>
                  <p className="text-sm leading-6 text-[#6E6E73]">
                    Studies with a reported result are separated from ongoing studies and records
                    where no result is available.
                  </p>
                </div>
                {studiesWithResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-base font-semibold text-[#1D1D1F]">
                      Studies with a result on this page
                    </h4>
                    <div className="grid gap-3 lg:grid-cols-2">
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
                    <div className="grid gap-3 border-t border-black/[0.07] py-4 lg:grid-cols-2">
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

            {dossier.mechanismSteps.length > 0 && (
              <section
                id="mechanism-map"
                data-testid="programme-mechanism-map"
                aria-labelledby="mechanism-heading"
                className="scroll-mt-24 space-y-4"
              >
                <div className="space-y-1">
                  <Eyebrow tone={dossier.bindingState === 'legacy_record' ? 'amber' : 'blue'}>
                    {dossier.bindingState === 'legacy_record'
                      ? 'Older medicine-wide record'
                      : 'Step-by-step explanation'}
                  </Eyebrow>
                  <h3 id="mechanism-heading" className="text-xl font-bold text-[#1D1D1F]">
                    How the medicine is expected to work
                  </h3>
                  <p className="text-sm leading-6 text-[#6E6E73]">
                    {dossier.bindingState === 'legacy_record'
                      ? 'These older steps have not been linked to a specific use, reviewed claim, or saved source version.'
                      : 'Each card shows one expected step. Its label says whether people, laboratory work, or neither has shown that step. Human reviewers decide what the science means.'}
                  </p>
                </div>
                {dossier.mechanismSteps.length > 0 ? (
                  <ol
                    className={`grid min-w-0 gap-3 ${
                      dossier.mechanismSteps.length === 1
                        ? 'lg:grid-cols-1'
                        : dossier.mechanismSteps.length === 2
                          ? 'lg:grid-cols-2'
                          : dossier.mechanismSteps.length === 3
                            ? 'lg:grid-cols-3'
                            : 'lg:grid-cols-2'
                    }`}
                    aria-label="Ordered mechanism stages"
                  >
                    {dossier.mechanismSteps.map((step, index) => (
                      <li
                        key={step.id}
                        className="relative flex min-w-0 gap-3 rounded-2xl border border-black/[0.08] bg-white p-4"
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
                          {step.technicalDetail && (
                            <details className="pt-1">
                              <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                                Technical detail
                              </summary>
                              <AnnotatedMedicineText
                                className="break-words text-sm leading-6 text-[#6E6E73]"
                                contexts={medicineTextContextMatches(
                                  step.technicalDetail,
                                  advancedContextItems,
                                )}
                                text={step.technicalDetail}
                                testId="mechanism-technical-detail"
                              />
                            </details>
                          )}
                          <SourceLinks
                            contextItems={advancedContextItems}
                            ids={step.sourceIds}
                            sources={sourceById}
                            claimBindings={step.sourceClaimBindings}
                            testId="mechanism-stage-source-links"
                          />
                        </div>
                        {index < dossier.mechanismSteps.length - 1 && (
                          <>
                            <span
                              className="absolute -bottom-3 left-5 h-3 border-l border-[#0071E3]/35 lg:hidden"
                              aria-hidden="true"
                            />
                            {dossier.mechanismSteps.length <= 3 && (
                              <ArrowRight
                                className="absolute -right-3 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-[#F5F5F7] text-[#0071E3] lg:block"
                                aria-hidden="true"
                              />
                            )}
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <EmptyEvidence>No reviewed mechanism map has been published.</EmptyEvidence>
                )}
              </section>
            )}

            <DevelopmentTimeline
              contextItems={advancedContextItems}
              events={recordedTimeline}
              sources={sourceById}
            />

            <section
              id="sources-review"
              aria-labelledby="sources-heading"
              className="scroll-mt-24 space-y-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                  <Eyebrow tone="blue">Sources & review</Eyebrow>
                  <h3 id="sources-heading" className="text-xl font-bold text-[#1D1D1F]">
                    Where the information came from
                  </h3>
                  <p className="max-w-xl text-sm leading-6 text-[#6E6E73]">
                    “Saved” is when RNAWiki stored a copy. “Last checked” is when someone most
                    recently confirmed the link. Exact record details are available for professional
                    review.
                  </p>
                </div>
                <span
                  className={`max-w-full break-words rounded-full border px-2.5 py-1 text-xs font-semibold leading-5 ${freshnessStyle[dossier.freshness]}`}
                >
                  {dossier.freshnessLabel}
                </span>
              </div>

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
                          ? 'A use has been identified, but no reviewed conclusion is public. Older medicine-wide text is not treated as evidence for this use.'
                          : 'This older record has not passed the newer source-and-review checks. Those checks require each important statement to be linked to one use, an exact saved source, and a reviewed version.'}
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

              {dossier.sources.length > 0 ? (
                <ul className="divide-y divide-black/[0.06] rounded-2xl bg-white px-5">
                  {dossier.sources.map((source) => (
                    <li key={source.id} className="py-4">
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

              <div className="rounded-2xl bg-[#1D1D1F] p-5 text-white">
                <div className="flex items-start gap-3">
                  <History className="mt-0.5 h-4 w-4 shrink-0 text-[#6E6E73]" aria-hidden="true" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">
                      {dossier.bindingState === 'published_programme'
                        ? 'How this version was reviewed'
                        : 'Record history'}
                    </h4>
                    {dossier.bindingState === 'published_programme' && (
                      <p className="text-sm leading-6 text-white/70">
                        Reviewers connect every important statement to the exact source they read.
                        They record whether it supports the answer, points against it, or simply
                        adds context before an updated answer is published.
                      </p>
                    )}
                    {(dossier.review.revisionId ||
                      dossier.review.engineVersion ||
                      dossier.review.inputDigest ||
                      dossier.review.reviewedAt ||
                      dossier.review.reviewerLabel) && (
                      <details>
                        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-white">
                          Technical record details
                        </summary>
                        <div className="flex min-w-0 flex-wrap gap-x-3 gap-y-1 font-mono text-xs leading-5 text-white/60">
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
                      className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-white hover:underline"
                    >
                      See what changed on this page
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {dossier.bindingState === 'legacy_record' ? (
              <LegacyIdentityCorrectionActions
                slug={dossier.slug}
                name={dossier.name}
                tradeName={dossier.tradeName}
              />
            ) : (
              <DossierContributionActions dossier={dossier} />
            )}

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

        <CommunityCommentary
          medicineSlug={dossier.slug}
          initialNotes={dossier.medicineRecord.communityNotes}
        />
      </article>
    </div>
  )
}
