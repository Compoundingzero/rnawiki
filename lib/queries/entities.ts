import { db } from '@/db'
import { entities, claims, mechanismSteps, claimEvidence, claimEvents, evidenceChanges, evidenceSources, reviews, regulatoryStatuses, users } from '@/db/schema'
import { and, eq, desc, inArray, sql } from 'drizzle-orm'
import { sanitisePublicText } from '@/lib/public-ids'
import type {
  ProofCardView,
  MechanismStepView,
  ClaimEvidenceView,
  ClaimEventView,
  EvidenceChangeView,
  EvidenceSourceView,
} from '@/lib/types'

/** One shape for a source row, so the evidence list and the event list cannot drift apart. */
function toEvidenceSourceView(row: typeof evidenceSources.$inferSelect): EvidenceSourceView {
  return {
    id: row.id,
    title: row.title,
    authors: row.authors,
    publicationYear: row.publicationYear,
    journalOrIssuer: row.journalOrIssuer,
    doi: row.doi,
    pmid: row.pmid,
    clinicalTrialId: row.clinicalTrialId,
    regulatoryUrl: row.regulatoryUrl,
    sourceType: row.sourceType,
    studyDesign: row.studyDesign,
    species: row.species,
    sampleSize: row.sampleSize,
    endpoint: row.endpoint,
    retractionStatus: row.retractionStatus,
  }
}

/**
 * The published entity at this slug, or null.
 *
 * The slug is sanitised here rather than at each call site because there are three of them — the
 * record page, /api/v1/entities/[slug] and middleware.ts's legacy-compound branch — and only one
 * of them is protected by the App Router's own rejection of %00 in a pathname. Postgres refuses to
 * bind a NUL in a text parameter, so an unsanitised slug reached the driver as an exception and
 * came back to the caller as a 500 rather than a 404. See lib/public-ids.ts.
 */
export async function getPublishedEntityBySlug(slug: string) {
  const safeSlug = sanitisePublicText(slug)
  const [entity] = await db.select().from(entities).where(eq(entities.slug, safeSlug)).limit(1)
  if (!entity || entity.publicationStatus !== 'published') return null
  return entity
}

/**
 * Published regulatory statuses for one entity, newest check first.
 *
 * THE `reviewStatus` PREDICATE IS LOAD-BEARING — do not remove it. This query had no publication
 * gate, while its two callers (the record page and /api/v1/entities/[slug]) disagreed about that:
 * the API filtered afterwards, the page did not. So an editor who saved a jurisdiction block and
 * left the form's default selection alone published unreviewed regulatory copy about an approved
 * or unapproved medicine straight onto /r/[slug], while the JSON withheld it. `regulatory_statuses`
 * defaults to 'draft' in db/schema.ts and the admin "Add jurisdiction" form defaults to 'draft',
 * so the unguarded state was also the default state.
 *
 * The DESC ordering made it worse: a draft row with a later checkedDate sorted first and became
 * `regStatuses[0]`, which is what the record page's footer prints as "Regulatory status last
 * checked". Gating here fixes that for free.
 *
 * Note the column is `reviewStatus` on this table, not the `publicationStatus` used by claims and
 * entities. Both callers are public. The admin entity editor reads regulatory rows through its own
 * inline query and still sees drafts.
 */
export async function getRegulatoryStatusesForEntity(entityId: number) {
  return db
    .select()
    .from(regulatoryStatuses)
    .where(and(eq(regulatoryStatuses.entityId, entityId), eq(regulatoryStatuses.reviewStatus, 'published')))
    .orderBy(desc(regulatoryStatuses.checkedDate))
}

export async function getPublishedClaimsForEntity(entityId: number): Promise<ProofCardView[]> {
  const claimRows = await db
    .select()
    .from(claims)
    .where(and(eq(claims.entityId, entityId), eq(claims.publicationStatus, 'published')))
    .orderBy(claims.displayPriority)

  const [entity] = await db.select({ slug: entities.slug }).from(entities).where(eq(entities.id, entityId)).limit(1)

  const claimIds = claimRows.map((c) => c.id)

  // Claim events and change history are loaded once for the whole record, not once per claim.
  // The per-claim loop below is already sequential; adding two more queries inside it would make
  // a record page issue 4 round trips per claim, which is what an entity with a dozen claims
  // would pay on every uncached request.
  const eventsByClaim = new Map<number, ClaimEventView[]>()
  const changesByClaim = new Map<number, EvidenceChangeView[]>()

  if (claimIds.length > 0) {
    const eventRows = await db
      .select()
      .from(claimEvents)
      .innerJoin(evidenceSources, eq(claimEvents.evidenceSourceId, evidenceSources.id))
      .where(
        and(
          inArray(claimEvents.claimId, claimIds),
          // Draft and in-review events must never reach a public view. `published` here is
          // editorial workflow only — it is not a scientific sign-off, per CLAUDE.md rule 2.
          eq(claimEvents.publicationStatus, 'published')
        )
      )
      // Editorial order first, then most recent event. Undated events sort last rather than
      // first, which is what Postgres would otherwise do for DESC.
      .orderBy(claimEvents.displayPriority, sql`${claimEvents.eventDate} desc nulls last`)

    for (const row of eventRows) {
      const list = eventsByClaim.get(row.claim_events.claimId) ?? []
      list.push({
        id: row.claim_events.id,
        eventType: row.claim_events.eventType,
        developmentGate: row.claim_events.developmentGate,
        plainSummary: row.claim_events.plainSummary,
        whatItSuggests: row.claim_events.whatItSuggests,
        whatItDoesNotEstablish: row.claim_events.whatItDoesNotEstablish,
        eventDate: row.claim_events.eventDate,
        source: toEvidenceSourceView(row.evidence_sources),
      })
      eventsByClaim.set(row.claim_events.claimId, list)
    }

    const changeRows = await db
      .select()
      .from(evidenceChanges)
      .where(inArray(evidenceChanges.claimId, claimIds))
      .orderBy(desc(evidenceChanges.publicationDate))

    for (const row of changeRows) {
      if (row.claimId === null) continue
      const list = changesByClaim.get(row.claimId) ?? []
      list.push({
        id: row.id,
        changeType: row.changeType,
        previousBoundary: row.previousBoundary,
        newBoundary: row.newBoundary,
        explanation: row.explanation,
        source: row.source,
        publicationDate: row.publicationDate,
      })
      changesByClaim.set(row.claimId, list)
    }
  }

  const results: ProofCardView[] = []
  for (const claim of claimRows) {
    const evidenceLinks = await db
      .select()
      .from(claimEvidence)
      .innerJoin(evidenceSources, eq(claimEvidence.evidenceSourceId, evidenceSources.id))
      .where(eq(claimEvidence.claimId, claim.id))
      .orderBy(claimEvidence.displayPriority)

    const evidence: ClaimEvidenceView[] = evidenceLinks.map((row) => ({
      relationship: row.claim_evidence.relationship,
      claimPartAddressed: row.claim_evidence.claimPartAddressed,
      directlyMeasuredResult: row.claim_evidence.directlyMeasuredResult,
      independentGroupStatus: row.claim_evidence.independentGroupStatus,
      source: toEvidenceSourceView(row.evidence_sources),
    }))

    const [latestReview] = await db
      .select({
        decision: reviews.decision,
        reviewDate: reviews.reviewDate,
        reviewedVersion: reviews.reviewedVersion,
        reviewerName: users.name,
        reviewerCredentials: users.credentials,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.reviewerId, users.id))
      .where(and(eq(reviews.reviewableType, 'claim'), eq(reviews.reviewableId, claim.id)))
      .orderBy(desc(reviews.reviewDate))
      .limit(1)

    results.push({
      id: claim.id,
      slug: claim.slug,
      claimType: claim.claimType,
      entitySlug: entity?.slug ?? '',
      consumerQuestion: claim.consumerQuestion,
      directAnswer: claim.directAnswer,
      measuredFinding: claim.measuredFinding,
      inference: claim.inference,
      proofBoundaryStage: claim.proofBoundaryStage,
      proofBoundaryExplanation: claim.proofBoundaryExplanation,
      remainingUnknown: claim.remainingUnknown,
      evidenceNeededNext: claim.evidenceNeededNext,
      evidence,
      version: claim.version,
      lastCheckedAt: claim.updatedAt,
      checkedAt: claim.checkedAt,
      events: eventsByClaim.get(claim.id) ?? [],
      changes: changesByClaim.get(claim.id) ?? [],
      lastReviewedAt: claim.lastReviewedAt,
      reviewStatus: claim.publicationStatus,
      review: latestReview
        ? {
            reviewerName: latestReview.reviewerName,
            reviewerCredentials: latestReview.reviewerCredentials,
            decision: latestReview.decision,
            reviewDate: latestReview.reviewDate,
            reviewedVersion: latestReview.reviewedVersion,
          }
        : null,
    })
  }
  return results
}

/**
 * Does this record have any public change history at all?
 *
 * The record page uses this to decide whether to render a "View record history" anchor. Rendering
 * the anchor when no change exists would promise an audit trail the page cannot show, so callers
 * must treat `false` as "render nothing" rather than "render an empty section".
 */
export function recordHasPublicChanges(claimList: ProofCardView[]): boolean {
  return claimList.some((claim) => claim.changes.length > 0)
}

export async function getMechanismStepsForClaim(claimId: number): Promise<MechanismStepView[]> {
  const rows = await db
    .select()
    .from(mechanismSteps)
    .where(eq(mechanismSteps.claimId, claimId))
    .orderBy(mechanismSteps.displayOrder)
  return rows.map((r) => ({
    id: r.id,
    displayOrder: r.displayOrder,
    technicalLabel: r.technicalLabel,
    plainLanguageExplanation: r.plainLanguageExplanation,
    evidenceContext: r.evidenceContext,
    status: r.status,
    sourceLinks: r.sourceLinks,
  }))
}

export async function listPublishedEntities() {
  return db
    .select({ slug: entities.slug, canonicalName: entities.canonicalName, shortDescription: entities.shortDescription, entityType: entities.entityType, updatedAt: entities.updatedAt })
    .from(entities)
    .where(eq(entities.publicationStatus, 'published'))
    .orderBy(entities.canonicalName)
}
