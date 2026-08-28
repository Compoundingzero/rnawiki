import 'dotenv/config'
import { createReadStream, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import { normalizeContentName, normalizeIdentityName } from '@/lib/background/name-normalization'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type { MedicineRecordedBackground, RecordedCostEntry } from '@/lib/background/types'
import { SUBSTANCE_REGISTRY } from '../seed-data/background/registries'

/**
 * Records what pharmacies pay to acquire a medicine, from the CMS NADAC file.
 *
 * `costContext` has been part of the record model since the beginning and no source ever filled it:
 * zero of 7,913 records carried a price. Cost is one of the first things a reader wants and one of
 * the hardest to state honestly, because most published prices are list prices nobody pays.
 *
 * NADAC is different, and it is why this is recordable at all. CMS surveys what retail pharmacies
 * actually pay to buy a drug product and publishes the average weekly, in the public domain. It is
 * an observed acquisition cost, not a list price, not an insurance price and not what anyone pays at
 * a counter — and the record says so in `whoPaysAsRecorded` rather than leaving a reader to assume.
 *
 * Two things this deliberately does NOT do:
 * - It does not compute a monthly cost. That needs a dose, and choosing a dose is a medical
 *   judgement this pipeline must never make. `normalizedMonthlyUsd` stays absent.
 * - It does not mix pricing units. NADAC prices per each, per millilitre and per gram, and averaging
 *   across them would produce a number that means nothing. One entry per unit.
 *
 * The excerpt is the pricing file's own rows, verbatim, for the two products that set the range —
 * so a reader sees exactly which products the low and high belong to, and can find them in the same
 * public file.
 *
 * Usage:
 *   tsx scripts/background/build-acquisition-cost.ts <nadac.csv>
 *
 * The file is one public-domain CSV download, published weekly at
 * https://data.medicaid.gov (licence: https://www.usa.gov/government-works). There is no API to
 * rate-limit and no key to obtain.
 */

interface PricedProduct {
  description: string
  ndc: string
  perUnit: number
  pricingUnit: string
  asOf: string
  /** The file's own row, kept verbatim so the recorded amount can be quoted from its source. */
  row: string
}

interface Bucket {
  low: PricedProduct
  high: PricedProduct
  productCount: number
}

const UNIT_LABELS: Readonly<Record<string, string>> = {
  EA: 'one unit as the pricing file counts it — a tablet, capsule, patch or single item',
  ML: 'one millilitre',
  GM: 'one gram',
}

/** Parses one CSV line, honouring the quoting the file actually uses. */
function splitCsv(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]!
    if (quoted) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"'
          index += 1
        } else quoted = false
      } else current += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      fields.push(current)
      current = ''
    } else current += char
  }
  fields.push(current)
  return fields
}

/**
 * The substance a priced product is named after.
 *
 * NADAC describes a product as "AMOXICILLIN 500 MG CAPSULE" — the substance, then a strength, then a
 * form. Everything from the first token containing a digit onward is dropped, because a strength is
 * not part of a substance's name. A description that starts with a digit ("12HR NASAL DECONGEST ER
 * 120 MG") yields nothing and is skipped rather than guessed at.
 */
function substanceNameOf(description: string): string | null {
  const words: string[] = []
  for (const word of description.trim().split(/\s+/u)) {
    if (/\d/u.test(word)) break
    words.push(word)
  }
  const name = words.join(' ').trim()
  return name.length >= 3 ? name : null
}

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

/** "08/26/2026" as the file writes it, to the ISO date the engine requires. */
function isoDate(american: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/u.exec(american.trim())
  return match ? `${match[3]}-${match[1]}-${match[2]}` : null
}

async function main() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error('usage: tsx scripts/background/build-acquisition-cost.ts <nadac.csv>')
    process.exit(1)
  }

  const rows = medicineRows()
  // Only names some corpus row asks for are kept. Registry spellings are indexed too, so a row filed
  // under a base name still reaches products the file spells with a salt.
  const wanted = new Map<string, string>()
  for (const row of rows) {
    for (const key of [normalizeContentName(row.name), normalizeIdentityName(row.name)]) {
      if (key.length >= 3 && !wanted.has(key)) wanted.set(key, row.slug)
    }
  }
  for (const substance of Object.values(SUBSTANCE_REGISTRY)) {
    for (const name of [substance.ingredientName, ...substance.printedNamesAsRecorded]) {
      const key = normalizeContentName(name)
      if (key.length >= 3 && wanted.has(key)) continue
    }
  }
  console.log(`[nadac] ${rows.length} medicine row(s) · ${wanted.size} name key(s) sought`)

  // Two passes. The file carries a weekly snapshot for the whole year and mixing weeks would state a
  // range that never existed on any one day, so the first pass finds the most recent as-of date and
  // the second reads only that week.
  let latest = ''
  let read = 0
  const scan = createInterface({
    input: createReadStream(csvPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  let header = true
  for await (const line of scan) {
    if (header) {
      header = false
      continue
    }
    if (!line.trim()) continue
    read += 1
    const fields = splitCsv(line)
    const iso = isoDate(fields[11] ?? '')
    if (iso && iso > latest) latest = iso
  }
  if (!latest) {
    console.error('[nadac] no usable as-of date found')
    process.exit(1)
  }
  console.log(`[nadac] ${read} priced row(s) · most recent as-of date ${latest}`)

  const buckets = new Map<string, Bucket>()
  const stats = { inWeek: 0, noSubstanceName: 0, noMedicineRow: 0, matched: 0 }
  const second = createInterface({
    input: createReadStream(csvPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  header = true
  for await (const line of second) {
    if (header) {
      header = false
      continue
    }
    if (!line.trim()) continue
    const fields = splitCsv(line)
    if (isoDate(fields[11] ?? '') !== latest) continue
    stats.inWeek += 1

    const description = (fields[0] ?? '').trim()
    const perUnit = Number(fields[2])
    const pricingUnit = (fields[4] ?? '').trim()
    if (!Number.isFinite(perUnit) || perUnit <= 0 || !UNIT_LABELS[pricingUnit]) continue

    const substanceName = substanceNameOf(description)
    if (!substanceName) {
      stats.noSubstanceName += 1
      continue
    }
    const slug =
      wanted.get(normalizeContentName(substanceName)) ??
      wanted.get(normalizeIdentityName(substanceName))
    if (!slug) {
      stats.noMedicineRow += 1
      continue
    }
    stats.matched += 1

    const product: PricedProduct = {
      description,
      ndc: (fields[1] ?? '').trim(),
      perUnit,
      pricingUnit,
      asOf: latest,
      row: line.trim(),
    }
    const key = `${slug} ${pricingUnit}`
    const bucket = buckets.get(key)
    if (!bucket) {
      buckets.set(key, { low: product, high: product, productCount: 1 })
      continue
    }
    bucket.productCount += 1
    if (product.perUnit < bucket.low.perUnit) bucket.low = product
    if (product.perUnit > bucket.high.perUnit) bucket.high = product
  }

  const retrievedAt = new Date().toISOString().slice(0, 10)
  const bySlug = new Map<string, RecordedCostEntry[]>()
  for (const [key, bucket] of buckets) {
    const [slug, pricingUnit] = key.split(' ') as [string, string]
    // One price, which is not the same as one product: four products priced identically have no
    // range to show, and "$0.37295 to $0.37295" is a range only in the sense that a point is a line.
    const single = bucket.low.perUnit === bucket.high.perUnit
    // The excerpt is the pricing file's own rows for the products that set the range, verbatim. A
    // composed sentence would not be a quotation, and a price with no quotable source is exactly the
    // kind of number this dataset refuses to publish.
    const excerpt = single ? bucket.low.row : `${bucket.low.row}\n${bucket.high.row}`
    const entry: RecordedCostEntry = {
      jurisdiction: 'US',
      currency: 'USD',
      priceType: 'NADAC_UNIT',
      amountLow: bucket.low.perUnit,
      ...(single ? {} : { amountHigh: bucket.high.perUnit }),
      per:
        bucket.productCount === 1
          ? `${UNIT_LABELS[pricingUnit]}, for the one priced product`
          : `${UNIT_LABELS[pricingUnit]}, across ${bucket.productCount.toLocaleString('en-US')} priced products whose strengths and pack forms differ`,
      asOf: bucket.low.asOf,
      whoPaysAsRecorded:
        'retail pharmacies buying the product, as surveyed by the Centers for Medicare & Medicaid Services. It is not a list price, an insurance price, or what anyone pays at a counter.',
      source: {
        kind: 'NADAC',
        identifier: latest,
        label: 'National Average Drug Acquisition Cost, weekly file',
        retrievedAt,
        excerpt: excerpt.slice(0, 400),
      },
    }
    const held = bySlug.get(slug)
    if (held) held.push(entry)
    else bySlug.set(slug, [entry])
  }

  const dataset: Record<string, MedicineRecordedBackground> = {}
  let engineRejected = 0
  for (const [slug, entries] of bySlug) {
    // Stable order so a rebuild produces the same file: cheapest unit type first, then by amount.
    entries.sort(
      (left, right) => left.amountLow - right.amountLow || left.per.localeCompare(right.per),
    )
    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      provenanceTier: 'extracted',
      costContext: entries,
    }
    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      engineRejected += 1
      if (engineRejected <= 3) {
        console.error(
          `[nadac] rejected ${slug}: ${report.findings.map((finding) => `${finding.code} at ${finding.path}`).join(', ')}`,
        )
      }
      continue
    }
    dataset[slug] = background
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'acquisition-cost.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[nadac] ${JSON.stringify({ ...stats, buckets: buckets.size, engineRejected })}`)
  console.log(`[nadac] wrote ${Object.keys(dataset).length} record(s) to ${outPath}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
