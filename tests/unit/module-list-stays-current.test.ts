import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { RECORDED_BACKGROUND_MODULES } from '@/lib/background/types'
import { RECORDABLE_MODULES } from '@/lib/agents/dataset/evidence-density'

/**
 * A consumer that enumerates modules by hand goes stale, silently, and reports a smaller corpus
 * than exists.
 *
 * It happened twice. The coverage ledger called 691 records empty because it had never been told
 * about recorded organisms. The evidence-density agent scored every record against a denominator
 * missing six modules, so a record rich in the newest ones reported as thin. Neither failed; both
 * simply understated.
 *
 * The canonical list now lives with the envelope, and this test is what keeps it canonical: a field
 * added to `MedicineRecordedBackground` without being added here fails immediately, at the
 * definition rather than in whichever report happens to be read next.
 */
describe('the module list matches the envelope it describes', () => {
  /** Envelope fields that carry no reader-facing content, so no consumer should count them. */
  const BOOKKEEPING = new Set(['version', 'authoredAt', 'provenanceTier', 'attribution'])

  const declared = (() => {
    const source = readFileSync('lib/background/types.ts', 'utf8')
    const block = source.match(/export interface MedicineRecordedBackground \{([\s\S]*?)\n\}/u)?.[1]
    expect(block, 'MedicineRecordedBackground declaration not found').toBeDefined()
    return [...block!.matchAll(/^\s{2}(\w+)\??:/gmu)]
      .map((match) => match[1]!)
      .filter((field) => !BOOKKEEPING.has(field))
  })()

  it('covers every field the envelope declares, and invents none', () => {
    expect([...RECORDED_BACKGROUND_MODULES].sort()).toEqual([...declared].sort())
  })

  it('is the list the density agent scores against', () => {
    // A denominator that omits a module makes every record holding it look thinner than it is.
    expect([...RECORDABLE_MODULES]).toEqual([...RECORDED_BACKGROUND_MODULES])
  })

  it('names each module once', () => {
    expect(new Set(RECORDED_BACKGROUND_MODULES).size).toBe(RECORDED_BACKGROUND_MODULES.length)
  })
})
