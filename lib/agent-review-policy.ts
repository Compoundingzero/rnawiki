import type { TrustTier } from '@/lib/types'

export const AGENT_REVIEW_DECISIONS = [
  'CORRECTION_NEEDED',
  'NOT_A_PROBLEM',
  'CONFIRMED_AS_RECORDED',
  'NEEDS_MORE_EVIDENCE',
] as const

export type AgentReviewDecision = (typeof AGENT_REVIEW_DECISIONS)[number]

export const AGENT_REVIEW_DECISION_LABELS: Record<AgentReviewDecision, string> = {
  CORRECTION_NEEDED: 'Correction needed',
  NOT_A_PROBLEM: 'Not a problem',
  CONFIRMED_AS_RECORDED: 'Confirmed as recorded',
  NEEDS_MORE_EVIDENCE: 'Needs more evidence',
}

export const AGENT_REVIEW_DECISION_EXPLANATIONS: Record<AgentReviewDecision, string> = {
  CORRECTION_NEEDED: 'The stored record does not match its source or schema.',
  NOT_A_PROBLEM: 'The detector raised this, but it is not a defect.',
  CONFIRMED_AS_RECORDED: 'The value is unusual, but the source really prints it.',
  NEEDS_MORE_EVIDENCE: 'The current material is insufficient to decide.',
}

export const AGENT_REVIEW_SEVERITIES = ['low', 'medium', 'high', 'blocking'] as const
export type AgentReviewSeverity = (typeof AGENT_REVIEW_SEVERITIES)[number]

export const AGENT_REVIEW_LANES = ['ordinary', 'biotech', 'chemist', 'quantitative'] as const
export type AgentReviewLane = (typeof AGENT_REVIEW_LANES)[number]

export const AGENT_REVIEW_STATES = ['unreviewed', 'decided', 'evidence_changed'] as const
export type AgentReviewStateFilter = (typeof AGENT_REVIEW_STATES)[number]

export const AGENT_REVIEW_OCCURRENCE_STATES = ['new', 'reopened', 'unchanged'] as const
export type AgentReviewOccurrenceState = (typeof AGENT_REVIEW_OCCURRENCE_STATES)[number]
export type AgentReviewOccurrenceStateFilter = AgentReviewOccurrenceState

export const AGENT_REVIEW_EXPLANATION_MAX_LENGTH = 4000

/**
 * Reporting/activation floor only. B1 does not fit or apply a calibration model. A future
 * deterministic fitter may be considered only within this exact stratum after all three floors
 * are met and a separately reviewed time-split evaluation exists.
 */
export const AGENT_REVIEW_CALIBRATION_MINIMUM_DATA = {
  stratum: ['agent', 'agentVersion', 'reasonSchemaVersion', 'reason', 'provenanceTier'],
  realDecisionEvents: 30,
  representedOutcomeClasses: 2,
  eventsPerRepresentedOutcomeClass: 5,
} as const

export const AGENT_REVIEW_CALIBRATION_INACTIVE_MESSAGE =
  'Not enough review history to calibrate this reason.'

export interface AgentReviewActor {
  id?: string
  isAdmin?: boolean
  trustTier?: TrustTier
}

export function canReviewAgentEvidence(actor: AgentReviewActor): boolean {
  return actor.isAdmin === true || actor.trustTier === 'steward'
}

export function agentReviewCapabilityScopeKey(actor: AgentReviewActor | null): string {
  return `${actor?.id ?? 'signed-out'}:${actor && canReviewAgentEvidence(actor) ? 'authorized' : 'denied'}`
}

export function isCurrentAgentReviewRequest(input: {
  accountId: string | null
  currentAccountId: string | null
  occurrenceKey: string
  currentOccurrenceKey: string | null
  requestGeneration: number
  currentRequestGeneration: number
  scopeGeneration: number
  currentScopeGeneration: number
  aborted?: boolean
}): boolean {
  return (
    !input.aborted &&
    input.accountId !== null &&
    input.accountId === input.currentAccountId &&
    input.occurrenceKey === input.currentOccurrenceKey &&
    input.requestGeneration === input.currentRequestGeneration &&
    input.scopeGeneration === input.currentScopeGeneration
  )
}

export const AGENT_REVIEW_ROLE_EXPLANATION =
  'Only a steward or administrator may view or decide agent evidence review work.'
