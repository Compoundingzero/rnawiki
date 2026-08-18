// GET /api/v1/entities/[slug] — public, read-only, no-auth JSON API.
//
// Returns exactly one published entity with its published claims nested. Everything here is
// data an editor has already put through publication — no draft content, no reviewer notes,
// no internal ids beyond what the entity/claim is already addressed by publicly (slug, or the
// claim's numeric id used in /api/v1/claims/[claimId] and /embed/claim/[id]).
//
// "Doesn't exist" and "exists but isn't published" are deliberately indistinguishable to callers
// (both are a plain 404) so this endpoint can never be used to detect unpublished content.

import { NextResponse } from 'next/server'
import { getPublishedEntityBySlug, getPublishedClaimsForEntity, getRegulatoryStatusesForEntity } from '@/lib/queries/entities'
import { entityUrl, claimAnchorUrl } from '@/lib/canonical'
import { PROOF_BOUNDARY_LABELS, EVIDENCE_RELATIONSHIP_LABELS } from '@/lib/evidence'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import type { ProofCardView } from '@/lib/types'

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
      // Data here only changes when an editor publishes — a generous CDN cache is safe and
      // cheap. Non-200 responses aren't cached so a transient rate-limit or lookup miss can't
      // stick around at the edge.
      'Cache-Control': status === 200 ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'no-store',
    },
  })
}

const NOT_FOUND = { error: 'Not found' } as const

/** Same per-claim shape used by /api/v1/claims/[claimId] — keep the two in sync if this changes. */
function toPublicClaim(claim: ProofCardView) {
  const sourceLinks = claim.evidence
    .map((link) => ({
      doi: link.source.doi,
      pmid: link.source.pmid,
      regulatoryUrl: link.source.regulatoryUrl,
    }))
    // Only keep entries that actually link somewhere — no bare placeholder objects.
    .filter((link) => link.doi !== null || link.pmid !== null || link.regulatoryUrl !== null)
    // De-duplicate (a source can back more than one part of the same claim).
    .filter(
      (link, index, all) =>
        all.findIndex((other) => other.doi === link.doi && other.pmid === link.pmid && other.regulatoryUrl === link.regulatoryUrl) ===
        index
    )

  return {
    directAnswer: claim.directAnswer,
    measuredFinding: claim.measuredFinding,
    inference: claim.inference,
    proofBoundaryStage: claim.proofBoundaryStage,
    proofBoundaryStageLabel: PROOF_BOUNDARY_LABELS[claim.proofBoundaryStage],
    evidenceContext: claim.evidence.map((link) => ({
      relationship: link.relationship,
      relationshipLabel: EVIDENCE_RELATIONSHIP_LABELS[link.relationship],
      claimPartAddressed: link.claimPartAddressed,
      directlyMeasuredResult: link.directlyMeasuredResult,
      independentGroupStatus: link.independentGroupStatus,
    })),
    sourceLinks,
    lastReviewedAt: claim.lastReviewedAt ? claim.lastReviewedAt.toISOString() : null,
    canonicalUrl: claimAnchorUrl(claim.entitySlug, claim.slug),
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const ip = getRequestIp(request)
  const rateLimit = checkRateLimit(`GET /api/v1/entities:${ip}`)
  if (!rateLimit.allowed) {
    return jsonResponse(
      { error: 'Too many requests. Please slow down.' },
      429
    )
  }

  const { slug } = await params

  try {
    const entity = await getPublishedEntityBySlug(slug)
    if (!entity) {
      return jsonResponse(NOT_FOUND, 404)
    }

    const [claims, regulatoryStatuses] = await Promise.all([
      getPublishedClaimsForEntity(entity.id),
      getRegulatoryStatusesForEntity(entity.id),
    ])

    return jsonResponse(
      {
        canonicalName: entity.canonicalName,
        slug: entity.slug,
        aliases: entity.aliases,
        entityType: entity.entityType,
        shortDescription: entity.shortDescription,
        bottomLine: entity.bottomLine,
        regulatoryCategory: entity.regulatoryCategory,
        canonicalUrl: entityUrl(entity.slug),
        updatedAt: entity.updatedAt.toISOString(),
        regulatoryStatuses: regulatoryStatuses
          .filter((status) => status.reviewStatus === 'published')
          .map((status) => ({
            jurisdiction: status.jurisdiction,
            legalCategory: status.legalCategory,
            approvedIndications: status.approvedIndications,
            statusStatement: status.statusStatement,
            source: status.source,
            checkedDate: status.checkedDate.toISOString(),
          })),
        claims: claims.map(toPublicClaim),
      },
      200
    )
  } catch (err) {
    console.error('GET /api/v1/entities/[slug]: failed', err)
    return jsonResponse({ error: 'Something went wrong on our end. Please try again.' }, 500)
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
