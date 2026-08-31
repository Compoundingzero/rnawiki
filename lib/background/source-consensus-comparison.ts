import {
  compareFieldReadings,
  type ReadingComparisonReason,
  type ReadingComparisonState,
} from './reading-comparison'

/**
 * The deterministic label parser extracts a value and its source sentence, but does not yet
 * extract population, formulation, route, fed state, dose, or study design into comparable fields.
 * Keeping that limitation in the value is safer than giving every reading the same generic context
 * and then treating unlike source sentences as like-for-like measurements.
 */
export const STRUCTURALLY_UNEXTRACTED_POPULATION_CONTEXT =
  'Unknown: population and formulation context were not structurally extracted from this source sentence.'

export interface ConsensusComparableReading {
  display: string
  unit?: string
  populationContext: string
}

export interface ConsensusComparison {
  state: ReadingComparisonState
  reasons: ReadingComparisonReason[]
}

/** Stable identity for one printed reading, excluding its population context. */
export function normalizedConsensusPrintedReading(
  display: string,
  unit: string | undefined,
): string {
  const normalized = display
    .toLowerCase()
    .replace(/–|—|−/gu, '-')
    .replace(/\s*(?:to|-)\s*/gu, '-')
    .replace(/\s+/gu, '')
    .replace(/hours?|hrs?\b/gu, 'h')
  return `${normalized}|${unit?.trim().toLocaleLowerCase('en-US') ?? ''}`
}

function normalizedContext(value: string): string {
  return value.trim().replace(/\s+/gu, ' ').toLocaleLowerCase('en-US')
}

/** Fail closed for both the current sentinel and legacy prose that did not extract context. */
export function isStructuredPopulationContext(value: string): boolean {
  const normalized = normalizedContext(value)
  if (!normalized || normalized === 'unknown') return false
  if (normalized.includes('not structurally extracted')) return false
  if (normalized === 'as stated in the label sentence recorded below') return false
  return true
}

/**
 * Final source-consensus classification, after the unit-aware printed-value comparison.
 *
 * - A base unit or denominator mismatch remains `not_comparable`.
 * - One normalized printed reading may be `agree`: this means only that sources print the same
 *   reading, not that their unextracted clinical contexts are equivalent.
 * - Distinct otherwise-comparable readings require the same non-placeholder structured context.
 *   Without it, overlap and disjointness are both `insufficient_context`.
 */
export function compareConsensusReadings(
  readings: readonly ConsensusComparableReading[],
): ConsensusComparison {
  const base = compareFieldReadings(readings.map((reading) => reading.display))
  if (base.state === 'not_comparable' || base.state === 'insufficient_context') return base

  const printedReadings = new Set(
    readings.map((reading) => normalizedConsensusPrintedReading(reading.display, reading.unit)),
  )
  if (printedReadings.size === 1) {
    return { state: 'agree', reasons: ['COMPATIBLE_VALUES_OVERLAP'] }
  }

  const contexts = readings.map((reading) => normalizedContext(reading.populationContext))
  const hasComparableStructuredContext =
    contexts.length > 0 &&
    readings.every((reading) => isStructuredPopulationContext(reading.populationContext)) &&
    new Set(contexts).size === 1

  if (!hasComparableStructuredContext) {
    return { state: 'insufficient_context', reasons: ['STRUCTURED_CONTEXT_MISSING'] }
  }
  return base
}
