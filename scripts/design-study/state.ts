/**
 * Atomic state for the design study. One JSON file, rewritten in full after every site so a session
 * cut off mid-run resumes exactly where it stopped.
 *
 *   loadState()            read data/design-study/state.json (migrates v1 → v2 in memory)
 *   saveState(state)       write to a temp file, fsync, rename — never a half-written file
 *   updateSite(key, patch) load, shallow-merge the site's record, bump updated_at, save
 *   setPhase(phase)        load, set the phase, save
 *   addDecision(what, by)  load, append a dated decision, save
 */
import { promises as fs } from 'node:fs'
import { openSync, fsyncSync, closeSync } from 'node:fs'
import path from 'node:path'
import { SITES, type Track } from './sites.js'

export const DATA_DIR = path.resolve(process.cwd(), 'data', 'design-study')
export const STATE_PATH = path.join(DATA_DIR, 'state.json')
export const CAPTURES_DIR = path.join(DATA_DIR, 'captures')
export const FINDINGS_DIR = path.join(DATA_DIR, 'findings')
export const LEGAL_DIR = path.join(DATA_DIR, 'legal')

export type LegalDecision = 'capture' | 'link-only' | 'blocked' | 'own-site'

export interface LegalGate {
  checkedAt: string
  robots: {
    url: string
    httpStatus: number | null
    savedTo: string | null
    /** Rules that apply to a generic user agent for the two study pages. */
    indexAllowed: boolean | null
    contentAllowed: boolean | null
    relevantLines: string[]
    note?: string
  }
  terms: {
    url: string | null
    httpStatus: number | null
    savedTo: string | null
    /** Verbatim sentences mentioning automated access, scraping, crawling, bots, screenshots, reproduction. */
    relevantExcerpts: string[]
    /** What the terms say about what this phase requires: a real browser rendering public pages and saving screenshots for private study. */
    summary: string
  }
  api: { exists: boolean | null; url: string | null; licence: string | null; note?: string }
  decision: LegalDecision
  reason: string
}

export interface CaptureRecord {
  file: string
  url: string
  viewport: { width: number; height: number }
  kind: 'full-page' | 'viewport' | 'tile'
  scrollY?: number
  scrollFraction?: number
  tileIndex?: number
  widthPx: number
  heightPx: number
  sha256: string
  capturedAt: string
  truncated?: boolean
  note?: string
}

export interface SiteState {
  track: Track
  status: 'pending' | 'done' | 'blocked'
  reason?: string
  note?: string
  urls?: { index: string; content: string; contentNote?: string }
  legalGate: LegalGate | null
  captured: boolean
  capturedAt?: string
  captureNote?: string
  captures?: CaptureRecord[]
  bannerActions?: string[]
  domEvidence?: Record<string, unknown>
  viewed: boolean
  viewedAt?: string
  findingsFile?: string
  verified?: boolean
  verifiedAt?: string
  measured?: boolean
  measuredAt?: string
}

export interface DesignStudyState {
  schema_version: 2
  phase: string
  sites: Record<string, SiteState>
  frozen: string
  decisions: Array<{ at: string; by?: string; what: string }>
  awaiting: string | null
  updated_at: string | null
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function migrate(raw: Record<string, unknown>): DesignStudyState {
  const sites: Record<string, SiteState> = {}
  const rawSites = (raw.sites ?? {}) as Record<string, Partial<SiteState> & { status?: string }>
  for (const site of SITES) {
    const prev = rawSites[site.key] ?? {}
    sites[site.key] = {
      track: site.track,
      status: (prev.status as SiteState['status']) ?? 'pending',
      ...(prev.reason ? { reason: prev.reason } : {}),
      ...(prev.note ? { note: prev.note } : {}),
      urls: prev.urls ?? { index: site.index, content: site.content },
      legalGate: prev.legalGate ?? null,
      captured: prev.captured ?? false,
      ...(prev.capturedAt ? { capturedAt: prev.capturedAt } : {}),
      ...(prev.captureNote ? { captureNote: prev.captureNote } : {}),
      ...(prev.captures ? { captures: prev.captures } : {}),
      ...(prev.bannerActions ? { bannerActions: prev.bannerActions } : {}),
      ...(prev.domEvidence ? { domEvidence: prev.domEvidence } : {}),
      viewed: prev.viewed ?? false,
      ...(prev.viewedAt ? { viewedAt: prev.viewedAt } : {}),
      ...(prev.findingsFile ? { findingsFile: prev.findingsFile } : {}),
      ...(prev.verified !== undefined ? { verified: prev.verified } : {}),
      ...(prev.verifiedAt ? { verifiedAt: prev.verifiedAt } : {}),
      ...(prev.measured !== undefined ? { measured: prev.measured } : {}),
      ...(prev.measuredAt ? { measuredAt: prev.measuredAt } : {}),
    }
  }
  // Keep any site recorded in state that is no longer in SITES, so nothing is silently dropped.
  for (const [key, prev] of Object.entries(rawSites)) {
    if (!sites[key])
      sites[key] = {
        ...(prev as SiteState),
        legalGate: prev.legalGate ?? null,
        captured: prev.captured ?? false,
        viewed: prev.viewed ?? false,
      }
  }
  return {
    schema_version: 2,
    phase: (raw.phase as string) ?? '3-A1-pending',
    sites,
    frozen:
      (raw.frozen as string) ??
      'home page search bar: position, prominence and behaviour unchanged; nothing sits above it or competes with it',
    decisions: (raw.decisions as DesignStudyState['decisions']) ?? [],
    awaiting: (raw.awaiting as string | null) ?? null,
    updated_at: (raw.updated_at as string | null) ?? null,
  }
}

export async function loadState(): Promise<DesignStudyState> {
  let raw: Record<string, unknown> = {}
  try {
    raw = JSON.parse(await fs.readFile(STATE_PATH, 'utf8')) as Record<string, unknown>
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  return migrate(raw)
}

export async function saveState(state: DesignStudyState): Promise<void> {
  state.updated_at = new Date().toISOString()
  await fs.mkdir(DATA_DIR, { recursive: true })
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

const LOCK_PATH = `${STATE_PATH}.lock`

/**
 * Serialize read-modify-write cycles across processes (the legal gate, the capture tool and the
 * measurer may run at the same time). A stale lock older than 60 s is broken, because a process
 * that died mid-write must not stop the next session from resuming.
 */
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

export async function updateSite(
  key: string,
  patch: Partial<SiteState>,
): Promise<DesignStudyState> {
  return withStateLock(async () => {
    const state = await loadState()
    const current = state.sites[key]
    if (!current) throw new Error(`Site ${key} is not in state.json; add it to sites.ts first`)
    state.sites[key] = { ...current, ...patch }
    await saveState(state)
    return state
  })
}

export async function setPhase(phase: string, awaiting: string | null = null): Promise<void> {
  await withStateLock(async () => {
    const state = await loadState()
    state.phase = phase
    state.awaiting = awaiting
    await saveState(state)
  })
}

export async function addDecision(what: string, by?: string): Promise<void> {
  await withStateLock(async () => {
    const state = await loadState()
    state.decisions.push({ at: today(), ...(by ? { by } : {}), what })
    await saveState(state)
  })
}

/** One-line status per site, for `--status` flags and for the RESUME block. */
export function summarize(state: DesignStudyState): string[] {
  return Object.entries(state.sites).map(([key, s]) => {
    const gate = s.legalGate ? s.legalGate.decision : 'ungated'
    return `${key} [${s.track}] gate=${gate} captured=${s.captured} viewed=${s.viewed}${s.verified ? ' verified' : ''}${s.status === 'blocked' ? ' BLOCKED' : ''}`
  })
}
