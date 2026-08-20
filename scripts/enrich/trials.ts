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
 * the registry, and a machine has no business filling them. So `endpointMet` is false and the
 * p-value field says the result is not recorded — the dossier shows a trial that exists and states
 * plainly that nobody has entered its outcome. That is the honest shape of the fact.
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
let cache: Record<string, ClinicalTrialRecord[] | null> | null = null

function loadCache(): Record<string, ClinicalTrialRecord[] | null> {
  if (cache) return cache
  cache = existsSync(cachePath)
    ? (JSON.parse(readFileSync(cachePath, 'utf8')) as Record<string, ClinicalTrialRecord[] | null>)
    : {}
  return cache
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
  if (key in store) return store[key] ?? []

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
      endpointMet: false,
      statisticalPValue: 'Result not recorded on this page',
      independentReplicationStatus: 'Unreplicated',
    })
  }

  store[key] = records.length > 0 ? records : null
  dirty += 1
  if (dirty >= 40) flushTrialCache()
  return records
}

export function trialCacheStats(): { total: number; withTrials: number } {
  const store = loadCache()
  const values = Object.values(store)
  return { total: values.length, withTrials: values.filter(Boolean).length }
}
