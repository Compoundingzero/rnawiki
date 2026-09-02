import { describe, expect, it } from 'vitest'

import {
  RESULT_DEBUGGER_REASON_MAX_LENGTH,
  buildCorrectionRow,
  resultDebuggerCorrectionSchema,
} from '@/lib/semantic/result-debugger'
import { SEMANTIC_ENGINE_VERSION } from '@/lib/semantic/search'

const unitA = 'a'.repeat(64)
const unitB = 'b'.repeat(64)

const valid = {
  query: 'half-life of metformin',
  returnedUnitIds: [unitA, unitB],
  expectedUnitId: unitB,
  expectedAbsence: false,
  reason: 'The top result was the section state, not the recorded value the question asked for.',
}

describe('result debugger correction validation', () => {
  it('accepts a correction that names the unit that should have come back', () => {
    const parsed = resultDebuggerCorrectionSchema.parse(valid)
    expect(parsed.expectedUnitId).toBe(unitB)
    expect(parsed.expectedAbsence).toBe(false)
  })

  it('accepts a correction that says the answer is a recorded absence', () => {
    const parsed = resultDebuggerCorrectionSchema.parse({
      query: 'cost of a medicine with no recorded price',
      returnedUnitIds: [unitA],
      expectedAbsence: true,
      reason: 'The recorded absence for cost context is the answer here.',
    })
    expect(parsed.expectedAbsence).toBe(true)
    expect(parsed.expectedUnitId).toBeUndefined()
  })

  it('rejects a correction that says nothing about what should have happened', () => {
    expect(() =>
      resultDebuggerCorrectionSchema.parse({ ...valid, expectedUnitId: undefined }),
    ).toThrow()
  })

  it('rejects an empty query, an empty reason and a whitespace-only reason', () => {
    expect(() => resultDebuggerCorrectionSchema.parse({ ...valid, query: '   ' })).toThrow()
    expect(() => resultDebuggerCorrectionSchema.parse({ ...valid, reason: '' })).toThrow()
    expect(() => resultDebuggerCorrectionSchema.parse({ ...valid, reason: '  \n ' })).toThrow()
  })

  it('rejects an id that is not a SHA-256 digest', () => {
    expect(() =>
      resultDebuggerCorrectionSchema.parse({ ...valid, expectedUnitId: 'not-a-digest' }),
    ).toThrow()
    expect(() =>
      resultDebuggerCorrectionSchema.parse({ ...valid, returnedUnitIds: ['nope'] }),
    ).toThrow()
  })

  it('rejects a repeated id in the returned list', () => {
    expect(() =>
      resultDebuggerCorrectionSchema.parse({ ...valid, returnedUnitIds: [unitA, unitA] }),
    ).toThrow()
  })

  it('rejects an unknown field and an over-long reason', () => {
    expect(() =>
      resultDebuggerCorrectionSchema.parse({ ...valid, engineVersion: 'client-supplied' }),
    ).toThrow()
    expect(() =>
      resultDebuggerCorrectionSchema.parse({
        ...valid,
        reason: 'x'.repeat(RESULT_DEBUGGER_REASON_MAX_LENGTH + 1),
      }),
    ).toThrow()
  })

  it('stamps the engine version server-side and never from the request', () => {
    const row = buildCorrectionRow(resultDebuggerCorrectionSchema.parse(valid), 'usr_1')
    expect(row.engineVersion).toBe(SEMANTIC_ENGINE_VERSION)
    expect(row.reviewerUserId).toBe('usr_1')
    expect(row.expectedUnitId).toBe(unitB)
    expect(row.id.startsWith('rdbg_')).toBe(true)
  })
})
