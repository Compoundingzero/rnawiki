/**
 * Substance identity and synonym candidates.
 *
 * Two medicine slugs can carry the same substance under two names. Sometimes that is a naming
 * variant of one registered substance (alumina and aluminum oxide), sometimes an originator and its
 * biosimilar recorded under the same nonproprietary stem, sometimes two botanical names for one
 * plant. Every one of those is a question about the RECORDS, and this agent's whole output is that
 * question, put to a person with the evidence attached. It never merges anything, never proposes a
 * merge as decided, and never states that two names denote one substance.
 *
 * Two signals are computed and reported separately, because they are not the same strength of
 * evidence:
 *
 *   1. A shared UNII. The FDA Substance Registration System assigns one UNII per substance, so two
 *      records carrying the same one were, by the identity resolution that produced them, resolved
 *      to the same registered substance. This is the strong signal.
 *   2. A shared source document. Two records structured out of the same fetched artifact may be two
 *      names for one thing, or may simply be two of the several substances a combination label
 *      declares. That difference is why this signal is reported on its own and filtered hard before
 *      it is reported at all.
 *
 * THE BASE/SALT BOUNDARY IS NEVER CROSSED. Barium sulfate and barium acetate are different
 * substances with materially different behaviour, and metoprolol succinate and metoprolol tartrate
 * differ in ways that change every number recorded against them. Where two names are separated by a
 * salt, ester or hydrate word, the pair is excluded and counted as excluded rather than dropped
 * silently, whatever identifier the two records happen to share. An identifier collision across a
 * base and its salt is a reason to distrust the identifier, not a reason to merge the records.
 */

import type {
  AgentCorpusEntry,
  AgentInput,
  AgentRun,
  DatasetAgent,
  ReviewCandidate,
} from '@/lib/agents/core/types'
import type { BackgroundSource, MedicineRecordedBackground } from '@/lib/background/types'
import { RECORDED_BACKGROUND_MODULES } from '@/lib/background/types'
import type { RecordedBackgroundModule } from '@/lib/background/types'

/* ------------------------------------------------------------------------------------------- */
/* Salt, ester and counterion vocabulary                                                        */
/* ------------------------------------------------------------------------------------------- */

/**
 * Anion, ester and hydrate words. A name separated from another by any of these describes a
 * different physical substance, so the test on these is unconditional: the word appearing on either
 * side of the difference between two names is enough to exclude the pair.
 */
const SALT_ANION_AND_ESTER_TERMS: ReadonlySet<string> = new Set([
  'acetate',
  'aceponate',
  // Added after the published output paired a base with its own salt or complex: pasireotide with
  // pasireotide diaspartate, and patiromer with patiromer sorbitex. A term missing from this list
  // is not a narrower guarantee, it is a broken one, because the module claims the boundary is
  // never crossed.
  'aspartate',
  'diaspartate',
  'sorbitex',
  'sorbitol',
  'calcium',
  'magnesium',
  'acetonide',
  'anhydrous',
  'benzoate',
  'besilate',
  'besylate',
  'bicarbonate',
  'bisulfate',
  'bitartrate',
  'bromide',
  'butyrate',
  'caproate',
  'carbonate',
  'chloride',
  'cipionate',
  'citrate',
  'cypionate',
  'decanoate',
  'diacetate',
  'dihydrate',
  'diphosphate',
  'dipropionate',
  'edisylate',
  'embonate',
  'enanthate',
  'esylate',
  'fluoride',
  'fumarate',
  'furoate',
  'glucoheptonate',
  'gluconate',
  'glucuronate',
  'hcl',
  'hemisulfate',
  'heptanoate',
  'hexanoate',
  'hydrate',
  'hydrobromide',
  'hydrochloride',
  'hydroiodide',
  'hydroxide',
  'iodide',
  'isethionate',
  'lactate',
  'laurate',
  'maleate',
  'malate',
  'malonate',
  'mesilate',
  'mesylate',
  'monohydrate',
  'myristate',
  'napsylate',
  'nitrate',
  'nitrite',
  'octanoate',
  'oxalate',
  'palmitate',
  'pamoate',
  'phosphate',
  'pivalate',
  'probutate',
  'propionate',
  'pyrophosphate',
  'pyruvate',
  'saccharate',
  'salicylate',
  'sesquihydrate',
  'stearate',
  'succinate',
  'sulfate',
  'sulfite',
  'sulphate',
  'tartrate',
  'tosylate',
  'trihydrate',
  'undecanoate',
  'undecylenate',
  'valerate',
  'xinafoate',
])

/**
 * Counterion words, tested only when one name's words are a strict subset of the other's.
 *
 * The conditional matters. Where the shorter name is the longer one minus a counterion, the longer
 * name is the salt of the shorter — "fluoride" and "sodium fluoride" are a base and its salt, and
 * the pair is excluded. Where the two names differ on both sides, the counterion word is doing
 * different work: "alumina" and "aluminum oxide" are two spellings of one oxide, not a base and a
 * salt of it, and an unconditional test would throw that real synonym away.
 */
const COUNTERION_CATION_TERMS: ReadonlySet<string> = new Set([
  'ammonium',
  'arginine',
  'benzathine',
  'calcium',
  'choline',
  'diolamine',
  'dipotassium',
  'disodium',
  'lysine',
  'magnesium',
  'meglumine',
  'olamine',
  'potassium',
  'procaine',
  'sodium',
  'tromethamine',
  'trisodium',
  'zinc',
])

/** UNII values are ten characters of upper-case letters and digits. Anything else is ambiguous. */
const UNII_SHAPE = /^[A-Z0-9]{10}$/u

/* ------------------------------------------------------------------------------------------- */
/* Output types                                                                                 */
/* ------------------------------------------------------------------------------------------- */

export const SYNONYM_EVIDENCE_KINDS = [
  'SHARED_REGISTRY_IDENTIFIER',
  'SHARED_SOURCE_DOCUMENT',
] as const
/**
 * Which of the two signals put a group together. They are never merged into one list, because a
 * shared substance identifier and a shared PDF are not the same claim about the world.
 */
export type SynonymEvidenceKind = (typeof SYNONYM_EVIDENCE_KINDS)[number]

/**
 * Modules a record may hold, reported per member so a reviewer sees what a merge would affect.
 * Taken from the envelope's own list rather than kept by hand, because the hand-kept copy was six
 * modules out of date and understated the stakes of every merge question it asked.
 */
const COMPARABLE_MODULE_KEYS = RECORDED_BACKGROUND_MODULES
export type ComparableModuleKey = RecordedBackgroundModule

export interface SynonymGroupMember {
  slug: string
  name: string
  /** Which recorded-background modules this record holds. */
  modulesHeld: readonly ComparableModuleKey[]
  /** Distinct `kind:identifier` source documents this record was structured from. */
  sourceIdentifiers: readonly string[]
}

/** One member's reading of one field, kept whole. Readings are listed, never reduced to one. */
export interface FieldReading {
  slug: string
  display: string
  unit?: string
  populationContext: string
  sourceIdentifier: string
}

export const FIELD_AGREEMENT_STATES = ['agree', 'differ', 'not_comparable'] as const
export type FieldAgreementState = (typeof FIELD_AGREEMENT_STATES)[number]

/**
 * How the members' readings of one field stand next to each other.
 *
 * `differ` records that the readings are not the same. It is not a finding that either reading is
 * wrong, and nothing here chooses between them.
 */
export interface RecordedFieldComparison {
  /** Dotted path into the recorded-background envelope, e.g. `pharmacokinetics.halfLife`. */
  field: string
  state: FieldAgreementState
  readings: readonly FieldReading[]
  note: string
}

export interface SynonymCandidateGroup {
  evidence: SynonymEvidenceKind
  /** The UNII, or the `kind:identifier` document key, every member carries. */
  sharedKey: string
  /** The same key in ordinary language, for display beside the group. */
  sharedKeyLabel: string
  members: readonly SynonymGroupMember[]
  comparisons: readonly RecordedFieldComparison[]
  agreeingFields: number
  differingFields: number
  notComparableFields: number
}

/**
 * A pair or group held back because a salt, ester or hydrate word separates the names.
 *
 * Reported rather than discarded: a reviewer reading the candidate list needs to know the list was
 * filtered, and by what.
 */
export interface SaltFormExclusion {
  evidence: SynonymEvidenceKind
  sharedKey: string
  slugs: readonly string[]
  /** The salt, ester or counterion words that separate the names. */
  separatingTerms: readonly string[]
}

export interface SubstanceSynonymDataset {
  /** Groups keyed on a shared UNII. The stronger signal, listed first everywhere. */
  registryIdentifierGroups: readonly SynonymCandidateGroup[]
  /** Groups keyed on a shared source document. Weaker, and filtered far harder. */
  sharedDocumentGroups: readonly SynonymCandidateGroup[]
  saltFormExclusions: readonly SaltFormExclusion[]
  /** What each stage of the pipeline saw and rejected, so an empty result is readable. */
  signalCounts: {
    recordsCarryingUnii: number
    recordsCarryingMalformedUnii: number
    uniiValuesSharedByMoreThanOneRecord: number
    saltFormPairsExcluded: number
    /**
     * Identifiers held by more records than a naming variation can plausibly account for.
     *
     * The comment on `MAX_GROUP_SIZE` claimed these were "dropped and counted"; only the dropping
     * was implemented. Seven identifiers vanished between the shared-identifier count and the
     * published groups the first time the corpus grew enough to produce one — aflibercept and its
     * five biosimilars share a UNII — and nothing said so, in the one dataset whose purpose is to
     * report what each stage rejected.
     */
    uniiValuesRejectedAsTooManyRecords: number
    sharedDocumentsConsidered: number
    documentPairsRejectedForMultipleDeclaredSubstances: number
    documentPairsRejectedForSaltForm: number
    /** Pairs where the extra words name another recorded medicine, so the pair is a combination. */
    documentPairsRejectedForCombinationProduct: number
    documentPairsRejectedForUnrelatedNames: number
    documentPairsAlreadyCarriedByIdentifier: number
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Name comparison                                                                              */
/* ------------------------------------------------------------------------------------------- */

function nameWords(slug: string): string[] {
  return slug.split('-').filter((word) => word.length > 0)
}

function symmetricDifference(left: readonly string[], right: readonly string[]): string[] {
  const inLeft = new Set(left)
  const inRight = new Set(right)
  const out: string[] = []
  for (const word of left) if (!inRight.has(word) && !out.includes(word)) out.push(word)
  for (const word of right) if (!inLeft.has(word) && !out.includes(word)) out.push(word)
  return out
}

/** True when one name's words are all present in the other's and the other has more. */
function isStrictWordSubset(left: readonly string[], right: readonly string[]): boolean {
  const inLeft = new Set(left)
  const inRight = new Set(right)
  const leftInsideRight =
    [...inLeft].every((word) => inRight.has(word)) && inLeft.size < inRight.size
  const rightInsideLeft =
    [...inRight].every((word) => inLeft.has(word)) && inRight.size < inLeft.size
  return leftInsideRight || rightInsideLeft
}

/**
 * The salt, ester or counterion words separating two recorded names, empty when none do.
 *
 * A non-empty result is a hard stop: the two names describe different physical substances and are
 * never candidates for the same record, whatever identifier they share.
 */
/**
 * Whether the words separating two names are themselves the name of another recorded medicine.
 *
 * This is the combination-product test. Two names where one contains the other look like a
 * spelling variant, and the difference between a variant and a combination is not visible in the
 * strings alone — it is visible in whether the extra words name something else the corpus knows.
 */
export function namesACombination(
  leftSlug: string,
  rightSlug: string,
  bySlug: ReadonlyMap<string, unknown>,
): boolean {
  const shorter = leftSlug.length <= rightSlug.length ? leftSlug : rightSlug
  const longer = leftSlug.length <= rightSlug.length ? rightSlug : leftSlug
  const shorterWords = new Set(shorter.split('-'))
  const extra = longer.split('-').filter((word) => !shorterWords.has(word))
  if (extra.length === 0) return false
  // Every arrangement of the leftover words is tried, because a second ingredient may itself be a
  // multi-word name.
  for (let start = 0; start < extra.length; start += 1) {
    for (let end = start + 1; end <= extra.length; end += 1) {
      if (bySlug.has(extra.slice(start, end).join('-'))) return true
    }
  }
  return false
}

export function separatingSaltTerms(leftSlug: string, rightSlug: string): string[] {
  const left = nameWords(leftSlug)
  const right = nameWords(rightSlug)
  const difference = symmetricDifference(left, right)
  const terms = difference.filter((word) => SALT_ANION_AND_ESTER_TERMS.has(word))
  if (isStrictWordSubset(left, right)) {
    for (const word of difference) {
      if (COUNTERION_CATION_TERMS.has(word) && !terms.includes(word)) terms.push(word)
    }
  }
  return terms.sort()
}

/** True when either recorded name is wholly contained in the other, ignoring word order. */
function oneNameContainsTheOther(leftSlug: string, rightSlug: string): boolean {
  const left = new Set(nameWords(leftSlug))
  const right = new Set(nameWords(rightSlug))
  return [...left].every((word) => right.has(word)) || [...right].every((word) => left.has(word))
}

/* ------------------------------------------------------------------------------------------- */
/* Reading the corpus                                                                           */
/* ------------------------------------------------------------------------------------------- */

function documentKey(source: BackgroundSource): string {
  return `${source.kind}:${source.identifier}`
}

const SOURCE_KIND_LABELS: Record<BackgroundSource['kind'], string> = {
  FDA_LABEL: 'FDA label document',
  DAILYMED: 'DailyMed document',
  EMA_SMPC: 'EMA summary of product characteristics',
  PUBMED: 'PubMed record',
  CLINICALTRIALS: 'ClinicalTrials.gov record',
  PUBCHEM: 'PubChem record',
  RXNORM: 'RxNorm record',
  NADAC: 'NADAC pricing dataset',
  NICE_BNF: 'BNF monograph',
  PUBLISHED_ANALYSIS: 'published analysis',
  DSLD: 'supplement label database',
  NCBI_TAXONOMY: 'NCBI Taxonomy',
  FDA_NDC: 'FDA National Drug Code directory',
}

function* allSources(background: MedicineRecordedBackground): Generator<BackgroundSource> {
  const pharmacokinetics = background.pharmacokinetics
  if (pharmacokinetics) {
    for (const key of [
      'bioavailability',
      'tMax',
      'halfLife',
      'proteinBinding',
      'volumeOfDistribution',
      'metabolismAsRecorded',
      'eliminationAsRecorded',
    ] as const) {
      const value = pharmacokinetics[key]
      if (value) yield value.source
    }
  }
  if (background.titration) yield background.titration.source
  for (const variant of background.productVariants ?? []) yield variant.source
  for (const cost of background.costContext ?? []) yield cost.source
  for (const target of background.anatomyTargets ?? []) yield target.source
  if (background.applicability) yield background.applicability.source
  for (const result of background.pivotalResults ?? []) yield result.source
  if (background.registryIdentifiers) yield background.registryIdentifiers.source
  for (const statement of background.mechanism?.statements ?? []) yield statement.source
  const molecular = background.molecularIdentity
  if (molecular?.molecularFormula) yield molecular.molecularFormula.source
  if (molecular?.molecularWeight) yield molecular.molecularWeight.source
  for (const signal of background.interactionSignals ?? []) yield signal.source
  if (background.safety?.boxedWarning) yield background.safety.boxedWarning.source
  for (const item of background.safety?.contraindications ?? []) yield item.source
  for (const statement of background.populationStatements ?? []) yield statement.source
  if (background.commonAdverseReactions) yield background.commonAdverseReactions.source
}

function modulesHeld(background: MedicineRecordedBackground): ComparableModuleKey[] {
  return COMPARABLE_MODULE_KEYS.filter((key) => {
    const value = background[key]
    if (value === undefined) return false
    return Array.isArray(value) ? value.length > 0 : true
  })
}

/* ------------------------------------------------------------------------------------------- */
/* Field comparison                                                                             */
/* ------------------------------------------------------------------------------------------- */

/** Fields carrying a parsed number, where a unit mismatch makes two readings incomparable. */
const RECORDED_VALUE_FIELDS = [
  'pharmacokinetics.bioavailability',
  'pharmacokinetics.tMax',
  'pharmacokinetics.halfLife',
  'pharmacokinetics.proteinBinding',
  'pharmacokinetics.volumeOfDistribution',
  'pharmacokinetics.metabolismAsRecorded',
  'pharmacokinetics.eliminationAsRecorded',
  'molecularIdentity.molecularFormula',
  'molecularIdentity.molecularWeight',
] as const

/** Fields recorded as one string, compared on the string alone. */
const PLAIN_STRING_FIELDS = [
  'pharmacokinetics.routeAsRecorded',
  'registryIdentifiers.pubchemCid',
  'registryIdentifiers.casNumber',
  'registryIdentifiers.atcCode',
  'registryIdentifiers.rxcui',
  'registryIdentifiers.unii',
] as const

interface RawReading {
  slug: string
  display: string
  numeric?: number
  unit?: string
  populationContext: string
  sourceIdentifier: string
}

function readRecordedValueField(
  entry: AgentCorpusEntry,
  field: (typeof RECORDED_VALUE_FIELDS)[number],
): RawReading | undefined {
  const [moduleKey, valueKey] = field.split('.') as [string, string]
  const container =
    moduleKey === 'pharmacokinetics'
      ? entry.background.pharmacokinetics
      : entry.background.molecularIdentity
  if (!container) return undefined
  const value = (container as Record<string, unknown>)[valueKey]
  if (value === undefined || typeof value !== 'object' || value === null) return undefined
  const recorded = value as {
    display: string
    numeric?: number
    unit?: string
    populationContext: string
    source: BackgroundSource
  }
  return {
    slug: entry.slug,
    display: recorded.display,
    ...(recorded.numeric === undefined ? {} : { numeric: recorded.numeric }),
    ...(recorded.unit === undefined ? {} : { unit: recorded.unit }),
    populationContext: recorded.populationContext,
    sourceIdentifier: documentKey(recorded.source),
  }
}

function readPlainStringField(
  entry: AgentCorpusEntry,
  field: (typeof PLAIN_STRING_FIELDS)[number],
): RawReading | undefined {
  if (field === 'pharmacokinetics.routeAsRecorded') {
    const pharmacokinetics = entry.background.pharmacokinetics
    if (!pharmacokinetics) return undefined
    const source = [...allSources(entry.background)][0]
    return {
      slug: entry.slug,
      display: pharmacokinetics.routeAsRecorded,
      populationContext: 'route as the source states it',
      sourceIdentifier: source ? documentKey(source) : 'none recorded',
    }
  }
  const registry = entry.background.registryIdentifiers
  if (!registry) return undefined
  const key = field.slice('registryIdentifiers.'.length) as
    'pubchemCid' | 'casNumber' | 'atcCode' | 'rxcui' | 'unii'
  const value = registry[key]
  if (value === undefined) return undefined
  return {
    slug: entry.slug,
    display: value,
    populationContext: 'registry identifier as recorded',
    sourceIdentifier: documentKey(registry.source),
  }
}

function normalizeForComparison(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/gu, ' ')
}

function toFieldReading(reading: RawReading): FieldReading {
  return {
    slug: reading.slug,
    display: reading.display,
    ...(reading.unit === undefined ? {} : { unit: reading.unit }),
    populationContext: reading.populationContext,
    sourceIdentifier: reading.sourceIdentifier,
  }
}

/**
 * Compare the readings two or more members hold of one field.
 *
 * A unit mismatch is `not_comparable` rather than `differ`, and the distinction is not cosmetic: a
 * volume of distribution recorded as 40 L and one recorded as 0.6 L/kg are neither the same number
 * nor different numbers, and treating them as disagreeing would invent a disagreement the sources
 * never had. Nothing in here converts between units, and nothing chooses between readings.
 */
function compareReadings(field: string, readings: readonly RawReading[]): RecordedFieldComparison {
  const shown = readings.map(toFieldReading)
  const units = new Set(readings.map((reading) => reading.unit ?? ''))
  const everyReadingIsNumeric = readings.every((reading) => reading.numeric !== undefined)

  if (everyReadingIsNumeric && units.size > 1) {
    const listed = [...units].map((unit) => (unit === '' ? 'no unit recorded' : unit)).sort()
    return {
      field,
      state: 'not_comparable',
      readings: shown,
      note: `Recorded in different units (${listed.join(' and ')}). The readings are not placed on one scale here.`,
    }
  }

  if (everyReadingIsNumeric) {
    const numbers = readings.map((reading) => reading.numeric ?? Number.NaN)
    const first = numbers[0] ?? Number.NaN
    const identical = numbers.every(
      (value) => Math.abs(value - first) <= 1e-9 * Math.max(1, Math.abs(first)),
    )
    return {
      field,
      state: identical ? 'agree' : 'differ',
      readings: shown,
      note: identical
        ? 'Every member records the same number in the same unit.'
        : 'The members record different numbers in the same unit. Both readings stand as recorded; neither is preferred here.',
    }
  }

  const displays = new Set(readings.map((reading) => normalizeForComparison(reading.display)))
  if (displays.size === 1) {
    return {
      field,
      state: 'agree',
      readings: shown,
      note: 'Every member records the same wording.',
    }
  }
  return {
    field,
    state: 'differ',
    readings: shown,
    note: 'The recorded wordings are not identical. At least one member recorded no parsed number, so this is a difference in wording that may or may not be a difference in value.',
  }
}

function buildComparisons(
  members: readonly AgentCorpusEntry[],
  skipField?: string,
): RecordedFieldComparison[] {
  const comparisons: RecordedFieldComparison[] = []
  for (const field of RECORDED_VALUE_FIELDS) {
    if (field === skipField) continue
    const readings = members
      .map((member) => readRecordedValueField(member, field))
      .filter((reading): reading is RawReading => reading !== undefined)
    if (readings.length < 2) continue
    comparisons.push(compareReadings(field, readings))
  }
  for (const field of PLAIN_STRING_FIELDS) {
    if (field === skipField) continue
    const readings = members
      .map((member) => readPlainStringField(member, field))
      .filter((reading): reading is RawReading => reading !== undefined)
    if (readings.length < 2) continue
    comparisons.push(compareReadings(field, readings))
  }
  return comparisons
}

/* ------------------------------------------------------------------------------------------- */
/* Group assembly                                                                               */
/* ------------------------------------------------------------------------------------------- */

function toMember(entry: AgentCorpusEntry): SynonymGroupMember {
  const identifiers = [...new Set([...allSources(entry.background)].map(documentKey))].sort()
  return {
    slug: entry.slug,
    name: entry.name,
    modulesHeld: modulesHeld(entry.background),
    sourceIdentifiers: identifiers,
  }
}

function assembleGroup(
  evidence: SynonymEvidenceKind,
  sharedKey: string,
  sharedKeyLabel: string,
  entries: readonly AgentCorpusEntry[],
  skipField?: string,
): SynonymCandidateGroup {
  const ordered = [...entries].sort((left, right) => (left.slug < right.slug ? -1 : 1))
  const comparisons = buildComparisons(ordered, skipField)
  return {
    evidence,
    sharedKey,
    sharedKeyLabel,
    members: ordered.map(toMember),
    comparisons,
    agreeingFields: comparisons.filter((entry) => entry.state === 'agree').length,
    differingFields: comparisons.filter((entry) => entry.state === 'differ').length,
    notComparableFields: comparisons.filter((entry) => entry.state === 'not_comparable').length,
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Parameters                                                                                   */
/* ------------------------------------------------------------------------------------------- */

/**
 * A shared document naming more than this many records is a formulary, an allergenic panel or a
 * multivitamin label, not a naming variant, and is not read as identity evidence at all.
 */
const MAX_SHARED_DOCUMENT_FAN_OUT = 8

/**
 * A group keyed on an identifier larger than this is not a set of names for one substance; it is an
 * identifier recorded too loosely, and is dropped and counted rather than published.
 */
const MAX_GROUP_SIZE = 4

/* ------------------------------------------------------------------------------------------- */
/* The agent                                                                                    */
/* ------------------------------------------------------------------------------------------- */

function questionFor(group: SynonymCandidateGroup, slug: string): string {
  const others = group.members
    .filter((member) => member.slug !== slug)
    .map((member) => member.name)
    .join(', ')
  const evidenceSentence =
    group.evidence === 'SHARED_REGISTRY_IDENTIFIER'
      ? `Both records carry ${group.sharedKeyLabel}.`
      : `Both records were structured from the same ${group.sharedKeyLabel}, which is weaker evidence of identity than a shared substance identifier.`
  return `Does this record name the same registered substance as ${others}? ${evidenceSentence} Someone needs to decide whether these records should be merged, cross-linked as alternative names for one substance, or left separate. Nothing here decides that, and no record has been changed.`
}

function basisFor(group: SynonymCandidateGroup): string {
  const counts = `${group.agreeingFields} recorded fields match, ${group.differingFields} do not match, and ${group.notComparableFields} cannot be placed on one scale.`
  const strength =
    group.evidence === 'SHARED_REGISTRY_IDENTIFIER'
      ? 'Grouped on a shared substance identifier.'
      : 'Grouped on a shared source document and a recorded name wholly contained in the other.'
  return `${strength} ${counts} Matching fields are not proof of one substance, and fields that do not match are not proof of two. Priority ranks the shared identifier signal above the shared document signal, then by how many recorded fields both records hold.`
}

function candidatesFor(group: SynonymCandidateGroup): ReviewCandidate[] {
  const overlap = group.comparisons.length
  const base = group.evidence === 'SHARED_REGISTRY_IDENTIFIER' ? 1000 : 0
  const sources = [
    ...new Set(group.members.flatMap((member) => [...member.sourceIdentifiers])),
  ].sort()
  return group.members.map((member) => ({
    slug: member.slug,
    reason: 'POSSIBLE_DUPLICATE_SUBSTANCE' as const,
    question: questionFor(group, member.slug),
    priority: base + overlap,
    basis: basisFor(group),
    sources,
  }))
}

export const substanceSynonymAgent: DatasetAgent<SubstanceSynonymDataset> = {
  name: 'substance-synonyms',
  // 1.1.0 reports the identifiers rejected for holding too many records, which were previously
  // dropped without a count.
  version: '1.1.0',
  description:
    'Groups records that carry the same substance identifier, and separately records structured from the same source document, and asks a person whether each group names one substance.',

  run(input: AgentInput): AgentRun<SubstanceSynonymDataset> {
    // Nothing in this agent is randomised, so `seed` selects no behaviour. It is carried into the
    // run record because a dataset is identified by the parameters it was produced under, and a
    // seed that silently means nothing is better than a seed that is quietly missing.
    const corpus = [...input.corpus].sort((left, right) => (left.slug < right.slug ? -1 : 1))
    const bySlug = new Map(corpus.map((entry) => [entry.slug, entry]))

    /* --- Signal one: a shared UNII. ------------------------------------------------------- */

    const byUnii = new Map<string, AgentCorpusEntry[]>()
    let recordsCarryingUnii = 0
    let recordsCarryingMalformedUnii = 0
    for (const entry of corpus) {
      const unii = entry.background.registryIdentifiers?.unii
      if (unii === undefined) continue
      if (!UNII_SHAPE.test(unii)) {
        recordsCarryingMalformedUnii += 1
        continue
      }
      recordsCarryingUnii += 1
      byUnii.set(unii, [...(byUnii.get(unii) ?? []), entry])
    }

    const registryIdentifierGroups: SynonymCandidateGroup[] = []
    const saltFormExclusions: SaltFormExclusion[] = []
    let uniiValuesSharedByMoreThanOneRecord = 0
    let uniiValuesRejectedAsTooManyRecords = 0

    for (const unii of [...byUnii.keys()].sort()) {
      const entries = byUnii.get(unii) ?? []
      if (entries.length < 2) continue
      uniiValuesSharedByMoreThanOneRecord += 1

      const separating = new Set<string>()
      for (let left = 0; left < entries.length; left += 1) {
        for (let right = left + 1; right < entries.length; right += 1) {
          const leftSlug = entries[left]?.slug
          const rightSlug = entries[right]?.slug
          if (leftSlug === undefined || rightSlug === undefined) continue
          for (const term of separatingSaltTerms(leftSlug, rightSlug)) separating.add(term)
        }
      }
      if (separating.size > 0) {
        // A shared identifier across a base and its salt is a reason to doubt the identifier, and
        // never a reason to treat the two records as one substance.
        saltFormExclusions.push({
          evidence: 'SHARED_REGISTRY_IDENTIFIER',
          sharedKey: unii,
          slugs: entries.map((entry) => entry.slug).sort(),
          separatingTerms: [...separating].sort(),
        })
        continue
      }
      if (entries.length > MAX_GROUP_SIZE) {
        uniiValuesRejectedAsTooManyRecords += 1
        continue
      }
      registryIdentifierGroups.push(
        assembleGroup(
          'SHARED_REGISTRY_IDENTIFIER',
          unii,
          `UNII ${unii}`,
          entries,
          'registryIdentifiers.unii',
        ),
      )
    }

    /* --- Signal two: a shared source document. -------------------------------------------- */

    const byDocument = new Map<string, { label: string; slugs: Set<string> }>()
    for (const entry of corpus) {
      for (const source of allSources(entry.background)) {
        const key = documentKey(source)
        const held = byDocument.get(key) ?? {
          label: `${SOURCE_KIND_LABELS[source.kind]} ${source.identifier}`,
          slugs: new Set<string>(),
        }
        held.slugs.add(entry.slug)
        byDocument.set(key, held)
      }
    }

    let sharedDocumentsConsidered = 0
    let documentPairsRejectedForMultipleDeclaredSubstances = 0
    let documentPairsRejectedForSaltForm = 0
    let documentPairsRejectedForCombinationProduct = 0
    let documentPairsRejectedForUnrelatedNames = 0
    let documentPairsAlreadyCarriedByIdentifier = 0
    // Keyed on the slug pair, holding the first document that produced it. The document signal is
    // never chained: if A and B share one document and B and C share another, that is two separate
    // questions, and joining them would key a group on a document one of its members was never
    // read from.
    const documentPairs = new Map<string, { slugs: [string, string]; document: string }>()

    for (const key of [...byDocument.keys()].sort()) {
      const held = byDocument.get(key)
      if (held === undefined) continue
      const slugs = [...held.slugs].sort()
      if (slugs.length < 2 || slugs.length > MAX_SHARED_DOCUMENT_FAN_OUT) continue
      sharedDocumentsConsidered += 1

      for (let left = 0; left < slugs.length; left += 1) {
        for (let right = left + 1; right < slugs.length; right += 1) {
          const leftSlug = slugs[left]
          const rightSlug = slugs[right]
          if (leftSlug === undefined || rightSlug === undefined) continue
          const leftEntry = bySlug.get(leftSlug)
          const rightEntry = bySlug.get(rightSlug)
          if (leftEntry === undefined || rightEntry === undefined) continue

          // A pair the identifier signal already carries is not reported twice under weaker
          // evidence.
          const leftUnii = leftEntry.background.registryIdentifiers?.unii
          const rightUnii = rightEntry.background.registryIdentifiers?.unii
          if (leftUnii !== undefined && leftUnii === rightUnii) {
            documentPairsAlreadyCarriedByIdentifier += 1
            continue
          }

          // A label declaring several active substances names them all; two names on it are two of
          // its ingredients until a source about one substance alone says otherwise. Records that
          // did not record a declared substance count are excluded for the same reason: the filter
          // fails closed rather than assuming.
          if (
            leftEntry.background.attribution?.declaredSubstanceCount !== 1 ||
            rightEntry.background.attribution?.declaredSubstanceCount !== 1
          ) {
            documentPairsRejectedForMultipleDeclaredSubstances += 1
            continue
          }
          if (separatingSaltTerms(leftSlug, rightSlug).length > 0) {
            documentPairsRejectedForSaltForm += 1
            continue
          }
          // Sharing a document says nothing about identity on its own. Requiring one recorded name
          // to contain the other keeps the signal to naming variants and drops the ingredients of a
          // combination product, which are related to each other in ways this agent must not model.
          if (!oneNameContainsTheOther(leftSlug, rightSlug)) {
            documentPairsRejectedForUnrelatedNames += 1
            continue
          }
          // A name that contains another name may be a spelling variant or a combination product,
          // and those are opposite answers to the identity question. When the extra words are
          // themselves the name of a different medicine in this corpus, the pair is a combination
          // and its members are not the same substance: nirmatrelvir and nirmatrelvir-ritonavir
          // share a document because one contains the other, not because they are one thing.
          if (namesACombination(leftSlug, rightSlug, bySlug)) {
            documentPairsRejectedForCombinationProduct += 1
            continue
          }
          const pairKey = `${leftSlug}|${rightSlug}`
          if (!documentPairs.has(pairKey)) {
            documentPairs.set(pairKey, { slugs: [leftSlug, rightSlug], document: key })
          }
        }
      }
    }

    const sharedDocumentGroups: SynonymCandidateGroup[] = []
    for (const pairKey of [...documentPairs.keys()].sort()) {
      const pair = documentPairs.get(pairKey)
      if (pair === undefined) continue
      const entries = pair.slugs
        .map((slug) => bySlug.get(slug))
        .filter((entry): entry is AgentCorpusEntry => entry !== undefined)
      if (entries.length < 2) continue
      const label = byDocument.get(pair.document)?.label ?? pair.document
      sharedDocumentGroups.push(
        assembleGroup('SHARED_SOURCE_DOCUMENT', pair.document, label, entries),
      )
    }

    /* --- Queue and reporting. ------------------------------------------------------------- */

    const queue = [...registryIdentifierGroups, ...sharedDocumentGroups]
      .flatMap(candidatesFor)
      .sort(
        (left, right) =>
          right.priority - left.priority ||
          (left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0),
      )

    const output: SubstanceSynonymDataset = {
      registryIdentifierGroups,
      sharedDocumentGroups,
      saltFormExclusions,
      signalCounts: {
        recordsCarryingUnii,
        recordsCarryingMalformedUnii,
        uniiValuesSharedByMoreThanOneRecord,
        uniiValuesRejectedAsTooManyRecords,
        saltFormPairsExcluded: saltFormExclusions.length,
        sharedDocumentsConsidered,
        documentPairsRejectedForMultipleDeclaredSubstances,
        documentPairsRejectedForSaltForm,
        documentPairsRejectedForCombinationProduct,
        documentPairsRejectedForUnrelatedNames,
        documentPairsAlreadyCarriedByIdentifier,
      },
    }

    const groupedSlugs = new Set(
      [...registryIdentifierGroups, ...sharedDocumentGroups].flatMap((group) =>
        group.members.map((member) => member.slug),
      ),
    )

    return {
      agent: substanceSynonymAgent.name,
      version: substanceSynonymAgent.version,
      runDate: input.runDate,
      seed: input.seed,
      parameters: {
        identifierField: 'registryIdentifiers.unii',
        identifierShape: UNII_SHAPE.source,
        maxSharedDocumentFanOut: MAX_SHARED_DOCUMENT_FAN_OUT,
        maxGroupSize: MAX_GROUP_SIZE,
        requireSingleDeclaredSubstanceForDocumentSignal: true,
        requireOneNameToContainTheOtherForDocumentSignal: true,
        saltAnionAndEsterTermCount: SALT_ANION_AND_ESTER_TERMS.size,
        counterionCationTermCount: COUNTERION_CATION_TERMS.size,
      },
      coverage: {
        considered: corpus.length,
        used: recordsCarryingUnii,
        reason: `${recordsCarryingUnii} of ${corpus.length} records carry a well-formed UNII, which is the only field the stronger signal can group on; the rest are invisible to it and can only appear through the weaker shared-document signal. ${groupedSlugs.size} records ended up in a candidate group.`,
      },
      output,
      queue,
      caveats: [
        'A group is a question, not a conclusion. Nothing here has been merged, cross-linked or changed, and no group states that two names are one substance.',
        'The UNII on a record was read from a source at authoring time. This agent did not resolve it against the substance registry, so a wrongly recorded identifier produces a wrong group and a missing one hides a real pair.',
        'Names separated by a salt, ester, hydrate or counterion word are excluded and counted. The word list is fixed, so a salt form named by a word outside it would not be detected, and a reviewer should read the names as well as the counts.',
        'Sharing a source document is weak evidence. It is reported only for records whose source declared a single active substance and whose recorded names contain one another, and even then it catches originator and biosimilar naming as readily as it catches a true duplicate.',
        'Both filters on the document signal are lexical, so two genuine synonyms recorded under unrelated names are not found by it at all.',
        'The document signal reports pairs and never chains them. Two records that share no document are never placed in one group by way of a third record, so a record can appear in more than one pair and each pair stands or falls on its own.',
        'Field comparison reports whether recorded readings match. It never selects a reading, and a field that does not match is not a finding that either record is wrong.',
        'Readings in different units are marked as not comparable and are left in their recorded units. Nothing here converts between them.',
        'Records that agree on every compared field are not thereby one substance, and records that differ are not thereby two.',
      ],
    }
  },
}
