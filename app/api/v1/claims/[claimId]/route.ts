// GET /api/v1/claims/[claimId] — public, read-only, no-auth JSON API.
//
// Returns exactly one published claim, in the same shape nested claims take under
// /api/v1/entities/[slug]. `claimId` is the claim's numeric id (the same id used in
// /embed/claim/[id] — see lib/canonical.ts's embedUrl). A claim whose entity isn't published,
// or that isn't itself published, is deliberately indistinguishable from a claim that doesn't
// exist at all — both return the same plain 404.

import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { claims, entities, claimEvidence, evidenceSources } from '@/db/schema'
import { claimAnchorUrl } from '@/lib/canonical'
import { PROOF_BOUNDARY_LABELS, EVIDENCE_RELATIONSHIP_LABELS } from '@/lib/evidence'
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

const NOT_FOUND = { error: 'Not found' } as const

export async function GET(request: Request, { params }: { params: Promise<{ claimId: string }> }) {
  const ip = getRequestIp(request)
  const rateLimit = checkRateLimit(`GET /api/v1/claims:${ip}`)
  if (!rateLimit.allowed) {
    return jsonResponse({ error: 'Too many requests. Please slow down.' }, 429)
  }

  const { claimId } = await params
  const claimIdNum = Number(claimId)
  if (!Number.isInteger(claimIdNum) || claimIdNum <= 0) {
    // Malformed id is just another way to not find a claim — same uniform 404.
    return jsonResponse(NOT_FOUND, 404)
  }

  try {
    const [row] = await db
      .select({
        claim: claims,
        entitySlug: entities.slug,
        entityPublicationStatus: entities.publicationStatus,
      })
      .from(claims)
      .innerJoin(entities, eq(claims.entityId, entities.id))
      .where(and(eq(claims.id, claimIdNum), eq(claims.publicationStatus, 'published')))
      .limit(1)

    if (!row || row.entityPublicationStatus !== 'published') {
      return jsonResponse(NOT_FOUND, 404)
    }

    const evidenceLinks = await db
      .select()
      .from(claimEvidence)
      .innerJoin(evidenceSources, eq(claimEvidence.evidenceSourceId, evidenceSources.id))
      .where(eq(claimEvidence.claimId, row.claim.id))
      .orderBy(claimEvidence.displayPriority)

    const sourceLinks = evidenceLinks
      .map((link) => ({
        doi: link.evidence_sources.doi,
        pmid: link.evidence_sources.pmid,
        regulatoryUrl: link.evidence_sources.regulatoryUrl,
      }))
      .filter((link) => link.doi !== null || link.pmid !== null || link.regulatoryUrl !== null)
      .filter(
        (link, index, all) =>
          all.findIndex(
            (other) => other.doi === link.doi && other.pmid === link.pmid && other.regulatoryUrl === link.regulatoryUrl
          ) === index
      )

    return jsonResponse(
      {
        directAnswer: row.claim.directAnswer,
        measuredFinding: row.claim.measuredFinding,
        inference: row.claim.inference,
        proofBoundaryStage: row.claim.proofBoundaryStage,
        proofBoundaryStageLabel: PROOF_BOUNDARY_LABELS[row.claim.proofBoundaryStage],
        evidenceContext: evidenceLinks.map((link) => ({
          relationship: link.claim_evidence.relationship,
          relationshipLabel: EVIDENCE_RELATIONSHIP_LABELS[link.claim_evidence.relationship],
          claimPartAddressed: link.claim_evidence.claimPartAddressed,
          directlyMeasuredResult: link.claim_evidence.directlyMeasuredResult,
          independentGroupStatus: link.claim_evidence.independentGroupStatus,
        })),
        sourceLinks,
        lastReviewedAt: row.claim.lastReviewedAt ? row.claim.lastReviewedAt.toISOString() : null,
        canonicalUrl: claimAnchorUrl(row.entitySlug, row.claim.slug),
      },
      200
    )
  } catch (err) {
    console.error('GET /api/v1/claims/[claimId]: failed', err)
    return jsonResponse({ error: 'Something went wrong on our end. Please try again.' }, 500)
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
