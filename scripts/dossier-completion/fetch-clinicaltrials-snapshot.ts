import 'dotenv/config'
import { createHash } from 'node:crypto'
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'

/**
 * Takes one dated, hashed snapshot of the ClinicalTrials.gov registry through API v2.
 *
 * WHY A SNAPSHOT RATHER THAN ONE SEARCH PER MEDICINE. The dossier-completion resolver must record,
 * for every canonical entity, an auditable registry search whose result a reader can reproduce.
 * Ten thousand live name searches would each answer against a different registry state and could
 * not be re-run byte for byte. One paged sweep of the whole registry, stored with the API's own
 * `dataTimestamp` and a SHA-256 of the file, gives every entity the same fixed search space. The
 * matcher then reads that file offline, deterministically, as many times as needed.
 *
 * The sweep stores registry FACTS only: identifier, title, status, phase, results-posted flag,
 * intervention names, dates, sponsor and enrolment. It stores no outcome, no result value and no
 * interpretation. Registration is never a result.
 *
 * Resumable: the page token is checkpointed after every page. Re-running continues the same
 * snapshot directory when the registry data timestamp is unchanged and starts a new one otherwise.
 *
 * Usage:
 *   npx tsx scripts/dossier-completion/fetch-clinicaltrials-snapshot.ts [--out-dir=<dir>] [--max-pages=N]
 */

const API_ROOT = 'https://clinicaltrials.gov/api/v2'
const PAGE_SIZE = 1000
const POLITENESS_DELAY_MS = 250
const RETRY_LIMIT = 6
const FIELDS = [
  'NCTId',
  'BriefTitle',
  'OverallStatus',
  'Phase',
  'HasResults',
  'InterventionName',
  'InterventionType',
  'InterventionOtherName',
  'StartDate',
  'PrimaryCompletionDate',
  'CompletionDate',
  'StudyType',
  'EnrollmentCount',
  'EnrollmentType',
  'LeadSponsorName',
  'LeadSponsorClass',
  'ResultsFirstPostDate',
  'LastUpdatePostDate',
  'WhyStopped',
  'Condition',
  // Structured eligibility fields: exact registry facts about who a study enrolled.
  'Sex',
  'MinimumAge',
  'MaximumAge',
  'StdAge',
  'HealthyVolunteers',
  // Outcome measure titles are what the study said it would measure, never a result.
  'PrimaryOutcomeMeasure',
  'PrimaryOutcomeTimeFrame',
  'DesignAllocation',
  'DesignMasking',
  'DesignPrimaryPurpose',
] as const

interface Checkpoint {
  apiVersion: string
  dataTimestamp: string
  fields: readonly string[]
  pageSize: number
  nextPageToken: string | null
  pagesFetched: number
  studiesWritten: number
  totalCount: number | null
  startedAt: string
  completedAt: string | null
}

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getJson(url: string): Promise<unknown> {
  let lastError: unknown
  for (let attempt = 0; attempt < RETRY_LIMIT; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json', 'user-agent': 'RNAWiki corpus completion' },
        signal: AbortSignal.timeout(120_000),
      })
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}`)
        await sleep(2_000 * 2 ** attempt)
        continue
      }
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
      return await response.json()
    } catch (error) {
      lastError = error
      await sleep(2_000 * 2 ** attempt)
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

async function main(): Promise<void> {
  const baseDir =
    flag('out-dir') ??
    join(process.env.RNAWIKI_INGEST_DATA ?? join(process.cwd(), 'tmp'), 'clinicaltrials')
  const maxPages = Number(flag('max-pages') ?? Number.POSITIVE_INFINITY)

  const version = (await getJson(`${API_ROOT}/version`)) as {
    apiVersion?: string
    dataTimestamp?: string
  }
  if (!version.apiVersion || !version.dataTimestamp) {
    throw new Error('ClinicalTrials.gov did not report an API version and data timestamp')
  }
  const snapshotId = version.dataTimestamp.replace(/[^0-9A-Za-z]/gu, '')
  const outDir = join(baseDir, snapshotId)
  mkdirSync(outDir, { recursive: true })
  const checkpointPath = join(outDir, 'checkpoint.json')
  const studiesPath = join(outDir, 'studies.ndjson')
  const manifestPath = join(outDir, 'manifest.json')

  let checkpoint: Checkpoint
  if (existsSync(checkpointPath)) {
    checkpoint = JSON.parse(readFileSync(checkpointPath, 'utf8')) as Checkpoint
    if (JSON.stringify(checkpoint.fields) !== JSON.stringify(FIELDS)) {
      throw new Error(
        `${checkpointPath} was started with a different field set; remove ${outDir} to refetch`,
      )
    }
    if (checkpoint.completedAt) {
      console.log(
        `[ct-snapshot] ${snapshotId} already complete: ${checkpoint.studiesWritten} studies`,
      )
      return
    }
    console.log(
      `[ct-snapshot] resuming ${snapshotId} at page ${checkpoint.pagesFetched + 1} (${checkpoint.studiesWritten} studies so far)`,
    )
  } else {
    checkpoint = {
      apiVersion: version.apiVersion,
      dataTimestamp: version.dataTimestamp,
      fields: FIELDS,
      pageSize: PAGE_SIZE,
      nextPageToken: null,
      pagesFetched: 0,
      studiesWritten: 0,
      totalCount: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    }
    writeFileSync(studiesPath, '')
    writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2))
    console.log(`[ct-snapshot] starting ${snapshotId} (API ${version.apiVersion})`)
  }

  let pagesThisRun = 0
  while (pagesThisRun < maxPages) {
    const url = new URL(`${API_ROOT}/studies`)
    url.searchParams.set('fields', FIELDS.join(','))
    url.searchParams.set('pageSize', String(PAGE_SIZE))
    url.searchParams.set('countTotal', 'true')
    if (checkpoint.nextPageToken) url.searchParams.set('pageToken', checkpoint.nextPageToken)

    const page = (await getJson(url.toString())) as {
      totalCount?: number
      studies?: unknown[]
      nextPageToken?: string
    }
    const studies = Array.isArray(page.studies) ? page.studies : []
    if (studies.length === 0 && page.nextPageToken) {
      throw new Error('ClinicalTrials.gov returned an empty page with a continuation token')
    }
    const lines = studies.map((study) => JSON.stringify(study)).join('\n')
    if (lines.length > 0) appendFileSync(studiesPath, `${lines}\n`)

    checkpoint.pagesFetched += 1
    checkpoint.studiesWritten += studies.length
    checkpoint.totalCount =
      typeof page.totalCount === 'number' ? page.totalCount : checkpoint.totalCount
    checkpoint.nextPageToken = page.nextPageToken ?? null
    pagesThisRun += 1

    if (!checkpoint.nextPageToken) {
      checkpoint.completedAt = new Date().toISOString()
      // Write the checkpoint before hashing so a crash between the two leaves a resumable state
      // that simply re-runs the final bookkeeping.
      writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2))
      break
    }
    const tmp = `${checkpointPath}.tmp`
    writeFileSync(tmp, JSON.stringify(checkpoint, null, 2))
    renameSync(tmp, checkpointPath)
    if (checkpoint.pagesFetched % 25 === 0) {
      console.log(
        `[ct-snapshot] page ${checkpoint.pagesFetched}: ${checkpoint.studiesWritten}/${checkpoint.totalCount ?? '?'} studies`,
      )
    }
    await sleep(POLITENESS_DELAY_MS)
  }

  if (!checkpoint.completedAt) {
    console.log(
      `[ct-snapshot] paused after ${pagesThisRun} page(s); ${checkpoint.studiesWritten}/${checkpoint.totalCount ?? '?'} studies. Re-run to resume.`,
    )
    return
  }

  const endVersion = (await getJson(`${API_ROOT}/version`)) as { dataTimestamp?: string }
  const manifest = {
    schema: 'rnawiki-clinicaltrials-snapshot/v1',
    apiVersion: checkpoint.apiVersion,
    dataTimestamp: checkpoint.dataTimestamp,
    dataTimestampAtCompletion: endVersion.dataTimestamp ?? null,
    consistent: endVersion.dataTimestamp === checkpoint.dataTimestamp,
    fields: checkpoint.fields,
    pageSize: checkpoint.pageSize,
    pagesFetched: checkpoint.pagesFetched,
    studies: checkpoint.studiesWritten,
    totalCountReported: checkpoint.totalCount,
    startedAt: checkpoint.startedAt,
    completedAt: checkpoint.completedAt,
    studiesFile: 'studies.ndjson',
    studiesSha256: sha256File(studiesPath),
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(
    `[ct-snapshot] complete: ${manifest.studies} studies, sha256 ${manifest.studiesSha256.slice(0, 16)}…, consistent=${manifest.consistent}`,
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
