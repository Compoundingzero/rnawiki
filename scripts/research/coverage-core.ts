/** Read-only accounting for research work. Counts are not evidence or publication decisions. */
import type { MedicineRecordedBackground } from '../../lib/background/types'

export interface InventoryPage {
  slug: string
  name: string
  publicationState: string
  substanceType: string
  availability: string
  hasCorpusPage: boolean
  reviewedClaims: number
  humanResultCards: number
  journeySteps: number
}

export type Background = Pick<
  MedicineRecordedBackground,
  | 'recordedUses'
  | 'mechanism'
  | 'safety'
  | 'pivotalResults'
  | 'populationStatements'
  | 'registryIdentifiers'
  | 'nameFamily'
  | 'labelPresence'
  | 'composition'
>

export interface SourceCoverage {
  source: string
  corpus_pages_by_tier: Record<string, number>
  pages_matched_by_tier: Record<string, number>
  fields_gained_by_tier: Record<string, Record<string, number>>
  pages_by_match_rule: Record<string, number>
  rows_in_mapped_parquet: number
}

/** A small RFC 4180 reader. The quoted key/name columns contain commas. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some(Boolean)) rows.push(row)
      row = []
      field = ''
    } else field += char
  }
  if (quoted) throw new Error('Unclosed quoted CSV field')
  if (row.length || field) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/** A slug can appear in several tier rows; ambiguous assignments remain unclassified. */
export function tierMapFromCsv(text: string): { rows: number; tiers: Map<string, string> } {
  const [header, ...rows] = parseCsv(text)
  if (!header) throw new Error('Tier CSV is empty')
  const slugIndex = header.indexOf('slug')
  const tierIndex = header.indexOf('tier')
  if (slugIndex < 0 || tierIndex < 0) throw new Error('Tier CSV needs slug and tier columns')
  const tiers = new Map<string, string>()
  for (const row of rows) {
    const slug = row[slugIndex]
    const tier = row[tierIndex]
    if (!slug || !tier) continue
    const prior = tiers.get(slug)
    tiers.set(slug, prior && prior !== tier ? 'ambiguous' : tier)
  }
  return { rows: rows.length, tiers }
}

export type Lane =
  | 'identity_review'
  | 'product_label_safety_review'
  | 'human_result_scope_review'
  | 'background_acquisition'
  | 'thin_record_review'
  | 'baseline_claim_review'

export interface QueueItem {
  slug: string
  name: string
  lane: Lane
  tier: string | null
  signals: string[]
}

const LANES: Lane[] = [
  'identity_review',
  'product_label_safety_review',
  'human_result_scope_review',
  'background_acquisition',
  'thin_record_review',
  'baseline_claim_review',
]

function signalsFor(page: InventoryPage, background: Background | undefined): string[] {
  const signals: string[] = []
  if (page.publicationState === 'correction_hold') signals.push('publication_identity_hold')
  if (page.substanceType === 'unknown_type') signals.push('substance_type_unresolved')
  if (page.availability === 'unresolved') signals.push('availability_unresolved')
  if (background?.nameFamily) signals.push('shared_name_family')
  if (background?.composition) signals.push('combination_product_context')
  if (background?.safety?.boxedWarning) signals.push('source_boxed_warning')
  if (background?.safety?.contraindications?.length) signals.push('source_contraindications')
  if (page.humanResultCards > 0 && page.reviewedClaims === 0)
    signals.push('recorded_human_results_not_reviewed')
  if (!background) signals.push('no_recorded_background_envelope')
  if (
    page.humanResultCards === 0 &&
    !background?.recordedUses?.statements?.length &&
    !background?.mechanism?.statements?.length
  )
    signals.push('no_recorded_use_mechanism_or_human_result')
  if (background && !background.registryIdentifiers?.unii) signals.push('no_background_unii')
  return signals
}

function laneFor(signals: string[]): Lane {
  if (
    signals.some((signal) =>
      ['publication_identity_hold', 'substance_type_unresolved', 'shared_name_family'].includes(
        signal,
      ),
    )
  )
    return 'identity_review'
  if (signals.includes('source_boxed_warning') || signals.includes('source_contraindications'))
    return 'product_label_safety_review'
  if (signals.includes('recorded_human_results_not_reviewed')) return 'human_result_scope_review'
  if (signals.includes('no_recorded_background_envelope')) return 'background_acquisition'
  if (signals.includes('no_recorded_use_mechanism_or_human_result')) return 'thin_record_review'
  return 'baseline_claim_review'
}

function addCount(counts: Record<string, number>, key: string): void {
  counts[key] = (counts[key] ?? 0) + 1
}

export function buildCoverageReport({
  pages,
  backgrounds,
  tierCsv,
  sourceCoverage,
  limit = 25,
  slug,
  laneFilter,
}: {
  pages: InventoryPage[]
  backgrounds: Record<string, Background>
  tierCsv: string
  sourceCoverage: SourceCoverage
  limit?: number
  slug?: string
  laneFilter?: Lane
}) {
  const { rows: tierRows, tiers } = tierMapFromCsv(tierCsv)
  const inventory = new Set<string>()
  const backgroundSlugs = new Set(Object.keys(backgrounds))
  const crossTab: Record<string, number> = {}
  const tierCoverage: Record<string, Record<string, number>> = {}
  const moduleCoverage: Record<string, Record<string, number>> = {}
  const identitySignals: Record<string, number> = {}
  const queueCounts: Record<string, number> = Object.fromEntries(LANES.map((lane) => [lane, 0]))
  const queue: QueueItem[] = []
  const clinicalScope = {
    pagesWithRecordedHumanResultCards: 0,
    pagesWithReviewedClaims: 0,
    pagesWithBackgroundPivotalResults: 0,
    pagesWithStoredTrialContext: 0,
  }

  for (const page of pages) {
    if (!page.slug || inventory.has(page.slug))
      throw new Error(`Duplicate or empty inventory slug: ${page.slug}`)
    inventory.add(page.slug)
    const background = backgrounds[page.slug]
    const tier = tiers.get(page.slug) ?? null
    const tierKey = tier ?? 'unmatched'
    const tierStats = (tierCoverage[tierKey] ??= {})
    addCount(tierStats, 'inventory_pages')
    if (background) addCount(tierStats, 'with_background')
    if (page.hasCorpusPage) addCount(tierStats, 'with_local_corpus_page')
    if (page.humanResultCards > 0) addCount(tierStats, 'with_recorded_human_result_cards')
    if (page.humanResultCards > 0) clinicalScope.pagesWithRecordedHumanResultCards += 1
    if (page.reviewedClaims > 0) clinicalScope.pagesWithReviewedClaims += 1

    const modules = (moduleCoverage[tierKey] ??= {})
    if (background?.recordedUses?.statements?.length) addCount(modules, 'recorded_uses')
    if (background?.mechanism?.statements?.length) addCount(modules, 'mechanism')
    if (background?.safety?.contraindications?.length) addCount(modules, 'contraindications')
    if (background?.safety?.boxedWarning) addCount(modules, 'boxed_warning')
    if (background?.pivotalResults?.length) {
      addCount(modules, 'pivotal_results')
      clinicalScope.pagesWithBackgroundPivotalResults += 1
      if (
        (background.pivotalResults as Array<{ trialContext?: unknown }>).some(
          (result) => result.trialContext,
        )
      )
        clinicalScope.pagesWithStoredTrialContext += 1
    }
    if (background?.populationStatements?.length) addCount(modules, 'population_statements')
    if (background?.registryIdentifiers?.unii) addCount(modules, 'background_unii')
    if (background?.labelPresence?.singleSubstanceLabelCount)
      addCount(modules, 'single_substance_label_present')

    const crossKey = `${page.hasCorpusPage ? 'corpus' : 'no_corpus'}_${background ? 'background' : 'no_background'}`
    addCount(crossTab, crossKey)
    const signals = signalsFor(page, background)
    const lane = laneFor(signals)
    if (lane === 'baseline_claim_review') signals.push('source_bound_first_screen_unverified')
    for (const signal of signals) addCount(identitySignals, signal)
    addCount(queueCounts, lane)
    queue.push({ slug: page.slug, name: page.name, lane, tier, signals })
  }

  if (queue.length !== inventory.size) throw new Error('Research queue does not cover every slug')

  const backgroundOnly = [...backgroundSlugs].filter((item) => !inventory.has(item))
  const signalRank = (item: QueueItem): number => {
    if (item.lane === 'identity_review') {
      if (item.signals.includes('publication_identity_hold')) return 0
      if (item.signals.includes('substance_type_unresolved')) return 1
      return 2
    }
    if (item.lane === 'product_label_safety_review')
      return item.signals.includes('source_boxed_warning') ? 0 : 1
    if (item.lane === 'background_acquisition')
      return item.signals.includes('no_recorded_background_envelope') ? 0 : 1
    return 0
  }
  queue.sort(
    (a, b) =>
      LANES.indexOf(a.lane) - LANES.indexOf(b.lane) ||
      signalRank(a) - signalRank(b) ||
      a.slug.localeCompare(b.slug),
  )
  return {
    scope: {
      inventory: 'local /d union snapshot (corpus_pages UNION drugs)',
      tierCsv: 'separate corpus identity snapshot; tier join by exact slug only',
      sourceCoverage:
        'source-mapper aggregate over its corpus snapshot, not /d page-level coverage',
      background: 'merged source-background envelopes by slug; not reviewed conclusions',
    },
    denominators: {
      inventoryPages: inventory.size,
      backgroundRecords: backgroundSlugs.size,
      inventoryWithBackground:
        inventory.size - pages.filter((page) => !backgroundSlugs.has(page.slug)).length,
      inventoryWithoutBackground: pages.filter((page) => !backgroundSlugs.has(page.slug)).length,
      backgroundOutsideInventory: backgroundOnly.length,
      localCorpusAndBackground: crossTab.corpus_background ?? 0,
      localCorpusWithoutBackground: crossTab.corpus_no_background ?? 0,
      noLocalCorpusWithBackground: crossTab.no_corpus_background ?? 0,
      neitherLocalCorpusNorBackground: crossTab.no_corpus_no_background ?? 0,
      tierRows,
      inventoryWithTier: pages.filter((page) => tiers.has(page.slug)).length,
      inventoryWithoutTier: pages.filter((page) => !tiers.has(page.slug)).length,
    },
    tierCoverage,
    backgroundModuleCoverageByTier: moduleCoverage,
    clinicalScope,
    identityAndResearchSignals: identitySignals,
    queueCounts,
    sourceMapperCoverage: {
      source: sourceCoverage.source,
      corpusPagesByTier: sourceCoverage.corpus_pages_by_tier,
      pagesMatchedByTier: sourceCoverage.pages_matched_by_tier,
      fieldsGainedByTier: sourceCoverage.fields_gained_by_tier,
      pagesByMatchRule: sourceCoverage.pages_by_match_rule,
      rowsInMappedParquet: sourceCoverage.rows_in_mapped_parquet,
    },
    queue: queue
      .filter((item) => (!slug || item.slug === slug) && (!laneFilter || item.lane === laneFilter))
      .slice(0, limit),
  }
}
