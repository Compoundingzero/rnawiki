/**
 * Substance type and availability, resolved as two separate answers.
 *
 * The defects these guard are real ones found by running the classifier over all 9,859 records:
 *
 *   - every non-prescription substance read as "over-the-counter medicine", which is wrong for a
 *     vitamin, wrong for creatine and wrong for a plant preparation;
 *   - one recorded modality holds 6,445 records and hides nutrients, supplements and botanicals;
 *   - the corpus page's withdrawn flag marks 336 records whose approval status reads "FDA
 *     Approved", so reading it as a substance state labelled 336 approved medicines withdrawn;
 *   - suppression is an RNAWiki display decision, and reading it as "not available" invents a
 *     regulatory state out of an editorial one.
 *
 * Fixtures only. No sentence here is a claim about a real substance.
 */
import { describe, expect, it } from 'vitest'

import {
  findForbiddenPhrases,
  findInternalKeys,
  sentenceStats,
} from '@/lib/dossier-v3/copy-contract'
import {
  AVAILABILITY_STATES,
  SUBSTANCE_TYPES,
  VARIES_BY_COUNTRY,
  classifySubstance,
  planningEligibleType,
} from '@/lib/dossier-v4/substance'

const base = { displayName: 'Fixture substance' }

describe('the vocabularies are renderable', () => {
  it('every type and availability state has a distinct code and a reader label', () => {
    for (const list of [SUBSTANCE_TYPES, AVAILABILITY_STATES]) {
      const codes = list.map((entry) => entry.code)
      expect(new Set(codes).size).toBe(codes.length)
      for (const entry of list) {
        expect(entry.label).not.toBe(entry.code)
        expect(findInternalKeys(entry.label)).toEqual([])
        expect(findForbiddenPhrases(`${entry.label} ${entry.plain}`)).toEqual([])
        expect(sentenceStats(entry.plain).over30).toBe(0)
      }
    }
  })
})

describe('the supplement bucket is split three ways', () => {
  it('a vitamin is a nutrient, not a medicine', () => {
    const result = classifySubstance({
      ...base,
      displayName: 'Vitamin B1',
      modality: 'Nutraceutical / Botanical',
      approvalStatus: 'Non-FDA / Dietary Supplement',
    })
    expect(result.type).toBe('nutrient')
    expect(result.typeLabel).not.toMatch(/over-the-counter/i)
  })

  it('a named plant part is a plant preparation', () => {
    const result = classifySubstance({
      ...base,
      displayName: 'Crateva Magna Bark',
      modality: 'Nutraceutical / Botanical',
      approvalStatus: 'Non-FDA / Dietary Supplement',
    })
    expect(result.type).toBe('botanical')
  })

  it('a Latin binomial alone is enough to mark a plant', () => {
    const result = classifySubstance({
      ...base,
      displayName: 'Melilotus Officinalis',
      modality: 'Nutraceutical / Botanical',
    })
    expect(result.type).toBe('botanical')
  })

  it('anything else sold as a supplement is a dietary supplement, not a medicine', () => {
    const result = classifySubstance({
      ...base,
      displayName: 'Creatine',
      modality: 'Nutraceutical / Botanical',
      approvalStatus: 'Non-FDA / Dietary Supplement',
    })
    expect(result.type).toBe('dietary_supplement')
    expect(result.typeLabel).toBe('Dietary supplement')
  })

  it('reads the name when the record forgot to say what it is', () => {
    const result = classifySubstance({ ...base, displayName: 'Manganese Lactate' })
    expect(result.type).toBe('nutrient')
  })
})

describe('chemistry survives regulation', () => {
  it('an antibody stays an antibody whatever its approval', () => {
    for (const approvalStatus of ['FDA Approved', 'Phase 2 Investigational', undefined]) {
      const result = classifySubstance({
        ...base,
        displayName: 'Fixturemab',
        modality: 'Monoclonal Antibody (mAb)',
        ...(approvalStatus ? { approvalStatus } : {}),
      })
      expect(result.type).toBe('monoclonal_antibody')
    }
  })

  it('separates an RNA medicine from an RNA vaccine by the name', () => {
    expect(
      classifySubstance({
        ...base,
        displayName: 'Fixturisiran',
        modality: 'siRNA (Small Interfering RNA)',
      }).type,
    ).toBe('rna_medicine')
    expect(
      classifySubstance({
        ...base,
        displayName: 'Fixture mRNA Vaccine',
        modality: 'mRNA Vaccine / Therapeutic',
      }).type,
    ).toBe('vaccine')
  })

  it('marks a hormone as a hormone rather than as its manufacturing route', () => {
    expect(
      classifySubstance({
        ...base,
        displayName: 'Insulin Fixture Recombinant',
        modality: 'Recombinant Protein / Biologic',
      }).type,
    ).toBe('hormone')
  })
})

describe('the withdrawn flag is not a substance state', () => {
  it('an approved medicine flagged withdrawn is not called a withdrawn substance', () => {
    // 336 records carry exactly this combination. Reading the flag as a substance state would have
    // told a reader that 336 currently approved medicines are off the market.
    const result = classifySubstance({
      ...base,
      displayName: 'Fixturomab',
      modality: 'Small Molecule',
      approvalStatus: 'FDA Approved',
      withdrawn: true,
    })
    expect(result.type).not.toBe('withdrawn_substance')
    expect(result.availability).toBe('varies_by_jurisdiction')
    expect(result.availabilityBasis).toMatch(/withdrawn in one place and approved in another/i)
  })

  it('an approval record that says withdrawn is believed', () => {
    const result = classifySubstance({
      ...base,
      displayName: 'Fixturecoxib',
      modality: 'Small Molecule',
      approvalStatus: 'Withdrawn from Market',
    })
    expect(result.type).toBe('withdrawn_substance')
    expect(result.availability).toBe('withdrawn')
  })
})

describe('suppression is our decision, not a fact about supply', () => {
  it('a held-back record is unresolved, not unavailable', () => {
    const result = classifySubstance({ ...base, displayName: 'Fixture', suppressed: true })
    expect(result.availability).toBe('unresolved')
    expect(result.availabilityBasis).toMatch(/our decision, not a statement about supply/i)
  })
})

describe('jurisdiction is never assumed', () => {
  it('says availability varies when no jurisdiction is recorded', () => {
    const result = classifySubstance({
      ...base,
      displayName: 'Creatine',
      modality: 'Nutraceutical / Botanical',
      approvalStatus: 'Non-FDA / Dietary Supplement',
    })
    expect(result.availability).toBe('varies_by_jurisdiction')
    expect(result.jurisdictionConfidence).toBe('none')
  })

  it('names the jurisdictions when the record has them', () => {
    const result = classifySubstance({
      ...base,
      displayName: 'Creatine',
      modality: 'Nutraceutical / Botanical',
      approvalStatus: 'Non-FDA / Dietary Supplement',
      registeredJurisdictions: ['US', 'EU'],
    })
    expect(result.availability).toBe('sold_without_prescription')
    expect(result.jurisdictionConfidence).toBe('named')
    expect(result.availabilityBasis).toContain('US, EU')
  })

  it('the varies sentence is the one the brief fixed', () => {
    expect(VARIES_BY_COUNTRY).toBe('Availability and regulation vary by country.')
  })
})

describe('an injected approved product is given by a clinician', () => {
  it('routes decide supervision, not the approval word alone', () => {
    const result = classifySubstance({
      ...base,
      displayName: 'Fixture infusion',
      modality: 'Recombinant Protein / Biologic',
      approvalStatus: 'FDA Approved',
      routes: ['intravenous infusion'],
    })
    expect(result.availability).toBe('clinician_administered')
    expect(result.supervision).toBe('required')
  })
})

describe('planner eligibility follows the type, not the supply route', () => {
  it('allows a nutrient, a supplement, a plant preparation and an over-the-counter medicine', () => {
    for (const type of ['nutrient', 'dietary_supplement', 'botanical', 'otc_medicine'] as const) {
      expect(planningEligibleType(type)).toBe(true)
    }
  })

  it('refuses everything a clinician decides', () => {
    for (const type of [
      'prescription_medicine',
      'monoclonal_antibody',
      'gene_therapy',
      'vaccine',
      'investigational_substance',
      'research_compound',
      'withdrawn_substance',
      'unknown_type',
    ] as const) {
      expect(planningEligibleType(type)).toBe(false)
    }
  })
})
