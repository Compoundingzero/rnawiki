import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DATA_DIR } from '../ingest/paths'

/**
 * The records the drug pipelines cannot reach.
 *
 * Three thousand of the corpus are plant preparations and homeopathic listings — "Chenopodium Album
 * Whole", "Sanicula Europaea Top". They have no FDA application, no mechanism section, no price
 * survey and usually no trial, so every source the drug enrichment reads comes back empty and the
 * page stays a name.
 *
 * But real facts about them do exist, and they are the facts a reader actually wants: WHAT PLANT IS
 * THIS, and WHAT DOES THE LITERATURE ACTUALLY CONTAIN. GBIF answers the first from the global
 * taxonomic backbone. Europe PMC answers the second by counting, which is a more honest answer than
 * a paragraph — "thirty years of publication and no controlled trial" is a finding, and it is one
 * this site exists to record.
 */

export interface Taxonomy {
  scientificName: string
  canonicalName: string
  family?: string
  order?: string
  kingdom?: string
  rank?: string
  /** GBIF's own 0-100 confidence in the match. Below 90 is not used. */
  confidence: number
  status?: string
}

export interface Literature {
  /** Papers in Europe PMC mentioning the organism or substance. */
  total: number
  /** Of those, how many are indexed as clinical trials. */
  clinicalTrials: number
  /** Of those, how many are reviews. */
  reviews: number
  topPaper?: { title: string; doi?: string; year?: string; journal?: string }
}

interface CacheEntry {
  taxonomy: Taxonomy | null
  literature: Literature | null
  fetchedAt: string
}

const cachePath = join(DATA_DIR, 'botanical-index.json')
let cache: Record<string, CacheEntry> | null = null
let dirty = 0

function load(): Record<string, CacheEntry> {
  if (cache) return cache
  cache = existsSync(cachePath)
    ? (JSON.parse(readFileSync(cachePath, 'utf8')) as Record<string, CacheEntry>)
    : {}
  return cache
}

export function flushBotanicalCache(): void {
  if (!cache || dirty === 0) return
  const temp = `${cachePath}.tmp`
  writeFileSync(temp, JSON.stringify(cache))
  renameSync(temp, cachePath)
  dirty = 0
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * DSLD and NDC names carry the plant part on the end — "Chenopodium Album Whole", "Achyranthes
 * Japonica Root". GBIF wants the binomial, so the part is stripped before asking and kept for the
 * page, because which part of a plant was used is not a detail: the root and the leaf of the same
 * species can have entirely different chemistry.
 */
const PLANT_PARTS = [
  'whole',
  'root',
  'leaf',
  'leaves',
  'flower',
  'flowering top',
  'top',
  'tops',
  'bark',
  'seed',
  'fruit',
  'berry',
  'rhizome',
  'bulb',
  'stem',
  'twig',
  'branch',
  'herb',
  'aerial parts',
  'pollen',
  'resin',
  'gum',
  'oil',
  'juice',
  'sap',
  'peel',
  'rind',
  'husk',
  'shoot',
  'sprout',
  'needle',
  'cone',
  'petal',
  'stigma',
  'tuber',
  'corm',
  'wood',
  'heartwood',
  'stalk',
  'blossom',
  'bud',
]

/**
 * A binomial is written Genus with a capital, species without. The corpus stores everything
 * title-cased, and both APIs care: "Momordica Charantia" returns nothing from Europe PMC while
 * "Momordica charantia" returns six thousand papers, and GBIF fails to match the title-cased form
 * outright. Every lookup here was silently coming back empty for that reason alone.
 */
export function normaliseBinomial(name: string): string {
  const words = name.trim().split(/\s+/)
  return words
    .map((word, index) =>
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase(),
    )
    .join(' ')
}

export function splitPlantName(raw: string): { binomial: string; part: string } {
  const cleaned = raw.replace(/\s+/g, ' ').trim()
  const lower = cleaned.toLowerCase()
  for (const part of [...PLANT_PARTS].sort((a, b) => b.length - a.length)) {
    if (lower.endsWith(` ${part}`)) {
      return {
        binomial: normaliseBinomial(cleaned.slice(0, cleaned.length - part.length - 1).trim()),
        part,
      }
    }
  }
  return { binomial: normaliseBinomial(cleaned), part: '' }
}

/** True for a name shaped like a scientific binomial rather than a common or chemical name. */
export function looksBinomial(name: string): boolean {
  const words = name.trim().split(/\s+/)
  if (words.length < 2 || words.length > 4) return false
  if (/\d/.test(name)) return false
  return words.slice(0, 2).every((word) => /^[A-Za-z][a-z-]{2,}$/.test(word))
}

async function fetchTaxonomy(binomial: string): Promise<Taxonomy | null> {
  const url = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(binomial)}`
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20_000) })
      if (!response.ok) {
        await sleep(400 * 2 ** attempt)
        continue
      }
      const body = (await response.json()) as Partial<Taxonomy> & { matchType?: string }
      // A low-confidence or fuzzy match is a guess, and a guess about which species a supplement
      // contains is exactly the kind of thing this site must not print.
      if (!body.canonicalName || (body.confidence ?? 0) < 90) return null
      if (body.matchType === 'NONE') return null
      return {
        scientificName: body.scientificName ?? body.canonicalName,
        canonicalName: body.canonicalName,
        family: body.family,
        order: body.order,
        kingdom: body.kingdom,
        rank: body.rank,
        confidence: body.confidence ?? 0,
        status: body.status,
      }
    } catch {
      await sleep(400 * 2 ** attempt)
    }
  }
  return null
}

const EPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search'

async function countPapers(query: string): Promise<number> {
  const url = `${EPMC}?query=${encodeURIComponent(query)}&format=json&pageSize=1`
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20_000) })
    if (!response.ok) return 0
    const body = (await response.json()) as { hitCount?: number }
    return body.hitCount ?? 0
  } catch {
    return 0
  }
}

async function fetchLiterature(term: string): Promise<Literature | null> {
  const phrase = `"${term}"`
  const url = `${EPMC}?query=${encodeURIComponent(phrase)}&format=json&pageSize=1&resultType=core&sort=CITED%20desc`

  let top: Literature['topPaper']
  let total = 0
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25_000) })
    if (!response.ok) return null
    const body = (await response.json()) as {
      hitCount?: number
      resultList?: {
        result?: Array<{ title?: string; doi?: string; pubYear?: string; journalTitle?: string }>
      }
    }
    total = body.hitCount ?? 0
    const first = body.resultList?.result?.[0]
    if (first?.title) {
      top = {
        title: first.title.replace(/\s+/g, ' ').trim().replace(/\.$/, ''),
        doi: first.doi,
        year: first.pubYear,
        journal: first.journalTitle,
      }
    }
  } catch {
    return null
  }

  if (total === 0) return { total: 0, clinicalTrials: 0, reviews: 0 }

  // Counting trials separately is the whole point: a substance with two thousand papers and no
  // controlled trial in humans is a different thing from one with twenty papers and four trials,
  // and the difference is invisible from a total.
  await sleep(120)
  const clinicalTrials = await countPapers(`${phrase} AND PUB_TYPE:"Clinical Trial"`)
  await sleep(120)
  const reviews = await countPapers(`${phrase} AND PUB_TYPE:"Review"`)

  return { total, clinicalTrials, reviews, topPaper: top }
}

export interface BotanicalFacts {
  taxonomy: Taxonomy | null
  literature: Literature | null
  part: string
}

export async function lookupBotanical(name: string): Promise<BotanicalFacts> {
  const { binomial, part } = splitPlantName(name)
  const store = load()
  const key = name.toLowerCase()

  if (key in store) {
    const entry = store[key]
    return { taxonomy: entry?.taxonomy ?? null, literature: entry?.literature ?? null, part }
  }

  const taxonomy = looksBinomial(binomial) ? await fetchTaxonomy(binomial) : null
  await sleep(120)
  // Search the literature under the accepted scientific name where GBIF resolved one, because that
  // is the name the papers are indexed under; otherwise under the name as written.
  const literature = await fetchLiterature(taxonomy?.canonicalName ?? binomial)

  store[key] = { taxonomy, literature, fetchedAt: new Date().toISOString() }
  dirty += 1
  if (dirty >= 30) flushBotanicalCache()

  return { taxonomy, literature, part }
}

export function botanicalCacheStats(): { total: number; resolved: number; withPapers: number } {
  const store = load()
  const values = Object.values(store)
  return {
    total: values.length,
    resolved: values.filter((entry) => entry.taxonomy).length,
    withPapers: values.filter((entry) => (entry.literature?.total ?? 0) > 0).length,
  }
}
