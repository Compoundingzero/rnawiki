import 'dotenv/config'
import { gunzipSync, gzipSync } from 'node:zlib'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import type {
  ExtractedComparison,
  ExtractedOutcome,
  ExtractedStudy,
  ExtractedValue,
  RegistryAnalysis,
  RegistryGroup,
  RegistryOutcomeMeasure,
  RegistryStudy,
} from './registry-types'
import { readState, writeState, RAW_DIR, STATE_DIR } from './state'

/**
 * PHASE 3 — transcribe stated values out of the fetched payloads.
 *
 * EDITORIAL RULE. Everything here is a transcription. No effect size is computed, no arm is compared,
 * no value is characterised. Where the registry itself states a between-group difference it is
 * carried across verbatim with the submitter's own description attached. A field the registry does
 * not supply is absent, and absent is an acceptable output.
 *
 * A study qualifies for the page only if it has at least one primary outcome carrying a reported
 * value AND an enrolment count. Studies with a results section that fail that bar are counted
 * separately, because the size of that gap is itself a finding.
 *
 *   npx tsx scripts/trial-results/phase3-extract.ts [--force]
 */

const EXTRACT_DIR = join(STATE_DIR, 'extracted')

/** Resolve a module-local groupId through that module's own groups[]. Never across modules. */
function groupTitle(
  groups: RegistryGroup[] | undefined,
  groupId: string | undefined,
): string | null {
  if (!groupId) return null
  return groups?.find((group) => group.id === groupId)?.title ?? null
}

function num(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function extractStudy(study: RegistryStudy): ExtractedStudy {
  const protocol = study.protocolSection ?? {}
  const results = study.resultsSection ?? {}
  const status = protocol.statusModule ?? {}
  const design = protocol.designModule ?? {}
  const arms = protocol.armsInterventionsModule ?? {}
  const nctId: string = protocol.identificationModule?.nctId ?? ''

  const outcomeMeasures: RegistryOutcomeMeasure[] =
    results.outcomeMeasuresModule?.outcomeMeasures ?? []
  const outcomes: ExtractedOutcome[] = outcomeMeasures.map((measure) => {
    const groups: RegistryGroup[] = measure.groups ?? []
    const values: ExtractedValue[] = []
    for (const klass of measure.classes ?? []) {
      for (const category of klass.categories ?? []) {
        for (const measurement of category.measurements ?? []) {
          values.push({
            classTitle: klass.title ?? null,
            categoryTitle: category.title ?? null,
            groupId: measurement.groupId ?? null,
            groupTitle: groupTitle(groups, measurement.groupId),
            value: measurement.value ?? null,
            spread: measurement.spread ?? null,
            lowerLimit: measurement.lowerLimit ?? null,
            upperLimit: measurement.upperLimit ?? null,
            comment: measurement.comment ?? null,
          })
        }
      }
    }
    // Carried verbatim: a difference the registry states, never one derived here.
    const statedComparisons: ExtractedComparison[] = (measure.analyses ?? []).map(
      (analysis: RegistryAnalysis) => ({
        groupIds: analysis.groupIds ?? [],
        groupTitles: (analysis.groupIds ?? []).map((id: string) => groupTitle(groups, id)),
        groupDescription: analysis.groupDescription ?? null,
        paramType: analysis.paramType ?? null,
        paramValue: analysis.paramValue ?? null,
        dispersionType: analysis.dispersionType ?? null,
        dispersionValue: analysis.dispersionValue ?? null,
        ciPctValue: analysis.ciPctValue ?? null,
        ciNumSides: analysis.ciNumSides ?? null,
        ciLowerLimit: analysis.ciLowerLimit ?? null,
        ciUpperLimit: analysis.ciUpperLimit ?? null,
        pValue: analysis.pValue ?? null,
        pValueComment: analysis.pValueComment ?? null,
        statisticalMethod: analysis.statisticalMethod ?? null,
        statisticalComment: analysis.statisticalComment ?? null,
        estimateComment: analysis.estimateComment ?? null,
        testedNonInferiority: analysis.testedNonInferiority ?? null,
        nonInferiorityType: analysis.nonInferiorityType ?? null,
        nonInferiorityComment: analysis.nonInferiorityComment ?? null,
      }),
    )
    return {
      type: measure.type ?? null,
      reportingStatus: measure.reportingStatus ?? null,
      title: measure.title ?? null,
      description: measure.description ?? null,
      timeFrame: measure.timeFrame ?? null,
      populationDescription: measure.populationDescription ?? null,
      unitOfMeasure: measure.unitOfMeasure ?? null,
      paramType: measure.paramType ?? null,
      dispersionType: measure.dispersionType || null,
      groups: groups.map((group) => ({
        id: group.id ?? null,
        title: group.title ?? null,
        description: group.description ?? null,
      })),
      denominators: (measure.denoms ?? []).flatMap((denom) =>
        (denom.counts ?? []).map((count) => ({
          groupId: count.groupId ?? null,
          groupTitle: groupTitle(groups, count.groupId),
          value: num(count.value),
          units: denom.units ?? null,
        })),
      ),
      values,
      statedComparisons,
    }
  })

  // Participant flow: started and completed per arm, transcribed from milestone achievements.
  const flow = results.participantFlowModule ?? {}
  const flowGroups: RegistryGroup[] = flow.groups ?? []
  const perArm = new Map<
    string,
    { groupId: string; groupTitle: string | null; started: number | null; completed: number | null }
  >()
  for (const period of flow.periods ?? []) {
    for (const milestone of period.milestones ?? []) {
      const type = String(milestone.type ?? '').toUpperCase()
      if (type !== 'STARTED' && type !== 'COMPLETED') continue
      for (const achievement of milestone.achievements ?? []) {
        const id = achievement.groupId
        if (!id) continue
        const entry = perArm.get(id) ?? {
          groupId: id,
          groupTitle: groupTitle(flowGroups, id),
          started: null,
          completed: null,
        }
        const subjects = num(achievement.numSubjects)
        // Only the first period's milestones describe the whole study intake.
        if (type === 'STARTED' && entry.started === null) entry.started = subjects
        if (type === 'COMPLETED' && entry.completed === null) entry.completed = subjects
        perArm.set(id, entry)
      }
    }
  }

  const adverse = results.adverseEventsModule ?? {}
  const seriousAdverseEvents = (adverse.eventGroups ?? []).map((group) => ({
    groupId: group.id ?? null,
    groupTitle: group.title ?? null,
    seriousAffected: num(group.seriousNumAffected),
    seriousAtRisk: num(group.seriousNumAtRisk),
    otherAffected: num(group.otherNumAffected),
    otherAtRisk: num(group.otherNumAtRisk),
    deathsAffected: num(group.deathsNumAffected),
    deathsAtRisk: num(group.deathsNumAtRisk),
  }))

  const enrolmentCount = num(design.enrollmentInfo?.count)
  const primaryWithValue = outcomes.filter(
    (outcome) =>
      outcome.type === 'PRIMARY' &&
      outcome.reportingStatus === 'POSTED' &&
      outcome.values.some((value) => value.value !== null && value.value !== ''),
  )
  const hasResultsSection = Boolean(
    results.outcomeMeasuresModule || results.participantFlowModule || results.adverseEventsModule,
  )
  const qualifies = primaryWithValue.length > 0 && enrolmentCount !== null

  return {
    nctId,
    briefTitle: protocol.identificationModule?.briefTitle ?? null,
    officialTitle: protocol.identificationModule?.officialTitle ?? null,
    hasResults: study.hasResults === true,
    hasResultsSection,
    qualifies,
    failedBarBecause: qualifies
      ? null
      : !hasResultsSection
        ? 'no results section'
        : primaryWithValue.length === 0
          ? 'no primary outcome carries a reported value'
          : 'no enrolment count',
    design: {
      studyType: design.studyType ?? null,
      phases: design.phases ?? [],
      allocation: design.designInfo?.allocation ?? null,
      interventionModel: design.designInfo?.interventionModel ?? null,
      primaryPurpose: design.designInfo?.primaryPurpose ?? null,
      masking: design.designInfo?.maskingInfo?.masking ?? null,
      whoMasked: design.designInfo?.maskingInfo?.whoMasked ?? [],
      armCount: (arms.armGroups ?? []).length,
      armGroups: (arms.armGroups ?? []).map((group) => ({
        label: group.label ?? null,
        type: group.type ?? null,
        interventionNames: group.interventionNames ?? [],
      })),
    },
    enrolment: {
      count: enrolmentCount,
      type: design.enrollmentInfo?.type ?? null,
      perArm: [...perArm.values()],
      recruitmentDetails: flow.recruitmentDetails ?? null,
    },
    dates: {
      overallStatus: status.overallStatus ?? null,
      primaryCompletion: status.primaryCompletionDateStruct?.date ?? null,
      completion: status.completionDateStruct?.date ?? null,
      resultsFirstPosted: status.resultsFirstPostDateStruct?.date ?? null,
      resultsFirstSubmitted: status.resultsFirstSubmitDate ?? null,
      resultsQcCleared: status.resultsFirstSubmitQcDate ?? null,
      delayedPosting: status.delayedPosting ?? false,
    },
    outcomes,
    adverseEvents: {
      frequencyThreshold: adverse.frequencyThreshold ?? null,
      timeFrame: adverse.timeFrame ?? null,
      perArm: seriousAdverseEvents,
    },
    publications: (protocol.referencesModule?.references ?? [])
      .filter((reference): reference is { pmid: string; type?: string; citation?: string } =>
        Boolean(reference.pmid),
      )
      .map((reference) => ({
        pmid: reference.pmid,
        type: reference.type ?? null,
        citation: reference.citation ?? null,
      })),
  }
}

function main(): void {
  const force = process.argv.includes('--force')
  if (!existsSync(EXTRACT_DIR)) mkdirSync(EXTRACT_DIR, { recursive: true })

  const batches = readdirSync(RAW_DIR)
    .filter((name) => name.endsWith('.json.gz'))
    .sort()
  const totals = {
    studies: 0,
    withResultsSection: 0,
    qualified: 0,
    failedBar: 0,
    failureReasons: {} as Record<string, number>,
    withStatedComparison: 0,
    withSeriousAdverseEvents: 0,
    withPublication: 0,
  }

  let processed = 0
  for (const name of batches) {
    const target = join(EXTRACT_DIR, name.replace('.json.gz', '.ndjson.gz'))
    let rows: ExtractedStudy[]
    if (existsSync(target) && !force) {
      rows = gunzipSync(readFileSync(target))
        .toString('utf8')
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line) as ExtractedStudy)
    } else {
      const payload = JSON.parse(
        gunzipSync(readFileSync(join(RAW_DIR, name))).toString('utf8'),
      ) as { studies?: RegistryStudy[] }
      rows = (payload.studies ?? []).map(extractStudy)
      writeFileSync(target, gzipSync(rows.map((row) => JSON.stringify(row)).join('\n')))
      processed += 1
    }
    for (const row of rows) {
      totals.studies += 1
      if (row.hasResultsSection) totals.withResultsSection += 1
      if (row.qualifies) totals.qualified += 1
      else {
        totals.failedBar += 1
        const reason = row.failedBarBecause ?? 'unknown'
        totals.failureReasons[reason] = (totals.failureReasons[reason] ?? 0) + 1
      }
      if (row.outcomes.some((outcome) => outcome.statedComparisons.length > 0)) {
        totals.withStatedComparison += 1
      }
      if (row.adverseEvents.perArm.length > 0) totals.withSeriousAdverseEvents += 1
      if (row.publications.length > 0) totals.withPublication += 1
    }
  }

  writeFileSync(join(STATE_DIR, 'phase3-summary.json'), JSON.stringify(totals, null, 2))
  console.log(`[phase3] ${batches.length} batches (${processed} newly extracted)`)
  console.log(`[phase3] studies ${totals.studies} · results section ${totals.withResultsSection}`)
  console.log(`[phase3] QUALIFIED ${totals.qualified} · failed the bar ${totals.failedBar}`)
  for (const [reason, count] of Object.entries(totals.failureReasons).sort((a, b) => b[1] - a[1])) {
    console.log(`[phase3]   ${count} — ${reason}`)
  }
  console.log(
    `[phase3] stated between-group comparison ${totals.withStatedComparison} · serious AE per arm ${totals.withSeriousAdverseEvents} · linked publication ${totals.withPublication}`,
  )

  const next = readState()
  writeState({
    ...next,
    counts: { ...next.counts, qualified: totals.qualified },
    phase3: { ...totals, extracted_at: new Date().toISOString() },
  })
}

main()
