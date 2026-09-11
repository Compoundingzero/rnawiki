/**
 * Pruning a withdrawn registry match out of stored field values.
 *
 * The defect this guards: `apply-identity-corrections.ts` removed the registry rows and recorded
 * the removal, but left the same study ids inside `page_fields`. Four studies the Tribulus
 * correction withdrew stayed inside creatine's `humanCeiling.trials`, one stayed inside
 * `ongoingTrials`, and the page counted both.
 *
 * Fixtures only. No sentence here is about a real result.
 */
import { describe, expect, it } from 'vitest'

import { pruneStoredReferences } from '@/lib/dossier-v3/prune-stored-references'

describe('pruning a withdrawn study from a stored field', () => {
  it('removes a bare study id from a list', () => {
    const result = pruneStoredReferences(
      { trials: ['NCT00000001', 'NCT00000002', 'NCT00000003'] },
      ['NCT00000002'],
    )
    expect(result.value).toEqual({ trials: ['NCT00000001', 'NCT00000003'] })
    expect(result.removed).toEqual(['NCT00000002'])
  })

  it('removes an object that names the study', () => {
    const result = pruneStoredReferences(
      [
        { nct: 'NCT00000001', title: 'One' },
        { nct: 'NCT00000002', title: 'Two' },
      ],
      ['NCT00000002'],
    )
    expect(result.value).toEqual([{ nct: 'NCT00000001', title: 'One' }])
  })

  it('recognises the id under any of the recorded key names', () => {
    for (const key of ['nct', 'nctId', 'nct_id', 'id']) {
      const result = pruneStoredReferences(
        [{ [key]: 'NCT00000002' }, { other: 'keep' }],
        ['NCT00000002'],
      )
      expect(result.removed).toEqual(['NCT00000002'])
      expect(result.value).toEqual([{ other: 'keep' }])
    }
  })

  it('reduces a sibling count that equalled the list length', () => {
    const result = pruneStoredReferences(
      { trials: ['NCT00000001', 'NCT00000002', 'NCT00000003'], trialsListed: 3 },
      ['NCT00000002'],
    )
    expect(result.value).toEqual({ trials: ['NCT00000001', 'NCT00000003'], trialsListed: 2 })
    expect(result.countsAdjusted).toEqual([{ key: 'trialsListed', from: 3, to: 2 }])
  })

  it('never guesses at a number that counts something else', () => {
    // `registeredStudies` is 134 beside a 123-element list on the real record. It counts matched
    // studies, not listed ones, and a prune has no way to recompute it.
    const result = pruneStoredReferences(
      {
        trials: ['NCT00000001', 'NCT00000002', 'NCT00000003'],
        trialsListed: 3,
        registeredStudies: 9,
      },
      ['NCT00000002'],
    )
    const value = result.value as Record<string, unknown>
    expect(value.registeredStudies).toBe(9)
    expect(result.countsLeftAlone).toEqual([{ key: 'registeredStudies', value: 9 }])
  })

  it('reports a breakdown it cannot recompute rather than editing it', () => {
    const result = pruneStoredReferences(
      { trials: ['NCT00000001', 'NCT00000002'], trialsListed: 2, largestN: 1741 },
      ['NCT00000002'],
    )
    expect(result.countsLeftAlone.map((entry) => entry.key)).toContain('largestN')
    expect((result.value as Record<string, unknown>).largestN).toBe(1741)
  })

  it('leaves a record alone when it names none of the studies', () => {
    const before = { trials: ['NCT00000001'], trialsListed: 1, note: 'unchanged' }
    const result = pruneStoredReferences(before, ['NCT00000009'])
    expect(result.value).toEqual(before)
    expect(result.removed).toEqual([])
    expect(result.countsAdjusted).toEqual([])
  })

  it('reaches a list nested inside another object', () => {
    const result = pruneStoredReferences(
      { registry: { open: { trials: ['NCT00000001', 'NCT00000002'], count: 2 } } },
      ['NCT00000001'],
    )
    expect(result.value).toEqual({ registry: { open: { trials: ['NCT00000002'], count: 1 } } })
  })

  it('never touches prose that happens to mention the study', () => {
    const before = { reason: 'Study NCT00000002 was withdrawn from this record.' }
    const result = pruneStoredReferences(before, ['NCT00000002'])
    expect(result.value).toEqual(before)
    expect(result.removed).toEqual([])
  })

  it('is idempotent: a second prune finds nothing left to do', () => {
    const first = pruneStoredReferences(
      { trials: ['NCT00000001', 'NCT00000002'], trialsListed: 2 },
      ['NCT00000002'],
    )
    const second = pruneStoredReferences(first.value, ['NCT00000002'])
    expect(second.removed).toEqual([])
    expect(second.value).toEqual(first.value)
  })

  it('handles the creatine shape: a list of ids beside a matching and a non-matching count', () => {
    const trials = Array.from(
      { length: 123 },
      (_, index) => `NCT${String(index + 1).padStart(8, '0')}`,
    )
    const result = pruneStoredReferences(
      { trials, trialsListed: 123, registeredStudies: 134, largestN: 1741 },
      ['NCT00000001', 'NCT00000002', 'NCT00000003', 'NCT00000004'],
    )
    const value = result.value as Record<string, unknown>
    expect((value.trials as string[]).length).toBe(119)
    expect(value.trialsListed).toBe(119)
    expect(value.registeredStudies).toBe(134)
    expect(result.removed).toHaveLength(4)
  })
})
