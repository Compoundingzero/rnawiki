/**
 * Peer-group anomaly screen over recorded pharmacokinetic values.
 *
 * A recorded number is easy to check against its own source excerpt and hard to check against the
 * rest of the corpus. This agent does the second thing: it takes each recorded half-life,
 * bioavailability, time to peak concentration, protein binding and volume of distribution, places
 * it beside the other recorded values that share its peer group, and reports how far out it sits as
 * a conformal p-value. What comes out is a reading queue, ordered, with the expected number of
 * chance flags attached to it.
 *
 * THREE THINGS THIS DOES NOT DO, each of which it would be easy to slide into.
 *
 * It does not decide that a value is mistaken. Being far from the other recorded values in a group
 * is a fact about where a number sits in the corpus, and nothing more. Lanthanum carbonate's
 * recorded bioavailability really is 0.002%, because the compound is built not to be absorbed;
 * risedronate's recorded terminal half-life really is 561 hours, because bisphosphonates deposit in
 * bone and leave it slowly. Both are as extreme as anything a mis-read label would produce, and
 * both are exactly what their sources state. Every flag here therefore says only "worth a human
 * look", and the flag's own text says so too, so a reader who sees the row without the caveats
 * still reads it correctly.
 *
 * It does not compare across units. Each quantity is screened once per recorded unit, so a volume
 * of distribution recorded in L is never placed beside one recorded in L/kg. Those are two
 * different quantities that share a name, and a single screen over both would manufacture flags out
 * of the unit alone.
 *
 * It does not put a value on the scale that the sources did not put there. A display-only value
 * ("about five days", with no hour figure parsed from the source sentence) is counted in the
 * exclusions and never scored. Nothing is filled in, interpolated or carried over from a peer.
 */

import {
  logScaleNonconformity,
  minimumCalibrationSize,
  mondrianConformal,
} from '@/lib/agents/core/conformal'
import { robustSummary } from '@/lib/agents/core/statistics'
import type {
  AgentCorpusEntry,
  AgentInput,
  AgentRun,
  DatasetAgent,
  ReviewCandidate,
} from '@/lib/agents/core/types'
import type { BackgroundSourceKind, RecordedPharmacokinetics } from '@/lib/background/types'

/** The recorded pharmacokinetic quantities that carry a parsed number often enough to screen. */
export const SCREENED_FIELDS = [
  'halfLife',
  'bioavailability',
  'tMax',
  'proteinBinding',
  'volumeOfDistribution',
] as const
export type ScreenedField = (typeof SCREENED_FIELDS)[number]

/** Reader-facing name for each screened quantity, used in every sentence this agent emits. */
const FIELD_LABELS: Record<ScreenedField, string> = {
  halfLife: 'half-life',
  bioavailability: 'bioavailability',
  tMax: 'time to peak recorded concentration',
  proteinBinding: 'protein binding',
  volumeOfDistribution: 'volume of distribution',
}

/**
 * Selection threshold. At 0.05 a peer group needs 20 recorded values before any member of it can
 * be flagged at all, which is the resolution limit the conformal module reports rather than hides.
 */
const ALPHA = 0.05

const AGENT_NAME = 'peer-group-anomaly-screen'
const AGENT_VERSION = '1.0.0'

export interface PeerAnomalySourceRef {
  kind: BackgroundSourceKind
  identifier: string
  retrievedAt: string
  /** The fetched wording the number was read out of, when the record carries one. */
  excerpt?: string
}

/** One recorded value entering the screen, carrying everything a reviewer needs to check it. */
export interface ScreenedRecordedValue {
  slug: string
  name: string
  field: ScreenedField
  unit: string
  numeric: number
  /** Exactly as recorded, e.g. "165 to 184 hours". */
  display: string
  populationContext: string
  group: string
  source: PeerAnomalySourceRef
}

export interface PeerGroupSummary {
  group: string
  size: number
  /** Members available to calibrate each other, i.e. size - 1. */
  calibrationSize: number
  /** Smallest p-value this group can produce, 1/(size). */
  resolutionLimit: number
  /** True when the group cannot reach `alpha` and so can never contribute a flag. */
  underpowered: boolean
  /** Summary of the recorded values in the group. Not an expected value for anything. */
  medianOfRecordedValues: number
  p25OfRecordedValues: number
  p75OfRecordedValues: number
}

export interface PeerAnomalyFlag {
  slug: string
  name: string
  field: ScreenedField
  fieldLabel: string
  unit: string
  display: string
  numeric: number
  populationContext: string
  group: string
  groupSize: number
  calibrationSize: number
  resolutionLimit: number
  /** Super-uniform under exchangeability; see lib/agents/core/conformal.ts. */
  pValue: number
  /** Robust log-scale distance from the group's median recorded value. */
  nonconformity: number
  medianOfRecordedGroupValues: number
  positionRelativeToGroupMedian: 'above' | 'below' | 'at'
  source: PeerAnomalySourceRef
  /** The sentence a reader sees beside the row, written so the row cannot be over-read. */
  note: string
}

/** One (quantity, unit) screen. Two units of the same quantity are two separate screens. */
export interface ScreenedQuantityResult {
  field: ScreenedField
  fieldLabel: string
  unit: string
  /** `${field}|${unit}`, the identity of this screen. */
  screenKey: string
  valuesScreened: number
  medicinesScreened: number
  groupCount: number
  alpha: number
  testCount: number
  /** How many flags would be expected here by chance if every recorded value were ordinary. */
  expectedFalseFlags: number
  falseDiscoveryControl: { achievable: boolean; bhSelected: number; explanation: string }
  /** True when at least one group reaches the resolution needed for a flag. */
  powered: boolean
  groups: readonly PeerGroupSummary[]
  underpoweredGroups: readonly { group: string; size: number; resolutionLimit: number }[]
  flags: readonly PeerAnomalyFlag[]
}

export interface PeerGroupAnomalyScreen {
  /** What defined a peer group in this run, stated because the choice changes every p-value. */
  groupingBasis: string
  quantities: readonly ScreenedQuantityResult[]
  totals: {
    valuesScreened: number
    testCount: number
    flagCount: number
    expectedFalseFlags: number
    underpoweredGroupCount: number
  }
  excluded: {
    medicinesWithoutPharmacokinetics: number
    displayOnlyValues: number
    valuesWithoutRecordedUnit: number
  }
}

/**
 * Peer group key from the recorded route.
 *
 * Only text normalisation happens here: lower case, and the parenthetical or clause-level detail a
 * label appends is dropped so that "Oral (film-coated tablets)" and "Oral" are one group. That
 * merge is the price of having groups large enough to reach the resolution limit at all, and it is
 * declared in the caveats because it puts an extended-release formulation beside an immediate one.
 */
function routePeerGroup(routeAsRecorded: string): string {
  const head = routeAsRecorded.split(/[(,;]/u)[0] ?? ''
  const normalized = head.trim().toLowerCase().replace(/\s+/gu, ' ')
  return normalized.length > 0 ? normalized : 'route not recorded'
}

/** Short numeric rendering for sentences, stable across runs because it never depends on locale. */
function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return 'not available'
  const magnitude = Math.abs(value)
  if (magnitude >= 100) return value.toFixed(0)
  if (magnitude >= 1) return value.toFixed(1)
  if (magnitude >= 0.01) return value.toFixed(3)
  return value.toExponential(2)
}

function collectScreenedValues(entry: AgentCorpusEntry): {
  values: ScreenedRecordedValue[]
  displayOnly: number
  missingUnit: number
} {
  const pharmacokinetics: RecordedPharmacokinetics | undefined = entry.background.pharmacokinetics
  if (!pharmacokinetics) return { values: [], displayOnly: 0, missingUnit: 0 }

  const group = routePeerGroup(pharmacokinetics.routeAsRecorded)
  const values: ScreenedRecordedValue[] = []
  let displayOnly = 0
  let missingUnit = 0

  for (const field of SCREENED_FIELDS) {
    const recorded = pharmacokinetics[field]
    if (!recorded) continue
    if (recorded.numeric === undefined || !Number.isFinite(recorded.numeric)) {
      displayOnly += 1
      continue
    }
    // A number with no recorded unit cannot be shown to be the same quantity as its peers, and
    // guessing the unit from the field name is exactly the assumption this screen must not make.
    if (recorded.unit === undefined || recorded.unit.trim().length === 0) {
      missingUnit += 1
      continue
    }
    values.push({
      slug: entry.slug,
      name: entry.name,
      field,
      unit: recorded.unit,
      numeric: recorded.numeric,
      display: recorded.display,
      populationContext: recorded.populationContext,
      group,
      source: {
        kind: recorded.source.kind,
        identifier: recorded.source.identifier,
        retrievedAt: recorded.source.retrievedAt,
        ...(recorded.source.excerpt ? { excerpt: recorded.source.excerpt } : {}),
      },
    })
  }

  return { values, displayOnly, missingUnit }
}

function screenOneQuantity(
  field: ScreenedField,
  unit: string,
  values: readonly ScreenedRecordedValue[],
): ScreenedQuantityResult {
  const fieldLabel = FIELD_LABELS[field]
  const byGroup = new Map<string, ScreenedRecordedValue[]>()
  for (const value of values) {
    const existing = byGroup.get(value.group)
    if (existing) existing.push(value)
    else byGroup.set(value.group, [value])
  }

  const scored: Array<{ item: ScreenedRecordedValue; score: number }> = []
  const groupSummaries: PeerGroupSummary[] = []
  const groupMedians = new Map<string, number>()
  const required = minimumCalibrationSize(ALPHA)

  const orderedGroups = [...byGroup.entries()].sort((left, right) =>
    left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0,
  )

  for (const [group, members] of orderedGroups) {
    const numerics = members.map((member) => member.numeric)
    // The scale is estimated from the same values being screened, which is safe only because the
    // estimator is a median absolute deviation: half the group would have to be extreme before the
    // reference point moved to meet it.
    const nonconformity = logScaleNonconformity(numerics)
    for (const member of members) {
      scored.push({ item: member, score: nonconformity(member.numeric) })
    }
    const summary = robustSummary(numerics)
    if (summary) {
      groupMedians.set(group, summary.median)
      groupSummaries.push({
        group,
        size: members.length,
        calibrationSize: members.length - 1,
        resolutionLimit: 1 / members.length,
        underpowered: members.length - 1 < required,
        medianOfRecordedValues: summary.median,
        p25OfRecordedValues: summary.p25,
        p75OfRecordedValues: summary.p75,
      })
    }
  }

  const result = mondrianConformal(scored, (item) => item.group, ALPHA)

  const flags: PeerAnomalyFlag[] = result.flagged.map((flag) => {
    const groupMedian = groupMedians.get(flag.group) ?? Number.NaN
    const position =
      flag.item.numeric > groupMedian ? 'above' : flag.item.numeric < groupMedian ? 'below' : 'at'
    return {
      slug: flag.item.slug,
      name: flag.item.name,
      field,
      fieldLabel,
      unit,
      display: flag.item.display,
      numeric: flag.item.numeric,
      populationContext: flag.item.populationContext,
      group: flag.group,
      groupSize: flag.calibrationSize + 1,
      calibrationSize: flag.calibrationSize,
      resolutionLimit: flag.resolutionLimit,
      pValue: flag.pValue,
      nonconformity: flag.score,
      medianOfRecordedGroupValues: groupMedian,
      positionRelativeToGroupMedian: position,
      source: flag.item.source,
      note: `This recorded ${fieldLabel} sits far from the other ${flag.calibrationSize + 1} recorded ${fieldLabel} values in the ${flag.group} peer group and is worth a human look. A value at the edge of a group is often precisely what its source states.`,
    }
  })

  // Ties in p-value are common in small groups, so the slug breaks them and the ordering of the
  // queue does not depend on the order the corpus happened to be iterated in.
  flags.sort(
    (left, right) =>
      left.pValue - right.pValue ||
      right.nonconformity - left.nonconformity ||
      (left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0),
  )

  return {
    field,
    fieldLabel,
    unit,
    screenKey: `${field}|${unit}`,
    valuesScreened: values.length,
    medicinesScreened: new Set(values.map((value) => value.slug)).size,
    groupCount: byGroup.size,
    alpha: ALPHA,
    testCount: result.testCount,
    expectedFalseFlags: result.expectedFalseFlags,
    falseDiscoveryControl: {
      achievable: result.falseDiscoveryControl.achievable,
      bhSelected: result.falseDiscoveryControl.bhSelected,
      explanation: result.falseDiscoveryControl.explanation,
    },
    powered: groupSummaries.some((summary) => !summary.underpowered),
    groups: groupSummaries,
    underpoweredGroups: result.underpoweredGroups
      .map((group) => ({
        group: group.group,
        size: group.size,
        resolutionLimit: group.resolutionLimit,
      }))
      .sort((left, right) => (left.group < right.group ? -1 : left.group > right.group ? 1 : 0)),
    flags,
  }
}

/**
 * How the flag count compares with the count expected by chance.
 *
 * Conformal p-values are discrete and conservative, so a screen can select fewer values than the
 * threshold would nominally allow. When that happens the flag list carries no aggregate signal at
 * all, and a reader who is not told so will read a list of 96 records as 96 problems.
 */
function chanceComparison(flagCount: number, expectedFalseFlags: number): string {
  return flagCount > expectedFalseFlags
    ? 'More values were selected than chance alone accounts for, but which particular ones are the chance flags is not knowable from the screen, so each still needs a person to read it against its source.'
    : 'That figure is at least as large as the number of values actually selected, so the flag list as a whole cannot be told apart from chance. Read it as an order in which to read records, not as a set of findings.'
}

function reviewCandidate(flag: PeerAnomalyFlag, expectedFalseFlags: number): ReviewCandidate {
  const direction =
    flag.positionRelativeToGroupMedian === 'at'
      ? 'at the median of'
      : `${flag.positionRelativeToGroupMedian} the median of`
  return {
    slug: flag.slug,
    reason: 'UNUSUAL_FOR_PEER_GROUP',
    // A question about the record, answerable by reading the source sentence beside it. It asks
    // what the source says, never what the value ought to be.
    question: `Recorded ${flag.fieldLabel} for ${flag.name} is "${flag.display}", with the population context recorded as "${flag.populationContext}". It sits ${direction} the ${flag.groupSize} recorded ${flag.fieldLabel} values in the ${flag.group} peer group. Does the fetched excerpt on this record state this figure, in this unit, for this population, and is the ${flag.group} group the right set of recorded values to read it beside?`,
    priority: 1 - flag.pValue,
    basis: `Group-conditional split-conformal p-value ${flag.pValue.toFixed(4)} within the ${flag.group} peer group, from ${flag.calibrationSize} calibration values whose smallest reachable p-value is ${flag.resolutionLimit.toFixed(4)}. The recorded value is ${formatNumber(flag.numeric)} ${flag.unit} against a group median of ${formatNumber(flag.medianOfRecordedGroupValues)} ${flag.unit}. About ${expectedFalseFlags.toFixed(1)} flags in this screen are expected to look this unusual by chance alone.`,
    sources: [`${flag.source.kind} ${flag.source.identifier}`],
  }
}

/**
 * Screens recorded pharmacokinetic values against their peer group and routes the far-out ones to
 * a person, with the p-value and the expected number of chance flags attached.
 */
export const peerAnomalyAgent: DatasetAgent<PeerGroupAnomalyScreen> = {
  name: AGENT_NAME,
  version: AGENT_VERSION,
  description:
    'Finds recorded pharmacokinetic values that sit far from the other recorded values in their peer group, and queues each one for a person to read against its source.',

  run(input: AgentInput): AgentRun<PeerGroupAnomalyScreen> {
    const buckets = new Map<
      string,
      { field: ScreenedField; unit: string; values: ScreenedRecordedValue[] }
    >()
    let medicinesWithoutPharmacokinetics = 0
    let displayOnlyValues = 0
    let valuesWithoutRecordedUnit = 0
    const contributing = new Set<string>()

    for (const entry of input.corpus) {
      if (!entry.background.pharmacokinetics) medicinesWithoutPharmacokinetics += 1
      const collected = collectScreenedValues(entry)
      displayOnlyValues += collected.displayOnly
      valuesWithoutRecordedUnit += collected.missingUnit
      for (const value of collected.values) {
        contributing.add(value.slug)
        const key = `${value.field}|${value.unit}`
        const bucket = buckets.get(key)
        if (bucket) bucket.values.push(value)
        else buckets.set(key, { field: value.field, unit: value.unit, values: [value] })
      }
    }

    const quantities: ScreenedQuantityResult[] = []
    for (const field of SCREENED_FIELDS) {
      const forField = [...buckets.values()]
        .filter((bucket) => bucket.field === field)
        .sort((left, right) => (left.unit < right.unit ? -1 : left.unit > right.unit ? 1 : 0))
      for (const bucket of forField) {
        quantities.push(screenOneQuantity(bucket.field, bucket.unit, bucket.values))
      }
    }

    const queue: ReviewCandidate[] = quantities
      .flatMap((quantity) =>
        quantity.flags.map((flag) => reviewCandidate(flag, quantity.expectedFalseFlags)),
      )
      .sort(
        (left, right) =>
          right.priority - left.priority ||
          (left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0),
      )

    const totals = {
      valuesScreened: quantities.reduce((sum, quantity) => sum + quantity.valuesScreened, 0),
      testCount: quantities.reduce((sum, quantity) => sum + quantity.testCount, 0),
      flagCount: quantities.reduce((sum, quantity) => sum + quantity.flags.length, 0),
      expectedFalseFlags: quantities.reduce(
        (sum, quantity) => sum + quantity.expectedFalseFlags,
        0,
      ),
      underpoweredGroupCount: quantities.reduce(
        (sum, quantity) => sum + quantity.underpoweredGroups.length,
        0,
      ),
    }

    const groupingBasis =
      'A peer group is the recorded route of administration, lower-cased with any parenthetical or clause-level detail dropped. A mechanism-class grouping exists in the tree only as a clustering agent that has to be run to produce one, so taking it would make every p-value here depend on the seed, cluster count and version of another agent, and would narrow the screen to records carrying mechanism text as well as a number.'

    const caveats: string[] = [
      `${groupingBasis} Two records share a group because they state the same route, which is a weaker resemblance than a shared mechanism and puts, for example, an extended-release oral record beside an immediate-release one.`,
      `A flag marks a recorded value that sits far from the other recorded values in its group. It is a pointer to read the source excerpt beside the value, never a judgement about the medicine, the value or the source that carries it.`,
      `Sitting far from a peer group says nothing about whether a value is faithful to its source. This corpus holds recorded values that are extreme and also exactly what their sources print — a recorded bioavailability of 0.002% and a recorded terminal half-life of 561 hours both appear here, and each matches the excerpt stored beside it. A flag asks a reviewer to read that excerpt; a value that matches it has been confirmed, not faulted.`,
      `This run performed ${totals.testCount} tests at a threshold of ${ALPHA} and selected ${totals.flagCount} values. If every recorded value were exactly what its source states, about ${totals.expectedFalseFlags.toFixed(1)} would still be expected to look this unusual purely by chance. ${chanceComparison(totals.flagCount, totals.expectedFalseFlags)}`,
      `Each quantity is screened once per recorded unit, so values recorded in L are never placed beside values recorded in L/kg, and neither are hours beside minutes. Those pairs share a name and are not the same quantity.`,
      `${totals.underpoweredGroupCount} peer groups across all screens hold fewer than ${minimumCalibrationSize(ALPHA) + 1} recorded values and so cannot produce a p-value at or below ${ALPHA} however far out a member sits. Their silence is a limit of the screen, not a statement about those records.`,
      `${displayOnlyValues} recorded values for these quantities carry no parsed number and were left out entirely; a value that reads "about five days" with no hour figure never becomes a coordinate. A further ${valuesWithoutRecordedUnit} carried a number with no recorded unit and were left out for the same reason.`,
      `Peer values were measured in different populations and study conditions — single dose, healthy adults, renal impairment — and the population context is carried on every row but is not part of the grouping. A value can sit far out because its population context differs from its group's. On extracted records that context is usually the parser's own phrase rather than a described population, so for most rows it tells a reviewer where to look rather than what was measured.`,
      `A value the source states as a range is compared using the first number it prints, which is the low end of that range. A row whose display shows a range is therefore positioned by its lower bound, and a reviewer reading the row against a group median should read the display rather than the position.`,
      `A recorded value at or below zero cannot be placed on the log scale used for the distance and is scored as maximally unusual rather than dropped. That does not guarantee it is flagged: several such values in one group tie at the same score, and a tie at the top of a small group can still leave every one of them above the threshold.`,
      `The screen has no randomised step, so the recorded seed ${input.seed} does not change its output.`,
    ]

    for (const quantity of quantities) {
      if (!quantity.powered) continue
      caveats.push(
        `${quantity.fieldLabel} recorded in ${quantity.unit}: ${quantity.falseDiscoveryControl.explanation}`,
      )
    }

    return {
      agent: AGENT_NAME,
      version: AGENT_VERSION,
      runDate: input.runDate,
      seed: input.seed,
      parameters: {
        alpha: ALPHA,
        grouping: 'recorded-route',
        unitSplit: true,
        nonconformity: 'log-scale median absolute deviation',
        minimumGroupSizeForAFlag: minimumCalibrationSize(ALPHA) + 1,
      },
      coverage: {
        considered: input.corpus.length,
        used: contributing.size,
        reason: `A medicine enters the screen once it records at least one of ${SCREENED_FIELDS.length} pharmacokinetic quantities with both a parsed number and a unit. ${medicinesWithoutPharmacokinetics} records carry no pharmacokinetics module at all, and a record with the module may still record none of these five quantities numerically.`,
      },
      output: {
        groupingBasis,
        quantities,
        totals,
        excluded: {
          medicinesWithoutPharmacokinetics,
          displayOnlyValues,
          valuesWithoutRecordedUnit,
        },
      },
      queue,
      caveats,
    }
  },
}
