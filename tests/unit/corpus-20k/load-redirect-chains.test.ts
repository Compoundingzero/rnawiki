/**
 * A published redirect is one hop.
 *
 * `resolvePublicMedicineRoute` refuses a redirect whose target is itself an old slug, so a chain in
 * `medicine_slug_redirects` turns a URL that answered 308 into a 404. The Tier 2 load wrote one:
 * it pointed `risedronate-sodium-hemi-pentahydrate` at `risedronate` while an earlier row already
 * pointed `risedronate-sodium-hemipentahydrate` at `risedronate-sodium-hemi-pentahydrate`. These
 * cases hold the rules that stop the loader writing another.
 */
import { describe, expect, it } from 'vitest'

import { Counters, repairLedgerChains, terminalSlugOf } from '@/scripts/corpus-20k/load/materialise'
import type { LedgerRedirect } from '@/scripts/corpus-20k/load/materialise'

function ledgerOf(rows: Array<[string, string]>): Map<string, LedgerRedirect> {
  const ledger = new Map<string, LedgerRedirect>()
  for (const [oldSlug, targetSlug] of rows) {
    ledger.set(oldSlug, { oldSlug, targetSlug, reason: 'MERGED', rationale: 'recorded earlier' })
  }
  return ledger
}

describe('terminalSlugOf', () => {
  it('returns the slug itself when the ledger does not redirect it', () => {
    expect(terminalSlugOf('risedronate', ledgerOf([]))).toBe('risedronate')
  })

  it('walks a chain to the slug that is not an old slug', () => {
    const ledger = ledgerOf([
      ['risedronate-sodium-hemipentahydrate', 'risedronate-sodium-hemi-pentahydrate'],
      ['risedronate-sodium-hemi-pentahydrate', 'risedronate'],
    ])
    expect(terminalSlugOf('risedronate-sodium-hemipentahydrate', ledger)).toBe('risedronate')
  })

  it('returns null for a cycle rather than choosing a canonical URL', () => {
    expect(
      terminalSlugOf(
        'a',
        ledgerOf([
          ['a', 'b'],
          ['b', 'a'],
        ]),
      ),
    ).toBeNull()
  })
})

describe('repairLedgerChains', () => {
  it('re-points an earlier hop at the terminal target and keeps its recorded wording', () => {
    const ledger = ledgerOf([
      ['risedronate-sodium-hemipentahydrate', 'risedronate-sodium-hemi-pentahydrate'],
      ['risedronate-sodium-hemi-pentahydrate', 'risedronate'],
    ])
    const repairs = repairLedgerChains({
      ledger,
      legacyDrugIdBySlug: new Map([['risedronate', 'drug-risedronate']]),
      counters: new Counters(),
    })
    expect(repairs).toHaveLength(1)
    expect(repairs[0]).toMatchObject({
      oldSlug: 'risedronate-sodium-hemipentahydrate',
      targetSlug: 'risedronate-sodium-hemi-pentahydrate',
      terminalSlug: 'risedronate',
      targetDrugId: 'drug-risedronate',
      reason: 'MERGED',
      rationale: 'recorded earlier',
    })
  })

  it('leaves a ledger with no chain untouched', () => {
    const repairs = repairLedgerChains({
      ledger: ledgerOf([
        ['old-a', 'canonical'],
        ['old-b', 'canonical'],
      ]),
      legacyDrugIdBySlug: new Map([['canonical', 'drug-canonical']]),
      counters: new Counters(),
    })
    expect(repairs).toEqual([])
  })

  it('leaves a chain alone, and counts it, when the terminal slug has no legacy row', () => {
    const counters = new Counters()
    const repairs = repairLedgerChains({
      ledger: ledgerOf([
        ['old-a', 'old-b'],
        ['old-b', 'not-in-drugs'],
      ]),
      legacyDrugIdBySlug: new Map(),
      counters,
    })
    expect(repairs).toEqual([])
    expect(counters.entries()).toContainEqual([
      'redirect chains left alone: the terminal slug has no legacy drugs row',
      1,
    ])
  })

  it('refuses a cycle instead of inventing a destination', () => {
    expect(() =>
      repairLedgerChains({
        ledger: ledgerOf([
          ['a', 'b'],
          ['b', 'a'],
        ]),
        legacyDrugIdBySlug: new Map(),
        counters: new Counters(),
      }),
    ).toThrow(/cycle/)
  })
})
