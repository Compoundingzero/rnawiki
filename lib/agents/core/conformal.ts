/**
 * Split-conformal p-values for flagging unusual records.
 *
 * The problem with an anomaly score is that nobody can act on it. A score of 3.7 means nothing on
 * its own, and a threshold chosen to make the queue a comfortable length is a threshold chosen to
 * produce a comfortable answer. Conformal calibration fixes that: given a calibration set assumed
 * to be ordinary, it converts any score into a p-value that is super-uniform under exchangeability
 * — P(p <= t) <= t — for any score function at all, with no distributional assumption. Combined
 * with Benjamini-Hochberg it turns "here are the scores" into "here are 37 records, of which about
 * five are expected to be false alarms", which is a claim a reviewer can plan around.
 *
 * Two properties matter as much as the guarantee:
 *
 * A p-value is a statement about a RECORD, not about a medicine. "This recorded half-life is
 * unusual among the recorded half-lives of its peer group" is a fact about the corpus. "This
 * medicine's half-life is wrong" is a medical claim, and nothing here licenses it. A flagged value
 * read faithfully from a label is very often correct and merely unusual, which is why the output
 * of this module can only ever route a human to look.
 *
 * The resolution limit is real and reported rather than hidden: with n calibration points the
 * smallest achievable p-value is 1/(n+1), so a small peer group cannot produce a confident flag no
 * matter how extreme the value.
 */

import { benjaminiHochberg } from './statistics'

export interface ConformalScored<T> {
  item: T
  /** Higher means more unusual. Any function may be used; calibration handles the rest. */
  score: number
}

export interface ConformalFlag<T> {
  item: T
  score: number
  /** Super-uniform under exchangeability: P(p <= t) <= t when the item is ordinary. */
  pValue: number
  /** Calibration points available to the group this item was scored against. */
  calibrationSize: number
  /** Smallest p-value this group could have produced, i.e. 1/(n+1). */
  resolutionLimit: number
  group: string
}

export interface ConformalResult<T> {
  flagged: Array<ConformalFlag<T>>
  all: Array<ConformalFlag<T>>
  /** Threshold the flag set was selected at. */
  alpha: number
  /** Groups too small to produce any p-value below alpha, and therefore never flagged. */
  underpoweredGroups: Array<{ group: string; size: number; resolutionLimit: number }>
  /**
   * How many of the flagged items would be expected to look this unusual purely by chance if every
   * recorded value were ordinary. This is the number a reviewer needs in order to plan, and it is
   * reported instead of a false-discovery rate because FDR control is not reachable here — see
   * `falseDiscoveryControl`.
   */
  expectedFalseFlags: number
  testCount: number
  /**
   * Whether a Benjamini-Hochberg selection at `alpha` was achievable, and if not, why.
   *
   * Leave-one-out conformal in a group of n cannot emit a p-value below 1/(n+1), while BH over m
   * tests requires the smallest to fall below alpha/m. With peer groups in the tens and hundreds
   * of tests, the second is far below the first, so BH would reject nothing no matter how wrong a
   * value was. Saying so is more useful than reporting an empty queue as a clean corpus.
   */
  falseDiscoveryControl: { achievable: boolean; explanation: string; bhSelected: number }
}

/**
 * The smallest calibration set that can produce a p-value at or below alpha. Below this a group is
 * structurally incapable of a flag, which is reported rather than left to look like a clean bill.
 */
export function minimumCalibrationSize(alpha: number): number {
  return Math.ceil(1 / alpha) - 1
}

/**
 * Mondrian (group-conditional) split-conformal p-values.
 *
 * Calibrating within a peer group is the whole point for this corpus. A three-hour half-life is
 * unremarkable across all recorded half-lives and conspicuous inside a group where every other
 * member is measured in days; a single global calibration would surface neither. Groups are
 * expected to be disjoint — each item is scored against the group it belongs to.
 */
export function mondrianConformal<T>(
  scored: ReadonlyArray<ConformalScored<T>>,
  groupOf: (item: T) => string,
  alpha: number,
): ConformalResult<T> {
  const byGroup = new Map<string, Array<ConformalScored<T>>>()
  for (const entry of scored) {
    if (!Number.isFinite(entry.score)) continue
    const group = groupOf(entry.item)
    byGroup.set(group, [...(byGroup.get(group) ?? []), entry])
  }

  const all: Array<ConformalFlag<T>> = []
  const underpoweredGroups: ConformalResult<T>['underpoweredGroups'] = []
  const required = minimumCalibrationSize(alpha)

  for (const [group, members] of byGroup) {
    // Every other member of the group serves as this member's calibration set. Leave-one-out is
    // used rather than a held-out split because peer groups here are small and splitting one in
    // half would put most groups below the resolution limit for no gain.
    const calibrationSize = members.length - 1
    const resolutionLimit = 1 / (calibrationSize + 1)
    if (calibrationSize < required) {
      underpoweredGroups.push({ group, size: members.length, resolutionLimit })
    }
    for (const target of members) {
      let atLeastAsExtreme = 0
      for (const other of members) {
        if (other === target) continue
        if (other.score >= target.score) atLeastAsExtreme += 1
      }
      all.push({
        item: target.item,
        score: target.score,
        // The +1 in numerator and denominator is what makes the p-value valid rather than
        // anti-conservative; dropping it is the standard way this guarantee gets quietly lost.
        pValue: (1 + atLeastAsExtreme) / (calibrationSize + 1),
        calibrationSize,
        resolutionLimit,
        group,
      })
    }
  }

  // BH is still computed, because when the corpus grows enough for it to bite it is the better
  // selection and the difference should be visible rather than assumed.
  const bhSelected = benjaminiHochberg(
    all.map((entry) => entry.pValue),
    alpha,
  ).length
  const smallestAchievable = all.reduce(
    (best, entry) => Math.min(best, entry.resolutionLimit),
    Infinity,
  )
  const bhRequirement = all.length > 0 ? alpha / all.length : 0
  const achievable = Number.isFinite(smallestAchievable) && smallestAchievable <= bhRequirement

  const flagged = all
    .filter((entry) => entry.pValue <= alpha)
    .sort((left, right) => left.pValue - right.pValue || right.score - left.score)

  return {
    flagged,
    all,
    alpha,
    underpoweredGroups,
    testCount: all.length,
    expectedFalseFlags: all.length * alpha,
    falseDiscoveryControl: {
      achievable,
      bhSelected,
      explanation: achievable
        ? `Benjamini-Hochberg at ${alpha} is achievable across ${all.length} tests and selects ${bhSelected}.`
        : `Benjamini-Hochberg at ${alpha} would require a p-value at or below ${bhRequirement.toExponential(2)} across ${all.length} tests, but the largest peer group here cannot produce one below ${Number.isFinite(smallestAchievable) ? smallestAchievable.toFixed(4) : 'any value'}. Items are therefore selected at an uncorrected threshold and the expected number of chance flags is reported instead.`,
    },
  }
}

/**
 * Robust one-dimensional nonconformity on the log scale.
 *
 * Log first because the quantities are right-skewed over orders of magnitude; median and MAD
 * because the sample being summarised contains the very errors being looked for. Values at or
 * below zero cannot be log-transformed and are scored as maximally unusual rather than dropped —
 * a non-positive half-life is exactly the kind of record this is for.
 */
export function logScaleNonconformity(values: readonly number[]): (value: number) => number {
  const logs = values.filter((value) => value > 0).map((value) => Math.log(value))
  if (logs.length === 0) return () => 0
  const sorted = [...logs].sort((left, right) => left - right)
  const centre = sorted[Math.floor(sorted.length / 2)]!
  const deviations = logs.map((value) => Math.abs(value - centre)).sort((a, b) => a - b)
  const scale = (deviations[Math.floor(deviations.length / 2)] ?? 0) * 1.4826
  return (value: number) => {
    if (!(value > 0)) return Number.MAX_SAFE_INTEGER
    // A degenerate group where every recorded value is identical has no scale; anything different
    // from the common value is unusual, anything equal to it is not.
    if (scale === 0) return Math.log(value) === centre ? 0 : Number.MAX_SAFE_INTEGER
    return Math.abs(Math.log(value) - centre) / scale
  }
}
