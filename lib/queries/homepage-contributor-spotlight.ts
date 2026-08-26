import { and, asc, eq, gte, lt, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  contributorPublicSettings,
  drugs,
  programmeContributionImplementations,
  programmeContributionProposals,
  programmeContributionReviewStates,
  programmeCurrentPublications,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  users,
} from '@/db/schema'
import {
  buildHomepageContributorSpotlight,
  utcPublicationWeek,
  type HomepageContributorImpactRow,
  type HomepageContributorSpotlightView,
} from '@/lib/homepage-contributor-spotlight'
import { publicMedicineDiscoveryFilter } from './drugs'

/**
 * The homepage's weekly recognition read.
 *
 * Eligibility is deliberately narrower than "accepted": the accepted proposal must have an
 * immutable implementation bridge to the verdict revision that is still the programme's current
 * public publication. The verdict must have been published during this UTC week. Notes, drafts,
 * submissions, review decisions, superseded revisions and manually authored publications without
 * a contribution bridge cannot enter this query. The visible use label and use slug come from the
 * immutable publication scope snapshot; a later edit to the mutable programme row cannot rewrite
 * what this published contribution changed.
 */
export async function listHomepageContributorSpotlight(
  now: Date = new Date(),
): Promise<HomepageContributorSpotlightView> {
  const week = utcPublicationWeek(now)
  const rows = await db
    .select({
      contributorId: users.id,
      handle: users.handle,
      proposalKey: programmeContributionProposals.proposalKey,
      programmeId: programmeVerdictScopeSnapshots.programmeId,
      programmeSlug: programmeVerdictScopeSnapshots.slug,
      programmeTitle: programmeVerdictScopeSnapshots.title,
      medicineName: drugs.name,
      medicineSlug: drugs.slug,
      publishedAt: programmeVerdictRevisions.publishedAt,
      appearInWeeklySpotlight: sql<boolean>`coalesce(${contributorPublicSettings.appearInWeeklySpotlight}, true)`,
      showSocialLinksInSpotlight: sql<boolean>`coalesce(${contributorPublicSettings.showSocialLinksInSpotlight}, false)`,
      socialLinks: sql<unknown>`case
        when ${contributorPublicSettings.showSocialLinksInSpotlight} = true
          then ${contributorPublicSettings.socialLinks}
        else '[]'::jsonb
      end`,
    })
    .from(programmeContributionImplementations)
    .innerJoin(
      programmeContributionProposals,
      eq(programmeContributionImplementations.proposalId, programmeContributionProposals.id),
    )
    .innerJoin(
      programmeContributionReviewStates,
      eq(programmeContributionReviewStates.proposalId, programmeContributionProposals.id),
    )
    .innerJoin(
      programmeVerdictRevisions,
      and(
        eq(programmeVerdictRevisions.id, programmeContributionImplementations.verdictRevisionId),
        eq(programmeVerdictRevisions.programmeId, programmeContributionImplementations.programmeId),
      ),
    )
    .innerJoin(
      programmeCurrentPublications,
      and(
        eq(
          programmeCurrentPublications.verdictRevisionId,
          programmeContributionImplementations.verdictRevisionId,
        ),
        eq(
          programmeCurrentPublications.programmeId,
          programmeContributionImplementations.programmeId,
        ),
        eq(programmeCurrentPublications.publishedAt, programmeVerdictRevisions.publishedAt),
      ),
    )
    .innerJoin(
      programmeVerdictScopeSnapshots,
      and(
        eq(
          programmeVerdictScopeSnapshots.verdictRevisionId,
          programmeContributionImplementations.verdictRevisionId,
        ),
        eq(
          programmeVerdictScopeSnapshots.programmeId,
          programmeContributionImplementations.programmeId,
        ),
      ),
    )
    .innerJoin(drugs, eq(drugs.id, programmeVerdictScopeSnapshots.drugId))
    .innerJoin(users, eq(users.id, programmeContributionProposals.authorUserId))
    .leftJoin(
      contributorPublicSettings,
      eq(contributorPublicSettings.userId, programmeContributionProposals.authorUserId),
    )
    .where(
      and(
        publicMedicineDiscoveryFilter,
        eq(programmeContributionProposals.status, 'SUBMITTED'),
        eq(programmeContributionReviewStates.status, 'ACCEPTED_FOR_IMPLEMENTATION'),
        eq(programmeVerdictRevisions.reviewStatus, 'PUBLISHED'),
        gte(programmeVerdictRevisions.publishedAt, week.start),
        lt(programmeVerdictRevisions.publishedAt, week.endExclusive),
        sql<boolean>`coalesce(${contributorPublicSettings.appearInWeeklySpotlight}, true)`,
      ),
    )
    .orderBy(asc(programmeVerdictRevisions.publishedAt), asc(users.handle))

  const impacts = rows.flatMap((row): HomepageContributorImpactRow[] => {
    if (!row.publishedAt) return []
    return [
      {
        ...row,
        publishedAt: row.publishedAt,
      },
    ]
  })

  return buildHomepageContributorSpotlight(impacts, week)
}
