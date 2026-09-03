import { describe, expect, it } from 'vitest'

import { classifyEntity, type EntityClassInput } from '@/lib/inventory/entity-class'
import {
  addFormCandidates,
  extractRowBackground,
  INORGANIC_STEMS,
  resolveByForm,
  SALT_FORM_FALLBACK_STATUSES,
  SALT_OR_ESTER_SUFFIXES,
  type FormIndex,
  type IndexedLabel,
} from '@/scripts/background/build-extracted-background'

/**
 * Focused cases for the two rules that resolve "empty for the wrong reason" medicine records:
 * entity-class rule 5 (an approval status whose only label evidence is an ingredient listing)
 * and the salt/ester label fallback in the label extractor.
 */

const APPROVED: EntityClassInput = {
  slug: 'x',
  name: 'X',
  modality: 'Small Molecule',
  approvalStatus: 'FDA Approved',
  backgroundModules: ['authoredAt', 'labelPresence', 'version'],
  compositionIngredientCount: 0,
  isPlaceholder: false,
}

describe('entity-class rule 5: approval status with ingredient-listing labels only', () => {
  it('reclassifies an approved record whose labels are all multi-substance OTC products with no application', () => {
    const decision = classifyEntity({
      ...APPROVED,
      labelProductTypes: ['HUMAN OTC DRUG'],
      singleSubstanceLabelCount: 0,
      hasRegulatoryApplication: false,
    })
    expect(decision.entityClass).toBe('MARKETED_PRODUCT_INGREDIENT')
    expect(decision.rule).toMatch(/^rule-5: /u)
  })

  it('applies before the biologic split, so a biologic modality with the same evidence moves too', () => {
    const decision = classifyEntity({
      ...APPROVED,
      modality: 'Recombinant Protein / Biologic',
      labelProductTypes: ['HUMAN OTC DRUG'],
      singleSubstanceLabelCount: 0,
      hasRegulatoryApplication: false,
    })
    expect(decision.entityClass).toBe('MARKETED_PRODUCT_INGREDIENT')
  })

  it('keeps the class when a prescription label names the record', () => {
    expect(
      classifyEntity({
        ...APPROVED,
        labelProductTypes: ['HUMAN OTC DRUG', 'HUMAN PRESCRIPTION DRUG'],
        singleSubstanceLabelCount: 0,
        hasRegulatoryApplication: false,
      }).entityClass,
    ).toBe('APPROVED_MEDICINE')
  })

  it('keeps the class when a label declares the record alone', () => {
    expect(
      classifyEntity({
        ...APPROVED,
        labelProductTypes: ['HUMAN OTC DRUG'],
        singleSubstanceLabelCount: 3,
        hasRegulatoryApplication: false,
      }).entityClass,
    ).toBe('APPROVED_MEDICINE')
  })

  it('keeps the class when a Drugs@FDA application is recorded', () => {
    expect(
      classifyEntity({
        ...APPROVED,
        labelProductTypes: ['HUMAN OTC DRUG'],
        singleSubstanceLabelCount: 0,
        hasRegulatoryApplication: true,
      }).entityClass,
    ).toBe('APPROVED_MEDICINE')
  })

  it('never fires without recorded label presence: a record with no label may be discontinued', () => {
    expect(classifyEntity({ ...APPROVED, hasRegulatoryApplication: false }).entityClass).toBe(
      'APPROVED_MEDICINE',
    )
    expect(
      classifyEntity({ ...APPROVED, labelProductTypes: [], singleSubstanceLabelCount: 0 })
        .entityClass,
    ).toBe('APPROVED_MEDICINE')
  })

  it('does not touch non-approved statuses or earlier rules', () => {
    const evidence = {
      labelProductTypes: ['HUMAN OTC DRUG'],
      singleSubstanceLabelCount: 0,
      hasRegulatoryApplication: false,
    }
    expect(
      classifyEntity({ ...APPROVED, ...evidence, approvalStatus: 'Pre-clinical / Open Source' })
        .entityClass,
    ).toBe('INVESTIGATIONAL_MEDICINE')
    expect(
      classifyEntity({ ...APPROVED, ...evidence, approvalStatus: 'Withdrawn from Market' })
        .entityClass,
    ).toBe('WITHDRAWN_MEDICINE')
    expect(
      classifyEntity({ ...APPROVED, ...evidence, compositionIngredientCount: 2 }).entityClass,
    ).toBe('COMBINATION_PRODUCT')
  })

  it('keeps the rule table numbered in evaluation order', () => {
    const rules = [
      classifyEntity({ ...APPROVED, isPlaceholder: true }).rule,
      classifyEntity({ ...APPROVED, compositionIngredientCount: 2 }).rule,
      classifyEntity({ ...APPROVED, approvalStatus: 'Withdrawn from Market' }).rule,
      classifyEntity({ ...APPROVED, approvalStatus: 'Controlled / No Approved Use' }).rule,
      classifyEntity({
        ...APPROVED,
        labelProductTypes: ['HUMAN OTC DRUG'],
        singleSubstanceLabelCount: 0,
      }).rule,
      classifyEntity({ ...APPROVED, modality: 'Monoclonal Antibody (mAb)' }).rule,
      classifyEntity(APPROVED).rule,
      classifyEntity({ ...APPROVED, approvalStatus: 'Phase 3 Clinical Trial' }).rule,
      classifyEntity({ ...APPROVED, approvalStatus: 'Off-Label / Compounded' }).rule,
      classifyEntity({
        ...APPROVED,
        approvalStatus: 'Non-FDA / Dietary Supplement',
        backgroundModules: ['biologicalIdentity'],
      }).rule,
      classifyEntity({
        ...APPROVED,
        approvalStatus: 'Non-FDA / Dietary Supplement',
        backgroundModules: ['supplementMarket'],
      }).rule,
      classifyEntity({
        ...APPROVED,
        approvalStatus: 'Non-FDA / Dietary Supplement',
        backgroundModules: ['labelPresence'],
      }).rule,
      classifyEntity({
        ...APPROVED,
        approvalStatus: 'Non-FDA / Dietary Supplement',
        backgroundModules: [],
      }).rule,
    ]
    rules.forEach((rule, position) =>
      expect(rule).toMatch(new RegExp(`^rule-${position + 1}: `, 'u')),
    )
  })
})

function label(overrides: Partial<IndexedLabel> & Pick<IndexedLabel, 'setId'>): IndexedLabel {
  return {
    declaredSubstanceCount: 1,
    effectiveTime: '20240101',
    brandNames: [],
    genericNames: [],
    routes: ['ORAL'],
    sections: {},
    score: 1,
    ...overrides,
  }
}

/** A hand-built index: no label is filed under a bare parent name. */
function buildForms(labels: IndexedLabel[]): FormIndex<IndexedLabel> {
  const forms: FormIndex<IndexedLabel> = new Map()
  for (const entry of labels) {
    addFormCandidates(
      forms,
      [...entry.genericNames, ...(entry.substanceNames ?? [])],
      entry.declaredSubstanceCount,
      entry,
    )
  }
  return forms
}

const ETHYNODIOL_DIACETATE = label({
  setId: 'ethynodiol-diacetate-alone',
  genericNames: ['ETHYNODIOL DIACETATE'],
  sections: { indications_and_usage: 'Ethynodiol diacetate tablets are indicated for ...' },
  score: 3,
})
const ETHYNODIOL_COMBINATION = label({
  setId: 'ethynodiol-diacetate-and-ethinyl-estradiol',
  declaredSubstanceCount: 2,
  genericNames: ['ETHYNODIOL DIACETATE AND ETHINYL ESTRADIOL'],
  substanceNames: ['ETHYNODIOL DIACETATE', 'ETHINYL ESTRADIOL'],
  sections: { indications_and_usage: 'combination' },
  score: 9,
})
const TENOFOVIR_DISOPROXIL = label({
  setId: 'tenofovir-disoproxil',
  genericNames: ['TENOFOVIR DISOPROXIL FUMARATE'],
  substanceNames: ['TENOFOVIR DISOPROXIL FUMARATE'],
})
const TENOFOVIR_ALAFENAMIDE = label({
  setId: 'tenofovir-alafenamide',
  genericNames: ['TENOFOVIR ALAFENAMIDE'],
  substanceNames: ['TENOFOVIR ALAFENAMIDE'],
})
// "Sodium chloride" itself never reaches the form index: the content normalizer strips "sodium",
// leaving a one-token name. Zinc is kept, so zinc chloride exercises the elemental guard.
const ZINC_CHLORIDE = label({
  setId: 'zinc-chloride',
  genericNames: ['ZINC CHLORIDE'],
  substanceNames: ['ZINC CHLORIDE'],
})
const BETTER = (candidate: IndexedLabel, held: IndexedLabel) => candidate.score > held.score

describe('salt/ester label fallback', () => {
  it('resolves a bare name to the one single-substance label filed under a salt or ester form', () => {
    const forms = buildForms([ETHYNODIOL_DIACETATE, ETHYNODIOL_COMBINATION])
    const resolution = resolveByForm('ethynodiol', forms, BETTER)
    expect(resolution).toEqual({
      kind: 'MATCHED',
      form: 'diacetate',
      labelKey: 'ethynodiol diacetate',
      label: ETHYNODIOL_DIACETATE,
    })
  })

  it('never registers a multi-substance label, so a combination cannot stand in for the parent', () => {
    const forms = buildForms([ETHYNODIOL_COMBINATION])
    expect(forms.size).toBe(0)
    expect(resolveByForm('ethynodiol', forms, BETTER)).toEqual({ kind: 'NONE' })
  })

  it('refuses an elemental stem: zinc chloride is not zinc, and sodium chloride is not sodium', () => {
    const forms = buildForms([ZINC_CHLORIDE])
    expect(forms.has('zinc')).toBe(true)
    expect(resolveByForm('zinc', forms, BETTER)).toEqual({
      kind: 'INORGANIC_STEM',
      forms: ['chloride'],
    })
    expect(INORGANIC_STEMS.has('sodium')).toBe(true)
    expect(INORGANIC_STEMS.has('zinc')).toBe(true)
  })

  it('refuses when more than one form has its own label rather than choosing between prodrugs', () => {
    const forms = buildForms([TENOFOVIR_DISOPROXIL, TENOFOVIR_ALAFENAMIDE])
    expect(resolveByForm('tenofovir', forms, BETTER)).toEqual({
      kind: 'AMBIGUOUS_FORMS',
      forms: ['alafenamide', 'disoproxil'],
    })
  })

  it('ignores a trailing word that is not in the salt/ester table', () => {
    const forms = buildForms([
      label({ setId: 'triamcinolone-acetonide', genericNames: ['TRIAMCINOLONE ACETONIDE'] }),
    ])
    expect(SALT_OR_ESTER_SUFFIXES.has('acetonide')).toBe(false)
    expect(resolveByForm('triamcinolone', forms, BETTER)).toEqual({ kind: 'NONE' })
  })

  it('is deterministic among several labels of the one form, by the caller preference', () => {
    const richer = label({
      setId: 'ethynodiol-diacetate-richer',
      genericNames: ['ETHYNODIOL DIACETATE'],
      score: 5,
    })
    const forward = resolveByForm('ethynodiol', buildForms([ETHYNODIOL_DIACETATE, richer]), BETTER)
    const reversed = resolveByForm('ethynodiol', buildForms([richer, ETHYNODIOL_DIACETATE]), BETTER)
    expect(forward).toEqual(reversed)
    expect(forward.kind === 'MATCHED' && forward.label.setId).toBe('ethynodiol-diacetate-richer')
  })

  it('is only tried by the extractor when the bare name has no label, and records the form on the source', () => {
    const forms = buildForms([ETHYNODIOL_DIACETATE, ETHYNODIOL_COMBINATION])
    const withFallback = extractRowBackground({
      row: { slug: 'ethynodiol', name: 'Ethynodiol', approvalStatus: 'FDA Approved' },
      index: new Map(),
      identity: new Map(),
      retrievedAt: '2026-09-01',
      forms,
    })
    expect(withFallback.label?.setId).toBe('ethynodiol-diacetate-alone')
    expect(withFallback.matchedForm).toEqual({
      form: 'diacetate',
      labelKey: 'ethynodiol diacetate',
      printedName: 'ETHYNODIOL DIACETATE',
    })
    // Whatever the parser read, every source it recorded names the form the label was published under.
    expect(withFallback.background).not.toBeNull()
    expect(JSON.stringify(withFallback.background)).toContain(
      'Ethynodiol label, published as \\"ETHYNODIOL DIACETATE\\"',
    )
    expect(JSON.stringify(withFallback.background)).not.toContain('"Ethynodiol label"')

    const direct = label({ setId: 'ethynodiol-alone', genericNames: ['ETHYNODIOL'] })
    const withDirect = extractRowBackground({
      row: { slug: 'ethynodiol', name: 'Ethynodiol', approvalStatus: 'FDA Approved' },
      index: new Map([['ethynodiol', direct]]),
      identity: new Map(),
      retrievedAt: '2026-09-01',
      forms,
    })
    expect(withDirect.label?.setId).toBe('ethynodiol-alone')
    expect(withDirect.matchedForm).toBeUndefined()

    const withoutForms = extractRowBackground({
      row: { slug: 'ethynodiol', name: 'Ethynodiol', approvalStatus: 'FDA Approved' },
      index: new Map(),
      identity: new Map(),
      retrievedAt: '2026-09-01',
    })
    expect(withoutForms.label).toBeUndefined()
  })

  it('never falls back for a row without a medicine status: "Tea" the plant is not TEA salicylate', () => {
    const forms = buildForms([
      label({ setId: 'tea-salicylate', genericNames: ['TEA SALICYLATE'] }),
      ETHYNODIOL_DIACETATE,
    ])
    for (const row of [
      { slug: 'tea', name: 'Tea', approvalStatus: 'Non-FDA / Dietary Supplement' },
      { slug: 'tea', name: 'Tea' },
      { slug: 'ethynodiol', name: 'Ethynodiol', approvalStatus: 'Non-FDA / Dietary Supplement' },
    ]) {
      const extraction = extractRowBackground({
        row,
        index: new Map(),
        identity: new Map(),
        retrievedAt: '2026-09-01',
        forms,
      })
      expect(extraction.label).toBeUndefined()
      expect(extraction.matchedForm).toBeUndefined()
      expect(extraction.formResolution).toBeUndefined()
    }
    expect(SALT_FORM_FALLBACK_STATUSES.has('Non-FDA / Dietary Supplement')).toBe(false)
  })
})
