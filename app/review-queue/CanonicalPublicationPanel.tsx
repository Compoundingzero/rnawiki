'use client'

import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  EyeOff,
  FileCheck2,
  Gavel,
  LoaderCircle,
  Send,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'

import { useApp } from '@/components/app-context'
import {
  MECHANISM_EVIDENCE_BASES,
  PROGRAMME_TIMELINE_DATE_BASES,
  PROGRAMME_TIMELINE_EVENT_TYPES,
  VERDICT_REVIEWER_EXPERTISE_TAGS,
  type MechanismEvidenceBasis,
  type ProgrammePresentationReadModel,
  type ProgrammePresentationSourceReadModel,
  type ProgrammeTimelineDateBasis,
  type ProgrammeTimelineEventType,
  type VerdictReviewDecision,
  type VerdictReviewerExpertiseTag,
} from '@/lib/evidence/types'
import type {
  EvidenceChange,
  EvidenceClaim,
  EvidenceDependency,
  EvidenceFinding,
  EvidenceNode,
  EvidenceProgramme,
  EvidenceSource,
  EvidenceSourceSnapshot,
  EvidenceTrial,
  ProgrammeVerdict,
  TenSecondSummary,
} from '@/lib/rna-intelligence/evidence-types'
import { resolveSafeSourceLocator } from '@/lib/source-locator'

const inputClass =
  'min-h-11 w-full rounded-xl border border-black/[0.12] bg-white px-3 py-2.5 text-sm text-[#1D1D1F] outline-none transition focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 disabled:cursor-not-allowed disabled:bg-[#F5F5F7] disabled:text-[#6E6E73]'

const EXPERTISE_LABELS: Record<VerdictReviewerExpertiseTag, string> = {
  CLINICAL_PHARMACOLOGY: 'Clinical pharmacology',
  THERAPEUTIC_AREA_MEDICINE: 'Medicine in this disease area',
  BIOSTATISTICS: 'Study statistics',
  TOXICOLOGY: 'Safety and toxicology',
  PHARMACOKINETICS: 'How the body handles the medicine',
  REGULATORY_SCIENCE: 'Regulatory review',
  CLINICAL_DEVELOPMENT: 'Clinical trial development',
}

const DECISION_LABELS: Record<VerdictReviewDecision, string> = {
  APPROVE: 'Approve this proposed version',
  CHANGES_REQUESTED: 'Request changes',
  REJECT: 'Reject this proposed version',
}

const MECHANISM_BASIS_LABELS: Record<MechanismEvidenceBasis, string> = {
  MEASURED_IN_PEOPLE: 'Measured in people',
  MEASURED_OUTSIDE_PEOPLE: 'Measured outside people',
  PREDICTED: 'Predicted',
  UNKNOWN: 'Not yet known',
}

const TIMELINE_EVENT_LABELS: Record<ProgrammeTimelineEventType, string> = {
  PROGRAMME_MILESTONE: 'Programme milestone',
  FIRST_HUMAN_ADMINISTRATION: 'First given to a person',
  PHASE_PROGRESSION: 'Study phase changed',
  IMPORTANT_RESULT: 'Important result',
  SAFETY_SIGNAL: 'Important safety finding',
  REGULATORY_ACTION: 'Regulatory decision',
  PAUSE_OR_TERMINATION: 'Programme paused or stopped',
  LICENSING_OR_ACQUISITION: 'Licensing or ownership change',
}

const TIMELINE_DATE_LABELS: Record<ProgrammeTimelineDateBasis, string> = {
  ACTUAL: 'Date occurred',
  PLANNED: 'Planned date',
  REPORTED_UNCLEAR: 'Date reported; timing unclear',
}

interface PublicConclusion {
  presentationSchemaVersion: 'programme-presentation/v1' | null
  verdictCode: string | null
  publicLabel: string
  professionalLabel: string
  oneSentenceReason: string
  indicationScope: string
  populationScope: string
  doseExposureScope: string
  periodScope: string
  trialScope: string
  outcomeScope: string
  plainMechanism: string | null
  bestSupportedFinding: string | null
  mainLimitation: string | null
  whatWasDisproven: string[]
  whatWasNotDisproven: string[]
  whatRemainsUnknown: string[]
  confidence: string
  confidenceExplanation: string | null
  conditionsThatWouldChangeVerdict: string[]
}

type ProgrammePresentationSource = ProgrammePresentationSourceReadModel
type ProgrammePresentation = ProgrammePresentationReadModel

interface ProgrammeScopeRecord {
  id: string
  drugId: string
  slug: string
  title: string
  indication: string
  targetPopulation: string
  jurisdiction: string | null
  sponsor: string | null
  partners: string[]
  status: string
  highestPhaseReached: string | null
  route: string | null
  doseExposureContext: string | null
  startDate: string | null
  endDate: string | null
  rawStoppingReason: string | null
  stoppingReasonCategory: string | null
  [key: string]: unknown
}

interface TrialSnapshotRecord {
  id: string
  programmeId: string
  trialIdentifier: string
  title: string | null
  phase: string | null
  status: string
  resultsStatus: string
  enrolment: number | null
  enrolmentType: string
  startDate: string | null
  primaryCompletionDate: string | null
  completionDate: string | null
  humanStudyStatus: string
  registrySourceId: string | null
  registrySnapshotId: string | null
  lastVerifiedAt: string | null
  [key: string]: unknown
}

interface EvidenceNodeRecord {
  id: string
  programmeId: string
  nodeType: string
  revisionNumber: number
  previousEvidenceNodeId: string | null
  state: string
  reviewStatus: string
  plainSummary: string | null
  professionalSummary: string | null
  rationale: string | null
  visible: boolean
  [key: string]: unknown
}

interface ClaimRecord {
  id: string
  claimKey: string
  nature: string
  reviewStatus: string
  plainLanguageText: string
  technicalText: string | null
  direction: string
  endpoint: string | null
  numericValue: string | number | null
  numericUnit: string | null
  uncertaintyInterval: string | null
  reviewerInterpretation: string | null
  [key: string]: unknown
}

interface InterpretabilityRecord {
  id: string
  programmeTrialId: string
  criterion: string
  state: string
  explanation: string | null
  [key: string]: unknown
}

interface SourceRecord {
  id: string
  sourceType: string
  externalIdentifier: string | null
  canonicalLocator: string
  title: string | null
  publisher: string | null
  correctionStatus: string
  hierarchy: string
  [key: string]: unknown
}

interface SourceSnapshotRecord {
  id: string
  sourceId: string
  previousSnapshotId: string | null
  retrievedAt: string
  sourcePublishedAt: string | null
  lastVerifiedAt: string | null
  hashAlgorithm: string
  contentHash: string
  metadataHash: string | null
  permittedExcerpt: string | null
  rawSnapshotLocator: string | null
  [key: string]: unknown
}

interface PublicationLinks {
  verdictClaims: Array<Record<string, unknown>>
  evidenceNodeClaims: Array<Record<string, unknown>>
  interpretabilityClaims: Array<Record<string, unknown>>
  claimSources: Array<Record<string, unknown>>
  dependencies: Array<Record<string, unknown>>
}

interface CanonicalReview {
  id: string
  reviewerName: string | null
  reviewerOrcid: string | null
  expertiseTags: VerdictReviewerExpertiseTag[] | null
  decision: VerdictReviewDecision | null
  isIndependent: boolean | null
  conflictsOfInterest: string | null
  reviewNote: string | null
  reviewedAt: string | null
}

interface CanonicalAdjudication {
  adjudicatorName: string
  adjudicatorOrcid: string | null
  expertiseTags: VerdictReviewerExpertiseTag[]
  decision: VerdictReviewDecision
  rationale: string
  conflictsOfInterest: string
  adjudicatedAt: string
}

interface WorkflowState {
  revisionId: string
  programmeId: string
  reviewStatus: string
  proposalDigestAlgorithm: 'sha256'
  proposalDigest: string
  engineVersion: string
  inputDigestAlgorithm: 'sha256'
  inputDigest: string
  proposalPreparedAt: string | null
  contributionProposalId: string | null
  sourceReviewTaskId: string | null
  activeQualifications: VerdictReviewerExpertiseTag[]
  availableQualifications: VerdictReviewerExpertiseTag[]
  viewerHasReviewed: boolean
  reviewQuorumFinal: boolean
  reviewEligibility: { canReview: boolean; reason: string | null }
  adjudicationEligibility: { canAdjudicate: boolean; reason: string | null }
  exactBundle: {
    digestAlgorithm: 'sha256'
    digest: string
    asOfDate: string
    programme: EvidenceProgramme | null
    programmeScope: ProgrammeScopeRecord
    publicConclusion: PublicConclusion
    verdict: ProgrammeVerdict | null
    tenSecondSummary: TenSecondSummary | null
    trials: EvidenceTrial[]
    trialSnapshots: TrialSnapshotRecord[]
    evidenceNodes: EvidenceNode[]
    evidenceNodeRecords: EvidenceNodeRecord[]
    claims: EvidenceClaim[]
    claimRecords: ClaimRecord[]
    interpretabilityRecords: InterpretabilityRecord[]
    sources: EvidenceSource[]
    sourceRecords: SourceRecord[]
    sourceSnapshots: EvidenceSourceSnapshot[]
    sourceSnapshotRecords: SourceSnapshotRecord[]
    presentation?: ProgrammePresentation
    dependencies: EvidenceDependency[]
    publicationLinks: PublicationLinks
    changes: EvidenceChange[]
  }
  changedVsCurrent: Array<{
    path: string
    before: unknown
    after: unknown
    source: 'accepted-contribution' | 'normalized-source-snapshot'
  }>
  machineReport: {
    engineVersion: string
    inputDigestAlgorithm: 'sha256'
    inputDigest: string
    canPublish: boolean
    findings: EvidenceFinding[]
    freshness: Array<{
      sourceId: string
      state: string
      lastCheckedDate?: string
      ageDays?: number
      maxAgeDays: number
    }>
    impactPlan: {
      affectedClaimIds: string[]
      affectedEvidenceNodeIds: string[]
      affectedProgrammeIds: string[]
      highestImpact: string | null
      requiresHumanReview: boolean
      preserveCurrentPublishedRevisionUntilReview: boolean
    }
    humanJudgment: {
      required: true
      verdictSelectedByEngine: false
      statement: string
    }
  }
  reviews: CanonicalReview[]
  adjudication: CanonicalAdjudication | null
}

interface ImplementationResponse {
  implementation:
    | {
        outcome: 'CANONICAL_CANDIDATE'
        revisionId: string
        proposalDigest: string
        reused: boolean
      }
    | {
        outcome: 'UNPUBLISHED_SOURCE_TASK_RESOLVED'
        sourceReviewTaskId: string
        sourceSnapshotId: string
        resolvedAt: string
        reused: boolean
        createsConclusion: false
      }
}

interface ApiFailure {
  error?: string
}

export interface CanonicalPublicationPanelProps {
  proposalId?: string | null
  initialRevisionId?: string | null
  medicineName: string
  programmeTitle: string
  medicineHref?: string
  initialReviewStatus?: string | null
  compact?: boolean
}

function humanize(value: string): string {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, (letter) => letter.toUpperCase())
}

function valueText(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not recorded'
  if (Array.isArray(value)) return value.length > 0 ? value.map(valueText).join('; ') : 'None'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function dateTimeLabel(value: string | null): string {
  if (!value) return 'Not recorded'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(parsed)
}

function safeWebHref(value: string | null): string | null {
  if (!value) return null
  return resolveSafeSourceLocator(value)?.href ?? null
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
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
      body = JSON.parse(text)
    } catch {
      throw new Error('RNAWiki could not read the server response. Nothing was changed.')
    }
  }
  if (!response.ok) {
    throw new Error((body as ApiFailure).error ?? `The request failed (${response.status}).`)
  }
  return body as T
}

function hasOwnFields(value: unknown, fields: readonly string[]): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    fields.every((field) => Object.prototype.hasOwnProperty.call(value, field))
  )
}

function hasRecordArray(value: unknown, fields: readonly string[]): boolean {
  return Array.isArray(value) && value.every((record) => hasOwnFields(record, fields))
}

const PROGRAMME_SCOPE_FIELDS = [
  'id',
  'drugId',
  'slug',
  'title',
  'indication',
  'targetPopulation',
  'jurisdiction',
  'sponsor',
  'partners',
  'status',
  'highestPhaseReached',
  'route',
  'doseExposureContext',
  'startDate',
  'endDate',
  'rawStoppingReason',
  'stoppingReasonCategory',
] as const

const PUBLIC_CONCLUSION_FIELDS = [
  'presentationSchemaVersion',
  'verdictCode',
  'publicLabel',
  'professionalLabel',
  'oneSentenceReason',
  'indicationScope',
  'populationScope',
  'doseExposureScope',
  'periodScope',
  'trialScope',
  'outcomeScope',
  'plainMechanism',
  'bestSupportedFinding',
  'mainLimitation',
  'whatWasDisproven',
  'whatWasNotDisproven',
  'whatRemainsUnknown',
  'confidence',
  'confidenceExplanation',
  'conditionsThatWouldChangeVerdict',
] as const

const PRESENTATION_SOURCE_FIELDS = [
  'sourceId',
  'sourceSnapshotId',
  'sourceType',
  'externalIdentifier',
  'canonicalLocator',
  'title',
  'publisher',
  'publicationDate',
  'retrievedAt',
  'contentHash',
  'claimBindings',
] as const

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function hasCompletePresentationSource(value: unknown): value is ProgrammePresentationSource {
  if (!hasOwnFields(value, PRESENTATION_SOURCE_FIELDS)) return false
  const source = value as ProgrammePresentationSource
  return (
    isNonEmptyString(source.sourceId) &&
    isNonEmptyString(source.sourceSnapshotId) &&
    isNonEmptyString(source.sourceType) &&
    resolveSafeSourceLocator(source.canonicalLocator) !== null &&
    isNonEmptyString(source.retrievedAt) &&
    Number.isFinite(Date.parse(source.retrievedAt)) &&
    /^[0-9a-f]{64}$/.test(source.contentHash) &&
    Array.isArray(source.claimBindings) &&
    source.claimBindings.length > 0 &&
    source.claimBindings.every(
      (binding) =>
        hasOwnFields(binding, ['claimId', 'relationship', 'plainLanguageText']) &&
        isNonEmptyString(binding.claimId) &&
        ['SUPPORTS', 'CONTRADICTS', 'QUALIFIES'].includes(binding.relationship) &&
        isNonEmptyString(binding.plainLanguageText),
    )
  )
}

function hasCompletePresentationClaimLinks(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (link) =>
        hasOwnFields(link, ['claimId', 'relationship']) &&
        isNonEmptyString(link.claimId) &&
        ['SUPPORTS', 'CONTRADICTS', 'QUALIFIES'].includes(link.relationship),
    ) &&
    new Set(value.map((link) => (link as { claimId: unknown }).claimId)).size === value.length
  )
}

function hasCompletePresentation(value: unknown): value is ProgrammePresentation {
  if (!hasOwnFields(value, ['schemaVersion', 'mechanismSteps', 'timelineEvents'])) return false
  const presentation = value as Partial<ProgrammePresentation>
  if (presentation.schemaVersion !== 'programme-presentation/v1') return false
  if (!Array.isArray(presentation.mechanismSteps) || !Array.isArray(presentation.timelineEvents)) {
    return false
  }
  if (presentation.mechanismSteps.length < 3 || presentation.mechanismSteps.length > 5) return false

  const ordered = [...presentation.mechanismSteps].sort((left, right) => {
    const leftOrder = typeof left?.stepOrder === 'number' ? left.stepOrder : Number.NaN
    const rightOrder = typeof right?.stepOrder === 'number' ? right.stepOrder : Number.NaN
    return leftOrder - rightOrder
  })
  if (ordered.some((step, index) => step?.stepOrder !== index + 1)) return false
  if (new Set(ordered.map((step) => step.stepKey)).size !== ordered.length) return false

  const stepsComplete = presentation.mechanismSteps.every(
    (step) =>
      hasOwnFields(step, [
        'stepKey',
        'stepOrder',
        'plainTitle',
        'plainDescription',
        'technicalDescription',
        'evidenceBasis',
        'claimLinks',
        'sources',
      ]) &&
      isNonEmptyString(step.stepKey) &&
      isNonEmptyString(step.plainTitle) &&
      isNonEmptyString(step.plainDescription) &&
      (step.technicalDescription === null || isNonEmptyString(step.technicalDescription)) &&
      MECHANISM_EVIDENCE_BASES.includes(step.evidenceBasis) &&
      hasCompletePresentationClaimLinks(step.claimLinks) &&
      step.claimLinks.some(
        (link) => link.relationship === 'SUPPORTS' || link.relationship === 'QUALIFIES',
      ) &&
      Array.isArray(step.sources) &&
      step.sources.length > 0 &&
      step.sources.every(
        (source) =>
          hasCompletePresentationSource(source) &&
          source.claimBindings.every((binding) =>
            step.claimLinks.some(
              (link) =>
                link.claimId === binding.claimId && link.relationship === binding.relationship,
            ),
          ),
      ) &&
      step.claimLinks.every((link) =>
        step.sources.some((source) =>
          source.claimBindings.some(
            (binding) =>
              binding.claimId === link.claimId && binding.relationship === link.relationship,
          ),
        ),
      ),
  )
  if (!stepsComplete) return false

  return presentation.timelineEvents.every(
    (event) =>
      hasOwnFields(event, [
        'eventKey',
        'eventDate',
        'eventType',
        'dateBasis',
        'plainTitle',
        'plainDescription',
        'technicalDescription',
        'programmeTrialId',
        'sourceId',
        'sourceSnapshotId',
        'claimLinks',
        'source',
      ]) &&
      isNonEmptyString(event.eventKey) &&
      /^\d{4}-\d{2}-\d{2}$/.test(event.eventDate) &&
      PROGRAMME_TIMELINE_EVENT_TYPES.includes(event.eventType) &&
      PROGRAMME_TIMELINE_DATE_BASES.includes(event.dateBasis) &&
      isNonEmptyString(event.plainTitle) &&
      isNonEmptyString(event.plainDescription) &&
      (event.technicalDescription === null || isNonEmptyString(event.technicalDescription)) &&
      isNonEmptyString(event.sourceId) &&
      isNonEmptyString(event.sourceSnapshotId) &&
      hasCompletePresentationClaimLinks(event.claimLinks) &&
      event.claimLinks.some((link) => link.relationship === 'SUPPORTS') &&
      hasCompletePresentationSource(event.source) &&
      event.source.sourceId === event.sourceId &&
      event.source.sourceSnapshotId === event.sourceSnapshotId &&
      event.source.claimBindings.every((binding) =>
        event.claimLinks.some(
          (link) => link.claimId === binding.claimId && link.relationship === binding.relationship,
        ),
      ) &&
      event.source.claimBindings.some((binding) => binding.relationship === 'SUPPORTS'),
  )
}

const TRIAL_SNAPSHOT_FIELDS = [
  'id',
  'programmeId',
  'trialIdentifier',
  'title',
  'phase',
  'status',
  'resultsStatus',
  'enrolment',
  'enrolmentType',
  'startDate',
  'primaryCompletionDate',
  'completionDate',
  'humanStudyStatus',
  'registrySourceId',
  'registrySnapshotId',
  'lastVerifiedAt',
] as const

const EVIDENCE_NODE_RECORD_FIELDS = [
  'id',
  'programmeId',
  'nodeType',
  'revisionNumber',
  'previousEvidenceNodeId',
  'state',
  'reviewStatus',
  'plainSummary',
  'professionalSummary',
  'rationale',
  'visible',
  'presentedAsPositive',
  'presentedAsNegative',
  'lastVerifiedAt',
  'publishedAt',
  'supersededAt',
] as const

const CLAIM_RECORD_FIELDS = [
  'id',
  'programmeId',
  'claimKey',
  'revisionNumber',
  'previousClaimId',
  'programmeTrialId',
  'evidenceNodeType',
  'nature',
  'reviewStatus',
  'plainLanguageText',
  'technicalText',
  'population',
  'intervention',
  'comparator',
  'dose',
  'route',
  'duration',
  'endpoint',
  'endpointHierarchy',
  'outcomeType',
  'numericValue',
  'numericUnitRequired',
  'numericUnit',
  'resultDate',
  'participantOutcome',
  'comparatorValue',
  'comparatorGroup',
  'presentedAsPatientBenefit',
  'exploratoryNatureDisclosed',
  'stoppingReason',
  'conflictsWithClaimIds',
  'uncertaintyInterval',
  'direction',
  'timepoint',
  'reviewerInterpretation',
  'lastVerifiedAt',
  'publishedAt',
  'supersededAt',
] as const

const INTERPRETABILITY_RECORD_FIELDS = [
  'id',
  'programmeId',
  'programmeTrialId',
  'criterion',
  'state',
  'revisionNumber',
  'previousAssessmentId',
  'reviewStatus',
  'explanation',
  'lastVerifiedAt',
  'publishedAt',
  'supersededAt',
] as const

const SOURCE_RECORD_FIELDS = [
  'id',
  'sourceType',
  'externalIdentifier',
  'canonicalLocator',
  'title',
  'publisher',
  'sponsor',
  'publicationDate',
  'correctionStatus',
  'jurisdiction',
  'hierarchy',
] as const

const SOURCE_SNAPSHOT_RECORD_FIELDS = [
  'id',
  'sourceId',
  'previousSnapshotId',
  'retrievedAt',
  'sourcePublishedAt',
  'lastVerifiedAt',
  'hashAlgorithm',
  'contentHash',
  'metadataHash',
  'permittedExcerpt',
  'rawSnapshotLocator',
] as const

export function hasCompleteExactPublicationPreview(state: WorkflowState | null): boolean {
  if (!state) return false
  const candidate = state as Partial<WorkflowState>
  if (!candidate.exactBundle || !candidate.machineReport) return false
  const bundle = candidate.exactBundle as Partial<WorkflowState['exactBundle']>
  const links = bundle.publicationLinks as Partial<PublicationLinks> | undefined
  return Boolean(
    candidate.proposalDigestAlgorithm === 'sha256' &&
    bundle.digestAlgorithm === 'sha256' &&
    typeof bundle.digest === 'string' &&
    /^[0-9a-f]{64}$/.test(bundle.digest) &&
    bundle.digest === candidate.proposalDigest &&
    typeof candidate.inputDigest === 'string' &&
    /^[0-9a-f]{64}$/.test(candidate.inputDigest) &&
    candidate.inputDigestAlgorithm === 'sha256' &&
    candidate.machineReport.inputDigestAlgorithm === 'sha256' &&
    candidate.machineReport.inputDigest === candidate.inputDigest &&
    typeof candidate.engineVersion === 'string' &&
    candidate.engineVersion.length > 0 &&
    candidate.machineReport.engineVersion === candidate.engineVersion &&
    typeof candidate.machineReport.canPublish === 'boolean' &&
    Array.isArray(candidate.machineReport.findings) &&
    typeof bundle.asOfDate === 'string' &&
    bundle.asOfDate.length > 0 &&
    Array.isArray(candidate.changedVsCurrent) &&
    Array.isArray(bundle.dependencies) &&
    Array.isArray(bundle.changes) &&
    hasOwnFields(bundle.programmeScope, PROGRAMME_SCOPE_FIELDS) &&
    hasOwnFields(bundle.publicConclusion, PUBLIC_CONCLUSION_FIELDS) &&
    (bundle.publicConclusion?.presentationSchemaVersion === 'programme-presentation/v1'
      ? Object.prototype.hasOwnProperty.call(bundle, 'presentation') &&
        hasCompletePresentation(bundle.presentation)
      : bundle.publicConclusion?.presentationSchemaVersion === null &&
        (bundle.presentation === undefined || bundle.presentation === null)) &&
    hasRecordArray(bundle.trialSnapshots, TRIAL_SNAPSHOT_FIELDS) &&
    hasRecordArray(bundle.evidenceNodeRecords, EVIDENCE_NODE_RECORD_FIELDS) &&
    hasRecordArray(bundle.claimRecords, CLAIM_RECORD_FIELDS) &&
    hasRecordArray(bundle.interpretabilityRecords, INTERPRETABILITY_RECORD_FIELDS) &&
    hasRecordArray(bundle.sourceRecords, SOURCE_RECORD_FIELDS) &&
    hasRecordArray(bundle.sourceSnapshotRecords, SOURCE_SNAPSHOT_RECORD_FIELDS) &&
    links &&
    hasRecordArray(links.verdictClaims, [
      'programmeId',
      'verdictRevisionId',
      'claimId',
      'relationship',
    ]) &&
    hasRecordArray(links.evidenceNodeClaims, [
      'programmeId',
      'evidenceNodeId',
      'claimId',
      'relationship',
    ]) &&
    hasRecordArray(links.interpretabilityClaims, [
      'programmeId',
      'assessmentId',
      'claimId',
      'relationship',
    ]) &&
    hasRecordArray(links.claimSources, [
      'programmeId',
      'claimId',
      'sourceSnapshotId',
      'relationship',
      'sourceLocator',
    ]) &&
    hasRecordArray(links.dependencies, [
      'id',
      'programmeId',
      'claimId',
      'dependentSurfaceType',
      'evidenceNodeId',
      'verdictRevisionId',
      'fieldPath',
      'impactLevel',
    ]),
  )
}

export function isCurrentCanonicalUiRequest(args: {
  requestGeneration: number
  currentRequestGeneration: number
  requestScope: string
  currentScope: string
  aborted: boolean
}): boolean {
  return (
    !args.aborted &&
    args.requestGeneration === args.currentRequestGeneration &&
    args.requestScope === args.currentScope
  )
}

export function shouldBlindCanonicalReview(args: {
  viewerHasReviewed: boolean
  reviewQuorumFinal: boolean
  decision: VerdictReviewDecision | null
}): boolean {
  return (!args.viewerHasReviewed && !args.reviewQuorumFinal) || args.decision === null
}

function FactList({ values, empty = 'None recorded.' }: { values: string[]; empty?: string }) {
  if (values.length === 0) return <p className="text-[11px] leading-5 text-[#6E6E73]">{empty}</p>
  return (
    <ul className="space-y-1.5 text-[11px] leading-5 text-[#424245]">
      {values.map((value, index) => (
        <li key={`${index}:${value}`} className="break-words">
          • {value}
        </li>
      ))}
    </ul>
  )
}

function Pair({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-[11px] leading-5 text-[#1D1D1F]">
        {valueText(value)}
      </dd>
    </div>
  )
}

function PresentationSourceRows({ sources }: { sources: ProgrammePresentationSource[] }) {
  const uniqueSources = sources.filter(
    (source, index, all) =>
      all.findIndex((candidate) => candidate.sourceSnapshotId === source.sourceSnapshotId) ===
      index,
  )

  return (
    <ul className="space-y-2" aria-label="Exact saved source versions">
      {uniqueSources.map((source) => {
        const href = safeWebHref(source.canonicalLocator)
        return (
          <li
            key={source.sourceSnapshotId}
            className="min-w-0 rounded-xl border border-black/[0.07] bg-[#F5F5F7] p-3"
          >
            <p className="break-words text-[11px] font-semibold leading-5 text-[#1D1D1F]">
              {source.title || source.externalIdentifier || 'Saved source'}
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[#6E6E73]">
              Exact source version saved {dateTimeLabel(source.retrievedAt)}
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
              <summary className="inline-flex min-h-11 cursor-pointer items-center text-[9px] font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                Technical source-version details
              </summary>
              <p className="break-all font-mono text-[9px] leading-4 text-[#6E6E73]">
                Saved version {source.sourceSnapshotId}
              </p>
              <p className="break-all font-mono text-[9px] leading-4 text-[#6E6E73]">
                Source fingerprint sha256:{source.contentHash}
              </p>
            </details>
          </li>
        )
      })}
    </ul>
  )
}

function ExactPresentation({
  presentation,
  headingIdPrefix,
}: {
  presentation: ProgrammePresentation | null
  headingIdPrefix: string
}) {
  if (!presentation) {
    return (
      <p className="rounded-2xl border border-dashed border-black/[0.12] p-4 text-[11px] leading-5 text-[#6E6E73]">
        This older proposed version has no reviewed mechanism map or important-event timeline.
      </p>
    )
  }

  const mechanismSteps = [...presentation.mechanismSteps].sort(
    (left, right) => left.stepOrder - right.stepOrder || left.stepKey.localeCompare(right.stepKey),
  )
  const timelineEvents = [...presentation.timelineEvents].sort(
    (left, right) =>
      left.eventDate.localeCompare(right.eventDate) || left.eventKey.localeCompare(right.eventKey),
  )
  const mechanismHeadingId = `${headingIdPrefix}-mechanism`
  const timelineHeadingId = `${headingIdPrefix}-timeline`

  return (
    <div className="space-y-5" data-testid="canonical-presentation-preview">
      <section className="space-y-3" aria-labelledby={mechanismHeadingId}>
        <div>
          <h5 id={mechanismHeadingId} className="text-xs font-bold text-[#1D1D1F]">
            Mechanism stages that will appear publicly
          </h5>
          <p className="mt-1 text-[10px] leading-4 text-[#6E6E73]">
            Review the wording, evidence label, linked statements, and exact saved source versions
            for every stage. “Measured in people” comes from a human study, and “measured outside
            people” comes from laboratory or non-human work. “Predicted” is a reviewer-assigned
            expectation, not a measurement. RNA Intelligence checks that the stage has a linked
            statement and saved source version; it does not judge the scientific model or reasoning
            behind the prediction. “Not yet known” means the reviewed sources do not establish it.
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
          aria-label="Proposed ordered mechanism stages"
        >
          {mechanismSteps.map((step) => (
            <li
              key={step.stepKey}
              className="min-w-0 rounded-2xl border border-black/[0.08] p-3"
              data-testid="canonical-presentation-mechanism-stage"
            >
              <p className="font-mono text-[9px] font-semibold text-[#0066CC]">
                Stage {step.stepOrder}
              </p>
              <h6 className="mt-1 break-words text-xs font-bold leading-5 text-[#1D1D1F]">
                {step.plainTitle}
              </h6>
              <p className="mt-1 break-words text-[11px] leading-5 text-[#424245]">
                {step.plainDescription}
              </p>
              <p className="mt-2 inline-flex rounded-full border border-black/[0.08] bg-[#F5F5F7] px-2 py-1 text-[9px] font-semibold leading-4 text-[#424245]">
                Evidence: {MECHANISM_BASIS_LABELS[step.evidenceBasis]}
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
              <details className="mt-1">
                <summary className="inline-flex min-h-11 cursor-pointer items-center text-[9px] font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                  Technical statement links ({step.claimLinks.length})
                </summary>
                <p className="break-all font-mono text-[9px] leading-4 text-[#6E6E73]">
                  {step.claimLinks
                    .map((link) => `${link.relationship}: ${link.claimId}`)
                    .join('; ')}
                </p>
              </details>
              <div className="mt-2">
                <PresentationSourceRows sources={step.sources} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3" aria-labelledby={timelineHeadingId}>
        <div>
          <h5 id={timelineHeadingId} className="text-xs font-bold text-[#1D1D1F]">
            Source events that will appear on the public timeline
          </h5>
          <p className="mt-1 text-[10px] leading-4 text-[#6E6E73]">
            RNAWiki publication and revision dates come from the permanent public version history;
            they are not medical evidence. “Date occurred” means the source reports that the event
            happened; “planned date” is a schedule, not a completed event; and “timing unclear”
            means the source did not make that distinction clear.
          </p>
        </div>
        {timelineEvents.length > 0 ? (
          <ol className="space-y-3">
            {timelineEvents.map((event) => (
              <li
                key={event.eventKey}
                className="min-w-0 rounded-2xl border border-black/[0.08] p-4"
                data-testid="canonical-presentation-timeline-event"
              >
                <p className="font-mono text-[9px] font-semibold text-[#0066CC]">
                  {event.eventDate} · {TIMELINE_EVENT_LABELS[event.eventType]} ·{' '}
                  {TIMELINE_DATE_LABELS[event.dateBasis]}
                </p>
                <h6 className="mt-1 break-words text-xs font-bold leading-5 text-[#1D1D1F]">
                  {event.plainTitle}
                </h6>
                <p className="mt-1 break-words text-[11px] leading-5 text-[#424245]">
                  {event.plainDescription}
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
                <details className="mt-1">
                  <summary className="inline-flex min-h-11 cursor-pointer items-center text-[9px] font-semibold text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2">
                    Technical statement links ({event.claimLinks.length})
                  </summary>
                  <p className="break-all font-mono text-[9px] leading-4 text-[#6E6E73]">
                    {event.claimLinks
                      .map((link) => `${link.relationship}: ${link.claimId}`)
                      .join('; ')}
                  </p>
                </details>
                <div className="mt-2">
                  <PresentationSourceRows sources={[event.source]} />
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[11px] leading-5 text-[#6E6E73]">
            This proposed version has no important event backed by an outside source, so the public
            timeline will stay hidden.
          </p>
        )}
      </section>
    </div>
  )
}

function recordFieldLabel(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/^./, (letter) => letter.toUpperCase())
}

function RecordFields({ record }: { record: Record<string, unknown> }) {
  return (
    <dl className="grid min-w-0 gap-3 sm:grid-cols-2">
      {Object.entries(record).map(([field, value]) => (
        <Pair key={field} label={recordFieldLabel(field)} value={value} />
      ))}
    </dl>
  )
}

function RecordCollection({
  heading,
  records,
}: {
  heading: string
  records: Array<Record<string, unknown>>
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">{heading}</p>
      {records.length === 0 ? (
        <p className="text-[10px] leading-4 text-[#6E6E73]">None in this reviewed update.</p>
      ) : (
        records.map((record, index) => (
          <article
            key={String(record.id ?? `${heading}:${index}`)}
            className="rounded-xl bg-[#F5F5F7] p-3"
          >
            <RecordFields record={record} />
          </article>
        ))
      )}
    </div>
  )
}

function ExpertiseChoices({
  available,
  selected,
  disabled,
  name,
  onChange,
}: {
  available: VerdictReviewerExpertiseTag[]
  selected: VerdictReviewerExpertiseTag[]
  disabled: boolean
  name: string
  onChange: (next: VerdictReviewerExpertiseTag[]) => void
}) {
  const active = new Set(available)
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold leading-5 text-[#1D1D1F]">
        Approved subject areas used for this decision
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {VERDICT_REVIEWER_EXPERTISE_TAGS.map((tag) => {
          const qualified = active.has(tag)
          return (
            <label
              key={tag}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-black/[0.09] px-3 py-2 text-[11px] leading-5 text-[#424245] has-[:checked]:border-[#0071E3] has-[:checked]:bg-blue-50 has-[:checked]:font-semibold has-[:checked]:text-[#0066CC]"
            >
              <input
                type="checkbox"
                name={name}
                value={tag}
                checked={selected.includes(tag)}
                disabled={disabled || !qualified}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...selected, tag]
                      : selected.filter((value) => value !== tag),
                  )
                }
                className="h-4 w-4 shrink-0 accent-[#0071E3]"
              />
              <span>
                {EXPERTISE_LABELS[tag]}
                {!qualified && <span className="block text-[9px] text-[#6E6E73]">Not granted</span>}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function DecisionChoices({
  value,
  disabled,
  name,
  onChange,
}: {
  value: VerdictReviewDecision | ''
  disabled: boolean
  name: string
  onChange: (value: VerdictReviewDecision) => void
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold text-[#1D1D1F]">Decision</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {(Object.keys(DECISION_LABELS) as VerdictReviewDecision[]).map((decision) => (
          <label
            key={decision}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-black/[0.09] px-3 py-2 text-[11px] leading-5 text-[#424245] has-[:checked]:border-[#0071E3] has-[:checked]:bg-blue-50 has-[:checked]:font-semibold has-[:checked]:text-[#0066CC]"
          >
            <input
              type="radio"
              name={name}
              value={decision}
              checked={value === decision}
              disabled={disabled}
              required
              onChange={() => onChange(decision)}
              className="h-4 w-4 shrink-0 accent-[#0071E3]"
            />
            {DECISION_LABELS[decision]}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function ExactBundle({ state }: { state: WorkflowState }) {
  const bundle = state.exactBundle
  const conclusion = bundle.publicConclusion
  const findingsByGroup = useMemo(() => {
    const groups = new Map<string, EvidenceFinding[]>()
    for (const finding of state.machineReport.findings) {
      const rows = groups.get(finding.group) ?? []
      rows.push(finding)
      groups.set(finding.group, rows)
    }
    return groups
  }, [state.machineReport.findings])
  const snapshotsBySource = useMemo(() => {
    const grouped = new Map<string, SourceSnapshotRecord[]>()
    for (const snapshot of bundle.sourceSnapshotRecords) {
      grouped.set(snapshot.sourceId, [...(grouped.get(snapshot.sourceId) ?? []), snapshot])
    }
    return grouped
  }, [bundle.sourceSnapshotRecords])

  return (
    <section
      data-testid="canonical-exact-bundle"
      aria-labelledby={`exact-bundle-${state.revisionId}`}
      className="space-y-5 rounded-2xl border border-black/[0.09] bg-white p-4 sm:p-5"
    >
      <div className="min-w-0 rounded-2xl bg-[#F5F5F7] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
          Evidence and conclusion under review
        </p>
        <h3
          id={`exact-bundle-${state.revisionId}`}
          className="mt-1 text-base font-bold text-[#1D1D1F]"
        >
          Review every item below before deciding
        </h3>
        <p className="mt-2 text-[10px] leading-4 text-[#6E6E73]">
          Prepared {dateTimeLabel(state.proposalPreparedAt)} · evidence checked as of{' '}
          {bundle.asOfDate}
        </p>
        <details className="mt-1">
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-[10px] font-semibold text-[#0066CC]">
            Technical review reference
          </summary>
          <code
            data-testid="canonical-review-reference"
            className="block break-all font-mono text-[9px] leading-4 text-[#6E6E73]"
          >
            {bundle.digestAlgorithm}:{bundle.digest}
          </code>
        </details>
      </div>

      <section className="space-y-3" aria-labelledby={`scope-${state.revisionId}`}>
        <h4 id={`scope-${state.revisionId}`} className="text-sm font-bold text-[#1D1D1F]">
          Development programme covered
        </h4>
        {bundle.programmeScope ? (
          <dl className="grid min-w-0 gap-4 rounded-2xl bg-[#F5F5F7] p-4 sm:grid-cols-2">
            <Pair label="Programme name" value={bundle.programmeScope.title} />
            <Pair label="Intended use" value={bundle.programmeScope.indication} />
            <Pair label="People covered" value={bundle.programmeScope.targetPopulation} />
            <Pair label="Development status" value={humanize(bundle.programmeScope.status)} />
            <Pair label="Highest phase reached" value={bundle.programmeScope.highestPhaseReached} />
            <Pair label="How it was given" value={bundle.programmeScope.route} />
            <Pair label="Dose or exposure" value={bundle.programmeScope.doseExposureContext} />
            <Pair
              label="Company or organisation leading the programme"
              value={bundle.programmeScope.sponsor}
            />
            <Pair label="Partners" value={bundle.programmeScope.partners} />
            <Pair label="Jurisdiction" value={bundle.programmeScope.jurisdiction} />
            <Pair label="Started" value={bundle.programmeScope.startDate} />
            <Pair label="Ended" value={bundle.programmeScope.endDate} />
            <Pair
              label="Recorded reason development stopped"
              value={bundle.programmeScope.rawStoppingReason}
            />
            <Pair
              label="Stopping reason category"
              value={
                bundle.programmeScope.stoppingReasonCategory
                  ? humanize(bundle.programmeScope.stoppingReasonCategory)
                  : null
              }
            />
          </dl>
        ) : (
          <p className="text-xs text-rose-800">
            The programme scope is missing. Do not review or publish.
          </p>
        )}
      </section>

      <section className="space-y-3" aria-labelledby={`conclusion-${state.revisionId}`}>
        <h4 id={`conclusion-${state.revisionId}`} className="text-sm font-bold text-[#1D1D1F]">
          Public conclusion and summary
        </h4>
        <div className="space-y-4 rounded-2xl border border-black/[0.08] p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
              Plain-language conclusion
            </p>
            <p className="mt-1 break-words text-sm font-semibold leading-6 text-[#1D1D1F]">
              {conclusion.publicLabel}
            </p>
            <p className="mt-2 break-words text-xs leading-5 text-[#424245]">
              {conclusion.oneSentenceReason}
            </p>
            <p className="mt-2 break-words text-[11px] leading-5 text-[#6E6E73]">
              Clinical wording: {conclusion.professionalLabel}
            </p>
          </div>
          <dl className="grid min-w-0 gap-4 border-t border-black/[0.07] pt-4 sm:grid-cols-2">
            <Pair
              label="Conclusion category"
              value={conclusion.verdictCode ? humanize(conclusion.verdictCode) : null}
            />
            <Pair label="Use" value={conclusion.indicationScope} />
            <Pair label="People" value={conclusion.populationScope} />
            <Pair label="Dose or exposure" value={conclusion.doseExposureScope} />
            <Pair label="Period" value={conclusion.periodScope} />
            <Pair label="Trials" value={conclusion.trialScope} />
            <Pair label="Outcome" value={conclusion.outcomeScope} />
          </dl>
          <dl className="grid min-w-0 gap-4 border-t border-black/[0.07] pt-4 sm:grid-cols-3">
            <Pair label="How it was meant to work" value={conclusion.plainMechanism} />
            <Pair label="Best-supported finding" value={conclusion.bestSupportedFinding} />
            <Pair label="Main limitation" value={conclusion.mainLimitation} />
          </dl>
          <div className="grid min-w-0 gap-4 border-t border-black/[0.07] pt-4 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
                What this rules out
              </p>
              <div className="mt-2">
                <FactList values={conclusion.whatWasDisproven} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
                What this does not rule out
              </p>
              <div className="mt-2">
                <FactList values={conclusion.whatWasNotDisproven} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
                What remains unknown
              </p>
              <div className="mt-2">
                <FactList values={conclusion.whatRemainsUnknown} />
              </div>
            </div>
          </div>
          <dl className="grid min-w-0 gap-4 border-t border-black/[0.07] pt-4 sm:grid-cols-2">
            <Pair label="Confidence" value={humanize(conclusion.confidence)} />
            <Pair label="Why this confidence level" value={conclusion.confidenceExplanation} />
          </dl>
          <div className="border-t border-black/[0.07] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
              What evidence would change this conclusion
            </p>
            <div className="mt-2">
              <FactList values={conclusion.conditionsThatWouldChangeVerdict} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby={`presentation-${state.revisionId}`}>
        <h4 id={`presentation-${state.revisionId}`} className="text-sm font-bold text-[#1D1D1F]">
          Mechanism map and decision timeline
        </h4>
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          These are the exact words, labels, and saved source versions under review. Publication
          cannot substitute different content.
        </p>
        <ExactPresentation
          presentation={bundle.presentation ?? null}
          headingIdPrefix={`exact-presentation-${state.revisionId}`}
        />
      </section>

      <section className="space-y-3" aria-labelledby={`sources-${state.revisionId}`}>
        <h4 id={`sources-${state.revisionId}`} className="text-sm font-bold text-[#1D1D1F]">
          Sources and the saved versions reviewed
        </h4>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {bundle.sourceRecords.map((source) => (
            <article key={source.id} className="min-w-0 rounded-2xl border border-black/[0.08] p-4">
              <p className="break-words text-xs font-semibold text-[#1D1D1F]">
                {source.title || source.externalIdentifier || 'Untitled source'}
              </p>
              <p className="mt-1 break-words text-[10px] leading-4 text-[#6E6E73]">
                {humanize(source.sourceType)} · {source.publisher ?? 'Publisher not recorded'} ·{' '}
                {humanize(source.correctionStatus)}
              </p>
              {safeWebHref(source.canonicalLocator) ? (
                <a
                  href={safeWebHref(source.canonicalLocator) ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex min-h-11 max-w-full items-center gap-1.5 break-all text-[11px] font-semibold leading-5 text-[#0066CC] hover:underline"
                >
                  {source.externalIdentifier || 'Open source'}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </a>
              ) : (
                <p className="mt-2 break-all text-[11px] text-[#6E6E73]">
                  Saved source address: {source.canonicalLocator}
                </p>
              )}
              <ul className="mt-2 space-y-2 text-[9px] leading-4 text-[#6E6E73]">
                {(snapshotsBySource.get(source.id) ?? []).map((snapshot) => (
                  <li key={snapshot.id} className="min-w-0">
                    {safeWebHref(snapshot.rawSnapshotLocator) ? (
                      <a
                        href={safeWebHref(snapshot.rawSnapshotLocator) ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 max-w-full items-center gap-1 break-all font-semibold text-[#0066CC] hover:underline"
                      >
                        Open saved source version
                        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                      </a>
                    ) : (
                      <span>Exact source version saved</span>
                    )}
                    <span className="block">Saved {dateTimeLabel(snapshot.retrievedAt)}</span>
                    <details className="mt-1">
                      <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-[#0066CC]">
                        Technical source-version details
                      </summary>
                      <code className="block break-all font-mono">{snapshot.id}</code>
                    </details>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby={`graph-${state.revisionId}`}>
        <h4 id={`graph-${state.revisionId}`} className="text-sm font-bold text-[#1D1D1F]">
          Trials, evidence steps and statements
        </h4>
        <div className="space-y-3">
          {bundle.trialSnapshots.map((trial) => (
            <article key={trial.id} className="rounded-2xl bg-[#F5F5F7] p-4">
              <p className="text-xs font-semibold text-[#1D1D1F]">
                {trial.title || 'Registry study'} · {trial.trialIdentifier}
              </p>
              <dl className="mt-2 grid gap-3 sm:grid-cols-3">
                <Pair label="Phase" value={trial.phase} />
                <Pair label="Registry status" value={humanize(trial.status)} />
                <Pair label="Results" value={humanize(trial.resultsStatus)} />
                <Pair label="Enrolment" value={trial.enrolment} />
                <Pair label="Enrolment type" value={humanize(trial.enrolmentType)} />
                <Pair label="Human study" value={humanize(trial.humanStudyStatus)} />
                <Pair label="Started" value={trial.startDate} />
                <Pair label="Main outcome completed" value={trial.primaryCompletionDate} />
                <Pair label="Completed" value={trial.completionDate} />
                <Pair
                  label="Registry version saved"
                  value={trial.registrySnapshotId ? 'Yes' : 'Not recorded'}
                />
              </dl>
            </article>
          ))}
          {bundle.evidenceNodeRecords.map((node) => (
            <article key={node.id} className="rounded-2xl border border-black/[0.08] p-4">
              <p className="text-xs font-semibold text-[#1D1D1F]">
                {humanize(node.nodeType)} · {humanize(node.state)}
              </p>
              <p className="mt-2 break-words text-[11px] leading-5 text-[#424245]">
                {node.plainSummary || 'No plain-language summary recorded.'}
              </p>
              {node.professionalSummary && (
                <p className="mt-2 break-words text-[10px] leading-5 text-[#6E6E73]">
                  Clinical summary: {node.professionalSummary}
                </p>
              )}
              {node.rationale && (
                <p className="mt-2 break-words text-[10px] leading-5 text-[#6E6E73]">
                  Reason: {node.rationale}
                </p>
              )}
            </article>
          ))}
          {bundle.claimRecords.map((claim) => (
            <article key={claim.id} className="rounded-2xl border border-black/[0.08] p-4">
              <p className="break-words text-xs font-semibold leading-5 text-[#1D1D1F]">
                {claim.plainLanguageText}
              </p>
              <p className="mt-1 text-[10px] leading-4 text-[#6E6E73]">
                {humanize(claim.nature)} · {humanize(claim.direction)}
              </p>
              {claim.technicalText && (
                <p className="mt-2 whitespace-pre-wrap break-words text-[10px] leading-5 text-[#424245]">
                  {claim.technicalText}
                </p>
              )}
              {(claim.numericValue !== null || claim.endpoint) && (
                <p className="mt-2 break-words text-[10px] leading-5 text-[#424245]">
                  {claim.endpoint ? `Outcome measured: ${claim.endpoint}. ` : ''}
                  {claim.numericValue !== null
                    ? `Recorded result: ${claim.numericValue}${claim.numericUnit ? ` ${claim.numericUnit}` : ''}${claim.uncertaintyInterval ? ` (${claim.uncertaintyInterval})` : ''}.`
                    : ''}
                </p>
              )}
              {claim.reviewerInterpretation && (
                <p className="mt-2 break-words text-[10px] leading-5 text-[#6E6E73]">
                  Reviewer context: {claim.reviewerInterpretation}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby={`study-checks-${state.revisionId}`}>
        <h4 id={`study-checks-${state.revisionId}`} className="text-sm font-bold text-[#1D1D1F]">
          Checks on what each study can tell us
        </h4>
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          These records note limits such as study size, who was included, whether the dose was
          adequate, whether the right outcome was measured and whether the study ran long enough.
        </p>
        {bundle.interpretabilityRecords.length === 0 ? (
          <p className="text-[11px] leading-5 text-[#6E6E73]">No study-quality record is linked.</p>
        ) : (
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {bundle.interpretabilityRecords.map((record) => (
              <article key={record.id} className="rounded-2xl border border-black/[0.08] p-4">
                <p className="text-xs font-semibold text-[#1D1D1F]">
                  {humanize(record.criterion)} · {humanize(record.state)}
                </p>
                <p className="mt-2 break-words text-[11px] leading-5 text-[#424245]">
                  {record.explanation || 'No explanation recorded.'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        data-testid="canonical-machine-findings"
        className="space-y-3"
        aria-labelledby={`checks-${state.revisionId}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 id={`checks-${state.revisionId}`} className="text-sm font-bold text-[#1D1D1F]">
            RNA Intelligence checks B–H
          </h4>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide ${state.machineReport.canPublish ? 'text-emerald-800' : 'text-rose-800'}`}
          >
            {state.machineReport.canPublish ? 'Automated checks passed' : 'Blocked'}
          </span>
        </div>
        <p className="text-[11px] leading-5 text-[#6E6E73]">
          These checks test structure, source freshness, evidence links, scope and wording. They do
          not choose the scientific conclusion.
        </p>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {['B', 'C', 'D', 'E', 'F', 'G', 'H'].map((group) => {
            const findings = findingsByGroup.get(group) ?? []
            return (
              <article key={group} className="rounded-2xl border border-black/[0.08] p-4">
                <p className="text-xs font-semibold text-[#1D1D1F]">Check group {group}</p>
                {findings.length === 0 ? (
                  <p className="mt-2 text-[11px] leading-5 text-emerald-800">No finding.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {findings.map((finding, index) => (
                      <li
                        key={`${finding.code}:${index}`}
                        className="break-words text-[11px] leading-5 text-[#424245]"
                      >
                        <strong>{humanize(finding.level)}:</strong> {finding.message}{' '}
                        <span className="text-[#6E6E73]">
                          Next step: {finding.correctiveAction}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <section
        data-testid="canonical-change-diff"
        className="space-y-3"
        aria-labelledby={`diff-${state.revisionId}`}
      >
        <h4 id={`diff-${state.revisionId}`} className="text-sm font-bold text-[#1D1D1F]">
          What changes from the current publication
        </h4>
        {state.changedVsCurrent.length === 0 ? (
          <p className="text-[11px] leading-5 text-[#6E6E73]">No changed field was reported.</p>
        ) : (
          <ul className="space-y-3">
            {state.changedVsCurrent.map((change, index) => (
              <li
                key={`${change.path}:${index}`}
                className="grid min-w-0 gap-3 rounded-2xl bg-[#F5F5F7] p-4 sm:grid-cols-2"
              >
                <div className="min-w-0">
                  <p className="text-[9px] uppercase leading-4 text-[#6E6E73]">
                    Changed field: {recordFieldLabel(change.path.split('.').at(-1) ?? change.path)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-[11px] leading-5 text-[#424245]">
                    Before: {valueText(change.before)}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase leading-4 text-[#0066CC]">Proposed value</p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-[11px] leading-5 text-[#1D1D1F]">
                    After: {valueText(change.after)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <details
        className="rounded-2xl border border-black/[0.08]"
        data-testid="canonical-technical-details"
      >
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 py-3 text-xs font-semibold text-[#1D1D1F]">
          Technical audit details
          <ChevronRight className="h-4 w-4 text-[#6E6E73]" aria-hidden="true" />
        </summary>
        <div className="space-y-4 border-t border-black/[0.07] p-4">
          <dl className="grid min-w-0 gap-3 sm:grid-cols-2">
            <Pair label="Proposed version reference" value={state.revisionId} />
            <Pair
              label="Automated-check fingerprint"
              value={`${state.inputDigestAlgorithm}:${state.inputDigest}`}
            />
            <Pair label="Contribution" value={state.contributionProposalId} />
            <Pair label="Bound source-review task" value={state.sourceReviewTaskId} />
          </dl>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
              Fingerprint for all evidence and wording reviewed above
            </p>
            <code
              data-testid="canonical-proposal-digest"
              className="mt-2 block break-all rounded-xl bg-[#F5F5F7] px-3 py-2 font-mono text-[10px] leading-5 text-[#0066CC]"
            >
              {bundle.digestAlgorithm}:{bundle.digest}
            </code>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
              All saved programme fields
            </p>
            <div className="rounded-xl bg-[#F5F5F7] p-3">
              <RecordFields record={bundle.programmeScope} />
            </div>
          </div>
          <RecordCollection heading="All saved trial fields" records={bundle.trialSnapshots} />
          <RecordCollection
            heading="All saved evidence-step fields"
            records={bundle.evidenceNodeRecords}
          />
          <RecordCollection heading="All saved statement fields" records={bundle.claimRecords} />
          <RecordCollection
            heading="Study quality checks"
            records={bundle.interpretabilityRecords}
          />
          <RecordCollection heading="All saved source fields" records={bundle.sourceRecords} />
          <RecordCollection
            heading="All saved source-version fields"
            records={bundle.sourceSnapshotRecords}
          />
          <RecordCollection
            heading="Conclusion-to-statement links"
            records={bundle.publicationLinks.verdictClaims}
          />
          <RecordCollection
            heading="Evidence-step-to-statement links"
            records={bundle.publicationLinks.evidenceNodeClaims}
          />
          <RecordCollection
            heading="Study-check-to-statement links"
            records={bundle.publicationLinks.interpretabilityClaims}
          />
          <RecordCollection
            heading="Statement-to-source links"
            records={bundle.publicationLinks.claimSources}
          />
          <RecordCollection
            heading="Public page update links"
            records={bundle.publicationLinks.dependencies}
          />
          <RecordCollection
            heading="Comparison with the current publication"
            records={state.changedVsCurrent}
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
              Dependency edges
            </p>
            <ul className="mt-2 space-y-1 break-all font-mono text-[9px] leading-4 text-[#424245]">
              {bundle.dependencies.map((dependency, index) => (
                <li key={index}>
                  {dependency.from.type}:{dependency.from.id}:{dependency.from.field ?? '*'} →{' '}
                  {dependency.to.type}:{dependency.to.id}:{dependency.to.field ?? '*'} ·{' '}
                  {dependency.impact}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6E6E73]">
              Change inputs
            </p>
            <ul className="mt-2 space-y-1 break-all font-mono text-[9px] leading-4 text-[#424245]">
              {bundle.changes.map((change, index) => (
                <li key={index}>
                  {change.entity.type}:{change.entity.id} · {change.changedFields.join(', ')} ·
                  snapshot {change.snapshotId ?? 'none'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </section>
  )
}

export function CanonicalPublicationPanel({
  proposalId,
  initialRevisionId,
  medicineName,
  programmeTitle,
  medicineHref,
  initialReviewStatus,
  compact = false,
}: CanonicalPublicationPanelProps) {
  const { currentUser, requireAuth } = useApp()
  const router = useRouter()
  const [revisionId, setRevisionId] = useState(initialRevisionId ?? null)
  const [stateSnapshot, setStateSnapshot] = useState<{
    scope: string
    value: WorkflowState
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [sourceResolutionSnapshot, setSourceResolutionSnapshot] = useState<{
    accountId: string
    value: Extract<
      ImplementationResponse['implementation'],
      { outcome: 'UNPUBLISHED_SOURCE_TASK_RESOLVED' }
    >
  } | null>(null)
  const [reviewDecision, setReviewDecision] = useState<VerdictReviewDecision | ''>('')
  const [reviewExpertise, setReviewExpertise] = useState<VerdictReviewerExpertiseTag[]>([])
  const [independent, setIndependent] = useState(false)
  const [reviewCoi, setReviewCoi] = useState('')
  const [reviewCoiAttested, setReviewCoiAttested] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const [adjudicationDecision, setAdjudicationDecision] = useState<VerdictReviewDecision | ''>('')
  const [adjudicationExpertise, setAdjudicationExpertise] = useState<VerdictReviewerExpertiseTag[]>(
    [],
  )
  const [adjudicationRationale, setAdjudicationRationale] = useState('')
  const [adjudicationCoi, setAdjudicationCoi] = useState('')
  const [adjudicationCoiAttested, setAdjudicationCoiAttested] = useState(false)
  const [reload, setReload] = useState(0)
  const requestRef = useRef<{ generation: number; controller: AbortController | null }>({
    generation: 0,
    controller: null,
  })
  const mutationRef = useRef<{ generation: number; controller: AbortController | null }>({
    generation: 0,
    controller: null,
  })
  const accountId = currentUser?.id ?? null
  const [privateStateAccountId, setPrivateStateAccountId] = useState(accountId)
  const accountScopeRef = useRef(accountId)
  accountScopeRef.current = accountId
  const workflowScope = `${accountId ?? 'signed-out'}:${revisionId ?? 'unprepared'}`
  const workflowScopeRef = useRef(workflowScope)
  workflowScopeRef.current = workflowScope
  const state = stateSnapshot?.scope === workflowScope ? stateSnapshot.value : null
  const privateScopeIsCurrent = privateStateAccountId === accountId
  const visibleIsLoading = !privateScopeIsCurrent || isLoading
  const visibleIsWorking = privateScopeIsCurrent && isWorking
  const visibleError = privateScopeIsCurrent ? error : null
  const visibleNotice = privateScopeIsCurrent ? notice : null
  const sourceResolution =
    sourceResolutionSnapshot?.accountId === accountId ? sourceResolutionSnapshot.value : null
  const lastResetAccountRef = useRef(accountId)
  const isSteward = Boolean(
    currentUser && (currentUser.isAdmin || currentUser.trustTier === 'steward'),
  )
  const hasReviewerStanding = Boolean(
    currentUser &&
    (currentUser.isAdmin ||
      currentUser.trustTier === 'steward' ||
      currentUser.trustTier === 'trusted'),
  )

  useEffect(() => {
    setRevisionId(initialRevisionId ?? null)
    setSourceResolutionSnapshot(null)
  }, [initialRevisionId, proposalId])

  useEffect(() => {
    setReviewDecision('')
    setReviewExpertise([])
    setIndependent(false)
    setReviewCoi('')
    setReviewCoiAttested(false)
    setReviewNote('')
    setAdjudicationDecision('')
    setAdjudicationExpertise([])
    setAdjudicationRationale('')
    setAdjudicationCoi('')
    setAdjudicationCoiAttested(false)
    setError(null)
    if (lastResetAccountRef.current !== accountId) {
      lastResetAccountRef.current = accountId
      setPrivateStateAccountId(accountId)
      setSourceResolutionSnapshot(null)
      setNotice(null)
    }
    setIsWorking(false)
    mutationRef.current.controller?.abort()
    mutationRef.current.generation += 1
  }, [accountId, revisionId])

  useEffect(() => {
    requestRef.current.controller?.abort()
    const controller = new AbortController()
    const generation = requestRef.current.generation + 1
    const scope = workflowScope
    requestRef.current = { generation, controller }
    setStateSnapshot(null)
    if (!revisionId || !accountId || sourceResolution) {
      setIsLoading(false)
      return () => controller.abort()
    }
    setIsLoading(true)
    setError(null)
    void requestJson<WorkflowState>(
      `/api/programme-verdicts/${encodeURIComponent(revisionId)}/reviews`,
      { signal: controller.signal },
    )
      .then((next) => {
        if (
          accountScopeRef.current !== accountId ||
          !isCurrentCanonicalUiRequest({
            requestGeneration: generation,
            currentRequestGeneration: requestRef.current.generation,
            requestScope: scope,
            currentScope: workflowScopeRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          return
        }
        setStateSnapshot({ scope, value: next })
      })
      .catch((caught) => {
        if (
          accountScopeRef.current !== accountId ||
          !isCurrentCanonicalUiRequest({
            requestGeneration: generation,
            currentRequestGeneration: requestRef.current.generation,
            requestScope: scope,
            currentScope: workflowScopeRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          return
        }
        setError(
          caught instanceof Error
            ? caught.message
            : 'The saved evidence and conclusion under review could not be loaded.',
        )
      })
      .finally(() => {
        if (
          accountScopeRef.current === accountId &&
          isCurrentCanonicalUiRequest({
            requestGeneration: generation,
            currentRequestGeneration: requestRef.current.generation,
            requestScope: scope,
            currentScope: workflowScopeRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          setIsLoading(false)
        }
      })
    return () => controller.abort()
  }, [accountId, reload, revisionId, sourceResolution, workflowScope])

  useEffect(
    () => () => {
      requestRef.current.controller?.abort()
      mutationRef.current.controller?.abort()
    },
    [],
  )

  const mutate = useCallback(
    async <T,>(path: string, payload: unknown): Promise<T | null> => {
      if (!accountId) {
        requireAuth()
        return null
      }
      mutationRef.current.controller?.abort()
      const controller = new AbortController()
      const generation = mutationRef.current.generation + 1
      const scope = workflowScope
      mutationRef.current = { generation, controller }
      setIsWorking(true)
      setError(null)
      setNotice(null)
      try {
        const result = await requestJson<T>(path, {
          method: 'POST',
          body: JSON.stringify(payload),
          signal: controller.signal,
        })
        if (
          accountScopeRef.current !== accountId ||
          !isCurrentCanonicalUiRequest({
            requestGeneration: generation,
            currentRequestGeneration: mutationRef.current.generation,
            requestScope: scope,
            currentScope: workflowScopeRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          return null
        }
        return result
      } catch (caught) {
        if (
          accountScopeRef.current !== accountId ||
          !isCurrentCanonicalUiRequest({
            requestGeneration: generation,
            currentRequestGeneration: mutationRef.current.generation,
            requestScope: scope,
            currentScope: workflowScopeRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          return null
        }
        setError(caught instanceof Error ? caught.message : 'The request could not be completed.')
        return null
      } finally {
        if (
          accountScopeRef.current === accountId &&
          isCurrentCanonicalUiRequest({
            requestGeneration: generation,
            currentRequestGeneration: mutationRef.current.generation,
            requestScope: scope,
            currentScope: workflowScopeRef.current,
            aborted: controller.signal.aborted,
          })
        ) {
          setIsWorking(false)
        }
      }
    },
    [accountId, requireAuth, workflowScope],
  )

  const materialize = async () => {
    if (!proposalId || !accountId) return
    const result = await mutate<ImplementationResponse>(
      `/api/contributions/${encodeURIComponent(proposalId)}/implementation`,
      {},
    )
    if (!result) return
    if (result.implementation.outcome === 'UNPUBLISHED_SOURCE_TASK_RESOLVED') {
      setSourceResolutionSnapshot({ accountId, value: result.implementation })
      setRevisionId(null)
      setNotice(
        'The saved registry update was applied and its review task was resolved. This programme has no published conclusion, so RNAWiki did not create one.',
      )
    } else {
      setRevisionId(result.implementation.revisionId)
      setNotice(
        result.implementation.reused
          ? 'The existing proposed version is open below.'
          : 'The accepted correction is now a proposed published update. The public record is still unchanged.',
      )
    }
    router.refresh()
  }

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!state || !reviewDecision || reviewExpertise.length === 0) return
    const result = await mutate<{ review: unknown }>(
      `/api/programme-verdicts/${encodeURIComponent(state.revisionId)}/reviews`,
      {
        expectedProposalDigest: state.proposalDigest,
        decision: reviewDecision,
        expertiseTags: reviewExpertise,
        isIndependent: independent,
        conflictsOfInterest: reviewCoi,
        conflictsOfInterestAttested: reviewCoiAttested,
        reviewNote: reviewNote.trim() || null,
      },
    )
    if (!result) return
    setNotice('Your permanent decision is recorded against the review reference shown above.')
    setReload((value) => value + 1)
    router.refresh()
  }

  const submitAdjudication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!state || !adjudicationDecision || adjudicationExpertise.length === 0) return
    const result = await mutate<{ adjudication: unknown }>(
      `/api/programme-verdicts/${encodeURIComponent(state.revisionId)}/adjudication`,
      {
        expectedProposalDigest: state.proposalDigest,
        decision: adjudicationDecision,
        expertiseTags: adjudicationExpertise,
        rationale: adjudicationRationale,
        conflictsOfInterest: adjudicationCoi,
        conflictsOfInterestAttested: adjudicationCoiAttested,
      },
    )
    if (!result) return
    setNotice(
      'The independent steward decision is recorded against the evidence and wording shown above.',
    )
    setReload((value) => value + 1)
    router.refresh()
  }

  const publish = async () => {
    if (!state) return
    const result = await mutate<{ publication: { publishedVerdictRevisionId?: string } }>(
      `/api/programme-verdicts/${encodeURIComponent(state.revisionId)}/publish`,
      { expectedProposalDigest: state.proposalDigest },
    )
    if (!result) return
    setNotice(
      'Published. The public conclusion, programme and trial facts, source status and linked source-review task were updated together from the evidence shown above.',
    )
    setReload((value) => value + 1)
    router.refresh()
  }

  const decisions =
    state?.reviews.flatMap((review) => (review.decision ? [review.decision] : [])) ?? []
  const reviewersDisagree = decisions.length === 2 && decisions[0] !== decisions[1]
  const publicationApproved =
    decisions.length === 2 &&
    ((decisions[0] === 'APPROVE' && decisions[1] === 'APPROVE') ||
      (reviewersDisagree && state?.adjudication?.decision === 'APPROVE'))
  const exactPreviewComplete = hasCompleteExactPublicationPreview(state)
  const canReview = Boolean(state && exactPreviewComplete && state.reviewEligibility.canReview)
  const shellClass = compact
    ? 'mt-4 space-y-4 rounded-2xl border border-blue-200 bg-blue-50/40 p-4'
    : 'space-y-5 rounded-3xl border border-blue-200 bg-blue-50/30 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-6'

  return (
    <section
      data-testid="canonical-publication-panel"
      aria-label={`Published evidence record controls for ${medicineName}, ${programmeTitle}`}
      className={shellClass}
    >
      <header className="min-w-0">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[#0066CC]">
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Prepare the published evidence record
        </p>
        <h2 className="mt-1 break-words text-base font-bold text-[#1D1D1F]">
          {medicineName} · {programmeTitle}
        </h2>
        <p className="mt-1 text-[11px] leading-5 text-[#424245]">
          Accepted community work becomes one fixed proposed version. Two people with a
          steward-approved subject area review the same evidence and wording independently before a
          steward can publish it.
        </p>
        {medicineHref && (
          <Link
            href={medicineHref}
            data-testid="canonical-medicine-link"
            className="mt-2 inline-flex min-h-11 items-center text-[11px] font-semibold text-[#0066CC] hover:underline"
          >
            Open the current public medicine record
          </Link>
        )}
      </header>

      {!revisionId && !sourceResolution && (
        <div className="space-y-3 rounded-2xl bg-white p-4">
          <p className="text-[11px] leading-5 text-[#424245]">
            {initialReviewStatus === 'ACCEPTED_FOR_IMPLEMENTATION'
              ? 'This proposal passed community review. A steward must now prepare the proposed update and run RNA Intelligence check groups B–H. These groups check evidence links, scope, source freshness and wording; they do not decide what the evidence means.'
              : 'No proposed published update is linked to this proposal yet.'}
          </p>
          {proposalId && isSteward && (
            <button
              type="button"
              data-testid="materialize-canonical-candidate"
              onClick={() => void materialize()}
              disabled={visibleIsWorking}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1D1D1F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {visibleIsWorking ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              )}
              {visibleIsWorking ? 'Preparing reviewed update…' : 'Prepare reviewed update'}
            </button>
          )}
          {proposalId && !isSteward && (
            <p className="text-[11px] leading-5 text-[#6E6E73]">
              A steward or administrator prepares this reviewed update. Other signed-in readers can
              inspect it once it has been prepared.
            </p>
          )}
        </div>
      )}

      {sourceResolution && (
        <div
          data-testid="unpublished-source-task-resolution"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-[11px] leading-5 text-emerald-950"
        >
          <p className="flex items-start gap-2 font-semibold">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Source update applied; no conclusion created
          </p>
          <p className="mt-2">
            RNAWiki updated the recorded programme or trial facts from the reviewed source. This
            path does not create a medical conclusion.
          </p>
          <details className="mt-1">
            <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-emerald-900">
              Technical update details
            </summary>
            <p className="break-all font-mono">
              Review task {sourceResolution.sourceReviewTaskId} · saved source version{' '}
              {sourceResolution.sourceSnapshotId}
            </p>
          </details>
        </div>
      )}

      {revisionId && !accountId && (
        <button
          type="button"
          onClick={requireAuth}
          className="inline-flex min-h-11 items-center rounded-xl bg-[#1D1D1F] px-4 py-2 text-xs font-semibold text-white"
        >
          Sign in to review the evidence and proposed conclusion
        </button>
      )}

      {visibleIsLoading && (
        <p
          data-testid="canonical-workflow-loading"
          className="flex items-center gap-2 text-xs text-[#424245]"
        >
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading the saved
          evidence and wording…
        </p>
      )}

      {state && exactPreviewComplete && <ExactBundle state={state} />}

      {state && !exactPreviewComplete && (
        <p
          role="alert"
          data-testid="canonical-incomplete-preview"
          className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] leading-5 text-rose-950"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          RNAWiki did not return every saved programme, trial, evidence, source and linking record
          covered by this review reference. Review and publication are blocked until the preview is
          complete.
        </p>
      )}

      {state && (
        <section
          className="space-y-4 rounded-2xl border border-black/[0.09] bg-white p-4 sm:p-5"
          aria-labelledby={`canonical-decisions-${state.revisionId}`}
        >
          <div>
            <h3
              id={`canonical-decisions-${state.revisionId}`}
              className="text-sm font-bold text-[#1D1D1F]"
            >
              Independent decisions
            </h3>
            <p className="mt-1 text-[11px] leading-5 text-[#6E6E73]">
              A reviewer cannot see another person’s identity or private decision until they submit
              their own decision or both required reviews are complete.
            </p>
          </div>
          {state.reviews.length === 0 ? (
            <p className="text-[11px] leading-5 text-[#6E6E73]">No decision has been recorded.</p>
          ) : (
            <ol className="space-y-3">
              {state.reviews.map((review, index) => {
                const blinded = shouldBlindCanonicalReview({
                  viewerHasReviewed: state.viewerHasReviewed,
                  reviewQuorumFinal: state.reviewQuorumFinal,
                  decision: review.decision,
                })
                return (
                  <li
                    key={review.id}
                    data-testid={`canonical-review-record-${index + 1}`}
                    className="rounded-2xl bg-[#F5F5F7] p-4 text-[11px] leading-5 text-[#424245]"
                  >
                    {blinded ? (
                      <p className="flex items-start gap-2 font-semibold text-[#1D1D1F]">
                        <EyeOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        One independent decision is sealed until you submit your own decision or
                        both required reviews finish.
                      </p>
                    ) : (
                      <>
                        <p className="font-semibold text-[#1D1D1F]">
                          {review.reviewerName ?? 'Independent reviewer'} ·{' '}
                          {review.decision ? DECISION_LABELS[review.decision] : 'Decision sealed'}
                        </p>
                        {review.reviewerOrcid && (
                          <p className="break-all font-mono text-[9px]">
                            ORCID {review.reviewerOrcid}
                          </p>
                        )}
                        <p className="mt-1">
                          Qualifications:{' '}
                          {(review.expertiseTags ?? [])
                            .map((tag) => EXPERTISE_LABELS[tag])
                            .join(', ') || 'Not shown'}
                        </p>
                        {review.reviewNote && (
                          <p className="mt-2 whitespace-pre-wrap break-words">
                            {review.reviewNote}
                          </p>
                        )}
                        {review.conflictsOfInterest && (
                          <details className="mt-2">
                            <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-[#0066CC]">
                              Conflict-of-interest disclosure
                            </summary>
                            <p className="break-words">{review.conflictsOfInterest}</p>
                          </details>
                        )}
                        <p className="mt-1 text-[9px] text-[#6E6E73]">
                          Recorded {dateTimeLabel(review.reviewedAt)}
                        </p>
                      </>
                    )}
                  </li>
                )
              })}
            </ol>
          )}

          {state.adjudication && (
            <article
              data-testid="canonical-adjudication-record"
              className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-5 text-amber-950"
            >
              <p className="font-semibold">
                Steward decision after disagreement · {DECISION_LABELS[state.adjudication.decision]}
              </p>
              <p className="mt-1">{state.adjudication.adjudicatorName}</p>
              <p className="mt-2 whitespace-pre-wrap break-words">{state.adjudication.rationale}</p>
              <details className="mt-2">
                <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-amber-900">
                  Conflict-of-interest disclosure
                </summary>
                <p>{state.adjudication.conflictsOfInterest}</p>
              </details>
            </article>
          )}

          {exactPreviewComplete &&
            state.reviewStatus === 'AWAITING_REVIEW' &&
            state.reviews.length < 2 &&
            !state.viewerHasReviewed &&
            !state.reviewEligibility.canReview && (
              <p
                data-testid="canonical-review-ineligible"
                className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-950"
              >
                {state.reviewEligibility.reason}
              </p>
            )}

          {exactPreviewComplete && canReview && (
            <form
              data-testid="canonical-review-form"
              onSubmit={(event) => void submitReview(event)}
              className="space-y-4 border-t border-black/[0.07] pt-4"
            >
              <h4 className="text-xs font-bold text-[#1D1D1F]">Record your permanent review</h4>
              {state.activeQualifications.length === 0 && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-950">
                  A steward has not yet confirmed you for any subject area used in this review.
                  Expertise listed on an account profile is not enough by itself.
                </p>
              )}
              {!hasReviewerStanding && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-950">
                  Your account must first be approved as a trusted reviewer, steward or
                  administrator.
                </p>
              )}
              <ExpertiseChoices
                name={`canonical-review-expertise-${state.revisionId}`}
                available={state.activeQualifications}
                selected={reviewExpertise}
                disabled={visibleIsWorking}
                onChange={setReviewExpertise}
              />
              <DecisionChoices
                name={`canonical-review-decision-${state.revisionId}`}
                value={reviewDecision}
                disabled={visibleIsWorking || !canReview}
                onChange={setReviewDecision}
              />
              <label className="flex min-h-11 items-start gap-2 rounded-xl border border-black/[0.09] px-3 py-2 text-[11px] leading-5 text-[#424245]">
                <input
                  type="checkbox"
                  checked={independent}
                  onChange={(event) => setIndependent(event.target.checked)}
                  disabled={visibleIsWorking || !canReview}
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#0071E3]"
                />
                I am independent of the person who prepared this version and the person who
                submitted the correction.
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#1D1D1F]">
                  Conflict-of-interest disclosure
                </span>
                <textarea
                  value={reviewCoi}
                  onChange={(event) => setReviewCoi(event.target.value)}
                  disabled={visibleIsWorking || !canReview}
                  required
                  rows={3}
                  maxLength={4_000}
                  className={inputClass}
                  placeholder="Write “None” when there is no conflict."
                />
              </label>
              <label className="flex min-h-11 items-start gap-2 rounded-xl border border-black/[0.09] px-3 py-2 text-[11px] leading-5 text-[#424245]">
                <input
                  type="checkbox"
                  checked={reviewCoiAttested}
                  onChange={(event) => setReviewCoiAttested(event.target.checked)}
                  disabled={visibleIsWorking || !canReview}
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#0071E3]"
                />
                I confirm that this disclosure is complete.
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#1D1D1F]">
                  Review note {reviewDecision === 'APPROVE' ? '(optional)' : '(required)'}
                </span>
                <textarea
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  disabled={visibleIsWorking || !canReview}
                  required={reviewDecision !== '' && reviewDecision !== 'APPROVE'}
                  rows={4}
                  maxLength={12_000}
                  className={inputClass}
                  placeholder="Explain what must change or why this evidence and wording are acceptable."
                />
              </label>
              <button
                type="submit"
                data-testid="canonical-review-submit"
                disabled={
                  visibleIsWorking ||
                  !canReview ||
                  !reviewDecision ||
                  reviewExpertise.length === 0 ||
                  !independent ||
                  !reviewCoiAttested
                }
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1D1D1F] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {visibleIsWorking ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                Record decision on this proposed version
              </button>
            </form>
          )}

          {exactPreviewComplete &&
            reviewersDisagree &&
            !state.adjudication &&
            !state.adjudicationEligibility.canAdjudicate && (
              <p
                data-testid="canonical-adjudication-ineligible"
                className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-950"
              >
                {state.adjudicationEligibility.reason}
              </p>
            )}

          {exactPreviewComplete &&
            reviewersDisagree &&
            !state.adjudication &&
            state.adjudicationEligibility.canAdjudicate && (
              <form
                data-testid="canonical-adjudication-form"
                onSubmit={(event) => void submitAdjudication(event)}
                className="space-y-4 border-t border-black/[0.07] pt-4"
              >
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold text-[#1D1D1F]">
                    <Gavel className="h-4 w-4 text-amber-700" aria-hidden="true" />
                    Resolve reviewer disagreement
                  </h4>
                  <p className="mt-1 text-[11px] leading-5 text-[#6E6E73]">
                    A steward approved for a relevant subject area—and independent of the author and
                    both reviewers—must make one final decision. This is how RNAWiki resolves a
                    split review.
                  </p>
                </div>
                <ExpertiseChoices
                  name={`canonical-adjudication-expertise-${state.revisionId}`}
                  available={state.activeQualifications}
                  selected={adjudicationExpertise}
                  disabled={visibleIsWorking}
                  onChange={setAdjudicationExpertise}
                />
                <DecisionChoices
                  name={`canonical-adjudication-decision-${state.revisionId}`}
                  value={adjudicationDecision}
                  disabled={visibleIsWorking}
                  onChange={setAdjudicationDecision}
                />
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#1D1D1F]">
                    Reason for the final decision
                  </span>
                  <textarea
                    value={adjudicationRationale}
                    onChange={(event) => setAdjudicationRationale(event.target.value)}
                    disabled={visibleIsWorking}
                    required
                    rows={5}
                    maxLength={20_000}
                    className={inputClass}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#1D1D1F]">
                    Conflict-of-interest disclosure
                  </span>
                  <textarea
                    value={adjudicationCoi}
                    onChange={(event) => setAdjudicationCoi(event.target.value)}
                    disabled={visibleIsWorking}
                    required
                    rows={3}
                    maxLength={4_000}
                    className={inputClass}
                    placeholder="Write “None” when there is no conflict."
                  />
                </label>
                <label className="flex min-h-11 items-start gap-2 rounded-xl border border-black/[0.09] px-3 py-2 text-[11px] leading-5 text-[#424245]">
                  <input
                    type="checkbox"
                    checked={adjudicationCoiAttested}
                    onChange={(event) => setAdjudicationCoiAttested(event.target.checked)}
                    disabled={visibleIsWorking}
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#0071E3]"
                  />
                  I confirm that this disclosure is complete and I am independent of the author and
                  both reviewers.
                </label>
                <button
                  type="submit"
                  data-testid="canonical-adjudication-submit"
                  disabled={
                    visibleIsWorking ||
                    !adjudicationDecision ||
                    adjudicationExpertise.length === 0 ||
                    !adjudicationCoiAttested
                  }
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <Gavel className="h-4 w-4" aria-hidden="true" /> Record final steward decision
                </button>
              </form>
            )}

          {exactPreviewComplete &&
            publicationApproved &&
            state.reviewStatus !== 'PUBLISHED' &&
            isSteward && (
              <div className="space-y-3 border-t border-black/[0.07] pt-4">
                <p className="text-[11px] leading-5 text-[#424245]">
                  The required decisions approve the evidence and wording shown above. RNAWiki will
                  update the conclusion, programme facts, source status and linked review task all
                  at once. If any part fails, nothing changes.
                </p>
                <button
                  type="button"
                  data-testid="canonical-publish"
                  onClick={() => void publish()}
                  disabled={visibleIsWorking || !state.machineReport.canPublish}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {visibleIsWorking ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  )}
                  Publish this reviewed update
                </button>
              </div>
            )}

          {state.reviewStatus === 'PUBLISHED' && (
            <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-semibold leading-5 text-emerald-950">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> This reviewed
              update is published.
            </p>
          )}
        </section>
      )}

      {visibleError && (
        <p
          role="alert"
          data-testid="canonical-workflow-error"
          className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] leading-5 text-rose-950"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {visibleError}
        </p>
      )}
      {visibleNotice && (
        <p
          role="status"
          data-testid="canonical-publication-notice"
          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] leading-5 text-emerald-950"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {visibleNotice}
        </p>
      )}
    </section>
  )
}
