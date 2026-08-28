/**
 * Deterministic derivations over recorded background values. Authors store the output of these
 * functions beside the recorded inputs; the background engine recomputes each derivation and
 * fails validation on any mismatch. Nothing here interprets medicine — these are arithmetic
 * restatements of recorded numbers in plain language.
 */

import type { RecordedCostEntry } from './types'

/** About five half-lives to reach steady state; expressed in the friendliest whole unit. */
export function steadyStateNoteFromHalfLifeHours(halfLifeHours: number): string {
  const hoursToSteadyState = halfLifeHours * 5
  if (hoursToSteadyState < 48) {
    const hours = Math.round(hoursToSteadyState)
    return `Levels settle after about ${hours} hour${hours === 1 ? '' : 's'} of regular use (about five half-lives).`
  }
  const days = Math.round(hoursToSteadyState / 24)
  if (days < 14) {
    return `Levels settle after about ${days} day${days === 1 ? '' : 's'} of regular use (about five half-lives).`
  }
  const weeks = Math.round(days / 7)
  return `Levels settle after about ${weeks} week${weeks === 1 ? '' : 's'} of regular use (about five half-lives).`
}

function roundMoney(value: number): number {
  return value >= 100 ? Math.round(value) : Math.round(value * 100) / 100
}

/**
 * Normalizes a recorded amount to USD using the recorded FX rate. USD entries need no rate; a
 * non-USD entry without a recorded rate has no normalization at all rather than a guessed one.
 */
export function normalizedMonthlyUsdFromEntry(
  entry: Pick<RecordedCostEntry, 'currency' | 'amountLow' | 'amountHigh'> & {
    fxRate?: number
  },
): { low: number; high?: number } | null {
  const rate = entry.currency === 'USD' ? 1 : entry.fxRate
  if (!rate || rate <= 0)
    return entry.currency === 'USD'
      ? {
          low: roundMoney(entry.amountLow),
          ...(entry.amountHigh !== undefined ? { high: roundMoney(entry.amountHigh) } : {}),
        }
      : null
  return {
    low: roundMoney(entry.amountLow * rate),
    ...(entry.amountHigh !== undefined ? { high: roundMoney(entry.amountHigh * rate) } : {}),
  }
}
