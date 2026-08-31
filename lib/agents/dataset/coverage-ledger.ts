/**
 * The coverage ledger: which source reached each record, and what is still missing.
 *
 * The corpus is assembled from sources that reach different parts of it and cannot reach the
 * others. Prescription labels carry pharmacology and no supplements. The supplement database
 * carries marketed products and no pharmacology, because supplement labels have none. A compound
 * database carries chemistry for anything with a defined structure and nothing for a botanical.
 * A record is therefore not simply covered or uncovered — it was reached by a particular source
 * with particular limits, and what is absent from it is often absent for a reason that can be
 * stated.
 *
 * This agent makes that visible per record and in aggregate. It is the dataset that says where the
 * corpus is thin and why, which is the thing every other coverage claim rests on.
 *
 * WHAT A THIN RECORD MEANS. A record holding little says the sources this corpus reads hold little
 * about it. It is not a statement that a medicine is poorly studied, obscure or unimportant, and
 * nothing here should be read as ranking medicines by how much is known about them.
 */

import type {
  AgentInput,
  AgentRun,
  DatasetAgent,
  ReviewCandidate,
  ReviewCandidateIndexEntry,
} from '@/lib/agents/core/types'
import { createRng, shuffleInPlace } from '@/lib/agents/core/rng'
import { recordedBackgroundSources, reviewEvidence } from '@/lib/agents/core/evidence'
import type { MedicineRecordedBackground } from '@/lib/background/types'

const AGENT_NAME = 'coverage-ledger'
// 1.1.0 knows about recorded organisms, which 691 records held while the ledger called them empty.
// 1.2.0 knows about marketed product listings.
const AGENT_VERSION = '1.4.0'

/**
 * How a record came to be filled.
 *
 * Ordered by how much a source can say. A record reached by prescription labelling can carry
 * mechanism and pharmacokinetics; one reached only by a compound database can carry a formula and
 * nothing else. The order is about the reach of the source, never the merit of the medicine.
 */
export const COVERAGE_ROUTES = [
  'CURATED',
  'LABEL_PHARMACOLOGY',
  'LABEL_PRODUCT_ONLY',
  'SUPPLEMENT_MARKET',
  'SUPPLEMENT_INGREDIENT',
  'LABEL_ARCHIVE_PRESENCE',
  'MARKETED_PRODUCT_LISTING',
  'REGULATORY_APPROVAL',
  'BIOLOGICAL_IDENTITY',
  'SOURCE_MATERIAL',
  'AMBIGUOUS_NAME',
  'COMPOUND_IDENTITY',
  'OTHER_RECORDED_CONTEXT',
  'NONE',
] as const
export type CoverageRoute = (typeof COVERAGE_ROUTES)[number]

/** Modules a record may hold, in the order a reader meets them on the page. */
const MODULES = [
  'recordedUses',
  'mechanism',
  'pharmacokinetics',
  'molecularIdentity',
  'interactionSignals',
  'safety',
  'populationStatements',
  'commonAdverseReactions',
  'productVariants',
  'composition',
  'sourceConsensus',
  'supplementMarket',
  'labelPresence',
  'biologicalIdentity',
  'productListing',
  'regulatoryApproval',
  'supplementIngredient',
  'sourceMaterial',
  'nameFamily',
  'registryIdentifiers',
  'anatomyTargets',
  'applicability',
  'pivotalResults',
  'titration',
  'costContext',
] as const
type ModuleName = (typeof MODULES)[number]

export interface CoverageEntry {
  slug: string
  name: string
  route: CoverageRoute
  modulesPresent: ModuleName[]
  moduleCount: number
  /** Ingredients recorded, and how many of them carry substance data of their own. */
  ingredientCount: number
  ingredientsDocumented: number
  provenanceTier: string
}

export interface RouteRollUp {
  route: CoverageRoute
  records: number
  /** Median modules held by a record on this route, which is what the route can reach. */
  medianModuleCount: number
  /** What this route cannot supply, stated rather than left to inference. */
  cannotSupply: string
}

export interface ModuleRollUp {
  module: ModuleName
  records: number
  shareOfCorpus: number
}

export interface CoverageLedgerDataset {
  entries: CoverageEntry[]
  byRoute: RouteRollUp[]
  byModule: ModuleRollUp[]
  recordsConsidered: number
  /** Ingredient slots across every composition, and how many carry substance data. */
  ingredientSlots: number
  ingredientSlotsDocumented: number
}

/** Queue items per route, so no single route floods the list. */
const QUEUE_PER_ROUTE = 10

function has(background: MedicineRecordedBackground, module: ModuleName): boolean {
  const value = background[module as keyof MedicineRecordedBackground]
  return Array.isArray(value) ? value.length > 0 : value !== undefined
}

/**
 * Which source reached this record.
 *
 * Decided by what the record holds rather than by a stored marker, so a record assembled from two
 * sources is described by the richer one and the classification cannot drift from the data.
 */
function routeFor(
  background: MedicineRecordedBackground,
  modulesPresent: readonly ModuleName[],
): CoverageRoute {
  const tier = background.provenanceTier ?? 'curated'
  if (tier === 'curated') return 'CURATED'
  const composition = background.composition
  const ingredientPharmacology = (composition?.ingredients ?? []).some(
    (ingredient) => ingredient.mechanism ?? ingredient.pharmacokinetics,
  )
  if (background.mechanism ?? background.pharmacokinetics ?? ingredientPharmacology) {
    return 'LABEL_PHARMACOLOGY'
  }
  if (
    has(background, 'productVariants') ||
    has(background, 'safety') ||
    has(background, 'composition')
  ) {
    return 'LABEL_PRODUCT_ONLY'
  }
  if (has(background, 'supplementMarket')) return 'SUPPLEMENT_MARKET'
  if (has(background, 'supplementIngredient')) return 'SUPPLEMENT_INGREDIENT'
  if (has(background, 'labelPresence')) return 'LABEL_ARCHIVE_PRESENCE'
  if (has(background, 'productListing')) return 'MARKETED_PRODUCT_LISTING'
  if (has(background, 'regulatoryApproval')) return 'REGULATORY_APPROVAL'
  if (has(background, 'biologicalIdentity')) return 'BIOLOGICAL_IDENTITY'
  if (has(background, 'sourceMaterial')) return 'SOURCE_MATERIAL'
  if (has(background, 'nameFamily')) return 'AMBIGUOUS_NAME'
  if (has(background, 'molecularIdentity')) return 'COMPOUND_IDENTITY'
  // A record holding something none of the named routes describes is still not empty. Falling
  // through to NONE said "no source holds anything about this record" about rows that carried a
  // registry identifier or a price, which is the ledger reporting the corpus as thinner than it is.
  return modulesPresent.length > 0 ? 'OTHER_RECORDED_CONTEXT' : 'NONE'
}

const ROUTE_LIMITS: Readonly<Record<CoverageRoute, string>> = {
  CURATED: 'Nothing structural. A person assembled this record and chose what it holds.',
  LABEL_PHARMACOLOGY:
    'Prescription labelling covers pharmacology but states no price and no supplement context.',
  LABEL_PRODUCT_ONLY:
    'The product label was read but no source describes its substances alone, so no mechanism or pharmacokinetics can be recorded for them.',
  SUPPLEMENT_MARKET:
    'Supplement labels carry no mechanism, no pharmacokinetics and no evaluated efficacy claim, so none can be recorded however many products exist.',
  SUPPLEMENT_INGREDIENT:
    'The supplement label database files this as an ingredient and classifies it. It records no pharmacology for any ingredient, so none can come from here however the ingredient is classified.',
  LABEL_ARCHIVE_PRESENCE:
    'The archive records that published labels name this substance as an active ingredient, and how many of them name it alone. It does not say the product was approved or evaluated, and where no label names the substance alone there is no source its own data could come from.',
  MARKETED_PRODUCT_LISTING:
    'The product directory records that marketed products declare this as an active ingredient, and how they reached the market. It carries no prose, so nothing about how the substance works can come from it.',
  REGULATORY_APPROVAL:
    'The application register records when a product containing this substance was approved and under what. It carries no prose, so nothing about how the substance works can come from it.',
  BIOLOGICAL_IDENTITY:
    'A taxonomy states what an organism is and where classification places it. It says nothing about use, effect or safety, and no source in this corpus does for these rows.',
  SOURCE_MATERIAL:
    'The substance registry states what kind of material this is and, where it comes from an organism, which organism and which part. It records nothing about use, effect or safety.',
  AMBIGUOUS_NAME:
    'The row is filed under a name several registered substances share, so no source can say which one it means. The family is recorded instead of a guess.',
  COMPOUND_IDENTITY:
    'A compound database states structure and nothing about use, effect or safety.',
  OTHER_RECORDED_CONTEXT:
    'The record holds identifiers, price or other context, but no source states what the medicine is, how it works, or what it is used for.',
  NONE: 'No source this corpus reads holds anything about this record.',
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((left, right) => left - right)
  return sorted[Math.floor(sorted.length / 2)]!
}

export const coverageLedgerAgent: DatasetAgent<CoverageLedgerDataset> = {
  name: AGENT_NAME,
  version: AGENT_VERSION,
  description:
    'Records which source reached each medicine, how much it holds, and what that source structurally cannot supply.',

  run(input: AgentInput): AgentRun<CoverageLedgerDataset> {
    const entries: CoverageEntry[] = []
    let ingredientSlots = 0
    let ingredientSlotsDocumented = 0

    for (const { slug, name, background } of input.corpus) {
      const modulesPresent = MODULES.filter((module) => has(background, module))
      const ingredients = background.composition?.ingredients ?? []
      const documented = ingredients.filter(
        (ingredient) => ingredient.substanceDataState === 'RECORDED',
      ).length
      ingredientSlots += ingredients.length
      ingredientSlotsDocumented += documented

      entries.push({
        slug,
        name,
        route: routeFor(background, modulesPresent),
        modulesPresent,
        moduleCount: modulesPresent.length,
        ingredientCount: ingredients.length,
        ingredientsDocumented: documented,
        provenanceTier: background.provenanceTier ?? 'curated',
      })
    }

    const byRoute: RouteRollUp[] = COVERAGE_ROUTES.map((route) => {
      const scoped = entries.filter((entry) => entry.route === route)
      return {
        route,
        records: scoped.length,
        medianModuleCount: median(scoped.map((entry) => entry.moduleCount)),
        cannotSupply: ROUTE_LIMITS[route],
      }
    })

    const byModule: ModuleRollUp[] = MODULES.map((module) => {
      const records = entries.filter((entry) => entry.modulesPresent.includes(module)).length
      return {
        module,
        records,
        shareOfCorpus: entries.length > 0 ? records / entries.length : 0,
      }
    })

    // The thinnest records on each route, shuffled with the declared seed so a slug-ordered sample
    // of a corpus this size is not simply a sample of the letter A.
    const rng = createRng(input.seed)
    const queue: ReviewCandidate[] = []
    const completeCandidateIndex: ReviewCandidateIndexEntry[] = []
    const backgroundBySlug = new Map(input.corpus.map((entry) => [entry.slug, entry.background]))
    for (const route of COVERAGE_ROUTES) {
      if (route === 'CURATED') continue
      const scoped = entries.filter((entry) => entry.route === route)
      if (scoped.length === 0) continue
      const ranked = shuffleInPlace([...scoped], rng).sort(
        (left, right) => left.moduleCount - right.moduleCount,
      )
      for (const [rank, entry] of ranked.entries()) {
        const fieldPath = `recordedBackground.coverage.${route}`
        const priority = 1 / (entry.moduleCount + 1)
        completeCandidateIndex.push({
          slug: entry.slug,
          fieldPath,
          reason: 'COVERAGE_GAP',
          priority,
        })
        if (rank >= QUEUE_PER_ROUTE) continue
        const background = backgroundBySlug.get(entry.slug)
        const sourceReadings = background ? recordedBackgroundSources(background) : []
        queue.push({
          slug: entry.slug,
          fieldPath,
          reason: 'COVERAGE_GAP',
          question: `This record holds ${entry.moduleCount} of the recordable modules, reached by ${route.toLowerCase().replace(/_/gu, ' ')}. Is there a source about this medicine that the corpus is not reading?`,
          priority,
          basis: `${ROUTE_LIMITS[route]} A thin record here reflects what the sources hold, not what is known about the medicine.`,
          sources: sourceReadings.map((source) => source.sourceKey),
          evidence: reviewEvidence(
            {
              route,
              recordedModules: entry.modulesPresent,
              moduleCount: entry.moduleCount,
              ingredientCount: entry.ingredientCount,
              ingredientsDocumented: entry.ingredientsDocumented,
              provenanceTier: entry.provenanceTier,
            },
            sourceReadings,
            {
              route,
              recordedModules: entry.modulesPresent,
              moduleCount: entry.moduleCount,
              ingredientCount: entry.ingredientCount,
              ingredientsDocumented: entry.ingredientsDocumented,
              provenanceTier: entry.provenanceTier,
            },
          ),
        })
      }
    }

    const sortedQueue = queue.sort((left, right) => right.priority - left.priority)
    completeCandidateIndex.sort(
      (left, right) =>
        right.priority - left.priority ||
        (left.fieldPath < right.fieldPath ? -1 : left.fieldPath > right.fieldPath ? 1 : 0) ||
        (left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0),
    )

    return {
      agent: AGENT_NAME,
      version: AGENT_VERSION,
      runDate: input.runDate,
      seed: input.seed,
      parameters: {
        modulesTracked: MODULES.length,
        routes: COVERAGE_ROUTES.length,
        queuePerRoute: QUEUE_PER_ROUTE,
      },
      coverage: {
        considered: input.corpus.length,
        used: entries.length,
        reason:
          'Every record in the corpus is classified; a record holding nothing is still an entry, because an absence nobody counted is an absence nobody fixes.',
      },
      output: {
        entries,
        byRoute,
        byModule,
        recordsConsidered: entries.length,
        ingredientSlots,
        ingredientSlotsDocumented,
      },
      queue: sortedQueue,
      queueSelection:
        completeCandidateIndex.length > sortedQueue.length
          ? {
              mode: 'sampled',
              availableCandidates: completeCandidateIndex.length,
              retainedCandidates: sortedQueue.length,
              selectionRule: `For every non-curated route, sort all eligible records by ascending module count after a deterministic seed-${input.seed} shuffle, then retain the first ${QUEUE_PER_ROUTE}.`,
              seed: input.seed,
              retrieval:
                'Each indexed identity can be reconstructed exactly by re-running this agent against the corpus commit and digest declared by its enclosing artifact; run.output.entries holds its route and module observations.',
              completeCandidateIndex,
            }
          : undefined,
      caveats: [
        'A route describes which source reached a record, not the quality of the medicine. A record on the compound-identity route holds a formula because that is all a compound database has, not because less is known about it.',
        'Every route has limits it cannot pass, and they are stated per route rather than left to inference. A supplement record will never carry a mechanism however many products list the ingredient, because supplement labels do not have one.',
        'Module counts are not comparable across routes. Eight modules from prescription labelling and eight from a supplement database describe different things, and adding them together would measure nothing.',
        'A thin record is a question, not a verdict. Many are thin because the corpus reads a source that does not cover them, which is a gap in reading rather than in knowledge.',
        'The queue is one seeded sample of the thinnest records on each route, not a ranking of the whole corpus; a record absent from it has not been ruled out.',
      ],
    }
  },
}
