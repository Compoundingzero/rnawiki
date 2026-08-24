import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  canManageInternalReviews,
  internalReviewCapabilityScopeKey,
  isCurrentInternalReviewRequest,
} from '@/lib/internal-review-request-scope'

const physicianPanel = readFileSync(
  join(process.cwd(), 'app/review-queue/PhysicianVerificationReviewPanel.tsx'),
  'utf8',
)
const feedbackPanel = readFileSync(
  join(process.cwd(), 'app/review-queue/FeedbackReviewPanel.tsx'),
  'utf8',
)

describe('private internal-review browser request scopes', () => {
  it('changes scope and removes capability when the same account loses its steward role', () => {
    const steward = { id: 'same-account', isAdmin: false, trustTier: 'steward' as const }
    const demoted = { id: 'same-account', isAdmin: false, trustTier: 'trusted' as const }
    const regranted = { id: 'same-account', isAdmin: true, trustTier: 'trusted' as const }

    expect(canManageInternalReviews(steward)).toBe(true)
    expect(canManageInternalReviews(demoted)).toBe(false)
    expect(internalReviewCapabilityScopeKey(steward)).not.toBe(
      internalReviewCapabilityScopeKey(demoted),
    )
    expect(canManageInternalReviews(regranted)).toBe(true)
    expect(internalReviewCapabilityScopeKey(regranted)).toBe(
      internalReviewCapabilityScopeKey(steward),
    )
  })

  it('rejects physician detail A after B was selected and a physician POST after account switch', () => {
    expect(
      isCurrentInternalReviewRequest({
        accountId: 'steward-a',
        currentAccountId: 'steward-a',
        requestId: 'physician-a',
        currentRequestId: 'physician-b',
        requestGeneration: 3,
        currentRequestGeneration: 4,
        scopeGeneration: 8,
        currentScopeGeneration: 8,
      }),
    ).toBe(false)
    expect(
      isCurrentInternalReviewRequest({
        accountId: 'steward-a',
        currentAccountId: 'steward-b',
        requestId: 'physician-a',
        currentRequestId: 'physician-a',
        requestGeneration: 5,
        currentRequestGeneration: 5,
        scopeGeneration: 8,
        currentScopeGeneration: 9,
      }),
    ).toBe(false)
    expect(physicianPanel).toContain('result.request.id === id')
    expect(physicianPanel).toContain('detailRequestRef.current.controller?.abort()')
    expect(physicianPanel).toContain('actionRequestRef.current.controller?.abort()')
  })

  it('rejects a delayed feedback resolution after either the report or account changes', () => {
    const current = {
      accountId: 'steward-a',
      currentAccountId: 'steward-a',
      requestId: 'feedback-a',
      currentRequestId: 'feedback-a',
      requestGeneration: 6,
      currentRequestGeneration: 6,
      scopeGeneration: 4,
      currentScopeGeneration: 4,
    }
    expect(isCurrentInternalReviewRequest(current)).toBe(true)
    expect(isCurrentInternalReviewRequest({ ...current, currentRequestId: 'feedback-b' })).toBe(
      false,
    )
    expect(
      isCurrentInternalReviewRequest({
        ...current,
        currentAccountId: 'steward-b',
        currentScopeGeneration: 5,
      }),
    ).toBe(false)
    expect(feedbackPanel).toContain('actionRequestRef.current.controller?.abort()')
    expect(feedbackPanel).toContain('signal: controller.signal')
  })

  it('clears and masks private state on account change or same-account role revocation', () => {
    for (const fragment of [
      'setItems([])',
      'setSelectedId(null)',
      "setReason('')",
      'setDetail(null)',
      'setIsLoadingDetail(false)',
      'setIsSaving(false)',
      'setError(null)',
      'setNotice(null)',
      'setStateCapabilityScopeKey(capabilityScopeKey)',
      'stateCapabilityScopeKey === capabilityScopeKey',
      'capabilityScopeRef.current === capabilityScopeKey',
      '}, [canManage, capabilityScopeKey])',
    ]) {
      expect(physicianPanel).toContain(fragment)
    }
    for (const fragment of [
      'setItems([])',
      'setSelectedId(null)',
      "setNote('')",
      'setIsSaving(false)',
      'setError(null)',
      'setNotice(null)',
      'setStateCapabilityScopeKey(capabilityScopeKey)',
      'stateCapabilityScopeKey === capabilityScopeKey',
      'capabilityScopeRef.current === capabilityScopeKey',
      '}, [canManage, capabilityScopeKey])',
    ]) {
      expect(feedbackPanel).toContain(fragment)
    }
  })
})
