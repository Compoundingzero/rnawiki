/**
 * Atomic, lock-protected state for the longevity data model (Track B). One JSON file rewritten in
 * full after every batch, so a session cut off mid-run resumes at the same cursor with no refetch.
 *
 *   loadState()                      read data/longevity/state.json
 *   saveState(state)                 temp file + fsync + rename
 *   recordBatch(phase, batch)        append a batch record (file, sha256, record count) and advance the cursor
 *   setPhase(phase, awaiting?)       move the phase pointer
 *   addDecision(what, by?)           append a dated decision
 *   phaseDone(state, phase)          true when a phase is recorded complete — callers print "already done" and exit
 */
import { promises as fs } from 'node:fs'
import { openSync, fsyncSync, closeSync } from 'node:fs'
import path from 'node:path'

export const DATA_DIR = path.resolve(process.cwd(), 'data', 'longevity')
export const STATE_PATH = path.join(DATA_DIR, 'state.json')
export const RAW_DIR = path.join(DATA_DIR, 'raw')
const LOCK_PATH = `${STATE_PATH}.lock`

export type LongevityPhase = 'not-started' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'delivery-stopped'

export interface BatchRecord {
  phase: string
  batch: number
  file: string
  sha256: string
  records: number
  fetchedAt: string
  source?: string
  note?: string
}

export interface LongevityState {
  schema_version: 2
  phase: LongevityPhase | string
  corpus: string
  /** Per-phase cursor: whatever the phase needs to resume (compound index, source index, page token). */
  cursor: Record<string, unknown>
  /** Per-phase counts (compounds done, attempts logged, records fetched). */
  counts: Record<string, number>
  /** Phases recorded complete; a completed phase reports "already done" and changes nothing. */
  completed: string[]
  batches: BatchRecord[]
  legalGate: Record<
    string,
    { checkedAt: string; robots: string; terms: string; decision: string; reason: string }
  >
  decisions: Array<{ at: string; by?: string; what: string }>
  awaiting: string | null
  updated_at: string | null
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function migrate(raw: Record<string, unknown>): LongevityState {
  return {
    schema_version: 2,
    phase: (raw.phase as string) ?? 'not-started',
    corpus: (raw.corpus as string) ?? 'BROAD (803) — decided by Felix 2026-09-03, do not re-derive',
    cursor: (raw.cursor as Record<string, unknown>) ?? {},
    counts: (raw.counts as Record<string, number>) ?? {},
    completed: (raw.completed as string[]) ?? [],
    batches: (raw.batches as BatchRecord[]) ?? [],
    legalGate: (raw.legalGate as LongevityState['legalGate']) ?? {},
    decisions: (raw.decisions as LongevityState['decisions']) ?? [],
    awaiting: (raw.awaiting as string | null) ?? null,
    updated_at: (raw.updated_at as string | null) ?? null,
  }
}

export async function loadState(): Promise<LongevityState> {
  let raw: Record<string, unknown> = {}
  try {
    raw = JSON.parse(await fs.readFile(STATE_PATH, 'utf8')) as Record<string, unknown>
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  return migrate(raw)
}

export async function saveState(state: LongevityState): Promise<void> {
  state.updated_at = new Date().toISOString()
  await fs.mkdir(RAW_DIR, { recursive: true })
  const tmp = `${STATE_PATH}.${process.pid}.tmp`
  await fs.writeFile(tmp, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  const fd = openSync(tmp, 'r')
  try {
    fsyncSync(fd)
  } finally {
    closeSync(fd)
  }
  await fs.rename(tmp, STATE_PATH)
}

export async function withStateLock<T>(fn: () => Promise<T>): Promise<T> {
  const started = Date.now()
  for (;;) {
    try {
      const handle = await fs.open(LOCK_PATH, 'wx')
      await handle.writeFile(String(process.pid))
      await handle.close()
      break
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
      try {
        const stat = await fs.stat(LOCK_PATH)
        if (Date.now() - stat.mtimeMs > 60_000) {
          await fs.rm(LOCK_PATH, { force: true })
          continue
        }
      } catch {
        continue
      }
      if (Date.now() - started > 120_000)
        throw new Error(`Could not acquire ${LOCK_PATH} within 120 s`)
      await new Promise((resolve) => setTimeout(resolve, 100 + Math.floor(Math.random() * 150)))
    }
  }
  try {
    return await fn()
  } finally {
    await fs.rm(LOCK_PATH, { force: true })
  }
}

export async function mutate(
  fn: (state: LongevityState) => void | Promise<void>,
): Promise<LongevityState> {
  return withStateLock(async () => {
    const state = await loadState()
    await fn(state)
    await saveState(state)
    return state
  })
}

export function phaseDone(state: LongevityState, phase: string): boolean {
  return state.completed.includes(phase)
}

export async function recordBatch(
  record: BatchRecord,
  cursor?: Record<string, unknown>,
): Promise<void> {
  await mutate((state) => {
    state.batches = state.batches.filter(
      (b) => !(b.phase === record.phase && b.batch === record.batch),
    )
    state.batches.push(record)
    state.batches.sort((a, b) =>
      a.phase === b.phase ? a.batch - b.batch : a.phase.localeCompare(b.phase),
    )
    if (cursor) state.cursor = { ...state.cursor, ...cursor }
    const key = `${record.phase}.batches`
    state.counts[key] = state.batches.filter((b) => b.phase === record.phase).length
  })
}

export async function setPhase(phase: string, awaiting: string | null = null): Promise<void> {
  await mutate((state) => {
    state.phase = phase
    state.awaiting = awaiting
  })
}

export async function markCompleted(phase: string): Promise<void> {
  await mutate((state) => {
    if (!state.completed.includes(phase)) state.completed.push(phase)
  })
}

export async function addDecision(what: string, by?: string): Promise<void> {
  await mutate((state) => {
    state.decisions.push({ at: today(), ...(by ? { by } : {}), what })
  })
}
