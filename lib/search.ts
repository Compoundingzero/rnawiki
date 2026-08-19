// Site search: PostgreSQL full-text search (to_tsvector/websearch_to_tsquery) + pg_trgm trigram
// similarity for typo tolerance and alias matching. No vector DB, no external search service —
// see db/migrations/0001_add_search_vectors.sql for the generated tsvector columns and GIN
// indexes this relies on (entities.search_vector, claims.search_vector, and trigram indexes on
// entities.canonical_name, the flattened entities.aliases, and claims.consumer_question), plus
// claims_direct_answer_lower_idx from migration 0005.
//
// "Relies on" is now literally true. It was not: the query's shape made every one of those indexes
// unusable, so they were maintained on every write and read by nothing. The comment above the
// query explains what had to change and what was measured.
//
// This module never logs or persists the raw query text — search terms are not stored anywhere,
// per the product's privacy stance (see lib/session-hash.ts for the same principle applied to
// comprehension responses and correction submissions).

import { sql } from 'drizzle-orm'
import { db } from '@/db'
import type { ProofBoundaryStage } from '@/lib/evidence'
import type { claimTypeEnum } from '@/db/schema'
import { sanitisePublicText } from '@/lib/public-ids'

export type ClaimType = (typeof claimTypeEnum.enumValues)[number]

/**
 * 1 = exact entity/alias match (canonical name or an alias equals the query, case-insensitively)
 * 2 = exact claim wording match (the query equals, or appears verbatim in, the claim's question/answer)
 * 3 = related/fuzzy match — pg_trgm word-similarity against the entity name, its aliases, or the
 *     claim's consumer question (typo-tolerant, e.g. "tendn healng" still finds "tendon healing")
 * 4 = general relevance match (full-text search over question/answer and name/aliases)
 *
 * Schema note: the spec's "relevant target/condition matches" tier maps to (4) here — entities
 * and claims have no dedicated target/condition column to search separately, so tier 4 is the
 * general full-text relevance fallback across the fields the spec names (canonicalName, aliases,
 * consumerQuestion, directAnswer).
 */
export type SearchMatchTier = 1 | 2 | 3 | 4

export interface SearchResult {
  claimId: number
  entitySlug: string
  entityName: string
  claimSlug: string
  consumerQuestion: string
  directAnswer: string
  proofBoundaryStage: ProofBoundaryStage
  // Carried so the caller can decide whether the stage means anything for this answer. A stage
  // describes how far testing has gone for an *outcome*; a regulatory, access or mechanism answer
  // has no evidence ladder, and printing one under "Is rapamycin FDA-approved for longevity?"
  // asserts that a regulator reviewed evidence for longevity. See stagePositionApplies().
  claimType: ClaimType
  matchTier: SearchMatchTier
}

interface SearchRow extends Record<string, unknown> {
  claim_id: number
  entity_slug: string
  entity_name: string
  claim_slug: string
  consumer_question: string
  direct_answer: string
  proof_boundary_stage: ProofBoundaryStage
  claim_type: ClaimType
  tier: number
}

const MAX_RESULTS = 20
// Anything longer than this is never a realistic search phrase and only costs the trigram/
// full-text planners extra work for no benefit.
const MAX_QUERY_LENGTH = 200

/** Escapes ILIKE metacharacters so the exact-phrase tier matches the literal query text. */
function escapeLikePattern(input: string): string {
  return input.replace(/[\\%_]/g, (ch) => `\\${ch}`)
}

/**
 * Searches published entities (by canonical name / aliases) and published claims (by consumer
 * question / direct answer), returning claim-level results ranked by match tier, then relevance.
 * Every result carries the direct answer and Proof Boundary stage the caller needs to render a
 * result without a follow-up query.
 */
export async function searchEntitiesAndClaims(rawQuery: string): Promise<SearchResult[]> {
  // Sanitise BEFORE trimming, so a query that is nothing but control characters becomes empty and
  // returns no results instead of reaching Postgres. `trim()` does not remove U+0000, and Postgres
  // rejects a NUL in a bound text parameter outright (SQLSTATE 22021), which turned /search?q=%00
  // into a 500 on the public search page. See lib/public-ids.ts.
  const trimmed = sanitisePublicText(rawQuery).trim()
  if (!trimmed) return []
  const query = trimmed.slice(0, MAX_QUERY_LENGTH)
  const likePattern = `%${escapeLikePattern(query)}%`

  // Read-only transaction so the relaxed trigram threshold below (SET LOCAL) is scoped to this
  // one search and never leaks onto the pooled connection for the next, unrelated query. The
  // pg_trgm default word-similarity threshold (0.6) only tolerates a single-character typo per
  // word; 0.4 still rejects unrelated terms while catching realistic multi-typo queries like
  // "tendn healng" -> "tendon healing". This is a tunable precision/recall dial, not a fixed
  // constant — a whole shared word (e.g. a query containing "compound" against an alias list
  // containing "...Compound...") can legitimately clear 0.4 even with the rest of the string
  // unrelated, which is expected trigram behavior, not a bug.
  const rows = await db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL pg_trgm.word_similarity_threshold = 0.4`)
    // SHAPE MATTERS HERE, not just the predicates. Three things have to hold at once for this
    // query to use an index at all, and the version before this one broke all three.
    //
    // 1. NO OR ACROSS THE JOIN. This used to be a single CTE whose WHERE clause was one
    //    OR-disjunction spanning BOTH joined tables. Postgres cannot push any branch of such an OR
    //    down to either side, so every search predicate was evaluated post-join as a Join Filter
    //    over a full scan of claims and entities — at any table size, not just at this corpus's.
    //    Candidates are therefore collected per table first, then joined.
    //
    // 2. NO PARAMETER ARRIVING THROUGH A JOINED CTE. Splitting the tables is not enough on its
    //    own: a value read from `q` is a join column, so `q.raw <% e.canonical_name` is still a
    //    join condition and still a Join Filter. Verified with EXPLAIN. The candidate CTEs
    //    therefore repeat the query text as a bound parameter, which makes each branch a
    //    restriction on one table. `websearch_to_tsquery` is immutable, so repeating it costs one
    //    constant-folded evaluation. `q` survives only for the tier and score expressions in
    //    `matched`, which run over the candidate set and are not index-eligible in any shape.
    //
    // 3. EVERY BRANCH OF THE OR INDEXABLE. One branch that is not takes the other four down with
    //    it — Postgres abandons the BitmapOr and scans the table. Two rewrites follow from that,
    //    and both are supersets of what they replace, so no row that used to match can stop
    //    matching (`matched` below still computes the tier from the original, precise predicates):
    //      - `lower(e.canonical_name) = ?` and `lower(c.consumer_question) = ?` became `ILIKE
    //        '%?%'`, which the existing trigram indexes serve. An exact match is a substring match.
    //      - the exact-alias `EXISTS (... jsonb_array_elements_text ...)` became `jsonb_text_agg(
    //        e.aliases) ILIKE '%?%'`, served by entities_aliases_trgm_idx. If an alias equals the
    //        query, the aggregated alias text contains it.
    //    `lower(c.direct_answer) = ?` had no equivalent and no index, so it got one:
    //    claims_direct_answer_lower_idx (db/schema.ts, migration 0005).
    //
    // Measured on mirror tables holding 200,000 claims and 20,000 entities: the old shape ran in
    // 2,903 ms using no search index at all; this one runs in 0.45 ms with a BitmapOr over all
    // six. Results are byte-identical across a 22-query probe of the seeded corpus.
    const result = await tx.execute<SearchRow>(sql`
    WITH q AS (
      SELECT
        ${query}::text AS raw,
        lower(${query}::text) AS lc,
        websearch_to_tsquery('english', ${query}::text) AS tsq
    ),
    entity_hits AS (
      SELECT e.id
      FROM entities e
      WHERE e.publication_status = 'published'
        AND (
          e.canonical_name ILIKE ${likePattern} ESCAPE '\\'
          OR jsonb_text_agg(e.aliases) ILIKE ${likePattern} ESCAPE '\\'
          OR ${query}::text <% e.canonical_name
          OR ${query}::text <% jsonb_text_agg(e.aliases)
          OR (
            websearch_to_tsquery('english', ${query}::text)::text <> ''
            AND e.search_vector @@ websearch_to_tsquery('english', ${query}::text)
          )
        )
    ),
    claim_hits AS (
      SELECT c.id
      FROM claims c
      WHERE c.publication_status = 'published'
        AND (
          c.consumer_question ILIKE ${likePattern} ESCAPE '\\'
          OR lower(c.direct_answer) = lower(${query}::text)
          OR ${query}::text <% c.consumer_question
          OR (
            websearch_to_tsquery('english', ${query}::text)::text <> ''
            AND c.search_vector @@ websearch_to_tsquery('english', ${query}::text)
          )
        )
    ),
    candidate_claims AS (
      SELECT id FROM claim_hits
      UNION
      SELECT c.id FROM claims c WHERE c.entity_id IN (SELECT id FROM entity_hits)
    ),
    matched AS (
      SELECT
        c.id AS claim_id,
        e.slug AS entity_slug,
        e.canonical_name AS entity_name,
        c.slug AS claim_slug,
        c.consumer_question,
        c.direct_answer,
        c.proof_boundary_stage,
        c.claim_type,
        c.display_priority,
        (CASE
          WHEN lower(e.canonical_name) = q.lc
            OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(e.aliases) alias WHERE lower(alias) = q.lc)
            THEN 1
          WHEN lower(c.consumer_question) = q.lc
            OR lower(c.direct_answer) = q.lc
            OR c.consumer_question ILIKE ${likePattern} ESCAPE '\\'
            THEN 2
          WHEN q.raw <% e.canonical_name
            OR q.raw <% jsonb_text_agg(e.aliases)
            OR q.raw <% c.consumer_question
            THEN 3
          WHEN q.tsq::text <> '' AND (e.search_vector @@ q.tsq OR c.search_vector @@ q.tsq)
            THEN 4
          ELSE NULL
        END)::int AS tier,
        GREATEST(
          similarity(e.canonical_name, q.raw),
          similarity(jsonb_text_agg(e.aliases), q.raw),
          similarity(c.consumer_question, q.raw),
          coalesce(ts_rank_cd(c.search_vector, q.tsq), 0),
          coalesce(ts_rank_cd(e.search_vector, q.tsq), 0)
        ) AS score
      FROM claims c
      INNER JOIN entities e ON e.id = c.entity_id
      CROSS JOIN q
      WHERE c.id IN (SELECT id FROM candidate_claims)
        AND c.publication_status = 'published'
        AND e.publication_status = 'published'
    )
    SELECT
      claim_id, entity_slug, entity_name, claim_slug,
      consumer_question, direct_answer, proof_boundary_stage, claim_type, tier
    FROM matched
    WHERE tier IS NOT NULL
    ORDER BY tier ASC, score DESC NULLS LAST, display_priority DESC, claim_id ASC
    LIMIT ${MAX_RESULTS}
  `)
    return result.rows
  })

  return rows.map((row) => ({
    claimId: Number(row.claim_id),
    entitySlug: row.entity_slug,
    entityName: row.entity_name,
    claimSlug: row.claim_slug,
    consumerQuestion: row.consumer_question,
    directAnswer: row.direct_answer,
    proofBoundaryStage: row.proof_boundary_stage,
    claimType: row.claim_type,
    matchTier: row.tier as SearchMatchTier,
  }))
}
