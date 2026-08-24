'use client'

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileDiff,
  Link2,
  Network,
  PencilLine,
  Save,
  Scale,
  Send,
  X,
} from 'lucide-react'
import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'

import { useApp } from '@/components/app-context'
import { accountScopeKey, isCurrentAccountRequest } from '@/lib/account-request-scope'
import type {
  ContributionAdjudicationView,
  ContributionReviewStateView,
  ContributionReviewView,
  PublicContributionReviewAudit,
} from '@/lib/contributions/review-types'
import {
  contributionFieldValueKind,
  type ContributionSelectedField,
  type ContributionValueKind,
} from '@/lib/contributions/types'
import {
  EVIDENCE_STATES,
  PROGRAMME_STATUSES,
  STOPPING_REASON_CATEGORIES,
  VERDICT_CONFIDENCE_LEVELS,
} from '@/lib/evidence/types'
import type {
  MedicineDossierViewModel,
  ProgrammeOptionView,
} from '@/lib/medicine-dossier-view-model'

type ContributionMode = 'CORRECTION' | 'VERDICT_CHALLENGE'
type DraftAction = 'save' | 'submit'

type ClaimNature =
  'MEASURED' | 'SPONSOR_REPORTED' | 'REGULATORY_FINDING' | 'RNAWIKI_JUDGEMENT' | 'UNKNOWN'

type SourceType =
  | 'CLINICAL_TRIAL_REGISTRY'
  | 'REGULATORY_RECORD'
  | 'REGULATORY_SAFETY_COMMUNICATION'
  | 'PEER_REVIEWED_PUBLICATION'
  | 'PUBLICATION_METADATA'
  | 'SPONSOR_DISCLOSURE'
  | 'MOLECULAR_DATABASE'
  | 'OTHER'
  | 'UNKNOWN'

interface FieldOption {
  value: string
  label: string
  currentValue: string
  valueType: 'text' | 'list' | 'enum'
  allowedValues: readonly string[]
}

interface ContributionContext {
  medicine: { id?: string; slug: string; name: string }
  programme: {
    id: string
    slug?: string
    title: string
    indication?: string | null
    status: string
  }
  currentVerdict?: {
    id?: string
    publicLabel?: string
    professionalLabel?: string
    oneSentenceReason?: string
    verdictCode?: string | null
  } | null
  evidenceNodes: Array<{
    id: string
    title?: string
    label?: string
    nodeType?: string
    state: string
    summary?: string
    plainSummary?: string | null
    professionalSummary?: string | null
    currentValues?: Record<string, string | string[] | null | undefined>
  }>
  currentValues?: Record<string, string | string[] | null | undefined>
  fieldOptions: Array<{
    value?: string
    path?: string
    key?: string
    label: string
    currentValue?: string | string[] | null
    current?: string | string[] | null
    valueType?: 'text' | 'list' | 'enum'
    allowedValues?: string[]
  }>
}

interface MachineCheck {
  code: string
  status: 'PASS' | 'WARN' | 'FAIL'
  message: string
}

interface MachineChecks {
  version: string
  passed: boolean
  checks: MachineCheck[]
}

interface ImpactSurface {
  dependentSurfaceType: string
  fieldPath: string
  evidenceNodeId?: string | null
  impactLevel: string
}

interface ContributionImpact {
  version: string
  matchedDependencyCount: number
  highestImpactLevel: string | null
  affectedClaimIds: string[]
  affectedSurfaces: ImpactSurface[]
  noDependencyMatch: boolean
}

interface ContributionDiff {
  field?: string
  label?: string
  before?: string | string[] | null
  after?: string | string[] | null
}

interface ContributionPreview {
  machineChecks?: MachineChecks
  impact?: ContributionImpact
  impactPreview?: ContributionImpact
  diff?: ContributionDiff[]
}

interface ContributionProposal {
  id: string
  programmeId?: string
  status: string
  proposalKey?: string
  revisionNumber?: number
  previousProposalId?: string | null
  proposalType?: ContributionMode
  selectedField?: string | null
  proposedText?: string | null
  proposedValue?: string | string[] | null
  source?: {
    type?: SourceType | null
    locator?: string | null
    identifier?: string | null
    reviewTaskId?: string | null
    reviewSnapshotId?: string | null
  } | null
  sourceType?: SourceType | null
  sourceLocator?: string | null
  sourceIdentifier?: string | null
  claimNature?: ClaimNature | null
  evidenceNodeId?: string | null
  proposedStoppedVerdict?: string | null
  reasoning?: string | null
  whatWasWrongOrMissing?: string | null
  affects?: 'DISPROVEN' | 'OPEN_QUESTIONS' | 'BOTH' | null
  conflictsOfInterest?: string | null
  conflictsOfInterestAttested?: boolean
  createdAt?: string
  updatedAt?: string
  machineChecks?: MachineChecks
  impact?: ContributionImpact
  impactPreview?: ContributionImpact
  diff?: ContributionDiff[]
  review?: PublicContributionReviewAudit | null
}

interface ContributionRevisionWorkspace {
  draft: ContributionProposal | null
  feedbackParent: ContributionProposal | null
}

export function isRevisableContributionReviewStatus(
  status: ContributionReviewStateView['status'],
): boolean {
  return status === 'CHANGES_REQUESTED' || status === 'REJECTED'
}

export function contributionRevisionWorkspace(
  proposals: ContributionProposal[],
  proposalType: ContributionMode,
): ContributionRevisionWorkspace {
  const matching = proposals.filter((proposal) => proposal.proposalType === proposalType)
  const draft = matching.find((proposal) => proposal.status === 'DRAFT') ?? null
  const byId = new Map(matching.map((proposal) => [proposal.id, proposal]))
  if (draft) {
    return {
      draft,
      feedbackParent: draft.previousProposalId
        ? (byId.get(draft.previousProposalId) ?? null)
        : null,
    }
  }

  const parentIds = new Set(
    matching.flatMap((proposal) =>
      proposal.previousProposalId ? [proposal.previousProposalId] : [],
    ),
  )
  const feedbackParent =
    matching.find(
      (proposal) =>
        proposal.status === 'SUBMITTED' &&
        !parentIds.has(proposal.id) &&
        proposal.review !== null &&
        proposal.review !== undefined &&
        isRevisableContributionReviewStatus(proposal.review.reviewState.status),
    ) ?? null

  return { draft: null, feedbackParent }
}

export function contributionsBoundToSourceTask(
  proposals: ContributionProposal[],
  taskId: string,
  snapshotId: string,
): ContributionProposal[] {
  return proposals.filter(
    (proposal) =>
      proposal.source?.reviewTaskId === taskId && proposal.source.reviewSnapshotId === snapshotId,
  )
}

interface ContributionApiResponse {
  context?: ContributionContext
  proposals?: ContributionProposal[]
  proposal?: ContributionProposal
  preview?: ContributionPreview
}

interface ApiFailureBody {
  error?: string
  details?: {
    preview?: ContributionPreview
    machineChecks?: MachineChecks
    impact?: ContributionImpact
    impactPreview?: ContributionImpact
    diff?: ContributionDiff[]
  }
}

interface CorrectionDraft {
  selectedField: string
  proposedText: string
  proposedValueText: string
  sourceType: SourceType
  sourceLocator: string
  sourceIdentifier: string
  sourceReviewTaskId: string
  sourceReviewSnapshotId: string
  claimNature: ClaimNature
  evidenceNodeId: string
  reasoning: string
  whatWasWrongOrMissing: string
  affects: 'DISPROVEN' | 'OPEN_QUESTIONS' | 'BOTH'
  technicalDetail: string
  conflictsOfInterest: string
  conflictsOfInterestAttested: boolean
}

interface ChallengeDraft {
  selectedField: string
  proposedText: string
  proposedValueText: string
  sourceType: SourceType
  sourceLocator: string
  sourceIdentifier: string
  claimNature: ClaimNature
  evidenceNodeId: string
  proposedStoppedVerdict: string
  reasoning: string
  whatWasWrongOrMissing: string
  affects: 'DISPROVEN' | 'OPEN_QUESTIONS' | 'BOTH'
  conflictsOfInterest: string
  conflictsOfInterestAttested: boolean
}

export interface DossierContributionActionsProps {
  dossier: Pick<
    MedicineDossierViewModel,
    | 'slug'
    | 'name'
    | 'programmes'
    | 'selectedProgrammeId'
    | 'selectedProgrammeLabel'
    | 'selectedProgrammeStatus'
    | 'bindingState'
    | 'verdict'
    | 'mainLimitation'
    | 'mechanismSummary'
    | 'evidenceNodes'
    | 'conclusion'
  >
}

const CLAIM_NATURE_OPTIONS: Array<{ value: ClaimNature; label: string }> = [
  { value: 'MEASURED', label: 'Directly measured' },
  { value: 'SPONSOR_REPORTED', label: 'Reported by the sponsor' },
  { value: 'REGULATORY_FINDING', label: 'A regulatory finding' },
  { value: 'RNAWIKI_JUDGEMENT', label: 'My interpretation' },
  { value: 'UNKNOWN', label: 'I am not sure' },
]

const SOURCE_TYPE_OPTIONS: Array<{ value: SourceType; label: string }> = [
  { value: 'CLINICAL_TRIAL_REGISTRY', label: 'Clinical trial registry' },
  { value: 'REGULATORY_RECORD', label: 'Regulatory record' },
  { value: 'REGULATORY_SAFETY_COMMUNICATION', label: 'Regulatory safety notice' },
  { value: 'PEER_REVIEWED_PUBLICATION', label: 'Peer-reviewed publication' },
  { value: 'PUBLICATION_METADATA', label: 'Publication database record' },
  { value: 'SPONSOR_DISCLOSURE', label: 'Sponsor disclosure' },
  { value: 'MOLECULAR_DATABASE', label: 'Molecular database' },
  { value: 'OTHER', label: 'Another public source' },
  { value: 'UNKNOWN', label: 'I am not sure' },
]

const STOPPED_VERDICT_OPTIONS = [
  {
    value: 'IDEA_FAILED',
    label: 'For this defined use, the biological idea did not hold up in an adequate test',
  },
  {
    value: 'MOLECULE_FAILED',
    label: 'This medicine did not work well enough for this use, without disproving the whole idea',
  },
  {
    value: 'TEST_UNANSWERED',
    label: 'The research stopped without answering its main question',
  },
]

function valueKindForField(
  field: string,
  declared?: FieldOption['valueType'],
): ContributionValueKind {
  if (field === 'verdict.verdictCode') return 'stoppedVerdict'
  if (declared) return declared
  return contributionFieldValueKind(field as ContributionSelectedField)
}

function enumReplacementOptions(field: string): readonly string[] {
  switch (field) {
    case 'programme.status':
      return PROGRAMME_STATUSES
    case 'programme.stoppingReasonCategory':
      return STOPPING_REASON_CATEGORIES
    case 'verdict.confidence':
      return VERDICT_CONFIDENCE_LEVELS
    case 'evidenceNode.state':
      return EVIDENCE_STATES
    default:
      return []
  }
}

export function splitStructuredList(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function replacementChannels(args: {
  kind: ContributionValueKind
  proposedText: string
  proposedValueText: string
  proposedStoppedVerdict: string
}): {
  proposedText: string | null
  proposedValue: string | string[] | null
  proposedStoppedVerdict: string | null
} {
  const listValue = splitStructuredList(args.proposedValueText)
  return {
    proposedText: args.kind === 'text' ? args.proposedText.trim() || null : null,
    proposedValue:
      args.kind === 'list'
        ? listValue.length > 0
          ? listValue
          : null
        : args.kind === 'enum'
          ? args.proposedValueText.trim() || null
          : null,
    proposedStoppedVerdict:
      args.kind === 'stoppedVerdict' ? args.proposedStoppedVerdict.trim() || null : null,
  }
}

function proposedDisplay(args: {
  kind: ContributionValueKind
  proposedText: string
  proposedValueText: string
  proposedStoppedVerdict: string
}): string {
  if (args.kind === 'text') return args.proposedText
  if (args.kind === 'list') return splitStructuredList(args.proposedValueText).join('\n')
  if (args.kind === 'enum') return humanStatus(args.proposedValueText)
  return humanStatus(args.proposedStoppedVerdict)
}

function currentDisplay(kind: ContributionValueKind, value: string): string {
  return kind === 'enum' || kind === 'stoppedVerdict' ? humanStatus(value) : value
}

const inputClass =
  'min-h-11 w-full rounded-xl border border-black/[0.12] bg-white px-3.5 py-2.5 text-sm text-[#1D1D1F] shadow-sm outline-none transition placeholder:text-[#6E6E73] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 disabled:cursor-not-allowed disabled:bg-[#F5F5F7] disabled:text-[#6E6E73]'
const labelClass = 'block text-xs font-semibold leading-5 text-[#1D1D1F]'
const hintClass = 'mt-1 text-[11px] leading-5 text-[#6E6E73]'

interface SourceTaskPrefill {
  taskId: string
  snapshotId: string
  sourceType: SourceType
  sourceLocator: string
  sourceIdentifier: string
  selectedField: string
}

const SOURCE_TYPE_VALUES = new Set<string>(SOURCE_TYPE_OPTIONS.map((option) => option.value))

export function sourceTaskPrefillFromSearch(search: string): SourceTaskPrefill | null {
  const params = new URLSearchParams(search)
  if (params.get('contribute') !== 'correction') return null
  const taskId = params.get('sourceTask')?.trim() ?? ''
  const snapshotId = params.get('sourceSnapshot')?.trim() ?? ''
  const sourceType = params.get('sourceType')?.trim() ?? ''
  const sourceLocator = params.get('sourceLocator')?.trim() ?? ''
  const sourceIdentifier = params.get('sourceIdentifier')?.trim() ?? ''
  const selectedField = params.get('sourceField')?.trim() ?? ''
  if (
    !taskId ||
    taskId.length > 64 ||
    !snapshotId ||
    snapshotId.length > 64 ||
    !SOURCE_TYPE_VALUES.has(sourceType) ||
    !sourceLocator ||
    sourceLocator.length > 2_000 ||
    !sourceIdentifier ||
    sourceIdentifier.length > 400
  ) {
    return null
  }
  try {
    const parsed = new URL(sourceLocator)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
  } catch {
    return null
  }
  return {
    taskId,
    snapshotId,
    sourceType: sourceType as SourceType,
    sourceLocator,
    sourceIdentifier,
    selectedField:
      selectedField.startsWith('programme.') || selectedField.startsWith('evidenceNode.')
        ? selectedField
        : '',
  }
}

/** A contribution write may have committed even if its browser response has not arrived yet. */
export function contributionDialogCloseDisabled(isSaving: boolean, isRevising: boolean): boolean {
  return isSaving || isRevising
}

function blankCorrectionForSourceTask(
  selectedField: string,
  prefill: SourceTaskPrefill | null,
): CorrectionDraft {
  const blank = blankCorrection(prefill?.selectedField || selectedField)
  if (!prefill) return blank
  return {
    ...blank,
    sourceType: prefill.sourceType,
    sourceLocator: prefill.sourceLocator,
    sourceIdentifier: prefill.sourceIdentifier,
    sourceReviewTaskId: prefill.taskId,
    sourceReviewSnapshotId: prefill.snapshotId,
  }
}

function blankCorrection(selectedField = ''): CorrectionDraft {
  return {
    selectedField,
    proposedText: '',
    proposedValueText: '',
    sourceType: 'UNKNOWN',
    sourceLocator: '',
    sourceIdentifier: '',
    sourceReviewTaskId: '',
    sourceReviewSnapshotId: '',
    claimNature: 'UNKNOWN',
    evidenceNodeId: '',
    reasoning: '',
    whatWasWrongOrMissing: '',
    affects: 'BOTH',
    technicalDetail: '',
    conflictsOfInterest: '',
    conflictsOfInterestAttested: false,
  }
}

function blankChallenge(): ChallengeDraft {
  return {
    selectedField: 'verdict.publicLabel',
    proposedText: '',
    proposedValueText: '',
    sourceType: 'UNKNOWN',
    sourceLocator: '',
    sourceIdentifier: '',
    claimNature: 'RNAWIKI_JUDGEMENT',
    evidenceNodeId: '',
    proposedStoppedVerdict: '',
    reasoning: '',
    whatWasWrongOrMissing: '',
    affects: 'BOTH',
    conflictsOfInterest: '',
    conflictsOfInterestAttested: false,
  }
}

function stringValue(value: string | string[] | null | undefined): string {
  if (Array.isArray(value)) return value.join('\n')
  return value?.trim() ?? ''
}

function initialFieldOptions(dossier: DossierContributionActionsProps['dossier']): FieldOption[] {
  const fields: FieldOption[] = [
    {
      value: 'programme.title',
      label: 'Name of this use',
      currentValue: dossier.selectedProgrammeLabel,
      valueType: 'text',
      allowedValues: [],
    },
    {
      value: 'programme.status',
      label: 'Research status',
      currentValue: dossier.selectedProgrammeStatus,
      valueType: 'enum',
      allowedValues: PROGRAMME_STATUSES,
    },
    {
      value: 'verdict.publicLabel',
      label: 'Reviewed answer',
      currentValue: dossier.conclusion?.publicLabel ?? dossier.verdict,
      valueType: 'text',
      allowedValues: [],
    },
    {
      value: 'verdict.oneSentenceReason',
      label: 'Why this is the answer',
      currentValue: dossier.conclusion?.reason ?? '',
      valueType: 'text',
      allowedValues: [],
    },
    {
      value: 'summary.bestSupportedFinding',
      label: 'The 10-second answer',
      currentValue: dossier.verdict,
      valueType: 'text',
      allowedValues: [],
    },
    {
      value: 'summary.mainLimitation',
      label: 'The main limitation',
      currentValue: dossier.mainLimitation ?? '',
      valueType: 'text',
      allowedValues: [],
    },
    {
      value: 'summary.plainMechanism',
      label: 'The plain-language mechanism summary',
      currentValue: [
        dossier.mechanismSummary.where,
        dossier.mechanismSummary.change,
        dossier.mechanismSummary.observed,
      ]
        .filter(Boolean)
        .join(' → '),
      valueType: 'text',
      allowedValues: [],
    },
    {
      value: 'evidenceNode.plainSummary',
      label: 'A plain-language evidence-step summary',
      currentValue: '',
      valueType: 'text',
      allowedValues: [],
    },
  ]

  return fields
}

const READER_FIELD_LABELS: Partial<Record<ContributionSelectedField, string>> = {
  'programme.indication': 'Problem or use being studied',
  'programme.targetPopulation': 'People included',
  'programme.status': 'Research status',
  'programme.highestPhaseReached': 'Furthest study stage reached',
  'programme.route': 'How the medicine is given',
  'programme.doseExposureContext': 'Dose and exposure',
  'programme.rawStoppingReason': 'Reason the research stopped',
  'programme.stoppingReasonCategory': 'Why the research stopped',
  'verdict.verdictCode': 'What the stopped research shows',
  'verdict.publicLabel': 'Reviewed answer',
  'verdict.professionalLabel': 'Clinical classification',
  'verdict.scope.indication': 'Use covered by the answer',
  'verdict.scope.population': 'People covered by the answer',
  'verdict.scope.doseExposure': 'Dose or exposure covered by the answer',
  'verdict.scope.period': 'Time period covered by the answer',
  'verdict.scope.trials': 'Studies included in the answer',
  'verdict.scope.outcome': 'Result covered by the answer',
  'verdict.confidence': 'How sure reviewers are',
  'verdict.conditionsThatWouldChangeVerdict': 'What would change the answer',
  'evidenceNode.state': 'Evidence-step status',
  'evidenceNode.plainSummary': 'Plain-language evidence-step summary',
  'evidenceNode.professionalSummary': 'Clinical evidence-step summary',
  'evidenceNode.rationale': 'Reason for the evidence-step finding',
}

export function readerFieldLabel(field: string, fallback: string): string {
  return READER_FIELD_LABELS[field as ContributionSelectedField] ?? fallback
}

function normalizeContextFields(
  context: ContributionContext,
  fallback: FieldOption[] = [],
): FieldOption[] {
  const fallbackByValue = new Map(fallback.map((field) => [field.value, field.currentValue]))
  return context.fieldOptions.flatMap((field) => {
    const value = field.value ?? field.path ?? field.key
    if (!value) return []
    return [
      {
        value,
        label: readerFieldLabel(value, field.label),
        valueType:
          field.valueType ??
          (valueKindForField(value) === 'list'
            ? 'list'
            : valueKindForField(value) === 'text'
              ? 'text'
              : 'enum'),
        allowedValues: field.allowedValues ?? enumReplacementOptions(value),
        currentValue: stringValue(
          field.currentValue ??
            field.current ??
            context.currentValues?.[value] ??
            fallbackByValue.get(value),
        ),
      },
    ]
  })
}

const EVIDENCE_NODE_LABEL: Record<string, string> = {
  HUMAN_EXPOSURE: 'Given to people',
  USEFUL_EXPOSURE: 'Reached the right place',
  TARGET_ENGAGEMENT: 'Reached its intended target',
  BIOLOGICAL_RESPONSE: 'Changed a body measurement',
  PATIENT_OUTCOME: 'Changed how people felt or what happened',
}

const EVIDENCE_NODE_QUESTION: Record<string, string> = {
  HUMAN_EXPOSURE: 'Was it given to people?',
  USEFUL_EXPOSURE: 'Did enough reach the right place?',
  TARGET_ENGAGEMENT: 'Did it hit the intended target?',
  BIOLOGICAL_RESPONSE: 'Did the body change as expected?',
  PATIENT_OUTCOME: 'Did patients actually benefit?',
}

function evidenceNodeLabel(node: ContributionContext['evidenceNodes'][number]): string {
  return node.label ?? EVIDENCE_NODE_LABEL[node.nodeType ?? ''] ?? 'Evidence step'
}

function evidenceNodeTitle(node: ContributionContext['evidenceNodes'][number]): string {
  return node.title ?? EVIDENCE_NODE_QUESTION[node.nodeType ?? ''] ?? 'Evidence finding'
}

function evidenceNodeSummary(node: ContributionContext['evidenceNodes'][number]): string {
  return node.summary ?? node.plainSummary ?? node.professionalSummary ?? ''
}

export function isStoppedProgrammeStatus(status: string): boolean {
  const normalized = status.trim().toUpperCase()
  return normalized === 'STOPPED' || normalized === 'WITHDRAWN'
}

export function selectedProgrammeMatchesContext(
  selected: string,
  programme: { id: string; slug?: string },
): boolean {
  return programme.slug === selected || programme.id === selected
}

export interface SourcePreview {
  label: string
  detail: string
  isUrl: boolean
}

/** A local shape preview only. It never claims to have fetched or verified the source. */
export function sourcePreview(locator: string): SourcePreview | null {
  const value = locator.trim()
  if (!value) return null

  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('not web')
    return {
      label: parsed.hostname.replace(/^www\./, ''),
      detail: `${parsed.pathname}${parsed.search}` || '/',
      isUrl: true,
    }
  } catch {
    return {
      label: 'Source identifier entered',
      detail: value,
      isUrl: false,
    }
  }
}

function readableSurface(surface: ImpactSurface): string {
  const exact: Record<string, string> = {
    'summary.plainMechanism': 'the plain-language mechanism',
    'summary.bestSupportedFinding': 'the 10-second summary',
    'summary.mainLimitation': 'the main limitation',
    'verdict.publicLabel': 'the reviewed answer',
    'verdict.professionalLabel': 'the clinical classification',
    'verdict.oneSentenceReason': 'the conclusion reason',
  }
  if (exact[surface.fieldPath]) return exact[surface.fieldPath] ?? ''

  switch (surface.dependentSurfaceType) {
    case 'EVIDENCE_NODE':
      return 'a reviewed evidence step'
    case 'VERDICT':
      return 'the reviewed answer'
    case 'PROGRAMME_SUMMARY':
      return 'the 10-second summary'
    case 'TIMELINE':
    case 'PROGRAMME_TIMELINE':
      return 'the development timeline'
    case 'SEARCH':
    case 'SEARCH_DOCUMENT':
      return 'search and browse results'
    default:
      return 'a linked public evidence surface'
  }
}

function humanStatus(status: string): string {
  return status
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, (letter) => letter.toUpperCase())
}

function buildInitialContext(
  dossier: DossierContributionActionsProps['dossier'],
): ContributionContext {
  return {
    medicine: { slug: dossier.slug, name: dossier.name },
    programme: {
      id: dossier.selectedProgrammeId,
      slug: dossier.selectedProgrammeId,
      title: dossier.selectedProgrammeLabel,
      status: dossier.selectedProgrammeStatus,
    },
    currentVerdict: dossier.verdict
      ? {
          publicLabel: dossier.conclusion?.publicLabel ?? dossier.verdict,
          professionalLabel: dossier.conclusion?.professionalLabel,
          oneSentenceReason: dossier.conclusion?.reason,
          verdictCode: dossier.conclusion?.code,
        }
      : null,
    evidenceNodes: dossier.evidenceNodes.map((node) => ({
      id: node.id,
      title: node.title,
      label: node.label,
      state: node.state,
      summary: node.summary,
      currentValues: {
        'evidenceNode.state': node.state,
        'evidenceNode.plainSummary': node.summary,
      },
    })),
    currentValues: Object.fromEntries(
      initialFieldOptions(dossier).map((field) => [field.value, field.currentValue]),
    ),
    fieldOptions: initialFieldOptions(dossier).map((field) => ({
      value: field.value,
      label: field.label,
      currentValue: field.currentValue,
      valueType: field.valueType,
      allowedValues: [...field.allowedValues],
    })),
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
  })
  const text = await response.text()
  let body: unknown = {}
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      throw new Error(
        'RNAWiki could not read the response. Nothing was submitted; please try again.',
      )
    }
  }

  if (!response.ok) {
    const failure = body as ApiFailureBody
    const error = new Error(
      failure.error ?? `The request failed (${response.status}).`,
    ) as Error & {
      details?: ApiFailureBody['details']
    }
    error.details = failure.details
    throw error
  }
  return body as T
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </label>
  )
}

function ReplacementField({
  label,
  field,
  kind,
  allowedValues,
  proposedText,
  proposedValueText,
  proposedStoppedVerdict,
  disabled,
  onTextChange,
  onValueChange,
  onStoppedVerdictChange,
}: {
  label: string
  field: string
  kind: ContributionValueKind
  allowedValues: readonly string[]
  proposedText: string
  proposedValueText: string
  proposedStoppedVerdict: string
  disabled: boolean
  onTextChange: (value: string) => void
  onValueChange: (value: string) => void
  onStoppedVerdictChange: (value: string) => void
}) {
  const hint =
    kind === 'list'
      ? 'Enter one supported item per line. Blank lines are removed before saving.'
      : kind === 'enum'
        ? 'Choose one of the record’s standard values so RNAWiki can check it consistently.'
        : kind === 'stoppedVerdict'
          ? 'These choices apply only when research for this use has stopped or been withdrawn.'
          : 'Write the smallest replacement that the source supports.'

  return (
    <Field label={label} hint={hint}>
      {kind === 'text' ? (
        <textarea
          value={proposedText}
          onChange={(event) => onTextChange(event.target.value)}
          disabled={disabled}
          required
          rows={4}
          maxLength={12_000}
          className={inputClass}
          placeholder="Write the smallest replacement that the source supports."
        />
      ) : kind === 'list' ? (
        <textarea
          value={proposedValueText}
          onChange={(event) => onValueChange(event.target.value)}
          disabled={disabled}
          required
          rows={5}
          maxLength={12_000}
          className={inputClass}
          placeholder={'First supported item\nSecond supported item'}
        />
      ) : kind === 'enum' ? (
        <select
          value={proposedValueText}
          onChange={(event) => onValueChange(event.target.value)}
          disabled={disabled}
          required
          className={inputClass}
        >
          <option value="">Choose the proposed value</option>
          {(allowedValues.length > 0 ? allowedValues : enumReplacementOptions(field)).map(
            (value) => (
              <option key={value} value={value}>
                {humanStatus(value)}
              </option>
            ),
          )}
        </select>
      ) : (
        <select
          value={proposedStoppedVerdict}
          onChange={(event) => onStoppedVerdictChange(event.target.value)}
          disabled={disabled}
          required
          className={inputClass}
        >
          <option value="">Choose what the stopped research shows</option>
          {STOPPED_VERDICT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

function SourceFields({
  idPrefix,
  prompt,
  type,
  locator,
  identifier,
  disabled,
  onTypeChange,
  onLocatorChange,
  onIdentifierChange,
}: {
  idPrefix: string
  prompt: string
  type: SourceType
  locator: string
  identifier: string
  disabled: boolean
  onTypeChange: (value: SourceType) => void
  onLocatorChange: (value: string) => void
  onIdentifierChange: (value: string) => void
}) {
  const preview = sourcePreview(locator)
  return (
    <fieldset className="min-w-0 space-y-3 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-4">
      <legend className="px-1 text-xs font-semibold text-[#1D1D1F]">{prompt}</legend>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-source-type`} className={labelClass}>
            Source type
          </label>
          <select
            id={`${idPrefix}-source-type`}
            value={type}
            onChange={(event) => onTypeChange(event.target.value as SourceType)}
            disabled={disabled}
            className={`${inputClass} mt-1.5`}
          >
            {SOURCE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-source-identifier`} className={labelClass}>
            Study or publication identifier (for example, an NCT number or DOI)
          </label>
          <input
            id={`${idPrefix}-source-identifier`}
            value={identifier}
            onChange={(event) => onIdentifierChange(event.target.value)}
            disabled={disabled}
            className={`${inputClass} mt-1.5`}
            placeholder="NCT01234567 or 10.1000/example"
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-source-locator`} className={labelClass}>
          Public web link
        </label>
        <input
          id={`${idPrefix}-source-locator`}
          type="text"
          inputMode="url"
          value={locator}
          onChange={(event) => onLocatorChange(event.target.value)}
          disabled={disabled}
          required
          className={`${inputClass} mt-1.5`}
          placeholder="https://clinicaltrials.gov/study/NCT…"
        />
      </div>
      <div className="min-w-0 rounded-xl bg-white p-3 text-[11px] leading-5 text-[#424245]">
        <p className="flex items-center gap-2 font-semibold text-[#1D1D1F]">
          <Link2 className="h-3.5 w-3.5 shrink-0 text-[#0071E3]" aria-hidden="true" />
          Source preview
        </p>
        {preview ? (
          <>
            <p className="mt-1 break-words font-semibold">{preview.label}</p>
            <p className="break-all text-[#6E6E73]">{preview.detail}</p>
            <p className="mt-1 text-[#6E6E73]">
              Preview only. RNAWiki has not opened or checked this source link yet.
            </p>
          </>
        ) : (
          <p className="mt-1 text-[#6E6E73]">
            Enter a public link to preview its address. RNAWiki does not fill in source details
            without checking them.
          </p>
        )}
      </div>
    </fieldset>
  )
}

function ConflictField({
  idPrefix,
  value,
  attested,
  disabled,
  onValueChange,
  onAttestedChange,
}: {
  idPrefix: string
  value: string
  attested: boolean
  disabled: boolean
  onValueChange: (value: string) => void
  onAttestedChange: (value: boolean) => void
}) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-black/[0.08] p-4">
      <legend className="px-1 text-xs font-semibold text-[#1D1D1F]">
        Do you have a relevant conflict of interest?
      </legend>
      <label htmlFor={`${idPrefix}-coi`} className="sr-only">
        Conflict-of-interest details
      </label>
      <textarea
        id={`${idPrefix}-coi`}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        disabled={disabled}
        required
        rows={3}
        className={inputClass}
        placeholder="Write “None” if none; otherwise describe funding, employment, patents or other relevant interests."
      />
      <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl bg-[#F5F5F7] px-3 py-2.5 text-xs leading-5 text-[#424245]">
        <input
          type="checkbox"
          checked={attested}
          onChange={(event) => onAttestedChange(event.target.checked)}
          disabled={disabled}
          required
          className="mt-1 h-4 w-4 shrink-0 accent-[#0071E3]"
        />
        <span>I confirm this disclosure is complete and accurate.</span>
      </label>
    </fieldset>
  )
}

function AffectsField({
  name,
  value,
  disabled,
  onChange,
}: {
  name: string
  value: 'DISPROVEN' | 'OPEN_QUESTIONS' | 'BOTH'
  disabled: boolean
  onChange: (value: 'DISPROVEN' | 'OPEN_QUESTIONS' | 'BOTH') => void
}) {
  return (
    <fieldset className="space-y-2">
      <legend className={labelClass}>
        Does this change what was disproven, what remains unknown or open, or both?
      </legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          ['DISPROVEN', 'What was disproven'],
          ['OPEN_QUESTIONS', 'What remains unknown or open'],
          ['BOTH', 'Both'],
        ].map(([optionValue, label]) => (
          <label
            key={optionValue}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-black/[0.1] px-3 py-2 text-xs leading-5 text-[#424245] has-[:checked]:border-[#0071E3] has-[:checked]:bg-blue-50 has-[:checked]:font-semibold has-[:checked]:text-[#0066CC]"
          >
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue as 'DISPROVEN' | 'OPEN_QUESTIONS' | 'BOTH')}
              disabled={disabled}
              className="h-4 w-4 shrink-0 accent-[#0071E3]"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function BeforeAfter({ before, after, label }: { before: string; after: string; label: string }) {
  return (
    <section aria-labelledby="contribution-diff-heading" className="rounded-2xl bg-[#F5F5F7] p-4">
      <div className="flex items-center gap-2">
        <FileDiff className="h-4 w-4 text-[#0071E3]" aria-hidden="true" />
        <h3 id="contribution-diff-heading" className="text-xs font-semibold text-[#1D1D1F]">
          Before and after
        </h3>
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
        {label}
      </p>
      <dl className="mt-2 grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-black/[0.08] bg-white p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
            Current
          </dt>
          <dd className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[#424245]">
            {before || 'No current value is published.'}
          </dd>
        </div>
        <div className="min-w-0 rounded-xl border border-blue-200 bg-blue-50 p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#0066CC]">
            Proposed
          </dt>
          <dd className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[#1D1D1F]">
            {after || 'No proposed value entered yet.'}
          </dd>
        </div>
      </dl>
    </section>
  )
}

const PLAIN_CHECK_MESSAGES: Record<string, string> = {
  selected_field_present: 'Choose the exact information you want to change.',
  proposal_target_matches_type:
    'The information selected does not match this kind of proposal. Choose a fact about this use for a correction, or a published answer for a challenge.',
  evidence_node_scope:
    'Choose an evidence step for this specific use. A step from another use cannot be used.',
  current_verdict_available: 'This use does not have a published answer to challenge.',
  proposed_content_present: 'Enter the replacement information you want reviewers to consider.',
  proposed_value_shape:
    'Enter the replacement in the format shown for this field. For example, choose one status from the list or put each list item on its own line.',
  source_complete: 'Add a source type, a study or publication identifier, and a public web link.',
  claim_nature_known:
    'Say whether the information was measured, reported by the sponsor, found by a regulator, or is your interpretation.',
  reasoning_complete: 'Explain what is wrong or missing and why the proposed change is better.',
  conclusion_scope_declared:
    'Say whether this changes what was ruled out, what remains unknown, or both.',
  coi_attested:
    'Complete the conflict-of-interest statement, even if the answer is “None,” and confirm that it is accurate.',
  stopped_verdict_scope:
    'An answer about why research stopped can be proposed only when research for this use has stopped or been withdrawn.',
  stopped_verdict_target:
    'Choose a stopped-research answer only when research for this use has stopped or been withdrawn.',
  stopped_verdict_value_shape:
    'Choose the stopped-research answer on its own; do not enter a second replacement value.',
  dependency_graph_coverage:
    'RNAWiki has not linked this field to every page section it may affect. A reviewer must check for missing links.',
}

function plainCheckMessage(check: MachineCheck): string {
  return PLAIN_CHECK_MESSAGES[check.code] ?? check.message
}

function MachinePreview({ preview }: { preview: ContributionPreview | null }) {
  if (!preview) {
    return (
      <section className="rounded-2xl border border-dashed border-black/[0.12] p-4 text-xs leading-5 text-[#6E6E73]">
        Save the draft to check that the required fields, source details, use being studied, and
        links to other claims are complete. These checks do not decide whether the medical
        conclusion is correct.
      </section>
    )
  }

  const checks = preview.machineChecks
  const impact = preview.impact
  const surfaces = impact
    ? [...new Set(impact.affectedSurfaces.map((surface) => readableSurface(surface)))]
    : []

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <section className="min-w-0 rounded-2xl border border-black/[0.08] p-4">
        <div className="flex items-start gap-2">
          {checks?.passed ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
          ) : (
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-[#1D1D1F]">Automated checks</h3>
            <p className="mt-1 text-[11px] leading-5 text-[#6E6E73]">
              {checks
                ? checks.passed
                  ? 'All required checks passed.'
                  : 'Some required checks need attention before submission.'
                : 'The check results are not available yet.'}
            </p>
          </div>
        </div>
        {checks && checks.checks.length > 0 && (
          <ul className="mt-3 space-y-2">
            {checks.checks.map((check) => (
              <li key={check.code} className="flex items-start gap-2 text-[11px] leading-5">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    check.status === 'PASS'
                      ? 'bg-emerald-600'
                      : check.status === 'WARN'
                        ? 'bg-amber-600'
                        : 'bg-rose-600'
                  }`}
                  aria-hidden="true"
                />
                <span className="min-w-0 break-words text-[#424245]">
                  <strong className="text-[#1D1D1F]">{humanStatus(check.status)}:</strong>{' '}
                  {plainCheckMessage(check)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="min-w-0 rounded-2xl border border-black/[0.08] p-4">
        <div className="flex items-start gap-2">
          <Network className="mt-0.5 h-4 w-4 shrink-0 text-[#0071E3]" aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-[#1D1D1F]">Where this change may appear</h3>
            <p className="mt-1 text-[11px] leading-5 text-[#6E6E73]">
              Based on the parts of the public record already linked to this field.
            </p>
          </div>
        </div>
        {impact ? (
          surfaces.length > 0 ? (
            <>
              <p className="mt-3 text-[11px] font-semibold text-[#1D1D1F]">This edit may affect:</p>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-5 text-[#424245]">
                {surfaces.map((surface) => (
                  <li key={surface}>• {surface}</li>
                ))}
              </ul>
              {impact.highestImpactLevel && (
                <p className="mt-2 text-[10px] uppercase tracking-wide text-[#6E6E73]">
                  Highest level of review needed: {humanStatus(impact.highestImpactLevel)}
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-[11px] leading-5 text-amber-800">
              RNAWiki could not find a stored link to another part of the public record. A reviewer
              must check the connection before this can change a conclusion.
            </p>
          )
        ) : (
          <p className="mt-3 text-[11px] leading-5 text-[#6E6E73]">
            Linked parts of the record will appear after the draft is saved.
          </p>
        )}
      </section>
    </div>
  )
}

function CurrentEvidence({ context }: { context: ContributionContext }) {
  const verdict = context.currentVerdict
  return (
    <aside className="min-w-0 space-y-4 rounded-2xl bg-[#F5F5F7] p-4 sm:p-5 lg:sticky lg:top-4 lg:self-start">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wide text-[#0071E3]">
          Current conclusion
        </p>
        <p className="mt-2 break-words text-sm font-semibold leading-6 text-[#1D1D1F]">
          {verdict?.publicLabel || 'No reviewed answer is published for this use.'}
        </p>
        {verdict?.professionalLabel && (
          <p className="mt-1 text-[11px] leading-5 text-[#6E6E73]">
            Clinical classification: {verdict.professionalLabel}
          </p>
        )}
        {verdict?.oneSentenceReason && (
          <p className="mt-2 text-xs leading-5 text-[#424245]">{verdict.oneSentenceReason}</p>
        )}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
          Current evidence steps
        </p>
        {context.evidenceNodes.length > 0 ? (
          <ol className="mt-2 space-y-2">
            {context.evidenceNodes.map((node, index) => (
              <li key={node.id} className="rounded-xl bg-white p-3">
                <p className="text-[10px] uppercase tracking-wide text-[#6E6E73]">
                  {String(index + 1).padStart(2, '0')} · {humanStatus(node.state)}
                </p>
                <p className="mt-1 break-words text-xs font-semibold leading-5 text-[#1D1D1F]">
                  {evidenceNodeTitle(node)}
                </p>
                {evidenceNodeSummary(node) && (
                  <p className="mt-1 break-words text-[11px] leading-5 text-[#6E6E73]">
                    {evidenceNodeSummary(node)}
                  </p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-[11px] leading-5 text-[#6E6E73]">
            No reviewed evidence steps are published for this use.
          </p>
        )}
      </div>
    </aside>
  )
}

function FeedbackAttribution({
  person,
}: {
  person: ContributionReviewView['reviewer'] | ContributionAdjudicationView['adjudicator']
}) {
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <Link href={`/u/${person.handle}`} className="font-semibold text-[#0066CC] hover:underline">
        {person.name}
      </Link>
      {person.orcid && (
        <a
          href={`https://orcid.org/${person.orcid}`}
          target="_blank"
          rel="noreferrer"
          className="break-all font-mono text-[9px] text-[#6E6E73] hover:underline"
        >
          ORCID {person.orcid}
        </a>
      )}
    </span>
  )
}

export function AuthorReviewFeedback({
  proposal,
  draftOpen,
  isRevising,
  onRevise,
}: {
  proposal: ContributionProposal
  draftOpen: boolean
  isRevising: boolean
  onRevise: () => void
}) {
  const review = proposal.review
  if (!review) return null
  const status = review.reviewState.status
  const headingId = `proposal-feedback-${proposal.id}`

  return (
    <section
      aria-labelledby={headingId}
      className="mb-5 space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5"
    >
      <div className="flex items-start gap-2">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
        <div className="min-w-0">
          <h3 id={headingId} className="text-sm font-semibold text-amber-950">
            Reviewer feedback on version {proposal.revisionNumber ?? 1}
          </h3>
          <p className="mt-1 text-[11px] leading-5 text-amber-900">
            {status === 'CHANGES_REQUESTED'
              ? 'Reviewers asked you to change this proposal. The submitted version stays in the public review history.'
              : 'Reviewers rejected this proposal. You can make a new version without replacing the earlier review history.'}
          </p>
        </div>
      </div>

      {review.reviews.length > 0 && (
        <ol className="space-y-2" aria-label="Independent reviewer feedback">
          {review.reviews.map((item, index) => (
            <li key={item.id} className="rounded-xl border border-amber-200 bg-white p-3">
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-2 text-[11px] leading-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
                    Reviewer {index + 1} · {humanStatus(item.decision)}
                  </p>
                  <FeedbackAttribution person={item.reviewer} />
                </div>
                <p className="text-right text-[10px] text-[#6E6E73]">
                  {item.expertiseTags.map(humanStatus).join(', ')}
                </p>
              </div>
              {item.reviewNote && (
                <p className="mt-2 whitespace-pre-wrap break-words text-[11px] leading-5 text-[#424245]">
                  {item.reviewNote}
                </p>
              )}
              <details className="mt-1">
                <summary className="inline-flex min-h-11 cursor-pointer items-center text-[10px] font-semibold text-[#0066CC]">
                  Reviewer conflict-of-interest disclosure
                </summary>
                <p className="break-words text-[11px] leading-5 text-[#424245]">
                  {item.conflictsOfInterest}
                </p>
              </details>
            </li>
          ))}
        </ol>
      )}

      {review.adjudication && (
        <div className="rounded-xl border border-amber-200 bg-white p-3 text-[11px] leading-5 text-[#424245]">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
            Steward decision after reviewer disagreement ·{' '}
            {humanStatus(review.adjudication.decision)}
          </p>
          <FeedbackAttribution person={review.adjudication.adjudicator} />
          <p className="mt-2 whitespace-pre-wrap break-words">{review.adjudication.rationale}</p>
          <details className="mt-1">
            <summary className="inline-flex min-h-11 cursor-pointer items-center text-[10px] font-semibold text-[#0066CC]">
              Steward’s conflict-of-interest disclosure
            </summary>
            <p className="break-words">{review.adjudication.conflictsOfInterest}</p>
          </details>
        </div>
      )}

      {draftOpen ? (
        <p className="flex items-start gap-2 text-[11px] font-semibold leading-5 text-amber-950">
          <PencilLine className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />A new editable
          version is open below. Change it, save the draft, then submit it for a new independent
          review.
        </p>
      ) : (
        <button
          type="button"
          onClick={onRevise}
          disabled={isRevising}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1D1D1F] px-4 py-2 text-xs font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <PencilLine className="h-4 w-4" aria-hidden="true" />
          {isRevising ? 'Opening new version…' : 'Revise proposal'}
        </button>
      )}
    </section>
  )
}

export function DossierContributionActions({ dossier }: DossierContributionActionsProps) {
  const { currentUser, requireAuth } = useApp()
  const accountId = currentUser?.id ?? null
  const accountKey = accountScopeKey(accountId)
  const accountKeyRef = useRef(accountKey)
  accountKeyRef.current = accountKey
  const accountGenerationRef = useRef(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const correctionFormRef = useRef<HTMLFormElement>(null)
  const challengeFormRef = useRef<HTMLFormElement>(null)
  const correctionButtonRef = useRef<HTMLButtonElement>(null)
  const deepLinkOpenedRef = useRef<string | null>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const contextRequestRef = useRef<{ generation: number; controller: AbortController | null }>({
    generation: 0,
    controller: null,
  })
  const actionRequestRef = useRef<{ generation: number; controller: AbortController | null }>({
    generation: 0,
    controller: null,
  })
  const initialContext = useMemo(() => buildInitialContext(dossier), [dossier])

  const [mode, setMode] = useState<ContributionMode>('CORRECTION')
  const [programmeId, setProgrammeId] = useState(dossier.selectedProgrammeId)
  const [context, setContext] = useState<ContributionContext>(initialContext)
  const [isLoadingContext, setIsLoadingContext] = useState(false)
  const [contextError, setContextError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [preview, setPreview] = useState<ContributionPreview | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [revisionFeedback, setRevisionFeedback] = useState<ContributionProposal | null>(null)
  const [isRevising, setIsRevising] = useState(false)
  const [workspaceAccountKey, setWorkspaceAccountKey] = useState<string | null>(accountKey)

  const [correction, setCorrection] = useState<CorrectionDraft>(() =>
    blankCorrection(initialFieldOptions(dossier)[0]?.value),
  )
  const [challenge, setChallenge] = useState<ChallengeDraft>(blankChallenge)

  const fieldOptions = useMemo(() => {
    const normalized = normalizeContextFields(
      context,
      selectedProgrammeMatchesContext(dossier.selectedProgrammeId, context.programme)
        ? initialFieldOptions(dossier)
        : [],
    )
    return normalized.length > 0 ? normalized : initialFieldOptions(dossier)
  }, [context, dossier])
  const stoppedProgramme = isStoppedProgrammeStatus(context.programme.status)
  const correctionFieldOptions = fieldOptions.filter(
    (field) => field.value.startsWith('programme.') || field.value.startsWith('evidenceNode.'),
  )
  const selectedField =
    correctionFieldOptions.find((field) => field.value === correction.selectedField) ??
    correctionFieldOptions[0]
  const correctionValueKind = valueKindForField(correction.selectedField, selectedField?.valueType)
  const correctionTargetsNode = correction.selectedField.startsWith('evidenceNode.')
  const challengeFieldOptions = fieldOptions.filter(
    (field) =>
      (field.value.startsWith('verdict.') || field.value.startsWith('summary.')) &&
      (field.value !== 'verdict.verdictCode' || stoppedProgramme),
  )
  const correctionNode = context.evidenceNodes.find((node) => node.id === correction.evidenceNodeId)
  const correctionCurrentValue = correctionTargetsNode
    ? stringValue(
        correctionNode?.currentValues?.[correction.selectedField] ??
          (correction.selectedField === 'evidenceNode.state'
            ? correctionNode?.state
            : correction.selectedField === 'evidenceNode.plainSummary'
              ? correctionNode?.plainSummary
              : correction.selectedField === 'evidenceNode.professionalSummary'
                ? correctionNode?.professionalSummary
                : undefined),
      )
    : (selectedField?.currentValue ?? '')
  const selectedChallengeField = challengeFieldOptions.find(
    (field) => field.value === challenge.selectedField,
  )
  const challengeValueKind = valueKindForField(
    challenge.selectedField,
    selectedChallengeField?.valueType,
  )
  const challengeCurrentValue = stringValue(
    context.currentValues?.[challenge.selectedField] ?? selectedChallengeField?.currentValue,
  )
  const correctionProposedDisplay = proposedDisplay({
    kind: correctionValueKind,
    proposedText: correction.proposedText,
    proposedValueText: correction.proposedValueText,
    proposedStoppedVerdict: '',
  })
  const challengeProposedDisplay = proposedDisplay({
    kind: challengeValueKind,
    proposedText: challenge.proposedText,
    proposedValueText: challenge.proposedValueText,
    proposedStoppedVerdict: challenge.proposedStoppedVerdict,
  })
  const challengeUnavailable = mode === 'VERDICT_CHALLENGE' && !context.currentVerdict
  const formLocked =
    workspaceAccountKey !== accountKey || isSaving || isRevising || isSubmitted || isLoadingContext
  const revisionDraftOpen = revisionFeedback !== null && draftId !== null && !isSubmitted
  const needsRevisionCreation =
    revisionFeedback !== null && draftId === null && isSubmitted && !isLoadingContext
  const dialogCloseIsDisabled = contributionDialogCloseDisabled(isSaving, isRevising)

  const programmePath = useCallback(
    (selected: string) =>
      `/api/drugs/${encodeURIComponent(dossier.slug)}/programmes/${encodeURIComponent(selected)}/contributions`,
    [dossier.slug],
  )

  const applyProposalToForm = useCallback(
    (
      proposal: ContributionProposal,
      proposalMode: ContributionMode,
      correctionOptions: FieldOption[],
      conclusionOptions: FieldOption[],
    ) => {
      const source = proposal.source
      if (proposalMode === 'CORRECTION') {
        setCorrection({
          ...blankCorrection(correctionOptions[0]?.value),
          selectedField: proposal.selectedField ?? correctionOptions[0]?.value ?? '',
          proposedText: proposal.proposedText ?? '',
          proposedValueText: stringValue(proposal.proposedValue),
          sourceType: proposal.sourceType ?? source?.type ?? 'UNKNOWN',
          sourceLocator: proposal.sourceLocator ?? source?.locator ?? '',
          sourceIdentifier: proposal.sourceIdentifier ?? source?.identifier ?? '',
          sourceReviewTaskId: source?.reviewTaskId ?? '',
          sourceReviewSnapshotId: source?.reviewSnapshotId ?? '',
          claimNature: proposal.claimNature ?? 'UNKNOWN',
          evidenceNodeId: proposal.evidenceNodeId ?? '',
          reasoning: proposal.reasoning ?? '',
          whatWasWrongOrMissing: proposal.whatWasWrongOrMissing ?? '',
          affects: proposal.affects ?? 'BOTH',
          conflictsOfInterest: proposal.conflictsOfInterest ?? '',
          conflictsOfInterestAttested: proposal.conflictsOfInterestAttested ?? false,
        })
        return
      }

      setChallenge({
        ...blankChallenge(),
        selectedField:
          proposal.selectedField ?? conclusionOptions[0]?.value ?? 'verdict.publicLabel',
        proposedText: proposal.proposedText ?? '',
        proposedValueText: stringValue(proposal.proposedValue),
        sourceType: proposal.sourceType ?? source?.type ?? 'UNKNOWN',
        sourceLocator: proposal.sourceLocator ?? source?.locator ?? '',
        sourceIdentifier: proposal.sourceIdentifier ?? source?.identifier ?? '',
        claimNature: proposal.claimNature ?? 'RNAWIKI_JUDGEMENT',
        evidenceNodeId: proposal.evidenceNodeId ?? '',
        proposedStoppedVerdict: proposal.proposedStoppedVerdict ?? '',
        reasoning: proposal.reasoning ?? '',
        whatWasWrongOrMissing: proposal.whatWasWrongOrMissing ?? '',
        affects: proposal.affects ?? 'BOTH',
        conflictsOfInterest: proposal.conflictsOfInterest ?? '',
        conflictsOfInterestAttested: proposal.conflictsOfInterestAttested ?? false,
      })
    },
    [],
  )

  useEffect(
    () => () => {
      contextRequestRef.current.controller?.abort()
      contextRequestRef.current.generation += 1
      actionRequestRef.current.controller?.abort()
      actionRequestRef.current.generation += 1
    },
    [],
  )

  useEffect(() => {
    accountGenerationRef.current += 1
    contextRequestRef.current.controller?.abort()
    contextRequestRef.current.generation += 1
    actionRequestRef.current.controller?.abort()
    actionRequestRef.current.generation += 1
    actionRequestRef.current.controller = null
    setProgrammeId(dossier.selectedProgrammeId)
    setContext(initialContext)
    setIsLoadingContext(false)
    setContextError(null)
    setIsSaving(false)
    setIsSubmitted(false)
    setError(null)
    setNotice(null)
    setPreview(null)
    setDraftId(null)
    setRevisionFeedback(null)
    setIsRevising(false)
    setCorrection(blankCorrection(initialFieldOptions(dossier)[0]?.value))
    setChallenge(blankChallenge())
    setWorkspaceAccountKey(accountKey)
    if (dialogRef.current?.open) dialogRef.current.close()
  }, [accountKey, dossier, initialContext])

  const loadContext = useCallback(
    async (
      selected: string,
      proposalMode: ContributionMode,
      sourceTaskPrefill: SourceTaskPrefill | null = null,
    ) => {
      const requestAccountKey = accountKey
      const accountGeneration = accountGenerationRef.current
      if (accountKeyRef.current !== requestAccountKey) return
      contextRequestRef.current.controller?.abort()
      const controller = new AbortController()
      const generation = contextRequestRef.current.generation + 1
      contextRequestRef.current = { generation, controller }
      setIsLoadingContext(true)
      setContextError(null)
      try {
        const response = await apiRequest<ContributionApiResponse>(programmePath(selected), {
          signal: controller.signal,
        })
        if (
          contextRequestRef.current.generation !== generation ||
          !isCurrentAccountRequest({
            accountKey: requestAccountKey,
            currentAccountKey: accountKeyRef.current,
            accountGeneration,
            currentAccountGeneration: accountGenerationRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          return
        }
        if (!response.context) throw new Error('The current answer for this use was not returned.')
        setContext(response.context)
        const options = normalizeContextFields(
          response.context,
          selected === dossier.selectedProgrammeId ? initialFieldOptions(dossier) : [],
        )
        const correctionOptions = options.filter(
          (option) =>
            option.value.startsWith('programme.') || option.value.startsWith('evidenceNode.'),
        )
        const responseProgrammeStopped = isStoppedProgrammeStatus(response.context.programme.status)
        const conclusionOptions = options.filter(
          (option) =>
            (option.value.startsWith('verdict.') || option.value.startsWith('summary.')) &&
            (option.value !== 'verdict.verdictCode' || responseProgrammeStopped),
        )
        const availableProposals = sourceTaskPrefill
          ? contributionsBoundToSourceTask(
              response.proposals ?? [],
              sourceTaskPrefill.taskId,
              sourceTaskPrefill.snapshotId,
            )
          : (response.proposals ?? [])
        const workspace = contributionRevisionWorkspace(availableProposals, proposalMode)
        const latestDraft = workspace.draft

        if (latestDraft) {
          const feedbackParent =
            workspace.feedbackParent?.review &&
            isRevisableContributionReviewStatus(workspace.feedbackParent.review.reviewState.status)
              ? workspace.feedbackParent
              : null
          setDraftId(latestDraft.id)
          setIsSubmitted(false)
          setRevisionFeedback(feedbackParent)
          setPreview({
            machineChecks: latestDraft.machineChecks,
            impact: latestDraft.impactPreview,
            diff: latestDraft.diff,
          })
          setNotice(
            sourceTaskPrefill && proposalMode === 'CORRECTION'
              ? 'Your private draft was restored and linked locally to the saved source change you opened. Save the draft to record that link.'
              : feedbackParent
                ? 'Your latest draft version was restored with the earlier reviewer feedback.'
                : 'Your latest private draft for this use has been restored.',
          )
          applyProposalToForm(latestDraft, proposalMode, correctionOptions, conclusionOptions)
          if (sourceTaskPrefill && proposalMode === 'CORRECTION') {
            setCorrection((current) => ({
              ...current,
              selectedField: correctionOptions.some(
                (option) => option.value === sourceTaskPrefill.selectedField,
              )
                ? sourceTaskPrefill.selectedField
                : current.selectedField,
              sourceType: sourceTaskPrefill.sourceType,
              sourceLocator: sourceTaskPrefill.sourceLocator,
              sourceIdentifier: sourceTaskPrefill.sourceIdentifier,
              sourceReviewTaskId: sourceTaskPrefill.taskId,
              sourceReviewSnapshotId: sourceTaskPrefill.snapshotId,
            }))
          }
          return
        }

        const existingTaskSubmission = sourceTaskPrefill
          ? availableProposals.find(
              (proposal) =>
                proposal.proposalType === 'CORRECTION' &&
                proposal.status === 'SUBMITTED' &&
                (!proposal.review ||
                  !isRevisableContributionReviewStatus(proposal.review.reviewState.status)),
            )
          : null
        if (existingTaskSubmission) {
          setDraftId(null)
          setIsSubmitted(true)
          setRevisionFeedback(null)
          setPreview({
            machineChecks: existingTaskSubmission.machineChecks,
            impact: existingTaskSubmission.impactPreview,
            diff: existingTaskSubmission.diff,
          })
          applyProposalToForm(
            existingTaskSubmission,
            proposalMode,
            correctionOptions,
            conclusionOptions,
          )
          setNotice(
            'A proposal for this saved source update is already in review or waiting to be published. Open the review queue to continue.',
          )
          return
        }

        if (workspace.feedbackParent) {
          setDraftId(null)
          setIsSubmitted(true)
          setRevisionFeedback(workspace.feedbackParent)
          setPreview({
            machineChecks: workspace.feedbackParent.machineChecks,
            impact: workspace.feedbackParent.impactPreview,
            diff: workspace.feedbackParent.diff,
          })
          setNotice(null)
          applyProposalToForm(
            workspace.feedbackParent,
            proposalMode,
            correctionOptions,
            conclusionOptions,
          )
          return
        }

        setDraftId(null)
        setIsSubmitted(false)
        setRevisionFeedback(null)
        setPreview(null)
        setNotice(
          sourceTaskPrefill
            ? 'This correction is linked to the saved source update from the review queue.'
            : null,
        )
        const sourceTaskField = sourceTaskPrefill?.selectedField
        const sourceTaskPrefillForContext = sourceTaskPrefill
          ? {
              ...sourceTaskPrefill,
              selectedField:
                sourceTaskField &&
                correctionOptions.some((option) => option.value === sourceTaskField)
                  ? sourceTaskField
                  : '',
            }
          : null
        setCorrection(
          blankCorrectionForSourceTask(
            correctionOptions[0]?.value ?? '',
            sourceTaskPrefillForContext,
          ),
        )
        setChallenge({
          ...blankChallenge(),
          selectedField: conclusionOptions[0]?.value ?? 'verdict.publicLabel',
        })
        return
      } catch (caught) {
        if (
          controller.signal.aborted ||
          contextRequestRef.current.generation !== generation ||
          !isCurrentAccountRequest({
            accountKey: requestAccountKey,
            currentAccountKey: accountKeyRef.current,
            accountGeneration,
            currentAccountGeneration: accountGenerationRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          return
        }
        setContextError(
          caught instanceof Error
            ? caught.message
            : 'The current evidence for this use could not be loaded.',
        )
      } finally {
        if (
          contextRequestRef.current.generation === generation &&
          isCurrentAccountRequest({
            accountKey: requestAccountKey,
            currentAccountKey: accountKeyRef.current,
            accountGeneration,
            currentAccountGeneration: accountGenerationRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          setIsLoadingContext(false)
        }
      }
    },
    [accountKey, applyProposalToForm, dossier, programmePath],
  )

  const open = useCallback(
    (
      nextMode: ContributionMode,
      button: HTMLButtonElement,
      sourceTaskPrefill: SourceTaskPrefill | null = null,
    ) => {
      if (!currentUser) {
        requireAuth()
        return
      }
      if (accountKeyRef.current !== accountKey) return
      openerRef.current = button
      setMode(nextMode)
      setError(null)
      setNotice(
        sourceTaskPrefill
          ? 'This correction is linked to the saved source update from the review queue.'
          : null,
      )
      setPreview(null)
      setDraftId(null)
      setRevisionFeedback(null)
      setIsSaving(false)
      setIsRevising(false)
      setIsSubmitted(false)
      setCorrection(
        blankCorrectionForSourceTask(
          initialFieldOptions(dossier)[0]?.value ?? '',
          sourceTaskPrefill,
        ),
      )
      setChallenge(blankChallenge())
      setProgrammeId(dossier.selectedProgrammeId)
      setContext(initialContext)
      setWorkspaceAccountKey(accountKey)
      dialogRef.current?.showModal()
      void loadContext(dossier.selectedProgrammeId, nextMode, sourceTaskPrefill)
    },
    [accountKey, currentUser, dossier, initialContext, loadContext, requireAuth],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const sourceTaskPrefill = sourceTaskPrefillFromSearch(window.location.search)
    if (!sourceTaskPrefill) return
    const token = `${currentUser?.id ?? 'signed-out'}:${window.location.search}`
    if (deepLinkOpenedRef.current === token) return
    if (!currentUser) {
      requireAuth()
      return
    }
    const button = correctionButtonRef.current
    if (!button) return
    deepLinkOpenedRef.current = token
    open('CORRECTION', button, sourceTaskPrefill)
  }, [currentUser, open, requireAuth])

  const close = () => {
    if (dialogCloseIsDisabled) return
    contextRequestRef.current.controller?.abort()
    contextRequestRef.current.generation += 1
    actionRequestRef.current.controller?.abort()
    actionRequestRef.current.generation += 1
    dialogRef.current?.close()
  }

  const handleProgrammeChange = (selected: string) => {
    setProgrammeId(selected)
    setDraftId(null)
    setRevisionFeedback(null)
    setIsRevising(false)
    setIsSubmitted(false)
    setPreview(null)
    setError(null)
    setNotice(null)
    setCorrection(blankCorrection())
    setChallenge(blankChallenge())
    const programme = dossier.programmes.find((option) => option.id === selected)
    if (programme) {
      setContext((current) => ({
        ...current,
        programme: {
          id: programme.id,
          slug: programme.id,
          title: programme.label,
          status: programme.status,
        },
      }))
    }
    void loadContext(selected, mode)
  }

  const body = (): Record<string, unknown> => {
    if (mode === 'CORRECTION') {
      const reasoning = [correction.reasoning, correction.technicalDetail]
        .filter((value) => value.trim())
        .join('\n\nTechnical detail:\n')
      return {
        proposalType: mode,
        selectedField: correction.selectedField || null,
        ...replacementChannels({
          kind: correctionValueKind,
          proposedText: correction.proposedText,
          proposedValueText: correction.proposedValueText,
          proposedStoppedVerdict: '',
        }),
        source:
          correction.sourceLocator || correction.sourceIdentifier || correction.sourceReviewTaskId
            ? {
                type: correction.sourceType,
                locator: correction.sourceLocator || null,
                identifier: correction.sourceIdentifier || null,
                reviewTaskId: correction.sourceReviewTaskId || null,
                reviewSnapshotId: correction.sourceReviewSnapshotId || null,
              }
            : null,
        claimNature: correction.claimNature,
        evidenceNodeId:
          correctionTargetsNode && correction.evidenceNodeId ? correction.evidenceNodeId : null,
        reasoning: reasoning || null,
        whatWasWrongOrMissing: correction.whatWasWrongOrMissing || null,
        affects: correction.affects,
        conflictsOfInterest: correction.conflictsOfInterest || null,
        conflictsOfInterestAttested: correction.conflictsOfInterestAttested,
      }
    }

    return {
      proposalType: mode,
      selectedField: challenge.selectedField || null,
      ...replacementChannels({
        kind: challengeValueKind,
        proposedText: challenge.proposedText,
        proposedValueText: challenge.proposedValueText,
        proposedStoppedVerdict:
          challenge.selectedField === 'verdict.verdictCode' ? challenge.proposedStoppedVerdict : '',
      }),
      source:
        challenge.sourceLocator || challenge.sourceIdentifier
          ? {
              type: challenge.sourceType,
              locator: challenge.sourceLocator || null,
              identifier: challenge.sourceIdentifier || null,
            }
          : null,
      evidenceNodeId: challenge.evidenceNodeId || null,
      claimNature: challenge.claimNature,
      whatWasWrongOrMissing: challenge.whatWasWrongOrMissing || null,
      reasoning: challenge.reasoning || null,
      affects: challenge.affects,
      conflictsOfInterest: challenge.conflictsOfInterest || null,
      conflictsOfInterestAttested: challenge.conflictsOfInterestAttested,
    }
  }

  const revise = async () => {
    if (
      workspaceAccountKey !== accountKey ||
      accountKeyRef.current !== accountKey ||
      !accountId ||
      isRevising
    ) {
      return
    }
    const parent = revisionFeedback
    if (
      !parent?.review ||
      !needsRevisionCreation ||
      !isRevisableContributionReviewStatus(parent.review.reviewState.status)
    ) {
      setError('This submitted proposal cannot be revised in its current review state.')
      return
    }

    actionRequestRef.current.controller?.abort()
    const controller = new AbortController()
    const requestGeneration = actionRequestRef.current.generation + 1
    actionRequestRef.current = { generation: requestGeneration, controller }
    const accountGeneration = accountGenerationRef.current
    const expectedProgrammeId = context.programme.id
    setIsRevising(true)
    setError(null)
    setNotice(null)
    try {
      const response = await apiRequest<ContributionApiResponse>(
        `/api/contributions/${encodeURIComponent(parent.id)}/revise`,
        { method: 'POST', body: JSON.stringify({}), signal: controller.signal },
      )
      const proposal = response.proposal
      if (
        actionRequestRef.current.generation !== requestGeneration ||
        !isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        return
      }
      if (!proposal?.id || proposal.status !== 'DRAFT') {
        throw new Error('RNAWiki did not return an editable draft version.')
      }
      if (proposal.previousProposalId !== parent.id) {
        throw new Error('The returned draft is not linked to the reviewed proposal.')
      }
      if (parent.proposalKey && proposal.proposalKey !== parent.proposalKey) {
        throw new Error('The returned draft is not linked to the earlier review history.')
      }
      if (
        parent.revisionNumber !== undefined &&
        proposal.revisionNumber !== parent.revisionNumber + 1
      ) {
        throw new Error('The returned draft is not the next version of this proposal.')
      }
      if (proposal.proposalType !== mode) {
        throw new Error('The returned draft does not match this contribution type.')
      }
      if (proposal.programmeId && proposal.programmeId !== expectedProgrammeId) {
        throw new Error('The returned draft does not belong to the selected use.')
      }

      setDraftId(proposal.id)
      setIsSubmitted(false)
      setPreview({
        machineChecks: response.preview?.machineChecks ?? proposal.machineChecks,
        impact:
          response.preview?.impact ??
          response.preview?.impactPreview ??
          proposal.impact ??
          proposal.impactPreview,
        diff: response.preview?.diff ?? proposal.diff,
      })
      applyProposalToForm(proposal, mode, correctionFieldOptions, challengeFieldOptions)
      setNotice(
        `Version ${proposal.revisionNumber ?? (parent.revisionNumber ?? 1) + 1} is now a private draft linked to the earlier review.`,
      )
    } catch (caught) {
      if (
        actionRequestRef.current.generation !== requestGeneration ||
        !isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        return
      }
      setError(
        caught instanceof Error ? caught.message : 'The next draft version could not be opened.',
      )
    } finally {
      if (
        actionRequestRef.current.generation === requestGeneration &&
        isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        actionRequestRef.current.controller = null
        setIsRevising(false)
      }
    }
  }

  const save = async (action: DraftAction) => {
    if (
      workspaceAccountKey !== accountKey ||
      accountKeyRef.current !== accountKey ||
      !accountId ||
      isSaving
    ) {
      return
    }
    const form = mode === 'CORRECTION' ? correctionFormRef.current : challengeFormRef.current
    if (action === 'submit' && form && !form.reportValidity()) return
    if (
      contextError ||
      isLoadingContext ||
      !selectedProgrammeMatchesContext(programmeId, context.programme)
    ) {
      setError('Wait until the current reviewed answer is loaded before saving.')
      return
    }
    if (mode === 'VERDICT_CHALLENGE' && !context.currentVerdict) {
      setError('This use has no published answer to challenge. Choose another use.')
      return
    }

    actionRequestRef.current.controller?.abort()
    const controller = new AbortController()
    const requestGeneration = actionRequestRef.current.generation + 1
    actionRequestRef.current = { generation: requestGeneration, controller }
    const accountGeneration = accountGenerationRef.current
    setIsSaving(true)
    setError(null)
    setNotice(null)
    try {
      const payload = body()
      let response: ContributionApiResponse
      if (draftId) {
        const updates = Object.fromEntries(
          Object.entries(payload).filter(([field]) => field !== 'proposalType'),
        )
        response = await apiRequest<ContributionApiResponse>(
          `/api/contributions/${encodeURIComponent(draftId)}`,
          { method: 'PATCH', body: JSON.stringify(updates), signal: controller.signal },
        )
      } else {
        response = await apiRequest<ContributionApiResponse>(programmePath(programmeId), {
          method: 'POST',
          body: JSON.stringify(payload),
          signal: controller.signal,
        })
      }

      if (
        actionRequestRef.current.generation !== requestGeneration ||
        !isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        return
      }
      const proposal = response.proposal
      if (!proposal?.id) throw new Error('RNAWiki did not return the saved draft.')
      setDraftId(proposal.id)
      setPreview({
        machineChecks: response.preview?.machineChecks ?? proposal.machineChecks,
        impact:
          response.preview?.impact ??
          response.preview?.impactPreview ??
          proposal.impact ??
          proposal.impactPreview,
        diff: response.preview?.diff ?? proposal.diff,
      })

      if (action === 'save') {
        setNotice('Draft saved. It is private to your account until you submit it for review.')
        return
      }

      const submitted = await apiRequest<ContributionApiResponse>(
        `/api/contributions/${encodeURIComponent(proposal.id)}/submit`,
        { method: 'POST', signal: controller.signal },
      )
      if (
        actionRequestRef.current.generation !== requestGeneration ||
        !isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        return
      }
      setPreview({
        machineChecks: submitted.preview?.machineChecks ?? submitted.proposal?.machineChecks,
        impact:
          submitted.preview?.impact ??
          submitted.preview?.impactPreview ??
          submitted.proposal?.impact ??
          submitted.proposal?.impactPreview,
        diff: submitted.preview?.diff ?? submitted.proposal?.diff,
      })
      setIsSubmitted(true)
      setRevisionFeedback(null)
      setNotice('Submitted for independent human review. The public record has not changed.')
    } catch (caught) {
      if (
        actionRequestRef.current.generation !== requestGeneration ||
        !isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        return
      }
      const failure = caught as Error & { details?: ApiFailureBody['details'] }
      if (failure.details) {
        setPreview({
          machineChecks: failure.details.preview?.machineChecks ?? failure.details.machineChecks,
          impact:
            failure.details.preview?.impact ??
            failure.details.preview?.impactPreview ??
            failure.details.impact ??
            failure.details.impactPreview,
          diff: failure.details.preview?.diff ?? failure.details.diff,
        })
      }
      setError(
        failure instanceof Error
          ? failure.message
          : 'The draft could not be saved. Nothing was submitted.',
      )
    } finally {
      if (
        actionRequestRef.current.generation === requestGeneration &&
        isCurrentAccountRequest({
          accountKey,
          currentAccountKey: accountKeyRef.current,
          accountGeneration,
          currentAccountGeneration: accountGenerationRef.current,
          aborted: controller.signal.aborted,
        })
      ) {
        actionRequestRef.current.controller = null
        setIsSaving(false)
      }
    }
  }

  const preventNativeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void save('submit')
  }

  const programmeOptions: ProgrammeOptionView[] = dossier.programmes.length
    ? dossier.programmes
    : [
        {
          id: dossier.selectedProgrammeId,
          label: dossier.selectedProgrammeLabel,
          status: dossier.selectedProgrammeStatus,
          selected: true,
        },
      ]

  if (dossier.bindingState === 'legacy_record') return null

  return (
    <section
      aria-labelledby="improve-record-heading"
      className="rounded-[22px] border border-black/[0.08] bg-white p-5 sm:p-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-lg">
          <p className="font-mono text-[10px] uppercase tracking-wide text-[#0071E3]">
            Spot a mistake?
          </p>
          <h3 id="improve-record-heading" className="mt-1 text-lg font-bold text-[#1D1D1F]">
            Suggest an improvement
          </h3>
          <p className="mt-2 text-xs leading-5 text-[#6E6E73]">
            Suggest one change and link the public source. Software checks the record; independent
            reviewers decide whether the change should move forward.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-56">
          <button
            ref={correctionButtonRef}
            type="button"
            onClick={(event) => open('CORRECTION', event.currentTarget)}
            className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-[#0071E3] px-4 py-2.5 text-left text-xs font-semibold text-white transition hover:bg-[#0077ED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
          >
            <span className="inline-flex items-center gap-2">
              <PencilLine className="h-4 w-4" aria-hidden="true" />
              Suggest a correction
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          {dossier.bindingState === 'published_programme' && (
            <button
              type="button"
              onClick={(event) => open('VERDICT_CHALLENGE', event.currentTarget)}
              className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-black/[0.12] bg-white px-4 py-2.5 text-left text-xs font-semibold text-[#1D1D1F] transition hover:bg-[#F5F5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2"
            >
              <span className="inline-flex items-center gap-2">
                <Scale className="h-4 w-4 text-[#0071E3]" aria-hidden="true" />
                Challenge this answer
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="contribution-dialog-heading"
        aria-describedby="contribution-dialog-description"
        onClose={() => {
          contextRequestRef.current.controller?.abort()
          contextRequestRef.current.generation += 1
          actionRequestRef.current.controller?.abort()
          actionRequestRef.current.generation += 1
          openerRef.current?.focus()
        }}
        onCancel={(event) => {
          if (dialogCloseIsDisabled) event.preventDefault()
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close()
        }}
        className="m-auto max-h-[92dvh] w-[calc(100%_-_1.5rem)] max-w-5xl overflow-hidden rounded-[24px] border border-black/[0.1] bg-white p-0 text-[#1D1D1F] shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-[2px]"
      >
        {workspaceAccountKey === accountKey ? (
          <div className="flex max-h-[92dvh] min-w-0 flex-col">
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-black/[0.07] px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-wide text-[#0071E3]">
                  {mode === 'CORRECTION'
                    ? 'One small sourced edit'
                    : 'Review the answer for this use'}
                </p>
                <h2
                  id="contribution-dialog-heading"
                  className="mt-1 break-words text-xl font-bold tracking-tight sm:text-2xl"
                >
                  {mode === 'CORRECTION' ? 'Suggest a correction' : 'Challenge this answer'}
                </h2>
                <p
                  id="contribution-dialog-description"
                  className="mt-1 max-w-2xl text-[11px] leading-5 text-[#6E6E73]"
                >
                  A saved draft changes nothing public. After you submit, you cannot edit the
                  proposal while software checks and independent review are under way.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={dialogCloseIsDisabled}
                aria-label="Close contribution form"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="min-w-0 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
              <div className="mb-5 rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-4">
                <label htmlFor="contribution-programme" className={labelClass}>
                  Which use of this medicine does it apply to?
                </label>
                <select
                  id="contribution-programme"
                  value={programmeId}
                  onChange={(event) => handleProgrammeChange(event.target.value)}
                  disabled={formLocked}
                  className={`${inputClass} mt-2`}
                >
                  {programmeOptions.map((programme) => (
                    <option key={programme.id} value={programme.id}>
                      {programme.label} · {humanStatus(programme.status)}
                    </option>
                  ))}
                </select>
                <p className={hintClass} aria-live="polite">
                  {isLoadingContext
                    ? 'Loading the current reviewed answer…'
                    : contextError
                      ? contextError
                      : challengeUnavailable
                        ? 'This use has no published answer to challenge. Choose another use.'
                        : `Loaded from ${context.programme.title}.`}
                </p>
              </div>

              {revisionFeedback && (
                <AuthorReviewFeedback
                  proposal={revisionFeedback}
                  draftOpen={revisionDraftOpen}
                  isRevising={isRevising}
                  onRevise={() => void revise()}
                />
              )}

              {mode === 'CORRECTION' ? (
                <form ref={correctionFormRef} onSubmit={preventNativeSubmit} className="space-y-5">
                  <div
                    className={`grid min-w-0 gap-5 ${correctionTargetsNode ? 'sm:grid-cols-2' : ''}`}
                  >
                    <Field
                      label="What needs changing?"
                      hint="Choose one small field. RNAWiki will compare it with the current published value."
                    >
                      <select
                        value={correction.selectedField}
                        onChange={(event) => {
                          const selectedField = event.target.value
                          setCorrection((current) => ({
                            ...current,
                            selectedField,
                            proposedText: '',
                            proposedValueText: '',
                            evidenceNodeId: selectedField.startsWith('evidenceNode.')
                              ? current.evidenceNodeId
                              : '',
                          }))
                        }}
                        disabled={formLocked || isLoadingContext}
                        required
                        className={inputClass}
                        aria-label="What needs changing?"
                      >
                        {correctionFieldOptions.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {correctionTargetsNode && (
                      <Field
                        label="Which evidence step changes?"
                        hint="Choose the step whose reviewed finding would change."
                      >
                        <select
                          value={correction.evidenceNodeId}
                          onChange={(event) =>
                            setCorrection((current) => ({
                              ...current,
                              evidenceNodeId: event.target.value,
                            }))
                          }
                          disabled={formLocked || isLoadingContext}
                          required
                          className={inputClass}
                        >
                          <option value="">Choose an evidence step</option>
                          {context.evidenceNodes.map((node) => (
                            <option key={node.id} value={node.id}>
                              {evidenceNodeLabel(node)}: {evidenceNodeTitle(node)} ·{' '}
                              {humanStatus(node.state)}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}
                  </div>

                  <ReplacementField
                    label="What should the record say?"
                    field={correction.selectedField}
                    kind={correctionValueKind}
                    allowedValues={selectedField?.allowedValues ?? []}
                    proposedText={correction.proposedText}
                    proposedValueText={correction.proposedValueText}
                    proposedStoppedVerdict=""
                    disabled={formLocked}
                    onTextChange={(proposedText) =>
                      setCorrection((current) => ({ ...current, proposedText }))
                    }
                    onValueChange={(proposedValueText) =>
                      setCorrection((current) => ({ ...current, proposedValueText }))
                    }
                    onStoppedVerdictChange={() => undefined}
                  />

                  <BeforeAfter
                    label={selectedField?.label ?? 'Selected field'}
                    before={currentDisplay(correctionValueKind, correctionCurrentValue)}
                    after={correctionProposedDisplay}
                  />

                  <SourceFields
                    idPrefix="correction"
                    prompt="Where did you find this?"
                    type={correction.sourceType}
                    locator={correction.sourceLocator}
                    identifier={correction.sourceIdentifier}
                    disabled={formLocked || Boolean(correction.sourceReviewTaskId)}
                    onTypeChange={(sourceType) =>
                      setCorrection((current) => ({ ...current, sourceType }))
                    }
                    onLocatorChange={(sourceLocator) =>
                      setCorrection((current) => ({ ...current, sourceLocator }))
                    }
                    onIdentifierChange={(sourceIdentifier) =>
                      setCorrection((current) => ({ ...current, sourceIdentifier }))
                    }
                  />

                  {correction.sourceReviewTaskId && correction.sourceReviewSnapshotId && (
                    <div
                      data-testid="source-task-prefill"
                      className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-[11px] leading-5 text-blue-950"
                    >
                      <p className="font-semibold">
                        Linked to the saved source change from the review queue
                      </p>
                      <p className="mt-1">
                        The source fields are locked. RNAWiki will accept this correction only while
                        the review-queue task still points to the saved source version you opened.
                      </p>
                      <details className="mt-2 rounded-xl border border-blue-200 bg-white/60">
                        <summary className="flex min-h-11 cursor-pointer items-center px-3 py-2 font-semibold text-[#0066CC]">
                          Technical audit details
                        </summary>
                        <p className="break-all border-t border-blue-200 px-3 py-2 font-mono text-[9px] leading-4">
                          Task {correction.sourceReviewTaskId} · saved source version{' '}
                          {correction.sourceReviewSnapshotId}
                        </p>
                      </details>
                    </div>
                  )}

                  <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                    <Field label="Is this directly measured, reported by the sponsor, a regulatory finding, or your interpretation?">
                      <select
                        value={correction.claimNature}
                        onChange={(event) =>
                          setCorrection((current) => ({
                            ...current,
                            claimNature: event.target.value as ClaimNature,
                          }))
                        }
                        disabled={formLocked}
                        required
                        className={inputClass}
                      >
                        {CLAIM_NATURE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Why does the source support this change?">
                      <textarea
                        value={correction.reasoning}
                        onChange={(event) =>
                          setCorrection((current) => ({
                            ...current,
                            reasoning: event.target.value,
                          }))
                        }
                        disabled={formLocked}
                        required
                        rows={4}
                        maxLength={4_000}
                        className={inputClass}
                        placeholder="Explain it in plain language."
                      />
                    </Field>
                  </div>

                  <Field label="What is wrong or missing in the current record?">
                    <textarea
                      value={correction.whatWasWrongOrMissing}
                      onChange={(event) =>
                        setCorrection((current) => ({
                          ...current,
                          whatWasWrongOrMissing: event.target.value,
                        }))
                      }
                      disabled={formLocked}
                      required
                      rows={3}
                      maxLength={4_000}
                      className={inputClass}
                      placeholder="Identify the exact omission, mismatch or unsupported wording."
                    />
                  </Field>

                  <AffectsField
                    name="correction-affects"
                    value={correction.affects}
                    disabled={formLocked}
                    onChange={(affects) => setCorrection((current) => ({ ...current, affects }))}
                  />

                  <Field
                    label="Technical detail (optional)"
                    hint="Use this only when a reviewer needs the exact result measured, group studied, dose, time of measurement, or statistic. Professionals may call the result an endpoint and the measurement time a timepoint."
                  >
                    <textarea
                      value={correction.technicalDetail}
                      onChange={(event) =>
                        setCorrection((current) => ({
                          ...current,
                          technicalDetail: event.target.value,
                        }))
                      }
                      disabled={formLocked}
                      rows={3}
                      maxLength={4_000}
                      className={inputClass}
                    />
                  </Field>

                  <ConflictField
                    idPrefix="correction"
                    value={correction.conflictsOfInterest}
                    attested={correction.conflictsOfInterestAttested}
                    disabled={formLocked}
                    onValueChange={(conflictsOfInterest) =>
                      setCorrection((current) => ({ ...current, conflictsOfInterest }))
                    }
                    onAttestedChange={(conflictsOfInterestAttested) =>
                      setCorrection((current) => ({ ...current, conflictsOfInterestAttested }))
                    }
                  />
                </form>
              ) : (
                <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
                  <CurrentEvidence context={context} />
                  <form
                    ref={challengeFormRef}
                    onSubmit={preventNativeSubmit}
                    className="min-w-0 space-y-5"
                  >
                    <Field
                      label="Which conclusion are you challenging?"
                      hint="The current reviewed conclusion is shown beside this form and will be saved with your proposal."
                    >
                      <select
                        value={challenge.selectedField}
                        onChange={(event) =>
                          setChallenge((current) => ({
                            ...current,
                            selectedField: event.target.value,
                            proposedText: '',
                            proposedValueText: '',
                            proposedStoppedVerdict: '',
                          }))
                        }
                        disabled={formLocked || isLoadingContext}
                        required
                        className={inputClass}
                      >
                        {challengeFieldOptions.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <SourceFields
                      idPrefix="challenge"
                      prompt="Which source changes the conclusion?"
                      type={challenge.sourceType}
                      locator={challenge.sourceLocator}
                      identifier={challenge.sourceIdentifier}
                      disabled={formLocked}
                      onTypeChange={(sourceType) =>
                        setChallenge((current) => ({ ...current, sourceType }))
                      }
                      onLocatorChange={(sourceLocator) =>
                        setChallenge((current) => ({ ...current, sourceLocator }))
                      }
                      onIdentifierChange={(sourceIdentifier) =>
                        setChallenge((current) => ({ ...current, sourceIdentifier }))
                      }
                    />

                    <Field
                      label="Which evidence step changes?"
                      hint="Choose the reviewed step between giving the medicine and observing a result in people."
                    >
                      <select
                        value={challenge.evidenceNodeId}
                        onChange={(event) =>
                          setChallenge((current) => ({
                            ...current,
                            evidenceNodeId: event.target.value,
                          }))
                        }
                        disabled={formLocked || isLoadingContext}
                        required
                        className={inputClass}
                      >
                        <option value="">Choose an evidence step</option>
                        {context.evidenceNodes.map((node) => (
                          <option key={node.id} value={node.id}>
                            {evidenceNodeLabel(node)}: {evidenceNodeTitle(node)} ·{' '}
                            {humanStatus(node.state)}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="What kind of evidence supports your challenge?">
                      <select
                        value={challenge.claimNature}
                        onChange={(event) =>
                          setChallenge((current) => ({
                            ...current,
                            claimNature: event.target.value as ClaimNature,
                          }))
                        }
                        disabled={formLocked}
                        required
                        className={inputClass}
                      >
                        {CLAIM_NATURE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <ReplacementField
                      label="What verdict do you propose?"
                      field={challenge.selectedField}
                      kind={challengeValueKind}
                      allowedValues={selectedChallengeField?.allowedValues ?? []}
                      proposedText={challenge.proposedText}
                      proposedValueText={challenge.proposedValueText}
                      proposedStoppedVerdict={challenge.proposedStoppedVerdict}
                      disabled={formLocked}
                      onTextChange={(proposedText) =>
                        setChallenge((current) => ({ ...current, proposedText }))
                      }
                      onValueChange={(proposedValueText) =>
                        setChallenge((current) => ({ ...current, proposedValueText }))
                      }
                      onStoppedVerdictChange={(proposedStoppedVerdict) =>
                        setChallenge((current) => ({ ...current, proposedStoppedVerdict }))
                      }
                    />

                    <BeforeAfter
                      label={selectedChallengeField?.label ?? 'Selected conclusion field'}
                      before={currentDisplay(challengeValueKind, challengeCurrentValue)}
                      after={challengeProposedDisplay}
                    />

                    <Field label="What was wrong or missing in the current reasoning?">
                      <textarea
                        value={challenge.whatWasWrongOrMissing}
                        onChange={(event) =>
                          setChallenge((current) => ({
                            ...current,
                            whatWasWrongOrMissing: event.target.value,
                          }))
                        }
                        disabled={formLocked}
                        required
                        rows={5}
                        maxLength={6_000}
                        className={inputClass}
                        placeholder="Name the unsupported step, conflicting evidence, or missing limit on the claim."
                      />
                    </Field>

                    <Field label="Why does the source support your proposed conclusion?">
                      <textarea
                        value={challenge.reasoning}
                        onChange={(event) =>
                          setChallenge((current) => ({ ...current, reasoning: event.target.value }))
                        }
                        disabled={formLocked}
                        required
                        rows={4}
                        maxLength={6_000}
                        className={inputClass}
                        placeholder="Explain how the cited finding supports the part of the conclusion you chose."
                      />
                    </Field>

                    <AffectsField
                      name="challenge-affects"
                      value={challenge.affects}
                      disabled={formLocked}
                      onChange={(affects) => setChallenge((current) => ({ ...current, affects }))}
                    />

                    <ConflictField
                      idPrefix="challenge"
                      value={challenge.conflictsOfInterest}
                      attested={challenge.conflictsOfInterestAttested}
                      disabled={formLocked}
                      onValueChange={(conflictsOfInterest) =>
                        setChallenge((current) => ({ ...current, conflictsOfInterest }))
                      }
                      onAttestedChange={(conflictsOfInterestAttested) =>
                        setChallenge((current) => ({ ...current, conflictsOfInterestAttested }))
                      }
                    />
                  </form>
                </div>
              )}

              <div className="mt-5">
                <MachinePreview preview={preview} />
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs leading-5 text-rose-800"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </p>
              )}
              {notice && (
                <div
                  role="status"
                  className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"
                >
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{notice}</span>
                  </p>
                  {(notice.startsWith('Submitted') ||
                    notice.startsWith('A proposal for this saved source update')) && (
                    <Link
                      href="/review-queue"
                      className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold text-[#0066CC] hover:underline"
                    >
                      Open the public review queue
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-black/[0.07] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="flex items-start gap-2 text-[10px] leading-4 text-[#6E6E73] sm:max-w-md">
                <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Automated
                checks never publish a medical conclusion. Changes to a conclusion need two
                independent reviewers.
              </p>
              {needsRevisionCreation ? (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-5 text-amber-950 sm:max-w-xs">
                  Use <span className="whitespace-nowrap">Revise proposal</span> above to open the
                  next editable version while keeping the earlier review history.
                </p>
              ) : (
                <div className="flex min-w-0 flex-col gap-2 min-[420px]:flex-row">
                  <button
                    type="button"
                    onClick={() => void save('save')}
                    disabled={
                      formLocked ||
                      isLoadingContext ||
                      Boolean(contextError) ||
                      challengeUnavailable
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-black/[0.12] px-4 py-2 text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {isSaving ? 'Saving…' : 'Save draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void save('submit')}
                    disabled={
                      formLocked ||
                      isLoadingContext ||
                      Boolean(contextError) ||
                      challengeUnavailable
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1D1D1F] px-4 py-2 text-xs font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {isSaving ? 'Checking…' : 'Submit for review'}
                  </button>
                </div>
              )}
            </footer>
          </div>
        ) : (
          <div className="p-6 text-sm text-[#6E6E73]" role="status">
            The signed-in account changed. Closing this private draft…
          </div>
        )}
      </dialog>
    </section>
  )
}
