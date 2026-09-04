/**
 * Facet derivation for the corpus browse indexes (R12, docs/specs/browse.md).
 *
 * Every value below is read from `corpus_pages` and `page_fields`. Nothing here interprets a
 * record: a facet value exists only where the corpus already recorded the fact, and a page that
 * recorded nothing for a dimension is simply absent from that dimension rather than filed under a
 * placeholder value.
 *
 * Two deliberate limits, stated rather than filled in:
 *
 *  - **Class.** The browse spec asks for the ATC first level where ChEMBL records an ATC code and
 *    the entity class otherwise; the loader writes both onto `corpus_pages` (`atc_codes`,
 *    `entity_class`), so this module reads them rather than deriving anything. An ATC group is
 *    named by its letter alone. The codes are ChEMBL content (CC BY-SA, noted in `licence_notes`),
 *    but the World Health Organization's names for the fourteen first-level groups are not
 *    licensed for this build (docs/specs/corpus-20k-sources.md), so printing them here would be
 *    using text nobody granted. Pages with neither an ATC code nor a recorded class do not appear
 *    under class at all.
 *  - **Regulatory status.** Only the United States, the European Union and Canada are offered,
 *    because those are the three registers the corpus actually read. `unknown` is kept as its own
 *    value: an unread register is a distinct state, not an absence to hide.
 */
import { sql } from 'drizzle-orm'

import { db } from '@/db'
import { EVIDENCE_KINDS } from '@/lib/corpus/organism-ladder'

export type CorpusFacetId = 'class' | 'pathway' | 'evidence' | 'status' | 'type'

export interface CorpusFacetDefinition {
  id: CorpusFacetId
  /** Ordinary-language name, used as the index heading and in navigation. */
  label: string
  /** One plain sentence describing what a value on this index means. */
  description: string
}

export const CORPUS_FACETS: readonly CorpusFacetDefinition[] = [
  {
    id: 'class',
    label: 'Substance class',
    description:
      'What kind of substance the record is: its ATC group letter where ChEMBL records an ' +
      'ATC code, otherwise the class a register or listing states. ATC groups are shown by ' +
      'letter because the World Health Organization\u2019s names for them are not licensed for ' +
      'this site.',
  },
  {
    id: 'pathway',
    label: 'Longevity pathway',
    description: 'The pathway a cited sentence names for the substance.',
  },
  {
    id: 'evidence',
    label: 'Evidence reached',
    description: 'The highest organism a recorded finding used, and whether human data is on file.',
  },
  {
    id: 'status',
    label: 'Regulatory status',
    description: 'What the United States, European Union and Canadian registers record.',
  },
  {
    id: 'type',
    label: 'Record type',
    description: 'Which set of fields the record is kept under.',
  },
]

export function corpusFacet(id: string): CorpusFacetDefinition | null {
  return CORPUS_FACETS.find((facet) => facet.id === id) ?? null
}

// ---------------------------------------------------------------------------
// Vocabularies
// ---------------------------------------------------------------------------

/** Entity classes as the corpus records them, in ordinary language. `PLACEHOLDER` is not offered. */
const ENTITY_CLASS_LABELS: Record<string, string> = {
  APPROVED_MEDICINE: 'Approved medicine',
  APPROVED_BIOLOGIC: 'Approved biologic',
  WITHDRAWN_MEDICINE: 'Withdrawn medicine',
  INVESTIGATIONAL_MEDICINE: 'Investigational medicine',
  SUPPLEMENT_INGREDIENT: 'Supplement ingredient',
  BOTANICAL_OR_ORGANISM_PREPARATION: 'Botanical or organism preparation',
  MARKETED_PRODUCT_INGREDIENT: 'Marketed product ingredient',
  OFF_LABEL_OR_COMPOUNDED: 'Off-label or compounded use',
  CONTROLLED_NO_APPROVED_USE: 'Controlled, no approved use',
  COMBINATION_PRODUCT: 'Combination product',
  REGISTRY_ONLY_IDENTITY: 'Registry-only identity',
}

/**
 * ChEMBL's `molecule_type`, which the loader stores as the entity class for a page the corpus
 * never classified itself. `Unknown` is not stored and so is not listed here.
 */
const MOLECULE_TYPE_LABELS: Record<string, string> = {
  'Small molecule': 'Small molecule',
  Protein: 'Protein',
  Antibody: 'Antibody',
  'Antibody drug conjugate': 'Antibody-drug conjugate',
  Oligonucleotide: 'Oligonucleotide',
  Oligosaccharide: 'Oligosaccharide',
  Enzyme: 'Enzyme',
  Gene: 'Gene therapy',
  Cell: 'Cell therapy',
  'Vaccine component': 'Vaccine component',
}

/** The fourteen ATC first-level letters. A code outside them is not filed under class. */
const ATC_FIRST_LEVELS = ['A', 'B', 'C', 'D', 'G', 'H', 'J', 'L', 'M', 'N', 'P', 'R', 'S', 'V']

/** `C02CA01` becomes `atc-c`. Codes that do not start with an ATC letter are dropped. */
function atcFirstLevel(code: string): string | null {
  const letter = code.trim().charAt(0).toUpperCase()
  return ATC_FIRST_LEVELS.includes(letter) ? letter : null
}

function atcValueId(letter: string): string {
  return `atc-${letter.toLowerCase()}`
}

function atcValueLabel(letter: string): string {
  return `ATC group ${letter}`
}

/** The organism ladder, weakest rung first. The words are the corpus's own rung values. */
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

const ORGANISM_LABELS: Record<string, string> = {
  yeast: 'Yeast',
  'C. elegans': 'Roundworm (C. elegans)',
  Drosophila: 'Fruit fly (Drosophila)',
  mouse: 'Mouse',
  rat: 'Rat',
  dog: 'Dog',
  NHP: 'Non-human primate',
  human: 'Human',
}

const PATHWAY_LABELS: Record<string, string> = {
  mTOR: 'mTOR',
  AMPK: 'AMPK',
  sirtuin: 'Sirtuin',
  senolytic: 'Senolytic',
  autophagy: 'Autophagy',
  'NAD+': 'NAD+',
  'IGF-1': 'IGF-1',
}

const JURISDICTION_LABELS: Record<string, string> = {
  US: 'United States',
  EU: 'European Union',
  CA: 'Canada',
}

/** Only the three registers the corpus read are offered as facet values. */
const FACETED_JURISDICTIONS = ['US', 'EU', 'CA'] as const

const STATUS_LABELS: Record<string, string> = {
  approved: 'approved',
  withdrawn: 'withdrawn',
  supplement: 'listed as a supplement',
  unscheduled: 'unscheduled',
  controlled: 'controlled',
  unknown: 'not recorded by this register',
}

const RECORD_TYPE_LABELS: Record<string, string> = {
  longevity: 'Longevity',
  clinical: 'Clinical',
  'withdrawn-arc': 'Withdrawn arc',
  development: 'Development',
}

// ---------------------------------------------------------------------------
// Records
// ---------------------------------------------------------------------------

export interface CorpusFacetRecord {
  key: string
  slug: string
  name: string
  tier: number
  model: string
  withdrawn: boolean
  indexable: boolean
  presentFieldCount: number
  applicableFieldCount: number
  /** When the load last rewrote this page's rows; the sitemap reports it as `lastmod`. */
  updatedAt: Date
  /** The first derived question, verbatim. Absent where the page derived none. */
  firstQuestion: string | null
  /** Highest recorded organism rung, or null where nothing recorded an organism. */
  topRung: string | null
  /** Whether a human study or human rung is on file. Null where nothing bears on the question. */
  humanData: boolean | null
  /** The ladder's own evidence kind, else what the registry records. Null where neither exists. */
  evidenceTier: string | null
  /** Facet value ids this record belongs to, per dimension. */
  values: Record<CorpusFacetId, string[]>
}

export interface CorpusFacetValue {
  /** URL segment. */
  id: string
  label: string
  count: number
}

type PageRow = {
  key: string
  slug: string
  display_name: string
  tier: number
  model: string
  withdrawn: boolean
  indexable: boolean
  present_field_count: number
  applicable_field_count: number
  updated_at: Date | string
  /** Written by the loader (migration 0025): ATC codes, class and the badge triplet. */
  atc_codes: string[] | null
  page_entity_class: string | null
  top_rung: string | null
  human_data: boolean | null
  evidence_tier: string | null
}

type FacetRow = PageRow & {
  first_question: string | null
  /** The register-recorded class, used only where the loader wrote no `entity_class` column. */
  entity_class: string | null
  pathways: string[] | null
  rungs: string[] | null
  statuses: Record<string, string | null> | null
}

/** Lower-cased, hyphenated, safe in a URL. `NAD+` becomes `nad`, `C. elegans` becomes `c-elegans`. */
export function facetValueSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\+/g, ' plus')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function recordTypeValue(model: string, withdrawn: boolean): string {
  if (withdrawn) return 'withdrawn-arc'
  if (model === 'LONGEVITY') return 'longevity'
  if (model === 'CLINICAL') return 'clinical'
  return 'development'
}

function topRung(rungs: readonly string[]): string | null {
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

/** `mouse` + human data on file becomes `mouse-with-human-data`. */
export function evidenceValueId(rung: string, humanData: boolean): string {
  return `${facetValueSlug(rung)}-${humanData ? 'with' : 'without'}-human-data`
}

export function evidenceValueLabel(rung: string, humanData: boolean): string {
  const organism = ORGANISM_LABELS[rung] ?? rung
  return humanData ? `${organism}, human data on file` : `${organism}, no human data on file`
}

function statusValueId(jurisdiction: string, status: string): string {
  return `${facetValueSlug(jurisdiction)}-${facetValueSlug(status)}`
}

function statusValueLabel(jurisdiction: string, status: string): string {
  const place = JURISDICTION_LABELS[jurisdiction] ?? jurisdiction
  return `${place}: ${STATUS_LABELS[status] ?? status}`
}

/** The label a facet value carries in the main view. */
export function facetValueLabel(facet: CorpusFacetId, valueId: string): string {
  return FACET_VALUE_LABELS[facet].get(valueId) ?? valueId
}

/** Built once from the vocabularies above, so a value id always renders the same words. */
const FACET_VALUE_LABELS: Record<CorpusFacetId, Map<string, string>> = {
  class: new Map([
    ...ATC_FIRST_LEVELS.map(
      (letter) => [atcValueId(letter), atcValueLabel(letter)] as [string, string],
    ),
    ...Object.entries(ENTITY_CLASS_LABELS).map(
      ([value, label]) => [facetValueSlug(value), label] as [string, string],
    ),
    ...Object.entries(MOLECULE_TYPE_LABELS).map(
      ([value, label]) => [facetValueSlug(value), label] as [string, string],
    ),
  ]),
  pathway: new Map(
    Object.entries(PATHWAY_LABELS).map(([value, label]) => [facetValueSlug(value), label]),
  ),
  evidence: new Map(
    ORGANISM_RUNGS.flatMap((rung) => [
      [evidenceValueId(rung, true), evidenceValueLabel(rung, true)] as [string, string],
      [evidenceValueId(rung, false), evidenceValueLabel(rung, false)] as [string, string],
    ]),
  ),
  status: new Map(
    FACETED_JURISDICTIONS.flatMap((jurisdiction) =>
      Object.keys(STATUS_LABELS).map(
        (status) =>
          [statusValueId(jurisdiction, status), statusValueLabel(jurisdiction, status)] as [
            string,
            string,
          ],
      ),
    ),
  ),
  type: new Map(Object.entries(RECORD_TYPE_LABELS)),
}

/** Value order on an index page: the vocabulary's own order, then anything unexpected, by name. */
const FACET_VALUE_ORDER: Record<CorpusFacetId, string[]> = {
  class: [
    ...ATC_FIRST_LEVELS.map(atcValueId),
    ...Object.keys(ENTITY_CLASS_LABELS).map(facetValueSlug),
    ...Object.keys(MOLECULE_TYPE_LABELS).map(facetValueSlug),
  ],
  pathway: Object.keys(PATHWAY_LABELS).map(facetValueSlug),
  evidence: [...ORGANISM_RUNGS]
    .reverse()
    .flatMap((rung) => [evidenceValueId(rung, true), evidenceValueId(rung, false)]),
  status: FACETED_JURISDICTIONS.flatMap((jurisdiction) =>
    Object.keys(STATUS_LABELS).map((status) => statusValueId(jurisdiction, status)),
  ),
  type: Object.keys(RECORD_TYPE_LABELS),
}

/**
 * The record's top rung and human-data flag: the loader's columns where it wrote them, else the
 * ladder rows read here. The columns cover every model; the ladder covers LONGEVITY pages only, so
 * a corpus loaded before migration 0025 still fills the evidence dimension for those.
 */
function tripletOf(row: FacetRow): { topRung: string | null; humanData: boolean | null } {
  const rungs = (row.rungs ?? []).filter((rung) => typeof rung === 'string' && rung.length > 0)
  return {
    topRung: row.top_rung ?? (rungs.length > 0 ? topRung(rungs) : null),
    humanData: row.human_data ?? (rungs.length > 0 ? rungs.includes('human') : null),
  }
}

/**
 * Class values: one per distinct ATC first level where ChEMBL recorded a code, otherwise the one
 * recorded class. A page never carries both, so an ATC page is counted under its groups only.
 */
function classValues(row: FacetRow): string[] {
  const letters = [
    ...new Set(
      (row.atc_codes ?? [])
        .filter((code): code is string => typeof code === 'string' && code.length > 0)
        .flatMap((code) => {
          const letter = atcFirstLevel(code)
          return letter === null ? [] : [letter]
        }),
    ),
  ].sort()
  if (letters.length > 0) return letters.map(atcValueId)

  const recorded = row.page_entity_class ?? row.entity_class
  if (recorded === null) return []
  if (ENTITY_CLASS_LABELS[recorded] || MOLECULE_TYPE_LABELS[recorded]) {
    return [facetValueSlug(recorded)]
  }
  return []
}

function facetValuesFor(row: FacetRow): Record<CorpusFacetId, string[]> {
  const { topRung: highest, humanData } = tripletOf(row)
  const classes = classValues(row)

  const pathways = [
    ...new Set(
      (row.pathways ?? [])
        .filter((value): value is string => typeof value === 'string' && value in PATHWAY_LABELS)
        .map(facetValueSlug),
    ),
  ]

  const evidence =
    highest !== null && humanData !== null ? [evidenceValueId(highest, humanData)] : []

  const statuses: string[] = []
  for (const jurisdiction of FACETED_JURISDICTIONS) {
    const status = row.statuses?.[jurisdiction]
    if (typeof status !== 'string' || !(status in STATUS_LABELS)) continue
    statuses.push(statusValueId(jurisdiction, status))
  }

  return {
    class: classes,
    pathway: pathways,
    evidence,
    status: statuses,
    type: [recordTypeValue(row.model, row.withdrawn)],
  }
}

// ---------------------------------------------------------------------------
// Reading the corpus
// ---------------------------------------------------------------------------

/**
 * One pass over the corpus, held for a short window. Building the five dimensions means touching
 * every page's recorded pathway, ladder and register rows; a reader paging through a facet must
 * not pay that on every request. Correctness never depends on the window: a cold process rebuilds
 * from the database, and a stale window only delays a newly loaded page by minutes.
 */
const FACET_CACHE_TTL_MS = 15 * 60 * 1000
let cachedRecords: { builtAt: number; records: CorpusFacetRecord[] } | null = null

export function clearCorpusFacetCache(): void {
  cachedRecords = null
}

export async function loadCorpusFacetRecords(): Promise<CorpusFacetRecord[]> {
  if (cachedRecords && Date.now() - cachedRecords.builtAt < FACET_CACHE_TTL_MS) {
    return cachedRecords.records
  }
  const records = await readCorpusFacetRecords()
  cachedRecords = { builtAt: Date.now(), records }
  return records
}

/**
 * Five set-based reads rather than one row-by-row pass: each recorded field is scanned once
 * through its own index and joined in memory by page key. The row-by-row form ran four correlated
 * subqueries for every page in the corpus, which is a second of work per few thousand records.
 */
async function readCorpusFacetRecords(): Promise<CorpusFacetRecord[]> {
  const [pages, questions, registers, pathways, ladders] = await Promise.all([
    db.execute<PageRow>(sql`
      select
        key,
        slug,
        display_name,
        tier,
        model::text as model,
        withdrawn,
        indexable,
        present_field_count,
        applicable_field_count,
        updated_at,
        atc_codes,
        entity_class as page_entity_class,
        top_rung,
        human_data,
        evidence_tier
      from corpus_pages
    `),
    db.execute<{ key: string; text: string }>(sql`
      select distinct on (key) key, text from page_questions order by key, ordinal
    `),
    db.execute<{
      key: string
      entity_class: string | null
      statuses: Record<string, string | null> | null
    }>(sql`
      select
        key,
        jsonb_path_query_first(
          page_fields.value,
          '$.*.records[*] ? (@.register like_regex "entity class" flag "i")'
        )->>'statusVerbatim' as entity_class,
        (
          select jsonb_object_agg(e.k, e.v->>'status')
          from jsonb_each(page_fields.value) e(k, v)
          where jsonb_typeof(e.v) = 'object'
        ) as statuses
      from page_fields
      where field = 'regulatory'
        and state = 'present'
        and jsonb_typeof(page_fields.value) = 'object'
    `),
    db.execute<{ key: string; pathways: string[] | null }>(sql`
      select key, array_agg(distinct item->>'pathway') as pathways
      from page_fields, lateral jsonb_array_elements(page_fields.value) as element(item)
      where field = 'pathway'
        and state = 'present'
        and jsonb_typeof(page_fields.value) = 'array'
      group by key
    `),
    db.execute<{ key: string; rungs: string[] | null }>(sql`
      select key, array_agg(distinct rung->>'rung') as rungs
      from page_fields, lateral jsonb_array_elements(page_fields.value->'rungs') as ladder(rung)
      where field = 'organismLadder'
        and state = 'present'
        and jsonb_typeof(page_fields.value->'rungs') = 'array'
      group by key
    `),
  ])

  const firstQuestion = new Map(questions.rows.map((row) => [row.key, row.text]))
  const register = new Map(registers.rows.map((row) => [row.key, row]))
  const pathwayRows = new Map(pathways.rows.map((row) => [row.key, row.pathways]))
  const ladderRows = new Map(ladders.rows.map((row) => [row.key, row.rungs]))

  const records = pages.rows.map((page) => {
    const registerRow = register.get(page.key)
    const rungs = ladderRows.get(page.key) ?? null
    const row: FacetRow = {
      ...page,
      first_question: firstQuestion.get(page.key) ?? null,
      entity_class: registerRow?.entity_class ?? null,
      statuses: registerRow?.statuses ?? null,
      pathways: pathwayRows.get(page.key) ?? null,
      rungs,
    }
    const triplet = tripletOf(row)
    return {
      key: page.key,
      slug: page.slug,
      name: page.display_name,
      tier: Number(page.tier),
      model: page.model,
      withdrawn: Boolean(page.withdrawn),
      indexable: Boolean(page.indexable),
      presentFieldCount: Number(page.present_field_count),
      applicableFieldCount: Number(page.applicable_field_count),
      updatedAt: new Date(page.updated_at),
      firstQuestion: row.first_question,
      topRung: triplet.topRung,
      humanData: triplet.humanData,
      evidenceTier: page.evidence_tier ?? null,
      values: facetValuesFor(row),
    }
  })

  return orderRecords(records)
}

// ---------------------------------------------------------------------------
// Indexes over the records
// ---------------------------------------------------------------------------

/** Records ordered as the browse spec sets: most present fields first, then by name. */
function orderRecords(records: CorpusFacetRecord[]): CorpusFacetRecord[] {
  return [...records].sort(
    (left, right) =>
      right.presentFieldCount - left.presentFieldCount ||
      left.name.localeCompare(right.name, 'en') ||
      left.slug.localeCompare(right.slug, 'en'),
  )
}

export async function corpusFacetValues(facet: CorpusFacetId): Promise<CorpusFacetValue[]> {
  const records = await loadCorpusFacetRecords()
  const counts = new Map<string, number>()
  for (const record of records) {
    for (const value of record.values[facet]) counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  const order = FACET_VALUE_ORDER[facet]
  return [...counts.entries()]
    .map(([id, count]) => ({ id, label: facetValueLabel(facet, id), count }))
    .sort((left, right) => {
      const leftIndex = order.indexOf(left.id)
      const rightIndex = order.indexOf(right.id)
      if (leftIndex !== rightIndex) {
        if (leftIndex === -1) return 1
        if (rightIndex === -1) return -1
        return leftIndex - rightIndex
      }
      return left.label.localeCompare(right.label, 'en')
    })
}

export async function corpusFacetValueRecords(
  facet: CorpusFacetId,
  valueId: string,
): Promise<CorpusFacetRecord[]> {
  const records = await loadCorpusFacetRecords()
  return orderRecords(records.filter((record) => record.values[facet].includes(valueId)))
}

// ---------------------------------------------------------------------------
// Letter split
// ---------------------------------------------------------------------------

/** Above this many records a facet value splits by initial letter before it paginates. */
export const FACET_LETTER_SPLIT_THRESHOLD = 300

export interface FacetLetterBucket {
  id: string
  label: string
  count: number
}

/** `a`…`z` for a name that starts with a letter, `0-9` for a digit, `other` for anything else. */
export function recordLetter(name: string): string {
  const first = name.trim().charAt(0).toLowerCase()
  if (first >= 'a' && first <= 'z') return first
  if (first >= '0' && first <= '9') return '0-9'
  return 'other'
}

export function letterBuckets(records: readonly CorpusFacetRecord[]): FacetLetterBucket[] {
  const counts = new Map<string, number>()
  for (const record of records) {
    const letter = recordLetter(record.name)
    counts.set(letter, (counts.get(letter) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ id, label: id === 'other' ? 'Other' : id.toUpperCase(), count }))
    .sort((left, right) => left.id.localeCompare(right.id, 'en'))
}

export function recordsForLetter(
  records: readonly CorpusFacetRecord[],
  letter: string,
): CorpusFacetRecord[] {
  return records.filter((record) => recordLetter(record.name) === letter)
}

// ---------------------------------------------------------------------------
// Row presentation
// ---------------------------------------------------------------------------

export interface RecordBadge {
  kind: 'evidence-tier' | 'organism' | 'human-data'
  label: string
}

/**
 * The identity badge triplet the dossier template also carries: evidence tier, top organism rung
 * and whether human data is on file. The evidence tier is the loader's own column where it wrote
 * one, and the record type otherwise, so a corpus loaded before migration 0025 still carries a
 * first badge. A badge is emitted only where the record holds the fact, so a page that recorded no
 * organism carries one badge rather than three empty ones.
 */
const EVIDENCE_KIND_LABELS = new Map(EVIDENCE_KINDS.map((kind) => [kind.kind, kind.label]))

/**
 * The evidence tier badge, worded exactly as the dossier header words it: the ladder's own
 * evidence kind or the registry's phrase, prefixed so the badge names what was measured. A record
 * loaded before the column existed falls back to which set of records it is kept under.
 */
function evidenceTierLabel(record: CorpusFacetRecord): string {
  if (record.evidenceTier === null) {
    return RECORD_TYPE_LABELS[recordTypeValue(record.model, record.withdrawn)] ?? record.model
  }
  const kind = EVIDENCE_KIND_LABELS.get(record.evidenceTier)?.toLowerCase() ?? record.evidenceTier
  return `Evidence recorded: ${kind}`
}

export function recordBadges(record: CorpusFacetRecord): RecordBadge[] {
  const badges: RecordBadge[] = [
    {
      kind: 'evidence-tier',
      label: evidenceTierLabel(record),
    },
  ]
  if (record.topRung) {
    badges.push({
      kind: 'organism',
      label: ORGANISM_LABELS[record.topRung] ?? record.topRung,
    })
  }
  if (record.humanData !== null) {
    badges.push({
      kind: 'human-data',
      label: record.humanData ? 'Human data on file' : 'No human data on file',
    })
  }
  return badges
}
