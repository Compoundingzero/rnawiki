/**
 * Presentation projection for the `medicine-background/v1` envelope. Every rendered value keeps
 * its measurement context, its concordance state and a link to the exact source it was read
 * from; the mapper humanizes labels and resolves canonical source URLs deterministically from
 * recorded identifiers, and adds nothing else.
 */

import { ANATOMY_REGIONS, isAnatomyRegionCode } from '@/lib/background/anatomy-regions'
import type {
  BackgroundProvenanceTier,
  BackgroundSource,
  MedicineRecordedBackground,
  RecordedComposition,
  RecordedValue,
} from '@/lib/background/types'

export interface RecordedSourceView {
  kindLabel: string
  label: string
  identifier: string
  href?: string
  retrievedAt: string
  excerpt?: string
}

export interface RecordedValueView {
  label: string
  display: string
  populationContext: string
  /** Present only when this single value was read automatically inside an otherwise curated record. */
  provenanceLabel?: string
  concordanceLabel?: string
  discrepantAlternate?: { display: string; source: RecordedSourceView }
  source: RecordedSourceView
}

export interface MedicineBackgroundContextView {
  authoredAt: string
  /**
   * Present only when the whole record was read automatically. Readers are told which kind of
   * record they are looking at, because a value a person checked and a value a parser matched
   * out of a label sentence carry different weight even when both quote the same source.
   */
  provenanceNote?: string
  pharmacokinetics?: {
    routeAsRecorded: string
    values: RecordedValueView[]
    steadyStateNote?: string
  }
  titration?: {
    basisLabel: string
    steps: Array<{ period: string; amount: string; purpose?: string }>
    source: RecordedSourceView
  }
  productVariants?: Array<{
    brandName: string
    form: string
    strengths: string
    approvedUse: string
    jurisdictionLabel: string
    status: string
    source: RecordedSourceView
  }>
  costEntries?: Array<{
    jurisdictionLabel: string
    priceTypeLabel: string
    priceDisplay: string
    per: string
    asOf: string
    whoPays: string
    normalizedDisplay?: string
    source: RecordedSourceView
  }>
  anatomyTargets?: Array<{
    regionCode: string
    regionLabel: string
    x: number
    y: number
    action: string
    source: RecordedSourceView
  }>
  applicability?: {
    trialIdentifier: string
    included: string[]
    excluded: string[]
    studiedGroup?: string
    source: RecordedSourceView
  }
  pivotalResults?: Array<{
    trialIdentifier: string
    endpoint: string
    activeResult: string
    comparatorResult?: string
    difference?: string
    uncertainty?: string
    timepoint: string
    source: RecordedSourceView
  }>
  registryIdentifiers?: {
    rows: Array<{ label: string; value: string }>
    source: RecordedSourceView
  }
  mechanism?: {
    statements: Array<{ text: string; source: RecordedSourceView }>
    namedTargets?: string[]
  }
  molecularIdentity?: {
    values: RecordedValueView[]
  }
  interactionSignals?: {
    /** Grouped so a reader sees the enzymes together and the transporters together. */
    groups: Array<{
      kindLabel: string
      entries: Array<{ counterparty: string; roleLabel?: string; source: RecordedSourceView }>
    }>
  }
  safety?: {
    boxedWarning?: { text: string; source: RecordedSourceView }
    contraindications?: Array<{ text: string; source: RecordedSourceView }>
  }
  populationStatements?: Array<{
    populationLabel: string
    stateLabel: string
    /** True when the source did not settle the question, so the row can be marked as open. */
    unresolved: boolean
    text: string
    source: RecordedSourceView
  }>
  commonAdverseReactions?: {
    threshold: string
    events: string[]
    source: RecordedSourceView
  }
  /** What the label states the medicine is for, quoted. Never presented as evidence that it works. */
  recordedUses?: {
    statements: Array<{ text: string; source: RecordedSourceView }>
  }
  /**
   * What every published label says for a field, rather than what one of them says.
   *
   * A medicine is often covered by hundreds of labels because each manufacturer publishes its own.
   * Showing one and discarding the rest throws away the fact that the others agree — and, where
   * they do not, hides a disagreement a reader is entitled to see. Nothing here picks a winner.
   */
  sourceConsensus?: {
    documentsExaminedLabel: string
    fields: Array<{
      fieldLabel: string
      agreementLabel: string
      /** Set when two readings carry numbers whose ranges do not overlap. Never says either is wrong. */
      disagreementNote?: string
      readings: Array<{
        display: string
        supportLabel: string
        sources: RecordedSourceView[]
      }>
    }>
  }
  /**
   * Where the medicine appears in the published drug-label archive.
   *
   * For a great many rows — botanicals, homeopathic preparations, allergenic extracts — this is the
   * only thing any source records, and it used to be shown as a blank page.
   */
  labelPresence?: {
    labelCountLabel: string
    aloneLabel: string
    /** Present only when no label names the substance alone, which explains the empty sections. */
    noSoleSourceNote?: string
    productTypes: string[]
    routes: string[]
    mostRecentLabelDate?: string
    source: RecordedSourceView
  }
  supplementMarket?: {
    labelCountLabel: string
    categories: string[]
    claimTypes: string[]
    claimNote: string
    brands: string[]
    source: RecordedSourceView
  }
  /**
   * What the product is made of, and the data recorded for each ingredient.
   *
   * A product with six active ingredients has six ingredients' worth of recorded data, and showing
   * one of them and calling it the product's would be the mis-attribution the whole record model
   * exists to prevent.
   */
  composition?: {
    summary: string
    ingredients: Array<{
      name: string
      strength?: string
      /** Says outright whether any source describes this ingredient on its own. */
      dataStateLabel: string
      uses?: Array<{ text: string; source: RecordedSourceView }>
      mechanism?: Array<{ text: string; source: RecordedSourceView }>
      pharmacokinetics?: RecordedValueView[]
      molecularIdentity?: RecordedValueView[]
      interactions?: Array<{ counterparty: string; roleLabel?: string; source: RecordedSourceView }>
    }>
  }
}

const SOURCE_KIND_LABELS: Record<BackgroundSource['kind'], string> = {
  FDA_LABEL: 'FDA label',
  DAILYMED: 'DailyMed label',
  EMA_SMPC: 'EMA product information',
  PUBMED: 'Peer-reviewed publication',
  CLINICALTRIALS: 'ClinicalTrials.gov record',
  PUBCHEM: 'PubChem compound record',
  RXNORM: 'RxNorm concept',
  NADAC: 'NADAC price dataset',
  NICE_BNF: 'NICE / BNF record',
  PUBLISHED_ANALYSIS: 'Published analysis',
  DSLD: 'Supplement label database record',
}

const CONCORDANCE_LABELS = {
  label_only: 'From the label; not separately corroborated',
  label_and_literature_agree: 'Label and published literature agree',
  discrepant: 'Sources disagree — both readings shown',
} as const

function sourceHref(source: BackgroundSource): string | undefined {
  const id = encodeURIComponent(source.identifier.trim())
  switch (source.kind) {
    case 'FDA_LABEL':
    case 'DAILYMED':
      return `https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=${id}`
    case 'PUBMED':
      return `https://pubmed.ncbi.nlm.nih.gov/${id}/`
    case 'CLINICALTRIALS':
      return `https://clinicaltrials.gov/study/${id}`
    case 'PUBCHEM':
      return `https://pubchem.ncbi.nlm.nih.gov/compound/${id}`
    case 'PUBLISHED_ANALYSIS':
      return `https://doi.org/${encodeURIComponent(source.identifier.trim())}`
    case 'NICE_BNF':
      return source.identifier.startsWith('TA')
        ? `https://www.nice.org.uk/guidance/${source.identifier.toLowerCase()}`
        : undefined
    default:
      return source.locator
  }
}

const INTERACTION_KIND_LABELS = {
  ENZYME: 'Enzymes the source names',
  TRANSPORTER: 'Transporters the source names',
} as const

const INTERACTION_ROLE_LABELS = {
  SUBSTRATE: 'the source calls this medicine a substrate',
  INHIBITOR: 'the source describes inhibition',
  INDUCER: 'the source describes induction',
} as const

const POPULATION_LABELS = {
  PEDIATRIC: 'Children',
  GERIATRIC: 'Older adults',
  PREGNANCY: 'Pregnancy',
  LACTATION: 'Breastfeeding',
  HEPATIC_IMPAIRMENT: 'Reduced liver function',
  RENAL_IMPAIRMENT: 'Reduced kidney function',
} as const

const POPULATION_STATE_LABELS = {
  STUDIED: 'The source says this group was studied',
  NOT_ESTABLISHED: 'The source says this was not established',
  STATEMENT_ONLY: 'The source discusses this group without settling the question',
} as const

function sourceView(source: BackgroundSource): RecordedSourceView {
  return {
    kindLabel: SOURCE_KIND_LABELS[source.kind] ?? source.kind,
    label: source.label,
    identifier: source.identifier,
    href: sourceHref(source),
    retrievedAt: source.retrievedAt,
    excerpt: source.excerpt,
  }
}

const EXTRACTED_RECORD_NOTE =
  'Every value in this background was read automatically out of the source sentence shown beside ' +
  'it, and no person has checked it. Open “Exact fetched wording” under any value to read the ' +
  'sentence it came from.'

const EXTRACTED_VALUE_NOTE = 'Read automatically from the sentence below; not checked by a person'

/**
 * Counts have no sentence behind them, so they cannot carry the quoted wording every other value
 * does. What makes them checkable instead is the record identifiers, and a reader is told that
 * rather than left to wonder why this record quotes nothing.
 */
const TRANSCRIBED_RECORD_NOTE =
  'This record holds counts taken from a public database rather than statements quoted from a ' +
  'document, so there is no sentence to show beside them. The record identifiers are listed so the ' +
  'same counts can be looked up again.'

function valueView(
  label: string,
  value: RecordedValue | undefined,
  recordTier: BackgroundProvenanceTier,
): RecordedValueView[] {
  if (!value) return []
  const valueTier = value.provenanceTier ?? 'curated'
  return [
    {
      label,
      display: value.display,
      populationContext: value.populationContext,
      // A whole-record note already covers an extracted record; label the value only when it is
      // the odd one out inside a record a person otherwise authored.
      ...(valueTier === 'extracted' && recordTier !== 'extracted'
        ? { provenanceLabel: EXTRACTED_VALUE_NOTE }
        : {}),
      concordanceLabel: value.concordance ? CONCORDANCE_LABELS[value.concordance] : undefined,
      discrepantAlternate: value.alternateValue
        ? {
            display: value.alternateValue.display,
            source: sourceView(value.alternateValue.source),
          }
        : undefined,
      source: sourceView(value.source),
    },
  ]
}

const PRICE_TYPE_LABELS = {
  LIST_PRICE: 'List price',
  NADAC_UNIT: 'US acquisition cost (NADAC)',
  NHS_INDICATIVE: 'NHS indicative price',
  PUBLISHED_ESTIMATE: 'Published cost estimate',
} as const

const COST_JURISDICTION_LABELS = {
  US: 'United States',
  UK: 'United Kingdom',
  EU: 'European Union',
  GLOBAL_ANALYSIS: 'Global analysis',
} as const

const PRODUCT_JURISDICTION_LABELS = {
  US_FDA: 'United States (FDA)',
  EU_EMA: 'European Union (EMA)',
  UK_MHRA: 'United Kingdom (MHRA)',
} as const

/**
 * Reader-facing names for the fields consensus is computed over. Unrecognised field names are shown
 * as stored rather than hidden, because a field nobody labelled is still a field a reader can see.
 */
const CONSENSUS_FIELD_LABELS: Record<string, string> = {
  halfLife: 'Half-life',
  bioavailability: 'How much reaches the bloodstream',
  tMax: 'Time to peak level',
  proteinBinding: 'Bound to blood proteins',
  volumeOfDistribution: 'Distribution volume',
}

/** "12 published labels name…" / "1 published label names…", so a count never reads as a template. */
function countPhrase(count: number, singular: string, plural: string): string {
  return `${count.toLocaleString('en-US')} ${count === 1 ? singular : plural}`
}

/** Archive vocabulary is shouted; a reader should not be. */
function sentenceCase(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length === 0) return trimmed
  // Left alone when the source already mixes case, because that is someone's chosen spelling.
  if (trimmed !== trimmed.toUpperCase()) return trimmed
  return trimmed.charAt(0) + trimmed.slice(1).toLowerCase()
}

/** The archive stamps dates as YYYYMMDD; anything else is passed through untouched. */
function archiveDate(value: string): string {
  return /^\d{8}$/u.test(value)
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
    : value
}

function compositionSummary(composition: RecordedComposition): string {
  const total = composition.declaredIngredientCount
  const missing = composition.ingredientsWithoutSubstanceData
  const head =
    total === 1
      ? 'This product has one active ingredient.'
      : `This product has ${total.toLocaleString('en-US')} active ingredients.`
  if (missing === 0) return `${head} Every one of them has sources describing it on its own.`
  if (missing === total) {
    return `${head} No source describes any of them on its own, so only what the product's own label states is recorded.`
  }
  return `${head} ${missing.toLocaleString('en-US')} of them have no source describing them on their own.`
}

function money(currency: string, low: number, high?: number): string {
  const symbol =
    currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : `${currency} `
  const format = (value: number) =>
    value >= 100 ? Math.round(value).toLocaleString('en-US') : value.toFixed(2)
  return high !== undefined && high !== low
    ? `${symbol}${format(low)} to ${symbol}${format(high)}`
    : `${symbol}${format(low)}`
}

export function medicineBackgroundContext(
  background: MedicineRecordedBackground | undefined,
): MedicineBackgroundContextView | undefined {
  if (!background || background.version !== 'medicine-background/v1') return undefined

  const recordTier: BackgroundProvenanceTier = background.provenanceTier ?? 'curated'

  const pk = background.pharmacokinetics
  const pharmacokinetics = pk
    ? {
        routeAsRecorded: pk.routeAsRecorded,
        values: [
          ...valueView('How much reaches the bloodstream', pk.bioavailability, recordTier),
          ...valueView('Time to peak level', pk.tMax, recordTier),
          ...valueView('Half-life', pk.halfLife, recordTier),
          ...valueView('Bound to blood proteins', pk.proteinBinding, recordTier),
          ...valueView('Distribution volume', pk.volumeOfDistribution, recordTier),
          ...valueView('How it is broken down', pk.metabolismAsRecorded, recordTier),
          ...valueView('How it leaves the body', pk.eliminationAsRecorded, recordTier),
        ],
        steadyStateNote: pk.steadyStateNote,
      }
    : undefined

  const titration = background.titration
    ? {
        basisLabel:
          background.titration.basis === 'TRIAL_PROTOCOL'
            ? 'Escalation schedule as studied in the trial protocol'
            : 'Escalation schedule as stated on the product label',
        steps: background.titration.steps.map((step) => ({
          period: step.periodAsRecorded,
          amount: step.amountAsRecorded,
          purpose: step.purposeAsRecorded,
        })),
        source: sourceView(background.titration.source),
      }
    : undefined

  const productVariants = background.productVariants?.length
    ? background.productVariants.map((product) => ({
        brandName: product.brandName,
        form: product.formAsRecorded,
        strengths: product.strengthsAsRecorded,
        approvedUse: product.approvedUseAsRecorded,
        jurisdictionLabel:
          PRODUCT_JURISDICTION_LABELS[product.jurisdiction] ?? product.jurisdiction,
        status: product.statusAsRecorded,
        source: sourceView(product.source),
      }))
    : undefined

  const costEntries = background.costContext?.length
    ? background.costContext.map((entry) => ({
        jurisdictionLabel: COST_JURISDICTION_LABELS[entry.jurisdiction] ?? entry.jurisdiction,
        priceTypeLabel: PRICE_TYPE_LABELS[entry.priceType] ?? entry.priceType,
        priceDisplay: `${money(entry.currency, entry.amountLow, entry.amountHigh)} per ${entry.per}`,
        per: entry.per,
        asOf: entry.asOf,
        whoPays: entry.whoPaysAsRecorded,
        normalizedDisplay: entry.normalizedMonthlyUsd
          ? `about ${money('USD', entry.normalizedMonthlyUsd.low, entry.normalizedMonthlyUsd.high)} per month in US dollars`
          : undefined,
        source: sourceView(entry.source),
      }))
    : undefined

  const resolvedAnatomyTargets = background.anatomyTargets?.length
    ? background.anatomyTargets.flatMap((target) => {
        if (!isAnatomyRegionCode(target.regionCode)) return []
        const region = ANATOMY_REGIONS[target.regionCode]
        return [
          {
            regionCode: target.regionCode,
            regionLabel: region.label,
            x: region.x,
            y: region.y,
            action: target.actionAsRecorded,
            source: sourceView(target.source),
          },
        ]
      })
    : undefined
  const anatomyTargets = resolvedAnatomyTargets?.length ? resolvedAnatomyTargets : undefined

  const applicability = background.applicability
    ? {
        trialIdentifier: background.applicability.trialIdentifier,
        included: background.applicability.includedAsRecorded,
        excluded: background.applicability.excludedAsRecorded,
        studiedGroup: background.applicability.studiedGroupAsRecorded,
        source: sourceView(background.applicability.source),
      }
    : undefined

  const pivotalResults = background.pivotalResults?.length
    ? background.pivotalResults.map((result) => ({
        trialIdentifier: result.trialIdentifier,
        endpoint: result.endpointAsRecorded,
        activeResult: result.activeResultAsRecorded,
        comparatorResult: result.comparatorResultAsRecorded,
        difference: result.differenceAsRecorded,
        uncertainty: result.uncertaintyAsRecorded,
        timepoint: result.timepointAsRecorded,
        source: sourceView(result.source),
      }))
    : undefined

  const identifiers = background.registryIdentifiers
  const registryIdentifiers = identifiers
    ? {
        rows: (
          [
            ['PubChem CID', identifiers.pubchemCid],
            ['CAS registry number', identifiers.casNumber],
            ['ATC code', identifiers.atcCode],
            ['FDA UNII', identifiers.unii],
            ['RxNorm RxCUI', identifiers.rxcui],
          ] as const
        ).flatMap(([label, value]) => (value ? [{ label, value }] : [])),
        source: sourceView(identifiers.source),
      }
    : undefined

  const mechanism = background.mechanism
    ? {
        statements: background.mechanism.statements.map((statement) => ({
          text: statement.textAsRecorded,
          source: sourceView(statement.source),
        })),
        ...(background.mechanism.namedTargetsAsRecorded?.length
          ? { namedTargets: background.mechanism.namedTargetsAsRecorded }
          : {}),
      }
    : undefined

  const molecularValues = background.molecularIdentity
    ? [
        ...valueView(
          'Molecular formula',
          background.molecularIdentity.molecularFormula,
          recordTier,
        ),
        ...valueView('Molecular weight', background.molecularIdentity.molecularWeight, recordTier),
      ]
    : []
  const molecularIdentity = molecularValues.length > 0 ? { values: molecularValues } : undefined

  const signalGroups = (['ENZYME', 'TRANSPORTER'] as const)
    .map((kind) => ({
      kindLabel: INTERACTION_KIND_LABELS[kind],
      entries: (background.interactionSignals ?? [])
        .filter((signal) => signal.kind === kind)
        .map((signal) => ({
          counterparty: signal.counterpartyAsRecorded,
          ...(signal.roleAsRecorded
            ? { roleLabel: INTERACTION_ROLE_LABELS[signal.roleAsRecorded] }
            : {}),
          source: sourceView(signal.source),
        })),
    }))
    .filter((group) => group.entries.length > 0)
  const interactionSignals = signalGroups.length > 0 ? { groups: signalGroups } : undefined

  const safetyView = background.safety
    ? {
        ...(background.safety.boxedWarning
          ? {
              boxedWarning: {
                text: background.safety.boxedWarning.textAsRecorded,
                source: sourceView(background.safety.boxedWarning.source),
              },
            }
          : {}),
        ...(background.safety.contraindications?.length
          ? {
              contraindications: background.safety.contraindications.map((statement) => ({
                text: statement.textAsRecorded,
                source: sourceView(statement.source),
              })),
            }
          : {}),
      }
    : undefined
  const safety = safetyView && Object.keys(safetyView).length > 0 ? safetyView : undefined

  const populationStatements = background.populationStatements?.length
    ? background.populationStatements.map((statement) => ({
        populationLabel: POPULATION_LABELS[statement.population] ?? statement.population,
        stateLabel: POPULATION_STATE_LABELS[statement.state] ?? statement.state,
        unresolved: statement.state !== 'STUDIED',
        text: statement.textAsRecorded,
        source: sourceView(statement.source),
      }))
    : undefined

  const commonAdverseReactions = background.commonAdverseReactions
    ? {
        threshold: background.commonAdverseReactions.thresholdAsRecorded,
        events: background.commonAdverseReactions.eventsAsRecorded,
        source: sourceView(background.commonAdverseReactions.source),
      }
    : undefined

  const consensus = background.sourceConsensus
  const sourceConsensus = consensus?.fields.length
    ? {
        documentsExaminedLabel: countPhrase(
          consensus.documentsExamined,
          'published label was read for this medicine',
          'published labels were read for this medicine',
        ),
        fields: consensus.fields.map((field) => ({
          fieldLabel: CONSENSUS_FIELD_LABELS[field.field] ?? field.field,
          agreementLabel: `${Math.round(field.agreementRate * 100)}% of the labels stating it give the most common reading`,
          // Marked as something for a person to look at, never as a verdict on either reading.
          ...(field.numericallyDisjoint
            ? {
                disagreementNote:
                  'Two of these readings give numbers that do not overlap. Both are recorded as printed; neither is marked wrong here.',
              }
            : {}),
          readings: field.readings.map((reading) => ({
            display: reading.display,
            supportLabel: countPhrase(reading.sourceCount, 'label states it', 'labels state it'),
            sources: reading.sources.map(sourceView),
          })),
        })),
      }
    : undefined

  const recordedUses = background.recordedUses?.statements.length
    ? {
        statements: background.recordedUses.statements.map((statement) => ({
          text: statement.textAsRecorded,
          source: sourceView(statement.source),
        })),
      }
    : undefined

  const presence = background.labelPresence
  const labelPresence = presence
    ? {
        labelCountLabel: countPhrase(
          presence.labelCount,
          'published label names',
          'published labels name',
        ),
        aloneLabel:
          presence.singleSubstanceLabelCount > 0
            ? `${presence.singleSubstanceLabelCount.toLocaleString('en-US')} of them name it and no other active ingredient`
            : 'None of them name it and no other active ingredient',
        // Said outright rather than left to be inferred from a page of empty sections. A substance
        // that never appears alone on a label has no source its own data could come from, and that
        // is a fact about the sources rather than about the substance.
        ...(presence.singleSubstanceLabelCount === 0
          ? {
              noSoleSourceNote:
                'Because no published label describes this ingredient on its own, no source states how it works or what it does in the body, and those sections are empty rather than unknown.',
            }
          : {}),
        productTypes: presence.productTypesAsRecorded.map(sentenceCase),
        routes: presence.routesAsRecorded.map(sentenceCase),
        ...(presence.mostRecentEffectiveTime
          ? { mostRecentLabelDate: archiveDate(presence.mostRecentEffectiveTime) }
          : {}),
        source: sourceView(presence.source),
      }
    : undefined

  const market = background.supplementMarket
  const supplementMarket = market
    ? {
        labelCountLabel: countPhrase(
          market.labelCount,
          'supplement product on sale lists this ingredient',
          'supplement products on sale list this ingredient',
        ),
        categories: market.categoriesAsRecorded.map(sentenceCase),
        claimTypes: market.claimTypesAsRecorded.map(sentenceCase),
        claimNote:
          'A claim printed on a supplement label is made by its manufacturer and is not evaluated by any regulator. Listing the kinds of claim these labels carry says what is printed on them, not whether any of it is true.',
        brands: market.exampleBrands,
        source: sourceView(market.source),
      }
    : undefined

  const composition = background.composition?.ingredients.length
    ? {
        summary: compositionSummary(background.composition),
        ingredients: background.composition.ingredients.map((ingredient) => {
          const ingredientPk = ingredient.pharmacokinetics
          const pkValues = ingredientPk
            ? [
                ...valueView(
                  'How much reaches the bloodstream',
                  ingredientPk.bioavailability,
                  recordTier,
                ),
                ...valueView('Time to peak level', ingredientPk.tMax, recordTier),
                ...valueView('Half-life', ingredientPk.halfLife, recordTier),
                ...valueView('Bound to blood proteins', ingredientPk.proteinBinding, recordTier),
                ...valueView('Distribution volume', ingredientPk.volumeOfDistribution, recordTier),
                ...valueView(
                  'How it is broken down',
                  ingredientPk.metabolismAsRecorded,
                  recordTier,
                ),
                ...valueView(
                  'How it leaves the body',
                  ingredientPk.eliminationAsRecorded,
                  recordTier,
                ),
              ]
            : []
          const ingredientMolecular = ingredient.molecularIdentity
            ? [
                ...valueView(
                  'Molecular formula',
                  ingredient.molecularIdentity.molecularFormula,
                  recordTier,
                ),
                ...valueView(
                  'Molecular weight',
                  ingredient.molecularIdentity.molecularWeight,
                  recordTier,
                ),
              ]
            : []
          return {
            name: ingredient.nameAsRecorded,
            ...(ingredient.strengthAsRecorded ? { strength: ingredient.strengthAsRecorded } : {}),
            dataStateLabel:
              ingredient.substanceDataState === 'RECORDED'
                ? 'Sources describe this ingredient on its own'
                : 'No source describes this ingredient on its own, so nothing below is recorded for it',
            ...(ingredient.recordedUses?.statements.length
              ? {
                  uses: ingredient.recordedUses.statements.map((statement) => ({
                    text: statement.textAsRecorded,
                    source: sourceView(statement.source),
                  })),
                }
              : {}),
            ...(ingredient.mechanism?.statements.length
              ? {
                  mechanism: ingredient.mechanism.statements.map((statement) => ({
                    text: statement.textAsRecorded,
                    source: sourceView(statement.source),
                  })),
                }
              : {}),
            ...(pkValues.length > 0 ? { pharmacokinetics: pkValues } : {}),
            ...(ingredientMolecular.length > 0 ? { molecularIdentity: ingredientMolecular } : {}),
            ...(ingredient.interactionSignals?.length
              ? {
                  interactions: ingredient.interactionSignals.map((signal) => ({
                    counterparty: signal.counterpartyAsRecorded,
                    ...(signal.roleAsRecorded
                      ? { roleLabel: INTERACTION_ROLE_LABELS[signal.roleAsRecorded] }
                      : {}),
                    source: sourceView(signal.source),
                  })),
                }
              : {}),
          }
        }),
      }
    : undefined

  const view: MedicineBackgroundContextView = {
    authoredAt: background.authoredAt,
    ...(mechanism ? { mechanism } : {}),
    ...(molecularIdentity ? { molecularIdentity } : {}),
    ...(interactionSignals ? { interactionSignals } : {}),
    ...(safety ? { safety } : {}),
    ...(populationStatements ? { populationStatements } : {}),
    ...(commonAdverseReactions ? { commonAdverseReactions } : {}),
    ...(recordedUses ? { recordedUses } : {}),
    ...(sourceConsensus ? { sourceConsensus } : {}),
    ...(labelPresence ? { labelPresence } : {}),
    ...(supplementMarket ? { supplementMarket } : {}),
    ...(composition ? { composition } : {}),
    ...(recordTier === 'extracted' ? { provenanceNote: EXTRACTED_RECORD_NOTE } : {}),
    ...(recordTier === 'transcribed' ? { provenanceNote: TRANSCRIBED_RECORD_NOTE } : {}),
    pharmacokinetics,
    titration,
    productVariants,
    costEntries,
    anatomyTargets,
    applicability,
    pivotalResults,
    registryIdentifiers: registryIdentifiers?.rows.length ? registryIdentifiers : undefined,
  }
  const hasContent = Object.entries(view).some(
    ([key, value]) => key !== 'authoredAt' && value !== undefined,
  )
  return hasContent ? view : undefined
}
