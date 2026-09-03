import 'dotenv/config'
import { execFileSync } from 'node:child_process'
import { createReadStream, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { extractBackgroundFromLabel, type LabelArtifact } from '@/lib/background/label-extraction'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import {
  normalizeContentName as normalizeName,
  normalizeIdentityName,
} from '@/lib/background/name-normalization'
import type { MedicineRecordedBackground } from '@/lib/background/types'
import { RECORDED_BACKGROUND } from '../seed-data/background'

/**
 * Builds `extracted`-tier recorded background for the whole medicine corpus from openFDA's bulk
 * label archive.
 *
 * Hand-authoring reached 155 medicines. This reaches every medicine whose name matches a published
 * FDA label, because the parser satisfies the dataset's evidence guarantee by construction: it
 * reads each value out of a label sentence and stores that sentence as the excerpt.
 *
 * Two boundaries are absolute. A curated record is never overwritten — the hand-authored corpus
 * always wins on a slug it already covers. And every extracted envelope must pass the background
 * engine before it is written, so an extraction that produced something structurally wrong is
 * dropped rather than published.
 *
 * Usage:
 *   tsx scripts/background/build-extracted-background.ts <labelIndex.ndjson> [--limit=N] [--retrieved-at=YYYY-MM-DD]
 *
 * The index is produced by scripts/background/index-openfda-labels.py from openFDA's bulk
 * `drug-label-*.json.zip` partitions (https://api.fda.gov/download.json) — one download and one
 * reduction pass, rather than thousands of API calls. The reduction runs in Python because a
 * decompressed partition exceeds the maximum string length a Node process can hold.
 */

export interface MedicineRow {
  slug: string
  name: string
  tradeName?: string
  /** The row's approval status as the ingest classified it; gates the salt/ester fallback. */
  approvalStatus?: string
}

/**
 * Statuses under which a row may fall back to a label filed under a salt, ester or hydrate form.
 *
 * A salt or ester form is a property of a chemical medicine. A botanical, supplement or other
 * non-medicine row never has one, and treating its name as a stem finds the wrong thing: the row
 * "Tea" (the plant) matched "TEA salicylate", where TEA abbreviates triethanolamine. Measured over
 * the corpus, the only fallback matches for non-medicine rows were of that kind.
 */
export const SALT_FORM_FALLBACK_STATUSES: ReadonlySet<string> = new Set([
  'FDA Approved',
  'Accelerated Approval',
  'EMA Approved',
  'Phase 3 Clinical Trial',
  'Phase 2 Investigational',
  'Pre-clinical / Open Source',
  'Off-Label / Compounded',
  'Withdrawn from Market',
])

export interface IndexedLabel {
  setId: string
  /** Distinct active substances the document declares, after salt forms collapse. */
  declaredSubstanceCount?: number
  effectiveTime?: string
  brandNames: string[]
  genericNames: string[]
  /** Active-substance names, which reach salt-form and combination rows the generic name misses. */
  substanceNames?: string[]
  routes: string[]
  unii?: string
  rxcui?: string
  sections: Record<string, string>
  /** Higher is better when several labels share a name. */
  score: number
}

/**
 * An identity index built exclusively from documents that declare exactly one active substance.
 *
 * On such a document the identifier can only refer to that substance, so the mapping is sound
 * without any positional assumption. A name that resolves to more than one identifier across the
 * corpus is dropped rather than guessed: an ambiguous identity is not an identity.
 */
interface SubstanceIdentity {
  unii?: string
  rxcui?: string
  /** The single-substance label that established this identity, cited as the source. */
  setId: string
}

export type IdentityIndex = Map<string, SubstanceIdentity>

/**
 * Which of two labels answering to the same name should supply this medicine's record.
 *
 * A document about one substance wins over a richer document about several, and that ordering
 * matters more than it looks. Every substance-specific module is refused on a multi-substance
 * source, so when a name resolved to a combination label the record came out empty even though a
 * single-substance label for the same name sat in the index beside it. Ranking by section count
 * alone let that happen on every tie: "Actaea Spicata Root" had one label declaring five substances
 * and one declaring one, both scoring 1, and the five-substance one arrived first.
 *
 * 987 rows held a label naming them alone and carried no substance content at all.
 */
function preferred(candidate: IndexedLabel, held: IndexedLabel): boolean {
  const candidateIsSole = candidate.declaredSubstanceCount === 1
  const heldIsSole = held.declaredSubstanceCount === 1
  if (candidateIsSole !== heldIsSole) return candidateIsSole
  return candidate.score > held.score
}

/**
 * Words that may trail a substance name on a single-substance label and still name a form of that
 * same substance: a salt, an ester or other prodrug moiety, or a hydrate.
 *
 * `normalizeContentName` already strips the common salt words (hydrochloride, sodium, acetate,
 * sulfate and so on), so a row filed under "metformin" finds "metformin hydrochloride" directly.
 * This table covers the trailing words that normalization keeps. Every entry occurs as the last
 * token of at least one single-substance label name in the openFDA archive index; the audit in
 * `scripts/inventory/audit-empty-records.ts` lists every trailing token in the index together with
 * the ones this table selects, so the selection can be checked against the archive rather than
 * taken on trust. Misspellings are included only where the archive prints them on a real label.
 *
 * Deliberately absent: oxide, dioxide, hydroxide, peroxide, sulfide and cyanide (bonded compounds,
 * not salts of the stem), acetonide and hexacetonide (a ketal that changes the medicine),
 * antibody-conjugate linkers such as emtansine, vedotin and deruxtecan (a different medicine),
 * and phosphate words (already stripped, and covalent in adenosine diphosphate).
 */
export const SALT_OR_ESTER_SUFFIXES: ReadonlySet<string> = new Set([
  // Counter-ions the content normalizer keeps.
  'chloride',
  'dichloride',
  'dihydrochloride',
  'tetrahydrochloride',
  'bromide',
  'iodide',
  'fluoride',
  'nitrate',
  'mononitrate',
  'dinitrate',
  'nitrite',
  'carbonate',
  'bicarbonate',
  'gluconate',
  'digluconate',
  'lactate',
  'lactobionate',
  'malate',
  'oxalate',
  'salicylate',
  'benzoate',
  'bisulfate',
  'disulfate',
  'hemifumarate',
  'camsylate',
  'esylate',
  'besilate',
  'dimesylate',
  'ditosylate',
  'methylsulfate',
  'mandelate',
  'hippurate',
  'pidolate',
  'sorbate',
  'adipate',
  'glycolate',
  'histidinate',
  'olamine',
  'epolamine',
  'benzathine',
  'erbumine',
  // Esters and other prodrug moieties.
  'diacetate',
  'triacetate',
  'propionate',
  'dipropionate',
  'valerate',
  'butyrate',
  'caproate',
  'decanoate',
  'undecanoate',
  'undecylenate',
  'enanthate',
  'cypionate',
  'oleate',
  'pivalate',
  'ethylsuccinate',
  'etabonate',
  'furoate',
  'medoxomil',
  'mofetil',
  'disoproxil',
  'alafenamide',
  'dipivoxil',
  'proxetil',
  'axetil',
  'cilexetil',
  'etexilate',
  'fosamil',
  'marboxil',
  'medocaril',
  'enacarbil',
  'lauroxil',
  // Hydrates the content normalizer keeps.
  'hexahydrate',
  'heptahydrate',
  'tetrahydrate',
  'octahydrate',
  'nonahydrate',
  'decahydrate',
  'tetradecahydrate',
  'hemipentahydrate',
  // Hydrochloride and chloride as the archive misspells them on real labels.
  'hci',
  'hchloride',
  'hydchloride',
  'hydochloride',
  'hydrochloide',
  'hydrocloride',
  'hyrdochloride',
  'chlloride',
  'chlolride',
  'cloride',
  'flouride',
  'gluonate',
  'succiate',
  'sucinate',
])

/**
 * Stems for which a trailing anion names a different substance, not a form of the stem.
 *
 * "Metformin hydrochloride" is metformin; "sodium chloride" is not sodium. The list is the
 * elemental and simple inorganic cations the ingest normaliser guards in the same way
 * (`scripts/ingest/normalise.ts`), plus the non-metal elements that appear as medicine rows.
 */
export const INORGANIC_STEMS: ReadonlySet<string> = new Set([
  'aluminum',
  'aluminium',
  'ammonium',
  'antimony',
  'arsenic',
  'auric',
  'barium',
  'beryllium',
  'bismuth',
  'boron',
  'cadmium',
  'calcium',
  'cesium',
  'chromic',
  'chromium',
  'cobalt',
  'cobaltic',
  'cobaltous',
  'copper',
  'cupric',
  'cuprous',
  'ferric',
  'ferrous',
  'gallium',
  'germanium',
  'gold',
  'hafnium',
  'indium',
  'iridium',
  'iron',
  'lanthanum',
  'lead',
  'lithic',
  'lithium',
  'magnesium',
  'manganese',
  'mercuric',
  'mercurous',
  'mercury',
  'molybdenum',
  'nickel',
  'nickelous',
  'niobium',
  'osmium',
  'palladium',
  'platinum',
  'plumbous',
  'polonium',
  'potassium',
  'radium',
  'rhenium',
  'rhodium',
  'rubidium',
  'ruthenium',
  'samarium',
  'scandium',
  'selenium',
  'silver',
  'sodium',
  'stannic',
  'stannous',
  'strontium',
  'tantalum',
  'tellurium',
  'thallium',
  'thorium',
  'titanium',
  'tungsten',
  'uranium',
  'vanadium',
  'yttrium',
  'zinc',
  'zirconium',
  // Non-metal elements and simple inorganic stems that are medicine rows.
  'hydrogen',
  'carbon',
  'nitrogen',
  'oxygen',
  'sulfur',
  'sulphur',
  'phosphorus',
  'chlorine',
  'bromine',
  'iodine',
  'fluorine',
  'silicon',
  'helium',
  'neon',
  'argon',
  'krypton',
  'xenon',
  'nitrous',
  'nitric',
])

/** One single-substance label filed under a salt, ester or hydrate form of a stem name. */
export interface FormCandidate<T> {
  /** The trailing word that names the form, e.g. "diacetate". */
  form: string
  /** The full normalized label name, e.g. "ethynodiol diacetate". */
  labelKey: string
  label: T
}

/** Stem name (content-normalized) to the single-substance labels filed under a form of it. */
export type FormIndex<T> = Map<string, FormCandidate<T>[]>

/**
 * Registers a label's names in the form index. Only a label declaring exactly one active
 * substance is registered: on any other label the trailing word may belong to a different
 * ingredient, and a multi-substance label must never stand in for a substance alone.
 */
export function addFormCandidates<T>(
  forms: FormIndex<T>,
  names: readonly string[],
  declaredSubstanceCount: number | undefined,
  label: T,
): void {
  if (declaredSubstanceCount !== 1) return
  for (const name of names) {
    const key = normalizeName(name)
    const tokens = key.split(' ')
    if (tokens.length < 2) continue
    const form = tokens[tokens.length - 1]!
    if (!SALT_OR_ESTER_SUFFIXES.has(form)) continue
    const stem = tokens.slice(0, -1).join(' ')
    if (stem.length < 3) continue
    const list = forms.get(stem) ?? []
    if (list.some((entry) => entry.labelKey === key && entry.label === label)) continue
    list.push({ form, labelKey: key, label })
    forms.set(stem, list)
  }
}

export type FormResolution<T> =
  | { kind: 'MATCHED'; form: string; labelKey: string; label: T }
  /** More than one form has its own single-substance label; choosing between them would be a judgement. */
  | { kind: 'AMBIGUOUS_FORMS'; forms: string[] }
  /** The stem is an element or simple inorganic cation, whose salts are different substances. */
  | { kind: 'INORGANIC_STEM'; forms: string[] }
  | { kind: 'NONE' }

/**
 * Resolves a bare stem name to the single-substance label filed under a form of it.
 *
 * Deterministic and narrow: exactly one form may be on the market alone. When "tenofovir" finds
 * both "tenofovir disoproxil" and "tenofovir alafenamide", the two prodrugs have different
 * pharmacokinetics and picking one for the parent would be a medical judgement, so the result is
 * an explicit ambiguity rather than a label. Among several labels of the one form, `better`
 * decides, which is the caller's own label preference.
 */
export function resolveByForm<T>(
  stemKey: string,
  forms: FormIndex<T>,
  better: (candidate: T, held: T) => boolean,
): FormResolution<T> {
  const candidates = forms.get(stemKey)
  if (!candidates || candidates.length === 0) return { kind: 'NONE' }
  const distinctForms = [...new Set(candidates.map((entry) => entry.form))].sort()
  if (INORGANIC_STEMS.has(stemKey)) return { kind: 'INORGANIC_STEM', forms: distinctForms }
  if (distinctForms.length > 1) return { kind: 'AMBIGUOUS_FORMS', forms: distinctForms }
  let chosen = candidates[0]!
  for (const entry of candidates.slice(1)) {
    if (better(entry.label, chosen.label)) chosen = entry
  }
  return { kind: 'MATCHED', form: chosen.form, labelKey: chosen.labelKey, label: chosen.label }
}

/**
 * Builds the name index by streaming the reduced NDJSON. A medicine is reachable by its generic
 * name and by any brand name on the label; when several labels answer to one name, `preferred`
 * decides between them. The form index is built beside it from single-substance labels only.
 */
export async function buildIndex(indexPath: string): Promise<{
  names: Map<string, IndexedLabel>
  identity: IdentityIndex
  forms: FormIndex<IndexedLabel>
}> {
  const index = new Map<string, IndexedLabel>()
  const forms: FormIndex<IndexedLabel> = new Map()
  const candidates = new Map<string, Map<string, SubstanceIdentity>>()
  let lineCount = 0
  // The reduced index is larger than the maximum string a Node process can hold, so it is read a
  // line at a time rather than loaded whole.
  const reader = createInterface({
    input: createReadStream(indexPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of reader) {
    if (!line.trim()) continue
    lineCount += 1
    const entry = JSON.parse(line) as IndexedLabel
    if (!entry.setId) continue
    for (const candidate of [
      ...entry.genericNames,
      ...entry.brandNames,
      ...(entry.substanceNames ?? []),
    ]) {
      const key = normalizeName(candidate)
      if (key.length < 3) continue
      const existing = index.get(key)
      if (!existing || preferred(entry, existing)) index.set(key, entry)
    }
    // Brand names are left out: a brand is not a form of a substance name.
    addFormCandidates(
      forms,
      [...entry.genericNames, ...(entry.substanceNames ?? [])],
      entry.declaredSubstanceCount,
      entry,
    )

    // Identity is learned only from documents about a single substance, where the document-level
    // identifier can refer to nothing else. Candidates are keyed by the identifier itself so a
    // name claimed by two different substances can be detected and dropped.
    if (entry.declaredSubstanceCount === 1 && entry.unii) {
      for (const name of entry.genericNames) {
        const key = normalizeIdentityName(name)
        if (key.length < 3) continue
        const byUnii = candidates.get(key) ?? new Map<string, SubstanceIdentity>()
        if (!byUnii.has(entry.unii)) {
          byUnii.set(entry.unii, {
            unii: entry.unii,
            ...(entry.rxcui ? { rxcui: entry.rxcui } : {}),
            setId: entry.setId,
          })
        }
        candidates.set(key, byUnii)
      }
    }
  }

  // A name that resolves to more than one substance is dropped: an ambiguous identity is not one.
  const identity: IdentityIndex = new Map()
  for (const [key, byUnii] of candidates) {
    if (byUnii.size === 1) identity.set(key, [...byUnii.values()][0]!)
  }
  console.log(
    `[extract] read ${lineCount} indexed labels · ${index.size} distinct names · ${identity.size} unambiguous substance identities · ${forms.size} stem names with a single-substance label under a salt, ester or hydrate form`,
  )
  return { names: index, identity, forms }
}

export function loadMedicineRows(): MedicineRow[] {
  const dir = join(process.cwd(), 'data', 'drugs')
  const rows: MedicineRow[] = []
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith('.ndjson'))
    .sort()) {
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as {
        id?: string
        name?: string
        tradeName?: string
        approvalStatus?: string
      }
      if (record.id && record.name) {
        rows.push({
          slug: record.id,
          name: record.name,
          ...(record.tradeName ? { tradeName: record.tradeName } : {}),
          ...(record.approvalStatus ? { approvalStatus: record.approvalStatus } : {}),
        })
      }
    }
  }
  return rows
}

/** What one medicine row resolved to in the label index, and what the parser read out of it. */
export interface RowExtraction {
  /** The label the row's name or trade name matched, absent when no indexed name matched. */
  label?: IndexedLabel
  /**
   * Present when no label answered to the row's bare name and the label came from the
   * salt/ester fallback instead: which form matched, and the name the label prints.
   */
  matchedForm?: { form: string; labelKey: string; printedName: string }
  /** Why the fallback produced nothing, when it was tried and declined. */
  formResolution?: Exclude<FormResolution<IndexedLabel>, { kind: 'MATCHED' }>
  background: MedicineRecordedBackground | null
  modules: string[]
}

/**
 * Resolves one medicine row to a label and reads whatever that label supports out of it.
 *
 * Lifted out of the CLI loop unchanged so a second builder can run exactly this extraction —
 * the same name matching, the same identity resolution, the same attribution rules — rather than
 * a second implementation of it that could drift.
 *
 * When `forms` is supplied, the row carries a medicine status (`SALT_FORM_FALLBACK_STATUSES`) and
 * no indexed name answers to the row's bare name or trade names, the row falls back to a
 * single-substance label filed under one salt, ester or hydrate form of the same name
 * (`resolveByForm`). The fallback never runs when a direct match exists, never runs for a row
 * without a medicine status, never picks a multi-substance label, refuses an elemental stem, and
 * refuses when more than one form is on the market alone.
 */
export function extractRowBackground(args: {
  row: MedicineRow
  index: Map<string, IndexedLabel>
  identity: IdentityIndex
  retrievedAt: string
  forms?: FormIndex<IndexedLabel>
}): RowExtraction {
  const { row, index, identity, retrievedAt, forms } = args
  const candidates = [row.name, ...(row.tradeName ? row.tradeName.split(/\s*[/,]\s*/u) : [])]
  let label: IndexedLabel | undefined
  for (const candidate of candidates) {
    label = index.get(normalizeName(candidate))
    if (label) break
  }
  let matchedForm: RowExtraction['matchedForm']
  let formResolution: RowExtraction['formResolution']
  if (!label && forms && SALT_FORM_FALLBACK_STATUSES.has(row.approvalStatus ?? '')) {
    // Trade names are not tried here: a brand plus a salt word is not a name anything is filed under.
    const resolution = resolveByForm(normalizeName(row.name), forms, preferred)
    if (resolution.kind === 'MATCHED') {
      label = resolution.label
      matchedForm = {
        form: resolution.form,
        labelKey: resolution.labelKey,
        printedName: resolution.label.genericNames[0] ?? resolution.labelKey,
      }
    } else if (resolution.kind !== 'NONE') {
      formResolution = resolution
    }
  }
  if (!label) {
    return { background: null, modules: [], ...(formResolution ? { formResolution } : {}) }
  }

  const artifact: LabelArtifact = {
    setId: label.setId,
    declaredSubstanceCount: label.declaredSubstanceCount,
    effectiveTime: label.effectiveTime,
    brandNames: label.brandNames,
    genericNames: label.genericNames,
    routes: label.routes,
    unii: label.unii,
    rxcui: label.rxcui,
    sections: label.sections,
  }
  // This medicine's identifiers come from the identity index, which is built only from documents
  // declaring a single substance — the one situation where a document-level identifier can only
  // belong to one thing. The content label may well be a combination product; its identifiers
  // are never split between its substances, because openFDA's name and identifier arrays are not
  // positionally aligned and doing so assigns one substance's identifier to another.
  const resolved = identity.get(normalizeIdentityName(row.name))
  const ownUnii = resolved?.unii
  const ownRxcui = resolved?.rxcui
  const identifiers =
    ownUnii || ownRxcui
      ? {
          ...(ownUnii ? { unii: ownUnii } : {}),
          ...(ownRxcui ? { rxcui: ownRxcui } : {}),
          source: {
            // The document cited is the one that established the identity: a label naming this
            // substance and nothing else.
            kind: 'FDA_LABEL' as const,
            identifier: resolved!.setId,
            label: `${row.name} label naming this substance alone`,
            retrievedAt,
          },
        }
      : undefined

  const { background, modules } = extractBackgroundFromLabel({
    artifact,
    options: {
      retrievedAt,
      // A fallback label says on the record which name it was published under, so a reader of
      // "ethynodiol" sees that the source is the ethynodiol diacetate label and not a label that
      // names the parent alone.
      sourceLabel: matchedForm
        ? `${row.name} label, published as "${matchedForm.printedName}"`
        : `${row.name} label`,
    },
    registryIdentifiers: identifiers,
  })
  return { label, background, modules, ...(matchedForm ? { matchedForm } : {}) }
}

function serialize(dataset: Record<string, MedicineRecordedBackground>): string {
  const slugs = Object.keys(dataset).sort()
  const entries = slugs
    .map(
      (slug) =>
        `  ${JSON.stringify(slug)}: ${JSON.stringify(dataset[slug], null, 2).replace(/\n/gu, '\n  ')},`,
    )
    .join('\n')
  return `// Generated by scripts/background/build-extracted-background.ts — do not edit by hand.
//
// Every value here was read out of an FDA label sentence by a deterministic parser, which stores
// that sentence as the excerpt; the number is therefore always present in its own excerpt. These
// records are 'extracted' tier: no judgement was applied, and they never overwrite a curated
// record. Re-run the script to refresh, and let \`git diff\` report what changed.

import type { MedicineRecordedBackground } from '@/lib/background/types'

export const EXTRACTED_BACKGROUND: Record<string, MedicineRecordedBackground> = {
${entries}
}
`
}

async function main() {
  const [indexPath] = process.argv.slice(2).filter((value) => !value.startsWith('--'))
  if (!indexPath || !existsSync(indexPath)) {
    console.error(
      'Usage: tsx scripts/background/build-extracted-background.ts <labelIndex.ndjson> [--limit=N]',
    )
    process.exit(1)
  }
  const limitFlag = process.argv.find((value) => value.startsWith('--limit='))
  const limit = limitFlag ? Number(limitFlag.split('=')[1]) : Infinity

  /**
   * When the SOURCE was retrieved, which is not when this parser ran.
   *
   * Re-parsing a cached archive with a corrected pattern does not make the labels newer, and
   * stamping today's date on every record would claim it did — while burying the actual change in
   * an 80,000-line diff of dates. `--retrieved-at=` pins it to the archive's own download date.
   */
  const retrievedAtFlag = process.argv.find((value) => value.startsWith('--retrieved-at='))
  const retrievedAt = retrievedAtFlag
    ? retrievedAtFlag.slice('--retrieved-at='.length)
    : new Date().toISOString().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(retrievedAt)) {
    console.error(`[extract] --retrieved-at must be YYYY-MM-DD, got "${retrievedAt}"`)
    process.exit(1)
  }
  const { names: index, identity, forms } = await buildIndex(indexPath)
  const rows = loadMedicineRows()
  console.log(`[extract] ${rows.length} medicine rows · ${index.size} indexed label names`)

  const dataset: Record<string, MedicineRecordedBackground> = {}
  const stats = {
    considered: 0,
    curatedSkipped: 0,
    noLabelMatch: 0,
    saltOrEsterFallback: 0,
    fallbackAmbiguousForms: 0,
    fallbackInorganicStem: 0,
    nothingExtractable: 0,
    engineRejected: 0,
    written: 0,
  }
  const moduleCounts = new Map<string, number>()
  const fallbackMatches: string[] = []
  let multiSubstanceSources = 0

  for (const row of rows) {
    if (stats.written >= limit) break
    stats.considered += 1

    // The hand-authored corpus always wins: extraction never overwrites curated work.
    if (RECORDED_BACKGROUND[row.slug]) {
      stats.curatedSkipped += 1
      continue
    }

    const { label, background, modules, matchedForm, formResolution } = extractRowBackground({
      row,
      index,
      identity,
      retrievedAt,
      forms,
    })
    if (matchedForm) {
      stats.saltOrEsterFallback += 1
      fallbackMatches.push(`${row.slug} -> "${matchedForm.labelKey}" (${label!.setId})`)
    }
    if (formResolution?.kind === 'AMBIGUOUS_FORMS') stats.fallbackAmbiguousForms += 1
    if (formResolution?.kind === 'INORGANIC_STEM') stats.fallbackInorganicStem += 1
    if (!label) {
      stats.noLabelMatch += 1
      continue
    }
    if (!background) {
      stats.nothingExtractable += 1
      continue
    }

    // Nothing reaches the dataset without passing the same engine the curated corpus passes.
    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      stats.engineRejected += 1
      // Reported rather than counted. A rejection is the engine catching an extractor that
      // produced something structurally wrong, and a silent tally of them is a bug nobody reads.
      console.error(
        `[extract] rejected ${row.slug}: ${report.findings
          .map((finding) => `${finding.code} at ${finding.path} — ${finding.message}`)
          .join(' · ')}`,
      )
      continue
    }

    if (label.declaredSubstanceCount !== 1) multiSubstanceSources += 1
    dataset[row.slug] = background
    stats.written += 1
    for (const name of modules) moduleCounts.set(name, (moduleCounts.get(name) ?? 0) + 1)
  }

  const outPath = join(
    process.cwd(),
    'scripts',
    'seed-data',
    'background',
    'extracted-background.generated.ts',
  )
  writeFileSync(outPath, serialize(dataset))
  // Formatting here rather than leaving it to a human step: a regenerated corpus that skipped it
  // would fail `npm run gate` on formatting alone, long after the run that caused it.
  execFileSync('npx', ['prettier', '--write', outPath], { stdio: 'ignore' })
  console.log(`[extract] ${JSON.stringify(stats)}`)
  console.log(`[extract] modules: ${JSON.stringify(Object.fromEntries(moduleCounts))}`)
  // Reported rather than hidden: these records kept only product identity, because their source
  // was a multi-ingredient document that says nothing substance-specific about any one substance.
  console.log(
    `[extract] ${multiSubstanceSources} record(s) came from a multi-substance source and carry product context only`,
  )
  // Listed rather than counted: each fallback is a record whose source is a label published under
  // a different name, and a reader of the run should be able to see every one.
  if (fallbackMatches.length > 0) {
    console.log(
      `[extract] ${fallbackMatches.length} record(s) resolved through a salt, ester or hydrate form:\n  ${fallbackMatches.join('\n  ')}`,
    )
  }
  console.log(`[extract] wrote ${stats.written} record(s) to ${outPath}`)
}

// Guarded so a second builder can import the functions above without running this one's CLI.
const entryPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null
if (entryPath === import.meta.url) {
  void main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
