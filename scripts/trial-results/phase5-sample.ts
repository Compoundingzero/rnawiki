import 'dotenv/config'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'

import { readState, writeState, STATE_DIR } from './state'

/**
 * PHASE 5a — fix the measurement samples, deterministically and on disk.
 *
 * The baseline in `page-overlap-diagnosis.md` was measured on a 324-record sample whose member list
 * was never preserved, so the identical sample cannot be re-drawn. What is reproducible is its
 * design — stratified by evidence depth, drawn proportionally across entity classes — and that
 * design is rebuilt here with a fixed seed and written to disk so every later run and every future
 * session measures the same pages.
 *
 * Two samples, because the brief asks two different questions:
 *   corpus  — 324 records across the whole corpus, the design POD used
 *   affected — 324 records drawn from those that gain a results block
 *
 *   npx tsx scripts/trial-results/phase5-sample.ts [--force]
 */

const SAMPLE_PATH = join(STATE_DIR, 'phase5-samples.json')
const SAMPLE_SIZE = 324
const SEED = 'rnawiki/trial-results/overlap-sample/v1'

/** Deterministic ordering key: a record's position is a hash of the seed and its id, not chance. */
function shuffleKey(id: string): string {
  return createHash('sha256').update(`${SEED}|${id}`).digest('hex')
}

interface Row extends Record<string, unknown> {
  slug: string
  drug_id: string
  entity_class: string
  depth: string
  affected: boolean
}

/** Proportional allocation with largest-remainder, so the strata sum to exactly `size`. */
function allocate(strata: Map<string, Row[]>, size: number): Row[] {
  const total = [...strata.values()].reduce((sum, rows) => sum + rows.length, 0)
  const exact = [...strata.entries()].map(([key, rows]) => ({
    key,
    rows,
    want: (rows.length / total) * size,
  }))
  const picked = exact.map((entry) => ({
    ...entry,
    take: Math.min(entry.rows.length, Math.floor(entry.want)),
  }))
  let remaining = size - picked.reduce((sum, entry) => sum + entry.take, 0)
  const byRemainder = [...picked].sort((left, right) => {
    const diff = right.want - right.take - (left.want - left.take)
    return diff !== 0 ? diff : left.key.localeCompare(right.key)
  })
  for (const entry of byRemainder) {
    if (remaining <= 0) break
    if (entry.take < entry.rows.length) {
      entry.take += 1
      remaining -= 1
    }
  }
  return picked.flatMap((entry) =>
    [...entry.rows]
      .sort((left, right) => shuffleKey(left.drug_id).localeCompare(shuffleKey(right.drug_id)))
      .slice(0, entry.take),
  )
}

function stratify(rows: Row[]): Map<string, Row[]> {
  const strata = new Map<string, Row[]>()
  for (const row of rows) {
    const key = `${row.entity_class}|${row.depth}`
    const bucket = strata.get(key) ?? []
    bucket.push(row)
    strata.set(key, bucket)
  }
  return strata
}

async function main(): Promise<void> {
  const state = readState()
  if (existsSync(SAMPLE_PATH) && !process.argv.includes('--force')) {
    const existing = JSON.parse(readFileSync(SAMPLE_PATH, 'utf8')) as {
      corpus: string[]
      affected: string[]
      allAffected: string[]
    }
    console.log(
      `[phase5a] already done — corpus ${existing.corpus.length}, affected ${existing.affected.length}, all affected ${existing.allAffected.length}`,
    )
    return
  }

  try {
    // Evidence depth is the completion assessment's terminal-section count, bucketed the way the
    // corpus splits: nothing recorded, a little, or a substantial record.
    const result = await db.execute<Row>(sql`
      with results_reach as (
        select distinct r.drug_id
        from source_search_records r,
             lateral jsonb_array_elements(r.matched->0->'studies') e
        where r.search_kind = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION'
          and (e->>'hasResults')::boolean
      )
      select d.slug,
             d.id as drug_id,
             coalesce(i.entity_class::text, 'UNRESOLVED') as entity_class,
             case
               when coalesce(a.terminal_section_count, 0) = 0 then 'none'
               when coalesce(a.terminal_section_count, 0) <= 3 then 'thin'
               else 'substantial'
             end as depth,
             (rr.drug_id is not null) as affected
      from drugs d
      join inventory_resolutions i on i.drug_id = d.id and i.resolution_status = 'CANONICAL_ENTITY'
      left join dossier_completion_assessments a on a.drug_id = d.id
      left join results_reach rr on rr.drug_id = d.id
      order by d.slug
    `)
    const rows = result.rows

    const corpus = allocate(stratify(rows), SAMPLE_SIZE)
    const affectedRows = rows.filter((row) => row.affected)
    const affected = allocate(stratify(affectedRows), SAMPLE_SIZE)

    const payload = {
      seed: SEED,
      size: SAMPLE_SIZE,
      drawnAt: new Date().toISOString(),
      note: 'POD did not preserve its 324-record member list; this rebuilds its design, not its exact membership.',
      corpusPopulation: rows.length,
      affectedPopulation: affectedRows.length,
      corpus: corpus.map((row) => row.slug).sort(),
      affected: affected.map((row) => row.slug).sort(),
      allAffected: affectedRows.map((row) => row.slug).sort(),
      strata: {
        corpus: [...stratify(corpus).entries()].map(([key, bucket]) => [key, bucket.length]),
        affected: [...stratify(affected).entries()].map(([key, bucket]) => [key, bucket.length]),
      },
    }
    writeFileSync(SAMPLE_PATH, JSON.stringify(payload, null, 2))
    console.log(
      `[phase5a] corpus sample ${corpus.length} of ${rows.length} · affected sample ${affected.length} of ${affectedRows.length} · all affected ${affectedRows.length}`,
    )
    console.log(`[phase5a] wrote ${SAMPLE_PATH}`)
    writeState({ ...state, phase: '5a-sampled' })
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  console.error(`[phase5a] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
