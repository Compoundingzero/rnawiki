import { describe, expect, it } from 'vitest'

import { PRODUCT_REGISTRY } from '@/scripts/seed-data/background/product-registry.generated'
import { SUBSTANCE_REGISTRY } from '@/scripts/seed-data/background/substance-registry.generated'

/**
 * A page is a product, and a product is identified by what it contains. These tests pin the two
 * properties that make that identity trustworthy: one product has one key however its labels spell
 * its ingredients, and a carton of separately-taken medicines is never treated as a formulation.
 */

const BY_BRAND = new Map<string, string>()
for (const [key, product] of Object.entries(PRODUCT_REGISTRY)) {
  for (const brand of product.brandNames) {
    const lower = brand.toLowerCase()
    if (!BY_BRAND.has(lower)) BY_BRAND.set(lower, key)
  }
}

describe('product identity', () => {
  it('gives each well-known combination exactly one identity', () => {
    // Every one of these had no page at all before, because the corpus aggregated by moiety.
    const expected: ReadonlyArray<readonly [string, readonly string[]]> = [
      ['augmentin', ['amoxicillin', 'clavulanate']],
      ['bactrim', ['sulfamethoxazole', 'trimethoprim']],
      ['sinemet', ['carbidopa', 'levodopa']],
      ['entresto', ['sacubitril', 'valsartan']],
      ['suboxone', ['buprenorphine', 'naloxone']],
      ['zosyn', ['piperacillin', 'tazobactam']],
    ]
    for (const [brand, ingredients] of expected) {
      const key = BY_BRAND.get(brand)
      expect(key, brand).toBeDefined()
      const product = PRODUCT_REGISTRY[key!]!
      const names = product.ingredients.map((entry) => entry.ingredientName).sort()
      expect(names, brand).toEqual([...ingredients].sort())
    }
  })

  it('collapses every label of one product into one key', () => {
    // The case that forced the RxNorm step. Keyed on locally normalised names, Augmentin split into
    // two products — "amoxicillin + clavulanate" and "amoxicillin + clavulanic acid" — because its
    // second ingredient is printed both ways. Resolving each printed name to its RxNorm ingredient
    // concept first is what makes the many published labels one product.
    const key = BY_BRAND.get('augmentin')!
    const product = PRODUCT_REGISTRY[key]!
    expect(product.labelCount).toBeGreaterThan(50)
    expect(product.ingredients).toHaveLength(2)
    // Every ingredient carries the concept the key is built from, and at least one printed spelling
    // so the mapping can be checked against a label rather than taken on trust.
    for (const ingredient of product.ingredients) {
      expect(ingredient.ingredientRxcui).toMatch(/^\d+$/u)
      expect(ingredient.printedNamesAsRecorded.length).toBeGreaterThan(0)
    }
  })

  it('separates products that differ by one ingredient', () => {
    // Adderall carries two moieties across four salts; a single-amphetamine product is not it.
    const adderall = PRODUCT_REGISTRY[BY_BRAND.get('adderall')!]
    expect(adderall).toBeDefined()
    expect(adderall!.ingredients.map((entry) => entry.ingredientName).sort()).toEqual([
      'amphetamine',
      'dextroamphetamine',
    ])
  })

  it('keys every product on its sorted ingredient concepts', () => {
    for (const [key, product] of Object.entries(PRODUCT_REGISTRY)) {
      const rebuilt = product.ingredients
        .map((entry) => entry.ingredientRxcui)
        .sort()
        .join('+')
      expect(rebuilt, product.displayName).toBe(key)
    }
  })

  it('never registers a product with no ingredients or a duplicated one', () => {
    for (const [key, product] of Object.entries(PRODUCT_REGISTRY)) {
      expect(product.ingredients.length, key).toBeGreaterThan(0)
      const concepts = product.ingredients.map((entry) => entry.ingredientRxcui)
      expect(new Set(concepts).size, key).toBe(concepts.length)
    }
  })

  it('holds the combination products the corpus previously had no page for', () => {
    const combinations = Object.values(PRODUCT_REGISTRY).filter(
      (product) => product.ingredients.length > 1,
    )
    expect(combinations.length).toBeGreaterThan(1000)
  })
})

describe('substance registry', () => {
  it('records ingredients rather than products, keyed by concept', () => {
    for (const [key, substance] of Object.entries(SUBSTANCE_REGISTRY)) {
      expect(substance.ingredientRxcui, key).toBe(key)
      expect(substance.ingredientName.length).toBeGreaterThan(0)
      expect(substance.sourceLabelCount).toBeGreaterThan(0)
    }
  })

  it('carries substance data for the ingredients of well-known combinations', () => {
    // The point of the split: a combination page shows each ingredient's own mechanism.
    const augmentin = PRODUCT_REGISTRY[BY_BRAND.get('augmentin')!]!
    const withData = augmentin.ingredients.filter(
      (entry) => SUBSTANCE_REGISTRY[entry.ingredientRxcui],
    )
    expect(withData.length).toBeGreaterThan(0)
  })

  it('never invents a mechanism where no single-substance source exists', () => {
    // An ingredient with no entry is a gap the product page must state, not fill.
    for (const substance of Object.values(SUBSTANCE_REGISTRY)) {
      if (!substance.mechanism) continue
      expect(substance.mechanism.statements.length).toBeGreaterThan(0)
      for (const statement of substance.mechanism.statements) {
        expect(statement.source.excerpt).toBe(statement.textAsRecorded)
      }
    }
  })
})
