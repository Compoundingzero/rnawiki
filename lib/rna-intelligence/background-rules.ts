/**
 * RNA Intelligence — Group I: recorded background validation, engine version
 * `rna-intelligence/background-1.0.0`.
 *
 * Deterministic structural checks over the `medicine-background/v1` envelope. The group's central
 * guarantee is mechanical provenance: a numeric value must literally appear inside the source
 * excerpt fetched at authoring time, so a number that was remembered instead of read fails
 * validation. Like every other group, this code checks structure only — it never judges what a
 * value means medically, and it selects no conclusion.
 */

import {
  BACKGROUND_CONCORDANCE_STATES,
  BACKGROUND_SOURCE_KINDS,
  COST_CURRENCIES,
  COST_JURISDICTIONS,
  COST_PRICE_TYPES,
  MEDICINE_BACKGROUND_VERSION,
  PRODUCT_JURISDICTIONS,
  type BackgroundSource,
  type MedicineRecordedBackground,
  type RecordedValue,
} from '@/lib/background/types'
import { isAnatomyRegionCode } from '@/lib/background/anatomy-regions'
import {
  normalizedMonthlyUsdFromEntry,
  steadyStateNoteFromHalfLifeHours,
} from '@/lib/background/derivations'

export const BACKGROUND_ENGINE_VERSION = 'rna-intelligence/background-1.0.0'

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
  return display.match(/\d+(?:\.\d+)?/gu) ?? []
}

function normalizeForMatch(text: string): string {
  return text.replace(/[ \s]+/gu, ' ').replace(/,(?=\d{3}\b)/gu, '')
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
    if (typeof value.numeric === 'number' || displayTokens.length > 0) {
      const excerpt = value.source?.excerpt
      if (!excerpt) {
        flag(
          'I_VALUE_NOT_IN_EXCERPT',
          path,
          'A value that displays numbers must carry the fetched excerpt that contains them.',
        )
      } else {
        const haystack = normalizeForMatch(excerpt)
        const missing = displayTokens.filter((token) => !haystack.includes(token))
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
    checkRecordedValue('pharmacokinetics.volumeOfDistribution', pk.volumeOfDistribution, {
      min: 0.1,
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
        const missing = amountTokens.filter((token) => !haystack.includes(token))
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
      flag('I_TRIAL_IDENTIFIER_INVALID', path, 'Pivotal results must reference an NCT number.')
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

  return {
    engineVersion: BACKGROUND_ENGINE_VERSION,
    passed: findings.length === 0,
    findings,
  }
}
