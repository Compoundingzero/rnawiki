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
/**
 * How a record came to exist.
 *
 * `curated` was assembled by a person. `extracted` was read out of a source sentence by the
 * deterministic parser, which is why its numbers satisfy the excerpt guarantee. `transcribed` was
 * copied from a structured field that has no sentence behind it — the supplement label database
 * returns ingredient rows and counts as JSON, and there is no prose to quote. A transcribed value
 * is checkable a different way: by the record identifier and field path it came from, which is
 * recorded instead of an excerpt.
 */
export const BACKGROUND_PROVENANCE_TIERS = ['curated', 'extracted', 'transcribed'] as const
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
  'DSLD',
  'NCBI_TAXONOMY',
  'FDA_NDC',
  'FDA_DRUGSFDA',
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
 * A molecular formula as sources print it once whitespace is removed: element symbols with optional
 * counts, plus an optional salt or hydrate after a middle dot (`C4H11N5∙HCl`, `C16H19N3O5S·3H2O`),
 * and an optional trailing charge for an ionic species (`Ca+2`, `CHO3-`). Ions are formulas too,
 * and refusing them silently dropped seventy real compounds.
 * The extractor and the engine share this one definition so a written formula and a validated
 * formula can never disagree.
 */
export const MOLECULAR_FORMULA_SHAPE =
  /^(?:[A-Z][a-z]?\d{0,3})+(?:[·∙•.](?:\d)?(?:[A-Z][a-z]?\d{0,3})+)?(?:[+-]\d{0,2}|\d{0,2}[+-])?$/u

export interface RecordedMolecularIdentity {
  molecularFormula?: RecordedValue
  molecularWeight?: RecordedValue
}

export const INTERACTION_COUNTERPARTY_KINDS = ['ENZYME', 'TRANSPORTER'] as const
export type InteractionCounterpartyKind = (typeof INTERACTION_COUNTERPARTY_KINDS)[number]

export const INTERACTION_ROLES = ['SUBSTRATE', 'INHIBITOR', 'INDUCER'] as const
export type InteractionRole = (typeof INTERACTION_ROLES)[number]

/**
 * Whether the recorded sentence asserts the role or denies it.
 *
 * Labels state negative findings as often as positive ones — "abacavir does not inhibit human
 * CYP3A4, CYP2D6, or CYP2C9" is a real result from a real study, and roughly three quarters of the
 * role-bearing sentences in this corpus are of that kind. A parser that matched the verb and
 * ignored the negation recorded every one of them as the opposite of what the label said. Polarity
 * exists so the denial survives as a denial, because "was tested and does not inhibit" is more
 * informative than silence and must never be shown as "inhibits".
 */
export const INTERACTION_POLARITIES = ['ASSERTED', 'NEGATED'] as const
export type InteractionPolarity = (typeof INTERACTION_POLARITIES)[number]

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
  /**
   * Whether the sentence asserts the role or denies it. Absent only on records written before
   * polarity was recorded; a role with unknown polarity may not be displayed as an assertion.
   */
  polarity?: InteractionPolarity
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
 * Modules that state something about a SUBSTANCE, and may therefore only be recorded from a source
 * about that substance alone.
 *
 * These belong to an ingredient rather than to a product. A combination label discusses each of its
 * substances' mechanisms and pharmacokinetics separately, and attributing either to the product as
 * a whole would say something none of its sources said.
 */
export const SUBSTANCE_SPECIFIC_MODULES = [
  'pharmacokinetics',
  'mechanism',
  'molecularIdentity',
  'interactionSignals',
] as const
export type SubstanceSpecificModule = (typeof SUBSTANCE_SPECIFIC_MODULES)[number]

/**
 * Modules that state something about the PRODUCT, and may be recorded from the product's own label
 * however many substances it contains.
 *
 * This distinction was learned the hard way. Refusing everything on a multi-ingredient document
 * discarded amoxicillin with clavulanate, sulfamethoxazole with trimethoprim, carbidopa with
 * levodopa and every other combination — and their boxed warnings, contraindications and adverse
 * reactions were never substance claims to begin with. A combination product's label warns about
 * the combination, which is exactly the thing a reader of that page is taking.
 */
export const PRODUCT_LEVEL_MODULES = [
  'recordedUses',
  'productVariants',
  'safety',
  'populationStatements',
  'commonAdverseReactions',
  'applicability',
  'titration',
  'costContext',
] as const
export type ProductLevelModule = (typeof PRODUCT_LEVEL_MODULES)[number]

/**
 * Whether substance-specific data was found for one ingredient, stated rather than implied.
 *
 * An absent field cannot distinguish "no source describes this substance on its own" from "nobody
 * has looked yet", and a record that cannot tell those apart is a record that gets confused when it
 * has no answer. Every ingredient carries one of these outright.
 */
export const SUBSTANCE_DATA_STATES = ['RECORDED', 'NO_SOURCE_ABOUT_THIS_SUBSTANCE_ALONE'] as const
export type SubstanceDataState = (typeof SUBSTANCE_DATA_STATES)[number]

/**
 * One active ingredient of a product, carrying the substance data that belongs to it.
 *
 * Ingredients are data, never pages. The same substance appears inside every product that contains
 * it, keyed by `substanceKey`, so a correction to one substance's mechanism reaches every product
 * built on it rather than being re-authored per product.
 */
/**
 * What a source says a substance is used for, in the source's own words.
 *
 * Nearly every published label carries an indications section — 99.8% of the single-substance
 * labels in this corpus — and for a great many substances it is the only section there is. A
 * homeopathic ingredient, a botanical extract or a mineral has no clinical-pharmacology text to
 * read a mechanism out of, so a record built only from mechanism and pharmacokinetics leaves those
 * substances blank when their label plainly states something a reader wants.
 *
 * This is a statement about the SOURCE, not an endorsement. That a label says a preparation is used
 * for a complaint is a fact about the label; whether it works is not something the label settles
 * and not something recorded here.
 */
/**
 * What the supplement label database records about an ingredient across the products containing it.
 *
 * Supplements are most of this corpus by row count and almost none of it by evidence, because they
 * are absent from the drug-label archive entirely: a dietary supplement carries no
 * clinical-pharmacology section, no pharmacokinetics and no mechanism, and inventing an equivalent
 * would be the one thing this project must never do.
 *
 * What CAN be recorded honestly is what the database itself holds — how many marketed labels list
 * the ingredient, what categories those products are, what kinds of claim they carry, and which
 * labels they are so any of it can be checked. Every number here is a count the database returned,
 * not a measurement of anything in a person.
 */
export interface RecordedSupplementMarket {
  /** Labels currently marketed that list this ingredient. */
  labelCount: number
  /** Ingredient categories the database assigns, e.g. botanical, vitamin, mineral. */
  categoriesAsRecorded: string[]
  /**
   * Claim types the containing labels carry, as the database classifies them. A structure/function
   * claim is made unilaterally by the manufacturer and is not evaluated by any regulator; recording
   * that a claim type is present is not recording that the claim is true.
   */
  claimTypesAsRecorded: string[]
  exampleBrands: string[]
  /** Label identifiers, so every count above can be checked against the database. */
  sampleLabelIds: string[]
  source: BackgroundSource
}

export interface RecordedUses {
  statements: RecordedStatement[]
}

/**
 * What organism a medicine row is, when the row names one.
 *
 * A large part of this corpus is not a molecule. It is a plant, a fungus, an insect, a bacterium or
 * an animal tissue: "Solenopsis Richteri", "Gliocladium Viride", "Curcuma Longa Leaf",
 * "Wuchereria Bancrofti", "Oryctolagus Cuniculus Uterus". Chemistry has nothing to say about any of
 * them, and a page that could say nothing about what the thing IS was the result.
 *
 * A taxonomy answers exactly that and nothing more. It states the accepted scientific name, where
 * the organism sits, and what else it is called — facts about biological nomenclature, not about
 * medicine. Nothing here says an organism treats anything, and nothing may be read that way.
 *
 * `partAsRecorded` keeps the distinction the row itself draws. A row named "Curcuma Longa Leaf" is
 * about the leaf; the taxon is the plant. Recording the part separately is what stops the record
 * claiming the row and the organism are the same thing.
 *
 * Matched only where a name resolves to exactly one taxon. A name claimed by several organisms is
 * refused rather than guessed, on the same rule that governs substance identity: an ambiguous
 * identity is not an identity.
 */
/**
 * What the marketed-product listing records for a substance.
 *
 * The label archive carries documents; the National Drug Code directory carries PRODUCTS, including
 * every product whose labelling has no readable prose. That is why it reaches rows nothing else
 * does — the pneumococcal and meningococcal capsular polysaccharide antigens, the hepatitis and
 * papillomavirus antigens, the biosimilars — each of which is a declared active ingredient of a
 * listed product and appears nowhere in the prose archive.
 *
 * `marketingCategoriesAsRecorded` is the most useful field here and the easiest to misread. FDA
 * lists approved products beside OTC monograph products beside ones marketed without approval, and
 * the category is how they are told apart. Recording it says which route to market a product took.
 * It is not a statement that anything works.
 *
 * `pharmacologicClassesAsRecorded` is taken ONLY from products declaring one active ingredient. The
 * directory attaches the union of a combination's classes to the combination, so a glyburide and
 * metformin tablet carries both "Sulfonylurea" and "Biguanide", and reading either off that product
 * would file glyburide as a biguanide. It is the same attribution rule the rest of the record model
 * runs on, applied to a field that invites the error.
 */
export interface RecordedProductListing {
  /** Listed products declaring this substance as an active ingredient. */
  productCount: number
  /** Those declaring it and no other, which is the only basis for a class or a form of its own. */
  singleIngredientProductCount: number
  dosageFormsAsRecorded: string[]
  routesAsRecorded: string[]
  /** How FDA categorises the route to market: an approved application, a monograph, or neither. */
  marketingCategoriesAsRecorded: string[]
  /** FDA established pharmacologic classes, read only from single-ingredient products. */
  pharmacologicClassesAsRecorded: string[]
  /** The earliest marketing start date among the counted products, as the directory states it. */
  earliestMarketingStartDate?: string
  /** Product codes, so every count above can be checked against the same public directory. */
  sampleProductNdcs: string[]
  source: BackgroundSource
}

/**
 * When a substance was first approved, and under what.
 *
 * The corpus could say what a medicine is and what its label states, and nothing at all about when
 * it entered regulated use. A date orients a reader more than almost anything else on the page: a
 * substance first approved in 1952 and one first approved last year are different kinds of thing
 * even before a word is said about either.
 *
 * Every value is a fact about an application record, not about the medicine. An approval is a
 * regulatory event; it is not a statement that a medicine works, and a discontinued marketing status
 * is not a statement that it failed — products are withdrawn for commercial reasons constantly.
 *
 * The count is of approved applications whose products declare this substance, which includes
 * combination products. That is deliberate and is what the wording says: the earliest approval of a
 * product CONTAINING the substance. Narrowing it to single-ingredient products would answer a
 * different and less useful question.
 */
export interface RecordedRegulatoryApproval {
  /** Approved applications whose products declare this substance as an active ingredient. */
  applicationCount: number
  /** The earliest original approval date among them, as the register states it. */
  earliestOriginalApprovalDate?: string
  /** The application carrying that earliest approval. */
  earliestApplicationNumber?: string
  earliestSponsorAsRecorded?: string
  /** Application kinds seen: a new drug application, a generic one, or a biologics licence. */
  applicationKindsAsRecorded: string[]
  /** Marketing statuses across those products, e.g. prescription, over-the-counter, discontinued. */
  marketingStatusesAsRecorded: string[]
  /** Application numbers, so every count above can be checked against the same public register. */
  sampleApplicationNumbers: string[]
  source: BackgroundSource
}

/**
 * How the supplement label database classifies an ingredient, and what it calls it.
 *
 * Distinct from `supplementMarket`, which counts products on sale. This is the database's record of
 * the INGREDIENT: its canonical name, how the database classifies it, and how many label spellings
 * it has collected for it.
 *
 * It reaches the rows nothing else could. A keyword search of product text cannot find
 * "18-Hydroxyeicosahexaenoic Acid", because no product is named that — but the database holds it as
 * an ingredient group, classified, with its spellings. 1,038 rows that carried nothing at all are
 * ingredient groups in this vocabulary.
 *
 * A category is a filing decision by the database, not a finding about the substance. "Non-nutrient/
 * non-botanical" says where the database put it, and nothing about what it does.
 */
export interface RecordedSupplementIngredient {
  /** The database's own name for the ingredient. */
  groupNameAsRecorded: string
  /** How it classifies the ingredient: botanical, vitamin, mineral, amino acid, and so on. */
  categoriesAsRecorded: string[]
  /** Distinct spellings the database has collected from labels for this ingredient. */
  recordedSpellingCount: number
  source: BackgroundSource
}

/**
 * Ranks at which a name identifies one organism rather than a group of them.
 *
 * A binomial is unambiguous by construction: nothing else is called "Withania somnifera". A bare
 * genus name is a single ordinary word, and single ordinary words collide — *Glycine* is a genus of
 * soybeans and also an amino acid, *Neon* is a genus of jumping spiders and also an element,
 * *Ammonia* is a genus of foraminifera, *Mica* is both a genus and a mineral. Every one of those
 * matched, every one was wrong, and every one was a page telling a reader that a chemical is a
 * plant or an animal.
 *
 * Genus-and-above matches are still worth having — Acacia, Aloe and Agaricus are real botanical
 * rows — so they are kept wherever nothing else says the row is a chemical.
 */
export const RANKS_NAMING_ONE_ORGANISM: ReadonlySet<string> = new Set([
  'species',
  'subspecies',
  'varietas',
  'forma',
  'subvariety',
  'strain',
  'serotype',
  'serovar',
  'genotype',
  'isolate',
  'biotype',
  'morph',
  'pathogroup',
  'serogroup',
  'forma specialis',
])

export interface RecordedBiologicalIdentity {
  /** The accepted scientific name, as the taxonomy states it. */
  scientificName: string
  /** The taxonomic rank the taxonomy assigns, e.g. species, genus, family. */
  rankAsRecorded: string
  /** The ranked lineage from the broadest level down, in the taxonomy's own words. */
  lineageAsRecorded: string[]
  /** Other names the taxonomy carries for this organism. */
  commonNamesAsRecorded: string[]
  /** The part of the organism the medicine row names, when it names one. */
  partAsRecorded?: string
  /** How the corpus name reached this taxon: its scientific name, or a common name it carries. */
  matchedOn: 'SCIENTIFIC_NAME' | 'COMMON_NAME'
  source: BackgroundSource
}

/**
 * Where a substance appears in the published drug-label archive.
 *
 * The extraction pipeline reads prose, so it keeps only labels that have some. That is right for
 * extraction and wrong as a measure of what is knowable: roughly half of this corpus is botanicals,
 * homeopathic preparations, allergenic extracts and animal-derived materials whose labels carry no
 * clinical pharmacology whatsoever. Those rows came out blank, and a blank page implied nothing was
 * known — when in fact the archive recorded the substance as a declared active ingredient of
 * marketed products, in stated forms, by stated routes.
 *
 * Recording that is not a claim about the substance and not an endorsement of anything on those
 * labels. A count of labels is a fact about the archive. `singleSubstanceLabelCount` is the part of
 * it that matters most for reading the rest of a record, because a substance that appears only ever
 * alongside thirty others has no source about it alone, and that is why its other modules are
 * empty.
 *
 * Marketing status is not read from these counts. A label existing does not mean the product was
 * approved, evaluated or found effective — unapproved homeopathic and marketed-unapproved drugs are
 * published in the same archive as approved ones — and nothing here should be read as saying it was.
 */
export interface RecordedLabelPresence {
  /** Published labels declaring this substance as an active ingredient. */
  labelCount: number
  /** Those labels that declare this substance and no other, which is where its own data can come from. */
  singleSubstanceLabelCount: number
  /** Product types as the archive classifies them, e.g. human prescription, human OTC. */
  productTypesAsRecorded: string[]
  /** Routes of administration those labels state. */
  routesAsRecorded: string[]
  /** The most recent effective date among the counted labels, as the archive states it. */
  mostRecentEffectiveTime?: string
  /** Label set identifiers, so every count above can be checked against the same public archive. */
  sampleLabelIds: string[]
  source: BackgroundSource
}

export interface RecordedIngredient {
  /** The substance name as this product's own label prints it, including its salt form. */
  nameAsRecorded: string
  /** Normalized identity shared across every product containing this substance. */
  substanceKey: string
  unii?: string
  /** Strength as the label prints it, when it states one for this ingredient. */
  strengthAsRecorded?: string
  substanceDataState: SubstanceDataState
  supplementMarket?: RecordedSupplementMarket
  labelPresence?: RecordedLabelPresence
  recordedUses?: RecordedUses
  mechanism?: RecordedMechanism
  pharmacokinetics?: RecordedPharmacokinetics
  molecularIdentity?: RecordedMolecularIdentity
  interactionSignals?: RecordedInteractionSignal[]
}

/**
 * What a product is made of.
 *
 * A product with one active ingredient still has a composition; the single-ingredient case is not
 * special, it is just the common one. Keeping it uniform means a page never has two shapes to
 * render and a reader never has to work out which one they are looking at.
 */
export interface RecordedComposition {
  ingredients: RecordedIngredient[]
  /** Active ingredients the product's label declares, which is the length of `ingredients`. */
  declaredIngredientCount: number
  /** Ingredients for which no source about that substance alone was found. */
  ingredientsWithoutSubstanceData: number
}

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

/**
 * Every reader-facing module the envelope declares, named once.
 *
 * Consumers that enumerate modules kept their own copies and the copies went stale. The coverage
 * ledger called 691 records empty because it had never been told about recorded organisms. The
 * evidence-density agent scored records on a denominator missing six modules, so a record rich in
 * the newest ones reported as thin. Both were silent, and both were reporting a smaller corpus than
 * the one that exists.
 *
 * A consumer that needs its own ordering or its own subset states that explicitly and is tested
 * against this list, rather than maintaining a second one by hand.
 */
export const RECORDED_BACKGROUND_MODULES = [
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
  'recordedUses',
  'sourceConsensus',
  'composition',
  'supplementMarket',
  'labelPresence',
  'biologicalIdentity',
  'productListing',
  'regulatoryApproval',
  'supplementIngredient',
] as const
export type RecordedBackgroundModule = (typeof RECORDED_BACKGROUND_MODULES)[number]

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
  recordedUses?: RecordedUses
  attribution?: RecordedAttribution
  sourceConsensus?: RecordedSourceConsensus
  composition?: RecordedComposition
  supplementMarket?: RecordedSupplementMarket
  labelPresence?: RecordedLabelPresence
  biologicalIdentity?: RecordedBiologicalIdentity
  productListing?: RecordedProductListing
  regulatoryApproval?: RecordedRegulatoryApproval
  supplementIngredient?: RecordedSupplementIngredient
}
