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
  // Animal-source listings use the same "binomial + part" shape, and the corpus has hundreds:
  // Capra Hircus Skin, Sus Scrofa Cartilage, Melopsittacus Undulatus Feather. Without these the
  // part stayed glued to the binomial and the page said the feather WAS the budgerigar.
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

/**
 * Restricted to title, abstract and keywords — deliberately, and at the cost of most of the count.
 *
 * Europe PMC's default search reads the full text of every open-access paper, so a substance named
 * once in a table of reagents counts as a paper about it. Acetophenazine came back with 5,372
 * papers and a most-cited paper about a tetrazolium assay; restricted to where a paper declares
 * its subject, it is 31 papers and the most cited is about antipsychotics. Both numbers are
 * "correct" for some question, but only one of them answers the question this site is asking, and
 * printing the other one next to an unrelated title was telling readers something false.
 */
function subjectQuery(term: string): string {
  return `(TITLE:"${term}" OR ABSTRACT:"${term}" OR KW:"${term}")`
}

/**
 * Bumped when the query changes. Cached entries below this are refetched; their taxonomy is kept,
 * because GBIF is unaffected and those lookups are the slow half.
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

  // Counting trials separately is the whole point: a substance with two thousand papers and no
  // controlled trial in humans is a different thing from one with twenty papers and four trials,
  // and the difference is invisible from a total.
  // The two sub-counts are independent of each other and of everything else in flight. They were
  // separated by fixed sleeps, which paced a caller that no longer exists: the concurrency pool in
  // warmCache is what bounds the request rate now, and sleeping inside a worker only idles it.
  const [clinicalTrials, reviews] = await Promise.all([
    countPapers(`${phrase} AND PUB_TYPE:"Clinical Trial"`),
    countPapers(`${phrase} AND PUB_TYPE:"Review"`),
  ])
  // A subset cannot exceed its parent; if the API disagrees, the totals are not comparable and
  // publishing them side by side would invite a reader to subtract them.
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
  // Search the literature under the accepted scientific name where GBIF resolved one, because that
  // is the name the papers are indexed under; otherwise under the name as written.
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
 * The literature alone, searched under the name exactly as the corpus stores it.
 *
 * `lookupBotanical` searches under the binomial it parsed out of the name, which is right for an
 * organism and wrong for a chemical: "Aluminum Zirconium Tetrachlorohydrex Gly" has no binomial to
 * find and must be searched whole. Cached under a separate key so the two searches of the same
 * string cannot overwrite each other.
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
 * Fills the cache for many names at once, a few requests in flight at a time.
 *
 * The enrichment loop is sequential because it writes rows, and every lookup inside it was a
 * round trip: ninety-eight hundred records at roughly thirty a minute is six hours, most of it
 * spent waiting. The lookups themselves have no order and no shared state, so they are done first,
 * against the same cache the loop reads, and the loop then runs at the speed of Postgres.
 *
 * Ten at a time, and no more. Both APIs are free public infrastructure funded by research budgets,
 * and this is a bulk read of several thousand records that repeats whenever the corpus is rebuilt.
 * Ten concurrent requests against a two-second response is about five a second — the load of a
 * handful of people using the site normally, sustained for half an hour. That is the ceiling this
 * is willing to take.
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
