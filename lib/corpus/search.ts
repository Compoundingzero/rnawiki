/**
 * Corpus-aware internal search (docs/specs/browse.md).
 *
 * The header's type-ahead already searches the written `drugs` records. The corpus adds two things
 * and nothing else: an ordering, so a Tier 1 record outranks Tier 2 and Tier 2 outranks Tier 3, and
 * a present-field count on a Tier 3 row, so a reader can see how thin a stub is before clicking it.
 *
 * Corpus records that have no legacy row cannot be described in the legacy hit shape — there is no
 * modality, approval status or indication to put there — so they are returned as their own list
 * rather than filled in with invented values.
 */
import { inArray, sql } from 'drizzle-orm'

import { db } from '@/db'
import { corpusPages } from '@/db/schema'

export interface CorpusSearchHit {
  slug: string
  name: string
  tier: number
  model: string
  /** Fields of this record's model with a recorded value. A Tier 3 row must show it. */
  presentFieldCount: number
  /** Fields of this record's model that apply to it at all. */
  applicableFieldCount: number
  indexable: boolean
}

export interface CorpusRecordRank {
  tier: number
  presentFieldCount: number
  applicableFieldCount: number
}

type SearchRow = {
  slug: string
  display_name: string
  tier: number
  model: string
  present_field_count: number
  applicable_field_count: number
  indexable: boolean
}

const MAX_LIMIT = 25

function likePrefix(value: string): string {
  return `${value.replace(/[\\%_]/g, (character) => `\\${character}`)}%`
}

/** Corpus records whose recorded name or synonym matches, Tier 1 first. */
export async function searchCorpusPages(query: string, limit: number): Promise<CorpusSearchHit[]> {
  const trimmed = query.trim()
  if (trimmed.length === 0) return []
  const capped = Math.max(1, Math.min(MAX_LIMIT, Math.trunc(limit)))
  const lowered = trimmed.toLowerCase()
  const prefix = likePrefix(lowered)

  const result = await db.execute<SearchRow>(sql`
    with matched as (
      select
        p.slug,
        p.display_name,
        p.tier,
        p.model::text as model,
        p.present_field_count,
        p.applicable_field_count,
        p.indexable,
        case
          when lower(p.display_name) = ${lowered} then 0
          when exists (
            select 1 from page_synonyms s where s.key = p.key and lower(s.name) = ${lowered}
          ) then 0
          when lower(p.display_name) like ${prefix} then 1
          else 2
        end as match_rank
      from corpus_pages p
      where lower(p.display_name) like ${prefix}
         or exists (
           select 1 from page_synonyms s
           where s.key = p.key
             and (lower(s.name) = ${lowered} or lower(left(s.name, 120)) like ${prefix})
         )
    )
    select slug, display_name, tier, model, present_field_count, applicable_field_count, indexable
    from matched
    order by
      case when match_rank = 0 then 0 else 1 end,
      tier,
      match_rank,
      present_field_count desc,
      length(display_name),
      lower(display_name),
      slug
    limit ${capped}
  `)

  return result.rows.map((row) => ({
    slug: row.slug,
    name: row.display_name,
    tier: Number(row.tier),
    model: row.model,
    presentFieldCount: Number(row.present_field_count),
    applicableFieldCount: Number(row.applicable_field_count),
    indexable: Boolean(row.indexable),
  }))
}

/** The tier and field counts of the corpus records behind a set of legacy slugs. */
export async function corpusRanksForSlugs(
  slugs: readonly string[],
): Promise<Map<string, CorpusRecordRank>> {
  if (slugs.length === 0) return new Map()
  const rows = await db
    .select({
      slug: corpusPages.slug,
      tier: corpusPages.tier,
      presentFieldCount: corpusPages.presentFieldCount,
      applicableFieldCount: corpusPages.applicableFieldCount,
    })
    .from(corpusPages)
    .where(inArray(corpusPages.slug, [...slugs]))
  return new Map(
    rows.map((row) => [
      row.slug,
      {
        tier: Number(row.tier),
        presentFieldCount: Number(row.presentFieldCount),
        applicableFieldCount: Number(row.applicableFieldCount),
      },
    ]),
  )
}

/**
 * Tier 1 first, then Tier 2, then Tier 3. A legacy record the corpus has not loaded keeps its place
 * beside Tier 2 rather than being pushed below the stubs: it is a written record, and the load
 * order of the corpus is not a statement about it. The sort is stable, so with no corpus rows at
 * all the existing search order is unchanged.
 */
export function rankHitsByCorpusTier<T extends { slug: string }>(
  hits: readonly T[],
  ranks: Map<string, CorpusRecordRank>,
): T[] {
  return hits
    .map((hit, index) => ({ hit, index, tier: ranks.get(hit.slug)?.tier ?? 2 }))
    .sort((left, right) => left.tier - right.tier || left.index - right.index)
    .map((entry) => entry.hit)
}
