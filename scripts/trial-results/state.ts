import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The machine cursor for the trial-results ingestion.
 *
 * A session running this work is expected to be cut off mid-run. Every phase writes its progress
 * here after each batch and reads it back on start, so a cut costs at most one batch. The file is
 * replaced atomically (write temp, rename) so an interrupted write cannot leave an unreadable
 * cursor behind.
 */

export const STATE_DIR = join(process.cwd(), 'data', 'trial-results')
export const STATE_PATH = join(STATE_DIR, 'state.json')
export const RAW_DIR = join(STATE_DIR, 'raw')
export const FAILED_PATH = join(STATE_DIR, 'failed.ndjson')
export const SCHEMA_VERSION = 1

export interface TrialResultsState {
  schema_version: number
  phase: string
  last_completed_batch: number | null
  cursor: {
    queue_index: number
    queue_path: string | null
    queue_total: number | null
  }
  counts: {
    fetched: number
    with_results: number
    qualified: number
    failed: number
    skipped: number
  }
  api?: Record<string, unknown>
  phase1?: Record<string, unknown>
  phase3?: Record<string, unknown>
  phase4?: Record<string, unknown>
  updated_at?: string
}

const EMPTY: TrialResultsState = {
  schema_version: SCHEMA_VERSION,
  phase: 'not-started',
  last_completed_batch: null,
  cursor: { queue_index: 0, queue_path: null, queue_total: null },
  counts: { fetched: 0, with_results: 0, qualified: 0, failed: 0, skipped: 0 },
}

export function readState(): TrialResultsState {
  if (!existsSync(STATE_PATH)) return structuredClone(EMPTY)
  const parsed = JSON.parse(readFileSync(STATE_PATH, 'utf8')) as TrialResultsState
  if (parsed.schema_version !== SCHEMA_VERSION) {
    throw new Error(
      `state.json is schema ${parsed.schema_version}, this code expects ${SCHEMA_VERSION}`,
    )
  }
  return parsed
}

export function writeState(next: TrialResultsState): void {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true })
  const stamped = { ...next, schema_version: SCHEMA_VERSION, updated_at: new Date().toISOString() }
  const temp = `${STATE_PATH}.tmp`
  writeFileSync(temp, `${JSON.stringify(stamped, null, 2)}\n`)
  renameSync(temp, STATE_PATH)
}
