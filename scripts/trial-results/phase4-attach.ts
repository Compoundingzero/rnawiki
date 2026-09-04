import 'dotenv/config'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { sourceSearchRecords } from '@/db/schema'
import { stableJsonStringify } from '@/lib/stable-json'

import type { ExtractedOutcome, ExtractedStudy } from './registry-types'
import { readState, writeState, STATE_DIR } from './state'

/**
 * PHASE 4 — attach the qualifying results to the records they reach.
 *
 * Two passes, so memory never holds more than one extracted batch. The first pass ranks every
 * qualifying study per record and decides which three are shown; the second pass collects only
 * those and writes one search record per medicine.
 *
 * A record that matched registrations but has no qualifying results still gets a row, carrying
 * zero. The page says so plainly rather than omitting the block.
 *
 *   npx tsx scripts/trial-results/phase4-attach.ts [--dry-run] [--force]
 */

export const RESULTS_SEARCH_KIND = 'CLINICALTRIALS_RESULTS_V2' as const
const SHOWN_LIMIT = 3
const SECONDARY_SHOWN_LIMIT = 3
const EXTRACT_DIR = join(STATE_DIR, 'extracted')

interface Ranked {
  nctId: string
  enrolment: number
  resultsFirstPosted: string
}

/** Actual enrolment first, then the more recently posted result, then NCT id so ties are stable. */
function compare(left: Ranked, right: Ranked): number {
  if (left.enrolment !== right.enrolment) return right.enrolment - left.enrolment
  if (left.resultsFirstPosted !== right.resultsFirstPosted) {
    return right.resultsFirstPosted.localeCompare(left.resultsFirstPosted)
  }
  return left.nctId.localeCompare(right.nctId)
}

function batches(): string[] {
  return readdirSync(EXTRACT_DIR)
    .filter((name) => name.endsWith('.ndjson.gz'))
    .sort()
}

function* readBatch(name: string): Generator<ExtractedStudy> {
  const text = gunzipSync(readFileSync(join(EXTRACT_DIR, name)))
    .toString('utf8')
    .trim()
  if (!text) return
  for (const line of text.split('\n')) yield JSON.parse(line) as ExtractedStudy
}

/** The page payload: primary outcomes in full, secondary capped, the remainder counted. */
function toShownRecord(row: ExtractedStudy) {
  const withValues = (outcome: ExtractedOutcome) =>
    outcome.reportingStatus === 'POSTED' &&
    outcome.values.some((value) => value.value !== null && value.value !== '')
  const primary = row.outcomes.filter(
    (outcome) => outcome.type === 'PRIMARY' && withValues(outcome),
  )
  const secondaryAll = row.outcomes.filter(
    (outcome) => outcome.type === 'SECONDARY' && withValues(outcome),
  )
  const trim = (outcome: ExtractedOutcome) => ({
    type: outcome.type,
    title: outcome.title,
    description: outcome.description ? String(outcome.description).slice(0, 600) : null,
    timeFrame: outcome.timeFrame,
    unitOfMeasure: outcome.unitOfMeasure,
    paramType: outcome.paramType,
    dispersionType: outcome.dispersionType,
    denominators: outcome.denominators,
    values: outcome.values.filter((value) => value.value !== null && value.value !== ''),
    statedComparisons: outcome.statedComparisons,
  })
  return {
    nctId: row.nctId,
    briefTitle: row.briefTitle,
    phases: row.design.phases,
    studyType: row.design.studyType,
    allocation: row.design.allocation,
    masking: row.design.masking,
    primaryPurpose: row.design.primaryPurpose,
    armCount: row.design.armCount,
    overallStatus: row.dates.overallStatus,
    enrolment: {
      count: row.enrolment.count,
      type: row.enrolment.type,
      perArm: row.enrolment.perArm,
    },
    primaryCompletion: row.dates.primaryCompletion,
    resultsFirstPosted: row.dates.resultsFirstPosted,
    delayedPosting: row.dates.delayedPosting,
    outcomes: [...primary.map(trim), ...secondaryAll.slice(0, SECONDARY_SHOWN_LIMIT).map(trim)],
    primaryOutcomeCount: primary.length,
    secondaryOutcomeCount: secondaryAll.length,
    secondaryOutcomesShown: Math.min(secondaryAll.length, SECONDARY_SHOWN_LIMIT),
    adverseEvents: row.adverseEvents,
    publications: row.publications,
  }
}

async function main(): Promise<void> {
  const state = readState()
  const dryRun = process.argv.includes('--dry-run')
  const reachPath = join(STATE_DIR, 'study-to-records.json')
  if (!existsSync(reachPath)) throw new Error('no study-to-records.json — run phase1-queue.ts')
  const reach = JSON.parse(readFileSync(reachPath, 'utf8')) as Record<string, string[]>

  // ---- pass 1: rank every qualifying study for every record it reaches -------------------------
  const perRecord = new Map<string, { ranked: Ranked[]; failedBar: number; withSection: number }>()
  let qualifying = 0
  let failedBar = 0
  for (const name of batches()) {
    for (const row of readBatch(name)) {
      const records = reach[row.nctId] ?? []
      if (records.length === 0) continue
      for (const drugId of records) {
        const entry = perRecord.get(drugId) ?? { ranked: [], failedBar: 0, withSection: 0 }
        if (row.hasResultsSection) entry.withSection += 1
        if (row.qualifies) {
          entry.ranked.push({
            nctId: row.nctId,
            enrolment: row.enrolment.count ?? 0,
            resultsFirstPosted: row.dates.resultsFirstPosted ?? '',
          })
        } else if (row.hasResultsSection) {
          entry.failedBar += 1
        }
        perRecord.set(drugId, entry)
      }
      if (row.qualifies) qualifying += 1
      else if (row.hasResultsSection) failedBar += 1
    }
  }

  const chosen = new Set<string>()
  for (const entry of perRecord.values()) {
    entry.ranked.sort(compare)
    for (const study of entry.ranked.slice(0, SHOWN_LIMIT)) chosen.add(study.nctId)
  }
  console.log(
    `[phase4] pass 1 · ${perRecord.size} records touched · ${qualifying} qualifying studies · ${failedBar} with a results section that failed the bar · ${chosen.size} distinct studies selected`,
  )

  // ---- pass 2: collect only the selected studies ----------------------------------------------
  const payloads = new Map<string, ReturnType<typeof toShownRecord>>()
  for (const name of batches()) {
    for (const row of readBatch(name)) {
      if (chosen.has(row.nctId)) payloads.set(row.nctId, toShownRecord(row))
    }
  }
  console.log(`[phase4] pass 2 · collected ${payloads.size} study payloads`)

  // ---- write one search record per medicine ---------------------------------------------------
  const phase1 = state.phase1 as { queue?: { digest?: string } } | undefined
  const queueDigest = String(phase1?.queue?.digest ?? '').slice(0, 16)
  const fetchedOn = new Date().toISOString().slice(0, 10)
  const sourceIdentifier = `clinicaltrials.gov/api/v2 results fetch ${fetchedOn} queue-sha256:${queueDigest}`
  const requestedAt = new Date()

  let written = 0
  let withShown = 0
  let withNone = 0
  try {
    for (const [drugId, entry] of perRecord) {
      const shown = entry.ranked.slice(0, SHOWN_LIMIT).map((study) => payloads.get(study.nctId)!)
      if (shown.length > 0) withShown += 1
      else withNone += 1
      const envelope = {
        totalQualifying: entry.ranked.length,
        withResultsSection: entry.withSection,
        failedQualifyingBar: entry.failedBar,
        shownLimit: SHOWN_LIMIT,
        secondaryShownLimit: SECONDARY_SHOWN_LIMIT,
        rankingRule: 'actual enrolment, then most recently posted results',
        studies: shown,
      }
      const responseDigest = createHash('sha256')
        .update(stableJsonStringify(envelope))
        .digest('hex')
      const id = createHash('sha256')
        .update(`source-search/v1|${drugId}|${RESULTS_SEARCH_KIND}|${sourceIdentifier}`)
        .digest('hex')
      if (dryRun) continue
      await db
        .insert(sourceSearchRecords)
        .values({
          id,
          drugId,
          searchKind: RESULTS_SEARCH_KIND,
          sourceIdentifier,
          query: stableJsonStringify({
            kind: 'results fetch by NCT id',
            endpoint: 'GET /api/v2/studies?filter.ids=',
            bar: 'at least one primary outcome with a reported value, and an enrolment count',
          }),
          requestedAt,
          status: 'SUCCEEDED',
          resultCount: entry.ranked.length,
          matched: [envelope],
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
            status: 'SUCCEEDED',
            resultCount: entry.ranked.length,
            matched: [envelope],
            responseDigest,
            error: null,
          },
          setWhere: sql`${sourceSearchRecords.responseDigest} is distinct from ${responseDigest}`,
        })
      written += 1
    }
  } finally {
    await closeDatabasePool()
  }

  const summary = {
    attached_at: new Date().toISOString(),
    source_identifier: sourceIdentifier,
    records_touched: perRecord.size,
    records_with_a_results_block: withShown,
    records_with_registrations_but_no_qualifying_result: withNone,
    qualifying_studies: qualifying,
    studies_with_a_results_section_that_failed_the_bar: failedBar,
    distinct_studies_shown: payloads.size,
    written: dryRun ? 0 : written,
  }
  writeFileSync(join(STATE_DIR, 'phase4-summary.json'), JSON.stringify(summary, null, 2))
  console.log(
    `[phase4] ${dryRun ? 'dry run — ' : ''}${written} search records · ${withShown} records gain a results block · ${withNone} carry registrations but no qualifying result`,
  )
  if (!dryRun) writeState({ ...readState(), phase: '4-attached', phase4: summary })
}

main().catch((error: unknown) => {
  console.error(`[phase4] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
