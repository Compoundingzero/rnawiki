import type { CommentUser } from '@/lib/types'
import { canManageInternalReview } from '@/lib/internal-review-policy'

export function canManageInternalReviews(
  user: Pick<CommentUser, 'id' | 'isAdmin' | 'trustTier'> | null,
): boolean {
  return Boolean(user && canManageInternalReview(user))
}

export function internalReviewCapabilityScopeKey(
  user: Pick<CommentUser, 'id' | 'isAdmin' | 'trustTier'> | null,
): string {
  return `${user?.id ?? 'signed-out'}:${canManageInternalReviews(user) ? 'authorized' : 'denied'}`
}

/**
 * A private operational response is usable only inside the exact account, record, component
 * scope, and request generation that started it. This prevents a delayed browser response from
 * one signed-in account or selected record from populating another account's screen.
 */
export function isCurrentInternalReviewRequest(input: {
  accountId: string | null
  currentAccountId: string | null
  requestId: string
  currentRequestId: string | null
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
    input.requestId === input.currentRequestId &&
    input.requestGeneration === input.currentRequestGeneration &&
    input.scopeGeneration === input.currentScopeGeneration
  )
}
