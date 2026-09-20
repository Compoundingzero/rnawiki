/**
 * Read-only research queue for the legacy ClinicalTrials.gov pivotalResults rows.
 *
 * Usage: npx tsx scripts/research/trial-candidate-queue.ts [--source path]
 *        [--study-dir path] [--output path]
 *
 * With no --study-dir, the script fetches the current API v2 study by exact NCT ID.
 * It never edits the corpus, and every item remains a review candidate.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

type Source = { kind?: string; identifier?: string }
export type LegacyTrialRow = {
  record: string
  rowIndex: number
  trialIdentifier: string
  endpointAsRecorded: string
  activeResultAsRecorded: string
  comparatorResultAsRecorded?: string
  differenceAsRecorded?: string
  uncertaintyAsRecorded?: string
  timepointAsRecorded: string
  source: Source
}

type Group = { id?: string; title?: string; description?: string }
type Measurement = {
  groupId?: string
  value?: string
  spread?: string
  lowerLimit?: string
  upperLimit?: string
}
type Analysis = {
  groupIds?: string[]
  groupDescription?: string
  paramType?: string
  paramValue?: string
  ciPctValue?: string
  ciLowerLimit?: string
  ciUpperLimit?: string
  pValue?: string
  pValueComment?: string
  statisticalMethod?: string
}
type Outcome = {
  type?: string
  title?: string
  timeFrame?: string
  reportingStatus?: string
  populationDescription?: string
  unitOfMeasure?: string
  paramType?: string
  dispersionType?: string
  groups?: Group[]
  denoms?: { units?: string; counts?: { groupId?: string; value?: string }[] }[]
  classes?: { title?: string; categories?: { title?: string; measurements?: Measurement[] }[] }[]
  analyses?: Analysis[]
}
export type RegistryStudy = {
  hasResults?: boolean
  protocolSection?: {
    identificationModule?: { nctId?: string }
    statusModule?: { resultsFirstPostDateStruct?: { date?: string } }
    conditionsModule?: { conditions?: string[] }
    eligibilityModule?: {
      sex?: string
      minimumAge?: string
      maximumAge?: string
      healthyVolunteers?: boolean
      eligibilityCriteria?: string
    }
    armsInterventionsModule?: {
      armGroups?: {
        label?: string
        type?: string
        description?: string
        interventionNames?: string[]
      }[]
      interventions?: {
        type?: string
        name?: string
        description?: string
        armGroupLabels?: string[]
      }[]
    }
  }
  resultsSection?: { outcomeMeasuresModule?: { outcomeMeasures?: Outcome[] } }
}

const NCT = /^NCT\d{8}$/
const TOKEN_STOP = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'baseline',
  'by',
  'for',
  'from',
  'in',
  'of',
  'on',
  'or',
  'participant',
  'participants',
  'patient',
  'patients',
  'primary',
  'secondary',
  'the',
  'to',
  'with',
  'week',
  'weeks',
  'month',
  'months',
  'time',
  'number',
  'percentage',
  'percent',
])
const ROUTE =
  /\b(oral(?:ly)?|subcutaneous(?:ly)?|intravenous(?:ly)?|intramuscular(?:ly)?|topical(?:ly)?|ophthalmic|inhal(?:ed|ation)|nasal|transdermal|infusion|injection|inject(?:ed|ion)?)\b/i
const FORM =
  /\b(tablet|capsule|solution|suspension|cream|ointment|gel|patch|spray|powder|injection|infusion|pen|prefilled|syringe|drops?)s?\b/i

function clean(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function tokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((word) => word.length > 2 && !TOKEN_STOP.has(word) && !/^\d+$/.test(word)),
  )
}

function titleScore(recorded: string, title: string): number {
  const a = tokens(recorded)
  const b = tokens(title)
  if (!a.size || !b.size) return 0
  let shared = 0
  for (const word of b) if (a.has(word)) shared++
  return Number((shared / b.size).toFixed(3))
}

function numericTokens(value: string | undefined): string[] {
  return [
    ...new Set((value?.match(/(?<![\w.])-?\d+(?:\.\d+)?/g) ?? []).map((n) => String(Number(n)))),
  ]
}

function outcomeValues(outcome: Outcome): string[] {
  const values: string[] = []
  if (clean(outcome.title)) values.push(outcome.title!)
  for (const group of outcome.groups ?? []) {
    if (clean(group.title)) values.push(group.title!)
    if (clean(group.description)) values.push(group.description!)
  }
  for (const denom of outcome.denoms ?? []) {
    for (const count of denom.counts ?? []) if (clean(count.value)) values.push(count.value!)
  }
  for (const section of outcome.classes ?? []) {
    for (const category of section.categories ?? []) {
      for (const measurement of category.measurements ?? []) {
        for (const value of [
          measurement.value,
          measurement.spread,
          measurement.lowerLimit,
          measurement.upperLimit,
        ]) {
          if (clean(value)) values.push(value!)
        }
      }
    }
  }
  for (const analysis of outcome.analyses ?? []) {
    for (const value of [
      analysis.paramValue,
      analysis.ciPctValue,
      analysis.ciLowerLimit,
      analysis.ciUpperLimit,
      analysis.pValue,
      analysis.pValueComment,
    ]) {
      if (clean(value)) values.push(value!)
    }
  }
  return values
}

function resultTable(outcome: Outcome) {
  const groups = new Map(
    (outcome.groups ?? []).map((group, index) => [group.id, { ...group, index }]),
  )
  const denominators = new Map<string, { value: string; units?: string; sourcePath: string }[]>()
  for (const [denomIndex, denom] of (outcome.denoms ?? []).entries()) {
    for (const [countIndex, count] of (denom.counts ?? []).entries()) {
      if (count.groupId && clean(count.value)) {
        const candidates = denominators.get(count.groupId) ?? []
        candidates.push({
          value: count.value!,
          units: denom.units,
          sourcePath: `denoms[${denomIndex}].counts[${countIndex}]`,
        })
        denominators.set(count.groupId, candidates)
      }
    }
  }
  const rows = []
  for (const [classIndex, section] of (outcome.classes ?? []).entries()) {
    for (const [categoryIndex, category] of (section.categories ?? []).entries()) {
      for (const [measurementIndex, measurement] of (category.measurements ?? []).entries()) {
        const group = groups.get(measurement.groupId)
        rows.push({
          class: clean(section.title),
          category: clean(category.title),
          groupId: measurement.groupId,
          groupTitle: clean(group?.title),
          groupDescription: clean(group?.description),
          groupSourcePath: group ? `groups[${group.index}]` : undefined,
          denominatorCandidates: denominators.get(measurement.groupId ?? '') ?? [],
          value: clean(measurement.value),
          spread: clean(measurement.spread),
          lowerLimit: clean(measurement.lowerLimit),
          upperLimit: clean(measurement.upperLimit),
          sourcePath: `classes[${classIndex}].categories[${categoryIndex}].measurements[${measurementIndex}]`,
        })
      }
    }
  }
  return rows
}

export function loadLegacyTrialRows(ndjson: string): {
  rows: LegacyTrialRow[]
  excludedNonRegistry: number
} {
  const rows: LegacyTrialRow[] = []
  let excludedNonRegistry = 0
  for (const line of ndjson.split(/\r?\n/)) {
    if (!line.trim()) continue
    const envelope = JSON.parse(line) as {
      id?: string
      slug?: string
      recordedBackground?: { pivotalResults?: Omit<LegacyTrialRow, 'record' | 'rowIndex'>[] }
    }
    for (const [rowIndex, row] of (envelope.recordedBackground?.pivotalResults ?? []).entries()) {
      if (row.source?.kind !== 'CLINICALTRIALS') {
        excludedNonRegistry++
        continue
      }
      rows.push({ ...row, record: envelope.slug ?? envelope.id ?? '', rowIndex })
    }
  }
  return { rows, excludedNonRegistry }
}

export function buildTrialReviewCandidate(row: LegacyTrialRow, study: RegistryStudy | null) {
  const trialIdentifier = clean(row.trialIdentifier)?.toUpperCase() ?? ''
  const sourceIdentifier = clean(row.source?.identifier)?.toUpperCase() ?? ''
  const studyIdentifier =
    clean(study?.protocolSection?.identificationModule?.nctId)?.toUpperCase() ?? ''
  const blockers: string[] = []
  const add = (condition: boolean, message: string) => {
    if (condition) blockers.push(message)
  }
  add(!NCT.test(trialIdentifier), 'invalid_legacy_nct')
  add(
    row.source?.kind !== 'CLINICALTRIALS' || sourceIdentifier !== trialIdentifier,
    'legacy_source_not_same_nct',
  )
  add(!study, 'study_unavailable')
  add(Boolean(study) && studyIdentifier !== trialIdentifier, 'api_nct_mismatch')
  const trusted = Boolean(
    study &&
    NCT.test(trialIdentifier) &&
    sourceIdentifier === trialIdentifier &&
    studyIdentifier === trialIdentifier,
  )
  const protocol = trusted ? study!.protocolSection : undefined
  const conditions = (protocol?.conditionsModule?.conditions ?? []).filter((x): x is string =>
    Boolean(clean(x)),
  )
  const eligibility = protocol?.eligibilityModule
  const interventions = protocol?.armsInterventionsModule?.interventions ?? []
  const arms = protocol?.armsInterventionsModule?.armGroups ?? []
  const matchingInterventions = interventions.filter((intervention) => {
    const name = clean(intervention.name)?.toLowerCase() ?? ''
    const slug = row.record.toLowerCase().replace(/-/g, ' ')
    const description = clean(intervention.description)?.toLowerCase() ?? ''
    return (
      !/\bplacebo\b/.test(name) &&
      (name === slug ||
        name.includes(slug) ||
        (slug.includes(name) && name.length >= 5) ||
        description.includes(slug))
    )
  })
  const interventionEvidence = matchingInterventions.map((intervention) => ({
    type: clean(intervention.type),
    name: clean(intervention.name),
    description: clean(intervention.description),
    arms: arms
      .filter((arm) => intervention.armGroupLabels?.includes(arm.label ?? ''))
      .map((arm) => ({
        label: clean(arm.label),
        type: clean(arm.type),
        description: clean(arm.description),
      })),
  }))
  const formRouteText = interventionEvidence
    .flatMap((entry) => [
      entry.name,
      entry.description,
      ...entry.arms.flatMap((arm) => [arm.label, arm.description]),
    ])
    .filter(Boolean)
    .join(' ')
  const outcomes = trusted
    ? (study!.resultsSection?.outcomeMeasuresModule?.outcomeMeasures ?? [])
    : []
  const requestedType = /\bprimary\b/i.test(row.endpointAsRecorded)
    ? 'PRIMARY'
    : /\bsecondary\b/i.test(row.endpointAsRecorded)
      ? 'SECONDARY'
      : undefined
  const eligibleOutcomes = outcomes
    .map((outcome, index) => ({ outcome, index }))
    .filter((item) => !requestedType || item.outcome.type === requestedType)
  const ranked = eligibleOutcomes
    .map(({ outcome, index }) => ({
      outcome,
      index,
      score: titleScore(row.endpointAsRecorded, outcome.title ?? ''),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
  const best = ranked[0]
  const second = ranked[1]
  const uniqueMatch = Boolean(
    best && best.score >= 0.45 && (!second || best.score - second.score >= 0.12),
  )
  const matchedOutcome = uniqueMatch ? best?.outcome : undefined
  const groupCandidates = (matchedOutcome?.groups ?? []).map((group) => {
    const nameWords = tokens(group.title ?? '')
    const activeWords = tokens(row.activeResultAsRecorded)
    const comparatorWords = tokens(row.comparatorResultAsRecorded ?? '')
    const activeOverlap = [...nameWords].filter((word) => activeWords.has(word)).length
    const comparatorOverlap = [...nameWords].filter((word) => comparatorWords.has(word)).length
    return {
      groupId: group.id,
      title: group.title,
      activeTextOverlap: activeOverlap,
      comparatorTextOverlap: comparatorOverlap,
    }
  })
  const sourceValues = matchedOutcome
    ? new Set(outcomeValues(matchedOutcome).flatMap(numericTokens))
    : new Set<string>()
  const recordedNumberChecks = Object.fromEntries(
    (
      [
        'activeResultAsRecorded',
        'comparatorResultAsRecorded',
        'differenceAsRecorded',
        'uncertaintyAsRecorded',
      ] as const
    ).map((field) => [
      field,
      {
        recorded: numericTokens(row[field]),
        absentFromSelectedOutcome: numericTokens(row[field]).filter(
          (number) => !sourceValues.has(number),
        ),
      },
    ]),
  )
  add(conditions.length === 0, 'condition_missing')
  add(conditions.length > 1, 'condition_requires_selection')
  add(matchingInterventions.length !== 1, 'exact_intervention_requires_review')
  add(
    interventionEvidence.length === 1 && interventionEvidence[0]!.arms.length !== 1,
    'exact_arm_requires_review',
  )
  add(!ROUTE.test(formRouteText), 'route_not_explicit_in_matched_intervention')
  add(!FORM.test(formRouteText), 'product_form_not_explicit_in_matched_intervention')
  add(
    !eligibility?.eligibilityCriteria && !eligibility?.minimumAge && !eligibility?.sex,
    'population_missing',
  )
  add(study?.hasResults !== true || !study?.resultsSection, 'results_not_posted')
  add(!uniqueMatch, 'outcome_match_requires_review')
  add(
    Boolean(matchedOutcome) && matchedOutcome!.reportingStatus !== 'POSTED',
    'selected_outcome_not_posted',
  )
  add(Boolean(matchedOutcome) && !matchedOutcome!.timeFrame, 'timepoint_missing')
  add(
    Boolean(matchedOutcome) && resultTable(matchedOutcome!).length === 0,
    'numeric_measurement_missing',
  )
  add(
    Boolean(matchedOutcome) && resultTable(matchedOutcome!).length < 2,
    'comparator_measurement_requires_review',
  )
  const outcomeGroupIds = new Set((matchedOutcome?.groups ?? []).map((group) => group.id))
  add(
    Boolean(matchedOutcome) &&
      resultTable(matchedOutcome!).some((measurement) => !outcomeGroupIds.has(measurement.groupId)),
    'measurement_group_outside_selected_outcome',
  )
  add(
    Boolean(matchedOutcome) &&
      resultTable(matchedOutcome!).some(
        (measurement) => measurement.denominatorCandidates.length > 1,
      ),
    'multiple_denominators_require_review',
  )
  add(
    Boolean(
      matchedOutcome?.analyses?.some((analysis) =>
        (analysis.groupIds ?? []).some((id) => !outcomeGroupIds.has(id)),
      ),
    ),
    'analysis_group_outside_selected_outcome',
  )
  add(
    Boolean(matchedOutcome) &&
      Object.values(recordedNumberChecks).some(
        (check) => check.absentFromSelectedOutcome.length > 0,
      ),
    'legacy_numbers_not_all_reconciled',
  )
  // This is deliberately never a publishable verdict: group assignment, exact formulation,
  // outcome mapping and clinical interpretation still need source-level editorial review.
  return {
    record: row.record,
    rowIndex: row.rowIndex,
    trialIdentifier,
    sourceUrl: trusted ? `https://clinicaltrials.gov/study/${trialIdentifier}` : undefined,
    sourceApiUrl: trusted
      ? `https://clinicaltrials.gov/api/v2/studies/${trialIdentifier}`
      : undefined,
    status: 'REVIEW_ONLY' as const,
    blockers,
    sourceStatus: {
      hasResults: trusted ? study!.hasResults === true : undefined,
      resultsFirstPostDate: trusted
        ? clean(protocol?.statusModule?.resultsFirstPostDateStruct?.date)
        : undefined,
      selectedOutcomeReportingStatus: clean(matchedOutcome?.reportingStatus),
    },
    condition: {
      candidatesAsRegistered: conditions,
      sourcePath: 'protocolSection.conditionsModule.conditions',
    },
    intervention: {
      candidatesAsRegistered: interventionEvidence,
      allArmsForReview: arms,
      sourcePath: 'protocolSection.armsInterventionsModule',
    },
    formulationAndRoute: {
      textAsRegistered: formRouteText || undefined,
      explicitForm: FORM.test(formRouteText),
      explicitRoute: ROUTE.test(formRouteText),
    },
    population: eligibility
      ? {
          sourcePath: 'protocolSection.eligibilityModule',
          sex: clean(eligibility.sex),
          minimumAge: clean(eligibility.minimumAge),
          maximumAge: clean(eligibility.maximumAge),
          healthyVolunteers: eligibility.healthyVolunteers,
          eligibilityCriteria: clean(eligibility.eligibilityCriteria),
          outcomePopulation: clean(matchedOutcome?.populationDescription),
        }
      : undefined,
    outcomeMatch: {
      selectedIndex: uniqueMatch ? best?.index : undefined,
      ranked: ranked.slice(0, 5).map((item) => ({
        index: item.index,
        type: item.outcome.type,
        title: item.outcome.title,
        score: item.score,
      })),
    },
    result: matchedOutcome
      ? {
          sourcePath: `resultsSection.outcomeMeasuresModule.outcomeMeasures[${best!.index}]`,
          type: clean(matchedOutcome.type),
          title: clean(matchedOutcome.title),
          timepoint: clean(matchedOutcome.timeFrame),
          unit: clean(matchedOutcome.unitOfMeasure),
          parameter: clean(matchedOutcome.paramType),
          dispersion: clean(matchedOutcome.dispersionType),
          groupCandidates,
          measurements: resultTable(matchedOutcome),
          analyses: (matchedOutcome.analyses ?? []).map((analysis, index) => ({
            sourcePath: `analyses[${index}]`,
            groupIds: analysis.groupIds ?? [],
            groupDescription: clean(analysis.groupDescription),
            estimateType: clean(analysis.paramType),
            estimate: clean(analysis.paramValue),
            confidenceLevel: clean(analysis.ciPctValue),
            lowerLimit: clean(analysis.ciLowerLimit),
            upperLimit: clean(analysis.ciUpperLimit),
            pValue: clean(analysis.pValue),
            pValueComment: clean(analysis.pValueComment),
            statisticalMethod: clean(analysis.statisticalMethod),
          })),
        }
      : undefined,
    legacyNumberChecks: recordedNumberChecks,
    reviewTasks: [
      'Confirm the exact registered condition and enrolled/analysed population.',
      'Confirm the tested product, dose, formulation and route from the same NCT source.',
      'Confirm the outcome row, module-local group IDs, comparator, timepoint and units.',
      'Reconcile each stored number and uncertainty with the selected posted outcome.',
      'Obtain clinical editorial approval before any publication or programme conclusion.',
    ],
  }
}

export async function fetchRegistryStudy(nct: string): Promise<RegistryStudy | null> {
  if (!NCT.test(nct)) return null
  const response = await fetch(`https://clinicaltrials.gov/api/v2/studies/${nct}`, {
    signal: AbortSignal.timeout(20_000),
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`ClinicalTrials.gov ${nct}: HTTP ${response.status}`)
  return (await response.json()) as RegistryStudy
}

async function main() {
  const args = process.argv.slice(2)
  const option = (flag: string) => {
    const at = args.indexOf(flag)
    return at >= 0 ? args[at + 1] : undefined
  }
  const sourcePath = option('--source') ?? 'data/recorded-background.ndjson'
  const studyDir = option('--study-dir')
  const outputPath = option('--output')
  const loaded = loadLegacyTrialRows(await readFile(sourcePath, 'utf8'))
  const studies = new Map<string, RegistryStudy | null>()
  const fetchErrors: { trialIdentifier: string; message: string }[] = []
  for (const nct of [
    ...new Set(loaded.rows.map((row) => row.trialIdentifier.toUpperCase())),
  ].sort()) {
    try {
      const study = studyDir
        ? (JSON.parse(await readFile(join(studyDir, `${nct}.json`), 'utf8')) as RegistryStudy)
        : await fetchRegistryStudy(nct)
      studies.set(nct, study)
    } catch (error) {
      studies.set(nct, null)
      fetchErrors.push({
        trialIdentifier: nct,
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }
  const candidates = loaded.rows.map((row) =>
    buildTrialReviewCandidate(row, studies.get(row.trialIdentifier.toUpperCase()) ?? null),
  )
  const report = {
    generatedAt: new Date().toISOString(),
    sourcePath,
    registry: 'ClinicalTrials.gov API v2',
    status: 'REVIEW_ONLY',
    summary: {
      registryRows: candidates.length,
      excludedNonRegistryRows: loaded.excludedNonRegistry,
      uniqueRegistryStudies: studies.size,
      fetchErrors: fetchErrors.length,
      rowsWithBlockers: candidates.filter((candidate) => candidate.blockers.length > 0).length,
      blockers: Object.fromEntries(
        [...new Set(candidates.flatMap((candidate) => candidate.blockers))]
          .sort()
          .map((code) => [
            code,
            candidates.filter((candidate) => candidate.blockers.includes(code)).length,
          ]),
      ),
    },
    fetchErrors,
    candidates,
  }
  const json = JSON.stringify(report, null, 2) + '\n'
  if (outputPath) await writeFile(outputPath, json)
  else process.stdout.write(json)
}

if (process.argv[1]?.endsWith('trial-candidate-queue.ts')) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
