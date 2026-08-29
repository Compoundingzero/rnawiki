import 'dotenv/config'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { normalizeContentName, normalizeIdentityName } from '@/lib/background/name-normalization'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type { MedicineRecordedBackground, RecordedProductListing } from '@/lib/background/types'

/**
 * Records what the National Drug Code directory lists for each substance in the corpus.
 *
 * The label archive carries DOCUMENTS. The NDC directory carries PRODUCTS, including every product
 * whose labelling has no prose an extractor can read — which is why it reaches rows nothing else
 * has: the pneumococcal and meningococcal capsular polysaccharide antigens, the hepatitis and
 * papillomavirus antigens, the biosimilars. Each is a declared active ingredient of a listed
 * product and appears nowhere in the prose archive.
 *
 * Two fields are worth more than the count. `marketing_category` is how FDA distinguishes an
 * approved application from an OTC monograph product from one marketed without approval at all —
 * a fact a reader has no other way to learn, and one this corpus could not previously state.
 * `pharm_class` is FDA's established pharmacologic class, which answers "what kind of drug is this"
 * for 4,500 rows that had no answer.
 *
 * THE CLASS IS GATED. The directory attaches the union of a combination's classes to the
 * combination, so a glyburide-and-metformin tablet carries both "Sulfonylurea [EPC]" and
 * "Biguanide [EPC]", and reading either off that product would file glyburide as a biguanide.
 * Classes are therefore read only from products declaring one active ingredient. It is the same
 * rule the rest of the record model runs on, applied to a field that invites the error.
 *
 * Source: `https://download.open.fda.gov/drug/ndc/drug-ndc-0001-of-0001.json.zip`, one public-domain
 * bulk file of about 27 MB, rebuilt daily. No API, nothing to rate-limit.
 *
 * Usage:
 *   tsx scripts/background/build-product-listing.ts <drug-ndc.json>
 */

interface NdcProduct {
  product_ndc?: string
  active_ingredients?: { name?: string }[]
  dosage_form?: string
  route?: string[]
  marketing_category?: string
  marketing_start_date?: string
  pharm_class?: string[]
  product_type?: string
}

interface Listing {
  productCount: number
  singleIngredientProductCount: number
  dosageForms: Set<string>
  routes: Set<string>
  marketingCategories: Set<string>
  pharmacologicClasses: Set<string>
  earliestMarketingStartDate?: string
  sampleProductNdcs: string[]
}

/** Kept per medicine: enough to check a count, not a product directory of our own. */
const MAX_SAMPLE_NDCS = 8
const MAX_LIST_VALUES = 12

interface MedicineRow {
  slug: string
  name: string
}

function medicineRows(): MedicineRow[] {
  const dir = join(process.cwd(), 'data', 'drugs')
  const rows: MedicineRow[] = []
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith('.ndjson'))
    .sort()) {
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as { id?: string; name?: string }
      if (record.id && record.name) rows.push({ slug: record.id, name: record.name })
    }
  }
  return rows
}

function empty(): Listing {
  return {
    productCount: 0,
    singleIngredientProductCount: 0,
    dosageForms: new Set(),
    routes: new Set(),
    marketingCategories: new Set(),
    pharmacologicClasses: new Set(),
    sampleProductNdcs: [],
  }
}

function main(): void {
  const ndcPath = process.argv[2]
  if (!ndcPath) {
    console.error('usage: tsx scripts/background/build-product-listing.ts <drug-ndc.json>')
    process.exit(1)
  }

  const rows = medicineRows()
  const wanted = new Map<string, string>()
  for (const row of rows) {
    for (const key of [normalizeContentName(row.name), normalizeIdentityName(row.name)]) {
      if (key.length >= 3 && !wanted.has(key)) wanted.set(key, row.slug)
    }
  }
  console.log(`[ndc] ${rows.length} medicine row(s) · ${wanted.size} name key(s) sought`)

  const payload = JSON.parse(readFileSync(ndcPath, 'utf8')) as { results: NdcProduct[] }
  const listings = new Map<string, Listing>()
  const stats = { products: payload.results.length, matchedProducts: 0 }

  for (const product of payload.results) {
    const ingredients = product.active_ingredients ?? []
    // How many distinct substances the product declares, after the same normalization the matcher
    // uses, so two spellings of one substance do not make a product look like a combination.
    const declared = new Set(
      ingredients
        .map((ingredient) => normalizeContentName(ingredient.name ?? ''))
        .filter((key) => key.length > 0),
    )
    const singleIngredient = declared.size === 1

    const matched = new Set<string>()
    for (const ingredient of ingredients) {
      const name = ingredient.name
      if (!name) continue
      const slug = wanted.get(normalizeContentName(name)) ?? wanted.get(normalizeIdentityName(name))
      if (slug) matched.add(slug)
    }
    if (matched.size > 0) stats.matchedProducts += 1

    for (const slug of matched) {
      const listing = listings.get(slug) ?? empty()
      listing.productCount += 1
      if (singleIngredient) listing.singleIngredientProductCount += 1
      if (product.dosage_form) listing.dosageForms.add(product.dosage_form)
      for (const route of product.route ?? []) listing.routes.add(route)
      if (product.marketing_category) listing.marketingCategories.add(product.marketing_category)
      // Classes only from a product about this substance alone. On a combination the directory
      // reports the union, and there is no way to tell which class belongs to which ingredient.
      if (singleIngredient) {
        for (const cls of product.pharm_class ?? []) listing.pharmacologicClasses.add(cls)
      }
      const started = product.marketing_start_date
      if (
        started &&
        (!listing.earliestMarketingStartDate || started < listing.earliestMarketingStartDate)
      ) {
        listing.earliestMarketingStartDate = started
      }
      if (product.product_ndc && listing.sampleProductNdcs.length < MAX_SAMPLE_NDCS) {
        listing.sampleProductNdcs.push(product.product_ndc)
      }
      listings.set(slug, listing)
    }
  }

  const retrievedAt = new Date().toISOString().slice(0, 10)
  const dataset: Record<string, MedicineRecordedBackground> = {}
  const written = { records: 0, withClasses: 0, engineRejected: 0, noSampleCode: 0 }

  for (const [slug, listing] of listings) {
    if (listing.sampleProductNdcs.length === 0) {
      written.noSampleCode += 1
      continue
    }
    const classes =
      listing.singleIngredientProductCount > 0
        ? [...listing.pharmacologicClasses].sort().slice(0, MAX_LIST_VALUES)
        : []
    const recorded: RecordedProductListing = {
      productCount: listing.productCount,
      singleIngredientProductCount: listing.singleIngredientProductCount,
      dosageFormsAsRecorded: [...listing.dosageForms].sort().slice(0, MAX_LIST_VALUES),
      routesAsRecorded: [...listing.routes].sort().slice(0, MAX_LIST_VALUES),
      marketingCategoriesAsRecorded: [...listing.marketingCategories]
        .sort()
        .slice(0, MAX_LIST_VALUES),
      pharmacologicClassesAsRecorded: classes,
      ...(listing.earliestMarketingStartDate
        ? { earliestMarketingStartDate: listing.earliestMarketingStartDate }
        : {}),
      sampleProductNdcs: listing.sampleProductNdcs,
      source: {
        kind: 'FDA_NDC',
        identifier: listing.sampleProductNdcs[0]!,
        label: 'National Drug Code directory listing',
        retrievedAt,
      },
    }
    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      provenanceTier: 'transcribed',
      productListing: recorded,
    }
    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      written.engineRejected += 1
      if (written.engineRejected <= 3) {
        console.error(
          `[ndc] rejected ${slug}: ${report.findings.map((finding) => `${finding.code} at ${finding.path}`).join(', ')}`,
        )
      }
      continue
    }
    if (classes.length > 0) written.withClasses += 1
    dataset[slug] = background
    written.records += 1
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'product-listing.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[ndc] ${JSON.stringify({ ...stats, ...written })}`)
  console.log(`[ndc] wrote ${written.records} record(s) to ${outPath}`)
}

main()
