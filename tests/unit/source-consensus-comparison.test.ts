import { describe, expect, it } from 'vitest'

import {
  compareConsensusReadings,
  STRUCTURALLY_UNEXTRACTED_POPULATION_CONTEXT,
} from '@/lib/background/source-consensus-comparison'

const unknown = STRUCTURALLY_UNEXTRACTED_POPULATION_CONTEXT

describe('source-consensus context-aware comparison', () => {
  it('does not call disjoint same-unit readings different when context was not extracted', () => {
    expect(
      compareConsensusReadings([
        { display: '5 hours', unit: 'hours', populationContext: unknown },
        { display: '18 hours', unit: 'hours', populationContext: unknown },
      ]),
    ).toEqual({
      state: 'insufficient_context',
      reasons: ['STRUCTURED_CONTEXT_MISSING'],
    })
  })

  it('also refuses agreement between distinct overlapping readings without structured context', () => {
    expect(
      compareConsensusReadings([
        { display: '5 to 12 hours', unit: 'hours', populationContext: unknown },
        { display: '10 hours', unit: 'hours', populationContext: unknown },
      ]).state,
    ).toBe('insufficient_context')
  })

  it('keeps identical printed readings as printed-reading agreement', () => {
    expect(
      compareConsensusReadings([
        { display: '12 hours', unit: 'hours', populationContext: unknown },
        { display: '12 h', unit: 'hours', populationContext: unknown },
      ]),
    ).toEqual({ state: 'agree', reasons: ['COMPATIBLE_VALUES_OVERLAP'] })
  })

  it('retains not_comparable when the base unit comparison cannot compare', () => {
    expect(
      compareConsensusReadings([
        { display: '0.5 L/kg', unit: 'L/kg', populationContext: unknown },
        { display: '35.5 L', unit: 'L', populationContext: unknown },
      ]),
    ).toEqual({ state: 'not_comparable', reasons: ['DENOMINATOR_MISMATCH'] })
  })

  it('allows differ only with one matching structured context', () => {
    expect(
      compareConsensusReadings([
        { display: '5 hours', unit: 'hours', populationContext: 'healthy adults, single dose' },
        { display: '18 hours', unit: 'hours', populationContext: 'healthy adults, single dose' },
      ]),
    ).toEqual({ state: 'differ', reasons: ['COMPATIBLE_VALUES_DISJOINT'] })
  })

  it('treats two different structured contexts as insufficient for a clinical comparison', () => {
    expect(
      compareConsensusReadings([
        { display: '5 hours', unit: 'hours', populationContext: 'healthy adults, single dose' },
        { display: '18 hours', unit: 'hours', populationContext: 'hepatic impairment' },
      ]),
    ).toEqual({
      state: 'insufficient_context',
      reasons: ['STRUCTURED_CONTEXT_MISSING'],
    })
  })
})
