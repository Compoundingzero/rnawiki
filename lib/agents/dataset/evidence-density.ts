/**
 * Evidence density: how much of the recordable schema the corpus actually holds for each medicine,
 * and how well sourced what it holds is.
 *
 * THE ONE THING THIS DATASET IS NOT. A density score measures a RECORD. It does not measure a
 * medicine, and it does not measure the evidence base that exists in the world. Aspirin has been
 * studied for a century; if this corpus holds one module for it, its score is low and the only
 * thing that follows is that the corpus is thin there. Every string this agent emits is written so
 * that reading it as a statement about the medicine takes an active misreading, and the caveats say
 * so in the first line rather than the last.
 *
 * Why density is worth computing at all: the corpus presents a record page identically whether it
 * rests on eleven modules and nine source documents or on one module read from one document. A
 * reader cannot see the difference, and neither can the people deciding what to record next. The
 * index makes the thinness visible and orders the work.
 *
 * Why source concentration sits in the same agent: a record standing on a single document has no
 * corroboration and no redundancy. If that document is revised, withdrawn or was misread, nothing
 * in the record disagrees with it. That fragility is a property of the record, is currently
 * invisible, and is measurable exactly — unlike the correctness of the document itself, which is
 * not this agent's business.
 *
 * The score's weighting is a stated convention, not a measurement. It is published in
 * `parameters` and every component is published beside the score, so a reader who disagrees with
 * the weights can recompute the ranking from the components instead of arguing with a number.
 */

import type {
  BackgroundSource,
  BackgroundSourceKind,
  MedicineRecordedBackground,
  RecordedValue,
} from '@/lib/background/types'
import { createRng, shuffleInPlace } from '@/lib/agents/core/rng'
import {
  cleanSorted,
  quantileSorted,
  robustSummary,
  type RobustSummary,
} from '@/lib/agents/core/statistics'
import type {
  AgentCorpusEntry,
  AgentInput,
  AgentRun,
  DatasetAgent,
  ReviewCandidate,
} from '@/lib/agents/core/types'

/**
 * Modules that carry recorded evidence, and therefore count toward breadth.
 *
 * `attribution` is deliberately absent: it records how many active substances the source document
 * declared, which qualifies the other modules rather than adding evidence of its own. Counting it
 * would let a record gain breadth by describing its own sources.
 */
export const RECORDABLE_MODULES = [
  'pharmacokinetics',
  'titration',
  'productVariants',
  'costContext',
  'anatomyTargets',
  'applicability',
  'pivotalResults',
  'registryIdentifiers',
  'mechanism',
  'molecularIdentity',
  'interactionSignals',
  'safety',
  'populationStatements',
  'commonAdverseReactions',
] as const
export type RecordableModule = (typeof RECORDABLE_MODULES)[number]

/**
 * The four things that are observable about a record's evidence, each already normalised to [0,1]
 * so that the composite is a weighted average rather than a scale-mixing sum.
 */
export interface DensityComponents {
  /** Share of the recordable modules the record holds at all. */
  moduleBreadth: number
  /** Distinct source documents behind the record, saturating at `CORROBORATION_SATURATION`. */
  sourceCorroboration: number
  /** Share of the record's parsed measurements that carry a number and are therefore comparable. */
  numericComparability: number
  /** Share of the record's source attachments that carry the fetched wording containing the value. */
  excerptCoverage: number
}

/**
 * Weights for the composite. Published in `parameters` on every run.
 *
 * Breadth dominates because it is the thing the index exists to surface: a record holding two
 * modules is thin however well those two are sourced. Corroboration is weighted next because a
 * second independent document is the single largest change in a record's fragility. Numeric
 * comparability and excerpt coverage are weighted lowest and equally: both are real quality
 * signals, but a display-only value read from a source that prints no number is a faithful record,
 * not a defect, and the weights should not imply otherwise.
 */
export const DENSITY_WEIGHTS: Readonly<Record<keyof DensityComponents, number>> = {
  moduleBreadth: 0.45,
  sourceCorroboration: 0.25,
  numericComparability: 0.15,
  excerptCoverage: 0.15,
}

/**
 * Distinct documents at which corroboration stops counting.
 *
 * Beyond a handful of documents the marginal one adds little redundancy, and without a ceiling the
 * component would mostly rank records by how many product variants they list — a document count is
 * partly a marketing fact, not only an evidence fact.
 */
export const CORROBORATION_SATURATION = 4

/** Composite density for a set of components. Bounded in [0,1] because every component is. */
export function computeDensityScore(components: DensityComponents): number {
  const raw =
    DENSITY_WEIGHTS.moduleBreadth * clampUnit(components.moduleBreadth) +
    DENSITY_WEIGHTS.sourceCorroboration * clampUnit(components.sourceCorroboration) +
    DENSITY_WEIGHTS.numericComparability * clampUnit(components.numericComparability) +
    DENSITY_WEIGHTS.excerptCoverage * clampUnit(components.excerptCoverage)
  // The weights sum to one by construction, but floating-point accumulation can land a hair
  // outside the interval and a score documented as bounded has to actually be bounded.
  return clampUnit(raw)
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export interface MedicineEvidenceDensity {
  slug: string
  name: string
  modulesPresent: readonly RecordableModule[]
  moduleCount: number
  /** Distinct `kind:identifier` documents cited anywhere in the record. */
  distinctSourceDocuments: number
  /** Every place a source is attached, counted with repetition. */
  sourceAttachments: number
  sourceAttachmentsWithExcerpt: number
  /** Parsed measurements that carry a number, and are therefore comparable with other records. */
  numericValues: number
  /** Parsed measurements recorded as displayed text only; never usable as a coordinate. */
  displayOnlyValues: number
  /** Earliest and latest date a source behind this record was fetched, ISO, null when none. */
  oldestRetrievedAt: string | null
  newestRetrievedAt: string | null
  components: DensityComponents
  score: number
}

export interface ModuleCountBucket {
  moduleCount: number
  medicines: number
}

export interface SingleModuleEntry {
  slug: string
  name: string
  module: RecordableModule
}

/** How many medicine records one source document is the basis for. Never medicine-to-medicine. */
export interface DocumentReach {
  kind: BackgroundSourceKind
  identifier: string
  medicines: number
}

export interface SourceConcentration {
  distinctDocuments: number
  /** Records whose entire evidence rests on one document, and so carry no corroboration at all. */
  medicinesOnOneDocument: number
  medicinesWithNoDocument: number
  /** Distribution of how many records each document backs. */
  reachSummary: RobustSummary | null
  widestReach: readonly DocumentReach[]
}

export interface EvidenceDensityIndex {
  perMedicine: readonly MedicineEvidenceDensity[]
  scoreDistribution: RobustSummary | null
  moduleCountHistogram: readonly ModuleCountBucket[]
  singleModuleCount: number
  singleModuleByModule: readonly { module: RecordableModule; medicines: number }[]
  /** A seeded sample of the single-module tail, so the examples shown are not all alphabetical. */
  singleModuleSample: readonly SingleModuleEntry[]
  sourceConcentration: SourceConcentration
  retrievedAtRange: { oldest: string | null; newest: string | null }
}

const SINGLE_MODULE_SAMPLE_SIZE = 25
const WIDEST_REACH_SIZE = 20
const QUEUE_SIZE = 40

/**
 * Product-variant entries a record must hold to enter the coverage queue.
 *
 * This began as a "widely marketed" proxy — many recorded brand entries standing in for a medicine
 * many people encounter. The corpus cannot support that reading: no record holds more than two
 * product variants, 2,322 hold exactly one, and every record that holds any names a single
 * jurisdiction. A threshold of "many" would therefore select nothing, and tuning it downward until
 * it selected something would be inventing a distinction the data does not draw.
 *
 * What the module can honestly say is binary: whether the corpus recorded a marketed product entry
 * for this medicine at all. A record that holds one and little else is a marketed product the
 * corpus has structured almost nothing about, which is the coverage gap worth queueing. The
 * threshold is 1 and the queue is described in those terms rather than in terms of prominence.
 */
const MARKETED_PRODUCT_VARIANTS = 1

/**
 * Density at or below which a record enters the coverage queue, as a quantile of the corpus.
 *
 * The median is used rather than the lower quartile because the quartile is degenerate here: 1,251
 * of 3,008 records hold exactly one module, so the 25th percentile coincides with the minimum score
 * and a quartile cut selects only the floor, where every record has an identical score and the
 * queue cannot be ordered at all. The median is stated as a parameter rather than tuned against the
 * length of the queue it produces.
 */
const LOW_DENSITY_QUANTILE = 0.5

/** Every source attached anywhere in a record, in a fixed module order so runs are comparable. */
function collectSources(background: MedicineRecordedBackground): BackgroundSource[] {
  const sources: BackgroundSource[] = []
  const add = (source: BackgroundSource | undefined): void => {
    if (source) sources.push(source)
  }
  const addValue = (value: RecordedValue | undefined): void => {
    if (!value) return
    add(value.source)
    // A discrepant value cites the reading it disagrees with. Both documents are load-bearing for
    // the record, so both count toward corroboration.
    add(value.alternateValue?.source)
  }

  const pk = background.pharmacokinetics
  if (pk) {
    addValue(pk.bioavailability)
    addValue(pk.tMax)
    addValue(pk.halfLife)
    addValue(pk.proteinBinding)
    addValue(pk.volumeOfDistribution)
    addValue(pk.metabolismAsRecorded)
    addValue(pk.eliminationAsRecorded)
  }
  add(background.titration?.source)
  for (const variant of background.productVariants ?? []) add(variant.source)
  for (const cost of background.costContext ?? []) add(cost.source)
  for (const target of background.anatomyTargets ?? []) add(target.source)
  add(background.applicability?.source)
  for (const result of background.pivotalResults ?? []) add(result.source)
  add(background.registryIdentifiers?.source)
  for (const statement of background.mechanism?.statements ?? []) add(statement.source)
  addValue(background.molecularIdentity?.molecularFormula)
  addValue(background.molecularIdentity?.molecularWeight)
  for (const signal of background.interactionSignals ?? []) add(signal.source)
  add(background.safety?.boxedWarning?.source)
  for (const statement of background.safety?.contraindications ?? []) add(statement.source)
  for (const statement of background.populationStatements ?? []) add(statement.source)
  add(background.commonAdverseReactions?.source)
  return sources
}

/**
 * The parsed measurements, which are the only values that can carry a number.
 *
 * Recorded statements, product entries and population statements are text by design; counting them
 * as "display-only" would report a schema decision as a data gap.
 */
function collectParsedValues(background: MedicineRecordedBackground): RecordedValue[] {
  const values: RecordedValue[] = [...collectPharmacokineticValues(background)]
  const identity = background.molecularIdentity
  if (identity?.molecularFormula) values.push(identity.molecularFormula)
  if (identity?.molecularWeight) values.push(identity.molecularWeight)
  return values
}

function collectPharmacokineticValues(background: MedicineRecordedBackground): RecordedValue[] {
  const pk = background.pharmacokinetics
  if (!pk) return []
  const candidates = [
    pk.bioavailability,
    pk.tMax,
    pk.halfLife,
    pk.proteinBinding,
    pk.volumeOfDistribution,
    pk.metabolismAsRecorded,
    pk.eliminationAsRecorded,
  ]
  return candidates.filter((value): value is RecordedValue => value !== undefined)
}

function modulesPresent(background: MedicineRecordedBackground): RecordableModule[] {
  const present: RecordableModule[] = []
  for (const candidate of RECORDABLE_MODULES) {
    if (hasModule(background, candidate)) present.push(candidate)
  }
  return present
}

/** A module counts only when it holds something. An empty array is an absence, not a presence. */
function hasModule(background: MedicineRecordedBackground, module: RecordableModule): boolean {
  switch (module) {
    case 'pharmacokinetics':
      // `routeAsRecorded` is required by the envelope, so a pharmacokinetics object can exist with
      // no measurement in it. Counting that as a present module would report a route as evidence.
      return collectPharmacokineticValues(background).length > 0
    case 'titration':
      return (background.titration?.steps.length ?? 0) > 0
    case 'productVariants':
      return (background.productVariants?.length ?? 0) > 0
    case 'costContext':
      return (background.costContext?.length ?? 0) > 0
    case 'anatomyTargets':
      return (background.anatomyTargets?.length ?? 0) > 0
    case 'applicability':
      return background.applicability !== undefined
    case 'pivotalResults':
      return (background.pivotalResults?.length ?? 0) > 0
    case 'registryIdentifiers':
      return background.registryIdentifiers !== undefined
    case 'mechanism':
      return (background.mechanism?.statements.length ?? 0) > 0
    case 'molecularIdentity':
      return (
        background.molecularIdentity?.molecularFormula !== undefined ||
        background.molecularIdentity?.molecularWeight !== undefined
      )
    case 'interactionSignals':
      return (background.interactionSignals?.length ?? 0) > 0
    case 'safety':
      return (
        background.safety?.boxedWarning !== undefined ||
        (background.safety?.contraindications?.length ?? 0) > 0
      )
    case 'populationStatements':
      return (background.populationStatements?.length ?? 0) > 0
    case 'commonAdverseReactions':
      return (background.commonAdverseReactions?.eventsAsRecorded.length ?? 0) > 0
  }
}

function documentKey(source: BackgroundSource): string {
  return `${source.kind}:${source.identifier}`
}

function measureOne(entry: AgentCorpusEntry): MedicineEvidenceDensity {
  const present = modulesPresent(entry.background)
  const sources = collectSources(entry.background)
  const documents = new Set(sources.map(documentKey))
  const parsed = collectParsedValues(entry.background)
  const numericValues = parsed.filter((value) => typeof value.numeric === 'number').length
  const withExcerpt = sources.filter(
    (source) => typeof source.excerpt === 'string' && source.excerpt.length > 0,
  ).length

  // ISO dates compare correctly as strings, which keeps the whole agent clear of Date parsing and
  // therefore clear of the local time zone.
  let oldest: string | null = null
  let newest: string | null = null
  for (const source of sources) {
    if (!source.retrievedAt) continue
    if (oldest === null || source.retrievedAt < oldest) oldest = source.retrievedAt
    if (newest === null || source.retrievedAt > newest) newest = source.retrievedAt
  }

  const components: DensityComponents = {
    moduleBreadth: present.length / RECORDABLE_MODULES.length,
    sourceCorroboration:
      Math.min(documents.size, CORROBORATION_SATURATION) / CORROBORATION_SATURATION,
    numericComparability: parsed.length === 0 ? 0 : numericValues / parsed.length,
    excerptCoverage: sources.length === 0 ? 0 : withExcerpt / sources.length,
  }

  return {
    slug: entry.slug,
    name: entry.name,
    modulesPresent: present,
    moduleCount: present.length,
    distinctSourceDocuments: documents.size,
    sourceAttachments: sources.length,
    sourceAttachmentsWithExcerpt: withExcerpt,
    numericValues,
    displayOnlyValues: parsed.length - numericValues,
    oldestRetrievedAt: oldest,
    newestRetrievedAt: newest,
    components,
    score: computeDensityScore(components),
  }
}

const AGENT_VERSION = '1.0.0'

export const evidenceDensityAgent: DatasetAgent<EvidenceDensityIndex> = {
  name: 'evidence-density',
  version: AGENT_VERSION,
  description:
    'Measures how much of the recordable background schema each medicine record holds, how many source documents it rests on, and how many records depend on a single document.',

  run(input: AgentInput): AgentRun<EvidenceDensityIndex> {
    const perMedicine = input.corpus
      .map(measureOne)
      .sort((left, right) => right.score - left.score || left.slug.localeCompare(right.slug))

    const histogramCounts = new Map<number, number>()
    for (const record of perMedicine) {
      histogramCounts.set(record.moduleCount, (histogramCounts.get(record.moduleCount) ?? 0) + 1)
    }
    const moduleCountHistogram: ModuleCountBucket[] = [...histogramCounts]
      .map(([moduleCount, medicines]) => ({ moduleCount, medicines }))
      .sort((left, right) => left.moduleCount - right.moduleCount)

    const singleModule = perMedicine.filter((record) => record.moduleCount === 1)
    const singleModuleTally = new Map<RecordableModule, number>()
    const singleModuleEntries: SingleModuleEntry[] = []
    for (const record of singleModule) {
      const onlyModule = record.modulesPresent[0]
      if (!onlyModule) continue
      singleModuleTally.set(onlyModule, (singleModuleTally.get(onlyModule) ?? 0) + 1)
      singleModuleEntries.push({ slug: record.slug, name: record.name, module: onlyModule })
    }
    const singleModuleByModule = [...singleModuleTally]
      .map(([module, medicines]) => ({ module, medicines }))
      .sort(
        (left, right) =>
          right.medicines - left.medicines || left.module.localeCompare(right.module),
      )

    // Shuffled with the declared seed rather than taken alphabetically: a slug-ordered sample of a
    // 3,000-record corpus is a sample of the letter A, which reads as a pattern that is not there.
    const rng = createRng(input.seed)
    const singleModuleSample = shuffleInPlace([...singleModuleEntries], rng)
      .slice(0, SINGLE_MODULE_SAMPLE_SIZE)
      .sort((left, right) => left.slug.localeCompare(right.slug))

    const reach = new Map<
      string,
      { kind: BackgroundSourceKind; identifier: string; count: number }
    >()
    for (const entry of input.corpus) {
      const seen = new Set<string>()
      for (const source of collectSources(entry.background)) {
        const key = documentKey(source)
        if (seen.has(key)) continue
        seen.add(key)
        const held = reach.get(key)
        if (held) held.count += 1
        else reach.set(key, { kind: source.kind, identifier: source.identifier, count: 1 })
      }
    }
    const widestReach: DocumentReach[] = [...reach.values()]
      .map((held) => ({ kind: held.kind, identifier: held.identifier, medicines: held.count }))
      .sort(
        (left, right) =>
          right.medicines - left.medicines ||
          left.kind.localeCompare(right.kind) ||
          left.identifier.localeCompare(right.identifier),
      )
      .slice(0, WIDEST_REACH_SIZE)

    let corpusOldest: string | null = null
    let corpusNewest: string | null = null
    for (const record of perMedicine) {
      if (record.oldestRetrievedAt !== null) {
        if (corpusOldest === null || record.oldestRetrievedAt < corpusOldest) {
          corpusOldest = record.oldestRetrievedAt
        }
      }
      if (record.newestRetrievedAt !== null) {
        if (corpusNewest === null || record.newestRetrievedAt > corpusNewest) {
          corpusNewest = record.newestRetrievedAt
        }
      }
    }

    const scored = perMedicine.map((record) => record.score)
    const withAnyModule = perMedicine.filter((record) => record.moduleCount > 0)

    // The two caveats below state facts about the corpus that was actually handed in. Writing the
    // current corpus's numbers into a literal would leave a caveat asserting something false the
    // first time the corpus changed.
    const sortedScores = cleanSorted(scored)
    const widestVariantList = input.corpus.reduce(
      (widest, entry) => Math.max(widest, entry.background.productVariants?.length ?? 0),
      0,
    )
    const jurisdictionSpread = input.corpus.reduce(
      (widest, entry) =>
        Math.max(
          widest,
          new Set((entry.background.productVariants ?? []).map((variant) => variant.jurisdiction))
            .size,
        ),
      0,
    )
    const queueCutoff = quantileSorted(sortedScores, LOW_DENSITY_QUANTILE)
    const lowerQuartile = quantileSorted(sortedScores, 0.25)
    const quartileIsDegenerate =
      sortedScores.length > 0 && lowerQuartile === (sortedScores[0] ?? Number.NaN)

    const output: EvidenceDensityIndex = {
      perMedicine,
      scoreDistribution: robustSummary(scored),
      moduleCountHistogram,
      singleModuleCount: singleModule.length,
      singleModuleByModule,
      singleModuleSample,
      sourceConcentration: {
        distinctDocuments: reach.size,
        medicinesOnOneDocument: perMedicine.filter((record) => record.distinctSourceDocuments === 1)
          .length,
        medicinesWithNoDocument: perMedicine.filter(
          (record) => record.distinctSourceDocuments === 0,
        ).length,
        reachSummary: robustSummary([...reach.values()].map((held) => held.count)),
        widestReach,
      },
      retrievedAtRange: { oldest: corpusOldest, newest: corpusNewest },
    }

    return {
      agent: 'evidence-density',
      version: AGENT_VERSION,
      runDate: input.runDate,
      seed: input.seed,
      parameters: {
        recordableModules: RECORDABLE_MODULES.length,
        weightModuleBreadth: DENSITY_WEIGHTS.moduleBreadth,
        weightSourceCorroboration: DENSITY_WEIGHTS.sourceCorroboration,
        weightNumericComparability: DENSITY_WEIGHTS.numericComparability,
        weightExcerptCoverage: DENSITY_WEIGHTS.excerptCoverage,
        corroborationSaturation: CORROBORATION_SATURATION,
        queueMarketedVariantThreshold: MARKETED_PRODUCT_VARIANTS,
        queueLowDensityQuantile: LOW_DENSITY_QUANTILE,
        singleModuleSampleSize: SINGLE_MODULE_SAMPLE_SIZE,
        queueSize: QUEUE_SIZE,
        documentIdentity: 'source kind plus source identifier',
      },
      coverage: {
        considered: input.corpus.length,
        used: withAnyModule.length,
        reason:
          input.corpus.length === withAnyModule.length
            ? 'Every record in the corpus holds at least one recordable module and is measured.'
            : `${input.corpus.length - withAnyModule.length} records hold none of the ${RECORDABLE_MODULES.length} recordable modules. They are scored at zero and kept in the index, because a record the corpus holds nothing for is the finding, not a row to drop.`,
      },
      output,
      queue: buildQueue(input.corpus, perMedicine),
      caveats: [
        'A density score describes a record in this corpus. It does not describe a medicine, and it does not describe the published evidence about a medicine. A low score means the corpus holds little here, and nothing more than that.',
        'A record with no entry in a module is a record where nobody has yet structured that module from a source. Absence here is neither a favourable nor an unfavourable finding about the medicine.',
        'The weighting is a stated convention chosen for this index, not a measured quantity. Each component is published beside the score so a different weighting can be applied to the same components.',
        `Two documents count as one when they share a source kind and identifier. A document that was revised between two fetch dates therefore still counts once, so corroboration may be reported slightly higher than it is.`,
        'The retrieval dates are the dates source artifacts were fetched during authoring. They say when the corpus last looked, not when the source last changed.',
        `The coverage queue was designed to rank widely marketed medicines first, using the count of recorded product variants as the proxy. This corpus cannot express that: the largest number of product variants on any record is ${widestVariantList}, and the largest number of distinct jurisdictions on any record is ${jurisdictionSpread}, so the module reports little more than whether a marketed product entry was recorded at all. The queue is instead ordered by how much already-cited source material a record has left unstructured, and it does not rank medicines by prominence.`,
        quartileIsDegenerate
          ? `The queue cutoff is the corpus median density of ${queueCutoff.toFixed(3)} rather than the lower quartile, because ${singleModule.length} records hold exactly one module and the lower quartile coincides with the lowest score in the corpus. A cut there would select only records that are tied on score and could not be ordered.`
          : `The queue cutoff is the corpus median density of ${queueCutoff.toFixed(3)}, chosen and stated in advance rather than tuned against the length of queue it produces.`,
        'Records assembled by the deterministic label parser and records assembled by a person are measured on the same scale here. The scale does not distinguish the two kinds of work; the provenance tier on each value does.',
        'Values recorded as displayed text with no parsed number are counted separately rather than penalised as missing. A source that prints no number is recorded faithfully when no number is stored.',
      ],
    }
  },
}

/**
 * Records that hold a marketed product entry yet sit at or below the corpus median density.
 *
 * The queue is an ordering of recording work, nothing else. Each item asks a person what further
 * modules could be structured from documents the record already cites; none asserts anything about
 * a medicine, and none proposes an edit.
 *
 * Ordering multiplies the unstructured share by the number of documents already cited, because a
 * record citing several documents while holding one module has material already fetched and
 * unstructured, whereas a record citing one document needs new sourcing before anything can change.
 * That makes the queue an ordering by tractability, which is the only ordering the corpus supports.
 */
function buildQueue(
  corpus: readonly AgentCorpusEntry[],
  measured: readonly MedicineEvidenceDensity[],
): ReviewCandidate[] {
  const variantsBySlug = new Map<string, number>()
  const documentsBySlug = new Map<string, string[]>()
  for (const entry of corpus) {
    variantsBySlug.set(entry.slug, entry.background.productVariants?.length ?? 0)
    documentsBySlug.set(entry.slug, [...new Set(collectSources(entry.background).map(documentKey))])
  }
  const cutoff = quantileSorted(
    cleanSorted(measured.map((record) => record.score)),
    LOW_DENSITY_QUANTILE,
  )
  if (!Number.isFinite(cutoff)) return []

  const candidates: ReviewCandidate[] = []
  for (const record of measured) {
    if ((variantsBySlug.get(record.slug) ?? 0) < MARKETED_PRODUCT_VARIANTS) continue
    if (record.score > cutoff) continue
    const documents = documentsBySlug.get(record.slug) ?? []
    candidates.push({
      slug: record.slug,
      reason: 'COVERAGE_GAP',
      question: `The corpus records a marketed product entry for this medicine but holds ${record.moduleCount} of ${RECORDABLE_MODULES.length} background modules for it, across ${record.distinctSourceDocuments} distinct source ${record.distinctSourceDocuments === 1 ? 'document' : 'documents'}. Which further modules could be structured from the documents this record already cites?`,
      priority: (1 - record.score) * Math.max(documents.length, 1),
      basis: `Priority is one minus the density score multiplied by the number of source documents this record already cites, so a record with documents already fetched and little structured from them is asked about first. Density score ${record.score.toFixed(3)} is at or below the corpus median of ${cutoff.toFixed(3)}. This orders recording work against the corpus and carries no finding about the medicine.`,
      sources: [...documents].sort().slice(0, 8),
    })
  }

  return candidates
    .sort((left, right) => right.priority - left.priority || left.slug.localeCompare(right.slug))
    .slice(0, QUEUE_SIZE)
}
