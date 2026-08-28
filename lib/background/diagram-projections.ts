/**
 * Diagram projections over the recorded-background corpus.
 *
 * These are deterministic, typed views built for visual rendering — never prose parsing, never
 * interpretation. Three rules make a diagram drawn from them honest:
 *
 * 1. **Typed fields only.** A point exists on a chart only when the underlying value carries a
 *    machine-readable number, code or ordered step. A display-only value ("about 5 days", with no
 *    hour figure in its source excerpt) never becomes a coordinate.
 * 2. **Every point keeps its provenance.** Each projected datum carries the source that was
 *    fetched for it, so a chart tooltip can show the exact excerpt behind a dot.
 * 3. **Fail closed.** A medicine that lacks the typed field is absent from that projection rather
 *    than estimated onto it. Coverage is itself reported, so a chart can say how much of the
 *    corpus it is drawing.
 *
 * The comparative projections are what the corpus makes possible and a per-medicine scrape does
 * not: 127 records structured to one schema, on one unit, with one controlled anatomy vocabulary.
 */

import { ANATOMY_REGIONS, type AnatomyRegionCode } from './anatomy-regions'
import type { BackgroundSource, MedicineRecordedBackground } from './types'

export interface DiagramSourceRef {
  kind: BackgroundSource['kind']
  identifier: string
  retrievedAt: string
  /** The exact fetched wording behind this point, when the value recorded one. */
  excerpt?: string
}

function sourceRef(source: BackgroundSource): DiagramSourceRef {
  return {
    kind: source.kind,
    identifier: source.identifier,
    retrievedAt: source.retrievedAt,
    ...(source.excerpt ? { excerpt: source.excerpt } : {}),
  }
}

/** One medicine's entry in the corpus, as the projections consume it. */
export interface CorpusEntry {
  slug: string
  name: string
  background: MedicineRecordedBackground
}

/* ------------------------------------------------------------------------------------------- */
/* Duration-of-action scale                                                                     */
/* ------------------------------------------------------------------------------------------- */

export interface DurationScalePoint {
  slug: string
  name: string
  /** Recorded elimination half-life in hours. */
  halfLifeHours: number
  /** Exactly as recorded, e.g. "about 168 hours". */
  display: string
  populationContext: string
  /** log10(hours), the natural axis for a range spanning minutes to weeks. */
  logHours: number
  /** Deterministic banding for grouping, never a medical judgement. */
  band: DurationBand
  source: DiagramSourceRef
}

export const DURATION_BANDS = [
  'under_2_hours',
  'two_to_6_hours',
  'six_to_12_hours',
  'twelve_to_24_hours',
  'one_to_3_days',
  'over_3_days',
] as const
export type DurationBand = (typeof DURATION_BANDS)[number]

export const DURATION_BAND_LABELS: Record<DurationBand, string> = {
  under_2_hours: 'Under 2 hours',
  two_to_6_hours: '2 to 6 hours',
  six_to_12_hours: '6 to 12 hours',
  twelve_to_24_hours: '12 to 24 hours',
  one_to_3_days: '1 to 3 days',
  over_3_days: 'More than 3 days',
}

export function durationBandForHours(hours: number): DurationBand {
  if (hours < 2) return 'under_2_hours'
  if (hours < 6) return 'two_to_6_hours'
  if (hours < 12) return 'six_to_12_hours'
  if (hours < 24) return 'twelve_to_24_hours'
  if (hours < 72) return 'one_to_3_days'
  return 'over_3_days'
}

export interface DurationScaleProjection {
  points: DurationScalePoint[]
  /** How many corpus records could be placed, out of how many were considered. */
  coverage: { placed: number; considered: number }
  axis: { minLogHours: number; maxLogHours: number }
  bands: Array<{ band: DurationBand; label: string; count: number }>
}

/**
 * Places every medicine with a recorded numeric half-life on one logarithmic hour axis. A record
 * whose half-life was stated only in days without an hour figure is deliberately absent: the
 * dataset never converts a value its source did not state.
 */
export function durationOfActionScale(corpus: readonly CorpusEntry[]): DurationScaleProjection {
  const points: DurationScalePoint[] = []
  for (const entry of corpus) {
    const halfLife = entry.background.pharmacokinetics?.halfLife
    const hours = halfLife?.numeric
    if (!halfLife || typeof hours !== 'number' || hours <= 0) continue
    points.push({
      slug: entry.slug,
      name: entry.name,
      halfLifeHours: hours,
      display: halfLife.display,
      populationContext: halfLife.populationContext,
      logHours: Math.log10(hours),
      band: durationBandForHours(hours),
      source: sourceRef(halfLife.source),
    })
  }
  points.sort(
    (left, right) =>
      left.halfLifeHours - right.halfLifeHours || left.slug.localeCompare(right.slug),
  )

  const logs = points.map((point) => point.logHours)
  return {
    points,
    coverage: { placed: points.length, considered: corpus.length },
    axis: {
      minLogHours: logs.length > 0 ? Math.min(...logs) : 0,
      maxLogHours: logs.length > 0 ? Math.max(...logs) : 0,
    },
    bands: DURATION_BANDS.map((band) => ({
      band,
      label: DURATION_BAND_LABELS[band],
      count: points.filter((point) => point.band === band).length,
    })),
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Body-region atlas                                                                            */
/* ------------------------------------------------------------------------------------------- */

export interface AtlasMedicineRef {
  slug: string
  name: string
  actionAsRecorded: string
  source: DiagramSourceRef
}

export interface AtlasRegion {
  regionCode: AnatomyRegionCode
  label: string
  x: number
  y: number
  medicines: AtlasMedicineRef[]
}

export interface BodyRegionAtlasProjection {
  regions: AtlasRegion[]
  coverage: { medicinesWithRegions: number; considered: number; regionsUsed: number }
}

/**
 * Inverts the corpus into a body-region index: for each anatomy region, which recorded medicines
 * act there and what the source says they do. Positions come from the controlled vocabulary, so a
 * cross-medicine map can be drawn without a single guessed coordinate.
 */
export function bodyRegionAtlas(corpus: readonly CorpusEntry[]): BodyRegionAtlasProjection {
  const byRegion = new Map<AnatomyRegionCode, AtlasMedicineRef[]>()
  let medicinesWithRegions = 0

  for (const entry of corpus) {
    const targets = entry.background.anatomyTargets ?? []
    if (targets.length > 0) medicinesWithRegions += 1
    for (const target of targets) {
      const code = target.regionCode
      if (!(code in ANATOMY_REGIONS)) continue
      const list = byRegion.get(code) ?? []
      list.push({
        slug: entry.slug,
        name: entry.name,
        actionAsRecorded: target.actionAsRecorded,
        source: sourceRef(target.source),
      })
      byRegion.set(code, list)
    }
  }

  const regions: AtlasRegion[] = [...byRegion.entries()]
    .map(([regionCode, medicines]) => ({
      regionCode,
      label: ANATOMY_REGIONS[regionCode].label,
      x: ANATOMY_REGIONS[regionCode].x,
      y: ANATOMY_REGIONS[regionCode].y,
      medicines: [...medicines].sort((left, right) => left.name.localeCompare(right.name)),
    }))
    .sort(
      (left, right) =>
        right.medicines.length - left.medicines.length || left.label.localeCompare(right.label),
    )

  return {
    regions,
    coverage: {
      medicinesWithRegions,
      considered: corpus.length,
      regionsUsed: regions.length,
    },
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Single-medicine exposure timeline                                                            */
/* ------------------------------------------------------------------------------------------- */

export interface ExposureMarker {
  kind: 'peak' | 'half_life' | 'steady_state'
  label: string
  hours: number
  display: string
  populationContext?: string
  source?: DiagramSourceRef
  /** True when the position is arithmetic from a recorded value rather than recorded itself. */
  derived: boolean
}

export interface ExposureTimelineProjection {
  routeAsRecorded: string
  markers: ExposureMarker[]
  /** Axis end in hours: the furthest marker, so a renderer never invents headroom. */
  maxHours: number
}

/** Parses a leading number from a recorded display string, e.g. "24 to 36 hours" -> 24. */
function leadingNumber(display: string): number | undefined {
  const match = /(\d+(?:\.\d+)?)/u.exec(display.replace(/,(?=\d{3}\b)/gu, ''))
  return match ? Number(match[1]) : undefined
}

/**
 * One medicine's recorded exposure landmarks on a single hour axis: time to peak, the half-life,
 * and the arithmetic five-half-life steady-state point. Returns null unless a numeric half-life
 * anchors the axis, so no timeline is ever drawn from a value the source did not state.
 */
export function exposureTimeline(
  background: MedicineRecordedBackground,
): ExposureTimelineProjection | null {
  const pk = background.pharmacokinetics
  const halfLifeHours = pk?.halfLife?.numeric
  if (!pk || typeof halfLifeHours !== 'number' || halfLifeHours <= 0) return null

  const markers: ExposureMarker[] = []

  // tMax is recorded in mixed units across labels; only place it when its display carries a
  // number and the unit is hours, which is how the schema records it.
  const tMax = pk.tMax
  const tMaxHours =
    tMax && tMax.unit?.toLowerCase().startsWith('hour')
      ? (tMax.numeric ?? leadingNumber(tMax.display))
      : undefined
  if (tMax && typeof tMaxHours === 'number' && tMaxHours > 0) {
    markers.push({
      kind: 'peak',
      label: 'Highest level in the blood',
      hours: tMaxHours,
      display: tMax.display,
      populationContext: tMax.populationContext,
      source: sourceRef(tMax.source),
      derived: false,
    })
  }

  markers.push({
    kind: 'half_life',
    label: 'Half of it has left the body',
    hours: halfLifeHours,
    display: pk.halfLife!.display,
    populationContext: pk.halfLife!.populationContext,
    source: sourceRef(pk.halfLife!.source),
    derived: false,
  })

  markers.push({
    kind: 'steady_state',
    label: 'Levels settle with regular use',
    hours: halfLifeHours * 5,
    display: pk.steadyStateNote ?? `about ${Math.round(halfLifeHours * 5)} hours`,
    derived: true,
  })

  markers.sort((left, right) => left.hours - right.hours)
  return {
    routeAsRecorded: pk.routeAsRecorded,
    markers,
    maxHours: Math.max(...markers.map((marker) => marker.hours)),
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Titration ladder                                                                             */
/* ------------------------------------------------------------------------------------------- */

export interface TitrationLadderStep {
  order: number
  period: string
  amount: string
  purpose?: string
}

export interface TitrationLadderProjection {
  basis: 'TRIAL_PROTOCOL' | 'LABEL_SCHEDULE'
  basisLabel: string
  steps: TitrationLadderStep[]
  source: DiagramSourceRef
}

/** The recorded escalation schedule as ordered rungs. Amounts stay exactly as recorded strings. */
export function titrationLadder(
  background: MedicineRecordedBackground,
): TitrationLadderProjection | null {
  const titration = background.titration
  if (!titration || titration.steps.length === 0) return null
  return {
    basis: titration.basis,
    basisLabel:
      titration.basis === 'TRIAL_PROTOCOL'
        ? 'Escalation schedule as studied in the trial protocol'
        : 'Escalation schedule as stated on the product label',
    steps: [...titration.steps]
      .sort((left, right) => left.order - right.order)
      .map((step) => ({
        order: step.order,
        period: step.periodAsRecorded,
        amount: step.amountAsRecorded,
        ...(step.purposeAsRecorded ? { purpose: step.purposeAsRecorded } : {}),
      })),
    source: sourceRef(titration.source),
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Record-completeness matrix                                                                   */
/* ------------------------------------------------------------------------------------------- */

export const BACKGROUND_MODULE_KEYS = [
  'registryIdentifiers',
  'pharmacokinetics',
  'titration',
  'productVariants',
  'anatomyTargets',
  'applicability',
  'pivotalResults',
  'costContext',
] as const
export type BackgroundModuleKey = (typeof BACKGROUND_MODULE_KEYS)[number]

export const BACKGROUND_MODULE_LABELS: Record<BackgroundModuleKey, string> = {
  registryIdentifiers: 'Registry identifiers',
  pharmacokinetics: 'What happens after a dose',
  titration: 'Studied escalation schedule',
  productVariants: 'Products and strengths',
  anatomyTargets: 'Where it acts',
  applicability: 'Who was studied',
  pivotalResults: 'Exact study results',
  costContext: 'Recorded price context',
}

export interface CompletenessRow {
  slug: string
  name: string
  modules: Record<BackgroundModuleKey, boolean>
  recordedCount: number
}

export interface CompletenessMatrixProjection {
  rows: CompletenessRow[]
  moduleTotals: Array<{
    module: BackgroundModuleKey
    label: string
    recorded: number
    share: number
  }>
  corpusSize: number
}

function moduleRecorded(background: MedicineRecordedBackground, key: BackgroundModuleKey): boolean {
  const value = background[key]
  if (Array.isArray(value)) return value.length > 0
  return value !== undefined && value !== null
}

/**
 * The honest coverage map: which modules each record actually holds. Publishing where the corpus
 * is thin is part of the record's credibility, so this projection is designed to be shown, not
 * used to hide gaps.
 */
export function completenessMatrix(corpus: readonly CorpusEntry[]): CompletenessMatrixProjection {
  const rows: CompletenessRow[] = corpus
    .map((entry) => {
      const modules = Object.fromEntries(
        BACKGROUND_MODULE_KEYS.map((key) => [key, moduleRecorded(entry.background, key)]),
      ) as Record<BackgroundModuleKey, boolean>
      return {
        slug: entry.slug,
        name: entry.name,
        modules,
        recordedCount: Object.values(modules).filter(Boolean).length,
      }
    })
    .sort(
      (left, right) =>
        right.recordedCount - left.recordedCount || left.name.localeCompare(right.name),
    )

  return {
    rows,
    moduleTotals: BACKGROUND_MODULE_KEYS.map((module) => {
      const recorded = rows.filter((row) => row.modules[module]).length
      return {
        module,
        label: BACKGROUND_MODULE_LABELS[module],
        recorded,
        share: corpus.length > 0 ? recorded / corpus.length : 0,
      }
    }),
    corpusSize: corpus.length,
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Source-composition summary                                                                   */
/* ------------------------------------------------------------------------------------------- */

export interface SourceCompositionProjection {
  byKind: Array<{ kind: BackgroundSource['kind']; recordedValues: number; medicines: number }>
  totalRecordedValues: number
  /** Distinct source artifacts the corpus stands on. */
  distinctSources: number
}

/** Every recorded source in the corpus, counted by kind — the provenance profile of the dataset. */
export function sourceComposition(corpus: readonly CorpusEntry[]): SourceCompositionProjection {
  const valueCounts = new Map<BackgroundSource['kind'], number>()
  const medicineSets = new Map<BackgroundSource['kind'], Set<string>>()
  const distinct = new Set<string>()
  let total = 0

  const record = (slug: string, source: BackgroundSource | undefined) => {
    if (!source) return
    total += 1
    distinct.add(`${source.kind}:${source.identifier}`)
    valueCounts.set(source.kind, (valueCounts.get(source.kind) ?? 0) + 1)
    const set = medicineSets.get(source.kind) ?? new Set<string>()
    set.add(slug)
    medicineSets.set(source.kind, set)
  }

  for (const { slug, background } of corpus) {
    const pk = background.pharmacokinetics
    if (pk) {
      for (const value of [
        pk.bioavailability,
        pk.tMax,
        pk.halfLife,
        pk.proteinBinding,
        pk.volumeOfDistribution,
        pk.metabolismAsRecorded,
        pk.eliminationAsRecorded,
      ]) {
        record(slug, value?.source)
        record(slug, value?.alternateValue?.source)
      }
    }
    record(slug, background.titration?.source)
    background.productVariants?.forEach((product) => record(slug, product.source))
    background.costContext?.forEach((entry) => record(slug, entry.source))
    background.anatomyTargets?.forEach((target) => record(slug, target.source))
    record(slug, background.applicability?.source)
    background.pivotalResults?.forEach((result) => record(slug, result.source))
    record(slug, background.registryIdentifiers?.source)
  }

  return {
    byKind: [...valueCounts.entries()]
      .map(([kind, recordedValues]) => ({
        kind,
        recordedValues,
        medicines: medicineSets.get(kind)?.size ?? 0,
      }))
      .sort((left, right) => right.recordedValues - left.recordedValues),
    totalRecordedValues: total,
    distinctSources: distinct.size,
  }
}
