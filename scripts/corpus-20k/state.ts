/**
 * Resumable state for the corpus-20k rebuild. Same guarantees as scripts/design-study/state.ts:
 * atomic write under a cross-process lock, rewritten after every batch. "resume corpus 20k" reads
 * this file and continues at `next` with zero refetching.
 */
import { promises as fs } from 'node:fs'
import { openSync, fsyncSync, closeSync } from 'node:fs'
import path from 'node:path'

export const DATA_DIR = path.resolve(process.cwd(), 'data', 'corpus-20k')
export const STATE_PATH = path.join(DATA_DIR, 'state.json')
export const RAW_DIR = path.join(DATA_DIR, 'raw')
const LOCK_PATH = `${STATE_PATH}.lock`

export interface BatchRecord {
  phase: string
  step: string
  batch: number
  file: string
  sha256?: string
  records: number
  at: string
  note?: string
}

export interface Corpus20kState {
  schema_version: 1
  phase: string
  /** Exact next step and command; the RESUME block mirrors it. */
  next: { step: string; command: string; note?: string }
  completed: string[]
  cursor: Record<string, unknown>
  counts: Record<string, number>
  batches: BatchRecord[]
  legalGate: Record<
    string,
    {
      checkedAt: string
      robots: string
      terms: string
      licence: string
      decision: string
      reason: string
    }
  >
  decisions: Array<{ at: string; by?: string; what: string; why?: string }>
  gates: Record<string, { at: string; result: string; figures: Record<string, unknown> }>
  awaiting: string | null
  updated_at: string | null
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function migrate(raw: Record<string, unknown>): Corpus20kState {
  return {
    schema_version: 1,
    phase: (raw.phase as string) ?? '0-not-started',
    next: (raw.next as Corpus20kState['next']) ?? {
      step: 'phase 0a/0b source survey',
      command: 'see docs/worklogs/corpus-20k.md RESUME',
    },
    completed: (raw.completed as string[]) ?? [],
    cursor: (raw.cursor as Record<string, unknown>) ?? {},
    counts: (raw.counts as Record<string, number>) ?? {},
    batches: (raw.batches as BatchRecord[]) ?? [],
    legalGate: (raw.legalGate as Corpus20kState['legalGate']) ?? {},
    decisions: (raw.decisions as Corpus20kState['decisions']) ?? [],
    gates: (raw.gates as Corpus20kState['gates']) ?? {},
    awaiting: (raw.awaiting as string | null) ?? null,
    updated_at: (raw.updated_at as string | null) ?? null,
  }
}

export async function loadState(): Promise<Corpus20kState> {
  let raw: Record<string, unknown> = {}
  try {
    raw = JSON.parse(await fs.readFile(STATE_PATH, 'utf8')) as Record<string, unknown>
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  return migrate(raw)
}

export async function saveState(state: Corpus20kState): Promise<void> {
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
  fn: (state: Corpus20kState) => void | Promise<void>,
): Promise<Corpus20kState> {
  return withStateLock(async () => {
    const state = await loadState()
    await fn(state)
    await saveState(state)
    return state
  })
}

export function stepDone(state: Corpus20kState, step: string): boolean {
  return state.completed.includes(step)
}

export async function recordBatch(
  record: BatchRecord,
  cursor?: Record<string, unknown>,
): Promise<void> {
  await mutate((state) => {
    state.batches = state.batches.filter(
      (b) => !(b.phase === record.phase && b.step === record.step && b.batch === record.batch),
    )
    state.batches.push(record)
    if (cursor) state.cursor = { ...state.cursor, ...cursor }
    state.counts[`${record.step}.batches`] = state.batches.filter(
      (b) => b.step === record.step,
    ).length
    state.counts[`${record.step}.records`] = state.batches
      .filter((b) => b.step === record.step)
      .reduce((n, b) => n + b.records, 0)
  })
}

export async function markCompleted(step: string, next?: Corpus20kState['next']): Promise<void> {
  await mutate((state) => {
    if (!state.completed.includes(step)) state.completed.push(step)
    if (next) state.next = next
  })
}

export async function setNext(next: Corpus20kState['next'], phase?: string): Promise<void> {
  await mutate((state) => {
    state.next = next
    if (phase) state.phase = phase
  })
}

export async function addDecision(what: string, why?: string, by?: string): Promise<void> {
  await mutate((state) => {
    state.decisions.push({ at: today(), ...(by ? { by } : {}), what, ...(why ? { why } : {}) })
  })
}

export async function recordGate(
  name: string,
  result: string,
  figures: Record<string, unknown>,
): Promise<void> {
  await mutate((state) => {
    state.gates[name] = { at: new Date().toISOString(), result, figures }
  })
}
