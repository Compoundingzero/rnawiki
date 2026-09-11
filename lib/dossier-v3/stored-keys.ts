/**
 * Ordinary words for stored keys, and the fixed reader sentences the Phase 0 trust patches paint.
 *
 * The live creatine page printed `b_halfLifeRecorded` under "Show the evidence": a derived-seed
 * test id (scripts/corpus-20k/derived/compute.py) had been copied into a revealed row as its
 * label. Nothing in the render path translated it, so a storage key reached a reader. The
 * generator now routes every seed key through `humanizeStoredKey`, and the copy contract's
 * `findInternalKeys` runs over the result in tests.
 */

/** The derived-seed tests, in the words a reader can read. */
export const SEED_TEST_LABELS: Readonly<Record<string, string>> = {
  a_biomarkerMeasuredInHumans: 'a biomarker measured in people',
  b_halfLifeRecorded: 'a recorded half-life',
  c_smallHumanTrialReportedEffect: 'a small human trial reporting an effect',
  d_oralRouteRecorded: 'a recorded oral route',
  e_doseResponseRecorded: 'a recorded dose-response',
}

/** Stored keys whose contents are pipeline bookkeeping and never a reader-facing row. */
export const SEED_KEYS_NEVER_RENDERED: ReadonlySet<string> = new Set(['tests', 'sources', 'source'])

/** Stored keys that head a list of humanised test ids rather than values. */
export const SEED_TEST_LIST_LABELS: Readonly<Record<string, string>> = {
  missing: 'Not recorded for this substance',
  notDeterminable: 'Could not be determined from the record',
  held: 'Recorded for this substance',
}

/**
 * `halfLifeRecorded` → "half life recorded"; `b_halfLifeRecorded` → "a recorded half-life";
 * `trial_count` → "trial count"; `NOT_MEASURED` → "not measured". A value that is already words
 * is returned unchanged.
 */
export function humanizeStoredKey(key: string): string {
  const known = SEED_TEST_LABELS[key]
  if (known) return known
  const listLabel = SEED_TEST_LIST_LABELS[key]
  if (listLabel) return listLabel
  if (/^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/.test(key)) return key.toLowerCase().replace(/_/g, ' ')
  return key
    .replace(/^[a-e]_/, '')
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .trim()
}

/**
 * The sentences that sit above any spontaneous-report count, in this order, every time. They are
 * fixed wording (furniture), so the corpus uniqueness ruler skips them, and they are never
 * shortened for space.
 */
export const SPONTANEOUS_REPORT_FRAMING: readonly string[] = [
  'These are reports people sent to a regulator. They do not show the medicine caused the reaction.',
  'Nobody counted how many people took the medicine and reported nothing.',
  'The same event can be reported more than once, and many reports are incomplete.',
  'News coverage, lawsuits and new warnings change how often people report.',
  'A count is not a rate and not a risk.',
]

/**
 * The qualification a registered-study count carries until trial roles have been classified for
 * the record (lib/dossier-v3/trial-roles.ts). Fixed wording; furniture.
 */
export function registryCountQualification(name: string): string {
  return `These counts include studies where ${name} was a comparison treatment, a background treatment or an exposure in an observational study, and the longest window may be a planned end date. Trial roles have not yet been classified for this record.`
}

/** The interaction absence line, verbatim (Operating Rule 9 plus the mission's rule that absence is not safety). */
export function interactionAbsenceLine(registers: string, date: string): string {
  return `No interaction found in ${registers} as of ${date}. Not finding one is not the same as showing there is none.`
}
