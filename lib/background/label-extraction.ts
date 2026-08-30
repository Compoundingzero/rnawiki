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
  InteractionPolarity,
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
  RecordedUses,
  RecordedValue,
  StudiedPopulation,
} from './types'
import { MEDICINE_BACKGROUND_VERSION, MOLECULAR_FORMULA_SHAPE } from './types'
import { PRINTED_NUMBER, firstNumberIn } from './printed-numbers'

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
      numeric: firstNumberIn(captured),
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

/**
 * What may stand between two numbers inside ONE quantity: a range, or a dispersion.
 *
 * The dispersion arm is load-bearing, not cosmetic. A label printing "12 ± 5 hours" defeated a
 * pattern that knew only ranges: the capture group failed at the mean, because " ± 5 hours" is not
 * a range continuation, and the lazy prefix `[^.;]{0,60}?` then slid PAST the mean until the group
 * could match "5 hours". The parser recorded the standard deviation as the half-life.
 *
 * The excerpt guarantee did not catch it and never could. `statesNumber` proves the recorded digit
 * appears in the sentence, and 5 really does appear in "12 ± 5 hours". Number-in-excerpt is a
 * transcription check, not a semantic one: it proves a digit was read, never that it was the right
 * digit. Abiraterone's half-life was recorded as 5 hours from "the mean terminal half-life … is
 * 12 ± 5 hours", and its volume of distribution as 13,358 L from "19,669 ± 13,358 L".
 *
 * With the dispersion recognised, the capture spans the whole quantity and `firstNumberIn` takes
 * the mean. The dispersion stays in `display`, where a reader can see it.
 */
const QUANTITY_SPREAD = String.raw`\s*(?:to|-|–|±|\+/−|\+/-|\+-|−)\s*`

/** "half-life ... of 14 hours", "elimination half-life is approximately 3 to 5 hours". */
const HALF_LIFE_HOURS = new RegExp(
  String.raw`half-?life[^.;]{0,60}?\b(?:is|was|of|averages?|approximately|about|~)?\s*((?:${PRINTED_NUMBER})(?:${QUANTITY_SPREAD}(?:${PRINTED_NUMBER}))?\s*(?:hours?|hrs?|h)\b)`,
  'iu',
)
const HALF_LIFE_DAYS = new RegExp(
  String.raw`half-?life[^.;]{0,60}?\b(?:is|was|of|averages?|approximately|about|~)?\s*((?:${PRINTED_NUMBER})(?:${QUANTITY_SPREAD}(?:${PRINTED_NUMBER}))?\s*days?\b)`,
  'iu',
)
/** "bioavailability is approximately 89%", "absolute bioavailability of 40%". */
const BIOAVAILABILITY = new RegExp(
  String.raw`bioavailability[^.;]{0,60}?\b(?:is|was|of|averages?|approximately|about|~)?\s*((?:${PRINTED_NUMBER})(?:${QUANTITY_SPREAD}(?:${PRINTED_NUMBER}))?\s*%)`,
  'iu',
)
/** "peak plasma concentrations ... within 1 to 2 hours"; Tmax phrasing varies widely. */
const TMAX_HOURS = new RegExp(
  String.raw`(?:peak\s+(?:plasma\s+)?concentrations?|Tmax|T\s?max)[^.;]{0,80}?\b(?:is|was|of|at|within|after|occur(?:s|red)?(?:\s+at)?|reached(?:\s+(?:in|at|within))?|approximately|about|~)\s*((?:${PRINTED_NUMBER})(?:${QUANTITY_SPREAD}(?:${PRINTED_NUMBER}))?\s*(?:hours?|hrs?|h)\b)`,
  'iu',
)
/** "is 87% bound to plasma proteins", "protein binding is greater than 99%". */
const PROTEIN_BINDING = new RegExp(
  String.raw`(?:protein[- ]bind\w*|bound to (?:human )?(?:plasma|serum) proteins?)[^.;]{0,60}?\b(?:is|was|of|approximately|about|~|>|greater than)?\s*((?:>\s*)?(?:${PRINTED_NUMBER})(?:${QUANTITY_SPREAD}(?:${PRINTED_NUMBER}))?\s*%)`,
  'iu',
)
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
const VOLUME_OF_DISTRIBUTION = new RegExp(
  String.raw`volume of distribution[^.;]{0,60}?\b(?:is|was|of|averages?|approximately|about|~)?\s*((?:${PRINTED_NUMBER})(?:${QUANTITY_SPREAD}(?:${PRINTED_NUMBER}))?\s*(?:L|liters?|litres?)(?:\s*\/\s*kg)?)\b`,
  'iu',
)

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

/**
 * The floor for a short statement, allowed only where a label legitimately states one.
 *
 * Forty characters was set to keep section headings out, and it also threw away real indications.
 * Homeopathic and botanical labels state a use in a few words — "INDICATIONS Late growth, fracture
 * consolidation." is a whole published indications section, 35 characters once the heading comes
 * off. 579 rows held a label naming the substance alone and carried nothing, largely for this
 * reason.
 *
 * Lowering the floor everywhere was worse than leaving it. Every other statement module is prose,
 * and a short fragment inside prose is a cross-reference or a category label rather than a
 * statement: "See Boxed WARNING.", "Pregnancy Category C.", "TPOXX Capsules: None." all appeared
 * the moment the floor came down, and "SHAKE WELL BEFORE USE." and "First, wet your skin." are
 * directions, which is the one kind of sentence this project must never present as its own. The
 * short floor is therefore a property of the call, granted only to recorded uses.
 */
const MIN_SHORT_STATEMENT_CHARS = 15
const MIN_SHORT_STATEMENT_WORDS = 3

/**
 * Sentences that are about the label rather than about the medicine.
 *
 * These survive every structural guard — they have punctuation, several words and no heading shape
 * — so they are named. A cross-reference points at a section this record does not hold; a
 * disclaimer describes the regulatory status of the claim rather than the use; an instruction tells
 * a reader what to do, which is the line this project does not cross.
 */
const NOT_A_STATEMENT_ABOUT_THE_MEDICINE =
  /^\s*(?:see\b|refer to\b|for (?:external|topical|rectal|oral) use only\b|shake well\b|keep out of reach\b|store\b|do not use if\b)|\bnot (?:been )?evaluated by the food and drug administration\b|^\s*not fda evaluated\.?\s*$|^\s*pregnancy category\b/iu

/**
 * A short sentence that is not a use, in the shapes this corpus actually produces.
 *
 * Named rather than derived, because the failures are specific and the harm from each is different.
 * A direction — "First, wet your skin.", "No rinsing required.", "After changing diapers." — is an
 * instruction to a reader, and printing one under "what the label says it is for" would make
 * RNAWiki the thing telling them to do it. A fragment closing a bracket it never opened
 * ("Morquio A syndrome).") is the tail of a sentence the splitter cut. A pack size
 * ("HAIR GROWTH 60ml/2 fl oz") is carton text. A leading conjunction is a heading the splitter
 * halved ("& USAGE IMMUNE SUPPORT" from "INDICATIONS & USAGE").
 *
 * These matter only at short lengths: a forty-character sentence has room to be a real statement
 * that merely begins with one of these words.
 */
const SHORT_STATEMENT_IS_NOT_A_USE = [
  /^\s*[&/,;-]/u,
  /^\s*(?:first|then|next|apply|wet|rinse|wash|shake|store|keep|spray|remove|replace|discard|dispense|clean|dry|hold|press|insert|place|repeat|massage|cover|open|close|squeeze|swallow|chew|dissolve)\b/iu,
  /^\s*(?:after|before|while|during|directions?)\b/iu,
  // A frequency is a direction however it is phrased: "Use 2-3 times a week" says when to use the
  // product, not what it is for.
  /\btimes?\s+(?:a|per)\s+(?:day|week|month)\b/iu,
  /\b(?:once|twice|thrice)\s+(?:a|per|daily)\b/iu,
  /\bevery\s+\d+\s*(?:hours?|days?|weeks?)\b/iu,
  /\bno rinsing\b/iu,
  /\d\s*(?:ml|mg|g|gm|oz|fl\s*oz|lb|kg|mcg|count|ct)\b/iu,
] as const

function closesABracketItNeverOpened(sentence: string): boolean {
  let depth = 0
  for (const char of sentence) {
    if (char === '(') depth += 1
    else if (char === ')') {
      depth -= 1
      if (depth < 0) return true
    }
  }
  return false
}

function isAdmissibleStatement(sentence: string, allowShort = false): boolean {
  if (sentence.length > MAX_STATEMENT_CHARS) return false
  if (SECTION_HEADING.test(sentence)) return false
  if (UNFILLED_TEMPLATE.test(sentence)) return false
  if (NOT_A_STATEMENT_ABOUT_THE_MEDICINE.test(sentence)) return false
  if (sentence.length >= MIN_STATEMENT_CHARS) return true
  if (!allowShort || sentence.length < MIN_SHORT_STATEMENT_CHARS) return false
  if (closesABracketItNeverOpened(sentence)) return false
  if (SHORT_STATEMENT_IS_NOT_A_USE.some((pattern) => pattern.test(sentence))) return false
  return (
    sentence.split(/\s+/u).filter((word) => /[A-Za-z]/u.test(word)).length >=
    MIN_SHORT_STATEMENT_WORDS
  )
}

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

/**
 * An SPL authoring template that was published without being filled in.
 *
 * "[Insert boxed warning highlight title] See full prescribing information for complete boxed
 * warning" is a real string on a real published label, and recording it would put meaningless
 * instructions to the label's author on a page where a reader expects the warning itself. Rare —
 * one statement in this corpus — and worth refusing outright, because the one place it appeared was
 * a boxed warning.
 */
const UNFILLED_TEMPLATE =
  /\[\s*insert\b|\[\s*(?:drug|product|company|sponsor|trade)\s*name\s*\]|\bto be completed by\b/iu

function statementSentences(
  text: string | undefined,
  heading?: RegExp,
  options: { allowShort?: boolean } = {},
): string[] {
  if (!text) return []
  return sentences(text)
    .map((sentence, index) => (index === 0 ? stripSectionHeading(sentence, heading) : sentence))
    .filter((sentence) => isAdmissibleStatement(sentence, options.allowShort ?? false))
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

/**
 * "molecular weight of 396.44" and "molecular weight is 396.44 g/mol".
 *
 * The number comes from `PRINTED_NUMBER` rather than from a local alternation. The local one was
 * `(?:\d{1,3}(?:,\d{3})*|\d+)`, whose first branch matches happily with zero comma groups — so on
 * an unseparated "1355.38" it took the first three digits, stopped, and recorded vitamin B12 as
 * weighing 135 g/mol. 107 records across the corpus carried a number truncated this way.
 */
const MOLECULAR_WEIGHT = new RegExp(
  String.raw`molecular weight[^.;:]{0,30}?(?:is|of|[:=])\s*(?:approximately\s*|about\s*|~)?((?:${PRINTED_NUMBER})(?:\s*(?:g\s*\/\s*mol|kilodaltons?|kDa?|daltons?|Da))?)`,
  'iu',
)

/**
 * The unit the label printed, in the label's own magnitude.
 *
 * This used to be the constant `'g/mol'`, stamped on every match whatever the sentence said, and the
 * alternation above had no kilodalton branch — so "molecular weight of approximately 54 kilodaltons"
 * matched the bare "54" and was recorded as 54 g/mol. Every one of the 296 protein rows carrying a
 * weight was stamped that way, and 227 of them stated a weight a thousand times too small: a page
 * said blinatumomab weighs 54 g/mol directly above an excerpt reading "54 kilodaltons". Follitropin,
 * a 30 kDa hormone, was recorded at 31.
 *
 * The number is left exactly as printed rather than converted to grams per mole. Converting would
 * put 54,000 on the page under an excerpt that says 54, and every number this corpus displays has to
 * appear in the excerpt beneath it.
 */
function printedWeightUnit(matched: string): 'g/mol' | 'kDa' | 'Da' {
  if (/kilodaltons?|kDa?\b/iu.test(matched)) return 'kDa'
  if (/daltons?|\bDa\b/iu.test(matched)) return 'Da'
  // No unit printed beside the number. Grams per mole is the convention for a bare molecular weight
  // on a drug label, and it is the reading every such record already carried.
  return 'g/mol'
}

/**
 * Plausible ranges, per unit, because the same number means different things in each.
 *
 * A floor of one atomic mass unit is right for daltons and grams per mole — carbon is 12 and is a
 * recorded medicine — and wrong for kilodaltons, where the smallest real value is a small peptide.
 */
const WEIGHT_RANGES: Record<'g/mol' | 'kDa' | 'Da', { min: number; max: number }> = {
  'g/mol': { min: 30, max: 200000 },
  Da: { min: 30, max: 200000 },
  kDa: { min: 0.5, max: 1000 },
}

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
    //
    // The salt or hydrate separator is written back as a middle dot. Labels print it as a full
    // stop — "C 26 H 29 Cl 2 N 5 O 3 .2H 2 O" for bosutinib monohydrate — and de-spacing turned
    // that into "O3.2H2O", where "3.2" reads as a decimal. The excerpt check then refused the
    // record for a number the label never printed, and bosutinib and elacestrant lost their
    // chemical identity to a punctuation mark.
    const formula = formulaHit.display
      .replace(/\s+/gu, '')
      .replace(/[.,;]+$/u, '')
      .replace(/(?<=[A-Za-z0-9])\.(?=\d*[A-Z])/gu, '·')
    if (MOLECULAR_FORMULA_SHAPE.test(formula) && /\d/u.test(formula)) {
      const value = toValue({ ...formulaHit, display: formula }, source)
      if (value) identity.molecularFormula = value
    }
  }

  const weightHit = findPattern(description, MOLECULAR_WEIGHT)
  if (weightHit?.numeric !== undefined) {
    const weight = weightHit.numeric
    const unit = printedWeightUnit(weightHit.matched)
    const range = WEIGHT_RANGES[unit]
    if (weight >= range.min && weight <= range.max) {
      const value = toValue(weightHit, source, unit, weight)
      if (value) identity.molecularWeight = value
    }
  }

  return identity.molecularFormula || identity.molecularWeight ? identity : null
}

const ENZYME_PATTERN = /\bCYP\s?([1-4][A-Z]\d{1,2})\b/giu
const TRANSPORTER_PATTERN =
  /\b(P-?gp|P-?glycoprotein|BCRP|OATP1B[13]|OATP|OAT[13]|OCT[12]|MATE-?[12]?|BSEP)\b/giu

/**
 * Negation cues that flip what a role sentence is saying.
 *
 * Regulatory pharmacology reports negative findings constantly — "does not inhibit", "is not a
 * substrate of", "no inhibition was observed" — and those sentences carry the same verbs as the
 * positive ones. Matching the verb alone recorded three quarters of this corpus's roles as the
 * opposite of what the label stated, so polarity is read before a role is admitted.
 */
const NEGATION_CUE =
  /\b(?:not|no|neither|nor|without|lack(?:s|ed|ing)?|absence of|fail(?:s|ed)? to|unlikely to|minimal(?:ly)?|negligible)\b/iu

/** Counts how many times any role verb appears, to detect a sentence that both asserts and denies. */
const ROLE_VERB_OCCURRENCE =
  /\b(?:substrates?|inhibitors?|inhibits?|inhibited|inhibition|inducers?|induces?|induced|induction)\b/giu

const ROLE_PATTERNS: ReadonlyArray<readonly [InteractionRole, RegExp]> = [
  ['SUBSTRATE', /\bsubstrates?\b/iu],
  ['INHIBITOR', /\binhibitors?\b|\binhibits?\b|\binhibited\b|\binhibition\b/iu],
  ['INDUCER', /\binducers?\b|\binduces?\b|\binduced\b|\binduction\b/iu],
]

/*
 * There is deliberately no cap here any more.
 *
 * The old rule kept twelve counterparties, chosen by sorting the names alphabetically and taking the
 * first twelve. Because the discard rule was the alphabet, the loss was systematic rather than
 * random: the signal-count histogram decayed smoothly to eleven and then spiked at exactly twelve,
 * and P-glycoprotein -- the most thoroughly characterised efflux transporter in regulatory
 * pharmacology -- sorts near the end and was therefore deleted preferentially from precisely the
 * medicines whose labels characterised it most fully. Nothing in the record said a truncation had
 * happened, so a reader and an agent both saw a short list that looked complete.
 *
 * A canonical evidence record keeps everything the source stated. A long list is a presentation
 * problem, and it is solved where presentation is decided.
 */

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
      const negated = NEGATION_CUE.test(sentence)
      const roleVerbCount = (sentence.match(ROLE_VERB_OCCURRENCE) ?? []).length
      // A sentence that denies something and names the role verb more than once may be asserting
      // one counterparty and denying another ("inhibits CYP3A4 but not CYP2D6"). Which negation
      // scopes which name is exactly the judgement this parser refuses to make, so no role is
      // recorded at all and the counterparty is kept with its sentence.
      const scopeIsAmbiguous = negated && roleVerbCount > 1
      const role = roles.length === 1 && !scopeIsAmbiguous ? roles[0]![0] : undefined
      const polarity: InteractionPolarity | undefined = role
        ? negated
          ? 'NEGATED'
          : 'ASSERTED'
        : undefined
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
        /*
         * Identity is the whole statement, not just the name. Keying on the counterparty alone
         * discarded a second sentence about the same enzyme, so a label stating "is a substrate of
         * CYP3A4" in one place and "does not inhibit CYP3A4" in another kept only whichever came
         * first -- silently losing exactly the denials this corpus exists to record. Two sentences
         * making different statements about one counterparty are two findings.
         *
         * The source identifier and the excerpt are part of the key so the same sentence read twice
         * collapses, while two different sentences never do.
         */
        const identity = [
          counterparty,
          role ?? 'ROLE_NOT_STATED',
          polarity ?? 'POLARITY_NOT_RECORDED',
          labelSection,
          source.identifier,
          excerpt,
        ].join('\u001f')
        if (seen.has(identity)) continue
        seen.set(identity, {
          counterpartyAsRecorded: counterparty,
          kind,
          ...(role ? { roleAsRecorded: role } : {}),
          ...(polarity ? { polarity } : {}),
          labelSection,
          source: { ...source, excerpt },
          provenanceTier: 'extracted',
        })
      }
    }
  }

  /*
   * Sorted for a stable diff, never to decide what survives. The sort key runs counterparty, then
   * role, then polarity, so a record's signals land in the same order on every run regardless of
   * which sentence the parser met first.
   */
  return [...seen.values()].sort(
    (left, right) =>
      left.counterpartyAsRecorded.localeCompare(right.counterpartyAsRecorded) ||
      (left.roleAsRecorded ?? '').localeCompare(right.roleAsRecorded ?? '') ||
      (left.polarity ?? '').localeCompare(right.polarity ?? ''),
  )
}

/** Headings labels put in front of an indications section. */
const USES_HEADING = /(?:indications?\s+and\s+usage|indications?|uses)/u

/** Statements kept. Enough to say what a source is for, short enough to stay readable. */
const MAX_USE_STATEMENTS = 3

/**
 * What the source says this is used for.
 *
 * Read from the indications section, which nearly every published label carries and which for many
 * substances — homeopathic preparations, botanical extracts, minerals — is the only section that
 * says anything at all. Recording it is what stops those records being blank when their label is
 * not.
 *
 * The text is quoted, never summarised, and the record says only that the source states this use.
 */
export function extractRecordedUses(
  artifact: LabelArtifact,
  options: ExtractionOptions,
): RecordedUses | null {
  // Uses is the one module where a terse statement is the label's own voice rather than a fragment
  // of prose: "Loss of appetite", "Painful dry cough" is what a homeopathic indications section
  // says, in full.
  const statements = statementSentences(artifact.sections.indications_and_usage, USES_HEADING, {
    allowShort: true,
  }).slice(0, MAX_USE_STATEMENTS)
  if (statements.length === 0) return null
  const source = labelSource(artifact, options)
  return { statements: statements.map((sentence) => toStatement(sentence, source)) }
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

  /**
   * What the label says the medicine is for.
   *
   * Nearly every published label carries an indications section, and for a great many substances it
   * is the only section there is: a botanical, a mineral or a homeopathic preparation has no
   * clinical-pharmacology text to read a mechanism out of. Leaving this out is why records built
   * from such labels came out empty while the label plainly stated something a reader wants.
   *
   * Gated on a single-substance source even though the indications belong to the product, because
   * these rows are usually substances rather than products: a thirty-ingredient homeopathic label
   * states what the combination is for, and that is not what any one of its ingredients is for.
   */
  const uses = isSubstanceSpecificSource ? extractRecordedUses(artifact, options) : null
  if (uses) {
    background.recordedUses = uses
    modules.push('recordedUses')
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
