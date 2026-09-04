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
  if (source.id && source.id !== reg && !/snapshot/i.test(source.id)) parts.push(source.id)
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
function rowsFromTrials(list: unknown[], cap = ROW_CAP): RevealedRow[] {
  const out: RevealedRow[] = []
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
    if (title) bits.push(title)
    if (phase) bits.push(phase.toLowerCase().replace(/_/g, ' '))
    if (status) bits.push(status.toLowerCase().replace(/_/g, ' '))
    if (n !== undefined) bits.push(`n ${n}`)
    if (endpoint) bits.push(clampSentence(endpoint, 240))
    if (timeFrame) bits.push(clampSentence(timeFrame, 160))
    if (completion) bits.push(completion)
    // The registry's stop text is quoted here exactly as the block sentence quotes it. Some
    // ClinicalTrials.gov records store the literal string "undefined" in that position; unquoted
    // it reads as a rendering fault, quoted it reads as the registry value the row is reporting.
    if (why) bits.push(`"${clampSentence(why, 240)}"`)
    if (bits.length === 0) continue
    out.push({ label: 'Trial', ...(nct ? { identifier: nct } : {}), value: bits.join('; ') })
  }
  return out
}

/**
 * The register statuses a page holds, as ROWS and as VALUES.
 *
 * Gate 2's repeated-frame audit charged three of the CLINICAL blocks with the same two phrases:
 * "jurisdictions record no status for" (32.7 % of indexed pages) and the constant never-cleared
 * list. Both were sentences carrying no value of this page's own. The fix is structural, not
 * lexical: a per-jurisdiction status is a row (register, status, record id, date), and the prose
 * names only the jurisdictions that recorded a status, as values. The four registers that were
 * never cleared for this corpus (UK, AU, JP, SG) are a property of the corpus and are stated once,
 * on /definitions.
 */
function registerStatusRows(statuses: ReturnType<typeof readRegisterStatuses>): RevealedRow[] {
  const out: RevealedRow[] = []
  for (const code of statuses.unknown)
    out.push({ label: code, value: 'consulted, no status recorded' })
  for (const r of statuses.recorded) {
    if (r.records.length === 0) {
      out.push({ label: r.code, value: r.status })
      if (out.length >= ROW_CAP) return out
      continue
    }
    for (const rec of r.records) {
      const bits = [
        r.status,
        rec.register,
        rec.statement ? clampSentence(rec.statement, 240) : undefined,
        rec.date,
      ]
      out.push({
        label: r.code,
        ...(rec.id ? { identifier: rec.id } : {}),
        value: bits.filter((b): b is string => Boolean(b && b.trim())).join(' · '),
      })
      if (out.length >= ROW_CAP) return out
    }
  }
  return out
}

/** "US approved (NDA 021995, 2005)" — status and the register's own record, per jurisdiction. */
function registerStatusValues(statuses: ReturnType<typeof readRegisterStatuses>): string[] {
  return statuses.recorded.map((r) => {
    const first = r.records[0]
    const detail = first
      ? [first.id, first.date].filter((b): b is string => Boolean(b && b.trim())).join(', ')
      : ''
    return detail ? `${r.code} ${r.status} (${detail})` : `${r.code} ${r.status}`
  })
}

/** A count group: the bucket name is the label, the number is the value. No frame around either. */
function countRows(counts: Record<string, unknown> | undefined): RevealedRow[] {
  if (!counts) return []
  const out: RevealedRow[] = []
  for (const [k, v] of Object.entries(counts).slice(0, ROW_CAP)) {
    const n = asNumber(v)
    if (n === undefined) continue
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
  const rows: RevealedRow[] = []
  const p1 = (s: string, source: SourceRef | undefined = src): void => {
    const t = oneFullStop(s)
    bare.push(t)
    paragraphs.push(withAnchor(t, source))
  }
  const p2 = (s: string, source?: SourceRef): void => {
    const t = oneFullStop(s)
    bare.push(t)
    paragraphs.push(source ? withAnchor(t, source) : t)
  }
  const joinBits = (bits: Array<string | undefined>): string =>
    bits.filter((b): b is string => Boolean(b && b.trim())).join('; ')

  switch (q.template) {
    /* ---------------------------------------------------- classification */
    /*
     * An S10-only page: the suppression pass recorded no classification it could read, so this
     * block states that, names the registers that were cleared and could have carried one, and
     * makes no supervision claim. Paragraph 2 is written only where the page actually holds a
     * regulatory row, and it carries that row's recorded statuses as values.
     */
    case 'classification': {
      const reg = f.present('regulatoryStatus')
      const statuses = readRegisterStatuses(reg)
      const cleared = [...statuses.recorded.map((r) => r.code), ...statuses.unknown]
      p1(
        cleared.length > 0
          ? `No regulator classification is recorded for ${name} in ${joinList(cleared)}.`
          : `No regulator classification is recorded for ${name}.`,
        entrySource(reg),
      )
      if (reg) {
        const values = registerStatusValues(statuses)
        if (values.length > 0) p2(`${joinBits(values)}.`, entrySource(reg))
      }
      rows.push(...registerStatusRows(statuses))
      break
    }

    /* ------------------------------------------------------- supervision */
    case 'supervision': {
      const reg = f.present('regulatoryStatus')
      const classifications: string[] = []
      const regValue = asObject(reg?.value)
      if (regValue) {
        for (const [code, raw] of Object.entries(regValue)) {
          const j = asObject(raw)
          const status = asString(pick(j, 'status'))
          const schedule = asString(pick(j, 'deaSchedule', 'controlledSubstanceSchedule'))
          if (status && status !== 'unknown')
            classifications.push(`${code} ${status}${schedule ? `, schedule ${schedule}` : ''}`)
          for (const r of asArray(pick(j, 'records', 'evidence')).slice(0, ROW_CAP)) {
            const ro = asObject(r)
            const verbatim = asString(pick(ro, 'statusVerbatim', 'statement'))
            if (verbatim)
              rows.push({
                label: code,
                ...(asString(pick(ro, 'recordId', 'id'))
                  ? { identifier: asString(pick(ro, 'recordId', 'id')) as string }
                  : {}),
                value: clampSentence(verbatim),
              })
          }
        }
      }
      if (classifications.length > 0) {
        p1(
          `${joinList(classifications)}: the registers' classification of ${name}.`,
          entrySource(reg),
        )
      } else if (page.suppressionClasses.filter((c) => /^S[1-9]$/.test(c)).length > 0) {
        p1(
          `Classification ${joinList(page.suppressionClasses.filter((c) => /^S[1-9]$/.test(c)))} is recorded for ${name}.`,
          entrySource(reg),
        )
      } else {
        p1(`No regulator classification is recorded for ${name}.`, entrySource(reg))
      }
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
      const phaseWords = phases
        ? Object.entries(phases)
            .map(([k, v]) => `${asNumber(v) ?? 0} ${k.toLowerCase().replace(/_/g, ' ')}`)
            .join(', ')
        : undefined
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
            value: clampSentence(text),
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
          value: joinBits([asString(pick(o, 'year')), clampSentence(s ?? '')]),
        })
      }
      break
    }

    /* ------------------------------------------------------ dose shape */
    case 'dose-shape':
    case 'dose-shape-plateau': {
      const shape = asObject(f.present('doseResponseShape')?.value)
      const findings = asArray(pick(shape, 'findings'))
      const first = asObject(findings[0])
      const sentence = asString(pick(first, 'sentence'))
      p1(
        `${sentenceCase(asString(pick(shape, 'shape')) ?? 'The recorded shape')} in ${q.values.organism ?? 'the studied organism'}${sentence ? `: "${clampSentence(sentence, 320)}"` : ` for ${name}`}.`,
        entrySource(f.present('doseResponseShape')) ?? src,
      )
      p2(
        joinBits([
          `${findings.length} recorded ${findings.length === 1 ? 'sentence' : 'sentences'}`,
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
          value: clampSentence(s),
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
          clampSentence(asString(pick(first, 'title')) ?? '', 200) || undefined,
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
      p1(
        `${trials.length} of ${completed ?? trials.length} completed trials of ${name} posted no result: ${joinList(ncts.slice(0, 6))}${ncts.length > 6 ? `, and ${ncts.length - 6} more` : ''}.`,
      )
      // The seed's cut-off and as-of dates are the same two strings on every firing page, so they
      // are a method note: they belong in the technical disclosure, not in the block's prose.
      p2(
        joinBits([
          dates[0] ? `oldest ${dates[0]}` : undefined,
          dates.length > 1 ? `newest ${dates[dates.length - 1]}` : undefined,
        ]),
      )
      rows.push(...rowsFromTrials(trials))
      break
    }

    /* ----------------------------------------------------- trial-size (16) */
    case 'trial-size': {
      const v = asObject(f.seed('seed16')?.values)
      const reg = asObject(page.registry)
      p1(
        `${asNumber(pick(v, 'medianN')) ?? q.values.median ?? ''} at the median, ${asNumber(pick(v, 'maxN')) ?? '—'} at the largest, across ${asNumber(pick(v, 'trialCount')) ?? 0} registered trials of ${name}.`,
      )
      const statuses = asObject(pick(reg, 'byOverallStatus'))
      p2(
        joinBits([
          statuses
            ? Object.entries(statuses)
                .map(([k, n]) => `${asNumber(n) ?? 0} ${k.toLowerCase().replace(/_/g, ' ')}`)
                .join(', ')
            : undefined,
          asNumber(pick(reg, 'hasResults')) !== undefined
            ? `${asNumber(pick(reg, 'hasResults'))} with posted results`
            : undefined,
        ]) || `${asNumber(pick(v, 'trialCount')) ?? 0} counted.`,
      )
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
          value: clampSentence(s),
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
      const words = statuses
        .map((s) => {
          const o = asObject(s)
          const j = asString(pick(o, 'jurisdiction'))
          const st = asString(pick(o, 'status'))
          return j && st ? `${j} ${st}` : undefined
        })
        .filter((w): w is string => Boolean(w))
      p1(`${joinList(words)}: the registers' classifications of ${name}.`)
      const dates = unique(statuses.map((s) => asString(pick(asObject(s), 'sourceDate')) ?? ''))
      p2(joinBits([dates.join(', ') || undefined, `${statuses.length} registers read`]))
      for (const s of statuses.slice(0, ROW_CAP)) {
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
      const events = asArray(pick(v, 'events'))
      const firstEvent = asObject(events[0])
      const lastEvent = asObject(events[events.length - 1])
      p1(
        `${asString(pick(firstEvent, 'date')) ?? q.values.firstYear ?? ''} ${asString(pick(firstEvent, 'event')) ?? ''} to ${asString(pick(lastEvent, 'date')) ?? ''} ${asString(pick(lastEvent, 'event')) ?? ''}: ${events.length} dated ${events.length === 1 ? 'event' : 'events'} for ${name}.`,
      )
      // The event words alone ("first human trial, first approval; approved") stood on 1,099 indexed
      // pages. Each kind now carries the year the source dates it to, which is the page's own value
      // and is what the reader wanted from the list in the first place.
      const kinds = unique(
        events.map((e) => {
          const o = asObject(e)
          const event = asString(pick(o, 'event'))
          if (!event) return ''
          const dated = asString(pick(o, 'date')) ?? asString(pick(o, 'year'))
          return dated ? `${event} ${dated.slice(0, 4)}` : event
        }),
      ).filter(Boolean)
      p2(
        joinBits([
          kinds.slice(0, 5).join(', ') || undefined,
          asString(pick(asObject(pick(v, 'currentState')), 'value')),
        ]),
      )
      for (const e of events.slice(0, ROW_CAP)) {
        const o = asObject(e)
        const event = asString(pick(o, 'event'))
        if (!event) continue
        const s = asObject(pick(o, 'source'))
        rows.push({
          label: asString(pick(o, 'date')) ?? asString(pick(o, 'year')) ?? 'Undated',
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
      const registers = readRegisterStatuses(f.present('regulatoryStatus'))
      const history = asObject(f.present('trialHistory')?.value)
      const registered = asNumber(pick(history, 'registeredStudies', 'studies'))
      const posted = asNumber(pick(history, 'studiesWithPostedResults'))
      // Paragraph 2 states the jurisdictions that recorded a status, as values. The jurisdictions
      // that recorded none are rows or nothing: naming them was the same list of codes on a third
      // of the indexed corpus, and the four never-cleared registers are on /definitions.
      const statusValues = registerStatusValues(registers)
      if (statusValues.length > 0) {
        p2(`${joinBits(statusValues)}.`)
      } else if (registered !== undefined && posted !== undefined && registered > 0) {
        p2(
          `${registered - posted} of ${registered} registered studies of ${name} posted no result.`,
        )
      } else {
        p2(joinBits([section, entry?.sourceDate ? `recorded ${entry.sourceDate}` : undefined]))
      }
      rows.push(...registerStatusRows(registers))
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
      const registerValues = joinBits(registerStatusValues(registers))
      p1(registerValues ? `${registerValues}.` : `${name}.`, entrySource(entry) ?? src)
      // No paragraph 2. The jurisdictions that were consulted and recorded nothing are the same
      // two or three codes on a sixth of the corpus, so as a sentence they are a standing sentence
      // (the first render of this fix measured "US and EU: consulted, no status recorded." on 17 %
      // of indexed pages). They are rows instead, which the audit counts as markup, and the reason
      // some registers were never consulted at all is on /definitions.
      rows.push(...registerStatusRows(registers))
      break
    }

    /* ------------------------------------- CLINICAL: registered trials only */
    case 'trial-history': {
      const entry = f.present('trialHistory')
      const v = asObject(entry?.value)
      const registered = asNumber(pick(v, 'registeredStudies', 'studies')) ?? 0
      const phases = asObject(pick(v, 'byPhase'))
      const statuses = asObject(pick(v, 'byOverallStatus'))
      const phaseWords = phases
        ? Object.entries(phases)
            .map(([k, n]) => `${asNumber(n) ?? 0} ${k.toLowerCase().replace(/_/g, ' ')}`)
            .join(', ')
        : undefined
      p1(
        `${registered} registered ${registered === 1 ? 'study' : 'studies'} of ${name}: ${phaseWords ?? 'no phase recorded'}.`,
        entrySource(entry) ?? src,
      )
      const posted = asNumber(pick(v, 'studiesWithPostedResults'))
      const pubmed = asNumber(pick(asObject(pick(v, 'pubmedClinicalTrialCount')), 'count'))
      p2(
        joinBits([
          posted !== undefined
            ? `${registered - posted} of ${registered} posted no result`
            : undefined,
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
      p1(
        joinBits([
          actions.length > 0
            ? `${joinList(actions.map((a) => a.toLowerCase()))} on ${joinList(targets.slice(0, 3))}`
            : `${mechanisms.length} recorded ${mechanisms.length === 1 ? 'mechanism' : 'mechanisms'} on ${joinList(targets.slice(0, 3))}`,
          firstMechanism ? `the record reads "${clampSentence(firstMechanism, 300)}"` : undefined,
        ]) + '.',
        entrySource(mechanismEntry) ?? src,
      )
      const gaps = developmentGaps(f, page, ['dose', 'trial'])
      p2(
        joinBits([
          `${mechanisms.length} recorded mechanism ${mechanisms.length === 1 ? 'row' : 'rows'}`,
          gaps.length > 0 ? `not recorded here: ${joinList(gaps)}` : undefined,
        ]),
        entrySource(targetEntry),
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
    case 'never-dosed': {
      const ever = f.present('everDosedInHumans')
      const v = asObject(ever?.value)
      p1(
        `${name} has no recorded human exposure${asString(pick(v, 'basis')) ? `: ${asString(pick(v, 'basis'))}` : ' in the registry or ChEMBL'}.`,
        entrySource(ever) ?? src,
      )
      p2(
        joinBits([
          f.topRung ? `highest organism ${f.topRung.organism}` : 'no organism recorded',
          f.topRung?.kind,
          `${asNumber(pick(v, 'matchedStudies')) ?? 0} matched studies`,
        ]),
      )
      rows.push(...ladderRows(f))
      break
    }

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
    rows,
  }
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

/** A seed's own recorded rows, rendered as label/value pairs without inventing a frame. */
function seedRows(values: Record<string, unknown> | undefined): RevealedRow[] {
  if (!values) return []
  const out: RevealedRow[] = []
  for (const [key, value] of Object.entries(values)) {
    if (key === 'sources' || key === 'source') continue
    if (Array.isArray(value)) {
      for (const item of value.slice(0, ROW_CAP)) {
        const o = asObject(item)
        if (!o) {
          const s = asString(item)
          if (s) out.push({ label: key, value: s })
          continue
        }
        const bits = Object.entries(o)
          .filter(([k]) => k !== 'source' && k !== 'sources')
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
        const bits = Object.entries(o)
          .filter(([k]) => k !== 'source' && k !== 'sources')
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
  for (const q of page.questions) {
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

/* ------------------------------------------------------ page rendering */

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
}

export function renderPage(page: PageBundle): RenderedPage {
  const f = facts(page)
  const lines: string[] = []
  /** Parallel to `lines`: true where the template declares the line markup rather than prose. */
  const isMarkup: boolean[] = []
  const push = (line: string, markup = false): void => {
    lines.push(line)
    isMarkup.push(markup)
  }

  /* header — display name, synonyms, register/date, badge triplet */
  push(page.displayName)
  const synonyms = page.identity.synonyms
    .filter((s) => s.name && s.name.toLowerCase() !== page.displayName.toLowerCase())
    .map((s) => (s.kind ? `${s.name} (${s.kind})` : s.name))
  if (synonyms.length > 0) push(`Also recorded as ${synonyms.join(', ')}`, true)
  const { register, date } = headerRegister(page, f)
  push(`${register} · last verified ${date}`, true)
  const humanData = f.rungs.some((r) => r.organism === 'human') || f.largestN !== undefined
  push(
    `Tier ${page.tier} · ${f.topRung ? f.topRung.organism : 'no organism recorded'} · human data ${humanData ? 'yes' : 'no'}`,
    true,
  )

  /* question blocks, or the stub sentence */
  if (page.questions.length === 0) {
    push(`This record holds ${page.presentFields} ${page.presentFields === 1 ? 'field' : 'fields'}`)
    // Question-derivation amendment: a stub carries a supervision line only where a class S1–S9 was
    // matched; where the only class is S10 (unknown) it says so, and never a supervision claim
    // without a classification to cite. S11 is the cleared class and states nothing.
    const cited = page.suppressionClasses.filter((c) => /^S[1-9]$/.test(c))
    if (cited.length > 0) {
      push(`Regulator classification recorded: ${cited.join(', ')}`)
    } else if (
      page.suppressionClasses.length > 0 &&
      page.suppressionClasses.every((c) => c === 'S10')
    ) {
      push('No regulator classification is recorded for this compound')
    }
  } else {
    for (const q of page.questions) {
      push(q.text)
      const body = buildBlockBody(q, page, f)
      for (const p of body.paragraphs) push(p)
      if (body.rows.length > 0) {
        // The `<summary>` reads "Show the evidence" on every block of every page. It is a control
        // label, so it is a repeated element and excluded with the rest of the chrome; the rows it
        // opens are the page's own words and are counted.
        for (const row of body.rows) {
          push(`${row.label}${row.identifier ? ` ${row.identifier}` : ''} ${row.value}`)
        }
      }
    }
  }

  /* the exact record: identifiers panel, then the relations rows (R10) */
  const identifierRows: string[] = []
  for (const [key, label] of IDENTIFIER_LABELS) {
    const value = asString(page.identity[key] as unknown)
    if (value) identifierRows.push(`${label} ${value}`)
  }
  if (identifierRows.length > 0) {
    push('The exact record', true)
    for (const row of identifierRows) push(row, true)
  }
  const relationRows = page.identity.relations
    .map((r) => {
      const label = RELATION_LABELS[r.type] ?? r.type.replace(/-/g, ' ')
      const target = page.names.get(r.targetKey)
      return target ? `${label} ${target}` : undefined
    })
    .filter((r): r is string => Boolean(r))
  if (relationRows.length > 0) {
    push('Relations', true)
    for (const row of unique(relationRows).slice(0, ROW_CAP)) push(row, true)
  }

  /* the source list: every anchor's source, once */
  const sources = new Map<string, string>()
  for (const q of page.questions) {
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
  const text = clean.filter((l) => l.length > 0).join('\n')
  const proseText = clean.filter((l, i) => l.length > 0 && !isMarkup[i]).join('\n')
  return {
    key: page.key,
    tier: page.tier,
    presentFields: page.presentFields,
    text,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    proseText,
    proseWordCount: proseText.split(/\s+/).filter(Boolean).length,
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
