import { describe, expect, it } from 'vitest'

import { alternativeNames } from '@/lib/background/name-normalization'

/**
 * Both name normalizations delete parentheticals, which is right when the bracket holds a salt form
 * and wrong when it holds the answer. RNAWiki titles controlled substances as
 * "Kratom (Mitragyna speciosa) and Mitragynine" — the bracket carries the binomial a taxonomy can
 * match — and those rows matched nothing at all.
 */
describe('alternative names a printed title offers', () => {
  it('keeps what the bracket holds', () => {
    const names = alternativeNames('Kratom (Mitragyna speciosa) and Mitragynine')
    expect(names).toContain('Mitragyna speciosa')
    expect(names).toContain('Mitragynine')
    expect(names).toContain('Kratom')
  })

  it('splits a bracket that lists several names', () => {
    const names = alternativeNames('Heroin (Diamorphine, Diacetylmorphine)')
    expect(names).toContain('Heroin')
    expect(names).toContain('Diamorphine')
    expect(names).toContain('Diacetylmorphine')
  })

  it('invents nothing: every alternative is a substring of what was printed', () => {
    const printed = 'MDMA (3,4-Methylenedioxymethamphetamine)'
    for (const name of alternativeNames(printed)) {
      expect(printed.includes(name), name).toBe(true)
    }
  })

  it('offers the most specific name first', () => {
    const names = alternativeNames('LSD (Lysergic Acid Diethylamide)')
    expect(names[0]!.length).toBeGreaterThanOrEqual(names[names.length - 1]!.length)
  })

  it('leaves an ordinary name alone', () => {
    expect(alternativeNames('Metformin')).toEqual(['Metformin'])
  })

  it('drops a fragment too short to match anything safely', () => {
    expect(alternativeNames('Vitamin C (C)')).not.toContain('C')
  })
})
