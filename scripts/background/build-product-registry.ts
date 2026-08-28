import 'dotenv/config'
import { execFileSync } from 'node:child_process'
import { createReadStream, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import { normalizeContentName } from '@/lib/background/name-normalization'

/**
 * Builds the product registry: what is actually marketed, keyed by what it contains.
 *
 * A page on this site is a product — the thing a person is handed — and a product is identified by
 * its set of active ingredients. Nothing else works as a key. One Augmentin product appears under
 * ten distinct generic-name strings, so names cannot identify it; the ingredient identifier differs
 * between labels for the same product, so those cannot either. What is stable is the set of RxNorm
 * ingredient concepts, which is why `resolve-active-moieties.ts` runs first: "clavulanate
 * potassium" and "clavulanic acid" are one ingredient, and without that step they are two products.
 *
 * This is what gives combination products an identity at all. The corpus aggregates one record per
 * active moiety, so amoxicillin with clavulanate, sulfamethoxazole with trimethoprim, carbidopa
 * with levodopa and every other combination had no page — 5,241 of 8,263 products in the archive.
 *
 * KITS ARE NOT COMBINATIONS, and the distinction is the trap in this whole exercise. An SPL dosage
 * form of KIT packs several separately-taken medicines in one carton — an H. pylori kit carries an
 * antibiotic pair and a proton-pump inhibitor as three medicines a person takes as three medicines.
 * Treating that union as one product would assert a relation between medicines that no source
 * states, and because kits pair large ingredient sets with low individual frequency they would rank
 * at the top of anything computed downstream: the mistake would present as the best result. Kits
 * are detected and excluded, and the count is reported rather than hidden.
 *
 * Usage:
 *   tsx scripts/background/build-product-registry.ts <labelIndex.ndjson>
 */

interface IndexedLabel {
  setId: string
  declaredSubstanceCount?: number
  brandNames: string[]
  genericNames: string[]
  substanceNames?: string[]
  routes: string[]
  sections: Record<string, string>
}

interface ResolvedIngredient {
  printedName: string
  rxcui?: string
  ingredientRxcui?: string
  ingredientName?: string
  state: string
}

export interface ProductIngredient {
  /** RxNorm ingredient concept. The identity this ingredient contributes to the product key. */
  ingredientRxcui: string
  ingredientName: string
  /** Every spelling labels printed for it, so the mapping is inspectable rather than asserted. */
  printedNamesAsRecorded: string[]
}

export interface RegisteredProduct {
  /** Sorted ingredient concepts joined by '+'. Stable across every naming variant of the product. */
  productKey: string
  /** Readable identity, built from the ingredient names in the same order as the key. */
  displayName: string
  ingredients: ProductIngredient[]
  /** Published labels whose ingredient set resolved to this key. */
  labelCount: number
  /** Distinct brand names across those labels, capped for size. */
  brandNames: string[]
  /** Routes those labels declare. */
  routes: string[]
  /** One representative label, so the product has a citable source. */
  representativeSetId: string
}

/** Brands kept per product. Beyond this another marketing variant adds nothing to identity. */
const MAX_BRANDS = 25

/**
 * Words that mark a carton of separately-taken medicines rather than one co-formulated product.
 * Matched against the product's own names, which is where SPL puts the dosage form when it is a kit.
 */
const KIT_MARKER = /\bkits?\b/iu

/**
 * Ingredients above this count are treated as a pack rather than a formulation.
 *
 * A genuine fixed-dose combination is small — the largest routinely marketed are the four-salt
 * amphetamine products and some antiretroviral regimens. A "product" listing dozens of actives is a
 * multivitamin, an allergenic extract or a homeopathic combination, none of which behave like a
 * combination drug and all of which would dominate anything computed from the ingredient graph.
 */
const MAX_FORMULATION_INGREDIENTS = 6

function main(): void {
  const [indexPath] = process.argv.slice(2).filter((value) => !value.startsWith('--'))
  if (!indexPath || !existsSync(indexPath)) {
    console.error('Usage: tsx scripts/background/build-product-registry.ts <labelIndex.ndjson>')
    process.exit(1)
  }
  const cachePath =
    process.env.RNAWIKI_MOIETY_CACHE ??
    '/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/rxnorm-ingredients.json'
  if (!existsSync(cachePath)) {
    console.error(
      `[products] no ingredient cache at ${cachePath}. Run resolve-active-moieties.ts first.`,
    )
    process.exit(1)
  }
  const resolved = JSON.parse(readFileSync(cachePath, 'utf8')) as Record<string, ResolvedIngredient>
  console.log(`[products] ${Object.keys(resolved).length} resolved ingredient name(s)`)

  void buildRegistry(indexPath, resolved)
}

async function buildRegistry(
  indexPath: string,
  resolved: Record<string, ResolvedIngredient>,
): Promise<void> {
  interface Accumulated {
    ingredients: Map<string, { name: string; printed: Set<string> }>
    labelCount: number
    brands: Set<string>
    routes: Set<string>
    representativeSetId: string
  }
  const products = new Map<string, Accumulated>()
  const stats = {
    labelsRead: 0,
    skippedNoIngredients: 0,
    skippedUnresolvedIngredient: 0,
    skippedAsKit: 0,
    skippedTooManyIngredients: 0,
    accepted: 0,
  }

  const reader = createInterface({
    input: createReadStream(indexPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })

  for await (const line of reader) {
    if (!line.trim()) continue
    const label = JSON.parse(line) as IndexedLabel
    stats.labelsRead += 1

    const printed = (label.substanceNames?.length ? label.substanceNames : label.genericNames) ?? []
    if (printed.length === 0) {
      stats.skippedNoIngredients += 1
      continue
    }

    // A carton of separately-taken medicines is not a product, and calling it one would state a
    // relation between medicines that no source makes.
    const allNames = [...label.brandNames, ...label.genericNames].join(' ')
    if (KIT_MARKER.test(allNames)) {
      stats.skippedAsKit += 1
      continue
    }

    // Every ingredient must resolve, because a product identified by only the ingredients that
    // happened to resolve is a different product from the one on the label.
    const ingredients = new Map<string, { name: string; printed: Set<string> }>()
    let unresolved = false
    for (const name of printed) {
      const trimmed = name.trim()
      if (normalizeContentName(trimmed).length < 3) continue
      const entry = resolved[trimmed]
      if (!entry?.ingredientRxcui) {
        unresolved = true
        break
      }
      const existing = ingredients.get(entry.ingredientRxcui) ?? {
        name: entry.ingredientName ?? trimmed.toLowerCase(),
        printed: new Set<string>(),
      }
      existing.printed.add(trimmed)
      ingredients.set(entry.ingredientRxcui, existing)
    }
    if (unresolved || ingredients.size === 0) {
      stats.skippedUnresolvedIngredient += 1
      continue
    }
    if (ingredients.size > MAX_FORMULATION_INGREDIENTS) {
      stats.skippedTooManyIngredients += 1
      continue
    }

    const productKey = [...ingredients.keys()].sort().join('+')
    const accumulated = products.get(productKey) ?? {
      ingredients: new Map(),
      labelCount: 0,
      brands: new Set<string>(),
      routes: new Set<string>(),
      representativeSetId: label.setId,
    }
    for (const [rxcui, value] of ingredients) {
      const merged = accumulated.ingredients.get(rxcui) ?? {
        name: value.name,
        printed: new Set<string>(),
      }
      for (const spelling of value.printed) merged.printed.add(spelling)
      accumulated.ingredients.set(rxcui, merged)
    }
    accumulated.labelCount += 1
    for (const brand of label.brandNames) {
      if (accumulated.brands.size < MAX_BRANDS) accumulated.brands.add(brand.trim())
    }
    for (const route of label.routes) accumulated.routes.add(route.toLowerCase())
    products.set(productKey, accumulated)
    stats.accepted += 1
  }

  const registry: Record<string, RegisteredProduct> = {}
  for (const [productKey, entry] of products) {
    const ingredients: ProductIngredient[] = [...entry.ingredients.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([ingredientRxcui, value]) => ({
        ingredientRxcui,
        ingredientName: value.name,
        printedNamesAsRecorded: [...value.printed].sort(),
      }))
    registry[productKey] = {
      productKey,
      // The key is ordered by concept id so it is stable; the display name is ordered by name so it
      // reads the way labels write it — "amoxicillin and clavulanate", not the reverse.
      displayName: [...ingredients]
        .sort((left, right) => left.ingredientName.localeCompare(right.ingredientName))
        .map((ingredient) => ingredient.ingredientName)
        .join(' and '),
      ingredients,
      labelCount: entry.labelCount,
      brandNames: [...entry.brands].sort(),
      routes: [...entry.routes].sort(),
      representativeSetId: entry.representativeSetId,
    }
  }

  const combinations = Object.values(registry).filter(
    (product) => product.ingredients.length > 1,
  ).length
  const outPath = join(
    process.cwd(),
    'scripts',
    'seed-data',
    'background',
    'product-registry.generated.ts',
  )
  writeFileSync(outPath, serialize(registry))
  execFileSync('npx', ['prettier', '--write', outPath], { stdio: 'ignore' })

  console.log(`[products] ${JSON.stringify(stats)}`)
  console.log(
    `[products] ${Object.keys(registry).length} product(s) · ${combinations} with more than one ingredient`,
  )
  console.log(`[products] wrote ${outPath}`)
}

function serialize(registry: Record<string, RegisteredProduct>): string {
  const entries = Object.keys(registry)
    .sort()
    .map(
      (key) =>
        `  ${JSON.stringify(key)}: ${JSON.stringify(registry[key], null, 2).replace(/\n/gu, '\n  ')},`,
    )
    .join('\n')
  return `// Generated by scripts/background/build-product-registry.ts — do not edit by hand.
//
// What is marketed, keyed by what it contains. A product key is its sorted set of RxNorm ingredient
// concepts, which is the only identity stable across the naming variants one product is published
// under. Kits — cartons of separately-taken medicines — are excluded, because their ingredient
// union is not a formulation and treating it as one would assert a relation no source states.

export interface ProductIngredient {
  ingredientRxcui: string
  ingredientName: string
  printedNamesAsRecorded: string[]
}

export interface RegisteredProduct {
  productKey: string
  displayName: string
  ingredients: ProductIngredient[]
  labelCount: number
  brandNames: string[]
  routes: string[]
  representativeSetId: string
}

export const PRODUCT_REGISTRY: Record<string, RegisteredProduct> = {
${entries}
}
`
}

main()
