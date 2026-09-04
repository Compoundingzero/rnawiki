// GET /api/search?q=&limit=  — the header's type-ahead.
//
// Public and unauthenticated, because search is how someone finds out whether this site has
// anything to say about the drug they were prescribed, and asking them to sign in first would put
// a wall in front of the only thing they came for.

import { z } from 'zod'
import { corpusRanksForSlugs, rankHitsByCorpusTier, searchCorpusPages } from '@/lib/corpus/search'
import { searchDrugs } from '@/lib/queries/drugs'
import { PUBLIC_API } from '@/lib/rate-limit'
import { ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Contract: `limit` defaults to 10 and is capped at 25. Beyond that this is a browse, not a search. */
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 25

/**
 * Longest query the database is asked about. A 3 kB "search term" is not a search term; it is a
 * `websearch_to_tsquery` parse cost someone found. Truncating rather than rejecting keeps a very
 * long paste working — it just searches the first 200 characters of it.
 */
const MAX_QUERY_LENGTH = 200

const querySchema = z.object({
  q: z
    .string()
    .max(MAX_QUERY_LENGTH * 20)
    .optional(),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional(),
})

export const GET = withHandler(async (req: Request) => {
  const url = new URL(req.url)
  const parsed = querySchema.parse({
    q: url.searchParams.get('q') ?? undefined,
    // An absent param is `undefined` so the schema's default applies; an empty one would coerce to
    // 0 and fail `.positive()`, which is a 422 for a request nobody meant to make.
    limit: url.searchParams.get('limit') || undefined,
  })

  const query = (parsed.q ?? '').trim().slice(0, MAX_QUERY_LENGTH)

  // Contract: an empty query returns an empty result set WITHOUT touching the database. The search
  // box fires on every keystroke, and the keystroke that clears the field would otherwise be a
  // full-text query for nothing.
  if (query.length === 0) return ok({ results: [] })

  const limited = rateLimited(PUBLIC_API, rateLimitKey(req))
  if (limited) return limited

  const limit = parsed.limit ?? DEFAULT_LIMIT
  // Corpus records rank Tier 1, then Tier 2, then Tier 3, and a Tier 3 row carries its present-field
  // count so a reader can see how thin the record is before opening it (docs/specs/browse.md).
  // Corpus records with no legacy row are returned separately: the legacy hit shape has fields
  // (modality, approval status, indication) that such a record has no recorded answer for.
  const [legacyHits, corpusHits] = await Promise.all([
    searchDrugs(query, limit),
    searchCorpusPages(query, limit),
  ])
  const ranks = await corpusRanksForSlugs(legacyHits.map((hit) => hit.slug))
  const results = rankHitsByCorpusTier(legacyHits, ranks).map((hit) => {
    const rank = ranks.get(hit.slug)
    return rank ? { ...hit, tier: rank.tier, presentFieldCount: rank.presentFieldCount } : hit
  })
  const legacySlugs = new Set(legacyHits.map((hit) => hit.slug))
  const corpusResults = corpusHits.filter((hit) => !legacySlugs.has(hit.slug))
  return ok({ results, corpusResults })
})
