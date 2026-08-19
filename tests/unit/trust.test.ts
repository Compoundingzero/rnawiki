import { describe, expect, it } from 'vitest'
import type { Db } from '@/db'
import {
  canAutoPublish,
  decideEditRouting,
  editsUntilNextTier,
  TIER_DESCRIPTION,
  TIER_LABEL,
  tierForAcceptedEdits,
  TRUST_TIER_THRESHOLDS,
  TRUST_TIERS,
  type TrustDb,
} from '@/lib/trust'
import type { TrustTier } from '@/lib/types'

// Compile-time guarantee that a Drizzle transaction can be passed to recordAcceptedEdit /
// recordRejectedEdit. `TrustDb` is a structural Pick precisely so this holds; naming
// `NodePgDatabase` instead would break it, because a transaction has no `$client`. This assertion
// fails at `npm run typecheck`, not at runtime — which is the point.
type TransactionHandle = Parameters<Parameters<Db['transaction']>[0]>[0]
type TransactionFitsTrustDb = TransactionHandle extends TrustDb ? true : false
const transactionFitsTrustDb: TransactionFitsTrustDb = true

describe('TrustDb', () => {
  it('accepts a transaction handle', () => {
    expect(transactionFitsTrustDb).toBe(true)
  })
})

describe('tierForAcceptedEdits — every threshold boundary', () => {
  it('holds the floor below the first threshold', () => {
    expect(tierForAcceptedEdits(0)).toBe('new')
    expect(tierForAcceptedEdits(1)).toBe('new')
    expect(tierForAcceptedEdits(TRUST_TIER_THRESHOLDS.contributor - 1)).toBe('new')
  })

  it('promotes exactly at each threshold, not one edit early or late', () => {
    expect(tierForAcceptedEdits(TRUST_TIER_THRESHOLDS.contributor)).toBe('contributor')
    expect(tierForAcceptedEdits(TRUST_TIER_THRESHOLDS.trusted - 1)).toBe('contributor')

    expect(tierForAcceptedEdits(TRUST_TIER_THRESHOLDS.trusted)).toBe('trusted')
    expect(tierForAcceptedEdits(TRUST_TIER_THRESHOLDS.steward - 1)).toBe('trusted')

    expect(tierForAcceptedEdits(TRUST_TIER_THRESHOLDS.steward)).toBe('steward')
    expect(tierForAcceptedEdits(TRUST_TIER_THRESHOLDS.steward + 1)).toBe('steward')
    expect(tierForAcceptedEdits(10_000)).toBe('steward')
  })

  it('treats an impossible negative count as the floor rather than crashing', () => {
    expect(tierForAcceptedEdits(-5)).toBe('new')
  })

  it('never skips a tier as the count climbs', () => {
    // Walk every count up to the top threshold and assert the sequence is monotonic in tier order.
    let previousIndex = 0
    for (let n = 0; n <= TRUST_TIER_THRESHOLDS.steward + 5; n++) {
      const index = TRUST_TIERS.indexOf(tierForAcceptedEdits(n))
      expect(index).toBeGreaterThanOrEqual(previousIndex)
      expect(index - previousIndex).toBeLessThanOrEqual(1)
      previousIndex = index
    }
    expect(previousIndex).toBe(TRUST_TIERS.length - 1)
  })
})

describe('canAutoPublish', () => {
  it('is earned, not default: only trusted and steward skip the queue', () => {
    expect(canAutoPublish('new')).toBe(false)
    expect(canAutoPublish('contributor')).toBe(false)
    expect(canAutoPublish('trusted')).toBe(true)
    expect(canAutoPublish('steward')).toBe(true)
  })
})

describe('decideEditRouting', () => {
  it('rejects a failed engine sweep before any trust check — even for a steward admin', () => {
    // The rule this whole file exists to protect: a broken structure is never queued for a human,
    // no matter who submitted it. Highest possible standing on the left, rejection on the right.
    const decision = decideEditRouting({ enginePassed: false, tier: 'steward', isAdmin: true })
    expect(decision.outcome).toBe('machine_rejected')
    expect(decision.reason.length).toBeGreaterThan(0)
  })

  it('rejects a failed sweep for every tier, admin or not', () => {
    for (const tier of TRUST_TIERS) {
      for (const isAdmin of [true, false]) {
        expect(decideEditRouting({ enginePassed: false, tier, isAdmin }).outcome).toBe(
          'machine_rejected',
        )
      }
    }
  })

  it('publishes an admin edit that passed, whatever their tier', () => {
    for (const tier of TRUST_TIERS) {
      const decision = decideEditRouting({ enginePassed: true, tier, isAdmin: true })
      expect(decision.outcome).toBe('published')
    }
  })

  it('publishes a passing edit from an auto-publish tier', () => {
    expect(decideEditRouting({ enginePassed: true, tier: 'trusted', isAdmin: false }).outcome).toBe(
      'published',
    )
    expect(decideEditRouting({ enginePassed: true, tier: 'steward', isAdmin: false }).outcome).toBe(
      'published',
    )
  })

  it('queues a passing edit from a tier that has not earned auto-publish', () => {
    for (const tier of ['new', 'contributor'] satisfies TrustTier[]) {
      const decision = decideEditRouting({ enginePassed: true, tier, isAdmin: false })
      expect(decision.outcome).toBe('pending_review')
      expect(decision.reason).toContain(String(TRUST_TIER_THRESHOLDS.trusted))
    }
  })

  it('covers every combination with a defined outcome and a non-empty reason', () => {
    for (const enginePassed of [true, false]) {
      for (const tier of TRUST_TIERS) {
        for (const isAdmin of [true, false]) {
          const decision = decideEditRouting({ enginePassed, tier, isAdmin })
          expect(['machine_rejected', 'published', 'pending_review']).toContain(decision.outcome)
          expect(decision.reason.trim().length).toBeGreaterThan(0)
          // The engine's verdict is the only thing that can produce a rejection.
          expect(decision.outcome === 'machine_rejected').toBe(!enginePassed)
        }
      }
    }
  })
})

describe('editsUntilNextTier', () => {
  it('counts down to the next threshold', () => {
    expect(editsUntilNextTier(0)).toEqual({
      tier: 'contributor',
      remaining: TRUST_TIER_THRESHOLDS.contributor,
    })
    expect(editsUntilNextTier(TRUST_TIER_THRESHOLDS.contributor)).toEqual({
      tier: 'trusted',
      remaining: TRUST_TIER_THRESHOLDS.trusted - TRUST_TIER_THRESHOLDS.contributor,
    })
    expect(editsUntilNextTier(TRUST_TIER_THRESHOLDS.trusted)).toEqual({
      tier: 'steward',
      remaining: TRUST_TIER_THRESHOLDS.steward - TRUST_TIER_THRESHOLDS.trusted,
    })
  })

  it('returns null at the top', () => {
    expect(editsUntilNextTier(TRUST_TIER_THRESHOLDS.steward)).toBeNull()
    expect(editsUntilNextTier(TRUST_TIER_THRESHOLDS.steward + 100)).toBeNull()
  })
})

describe('tier copy', () => {
  it('labels and describes every tier, with the thresholds the code actually uses', () => {
    for (const tier of TRUST_TIERS) {
      expect(TIER_LABEL[tier].length).toBeGreaterThan(0)
      expect(TIER_DESCRIPTION[tier].length).toBeGreaterThan(0)
    }
    // Descriptions are built from TRUST_TIER_THRESHOLDS, so a changed threshold cannot leave the
    // interface quoting a number the router no longer honours.
    expect(TIER_DESCRIPTION.trusted).toContain(String(TRUST_TIER_THRESHOLDS.trusted))
    expect(TIER_DESCRIPTION.steward).toContain(String(TRUST_TIER_THRESHOLDS.steward))
  })
})
