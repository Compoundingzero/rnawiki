// GET /api/v1/entities/[slug] — public, read-only, no-auth JSON API.
//
// Returns exactly one published entity with its published claims nested. Everything here is
// data an editor has already put through publication — no draft content, no reviewer notes,
// no internal ids beyond what the entity/claim is already addressed by publicly (slug, or the
// claim's numeric id used in /api/v1/claims/[claimId] and /embed/claim/[id]).
//
// "Doesn't exist" and "exists but isn't published" are deliberately indistinguishable to callers
// (both are a plain 404) so this endpoint can never be used to detect unpublished content.
//
// SCHEMA 1.3.0 — every field added since 1.0.0 is ADDITIVE. A consumer written against 1.0.0
// keeps working untouched: no 1.0.0 field was renamed, retyped, reordered or given a new meaning.
// That is the whole point of publishing `schemaVersion`; breaking a documented field is a
// versioned, announced change, never a quiet one. Field-by-field meaning lives in docs/api.md and
// schemas/evidence-record.schema.json.

import { NextResponse } from 'next/server'
import { getPublishedEntityBySlug, getPublishedClaimsForEntity, getRegulatoryStatusesForEntity } from '@/lib/queries/entities'
import { entityUrl, claimAnchorUrl } from '@/lib/canonical'
import { PROOF_BOUNDARY_LABELS, EVIDENCE_RELATIONSHIP_LABELS } from '@/lib/evidence'
import { stagePositionApplies } from '@/lib/evidence-view'
import { CLAIM_EVENT_TYPE_PUBLIC, DEVELOPMENT_GATE_PUBLIC } from '@/lib/claim-events'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { sanitisePublicText } from '@/lib/public-ids'
import type { ProofCardView, ReviewView } from '@/lib/types'

// Uses the pg connection pool via Drizzle — needs the Node runtime, not edge.
export const runtime = 'nodejs'

// Bump only when the response shape changes: additive changes bump the minor, a removal or a
// changed meaning bumps the major. Deliberately NOT exported — a route.ts file may only export
// HTTP method handlers and Next's own route config fields, and any other named export fails the
// production build with "is not a valid Route export field".
const SCHEMA_VERSION = '1.3.0'

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

/**
 * SAFETY RULE — `reviewState` may be derived ONLY from a `reviews` row.
 *
 * `publicationStatus === 'published'` is editorial workflow, never scientific sign-off (CLAUDE.md
 * rule 2). A caller that read a workflow status and printed "reviewed" would republish that
 * mistake at machine scale, so the workflow status is not in the response at all and this is the
 * only function allowed to produce the value.
 *
 * `editorial_only` is the default and covers every case that is not an approved review: no review
 * exists, the review was rejected, or the reviewer asked for changes. It asserts that RNAwiki's
 * editors published the claim and asserts nothing further about it.
 *
 * The state says *that* a review happened, never *who* did it: reviewer name, credentials,
 * comments and the review row's id are never serialised anywhere in this file. Keep it that way —
 * a reviewer's identity is not public data and a reviewer's comments are internal editorial
 * correspondence.
 *
 * The input is the same latest-review row the record page reads
 * (app/(public)/r/[slug]/page.tsx checks `review?.decision === 'approved'`), so the API and the
 * rendered page cannot disagree about whether a claim was independently reviewed. Keep the two
 * rules identical if either moves. *
 * VERSION DRIFT — same rule as components/evidence/EvidenceRecordMeta.tsx. An approval approves the
 * text that existed when it was given, so `independently_reviewed` requires the approved review's
 * `reviewedVersion` to equal the claim's current `version`. An approved review of an older version
 * degrades to `editorial_only` here rather than travelling to a machine reader as a live approval
 * of text the reviewer never saw. Move this rule and you must move it in all three places.
 */
function reviewState(
  review: Pick<ReviewView, 'decision' | 'reviewedVersion'> | null,
  claimVersion: number
): 'independently_reviewed' | 'editorial_only' {
  if (review?.decision !== 'approved') return 'editorial_only'
  return review.reviewedVersion === claimVersion ? 'independently_reviewed' : 'editorial_only'
}

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

    // --- added in schema 1.1.0, all additive ---

    // The editorial version of this claim's text. Two responses carrying the same claimVersion
    // carry the same wording; a bump means an editor changed the claim, not that the science did.
    claimVersion: claim.version,
    // When RNAwiki last touched this claim's record. Not a re-verification of every cited source,
    // and not the date of the newest evidence.
    lastCheckedAt: claim.lastCheckedAt.toISOString(),
    // The EDITORIAL check: when a person last read the cited sources and checked this answer
    // against them. Null when nobody has recorded one. `lastCheckedAt` above is a database
    // write timestamp and cannot answer this question — that difference is the whole reason
    // this field exists, and it is why the record page prints "last edited" rather than "last
    // checked" whenever this is null.
    checkedAt: claim.checkedAt ? claim.checkedAt.toISOString() : null,
    // What is still missing, and what would have to be measured next. Both are stated on every
    // claim so a consumer cannot render an answer that reads more settled than the evidence is.

    // --- added in schema 1.3.0, both additive ---

    // WHY THIS PAIR EXISTS — the response was publishing an evidence position the record page
    // deliberately refuses to print. Casgevy's "What does actually getting treated with Casgevy
    // involve?" is an access question, and it carried "proofBoundaryStage": "regulatory_evidence"
    // with nothing beside it to say that the position is meaningless there. The page renders no
    // ladder and no position sentence for that claim, because a logistics answer has no evidence
    // ladder and filling one to its top rung credits a hospital-procedure description to a
    // regulator's review of effectiveness. A consumer reading the JSON could not tell, and so
    // republished the exact statement the page suppresses.
    //
    // The fix is additive, never subtractive: `proofBoundaryStage` and `proofBoundaryStageLabel`
    // keep their names, types and meanings, because removing a documented v1 field breaks every
    // consumer written against it. What was missing was the qualifier, so the qualifier is what
    // was added.
    //
    // `claimType` is the stored classification and is what makes the boolean checkable — without
    // it a consumer has to take `evidencePositionApplies` on trust and cannot see the rule behind
    // it.
    claimType: claim.claimType,
    // Mirrors lib/evidence-view.ts's stagePositionApplies(), which is the same function the record
    // page, the search results and the homepage use to decide whether to print a position at all.
    // It is called here rather than reimplemented so the API and the page can never drift into
    // disagreeing about which claims have an evidence position.
    evidencePositionApplies: stagePositionApplies(claim.claimType),
    remainingUnknown: claim.remainingUnknown,
    evidenceNeededNext: claim.evidenceNeededNext,
    reviewState: reviewState(claim.review, claim.version),
    // Published events only. getPublishedClaimsForEntity filters on publicationStatus = 'published'
    // before this ever runs; a draft event is unfinished editorial work and must not leave the
    // database. Every event carries a real source — the schema makes evidence_source_id NOT NULL
    // so this section can never become editorialised opinion.
    claimEvents: claim.events.map((event) => ({
      eventType: event.eventType,
      eventTypePublic: CLAIM_EVENT_TYPE_PUBLIC[event.eventType],
      developmentGate: event.developmentGate,
      developmentGatePublic: DEVELOPMENT_GATE_PUBLIC[event.developmentGate],
      plainSummary: event.plainSummary,
      whatItSuggests: event.whatItSuggests,
      // A boundary statement, not a conclusion: it records what this event leaves open, and never
      // says the treatment does not work.
      whatItDoesNotEstablish: event.whatItDoesNotEstablish,
      eventDate: event.eventDate ? event.eventDate.toISOString() : null,
      source: {
        title: event.source.title,
        doi: event.source.doi,
        pmid: event.source.pmid,
        clinicalTrialId: event.source.clinicalTrialId,
        regulatoryUrl: event.source.regulatoryUrl,
      },
    })),
    // evidence_changes is the public "what changed" feed and holds no draft state — every row for
    // a published claim is already public on /updates. Newest first.
    evidenceChanges: claim.changes.map((change) => ({
      changeType: change.changeType,
      previousBoundary: change.previousBoundary,
      newBoundary: change.newBoundary,
      explanation: change.explanation,
      source: change.source,
      publicationDate: change.publicationDate.toISOString(),
    })),
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
  // A control character in a slug is a no-match, not a server error. Postgres refuses to bind a
  // NUL in a text parameter, so `/api/v1/entities/bpc%00-157` used to 500 here; the App Router
  // rejects %00 in a *pathname* before a server component runs, but a route handler receives the
  // decoded segment, so this route is the one that was reachable. See lib/public-ids.ts.
  //
  // REJECTED rather than stripped, deliberately. getPublishedEntityBySlug sanitises too, so
  // stripping here would have made `bpc%00-157` resolve to `bpc-157` and given one record a second
  // cacheable URL — the same duplicate-URL problem parsePublicId fixes for claim ids. A slug that
  // needed sanitising is not a slug anybody published.
  if (sanitisePublicText(slug) !== slug) {
    return jsonResponse(NOT_FOUND, 404)
  }

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
        schemaVersion: SCHEMA_VERSION,
        canonicalName: entity.canonicalName,
        slug: entity.slug,
        aliases: entity.aliases,
        entityType: entity.entityType,
        shortDescription: entity.shortDescription,
        bottomLine: entity.bottomLine,
        regulatoryCategory: entity.regulatoryCategory,
        canonicalUrl: entityUrl(entity.slug),
        updatedAt: entity.updatedAt.toISOString(),
        // Belt and braces. getRegulatoryStatusesForEntity now gates on reviewStatus itself, so
        // this filter is redundant — kept deliberately, because it is the last line between a
        // draft regulatory statement and a third party's site if that predicate is ever lost.
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
