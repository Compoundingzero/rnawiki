import { and, asc, count, desc, eq, inArray, or, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  developmentProgrammes,
  drugs,
  evidenceNodes,
  evidenceReviewTaskSourceDeltas,
  evidenceReviewTasks,
  evidenceSources,
  programmeContributionProposals,
  programmeContributionReviewStates,
  programmeCurrentPublications,
  programmeDependencies,
  programmeFreshnessStates,
  programmeVerdictEvidenceNodes,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  sourceSnapshots,
  users,
} from '@/db/schema'
import type {
  ContributionAdjudicationView,
  PublicContributionReviewAudit,
  ContributionReviewStateView,
  ContributionReviewView,
} from '@/lib/contributions/review-types'
import {
  CONTRIBUTION_SELECTED_FIELDS,
  contributionFieldValueKind,
  deriveContributionImpactPreview,
  deriveSourceRefreshImpactPreview,
  isEvidenceNodeContributionField,
  isVerdictContributionField,
  runContributionMachineChecks,
  type ContributionCurrentValueSnapshot,
  type ContributionCurrentVerdictSnapshot,
  type ContributionImpactPreview,
  type ContributionMachineChecks,
  type ContributionProposalType,
  type ContributionProposedValue,
  type ContributionSelectedField,
  type ContributionSourceRefreshDeltaSnapshot,
} from '@/lib/contributions/types'
import { listPublicContributionReviewAudits } from '@/lib/queries/programme-contribution-reviews'
import type {
  ContributionDraftPatch,
  CreateContributionDraftInput,
} from '@/lib/contributions/validation'
import {
  EVIDENCE_STATES,
  PROGRAMME_STATUSES,
  STOPPED_PROGRAMME_VERDICTS,
  STOPPING_REASON_CATEGORIES,
  VERDICT_CONFIDENCE_LEVELS,
  type ProgrammeStatus,
} from '@/lib/evidence/types'
import { newId } from '@/lib/ids'
import { ApiError } from '@/lib/api-response'
import { stableJsonStringify } from '@/lib/stable-json'

type ProposalRow = typeof programmeContributionProposals.$inferSelect
type ReadExecutor = Pick<typeof db, 'select'>
type LineageLockExecutor = Pick<typeof db, 'execute'>

export class ContributionProposalError extends ApiError {
  constructor(status: number, message: string, code: string, details?: unknown) {
    super(status, message, code, details)
    this.name = 'ContributionProposalError'
  }
}

export interface ContributionFieldOption {
  value: ContributionSelectedField
  label: string
  group: 'Programme' | '10-second summary' | 'Verdict' | 'Evidence node'
  valueType: 'text' | 'list' | 'enum'
  requiresEvidenceNode: boolean
  allowedValues?: string[]
}

export interface ProgrammeContributionContext {
  medicine: { id: string; slug: string; name: string }
  programme: {
    id: string
    slug: string
    title: string
    indication: string | null
    status: ProgrammeStatus
  }
  currentVerdict: ContributionCurrentVerdictSnapshot | null
  /** Canonical current values for every non-node field; node values are scoped per node below. */
  currentValues: Partial<Record<ContributionSelectedField, ContributionProposedValue | null>>
  evidenceNodes: Array<{
    id: string
    title: string
    label: string
    nodeType: string
    revisionNumber: number
    state: string
    plainSummary: string | null
    professionalSummary: string | null
    summary: string | null
    publishedAt: string
    currentValues: Partial<Record<ContributionSelectedField, ContributionProposedValue | null>>
  }>
  fieldOptions: ContributionFieldOption[]
}

export interface ProgrammeContributionProposalReadModel {
  id: string
  proposalKey: string
  revisionNumber: number
  previousProposalId: string | null
  programmeId: string
  proposalType: ProposalRow['proposalType']
  status: ProposalRow['status']
  selectedField: ProposalRow['selectedField']
  proposedText: string | null
  proposedValue: ProposalRow['proposedValue']
  source: null | {
    type: NonNullable<ProposalRow['sourceType']>
    locator: string | null
    identifier: string | null
    reviewTaskId: string | null
    reviewSnapshotId: string | null
  }
  claimNature: ProposalRow['claimNature']
  evidenceNodeId: string | null
  proposedStoppedVerdict: ProposalRow['proposedStoppedVerdict']
  reasoning: string | null
  whatWasWrongOrMissing: string | null
  affects: ProposalRow['affects']
  conflictsOfInterest: string | null
  conflictsOfInterestAttested: boolean
  currentValueSnapshot: ProposalRow['currentValueSnapshot']
  currentVerdictSnapshot: ProposalRow['currentVerdictSnapshot']
  sourceRefreshDeltaSnapshot: ProposalRow['sourceRefreshDeltaSnapshot']
  machineChecks: ProposalRow['machineChecks']
  impactPreview: ProposalRow['impactPreview']
  contentDigestAlgorithm: 'sha256'
  contentDigest: string | null
  createdAt: string
  updatedAt: string
  submittedAt: string | null
  /** Safe review feedback for submitted rows; drafts have no review state. */
  review: PublicContributionReviewAudit | null
}

export interface ContributionDraftPreview {
  machineChecks: ContributionMachineChecks
  impactPreview: ContributionImpactPreview
}

export interface PublicContributionProposal {
  id: string
  proposalKey: string
  revisionNumber: number
  previousProposalId: string | null
  proposalType: ProposalRow['proposalType']
  author: { name: string; handle: string; orcid?: string }
  medicine: { slug: string; name: string }
  programme: { id: string; slug: string; title: string; status: ProgrammeStatus }
  selectedField: ProposalRow['selectedField']
  proposedText: string | null
  proposedValue: ProposalRow['proposedValue']
  proposedStoppedVerdict: ProposalRow['proposedStoppedVerdict']
  source: {
    type: NonNullable<ProposalRow['sourceType']>
    locator: string
    identifier: string
    reviewTaskId: string | null
    reviewSnapshotId: string | null
  }
  claimNature: ProposalRow['claimNature']
  evidenceNodeId: string | null
  evidenceNode: null | {
    id: string
    nodeType: string
    title: string
    label: string
  }
  reasoning: string | null
  whatWasWrongOrMissing: string | null
  affects: ProposalRow['affects']
  conflictsOfInterest: string
  conflictsOfInterestAttested: true
  structuredDiff: {
    selectedField: ProposalRow['selectedField']
    currentValue: unknown
    proposedText: string | null
    proposedValue: ProposalRow['proposedValue']
    proposedStoppedVerdict: ProposalRow['proposedStoppedVerdict']
  }
  currentVerdictSnapshot: ProposalRow['currentVerdictSnapshot']
  sourceRefreshDeltaSnapshot: ContributionSourceRefreshDeltaSnapshot | null
  machineChecks: NonNullable<ProposalRow['machineChecks']>
  impactPreview: NonNullable<ProposalRow['impactPreview']>
  contentDigestAlgorithm: 'sha256'
  contentDigest: string
  submittedAt: string
  reviewState: ContributionReviewStateView
  reviews: ContributionReviewView[]
  adjudication: ContributionAdjudicationView | null
}

const FIELD_LABELS: Record<ContributionSelectedField, string> = {
  'programme.title': 'Programme title',
  'programme.indication': 'Indication',
  'programme.targetPopulation': 'Target population',
  'programme.status': 'Programme status',
  'programme.highestPhaseReached': 'Highest phase reached',
  'programme.route': 'Route',
  'programme.doseExposureContext': 'Dose and exposure context',
  'programme.rawStoppingReason': 'Recorded stopping reason',
  'programme.stoppingReasonCategory': 'Stopping-reason category',
  'summary.plainMechanism': 'How it was meant to work',
  'summary.bestSupportedFinding': 'Best-supported finding',
  'summary.mainLimitation': 'Main limitation',
  'verdict.verdictCode': 'Stopped-programme verdict',
  'verdict.publicLabel': 'Public verdict label',
  'verdict.professionalLabel': 'Professional verdict label',
  'verdict.oneSentenceReason': 'One-sentence reason',
  'verdict.scope.indication': 'Verdict indication scope',
  'verdict.scope.population': 'Verdict population scope',
  'verdict.scope.doseExposure': 'Verdict dose/exposure scope',
  'verdict.scope.period': 'Verdict time period',
  'verdict.scope.trials': 'Verdict trial scope',
  'verdict.scope.outcome': 'Verdict outcome scope',
  'verdict.whatWasDisproven': 'What was disproven',
  'verdict.whatWasNotDisproven': 'What was not disproven',
  'verdict.whatRemainsUnknown': 'What remains unknown',
  'verdict.confidence': 'Verdict confidence',
  'verdict.confidenceExplanation': 'Confidence explanation',
  'verdict.conditionsThatWouldChangeVerdict': 'What would change the verdict',
  'evidenceNode.state': 'Evidence-node state',
  'evidenceNode.plainSummary': 'Evidence-node plain summary',
  'evidenceNode.professionalSummary': 'Evidence-node professional summary',
  'evidenceNode.rationale': 'Evidence-node rationale',
}

export const CONTRIBUTION_FIELD_OPTIONS: ContributionFieldOption[] =
  CONTRIBUTION_SELECTED_FIELDS.map((value) => ({
    value,
    label: FIELD_LABELS[value],
    group: value.startsWith('programme.')
      ? 'Programme'
      : value.startsWith('summary.')
        ? '10-second summary'
        : value.startsWith('verdict.')
          ? 'Verdict'
          : 'Evidence node',
    valueType:
      contributionFieldValueKind(value) === 'list'
        ? 'list'
        : contributionFieldValueKind(value) === 'enum' ||
            contributionFieldValueKind(value) === 'stoppedVerdict'
          ? 'enum'
          : 'text',
    requiresEvidenceNode: isEvidenceNodeContributionField(value),
    ...(value === 'programme.status'
      ? { allowedValues: [...PROGRAMME_STATUSES] }
      : value === 'programme.stoppingReasonCategory'
        ? { allowedValues: [...STOPPING_REASON_CATEGORIES] }
        : value === 'evidenceNode.state'
          ? { allowedValues: [...EVIDENCE_STATES] }
          : value === 'verdict.confidence'
            ? { allowedValues: [...VERDICT_CONFIDENCE_LEVELS] }
            : value === 'verdict.verdictCode'
              ? { allowedValues: [...STOPPED_PROGRAMME_VERDICTS] }
              : {}),
  }))

function requiredIso(value: Date | null, label: string): string {
  if (!value) throw new Error(`Published contribution baseline is missing ${label}.`)
  return value.toISOString()
}

function toVerdictSnapshot(
  row: typeof programmeVerdictRevisions.$inferSelect,
): ContributionCurrentVerdictSnapshot {
  return {
    id: row.id,
    revisionNumber: row.revisionNumber,
    publishedAt: requiredIso(row.publishedAt, 'publishedAt'),
    programmeStatusAtReview: row.programmeStatusAtReview,
    verdictCode: row.verdictCode,
    publicLabel: row.publicLabel,
    professionalLabel: row.professionalLabel,
    oneSentenceReason: row.oneSentenceReason,
    indicationScope: row.indicationScope,
    populationScope: row.populationScope,
    doseExposureScope: row.doseExposureScope,
    periodScope: row.periodScope,
    trialScope: row.trialScope,
    outcomeScope: row.outcomeScope,
    plainMechanism: row.plainMechanism,
    bestSupportedFinding: row.bestSupportedFinding,
    mainLimitation: row.mainLimitation,
    whatWasDisproven: row.whatWasDisproven,
    whatWasNotDisproven: row.whatWasNotDisproven,
    whatRemainsUnknown: row.whatRemainsUnknown,
    confidence: row.confidence,
    confidenceExplanation: row.confidenceExplanation,
    conditionsThatWouldChangeVerdict: row.conditionsThatWouldChangeVerdict,
  }
}

function evidenceNodeLabel(nodeType: string): string {
  return nodeType
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function resolveProgramme(
  database: ReadExecutor,
  medicineSlug: string,
  programmeRef: string,
) {
  const rows = await database
    .select({
      medicineId: drugs.id,
      medicineSlug: drugs.slug,
      medicineName: drugs.name,
      programme: developmentProgrammes,
    })
    .from(developmentProgrammes)
    .innerJoin(drugs, eq(drugs.id, developmentProgrammes.drugId))
    .where(
      and(
        eq(drugs.slug, medicineSlug),
        or(
          eq(developmentProgrammes.id, programmeRef),
          eq(developmentProgrammes.slug, programmeRef),
        ),
      ),
    )
    // A pathological collision can match one row by id and another by slug. The explicit id row
    // always wins, followed by stable id order for corrupted duplicate-slug legacy data.
    .orderBy(
      sql`case when ${developmentProgrammes.id} = ${programmeRef} then 0 else 1 end`,
      asc(developmentProgrammes.id),
    )
    .limit(1)
  return rows[0] ?? null
}

async function currentVerdictForProgramme(
  database: ReadExecutor,
  programmeId: string,
  lock = false,
) {
  const query = database
    .select({ verdict: programmeVerdictRevisions })
    .from(programmeCurrentPublications)
    .innerJoin(
      programmeVerdictRevisions,
      and(
        eq(programmeVerdictRevisions.id, programmeCurrentPublications.verdictRevisionId),
        eq(programmeVerdictRevisions.programmeId, programmeCurrentPublications.programmeId),
      ),
    )
    .where(
      and(
        eq(programmeCurrentPublications.programmeId, programmeId),
        eq(programmeVerdictRevisions.reviewStatus, 'PUBLISHED'),
      ),
    )
    .limit(1)
  const rows = lock ? await query.for('share') : await query
  return rows[0]?.verdict ?? null
}

function programmeWithPublishedScope(
  live: typeof developmentProgrammes.$inferSelect,
  scope: typeof programmeVerdictScopeSnapshots.$inferSelect | null,
): typeof developmentProgrammes.$inferSelect {
  if (!scope) return live
  return {
    ...live,
    drugId: scope.drugId,
    slug: scope.slug,
    title: scope.title,
    indication: scope.indication,
    targetPopulation: scope.targetPopulation,
    jurisdiction: scope.jurisdiction,
    sponsor: scope.sponsor,
    partners: scope.partners,
    status: scope.status,
    highestPhaseReached: scope.highestPhaseReached,
    route: scope.route,
    doseExposureContext: scope.doseExposureContext,
    startDate: scope.startDate,
    endDate: scope.endDate,
    rawStoppingReason: scope.rawStoppingReason,
    stoppingReasonCategory: scope.stoppingReasonCategory,
  }
}

async function currentPublishedScope(
  database: ReadExecutor,
  verdictRevisionId: string | null,
  lock = false,
) {
  if (!verdictRevisionId) return null
  const query = database
    .select()
    .from(programmeVerdictScopeSnapshots)
    .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, verdictRevisionId))
    .limit(1)
  const rows = lock ? await query.for('share') : await query
  return rows[0] ?? null
}

async function currentPublishedNodes(
  database: ReadExecutor,
  programmeId: string,
  verdictRevisionId: string | null,
  lock = false,
) {
  if (!verdictRevisionId) {
    const query = database
      .select({ node: evidenceNodes })
      .from(evidenceNodes)
      .where(
        and(
          eq(evidenceNodes.programmeId, programmeId),
          eq(evidenceNodes.reviewStatus, 'PUBLISHED'),
        ),
      )
      .orderBy(asc(evidenceNodes.nodeType), desc(evidenceNodes.revisionNumber))
    const rows = lock ? await query.for('share') : await query
    return rows.map((row) => row.node)
  }

  const query = database
    .select({ node: evidenceNodes })
    .from(programmeVerdictEvidenceNodes)
    .innerJoin(evidenceNodes, eq(evidenceNodes.id, programmeVerdictEvidenceNodes.evidenceNodeId))
    .where(
      and(
        eq(programmeVerdictEvidenceNodes.verdictRevisionId, verdictRevisionId),
        eq(programmeVerdictEvidenceNodes.programmeId, programmeId),
        eq(evidenceNodes.programmeId, programmeId),
      ),
    )
    .orderBy(asc(evidenceNodes.nodeType), desc(evidenceNodes.revisionNumber))
  const rows = lock ? await query.for('share') : await query
  return rows.map((row) => row.node)
}

export async function getProgrammeContributionContext(
  medicineSlug: string,
  programmeRef: string,
): Promise<ProgrammeContributionContext | null> {
  const resolved = await resolveProgramme(db, medicineSlug, programmeRef)
  if (!resolved) return null

  const verdict = await currentVerdictForProgramme(db, resolved.programme.id)
  const [scope, nodes] = await Promise.all([
    currentPublishedScope(db, verdict?.id ?? null),
    currentPublishedNodes(db, resolved.programme.id, verdict?.id ?? null),
  ])
  const programme = programmeWithPublishedScope(resolved.programme, scope)
  const currentValues = Object.fromEntries(
    CONTRIBUTION_SELECTED_FIELDS.filter((field) => !isEvidenceNodeContributionField(field)).map(
      (field) => [field, currentFieldValue({ field, programme, verdict, node: null })],
    ),
  ) as Partial<Record<ContributionSelectedField, ContributionProposedValue | null>>

  return {
    medicine: {
      id: resolved.medicineId,
      slug: resolved.medicineSlug,
      name: resolved.medicineName,
    },
    programme: {
      id: programme.id,
      slug: programme.slug,
      title: programme.title,
      indication: programme.indication,
      status: programme.status,
    },
    currentVerdict: verdict ? toVerdictSnapshot(verdict) : null,
    currentValues,
    evidenceNodes: nodes.map((node) => ({
      id: node.id,
      title: evidenceNodeLabel(node.nodeType),
      label: evidenceNodeLabel(node.nodeType),
      nodeType: node.nodeType,
      revisionNumber: node.revisionNumber,
      state: node.state,
      plainSummary: node.plainSummary,
      professionalSummary: node.professionalSummary,
      summary: node.plainSummary ?? node.professionalSummary,
      publishedAt: requiredIso(node.publishedAt, 'evidence node publishedAt'),
      currentValues: {
        'evidenceNode.state': node.state,
        'evidenceNode.plainSummary': node.plainSummary,
        'evidenceNode.professionalSummary': node.professionalSummary,
        'evidenceNode.rationale': node.rationale,
      },
    })),
    fieldOptions: CONTRIBUTION_FIELD_OPTIONS,
  }
}

function serializeProposal(
  row: ProposalRow,
  review: PublicContributionReviewAudit | null = null,
): ProgrammeContributionProposalReadModel {
  return {
    id: row.id,
    proposalKey: row.proposalKey,
    revisionNumber: row.revisionNumber,
    previousProposalId: row.previousProposalId,
    programmeId: row.programmeId,
    proposalType: row.proposalType,
    status: row.status,
    selectedField: row.selectedField,
    proposedText: row.proposedText,
    proposedValue: row.proposedValue,
    source: row.sourceType
      ? {
          type: row.sourceType,
          locator: row.sourceLocator,
          identifier: row.sourceIdentifier,
          reviewTaskId: row.sourceReviewTaskId,
          reviewSnapshotId: row.sourceReviewSnapshotId,
        }
      : null,
    claimNature: row.claimNature,
    evidenceNodeId: row.evidenceNodeId,
    proposedStoppedVerdict: row.proposedStoppedVerdict,
    reasoning: row.reasoning,
    whatWasWrongOrMissing: row.whatWasWrongOrMissing,
    affects: row.affects,
    conflictsOfInterest: row.conflictsOfInterest,
    conflictsOfInterestAttested: row.conflictsOfInterestAttested,
    currentValueSnapshot: row.currentValueSnapshot,
    currentVerdictSnapshot: row.currentVerdictSnapshot,
    sourceRefreshDeltaSnapshot: row.sourceRefreshDeltaSnapshot,
    machineChecks: row.machineChecks,
    impactPreview: row.impactPreview,
    contentDigestAlgorithm: 'sha256',
    contentDigest: row.contentDigest,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    submittedAt: row.submittedAt?.toISOString() ?? null,
    review,
  }
}

function sourceRefreshDeltaSnapshot(
  row: typeof evidenceReviewTaskSourceDeltas.$inferSelect,
): ContributionSourceRefreshDeltaSnapshot {
  if (
    row.schemaVersion !== 'rna-intelligence/source-refresh-delta-v1' ||
    row.deltaDigestAlgorithm !== 'sha256'
  ) {
    throw new Error(`Source task ${row.reviewTaskId} has an unsupported delta format.`)
  }
  return {
    version: row.schemaVersion,
    reviewTaskId: row.reviewTaskId,
    programmeId: row.programmeId,
    sourceId: row.sourceId,
    baselineSnapshotId: row.baselineSnapshotId,
    pendingSnapshotId: row.pendingSnapshotId,
    adapterKey: row.adapterKey,
    action: row.action,
    changedTrialFields: row.changedTrialFields,
    affectedClaimIds: row.affectedClaimIds,
    affectedInterpretability: row.affectedInterpretability,
    affectedSurfacePaths: row.affectedSurfacePaths,
    scientificRevisionRequirements: row.scientificRevisionRequirements,
    deltaDigestAlgorithm: 'sha256',
    deltaDigest: row.deltaDigest,
  }
}

interface SourceRefreshBinding {
  task: typeof evidenceReviewTasks.$inferSelect
  source: typeof evidenceSources.$inferSelect
  delta: ContributionSourceRefreshDeltaSnapshot
}

async function loadCurrentSourceRefreshBinding(
  database: ReadExecutor,
  args: { programmeId: string; reviewTaskId: string; reviewSnapshotId: string },
  lock = false,
): Promise<SourceRefreshBinding | null> {
  const query = database
    .select({
      task: evidenceReviewTasks,
      source: evidenceSources,
      delta: evidenceReviewTaskSourceDeltas,
    })
    .from(evidenceReviewTasks)
    .innerJoin(evidenceSources, eq(evidenceSources.id, evidenceReviewTasks.sourceId))
    .innerJoin(
      evidenceReviewTaskSourceDeltas,
      eq(evidenceReviewTaskSourceDeltas.reviewTaskId, evidenceReviewTasks.id),
    )
    .innerJoin(
      programmeFreshnessStates,
      and(
        eq(programmeFreshnessStates.programmeId, evidenceReviewTasks.programmeId),
        eq(programmeFreshnessStates.sourceId, evidenceReviewTasks.sourceId),
      ),
    )
    .where(
      and(
        eq(evidenceReviewTasks.id, args.reviewTaskId),
        eq(evidenceReviewTasks.programmeId, args.programmeId),
        eq(evidenceReviewTasks.triggerSnapshotId, args.reviewSnapshotId),
        inArray(evidenceReviewTasks.status, ['OPEN', 'IN_REVIEW', 'BLOCKED']),
        eq(evidenceReviewTaskSourceDeltas.pendingSnapshotId, args.reviewSnapshotId),
        eq(
          programmeFreshnessStates.currentSnapshotId,
          evidenceReviewTaskSourceDeltas.baselineSnapshotId,
        ),
        eq(programmeFreshnessStates.pendingSnapshotId, args.reviewSnapshotId),
      ),
    )
    .limit(1)
  const rows = lock ? await query.for('share') : await query
  const row = rows[0]
  return row
    ? { task: row.task, source: row.source, delta: sourceRefreshDeltaSnapshot(row.delta) }
    : null
}

/**
 * Serializes every action that can change or decide a proposal lineage. The same 64-bit key is
 * acquired by the 0007 database triggers, so application and direct-SQL paths share one lock order.
 */
async function lockContributionLineage(
  database: LineageLockExecutor,
  programmeId: string,
  proposalKey: string,
): Promise<void> {
  await database.execute(
    sql`select pg_advisory_xact_lock(hashtextextended(${programmeId} || chr(31) || ${proposalKey}, 0))`,
  )
}

function draftValues(input: CreateContributionDraftInput) {
  return {
    selectedField: input.selectedField ?? null,
    proposedText: input.proposedText ?? null,
    proposedValue: input.proposedValue ?? null,
    sourceType: input.source?.type ?? null,
    sourceLocator: input.source?.locator ?? null,
    sourceIdentifier: input.source?.identifier ?? null,
    sourceReviewTaskId: input.source?.reviewTaskId ?? null,
    sourceReviewSnapshotId: input.source?.reviewSnapshotId ?? null,
    sourceRefreshDeltaSnapshot: null,
    claimNature: input.claimNature ?? null,
    evidenceNodeId: input.evidenceNodeId ?? null,
    proposedStoppedVerdict: input.proposedStoppedVerdict ?? null,
    reasoning: input.reasoning ?? null,
    whatWasWrongOrMissing: input.whatWasWrongOrMissing ?? null,
    affects: input.affects ?? null,
    conflictsOfInterest: input.conflictsOfInterest ?? null,
    conflictsOfInterestAttested: input.conflictsOfInterestAttested ?? false,
  }
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key)
}

function draftPatchSet(
  patch: ContributionDraftPatch,
): Partial<typeof programmeContributionProposals.$inferInsert> {
  const values: Partial<typeof programmeContributionProposals.$inferInsert> = {}
  if (hasOwn(patch, 'selectedField')) values.selectedField = patch.selectedField ?? null
  if (hasOwn(patch, 'proposedText')) values.proposedText = patch.proposedText ?? null
  if (hasOwn(patch, 'proposedValue')) values.proposedValue = patch.proposedValue ?? null
  if (hasOwn(patch, 'claimNature')) values.claimNature = patch.claimNature ?? null
  if (hasOwn(patch, 'evidenceNodeId')) values.evidenceNodeId = patch.evidenceNodeId ?? null
  if (hasOwn(patch, 'proposedStoppedVerdict')) {
    values.proposedStoppedVerdict = patch.proposedStoppedVerdict ?? null
  }
  if (hasOwn(patch, 'reasoning')) values.reasoning = patch.reasoning ?? null
  if (hasOwn(patch, 'whatWasWrongOrMissing')) {
    values.whatWasWrongOrMissing = patch.whatWasWrongOrMissing ?? null
  }
  if (hasOwn(patch, 'affects')) values.affects = patch.affects ?? null
  if (hasOwn(patch, 'conflictsOfInterest')) {
    values.conflictsOfInterest = patch.conflictsOfInterest ?? null
  }
  if (hasOwn(patch, 'conflictsOfInterestAttested')) {
    values.conflictsOfInterestAttested = patch.conflictsOfInterestAttested ?? false
  }
  if (hasOwn(patch, 'source')) {
    if (!patch.source) {
      values.sourceType = null
      values.sourceLocator = null
      values.sourceIdentifier = null
      values.sourceReviewTaskId = null
      values.sourceReviewSnapshotId = null
    } else {
      if (hasOwn(patch.source, 'type')) values.sourceType = patch.source.type ?? null
      if (hasOwn(patch.source, 'locator')) values.sourceLocator = patch.source.locator ?? null
      if (hasOwn(patch.source, 'identifier')) {
        values.sourceIdentifier = patch.source.identifier ?? null
      }
      if (hasOwn(patch.source, 'reviewTaskId')) {
        values.sourceReviewTaskId = patch.source.reviewTaskId ?? null
      }
      if (hasOwn(patch.source, 'reviewSnapshotId')) {
        values.sourceReviewSnapshotId = patch.source.reviewSnapshotId ?? null
      }
    }
  }
  return values
}

async function programmeStatus(database: ReadExecutor, programmeId: string) {
  const rows = await database
    .select()
    .from(developmentProgrammes)
    .where(eq(developmentProgrammes.id, programmeId))
    .limit(1)
  const live = rows[0]
  if (!live) return null
  const verdict = await currentVerdictForProgramme(database, programmeId)
  const scope = await currentPublishedScope(database, verdict?.id ?? null)
  return programmeWithPublishedScope(live, scope).status
}

async function validateDraftReferences(
  database: ReadExecutor,
  row: Pick<
    ProposalRow,
    | 'programmeId'
    | 'proposalType'
    | 'selectedField'
    | 'evidenceNodeId'
    | 'proposedStoppedVerdict'
    | 'proposedText'
    | 'proposedValue'
    | 'sourceType'
    | 'sourceLocator'
    | 'sourceIdentifier'
    | 'sourceReviewTaskId'
    | 'sourceReviewSnapshotId'
    | 'sourceRefreshDeltaSnapshot'
    | 'claimNature'
    | 'reasoning'
    | 'whatWasWrongOrMissing'
    | 'affects'
    | 'currentValueSnapshot'
  >,
): Promise<void> {
  const status = await programmeStatus(database, row.programmeId)
  if (!status) {
    throw new ContributionProposalError(404, 'Programme not found.', 'programme_not_found')
  }

  if (Boolean(row.sourceReviewTaskId) !== Boolean(row.sourceReviewSnapshotId)) {
    throw new ContributionProposalError(
      422,
      'Choose both the monitored source task and its exact snapshot.',
      'invalid_source_review_binding',
    )
  }
  let sourceRefreshBinding: SourceRefreshBinding | null = null
  if (
    row.proposalType === 'SOURCE_REFRESH' &&
    row.sourceReviewTaskId &&
    row.sourceReviewSnapshotId
  ) {
    sourceRefreshBinding = await loadCurrentSourceRefreshBinding(database, {
      programmeId: row.programmeId,
      reviewTaskId: row.sourceReviewTaskId,
      reviewSnapshotId: row.sourceReviewSnapshotId,
    })
    if (!sourceRefreshBinding) {
      throw new ContributionProposalError(
        409,
        'A newer saved source version replaced this task. Open the current source task instead.',
        'stale_source_review_binding',
      )
    }
  }
  if (
    row.proposalType !== 'SOURCE_REFRESH' &&
    row.sourceReviewTaskId &&
    row.sourceReviewSnapshotId
  ) {
    const taskRows = await database
      .select({
        task: evidenceReviewTasks,
        source: evidenceSources,
        snapshotId: sourceSnapshots.id,
      })
      .from(evidenceReviewTasks)
      .innerJoin(evidenceSources, eq(evidenceSources.id, evidenceReviewTasks.sourceId))
      .innerJoin(
        sourceSnapshots,
        and(
          eq(sourceSnapshots.id, evidenceReviewTasks.triggerSnapshotId),
          eq(sourceSnapshots.sourceId, evidenceReviewTasks.sourceId),
        ),
      )
      .innerJoin(
        programmeFreshnessStates,
        and(
          eq(programmeFreshnessStates.programmeId, evidenceReviewTasks.programmeId),
          eq(programmeFreshnessStates.sourceId, evidenceReviewTasks.sourceId),
        ),
      )
      .where(
        and(
          eq(evidenceReviewTasks.id, row.sourceReviewTaskId),
          eq(evidenceReviewTasks.programmeId, row.programmeId),
          eq(evidenceReviewTasks.triggerSnapshotId, row.sourceReviewSnapshotId),
          inArray(evidenceReviewTasks.status, ['OPEN', 'IN_REVIEW', 'BLOCKED']),
          eq(programmeFreshnessStates.pendingSnapshotId, row.sourceReviewSnapshotId),
        ),
      )
      .limit(1)
    const binding = taskRows[0]
    if (!binding) {
      throw new ContributionProposalError(
        409,
        'That monitored source change is no longer an open task for this programme.',
        'stale_source_review_binding',
      )
    }
    if (
      row.sourceType !== binding.source.sourceType ||
      row.sourceIdentifier?.trim().toLowerCase() !==
        binding.source.externalIdentifier?.trim().toLowerCase() ||
      row.sourceLocator?.trim().replace(/\/$/, '') !==
        binding.source.canonicalLocator.trim().replace(/\/$/, '')
    ) {
      throw new ContributionProposalError(
        422,
        'The citation must exactly identify the source attached to the monitored change.',
        'source_review_citation_mismatch',
      )
    }
  }

  if (row.proposalType === 'SOURCE_REFRESH') {
    if (!row.sourceReviewTaskId || !row.sourceReviewSnapshotId || !sourceRefreshBinding) {
      throw new ContributionProposalError(
        422,
        'Choose the exact current ClinicalTrials.gov source task.',
        'source_refresh_task_required',
      )
    }
    if (
      row.sourceType !== 'CLINICAL_TRIAL_REGISTRY' ||
      sourceRefreshBinding.source.sourceType !== 'CLINICAL_TRIAL_REGISTRY' ||
      row.sourceIdentifier?.trim().toLowerCase() !==
        sourceRefreshBinding.source.externalIdentifier?.trim().toLowerCase() ||
      row.sourceLocator?.trim().replace(/\/$/, '') !==
        sourceRefreshBinding.source.canonicalLocator.trim().replace(/\/$/, '')
    ) {
      throw new ContributionProposalError(
        422,
        'The source refresh must keep the exact ClinicalTrials.gov identity attached to this task.',
        'source_review_citation_mismatch',
      )
    }
    if (
      stableJsonStringify(row.sourceRefreshDeltaSnapshot) !==
      stableJsonStringify(sourceRefreshBinding.delta)
    ) {
      throw new ContributionProposalError(
        409,
        'The saved source comparison changed. Reload the current source task.',
        'source_refresh_delta_mismatch',
      )
    }
    if (
      row.selectedField !== null ||
      row.proposedText?.trim() ||
      row.proposedValue !== null ||
      row.evidenceNodeId !== null ||
      row.proposedStoppedVerdict !== null ||
      row.claimNature !== null ||
      row.reasoning?.trim() ||
      row.whatWasWrongOrMissing?.trim() ||
      row.affects !== null ||
      row.currentValueSnapshot !== null
    ) {
      throw new ContributionProposalError(
        422,
        'A source refresh contains saved registry facts only; it cannot include an editable medical claim, target field, or replacement value.',
        'invalid_source_refresh_payload',
      )
    }
  } else if (row.sourceRefreshDeltaSnapshot !== null) {
    throw new ContributionProposalError(
      422,
      'Only a source refresh may contain a saved source comparison.',
      'invalid_source_refresh_payload',
    )
  }

  if (row.evidenceNodeId) {
    const verdict = await currentVerdictForProgramme(database, row.programmeId)
    const nodes = await currentPublishedNodes(database, row.programmeId, verdict?.id ?? null)
    if (!nodes.some((node) => node.id === row.evidenceNodeId)) {
      throw new ContributionProposalError(
        422,
        'The evidence node is not part of this programme’s current published conclusion.',
        'invalid_evidence_node_scope',
      )
    }
  }

  if (
    row.proposalType === 'VERDICT_CHALLENGE' ||
    (row.selectedField && isEvidenceNodeContributionField(row.selectedField))
  ) {
    // A node can be chosen in the same save or later; incomplete drafts remain saveable.
  } else if (row.selectedField && row.evidenceNodeId) {
    throw new ContributionProposalError(
      422,
      'An evidence-node target is only valid for an evidence-node field.',
      'invalid_evidence_node_target',
    )
  }

  if (
    row.proposalType === 'VERDICT_CHALLENGE' &&
    row.selectedField &&
    !isVerdictContributionField(row.selectedField)
  ) {
    throw new ContributionProposalError(
      422,
      'A verdict challenge must target a verdict or 10-second-summary field.',
      'invalid_challenge_target',
    )
  }
  if (
    row.proposalType === 'CORRECTION' &&
    row.selectedField &&
    isVerdictContributionField(row.selectedField)
  ) {
    throw new ContributionProposalError(
      422,
      'A correction must target a programme fact or evidence-node field; use Challenge this conclusion for summary or verdict fields.',
      'invalid_correction_target',
    )
  }
  if (
    row.selectedField === 'verdict.verdictCode' &&
    status !== 'STOPPED' &&
    status !== 'WITHDRAWN'
  ) {
    throw new ContributionProposalError(
      422,
      'The stopped-programme verdict field is available only for a STOPPED or WITHDRAWN programme.',
      'invalid_stopped_verdict_target',
    )
  }

  if (row.proposedStoppedVerdict) {
    if (row.proposalType !== 'VERDICT_CHALLENGE') {
      throw new ContributionProposalError(
        422,
        'Only a verdict challenge may propose a stopped-programme verdict.',
        'invalid_stopped_verdict_type',
      )
    }
    if (status !== 'STOPPED' && status !== 'WITHDRAWN') {
      throw new ContributionProposalError(
        422,
        'A stopped-programme verdict is valid only for a STOPPED or WITHDRAWN programme.',
        'invalid_stopped_verdict_status',
      )
    }
    if (row.selectedField && row.selectedField !== 'verdict.verdictCode') {
      throw new ContributionProposalError(
        422,
        'A proposed stopped-programme verdict may only replace the verdict-code field.',
        'invalid_stopped_verdict_target',
      )
    }
  }
  if (
    row.selectedField === 'verdict.verdictCode' &&
    (row.proposedText?.trim() || row.proposedValue !== null)
  ) {
    throw new ContributionProposalError(
      422,
      'The verdict-code field uses the structured proposedStoppedVerdict value, not free text.',
      'invalid_stopped_verdict_value',
    )
  }
}

interface SubmissionState {
  programme: typeof developmentProgrammes.$inferSelect
  currentVerdict: typeof programmeVerdictRevisions.$inferSelect | null
  evidenceNode: typeof evidenceNodes.$inferSelect | null
  currentValueSnapshot: ContributionCurrentValueSnapshot | null
  currentVerdictSnapshot: ContributionCurrentVerdictSnapshot | null
  sourceRefreshDeltaSnapshot: ContributionSourceRefreshDeltaSnapshot | null
  preview: ContributionDraftPreview
}

function currentFieldValue(args: {
  field: ContributionSelectedField
  programme: typeof developmentProgrammes.$inferSelect
  verdict: typeof programmeVerdictRevisions.$inferSelect | null
  node: typeof evidenceNodes.$inferSelect | null
}): ContributionProposedValue | null {
  const { field, programme, verdict, node } = args
  switch (field) {
    case 'programme.title':
      return programme.title
    case 'programme.indication':
      return programme.indication
    case 'programme.targetPopulation':
      return programme.targetPopulation
    case 'programme.status':
      return programme.status
    case 'programme.highestPhaseReached':
      return programme.highestPhaseReached
    case 'programme.route':
      return programme.route
    case 'programme.doseExposureContext':
      return programme.doseExposureContext
    case 'programme.rawStoppingReason':
      return programme.rawStoppingReason
    case 'programme.stoppingReasonCategory':
      return programme.stoppingReasonCategory
    case 'summary.plainMechanism':
      return verdict?.plainMechanism ?? null
    case 'summary.bestSupportedFinding':
      return verdict?.bestSupportedFinding ?? null
    case 'summary.mainLimitation':
      return verdict?.mainLimitation ?? null
    case 'verdict.verdictCode':
      return verdict?.verdictCode ?? null
    case 'verdict.publicLabel':
      return verdict?.publicLabel ?? null
    case 'verdict.professionalLabel':
      return verdict?.professionalLabel ?? null
    case 'verdict.oneSentenceReason':
      return verdict?.oneSentenceReason ?? null
    case 'verdict.scope.indication':
      return verdict?.indicationScope ?? null
    case 'verdict.scope.population':
      return verdict?.populationScope ?? null
    case 'verdict.scope.doseExposure':
      return verdict?.doseExposureScope ?? null
    case 'verdict.scope.period':
      return verdict?.periodScope ?? null
    case 'verdict.scope.trials':
      return verdict?.trialScope ?? null
    case 'verdict.scope.outcome':
      return verdict?.outcomeScope ?? null
    case 'verdict.whatWasDisproven':
      return verdict?.whatWasDisproven ?? null
    case 'verdict.whatWasNotDisproven':
      return verdict?.whatWasNotDisproven ?? null
    case 'verdict.whatRemainsUnknown':
      return verdict?.whatRemainsUnknown ?? null
    case 'verdict.confidence':
      return verdict?.confidence ?? null
    case 'verdict.confidenceExplanation':
      return verdict?.confidenceExplanation ?? null
    case 'verdict.conditionsThatWouldChangeVerdict':
      return verdict?.conditionsThatWouldChangeVerdict ?? null
    case 'evidenceNode.state':
      return node?.state ?? null
    case 'evidenceNode.plainSummary':
      return node?.plainSummary ?? null
    case 'evidenceNode.professionalSummary':
      return node?.professionalSummary ?? null
    case 'evidenceNode.rationale':
      return node?.rationale ?? null
  }
}

function emptyImpact(currentVerdictRevisionId: string | null): ContributionImpactPreview {
  return {
    version: 'rna-intelligence/contribution-impact-v1',
    currentVerdictRevisionId,
    matchedDependencyCount: 0,
    highestImpactLevel: null,
    affectedClaimIds: [],
    affectedSurfaces: [],
    noDependencyMatch: true,
  }
}

async function buildSubmissionState(
  database: ReadExecutor,
  proposal: ProposalRow,
  lock = false,
): Promise<SubmissionState> {
  const programmeQuery = database
    .select()
    .from(developmentProgrammes)
    .where(eq(developmentProgrammes.id, proposal.programmeId))
    .limit(1)
  const programmeRows = lock ? await programmeQuery.for('share') : await programmeQuery
  const liveProgramme = programmeRows[0]
  if (!liveProgramme) {
    throw new ContributionProposalError(404, 'Programme not found.', 'programme_not_found')
  }

  const currentVerdict = await currentVerdictForProgramme(database, liveProgramme.id, lock)
  const scope = await currentPublishedScope(database, currentVerdict?.id ?? null, lock)
  const programme = programmeWithPublishedScope(liveProgramme, scope)
  const publishedNodes = await currentPublishedNodes(
    database,
    programme.id,
    currentVerdict?.id ?? null,
    lock,
  )
  const evidenceNode = publishedNodes.find((node) => node.id === proposal.evidenceNodeId) ?? null

  const dependencyQuery = database
    .select({
      claimId: programmeDependencies.claimId,
      dependentSurfaceType: programmeDependencies.dependentSurfaceType,
      evidenceNodeId: programmeDependencies.evidenceNodeId,
      verdictRevisionId: programmeDependencies.verdictRevisionId,
      fieldPath: programmeDependencies.fieldPath,
      impactLevel: programmeDependencies.impactLevel,
    })
    .from(programmeDependencies)
    .where(eq(programmeDependencies.programmeId, programme.id))
  const dependencyRows = lock ? await dependencyQuery.for('share') : await dependencyQuery

  const impactPreview =
    proposal.proposalType === 'SOURCE_REFRESH' && proposal.sourceRefreshDeltaSnapshot
      ? deriveSourceRefreshImpactPreview({
          delta: proposal.sourceRefreshDeltaSnapshot,
          currentVerdictRevisionId: currentVerdict?.id ?? null,
          dependencies: dependencyRows,
        })
      : proposal.selectedField
        ? deriveContributionImpactPreview({
            proposalType: proposal.proposalType,
            selectedField: proposal.selectedField,
            evidenceNodeId: proposal.evidenceNodeId,
            currentVerdictRevisionId: currentVerdict?.id ?? null,
            dependencies: dependencyRows,
          })
        : emptyImpact(currentVerdict?.id ?? null)

  const machineChecks = runContributionMachineChecks({
    candidate: proposal,
    programmeStatus: programme.status,
    hasCurrentVerdict: currentVerdict !== null,
    evidenceNodeExistsInProgramme: proposal.evidenceNodeId !== null && evidenceNode !== null,
    impactPreview,
  })

  const currentVerdictSnapshot = currentVerdict ? toVerdictSnapshot(currentVerdict) : null
  const currentValueSnapshot = proposal.selectedField
    ? {
        version: 'rna-intelligence/contribution-current-value-v1' as const,
        programmeId: programme.id,
        programmeStatus: programme.status,
        selectedField: proposal.selectedField,
        value: currentFieldValue({
          field: proposal.selectedField,
          programme,
          verdict: currentVerdict,
          node: evidenceNode,
        }),
        evidenceNode: evidenceNode
          ? {
              id: evidenceNode.id,
              nodeType: evidenceNode.nodeType,
              revisionNumber: evidenceNode.revisionNumber,
              publishedAt: requiredIso(evidenceNode.publishedAt, 'evidence node publishedAt'),
            }
          : null,
      }
    : null

  return {
    programme,
    currentVerdict,
    evidenceNode,
    currentValueSnapshot,
    currentVerdictSnapshot,
    sourceRefreshDeltaSnapshot: proposal.sourceRefreshDeltaSnapshot,
    preview: { machineChecks, impactPreview },
  }
}

export async function createContributionDraft(args: {
  medicineSlug: string
  programmeRef: string
  authorUserId: string
  input: CreateContributionDraftInput
}): Promise<{
  proposal: ProgrammeContributionProposalReadModel
  preview: ContributionDraftPreview
}> {
  const resolved = await resolveProgramme(db, args.medicineSlug, args.programmeRef)
  if (!resolved) {
    throw new ContributionProposalError(404, 'Programme not found.', 'programme_not_found')
  }

  const id = newId('proposal')
  const values = draftValues(args.input)
  let refreshDelta: ContributionSourceRefreshDeltaSnapshot | null = null
  if (args.input.proposalType === 'SOURCE_REFRESH') {
    if (!values.sourceReviewTaskId || !values.sourceReviewSnapshotId) {
      throw new ContributionProposalError(
        422,
        'Choose the exact current ClinicalTrials.gov source task.',
        'source_refresh_task_required',
      )
    }
    const binding = await loadCurrentSourceRefreshBinding(db, {
      programmeId: resolved.programme.id,
      reviewTaskId: values.sourceReviewTaskId,
      reviewSnapshotId: values.sourceReviewSnapshotId,
    })
    if (!binding) {
      throw new ContributionProposalError(
        409,
        'A newer saved source version replaced this task. Open the current source task instead.',
        'stale_source_review_binding',
      )
    }
    // The task, not the browser, owns the citation identity. Persist the canonical source row so
    // the application validator and database submission guard enforce the same exact values.
    values.sourceType = binding.source.sourceType
    values.sourceLocator = binding.source.canonicalLocator
    values.sourceIdentifier = binding.source.externalIdentifier
    refreshDelta = binding.delta
  }
  const candidate = {
    id,
    proposalKey: id,
    revisionNumber: 1,
    previousProposalId: null,
    programmeId: resolved.programme.id,
    authorUserId: args.authorUserId,
    proposalType: args.input.proposalType,
    status: 'DRAFT' as const,
    ...values,
    sourceRefreshDeltaSnapshot: refreshDelta,
    currentValueSnapshot: null,
  } satisfies typeof programmeContributionProposals.$inferInsert
  await validateDraftReferences(db, candidate)
  const rows = await db.insert(programmeContributionProposals).values(candidate).returning()
  const row = rows[0]
  if (!row) throw new Error('Contribution draft insert returned no row.')
  const state = await buildSubmissionState(db, row)
  return { proposal: serializeProposal(row), preview: state.preview }
}

export async function listAuthorProgrammeContributions(args: {
  medicineSlug: string
  programmeRef: string
  authorUserId: string
}): Promise<ProgrammeContributionProposalReadModel[] | null> {
  const resolved = await resolveProgramme(db, args.medicineSlug, args.programmeRef)
  if (!resolved) return null
  const rows = await db
    .select()
    .from(programmeContributionProposals)
    .where(
      and(
        eq(programmeContributionProposals.programmeId, resolved.programme.id),
        eq(programmeContributionProposals.authorUserId, args.authorUserId),
      ),
    )
    .orderBy(
      desc(programmeContributionProposals.createdAt),
      desc(programmeContributionProposals.id),
    )
  const reviewAudits = await listPublicContributionReviewAudits(
    rows.filter((row) => row.status === 'SUBMITTED').map((row) => row.id),
  )
  return rows.map((row) => serializeProposal(row, reviewAudits[row.id] ?? null))
}

function mergedReferenceRow(row: ProposalRow, patch: ContributionDraftPatch): ProposalRow {
  const values = draftPatchSet(patch)
  return { ...row, ...values } as ProposalRow
}

export async function updateContributionDraft(args: {
  proposalId: string
  authorUserId: string
  patch: ContributionDraftPatch
}): Promise<{
  proposal: ProgrammeContributionProposalReadModel
  preview: ContributionDraftPreview
}> {
  return db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(programmeContributionProposals)
      .where(
        and(
          eq(programmeContributionProposals.id, args.proposalId),
          eq(programmeContributionProposals.authorUserId, args.authorUserId),
        ),
      )
      .limit(1)
      .for('update')
    const existing = rows[0]
    if (!existing) {
      throw new ContributionProposalError(404, 'Contribution proposal not found.', 'not_found')
    }
    if (existing.status !== 'DRAFT') {
      throw new ContributionProposalError(
        409,
        'Submitted proposals are frozen. Create a new revision instead.',
        'proposal_frozen',
      )
    }

    if (
      existing.proposalType === 'SOURCE_REFRESH' &&
      Object.keys(args.patch).some(
        (key) => key !== 'conflictsOfInterest' && key !== 'conflictsOfInterestAttested',
      )
    ) {
      throw new ContributionProposalError(
        422,
        'The saved registry comparison is read-only. You may update only your conflict-of-interest disclosure.',
        'source_refresh_read_only',
      )
    }

    const merged = mergedReferenceRow(existing, args.patch)
    await validateDraftReferences(tx, merged)
    const updatedRows = await tx
      .update(programmeContributionProposals)
      .set({ ...draftPatchSet(args.patch), updatedAt: new Date() })
      .where(eq(programmeContributionProposals.id, existing.id))
      .returning()
    const updated = updatedRows[0]
    if (!updated) throw new Error('Contribution draft update returned no row.')
    const state = await buildSubmissionState(tx, updated)
    return { proposal: serializeProposal(updated), preview: state.preview }
  })
}

export async function submitContributionProposal(args: {
  proposalId: string
  authorUserId: string
}): Promise<ProgrammeContributionProposalReadModel> {
  const submittedProposal = await db.transaction(async (tx) => {
    const initialRows = await tx
      .select()
      .from(programmeContributionProposals)
      .where(
        and(
          eq(programmeContributionProposals.id, args.proposalId),
          eq(programmeContributionProposals.authorUserId, args.authorUserId),
        ),
      )
      .limit(1)
    const initial = initialRows[0]
    if (!initial) {
      throw new ContributionProposalError(404, 'Contribution proposal not found.', 'not_found')
    }
    await lockContributionLineage(tx, initial.programmeId, initial.proposalKey)

    const rows = await tx
      .select()
      .from(programmeContributionProposals)
      .where(
        and(
          eq(programmeContributionProposals.id, args.proposalId),
          eq(programmeContributionProposals.authorUserId, args.authorUserId),
        ),
      )
      .limit(1)
      .for('update')
    const proposal = rows[0]
    if (!proposal) {
      throw new ContributionProposalError(404, 'Contribution proposal not found.', 'not_found')
    }
    if (proposal.status !== 'DRAFT') {
      throw new ContributionProposalError(
        409,
        'This proposal has already been submitted. Create a new revision to change it.',
        'proposal_frozen',
      )
    }

    await validateDraftReferences(tx, proposal)
    const state = await buildSubmissionState(tx, proposal, true)
    if (
      !state.preview.machineChecks.passed ||
      (proposal.proposalType === 'SOURCE_REFRESH'
        ? !state.sourceRefreshDeltaSnapshot || !state.currentVerdict
        : !state.currentValueSnapshot)
    ) {
      throw new ContributionProposalError(
        409,
        'The proposal is still a draft because one or more deterministic checks failed.',
        'machine_checks_failed',
        state.preview,
      )
    }

    const submittedAt = new Date()

    // Re-read the authoritative pointer after building the bundle. Existing pointer/verdict rows
    // are held FOR SHARE above; this second read also detects a first publication inserted while
    // a previously unpublished programme proposal was being prepared.
    const recheckedVerdict = await currentVerdictForProgramme(tx, proposal.programmeId, true)
    if ((recheckedVerdict?.id ?? null) !== (state.currentVerdict?.id ?? null)) {
      throw new ContributionProposalError(
        409,
        'The public verdict changed while this proposal was being submitted. Reload the current baseline and try again.',
        'stale_public_baseline',
      )
    }

    const updatedRows = await tx
      .update(programmeContributionProposals)
      .set({
        status: 'SUBMITTED',
        currentValueSnapshot: state.currentValueSnapshot,
        currentVerdictRevisionId: state.currentVerdict?.id ?? null,
        currentVerdictSnapshot: state.currentVerdictSnapshot,
        sourceRefreshDeltaSnapshot: state.sourceRefreshDeltaSnapshot,
        machineChecks: state.preview.machineChecks,
        impactPreview: state.preview.impactPreview,
        contentDigestAlgorithm: 'sha256',
        // The 0007 BEFORE trigger replaces this shape-valid sentinel with the digest it computes
        // from the authoritative frozen row. No caller-provided digest becomes authoritative.
        contentDigest: '0'.repeat(64),
        submittedAt,
        updatedAt: submittedAt,
      })
      .where(
        and(
          eq(programmeContributionProposals.id, proposal.id),
          eq(programmeContributionProposals.status, 'DRAFT'),
        ),
      )
      .returning()
    const submittedRow = updatedRows[0]
    if (!submittedRow) {
      throw new ContributionProposalError(
        409,
        'The draft changed while it was being submitted. Reload and try again.',
        'submission_conflict',
      )
    }
    // 0006 also has an AFTER-status trigger so raw SQL cannot strand a submitted proposal. The
    // explicit idempotent insert keeps the application transaction self-documenting and makes the
    // state creation inseparable from the DRAFT -> SUBMITTED commit.
    await tx
      .insert(programmeContributionReviewStates)
      .values({ proposalId: submittedRow.id })
      .onConflictDoNothing()
    return submittedRow
  })

  const reviewAudits = await listPublicContributionReviewAudits([submittedProposal.id])
  return serializeProposal(submittedProposal, reviewAudits[submittedProposal.id] ?? null)
}

export async function reviseSubmittedContribution(args: {
  proposalId: string
  authorUserId: string
}): Promise<{
  proposal: ProgrammeContributionProposalReadModel
  preview: ContributionDraftPreview
}> {
  const created = await db.transaction(async (tx) => {
    const initialRows = await tx
      .select()
      .from(programmeContributionProposals)
      .where(
        and(
          eq(programmeContributionProposals.id, args.proposalId),
          eq(programmeContributionProposals.authorUserId, args.authorUserId),
        ),
      )
      .limit(1)
    const initial = initialRows[0]
    if (!initial) {
      throw new ContributionProposalError(404, 'Contribution proposal not found.', 'not_found')
    }
    await lockContributionLineage(tx, initial.programmeId, initial.proposalKey)

    const rows = await tx
      .select()
      .from(programmeContributionProposals)
      .where(
        and(
          eq(programmeContributionProposals.id, args.proposalId),
          eq(programmeContributionProposals.authorUserId, args.authorUserId),
        ),
      )
      .limit(1)
      .for('update')
    const previous = rows[0]
    if (!previous) {
      throw new ContributionProposalError(404, 'Contribution proposal not found.', 'not_found')
    }
    if (previous.status !== 'SUBMITTED') {
      throw new ContributionProposalError(
        409,
        'Only a submitted proposal needs a new revision; this draft can still be edited.',
        'revision_not_required',
      )
    }

    const reviewStateRows = await tx
      .select()
      .from(programmeContributionReviewStates)
      .where(eq(programmeContributionReviewStates.proposalId, previous.id))
      .limit(1)
    const reviewState = reviewStateRows[0]
    if (!reviewState) {
      throw new ContributionProposalError(
        409,
        'This submitted proposal is missing its review workflow state.',
        'review_state_missing',
      )
    }
    if (reviewState.status === 'DISAGREEMENT') {
      throw new ContributionProposalError(
        409,
        'The independent reviews disagree. A steward must adjudicate before the author can revise.',
        'adjudication_required',
        { reviewStatus: reviewState.status },
      )
    }
    if (
      reviewState.status === 'AWAITING_REVIEWS' ||
      reviewState.status === 'AWAITING_SECOND_REVIEW' ||
      reviewState.status === 'AWAITING_THIRD_REVIEW'
    ) {
      throw new ContributionProposalError(
        409,
        'Independent review is still in progress. Revise only after a final adverse decision.',
        'review_in_progress',
        { reviewStatus: reviewState.status },
      )
    }
    if (reviewState.status === 'ACCEPTED_FOR_IMPLEMENTATION') {
      throw new ContributionProposalError(
        409,
        'This proposal was accepted for implementation and remains frozen for the canonical implementation workflow.',
        'proposal_accepted',
        { reviewStatus: reviewState.status },
      )
    }
    if (reviewState.status !== 'CHANGES_REQUESTED' && reviewState.status !== 'REJECTED') {
      throw new ContributionProposalError(
        409,
        'This review outcome does not permit an author revision.',
        'revision_not_allowed',
        { reviewStatus: reviewState.status },
      )
    }

    const existingRows = await tx
      .select()
      .from(programmeContributionProposals)
      .where(eq(programmeContributionProposals.previousProposalId, previous.id))
      .limit(1)
    if (existingRows[0]) return existingRows[0]

    const id = newId('proposal')
    const insertedRows = await tx
      .insert(programmeContributionProposals)
      .values({
        id,
        proposalKey: previous.proposalKey,
        revisionNumber: previous.revisionNumber + 1,
        previousProposalId: previous.id,
        programmeId: previous.programmeId,
        authorUserId: previous.authorUserId,
        proposalType: previous.proposalType,
        status: 'DRAFT',
        selectedField: previous.selectedField,
        proposedText: previous.proposedText,
        proposedValue: previous.proposedValue,
        sourceType: previous.sourceType,
        sourceLocator: previous.sourceLocator,
        sourceIdentifier: previous.sourceIdentifier,
        sourceReviewTaskId: previous.sourceReviewTaskId,
        sourceReviewSnapshotId: previous.sourceReviewSnapshotId,
        sourceRefreshDeltaSnapshot: previous.sourceRefreshDeltaSnapshot,
        claimNature: previous.claimNature,
        evidenceNodeId: previous.evidenceNodeId,
        proposedStoppedVerdict: previous.proposedStoppedVerdict,
        reasoning: previous.reasoning,
        whatWasWrongOrMissing: previous.whatWasWrongOrMissing,
        affects: previous.affects,
        conflictsOfInterest: previous.conflictsOfInterest,
        conflictsOfInterestAttested: previous.conflictsOfInterestAttested,
      })
      .returning()
    const inserted = insertedRows[0]
    if (!inserted) throw new Error('Contribution revision insert returned no row.')
    return inserted
  })

  const state = await buildSubmissionState(db, created)
  return { proposal: serializeProposal(created), preview: state.preview }
}

export async function listPublicPendingContributionProposals(args: {
  limit: number
  offset: number
  proposalType?: ContributionProposalType
  reviewStatus?: ContributionReviewStateView['status']
}): Promise<{ proposals: PublicContributionProposal[]; total: number }> {
  const where = and(
    eq(programmeContributionProposals.status, 'SUBMITTED'),
    sql`(
      ${programmeContributionProposals.sourceReviewTaskId} is null
      or exists (
        select 1
        from evidence_review_tasks source_task
        inner join programme_freshness_states source_freshness
          on source_freshness.programme_id = source_task.programme_id
          and source_freshness.source_id = source_task.source_id
        where source_task.id = ${programmeContributionProposals.sourceReviewTaskId}
          and source_task.programme_id = ${programmeContributionProposals.programmeId}
          and source_task.trigger_snapshot_id = ${programmeContributionProposals.sourceReviewSnapshotId}
          and source_task.status in ('OPEN', 'IN_REVIEW', 'BLOCKED')
          and source_freshness.pending_snapshot_id = ${programmeContributionProposals.sourceReviewSnapshotId}
      )
    )`,
    args.proposalType
      ? eq(programmeContributionProposals.proposalType, args.proposalType)
      : undefined,
    args.reviewStatus
      ? eq(programmeContributionReviewStates.status, args.reviewStatus)
      : inArray(programmeContributionReviewStates.status, [
          'AWAITING_REVIEWS',
          'AWAITING_SECOND_REVIEW',
          'AWAITING_THIRD_REVIEW',
          'DISAGREEMENT',
        ]),
    args.reviewStatus
      ? undefined
      : or(
          // Legacy/racy lineages are never allowed to erase a visible disagreement. New 0006
          // guards prevent such a child, while this branch preserves any pre-existing audit row.
          eq(programmeContributionReviewStates.status, 'DISAGREEMENT'),
          sql`not exists (
            select 1
            from programme_contribution_proposals newer
            where newer.programme_id = ${programmeContributionProposals.programmeId}
              and newer.proposal_key = ${programmeContributionProposals.proposalKey}
              and newer.status = 'SUBMITTED'
              and newer.revision_number > ${programmeContributionProposals.revisionNumber}
          )`,
        ),
  )

  const [rows, countRows] = await Promise.all([
    db
      .select({
        proposal: programmeContributionProposals,
        medicineSlug: drugs.slug,
        medicineName: drugs.name,
        programmeSlug: developmentProgrammes.slug,
        programmeTitle: developmentProgrammes.title,
        programmeStatus: developmentProgrammes.status,
        authorName: users.name,
        authorHandle: users.handle,
        authorOrcid: users.orcid,
      })
      .from(programmeContributionProposals)
      .innerJoin(
        developmentProgrammes,
        eq(developmentProgrammes.id, programmeContributionProposals.programmeId),
      )
      .innerJoin(drugs, eq(drugs.id, developmentProgrammes.drugId))
      .innerJoin(users, eq(users.id, programmeContributionProposals.authorUserId))
      .innerJoin(
        programmeContributionReviewStates,
        eq(programmeContributionReviewStates.proposalId, programmeContributionProposals.id),
      )
      .where(where)
      .orderBy(
        asc(programmeContributionProposals.submittedAt),
        asc(programmeContributionProposals.id),
      )
      .limit(args.limit)
      .offset(args.offset),
    db
      .select({ value: count() })
      .from(programmeContributionProposals)
      .innerJoin(
        programmeContributionReviewStates,
        eq(programmeContributionReviewStates.proposalId, programmeContributionProposals.id),
      )
      .where(where),
  ])

  const reviewAudits = await listPublicContributionReviewAudits(
    rows.map((entry) => entry.proposal.id),
  )

  const proposals: PublicContributionProposal[] = rows.map((entry) => {
    const row = entry.proposal
    const reviewAudit = reviewAudits[row.id]
    if (
      !row.sourceType ||
      !row.sourceLocator ||
      !row.sourceIdentifier ||
      !row.conflictsOfInterest ||
      !row.conflictsOfInterestAttested ||
      !row.machineChecks ||
      !row.impactPreview ||
      !row.contentDigest ||
      !row.submittedAt ||
      (row.proposalType === 'SOURCE_REFRESH'
        ? !row.sourceRefreshDeltaSnapshot || !row.currentVerdictSnapshot
        : !row.selectedField ||
          !row.claimNature ||
          !row.reasoning ||
          !row.whatWasWrongOrMissing ||
          !row.affects ||
          !row.currentValueSnapshot)
    ) {
      throw new Error(`Submitted contribution ${row.id} is missing its frozen review bundle.`)
    }
    if (!reviewAudit) {
      throw new Error(`Submitted contribution ${row.id} is missing its review state.`)
    }

    const frozenEvidenceNode = row.currentValueSnapshot?.evidenceNode ?? null

    return {
      id: row.id,
      proposalKey: row.proposalKey,
      revisionNumber: row.revisionNumber,
      previousProposalId: row.previousProposalId,
      proposalType: row.proposalType,
      author: {
        name: entry.authorName,
        handle: entry.authorHandle,
        ...(entry.authorOrcid ? { orcid: entry.authorOrcid } : {}),
      },
      medicine: { slug: entry.medicineSlug, name: entry.medicineName },
      programme: {
        id: row.programmeId,
        slug: entry.programmeSlug,
        title: entry.programmeTitle,
        status: entry.programmeStatus,
      },
      selectedField: row.selectedField,
      proposedText: row.proposedText,
      proposedValue: row.proposedValue,
      proposedStoppedVerdict: row.proposedStoppedVerdict,
      source: {
        type: row.sourceType,
        locator: row.sourceLocator,
        identifier: row.sourceIdentifier,
        reviewTaskId: row.sourceReviewTaskId,
        reviewSnapshotId: row.sourceReviewSnapshotId,
      },
      claimNature: row.claimNature,
      evidenceNodeId: row.evidenceNodeId,
      evidenceNode: frozenEvidenceNode
        ? {
            id: frozenEvidenceNode.id,
            nodeType: frozenEvidenceNode.nodeType,
            title: evidenceNodeLabel(frozenEvidenceNode.nodeType),
            label: evidenceNodeLabel(frozenEvidenceNode.nodeType),
          }
        : null,
      reasoning: row.reasoning,
      whatWasWrongOrMissing: row.whatWasWrongOrMissing,
      affects: row.affects,
      conflictsOfInterest: row.conflictsOfInterest,
      conflictsOfInterestAttested: true,
      structuredDiff: {
        selectedField: row.selectedField,
        currentValue: row.currentValueSnapshot?.value ?? null,
        proposedText: row.proposedText,
        proposedValue: row.proposedValue,
        proposedStoppedVerdict: row.proposedStoppedVerdict,
      },
      currentVerdictSnapshot: row.currentVerdictSnapshot,
      sourceRefreshDeltaSnapshot: row.sourceRefreshDeltaSnapshot,
      machineChecks: row.machineChecks,
      impactPreview: row.impactPreview,
      contentDigestAlgorithm: 'sha256',
      contentDigest: row.contentDigest,
      submittedAt: row.submittedAt.toISOString(),
      ...reviewAudit,
    }
  })

  return { proposals, total: Number(countRows[0]?.value ?? 0) }
}
