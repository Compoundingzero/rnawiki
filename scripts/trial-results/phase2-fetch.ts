import 'dotenv/config'
import { gzipSync } from 'node:zlib'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { readState, writeState, FAILED_PATH, RAW_DIR } from './state'

/**
 * PHASE 2 — fetch posted results in resumable batches.
 *
 * The cursor is written after every batch, so an interrupted session loses at most one batch. Only
 * one batch is ever held in memory: the payload is written to disk and dropped. Studies the registry
 * does not return are appended to the retry queue and never retried inline.
 *
 *   npx tsx scripts/trial-results/phase2-fetch.ts [--max-batches=N] [--tier=1|2]
 */

const API_ROOT = 'https://clinicaltrials.gov/api/v2'
const BATCH_SIZE = 250
const PACE_MS = 1_500
const RETRY_LIMIT = 6
const BACKOFF_BASE_MS = 2_000
const FIELDS =
  'NCTId|HasResults|IdentificationModule|StatusModule|DesignModule|ArmsInterventionsModule|ReferencesModule|ResultsSection'
const WORKLOG = join(process.cwd(), 'docs', 'worklogs', 'trial-results-ingestion.md')

interface QueueEntry {
  nctId: string
  tier: number
  records: number
}

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** One request, with exponential backoff on 429 and 5xx. Throws only when every attempt failed. */
async function fetchBatch(ids: string[]): Promise<{ studies: unknown[]; status: number }> {
  const url = `${API_ROOT}/studies?filter.ids=${ids.join(',')}&pageSize=1000&fields=${encodeURIComponent(FIELDS)}&format=json`
  let lastError = ''
  for (let attempt = 0; attempt < RETRY_LIMIT; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json', 'user-agent': 'RNAWiki trial results ingestion' },
        signal: AbortSignal.timeout(180_000),
      })
      if (response.status === 429 || response.status >= 500) {
        lastError = `HTTP ${response.status}`
        await sleep(BACKOFF_BASE_MS * 2 ** attempt)
        continue
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`)
      }
      const body = (await response.json()) as { studies?: unknown[] }
      return { studies: body.studies ?? [], status: response.status }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
      await sleep(BACKOFF_BASE_MS * 2 ** attempt)
    }
  }
  throw new Error(`batch failed after ${RETRY_LIMIT} attempts: ${lastError}`)
}

function hasPostedResults(study: unknown): boolean {
  const record = study as { hasResults?: boolean; resultsSection?: unknown }
  return record.hasResults === true && record.resultsSection != null
}

async function main(): Promise<void> {
  const state = readState()
  if (!state.cursor.queue_path || !existsSync(state.cursor.queue_path)) {
    throw new Error('no queue on disk — run phase1-queue.ts first')
  }
  if (!existsSync(RAW_DIR)) mkdirSync(RAW_DIR, { recursive: true })

  const queue = readFileSync(state.cursor.queue_path, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line) as QueueEntry)

  const tierFilter = flag('tier') ? Number(flag('tier')) : null
  const scoped = tierFilter ? queue.filter((entry) => entry.tier === tierFilter) : queue
  if (state.cursor.queue_index >= scoped.length) {
    console.log(`[phase2] already done — cursor ${state.cursor.queue_index}/${scoped.length}`)
    return
  }

  const maxBatches = flag('max-batches') ? Number(flag('max-batches')) : Number.POSITIVE_INFINITY
  const totalBatches = Math.ceil(scoped.length / BATCH_SIZE)
  let batchNumber = Math.floor(state.cursor.queue_index / BATCH_SIZE)
  let done = 0
  const startedAt = Date.now()

  console.log(
    `[phase2] queue ${scoped.length}${tierFilter ? ` (tier ${tierFilter})` : ''} · ${totalBatches} batches of ${BATCH_SIZE} · resuming at index ${state.cursor.queue_index}`,
  )

  while (state.cursor.queue_index < scoped.length && done < maxBatches) {
    const slice = scoped.slice(state.cursor.queue_index, state.cursor.queue_index + BATCH_SIZE)
    const ids = slice.map((entry) => entry.nctId)
    const tiers = [...new Set(slice.map((entry) => entry.tier))].sort()
    const started = Date.now()

    const { studies } = await fetchBatch(ids)

    const returned = new Set(
      studies.map(
        (study) =>
          ((study as { protocolSection?: { identificationModule?: { nctId?: string } } })
            .protocolSection?.identificationModule?.nctId ?? '') as string,
      ),
    )
    const missing = ids.filter((id) => !returned.has(id))
    for (const id of missing) {
      appendFileSync(
        FAILED_PATH,
        `${JSON.stringify({ nctId: id, batch: batchNumber, reason: 'not returned by filter.ids', at: new Date().toISOString() })}\n`,
      )
    }

    const withResults = studies.filter(hasPostedResults).length
    const file = join(RAW_DIR, `batch-${String(batchNumber).padStart(5, '0')}.json.gz`)
    writeFileSync(
      file,
      gzipSync(
        JSON.stringify({
          batch: batchNumber,
          tiers,
          requestedAt: new Date().toISOString(),
          requested: ids.length,
          returned: studies.length,
          studies,
        }),
      ),
    )

    state.cursor.queue_index += slice.length
    state.last_completed_batch = batchNumber
    state.counts.fetched += studies.length
    state.counts.with_results += withResults
    state.counts.failed += missing.length
    state.phase = tierFilter ? `2-fetch-tier${tierFilter}` : '2-fetch'
    writeState(state)

    const elapsed = ((Date.now() - started) / 1000).toFixed(1)
    appendFileSync(
      WORKLOG,
      `| ${String(batchNumber).padStart(5, '0')} | ${tiers.join('+')} | ${ids.length} | ${studies.length} | ${withResults} | ${missing.length} | ${elapsed}s |\n`,
    )
    console.log(
      `[phase2] batch ${batchNumber}/${totalBatches - 1} · ${studies.length}/${ids.length} returned · ${withResults} with results · ${missing.length} missing · ${elapsed}s`,
    )

    batchNumber += 1
    done += 1
    if (state.cursor.queue_index < scoped.length && done < maxBatches) await sleep(PACE_MS)
  }

  const mins = ((Date.now() - startedAt) / 60_000).toFixed(1)
  console.log(
    `[phase2] stopped at index ${state.cursor.queue_index}/${scoped.length} after ${done} batches (${mins} min) · fetched ${state.counts.fetched} · with results ${state.counts.with_results} · missing ${state.counts.failed}`,
  )
}

main().catch((error: unknown) => {
  console.error(`[phase2] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
