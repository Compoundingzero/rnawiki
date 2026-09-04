/**
 * Question derivation (R7) — executes docs/specs/question-derivation.md.
 *
 * `deriveQuestions(page)` turns one assembled page (its field states/values and its fired seeds)
 * into an ordered list of question blocks. Nothing here calls a model, and nothing here writes a
 * value that is not already in the page's own fields: every template has a trigger, and a slot with
 * no value means the template does not fire (spec §Principles 1).
 *
 * CLI:
 *   npx tsx scripts/corpus-20k/questions/derive.ts \
 *     --fields data/corpus-20k/fields --seeds data/corpus-20k/derived --out data/corpus-20k/questions
 *
 * Input shape assumption (recorded because Phase 2 has not written a batch yet, 2026-09-04): the
 * field batches are NDJSON under `<fields>/<model>/batch-NNNN.ndjson`, one object per page carrying
 * `key`, `displayName`, `model`, `suppressed`, optional `tier`, and `fields` as
 * `{ <field>: { state, value, source, sourceDate } }`; the seed files are
 * `<seeds>/<seed>.ndjson`, one object per firing page carrying `key` plus the seed's values. Field
 * and seed names are resolved through the alias tables below, so `field5`, `f5`,
 * `human_evidence_ceiling` and `humanEvidenceCeiling` all reach the same rule. If the extractors
 * settle on different names, extend FIELD_ALIASES / SEED_ALIASES rather than the rules.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/* ------------------------------------------------------------------ types */

export type FieldState = 'present' | 'absent' | 'not-applicable'

export interface SourceRef {
  kind?: string
  id?: string
  url?: string
  sourceDate?: string
}

export interface FieldEntry {
  state: FieldState
  value?: unknown
  source?: SourceRef | SourceRef[]
  sourceDate?: string
}

export interface SeedEntry {
  fires: boolean
  values?: unknown
}

export interface PageInput {
  key: string
  displayName: string
  model: 'LONGEVITY' | 'CLINICAL' | 'DEVELOPMENT' | string
  suppressed: boolean
  fields: Record<string, FieldEntry>
  seeds: Record<string, SeedEntry>
  /** Phase 2 tier. Optional: the stub rule falls back to the present-field count when absent. */
  tier?: number
  /**
   * The R2 classes the suppression pass assigned. Read here only to choose which of the two
   * leading blocks a suppressed page carries: a page whose only class is S10 (unknown) has no
   * classification to cite, so it must not be asked why it carries a supervision requirement.
   */
  suppressionClasses?: string[]
}

export interface QuestionBlock {
  /** Stable per page: a block fires at most once, so the template id identifies the question. */
  id: string
  text: string
  /** Wikiwand badge, renumbered from Q1 on every page. */
  badge: string
  block: string
  template: string
  values: Record<string, string>
  sources: SourceRef[]
}

/* ------------------------------------------------- small value accessors */

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
    const t = v.trim()
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

function year(v: unknown): string | undefined {
  const s = asString(v)
  if (!s) return undefined
  const m = s.match(/\b(1[89]\d{2}|20\d{2})\b/)
  return m ? m[1] : undefined
}

/** 1 → "a"; 2 → "a and b"; 3+ → "a, b and c". Used for enzymes, jurisdictions, sexes. */
export function joinList(items: string[]): string {
  const list = items.filter((s) => s.length > 0)
  if (list.length === 0) return ''
  if (list.length === 1) return list[0] ?? ''
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`
}

/** Plain comma join, used where the spec shows one ("futility, accrual"). */
function joinPlain(items: string[]): string {
  return items.filter((s) => s.length > 0).join(', ')
}

function unique(items: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const i of items) {
    if (!seen.has(i)) {
      seen.add(i)
      out.push(i)
    }
  }
  return out
}

/** Sentence-initial organism: capitalise a lowercase ASCII first letter, nothing else. */
function sentenceCase(s: string): string {
  return /^[a-z]/.test(s) ? (s[0] ?? '').toUpperCase() + s.slice(1) : s
}

/* ------------------------------------------------------ duration wording */

/**
 * Magnitude picks the unit (spec §Slot vocabulary): days below a fortnight, then weeks, then
 * months, then years. Nothing is rounded away silently — the block's revealed rows carry the exact
 * recorded duration.
 */
export function formatDuration(days: number | undefined): string | undefined {
  if (days === undefined || !Number.isFinite(days) || days <= 0) return undefined
  if (days < 14) {
    const d = Math.round(days)
    return `${d} ${d === 1 ? 'day' : 'days'}`
  }
  if (days < 84) {
    const w = Math.round(days / 7)
    return `${w} ${w === 1 ? 'week' : 'weeks'}`
  }
  if (days < 730) {
    const m = Math.round(days / 30.44)
    return `${m} ${m === 1 ? 'month' : 'months'}`
  }
  const raw = days / 365.25
  const y = raw < 10 ? Math.round(raw * 10) / 10 : Math.round(raw)
  return `${y} ${y === 1 ? 'year' : 'years'}`
}

/** Reads a duration from the several shapes an extractor might record. */
function durationDays(v: unknown): number | undefined {
  const direct = asNumber(v)
  if (direct !== undefined && typeof v !== 'object') return direct
  const o = asObject(v)
  if (!o) return undefined
  const days = asNumber(pick(o, 'longestDurationDays', 'durationDays', 'days'))
  if (days !== undefined) return days
  const weeks = asNumber(pick(o, 'durationWeeks', 'weeks'))
  if (weeks !== undefined) return weeks * 7
  const months = asNumber(pick(o, 'durationMonths', 'months'))
  if (months !== undefined) return months * 30.44
  const years = asNumber(pick(o, 'durationYears', 'years'))
  if (years !== undefined) return years * 365.25
  const value = asNumber(pick(o, 'value'))
  const unit = asString(pick(o, 'unit'))?.toLowerCase()
  if (value !== undefined && unit) {
    if (unit.startsWith('day')) return value
    if (unit.startsWith('week')) return value * 7
    if (unit.startsWith('month')) return value * 30.44
    if (unit.startsWith('year')) return value * 365.25
  }
  return undefined
}

/* ---------------------------------------------------- field name aliases */

/** Canonical field ids, one per field in docs/specs/field-models.md. */
export const FIELD_IDS = [
  // LONGEVITY 1..15
  'hallmarks',
  'organismLadder',
  'itp',
  'endpointTypes',
  'humanEvidenceCeiling',
  'epigeneticClocks',
  'doseResponseShape',
  'pathways',
  'kinetics',
  'interactions',
  'trialFailures',
  'biomarkersMeasured',
  'regulatoryStatus',
  'ongoingTrials',
  'faersSignal',
  // CLINICAL extras
  'indication',
  'adverseEvents',
  'trialHistory',
  'withdrawalStatus',
  // DEVELOPMENT
  'molecularTarget',
  'mechanismClass',
  'highestPhase',
  'whyDevelopmentStopped',
  'sponsor',
  'patentStatus',
  'everDosedInHumans',
  'relatedCompounds',
  // shared
  'doseStudied',
  'approvalDate',
] as const

export type FieldId = (typeof FIELD_IDS)[number]

const FIELD_ALIASES: Record<FieldId, string[]> = {
  hallmarks: ['field1', 'f1', 'hallmark', 'hallmarkofaging', 'hallmarksofaging'],
  organismLadder: ['field2', 'f2', 'ladder', 'modelorganismladder', 'rungs', 'organismrungs'],
  itp: ['field3', 'f3', 'niaitp', 'itpcohorts'],
  endpointTypes: ['field4', 'f4', 'endpointtype', 'endpointtypeperfinding'],
  humanEvidenceCeiling: ['field5', 'f5', 'humanevidence', 'humanceiling'],
  epigeneticClocks: ['field6', 'f6', 'clocks'],
  doseResponseShape: ['field7', 'f7', 'doseresponse', 'doseshape'],
  pathways: ['field8', 'f8', 'pathway'],
  kinetics: ['field9', 'f9', 'labelkinetics'],
  interactions: ['field10', 'f10', 'labelinteractions'],
  trialFailures: ['field11', 'f11', 'failures', 'stoppedtrials', 'trialfailure'],
  biomarkersMeasured: ['field12', 'f12', 'biomarkers'],
  regulatoryStatus: [
    'field13',
    'f13',
    'regulatory',
    'regulatorystatusbyjurisdiction',
    'jurisdictionstatus',
  ],
  ongoingTrials: ['field14', 'f14', 'ongoing'],
  faersSignal: ['field15', 'f15', 'faers'],
  indication: ['labelindication'],
  adverseEvents: ['adverseevent', 'labeladverseevents'],
  trialHistory: ['trialcounts'],
  withdrawalStatus: ['withdrawal', 'withdrawn'],
  molecularTarget: ['target'],
  mechanismClass: ['mechanism', 'moa'],
  highestPhase: ['maxphase', 'highestphasereached'],
  whyDevelopmentStopped: ['whystopped', 'developmentstopped', 'whydevelopmentstoppped'],
  sponsor: [],
  patentStatus: ['patent'],
  everDosedInHumans: ['everdosed', 'dosedinhumans'],
  relatedCompounds: ['relatedcompoundsonthesametarget', 'related', 'relatedontarget'],
  doseStudied: ['dosetext', 'studieddose', 'dosestudiedtext', 'registrydose'],
  approvalDate: ['firstapproval', 'firstapprovaldate', 'approvalyear'],
}

function normaliseName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const FIELD_LOOKUP: Map<string, FieldId> = (() => {
  const m = new Map<string, FieldId>()
  for (const id of FIELD_IDS) {
    m.set(normaliseName(id), id)
    for (const a of FIELD_ALIASES[id]) m.set(normaliseName(a), id)
  }
  return m
})()

/* ----------------------------------------------------- seed name aliases */

const SEED_SLUGS: Record<string, string> = {
  bioavailabilitygap: 'seed1',
  nof1designability: 'seed2',
  nof1: 'seed2',
  failureautopsy: 'seed3',
  endpointmismatch: 'seed4',
  stackinteractiongraph: 'seed5',
  timetosignal: 'seed6',
  sexspecificdivergence: 'seed7',
  evidenceprovenancetimeline: 'seed8',
  provenance: 'seed8',
  whatwouldchangethis: 'seed9',
  whatwouldsettle: 'seed9',
  sourcecontradiction: 'seed10',
  contradiction: 'seed10',
  animalonlyceiling: 'seed11',
  registrytopublicationgap: 'seed12',
  unreported: 'seed12',
  sametargetlineage: 'seed13',
  lineage: 'seed13',
  spontaneousreportdisproportion: 'seed14',
  faersunlisted: 'seed14',
  evidenceage: 'seed15',
  trialsizeceiling: 'seed16',
  trialsize: 'seed16',
  jurisdictiondivergence: 'seed17',
  jurisdiction: 'seed17',
}

export function canonicalSeedId(raw: string): string {
  const n = normaliseName(raw)
  // `scripts/corpus-20k/derived/compute.py` writes `seed-NN-<slug>.ndjson`, so the number leads.
  const numbered = n.match(/^seed0*(\d+)/) ?? n.match(/^0*(\d+)$/)
  if (numbered?.[1] !== undefined) return `seed${Number(numbered[1])}`
  const slug = SEED_SLUGS[n]
  if (slug !== undefined) return slug
  return n
}

/* ------------------------------------------------------- page normaliser */

interface NormalPage {
  key: string
  name: string
  model: string
  suppressed: boolean
  tier?: number
  suppressionClasses: string[]
  fields: Map<FieldId, FieldEntry>
  unknownFields: Map<string, FieldEntry>
  seeds: Map<string, SeedEntry>
}

function sourcesOf(...entries: Array<FieldEntry | undefined>): SourceRef[] {
  const out: SourceRef[] = []
  const seen = new Set<string>()
  for (const e of entries) {
    if (!e) continue
    for (const s of asArray(e.source)) {
      const o = asObject(s)
      if (!o) continue
      const ref: SourceRef = {
        ...(asString(o.kind) ? { kind: asString(o.kind) } : {}),
        ...(asString(o.id) ? { id: asString(o.id) } : {}),
        ...(asString(o.url) ? { url: asString(o.url) } : {}),
        ...((asString(o.sourceDate) ?? e.sourceDate)
          ? { sourceDate: asString(o.sourceDate) ?? e.sourceDate }
          : {}),
      }
      const sig = JSON.stringify(ref)
      if (!seen.has(sig)) {
        seen.add(sig)
        out.push(ref)
      }
    }
  }
  return out
}

function seedSources(values: unknown): SourceRef[] {
  const o = asObject(values)
  if (!o) return []
  const raw = o.sources !== undefined ? asArray(o.sources) : asArray(o.source)
  const out: SourceRef[] = []
  for (const s of raw) {
    const so = asObject(s)
    if (so) {
      out.push({
        ...(asString(so.kind) ? { kind: asString(so.kind) } : {}),
        ...(asString(so.id) ? { id: asString(so.id) } : {}),
        ...(asString(so.url) ? { url: asString(so.url) } : {}),
        ...(asString(so.sourceDate) ? { sourceDate: asString(so.sourceDate) } : {}),
      })
    } else {
      const str = asString(s)
      if (str) out.push({ id: str })
    }
  }
  return out
}

export function normalisePage(page: PageInput): NormalPage {
  const fields = new Map<FieldId, FieldEntry>()
  const unknownFields = new Map<string, FieldEntry>()
  for (const [rawName, entry] of Object.entries(page.fields ?? {})) {
    if (!entry || typeof entry !== 'object') continue
    const id = FIELD_LOOKUP.get(normaliseName(rawName))
    if (id) {
      // A page assigned one model never carries two names for one field; if it does, `present`
      // wins so a value is never dropped.
      const existing = fields.get(id)
      if (!existing || (existing.state !== 'present' && entry.state === 'present')) {
        fields.set(id, entry)
      }
    } else {
      unknownFields.set(rawName, entry)
    }
  }
  const seeds = new Map<string, SeedEntry>()
  for (const [rawName, entry] of Object.entries(page.seeds ?? {})) {
    if (!entry || typeof entry !== 'object') continue
    seeds.set(canonicalSeedId(rawName), entry)
  }
  return {
    key: page.key,
    name: page.displayName,
    model: page.model,
    suppressed: page.suppressed === true,
    suppressionClasses: Array.isArray(page.suppressionClasses) ? page.suppressionClasses : [],
    ...(typeof page.tier === 'number' ? { tier: page.tier } : {}),
    fields,
    unknownFields,
    seeds,
  }
}

/** Present fields, counted the way the coverage report counts them (R4). */
export function presentFieldCount(page: PageInput): number {
  const n = normalisePage(page)
  let count = 0
  for (const e of n.fields.values()) if (e.state === 'present') count += 1
  for (const e of n.unknownFields.values()) if (e.state === 'present') count += 1
  return count
}

/**
 * Stub rule (R15): a Tier 3 page holding fewer than three present fields gets no questions.
 * Phase 2 assigns the tier; where the tier has not been recorded, the present-field count decides,
 * since that is the threshold the tiering itself uses. Tier 1 and Tier 2 are never stubbed.
 */
export function isStub(page: PageInput): boolean {
  const tier = page.tier
  if (tier === 1 || tier === 2) return false
  return presentFieldCount(page) < 3
}

/* ------------------------------------------------------- organism ladder */

const ORGANISM_ORDER = ['yeast', 'c. elegans', 'drosophila', 'mouse', 'rat', 'dog', 'nhp', 'human']

const ORGANISM_SYNONYMS: Record<string, string> = {
  saccharomyces: 'yeast',
  saccharomycescerevisiae: 'yeast',
  budgingyeast: 'yeast',
  celegans: 'c. elegans',
  caenorhabditiselegans: 'c. elegans',
  worm: 'c. elegans',
  nematode: 'c. elegans',
  drosophila: 'drosophila',
  drosophilamelanogaster: 'drosophila',
  fly: 'drosophila',
  fruitfly: 'drosophila',
  mouse: 'mouse',
  mice: 'mouse',
  musmusculus: 'mouse',
  rat: 'rat',
  rats: 'rat',
  rattusnorvegicus: 'rat',
  dog: 'dog',
  dogs: 'dog',
  canine: 'dog',
  nhp: 'nhp',
  nonhumanprimate: 'nhp',
  nonhumanprimates: 'nhp',
  primate: 'nhp',
  monkey: 'nhp',
  macaque: 'nhp',
  marmoset: 'nhp',
  rhesus: 'nhp',
  human: 'human',
  humans: 'human',
  people: 'human',
}

function organismRank(name: string): number {
  const n = normaliseName(name)
  const canon = ORGANISM_SYNONYMS[n] ?? ORGANISM_ORDER.find((o) => normaliseName(o) === n)
  return canon ? ORGANISM_ORDER.indexOf(canon) : -1
}

const KIND_ORDER = ['lifespan', 'healthspan', 'biomarker', 'surrogate', 'mechanism-only']

interface Rung {
  organism: string
  kind?: string
  rank: number
}

function readRungs(entry: FieldEntry | undefined): Rung[] {
  if (!entry || entry.state !== 'present') return []
  const raw = asObject(entry.value)
    ? asArray(pick(asObject(entry.value), 'rungs', 'ladder', 'organisms') ?? [])
    : asArray(entry.value)
  const rungs: Rung[] = []
  for (const r of raw) {
    const o = asObject(r)
    const organism = o ? asString(pick(o, 'organism', 'rung', 'species', 'name')) : asString(r)
    if (!organism) continue
    const kind = o ? asString(pick(o, 'evidenceKind', 'kind', 'evidence')) : undefined
    rungs.push({ organism, ...(kind ? { kind } : {}), rank: organismRank(organism) })
  }
  // Lowest first; unranked organisms sort below every named rung so that "top rung" stays a rung
  // the ladder actually names.
  return rungs.sort((a, b) => a.rank - b.rank)
}

function strongestKind(rungs: Rung[]): string | undefined {
  let best: string | undefined
  let bestRank = Number.POSITIVE_INFINITY
  for (const r of rungs) {
    if (!r.kind) continue
    const rank = KIND_ORDER.indexOf(
      normaliseName(r.kind).replace('mechanismonly', 'mechanism-only'),
    )
    const effective = rank === -1 ? KIND_ORDER.length : rank
    if (effective < bestRank) {
      bestRank = effective
      best = r.kind
    }
  }
  return best
}

/**
 * The approval-date field is recorded per register — `chemblFirstApproval.year`, an EMA `date`, a
 * Drugs@FDA date — so the block reads the earliest year any register states. Nothing is inferred
 * where no register states one.
 */
const BOOKKEEPING_KEYS = new Set(['source', 'sources', 'sourceDate', 'lastVerified', 'url', 'id'])

function earliestApprovalYear(entry: FieldEntry | undefined): string | undefined {
  if (!entry || entry.state !== 'present') return undefined
  const years: number[] = []
  const collect = (v: unknown, depth: number): void => {
    if (depth > 2) return
    const direct = year(v)
    if (direct !== undefined) years.push(Number(direct))
    const o = asObject(v)
    // A verification stamp is not an approval date.
    if (o)
      for (const [k, sub] of Object.entries(o)) {
        if (BOOKKEEPING_KEYS.has(k)) continue
        collect(sub, depth + 1)
      }
    if (Array.isArray(v)) for (const item of v) collect(item, depth + 1)
  }
  collect(entry.value, 0)
  if (years.length === 0) return undefined
  return String(Math.min(...years))
}

/* ------------------------------------------------- interaction accessors */

const CYP_NAME = /^cyp[0-9]/i

/**
 * Field 10 arrives in two recorded shapes: the longevity extractor's
 * `{ cyp: [...], transporters: [...] }`, whose entries name the counterparty, and the label
 * extractor's list of sentences, each carrying the terms printed in it. Both yield the same
 * enzyme names; nothing is inferred from a sentence that names none.
 */
function readInteractionNames(entry: FieldEntry | undefined): { cyps: string[]; all: string[] } {
  if (!entry || entry.state !== 'present') return { cyps: [], all: [] }
  const o = asObject(entry.value)
  const nameOf = (e: unknown): string | undefined => {
    const eo = asObject(e)
    return eo ? asString(pick(eo, 'enzyme', 'name', 'transporter', 'counterparty')) : asString(e)
  }
  if (o) {
    const cypNames = asArray(pick(o, 'cyp', 'cyps'))
      .map(nameOf)
      .filter((e): e is string => Boolean(e))
    const transporterNames = asArray(pick(o, 'transporters'))
      .map(nameOf)
      .filter((e): e is string => Boolean(e))
    return {
      cyps: unique(cypNames),
      all: rankByFrequency([...cypNames, ...transporterNames]),
    }
  }
  const terms = asArray(entry.value)
    .flatMap((row) => asArray(pick(asObject(row), 'terms', 'term')))
    .map((t) => asString(t))
    .filter((t): t is string => Boolean(t))
  return { cyps: unique(terms.filter((t) => CYP_NAME.test(t))), all: rankByFrequency(terms) }
}

/**
 * Most recorded first, ties alphabetical — the rule the spec already sets for field 12's three
 * biomarker terms. The question names the enzymes most often recorded; the block's rows (R10) carry
 * every one of them, so nothing recorded is lost.
 */
function rankByFrequency(items: string[]): string[] {
  const counts = new Map<string, number>()
  for (const i of items) counts.set(i, (counts.get(i) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map((e) => e[0])
}

/* --------------------------------------------------------- ITP accessors */

interface ItpCohort {
  dose?: string
  ageAtStartMonths?: string
  sex?: string
  outcome?: string
  extension?: boolean
}

const EXTENSION_POSITIVE = /\b(increas\w*|extend\w*|extension|prolong\w*|longer)\b/i
const EXTENSION_NEGATED =
  /\b(no|not|without|nor|failed to|did not)\s+(?:\w+\s+){0,3}(increas\w*|extend\w*|extension|effect|difference|significan\w*)/i

/**
 * The ITP workbooks record the sexes present in a cohort as a list of one-letter codes rather than
 * one sex per row, so both shapes reach `sexList` through the same field.
 */
function readCohortSex(co: Record<string, unknown>): string | undefined {
  const direct = asString(pick(co, 'sex'))
  if (direct) return direct
  const listed = asArray(pick(co, 'sexesPresent', 'sexes'))
    .map((x) => asString(x))
    .filter((x): x is string => Boolean(x))
    .map((x) => normaliseName(x))
  if (listed.length === 0) return undefined
  const male = listed.some((x) => x.startsWith('m'))
  const female = listed.some((x) => x.startsWith('f'))
  if (male && female) return 'both'
  if (male) return 'male'
  if (female) return 'female'
  return undefined
}

function readItp(entry: FieldEntry | undefined): { tested: boolean; cohorts: ItpCohort[] } {
  if (!entry || entry.state !== 'present') return { tested: false, cohorts: [] }
  const o = asObject(entry.value)
  const tested = o ? pick(o, 'tested') !== false : true
  const raw = o ? asArray(pick(o, 'cohorts', 'arms') ?? []) : asArray(entry.value)
  const cohorts: ItpCohort[] = []
  for (const c of raw) {
    const co = asObject(c)
    if (!co) continue
    const doseNumber = asNumber(pick(co, 'dose', 'dosePpm', 'ppm', 'doseAsWritten'))
    const doseText = asString(pick(co, 'dose', 'dosePpm', 'ppm', 'doseAsWritten'))
    const dose =
      doseText && /[a-z]/i.test(doseText)
        ? doseText
        : doseNumber !== undefined
          ? `${doseNumber} ppm`
          : undefined
    const outcome = asString(pick(co, 'outcome', 'result'))
    const flagged = pick(co, 'lifespanExtension', 'extension', 'extended')
    const extension =
      typeof flagged === 'boolean'
        ? flagged
        : outcome
          ? EXTENSION_POSITIVE.test(outcome) && !EXTENSION_NEGATED.test(outcome)
          : false
    cohorts.push({
      ...(dose ? { dose } : {}),
      ...(asNumber(
        pick(co, 'ageAtStartMonths', 'ageMonths', 'ageAtStart', 'ageAtStartMonthsAsWritten'),
      ) !== undefined
        ? {
            ageAtStartMonths: String(
              asNumber(
                pick(
                  co,
                  'ageAtStartMonths',
                  'ageMonths',
                  'ageAtStart',
                  'ageAtStartMonthsAsWritten',
                ),
              ),
            ),
          }
        : {}),
      ...(readCohortSex(co) ? { sex: readCohortSex(co) } : {}),
      ...(outcome ? { outcome } : {}),
      extension,
    })
  }
  return { tested: tested === true, cohorts }
}

function sexList(cohorts: ItpCohort[]): string | undefined {
  let male = false
  let female = false
  for (const c of cohorts) {
    const s = normaliseName(c.sex ?? '')
    if (!s) continue
    if (s === 'both' || s === 'bothsexes' || s === 'mf' || s === 'malefemale') {
      male = true
      female = true
    } else if (s.startsWith('m')) male = true
    else if (s.startsWith('f')) female = true
  }
  if (male && female) return 'both sexes'
  if (male) return 'males'
  if (female) return 'females'
  return undefined
}

/* ------------------------------- DEVELOPMENT target, sponsor and mechanism readers ------- */

/**
 * Target names for the DEVELOPMENT templates. The Open Targets symbol is preferred because it is
 * the short name that source itself prints; the ChEMBL preferred name is the fallback. A bare
 * record id (`CHEMBL1234`, `ENSG00000089685`) is not a name — §Public copy — so a page whose target
 * resolves only to an id carries no target slot and its questions do not fire.
 */
export function readTargetNames(entry: FieldEntry | undefined): string[] {
  if (!entry || entry.state !== 'present') return []
  const v = asObject(entry.value)
  const out: string[] = []
  for (const t of asArray(v ? pick(v, 'openTargetsTargets') : undefined)) {
    const o = asObject(t)
    const symbol = asString(pick(o, 'symbol', 'approvedSymbol'))
    if (symbol) out.push(symbol)
  }
  for (const t of asArray(v ? pick(v, 'chemblTargets', 'targets') : entry.value)) {
    const o = asObject(t)
    const pref = asObject(pick(o, 'prefName'))
    const name = pref
      ? asString(pick(pref, 'prefName', 'name'))
      : asString(pick(o, 'prefName', 'name', 'target'))
    if (name) out.push(name)
    else {
      const plain = asString(t)
      if (plain) out.push(plain)
    }
  }
  return unique(out).filter((n) => !/^(?:CHEMBL\d+|ENSG\d+)$/i.test(n))
}

/** The registry's highest recorded phase as a bare number string, or undefined. */
export function readHighestPhase(entry: FieldEntry | undefined): string | undefined {
  if (!entry || entry.state !== 'present') return undefined
  const v = asObject(entry.value)
  const raw = v
    ? (pick(v, 'phase', 'maxPhase') ?? pick(asObject(pick(v, 'registry')), 'highestPhase', 'phase'))
    : entry.value
  const n = asNumber(raw)
  return n !== undefined ? String(n) : undefined
}

export interface SponsorRow {
  name: string
  studies?: number
  nct?: string
  sponsorClass?: string
}

/** Lead sponsors as the registry records them, deduplicated by name, order preserved. */
export function readSponsors(entry: FieldEntry | undefined): SponsorRow[] {
  if (!entry || entry.state !== 'present') return []
  const v = asObject(entry.value)
  const raw = v ? pick(v, 'registryLeadSponsors', 'leadSponsors', 'sponsors') : entry.value
  const out: SponsorRow[] = []
  const seen = new Set<string>()
  for (const item of asArray(raw)) {
    const o = asObject(item)
    const sponsorName = o ? asString(pick(o, 'name', 'sponsor', 'leadSponsor')) : asString(item)
    if (!sponsorName || seen.has(sponsorName)) continue
    seen.add(sponsorName)
    out.push({
      name: sponsorName,
      ...(asNumber(pick(o, 'studies')) !== undefined
        ? { studies: asNumber(pick(o, 'studies')) as number }
        : {}),
      ...(asString(pick(o, 'exampleNct', 'nct')) !== undefined
        ? { nct: asString(pick(o, 'exampleNct', 'nct')) as string }
        : {}),
      ...(asString(pick(o, 'leadSponsorClass', 'class')) !== undefined
        ? { sponsorClass: asString(pick(o, 'leadSponsorClass', 'class')) as string }
        : {}),
    })
  }
  return out
}

export interface MechanismRow {
  action?: string
  mechanism?: string
  targetId?: string
}

/** ChEMBL mechanism rows: the recorded action type and the mechanism sentence, verbatim. */
export function readMechanisms(entry: FieldEntry | undefined): MechanismRow[] {
  if (!entry || entry.state !== 'present') return []
  const v = asObject(entry.value)
  const raw = v ? (pick(v, 'mechanisms', 'chemblMechanisms') ?? entry.value) : entry.value
  const out: MechanismRow[] = []
  for (const item of asArray(raw)) {
    const o = asObject(item)
    if (!o) continue
    const action = asString(pick(o, 'actionType', 'action'))
    const mechanism = asString(pick(o, 'mechanismOfAction', 'mechanism', 'description'))
    if (!action && !mechanism) continue
    out.push({
      ...(action ? { action } : {}),
      ...(mechanism ? { mechanism } : {}),
      ...(asString(pick(o, 'targetChemblId')) !== undefined
        ? { targetId: asString(pick(o, 'targetChemblId')) as string }
        : {}),
    })
  }
  return out
}

/* --------------------------------------------------------- the templates */

export interface RegisterStatus {
  code: string
  status: string
  /** The register's own record ids for this jurisdiction, in the order it recorded them. */
  records: Array<{ register?: string; id?: string; date?: string; statement?: string }>
}

/**
 * Field 13 as the CLINICAL extractor records it: one entry per jurisdiction code carrying a status
 * and its register evidence. The reader splits the codes that hold a status from the codes that
 * record none, because the question needs the first and the block's qualification needs the second.
 * Nothing is inferred: a code whose status is "unknown" is unknown, not absent.
 */
export function readRegisterStatuses(entry: FieldEntry | undefined): {
  recorded: RegisterStatus[]
  unknown: string[]
  neverCleared: string[]
} {
  const recorded: RegisterStatus[] = []
  const unknown: string[] = []
  const neverCleared: string[] = []
  const value = asObject(entry?.value)
  if (!value) return { recorded, unknown, neverCleared }
  for (const [code, raw] of Object.entries(value)) {
    const o = asObject(raw)
    const status = asString(o ? pick(o, 'status') : raw)
    if (!status) continue
    if (status.toLowerCase() === 'unknown') {
      // A jurisdiction the extractor could consult and that answered nothing is not the same fact
      // as a jurisdiction whose register was never licensed for this corpus (UK, AU, JP, SG). The
      // second group carries the extractor's own note and no source, and is the same four codes on
      // every page: it is a property of the corpus, so it is stated once on /definitions and never
      // in a page's prose. Splitting it here is what lets the CLINICAL blocks name only the first.
      const cleared = asArray(pick(o, 'sources')).length > 0
      if (cleared) unknown.push(code)
      else neverCleared.push(code)
      continue
    }
    const records: RegisterStatus['records'] = []
    for (const e of asArray(pick(o, 'evidence', 'records'))) {
      const eo = asObject(e)
      if (!eo) continue
      records.push({
        ...(asString(pick(eo, 'register'))
          ? { register: asString(pick(eo, 'register')) as string }
          : {}),
        ...(asString(pick(eo, 'id', 'recordId'))
          ? { id: asString(pick(eo, 'id', 'recordId')) as string }
          : {}),
        ...(asString(pick(eo, 'sourceDate', 'date'))
          ? { date: asString(pick(eo, 'sourceDate', 'date')) as string }
          : {}),
        ...(asString(pick(eo, 'statement'))
          ? { statement: asString(pick(eo, 'statement')) as string }
          : {}),
      })
    }
    recorded.push({ code, status, records })
  }
  return { recorded, unknown, neverCleared }
}

/**
 * Block order, docs/specs/question-derivation.md §4. A page renders only the blocks it has, in this
 * precedence — never a fixed section order, and never a heading with nothing under it.
 */
export const BLOCK_ORDER = [
  'classification',
  'supervision',
  'indication',
  'human-data',
  'trial-history',
  'ladder',
  'itp',
  'withdrawn',
  'stopped',
  'dose-studied',
  'clocks',
  'dose-shape',
  'kinetics',
  'bioavailability',
  'n-of-1',
  'time-to-signal',
  'biomarkers',
  'ongoing',
  'what-would-settle',
  'unreported',
  'trial-size',
  'faers',
  'faers-unlisted',
  'interactions',
  'fasting-exercise',
  'pathway',
  'lineage',
  'regulatory-only',
  'jurisdiction',
  'contradiction',
  'provenance',
  'target-phase',
  'mechanism-action',
  'sponsor-phase',
  'development-stop',
  'never-dosed',
] as const

/** Every emitting template in the spec table. `stub` emits nothing and is not listed here. */
export const TEMPLATE_IDS = [
  'supervision',
  'classification',
  'human-data',
  'human-data-none',
  'ladder',
  'ladder-single',
  'itp',
  'itp-negative',
  'withdrawn',
  'stopped',
  'stopped-one',
  'dose-studied',
  'clocks',
  'dose-shape',
  'dose-shape-plateau',
  'kinetics',
  'bioavailability',
  'n-of-1',
  'time-to-signal',
  'biomarkers',
  'ongoing',
  'what-would-settle',
  'unreported',
  'trial-size',
  'faers',
  'faers-unlisted',
  'interactions',
  'fasting-exercise',
  'pathway',
  'lineage',
  'jurisdiction',
  'contradiction',
  'provenance',
  'indication',
  'regulatory-only',
  'trial-history',
  'target-phase',
  'mechanism-action',
  'sponsor-phase',
  'development-stop',
  'never-dosed',
] as const

export type TemplateId = (typeof TEMPLATE_IDS)[number]

interface Draft {
  block: string
  template: TemplateId
  text: string
  values: Record<string, string>
  sources: SourceRef[]
}

/**
 * Seeds 1, 2 and 6 are removed absolutely under R2 suppression, and a suppressed page always leads
 * with the supervision block (which is first in §4's order).
 */
const SUPPRESSED_BLOCKS = new Set(['bioavailability', 'n-of-1', 'time-to-signal'])

/**
 * A slot carries a source's own words, and a recorded value may contain one of the guarded words
 * (a label that prints "effective half-life", for example). The value is never rewritten and never
 * softened: the question is withheld instead, and the recorded value stays in the block's rows.
 */
export function deriveQuestionsAndWithheld(page: PageInput): {
  questions: QuestionBlock[]
  withheld: Array<{ template: string; word: string }>
} {
  const withheld: Array<{ template: string; word: string }> = []
  const questions = deriveQuestions(page, withheld)
  return { questions, withheld }
}

export function deriveQuestions(
  page: PageInput,
  withheld?: Array<{ template: string; word: string }>,
): QuestionBlock[] {
  if (isStub(page)) return []
  const p = normalisePage(page)
  const name = p.name
  const drafts: Draft[] = []

  const field = (id: FieldId): FieldEntry | undefined => p.fields.get(id)
  const present = (id: FieldId): FieldEntry | undefined => {
    const f = p.fields.get(id)
    return f && f.state === 'present' ? f : undefined
  }
  const seed = (id: string): SeedEntry | undefined => {
    const s = p.seeds.get(id)
    return s && s.fires === true ? s : undefined
  }
  const push = (
    block: string,
    template: TemplateId,
    text: string,
    values: Record<string, string>,
    sources: SourceRef[],
  ): void => {
    const guarded = findForbiddenWords(text)
    if (guarded.length > 0) {
      for (const word of guarded) withheld?.push({ template, word })
      return
    }
    drafts.push({ block, template, text, values, sources })
  }

  /* -- supervision / classification (suppressed) -------------------------- */
  /*
   * Gate 2 defect, fixed here: the supervision question asserts that a supervision requirement
   * exists and asks the reader why. That is a claim, and on an S10-only page there is no recorded
   * classification to support it — S10 is the class the suppression pass assigns when it could not
   * read one. Those pages ask what classification the record carries and answer that none is
   * recorded. A page holding any S1-S9 class keeps the supervision question, and its body quotes
   * the classification. Seeds 1, 2 and 6 stay suppressed either way: `p.suppressed` is unchanged.
   */
  if (p.suppressed) {
    const unknownClassOnly =
      p.suppressionClasses.length > 0 && p.suppressionClasses.every((code) => code === 'S10')
    if (unknownClassOnly) {
      push(
        'classification',
        'classification',
        `What classification does ${name} carry?`,
        { name },
        sourcesOf(present('regulatoryStatus')),
      )
    } else {
      push(
        'supervision',
        'supervision',
        `Why does ${name} carry a supervision requirement?`,
        { name },
        sourcesOf(present('regulatoryStatus'), present('withdrawalStatus')),
      )
    }
  }

  /* -- human-data / human-data-none -------------------------------------- */
  const ceiling = present('humanEvidenceCeiling')
  const ceilingValue = asObject(ceiling?.value)
  const largestN = asNumber(pick(ceilingValue, 'largestN', 'maxN', 'largestEnrolment'))
  const longestDays = durationDays(ceiling?.value)
  const longest = formatDuration(longestDays)
  const rungs = readRungs(field('organismLadder'))
  const topRung = rungs.length > 0 ? rungs[rungs.length - 1] : undefined
  const lowestRung = rungs.length > 0 ? rungs[0] : undefined
  if (ceiling && largestN !== undefined && longest) {
    push(
      'human-data',
      'human-data',
      `What did ${name}'s largest trial (${largestN} people) and its longest (${longest}) measure?`,
      { name, N: String(largestN), duration: longest },
      sourcesOf(ceiling),
    )
  } else if (!ceiling && topRung !== undefined) {
    if (organismRank(topRung.organism) !== ORGANISM_ORDER.length - 1) {
      push(
        'human-data',
        'human-data-none',
        `${name} has only ${topRung.organism} evidence — what kind?`,
        { name, organism: topRung.organism },
        sourcesOf(field('organismLadder')),
      )
    }
  }

  /* -- ladder / ladder-single -------------------------------------------- */
  if (rungs.length === 1 && topRung !== undefined) {
    push(
      'ladder',
      'ladder-single',
      // Repeated-frame audit: "'s only tested organism is" was five fixed words on 7.1 % of
      // indexed pages. The organism is the value, and it now sits inside every five-word window.
      `${name} was tested only in ${topRung.organism} — what did it show?`,
      { name, organism: topRung.organism },
      sourcesOf(field('organismLadder')),
    )
  } else if (rungs.length >= 2 && lowestRung !== undefined && topRung !== undefined) {
    const kind = strongestKind(rungs)
    if (kind) {
      const lowest = lowestRung.organism
      const highest = topRung.organism
      push(
        'ladder',
        'ladder',
        `From ${lowest} to ${highest}: where has ${name} shown ${kind}?`,
        { name, lowest, highest, kind },
        sourcesOf(field('organismLadder')),
      )
    }
  }

  /* -- itp / itp-negative ------------------------------------------------- */
  const itp = readItp(present('itp'))
  if (itp.tested && itp.cohorts.length > 0) {
    const doses = unique(itp.cohorts.map((c) => c.dose ?? '').filter(Boolean))
    const ages = unique(itp.cohorts.map((c) => c.ageAtStartMonths ?? '').filter(Boolean))
    const sexes = sexList(itp.cohorts)
    const doseText = joinList(doses)
    const ageText = joinList(ages)
    const anyExtension = itp.cohorts.some((c) => c.extension === true)
    // The workbooks print per-animal rows and no result sentence. "Showed no extension" is a
    // finding, so it is asked only where a cohort states an outcome and none of them states one.
    const anyOutcome = itp.cohorts.some((c) => c.outcome !== undefined)
    if (doseText && ageText && anyOutcome && !anyExtension) {
      push(
        'itp',
        'itp-negative',
        `Why did the ITP's ${name} cohorts (${doseText}, from ${ageText} months) show no extension?`,
        { name, dose: doseText, age: ageText },
        sourcesOf(present('itp')),
      )
    } else if (doseText && ageText && sexes) {
      push(
        'itp',
        'itp',
        `The NIA ITP gave ${name} at ${doseText} from ${ageText} months — did ${sexes} live longer?`,
        { name, dose: doseText, age: ageText, sexList: sexes },
        sourcesOf(present('itp')),
      )
    }
  }

  /* -- withdrawn ---------------------------------------------------------- */
  const withdrawal = present('withdrawalStatus')
  if (p.model === 'CLINICAL' && withdrawal) {
    const w = asObject(withdrawal.value)
    const isWithdrawn = pick(w, 'withdrawn') !== false
    const approvalYear =
      year(pick(w, 'approvalYear', 'approvedYear', 'approvalDate', 'firstApproval')) ??
      year(pick(asObject(present('regulatoryStatus')?.value), 'approvalDate', 'approvalYear')) ??
      earliestApprovalYear(present('approvalDate')) ??
      year(pick(asObject(seed('seed8')?.values), 'firstApprovalYear', 'firstApproval'))
    const withdrawalYear = year(
      pick(w, 'date', 'withdrawalYear', 'withdrawnYear', 'withdrawalDate'),
    )
    const jurisdictions = unique(
      asArray(pick(w, 'jurisdictions', 'jurisdiction'))
        .map((j) => asString(asObject(j) ? pick(asObject(j), 'jurisdiction', 'name', 'code') : j))
        .filter((j): j is string => Boolean(j)),
    )
    if (isWithdrawn && approvalYear && withdrawalYear && jurisdictions.length > 0) {
      const list = joinList(jurisdictions)
      push(
        'withdrawn',
        'withdrawn',
        `Approved in ${approvalYear}, withdrawn in ${withdrawalYear}: what happened to ${name} in ${list}?`,
        { name, approvalYear, withdrawalYear, jurisdictions: list },
        sourcesOf(withdrawal),
      )
    }
  }

  /* -- stopped / stopped-one ---------------------------------------------- */
  const failures = present('trialFailures')
  const failureList = failures ? asArray(failures.value) : []
  const seed3 = seed('seed3')
  if (seed3) {
    const s3 = asObject(seed3.values)
    const clusters = unique(
      asArray(pick(s3, 'reasonList', 'clusters', 'reasons', 'reasonClusters'))
        .map((c) => asString(asObject(c) ? pick(asObject(c), 'cluster', 'reason', 'name') : c))
        .filter((c): c is string => Boolean(c)),
    )
    const n =
      asNumber(pick(s3, 'stoppedTrials', 'count', 'n')) ??
      (failureList.length > 0 ? failureList.length : undefined)
    if (n !== undefined && clusters.length > 0) {
      push(
        'stopped',
        'stopped',
        `${n} of ${name}'s trials stopped: ${joinPlain(clusters)}?`,
        { name, n: String(n), reasonList: joinPlain(clusters) },
        [...sourcesOf(failures), ...seedSources(seed3.values)],
      )
    }
  } else if (failureList.length === 1) {
    const f0 = asObject(failureList[0])
    const nct = asString(pick(f0, 'nct', 'nctId', 'id'))
    if (nct) {
      push(
        'stopped',
        'stopped-one',
        `Why did ${name}'s trial ${nct} stop?`,
        { name, NCT: nct },
        sourcesOf(failures),
      )
    }
  }

  /* -- dose-studied -------------------------------------------------------- */
  const studied = present('doseStudied')
  if (studied) {
    // One recorded dose text with its own organism; a list keeps its first entry so the sentence
    // never mixes an organism from one record with a dose text from another.
    const first = asArray(studied.value)
      .map(asObject)
      .find((o) => o !== undefined)
    const d = asObject(studied.value) ?? first
    const doseText = asString(d ? pick(d, 'dose', 'doseText', 'text', 'value') : studied.value)
    const organism = asString(d ? pick(d, 'organism', 'species') : undefined) ?? topRung?.organism
    if (doseText && organism) {
      push(
        'dose-studied',
        'dose-studied',
        `${sentenceCase(organism)} studies of ${name} used ${doseText} — over how long?`,
        { name, organism, dose: doseText },
        sourcesOf(studied),
      )
    }
  }

  /* -- clocks --------------------------------------------------------------- */
  const clocks = present('epigeneticClocks')
  if (clocks) {
    const list = asArray(
      asObject(clocks.value) ? pick(asObject(clocks.value), 'clocks') : clocks.value,
    )
    const first = list
      .map((c) => asString(asObject(c) ? pick(asObject(c), 'clock', 'name') : c))
      .find((c): c is string => Boolean(c))
    if (first) {
      push(
        'clocks',
        'clocks',
        `Did ${name} move ${first}, and by how much?`,
        { name, clock: first },
        sourcesOf(clocks),
      )
    }
  }

  /* -- dose-shape / plateau -------------------------------------------------- */
  const shapeField = present('doseResponseShape')
  if (shapeField) {
    const s = asObject(shapeField.value)
    const shape = normaliseName(asString(s ? pick(s, 'shape') : shapeField.value) ?? '')
    const organism = asString(s ? pick(s, 'organism', 'species') : undefined) ?? topRung?.organism
    if (organism && (shape === 'hormetic' || shape === 'ushaped' || shape === 'u')) {
      push(
        'dose-shape',
        'dose-shape',
        `More ${name} was worse in ${organism}: at what point?`,
        { name, organism },
        sourcesOf(shapeField),
      )
    } else if (organism && shape === 'plateau') {
      push(
        'dose-shape',
        'dose-shape-plateau',
        `Where did ${name}'s effect in ${organism} stop rising?`,
        { name, organism },
        sourcesOf(shapeField),
      )
    }
  }

  /* -- kinetics -------------------------------------------------------------- */
  const kinetics = present('kinetics')
  if (kinetics) {
    const k = asObject(kinetics.value)
    const hl = k ? pick(k, 'halfLife', 'half_life', 't12') : undefined
    const hlObj = asObject(hl)
    const hlValue = hlObj ? asString(pick(hlObj, 'value')) : undefined
    const hlUnit = hlObj ? asString(pick(hlObj, 'unit')) : undefined
    // The label sentence is often recorded as "6 to 9" + "days", but sometimes as "20 to 50 hours"
    // with the same unit alongside it; a value that already ends in its unit is used as it stands.
    const joined =
      hlValue !== undefined && hlUnit !== undefined
        ? new RegExp(`\\b${hlUnit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(hlValue)
          ? hlValue
          : `${hlValue} ${hlUnit}`
        : (hlValue ?? hlUnit)
    const halfLife = hlObj ? (joined ?? asString(pick(hlObj, 'verbatim'))) : asString(hl)
    if (halfLife) {
      push(
        'kinetics',
        'kinetics',
        `${name}'s half-life is ${halfLife} — which schedules were studied?`,
        { name, halfLife },
        sourcesOf(kinetics),
      )
    }
  }

  /* -- bioavailability (seed 1) ---------------------------------------------- */
  const seed1 = seed('seed1')
  if (seed1) {
    const v = asObject(seed1.values)
    const route = asString(pick(v, 'route', 'studyRoute'))
    const organism = asString(pick(v, 'organism', 'species'))
    if (route && organism) {
      push(
        'bioavailability',
        'bioavailability',
        `${name} worked by ${route} in ${organism} — what about oral?`,
        { name, route, organism },
        [...seedSources(seed1.values), ...sourcesOf(kinetics)],
      )
    }
  }

  /* -- n-of-1 (seed 2) -------------------------------------------------------- */
  const seed2 = seed('seed2')
  if (seed2) {
    const v = asObject(seed2.values)
    const biomarker =
      asString(pick(v, 'biomarker')) ??
      asArray(pick(v, 'biomarkers'))
        .map((b) => asString(asObject(b) ? pick(asObject(b), 'term', 'name') : b))
        .find((b): b is string => Boolean(b))
    if (biomarker) {
      push(
        'n-of-1',
        'n-of-1',
        `Could one person measure ${name}'s effect on ${biomarker}?`,
        { name, biomarker },
        seedSources(seed2.values),
      )
    }
  }

  /* -- time-to-signal (seed 6) ------------------------------------------------ */
  const seed6 = seed('seed6')
  if (seed6) {
    const endpoint = asString(pick(asObject(seed6.values), 'endpoint', 'primaryEndpoint'))
    if (endpoint) {
      push(
        'time-to-signal',
        'time-to-signal',
        `How long did trials of ${name} run before an effect on ${endpoint}?`,
        { name, endpoint },
        seedSources(seed6.values),
      )
    }
  }

  /* -- biomarkers ------------------------------------------------------------- */
  const biomarkersField = present('biomarkersMeasured')
  if (biomarkersField) {
    const raw = asArray(
      asObject(biomarkersField.value)
        ? pick(asObject(biomarkersField.value), 'terms', 'biomarkers')
        : biomarkersField.value,
    )
    const terms = raw
      .map((t) => {
        const o = asObject(t)
        return {
          term: o ? asString(pick(o, 'term', 'name')) : asString(t),
          count: o ? (asNumber(pick(o, 'count', 'trials', 'n')) ?? 0) : 0,
        }
      })
      .filter((t): t is { term: string; count: number } => Boolean(t.term))
    if (terms.length >= 3) {
      // Top three by recorded frequency; ties resolve alphabetically so the run is reproducible.
      const [term1, term2, term3] = [...terms]
        .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
        .slice(0, 3)
        .map((t) => t.term)
      if (term1 !== undefined && term2 !== undefined && term3 !== undefined) {
        push(
          'biomarkers',
          'biomarkers',
          `Which of ${term1}, ${term2} and ${term3} did ${name}'s trials measure?`,
          { name, term1, term2, term3 },
          sourcesOf(biomarkersField),
        )
      }
    }
  }

  /* -- ongoing ---------------------------------------------------------------- */
  const ongoing = present('ongoingTrials')
  if (ongoing) {
    const list = asArray(
      asObject(ongoing.value) ? pick(asObject(ongoing.value), 'trials') : ongoing.value,
    )
    const n = list.length > 0 ? list.length : asNumber(pick(asObject(ongoing.value), 'count', 'n'))
    if (n !== undefined && n >= 1) {
      const text =
        n === 1
          ? `What will the one ongoing trial of ${name} report, and when?`
          : `Which of ${name}'s ${n} ongoing trials reports first?`
      push('ongoing', 'ongoing', text, { name, n: String(n) }, sourcesOf(ongoing))
    }
  }

  /* -- what-would-settle (seed 9) ---------------------------------------------- */
  const seed9 = seed('seed9')
  if (seed9) {
    const endpoint = asString(pick(asObject(seed9.values), 'endpoint', 'primaryEndpoint'))
    if (endpoint) {
      push(
        'what-would-settle',
        'what-would-settle',
        // "Which running trial could settle" was five fixed words on 15.2 % of indexed pages.
        `Which running trial of ${name} could settle ${endpoint}?`,
        { name, endpoint },
        [...seedSources(seed9.values), ...sourcesOf(ongoing)],
      )
    }
  }

  /* -- unreported (seed 12) ----------------------------------------------------- */
  const seed12 = seed('seed12')
  if (seed12) {
    const v = asObject(seed12.values)
    const n =
      asNumber(pick(v, 'count', 'n', 'unreported')) ??
      (asArray(pick(v, 'trials')).length || undefined)
    if (n !== undefined && n >= 1) {
      // "Completed but unreported: which one of" was six fixed words on 8.8 % of indexed pages.
      // The count and the compound now break every five-word window, and "posted no result" — the
      // registry's own sense, not a publication claim — is three words at the end.
      const text =
        n === 1
          ? `Which one trial of ${name} posted no result?`
          : `Which ${n} trials of ${name} posted no result?`
      push('unreported', 'unreported', text, { name, n: String(n) }, seedSources(seed12.values))
    }
  }

  /* -- trial-size (seed 16) ------------------------------------------------------ */
  const seed16 = seed('seed16')
  if (seed16) {
    const median = asNumber(pick(asObject(seed16.values), 'median', 'medianN'))
    if (median !== undefined) {
      push(
        'trial-size',
        'trial-size',
        `At the median, ${name}'s trials enrolled ${median} people — anything larger?`,
        { name, median: String(median) },
        seedSources(seed16.values),
      )
    }
  }

  /* -- evidence-age (seed 15): no block ---------------------------------------------
   * docs/specs/derived-content.md seed 15, amended 2026-09-04: seed 15 is a VALUE, not a block. As
   * a block it fired on 81% of indexed pages with a standing second paragraph and standing rows,
   * which is what the Gate 1b re-measure recorded as the whole of the regression (0.2493 against a
   * 0.20 target). Its year and record now render inside the human-data block's second paragraph
   * (scripts/corpus-20k/render/page-text.ts), so no question is derived for it here.
   */

  /* -- faers ----------------------------------------------------------------------- */
  const faers = present('faersSignal')
  if (faers) {
    const f = asObject(faers.value)
    const terms = asArray(f ? pick(f, 'terms', 'reactions') : faers.value)
    const total =
      asNumber(pick(f, 'totalReports', 'reports', 'count', 'n')) ??
      (terms.length > 0
        ? terms.reduce(
            (sum: number, t) =>
              sum + (asNumber(pick(asObject(t), 'count', 'reportCount', 'reports', 'n')) ?? 0),
            0,
          )
        : undefined)
    if (total !== undefined && total > 0) {
      push(
        'faers',
        'faers',
        `What do ${total} spontaneous reports say about ${name} — and not say?`,
        { name, n: String(total) },
        sourcesOf(faers),
      )
    }
  }

  /* -- faers-unlisted (seed 14) ------------------------------------------------------ */
  const seed14 = seed('seed14')
  if (seed14) {
    // "Which reported reactions are missing from" was six fixed words on 16.5 % of indexed pages.
    // Seed 14 already records how many reactions the difference holds, so the count leads and no
    // run of fixed words reaches five.
    const unlistedCount =
      asNumber(pick(asObject(seed14.values), 'n', 'count')) ||
      asArray(pick(asObject(seed14.values), 'reportedNotOnLabel', 'terms')).length ||
      undefined
    push(
      'faers-unlisted',
      'faers-unlisted',
      unlistedCount === undefined
        ? `Which reactions does ${name}'s label not list?`
        : unlistedCount === 1
          ? `Which reaction does ${name}'s label not list?`
          : `Which ${unlistedCount} reactions does ${name}'s label not list?`,
      { name, ...(unlistedCount !== undefined ? { n: String(unlistedCount) } : {}) },
      [
        ...seedSources(p.seeds.get('seed14')?.values),
        ...sourcesOf(faers, present('adverseEvents')),
      ],
    )
  }

  /* -- interactions and fasting-exercise ---------------------------------------------- */
  const interactions = present('interactions')
  if (interactions) {
    const i = asObject(interactions.value)
    const interactionNames = readInteractionNames(interactions)
    const enzymes = interactionNames.all
    const cypOnly = interactionNames.cyps
    if (cypOnly.length > 0) {
      // At most three named, as field 12 does with its biomarker terms; the rest are in the rows.
      const named = (enzymes.length > 0 ? enzymes : cypOnly).slice(0, 3)
      const list = joinList(named)
      push(
        'interactions',
        'interactions',
        `${name} and ${list}: shared by which compounds?`,
        { name, enzymeList: list },
        sourcesOf(interactions),
      )
    }
    const modifiers: string[] = []
    const hasModifier = (v: unknown): boolean => {
      const o = asObject(v)
      if (o) return Boolean(asString(pick(o, 'statement', 'value', 'verbatim')))
      return Boolean(asString(v))
    }
    if (hasModifier(pick(i, 'fasting'))) modifiers.push('fasting')
    if (hasModifier(pick(i, 'caloricRestriction', 'caloric_restriction')))
      modifiers.push('caloric restriction')
    if (hasModifier(pick(i, 'exercise'))) modifiers.push('exercise')
    if (modifiers.length > 0) {
      const list = joinList(modifiers)
      push(
        'fasting-exercise',
        'fasting-exercise',
        `Was ${name} studied with ${list}?`,
        { name, modifiers: list },
        sourcesOf(interactions),
      )
    }
  }

  /* -- pathway -------------------------------------------------------------------------- */
  const pathways = present('pathways')
  if (pathways) {
    const list = asArray(
      asObject(pathways.value) ? pick(asObject(pathways.value), 'pathways') : pathways.value,
    )
    const first = list
      .map((x) => asString(asObject(x) ? pick(asObject(x), 'pathway', 'name') : x))
      .find((x): x is string => Boolean(x))
    if (first) {
      push(
        'pathway',
        'pathway',
        // "What does the source state about" was six fixed words on 10.0 % of indexed pages.
        `What is recorded about ${name} and ${first}?`,
        { name, pathway: first },
        sourcesOf(pathways),
      )
    }
  }

  /* -- lineage (seed 13) ------------------------------------------------------------------ */
  const seed13 = seed('seed13')
  if (seed13) {
    const v = asObject(seed13.values)
    const targetRaw = asString(pick(v, 'target', 'targetSymbol'))
    // §Public copy: a record id is not a name. Where the seed resolved no symbol, the slot has no
    // value and the question does not fire.
    const target = targetRaw !== undefined && /^CHEMBL\d+$/i.test(targetRaw) ? undefined : targetRaw
    const n =
      asNumber(pick(v, 'others', 'otherCount', 'n', 'count')) ??
      (asArray(pick(v, 'compounds', 'others')).length || undefined)
    if (target && n !== undefined && n >= 1) {
      const text =
        n === 1
          ? `What became of the other compound aimed at ${target}?`
          : `What became of the other ${n} compounds aimed at ${target}?`
      push('lineage', 'lineage', text, { name, n: String(n), target }, seedSources(seed13.values))
    }
  }

  /* -- jurisdiction (seed 17) --------------------------------------------------------------- */
  const seed17 = seed('seed17')
  if (seed17) {
    const v = asObject(seed17.values)
    const raw = pick(v, 'jurisdictions', 'statuses')
    const rawObject = asObject(raw)
    const jurisdictions = unique(
      rawObject
        ? Object.keys(rawObject)
        : asArray(raw)
            .map((j) =>
              asString(asObject(j) ? pick(asObject(j), 'jurisdiction', 'code', 'name') : j),
            )
            .filter((j): j is string => Boolean(j)),
    )
    if (jurisdictions.length >= 2) {
      const list = joinList(jurisdictions)
      push(
        'jurisdiction',
        'jurisdiction',
        `Drug, supplement or controlled: what is ${name} in ${list}?`,
        { name, jurisdictions: list },
        [...seedSources(seed17.values), ...sourcesOf(present('regulatoryStatus'))],
      )
    }
  }

  /* -- contradiction (seed 10) ---------------------------------------------------------------- */
  if (seed('seed10')) {
    push(
      'contradiction',
      'contradiction',
      `Where do the label and the trials disagree about ${name}?`,
      { name },
      seedSources(p.seeds.get('seed10')?.values),
    )
  }

  /* -- provenance (seed 8) ---------------------------------------------------------------------- */
  const seed8 = seed('seed8')
  if (seed8) {
    const v = asObject(seed8.values)
    const firstYear = year(
      pick(v, 'firstYear', 'firstEventYear', 'firstPublicationYear', 'firstEvent'),
    )
    const currentState = asString(pick(v, 'currentState', 'current', 'state'))
    if (firstYear && currentState) {
      push(
        'provenance',
        'provenance',
        `How did ${name} get from ${firstYear} to ${currentState}?`,
        { name, firstYear, currentState },
        seedSources(seed8.values),
      )
    }
  }

  /* -- CLINICAL: indication, regulatory-only, trial-history ------------------------------------ */
  /**
   * Added 2026-09-04 (Phase 2c), docs/specs/question-derivation.md "CLINICAL and DEVELOPMENT
   * additions". A CLINICAL page carries a label indication, a register set and a registry trial
   * count, and none of the LONGEVITY blocks read any of them, so most of Tier 2 asked one question
   * or none. Each fires only when every value it names is recorded.
   *
   * Two deviations from the wording in the spec table, both forced by the tail amendment (a
   * template's value-free tail after its last slot is at most four words, or every page carrying
   * the template shares a five-gram with every other):
   *   - "{name} on its label: approved for what?" has a six-word tail. "On the {name} label:
   *     indicated for what?" has four, and "indicated" is the label section's own word where
   *     "approved" is not — an OTC monograph indication is not an approval. The possessive form
   *     ("On {name}'s label") counts the bare "s" as a fifth tail word, so the article is used.
   *   - "{name} has {n} registered trials — at which phases?" has a five-word tail. Putting the
   *     count first leaves three and obeys the values-early principle (§Principles 3).
   */
  const isClinical = p.model === 'CLINICAL'

  const indication = present('indication')
  const indicationStatement = asString(
    pick(asObject(indication?.value), 'statement', 'text', 'indication'),
  )
  if (isClinical && indication && indicationStatement) {
    push(
      'indication',
      'indication',
      `On the ${name} label: indicated for what?`,
      { name },
      sourcesOf(indication),
    )
  }

  const registers = present('regulatoryStatus')
  const registerStatuses = readRegisterStatuses(registers)
  if (isClinical && registers && !indication && registerStatuses.recorded.length > 0) {
    push(
      'regulatory-only',
      'regulatory-only',
      `Where is ${name} approved?`,
      { name },
      sourcesOf(registers),
    )
  }

  const trialHistory = present('trialHistory')
  const trialHistoryValue = asObject(trialHistory?.value)
  const registeredStudies = asNumber(
    pick(trialHistoryValue, 'registeredStudies', 'studies', 'count'),
  )
  const byPhase = asObject(pick(trialHistoryValue, 'byPhase'))
  // "no human-data block": the trigger in the spec table. The human-data block reads field 5, which
  // the CLINICAL extractor does not fill; where it did fire, this question would repeat it.
  const hasHumanData = drafts.some((d) => d.block === 'human-data')
  if (
    isClinical &&
    trialHistory &&
    !hasHumanData &&
    registeredStudies !== undefined &&
    registeredStudies > 0 &&
    byPhase !== undefined &&
    Object.keys(byPhase).length > 0
  ) {
    push(
      'trial-history',
      'trial-history',
      registeredStudies === 1
        ? `1 registered trial of ${name} — at which phase?`
        : `${registeredStudies} registered trials of ${name} — at which phases?`,
      { name, n: String(registeredStudies) },
      sourcesOf(trialHistory),
    )
  }

  /* -- DEVELOPMENT: target-phase, mechanism-action, sponsor-phase ------------------------------ */
  /**
   * Added 2026-09-04 (Phase 2c). 1,682 non-stub DEVELOPMENT pages carried sponsor, target or
   * mechanism and nothing else, so they asked no question at all. These three read exactly those
   * fields. Each fires only when every value it names is recorded.
   */
  const targetEntry = present('molecularTarget')
  const targetNames = readTargetNames(targetEntry)
  const phaseEntry = present('highestPhase')
  const highestPhase = readHighestPhase(phaseEntry)
  const stopEntry = present('whyDevelopmentStopped')
  const isDevelopment = p.model === 'DEVELOPMENT'

  if (isDevelopment && targetNames[0] !== undefined && highestPhase !== undefined && !stopEntry) {
    push(
      'target-phase',
      'target-phase',
      `${name}, aimed at ${targetNames[0]}: reached which phase?`,
      { name, target: targetNames[0] },
      sourcesOf(targetEntry, phaseEntry),
    )
  }

  const mechanismEntry = present('mechanismClass')
  const mechanisms = readMechanisms(mechanismEntry)
  if (isDevelopment && mechanisms.length > 0 && targetNames[0] !== undefined) {
    push(
      'mechanism-action',
      'mechanism-action',
      `${name} on ${targetNames[0]}: which action is recorded?`,
      { name, target: targetNames[0] },
      sourcesOf(mechanismEntry, targetEntry),
    )
  }

  const sponsorEntry = present('sponsor')
  const sponsors = readSponsors(sponsorEntry)
  if (isDevelopment && sponsors.length > 0 && highestPhase !== undefined) {
    // Deviation recorded 2026-09-04: the wording handed to this executor was "Who took {name} to
    // phase {phase}?". "took" is inside the hard guard's take-family pattern
    // (docs/specs/derived-content.md, "Words that never appear in derived text"), so that string is
    // withheld on every page it would fire on. "carried" keeps the sense, the slots and the empty
    // tail, and passes the guard.
    push(
      'sponsor-phase',
      'sponsor-phase',
      sponsors.length === 1
        ? `Who carried ${name} to phase ${highestPhase}?`
        : `Who carried ${name} to phase ${highestPhase}, and who else?`,
      { name, phase: highestPhase },
      sourcesOf(sponsorEntry, phaseEntry),
    )
  }

  /* -- development-stop --------------------------------------------------------------------------- */
  const whyStopped = present('whyDevelopmentStopped')
  if (p.model === 'DEVELOPMENT' && whyStopped) {
    const phaseField = present('highestPhase')
    const phaseValue = asObject(phaseField?.value)
    const phase = asString(
      asNumber(
        phaseValue
          ? (pick(phaseValue, 'phase', 'maxPhase') ??
              pick(asObject(pick(phaseValue, 'registry')), 'highestPhase', 'phase'))
          : phaseField?.value,
      ),
    )
    if (phase) {
      push(
        'development-stop',
        'development-stop',
        `Development of ${name} stopped at phase ${phase} — why?`,
        { name, phase },
        sourcesOf(whyStopped, phaseField),
      )
    }
  }

  /* -- never-dosed ----------------------------------------------------------------------------------- */
  const everDosed = present('everDosedInHumans')
  if (p.model === 'DEVELOPMENT' && everDosed) {
    const e = asObject(everDosed.value)
    const flag = e ? pick(e, 'bool', 'everDosed', 'everDosedInHumans', 'value') : everDosed.value
    if (flag === false) {
      push(
        'never-dosed',
        'never-dosed',
        `Has ${name} ever reached a person?`,
        { name },
        sourcesOf(everDosed),
      )
    }
  }

  /* -- suppression, one-per-block, §4 order ---------------------------------------------------------- */
  const kept = new Map<string, Draft>()
  for (const d of drafts) {
    if (p.suppressed && SUPPRESSED_BLOCKS.has(d.block)) continue
    if (!kept.has(d.block)) kept.set(d.block, d)
  }
  const ordered = [...kept.values()].sort(
    (a, b) =>
      BLOCK_ORDER.indexOf(a.block as (typeof BLOCK_ORDER)[number]) -
      BLOCK_ORDER.indexOf(b.block as (typeof BLOCK_ORDER)[number]),
  )
  return ordered.map((d, i) => ({
    id: d.template,
    text: d.text,
    badge: `Q${i + 1}`,
    block: d.block,
    template: d.template,
    values: d.values,
    sources: d.sources,
  }))
}

/* --------------------------------------------------- forbidden word check */

/**
 * docs/specs/derived-content.md, hard guard: "Words that never appear in derived text: take, dose
 * (as a verb), start, try, protocol, recommended, should, safe, effective, optimal." A hit fails the
 * run. "dose" as a noun is allowed (the ITP template carries a recorded dose); the verb forms and
 * bare "doses" are not. "safety" and "efficacy" are permitted: they are the registry's own
 * stop-reason cluster words, not the promotional adjectives the guard names.
 */
export const FORBIDDEN_WORDS = [
  'take',
  'dose (as a verb)',
  'start',
  'try',
  'protocol',
  'recommended',
  'should',
  'safe',
  'effective',
  'optimal',
] as const

const FORBIDDEN_PATTERNS: Array<{ word: string; test: RegExp }> = [
  { word: 'take', test: /\b(?:take|takes|taking|taken|took)\b/i },
  { word: 'start', test: /\b(?:start|starts|starting|started)\b/i },
  { word: 'try', test: /\b(?:try|tries|trying|tried)\b/i },
  { word: 'protocol', test: /\bprotocols?\b/i },
  { word: 'recommended', test: /\brecommend(?:s|ed|ing|ation|ations)?\b/i },
  { word: 'should', test: /\bshould\b/i },
  { word: 'safe', test: /\bsafe(?:ly)?\b/i },
  { word: 'effective', test: /\beffective(?:ly)?\b/i },
  { word: 'optimal', test: /\boptimal(?:ly)?\b/i },
]

const DOSE_VERB_TRIGGERS = new Set([
  'to',
  'will',
  'would',
  'shall',
  'can',
  'could',
  'may',
  'might',
  'must',
  'should',
  'let',
  'never',
  'always',
  'not',
  'you',
  'we',
  'they',
  'i',
])

const DOSE_NOUN_DETERMINERS = new Set([
  'the',
  'a',
  'an',
  'its',
  'his',
  'her',
  'their',
  'these',
  'those',
  'both',
  'all',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'multiple',
  'repeated',
  'separate',
  'several',
  'higher',
  'lower',
  'daily',
  'oral',
])

/** Returns every forbidden word found in `text`, empty when the text is clean. */
export function findForbiddenWords(text: string): string[] {
  const hits: string[] = []
  for (const { word, test } of FORBIDDEN_PATTERNS) if (test.test(text)) hits.push(word)
  const words = text.toLowerCase().match(/[a-z0-9'’-]+/g) ?? []
  for (let i = 0; i < words.length; i += 1) {
    const w = words[i]
    const prev = i > 0 ? words[i - 1] : undefined
    const isVerb =
      w === 'dosed' ||
      w === 'dosing' ||
      (w === 'dose' && prev !== undefined && DOSE_VERB_TRIGGERS.has(prev)) ||
      (w === 'doses' &&
        !(prev !== undefined && (DOSE_NOUN_DETERMINERS.has(prev) || /^\d/.test(prev))))
    if (isVerb) {
      hits.push('dose (as a verb)')
      break
    }
  }
  return unique(hits)
}

/* ---------------------------------------------------------------- metrics */

export interface PageQuestions {
  key: string
  questions: QuestionBlock[]
  stub?: boolean
  presentFields?: number
  /** Recorded on a stub so the page-text step can render the right supervision line, or none. */
  suppressionClasses?: string[]
  /** Blocks not asked because a recorded value carries a guarded word. */
  withheld?: Array<{ template: string; word: string }>
}

/** Word five-grams of one question, lower-cased and stripped of punctuation. */
export function fiveGrams(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? []
  const out: string[] = []
  for (let i = 0; i + 5 <= words.length; i += 1) out.push(words.slice(i, i + 5).join(' '))
  return out
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface Metrics {
  pages: { total: number; withQuestions: number; stub: number }
  questions: { total: number; meanPerPage: number; distinctStrings: number }
  mostRepeatedString: { text: string; pages: number; share: number } | null
  mostRepeatedTemplate: { template: string; pages: number; share: number } | null
  templates: Record<string, number>
  blocks: Record<string, number>
  fiveGramOverlap: {
    pairsRequested: number
    pairsSampled: number
    seed: number
    meanJaccard: number
    meanContainment: number
    maxJaccard: number
    pairsSharingAnyFiveGram: number
  } | null
  r7: { mostRepeatedStringShare: number; threshold: number; pass: boolean }
  forbiddenWords: {
    questionsChecked: number
    violations: Array<{ key: string; word: string; text: string }>
    blocksWithheld: number
    withheldByTemplate: Record<string, number>
  }
}

export function computeMetrics(
  pages: PageQuestions[],
  options: { pairs?: number; seed?: number } = {},
): Metrics {
  const pairsRequested = options.pairs ?? 2000
  const rngSeed = options.seed ?? 20260904
  const total = pages.length
  const stringPages = new Map<string, number>()
  const templatePages = new Map<string, number>()
  const blockPages = new Map<string, number>()
  const violations: Array<{ key: string; word: string; text: string }> = []
  let questionCount = 0
  let withQuestions = 0
  let stub = 0
  let blocksWithheld = 0
  const withheldByTemplate = new Map<string, number>()

  for (const page of pages) {
    for (const w of page.withheld ?? []) {
      blocksWithheld += 1
      withheldByTemplate.set(w.template, (withheldByTemplate.get(w.template) ?? 0) + 1)
    }
    if (page.stub) stub += 1
    if (page.questions.length > 0) withQuestions += 1
    const seenStrings = new Set<string>()
    const seenTemplates = new Set<string>()
    const seenBlocks = new Set<string>()
    for (const q of page.questions) {
      questionCount += 1
      for (const word of findForbiddenWords(q.text)) {
        violations.push({ key: page.key, word, text: q.text })
      }
      if (!seenStrings.has(q.text)) {
        seenStrings.add(q.text)
        stringPages.set(q.text, (stringPages.get(q.text) ?? 0) + 1)
      }
      if (!seenTemplates.has(q.template)) {
        seenTemplates.add(q.template)
        templatePages.set(q.template, (templatePages.get(q.template) ?? 0) + 1)
      }
      if (!seenBlocks.has(q.block)) {
        seenBlocks.add(q.block)
        blockPages.set(q.block, (blockPages.get(q.block) ?? 0) + 1)
      }
    }
  }

  const topString = [...stringPages.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )[0]
  const topTemplate = [...templatePages.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )[0]
  const share = (n: number): number => (total > 0 ? Number((n / total).toFixed(6)) : 0)

  // Five-gram overlap between the question sets of random page pairs (spec §Anti-repetition).
  const grammed = pages
    .filter((p) => p.questions.length > 0)
    .map((p) => {
      const set = new Set<string>()
      for (const q of p.questions) for (const g of fiveGrams(q.text)) set.add(g)
      return set
    })
    .filter((s) => s.size > 0)
  let overlap: Metrics['fiveGramOverlap'] = null
  if (grammed.length >= 2) {
    const rng = mulberry32(rngSeed)
    let jaccardSum = 0
    let containmentSum = 0
    let maxJaccard = 0
    let sharing = 0
    let sampled = 0
    for (let i = 0; i < pairsRequested; i += 1) {
      const a = Math.floor(rng() * grammed.length)
      let b = Math.floor(rng() * grammed.length)
      if (b === a) b = (b + 1) % grammed.length
      const A = grammed[a]
      const B = grammed[b]
      if (A === undefined || B === undefined) continue
      let inter = 0
      for (const g of A) if (B.has(g)) inter += 1
      const union = A.size + B.size - inter
      const jaccard = union > 0 ? inter / union : 0
      const containment = inter / Math.min(A.size, B.size)
      jaccardSum += jaccard
      containmentSum += containment
      if (jaccard > maxJaccard) maxJaccard = jaccard
      if (inter > 0) sharing += 1
      sampled += 1
    }
    overlap = {
      pairsRequested,
      pairsSampled: sampled,
      seed: rngSeed,
      meanJaccard: Number((jaccardSum / sampled).toFixed(6)),
      meanContainment: Number((containmentSum / sampled).toFixed(6)),
      maxJaccard: Number(maxJaccard.toFixed(6)),
      pairsSharingAnyFiveGram: sharing,
    }
  }

  const topShare = topString ? share(topString[1]) : 0
  return {
    pages: { total, withQuestions, stub },
    questions: {
      total: questionCount,
      meanPerPage: total > 0 ? Number((questionCount / total).toFixed(4)) : 0,
      distinctStrings: stringPages.size,
    },
    mostRepeatedString: topString
      ? { text: topString[0], pages: topString[1], share: topShare }
      : null,
    mostRepeatedTemplate: topTemplate
      ? { template: topTemplate[0], pages: topTemplate[1], share: share(topTemplate[1]) }
      : null,
    templates: Object.fromEntries([...templatePages.entries()].sort((a, b) => b[1] - a[1])),
    blocks: Object.fromEntries([...blockPages.entries()].sort((a, b) => b[1] - a[1])),
    fiveGramOverlap: overlap,
    r7: { mostRepeatedStringShare: topShare, threshold: 0.3, pass: topShare <= 0.3 },
    forbiddenWords: {
      questionsChecked: questionCount,
      violations,
      blocksWithheld,
      withheldByTemplate: Object.fromEntries(
        [...withheldByTemplate.entries()].sort((a, b) => b[1] - a[1]),
      ),
    },
  }
}

/* -------------------------------------------------------------------- CLI */

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
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

async function* readLines(file: string): AsyncGenerator<Record<string, unknown>> {
  const text = await fs.readFile(file, 'utf8')
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t) continue
    const parsed = JSON.parse(t) as unknown
    const o = asObject(parsed)
    if (o) yield o
  }
}

function readSuppressed(o: Record<string, unknown>): boolean {
  if (typeof o.suppressed === 'boolean') return o.suppressed
  const cls = asString(pick(o, 'suppressionClass', 'suppression', 'class'))
  // S11 is the "cleared" test in docs/specs/suppression-classes.md; every other class suppresses.
  return cls !== undefined && cls.toUpperCase() !== 'S11' && cls.toUpperCase() !== 'NONE'
}

async function main(): Promise<void> {
  const fieldsDir = arg('fields') ?? 'data/corpus-20k/fields'
  const seedsDir = arg('seeds') ?? 'data/corpus-20k/derived'
  const outDir = arg('out') ?? 'data/corpus-20k/questions'
  const tiersFile = arg('tiers') ?? 'data/corpus-20k/tiers/model-assignment.ndjson'
  const suppressionFile = arg('suppression') ?? 'data/corpus-20k/suppression/assignments.ndjson'
  const pairs = Number(arg('pairs') ?? 2000)
  const rngSeed = Number(arg('pair-seed') ?? 20260904)
  const batchSize = Number(arg('batch-size') ?? 1000)
  const limit = arg('limit') ? Number(arg('limit')) : undefined
  const dryRun = process.argv.includes('--dry-run')

  const pages = new Map<string, PageInput>()
  const fieldFiles = await listNdjson(fieldsDir)
  for (const file of fieldFiles) {
    for await (const row of readLines(file)) {
      const key = asString(pick(row, 'key', 'canonicalKey', 'slug'))
      if (!key) continue
      const existing = pages.get(key)
      const fields = asObject(pick(row, 'fields', 'values')) ?? {}
      const page: PageInput = existing ?? {
        key,
        displayName: asString(pick(row, 'displayName', 'name', 'display_name')) ?? key,
        model: asString(pick(row, 'model', 'fieldModel')) ?? 'DEVELOPMENT',
        suppressed: readSuppressed(row),
        fields: {},
        seeds: {},
        ...(asNumber(pick(row, 'tier')) !== undefined ? { tier: asNumber(pick(row, 'tier')) } : {}),
      }
      for (const [k, v] of Object.entries(fields)) {
        const entry = asObject(v)
        if (entry && typeof entry.state === 'string')
          page.fields[k] = entry as unknown as FieldEntry
      }
      // `doseStudied` and `approvalDate` were added to the field models after the per-model
      // extractors were written, so the batches carry them beside `fields`, in the same shape.
      for (const [k, v] of Object.entries(row)) {
        if (k === 'fields' || k === 'values') continue
        const entry = asObject(v)
        if (entry && typeof entry.state === 'string' && page.fields[k] === undefined)
          page.fields[k] = entry as unknown as FieldEntry
      }
      pages.set(key, page)
    }
  }

  // Tier (R6/R13) is derived, never stored by hand: docs/specs/tiers promotion rule — Tier 1 is the
  // LONGEVITY model or any withdrawn page, Tier 2 the rest of CLINICAL, Tier 3 the rest of
  // DEVELOPMENT. Only Tier 3 can stub, so a thin Tier 1 or Tier 2 page still gets its questions.
  let tierRows = 0
  for await (const row of readLines(tiersFile)) {
    const key = asString(pick(row, 'key', 'canonicalKey', 'slug'))
    if (!key) continue
    const page = pages.get(key)
    if (!page) continue
    tierRows += 1
    const model = asString(pick(row, 'model')) ?? page.model
    const withdrawn = pick(row, 'withdrawn') === true
    page.tier = model === 'LONGEVITY' || withdrawn ? 1 : model === 'CLINICAL' ? 2 : 3
    const display = asString(pick(row, 'displayName', 'name'))
    if (display && page.displayName === key) page.displayName = display
  }

  // Suppression classes record which line a stub may carry AND which of the two leading blocks a
  // suppressed page asks; the suppressed flag itself already travels with the field batch.
  const suppressionClasses = new Map<string, string[]>()
  for await (const row of readLines(suppressionFile)) {
    const key = asString(pick(row, 'key', 'canonicalKey', 'slug'))
    if (!key) continue
    const classes = asArray(pick(row, 'classes', 'suppressionClasses'))
      .map((c) => asString(c))
      .filter((c): c is string => Boolean(c))
    if (classes.length > 0) {
      suppressionClasses.set(key, classes)
      const page = pages.get(key)
      if (page) page.suppressionClasses = classes
    }
  }

  // Only the seed files themselves: `derived/indexes/*.ndjson` holds the corpus-wide bipartite
  // indexes (node -> pages), which are not per-page seed records.
  const seedFiles = (await fs.readdir(seedsDir, { withFileTypes: true }).catch(() => []))
    .filter((e) => e.isFile() && e.name.endsWith('.ndjson'))
    .map((e) => path.join(seedsDir, e.name))
    .sort()
  for (const file of seedFiles) {
    const seedId = canonicalSeedId(path.basename(file, '.ndjson'))
    for await (const row of readLines(file)) {
      const key = asString(pick(row, 'key', 'canonicalKey', 'slug'))
      if (!key) continue
      const page = pages.get(key)
      if (!page) continue
      const fires = typeof row.fires === 'boolean' ? row.fires : true
      // compute.py records the R7 slot values under `slots` and the renderer's rows under
      // `values`; the slots win where both name the same thing.
      const slots = asObject(pick(row, 'slots'))
      const seedValues = asObject(pick(row, 'values'))
      const values =
        slots !== undefined || seedValues !== undefined
          ? { ...(seedValues ?? {}), ...(slots ?? {}) }
          : row
      page.seeds[seedId] = { fires, values }
    }
  }

  const keys = [...pages.keys()].sort()
  const sliced = limit !== undefined ? keys.slice(0, limit) : keys
  const derived: PageQuestions[] = sliced.map((key) => {
    const page = pages.get(key) as PageInput
    const stub = isStub(page)
    const classes = suppressionClasses.get(key)
    const { questions, withheld } = deriveQuestionsAndWithheld(page)
    return {
      key,
      questions,
      ...(withheld.length > 0 ? { withheld } : {}),
      ...(stub ? { stub: true, presentFields: presentFieldCount(page) } : {}),
      ...(stub && classes ? { suppressionClasses: classes } : {}),
    }
  })

  const metrics = computeMetrics(derived, { pairs, seed: rngSeed })

  const v = metrics.forbiddenWords.violations

  if (!dryRun) {
    await fs.mkdir(outDir, { recursive: true })
    // The metrics report is written whatever the outcome: it is the record of the run, including a
    // failed one. The batches are written only once the hard guard has passed, so a failed run never
    // leaves questions on disk that must not be rendered.
    await fs.writeFile(
      path.join(outDir, 'metrics.json'),
      JSON.stringify(
        {
          inputs: {
            fieldsDir,
            seedsDir,
            tiersFile,
            suppressionFile,
            fieldFiles: fieldFiles.length,
            seedFiles: seedFiles.length,
            tierRows,
          },
          ...metrics,
        },
        null,
        2,
      ) + '\n',
      'utf8',
    )
    for (const f of await fs.readdir(outDir).catch(() => [])) {
      if (/^batch-\d+\.ndjson$/.test(f)) await fs.rm(path.join(outDir, f))
    }
    if (v.length === 0) {
      for (let i = 0, batch = 1; i < derived.length; i += batchSize, batch += 1) {
        const slice = derived.slice(i, i + batchSize)
        const file = path.join(outDir, `batch-${String(batch).padStart(4, '0')}.ndjson`)
        await fs.writeFile(file, slice.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8')
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        pages: metrics.pages,
        questions: metrics.questions,
        mostRepeatedString: metrics.mostRepeatedString,
        mostRepeatedTemplate: metrics.mostRepeatedTemplate,
        fiveGramOverlap: metrics.fiveGramOverlap,
        r7: metrics.r7,
        forbiddenWordViolations: v.length,
        blocksWithheld: metrics.forbiddenWords.blocksWithheld,
      },
      null,
      2,
    ),
  )
  if (v.length > 0) {
    for (const hit of v.slice(0, 20))
      console.error(`forbidden "${hit.word}" on ${hit.key}: ${hit.text}`)
    throw new Error(
      `${v.length} question(s) contain a forbidden word; the run fails (docs/specs/derived-content.md hard guard)`,
    )
  }
  if (!metrics.r7.pass) {
    throw new Error(
      `R7: the most repeated question string covers ${(metrics.r7.mostRepeatedStringShare * 100).toFixed(1)}% of pages (limit 30%)`,
    )
  }
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (invokedDirectly) {
  await main()
}
