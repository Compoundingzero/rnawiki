import 'dotenv/config'

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { and, eq, inArray } from 'drizzle-orm'

import type { MedicineRecordedBackground } from '@/lib/background/types'
import { valueDigest } from '@/lib/agents/core/identity'

const BASELINE_COMMIT = '911a2d76fa8de531cff3eb9a31fbe5d01a73cacf'
const CORPUS_PATH = 'data/recorded-background.ndjson'
const MANIFEST_PATH = 'data/audits/release-b1-source-consensus-transition.json'
const SCHEMA = 'release-b1-source-consensus-transition/v1' as const
const APPLY_CONFIRMATION = 'apply-reviewed-source-consensus-only'
const LOCK_BATCH_SIZE = 200

interface CorpusRow {
  slug: string
  recordedBackground: MedicineRecordedBackground
}

interface TransitionChange {
  slug: string
  expectedDigest: string
  desiredDigest: string
}

interface TransitionManifest {
  schema: typeof SCHEMA
  baselineCommit: string
  corpusPath: typeof CORPUS_PATH
  boundary: 'sourceConsensus-only'
  changedRows: number
  changes: TransitionChange[]
}

function corpusRows(bytes: string, label: string): Map<string, CorpusRow> {
  const rows = new Map<string, CorpusRow>()
  for (const [index, line] of bytes.split('\n').entries()) {
    if (!line.trim()) continue
    const parsed = JSON.parse(line) as Partial<CorpusRow>
    if (
      typeof parsed.slug !== 'string' ||
      !parsed.slug ||
      !parsed.recordedBackground ||
      parsed.recordedBackground.version !== 'medicine-background/v1'
    ) {
      throw new Error(`${label} row ${index + 1} is not a recorded-background row`)
    }
    if (rows.has(parsed.slug)) throw new Error(`${label} contains duplicate slug ${parsed.slug}`)
    rows.set(parsed.slug, parsed as CorpusRow)
  }
  if (rows.size === 0) throw new Error(`${label} contains zero records`)
  return rows
}

function currentCorpus(root = process.cwd()): Map<string, CorpusRow> {
  return corpusRows(readFileSync(join(root, CORPUS_PATH), 'utf8'), CORPUS_PATH)
}

function baselineCorpus(root = process.cwd()): Map<string, CorpusRow> {
  return corpusRows(
    execFileSync('git', ['show', `${BASELINE_COMMIT}:${CORPUS_PATH}`], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    }),
    `${BASELINE_COMMIT}:${CORPUS_PATH}`,
  )
}

function withoutSourceConsensus(background: MedicineRecordedBackground): Record<string, unknown> {
  const rest: Record<string, unknown> = { ...background }
  delete rest.sourceConsensus
  return rest
}

export function buildReleaseB1SourceConsensusTransition(
  baseline: ReadonlyMap<string, CorpusRow>,
  desired: ReadonlyMap<string, CorpusRow>,
): TransitionManifest {
  const baselineSlugs = [...baseline.keys()].sort()
  const desiredSlugs = [...desired.keys()].sort()
  if (JSON.stringify(baselineSlugs) !== JSON.stringify(desiredSlugs)) {
    throw new Error('Release B1 source-consensus transition may not add or remove medicine rows')
  }

  const changes: TransitionChange[] = []
  for (const slug of desiredSlugs) {
    const before = baseline.get(slug)!.recordedBackground
    const after = desired.get(slug)!.recordedBackground
    const expectedDigest = valueDigest(before)
    const desiredDigest = valueDigest(after)
    if (expectedDigest === desiredDigest) continue
    if (
      valueDigest(withoutSourceConsensus(before)) !== valueDigest(withoutSourceConsensus(after))
    ) {
      throw new Error(`${slug} changes a field outside recordedBackground.sourceConsensus`)
    }
    changes.push({ slug, expectedDigest, desiredDigest })
  }
  if (changes.length === 0)
    throw new Error('Release B1 source-consensus transition is unexpectedly empty')
  return {
    schema: SCHEMA,
    baselineCommit: BASELINE_COMMIT,
    corpusPath: CORPUS_PATH,
    boundary: 'sourceConsensus-only',
    changedRows: changes.length,
    changes,
  }
}

function serialized(manifest: TransitionManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`
}

function expectedManifest(root = process.cwd()): TransitionManifest {
  return buildReleaseB1SourceConsensusTransition(baselineCorpus(root), currentCorpus(root))
}

function checkedManifest(root = process.cwd()): TransitionManifest {
  const expected = expectedManifest(root)
  const path = join(root, MANIFEST_PATH)
  const actualBytes = readFileSync(path, 'utf8')
  if (actualBytes !== serialized(expected)) {
    throw new Error(`${MANIFEST_PATH} is stale; run this script with --prepare`)
  }
  return expected
}

async function apply(manifest: TransitionManifest, root = process.cwd()): Promise<void> {
  if (process.env.RELEASE_B1_SOURCE_CONSENSUS_APPLY !== APPLY_CONFIRMATION) {
    throw new Error(
      `Set RELEASE_B1_SOURCE_CONSENSUS_APPLY=${APPLY_CONFIRMATION} for the explicit operator step.`,
    )
  }
  const desiredBySlug = currentCorpus(root)
  const [{ db, closeDatabasePool }, { drugs }] = await Promise.all([
    import('@/db'),
    import('@/db/schema'),
  ])
  try {
    const applied = await db.transaction(async (tx) => {
      const slugs = manifest.changes.map((change) => change.slug)
      const locked: Array<{
        id: string
        slug: string
        recordedBackground: MedicineRecordedBackground | null
      }> = []
      for (let offset = 0; offset < slugs.length; offset += LOCK_BATCH_SIZE) {
        locked.push(
          ...(await tx
            .select({
              id: drugs.id,
              slug: drugs.slug,
              recordedBackground: drugs.recordedBackground,
            })
            .from(drugs)
            .where(inArray(drugs.slug, slugs.slice(offset, offset + LOCK_BATCH_SIZE)))
            .for('update')),
        )
      }
      const lockedBySlug = new Map(locked.map((row) => [row.slug, row]))
      if (lockedBySlug.size !== manifest.changes.length) {
        const missing = slugs.filter((slug) => !lockedBySlug.has(slug))
        throw new Error(`Production is missing ${missing.length} guarded medicine row(s)`)
      }

      const pending: typeof locked = []
      for (const change of manifest.changes) {
        const row = lockedBySlug.get(change.slug)!
        const desired = desiredBySlug.get(change.slug)?.recordedBackground
        if (!row.recordedBackground || !desired || valueDigest(desired) !== change.desiredDigest) {
          throw new Error(`${change.slug} does not match the checked desired corpus`)
        }
        const liveDigest = valueDigest(row.recordedBackground)
        if (liveDigest === change.desiredDigest) continue
        if (liveDigest !== change.expectedDigest) {
          throw new Error(`${change.slug} failed its exact expected-value digest guard`)
        }
        pending.push(row)
      }

      for (const row of pending) {
        const desired = desiredBySlug.get(row.slug)!.recordedBackground
        const updated = await tx
          .update(drugs)
          .set({ recordedBackground: desired })
          .where(and(eq(drugs.id, row.id), eq(drugs.slug, row.slug)))
          .returning({ id: drugs.id })
        if (updated.length !== 1) throw new Error(`${row.slug} changed after its row lock`)
      }
      return pending.length
    })
    console.log(
      `[release-b1-source-consensus] ${manifest.changedRows} guarded row(s) checked · ${applied} applied · ${manifest.changedRows - applied} already current`,
    )
  } finally {
    await closeDatabasePool()
  }
}

async function main(): Promise<void> {
  const root = process.cwd()
  if (process.argv.includes('--prepare')) {
    const manifest = expectedManifest(root)
    writeFileSync(join(root, MANIFEST_PATH), serialized(manifest))
    console.log(`[release-b1-source-consensus] prepared ${manifest.changedRows} exact guards`)
    return
  }
  const manifest = checkedManifest(root)
  if (process.argv.includes('--apply')) await apply(manifest, root)
  else console.log(`[release-b1-source-consensus] ${manifest.changedRows} exact guards verified`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
