import 'dotenv/config'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

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
}

interface Manifest {
  generatedAt: string
  licence: string
  counts?: { total?: number }
  files: ManifestFile[]
}

const failures: string[] = []
const fail = (message: string) => failures.push(message)

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

    if (file.path.endsWith('.ndjson')) {
      const lines = body
        .toString('utf8')
        .split('\n')
        .filter((line) => line.length > 0)

      if (typeof file.rows === 'number' && lines.length !== file.rows) {
        fail(`${file.path} holds ${lines.length} lines, manifest says ${file.rows}`)
      }
      if (file.path.startsWith('data/drugs/')) totalRows += lines.length

      let leaks = 0
      let firstLeak = ''
      for (const line of lines) {
        const found = restrictedContentIn(JSON.parse(line))
        if (found.length > 0) {
          leaks += found.length
          if (!firstLeak) firstLeak = found[0]!
        }
      }
      if (leaks > 0) {
        fail(`${file.path} discloses ${leaks} restricted value(s), first: ${firstLeak}`)
      }
    }

    verified += 1
  }

  const declaredTotal = manifest.counts?.total
  if (typeof declaredTotal === 'number' && totalRows > 0 && totalRows !== declaredTotal) {
    fail(`medicine shards hold ${totalRows} records, manifest counts.total says ${declaredTotal}`)
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
