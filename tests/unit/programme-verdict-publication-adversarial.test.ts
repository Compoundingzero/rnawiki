import { describe, expect, it } from 'vitest'
import {
  ProgrammeVerdictPublicationError,
  programmeVerdictReviewConsensus,
} from '@/lib/queries/programme-verdict-publication'

describe('programme verdict publication adversarial review quorum', () => {
  it('rejects two name-only approval aliases as independent reviewer identities', () => {
    const reviewedAt = new Date('2026-08-22T01:00:00.000Z')

    expect(() =>
      programmeVerdictReviewConsensus(
        [
          {
            id: 'anonymous-review-a',
            reviewerUserId: null,
            reviewerName: 'Reviewer Alias A',
            decision: 'APPROVE',
            isIndependent: true,
            reviewedAt,
          },
          {
            id: 'anonymous-review-b',
            reviewerUserId: null,
            reviewerName: 'Reviewer Alias B',
            decision: 'APPROVE',
            isIndependent: true,
            reviewedAt,
          },
        ] as never,
        null,
      ),
    ).toThrowError(ProgrammeVerdictPublicationError)
  })

  it('does not let a name-only alias evade author exclusion', () => {
    const reviewedAt = new Date('2026-08-22T01:00:00.000Z')

    expect(() =>
      programmeVerdictReviewConsensus(
        [
          {
            id: 'author-alias-review',
            reviewerUserId: null,
            reviewerName: 'Programme Author',
            decision: 'APPROVE',
            isIndependent: true,
            reviewedAt,
          },
          {
            id: 'authenticated-review',
            reviewerUserId: 'reviewer-b',
            reviewerName: 'Reviewer B',
            decision: 'APPROVE',
            isIndependent: true,
            reviewedAt,
          },
        ] as never,
        'author-user-id',
      ),
    ).toThrowError(ProgrammeVerdictPublicationError)
  })
})
