import { and, eq, inArray, isNotNull, sql } from 'drizzle-orm'
import { unionAll } from 'drizzle-orm/pg-core'

import { db } from '@/db'
import {
  claimSourceLinks,
  developmentProgrammes,
  drugs,
  evidenceNodeClaims,
  programmeCurrentPublications,
  programmeVerdictClaims,
  programmeVerdictEvidenceNodes,
  programmeVerdictInterpretabilityAssessments,
  programmeVerdictMechanismStepClaims,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  programmeVerdictTimelineEventClaims,
  programmeVerdictTrialSnapshots,
  trialInterpretabilityClaims,
} from '@/db/schema'
import {
  buildPublicMedicineProjections,
  type PublicMedicineProjection,
  type PublicMedicineProjectionRow,
  type PublicSourceSnapshotBindingRow,
} from '@/lib/public-medicine-projection'
import { cleanPublicLabelFields } from '@/lib/public-data-integrity'
import { extractPatientFriendlyIndication } from '@/scripts/ingest/normalise'

function unique(values: readonly string[]): string[] {
  return [...new Set(values)]
}

/**
 * Every immutable source snapshot reviewed for a set of verdict revisions.
 *
 * The five claim arms mirror the exact reviewed bundle: direct verdict claims, evidence-node
 * claims, interpretability claims, mechanism-stage claims and timeline-event claims. Registry
 * snapshots for the exact scoped trials are loaded alongside that UNION. Query count does not grow
 * with the number of medicines, programmes, claims or presentation rows.
 */
async function getReviewedSnapshotBindings(
  verdictRevisionIds: readonly string[],
): Promise<PublicSourceSnapshotBindingRow[]> {
  const ids = unique(verdictRevisionIds)
  if (ids.length === 0) return []

  const directClaimSnapshots = db
    .select({
      verdictRevisionId: programmeVerdictClaims.verdictRevisionId,
      sourceSnapshotId: claimSourceLinks.sourceSnapshotId,
    })
    .from(programmeVerdictClaims)
    .innerJoin(
      claimSourceLinks,
      and(
        eq(claimSourceLinks.programmeId, programmeVerdictClaims.programmeId),
        eq(claimSourceLinks.claimId, programmeVerdictClaims.claimId),
      ),
    )
    .where(inArray(programmeVerdictClaims.verdictRevisionId, ids))

  const evidenceNodeSnapshots = db
    .select({
      verdictRevisionId: programmeVerdictEvidenceNodes.verdictRevisionId,
      sourceSnapshotId: claimSourceLinks.sourceSnapshotId,
    })
    .from(programmeVerdictEvidenceNodes)
    .innerJoin(
      evidenceNodeClaims,
      and(
        eq(evidenceNodeClaims.programmeId, programmeVerdictEvidenceNodes.programmeId),
        eq(evidenceNodeClaims.evidenceNodeId, programmeVerdictEvidenceNodes.evidenceNodeId),
      ),
    )
    .innerJoin(
      claimSourceLinks,
      and(
        eq(claimSourceLinks.programmeId, evidenceNodeClaims.programmeId),
        eq(claimSourceLinks.claimId, evidenceNodeClaims.claimId),
      ),
    )
    .where(inArray(programmeVerdictEvidenceNodes.verdictRevisionId, ids))

  const interpretabilitySnapshots = db
    .select({
      verdictRevisionId: programmeVerdictInterpretabilityAssessments.verdictRevisionId,
      sourceSnapshotId: claimSourceLinks.sourceSnapshotId,
    })
    .from(programmeVerdictInterpretabilityAssessments)
    .innerJoin(
      trialInterpretabilityClaims,
      and(
        eq(
          trialInterpretabilityClaims.programmeId,
          programmeVerdictInterpretabilityAssessments.programmeId,
        ),
        eq(
          trialInterpretabilityClaims.assessmentId,
          programmeVerdictInterpretabilityAssessments.assessmentId,
        ),
      ),
    )
    .innerJoin(
      claimSourceLinks,
      and(
        eq(claimSourceLinks.programmeId, trialInterpretabilityClaims.programmeId),
        eq(claimSourceLinks.claimId, trialInterpretabilityClaims.claimId),
      ),
    )
    .where(inArray(programmeVerdictInterpretabilityAssessments.verdictRevisionId, ids))

  const mechanismSnapshots = db
    .select({
      verdictRevisionId: programmeVerdictMechanismStepClaims.verdictRevisionId,
      sourceSnapshotId: claimSourceLinks.sourceSnapshotId,
    })
    .from(programmeVerdictMechanismStepClaims)
    .innerJoin(
      claimSourceLinks,
      and(
        eq(claimSourceLinks.programmeId, programmeVerdictMechanismStepClaims.programmeId),
        eq(claimSourceLinks.claimId, programmeVerdictMechanismStepClaims.claimId),
      ),
    )
    .where(inArray(programmeVerdictMechanismStepClaims.verdictRevisionId, ids))

  const timelineSnapshots = db
    .select({
      verdictRevisionId: programmeVerdictTimelineEventClaims.verdictRevisionId,
      sourceSnapshotId: claimSourceLinks.sourceSnapshotId,
    })
    .from(programmeVerdictTimelineEventClaims)
    .innerJoin(
      claimSourceLinks,
      and(
        eq(claimSourceLinks.programmeId, programmeVerdictTimelineEventClaims.programmeId),
        eq(claimSourceLinks.claimId, programmeVerdictTimelineEventClaims.claimId),
      ),
    )
    .where(inArray(programmeVerdictTimelineEventClaims.verdictRevisionId, ids))

  // `isNotNull` is the runtime guard. The cast in the selected SQL shape is unnecessary because
  // this fourth arm stays separate from the three non-null set-operation arms.
  const [claimSnapshots, trialSnapshots] = await Promise.all([
    unionAll(
      directClaimSnapshots,
      evidenceNodeSnapshots,
      interpretabilitySnapshots,
      mechanismSnapshots,
      timelineSnapshots,
    ),
    db
      .select({
        verdictRevisionId: programmeVerdictTrialSnapshots.verdictRevisionId,
        sourceSnapshotId: programmeVerdictTrialSnapshots.registrySnapshotId,
      })
      .from(programmeVerdictTrialSnapshots)
      .where(
        and(
          inArray(programmeVerdictTrialSnapshots.verdictRevisionId, ids),
          isNotNull(programmeVerdictTrialSnapshots.registrySnapshotId),
        ),
      ),
  ])

  const bindings: PublicSourceSnapshotBindingRow[] = [...claimSnapshots]
  for (const row of trialSnapshots) {
    if (row.sourceSnapshotId) {
      bindings.push({
        verdictRevisionId: row.verdictRevisionId,
        sourceSnapshotId: row.sourceSnapshotId,
      })
    }
  }
  return bindings
}

/**
 * Loads the normalized public projection for the requested medicine slugs, or the whole corpus
 * when no slug filter is supplied. The base graph is one query and all snapshot bindings are one
 * fixed-size bulk stage; query count never grows with the number of records.
 */
export async function getPublicMedicineProjections(
  medicineSlugs?: readonly string[],
): Promise<Map<string, PublicMedicineProjection>> {
  const slugs = medicineSlugs ? unique(medicineSlugs) : undefined
  if (slugs?.length === 0) return new Map()

  // Current publications use their captured scope, including medicine ownership. Live programme
  // rows remain the explicit fallback only when no public pointer exists.
  const effectiveProgrammes = db
    .select({
      id: developmentProgrammes.id,
      drugId: sql<string>`case
        when ${programmeCurrentPublications.verdictRevisionId} is not null
          then ${programmeVerdictScopeSnapshots.drugId}
        else ${developmentProgrammes.drugId}
      end`.as('effective_drug_id'),
      slug: sql<string | null>`case
        when ${programmeCurrentPublications.verdictRevisionId} is not null
          then ${programmeVerdictScopeSnapshots.slug}
        else ${developmentProgrammes.slug}
      end`.as('effective_slug'),
      title: sql<string | null>`case
        when ${programmeCurrentPublications.verdictRevisionId} is not null
          then ${programmeVerdictScopeSnapshots.title}
        else ${developmentProgrammes.title}
      end`.as('effective_title'),
      indication: sql<string | null>`case
        when ${programmeCurrentPublications.verdictRevisionId} is not null
          then ${programmeVerdictScopeSnapshots.indication}
        else ${developmentProgrammes.indication}
      end`.as('effective_indication'),
      targetPopulation: sql<string | null>`case
        when ${programmeCurrentPublications.verdictRevisionId} is not null
          then ${programmeVerdictScopeSnapshots.targetPopulation}
        else ${developmentProgrammes.targetPopulation}
      end`.as('effective_target_population'),
      status: sql<string | null>`case
        when ${programmeCurrentPublications.verdictRevisionId} is not null
          then ${programmeVerdictScopeSnapshots.status}::text
        else ${developmentProgrammes.status}::text
      end`.as('effective_status'),
      currentVerdictRevisionId: programmeCurrentPublications.verdictRevisionId,
      currentPublicationPublishedAt: programmeCurrentPublications.publishedAt,
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
        eq(programmeVerdictScopeSnapshots.programmeId, developmentProgrammes.id),
      ),
    )
    .as('effective_programmes')

  const baseQuery = db
    .select({
      medicineSlug: drugs.slug,
      medicinePatientFriendlyIndication: drugs.patientFriendlyIndication,
      medicineIndication: drugs.indication,
      programmeId: effectiveProgrammes.id,
      programmeSlug: effectiveProgrammes.slug,
      programmeTitle: effectiveProgrammes.title,
      programmeIndication: effectiveProgrammes.indication,
      programmeTargetPopulation: effectiveProgrammes.targetPopulation,
      programmeStatus: effectiveProgrammes.status,
      currentVerdictRevisionId: effectiveProgrammes.currentVerdictRevisionId,
      currentPublicationPublishedAt: effectiveProgrammes.currentPublicationPublishedAt,
      verdictRevisionId: programmeVerdictRevisions.id,
      verdictRevisionNumber: programmeVerdictRevisions.revisionNumber,
      verdictReviewStatus: programmeVerdictRevisions.reviewStatus,
      verdictPublicLabel: programmeVerdictRevisions.publicLabel,
      verdictOneSentenceReason: programmeVerdictRevisions.oneSentenceReason,
      verdictIndicationScope: programmeVerdictRevisions.indicationScope,
      verdictPopulationScope: programmeVerdictRevisions.populationScope,
      verdictTrialScope: programmeVerdictRevisions.trialScope,
      verdictOutcomeScope: programmeVerdictRevisions.outcomeScope,
      verdictConfidence: programmeVerdictRevisions.confidence,
      verdictEngineVersion: programmeVerdictRevisions.engineVersion,
      verdictInputDigestAlgorithm: programmeVerdictRevisions.inputDigestAlgorithm,
      verdictInputDigest: programmeVerdictRevisions.inputDigest,
      verdictProposalDigestAlgorithm: programmeVerdictRevisions.proposalDigestAlgorithm,
      verdictProposalDigest: programmeVerdictRevisions.proposalDigest,
    })
    .from(drugs)
    .leftJoin(effectiveProgrammes, eq(effectiveProgrammes.drugId, drugs.id))
    .leftJoin(
      programmeVerdictRevisions,
      and(
        eq(programmeVerdictRevisions.id, effectiveProgrammes.currentVerdictRevisionId),
        eq(programmeVerdictRevisions.programmeId, effectiveProgrammes.id),
        eq(programmeVerdictRevisions.reviewStatus, 'PUBLISHED'),
      ),
    )

  const rows = (
    slugs ? await baseQuery.where(inArray(drugs.slug, slugs)) : await baseQuery
  ) as PublicMedicineProjectionRow[]

  const publicRows = rows.map((row) => {
    const cleaned = cleanPublicLabelFields({
      medicineSlug: row.medicineSlug,
      indication: row.medicineIndication,
      patientFriendlyIndication: row.medicinePatientFriendlyIndication,
    })
    return {
      ...row,
      medicineIndication: cleaned.indication,
      medicinePatientFriendlyIndication:
        !cleaned.patientFriendlyIndication && row.medicinePatientFriendlyIndication.trim()
          ? extractPatientFriendlyIndication(cleaned.indication)
          : cleaned.patientFriendlyIndication,
    }
  })

  const verdictRevisionIds = publicRows.flatMap((row) =>
    row.verdictRevisionId ? [row.verdictRevisionId] : [],
  )
  const snapshotBindings = await getReviewedSnapshotBindings(verdictRevisionIds)

  return buildPublicMedicineProjections(publicRows, snapshotBindings)
}
