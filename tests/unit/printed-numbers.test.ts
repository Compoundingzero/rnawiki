import { describe, expect, it } from 'vitest'

import {
  firstNumberIn,
  numbersIn,
  printedSpan,
  statesNumber,
  withoutThousandsSeparators,
} from '@/lib/background/printed-numbers'

/**
 * The defect this module exists to end, pinned at the definition rather than at each of the five
 * places it surfaced: extraction, engine validation, the freshness loop's drift check, the
 * cross-source consensus span, and the exposure-timeline axis.
 */
describe('numbers as documents print them', () => {
  it('reads a separated number whole', () => {
    expect(numbersIn('the volume of distribution is 5,800 L')).toEqual([5800])
    expect(firstNumberIn('5,800 L')).toBe(5800)
    expect(numbersIn('1,234,567 units')).toEqual([1234567])
  })

  it('reads an unseparated number whole, which the three-digit branch could not', () => {
    // `\d{1,3}(?:,\d{3})*` matches with zero comma groups, so it took "135" from "1355.38" and
    // recorded vitamin B12 as weighing 135 g/mol.
    expect(numbersIn('the molecular weight is 1355.38 g/mol')).toEqual([1355.38])
    expect(firstNumberIn('1355.38')).toBe(1355.38)
  })

  it('does not accept a number that only appears inside a longer one', () => {
    expect(statesNumber('the volume is 5,800 L', 800)).toBe(false)
    expect(statesNumber('the weight is 1355.38', 135)).toBe(false)
    expect(statesNumber('the volume is 5,800 L', 5800)).toBe(true)
  })

  it('accepts the same number written another way', () => {
    expect(statesNumber('the value is 0.50 units', 0.5)).toBe(true)
    expect(statesNumber('the weight is 5800 g/mol', 5800)).toBe(true)
    expect(statesNumber('the weight is 5,800 g/mol', 5800)).toBe(true)
  })

  it('spans a printed range by its whole numbers', () => {
    expect(printedSpan('0.04 to 0.05 L/kg')).toEqual({ low: 0.04, high: 0.05 })
    // The local copy in the consensus builder read this as 5 to 800 and reported two agreeing
    // readings as disagreeing.
    expect(printedSpan('5,800 L')).toEqual({ low: 5800, high: 5800 })
    expect(printedSpan('no number here')).toBeNull()
  })

  it('leaves commas that are not thousands separators alone', () => {
    // A pricing row is comma-delimited. The looser rule deleted the field separator and glued an
    // eleven-digit product code onto the price.
    const row = 'DIAZEPAM 10 MG RECTAL GEL,43386028001,221.72208,08/19/2026,EA'
    expect(withoutThousandsSeparators(row)).toBe(row)
    expect(statesNumber(withoutThousandsSeparators(row), 221.72208)).toBe(true)
  })

  it('strips separators only from whole separated numbers', () => {
    expect(withoutThousandsSeparators('5,800 and 1,234,567')).toBe('5800 and 1234567')
    expect(withoutThousandsSeparators('a list of 1,2,3')).toBe('a list of 1,2,3')
  })

  it('refuses a value that is not a number', () => {
    expect(statesNumber('anything', Number.NaN)).toBe(false)
    expect(statesNumber('anything', Number.POSITIVE_INFINITY)).toBe(false)
  })

  describe('digits that belong to a name are not quantities', () => {
    it('reads no quantity out of an uppercase identifier', () => {
      // Each of these passed the excerpt check for a number the source never stated as a number.
      expect(numbersIn('Pembrolizumab Q3W')).toEqual([])
      expect(numbersIn('"groupId":"OG002"')).toEqual([])
      expect(numbersIn('a substrate of CYP3A4')).toEqual([])
      expect(numbersIn('NCT01866319')).toEqual([])
      expect(numbersIn('vitamin B12')).toEqual([])
      expect(numbersIn('COVID-19')).toEqual([])
    })

    it('reads no quantity out of a hyphenated compound word', () => {
      expect(numbersIn('Dupilumab every-2-week arm, 224 participants: 37.9%')).toEqual([224, 37.9])
    })

    it('still reads a range whose hyphen follows a digit', () => {
      expect(numbersIn('5-10 mg')).toEqual([5, 10])
      expect(printedSpan('5-10 mg')).toEqual({ low: 5, high: 10 })
    })

    /**
     * The counterexample the rule was written against. Ivabradine's FDA label really does print
     * "reached in approximately1 hour" — the space is missing in the source document, not in the
     * excerpt transcribed from it. A rule that skipped every letter-adjacent digit would refuse a
     * correctly recorded value because a manufacturer dropped a space, so the discriminator is
     * case: identifiers here are uppercase and prose is not.
     */
    it('keeps a quantity that a source glued to a lowercase word', () => {
      const excerpt =
        'peak plasma ivabradine concentrations are reached in approximately1 hour under fasting conditions'
      expect(statesNumber(excerpt, 1)).toBe(true)
    })

    it('keeps a quantity written without a space before its unit', () => {
      expect(numbersIn('10mg once daily')).toEqual([10])
    })
  })
})
