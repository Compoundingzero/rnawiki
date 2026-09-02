import { describe, expect, it } from 'vitest'

import {
  assessmentDigestIsCurrent,
  ATTRIBUTION_WARNING_LABELS,
  canRecordCompletionReviewDecision,
  canViewCompletionReview,
  COMPLETION_REVIEW_DECISION_LABELS,
  COMPLETION_REVIEW_DECISION_MEANINGS,
  COMPLETION_REVIEW_DECISIONS,
  COMPLETION_REVIEW_EXPLANATION_MAX_LENGTH,
  COMPLETION_REVIEW_QUEUE_DEFAULT_LIMIT,
  COMPLETION_REVIEW_QUEUE_DESCRIPTIONS,
  COMPLETION_REVIEW_QUEUE_KINDS,
  COMPLETION_REVIEW_QUEUE_LABELS,
  COMPLETION_REVIEW_QUEUE_MAX_LIMIT,
  completionReviewDecisionSchema,
  completionReviewQueueQuerySchema,
  entityClassLabel,
  ENTITY_CLASS_LABELS,
  INVENTORY_RESOLUTION_LABELS,
  inventoryResolutionLabel,
  isCompletionReviewDecision,
  isCompletionReviewQueueKind,
  isDossierSectionId,
} from '@/lib/completion-review-policy'
import { DOSSIER_SECTION_IDS } from '@/lib/dossier-completion/types'
import { ENTITY_CLASSES } from '@/lib/inventory/entity-class-types'
import { ATTRIBUTION_WARNING_CODES, INVENTORY_RESOLUTION_STATES } from '@/lib/inventory/types'

const DIGEST_A = 'a'.repeat(64)
const DIGEST_B = 'b'.repeat(64)

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    drugId: 'drg_completion_review',
    sectionId: 'literature-search',
    decision: 'SOURCE_READ_NO_CHANGE',
    explanation: 'Read the two indexed reports named in the basis; neither adds a trial arm.',
    assessmentInputDigest: DIGEST_A,
    ...overrides,
  }
}

describe('who may work the completion and identity queue', () => {
  it.each([
    ['new contributor', { trustTier: 'new' as const, isAdmin: false }, false],
    ['contributor', { trustTier: 'contributor' as const, isAdmin: false }, false],
    ['trusted editor', { trustTier: 'trusted' as const, isAdmin: false }, false],
    ['steward', { trustTier: 'steward' as const, isAdmin: false }, true],
    ['administrator', { trustTier: 'new' as const, isAdmin: true }, true],
  ])('reading the queue as %s', (_label, actor, expected) => {
    expect(canViewCompletionReview(actor)).toBe(expected)
  })

  it('grants no extra privilege for recording a decision beyond reading the queue', () => {
    for (const actor of [
      { trustTier: 'new' as const, isAdmin: false },
      { trustTier: 'contributor' as const, isAdmin: false },
      { trustTier: 'trusted' as const, isAdmin: false },
      { trustTier: 'steward' as const, isAdmin: false },
      { trustTier: 'new' as const, isAdmin: true },
    ]) {
      expect(canRecordCompletionReviewDecision(actor)).toBe(canViewCompletionReview(actor))
    }
  })

  it('treats an actor with no recorded role as unqualified', () => {
    expect(canViewCompletionReview({})).toBe(false)
    expect(canRecordCompletionReviewDecision({})).toBe(false)
  })
})

describe('decision payload validation', () => {
  it('accepts a complete decision and trims the explanation', () => {
    const parsed = completionReviewDecisionSchema.parse(
      validPayload({ explanation: '  Read the label section named in the basis.  ' }),
    )
    expect(parsed.explanation).toBe('Read the label section named in the basis.')
    expect(parsed.sectionId).toBe('literature-search')
    expect(parsed.assessmentInputDigest).toBe(DIGEST_A)
  })

  it('accepts every section id in the completion contract', () => {
    for (const sectionId of DOSSIER_SECTION_IDS) {
      expect(completionReviewDecisionSchema.parse(validPayload({ sectionId })).sectionId).toBe(
        sectionId,
      )
    }
  })

  it('accepts every recorded outcome and nothing else', () => {
    for (const decision of COMPLETION_REVIEW_DECISIONS) {
      expect(completionReviewDecisionSchema.parse(validPayload({ decision })).decision).toBe(
        decision,
      )
    }
    expect(
      completionReviewDecisionSchema.safeParse(validPayload({ decision: 'APPROVED' })).success,
    ).toBe(false)
  })

  it('refuses a section that is not part of the completion contract', () => {
    expect(
      completionReviewDecisionSchema.safeParse(validPayload({ sectionId: 'dose-advice' })).success,
    ).toBe(false)
  })

  it('refuses an empty or whitespace-only explanation', () => {
    expect(
      completionReviewDecisionSchema.safeParse(validPayload({ explanation: '' })).success,
    ).toBe(false)
    expect(
      completionReviewDecisionSchema.safeParse(validPayload({ explanation: '   \n  ' })).success,
    ).toBe(false)
  })

  it('refuses an explanation longer than the recorded maximum', () => {
    const atLimit = 'x'.repeat(COMPLETION_REVIEW_EXPLANATION_MAX_LENGTH)
    expect(
      completionReviewDecisionSchema.safeParse(validPayload({ explanation: atLimit })).success,
    ).toBe(true)
    expect(
      completionReviewDecisionSchema.safeParse(validPayload({ explanation: `${atLimit}x` }))
        .success,
    ).toBe(false)
  })

  it.each([
    ['too short', 'a'.repeat(63)],
    ['too long', 'a'.repeat(65)],
    ['upper case hex', 'A'.repeat(64)],
    ['not hexadecimal', 'z'.repeat(64)],
    ['empty', ''],
  ])('refuses an assessment digest that is %s', (_label, assessmentInputDigest) => {
    expect(
      completionReviewDecisionSchema.safeParse(validPayload({ assessmentInputDigest })).success,
    ).toBe(false)
  })

  it('refuses an unknown field rather than ignoring it', () => {
    expect(
      completionReviewDecisionSchema.safeParse(validPayload({ reviewerUserId: 'usr_forged' }))
        .success,
    ).toBe(false)
  })

  it('refuses a missing record id', () => {
    expect(completionReviewDecisionSchema.safeParse(validPayload({ drugId: '' })).success).toBe(
      false,
    )
  })
})

describe('the assessment a decision answers', () => {
  it('accepts only the digest currently stored for the record', () => {
    expect(assessmentDigestIsCurrent(DIGEST_A, DIGEST_A)).toBe(true)
    expect(assessmentDigestIsCurrent(DIGEST_A, DIGEST_B)).toBe(false)
  })

  it('refuses when the record has no stored assessment', () => {
    expect(assessmentDigestIsCurrent(DIGEST_A, null)).toBe(false)
    expect(assessmentDigestIsCurrent(DIGEST_A, undefined)).toBe(false)
    expect(assessmentDigestIsCurrent(DIGEST_A, '')).toBe(false)
  })
})

describe('queue query validation', () => {
  it('defaults to the open-section queue and the default page size', () => {
    const parsed = completionReviewQueueQuerySchema.parse({})
    expect(parsed).toEqual({
      kind: 'incomplete',
      limit: COMPLETION_REVIEW_QUEUE_DEFAULT_LIMIT,
      offset: 0,
    })
  })

  it('reads each queue kind from a string', () => {
    for (const kind of COMPLETION_REVIEW_QUEUE_KINDS) {
      expect(completionReviewQueueQuerySchema.parse({ kind }).kind).toBe(kind)
    }
    expect(completionReviewQueueQuerySchema.safeParse({ kind: 'everything' }).success).toBe(false)
  })

  it('bounds the page size and refuses a negative offset', () => {
    expect(
      completionReviewQueueQuerySchema.parse({ limit: String(COMPLETION_REVIEW_QUEUE_MAX_LIMIT) })
        .limit,
    ).toBe(COMPLETION_REVIEW_QUEUE_MAX_LIMIT)
    expect(
      completionReviewQueueQuerySchema.safeParse({
        limit: String(COMPLETION_REVIEW_QUEUE_MAX_LIMIT + 1),
      }).success,
    ).toBe(false)
    expect(completionReviewQueueQuerySchema.safeParse({ offset: '-1' }).success).toBe(false)
    expect(completionReviewQueueQuerySchema.parse({ offset: '40' }).offset).toBe(40)
  })
})

describe('reader-facing labels', () => {
  it('labels every entity class, resolution state and attribution warning code', () => {
    expect(Object.keys(ENTITY_CLASS_LABELS).sort()).toEqual([...ENTITY_CLASSES].sort())
    expect(Object.keys(INVENTORY_RESOLUTION_LABELS).sort()).toEqual(
      [...INVENTORY_RESOLUTION_STATES].sort(),
    )
    expect(Object.keys(ATTRIBUTION_WARNING_LABELS).sort()).toEqual(
      [...ATTRIBUTION_WARNING_CODES].sort(),
    )
  })

  it('labels every outcome and states what each one claims', () => {
    expect(Object.keys(COMPLETION_REVIEW_DECISION_LABELS).sort()).toEqual(
      [...COMPLETION_REVIEW_DECISIONS].sort(),
    )
    expect(Object.keys(COMPLETION_REVIEW_DECISION_MEANINGS).sort()).toEqual(
      [...COMPLETION_REVIEW_DECISIONS].sort(),
    )
    for (const decision of COMPLETION_REVIEW_DECISIONS) {
      expect(COMPLETION_REVIEW_DECISION_MEANINGS[decision].length).toBeGreaterThan(20)
    }
  })

  it('labels and describes every queue kind', () => {
    expect(Object.keys(COMPLETION_REVIEW_QUEUE_LABELS).sort()).toEqual(
      [...COMPLETION_REVIEW_QUEUE_KINDS].sort(),
    )
    expect(Object.keys(COMPLETION_REVIEW_QUEUE_DESCRIPTIONS).sort()).toEqual(
      [...COMPLETION_REVIEW_QUEUE_KINDS].sort(),
    )
  })

  it('never shows a raw stored code when a value is missing or unknown', () => {
    expect(entityClassLabel(null)).toBe('Not yet classified')
    expect(entityClassLabel('SOMETHING_NEW')).toBe('Not yet classified')
    expect(inventoryResolutionLabel(null)).toBe('Not yet resolved')
    expect(inventoryResolutionLabel('SOMETHING_NEW')).toBe('Not yet resolved')
  })
})

describe('closed-list guards', () => {
  it('recognises exactly the recorded values', () => {
    expect(isDossierSectionId('identity')).toBe(true)
    expect(isDossierSectionId('identity-check')).toBe(false)
    expect(isCompletionReviewDecision('IDENTITY_DISPUTED')).toBe(true)
    expect(isCompletionReviewDecision('REJECTED')).toBe(false)
    expect(isCompletionReviewQueueKind('human-read')).toBe(true)
    expect(isCompletionReviewQueueKind('humanread')).toBe(false)
  })
})
