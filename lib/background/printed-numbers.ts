/**
 * Numbers as documents print them, defined once.
 *
 * This file exists because the same defect appeared five times in five hand-written regexes.
 *
 * Elacestrant's label reads "the estimated apparent volume of distribution is 5,800 L". The
 * extraction pattern matched `\d+(?:\.\d+)?`, which cannot cross a thousands separator, so it began
 * matching after one and recorded 800 L. The engine's excerpt check passed it, because "800" is a
 * substring of "5800" once separators are stripped. The molecular-weight pattern failed the other
 * way round — `\d{1,3}(?:,\d{3})*` matches happily with no comma groups at all, so it took the
 * first three digits of an unseparated "1355.38" and recorded vitamin B12 as weighing 135 g/mol.
 * 107 records carried a number an order of magnitude wrong, each under a correct sentence that
 * appeared to prove it.
 *
 * Fixing the two patterns would have left three more copies carrying the same bug: the freshness
 * loop's drift check, the cross-source consensus span, and the exposure-timeline axis. The
 * duplication was the defect; the regexes were only where it surfaced.
 *
 * Two rules hold everywhere here:
 *
 * 1. A number is read whole, separators included. The separated branch requires at least one comma
 *    group so it cannot half-match an unseparated number, and it is tried first so it cannot be
 *    pre-empted by the plain branch.
 * 2. Numbers are compared BY VALUE, never as substrings. "800" must not match inside "5,800";
 *    "0.5" must still match "0.50", because the same number written two ways is not the failure
 *    being guarded against.
 */

/**
 * A number as a document prints it. Exported as a pattern source so callers can compose it into a
 * larger expression without redefining it.
 *
 * ANGLOPHONE CONVENTION ONLY, and deliberately so. Every source this corpus reads — the openFDA
 * label archive, the CMS pricing file, the NIH supplement database — writes a comma as a thousands
 * separator and a full stop as a decimal point. A European label writing "5,8 mg" means five point
 * eight, and this pattern would read it as five: the separated branch needs three digits after the
 * comma, so "5,8" falls through to the plain branch and stops at the comma.
 *
 * That is a real hazard for any future source from a jurisdiction using the other convention — EMA
 * product information, Health Canada's French-language records. Such a source needs its numbers
 * normalised at the point of ingestion, where the convention is known, rather than guessed at here,
 * where it is not. Nothing currently reaching this function is affected.
 */
export const PRINTED_NUMBER = String.raw`\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?`

/** Every printed number in a string, as written. */
const PRINTED_NUMBER_GLOBAL = new RegExp(PRINTED_NUMBER, 'gu')

/**
 * Removes thousands separators from whole separated numbers and leaves every other comma alone.
 *
 * The looser rule — strip any comma followed by three digits — corrupts anything comma-delimited.
 * On a pricing row ending ",43386028001,221.72208" it deleted the field separator and glued an
 * eleven-digit product code onto the price, so the price stopped existing as a number at all.
 */
export function withoutThousandsSeparators(text: string): string {
  return text.replace(/\b\d{1,3}(?:,\d{3})+\b/gu, (match) => match.replace(/,/gu, ''))
}

/** Every number a string states, in order, as numbers. */
export function numbersIn(text: string): number[] {
  const found: number[] = []
  for (const match of text.matchAll(PRINTED_NUMBER_GLOBAL)) {
    const value = Number(match[0].replace(/,/gu, ''))
    if (Number.isFinite(value)) found.push(value)
  }
  return found
}

/** The first number a string states, or undefined when it states none. */
export function firstNumberIn(text: string): number | undefined {
  return numbersIn(text)[0]
}

/**
 * Whether a string states a given number AS A NUMBER.
 *
 * Value equality, not substring containment. This is the check that turns a silently wrong record
 * into a rejected one.
 */
export function statesNumber(text: string, wanted: number): boolean {
  if (!Number.isFinite(wanted)) return false
  return numbersIn(text).some((value) => value === wanted)
}

/**
 * The span a printed range covers, e.g. "0.04 to 0.05 L/kg" or "5,800 L".
 *
 * Returns null when the string states no number, so a caller can tell "no span" from "a span of
 * zero" — a distinction that decides whether two recorded readings are reported as disagreeing.
 */
export function printedSpan(text: string): { low: number; high: number } | null {
  const numbers = numbersIn(text)
  if (numbers.length === 0) return null
  return { low: Math.min(...numbers), high: Math.max(...numbers) }
}
