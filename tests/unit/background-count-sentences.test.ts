import { describe, expect, it } from 'vitest'

import type { MedicineRecordedBackground } from '@/lib/background/types'
import { medicineBackgroundContext } from '@/lib/medicine-background-view'

/**
 * The sentences built around a count, checked at every count that changes them.
 *
 * These read as trivial and were not. A single template produced "None of them name it and no other
 * active ingredient" beside a count of one label, and "1 of them have no source describing them on
 * their own" for one ingredient. Both were shipped, and both were caught by looking at a page rather
 * than by any test, because nothing here had a test. A number substituted into a sentence is copy,
 * and copy a reader has to decode is a defect whatever the number is.
 */

const SOURCE = {
  kind: 'FDA_LABEL' as const,
  identifier: '00000000-0000-4000-8000-000000000000',
  label: 'Synthetic label',
  retrievedAt: '2026-08-29',
}

function withPresence(labelCount: number, alone: number): MedicineRecordedBackground {
  return {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-29',
    provenanceTier: 'transcribed',
    labelPresence: {
      labelCount,
      singleSubstanceLabelCount: alone,
      productTypesAsRecorded: ['HUMAN PRESCRIPTION DRUG'],
      routesAsRecorded: ['ORAL'],
      sampleLabelIds: [SOURCE.identifier],
      source: SOURCE,
    },
  }
}

function withComposition(total: number, missing: number): MedicineRecordedBackground {
  return {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-29',
    provenanceTier: 'extracted',
    composition: {
      declaredIngredientCount: total,
      ingredientsWithoutSubstanceData: missing,
      ingredients: Array.from({ length: total }, (_unused, index) => ({
        nameAsRecorded: `SUBSTANCE ${index + 1}`,
        substanceKey: `key-${index + 1}`,
        substanceDataState:
          index < missing
            ? ('NO_SOURCE_ABOUT_THIS_SUBSTANCE_ALONE' as const)
            : ('RECORDED' as const),
      })),
    },
  }
}

describe('archive presence counts read as sentences', () => {
  it('speaks of one label in the singular', () => {
    const view = medicineBackgroundContext(withPresence(1, 0))
    expect(view?.labelPresence?.labelCountLabel).toBe('1 published label names')
    expect(view?.labelPresence?.aloneLabel).toBe('That label also names other active ingredients')
  })

  it('says plainly when the one label is about this substance alone', () => {
    const view = medicineBackgroundContext(withPresence(1, 1))
    expect(view?.labelPresence?.aloneLabel).toBe('It names no other active ingredient')
    expect(view?.labelPresence?.noSoleSourceNote).toBeUndefined()
  })

  it('distinguishes none, one, some and all across many labels', () => {
    expect(medicineBackgroundContext(withPresence(12, 0))?.labelPresence?.aloneLabel).toBe(
      'Each of them also names other active ingredients',
    )
    expect(medicineBackgroundContext(withPresence(12, 1))?.labelPresence?.aloneLabel).toBe(
      'One of them names no other active ingredient',
    )
    expect(medicineBackgroundContext(withPresence(12, 5))?.labelPresence?.aloneLabel).toBe(
      '5 of them name no other active ingredient',
    )
    expect(medicineBackgroundContext(withPresence(12, 12))?.labelPresence?.aloneLabel).toBe(
      'None of them names any other active ingredient',
    )
  })

  it('explains the empty sections only when no label names the substance alone', () => {
    expect(
      medicineBackgroundContext(withPresence(9, 0))?.labelPresence?.noSoleSourceNote,
    ).toContain('no published label describes this ingredient on its own')
    expect(
      medicineBackgroundContext(withPresence(9, 2))?.labelPresence?.noSoleSourceNote,
    ).toBeUndefined()
  })

  it('never leaves a placeholder or a stray plural in the sentence', () => {
    for (const total of [1, 2, 7, 1200]) {
      for (const alone of [0, 1, Math.min(2, total), total]) {
        const view = medicineBackgroundContext(withPresence(total, alone))
        const sentence = `${view?.labelPresence?.labelCountLabel} ${view?.labelPresence?.aloneLabel}`
        expect(sentence).not.toMatch(/undefined|NaN|\{|\}/u)
        expect(sentence).not.toMatch(/\b1 published labels\b/u)
      }
    }
  })
})

describe('composition summaries read as sentences', () => {
  it('counts a single ingredient in words, not as a number', () => {
    expect(medicineBackgroundContext(withComposition(1, 0))?.composition?.summary).toBe(
      'This product has one active ingredient. Sources describe it on its own.',
    )
    expect(medicineBackgroundContext(withComposition(1, 1))?.composition?.summary).toContain(
      'No source describes it on its own',
    )
  })

  it('agrees in number when some ingredients are undocumented', () => {
    expect(medicineBackgroundContext(withComposition(3, 1))?.composition?.summary).toBe(
      'This product has 3 active ingredients. One of them has no source describing it on its own.',
    )
    expect(medicineBackgroundContext(withComposition(3, 2))?.composition?.summary).toContain(
      '2 of them have no source describing them on their own',
    )
  })

  it('says so when every ingredient is documented, and when none is', () => {
    expect(medicineBackgroundContext(withComposition(4, 0))?.composition?.summary).toContain(
      'Every one of them has sources describing it on its own',
    )
    expect(medicineBackgroundContext(withComposition(4, 4))?.composition?.summary).toContain(
      'No source describes any of them on its own',
    )
  })
})

describe('archive vocabulary reads as English', () => {
  const withListing = (categories: string[]): MedicineRecordedBackground => ({
    version: 'medicine-background/v1',
    authoredAt: '2026-08-29',
    provenanceTier: 'transcribed',
    productListing: {
      productCount: 3,
      singleIngredientProductCount: 3,
      dosageFormsAsRecorded: ['TABLET'],
      routesAsRecorded: ['ORAL'],
      marketingCategoriesAsRecorded: categories,
      pharmacologicClassesAsRecorded: [],
      sampleProductNdcs: ['00000-000'],
      source: {
        kind: 'FDA_NDC',
        identifier: '00000-000',
        label: 'Synthetic product listing',
        retrievedAt: '2026-08-29',
      },
    },
  })

  it('keeps an acronym an acronym', () => {
    // "ANDA" lowercased to "Anda" is a word nobody uses; it is the name of a kind of application.
    const view = medicineBackgroundContext(withListing(['ANDA', 'NDA', 'BLA']))
    expect(view?.productListing?.marketingCategories).toEqual(['ANDA', 'NDA', 'BLA'])
  })

  it('stops shouting a whole phrase', () => {
    const view = medicineBackgroundContext(withListing(['HUMAN PRESCRIPTION DRUG']))
    expect(view?.productListing?.marketingCategories).toEqual(['Human prescription drug'])
  })

  it('leaves a spelling the source already mixed alone', () => {
    const view = medicineBackgroundContext(withListing(['OTC Monograph Final']))
    expect(view?.productListing?.marketingCategories).toEqual(['OTC Monograph Final'])
  })
})
