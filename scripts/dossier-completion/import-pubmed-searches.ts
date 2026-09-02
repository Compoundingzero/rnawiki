import 'dotenv/config'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { sourceSearchRecords } from '@/db/schema'

import type { PubMedSearchRecord } from './run-pubmed-searches'

/**
 * Imports the checkpointed PubMed search records into the database. The latest successful record
 * per entity wins; a failed attempt is imported only when no success exists for that entity, so
 * the dossier can say "source could not be reached" rather than pretending the search never ran.
 *
 *   npx tsx scripts/dossier-completion/import-pubmed-searches.ts [--in=<ndjson>]
 */

export const PUBMED_SEARCH_KIND = 'PUBMED_ESEARCH_CLINICAL_TRIAL' as const

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

async function main(): Promise<void> {
  const dataDir = process.env.RNAWIKI_INGEST_DATA ?? join(process.cwd(), 'tmp')
  const inPath = flag('in') ?? join(dataDir, 'pubmed', 'clinical-trial-searches.ndjson')
  const latest = new Map<string, PubMedSearchRecord>()
  for (const line of readFileSync(inPath, 'utf8').split('\n')) {
    if (!line.trim()) continue
    const record = JSON.parse(line) as PubMedSearchRecord
    if (record.schema !== 'rnawiki-pubmed-search-record/v1') continue
    const existing = latest.get(record.drugId)
    if (!existing || record.status === 'SUCCEEDED' || existing.status !== 'SUCCEEDED') {
      latest.set(record.drugId, record)
    }
  }
  try {
    let written = 0
    for (const record of [...latest.values()].sort((a, b) => a.canonicalSlug.localeCompare(b.canonicalSlug))) {
      const sourceIdentifier = `pubmed/eutils esearch (${record.filter}) ${record.requestedAt.slice(0, 10)}`
      const id = createHash('sha256')
        .update(`source-search/v1|${record.drugId}|${PUBMED_SEARCH_KIND}|${sourceIdentifier}`)
        .digest('hex')
      const values = {
        id,
        drugId: record.drugId,
        searchKind: PUBMED_SEARCH_KIND,
        sourceIdentifier,
        query: record.query,
        requestedAt: new Date(record.requestedAt),
        status: record.status,
        resultCount: record.status === 'SUCCEEDED' ? record.resultCount : null,
        matched: [],
        responseDigest: record.responseDigest,
        error: record.status === 'SUCCEEDED' ? null : record.error ?? 'unknown failure',
      }
      await db
        .insert(sourceSearchRecords)
        .values(values)
        .onConflictDoUpdate({
          target: [sourceSearchRecords.drugId, sourceSearchRecords.searchKind, sourceSearchRecords.sourceIdentifier],
          set: {
            query: values.query,
            requestedAt: values.requestedAt,
            status: values.status,
            resultCount: values.resultCount,
            responseDigest: values.responseDigest,
            error: values.error,
          },
          setWhere: sql`${sourceSearchRecords.responseDigest} is distinct from ${values.responseDigest} or ${sourceSearchRecords.status} <> ${values.status}`,
        })
      written += 1
    }
    const succeeded = [...latest.values()].filter((r) => r.status === 'SUCCEEDED').length
    console.log(`[pubmed-import] ${written} record(s) processed · ${succeeded} succeeded · ${written - succeeded} failed/unreachable`)
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
