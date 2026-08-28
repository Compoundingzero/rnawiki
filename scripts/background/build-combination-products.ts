import 'dotenv/config'
import { execFileSync } from 'node:child_process'
import { createReadStream, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import {
  extractCommonAdverseReactions,
  extractPopulationStatements,
  extractProductVariant,
  extractSafetyStatements,
  type LabelArtifact,
} from '@/lib/background/label-extraction'
import { normalizeContentName, normalizeIdentityName } from '@/lib/background/name-normalization'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type {
  MedicineRecordedBackground,
  RecordedComposition,
  RecordedIngredient,
} from '@/lib/background/types'
import { PRODUCT_REGISTRY } from '../seed-data/background/product-registry.generated'
import { SUBSTANCE_REGISTRY } from '../seed-data/background/substance-registry.generated'

/**
 * Builds the medicine records for combination products — the pages that did not exist.
 *
 * The corpus aggregates one record per active moiety, so a product containing two moieties belonged
 * to neither of them and got no page. That is amoxicillin with clavulanate, sulfamethoxazole with
 * trimethoprim, carbidopa with levodopa, sacubitril with valsartan, buprenorphine with naloxone and
 * the amphetamine salts — medicines people are actually prescribed, absent from a medicines site.
 *
 * A page built here is honest about which of its facts come from where, which is the whole reason
 * the composition split exists:
 *
 *   PRODUCT LEVEL, from the combination's own label — its approved use, its boxed warning, its
 *   contraindications, the reactions reported for it. A combination's label warns about the
 *   combination, and that is precisely what the reader of this page is taking.
 *
 *   INGREDIENT LEVEL, from the substance registry — each ingredient's mechanism, pharmacokinetics
 *   and metabolic handling, read only from labels about that substance alone. An ingredient with no
 *   such source carries NO_SOURCE_ABOUT_THIS_SUBSTANCE_ALONE and shows as a stated gap rather than
 *   as an absence a reader has to interpret.
 *
 * Nothing is merged across those two levels and nothing is averaged between ingredients. The
 * combination is exactly as documented as its least documented ingredient, and the record says so.
 *
 * Usage:
 *   tsx scripts/background/build-combination-products.ts <labelIndex.ndjson>
 */

interface IndexedLabel {
  setId: string
  declaredSubstanceCount?: number
  effectiveTime?: string
  brandNames: string[]
  genericNames: string[]
  substanceNames?: string[]
  routes: string[]
  sections: Record<string, string>
  score: number
}

interface ResolvedIngredient {
  ingredientRxcui?: string
  ingredientName?: string
}

export interface CombinationProductRecord {
  slug: string
  name: string
  productKey: string
  /** Brand names this product is sold under, so search reaches it by any of them. */
  brandNames: string[]
  routes: string[]
  labelCount: number
  background: MedicineRecordedBackground
}

/** Products below this many published labels are too thinly evidenced to warrant a page. */
const MIN_LABELS_FOR_A_PAGE = 3

/** The slug column is varchar(128); a five-ingredient name can exceed it. */
const MAX_SLUG_LENGTH = 120

/**
 * A stable, readable slug for a product.
 *
 * A long combination is truncated at a word boundary and given a short discriminator derived from
 * its product key, so two products that truncate to the same prefix keep different URLs and each
 * one's URL never moves between runs.
 */
function slugFor(displayName: string, productKey: string): string {
  const full = normalizeIdentityName(displayName).replace(/\s+/gu, '-')
  if (full.length <= MAX_SLUG_LENGTH) return full
  let hash = 0
  for (let index = 0; index < productKey.length; index += 1) {
    hash = (hash * 31 + productKey.charCodeAt(index)) >>> 0
  }
  const suffix = `-${hash.toString(36)}`
  const room = MAX_SLUG_LENGTH - suffix.length
  const cut = full.slice(0, room)
  const atBoundary = cut.slice(0, cut.lastIndexOf('-') > 0 ? cut.lastIndexOf('-') : cut.length)
  return `${atBoundary}${suffix}`
}

function main(): void {
  const [indexPath] = process.argv.slice(2).filter((value) => !value.startsWith('--'))
  if (!indexPath || !existsSync(indexPath)) {
    console.error('Usage: tsx scripts/background/build-combination-products.ts <labelIndex.ndjson>')
    process.exit(1)
  }
  const cachePath =
    process.env.RNAWIKI_MOIETY_CACHE ??
    '/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/rxnorm-ingredients.json'
  if (!existsSync(cachePath)) {
    console.error(`[combinations] no ingredient cache at ${cachePath}.`)
    process.exit(1)
  }
  void build(
    indexPath,
    JSON.parse(readFileSync(cachePath, 'utf8')) as Record<string, ResolvedIngredient>,
  )
}

/** Slugs already used by a medicine record, so a new page can never collide with an existing one. */
function existingSlugs(): Set<string> {
  const dir = join(process.cwd(), 'data', 'drugs')
  const slugs = new Set<string>()
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.ndjson'))) {
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as { id?: string }
      if (record.id) slugs.add(record.id)
    }
  }
  return slugs
}

async function build(
  indexPath: string,
  resolved: Record<string, ResolvedIngredient>,
): Promise<void> {
  const retrievedAt = new Date().toISOString().slice(0, 10)
  const taken = existingSlugs()

  // Combination products only: a single-ingredient product already has a moiety record.
  const wanted = new Map<string, (typeof PRODUCT_REGISTRY)[string]>()
  for (const product of Object.values(PRODUCT_REGISTRY)) {
    if (product.ingredients.length < 2) continue
    if (product.labelCount < MIN_LABELS_FOR_A_PAGE) continue
    wanted.set(product.productKey, product)
  }
  console.log(`[combinations] ${wanted.size} combination product(s) above the evidence floor`)

  /** The richest label seen for each product, which is the one its page cites. */
  const best = new Map<string, IndexedLabel>()
  const reader = createInterface({
    input: createReadStream(indexPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of reader) {
    if (!line.trim()) continue
    const label = JSON.parse(line) as IndexedLabel
    const printed = (label.substanceNames?.length ? label.substanceNames : label.genericNames) ?? []
    const concepts = new Set<string>()
    let unresolved = false
    for (const name of printed) {
      if (normalizeContentName(name).length < 3) continue
      const entry = resolved[name.trim()]
      if (!entry?.ingredientRxcui) {
        unresolved = true
        break
      }
      concepts.add(entry.ingredientRxcui)
    }
    if (unresolved || concepts.size < 2) continue
    const productKey = [...concepts].sort().join('+')
    if (!wanted.has(productKey)) continue
    const held = best.get(productKey)
    if (!held || label.score > held.score) best.set(productKey, label)
  }

  const records: CombinationProductRecord[] = []
  const stats = {
    considered: wanted.size,
    noLabel: 0,
    slugCollision: 0,
    engineRejected: 0,
    written: 0,
    ingredientsWithData: 0,
    ingredientsWithoutData: 0,
  }

  for (const [productKey, product] of wanted) {
    const label = best.get(productKey)
    if (!label) {
      stats.noLabel += 1
      continue
    }
    const slug = slugFor(product.displayName, productKey)
    if (taken.has(slug)) {
      stats.slugCollision += 1
      continue
    }

    const artifact: LabelArtifact = {
      setId: label.setId,
      // The product's own label describes the product, so product-level extraction is not gated on
      // substance count here — that gate exists to stop a substance claim being read from a
      // document about several substances, and none of these are substance claims.
      declaredSubstanceCount: 1,
      effectiveTime: label.effectiveTime,
      brandNames: label.brandNames,
      genericNames: label.genericNames,
      routes: label.routes,
      sections: label.sections,
    }
    const options = { retrievedAt, sourceLabel: `${product.displayName} label` }

    const ingredients: RecordedIngredient[] = product.ingredients.map((entry) => {
      const substance = SUBSTANCE_REGISTRY[entry.ingredientRxcui]
      const hasData = Boolean(
        substance?.mechanism ??
        substance?.pharmacokinetics ??
        substance?.molecularIdentity ??
        substance?.interactionSignals?.length,
      )
      if (hasData) stats.ingredientsWithData += 1
      else stats.ingredientsWithoutData += 1
      return {
        nameAsRecorded: entry.printedNamesAsRecorded[0] ?? entry.ingredientName,
        substanceKey: entry.ingredientRxcui,
        ...(substance?.unii ? { unii: substance.unii } : {}),
        substanceDataState: hasData ? 'RECORDED' : 'NO_SOURCE_ABOUT_THIS_SUBSTANCE_ALONE',
        ...(substance?.mechanism ? { mechanism: substance.mechanism } : {}),
        ...(substance?.pharmacokinetics ? { pharmacokinetics: substance.pharmacokinetics } : {}),
        ...(substance?.molecularIdentity ? { molecularIdentity: substance.molecularIdentity } : {}),
        ...(substance?.interactionSignals?.length
          ? { interactionSignals: substance.interactionSignals }
          : {}),
      }
    })

    const composition: RecordedComposition = {
      ingredients,
      declaredIngredientCount: ingredients.length,
      ingredientsWithoutSubstanceData: ingredients.filter(
        (ingredient) => ingredient.substanceDataState === 'NO_SOURCE_ABOUT_THIS_SUBSTANCE_ALONE',
      ).length,
    }

    const productVariant = extractProductVariant(artifact, options)
    const safety = extractSafetyStatements(artifact, options)
    const populationStatements = extractPopulationStatements(artifact, options)
    const commonAdverseReactions = extractCommonAdverseReactions(artifact, options)

    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      provenanceTier: 'extracted',
      // The composition is what this record is; the product-level modules describe it.
      composition,
      ...(productVariant ? { productVariants: [productVariant] } : {}),
      ...(safety ? { safety } : {}),
      ...(populationStatements.length > 0 ? { populationStatements } : {}),
      ...(commonAdverseReactions ? { commonAdverseReactions } : {}),
    }

    // Nothing reaches the dataset without passing the same engine every other record passes.
    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      stats.engineRejected += 1
      continue
    }

    taken.add(slug)
    records.push({
      slug,
      name: product.displayName,
      productKey,
      brandNames: product.brandNames,
      routes: product.routes,
      labelCount: product.labelCount,
      background,
    })
    stats.written += 1
  }

  records.sort((left, right) => left.slug.localeCompare(right.slug))
  const outPath = join(
    process.cwd(),
    'scripts',
    'seed-data',
    'background',
    'combination-products.generated.ts',
  )
  writeFileSync(outPath, serialize(records))
  execFileSync('npx', ['prettier', '--write', outPath], { stdio: 'ignore' })

  console.log(`[combinations] ${JSON.stringify(stats)}`)
  console.log(`[combinations] wrote ${records.length} product record(s) to ${outPath}`)
}

function serialize(records: CombinationProductRecord[]): string {
  const entries = records
    .map((record) => `  ${JSON.stringify(record, null, 2).replace(/\n/gu, '\n  ')},`)
    .join('\n')
  return `// Generated by scripts/background/build-combination-products.ts — do not edit by hand.
//
// Medicine records for products with more than one active ingredient, which the moiety-keyed corpus
// had no page for. Product-level facts come from the combination's own label, because a
// combination's label warns about the combination. Each ingredient's mechanism and pharmacokinetics
// come from the substance registry, read only from labels about that substance alone; an ingredient
// with no such source says so rather than leaving a gap a reader has to interpret.

import type { MedicineRecordedBackground } from '@/lib/background/types'

export interface CombinationProductRecord {
  slug: string
  name: string
  productKey: string
  brandNames: string[]
  routes: string[]
  labelCount: number
  background: MedicineRecordedBackground
}

export const COMBINATION_PRODUCTS: CombinationProductRecord[] = [
${entries}
]
`
}

main()
