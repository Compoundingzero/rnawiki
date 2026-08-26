import { describe, expect, it } from 'vitest'

import {
  aggregatePublicContentFreshness,
  effectivePublicContentFreshness,
  type ProgrammeSourceFreshnessInput,
} from '@/lib/seo/freshness'

const evaluatedAt = new Date('2026-08-25T00:00:00.000Z')

function state(
  freshnessStatus: ProgrammeSourceFreshnessInput['freshnessStatus'],
  nextCheckDueAt: Date | null = new Date('2026-09-01T00:00:00.000Z'),
): ProgrammeSourceFreshnessInput {
  return { freshnessStatus, nextCheckDueAt }
}

describe('public programme freshness used by search policy', () => {
  it('turns a stored CURRENT row stale when its exact policy deadline has arrived', () => {
    expect(
      effectivePublicContentFreshness(
        state('CURRENT', new Date('2026-08-25T00:00:00.000Z')),
        evaluatedAt,
      ),
    ).toBe('stale')
  })

  it('preserves dossier precedence across all source rows', () => {
    expect(
      aggregatePublicContentFreshness(
        [state('STALE'), state('NEW_EVIDENCE'), state('CURRENT')],
        evaluatedAt,
      ),
    ).toBe('review_required')
    expect(
      aggregatePublicContentFreshness([state('CURRENT'), state('CHECK_FAILED')], evaluatedAt),
    ).toBe('stale')
    expect(aggregatePublicContentFreshness([state('CURRENT'), state('CURRENT')], evaluatedAt)).toBe(
      'current',
    )
  })

  it('maps zero monitoring rows to unknown so the indexing policy fails closed', () => {
    expect(aggregatePublicContentFreshness([], evaluatedAt)).toBe('unknown')
  })

  it.each(['NOT_ASSESSED', 'UNKNOWN'] as const)(
    'keeps an explicit %s row unknown',
    (freshnessStatus) => {
      expect(aggregatePublicContentFreshness([state(freshnessStatus)], evaluatedAt)).toBe('unknown')
    },
  )
})
