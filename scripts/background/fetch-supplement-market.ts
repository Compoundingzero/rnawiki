import 'dotenv/config'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { normalizeContentName } from '@/lib/background/name-normalization'

/**
 * Records what the supplement label database holds for each supplement ingredient in the corpus.
 *
 * Most rows in this corpus are supplements — 6,148 of 9,858 — and almost none of them had anything
 * recorded, because supplements are absent from the drug-label archive entirely. A dietary
 * supplement carries no clinical-pharmacology section, no pharmacokinetics and no mechanism, so the
 * drug pipeline reaches them and finds nothing, which is exactly what a reader saw.
 *
 * There is no honest way to manufacture the missing pharmacology, and this does not try. What it
 * records is what the database itself holds and can be checked against: how many marketed labels
 * list the ingredient, what categories those products fall into, what kinds of claim they carry,
 * which brands, and the label identifiers behind every count.
 *
 * A structure/function claim is made unilaterally by a manufacturer under FFDCA 403(r)(6) and is
 * evaluated by nobody. Recording that a claim type is present on a label is a fact about the label.
 * It is not evidence the claim is true, and nothing here presents it as any.
 *
 * These values are `transcribed` rather than `extracted`: the database returns structured fields
 * with no sentence behind them, so there is no excerpt to quote. The record identifiers stand in
 * for one — every count here can be reproduced against the same public API.
 *
 * Usage:
 *   tsx scripts/background/fetch-supplement-market.ts [--limit=N]
 */

const DSLD = 'https://api.ods.od.nih.gov/dsld/v9/search-filter'

/**
 * Concurrent lookups, and how the service's rate limit is respected.
 *
 * The first run at five concurrent requests earned HTTP 429 partway through and started losing
 * lookups to failure rather than slowing down, which is the wrong response to being asked to slow
 * down. Two concurrent requests with a pause between them, and a long back-off that grows when the
 * service says 429, finishes later and finishes.
 */
const CONCURRENCY = 1
const PAUSE_BETWEEN_REQUESTS_MS = 1_000
const RATE_LIMIT_BACKOFF_MS = 30_000
const RETRY_LIMIT = 5
/**
 * Consecutive rate-limited lookups after which the run stops.
 *
 * Two concurrent requests a second apart still exhausted this service's quota, and once it starts
 * refusing it refuses everything from this address for hours. Grinding on through that turns every
 * remaining name into a failed lookup and spends hours proving the service meant it. Stopping is
 * the correct response to being refused; the cache is complete as far as it got, and the next run
 * resumes from there.
 */
const RATE_LIMIT_GIVE_UP_AFTER = 8
/** Brands and label ids kept per ingredient: enough to check a count, not a directory. */
const MAX_SAMPLES = 8

interface DsldHit {
  _id?: string
  _source?: {
    fullName?: string
    brandName?: string
    productType?: { langualCodeDescription?: string }
    claims?: Array<{ langualCodeDescription?: string }>
    allIngredients?: Array<{ ingredientGroup?: string; name?: string; category?: string }>
  }
}

export interface SupplementMarketEntry {
  /** The corpus name that was looked up. */
  queriedName: string
  labelCount: number
  categoriesAsRecorded: string[]
  claimTypesAsRecorded: string[]
  exampleBrands: string[]
  sampleLabelIds: string[]
  /** Distinguishes "the database holds nothing" from "the lookup never ran". */
  state: 'RECORDED' | 'NO_MARKETED_LABEL' | 'LOOKUP_FAILED'
}

type Cache = Record<string, SupplementMarketEntry>

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Set when a lookup ended in rate limiting rather than in an answer, so the run can stop. */
let lastLookupWasRateLimited = false

async function getJson(url: string): Promise<unknown | null> {
  lastLookupWasRateLimited = false
  for (let attempt = 0; attempt < RETRY_LIMIT; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(45_000),
      })
      if (response.status === 429) {
        // Being told to slow down is not a failure to retry quickly; it is a failure to wait.
        lastLookupWasRateLimited = true
        await sleep(RATE_LIMIT_BACKOFF_MS * (attempt + 1))
        continue
      }
      if (!response.ok) {
        await sleep(2000 * (attempt + 1))
        continue
      }
      return (await response.json()) as unknown
    } catch {
      await sleep(1000 * (attempt + 1))
    }
  }
  return null
}

/**
 * Looks one ingredient up.
 *
 * `status=1` restricts to labels currently on the market. Nearly half the database is historical
 * packaging that was discontinued years ago and is never withdrawn, and counting those would report
 * a shelf that does not exist.
 */
async function lookup(name: string): Promise<SupplementMarketEntry> {
  const query = encodeURIComponent(name)
  const payload = (await getJson(
    `${DSLD}?method=by_keyword&q=${query}&size=${MAX_SAMPLES}&from=0&status=1`,
  )) as { hits?: DsldHit[]; stats?: { count?: number } } | null
  if (!payload) {
    return {
      queriedName: name,
      labelCount: 0,
      categoriesAsRecorded: [],
      claimTypesAsRecorded: [],
      exampleBrands: [],
      sampleLabelIds: [],
      state: 'LOOKUP_FAILED',
    }
  }
  const count = payload.stats?.count ?? 0
  const hits = payload.hits ?? []
  if (count === 0 || hits.length === 0) {
    return {
      queriedName: name,
      labelCount: 0,
      categoriesAsRecorded: [],
      claimTypesAsRecorded: [],
      exampleBrands: [],
      sampleLabelIds: [],
      state: 'NO_MARKETED_LABEL',
    }
  }

  const wanted = normalizeContentName(name)
  const categories = new Set<string>()
  const claims = new Set<string>()
  const brands = new Set<string>()
  const ids = new Set<string>()
  for (const hit of hits) {
    const source = hit._source ?? {}
    if (hit._id) ids.add(hit._id)
    if (source.brandName) brands.add(source.brandName)
    const productType = source.productType?.langualCodeDescription
    if (productType) categories.add(productType)
    for (const claim of source.claims ?? []) {
      if (claim.langualCodeDescription) claims.add(claim.langualCodeDescription)
    }
    // Only the matching ingredient's own category is recorded; a multivitamin's other rows describe
    // other substances and attributing them here would be the same mis-attribution the drug side
    // spent a rebuild eliminating.
    for (const ingredient of source.allIngredients ?? []) {
      const group = ingredient.ingredientGroup ?? ingredient.name ?? ''
      if (!group) continue
      if (normalizeContentName(group) === wanted && ingredient.category) {
        categories.add(ingredient.category)
      }
    }
  }

  return {
    queriedName: name,
    labelCount: count,
    categoriesAsRecorded: [...categories].sort(),
    claimTypesAsRecorded: [...claims].sort(),
    exampleBrands: [...brands].slice(0, MAX_SAMPLES).sort(),
    sampleLabelIds: [...ids].slice(0, MAX_SAMPLES).sort(),
    state: 'RECORDED',
  }
}

/** Corpus rows that have no recorded background, which is what this exists to fill. */
function namesNeedingCoverage(): string[] {
  const dir = join(process.cwd(), 'data', 'drugs')
  const names: string[] = []
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith('.ndjson'))
    .sort()) {
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as { name?: string }
      const name = record.name?.trim()
      // A trailing bracket is a scraping artefact on a handful of rows and would never match.
      if (name && name.length >= 3 && !/^\d/u.test(name)) names.push(name.replace(/\)+$/u, ''))
    }
  }
  return [...new Set(names)]
}

/**
 * Refuses to run while another copy of this fetcher is alive.
 *
 * Three copies of this script ran at once for over an hour without anyone noticing, each polling a
 * service whose quota had already been exhausted once. Nothing in the script prevented it, and a
 * process listing is a poor place to keep an invariant. The lock records the process id, and a
 * stale lock left by a killed run is cleared by checking whether that process still exists rather
 * than by trusting the file.
 */
function claimLock(lockPath: string): boolean {
  if (existsSync(lockPath)) {
    const held = Number(readFileSync(lockPath, 'utf8').trim())
    if (Number.isInteger(held) && held > 0) {
      try {
        process.kill(held, 0)
        console.error(
          `[dsld] another fetcher is already running as process ${held}. Refusing to add a second one.`,
        )
        return false
      } catch {
        console.log(`[dsld] clearing a stale lock left by process ${held}`)
      }
    }
  }
  writeFileSync(lockPath, String(process.pid))
  return true
}

async function main() {
  const limitFlag = process.argv.find((value) => value.startsWith('--limit='))
  const limit = limitFlag ? Number(limitFlag.split('=')[1]) : Infinity

  const cachePath =
    process.env.RNAWIKI_DSLD_CACHE ??
    '/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/dsld-market.json'
  mkdirSync(dirname(cachePath), { recursive: true })
  const lockPath = `${cachePath}.lock`
  if (!claimLock(lockPath)) process.exit(1)
  const releaseLock = () => {
    try {
      rmSync(lockPath, { force: true })
    } catch {
      // A lock that cannot be removed is cleared by the next run's staleness check.
    }
  }
  process.on('exit', releaseLock)
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      releaseLock()
      process.exit(1)
    })
  }

  const cache: Cache = existsSync(cachePath)
    ? (JSON.parse(readFileSync(cachePath, 'utf8')) as Cache)
    : {}

  const names = namesNeedingCoverage()
  // A failed lookup is retried on the next run; a recorded answer is never paid for twice.
  const outstanding = names.filter((name) => !cache[name] || cache[name]!.state === 'LOOKUP_FAILED')
  console.log(
    `[dsld] ${names.length} corpus name(s) · ${Object.keys(cache).length} cached · ${outstanding.length} outstanding`,
  )

  const queue = outstanding.slice(0, Math.min(outstanding.length, limit))
  let next = 0
  let done = 0
  let consecutiveRateLimited = 0
  let stopped = false
  let lastSave = Date.now()
  const worker = async (): Promise<void> => {
    for (;;) {
      if (stopped) return
      const index = next
      next += 1
      const name = queue[index]
      if (name === undefined) return
      const entry = await lookup(name)
      if (lastLookupWasRateLimited && entry.state === 'LOOKUP_FAILED') {
        consecutiveRateLimited += 1
        // Not cached: a name refused by the quota has not been answered, and recording it as a
        // failure would be recording something about the ingredient rather than about the service.
        if (consecutiveRateLimited >= RATE_LIMIT_GIVE_UP_AFTER) {
          stopped = true
          return
        }
        continue
      }
      consecutiveRateLimited = 0
      cache[name] = entry
      done += 1
      await sleep(PAUSE_BETWEEN_REQUESTS_MS)
      if (Date.now() - lastSave > 20_000) {
        writeFileSync(cachePath, JSON.stringify(cache))
        lastSave = Date.now()
      }
      if (done % 250 === 0) console.log(`[dsld] ${done}/${queue.length}`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))
  writeFileSync(cachePath, JSON.stringify(cache))
  if (stopped) {
    console.log(
      `[dsld] stopped after ${RATE_LIMIT_GIVE_UP_AFTER} consecutive rate-limited lookups; ${done} answered this run. Re-run later to continue from the cache.`,
    )
  }

  const states = new Map<string, number>()
  for (const entry of Object.values(cache)) {
    states.set(entry.state, (states.get(entry.state) ?? 0) + 1)
  }
  console.log(`[dsld] ${JSON.stringify(Object.fromEntries(states))}`)
  console.log(`[dsld] cache written to ${cachePath}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
