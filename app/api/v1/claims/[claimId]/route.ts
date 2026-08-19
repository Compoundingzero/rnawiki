// GET /api/v1/claims/[claimId] — public, read-only, no-auth JSON API.
//
// Returns exactly one published claim, in the same shape nested claims take under
// /api/v1/entities/[slug]. `claimId` is the claim's numeric id (the same id used in
// /embed/claim/[id] — see lib/canonical.ts's embedUrl). A claim whose entity isn't published,
// or that isn't itself published, is deliberately indistinguishable from a claim that doesn't
// exist at all — both return the same plain 404.
//
// SCHEMA 1.3.0 — every field added since 1.0.0 is ADDITIVE. A consumer written against 1.0.0
// keeps working untouched: no 1.0.0 field was renamed, retyped, reordered or given a new meaning.
// This route builds its rows by hand rather than through lib/queries/entities.ts, so the two
// endpoints must be edited together — a field added in one and missed in the other is a silent
// contract break that no type error catches.

import { NextResponse } from 'next/server'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { claims, entities, claimEvidence, evidenceSources, claimEvents, evidenceChanges, reviews } from '@/db/schema'
import { claimAnchorUrl } from '@/lib/canonical'
import { PROOF_BOUNDARY_LABELS, EVIDENCE_RELATIONSHIP_LABELS } from '@/lib/evidence'
import { stagePositionApplies } from '@/lib/evidence-view'
import { CLAIM_EVENT_TYPE_PUBLIC, DEVELOPMENT_GATE_PUBLIC } from '@/lib/claim-events'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { parsePublicId } from '@/lib/public-ids'

// Uses the pg connection pool via Drizzle — needs the Node runtime, not edge.
export const runtime = 'nodejs'

// Must match the constant in /api/v1/entities/[slug] — the two endpoints share one schema.
// Deliberately NOT exported: a route.ts file may only export HTTP method handlers and Next's own
// route config fields, and any other named export fails the production build.
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
      'Cache-Control': status === 200 ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'no-store',
    },
  })
}

const NOT_FOUND = { error: 'Not found' } as const

/**
 * SAFETY RULE — `reviewState` may be derived ONLY from a `reviews` row.
 *
 * `publicationStatus === 'published'` is editorial workflow, never scientific sign-off (CLAUDE.md
 * rule 2), and this route already filtered on it to decide whether the claim exists publicly at
 * all. Reusing it here would turn "an editor pressed publish" into "a scientist signed this off".
 *
 * `editorial_only` is the default and covers every case that is not an approved review: no review
 * exists, the review was rejected, or the reviewer asked for changes.
 *
 * The state says *that* a review happened, never *who* did it. The query feeding this selects the
 * decision column alone — it does not join `users` and does not read `reviews.comments`, so no
 * reviewer name, credential or comment can reach the response even by accident. Keep the select
 * list narrow if you touch it.
 *
 * Identical rule to /api/v1/entities/[slug] and to the record page's
 * `review?.decision === 'approved'` check, on the same latest-review row. Move one, move all three. *
 * VERSION DRIFT — same rule as components/evidence/EvidenceRecordMeta.tsx. An approval approves the
 * text that existed when it was given, so `independently_reviewed` requires the approved review's
 * `reviewedVersion` to equal the claim's current `version`. An approved review of an older version
 * degrades to `editorial_only` here rather than travelling to a machine reader as a live approval
 * of text the reviewer never saw. Move this rule and you must move it in all three places.
 */
function reviewState(
  review: { decision: 'approved' | 'rejected' | 'needs_changes'; reviewedVersion: number } | null,
  claimVersion: number
): 'independently_reviewed' | 'editorial_only' {
  if (review?.decision !== 'approved') return 'editorial_only'
  return review.reviewedVersion === claimVersion ? 'independently_reviewed' : 'editorial_only'
}

export async function GET(request: Request, { params }: { params: Promise<{ claimId: string }> }) {
  const ip = getRequestIp(request)
  const rateLimit = checkRateLimit(`GET /api/v1/claims:${ip}`)
  if (!rateLimit.allowed) {
    return jsonResponse({ error: 'Too many requests. Please slow down.' }, 429)
  }

  const { claimId } = await params
  // parsePublicId, not Number(): the old guard passed both `2147483648` (in range for a JS integer,
  // out of range for the int4 column, so a 500 from the driver) and alternate spellings like
  // `0x3F8` or `1.016e3` (one record served at several cacheable URLs). See lib/public-ids.ts.
  // Malformed id is just another way to not find a claim — same uniform 404.
  const claimIdNum = parsePublicId(claimId)
  if (claimIdNum === null) {
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

    const [evidenceLinks, eventRows, changeRows, reviewRows] = await Promise.all([
      db
        .select()
        .from(claimEvidence)
        .innerJoin(evidenceSources, eq(claimEvidence.evidenceSourceId, evidenceSources.id))
        .where(eq(claimEvidence.claimId, row.claim.id))
        .orderBy(claimEvidence.displayPriority),
      // Published events only. A draft event is unfinished editorial work; serving one would put
      // an unreviewed failure statement about a real treatment on someone else's site.
      db
        .select({ event: claimEvents, source: evidenceSources })
        .from(claimEvents)
        .innerJoin(evidenceSources, eq(claimEvents.evidenceSourceId, evidenceSources.id))
        .where(and(eq(claimEvents.claimId, row.claim.id), eq(claimEvents.publicationStatus, 'published')))
        .orderBy(claimEvents.displayPriority, sql`${claimEvents.eventDate} DESC NULLS LAST`),
      // evidence_changes is the public "what changed" feed (it has no draft state) and these rows
      // are already public on /updates. Newest first, same order the record page shows them in.
      db
        .select()
        .from(evidenceChanges)
        .where(eq(evidenceChanges.claimId, row.claim.id))
        .orderBy(desc(evidenceChanges.publicationDate)),
      // Decision column only — see the reviewState SAFETY RULE above. No join to `users`, no
      // `comments`, no reviewer id.
      db
        .select({ decision: reviews.decision, reviewedVersion: reviews.reviewedVersion })
        .from(reviews)
        .where(and(eq(reviews.reviewableType, 'claim'), eq(reviews.reviewableId, row.claim.id)))
        .orderBy(desc(reviews.reviewDate))
        .limit(1),
    ])

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
        schemaVersion: SCHEMA_VERSION,
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

        // --- added in schema 1.1.0, all additive ---

        // The editorial version of this claim's text. A bump means an editor changed the wording,
        // not that the science moved; evidenceChanges below is where the science moving is recorded.
        claimVersion: row.claim.version,
        // When RNAwiki last touched this claim's record. Not a re-verification of every cited
        // source, and not the date of the newest evidence.
        lastCheckedAt: row.claim.updatedAt.toISOString(),
        // The EDITORIAL check: when a person last read the cited sources and checked this answer
        // against them. Null when nobody has recorded one. `lastCheckedAt` above is a database
        // write timestamp and cannot answer this question — that difference is the whole reason
        // this field exists, and it is why the record page prints "last edited" rather than "last
        // checked" whenever this is null.
        checkedAt: row.claim.checkedAt ? row.claim.checkedAt.toISOString() : null,

        // --- added in schema 1.3.0, both additive ---

        // WHY THIS PAIR EXISTS — the response was publishing an evidence position the record page
        // deliberately refuses to print. /api/v1/claims/881 is Casgevy's "What does actually
        // getting treated with Casgevy involve?", an access question, and it carried
        // "proofBoundaryStage": "regulatory_evidence" with nothing beside it to say that the
        // position is meaningless there. The page renders no ladder and no position sentence for
        // that claim, because a logistics answer has no evidence ladder and filling one to its top
        // rung credits a hospital-procedure description to a regulator's review of effectiveness.
        // A consumer reading the JSON could not tell, and so republished the exact statement the
        // page suppresses.
        //
        // The fix is additive, never subtractive: `proofBoundaryStage` and
        // `proofBoundaryStageLabel` keep their names, types and meanings, because removing a
        // documented v1 field breaks every consumer written against it. What was missing was the
        // qualifier, so the qualifier is what was added.
        //
        // `claimType` is the stored classification and is what makes the boolean checkable —
        // without it a consumer has to take `evidencePositionApplies` on trust and cannot see the
        // rule behind it.
        claimType: row.claim.claimType,
        // Mirrors lib/evidence-view.ts's stagePositionApplies(), which is the same function the
        // record page, the search results and the homepage use to decide whether to print a
        // position at all. It is called here rather than reimplemented so the API and the page can
        // never drift into disagreeing about which claims have an evidence position.
        evidencePositionApplies: stagePositionApplies(row.claim.claimType),
        remainingUnknown: row.claim.remainingUnknown,
        evidenceNeededNext: row.claim.evidenceNeededNext,
        reviewState: reviewState(reviewRows[0] ?? null, row.claim.version),
        claimEvents: eventRows.map(({ event, source }) => ({
          eventType: event.eventType,
          eventTypePublic: CLAIM_EVENT_TYPE_PUBLIC[event.eventType],
          developmentGate: event.developmentGate,
          developmentGatePublic: DEVELOPMENT_GATE_PUBLIC[event.developmentGate],
          plainSummary: event.plainSummary,
          whatItSuggests: event.whatItSuggests,
          // A boundary statement, not a conclusion: it records what this event leaves open, and
          // never says the treatment does not work.
          whatItDoesNotEstablish: event.whatItDoesNotEstablish,
          eventDate: event.eventDate ? event.eventDate.toISOString() : null,
          source: {
            title: source.title,
            doi: source.doi,
            pmid: source.pmid,
            clinicalTrialId: source.clinicalTrialId,
            regulatoryUrl: source.regulatoryUrl,
          },
        })),
        evidenceChanges: changeRows.map((change) => ({
          changeType: change.changeType,
          previousBoundary: change.previousBoundary,
          newBoundary: change.newBoundary,
          explanation: change.explanation,
          source: change.source,
          publicationDate: change.publicationDate.toISOString(),
        })),
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
