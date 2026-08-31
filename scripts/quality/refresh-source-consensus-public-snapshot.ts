import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import type { MedicineRecordedBackground, RecordedSourceConsensus } from '@/lib/background/types'
import { stableJsonStringify } from '@/lib/stable-json'
import { SOURCE_CONSENSUS } from '@/scripts/seed-data/background/source-consensus.generated'

/**
 * Replaces only the derived source-consensus member of the checked-in background snapshot.
 * Medical values and every other envelope member remain byte-for-byte equivalent after stable JSON
 * serialization. This script never reads a database or the source archive.
 */

const DATA_DIR = join(process.cwd(), 'data')
const BACKGROUND_PATH = join(DATA_DIR, 'recorded-background.ndjson')
const CONSENSUS_PATH = join(DATA_DIR, 'source-consensus.ndjson')
const MANIFEST_PATH = join(DATA_DIR, 'manifest.json')
const APPLY = process.argv.includes('--apply')

interface BackgroundRow {
  slug: string
  recordedBackground: MedicineRecordedBackground
  [key: string]: unknown
}

interface ManifestFile {
  path: string
  rows: number
  bytes: number
  sha256: string
  schemaVersion: string
  description: string
  limitations: string
  [key: string]: unknown
}

interface Manifest {
  files: ManifestFile[]
  [key: string]: unknown
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function lines(value: string): string[] {
  return value.split('\n').filter((line) => line.trim().length > 0)
}

function withoutConsensus(
  background: MedicineRecordedBackground,
): Omit<MedicineRecordedBackground, 'sourceConsensus'> {
  const result: Partial<MedicineRecordedBackground> = { ...background }
  delete result.sourceConsensus
  return result as Omit<MedicineRecordedBackground, 'sourceConsensus'>
}

function validateCompleteConsensus(slug: string, consensus: RecordedSourceConsensus): void {
  for (const field of consensus.fields) {
    const represented = field.readings.reduce((sum, reading) => {
      if (reading.sources.length !== reading.sourceCount) {
        throw new Error(
          `${slug}.${field.field}.${reading.display} retains ${reading.sources.length} sources but declares ${reading.sourceCount}`,
        )
      }
      if (!reading.populationContext.trim()) {
        throw new Error(`${slug}.${field.field}.${reading.display} has no population context`)
      }
      return sum + reading.sourceCount
    }, 0)
    if (represented !== field.sourceCount) {
      throw new Error(
        `${slug}.${field.field} retains ${represented} sources but declares ${field.sourceCount}`,
      )
    }
  }
}

function main(): void {
  const originalBackground = readFileSync(BACKGROUND_PATH, 'utf8')
  const originalConsensus = readFileSync(CONSENSUS_PATH, 'utf8')
  const originalManifest = readFileSync(MANIFEST_PATH, 'utf8')
  const manifest = JSON.parse(originalManifest) as Manifest
  const appliedSlugs = new Set<string>()
  const backgroundLines: string[] = []
  const consensusRows: Array<Record<string, unknown>> = []

  let readingGroups = 0
  let sourceRecords = 0
  let maxDocumentsExamined = 0
  let maxSourcesInReading = 0

  for (const [index, line] of lines(originalBackground).entries()) {
    const row = JSON.parse(line) as BackgroundRow
    if (!row.slug || !row.recordedBackground) {
      throw new Error(`recorded-background line ${index + 1} lacks slug or envelope`)
    }
    const consensus = SOURCE_CONSENSUS[row.slug]
    const recordedBackground: MedicineRecordedBackground = consensus
      ? { ...withoutConsensus(row.recordedBackground), sourceConsensus: consensus }
      : withoutConsensus(row.recordedBackground)
    if (consensus) {
      appliedSlugs.add(row.slug)
      validateCompleteConsensus(row.slug, consensus)
      maxDocumentsExamined = Math.max(maxDocumentsExamined, consensus.documentsExamined)
      for (const field of consensus.fields) {
        readingGroups += field.readings.length
        sourceRecords += field.sourceCount
        for (const reading of field.readings) {
          maxSourcesInReading = Math.max(maxSourcesInReading, reading.sources.length)
        }
        consensusRows.push({
          slug: row.slug,
          field: field.field,
          documentsExamined: consensus.documentsExamined,
          sourceCount: field.sourceCount,
          agreementRate: field.agreementRate,
          comparisonState: field.comparisonState,
          comparisonReasons: field.comparisonReasons,
          readings: field.readings,
        })
      }
    }
    backgroundLines.push(stableJsonStringify({ ...row, recordedBackground }))
  }

  const missingSlugs = Object.keys(SOURCE_CONSENSUS).filter((slug) => !appliedSlugs.has(slug))
  if (missingSlugs.length > 0) {
    throw new Error(
      `${missingSlugs.length} generated consensus medicines have no public background row; first: ${missingSlugs[0]}`,
    )
  }
  if (appliedSlugs.size < 500 || consensusRows.length < 1_000) {
    throw new Error('Generated consensus is implausibly small; refusing to rewrite the snapshot.')
  }

  consensusRows.sort(
    (left, right) =>
      String(left.slug).localeCompare(String(right.slug)) ||
      String(left.field).localeCompare(String(right.field)),
  )
  const backgroundBody = `${backgroundLines.join('\n')}\n`
  const consensusBody = `${consensusRows.map(stableJsonStringify).join('\n')}\n`
  const backgroundEntry = manifest.files.find(
    (file) => file.path === 'data/recorded-background.ndjson',
  )
  const consensusEntry = manifest.files.find((file) => file.path === 'data/source-consensus.ndjson')
  if (!backgroundEntry || !consensusEntry) {
    throw new Error('The public manifest does not list both consensus-bearing artifacts.')
  }

  Object.assign(backgroundEntry, {
    rows: backgroundLines.length,
    bytes: Buffer.byteLength(backgroundBody),
    sha256: sha256(backgroundBody),
    schemaVersion: 'recorded-background/2',
    description:
      'The source-bound recorded-background corpus, including complete cross-source reading groups, explicit structured-context status, and source excerpts.',
    limitations:
      'A source count is not a count of independent experiments. Consensus population/formulation context is explicitly unknown until structurally extracted, so distinct readings are not source conflicts. An absent module means only that this corpus does not fill it.',
  })
  Object.assign(consensusEntry, {
    rows: consensusRows.length,
    bytes: Buffer.byteLength(consensusBody),
    sha256: sha256(consensusBody),
    schemaVersion: 'source-consensus/2',
    description:
      'Complete cross-source readings per field, including printed value, unit, explicit structured-context status, comparison reasons, and every represented source record.',
    limitations:
      'Current label parsing does not structurally extract population or formulation context. Distinct otherwise-comparable readings are therefore insufficient_context, never differ; agree may mean printed-reading agreement only. Source records are complete but are not independent-experiment counts.',
  })
  const manifestBody = `${JSON.stringify(manifest, null, 2)}\n`

  const changed =
    originalBackground !== backgroundBody ||
    originalConsensus !== consensusBody ||
    originalManifest !== manifestBody
  if (!changed) {
    console.log('[source-consensus-snapshot] snapshot is current')
  } else if (!APPLY) {
    console.error(
      '[source-consensus-snapshot] snapshot differs; run with --apply after regenerating the source-consensus seed.',
    )
    process.exitCode = 1
  } else {
    writeFileSync(BACKGROUND_PATH, backgroundBody)
    writeFileSync(CONSENSUS_PATH, consensusBody)
    writeFileSync(MANIFEST_PATH, manifestBody)
  }

  console.log(
    `[source-consensus-snapshot] ${appliedSlugs.size} medicines · ${consensusRows.length} fields · ${readingGroups} readings · ${sourceRecords} complete source records · max ${maxDocumentsExamined} documents/medicine · max ${maxSourcesInReading} sources/reading`,
  )
}

main()
