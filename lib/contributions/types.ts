import {
  EVIDENCE_STATES,
  PROGRAMME_STATUSES,
  STOPPING_REASON_CATEGORIES,
  VERDICT_CONFIDENCE_LEVELS,
  type ClaimNature,
  type DependentSurfaceType,
  type EvidenceSourceType,
  type ProgrammeStatus,
  type ReviewImpactLevel,
  type StudyInterpretabilityCriterion,
  type StoppedProgrammeVerdict,
} from '@/lib/evidence/types'
import type { NormalizedFact, NormalizedFactRisk } from '@/lib/evidence/source-adapter'
import { stableJsonStringify } from '@/lib/stable-json'

export const CONTRIBUTION_PROPOSAL_TYPES = [
  'CORRECTION',
  'VERDICT_CHALLENGE',
  'SOURCE_REFRESH',
] as const
export type ContributionProposalType = (typeof CONTRIBUTION_PROPOSAL_TYPES)[number]

export const SOURCE_REFRESH_ACTIONS = ['CANONICAL_REFRESH', 'NEEDS_SCIENTIFIC_REVISION'] as const
export type SourceRefreshAction = (typeof SOURCE_REFRESH_ACTIONS)[number]

export const CONTRIBUTION_PROPOSAL_STATUSES = ['DRAFT', 'SUBMITTED'] as const
export type ContributionProposalStatus = (typeof CONTRIBUTION_PROPOSAL_STATUSES)[number]

export const CONTRIBUTION_REVIEW_STATUSES = [
  'AWAITING_REVIEWS',
  'AWAITING_SECOND_REVIEW',
  'DISAGREEMENT',
  'ACCEPTED_FOR_IMPLEMENTATION',
  'CHANGES_REQUESTED',
  'REJECTED',
] as const
export type ContributionReviewStatus = (typeof CONTRIBUTION_REVIEW_STATUSES)[number]

export const CONTRIBUTION_AFFECTS = ['DISPROVEN', 'OPEN_QUESTIONS', 'BOTH'] as const
export type ContributionAffects = (typeof CONTRIBUTION_AFFECTS)[number]

export const CONTRIBUTION_SELECTED_FIELDS = [
  'programme.title',
  'programme.indication',
  'programme.targetPopulation',
  'programme.status',
  'programme.highestPhaseReached',
  'programme.route',
  'programme.doseExposureContext',
  'programme.rawStoppingReason',
  'programme.stoppingReasonCategory',
  'summary.plainMechanism',
  'summary.bestSupportedFinding',
  'summary.mainLimitation',
  'verdict.verdictCode',
  'verdict.publicLabel',
  'verdict.professionalLabel',
  'verdict.oneSentenceReason',
  'verdict.scope.indication',
  'verdict.scope.population',
  'verdict.scope.doseExposure',
  'verdict.scope.period',
  'verdict.scope.trials',
  'verdict.scope.outcome',
  'verdict.whatWasDisproven',
  'verdict.whatWasNotDisproven',
  'verdict.whatRemainsUnknown',
  'verdict.confidence',
  'verdict.confidenceExplanation',
  'verdict.conditionsThatWouldChangeVerdict',
  'evidenceNode.state',
  'evidenceNode.plainSummary',
  'evidenceNode.professionalSummary',
  'evidenceNode.rationale',
] as const
export type ContributionSelectedField = (typeof CONTRIBUTION_SELECTED_FIELDS)[number]

export const CONTRIBUTION_LIST_FIELDS = [
  'verdict.whatWasDisproven',
  'verdict.whatWasNotDisproven',
  'verdict.whatRemainsUnknown',
  'verdict.conditionsThatWouldChangeVerdict',
] as const satisfies readonly ContributionSelectedField[]

export const CONTRIBUTION_ENUM_FIELDS = [
  'programme.status',
  'programme.stoppingReasonCategory',
  'verdict.confidence',
  'evidenceNode.state',
] as const satisfies readonly ContributionSelectedField[]

export type ContributionValueKind = 'text' | 'list' | 'enum' | 'stoppedVerdict'

export function contributionFieldValueKind(
  field: ContributionSelectedField,
): ContributionValueKind {
  if (field === 'verdict.verdictCode') return 'stoppedVerdict'
  if ((CONTRIBUTION_LIST_FIELDS as readonly string[]).includes(field)) return 'list'
  if ((CONTRIBUTION_ENUM_FIELDS as readonly string[]).includes(field)) return 'enum'
  return 'text'
}

function isAllowedEnumReplacement(field: ContributionSelectedField, value: string): boolean {
  switch (field) {
    case 'programme.status':
      return (PROGRAMME_STATUSES as readonly string[]).includes(value)
    case 'programme.stoppingReasonCategory':
      return (STOPPING_REASON_CATEGORIES as readonly string[]).includes(value)
    case 'verdict.confidence':
      return (VERDICT_CONFIDENCE_LEVELS as readonly string[]).includes(value)
    case 'evidenceNode.state':
      return (EVIDENCE_STATES as readonly string[]).includes(value)
    default:
      return false
  }
}

export interface ContributionSourceCitation {
  type: EvidenceSourceType
  locator: string
  identifier: string
  /** Exact open monitor task selected from the review queue; never inferred from citation text. */
  reviewTaskId?: string
  /** Immutable trigger snapshot owned by reviewTaskId. Both fields must be supplied together. */
  reviewSnapshotId?: string
}

export type ContributionProposedValue = string | string[]

export interface SourceRefreshChangedTrialField {
  path: string
  before: NormalizedFact['value']
  after: NormalizedFact['value']
  risk: NormalizedFactRisk
}

export interface SourceRefreshAffectedInterpretability {
  assessmentId: string
  criterion: StudyInterpretabilityCriterion
  reasonCode: string
}

export interface SourceRefreshScientificRevisionRequirement {
  kind: 'CLAIM' | 'INTERPRETABILITY' | 'PRESENTATION' | 'UNCLASSIFIED_SOURCE_CHANGE'
  id: string | null
  fieldPath: string
  reasonCode: string
}

/**
 * Server-built immutable projection of one monitor task's parser output and graph impact. It is
 * digest-bound to the contribution; browsers may display it but never author or patch it.
 */
export interface ContributionSourceRefreshDeltaSnapshot {
  version: 'rna-intelligence/source-refresh-delta-v1'
  reviewTaskId: string
  programmeId: string
  sourceId: string
  baselineSnapshotId: string
  pendingSnapshotId: string
  adapterKey: string
  action: SourceRefreshAction
  changedTrialFields: SourceRefreshChangedTrialField[]
  affectedClaimIds: string[]
  affectedInterpretability: SourceRefreshAffectedInterpretability[]
  affectedSurfacePaths: string[]
  scientificRevisionRequirements: SourceRefreshScientificRevisionRequirement[]
  deltaDigestAlgorithm: 'sha256'
  deltaDigest: string
}

export interface ContributionMachineCheck {
  code: string
  status: 'PASS' | 'WARN' | 'FAIL'
  message: string
}

export interface ContributionMachineChecks {
  version: 'rna-intelligence/contribution-checks-v1'
  passed: boolean
  checks: ContributionMachineCheck[]
}

export interface ContributionImpactSurface {
  dependentSurfaceType: DependentSurfaceType
  fieldPath: string
  evidenceNodeId: string | null
  verdictRevisionId: string | null
  impactLevel: ReviewImpactLevel
}

export interface ContributionImpactPreview {
  version: 'rna-intelligence/contribution-impact-v1'
  currentVerdictRevisionId: string | null
  matchedDependencyCount: number
  highestImpactLevel: ReviewImpactLevel | null
  affectedClaimIds: string[]
  affectedSurfaces: ContributionImpactSurface[]
  noDependencyMatch: boolean
}

export interface ContributionCurrentVerdictSnapshot {
  id: string
  revisionNumber: number
  publishedAt: string
  programmeStatusAtReview: ProgrammeStatus
  verdictCode: StoppedProgrammeVerdict | null
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

export interface ContributionCurrentValueSnapshot {
  version: 'rna-intelligence/contribution-current-value-v1'
  programmeId: string
  programmeStatus: ProgrammeStatus
  selectedField: ContributionSelectedField
  value: unknown
  evidenceNode: null | {
    id: string
    nodeType: string
    revisionNumber: number
    publishedAt: string
  }
}

export interface ProgrammeDependencyForImpact {
  claimId: string
  dependentSurfaceType: DependentSurfaceType
  evidenceNodeId: string | null
  verdictRevisionId: string | null
  fieldPath: string
  impactLevel: ReviewImpactLevel
}

const IMPACT_RANK: Record<ReviewImpactLevel, number> = {
  LOW_RISK_EXACT_DATA: 0,
  INTERPRETIVE_REVIEW_REQUIRED: 1,
  POSSIBLE_VERDICT_IMPACT: 2,
  SAFETY_CRITICAL_REVIEW: 3,
}

export function isEvidenceNodeContributionField(
  field: ContributionSelectedField,
): field is Extract<ContributionSelectedField, `evidenceNode.${string}`> {
  return field.startsWith('evidenceNode.')
}

export function isVerdictContributionField(field: ContributionSelectedField): boolean {
  return field.startsWith('verdict.') || field.startsWith('summary.')
}

/**
 * Deterministic graph propagation. Callers provide persisted dependency rows, never a claimed
 * impact from the browser. Evidence-node changes fan out through every edge for that exact node;
 * all other fields require an exact stable field path, and verdict fields are pinned to the
 * current public revision.
 */
export function deriveContributionImpactPreview(args: {
  proposalType: ContributionProposalType
  selectedField: ContributionSelectedField
  evidenceNodeId: string | null
  currentVerdictRevisionId: string | null
  dependencies: ProgrammeDependencyForImpact[]
}): ContributionImpactPreview {
  const nodeField = isEvidenceNodeContributionField(args.selectedField)
  const verdictField = isVerdictContributionField(args.selectedField)

  const matched = args.dependencies.filter((dependency) => {
    if (nodeField) {
      return args.evidenceNodeId !== null && dependency.evidenceNodeId === args.evidenceNodeId
    }
    if (verdictField) {
      const exactVerdictField =
        args.currentVerdictRevisionId !== null &&
        dependency.verdictRevisionId === args.currentVerdictRevisionId &&
        dependency.fieldPath === args.selectedField
      const selectedNode =
        args.proposalType === 'VERDICT_CHALLENGE' &&
        args.evidenceNodeId !== null &&
        dependency.evidenceNodeId === args.evidenceNodeId
      return exactVerdictField || selectedNode
    }
    return dependency.fieldPath === args.selectedField
  })

  const surfacesByKey = new Map<string, ContributionImpactSurface>()
  for (const dependency of matched) {
    const surface: ContributionImpactSurface = {
      dependentSurfaceType: dependency.dependentSurfaceType,
      fieldPath: dependency.fieldPath,
      evidenceNodeId: dependency.evidenceNodeId,
      verdictRevisionId: dependency.verdictRevisionId,
      impactLevel: dependency.impactLevel,
    }
    const key = stableJsonStringify(surface)
    surfacesByKey.set(key, surface)
  }

  const affectedSurfaces = [...surfacesByKey.values()].sort((left, right) =>
    stableJsonStringify(left).localeCompare(stableJsonStringify(right)),
  )
  const affectedClaimIds = [...new Set(matched.map((dependency) => dependency.claimId))].sort()
  const highestImpactLevel = matched.reduce<ReviewImpactLevel | null>((highest, dependency) => {
    if (highest === null || IMPACT_RANK[dependency.impactLevel] > IMPACT_RANK[highest]) {
      return dependency.impactLevel
    }
    return highest
  }, null)

  return {
    version: 'rna-intelligence/contribution-impact-v1',
    currentVerdictRevisionId: args.currentVerdictRevisionId,
    matchedDependencyCount: matched.length,
    highestImpactLevel,
    affectedClaimIds,
    affectedSurfaces,
    noDependencyMatch: matched.length === 0,
  }
}

/** Derives a source-refresh preview only from the monitor's frozen graph identifiers. */
export function deriveSourceRefreshImpactPreview(args: {
  delta: ContributionSourceRefreshDeltaSnapshot
  currentVerdictRevisionId: string | null
  dependencies: ProgrammeDependencyForImpact[]
}): ContributionImpactPreview {
  const affectedClaims = new Set(args.delta.affectedClaimIds)
  const affectedPaths = new Set(args.delta.affectedSurfacePaths)
  const matched = args.dependencies.filter((dependency) => {
    if (affectedClaims.has(dependency.claimId)) return true
    const target = dependency.evidenceNodeId ?? dependency.verdictRevisionId
    const scopedPath = target
      ? `${dependency.dependentSurfaceType}:${target}:${dependency.fieldPath}`
      : `${dependency.dependentSurfaceType}:${dependency.fieldPath}`
    return affectedPaths.has(dependency.fieldPath) || affectedPaths.has(scopedPath)
  })
  const surfacesByKey = new Map<string, ContributionImpactSurface>()
  for (const dependency of matched) {
    const surface: ContributionImpactSurface = {
      dependentSurfaceType: dependency.dependentSurfaceType,
      fieldPath: dependency.fieldPath,
      evidenceNodeId: dependency.evidenceNodeId,
      verdictRevisionId: dependency.verdictRevisionId,
      impactLevel: dependency.impactLevel,
    }
    surfacesByKey.set(stableJsonStringify(surface), surface)
  }
  const affectedSurfaces = [...surfacesByKey.values()].sort((left, right) =>
    stableJsonStringify(left).localeCompare(stableJsonStringify(right)),
  )
  const affectedClaimIds = [...new Set(matched.map((dependency) => dependency.claimId))].sort()
  const highestImpactLevel = matched.reduce<ReviewImpactLevel | null>((highest, dependency) => {
    if (highest === null || IMPACT_RANK[dependency.impactLevel] > IMPACT_RANK[highest]) {
      return dependency.impactLevel
    }
    return highest
  }, null)
  return {
    version: 'rna-intelligence/contribution-impact-v1',
    currentVerdictRevisionId: args.currentVerdictRevisionId,
    matchedDependencyCount: matched.length,
    highestImpactLevel,
    affectedClaimIds,
    affectedSurfaces,
    noDependencyMatch: matched.length === 0,
  }
}

export interface ContributionSubmissionCandidate {
  proposalType: ContributionProposalType
  selectedField: ContributionSelectedField | null
  proposedText: string | null
  proposedValue: ContributionProposedValue | null
  sourceType: EvidenceSourceType | null
  sourceLocator: string | null
  sourceIdentifier: string | null
  claimNature: ClaimNature | null
  evidenceNodeId: string | null
  proposedStoppedVerdict: StoppedProgrammeVerdict | null
  reasoning: string | null
  whatWasWrongOrMissing: string | null
  affects: ContributionAffects | null
  conflictsOfInterest: string | null
  conflictsOfInterestAttested: boolean
  sourceReviewTaskId?: string | null
  sourceReviewSnapshotId?: string | null
  sourceRefreshDeltaSnapshot?: ContributionSourceRefreshDeltaSnapshot | null
}

function hasText(value: string | null): boolean {
  return Boolean(value?.trim())
}

function hasStructuredValue(value: ContributionProposedValue | null): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  return Array.isArray(value) && value.length > 0 && value.every((entry) => entry.trim().length > 0)
}

function isHttpsOrHttpUrl(value: string | null): boolean {
  if (!value) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

/** Machine checks are intentionally plain rules: no model call and no clinical inference. */
export function runContributionMachineChecks(args: {
  candidate: ContributionSubmissionCandidate
  programmeStatus: ProgrammeStatus
  hasCurrentVerdict: boolean
  evidenceNodeExistsInProgramme: boolean
  impactPreview: ContributionImpactPreview
}): ContributionMachineChecks {
  const { candidate } = args
  const checks: ContributionMachineCheck[] = []
  const add = (code: string, passed: boolean, ok: string, failed: string) => {
    checks.push({ code, status: passed ? 'PASS' : 'FAIL', message: passed ? ok : failed })
  }

  if (candidate.proposalType === 'SOURCE_REFRESH') {
    const delta = candidate.sourceRefreshDeltaSnapshot ?? null
    add(
      'source_refresh_exact_task_binding',
      Boolean(
        candidate.sourceReviewTaskId &&
        candidate.sourceReviewSnapshotId &&
        delta &&
        delta.reviewTaskId === candidate.sourceReviewTaskId &&
        delta.pendingSnapshotId === candidate.sourceReviewSnapshotId,
      ),
      'The source refresh is tied to one exact current monitor task and saved source version.',
      'Reload the current source task; its saved source version no longer matches this draft.',
    )
    add(
      'source_refresh_structured_delta',
      Boolean(delta && delta.changedTrialFields.length > 0),
      'The source refresh contains a parser-derived trial-field comparison.',
      'No parser-derived source change is available for review.',
    )
    add(
      'source_refresh_no_authored_replacement',
      candidate.selectedField === null &&
        !hasText(candidate.proposedText) &&
        candidate.proposedValue === null &&
        candidate.evidenceNodeId === null &&
        candidate.proposedStoppedVerdict === null &&
        candidate.claimNature === null &&
        !hasText(candidate.reasoning) &&
        !hasText(candidate.whatWasWrongOrMissing) &&
        candidate.affects === null,
      'The proposal contains only saved source facts; it does not invent a claim or conclusion.',
      'A source refresh cannot contain a selected field, replacement value, evidence node, claim wording, or conclusion.',
    )
    add(
      'current_verdict_available',
      args.hasCurrentVerdict,
      'The refresh is pinned to the current public programme conclusion.',
      'This programme has no current published conclusion to refresh through the canonical review path.',
    )
    add(
      'source_complete',
      candidate.sourceType === 'CLINICAL_TRIAL_REGISTRY' &&
        hasText(candidate.sourceIdentifier) &&
        isHttpsOrHttpUrl(candidate.sourceLocator),
      'The saved ClinicalTrials.gov identity and web address are present.',
      'The source refresh must use the exact saved ClinicalTrials.gov trial identity and web address.',
    )
    add(
      'source_refresh_action_ready',
      delta?.action === 'CANONICAL_REFRESH',
      'The saved changes can move through canonical review without rewriting scientific claims.',
      'Scientific claims or interpretation must be revised explicitly before this source task can continue.',
    )
    add(
      'coi_attested',
      candidate.conflictsOfInterestAttested && hasText(candidate.conflictsOfInterest),
      'Conflict-of-interest disclosure is present and attested.',
      'Disclose conflicts (including “None”) and attest that the disclosure is complete.',
    )
    checks.push({
      code: 'dependency_graph_coverage',
      status: args.impactPreview.noDependencyMatch ? 'WARN' : 'PASS',
      message: args.impactPreview.noDependencyMatch
        ? 'No matching dependency edge is stored; reviewers must confirm that the saved source change is limited to exact trial facts.'
        : `${args.impactPreview.matchedDependencyCount} persisted dependency edge(s) determine the source-refresh impact preview.`,
    })
    return {
      version: 'rna-intelligence/contribution-checks-v1',
      passed: checks.every((check) => check.status !== 'FAIL'),
      checks,
    }
  }

  add(
    'selected_field_present',
    candidate.selectedField !== null,
    'A structured target field is selected.',
    'Select the exact programme, verdict, summary, or evidence-node field being challenged.',
  )

  const selectedField = candidate.selectedField
  const nodeField = selectedField ? isEvidenceNodeContributionField(selectedField) : false
  const verdictField = selectedField ? isVerdictContributionField(selectedField) : false
  const targetMatchesType =
    selectedField !== null &&
    (candidate.proposalType === 'VERDICT_CHALLENGE'
      ? verdictField
      : selectedField.startsWith('programme.') || nodeField)
  add(
    'proposal_target_matches_type',
    targetMatchesType,
    'The proposal type matches its target.',
    candidate.proposalType === 'VERDICT_CHALLENGE'
      ? 'A verdict challenge must target a current verdict or 10-second-summary field.'
      : 'A correction must target a programme fact or an evidence-node field.',
  )
  const evidenceNodeRequired = candidate.proposalType === 'VERDICT_CHALLENGE' || nodeField
  add(
    'evidence_node_scope',
    evidenceNodeRequired
      ? candidate.evidenceNodeId !== null && args.evidenceNodeExistsInProgramme
      : candidate.evidenceNodeId === null,
    'The evidence-node target is scoped to this programme.',
    evidenceNodeRequired
      ? 'Select the published evidence-chain node in this programme that the proposal would change.'
      : 'An evidence-node target is only valid for an evidence-node field.',
  )
  add(
    'current_verdict_available',
    candidate.proposalType !== 'VERDICT_CHALLENGE' || args.hasCurrentVerdict,
    'The challenge is pinned to the current public verdict.',
    'This programme has no current published verdict to challenge.',
  )

  const hasProposedContent =
    hasText(candidate.proposedText) ||
    hasStructuredValue(candidate.proposedValue) ||
    candidate.proposedStoppedVerdict !== null
  add(
    'proposed_content_present',
    hasProposedContent,
    'A proposed replacement or verdict value is present.',
    'Provide the proposed correction or challenge value.',
  )
  const valueKind = candidate.selectedField
    ? contributionFieldValueKind(candidate.selectedField)
    : null
  const replacementShapeValid =
    valueKind === 'text'
      ? hasText(candidate.proposedText) &&
        candidate.proposedValue === null &&
        candidate.proposedStoppedVerdict === null
      : valueKind === 'list'
        ? Array.isArray(candidate.proposedValue) &&
          hasStructuredValue(candidate.proposedValue) &&
          !hasText(candidate.proposedText) &&
          candidate.proposedStoppedVerdict === null
        : valueKind === 'enum'
          ? typeof candidate.proposedValue === 'string' &&
            hasStructuredValue(candidate.proposedValue) &&
            candidate.selectedField !== null &&
            isAllowedEnumReplacement(candidate.selectedField, candidate.proposedValue) &&
            !hasText(candidate.proposedText) &&
            candidate.proposedStoppedVerdict === null
          : valueKind === 'stoppedVerdict'
            ? candidate.proposedStoppedVerdict !== null &&
              !hasText(candidate.proposedText) &&
              candidate.proposedValue === null
            : false
  add(
    'proposed_value_shape',
    replacementShapeValid,
    'The replacement uses the canonical representation for the selected field.',
    'Text fields require proposedText; list and enum fields require a non-empty structured proposedValue; the verdict-code field requires only proposedStoppedVerdict.',
  )
  add(
    'source_complete',
    candidate.sourceType !== null &&
      candidate.sourceType !== 'UNKNOWN' &&
      hasText(candidate.sourceIdentifier) &&
      isHttpsOrHttpUrl(candidate.sourceLocator),
    'A typed source identifier and web locator are present.',
    'Provide a non-UNKNOWN source type, source identifier, and http(s) source locator.',
  )
  add(
    'claim_nature_known',
    candidate.claimNature !== null && candidate.claimNature !== 'UNKNOWN',
    'The nature of the proposed claim is identified.',
    'Identify whether the proposal is measured, reported by the study sponsor, found by a regulator, or a human reviewer’s interpretation.',
  )
  add(
    'reasoning_complete',
    hasText(candidate.reasoning) && hasText(candidate.whatWasWrongOrMissing),
    'Reasoning and the missing or incorrect point are documented.',
    'Explain both the reasoning and what is wrong or missing.',
  )
  add(
    'conclusion_scope_declared',
    candidate.affects !== null,
    'The claimed conclusion scope is declared for reviewers.',
    'State whether this concerns what was disproven, what remains open, or both.',
  )
  add(
    'coi_attested',
    candidate.conflictsOfInterestAttested && hasText(candidate.conflictsOfInterest),
    'Conflict-of-interest disclosure is present and attested.',
    'Disclose conflicts (including “None”) and attest that the disclosure is complete.',
  )

  const stopped = args.programmeStatus === 'STOPPED' || args.programmeStatus === 'WITHDRAWN'
  const stoppedVerdictValid =
    candidate.proposedStoppedVerdict === null ||
    (candidate.proposalType === 'VERDICT_CHALLENGE' && stopped)
  add(
    'stopped_verdict_scope',
    stoppedVerdictValid,
    'Any proposed stopped-programme verdict is valid for this programme status.',
    'A stopped-programme verdict may only be proposed in a challenge to a STOPPED or WITHDRAWN programme.',
  )
  const targetsVerdictCode = candidate.selectedField === 'verdict.verdictCode'
  add(
    'stopped_verdict_target',
    !targetsVerdictCode || (stopped && candidate.proposedStoppedVerdict !== null),
    'The stopped-programme verdict target has a status-valid proposed code.',
    'The verdict-code field can only be challenged for a STOPPED or WITHDRAWN programme and requires a proposed code.',
  )
  add(
    'stopped_verdict_value_shape',
    targetsVerdictCode
      ? candidate.proposedStoppedVerdict !== null &&
          !hasText(candidate.proposedText) &&
          candidate.proposedValue === null
      : candidate.proposedStoppedVerdict === null,
    'The stopped-programme verdict is represented by the structured verdict code only.',
    'Use proposedStoppedVerdict only for the verdict-code field; do not combine it with proposed text or another value.',
  )

  checks.push({
    code: 'dependency_graph_coverage',
    status: args.impactPreview.noDependencyMatch ? 'WARN' : 'PASS',
    message: args.impactPreview.noDependencyMatch
      ? 'No matching dependency edge is stored; reviewers must assess graph coverage before any downstream change.'
      : `${args.impactPreview.matchedDependencyCount} persisted dependency edge(s) determine the impact preview.`,
  })

  return {
    version: 'rna-intelligence/contribution-checks-v1',
    passed: checks.every((check) => check.status !== 'FAIL'),
    checks,
  }
}
