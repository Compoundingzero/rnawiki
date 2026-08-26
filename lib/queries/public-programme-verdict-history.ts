// Public, read-only programme verdict lineage.
//
// This query is intentionally separate from the publication service and the current-dossier read
// model. A history page needs old, superseded conclusions; the live dossier must never do that.
// Conversely, this module must never return drafts, review candidates, or machine-check results
// that have not crossed the publication boundary.

import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  developmentProgrammes,
  drugs,
  programmeCurrentPublications,
  programmeVerdictAdjudications,
  programmeVerdictReviews,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  users,
} from '@/db/schema'
import type {
  EvidenceReviewStatus,
  ProgrammePresentationReadModel,
  ProgrammePresentationSourceReadModel,
  ProgrammeStatus,
  StoppedProgrammeVerdict,
  VerdictConfidence,
  VerdictReviewDecision,
  VerdictReviewerExpertiseTag,
} from '@/lib/evidence/types'
import { getPublicProgrammePresentationForRevision } from '@/lib/queries/programme-presentation'

export type PublicProgrammePresentationSource = ProgrammePresentationSourceReadModel
export type PublicProgrammeVerdictPresentation = ProgrammePresentationReadModel

export const PUBLIC_PROGRAMME_VERDICT_HISTORY_STATUSES = ['PUBLISHED', 'SUPERSEDED'] as const
export type PublicProgrammeVerdictHistoryStatus =
  (typeof PUBLIC_PROGRAMME_VERDICT_HISTORY_STATUSES)[number]

/**
 * Kept as a named guard so the database predicate is not the only public/draft boundary. If a
 * query is broadened during future maintenance, the mapper below still refuses to serialize it.
 */
export function isPublicProgrammeVerdictHistoryStatus(
  status: EvidenceReviewStatus,
): status is PublicProgrammeVerdictHistoryStatus {
  return (PUBLIC_PROGRAMME_VERDICT_HISTORY_STATUSES as readonly string[]).includes(status)
}

export interface PublicProgrammeVerdictReview {
  id: string
  reviewerName: string
  reviewerOrcid: string | null
  expertiseTags: VerdictReviewerExpertiseTag[]
  decision: VerdictReviewDecision
  isIndependent: boolean
  conflictsOfInterest: string | null
  reviewNote: string | null
  reviewedAt: string
}

/**
 * Publication-safe disagreement resolution. The immutable account principal is intentionally
 * absent; public history uses the adjudicator's signed name and ORCID snapshots instead.
 */
export interface PublicProgrammeVerdictAdjudication {
  adjudicatorName: string
  adjudicatorOrcid: string | null
  expertiseTags: VerdictReviewerExpertiseTag[]
  decision: VerdictReviewDecision
  rationale: string
  conflictsOfInterest: string
  adjudicatedAt: string
}

export interface PublicProgrammeVerdictHistoryRevision {
  id: string
  revisionNumber: number
  previousVerdictRevisionId: string | null
  status: PublicProgrammeVerdictHistoryStatus
  isCurrent: boolean
  programmeStatusAtReview: ProgrammeStatus
  verdictCode: StoppedProgrammeVerdict | null
  publicLabel: string
  professionalLabel: string
  scope: {
    indication: string
    population: string
    doseExposure: string
    period: string
    trials: string
    outcome: string
  }
  oneSentenceReason: string
  confidence: VerdictConfidence
  confidenceExplanation: string | null
  authorName: string
  /** Current public profile handle; omitted when only the immutable author-name snapshot remains. */
  authorHandle?: string
  authorConflictsOfInterest: string | null
  engineVersion: string | null
  inputDigestAlgorithm: string
  inputDigest: string | null
  createdAt: string
  reviewedAt: string | null
  publishedAt: string | null
  supersededAt: string | null
  presentation: PublicProgrammeVerdictPresentation | null
  reviews: PublicProgrammeVerdictReview[]
  adjudication: PublicProgrammeVerdictAdjudication | null
}

export interface PublicProgrammeVerdictHistory {
  medicine: {
    slug: string
    name: string
  }
  programme: {
    slug: string
    title: string
    indication: string | null
    targetPopulation: string | null
    status: ProgrammeStatus
  }
  revisions: PublicProgrammeVerdictHistoryRevision[]
}

function optionalIso(value: Date | null): string | null {
  return value?.toISOString() ?? null
}

/**
 * Selects one programme by the medicine and programme slugs in the URL, then returns its public
 * verdict lineage newest-first. Reviewer and adjudicator account ids are deliberately not
 * selected: signed identity snapshots, decisions, rationale, expertise, conflicts and dates are
 * the public record.
 */
export async function getPublicProgrammeVerdictHistory(
  medicineSlug: string,
  programmeSlug: string,
): Promise<PublicProgrammeVerdictHistory | null> {
  const identityRows = await db
    .select({
      medicineSlug: drugs.slug,
      medicineName: drugs.name,
      programmeId: developmentProgrammes.id,
      programmeSlug: sql<string>`case
        when ${programmeCurrentPublications.verdictRevisionId} is not null
          then ${programmeVerdictScopeSnapshots.slug}
        else ${developmentProgrammes.slug}
      end`,
      programmeTitle: sql<string>`case
        when ${programmeCurrentPublications.verdictRevisionId} is not null
          then ${programmeVerdictScopeSnapshots.title}
        else ${developmentProgrammes.title}
      end`,
      programmeIndication: sql<string | null>`case
        when ${programmeCurrentPublications.verdictRevisionId} is not null
          then ${programmeVerdictScopeSnapshots.indication}
        else ${developmentProgrammes.indication}
      end`,
      programmeTargetPopulation: sql<string | null>`case
        when ${programmeCurrentPublications.verdictRevisionId} is not null
          then ${programmeVerdictScopeSnapshots.targetPopulation}
        else ${developmentProgrammes.targetPopulation}
      end`,
      programmeStatus: sql<ProgrammeStatus>`case
        when ${programmeCurrentPublications.verdictRevisionId} is not null
          then ${programmeVerdictScopeSnapshots.status}::text
        else ${developmentProgrammes.status}::text
      end`,
      currentVerdictRevisionId: programmeCurrentPublications.verdictRevisionId,
    })
    .from(developmentProgrammes)
    .leftJoin(
      programmeCurrentPublications,
      eq(programmeCurrentPublications.programmeId, developmentProgrammes.id),
    )
    .leftJoin(
      programmeVerdictScopeSnapshots,
      and(
        eq(
          programmeVerdictScopeSnapshots.verdictRevisionId,
          programmeCurrentPublications.verdictRevisionId,
        ),
        eq(programmeVerdictScopeSnapshots.programmeId, programmeCurrentPublications.programmeId),
      ),
    )
    .innerJoin(
      drugs,
      sql`${drugs.id} = case
        when ${programmeCurrentPublications.verdictRevisionId} is not null
          then ${programmeVerdictScopeSnapshots.drugId}
        else ${developmentProgrammes.drugId}
      end`,
    )
    .where(
      and(
        eq(drugs.slug, medicineSlug),
        sql`case
          when ${programmeCurrentPublications.verdictRevisionId} is not null
            then ${programmeVerdictScopeSnapshots.slug}
          else ${developmentProgrammes.slug}
        end = ${programmeSlug}`,
      ),
    )
    .limit(1)

  const identity = identityRows[0]
  if (!identity) return null

  const selectedRevisionRows = await db
    .select({
      id: programmeVerdictRevisions.id,
      revisionNumber: programmeVerdictRevisions.revisionNumber,
      previousVerdictRevisionId: programmeVerdictRevisions.previousVerdictRevisionId,
      reviewStatus: programmeVerdictRevisions.reviewStatus,
      programmeStatusAtReview: programmeVerdictRevisions.programmeStatusAtReview,
      verdictCode: programmeVerdictRevisions.verdictCode,
      publicLabel: programmeVerdictRevisions.publicLabel,
      professionalLabel: programmeVerdictRevisions.professionalLabel,
      indicationScope: programmeVerdictRevisions.indicationScope,
      populationScope: programmeVerdictRevisions.populationScope,
      doseExposureScope: programmeVerdictRevisions.doseExposureScope,
      periodScope: programmeVerdictRevisions.periodScope,
      trialScope: programmeVerdictRevisions.trialScope,
      outcomeScope: programmeVerdictRevisions.outcomeScope,
      oneSentenceReason: programmeVerdictRevisions.oneSentenceReason,
      confidence: programmeVerdictRevisions.confidence,
      confidenceExplanation: programmeVerdictRevisions.confidenceExplanation,
      authorName: programmeVerdictRevisions.authorName,
      authorHandle: users.handle,
      authorConflictsOfInterest: programmeVerdictRevisions.conflictsOfInterest,
      engineVersion: programmeVerdictRevisions.engineVersion,
      inputDigestAlgorithm: programmeVerdictRevisions.inputDigestAlgorithm,
      inputDigest: programmeVerdictRevisions.inputDigest,
      createdAt: programmeVerdictRevisions.createdAt,
      reviewedAt: programmeVerdictRevisions.reviewedAt,
      publishedAt: programmeVerdictRevisions.publishedAt,
      supersededAt: programmeVerdictRevisions.supersededAt,
    })
    .from(programmeVerdictRevisions)
    .leftJoin(users, eq(users.id, programmeVerdictRevisions.authorUserId))
    .where(
      and(
        eq(programmeVerdictRevisions.programmeId, identity.programmeId),
        inArray(programmeVerdictRevisions.reviewStatus, [
          ...PUBLIC_PROGRAMME_VERDICT_HISTORY_STATUSES,
        ]),
      ),
    )
    .orderBy(
      desc(programmeVerdictRevisions.revisionNumber),
      desc(programmeVerdictRevisions.publishedAt),
      desc(programmeVerdictRevisions.createdAt),
    )

  // Defence in depth: never let a non-public status become serializable merely because a future
  // edit broadens or replaces the SQL predicate above.
  const revisionRows = selectedRevisionRows.filter(
    (
      row,
    ): row is typeof row & {
      reviewStatus: PublicProgrammeVerdictHistoryStatus
    } => isPublicProgrammeVerdictHistoryStatus(row.reviewStatus),
  )
  const revisionIds = revisionRows.map((row) => row.id)

  const reviewRows =
    revisionIds.length === 0
      ? []
      : await db
          .select({
            id: programmeVerdictReviews.id,
            verdictRevisionId: programmeVerdictReviews.verdictRevisionId,
            reviewerName: programmeVerdictReviews.reviewerName,
            reviewerOrcid: programmeVerdictReviews.reviewerOrcidSnapshot,
            expertiseTags: programmeVerdictReviews.expertiseTags,
            decision: programmeVerdictReviews.decision,
            isIndependent: programmeVerdictReviews.isIndependent,
            conflictsOfInterest: programmeVerdictReviews.conflictsOfInterest,
            reviewNote: programmeVerdictReviews.reviewNote,
            reviewedAt: programmeVerdictReviews.reviewedAt,
          })
          .from(programmeVerdictReviews)
          .where(inArray(programmeVerdictReviews.verdictRevisionId, revisionIds))
          .orderBy(asc(programmeVerdictReviews.reviewedAt), asc(programmeVerdictReviews.id))

  // Query only adjudications attached to the already-filtered public lineage. Selecting the
  // signed snapshots field-by-field also makes it impossible for account ids or private workflow
  // fields to appear in the returned object by accident.
  const adjudicationRows =
    revisionIds.length === 0
      ? []
      : await db
          .select({
            verdictRevisionId: programmeVerdictAdjudications.verdictRevisionId,
            adjudicatorName: programmeVerdictAdjudications.adjudicatorNameSnapshot,
            adjudicatorOrcid: programmeVerdictAdjudications.adjudicatorOrcidSnapshot,
            expertiseTags: programmeVerdictAdjudications.expertiseTags,
            decision: programmeVerdictAdjudications.decision,
            rationale: programmeVerdictAdjudications.rationale,
            conflictsOfInterest: programmeVerdictAdjudications.conflictsOfInterest,
            adjudicatedAt: programmeVerdictAdjudications.adjudicatedAt,
          })
          .from(programmeVerdictAdjudications)
          .where(inArray(programmeVerdictAdjudications.verdictRevisionId, revisionIds))
          .orderBy(
            asc(programmeVerdictAdjudications.adjudicatedAt),
            asc(programmeVerdictAdjudications.id),
          )

  const presentationRows = await Promise.all(
    revisionIds.map(async (revisionId) => ({
      revisionId,
      presentation: await getPublicProgrammePresentationForRevision(revisionId),
    })),
  )
  const presentationByRevision = new Map(
    presentationRows.map(({ revisionId, presentation }) => [revisionId, presentation]),
  )

  const reviewsByRevision = new Map<string, PublicProgrammeVerdictReview[]>()
  for (const review of reviewRows) {
    const reviews = reviewsByRevision.get(review.verdictRevisionId) ?? []
    reviews.push({
      id: review.id,
      reviewerName: review.reviewerName,
      reviewerOrcid: review.reviewerOrcid,
      expertiseTags: review.expertiseTags,
      decision: review.decision,
      isIndependent: review.isIndependent,
      conflictsOfInterest: review.conflictsOfInterest,
      reviewNote: review.reviewNote,
      reviewedAt: review.reviewedAt.toISOString(),
    })
    reviewsByRevision.set(review.verdictRevisionId, reviews)
  }

  const adjudicationByRevision = new Map<string, PublicProgrammeVerdictAdjudication>()
  for (const adjudication of adjudicationRows) {
    adjudicationByRevision.set(adjudication.verdictRevisionId, {
      adjudicatorName: adjudication.adjudicatorName,
      adjudicatorOrcid: adjudication.adjudicatorOrcid,
      expertiseTags: adjudication.expertiseTags,
      decision: adjudication.decision,
      rationale: adjudication.rationale,
      conflictsOfInterest: adjudication.conflictsOfInterest,
      adjudicatedAt: adjudication.adjudicatedAt.toISOString(),
    })
  }

  return {
    medicine: {
      slug: identity.medicineSlug,
      name: identity.medicineName,
    },
    programme: {
      slug: identity.programmeSlug,
      title: identity.programmeTitle,
      indication: identity.programmeIndication,
      targetPopulation: identity.programmeTargetPopulation,
      status: identity.programmeStatus,
    },
    revisions: revisionRows.map((row) => ({
      id: row.id,
      revisionNumber: row.revisionNumber,
      previousVerdictRevisionId: row.previousVerdictRevisionId,
      status: row.reviewStatus,
      isCurrent: row.reviewStatus === 'PUBLISHED' && identity.currentVerdictRevisionId === row.id,
      programmeStatusAtReview: row.programmeStatusAtReview,
      verdictCode: row.verdictCode,
      publicLabel: row.publicLabel,
      professionalLabel: row.professionalLabel,
      scope: {
        indication: row.indicationScope,
        population: row.populationScope,
        doseExposure: row.doseExposureScope,
        period: row.periodScope,
        trials: row.trialScope,
        outcome: row.outcomeScope,
      },
      oneSentenceReason: row.oneSentenceReason,
      confidence: row.confidence,
      confidenceExplanation: row.confidenceExplanation,
      authorName: row.authorName,
      ...(row.authorHandle ? { authorHandle: row.authorHandle } : {}),
      authorConflictsOfInterest: row.authorConflictsOfInterest,
      engineVersion: row.engineVersion,
      inputDigestAlgorithm: row.inputDigestAlgorithm,
      inputDigest: row.inputDigest,
      createdAt: row.createdAt.toISOString(),
      reviewedAt: optionalIso(row.reviewedAt),
      publishedAt: optionalIso(row.publishedAt),
      supersededAt: optionalIso(row.supersededAt),
      presentation: (() => {
        const presentation = presentationByRevision.get(row.id)
        return presentation
          ? {
              schemaVersion: presentation.schemaVersion,
              mechanismSteps: presentation.mechanismSteps,
              timelineEvents: presentation.timelineEvents,
            }
          : null
      })(),
      reviews: reviewsByRevision.get(row.id) ?? [],
      adjudication: adjudicationByRevision.get(row.id) ?? null,
    })),
  }
}
