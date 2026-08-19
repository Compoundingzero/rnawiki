import { createWriteStream, existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { basename, join } from 'node:path'
import { OPENFDA_DIR } from './paths'

/**
 * Fetches every public source the corpus is built from, so the pipeline is reproducible on a clean
 * machine rather than only on the one where it was first run.
 *
 * ~1.9 GB in total, dominated by the 14 SPL label partitions. Resumable: a file already on disk at
 * the size the manifest advertises is skipped, so an interrupted run costs only the file it was in
 * the middle of.
 *
 *   npm run ingest:download
 *   npm run ingest:download -- --skip-labels     (drugs and NDC only, ~130 MB)
 */

interface Partition {
  file: string
  size_mb: string
  records: number
}

interface Manifest {
  results: Record<string, Record<string, { export_date?: string; partitions?: Partition[] }>>
}

const MANIFEST_URL = 'https://api.fda.gov/download.json'

async function fetchManifest(): Promise<Manifest> {
  const response = await fetch(MANIFEST_URL, { signal: AbortSignal.timeout(60_000) })
  if (!response.ok) throw new Error(`openFDA manifest returned ${response.status}`)
  return (await response.json()) as Manifest
}

/**
 * The manifest advertises a size in megabytes for the ZIPPED file. Comparing against it is what
 * makes a resume safe: a half-written file from an interrupted run is smaller and gets refetched,
 * rather than being trusted and later failing to unzip halfway through an hour-long ingest.
 */
function isComplete(path: string, expectedMb: number): boolean {
  if (!existsSync(path)) return false
  const actualMb = statSync(path).size / (1024 * 1024)
  return actualMb >= expectedMb * 0.98
}

async function download(url: string, destination: string, expectedMb: number): Promise<'downloaded' | 'skipped'> {
  if (isComplete(destination, expectedMb)) return 'skipped'
  if (existsSync(destination)) unlinkSync(destination)

  const response = await fetch(url, { signal: AbortSignal.timeout(30 * 60_000) })
  if (!response.ok || !response.body) throw new Error(`${url} returned ${response.status}`)

  const temp = `${destination}.part`
  await pipeline(Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(temp))

  // Rename only once the body is fully written, so an interrupted run never leaves a file that
  // looks complete at the final path.
  const { renameSync } = await import('node:fs')
  renameSync(temp, destination)
  return 'downloaded'
}

async function main(): Promise<void> {
  const skipLabels = process.argv.includes('--skip-labels')
  mkdirSync(OPENFDA_DIR, { recursive: true })

  console.log('[download] reading the openFDA manifest…')
  const manifest = await fetchManifest()
  const drug = manifest.results.drug
  if (!drug) throw new Error('openFDA manifest has no `drug` section')

  const wanted = skipLabels
    ? ['drugsfda', 'ndc', 'orangebook']
    : ['drugsfda', 'ndc', 'orangebook', 'label']

  let downloaded = 0
  let skipped = 0

  for (const dataset of wanted) {
    const partitions = drug[dataset]?.partitions ?? []
    console.log(
      `[download] ${dataset}: ${partitions.length} partition(s), ${drug[dataset]?.export_date ?? 'unknown date'}`,
    )

    for (const [index, partition] of partitions.entries()) {
      // Local names for the label partitions match what the extractor expects (label-01.zip …).
      const name =
        dataset === 'label'
          ? `label-${String(index + 1).padStart(2, '0')}.zip`
          : basename(new URL(partition.file).pathname).replace(/\.zip$/, '')

      const destination = join(OPENFDA_DIR, dataset === 'label' ? name : `${name}.zip`)
      const expectedMb = Number.parseFloat(partition.size_mb)

      const result = await download(partition.file, destination, expectedMb)
      if (result === 'downloaded') {
        downloaded += 1
        console.log(`   downloaded ${name} (${partition.size_mb} MB)`)
      } else {
        skipped += 1
      }

      // The three small datasets are consumed as plain JSON; the label partitions stay zipped and
      // are streamed by the extractor, because 1.8 GB unpacked is not worth the disk.
      if (dataset !== 'label' && result === 'downloaded') {
        await unzipInPlace(destination)
      }
    }
  }

  console.log(`\n[download] done · ${downloaded} downloaded · ${skipped} already present`)
  console.log(`[download] files are in ${OPENFDA_DIR}`)
  process.exit(0)
}

/** Unzips a single-entry archive next to itself and removes the archive. */
async function unzipInPlace(zipPath: string): Promise<void> {
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  const run = promisify(execFile)
  // `unzip` ships with macOS and every Linux image this runs on; reimplementing DEFLATE for a
  // one-off build step is not worth the surface area.
  await run('unzip', ['-oq', zipPath, '-d', OPENFDA_DIR])
  unlinkSync(zipPath)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
