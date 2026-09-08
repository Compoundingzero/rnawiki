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
 *   --revamp                load the revamp 2026-09 corpus: canonical-v5, fields-v2, derived-v2,
 *                           questions-v2, the controlled-substance suppression assignments, and the
 *                           Phase 4 blocks migration 0026 adds (docs/specs/phase4-generators.md).
 *                           Without it the corpus-20k inputs load exactly as before.
 *   --dry-run               read, derive and report; touch neither the database nor any marker
 *   --batches n             stop after n batches (a smoke load)
 *   --batch-size n          default 250
 *   --load-dir <dir>        marker directory, default data/corpus-20k/load
 *   --state-root <dir>      working directory for the batch.ts checkpoint, default the repo root
 *   --no-checkpoint         skip the batch.ts checkpoint call
 *   --indexable-threshold n one floor for `indexable`, for every tier; default: Gate 1b, else 3
 *   --thresholds <file>     the ruler's own per-tier thresholds, e.g.
 *                           data/revamp/thresholds-v6.json — an object whose `tiers.tier1`,
 *                           `tiers.tier2` and `tiers.tier3` each carry a `threshold`. A tier whose
 *                           threshold is null selects no page. Overrides --indexable-threshold.
 *   --presence <file>       the ruler's present-over-applicable count per page, e.g.
 *                           data/revamp/presence-applicable-v6.ndjson. Defaults to the file
 *                           beside --thresholds carrying the same suffix. Without it the load
 *                           counts present fields and reports that it did.
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
 *
 * Phase 4. Under `--revamp` the load also writes `page_registration`, `page_interactions`,
 * `page_patent`, `page_controlled`, `page_sections` and `page_display_names`, sets
 * `corpus_pages.controlled` from the recorded controlled-substance trigger, and carries the Phase 3
 * form note onto `page_relations.note`. Two things follow from that trigger and are enforced here as
 * well as by migration 0026's triggers: seeds 1, 2 and 6 and the dose, bioavailability, n-of-1 and
 * time-to-signal question blocks are withheld from a controlled page. The Phase 3 trial
 * reassignments move a registry study from a salt or ester page to the parent the registry named,
 * and the Phase 3 redirect plan joins the recorded dispositions so it goes through the same
 * one-hop chain repair as every other redirect.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream, existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

import 'dotenv/config'
import { Client } from 'pg'

import { databaseSslConfig, isLocalDatabaseHost } from '@/db/ssl'
import {
  aggregateWithoutMovedStudies,
  checkedSourcesStatement,
  CONTROLLED_WITHHELD_BLOCKS,
  interactionLine,
  movedTrialsSentence,
  printedDisplayName,
  type InteractionRow,
} from '../render/page-text'

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
  slots?: unknown
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
  values?: unknown
  sources?: unknown
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
  /** §13(14): the slug this page duplicates, where the rendered check held it. */
  duplicateHoldOf: string | null
  suppressed: boolean
  suppressionClasses: string[]
  withdrawn: boolean
  presentFieldCount: number
  applicableFieldCount: number
  presentApplicableCount: number
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
  /** The controlled-substance trigger of docs/specs/phase4-generators.md §4 (migration 0026). */
  controlled: boolean
  /** Which registers fired it, e.g. `SG-MDA-POISONS`. */
  controlledBasis: string[]
}

/* Phase 4 block rows (migration 0026). Written as positional arrays, like every other child row. */
type BlockRow = unknown[]

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
  // Migration 0026: the rest of the Phase 3 vocabulary. Without these a resolved relation — a salt
  // to its parent, a component to its product, a biosimilar to its originator — was dropped and
  // counted, so the pages the rendered duplicate check flagged could not link to what they are.
  'form-of',
  'related-form-of',
  'ionised-form-of',
  'component-of',
  'active-moiety-of',
  'same-structure-as',
  'originator-of',
  'parent-of',
])

/**
 * The identity stage writes `form_of`; the enum stores `form-of`. One spelling, converted once.
 * Reading the underscore spelling as unknown is what dropped 322 resolved relations on Tier 1.
 */
function relationKind(type: string): string {
  return type.trim().toLowerCase().replace(/_/g, '-')
}

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
  // Migration 0026: the name a page absorbed when Phase 3 merged two records into one.
  'merged-page',
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

  /*
   * The revamp 2026-09 sources (docs/data/LICENSES.md rows 17-35). Every string below is that
   * table's own reading of the licence the source publishes; a source whose terms were not
   * obtained — the MHRA products database, emc, the ARTG, the WITHDRAWN database, DDInter — is not
   * here, because none of it is joined into a page.
   */
  clinicaltrials: 'ClinicalTrials.gov — US Government work, public domain',
  drugcentral: 'DrugCentral 2023 — CC BY-SA 4.0',
  drugsfda: 'Drugs@FDA via openFDA — CC0 1.0 / US Government work',
  ema: 'EMA medicines report — reuse permitted with acknowledgement (Source: European Medicines Agency)',
  gsrs: 'FDA GSRS public data export — US Government work, public domain',
  'hsa-singapore':
    'HSA Listing of Registered Therapeutic Products, data.gov.sg — Singapore Open Data Licence v1.0',
  inxight: 'NCATS Inxight Drugs — public domain (US Government work, NCATS/NIH)',
  iuphar: 'IUPHAR/BPS Guide to PHARMACOLOGY 2026.2 — CC BY-SA 4.0 (contents); ODbL (database)',
  'openfda-ndc': 'openFDA NDC — CC0 1.0 / US Government work',
  "openfda-ndc, as recorded on this page's regulatory field":
    'openFDA NDC — CC0 1.0 / US Government work',
  'orange-purple-book':
    'FDA Orange Book and Purple Book data files — US Government work, public domain',
  pmda: 'PMDA List of Approved Products (New Drugs) — Public Data License 1.0 (Digital Agency of Japan)',
  pubchem: 'PubChem — public domain (NIH); PubChem-computed properties only',
  'sso-singapore':
    "Singapore Statutes Online — reproduced with the Attorney-General's Chambers' clause 13 permission; Singapore Government copyright",
  'tga-artg':
    'Poisons Standard (SUSMP), Federal Register of Legislation — CC BY 4.0 (sourced 6 September 2026)',
  uniprot: 'UniProt release 2026_03 — CC BY 4.0',
  /*
   * The withdrawal field's rows are ChEMBL drug_warning records, which carry ChEMBL's licence. The
   * WITHDRAWN database itself was not ingested (LICENSES.md row 26: no licence is published, and
   * the only one attaching to the work is non-commercial).
   */
  withdrawn: 'ChEMBL 37 drug warnings — CC BY-SA 3.0',
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
/* Phase 4 (revamp 2026-09) — the v3 corpus and the blocks migration 0026 adds                   */
/* ------------------------------------------------------------------------------------------- */

/**
 * `--revamp` points every input at the Phase 2–4 outputs and loads five more tables.
 *
 * The corpus-20k inputs stay the default, so a re-run of the original load is unchanged. What the
 * flag does is swap the identity spine for `canonical-v5`, the fields for `fields-v2`, the seeds
 * for `derived-v2`, the questions for `questions-v2` and the suppression assignments for the file
 * that carries the controlled-substance trigger, and then load the Phase 4 blocks
 * (`docs/specs/phase4-generators.md`) from `data/revamp/page-blocks`.
 *
 * Every safety this script already had holds: the production guard, the working-database refusal,
 * the fingerprinted markers, the child-rows-first delete order, and the redirect chain repair. The
 * redirect plan `data/revamp/identity/redirect-plan-v5.csv` joins the recorded dispositions and
 * goes through the same chain walk, so a Phase 3 merge cannot write a two-hop redirect either.
 */
const REVAMP = join(ROOT, 'data', 'revamp')

interface CorpusSources {
  label: string
  identity: string
  fieldDirs: string[]
  seedsDir: string
  questionsDir: string
  suppression: string
  loadDir: string
  /** Absent outside `--revamp`: the corpus-20k inputs carry no Phase 4 block. */
  blocksDir?: string
  reassignments?: string
  redirectPlan?: string
  /** §13(14): the pages held against a rendered duplicate. Absent outside `--revamp`. */
  duplicateHolds?: string
}

function corpusSources(revamp: boolean): CorpusSources {
  if (!revamp) {
    return {
      label: 'corpus-20k',
      identity: join(DATA, 'identity', 'canonical.ndjson'),
      fieldDirs: Object.values(MODEL_DIRECTORY).map((directory) => join(DATA, 'fields', directory)),
      seedsDir: join(DATA, 'derived'),
      questionsDir: join(DATA, 'questions'),
      suppression: join(DATA, 'suppression', 'assignments.ndjson'),
      loadDir: join(DATA, 'load'),
    }
  }
  return {
    label: 'revamp-2026-09',
    identity: join(REVAMP, 'identity', 'canonical-v6.ndjson'),
    fieldDirs: Object.values(MODEL_DIRECTORY).map((directory) =>
      join(REVAMP, 'fields-v2', directory),
    ),
    seedsDir: join(REVAMP, 'derived-v2'),
    questionsDir: join(REVAMP, 'questions-v2'),
    suppression: join(REVAMP, 'suppression', 'assignments-v2.ndjson'),
    loadDir: join(REVAMP, 'load'),
    blocksDir: join(REVAMP, 'page-blocks'),
    reassignments: join(REVAMP, 'identity', 'trial-reassignments-v5.csv'),
    redirectPlan: join(REVAMP, 'identity', 'redirect-plan-v5.csv'),
    duplicateHolds: join(REVAMP, 'identity', 'duplicate-holds.csv'),
  }
}

/** One page's Phase 4 blocks, as `scripts/revamp/page_blocks.py` wrote them. */
interface BlockBundle {
  key: string
  controlled?: boolean
  controlledBasis?: string[]
  registration?: Array<{
    jurisdiction: string
    label: string
    status: string
    detail?: string | null
    source?: string | null
    dateChecked?: string | null
    ordinal?: number
    component?: string | null
    line: string
    /** `not found`, `not cleared` or `not checked`, on a row that states only an absence (§11). */
    absence?: string | null
    /** True where the row belongs to the technical disclosure and never to a line (§13(6)). */
    disclosed?: boolean
    disclosure?: Record<string, unknown>
    provenance?: string[]
  }>
  controlledSchedules?: Array<Record<string, unknown>>
  patent?: Record<string, unknown>
  interactions?: {
    tiers?: Record<string, { inline?: unknown[]; disclosed?: unknown[]; total?: number }>
    checked?: { sourcesChecked?: string[]; date?: string }
  }
  sections?: Record<
    string,
    Array<{ values?: Record<string, unknown>; provenance?: unknown; templateId?: string | null }>
  >
  relations?: Array<{
    relation: string
    counterpartKey?: string
    note?: string | null
    rule?: string | null
  }>
  disambiguation?: {
    displayName?: string
    disambiguator?: string | null
    basis?: string | null
    collidesOn?: string | null
  }
  trialsMoved?: { count: number; toKey: string; toName: string; rule?: string }
}

/** A registry study Phase 3 moved from one page to another (§6; Phase 3 rule R14). */
interface TrialReassignment {
  nct: string
  fromKey: string
  toKey: string
  matchedName: string | null
}

/** A minimal CSV reader: a header row, quoted fields, embedded commas and doubled quotes. */
export function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"'
          index += 1
        } else quoted = false
      } else field += character
      continue
    }
    if (character === '"') quoted = true
    else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (character !== '\r') field += character
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  const header = rows.shift() ?? []
  return rows
    .filter((values) => values.some((value) => value.length > 0))
    .map((values) => {
      const record: Record<string, string> = {}
      header.forEach((name, index) => {
        record[name] = values[index] ?? ''
      })
      return record
    })
}

/** The `action=move` rows, which are the only ones that change where a study is recorded. */
async function readTrialReassignments(path: string | undefined): Promise<TrialReassignment[]> {
  if (!path || !existsSync(path)) return []
  const out: TrialReassignment[] = []
  for (const row of parseCsv(await readFile(path, 'utf8'))) {
    if (row.action !== 'move') continue
    const nct = nullIfBlank(row.nct)
    const fromKey = nullIfBlank(row.from_key)
    const toKey = nullIfBlank(row.to_key)
    if (!nct || !fromKey || !toKey) continue
    out.push({ nct, fromKey, toKey, matchedName: nullIfBlank(row.matched_name) })
  }
  return out
}

/**
 * The Phase 3 redirect plan, as dispositions the existing REDIRECT path already knows how to write.
 *
 * `redirect-plan-v5.csv` records the "-2" slugs a merge retired (`abarelix-2 -> abarelix`). Turning
 * them into `Disposition` rows means they go through `pushRedirect`, the ledger chain walk and the
 * one-hop rule with every other redirect this load writes, rather than through a second path that
 * would have to repeat those three protections.
 */
async function readRedirectPlan(
  path: string | undefined,
  keyBySlug: Map<string, string>,
  counters: Counters,
): Promise<Disposition[]> {
  if (!path || !existsSync(path)) return []
  const out: Disposition[] = []
  for (const row of parseCsv(await readFile(path, 'utf8'))) {
    const oldSlug = nullIfBlank(row.old_slug)
    const newSlug = nullIfBlank(row.new_slug)
    const reason = nullIfBlank(row.reason)
    if (!oldSlug || !newSlug || !reason) continue
    const key = keyBySlug.get(newSlug)
    if (!key) {
      counters.bump('redirect-plan rows skipped: the target slug is not a page in this corpus')
      continue
    }
    out.push({
      slug: oldSlug,
      disposition: 'REDIRECT',
      key,
      targetSlug: newSlug,
      reason,
    })
  }
  return out
}

/** Every page's Phase 4 blocks, for the keys of this tier. */
async function readBlockBundles(
  directory: string | undefined,
  tierKeys: ReadonlySet<string>,
  counters: Counters,
): Promise<Map<string, BlockBundle>> {
  const out = new Map<string, BlockBundle>()
  if (!directory || !existsSync(directory)) {
    counters.bump('Phase 4 block bundles absent; no block row was written')
    return out
  }
  for (const file of await batchFiles(directory, 'batch-')) {
    for await (const row of readNdjson(file)) {
      const record = row as BlockBundle
      if (typeof record.key === 'string' && tierKeys.has(record.key)) out.set(record.key, record)
    }
  }
  return out
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
  const revamp = flag('revamp')
  const sources = corpusSources(revamp)
  const batchSize = Number(option('batch-size') ?? 250)
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new Error('--batch-size must be >= 1.')
  const batchLimit = option('batches') ? Number(option('batches')) : Infinity
  const loadDirGiven = option('load-dir')
  // A marker records that a batch was written, and it is read on the next run. `--load-dir` with a
  // blank value, or with the next flag where its value should be, resolved to the working directory
  // and scattered `tier-1/batch-0001.json` into the repository root, where nothing looks for it: the
  // batch would then be re-run in full every time, and a marker naming a real database would sit
  // outside the load directory that is supposed to hold the record of that load.
  if (loadDirGiven !== undefined && (loadDirGiven.trim() === '' || loadDirGiven.startsWith('--'))) {
    throw new Error('--load-dir needs a directory; omit the flag to use the recorded default.')
  }
  const loadDir = resolve(loadDirGiven ?? sources.loadDir)
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

    process.stdout.write(`Corpus inputs: ${sources.label}.\n`)

    const suppression = new Map<string, SuppressionAssignment>()
    for await (const row of readNdjson(sources.suppression)) {
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
    for await (const row of readNdjson(sources.identity)) {
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
    for await (const row of readNdjson(sources.identity)) {
      const record = row as CanonicalRecord
      if (tierKeys.has(record.key)) identity.set(record.key, record)
    }

    const chembl = await readChemblMoleculeFacts(counters)
    process.stdout.write(`ChEMBL molecules read for ATC and molecule type: ${chembl.size}.\n`)

    const fields = new Map<string, FieldsRecord>()
    for (const modelDir of sources.fieldDirs) {
      if (!existsSync(modelDir)) continue
      for (const file of await batchFiles(modelDir, 'batch-')) {
        for await (const row of readNdjson(file)) {
          const record = row as FieldsRecord
          if (tierKeys.has(record.key)) fields.set(record.key, liftTopLevelFields(record, counters))
        }
      }
    }

    const seeds = new Map<string, Map<number, SeedRecord>>()
    const derivedDir = sources.seedsDir
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
    const questionsDir = sources.questionsDir
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

    /*
     * Phase 3 R14, extended in `docs/specs/phase4-generators.md` §6 from stereo descriptors to salt
     * and ester forms: a registry record that names the parent belongs to the parent's page. The
     * matches were computed before that decision, so the move is applied here — the study leaves the
     * form's page and joins the parent's, with the registry string that matched carried across and
     * the role recorded as what it is. A study the target page already holds is not added twice.
     */
    const reassignments = await readTrialReassignments(sources.reassignments)
    const movedOutByKey = new Map<string, Set<string>>()
    if (reassignments.length > 0) {
      const movedOut = movedOutByKey
      const movedIn = new Map<string, TrialReassignment[]>()
      for (const move of reassignments) {
        const out = movedOut.get(move.fromKey) ?? new Set<string>()
        out.add(move.nct)
        movedOut.set(move.fromKey, out)
        const into = movedIn.get(move.toKey) ?? []
        into.push(move)
        movedIn.set(move.toKey, into)
      }
      for (const [key, ncts] of movedOut) {
        const held = registry.get(key)
        if (!held) continue
        const kept = held.filter((study) => !ncts.has(study.nct))
        counters.bump('registry studies moved off a form page (R14)', held.length - kept.length)
        registry.set(key, kept)
      }
      for (const [key, moves] of movedIn) {
        if (!tierKeys.has(key)) continue
        const held = registry.get(key) ?? []
        const seen = new Set(held.map((study) => study.nct))
        for (const move of moves) {
          if (seen.has(move.nct)) {
            counters.bump('registry studies already recorded on the parent page (R14, no change)')
            continue
          }
          seen.add(move.nct)
          held.push({ nct: move.nct, matchedName: move.matchedName, role: 'parent-name' })
          counters.bump('registry studies moved onto a parent page (R14)')
        }
        registry.set(key, held)
      }
    }

    /*
     * The registry aggregate each page's question blocks are written from (migration 0027, §11).
     *
     * `scripts/revamp/page_text_v5.ts` reads these files and removes the studies Phase 3 moved to
     * another page before any builder sees them; the same correction is applied here, by the same
     * function, so the stored aggregate and the rendered one are the same object.
     */
    const registryAggregates = new Map<string, Record<string, unknown>>()
    const aggregatesDir = join(DATA, 'registry', 'aggregates')
    if (revamp && existsSync(aggregatesDir)) {
      for (const file of await batchFiles(aggregatesDir, 'batch-')) {
        for await (const row of readNdjson(file)) {
          const record = row as Record<string, unknown>
          const key = typeof record.key === 'string' ? record.key : undefined
          if (!key || !tierKeys.has(key)) continue
          const moved = movedOutByKey.get(key)
          registryAggregates.set(key, moved ? aggregateWithoutMovedStudies(record, moved) : record)
        }
      }
      process.stdout.write(`Registry aggregates read for this tier: ${registryAggregates.size}.\n`)
    }

    /* The Phase 4 blocks for this tier's pages (migration 0026). */
    const blocks = await readBlockBundles(sources.blocksDir, tierKeys, counters)
    if (blocks.size > 0) {
      process.stdout.write(`Phase 4 block bundles read for this tier: ${blocks.size}.\n`)
    }

    /* ---- 5. redirects grouped by the target page ------------------------------------------- */

    const keyBySlug = new Map<string, string>()
    for (const [key, slug] of slugByKey) keyBySlug.set(slug, key)
    for (const row of await readRedirectPlan(sources.redirectPlan, keyBySlug, counters)) {
      dispositions.push(row)
      counters.bump('redirect-plan rows added to the recorded dispositions')
    }

    const redirectsByTargetKey = new Map<string, Disposition[]>()
    for (const row of dispositions) {
      if (row.disposition !== 'REDIRECT') continue
      const list = redirectsByTargetKey.get(row.key) ?? []
      list.push(row)
      redirectsByTargetKey.set(row.key, list)
    }

    /*
     * §13(14): the pages held against a rendered duplicate. A held page is `noindex,follow` and
     * links to the page it duplicates, and the decision between the two is Felix's.
     */
    const duplicateHolds = await readDuplicateHolds(
      option('duplicate-holds') ?? sources.duplicateHolds ?? '',
      counters,
    )
    if (duplicateHolds.size > 0) {
      process.stdout.write(`Duplicate holds: ${duplicateHolds.size} page(s) held noindex,follow.\n`)
    }

    /* ---- 6. the indexable threshold, and the count it is read against ----------------------- */

    const thresholdsFile = option('thresholds')
    const presenceFile =
      option('presence') ?? (thresholdsFile ? presenceFileFor(thresholdsFile) : undefined)
    let threshold: number | null
    let presence = new Map<string, number>()
    if (thresholdsFile) {
      threshold = (await readTierThresholds(thresholdsFile, counters)).get(tier) ?? null
      if (presenceFile && existsSync(presenceFile)) {
        presence = await readPresenceCounts(presenceFile)
        process.stdout.write(
          `Present-and-applicable counts read for ${presence.size} pages from ` +
            `${presenceFile}.\n`,
        )
      } else {
        counters.bump(
          'no presence file beside the thresholds file; present-and-applicable falls back to the ' +
            'present-field count',
        )
      }
      process.stdout.write(
        threshold === null
          ? `Tier ${tier} has no threshold in ${thresholdsFile}: no page in it is indexable.\n`
          : `Indexable threshold for tier ${tier}: ${threshold} present-and-applicable fields ` +
              `(${thresholdsFile}).\n`,
      )
    } else {
      threshold = await indexableThreshold(option('indexable-threshold'), counters)
      process.stdout.write(`Indexable threshold: ${threshold} present fields.\n`)
    }

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
      registration: 0,
      interactions: 0,
      patent: 0,
      controlled: 0,
      sections: 0,
      displayNames: 0,
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
        presence,
        duplicateHolds,
        registryAggregates,
        identity,
        assignments,
        suppression,
        fields,
        seeds,
        questions,
        registry,
        blocks,
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
      totals.registration += built.registrationRows.length
      totals.interactions += built.interactionRows.length
      totals.patent += built.patentRows.length
      totals.controlled += built.controlledRows.length
      totals.sections += built.sectionRows.length
      totals.displayNames += built.displayNameRows.length
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
                page_registration: built.registrationRows.length,
                page_interactions: built.interactionRows.length,
                page_patent: built.patentRows.length,
                page_controlled: built.controlledRows.length,
                page_sections: built.sectionRows.length,
                page_display_names: built.displayNameRows.length,
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

/**
 * The ruler's numerator and the loader's numerator are one number (§11).
 *
 * `derive_threshold.py` writes both halves: `thresholds-<tag>.json` carries a threshold per tier,
 * and `presence-applicable-<tag>.ndjson` carries, for every page, how many of its fields are
 * present *and* applicable. A load given the thresholds file reads the presence file beside it, so
 * a page is called indexable on exactly the count the threshold was derived from.
 */
async function readTierThresholds(
  file: string,
  counters: Counters,
): Promise<Map<number, number | null>> {
  const parsed = JSON.parse(await readFile(file, 'utf8')) as {
    tiers?: Record<string, { threshold?: number | null }>
  }
  const tiers = parsed.tiers
  if (!tiers) throw new Error(`${file} carries no \`tiers\` object.`)
  const out = new Map<number, number | null>()
  for (const tier of [1, 2, 3]) {
    const held = tiers[`tier${tier}`]
    if (held === undefined) throw new Error(`${file} carries no threshold for tier ${tier}.`)
    const value = held.threshold
    if (value === null || value === undefined) {
      out.set(tier, null)
      counters.bump(`tier ${tier} has no threshold in the ruler's file; no page is indexable`)
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      out.set(tier, value)
    } else {
      throw new Error(`${file} carries a non-numeric threshold for tier ${tier}.`)
    }
  }
  return out
}

/** page → present-and-applicable count, as the ruler counted it. */
/**
 * The duplicate holds (docs/specs/phase4-generators.md §13 item 14): page key → the slug it links to.
 *
 * Where two indexable pages still measure at or above 0.5 on the rendered duplicate check after
 * every generator rule has been applied, the page with fewer own facts is held: it carries
 * `noindex,follow` and a link to the other until Felix decides which page the corpus keeps.
 * `scripts/revamp/duplicate_holds.py` measures the two sides and writes the file; this reads it.
 * A missing file is not an error — it means the check found no such pair.
 */
async function readDuplicateHolds(file: string, counters: Counters): Promise<Map<string, string>> {
  const out = new Map<string, string>()
  let text: string
  try {
    text = await readFile(file, 'utf8')
  } catch {
    counters.bump('no duplicate-hold file: no indexable pair is held')
    return out
  }
  for (const row of parseCsv(text)) {
    const key = row.held_key?.trim()
    const link = row.link_slug?.trim()
    if (!key || !link) continue
    out.set(key, link)
  }
  return out
}

async function readPresenceCounts(file: string): Promise<Map<string, number>> {
  const out = new Map<string, number>()
  for await (const row of readNdjson(file)) {
    const record = row as { key?: string; present?: number }
    if (typeof record.key === 'string' && typeof record.present === 'number') {
      out.set(record.key, record.present)
    }
  }
  return out
}

/** The presence file that belongs to a thresholds file: the same suffix, the same directory. */
export function presenceFileFor(thresholdsFile: string): string {
  const name = thresholdsFile.replace(/\\/g, '/').split('/').pop() ?? thresholdsFile
  const suffix = /^thresholds(.*)\.json$/.exec(name)?.[1] ?? ''
  return join(dirname(thresholdsFile), `presence-applicable${suffix}.ndjson`)
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
  /** One row per page holding a registry aggregate, migration 0027. Empty outside `--revamp`. */
  registryAggregateRows: unknown[][]
  synonyms: unknown[][]
  fieldRows: PageFieldRow[]
  seedRows: unknown[][]
  questionRows: unknown[][]
  relationRows: unknown[][]
  sourceRows: unknown[][]
  registryRows: unknown[][]
  redirectRows: unknown[][]
  /* Phase 4 blocks, migration 0026. Empty outside `--revamp`. */
  registrationRows: BlockRow[]
  interactionRows: BlockRow[]
  patentRows: BlockRow[]
  controlledRows: BlockRow[]
  sectionRows: BlockRow[]
  displayNameRows: BlockRow[]
  inputDigest: string
}

function buildBatch(input: {
  keys: string[]
  tier: number
  /** The tier's own floor, or null where the ruler selected no count for it (§11). */
  threshold: number | null
  /** page → present-and-applicable count, the ruler's numerator. Empty where none was supplied. */
  presence: Map<string, number>
  /** §13(14): page → the slug it duplicates. A held page is never indexable. */
  duplicateHolds: Map<string, string>
  /** page → the registry aggregate the body builders read. Empty outside `--revamp`. */
  registryAggregates: Map<string, Record<string, unknown>>
  identity: Map<string, CanonicalRecord>
  assignments: Map<string, ModelAssignment>
  suppression: Map<string, SuppressionAssignment>
  fields: Map<string, FieldsRecord>
  seeds: Map<string, Map<number, SeedRecord>>
  questions: Map<string, QuestionRow[]>
  registry: Map<string, RegistryMatchRecord['nctIds']>
  /** The Phase 4 blocks for this batch's pages. Empty outside `--revamp`. */
  blocks: Map<string, BlockBundle>
  slugByKey: Map<string, string>
  legacyDrugIdBySlug: Map<string, string>
  legacyEntityClassBySlug: Map<string, string>
  chembl: Map<string, ChemblMoleculeFacts>
  redirectsByTargetKey: Map<string, Disposition[]>
  ledger: Map<string, LedgerRedirect>
  counters: Counters
}): BuiltBatch {
  const { keys, tier, threshold, counters } = input
  const registryAggregateRows: unknown[][] = []
  const pages: PageRow[] = []
  const synonyms: unknown[][] = []
  const fieldRows: PageFieldRow[] = []
  const seedRows: unknown[][] = []
  const questionRows: unknown[][] = []
  const relationRows: unknown[][] = []
  const sourceRows: unknown[][] = []
  const registryRows: unknown[][] = []
  const redirectRows: unknown[][] = []
  const registrationRows: BlockRow[] = []
  const interactionRows: BlockRow[] = []
  const patentRows: BlockRow[] = []
  const controlledRows: BlockRow[] = []
  const sectionRows: BlockRow[] = []
  const displayNameRows: BlockRow[] = []
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
    /*
     * The controlled-substance trigger (docs/specs/phase4-generators.md §4). It is read from the
     * block bundle, which carries the decision `scripts/revamp/controlled_suppression.py` recorded;
     * nothing here re-derives it from the schedule rows, because those hold every Poisons Standard
     * entry from Schedule 2 up and reading them as the trigger would withhold a dose block from a
     * pharmacy medicine.
     */
    const controlled = input.blocks.get(key)?.controlled === true
    const controlledBasis = input.blocks.get(key)?.controlledBasis ?? []

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
    /*
     * §11: present over *applicable*, at this tier's own threshold. The ruler counts a field
     * present only where it is also applicable — a field no Phase 2 source filled anywhere, and a
     * field a structural rule removes from this page, leave both halves of the fraction — so a
     * loader counting present fields against one corpus-wide number was selecting a different set
     * from the one the threshold was derived on.
     */
    const presentApplicableCount = input.presence.get(key) ?? presentFieldCount
    /*
     * §13(14): a page held against a rendered duplicate is `noindex,follow` whatever its field
     * count says. It keeps every link it had — the hold is about what a search engine indexes, not
     * about what a reader can reach — and it carries a link to the page it duplicates.
     */
    const duplicateHoldOf = input.duplicateHolds.get(key) ?? null
    if (duplicateHoldOf !== null) counters.bump('pages held noindex,follow as a rendered duplicate')
    const indexable =
      duplicateHoldOf === null &&
      threshold !== null &&
      tier <= 2 &&
      pageType !== 'stub' &&
      presentApplicableCount >= threshold

    const aggregate = input.registryAggregates.get(key)
    if (aggregate !== undefined) registryAggregateRows.push([key, JSON.stringify(aggregate)])

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

    /*
     * §10: the printed name is never an all-caps register string where a readable synonym of this
     * same record exists. `scripts/revamp/page_text_v5.ts` applies the same function to the same
     * records, so the dossier, the hub that links it and the measured text print one name. The slug
     * is computed from the recorded name above and does not change (§10); only what is printed does.
     */
    const printed = printedDisplayName(record.displayName ?? '', record.synonyms ?? [])
    if (printed !== record.displayName)
      counters.bump('pages printing a readable synonym in place of an all-caps register string')

    pages.push({
      key,
      slug,
      displayName: stripControlCharacters(printed, counters) ?? key,
      model: assignment.model,
      tier,
      pageType,
      indexable,
      duplicateHoldOf,
      suppressed,
      suppressionClasses: suppressionRow?.classes ?? [],
      controlled,
      controlledBasis,
      withdrawn: assignment.withdrawn,
      presentFieldCount,
      applicableFieldCount,
      presentApplicableCount,
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

    /* relations, with the form note Phase 3 recorded against each one (§6) */
    const noteByRelation = new Map<string, string>()
    for (const recorded of input.blocks.get(key)?.relations ?? []) {
      const note = nullIfBlank(recorded.note)
      if (!note || !recorded.counterpartKey) continue
      noteByRelation.set(`${relationKind(recorded.relation)}|${recorded.counterpartKey}`, note)
    }
    const seenRelations = new Set<string>()
    for (const relation of record.relations ?? []) {
      const kind = relationKind(relation.type)
      if (!RELATION_KINDS.has(kind)) {
        counters.bump(`relation type outside the recorded vocabulary: ${relation.type}`)
        continue
      }
      if (relation.targetKey === key) {
        counters.bump('self-relations dropped')
        continue
      }
      const id = sha256(`${key} ${kind} ${relation.targetKey}`)
      if (seenRelations.has(id)) continue
      seenRelations.add(id)
      relationRows.push([
        id,
        key,
        kind,
        relation.targetKey,
        null,
        noteByRelation.get(`${kind}|${relation.targetKey}`) ?? null,
        'identity-resolution',
      ])
    }

    /* seeds — R2 is enforced here as well as by the database trigger */
    for (const [seed, row] of input.seeds.get(key) ?? []) {
      if (suppressed && [1, 2, 6].includes(seed)) {
        counters.bump('seed 1/2/6 rows withheld from a suppressed page (R2)')
        continue
      }
      if (controlled && [1, 2, 6].includes(seed)) {
        counters.bump('seed 1/2/6 rows withheld from a controlled-substance page (§4)')
        continue
      }
      seedRows.push([
        key,
        seed,
        JSON.stringify(row.values ?? {}),
        // The slots are the named values the question text was written from, and they are not the
        // values (migration 0029, §11). The page re-derives its question list from what is stored
        // here; without the slots it derived a different list from the one the render measured.
        JSON.stringify(row.slots ?? {}),
        JSON.stringify(row.sources ?? []),
      ])
    }

    /* questions */
    const pageQuestions = (input.questions.get(key) ?? []).filter((question) => {
      if (!controlled || !CONTROLLED_WITHHELD_BLOCKS.has(question.block)) return true
      counters.bump('question blocks withheld from a controlled-substance page (§4)')
      return false
    })
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
        // §11: the slot values and the sources the derivation produced. The page answers with
        // these rather than with a second derivation over a smaller input.
        JSON.stringify(question.values ?? {}),
        JSON.stringify(question.sources ?? []),
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

    /* ---- Phase 4 blocks (migration 0026) --------------------------------------------------- */
    const bundle = input.blocks.get(key)
    if (bundle) {
      let order = 0
      for (const row of bundle.registration ?? []) {
        const ordinal = typeof row.ordinal === 'number' ? row.ordinal : order
        const line = nullIfBlank(row.line)
        if (line === null) {
          counters.bump('registration rows skipped: the block stage recorded no line')
          continue
        }
        /*
         * §14(3): the United States status word derives from the application set, and
         * `scripts/revamp/build_blocks.py` derives it. The loader publishes what that stage wrote,
         * so it does not rewrite the word here — it counts the contradiction the rule names, so a
         * load from a stale block file says so in its own output rather than publishing "Approved ·
         * 4 applications: all discontinued" silently.
         */
        if (
          row.jurisdiction === 'US' &&
          /^Approved\b/.test(row.status) &&
          /\ball discontinued\b/.test(line)
        ) {
          counters.bump(
            'US registration lines whose status word contradicts their application breakdown',
          )
        }
        registrationRows.push([
          sha256(`${key} ${row.jurisdiction} ${row.component ?? ''} ${order}`),
          key,
          row.jurisdiction.slice(0, 16),
          stripControlCharacters(row.label, counters) ?? row.jurisdiction,
          stripControlCharacters(row.status, counters) ?? line,
          nullIfBlank(row.detail),
          nullIfBlank(row.source),
          recordedDate(row.dateChecked, counters),
          ordinal,
          nullIfBlank(row.component),
          line,
          nullIfBlank(row.absence)?.slice(0, 32) ?? null,
          // §13(6): a curated record filed under "unspecified" names no jurisdiction and no
          // register, so the page paints it in the technical disclosure and never as a line.
          row.disclosed === true,
          JSON.stringify(row.disclosure ?? {}),
          JSON.stringify(row.provenance ?? []),
        ])
        order += 1
      }

      for (const row of bundle.controlledSchedules ?? []) {
        const jurisdiction = nullIfBlank(row.jurisdiction)
        const list = nullIfBlank(row.list)
        const classOrSchedule = nullIfBlank(row.classOrSchedule)
        if (!jurisdiction || !list || !classOrSchedule) {
          counters.bump('controlled rows skipped: the schedule stage recorded no schedule')
          continue
        }
        controlledRows.push([
          sha256(
            `${key} ${jurisdiction} ${nullIfBlank(row.scheduleCode) ?? ''} ${nullIfBlank(row.substanceAsListed) ?? ''}`,
          ),
          key,
          jurisdiction.slice(0, 16),
          list,
          classOrSchedule,
          nullIfBlank(row.scheduleCode)?.slice(0, 64) ?? null,
          nullIfBlank(row.itemNumber)?.slice(0, 32) ?? null,
          nullIfBlank(row.substanceAsListed),
          nullIfBlank(row.statute),
          nullIfBlank(row.statuteUrl),
          nullIfBlank(row.versionDate),
          nullIfBlank(row.source),
          nullIfBlank(row.provenance),
        ])
      }

      const patent = bundle.patent
      if (patent) {
        const line = nullIfBlank(patent.line)
        if (line === null) counters.bump('patent rows skipped: the block stage recorded no line')
        else {
          patentRows.push([
            key,
            patent.eligible === true,
            nullIfBlank(patent.register),
            typeof patent.rld === 'boolean' ? patent.rld : null,
            nullIfBlank(patent.earliestUnexpiredPatentExpiry),
            nullIfBlank(patent.exclusivityEnd),
            typeof patent.genericAvailable === 'boolean' ? patent.genericAvailable : null,
            nullIfBlank(patent.firstGenericApproval),
            nullIfBlank(patent.teCode)?.slice(0, 16) ?? null,
            nullIfBlank(patent.noRecordLine),
            nullIfBlank(patent.reason),
            line,
            patent.absence === true,
            nullIfBlank(patent.source),
            recordedDate(patent.dateChecked, counters),
            JSON.stringify(patent.disclosure ?? {}),
            JSON.stringify(patent.provenance ?? []),
          ])
        }
      }

      /*
       * Interaction rows, with their line built here by the one shared builder. The React template
       * and the measured text both print `page_interactions.line`, so the tier label, the quoted
       * label sentence and the derivation are written once and read three times.
       */
      let interactionOrdinal = 0
      let interactionRowsWritten = 0
      for (const tier of ['A', 'B', 'C'] as const) {
        const held = bundle.interactions?.tiers?.[tier]
        if (!held) continue
        const inline = (held.inline ?? []) as InteractionRow[]
        const disclosedRows = (held.disclosed ?? []) as InteractionRow[]
        for (const [rows, disclosed] of [
          [inline, false],
          [disclosedRows, true],
        ] as Array<[InteractionRow[], boolean]>) {
          for (const row of rows) {
            const line = interactionLine(tier, row, { controlled, quote: !disclosed })
            if (nullIfBlank(line) === null) {
              counters.bump('interaction rows skipped: no line could be built from the stored row')
              continue
            }
            interactionRows.push([
              sha256(`${key} interaction ${tier} ${interactionOrdinal}`),
              key,
              'interaction',
              tier,
              interactionOrdinal,
              disclosed,
              typeof held.total === 'number' ? held.total : null,
              nullIfBlank(row.counterpartKey),
              nullIfBlank(row.counterpartName),
              nullIfBlank(row.direction),
              nullIfBlank(row.mechanism),
              nullIfBlank(row.source)?.slice(0, 64) ?? null,
              nullIfBlank(row.sourceRecordId)?.slice(0, 200) ?? null,
              nullIfBlank(row.sourceUrl),
              recordedDate(row.sourceDate, counters),
              nullIfBlank(row.setId)?.slice(0, 64) ?? null,
              nullIfBlank(row.effectiveTime)?.slice(0, 32) ?? null,
              nullIfBlank(row.labelSection)?.slice(0, 64) ?? null,
              nullIfBlank(row.licence),
              nullIfBlank(row.ruleId)?.slice(0, 64) ?? null,
              nullIfBlank(row.confidence)?.slice(0, 24) ?? null,
              nullIfBlank(row.sentence),
              nullIfBlank(row.derivation),
              line,
              '[]',
              JSON.stringify(row.provenance ?? {}),
            ])
            interactionOrdinal += 1
            interactionRowsWritten += 1
          }
        }
      }

      /*
       * The checked-sources statement, on every page that has one — including the 25,217 that hold
       * no interaction at all. An absence of rows in three registers is a finding about the
       * registers, and Operating Rule 9 requires the page to say which ones were read and when.
       */
      const checked = bundle.interactions?.checked
      if (checked && Array.isArray(checked.sourcesChecked) && checked.date) {
        const statement = checkedSourcesStatement(
          { sourcesChecked: checked.sourcesChecked, date: checked.date },
          interactionRowsWritten > 0,
        )
        if (statement !== undefined) {
          interactionRows.push([
            sha256(`${key} sources-checked`),
            key,
            'sources-checked',
            null,
            0,
            false,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            recordedDate(checked.date, counters),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            statement,
            JSON.stringify(checked.sourcesChecked),
            '{}',
          ])
        } else counters.bump('pages with no checked-sources statement: no source was recorded')
      } else counters.bump('pages with no recorded interaction-source check')

      for (const [section, entries] of Object.entries(bundle.sections ?? {})) {
        let sectionOrdinal = 0
        for (const entry of entries) {
          const sentence = nullIfBlank((entry.values ?? {}).sentence)
          if (sentence === null) {
            counters.bump('computed section rows skipped: the stage recorded no sentence')
            continue
          }
          sectionRows.push([
            key,
            section.slice(0, 32),
            sectionOrdinal,
            nullIfBlank(entry.templateId)?.slice(0, 64) ?? null,
            sentence,
            JSON.stringify(entry.values ?? {}),
            JSON.stringify(entry.provenance ?? {}),
          ])
          sectionOrdinal += 1
        }
      }

      /*
       * The moved-trial sentence sits with the form-of note, because it answers the question that
       * note raises: if this page is the calcium salt of heparin, where did heparin's trials go?
       */
      const moved = bundle.trialsMoved
      if (moved && moved.count > 0) {
        const existing = sectionRows.filter((row) => row[0] === key && row[1] === 'formOf').length
        sectionRows.push([
          key,
          'formOf',
          existing,
          'trials-moved-to-parent',
          movedTrialsSentence(moved),
          JSON.stringify({ count: moved.count, toKey: moved.toKey, toName: moved.toName }),
          JSON.stringify({
            fields: {
              [String(moved.count)]:
                'data/revamp/identity/trial-reassignments-v5.csv rows with action=move for this page',
            },
          }),
        ])
      }

      const disambiguation = bundle.disambiguation
      const disambiguated = nullIfBlank(disambiguation?.displayName)
      if (disambiguated !== null) {
        displayNameRows.push([
          key,
          stripControlCharacters(disambiguated, counters) ?? disambiguated,
          nullIfBlank(disambiguation?.disambiguator),
          nullIfBlank(disambiguation?.basis),
          nullIfBlank(disambiguation?.collidesOn),
        ])
      }
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
      registrationRows,
      interactionRows,
      patentRows,
      controlledRows,
      sectionRows,
      displayNameRows,
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
    registryAggregateRows,
    redirectRows,
    registrationRows,
    interactionRows,
    patentRows,
    controlledRows,
    sectionRows,
    displayNameRows,
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
      'page_registry_aggregate',
      // Phase 4 blocks (migration 0026). Deleted with the rest of the children, before the page
      // row is written, so a page that has just become a controlled substance loses its withheld
      // blocks inside the same transaction that marks it one.
      'page_registration',
      'page_interactions',
      'page_patent',
      'page_controlled',
      'page_sections',
      'page_display_names',
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
        'duplicate_hold_of',
        'suppressed',
        'suppression_classes',
        'withdrawn',
        'present_field_count',
        'applicable_field_count',
        'present_applicable_count',
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
        'controlled',
        'controlled_basis',
      ],
      built.pages.map((page) => [
        page.key,
        page.slug,
        page.displayName,
        page.model,
        page.tier,
        page.pageType,
        page.indexable,
        page.duplicateHoldOf,
        page.suppressed,
        page.suppressionClasses,
        page.withdrawn,
        page.presentFieldCount,
        page.applicableFieldCount,
        page.presentApplicableCount,
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
        page.controlled,
        page.controlledBasis,
      ]),
      `ON CONFLICT ("key") DO UPDATE SET
         "slug" = EXCLUDED."slug",
         "display_name" = EXCLUDED."display_name",
         "model" = EXCLUDED."model",
         "tier" = EXCLUDED."tier",
         "page_type" = EXCLUDED."page_type",
         "indexable" = EXCLUDED."indexable",
         "duplicate_hold_of" = EXCLUDED."duplicate_hold_of",
         "suppressed" = EXCLUDED."suppressed",
         "suppression_classes" = EXCLUDED."suppression_classes",
         "withdrawn" = EXCLUDED."withdrawn",
         "present_field_count" = EXCLUDED."present_field_count",
         "applicable_field_count" = EXCLUDED."applicable_field_count",
         "present_applicable_count" = EXCLUDED."present_applicable_count",
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
         "controlled" = EXCLUDED."controlled",
         "controlled_basis" = EXCLUDED."controlled_basis",
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
      ['key', 'seed', 'values', 'slots', 'sources'],
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
        'values',
        'sources',
      ],
      built.questionRows,
      'ON CONFLICT ("key", "ordinal") DO NOTHING',
    )

    await insertRows(
      client,
      'page_relations',
      ['id', 'key', 'relation', 'target_key', 'label', 'note', 'source'],
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

    // The aggregate the body builders read (migration 0027, §11). Without it the page built from
    // the database and the page built from the corpus files write different paragraphs.
    await insertRows(
      client,
      'page_registry_aggregate',
      ['key', 'aggregate'],
      built.registryAggregateRows,
      'ON CONFLICT ("key") DO UPDATE SET "aggregate" = EXCLUDED."aggregate"',
    )

    /* ---- Phase 4 blocks (migration 0026) ---------------------------------------------------- */

    await insertRows(
      client,
      'page_registration',
      [
        'id',
        'key',
        'jurisdiction',
        'label',
        'status',
        'detail',
        'source',
        'date_checked',
        'ordinal',
        'component',
        'line',
        'absence',
        'disclosed',
        'disclosure',
        'provenance',
      ],
      built.registrationRows,
      'ON CONFLICT ("id") DO NOTHING',
    )

    await insertRows(
      client,
      'page_interactions',
      [
        'id',
        'key',
        'kind',
        'tier',
        'ordinal',
        'disclosed',
        'total_in_tier',
        'counterpart_key',
        'counterpart_name',
        'direction',
        'mechanism',
        'source',
        'source_record_id',
        'source_url',
        'source_date',
        'set_id',
        'effective_time',
        'label_section',
        'licence',
        'rule_id',
        'confidence',
        'sentence',
        'derivation',
        'line',
        'sources_checked',
        'provenance',
      ],
      built.interactionRows,
      'ON CONFLICT ("id") DO NOTHING',
    )

    await insertRows(
      client,
      'page_patent',
      [
        'key',
        'eligible',
        'register',
        'rld',
        'earliest_unexpired_patent_expiry',
        'exclusivity_end',
        'generic_available',
        'first_generic_approval',
        'te_code',
        'no_record_line',
        'reason',
        'line',
        'absence',
        'source',
        'date_checked',
        'disclosure',
        'provenance',
      ],
      built.patentRows,
      'ON CONFLICT ("key") DO NOTHING',
    )

    await insertRows(
      client,
      'page_controlled',
      [
        'id',
        'key',
        'jurisdiction',
        'list',
        'class_or_schedule',
        'schedule_code',
        'item_number',
        'substance_as_listed',
        'statute',
        'statute_url',
        'version_date',
        'source',
        'provenance',
      ],
      built.controlledRows,
      'ON CONFLICT ("id") DO NOTHING',
    )

    await insertRows(
      client,
      'page_sections',
      ['key', 'section', 'ordinal', 'template_id', 'sentence', 'values', 'provenance'],
      built.sectionRows,
      'ON CONFLICT ("key", "section", "ordinal") DO NOTHING',
    )

    await insertRows(
      client,
      'page_display_names',
      ['key', 'display_name', 'disambiguator', 'basis', 'collides_on'],
      built.displayNameRows,
      'ON CONFLICT ("key") DO NOTHING',
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
