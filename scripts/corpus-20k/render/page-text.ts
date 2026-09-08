/**
 * Page text renderer (Phase 2b, stage 3) — the visible text the new dossier delivers.
 *
 * This module is the single home of the body builders. `docs/specs/dossier-template.md` fixes the
 * page shape (header → question blocks → relations → source list) and `docs/specs/disclosure.md`
 * fixes what the revealed layer of each block contains. The React template built in Phase 4 imports
 * `buildBlockBody` and `renderPage` from here, so the words measured at Gate 1b and the words a
 * reader sees are produced by one function, not two.
 *
 * What is in the measured text, and why:
 *   - the header (display name, synonyms, register/last-verified line, badge triplet);
 *   - every question block: the question, paragraph 1 (the values sentence), paragraph 2 (the
 *     qualification), then the revealed rows — the rows sit inside a native `<details>`, but the
 *     element is delivered in the server HTML, so a crawler reads them and they are counted;
 *   - the identifiers panel, the relations rows and the source list.
 * Shared chrome (nav, footer, contents rail, definitions page, licence and revision lines) is
 * excluded by rule: it is identical on every page and is markup, not the page's own prose.
 *
 * Nothing here writes a value a source does not state. Every sentence frame is filled from the
 * page's own recorded fields, seeds, registry aggregate and identity record; where a value is
 * absent the sentence is not written, and where a field records that something was not measured the
 * qualification says so in ordinary words. No sentence suggests a dose, a schedule or a protocol:
 * recorded dose text is reproduced verbatim with the organism that was studied, as the disclosure
 * spec requires, and never as advice.
 *
 * CLI:
 *   npx tsx scripts/corpus-20k/render/page-text.ts \
 *     --fields data/corpus-20k/fields --seeds data/corpus-20k/derived \
 *     --questions data/corpus-20k/questions --identity data/corpus-20k/identity/canonical.ndjson \
 *     --tiers data/corpus-20k/tiers/model-assignment.ndjson \
 *     --suppression data/corpus-20k/suppression/assignments.ndjson \
 *     --registry data/corpus-20k/registry/aggregates --out data/corpus-20k/render/text
 *
 * Memory: the inputs total ~390 MB of NDJSON, so pages are assembled in contiguous shards of the
 * sorted key list. Each shard rereads the inputs and parses only its own rows; a cheap key regex
 * skips the rest without a JSON parse.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  canonicalSeedId,
  formatDuration,
  isAbsenceStatus,
  isAffirmativeClassification,
  joinList,
  readHighestPhase,
  readMechanisms,
  readRegisterStatuses,
  readSponsors,
  readTargetNames,
  type FieldEntry,
  type QuestionBlock,
  type SourceRef,
} from '../questions/derive'
import {
  citedSuppressionLabels,
  isUnknownClassOnly,
  unknownClassificationLine,
} from '@/lib/corpus/suppression-labels'
// The specifier is extensionless so the Next.js build can resolve it: the dossier template imports
// `buildBlockBody` from here through `lib/corpus/page-text.ts`, and webpack does not rewrite a
// `.js` specifier onto a `.ts` file. `tsx` and Vitest resolve it unchanged.

/* ------------------------------------------------------------------ types */

export interface Synonym {
  name: string
  kind?: string
}

export interface Relation {
  type: string
  targetKey: string
}

export interface IdentityRecord {
  displayName?: string
  synonyms: Synonym[]
  relations: Relation[]
  unii?: string | null
  chemblId?: string | null
  cid?: string | number | null
  cas?: string | null
  rxcui?: string | null
  drugbankId?: string | null
}

export interface SeedRecord {
  fires: boolean
  slots?: Record<string, unknown>
  values?: Record<string, unknown>
}

export interface PageBundle {
  key: string
  displayName: string
  model: string
  tier: 1 | 2 | 3
  withdrawn: boolean
  suppressed: boolean
  suppressionClasses: string[]
  stub: boolean
  presentFields: number
  fields: Record<string, FieldEntry>
  seeds: Record<string, SeedRecord>
  identity: IdentityRecord
  registry?: Record<string, unknown>
  questions: QuestionBlock[]
  /** key → display name, for the relations rows (R10: relations are rows, never sentences). */
  names: Map<string, string>
  /**
   * The Phase 4 blocks for this page (docs/specs/phase4-generators.md), as
   * `scripts/revamp/page_blocks.py` joined them. Absent on a page rendered from the corpus-20k
   * inputs, which have no Phase 4 blocks; the renderer then emits none, rather than a heading with
   * nothing under it.
   */
  blocks?: PageBlocks
}

export interface RevealedRow {
  label: string
  /** Stripe's hairline row prints a small monospace identifier beside the label. */
  identifier?: string
  value: string
}

export interface BlockBody {
  paragraphs: string[]
  rows: RevealedRow[]
  /**
   * Rows painted under the question heading, above the revealed layer (§13(7)).
   *
   * A statement carrying one value — "25 of 29 completed trials posted no result", "first
   * publication 2013, last 2013" — is data, and a sentence built around it is a frame the reader
   * reads past. These are the same values as labelled rows: the label names the bucket, the value
   * is what the record holds. They are visible without opening anything, and the slop draw's
   * template test does not apply to them, because a row is markup.
   */
  facts: RevealedRow[]
  /**
   * Parallel to `paragraphs`: true where the paragraph is §11 furniture — a fixed-vocabulary
   * statement whose only content is an absence.
   *
   * §12 names the one answer that is: "No regulator classification is recorded for X". It states
   * that the registers this run cleared returned no classification, in the same words on every page
   * that has none, and it was marked furniture only in the stub record. Here it is furniture
   * wherever it renders, the question block included: it leaves the measured text, the duplicate
   * check skips it, the template test does not apply to it, and the page still says it.
   */
  furniture: boolean[]
  /**
   * The same paragraphs without their provenance anchor. A citation ("DailyMed label · <id> ·
   * <date>", or a bare register name where the source records no id) is not a sentence the page
   * asserts, and counting it as one would report every page that cites ClinicalTrials.gov as
   * sharing a sentence. The standing-sentence audit reads these; the template renders `paragraphs`.
   */
  bare: string[]
}

/** Rows per revealed group. A real page opens one `<details>` on a finite list, not on 250 trials. */
export const ROW_CAP = 20

/* ------------------------------------------------------- small accessors */

function asObject(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : undefined
}

function asArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v
  if (v === undefined || v === null) return []
  return [v]
}

function asString(v: unknown): string | undefined {
  if (typeof v === 'string') {
    const t = v.replace(/\s+/g, ' ').trim()
    return t.length > 0 ? t : undefined
  }
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return undefined
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const m = v.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)
    if (m) return Number(m[0])
  }
  return undefined
}

function pick(o: Record<string, unknown> | undefined, ...keys: string[]): unknown {
  if (!o) return undefined
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k]
  return undefined
}

function normaliseName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function unique(items: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const i of items) {
    if (i && !seen.has(i)) {
      seen.add(i)
      out.push(i)
    }
  }
  return out
}

function sentenceCase(s: string): string {
  return /^[a-z]/.test(s) ? (s[0] ?? '').toUpperCase() + s.slice(1) : s
}

/** A recorded sentence is reproduced whole; a very long one is cut on a word boundary. */
function clampSentence(s: string, max = 400): string {
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return (space > 40 ? cut.slice(0, space) : cut) + '…'
}

/**
 * A recorded value frequently ends its own sentence ("… at a corrected age of 18 months."), and the
 * frame carrying it adds a full stop of its own, which printed "18 months..". The frame's stop is
 * dropped where the value already supplied one — inside a closing quotation mark too. The value is
 * never rewritten: only the punctuation this module added is removed.
 */
function oneFullStop(sentence: string): string {
  return sentence.replace(/([.?!…])"\s*\.$/, '$1"').replace(/([.?!…])\s*\.$/, '$1')
}

/* -------------------------------------------------------- field aliasing */

/**
 * The three extractors name their fields slightly differently (`faers`/`faersSignal`,
 * `clocks`/`epigeneticClocks`, `whyStopped`/`whyDevelopmentStopped`). One lookup, so a builder asks
 * for the field by one name.
 */
const FIELD_ALIASES: Record<string, string[]> = {
  hallmarks: ['hallmark', 'field1'],
  organismLadder: ['ladder', 'field2'],
  itp: ['field3'],
  endpointTypes: ['endpointType', 'field4'],
  humanEvidenceCeiling: ['humanCeiling', 'field5'],
  epigeneticClocks: ['clocks', 'field6'],
  doseResponseShape: ['doseResponse', 'field7'],
  pathways: ['pathway', 'field8'],
  kinetics: ['labelKinetics', 'field9'],
  interactions: ['labelInteractions', 'field10'],
  trialFailures: ['field11'],
  biomarkersMeasured: ['biomarkers', 'field12'],
  regulatoryStatus: ['regulatory', 'field13'],
  ongoingTrials: ['ongoing', 'field14'],
  faersSignal: ['faers', 'field15'],
  indication: ['labelIndication'],
  adverseEvents: ['labelAdverseEvents'],
  trialHistory: ['trialCounts'],
  withdrawalStatus: ['withdrawal', 'withdrawn'],
  molecularTarget: ['target'],
  mechanismClass: ['mechanism', 'moa'],
  highestPhase: ['maxPhase'],
  whyDevelopmentStopped: ['whyStopped', 'developmentStopped'],
  sponsor: [],
  patentStatus: ['patent'],
  everDosedInHumans: ['everDosed'],
  relatedCompounds: ['relatedOnTarget', 'related'],
  doseStudied: ['doseText'],
  approvalDate: ['firstApproval'],
}

const FIELD_LOOKUP = new Map<string, string>()
for (const [id, aliases] of Object.entries(FIELD_ALIASES)) {
  FIELD_LOOKUP.set(normaliseName(id), id)
  for (const a of aliases) FIELD_LOOKUP.set(normaliseName(a), id)
}

function fieldMap(raw: Record<string, FieldEntry>): Map<string, FieldEntry> {
  const out = new Map<string, FieldEntry>()
  for (const [name, entry] of Object.entries(raw)) {
    if (!entry || typeof entry !== 'object' || typeof entry.state !== 'string') continue
    const id = FIELD_LOOKUP.get(normaliseName(name)) ?? name
    const existing = out.get(id)
    if (!existing || (existing.state !== 'present' && entry.state === 'present')) out.set(id, entry)
  }
  return out
}

/* ------------------------------------------------------ source rendering */

/**
 * A provenance anchor is a literal source, never a section of this page (dossier template, V5). It
 * reads as "Register/Study id · date"; the glyph is an icon and contributes no words.
 */
const REGISTER_NAMES: Record<string, string> = {
  'clinicaltrials.gov': 'ClinicalTrials.gov',
  registry: 'ClinicalTrials.gov',
  registers: 'national registers',
  register: 'national register',
  register_set: 'Drugs@FDA',
  fda_label: 'DailyMed label',
  open_targets_faers: 'FAERS via Open Targets',
  open_targets_drug_warning: 'Open Targets drug warning',
  'open-targets': 'Open Targets Platform',
  chembl: 'ChEMBL 37',
  europepmc: 'Europe PMC',
  pubmed_esearch: 'PubMed',
  pubmed: 'PubMed',
  'derived-from-fields': "this record's own fields",
  'clinicaltrials.gov+chembl': 'ClinicalTrials.gov and ChEMBL 37',
  'europepmc+clinicaltrials.gov': 'Europe PMC and ClinicalTrials.gov',
  'jax-mpd': 'JAX Mouse Phenome Database',
  itp: 'NIA Interventions Testing Program',
  unii: 'FDA UNII',
}

export function registerName(kind: string | undefined): string | undefined {
  if (!kind) return undefined
  const k = kind.toLowerCase()
  if (REGISTER_NAMES[k]) return REGISTER_NAMES[k]
  if (k.startsWith('recorded-background')) return 'DailyMed label'
  return kind
}

export function anchor(source: SourceRef | undefined): string {
  if (!source) return ''
  const parts: string[] = []
  const reg = registerName(source.kind)
  if (reg) parts.push(reg)
  // A corpus-wide snapshot label ("ClinicalTrials.gov API v2 snapshot 2026-09-01T09:00:05") is the
  // same string on thousands of pages and identifies no record. The register name and the date say
  // the same thing in three words; a real record id (an NCT, an NDA, a set id) is kept.
  //
  // §14(8): a storage key is not a record id either. Where an ingest recorded no identifier of the
  // register's own it wrote this page's key in its place, and the anchor then read "Drugs@FDA ·
  // COMBO:NAME:conjugated estrogens medroxyprogesterone · 2026-08-28" — the corpus's own storage
  // address, in the position a register's record number belongs. The register and the date stay.
  if (
    source.id &&
    source.id !== reg &&
    !/snapshot/i.test(source.id) &&
    !looksLikePageKey(source.id)
  )
    parts.push(source.id)
  if (source.sourceDate) parts.push(source.sourceDate)
  return parts.join(' · ')
}

function firstSource(q: QuestionBlock): SourceRef | undefined {
  return q.sources.find((s) => s.kind || s.id) ?? q.sources[0]
}

function entrySource(entry: FieldEntry | undefined): SourceRef | undefined {
  if (!entry) return undefined
  const list = asArray(entry.source)
    .map(asObject)
    .filter((o): o is Record<string, unknown> => o !== undefined)
  const first = list[0]
  if (!first) return entry.sourceDate ? { sourceDate: entry.sourceDate } : undefined
  return {
    ...(asString(first.kind) ? { kind: asString(first.kind) } : {}),
    ...(asString(first.id) ? { id: asString(first.id) } : {}),
    ...((asString(first.sourceDate) ?? entry.sourceDate)
      ? { sourceDate: asString(first.sourceDate) ?? entry.sourceDate }
      : {}),
  }
}

/** Paragraph 1 ends with its anchor; paragraph 2 carries one only when it states a sourced value. */
function withAnchor(sentence: string, source: SourceRef | undefined): string {
  const a = anchor(source)
  return a ? `${sentence} ${a}` : sentence
}

/* --------------------------------------------------------- ladder access */

const ORGANISM_ORDER = ['yeast', 'c. elegans', 'drosophila', 'mouse', 'rat', 'dog', 'nhp', 'human']

interface Rung {
  organism: string
  kind?: string
  endpoint?: string
  studies?: number
  nct?: string
  source?: SourceRef
}

function readRungs(entry: FieldEntry | undefined): Rung[] {
  if (!entry || entry.state !== 'present') return []
  const v = asObject(entry.value)
  const list = asArray(v ? pick(v, 'rungs', 'ladder') : entry.value)
  const out: Rung[] = []
  for (const item of list) {
    const o = asObject(item)
    if (!o) continue
    const organism = asString(pick(o, 'rung', 'organism', 'species'))
    if (!organism) continue
    const src = asObject(pick(o, 'source'))
    out.push({
      organism,
      ...(asString(pick(o, 'evidenceKind', 'kind')) !== undefined
        ? { kind: asString(pick(o, 'evidenceKind', 'kind')) as string }
        : {}),
      ...(asString(pick(o, 'primaryOutcomeVerbatim', 'endpoint')) !== undefined
        ? { endpoint: asString(pick(o, 'primaryOutcomeVerbatim', 'endpoint')) as string }
        : {}),
      ...(asNumber(pick(o, 'registeredStudies', 'studies')) !== undefined
        ? { studies: asNumber(pick(o, 'registeredStudies', 'studies')) as number }
        : {}),
      ...(asString(pick(o, 'nct')) !== undefined
        ? { nct: asString(pick(o, 'nct')) as string }
        : {}),
      ...(src
        ? {
            source: {
              ...(asString(src.kind) ? { kind: asString(src.kind) } : {}),
              ...(asString(src.id) ? { id: asString(src.id) } : {}),
              ...(asString(pick(o, 'sourceDate'))
                ? { sourceDate: asString(pick(o, 'sourceDate')) }
                : {}),
            },
          }
        : {}),
    })
  }
  out.sort((a, b) => ORGANISM_ORDER.indexOf(a.organism) - ORGANISM_ORDER.indexOf(b.organism))
  return out
}

/* ------------------------------------------------- the page's own values */

interface PageFacts {
  fields: Map<string, FieldEntry>
  present: (id: string) => FieldEntry | undefined
  field: (id: string) => FieldEntry | undefined
  seed: (id: string) => SeedRecord | undefined
  rungs: Rung[]
  topRung?: Rung
  largestN?: number
  longestDuration?: string
  registeredStudies?: number
  name: string
}

function facts(page: PageBundle): PageFacts {
  const fields = fieldMap(page.fields)
  const field = (id: string): FieldEntry | undefined => fields.get(id)
  const present = (id: string): FieldEntry | undefined => {
    const f = fields.get(id)
    return f && f.state === 'present' ? f : undefined
  }
  const seed = (id: string): SeedRecord | undefined => {
    const s = page.seeds[id]
    return s && s.fires ? s : undefined
  }
  const rungs = readRungs(field('organismLadder'))
  const ceiling = asObject(present('humanEvidenceCeiling')?.value)
  const registryValue = asObject(page.registry)
  const enrol = asObject(pick(registryValue, 'enrolment'))
  return {
    fields,
    field,
    present,
    seed,
    rungs,
    ...(rungs.length > 0 ? { topRung: rungs[rungs.length - 1] as Rung } : {}),
    ...(asNumber(pick(ceiling, 'largestN')) !== undefined
      ? { largestN: asNumber(pick(ceiling, 'largestN')) as number }
      : asNumber(pick(enrol, 'max')) !== undefined
        ? { largestN: asNumber(pick(enrol, 'max')) as number }
        : {}),
    ...(formatDuration(asNumber(pick(ceiling, 'longestDurationDays'))) !== undefined
      ? {
          longestDuration: formatDuration(asNumber(pick(ceiling, 'longestDurationDays'))) as string,
        }
      : formatDuration(asNumber(pick(asObject(pick(registryValue, 'longestDuration')), 'days'))) !==
          undefined
        ? {
            longestDuration: formatDuration(
              asNumber(pick(asObject(pick(registryValue, 'longestDuration')), 'days')),
            ) as string,
          }
        : {}),
    ...(asNumber(pick(ceiling, 'registeredStudies')) !== undefined
      ? { registeredStudies: asNumber(pick(ceiling, 'registeredStudies')) as number }
      : asNumber(pick(registryValue, 'studies')) !== undefined
        ? { registeredStudies: asNumber(pick(registryValue, 'studies')) as number }
        : {}),
    name: page.displayName,
  }
}

/**
 * The qualification's stock ingredients, all from the page's own values: which organism, how many
 * people, how long, and what the records do not measure. A builder picks the ones its block earns;
 * nothing generic is written where a value is missing.
 */
/** "human" names a rung; a sentence needs the plural the rung stands for. */
const ORGANISM_PLURAL: Record<string, string> = {
  human: 'humans',
  mouse: 'mice',
  rat: 'rats',
  dog: 'dogs',
  nhp: 'non-human primates',
  yeast: 'yeast',
  drosophila: 'Drosophila',
  'c. elegans': 'C. elegans',
}

export function organismPlural(name: string): string {
  return ORGANISM_PLURAL[name] ?? name
}

function scopeClause(f: PageFacts): string | undefined {
  const bits: string[] = []
  if (f.topRung) bits.push(`in ${organismPlural(f.topRung.organism)}`)
  if (f.registeredStudies !== undefined)
    bits.push(
      `${f.registeredStudies} registered ${f.registeredStudies === 1 ? 'study' : 'studies'}`,
    )
  if (f.largestN !== undefined) bits.push(`largest enrolment ${f.largestN}`)
  if (f.longestDuration) bits.push(`longest ${f.longestDuration}`)
  return bits.length > 0 ? bits.join(', ') : undefined
}

/**
 * What a DEVELOPMENT record does not hold, in the order the three DEVELOPMENT blocks state it: a
 * human dose, a registry stop reason, a matched registry study. Each item is written only when the
 * page's own field says the value is not recorded, so a page that holds all three writes nothing
 * and the block's second paragraph falls back to its scope clause.
 */
function developmentGaps(
  f: PageFacts,
  page: PageBundle,
  scope: ReadonlyArray<'dose' | 'stop' | 'trial'>,
): string[] {
  const gaps: string[] = []
  if (scope.includes('dose') && !f.present('doseStudied')) gaps.push('a human dose')
  if (scope.includes('stop') && !f.present('whyDevelopmentStopped')) gaps.push('a stop reason')
  const studies = asNumber(pick(asObject(page.registry), 'studies'))
  if (scope.includes('trial') && (studies === undefined || studies === 0))
    gaps.push('a registry trial')
  return gaps
}

/* --------------------------------------------------------- row builders */

/**
 * Rows carry values, not a repeated frame. The label names the row group once and the identifier is
 * the record id; everything after them is the source's own wording. A row that printed
 * "primary endpoint" before every measure repeated that phrase on every page carrying a trial,
 * which is a shared five-gram bought for nothing.
 */
/**
 * The first six trials keep the "Trial" label and read inline; the rest are given a label carrying
 * the count, which `groupRows` turns into a headed group inside the same disclosure. That is
 * docs/specs/phase4-generators.md §7 — "trial endpoint lists show at most six rows inline; the rest
 * sit in a disclosure with a count" — and it is what stops a record with 250 registered trials from
 * printing a wall of endpoints the Phase 1 reading found unreadable.
 */
export const TRIAL_ROWS_INLINE = 6

function rowsFromTrials(list: unknown[], cap = ROW_CAP): RevealedRow[] {
  const out: RevealedRow[] = []
  const beyondInline = Math.max(0, Math.min(list.length, cap) - TRIAL_ROWS_INLINE)
  const restLabel =
    beyondInline > 0
      ? `${beyondInline} further recorded ${beyondInline === 1 ? 'trial' : 'trials'}`
      : 'Trial'
  for (const item of list.slice(0, cap)) {
    const o = asObject(item)
    if (!o) continue
    const nct = asString(pick(o, 'nct', 'nctId', 'id'))
    const bits: string[] = []
    const phase = asString(pick(o, 'phase'))
    const status = asString(pick(o, 'status', 'overallStatus'))
    const n = asNumber(pick(o, 'n', 'enrolment', 'enrollment'))
    const endpoint = asString(pick(o, 'primaryEndpoint', 'measure', 'primaryOutcome'))
    const completion = asString(pick(o, 'completionDate', 'readoutDate'))
    const title = asString(pick(o, 'title'))
    const why = asString(pick(o, 'whyStopped'))
    const timeFrame = asString(pick(o, 'timeFrame'))
    // The registry's own title, quoted. It is the sponsor's wording, not this site's: a trial
    // called "A Study to Test How Safe X Is" is the registry naming a question, and printing it
    // unquoted would read as this page calling something safe.
    if (title) bits.push(`"${title}"`)
    if (phase) bits.push(phase.toLowerCase().replace(/_/g, ' '))
    if (status) bits.push(status.toLowerCase().replace(/_/g, ' '))
    if (n !== undefined) bits.push(`n ${n}`)
    if (endpoint) bits.push(`"${clampSentence(endpoint, 240)}"`)
    if (timeFrame) bits.push(`"${clampSentence(timeFrame, 160)}"`)
    if (completion) bits.push(completion)
    // The registry's stop text is quoted here exactly as the block sentence quotes it. Some
    // ClinicalTrials.gov records store the literal string "undefined" in that position; unquoted
    // it reads as a rendering fault, quoted it reads as the registry value the row is reporting.
    if (why) bits.push(`"${clampSentence(why, 240)}"`)
    if (bits.length === 0) continue
    out.push({
      label: out.length < TRIAL_ROWS_INLINE ? 'Trial' : restLabel,
      ...(nct ? { identifier: nct } : {}),
      value: bits.join('; '),
    })
  }
  return out
}

/**
 * The register statuses a page holds, as VALUES.
 *
 * Gate 2's repeated-frame audit charged three of the CLINICAL blocks with the same two phrases:
 * "jurisdictions record no status for" (32.7 % of indexed pages) and the constant never-cleared
 * list. Both were sentences carrying no value of this page's own. The fix is structural, not
 * lexical: the prose names only the jurisdictions that recorded a status, as values, and the four
 * registers that were never cleared for this corpus (UK, AU, JP, SG) are a property of the corpus
 * and are stated once, on /definitions.
 *
 * The rows that stood beside them are gone. §14(2) retires the register application rows from
 * every question block: a per-jurisdiction row carrying the register, its record id and its date
 * is a register data row, and the registration block and its disclosure hold each of them once.
 */
/**
 * "US approved (2005)" — the affirmative status a register recorded, per jurisdiction.
 *
 * §13(1): a recorded status whose words are an absence never reaches a prose answer. It is on the
 * page, in the registration block's absence table, and stating it a second time inside a sentence
 * about something else was the non-sequitur the reading found.
 *
 * §14(2): the register's application id is not carried here either. An application id is a
 * register data row, the registration block's disclosure holds every one of them once, and a
 * question's answer that names one is the same row painted twice.
 */
function registerStatusValues(statuses: ReturnType<typeof readRegisterStatuses>): string[] {
  return statuses.recorded
    .filter((r) => !isAbsenceStatus(r.status))
    .map((r) => {
      const date = r.records[0]?.date
      return date && date.trim() ? `${r.code} ${r.status} (${date})` : `${r.code} ${r.status}`
    })
}

/** A count group: the bucket name is the label, the number is the value. No frame around either. */
/**
 * A recorded count map in one fixed order: the largest count first, ties by name (§11).
 *
 * The order these arrive in is not a fact about the compound. The corpus renderer reads the
 * aggregate out of a JSON file, where the keys keep the order the counting stage wrote them in;
 * the page reads the same aggregate out of a `jsonb` column, which stores an object's keys in
 * PostgreSQL's own canonical order. The two therefore printed the same counts in two different
 * orders, and §11 makes that a failure. Ordering them here, once, makes the order a property of
 * the numbers instead of a property of where they were stored.
 */
function orderedCounts(counts: Record<string, unknown> | undefined): Array<[string, number]> {
  if (!counts) return []
  const out: Array<[string, number]> = []
  for (const [key, value] of Object.entries(counts)) {
    const n = asNumber(value)
    if (n !== undefined) out.push([key, n])
  }
  return out.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

/** A count map as words: "18 completed, 6 active not recruiting", in `orderedCounts` order. */
function countWords(counts: Record<string, unknown> | undefined): string | undefined {
  if (!counts) return undefined
  const words = orderedCounts(counts).map(
    ([key, n]) => `${n} ${key.toLowerCase().replace(/_/g, ' ')}`,
  )
  return words.length > 0 ? words.join(', ') : undefined
}

function countRows(counts: Record<string, unknown> | undefined): RevealedRow[] {
  if (!counts) return []
  const out: RevealedRow[] = []
  for (const [k, n] of orderedCounts(counts).slice(0, ROW_CAP)) {
    out.push({ label: k.toLowerCase().replace(/_/g, ' '), value: String(n) })
  }
  return out
}

/* ------------------------------------------------------- the body rules */

/**
 * One builder per question template. Paragraph 1 restates the question's terms and carries the
 * values with its anchor; paragraph 2 is the qualification — organism, N, duration, and what the
 * record does not measure — and it too is built from this page's values.
 *
 * Two disciplines are load-bearing, both taken from the question-derivation amendments:
 *
 * 1. **Values first, short tails.** A template's value-free tail is at most four words, because a
 *    longer one is a repeated five-gram on every page carrying that block.
 * 2. **A standing explanation belongs on one linked page, not on every page.** Sentences such as
 *    "a report count has no denominator, so it is not a rate" are true and necessary, but written
 *    into every FAERS block they are the same paragraph 100 times over. They live on the
 *    definitions page and the block links to them; the link is chrome, and the reader still gets
 *    the caveat one click away. What stays in the block is this compound's own numbers.
 */
export function buildBlockBody(q: QuestionBlock, page: PageBundle, f = facts(page)): BlockBody {
  const name = page.displayName
  const src = firstSource(q)
  const paragraphs: string[] = []
  const bare: string[] = []
  const furniture: boolean[] = []
  const rows: RevealedRow[] = []
  /** §13(7): values painted under the question heading, above the revealed layer. */
  const facts: RevealedRow[] = []
  const p1 = (s: string, source: SourceRef | undefined = src, isFurniture = false): void => {
    const t = oneFullStop(s)
    bare.push(t)
    furniture.push(isFurniture)
    paragraphs.push(withAnchor(t, source))
  }
  const p2 = (s: string, source?: SourceRef): void => {
    const t = oneFullStop(s)
    bare.push(t)
    furniture.push(false)
    paragraphs.push(source ? withAnchor(t, source) : t)
  }
  const joinBits = (bits: Array<string | undefined>): string =>
    bits.filter((b): b is string => Boolean(b && b.trim())).join('; ')

  switch (q.template) {
    /*
     * §13(1) retired the `classification` block. It asked what classification a record carries and
     * answered that none is recorded — an absence offered as an answer, on 16,814 pages. The
     * registration block's absence table states it once, as furniture, and the question is no
     * longer derived: `scripts/corpus-20k/questions/derive.ts` pushes it for no page.
     */

    /* ------------------------------------------------------- supervision */
    /*
     * §14(1): the answer names the suppression evidence and never a register status.
     *
     * It used to read the `regulatory` field jurisdiction by jurisdiction and offer whatever it
     * found there as "the registers' classification of X". On Piroxicam that produced "AU
     * scheduled in the Poisons Standard: the registers' classification of Piroxicam", which is
     * wrong twice over: an Australian Schedule 4 entry is a prescription class and not a reason
     * for supervision, and the sentence's provenance named registers the sentence itself did not.
     * The register application rows the same loop painted under the question — US NDA…
     * Prescription, CA drug code … APPROVED — are the corpus-20k register data rows, which §14(2)
     * retires from every question block: the registration block and its disclosure hold them once.
     *
     * What is left is the only thing that answers the question. The suppression pass recorded, per
     * page, which of the classes S1–S9 a register positively stated — a controlled schedule under
     * the Singapore Misuse of Drugs Act, a United States DEA schedule or an Australian Poisons
     * Standard Schedule 8 or 9; a withdrawal; a boxed warning; a REMS; a cytotoxic or teratogen
     * listing; a clinician-administered route — and `citedSuppressionLabels` turns those codes
     * into the words `docs/specs/suppression-classes.md` fixes. A prescription-only class (SUSMP
     * Schedule 4, a Singapore Poisons Act schedule, "prescription only") is not among them:
     * `scripts/revamp/controlled_suppression.py` records S2 only on the narrow controlled test.
     */
    case 'supervision': {
      const cited = citedSuppressionLabels(page.suppressionClasses)
      if (cited.length === 0) break
      /*
       * The source is the recorded field the class evidence was read from, in the order the
       * classes are recorded in: the controlled-substance schedules first, then the label's boxed
       * warning, then the register's own record of a withdrawal or a restricted supply programme.
       * Reading them here is also what puts them in the block's provenance trace, so the sentence
       * names the field it was built from rather than a register it does not mention.
       */
      const classSource =
        entrySource(f.present('controlled')) ??
        entrySource(f.present('boxedWarning')) ??
        entrySource(f.present('regulatoryStatus')) ??
        src
      // §7: the class is `S2` in storage and "a controlled-substance schedule in Singapore, the
      // United States, Australia or the United Kingdom" on the page. Printing the token put a
      // storage identifier in front of a reader on 2,800 pages.
      p1(`A register records ${name} under medical supervision: ${joinList(cited)}.`, classSource)
      // Standing-sentence rule: where the page records no study scope there is nothing of its own
      // to say, so paragraph 2 is not written. "No study record accompanies it." stood verbatim on
      // 378 indexed pages (6.4%) and is exactly the shared sentence the constraints forbid.
      const supervisionScope = scopeClause(f)
      if (supervisionScope) p2(`${sentenceCase(supervisionScope)}.`)
      break
    }

    /* --------------------------------------------------- human evidence */
    case 'human-data': {
      const ceiling = f.present('humanEvidenceCeiling')
      const c = asObject(ceiling?.value)
      const endpoint = asString(pick(c, 'primaryOutcomeVerbatim', 'endpointTypeFrom'))
      const largest = q.values.N ?? String(f.largestN ?? '')
      const longest = q.values.duration ?? f.longestDuration ?? ''
      p1(
        `${largest} people in ${name}'s largest trial, ${longest} in its longest${endpoint ? `, measuring ${clampSentence(endpoint, 200)}` : ''}.`,
        entrySource(ceiling) ?? src,
      )
      const phases = asObject(pick(c, 'byPhase'))
      const phaseWords = countWords(phases)
      /*
       * §14(4): the ratio of registered studies that posted no result is an answer about the
       * trials, and this is the trials question on a record whose evidence ceiling was filled. It
       * was painted under the label question, which asks what the label indicates.
       */
      const humanHistory = asObject(f.present('trialHistory')?.value)
      const humanRegistered = asNumber(pick(humanHistory, 'registeredStudies', 'studies'))
      const humanPosted = asNumber(pick(humanHistory, 'studiesWithPostedResults'))
      if (humanRegistered !== undefined && humanPosted !== undefined && humanRegistered > 0) {
        facts.push({
          label: 'Registered studies posting no result',
          value: `${humanRegistered - humanPosted} of ${humanRegistered}`,
        })
      }
      // docs/specs/derived-content.md seed 15, amended 2026-09-04: evidence age is a VALUE that
      // renders here, never a block of its own. The sentence is written only where seed 15 holds
      // this page's own year and record; the revealed row is that record and its completion date,
      // and carries no "as of" and no "years since" label — those were the standing rows the Gate
      // 1b re-measure charged the whole regression to.
      const seed15 = f.seed('seed15')
      const ageValues = asObject(seed15?.values)
      const latestTest = asObject(pick(ageValues, 'latest'))
      const ageYearRaw = pick(asObject(seed15?.slots), 'year')
      const ageYear =
        asNumber(ageYearRaw) !== undefined
          ? String(asNumber(ageYearRaw))
          : (asString(ageYearRaw) ?? asString(pick(latestTest, 'date'))?.slice(0, 4))
      const ageRecord = asString(pick(latestTest, 'record'))
      const ageDate = asString(pick(latestTest, 'date'))
      const lastTest =
        ageYear && ageRecord ? `Last human test completed ${ageYear}, ${ageRecord}.` : undefined
      const qualification =
        joinBits([
          phaseWords ? sentenceCase(phaseWords) : undefined,
          asString(pick(c, 'longestDurationTrial')),
          asString(pick(c, 'longestDurationCompletion')),
          pick(c, 'anyAgingEndpoint') === false ? 'no ageing endpoint recorded' : undefined,
        ]) || `${f.registeredStudies ?? 0} registered studies.`
      p2(lastTest ? `${qualification.replace(/[.\s]+$/, '')}. ${lastTest}` : qualification)
      rows.push(...countRows(phases))
      if (ageRecord && ageDate)
        rows.push({ label: 'Last recorded human test', identifier: ageRecord, value: ageDate })
      rows.push(...rowsFromTrials(asArray(pick(asObject(page.registry), 'primaryOutcomes'))))
      break
    }
    case 'human-data-none': {
      const organism = q.values.organism ?? f.topRung?.organism ?? ''
      const kind = f.topRung?.kind
      p1(
        `${sentenceCase(organism)} is the highest organism on ${name}'s ladder${kind ? `, with ${kind} evidence` : ''}.`,
        entrySource(f.field('organismLadder')) ?? src,
      )
      p2(
        joinBits([
          f.topRung?.endpoint ? clampSentence(f.topRung.endpoint, 200) : undefined,
          f.topRung?.studies !== undefined ? `${f.topRung.studies} registered studies` : undefined,
          'no human trial recorded',
        ]),
      )
      rows.push(...ladderRows(f))
      break
    }

    /* ---------------------------------------------------------- ladder */
    case 'ladder':
    case 'ladder-single': {
      const named = f.rungs.map(
        (r) => `${r.organism}${r.kind ? `: ${r.kind}` : ''}${r.studies ? ` (${r.studies})` : ''}`,
      )
      p1(
        `${joinList(named)}: the rungs where ${name} has a recorded finding.`,
        entrySource(f.field('organismLadder')) ?? src,
      )
      const endpoints = unique(f.rungs.map((r) => r.endpoint ?? '').filter(Boolean))
      p2(
        endpoints.length > 0
          ? `${joinList(endpoints.slice(0, 3).map((e) => clampSentence(e, 160)))} — the recorded outcome words.`
          : `${f.rungs.length} of 8 rungs carry a finding; no outcome wording is recorded.`,
      )
      rows.push(...ladderRows(f))
      break
    }

    /* ------------------------------------------------------------- ITP */
    case 'itp':
    case 'itp-negative': {
      const itp = asObject(f.present('itp')?.value)
      const cohorts = asArray(pick(itp, 'cohorts'))
      const dose = q.values.dose ?? ''
      const age = q.values.age ?? ''
      p1(
        `${dose ? `${dose}, from ${age} months` : `${cohorts.length} cohorts`}: the NIA Interventions Testing Program workbook rows for ${name}.`,
        entrySource(f.present('itp')) ?? src,
      )
      const animals = cohorts.reduce((sum: number, c) => {
        const per = asObject(pick(asObject(c), 'animalsRecordedPerSex'))
        return (
          sum + (per ? Object.values(per).reduce((s: number, v) => s + (asNumber(v) ?? 0), 0) : 0)
        )
      }, 0)
      const years = unique(cohorts.map((c) => asString(pick(asObject(c), 'cohortYear')) ?? ''))
      p2(
        joinBits([
          `${animals} mice`,
          years.length > 0 ? `cohorts ${years.join(', ')}` : undefined,
          asString(pick(itp, 'note'))
            ? clampSentence(asString(pick(itp, 'note')) as string, 200)
            : undefined,
        ]),
      )
      for (const c of cohorts.slice(0, ROW_CAP)) {
        const o = asObject(c)
        if (!o) continue
        rows.push({
          label: 'ITP cohort',
          ...(asString(pick(o, 'cohortYear'))
            ? { identifier: asString(pick(o, 'cohortYear')) as string }
            : {}),
          value: joinBits([
            asString(pick(o, 'agentAsWritten')),
            asString(pick(o, 'doseAsWritten')),
            asString(pick(o, 'ageAtStartMonthsAsWritten'))
              ? `${asString(pick(o, 'ageAtStartMonthsAsWritten'))} months`
              : undefined,
            asArray(pick(o, 'sexesPresent')).map(asString).filter(Boolean).join(', ') || undefined,
            asString(pick(o, 'file')),
          ]),
        })
      }
      break
    }

    /* ------------------------------------------------------- withdrawn */
    case 'withdrawn': {
      const w = asObject(f.present('withdrawalStatus')?.value)
      const reason = asString(pick(w, 'reason'))
      p1(
        `Approved ${q.values.approvalYear ?? ''}, withdrawn ${q.values.withdrawalYear ?? ''} in ${q.values.jurisdictions ?? ''}${reason ? `; the register's words: "${clampSentence(reason, 300)}"` : ''}.`,
        entrySource(f.present('withdrawalStatus')) ?? src,
      )
      const reasons = asArray(pick(w, 'reasons'))
      p2(
        joinBits([
          `${reasons.length} recorded ${reasons.length === 1 ? 'reason' : 'reasons'}`,
          asArray(pick(w, 'jurisdictions')).map(asString).filter(Boolean).join(', ') || undefined,
          reasons.length === 0 ? 'no register states a reason' : undefined,
        ]),
      )
      for (const r of reasons.slice(0, ROW_CAP)) {
        const o = asObject(r)
        const text = asString(pick(o, 'reason', 'statement'))
        if (text)
          rows.push({
            label: asString(pick(o, 'jurisdiction')) ?? 'Reason',
            // The register's own wording, quoted: "Not safe or effective for intended use" is what
            // the register concluded, not a judgement this page is making.
            value: `"${clampSentence(text)}"`,
          })
      }
      break
    }

    /* --------------------------------------------------------- stopped */
    case 'stopped':
    case 'stopped-one': {
      const s3 = f.seed('seed3')
      const clusters = asArray(pick(asObject(s3?.values), 'clusters'))
      const failures = asArray(f.present('trialFailures')?.value)
      const clusterWords = clusters
        .map((c) => {
          const o = asObject(c)
          const cluster = asString(pick(o, 'cluster'))
          const count = asNumber(pick(o, 'count'))
          return cluster ? `${cluster} (${count ?? 0})` : undefined
        })
        .filter((c): c is string => Boolean(c))
      const all =
        failures.length > 0
          ? failures
          : clusters.flatMap((c) => asArray(pick(asObject(c), 'reasons')))
      const firstWhy = asString(pick(asObject(all[0]), 'whyStopped'))
      p1(
        clusterWords.length > 0
          ? `${joinList(clusterWords)}: ${name}'s stop wording, clustered.`
          : `${all.length} recorded ${all.length === 1 ? 'trial' : 'trials'} of ${name} stopped.`,
        entrySource(f.present('trialFailures')) ?? src,
      )
      p2(
        joinBits([
          firstWhy ? `"${clampSentence(firstWhy, 260)}"` : undefined,
          `${all.length} of ${f.registeredStudies ?? all.length} registered studies`,
        ]),
      )
      rows.push(...rowsFromTrials(all))
      break
    }

    /* ---------------------------------------------------- dose studied */
    case 'dose-studied': {
      const studied = f.present('doseStudied')
      const list = asArray(studied?.value)
      const organism = q.values.organism ?? ''
      p1(
        `${sentenceCase(organism)} studies of ${name} used ${q.values.dose ? `"${q.values.dose}"` : 'the recorded amount'}.`,
        entrySource(studied) ?? src,
      )
      const routes = unique(list.map((d) => asString(pick(asObject(d), 'route')) ?? '')).filter(
        Boolean,
      )
      const organisms = unique(
        list.map((d) => asString(pick(asObject(d), 'organism')) ?? ''),
      ).filter(Boolean)
      // "1 recorded entry; human; route not stated" stood on 370 indexed pages (6.3%): a count, a
      // species word and a standing tail carry nothing of the page's own. Paragraph 2 now names the
      // other recorded amounts, and is written only when there is one to name or a route to state.
      const doseTexts = unique(
        list
          .map((d) => asString(pick(asObject(d), 'doseText', 'dose', 'text')) ?? '')
          .filter(Boolean),
      ).filter((t) => t !== q.values.dose)
      if (doseTexts.length > 0 || routes.length > 0) {
        p2(
          joinBits([
            `${list.length} recorded ${list.length === 1 ? 'entry' : 'entries'}`,
            organisms.join(', ') || undefined,
            routes.join(', ') || undefined,
            doseTexts.length > 0
              ? `also "${doseTexts
                  .slice(0, 3)
                  .map((t) => clampSentence(t, 120))
                  .join('", "')}"`
              : undefined,
          ]),
        )
      }
      for (const d of list.slice(0, ROW_CAP)) {
        const o = asObject(d)
        const text = asString(pick(o, 'doseText', 'dose', 'text'))
        if (!text) continue
        rows.push({
          label: asString(pick(o, 'organism', 'species')) ?? 'Recorded amount',
          ...(asString(pick(asObject(pick(o, 'source')), 'id'))
            ? { identifier: asString(pick(asObject(pick(o, 'source')), 'id')) as string }
            : {}),
          value: joinBits([asString(pick(o, 'route')), clampSentence(text, 240)]),
        })
      }
      break
    }

    /* ---------------------------------------------------------- clocks */
    case 'clocks': {
      const list = asArray(f.present('epigeneticClocks')?.value)
      const first = asObject(list[0])
      const sentence = asString(pick(first, 'sentence'))
      p1(
        `${q.values.clock ?? ''}${sentence ? `: "${clampSentence(sentence, 320)}"` : ` appears in ${list.length} recorded sentences about ${name}`}.`,
        entrySource(f.present('epigeneticClocks')) ?? src,
      )
      const years = unique(list.map((c) => asString(pick(asObject(c), 'year')) ?? ''))
      const kinds = unique(list.map((c) => asString(pick(asObject(c), 'endpointType')) ?? ''))
      p2(
        joinBits([
          `${list.length} recorded ${list.length === 1 ? 'sentence' : 'sentences'}`,
          years.join(', ') || undefined,
          kinds.join(', ') || undefined,
        ]),
      )
      for (const c of list.slice(0, ROW_CAP)) {
        const o = asObject(c)
        const clock = asString(pick(o, 'clock'))
        const s = asString(pick(o, 'sentence'))
        if (!clock && !s) continue
        rows.push({
          label: clock ?? 'Clock sentence',
          ...(asString(pick(o, 'pmid')) ? { identifier: `PMID ${asString(pick(o, 'pmid'))}` } : {}),
          value: joinBits([asString(pick(o, 'year')), s ? `"${clampSentence(s)}"` : undefined]),
        })
      }
      break
    }

    /* ------------------------------------------------------ dose shape */
    /*
     * docs/specs/phase4-generators.md §7, from the Phase 1 reading: a dose-response quotation
     * renders only where the sentence names this page's compound or one of its recorded synonyms.
     * The extraction matched papers, not molecules, so a page could quote a dose-response sentence
     * about a different compound entirely. A finding that does not name the compound is not
     * evidence about it; where no finding names it, the section does not fire at all and the block
     * renders nothing, rather than quoting a sentence that is about something else.
     */
    case 'dose-shape':
    case 'dose-shape-plateau': {
      const shape = asObject(f.present('doseResponseShape')?.value)
      const synonyms = page.identity.synonyms.map((s) => s.name)
      const findings = asArray(pick(shape, 'findings')).filter((item) => {
        const sentence = asString(pick(asObject(item), 'sentence'))
        return sentence !== undefined && sentenceNamesCompound(sentence, name, synonyms)
      })
      if (findings.length === 0) break
      const first = asObject(findings[0])
      const sentence = asString(pick(first, 'sentence'))
      p1(
        `${sentenceCase(asString(pick(shape, 'shape')) ?? 'The recorded shape')} in ${q.values.organism ?? 'the studied organism'}${sentence ? `: "${clampSentence(sentence, 320)}"` : ` for ${name}`}.`,
        entrySource(f.present('doseResponseShape')) ?? src,
      )
      p2(
        joinBits([
          `${findings.length} recorded ${findings.length === 1 ? 'sentence' : 'sentences'} naming ${name}`,
          unique(findings.map((x) => asString(pick(asObject(x), 'wordAsPrinted')) ?? '')).join(
            ', ',
          ) || undefined,
          pick(shape, 'flagged') === false ? 'no turn point stated' : undefined,
        ]),
      )
      for (const fi of findings.slice(0, ROW_CAP)) {
        const o = asObject(fi)
        const s = asString(pick(o, 'sentence'))
        if (!s) continue
        rows.push({
          label: asString(pick(o, 'wordAsPrinted')) ?? 'Recorded sentence',
          ...(asString(pick(o, 'pmid')) ? { identifier: `PMID ${asString(pick(o, 'pmid'))}` } : {}),
          // The paper's own sentence, quoted, for the same reason the trial title is.
          value: `"${clampSentence(s)}"`,
        })
      }
      break
    }

    /* -------------------------------------------------------- kinetics */
    case 'kinetics': {
      const k = asObject(f.present('kinetics')?.value)
      const hl = asObject(pick(k, 'halfLife'))
      p1(
        `${q.values.halfLife ?? ''}, the half-life ${name}'s label states${asString(pick(hl, 'verbatim')) ? `: "${clampSentence(asString(pick(hl, 'verbatim')) as string, 320)}"` : ''}.`,
        entrySource(f.present('kinetics')) ?? src,
      )
      const recorded: string[] = []
      for (const key of [
        'tmax',
        'bioavailability',
        'metabolism',
        'clearance',
        'volumeOfDistribution',
      ]) {
        const o = asObject(pick(k, key))
        const value = o ? asString(pick(o, 'value')) : undefined
        const unit = o ? asString(pick(o, 'unit')) : undefined
        if (value) recorded.push(`${key} ${value}${unit ? ` ${unit}` : ''}`)
      }
      // Same rule: "The label records no other value." stood on 666 indexed pages (11.3%). Where the
      // label states only a half-life, paragraph 1 has already said so and paragraph 2 is not written.
      if (recorded.length > 0) p2(`${joinBits(recorded)}.`)
      for (const key of [
        'halfLife',
        'tmax',
        'bioavailability',
        'metabolism',
        'clearance',
        'volumeOfDistribution',
      ]) {
        const o = asObject(pick(k, key))
        if (!o) continue
        const value = asString(pick(o, 'value'))
        const unit = asString(pick(o, 'unit'))
        const verbatim = asString(pick(o, 'verbatim', 'sentence'))
        if (!value && !verbatim) continue
        rows.push({
          label: key.replace(/([A-Z])/g, ' $1').toLowerCase(),
          ...(asString(pick(o, 'labelSection'))
            ? { identifier: asString(pick(o, 'labelSection')) as string }
            : {}),
          value: joinBits([
            value && unit ? `${value} ${unit}` : value,
            clampSentence(verbatim ?? ''),
          ]),
        })
      }
      break
    }

    /* ------------------------------------------ bioavailability (seed 1) */
    case 'bioavailability': {
      const v = asObject(f.seed('seed1')?.values)
      const oral = asString(pick(v, 'oralBioavailability', 'oral'))
      p1(
        `${sentenceCase(q.values.route ?? '')} is the route recorded for the ${q.values.organism ?? ''} finding on ${name}${oral ? `; the oral form is recorded as ${oral}` : ''}.`,
      )
      p2(
        joinBits([oral, asString(pick(v, 'basis')), asString(pick(v, 'rule'))]) ||
          `${q.values.route ?? ''} only.`,
      )
      rows.push(...seedRows(v))
      break
    }

    /* ----------------------------------------------------- n-of-1 (2) */
    case 'n-of-1': {
      const v = asObject(f.seed('seed2')?.values)
      // "was measured in trials of" was five fixed words on 6.0 % of indexed pages.
      p1(`${sentenceCase(q.values.biomarker ?? '')}: measured in ${name}'s trials.`)
      p2(
        joinBits([
          asString(pick(v, 'assay')),
          asString(pick(v, 'basis')),
          asNumber(pick(v, 'trialCount')) !== undefined
            ? `${asNumber(pick(v, 'trialCount'))} trials`
            : undefined,
        ]) || `${q.values.biomarker ?? ''} is the recorded endpoint.`,
      )
      rows.push(...seedRows(v))
      break
    }

    /* --------------------------------------------- time-to-signal (6) */
    case 'time-to-signal': {
      const v = asObject(f.seed('seed6')?.values)
      const shortest = asObject(pick(v, 'shortestReportingEffect'))
      const sentence = asString(pick(shortest, 'sentence'))
      p1(
        `${asString(pick(shortest, 'durationVerbatim')) ?? ''} is the shortest recorded run reporting an effect on ${q.values.endpoint ?? ''}${sentence ? `: "${clampSentence(sentence, 320)}"` : ` for ${name}`}.`,
      )
      p2(
        joinBits([
          `${asNumber(pick(v, 'qualifyingSentenceCount')) ?? 0} qualifying sentences`,
          `${asNumber(pick(v, 'reportingEffectCount')) ?? 0} report an effect`,
          asString(pick(shortest, 'origin')),
        ]),
      )
      rows.push(...seedRows(v))
      break
    }

    /* ------------------------------------------------------ biomarkers */
    case 'biomarkers': {
      const bio = f.present('biomarkersMeasured')
      const terms = asArray(pick(asObject(bio?.value), 'terms', 'biomarkers'))
      p1(
        `${joinList([q.values.term1 ?? '', q.values.term2 ?? '', q.values.term3 ?? ''].filter(Boolean))} lead ${terms.length} outcome terms across ${name}'s trials.`,
        entrySource(bio) ?? src,
      )
      const rest = terms
        .slice(3, 9)
        .map((t) => (asObject(t) ? asString(pick(asObject(t), 'term', 'name')) : asString(t)) ?? '')
        .filter(Boolean)
      p2(
        rest.length > 0
          ? `${joinList(rest.map((r) => clampSentence(r, 120)))} follow.`
          : `${terms.length} ${terms.length === 1 ? 'term' : 'terms'} in all.`,
      )
      for (const t of terms.slice(0, ROW_CAP)) {
        const o = asObject(t)
        const term = o ? asString(pick(o, 'term', 'name')) : asString(t)
        if (!term) continue
        rows.push({
          label: term,
          value: `${asNumber(pick(o, 'count')) ?? ''}`.trim() || '1',
        })
      }
      break
    }

    /* --------------------------------------------------------- ongoing */
    case 'ongoing': {
      const ongoing = f.present('ongoingTrials')
      const list = asArray(
        asObject(ongoing?.value) ? pick(asObject(ongoing?.value), 'trials') : ongoing?.value,
      )
      const dates = unique(
        list.map((t) => asString(pick(asObject(t), 'completionDate')) ?? '').filter(Boolean),
      ).sort()
      p1(
        // "are open, the earliest recorded completion" was six fixed words on 12.8 % of indexed
        // pages; the date now follows four words, not six.
        `${list.length} registered ${list.length === 1 ? 'trial' : 'trials'} of ${name} ${list.length === 1 ? 'is' : 'are'} open${dates[0] ? `; earliest completion ${dates[0]}` : ''}.`,
        entrySource(ongoing) ?? src,
      )
      const endpoints = unique(
        list.map((t) => asString(pick(asObject(t), 'primaryEndpoint')) ?? '').filter(Boolean),
      )
      p2(
        joinBits([
          endpoints
            .slice(0, 2)
            .map((e) => clampSentence(e, 180))
            .join('; ') || undefined,
          dates.length > 1 ? `latest ${dates[dates.length - 1]}` : undefined,
        ]) || `${list.length} open.`,
      )
      rows.push(...rowsFromTrials(list))
      break
    }

    /* ------------------------------------------- what-would-settle (9) */
    case 'what-would-settle': {
      const v = asObject(f.seed('seed9')?.values)
      const trials = asArray(pick(v, 'trials'))
      const first = asObject(trials[0])
      p1(
        `${asString(pick(first, 'nct')) ?? ''} measures ${clampSentence(asString(pick(first, 'primaryEndpoint')) ?? q.values.endpoint ?? '', 240)}${asString(pick(first, 'readoutDate')) ? `, reading out ${asString(pick(first, 'readoutDate'))}` : ''}.`,
      )
      p2(
        joinBits([
          `${trials.length} open ${trials.length === 1 ? 'trial' : 'trials'}`,
          asNumber(pick(first, 'n')) !== undefined ? `n ${asNumber(pick(first, 'n'))}` : undefined,
          asString(pick(first, 'title'))
            ? `"${clampSentence(asString(pick(first, 'title')) as string, 200)}"`
            : undefined,
        ]),
      )
      rows.push(...rowsFromTrials(trials))
      break
    }

    /* ---------------------------------------------------- unreported (12) */
    case 'unreported': {
      const v = asObject(f.seed('seed12')?.values)
      const trials = asArray(pick(v, 'unreportedTrials', 'trials'))
      const dates = unique(
        trials.map((t) => asString(pick(asObject(t), 'completionDate')) ?? '').filter(Boolean),
      ).sort()
      const ncts = trials
        .map((t) => asString(pick(asObject(t), 'nct')) ?? '')
        .filter((n) => n.length > 0)
      const completed = asNumber(
        pick(asObject(pick(asObject(page.registry), 'byOverallStatus')), 'COMPLETED'),
      )
      /*
       * "posted no result" stood on 49.6 % of indexed pages at Gate 2, because the sentence around
       * it carried no value until its fourth word. The registry ids are the values, and naming them
       * here — rather than only in the revealed rows — puts one on every side of the phrase, so no
       * run of fixed words in this paragraph reaches five. The compound's own name does the same
       * work in the middle of the sentence.
       */
      /*
       * §13(7): "N of M completed trials posted no result: NCT…" is data. The sentence around it
       * carried no value until its fourth word and read as a frame; the same values as two
       * labelled rows say the whole of it and the reader meets them without a sentence.
       */
      facts.push({
        label: 'Posted no result',
        value: `${trials.length} of ${completed ?? trials.length} completed trials`,
      })
      if (ncts.length > 0) {
        facts.push({
          label: 'Registrations',
          value: `${joinList(ncts.slice(0, 6))}${ncts.length > 6 ? `, and ${ncts.length - 6} more` : ''}`,
        })
      }
      // The seed's cut-off and as-of dates are the same two strings on every firing page, so they
      // are a method note: they belong in the technical disclosure, not in the block's prose.
      const span = joinBits([
        dates[0] ? `oldest ${dates[0]}` : undefined,
        dates.length > 1 ? `newest ${dates[dates.length - 1]}` : undefined,
      ])
      if (span) facts.push({ label: 'Completion dates', value: span })
      rows.push(...rowsFromTrials(trials))
      break
    }

    /* ----------------------------------------------------- trial-size (16) */
    case 'trial-size': {
      /*
       * §14(15), applying §13(7): three recorded enrolment numbers are three values, and a
       * sentence built around them — "N at the median, M at the largest, across K registered
       * trials of X" — is a frame with the numbers dropped into it. The block census measured that
       * frame on 411 pages (1.43 %), over the 0.5 % line, because that is what a template with a
       * name and three numbers swapped in does. The numbers are rows; what is left of the answer
       * is the recorded status spread, which is a claim about this record's trials.
       */
      const v = asObject(f.seed('seed16')?.values)
      const reg = asObject(page.registry)
      const median = asNumber(pick(v, 'medianN')) ?? asNumber(q.values.median)
      const largest = asNumber(pick(v, 'maxN'))
      const counted = asNumber(pick(v, 'trialCount'))
      if (median !== undefined) facts.push({ label: 'Median enrolment', value: String(median) })
      if (largest !== undefined) facts.push({ label: 'Largest enrolment', value: String(largest) })
      if (counted !== undefined)
        facts.push({ label: 'Registered trials counted', value: String(counted) })
      const statuses = asObject(pick(reg, 'byOverallStatus'))
      const posted = asNumber(pick(reg, 'hasResults'))
      const statusWords = countWords(statuses)
      if (statusWords) facts.push({ label: 'Recorded status', value: statusWords })
      if (posted !== undefined) facts.push({ label: 'With posted results', value: String(posted) })
      rows.push(...countRows(asObject(pick(reg, 'byPhase'))))
      rows.push(...countRows(statuses))
      break
    }

    /* ----------------------------------------------------------- faers */
    case 'faers': {
      const faers = f.present('faersSignal')
      const fv = asObject(faers?.value)
      const terms = asArray(pick(fv, 'terms', 'reactions'))
      const top = asObject(terms[0])
      p1(
        `${q.values.n ?? ''} spontaneous reports name ${name}${asString(pick(top, 'term')) ? `, most often ${asString(pick(top, 'term'))} (${asNumber(pick(top, 'count', 'reportCount')) ?? 0})` : ''}.`,
        entrySource(faers) ?? src,
      )
      const next = terms
        .slice(1, 4)
        .map((t) => {
          const o = asObject(t)
          const term = asString(pick(o, 'term'))
          return term ? `${term} ${asNumber(pick(o, 'count', 'reportCount')) ?? 0}` : undefined
        })
        .filter((x): x is string => Boolean(x))
      p2(joinBits([...next, `${terms.length} ${terms.length === 1 ? 'term' : 'terms'} in all`]))
      for (const t of terms.slice(0, ROW_CAP)) {
        const o = asObject(t)
        const term = asString(pick(o, 'term'))
        if (!term) continue
        rows.push({ label: term, value: String(asNumber(pick(o, 'count', 'reportCount')) ?? 0) })
      }
      break
    }

    /* -------------------------------------------- faers-unlisted (14) */
    case 'faers-unlisted': {
      const v = asObject(f.seed('seed14')?.values)
      const list = asArray(pick(v, 'reportedNotOnLabel'))
      const names = list.map((t) => asString(pick(asObject(t), 'term')) ?? '').filter(Boolean)
      p1(
        // "and absent from its label" was five fixed words on 10.3 % of indexed pages.
        `${joinList(names.slice(0, 3))}${names.length > 3 ? ` and ${names.length - 3} more` : ''} reported for ${name}, absent from its label.`,
      )
      const labelSource = asObject(pick(asObject(pick(v, 'labelSource')), 'source'))
      p2(
        joinBits([
          `${asNumber(pick(v, 'labelTermCount')) ?? 0} label terms`,
          `${list.length} reported and unlisted`,
          asString(pick(labelSource, 'id')),
        ]),
      )
      for (const t of list.slice(0, ROW_CAP)) {
        const o = asObject(t)
        const term = asString(pick(o, 'term'))
        if (!term) continue
        rows.push({ label: term, value: `${asNumber(pick(o, 'count')) ?? 'count not stated'}` })
      }
      break
    }

    /* --------------------------------------------------- interactions */
    case 'interactions': {
      const inter = f.present('interactions')
      const iv = asObject(inter?.value)
      const cyps = asArray(pick(iv, 'cyp'))
      const flat = cyps.length > 0 ? cyps : asArray(inter?.value)
      p1(
        `${q.values.enzymeList ?? ''} appear in ${name}'s recorded interaction sentences, ${flat.length} in all.`,
        entrySource(inter) ?? src,
      )
      const s5 = asObject(f.seed('seed5')?.values)
      const nodes = asArray(pick(s5, 'nodes'))
      const nodeNames = nodes.map((n) => asString(pick(asObject(n), 'node')) ?? '').filter(Boolean)
      p2(
        joinBits([
          nodeNames.slice(0, 6).join(', ') || undefined,
          nodes.length > 0 ? `${nodes.length} shared nodes` : undefined,
          unique(flat.map((c) => asString(pick(asObject(c), 'labelSection')) ?? '')).join(', ') ||
            undefined,
        ]),
      )
      for (const c of flat.slice(0, ROW_CAP)) {
        const o = asObject(c)
        const counterparty = asString(pick(o, 'counterparty'))
        const sentence = asString(pick(o, 'sentence', 'statement'))
        if (!counterparty && !sentence) continue
        rows.push({
          label: counterparty ?? 'Interaction statement',
          ...(asString(pick(o, 'labelSection'))
            ? { identifier: asString(pick(o, 'labelSection')) as string }
            : {}),
          value: clampSentence(sentence ?? ''),
        })
      }
      for (const n of nodes.slice(0, ROW_CAP)) {
        const o = asObject(n)
        const node = asString(pick(o, 'node'))
        const shared = asArray(pick(o, 'sharedWith'))
          .map((s) => asString(pick(asObject(s), 'displayName')) ?? '')
          .filter(Boolean)
        if (!node || shared.length === 0) continue
        rows.push({ label: node, value: unique(shared).slice(0, 8).join(', ') })
      }
      break
    }
    case 'fasting-exercise': {
      const iv = asObject(f.present('interactions')?.value)
      const statements: RevealedRow[] = []
      for (const key of ['fasting', 'caloricRestriction', 'exercise']) {
        const o = asObject(pick(iv, key))
        const text = o
          ? asString(pick(o, 'statement', 'value', 'verbatim', 'sentence'))
          : asString(pick(iv, key))
        if (text)
          statements.push({
            label: key.replace(/([A-Z])/g, ' $1').toLowerCase(),
            value: clampSentence(text),
          })
      }
      p1(
        `${q.values.modifiers ?? ''} ${statements.length === 1 ? 'is' : 'are'} named in ${name}'s label sentences${statements[0] ? `: "${clampSentence(statements[0].value, 300)}"` : ''}.`,
        entrySource(f.present('interactions')) ?? src,
      )
      p2(
        joinBits([
          `${statements.length} recorded ${statements.length === 1 ? 'statement' : 'statements'}`,
          statements.map((s) => s.label).join(', ') || undefined,
        ]),
      )
      rows.push(...statements)
      break
    }

    /* --------------------------------------------------------- pathway */
    case 'pathway': {
      const list = asArray(f.present('pathways')?.value)
      const first = asObject(list[0])
      const sentence = asString(pick(first, 'sentence', 'statement'))
      p1(
        // "the source's own sentence" was five fixed words (with the apostrophe split) on 10.0 %
        // of indexed pages. The quotation marks and the anchor already say the words are the
        // source's; what the tail must add is which two things the sentence names.
        sentence
          ? `"${clampSentence(sentence, 340)}" — where ${name} and ${q.values.pathway ?? 'the pathway'} appear together.`
          : `${q.values.pathway ?? ''} is named beside ${name}.`,
        entrySource(f.present('pathways')) ?? src,
      )
      const pathways = unique(list.map((p) => asString(pick(asObject(p), 'pathway')) ?? ''))
      const pmids = unique(list.map((p) => asString(pick(asObject(p), 'pmid')) ?? '')).slice(0, 4)
      p2(
        joinBits([
          pathways.join(', ') || undefined,
          pmids.length > 0 ? `PMID ${pmids.join(', ')}` : undefined,
        ]),
      )
      for (const p of list.slice(0, ROW_CAP)) {
        const o = asObject(p)
        const s = asString(pick(o, 'sentence', 'statement'))
        if (!s) continue
        rows.push({
          label: asString(pick(o, 'pathway')) ?? 'Pathway sentence',
          ...(asString(pick(o, 'pmid')) ? { identifier: `PMID ${asString(pick(o, 'pmid'))}` } : {}),
          value: `"${clampSentence(s)}"`,
        })
      }
      break
    }

    /* ---------------------------------------------------- lineage (13) */
    case 'lineage': {
      const v = asObject(f.seed('seed13')?.values)
      const targets = asArray(pick(v, 'targets'))
      const compounds = targets.flatMap((t) => asArray(pick(asObject(t), 'compounds')))
      const outcomes = new Map<string, number>()
      for (const c of compounds) {
        const o = asString(pick(asObject(c), 'outcome')) ?? 'unknown'
        outcomes.set(o, (outcomes.get(o) ?? 0) + 1)
      }
      p1(
        `${[...outcomes.entries()].map(([k, n]) => `${n} ${k}`).join(', ')}: where the other compounds against ${q.values.target ?? 'this target'} stand.`,
      )
      const named = compounds
        .map((c) => asString(pick(asObject(c), 'displayName')) ?? '')
        .filter(Boolean)
        .slice(0, 5)
      // compute.py de-duplicates a page's related compounds across its targets before the row cap,
      // so this count is distinct compounds, and a compound fills exactly one revealed row.
      p2(
        joinBits([
          named.join(', ') || undefined,
          `${compounds.length} across ${targets.length} recorded ${targets.length === 1 ? 'target' : 'targets'}`,
        ]),
      )
      for (const c of compounds.slice(0, ROW_CAP)) {
        const o = asObject(c)
        const display = asString(pick(o, 'displayName'))
        if (!display) continue
        rows.push({
          label: display,
          ...(asString(pick(o, 'chemblId'))
            ? { identifier: asString(pick(o, 'chemblId')) as string }
            : {}),
          value: asString(pick(o, 'outcome')) ?? 'outcome not recorded',
        })
      }
      break
    }

    /* ----------------------------------------------- jurisdiction (17) */
    case 'jurisdiction': {
      const v = asObject(f.seed('seed17')?.values)
      const statuses = asArray(pick(v, 'statuses'))
      /*
       * §13(1): the question asks what kind of thing this is — drug, supplement or controlled —
       * and only an affirmative classification answers it. A register that recorded nothing, and a
       * register that recorded an approval, are not classifications: the first is the registration
       * block's absence table and the second is its status line. `derive.ts` asks the question only
       * where one of these words was recorded, so this list is never empty when the block renders.
       */
      const affirmative = statuses.filter((s) =>
        isAffirmativeClassification(asString(pick(asObject(s), 'status'))),
      )
      const words = affirmative
        .map((s) => {
          const o = asObject(s)
          const j = asString(pick(o, 'jurisdiction'))
          const st = asString(pick(o, 'status'))
          return j && st ? `${j} ${st}` : undefined
        })
        .filter((w): w is string => Boolean(w))
      if (words.length === 0) break
      p1(`${joinList(words)}: the registers' classifications of ${name}.`)
      // §13(7): the read dates and the count of registers read are values, so they are a row.
      const dates = unique(
        affirmative.map((s) => asString(pick(asObject(s), 'sourceDate')) ?? ''),
      ).filter(Boolean)
      if (dates.length > 0) facts.push({ label: 'Recorded', value: dates.join(', ') })
      for (const s of affirmative.slice(0, ROW_CAP)) {
        const o = asObject(s)
        const j = asString(pick(o, 'jurisdiction'))
        if (!j) continue
        rows.push({
          label: j,
          ...(asString(pick(o, 'sourceDate'))
            ? { identifier: asString(pick(o, 'sourceDate')) as string }
            : {}),
          value: asString(pick(o, 'status')) ?? 'not stated',
        })
      }
      break
    }

    /* --------------------------------------------- contradiction (10) */
    case 'contradiction': {
      const v = asObject(f.seed('seed10')?.values)
      const list = asArray(pick(v, 'contradictions'))
      const first = asObject(list[0])
      const values = asArray(pick(first, 'values'))
      const pair = values.map((x) => asString(pick(asObject(x), 'value')) ?? '').filter(Boolean)
      p1(
        `${pair.length >= 2 ? `"${pair[0]}" against "${pair[1]}"` : `${list.length} recorded disagreements`}: ${asString(pick(first, 'comparison')) ?? 'two sources differ'} for ${name}.`,
      )
      const registers = unique(
        values.map(
          (x) => asString(pick(asObject(pick(asObject(x), 'source')), 'register', 'kind')) ?? '',
        ),
      )
      p2(
        joinBits([
          registers.join(', ') || undefined,
          `${list.length} recorded ${list.length === 1 ? 'pair' : 'pairs'}`,
        ]),
      )
      for (const c of list.slice(0, ROW_CAP)) {
        const o = asObject(c)
        for (const x of asArray(pick(o, 'values'))) {
          const xo = asObject(x)
          const value = asString(pick(xo, 'value'))
          if (!value) continue
          const s = asObject(pick(xo, 'source'))
          rows.push({
            label: asString(pick(s, 'register', 'kind')) ?? 'Recorded value',
            ...(asString(pick(s, 'id')) ? { identifier: asString(pick(s, 'id')) as string } : {}),
            value: joinBits([value, asString(pick(xo, 'sourceDate'))]),
          })
        }
      }
      break
    }

    /* ------------------------------------------------- provenance (8) */
    case 'provenance': {
      const v = asObject(f.seed('seed8')?.values)
      /*
       * A date is a date. Seed 8 records `date` as the source record it read the year from on the
       * ChEMBL first-approval events — a stringified mapping, which printed as "first approval
       * {'ch" once `slice(0, 4)` had taken four characters of it. The renderer takes the value only
       * where it is shaped like a date and falls back to the event's own `year`, so a value that is
       * not a date never reaches the page under a date's name.
       */
      const eventDate = (event: Record<string, unknown> | undefined): string | undefined => {
        const recorded = asString(pick(event, 'date'))
        if (recorded && /^\d{4}(-\d{2}(-\d{2})?)?$/.test(recorded)) return recorded
        return asString(pick(event, 'year'))
      }
      /*
       * §14(10): chronological order, here as well as in the seed.
       *
       * The seed sorts its events before it records them, and the page must not depend on that:
       * a record written before the rule, or read back out of a `jsonb` column, would otherwise
       * let the block phrase a later event as leading to an earlier one — "How did X get from
       * 1989 to approved?" over "1989 first approval, 2004 first human trial". Sorting here makes
       * the first event the earliest on every input, and the question the derivation writes names
       * the first and last event kinds rather than a current state read from another source.
       */
      const events = asArray(pick(v, 'events'))
        .map((event) => asObject(event))
        .filter((event): event is Record<string, unknown> => event !== undefined)
        .sort((a, b) => (eventDate(a) ?? '').localeCompare(eventDate(b) ?? ''))
      // §14(10): a timeline is three dated events or it is not a timeline. The seed records none
      // shorter; a record written before that rule renders nothing here rather than two points.
      if (events.length < 3) break
      const firstEvent = events[0]
      const lastEvent = events[events.length - 1]
      p1(
        `${eventDate(firstEvent) ?? q.values.firstYear ?? ''} ${asString(pick(firstEvent, 'event')) ?? ''} to ${eventDate(lastEvent) ?? ''} ${asString(pick(lastEvent, 'event')) ?? ''}: ${events.length} dated ${events.length === 1 ? 'event' : 'events'} for ${name}.`,
      )
      // The event words alone ("first human trial, first approval; approved") stood on 1,099 indexed
      // pages. Each kind now carries the year the source dates it to, which is the page's own value
      // and is what the reader wanted from the list in the first place.
      const kinds = unique(
        events.map((e) => {
          const o = asObject(e)
          const event = asString(pick(o, 'event'))
          if (!event) return ''
          const dated = eventDate(o)
          return dated ? `${event} ${dated.slice(0, 4)}` : event
        }),
      ).filter(Boolean)
      // §13(1): the current register state is named where a register recorded one. "not cleared"
      // is an absence, and an absence does not follow from a list of dated events; the registration
      // block states it.
      const currentState = asString(pick(asObject(pick(v, 'currentState')), 'value'))
      p2(
        joinBits([
          kinds.slice(0, 5).join(', ') || undefined,
          currentState && !isAbsenceStatus(currentState) ? currentState : undefined,
        ]),
      )
      for (const e of events.slice(0, ROW_CAP)) {
        const o = asObject(e)
        const event = asString(pick(o, 'event'))
        if (!event) continue
        const s = asObject(pick(o, 'source'))
        rows.push({
          label: eventDate(o) ?? 'Undated',
          ...(asString(pick(s, 'id')) ? { identifier: asString(pick(s, 'id')) as string } : {}),
          value: joinBits([event, asString(pick(o, 'jurisdiction'))]),
        })
      }
      break
    }

    /* ------------------------------------------ CLINICAL: label indication */
    /**
     * Added 2026-09-04 with the three CLINICAL templates. The rule these three follow, and the
     * reason the wording is not shared between them: paragraph 1 carries the page's own recorded
     * values with the source that states them, and paragraph 2 states THIS page's limits in THIS
     * page's numbers — how many registers answered and which did not, how many registered studies
     * posted no result. No standing caveat is written into any of them; a caveat that would be the
     * same sentence on two thousand pages belongs on the definitions page the block links to.
     */
    case 'indication': {
      const entry = f.present('indication')
      const v = asObject(entry?.value)
      const statement = clampSentence(
        asString(pick(v, 'statement', 'text', 'indication')) ?? '',
        320,
      )
      const section = (asString(pick(v, 'labelSection')) ?? 'indications').replace(/_/g, ' ')
      p1(`"${statement}": ${section} on ${name}'s label.`, entrySource(entry) ?? src)
      /*
       * §13(1) retired the regulatory summary paragraph that stood here. It read "SG not found; US
       * approved (…); UK not cleared; curatedMarketingStatusNote …" — two absences and a stored
       * field name, inside an answer about a label's indication. Register status belongs to the
       * registration block, and only there.
       *
       * §14(2) retires what was left of it: the register application rows this block painted (SG
       * registered, US … approved · Drugs@FDA …, JP approved, CA …) are the same register data
       * rows the registration block and its disclosure already hold, once.
       *
       * §14(4) moves the one row that is not about registers at all. "Registered studies posting
       * no result: 103 of 163" is an answer about the trial record, and it is rendered under the
       * questions that ask about the trials — `trial-history` and `human-data` — not under the
       * question about what the label indicates.
       *
       * The label section and the date it was recorded are already in paragraph 1 and in the
       * paragraph's own anchor, so this block writes no row at all.
       */
      break
    }

    /* -------------------------------------- CLINICAL: registers, no label */
    case 'regulatory-only': {
      const entry = f.present('regulatoryStatus')
      const registers = readRegisterStatuses(entry)
      // Paragraph 1 names only the jurisdictions that recorded a status, each with the register's
      // own record id and date: "US approved (NDA 021995, 2005); CA approved (DIN 02248636,
      // 2026-09-04)". The jurisdictions with no status become rows, and the four registers that
      // were never cleared for this corpus are stated once on /definitions, never here.
      // §13(1): absences are filtered out of `registerStatusValues`. Where nothing affirmative
      // remains there is no answer to write, and the block does not render.
      //
      // §14(2): the register application rows this block painted are retired with the ones under
      // the supervision and label questions. The registration block and its disclosure hold every
      // application id once; a second copy under a question was the repetition the reading found.
      const registerValues = joinBits(registerStatusValues(registers))
      if (!registerValues) break
      p1(`${registerValues}.`, entrySource(entry) ?? src)
      // No paragraph 2. The jurisdictions that were consulted and recorded nothing are the same
      // two or three codes on a sixth of the corpus, so as a sentence they are a standing sentence
      // (the first render of this fix measured "US and EU: consulted, no status recorded." on 17 %
      // of indexed pages). The reason some registers were never consulted at all is on
      // /definitions.
      break
    }

    /* ------------------------------------- CLINICAL: registered trials only */
    case 'trial-history': {
      const entry = f.present('trialHistory')
      const v = asObject(entry?.value)
      const registered = asNumber(pick(v, 'registeredStudies', 'studies')) ?? 0
      const phases = asObject(pick(v, 'byPhase'))
      const statuses = asObject(pick(v, 'byOverallStatus'))
      const phaseWords = countWords(phases)
      p1(
        `${registered} registered ${registered === 1 ? 'study' : 'studies'} of ${name}: ${phaseWords ?? 'no phase recorded'}.`,
        entrySource(entry) ?? src,
      )
      const posted = asNumber(pick(v, 'studiesWithPostedResults'))
      const pubmed = asNumber(pick(asObject(pick(v, 'pubmedClinicalTrialCount')), 'count'))
      /*
       * §14(4): the trials question is where this row belongs. It was painted under the label
       * question, which asks what the label indicates and has nothing to say about who posted a
       * result. §13(7) makes it a row rather than a clause in a sentence: it is one ratio.
       */
      if (posted !== undefined && registered > 0) {
        facts.push({
          label: 'Registered studies posting no result',
          value: `${registered - posted} of ${registered}`,
        })
      }
      p2(
        joinBits([
          // "carry a PubMed clinical-trial record" was five fixed words on 36.9 % of indexed
          // pages — the largest repeated frame the audit found. Four words, count first.
          pubmed !== undefined ? `${pubmed} with a PubMed record` : undefined,
        ]) || `${registered} counted.`,
      )
      rows.push(...countRows(phases))
      rows.push(...countRows(statuses))
      break
    }

    /* ------------------------------------------------------- target-phase */
    case 'target-phase': {
      const targetEntry = f.present('molecularTarget')
      const phaseEntry = f.present('highestPhase')
      const targets = readTargetNames(targetEntry)
      const phase = readHighestPhase(phaseEntry)
      const registry = asObject(pick(asObject(phaseEntry?.value), 'registry'))
      const matched = asNumber(pick(registry, 'studiesMatched'))
      const atPhase = asNumber(pick(registry, 'studiesAtThatPhase'))
      p1(
        joinBits([
          `${joinList(targets.slice(0, 3))}: ${name}'s recorded ${targets.length === 1 ? 'target' : 'targets'}`,
          phase !== undefined ? `highest registry phase ${phase}` : undefined,
          atPhase !== undefined && matched !== undefined
            ? `${atPhase} of ${matched} matched studies at it`
            : matched !== undefined
              ? `${matched} matched studies`
              : undefined,
        ]) + '.',
        entrySource(targetEntry) ?? src,
      )
      // Each of the three blocks names the gaps its own values bear on, so the three second
      // paragraphs on one page differ instead of repeating one sentence three times.
      const gaps = developmentGaps(f, page, ['stop', 'trial'])
      p2(
        joinBits([
          targets.length > 1 ? `${targets.length} recorded targets` : undefined,
          gaps.length > 0 ? `not recorded here: ${joinList(gaps)}` : undefined,
        ]) || (scopeClause(f) ? `${sentenceCase(scopeClause(f) as string)}.` : ''),
        entrySource(phaseEntry),
      )
      rows.push(...targetRows(targetEntry))
      rows.push(...countRows(asObject(pick(registry, 'byPhase'))))
      break
    }

    /* --------------------------------------------------- mechanism-action */
    case 'mechanism-action': {
      const mechanismEntry = f.present('mechanismClass')
      const targetEntry = f.present('molecularTarget')
      const mechanisms = readMechanisms(mechanismEntry)
      const targets = readTargetNames(targetEntry)
      const actions = unique(mechanisms.map((m) => m.action ?? '').filter(Boolean))
      const firstMechanism = mechanisms.find((m) => m.mechanism)?.mechanism
      /*
       * §14(15), applying §13(7): "<action> on <target>. <n> recorded mechanism rows" is a stored
       * action, a stored target and a count in a fixed frame, and the block census measured that
       * frame on 220 pages (0.77 %). Each of the three is a value, so each is a labelled row. The
       * one thing here that is not a value is the register's own wording of the mechanism, which
       * is quoted as the register's sentence rather than restated as this site's.
       */
      if (actions.length > 0)
        facts.push({
          label: actions.length === 1 ? 'Recorded action' : 'Recorded actions',
          value: joinList(actions.map((a) => a.toLowerCase())),
        })
      if (targets.length > 0)
        facts.push({
          label: targets.length === 1 ? 'Recorded target' : 'Recorded targets',
          value: joinList(targets.slice(0, 3)),
        })
      facts.push({
        label: 'Recorded mechanism rows',
        value: String(mechanisms.length),
      })
      const gaps = developmentGaps(f, page, ['dose', 'trial'])
      if (gaps.length > 0) facts.push({ label: 'Not recorded here', value: joinList(gaps) })
      if (firstMechanism)
        p1(
          `The mechanism record reads "${clampSentence(firstMechanism, 300)}".`,
          entrySource(mechanismEntry) ?? src,
        )
      for (const m of mechanisms.slice(0, ROW_CAP)) {
        const value = [m.mechanism, m.action ? m.action.toLowerCase() : undefined]
          .filter(Boolean)
          .join('; ')
        if (!value) continue
        rows.push({
          label: m.action ? m.action.toLowerCase() : 'mechanism',
          ...(m.targetId ? { identifier: m.targetId } : {}),
          value,
        })
      }
      rows.push(...targetRows(targetEntry))
      break
    }

    /* ------------------------------------------------------ sponsor-phase */
    case 'sponsor-phase': {
      const sponsorEntry = f.present('sponsor')
      const phaseEntry = f.present('highestPhase')
      const sponsors = readSponsors(sponsorEntry)
      const phase = readHighestPhase(phaseEntry)
      const registry = asObject(pick(asObject(phaseEntry?.value), 'registry'))
      const matched = asNumber(pick(registry, 'studiesMatched'))
      const atPhase = asNumber(pick(registry, 'studiesAtThatPhase'))
      const lead = sponsors[0]
      p1(
        joinBits([
          lead
            ? `${lead.name}${lead.studies !== undefined ? `, ${lead.studies} ${lead.studies === 1 ? 'study' : 'studies'}` : ''}: the lead sponsor the registry names most often for ${name}`
            : undefined,
          sponsors.length > 1 ? `${sponsors.length} lead sponsors in all` : undefined,
          phase !== undefined
            ? `highest registry phase ${phase}${atPhase !== undefined && matched !== undefined ? `, ${atPhase} of ${matched} studies at it` : ''}`
            : undefined,
        ]) + '.',
        entrySource(sponsorEntry) ?? src,
      )
      const gaps = developmentGaps(f, page, ['dose', 'stop'])
      p2(
        joinBits([
          matched !== undefined
            ? `${matched} matched ${matched === 1 ? 'study' : 'studies'} in all`
            : undefined,
          gaps.length > 0 ? `not recorded here: ${joinList(gaps)}` : undefined,
        ]) || (scopeClause(f) ? `${sentenceCase(scopeClause(f) as string)}.` : ''),
        entrySource(phaseEntry),
      )
      for (const sponsor of sponsors.slice(0, ROW_CAP)) {
        rows.push({
          label: sponsor.name,
          ...(sponsor.nct ? { identifier: sponsor.nct } : {}),
          value: [
            sponsor.studies !== undefined
              ? `${sponsor.studies} ${sponsor.studies === 1 ? 'study' : 'studies'}`
              : undefined,
            sponsor.sponsorClass
              ? sponsor.sponsorClass.toLowerCase().replace(/_/g, ' ')
              : undefined,
          ]
            .filter(Boolean)
            .join('; '),
        })
      }
      rows.push(...countRows(asObject(pick(registry, 'byPhase'))))
      break
    }

    /* -------------------------------------------------- development-stop */
    case 'development-stop': {
      const why = f.present('whyDevelopmentStopped')
      const list = asArray(why?.value)
      const phaseValue = asObject(f.present('highestPhase')?.value)
      const registry = asObject(pick(phaseValue, 'registry'))
      const firstWhy = asString(pick(asObject(list[0]), 'whyStopped'))
      p1(
        `${list.length} registered ${list.length === 1 ? 'trial carries' : 'trials carry'} a stop entry for ${name}${firstWhy ? `; the first reads "${clampSentence(firstWhy, 300)}"` : ''}.`,
        entrySource(why) ?? src,
      )
      p2(
        joinBits([
          `${asNumber(pick(registry, 'studiesAtThatPhase')) ?? 0} of ${asNumber(pick(registry, 'studiesMatched')) ?? 0} at phase ${q.values.phase ?? ''}`,
          asString(pick(registry, 'highestPhase')),
        ]),
      )
      rows.push(...rowsFromTrials(list))
      rows.push(...countRows(asObject(pick(registry, 'byPhase'))))
      break
    }

    /* ------------------------------------------------------ never-dosed */
    /*
     * §14(11): `never-dosed` is retired.
     *
     * "Has X ever reached a person?" answered "X has no recorded human exposure", which is an
     * absence offered as an answer — the shape §13(1) retired from the classification question.
     * The header already carries it, once, as the evidence line "No human study recorded", and
     * `scripts/corpus-20k/questions/derive.ts` no longer pushes the question for any page. The
     * recorded ladder and the count of matched studies are on the page in the record's own rows.
     */

    default: {
      // A template with no builder must not silently render an empty block.
      p1(`${name}: no body rule is defined for this block.`)
      break
    }
  }

  const keep = paragraphs
    .map((_, i) => i)
    .filter((i) => (paragraphs[i] ?? '').trim().length > 2)
    .slice(0, 2)
  return {
    paragraphs: keep.map((i) => paragraphs[i] as string),
    bare: keep.map((i) => bare[i] as string),
    furniture: keep.map((i) => furniture[i] === true),
    // §14(8): applied once, over everything a block puts on the page, rather than at each of the
    // twenty places a row is built.
    //
    // §14(6): a fact row is painted on the page, above the prose, and a dataset record id is
    // technical provenance that belongs inside the closed disclosure. A fact therefore carries a
    // label and a value and never an identifier — enforced here rather than left to each of the
    // eleven builders that make one.
    facts: withoutPageKeys(facts).map(withoutIdentifier),
    rows: withoutPageKeys(rows),
  }
}

/**
 * A storage key, in every shape the corpus writes one (§14(8)).
 *
 * `K1:` through `K4:` are the identity revision's own keys, and `COMBO:`, `PRODUCT:` and `HOLD:`
 * the composite keys Phase 3 builds over them. None of them is a fact about a compound: the
 * timeline block painted "1989-12-11 K1:3J962UJT8H first approval", which puts the page's own
 * storage address in front of a reader as though it were the register's record number.
 */
const PAGE_KEY = /^(?:K[1-4]:|COMBO:|PRODUCT:|HOLD:|IK:)/

export function looksLikePageKey(value: string | undefined): boolean {
  return value !== undefined && PAGE_KEY.test(value.trim())
}

/** One row without its identifier: the label and the value, which is all a painted row carries. */
function withoutIdentifier(row: RevealedRow): RevealedRow {
  return { label: row.label, value: row.value }
}

/** The same rows with every storage key removed: the identifier dropped, the row kept. */
function withoutPageKeys(rows: readonly RevealedRow[]): RevealedRow[] {
  const out: RevealedRow[] = []
  for (const row of rows) {
    if (looksLikePageKey(row.label) || looksLikePageKey(row.value)) continue
    out.push(looksLikePageKey(row.identifier) ? withoutIdentifier(row) : row)
  }
  return out
}

/** The recorded target rows: the source's own symbol or preferred name, with its record id. */
function targetRows(entry: FieldEntry | undefined): RevealedRow[] {
  if (!entry || entry.state !== 'present') return []
  const v = asObject(entry.value)
  const out: RevealedRow[] = []
  for (const t of asArray(pick(v, 'openTargetsTargets')).slice(0, ROW_CAP)) {
    const o = asObject(t)
    const symbol = asString(pick(o, 'symbol', 'approvedSymbol'))
    if (!symbol) continue
    out.push({
      label: symbol,
      ...(asString(pick(o, 'ensemblId'))
        ? { identifier: asString(pick(o, 'ensemblId')) as string }
        : {}),
      value: asString(pick(o, 'targetName', 'approvedName')) ?? '',
    })
  }
  for (const t of asArray(pick(v, 'chemblTargets')).slice(0, ROW_CAP)) {
    const o = asObject(t)
    const pref = asObject(pick(o, 'prefName'))
    const label = pref ? asString(pick(pref, 'prefName')) : asString(pick(o, 'prefName'))
    if (!label) continue
    out.push({
      label,
      ...(asString(pick(o, 'targetChemblId'))
        ? { identifier: asString(pick(o, 'targetChemblId')) as string }
        : {}),
      value: asString(pick(o, 'kind')) ?? '',
    })
  }
  return out.filter((r) => r.label.length > 0)
}

function ladderRows(f: PageFacts): RevealedRow[] {
  return f.rungs.slice(0, ROW_CAP).map((r) => ({
    label: r.organism,
    ...(r.nct ? { identifier: r.nct } : {}),
    value: [
      r.kind,
      r.endpoint ? clampSentence(r.endpoint, 240) : undefined,
      r.studies !== undefined ? String(r.studies) : undefined,
    ]
      .filter(Boolean)
      .join('; '),
  }))
}

/**
 * A recorded object's own values, in one fixed order (§11).
 *
 * A seed row is the values a stage recorded, concatenated. The order they arrive in is a property
 * of where the record was stored — a JSON file keeps the writing order, a `jsonb` column keeps
 * PostgreSQL's canonical one — so the corpus renderer and the page printed the same row's parts in
 * two orders. The order is fixed here instead: a recorded date qualifies the value beside it and
 * comes last, and the rest follow their key. Nothing is dropped and nothing is reworded.
 */
const DATE_KEY = /date|asof|as_of|retrieved|checked|year/i

function orderedRecordEntries(record: Record<string, unknown>): Array<[string, unknown]> {
  return Object.entries(record)
    .filter(([key]) => key !== 'source' && key !== 'sources')
    .sort(([a], [b]) => {
      const dateA = DATE_KEY.test(a) ? 1 : 0
      const dateB = DATE_KEY.test(b) ? 1 : 0
      return dateA - dateB || a.localeCompare(b)
    })
}

/** A seed's own recorded rows, rendered as label/value pairs without inventing a frame. */
function seedRows(values: Record<string, unknown> | undefined): RevealedRow[] {
  if (!values) return []
  const out: RevealedRow[] = []
  for (const [key, value] of Object.entries(values).sort(([a], [b]) => a.localeCompare(b))) {
    if (key === 'sources' || key === 'source') continue
    if (Array.isArray(value)) {
      for (const item of value.slice(0, ROW_CAP)) {
        const o = asObject(item)
        if (!o) {
          const s = asString(item)
          if (s) out.push({ label: key, value: s })
          continue
        }
        const bits = orderedRecordEntries(o)
          .map(([, v]) => {
            const s = asString(v)
            return s ? clampSentence(s, 240) : undefined
          })
          .filter((b): b is string => Boolean(b))
        if (bits.length > 0) out.push({ label: key, value: bits.join('; ') })
      }
    } else {
      const o = asObject(value)
      if (o) {
        const bits = orderedRecordEntries(o)
          .map(([, v]) => {
            const s = asString(v)
            return s ? clampSentence(s, 240) : undefined
          })
          .filter((b): b is string => Boolean(b))
        if (bits.length > 0) out.push({ label: key, value: bits.join('; ') })
      } else {
        const s = asString(value)
        if (s) out.push({ label: key, value: clampSentence(s, 320) })
      }
    }
    if (out.length >= ROW_CAP * 2) break
  }
  return out
}

/* ------------------------------------------------------------- header */

const IDENTIFIER_LABELS: Array<[keyof IdentityRecord, string]> = [
  ['unii', 'UNII'],
  ['chemblId', 'ChEMBL id'],
  ['cid', 'PubChem CID'],
  ['cas', 'CAS number'],
  ['rxcui', 'RxCUI'],
  ['drugbankId', 'DrugBank id'],
]

const RELATION_LABELS: Record<string, string> = {
  'ester-of': 'ester of',
  'prodrug-of': 'prodrug of',
  'stereoisomer-of': 'stereoisomer of',
  'biosimilar-of': 'biosimilar of',
  contains: 'contains',
  'same-target': 'same target as',
}

/** The register named in the header line, and the date it was last verified. */
export function headerRegister(page: PageBundle, f: PageFacts): { register: string; date: string } {
  const registers: string[] = []
  const reg = asObject(f.present('regulatoryStatus')?.value)
  if (reg) {
    for (const raw of Object.values(reg)) {
      const j = asObject(raw)
      const status = asString(pick(j, 'status'))
      if (!status || status === 'unknown') continue
      for (const r of asArray(pick(j, 'records', 'evidence'))) {
        const name = asString(pick(asObject(r), 'register'))
        if (name) registers.push(name)
      }
      for (const s of asArray(pick(j, 'sources'))) {
        const name = asString(s)
        // A register's name, not a sentence about it: the extractor sometimes records an
        // explanatory string ("RNAWiki entity class (not a register; …)"), which is a caption and
        // belongs in the technical disclosure, not in the page's header line.
        if (name && name.length <= 40 && !name.includes('(')) registers.push(name)
      }
    }
  }
  if (registers.length === 0 && page.registry) registers.push('ClinicalTrials.gov')
  if (registers.length === 0 && page.identity.chemblId) registers.push('ChEMBL 37')
  if (registers.length === 0 && page.identity.unii) registers.push('FDA UNII')
  let date = ''
  for (const entry of f.fields.values()) {
    const verified = asString((entry as unknown as Record<string, unknown>).lastVerified)
    if (verified && verified > date) date = verified
    const sd = asString(entry.sourceDate)
    if (!verified && sd && sd > date) date = sd
  }
  return {
    register: unique(registers).slice(0, 3).join(', ') || 'no register entry',
    date: date || 'not recorded',
  }
}

/* ------------------------------------------------------- standing-sentence audit */

/**
 * The constraint the corpus is measured against forbids a sentence that stands on many pages: a
 * repeated element is markup, and a shared sentence lives on one linked page. This walks the same
 * blocks the renderer writes and separates what the page says in prose (the question line and the
 * two paragraphs) from what it says in a revealed row (a label beside a value). Only prose is
 * subject to the rule; row labels are counted and reported beside it, because a label is markup.
 *
 * A paragraph is split on sentence ends, and the trailing provenance anchor ("DailyMed label ·
 * <id> · <date>") is dropped by its middle dot: it is a citation, not a sentence.
 */
export interface PageProse {
  sentences: string[]
  rowLabels: string[]
  /**
   * The words in this page's prose that came from the record rather than from a template: the
   * compound's own name, and every slot the derivation filled (organism, target, endpoint, count,
   * duration, register code, biomarker). The repeated-frame audit needs them, because "≤ 4 words
   * or values" is a claim about the template's fixed words, not about the rendered string.
   */
  valueWords: string[]
}

function collectWords(into: Set<string>, text: string): void {
  for (const word of text.toLowerCase().match(/[a-z0-9+.]+/g) ?? []) into.add(word)
}

export function pageProse(page: PageBundle, f = facts(page)): PageProse {
  const sentences = new Set<string>()
  const rowLabels = new Set<string>()
  const valueWords = new Set<string>()
  collectWords(valueWords, page.displayName)
  // The audit measures what the page renders, so it applies the same controlled-substance filter
  // `renderPage` applies: a withheld block is not a sentence this page stands behind.
  const questions =
    page.blocks?.controlled === true
      ? page.questions.filter((q) => !CONTROLLED_WITHHELD_BLOCKS.has(q.block))
      : page.questions
  for (const q of questions) {
    sentences.add(q.text.trim())
    for (const value of Object.values(q.values)) collectWords(valueWords, value)
    const body = buildBlockBody(q, page, f)
    for (const paragraph of body.bare) {
      for (const part of paragraph.split(/(?<=[.?!])\s+/)) {
        const s = part.trim()
        if (s.length === 0) continue
        sentences.add(s)
      }
    }
    for (const row of body.rows) rowLabels.add(row.label.trim())
  }
  return { sentences: [...sentences], rowLabels: [...rowLabels], valueWords: [...valueWords] }
}

/**
 * The word five-grams of a page's prose, de-duplicated so one page counts a frame once.
 *
 * The sentence-level audit catches a whole sentence standing on many pages. It cannot see a frame
 * that is only part of a sentence — "jurisdictions record no status for" sat inside a sentence that
 * ended in a different list of codes on every page, so the sentence was distinct and the frame was
 * not. Counting five-grams is what makes that visible.
 */
export function proseFiveGrams(sentences: string[]): Set<string> {
  const out = new Set<string>()
  for (const sentence of sentences) {
    const words = sentence.toLowerCase().match(/[a-z0-9+.]+/g) ?? []
    for (let i = 0; i + 5 <= words.length; i += 1) out.add(words.slice(i, i + 5).join(' '))
  }
  return out
}

/**
 * True where at least one of the gram's words carries a digit. A count, an enrolment, a year, an
 * ISO date, an NCT number and a register record id all do; a frame of five bare words does not,
 * and that is the frame the constraint forbids above 5% of indexed pages.
 */
export function gramCarriesValue(gram: string, valueWords?: ReadonlySet<string>): boolean {
  return gram.split(' ').some((word) => /\d/.test(word) || (valueWords?.has(word) ?? false))
}

/* ------------------------------------------- Phase 4 blocks (docs/specs/phase4-generators.md) */

/**
 * The blocks Phase 4 adds to every corpus page: where it's registered, interactions, generic and
 * patent, the controlled-substance schedules, and the Tier 3 computed sections.
 *
 * Every value here was written by the stage that read the register — `scripts/revamp/build_blocks.py`
 * for the registration and patent lines, `scripts/revamp/interactions_build.py` for the interaction
 * rows, `scripts/revamp/tier3_sections.py` for the computed sentences — and reaches this module
 * through `scripts/revamp/page_blocks.py`, which joins them into one bundle per page. Nothing in
 * this section reads a source, decides a status or writes a claim. What it does is fix the *shape*
 * of the line the reader sees, once, so the loader, the React template and the measured text all
 * print the same words.
 *
 * Two rules are enforced structurally rather than by review.
 *
 * 1. **A controlled substance has no dose path.** `blocks.controlled` is the narrow trigger
 *    §4 fixes. Where it is set, `renderPage` filters the dose, bioavailability, self-experiment and
 *    time-to-signal blocks out of the question list before a single line is written, and the
 *    interaction lines drop everything but mechanism and direction. The question derivation
 *    withholds the same blocks upstream and migration 0026 refuses to store one; this is the third
 *    lock, and it is the one that runs on every render.
 * 2. **No raw class, seed or rule identifier reaches prose.** A rule fires as
 *    `C1-cyp-inhibitor-substrate` in storage and reads as "an enzyme inhibitor met a substrate of
 *    the same enzyme" on the page. The tables below are the only place the two meet.
 */

/** One "Where it's registered" line, as `data/revamp/blocks/registration.parquet` recorded it. */
export interface RegistrationLine {
  /** `SG`…`CA`, or `OTHER` for a source string the jurisdiction map does not carry. */
  jurisdiction: string
  /** "Singapore", or — under Other registers — the source's own words. */
  label: string
  status: string
  detail?: string
  source?: string
  dateChecked?: string
  ordinal: number
  /** The component of a combination product this line belongs to. */
  component?: string
  /** The finished line: status · detail · date checked. */
  line: string
  /**
   * The absence this row states, in the register's own three words — `not found`, `not cleared`
   * or `not checked` — and absent on a row that states anything affirmative (§11).
   *
   * `scripts/revamp/build_blocks.py` decides it, because the builder is the only place that knows
   * which branch it took: an SG row that says "Not found in the HSA listing" and then names a
   * Misuse of Drugs Act schedule has found something, and is not furniture.
   */
  absence?: string
  /**
   * True where the row belongs to the technical disclosure and never to a visible line (§13(6)).
   *
   * NCATS Inxight files a curated marketing record under the jurisdiction "unspecified". It names
   * no jurisdiction and no register, so it is not a register line; it is kept, and the block paints
   * it inside its closed disclosure.
   */
  disclosed?: boolean
  /** Application ids and curated marketing rows the summary line stands for (§3). */
  disclosure?: Record<string, unknown>
  provenance?: string[]
}

/** One interaction row, as `data/revamp/interactions/interactions.parquet` recorded it. */
export interface InteractionRow {
  counterpartKey?: string
  counterpartName?: string
  counterpartUnii?: string
  direction?: string
  mechanism?: string
  source?: string
  sourceRecordId?: string
  sourceUrl?: string
  sourceDate?: string
  setId?: string
  effectiveTime?: string
  labelSection?: string
  licence?: string
  ruleId?: string
  confidence?: string
  /** The label sentence, verbatim, on a Tier A row. */
  sentence?: string
  /** The Tier C derivation, naming its inputs verbatim; a JSON object on a Tier B row. */
  derivation?: string
  matchBasis?: string
  provenance?: Record<string, unknown>
  /**
   * A grouped curated row (§13(3)): one line per role over the enzymes and transporters the
   * curated dataset recorded, in place of nine lines each naming one enzyme and one record id.
   * `scripts/revamp/page_blocks.py` groups them, so the render, the loader and the page all read
   * one already-grouped row and cannot disagree about the wording.
   */
  groupedRole?: string
  groupedTargets?: string[]
  groupedMagnitude?: boolean
  /** The dataset record behind each grouped target: the technical disclosure only. */
  groupedRecordIds?: string[]
  /**
   * A grouped label-documented row (§14(5)): one line per label and direction class, naming every
   * counterpart that label states that direction for, in place of twenty-one lines each repeating
   * the label's set id and effective date. `scripts/revamp/page_blocks.py` groups them, so the
   * render, the loader and the page read one already-grouped row.
   */
  groupedCounterparts?: string[]
  /** How many counterparts the group holds beyond the ones the line names. */
  groupedCounterpartsBeyond?: number
  /** The direction class, in the words §14(5) uses: "avoid or monitor", "interaction stated". */
  groupedDirection?: string
}

export interface InteractionTierBlock {
  inline: InteractionRow[]
  disclosed: InteractionRow[]
  /** How many distinct counterparts this page holds in this tier, including the ones not stored. */
  total: number
  /** How many stored rows stand behind those counterparts, for the technical disclosure. */
  rowsRecorded?: number
}

export interface CheckedSources {
  sourcesChecked: string[]
  date: string
  hasLabel?: boolean
  statementOnly?: boolean
}

export interface PatentLine {
  eligible: boolean
  register?: string
  rld?: boolean | null
  earliestUnexpiredPatentExpiry?: string
  exclusivityEnd?: string
  genericAvailable?: boolean | null
  firstGenericApproval?: string
  teCode?: string
  noRecordLine?: string
  reason?: string
  line: string
  /** True where the line states only that no US register holds this record (§11 furniture). */
  absence?: boolean
  source?: string
  dateChecked?: string
  disclosure?: Record<string, unknown>
  provenance?: string[]
}

export interface ControlledRow {
  jurisdiction: string
  list: string
  classOrSchedule: string
  scheduleCode?: string
  itemNumber?: string
  substanceAsListed?: string
  statute?: string
  statuteUrl?: string
  versionDate?: string
  source?: string
  provenance?: string
}

/** One computed Tier 3 sentence with the map from its parts to the values behind them. */
export interface SectionSentence {
  values: Record<string, unknown>
  provenance: Record<string, unknown>
  templateId?: string
}

export interface RelationNote {
  relation: string
  counterpartKey?: string
  counterpartName?: string
  note?: string
  rule?: string
}

export interface PageBlocks {
  /** The narrow controlled-substance trigger of §4. Never inferred here. */
  controlled: boolean
  controlledBasis: string[]
  registration: RegistrationLine[]
  controlledSchedules: ControlledRow[]
  patent?: PatentLine
  interactions: {
    tiers: Partial<Record<'A' | 'B' | 'C', InteractionTierBlock>>
    checked?: CheckedSources
  }
  sections: Partial<Record<'neighbour' | 'potency' | 'timeline' | 'formOf', SectionSentence[]>>
  relations: RelationNote[]
  /** The disambiguated `h1` for one half of a same-name pair (§6). */
  disambiguation?: {
    displayName: string
    disambiguator?: string
    basis?: string
    collidesOn?: string
  }
  /** Trials the parent name matched, moved to the parent page by the Phase 3 R14 rule (§6). */
  trialsMoved?: { count: number; toKey: string; toName: string; rule?: string }
}

/** The tier label, in words, that begins every interaction line (§4). Never a letter, never a class. */
export const INTERACTION_TIER_LABELS: Readonly<Record<string, string>> = {
  A: 'Label-documented',
  B: 'Curated',
  C: 'Predicted from mechanism',
}

/**
 * What each interaction rule actually tested, in ordinary words.
 *
 * §4 prints the rule id on a Tier C line. A raw rule id is a storage token, and §7 forbids one in
 * prose, so the page prints the rule's words and the stored row keeps the id for the technical
 * disclosure. A rule absent from this table renders no rule clause at all rather than its id.
 */
export const INTERACTION_RULE_LABELS: Readonly<Record<string, string>> = {
  'A-label-statement': 'stated in an approved product label',
  'B-inxight-frdb': 'a curated enzyme and transporter record',
  'C1-cyp-inhibitor-substrate': 'an enzyme inhibitor met a substrate of the same enzyme',
  'C1-cyp-inducer-substrate': 'an enzyme inducer met a substrate of the same enzyme',
  'C3-additive-serotonergic': 'both act on serotonin signalling',
  'C3-additive-CNS-depressant': 'both depress the central nervous system',
  'C3-additive-anticoagulant-antiplatelet': 'both reduce blood clotting',
  'C3-additive-hypotensive': 'both lower blood pressure',
  'C3-additive-hypoglycaemic': 'both lower blood sugar',
  'C3-additive-hyperkalaemic': 'both raise blood potassium',
  'C3-additive-QT-prolonging': 'both carry a label warning about QT prolongation',
}

/** The confidence band, in words. `documented` is Tier A's own band and states no prediction. */
export const INTERACTION_CONFIDENCE_LABELS: Readonly<Record<string, string>> = {
  likely: 'likely',
  possible: 'possible',
}

/**
 * The short name of a checked source, for the page-level statement.
 *
 * `checked-sources.parquet` records the exact extraction each page was put through, which runs to
 * a hundred characters. The statement names the register, and the exact extraction stays in the
 * technical disclosure. A string this table does not recognise is kept verbatim rather than
 * dropped: the reader is never told a source was checked under a name it does not have.
 */
export function checkedSourceName(recorded: string): string {
  const lower = recorded.toLowerCase()
  if (lower.includes('openfda')) return 'openFDA drug labels'
  if (lower.includes('inxight')) return 'the NCATS Inxight Drugs curated interaction dataset'
  if (lower.includes('clinpgx') || lower.includes('pharmgkb')) return 'ClinPGx'
  if (lower.includes('recorded_background')) return "this record's own recorded interaction signals"
  return recorded
}

/** The distinct registers checked for a page, in the order they were recorded. */
export function checkedSourceNames(checked: CheckedSources | undefined): string[] {
  if (!checked) return []
  return unique(checked.sourcesChecked.map((source) => checkedSourceName(source)))
}

/**
 * The page-level statement §4 requires beside the interaction block, present whether or not the
 * block has a row.
 *
 * Where nothing was found it reads "No interaction found in [registers] as of [date]" — the exact
 * words Operating Rule 9 fixes, and never "safe" or "no interaction". Where rows were found, saying
 * "no interaction found" would be false, so the same statement is made in the affirmative: the
 * registers checked and the date. A page whose sources were not recorded gets no statement, because
 * there is nothing true to say about what was checked.
 */
export function checkedSourcesStatement(
  checked: CheckedSources | undefined,
  found: boolean,
): string | undefined {
  const names = checkedSourceNames(checked)
  if (names.length === 0 || !checked?.date) return undefined
  const list = joinPlainList(names)
  return found
    ? `Checked in ${list} as of ${checked.date}.`
    : `No interaction found in ${list} as of ${checked.date}.`
}

/** The middle dot the register lines already use, over the parts that exist. */
function joinDots(bits: Array<string | undefined>): string {
  return bits.filter((bit): bit is string => Boolean(bit && bit.trim())).join(' · ')
}

/** A comma list, for the role-and-magnitude pair §4 fixes on a curated line. */
function joinCommas(bits: Array<string | undefined>): string {
  return bits.filter((bit): bit is string => Boolean(bit && bit.trim())).join(', ')
}

/** "a, b and c" without the Oxford flourish the register lines use. */
function joinPlainList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0] as string
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/** The role and magnitude a curated Inxight row states, read from its stored derivation object. */
function curatedRoleAndMagnitude(row: InteractionRow): string | undefined {
  const derivation = row.derivation
  if (!derivation) return undefined
  let parsed: Record<string, unknown> | undefined
  try {
    parsed = asObject(JSON.parse(derivation))
  } catch {
    parsed = undefined
  }
  if (!parsed) return undefined
  const role = asString(pick(parsed, 'role'))
  const magnitude =
    asString(pick(parsed, 'magnitudeReported')) === 'yes'
      ? 'a magnitude is reported'
      : asString(pick(parsed, 'magnitudeReported')) === 'no'
        ? 'no magnitude reported'
        : undefined
  return joinCommas([role, magnitude]) || undefined
}

/** An ATC level-4 classification code as the registers write it: one letter, two digits, two letters. */
const ATC_LEVEL_4 = /^[A-Z][0-9]{2}[A-Z]{2}$/

/**
 * A rule (iii) derivation with each side's inputs named as what they are (§4, §7).
 *
 * The additive-effect rules record the membership evidence verbatim, and that evidence is a mix of
 * pharmacologic-action names ("Platelet Aggregation Inhibitors") and ATC classification codes
 * ("C09DX"). A name reads as itself; a bare code does not, and §7 keeps a bare code out of prose.
 * The corpus holds no ATC class-name table, so the code is not translated into words it would have
 * to invent: it is labelled with the classification it belongs to, and the reader can see that
 * "ATC C09DX" is a register's filing class rather than something about the substance.
 *
 * Only the rule (iii) derivations pass through here. The enzyme rules' derivations already name
 * their inputs in words and carry a quoted label sentence, which is left exactly as the label
 * wrote it.
 */
function classMembershipInputs(derivation: string): string {
  return derivation
    .split(' x ')
    .map((side) => {
      const terms = side.split('; ').map((term) => term.trim())
      // A side that is nothing but codes takes the label once — "ATC C08CA; C08GA" — because
      // repeating it in front of every code says the same thing six times.
      if (terms.length > 0 && terms.every((term) => ATC_LEVEL_4.test(term))) {
        return `ATC ${terms.join('; ')}`
      }
      return terms.map((term) => (ATC_LEVEL_4.test(term) ? `ATC ${term}` : term)).join('; ')
    })
    .join(' × ')
}

/** "Substrate of", "Inhibitor of" — the curated dataset's role, as the line opens it (§13(3)). */
function curatedRoleWord(role: string): string {
  const word = role.trim()
  return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()} of`
}

/**
 * "CYP1A2, 2A6, 2B6 and 3A4" — a shared name prefix written once (§13(3)).
 *
 * Nine enzymes of one family each carrying "Cytochrome P450" in full was the wall the reading
 * found. Where every name in the list starts with the same family prefix the prefix is written on
 * the first and dropped from the rest; where they do not, every name is written out.
 */
function abbreviateSharedPrefix(targets: readonly string[]): string {
  const names = unique([...targets]).sort()
  if (names.length === 0) return ''
  const first = names[0] as string
  const prefix = /^([A-Za-z]+)/.exec(first)?.[1]
  if (prefix && prefix.length >= 3 && names.every((name) => name.startsWith(prefix))) {
    const shortened = names.map((name, index) => (index === 0 ? name : name.slice(prefix.length)))
    return joinPlainList(shortened.filter((name) => name.length > 0))
  }
  return joinPlainList(names)
}

/** The curated dataset a Tier B line cites, named rather than identified by record (§13(3)). */
function curatedSourceName(row: InteractionRow): string | undefined {
  if (row.ruleId === 'B-inxight-frdb' || row.source === 'inxight') return 'Inxight FRDB'
  return row.source
}

/**
 * One interaction line, in the shape §4 fixes for its tier.
 *
 * Tier A quotes the label sentence and cites the label record and the date it took effect. Tier B
 * names the enzyme or transporter, the role and whether a magnitude was reported. Tier C opens with
 * "Predicted from mechanism:", names the counterpart, shows the derivation with its inputs named
 * verbatim, gives the direction, and closes with what the rule tested and how confident the
 * prediction is.
 *
 * On a controlled substance the line carries mechanism and direction only: the label sentence is
 * dropped, because a label's interaction sentence routinely carries dose, timing and combination
 * wording, and §4 gives that page no code path to it.
 */
export function interactionLine(
  tier: 'A' | 'B' | 'C',
  row: InteractionRow,
  options: { controlled?: boolean; quote?: boolean } = {},
): string {
  const label = INTERACTION_TIER_LABELS[tier] as string
  const counterpart = row.counterpartName ?? row.counterpartKey
  const controlled = options.controlled === true
  // The label's own words are quoted on the lines the page shows first. Beyond those, the line
  // gives the counterpart, the direction and the label record, and the reader who wants the
  // sentence follows the citation: thirty verbatim label paragraphs on one page are a wall, and
  // two products sharing one label would then share thirty identical paragraphs.
  const quote = options.quote !== false

  if (tier === 'A') {
    const citation = joinDots([
      row.setId ? `DailyMed label ${row.setId}` : undefined,
      row.effectiveTime,
    ])
    /*
     * §14(5): one line per label and direction class.
     *
     * Piroxicam's page carried twenty-one label-documented lines, every one of them repeating the
     * same DailyMed set id and the same effective date, and differing only in the counterpart's
     * name and one of three direction phrases. That is a table written as sentences. The line
     * names the label once, the direction once, and every counterpart the label states that
     * direction for.
     */
    const counterparts = row.groupedCounterparts ?? []
    if (counterparts.length > 0) {
      const beyond = row.groupedCounterpartsBeyond ?? 0
      const named = joinPlainList([...counterparts])
      const withMore = beyond > 0 ? `${named} and ${beyond} more` : named
      const direction = row.groupedDirection ?? row.direction ?? 'an interaction is stated'
      return `${label}${citation ? ` (${citation})` : ''}: ${direction} with ${withMore}`
    }
    const body =
      controlled || !quote
        ? joinCommas([row.direction, row.mechanism])
        : row.sentence
          ? `"${clampSentence(row.sentence, 320)}"`
          : joinCommas([row.direction, row.mechanism])
    return joinDots([
      label,
      counterpart ? `${counterpart}: ${body || 'an interaction is stated'}` : body,
      citation || undefined,
    ])
  }

  if (tier === 'B') {
    /*
     * §13(3): the enzyme and transporter rows are one line per role — "Substrate of CYP1A2, 2A6,
     * 2B6, 2C19, 2C8, 2C9, 2D6, 2E1 and 3A4 (Inxight FRDB)" — rather than nine lines each naming
     * one enzyme and its record id. The record ids are in the closed disclosure.
     */
    if (row.groupedRole && (row.groupedTargets ?? []).length > 0) {
      return joinDots([
        label,
        joinCommas([
          `${curatedRoleWord(row.groupedRole)} ${abbreviateSharedPrefix(row.groupedTargets ?? [])}`,
          row.groupedMagnitude === true ? 'with a reported magnitude' : undefined,
        ]),
        curatedSourceName(row),
      ])
    }
    const body = curatedRoleAndMagnitude(row) ?? row.direction
    // The dataset record id is a storage token and lives in the disclosure (§13(3)); the line
    // names the dataset that recorded it.
    return joinDots([
      label,
      counterpart ? `${counterpart}: ${body || 'a curated row is recorded'}` : body,
      curatedSourceName(row),
    ])
  }

  const derivation = controlled ? row.mechanism : (row.derivation ?? row.mechanism)
  const named =
    derivation && row.ruleId?.startsWith('C3-') ? classMembershipInputs(derivation) : derivation
  const direction = row.direction
  const body = named
    ? direction
      ? `${named} → ${direction}`
      : named
    : (direction ?? 'a mechanism is shared')
  // The counterpart is named here as it is on the other two tiers. A prediction the reader cannot
  // attach to a second substance is not a prediction they can act on, and rule (iii) states a class
  // membership rather than a direction naming the other drug, so without this every additive-class
  // line on a page reads the same.
  const head = counterpart ? `${label}: ${counterpart} · ${body}` : `${label}: ${body}`
  const rule = row.ruleId ? INTERACTION_RULE_LABELS[row.ruleId] : undefined
  const band = row.confidence ? INTERACTION_CONFIDENCE_LABELS[row.confidence] : undefined
  const tail = joinCommas([rule, band])
  return tail ? `${head} (${tail})` : head
}

/**
 * One controlled-substance schedule line: the schedule in the instrument's own words, the
 * instrument, and the version it was read at. The schedule code stays out of the line — it is the
 * instrument's filing reference, not a fact about the substance.
 */
export function controlledLine(row: ControlledRow): string {
  // §11: the page prints the name the register listed, however long it is
  // (`components/dossier/corpus/RegistrationBlock.tsx`), so the measured text carries it too. A
  // cap here printed one thing and measured another.
  const heldName = row.substanceAsListed ? `listed as "${row.substanceAsListed}"` : undefined
  return joinDots([
    row.classOrSchedule,
    row.list,
    row.versionDate ? `version ${row.versionDate}` : undefined,
    heldName,
  ])
}

/**
 * The dataset records behind one interaction line, for the closed disclosure and nowhere above it.
 *
 * §13(3) put the record ids inside the disclosure and grouped the curated enzyme rows, and the
 * grouped line then stood for several records at once. §14(6) is what makes this one function: the
 * corpus renderer wrote "Substrate of CYP1A1, 1A2 and 2E1 frdb:ddi:12474 · frdb:ddi:12473 · …" and
 * the template painted "CuratedB-inxight-frdb", because each had its own idea of what a disclosure
 * row says. They read this instead, so the render and the page carry one row.
 */
export interface InteractionDisclosureSource {
  tierLabel?: string
  line?: string
  counterpartName?: string
  ruleId?: string
  setId?: string
  sourceRecordId?: string
  groupedRecordIds?: readonly string[]
  /** The direction class a grouped label-documented line states (§14(5)). */
  groupedDirection?: string
  provenance?: Record<string, unknown>
}

export function interactionRecordIds(row: InteractionDisclosureSource): string[] {
  const grouped = [...(row.groupedRecordIds ?? [])].filter((id) => id.trim().length > 0)
  if (grouped.length > 0) return grouped
  // The loader stores the build's own provenance map, whose `record` entry is the dataset record
  // (or the semicolon-joined records of a grouped line). It is the same value on both sides.
  const recorded = row.provenance?.record
  const fromProvenance =
    typeof recorded === 'string'
      ? recorded
          .split(';')
          .map((id) => id.trim())
          .filter((id) => id.length > 0)
      : []
  if (fromProvenance.length > 1) return fromProvenance
  return [row.ruleId, row.setId ?? row.sourceRecordId].filter((value): value is string =>
    Boolean(value && value.trim()),
  )
}

/** The label a disclosure row carries: the counterpart it names, else the line's own words. */
export function interactionDisclosureLabel(row: InteractionDisclosureSource): string {
  if (row.counterpartName && row.counterpartName.trim().length > 0) return row.counterpartName
  if (row.groupedDirection && row.groupedDirection.trim().length > 0) return row.groupedDirection
  const line = (row.line ?? '').trim()
  const prefix = `${row.tierLabel ?? ''} · `
  const body = row.tierLabel && line.startsWith(prefix) ? line.slice(prefix.length) : line
  // A grouped curated line reads "Substrate of CYP1A2, 2A6 … · Inxight FRDB"; the dataset name at
  // the end is the same word on every such line and the row's ids say it already.
  const withoutSource = body.split(' · ')[0] ?? body
  return withoutSource.length > 0 ? withoutSource : (row.tierLabel ?? '')
}

/** The field paths behind one interaction row, as the interaction build recorded them. */
export function interactionProvenance(row: InteractionRow): string[] {
  return Object.values(row.provenance ?? {})
    .map((value) => (typeof value === 'string' ? value : JSON.stringify(value)))
    .sort()
}

/** The registration line as the page prints it: the jurisdiction, then the recorded status line. */
export function registrationLineText(row: RegistrationLine): string {
  const head = row.component ? `${row.component} — ${row.label}` : row.label
  return `${head}: ${row.line}`
}

/* ------------------------------------------------ the absence table (§11) */

/**
 * The four columns of the absence table, and the one sentence above it.
 *
 * §11: the shared tokens — "as of", the date, the register names — are written once, in a caption
 * or a column heading, and each absent register is one cell rather than a sentence. The caption's
 * date is the latest date any of the page's absent registers was read on; each register's own read
 * date stays in its row, because the registers were not all read on one day and saying they were
 * would be untrue.
 */
export const ABSENCE_COLUMNS: readonly string[] = ['Jurisdiction', 'Register', 'Finding', 'Read']

export function absenceCaption(asOf: string | undefined): string {
  return asOf === undefined
    ? 'Registers holding no record of this substance'
    : `Registers holding no record of this substance, as of ${asOf}`
}

/** The latest date any of these absent registers was read on. */
export function absentAsOf(rows: readonly RegistrationLine[]): string | undefined {
  const dates = rows
    .map((row) => row.dateChecked)
    .filter((date): date is string => Boolean(date))
    .sort()
  return dates[dates.length - 1]
}

/** One absent register as a table row: jurisdiction, register, finding, and the date it was read. */
export function absenceRowText(row: RegistrationLine): string {
  const head = row.component ? `${row.component} — ${row.label}` : row.label
  // A register that was never cleared for this corpus has no read date, and the cell says so
  // rather than leaving a reader to supply one.
  return [
    head,
    row.source ?? row.label,
    row.absence ?? 'not found',
    row.dateChecked ?? 'not read',
  ].join(' ')
}

/**
 * The register applications a summary line stands for, for the disclosure (§3, §7).
 *
 * Only `applications` is read. It is the list the summary line's own count was computed from, so
 * the ids under the disclosure and the number in the line are always the same set. The curated
 * stitcher record carries an `approvalApplicationIds` array too, and on some records that array
 * holds dosage strengths rather than application ids ("0.25%w/v OPHTHALMIC SOLUTION/ DROPS"), so
 * reading it as a fallback printed strengths under a heading that promised applications.
 */
export function registerApplicationIds(row: RegistrationLine | PatentLine): string[] {
  return unique(
    asArray(pick(row.disclosure ?? {}, 'applications'))
      .map((item) => asString(item))
      .filter((item): item is string => Boolean(item)),
  )
}

/**
 * The name a page prints, under §10's rule: never an all-caps register string where a readable
 * synonym of the same record exists.
 *
 * Registers write a substance name in full capitals — CLOBETASOL, POTASSIUM CITRATE ANHYDROUS,
 * EPITESTOSTERONE — and inside a sentence it reads as shouting. §10: "the printed name is never an
 * all-caps register string when a title-case synonym of kind common or INN exists". Two candidate
 * shapes qualify, and both name this same record:
 *
 *  - a `common` or `inn` synonym that is the same name in readable case. The vocabulary tag a
 *    register appends is removed first, because `Clobetasol [WHO-DD]` and `CLOBETASOL` are one
 *    name and the tag is the register's, not the substance's.
 *  - a `merged-page` synonym whose name is the display name with the register's trailing qualifier
 *    removed — `Potassium Citrate` for `POTASSIUM CITRATE ANHYDROUS`. It qualifies because this
 *    page absorbed that record, so it is this page's own name and not another substance's. A
 *    `merged-page` name that is not that prefix is a different printed form (a suffixed biological
 *    proper name, say) and is left as a synonym.
 *
 * Nothing else replaces a register string: a `common` synonym naming a shorter substance —
 * `Dapagliflozin` on `DAPAGLIFLOZIN PROPANEDIOL` — is a different record and printing it would put
 * the parent's name on the salt's page, which is the defect §6 exists to remove.
 *
 * Slugs do not change (§10); this is the printed name only.
 */
const VOCABULARY_TAG = /\s*\[[^\]]*\]\s*$/

function isAllCapsRegisterString(name: string): boolean {
  return name === name.toUpperCase() && (name.match(/[A-Za-z]/g)?.length ?? 0) >= 2
}

function nameToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function printedDisplayName(displayName: string, synonyms: readonly Synonym[]): string {
  const name = displayName.trim()
  if (name.length === 0 || !isAllCapsRegisterString(name)) return displayName
  const target = nameToken(name)
  const sameName: string[] = []
  const absorbed: string[] = []
  for (const synonym of synonyms) {
    const kind = (synonym.kind ?? '').toLowerCase()
    if (kind !== 'common' && kind !== 'inn' && kind !== 'merged-page') continue
    const candidate = (synonym.name ?? '').replace(VOCABULARY_TAG, '').trim()
    if (candidate.length === 0 || !/[a-z]/.test(candidate) || isAllCapsRegisterString(candidate))
      continue
    const token = nameToken(candidate)
    if (token === target) sameName.push(candidate)
    else if (kind === 'merged-page' && target.startsWith(`${token} `)) absorbed.push(candidate)
  }
  // Deterministic in both lists: the same record must print the same name on every run.
  if (sameName.length > 0) return [...sameName].sort()[0] as string
  if (absorbed.length > 0)
    return [...absorbed].sort((a, b) => b.length - a.length || a.localeCompare(b))[0] as string
  return displayName
}

/** The recorded sentence of a computed section, exactly as the computing stage wrote it. */
export function sectionSentenceText(entry: SectionSentence): string | undefined {
  return asString(pick(entry.values, 'sentence'))
}

/**
 * A computed section as the page paints it (§13(7), §13(8)).
 *
 * The nearest-approved-neighbour section stated one comparison in one sentence — "Closest approved
 * compound: Flurazepam (similarity 0.48); Flurazepam is approved (US, CA), generic available" —
 * and the reading found it reading as a template with a name swapped in, because that is what a
 * sentence built from four values is. The four values are rows. A prose sentence stays only where
 * the maximum-common-substructure comparison named the substituent that differs, because that is a
 * finding and not a value.
 *
 * The publication span and the originating organisation are one value each and are rows for the
 * same reason. Everything else the computing stage wrote — the potency rank, target validation,
 * target headwind — carries several values in one claim and stays prose.
 */
export function sectionSentenceParts(entry: SectionSentence): {
  rows: RevealedRow[]
  sentence?: string
} {
  const values = entry.values
  const template = entry.templateId ?? ''
  const rows: RevealedRow[] = []

  if (template.startsWith('t3-neighbour-')) {
    const neighbour = asString(pick(values, 'neighbourName'))
    const similarity = asString(pick(values, 'similarityRendered', 'similarity'))
    if (!neighbour)
      return {
        rows,
        ...(sectionSentenceText(entry) ? { sentence: sectionSentenceText(entry) as string } : {}),
      }
    const status = asObject(pick(values, 'status')) ?? {}
    const approvedIn = asArray(pick(status, 'approvedIn'))
      .map((item) => asString(item))
      .filter((item): item is string => Boolean(item))
    const bits = [
      approvedIn.length > 0 ? `approved ${approvedIn.join(', ')}` : undefined,
      pick(status, 'withdrawn') === true ? 'withdrawn' : undefined,
      pick(status, 'genericAvailable') === true
        ? 'generic available'
        : pick(status, 'genericAvailable') === false
          ? 'no generic recorded'
          : undefined,
    ].filter((bit): bit is string => Boolean(bit))
    rows.push({
      label: 'Closest approved compound',
      value: [neighbour, similarity ? `similarity ${similarity}` : undefined, ...bits]
        .filter((bit): bit is string => Boolean(bit))
        .join(' · '),
    })
    /*
     * §14(15): the substituent comparison is a row too.
     *
     * §13(8) kept it as prose because the maximum-common-substructure difference is a finding
     * rather than a stored value. The block census then measured the sentence it produces on 168
     * pages (0.59 %), over the 0.5 % line, and for the reason §13(7) gives: "It differs from X by
     * a methyl substituent on the aromatic ring" is one computed value inside a fixed frame. The
     * value keeps its own labelled row beside the similarity it belongs to.
     */
    const substituent = asString(pick(values, 'substituent'))
    const where = asString(pick(values, 'substituentLocation'))
    if (substituent) {
      rows.push({
        label: 'Structural difference',
        value: `${substituent} substituent${where ? ` ${where}` : ''}`,
      })
    }
    return { rows }
  }

  if (template === 't3-timeline-publication-span-v1') {
    const first = asNumber(pick(values, 'firstYear'))
    const last = asNumber(pick(values, 'lastYear'))
    if (first !== undefined && last !== undefined) {
      rows.push({
        label: 'Publications (ChEMBL)',
        value: first === last ? String(first) : `${first}\u2013${last}`,
      })
      return { rows }
    }
  }

  if (template.startsWith('t3-timeline-originator')) {
    const organisation = asString(pick(values, 'organisationRendered', 'organisation'))
    if (organisation) {
      rows.push({
        label: 'Originating organisation',
        value:
          pick(values, 'noRecordAfter2020') === true
            ? `${organisation} · no record after 2020`
            : organisation,
      })
      return { rows }
    }
  }

  const sentence = sectionSentenceText(entry)
  return { rows, ...(sentence ? { sentence } : {}) }
}

/** The other record a computed sentence names, where the computing stage recorded one. */
export function sectionSentenceCounterpart(entry: SectionSentence): {
  counterpartKey?: string
  counterpartName?: string
} {
  // The three names the computing stages use for "the other page this sentence names", read in
  // the same order `lib/corpus/dossier-page.ts` reads them: the nearest-neighbour section records
  // `neighbourPage`, the form-of note `counterpartPage`, the moved-trials note `toKey`.
  const key = asString(pick(entry.values, 'counterpartPage', 'neighbourPage', 'toKey'))
  const name = asString(pick(entry.values, 'counterpartName'))
  return { ...(key ? { counterpartKey: key } : {}), ...(name ? { counterpartName: name } : {}) }
}

/** Sentence → the field or computed value behind each part of it, as the stage recorded it. */
export function sectionSentenceFields(entry: SectionSentence): string[] {
  const fields = asObject(pick(entry.provenance, 'fields'))
  if (!fields) return []
  return Object.values(fields)
    .map((value) => asString(value))
    .filter((value): value is string => Boolean(value))
}

/**
 * The form-of note (§6): the identity sentence a salt, ester, biosimilar or product component page
 * opens with, and — where Phase 3 moved trials to the parent — the count and where they went.
 */
/**
 * "N registered trials name X …; they are recorded on the X page." — one wording, two callers.
 *
 * `scripts/corpus-20k/load/materialise.ts` stores this sentence as a `formOf` section row and this
 * module writes it into the measured text, so it is built here once: two copies of the words drift,
 * and §11 makes the render and the page's own text a tested identity.
 *
 * What the studies named decides the wording, because the four rules move studies for four
 * different reasons and one wording for all of them would describe something the registry did not
 * record.
 *
 *   R14 / R14b   the interventions name the parent compound without this salt, ester or stereo
 *                descriptor.
 *   R14c (§11)   the interventions name only the reference product this page is a biosimilar of.
 *   R14d (§12)   the interventions name only the name this record and one other both print, and
 *                the registers rank the other record's key first.
 *   R14e (§12)   the interventions do not name this product's full component set, so the study is
 *                not this combination's; it is recorded where its interventions were matched.
 */
export function movedTrialsSentence(moved: {
  count: number
  toName: string
  rule?: string
}): string {
  const studies = moved.count === 1 ? 'study' : 'studies'
  const names = moved.count === 1 ? 'names' : 'name'
  const carried = moved.count === 1 ? 'it is' : 'they are'
  const rule = moved.rule ?? ''
  if (rule.startsWith('R14c'))
    return (
      `${moved.count} registered ${studies} ${names} only the reference product ${moved.toName}; ` +
      `${carried} recorded on the ${moved.toName} page.`
    )
  if (rule.startsWith('R14d'))
    return (
      `${moved.count} registered ${studies} ${names} only the name this record and one other ` +
      `both print; the registers key the other record first, so ${carried} recorded there:`
    )
  if (rule.startsWith('R14e'))
    return (
      `${moved.count} registered ${studies} ${names} interventions that do not cover this ` +
      `product's whole component set; ${carried} recorded where those interventions were ` +
      `matched, on the ${moved.toName} page.`
    )
  return (
    `${moved.count} registered ${studies} ${names} ${moved.toName} without this form; ` +
    `${carried} recorded on the ${moved.toName} page.`
  )
}

export function formOfNoteLines(blocks: PageBlocks | undefined): Array<{
  sentence: string
  fields: string[]
  counterpartKey?: string
  counterpartName?: string
}> {
  if (!blocks) return []
  const out: Array<{
    sentence: string
    fields: string[]
    counterpartKey?: string
    counterpartName?: string
  }> = []
  for (const entry of blocks.sections.formOf ?? []) {
    const sentence = sectionSentenceText(entry)
    if (!sentence) continue
    out.push({
      sentence,
      fields: sectionSentenceFields(entry),
      ...sectionSentenceCounterpart(entry),
    })
  }
  const moved = blocks.trialsMoved
  if (moved && moved.count > 0) {
    out.push({
      sentence: movedTrialsSentence(moved),
      fields: ['data/revamp/identity/trial-reassignments-v5.csv action=move'],
      // The template links the page the studies went to, from the same `toKey`; the measured text
      // carries the same words after the sentence.
      counterpartKey: moved.toKey,
      counterpartName: moved.toName,
    })
  }
  return out
}

/** Question blocks a controlled substance never carries (§4; migration 0026 enforces the same set). */
export const CONTROLLED_WITHHELD_BLOCKS: ReadonlySet<string> = new Set([
  'dose-studied',
  'bioavailability',
  'n-of-1',
  'time-to-signal',
])

/** Derived seeds a controlled substance never carries: 1, 2 and 6, exactly as R2 removes them. */
export const CONTROLLED_WITHHELD_SEEDS: readonly number[] = [1, 2, 6]

/**
 * What a dose, a timing, a route or a combination protocol looks like in the corpus's own words.
 *
 * §4 and Operating Rule 9 give a controlled substance's page no code path to any of them. Removing
 * the four blocks that ask about dosing is most of that, but not all of it: a registry trial title
 * says "320 mg/d", a bioavailability sentence quotes "QNASL Nasal Aerosol 320 mcg", and a recorded
 * endpoint says "Maximum Tolerated Dose". Those are the source's words, and on any other page they
 * are exactly the evidence a reader wants — but on a page carrying a Misuse of Drugs Act, DEA or
 * Poisons Standard Schedule 8/9 entry they are the thing the rule forbids, whoever wrote them.
 *
 * So `renderPage` drops a line matching any of these from a controlled page, and counts what it
 * dropped. Nothing is rewritten or softened: the line is not rendered at all, which is what "the
 * generator has no code path that emits dose, timing, route, frequency or combination-protocol
 * text for them" means when the text arrives from a register rather than from a template.
 */
export const CONTROLLED_DOSE_PATTERNS: readonly RegExp[] = [
  /\b\d+(?:\.\d+)?\s?(?:mg|mcg|µg|ug|g|ml|iu|units?)\b/i,
  /\b(?:once|twice|three times|four times)\s+(?:a|per)\s+(?:day|week|month)\b/i,
  /\b(?:daily|nightly|hourly)\s+dos(?:e|ing|age)\b/i,
  /\bdos(?:e|es|ing|age)\s+(?:of|adjust|regimen|schedule|escalat|titrat|reduc|increas)/i,
  /\b(?:maximum|minimum|recommended|starting|loading|maintenance)\s+(?:tolerated\s+)?dos(?:e|age)\b/i,
  /\b(?:administered|taken|given|injected|infused)\s+(?:orally|intravenously|subcutaneously|intramuscularly|sublingually|by mouth)\b/i,
  /\b(?:co-?administer(?:ed|ation)?|stack(?:ed|ing)?|combined? with)\b\s+(?:at|for|over|using)\b/i,
  /\b(?:washout|crossover)\s+period\b/i,
]

/** True where a line carries dose, timing, route or combination-protocol text (§4). */
export function carriesDoseText(line: string): boolean {
  return CONTROLLED_DOSE_PATTERNS.some((pattern) => pattern.test(line))
}

/**
 * §7: a dose-response quotation renders only where the sentence names the page.
 *
 * The Phase 1 reading found dose-response sections quoting a sentence about a different compound
 * entirely, because the extraction matched a paper, not a molecule. A quotation that does not name
 * the compound or one of its recorded synonyms is not evidence about it, so the section does not
 * fire. Comparison is case-insensitive and strips the salt and hydrate suffixes a display name
 * carries but a paper does not.
 */
const SALT_SUFFIXES =
  /\s+(hydrochloride|hydrobromide|sulfate|sulphate|acetate|maleate|mesylate|besylate|citrate|tartrate|fumarate|succinate|phosphate|sodium|potassium|calcium|magnesium|dihydrate|monohydrate|hydrate|anhydrous)\b/g

export function nameStem(name: string): string {
  return name
    .toLowerCase()
    .replace(SALT_SUFFIXES, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function sentenceNamesCompound(
  sentence: string,
  displayName: string,
  synonyms: readonly string[] = [],
): boolean {
  const haystack = ` ${nameStem(sentence)} `
  const candidates = [displayName, ...synonyms]
    .map((name) => nameStem(name))
    .filter((name) => name.length >= 4)
  for (const candidate of candidates) {
    if (haystack.includes(` ${candidate} `)) return true
    // A stem of two or more words matches on its own head word too: "heparin calcium" is named by
    // a sentence that says "heparin", and the page is the calcium salt of exactly that.
    const head = candidate.split(' ')[0]
    if (head && head.length >= 5 && haystack.includes(` ${head} `)) return true
  }
  return false
}

/* ------------------------------------------------ trial reassignment */

/**
 * The registry aggregate with the studies Phase 3 moved to another page removed.
 *
 * Every list in the aggregate carries the NCT identifier, so the lists are filtered exactly. The
 * derived counts are recomputed from `perTrial`, which the v3 aggregate carries for 8,615 of the
 * 8,663 pages that have one; where `perTrial` is absent, only `studies` is reduced by the number of
 * identifiers removed, and every count that cannot be recomputed is dropped.
 */
export function aggregateWithoutMovedStudies(
  aggregate: Record<string, unknown>,
  moved: ReadonlySet<string>,
): Record<string, unknown> {
  if (moved.size === 0) return aggregate
  const out: Record<string, unknown> = { ...aggregate }
  const keeps = (item: unknown): boolean => {
    const nct = asString(asObject(item)?.nct)
    return nct === undefined || !moved.has(nct)
  }
  for (const field of [
    'perTrial',
    'stopped',
    'primaryOutcomes',
    'completedOverTwoYearsWithoutResults',
    'ongoing',
    'trials',
  ]) {
    const held = aggregate[field]
    if (Array.isArray(held)) out[field] = held.filter(keeps)
  }
  const perTrial = Array.isArray(out.perTrial) ? out.perTrial : undefined
  if (perTrial !== undefined) {
    out.studies = perTrial.length
    out.summarised = perTrial.length
    const byPhase: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    const enrolments: number[] = []
    for (const item of perTrial) {
      const row = asObject(item)
      if (!row) continue
      const phase = asString(row.phase)
      if (phase) byPhase[phase] = (byPhase[phase] ?? 0) + 1
      const status = asString(row.status)
      if (status) byStatus[status] = (byStatus[status] ?? 0) + 1
      const enrolment = asNumber(row.enrollment) ?? asNumber(row.enrolment)
      if (enrolment !== undefined) enrolments.push(enrolment)
    }
    out.byPhase = byPhase
    out.byOverallStatus = byStatus
    if (enrolments.length > 0) {
      const sorted = [...enrolments].sort((a, b) => a - b)
      const middle = Math.floor(sorted.length / 2)
      out.enrolment = {
        max: sorted[sorted.length - 1],
        min: sorted[0],
        median:
          sorted.length % 2 === 1
            ? sorted[middle]
            : Math.round((((sorted[middle - 1] as number) + (sorted[middle] as number)) / 2) * 10) /
              10,
        n: sorted.length,
      }
      out.enrolmentMin = sorted[0]
    } else {
      delete out.enrolment
      delete out.enrolmentMin
    }
    // The longest run is a named study; where that study moved, the page no longer holds a longest
    // run it can name, and the field goes rather than pointing at another page's trial.
    const heldNct = asString(asObject(aggregate.longestDuration)?.nct)
    if (heldNct !== undefined && moved.has(heldNct)) delete out.longestDuration
  } else {
    const studies = asNumber(aggregate.studies)
    if (studies !== undefined) out.studies = Math.max(0, studies - moved.size)
  }
  // A count with no per-trial flag behind it cannot be recomputed, and restating it would count
  // studies that belong to another page. It is dropped: the page then says less, not something false.
  delete out.hasResults
  return out
}

/* ------------------------------------------------ shared with the template */

/**
 * Consecutive revealed rows sharing a label are one group; the label becomes the group's heading.
 *
 * The template has printed the rows this way since the disclosure spec was written — the label
 * once, above its run, instead of twenty times beside it. The corpus renderer printed the label on
 * every row, so the two disagreed on every disclosure that holds a run. One implementation now,
 * used by both.
 */
export interface RevealedRowGroup {
  label?: string
  rows: RevealedRow[]
  /**
   * §14(9): true where this group is the counted remainder of a longer list and the template paints
   * it inside a closed `<details>` of its own rather than on the page.
   */
  disclosed?: boolean
}

/**
 * §14(9): how many rows of one list a reader meets before the rest are behind a control.
 *
 * §7 fixed six for a trial list and §13(5) made the remainder a closed disclosure; the reading of
 * draw 4 found the endpoint list under the largest-trial question painting fourteen, because the
 * rule was written into the one builder that makes trial rows and not into the grouping every
 * other list goes through. It is one number, applied once, here.
 */
export const VISIBLE_ROWS = 6

/** The label `rowsFromTrials` gives the rows past the sixth; it is already a counted remainder. */
const FURTHER_ROWS = /^\d+ (?:further recorded trials?|more recorded rows?)$/

export function groupRevealedRows(rows: readonly RevealedRow[]): RevealedRowGroup[] {
  const grouped: RevealedRowGroup[] = []
  let index = 0
  while (index < rows.length) {
    const current = rows[index]
    if (!current) break
    let end = index + 1
    while (end < rows.length && rows[end]?.label === current.label) end += 1
    const run = rows.slice(index, end)
    if (run.length > 1) {
      grouped.push({ label: current.label, rows: run })
    } else {
      const previous = grouped[grouped.length - 1]
      if (previous && previous.label === undefined && previous.disclosed !== true)
        previous.rows.push(...run)
      else grouped.push({ rows: run })
    }
    index = end
  }
  // The cap, over the finished groups: six rows on the page, the counted rest inside a control.
  const out: RevealedRowGroup[] = []
  for (const group of grouped) {
    if (group.label !== undefined && FURTHER_ROWS.test(group.label)) {
      out.push({ ...group, disclosed: true })
      continue
    }
    if (group.rows.length <= VISIBLE_ROWS) {
      out.push(group)
      continue
    }
    const rest = group.rows.slice(VISIBLE_ROWS)
    out.push({ ...group, rows: group.rows.slice(0, VISIBLE_ROWS) })
    out.push({
      label: `${rest.length} more recorded ${rest.length === 1 ? 'row' : 'rows'}`,
      rows: rest,
      disclosed: true,
    })
  }
  return out
}

/** One dated row of the withdrawn arc (R11), with the anchor text the template prints after it. */
/** One register event, folded into the registration block (§13(2)). */
export interface RegisterEvent {
  sentence: string
  fields: string[]
}

/**
 * The register's own name, without the release number and without its table names.
 *
 * `Open Targets 26.06 drug_warning` and `ChEMBL 37 molecule withdrawn_flag` name a register, a
 * release and a column. §13(2) forbids the column: `drug_warning` and `withdrawn_flag` are storage
 * vocabulary, and a reader meets the register that said it, not the table it was said in.
 */
function registerNameOnly(source: string): string {
  const kept: string[] = []
  for (const token of source.split(/\s+/)) {
    if (/^[0-9][0-9.]*$/.test(token)) continue
    if (!/^[A-Z]/.test(token)) break
    kept.push(token)
  }
  return kept.join(' ') || source
}

/**
 * The register events a page carries, each as one sentence in ordinary words (§13(2)).
 *
 * This replaces the "What the registers record" block, whose dated rows ("Open Targets 26.06
 * drug_warning warningType Withdrawn; France; 1996; drug misuse") printed enum strings and
 * duplicated the registration block beside them. The same recorded facts read as sentences here,
 * inside the registration block, and identical events recorded by several registers merge into one
 * line naming both.
 */
export function registerEventLines(fields: Record<string, FieldEntry>): RegisterEvent[] {
  const out: RegisterEvent[] = []

  const approval = fields.approvalDate ?? fields.firstApproval
  if (approval && approval.state === 'present') {
    const value = asObject(approval.value)
    const date = asString(value?.date ?? value?.year ?? approval.value)
    const register = asString(value?.register ?? value?.source)
    if (date && register) {
      out.push({
        sentence: `First approved by ${registerNameOnly(register)} in ${date}.`,
        fields: ['fields.approvalDate.value.date', 'fields.approvalDate.value.register'],
      })
    }
  }

  const withdrawal = fields.withdrawal ?? fields.withdrawalStatus ?? fields.withdrawn
  if (withdrawal && withdrawal.state === 'present') {
    const value = asObject(withdrawal.value)
    /*
     * One event per (where, when, why), with every register that recorded it named on the same
     * line. Two registers carrying the same withdrawal were two rows in the retired block and are
     * one sentence here.
     */
    const merged = new Map<
      string,
      { where?: string; when?: string; why?: string; sources: string[] }
    >()
    for (const item of asArray(value?.reasons)) {
      const row = asObject(item)
      if (!row) continue
      const where = asString(row.country ?? row.jurisdiction)
      const when = asString(row.year ?? row.date)
      // The register's own words for the reason, clamped as every other verbatim on the page is:
      // a recall notice runs to a paragraph, and a paragraph inside a one-line event is a wall.
      const whyRaw = asString(row.reason ?? row.reasonClass)
      const why = whyRaw ? clampSentence(whyRaw, 200) : undefined
      const source = asString(row.source ?? row.assertedBy)
      const id = `${where ?? ''}|${when ?? ''}|${why ?? ''}`
      const held = merged.get(id) ?? {
        ...(where ? { where } : {}),
        ...(when ? { when } : {}),
        ...(why ? { why } : {}),
        sources: [],
      }
      const named = source ? registerNameOnly(source) : undefined
      if (named && !held.sources.includes(named)) held.sources.push(named)
      merged.set(id, held)
    }
    for (const event of [...merged.values()].slice(0, 12)) {
      const head = ['Withdrawn', event.where ? `in ${event.where}` : undefined]
        .filter((bit): bit is string => Boolean(bit))
        .join(' ')
      /*
       * The register's stated reason is quoted, because it is the register speaking. Several
       * withdrawal notices are written as a judgement — "Not safe or effective for intended use" —
       * and unquoted that reads as this site calling something unsafe, which Operating Rule 9
       * forbids of generated text. Quoted, it is what the register wrote, exactly as a label's
       * interaction sentence and a registry trial title are quoted everywhere else on the page.
       */
      const sentence = [
        [head, event.when, event.why ? `for "${event.why}"` : undefined]
          .filter((bit): bit is string => Boolean(bit))
          .join(', '),
        event.sources.length > 0 ? ` (${event.sources.sort().join('; ')})` : '',
      ].join('')
      out.push({
        sentence: oneFullStop(sentence),
        fields: [
          'fields.withdrawal.value.reasons[].country',
          'fields.withdrawal.value.reasons[].year',
          'fields.withdrawal.value.reasons[].reason',
          'fields.withdrawal.value.reasons[].source',
        ],
      })
    }
    if (merged.size === 0 && value?.withdrawn === true) {
      // A register that raised the flag and published no reason says exactly that, and the page
      // says it too rather than leaving the withdrawal unexplained or inventing a cause.
      const sources = unique(
        asArray(value?.evidence)
          .map((item) => asString(asObject(item)?.source ?? asObject(item)?.register))
          .filter((name): name is string => Boolean(name))
          .map(registerNameOnly),
      ).sort()
      const where = unique(
        asArray(value?.jurisdictions)
          .map((item) => asString(item))
          .filter((item): item is string => Boolean(item)),
      )
      const when = asString(value?.date)
      const head = ['Withdrawn', where.length > 0 ? `in ${joinList(where)}` : undefined, when]
        .filter((bit): bit is string => Boolean(bit))
        .join(', ')
      out.push({
        sentence: oneFullStop(
          `${head}; no reason is published${sources.length > 0 ? ` (${sources.join('; ')})` : ''}`,
        ),
        fields: ['fields.withdrawal.value.withdrawn', 'fields.withdrawal.value.evidence[].source'],
      })
    }
  }

  return out
}

/* ------------------------------------------------------ page rendering */

/** One rendered sentence and the stored fields or computed values it traces to (Phase 4.7). */
export interface ProvenanceEntry {
  sentence: string
  fields: string[]
  /**
   * What the line is. `sentence` is prose this generator composed — a question, a paragraph, a
   * register line, an interaction line, a computed section. `row` is a revealed row: a label naming
   * a recorded bucket beside the value a source wrote, both of them the source's own vocabulary.
   *
   * The distinction is the one `pageProse` already draws — "only prose is subject to the rule; row
   * labels are counted and reported beside it, because a label is markup" — and
   * `tests/test_render_safety.py` reads it, so a rule about what this site says is not applied to
   * what a register called one of its own columns.
   *
   * `fact` is the third: a block's own value, painted under the question heading and above the
   * prose (§13(7)). It is a row by the rule above — the template test does not apply to it — and it
   * is on the page rather than inside the closed disclosure, which is the difference §14(6) turns
   * on: a record id may sit in a disclosure row and may not sit in a fact.
   */
  kind: 'sentence' | 'row' | 'fact'
  /**
   * True where the line is page furniture (§11): a fixed-vocabulary statement whose only content is
   * an absence — a register row reading "not found", "not cleared" or "not checked", the
   * checked-sources statement on a page with no interaction row, the patent no-record line, the
   * S10-only classification line. The ruler leaves it out and the slop draw's template test does
   * not apply to it; it is still on the page, and the reader still meets it.
   */
  furniture?: true
  /**
   * True where the line is a question block's own heading — the question, not its answer (§11).
   *
   * The question headings are the corpus-20k template contract, which fixes them at a masked
   * template share of 30 % and a most-repeated unmasked string of 0.5 %. §11 keeps the slop draw's
   * template test off them for that reason, and off nothing else in the block: the answer
   * sentences under the heading are in its scope.
   */
  heading?: true
  /**
   * The rendered block this line belongs to, as one identifier per block *instance* on the page:
   * `question:q3`, `registration`, `interactions`, `patent`, `computed`, `header`, `form-of`,
   * `withdrawn-arc`, `exact-record`, `relations`, `sources`.
   *
   * §12 evaluates the slop draw's template test over the masked block — every sentence of a
   * question, derived, computed or hub block, in order — because that is the unit a reader meets.
   * Grouping by a sentence's shape would decide the unit from the thing being measured; this names
   * it from the render itself, so the draw and the page agree on where one block ends.
   */
  group: string
}

export interface RenderedPage {
  key: string
  tier: 1 | 2 | 3
  presentFields: number
  /** Everything the server delivers as visible text, chrome excluded. The measured definition. */
  text: string
  wordCount: number
  /**
   * The same page with the parts the dossier template itself calls markup removed — the synonyms
   * line, the badge triplet, the identifiers panel, the relations rows and the source list. The
   * template says of the contents rail that "it never contributes words to the page's prose
   * measurement"; these rows are the same kind of element. Reported as a labelled sensitivity, never
   * as the headline figure: a crawler does read them.
   */
  proseText: string
  proseWordCount: number
  /** Sentence → field, one entry per rendered sentence. Built only when asked for. */
  provenance?: ProvenanceEntry[]
  /**
   * Lines a controlled substance's page did not render because a register's own words carried a
   * dose, a timing, a route or a combination protocol (§4). Absent where none was dropped.
   */
  withheldDoseLines?: number
  /** How many furniture lines this page carries, whether or not the text above includes them. */
  furnitureLines: number
  /** True where `text` and `proseText` above include the furniture (§11). */
  withFurniture: boolean
}

/**
 * A `PageFacts` that remembers which fields and seeds a block builder actually read.
 *
 * The provenance map has to name the stored field behind every sentence, and the block builders
 * reach their values through `present()`, `field()` and `seed()`. Recording those calls is the only
 * way to name the field a given block used without writing the mapping down twice and letting the
 * two drift.
 */
function recordingFacts(base: PageFacts): { facts: PageFacts; touched: () => string[] } {
  const read = new Set<string>()
  const wrapped: PageFacts = {
    ...base,
    field: (id: string) => {
      read.add(`fields.${id}`)
      return base.field(id)
    },
    present: (id: string) => {
      read.add(`fields.${id}`)
      return base.present(id)
    },
    seed: (id: string) => {
      read.add(`seeds.${id}`)
      return base.seed(id)
    },
  }
  return { facts: wrapped, touched: () => [...read].sort() }
}

/** The seeds a controlled substance never carries, removed before any builder can read one. */
function withoutControlledSeeds(seeds: PageBundle['seeds']): PageBundle['seeds'] {
  const out: PageBundle['seeds'] = {}
  for (const [id, value] of Object.entries(seeds)) {
    const number = Number(/^seed0*(\d+)$/.exec(id)?.[1] ?? NaN)
    if (CONTROLLED_WITHHELD_SEEDS.includes(number)) continue
    out[id] = value
  }
  return out
}

export function renderPage(
  page: PageBundle,
  options: { provenance?: boolean; withFurniture?: boolean } = {},
): RenderedPage {
  const blocks = page.blocks
  const controlled = blocks?.controlled === true

  /*
   * The controlled-substance filter, applied before anything is rendered (§4).
   *
   * A page carrying a Singapore Misuse of Drugs Act or Poisons Act schedule, a United States DEA
   * schedule or an Australian Poisons Standard Schedule 8 or 9 entry has no code path to a dose,
   * timing, route, frequency or combination protocol. The four blocks that could carry one are
   * removed from the question list, and seeds 1, 2 and 6 are removed from the bundle, so no builder
   * below is ever handed the values to write one. The question derivation withholds the same set
   * upstream and migration 0026 refuses to store one; this filter is what makes the rule hold for a
   * page rendered from any input, including a stale one.
   */
  /*
   * The name every builder writes into a sentence. Where Phase 3 disambiguated two pages that
   * print the same name, the page prints the disambiguated one (`lib/corpus/dossier-page.ts`
   * takes it from `page_display_names`), so every sentence on it names the record it is about:
   * "Vasopressin Tannate (small molecule)", not "Vasopressin Tannate". §11 makes the measured text
   * carry the same name.
   */
  const printedName =
    blocks?.disambiguation?.displayName ??
    printedDisplayName(page.displayName, page.identity.synonyms)
  const bundle: PageBundle = controlled
    ? {
        ...page,
        displayName: printedName,
        questions: page.questions.filter((q) => !CONTROLLED_WITHHELD_BLOCKS.has(q.block)),
        seeds: withoutControlledSeeds(page.seeds),
      }
    : page.displayName === printedName
      ? page
      : { ...page, displayName: printedName }

  const f = facts(bundle)
  const lines: string[] = []
  /** Parallel to `lines`: true where the template declares the line markup rather than prose. */
  const isMarkup: boolean[] = []
  /** Parallel to `lines`: true where the line is §11 furniture — an absence, in fixed words. */
  const isFurniture: boolean[] = []
  const provenance: ProvenanceEntry[] = []
  let dropped = 0
  let furnitureLines = 0
  /**
   * The block every following `push` belongs to. Set once at each region boundary below, so a
   * provenance entry names its block without every call site carrying the name (§12).
   */
  let group = 'header'
  const push = (
    line: string,
    markup = false,
    fields: string[] = [],
    kind: ProvenanceEntry['kind'] = 'sentence',
    furniture = false,
    heading = false,
  ): void => {
    if (controlled && carriesDoseText(line)) {
      // §4: this page has no code path to a dose, a timing, a route or a combination protocol,
      // including one a register wrote. The line is not rendered.
      dropped += 1
      return
    }
    lines.push(line)
    isMarkup.push(markup)
    isFurniture.push(furniture)
    if (furniture) furnitureLines += 1
    if (options.provenance === true && !markup && line.trim().length > 0) {
      provenance.push({
        sentence: line.replace(/\s+/g, ' ').trim(),
        fields,
        kind,
        group,
        ...(furniture ? { furniture: true as const } : {}),
        ...(heading ? { heading: true as const } : {}),
      })
    }
  }

  /* header — display name, synonyms, register/date, badge triplet */
  const displayName = printedName
  push(displayName, false, [
    blocks?.disambiguation
      ? `data/revamp/identity/display-names-v5.csv disambiguated_display_name (${
          blocks.disambiguation.basis ?? 'recorded basis'
        })`
      : // 14 of the 28,832 pages are not in the identity revision, and their name is the one the
        // tier assignment recorded. The trace says which of the two this page's name came from,
        // because naming a record the page has no row in is the defect §11 forbids.
        bundle.identity.displayName !== undefined
        ? 'identity.displayName'
        : 'data/corpus-20k/tiers/model-assignment.ndjson displayName',
  ])
  const synonyms = bundle.identity.synonyms
    .filter((s) => s.name && s.name.toLowerCase() !== bundle.displayName.toLowerCase())
    .map((s) => (s.kind ? `${s.name} (${s.kind})` : s.name))
  if (synonyms.length > 0) push(`Also recorded as ${synonyms.join(', ')}`, true)
  const { register, date } = headerRegister(bundle, f)
  push(`${register} · last verified ${date}`, true)
  const humanData = f.rungs.some((r) => r.organism === 'human') || f.largestN !== undefined
  push(
    `Tier ${bundle.tier} · ${f.topRung ? f.topRung.organism : 'no organism recorded'} · human data ${humanData ? 'yes' : 'no'}`,
    true,
  )

  /*
   * The form-of note (§6). A salt, ester, biosimilar or product-component page opens with what it
   * is a form of, because that is the first question a reader has and the difference the rendered
   * duplicate check found the pages failing to state. §1 lists the note among the Tier 3 computed
   * sections; §6 says the page opens with it, and the reader is served by meeting it here.
   */
  group = 'form-of'
  for (const note of formOfNoteLines(blocks)) {
    // The template prints the counterpart's name as a link after the sentence, where the corpus
    // holds a page for it, and the name it prints is that page's own printed name — not the name
    // this sentence was written with. The measured text carries the same words.
    const counterpartName = bundle.names.get(note.counterpartKey ?? '')
    /*
     * §13(9): the related record's name is printed once, as the link text. The note's own sentence
     * already names it in most shapes, and appending the link text after it printed the name
     * twice in a row — "…on the Heparin sodium page. Heparin sodium".
     */
    push(
      counterpartName && !note.sentence.includes(counterpartName)
        ? `${note.sentence} ${counterpartName}`
        : note.sentence,
      false,
      note.fields,
    )
  }

  /* the supervision block leads, before the registers (§1) */
  const supervision = bundle.questions.filter((q) => q.block === 'supervision')
  const answers = bundle.questions.filter((q) => q.block !== 'supervision')

  let questionOrdinal = 0
  const renderQuestion = (q: QuestionBlock): void => {
    const recorder = recordingFacts(f)
    const body = buildBlockBody(q, bundle, recorder.facts)
    // A block whose builder wrote nothing renders nothing: §7 stops a dose-response section whose
    // quotations name a different compound, and a heading over an empty body is forbidden by §1.
    if (body.paragraphs.length === 0 && body.facts.length === 0 && body.rows.length === 0) return
    questionOrdinal += 1
    // The block instance, numbered in render order (`q1`, `q2`, …), so the draw groups the
    // sentences a reader meets under one question and no others (§12).
    group = `question:q${questionOrdinal}`
    const fields = [`page_questions.${q.template}`, ...recorder.touched()]
    // The question itself, marked a heading: it is the block's title, and §11 keeps the slop
    // draw's template test off it while leaving every other check on it.
    push(q.text, false, fields, 'sentence', false, true)
    // §13(7): the block's own values, as rows, painted under the heading and above the prose.
    // They are marked `fact` and not `row`: both are markup, and only one of them is painted
    // without a reader opening anything (§14(6)).
    for (const row of body.facts) {
      push([row.label, row.identifier, row.value].filter(Boolean).join(' '), false, fields, 'fact')
    }
    body.paragraphs.forEach((p, index) =>
      push(p, false, fields, 'sentence', body.furniture[index] === true),
    )
    if (body.rows.length > 0) {
      // The `<summary>` reads "Show the evidence" on every block of every page. It is a control
      // label, so it is a repeated element and excluded with the rest of the chrome; the rows it
      // opens are the page's own words and are counted.
      //
      // Consecutive rows sharing a label are one group and the label is written once, above the
      // run, exactly as the template prints it. A label written on every row of a twenty-row run
      // is the repetition the disclosure spec removed from the page, and the measured text must
      // not carry what the page does not print.
      for (const group of groupRevealedRows(body.rows)) {
        if (group.label !== undefined) push(group.label, true)
        for (const row of group.rows) {
          const label = group.label === undefined ? row.label : undefined
          push([label, row.identifier, row.value].filter(Boolean).join(' '), false, fields, 'row')
        }
      }
    }
  }

  for (const q of supervision) renderQuestion(q)

  /*
   * §13(2) retired the "What the registers record" block. Its dated rows printed the registers'
   * own column names beside a status the registration block already carried. The events fold into
   * that block below, one sentence per event, in words.
   */

  /* ---- Where it's registered (§2, §3): every page, including a Tier 3 stub ------------------ */
  group = 'registration'
  const registration = [...(blocks?.registration ?? [])].sort(
    (a, b) =>
      a.ordinal - b.ordinal ||
      (a.component ?? '').localeCompare(b.component ?? '') ||
      a.label.localeCompare(b.label),
  )
  if (registration.length > 0) {
    push("Where it's registered", true)
    // §13(6): a row the block stage marked disclosed is never a visible line; it is painted in the
    // block's own closed disclosure, below the absence table, exactly as the template paints it.
    const visible = registration.filter((row) => row.disclosed !== true)
    const disclosedRows = registration.filter((row) => row.disclosed === true)
    const stated = visible.filter((row) => !row.absence)
    const absent = visible.filter((row) => Boolean(row.absence))
    const mapped = stated.filter((row) => row.jurisdiction !== 'OTHER')
    const other = stated.filter((row) => row.jurisdiction === 'OTHER')
    /**
     * The rows the register's own disclosure carries: the application ids (§3) and, on a curated
     * NCATS row, the upstream files it was stitched from (§13(6)). Both are delivered in the server
     * HTML, so a crawler and this measurement read them; `RegisterSummary` prints the same rows in
     * the same order.
     */
    const disclosureRows = (row: RegistrationLine): void => {
      for (const application of registerApplicationIds(row)) {
        push(application, false, row.provenance ?? [], 'row')
      }
      const upstream = asArray(pick(row.disclosure, 'upstreamRegisters'))
        .map((item) => asString(item))
        .filter((item): item is string => Boolean(item))
      if (upstream.length > 0) {
        push(`Upstream registers ${upstream.join(', ')}`, false, row.provenance ?? [], 'row')
      }
    }
    const line = (row: RegistrationLine): void => {
      push(registrationLineText(row), false, row.provenance ?? [])
      disclosureRows(row)
    }
    for (const row of mapped) line(row)
    if (other.length > 0) {
      push('Other registers', true)
      for (const row of other) line(row)
    }
    /*
     * The register events (§13(2)): an approval or a withdrawal the registers dated, one sentence
     * each, with every register that recorded the same event named on the same line.
     */
    for (const event of registerEventLines(bundle.fields)) push(event.sentence, false, event.fields)
    /*
     * The painted order (§11). `components/dossier/corpus/RegistrationBlock.tsx` reads these rows
     * out of `page_controlled`, which has no order of its own, and sorts them; the render sorts
     * them the same way, or a page carrying two schedules paints them in one order and the render
     * writes them in another.
     *
     * The sort has to be total, which sorting on jurisdiction, list and schedule alone was not:
     * levonorgestrel carries two Poisons List rows under one schedule, differing only in the name
     * the register listed ("Levonorgestrel", "Norgestrel"), and a stable sort then keeps whatever
     * order its input had — the parquet's here, the database's there.
     */
    const schedules = [...(blocks?.controlledSchedules ?? [])].sort(
      (a, b) =>
        a.jurisdiction.localeCompare(b.jurisdiction) ||
        a.list.localeCompare(b.list) ||
        a.classOrSchedule.localeCompare(b.classOrSchedule) ||
        (a.substanceAsListed ?? '').localeCompare(b.substanceAsListed ?? '') ||
        (a.versionDate ?? '').localeCompare(b.versionDate ?? ''),
    )
    if (schedules.length > 0) {
      push('Controlled-substance schedules', true)
      for (const row of schedules) {
        push(controlledLine(row), false, [row.provenance ?? 'fields.controlled'])
      }
    }
    /*
     * The absences, as furniture (§11).
     *
     * Seven register rows whose status is "not found", "not cleared" or "not checked" sat on
     * 25,000 pages as sentences, and by measurement they were a quarter of the corpus's words. They
     * are the same statement every time, and Operating Rule 9 still requires the page to make it,
     * so the page makes it once, as a table: the shared words in the caption and the column
     * headings, each absent register as one cell. The template renders the same table with
     * `data-furniture="true"` on each row; the ruler and the duplicate check skip it.
     */
    if (absent.length > 0) {
      push(absenceCaption(absentAsOf(absent)), true, [], 'sentence', true)
      push(ABSENCE_COLUMNS.join(' '), true, [], 'sentence', true)
      for (const row of absent) {
        push(absenceRowText(row), false, row.provenance ?? [], 'row', true)
      }
    }
    /*
     * §13(6): the curated records NCATS files under "unspecified", and the upstream files it
     * stitched to build them. Neither names a jurisdiction or a register. They are delivered in the
     * server HTML inside a closed disclosure, so a crawler and this measurement read them, and the
     * template paints them in the same place and the same order.
     */
    for (const row of disclosedRows) {
      push(`${row.label} ${row.line}`, false, row.provenance ?? [], 'row')
      const upstream = asArray(pick(row.disclosure, 'upstreamRegisters'))
        .map((item) => asString(item))
        .filter((item): item is string => Boolean(item))
      if (upstream.length > 0) {
        push(`Upstream registers ${upstream.join(', ')}`, false, row.provenance ?? [], 'row')
      }
    }
  }

  /* ---- Interactions (§4) -------------------------------------------------------------------- */
  group = 'interactions'
  const tiers = blocks?.interactions.tiers ?? {}
  const interactionLines: Array<{ sentence: string; fields: string[] }> = []
  // §13(3): the visible block never repeats a line. Two stored rows that render the same words are
  // the same statement, and the page states it once.
  const interactionSeen = new Set<string>()
  const pushInteraction = (sentence: string, fields: string[]): void => {
    if (sentence.trim().length === 0 || interactionSeen.has(sentence)) return
    interactionSeen.add(sentence)
    interactionLines.push({ sentence, fields })
  }
  for (const tier of ['A', 'B', 'C'] as const) {
    const held = tiers[tier]
    if (!held) continue
    for (const row of held.inline) {
      pushInteraction(
        interactionLine(tier, row, { controlled, quote: true }),
        interactionProvenance(row),
      )
    }
    for (const row of held.disclosed) {
      pushInteraction(
        interactionLine(tier, row, { controlled, quote: false }),
        interactionProvenance(row),
      )
    }
    const shown = held.inline.length + held.disclosed.length
    if (held.total > shown) {
      interactionLines.push({
        sentence:
          `${held.total} counterparts are recorded under ${INTERACTION_TIER_LABELS[tier]} for ` +
          `this record; ${shown} are shown.`,
        fields: [
          'data/revamp/interactions/interactions.parquet distinct counterparts for this page and tier',
        ],
      })
    }
  }
  const statement = checkedSourcesStatement(
    blocks?.interactions.checked,
    interactionLines.length > 0,
  )
  const predictedOnly =
    interactionLines.length > 0 && tiers.A === undefined && tiers.B === undefined
  if (interactionLines.length > 0 || statement !== undefined) {
    push('Interactions', true)
    const statementFields = ['data/revamp/interactions/checked-sources.parquet sources_checked']
    // §11: on a page with no interaction row the statement is an absence in fixed words, and it is
    // furniture. On a page that found something it names what was checked beside what was found,
    // and it is content.
    const statementIsFurniture = interactionLines.length === 0
    // §4: a predicted-only page carries the statement first, so the reader meets what was checked
    // before meeting a prediction.
    if (statement !== undefined && predictedOnly)
      push(statement, false, statementFields, 'sentence', statementIsFurniture)
    for (const entry of interactionLines) push(entry.sentence, false, entry.fields)
    if (statement !== undefined && !predictedOnly)
      push(statement, false, statementFields, 'sentence', statementIsFurniture)
    /*
     * "Show what was checked": the registers consulted, then the record id behind each stored line.
     * The template delivers this disclosure in the server HTML, so the rows are on the page; they
     * are technical vocabulary in a labelled disclosure, which is where §7 puts an identifier.
     */
    const checkedNames = checkedSourceNames(blocks?.interactions.checked)
    if (checkedNames.length > 0) {
      // The registers consulted, listed under the statement. Where the page holds no interaction
      // row they are the same three names, in the same order, on 25,217 pages, and they say only
      // where nothing was found: the statement's own furniture, marked with it (§11). Where a row
      // was found they sit beside findings and are content, exactly as the statement is.
      for (const name of checkedNames)
        push(name, false, statementFields, 'row', statementIsFurniture)
      for (const tier of ['A', 'B', 'C'] as const) {
        const held = tiers[tier]
        if (!held) continue
        for (const row of [...held.inline, ...held.disclosed]) {
          // §13(3), §14(6): a grouped line stands for several dataset records, and every one of
          // them is named here, in the closed disclosure, and nowhere above it. The label and the
          // ids are built by the two functions the template also calls, so the render and the
          // painted page carry one row (§11).
          const source: InteractionDisclosureSource = {
            tierLabel: INTERACTION_TIER_LABELS[tier] as string,
            line: interactionLine(tier, row, { controlled, quote: false }),
            ...(row.counterpartName ? { counterpartName: row.counterpartName } : {}),
            ...(row.ruleId ? { ruleId: row.ruleId } : {}),
            ...(row.setId ? { setId: row.setId } : {}),
            ...(row.sourceRecordId ? { sourceRecordId: row.sourceRecordId } : {}),
            ...(row.groupedDirection ? { groupedDirection: row.groupedDirection } : {}),
            /*
             * The grouped record ids are read out of the build's `provenance.record` and not out
             * of `groupedRecordIds`, even though this side holds both: the page has only the
             * first, because that is what the loader stores, and §11 makes the two texts one. Both
             * sides therefore run the same branch of `interactionRecordIds` over the same value.
             */
            ...(row.provenance ? { provenance: row.provenance } : {}),
          }
          const ids = interactionRecordIds(source).join(' · ')
          if (!ids) continue
          push(
            `${interactionDisclosureLabel(source)} ${ids}`,
            false,
            interactionProvenance(row),
            'row',
          )
          if (row.counterpartKey && row.counterpartName && bundle.names.has(row.counterpartKey)) {
            push(row.counterpartName, false, interactionProvenance(row), 'row')
          }
        }
      }
    }
  }

  /* ---- Generic and patent (§5) -------------------------------------------------------------- */
  group = 'patent'
  const patent = blocks?.patent
  if (patent) {
    push('Generic and patent', true)
    // §11: a line that says only that no US register holds this record is an absence in fixed
    // words on 25,226 pages, and it is furniture. A line carrying a date, a BLA or a TE code is a
    // finding, and stays in the measured text.
    push(patent.line, false, patent.provenance ?? [], 'sentence', patent.absence === true)
    for (const application of registerApplicationIds(patent)) {
      push(application, false, patent.provenance ?? [], 'row')
    }
  }

  /* question blocks, or the stub sentence */
  group = 'stub-record'
  if (answers.length === 0 && supervision.length === 0) {
    /*
     * §14(13): "This record holds N fields" is furniture.
     *
     * It is a statement about how much of the record is filled in, in fixed words, on every stub
     * in the corpus — the same footing §11 gives the register absence table and the patent
     * no-record line. The reader still meets it; the ruler, the rendered duplicate check and the
     * slop draw's template test all skip it.
     */
    push(
      `This record holds ${bundle.presentFields} ${bundle.presentFields === 1 ? 'field' : 'fields'}.`,
      false,
      ['corpus_pages.present_field_count'],
      'sentence',
      true,
    )
    // Question-derivation amendment: a stub carries a supervision line only where a class S1–S9 was
    // matched; where the only class is S10 (unknown) it says so, and never a supervision claim
    // without a classification to cite. S11 is the cleared class and states nothing.
    const cited = bundle.suppressionClasses.filter((c) => /^S[1-9]$/.test(c))
    if (cited.length > 0) {
      push(
        `A register records this compound under medical supervision: ${citedSuppressionLabels(cited).join('; ')}.`,
        false,
        ['corpus_pages.suppression_classes'],
      )
    } else if (isUnknownClassOnly(bundle.suppressionClasses) && bundle.suppressed) {
      // §11: the S10-only line is an absence in fixed words, so it is furniture; and it is the
      // template's own sentence, not a second wording of it.
      push(
        unknownClassificationLine(),
        false,
        ['corpus_pages.suppression_classes'],
        'sentence',
        true,
      )
    }
  } else {
    for (const q of answers) renderQuestion(q)
  }

  /* ---- Tier 3 computed sections (§8) --------------------------------------------------------- */
  group = 'computed'
  /*
   * §11: the render's order is the painted order, section by section.
   *
   * `components/dossier/corpus/Tier3Sections.tsx` renders one `<div>` per computed section — its
   * rows, then its sentence — so a page holding a neighbour comparison and a potency rank paints
   * the neighbour's rows, the neighbour's sentence, the potency rows, the potency sentence. The
   * render used to write every row of every section and then every sentence, and the parity check
   * read the potency sentence as out of order on any page carrying both.
   */
  const computedSections: Array<{
    rows: Array<{ row: RevealedRow; fields: string[] }>
    sentence?: { sentence: string; fields: string[] }
  }> = []
  for (const section of ['neighbour', 'potency', 'timeline'] as const) {
    for (const entry of blocks?.sections[section] ?? []) {
      const parts = sectionSentenceParts(entry)
      const fields = sectionSentenceFields(entry)
      const held: (typeof computedSections)[number] = {
        rows: parts.rows.map((row) => ({ row, fields })),
      }
      if (parts.sentence) {
        const counterpartName = bundle.names.get(
          sectionSentenceCounterpart(entry).counterpartKey ?? '',
        )
        // §13(9): the counterpart's name is the link text and is printed once. A sentence that
        // already names it does not have it appended a second time.
        held.sentence = {
          sentence:
            counterpartName && !parts.sentence.includes(counterpartName)
              ? `${parts.sentence} ${counterpartName}`
              : parts.sentence,
          fields,
        }
      }
      computedSections.push(held)
    }
  }
  if (computedSections.some((section) => section.rows.length > 0 || section.sentence)) {
    push('What the structure and the activity record show', true)
    for (const section of computedSections) {
      // §13(7): the values first, as rows; then whatever the comparison found that is not a value.
      for (const entry of section.rows) {
        push(`${entry.row.label} ${entry.row.value}`, false, entry.fields, 'row')
      }
      if (section.sentence) {
        push(section.sentence.sentence, false, section.sentence.fields)
      }
    }
  }

  /* the exact record: identifiers panel, then the relations rows (R10) */
  group = 'exact-record'
  const identifierRows: string[] = []
  for (const [key, label] of IDENTIFIER_LABELS) {
    const value = asString(bundle.identity[key] as unknown)
    if (value) identifierRows.push(`${label} ${value}`)
  }
  if (identifierRows.length > 0) {
    push('The exact record', true)
    for (const row of identifierRows) push(row, true)
  }
  group = 'relations'
  const relationRows = bundle.identity.relations
    .map((r) => {
      const label = RELATION_LABELS[r.type] ?? r.type.replace(/-/g, ' ')
      const target = bundle.names.get(r.targetKey)
      return target ? `${label} ${target}` : undefined
    })
    .filter((r): r is string => Boolean(r))
  if (relationRows.length > 0) {
    push('Relations', true)
    for (const row of unique(relationRows).slice(0, ROW_CAP)) push(row, true)
  }

  /* the source list: every anchor's source, once */
  group = 'sources'
  const sources = new Map<string, string>()
  for (const q of bundle.questions) {
    for (const s of q.sources) {
      const line = anchor(s)
      if (line) sources.set(line, line)
    }
  }
  for (const entry of f.fields.values()) {
    const line = anchor(entrySource(entry))
    if (line) sources.set(line, line)
  }
  if (sources.size > 0) {
    push('Sources', true)
    for (const row of [...sources.values()].sort()) push(row, true)
  }

  const clean = lines.map((l) => l.replace(/\s+/g, ' ').trim())
  // §11: the ruler and the duplicate check read the page without its furniture, because before
  // Phase 4 an absence rendered nothing and was not in the measured text either. The same call
  // with `withFurniture` returns the page as the browser paints it, which is what the DOM parity
  // check and the rendering-safety rules read.
  const withFurniture = options.withFurniture === true
  const keep = (index: number): boolean => withFurniture || !isFurniture[index]
  const text = clean.filter((l, i) => l.length > 0 && keep(i)).join('\n')
  const proseText = clean.filter((l, i) => l.length > 0 && !isMarkup[i] && keep(i)).join('\n')
  return {
    key: bundle.key,
    tier: bundle.tier,
    presentFields: bundle.presentFields,
    ...(dropped > 0 ? { withheldDoseLines: dropped } : {}),
    text,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    proseText,
    proseWordCount: proseText.split(/\s+/).filter(Boolean).length,
    furnitureLines,
    withFurniture,
    ...(options.provenance === true ? { provenance } : {}),
  }
}

/* -------------------------------------------------------------------- CLI */

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const KEY_RE = /"key"\s*:\s*"((?:[^"\\]|\\.)*)"/

function lineKey(line: string): string | undefined {
  const m = KEY_RE.exec(line)
  if (!m || m[1] === undefined) return undefined
  try {
    return JSON.parse(`"${m[1]}"`) as string
  } catch {
    return m[1]
  }
}

async function listNdjson(dir: string): Promise<string[]> {
  const out: string[] = []
  let entries: import('node:fs').Dirent[]
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await listNdjson(full)))
    else if (e.isFile() && e.name.endsWith('.ndjson')) out.push(full)
  }
  return out
}

async function eachLine(
  file: string,
  fn: (line: string, key: string | undefined) => void,
): Promise<void> {
  const text = await fs.readFile(file, 'utf8')
  let start = 0
  while (start < text.length) {
    let end = text.indexOf('\n', start)
    if (end === -1) end = text.length
    const line = text.slice(start, end)
    start = end + 1
    if (line.length < 2) continue
    fn(line, lineKey(line))
  }
}

function countPresent(fields: Record<string, FieldEntry>): number {
  let n = 0
  for (const entry of Object.values(fields)) if (entry && entry.state === 'present') n += 1
  return n
}

async function main(): Promise<void> {
  const fieldsDir = arg('fields') ?? 'data/corpus-20k/fields'
  const seedsDir = arg('seeds') ?? 'data/corpus-20k/derived'
  const questionsDir = arg('questions') ?? 'data/corpus-20k/questions'
  const identityFile = arg('identity') ?? 'data/corpus-20k/identity/canonical.ndjson'
  const tiersFile = arg('tiers') ?? 'data/corpus-20k/tiers/model-assignment.ndjson'
  const suppressionFile = arg('suppression') ?? 'data/corpus-20k/suppression/assignments.ndjson'
  const registryDir = arg('registry') ?? 'data/corpus-20k/registry/aggregates'
  const outDir = arg('out') ?? 'data/corpus-20k/render/text'
  const shards = Number(arg('shards') ?? 8)
  const batchSize = Number(arg('batch-size') ?? 1000)

  /* small, resident inputs: tier, display name, suppression class, and the name map for relations */
  const tier = new Map<string, 1 | 2 | 3>()
  const model = new Map<string, string>()
  const withdrawn = new Set<string>()
  const names = new Map<string, string>()
  await eachLine(tiersFile, (line, key) => {
    if (!key) return
    const row = JSON.parse(line) as Record<string, unknown>
    const m = asString(row.model) ?? 'DEVELOPMENT'
    const w = row.withdrawn === true
    model.set(key, m)
    if (w) withdrawn.add(key)
    tier.set(key, m === 'LONGEVITY' || w ? 1 : m === 'CLINICAL' ? 2 : 3)
    const display = asString(row.displayName)
    if (display) names.set(key, display)
  })
  const suppressed = new Set<string>()
  const classes = new Map<string, string[]>()
  await eachLine(suppressionFile, (line, key) => {
    if (!key) return
    const row = JSON.parse(line) as Record<string, unknown>
    if (row.suppressed === true) suppressed.add(key)
    const cls = asArray(row.classes)
      .map(asString)
      .filter((c): c is string => Boolean(c))
    if (cls.length > 0) classes.set(key, cls)
  })

  const limit = arg('limit') ? Number(arg('limit')) : undefined
  // `--limit` renders the first N keys in sorted order; it exists for a smoke run, never for a
  // recorded batch (a partial run is not checkpointed).
  const allKeys = [...tier.keys()].sort().slice(0, limit ?? Number.MAX_SAFE_INTEGER)
  const seedFiles = (await fs.readdir(seedsDir, { withFileTypes: true }).catch(() => []))
    .filter((e) => e.isFile() && e.name.endsWith('.ndjson'))
    .map((e) => path.join(seedsDir, e.name))
    .sort()
  const fieldFiles = await listNdjson(fieldsDir)
  const registryFiles = await listNdjson(registryDir)
  const questionFiles = (await fs.readdir(questionsDir))
    .filter((n) => /^batch-\d+\.ndjson$/.test(n))
    .sort()
    .map((n) => path.join(questionsDir, n))
  await fs.mkdir(outDir, { recursive: true })
  for (const f of await fs.readdir(outDir).catch(() => [])) {
    if (/^batch-\d+\.ndjson$/.test(f)) await fs.rm(path.join(outDir, f))
  }

  const shardSize = Math.ceil(allKeys.length / shards)
  const buffer: RenderedPage[] = []
  let batchNo = 0
  const written: Array<{ file: string; records: number }> = []
  /* standing-sentence audit accumulators (see `pageProse`) */
  let indexedPages = 0
  const sentenceCounts = new Map<string, number>()
  const rowLabelCounts = new Map<string, number>()
  /* repeated-frame audit: word five-grams of the page's prose, counted once per page */
  const fiveGramCounts = new Map<string, number>()
  /** The same grams, counted only on the pages where every one of their five words was fixed. */
  const fixedGramCounts = new Map<string, number>()

  const stats = {
    pages: 0,
    withQuestions: 0,
    stub: 0,
    words: 0,
    byTier: { 1: 0, 2: 0, 3: 0 } as Record<number, number>,
  }

  const flush = async (force: boolean): Promise<void> => {
    while (buffer.length >= batchSize || (force && buffer.length > 0)) {
      const slice = buffer.splice(0, batchSize)
      batchNo += 1
      const file = path.join(outDir, `batch-${String(batchNo).padStart(4, '0')}.ndjson`)
      await fs.writeFile(file, slice.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8')
      written.push({ file, records: slice.length })
      if (!force) continue
    }
  }

  for (let shard = 0; shard < shards; shard += 1) {
    const shardKeys = new Set(allKeys.slice(shard * shardSize, (shard + 1) * shardSize))
    if (shardKeys.size === 0) continue
    const bundles = new Map<string, PageBundle>()
    for (const key of shardKeys) {
      bundles.set(key, {
        key,
        displayName: names.get(key) ?? key,
        model: model.get(key) ?? 'DEVELOPMENT',
        tier: tier.get(key) ?? 3,
        withdrawn: withdrawn.has(key),
        suppressed: suppressed.has(key),
        suppressionClasses: classes.get(key) ?? [],
        stub: false,
        presentFields: 0,
        fields: {},
        seeds: {},
        identity: { synonyms: [], relations: [] },
        questions: [],
        names,
      })
    }
    for (const file of fieldFiles) {
      await eachLine(file, (line, key) => {
        if (!key || !shardKeys.has(key)) return
        const row = JSON.parse(line) as Record<string, unknown>
        const bundle = bundles.get(key) as PageBundle
        const fields = asObject(row.fields) ?? {}
        for (const [k, v] of Object.entries(fields)) {
          const entry = asObject(v)
          if (entry && typeof entry.state === 'string')
            bundle.fields[k] = entry as unknown as FieldEntry
        }
        for (const [k, v] of Object.entries(row)) {
          if (k === 'fields') continue
          const entry = asObject(v)
          if (entry && typeof entry.state === 'string' && bundle.fields[k] === undefined)
            bundle.fields[k] = entry as unknown as FieldEntry
        }
        const display = asString(row.displayName)
        if (display && bundle.displayName === key) bundle.displayName = display
      })
    }
    for (const file of registryFiles) {
      await eachLine(file, (line, key) => {
        if (!key || !shardKeys.has(key)) return
        ;(bundles.get(key) as PageBundle).registry = JSON.parse(line) as Record<string, unknown>
      })
    }
    for (const file of seedFiles) {
      const seedId = canonicalSeedId(path.basename(file, '.ndjson'))
      await eachLine(file, (line, key) => {
        if (!key || !shardKeys.has(key)) return
        const row = JSON.parse(line) as Record<string, unknown>
        const bundle = bundles.get(key) as PageBundle
        bundle.seeds[seedId] = {
          fires: typeof row.fires === 'boolean' ? row.fires : true,
          ...(asObject(row.slots) ? { slots: asObject(row.slots) as Record<string, unknown> } : {}),
          ...(asObject(row.values)
            ? { values: asObject(row.values) as Record<string, unknown> }
            : {}),
        }
      })
    }
    await eachLine(identityFile, (line, key) => {
      if (!key || !shardKeys.has(key)) return
      const row = JSON.parse(line) as Record<string, unknown>
      const bundle = bundles.get(key) as PageBundle
      bundle.identity = {
        synonyms: asArray(row.synonyms)
          .map((s) => {
            const o = asObject(s)
            const n = asString(pick(o, 'name'))
            return n
              ? {
                  name: n,
                  ...(asString(pick(o, 'kind'))
                    ? { kind: asString(pick(o, 'kind')) as string }
                    : {}),
                }
              : undefined
          })
          .filter((s): s is Synonym => s !== undefined),
        relations: asArray(row.relations)
          .map((r) => {
            const o = asObject(r)
            const t = asString(pick(o, 'type'))
            const k = asString(pick(o, 'targetKey'))
            return t && k ? { type: t, targetKey: k } : undefined
          })
          .filter((r): r is Relation => r !== undefined),
        unii: asString(row.unii) ?? null,
        chemblId: asString(row.chemblId) ?? null,
        cid: asString(row.cid) ?? null,
        cas: asString(row.cas) ?? null,
        rxcui: asString(row.rxcui) ?? null,
        drugbankId: asString(row.drugbankId) ?? null,
      }
      const display = asString(row.displayName)
      if (display && bundle.displayName === key) bundle.displayName = display
    })
    for (const file of questionFiles) {
      await eachLine(file, (line, key) => {
        if (!key || !shardKeys.has(key)) return
        const row = JSON.parse(line) as Record<string, unknown>
        const bundle = bundles.get(key) as PageBundle
        bundle.questions = asArray(row.questions) as QuestionBlock[]
        if (row.stub === true) bundle.stub = true
      })
    }

    for (const key of allKeys.slice(shard * shardSize, (shard + 1) * shardSize)) {
      const bundle = bundles.get(key) as PageBundle
      bundle.presentFields = countPresent(bundle.fields)
      const rendered = renderPage(bundle)
      stats.pages += 1
      stats.words += rendered.wordCount
      stats.byTier[bundle.tier] = (stats.byTier[bundle.tier] ?? 0) + 1
      if (bundle.questions.length > 0) stats.withQuestions += 1
      else stats.stub += 1
      // The standing-sentence audit runs over the indexed candidate set only (Tier 1 or 2 with at
      // least one question), because that is the set Gate 1b measures and the set a crawler sees.
      if (bundle.tier !== 3 && bundle.questions.length > 0) {
        indexedPages += 1
        const prose = pageProse(bundle)
        for (const s of prose.sentences) sentenceCounts.set(s, (sentenceCounts.get(s) ?? 0) + 1)
        for (const l of prose.rowLabels) rowLabelCounts.set(l, (rowLabelCounts.get(l) ?? 0) + 1)
        const valueWords = new Set(prose.valueWords)
        for (const g of proseFiveGrams(prose.sentences)) {
          fiveGramCounts.set(g, (fiveGramCounts.get(g) ?? 0) + 1)
          if (!gramCarriesValue(g, valueWords))
            fixedGramCounts.set(g, (fixedGramCounts.get(g) ?? 0) + 1)
        }
      }
      buffer.push(rendered)
    }
    bundles.clear()
    await flush(false)
    process.stderr.write(`shard ${shard + 1}/${shards} rendered (${stats.pages} pages)\n`)
  }
  await flush(true)

  const summary = {
    inputs: {
      fieldsDir,
      seedsDir,
      questionsDir,
      identityFile,
      tiersFile,
      suppressionFile,
      registryDir,
    },
    rowCap: ROW_CAP,
    pages: stats.pages,
    withQuestions: stats.withQuestions,
    withoutQuestions: stats.stub,
    byTier: stats.byTier,
    meanWordCount: stats.pages > 0 ? Number((stats.words / stats.pages).toFixed(1)) : 0,
    files: written,
  }
  await fs.writeFile(
    path.join(outDir, 'summary.json'),
    JSON.stringify(summary, null, 2) + '\n',
    'utf8',
  )

  const share = (n: number): number =>
    indexedPages > 0 ? Number((n / indexedPages).toFixed(6)) : 0
  const over = (
    counts: Map<string, number>,
  ): Array<{ text: string; pages: number; share: number }> =>
    [...counts.entries()]
      .filter(([, n]) => n / Math.max(indexedPages, 1) > 0.05)
      .sort((a, b) => b[1] - a[1])
      .map(([text, pages]) => ({ text, pages, share: share(pages) }))
  const top = (
    counts: Map<string, number>,
    n: number,
  ): Array<{ text: string; pages: number; share: number }> =>
    [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([text, pages]) => ({ text, pages, share: share(pages) }))
  const standing = {
    rule: 'a sentence appearing verbatim in the prose of more than 5% of indexed pages is a standing sentence and fails; a label in a revealed row is markup and is reported beside it, not against the rule',
    set: 'indexed candidates: Tier 1 or Tier 2 with at least one question',
    indexedPages,
    prose: {
      distinctSentences: sentenceCounts.size,
      overFivePercent: over(sentenceCounts),
      mostRepeated: top(sentenceCounts, 15),
    },
    markupRowLabels: {
      distinctLabels: rowLabelCounts.size,
      overFivePercent: over(rowLabelCounts),
      mostRepeated: top(rowLabelCounts, 15),
    },
    fiveGrams: {
      rule:
        "a word five-gram of a page's prose is FIXED on that page when none of its five words is " +
        "a value there — not a word of the compound's name, not a slot the derivation filled, and " +
        'not a word carrying a digit. A gram that is fixed on more than 5% of indexed pages is a ' +
        'repeated frame and fails: it is the template speaking, on a twentieth of the corpus, and ' +
        'it is what the sentence-level audit cannot see because the sentence around it differs.',
      distinctFiveGrams: fiveGramCounts.size,
      overFivePercent: over(fiveGramCounts).map((g) => ({
        ...g,
        fixedPages: fixedGramCounts.get(g.text) ?? 0,
        fixedShare: share(fixedGramCounts.get(g.text) ?? 0),
      })),
      fixedOverFivePercent: over(fixedGramCounts),
      mostRepeatedFixed: top(fixedGramCounts, 15),
    },
  }
  await fs.writeFile(
    path.join(outDir, 'standing-sentences.json'),
    JSON.stringify(standing, null, 2) + '\n',
    'utf8',
  )
  console.log(JSON.stringify({ ...summary, files: written.length }, null, 2))
  console.log(
    JSON.stringify(
      {
        standingSentences: standing.prose.overFivePercent.length,
        standingRowLabels: standing.markupRowLabels.overFivePercent.length,
        fiveGramsOverFivePercent: standing.fiveGrams.overFivePercent.length,
        fixedFiveGramsOverFivePercent: standing.fiveGrams.fixedOverFivePercent.length,
        indexedPages,
      },
      null,
      2,
    ),
  )
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (invokedDirectly) {
  await main()
}
