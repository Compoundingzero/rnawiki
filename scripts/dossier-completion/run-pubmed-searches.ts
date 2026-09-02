import 'dotenv/config'
import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Records one auditable PubMed search per canonical entity.
 *
 * The search is a count of PubMed records whose title or abstract contains the recorded name as an
 * exact phrase and whose publication type is "clinical trial". The count is a fact about PubMed on
 * the day it was asked, and it is stored with the exact query so anyone can repeat it. It is not an
 * attribution of any article to the entity — the hits are matched by phrase, not verified — and it
 * is never a finding. A count of zero is recorded as "no qualifying PubMed record for this phrase on
 * this date", never as "no study exists".
 *
 * NCBI's published E-utilities limit without an API key is three requests per second; this runs
 * below that and backs off on 429. Every result and every failed attempt is appended to a
 * checkpoint file, so the run resumes where it stopped and a network failure is preserved as a
 * failed attempt rather than turned into a zero.
 *
 * Usage:
 *   npx tsx scripts/dossier-completion/run-pubmed-searches.ts [--inventory=<ndjson>] [--out=<ndjson>] [--limit=N]
 */

const ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
const MIN_INTERVAL_MS = 400
const RETRY_LIMIT = 5
const TOOL = 'rnawiki-corpus-completion'

export interface PubMedSearchRecord {
  schema: 'rnawiki-pubmed-search-record/v1'
  drugId: string
  canonicalSlug: string
  name: string
  query: string
  filter: string
  requestedAt: string
  status: 'SUCCEEDED' | 'UNREACHABLE' | 'FAILED'
  resultCount: number | null
  /** SHA-256 of the exact response body, so a stored count can be checked against it. */
  responseDigest: string | null
  error: string | null
  attempts: number
}

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** PubMed phrase syntax: double quotes, no field tags inside the phrase. */
export function pubmedQuery(name: string): string {
  const phrase = name.replace(/["\\]/gu, ' ').replace(/\s+/gu, ' ').trim()
  return `"${phrase}"[tiab] AND clinical trial[pt]`
}

async function main(): Promise<void> {
  const inventoryPath = flag('inventory') ?? join(process.cwd(), 'data', 'inventory', 'inventory-resolution.ndjson')
  const dataDir = process.env.RNAWIKI_INGEST_DATA ?? join(process.cwd(), 'tmp')
  const outPath = flag('out') ?? join(dataDir, 'pubmed', 'clinical-trial-searches.ndjson')
  const limit = Number(flag('limit') ?? Number.POSITIVE_INFINITY)

  const entities = readFileSync(inventoryPath, 'utf8')
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as { originalRecordId: string; originalSlug: string; originalName: string; resolutionStatus: string })
    .filter((row) => row.resolutionStatus === 'CANONICAL_ENTITY')
    .sort((left, right) => left.originalSlug.localeCompare(right.originalSlug))

  mkdirSync(join(outPath, '..'), { recursive: true })
  if (!existsSync(outPath)) writeFileSync(outPath, '')
  const done = new Map<string, PubMedSearchRecord>()
  for (const line of readFileSync(outPath, 'utf8').split('\n')) {
    if (!line.trim()) continue
    const record = JSON.parse(line) as PubMedSearchRecord
    // A later successful record supersedes an earlier failed attempt for the same entity.
    const existing = done.get(record.drugId)
    if (!existing || record.status === 'SUCCEEDED' || existing.status !== 'SUCCEEDED') {
      done.set(record.drugId, record)
    }
  }
  const pending = entities.filter((entity) => done.get(entity.originalRecordId)?.status !== 'SUCCEEDED')
  console.log(
    `[pubmed] ${entities.length} canonical entities · ${entities.length - pending.length} already searched · ${pending.length} pending`,
  )

  let processed = 0
  let lastRequestAt = 0
  for (const entity of pending) {
    if (processed >= limit) break
    const query = pubmedQuery(entity.originalName)
    const url = new URL(ESEARCH)
    url.searchParams.set('db', 'pubmed')
    url.searchParams.set('term', query)
    url.searchParams.set('rettype', 'count')
    url.searchParams.set('retmode', 'json')
    url.searchParams.set('tool', TOOL)

    let record: PubMedSearchRecord | null = null
    let attempts = 0
    let lastError = ''
    let unreachable = false
    while (attempts < RETRY_LIMIT && !record) {
      attempts += 1
      const wait = MIN_INTERVAL_MS - (Date.now() - lastRequestAt)
      if (wait > 0) await sleep(wait)
      lastRequestAt = Date.now()
      const requestedAt = new Date().toISOString()
      try {
        const response = await fetch(url, {
          headers: { accept: 'application/json', 'user-agent': TOOL },
          signal: AbortSignal.timeout(30_000),
        })
        const body = await response.text()
        if (response.status === 429 || response.status >= 500) {
          lastError = `HTTP ${response.status}`
          unreachable = true
          await sleep(1_500 * 2 ** attempts)
          continue
        }
        if (!response.ok) {
          lastError = `HTTP ${response.status}`
          unreachable = false
          break
        }
        const parsed = JSON.parse(body) as { esearchresult?: { count?: string; ERROR?: string } }
        const count = Number(parsed.esearchresult?.count)
        if (parsed.esearchresult?.ERROR || !Number.isSafeInteger(count) || count < 0) {
          lastError = parsed.esearchresult?.ERROR ?? 'response carried no integer count'
          unreachable = false
          break
        }
        record = {
          schema: 'rnawiki-pubmed-search-record/v1',
          drugId: entity.originalRecordId,
          canonicalSlug: entity.originalSlug,
          name: entity.originalName,
          query,
          filter: 'clinical trial[pt]',
          requestedAt,
          status: 'SUCCEEDED',
          resultCount: count,
          responseDigest: createHash('sha256').update(body).digest('hex'),
          error: null,
          attempts,
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
        unreachable = true
        await sleep(1_500 * 2 ** attempts)
      }
    }
    if (!record) {
      record = {
        schema: 'rnawiki-pubmed-search-record/v1',
        drugId: entity.originalRecordId,
        canonicalSlug: entity.originalSlug,
        name: entity.originalName,
        query,
        filter: 'clinical trial[pt]',
        requestedAt: new Date().toISOString(),
        status: unreachable ? 'UNREACHABLE' : 'FAILED',
        resultCount: null,
        responseDigest: null,
        error: lastError || 'unknown failure',
        attempts,
      }
    }
    appendFileSync(outPath, `${JSON.stringify(record)}\n`)
    processed += 1
    if (processed % 250 === 0) {
      console.log(`[pubmed] ${processed}/${pending.length} this run (${entity.originalSlug}: ${record.status} ${record.resultCount ?? ''})`)
    }
  }
  console.log(`[pubmed] finished this run: ${processed} searched; ${pending.length - processed} still pending`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
