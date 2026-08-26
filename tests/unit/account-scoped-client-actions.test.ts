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

  it('reloads note votes for the new account and masks the old state immediately', () => {
    const commentary = source('components/CommunityCommentary.tsx')
    expect(commentary).toContain('notesAccountKey === accountKey')
    expect(commentary).toContain('communityNotes(medicineSlug, controller.signal)')
    expect(commentary).toContain("setContent('')")
    expect(commentary).toContain('for (const controller of mutationControllersRef.current)')
    expect(commentary).toContain('isCurrentAccountRequest({')
  })

  it('keeps private contribution authoring and review forms bound to their account', () => {
    const authoring = source('components/DossierContributionActions.tsx')
    expect(authoring).toContain('workspaceAccountKey === accountKey')
    expect(authoring).toContain('actionRequestRef.current.controller?.abort()')
    expect(authoring).toContain('currentAccountKey: accountKeyRef.current')
    expect(authoring).toContain('setCorrection(blankCorrection(')
    expect(authoring).toContain('setChallenge(blankChallenge())')

    const review = source('app/review-queue/ContributionReviewPanel.tsx')
    expect(review).toContain('privateStateAccountId === accountId')
    expect(review).toContain('writeRequestRef.current.controller?.abort()')
    expect(review).toContain('accountRef.current !== accountId')

    const identityReview = source('app/review-queue/ReviewActions.tsx')
    expect(identityReview).toContain('viewerAccountId === accountId')
    expect(identityReview).toContain('canReviewLegacyIdentityCorrection(currentUser)')
    expect(identityReview).toContain('canReviewRef.current')
    expect(identityReview).toContain('Reload review controls')
    expect(identityReview).toContain('requestRef.current.controller?.abort()')
    expect(identityReview).toContain("setNote('')")

    const identityAuthoring = source('components/LegacyIdentityCorrectionActions.tsx')
    expect(identityAuthoring).toContain('privateStateAccountId === accountId')
    expect(identityAuthoring).toContain('requestControllerRef.current?.abort()')
    expect(identityAuthoring).toContain('accountIdRef.current !== accountId')
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
