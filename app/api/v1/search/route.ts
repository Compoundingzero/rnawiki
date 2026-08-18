// GET /api/v1/search?q=... — public, read-only, no-auth JSON API.
//
// Deliberately simple and SELF-CONTAINED: a plain ILIKE substring match against
// entities.canonical_name / entities.aliases and claims.consumer_question, published rows only.
// It does not depend on lib/search.ts (the site's full-text + trigram search used by the human
// /search page) — that module may be built/changed concurrently by a different task. This gives
// the public API a stable, independent contract in the meantime.
//
// TODO(later): unify this with lib/search.ts's searchEntitiesAndClaims so the API and the human
// search experience rank results the same way, instead of two separate query implementations.
//
// Like lib/search.ts, this route never logs or persists the raw query text.

import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { entityUrl, claimAnchorUrl } from '@/lib/canonical'
import { PROOF_BOUNDARY_LABELS, type ProofBoundaryStage } from '@/lib/evidence'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'

// Uses the pg connection pool via Drizzle — needs the Node runtime, not edge.
export const runtime = 'nodejs'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
} as const

function jsonResponse(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      ...CORS_HEADERS,
      'Cache-Control': status === 200 ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'no-store',
    },
  })
}

const MAX_QUERY_LENGTH = 200
const ENTITY_LIMIT = 10
const CLAIM_LIMIT = 10

/** Escapes ILIKE metacharacters so a query containing "%" or "_" is matched literally. */
function escapeLikePattern(input: string): string {
  return input.replace(/[\\%_]/g, (ch) => `\\${ch}`)
}

// `type`, not `interface` — db.execute<TRow>()'s constraint is `TRow extends Record<string,
// unknown>`, which a plain `interface` (no index signature) does not structurally satisfy.
type EntityRow = {
  slug: string
  canonical_name: string
  short_description: string
}

type ClaimRow = {
  id: number
  entity_slug: string
  entity_name: string
  claim_slug: string
  consumer_question: string
  direct_answer: string
  proof_boundary_stage: ProofBoundaryStage
}

export async function GET(request: Request) {
  const ip = getRequestIp(request)
  const rateLimit = checkRateLimit(`GET /api/v1/search:${ip}`)
  if (!rateLimit.allowed) {
    return jsonResponse({ error: 'Too many requests. Please slow down.' }, 429)
  }

  const url = new URL(request.url)
  const rawQuery = url.searchParams.get('q')?.trim() ?? ''
  if (!rawQuery) {
    return jsonResponse({ error: 'Query parameter "q" is required.' }, 400)
  }
  const query = rawQuery.slice(0, MAX_QUERY_LENGTH)
  const likePattern = `%${escapeLikePattern(query)}%`

  try {
    const [entityResult, claimResult] = await Promise.all([
      db.execute<EntityRow>(sql`
        SELECT slug, canonical_name, short_description
        FROM entities
        WHERE publication_status = 'published'
          AND (
            canonical_name ILIKE ${likePattern} ESCAPE '\\'
            OR jsonb_text_agg(aliases) ILIKE ${likePattern} ESCAPE '\\'
          )
        ORDER BY canonical_name ASC
        LIMIT ${ENTITY_LIMIT}
      `),
      db.execute<ClaimRow>(sql`
        SELECT c.id, e.slug AS entity_slug, e.canonical_name AS entity_name, c.slug AS claim_slug,
               c.consumer_question, c.direct_answer, c.proof_boundary_stage
        FROM claims c
        INNER JOIN entities e ON e.id = c.entity_id
        WHERE c.publication_status = 'published'
          AND e.publication_status = 'published'
          AND c.consumer_question ILIKE ${likePattern} ESCAPE '\\'
        ORDER BY c.display_priority DESC, c.id ASC
        LIMIT ${CLAIM_LIMIT}
      `),
    ])

    const entityResults = entityResult.rows.map((row) => ({
      type: 'entity' as const,
      canonicalName: row.canonical_name,
      slug: row.slug,
      shortDescription: row.short_description,
      canonicalUrl: entityUrl(row.slug),
    }))

    const claimResults = claimResult.rows.map((row) => ({
      type: 'claim' as const,
      id: Number(row.id),
      consumerQuestion: row.consumer_question,
      directAnswer: row.direct_answer,
      proofBoundaryStage: row.proof_boundary_stage,
      proofBoundaryStageLabel: PROOF_BOUNDARY_LABELS[row.proof_boundary_stage],
      entityName: row.entity_name,
      entitySlug: row.entity_slug,
      canonicalUrl: claimAnchorUrl(row.entity_slug, row.claim_slug),
    }))

    return jsonResponse(
      {
        query,
        results: [...entityResults, ...claimResults],
      },
      200
    )
  } catch (err) {
    console.error('GET /api/v1/search: failed', err)
    return jsonResponse({ error: 'Something went wrong on our end. Please try again.' }, 500)
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
