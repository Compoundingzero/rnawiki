import { describe, expect, it } from 'vitest'

import { compareFieldReadings, compareReadings } from '@/lib/background/reading-comparison'

/**
 * Recording that sources differ IS this corpus's product, which makes a false disagreement the most
 * expensive error it can make. Every case below is one where the previous span-only rule got the
 * answer wrong, or one that must keep working now that units are consulted.
 */

describe('readings that cannot be compared without an unstated assumption', () => {
  it('does not call a volume and a weight-normalised volume a disagreement', () => {
    // melphalan: 0.5 L/kg on eight labels, 35.5 to 185.7 L on a ninth. At 70 kg the second is
    // 0.51 L/kg. Reported as a conflict for as long as the rule ignored units.
    expect(compareReadings('0.5 L/kg', '35.5 to 185.7 L')).toEqual({
      state: 'not_comparable',
      reason: 'DENOMINATOR_MISMATCH',
    })
  })

  it('does not call a dose and a weight-normalised dose a disagreement', () => {
    expect(compareReadings('50 mg', '2 mg/kg')).toEqual({
      state: 'not_comparable',
      reason: 'DENOMINATOR_MISMATCH',
    })
  })

  it('does not compare a body-surface dose with a flat dose', () => {
    expect(compareReadings('100 mg/m2', '100 mg')).toEqual({
      state: 'not_comparable',
      reason: 'DENOMINATOR_MISMATCH',
    })
  })

  it('does not compare across dimensions', () => {
    expect(compareReadings('12 hours', '12 L')).toEqual({
      state: 'not_comparable',
      reason: 'UNIT_DIMENSION_MISMATCH',
    })
  })

  it('never converts using a body weight, even when the arithmetic would be easy', () => {
    // 35.5 L / 70 kg would be 0.51 L/kg, but no source printed 70 kg.
    expect(compareReadings('0.51 L/kg', '35.5 L').state).toBe('not_comparable')
  })
})

describe('exact conversions that need no assumption', () => {
  it('compares minutes with hours', () => {
    expect(compareReadings('90 minutes', '1.5 hours')).toEqual({
      state: 'agree',
      reason: 'COMPATIBLE_VALUES_OVERLAP',
    })
    expect(compareReadings('30 minutes', '5 hours')).toEqual({
      state: 'differ',
      reason: 'COMPATIBLE_VALUES_DISJOINT',
    })
  })

  it('compares days with hours', () => {
    expect(compareReadings('1 day', '24 hours').state).toBe('agree')
    // ivermectin: 18 hours on ten labels against 6.5 days on eight. A real disagreement.
    expect(compareReadings('18 hours', '6.5 days').state).toBe('differ')
  })

  it('compares millilitres with litres', () => {
    expect(compareReadings('5000 mL', '5 L').state).toBe('agree')
  })

  it('compares micrograms, milligrams and grams', () => {
    expect(compareReadings('1000 mcg', '1 mg').state).toBe('agree')
    expect(compareReadings('1 g', '1000 mg').state).toBe('agree')
  })
})

describe('comparable readings', () => {
  it('agrees when ranges overlap', () => {
    expect(compareReadings('5 to 12 hours', '10 hours').state).toBe('agree')
  })

  it('differs when ranges do not overlap', () => {
    expect(compareReadings('5 hours', '18 hours')).toEqual({
      state: 'differ',
      reason: 'COMPATIBLE_VALUES_DISJOINT',
    })
  })

  it('treats the same value printed differently as agreement', () => {
    expect(compareReadings('5,800 L', '5800 L').state).toBe('agree')
    expect(compareReadings('0.50 %', '0.5%').state).toBe('agree')
  })

  it('compares percentages', () => {
    expect(compareReadings('89%', '92%').state).toBe('differ')
    expect(compareReadings('85 to 95%', '89%').state).toBe('agree')
  })
})

describe('readings too incomplete to decide', () => {
  it('reports a missing unit as insufficient context rather than as a disagreement', () => {
    // "6.5 days" stored with its unit unparsed was one of the readings the old rule called disjoint.
    expect(compareReadings('6.5', '18 hours')).toEqual({
      state: 'insufficient_context',
      reason: 'CONTEXT_MISSING',
    })
  })

  it('reports a missing number as insufficient context', () => {
    expect(compareReadings('not reported', '18 hours').state).toBe('insufficient_context')
  })
})

describe('a whole field, across all its readings', () => {
  it('reports a genuine disagreement even when other pairs are easy to compare', () => {
    // A real conflict must never be hidden by other readings agreeing.
    const result = compareFieldReadings(['5 hours', '5.0 hours', '18 hours'])
    expect(result.state).toBe('differ')
    expect(result.reasons).toContain('COMPATIBLE_VALUES_DISJOINT')
  })

  it('reports not_comparable rather than agreement when a pair cannot be compared', () => {
    // "We could not tell" and "they agree" are different facts, and only one is reassuring.
    const result = compareFieldReadings(['0.5 to 0.6 L/kg', '0.55 L/kg', '35.5 L'])
    expect(result.state).toBe('not_comparable')
    expect(result.reasons).toContain('DENOMINATOR_MISMATCH')
  })

  it('lets a genuine disagreement outrank a pair that cannot be compared', () => {
    // Precedence is deliberate: one real conflict is the finding, and it must not be hidden because
    // some other pair in the same field happened to be incomparable.
    const result = compareFieldReadings(['5 hours', '18 hours', '0.5 L/kg'])
    expect(result.state).toBe('differ')
  })

  /**
   * Recorded as a known behaviour rather than fixed. Two labels printing 0.5 and 0.51 L/kg are
   * disjoint point spans and are reported as differing, which is almost certainly not what a reader
   * means. The fix is NOT a tolerance: any tolerance is an unsourced assumption about measurement
   * precision, and inventing one here would be the corpus deciding something no source stated. The
   * real answer is to record the precision a source printed, which needs a schema change.
   */
  it('reports two nearly equal point values as differing, which is a known limitation', () => {
    expect(compareReadings('0.5 L/kg', '0.51 L/kg').state).toBe('differ')
  })

  it('agrees only when every pair is comparable and overlaps', () => {
    expect(compareFieldReadings(['12 hours', '10 to 14 hours']).state).toBe('agree')
  })

  it('reports a single distinct reading as agreement', () => {
    // A consensus field exists only where two or more documents stated the value, so one distinct
    // reading means they all printed the same thing. Calling that "insufficient context" buried
    // unanimous agreement in the same bucket as an unreadable unit.
    expect(compareFieldReadings(['12 hours']).state).toBe('agree')
  })

  it('is order-independent', () => {
    const forward = compareFieldReadings(['5 hours', '18 hours', '0.5 L/kg'])
    const reverse = compareFieldReadings(['0.5 L/kg', '18 hours', '5 hours'])
    expect(reverse.state).toBe(forward.state)
    expect(reverse.reasons).toEqual(forward.reasons)
  })
})
