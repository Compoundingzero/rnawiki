import 'dotenv/config'
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { sourceSearchRecords } from '@/db/schema'
import {
  MINIMUM_MATCH_KEY_LENGTH,
  normalizeInterventionName,
  RegistryMatcher,
  TRIAL_MATCH_NORMALIZATION_VERSION,
  type EntityMatchNames,
} from '@/lib/dossier-completion/trial-registry-match'
import { stableJsonStringify } from '@/lib/stable-json'

/**
 * Runs the exact-name pass over one dated ClinicalTrials.gov snapshot for every canonical entity
 * and records the result as one search record per entity.
 *
 * A duplicate record's name and aliases are searched on behalf of its canonical entity, because
 * the two are one entity by exact name. Ambiguous aliases (an alias owned by more than one record)
 * are never used: a match through them would attribute one registration to several records.
 *
 *   npx tsx scripts/dossier-completion/match-trial-registry.ts [--snapshot=<dir>] [--dry-run]
 */

export const CLINICALTRIALS_SEARCH_KIND = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION' as const
const MAX_STORED_STUDIES = 250

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

interface EntityRow {
  drug_id: string
  canonical_slug: string
  name: string
  resolution_status: string
  canonical_drug_id: string
  aliases: Array<{ alias: string; kind: string; owners: number }>
}

async function loadEntities(): Promise<EntityMatchNames[]> {
  const result = await db.execute(sql`
    with alias_owners as (
      select trim(both '-' from regexp_replace(lower(alias), '[^a-z0-9]+', '-', 'g')) as alias_key,
             count(distinct drug_id) as owners
      from drug_aliases group by 1
    )
    select r.drug_id, r.canonical_slug, d.name, r.resolution_status, r.canonical_drug_id,
      coalesce((select jsonb_agg(jsonb_build_object('alias', a.alias, 'kind', a.kind, 'owners', o.owners) order by a.alias)
                from drug_aliases a
                join alias_owners o on o.alias_key = trim(both '-' from regexp_replace(lower(a.alias), '[^a-z0-9]+', '-', 'g'))
                where a.drug_id = r.drug_id), '[]'::jsonb) as aliases
    from inventory_resolutions r
    join drugs d on d.id = r.drug_id
    where r.resolution_status in ('CANONICAL_ENTITY', 'DUPLICATE_OF_CANONICAL_ENTITY')
    order by r.canonical_slug, r.drug_id
  `)
  const rows = result.rows as unknown as EntityRow[]
  const byCanonical = new Map<
    string,
    EntityMatchNames & { keys: EntityMatchNames['keys'][number][] }
  >()
  for (const row of rows) {
    const canonicalId = row.canonical_drug_id
    const entity =
      byCanonical.get(canonicalId) ??
      ({ drugId: canonicalId, canonicalSlug: row.canonical_slug, keys: [] } as EntityMatchNames & {
        keys: EntityMatchNames['keys'][number][]
      })
    const isDuplicate = row.resolution_status === 'DUPLICATE_OF_CANONICAL_ENTITY'
    const push = (name: string, via: EntityMatchNames['keys'][number]['via']) => {
      const key = normalizeInterventionName(name)
      if (key.length < MINIMUM_MATCH_KEY_LENGTH) return
      if (!entity.keys.some((existing) => existing.key === key))
        entity.keys.push({ key, name, via })
    }
    push(row.name, isDuplicate ? 'duplicate_record' : 'name')
    for (const alias of row.aliases) {
      if (alias.owners !== 1) continue
      if (
        alias.kind === 'brand' ||
        alias.kind === 'inn' ||
        alias.kind === 'salt_form' ||
        alias.kind === 'common_name'
      ) {
        push(alias.alias, isDuplicate ? 'duplicate_record' : alias.kind)
      }
    }
    byCanonical.set(canonicalId, entity)
  }
  return [...byCanonical.values()].sort((left, right) =>
    left.canonicalSlug.localeCompare(right.canonicalSlug),
  )
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  const dataDir = process.env.RNAWIKI_INGEST_DATA ?? join(process.cwd(), 'tmp')
  const snapshotDir =
    flag('snapshot') ??
    (() => {
      const root = join(dataDir, 'clinicaltrials')
      const candidates = existsSync(root)
        ? readdirSync(root)
            .filter((name) => existsSync(join(root, name, 'manifest.json')))
            .sort()
        : []
      const latest = candidates.at(-1)
      if (!latest) throw new Error(`No completed snapshot under ${root}`)
      return join(root, latest)
    })()
  const manifest = JSON.parse(readFileSync(join(snapshotDir, 'manifest.json'), 'utf8')) as {
    schema: string
    dataTimestamp: string
    studiesSha256: string
    studies: number
    consistent: boolean
  }
  if (manifest.schema !== 'rnawiki-clinicaltrials-snapshot/v1' || !manifest.consistent) {
    throw new Error(`${snapshotDir} is not a consistent snapshot`)
  }
  const sourceIdentifier = `clinicaltrials.gov/api/v2 studies snapshot ${manifest.dataTimestamp} sha256:${manifest.studiesSha256}`

  try {
    const entities = await loadEntities()
    const matcher = new RegistryMatcher(entities)
    console.log(
      `[trial-match] ${entities.length} canonical entities · ${matcher.wantedKeyCount} exact keys · snapshot ${manifest.dataTimestamp} (${manifest.studies} studies)`,
    )
    let offered = 0
    const reader = createInterface({
      input: createReadStream(join(snapshotDir, 'studies.ndjson'), { encoding: 'utf8' }),
      crlfDelay: Number.POSITIVE_INFINITY,
    })
    for await (const line of reader) {
      if (!line.trim()) continue
      matcher.offer(JSON.parse(line))
      offered += 1
      if (offered % 100_000 === 0) console.log(`[trial-match] ${offered} studies offered`)
    }
    if (offered !== manifest.studies) {
      throw new Error(`snapshot holds ${offered} studies but its manifest says ${manifest.studies}`)
    }
    const results = matcher.results(entities)
    const requestedAt = new Date()
    let withMatches = 0
    let studiesMatched = 0
    let written = 0
    for (const result of results) {
      if (result.studies.length > 0) withMatches += 1
      studiesMatched += result.studies.length
      const entity = entities.find((candidate) => candidate.drugId === result.drugId)!
      const query = {
        normalization: TRIAL_MATCH_NORMALIZATION_VERSION,
        keys: entity.keys.map(({ key, name, via }) => ({ key, name, via })),
      }
      const matched = {
        totalMatchedStudies: result.studies.length,
        storedStudies: Math.min(result.studies.length, MAX_STORED_STUDIES),
        withPostedResults: result.studies.filter((study) => study.hasResults).length,
        matchedKeys: result.matchedKeys,
        studies: result.studies.slice(0, MAX_STORED_STUDIES),
      }
      const responseDigest = createHash('sha256').update(stableJsonStringify(matched)).digest('hex')
      const id = createHash('sha256')
        .update(
          `source-search/v1|${result.drugId}|${CLINICALTRIALS_SEARCH_KIND}|${sourceIdentifier}`,
        )
        .digest('hex')
      if (dryRun) continue
      await db
        .insert(sourceSearchRecords)
        .values({
          id,
          drugId: result.drugId,
          searchKind: CLINICALTRIALS_SEARCH_KIND,
          sourceIdentifier,
          query: stableJsonStringify(query),
          requestedAt,
          status: 'SUCCEEDED',
          resultCount: result.studies.length,
          matched: [matched],
          responseDigest,
          error: null,
        })
        .onConflictDoUpdate({
          target: [
            sourceSearchRecords.drugId,
            sourceSearchRecords.searchKind,
            sourceSearchRecords.sourceIdentifier,
          ],
          set: {
            query: stableJsonStringify(query),
            status: 'SUCCEEDED',
            resultCount: result.studies.length,
            matched: [matched],
            responseDigest,
            error: null,
          },
          setWhere: sql`${sourceSearchRecords.responseDigest} is distinct from ${responseDigest}`,
        })
      written += 1
    }
    console.log(
      `[trial-match] ${withMatches}/${entities.length} entities matched ${studiesMatched} registrations · ${dryRun ? 'dry run' : `${written} search records upserted`}`,
    )
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
