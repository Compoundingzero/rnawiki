// Site search: PostgreSQL full-text search (to_tsvector/websearch_to_tsquery) + pg_trgm trigram
// similarity for typo tolerance and alias matching. No vector DB, no external search service —
// see db/migrations/0001_add_search_vectors.sql for the generated tsvector columns and GIN
// indexes this relies on (entities.search_vector, claims.search_vector, and trigram indexes on
// entities.canonical_name, the flattened entities.aliases, and claims.consumer_question).
//
// This module never logs or persists the raw query text — search terms are not stored anywhere,
// per the product's privacy stance (see lib/session-hash.ts for the same principle applied to
// comprehension responses and correction submissions).

import { sql } from 'drizzle-orm'
import { db } from '@/db'
import type { ProofBoundaryStage } from '@/lib/evidence'

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
  const trimmed = rawQuery.trim()
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
    const result = await tx.execute<SearchRow>(sql`
    WITH q AS (
      SELECT
        ${query}::text AS raw,
        lower(${query}::text) AS lc,
        websearch_to_tsquery('english', ${query}::text) AS tsq
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
      WHERE c.publication_status = 'published'
        AND e.publication_status = 'published'
        AND (
          lower(e.canonical_name) = q.lc
          OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(e.aliases) alias WHERE lower(alias) = q.lc)
          OR lower(c.consumer_question) = q.lc
          OR lower(c.direct_answer) = q.lc
          OR c.consumer_question ILIKE ${likePattern} ESCAPE '\\'
          OR q.raw <% e.canonical_name
          OR q.raw <% jsonb_text_agg(e.aliases)
          OR q.raw <% c.consumer_question
          OR (q.tsq::text <> '' AND (e.search_vector @@ q.tsq OR c.search_vector @@ q.tsq))
        )
    )
    SELECT
      claim_id, entity_slug, entity_name, claim_slug,
      consumer_question, direct_answer, proof_boundary_stage, tier
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
    matchTier: row.tier as SearchMatchTier,
  }))
}
