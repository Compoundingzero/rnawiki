/**
 * Whether two printed readings of the same field can be compared at all, and if so whether they
 * agree.
 *
 * Recording that sources differ IS the product of this corpus, which makes a FALSE disagreement the
 * most expensive error it can make. The previous rule computed a numeric span per reading and marked
 * the field disjoint when two spans did not overlap — without ever consulting the unit. So melphalan
 * carried `0.5 L/kg` from eight labels and `35.5 to 185.7 L` from a ninth and was reported as a
 * disagreement, when 35.5 L in a 70 kg adult is 0.51 L/kg and the two readings say the same thing.
 *
 * Four states, because one Boolean cannot carry the distinction that matters:
 *
 *   agree                 comparable, and their ranges overlap
 *   differ                comparable, and their ranges do not overlap — a real disagreement
 *   not_comparable        comparing them would need an assumption no source stated
 *   insufficient_context  not enough was recorded to decide even that
 *
 * The line this module will not cross: **no conversion that needs an unstated denominator.** Turning
 * `35.5 L` into `L/kg` requires a body weight, and no label printed one. `substance-synonyms` already
 * states the principle — a volume recorded as 40 L and one recorded as 0.6 L/kg are neither the same
 * number nor different numbers — and this module is where it becomes enforceable.
 *
 * Conversions that ARE performed are exact and dimensionless of any assumption: minutes to hours,
 * days to hours, and a stated fraction to a percentage. Nothing else.
 */

import { printedSpan } from './printed-numbers'

export const READING_COMPARISON_STATES = [
  'agree',
  'differ',
  'not_comparable',
  'insufficient_context',
] as const
export type ReadingComparisonState = (typeof READING_COMPARISON_STATES)[number]

export const READING_COMPARISON_REASONS = [
  /** Comparable, and the ranges overlap. */
  'COMPATIBLE_VALUES_OVERLAP',
  /** Comparable, and the ranges do not overlap. The only state that is a real disagreement. */
  'COMPATIBLE_VALUES_DISJOINT',
  /** Different physical dimensions, e.g. a volume against a time. */
  'UNIT_DIMENSION_MISMATCH',
  /** Same dimension, but one is normalised by something the other is not — L against L/kg. */
  'DENOMINATOR_MISMATCH',
  /** A unit or a number could not be read, so comparability itself is undecidable. */
  'CONTEXT_MISSING',
] as const
export type ReadingComparisonReason = (typeof READING_COMPARISON_REASONS)[number]

export interface ReadingComparison {
  state: ReadingComparisonState
  reason: ReadingComparisonReason
}

/** A unit resolved into what it measures, what it is divided by, and its factor to the base unit. */
interface ResolvedUnit {
  dimension: 'time' | 'volume' | 'mass' | 'fraction'
  /** What the value is normalised by, if anything. `L/kg` has one; `L` does not. */
  denominator: string | null
  /** Multiply the printed number by this to reach the dimension's base unit. Exact only. */
  toBase: number
}

/**
 * Unit spellings this corpus actually prints, resolved to a dimension and an exact base factor.
 *
 * Deliberately a fixed table rather than a parser. A parser would confidently resolve a spelling
 * nobody printed, and the failure mode of guessing here is a false disagreement published as the
 * strongest statement the record can make.
 */
const UNITS: ReadonlyArray<readonly [RegExp, ResolvedUnit]> = [
  /* time, base = hours */
  [/^(?:h|hr|hrs|hour|hours)$/iu, { dimension: 'time', denominator: null, toBase: 1 }],
  [/^(?:min|mins|minute|minutes)$/iu, { dimension: 'time', denominator: null, toBase: 1 / 60 }],
  [/^(?:d|day|days)$/iu, { dimension: 'time', denominator: null, toBase: 24 }],
  /* volume, base = litres */
  [/^(?:l|liter|liters|litre|litres)$/iu, { dimension: 'volume', denominator: null, toBase: 1 }],
  [/^m(?:l|L)$/u, { dimension: 'volume', denominator: null, toBase: 0.001 }],
  [
    /^(?:l|liter|liters|litre|litres)\s*\/\s*kg$/iu,
    { dimension: 'volume', denominator: 'kg', toBase: 1 },
  ],
  [/^m(?:l|L)\s*\/\s*kg$/u, { dimension: 'volume', denominator: 'kg', toBase: 0.001 }],
  /* mass, base = milligrams */
  [/^mg$/iu, { dimension: 'mass', denominator: null, toBase: 1 }],
  [/^g$/u, { dimension: 'mass', denominator: null, toBase: 1000 }],
  [/^(?:mcg|µg|ug)$/iu, { dimension: 'mass', denominator: null, toBase: 0.001 }],
  [/^mg\s*\/\s*kg$/iu, { dimension: 'mass', denominator: 'kg', toBase: 1 }],
  [/^mg\s*\/\s*m2$/iu, { dimension: 'mass', denominator: 'm2', toBase: 1 }],
  /* fraction, base = percent */
  [/^%$/u, { dimension: 'fraction', denominator: null, toBase: 1 }],
  [/^fraction$/iu, { dimension: 'fraction', denominator: null, toBase: 100 }],
]

/**
 * The unit a printed reading ends in, or null when none is legible.
 *
 * Read from the end of the string, because that is where a printed quantity puts it. A reading whose
 * unit cannot be read is not guessed at: it becomes `insufficient_context`, which is a state a
 * reviewer can act on, rather than a comparison that looks decided.
 */
export function resolvePrintedUnit(display: string): ResolvedUnit | null {
  const trimmed = display.trim()
  if (/%\s*$/u.test(trimmed)) return UNITS.find(([pattern]) => pattern.test('%'))?.[1] ?? null
  const match = /([A-Za-zµ]+(?:\s*\/\s*[A-Za-z0-9]+)?)\s*$/u.exec(trimmed)
  if (!match) return null
  const token = match[1]!.replace(/\s+/gu, '')
  for (const [pattern, resolved] of UNITS) if (pattern.test(token)) return resolved
  return null
}

/** Compares two printed readings of the same field. Never selects a winner. */
export function compareReadings(leftDisplay: string, rightDisplay: string): ReadingComparison {
  const leftUnit = resolvePrintedUnit(leftDisplay)
  const rightUnit = resolvePrintedUnit(rightDisplay)
  const leftSpan = printedSpan(leftDisplay)
  const rightSpan = printedSpan(rightDisplay)

  if (!leftSpan || !rightSpan || !leftUnit || !rightUnit) {
    return { state: 'insufficient_context', reason: 'CONTEXT_MISSING' }
  }
  if (leftUnit.dimension !== rightUnit.dimension) {
    return { state: 'not_comparable', reason: 'UNIT_DIMENSION_MISMATCH' }
  }
  if (leftUnit.denominator !== rightUnit.denominator) {
    /*
     * The melphalan case. Same dimension, one normalised by body weight and one not. Converting
     * between them needs a weight no source printed, so the honest answer is that these two readings
     * cannot be compared — not that they disagree, and not that they agree.
     */
    return { state: 'not_comparable', reason: 'DENOMINATOR_MISMATCH' }
  }

  const left = { low: leftSpan.low * leftUnit.toBase, high: leftSpan.high * leftUnit.toBase }
  const right = { low: rightSpan.low * rightUnit.toBase, high: rightSpan.high * rightUnit.toBase }
  const disjoint = left.high < right.low || right.high < left.low
  return disjoint
    ? { state: 'differ', reason: 'COMPATIBLE_VALUES_DISJOINT' }
    : { state: 'agree', reason: 'COMPATIBLE_VALUES_OVERLAP' }
}

/**
 * The state of a whole field, from every pairwise comparison of its readings.
 *
 * `differ` wins over everything, because one genuine disagreement is the finding and must not be
 * hidden by other readings being easier to compare. Below that, a field where something could not be
 * compared is reported as such rather than as agreement, since "we could not tell" and "they agree"
 * are different facts and only one of them is reassuring.
 */
export function compareFieldReadings(displays: readonly string[]): {
  state: ReadingComparisonState
  reasons: ReadingComparisonReason[]
} {
  const reasons = new Set<ReadingComparisonReason>()
  let sawDiffer = false
  let sawNotComparable = false
  let sawInsufficient = false
  let sawAgree = false

  for (let a = 0; a < displays.length; a += 1) {
    for (let b = a + 1; b < displays.length; b += 1) {
      const { state, reason } = compareReadings(displays[a]!, displays[b]!)
      reasons.add(reason)
      if (state === 'differ') sawDiffer = true
      else if (state === 'not_comparable') sawNotComparable = true
      else if (state === 'insufficient_context') sawInsufficient = true
      else sawAgree = true
    }
  }

  const ordered = [...reasons].sort()
  if (sawDiffer) return { state: 'differ', reasons: ordered }
  if (sawNotComparable) return { state: 'not_comparable', reasons: ordered }
  if (sawInsufficient) return { state: 'insufficient_context', reasons: ordered }
  if (sawAgree) return { state: 'agree', reasons: ordered }
  return { state: 'insufficient_context', reasons: ['CONTEXT_MISSING'] }
}
