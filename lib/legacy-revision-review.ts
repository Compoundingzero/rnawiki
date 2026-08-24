import type { CommentUser } from '@/lib/types'

export const DECLINE_REASON_MIN_LENGTH = 4
export const DECLINE_REASON_MAX_LENGTH = 2_000

export function canReviewLegacyIdentityCorrection(
  user: Pick<CommentUser, 'isAdmin' | 'trustTier'> | null,
): boolean {
  return Boolean(
    user && (user.isAdmin || user.trustTier === 'trusted' || user.trustTier === 'steward'),
  )
}

export function declineReasonValidationError(value: string): string | null {
  const reason = value.trim()
  if (reason.length < DECLINE_REASON_MIN_LENGTH) {
    return 'Explain what is wrong so the contributor knows what to fix.'
  }
  if (reason.length > DECLINE_REASON_MAX_LENGTH) {
    return 'Keep the reason to 2,000 characters or fewer.'
  }
  return null
}
