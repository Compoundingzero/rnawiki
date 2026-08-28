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

/**
 * How a value came to be recorded. Both tiers carry the same evidence guarantee — the verbatim
 * excerpt containing every number — but they are different kinds of work and are never presented
 * as the same thing.
 *
 * - `curated`: a person or agent read the fetched artifact, chose the value, wrote its measurement
 *   context, and judged what the source does and does not support.
 * - `extracted`: a deterministic parser matched a pattern in the fetched artifact and stored the
 *   number together with the sentence it was read out of. No judgement was applied, so the
 *   measurement context is the sentence itself rather than an interpretation of it.
 *
 * An `extracted` value is never allowed to overwrite a `curated` one.
 */
export const BACKGROUND_PROVENANCE_TIERS = ['curated', 'extracted'] as const
export type BackgroundProvenanceTier = (typeof BACKGROUND_PROVENANCE_TIERS)[number]

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
  /** Defaults to 'curated' when absent, which is what every hand-authored value is. */
  provenanceTier?: BackgroundProvenanceTier
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
  /** The main study or label section the criteria were recorded from. */
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

/**
 * A statement copied verbatim from a named source section. Nothing is paraphrased, summarized or
 * re-ordered: the text is what the source prints, and the excerpt on the source is the same text,
 * so a reader can always check the record against the sentence it came from.
 */
export interface RecordedStatement {
  textAsRecorded: string
  source: BackgroundSource
  provenanceTier?: BackgroundProvenanceTier
}

/**
 * How the medicine acts, as the source states it. `namedTargetsAsRecorded` holds only tokens that
 * literally appear in the recorded statements — it is an index into the text, never a claim added
 * on top of it.
 */
export interface RecordedMechanism {
  statements: RecordedStatement[]
  namedTargetsAsRecorded?: string[]
}

/**
 * Chemical identity as printed in the source's description section. These are the two facts a
 * chemist checks first and the two a label states unambiguously.
 */
/**
 * A molecular formula as labels print it once whitespace is removed: element symbols with optional
 * counts, plus an optional salt or hydrate after a middle dot (`C4H11N5∙HCl`, `C16H19N3O5S·3H2O`).
 * The extractor and the engine share this one definition so a written formula and a validated
 * formula can never disagree.
 */
export const MOLECULAR_FORMULA_SHAPE =
  /^(?:[A-Z][a-z]?\d{0,3})+(?:[·∙•.](?:\d)?(?:[A-Z][a-z]?\d{0,3})+)?$/u

export interface RecordedMolecularIdentity {
  molecularFormula?: RecordedValue
  molecularWeight?: RecordedValue
}

export const INTERACTION_COUNTERPARTY_KINDS = ['ENZYME', 'TRANSPORTER'] as const
export type InteractionCounterpartyKind = (typeof INTERACTION_COUNTERPARTY_KINDS)[number]

export const INTERACTION_ROLES = ['SUBSTRATE', 'INHIBITOR', 'INDUCER'] as const
export type InteractionRole = (typeof INTERACTION_ROLES)[number]

/**
 * One metabolic or transport counterparty the source names, with the sentence naming it.
 *
 * `roleAsRecorded` is present only when the recorded sentence states exactly one role. A sentence
 * that names several roles carries no role here: the sentence is kept and the reader decides,
 * because guessing which role attaches to which counterparty would be interpretation.
 */
/**
 * Label sections a structural enzyme or transporter role may be read from.
 *
 * US labelling splits these deliberately. Section 12 (Clinical Pharmacology, including 12.3
 * Pharmacokinetics) is descriptive: it states what the medicine is. Section 7 (Drug Interactions)
 * is required by 21 CFR 201.57(c)(8) to carry clinically significant interactions and practical
 * instructions for preventing them — it is the advice section. Reading a role out of Section 7
 * would turn regulated clinical guidance into structured data and infer a property the section
 * never stated, so only descriptive sections are admitted here.
 */
export const DESCRIPTIVE_LABEL_SECTIONS = ['clinical_pharmacology', 'pharmacokinetics'] as const
export type DescriptiveLabelSection = (typeof DESCRIPTIVE_LABEL_SECTIONS)[number]

export interface RecordedInteractionSignal {
  counterpartyAsRecorded: string
  kind: InteractionCounterpartyKind
  roleAsRecorded?: InteractionRole
  /** Which descriptive label section the naming sentence came from. */
  labelSection?: DescriptiveLabelSection
  source: BackgroundSource
  provenanceTier?: BackgroundProvenanceTier
}

/**
 * Harms and hard limits the source states. These are recorded because a record that shows only
 * benefit is not a transparent record; they are statements from the source, never advice.
 */
export interface RecordedSafetyStatements {
  boxedWarning?: RecordedStatement
  contraindications?: RecordedStatement[]
}

export const STUDIED_POPULATIONS = [
  'PEDIATRIC',
  'GERIATRIC',
  'PREGNANCY',
  'LACTATION',
  'HEPATIC_IMPAIRMENT',
  'RENAL_IMPAIRMENT',
] as const
export type StudiedPopulation = (typeof STUDIED_POPULATIONS)[number]

export const POPULATION_EVIDENCE_STATES = ['STUDIED', 'NOT_ESTABLISHED', 'STATEMENT_ONLY'] as const
/**
 * `NOT_ESTABLISHED` is used only when the source itself says effectiveness or safety has not been
 * established. `STATEMENT_ONLY` means the source discusses the group without settling that
 * question — it is deliberately distinct from both a positive finding and a silence.
 */
export type PopulationEvidenceState = (typeof POPULATION_EVIDENCE_STATES)[number]

export interface RecordedPopulationStatement {
  population: StudiedPopulation
  state: PopulationEvidenceState
  textAsRecorded: string
  source: BackgroundSource
  provenanceTier?: BackgroundProvenanceTier
}

/**
 * The source's own "most common adverse reactions" sentence, kept whole.
 *
 * Only the threshold and the list the source prints together are recorded. Per-event percentages
 * are deliberately not parsed out of label tables: pairing a number to an event across table text
 * is exactly the kind of guess that would put a wrong frequency on a real harm.
 */
export interface RecordedCommonAdverseReactions {
  thresholdAsRecorded: string
  eventsAsRecorded: string[]
  source: BackgroundSource
  provenanceTier?: BackgroundProvenanceTier
}

/**
 * How specifically the source document is about the medicine the record belongs to.
 *
 * The excerpt guarantee proves a value appears in its source sentence. It does not prove the
 * source was about this medicine — and a multi-ingredient document (an allergenic extract, a
 * homeopathic combination, a multivitamin) names dozens of substances while saying nothing
 * substance-specific about any one of them. `declaredSubstanceCount` is how many distinct active
 * substances the source declared, after salt forms are collapsed; 1 means the source is about this
 * medicine alone, which is the only basis on which a substance-specific claim may be recorded.
 */
export interface RecordedAttribution {
  declaredSubstanceCount: number
}

/**
 * Modules that state something about a substance itself, and therefore may only be recorded from a
 * source that is about that substance alone. Product identity is deliberately not in this list: a
 * combination product genuinely is a product containing the medicine.
 */
export const SUBSTANCE_SPECIFIC_MODULES = [
  'pharmacokinetics',
  'mechanism',
  'molecularIdentity',
  'interactionSignals',
  'safety',
  'populationStatements',
  'commonAdverseReactions',
] as const
export type SubstanceSpecificModule = (typeof SUBSTANCE_SPECIFIC_MODULES)[number]

/**
 * One distinct reading of a field, and every source that states it.
 *
 * A medicine is often covered by many labels — gabapentin by more than four hundred — because each
 * manufacturer publishes its own. Keeping only one discards the fact that the others agree, which
 * is the strongest thing the corpus can say about a value and the thing no other public resource
 * reports. Sources are capped for size, and the count is the full count regardless.
 */
export interface ConsensusReading {
  display: string
  numeric?: number
  unit?: string
  sourceCount: number
  sources: BackgroundSource[]
}

/**
 * What every source in the corpus states for one field of one medicine.
 *
 * Deliberately NOT a resolved value. Where readings differ, both are kept with their own excerpts
 * and neither is preferred, because most apparent numeric disagreement between labels is a real
 * difference in population or formulation — fed against fasted, immediate against extended release
 * — rather than one label being wrong. Deciding between them is a judgement this record exists to
 * present rather than to make.
 */
export interface RecordedFieldConsensus {
  field: string
  /** Documents that stated this field at all. */
  sourceCount: number
  /** Distinct readings, most-supported first. */
  readings: ConsensusReading[]
  /** Share of sources stating the most-supported reading, in [0, 1]. */
  agreementRate: number
  /**
   * True when at least two readings carry numbers whose ranges do not overlap. This marks a pair
   * worth a person's attention; it is not a claim that either reading is wrong.
   */
  numericallyDisjoint: boolean
}

export interface RecordedSourceConsensus {
  /** Documents examined for this medicine, whether or not they stated anything. */
  documentsExamined: number
  fields: RecordedFieldConsensus[]
}

export interface MedicineRecordedBackground {
  version: typeof MEDICINE_BACKGROUND_VERSION
  /** ISO date this record was authored from fetched artifacts. */
  authoredAt: string
  /**
   * The tier of the record as a whole. A `curated` record was assembled by a person or agent; an
   * `extracted` record was produced by the deterministic label parser. Absent means `curated`.
   */
  provenanceTier?: BackgroundProvenanceTier
  pharmacokinetics?: RecordedPharmacokinetics
  titration?: RecordedTitration
  productVariants?: RecordedProductVariant[]
  costContext?: RecordedCostEntry[]
  anatomyTargets?: RecordedAnatomyTarget[]
  applicability?: RecordedApplicability
  pivotalResults?: RecordedPivotalResult[]
  registryIdentifiers?: RecordedRegistryIdentifiers
  mechanism?: RecordedMechanism
  molecularIdentity?: RecordedMolecularIdentity
  interactionSignals?: RecordedInteractionSignal[]
  safety?: RecordedSafetyStatements
  populationStatements?: RecordedPopulationStatement[]
  commonAdverseReactions?: RecordedCommonAdverseReactions
  attribution?: RecordedAttribution
  sourceConsensus?: RecordedSourceConsensus
}
