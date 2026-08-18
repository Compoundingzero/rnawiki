import { db } from '@/db'
import { entities, claims, mechanismSteps, claimEvidence, evidenceSources, reviews, regulatoryStatuses, users } from '@/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import type { ProofCardView, MechanismStepView, ClaimEvidenceView } from '@/lib/types'

const PUBLIC_STATUSES = ['published'] as const

export async function getPublishedEntityBySlug(slug: string) {
  const [entity] = await db.select().from(entities).where(eq(entities.slug, slug)).limit(1)
  if (!entity || entity.publicationStatus !== 'published') return null
  return entity
}

export async function getRegulatoryStatusesForEntity(entityId: number) {
  return db
    .select()
    .from(regulatoryStatuses)
    .where(eq(regulatoryStatuses.entityId, entityId))
    .orderBy(desc(regulatoryStatuses.checkedDate))
}

export async function getPublishedClaimsForEntity(entityId: number): Promise<ProofCardView[]> {
  const claimRows = await db
    .select()
    .from(claims)
    .where(and(eq(claims.entityId, entityId), eq(claims.publicationStatus, 'published')))
    .orderBy(claims.displayPriority)

  const [entity] = await db.select({ slug: entities.slug }).from(entities).where(eq(entities.id, entityId)).limit(1)

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
      source: {
        id: row.evidence_sources.id,
        title: row.evidence_sources.title,
        authors: row.evidence_sources.authors,
        publicationYear: row.evidence_sources.publicationYear,
        journalOrIssuer: row.evidence_sources.journalOrIssuer,
        doi: row.evidence_sources.doi,
        pmid: row.evidence_sources.pmid,
        clinicalTrialId: row.evidence_sources.clinicalTrialId,
        regulatoryUrl: row.evidence_sources.regulatoryUrl,
        sourceType: row.evidence_sources.sourceType,
        studyDesign: row.evidence_sources.studyDesign,
        species: row.evidence_sources.species,
        sampleSize: row.evidence_sources.sampleSize,
        endpoint: row.evidence_sources.endpoint,
        retractionStatus: row.evidence_sources.retractionStatus,
      },
    }))

    const [latestReview] = await db
      .select({
        decision: reviews.decision,
        reviewDate: reviews.reviewDate,
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
      lastReviewedAt: claim.lastReviewedAt,
      reviewStatus: claim.publicationStatus,
      review: latestReview
        ? {
            reviewerName: latestReview.reviewerName,
            reviewerCredentials: latestReview.reviewerCredentials,
            decision: latestReview.decision,
            reviewDate: latestReview.reviewDate,
          }
        : null,
    })
  }
  return results
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
