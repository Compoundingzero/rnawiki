import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'

import { canonicalLocatorForBackgroundSource } from '@/lib/background/source-fetch'
import { BACKGROUND_SOURCE_KINDS, type BackgroundSourceKind } from '@/lib/background/types'
import {
  DOSSIER_COMPLETION_STATUSES,
  DOSSIER_SECTION_IDS,
  SECTION_STATES,
} from '@/lib/dossier-completion/types'
import { CONSENSUS_FIELD_TO_INTENT } from '@/lib/dossier-question-issues'
import { ENTITY_CLASSES, INVENTORY_RESOLUTION_STATES } from '@/lib/inventory/types'
import { resolveSafeSourceLocator } from '@/lib/source-locator'

export const PUBLIC_DATASET_IDS = [
  'enzyme-transporter-negatives',
  'source-consensus',
  'silence-ledger',
  'coverage-ledger',
  'inventory-resolution',
  'dossier-completion',
] as const

export type PublicDatasetId = (typeof PUBLIC_DATASET_IDS)[number]

export interface PublicDatasetSentenceRecord {
  polarity: 'ASSERTED' | 'NEGATED' | 'NOT_RECORDED'
  labelSection: string | null
  matchesSourceCasing: boolean
  sourceKind: string
  sourceIdentifier: string
  sourceLabel: string | null
  sourceLocator: string | null
  sourceVersion: string | null
  sourceEffectiveDate: string | null
  sourceHref: string | null
  retrievedAt: string
  excerpt: string
}

export interface PublicDatasetSourceRecord {
  sourceKind: BackgroundSourceKind
  sourceIdentifier: string
  sourceLabel: string
  sourceLocator: string | null
  sourceVersion: string | null
  sourceEffectiveDate: string | null
  sourceHref: string | null
  retrievedAt: string
  excerpt: string | null
}

export interface PublicDatasetConsensusReadingRecord {
  display: string
  numeric: number | null
  unit: string | null
  populationContext: string
  sourceCount: number
  sources: PublicDatasetSourceRecord[]
}

export type PublicDatasetCell =
  | string
  | number
  | boolean
  | null
  | string[]
  | PublicDatasetSentenceRecord[]
  | PublicDatasetSourceRecord[]
  | PublicDatasetConsensusReadingRecord[]
export type PublicDatasetRow = Record<string, PublicDatasetCell>

export interface PublicDatasetField {
  key: string
  label: string
  type:
    'string' | 'number' | 'boolean' | 'string[]' | 'sentence[]' | 'source[]' | 'consensus-reading[]'
  description: string
}

export interface PublicDatasetMetric {
  label: string
  value: string | number
  detail?: string
}

export interface PublicDatasetFilter {
  parameter: 'q' | 'state' | 'meaning' | 'field' | 'role' | 'counterparty' | 'route' | 'module'
  label: string
  description: string
  values?: string[]
}

export interface PublicDatasetSourceExample {
  label: string
  detail: string
  sourceIdentifier?: string
  sourceHref?: string
  excerpt?: string
}

export interface PublicDatasetDescriptor {
  id: PublicDatasetId
  title: string
  shortTitle: string
  purpose: string
  doesNotMean: string
  methodology: string[]
  schema: PublicDatasetField[]
  coverage: PublicDatasetMetric[]
  generatedAt: string
  version: string
  sourceArtifact: string
  sourceLimitations: string[]
  licence: {
    name: 'CC BY 4.0'
    url: 'https://creativecommons.org/licenses/by/4.0/'
    scope: string
  }
  correctionHref: '/editorial-policy'
  apiPath: string
  rowCount: number
  filters: PublicDatasetFilter[]
  sourceExamples: PublicDatasetSourceExample[]
}

export type PublicDatasetSummary = Pick<
  PublicDatasetDescriptor,
  | 'id'
  | 'title'
  | 'shortTitle'
  | 'purpose'
  | 'doesNotMean'
  | 'generatedAt'
  | 'version'
  | 'sourceArtifact'
  | 'rowCount'
>

export interface PublicDatasetQuery {
  q?: string
  state?: string
  meaning?: string
  field?: string
  role?: string
  counterparty?: string
  route?: string
  module?: string
  limit: number
  offset: number
}

export interface PublicDatasetPage {
  dataset: PublicDatasetDescriptor
  query: PublicDatasetQuery
  rows: PublicDatasetRow[]
  total: number
  nextOffset: number | null
  previousOffset: number | null
}

const DEFAULT_LIMIT = 25
export const PUBLIC_DATASET_MAX_LIMIT = 200
export const PUBLIC_DATASET_MAX_OFFSET = 200_000
export const PUBLIC_DATASET_MAX_QUERY_LENGTH = 120

const COMMON_FILTER: PublicDatasetFilter = {
  parameter: 'q',
  label: 'Search text',
  description: 'Case-insensitive text search over the public fields named for this dataset.',
}

const LICENCE: PublicDatasetDescriptor['licence'] = {
  name: 'CC BY 4.0',
  url: 'https://creativecommons.org/licenses/by/4.0/',
  scope:
    'RNAWiki licenses its selection, schema, structure, and derived projection. Quoted source passages and third-party records retain their original rights.',
}

const CORRECTION_HREF = '/editorial-policy' as const

export interface LoadedPublicDataset {
  descriptor: PublicDatasetDescriptor
  rows: PublicDatasetRow[]
  searchFields: string[]
}

interface DatasetCacheEntry {
  signature: string
  value: LoadedPublicDataset
}

const datasetCache = new Map<PublicDatasetId, DatasetCacheEntry>()

type UnknownRecord = Record<string, unknown>

function record(value: unknown, context: string): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${context} is not an object`)
  }
  return value as UnknownRecord
}

function records(value: unknown, context: string): UnknownRecord[] {
  if (!Array.isArray(value)) throw new Error(`${context} is not an array`)
  return value.map((entry, index) => record(entry, `${context}[${index}]`))
}

function text(value: unknown, context: string): string {
  if (typeof value !== 'string') throw new Error(`${context} is not a string`)
  return value
}

function optionalText(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function numberValue(value: unknown, context: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${context} is not a finite number`)
  }
  return value
}

function optionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/**
 * Public links are derived only from the checked-in kind adapter. Recorded locator text is shown as
 * provenance but is never trusted as an href.
 */
export function publicBackgroundSourceHref(source: {
  kind: string
  identifier: string
}): string | null {
  if (!(BACKGROUND_SOURCE_KINDS as readonly string[]).includes(source.kind)) return null
  try {
    const canonical = canonicalLocatorForBackgroundSource({
      kind: source.kind as BackgroundSourceKind,
      identifier: source.identifier,
    })
    return canonical ? (resolveSafeSourceLocator(canonical)?.href ?? null) : null
  } catch {
    return null
  }
}

function stringList(value: unknown, context: string): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`${context} is not a string array`)
  }
  return [...value]
}

function safeCaveats(value: unknown, context: string): string[] {
  return stringList(value, context).filter((entry) => !/\bqueue(?:d)?\b/i.test(entry))
}

/** Current runner artifacts wrap the deterministic run in `{ run, review, ... }`. */
function deterministicRun(raw: UnknownRecord, context: string): UnknownRecord {
  return raw.run === undefined ? raw : record(raw.run, `${context}.run`)
}

function relativeAgentCandidates(fileName: string): string[] {
  return [`data/agents/current/${fileName}`]
}

async function resolveSource(
  candidates: readonly string[],
  root = process.cwd(),
): Promise<{
  absolutePath: string
  relativePath: string
  signature: string
}> {
  for (const relativePath of candidates) {
    const absolutePath = join(root, relativePath)
    try {
      const sourceStat = await stat(absolutePath)
      if (!sourceStat.isFile()) continue
      return {
        absolutePath,
        relativePath,
        signature: `${absolutePath}:${sourceStat.size}:${sourceStat.mtimeMs}`,
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code !== 'ENOENT') throw error
    }
  }
  throw new Error('The public dataset artifact is unavailable')
}

async function readJsonObject(path: string, context: string): Promise<UnknownRecord> {
  return record(JSON.parse(await readFile(path, 'utf8')) as unknown, context)
}

/** The published directory holding the completion corpus, one shard per thousand records. */
export const DOSSIER_COMPLETION_DIRECTORY = 'data/dossier-completion'

/**
 * Every completion shard the manifest declares, in manifest order.
 *
 * The manifest is the list, not the directory. A shard written but not yet declared is not part of
 * the published dataset, and a shard declared but missing must fail loudly rather than quietly
 * serving a short corpus — which is exactly what globbing the directory would do.
 */
async function resolveDossierCompletionShards(root = process.cwd()): Promise<
  Array<{
    absolutePath: string
    relativePath: string
    signature: string
  }>
> {
  const manifestSource = await resolveSource(['data/manifest.json'], root)
  const manifest = await readJsonObject(manifestSource.absolutePath, 'dataset manifest')
  const shardPaths = records(manifest.files, 'dataset manifest files')
    .map((entry) => entry.path)
    .filter(
      (path): path is string =>
        typeof path === 'string' &&
        path.startsWith(`${DOSSIER_COMPLETION_DIRECTORY}/`) &&
        path.endsWith('.ndjson'),
    )
  if (shardPaths.length === 0) throw new Error('The public dataset artifact is unavailable')
  const shards = []
  for (const shardPath of shardPaths) shards.push(await resolveSource([shardPath], root))
  return shards
}

export async function resolveCurrentPublicAgentArtifact(
  fileName: string,
  root = process.cwd(),
): Promise<{
  absolutePath: string
  relativePath: string
  signature: string
}> {
  const source = await resolveSource(relativeAgentCandidates(fileName), root)
  const manifestSource = await resolveSource(['data/agents/current/manifest.json'], root)
  const manifest = await readJsonObject(manifestSource.absolutePath, 'current agent manifest')
  if (
    manifest.schema !== 'rnawiki-current-agent-manifest/v1' ||
    manifest.historicalPreRepair !== false ||
    manifest.eligibleForActiveReview !== true
  ) {
    throw new Error('The public dataset requires a current post-repair agent manifest')
  }
  const entry = records(manifest.artifacts, 'current agent manifest artifacts').find(
    (candidate) => candidate.path === source.relativePath,
  )
  if (!entry) {
    throw new Error(`${source.relativePath} is absent from the current agent manifest`)
  }
  const bytes = await readFile(source.absolutePath)
  const digest = createHash('sha256').update(bytes).digest('hex')
  if (entry.outputDigest !== digest) {
    throw new Error(`${source.relativePath} does not match its current agent manifest digest`)
  }
  const artifact = record(JSON.parse(bytes.toString('utf8')) as unknown, source.relativePath)
  const run = record(artifact.run, `${source.relativePath}.run`)
  const expectedAgentId = fileName.replace(/\.json$/u, '')
  if (
    artifact.schema !== 'rnawiki-current-agent-run/v1' ||
    artifact.historicalPreRepair !== false ||
    artifact.eligibleForActiveReview !== true ||
    run.agent !== expectedAgentId ||
    entry.agentId !== expectedAgentId ||
    entry.agentVersion !== run.version
  ) {
    throw new Error(`${source.relativePath} is not the declared current post-repair agent run`)
  }
  return {
    ...source,
    signature: `${source.signature}|${manifestSource.signature}|${digest}`,
  }
}

function baseDescriptor(
  id: PublicDatasetId,
  input: Omit<PublicDatasetDescriptor, 'id' | 'licence' | 'correctionHref' | 'apiPath'>,
): PublicDatasetDescriptor {
  return {
    id,
    ...input,
    licence: LICENCE,
    correctionHref: CORRECTION_HREF,
    apiPath: `/api/datasets/${id}`,
  }
}

async function buildEnzymeNegatives(
  absolutePath: string,
  relativePath: string,
): Promise<LoadedPublicDataset> {
  const raw = await readJsonObject(absolutePath, 'enzyme and transporter run')
  const run = deterministicRun(raw, 'enzyme and transporter artifact')
  const output = record(run.output, 'enzyme and transporter output')

  interface Group {
    medicineSlug: string
    medicineName: string
    counterparty: string
    role: string
    assertedCount: number
    deniedCount: number
    polarityNotRecordedCount: number
    sentences: PublicDatasetSentenceRecord[]
  }

  const groups = new Map<string, Group>()

  for (const counterpartyRecord of records(output.counterparties, 'counterparties')) {
    const counterparty = text(counterpartyRecord.counterparty, 'counterparty')
    for (const mention of records(counterpartyRecord.mentions, `${counterparty}.mentions`)) {
      const medicineSlug = text(mention.slug, `${counterparty}.mention.slug`)
      const medicineName = text(mention.name, `${counterparty}.mention.name`)
      const role = optionalText(mention.role) ?? 'NOT_RECORDED'
      const rawPolarity = mention.polarity
      if (rawPolarity !== undefined && rawPolarity !== 'ASSERTED' && rawPolarity !== 'NEGATED') {
        throw new Error(`${counterparty}.mention.polarity has an unknown value`)
      }
      const polarity = rawPolarity ?? 'NOT_RECORDED'
      if (typeof mention.matchesSourceCasing !== 'boolean') {
        throw new Error(`${counterparty}.mention.matchesSourceCasing is not a boolean`)
      }
      const sentence: PublicDatasetSentenceRecord = {
        polarity,
        labelSection: optionalText(mention.labelSection),
        matchesSourceCasing: mention.matchesSourceCasing,
        sourceKind: text(mention.sourceKind, `${counterparty}.mention.sourceKind`),
        sourceIdentifier: text(
          mention.sourceIdentifier,
          `${counterparty}.mention.sourceIdentifier`,
        ),
        sourceLabel: optionalText(mention.sourceLabel),
        sourceLocator: optionalText(mention.sourceLocator),
        sourceVersion: optionalText(mention.sourceVersion),
        sourceEffectiveDate: optionalText(mention.sourceEffectiveDate),
        sourceHref: publicBackgroundSourceHref({
          kind: text(mention.sourceKind, `${counterparty}.mention.sourceKind`),
          identifier: text(mention.sourceIdentifier, `${counterparty}.mention.sourceIdentifier`),
        }),
        retrievedAt: text(mention.retrievedAt, `${counterparty}.mention.retrievedAt`),
        excerpt: text(mention.excerpt, `${counterparty}.mention.excerpt`),
      }
      const key = JSON.stringify([medicineSlug, counterparty, role])
      const held = groups.get(key)
      if (held && held.medicineName !== medicineName) {
        throw new Error(`${medicineSlug} has inconsistent names in one counterparty-role group`)
      }
      const group =
        held ??
        ({
          medicineSlug,
          medicineName,
          counterparty,
          role,
          assertedCount: 0,
          deniedCount: 0,
          polarityNotRecordedCount: 0,
          sentences: [],
        } satisfies Group)
      if (polarity === 'ASSERTED') group.assertedCount += 1
      else if (polarity === 'NEGATED') group.deniedCount += 1
      else group.polarityNotRecordedCount += 1
      group.sentences.push(sentence)
      groups.set(key, group)
    }
  }

  const groupedRows = [...groups.values()].sort(
    (left, right) =>
      left.medicineSlug.localeCompare(right.medicineSlug) ||
      left.counterparty.localeCompare(right.counterparty) ||
      left.role.localeCompare(right.role),
  )
  const rows: PublicDatasetRow[] = groupedRows.map((group) => ({
    medicineSlug: group.medicineSlug,
    medicineName: group.medicineName,
    counterparty: group.counterparty,
    role: group.role,
    assertedCount: group.assertedCount,
    deniedCount: group.deniedCount,
    polarityNotRecordedCount: group.polarityNotRecordedCount,
    sentences: group.sentences,
  }))

  const coverage = record(run.coverage, 'enzyme and transporter coverage')
  const roleCounts = new Map<string, number>()
  for (const group of groupedRows) {
    const role = group.role
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1)
  }
  const roles = [...roleCounts.keys()].sort()
  const counterparties = [...new Set(groupedRows.map((row) => row.counterparty))].sort()
  const uniqueMedicines = new Set(groupedRows.map((row) => row.medicineSlug)).size
  const assertedCount = groupedRows.reduce((sum, row) => sum + row.assertedCount, 0)
  const deniedCount = groupedRows.reduce((sum, row) => sum + row.deniedCount, 0)
  const polarityNotRecordedCount = groupedRows.reduce(
    (sum, row) => sum + row.polarityNotRecordedCount,
    0,
  )

  const sourceExampleFor = (
    predicate: (group: Group) => boolean,
    polarity: PublicDatasetSentenceRecord['polarity'],
  ): PublicDatasetSourceExample[] => {
    const group = groupedRows.find(predicate)
    const sentence = group?.sentences.find((candidate) => candidate.polarity === polarity)
    if (!group || !sentence) return []
    return [
      {
        label: `${group.medicineName} · ${group.counterparty} ${group.role.toLowerCase()}`,
        detail: `${group.assertedCount} asserted · ${group.deniedCount} denied · ${group.polarityNotRecordedCount} polarity not recorded`,
        sourceIdentifier: `${sentence.sourceKind}:${sentence.sourceIdentifier}`,
        ...(sentence.sourceHref ? { sourceHref: sentence.sourceHref } : {}),
        excerpt: sentence.excerpt,
      },
    ]
  }

  const descriptor = baseDescriptor('enzyme-transporter-negatives', {
    title: 'Recorded enzyme and transporter findings by polarity',
    shortTitle: 'Enzyme and transporter findings',
    purpose:
      'Inspect every admitted source sentence for an exact medicine, enzyme or transporter, and recorded role, with assertions, denials, and unresolved polarity counted separately.',
    doesNotMean:
      'This is not a drug interaction checker. A denial applies only to the named medicine, role, counterparty, conditions, and source sentence; it is not proof of no interaction and is not dosing or treatment advice.',
    methodology: [
      'A deterministic parser reads recorded FDA-label excerpts for named enzymes and transporters.',
      'A mention is admitted only when the stored excerpt contains the recorded counterparty, allowing letter-case differences only.',
      'Every admitted mention is grouped by exact medicine slug, recorded counterparty spelling, and exact role. A missing role remains NOT_RECORDED rather than being assigned to another group.',
      'Each sentence carries the exact source version and effective date when recorded; the API serializes null and the page says not recorded when either is absent.',
      'The API paginates groups. Within each returned group, sentences is the complete untruncated list used by the three polarity counts.',
    ],
    schema: [
      {
        key: 'medicineSlug',
        label: 'Medicine slug',
        type: 'string',
        description: 'Stable RNAWiki medicine route key.',
      },
      {
        key: 'medicineName',
        label: 'Medicine name',
        type: 'string',
        description: 'Recorded medicine name; not normalized for display style.',
      },
      {
        key: 'counterparty',
        label: 'Enzyme or transporter',
        type: 'string',
        description: 'The exact recorded counterparty spelling.',
      },
      {
        key: 'role',
        label: 'Role',
        type: 'string',
        description:
          'SUBSTRATE, INHIBITOR, INDUCER, or NOT_RECORDED when the sentence did not settle one role.',
      },
      {
        key: 'assertedCount',
        label: 'Asserted sentences',
        type: 'number',
        description: 'Sentence records whose polarity is ASSERTED.',
      },
      {
        key: 'deniedCount',
        label: 'Denied sentences',
        type: 'number',
        description: 'Sentence records whose polarity is NEGATED.',
      },
      {
        key: 'polarityNotRecordedCount',
        label: 'Polarity not recorded',
        type: 'number',
        description: 'Sentence records for which the parser did not settle assertion or denial.',
      },
      {
        key: 'sentences',
        label: 'Complete sentence records',
        type: 'sentence[]',
        description:
          'Every admitted sentence for this group, with polarity, section, source identity, source version/effective date or explicit absence, retrieval date, and exact excerpt. The list is not truncated.',
      },
    ],
    coverage: [
      { label: 'Medicine–counterparty–role groups', value: rows.length },
      {
        label: 'Source sentence records',
        value: assertedCount + deniedCount + polarityNotRecordedCount,
      },
      { label: 'Asserted sentences', value: assertedCount },
      { label: 'Denied sentences', value: deniedCount },
      { label: 'Polarity not recorded', value: polarityNotRecordedCount },
      { label: 'Medicines represented', value: uniqueMedicines },
      { label: 'Counterparties represented', value: counterparties.length },
      {
        label: 'Corpus records considered',
        value: numberValue(coverage.considered, 'coverage.considered'),
        detail:
          'All corpus records were checked; a record without a documented counterparty cannot produce a row in this projection.',
      },
      ...roles.map((role) => ({
        label: `${role.toLowerCase()} groups`,
        value: roleCounts.get(role) ?? 0,
      })),
    ],
    generatedAt: text(run.runDate, 'enzyme and transporter runDate'),
    version: text(run.version, 'enzyme and transporter version'),
    sourceArtifact: relativePath,
    sourceLimitations: [
      ...safeCaveats(run.caveats, 'enzyme and transporter caveats'),
      'The public rows enumerate documentation about one medicine and one named counterparty. They never create medicine-to-medicine pairs and cannot answer whether two medicines interact.',
      'A NOT_RECORDED role or polarity remains unresolved. It is never folded into an assertion or a denial.',
      'Each returned group includes every admitted source sentence for checking, but the full source document remains authoritative.',
    ],
    rowCount: rows.length,
    filters: [
      COMMON_FILTER,
      {
        parameter: 'role',
        label: 'Role',
        description: 'Exact recorded role.',
        values: roles,
      },
      {
        parameter: 'counterparty',
        label: 'Enzyme or transporter',
        description: 'Exact recorded counterparty spelling.',
        values: counterparties,
      },
    ],
    sourceExamples: [
      ...sourceExampleFor((group) => group.assertedCount > 0 && group.deniedCount > 0, 'NEGATED'),
      ...sourceExampleFor((group) => group.deniedCount > 0 && group.assertedCount === 0, 'NEGATED'),
      ...sourceExampleFor((group) => group.polarityNotRecordedCount > 0, 'NOT_RECORDED'),
    ],
  })

  return {
    descriptor,
    rows,
    searchFields: ['medicineSlug', 'medicineName', 'counterparty', 'role', 'sentences'],
  }
}

const SOURCE_KIND_SET: ReadonlySet<string> = new Set(BACKGROUND_SOURCE_KINDS)
const PRINTED_NUMBER = /[-+]?\d(?:[\d,.]*\d)?/u
const ORDINARY_QUESTION_IDS = [
  'purpose',
  'people-result',
  'result-magnitude',
  'harm-or-limitation',
  'applicability',
  'unknown-conflicting-stale',
] as const

interface RecordedSourceFact {
  kind: BackgroundSourceKind
  identifier: string
  label: string
  locator: string | null
  version: string | null
  effectiveDate: string | null
  retrievedAt: string
  excerpt: string | null
}

interface RecordedBackgroundFacts {
  ordinaryQuestionsAnswered: string[]
  specialistModules: string[]
  sourceBoundStatementCount: number
  distinctSourceCount: number
  sourceKinds: string[]
  machineVerifiableSourceKinds: string[]
  machineVerifiableSourceWithExcerptCount: number
  qualifyingSourceWithExcerptCount: number
  noSourceReadState:
    'SOURCE_READ_RECORDED' | 'SOURCE_RECORDED_NO_QUALIFYING_READ' | 'NO_QUALIFYING_SOURCE_RECORDED'
  sourcesByQuestion: ReadonlyMap<string, readonly RecordedSourceFact[]>
}

interface RecordedBackgroundFactsIndex {
  signature: string
  bySlug: Map<string, RecordedBackgroundFacts>
}

let recordedBackgroundFactsCache: RecordedBackgroundFactsIndex | null = null
let recordedBackgroundFactsLoading: {
  signature: string
  promise: Promise<RecordedBackgroundFactsIndex>
} | null = null

function objectValue(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null
}

function nonBlank(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function recordedSource(value: unknown): RecordedSourceFact | null {
  const source = objectValue(value)
  if (
    !source ||
    !nonBlank(source.kind) ||
    !SOURCE_KIND_SET.has(source.kind) ||
    !nonBlank(source.identifier) ||
    !nonBlank(source.label) ||
    !nonBlank(source.retrievedAt)
  ) {
    return null
  }
  return {
    kind: source.kind as BackgroundSourceKind,
    identifier: source.identifier,
    label: source.label,
    locator: optionalText(source.locator),
    version: optionalText(source.version),
    effectiveDate: optionalText(source.effectiveDate),
    retrievedAt: source.retrievedAt,
    excerpt: nonBlank(source.excerpt) ? source.excerpt : null,
  }
}

function publicSource(source: RecordedSourceFact): PublicDatasetSourceRecord {
  return {
    sourceKind: source.kind,
    sourceIdentifier: source.identifier,
    sourceLabel: source.label,
    sourceLocator: source.locator,
    sourceVersion: source.version,
    sourceEffectiveDate: source.effectiveDate,
    sourceHref: publicBackgroundSourceHref(source),
    retrievedAt: source.retrievedAt,
    excerpt: source.excerpt,
  }
}

function collectRecordedSources(value: unknown, into: RecordedSourceFact[]): void {
  const source = recordedSource(value)
  if (source) {
    into.push(source)
    return
  }
  if (Array.isArray(value)) {
    for (const child of value) collectRecordedSources(child, into)
    return
  }
  const parent = objectValue(value)
  if (parent) for (const child of Object.values(parent)) collectRecordedSources(child, into)
}

const PUBLIC_SILENCE_QUESTION_IDS = [
  'half_life',
  'bioavailability',
  't_max',
  'protein_binding',
  'volume_of_distribution',
  'mechanism_of_action',
  'molecular_identity',
  'metabolic_handling',
  'boxed_warning',
  'contraindications',
  'most_common_adverse_reactions',
  'population_pediatric',
  'population_geriatric',
  'population_pregnancy',
  'population_lactation',
  'population_hepatic_impairment',
  'population_renal_impairment',
] as const

export type PublicSilenceMeaning =
  | 'EXPLICIT_NOT_ESTABLISHED'
  | 'SOURCE_READ_NO_ANSWER'
  | 'NO_QUALIFYING_SOURCE_READ'
  | 'SOURCE_KIND_NOT_MACHINE_VERIFIABLE'
  | 'SOURCE_RECORDED_NO_QUALIFYING_READ'

export interface PublicSilenceScope {
  silenceMeaning: PublicSilenceMeaning | null
  sources: PublicDatasetSourceRecord[]
  recordedSourceCount: number
  recordedSourceKinds: string[]
  machineVerifiableSourceKinds: string[]
}

function sourcesAt(value: unknown): RecordedSourceFact[] {
  const sources: RecordedSourceFact[] = []
  collectRecordedSources(value, sources)
  return sources
}

function distinctRecordedSources(sources: readonly RecordedSourceFact[]): RecordedSourceFact[] {
  const seen = new Set<string>()
  const output: RecordedSourceFact[] = []
  for (const source of sources) {
    const key = JSON.stringify([
      source.kind,
      source.identifier,
      source.label,
      source.locator,
      source.version,
      source.effectiveDate,
      source.retrievedAt,
      source.excerpt,
    ])
    if (seen.has(key)) continue
    seen.add(key)
    output.push(source)
  }
  return output
}

function consensusFieldSources(background: UnknownRecord, field: string): RecordedSourceFact[] {
  const consensus = objectValue(background.sourceConsensus)
  const matchingFields = arrayValue(consensus?.fields).filter(
    (candidate) => objectValue(candidate)?.field === field,
  )
  return matchingFields.flatMap((candidate) => sourcesAt(objectValue(candidate)?.readings))
}

/** Sources attached to the exact field or statement collection asked about by one ledger row. */
function questionScopedSources(
  background: UnknownRecord,
  questionId: string,
): RecordedSourceFact[] {
  const pharmacokinetics = objectValue(background.pharmacokinetics)
  const molecularIdentity = objectValue(background.molecularIdentity)
  const safety = objectValue(background.safety)
  const population = questionId.startsWith('population_')
    ? questionId.slice('population_'.length).toUpperCase()
    : null
  let sources: RecordedSourceFact[]

  switch (questionId) {
    case 'half_life':
      sources = [
        ...sourcesAt(pharmacokinetics?.halfLife),
        ...consensusFieldSources(background, 'halfLife'),
      ]
      break
    case 'bioavailability':
      sources = [
        ...sourcesAt(pharmacokinetics?.bioavailability),
        ...consensusFieldSources(background, 'bioavailability'),
      ]
      break
    case 't_max':
      sources = [...sourcesAt(pharmacokinetics?.tMax), ...consensusFieldSources(background, 'tMax')]
      break
    case 'protein_binding':
      sources = [
        ...sourcesAt(pharmacokinetics?.proteinBinding),
        ...consensusFieldSources(background, 'proteinBinding'),
      ]
      break
    case 'volume_of_distribution':
      sources = [
        ...sourcesAt(pharmacokinetics?.volumeOfDistribution),
        ...consensusFieldSources(background, 'volumeOfDistribution'),
      ]
      break
    case 'mechanism_of_action':
      sources = sourcesAt(objectValue(background.mechanism)?.statements)
      break
    case 'molecular_identity':
      sources = [
        ...sourcesAt(molecularIdentity?.molecularFormula),
        ...sourcesAt(molecularIdentity?.molecularWeight),
      ]
      break
    case 'metabolic_handling':
      sources = sourcesAt(background.interactionSignals)
      break
    case 'boxed_warning':
      sources = sourcesAt(safety?.boxedWarning)
      break
    case 'contraindications':
      sources = sourcesAt(safety?.contraindications)
      break
    case 'most_common_adverse_reactions':
      sources = sourcesAt(background.commonAdverseReactions)
      break
    default:
      if (population) {
        sources = arrayValue(background.populationStatements)
          .filter((statement) => objectValue(statement)?.population === population)
          .flatMap(sourcesAt)
        break
      }
      throw new Error(`Unknown silence question: ${questionId}`)
  }
  return distinctRecordedSources(sources)
}

function silenceScopeFromSources(
  state: string,
  sources: readonly RecordedSourceFact[],
): PublicSilenceScope {
  if (!['RECORDED', 'NOT_ESTABLISHED', 'SILENT'].includes(state)) {
    throw new Error(`Unknown silence state: ${state}`)
  }
  const publicSources = sources.map(publicSource)
  const sourceKeys = new Set(sources.map((source) => `${source.kind}:${source.identifier}`))
  const recordedSourceKinds = [...new Set(sources.map((source) => source.kind))].sort()
  const machineVerifiable = sources.filter((source) => publicBackgroundSourceHref(source) !== null)
  const machineVerifiableSourceKinds = [
    ...new Set(machineVerifiable.map((source) => source.kind)),
  ].sort()

  let silenceMeaning: PublicSilenceMeaning | null = null
  if (state === 'NOT_ESTABLISHED') silenceMeaning = 'EXPLICIT_NOT_ESTABLISHED'
  else if (state === 'SILENT') {
    silenceMeaning =
      sources.length === 0
        ? 'NO_QUALIFYING_SOURCE_READ'
        : machineVerifiable.length === 0
          ? 'SOURCE_KIND_NOT_MACHINE_VERIFIABLE'
          : machineVerifiable.some((source) => source.excerpt !== null)
            ? 'SOURCE_READ_NO_ANSWER'
            : 'SOURCE_RECORDED_NO_QUALIFYING_READ'
  }

  return {
    silenceMeaning,
    sources: publicSources,
    recordedSourceCount: sourceKeys.size,
    recordedSourceKinds,
    machineVerifiableSourceKinds,
  }
}

function sourcesBoundToIdentifiers(
  sources: readonly RecordedSourceFact[],
  sourceIdentifiers: readonly string[],
): RecordedSourceFact[] {
  const allowed = new Set(sourceIdentifiers)
  return sources.filter((source) => allowed.has(`${source.kind}:${source.identifier}`))
}

/** Pure, fail-closed projection used by the reader and focused source-scope tests. */
export function derivePublicSilenceScope(input: {
  state: string
  questionId: string
  recordedBackground: unknown
  sourceIdentifiers?: readonly string[]
}): PublicSilenceScope {
  if (!(PUBLIC_SILENCE_QUESTION_IDS as readonly string[]).includes(input.questionId)) {
    throw new Error(`Unknown silence question: ${input.questionId}`)
  }
  const background = record(input.recordedBackground, 'recorded background')
  const questionSources = questionScopedSources(background, input.questionId)
  const sourceIdentifiers =
    input.sourceIdentifiers ??
    (input.state === 'SILENT'
      ? []
      : questionSources.map((source) => `${source.kind}:${source.identifier}`))
  return silenceScopeFromSources(
    input.state,
    sourcesBoundToIdentifiers(questionSources, sourceIdentifiers),
  )
}

function sourceBoundStatement(value: unknown): boolean {
  const statement = objectValue(value)
  return Boolean(
    statement && nonBlank(statement.textAsRecorded) && recordedSource(statement.source),
  )
}

function sourceBoundPivotalResult(value: unknown): boolean {
  const result = objectValue(value)
  return Boolean(
    result &&
    nonBlank(result.trialIdentifier) &&
    nonBlank(result.endpointAsRecorded) &&
    nonBlank(result.activeResultAsRecorded) &&
    nonBlank(result.timepointAsRecorded) &&
    recordedSource(result.source),
  )
}

function pivotalMagnitude(value: unknown): boolean {
  if (!sourceBoundPivotalResult(value)) return false
  const result = value as UnknownRecord
  return [result.activeResultAsRecorded, result.differenceAsRecorded].some(
    (printed) => nonBlank(printed) && PRINTED_NUMBER.test(printed) && /[%\p{L}]/u.test(printed),
  )
}

function sourceBoundApplicability(value: unknown): boolean {
  const applicability = objectValue(value)
  return Boolean(
    applicability &&
    nonBlank(applicability.trialIdentifier) &&
    arrayValue(applicability.includedAsRecorded).some(nonBlank) &&
    recordedSource(applicability.source),
  )
}

function sourceBoundMolecularIdentity(value: unknown): boolean {
  const identity = objectValue(value)
  if (!identity) return false
  return ['molecularFormula', 'molecularWeight'].some((key) => {
    const recorded = objectValue(identity[key])
    return Boolean(recorded && nonBlank(recorded.display) && recordedSource(recorded.source))
  })
}

function backgroundFacts(value: unknown): RecordedBackgroundFacts {
  const background = record(value, 'recorded background')
  const sources: RecordedSourceFact[] = []
  collectRecordedSources(background, sources)

  const recordedUses = objectValue(background.recordedUses)
  const pivotalResults = arrayValue(background.pivotalResults).filter(sourceBoundPivotalResult)
  const safety = objectValue(background.safety)
  const applicability = background.applicability
  const ordinaryQuestionsAnswered: string[] = []
  if (arrayValue(recordedUses?.statements).some(sourceBoundStatement)) {
    ordinaryQuestionsAnswered.push('purpose')
  }
  if (pivotalResults.length > 0) ordinaryQuestionsAnswered.push('people-result')
  if (pivotalResults.some(pivotalMagnitude)) ordinaryQuestionsAnswered.push('result-magnitude')
  if (
    sourceBoundStatement(safety?.boxedWarning) ||
    arrayValue(safety?.contraindications).some(sourceBoundStatement)
  ) {
    ordinaryQuestionsAnswered.push('harm-or-limitation')
  }
  if (sourceBoundApplicability(applicability)) ordinaryQuestionsAnswered.push('applicability')

  const sourceKinds = [...new Set(sources.map((source) => source.kind))].sort()
  const machineVerifiableSources = sources.filter(
    (source) => canonicalLocatorForBackgroundSource(source) !== null,
  )
  const machineVerifiableSourceKinds = [
    ...new Set(machineVerifiableSources.map((source) => source.kind)),
  ].sort()
  const sourceExcerptCount = sources.filter((source) => source.excerpt !== null).length
  const specialistModules: string[] = []
  if (sourceBoundMolecularIdentity(background.molecularIdentity)) {
    specialistModules.push('chemistryIdentity')
  }
  if (pivotalResults.some((result) => nonBlank((result as UnknownRecord).uncertaintyAsRecorded))) {
    specialistModules.push('quantitativeUncertainty')
  }
  if (sourceExcerptCount > 0) specialistModules.push('sourceRead')
  const sourcesByQuestion = new Map<string, readonly RecordedSourceFact[]>(
    PUBLIC_SILENCE_QUESTION_IDS.map((questionId) => [
      questionId,
      questionScopedSources(background, questionId),
    ]),
  )

  return {
    ordinaryQuestionsAnswered,
    specialistModules,
    sourceBoundStatementCount: sources.length,
    distinctSourceCount: new Set(sources.map((source) => `${source.kind}:${source.identifier}`))
      .size,
    sourceKinds,
    machineVerifiableSourceKinds,
    machineVerifiableSourceWithExcerptCount: machineVerifiableSources.filter(
      (source) => source.excerpt !== null,
    ).length,
    qualifyingSourceWithExcerptCount: sourceExcerptCount,
    noSourceReadState:
      sources.length === 0
        ? 'NO_QUALIFYING_SOURCE_RECORDED'
        : sourceExcerptCount > 0
          ? 'SOURCE_READ_RECORDED'
          : 'SOURCE_RECORDED_NO_QUALIFYING_READ',
    sourcesByQuestion,
  }
}

async function loadRecordedBackgroundFacts(): Promise<RecordedBackgroundFactsIndex> {
  const source = await resolveSource(['data/recorded-background.ndjson'])
  if (recordedBackgroundFactsCache?.signature === source.signature) {
    return recordedBackgroundFactsCache
  }
  if (recordedBackgroundFactsLoading?.signature === source.signature) {
    return recordedBackgroundFactsLoading.promise
  }

  const promise = (async (): Promise<RecordedBackgroundFactsIndex> => {
    const bySlug = new Map<string, RecordedBackgroundFacts>()
    const rawLines = (await readFile(source.absolutePath, 'utf8'))
      .split('\n')
      .filter((line) => line.trim().length > 0)
    for (const [lineIndex, line] of rawLines.entries()) {
      const row = record(JSON.parse(line) as unknown, `recorded background line ${lineIndex + 1}`)
      const slug = text(row.slug, `recorded background line ${lineIndex + 1}.slug`)
      if (bySlug.has(slug)) throw new Error(`Duplicate recorded-background slug: ${slug}`)
      bySlug.set(slug, backgroundFacts(row.recordedBackground))
    }

    recordedBackgroundFactsCache = { signature: source.signature, bySlug }
    return recordedBackgroundFactsCache
  })()
  recordedBackgroundFactsLoading = { signature: source.signature, promise }
  try {
    return await promise
  } finally {
    if (recordedBackgroundFactsLoading?.promise === promise) {
      recordedBackgroundFactsLoading = null
    }
  }
}

/**
 * Snapshot metadata for one exported file, read from the manifest the exporter wrote.
 *
 * The declared schema version falls back to the version this code was written against, so a reader
 * can still open a freshly exported file whose manifest entry has not been committed yet.
 */
async function manifestFileMetadata(
  /**
   * One published path, or a predicate for a sharded dataset. Every shard of one dataset carries
   * the same schema version, description and limitation, so the first matching entry describes the
   * whole set.
   */
  match: string | ((path: string) => boolean),
  fallbackVersion: string,
): Promise<{
  generatedAt: string
  version: string
  limitation: string | null
}> {
  const manifestPath = join(process.cwd(), 'data/manifest.json')
  const manifest = await readJsonObject(manifestPath, 'dataset manifest')
  const files = records(manifest.files, 'dataset manifest files')
  const matches = typeof match === 'string' ? (path: string) => path === match : match
  const entry = files.find(
    (candidate) => typeof candidate.path === 'string' && matches(candidate.path),
  )
  const label = typeof match === 'string' ? match : 'the sharded dataset'
  return {
    generatedAt: text(manifest.generatedAt, 'dataset manifest generatedAt'),
    version: entry ? text(entry.schemaVersion, `${label} schema`) : fallbackVersion,
    limitation: entry ? optionalText(entry.limitations) : null,
  }
}

async function manifestMetadata(): Promise<{
  generatedAt: string
  version: string
  limitation: string | null
}> {
  return manifestFileMetadata('data/source-consensus.ndjson', 'source-consensus/2')
}

async function buildSourceConsensus(
  absolutePath: string,
  relativePath: string,
): Promise<LoadedPublicDataset> {
  const comparisonStates = ['agree', 'differ', 'not_comparable', 'insufficient_context'] as const
  const comparisonStateSet = new Set<string>(comparisonStates)
  const rawLines = (await readFile(absolutePath, 'utf8'))
    .split('\n')
    .filter((line) => line.trim().length > 0)
  const rows: PublicDatasetRow[] = rawLines.map((line, lineIndex) => {
    const raw = record(JSON.parse(line) as unknown, `source consensus line ${lineIndex + 1}`)
    const readings: PublicDatasetConsensusReadingRecord[] = records(
      raw.readings,
      `source consensus line ${lineIndex + 1}.readings`,
    ).map((reading, readingIndex) => {
      const context = `source consensus line ${lineIndex + 1}.readings[${readingIndex}]`
      const sourceCount = numberValue(reading.sourceCount, 'source consensus reading sourceCount')
      if (!Number.isInteger(sourceCount) || sourceCount < 1) {
        throw new Error(`${context}.sourceCount is not a positive integer`)
      }
      const sources = records(reading.sources, `${context}.sources`).map((source, sourceIndex) => {
        const parsed = recordedSource(source)
        if (!parsed) throw new Error(`${context}.sources[${sourceIndex}] is not a valid source`)
        return publicSource(parsed)
      })
      if (sources.length !== sourceCount) {
        throw new Error(
          `${context} is incomplete: sourceCount=${sourceCount}, sources.length=${sources.length}`,
        )
      }
      return {
        display: text(reading.display, `${context}.display`),
        numeric: optionalNumber(reading.numeric),
        unit: optionalText(reading.unit),
        populationContext: text(reading.populationContext, `${context}.populationContext`),
        sourceCount,
        sources,
      }
    })
    const sourceCount = numberValue(raw.sourceCount, 'source consensus sourceCount')
    const representedSources = readings.reduce((sum, reading) => sum + reading.sourceCount, 0)
    if (representedSources !== sourceCount) {
      throw new Error(
        `source consensus line ${lineIndex + 1} is incomplete: sourceCount=${sourceCount}, represented=${representedSources}`,
      )
    }

    const comparisonState = text(raw.comparisonState, 'source consensus comparisonState')
    if (!comparisonStateSet.has(comparisonState)) {
      throw new Error(`source consensus line ${lineIndex + 1} has an unknown comparison state`)
    }
    return {
      medicineSlug: text(raw.slug, 'source consensus slug'),
      field: text(raw.field, 'source consensus field'),
      comparisonState,
      comparisonReasons: stringList(raw.comparisonReasons, 'source consensus comparisonReasons'),
      documentsExamined: numberValue(raw.documentsExamined, 'source consensus documentsExamined'),
      sourceCount,
      agreementRate: optionalNumber(raw.agreementRate),
      readings,
    }
  })

  const stateCounts = new Map<string, number>()
  const fieldCounts = new Map<string, number>()
  for (const row of rows) {
    const state = String(row.comparisonState)
    const field = String(row.field)
    stateCounts.set(state, (stateCounts.get(state) ?? 0) + 1)
    fieldCounts.set(field, (fieldCounts.get(field) ?? 0) + 1)
  }
  const states = [...comparisonStates]
  const fields = [...fieldCounts.keys()].sort()
  const manifest = await manifestMetadata()

  const examples = comparisonStates.flatMap((state) => {
    const row = rows.find((candidate) => candidate.comparisonState === state)
    if (!row) return []
    const readings = Array.isArray(row.readings)
      ? (row.readings as PublicDatasetConsensusReadingRecord[])
      : []
    const source = readings[0]?.sources[0]
    return [
      {
        label: `${String(row.medicineSlug)} · ${String(row.field)} · ${state}`,
        detail: `${String(row.documentsExamined)} documents examined; ${readings.map((reading) => `${reading.display} (${reading.populationContext})`).join('; ')}`,
        sourceIdentifier: source ? `${source.sourceKind}:${source.sourceIdentifier}` : undefined,
        sourceHref: source?.sourceHref ?? undefined,
        excerpt: source?.excerpt ?? undefined,
      },
    ]
  })

  const descriptor = baseDescriptor('source-consensus', {
    title: 'Recorded source agreement and disagreement',
    shortTitle: 'Source agreement and disagreement',
    purpose:
      'Show whether sources print one normalized reading, have incompatible units, lack structured comparison context, or contain a context-matched numeric difference.',
    doesNotMean:
      'agree can mean only that sources print the same normalized reading; it is not clinical-context equivalence, independent replication, or proof. differ requires matching structured context and disjoint comparable values. not_comparable and insufficient_context are not disagreement.',
    methodology: [
      'Deterministic rules normalize recorded pharmacokinetic readings and compare only like-for-like values.',
      'One normalized printed reading may be agree even when clinical context was not extracted; this reports printed-reading agreement only.',
      'Distinct readings may differ only when their units and denominators are comparable and one matching, non-placeholder population/formulation context was structurally extracted. Otherwise they are insufficient_context.',
      'not_comparable preserves incompatible units or denominators instead of guessing. insufficient_context preserves missing or non-matching structured context instead of manufacturing agreement or disagreement.',
      'The agreement rate describes the distribution of recorded source readings; it is not a probability that a value is true.',
      'Every distinct printed reading retains its unit, population context, source count, and complete source records. The API paginates field rows, never child readings or sources.',
      'documentsExamined is every matching single-substance archive document inspected for that medicine. The generator has no document, reading, or source ceiling, so there is no hidden available-versus-retained remainder.',
    ],
    schema: [
      {
        key: 'medicineSlug',
        label: 'Medicine slug',
        type: 'string',
        description: 'Stable RNAWiki medicine route key.',
      },
      {
        key: 'field',
        label: 'Compared field',
        type: 'string',
        description: 'Recorded pharmacokinetic field being compared.',
      },
      {
        key: 'comparisonState',
        label: 'Comparison state',
        type: 'string',
        description:
          'agree (printed-reading agreement), differ (context-matched comparable disjoint values), not_comparable (unit/denominator mismatch), or insufficient_context. Every state remains declared even when its current count is zero.',
      },
      {
        key: 'comparisonReasons',
        label: 'Reason codes',
        type: 'string[]',
        description: 'Deterministic codes explaining the state.',
      },
      {
        key: 'documentsExamined',
        label: 'Documents examined',
        type: 'number',
        description: 'Recorded source documents considered for the field.',
      },
      {
        key: 'sourceCount',
        label: 'Source count',
        type: 'number',
        description: 'Recorded source readings represented.',
      },
      {
        key: 'agreementRate',
        label: 'Agreement rate',
        type: 'number',
        description:
          'Share represented by the leading normalized printed-reading group; not a confidence score or clinical agreement probability.',
      },
      {
        key: 'readings',
        label: 'Recorded readings',
        type: 'consensus-reading[]',
        description:
          'Complete, untruncated reading groups. Each keeps the printed display, numeric value when parsed, unit, population context, source count, and every source identity, version/effective date or explicit absence, retrieval date, locator, safe link, and excerpt.',
      },
    ],
    coverage: [
      { label: 'Compared medicine fields', value: rows.length },
      ...comparisonStates.map((state) => ({
        label:
          state === 'not_comparable'
            ? 'Not comparable'
            : state === 'insufficient_context'
              ? 'Insufficient context'
              : state[0]!.toUpperCase() + state.slice(1),
        value: stateCounts.get(state) ?? 0,
      })),
      { label: 'Fields represented', value: fields.length, detail: fields.join(', ') },
    ],
    generatedAt: manifest.generatedAt,
    version: manifest.version,
    sourceArtifact: relativePath,
    sourceLimitations: [
      manifest.limitation ??
        'A source count can include repeated manufacturer wording and is not a count of independent experiments.',
      'The current deterministic parser does not structurally extract population or formulation context from these sentences. It records that context as unknown and cannot publish distinct same-unit readings as differ.',
      'Neither reading is marked wrong. Population, formulation, route, and other unextracted context may explain the printed difference.',
      'Only the recorded fields and source documents in this snapshot are compared.',
      'A source count is the number of retained source records in the row, not a count of independent experiments.',
    ],
    rowCount: rows.length,
    filters: [
      COMMON_FILTER,
      {
        parameter: 'state',
        label: 'Comparison state',
        description: 'Exact comparability state.',
        values: states,
      },
      {
        parameter: 'field',
        label: 'Compared field',
        description: 'Exact recorded field key.',
        values: fields,
      },
    ],
    sourceExamples: examples,
  })

  return {
    descriptor,
    rows,
    searchFields: ['medicineSlug', 'field', 'comparisonReasons', 'readings'],
  }
}

async function buildSilenceLedger(
  absolutePath: string,
  relativePath: string,
): Promise<LoadedPublicDataset> {
  const raw = await readJsonObject(absolutePath, 'silence ledger run')
  const run = deterministicRun(raw, 'silence ledger artifact')
  const output = record(run.output, 'silence ledger output')
  const questions = records(output.questions, 'silence ledger questions')
  const questionById = new Map(
    questions.map((question) => [
      text(question.id, 'silence question id'),
      {
        prompt: text(question.prompt, 'silence question prompt'),
        module: text(question.module, 'silence question module'),
      },
    ]),
  )
  const recordedBackground = await loadRecordedBackgroundFacts()
  const rows: PublicDatasetRow[] = []

  for (const medicine of records(output.medicines, 'silence ledger medicines')) {
    const medicineSlug = text(medicine.slug, 'silence medicine slug')
    const medicineName = text(medicine.name, 'silence medicine name')
    const facts = recordedBackground.bySlug.get(medicineSlug)
    if (!facts) throw new Error(`No recorded-background row for silence medicine ${medicineSlug}`)
    for (const entry of records(medicine.entries, `${medicineSlug}.entries`)) {
      const questionId = text(entry.questionId, `${medicineSlug}.questionId`)
      const question = questionById.get(questionId)
      if (!question) throw new Error(`Unknown silence question ${questionId}`)
      const state = text(entry.state, `${medicineSlug}.${questionId}.state`)
      const sourceIdentifiers = stringList(
        entry.sources,
        `${medicineSlug}.${questionId}.sourceIdentifiers`,
      )
      const scope = silenceScopeFromSources(
        state,
        sourcesBoundToIdentifiers(facts.sourcesByQuestion.get(questionId) ?? [], sourceIdentifiers),
      )
      rows.push({
        medicineSlug,
        medicineName,
        questionId,
        question: question.prompt,
        module: question.module,
        state,
        silenceMeaning: scope.silenceMeaning,
        mentionedWithoutFinding: entry.mentionedWithoutFinding === true,
        sourceIdentifiers,
        scopedSources: scope.sources,
        recordedSourceCount: scope.recordedSourceCount,
        recordedSourceKinds: scope.recordedSourceKinds,
        machineVerifiableSourceKinds: scope.machineVerifiableSourceKinds,
      })
    }
  }

  const totals = record(output.totals, 'silence ledger totals')
  const states = ['RECORDED', 'NOT_ESTABLISHED', 'SILENT']
  const meanings = [
    'EXPLICIT_NOT_ESTABLISHED',
    'SOURCE_READ_NO_ANSWER',
    'NO_QUALIFYING_SOURCE_READ',
    'SOURCE_KIND_NOT_MACHINE_VERIFIABLE',
    'SOURCE_RECORDED_NO_QUALIFYING_READ',
  ]
  const meaningCounts = new Map<string, number>()
  for (const row of rows) {
    if (typeof row.silenceMeaning !== 'string') continue
    meaningCounts.set(row.silenceMeaning, (meaningCounts.get(row.silenceMeaning) ?? 0) + 1)
  }
  const fields = [...questionById.keys()]
  const examples = meanings.flatMap((meaning) => {
    const row = rows.find((candidate) => candidate.silenceMeaning === meaning)
    if (!row) return []
    const sources = Array.isArray(row.sourceIdentifiers)
      ? row.sourceIdentifiers.filter((source): source is string => typeof source === 'string')
      : []
    return [
      {
        label: `${String(row.medicineName)} · ${String(row.questionId)} · ${String(row.state)}`,
        detail: `${meaning}. ${String(row.question)}`,
        sourceIdentifier: sources[0],
      },
    ]
  })

  const descriptor = baseDescriptor('silence-ledger', {
    title: 'Recorded silence and non-establishment',
    shortTitle: 'Silence and non-establishment',
    purpose:
      'Show, for each medicine and tracked question, whether the recorded source sections contain an answer, explicitly say the question is not established, or stay silent.',
    doesNotMean:
      'SILENT means only that this corpus did not record an answer from the sections it read. It is not evidence of safety, danger, or real-world absence. NOT_ESTABLISHED is an explicit source state and must not be collapsed into silence.',
    methodology: [
      `A fixed ${questions.length}-question set is applied deterministically to each medicine record.`,
      'RECORDED, NOT_ESTABLISHED, and SILENT remain distinct. Population mentions without a finding stay RECORDED but carry mentionedWithoutFinding=true.',
      'Each row is joined only when the ledger persists a source identifier for that occurrence and the same source object is attached to that exact question field or statement collection. An excerpt elsewhere in the medicine envelope cannot establish that this question was read.',
      'A source counts only when its kind, identifier, label, and retrieval date satisfy the checked-in background-source contract. SOURCE_READ_NO_ANSWER additionally requires that exact persisted binding, a nonblank excerpt, and a canonical machine-verifiable locator.',
      'This projection includes every medicine-question pair, every source identifier emitted by the ledger, and the complete exact-scope source records; it does not copy review-work fields.',
    ],
    schema: [
      {
        key: 'medicineSlug',
        label: 'Medicine slug',
        type: 'string',
        description: 'Stable RNAWiki medicine route key.',
      },
      {
        key: 'medicineName',
        label: 'Medicine name',
        type: 'string',
        description: 'Recorded medicine name.',
      },
      {
        key: 'questionId',
        label: 'Question key',
        type: 'string',
        description: 'Stable identifier from the fixed question set.',
      },
      {
        key: 'question',
        label: 'Question',
        type: 'string',
        description: 'The exact corpus-coverage question.',
      },
      {
        key: 'module',
        label: 'Module',
        type: 'string',
        description: 'Recorded-background module checked for an answer.',
      },
      {
        key: 'state',
        label: 'State',
        type: 'string',
        description: 'RECORDED, NOT_ESTABLISHED, or SILENT.',
      },
      {
        key: 'silenceMeaning',
        label: 'Silence meaning',
        type: 'string',
        description:
          'Explicit non-establishment or the exact source-read boundary behind SILENT; null for RECORDED.',
      },
      {
        key: 'mentionedWithoutFinding',
        label: 'Mention only',
        type: 'boolean',
        description: 'True when a population was mentioned without a settled finding.',
      },
      {
        key: 'sourceIdentifiers',
        label: 'Source identifiers',
        type: 'string[]',
        description: 'Exact recorded source bindings; empty for SILENT.',
      },
      {
        key: 'scopedSources',
        label: 'Exact question sources',
        type: 'source[]',
        description:
          'Complete valid source objects attached to this exact question field or statement collection, including version/effective date or explicit absence, with safe allowlisted links when a canonical adapter exists.',
      },
      {
        key: 'recordedSourceCount',
        label: 'Recorded source documents',
        type: 'number',
        description:
          'Distinct qualifying source kind-and-identifier pairs attached to this exact question scope.',
      },
      {
        key: 'recordedSourceKinds',
        label: 'Recorded source kinds',
        type: 'string[]',
        description: 'Qualifying source kinds attached to this exact question scope.',
      },
      {
        key: 'machineVerifiableSourceKinds',
        label: 'Machine-verifiable source kinds',
        type: 'string[]',
        description:
          'Exact-scope recorded kinds for which the checked-in source-fetch contract defines a canonical locator.',
      },
    ],
    coverage: [
      { label: 'Medicine-question rows', value: rows.length },
      { label: 'Medicines', value: numberValue(totals.medicines, 'silence totals medicines') },
      { label: 'Questions', value: numberValue(totals.questions, 'silence totals questions') },
      { label: 'Recorded', value: numberValue(totals.recorded, 'silence totals recorded') },
      {
        label: 'Not established',
        value: numberValue(totals.notEstablished, 'silence totals notEstablished'),
      },
      { label: 'Silent', value: numberValue(totals.silent, 'silence totals silent') },
      ...meanings.map((meaning) => ({
        label: meaning.toLowerCase().replaceAll('_', ' '),
        value: meaningCounts.get(meaning) ?? 0,
      })),
    ],
    generatedAt: text(run.runDate, 'silence ledger runDate'),
    version: text(run.version, 'silence ledger version'),
    sourceArtifact: `${relativePath} + data/recorded-background.ndjson`,
    sourceLimitations: [
      ...safeCaveats(run.caveats, 'silence ledger caveats'),
      'A source object without an excerpt is provenance, not proof that the exact section was read. It therefore cannot become SOURCE_READ_NO_ANSWER.',
      'An excerpt attached to another question or module is unrelated evidence for this classification and is never used to label this row as read.',
      'The current ledger does not persist a section-read binding for SILENT occurrences, so those rows remain NO_QUALIFYING_SOURCE_READ. SOURCE_READ_NO_ANSWER stays empty until a future artifact records an exact question-and-source binding; answer-bearing consensus evidence is never repurposed as proof of silence.',
      'SOURCE_KIND_NOT_MACHINE_VERIFIABLE reports only the absence of a canonical locator in the checked-in source-fetch contract. It does not judge the source itself.',
    ],
    rowCount: rows.length,
    filters: [
      COMMON_FILTER,
      {
        parameter: 'state',
        label: 'Coverage state',
        description: 'Exact state; NOT_ESTABLISHED is never treated as SILENT.',
        values: states,
      },
      {
        parameter: 'meaning',
        label: 'Silence meaning',
        description: 'Exact derived source-read boundary; RECORDED rows have no silence meaning.',
        values: meanings,
      },
      {
        parameter: 'field',
        label: 'Question key',
        description: 'Exact question identifier.',
        values: fields,
      },
    ],
    sourceExamples: examples,
  })

  return {
    descriptor,
    rows,
    searchFields: [
      'medicineSlug',
      'medicineName',
      'questionId',
      'question',
      'module',
      'silenceMeaning',
      'sourceIdentifiers',
      'scopedSources',
      'recordedSourceKinds',
      'machineVerifiableSourceKinds',
    ],
  }
}

interface ConflictIndex {
  signature: string
  bySlug: Map<string, string[]>
}

let conflictIndexCache: ConflictIndex | null = null

async function loadConflictIndex(): Promise<ConflictIndex> {
  const source = await resolveSource(['data/source-consensus.ndjson'])
  if (conflictIndexCache?.signature === source.signature) return conflictIndexCache

  const bySlug = new Map<string, string[]>()
  const rawLines = (await readFile(source.absolutePath, 'utf8'))
    .split('\n')
    .filter((line) => line.trim().length > 0)
  for (const [lineIndex, line] of rawLines.entries()) {
    const row = record(JSON.parse(line) as unknown, `source consensus line ${lineIndex + 1}`)
    if (row.comparisonState !== 'differ') continue
    const slug = text(row.slug, `source consensus line ${lineIndex + 1}.slug`)
    const field = text(row.field, `source consensus line ${lineIndex + 1}.field`)
    const held = bySlug.get(slug) ?? []
    held.push(field)
    bySlug.set(slug, held)
  }
  for (const fields of bySlug.values()) fields.sort()
  conflictIndexCache = { signature: source.signature, bySlug }
  return conflictIndexCache
}

interface SilenceQuestionIndex {
  signature: string
  relativePath: string
  bySlug: Map<string, { silent: string[]; notEstablished: string[] }>
}

let silenceQuestionIndexCache: SilenceQuestionIndex | null = null

async function loadSilenceQuestionIndex(): Promise<SilenceQuestionIndex> {
  const source = await resolveCurrentPublicAgentArtifact('silence-ledger.json')
  if (silenceQuestionIndexCache?.signature === source.signature) {
    return silenceQuestionIndexCache
  }

  const raw = await readJsonObject(source.absolutePath, 'coverage silence join')
  const run = deterministicRun(raw, 'coverage silence artifact')
  const output = record(run.output, 'coverage silence output')
  const bySlug = new Map<string, { silent: string[]; notEstablished: string[] }>()
  for (const medicine of records(output.medicines, 'coverage silence medicines')) {
    const slug = text(medicine.slug, 'coverage silence medicine slug')
    if (bySlug.has(slug)) throw new Error(`Duplicate silence-ledger slug: ${slug}`)
    const silent: string[] = []
    const notEstablished: string[] = []
    for (const entry of records(medicine.entries, `${slug}.silence entries`)) {
      const questionId = text(entry.questionId, `${slug}.silence questionId`)
      const state = text(entry.state, `${slug}.${questionId}.silence state`)
      if (state === 'SILENT') silent.push(questionId)
      else if (state === 'NOT_ESTABLISHED') notEstablished.push(questionId)
      else if (state !== 'RECORDED') throw new Error(`Unknown silence state: ${state}`)
    }
    bySlug.set(slug, { silent, notEstablished })
  }

  silenceQuestionIndexCache = {
    signature: source.signature,
    relativePath: source.relativePath,
    bySlug,
  }
  return silenceQuestionIndexCache
}

interface FourAudienceProjectionContract {
  signature: string
  ordinaryQuestionIds: string[]
  specialistModuleIds: string[]
  freshnessStatus: 'NOT_PUBLICLY_OBSERVABLE'
}

let fourAudienceContractCache: FourAudienceProjectionContract | null = null

async function loadFourAudienceProjectionContract(): Promise<FourAudienceProjectionContract> {
  const contractSource = await resolveSource(['docs/product/four-audience-evidence-contract.json'])
  const coverageSource = await resolveSource(['docs/product/four-audience-evidence-coverage.json'])
  const signature = `${contractSource.signature}|${coverageSource.signature}`
  if (fourAudienceContractCache?.signature === signature) return fourAudienceContractCache

  const contract = await readJsonObject(contractSource.absolutePath, 'four-audience contract')
  if (contract.schema !== 'four-audience-evidence-contract/v1') {
    throw new Error('Unsupported four-audience evidence contract')
  }
  const ordinaryQuestionIds = records(
    contract.ordinaryQuestions,
    'four-audience ordinary questions',
  ).map((question) => text(question.id, 'four-audience question id'))
  if (JSON.stringify(ordinaryQuestionIds) !== JSON.stringify(ORDINARY_QUESTION_IDS)) {
    throw new Error('Four-audience ordinary question registry does not match the public projection')
  }
  const specialistMeasures = record(
    contract.specialistMeasures,
    'four-audience specialist measures',
  )
  const specialistModuleIds = Object.keys(specialistMeasures)
  const expectedSpecialistModules = [
    'chemistryIdentity',
    'quantitativeUncertainty',
    'sourceConflict',
    'staleExactBindings',
    'sourceRead',
  ]
  if (JSON.stringify(specialistModuleIds) !== JSON.stringify(expectedSpecialistModules)) {
    throw new Error('Four-audience specialist module registry does not match the public projection')
  }

  const coverage = await readJsonObject(coverageSource.absolutePath, 'four-audience coverage')
  const stale = record(coverage.staleExactBindings, 'four-audience stale coverage')
  if (stale.measurementState !== 'not_observable_in_checked_in_public_snapshot') {
    throw new Error(
      'Per-record freshness needs an explicit public projection before it can be shown',
    )
  }

  fourAudienceContractCache = {
    signature,
    ordinaryQuestionIds,
    specialistModuleIds,
    freshnessStatus: 'NOT_PUBLICLY_OBSERVABLE',
  }
  return fourAudienceContractCache
}

async function buildCoverageLedger(
  absolutePath: string,
  relativePath: string,
): Promise<LoadedPublicDataset> {
  const raw = await readJsonObject(absolutePath, 'coverage ledger run')
  const run = deterministicRun(raw, 'coverage ledger artifact')
  const output = record(run.output, 'coverage ledger output')
  const [recordedBackground, conflicts, silence, evidenceContract] = await Promise.all([
    loadRecordedBackgroundFacts(),
    loadConflictIndex(),
    loadSilenceQuestionIndex(),
    loadFourAudienceProjectionContract(),
  ])
  const rows: PublicDatasetRow[] = records(output.entries, 'coverage ledger entries').map(
    (entry) => {
      const medicineSlug = text(entry.slug, 'coverage entry slug')
      const facts = recordedBackground.bySlug.get(medicineSlug)
      const silenceQuestions = silence.bySlug.get(medicineSlug)
      if (!facts)
        throw new Error(`No recorded-background row for coverage medicine ${medicineSlug}`)
      if (!silenceQuestions)
        throw new Error(`No silence-ledger row for coverage medicine ${medicineSlug}`)

      const conflictFields = conflicts.bySlug.get(medicineSlug) ?? []
      const mappedConflict = conflictFields.some(
        (field) => CONSENSUS_FIELD_TO_INTENT[field] !== undefined,
      )
      const observedOrdinaryQuestions = new Set(facts.ordinaryQuestionsAnswered)
      if (mappedConflict) observedOrdinaryQuestions.add('unknown-conflicting-stale')
      const ordinaryQuestionsAnswered = evidenceContract.ordinaryQuestionIds.filter((question) =>
        observedOrdinaryQuestions.has(question),
      )

      const observedSpecialistModules = new Set(facts.specialistModules)
      if (conflictFields.length > 0) observedSpecialistModules.add('sourceConflict')
      const specialistModules = evidenceContract.specialistModuleIds.filter((module) =>
        observedSpecialistModules.has(module),
      )

      return {
        medicineSlug,
        medicineName: text(entry.name, 'coverage entry name'),
        route: text(entry.route, 'coverage entry route'),
        modulesPresent: stringList(entry.modulesPresent, 'coverage entry modulesPresent'),
        moduleCount: numberValue(entry.moduleCount, 'coverage entry moduleCount'),
        ingredientCount: numberValue(entry.ingredientCount, 'coverage entry ingredientCount'),
        ingredientsDocumented: numberValue(
          entry.ingredientsDocumented,
          'coverage entry ingredientsDocumented',
        ),
        provenanceTier: text(entry.provenanceTier, 'coverage entry provenanceTier'),
        ordinaryQuestionsAnswered,
        ordinaryQuestionsAnsweredCount: ordinaryQuestionsAnswered.length,
        specialistModules,
        specialistModulesNotObservable: ['staleExactBindings'],
        sourceBoundStatementCount: facts.sourceBoundStatementCount,
        sourceDocumentCount: facts.distinctSourceCount,
        sourceKinds: facts.sourceKinds,
        reviewedStatus: 'NOT_PUBLICLY_OBSERVABLE',
        freshnessStatus: evidenceContract.freshnessStatus,
        conflicts: conflictFields,
        missingQuestions: silenceQuestions.silent,
        explicitNotEstablishedQuestions: silenceQuestions.notEstablished,
        noSourceReadState: facts.noSourceReadState,
      }
    },
  )
  const byRoute = records(output.byRoute, 'coverage byRoute')
  const byModule = records(output.byModule, 'coverage byModule')
  const routes = byRoute
    .map((entry) => text(entry.route, 'coverage route'))
    .filter((route) => rows.some((row) => row.route === route))
  const modules = byModule.map((entry) => text(entry.module, 'coverage module'))
  const coverage = record(run.coverage, 'coverage ledger coverage')

  const descriptor = baseDescriptor('coverage-ledger', {
    title: 'Recorded corpus coverage',
    shortTitle: 'Corpus coverage',
    purpose:
      'Show which recorded-background modules, source-bound ordinary answers, specialist measures, conflicts, and explicit question gaps are observable for each medicine in the checked-in public snapshot.',
    doesNotMean:
      'A larger module count does not mean a medicine is better studied, safer, more effective, or higher quality. Different source routes can supply different kinds of fields and their counts are not directly comparable.',
    methodology: [
      'A deterministic classifier assigns every corpus record one source route and counts a fixed set of recorded modules.',
      'A module is present when this snapshot has a recorded value in that module; missing means absent from this corpus, not absent from medicine knowledge.',
      'Ordinary-reader answers and specialist modules use the checked-in four-audience eligibility rules. Comparable source differences come from source consensus; not_comparable is never a conflict.',
      'missingQuestions contains only SILENT question identifiers from the complete silence ledger. Explicit NOT_ESTABLISHED questions remain separate.',
      'Review and exact freshness are marked NOT_PUBLICLY_OBSERVABLE because the checked-in public snapshot does not carry the per-record runtime contract needed to state either one.',
      'Ingredient documentation counts are reported only where the route records ingredient slots.',
    ],
    schema: [
      {
        key: 'medicineSlug',
        label: 'Medicine slug',
        type: 'string',
        description: 'Stable RNAWiki medicine route key.',
      },
      {
        key: 'medicineName',
        label: 'Medicine name',
        type: 'string',
        description: 'Recorded medicine name.',
      },
      {
        key: 'route',
        label: 'Source route',
        type: 'string',
        description: 'Deterministic route describing which source type reached the record.',
      },
      {
        key: 'modulesPresent',
        label: 'Modules present',
        type: 'string[]',
        description: 'Recorded-background modules with a value in this snapshot.',
      },
      {
        key: 'moduleCount',
        label: 'Module count',
        type: 'number',
        description: 'Count of modules present; not a quality score.',
      },
      {
        key: 'ingredientCount',
        label: 'Ingredient slots',
        type: 'number',
        description: 'Ingredient slots recorded for applicable routes.',
      },
      {
        key: 'ingredientsDocumented',
        label: 'Ingredients documented',
        type: 'number',
        description: 'Ingredient slots with recorded documentation.',
      },
      {
        key: 'provenanceTier',
        label: 'Provenance tier',
        type: 'string',
        description: 'Whether the record was curated or deterministically extracted.',
      },
      {
        key: 'ordinaryQuestionsAnswered',
        label: 'Ordinary questions answered',
        type: 'string[]',
        description:
          'Source-bound eligible question IDs from the checked-in six-question contract; the unknown/conflicting/stale question is only an observable lower bound.',
      },
      {
        key: 'ordinaryQuestionsAnsweredCount',
        label: 'Ordinary questions answered count',
        type: 'number',
        description: 'Count of the source-bound ordinary question IDs in this row.',
      },
      {
        key: 'specialistModules',
        label: 'Specialist modules',
        type: 'string[]',
        description:
          'Observable specialist measures from the checked-in contract: chemistry identity, printed uncertainty, source conflict, or source read.',
      },
      {
        key: 'specialistModulesNotObservable',
        label: 'Specialist modules not observable',
        type: 'string[]',
        description:
          'Contract modules whose per-record state is absent from this snapshot; currently staleExactBindings.',
      },
      {
        key: 'sourceBoundStatementCount',
        label: 'Source-bound statements',
        type: 'number',
        description:
          'Qualifying source attachments across recorded objects, counted with repetition at each attachment position.',
      },
      {
        key: 'sourceDocumentCount',
        label: 'Source documents',
        type: 'number',
        description: 'Distinct qualifying source kind-and-identifier pairs in the record.',
      },
      {
        key: 'sourceKinds',
        label: 'Source kinds',
        type: 'string[]',
        description: 'Qualifying source kinds recorded anywhere in the medicine background.',
      },
      {
        key: 'reviewedStatus',
        label: 'Reviewed status',
        type: 'string',
        description:
          'NOT_PUBLICLY_OBSERVABLE until an exact per-record review state is exported publicly.',
      },
      {
        key: 'freshnessStatus',
        label: 'Freshness status',
        type: 'string',
        description:
          'NOT_PUBLICLY_OBSERVABLE until exact persisted source bindings and checks are exported for the row.',
      },
      {
        key: 'conflicts',
        label: 'Comparable conflicts',
        type: 'string[]',
        description:
          'Source-consensus fields in differ state. agree and not_comparable are excluded.',
      },
      {
        key: 'missingQuestions',
        label: 'Silent tracked questions',
        type: 'string[]',
        description:
          'Question IDs whose silence-ledger state is SILENT; absence here is about this corpus, not the medicine.',
      },
      {
        key: 'explicitNotEstablishedQuestions',
        label: 'Explicitly not established questions',
        type: 'string[]',
        description:
          'Question IDs whose source-backed silence-ledger state is NOT_ESTABLISHED; never folded into missingQuestions.',
      },
      {
        key: 'noSourceReadState',
        label: 'Source-read state',
        type: 'string',
        description:
          'Whether this record has a qualifying source excerpt, only source objects without an excerpt, or no qualifying source object.',
      },
    ],
    coverage: [
      { label: 'Medicine rows', value: rows.length },
      {
        label: 'Corpus records considered',
        value: numberValue(coverage.considered, 'coverage considered'),
        detail: optionalText(coverage.reason) ?? undefined,
      },
      { label: 'Source routes represented', value: routes.length },
      { label: 'Modules tracked', value: modules.length },
      {
        label: 'Observable ordinary answer pairs',
        value: rows.reduce((sum, row) => sum + Number(row.ordinaryQuestionsAnsweredCount ?? 0), 0),
      },
      {
        label: 'Comparable conflict fields',
        value: rows.reduce(
          (sum, row) => sum + (Array.isArray(row.conflicts) ? row.conflicts.length : 0),
          0,
        ),
      },
      {
        label: 'Rows without a qualifying source excerpt',
        value: rows.filter((row) => row.noSourceReadState !== 'SOURCE_READ_RECORDED').length,
      },
      {
        label: 'Ingredient slots documented',
        value: `${numberValue(output.ingredientSlotsDocumented, 'ingredientSlotsDocumented')} of ${numberValue(output.ingredientSlots, 'ingredientSlots')}`,
      },
    ],
    generatedAt: text(run.runDate, 'coverage ledger runDate'),
    version: text(run.version, 'coverage ledger version'),
    sourceArtifact: `${relativePath} + data/recorded-background.ndjson + data/source-consensus.ndjson + ${silence.relativePath} + docs/product/four-audience-evidence-contract.json`,
    sourceLimitations: [
      ...safeCaveats(run.caveats, 'coverage ledger caveats'),
      'Ordinary answer counts are source-bound eligibility measurements, not claims that every eligible fact is already rendered as a reviewed answer.',
      'The unknown/conflicting/stale ordinary question is a lower bound: comparable conflicts are observable, but exact stale bindings are not present in this public snapshot.',
      'A source object without a nonblank excerpt remains provenance but does not count as a source read.',
      'NOT_PUBLICLY_OBSERVABLE is an unknown state, not zero, false, current, or unreviewed.',
    ],
    rowCount: rows.length,
    filters: [
      COMMON_FILTER,
      {
        parameter: 'route',
        label: 'Source route',
        description: 'Exact deterministic source route.',
        values: routes,
      },
      {
        parameter: 'module',
        label: 'Module present',
        description: 'Return records containing this exact module.',
        values: modules,
      },
    ],
    sourceExamples: byRoute.slice(0, 4).map((entry) => ({
      label: `${text(entry.route, 'coverage route example')} source route`,
      detail: `${numberValue(entry.records, 'coverage route records')} records; median ${numberValue(entry.medianModuleCount, 'coverage route median')} modules. ${text(entry.cannotSupply, 'coverage route cannotSupply')}`,
    })),
  })

  return {
    descriptor,
    rows,
    searchFields: [
      'medicineSlug',
      'medicineName',
      'route',
      'modulesPresent',
      'provenanceTier',
      'ordinaryQuestionsAnswered',
      'specialistModules',
      'sourceKinds',
      'conflicts',
      'missingQuestions',
      'explicitNotEstablishedQuestions',
      'noSourceReadState',
    ],
  }
}

async function ndjsonRecords(absolutePath: string, context: string): Promise<UnknownRecord[]> {
  return (await readFile(absolutePath, 'utf8'))
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line, index) => record(JSON.parse(line) as unknown, `${context} line ${index + 1}`))
}

/**
 * Identity resolutions: which address each stored record answers at.
 *
 * The projection publishes attribution warning codes and never the rows a warning points at. Two
 * records sharing a registry identifier is a reason for a person to look, not evidence that they
 * are one substance, and printing the other record's name here would put two medicines on one line.
 */
export async function buildInventoryResolution(
  absolutePath: string,
  relativePath: string,
): Promise<LoadedPublicDataset> {
  const raw = await ndjsonRecords(absolutePath, 'inventory resolution')
  const rows: PublicDatasetRow[] = raw.map((entry, index) => {
    const context = `inventory resolution line ${index + 1}`
    if (Object.keys(entry).includes('relatedSlugs')) {
      throw new Error(`${context} names one record in relation to another`)
    }
    return {
      medicineSlug: text(entry.originalSlug, `${context}.originalSlug`),
      medicineName: text(entry.originalName, `${context}.originalName`),
      entityClass: text(entry.entityClass, `${context}.entityClass`),
      entityClassRule: text(entry.entityClassRule, `${context}.entityClassRule`),
      resolutionStatus: text(entry.resolutionStatus, `${context}.resolutionStatus`),
      canonicalSlug: text(entry.canonicalSlug, `${context}.canonicalSlug`),
      redirectTargetSlug: optionalText(entry.redirectTargetSlug),
      identityConfidence: text(entry.identityConfidence, `${context}.identityConfidence`),
      identitySourceKinds: stringList(entry.identitySourceKinds, `${context}.identitySourceKinds`),
      attributionWarningCodes: stringList(
        entry.attributionWarningCodes,
        `${context}.attributionWarningCodes`,
      ),
      resolutionEvidence: stringList(entry.resolutionEvidence, `${context}.resolutionEvidence`),
    }
  })

  const statusCounts = new Map<string, number>()
  const classCounts = new Map<string, number>()
  const warningCounts = new Map<string, number>()
  for (const row of rows) {
    const status = String(row.resolutionStatus)
    const entityClass = String(row.entityClass)
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
    classCounts.set(entityClass, (classCounts.get(entityClass) ?? 0) + 1)
    for (const code of row.attributionWarningCodes as string[]) {
      warningCounts.set(code, (warningCounts.get(code) ?? 0) + 1)
    }
  }
  // Every declared outcome stays selectable even when this export contains none of it, so a reader
  // can tell "no record reached this state" from "this state was dropped".
  const statuses = [...INVENTORY_RESOLUTION_STATES]
  const entityClasses = [...ENTITY_CLASSES]
  const manifest = await manifestFileMetadata(
    'data/inventory-resolution.ndjson',
    'inventory-resolution/1',
  )

  const examples: PublicDatasetSourceExample[] = statuses.flatMap((status) => {
    const row = rows.find((candidate) => candidate.resolutionStatus === status)
    if (!row) return []
    const evidence = row.resolutionEvidence as string[]
    return [
      {
        label: `${String(row.medicineName)} · ${status}`,
        detail: `${String(row.entityClass)} by ${String(row.entityClassRule)}; identity confidence ${String(row.identityConfidence)}`,
        ...(evidence.length > 0 ? { excerpt: evidence.join(' ') } : {}),
      },
    ]
  })

  const descriptor = baseDescriptor('inventory-resolution', {
    title: 'What each stored medicine record resolves to',
    shortTitle: 'Record identity resolution',
    purpose:
      'Look up what one stored record was decided to be: an entity that keeps its own address, a record that resolves to the address of the same entity, or an identifier that never named a medicine.',
    doesNotMean:
      'This is about records, not about substances. It does not say two substances are the same thing, that a record is correct, or that a withdrawn address means the substance does not exist. A registry identifier held by more than one record is published as a warning code and is never treated as evidence to merge.',
    methodology: [
      'Every row in the medicine table receives exactly one resolution, decided by a fixed rule table read over stored fields.',
      'Two records resolve to one entity only on exact deterministic evidence, such as an identical name once punctuation is removed. Salts, stereoisomers, metabolites, formulations, combinations, brands, botanical preparations, organisms and biologics are never merged by rule.',
      'A registry identifier recorded on more than one record produces the SHARED_REGISTRY_IDENTIFIER warning code. The other records are not named in this dataset.',
      'entityClassRule names the rule that fired and resolutionEvidence carries the deterministic evidence behind a non-canonical outcome, so a reader can repeat the decision or disagree with it.',
      'identitySourceKinds names the kinds of registry identifier read from the record, such as UNII or PUBCHEM_CID, without repeating the identifier values already published on the medicine row.',
    ],
    schema: [
      {
        key: 'medicineSlug',
        label: 'Record slug',
        type: 'string',
        description: 'The stored record being resolved, by its original RNAWiki route key.',
      },
      {
        key: 'medicineName',
        label: 'Record name',
        type: 'string',
        description: 'The name recorded on that row; not normalized for display style.',
      },
      {
        key: 'entityClass',
        label: 'Kind of record',
        type: 'string',
        description:
          'What kind of thing the row is, such as APPROVED_MEDICINE, SUPPLEMENT_INGREDIENT or REGISTRY_ONLY_IDENTITY. It selects which dossier sections apply and is never a quality ranking.',
      },
      {
        key: 'entityClassRule',
        label: 'Class rule',
        type: 'string',
        description: 'The rule from the fixed class table that decided the kind.',
      },
      {
        key: 'resolutionStatus',
        label: 'Resolution',
        type: 'string',
        description:
          'CANONICAL_ENTITY keeps its own address. DUPLICATE_OF_CANONICAL_ENTITY, ALIAS_OF_CANONICAL_ENTITY and HISTORICAL_REDIRECT resolve to the address of the same entity. INVALID_IDENTITY_GONE never named a medicine. MANUAL_IDENTITY_REVIEW_REQUIRED is waiting for a person.',
      },
      {
        key: 'canonicalSlug',
        label: 'Address for this entity',
        type: 'string',
        description:
          'The route key this entity is served at. It equals the record slug for a canonical record.',
      },
      {
        key: 'redirectTargetSlug',
        label: 'Redirects to',
        type: 'string',
        description:
          'Present only for a resolving status, always one hop, and always the same entity described twice. Null on every other row.',
      },
      {
        key: 'identityConfidence',
        label: 'What the identity rests on',
        type: 'string',
        description:
          'REGISTRY_IDENTIFIER_RECORDED, NAME_ONLY when the row is identified by its recorded name alone, or PLACEHOLDER when it identifies nothing.',
      },
      {
        key: 'identitySourceKinds',
        label: 'Registry identifier kinds',
        type: 'string[]',
        description: 'Kinds of identifier recorded on the row. Empty when none was recorded.',
      },
      {
        key: 'attributionWarningCodes',
        label: 'Attribution warnings',
        type: 'string[]',
        description:
          'Codes a reviewer should see, such as SHARED_REGISTRY_IDENTIFIER or NAME_ONLY_IDENTITY. Codes only: the records a warning was raised against are never named here.',
      },
      {
        key: 'resolutionEvidence',
        label: 'Evidence',
        type: 'string[]',
        description:
          'The deterministic evidence behind a non-canonical outcome. It can name the address a record resolves to, because both describe one entity.',
      },
    ],
    coverage: [
      { label: 'Stored records resolved', value: rows.length },
      ...statuses.map((status) => ({ label: status, value: statusCounts.get(status) ?? 0 })),
      {
        label: 'Kinds of record represented',
        value: classCounts.size,
        detail: [...classCounts.keys()].sort().join(', '),
      },
      {
        label: 'Rows carrying an attribution warning',
        value: rows.filter((row) => (row.attributionWarningCodes as string[]).length > 0).length,
        detail: [...warningCounts.keys()].sort().join(', '),
      },
    ],
    generatedAt: manifest.generatedAt,
    version: manifest.version,
    sourceArtifact: relativePath,
    sourceLimitations: [
      manifest.limitation ??
        'A resolution states which public address a stored record answers at. It is not a medical statement.',
      'The rules read the fields stored in this snapshot. A record whose registry identifiers were never recorded is resolved on its name alone, which identityConfidence states.',
      'A resolution can change when the record behind it changes. Read the snapshot date before comparing two exports.',
      'A row whose identity is marked for manual review means a person still has to decide. The row stays published and visible until they do.',
    ],
    rowCount: rows.length,
    filters: [
      COMMON_FILTER,
      {
        parameter: 'state',
        label: 'Resolution',
        description: 'Exact resolution status.',
        values: statuses,
      },
      {
        parameter: 'role',
        label: 'Kind of record',
        description: 'Exact entity class.',
        values: entityClasses,
      },
    ],
    sourceExamples: examples,
  })

  return {
    descriptor,
    rows,
    searchFields: ['medicineSlug', 'medicineName', 'canonicalSlug', 'resolutionEvidence'],
  }
}

/**
 * Completion states: for one canonical record, which sections applied and what each rests on.
 *
 * Every state is about the sources that were read. None of them is a finding about the medicine,
 * which is why the reader-facing copy repeats that in the dataset header rather than only here.
 */
export async function buildDossierCompletion(
  /** Every shard of `data/dossier-completion/`, in manifest order. Rows keep that order. */
  absolutePaths: readonly string[],
  relativePath: string,
): Promise<LoadedPublicDataset> {
  const raw: UnknownRecord[] = []
  for (const absolutePath of absolutePaths) {
    raw.push(...(await ndjsonRecords(absolutePath, `dossier completion ${basename(absolutePath)}`)))
  }
  const rows: PublicDatasetRow[] = raw.map((entry, index) => {
    const context = `dossier completion row ${index + 1}`
    const status = text(entry.status, `${context}.status`)
    if (status !== 'COMPLETE' && status !== 'INCOMPLETE') {
      throw new Error(`${context}.status is not a declared completion status`)
    }
    const sections = records(entry.sections, `${context}.sections`).map((section, position) => ({
      sectionId: text(section.sectionId, `${context}.sections[${position}].sectionId`),
      state: text(section.state, `${context}.sections[${position}].state`),
    }))
    const applicableSectionCount = numberValue(
      entry.applicableSectionCount,
      `${context}.applicableSectionCount`,
    )
    if (sections.length !== applicableSectionCount) {
      throw new Error(`${context} declares more applicable sections than it holds`)
    }
    return {
      medicineSlug: text(entry.slug, `${context}.slug`),
      medicineName: text(entry.name, `${context}.name`),
      entityClass: text(entry.entityClass, `${context}.entityClass`),
      status,
      applicableSectionCount,
      terminalSectionCount: numberValue(
        entry.terminalSectionCount,
        `${context}.terminalSectionCount`,
      ),
      sectionStates: sections.map((section) => `${section.sectionId}: ${section.state}`),
      statesPresent: [...new Set(sections.map((section) => section.state))].sort(),
      nonTerminalSectionIds: stringList(
        entry.nonTerminalSectionIds,
        `${context}.nonTerminalSectionIds`,
      ),
      humanReadSuggestedSectionIds: stringList(
        entry.humanReadSuggestedSectionIds,
        `${context}.humanReadSuggestedSectionIds`,
      ),
      contentChangedAt: text(entry.contentChangedAt, `${context}.contentChangedAt`),
    }
  })

  const statusCounts = new Map<string, number>()
  const stateCounts = new Map<string, number>()
  const sectionIds = new Set<string>()
  for (const row of rows) {
    const status = String(row.status)
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
    for (const entry of row.sectionStates as string[]) {
      const [sectionId, state] = entry.split(': ')
      if (sectionId) sectionIds.add(sectionId)
      if (state) stateCounts.set(state, (stateCounts.get(state) ?? 0) + 1)
    }
  }
  const states = [...SECTION_STATES]
  const sections = [...DOSSIER_SECTION_IDS]
  const observedStates = [...stateCounts.keys()].sort()
  const observedSections = [...sectionIds].sort()
  const manifest = await manifestFileMetadata(
    (path) => path.startsWith(`${DOSSIER_COMPLETION_DIRECTORY}/`) && path.endsWith('.ndjson'),
    'dossier-completion/1',
  )

  const examples: PublicDatasetSourceExample[] = ['COMPLETE', 'INCOMPLETE'].flatMap((status) => {
    const row = rows.find((candidate) => candidate.status === status)
    if (!row) return []
    return [
      {
        label: `${String(row.medicineName)} · ${status}`,
        detail: `${String(row.terminalSectionCount)} of ${String(row.applicableSectionCount)} applicable sections have reached a state`,
        excerpt: (row.sectionStates as string[]).join(' · '),
      },
    ]
  })

  const descriptor = baseDescriptor('dossier-completion', {
    title: 'Which dossier sections have reached a state',
    shortTitle: 'Dossier completion states',
    purpose:
      'Read, for one canonical record, every section that applies to it and the state that section reached over the sources RNAWiki holds.',
    doesNotMean:
      'Every state describes the sources that were read, never the medicine. "No qualifying evidence after search" is a statement about this corpus and its dated searches, not a safety finding and not an absence of risk. A complete record is one whose applicable sections all carry an explicit state, not one that holds a positive result in every section.',
    methodology: [
      'A section applies to a record according to the kind of record it is. A section that cannot apply is recorded as NOT_APPLICABLE with the rule that decided it.',
      'Ten states are terminal: the section has an explicit outcome, including outcomes such as not measured, results not posted, and searched with no qualifying record found.',
      'Six states are not terminal and keep the record incomplete: not yet assessed, search pending, source read failed, identity unresolved, attribution unresolved, and waiting for a person to review. Each stays visible rather than being hidden or filled in.',
      'The resolver reads stored records, the local source archives and dated registry searches. It never writes text into a section and never turns an absence into a finding.',
      'Only a record that keeps its own address carries an assessment. A record that resolves to another address is described in the record identity dataset instead.',
    ],
    schema: [
      {
        key: 'medicineSlug',
        label: 'Record slug',
        type: 'string',
        description: 'Stable RNAWiki route key for the canonical record.',
      },
      {
        key: 'medicineName',
        label: 'Record name',
        type: 'string',
        description: 'The name recorded on that row.',
      },
      {
        key: 'entityClass',
        label: 'Kind of record',
        type: 'string',
        description: 'The class that selected which sections apply.',
      },
      {
        key: 'status',
        label: 'Completion',
        type: 'string',
        description:
          'COMPLETE when every applicable section carries a terminal state; INCOMPLETE when at least one does not.',
      },
      {
        key: 'applicableSectionCount',
        label: 'Applicable sections',
        type: 'number',
        description: 'How many of the twenty sections apply to this kind of record.',
      },
      {
        key: 'terminalSectionCount',
        label: 'Sections with an outcome',
        type: 'number',
        description: 'Applicable sections that have reached one of the ten terminal states.',
      },
      {
        key: 'sectionStates',
        label: 'State by section',
        type: 'string[]',
        description:
          'Every applicable section in reading order, each with the state it reached. The basis sentence and the exact sources read are in the published files named below.',
      },
      {
        key: 'statesPresent',
        label: 'States present',
        type: 'string[]',
        description: 'The distinct states this record uses, sorted.',
      },
      {
        key: 'nonTerminalSectionIds',
        label: 'Sections without an outcome',
        type: 'string[]',
        description:
          'Sections still waiting on something. Empty exactly when the status is COMPLETE.',
      },
      {
        key: 'humanReadSuggestedSectionIds',
        label: 'Worth a person reading',
        type: 'string[]',
        description:
          'Sections where a person reading the named source could add something the parser did not. This never blocks completion.',
      },
      {
        key: 'contentChangedAt',
        label: 'Inputs last changed',
        type: 'string',
        description:
          'When the inputs behind this assessment last moved. It does not move when the resolver is merely re-run.',
      },
    ],
    coverage: [
      { label: 'Canonical records assessed', value: rows.length },
      { label: 'Complete', value: statusCounts.get('COMPLETE') ?? 0 },
      { label: 'Incomplete', value: statusCounts.get('INCOMPLETE') ?? 0 },
      {
        label: 'Sections represented',
        value: observedSections.length,
        detail: observedSections.join(', '),
      },
      {
        label: 'States represented',
        value: observedStates.length,
        detail: observedStates.join(', '),
      },
    ],
    generatedAt: manifest.generatedAt,
    version: manifest.version,
    sourceArtifact: relativePath,
    sourceLimitations: [
      manifest.limitation ??
        'A section state describes the sources RNAWiki read, never the medicine.',
      'A dated search records what a named source returned on that date. A later search can return something else.',
      'The projection carries one state per section. The basis sentence, the counts behind it and the exact sources read are in the published shards, not in this page.',
      'A record that resolves to another address carries no row here.',
    ],
    rowCount: rows.length,
    filters: [
      COMMON_FILTER,
      {
        parameter: 'state',
        label: 'Completion',
        description: 'COMPLETE or INCOMPLETE.',
        values: [...DOSSIER_COMPLETION_STATUSES],
      },
      {
        parameter: 'meaning',
        label: 'Section state',
        description: 'Records that use this exact section state anywhere.',
        values: states,
      },
      {
        parameter: 'module',
        label: 'Section without an outcome',
        description: 'Records whose named section has not reached a state yet.',
        values: sections,
      },
    ],
    sourceExamples: examples,
  })

  return {
    descriptor,
    rows,
    searchFields: ['medicineSlug', 'medicineName', 'sectionStates'],
  }
}

const SOURCE_CANDIDATES: Record<PublicDatasetId, readonly string[]> = {
  'enzyme-transporter-negatives': relativeAgentCandidates(
    'enzyme-and-transporter-documentation.json',
  ),
  'source-consensus': ['data/source-consensus.ndjson'],
  'silence-ledger': relativeAgentCandidates('silence-ledger.json'),
  'coverage-ledger': relativeAgentCandidates('coverage-ledger.json'),
  'inventory-resolution': ['data/inventory-resolution.ndjson'],
  // A directory, because the completion corpus is published as shards. The shard list comes from
  // the manifest, so this reader never guesses a filename or a shard count.
  'dossier-completion': [DOSSIER_COMPLETION_DIRECTORY],
}

/** Datasets read straight from an exported corpus file rather than from an agent run. */
const CORPUS_FILE_DATASETS = new Set<PublicDatasetId>([
  'source-consensus',
  'inventory-resolution',
  'dossier-completion',
])

export function publicDatasetSourceCandidates(id: PublicDatasetId): readonly string[] {
  return SOURCE_CANDIDATES[id]
}

export function isPublicDatasetId(value: string): value is PublicDatasetId {
  return (PUBLIC_DATASET_IDS as readonly string[]).includes(value)
}

async function loadDataset(id: PublicDatasetId): Promise<LoadedPublicDataset> {
  // A sharded dataset resolves to every shard. The cache signature covers all of them, so adding,
  // removing or rewriting any one shard invalidates the cached projection.
  const sources =
    id === 'dossier-completion'
      ? await resolveDossierCompletionShards()
      : CORPUS_FILE_DATASETS.has(id)
        ? [await resolveSource(SOURCE_CANDIDATES[id])]
        : [await resolveCurrentPublicAgentArtifact(SOURCE_CANDIDATES[id][0]!.split('/').at(-1)!)]
  const source = sources[0]!
  const dependencies = CORPUS_FILE_DATASETS.has(id)
    ? [await resolveSource(['data/manifest.json'])]
    : id === 'silence-ledger'
      ? [await resolveSource(['data/recorded-background.ndjson'])]
      : id === 'coverage-ledger'
        ? await Promise.all([
            resolveSource(['data/recorded-background.ndjson']),
            resolveSource(['data/source-consensus.ndjson']),
            resolveSource(relativeAgentCandidates('silence-ledger.json')),
            resolveSource(['docs/product/four-audience-evidence-contract.json']),
            resolveSource(['docs/product/four-audience-evidence-coverage.json']),
          ])
        : []
  const signature = [...sources, ...dependencies].map((item) => item.signature).join('|')
  const cached = datasetCache.get(id)
  if (cached?.signature === signature) return cached.value

  const value =
    id === 'enzyme-transporter-negatives'
      ? await buildEnzymeNegatives(source.absolutePath, source.relativePath)
      : id === 'source-consensus'
        ? await buildSourceConsensus(source.absolutePath, source.relativePath)
        : id === 'silence-ledger'
          ? await buildSilenceLedger(source.absolutePath, source.relativePath)
          : id === 'inventory-resolution'
            ? await buildInventoryResolution(source.absolutePath, source.relativePath)
            : id === 'dossier-completion'
              ? await buildDossierCompletion(
                  sources.map((shard) => shard.absolutePath),
                  `${DOSSIER_COMPLETION_DIRECTORY}/*.ndjson`,
                )
              : await buildCoverageLedger(source.absolutePath, source.relativePath)

  datasetCache.set(id, { signature, value })
  return value
}

function normalized(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed.toLocaleLowerCase('en-US') : null
}

function cellText(value: PublicDatasetCell | undefined): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry : JSON.stringify(entry)))
      .join(' ')
  }
  return String(value)
}

function equalsFilter(value: PublicDatasetCell | undefined, expected: string | undefined): boolean {
  const target = normalized(expected)
  if (!target) return true
  if (Array.isArray(value)) {
    return value.some(
      (entry) => typeof entry === 'string' && entry.toLocaleLowerCase('en-US') === target,
    )
  }
  return cellText(value).toLocaleLowerCase('en-US') === target
}

/**
 * Which rows a filtered request keeps. Exported so each dataset's filter contract can be tested
 * against known rows, rather than only against whatever the current export happens to contain.
 */
export function publicDatasetRowMatches(
  id: PublicDatasetId,
  row: PublicDatasetRow,
  query: PublicDatasetQuery,
  searchFields: readonly string[],
): boolean {
  const search = normalized(query.q)
  if (
    search &&
    !searchFields.some((field) => cellText(row[field]).toLocaleLowerCase('en-US').includes(search))
  ) {
    return false
  }

  if (id === 'enzyme-transporter-negatives') {
    return equalsFilter(row.role, query.role) && equalsFilter(row.counterparty, query.counterparty)
  }
  if (id === 'source-consensus') {
    return equalsFilter(row.comparisonState, query.state) && equalsFilter(row.field, query.field)
  }
  if (id === 'silence-ledger') {
    return (
      equalsFilter(row.state, query.state) &&
      equalsFilter(row.silenceMeaning, query.meaning) &&
      equalsFilter(row.questionId, query.field)
    )
  }
  if (id === 'inventory-resolution') {
    return (
      equalsFilter(row.resolutionStatus, query.state) && equalsFilter(row.entityClass, query.role)
    )
  }
  if (id === 'dossier-completion') {
    return (
      equalsFilter(row.status, query.state) &&
      equalsFilter(row.statesPresent, query.meaning) &&
      equalsFilter(row.nonTerminalSectionIds, query.module)
    )
  }
  return equalsFilter(row.route, query.route) && equalsFilter(row.modulesPresent, query.module)
}

export function publicDatasetAllowedParameters(id: PublicDatasetId): ReadonlySet<string> {
  const base = ['q', 'limit', 'offset', 'format']
  if (id === 'enzyme-transporter-negatives') return new Set([...base, 'role', 'counterparty'])
  if (id === 'source-consensus') {
    return new Set([...base, 'state', 'field'])
  }
  if (id === 'silence-ledger') return new Set([...base, 'state', 'meaning', 'field'])
  if (id === 'inventory-resolution') return new Set([...base, 'state', 'role'])
  if (id === 'dossier-completion') return new Set([...base, 'state', 'meaning', 'module'])
  return new Set([...base, 'route', 'module'])
}

export function normalizePublicDatasetQuery(
  input: Partial<PublicDatasetQuery> = {},
): PublicDatasetQuery {
  const limit = input.limit ?? DEFAULT_LIMIT
  const offset = input.offset ?? 0
  if (!Number.isInteger(limit) || limit < 1 || limit > PUBLIC_DATASET_MAX_LIMIT) {
    throw new Error(`limit must be an integer from 1 to ${PUBLIC_DATASET_MAX_LIMIT}`)
  }
  if (!Number.isInteger(offset) || offset < 0 || offset > PUBLIC_DATASET_MAX_OFFSET) {
    throw new Error(`offset must be an integer from 0 to ${PUBLIC_DATASET_MAX_OFFSET}`)
  }
  const q = input.q?.trim()
  if (q && q.length > PUBLIC_DATASET_MAX_QUERY_LENGTH) {
    throw new Error(`q must be at most ${PUBLIC_DATASET_MAX_QUERY_LENGTH} characters`)
  }
  return {
    q: q || undefined,
    state: input.state?.trim() || undefined,
    meaning: input.meaning?.trim() || undefined,
    field: input.field?.trim() || undefined,
    role: input.role?.trim() || undefined,
    counterparty: input.counterparty?.trim() || undefined,
    route: input.route?.trim() || undefined,
    module: input.module?.trim() || undefined,
    limit,
    offset,
  }
}

export async function queryPublicDataset(
  id: PublicDatasetId,
  queryInput: Partial<PublicDatasetQuery> = {},
): Promise<PublicDatasetPage> {
  const query = normalizePublicDatasetQuery(queryInput)
  const loaded = await loadDataset(id)
  const filtered = loaded.rows.filter((row) =>
    publicDatasetRowMatches(id, row, query, loaded.searchFields),
  )
  const rows = filtered.slice(query.offset, query.offset + query.limit)
  return {
    dataset: loaded.descriptor,
    query,
    rows,
    total: filtered.length,
    nextOffset: query.offset + rows.length < filtered.length ? query.offset + rows.length : null,
    previousOffset: query.offset > 0 ? Math.max(0, query.offset - query.limit) : null,
  }
}

export async function listPublicDatasetSummaries(): Promise<PublicDatasetSummary[]> {
  return Promise.all(
    PUBLIC_DATASET_IDS.map(async (id) => {
      const { descriptor } = await loadDataset(id)
      return {
        id: descriptor.id,
        title: descriptor.title,
        shortTitle: descriptor.shortTitle,
        purpose: descriptor.purpose,
        doesNotMean: descriptor.doesNotMean,
        generatedAt: descriptor.generatedAt,
        version: descriptor.version,
        sourceArtifact: descriptor.sourceArtifact,
        rowCount: descriptor.rowCount,
      }
    }),
  )
}

function csvCell(value: PublicDatasetCell | undefined): string {
  let rendered = Array.isArray(value) ? JSON.stringify(value) : value == null ? '' : String(value)
  if (/^[\t\r\n ]*[=+\-@]/.test(rendered)) rendered = `'${rendered}`
  return `"${rendered.replaceAll('"', '""')}"`
}

export function publicDatasetPageToCsv(page: PublicDatasetPage): string {
  const columns = page.dataset.schema.map((field) => field.key)
  const lines = [columns.map(csvCell).join(',')]
  for (const row of page.rows) {
    lines.push(columns.map((column) => csvCell(row[column])).join(','))
  }
  return `${lines.join('\n')}\n`
}

export function clearPublicDatasetCacheForTests(): void {
  datasetCache.clear()
  recordedBackgroundFactsCache = null
  recordedBackgroundFactsLoading = null
  conflictIndexCache = null
  silenceQuestionIndexCache = null
  fourAudienceContractCache = null
}
