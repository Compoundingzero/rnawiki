/**
 * Revamp Phase 5 — load the built hubs into the tables migration 0028 creates
 * (docs/specs/hubs.md §1–§2).
 *
 *   npx tsx scripts/revamp/hubs_load.ts --dry-run
 *   npx tsx scripts/revamp/hubs_load.ts
 *   npx tsx scripts/revamp/hubs_load.ts --production-confirmed
 *
 * Flags:
 *   --dry-run                read, count and report; touch neither the database nor any marker
 *   --in <dir>               input directory, default data/revamp/hubs/load
 *   --load-dir <dir>         marker directory, default data/revamp/hubs/load/markers
 *   --batch-size n           rows per insert statement, default 500
 *   --allow-working-database permit writes to rnawiki_corpus_completion (refused by default)
 *   --production-confirmed   required before any write to a remote database
 *
 * This script moves rows. It decides nothing: every value it writes was produced by
 * `scripts/revamp/hubs_build.py` from stored fields and is copied verbatim. A member whose page has
 * no `corpus_pages` row is skipped and counted, never invented; a hub left with fewer than five
 * loadable members is skipped whole, because `docs/specs/hubs.md` §1 sets five as the floor and a
 * four-member hub is not a hub.
 *
 * Guards, the same two `scripts/corpus-20k/load/materialise.ts` applies:
 *
 *   - the working database `rnawiki_corpus_completion` is refused unless `--allow-working-database`;
 *   - any host that is not localhost and not `*.railway.internal` is treated as production and
 *     refused without `--production-confirmed`.
 *
 * Idempotence. The load writes one marker holding the sha256 of the three input files and a
 * fingerprint of the database it was written against — the sha256 of the host and the database
 * name, which identifies the target without recording a credential. Re-running with the same
 * inputs against the same target does no database work. A marker with a different digest means the
 * inputs changed; a marker written against another target never counts as done here, so a
 * disposable-database rehearsal cannot make a production load look finished.
 *
 * Order. The three tables are written inside one transaction, hubs first, and the previous hub set
 * is deleted at the start of it: `hub_members` and `hub_syntheses` cascade from `hubs`, so a hub
 * that no longer meets §1 leaves no orphan row behind and no reader ever sees half a hub set.
 */
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { createInterface } from 'node:readline'

import { Client } from 'pg'

import { databaseSslConfig, isLocalDatabaseHost } from '@/db/ssl'

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..', '..')
const DEFAULT_IN = join(ROOT, 'data', 'revamp', 'hubs', 'load')

const HUB_COLUMNS = [
  'hub_id',
  'type',
  'name',
  'slug',
  'definition',
  'definition_source',
  'member_count',
  'approved_count',
  'relevance',
  'rank_score',
  'first_batch',
] as const

const MEMBER_COLUMNS = [
  'hub_id',
  'key',
  'ordinal',
  'member_role',
  'membership_evidence',
  'approval_sg',
  'approval_us',
  'approval_au',
  'approval_uk',
  'approval_eu',
  'approval_jp',
  'approval_ca',
  'sg_forensic_class',
  'generic_available',
  'potency',
  'indications',
  'indication_count',
  'withdrawn_reason',
  'withdrawn_where',
  'trials_count',
  'results_posted_share',
  'tier',
  'first_question',
] as const

const SYNTHESIS_COLUMNS = ['hub_id', 'ordinal', 'template_id', 'sentence', 'provenance'] as const

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

function option(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)
  const value = index >= 0 ? process.argv[index + 1] : undefined
  if (value !== undefined && (value.trim() === '' || value.startsWith('--'))) {
    throw new Error(`--${name} needs a value; omit the flag to use the recorded default.`)
  }
  return value
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/** Identifies the target database without recording a credential. */
export function loadTargetFingerprint(connectionString: string): string {
  const url = new URL(connectionString)
  return sha256(`${url.host.toLowerCase()}\n${url.pathname.replace(/^\//, '')}`)
}

async function* readNdjson(path: string): AsyncGenerator<Record<string, unknown>> {
  const lines = createInterface({
    input: createReadStream(path, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    yield JSON.parse(trimmed) as Record<string, unknown>
  }
}

async function readRows(path: string): Promise<Array<Record<string, unknown>>> {
  const rows: Array<Record<string, unknown>> = []
  for await (const row of readNdjson(path)) rows.push(row)
  return rows
}

async function digestOf(paths: string[]): Promise<string> {
  const hash = createHash('sha256')
  for (const path of paths) hash.update(await readFile(path))
  return hash.digest('hex')
}

async function insertRows(
  client: Client,
  table: string,
  columns: readonly string[],
  rows: Array<Record<string, unknown>>,
  batchSize: number,
): Promise<void> {
  const quoted = columns.map((column) => `"${column}"`).join(', ')
  for (let start = 0; start < rows.length; start += batchSize) {
    const slice = rows.slice(start, start + batchSize)
    const values: unknown[] = []
    const tuples = slice.map((row) => {
      const slots = columns.map((column) => {
        values.push(row[column] ?? null)
        return `$${values.length}`
      })
      return `(${slots.join(', ')})`
    })
    await client.query(`INSERT INTO "${table}" (${quoted}) VALUES ${tuples.join(', ')}`, values)
  }
}

async function main(): Promise<void> {
  const dryRun = flag('dry-run')
  const inputDir = resolve(option('in') ?? DEFAULT_IN)
  const loadDir = resolve(option('load-dir') ?? join(inputDir, 'markers'))
  const batchSize = Number(option('batch-size') ?? 500)
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new Error('--batch-size must be >= 1.')

  const hubsFile = join(inputDir, 'hubs.ndjson')
  const membersFile = join(inputDir, 'hub-members.ndjson')
  const synthesesFile = join(inputDir, 'hub-syntheses.ndjson')

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set.')
  const databaseName = new URL(connectionString).pathname.replace(/^\//, '')
  if (databaseName === 'rnawiki_corpus_completion' && !dryRun && !flag('allow-working-database')) {
    throw new Error(
      'Refusing to write to the working database rnawiki_corpus_completion. Re-run with ' +
        '--dry-run, point DATABASE_URL at a disposable database, or pass --allow-working-database.',
    )
  }
  if (!dryRun && !isLocalDatabaseHost(connectionString) && !flag('production-confirmed')) {
    throw new Error(
      `Refusing to write to the remote database "${databaseName}" without --production-confirmed. ` +
        'Re-run with --dry-run to rehearse, or pass --production-confirmed to load it for real.',
    )
  }

  const hubRows = await readRows(hubsFile)
  const memberRowsRaw = await readRows(membersFile)
  const synthesisRows = await readRows(synthesesFile)
  const digest = await digestOf([hubsFile, membersFile, synthesesFile])
  const target = loadTargetFingerprint(connectionString)
  const markerPath = join(loadDir, 'hubs.json')

  const existing = await readFile(markerPath, 'utf8').catch(() => null)
  if (existing) {
    const marker = JSON.parse(existing) as { digest?: string; target?: string }
    if (marker.digest === digest && marker.target === target) {
      process.stdout.write(
        `Hubs already loaded against this database from these inputs (${markerPath}). Nothing to do.\n`,
      )
      return
    }
  }

  const client = new Client({ connectionString, ssl: databaseSslConfig(connectionString) })
  await client.connect()
  const counters = { hubs: 0, members: 0, syntheses: 0, skippedMembers: 0, skippedHubs: 0 }
  try {
    // A member whose page is not in this database cannot be linked, and a link that 404s is worse
    // than a shorter table. The rows are filtered here rather than at build time, because the build
    // reads the corpus files and this reads the database that will serve the page.
    const present = new Set<string>()
    const pageRows = await client.query<{ key: string }>('SELECT key FROM corpus_pages')
    for (const row of pageRows.rows) present.add(row.key)

    const memberRows: Array<Record<string, unknown>> = memberRowsRaw.map((row) => ({
      ...row,
      key: row.page,
    }))
    const loadable = memberRows.filter((row) => present.has(String(row.key)))
    counters.skippedMembers = memberRows.length - loadable.length

    const perHub = new Map<string, number>()
    for (const row of loadable) {
      const hubId = String(row.hub_id)
      perHub.set(hubId, (perHub.get(hubId) ?? 0) + 1)
    }
    const keptHubs = hubRows.filter((row) => (perHub.get(String(row.hub_id)) ?? 0) >= 5)
    counters.skippedHubs = hubRows.length - keptHubs.length
    const kept = new Set(keptHubs.map((row) => String(row.hub_id)))

    // The counts a hub prints are the counts of the members it actually carries.
    const approvedPerHub = new Map<string, number>()
    for (const row of loadable) {
      if (row.member_role !== 'approved') continue
      const hubId = String(row.hub_id)
      approvedPerHub.set(hubId, (approvedPerHub.get(hubId) ?? 0) + 1)
    }
    const hubsToWrite = keptHubs.map((row) => ({
      ...row,
      member_count: perHub.get(String(row.hub_id)) ?? 0,
      approved_count: approvedPerHub.get(String(row.hub_id)) ?? 0,
    }))
    const membersToWrite = loadable.filter((row) => kept.has(String(row.hub_id)))
    const synthesesToWrite = synthesisRows.filter((row) => kept.has(String(row.hub_id)))
    counters.hubs = hubsToWrite.length
    counters.members = membersToWrite.length
    counters.syntheses = synthesesToWrite.length

    if (dryRun) {
      process.stdout.write(`${JSON.stringify({ dryRun: true, ...counters }, null, 1)}\n`)
      return
    }

    await client.query('BEGIN')
    await client.query('DELETE FROM hubs')
    await insertRows(client, 'hubs', HUB_COLUMNS, hubsToWrite, batchSize)
    await insertRows(client, 'hub_members', MEMBER_COLUMNS, membersToWrite, batchSize)
    await insertRows(client, 'hub_syntheses', SYNTHESIS_COLUMNS, synthesesToWrite, batchSize)
    await client.query('COMMIT')

    await mkdir(loadDir, { recursive: true })
    await writeFile(
      markerPath,
      `${JSON.stringify(
        { digest, target, written: new Date().toISOString(), ...counters },
        null,
        1,
      )}\n`,
      'utf8',
    )
    process.stdout.write(`${JSON.stringify(counters, null, 1)}\n`)
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
