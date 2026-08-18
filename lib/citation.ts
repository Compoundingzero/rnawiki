import { entityUrl } from './canonical'

export interface CitableClaim {
  directAnswer: string
  entitySlug: string
  claimSlug: string
  lastReviewedAt: Date | null
}

/**
 * "Copy with source" text (spec section 15). The caveat lives inside directAnswer already —
 * this function must never split the claim from its qualifier, only append attribution.
 */
export function formatCitation(claim: CitableClaim): string {
  const date = claim.lastReviewedAt
    ? claim.lastReviewedAt.toISOString().slice(0, 10)
    : 'pending review'
  const url = `${entityUrl(claim.entitySlug)}#claim-${claim.claimSlug}`
  return `${claim.directAnswer} RNAwiki, reviewed ${date}: ${url}`
}
