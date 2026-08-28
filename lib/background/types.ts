/**
 * Recorded background data for a medicine record: the `medicine-background/v1` envelope.
 *
 * Contract, in order of importance:
 * 1. Every value is structured from a source artifact fetched at authoring time. The exact
 *    fetched wording that contains the value is stored beside it as a short excerpt, so the
 *    background engine can verify mechanically that a number was read, not remembered.
 * 2. Every value names the population and condition it was measured in. A number without its
 *    measurement context fails validation rather than rendering.
 * 3. Disagreement between sources is data, not a problem to resolve silently: a value either
 *    stands on one source, is corroborated, or is recorded as discrepant with both readings.
 * 4. Derived sentences (steady-state context, per-month normalization) are deterministic
 *    functions of recorded values. The engine recomputes them; a mismatch fails validation.
 *
 * These modules are medicine-wide background in the sense of the existing record layer. They are
 * never a reviewed programme conclusion and never carry treatment guidance; amounts and schedules
 * are recorded exactly as the label or trial protocol states them, as research context.
 */

import type { AnatomyRegionCode } from './anatomy-regions'

export const MEDICINE_BACKGROUND_VERSION = 'medicine-background/v1' as const

export const BACKGROUND_SOURCE_KINDS = [
  'FDA_LABEL',
  'DAILYMED',
  'EMA_SMPC',
  'PUBMED',
  'CLINICALTRIALS',
  'PUBCHEM',
  'RXNORM',
  'NADAC',
  'NICE_BNF',
  'PUBLISHED_ANALYSIS',
] as const
export type BackgroundSourceKind = (typeof BACKGROUND_SOURCE_KINDS)[number]

/** Where a recorded fact came from. `excerpt` is the fetched wording that contains the value. */
export interface BackgroundSource {
  kind: BackgroundSourceKind
  /** setid, PMID, NCT number, CID, RxCUI, TA number, DOI, or dataset date — kind-specific. */
  identifier: string
  label: string
  locator?: string
  /** ISO date the source artifact was fetched during authoring. */
  retrievedAt: string
  /** Exact fetched text containing the value, at most 400 characters. */
  excerpt?: string
}

export const BACKGROUND_CONCORDANCE_STATES = [
  'label_only',
  'label_and_literature_agree',
  'discrepant',
] as const
export type BackgroundConcordance = (typeof BACKGROUND_CONCORDANCE_STATES)[number]

/** One recorded measurement with its context, provenance, and agreement state. */
export interface RecordedValue {
  /** Exactly as displayed, e.g. "~89%" or "165 to 184 hours". */
  display: string
  /** Parsed representative number for range and consistency checks, when the value is numeric. */
  numeric?: number
  unit?: string
  /** Who and what condition the value was measured in, e.g. "healthy adults, single dose". */
  populationContext: string
  source: BackgroundSource
  concordance?: BackgroundConcordance
  /** Present exactly when concordance is 'discrepant': the other reading and its source. */
  alternateValue?: { display: string; source: BackgroundSource }
}

export interface RecordedPharmacokinetics {
  /** Route exactly as the source states it, e.g. "subcutaneous injection". */
  routeAsRecorded: string
  bioavailability?: RecordedValue
  tMax?: RecordedValue
  /** `numeric` is hours when present. */
  halfLife?: RecordedValue
  proteinBinding?: RecordedValue
  volumeOfDistribution?: RecordedValue
  metabolismAsRecorded?: RecordedValue
  eliminationAsRecorded?: RecordedValue
  /**
   * Deterministic derivation from `halfLife.numeric` (about five half-lives to steady state).
   * Must equal `steadyStateNoteFromHalfLifeHours(...)`; the engine recomputes it.
   */
  steadyStateNote?: string
}

export interface RecordedTitrationStep {
  order: number
  /** e.g. "Weeks 1–4", exactly as the protocol or label states the period. */
  periodAsRecorded: string
  /** e.g. "0.25 mg once weekly", exactly as recorded — never advice. */
  amountAsRecorded: string
  purposeAsRecorded?: string
}

export interface RecordedTitration {
  basis: 'TRIAL_PROTOCOL' | 'LABEL_SCHEDULE'
  steps: RecordedTitrationStep[]
  source: BackgroundSource
}

export const PRODUCT_JURISDICTIONS = ['US_FDA', 'EU_EMA', 'UK_MHRA'] as const
export type ProductJurisdiction = (typeof PRODUCT_JURISDICTIONS)[number]

export interface RecordedProductVariant {
  brandName: string
  formAsRecorded: string
  strengthsAsRecorded: string
  approvedUseAsRecorded: string
  jurisdiction: ProductJurisdiction
  statusAsRecorded: string
  source: BackgroundSource
}

export const COST_JURISDICTIONS = ['US', 'UK', 'EU', 'GLOBAL_ANALYSIS'] as const
export type CostJurisdiction = (typeof COST_JURISDICTIONS)[number]
export const COST_CURRENCIES = ['USD', 'GBP', 'EUR'] as const
export type CostCurrency = (typeof COST_CURRENCIES)[number]
export const COST_PRICE_TYPES = [
  'LIST_PRICE',
  'NADAC_UNIT',
  'NHS_INDICATIVE',
  'PUBLISHED_ESTIMATE',
] as const
export type CostPriceType = (typeof COST_PRICE_TYPES)[number]

export interface RecordedCostEntry {
  jurisdiction: CostJurisdiction
  currency: CostCurrency
  priceType: CostPriceType
  amountLow: number
  amountHigh?: number
  /** What the amount buys, e.g. "30 tablets" or "one month at the labelled maintenance amount". */
  per: string
  /** The date the price was recorded by the source, not the authoring date. */
  asOf: string
  whoPaysAsRecorded: string
  source: BackgroundSource
  /**
   * Deterministic normalization for cross-jurisdiction display. Recomputed by the engine from
   * amountLow/amountHigh and the recorded FX rate; a mismatch fails validation.
   */
  normalizedMonthlyUsd?: {
    low: number
    high?: number
    /** Units of USD per one unit of `currency`, recorded with its own date. */
    fxRate?: number
    fxAsOf?: string
  }
}

export interface RecordedAnatomyTarget {
  /** Controlled vocabulary code; drawing coordinates belong to the vocabulary, never the record. */
  regionCode: AnatomyRegionCode
  actionAsRecorded: string
  source: BackgroundSource
}

export interface RecordedApplicability {
  /** The pivotal study or label section the criteria were recorded from. */
  trialIdentifier: string
  includedAsRecorded: string[]
  excludedAsRecorded: string[]
  /** Demographics or setting exactly as recorded, e.g. "74.1% female, mean age 46". */
  studiedGroupAsRecorded?: string
  source: BackgroundSource
}

export interface RecordedPivotalResult {
  trialIdentifier: string
  endpointAsRecorded: string
  activeResultAsRecorded: string
  comparatorResultAsRecorded?: string
  differenceAsRecorded?: string
  /** Confidence interval or other uncertainty exactly as published. */
  uncertaintyAsRecorded?: string
  timepointAsRecorded: string
  source: BackgroundSource
}

export interface RecordedRegistryIdentifiers {
  pubchemCid?: string
  casNumber?: string
  atcCode?: string
  unii?: string
  rxcui?: string
  source: BackgroundSource
}

export interface MedicineRecordedBackground {
  version: typeof MEDICINE_BACKGROUND_VERSION
  /** ISO date this record was authored from fetched artifacts. */
  authoredAt: string
  pharmacokinetics?: RecordedPharmacokinetics
  titration?: RecordedTitration
  productVariants?: RecordedProductVariant[]
  costContext?: RecordedCostEntry[]
  anatomyTargets?: RecordedAnatomyTarget[]
  applicability?: RecordedApplicability
  pivotalResults?: RecordedPivotalResult[]
  registryIdentifiers?: RecordedRegistryIdentifiers
}
