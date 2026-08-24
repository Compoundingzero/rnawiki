import type { TrustTier } from '@/lib/types'

/**
 * Physician credentials and reader feedback contain private operational data. They share one
 * deliberately narrow role boundary so a route, query and screen cannot quietly disagree about
 * who may see or decide them.
 */
export interface InternalReviewActor {
  isAdmin?: boolean
  trustTier?: TrustTier
}

export function canManageInternalReview(actor: InternalReviewActor): boolean {
  return actor.isAdmin || actor.trustTier === 'steward'
}

export const INTERNAL_REVIEW_ROLE_EXPLANATION =
  'Only a steward or administrator may view or decide private review work.'
