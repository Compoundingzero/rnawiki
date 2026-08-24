import { describe, expect, it } from 'vitest'
import {
  ProgrammeVerdictPublicationError,
  programmeVerdictReviewConsensus,
} from '@/lib/queries/programme-verdict-publication'

function review(
  id: string,
  reviewerUserId: string,
  decision: 'APPROVE' | 'CHANGES_REQUESTED' | 'REJECT' = 'APPROVE',
  reviewedAt = new Date('2026-08-22T01:00:00.000Z'),
) {
  return {
    id,
    reviewerUserId,
    reviewerName: reviewerUserId,
    decision,
    isIndependent: true,
    reviewedAt,
  }
}

describe('programmeVerdictReviewConsensus', () => {
  it('counts reviewer identities rather than approval rows', () => {
    expect(() =>
      programmeVerdictReviewConsensus(
        [review('r1', 'reviewer-a'), review('r2', 'reviewer-a')],
        null,
      ),
    ).toThrowError(
      expect.objectContaining<Partial<ProgrammeVerdictPublicationError>>({
        code: 'invalid_reviewer_identity',
      }),
    )
  })

  it('rejects a second decision from the same reviewer instead of selecting a latest row', () => {
    expect(() =>
      programmeVerdictReviewConsensus(
        [
          review('r1', 'reviewer-a'),
          review('r2', 'reviewer-b'),
          review('r3', 'reviewer-b', 'CHANGES_REQUESTED', new Date('2026-08-22T02:00:00.000Z')),
        ],
        null,
      ),
    ).toThrowError(
      expect.objectContaining<Partial<ProgrammeVerdictPublicationError>>({
        code: 'invalid_reviewer_identity',
      }),
    )
  })

  it('never lets a later approval erase an immutable change request', () => {
    expect(() =>
      programmeVerdictReviewConsensus(
        [
          review('r1', 'reviewer-a'),
          review('r2', 'reviewer-b', 'CHANGES_REQUESTED'),
          review('r3', 'reviewer-b', 'APPROVE', new Date('2026-08-22T03:00:00.000Z')),
        ],
        null,
      ),
    ).toThrowError(
      expect.objectContaining<Partial<ProgrammeVerdictPublicationError>>({
        code: 'invalid_reviewer_identity',
      }),
    )
  })

  it('requires a new candidate after two matching adverse decisions', () => {
    expect(() =>
      programmeVerdictReviewConsensus(
        [
          review('r1', 'reviewer-a', 'CHANGES_REQUESTED'),
          review('r2', 'reviewer-b', 'CHANGES_REQUESTED'),
        ],
        null,
      ),
    ).toThrowError(
      expect.objectContaining<Partial<ProgrammeVerdictPublicationError>>({
        code: 'unresolved_review',
      }),
    )
  })

  it('does not count the verdict author as an independent reviewer', () => {
    expect(() =>
      programmeVerdictReviewConsensus(
        [review('r1', 'author'), review('r2', 'reviewer-b')],
        'author',
      ),
    ).toThrowError(
      expect.objectContaining<Partial<ProgrammeVerdictPublicationError>>({
        code: 'insufficient_independent_reviews',
      }),
    )
  })
})
