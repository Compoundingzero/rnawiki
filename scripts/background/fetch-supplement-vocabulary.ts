import 'dotenv/config'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { isRateLimitRefusal } from '@/lib/background/dsld-rate-limit'

/**
 * Fetches the supplement label database's whole ingredient vocabulary, once.
 *
 * RNAWiki was asking this service one question per corpus row — 9,772 keyword searches, most of
 * them about names the database has never heard of. It earned HTTP 429 twice, took hours, and the
 * answer to most of those questions was "no such ingredient". Adding a lock stopped a second copy
 * running; it did not make the shape of the work right.
 *
 * The database publishes its own vocabulary. `/v9/ingredient-groups?method=by_letter` returns every
 * ingredient group whose name starts with a letter, with its category and every label spelling
 * recorded as a synonym. Twenty-seven letters, paginated, is on the order of forty requests for the
 * entire vocabulary — against 9,772 for the same information, most of it negative.
 *
 * What that buys, beyond not hammering a public service:
 *
 * - Names the database does not hold are never asked about at all. "Aflibercept-Boav" is not a
 *   supplement ingredient, and one local lookup settles that.
 * - The synonym lists are a matching dictionary RNAWiki did not have. "Asparagus" carries fifty
 *   printed spellings, so a corpus row filed under any of them reaches the right ingredient.
 * - `category` — botanical, vitamin, mineral — is a recordable fact about the ingredient.
 *
 * The `factsheets` field is deliberately NOT kept. It holds pre-built PubMed and ClinicalTrials.gov
 * search links, which are navigation rather than evidence; storing them beside recorded facts would
 * imply the database had found something it has not.
 *
 * Licence: the API declares CC0 1.0 Universal
 * (https://creativecommons.org/publicdomain/zero/1.0/) in its own documentation.
 *
 * Usage:
 *   tsx scripts/background/fetch-supplement-vocabulary.ts
 */

const DSLD = 'https://api.ods.od.nih.gov/dsld/v9/ingredient-groups'

/**
 * Pacing.
 *
 * No rate limit is documented anywhere in this service's API guide — checked, and the absence is
 * the finding. Two seconds between requests for a job that is forty requests long costs under two
 * minutes and cannot plausibly be the thing that trips a quota.
 */
const PAUSE_BETWEEN_REQUESTS_MS = 2_000
const PAGE_SIZE = 1_000
/**
 * Waiting out a refusal rather than failing through it.
 *
 * The quota this service enforces is not per-second: a refusal arrived after three requests four
 * seconds apart, while thousands of requests had gone through earlier in the day. That is the shape
 * of an hourly or daily allowance, and the only useful response to it is to wait. Six attempts with
 * a growing two-minute base rides out about forty minutes, and the run is resumable across
 * invocations anyway — every letter is written as it completes, so a run that gives up costs
 * nothing but the letters it had not reached.
 */
const RETRY_LIMIT = 6
const RATE_LIMIT_BACKOFF_MS = 120_000

/** Letters the browse endpoint accepts, plus its own bucket for names starting with a digit. */
const TERMS = [...'abcdefghijklmnopqrstuvwxyz'.split(''), 'Other']

export interface IngredientGroup {
  groupId: string
  groupName: string
  /** How the database classifies the ingredient: botanical, vitamin, mineral and so on. */
  categories: string[]
  /** Every spelling the database has seen on a label for this ingredient. */
  synonyms: string[]
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface GroupHit {
  _source?: {
    groupId?: string
    groupName?: string
    category?: (string | null)[]
    synonyms?: (string | null)[]
  }
}

async function fetchPage(term: string, from: number): Promise<{ total: number; hits: GroupHit[] }> {
  const url = `${DSLD}?term=${encodeURIComponent(term)}&method=by_letter&from=${from}&size=${PAGE_SIZE}`
  for (let attempt = 0; attempt < RETRY_LIMIT; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(60_000),
      })
      if (response.status === 429) {
        await sleep(RATE_LIMIT_BACKOFF_MS * (attempt + 1))
        continue
      }
      if (!response.ok) {
        await sleep(2_000 * (attempt + 1))
        continue
      }
      const payload = (await response.json()) as {
        total?: { value?: number }
        hits?: GroupHit[]
      }
      // The refusal is an HTTP 200 carrying an error object. Treated as a successful empty page it
      // would silently end the letter and leave a gap nobody could see.
      if (isRateLimitRefusal(payload)) {
        await sleep(RATE_LIMIT_BACKOFF_MS * (attempt + 1))
        continue
      }
      return { total: payload.total?.value ?? 0, hits: payload.hits ?? [] }
    } catch {
      await sleep(1_000 * (attempt + 1))
    }
  }
  return { total: 0, hits: [] }
}

async function main() {
  const outPath =
    process.env.RNAWIKI_DSLD_VOCABULARY ??
    '/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/dsld-vocabulary.json'
  mkdirSync(dirname(outPath), { recursive: true })

  // Resumable: a run interrupted partway keeps what it fetched, so a retry is cheap rather than a
  // second full pass over a public service.
  const groups: Record<string, IngredientGroup> = existsSync(outPath)
    ? (JSON.parse(readFileSync(outPath, 'utf8')) as Record<string, IngredientGroup>)
    : {}
  console.log(`[vocabulary] ${Object.keys(groups).length} group(s) already held`)

  let requests = 0
  for (const term of TERMS) {
    let from = 0
    for (;;) {
      const { total, hits } = await fetchPage(term, from)
      requests += 1
      if (total === 0 && hits.length === 0 && from === 0) {
        // A letter genuinely holding nothing is possible; a letter refused by the quota looks
        // identical. Reported either way rather than passed over in silence.
        console.error(`[vocabulary] ${term}: no groups returned — refused or genuinely empty`)
      }
      for (const hit of hits) {
        const source = hit._source
        if (!source?.groupId || !source.groupName) continue
        groups[source.groupId] = {
          groupId: source.groupId,
          groupName: source.groupName,
          // Categories arrive in mixed case across records ("botanical" and "Botanical" both
          // appear); lowercased once here so a match is a match.
          // A category array can contain nulls; the database records a group with an unset
          // classification that way.
          categories: [
            ...new Set(
              (source.category ?? [])
                .filter((value): value is string => typeof value === 'string')
                .map((value) => value.toLowerCase()),
            ),
          ].sort(),
          synonyms: [
            ...new Set(
              (source.synonyms ?? []).filter((value): value is string => typeof value === 'string'),
            ),
          ].sort(),
        }
      }
      console.log(`[vocabulary] ${term}: ${from + hits.length}/${total}`)
      await sleep(PAUSE_BETWEEN_REQUESTS_MS)
      from += hits.length
      if (hits.length === 0 || from >= total) break
    }
    writeFileSync(outPath, JSON.stringify(groups, null, 1))
  }

  const synonymCount = Object.values(groups).reduce(
    (total, group) => total + group.synonyms.length,
    0,
  )
  console.log(
    `[vocabulary] ${Object.keys(groups).length} ingredient group(s) · ${synonymCount} recorded spelling(s) · ${requests} request(s)`,
  )
  console.log(`[vocabulary] written to ${outPath}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
