/**
 * The excerpt integrity ledger: an independent, per-value check that a displayed number really
 * appears in the text cited for it.
 *
 * No public drug-information resource publishes this. They cite sources, and a reader who wants to
 * know whether the cited source actually prints the number has to go and read it. openFDA states
 * plainly that its data has not been validated for clinical use; the compendia assert values
 * without exposing the binding at all. Publishing the binding — per value, reproducibly, with the
 * rules written down — is a differentiator that costs nothing to verify and cannot be faked.
 *
 * This deliberately does NOT call `runBackgroundIntelligence`. Calling the engine would only prove
 * the engine agrees with itself. The check here is written independently and then COMPARED with
 * the engine, and every disagreement is reported rather than reconciled: a disagreement is a
 * finding about the two checkers, and either one may be the stricter. Reporting it is how a
 * silently weakening check gets noticed.
 *
 * WHAT A FAILURE MEANS. A value whose number is absent from its excerpt is a transcription
 * problem in this corpus. It is not a claim that the source is wrong, and it is not a claim about
 * the medicine. Verbatim matching proves transcription fidelity and nothing else: it says nothing
 * about whether the source is correct, current, or applicable to anyone.
 */

import type { AgentInput, AgentRun, DatasetAgent, ReviewCandidate } from '@/lib/agents/core/types'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type { MedicineRecordedBackground, RecordedValue } from '@/lib/background/types'

const AGENT_NAME = 'excerpt-integrity'
const AGENT_VERSION = '1.0.0'

/**
 * Numeral forms that mean the same quantity but do not match as substrings.
 *
 * Every rule here exists because label typography varies in ways that have nothing to do with the
 * value. A check that missed these would report transcription failures that are really rendering
 * differences, and a reviewer chasing them would learn to ignore the ledger.
 */
export const NUMERAL_NORMALISATION_RULES: ReadonlyArray<{ rule: string; why: string }> = [
  {
    rule: 'Unicode minus (U+2212), en dash and em dash are folded to ASCII hyphen',
    why: 'Labels typeset ranges and negative numbers with typographic dashes.',
  },
  {
    rule: 'Non-breaking, thin, narrow and hair spaces are folded to an ordinary space',
    why: 'SPL rendering inserts them between a number and its unit.',
  },
  {
    rule: 'Thousands separators are removed from digit groups (1,234 becomes 1234)',
    why: 'A separator is presentation; the number is the same either way.',
  },
  {
    rule: 'A leading decimal point gains a zero (.5 becomes 0.5)',
    why: 'Both forms appear in labels, sometimes in one sentence.',
  },
  {
    rule: 'Trailing zeros after a decimal point are dropped (5.0 becomes 5, 0.50 becomes 0.5)',
    why: 'A recorded 5 and a printed 5.0 are the same measurement.',
  },
  {
    rule: 'The word "to" between two numbers is folded to a hyphen (5 to 7 becomes 5-7)',
    why: 'Ranges are written both ways, frequently in the same document.',
  },
  {
    rule: 'Scientific notation is expanded when its exponent is small (2e-3 becomes 0.002)',
    why: 'A value read as 0.002% may be printed as 2 x 10-3 % or the reverse.',
  },
]

/** Applies every rule above to a piece of text. */
export function normaliseNumerals(text: string): string {
  return text
    .replace(/[−–—]/gu, '-')
    .replace(/[     ]/gu, ' ')
    .replace(/(\d),(?=\d{3}\b)/gu, '$1')
    .replace(/(^|[^\d.])\.(\d)/gu, '$10.$2')
    .replace(/(\d+\.\d*?[1-9])0+(?!\d)/gu, '$1')
    .replace(/(\d)\.0+(?!\d)/gu, '$1')
    .replace(/(\d)\s*(?:to|–|—)\s*(\d)/giu, '$1-$2')
    .replace(/\s+/gu, ' ')
    .toLowerCase()
}

/** The numeric tokens a display string commits the record to. */
export function displayNumerals(display: string): string[] {
  return normaliseNumerals(display).match(/\d+(?:\.\d+)?/gu) ?? []
}

/**
 * Expands small-exponent scientific notation, which substring matching cannot see through.
 * Only small exponents are expanded: beyond that the decimal form is not what any label prints.
 */
function withExpandedExponents(text: string): string {
  return text.replace(/(\d+(?:\.\d+)?)\s*e\s*(-?\d{1,2})/giu, (whole, mantissa, exponent) => {
    const value = Number(mantissa) * 10 ** Number(exponent)
    if (!Number.isFinite(value) || Math.abs(Number(exponent)) > 6) return whole
    return `${whole} ${value
      .toFixed(Math.max(0, -Number(exponent) + 2))
      .replace(/0+$/u, '')
      .replace(/\.$/u, '')}`
  })
}

export const INTEGRITY_STATES = [
  'VERIFIED',
  'NUMBER_ABSENT',
  'NO_EXCERPT',
  'NOT_APPLICABLE',
] as const
export type IntegrityState = (typeof INTEGRITY_STATES)[number]

export interface IntegrityEntry {
  slug: string
  /** Dotted path to the checked value, e.g. "pharmacokinetics.halfLife". */
  path: string
  module: string
  state: IntegrityState
  /** Numerals the display commits to that the excerpt does not print. */
  missingNumerals?: string[]
}

export interface ModuleRollUp {
  module: string
  checked: number
  verified: number
  numberAbsent: number
  noExcerpt: number
  /** Verified as a share of those that could be checked at all. */
  verifiedShare: number
}

export interface EngineComparison {
  /** Records this check accepted and the background engine rejected, or the reverse. */
  disagreements: Array<{ slug: string; independentSaysClean: boolean; engineCodes: string[] }>
  recordsCompared: number
  agreementRate: number
  note: string
}

export interface ExcerptIntegrityDataset {
  entries: IntegrityEntry[]
  byModule: ModuleRollUp[]
  statementsChecked: number
  statementsVerbatim: number
  adverseTermsChecked: number
  adverseTermsFound: number
  totalChecked: number
  totalVerified: number
  overallVerifiedShare: number
  normalisationRules: typeof NUMERAL_NORMALISATION_RULES
  engineComparison: EngineComparison
}

/** Every numeric value in a record, with the path a reviewer would use to find it. */
function numericValues(
  background: MedicineRecordedBackground,
): Array<{ path: string; module: string; value: RecordedValue }> {
  const found: Array<{ path: string; module: string; value: RecordedValue }> = []
  const pk = background.pharmacokinetics
  if (pk) {
    for (const field of [
      'bioavailability',
      'tMax',
      'halfLife',
      'proteinBinding',
      'volumeOfDistribution',
      'metabolismAsRecorded',
      'eliminationAsRecorded',
    ] as const) {
      const value = pk[field]
      if (value)
        found.push({ path: `pharmacokinetics.${field}`, module: 'pharmacokinetics', value })
    }
  }
  const molecular = background.molecularIdentity
  if (molecular?.molecularFormula) {
    found.push({
      path: 'molecularIdentity.molecularFormula',
      module: 'molecularIdentity',
      value: molecular.molecularFormula,
    })
  }
  if (molecular?.molecularWeight) {
    found.push({
      path: 'molecularIdentity.molecularWeight',
      module: 'molecularIdentity',
      value: molecular.molecularWeight,
    })
  }
  background.sourceConsensus?.fields.forEach((field, fieldIndex) => {
    field.readings.forEach((reading, readingIndex) => {
      // A consensus reading carries its own sources; it is checked against those, not the record's.
      for (const source of reading.sources) {
        found.push({
          path: `sourceConsensus.fields[${fieldIndex}].readings[${readingIndex}]`,
          module: 'sourceConsensus',
          value: {
            display: reading.display,
            populationContext: 'consensus reading',
            source,
          },
        })
      }
    })
  })
  return found
}

function checkValue(value: RecordedValue): { state: IntegrityState; missing: string[] } {
  const numerals = displayNumerals(value.display)
  if (numerals.length === 0) return { state: 'NOT_APPLICABLE', missing: [] }
  const excerpt = value.source.excerpt
  if (!excerpt) return { state: 'NO_EXCERPT', missing: [] }
  const haystack = withExpandedExponents(normaliseNumerals(excerpt))
  const missing = numerals.filter((numeral) => !haystack.includes(numeral))
  return { state: missing.length === 0 ? 'VERIFIED' : 'NUMBER_ABSENT', missing }
}

/**
 * Whether a consensus reading is verified by ANY of its cited sources rather than each one.
 *
 * A reading grouped from many labels is stated by every source that contributed to it, but the
 * excerpt kept for a given source may have been trimmed around a different part of the sentence.
 * Requiring every excerpt to carry it would report a storage detail as a transcription failure.
 */
function collapseConsensus(entries: IntegrityEntry[]): IntegrityEntry[] {
  const byPath = new Map<string, IntegrityEntry[]>()
  const others: IntegrityEntry[] = []
  for (const entry of entries) {
    if (entry.module !== 'sourceConsensus') {
      others.push(entry)
      continue
    }
    const key = `${entry.slug}|${entry.path}`
    byPath.set(key, [...(byPath.get(key) ?? []), entry])
  }
  const collapsed = [...byPath.values()].map((group) => {
    const verified = group.find((entry) => entry.state === 'VERIFIED')
    return verified ?? group[0]!
  })
  return [...others, ...collapsed]
}

export const excerptIntegrityAgent: DatasetAgent<ExcerptIntegrityDataset> = {
  name: AGENT_NAME,
  version: AGENT_VERSION,
  description:
    'Independently re-checks that every displayed number appears in the source text cited for it, and reports where that check disagrees with the background engine.',

  run(input: AgentInput): AgentRun<ExcerptIntegrityDataset> {
    const rawEntries: IntegrityEntry[] = []
    let statementsChecked = 0
    let statementsVerbatim = 0
    let adverseTermsChecked = 0
    let adverseTermsFound = 0
    const disagreements: EngineComparison['disagreements'] = []

    for (const { slug, background } of input.corpus) {
      for (const { path, module, value } of numericValues(background)) {
        const { state, missing } = checkValue(value)
        rawEntries.push({
          slug,
          path,
          module,
          state,
          ...(missing.length > 0 ? { missingNumerals: missing } : {}),
        })
      }

      // Quoted statements are held to a stricter rule: the recorded text IS the excerpt, so any
      // difference at all means the record and its quote have drifted apart.
      const statements = [
        ...(background.mechanism?.statements ?? []),
        ...(background.safety?.boxedWarning ? [background.safety.boxedWarning] : []),
        ...(background.safety?.contraindications ?? []),
      ]
      for (const statement of statements) {
        statementsChecked += 1
        if (
          normaliseNumerals(statement.textAsRecorded) ===
          normaliseNumerals(statement.source.excerpt ?? '')
        ) {
          statementsVerbatim += 1
        }
      }
      for (const statement of background.populationStatements ?? []) {
        statementsChecked += 1
        if (
          normaliseNumerals(statement.textAsRecorded) ===
          normaliseNumerals(statement.source.excerpt ?? '')
        ) {
          statementsVerbatim += 1
        }
      }

      const adverse = background.commonAdverseReactions
      if (adverse) {
        const haystack = normaliseNumerals(adverse.source.excerpt ?? '')
        for (const event of adverse.eventsAsRecorded) {
          adverseTermsChecked += 1
          if (haystack.includes(normaliseNumerals(event))) adverseTermsFound += 1
        }
      }

      // The comparison that makes this an independent opinion rather than an echo.
      const engine = runBackgroundIntelligence(background)
      const excerptCodes = engine.findings
        .filter(
          (finding) =>
            finding.code.includes('NOT_IN_EXCERPT') || finding.code.includes('NOT_VERBATIM'),
        )
        .map((finding) => finding.code)
      const independentSaysClean = !rawEntries.some(
        (entry) => entry.slug === slug && entry.state === 'NUMBER_ABSENT',
      )
      if (independentSaysClean !== (excerptCodes.length === 0)) {
        disagreements.push({ slug, independentSaysClean, engineCodes: excerptCodes })
      }
    }

    const entries = collapseConsensus(rawEntries)
    const modules = [...new Set(entries.map((entry) => entry.module))].sort()
    const byModule: ModuleRollUp[] = modules.map((module) => {
      const scoped = entries.filter((entry) => entry.module === module)
      const checkable = scoped.filter((entry) => entry.state !== 'NOT_APPLICABLE')
      const verified = scoped.filter((entry) => entry.state === 'VERIFIED').length
      return {
        module,
        checked: checkable.length,
        verified,
        numberAbsent: scoped.filter((entry) => entry.state === 'NUMBER_ABSENT').length,
        noExcerpt: scoped.filter((entry) => entry.state === 'NO_EXCERPT').length,
        verifiedShare: checkable.length > 0 ? verified / checkable.length : 1,
      }
    })

    const totalChecked = entries.filter((entry) => entry.state !== 'NOT_APPLICABLE').length
    const totalVerified = entries.filter((entry) => entry.state === 'VERIFIED').length

    const queue: ReviewCandidate[] = entries
      .filter((entry) => entry.state === 'NUMBER_ABSENT')
      .slice(0, 60)
      .map((entry) => ({
        slug: entry.slug,
        reason: 'ATTRIBUTION_SUSPECT' as const,
        question: `The value recorded at ${entry.path} shows ${(entry.missingNumerals ?? []).join(', ')}, which this check could not find in the excerpt stored beside it. Does the fetched source print that figure, and is the stored excerpt the passage it came from?`,
        priority: 1,
        basis: `Independent numeral check after ${NUMERAL_NORMALISATION_RULES.length} normalisation rules. A miss here is a transcription question about this corpus, not a statement about the source.`,
        sources: [entry.path],
      }))

    return {
      agent: AGENT_NAME,
      version: AGENT_VERSION,
      runDate: input.runDate,
      seed: input.seed,
      parameters: {
        normalisationRules: NUMERAL_NORMALISATION_RULES.length,
        maximumExpandedExponent: 6,
        independentOfEngine: true,
      },
      coverage: {
        considered: input.corpus.length,
        used: new Set(entries.map((entry) => entry.slug)).size,
        reason: `Every recorded value carrying a numeral was checked, across ${modules.length} modules. Values with no numeral in their display have nothing to verify this way and are counted separately.`,
      },
      output: {
        entries,
        byModule,
        statementsChecked,
        statementsVerbatim,
        adverseTermsChecked,
        adverseTermsFound,
        totalChecked,
        totalVerified,
        overallVerifiedShare: totalChecked > 0 ? totalVerified / totalChecked : 1,
        normalisationRules: NUMERAL_NORMALISATION_RULES,
        engineComparison: {
          disagreements: disagreements.slice(0, 40),
          recordsCompared: input.corpus.length,
          agreementRate:
            input.corpus.length > 0
              ? (input.corpus.length - disagreements.length) / input.corpus.length
              : 1,
          note: 'This check is written independently of the background engine so that agreement means something. Where they differ, neither is assumed correct: either may be the stricter, and the difference is the finding.',
        },
      },
      queue,
      caveats: [
        'A verified binding proves transcription fidelity and nothing else. It does not say the source is correct, current, or applicable to any person; it says the number displayed here is the number that document prints.',
        'A value that fails this check is a question about this corpus, never a statement that the source is wrong.',
        'Only numerals are checked this way. A value whose display carries no number cannot be verified by this method and is counted apart rather than counted as passing.',
        'Consensus readings are verified when any one of the sources cited for them prints the reading. Excerpts stored for other contributing sources may be trimmed around a different part of the sentence, and requiring all of them would report a storage detail as a failure.',
        `The ${NUMERAL_NORMALISATION_RULES.length} normalisation rules are listed in the output so a third party can reproduce this check exactly. Loosening them would raise the pass rate without improving the corpus, which is why they are published rather than described.`,
        'Statement modules are held to a stricter rule than numerals: the recorded text must equal the stored excerpt, because a quoted statement has no separate value to check.',
      ],
    }
  },
}
