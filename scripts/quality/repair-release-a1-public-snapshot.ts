import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  applyExactReleaseA1Repair,
  RELEASE_A1_SELF_CERTIFICATION_REPAIRS,
} from '@/lib/release-a1-self-certification-repairs'
import { stableJsonStringify } from '@/lib/stable-json'

interface ManifestFile {
  path: string
  rows: number
  bytes: number
  sha256: string
}

interface DatasetManifest {
  generatedAt: string
  files: ManifestFile[]
}

const DATA_DIR = join(process.cwd(), 'data')
const DRUGS_DIR = join(DATA_DIR, 'drugs')
const MANIFEST_PATH = join(DATA_DIR, 'manifest.json')

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function main(): void {
  const apply = process.argv.includes('--apply')
  const unexpected = process.argv.slice(2).filter((argument) => argument !== '--apply')
  if (unexpected.length > 0) throw new Error(`Unknown argument(s): ${unexpected.join(', ')}`)

  const repairsById = new Map<string, (typeof RELEASE_A1_SELF_CERTIFICATION_REPAIRS)[number][]>()
  for (const repair of RELEASE_A1_SELF_CERTIFICATION_REPAIRS) {
    const current = repairsById.get(repair.slug) ?? []
    current.push(repair)
    repairsById.set(repair.slug, current)
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as DatasetManifest
  const manifestFiles = new Map(manifest.files.map((file) => [file.path, file]))
  const seen = new Set<string>()
  let appliedFragments = 0
  let alreadyAppliedFragments = 0
  let changedFiles = 0

  for (const name of readdirSync(DRUGS_DIR)
    .filter((file) => file.endsWith('.ndjson'))
    .sort()) {
    const filePath = join(DRUGS_DIR, name)
    const originalBody = readFileSync(filePath, 'utf8')
    const outputLines: string[] = []

    for (const [lineIndex, line] of originalBody.trimEnd().split('\n').entries()) {
      let record: Record<string, unknown>
      try {
        record = JSON.parse(line) as Record<string, unknown>
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error)
        throw new Error(`${name}:${lineIndex + 1} is not valid NDJSON: ${detail}`)
      }

      const id = typeof record.id === 'string' ? record.id : ''
      const repairs = repairsById.get(id) ?? []
      for (const repair of repairs) {
        const column = record[repair.column]
        const state = applyExactReleaseA1Repair(column, repair)
        seen.add(`${repair.slug}:${repair.column}:${repair.path.join('.')}`)
        if (state === 'applied') appliedFragments += 1
        else alreadyAppliedFragments += 1
      }
      outputLines.push(stableJsonStringify(record))
    }

    const nextBody = `${outputLines.join('\n')}\n`
    if (nextBody === originalBody) continue
    changedFiles += 1
    if (!apply) continue

    writeFileSync(filePath, nextBody)
    const manifestPath = `data/drugs/${name}`
    const entry = manifestFiles.get(manifestPath)
    if (!entry) throw new Error(`Dataset manifest has no entry for ${manifestPath}.`)
    entry.bytes = Buffer.byteLength(nextBody)
    entry.sha256 = sha256(nextBody)
  }

  if (seen.size !== RELEASE_A1_SELF_CERTIFICATION_REPAIRS.length) {
    const missing = RELEASE_A1_SELF_CERTIFICATION_REPAIRS.filter(
      (repair) => !seen.has(`${repair.slug}:${repair.column}:${repair.path.join('.')}`),
    ).map((repair) => `${repair.slug} ${repair.column}.${repair.path.join('.')}`)
    throw new Error(`Release A.1 snapshot repair targets are missing: ${missing.join(', ')}`)
  }

  if (apply && changedFiles > 0) {
    manifest.generatedAt = new Date().toISOString()
    writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)
  }

  console.log(
    `[release-a1.snapshot-repair] mode=${apply ? 'apply' : 'check'} ` +
      `repairs=${seen.size} wouldApply=${appliedFragments} alreadyApplied=${alreadyAppliedFragments} ` +
      `filesChanged=${changedFiles}`,
  )
}

main()
