/**
 * Presentation projection for the `medicine-background/v1` envelope. Every rendered value keeps
 * its measurement context, its concordance state and a link to the exact source it was read
 * from; the mapper humanizes labels and resolves canonical source URLs deterministically from
 * recorded identifiers, and adds nothing else.
 */

import { ANATOMY_REGIONS, isAnatomyRegionCode } from '@/lib/background/anatomy-regions'
import type {
  BackgroundSource,
  MedicineRecordedBackground,
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
  concordanceLabel?: string
  discrepantAlternate?: { display: string; source: RecordedSourceView }
  source: RecordedSourceView
}

export interface MedicineBackgroundContextView {
  authoredAt: string
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

function valueView(label: string, value: RecordedValue | undefined): RecordedValueView[] {
  if (!value) return []
  return [
    {
      label,
      display: value.display,
      populationContext: value.populationContext,
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

  const pk = background.pharmacokinetics
  const pharmacokinetics = pk
    ? {
        routeAsRecorded: pk.routeAsRecorded,
        values: [
          ...valueView('How much reaches the bloodstream', pk.bioavailability),
          ...valueView('Time to peak level', pk.tMax),
          ...valueView('Half-life', pk.halfLife),
          ...valueView('Bound to blood proteins', pk.proteinBinding),
          ...valueView('Distribution volume', pk.volumeOfDistribution),
          ...valueView('How it is broken down', pk.metabolismAsRecorded),
          ...valueView('How it leaves the body', pk.eliminationAsRecorded),
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

  const view: MedicineBackgroundContextView = {
    authoredAt: background.authoredAt,
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
