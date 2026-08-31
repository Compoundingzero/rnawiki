import { describe, expect, it } from 'vitest'

import {
  normalizedMonthlyUsdFromEntry,
  steadyStateNoteFromHalfLifeHours,
} from '@/lib/background/derivations'
import type { MedicineRecordedBackground } from '@/lib/background/types'
import { medicineBackgroundContext } from '@/lib/medicine-background-view'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'

function syntheticBackground(): MedicineRecordedBackground {
  const labelSource = {
    kind: 'FDA_LABEL' as const,
    identifier: '00afce9b-48c9-487a-a738-e359c005c707',
    label: 'Synthetic medicine label',
    version: 'label-revision-7',
    effectiveDate: '2026-08-15',
    retrievedAt: '2026-08-27',
    excerpt: 'Synthetic label wording: absolute bioavailability is approximately 89% in adults.',
  }
  return {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-27',
    pharmacokinetics: {
      routeAsRecorded: 'oral tablet',
      bioavailability: {
        display: '~89%',
        numeric: 89,
        unit: '%',
        populationContext: 'healthy adults, single dose',
        source: labelSource,
        concordance: 'label_only',
      },
      halfLife: {
        display: 'about 168 hours',
        numeric: 168,
        unit: 'hours',
        populationContext: 'adults at steady state',
        source: {
          ...labelSource,
          excerpt: 'Synthetic label wording: the elimination half-life is approximately 168 hours.',
        },
        concordance: 'discrepant',
        alternateValue: {
          display: '165 to 184 hours',
          source: {
            kind: 'PUBMED',
            identifier: '33881682',
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
        statusAsRecorded: 'Prescription product; FDA label in effect 2026-01-01',
        source: labelSource,
      },
    ],
    costContext: [
      {
        jurisdiction: 'UK',
        currency: 'GBP',
        priceType: 'NHS_INDICATIVE',
        amountLow: 73.25,
        amountHigh: 175.8,
        per: 'one month of the recorded pack',
        asOf: '2026-06-01',
        whoPaysAsRecorded: 'NHS, free at the point of care for eligible people',
        source: {
          kind: 'NICE_BNF',
          identifier: 'TA875',
          label: 'Synthetic NICE appraisal',
          retrievedAt: '2026-08-27',
          excerpt: 'Synthetic price wording: £73.25 to £175.80 per month.',
        },
        normalizedMonthlyUsd: {
          ...normalizedMonthlyUsdFromEntry({
            currency: 'GBP',
            amountLow: 73.25,
            amountHigh: 175.8,
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
      trialIdentifier: 'NCT03548935',
      includedAsRecorded: ['adults aged 18 or older', 'a recorded body-mass criterion'],
      excludedAsRecorded: ['a recorded prior-condition exclusion'],
      studiedGroupAsRecorded: 'a synthetic recorded demographic summary',
      source: {
        kind: 'CLINICALTRIALS',
        identifier: 'NCT03548935',
        label: 'Synthetic registry record',
        retrievedAt: '2026-08-27',
        excerpt: 'Synthetic eligibility wording for the recorded criteria.',
      },
    },
    registryIdentifiers: {
      pubchemCid: '56843331',
      casNumber: '910463-68-2',
      unii: '53AXN4NNHX',
      rxcui: '1991302',
      source: {
        kind: 'PUBCHEM',
        identifier: '56843331',
        label: 'PubChem compound record',
        retrievedAt: '2026-08-27',
      },
    },
  }
}

describe('recorded background layer', () => {
  it('passes the background engine end to end with a full synthetic envelope', () => {
    const report = runBackgroundIntelligence(syntheticBackground())
    expect(report.findings).toEqual([])
    expect(report.passed).toBe(true)
  })

  it('projects values with context, concordance, canonical source links and derived notes', () => {
    const view = medicineBackgroundContext(syntheticBackground())
    expect(view).toBeDefined()

    const values = view!.pharmacokinetics!.values
    const bioavailability = values.find(
      (value) => value.label === 'How much reaches the bloodstream',
    )
    expect(bioavailability).toMatchObject({
      display: '~89%',
      populationContext: 'healthy adults, single dose',
      concordanceLabel: 'From the label; not separately corroborated',
    })
    expect(bioavailability!.source.href).toBe(
      'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=00afce9b-48c9-487a-a738-e359c005c707',
    )
    expect(bioavailability!.source).toMatchObject({
      version: 'label-revision-7',
      effectiveDate: '2026-08-15',
    })

    const halfLife = values.find((value) => value.label === 'Half-life')
    expect(halfLife!.concordanceLabel).toBe('Sources disagree — both readings shown')
    expect(halfLife!.discrepantAlternate).toMatchObject({ display: '165 to 184 hours' })
    expect(halfLife!.discrepantAlternate!.source.href).toBe(
      'https://pubmed.ncbi.nlm.nih.gov/33881682/',
    )
    expect(halfLife!.discrepantAlternate!.source).not.toHaveProperty('version')
    expect(halfLife!.discrepantAlternate!.source).not.toHaveProperty('effectiveDate')

    expect(view!.pharmacokinetics!.steadyStateNote).toBe(steadyStateNoteFromHalfLifeHours(168))
    expect(view!.titration!.basisLabel).toContain('as stated on the product label')
    expect(view!.costEntries![0]).toMatchObject({
      jurisdictionLabel: 'United Kingdom',
      priceTypeLabel: 'NHS indicative price',
    })
    expect(view!.costEntries![0]!.priceDisplay).toContain('£73.25')
    expect(view!.costEntries![0]!.normalizedDisplay).toContain('per month in US dollars')
    expect(view!.costEntries![0]!.source.href).toBe('https://www.nice.org.uk/guidance/ta875')
    expect(view!.anatomyTargets![0]).toMatchObject({ regionLabel: 'Pancreas' })
    expect(view!.registryIdentifiers!.rows).toEqual(
      expect.arrayContaining([
        { label: 'PubChem CID', value: '56843331' },
        { label: 'CAS registry number', value: '910463-68-2' },
      ]),
    )
  })

  it('drops unknown anatomy region codes instead of guessing a position', () => {
    const background = syntheticBackground()
    background.anatomyTargets = [
      {
        regionCode: 'not-a-region' as never,
        actionAsRecorded: 'anything',
        source: background.titration!.source,
      },
    ]
    const view = medicineBackgroundContext(background)
    expect(view?.anatomyTargets).toBeUndefined()
  })

  it('returns undefined for an empty or unversioned envelope', () => {
    expect(
      medicineBackgroundContext({ version: 'medicine-background/v1', authoredAt: '2026-08-27' }),
    ).toBeUndefined()
    expect(
      medicineBackgroundContext({
        version: 'medicine-background/v2' as never,
        authoredAt: '2026-08-27',
      }),
    ).toBeUndefined()
  })

  it('retains the exact registry source for a name-family ambiguity', () => {
    const view = medicineBackgroundContext({
      version: 'medicine-background/v1',
      authoredAt: '2026-08-31',
      nameFamily: {
        memberCount: 2,
        members: [
          { nameAsRecorded: 'Example base', unii: 'BASE123', productCount: 3 },
          { nameAsRecorded: 'Example salt', unii: 'SALT456', productCount: 2 },
        ],
        source: {
          kind: 'FDA_UNII',
          identifier: 'BASE123',
          label: 'FDA substance registry results for Example',
          version: 'registry-snapshot-2026-08',
          effectiveDate: '2026-08-30',
          retrievedAt: '2026-08-31',
        },
      },
    })

    expect(view?.nameFamily?.source).toMatchObject({
      identifier: 'BASE123',
      version: 'registry-snapshot-2026-08',
      effectiveDate: '2026-08-30',
      retrievedAt: '2026-08-31',
    })
  })

  it('fails the engine when a displayed number is missing from its excerpt', () => {
    const background = syntheticBackground()
    background.pharmacokinetics!.bioavailability!.display = '~93%'
    background.pharmacokinetics!.bioavailability!.numeric = 93
    const report = runBackgroundIntelligence(background)
    expect(report.passed).toBe(false)
    expect(report.findings.some((finding) => finding.code === 'I_VALUE_NOT_IN_EXCERPT')).toBe(true)
  })

  it('fails the engine when a derived note does not match the deterministic recomputation', () => {
    const background = syntheticBackground()
    background.pharmacokinetics!.steadyStateNote = 'Levels settle instantly.'
    const report = runBackgroundIntelligence(background)
    expect(report.findings.some((finding) => finding.code === 'I_STEADY_STATE_MISMATCH')).toBe(true)
  })
})
