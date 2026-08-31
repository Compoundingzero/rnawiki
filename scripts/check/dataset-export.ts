import 'dotenv/config'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  compareConsensusReadings,
  type ConsensusComparableReading,
} from '@/lib/background/source-consensus-comparison'

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

const EXPORT_DIR = join(process.cwd(), 'data')
const MANIFEST_PATH = join(EXPORT_DIR, 'manifest.json')
const EXPECTED_LICENCE = 'CC BY 4.0 — see LICENSE-DATA'

/** Artifacts whose absence means the export predates the recorded-background corpus. */
const REQUIRED_PATHS = [
  'data/manifest.json',
  'data/drugs.csv',
  'data/recorded-background.ndjson',
  'data/source-consensus.ndjson',
  'data/agents/current/manifest.json',
]

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
    if (!listed.has(required)) fail(`manifest does not list ${required}`)
  }

  let verified = 0
  let totalRows = 0
  let maximumConsensusDocuments = 0
  let maximumConsensusSources = 0

  for (const file of manifest.files) {
    const absolute = join(process.cwd(), file.path)

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
  if (maximumConsensusDocuments <= 60 || maximumConsensusSources <= 4) {
    fail(
      `source-consensus completeness ratchet failed (max documents ${maximumConsensusDocuments}, max sources/reading ${maximumConsensusSources})`,
    )
  }

  const declaredTotal = manifest.counts?.total
  if (typeof declaredTotal === 'number' && totalRows > 0 && totalRows !== declaredTotal) {
    fail(`medicine shards hold ${totalRows} records, manifest counts.total says ${declaredTotal}`)
  }

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

  console.log(
    `[check:dataset-export] ${verified}/${manifest.files.length} files verified · ` +
      `${totalRows} records · generated ${manifest.generatedAt} · ${manifest.licence}`,
  )

  if (failures.length > 0) {
    console.error(`\n[check:dataset-export] ${failures.length} problem(s):`)
    for (const failure of failures) console.error(`  - ${failure}`)
    process.exit(1)
  }

  console.log('[check:dataset-export] the published files match the manifest exactly.')
}

if (process.argv[1] && process.argv[1].endsWith('dataset-export.ts')) main()
