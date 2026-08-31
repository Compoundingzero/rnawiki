/**
 * Recorded numeric distributions: what the corpus's parsed pharmacokinetic and molecular numbers
 * actually look like, globally and inside the strata that could plausibly explain their spread.
 *
 * WHAT THIS DATASET IS ABOUT. Every number here is a RECORDED VALUE — a figure a person or a
 * parser read out of a named source document and stored beside the sentence it came from. The unit
 * of analysis is the recorded value, not the medicine and not the patient population the value was
 * measured in. A median recorded half-life is therefore a fact about what labels state, shaped
 * before anything else by which medicines happen to have a label with a pharmacokinetics section
 * structured into this corpus. It is not a central tendency of medicines, of molecules or of
 * people, and no percentile in this output is typical, normal or expected for any medicine.
 *
 * WHY STRATIFY AT ALL. A single global histogram of recorded half-lives invites the reader to
 * treat its centre as a norm. Splitting the same values by recorded route and by provenance tier
 * makes the composition visible instead: the tail is largely one route, and the two tiers are two
 * differently-selected bodies of work rather than two samples of one thing. Both are checkable
 * questions about the corpus, which is the only kind of question this agent answers.
 *
 * THE UNIT RULE, WHICH IS NOT NEGOTIABLE. Volume of distribution is recorded either in litres or
 * in litres per kilogram. These are different quantities: converting between them needs a body
 * weight no source stated, so the corpus never converts and neither does this agent. They are
 * published as two separate distributions with two separate units, and a stratum of one can never
 * contain a value of the other. The same rule handles the handful of tMax values recorded in
 * minutes or days: they are excluded from the hours distribution, counted, and named, rather than
 * silently rescaled into it.
 *
 * DISPLAY-ONLY VALUES ARE PART OF THE ANSWER. A source that prints "about five days" with no hour
 * figure is recorded faithfully as text with no parsed number. Such a value can never be a
 * coordinate or a statistic, so it is absent from every summary here — but its count is published
 * beside the summary, because a distribution over 690 of 835 recorded half-lives means something
 * different from a distribution over all of them, and the reader cannot tell which they are
 * looking at unless both numbers are printed.
 */

import type {
  BackgroundProvenanceTier,
  MedicineRecordedBackground,
  RecordedValue,
} from '@/lib/background/types'
import {
  medianAbsoluteDeviation,
  robustSummary,
  type RobustSummary,
} from '@/lib/agents/core/statistics'
import type { AgentCorpusEntry, AgentInput, AgentRun, DatasetAgent } from '@/lib/agents/core/types'

/* ------------------------------------------------------------------------------------------- */
/* The fields, and the units each one is allowed to hold                                        */
/* ------------------------------------------------------------------------------------------- */

/** The slot a recorded value was read from. One slot may publish more than one distribution. */
export const NUMERIC_SOURCE_FIELDS = [
  'halfLife',
  'tMax',
  'bioavailability',
  'proteinBinding',
  'volumeOfDistribution',
  'molecularWeight',
] as const
export type NumericSourceField = (typeof NUMERIC_SOURCE_FIELDS)[number]

/** Binning scale. Stated per distribution together with the reason it was chosen. */
export type DistributionScale = 'log10' | 'linear'

/** Which of a value's attributes a set of strata is cut on. */
export const STRATUM_DIMENSIONS = ['route', 'provenanceTier'] as const
export type StratumDimension = (typeof STRATUM_DIMENSIONS)[number]

interface UnitSpec {
  /** The unit string a recorded value must carry exactly to enter this distribution. */
  unit: string
  label: string
  scale: DistributionScale
  /** Fixed bounds for a quantity whose scale is fixed by its definition rather than by the data. */
  fixedBounds?: { lower: number; upper: number }
  bins: number
}

interface FieldSpec {
  field: NumericSourceField
  label: string
  /** Every distribution this slot publishes, one per accepted unit, never merged. */
  units: readonly UnitSpec[]
  /** Whether a value in this slot carries a recorded route it can be stratified by. */
  routeAvailable: boolean
}

/**
 * Percentage bins are ten points wide over the full 0-100 range rather than over the observed
 * range, because the endpoints of a percentage are properties of the quantity and not of this
 * corpus. A reader can then compare two strata's histograms bin for bin without checking whether
 * the axes match.
 */
const PERCENT_BINS = 10

/**
 * Twelve bins for the log-scale quantities. Enough to show a second mode where one exists in the
 * larger fields, few enough that the smallest reportable stratum still has roughly one value per
 * bin on average rather than a row of zeroes and ones read as structure.
 */
const LOG_BINS = 12

const FIELD_SPECS: readonly FieldSpec[] = [
  {
    field: 'halfLife',
    label: 'Recorded elimination half-life',
    routeAvailable: true,
    units: [{ unit: 'hours', label: 'hours', scale: 'log10', bins: LOG_BINS }],
  },
  {
    field: 'tMax',
    label: 'Recorded time to maximum concentration',
    routeAvailable: true,
    units: [{ unit: 'hours', label: 'hours', scale: 'log10', bins: LOG_BINS }],
  },
  {
    field: 'bioavailability',
    label: 'Recorded bioavailability',
    routeAvailable: true,
    units: [
      {
        unit: '%',
        label: 'percent',
        scale: 'linear',
        fixedBounds: { lower: 0, upper: 100 },
        bins: PERCENT_BINS,
      },
    ],
  },
  {
    field: 'proteinBinding',
    label: 'Recorded plasma protein binding',
    routeAvailable: true,
    units: [
      {
        unit: '%',
        label: 'percent',
        scale: 'linear',
        fixedBounds: { lower: 0, upper: 100 },
        bins: PERCENT_BINS,
      },
    ],
  },
  {
    field: 'volumeOfDistribution',
    label: 'Recorded volume of distribution',
    routeAvailable: true,
    // Two distributions, never one. See the unit rule in the file header.
    units: [
      { unit: 'L', label: 'litres', scale: 'log10', bins: LOG_BINS },
      { unit: 'L/kg', label: 'litres per kilogram', scale: 'log10', bins: LOG_BINS },
    ],
  },
  {
    field: 'molecularWeight',
    label: 'Recorded molecular weight',
    // Molecular weight is recorded on molecular identity, which carries no route: the number is a
    // property of the substance as the source's description section prints it.
    routeAvailable: false,
    // Three units, screened separately and never converted between. Labels print a protein's weight
    // in kilodaltons and a small molecule's in grams per mole, and the same number means a thousand
    // times more in one than the other. Recording the unit the label printed is what keeps the
    // number identical to the excerpt beneath it; screening per unit is what keeps the two scales
    // out of one histogram.
    units: [
      { unit: 'g/mol', label: 'grams per mole', scale: 'log10', bins: LOG_BINS },
      { unit: 'kDa', label: 'kilodaltons', scale: 'log10', bins: LOG_BINS },
      { unit: 'Da', label: 'daltons', scale: 'log10', bins: LOG_BINS },
    ],
  },
]

/**
 * Values a group must hold before it is published as a stratum of its own.
 *
 * Below roughly a dozen values a quartile is a statement about two or three records, and a
 * twelve-bin histogram is mostly empty. Suppressed groups are counted rather than dropped, so the
 * reader can see how much of the field sits outside the reported strata.
 */
export const MINIMUM_STRATUM_SIZE = 12

/* ------------------------------------------------------------------------------------------- */
/* Output shape                                                                                 */
/* ------------------------------------------------------------------------------------------- */

export interface HistogramBin {
  lowerBound: number
  upperBound: number
  /** True on the final bin only, which includes its upper bound so the largest value is counted. */
  upperInclusive: boolean
  count: number
}

/**
 * Multiplicative spread, reported only for log-scale distributions.
 *
 * The median absolute deviation of the raw values is close to meaningless for a quantity spanning
 * orders of magnitude, because it is dominated by whichever end of the range the median sits
 * nearer. The MAD of the base-10 logarithm is not, and exponentiating it gives a factor that can
 * be compared across strata whose medians differ by a thousandfold.
 */
export interface LogSpread {
  medianAbsoluteDeviationLog10: number
  /** Ten raised to the MAD of the logarithms: a factor, not an interval. */
  spreadFactor: number
}

export interface DistributionStratum {
  dimension: StratumDimension | 'overall'
  /** The grouping key exactly as it was formed, e.g. `oral` or `curated`. */
  key: string
  label: string
  summary: RobustSummary
  /** Bins share the field's corpus-wide edges, so two strata can be read against each other. */
  histogram: readonly HistogramBin[]
  logSpread?: LogSpread
}

export interface StratifiedDistributions {
  dimension: StratumDimension
  strata: readonly DistributionStratum[]
  /** Numeric values in groups holding fewer than `MINIMUM_STRATUM_SIZE` values. */
  valuesBelowMinimum: number
  groupsBelowMinimum: number
  /** Numeric values carrying no key on this dimension at all. */
  valuesWithoutKey: number
  note: string
}

/** Numeric values recorded in a unit this distribution does not accept, kept apart and named. */
export interface OffUnitTally {
  unit: string
  count: number
}

export interface FieldUnitDistribution {
  field: NumericSourceField
  unit: string
  label: string
  scale: DistributionScale
  /** Why this scale, stated from the recorded values themselves rather than asserted. */
  scaleReason: string
  /** Shared bin edges, ascending, length is bin count plus one. */
  binEdges: readonly number[]
  overall: DistributionStratum | null
  byRoute: StratifiedDistributions
  byProvenanceTier: StratifiedDistributions
}

/**
 * Everything the corpus records in one field slot: the distributions it can support, and the
 * values it holds that no distribution can use.
 */
export interface NumericFieldGroup {
  field: NumericSourceField
  label: string
  /** Every recorded value in this slot, whatever its unit or form. The denominator. */
  recordedValues: number
  /** Values carrying a parsed number, whatever the unit. */
  numericValues: number
  /**
   * Values recorded as displayed text with no parsed number. Absent from every summary below and
   * published here, because the gap between this and `recordedValues` is what the summaries omit.
   */
  displayOnlyValues: number
  /** Numeric values whose unit no distribution accepts. Never converted into one. */
  offUnitValues: readonly OffUnitTally[]
  offUnitValueCount: number
  distributions: readonly FieldUnitDistribution[]
}

export interface RecordedNumericDistributions {
  fields: readonly NumericFieldGroup[]
  /** Route keys large enough to be published as strata, in the order they are reported. */
  reportedRoutes: readonly string[]
  minimumStratumSize: number
  /** Records contributing at least one numeric value to at least one distribution. */
  recordsWithAnyNumericValue: number
}

/* ------------------------------------------------------------------------------------------- */
/* Collection                                                                                   */
/* ------------------------------------------------------------------------------------------- */

interface CollectedValue {
  slug: string
  value: RecordedValue
  /** Recorded route text, normalised; absent for values whose slot carries no route. */
  route: string | null
  tier: BackgroundProvenanceTier
}

/**
 * Route text as the source stated it, lower-cased with surrounding and repeated whitespace
 * removed. Nothing else is done to it: mapping `oral (tablets)` onto `oral` would be a judgement
 * that the two labels describe the same thing, which is the source's distinction to make.
 */
export function normaliseRoute(raw: string): string {
  return raw.trim().replace(/\s+/gu, ' ').toLowerCase()
}

/**
 * The tier a value was recorded at. A value states its own tier where it has one; otherwise the
 * record's tier applies, and a record with neither is hand-authored, which is what `curated` means.
 */
function resolveTier(
  value: RecordedValue,
  background: MedicineRecordedBackground,
): BackgroundProvenanceTier {
  return value.provenanceTier ?? background.provenanceTier ?? 'curated'
}

function readSlot(
  background: MedicineRecordedBackground,
  field: NumericSourceField,
): RecordedValue | undefined {
  switch (field) {
    case 'halfLife':
      return background.pharmacokinetics?.halfLife
    case 'tMax':
      return background.pharmacokinetics?.tMax
    case 'bioavailability':
      return background.pharmacokinetics?.bioavailability
    case 'proteinBinding':
      return background.pharmacokinetics?.proteinBinding
    case 'volumeOfDistribution':
      return background.pharmacokinetics?.volumeOfDistribution
    case 'molecularWeight':
      return background.molecularIdentity?.molecularWeight
  }
}

function collectField(
  corpus: readonly AgentCorpusEntry[],
  spec: FieldSpec,
): readonly CollectedValue[] {
  const collected: CollectedValue[] = []
  for (const entry of corpus) {
    const value = readSlot(entry.background, spec.field)
    if (!value) continue
    const rawRoute = entry.background.pharmacokinetics?.routeAsRecorded
    collected.push({
      slug: entry.slug,
      value,
      route: spec.routeAvailable && rawRoute ? normaliseRoute(rawRoute) : null,
      tier: resolveTier(value, entry.background),
    })
  }
  // Slug order, so the collection step contributes nothing to the result beyond its contents.
  return collected.sort((left, right) => left.slug.localeCompare(right.slug))
}

/** A value enters a distribution only with a finite number and exactly the declared unit. */
function isUsable(entry: CollectedValue, unit: string): boolean {
  return (
    typeof entry.value.numeric === 'number' &&
    Number.isFinite(entry.value.numeric) &&
    entry.value.unit === unit
  )
}

function hasNumber(entry: CollectedValue): boolean {
  return typeof entry.value.numeric === 'number' && Number.isFinite(entry.value.numeric)
}

/**
 * V8 delegates transcendental functions such as log10 and exponentiation to its host math
 * implementation. Adjacent Node releases can therefore differ by one final binary digit even
 * when the inputs are identical. Those machine-level differences have no meaning in a corpus
 * distribution, but they do change JSON bytes and their audit digests. Publish fourteen
 * significant decimal digits so the same recorded corpus has one portable representation.
 */
function portableFloat(value: number): number {
  if (!Number.isFinite(value) || value === 0) return value
  return Number(value.toPrecision(14))
}

/* ------------------------------------------------------------------------------------------- */
/* Binning                                                                                      */
/* ------------------------------------------------------------------------------------------- */

/**
 * Bin edges for one distribution, computed once from all of its values and then reused by every
 * stratum of it.
 *
 * Per-stratum edges would make two histograms of the same field incomparable, which defeats the
 * only reason to stratify. Because each stratum is a subset of the whole, edges spanning the whole
 * necessarily span every stratum, which is also what makes the bin counts sum to the stratum size.
 */
export function computeBinEdges(values: readonly number[], spec: UnitSpec): number[] {
  if (spec.fixedBounds) {
    return linearEdges(spec.fixedBounds.lower, spec.fixedBounds.upper, spec.bins)
  }
  const finite = values.filter((value) => Number.isFinite(value))
  if (finite.length === 0) return []
  const lowest = Math.min(...finite)
  const highest = Math.max(...finite)
  if (spec.scale === 'linear' || !(lowest > 0)) {
    // A non-positive value has no logarithm. The corpus holds none in these fields, but a scale
    // choice that silently drops values if one ever appeared would be worse than a wider axis.
    return linearEdges(lowest, highest, spec.bins)
  }
  if (lowest === highest) return [lowest, highest]
  const lowerLog = Math.log10(lowest)
  const upperLog = Math.log10(highest)
  const edges: number[] = []
  for (let index = 0; index <= spec.bins; index += 1) {
    edges.push(portableFloat(10 ** (lowerLog + ((upperLog - lowerLog) * index) / spec.bins)))
  }
  // Rounding in the exponentiation can land the outer edges a hair inside the data; pinning them
  // to the observed extremes keeps every value inside the axis it is drawn on.
  edges[0] = lowest
  edges[edges.length - 1] = highest
  return edges
}

function linearEdges(lower: number, upper: number, bins: number): number[] {
  if (!(upper > lower)) return [lower, upper]
  const edges: number[] = []
  for (let index = 0; index <= bins; index += 1) {
    edges.push(lower + ((upper - lower) * index) / bins)
  }
  return edges
}

/**
 * Counts per bin. The final bin includes its upper bound, and values are clamped into the axis
 * rather than discarded, so the counts always sum to the number of values handed in — the property
 * that lets a histogram be read as a partition of the stratum rather than a sample of it.
 */
export function binValues(values: readonly number[], edges: readonly number[]): HistogramBin[] {
  if (edges.length < 2) return []
  const bins: HistogramBin[] = []
  for (let index = 0; index + 1 < edges.length; index += 1) {
    bins.push({
      lowerBound: edges[index]!,
      upperBound: edges[index + 1]!,
      upperInclusive: index + 2 === edges.length,
      count: 0,
    })
  }
  const lastIndex = bins.length - 1
  for (const value of values) {
    if (!Number.isFinite(value)) continue
    let placed = lastIndex
    for (let index = 0; index < bins.length; index += 1) {
      if (value < bins[index]!.upperBound) {
        placed = index
        break
      }
    }
    if (placed < 0) placed = 0
    bins[placed]!.count += 1
  }
  return bins
}

/* ------------------------------------------------------------------------------------------- */
/* Summarising                                                                                  */
/* ------------------------------------------------------------------------------------------- */

function buildStratum(
  dimension: StratumDimension | 'overall',
  key: string,
  label: string,
  values: readonly number[],
  edges: readonly number[],
  scale: DistributionScale,
): DistributionStratum | null {
  const summary = robustSummary(values)
  if (!summary) return null
  const stratum: DistributionStratum = {
    dimension,
    key,
    label,
    summary,
    histogram: binValues(values, edges),
  }
  if (scale !== 'log10') return stratum
  const logs = values.filter((value) => value > 0).map((value) => Math.log10(value))
  if (logs.length === 0) return stratum
  const mad = medianAbsoluteDeviation(logs)
  if (!Number.isFinite(mad)) return stratum
  const portableMad = portableFloat(mad)
  return {
    ...stratum,
    logSpread: {
      medianAbsoluteDeviationLog10: portableMad,
      spreadFactor: portableFloat(10 ** portableMad),
    },
  }
}

function stratify(
  dimension: StratumDimension,
  keyed: ReadonlyArray<{ key: string | null; value: number }>,
  edges: readonly number[],
  scale: DistributionScale,
  labelFor: (key: string) => string,
  note: string,
): StratifiedDistributions {
  const groups = new Map<string, number[]>()
  let valuesWithoutKey = 0
  for (const item of keyed) {
    if (item.key === null || item.key.length === 0) {
      valuesWithoutKey += 1
      continue
    }
    const held = groups.get(item.key)
    if (held) held.push(item.value)
    else groups.set(item.key, [item.value])
  }

  const strata: DistributionStratum[] = []
  let valuesBelowMinimum = 0
  let groupsBelowMinimum = 0
  for (const [key, values] of [...groups].sort((left, right) => left[0].localeCompare(right[0]))) {
    if (values.length < MINIMUM_STRATUM_SIZE) {
      valuesBelowMinimum += values.length
      groupsBelowMinimum += 1
      continue
    }
    const stratum = buildStratum(dimension, key, labelFor(key), values, edges, scale)
    if (stratum) strata.push(stratum)
  }
  strata.sort(
    (left, right) => right.summary.count - left.summary.count || left.key.localeCompare(right.key),
  )
  return { dimension, strata, valuesBelowMinimum, groupsBelowMinimum, valuesWithoutKey, note }
}

/**
 * The scale sentence, written from the values rather than asserted about them.
 *
 * For a log-scale field it reports the span and how lopsided equal-width linear bins would be, so
 * the choice is checkable against the printed numbers. For a bounded percentage it reports that
 * the bounds come from the quantity's definition, not from this corpus.
 */
function describeScale(values: readonly number[], spec: UnitSpec, fieldLabel: string): string {
  if (spec.scale === 'linear') {
    const lower = spec.fixedBounds?.lower ?? 0
    const upper = spec.fixedBounds?.upper ?? 100
    return `${fieldLabel} is a percentage bounded at ${lower} and ${upper} by the definition of the quantity, not by anything in this corpus, so the bins are equal width on the linear scale: ${spec.bins} bins of ${((upper - lower) / spec.bins).toFixed(0)} percentage points, each readable as the number the source printed.`
  }
  const positive = values.filter((value) => value > 0)
  if (positive.length === 0) {
    return `${fieldLabel} is binned on the linear scale here, because the recorded values hold no positive number to take a logarithm of.`
  }
  const lowest = Math.min(...positive)
  const highest = Math.max(...positive)
  const orders = Math.log10(highest / lowest)
  const linearFirstBinCutoff = lowest + (highest - lowest) / spec.bins
  const inFirstLinearBin = positive.filter((value) => value < linearFirstBinCutoff).length
  const share = (100 * inFirstLinearBin) / positive.length
  return `Recorded values run from ${formatNumber(lowest)} to ${formatNumber(highest)} ${spec.label}, a span of about ${orders.toFixed(1)} orders of magnitude. Split into ${spec.bins} equal-width linear bins, ${share.toFixed(1)} percent of them would fall in the first bin alone, so the bins are equal width in log base 10 instead.`
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return 'an unrepresentable number'
  const magnitude = Math.abs(value)
  if (magnitude !== 0 && (magnitude < 0.01 || magnitude >= 100000)) return value.toExponential(2)
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(magnitude < 1 ? 3 : 2)
}

/* ------------------------------------------------------------------------------------------- */
/* The agent                                                                                    */
/* ------------------------------------------------------------------------------------------- */

const AGENT_VERSION = '1.0.0'

const TIER_LABELS: Readonly<Record<BackgroundProvenanceTier, string>> = {
  curated: 'read and structured by a person or agent',
  extracted: 'matched by the deterministic label parser',
  transcribed: 'transcribed from a structured record',
}

export const numericDistributionsAgent: DatasetAgent<RecordedNumericDistributions> = {
  name: 'numeric-distributions',
  version: AGENT_VERSION,
  description:
    'Publishes the robust distribution of every numeric value the recorded corpus holds, overall and split by recorded route and by how the value was recorded, keeping each unit as its own distribution and counting the values that carry no number at all.',

  run(input: AgentInput): AgentRun<RecordedNumericDistributions> {
    const contributingRecords = new Set<string>()
    const reportedRoutes = new Set<string>()

    const fields: NumericFieldGroup[] = FIELD_SPECS.map((spec) => {
      const collected = collectField(input.corpus, spec)
      const acceptedUnits = new Set(spec.units.map((unit) => unit.unit))

      const offUnitCounts = new Map<string, number>()
      let numericValues = 0
      for (const entry of collected) {
        if (!hasNumber(entry)) continue
        numericValues += 1
        const unit = entry.value.unit
        if (unit !== undefined && acceptedUnits.has(unit)) continue
        const key = unit ?? '(no unit recorded)'
        offUnitCounts.set(key, (offUnitCounts.get(key) ?? 0) + 1)
      }

      const distributions: FieldUnitDistribution[] = spec.units.map((unitSpec) => {
        const usable = collected.filter((entry) => isUsable(entry, unitSpec.unit))
        for (const entry of usable) contributingRecords.add(entry.slug)
        const values = usable.map((entry) => entry.value.numeric!)
        const edges = computeBinEdges(values, unitSpec)

        const byRoute = spec.routeAvailable
          ? stratify(
              'route',
              usable.map((entry) => ({ key: entry.route, value: entry.value.numeric! })),
              edges,
              unitSpec.scale,
              (key) => `recorded route: ${key}`,
              `Strata are the route text the source printed, lower-cased and with repeated spaces removed. They are not a controlled vocabulary: the corpus records "oral" and "oral (tablets)" separately, and they are kept separate here. Groups holding fewer than ${MINIMUM_STRATUM_SIZE} values are counted but not published as strata of their own.`,
            )
          : {
              dimension: 'route' as const,
              strata: [],
              valuesBelowMinimum: 0,
              groupsBelowMinimum: 0,
              valuesWithoutKey: values.length,
              note: `${spec.label} is recorded on the molecular identity module, which carries no route. There is nothing to stratify on, so no route strata are published rather than a route being attached from elsewhere in the record.`,
            }

        for (const stratum of byRoute.strata) reportedRoutes.add(stratum.key)

        const byProvenanceTier = stratify(
          'provenanceTier',
          usable.map((entry) => ({ key: entry.tier, value: entry.value.numeric! })),
          edges,
          unitSpec.scale,
          (key) =>
            key in TIER_LABELS
              ? `${key}: ${TIER_LABELS[key as BackgroundProvenanceTier]}`
              : `recorded tier: ${key}`,
          `Strata are how the value came to be recorded. A difference between the two is a difference between two differently-selected bodies of recorded values, and says nothing about whether either is right. Groups holding fewer than ${MINIMUM_STRATUM_SIZE} values are counted but not published as strata of their own.`,
        )

        return {
          field: spec.field,
          unit: unitSpec.unit,
          label: `${spec.label}, in ${unitSpec.label}`,
          scale: unitSpec.scale,
          scaleReason: describeScale(values, unitSpec, spec.label),
          binEdges: edges,
          overall: buildStratum(
            'overall',
            'overall',
            `all recorded values in ${unitSpec.label}`,
            values,
            edges,
            unitSpec.scale,
          ),
          byRoute,
          byProvenanceTier,
        }
      })

      const offUnitValues = [...offUnitCounts]
        .map(([unit, count]) => ({ unit, count }))
        .sort((left, right) => right.count - left.count || left.unit.localeCompare(right.unit))

      return {
        field: spec.field,
        label: spec.label,
        recordedValues: collected.length,
        numericValues,
        displayOnlyValues: collected.length - numericValues,
        offUnitValues,
        offUnitValueCount: offUnitValues.reduce((sum, tally) => sum + tally.count, 0),
        distributions,
      }
    })

    const totalRecorded = fields.reduce((sum, group) => sum + group.recordedValues, 0)
    const totalDisplayOnly = fields.reduce((sum, group) => sum + group.displayOnlyValues, 0)
    const totalOffUnit = fields.reduce((sum, group) => sum + group.offUnitValueCount, 0)
    const volume = fields.find((group) => group.field === 'volumeOfDistribution')
    const litres = volume?.distributions.find((entry) => entry.unit === 'L')
    const perKilogram = volume?.distributions.find((entry) => entry.unit === 'L/kg')

    return {
      agent: 'numeric-distributions',
      version: AGENT_VERSION,
      runDate: input.runDate,
      seed: input.seed,
      parameters: {
        fields: FIELD_SPECS.length,
        distributions: fields.reduce((sum, group) => sum + group.distributions.length, 0),
        logScaleBins: LOG_BINS,
        percentBins: PERCENT_BINS,
        minimumStratumSize: MINIMUM_STRATUM_SIZE,
        routeNormalisation: 'trim, collapse repeated whitespace, lower case; no other mapping',
        unitPolicy: 'exact unit match required; no value is ever converted between units',
        valueUniverse: 'one recorded value per medicine record per field slot',
        binEdgeBasis: 'edges computed once per distribution and shared by all of its strata',
      },
      coverage: {
        considered: input.corpus.length,
        used: contributingRecords.size,
        reason: `${contributingRecords.size} of ${input.corpus.length} records contribute at least one number to at least one distribution. The rest hold no pharmacokinetics measurement and no molecular weight, which is a statement about what has been structured into the corpus and about nothing else.`,
      },
      output: {
        fields,
        reportedRoutes: [...reportedRoutes].sort((left, right) => left.localeCompare(right)),
        minimumStratumSize: MINIMUM_STRATUM_SIZE,
        recordsWithAnyNumericValue: contributingRecords.size,
      },
      caveats: [
        'Every number here describes recorded values. It does not describe medicines, and it does not describe the people a value was measured in. A median recorded half-life is a fact about what source documents state, shaped first of all by which medicines happen to have a document with a pharmacokinetics section structured into this corpus.',
        'No percentile in this output is typical, normal or expected for any medicine. A value at the 5th or the 95th percentile of a stratum is an unremarkable recorded value that sits near the edge of the recorded values around it, and nothing follows from where it sits.',
        `Of ${totalRecorded} recorded values across these fields, ${totalDisplayOnly} carry no parsed number and are absent from every summary and every histogram here, while still being counted in each field's recorded total. A source printing "about five days" with no hour figure is recorded exactly that way; it is not a missing value and it is not converted into one.`,
        `A further ${totalOffUnit} numeric values are recorded in a unit no distribution here accepts. They are named with their units beside each field and left out, because rescaling a recorded number would replace what the source printed with a number no source stated.`,
        litres && perKilogram
          ? `Volume of distribution is published as two separate distributions and never as one: ${litres.overall?.summary.count ?? 0} values recorded in litres and ${perKilogram.overall?.summary.count ?? 0} recorded in litres per kilogram. Converting between them would need a body weight no source stated, so no stratum here mixes them and none is derived from the other.`
          : 'Volume of distribution is published as two separate distributions, in litres and in litres per kilogram, and never as one. Converting between them would need a body weight no source stated.',
        'The route strata are the route text the source printed, lower-cased. They are not a controlled vocabulary, so a medicine given by more than one route appears under whichever single route its record states, and near-identical route wordings are separate strata.',
        'A route stratum is a group of recorded values, not a group of medicines and not a group of doses. Differences between route strata reflect which medicines have a structured record for that route as much as anything about the routes.',
        'The two provenance tiers are two different kinds of work on differently-selected documents, not two samples of one population. A distributional difference between them is a fact about how the corpus was built, and it does not indicate that values in either tier are wrong.',
        'Each field slot contributes at most one value per medicine record. Alternative readings held in the source-consensus module are not counted here; including them would weight the distribution toward medicines that happen to have many published labels.',
        'Bin edges span the full range of each distribution and are shared by all of its strata so that two histograms can be read against each other. A stratum whose values occupy a narrow part of the range therefore shows empty bins at both ends, which is the shared axis and not a gap in the data.',
        `Groups holding fewer than ${MINIMUM_STRATUM_SIZE} values are counted but not published as strata, because a quartile over a handful of values reads as a distribution while resting on two or three records.`,
      ],
    }
  },
}
