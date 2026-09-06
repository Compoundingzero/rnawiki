/**
 * The jurisdiction map — `docs/specs/phase4-generators.md` §2.
 *
 * A register, a data file or a curated record names its jurisdiction in its own words. Those
 * strings are mapped here, once, and nowhere else, so that one page and one hub cannot disagree
 * about what "GB" or "Japan (PMDA)" means. A string this table does not carry is not dropped and
 * not guessed at: `resolveJurisdiction` returns `null`, the caller renders the row under "Other
 * registers" with the source's own string, and the corpus-scale builder
 * (`scripts/revamp/build_blocks.py`) records it in `data/revamp/jurisdiction-unmapped.csv`.
 *
 * The Python builder holds the same table. `tests/unit/corpus-jurisdictions.test.ts` reads this
 * file and `data/revamp/blocks/jurisdiction-map.json`, which the builder writes from its own
 * table, and fails if the two ever differ.
 */

export const JURISDICTION_CODES = ['SG', 'US', 'AU', 'UK', 'EU', 'JP', 'CA'] as const

export type JurisdictionCode = (typeof JURISDICTION_CODES)[number]

/** Reader-facing label. Never a code, never an abbreviation. */
export const JURISDICTION_LABELS: Record<JurisdictionCode, string> = {
  SG: 'Singapore',
  US: 'United States',
  AU: 'Australia',
  UK: 'United Kingdom',
  EU: 'European Union',
  JP: 'Japan',
  CA: 'Canada',
}

/**
 * Page order, fixed by §2: Singapore first because the corpus is anchored in Singapore, then the
 * registers by how much of the corpus they cover, then any "Other registers" rows in source order.
 */
export const JURISDICTION_ORDER: readonly JurisdictionCode[] = [
  'SG',
  'US',
  'AU',
  'UK',
  'EU',
  'JP',
  'CA',
]

/**
 * Source string → jurisdiction. Keys are compared lower-cased with runs of whitespace collapsed.
 * Every entry is a string some ingested source actually writes.
 */
export const JURISDICTION_SOURCE_STRINGS: Record<string, JurisdictionCode> = {
  sg: 'SG',
  singapore: 'SG',
  hsa: 'SG',
  'hsa listing': 'SG',
  'hsa listing of registered therapeutic products': 'SG',
  'moh sdl': 'SG',
  'moh maf': 'SG',
  'mda schedules': 'SG',
  'misuse of drugs act': 'SG',
  'poisons act schedules': 'SG',
  'poisons act': 'SG',
  'poisons rules': 'SG',

  us: 'US',
  usa: 'US',
  'united states': 'US',
  'drugs@fda': 'US',
  'orange book': 'US',
  'fda orange book': 'US',
  'purple book': 'US',
  'openfda ndc': 'US',
  fda: 'US',

  au: 'AU',
  australia: 'AU',
  susmp: 'AU',
  'poisons standard': 'AU',
  tga: 'AU',
  artg: 'AU',

  uk: 'UK',
  gb: 'UK',
  'united kingdom': 'UK',
  'great britain': 'UK',
  mhra: 'UK',

  eu: 'EU',
  ema: 'EU',
  europe: 'EU',
  'european union': 'EU',
  'european medicines agency': 'EU',

  jp: 'JP',
  japan: 'JP',
  pmda: 'JP',
  'japan (pmda)': 'JP',

  ca: 'CA',
  canada: 'CA',
  'health canada': 'CA',
  'health canada dpd': 'CA',
}

export function resolveJurisdiction(
  sourceString: string | null | undefined,
): JurisdictionCode | null {
  if (!sourceString) return null
  const normalised = sourceString.trim().toLowerCase().replace(/\s+/g, ' ')
  return JURISDICTION_SOURCE_STRINGS[normalised] ?? null
}
