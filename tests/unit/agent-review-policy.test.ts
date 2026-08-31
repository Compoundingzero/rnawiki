import { describe, expect, it } from 'vitest'

import {
  AGENT_REVIEW_DECISIONS,
  AGENT_REVIEW_DECISION_EXPLANATIONS,
  AGENT_REVIEW_CALIBRATION_INACTIVE_MESSAGE,
  AGENT_REVIEW_CALIBRATION_MINIMUM_DATA,
  AGENT_REVIEW_EXPLANATION_MAX_LENGTH,
  AGENT_REVIEW_OCCURRENCE_STATES,
  AGENT_REVIEW_ROLE_EXPLANATION,
  agentReviewCapabilityScopeKey,
  canReviewAgentEvidence,
  isCurrentAgentReviewRequest,
} from '@/lib/agent-review-policy'

describe('agent evidence review policy', () => {
  it('admits only current stewards and administrators', () => {
    expect(canReviewAgentEvidence({ trustTier: 'steward' })).toBe(true)
    expect(canReviewAgentEvidence({ isAdmin: true, trustTier: 'new' })).toBe(true)
    expect(canReviewAgentEvidence({ trustTier: 'trusted' })).toBe(false)
    expect(canReviewAgentEvidence({ trustTier: 'contributor' })).toBe(false)
    expect(canReviewAgentEvidence({})).toBe(false)
    expect(AGENT_REVIEW_ROLE_EXPLANATION).toContain('steward or administrator')
  })

  it('exposes exactly the four append-only review outcomes', () => {
    expect(AGENT_REVIEW_DECISIONS).toEqual([
      'CORRECTION_NEEDED',
      'NOT_A_PROBLEM',
      'CONFIRMED_AS_RECORDED',
      'NEEDS_MORE_EVIDENCE',
    ])
    expect(AGENT_REVIEW_EXPLANATION_MAX_LENGTH).toBe(4000)
    expect(AGENT_REVIEW_DECISION_EXPLANATIONS).toEqual({
      CORRECTION_NEEDED: 'The stored record does not match its source or schema.',
      NOT_A_PROBLEM: 'The detector raised this, but it is not a defect.',
      CONFIRMED_AS_RECORDED: 'The value is unusual, but the source really prints it.',
      NEEDS_MORE_EVIDENCE: 'The current material is insufficient to decide.',
    })
  })

  it('keeps calibration inactive behind the declared minimum-data and evaluation gates', () => {
    expect(AGENT_REVIEW_CALIBRATION_MINIMUM_DATA).toEqual({
      stratum: ['agent', 'agentVersion', 'reasonSchemaVersion', 'reason', 'provenanceTier'],
      realDecisionEvents: 30,
      representedOutcomeClasses: 2,
      eventsPerRepresentedOutcomeClass: 5,
    })
    expect(AGENT_REVIEW_CALIBRATION_INACTIVE_MESSAGE).toBe(
      'Not enough review history to calibrate this reason.',
    )
  })

  it('defines current occurrence state independently from candidate history', () => {
    expect(AGENT_REVIEW_OCCURRENCE_STATES).toEqual(['new', 'reopened', 'unchanged'])
  })

  it('scopes delayed private responses to the exact reviewer account and occurrence', () => {
    expect(agentReviewCapabilityScopeKey({ id: 'steward-a', trustTier: 'steward' })).not.toBe(
      agentReviewCapabilityScopeKey({ id: 'steward-b', trustTier: 'steward' }),
    )
    const current = {
      accountId: 'steward-a',
      currentAccountId: 'steward-a',
      occurrenceKey: 'a'.repeat(64),
      currentOccurrenceKey: 'a'.repeat(64),
      requestGeneration: 2,
      currentRequestGeneration: 2,
      scopeGeneration: 3,
      currentScopeGeneration: 3,
    }
    expect(isCurrentAgentReviewRequest(current)).toBe(true)
    expect(isCurrentAgentReviewRequest({ ...current, currentAccountId: 'steward-b' })).toBe(false)
    expect(isCurrentAgentReviewRequest({ ...current, currentOccurrenceKey: 'b'.repeat(64) })).toBe(
      false,
    )
    expect(isCurrentAgentReviewRequest({ ...current, aborted: true })).toBe(false)
  })
})
