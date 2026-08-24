import { describe, expect, it } from 'vitest'

import { ADMIN_BOOTSTRAP_USAGE, parseAdminBootstrapArgs } from '@/lib/admin-bootstrap-cli'
import {
  canManageInternalReview,
  INTERNAL_REVIEW_ROLE_EXPLANATION,
} from '@/lib/internal-review-policy'
import {
  feedbackResolutionSchema,
  physicianVerificationDecisionSchema,
} from '@/lib/internal-review-validation'

describe('private operational review policy', () => {
  it('uses the same steward-or-administrator boundary for every private queue', () => {
    expect(canManageInternalReview({ isAdmin: true, trustTier: 'new' })).toBe(true)
    expect(canManageInternalReview({ isAdmin: false, trustTier: 'steward' })).toBe(true)
    expect(canManageInternalReview({ isAdmin: false, trustTier: 'trusted' })).toBe(false)
    expect(canManageInternalReview({})).toBe(false)
    expect(INTERNAL_REVIEW_ROLE_EXPLANATION).toContain('steward or administrator')
  })

  it('requires explicit matching bootstrap emails and a bounded reason', () => {
    expect(
      parseAdminBootstrapArgs([
        '--email',
        'owner@example.org',
        '--confirm-email',
        'OWNER@example.org',
        '--reason',
        'Initial production administrator',
      ]),
    ).toEqual({
      email: 'owner@example.org',
      confirmationEmail: 'OWNER@example.org',
      reason: 'Initial production administrator',
    })
    expect(() =>
      parseAdminBootstrapArgs([
        '--email',
        'one@example.org',
        '--confirm-email',
        'two@example.org',
        '--reason',
        'Initial administrator',
      ]),
    ).toThrow(/confirmation email/i)
    expect(() => parseAdminBootstrapArgs(['--is-admin', 'true'])).toThrow(ADMIN_BOOTSTRAP_USAGE)
  })

  it('accepts only explicit decisions and explanatory reasons', () => {
    expect(
      physicianVerificationDecisionSchema.parse({
        decision: 'APPROVE',
        reason: 'Licence confirmed in the issuing registry.',
      }),
    ).toEqual({
      decision: 'APPROVE',
      reason: 'Licence confirmed in the issuing registry.',
    })
    expect(() =>
      physicianVerificationDecisionSchema.parse({ decision: 'MAYBE', reason: 'Long enough.' }),
    ).toThrow()
    expect(() => feedbackResolutionSchema.parse({ note: 'short' })).toThrow()
    expect(() =>
      feedbackResolutionSchema.parse({
        note: 'Checked the source and corrected the record.',
        extra: true,
      }),
    ).toThrow()
  })
})
