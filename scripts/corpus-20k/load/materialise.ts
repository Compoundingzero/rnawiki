/**
 * Phase 5 step `materialise-tier-<n>` — write the assembled corpus into the tables migration 0024
 * creates (docs/specs/corpus-schema.md).
 *
 * This script moves rows. It does not decide anything medical: every value it writes was produced
 * by an earlier, recorded stage and is copied verbatim with the source and dates that stage
 * recorded. Where an input is missing the row is written as the absence it is, never filled in.
 *
 *   npx tsx scripts/corpus-20k/load/materialise.ts --tier 1 --dry-run
 *   npx tsx scripts/corpus-20k/load/materialise.ts --tier 1
 *   npx tsx scripts/corpus-20k/load/materialise.ts --tier 3 --batches 2
 *
 * Flags:
 *   --tier 1|2|3            required; the deployment tier to load (tiers/promotion-rule.md)
 *   --dry-run               read, derive and report; touch neither the database nor any marker
 *   --batches n             stop after n batches (a smoke load)
 *   --batch-size n          default 250
 *   --load-dir <dir>        marker directory, default data/corpus-20k/load
 *   --state-root <dir>      working directory for the batch.ts checkpoint, default the repo root
 *   --no-checkpoint         skip the batch.ts checkpoint call
 *   --indexable-threshold n present-field floor for `indexable`; default: Gate 1b, else 3
 *   --allow-working-database  permit writes to rnawiki_corpus_completion (refused by default)
 *   --production-confirmed  required before any write to a remote database (deployment plan)
 *
 * Idempotence. Each batch writes a marker file under `--load-dir` holding the batch's input digest
 * and a fingerprint of the database it was written against. Re-running a batch whose marker
 * records the same digest *and* the same target does no database work at all. A marker with a
 * different digest means the inputs changed; a marker with a different target — or with none, as
 * markers written before this rule carried — describes work done somewhere else and never counts
 * as done here, so a disposable-database rehearsal can no longer make a production load look
 * finished. Every write is an upsert preceded by a delete of that page's child rows, so a partial
 * batch that was interrupted before its marker converges on re-run.
 *
 * The fingerprint is the sha256 of the host and the database name. It identifies the target
 * without recording a credential: nothing in a marker can be used to reach the database.
 *
 * Ordering. Child rows are deleted before the page row is upserted, so a page that has just become
 * suppressed loses its seed 1/2/6 rows inside the same transaction and the suppression trigger
 * migration 0024 installs never fires on our own writes.
 *
 * Redirects. The 864 REDIRECT dispositions are written into `medicine_slug_redirects` in the same
 * transaction as the batch that carries their target page, so a redirect never points at a page
 * that is not there yet. `medicine_slug_redirects.target_drug_id` is a foreign key onto the legacy
 * `drugs` table: a redirect whose target has no legacy row is skipped and counted, not invented.
 *
 * One hop, always. `resolvePublicMedicineRoute` (lib/queries/drugs.ts) refuses a redirect whose
 * target is itself an old slug: a bad ledger fails closed rather than serving a chain or a loop.
 * The Tier 2 load proved that this script could write one anyway. It wrote
 * `risedronate-sodium-hemi-pentahydrate -> risedronate` while a row from 2026-09-02 already said
 * `risedronate-sodium-hemipentahydrate -> risedronate-sodium-hemi-pentahydrate`, and the older
 * slug — a URL that had been answering 308 — began answering 404. So the ledger is now read with
 * its target slugs, and three things follow, all counted and none inventing a destination:
 *
 *   - before any batch runs, every chain already in the ledger is walked to its terminal drug and
 *     the earlier hops are re-pointed there, keeping each row's own recorded reason and rationale;
 *   - a redirect this run would write onto a slug that is itself an old slug is re-pointed to that
 *     chain's terminal drug instead of being written as a first hop;
 *   - an existing row whose target this run is turning into an old slug is re-pointed, in the same
 *     transaction, to where the new row points.
 *
 * A cycle is never repaired: the walk stops and the load refuses, because a cycle has no terminal
 * target and picking one would be a guess about which URL is canonical.
 *
 * Memory. The script holds one tier's inputs in memory (Tier 3, the largest, is ~90 MB of NDJSON).
 * Files are read line by line; nothing is slurped whole.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream, existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

import 'dotenv/config'
import { Client } from 'pg'

import { databaseSslConfig, isLocalDatabaseHost } from '@/db/ssl'

/* ------------------------------------------------------------------------------------------- */
/* Shapes of the recorded inputs                                                                 */
/* ------------------------------------------------------------------------------------------- */

interface CanonicalRecord {
  key: string
  keyRank: string
  ruleId: string
  displayName: string
  synonyms?: Array<{ name: string; kind: string; source: string }>
  relations?: Array<{ type: string; targetKey: string }>
  structure?: { inchikey?: string | null } | null
  chemblId?: string | null
  unii?: string | null
  cid?: string | number | null
  cas?: string | null
  rxcui?: string | null
  existingSlug?: string | null
}

interface ModelAssignment {
  key: string
  model: 'LONGEVITY' | 'CLINICAL' | 'DEVELOPMENT'
  withdrawn: boolean
}

interface SuppressionAssignment {
  key: string
  suppressed: boolean
  classes: string[]
}

interface Disposition {
  slug: string
  disposition: 'KEEP' | 'REDIRECT' | 'RETAIN' | 'RETIRE_410'
  key: string
  targetSlug: string | null
  reason: string
}

interface RecordedField {
  state: 'present' | 'absent' | 'not-applicable'
  value?: unknown
  source?: { kind?: string | null; id?: string | null; url?: string | null } | null
  sourceDate?: string | null
  lastVerified?: string | null
  verbatim?: boolean
  note?: string | null
  consulted?: string[]
}

interface FieldsRecord {
  key: string
  model: string
  fields: Record<string, RecordedField>
  [other: string]: unknown
}

interface RegistryMatchRecord {
  key: string
  nctIds: Array<{ nct: string; matchedName: string | null; role: string }>
}

interface SeedRecord {
  key: string
  seed?: number
  values?: unknown
  sources?: unknown
}

interface QuestionRow {
  block: string
  template?: string
  id?: string
  text: string
  paragraph1?: string | null
  paragraph_1?: string | null
  paragraph2?: string | null
  paragraph_2?: string | null
  anchors?: unknown
  revealed?: unknown
}

/* ------------------------------------------------------------------------------------------- */
/* Rows this script writes                                                                       */
/* ------------------------------------------------------------------------------------------- */

interface PageFieldRow {
  key: string
  field: string
  ordinal: number
  state: string
  value: unknown
  sourceKind: string | null
  sourceId: string | null
  sourceUrl: string | null
  sourceDate: string | null
  lastVerified: string | null
  verbatim: boolean
  note: string | null
}

interface PageRow {
  key: string
  slug: string
  displayName: string
  model: string
  tier: number
  pageType: string
  indexable: boolean
  suppressed: boolean
  suppressionClasses: string[]
  withdrawn: boolean
  presentFieldCount: number
  applicableFieldCount: number
  structureInchikey: string | null
  unii: string | null
  chemblId: string | null
  pubchemCid: string | null
  cas: string | null
  rxcui: string | null
  legacyDrugId: string | null
  identityRank: string
  identityRule: string
  licenceNotes: string[]
  corpusDigest: string
  /** ATC codes ChEMBL records for this molecule, verbatim. Empty where ChEMBL records none. */
  atcCodes: string[]
  /** The corpus's own entity class, the legacy resolution's class, or the ChEMBL molecule type. */
  entityClass: string | null
  /** Highest organism rung on file; `human` for a non-ladder page with a registry study. */
  topRung: string | null
  /** Whether a human study or human rung is on file. Null where nothing bears on the question. */
  humanData: boolean | null
  /** The ladder's own evidence kind, else what the registry records. */
  evidenceTier: string | null
}

const ROOT = resolve(process.cwd())
const DATA = join(ROOT, 'data', 'corpus-20k')
const BATCH_SCRIPT = join(ROOT, 'scripts', 'corpus-20k', 'batch.ts')

const MODEL_DIRECTORY: Record<string, string> = {
  LONGEVITY: 'longevity',
  CLINICAL: 'clinical',
  DEVELOPMENT: 'development',
}

const RELATION_KINDS = new Set([
  'ester-of',
  'prodrug-of',
  'stereoisomer-of',
  'racemate-of',
  'biosimilar-of',
  'contains',
  'isotopologue-of',
  'same-target',
  'shares-enzyme',
])

const SYNONYM_KINDS = new Set([
  'inn',
  'usan',
  'ban',
  'jan',
  'brand',
  'salt',
  'code',
  'fragment',
  'common',
  'display',
])

/**
 * Licence per source, transcribed from the recorded survey (docs/specs/corpus-20k-sources.md and
 * data/corpus-20k/sources.json). A source kind that is not listed here stores a null licence and
 * is counted in the run report; it is never given a licence it was not granted.
 */
const LICENCE_BY_SOURCE: Record<string, string> = {
  chembl: 'ChEMBL 37 — CC BY-SA 3.0 Unported',
  'clinicaltrials.gov': 'ClinicalTrials.gov — US Government work',
  CLINICALTRIALS_SNAPSHOT: 'ClinicalTrials.gov — US Government work',
  FDA_LABEL: 'openFDA / DailyMed — US Government work',
  'openfda-label': 'openFDA / DailyMed — US Government work',
  OPENFDA_ENFORCEMENT: 'openFDA enforcement — US Government work',
  PUBMED_ESEARCH: 'PubMed — US Government work',
  europepmc: 'Europe PMC — metadata only, under the recorded legal gate',
  'open-targets': 'Open Targets 26.06 — CC0',
  'open-targets-adr': 'Open Targets 26.06 — CC0',
  OPEN_TARGETS_FAERS: 'Open Targets 26.06 — CC0',
  OPEN_TARGETS_DRUG_WARNING: 'Open Targets 26.06 — CC0',
  'jax-mpd-itp': 'NIA ITP via the JAX Mouse Phenome Database',
  EMA_MEDICINE_REGISTER: 'EMA medicine register',
  registers: 'mixed register set; per-register licences in docs/specs/corpus-20k-sources.md',
  REGISTER_SET: 'mixed register set; per-register licences in docs/specs/corpus-20k-sources.md',
  'derived-from-fields': "derived from this page's own recorded fields; no external licence",
}

/**
 * ChEMBL's ATC codes are ChEMBL content, so a page that carries one carries ChEMBL's licence in
 * `licence_notes` whether or not any of its fields came from ChEMBL.
 */
const ATC_LICENCE = 'ChEMBL ATC CC BY-SA'

/** The organism ladder, weakest rung first — the corpus's own rung words (field model 4). */
const ORGANISM_RUNGS = [
  'yeast',
  'C. elegans',
  'Drosophila',
  'mouse',
  'rat',
  'dog',
  'NHP',
  'human',
] as const

/**
 * The register row the corpus writes for its own classification. It is not a register: the
 * extractor labels it as the corpus's classification and this loader only copies its value.
 */
const ENTITY_CLASS_REGISTER = /entity class/i

/**
 * ChEMBL's `molecule_type`. `Unknown` is dropped rather than stored: it is ChEMBL saying it has no
 * type for the molecule, which is an absence, not a class.
 */
const CHEMBL_MOLECULE_TYPE_UNKNOWN = 'Unknown'

interface ChemblMoleculeFacts {
  atcCodes: string[]
  moleculeType: string | null
}

/**
 * ATC codes and molecule types for every ChEMBL molecule on disk, keyed by ChEMBL id.
 *
 * The pages carry a ChEMBL id from identity resolution; these two facts are read straight from the
 * recorded ChEMBL pages under `data/corpus-20k/raw/chembl/` and copied verbatim. Nothing is derived
 * from the structures in those files, and a molecule absent from them simply has no ATC code here.
 */
async function readChemblMoleculeFacts(
  counters: Counters,
): Promise<Map<string, ChemblMoleculeFacts>> {
  const facts = new Map<string, ChemblMoleculeFacts>()
  const directory = join(DATA, 'raw', 'chembl')
  if (!existsSync(directory)) {
    counters.bump('ChEMBL molecule pages absent; no ATC code or molecule type was read')
    return facts
  }
  const names = (await readdir(directory))
    .filter((name) => /^molecules-\d+\.json$/.test(name))
    .sort()
  if (names.length === 0) {
    counters.bump('ChEMBL molecule pages absent; no ATC code or molecule type was read')
    return facts
  }
  for (const name of names) {
    const parsed = JSON.parse(await readFile(join(directory, name), 'utf8')) as {
      molecules?: Array<{
        molecule_chembl_id?: string
        atc_classifications?: unknown
        molecule_type?: unknown
      }>
    }
    for (const molecule of parsed.molecules ?? []) {
      const id = nullIfBlank(molecule.molecule_chembl_id)
      if (id === null) continue
      const atcCodes = Array.isArray(molecule.atc_classifications)
        ? molecule.atc_classifications
            .map((code) => nullIfBlank(code))
            .filter((code): code is string => code !== null)
        : []
      const rawType = nullIfBlank(molecule.molecule_type)
      facts.set(id, {
        atcCodes,
        moleculeType: rawType === CHEMBL_MOLECULE_TYPE_UNKNOWN ? null : rawType,
      })
    }
  }
  return facts
}

/** The corpus's own entity class, read out of the page's recorded `regulatory` field. */
function recordedEntityClass(field: RecordedField | undefined): string | null {
  if (!field || field.state !== 'present') return null
  const value = field.value
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  for (const jurisdiction of Object.values(value as Record<string, unknown>)) {
    if (!jurisdiction || typeof jurisdiction !== 'object' || Array.isArray(jurisdiction)) continue
    const records = (jurisdiction as { records?: unknown }).records
    if (!Array.isArray(records)) continue
    for (const entry of records) {
      if (!entry || typeof entry !== 'object') continue
      const row = entry as { register?: unknown; statusVerbatim?: unknown }
      if (typeof row.register !== 'string' || !ENTITY_CLASS_REGISTER.test(row.register)) continue
      const recorded = nullIfBlank(row.statusVerbatim)
      if (recorded !== null) return recorded
    }
  }
  return null
}

/** Every rung the ladder field records, in the order the field listed them. */
function ladderRungs(field: RecordedField | undefined): string[] {
  if (!field || field.state !== 'present') return []
  const value = field.value
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  const rungs = (value as { rungs?: unknown }).rungs
  if (!Array.isArray(rungs)) return []
  return rungs.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return []
    const rung = nullIfBlank((entry as { rung?: unknown }).rung)
    return rung === null ? [] : [rung]
  })
}

/** The highest rung of the ladder, by the field model's own order. */
function highestRung(rungs: readonly string[]): string | null {
  let best: string | null = null
  let bestIndex = -1
  for (const rung of rungs) {
    const index = ORGANISM_RUNGS.indexOf(rung as (typeof ORGANISM_RUNGS)[number])
    if (index > bestIndex) {
      bestIndex = index
      best = rung
    }
  }
  return best
}

/** The evidence kind the ladder records for its highest rung, verbatim. */
function ladderEvidenceKind(field: RecordedField | undefined, top: string | null): string | null {
  if (top === null || !field || field.state !== 'present') return null
  const value = field.value
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const rungs = (value as { rungs?: unknown }).rungs
  if (!Array.isArray(rungs)) return null
  for (const entry of rungs) {
    if (!entry || typeof entry !== 'object') continue
    const row = entry as { rung?: unknown; evidenceKind?: unknown }
    if (row.rung !== top) continue
    const kind = nullIfBlank(row.evidenceKind)
    if (kind !== null) return kind
  }
  return null
}

/**
 * The badge triplet the dossier header and every browse row carry (docs/specs/dossier-template.md).
 *
 * `topRung` is the ladder's highest rung; a page with no ladder but a registry study reaches human,
 * because a ClinicalTrials.gov study is a study in people. `humanData` is null only when neither a
 * ladder nor a registry study is on file — nothing bears on the question, so the page says nothing.
 *
 * `evidenceTier` is the ladder's own evidence kind where the ladder records one, else what the
 * registry records. The registry snapshot on disk holds no allocation or design field, so
 * "human randomised trial" is never asserted here: `human trial` is as far as the recorded data
 * goes, and a page with no registry study says so.
 */
function badgeTriplet(input: { ladder: RecordedField | undefined; registeredStudies: number }): {
  topRung: string | null
  humanData: boolean | null
  evidenceTier: string | null
} {
  const rungs = ladderRungs(input.ladder)
  const hasStudies = input.registeredStudies > 0
  const ladderTop = highestRung(rungs)
  const topRung = ladderTop ?? (hasStudies ? 'human' : null)
  const humanData = rungs.length === 0 && !hasStudies ? null : rungs.includes('human') || hasStudies
  const evidenceTier =
    ladderEvidenceKind(input.ladder, ladderTop) ??
    (hasStudies ? 'human trial' : 'no human trial recorded')
  return { topRung, humanData, evidenceTier }
}

/* ------------------------------------------------------------------------------------------- */
/* Small helpers                                                                                 */
/* ------------------------------------------------------------------------------------------- */

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

function option(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : undefined
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/** Stable JSON: object keys sorted, so a digest does not move when a source reorders its keys. */
function canonicalJson(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${entries.map(([k, item]) => `${JSON.stringify(k)}:${canonicalJson(item)}`).join(',')}}`
  }
  return JSON.stringify(value)
}

async function* readNdjson(path: string): AsyncGenerator<unknown> {
  const stream = createReadStream(path, { encoding: 'utf8' })
  const lines = createInterface({ input: stream, crlfDelay: Infinity })
  for await (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    yield JSON.parse(trimmed)
  }
}

function nullIfBlank(value: unknown): string | null {
  if (typeof value === 'number') return String(value)
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

/* Three FDA UNII synonym names carry a NUL byte, and PostgreSQL refuses a NUL inside a text value.
 * Every ASCII control character is removed from a name before the row is built — not replaced, not
 * escaped: a control character is not part of any recorded name, and removing it leaves the printed
 * name exactly as the register prints it. Each removed character is counted so the load reports
 * what it changed. */
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/g

let controlCharactersStripped = 0
let namesWithControlCharacters = 0

export function stripControlCharacters(value: unknown, counters?: Counters): string | null {
  const text = nullIfBlank(value)
  if (text === null) return null
  const matches = text.match(CONTROL_CHARACTERS)
  if (matches === null) return text
  controlCharactersStripped += matches.length
  namesWithControlCharacters += 1
  counters?.bump('control characters stripped from a name or synonym', matches.length)
  counters?.bump('names or synonyms holding a control character')
  return nullIfBlank(text.replace(CONTROL_CHARACTERS, ''))
}

export function controlCharacterTotals(): { characters: number; names: number } {
  return { characters: controlCharactersStripped, names: namesWithControlCharacters }
}

/* The augment stage writes some recorded fields beside `fields` rather than inside it —
 * `doseStudied` on every LONGEVITY and CLINICAL record, `approvalDate` on every CLINICAL record.
 * The page-text renderer already reads them (scripts/corpus-20k/render/page-text.ts, the
 * `for (const [k, v] of Object.entries(row))` pass), so the loader must read them by the same rule
 * or `present_field_count` disagrees with the count Gate 1b measured. The rule is exactly the
 * renderer's: any top-level entry that is an object carrying a string `state`, and whose name is
 * not already inside `fields`, is that field. Nothing is invented; the entry is copied as written. */
function liftTopLevelFields(record: FieldsRecord, counters: Counters): FieldsRecord {
  const fields: Record<string, RecordedField> = { ...(record.fields ?? {}) }
  for (const [name, value] of Object.entries(record)) {
    if (name === 'fields' || name === 'key' || name === 'model') continue
    if (value === null || typeof value !== 'object' || Array.isArray(value)) continue
    const entry = value as { state?: unknown }
    if (typeof entry.state !== 'string') continue
    if (fields[name] !== undefined) {
      counters.bump(`top-level field also present inside fields (kept the inner one): ${name}`)
      continue
    }
    fields[name] = value as RecordedField
    counters.bump(`fields read from a top-level entry: ${name}`)
  }
  return { ...record, fields }
}

const DATE_SHAPE = /^\d{4}(-\d{2}(-\d{2})?)?$/

/** The columns accept YYYY, YYYY-MM or YYYY-MM-DD. Anything else is dropped and counted. */
function recordedDate(value: unknown, counters: Counters): string | null {
  const text = nullIfBlank(value)
  if (text === null) return null
  if (DATE_SHAPE.test(text)) return text
  counters.bump('dates dropped for an unrecognised shape')
  return null
}

export class Counters {
  private readonly values = new Map<string, number>()

  bump(label: string, by = 1): void {
    this.values.set(label, (this.values.get(label) ?? 0) + by)
  }

  entries(): Array<[string, number]> {
    return [...this.values.entries()].sort(([a], [b]) => (a < b ? -1 : 1))
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Slugs                                                                                         */
/* ------------------------------------------------------------------------------------------- */

const SLUG_MAX = 128
const SLUG_BASE_MAX = 120

export function kebabCase(value: string): string {
  const stripped = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (stripped.length <= SLUG_BASE_MAX) return stripped
  const cut = stripped.slice(0, SLUG_BASE_MAX)
  const lastHyphen = cut.lastIndexOf('-')
  return (lastHyphen > 0 ? cut.slice(0, lastHyphen) : cut).replace(/-+$/g, '')
}

/**
 * One slug map for the whole corpus, computed the same way whatever tier is being loaded, so a
 * page keeps its slug no matter which tier ran first.
 *
 *   1. a KEEP or RETAIN disposition fixes the existing slug — that URL is already indexed (R8);
 *   2. every other legacy `drugs` slug, every redirect that already exists and every REDIRECT
 *      old slug is reserved, so a new page never takes a URL that belongs somewhere else;
 *   3. the remaining keys, in ascending key order, take the kebab-case display name with a
 *      numeric suffix on collision.
 */
export function assignSlugs(input: {
  keysInOrder: string[]
  displayNameByKey: Map<string, string>
  dispositions: Disposition[]
  reservedSlugs: Iterable<string>
  counters: Counters
}): Map<string, string> {
  const { keysInOrder, displayNameByKey, dispositions, reservedSlugs, counters } = input
  const slugByKey = new Map<string, string>()
  const taken = new Set<string>()

  const kept = dispositions
    .filter((row) => row.disposition === 'KEEP' || row.disposition === 'RETAIN')
    .sort((a, b) => (a.slug < b.slug ? -1 : 1))
  for (const row of kept) {
    if (!displayNameByKey.has(row.key)) {
      counters.bump('KEEP/RETAIN dispositions whose key is not a canonical page')
      continue
    }
    if (slugByKey.has(row.key)) {
      counters.bump('keys holding more than one KEEP/RETAIN slug')
      continue
    }
    slugByKey.set(row.key, row.slug)
    taken.add(row.slug)
  }

  for (const slug of reservedSlugs) taken.add(slug)
  for (const row of dispositions) if (row.disposition === 'REDIRECT') taken.add(row.slug)

  for (const key of keysInOrder) {
    if (slugByKey.has(key)) continue
    const base = kebabCase(displayNameByKey.get(key) ?? '') || kebabCase(key) || 'record'
    let candidate = base
    let suffix = 2
    while (taken.has(candidate) || candidate.length > SLUG_MAX) {
      candidate = `${base}-${suffix}`
      suffix += 1
    }
    slugByKey.set(key, candidate)
    taken.add(candidate)
    if (candidate !== base) counters.bump('derived slugs that needed a numeric suffix')
  }

  return slugByKey
}

/* ------------------------------------------------------------------------------------------- */
/* Redirect chains                                                                               */
/* ------------------------------------------------------------------------------------------- */

export interface LedgerRedirect {
  oldSlug: string
  targetSlug: string
  reason: string
  rationale: string
}

export interface RedirectRepair {
  oldSlug: string
  targetSlug: string
  terminalSlug: string
  targetDrugId: string
  reason: string
  rationale: string
}

/**
 * Follow `slug` through the ledger to the slug that is not itself an old slug.
 *
 * Returns null for a cycle, and null when the walk ends on a slug with no legacy `drugs` row —
 * neither has a target this script is entitled to choose.
 */
export function terminalSlugOf(slug: string, ledger: Map<string, LedgerRedirect>): string | null {
  const seen = new Set<string>([slug])
  let current = slug
  while (true) {
    const next = ledger.get(current)
    if (!next) return current
    if (seen.has(next.targetSlug)) return null
    seen.add(next.targetSlug)
    current = next.targetSlug
  }
}

/**
 * Every ledger row whose target is itself an old slug, re-pointed at the end of its chain. The
 * row's own recorded reason and rationale are carried over unchanged: only the destination moves.
 */
export function repairLedgerChains(input: {
  ledger: Map<string, LedgerRedirect>
  legacyDrugIdBySlug: Map<string, string>
  counters: Counters
}): RedirectRepair[] {
  const { ledger, legacyDrugIdBySlug, counters } = input
  const repairs: RedirectRepair[] = []
  for (const row of [...ledger.values()].sort((a, b) => (a.oldSlug < b.oldSlug ? -1 : 1))) {
    if (!ledger.has(row.targetSlug)) continue
    const terminal = terminalSlugOf(row.targetSlug, ledger)
    if (terminal === null) {
      throw new Error(
        `medicine_slug_redirects holds a cycle reachable from ${row.oldSlug}. A cycle has no ` +
          'terminal target and this script will not choose one; correct the ledger by hand.',
      )
    }
    const targetDrugId = legacyDrugIdBySlug.get(terminal)
    if (!targetDrugId) {
      counters.bump('redirect chains left alone: the terminal slug has no legacy drugs row')
      continue
    }
    repairs.push({
      oldSlug: row.oldSlug,
      targetSlug: row.targetSlug,
      terminalSlug: terminal,
      targetDrugId,
      reason: row.reason,
      rationale: row.rationale,
    })
    counters.bump('redirect chains repaired: an earlier hop re-pointed to its terminal target')
  }
  return repairs
}

/** Write chain repairs in one transaction. Only `target_drug_id` changes. */
export async function writeRedirectRepairs(
  client: Client,
  repairs: RedirectRepair[],
): Promise<void> {
  if (repairs.length === 0) return
  await client.query('BEGIN')
  try {
    for (const repair of repairs) {
      await client.query(
        'UPDATE medicine_slug_redirects SET target_drug_id = $1 WHERE old_slug = $2',
        [repair.targetDrugId, repair.oldSlug],
      )
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Derivations                                                                                   */
/* ------------------------------------------------------------------------------------------- */

export function tierOf(assignment: ModelAssignment): number {
  if (assignment.model === 'LONGEVITY' || assignment.withdrawn) return 1
  return assignment.model === 'CLINICAL' ? 2 : 3
}

export function pageTypeOf(input: {
  tier: number
  model: string
  withdrawn: boolean
  presentFieldCount: number
}): string {
  if (input.tier === 3 && input.presentFieldCount < 3) return 'stub'
  if (input.model === 'LONGEVITY') return 'longevity'
  if (input.withdrawn) return 'withdrawn'
  if (input.model === 'CLINICAL') return 'clinical'
  return 'development'
}

/** corpus_digest: sha256 over the page's field rows, ordered by field then ordinal. */
export function corpusDigestOf(rows: PageFieldRow[]): string {
  const ordered = [...rows].sort((a, b) =>
    a.field === b.field ? a.ordinal - b.ordinal : a.field < b.field ? -1 : 1,
  )
  const payload = ordered
    .map((row) =>
      canonicalJson([
        row.field,
        row.ordinal,
        row.state,
        row.value ?? null,
        row.sourceKind,
        row.sourceId,
        row.sourceUrl,
        row.sourceDate,
        row.lastVerified,
        row.verbatim,
      ]),
    )
    .join('\n')
  return sha256(payload)
}

function licencesFor(sourceKind: string): string[] {
  return sourceKind
    .split('+')
    .map((part) => LICENCE_BY_SOURCE[part.trim()])
    .filter((licence): licence is string => typeof licence === 'string')
}

/* ------------------------------------------------------------------------------------------- */
/* Database helpers                                                                              */
/* ------------------------------------------------------------------------------------------- */

const MAX_PARAMETERS = 30_000

async function insertRows(
  client: Client,
  table: string,
  columns: string[],
  rows: unknown[][],
  conflict: string,
): Promise<void> {
  if (rows.length === 0) return
  const perRow = columns.length
  const chunkSize = Math.max(1, Math.floor(MAX_PARAMETERS / perRow))
  const quoted = columns.map((column) => `"${column}"`).join(', ')
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize)
    const values: unknown[] = []
    const tuples = chunk.map((row) => {
      const placeholders = row.map((value) => {
        values.push(value)
        return `$${values.length}`
      })
      return `(${placeholders.join(', ')})`
    })
    await client.query(
      `INSERT INTO "${table}" (${quoted}) VALUES ${tuples.join(', ')} ${conflict}`,
      values,
    )
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Main                                                                                          */
/* ------------------------------------------------------------------------------------------- */

async function main(): Promise<void> {
  const tierText = option('tier')
  const tier = Number(tierText)
  if (![1, 2, 3].includes(tier)) {
    throw new Error('--tier 1|2|3 is required.')
  }

  const dryRun = flag('dry-run')
  const batchSize = Number(option('batch-size') ?? 250)
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new Error('--batch-size must be >= 1.')
  const batchLimit = option('batches') ? Number(option('batches')) : Infinity
  const loadDir = resolve(option('load-dir') ?? join(DATA, 'load'))
  const stateRoot = resolve(option('state-root') ?? ROOT)
  const checkpoint = !flag('no-checkpoint')
  const counters = new Counters()

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set.')
  const databaseName = new URL(connectionString).pathname.replace(/^\//, '')
  if (databaseName === 'rnawiki_corpus_completion' && !dryRun && !flag('allow-working-database')) {
    throw new Error(
      'Refusing to write to the working database rnawiki_corpus_completion. Re-run with ' +
        '--dry-run, point DATABASE_URL at a disposable database, or pass --allow-working-database.',
    )
  }

  /*
   * The deployment plan (docs/specs/deployment-plan.md, step 2) requires that a load against a
   * remote database is never something the operator can reach by accident: the loader "takes an
   * explicit production URL and refuses without --production-confirmed". A local or
   * railway.internal host is a workstation or disposable database and stays unguarded; anything
   * reachable over the network is treated as production until the operator says otherwise.
   */
  if (!dryRun && !isLocalDatabaseHost(connectionString) && !flag('production-confirmed')) {
    throw new Error(
      `Refusing to write to the remote database "${databaseName}" without --production-confirmed. ` +
        'Re-run with --dry-run to rehearse, or pass --production-confirmed to load it for real.',
    )
  }

  // Markers from every target share one directory; this is what keeps them apart.
  const target = loadTargetFingerprint(connectionString)

  const client = new Client({ connectionString, ssl: databaseSslConfig(connectionString) })
  await client.connect()

  try {
    /* ---- 1. assignments, suppression, dispositions ---------------------------------------- */

    const assignments = new Map<string, ModelAssignment>()
    for await (const row of readNdjson(join(DATA, 'tiers', 'model-assignment.ndjson'))) {
      const record = row as ModelAssignment
      assignments.set(record.key, {
        key: record.key,
        model: record.model,
        withdrawn: Boolean(record.withdrawn),
      })
    }

    const suppression = new Map<string, SuppressionAssignment>()
    for await (const row of readNdjson(join(DATA, 'suppression', 'assignments.ndjson'))) {
      const record = row as SuppressionAssignment
      suppression.set(record.key, {
        key: record.key,
        suppressed: Boolean(record.suppressed),
        classes: Array.isArray(record.classes) ? record.classes : [],
      })
    }

    const dispositions: Disposition[] = []
    for await (const row of readNdjson(join(DATA, 'reconciliation', 'dispositions.ndjson'))) {
      dispositions.push(row as Disposition)
    }

    /* ---- 2. identity spine, then the slug map for the whole corpus -------------------------- */

    const displayNameByKey = new Map<string, string>()
    const identityOrder: string[] = []
    for await (const row of readNdjson(join(DATA, 'identity', 'canonical.ndjson'))) {
      const record = row as CanonicalRecord
      displayNameByKey.set(record.key, record.displayName ?? '')
      identityOrder.push(record.key)
    }
    identityOrder.sort()

    const reserved = new Set<string>()
    const legacyDrugIdBySlug = new Map<string, string>()
    // The legacy resolution already classified many of these records. Where it did, that class is
    // read here rather than re-derived: it is the same corpus's own recorded decision.
    const legacyEntityClassBySlug = new Map<string, string>()
    const drugRows = await client.query<{ id: string; slug: string; entity_class: string | null }>(
      `SELECT d.id, d.slug, r.entity_class
         FROM drugs d
         LEFT JOIN inventory_resolutions r ON r.drug_id = d.id`,
    )
    for (const drug of drugRows.rows) {
      legacyDrugIdBySlug.set(drug.slug, drug.id)
      const entityClass = nullIfBlank(drug.entity_class)
      if (entityClass !== null) legacyEntityClassBySlug.set(drug.slug, entityClass)
      reserved.add(drug.slug)
    }
    const ledgerRows = await client.query<{
      old_slug: string
      target_slug: string
      reason: string
      rationale: string
    }>(
      `SELECT r.old_slug, d.slug AS target_slug, r.reason::text AS reason, r.rationale
         FROM medicine_slug_redirects r
         JOIN drugs d ON d.id = r.target_drug_id`,
    )
    const ledger = new Map<string, LedgerRedirect>()
    for (const redirect of ledgerRows.rows) {
      reserved.add(redirect.old_slug)
      ledger.set(redirect.old_slug, {
        oldSlug: redirect.old_slug,
        targetSlug: redirect.target_slug,
        reason: redirect.reason,
        rationale: redirect.rationale,
      })
    }

    /* ---- 2b. chains already in the ledger -------------------------------------------------- */

    const preflight = repairLedgerChains({ ledger, legacyDrugIdBySlug, counters })
    if (preflight.length > 0) {
      process.stdout.write(
        `Redirect chains already in the ledger: ${preflight.length} row(s) re-pointed to their ` +
          `terminal target${dryRun ? ' (dry run — nothing written)' : ''}.\n`,
      )
      for (const row of preflight) {
        process.stdout.write(`  ${row.oldSlug} -> ${row.terminalSlug} (was ${row.targetSlug})\n`)
      }
      if (!dryRun) await writeRedirectRepairs(client, preflight)
      // Applied to the in-memory ledger either way, so a dry run reports the plan a real run
      // would follow rather than one computed against a ledger it is about to change.
      for (const row of preflight) {
        const held = ledger.get(row.oldSlug)
        if (held) held.targetSlug = row.terminalSlug
      }
    }

    const slugByKey = assignSlugs({
      keysInOrder: identityOrder,
      displayNameByKey,
      dispositions,
      reservedSlugs: reserved,
      counters,
    })

    /* ---- 3. the keys of this tier ---------------------------------------------------------- */

    const tierKeys = new Set<string>()
    for (const key of identityOrder) {
      const assignment = assignments.get(key)
      if (!assignment) {
        counters.bump('canonical pages with no model assignment (skipped)')
        continue
      }
      if (tierOf(assignment) === tier) tierKeys.add(key)
    }
    const orderedKeys = [...tierKeys].sort()
    process.stdout.write(`Tier ${tier}: ${orderedKeys.length} pages, batch size ${batchSize}.\n`)

    /* ---- 4. this tier's identity records, fields, seeds, questions and registry matches ----- */

    const identity = new Map<string, CanonicalRecord>()
    for await (const row of readNdjson(join(DATA, 'identity', 'canonical.ndjson'))) {
      const record = row as CanonicalRecord
      if (tierKeys.has(record.key)) identity.set(record.key, record)
    }

    const chembl = await readChemblMoleculeFacts(counters)
    process.stdout.write(`ChEMBL molecules read for ATC and molecule type: ${chembl.size}.\n`)

    const fields = new Map<string, FieldsRecord>()
    for (const directory of Object.values(MODEL_DIRECTORY)) {
      const modelDir = join(DATA, 'fields', directory)
      if (!existsSync(modelDir)) continue
      for (const file of await batchFiles(modelDir, 'batch-')) {
        for await (const row of readNdjson(file)) {
          const record = row as FieldsRecord
          if (tierKeys.has(record.key)) fields.set(record.key, liftTopLevelFields(record, counters))
        }
      }
    }

    const seeds = new Map<string, Map<number, SeedRecord>>()
    const derivedDir = join(DATA, 'derived')
    if (existsSync(derivedDir)) {
      for (const file of await batchFiles(derivedDir, 'seed-')) {
        const match = /seed-0*(\d+)\.ndjson$/.exec(file)
        const fileSeed = match ? Number(match[1]) : null
        for await (const row of readNdjson(file)) {
          const record = row as SeedRecord
          if (!tierKeys.has(record.key)) continue
          const seedNumber = typeof record.seed === 'number' ? record.seed : fileSeed
          if (seedNumber === null || !Number.isInteger(seedNumber)) {
            counters.bump('seed rows with no seed number (skipped)')
            continue
          }
          if (seedNumber < 1 || seedNumber > 17) {
            counters.bump('seed rows outside seeds 1-17 (skipped)')
            continue
          }
          const perKey = seeds.get(record.key) ?? new Map<number, SeedRecord>()
          perKey.set(seedNumber, record)
          seeds.set(record.key, perKey)
        }
      }
    } else {
      counters.bump('derived seed files absent at load time')
    }

    const questions = new Map<string, QuestionRow[]>()
    const questionsDir = join(DATA, 'questions')
    if (existsSync(questionsDir)) {
      for (const file of await batchFiles(questionsDir, 'batch-')) {
        for await (const row of readNdjson(file)) {
          const record = row as { key?: string; questions?: QuestionRow[] } & QuestionRow
          if (typeof record.key !== 'string' || !tierKeys.has(record.key)) continue
          if (Array.isArray(record.questions)) {
            questions.set(record.key, record.questions)
            continue
          }
          if (typeof record.block === 'string' && typeof record.text === 'string') {
            const list = questions.get(record.key) ?? []
            list.push(record)
            questions.set(record.key, list)
            continue
          }
          throw new Error(
            `Unrecognised question row in ${file}: expected { key, questions: [...] } or a flat ` +
              'row carrying block and text. Refusing to guess the shape.',
          )
        }
      }
    } else {
      counters.bump('derived question files absent at load time')
    }

    const registry = new Map<string, RegistryMatchRecord['nctIds']>()
    const matchesDir = join(DATA, 'registry', 'matches')
    if (existsSync(matchesDir)) {
      for (const file of await batchFiles(matchesDir, 'batch-')) {
        for await (const row of readNdjson(file)) {
          const record = row as RegistryMatchRecord
          if (tierKeys.has(record.key)) registry.set(record.key, record.nctIds ?? [])
        }
      }
    }

    /* ---- 5. redirects grouped by the target page ------------------------------------------- */

    const redirectsByTargetKey = new Map<string, Disposition[]>()
    for (const row of dispositions) {
      if (row.disposition !== 'REDIRECT') continue
      const list = redirectsByTargetKey.get(row.key) ?? []
      list.push(row)
      redirectsByTargetKey.set(row.key, list)
    }

    /* ---- 6. the indexable threshold -------------------------------------------------------- */

    const threshold = await indexableThreshold(option('indexable-threshold'), counters)
    process.stdout.write(`Indexable threshold: ${threshold} present fields.\n`)

    /* ---- 7. batches ------------------------------------------------------------------------ */

    await mkdir(join(loadDir, `tier-${tier}`), { recursive: true })
    const totals = {
      batches: 0,
      skipped: 0,
      pages: 0,
      synonyms: 0,
      fields: 0,
      seeds: 0,
      questions: 0,
      relations: 0,
      sources: 0,
      registryStudies: 0,
      redirects: 0,
    }
    // Coverage of the five facet columns, reported so a load says how much of the triplet the
    // inputs actually supplied rather than implying every page carries one.
    const columnsFilled = {
      atc_codes: 0,
      entity_class: 0,
      top_rung: 0,
      human_data: 0,
      evidence_tier: 0,
    }

    for (let start = 0, batchNumber = 1; start < orderedKeys.length; start += batchSize) {
      if (totals.batches >= batchLimit) break
      const keys = orderedKeys.slice(start, start + batchSize)
      const built = buildBatch({
        keys,
        tier,
        threshold,
        identity,
        assignments,
        suppression,
        fields,
        seeds,
        questions,
        registry,
        slugByKey,
        legacyDrugIdBySlug,
        legacyEntityClassBySlug,
        chembl,
        redirectsByTargetKey,
        ledger,
        counters,
      })

      const markerPath = join(
        loadDir,
        `tier-${tier}`,
        `batch-${String(batchNumber).padStart(4, '0')}.json`,
      )
      const recorded = await readMarker(markerPath)
      if (recorded !== null && recorded.inputDigest === built.inputDigest) {
        if (recorded.target === target) {
          totals.batches += 1
          totals.skipped += 1
          process.stdout.write(
            `batch ${batchNumber}: recorded already (${keys.length} pages) — no database work.\n`,
          )
          batchNumber += 1
          continue
        }
        process.stdout.write(
          `batch ${batchNumber}: marker was written against ${
            recorded.target === null ? 'an unrecorded database' : 'a different database'
          } — loading it here.\n`,
        )
      }

      if (!dryRun) await writeBatch(client, built)

      totals.batches += 1
      totals.pages += built.pages.length
      totals.synonyms += built.synonyms.length
      totals.fields += built.fieldRows.length
      totals.seeds += built.seedRows.length
      totals.questions += built.questionRows.length
      totals.relations += built.relationRows.length
      totals.sources += built.sourceRows.length
      totals.registryStudies += built.registryRows.length
      totals.redirects += built.redirectRows.length
      for (const page of built.pages) {
        if (page.atcCodes.length > 0) columnsFilled.atc_codes += 1
        if (page.entityClass !== null) columnsFilled.entity_class += 1
        if (page.topRung !== null) columnsFilled.top_rung += 1
        if (page.humanData !== null) columnsFilled.human_data += 1
        if (page.evidenceTier !== null) columnsFilled.evidence_tier += 1
      }

      process.stdout.write(
        `batch ${batchNumber}: ${built.pages.length} pages · ${built.fieldRows.length} fields · ` +
          `${built.synonyms.length} synonyms · ${built.registryRows.length} studies · ` +
          `${built.redirectRows.length} redirects${dryRun ? ' (dry run)' : ''}\n`,
      )

      if (!dryRun) {
        await writeFile(
          markerPath,
          `${JSON.stringify(
            {
              schema: 'rnawiki-corpus-20k-load/v1',
              tier,
              batch: batchNumber,
              inputDigest: built.inputDigest,
              target,
              pages: built.pages.length,
              rows: {
                corpus_pages: built.pages.length,
                page_synonyms: built.synonyms.length,
                page_fields: built.fieldRows.length,
                page_seeds: built.seedRows.length,
                page_questions: built.questionRows.length,
                page_relations: built.relationRows.length,
                page_sources: built.sourceRows.length,
                page_registry_studies: built.registryRows.length,
                medicine_slug_redirects: built.redirectRows.length,
              },
              indexableThreshold: threshold,
              firstKey: keys[0],
              lastKey: keys[keys.length - 1],
              keys,
              at: new Date().toISOString(),
            },
            null,
            2,
          )}\n`,
          'utf8',
        )
        if (checkpoint) {
          await recordCheckpoint({
            stateRoot,
            tier,
            batch: batchNumber,
            markerPath,
            records: built.pages.length,
          })
        }
      }

      batchNumber += 1
    }

    /* ---- 8. report ------------------------------------------------------------------------- */

    process.stdout.write(`\nTier ${tier} ${dryRun ? 'dry run' : 'load'} finished.\n`)
    for (const [label, value] of Object.entries(totals)) {
      process.stdout.write(`  ${label}: ${value}\n`)
    }
    process.stdout.write('\nFacet columns filled (of the pages built this run):\n')
    for (const [label, value] of Object.entries(columnsFilled)) {
      process.stdout.write(`  ${label}: ${value}\n`)
    }
    const notes = counters.entries()
    if (notes.length > 0) {
      process.stdout.write('\nWhat the inputs did not supply:\n')
      for (const [label, value] of notes) process.stdout.write(`  ${label}: ${value}\n`)
    }
  } finally {
    await client.end()
  }
}

async function batchFiles(directory: string, prefix: string): Promise<string[]> {
  const names = await readdir(directory)
  return names
    .filter((name) => name.startsWith(prefix) && name.endsWith('.ndjson'))
    .sort()
    .map((name) => join(directory, name))
}

interface RecordedMarker {
  inputDigest: string | null
  /** Absent in a marker written before the target was recorded. */
  target: string | null
}

async function readMarker(path: string): Promise<RecordedMarker | null> {
  if (!existsSync(path)) return null
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8')) as {
      inputDigest?: string
      target?: string
    }
    return {
      inputDigest: typeof parsed.inputDigest === 'string' ? parsed.inputDigest : null,
      target: typeof parsed.target === 'string' ? parsed.target : null,
    }
  } catch {
    return null
  }
}

/**
 * Which database a marker belongs to: the sha256 of the host and the database name.
 *
 * A load against a disposable database, a rehearsal against the working database and the
 * production load all write markers into the same directory. Without this, the first of them makes
 * the others look done.
 */
export function loadTargetFingerprint(connectionString: string): string {
  const url = new URL(connectionString)
  return sha256(`${url.host.toLowerCase()}\n${url.pathname.replace(/^\//, '')}`)
}

async function indexableThreshold(
  override: string | undefined,
  counters: Counters,
): Promise<number> {
  if (override !== undefined) return Number(override)
  try {
    const state = JSON.parse(await readFile(join(DATA, 'state.json'), 'utf8')) as {
      gates?: Record<string, { figures?: Record<string, unknown> }>
    }
    const figures = state.gates?.['gate-1b']?.figures
    /* The gate records the present-field count as `threshold`; `indexableThreshold` is accepted
     * too, because a later gate entry may name it that way. Reading only the second name meant a
     * load silently fell back to the R15 stub floor of 3 with Gate 1b's own figure sitting in
     * state.json. */
    const recorded = figures?.indexableThreshold ?? figures?.threshold
    if (typeof recorded === 'number') return recorded
  } catch {
    /* state.json is optional here; the default below is used and reported. */
  }
  counters.bump('Gate 1b recorded no indexable threshold; the R15 stub floor of 3 was used')
  return 3
}

/* ------------------------------------------------------------------------------------------- */
/* Building one batch                                                                            */
/* ------------------------------------------------------------------------------------------- */

interface BuiltBatch {
  keys: string[]
  pages: PageRow[]
  synonyms: unknown[][]
  fieldRows: PageFieldRow[]
  seedRows: unknown[][]
  questionRows: unknown[][]
  relationRows: unknown[][]
  sourceRows: unknown[][]
  registryRows: unknown[][]
  redirectRows: unknown[][]
  inputDigest: string
}

function buildBatch(input: {
  keys: string[]
  tier: number
  threshold: number
  identity: Map<string, CanonicalRecord>
  assignments: Map<string, ModelAssignment>
  suppression: Map<string, SuppressionAssignment>
  fields: Map<string, FieldsRecord>
  seeds: Map<string, Map<number, SeedRecord>>
  questions: Map<string, QuestionRow[]>
  registry: Map<string, RegistryMatchRecord['nctIds']>
  slugByKey: Map<string, string>
  legacyDrugIdBySlug: Map<string, string>
  legacyEntityClassBySlug: Map<string, string>
  chembl: Map<string, ChemblMoleculeFacts>
  redirectsByTargetKey: Map<string, Disposition[]>
  ledger: Map<string, LedgerRedirect>
  counters: Counters
}): BuiltBatch {
  const { keys, tier, threshold, counters } = input
  const pages: PageRow[] = []
  const synonyms: unknown[][] = []
  const fieldRows: PageFieldRow[] = []
  const seedRows: unknown[][] = []
  const questionRows: unknown[][] = []
  const relationRows: unknown[][] = []
  const sourceRows: unknown[][] = []
  const registryRows: unknown[][] = []
  const redirectRows: unknown[][] = []
  // One row per old slug per batch: `ON CONFLICT DO UPDATE` cannot affect the same row twice in
  // one statement, and a repair could otherwise collide with a recorded disposition.
  const redirectOldSlugs = new Set<string>()
  const pushRedirect = (row: [string, string, string, string]): boolean => {
    if (redirectOldSlugs.has(row[0])) {
      counters.bump('redirect rows skipped: the old slug is already written in this batch')
      return false
    }
    redirectOldSlugs.add(row[0])
    redirectRows.push(row)
    return true
  }

  for (const key of keys) {
    const record = input.identity.get(key)
    const assignment = input.assignments.get(key)
    if (!record || !assignment) {
      counters.bump('pages missing an identity or model record (skipped)')
      continue
    }
    const slug = input.slugByKey.get(key)
    if (!slug) {
      counters.bump('pages with no assigned slug (skipped)')
      continue
    }
    const suppressionRow = input.suppression.get(key)
    if (!suppressionRow) counters.bump('pages with no suppression assignment (treated as cleared)')
    const suppressed = suppressionRow?.suppressed ?? false

    /* fields */
    const recordedFields = input.fields.get(key)
    const pageFieldRows: PageFieldRow[] = []
    if (!recordedFields) {
      counters.bump('pages with no extracted field record')
    } else {
      for (const [field, value] of Object.entries(recordedFields.fields)) {
        const isPresent = value.state === 'present'
        const note =
          nullIfBlank(value.note) ??
          (Array.isArray(value.consulted) && value.consulted.length > 0
            ? `consulted: ${value.consulted.join('; ')}`
            : null)
        pageFieldRows.push({
          key,
          field,
          ordinal: 0,
          state: value.state,
          value: value.value ?? null,
          sourceKind: isPresent ? nullIfBlank(value.source?.kind) : null,
          sourceId: isPresent ? nullIfBlank(value.source?.id) : null,
          sourceUrl: isPresent ? nullIfBlank(value.source?.url) : null,
          sourceDate: recordedDate(value.sourceDate, counters),
          lastVerified: recordedDate(value.lastVerified, counters),
          verbatim: Boolean(value.verbatim),
          note,
        })
        if (!isPresent && value.source) counters.bump('source dropped from a non-present field row')
      }
    }
    fieldRows.push(...pageFieldRows)

    const presentFieldCount = pageFieldRows.filter((row) => row.state === 'present').length
    const applicableFieldCount = pageFieldRows.filter(
      (row) => row.state !== 'not-applicable',
    ).length
    const pageType = pageTypeOf({
      tier,
      model: assignment.model,
      withdrawn: assignment.withdrawn,
      presentFieldCount,
    })
    const indexable = tier <= 2 && pageType !== 'stub' && presentFieldCount >= threshold

    /* sources, from the present field rows only */
    const perSource = new Map<
      string,
      { kind: string; id: string; url: string | null; date: string | null }
    >()
    const licences = new Set<string>()
    for (const row of pageFieldRows) {
      if (row.state !== 'present' || row.sourceKind === null) continue
      const id = row.sourceId ?? row.sourceKind
      const identifier = `${row.sourceKind} ${id} ${row.sourceUrl ?? ''}`
      const held = perSource.get(identifier)
      if (!held || (row.sourceDate ?? '') > (held.date ?? '')) {
        perSource.set(identifier, {
          kind: row.sourceKind,
          id,
          url: row.sourceUrl,
          date: row.sourceDate,
        })
      }
      const mapped = licencesFor(row.sourceKind)
      if (mapped.length === 0)
        counters.bump(`source kind with no recorded licence: ${row.sourceKind}`)
      for (const licence of mapped) licences.add(licence)
    }
    /* the five facet columns: ATC codes, entity class and the badge triplet */
    const chemblFacts = record.chemblId ? input.chembl.get(record.chemblId) : undefined
    const atcCodes = chemblFacts?.atcCodes ?? []
    if (atcCodes.length > 0) licences.add(ATC_LICENCE)
    else if (record.chemblId && !chemblFacts) {
      counters.bump('pages whose ChEMBL id is not in the recorded molecule pages')
    }

    const entityClass =
      recordedEntityClass(recordedFields?.fields.regulatory) ??
      input.legacyEntityClassBySlug.get(slug) ??
      chemblFacts?.moleculeType ??
      null
    if (entityClass === null) counters.bump('pages with no recorded entity class')

    const registeredStudies = (input.registry.get(key) ?? []).length
    const triplet = badgeTriplet({
      ladder: recordedFields?.fields.organismLadder,
      registeredStudies,
    })
    if (triplet.topRung === null) counters.bump('pages with no recorded organism')

    for (const source of perSource.values()) {
      sourceRows.push([
        sha256(`${key} ${source.kind} ${source.id} ${source.url ?? ''}`),
        key,
        source.kind,
        source.id.slice(0, 200),
        source.url,
        source.date,
        null,
        licencesFor(source.kind).join(' · ') || null,
      ])
    }

    pages.push({
      key,
      slug,
      displayName: stripControlCharacters(record.displayName, counters) ?? key,
      model: assignment.model,
      tier,
      pageType,
      indexable,
      suppressed,
      suppressionClasses: suppressionRow?.classes ?? [],
      withdrawn: assignment.withdrawn,
      presentFieldCount,
      applicableFieldCount,
      structureInchikey: nullIfBlank(record.structure?.inchikey),
      unii: nullIfBlank(record.unii),
      chemblId: nullIfBlank(record.chemblId),
      pubchemCid: nullIfBlank(record.cid),
      cas: nullIfBlank(record.cas),
      rxcui: nullIfBlank(record.rxcui),
      legacyDrugId: input.legacyDrugIdBySlug.get(slug) ?? null,
      identityRank: record.keyRank ?? 'NONE',
      identityRule: record.ruleId ?? 'NO-KEY',
      licenceNotes: [...licences].sort(),
      corpusDigest: corpusDigestOf(pageFieldRows),
      atcCodes,
      entityClass,
      topRung: triplet.topRung,
      humanData: triplet.humanData,
      evidenceTier: triplet.evidenceTier,
    })

    /* synonyms */
    const seenSynonyms = new Set<string>()
    for (const synonym of record.synonyms ?? []) {
      const name = stripControlCharacters(synonym.name, counters)
      if (name === null) continue
      if (!SYNONYM_KINDS.has(synonym.kind)) {
        counters.bump(`synonym kind outside the recorded vocabulary: ${synonym.kind}`)
        continue
      }
      const id = sha256(`${key} ${synonym.kind} ${name.toLowerCase()}`)
      if (seenSynonyms.has(id)) continue
      seenSynonyms.add(id)
      synonyms.push([id, key, name, synonym.kind, (synonym.source ?? '').slice(0, 64)])
    }

    /* relations */
    const seenRelations = new Set<string>()
    for (const relation of record.relations ?? []) {
      if (!RELATION_KINDS.has(relation.type)) {
        counters.bump(`relation type outside the recorded vocabulary: ${relation.type}`)
        continue
      }
      if (relation.targetKey === key) {
        counters.bump('self-relations dropped')
        continue
      }
      const id = sha256(`${key} ${relation.type} ${relation.targetKey}`)
      if (seenRelations.has(id)) continue
      seenRelations.add(id)
      relationRows.push([id, key, relation.type, relation.targetKey, null, 'identity-resolution'])
    }

    /* seeds — R2 is enforced here as well as by the database trigger */
    for (const [seed, row] of input.seeds.get(key) ?? []) {
      if (suppressed && [1, 2, 6].includes(seed)) {
        counters.bump('seed 1/2/6 rows withheld from a suppressed page (R2)')
        continue
      }
      seedRows.push([
        key,
        seed,
        JSON.stringify(row.values ?? {}),
        JSON.stringify(row.sources ?? []),
      ])
    }

    /* questions */
    const pageQuestions = input.questions.get(key) ?? []
    pageQuestions.forEach((question, ordinal) => {
      const text = nullIfBlank(question.text)
      if (text === null) {
        counters.bump('question rows with no text (skipped)')
        return
      }
      questionRows.push([
        key,
        ordinal,
        question.block,
        question.template ?? question.id ?? question.block,
        text,
        nullIfBlank(question.paragraph1 ?? question.paragraph_1),
        nullIfBlank(question.paragraph2 ?? question.paragraph_2),
        JSON.stringify(question.anchors ?? []),
        JSON.stringify(question.revealed ?? []),
      ])
    })

    /* registry studies */
    const seenStudies = new Set<string>()
    for (const study of input.registry.get(key) ?? []) {
      const matchedName = nullIfBlank(study.matchedName)
      const id = sha256(`${key} ${study.nct} ${study.role} ${matchedName ?? ''}`)
      if (seenStudies.has(id)) continue
      seenStudies.add(id)
      registryRows.push([id, key, study.nct, study.role.slice(0, 32), matchedName])
    }

    /* redirects onto this page */
    for (const redirect of input.redirectsByTargetKey.get(key) ?? []) {
      /*
       * Where this redirect actually lands. The page's own slug when the page has a legacy row,
       * otherwise the slug the disposition named. If that landing slug is itself an old slug the
       * ledger already redirects, following it here is what keeps the row one hop: writing it as
       * recorded would make this the first hop of a chain, and resolvePublicMedicineRoute answers
       * 404 for a chain.
       */
      const landingSlug = input.legacyDrugIdBySlug.has(slug) ? slug : redirect.targetSlug
      let targetSlug = landingSlug
      if (landingSlug !== null && landingSlug !== undefined && input.ledger.has(landingSlug)) {
        const terminal = terminalSlugOf(landingSlug, input.ledger)
        if (terminal === null) {
          counters.bump('REDIRECT rows skipped: the recorded target sits on a ledger cycle')
          continue
        }
        targetSlug = terminal
        counters.bump('REDIRECT rows re-pointed: the recorded target is itself an old slug')
      }
      const targetDrugId = targetSlug ? input.legacyDrugIdBySlug.get(targetSlug) : undefined
      if (!targetDrugId) {
        counters.bump('REDIRECT rows skipped: the target page has no legacy drugs row')
        continue
      }
      if (redirect.slug === targetSlug) {
        counters.bump('REDIRECT rows skipped: the old slug is the target slug')
        continue
      }
      const rationale = nullIfBlank(redirect.reason)
      if (rationale === null) {
        counters.bump('REDIRECT rows skipped: the disposition states no reason')
        continue
      }
      if (!pushRedirect([redirect.slug, targetDrugId, 'MERGED', rationale])) continue

      /*
       * The other direction. Any ledger row already pointing at the slug this row is turning into
       * an old slug would become a first hop the moment this batch commits, so it is re-pointed
       * here, in the same transaction, keeping its own recorded reason and rationale.
       */
      for (const held of input.ledger.values()) {
        if (held.targetSlug !== redirect.slug) continue
        if (held.oldSlug === targetSlug) {
          counters.bump('ledger rows left alone: re-pointing them would make a loop')
          continue
        }
        if (!pushRedirect([held.oldSlug, targetDrugId, held.reason, held.rationale])) continue
        held.targetSlug = targetSlug ?? held.targetSlug
        counters.bump('ledger rows re-pointed: this load turned their target into an old slug')
      }
      input.ledger.set(redirect.slug, {
        oldSlug: redirect.slug,
        targetSlug: targetSlug ?? '',
        reason: 'MERGED',
        rationale,
      })
    }
  }

  const inputDigest = sha256(
    canonicalJson({
      pages,
      synonyms,
      fieldRows,
      seedRows,
      questionRows,
      relationRows,
      sourceRows,
      registryRows,
      redirectRows,
    }),
  )

  return {
    keys,
    pages,
    synonyms,
    fieldRows,
    seedRows,
    questionRows,
    relationRows,
    sourceRows,
    registryRows,
    redirectRows,
    inputDigest,
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Writing one batch                                                                             */
/* ------------------------------------------------------------------------------------------- */

async function writeBatch(client: Client, built: BuiltBatch): Promise<void> {
  await client.query('BEGIN')
  try {
    const keys = built.pages.map((page) => page.key)

    // Children first. A page that has just become suppressed must lose its seed 1/2/6 rows before
    // the page row is written, or the suppression trigger aborts the transaction.
    for (const table of [
      'page_seeds',
      'page_questions',
      'page_synonyms',
      'page_fields',
      'page_relations',
      'page_sources',
      'page_registry_studies',
    ]) {
      await client.query(`DELETE FROM "${table}" WHERE key = ANY($1::varchar[])`, [keys])
    }

    await insertRows(
      client,
      'corpus_pages',
      [
        'key',
        'slug',
        'display_name',
        'model',
        'tier',
        'page_type',
        'indexable',
        'suppressed',
        'suppression_classes',
        'withdrawn',
        'present_field_count',
        'applicable_field_count',
        'structure_inchikey',
        'unii',
        'chembl_id',
        'pubchem_cid',
        'cas',
        'rxcui',
        'legacy_drug_id',
        'identity_rank',
        'identity_rule',
        'licence_notes',
        'corpus_digest',
        'atc_codes',
        'entity_class',
        'top_rung',
        'human_data',
        'evidence_tier',
      ],
      built.pages.map((page) => [
        page.key,
        page.slug,
        page.displayName,
        page.model,
        page.tier,
        page.pageType,
        page.indexable,
        page.suppressed,
        page.suppressionClasses,
        page.withdrawn,
        page.presentFieldCount,
        page.applicableFieldCount,
        page.structureInchikey,
        page.unii,
        page.chemblId,
        page.pubchemCid,
        page.cas,
        page.rxcui,
        page.legacyDrugId,
        page.identityRank,
        page.identityRule,
        page.licenceNotes,
        page.corpusDigest,
        page.atcCodes,
        page.entityClass,
        page.topRung,
        page.humanData,
        page.evidenceTier,
      ]),
      `ON CONFLICT ("key") DO UPDATE SET
         "slug" = EXCLUDED."slug",
         "display_name" = EXCLUDED."display_name",
         "model" = EXCLUDED."model",
         "tier" = EXCLUDED."tier",
         "page_type" = EXCLUDED."page_type",
         "indexable" = EXCLUDED."indexable",
         "suppressed" = EXCLUDED."suppressed",
         "suppression_classes" = EXCLUDED."suppression_classes",
         "withdrawn" = EXCLUDED."withdrawn",
         "present_field_count" = EXCLUDED."present_field_count",
         "applicable_field_count" = EXCLUDED."applicable_field_count",
         "structure_inchikey" = EXCLUDED."structure_inchikey",
         "unii" = EXCLUDED."unii",
         "chembl_id" = EXCLUDED."chembl_id",
         "pubchem_cid" = EXCLUDED."pubchem_cid",
         "cas" = EXCLUDED."cas",
         "rxcui" = EXCLUDED."rxcui",
         "legacy_drug_id" = EXCLUDED."legacy_drug_id",
         "identity_rank" = EXCLUDED."identity_rank",
         "identity_rule" = EXCLUDED."identity_rule",
         "licence_notes" = EXCLUDED."licence_notes",
         "corpus_digest" = EXCLUDED."corpus_digest",
         "atc_codes" = EXCLUDED."atc_codes",
         "entity_class" = EXCLUDED."entity_class",
         "top_rung" = EXCLUDED."top_rung",
         "human_data" = EXCLUDED."human_data",
         "evidence_tier" = EXCLUDED."evidence_tier",
         "updated_at" = now()`,
    )

    await insertRows(
      client,
      'page_synonyms',
      ['id', 'key', 'name', 'kind', 'source'],
      built.synonyms,
      'ON CONFLICT ("id") DO NOTHING',
    )

    await insertRows(
      client,
      'page_fields',
      [
        'key',
        'field',
        'ordinal',
        'state',
        'value',
        'source_kind',
        'source_id',
        'source_url',
        'source_date',
        'last_verified',
        'verbatim',
        'note',
      ],
      built.fieldRows.map((row) => [
        row.key,
        row.field,
        row.ordinal,
        row.state,
        row.value === null || row.value === undefined ? null : JSON.stringify(row.value),
        row.sourceKind,
        row.sourceId === null ? null : row.sourceId.slice(0, 200),
        row.sourceUrl,
        row.sourceDate,
        row.lastVerified,
        row.verbatim,
        row.note,
      ]),
      'ON CONFLICT ("key", "field", "ordinal") DO NOTHING',
    )

    await insertRows(
      client,
      'page_seeds',
      ['key', 'seed', 'values', 'sources'],
      built.seedRows,
      'ON CONFLICT ("key", "seed") DO NOTHING',
    )

    await insertRows(
      client,
      'page_questions',
      [
        'key',
        'ordinal',
        'block',
        'template',
        'text',
        'paragraph_1',
        'paragraph_2',
        'anchors',
        'revealed',
      ],
      built.questionRows,
      'ON CONFLICT ("key", "ordinal") DO NOTHING',
    )

    await insertRows(
      client,
      'page_relations',
      ['id', 'key', 'relation', 'target_key', 'label', 'source'],
      built.relationRows,
      'ON CONFLICT ("id") DO NOTHING',
    )

    await insertRows(
      client,
      'page_sources',
      ['id', 'key', 'source_kind', 'source_id', 'source_url', 'source_date', 'title', 'licence'],
      built.sourceRows,
      'ON CONFLICT ("id") DO NOTHING',
    )

    await insertRows(
      client,
      'page_registry_studies',
      ['id', 'key', 'nct', 'role', 'matched_name'],
      built.registryRows,
      'ON CONFLICT ("id") DO NOTHING',
    )

    await insertRows(
      client,
      'medicine_slug_redirects',
      ['old_slug', 'target_drug_id', 'reason', 'rationale'],
      built.redirectRows,
      `ON CONFLICT ("old_slug") DO UPDATE SET
         "target_drug_id" = EXCLUDED."target_drug_id",
         "reason" = EXCLUDED."reason",
         "rationale" = EXCLUDED."rationale"`,
    )

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Checkpoint                                                                                    */
/* ------------------------------------------------------------------------------------------- */

function recordCheckpoint(input: {
  stateRoot: string
  tier: number
  batch: number
  markerPath: string
  records: number
}): Promise<void> {
  const args = [
    'tsx',
    BATCH_SCRIPT,
    '--phase',
    '5',
    '--step',
    `materialise-tier-${input.tier}`,
    '--batch',
    String(input.batch),
    '--file',
    input.markerPath,
    '--records',
    String(input.records),
  ]
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn('npx', args, {
      cwd: input.stateRoot,
      stdio: ['ignore', 'ignore', 'inherit'],
      shell: false,
    })
    child.once('error', rejectPromise)
    child.once('exit', (code) => {
      if (code === 0) resolvePromise()
      else rejectPromise(new Error(`batch.ts checkpoint exited with code ${code}.`))
    })
  })
}

const entry = process.argv[1] ? fileURLToPath(import.meta.url) === resolve(process.argv[1]) : false
if (entry) {
  main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
    process.exitCode = 1
  })
}
