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
import { stagePositionApplies } from '@/lib/evidence-view'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { sanitisePublicText } from '@/lib/public-ids'

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
  // Selected for one reason: so this endpoint can ship `evidencePositionApplies` beside the
  // position. See the comment on the result mapping below.
  claim_type: string
}

export async function GET(request: Request) {
  const ip = getRequestIp(request)
  const rateLimit = checkRateLimit(`GET /api/v1/search:${ip}`)
  if (!rateLimit.allowed) {
    return jsonResponse({ error: 'Too many requests. Please slow down.' }, 429)
  }

  const url = new URL(request.url)
  // Control characters are stripped before the trim, for the same reason as lib/search.ts: a NUL
  // in `q` is not bindable by Postgres and used to surface as a 500 rather than an empty result
  // set. A query that is nothing but control characters is an empty query. See lib/public-ids.ts.
  const rawQuery = sanitisePublicText(url.searchParams.get('q') ?? '').trim()
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
               c.consumer_question, c.direct_answer, c.proof_boundary_stage, c.claim_type
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

    // `claimType` and `evidencePositionApplies` travel with the position, always, and removing
    // either is a safety regression rather than a payload trim.
    //
    // Every claim carries a `proofBoundaryStage` in the database, but the position only MEANS
    // something for an outcome claim. Casgevy's "What does actually getting treated with Casgevy
    // involve?" is an `access` claim stored at `regulatory_evidence`: /r/casgevy, /embed/claim/1024
    // and /api/v1/claims/1024 all suppress the position for it, the last by shipping
    // `evidencePositionApplies: false`. This endpoint shipped the stage and its display label with
    // no qualifier at all, so the most natural consumer use — a result list of question, answer and
    // position line — republished "a medicines regulator reviewed the evidence and approved the
    // product for a specific use" under a description of a hospital stay, and no served field let
    // the consumer detect it.
    //
    // stagePositionApplies is the one function that decides this, for the API and for every page
    // that prints a position, so the two cannot disagree (docs/api.md).
    const claimResults = claimResult.rows.map((row) => ({
      type: 'claim' as const,
      id: Number(row.id),
      consumerQuestion: row.consumer_question,
      directAnswer: row.direct_answer,
      claimType: row.claim_type,
      proofBoundaryStage: row.proof_boundary_stage,
      proofBoundaryStageLabel: PROOF_BOUNDARY_LABELS[row.proof_boundary_stage],
      evidencePositionApplies: stagePositionApplies(row.claim_type),
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
