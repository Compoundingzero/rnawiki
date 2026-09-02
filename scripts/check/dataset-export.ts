import 'dotenv/config'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import {
  compareConsensusReadings,
  type ConsensusComparableReading,
} from '@/lib/background/source-consensus-comparison'
import { SECTION_STATES } from '@/lib/dossier-completion/types'
import { INVENTORY_RESOLUTION_STATES } from '@/lib/inventory/types'

import { loadCurrentAgentPackage } from '../agents/load-current-package'

/**
 * Checks the published dataset in `data/` against its own manifest, without a database.
 *
 * WHY THIS IS SEPARATE FROM THE EXPORTER. The exporter computes the hashes it writes, so it cannot
 * be the thing that confirms them — it would only be agreeing with itself. This reads the files as
 * a downloader receives them and recomputes everything independently, which is the only form the
 * claim "the download matches what was published" can honestly take.
 *
 * It runs with no network and no credentials, so it works in a pull request, on a fork and on any
 * reader's machine. Point it at a checkout and it either agrees or names the file that disagrees.
 *
 * WHAT IT CANNOT DO. Hashes prove the files are internally consistent and unmodified since the
 * export. They cannot prove the corpus was complete when it was read — a truncated read produces a
 * perfectly self-consistent dataset. That failure is caught upstream by the shrinkage guard in
 * `scripts/export/dataset.ts`, and by comparing counts against production after publication.
 */

/**
 * Which directory is checked. The default is the repository's own `data/`, which is what the
 * publication workflow and `npm run check:dataset-export` verify. `--dir <path>` points the same
 * checks at an export written elsewhere — the disposable output directory an operator or an
 * integration run passes to `scripts/export/dataset.ts --output-dir` — so a candidate export can be
 * read as a downloader receives it without touching the checked-in dataset.
 */
function checkedDirectoryFromArguments(args: readonly string[]): {
  directory: string
  isDefault: boolean
} {
  let directory: string | undefined
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!
    if (argument !== '--dir') throw new TypeError(`Unknown check argument: ${argument}`)
    const value = args[index + 1]
    if (!value?.trim()) throw new TypeError('--dir requires a path.')
    if (directory) throw new TypeError('--dir may be provided only once.')
    directory = resolve(process.cwd(), value)
    index += 1
  }
  return directory
    ? { directory, isDefault: false }
    : { directory: join(process.cwd(), 'data'), isDefault: true }
}

/**
 * Arguments are read only when this file is the process entry point. The row and ledger checks are
 * imported by unit tests, and a test runner's own arguments are not this script's.
 */
const RUNS_AS_SCRIPT = Boolean(process.argv[1]?.endsWith('dataset-export.ts'))

const { directory: EXPORT_DIR, isDefault: CHECKS_REPOSITORY_DATA } = checkedDirectoryFromArguments(
  RUNS_AS_SCRIPT ? process.argv.slice(2) : [],
)
const MANIFEST_PATH = join(EXPORT_DIR, 'manifest.json')
const EXPECTED_LICENCE = 'CC BY 4.0 — see LICENSE-DATA'

/**
 * Manifest paths are repository-relative (`data/…`) whatever directory the export was written to,
 * so a candidate export can be compared byte-for-byte against a published one. Resolve them against
 * the directory being checked rather than against the current working directory.
 */
function artifactPath(manifestPath: string): string {
  if (CHECKS_REPOSITORY_DATA) return join(process.cwd(), manifestPath)
  if (!manifestPath.startsWith('data/')) {
    throw new TypeError(`Unexpected dataset manifest path: ${manifestPath}`)
  }
  return join(EXPORT_DIR, manifestPath.slice('data/'.length))
}

/** Artifacts whose absence means the export predates the recorded-background corpus. */
const REQUIRED_PATHS = [
  'data/manifest.json',
  'data/drugs.csv',
  'data/recorded-background.ndjson',
  'data/source-consensus.ndjson',
  'data/inventory-resolution.ndjson',
  'data/agents/current/manifest.json',
]

/**
 * The derived agent package is attached to the manifest after the corpus commit, by a separate
 * script. A freshly written corpus export therefore does not declare it yet, so `--dir` reports
 * that rather than failing an export for work that has not run.
 */
const DERIVED_AGENT_MANIFEST = 'data/agents/current/manifest.json'

export const INVENTORY_RESOLUTION_PATH = 'data/inventory-resolution.ndjson'
export const DOSSIER_COMPLETION_DIRECTORY = 'data/dossier-completion'
export const INVENTORY_RESOLUTION_SCHEMA = 'inventory-resolution/1'
export const DOSSIER_COMPLETION_SCHEMA = 'dossier-completion/1'

/**
 * GitHub refuses a file over 100 MB, and a refusal arrives at push time — after the export has
 * reported success and after the corpus commit exists. The published layout therefore shards
 * anything that grows with the corpus, and this bound is checked for every file the manifest
 * declares so the failure surfaces during the check instead.
 */
export const MAX_PUBLISHED_FILE_BYTES = 90_000_000

const COMPLETION_SHARD =
  /^data\/dossier-completion\/dossier-completion-(?:00[1-9]|0[1-9]\d|[1-9]\d{2})\.ndjson$/u

/** True for a published completion shard, which is the only place completion rows may live. */
export function isDossierCompletionShard(path: string): boolean {
  return COMPLETION_SHARD.test(path)
}

/** Every manifest file large enough to be refused by the host, named with its size. */
export function oversizedFileProblems(
  files: ReadonlyArray<{ path: string; bytes: number }>,
): string[] {
  return files
    .filter((file) => file.bytes > MAX_PUBLISHED_FILE_BYTES)
    .map(
      (file) =>
        `${file.path} is ${(file.bytes / 1e6).toFixed(1)} MB, over the ${(MAX_PUBLISHED_FILE_BYTES / 1e6).toFixed(0)} MB published-file bound. Shard it.`,
    )
}

/**
 * The completion corpus is published as shards, exactly like the medicine corpus. At least one has
 * to be declared: an export with no shard at all is an export that lost the completion artifact,
 * which a hash check alone would not notice.
 */
export function completionShardProblems(paths: readonly string[]): string[] {
  const inDirectory = paths.filter((path) => path.startsWith(`${DOSSIER_COMPLETION_DIRECTORY}/`))
  const misnamed = inDirectory.filter((path) => !isDossierCompletionShard(path))
  const problems = misnamed.map(
    (path) =>
      `${path} is not a dossier-completion-NNN.ndjson shard of ${DOSSIER_COMPLETION_DIRECTORY}`,
  )
  if (inDirectory.length === misnamed.length) {
    problems.push(
      `manifest declares no ${DOSSIER_COMPLETION_DIRECTORY}/dossier-completion-NNN.ndjson shard`,
    )
  }
  return problems
}

const DECLARED_RESOLUTION_STATES = new Set<string>(INVENTORY_RESOLUTION_STATES)
const DECLARED_SECTION_STATES = new Set<string>(SECTION_STATES)

/**
 * Statuses that redirect one record to the canonical record for the same entity. The manifest
 * publishes them as one number because a reader asking "where did this address go" does not need
 * to know which of the three rules produced the redirect.
 */
const REDIRECTING_RESOLUTION_STATES = [
  'DUPLICATE_OF_CANONICAL_ENTITY',
  'ALIAS_OF_CANONICAL_ENTITY',
  'HISTORICAL_REDIRECT',
] as const

/**
 * Fields the public boundary strips: operational laboratory detail and withheld patient-facing
 * advice.
 *
 * MATCHED STRUCTURALLY, NOT AS TEXT. The first version of this scan searched the raw bytes for
 * `"homeRemedies"` and reported all ten medicine shards as leaking. They were not. The boundary had
 * removed every value and left the key behind an empty array — 35 occurrences in the first shard, 0
 * of them carrying anything. A substring scan cannot tell an emptied field from a populated one,
 * and it also cannot tell a real field from the access-denial block that names these fields in
 * order to say they are withheld. Both would fail a check that reads the file as a string.
 *
 * So the rule is about content: the key may appear, its value may not. An empty array or object
 * discloses nothing.
 */
const RESTRICTED_KEYS = new Set([
  'reagentsAndBuffer',
  'stepNumber',
  'qualityControlRecipe',
  'clinicalPrecaution',
  'homeRemedies',
  'prosAndCons',
])

/** Every restricted key holding something, as `key` paired with a short rendering of the value. */
export function restrictedContentIn(node: unknown, found: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const item of node) restrictedContentIn(item, found)
    return found
  }
  if (node === null || typeof node !== 'object') return found

  for (const [key, value] of Object.entries(node)) {
    const empty =
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) ||
      (typeof value === 'string' && value.trim() === '')

    if (RESTRICTED_KEYS.has(key) && !empty) {
      found.push(`${key}=${JSON.stringify(value).slice(0, 120)}`)
    }
    restrictedContentIn(value, found)
  }
  return found
}

interface ManifestFile {
  path: string
  rows?: number
  bytes: number
  sha256: string
  licence?: string
  schemaVersion?: string
  mediaType?: string
}

interface Manifest {
  generatedAt: string
  licence: string
  counts?: {
    total?: number
    agentRuns?: number
    agentCandidates?: number
    agentFindings?: number
    canonicalEntities?: number
    redirectedIdentities?: number
    goneIdentities?: number
    completeDossiers?: number
    incompleteDossiers?: number
  }
  files: ManifestFile[]
}

const failures: string[] = []
const fail = (message: string) => failures.push(message)

/**
 * Return the published record count represented by one manifest entry.
 *
 * A formatted JSON document is not line-delimited data. Counting its physical lines made the
 * current-agent manifest look like 1,553 records even though its declared rows are the ten agent
 * artifacts. JSON row semantics therefore stay explicit and schema-bound instead of silently
 * treating whitespace as data.
 */
export function publishedRowCount(
  file: Pick<ManifestFile, 'path' | 'mediaType' | 'schemaVersion'>,
  body: Buffer,
): number {
  const text = body.toString('utf8')
  if (file.path === 'data/agents/current/manifest.json') {
    if (
      file.mediaType !== 'application/json' ||
      file.schemaVersion !== 'rnawiki-current-agent-manifest/v1'
    ) {
      throw new TypeError(
        `${file.path} must declare application/json and rnawiki-current-agent-manifest/v1`,
      )
    }
    const parsed = JSON.parse(text) as unknown
    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed) ||
      (parsed as Record<string, unknown>).schema !== 'rnawiki-current-agent-manifest/v1' ||
      !Array.isArray((parsed as Record<string, unknown>).artifacts)
    ) {
      throw new TypeError(`${file.path} does not match rnawiki-current-agent-manifest/v1`)
    }
    return ((parsed as Record<string, unknown>).artifacts as unknown[]).length
  }
  if (file.mediaType === 'text/csv') {
    const lines = text.trim().split('\n')
    return Math.max(0, lines.length - 1)
  }
  if (file.mediaType === 'application/x-ndjson') {
    return text.split('\n').filter((line) => line.length > 0).length
  }
  throw new TypeError(
    `${file.path} has no row-count contract for ${file.mediaType ?? 'an undeclared media type'} (${file.schemaVersion ?? 'an undeclared schema'})`,
  )
}

/** True when `key` appears anywhere in the tree, at any depth, holding anything at all. */
function carriesKey(node: unknown, key: string): boolean {
  if (Array.isArray(node)) return node.some((entry) => carriesKey(entry, key))
  if (node === null || typeof node !== 'object') return false
  return Object.entries(node).some(
    ([candidate, value]) => candidate === key || carriesKey(value, key),
  )
}

function stringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) return null
  return value as string[]
}

/**
 * One published identity resolution, read as a downloader receives it.
 *
 * The rule that matters most here is the last one: a record is never published in relation to
 * another record. An attribution warning holds `relatedSlugs` in the database, because a reviewer
 * needs to see which rows share a registry identifier. A shared identifier is not merge evidence,
 * so publishing those names would put two medicines on one line and invite exactly the inference
 * the resolver refuses to make. The published row carries the warning code alone.
 */
export function inventoryRowProblems(
  value: unknown,
  lineNumber: number,
): { problems: string[]; resolutionStatus: string | null } {
  const context = `${INVENTORY_RESOLUTION_PATH} line ${lineNumber}`
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return { problems: [`${context} is not an object`], resolutionStatus: null }
  }
  const row = value as Record<string, unknown>
  const problems: string[] = []
  for (const key of [
    'originalRecordId',
    'originalSlug',
    'originalName',
    'entityClass',
    'entityClassRule',
    'canonicalSlug',
    'identityConfidence',
    'contentDigest',
    'resolverVersion',
  ]) {
    if (typeof row[key] !== 'string' || !(row[key] as string).trim()) {
      problems.push(`${context}.${key} is blank or absent`)
    }
  }
  const resolutionStatus =
    typeof row.resolutionStatus === 'string' && DECLARED_RESOLUTION_STATES.has(row.resolutionStatus)
      ? row.resolutionStatus
      : null
  if (!resolutionStatus) {
    problems.push(`${context}.resolutionStatus is not a declared resolution state`)
  }
  if (row.redirectTargetSlug !== null && typeof row.redirectTargetSlug !== 'string') {
    problems.push(`${context}.redirectTargetSlug is neither a slug nor null`)
  }
  for (const key of ['identitySourceKinds', 'attributionWarningCodes', 'resolutionEvidence']) {
    if (!stringArray(row[key])) problems.push(`${context}.${key} is not a string array`)
  }
  if (carriesKey(row, 'relatedSlugs')) {
    problems.push(`${context} carries relatedSlugs, which names one record in relation to another`)
  }
  return { problems, resolutionStatus }
}

/** One published completion assessment: every applicable section, each in a declared state. */
export function completionRowProblems(
  value: unknown,
  lineNumber: number,
  path: string = `${DOSSIER_COMPLETION_DIRECTORY}/dossier-completion-001.ndjson`,
): string[] {
  const context = `${path} line ${lineNumber}`
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [`${context} is not an object`]
  }
  const row = value as Record<string, unknown>
  const problems: string[] = []
  for (const key of [
    'slug',
    'name',
    'entityClass',
    'status',
    'resolverVersion',
    'contentChangedAt',
  ]) {
    if (typeof row[key] !== 'string' || !(row[key] as string).trim()) {
      problems.push(`${context}.${key} is blank or absent`)
    }
  }
  if (row.status !== 'COMPLETE' && row.status !== 'INCOMPLETE') {
    problems.push(`${context}.status is not COMPLETE or INCOMPLETE`)
  }
  const applicable = row.applicableSectionCount
  if (!Number.isInteger(applicable) || Number(applicable) < 0) {
    problems.push(`${context}.applicableSectionCount is not a count`)
  }
  if (!Array.isArray(row.sections)) {
    problems.push(`${context}.sections is not an array`)
    return problems
  }
  if (Number.isInteger(applicable) && row.sections.length !== applicable) {
    problems.push(
      `${context} declares ${String(applicable)} applicable section(s) but holds ${row.sections.length}`,
    )
  }
  const nonTerminal = stringArray(row.nonTerminalSectionIds)
  if (!nonTerminal) problems.push(`${context}.nonTerminalSectionIds is not a string array`)
  else if ((row.status === 'COMPLETE') !== (nonTerminal.length === 0)) {
    problems.push(`${context}.status disagrees with its unresolved section list`)
  }
  for (const [index, candidate] of row.sections.entries()) {
    const sectionContext = `${context}.sections[${index}]`
    if (candidate === null || typeof candidate !== 'object' || Array.isArray(candidate)) {
      problems.push(`${sectionContext} is not an object`)
      continue
    }
    const section = candidate as Record<string, unknown>
    if (typeof section.sectionId !== 'string' || !section.sectionId.trim()) {
      problems.push(`${sectionContext}.sectionId is blank or absent`)
    }
    if (typeof section.state !== 'string' || !DECLARED_SECTION_STATES.has(section.state)) {
      problems.push(`${sectionContext}.state is not a declared section state`)
    }
    if (typeof section.basisKind !== 'string' || !section.basisKind.trim()) {
      problems.push(`${sectionContext}.basisKind is blank or absent`)
    }
    if (typeof section.basis !== 'string' || !section.basis.trim()) {
      problems.push(`${sectionContext}.basis is blank or absent`)
    }
    if (!Array.isArray(section.sourceRefs)) {
      problems.push(`${sectionContext}.sourceRefs is not an array`)
    }
  }
  return problems
}

/**
 * Every original record must land in exactly one bucket. The five buckets have to add back up to
 * the number of published rows, or a record has been dropped or counted twice on the way out.
 */
export function inventoryLedgerProblems(
  statusCounts: ReadonlyMap<string, number>,
  publishedRows: number,
): string[] {
  const problems: string[] = []
  const tally = (state: string): number => statusCounts.get(state) ?? 0
  const undeclared = [...statusCounts.keys()].filter(
    (state) => !DECLARED_RESOLUTION_STATES.has(state),
  )
  for (const state of undeclared) {
    problems.push(`${INVENTORY_RESOLUTION_PATH} holds undeclared resolution state ${state}`)
  }
  const accounted =
    tally('CANONICAL_ENTITY') +
    REDIRECTING_RESOLUTION_STATES.reduce((total, state) => total + tally(state), 0) +
    tally('INVALID_IDENTITY_GONE') +
    tally('MANUAL_IDENTITY_REVIEW_REQUIRED')
  if (accounted !== publishedRows) {
    problems.push(
      `${INVENTORY_RESOLUTION_PATH} publishes ${publishedRows} row(s) but its statuses account for ${accounted}`,
    )
  }
  return problems
}

function consensusCompletenessProblems(
  value: unknown,
  lineNumber: number,
): {
  problems: string[]
  documentsExamined: number
  maxSourcesInReading: number
} {
  const context = `data/source-consensus.ndjson line ${lineNumber}`
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return {
      problems: [`${context} is not an object`],
      documentsExamined: 0,
      maxSourcesInReading: 0,
    }
  }
  const row = value as Record<string, unknown>
  const readings = Array.isArray(row.readings) ? row.readings : []
  const problems: string[] = []
  if (!Array.isArray(row.readings)) problems.push(`${context}.readings is not an array`)
  if (
    !Array.isArray(row.comparisonReasons) ||
    row.comparisonReasons.some((reason) => typeof reason !== 'string')
  ) {
    problems.push(`${context}.comparisonReasons is not a string array`)
  }
  if (
    !['agree', 'differ', 'not_comparable', 'insufficient_context'].includes(
      String(row.comparisonState),
    )
  ) {
    problems.push(`${context}.comparisonState is not a declared v2 state`)
  }
  let represented = 0
  let maxSourcesInReading = 0
  const comparableReadings: ConsensusComparableReading[] = []
  for (const [readingIndex, candidate] of readings.entries()) {
    const readingContext = `${context}.readings[${readingIndex}]`
    if (candidate === null || typeof candidate !== 'object' || Array.isArray(candidate)) {
      problems.push(`${readingContext} is not an object`)
      continue
    }
    const reading = candidate as Record<string, unknown>
    const sources = Array.isArray(reading.sources) ? reading.sources : []
    if (!Number.isInteger(reading.sourceCount) || Number(reading.sourceCount) < 1) {
      problems.push(`${readingContext}.sourceCount is not a positive integer`)
      continue
    }
    represented += Number(reading.sourceCount)
    maxSourcesInReading = Math.max(maxSourcesInReading, sources.length)
    if (sources.length !== reading.sourceCount) {
      problems.push(
        `${readingContext} declares ${String(reading.sourceCount)} sources but retains ${sources.length}`,
      )
    }
    if (typeof reading.populationContext !== 'string' || !reading.populationContext.trim()) {
      problems.push(`${readingContext}.populationContext is blank or absent`)
    }
    if (
      typeof reading.display === 'string' &&
      reading.display.trim() &&
      typeof reading.populationContext === 'string' &&
      reading.populationContext.trim() &&
      (reading.unit === undefined || typeof reading.unit === 'string')
    ) {
      comparableReadings.push({
        display: reading.display,
        ...(typeof reading.unit === 'string' ? { unit: reading.unit } : {}),
        populationContext: reading.populationContext,
      })
    } else if (typeof reading.display !== 'string' || !reading.display.trim()) {
      problems.push(`${readingContext}.display is blank or absent`)
    }
    for (const [sourceIndex, sourceCandidate] of sources.entries()) {
      const source =
        sourceCandidate !== null &&
        typeof sourceCandidate === 'object' &&
        !Array.isArray(sourceCandidate)
          ? (sourceCandidate as Record<string, unknown>)
          : null
      if (
        !source ||
        ['kind', 'identifier', 'label', 'retrievedAt', 'excerpt'].some(
          (key) => typeof source[key] !== 'string' || !(source[key] as string).trim(),
        )
      ) {
        problems.push(`${readingContext}.sources[${sourceIndex}] is incomplete`)
      }
    }
  }
  if (!Number.isInteger(row.sourceCount) || represented !== row.sourceCount) {
    problems.push(
      `${context} declares ${String(row.sourceCount)} sources but reading groups represent ${represented}`,
    )
  }
  if (comparableReadings.length === readings.length && comparableReadings.length > 0) {
    const expected = compareConsensusReadings(comparableReadings)
    if (row.comparisonState !== expected.state) {
      problems.push(
        `${context}.comparisonState is ${String(row.comparisonState)} but the context-aware contract requires ${expected.state}`,
      )
    }
    const actualReasons = Array.isArray(row.comparisonReasons)
      ? [...row.comparisonReasons].sort()
      : []
    if (JSON.stringify(actualReasons) !== JSON.stringify(expected.reasons)) {
      problems.push(
        `${context}.comparisonReasons do not match the context-aware contract (${expected.reasons.join(', ')})`,
      )
    }
  }
  return {
    problems,
    documentsExamined:
      typeof row.documentsExamined === 'number' && Number.isFinite(row.documentsExamined)
        ? row.documentsExamined
        : 0,
    maxSourcesInReading,
  }
}

function main(): void {
  if (!existsSync(MANIFEST_PATH)) {
    console.error(
      `[check:dataset-export] no manifest at ${MANIFEST_PATH}. Run npm run export:dataset.`,
    )
    process.exit(1)
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Manifest

  if (manifest.licence !== EXPECTED_LICENCE) {
    fail(
      `manifest licence is ${JSON.stringify(manifest.licence)}, expected ${JSON.stringify(EXPECTED_LICENCE)}`,
    )
  }

  const listed = new Set(manifest.files.map((file) => file.path))
  for (const required of REQUIRED_PATHS) {
    if (required === 'data/manifest.json') continue
    if (required === DERIVED_AGENT_MANIFEST && !CHECKS_REPOSITORY_DATA) continue
    if (!listed.has(required)) fail(`manifest does not list ${required}`)
  }
  for (const problem of completionShardProblems([...listed])) fail(problem)
  for (const problem of oversizedFileProblems(manifest.files)) fail(problem)

  let verified = 0
  let totalRows = 0
  let maximumConsensusDocuments = 0
  let maximumConsensusSources = 0
  let inventoryRows = 0
  let completionRows = 0
  let completeDossiers = 0
  const resolutionStatusCounts = new Map<string, number>()

  for (const file of manifest.files) {
    // The derived agent package always lives in the repository; it is attached to a manifest
    // rather than written into the export directory.
    const absolute =
      file.path === DERIVED_AGENT_MANIFEST
        ? join(process.cwd(), file.path)
        : artifactPath(file.path)

    if (!existsSync(absolute)) {
      fail(`${file.path} is listed in the manifest but missing from disk`)
      continue
    }

    const body = readFileSync(absolute)

    if (body.byteLength !== file.bytes) {
      fail(`${file.path} is ${body.byteLength} bytes, manifest says ${file.bytes}`)
      continue
    }

    const digest = createHash('sha256').update(body).digest('hex')
    if (digest !== file.sha256) {
      fail(
        `${file.path} hashes to ${digest.slice(0, 16)}…, manifest says ${file.sha256.slice(0, 16)}…`,
      )
      continue
    }

    if (file.licence && file.licence !== EXPECTED_LICENCE) {
      fail(`${file.path} declares licence ${JSON.stringify(file.licence)}`)
    }

    if (typeof file.rows === 'number') {
      try {
        const rows = publishedRowCount(file, body)
        if (rows !== file.rows) {
          fail(`${file.path} holds ${rows} rows, manifest says ${file.rows}`)
        }
      } catch (error) {
        fail(
          `${file.path} row count cannot be verified: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    if (file.path.endsWith('.ndjson')) {
      const lines = body
        .toString('utf8')
        .split('\n')
        .filter((line) => line.length > 0)

      if (file.path.startsWith('data/drugs/')) totalRows += lines.length

      let leaks = 0
      let firstLeak = ''
      for (const [lineIndex, line] of lines.entries()) {
        const parsed = JSON.parse(line) as unknown
        const found = restrictedContentIn(parsed)
        if (found.length > 0) {
          leaks += found.length
          if (!firstLeak) firstLeak = found[0]!
        }
        if (file.path === INVENTORY_RESOLUTION_PATH) {
          inventoryRows += 1
          const { problems, resolutionStatus } = inventoryRowProblems(parsed, lineIndex + 1)
          for (const problem of problems) fail(problem)
          if (resolutionStatus) {
            resolutionStatusCounts.set(
              resolutionStatus,
              (resolutionStatusCounts.get(resolutionStatus) ?? 0) + 1,
            )
          }
        }
        if (isDossierCompletionShard(file.path)) {
          completionRows += 1
          for (const problem of completionRowProblems(parsed, lineIndex + 1, file.path)) {
            fail(problem)
          }
          if ((parsed as { status?: unknown }).status === 'COMPLETE') completeDossiers += 1
        }
        if (file.path === 'data/source-consensus.ndjson') {
          const completeness = consensusCompletenessProblems(parsed, lineIndex + 1)
          for (const problem of completeness.problems) fail(problem)
          maximumConsensusDocuments = Math.max(
            maximumConsensusDocuments,
            completeness.documentsExamined,
          )
          maximumConsensusSources = Math.max(
            maximumConsensusSources,
            completeness.maxSourcesInReading,
          )
        }
      }
      if (leaks > 0) {
        fail(`${file.path} discloses ${leaks} restricted value(s), first: ${firstLeak}`)
      }
    }

    verified += 1
  }

  const backgroundEntry = manifest.files.find(
    (file) => file.path === 'data/recorded-background.ndjson',
  )
  const consensusEntry = manifest.files.find((file) => file.path === 'data/source-consensus.ndjson')
  if (backgroundEntry?.schemaVersion !== 'recorded-background/2') {
    fail('data/recorded-background.ndjson must declare recorded-background/2')
  }
  if (consensusEntry?.schemaVersion !== 'source-consensus/2') {
    fail('data/source-consensus.ndjson must declare source-consensus/2')
  }
  const inventoryEntry = manifest.files.find((file) => file.path === INVENTORY_RESOLUTION_PATH)
  if (inventoryEntry?.schemaVersion !== INVENTORY_RESOLUTION_SCHEMA) {
    fail(`${INVENTORY_RESOLUTION_PATH} must declare ${INVENTORY_RESOLUTION_SCHEMA}`)
  }
  // Every shard is one file of one dataset, so every shard declares the same schema.
  for (const shard of manifest.files.filter((file) => isDossierCompletionShard(file.path))) {
    if (shard.schemaVersion !== DOSSIER_COMPLETION_SCHEMA) {
      fail(`${shard.path} must declare ${DOSSIER_COMPLETION_SCHEMA}`)
    }
  }
  for (const problem of inventoryLedgerProblems(resolutionStatusCounts, inventoryRows)) {
    fail(problem)
  }
  const declaredIdentityCounts = {
    canonicalEntities: resolutionStatusCounts.get('CANONICAL_ENTITY') ?? 0,
    redirectedIdentities: REDIRECTING_RESOLUTION_STATES.reduce(
      (total, state) => total + (resolutionStatusCounts.get(state) ?? 0),
      0,
    ),
    goneIdentities: resolutionStatusCounts.get('INVALID_IDENTITY_GONE') ?? 0,
    completeDossiers,
    incompleteDossiers: completionRows - completeDossiers,
  }
  for (const [key, value] of Object.entries(declaredIdentityCounts)) {
    if (manifest.counts?.[key as keyof typeof declaredIdentityCounts] !== value) {
      fail(`manifest counts.${key} does not match the published rows (${value})`)
    }
  }
  if (maximumConsensusDocuments <= 60 || maximumConsensusSources <= 4) {
    fail(
      `source-consensus completeness ratchet failed (max documents ${maximumConsensusDocuments}, max sources/reading ${maximumConsensusSources})`,
    )
  }

  const declaredTotal = manifest.counts?.total
  if (typeof declaredTotal === 'number' && totalRows > 0 && totalRows !== declaredTotal) {
    fail(`medicine shards hold ${totalRows} records, manifest counts.total says ${declaredTotal}`)
  }

  if (CHECKS_REPOSITORY_DATA) {
    try {
      const currentAgents = loadCurrentAgentPackage()
      const expected = {
        agentRuns: currentAgents.manifest.artifacts.length,
        agentCandidates: currentAgents.manifest.totals.candidates,
        agentFindings: currentAgents.manifest.totals.findings,
      }
      for (const [key, value] of Object.entries(expected)) {
        if (manifest.counts?.[key as keyof typeof expected] !== value) {
          fail(`manifest counts.${key} does not match the current agent package (${value})`)
        }
      }
    } catch (error) {
      fail(
        `current agent package is invalid: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  } else {
    console.log(
      `[check:dataset-export] --dir ${EXPORT_DIR}: the derived agent package is attached to the manifest after the corpus commit, so it is not checked here.`,
    )
  }

  const publishedBytes = manifest.files.reduce((total, file) => total + file.bytes, 0)
  const largest = [...manifest.files].sort((left, right) => right.bytes - left.bytes)[0]
  console.log(
    `[check:dataset-export] ${verified}/${manifest.files.length} files verified · ` +
      `${totalRows} records · generated ${manifest.generatedAt} · ${manifest.licence}`,
  )
  console.log(
    `[check:dataset-export] ${(publishedBytes / 1e6).toFixed(1)} MB declared` +
      (largest
        ? ` · largest ${largest.path} at ${(largest.bytes / 1e6).toFixed(1)} MB ` +
          `(bound ${(MAX_PUBLISHED_FILE_BYTES / 1e6).toFixed(0)} MB)`
        : ''),
  )
  // Reported, never required: an identity waiting for a person is a real outcome, not a failure.
  console.log(
    `[check:dataset-export] identity ${inventoryRows} row(s) · ` +
      `${declaredIdentityCounts.canonicalEntities} canonical · ` +
      `${declaredIdentityCounts.redirectedIdentities} redirected · ` +
      `${declaredIdentityCounts.goneIdentities} gone · ` +
      `${resolutionStatusCounts.get('MANUAL_IDENTITY_REVIEW_REQUIRED') ?? 0} waiting for a person · ` +
      `completion ${completionRows} row(s), ${declaredIdentityCounts.incompleteDossiers} not yet complete`,
  )

  if (failures.length > 0) {
    console.error(`\n[check:dataset-export] ${failures.length} problem(s):`)
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
  }

  console.log('[check:dataset-export] the published files match the manifest exactly.')
}

if (RUNS_AS_SCRIPT) main()
