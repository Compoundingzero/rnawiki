/**
 * Deterministic extraction of recorded background from an FDA label.
 *
 * This is how the corpus scales past what hand-authoring can reach. The design turns the dataset's
 * central guarantee into something a parser satisfies by construction rather than by discipline:
 * every extractor locates a sentence in the fetched label, reads the value **out of that
 * sentence**, and stores the sentence as the excerpt. The number is therefore always present in
 * its own excerpt, because it was never anywhere else.
 *
 * What extraction does not do, and must never be presented as doing:
 * - It applies no judgement. A value's measurement context is the sentence it came from, not an
 *   interpretation of it, which is why every extracted value is tagged `provenanceTier:
 *   'extracted'` and a curated value is never overwritten by one.
 * - It does not decide what a label means, whether a medicine works, or what anyone should do.
 * - It skips anything ambiguous. A pattern that could match two different quantities is not used;
 *   an absent value stays absent. Precision is worth far more here than recall, because a wrong
 *   value with a real excerpt beside it is the one failure mode this dataset cannot tolerate.
 */

import type {
  BackgroundSource,
  DescriptiveLabelSection,
  InteractionCounterpartyKind,
  InteractionRole,
  MedicineRecordedBackground,
  PopulationEvidenceState,
  RecordedCommonAdverseReactions,
  RecordedInteractionSignal,
  RecordedMechanism,
  RecordedMolecularIdentity,
  RecordedPharmacokinetics,
  RecordedPopulationStatement,
  RecordedProductVariant,
  RecordedSafetyStatements,
  RecordedStatement,
  RecordedValue,
  StudiedPopulation,
} from './types'
import { MEDICINE_BACKGROUND_VERSION, MOLECULAR_FORMULA_SHAPE } from './types'

/** The label fields the extractors read. Mirrors the openFDA drug/label record shape. */
export interface LabelArtifact {
  setId: string
  /**
   * Distinct active substances the document declares, after salt forms collapse. Absent is treated
   * as unknown, which is refused for substance-specific modules the same way a count above one is.
   */
  declaredSubstanceCount?: number
  effectiveTime?: string
  brandNames: string[]
  genericNames: string[]
  routes: string[]
  unii?: string
  rxcui?: string
  sections: Record<string, string>
}

export const EXTRACTION_MAX_EXCERPT = 400

/** Collapses whitespace so sentence matching is stable across label formatting. */
function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/gu, ' ').trim()
}

/**
 * Splits label prose into sentences. Abbreviations common in labels (mg., e.g., i.v., approx.)
 * would otherwise split mid-sentence and cut an excerpt away from its own number.
 */
function sentences(text: string): string[] {
  const guarded = normalizeWhitespace(text)
    .replace(
      /\b(e\.g|i\.e|approx|vs|Dr|Fig|No|Inc|Ltd|Co|St|U\.S|i\.v|p\.o|b\.i\.d|t\.i\.d|q\.d)\./giu,
      '$1<DOT>',
    )
    .replace(/\b([A-Za-z])\.(?=\s?[A-Za-z]\.)/gu, '$1<DOT>')
  return guarded
    .split(/(?<=[.;])\s+(?=[A-Z(])/u)
    .map((sentence) => sentence.replace(/<DOT>/gu, '.').trim())
    .filter((sentence) => sentence.length > 0)
}

/** Trims a sentence to the excerpt budget without cutting the matched value out of it. */
function excerptAround(sentence: string, matched: string): string | null {
  const clean = normalizeWhitespace(sentence)
  if (clean.length <= EXTRACTION_MAX_EXCERPT) return clean
  const at = clean.indexOf(matched)
  if (at === -1) return null
  // Centre the window on the match so the number always survives the trim.
  const half = Math.floor((EXTRACTION_MAX_EXCERPT - matched.length) / 2)
  const start = Math.max(0, at - half)
  const end = Math.min(clean.length, start + EXTRACTION_MAX_EXCERPT)
  const window = clean.slice(start, end).trim()
  return window.includes(matched) ? window : null
}

interface PatternHit {
  display: string
  numeric?: number
  unit?: string
  sentence: string
  matched: string
}

function firstNumber(text: string): number | undefined {
  const match = /(\d+(?:\.\d+)?)/u.exec(text.replace(/,(?=\d{3}\b)/gu, ''))
  return match ? Number(match[1]) : undefined
}

/**
 * Runs one pattern across the sentences of a section and returns the first unambiguous hit.
 * A sentence that matches the pattern more than once is skipped: two candidate quantities in one
 * sentence is exactly the ambiguity this extractor refuses to resolve on its own.
 */
function findPattern(text: string | undefined, pattern: RegExp): PatternHit | null {
  if (!text) return null
  for (const sentence of sentences(text)) {
    const matches = [
      ...sentence.matchAll(
        new RegExp(
          pattern.source,
          pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`,
        ),
      ),
    ]
    if (matches.length !== 1) continue
    const match = matches[0]!
    const captured = match[1]?.trim()
    if (!captured) continue
    return {
      display: captured,
      numeric: firstNumber(captured),
      sentence,
      matched: match[0],
    }
  }
  return null
}

function toValue(
  hit: PatternHit,
  source: BackgroundSource,
  unit?: string,
  numeric?: number,
): RecordedValue | null {
  const excerpt = excerptAround(hit.sentence, hit.matched)
  if (!excerpt) return null
  // The measurement context of an extracted value is the sentence it came from. Saying more would
  // be an interpretation the parser did not make.
  return {
    display: hit.display,
    ...(numeric !== undefined ? { numeric, unit } : {}),
    populationContext: 'as stated in the label sentence recorded below',
    source: { ...source, excerpt },
    provenanceTier: 'extracted',
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Pharmacokinetic patterns                                                                     */
/* ------------------------------------------------------------------------------------------- */

/** "half-life ... of 14 hours", "elimination half-life is approximately 3 to 5 hours". */
const HALF_LIFE_HOURS =
  /half-?life[^.;]{0,60}?\b(?:is|was|of|averages?|approximately|about|~)?\s*((?:\d+(?:\.\d+)?)(?:\s*(?:to|-|–)\s*\d+(?:\.\d+)?)?\s*(?:hours?|hrs?|h)\b)/iu
const HALF_LIFE_DAYS =
  /half-?life[^.;]{0,60}?\b(?:is|was|of|averages?|approximately|about|~)?\s*((?:\d+(?:\.\d+)?)(?:\s*(?:to|-|–)\s*\d+(?:\.\d+)?)?\s*days?\b)/iu
/** "bioavailability is approximately 89%", "absolute bioavailability of 40%". */
const BIOAVAILABILITY =
  /bioavailability[^.;]{0,60}?\b(?:is|was|of|averages?|approximately|about|~)?\s*((?:\d+(?:\.\d+)?)(?:\s*(?:to|-|–)\s*\d+(?:\.\d+)?)?\s*%)/iu
/** "peak plasma concentrations ... within 1 to 2 hours"; Tmax phrasing varies widely. */
const TMAX_HOURS =
  /(?:peak\s+(?:plasma\s+)?concentrations?|Tmax|T\s?max)[^.;]{0,80}?\b(?:is|was|of|at|within|after|occur(?:s|red)?(?:\s+at)?|reached(?:\s+(?:in|at|within))?|approximately|about|~)\s*((?:\d+(?:\.\d+)?)(?:\s*(?:to|-|–)\s*\d+(?:\.\d+)?)?\s*(?:hours?|hrs?|h)\b)/iu
/** "is 87% bound to plasma proteins", "protein binding is greater than 99%". */
const PROTEIN_BINDING =
  /(?:protein[- ]bind\w*|bound to (?:human )?(?:plasma|serum) proteins?)[^.;]{0,60}?\b(?:is|was|of|approximately|about|~|>|greater than)?\s*((?:>\s*)?(?:\d+(?:\.\d+)?)(?:\s*(?:to|-|–)\s*\d+(?:\.\d+)?)?\s*%)/iu
/**
 * Labels often state the complement instead: "highly bound to plasma proteins, with plasma free
 * fractions of 1.3%". The bound-protein pattern would happily capture that 1.3% and record a
 * 98.7%-bound medicine as 1.3% bound, so any sentence expressing the free side is skipped rather
 * than converted — the parser does not do arithmetic the label did not print.
 */
const FREE_FRACTION_SENTENCE = /\b(?:un-?bound|free fraction|free fractions)\b/iu
/**
 * "volume of distribution is 12.5 L", "apparent volume of distribution of 654 L", and the
 * weight-normalised form "0.14 L/kg". The per-kilogram suffix is part of the capture: dropping it
 * would turn 0.14 L/kg into "0.14 L" and silently mis-state the value by orders of magnitude.
 */
const VOLUME_OF_DISTRIBUTION =
  /volume of distribution[^.;]{0,60}?\b(?:is|was|of|averages?|approximately|about|~)?\s*((?:\d+(?:\.\d+)?)(?:\s*(?:to|-|–)\s*\d+(?:\.\d+)?)?\s*(?:L|liters?|litres?)(?:\s*\/\s*kg)?)\b/iu

const HOURS_PER_DAY = 24

export interface ExtractionOptions {
  retrievedAt: string
  /** Label title used in the source record, normally the medicine's own name. */
  sourceLabel: string
}

function labelSource(artifact: LabelArtifact, options: ExtractionOptions): BackgroundSource {
  return {
    kind: 'FDA_LABEL',
    identifier: artifact.setId,
    label: options.sourceLabel,
    retrievedAt: options.retrievedAt,
  }
}

/** Pharmacokinetic section text, in the order labels usually carry the values. */
function pharmacokineticText(artifact: LabelArtifact): string | undefined {
  const parts = [
    artifact.sections.pharmacokinetics,
    artifact.sections.clinical_pharmacology,
  ].filter((part): part is string => Boolean(part))
  return parts.length > 0 ? parts.join(' ') : undefined
}

export function extractPharmacokinetics(
  artifact: LabelArtifact,
  options: ExtractionOptions,
): RecordedPharmacokinetics | null {
  const text = pharmacokineticText(artifact)
  if (!text) return null
  const source = labelSource(artifact, options)
  const route = artifact.routes[0]?.toLowerCase()
  if (!route) return null

  const values: Partial<RecordedPharmacokinetics> = {}

  const halfLifeHours = findPattern(text, HALF_LIFE_HOURS)
  if (halfLifeHours) {
    const value = toValue(halfLifeHours, source, 'hours', halfLifeHours.numeric)
    if (value) values.halfLife = value
  } else {
    // A half-life stated only in days is recorded as displayed, with no hour figure invented.
    const halfLifeDays = findPattern(text, HALF_LIFE_DAYS)
    if (halfLifeDays) {
      const value = toValue(halfLifeDays, source)
      if (value) values.halfLife = value
    }
  }

  const bioavailability = findPattern(text, BIOAVAILABILITY)
  if (bioavailability) {
    const value = toValue(bioavailability, source, '%', bioavailability.numeric)
    if (value) values.bioavailability = value
  }

  const tMax = findPattern(text, TMAX_HOURS)
  if (tMax) {
    const value = toValue(tMax, source, 'hours', tMax.numeric)
    if (value) values.tMax = value
  }

  const proteinBinding = findPattern(text, PROTEIN_BINDING)
  if (proteinBinding && !FREE_FRACTION_SENTENCE.test(proteinBinding.sentence)) {
    const value = toValue(proteinBinding, source, '%', proteinBinding.numeric)
    if (value) values.proteinBinding = value
  }

  const volume = findPattern(text, VOLUME_OF_DISTRIBUTION)
  if (volume) {
    // A weight-normalised volume keeps its own unit so it is never compared against plain litres.
    const perKilogram = /\/\s*kg/iu.test(volume.display)
    const value = toValue(volume, source, perKilogram ? 'L/kg' : 'L', volume.numeric)
    if (value) values.volumeOfDistribution = value
  }

  if (Object.keys(values).length === 0) return null
  return { routeAsRecorded: route, ...values }
}

/**
 * Plausibility gates for extracted numbers, tighter than the engine's own. A pattern that matched
 * the wrong quantity usually produces an implausible magnitude, so these bounds turn a silent
 * mis-extraction into a dropped value.
 */
export function pharmacokineticsWithinPlausibleRange(
  pharmacokinetics: RecordedPharmacokinetics,
): RecordedPharmacokinetics {
  const within = (value: RecordedValue | undefined, min: number, max: number) => {
    if (!value || typeof value.numeric !== 'number') return value
    return value.numeric >= min && value.numeric <= max ? value : undefined
  }
  // Litres and litres-per-kilogram are different scales and get different bounds.
  const volume =
    pharmacokinetics.volumeOfDistribution?.unit === 'L/kg'
      ? within(pharmacokinetics.volumeOfDistribution, 0.01, 1000)
      : within(pharmacokinetics.volumeOfDistribution, 0.1, 100000)
  const halfLifeHours = within(pharmacokinetics.halfLife, 0.01, HOURS_PER_DAY * 60)
  return {
    routeAsRecorded: pharmacokinetics.routeAsRecorded,
    ...(halfLifeHours ? { halfLife: halfLifeHours } : {}),
    ...(within(pharmacokinetics.bioavailability, 0, 100)
      ? { bioavailability: pharmacokinetics.bioavailability }
      : {}),
    ...(within(pharmacokinetics.tMax, 0, 720) ? { tMax: pharmacokinetics.tMax } : {}),
    ...(within(pharmacokinetics.proteinBinding, 0, 100)
      ? { proteinBinding: pharmacokinetics.proteinBinding }
      : {}),
    ...(volume ? { volumeOfDistribution: volume } : {}),
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Product records                                                                              */
/* ------------------------------------------------------------------------------------------- */

/** Squeezes a label section down to one clause suitable for a short recorded field. */
function firstClause(text: string | undefined, limit = 220): string | null {
  if (!text) return null
  const [first] = sentences(text)
  if (!first) return null
  const clause = normalizeWhitespace(first)
  return clause.length <= limit ? clause : `${clause.slice(0, limit - 1).trimEnd()}…`
}

export function extractProductVariant(
  artifact: LabelArtifact,
  options: ExtractionOptions,
): RecordedProductVariant | null {
  const brandName = artifact.brandNames[0]
  const strengths = firstClause(
    artifact.sections.dosage_forms_and_strengths ?? artifact.sections.how_supplied,
  )
  const approvedUse = firstClause(artifact.sections.indications_and_usage)
  const form = artifact.routes[0]?.toLowerCase()
  if (!brandName || !strengths || !approvedUse || !form) return null

  const effective = artifact.effectiveTime
  const effectiveDate =
    effective && /^\d{8}$/u.test(effective)
      ? `${effective.slice(0, 4)}-${effective.slice(4, 6)}-${effective.slice(6, 8)}`
      : null

  return {
    brandName,
    formAsRecorded: form,
    strengthsAsRecorded: strengths,
    approvedUseAsRecorded: approvedUse,
    jurisdiction: 'US_FDA',
    statusAsRecorded: effectiveDate
      ? `FDA label in effect ${effectiveDate}`
      : 'FDA label as published',
    source: labelSource(artifact, options),
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Mechanism, chemistry, interactions, safety and populations                                   */
/* ------------------------------------------------------------------------------------------- */

/** Sentences shorter than this carry a section heading rather than a statement. */
const MIN_STATEMENT_CHARS = 40
const MAX_STATEMENT_CHARS = 400

/** How many statements one module keeps. Enough to be complete; short enough to stay readable. */
const MAX_MECHANISM_STATEMENTS = 4
const MAX_CONTRAINDICATION_STATEMENTS = 4

/**
 * A label heading such as "12.1 Mechanism of Action" survives sentence splitting as its own
 * fragment. Dropping numbered and title-case headings keeps them out of the recorded statements.
 */
const SECTION_HEADING = /^(?:\d+(?:\.\d+)*\s*)?[A-Z][A-Za-z ]{0,40}$/u

/**
 * Labels print a section heading with no sentence break after it, so the heading arrives glued to
 * the first real sentence ("12.1 Mechanism of Action Metformin is an antihyperglycemic agent…").
 * Removing a known heading from the front leaves a contiguous verbatim span of the source, which
 * is what the excerpt guarantee requires.
 */
function stripSectionHeading(sentence: string, heading: RegExp | undefined): string {
  if (!heading) return sentence
  const prefix = new RegExp(
    `^\\s*(?:\\d+(?:\\.\\d+)*\\s*)?(?:${heading.source})\\s*[:.\\-]?\\s*`,
    'iu',
  )
  return sentence.replace(prefix, '').trim()
}

function statementSentences(text: string | undefined, heading?: RegExp): string[] {
  if (!text) return []
  return sentences(text)
    .map((sentence, index) => (index === 0 ? stripSectionHeading(sentence, heading) : sentence))
    .filter(
      (sentence) =>
        sentence.length >= MIN_STATEMENT_CHARS &&
        sentence.length <= MAX_STATEMENT_CHARS &&
        !SECTION_HEADING.test(sentence),
    )
}

const MECHANISM_HEADING = /mechanism of action/u
const CONTRAINDICATIONS_HEADING = /contraindications?/u

function toStatement(sentence: string, source: BackgroundSource): RecordedStatement {
  // The excerpt is the statement: the record and the quote can never drift apart.
  const text = normalizeWhitespace(sentence)
  return {
    textAsRecorded: text,
    source: { ...source, excerpt: text },
    provenanceTier: 'extracted',
  }
}

/**
 * Pulls the mechanism-of-action text. Labels either carry a dedicated section or place the same
 * prose under a "Mechanism of Action" heading inside clinical pharmacology; both are read, and
 * neither is summarized.
 */
function mechanismText(artifact: LabelArtifact): string | undefined {
  const dedicated = artifact.sections.mechanism_of_action
  if (dedicated) return dedicated
  const pharmacology = artifact.sections.clinical_pharmacology
  if (!pharmacology) return undefined
  const match = /mechanism of action\s*[:.\-]?\s*([\s\S]{40,4000})/iu.exec(pharmacology)
  return match?.[1]
}

/** Named molecular targets, recorded only when the token appears in a kept statement. */
const TARGET_PATTERN =
  /\b(?:(?:5-HT|GABA|NMDA|AMPA|PPAR|VEGFR?|EGFR|HER2|JAK[123]?|BTK|BRAF|MEK|ALK|ROS1|PD-?L?1|CTLA-?4|TNF(?:-?alpha)?|IL-?\d+|SGLT-?[12]|DPP-?4|GLP-?1|ACE2?|HMG-?CoA reductase|COX-?[12]|PDE-?\d|mTOR|CDK-?\d(?:\/\d)?|PARP|proteasome|topoisomerase\s*I{1,2})|(?:alpha|beta|mu|kappa|delta|dopamine|serotonin|histamine|muscarinic|nicotinic|adrenergic|opioid|angiotensin|androgen|estrogen|glucocorticoid)[- ]?(?:\d\s*)?receptors?)\b/giu

export function extractMechanism(
  artifact: LabelArtifact,
  options: ExtractionOptions,
): RecordedMechanism | null {
  const statements = statementSentences(mechanismText(artifact), MECHANISM_HEADING).slice(
    0,
    MAX_MECHANISM_STATEMENTS,
  )
  if (statements.length === 0) return null
  const source = labelSource(artifact, options)
  const recorded = statements.map((sentence) => toStatement(sentence, source))

  const targets = new Set<string>()
  for (const statement of recorded) {
    for (const match of statement.textAsRecorded.matchAll(TARGET_PATTERN)) {
      targets.add(normalizeWhitespace(match[0]))
    }
  }

  return {
    statements: recorded,
    ...(targets.size > 0 ? { namedTargetsAsRecorded: [...targets].sort() } : {}),
  }
}

/**
 * "molecular formula of C 4 H 11 N 5 ∙HCl", "empirical formula C 17 H 17 NCl 2 ·HCl".
 *
 * Labels space out element symbols and counts, and append a salt or hydrate after a middle dot,
 * so the pattern tolerates both and the captured text is de-spaced afterwards.
 */
const MOLECULAR_FORMULA =
  /(?:molecular|empirical|chemical)\s+formula\s*(?:of|is|:|=)?\s*((?:[A-Z][a-z]?\s?\d{0,3}\s?){2,}(?:\s*[·∙•.]\s*(?:\d\s*)?(?:[A-Z][a-z]?\s?\d{0,3}\s?)+)?)/u

/** "molecular weight of 396.44" and "molecular weight is 396.44 g/mol". */
const MOLECULAR_WEIGHT =
  /molecular weight[^.;:]{0,30}?(?:is|of|[:=])\s*(?:approximately\s*|about\s*|~)?((?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d+)?(?:\s*(?:g\s*\/\s*mol|daltons?|Da))?)/iu

/** Below this a "formula" match is an abbreviation; above it the pattern ran past the formula. */
const MIN_MOLECULAR_WEIGHT = 30
const MAX_MOLECULAR_WEIGHT = 200000

export function extractMolecularIdentity(
  artifact: LabelArtifact,
  options: ExtractionOptions,
): RecordedMolecularIdentity | null {
  const description = artifact.sections.description
  if (!description) return null
  const source = labelSource(artifact, options)
  const identity: RecordedMolecularIdentity = {}

  const formulaHit = findPattern(description, MOLECULAR_FORMULA)
  if (formulaHit) {
    // A formula must contain at least one element followed by a count, else the pattern caught prose.
    const formula = formulaHit.display.replace(/\s+/gu, '').replace(/[.,;]+$/u, '')
    if (MOLECULAR_FORMULA_SHAPE.test(formula) && /\d/u.test(formula)) {
      const value = toValue({ ...formulaHit, display: formula }, source)
      if (value) identity.molecularFormula = value
    }
  }

  const weightHit = findPattern(description, MOLECULAR_WEIGHT)
  if (weightHit?.numeric !== undefined) {
    const weight = weightHit.numeric
    if (weight >= MIN_MOLECULAR_WEIGHT && weight <= MAX_MOLECULAR_WEIGHT) {
      const value = toValue(weightHit, source, 'g/mol', weight)
      if (value) identity.molecularWeight = value
    }
  }

  return identity.molecularFormula || identity.molecularWeight ? identity : null
}

const ENZYME_PATTERN = /\bCYP\s?([1-4][A-Z]\d{1,2})\b/giu
const TRANSPORTER_PATTERN =
  /\b(P-?gp|P-?glycoprotein|BCRP|OATP1B[13]|OATP|OAT[13]|OCT[12]|MATE-?[12]?|BSEP)\b/giu

const ROLE_PATTERNS: ReadonlyArray<readonly [InteractionRole, RegExp]> = [
  ['SUBSTRATE', /\bsubstrates?\b/iu],
  ['INHIBITOR', /\binhibitors?\b|\binhibits?\b|\binhibited\b|\binhibition\b/iu],
  ['INDUCER', /\binducers?\b|\binduces?\b|\binduced\b|\binduction\b/iu],
]

/** How many counterparties one record keeps, so a long interactions section stays readable. */
const MAX_INTERACTION_SIGNALS = 12

/**
 * Records the metabolic and transport counterparties the label names, each with the sentence that
 * names it.
 *
 * A role is attached only when the sentence states exactly one of substrate, inhibitor or inducer.
 * Interaction prose routinely names two roles in one sentence ("inhibitors of CYP3A4 increase
 * exposure to this substrate"), and deciding which one belongs to which counterparty is judgement
 * the parser does not have.
 */
export function extractInteractionSignals(
  artifact: LabelArtifact,
  options: ExtractionOptions,
): RecordedInteractionSignal[] {
  // Section 7 (Drug Interactions) is deliberately not read. 21 CFR 201.57(c)(8) makes it the
  // section carrying clinically significant interactions and practical instructions for preventing
  // them — regulated advice. A sentence there such as "coadministration with strong CYP3A4
  // inhibitors increases exposure to this medicine" yields a role only by inference, which is the
  // step this parser refuses everywhere else. Section 12 states the property outright.
  const sections: Array<[DescriptiveLabelSection, string | undefined]> = [
    ['pharmacokinetics', artifact.sections.pharmacokinetics],
    ['clinical_pharmacology', artifact.sections.clinical_pharmacology],
  ]
  if (!sections.some(([, sectionText]) => sectionText)) return []
  const source = labelSource(artifact, options)
  const seen = new Map<string, RecordedInteractionSignal>()

  for (const [labelSection, sectionText] of sections) {
    if (!sectionText) continue
    for (const sentence of sentences(sectionText)) {
      if (sentence.length > MAX_STATEMENT_CHARS) continue
      const roles = ROLE_PATTERNS.filter(([, pattern]) => pattern.test(sentence))
      const role = roles.length === 1 ? roles[0]![0] : undefined
      const excerpt = normalizeWhitespace(sentence)

      const found: Array<[string, InteractionCounterpartyKind]> = [
        ...[...sentence.matchAll(ENZYME_PATTERN)].map(
          (match) =>
            [`CYP${match[1]!.toUpperCase()}`, 'ENZYME'] as [string, InteractionCounterpartyKind],
        ),
        ...[...sentence.matchAll(TRANSPORTER_PATTERN)].map(
          (match) =>
            [match[1]!.toUpperCase(), 'TRANSPORTER'] as [string, InteractionCounterpartyKind],
        ),
      ]

      for (const [counterparty, kind] of found) {
        // First mention wins, so the recorded sentence is the one that introduced the counterparty.
        if (seen.has(counterparty)) continue
        seen.set(counterparty, {
          counterpartyAsRecorded: counterparty,
          kind,
          ...(role ? { roleAsRecorded: role } : {}),
          labelSection,
          source: { ...source, excerpt },
          provenanceTier: 'extracted',
        })
      }
    }
  }

  return [...seen.values()]
    .sort((left, right) => left.counterpartyAsRecorded.localeCompare(right.counterpartyAsRecorded))
    .slice(0, MAX_INTERACTION_SIGNALS)
}

export function extractSafetyStatements(
  artifact: LabelArtifact,
  options: ExtractionOptions,
): RecordedSafetyStatements | null {
  const source = labelSource(artifact, options)
  const safety: RecordedSafetyStatements = {}

  // "BOXED WARNING" is the section label; the "WARNING: <TITLE>" that follows it is meaningful and
  // is kept, so a reader sees what the warning is called.
  const [boxed] = statementSentences(artifact.sections.boxed_warning, /boxed warning/u)
  if (boxed) safety.boxedWarning = toStatement(boxed, source)

  const contraindications = statementSentences(
    artifact.sections.contraindications,
    CONTRAINDICATIONS_HEADING,
  ).slice(0, MAX_CONTRAINDICATION_STATEMENTS)
  if (contraindications.length > 0) {
    safety.contraindications = contraindications.map((sentence) => toStatement(sentence, source))
  }

  return safety.boxedWarning || safety.contraindications ? safety : null
}

const POPULATION_SECTIONS: ReadonlyArray<readonly [StudiedPopulation, string]> = [
  ['PEDIATRIC', 'pediatric_use'],
  ['GERIATRIC', 'geriatric_use'],
  ['PREGNANCY', 'pregnancy'],
  ['LACTATION', 'nursing_mothers'],
]

/**
 * Headings inside a combined "Use in Specific Populations" section.
 *
 * Many labels carry no per-group section at all and put every group under this one heading, so a
 * reader with reduced kidney or liver function would otherwise find nothing recorded — and those
 * two groups have no standalone section anywhere in the label vocabulary.
 */
const COMBINED_POPULATION_HEADINGS: ReadonlyArray<readonly [StudiedPopulation, RegExp]> = [
  ['PEDIATRIC', /pediatric use/iu],
  ['GERIATRIC', /geriatric use/iu],
  ['PREGNANCY', /pregnancy/iu],
  ['LACTATION', /(?:lactation|nursing mothers)/iu],
  ['HEPATIC_IMPAIRMENT', /hepatic impairment/iu],
  ['RENAL_IMPAIRMENT', /renal impairment/iu],
]

/**
 * Returns the text following one subsection heading, stopping at the next numbered heading.
 *
 * The bound matters: without it a group's recorded statement could be pulled from the block that
 * belongs to a different group entirely.
 */
function combinedPopulationText(section: string, heading: RegExp): string | undefined {
  const at = section.search(new RegExp(`\\d+\\.\\d+\\s*${heading.source}`, 'iu'))
  if (at === -1) return undefined
  const rest = section.slice(at)
  const withoutHeading = rest.replace(new RegExp(`^\\d+\\.\\d+\\s*${heading.source}\\s*`, 'iu'), '')
  const next = withoutHeading.search(/\d+\.\d+\s+[A-Z]/u)
  return next === -1 ? withoutHeading : withoutHeading.slice(0, next)
}

/** The label's own phrasing when it says a question was not settled. */
const NOT_ESTABLISHED =
  /\b(?:safety and (?:effectiveness|efficacy)|effectiveness|efficacy|safety)\b[^.;]{0,80}\b(?:have|has)\s+not\s+been\s+established\b/iu
/** The label's own phrasing when it says a group was studied. */
const WAS_STUDIED =
  /\b(?:were|was|have been|has been)\s+(?:studied|evaluated|included|enrolled)\b|\bclinical (?:studies|trials)\b[^.;]{0,60}\binclude[ds]?\b/iu

/**
 * Records what the label says about each group it discusses.
 *
 * The three states stay distinct on purpose. A label that says effectiveness was not established
 * has said something specific and useful; a label that merely discusses a group has not answered
 * the question; and neither is the same as a label that is silent, which produces no record here.
 */
export function extractPopulationStatements(
  artifact: LabelArtifact,
  options: ExtractionOptions,
): RecordedPopulationStatement[] {
  const source = labelSource(artifact, options)
  const statements: RecordedPopulationStatement[] = []

  const combined = artifact.sections.use_in_specific_populations
  const texts = new Map<StudiedPopulation, string>()
  for (const [population, section] of POPULATION_SECTIONS) {
    const text = artifact.sections[section]
    if (text) texts.set(population, text)
  }
  if (combined) {
    for (const [population, heading] of COMBINED_POPULATION_HEADINGS) {
      // A dedicated section is the better source; the combined block only fills what it left out.
      if (texts.has(population)) continue
      const text = combinedPopulationText(combined, heading)
      if (text) texts.set(population, text)
    }
  }

  for (const [population, heading] of COMBINED_POPULATION_HEADINGS) {
    const sectionText = texts.get(population)
    if (!sectionText) continue
    const candidates = statementSentences(sectionText, heading)
    if (candidates.length === 0) continue

    // A sentence that settles the question is preferred over the section's opening line.
    const settling = candidates.find(
      (sentence) => NOT_ESTABLISHED.test(sentence) || WAS_STUDIED.test(sentence),
    )
    const chosen = settling ?? candidates[0]!
    const state: PopulationEvidenceState = NOT_ESTABLISHED.test(chosen)
      ? 'NOT_ESTABLISHED'
      : WAS_STUDIED.test(chosen)
        ? 'STUDIED'
        : 'STATEMENT_ONLY'
    const text = normalizeWhitespace(chosen)

    statements.push({
      population,
      state,
      textAsRecorded: text,
      source: { ...source, excerpt: text },
      provenanceTier: 'extracted',
    })
  }

  return statements
}

/**
 * "The most common adverse reactions (≥5%) were nausea, headache, and fatigue."
 *
 * The threshold and the list are captured together from one sentence, because that is the only
 * form in which the label states them together.
 */
const COMMON_ADVERSE =
  /most common(?:ly reported)? adverse (?:reactions?|events?|drug reactions?)[^.;]{0,60}?\(([^)]{0,80}?(?:≥|>=|>|greater than(?: or equal to)?|at least)\s*\d{1,2}(?:\.\d)?\s*%[^)]{0,60})\)[^.;]{0,140}?\b(?:were|are|include[ds]?)\s*:?\s*([^.;]{10,400})/iu

/** A list longer than this came from a table run together, not from one sentence. */
const MAX_ADVERSE_EVENTS = 20

export function extractCommonAdverseReactions(
  artifact: LabelArtifact,
  options: ExtractionOptions,
): RecordedCommonAdverseReactions | null {
  const text = artifact.sections.adverse_reactions ?? artifact.sections.warnings_and_cautions
  if (!text) return null

  for (const sentence of sentences(text)) {
    const match = COMMON_ADVERSE.exec(sentence)
    if (!match) continue
    const threshold = normalizeWhitespace(match[1]!)
    const events = normalizeWhitespace(match[2]!)
      .replace(/\band\b/giu, ',')
      .split(',')
      .map((event) => event.trim().replace(/[.;:]+$/u, ''))
      .filter((event) => event.length >= 3 && event.length <= 60)
    if (events.length === 0 || events.length > MAX_ADVERSE_EVENTS) continue

    const excerpt = excerptAround(sentence, match[0])
    if (!excerpt) continue
    return {
      thresholdAsRecorded: threshold,
      eventsAsRecorded: events,
      source: { ...labelSource(artifact, options), excerpt },
      provenanceTier: 'extracted',
    }
  }
  return null
}

/* ------------------------------------------------------------------------------------------- */
/* Whole-record extraction                                                                      */
/* ------------------------------------------------------------------------------------------- */

export interface ExtractionResult {
  background: MedicineRecordedBackground | null
  /** Which modules the parser could fill, for coverage reporting. */
  modules: string[]
}

/**
 * Builds an `extracted`-tier background record from one label artifact plus any registry
 * identifiers already resolved for the medicine. Returns a null record when the label supported
 * nothing, which is the honest outcome for the many labels that carry no usable numbers.
 */
export function extractBackgroundFromLabel(args: {
  artifact: LabelArtifact
  options: ExtractionOptions
  registryIdentifiers?: MedicineRecordedBackground['registryIdentifiers']
}): ExtractionResult {
  const { artifact, options } = args
  const modules: string[] = []
  const background: MedicineRecordedBackground = {
    version: MEDICINE_BACKGROUND_VERSION,
    authoredAt: options.retrievedAt,
    provenanceTier: 'extracted',
    ...(artifact.declaredSubstanceCount !== undefined
      ? { attribution: { declaredSubstanceCount: artifact.declaredSubstanceCount } }
      : {}),
  }

  /**
   * Whether the source is about this medicine alone.
   *
   * The excerpt guarantee proves a sentence was printed; it cannot prove the sentence was about
   * this substance. An allergenic extract naming ninety-one pollens, or a homeopathic combination
   * naming gold alongside thirty-five other things, prints sentences that belong to none of them
   * individually. Substance-specific modules are refused unless the document is about one
   * substance, because coverage bought by mis-attribution is worse than no coverage.
   */
  const isSubstanceSpecificSource = artifact.declaredSubstanceCount === 1

  const pharmacokinetics = isSubstanceSpecificSource
    ? extractPharmacokinetics(artifact, options)
    : null
  if (pharmacokinetics) {
    const gated = pharmacokineticsWithinPlausibleRange(pharmacokinetics)
    const hasValue = Object.keys(gated).some((key) => key !== 'routeAsRecorded')
    if (hasValue) {
      background.pharmacokinetics = gated
      modules.push('pharmacokinetics')
    }
  }

  const product = extractProductVariant(artifact, options)
  if (product) {
    background.productVariants = [product]
    modules.push('productVariants')
  }

  const mechanism = isSubstanceSpecificSource ? extractMechanism(artifact, options) : null
  if (mechanism) {
    background.mechanism = mechanism
    modules.push('mechanism')
  }

  const molecularIdentity = isSubstanceSpecificSource
    ? extractMolecularIdentity(artifact, options)
    : null
  if (molecularIdentity) {
    background.molecularIdentity = molecularIdentity
    modules.push('molecularIdentity')
  }

  const interactionSignals = isSubstanceSpecificSource
    ? extractInteractionSignals(artifact, options)
    : []
  if (interactionSignals.length > 0) {
    background.interactionSignals = interactionSignals
    modules.push('interactionSignals')
  }

  const safety = isSubstanceSpecificSource ? extractSafetyStatements(artifact, options) : null
  if (safety) {
    background.safety = safety
    modules.push('safety')
  }

  const populationStatements = isSubstanceSpecificSource
    ? extractPopulationStatements(artifact, options)
    : []
  if (populationStatements.length > 0) {
    background.populationStatements = populationStatements
    modules.push('populationStatements')
  }

  const commonAdverseReactions = isSubstanceSpecificSource
    ? extractCommonAdverseReactions(artifact, options)
    : null
  if (commonAdverseReactions) {
    background.commonAdverseReactions = commonAdverseReactions
    modules.push('commonAdverseReactions')
  }

  if (args.registryIdentifiers) {
    background.registryIdentifiers = args.registryIdentifiers
    modules.push('registryIdentifiers')
  }

  return modules.length > 0 ? { background, modules } : { background: null, modules: [] }
}
