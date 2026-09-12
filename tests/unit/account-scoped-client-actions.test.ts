import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { accountScopeKey, isCurrentAccountRequest } from '@/lib/account-request-scope'
import { isCurrentUserRefresh, isSessionMutationInteractionLocked } from '@/components/app-context'

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('shared-browser account boundaries', () => {
  it('accepts only the newest non-aborted account reconciliation response', () => {
    expect(isCurrentUserRefresh({ generation: 4, currentGeneration: 4, aborted: false })).toBe(true)
    expect(isCurrentUserRefresh({ generation: 4, currentGeneration: 5, aborted: false })).toBe(
      false,
    )
    expect(isCurrentUserRefresh({ generation: 4, currentGeneration: 4, aborted: true })).toBe(false)
    expect(isSessionMutationInteractionLocked(false, true)).toBe(true)
    expect(isSessionMutationInteractionLocked(false, false)).toBe(false)

    const appContext = source('components/app-context.tsx')
    expect(appContext).toContain('refreshRequestRef.current.controller?.abort()')
    expect(appContext).toContain('if (!res.ok)')
    expect(appContext).toContain('return undefined')
    expect(appContext).toContain('setStoredCurrentUser(data.user)')
    expect(appContext).toContain('setIsSessionReconciled(false)')
  })

  it('rejects a delayed response after the signed-in account or generation changes', () => {
    const current = {
      accountKey: accountScopeKey('account-a'),
      currentAccountKey: accountScopeKey('account-a'),
      accountGeneration: 4,
      currentAccountGeneration: 4,
      aborted: false,
    }
    expect(isCurrentAccountRequest(current)).toBe(true)
    expect(
      isCurrentAccountRequest({
        ...current,
        currentAccountKey: accountScopeKey('account-b'),
      }),
    ).toBe(false)
    expect(isCurrentAccountRequest({ ...current, currentAccountGeneration: 5 })).toBe(false)
    expect(isCurrentAccountRequest({ ...current, aborted: true })).toBe(false)
  })

  /*
   * Two cases stood here, over `components/CommunityCommentary.tsx` and
   * `components/DossierContributionActions.tsx`. Both were per-medicine review and commentary
   * surfaces on the old medicine layout, and both are deleted: review no longer appears on a
   * reader's page at all, and lives at /review-queue instead.
   *
   * The concern they encoded — that a client surface holding one account's state must not show it
   * to the next account signed in on the same browser — moved with the feature, and is checked
   * below against the panel that now holds that state.
   */
  it('keeps the review queue bound to the account that opened it', () => {
    const panel = source('app/review-queue/ReviewerQualificationPanel.tsx')
    // A response that arrives after the account changed is discarded rather than rendered.
    expect(panel).toContain('isCurrentAccountRequest')
    // And what is already on screen is keyed to the account it was fetched for.
    expect(panel).toContain('dataSnapshot?.accountKey === accountKey')
    expect(panel).toContain('lastResetAccountKeyRef.current !== accountKey')
  })

  it('prevents late modal requests and timers from changing a later account or modal', () => {
    const auth = source('components/AuthModal.tsx')
    expect(auth).toContain('isOpen && (formScopeIsCurrent || reconciliationRequired)')
    expect(auth).toContain("openModalRef.current !== 'auth'")
    expect(auth).toContain('accountIdRef.current !== accountId')
    expect(auth).toContain('requestRef.current.controller?.abort()')
    expect(auth).toContain('router.refresh()')
    expect(auth).toContain('interactionLocked || requestRef.current.controller !== null')
    expect(auth).toContain('const reconciledUser = await refreshUser()')
    expect(auth).toContain('inert={isSubmitting ? true : undefined}')
    expect(auth).toContain('closeDisabled={interactionLocked}')
    expect(auth).toContain('setReconciliationRequired(true)')
    expect(auth).toContain('Account actions stay locked until the check succeeds')

    const feedback = source('components/FeedbackModal.tsx')
    expect(feedback).toContain("openModalRef.current !== 'feedback'")
    expect(feedback).toContain('modalGenerationRef.current !== modalGeneration')
    expect(feedback).toContain('requestControllerRef.current?.abort()')
    expect(feedback).toContain('closeDisabled={isSending}')

    const account = source('components/AccountModal.tsx')
    expect(account).toContain('scopeGenerationRef.current !== scopeGeneration')
    expect(account).toContain('userIdRef.current !== userId')
    expect(account).toContain("openModalRef.current !== 'account'")
    expect(account).toContain('signOutControllerRef.current?.abort()')
    expect(account).toContain('router.refresh()')
    expect(account).toContain('interactionLocked || signOutControllerRef.current !== null')
    expect(account).toContain('const reconciledUser = await refreshUser()')
    expect(account).toContain('inert={isSigningOut ? true : undefined}')
    expect(account).toContain('closeDisabled={interactionLocked}')
    expect(account).toContain('setSessionReconciliationRequired(reconciledUser === undefined)')
    expect(account).toContain('Account actions stay locked until the check succeeds')
  })

  it('masks reviewer-qualification details and outcomes at the account boundary', () => {
    const qualifications = source('app/review-queue/ReviewerQualificationPanel.tsx')
    expect(qualifications).toContain('privateStateAccountKey === accountKey')
    expect(qualifications).toContain('internalReviewCapabilityScopeKey(currentUser)')
    expect(qualifications).toContain('!accountId || !canManage')
    expect(qualifications).toContain('const visibleNotice = privateScopeIsCurrent ? notice : null')
    expect(qualifications).toContain('const visibleError = privateScopeIsCurrent ? error : null')
    expect(qualifications).toContain('currentAccountKey: accountKeyRef.current')
    expect(qualifications).toContain('aborted: controller.signal.aborted')
    expect(qualifications).toContain('lastResetAccountKeyRef.current !== accountKey')
  })

  it('masks canonical source-resolution details and workflow notices by account', () => {
    const canonical = source('app/review-queue/CanonicalPublicationPanel.tsx')
    expect(canonical).toContain('sourceResolutionSnapshot?.accountId === accountId')
    expect(canonical).toContain('privateStateAccountId === accountId')
    expect(canonical).toContain('const visibleNotice = privateScopeIsCurrent ? notice : null')
    expect(canonical).toContain(
      'setSourceResolutionSnapshot({ accountId, value: result.implementation })',
    )
  })

  it('states the profile review path without overclaiming', () => {
    const profile = source('app/u/[handle]/page.tsx')
    const normalizedProfile = profile.replace(/\s+/g, ' ')
    expect(normalizedProfile).toContain('agreement resolves it, while disagreement')
    expect(normalizedProfile).toContain('Acceptance still does not publish the medical conclusion')
  })
})
