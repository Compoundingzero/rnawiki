import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  DECLINE_REASON_MAX_LENGTH,
  DECLINE_REASON_MIN_LENGTH,
  canReviewLegacyIdentityCorrection,
  declineReasonValidationError,
} from '@/lib/legacy-revision-review'

describe('legacy identity-correction decline reason', () => {
  it('removes legacy review controls immediately when the same account is demoted', () => {
    expect(canReviewLegacyIdentityCorrection({ isAdmin: false, trustTier: 'trusted' })).toBe(true)
    expect(canReviewLegacyIdentityCorrection({ isAdmin: false, trustTier: 'contributor' })).toBe(
      false,
    )
    expect(canReviewLegacyIdentityCorrection({ isAdmin: true, trustTier: 'contributor' })).toBe(
      true,
    )
  })

  it('uses the API bounds for local review validation', () => {
    expect(DECLINE_REASON_MIN_LENGTH).toBe(4)
    expect(DECLINE_REASON_MAX_LENGTH).toBe(2_000)
    expect(declineReasonValidationError(' okay ')).toBeNull()
    expect(declineReasonValidationError('bad')).toBe(
      'Explain what is wrong so the contributor knows what to fix.',
    )
    expect(declineReasonValidationError('x'.repeat(2_001))).toBe(
      'Keep the reason to 2,000 characters or fewer.',
    )
  })

  it('exposes matching native textarea bounds and runs the shared validator before the request', () => {
    const source = readFileSync(join(process.cwd(), 'app/review-queue/ReviewActions.tsx'), 'utf8')
    expect(source).toContain('minLength={DECLINE_REASON_MIN_LENGTH}')
    expect(source).toContain('maxLength={DECLINE_REASON_MAX_LENGTH}')
    expect(source).toContain('const validationError = declineReasonValidationError(reason)')
    expect(source.indexOf('declineReasonValidationError(reason)')).toBeLessThan(
      source.indexOf("api.reviewRevision(revisionId, 'reject', reason,"),
    )
  })
})
