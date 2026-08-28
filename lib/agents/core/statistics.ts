/**
 * Robust statistics for the dataset agents.
 *
 * Two properties of this corpus dictate the choices here. Pharmacokinetic quantities are
 * right-skewed over orders of magnitude — recorded half-lives run from 0.4 hours to 561 — so
 * summaries are computed on the log scale where the distribution is roughly symmetric. And the
 * values being summarised are the same values being screened for error, so any estimator whose
 * breakdown point is zero would be corrupted by the very outliers it is meant to surface. Mean and
 * standard deviation are therefore not used anywhere a robust alternative exists.
 */

/** Sorted copy, ascending, with non-finite values removed. */
export function cleanSorted(values: readonly number[]): number[] {
  return values.filter((value) => Number.isFinite(value)).sort((left, right) => left - right)
}

/** Type 7 quantile (the R and NumPy default), on an already-sorted array. */
export function quantileSorted(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return Number.NaN
  if (sorted.length === 1) return sorted[0]!
  const position = (sorted.length - 1) * Math.min(Math.max(p, 0), 1)
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  if (lower === upper) return sorted[lower]!
  return sorted[lower]! + (position - lower) * (sorted[upper]! - sorted[lower]!)
}

export function median(values: readonly number[]): number {
  return quantileSorted(cleanSorted(values), 0.5)
}

/**
 * Median absolute deviation, scaled so that it estimates the standard deviation of a normal
 * distribution. Its breakdown point is 50%: half the data must be corrupt before the estimate is.
 */
export const MAD_TO_SIGMA = 1.4826

export function medianAbsoluteDeviation(values: readonly number[]): number {
  const sorted = cleanSorted(values)
  if (sorted.length === 0) return Number.NaN
  const centre = quantileSorted(sorted, 0.5)
  const deviations = cleanSorted(sorted.map((value) => Math.abs(value - centre)))
  return quantileSorted(deviations, 0.5) * MAD_TO_SIGMA
}

export interface RobustSummary {
  count: number
  min: number
  p25: number
  median: number
  p75: number
  max: number
  /** MAD-based scale estimate, on the same scale as the inputs. */
  robustScale: number
}

export function robustSummary(values: readonly number[]): RobustSummary | null {
  const sorted = cleanSorted(values)
  if (sorted.length === 0) return null
  return {
    count: sorted.length,
    min: sorted[0]!,
    p25: quantileSorted(sorted, 0.25),
    median: quantileSorted(sorted, 0.5),
    p75: quantileSorted(sorted, 0.75),
    max: sorted[sorted.length - 1]!,
    robustScale: medianAbsoluteDeviation(sorted),
  }
}

/**
 * Benjamini-Hochberg step-up procedure.
 *
 * Returns the indices of the hypotheses rejected while holding the false discovery rate at or
 * below `alpha`. This is what lets a review queue be described honestly: not "here are 400 scores"
 * but "here are 37 items, of which about 5 are expected to be false alarms."
 */
export function benjaminiHochberg(pValues: readonly number[], alpha: number): number[] {
  const ordered = pValues
    .map((p, index) => ({ p, index }))
    .filter((entry) => Number.isFinite(entry.p))
    .sort((left, right) => left.p - right.p)
  const total = ordered.length
  if (total === 0) return []
  let cutoff = -1
  for (let rank = 0; rank < total; rank += 1) {
    if (ordered[rank]!.p <= ((rank + 1) / total) * alpha) cutoff = rank
  }
  if (cutoff < 0) return []
  return ordered.slice(0, cutoff + 1).map((entry) => entry.index)
}

/** Natural log of the gamma function (Lanczos, g=7, n=9). Accurate to ~15 significant digits. */
const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7,
]

export function logGamma(x: number): number {
  if (x < 0.5) {
    // Reflection formula, so the series is only ever evaluated where it converges well.
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x)
  }
  const z = x - 1
  let series = LANCZOS[0]!
  for (let index = 1; index < LANCZOS.length; index += 1) {
    series += LANCZOS[index]! / (z + index)
  }
  const t = z + LANCZOS.length - 1.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(series)
}

export function logChoose(n: number, k: number): number {
  if (k < 0 || k > n) return Number.NEGATIVE_INFINITY
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1)
}

/**
 * Upper-tail hypergeometric probability: P(X >= observed) when drawing `drawn` items from a
 * population of `population` containing `successes` marked items.
 *
 * This is the null model for "these two things share more neighbours than their degrees alone
 * would predict". Without it a co-occurrence count is mostly a restatement of how common each
 * item is, which is how popularity gets reported as discovery.
 */
export function hypergeometricUpperTail(
  observed: number,
  drawn: number,
  successes: number,
  population: number,
): number {
  const highest = Math.min(drawn, successes)
  if (observed > highest) return 0
  const lowest = Math.max(0, drawn + successes - population)
  if (observed <= lowest) return 1
  const denominator = logChoose(population, drawn)
  let total = 0
  for (let count = observed; count <= highest; count += 1) {
    total += Math.exp(
      logChoose(successes, count) + logChoose(population - successes, drawn - count) - denominator,
    )
  }
  return Math.min(1, Math.max(0, total))
}
