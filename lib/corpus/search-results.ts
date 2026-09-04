/**
 * One ordered result list from the two lists `/api/search` returns (docs/specs/browse.md,
 * "Internal search").
 *
 * The route answers with `results` — written medicine records, in match-quality order, each
 * carrying the tier of the corpus record behind it where one is loaded — and `corpusResults`:
 * corpus records that have no written record at all. A corpus record cannot be described in the
 * written record's shape (it has no modality, approval status or indication to put there), so it
 * is kept as its own row rather than filled in with values nobody recorded.
 *
 * Order: Tier 1 first, then Tier 2, then Tier 3. Within one tier the written records come first,
 * in the order the search returned them, and the corpus records follow in theirs. A written record
 * the corpus has not loaded is ranked as Tier 2 rather than last, because the load order of the
 * corpus says nothing about it.
 *
 * Nothing here fetches, ranks by relevance or rewrites a name: it merges two lists and labels the
 * rows.
 */
import type { SearchHit } from '@/lib/api-client'

/** A corpus record with no written record, exactly as `/api/search` returns it. */
export interface CorpusSearchResultRow {
  slug: string
  name: string
  tier: number
  model?: string
  /** Fields of this record's model that hold a recorded value. */
  presentFieldCount: number
  /** Fields of this record's model that apply to it at all. */
  applicableFieldCount?: number
  indexable?: boolean
}

export type SearchResultRow =
  | { kind: 'legacy'; slug: string; tier: number; hit: SearchHit }
  | { kind: 'corpus'; slug: string; tier: number; hit: CorpusSearchResultRow }

/** A written record whose corpus row has not loaded keeps the middle tier. */
const DEFAULT_TIER = 2

/**
 * Reader-facing tier names. The tier is a deployment grouping, not a judgement about a medicine,
 * so each label says which set of records it is rather than implying a ranking of the substance.
 */
const TIER_LABELS: Record<number, string> = {
  1: 'Longevity or withdrawn record',
  2: 'Clinical record',
  3: 'Development record',
}

export function searchResultTierLabel(tier: number): string {
  return TIER_LABELS[tier] ?? 'Record'
}

/** `4 of 8 fields recorded` — shown on a Tier 3 row so a reader sees how thin it is first. */
export function searchResultFieldCountLabel(row: SearchResultRow): string | null {
  if (row.tier !== 3) return null
  const present = row.hit.presentFieldCount
  if (typeof present !== 'number' || !Number.isFinite(present)) return null
  const applicable = row.kind === 'corpus' ? row.hit.applicableFieldCount : undefined
  return typeof applicable === 'number' && applicable > 0
    ? `${present} of ${applicable} fields recorded`
    : `${present} ${present === 1 ? 'field' : 'fields'} recorded`
}

function tierOf(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : DEFAULT_TIER
}

/**
 * Merge the two lists into the one list the dropdown renders.
 *
 * A slug that appears in both lists is kept once, as the written record: that row can say what the
 * medicine is for, and the corpus row cannot.
 */
export function mergeSearchResults(
  results: readonly SearchHit[],
  corpusResults: readonly CorpusSearchResultRow[] = [],
): SearchResultRow[] {
  const seen = new Set<string>()
  const rows: Array<{ row: SearchResultRow; kindRank: number; index: number }> = []

  for (const hit of results) {
    if (seen.has(hit.slug)) continue
    seen.add(hit.slug)
    rows.push({
      row: { kind: 'legacy', slug: hit.slug, tier: tierOf(hit.tier), hit },
      kindRank: 0,
      index: rows.length,
    })
  }
  for (const hit of corpusResults) {
    if (seen.has(hit.slug)) continue
    seen.add(hit.slug)
    rows.push({
      row: { kind: 'corpus', slug: hit.slug, tier: tierOf(hit.tier), hit },
      kindRank: 1,
      index: rows.length,
    })
  }

  return rows
    .sort(
      (left, right) =>
        left.row.tier - right.row.tier ||
        left.kindRank - right.kindRank ||
        left.index - right.index,
    )
    .map((entry) => entry.row)
}
