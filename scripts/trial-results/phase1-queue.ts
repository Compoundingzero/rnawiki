import 'dotenv/config'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'

import { readState, writeState, STATE_DIR } from './state'

/**
 * PHASE 1 — reconcile what is stored against the operating brief, then write the work queue.
 *
 * The brief carries figures from two worklogs that disagreed. This phase settles them against the
 * database rather than picking one, and refuses to build a queue if anything fails to reconcile.
 *
 * The queue is sorted and deduplicated so the cursor means the same thing in every session, and
 * tiered so that a run cut off early has still delivered the studies that reach a record.
 *
 *   npx tsx scripts/trial-results/phase1-queue.ts [--force]
 */

const QUEUE_PATH = join(STATE_DIR, 'queue.ndjson')
const REACH_PATH = join(STATE_DIR, 'study-to-records.json')

/** Figures the brief states, and what each one is actually counting. */
const EXPECTED = {
  search_records: 9852,
  records_with_matches: 3569,
  registrations_uncapped: 224_946,
  stored_study_rows: 148_733,
  distinct_studies: 101_831,
  distinct_with_results: 30_556,
  records_reaching_results: 2431,
  records_with_three_plus: 1767,
} as const

async function main(): Promise<void> {
  const state = readState()
  const force = process.argv.includes('--force')
  if (state.phase1?.reconciled_at && existsSync(QUEUE_PATH) && !force) {
    console.log(`[phase1] already done — queue built at ${String(state.phase1.reconciled_at)}`)
    console.log(`[phase1] ${state.cursor.queue_total} studies queued at ${QUEUE_PATH}`)
    return
  }

  try {
    const counts = await db.execute<{ label: string; value: string }>(sql`
      with expanded as (
        select r.drug_id, e as study
        from source_search_records r,
             lateral jsonb_array_elements(r.matched->0->'studies') e
        where r.search_kind = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION'
      )
      select 'search_records' as label, count(*)::text as value from source_search_records
        where search_kind = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION'
      union all select 'records_with_matches', count(*)::text from source_search_records
        where search_kind = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION' and result_count > 0
      union all select 'registrations_uncapped', sum(result_count)::text from source_search_records
        where search_kind = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION'
      union all select 'stored_study_rows', sum(jsonb_array_length(matched->0->'studies'))::text
        from source_search_records where search_kind = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION'
      union all select 'distinct_studies', count(distinct study->>'nctId')::text from expanded
      union all select 'distinct_with_results', count(distinct study->>'nctId')::text from expanded
        where (study->>'hasResults')::boolean
      union all select 'records_reaching_results', count(distinct drug_id)::text from expanded
        where (study->>'hasResults')::boolean
      union all select 'records_with_three_plus', count(*)::text from (
        select drug_id from expanded where (study->>'hasResults')::boolean
        group by drug_id having count(*) >= 3) t
    `)

    const observed: Record<string, number> = {}
    for (const row of counts.rows) observed[row.label] = Number(row.value)

    const mismatches: string[] = []
    for (const [label, expected] of Object.entries(EXPECTED)) {
      const actual = observed[label]
      const mark = actual === expected ? 'ok  ' : 'DIFF'
      console.log(
        `[phase1] ${mark} ${label.padEnd(26)} expected ${String(expected).padStart(7)}  observed ${String(actual).padStart(7)}`,
      )
      if (actual !== expected) mismatches.push(`${label}: expected ${expected}, observed ${actual}`)
    }
    if (mismatches.length > 0) {
      console.error(`\n[phase1] STOPPING — ${mismatches.length} figure(s) disagree with the brief:`)
      for (const line of mismatches) console.error(`  ${line}`)
      process.exitCode = 1
      return
    }

    // How much the 250-per-record storage cap withheld, and from which records.
    const capped = await db.execute<{ records: string; lost: string }>(sql`
      select count(*) filter (where result_count > 250)::text as records,
             (sum(result_count) - sum(jsonb_array_length(matched->0->'studies')))::text as lost
      from source_search_records
      where search_kind = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION'
    `)
    const cappedRecords = Number(capped.rows[0]?.records ?? 0)
    const cappedLost = Number(capped.rows[0]?.lost ?? 0)
    console.log(
      `[phase1] storage cap: ${cappedRecords} records held only their lowest 250 NCT ids, withholding ${cappedLost} registrations`,
    )

    // The queue: every distinct matched study, tiered by whether the snapshot saw posted results.
    const queue = await db.execute<{
      nct_id: string
      tier: number
      record_count: string
      drug_ids: string[]
    }>(sql`
      with expanded as (
        select r.drug_id, e as study
        from source_search_records r,
             lateral jsonb_array_elements(r.matched->0->'studies') e
        where r.search_kind = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION'
      )
      select study->>'nctId' as nct_id,
             case when bool_or((study->>'hasResults')::boolean) then 1 else 2 end as tier,
             count(distinct drug_id)::text as record_count,
             array_agg(distinct drug_id order by drug_id) as drug_ids
      from expanded
      group by 1
      order by 2 asc, 1 asc
    `)

    const lines: string[] = []
    const reach: Record<string, string[]> = {}
    let tier1 = 0
    for (const row of queue.rows) {
      if (row.tier === 1) tier1 += 1
      lines.push(
        JSON.stringify({ nctId: row.nct_id, tier: row.tier, records: Number(row.record_count) }),
      )
      reach[row.nct_id] = row.drug_ids
    }
    writeFileSync(QUEUE_PATH, `${lines.join('\n')}\n`)
    writeFileSync(REACH_PATH, JSON.stringify(reach))
    const queueDigest = createHash('sha256').update(readFileSync(QUEUE_PATH)).digest('hex')

    console.log(
      `[phase1] queue: ${lines.length} studies — tier 1 (snapshot says results posted) ${tier1}, tier 2 (re-check live) ${lines.length - tier1}`,
    )
    console.log(`[phase1] wrote ${QUEUE_PATH} sha256:${queueDigest.slice(0, 16)}`)

    writeState({
      ...state,
      phase: '1-queue-complete',
      cursor: { queue_index: 0, queue_path: QUEUE_PATH, queue_total: lines.length },
      phase1: {
        reconciled_at: new Date().toISOString(),
        observed,
        all_brief_figures_reconciled: true,
        registration_cap: {
          max_stored_per_record: 250,
          records_at_cap: cappedRecords,
          registrations_withheld: cappedLost,
          kept: 'the 250 lowest NCT ids per record — the matcher sorts by nctId before slicing, so what was withheld is the newer tail',
        },
        queue: {
          path: QUEUE_PATH,
          digest: queueDigest,
          total: lines.length,
          tier1_results_posted_in_snapshot: tier1,
          tier2_recheck_live: lines.length - tier1,
          order: 'tier ascending, then nctId ascending',
        },
      },
    })
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
