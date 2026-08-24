import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DATA_DIR } from '../ingest/paths'

/**
 * Enrichment for plant preparations, homeopathic listings and similar records not covered by the
 * drug pipelines. GBIF supplies taxonomy; Europe PMC supplies literature counts and trial counts.
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
  /** Which literature query produced `literature`. Absent means version 1, the all-fields search. */
  litVersion?: number
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
 * DSLD and NDC names may end with a plant part. Strip it for the GBIF lookup and retain it for the
 * record because different parts can have different chemistry.
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
  // Animal-source listings use the same `binomial + part` shape.
  'feather',
  'feathers',
  'hair',
  'fur',
  'wool',
  'skin',
  'hide',
  'cartilage',
  'bone',
  'horn',
  'antler',
  'shell',
  'scale',
  'venom',
  'milk',
  'egg',
  'egg white',
  'egg yolk',
  'placenta',
  'blood',
  'serum',
  'plasma',
  'bile',
  'gland',
  'liver',
  'heart',
  'kidney',
  'spleen',
  'thymus',
  'brain',
  'muscle',
  'tissue',
  'fat',
  'silk',
  'wax',
  'honey',
  'dander',
  'epithelium',
  'whole body',
]

/**
 * Normalise title-cased corpus names to the `Genus species` form expected by GBIF and Europe PMC.
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
      // Do not publish low-confidence or unmatched taxonomy.
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

/**
 * Restrict searches to titles, abstracts and keywords. Europe PMC's default full-text search also
 * counts incidental mentions, such as a substance listed only as a reagent.
 */
function subjectQuery(term: string): string {
  return `(TITLE:"${term}" OR ABSTRACT:"${term}" OR KW:"${term}")`
}

/**
 * Increment when the literature query changes. Older literature entries are refreshed while their
 * GBIF taxonomy is retained.
 */
export const LITERATURE_QUERY_VERSION = 2

async function fetchLiterature(term: string): Promise<Literature | null> {
  const phrase = subjectQuery(term)
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

  // Trial and review counts distinguish evidence types that a total alone cannot show. The two
  // requests are independent; `warmCache` bounds overall concurrency.
  const [clinicalTrials, reviews] = await Promise.all([
    countPapers(`${phrase} AND PUB_TYPE:"Clinical Trial"`),
    countPapers(`${phrase} AND PUB_TYPE:"Review"`),
  ])
  // Suppress incomparable sub-counts if either exceeds the parent count.
  if (clinicalTrials > total || reviews > total)
    return { total, clinicalTrials: 0, reviews: 0, topPaper: top }

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

  const cached = store[key]
  const fresh = (cached?.litVersion ?? 1) >= LITERATURE_QUERY_VERSION
  if (cached && fresh) {
    return { taxonomy: cached.taxonomy ?? null, literature: cached.literature ?? null, part }
  }

  // A stale entry keeps its taxonomy: only the literature query changed.
  const taxonomy = cached
    ? (cached.taxonomy ?? null)
    : looksBinomial(binomial)
      ? await fetchTaxonomy(binomial)
      : null
  if (!cached) await sleep(120)
  // Prefer GBIF's accepted scientific name, which is how papers are commonly indexed.
  const literature = await fetchLiterature(taxonomy?.canonicalName ?? binomial)

  store[key] = {
    taxonomy,
    literature,
    fetchedAt: new Date().toISOString(),
    litVersion: LITERATURE_QUERY_VERSION,
  }
  dirty += 1
  if (dirty >= 30) flushBotanicalCache()

  return { taxonomy, literature, part }
}

/**
 * Literature lookup for a complete corpus term rather than a parsed binomial. A separate cache key
 * prevents organism and full-term searches from overwriting each other.
 */
export async function lookupLiterature(term: string): Promise<Literature | null> {
  const store = load()
  const key = `lit:${term.toLowerCase()}`
  const cached = store[key]
  if (cached && (cached.litVersion ?? 1) >= LITERATURE_QUERY_VERSION) {
    return cached.literature ?? null
  }

  const literature = await fetchLiterature(term)
  store[key] = {
    taxonomy: null,
    literature,
    fetchedAt: new Date().toISOString(),
    litVersion: LITERATURE_QUERY_VERSION,
  }
  dirty += 1
  if (dirty >= 30) flushBotanicalCache()
  return literature
}

/**
 * Warm the shared cache before the sequential enrichment loop. Concurrency is capped at ten to
 * limit sustained load on the public GBIF and Europe PMC APIs.
 */
export async function warmCache(
  jobs: ReadonlyArray<{ name: string; kind: 'organism' | 'literature' }>,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const CONCURRENCY = 10
  const store = load()

  const pending = jobs.filter((job) => {
    const key = job.kind === 'literature' ? `lit:${job.name.toLowerCase()}` : job.name.toLowerCase()
    const entry = store[key]
    return !entry || (entry.litVersion ?? 1) < LITERATURE_QUERY_VERSION
  })

  let done = 0
  let next = 0

  async function worker(): Promise<void> {
    for (;;) {
      const index = next
      next += 1
      const job = pending[index]
      if (!job) return
      if (job.kind === 'literature') await lookupLiterature(job.name)
      else await lookupBotanical(job.name)
      done += 1
      if (done % 250 === 0) onProgress?.(done, pending.length)
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))
  flushBotanicalCache()
  onProgress?.(done, pending.length)
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
