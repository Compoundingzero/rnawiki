import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ClinicalTrialRecord } from '@/lib/types'
import { DATA_DIR } from '../ingest/paths'

/**
 * Real trials, from ClinicalTrials.gov.
 *
 * Every record here is a registration number a reader can open. What the API gives is what the
 * sponsor registered: the identifier, the phase, how many people were enrolled, whether it
 * completed, and what the primary outcome measure was.
 *
 * What it does NOT give, and what this module therefore leaves alone, is whether the trial WORKED.
 * `endpointMet` and `statisticalPValue` are results, they live in the published paper rather than
 * the registry, and a machine has no business filling them. `endpointStatus: not_reported` keeps
 * that absence distinct from a negative result; `endpointMet` remains false only for compatibility
 * with older consumers while they migrate to the explicit state.
 */

const API = 'https://clinicaltrials.gov/api/v2/studies'
const FIELDS = [
  'protocolSection.identificationModule.nctId',
  'protocolSection.identificationModule.briefTitle',
  'protocolSection.designModule.phases',
  'protocolSection.designModule.enrollmentInfo',
  'protocolSection.statusModule.overallStatus',
  'protocolSection.outcomesModule.primaryOutcomes',
].join(',')

interface Study {
  protocolSection?: {
    identificationModule?: { nctId?: string; briefTitle?: string }
    designModule?: { phases?: string[]; enrollmentInfo?: { count?: number; type?: string } }
    statusModule?: { overallStatus?: string }
    outcomesModule?: { primaryOutcomes?: Array<{ measure?: string }> }
  }
}

const cachePath = join(DATA_DIR, 'trials-index.json')
const TRIAL_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface TrialCacheEntry {
  records: ClinicalTrialRecord[] | null
  fetchedAt: string
}

type LegacyTrialCacheValue = ClinicalTrialRecord[] | null
type TrialCacheValue = TrialCacheEntry | LegacyTrialCacheValue

let cache: Record<string, TrialCacheValue> | null = null

function loadCache(): Record<string, TrialCacheValue> {
  if (cache) return cache
  cache = existsSync(cachePath)
    ? (JSON.parse(readFileSync(cachePath, 'utf8')) as Record<string, TrialCacheValue>)
    : {}
  return cache
}

function cacheEntry(value: TrialCacheValue | undefined): TrialCacheEntry | null {
  if (!value || Array.isArray(value)) return null
  if (typeof value !== 'object' || !('fetchedAt' in value) || !('records' in value)) return null
  const parsed = Date.parse(value.fetchedAt)
  if (!Number.isFinite(parsed) || Date.now() - parsed >= TRIAL_CACHE_TTL_MS) return null
  return value
}

let dirty = 0

export function flushTrialCache(): void {
  if (!cache || dirty === 0) return
  const temp = `${cachePath}.tmp`
  writeFileSync(temp, JSON.stringify(cache))
  renameSync(temp, cachePath)
  dirty = 0
}

/** Phase strings come back as PHASE1/PHASE2/NA; render them the way a reader writes them. */
function formatPhase(phases: readonly string[] | undefined): string {
  if (!phases || phases.length === 0) return 'Not stated'
  const readable = phases
    .map((phase) =>
      phase
        .replace(/^PHASE/, 'Phase ')
        .replace(/^NA$/, 'Not applicable')
        .replace(/^EARLY_PHASE1$/, 'Early phase 1'),
    )
    .join('/')
  return readable
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Interventional studies only, most-enrolled first. An observational study is a different kind of
 * evidence and putting one in a list headed "trials" would misrepresent it; the largest trials are
 * the ones a reader has heard of and the ones that moved practice.
 */
export async function fetchTrials(drugName: string, limit = 6): Promise<ClinicalTrialRecord[]> {
  const store = loadCache()
  const key = drugName.toLowerCase()
  const fresh = cacheEntry(store[key])
  if (fresh) return fresh.records ?? []

  const url =
    `${API}?query.term=${encodeURIComponent(drugName)}` +
    `&filter.advanced=AREA%5BStudyType%5DINTERVENTIONAL` +
    `&sort=EnrollmentCount%3Adesc&pageSize=${limit}&fields=${FIELDS}`

  let studies: Study[] = []
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
      if (response.status === 429 || response.status >= 500) {
        await sleep(800 * 2 ** attempt)
        continue
      }
      if (!response.ok) break
      const body = (await response.json()) as { studies?: Study[] }
      studies = body.studies ?? []
      break
    } catch {
      await sleep(800 * 2 ** attempt)
    }
  }

  const records: ClinicalTrialRecord[] = []
  for (const study of studies) {
    const section = study.protocolSection
    const nctId = section?.identificationModule?.nctId
    const enrolled = section?.designModule?.enrollmentInfo?.count
    if (!nctId || !enrolled) continue

    const outcome = section.outcomesModule?.primaryOutcomes?.[0]?.measure
    records.push({
      trialId: nctId,
      phase: formatPhase(section.designModule?.phases),
      sampleSize: enrolled,
      primaryEndpoint: outcome ?? section.identificationModule?.briefTitle ?? 'Not stated',
      // Results are not in the registry. Saying "false" here means "not recorded", and the UI
      // renders it as such rather than as a failed trial.
      endpointStatus: 'not_reported',
      endpointMet: false,
      statisticalPValue: 'Result not recorded on this page',
      independentReplicationStatus: 'Unreplicated',
    })
  }

  store[key] = {
    records: records.length > 0 ? records : null,
    fetchedAt: new Date().toISOString(),
  }
  dirty += 1
  if (dirty >= 40) flushTrialCache()
  return records
}

/**
 * Fills the trial cache for many drugs at once, a few requests in flight at a time.
 *
 * Same reason as the literature warm: the enrichment loop is sequential because it writes rows, and
 * a registry lookup inside it is a round trip. Once the taxonomy and literature were prefetched the
 * trial calls became the whole cost of the run — the loop dropped to fifty records a minute, and
 * fifty a minute over four thousand records is eighty minutes of waiting on one socket at a time.
 *
 * Six concurrent, which is roughly what a person browsing ClinicalTrials.gov generates.
 */
export async function warmTrials(
  names: readonly string[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const CONCURRENCY = 6
  const store = loadCache()
  const pending = names.filter((name) => !cacheEntry(store[name.toLowerCase()]))

  let done = 0
  let next = 0

  async function worker(): Promise<void> {
    for (;;) {
      const index = next
      next += 1
      const name = pending[index]
      if (name === undefined) return
      await fetchTrials(name)
      done += 1
      if (done % 250 === 0) onProgress?.(done, pending.length)
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))
  flushTrialCache()
  onProgress?.(done, pending.length)
}

export function trialCacheStats(): { total: number; withTrials: number } {
  const store = loadCache()
  const values = Object.values(store)
  return {
    total: values.length,
    withTrials: values.filter((value) => {
      const entry = cacheEntry(value)
      if (entry) return Boolean(entry.records)
      return Array.isArray(value) && value.length > 0
    }).length,
  }
}
