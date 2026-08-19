import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { CACHE_FILES } from './paths'

/**
 * The NIH Dietary Supplement Label Database is the only authoritative, public list of what is
 * actually sold as a supplement in the United States. Without it the corpus would be all drugs and
 * no supplements, and half the reference product — its natural-alternatives section — would have
 * nothing to point at.
 */

/** Categories that name a real substance. The rest are excipients, colours and marketing blends. */
const SUBSTANCE_CATEGORIES = new Set([
  'botanical',
  'vitamin',
  'mineral',
  'amino acid',
  'fatty acid',
  'enzyme',
  'bacteria',
  'hormone',
  'protein',
  'fiber',
  'non-nutrient/non-botanical',
  'animal part or source',
])

export interface SupplementIngredient {
  group: string
  category: string
  /** How many labels list it — a real popularity signal, used for ordering. */
  labelCount: number
  names: Array<[string, number]>
  brands: Array<[string, number]>
}

interface DsldHit {
  _source?: {
    brandName?: string
    allIngredients?: Array<{ ingredientGroup?: string; name?: string; category?: string }>
  }
}

const API_BASE = 'https://api.ods.od.nih.gov/dsld/v9/search-filter'

/**
 * The API's paging window caps at 10,000 records, so one unfiltered scan cannot see the whole
 * database. Querying by term and unioning the results reaches past that ceiling. The term list is
 * deliberately broad: every two-letter vowel pair plus the supplement vocabulary the vowel pairs
 * miss.
 */
function buildTerms(): string[] {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const vowels = 'aeiou'.split('')
  const pairs = letters.flatMap((a) => vowels.map((b) => a + b))
  return [
    ...pairs,
    'nicotinamide', 'riboside', 'nmn', 'nad', 'creatine', 'peptide', 'collagen', 'probiotic',
    'mushroom', 'extract', 'oil', 'root', 'leaf', 'berry', 'seed', 'bark', 'powder', 'amino',
    'enzyme', 'omega', 'curcumin', 'resveratrol', 'quercetin', 'spermidine', 'urolithin',
    'astaxanthin', 'fisetin', 'ashwagandha', 'rhodiola', 'bacopa', 'ginseng', 'turkesterone',
    'ecdysterone', 'tongkat', 'fadogia', 'betaine', 'taurine', 'glycine', 'citrulline', 'carnitine',
    'carnosine', 'theanine', 'tyrosine', 'berberine', 'policosanol', 'bergamot', 'monacolin',
    'cordyceps', 'reishi', 'chaga', 'lutein', 'zeaxanthin', 'melatonin', 'inositol', 'choline',
  ]
}

async function fetchPage(term: string, from: number): Promise<DsldHit[]> {
  const url = `${API_BASE}?size=1000&from=${from}&q=${encodeURIComponent(term)}`
  const response = await fetch(url, { signal: AbortSignal.timeout(90_000) })
  if (!response.ok) return []
  const body = (await response.json()) as { hits?: DsldHit[] }
  return body.hits ?? []
}

/**
 * Crawls the DSLD and caches the result. The crawl takes several minutes and its answer changes
 * only when NIH republishes, so a cached file is used unless `force` is set.
 */
export async function loadSupplementIngredients(
  options: { force?: boolean; minLabels?: number } = {},
): Promise<Map<string, SupplementIngredient>> {
  const minLabels = options.minLabels ?? 2

  if (!options.force && existsSync(CACHE_FILES.dsldIngredients)) {
    const cached = JSON.parse(readFileSync(CACHE_FILES.dsldIngredients, 'utf8')) as Record<
      string,
      { category: string; labels: number; names: Array<[string, number]>; brands: Array<[string, number]> }
    >
    const map = new Map<string, SupplementIngredient>()
    for (const [group, value] of Object.entries(cached)) {
      if (value.labels < minLabels) continue
      map.set(group, {
        group,
        category: value.category,
        labelCount: value.labels,
        names: value.names ?? [],
        brands: value.brands ?? [],
      })
    }
    console.log(`[dsld] loaded ${map.size.toLocaleString()} ingredient groups from cache`)
    return map
  }

  const groups = new Map<string, SupplementIngredient>()
  const terms = buildTerms()

  for (const [i, term] of terms.entries()) {
    for (const from of [0, 1000, 2000]) {
      let hits: DsldHit[]
      try {
        hits = await fetchPage(term, from)
      } catch {
        break
      }
      if (hits.length === 0) break

      for (const hit of hits) {
        const source = hit._source
        if (!source) continue
        const brand = source.brandName?.trim() ?? ''

        for (const ingredient of source.allIngredients ?? []) {
          const category = ingredient.category?.trim() ?? ''
          const group = ingredient.ingredientGroup?.trim() ?? ''
          if (!group || !SUBSTANCE_CATEGORIES.has(category)) continue

          let entry = groups.get(group)
          if (!entry) {
            entry = { group, category, labelCount: 0, names: [], brands: [] }
            groups.set(group, entry)
          }
          entry.labelCount += 1
          if (ingredient.name) pushCount(entry.names, ingredient.name.trim())
          if (brand) pushCount(entry.brands, brand)
        }
      }
      if (hits.length < 1000) break
    }

    if ((i + 1) % 20 === 0) {
      console.log(`[dsld] ${i + 1}/${terms.length} terms · ${groups.size.toLocaleString()} groups`)
    }
  }

  const serialisable: Record<string, unknown> = {}
  for (const [group, entry] of groups) {
    serialisable[group] = {
      category: entry.category,
      labels: entry.labelCount,
      names: entry.names.slice(0, 5),
      brands: entry.brands.slice(0, 5),
    }
  }
  writeFileSync(CACHE_FILES.dsldIngredients, JSON.stringify(serialisable))
  console.log(`[dsld] crawled ${groups.size.toLocaleString()} ingredient groups`)

  for (const [group, entry] of groups) {
    if (entry.labelCount < minLabels) groups.delete(group)
  }
  return groups
}

function pushCount(list: Array<[string, number]>, value: string): void {
  const existing = list.find(([name]) => name === value)
  if (existing) {
    existing[1] += 1
    return
  }
  if (list.length < 40) list.push([value, 1])
}

/**
 * Substances whose supplement name and whose drug name are different words. Plain normalisation
 * cannot merge these, and left unmerged the site would carry two pages for one molecule.
 * Every pair is a documented USP/INN synonym relationship, not a guess.
 */
export const SUPPLEMENT_DRUG_ALIASES: ReadonlyArray<readonly [supplement: string, moiety: string]> = [
  ['Vitamin D', 'CHOLECALCIFEROL'],
  ['Vitamin D3', 'CHOLECALCIFEROL'],
  ['Vitamin D2', 'ERGOCALCIFEROL'],
  ['Vitamin B12', 'CYANOCOBALAMIN'],
  ['Vitamin B1', 'THIAMINE'],
  ['Vitamin B2', 'RIBOFLAVIN'],
  ['Vitamin B3', 'NIACIN'],
  ['Vitamin B5', 'PANTOTHENIC ACID'],
  ['Vitamin B6', 'PYRIDOXINE'],
  ['Vitamin B7', 'BIOTIN'],
  ['Vitamin B9', 'FOLIC ACID'],
  ['Vitamin C', 'ASCORBIC ACID'],
  ['Vitamin E', 'TOCOPHEROL'],
  ['Vitamin K', 'PHYTONADIONE'],
  ['Vitamin A', 'RETINOL'],
  ['CoQ10', 'UBIDECARENONE'],
  ['Coenzyme Q10', 'UBIDECARENONE'],
  ['Fish Oil', 'OMEGA-3 ACID ETHYL ESTERS'],
  ['Omega-3', 'OMEGA-3 ACID ETHYL ESTERS'],
  ['Folate', 'FOLIC ACID'],
  ['Glucosamine', 'GLUCOSAMINE'],
  ['Melatonin', 'MELATONIN'],
] as const
