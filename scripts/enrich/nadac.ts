import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DATA_DIR } from '../ingest/paths'
import { SOURCE_LABELS } from './provenance'

/**
 * Real prices, from the one public dataset that has them.
 *
 * NADAC is what pharmacies actually pay to acquire a drug, surveyed by CMS and republished weekly.
 * It is the only broad, free, citable price series in US healthcare — list prices are not published,
 * and net prices after rebates are trade secrets. It covers generics thoroughly and brands patchily,
 * which is itself worth knowing: where a page shows no price it is usually because the drug has no
 * generic and nobody publishes what it costs.
 *
 * The join runs through the NDC code, which both this dataset and the NDC directory carry, so no
 * name matching is involved and there is nothing to get subtly wrong.
 */

const NADAC_DATASET_2026 = 'b391aa55-d8f1-5894-be06-ea28d64a4186'
const PAGE_SIZE = 5000

export interface NadacPrice {
  /** 11-digit NDC, as NADAC publishes it. */
  ndc: string
  description: string
  perUnit: number
  unit: string
  effectiveDate: string
  isOtc: boolean
  /** 'G' generic, 'B' brand, per NADAC's own classification. */
  classification: string
}

interface NadacRow {
  ndc?: string
  ndc_description?: string
  nadac_per_unit?: string
  pricing_unit?: string
  effective_date?: string
  otc?: string
  classification_for_rate_setting?: string
}

const cachePath = join(DATA_DIR, 'nadac-prices.json')

/**
 * Downloads the whole year's price file once and caches it. It is ~250,000 rows; paging it on every
 * enrichment run would take twenty minutes to learn something that changes weekly.
 */
export async function loadNadac(options: { force?: boolean } = {}): Promise<Map<string, NadacPrice>> {
  if (!options.force && existsSync(cachePath)) {
    const cached = JSON.parse(readFileSync(cachePath, 'utf8')) as NadacPrice[]
    console.log(`[nadac] ${cached.length.toLocaleString()} prices from cache`)
    return new Map(cached.map((price) => [price.ndc, price]))
  }

  const prices = new Map<string, NadacPrice>()
  let offset = 0

  for (;;) {
    const url =
      // No `/0` index segment: this identifier is the distribution itself, and adding one gets a
      // "No resource found" that looks exactly like an empty dataset.
      `https://data.medicaid.gov/api/1/datastore/query/${NADAC_DATASET_2026}` +
      `?limit=${PAGE_SIZE}&offset=${offset}`
    let rows: NadacRow[]
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(120_000) })
      if (!response.ok) break
      const body = (await response.json()) as { results?: NadacRow[] }
      rows = body.results ?? []
    } catch {
      break
    }
    if (rows.length === 0) break

    for (const row of rows) {
      const ndc = row.ndc?.trim()
      const perUnit = Number.parseFloat(row.nadac_per_unit ?? '')
      if (!ndc || !Number.isFinite(perUnit)) continue

      // Several effective dates per NDC across a year. Keep the most recent, because a price from
      // eleven months ago presented without its date is worse than no price.
      const existing = prices.get(ndc)
      const effectiveDate = row.effective_date ?? ''
      if (existing && existing.effectiveDate >= effectiveDate) continue

      prices.set(ndc, {
        ndc,
        description: row.ndc_description?.trim() ?? '',
        perUnit,
        unit: row.pricing_unit?.trim() ?? 'EA',
        effectiveDate,
        isOtc: (row.otc ?? '').toUpperCase() === 'Y',
        classification: row.classification_for_rate_setting?.trim() ?? '',
      })
    }

    offset += rows.length
    if (offset % 50_000 === 0) console.log(`[nadac] ${offset.toLocaleString()} rows read`)
    if (rows.length < PAGE_SIZE) break
  }

  writeFileSync(cachePath, JSON.stringify([...prices.values()]))
  console.log(`[nadac] ${prices.size.toLocaleString()} prices cached`)
  return prices
}

/** Formats a per-unit price the way the dossier's price panel expects: short, with its basis. */
export function formatNadacPrice(price: NadacPrice): string {
  const amount =
    price.perUnit >= 1
      ? `$${price.perUnit.toFixed(2)}`
      : `$${price.perUnit.toFixed(price.perUnit < 0.01 ? 5 : 4)}`
  const unit = price.unit === 'EA' ? 'each' : `per ${price.unit.toLowerCase()}`
  return `${amount} ${unit}`
}

/**
 * A sourced note for the price panel's small print. It names the dataset and the date, because a
 * price without either is a number a reader cannot check or place in time.
 */
export function nadacNote(price: NadacPrice, ndcCount: number): string {
  const kind = price.classification === 'B' ? 'brand' : 'generic'
  const basis = ndcCount > 1 ? `median across ${ndcCount} listed products` : 'the one listed product'
  return (
    `What pharmacies pay to buy this drug, ${basis}, from the ${SOURCE_LABELS.nadac} survey ` +
    `effective ${price.effectiveDate} (${kind}). It is not what a patient is charged: US list ` +
    `prices are not published and net prices after rebates are confidential.`
  )
}
