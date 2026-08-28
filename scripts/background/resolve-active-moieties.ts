import 'dotenv/config'
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { dirname } from 'node:path'

import { normalizeContentName } from '@/lib/background/name-normalization'

/**
 * Resolves every active-substance name in the label archive to its RxNorm ingredient concept.
 *
 * This is the piece the product model could not be built without. A product must be identified by
 * what it actually contains, and a label spells that in whatever form the manufacturer registered:
 * one Augmentin product appears under ten distinct generic-name strings, and its second ingredient
 * is written "clavulanate potassium" on some labels and "clavulanic acid" on others. Name
 * normalization gets most of the way there and then fragments exactly where it matters — those two
 * spellings produced two different product keys for one product.
 *
 * The authoritative mapping is RxNorm's precise-ingredient to ingredient relation (PIN to IN),
 * which is what "the salt versus the moiety" means in the terminology the FDA and NLM already
 * share. RxNav publishes it over a public API with no licence gate, which matters: the full RxNorm
 * release requires a UMLS licence whose terms constrain redistributing derived name tables, and
 * this corpus is public.
 *
 * The alternative was the DailyMed SPL XML, which carries `activeMoiety` per ingredient directly.
 * It was rejected on cost: the human prescription full release alone is 16.6 GB across 54,855
 * files and the over-the-counter release is another 32.9 GB, against 27 GB of free disk, and
 * DailyMed publishes no ingredients-only extract. RxNav answers the same question in a few
 * megabytes.
 *
 * Nothing here is a medical claim. The output is a nomenclature mapping — "these two printed names
 * denote the same registered ingredient, per RxNorm concept N" — with the concept id recorded so a
 * reader can check it.
 *
 * Usage:
 *   tsx scripts/background/resolve-active-moieties.ts <labelIndex.ndjson> [--limit=N]
 */

const RXNAV = 'https://rxnav.nlm.nih.gov/REST'

/**
 * Names resolved at once. Each name costs two round trips — concept then ingredient — so this is
 * roughly twice as many requests in flight. RxNav asks for no more than twenty requests per second
 * and this stays under it: a public service worth relying on is worth not overloading.
 */
const CONCURRENCY = 6
const RETRY_LIMIT = 3

interface ResolvedIngredient {
  /** The name as the label printed it. */
  printedName: string
  /** RxNorm concept for the printed name, when one matched. */
  rxcui?: string
  /** The ingredient (IN) concept the printed name resolves to: the moiety, not the salt. */
  ingredientRxcui?: string
  ingredientName?: string
  /**
   * How the mapping was reached, so an unresolved name is distinguishable from an unattempted one
   * and from one RxNorm genuinely does not know.
   */
  state: 'RESOLVED' | 'NO_RXNORM_CONCEPT' | 'NO_INGREDIENT_RELATION' | 'LOOKUP_FAILED'
}

type Cache = Record<string, ResolvedIngredient>

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getJson(url: string): Promise<unknown | null> {
  for (let attempt = 0; attempt < RETRY_LIMIT; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      })
      if (response.status === 404) return null
      if (!response.ok) {
        // A public service under load is a reason to wait, not a reason to hammer it.
        await sleep(1000 * (attempt + 1))
        continue
      }
      return (await response.json()) as unknown
    } catch {
      await sleep(1000 * (attempt + 1))
    }
  }
  return null
}

/**
 * The RxNorm concept for a printed name.
 *
 * `search=2` is RxNav's normalized match, which already ignores word order, punctuation, English
 * inflections and salt forms — the same normalization this codebase reimplements locally for
 * content matching. Using theirs for identity means the mapping agrees with the terminology it
 * cites rather than with a local approximation of it.
 */
async function findConcept(name: string): Promise<string | null> {
  const payload = (await getJson(
    `${RXNAV}/rxcui.json?name=${encodeURIComponent(name)}&search=2`,
  )) as { idGroup?: { rxnormId?: string[] } } | null
  return payload?.idGroup?.rxnormId?.[0] ?? null
}

/** The ingredient concept a precise ingredient belongs to. */
async function findIngredient(
  rxcui: string,
): Promise<{ rxcui: string; name: string } | 'ITSELF' | null> {
  const payload = (await getJson(`${RXNAV}/rxcui/${rxcui}/related.json?tty=IN`)) as {
    relatedGroup?: {
      conceptGroup?: Array<{ conceptProperties?: Array<{ rxcui: string; name: string }> }>
    }
  } | null
  if (!payload) return null
  const concepts = (payload.relatedGroup?.conceptGroup ?? []).flatMap(
    (group) => group.conceptProperties ?? [],
  )
  const first = concepts[0]
  if (!first) return 'ITSELF'
  return { rxcui: first.rxcui, name: first.name }
}

async function resolve(name: string): Promise<ResolvedIngredient> {
  const rxcui = await findConcept(name)
  if (!rxcui) return { printedName: name, state: 'NO_RXNORM_CONCEPT' }
  const ingredient = await findIngredient(rxcui)
  if (ingredient === null) return { printedName: name, rxcui, state: 'LOOKUP_FAILED' }
  if (ingredient === 'ITSELF') {
    // A concept with no IN relation is already an ingredient, so it is its own moiety.
    return {
      printedName: name,
      rxcui,
      ingredientRxcui: rxcui,
      state: 'NO_INGREDIENT_RELATION',
    }
  }
  return {
    printedName: name,
    rxcui,
    ingredientRxcui: ingredient.rxcui,
    ingredientName: ingredient.name,
    state: 'RESOLVED',
  }
}

async function main() {
  const [indexPath] = process.argv.slice(2).filter((value) => !value.startsWith('--'))
  if (!indexPath || !existsSync(indexPath)) {
    console.error(
      'Usage: tsx scripts/background/resolve-active-moieties.ts <labelIndex.ndjson> [--limit=N]',
    )
    process.exit(1)
  }
  const limitFlag = process.argv.find((value) => value.startsWith('--limit='))
  const limit = limitFlag ? Number(limitFlag.split('=')[1]) : Infinity

  const cachePath =
    process.env.RNAWIKI_MOIETY_CACHE ??
    '/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/rxnorm-ingredients.json'
  mkdirSync(dirname(cachePath), { recursive: true })
  const cache: Cache = existsSync(cachePath)
    ? (JSON.parse(readFileSync(cachePath, 'utf8')) as Cache)
    : {}
  console.log(`[moiety] cache holds ${Object.keys(cache).length} name(s) at ${cachePath}`)

  // Every distinct printed active-substance name in the archive, with how often it appears, so the
  // most-used names are resolved first and an interrupted run still covers what matters most.
  const frequency = new Map<string, number>()
  const reader = createInterface({
    input: createReadStream(indexPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of reader) {
    if (!line.trim()) continue
    const label = JSON.parse(line) as { substanceNames?: string[]; genericNames?: string[] }
    for (const name of label.substanceNames ?? label.genericNames ?? []) {
      const trimmed = name.trim()
      if (normalizeContentName(trimmed).length < 3) continue
      frequency.set(trimmed, (frequency.get(trimmed) ?? 0) + 1)
    }
  }
  const names = [...frequency.entries()]
    .sort(([, left], [, right]) => right - left)
    .map(([name]) => name)
  const outstanding = names.filter((name) => !cache[name])
  console.log(
    `[moiety] ${names.length} distinct printed name(s) · ${outstanding.length} not yet resolved`,
  )

  const budget = Math.min(outstanding.length, limit)
  const queue = outstanding.slice(0, budget)
  let next = 0
  let done = 0
  let lastSave = Date.now()

  // A fixed pool rather than a batch barrier: names resolve at very different speeds, and waiting
  // for the slowest of every six would spend most of the run idle.
  const worker = async (): Promise<void> => {
    for (;;) {
      const index = next
      next += 1
      const name = queue[index]
      if (name === undefined) return
      cache[name] = await resolve(name)
      done += 1
      // Saved as it goes, because a lookup already paid for should never be paid for twice.
      if (Date.now() - lastSave > 20_000) {
        writeFileSync(cachePath, JSON.stringify(cache))
        lastSave = Date.now()
      }
      if (done % 250 === 0) console.log(`[moiety] ${done}/${budget} resolved`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))
  writeFileSync(cachePath, JSON.stringify(cache))

  const states = new Map<string, number>()
  for (const entry of Object.values(cache)) {
    states.set(entry.state, (states.get(entry.state) ?? 0) + 1)
  }
  console.log(`[moiety] ${JSON.stringify(Object.fromEntries(states))}`)
  console.log(`[moiety] cache written to ${cachePath}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
