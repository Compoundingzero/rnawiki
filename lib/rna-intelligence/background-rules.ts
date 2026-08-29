/**
 * RNA Intelligence — Group I: recorded background validation, engine version
 * `rna-intelligence/background-2.3.0`.
 *
 * Deterministic structural checks over the `medicine-background/v1` envelope. The group's central
 * guarantee is mechanical provenance: a numeric value must literally appear inside the source
 * excerpt fetched at authoring time, so a number that was remembered instead of read fails
 * validation. Like every other group, this code checks structure only — it never judges what a
 * value means medically, and it selects no conclusion.
 */

import {
  BACKGROUND_CONCORDANCE_STATES,
  DESCRIPTIVE_LABEL_SECTIONS,
  BACKGROUND_SOURCE_KINDS,
  INTERACTION_COUNTERPARTY_KINDS,
  INTERACTION_POLARITIES,
  INTERACTION_ROLES,
  POPULATION_EVIDENCE_STATES,
  STUDIED_POPULATIONS,
  COST_CURRENCIES,
  COST_JURISDICTIONS,
  COST_PRICE_TYPES,
  MEDICINE_BACKGROUND_VERSION,
  MOLECULAR_FORMULA_SHAPE,
  PRODUCT_JURISDICTIONS,
  SUBSTANCE_DATA_STATES,
  SUBSTANCE_SPECIFIC_MODULES,
  type BackgroundSource,
  type MedicineRecordedBackground,
  type RecordedStatement,
  type RecordedValue,
} from '@/lib/background/types'
import { isAnatomyRegionCode } from '@/lib/background/anatomy-regions'
import {
  numbersIn,
  statesNumber,
  withoutThousandsSeparators,
} from '@/lib/background/printed-numbers'
import {
  normalizedMonthlyUsdFromEntry,
  steadyStateNoteFromHalfLifeHours,
} from '@/lib/background/derivations'

export const BACKGROUND_ENGINE_VERSION = 'rna-intelligence/background-2.3.0'

export const BACKGROUND_RULE_CODES = [
  'I_ENVELOPE_VERSION_INVALID',
  'I_AUTHORED_AT_INVALID',
  'I_SOURCE_KIND_UNKNOWN',
  'I_SOURCE_IDENTIFIER_INVALID',
  'I_SOURCE_RETRIEVED_AT_INVALID',
  'I_EXCERPT_TOO_LONG',
  'I_VALUE_NOT_IN_EXCERPT',
  'I_CONTEXT_MISSING',
  'I_RANGE_IMPLAUSIBLE',
  'I_STEADY_STATE_MISMATCH',
  'I_TITRATION_ORDER_INVALID',
  'I_TITRATION_EMPTY',
  'I_PRODUCT_JURISDICTION_UNKNOWN',
  'I_COST_JURISDICTION_UNKNOWN',
  'I_COST_CURRENCY_UNKNOWN',
  'I_COST_PRICE_TYPE_UNKNOWN',
  'I_COST_RANGE_INVALID',
  'I_COST_AS_OF_INVALID',
  'I_COST_NORMALIZATION_MISMATCH',
  'I_ANATOMY_REGION_UNKNOWN',
  'I_APPLICABILITY_EMPTY',
  'I_TRIAL_IDENTIFIER_INVALID',
  'I_CONCORDANCE_ALTERNATE_MISMATCH',
  'I_FORBIDDEN_GUIDANCE_LANGUAGE',
  'I_REGISTRY_IDENTIFIER_INVALID',
  'I_STATEMENT_NOT_VERBATIM',
  'I_STATEMENT_EMPTY',
  'I_MECHANISM_TARGET_NOT_IN_TEXT',
  'I_MOLECULAR_FORMULA_INVALID',
  'I_MOLECULAR_WEIGHT_IMPLAUSIBLE',
  'I_INTERACTION_KIND_UNKNOWN',
  'I_INTERACTION_ROLE_UNKNOWN',
  'I_INTERACTION_COUNTERPARTY_NOT_IN_EXCERPT',
  'I_POPULATION_UNKNOWN',
  'I_POPULATION_STATE_UNKNOWN',
  'I_POPULATION_DUPLICATE',
  'I_ADVERSE_THRESHOLD_NOT_IN_EXCERPT',
  'I_ADVERSE_EVENT_NOT_IN_EXCERPT',
  'I_ATTRIBUTION_TOO_BROAD',
  'I_INTERACTION_SECTION_NOT_DESCRIPTIVE',
  'I_CONSENSUS_COUNT_INCONSISTENT',
  'I_CONSENSUS_AGREEMENT_INVALID',
  'I_CONSENSUS_READING_NOT_IN_EXCERPT',
  'I_INTERACTION_POLARITY_UNKNOWN',
  'I_INTERACTION_POLARITY_MISSING',
  'I_COMPOSITION_COUNT_MISMATCH',
  'I_INGREDIENT_STATE_UNKNOWN',
  'I_INGREDIENT_KEY_MISSING',
  'I_INGREDIENT_DUPLICATED',
  'I_SUPPLEMENT_COUNT_UNCHECKABLE',
  'I_SUPPLEMENT_TIER_MISMATCH',
  'I_TRANSCRIBED_VALUE_UNCHECKABLE',
  'I_LABEL_PRESENCE_COUNT_UNCHECKABLE',
  'I_LABEL_PRESENCE_SINGLE_EXCEEDS_TOTAL',
  'I_BIOLOGY_IDENTITY_UNCHECKABLE',
  'I_PRODUCT_LISTING_UNCHECKABLE',
  'I_PRODUCT_LISTING_CLASS_UNATTRIBUTABLE',
  'I_APPROVAL_UNCHECKABLE',
  'I_SUPPLEMENT_INGREDIENT_UNCHECKABLE',
  'I_SOURCE_MATERIAL_UNCHECKABLE',
] as const
export type BackgroundRuleCode = (typeof BACKGROUND_RULE_CODES)[number]

export interface BackgroundFinding {
  code: BackgroundRuleCode
  /** Dotted path to the offending field, e.g. "pharmacokinetics.halfLife". */
  path: string
  message: string
}

export interface BackgroundIntelligenceReport {
  engineVersion: typeof BACKGROUND_ENGINE_VERSION
  passed: boolean
  findings: BackgroundFinding[]
}

const MAX_EXCERPT_LENGTH = 400

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u

const SOURCE_IDENTIFIER_PATTERNS: Record<string, RegExp> = {
  FDA_LABEL: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu,
  DAILYMED: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu,
  EMA_SMPC: /^EMEA\/H\/C\/\d{5,7}$/u,
  PUBMED: /^\d{6,9}$/u,
  CLINICALTRIALS: /^NCT\d{8}$/u,
  PUBCHEM: /^[1-9]\d{0,15}$/u,
  RXNORM: /^\d{1,10}$/u,
  NADAC: /^\d{4}-\d{2}-\d{2}$/u,
  NICE_BNF: /^(?:TA\d{2,5}|BNF:[a-z0-9-]{2,80})$/u,
  PUBLISHED_ANALYSIS: /^10\.\d{4,9}\/\S{2,200}$/u,
  // A supplement label database record id, which is what makes a transcribed count checkable.
  DSLD: /^[0-9]{1,9}$/u,
  // An NCBI taxonomy identifier, which is what makes a recorded organism checkable.
  NCBI_TAXONOMY: /^[1-9][0-9]{0,8}$/u,
  // A National Drug Code product code: labeler and product segments.
  FDA_NDC: /^\d{4,5}-\d{3,4}$/u,
  // A Drugs@FDA application number: NDA, ANDA or BLA followed by its digits.
  FDA_DRUGSFDA: /^(?:NDA|ANDA|BLA)\d{4,8}$/u,
  // A Unique Ingredient Identifier: ten characters of upper-case letters and digits.
  FDA_UNII: /^[A-Z0-9]{10}$/u,
}

/**
 * Instruction or commerce phrasing that recorded research context must never contain. The list is
 * deliberately narrow: it flags advice-shaped sentences, not recorded protocol wording such as
 * "0.25 mg once weekly".
 */
const FORBIDDEN_GUIDANCE = [
  /\byou should\b/iu,
  /\bwe recommend\b/iu,
  /\bpatients should\b/iu,
  /\bstart by taking\b/iu,
  /\bask your doctor for\b/iu,
  /\btalk to your (?:doctor|provider) about (?:getting|starting)\b/iu,
  /\bbuy\b/iu,
  /\bdiscount\b/iu,
  /\bcoupon\b/iu,
  /\bstack(?:ing)? with\b/iu,
] as const

function numberTokens(display: string): string[] {
  return numbersIn(display).map((value) => String(value))
}

/** Collapses whitespace and removes thousands separators, so text can be searched for numbers. */
function normalizeForMatch(text: string): string {
  return withoutThousandsSeparators(text.replace(/[\u00a0\s]+/gu, ' '))
}

/** Whether the excerpt states this displayed number as a number rather than inside a longer one. */
function excerptStatesNumber(haystack: string, token: string): boolean {
  const wanted = Number(token)
  return Number.isFinite(wanted) ? statesNumber(haystack, wanted) : haystack.includes(token)
}

export function runBackgroundIntelligence(
  background: MedicineRecordedBackground,
): BackgroundIntelligenceReport {
  const findings: BackgroundFinding[] = []
  const flag = (code: BackgroundRuleCode, path: string, message: string) => {
    findings.push({ code, path, message })
  }

  if (background.version !== MEDICINE_BACKGROUND_VERSION) {
    flag(
      'I_ENVELOPE_VERSION_INVALID',
      'version',
      `Unknown envelope version "${background.version}".`,
    )
  }
  if (!ISO_DATE.test(background.authoredAt ?? '')) {
    flag('I_AUTHORED_AT_INVALID', 'authoredAt', 'authoredAt must be an ISO date (YYYY-MM-DD).')
  }

  const checkGuidanceLanguage = (path: string, text: string | undefined) => {
    if (!text) return
    for (const pattern of FORBIDDEN_GUIDANCE) {
      if (pattern.test(text)) {
        flag(
          'I_FORBIDDEN_GUIDANCE_LANGUAGE',
          path,
          `Recorded research context must not contain advice or commerce phrasing (${pattern}).`,
        )
        return
      }
    }
  }

  const checkSource = (path: string, source: BackgroundSource | undefined) => {
    if (!source) return
    if (!(BACKGROUND_SOURCE_KINDS as readonly string[]).includes(source.kind)) {
      flag('I_SOURCE_KIND_UNKNOWN', path, `Unknown source kind "${source.kind}".`)
    }
    const pattern = SOURCE_IDENTIFIER_PATTERNS[source.kind]
    if (pattern && !pattern.test(source.identifier.trim())) {
      flag(
        'I_SOURCE_IDENTIFIER_INVALID',
        path,
        `Identifier "${source.identifier}" does not match the ${source.kind} identifier shape.`,
      )
    }
    if (!ISO_DATE.test(source.retrievedAt ?? '')) {
      flag('I_SOURCE_RETRIEVED_AT_INVALID', path, 'retrievedAt must be an ISO date (YYYY-MM-DD).')
    }
    if (source.excerpt && source.excerpt.length > MAX_EXCERPT_LENGTH) {
      flag(
        'I_EXCERPT_TOO_LONG',
        path,
        `Excerpt is ${source.excerpt.length} characters; the limit is ${MAX_EXCERPT_LENGTH}.`,
      )
    }
  }

  const checkRecordedValue = (
    path: string,
    value: RecordedValue | undefined,
    range?: { min: number; max: number },
  ) => {
    if (!value) return
    checkSource(path, value.source)
    checkGuidanceLanguage(path, value.display)
    if (!value.populationContext?.trim()) {
      flag('I_CONTEXT_MISSING', path, 'A recorded value must name who and what it was measured in.')
    }
    const displayTokens = numberTokens(normalizeForMatch(value.display))
    /**
     * A transcribed value is checked differently, because it cannot be checked the same way.
     *
     * The excerpt guarantee assumes a sentence: a value read out of prose can be shown to appear in
     * that prose. A structured database returns a molecular weight as a field, and there is no
     * sentence anywhere to quote — demanding one would not make the value more trustworthy, it
     * would make it unrecordable. What stands in its place is the record identifier, which lets
     * anyone put the same question to the same database and get the same number.
     *
     * The exemption is narrow on purpose: it applies to the value's own tier, so a transcribed
     * value cannot smuggle in a number beside extracted ones without declaring what it is.
     */
    const isTranscribed = value.provenanceTier === 'transcribed'
    if (isTranscribed && !value.source?.identifier?.trim()) {
      flag(
        'I_TRANSCRIBED_VALUE_UNCHECKABLE',
        path,
        'A transcribed value must cite the record identifier it was copied from, since it has no excerpt to quote.',
      )
    }
    if (!isTranscribed && (typeof value.numeric === 'number' || displayTokens.length > 0)) {
      const excerpt = value.source?.excerpt
      if (!excerpt) {
        flag(
          'I_VALUE_NOT_IN_EXCERPT',
          path,
          'A value that displays numbers must carry the fetched excerpt that contains them.',
        )
      } else {
        const haystack = normalizeForMatch(excerpt)
        const missing = displayTokens.filter((token) => !excerptStatesNumber(haystack, token))
        if (missing.length > 0) {
          flag(
            'I_VALUE_NOT_IN_EXCERPT',
            path,
            `Displayed number(s) ${missing.join(', ')} do not appear in the recorded excerpt.`,
          )
        }
      }
    }
    if (typeof value.numeric === 'number') {
      if (range && (value.numeric < range.min || value.numeric > range.max)) {
        flag(
          'I_RANGE_IMPLAUSIBLE',
          path,
          `Numeric value ${value.numeric} is outside the plausible range ${range.min}–${range.max}.`,
        )
      }
    }
    if (value.concordance === 'discrepant' && !value.alternateValue) {
      flag(
        'I_CONCORDANCE_ALTERNATE_MISMATCH',
        path,
        'A discrepant value must record the other reading and its source.',
      )
    }
    if (value.alternateValue && value.concordance !== 'discrepant') {
      flag(
        'I_CONCORDANCE_ALTERNATE_MISMATCH',
        path,
        'An alternate reading may be recorded only on a discrepant value.',
      )
    }
    if (
      value.concordance &&
      !(BACKGROUND_CONCORDANCE_STATES as readonly string[]).includes(value.concordance)
    ) {
      flag('I_CONCORDANCE_ALTERNATE_MISMATCH', path, `Unknown concordance "${value.concordance}".`)
    }
    if (value.alternateValue) checkSource(`${path}.alternateValue`, value.alternateValue.source)
  }

  const pk = background.pharmacokinetics
  if (pk) {
    checkGuidanceLanguage('pharmacokinetics.routeAsRecorded', pk.routeAsRecorded)
    checkRecordedValue('pharmacokinetics.bioavailability', pk.bioavailability, { min: 0, max: 100 })
    checkRecordedValue('pharmacokinetics.tMax', pk.tMax, { min: 0, max: 720 })
    checkRecordedValue('pharmacokinetics.halfLife', pk.halfLife, { min: 0.01, max: 8760 })
    checkRecordedValue('pharmacokinetics.proteinBinding', pk.proteinBinding, { min: 0, max: 100 })
    // The floor is a hundredth of a litre per kilogram, not a tenth. A monoclonal antibody stays
    // almost entirely in plasma — alirocumab's label states 0.04 to 0.05 L/kg and imiglucerase's
    // 0.09 to 0.15 L/kg — and a floor set for small molecules called both implausible and threw
    // away a correctly extracted value with its own sentence attached.
    checkRecordedValue('pharmacokinetics.volumeOfDistribution', pk.volumeOfDistribution, {
      min: 0.01,
      max: 100000,
    })
    checkRecordedValue('pharmacokinetics.metabolismAsRecorded', pk.metabolismAsRecorded)
    checkRecordedValue('pharmacokinetics.eliminationAsRecorded', pk.eliminationAsRecorded)
    if (pk.steadyStateNote) {
      const hours = pk.halfLife?.numeric
      const expected = typeof hours === 'number' ? steadyStateNoteFromHalfLifeHours(hours) : null
      if (!expected || expected !== pk.steadyStateNote) {
        flag(
          'I_STEADY_STATE_MISMATCH',
          'pharmacokinetics.steadyStateNote',
          'steadyStateNote must equal the deterministic derivation from halfLife.numeric.',
        )
      }
    }
  }

  const titration = background.titration
  if (titration) {
    checkSource('titration.source', titration.source)
    if (titration.steps.length === 0) {
      flag('I_TITRATION_EMPTY', 'titration.steps', 'A recorded schedule must contain steps.')
    }
    const orders = titration.steps.map((step) => step.order)
    const expectedOrders = titration.steps.map((_, index) => index + 1)
    if (JSON.stringify(orders) !== JSON.stringify(expectedOrders)) {
      flag(
        'I_TITRATION_ORDER_INVALID',
        'titration.steps',
        'Step orders must run contiguously from 1 in stored order.',
      )
    }
    for (const [index, step] of titration.steps.entries()) {
      checkGuidanceLanguage(
        `titration.steps[${index}]`,
        `${step.periodAsRecorded} ${step.amountAsRecorded} ${step.purposeAsRecorded ?? ''}`,
      )
    }
  }

  for (const [index, product] of (background.productVariants ?? []).entries()) {
    const path = `productVariants[${index}]`
    checkSource(path, product.source)
    checkGuidanceLanguage(path, `${product.approvedUseAsRecorded} ${product.statusAsRecorded}`)
    if (!(PRODUCT_JURISDICTIONS as readonly string[]).includes(product.jurisdiction)) {
      flag(
        'I_PRODUCT_JURISDICTION_UNKNOWN',
        path,
        `Unknown jurisdiction "${product.jurisdiction}".`,
      )
    }
  }

  for (const [index, entry] of (background.costContext ?? []).entries()) {
    const path = `costContext[${index}]`
    checkSource(path, entry.source)
    checkGuidanceLanguage(path, `${entry.per} ${entry.whoPaysAsRecorded}`)
    if (!(COST_JURISDICTIONS as readonly string[]).includes(entry.jurisdiction)) {
      flag(
        'I_COST_JURISDICTION_UNKNOWN',
        path,
        `Unknown cost jurisdiction "${entry.jurisdiction}".`,
      )
    }
    if (!(COST_CURRENCIES as readonly string[]).includes(entry.currency)) {
      flag('I_COST_CURRENCY_UNKNOWN', path, `Unknown currency "${entry.currency}".`)
    }
    if (!(COST_PRICE_TYPES as readonly string[]).includes(entry.priceType)) {
      flag('I_COST_PRICE_TYPE_UNKNOWN', path, `Unknown price type "${entry.priceType}".`)
    }
    if (
      !(entry.amountLow > 0) ||
      (entry.amountHigh !== undefined && entry.amountHigh < entry.amountLow)
    ) {
      flag('I_COST_RANGE_INVALID', path, 'Amounts must be positive and high must be at least low.')
    }
    if (!ISO_DATE.test(entry.asOf ?? '')) {
      flag('I_COST_AS_OF_INVALID', path, 'asOf must be the ISO date the source recorded the price.')
    }
    {
      const excerpt = entry.source?.excerpt
      const amountTokens = [entry.amountLow, entry.amountHigh]
        .filter((amount): amount is number => typeof amount === 'number')
        .map((amount) => String(amount))
      if (!excerpt) {
        flag(
          'I_VALUE_NOT_IN_EXCERPT',
          path,
          'A price must carry the fetched excerpt that contains it.',
        )
      } else {
        const haystack = normalizeForMatch(excerpt)
        // Compared as numbers for the same reason as every other recorded value: a price of 0.05
        // must not be accepted because "0.05" happens to sit inside "10.057".
        const missing = amountTokens.filter((token) => !excerptStatesNumber(haystack, token))
        if (missing.length > 0) {
          flag(
            'I_VALUE_NOT_IN_EXCERPT',
            path,
            `Recorded amount(s) ${missing.join(', ')} do not appear in the recorded excerpt.`,
          )
        }
      }
    }
    if (entry.normalizedMonthlyUsd) {
      const expected = normalizedMonthlyUsdFromEntry({
        currency: entry.currency,
        amountLow: entry.amountLow,
        amountHigh: entry.amountHigh,
        fxRate: entry.normalizedMonthlyUsd.fxRate,
      })
      const stored = entry.normalizedMonthlyUsd
      if (
        !expected ||
        expected.low !== stored.low ||
        (expected.high ?? null) !== (stored.high ?? null)
      ) {
        flag(
          'I_COST_NORMALIZATION_MISMATCH',
          path,
          'normalizedMonthlyUsd must equal the deterministic recomputation from the recorded amounts and FX rate.',
        )
      }
      if (
        entry.currency !== 'USD' &&
        stored.fxRate !== undefined &&
        !ISO_DATE.test(stored.fxAsOf ?? '')
      ) {
        flag(
          'I_COST_NORMALIZATION_MISMATCH',
          path,
          'A recorded FX rate must carry its own ISO date.',
        )
      }
    }
  }

  for (const [index, target] of (background.anatomyTargets ?? []).entries()) {
    const path = `anatomyTargets[${index}]`
    checkSource(path, target.source)
    checkGuidanceLanguage(path, target.actionAsRecorded)
    if (!isAnatomyRegionCode(target.regionCode)) {
      flag('I_ANATOMY_REGION_UNKNOWN', path, `Unknown anatomy region code "${target.regionCode}".`)
    }
  }

  const applicability = background.applicability
  if (applicability) {
    checkSource('applicability', applicability.source)
    if (applicability.includedAsRecorded.length === 0) {
      flag(
        'I_APPLICABILITY_EMPTY',
        'applicability.includedAsRecorded',
        'Recorded applicability must include at least one inclusion criterion.',
      )
    }
    if (!/^(?:NCT\d{8}|label:[a-z0-9-]{2,80})$/u.test(applicability.trialIdentifier)) {
      flag(
        'I_TRIAL_IDENTIFIER_INVALID',
        'applicability.trialIdentifier',
        'trialIdentifier must be an NCT number or a label:<section> reference.',
      )
    }
    for (const [index, criterion] of applicability.includedAsRecorded.entries()) {
      checkGuidanceLanguage(`applicability.includedAsRecorded[${index}]`, criterion)
    }
    for (const [index, criterion] of applicability.excludedAsRecorded.entries()) {
      checkGuidanceLanguage(`applicability.excludedAsRecorded[${index}]`, criterion)
    }
  }

  for (const [index, result] of (background.pivotalResults ?? []).entries()) {
    const path = `pivotalResults[${index}]`
    checkSource(path, result.source)
    if (!/^NCT\d{8}$/u.test(result.trialIdentifier)) {
      flag(
        'I_TRIAL_IDENTIFIER_INVALID',
        path,
        'Recorded study results must reference an NCT number.',
      )
    }
    checkGuidanceLanguage(
      path,
      `${result.endpointAsRecorded} ${result.activeResultAsRecorded} ${result.differenceAsRecorded ?? ''}`,
    )
    const excerpt = result.source?.excerpt
    const tokens = numberTokens(
      normalizeForMatch(
        [
          result.activeResultAsRecorded,
          result.comparatorResultAsRecorded ?? '',
          result.differenceAsRecorded ?? '',
          result.uncertaintyAsRecorded ?? '',
        ].join(' '),
      ),
    )
    if (tokens.length > 0) {
      if (!excerpt) {
        flag('I_VALUE_NOT_IN_EXCERPT', path, 'A numeric result must carry its fetched excerpt.')
      } else {
        const haystack = normalizeForMatch(excerpt)
        const missing = tokens.filter((token) => !haystack.includes(token))
        if (missing.length > 0) {
          flag(
            'I_VALUE_NOT_IN_EXCERPT',
            path,
            `Result number(s) ${missing.join(', ')} do not appear in the recorded excerpt.`,
          )
        }
      }
    }
  }

  const identifiers = background.registryIdentifiers
  if (identifiers) {
    checkSource('registryIdentifiers', identifiers.source)
    const shapes: Array<[string, string | undefined, RegExp]> = [
      ['pubchemCid', identifiers.pubchemCid, /^[1-9]\d{0,15}$/u],
      ['casNumber', identifiers.casNumber, /^\d{2,7}-\d{2}-\d$/u],
      ['atcCode', identifiers.atcCode, /^[A-Z]\d{2}[A-Z]{2}\d{2}$/u],
      ['unii', identifiers.unii, /^[0-9A-Z]{10}$/u],
      ['rxcui', identifiers.rxcui, /^\d{1,10}$/u],
    ]
    for (const [field, value, shape] of shapes) {
      if (value !== undefined && !shape.test(value)) {
        flag(
          'I_REGISTRY_IDENTIFIER_INVALID',
          `registryIdentifiers.${field}`,
          `"${value}" does not match the ${field} shape.`,
        )
      }
    }
  }

  /**
   * A quoted statement carries no summary and no authored voice: its text must be exactly the
   * excerpt fetched from the source. That equality is what lets these modules hold sentences the
   * advice filter would otherwise reject — a label's own "patients should be monitored" is the
   * source speaking, provably character for character, not RNAWiki giving guidance.
   */
  const checkStatement = (path: string, statement: RecordedStatement) => {
    checkSource(path, statement.source)
    const text = normalizeForMatch(statement.textAsRecorded).trim()
    const excerpt = normalizeForMatch(statement.source.excerpt ?? '').trim()
    if (text.length === 0) {
      flag('I_STATEMENT_EMPTY', path, 'Recorded statement text is empty.')
      return
    }
    if (text !== excerpt) {
      flag(
        'I_STATEMENT_NOT_VERBATIM',
        path,
        'Recorded statement text is not identical to the source excerpt it quotes.',
      )
    }
  }

  const mechanism = background.mechanism
  if (mechanism) {
    if (mechanism.statements.length === 0) {
      flag('I_STATEMENT_EMPTY', 'mechanism.statements', 'Mechanism module has no statements.')
    }
    mechanism.statements.forEach((statement, index) => {
      checkStatement(`mechanism.statements[${index}]`, statement)
    })
    const haystack = normalizeForMatch(
      mechanism.statements.map((statement) => statement.textAsRecorded).join(' '),
    ).toLowerCase()
    for (const target of mechanism.namedTargetsAsRecorded ?? []) {
      // A named target is an index into the recorded text, never an addition to it.
      if (!haystack.includes(normalizeForMatch(target).toLowerCase())) {
        flag(
          'I_MECHANISM_TARGET_NOT_IN_TEXT',
          'mechanism.namedTargetsAsRecorded',
          `Named target "${target}" does not appear in any recorded mechanism statement.`,
        )
      }
    }
  }

  const molecular = background.molecularIdentity
  if (molecular) {
    if (molecular.molecularFormula) {
      checkRecordedValue('molecularIdentity.molecularFormula', molecular.molecularFormula)
      if (!MOLECULAR_FORMULA_SHAPE.test(molecular.molecularFormula.display)) {
        flag(
          'I_MOLECULAR_FORMULA_INVALID',
          'molecularIdentity.molecularFormula',
          `"${molecular.molecularFormula.display}" is not a molecular formula.`,
        )
      }
    }
    if (molecular.molecularWeight) {
      checkRecordedValue('molecularIdentity.molecularWeight', molecular.molecularWeight)
      const weight = molecular.molecularWeight.numeric
      // The floor is one atomic mass unit, not thirty. Carbon is 12, carbon monoxide 28, lithium
      // 6.9, and all three are recorded medicines; a floor set for organic drugs refused them.
      if (weight !== undefined && (weight < 1 || weight > 200000)) {
        flag(
          'I_MOLECULAR_WEIGHT_IMPLAUSIBLE',
          'molecularIdentity.molecularWeight',
          `${weight} g/mol is outside the plausible range for a recorded medicine.`,
        )
      }
    }
  }

  background.interactionSignals?.forEach((signal, index) => {
    const path = `interactionSignals[${index}]`
    checkSource(path, signal.source)
    if (!INTERACTION_COUNTERPARTY_KINDS.includes(signal.kind)) {
      flag('I_INTERACTION_KIND_UNKNOWN', path, `Unknown counterparty kind "${signal.kind}".`)
    }
    if (signal.roleAsRecorded && !INTERACTION_ROLES.includes(signal.roleAsRecorded)) {
      flag('I_INTERACTION_ROLE_UNKNOWN', path, `Unknown role "${signal.roleAsRecorded}".`)
    }
    if (signal.polarity && !INTERACTION_POLARITIES.includes(signal.polarity)) {
      flag('I_INTERACTION_POLARITY_UNKNOWN', path, `Unknown polarity "${signal.polarity}".`)
    }
    // A role without polarity cannot be displayed, because the sentence it came from may have been
    // denying it. Labels report negative findings constantly, and a role recorded from "does not
    // inhibit" and shown as "inhibits" states the opposite of its own source.
    if (signal.roleAsRecorded && !signal.polarity) {
      flag(
        'I_INTERACTION_POLARITY_MISSING',
        path,
        `Role "${signal.roleAsRecorded}" carries no polarity, so whether the source asserted or denied it is unrecorded.`,
      )
    }
    // A structural role may only come from a descriptive section. Section 7 of a US label is,
    // by 21 CFR 201.57(c)(8), the section for clinically significant interactions and the
    // instructions for preventing them; turning that into structured data would convert
    // regulated advice into a property claim the section never made.
    if (signal.labelSection && !DESCRIPTIVE_LABEL_SECTIONS.includes(signal.labelSection)) {
      flag(
        'I_INTERACTION_SECTION_NOT_DESCRIPTIVE',
        path,
        `Role recorded from "${signal.labelSection}", which is not a descriptive label section.`,
      )
    }
    // The counterparty must be a token the source printed, on the same terms as every number.
    const excerpt = normalizeForMatch(signal.source.excerpt ?? '')
      .toLowerCase()
      .replace(/[\s-]/gu, '')
    const counterparty = signal.counterpartyAsRecorded.toLowerCase().replace(/[\s-]/gu, '')
    if (!excerpt.includes(counterparty)) {
      flag(
        'I_INTERACTION_COUNTERPARTY_NOT_IN_EXCERPT',
        path,
        `"${signal.counterpartyAsRecorded}" does not appear in the recorded excerpt.`,
      )
    }
  })

  const safety = background.safety
  if (safety) {
    if (safety.boxedWarning) checkStatement('safety.boxedWarning', safety.boxedWarning)
    safety.contraindications?.forEach((statement, index) => {
      checkStatement(`safety.contraindications[${index}]`, statement)
    })
  }

  const seenPopulations = new Set<string>()
  background.populationStatements?.forEach((statement, index) => {
    const path = `populationStatements[${index}]`
    checkSource(path, statement.source)
    if (!STUDIED_POPULATIONS.includes(statement.population)) {
      flag('I_POPULATION_UNKNOWN', path, `Unknown population "${statement.population}".`)
    }
    if (!POPULATION_EVIDENCE_STATES.includes(statement.state)) {
      flag('I_POPULATION_STATE_UNKNOWN', path, `Unknown evidence state "${statement.state}".`)
    }
    if (seenPopulations.has(statement.population)) {
      flag(
        'I_POPULATION_DUPLICATE',
        path,
        `Population "${statement.population}" already has a recorded statement.`,
      )
    }
    seenPopulations.add(statement.population)
    checkStatement(path, {
      textAsRecorded: statement.textAsRecorded,
      source: statement.source,
    })
  })

  const adverse = background.commonAdverseReactions
  if (adverse) {
    checkSource('commonAdverseReactions', adverse.source)
    const excerpt = normalizeForMatch(adverse.source.excerpt ?? '').toLowerCase()
    const thresholdNumbers = numberTokens(adverse.thresholdAsRecorded)
    for (const token of thresholdNumbers) {
      if (!excerpt.includes(token)) {
        flag(
          'I_ADVERSE_THRESHOLD_NOT_IN_EXCERPT',
          'commonAdverseReactions.thresholdAsRecorded',
          `Threshold number ${token} does not appear in the recorded excerpt.`,
        )
      }
    }
    // Every listed reaction must be a phrase the source printed in the same sentence.
    adverse.eventsAsRecorded.forEach((event, index) => {
      if (!excerpt.includes(normalizeForMatch(event).toLowerCase())) {
        flag(
          'I_ADVERSE_EVENT_NOT_IN_EXCERPT',
          `commonAdverseReactions.eventsAsRecorded[${index}]`,
          `"${event}" does not appear in the recorded excerpt.`,
        )
      }
    })
  }

  /**
   * The attribution guarantee, and the companion to number-in-excerpt.
   *
   * An excerpt proves a sentence was printed. It cannot prove the sentence was about this medicine.
   * A multi-ingredient document — an allergenic extract naming ninety-one pollens, a homeopathic
   * combination naming gold among thirty-five others — prints sentences belonging to none of its
   * substances individually. An extracted record may therefore carry a substance-specific module
   * only from a document about exactly one substance.
   *
   * Curated records are exempt: a person chose the source and checked that it was about the
   * medicine, which is the judgement the count stands in for everywhere else.
   */
  if ((background.provenanceTier ?? 'curated') === 'extracted') {
    const carried = SUBSTANCE_SPECIFIC_MODULES.filter((module) => {
      const value = background[module]
      return Array.isArray(value) ? value.length > 0 : value !== undefined
    })
    if (carried.length > 0) {
      const declared = background.attribution?.declaredSubstanceCount
      if (declared !== 1) {
        flag(
          'I_ATTRIBUTION_TOO_BROAD',
          'attribution.declaredSubstanceCount',
          `${carried.join(', ')} recorded at product level from a source declaring ${declared ?? 'an unknown number of'} active substance(s). A substance-specific module belongs to an ingredient inside composition, not to the product.`,
        )
      }
    }
  }

  /**
   * Composition, where a product meets the substances it is made of.
   *
   * Each ingredient's substance-specific data must have come from a source about that substance
   * alone, which is the same guarantee as before, now applied where it actually belongs. An
   * ingredient that has no such source says so outright rather than looking identical to one nobody
   * has looked for yet.
   */
  const composition = background.composition
  if (composition) {
    if (composition.declaredIngredientCount !== composition.ingredients.length) {
      flag(
        'I_COMPOSITION_COUNT_MISMATCH',
        'composition.declaredIngredientCount',
        `Declares ${composition.declaredIngredientCount} ingredients but carries ${composition.ingredients.length}.`,
      )
    }
    const missing = composition.ingredients.filter(
      (ingredient) => ingredient.substanceDataState === 'NO_SOURCE_ABOUT_THIS_SUBSTANCE_ALONE',
    ).length
    if (composition.ingredientsWithoutSubstanceData !== missing) {
      flag(
        'I_COMPOSITION_COUNT_MISMATCH',
        'composition.ingredientsWithoutSubstanceData',
        `Reports ${composition.ingredientsWithoutSubstanceData} ingredients without substance data but ${missing} are marked as having none.`,
      )
    }
    const seenKeys = new Set<string>()
    composition.ingredients.forEach((ingredient, index) => {
      const path = `composition.ingredients[${index}]`
      if (!SUBSTANCE_DATA_STATES.includes(ingredient.substanceDataState)) {
        flag(
          'I_INGREDIENT_STATE_UNKNOWN',
          path,
          `Unknown substance-data state "${ingredient.substanceDataState}".`,
        )
      }
      if (ingredient.substanceKey.length === 0) {
        flag('I_INGREDIENT_KEY_MISSING', path, 'Ingredient carries no substance key.')
      }
      // One substance may not appear twice in one product: a duplicate means two label spellings
      // collapsed to one identity and the strengths would be read as separate ingredients.
      if (seenKeys.has(ingredient.substanceKey)) {
        flag(
          'I_INGREDIENT_DUPLICATED',
          path,
          `Substance "${ingredient.substanceKey}" appears more than once in this composition.`,
        )
      }
      seenKeys.add(ingredient.substanceKey)

      const carries = SUBSTANCE_SPECIFIC_MODULES.some((module) => {
        const value = ingredient[module]
        return Array.isArray(value) ? value.length > 0 : value !== undefined
      })
      if (carries && ingredient.substanceDataState !== 'RECORDED') {
        flag(
          'I_INGREDIENT_STATE_UNKNOWN',
          path,
          'Ingredient carries substance data while declaring that no source about the substance alone was found.',
        )
      }
      for (const value of [
        ingredient.pharmacokinetics?.halfLife,
        ingredient.pharmacokinetics?.bioavailability,
        ingredient.molecularIdentity?.molecularWeight,
        ingredient.molecularIdentity?.molecularFormula,
      ]) {
        checkRecordedValue(`${path}`, value)
      }
      for (const statement of ingredient.mechanism?.statements ?? []) {
        checkStatement(`${path}.mechanism`, statement)
      }
    })
  }

  /**
   * Cross-source consensus is held to the same guarantee as every other number: a reading must
   * appear in the excerpt of a source that states it. The counts are checked for internal
   * consistency because an agreement rate is the one number here a reader will take at face value,
   * and it is only meaningful if the denominator is real.
   */
  const consensus = background.sourceConsensus
  if (consensus) {
    consensus.fields.forEach((field, fieldIndex) => {
      const path = `sourceConsensus.fields[${fieldIndex}]`
      const summed = field.readings.reduce((total, reading) => total + reading.sourceCount, 0)
      // Readings are capped for size, so the summed count may be below the total; it may never
      // exceed it, and the leading reading may never claim more sources than exist.
      if (summed > field.sourceCount) {
        flag(
          'I_CONSENSUS_COUNT_INCONSISTENT',
          path,
          `Readings account for ${summed} sources but the field reports ${field.sourceCount}.`,
        )
      }
      if (!(field.agreementRate >= 0 && field.agreementRate <= 1)) {
        flag(
          'I_CONSENSUS_AGREEMENT_INVALID',
          path,
          `Agreement rate ${field.agreementRate} is outside [0, 1].`,
        )
      }
      const leading = field.readings[0]
      if (leading && field.sourceCount > 0) {
        const expected = leading.sourceCount / field.sourceCount
        if (Math.abs(expected - field.agreementRate) > 1e-9) {
          flag(
            'I_CONSENSUS_AGREEMENT_INVALID',
            path,
            `Agreement rate ${field.agreementRate} does not match the leading reading's share ${expected}.`,
          )
        }
      }
      field.readings.forEach((reading, readingIndex) => {
        const readingPath = `${path}.readings[${readingIndex}]`
        for (const source of reading.sources) checkSource(readingPath, source)
        const tokens = numberTokens(reading.display)
        if (tokens.length === 0) return
        // At least one cited source must print the reading, which is what makes a count of
        // agreeing sources checkable rather than asserted.
        const stated = reading.sources.some((source) => {
          const haystack = normalizeForMatch(source.excerpt ?? '')
          return tokens.every((token) => haystack.includes(token))
        })
        if (!stated) {
          flag(
            'I_CONSENSUS_READING_NOT_IN_EXCERPT',
            readingPath,
            `Reading "${reading.display}" does not appear in the excerpt of any source cited for it.`,
          )
        }
      })
    })
  }

  /**
   * Supplement market counts, which are transcribed rather than read out of a sentence.
   *
   * The excerpt guarantee cannot apply here: the label database returns structured fields and there
   * is no prose to quote. What replaces it is reproducibility — a count is only admissible if the
   * record identifiers behind it are stored, so a reader can put the same question to the same
   * public API and get the same number. A count with no identifiers is an assertion.
   */
  const supplement = background.supplementMarket
  if (supplement) {
    checkSource('supplementMarket', supplement.source)
    if (supplement.labelCount < 1 || supplement.sampleLabelIds.length === 0) {
      flag(
        'I_SUPPLEMENT_COUNT_UNCHECKABLE',
        'supplementMarket',
        `Reports ${supplement.labelCount} label(s) with ${supplement.sampleLabelIds.length} identifier(s); a transcribed count needs at least one identifier to be checkable.`,
      )
    }
    if (supplement.source.kind !== 'DSLD') {
      flag(
        'I_SUPPLEMENT_COUNT_UNCHECKABLE',
        'supplementMarket.source',
        `Supplement market data must cite the label database it was transcribed from, not "${supplement.source.kind}".`,
      )
    }
    // Transcribed data must say so, but only when it is all the record holds. A record that also
    // carries extracted or curated modules is described by those; the tier names how the record as
    // a whole came to exist, and market counts riding alongside a mechanism do not change that.
    // Enumerated by exclusion rather than by listing every module, so a module added later cannot
    // silently make this check wrong — which is exactly how it went wrong the first time.
    const ENVELOPE_FIELDS = new Set([
      'version',
      'authoredAt',
      'provenanceTier',
      'attribution',
      'supplementMarket',
      // Archive presence is transcribed too, so a record holding only these two is still a
      // transcribed record rather than one that has quietly acquired a richer tier.
      'labelPresence',
      // So is a taxonomy record: a name and a lineage copied from a structured table.
      'biologicalIdentity',
      // A product listing is transcribed too.
      'productListing',
      'regulatoryApproval',
      'supplementIngredient',
      'sourceMaterial',
    ])
    const otherModules = Object.entries(background).some(([key, value]) => {
      if (ENVELOPE_FIELDS.has(key)) return false
      return Array.isArray(value) ? value.length > 0 : value !== undefined
    })
    if (!otherModules && (background.provenanceTier ?? 'curated') !== 'transcribed') {
      flag(
        'I_SUPPLEMENT_TIER_MISMATCH',
        'provenanceTier',
        `A record holding only transcribed market data is tier "${background.provenanceTier ?? 'curated'}"; it must be "transcribed".`,
      )
    }
  }

  /**
   * Archive presence counts, held to the same reproducibility standard as market counts.
   *
   * There is no sentence behind a count of labels, so there is no excerpt to check it against. What
   * stands in its place is the set of label identifiers: a reader can put the same question to the
   * same public archive and get the same number. A count with no identifier behind it is an
   * assertion, and this record type exists precisely to avoid making assertions about rows that had
   * nothing else.
   */
  const presence = background.labelPresence
  if (presence) {
    checkSource('labelPresence', presence.source)
    if (presence.labelCount < 1 || presence.sampleLabelIds.length === 0) {
      flag(
        'I_LABEL_PRESENCE_COUNT_UNCHECKABLE',
        'labelPresence',
        `Reports ${presence.labelCount} label(s) with ${presence.sampleLabelIds.length} identifier(s); a transcribed count needs at least one identifier to be checkable.`,
      )
    }
    if (presence.source.kind !== 'FDA_LABEL') {
      flag(
        'I_LABEL_PRESENCE_COUNT_UNCHECKABLE',
        'labelPresence.source',
        `Archive presence must cite the label archive it was counted from, not "${presence.source.kind}".`,
      )
    }
    // The single-substance count is the subset of the total that names this substance alone. A
    // subset larger than its set means the two were counted over different things, which would make
    // "no source about this substance alone" — the sentence the rest of a thin record depends on —
    // unsupportable.
    if (presence.singleSubstanceLabelCount > presence.labelCount) {
      flag(
        'I_LABEL_PRESENCE_SINGLE_EXCEEDS_TOTAL',
        'labelPresence.singleSubstanceLabelCount',
        `${presence.singleSubstanceLabelCount} single-substance label(s) cannot exceed ${presence.labelCount} label(s) in total.`,
      )
    }
    if (presence.singleSubstanceLabelCount < 0) {
      flag(
        'I_LABEL_PRESENCE_SINGLE_EXCEEDS_TOTAL',
        'labelPresence.singleSubstanceLabelCount',
        'A count of labels cannot be negative.',
      )
    }
  }

  /**
   * A recorded organism, held to the reproducibility standard every transcribed value meets.
   *
   * A taxonomy returns structured fields and no prose, so there is no excerpt. What replaces it is
   * the taxonomy identifier: anyone can look the same number up in the same public table and get
   * the same name and lineage. A scientific name with no identifier behind it is an assertion about
   * biology, which is not a thing this record may make on its own authority.
   */
  const biology = background.biologicalIdentity
  if (biology) {
    checkSource('biologicalIdentity', biology.source)
    if (biology.source.kind !== 'NCBI_TAXONOMY') {
      flag(
        'I_BIOLOGY_IDENTITY_UNCHECKABLE',
        'biologicalIdentity.source',
        `A recorded organism must cite the taxonomy it was copied from, not "${biology.source.kind}".`,
      )
    }
    if (!biology.scientificName.trim()) {
      flag(
        'I_BIOLOGY_IDENTITY_UNCHECKABLE',
        'biologicalIdentity.scientificName',
        'A recorded organism must carry the accepted scientific name the taxonomy states.',
      )
    }
    if (!biology.rankAsRecorded.trim()) {
      flag(
        'I_BIOLOGY_IDENTITY_UNCHECKABLE',
        'biologicalIdentity.rankAsRecorded',
        'A recorded organism must carry the rank the taxonomy assigns it.',
      )
    }
    if (biology.lineageAsRecorded.length === 0) {
      flag(
        'I_BIOLOGY_IDENTITY_UNCHECKABLE',
        'biologicalIdentity.lineageAsRecorded',
        'A recorded organism must carry the lineage that places it, or it says nothing a reader can use.',
      )
    }
    if (biology.matchedOn !== 'SCIENTIFIC_NAME' && biology.matchedOn !== 'COMMON_NAME') {
      flag(
        'I_BIOLOGY_IDENTITY_UNCHECKABLE',
        'biologicalIdentity.matchedOn',
        `Unknown match basis "${biology.matchedOn}"; how a name reached a taxon is part of the record.`,
      )
    }
  }

  /**
   * The marketed-product listing, held to the same reproducibility standard as every other count.
   *
   * The directory returns structured fields and no prose, so the product codes stand in for an
   * excerpt: anyone can look the same codes up in the same public directory and get the same
   * numbers.
   */
  const listing = background.productListing
  if (listing) {
    checkSource('productListing', listing.source)
    if (listing.source.kind !== 'FDA_NDC') {
      flag(
        'I_PRODUCT_LISTING_UNCHECKABLE',
        'productListing.source',
        `A product listing must cite the directory it was counted from, not "${listing.source.kind}".`,
      )
    }
    if (listing.productCount < 1 || listing.sampleProductNdcs.length === 0) {
      flag(
        'I_PRODUCT_LISTING_UNCHECKABLE',
        'productListing',
        `Reports ${listing.productCount} product(s) with ${listing.sampleProductNdcs.length} code(s); a transcribed count needs at least one code to be checkable.`,
      )
    }
    if (listing.singleIngredientProductCount > listing.productCount) {
      flag(
        'I_PRODUCT_LISTING_UNCHECKABLE',
        'productListing.singleIngredientProductCount',
        `${listing.singleIngredientProductCount} single-ingredient product(s) cannot exceed ${listing.productCount} in total.`,
      )
    }
    // A pharmacologic class read off a combination product belongs to whichever of its ingredients
    // earned it, and the directory does not say which. Without a single-ingredient product there is
    // no document attributing the class to this substance alone.
    if (
      listing.pharmacologicClassesAsRecorded.length > 0 &&
      listing.singleIngredientProductCount === 0
    ) {
      flag(
        'I_PRODUCT_LISTING_CLASS_UNATTRIBUTABLE',
        'productListing.pharmacologicClassesAsRecorded',
        'A pharmacologic class may only be recorded from a product declaring this substance alone, and no such product was counted.',
      )
    }
  }

  /**
   * A recorded approval, held to the reproducibility standard every transcribed count meets.
   *
   * The register returns structured fields and no prose, so the application numbers stand in for an
   * excerpt. A date with no application behind it is an assertion about regulatory history.
   */
  const approval = background.regulatoryApproval
  if (approval) {
    checkSource('regulatoryApproval', approval.source)
    if (approval.source.kind !== 'FDA_DRUGSFDA') {
      flag(
        'I_APPROVAL_UNCHECKABLE',
        'regulatoryApproval.source',
        `An approval must cite the register it was read from, not "${approval.source.kind}".`,
      )
    }
    if (approval.applicationCount < 1 || approval.sampleApplicationNumbers.length === 0) {
      flag(
        'I_APPROVAL_UNCHECKABLE',
        'regulatoryApproval',
        `Reports ${approval.applicationCount} application(s) with ${approval.sampleApplicationNumbers.length} number(s); a transcribed count needs at least one to be checkable.`,
      )
    }
    // A date with no application number beside it cannot be looked up, and an application number
    // with no date states nothing. Either both or neither.
    const hasDate = Boolean(approval.earliestOriginalApprovalDate)
    const hasApplication = Boolean(approval.earliestApplicationNumber)
    if (hasDate !== hasApplication) {
      flag(
        'I_APPROVAL_UNCHECKABLE',
        'regulatoryApproval.earliestOriginalApprovalDate',
        'An earliest approval date and the application that carried it are recorded together or not at all.',
      )
    }
    if (
      approval.earliestOriginalApprovalDate &&
      !/^\d{8}$/u.test(approval.earliestOriginalApprovalDate)
    ) {
      flag(
        'I_APPROVAL_UNCHECKABLE',
        'regulatoryApproval.earliestOriginalApprovalDate',
        `"${approval.earliestOriginalApprovalDate}" is not a date as the register writes them.`,
      )
    }
  }

  /**
   * A recorded supplement ingredient, checkable by the group identifier it was copied from.
   */
  const ingredient = background.supplementIngredient
  if (ingredient) {
    checkSource('supplementIngredient', ingredient.source)
    if (ingredient.source.kind !== 'DSLD') {
      flag(
        'I_SUPPLEMENT_INGREDIENT_UNCHECKABLE',
        'supplementIngredient.source',
        `A supplement ingredient must cite the label database it was copied from, not "${ingredient.source.kind}".`,
      )
    }
    if (!ingredient.groupNameAsRecorded.trim()) {
      flag(
        'I_SUPPLEMENT_INGREDIENT_UNCHECKABLE',
        'supplementIngredient.groupNameAsRecorded',
        'A supplement ingredient must carry the name the database files it under.',
      )
    }
    if (ingredient.recordedSpellingCount < 0) {
      flag(
        'I_SUPPLEMENT_INGREDIENT_UNCHECKABLE',
        'supplementIngredient.recordedSpellingCount',
        'A count of recorded spellings cannot be negative.',
      )
    }
  }

  /**
   * Recorded source material, checkable by the substance identifier it was copied from.
   */
  const material = background.sourceMaterial
  if (material) {
    checkSource('sourceMaterial', material.source)
    if (material.source.kind !== 'FDA_UNII') {
      flag(
        'I_SOURCE_MATERIAL_UNCHECKABLE',
        'sourceMaterial.source',
        `Source material must cite the substance registry it was copied from, not "${material.source.kind}".`,
      )
    }
    if (!material.substanceClassAsRecorded.trim()) {
      flag(
        'I_SOURCE_MATERIAL_UNCHECKABLE',
        'sourceMaterial.substanceClassAsRecorded',
        'A source-material record must carry the class the registry assigns.',
      )
    }
    // A part belongs to something. Recording "leaf" with no organism beside it states a fragment of
    // a fact and invites a reader to supply the rest.
    if (material.partsAsRecorded.length > 0 && !material.parentSubstanceAsRecorded?.trim()) {
      flag(
        'I_SOURCE_MATERIAL_UNCHECKABLE',
        'sourceMaterial.partsAsRecorded',
        'A recorded part must name the organism it is a part of.',
      )
    }
  }

  return {
    engineVersion: BACKGROUND_ENGINE_VERSION,
    passed: findings.length === 0,
    findings,
  }
}
