/**
 * The two ways a medicine name is normalized, and why they must stay different.
 *
 * CONTENT matching answers "which published label is about this medicine", and for that a salt form
 * is noise: a record filed under metoprolol should find a label headed "metoprolol tartrate".
 *
 * IDENTITY answers "what substance is this", and for that a salt form is the whole point. Barium
 * sulfate is an insoluble radiocontrast agent and barium acetate is a soluble salt; collapsing both
 * to "barium" hands them the same substance identifier and the same recorded facts.
 *
 * Both lived as copies inside three build scripts and a Python indexer, and the copies drifted:
 * "ATORVASTATIN CALCIUM" and "ATORVASTATIN CALCIUM TRIHYDRATE" on one label normalized to two
 * different strings, so Lipitor was counted as a combination product and lost both its aliases and
 * its substance data. 405 labels were miscounted that way. One definition, imported everywhere,
 * is the fix.
 *
 * `scripts/background/index-openfda-labels.py` mirrors `SALT_AND_FORM_WORDS` and must be changed
 * with it.
 */

/**
 * Words that name a salt, ester, hydrate or dosage form rather than the substance itself.
 *
 * Deliberately absent: `bicarbonate`, `carbonate`, `chloride` and `oxide`. Each is a genuine active
 * ingredient in real products — sodium bicarbonate in the omeprazole combination, calcium carbonate
 * as an antacid, zinc oxide as a sunscreen active — and stripping them would collapse a real
 * two-ingredient product into one of its ingredients. That is the opposite mistake and the worse
 * one, because it invents a single-substance product that nobody sells.
 */
const SALT_AND_FORM_WORDS =
  /\b(?:hydrochloride|hcl|sodium|potassium|calcium|sulfate|sulphate|tartrate|maleate|mesylate|besylate|fumarate|succinate|citrate|acetate|phosphate|bitartrate|dihydrate|monohydrate|anhydrous|micronized|usp|injection|tablets?|capsules?|oral|solution|suspension|cream|ointment|gel|spray|trihydrate|hemihydrate|pentahydrate|sesquihydrate|hydrate|hydrous|hydrobromide|hbr|monosodium|disodium|dipotassium|tosylate|edisylate|isethionate|napsylate|xinafoate|pamoate|embonate|hyclate|meglumine|dimeglumine|tromethamine|trometamol)\b/gu

const PARENTHETICAL = /\([^)]*\)/gu
const NON_ALPHANUMERIC = /[^a-z0-9]+/gu

/**
 * Identity form. Keeps every salt and ester word, because they distinguish substances that behave
 * differently. Use this to decide what something IS.
 */
export function normalizeIdentityName(value: string): string {
  return value.toLowerCase().replace(PARENTHETICAL, ' ').replace(NON_ALPHANUMERIC, ' ').trim()
}

/**
 * Content-matching form. Strips salt, ester and dosage-form words so a record finds the labels
 * written about it. Use this to decide what a document is ABOUT, never what something is.
 */
export function normalizeContentName(value: string): string {
  return value
    .toLowerCase()
    .replace(PARENTHETICAL, ' ')
    .replace(SALT_AND_FORM_WORDS, ' ')
    .replace(NON_ALPHANUMERIC, ' ')
    .trim()
}

/**
 * Every name a printed title offers, including the ones normalization throws away.
 *
 * `normalizeIdentityName` and `normalizeContentName` both delete parentheticals, which is right
 * when the bracket holds a salt form or a qualifier and wrong when it holds the answer. RNAWiki's
 * titles for controlled substances are written as "Kratom (Mitragyna speciosa) and Mitragynine" and
 * "Heroin (Diamorphine, Diacetylmorphine)" — the bracket carries the binomial a taxonomy could
 * match and the chemical name a compound database could. Discarding it left those rows matching
 * nothing at all.
 *
 * Returns the printed name first, then each alternative it contains, longest first so a caller
 * trying them in order meets the most specific name before the most general. Nothing is invented:
 * every string returned is a substring of what was printed.
 */
export function alternativeNames(printed: string): string[] {
  const found: string[] = [printed]
  const outside = printed.replace(/\([^)]*\)/gu, ' ')
  const inside = [...printed.matchAll(/\(([^)]*)\)/gu)].map((match) => match[1] ?? '')

  const pieces: string[] = []
  for (const text of [outside, ...inside]) {
    pieces.push(text)
    // A title may join two names with a conjunction, a comma, a slash or a dash.
    for (const part of text.split(/\s*(?:,|\/|\band\b|—|–)\s*/iu)) pieces.push(part)
  }

  for (const piece of pieces) {
    const cleaned = piece.replace(/\s+/gu, ' ').trim()
    // Three characters is the floor every matcher in this repository uses; a shorter fragment
    // matches too much.
    if (cleaned.length >= 3 && !found.includes(cleaned)) found.push(cleaned)
  }
  return found.sort((left, right) => right.length - left.length)
}

/**
 * How many distinct active substances a set of printed names describes.
 *
 * This is the number the attribution guarantee turns on: a substance-specific claim may only be
 * recorded from a document about exactly one substance. Counting on the content form is what makes
 * one substance spelled two ways count once.
 */
export function distinctSubstanceCount(names: readonly string[]): number {
  const distinct = new Set<string>()
  for (const name of names) {
    const key = normalizeContentName(name)
    if (key.length > 0) distinct.add(key)
  }
  return distinct.size
}
