import { describe, expect, it } from 'vitest'

import {
  normalizedMonthlyUsdFromEntry,
  steadyStateNoteFromHalfLifeHours,
} from '@/lib/background/derivations'
import type { MedicineRecordedBackground } from '@/lib/background/types'
import {
  BACKGROUND_ENGINE_VERSION,
  BACKGROUND_RULE_CODES,
  runBackgroundIntelligence,
  type BackgroundRuleCode,
} from '@/lib/rna-intelligence/background-rules'

/**
 * A fully valid, plainly synthetic `medicine-background/v1` envelope exercising every module type:
 * pharmacokinetics (including a discrepant value with its alternate reading), a titration
 * schedule, product variants, cost context with a USD normalization, anatomy targets,
 * applicability, pivotal results and registry identifiers. Both derivations are produced by the
 * real functions in `lib/background/derivations.ts`, so the engine's recomputation matches by
 * construction. No value is a real medical claim.
 */
const MECHANISM_TEXT =
  'The synthetic medicine binds the synthetic receptor and reduces synthetic signalling in the model.'
const BOXED_TEXT =
  'Synthetic boxed warning: patients should be monitored for the synthetic adverse outcome.'
const CONTRAINDICATION_TEXT =
  'This synthetic medicine is contraindicated in the synthetic hypersensitivity population.'
const PEDIATRIC_TEXT =
  'Safety and effectiveness in synthetic pediatric patients have not been established.'
const ADVERSE_TEXT =
  'The most common adverse reactions (≥ 5 %) were synthetic headache and synthetic nausea.'

function validBackground(): MedicineRecordedBackground {
  const labelSource = {
    kind: 'FDA_LABEL' as const,
    identifier: '00000000-0000-4000-8000-000000000000',
    label: 'Synthetic medicine label',
    retrievedAt: '2026-08-27',
    excerpt: 'Synthetic label wording: absolute bioavailability is approximately 89% in adults.',
  }
  // A quoted statement is its own excerpt, which is exactly what the engine requires of it.
  const statement = (text: string) => ({
    textAsRecorded: text,
    source: { ...labelSource, excerpt: text },
  })
  return {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral tablet',
      bioavailability: {
        display: '~89%',
        numeric: 89,
        unit: '%',
        populationContext: 'synthetic healthy adults, single dose',
        source: labelSource,
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 168 hours',
        numeric: 168,
        unit: 'hours',
        populationContext: 'synthetic adults at steady state',
        source: {
          ...labelSource,
          excerpt: 'Synthetic label wording: the elimination half-life is approximately 168 hours.',
        },
        concordance: 'discrepant',
        alternateValue: {
          display: '165 to 184 hours',
          source: {
            kind: 'PUBMED',
            identifier: '12345678',
            label: 'Synthetic pharmacokinetics review',
            retrievedAt: '2026-08-27',
            excerpt: 'Synthetic abstract wording: half-life ranged from 165 to 184 hours.',
          },
        },
      },
      steadyStateNote: steadyStateNoteFromHalfLifeHours(168),
    },
    titration: {
      basis: 'LABEL_SCHEDULE',
      steps: [
        { order: 1, periodAsRecorded: 'Weeks 1–4', amountAsRecorded: '0.25 mg once weekly' },
        { order: 2, periodAsRecorded: 'Weeks 5–8', amountAsRecorded: '0.5 mg once weekly' },
      ],
      source: labelSource,
    },
    productVariants: [
      {
        brandName: 'Synthetibrand',
        formAsRecorded: 'injection pen',
        strengthsAsRecorded: '0.25 mg, 0.5 mg',
        approvedUseAsRecorded: 'a synthetic recorded use',
        jurisdiction: 'US_FDA',
        statusAsRecorded: 'Synthetic prescription status recorded 2026-01-01',
        source: labelSource,
      },
    ],
    costContext: [
      {
        jurisdiction: 'UK',
        currency: 'GBP',
        priceType: 'NHS_INDICATIVE',
        amountLow: 12.5,
        amountHigh: 24.5,
        per: 'one month of the synthetic recorded pack',
        asOf: '2026-06-01',
        whoPaysAsRecorded: 'a synthetic recorded payer',
        source: {
          kind: 'NICE_BNF',
          identifier: 'TA999',
          label: 'Synthetic appraisal record',
          retrievedAt: '2026-08-27',
          excerpt: 'Synthetic price wording: £12.50 to £24.50 per month.',
        },
        normalizedMonthlyUsd: {
          ...normalizedMonthlyUsdFromEntry({
            currency: 'GBP',
            amountLow: 12.5,
            amountHigh: 24.5,
            fxRate: 1.27,
          })!,
          fxRate: 1.27,
          fxAsOf: '2026-08-27',
        },
      },
    ],
    anatomyTargets: [
      {
        regionCode: 'pancreas',
        actionAsRecorded: 'a synthetic recorded action at this organ',
        source: labelSource,
      },
    ],
    applicability: {
      trialIdentifier: 'NCT00000001',
      includedAsRecorded: ['synthetic adults aged 18 or older', 'a synthetic recorded criterion'],
      excludedAsRecorded: ['a synthetic recorded exclusion'],
      studiedGroupAsRecorded: 'a synthetic recorded demographic summary',
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT00000001',
        label: 'Synthetic registry record',
        retrievedAt: '2026-08-27',
        excerpt: 'Synthetic eligibility wording for the recorded criteria.',
      },
    },
    pivotalResults: [
      {
        trialIdentifier: 'NCT00000001',
        endpointAsRecorded: 'change in the synthetic score from baseline',
        activeResultAsRecorded: '-14.9%',
        comparatorResultAsRecorded: '-2.4%',
        differenceAsRecorded: '-12.5 percentage points',
        uncertaintyAsRecorded: '95% CI -13.4 to -11.5',
        timepointAsRecorded: 'week 68',
        source: {
          kind: 'PUBMED',
          identifier: '12345678',
          label: 'Synthetic pivotal trial report',
          retrievedAt: '2026-08-27',
          excerpt:
            'Synthetic result wording: the change was -14.9% with active treatment and -2.4% with placebo at week 68 (difference -12.5 points; 95% CI -13.4 to -11.5).',
        },
      },
    ],
    registryIdentifiers: {
      pubchemCid: '12345',
      casNumber: '1234567-89-0',
      atcCode: 'A10BX99',
      unii: 'ABC1234XYZ',
      rxcui: '123456',
      source: {
        kind: 'PUBCHEM',
        identifier: '12345',
        label: 'Synthetic compound record',
        retrievedAt: '2026-08-27',
      },
    },
    mechanism: {
      statements: [statement(MECHANISM_TEXT)],
      namedTargetsAsRecorded: ['synthetic receptor'],
    },
    molecularIdentity: {
      molecularFormula: {
        display: 'C16H19N3O5S',
        populationContext: 'as stated in the synthetic label sentence recorded below',
        source: { ...labelSource, excerpt: 'The molecular formula is C16H19N3O5S.' },
      },
      molecularWeight: {
        display: '396.44',
        numeric: 396.44,
        unit: 'g/mol',
        populationContext: 'as stated in the synthetic label sentence recorded below',
        source: { ...labelSource, excerpt: 'The molecular weight is 396.44 g/mol.' },
      },
    },
    interactionSignals: [
      {
        counterpartyAsRecorded: 'CYP3A4',
        kind: 'ENZYME',
        roleAsRecorded: 'SUBSTRATE',
        source: {
          ...labelSource,
          excerpt: 'This synthetic medicine is a substrate of CYP3A4 in the synthetic model.',
        },
      },
    ],
    safety: {
      boxedWarning: statement(BOXED_TEXT),
      contraindications: [statement(CONTRAINDICATION_TEXT)],
    },
    populationStatements: [
      {
        population: 'PEDIATRIC',
        state: 'NOT_ESTABLISHED',
        textAsRecorded: PEDIATRIC_TEXT,
        source: { ...labelSource, excerpt: PEDIATRIC_TEXT },
      },
    ],
    commonAdverseReactions: {
      thresholdAsRecorded: '≥ 5 %',
      eventsAsRecorded: ['synthetic headache', 'synthetic nausea'],
      source: { ...labelSource, excerpt: ADVERSE_TEXT },
    },
  }
}

interface RuleCase {
  mutate: (background: MedicineRecordedBackground) => void
}

const ruleCases = {
  I_ENVELOPE_VERSION_INVALID: {
    mutate: (background) => {
      background.version = 'medicine-background/v2' as never
    },
  },
  I_AUTHORED_AT_INVALID: {
    mutate: (background) => {
      background.authoredAt = 'yesterday'
    },
  },
  I_SOURCE_KIND_UNKNOWN: {
    mutate: (background) => {
      background.pharmacokinetics!.bioavailability!.source.kind = 'BLOG' as never
    },
  },
  I_SOURCE_IDENTIFIER_INVALID: {
    mutate: (background) => {
      background.pharmacokinetics!.bioavailability!.source.identifier = 'not-a-setid'
    },
  },
  I_SOURCE_RETRIEVED_AT_INVALID: {
    mutate: (background) => {
      background.pharmacokinetics!.bioavailability!.source.retrievedAt = 'last week'
    },
  },
  I_EXCERPT_TOO_LONG: {
    mutate: (background) => {
      background.pharmacokinetics!.bioavailability!.source.excerpt = `Synthetic label wording: absolute bioavailability is approximately 89% in adults. ${'padding '.repeat(50)}`
    },
  },
  I_VALUE_NOT_IN_EXCERPT: {
    mutate: (background) => {
      background.pharmacokinetics!.bioavailability!.display = '~93%'
      background.pharmacokinetics!.bioavailability!.numeric = 93
    },
  },
  I_CONTEXT_MISSING: {
    mutate: (background) => {
      background.pharmacokinetics!.bioavailability!.populationContext = '   '
    },
  },
  I_RANGE_IMPLAUSIBLE: {
    mutate: (background) => {
      const bioavailability = background.pharmacokinetics!.bioavailability!
      bioavailability.display = '250%'
      bioavailability.numeric = 250
      bioavailability.source.excerpt = 'Synthetic label wording: a recorded reading of 250%.'
    },
  },
  I_STEADY_STATE_MISMATCH: {
    mutate: (background) => {
      background.pharmacokinetics!.steadyStateNote = 'Levels settle instantly.'
    },
  },
  I_TITRATION_ORDER_INVALID: {
    mutate: (background) => {
      background.titration!.steps[1]!.order = 3
    },
  },
  I_TITRATION_EMPTY: {
    mutate: (background) => {
      background.titration!.steps = []
    },
  },
  I_PRODUCT_JURISDICTION_UNKNOWN: {
    mutate: (background) => {
      background.productVariants![0]!.jurisdiction = 'MOON' as never
    },
  },
  I_COST_JURISDICTION_UNKNOWN: {
    mutate: (background) => {
      background.costContext![0]!.jurisdiction = 'MOON' as never
    },
  },
  I_COST_CURRENCY_UNKNOWN: {
    mutate: (background) => {
      background.costContext![0]!.currency = 'JPY' as never
    },
  },
  I_COST_PRICE_TYPE_UNKNOWN: {
    mutate: (background) => {
      background.costContext![0]!.priceType = 'STREET_PRICE' as never
    },
  },
  I_COST_RANGE_INVALID: {
    mutate: (background) => {
      background.costContext![0]!.amountHigh = 1
      delete background.costContext![0]!.normalizedMonthlyUsd
    },
  },
  I_COST_AS_OF_INVALID: {
    mutate: (background) => {
      background.costContext![0]!.asOf = 'June 2026'
    },
  },
  I_COST_NORMALIZATION_MISMATCH: {
    mutate: (background) => {
      background.costContext![0]!.normalizedMonthlyUsd!.low = 1
    },
  },
  I_ANATOMY_REGION_UNKNOWN: {
    mutate: (background) => {
      background.anatomyTargets![0]!.regionCode = 'not-a-region' as never
    },
  },
  I_APPLICABILITY_EMPTY: {
    mutate: (background) => {
      background.applicability!.includedAsRecorded = []
    },
  },
  I_TRIAL_IDENTIFIER_INVALID: {
    mutate: (background) => {
      background.applicability!.trialIdentifier = 'trial-1'
    },
  },
  I_CONCORDANCE_ALTERNATE_MISMATCH: {
    mutate: (background) => {
      background.pharmacokinetics!.halfLife!.concordance = 'label_only'
    },
  },
  I_FORBIDDEN_GUIDANCE_LANGUAGE: {
    mutate: (background) => {
      background.pharmacokinetics!.routeAsRecorded =
        'You should take this synthetic medicine by mouth.'
    },
  },
  I_REGISTRY_IDENTIFIER_INVALID: {
    mutate: (background) => {
      background.registryIdentifiers!.casNumber = 'not-a-cas'
    },
  },
  I_STATEMENT_NOT_VERBATIM: {
    mutate: (background) => {
      background.mechanism!.statements[0]!.textAsRecorded = 'A summary the source never printed.'
    },
  },
  I_STATEMENT_EMPTY: {
    mutate: (background) => {
      background.mechanism!.statements = []
    },
  },
  I_MECHANISM_TARGET_NOT_IN_TEXT: {
    mutate: (background) => {
      background.mechanism!.namedTargetsAsRecorded = ['synthetic transporter never named']
    },
  },
  I_MOLECULAR_FORMULA_INVALID: {
    mutate: (background) => {
      background.molecularIdentity!.molecularFormula!.display = 'not a formula'
      background.molecularIdentity!.molecularFormula!.source.excerpt = 'not a formula'
    },
  },
  I_MOLECULAR_WEIGHT_IMPLAUSIBLE: {
    mutate: (background) => {
      background.molecularIdentity!.molecularWeight!.numeric = 4
      background.molecularIdentity!.molecularWeight!.display = '4'
      background.molecularIdentity!.molecularWeight!.source.excerpt = 'The molecular weight is 4.'
    },
  },
  I_INTERACTION_KIND_UNKNOWN: {
    mutate: (background) => {
      // @ts-expect-error deliberately outside the vocabulary
      background.interactionSignals![0]!.kind = 'ORGANELLE'
    },
  },
  I_INTERACTION_ROLE_UNKNOWN: {
    mutate: (background) => {
      // @ts-expect-error deliberately outside the vocabulary
      background.interactionSignals![0]!.roleAsRecorded = 'ACCELERATOR'
    },
  },
  I_INTERACTION_COUNTERPARTY_NOT_IN_EXCERPT: {
    mutate: (background) => {
      background.interactionSignals![0]!.counterpartyAsRecorded = 'CYP2D6'
    },
  },
  I_POPULATION_UNKNOWN: {
    mutate: (background) => {
      // @ts-expect-error deliberately outside the vocabulary
      background.populationStatements![0]!.population = 'ASTRONAUTS'
    },
  },
  I_POPULATION_STATE_UNKNOWN: {
    mutate: (background) => {
      // @ts-expect-error deliberately outside the vocabulary
      background.populationStatements![0]!.state = 'PROBABLY_FINE'
    },
  },
  I_POPULATION_DUPLICATE: {
    mutate: (background) => {
      background.populationStatements!.push({ ...background.populationStatements![0]! })
    },
  },
  I_ADVERSE_THRESHOLD_NOT_IN_EXCERPT: {
    mutate: (background) => {
      background.commonAdverseReactions!.thresholdAsRecorded = '≥ 12 %'
    },
  },
  I_ADVERSE_EVENT_NOT_IN_EXCERPT: {
    mutate: (background) => {
      background.commonAdverseReactions!.eventsAsRecorded = ['synthetic dizziness']
    },
  },
  I_INTERACTION_SECTION_NOT_DESCRIPTIVE: {
    mutate: (background) => {
      // Section 7 is the regulated advice section; a role may never be read out of it.
      // @ts-expect-error deliberately outside the descriptive-section vocabulary
      background.interactionSignals![0]!.labelSection = 'drug_interactions'
    },
  },
  I_ATTRIBUTION_TOO_BROAD: {
    mutate: (background) => {
      // An extracted record whose source named several substances cannot own a mechanism statement.
      background.provenanceTier = 'extracted'
      background.attribution = { declaredSubstanceCount: 12 }
    },
  },
} satisfies Record<BackgroundRuleCode, RuleCase>

describe('RNA Intelligence Group I stable rule-code coverage', () => {
  it('has one executable focused case for every registered stable code', () => {
    expect(new Set(BACKGROUND_RULE_CODES).size).toBe(BACKGROUND_RULE_CODES.length)
    expect(Object.keys(ruleCases).sort()).toEqual([...BACKGROUND_RULE_CODES].sort())
  })

  for (const code of BACKGROUND_RULE_CODES) {
    const testCase = (ruleCases as Record<BackgroundRuleCode, RuleCase | undefined>)[code]
    it(`${code} is reachable and preserves its finding contract`, () => {
      expect(testCase, `${code} has no registered focused case`).toBeDefined()
      const background = validBackground()
      testCase!.mutate(background)
      const report = runBackgroundIntelligence(background)
      const finding = report.findings.find((item) => item.code === code)

      expect(finding, `${code} did not emit`).toBeDefined()
      expect(report.passed).toBe(false)
      expect(finding!.path.trim().length).toBeGreaterThan(0)
      expect(finding!.message.trim().length).toBeGreaterThan(10)
    })
  }
})

describe('fully valid recorded background envelope', () => {
  it('passes the background engine with zero findings', () => {
    const report = runBackgroundIntelligence(validBackground())
    expect(report.engineVersion).toBe(BACKGROUND_ENGINE_VERSION)
    expect(report.findings).toEqual([])
    expect(report.passed).toBe(true)
  })
})
