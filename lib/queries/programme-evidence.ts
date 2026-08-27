// Server-side public read model for programme evidence. Pages and APIs consume this projection so
// they never assemble source/claim/node/verdict lineage themselves or inspect draft rows.

import { and, asc, eq, inArray, isNull, or, sql } from 'drizzle-orm'
import { db } from '@/db'
import {
  claimSourceLinks,
  claims,
  developmentProgrammes,
  drugs,
  evidenceNodeClaims,
  evidenceNodes,
  evidenceSources,
  programmeCurrentPublications,
  programmeDependencies,
  programmeFreshnessStates,
  programmeVerdictClaims,
  programmeVerdictEvidenceNodes,
  programmeVerdictInterpretabilityAssessments,
  programmeVerdictReviews,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  programmeVerdictSourceMetadataSnapshots,
  programmeVerdictTrialSnapshots,
  programmeVerdictTrials,
  sourceSnapshots,
  trialInterpretabilityAssessments,
  trialInterpretabilityClaims,
  users,
} from '@/db/schema'
import type {
  EvidenceSourceSnapshotReadModel,
  ProgrammeDependencyReadModel,
  ProgrammeEvidenceReadModel,
  ProgrammeFreshnessReadModel,
  ProgrammeSelectorItem,
  ProgrammeSummaryFieldDependencyReadModel,
  ProgrammeSummaryFieldPath,
  ProgrammeTrialReadModel,
  ProgrammeVerdictReviewReadModel,
  PublishedClaimReadModel,
  PublishedEvidenceNodeReadModel,
  PublishedProgrammeVerdictReadModel,
} from '@/lib/evidence/types'
import { PROGRAMME_SUMMARY_FIELD_PATHS } from '@/lib/evidence/types'
import { getPublicProgrammePresentationForRevision } from '@/lib/queries/programme-presentation'
import { countDistinctIndependentReviewers } from '@/lib/seo/indexability'

function iso(value: Date | null): string | null {
  return value?.toISOString() ?? null
}

function requiredIso(value: Date | null, field: string): string {
  if (!value) throw new Error(`Published evidence row is missing ${field}.`)
  return value.toISOString()
}

function requiredText(value: string | null, field: string): string {
  if (!value?.trim()) throw new Error(`Published evidence row is missing ${field}.`)
  return value
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort()
}

/**
 * An explicit programme selector is authoritative. Callers use this check to distinguish a
 * medicine with no normalized programmes from a mistyped or stale programme URL; the latter must
 * never fall back to medicine-wide legacy prose.
 */
export function programmeReferenceExists(
  model: Pick<ProgrammeEvidenceReadModel, 'programmes'>,
  programmeRef: string | null | undefined,
): boolean {
  if (!programmeRef) return true
  return model.programmes.some(
    (programme) => programme.id === programmeRef || programme.slug === programmeRef,
  )
}

/**
 * Returns only the current PUBLISHED rows for a medicine. A legacy medicine with no programme is
 * still a successful read with `selectedProgramme: null`, so introducing this model cannot break
 * existing dossier routes while programmes are populated from identified sources.
 */
export async function getProgrammeEvidenceByMedicineSlug(
  medicineSlug: string,
  programmeRef?: string | null,
): Promise<ProgrammeEvidenceReadModel | null> {
  const medicineRows = await db
    .select({ id: drugs.id, slug: drugs.slug, name: drugs.name, modality: drugs.modality })
    .from(drugs)
    .where(eq(drugs.slug, medicineSlug))
    .limit(1)
  const medicine = medicineRows[0]
  if (!medicine) return null

  const rawProgrammeRows = await db
    .select({
      live: developmentProgrammes,
      reviewedScope: programmeVerdictScopeSnapshots,
      currentVerdictRevisionId: programmeCurrentPublications.verdictRevisionId,
      publishedBestSupportedFinding: programmeVerdictRevisions.bestSupportedFinding,
      publishedPublicLabel: programmeVerdictRevisions.publicLabel,
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
    .leftJoin(
      programmeVerdictRevisions,
      eq(programmeVerdictRevisions.id, programmeCurrentPublications.verdictRevisionId),
    )
    .where(
      or(
        and(
          isNull(programmeCurrentPublications.verdictRevisionId),
          eq(developmentProgrammes.drugId, medicine.id),
        ),
        eq(programmeVerdictScopeSnapshots.drugId, medicine.id),
      ),
    )
    .orderBy(
      // PostgreSQL sorts NULL values first for DESC by default. Without NULLS LAST, adding any
      // unpublished programme can silently replace a medicine's reviewed default answer and make
      // the canonical route disagree with the sitemap's eligibility decision.
      sql`${programmeCurrentPublications.publishedAt} desc nulls last`,
      // A stable identity is the final tie-break everywhere. Titles are mutable staging content and
      // database/JavaScript collations can order reviewed Unicode titles differently.
      sql`${developmentProgrammes.id} collate "C" asc`,
    )
  const programmeRows = rawProgrammeRows.map(({ live, reviewedScope, ...publication }) => ({
    ...live,
    ...(reviewedScope
      ? {
          drugId: reviewedScope.drugId,
          slug: reviewedScope.slug,
          title: reviewedScope.title,
          indication: reviewedScope.indication,
          targetPopulation: reviewedScope.targetPopulation,
          jurisdiction: reviewedScope.jurisdiction,
          sponsor: reviewedScope.sponsor,
          partners: reviewedScope.partners,
          status: reviewedScope.status,
          highestPhaseReached: reviewedScope.highestPhaseReached,
          route: reviewedScope.route,
          doseExposureContext: reviewedScope.doseExposureContext,
          startDate: reviewedScope.startDate,
          endDate: reviewedScope.endDate,
          rawStoppingReason: reviewedScope.rawStoppingReason,
          stoppingReasonCategory: reviewedScope.stoppingReasonCategory,
        }
      : {}),
    ...publication,
  }))

  const programmes: ProgrammeSelectorItem[] = programmeRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    indication: row.indication,
    targetPopulation: row.targetPopulation,
    status: row.status,
    updateStatus: row.updateStatus,
    hasPublishedVerdict: row.currentVerdictRevisionId !== null,
    publishedBestSupportedFinding:
      row.currentVerdictRevisionId !== null ? row.publishedBestSupportedFinding : null,
    publishedPublicLabel: row.currentVerdictRevisionId !== null ? row.publishedPublicLabel : null,
  }))

  const selected = programmeRef
    ? programmeRows.find((row) => row.id === programmeRef || row.slug === programmeRef)
    : programmeRows[0]

  const base: ProgrammeEvidenceReadModel = {
    medicine: {
      id: medicine.id,
      slug: medicine.slug,
      name: medicine.name,
      modality: medicine.modality,
    },
    programmes,
    selectedProgramme: null,
  }
  if (!selected) return base

  const [verdictRows, freshnessRows] = await Promise.all([
    db
      .select({ verdict: programmeVerdictRevisions, authorHandle: users.handle })
      .from(programmeCurrentPublications)
      .innerJoin(
        programmeVerdictRevisions,
        and(
          eq(programmeVerdictRevisions.id, programmeCurrentPublications.verdictRevisionId),
          eq(programmeVerdictRevisions.programmeId, programmeCurrentPublications.programmeId),
        ),
      )
      .leftJoin(users, eq(users.id, programmeVerdictRevisions.authorUserId))
      .where(
        and(
          eq(programmeCurrentPublications.programmeId, selected.id),
          eq(programmeVerdictRevisions.reviewStatus, 'PUBLISHED'),
        ),
      )
      .limit(1),
    db
      .select({
        state: programmeFreshnessStates,
        sourceTitle: evidenceSources.title,
        sourceType: evidenceSources.sourceType,
      })
      .from(programmeFreshnessStates)
      .innerJoin(evidenceSources, eq(evidenceSources.id, programmeFreshnessStates.sourceId))
      .where(eq(programmeFreshnessStates.programmeId, selected.id))
      .orderBy(asc(evidenceSources.title), asc(evidenceSources.id)),
  ])
  const verdictRow = verdictRows[0]?.verdict ?? null
  const verdictAuthorHandle = verdictRows[0]?.authorHandle ?? null
  const publicPresentation = verdictRow
    ? await getPublicProgrammePresentationForRevision(verdictRow.id)
    : null

  const [
    verdictClaimRows,
    verdictReviewRows,
    trialBundleRows,
    nodeBundleRows,
    assessmentBundleRows,
    summaryDependencyRows,
  ] = await Promise.all([
    verdictRow
      ? db
          .select({
            claimId: programmeVerdictClaims.claimId,
            relationship: programmeVerdictClaims.relationship,
          })
          .from(programmeVerdictClaims)
          .where(eq(programmeVerdictClaims.verdictRevisionId, verdictRow.id))
          .orderBy(asc(programmeVerdictClaims.claimId), asc(programmeVerdictClaims.relationship))
      : Promise.resolve([]),
    verdictRow
      ? db
          .select()
          .from(programmeVerdictReviews)
          .where(eq(programmeVerdictReviews.verdictRevisionId, verdictRow.id))
          .orderBy(asc(programmeVerdictReviews.reviewedAt), asc(programmeVerdictReviews.id))
      : Promise.resolve([]),
    verdictRow
      ? db
          .select({ trialId: programmeVerdictTrials.programmeTrialId })
          .from(programmeVerdictTrials)
          .where(eq(programmeVerdictTrials.verdictRevisionId, verdictRow.id))
          .orderBy(asc(programmeVerdictTrials.programmeTrialId))
      : Promise.resolve([]),
    verdictRow
      ? db
          .select({ nodeId: programmeVerdictEvidenceNodes.evidenceNodeId })
          .from(programmeVerdictEvidenceNodes)
          .where(eq(programmeVerdictEvidenceNodes.verdictRevisionId, verdictRow.id))
          .orderBy(asc(programmeVerdictEvidenceNodes.evidenceNodeId))
      : Promise.resolve([]),
    verdictRow
      ? db
          .select({ assessmentId: programmeVerdictInterpretabilityAssessments.assessmentId })
          .from(programmeVerdictInterpretabilityAssessments)
          .where(eq(programmeVerdictInterpretabilityAssessments.verdictRevisionId, verdictRow.id))
          .orderBy(asc(programmeVerdictInterpretabilityAssessments.assessmentId))
      : Promise.resolve([]),
    verdictRow
      ? db
          .select({
            id: programmeDependencies.id,
            programmeId: programmeDependencies.programmeId,
            claimId: programmeDependencies.claimId,
            dependentSurfaceType: programmeDependencies.dependentSurfaceType,
            evidenceNodeId: programmeDependencies.evidenceNodeId,
            verdictRevisionId: programmeDependencies.verdictRevisionId,
            fieldPath: programmeDependencies.fieldPath,
            impactLevel: programmeDependencies.impactLevel,
          })
          .from(programmeDependencies)
          .where(
            and(
              eq(programmeDependencies.programmeId, selected.id),
              eq(programmeDependencies.dependentSurfaceType, 'PROGRAMME_SUMMARY'),
              eq(programmeDependencies.verdictRevisionId, verdictRow.id),
            ),
          )
          .orderBy(asc(programmeDependencies.fieldPath), asc(programmeDependencies.claimId))
      : Promise.resolve([]),
  ])

  const isProgrammeSummaryFieldPath = (value: string): value is ProgrammeSummaryFieldPath =>
    (PROGRAMME_SUMMARY_FIELD_PATHS as readonly string[]).includes(value)
  const summaryFieldDependencies: ProgrammeSummaryFieldDependencyReadModel[] =
    summaryDependencyRows.map((row) => {
      if (
        !verdictRow ||
        row.dependentSurfaceType !== 'PROGRAMME_SUMMARY' ||
        row.evidenceNodeId !== null ||
        row.verdictRevisionId !== verdictRow.id ||
        !isProgrammeSummaryFieldPath(row.fieldPath)
      ) {
        throw new Error('The current programme summary contains an invalid claim dependency.')
      }
      return {
        ...row,
        dependentSurfaceType: 'PROGRAMME_SUMMARY',
        evidenceNodeId: null,
        verdictRevisionId: verdictRow.id,
        fieldPath: row.fieldPath,
      }
    })

  const trialIds = trialBundleRows.map((row) => row.trialId)
  const nodeIds = nodeBundleRows.map((row) => row.nodeId)
  const interpretabilityIds = assessmentBundleRows.map((row) => row.assessmentId)
  const [nodeLinkRows, interpretabilityLinkRows] = await Promise.all([
    nodeIds.length === 0
      ? Promise.resolve([])
      : db
          .select({
            evidenceNodeId: evidenceNodeClaims.evidenceNodeId,
            claimId: evidenceNodeClaims.claimId,
            relationship: evidenceNodeClaims.relationship,
          })
          .from(evidenceNodeClaims)
          .where(
            and(
              eq(evidenceNodeClaims.programmeId, selected.id),
              inArray(evidenceNodeClaims.evidenceNodeId, nodeIds),
            ),
          )
          .orderBy(asc(evidenceNodeClaims.evidenceNodeId), asc(evidenceNodeClaims.claimId)),
    interpretabilityIds.length === 0
      ? Promise.resolve([])
      : db
          .select({
            assessmentId: trialInterpretabilityClaims.assessmentId,
            claimId: trialInterpretabilityClaims.claimId,
            relationship: trialInterpretabilityClaims.relationship,
          })
          .from(trialInterpretabilityClaims)
          .where(
            and(
              eq(trialInterpretabilityClaims.programmeId, selected.id),
              inArray(trialInterpretabilityClaims.assessmentId, interpretabilityIds),
            ),
          )
          .orderBy(
            asc(trialInterpretabilityClaims.assessmentId),
            asc(trialInterpretabilityClaims.claimId),
          ),
  ])

  const claimIds = uniqueSorted([
    ...verdictClaimRows.map((row) => row.claimId),
    ...summaryFieldDependencies.map((row) => row.claimId),
    ...nodeLinkRows.map((row) => row.claimId),
    ...interpretabilityLinkRows.map((row) => row.claimId),
    ...(publicPresentation?.mechanismSteps.flatMap((step) =>
      step.claimLinks.map((link) => link.claimId),
    ) ?? []),
    ...(publicPresentation?.timelineEvents.flatMap((event) =>
      event.claimLinks.map((link) => link.claimId),
    ) ?? []),
  ])

  const [claimRows, nodeRows, interpretabilityRows, trialRows] = await Promise.all([
    claimIds.length === 0
      ? Promise.resolve([])
      : db
          .select()
          .from(claims)
          .where(and(eq(claims.programmeId, selected.id), inArray(claims.id, claimIds)))
          .orderBy(asc(claims.claimKey), asc(claims.revisionNumber)),
    nodeIds.length === 0
      ? Promise.resolve([])
      : db
          .select()
          .from(evidenceNodes)
          .where(
            and(eq(evidenceNodes.programmeId, selected.id), inArray(evidenceNodes.id, nodeIds)),
          )
          .orderBy(asc(evidenceNodes.nodeType)),
    interpretabilityIds.length === 0
      ? Promise.resolve([])
      : db
          .select()
          .from(trialInterpretabilityAssessments)
          .where(
            and(
              eq(trialInterpretabilityAssessments.programmeId, selected.id),
              inArray(trialInterpretabilityAssessments.id, interpretabilityIds),
            ),
          )
          .orderBy(
            asc(trialInterpretabilityAssessments.programmeTrialId),
            asc(trialInterpretabilityAssessments.criterion),
          ),
    trialIds.length === 0
      ? Promise.resolve([])
      : db
          .select({
            trial: programmeVerdictTrialSnapshots,
            registrySourceType: programmeVerdictSourceMetadataSnapshots.sourceType,
            registryExternalIdentifier: programmeVerdictSourceMetadataSnapshots.externalIdentifier,
            registryCanonicalLocator: programmeVerdictSourceMetadataSnapshots.canonicalLocator,
            registrySourceTitle: programmeVerdictSourceMetadataSnapshots.title,
            snapshotContentHash: sourceSnapshots.contentHash,
            snapshotRetrievedAt: sourceSnapshots.retrievedAt,
            snapshotLastVerifiedAt: sourceSnapshots.lastVerifiedAt,
          })
          .from(programmeVerdictTrialSnapshots)
          .leftJoin(
            programmeVerdictSourceMetadataSnapshots,
            and(
              eq(programmeVerdictSourceMetadataSnapshots.verdictRevisionId, verdictRow!.id),
              eq(
                programmeVerdictSourceMetadataSnapshots.sourceId,
                programmeVerdictTrialSnapshots.registrySourceId,
              ),
            ),
          )
          .leftJoin(
            sourceSnapshots,
            eq(sourceSnapshots.id, programmeVerdictTrialSnapshots.registrySnapshotId),
          )
          .where(
            and(
              eq(programmeVerdictTrialSnapshots.verdictRevisionId, verdictRow!.id),
              eq(programmeVerdictTrialSnapshots.programmeId, selected.id),
              inArray(programmeVerdictTrialSnapshots.programmeTrialId, trialIds),
            ),
          )
          .orderBy(
            asc(programmeVerdictTrialSnapshots.trialIdentifier),
            asc(programmeVerdictTrialSnapshots.programmeTrialId),
          ),
  ])

  if (
    claimRows.length !== claimIds.length ||
    claimRows.some((row) => row.reviewStatus !== 'PUBLISHED') ||
    nodeRows.length !== nodeIds.length ||
    nodeRows.some((row) => row.reviewStatus !== 'PUBLISHED') ||
    interpretabilityRows.length !== interpretabilityIds.length ||
    interpretabilityRows.some((row) => row.reviewStatus !== 'PUBLISHED') ||
    trialRows.length !== trialIds.length
  ) {
    throw new Error('The authoritative programme publication references an incomplete bundle.')
  }

  const sourceLinkRows =
    claimIds.length === 0
      ? []
      : await db
          .select({
            claimId: claimSourceLinks.claimId,
            relationship: claimSourceLinks.relationship,
            sourceLocator: claimSourceLinks.sourceLocator,
            snapshotId: sourceSnapshots.id,
            sourceId: programmeVerdictSourceMetadataSnapshots.sourceId,
            sourceType: programmeVerdictSourceMetadataSnapshots.sourceType,
            externalIdentifier: programmeVerdictSourceMetadataSnapshots.externalIdentifier,
            canonicalLocator: programmeVerdictSourceMetadataSnapshots.canonicalLocator,
            title: programmeVerdictSourceMetadataSnapshots.title,
            publisher: programmeVerdictSourceMetadataSnapshots.publisher,
            publicationDate: programmeVerdictSourceMetadataSnapshots.publicationDate,
            correctionStatus: programmeVerdictSourceMetadataSnapshots.correctionStatus,
            hierarchy: programmeVerdictSourceMetadataSnapshots.hierarchy,
            retrievedAt: sourceSnapshots.retrievedAt,
            sourcePublishedAt: sourceSnapshots.sourcePublishedAt,
            lastVerifiedAt: sourceSnapshots.lastVerifiedAt,
            contentHash: sourceSnapshots.contentHash,
          })
          .from(claimSourceLinks)
          .innerJoin(sourceSnapshots, eq(sourceSnapshots.id, claimSourceLinks.sourceSnapshotId))
          .innerJoin(
            programmeVerdictSourceMetadataSnapshots,
            and(
              eq(programmeVerdictSourceMetadataSnapshots.verdictRevisionId, verdictRow!.id),
              eq(programmeVerdictSourceMetadataSnapshots.sourceId, sourceSnapshots.sourceId),
            ),
          )
          .where(
            and(
              eq(claimSourceLinks.programmeId, selected.id),
              inArray(claimSourceLinks.claimId, claimIds),
            ),
          )
          .orderBy(asc(claimSourceLinks.claimId), asc(sourceSnapshots.retrievedAt))

  const reviewedSourceMetadataRows = verdictRow
    ? await db
        .select()
        .from(programmeVerdictSourceMetadataSnapshots)
        .where(eq(programmeVerdictSourceMetadataSnapshots.verdictRevisionId, verdictRow.id))
        .orderBy(asc(programmeVerdictSourceMetadataSnapshots.sourceId))
    : []
  const reviewedSourceMetadataById = new Map(
    reviewedSourceMetadataRows.map((row) => [row.sourceId, row]),
  )

  const sourcesByClaim = new Map<string, EvidenceSourceSnapshotReadModel[]>()
  for (const row of sourceLinkRows) {
    const sources = sourcesByClaim.get(row.claimId) ?? []
    sources.push({
      id: row.snapshotId,
      sourceId: row.sourceId,
      sourceType: row.sourceType,
      externalIdentifier: row.externalIdentifier,
      canonicalLocator: row.canonicalLocator,
      title: row.title,
      publisher: row.publisher,
      publicationDate: row.publicationDate,
      correctionStatus: row.correctionStatus,
      hierarchy: row.hierarchy,
      retrievedAt: row.retrievedAt.toISOString(),
      sourcePublishedAt: iso(row.sourcePublishedAt),
      lastVerifiedAt: iso(row.lastVerifiedAt),
      contentHash: row.contentHash,
      sourceLocator: row.sourceLocator,
      relationship: row.relationship,
    })
    sourcesByClaim.set(row.claimId, sources)
  }

  const trialIdentifierById = new Map(
    trialRows.map(({ trial }) => [trial.programmeTrialId, trial.trialIdentifier] as const),
  )

  const publishedClaims: PublishedClaimReadModel[] = claimRows.map((row) => ({
    id: row.id,
    claimKey: row.claimKey,
    revisionNumber: row.revisionNumber,
    programmeTrialId: row.programmeTrialId,
    trialIdentifier: row.programmeTrialId
      ? (trialIdentifierById.get(row.programmeTrialId) ?? null)
      : null,
    evidenceNodeType: row.evidenceNodeType,
    nature: row.nature,
    plainLanguageText: row.plainLanguageText,
    technicalText: row.technicalText,
    population: row.population,
    intervention: row.intervention,
    comparator: row.comparator,
    dose: row.dose,
    route: row.route,
    duration: row.duration,
    endpoint: row.endpoint,
    endpointHierarchy: row.endpointHierarchy,
    outcomeType: row.outcomeType,
    numericValue: row.numericValue,
    numericUnit: row.numericUnit,
    comparatorValue: row.comparatorValue,
    comparatorGroup: row.comparatorGroup,
    uncertaintyInterval: row.uncertaintyInterval,
    direction: row.direction,
    timepoint: row.timepoint,
    reviewerInterpretation: row.reviewerInterpretation,
    lastVerifiedAt: iso(row.lastVerifiedAt),
    publishedAt: requiredIso(row.publishedAt, 'claims.published_at'),
    sources: sourcesByClaim.get(row.id) ?? [],
  }))

  const nodeClaims = new Map<
    string,
    { supporting: string[]; contradicting: string[]; qualifying: string[] }
  >()
  for (const row of nodeLinkRows) {
    const links = nodeClaims.get(row.evidenceNodeId) ?? {
      supporting: [],
      contradicting: [],
      qualifying: [],
    }
    if (row.relationship === 'SUPPORTS') links.supporting.push(row.claimId)
    else if (row.relationship === 'CONTRADICTS') links.contradicting.push(row.claimId)
    else links.qualifying.push(row.claimId)
    nodeClaims.set(row.evidenceNodeId, links)
  }

  const publishedNodes: PublishedEvidenceNodeReadModel[] = nodeRows.map((row) => {
    const links = nodeClaims.get(row.id) ?? {
      supporting: [],
      contradicting: [],
      qualifying: [],
    }
    return {
      id: row.id,
      nodeType: row.nodeType,
      revisionNumber: row.revisionNumber,
      state: row.state,
      plainSummary: row.plainSummary,
      professionalSummary: row.professionalSummary,
      rationale: row.rationale,
      lastVerifiedAt: iso(row.lastVerifiedAt),
      publishedAt: requiredIso(row.publishedAt, 'evidence_nodes.published_at'),
      supportingClaimIds: links.supporting,
      contradictingClaimIds: links.contradicting,
      qualifyingClaimIds: links.qualifying,
    }
  })

  const assessmentClaims = new Map<
    string,
    { supporting: string[]; contradicting: string[]; qualifying: string[] }
  >()
  for (const row of interpretabilityLinkRows) {
    const links = assessmentClaims.get(row.assessmentId) ?? {
      supporting: [],
      contradicting: [],
      qualifying: [],
    }
    if (row.relationship === 'SUPPORTS') links.supporting.push(row.claimId)
    else if (row.relationship === 'CONTRADICTS') links.contradicting.push(row.claimId)
    else links.qualifying.push(row.claimId)
    assessmentClaims.set(row.assessmentId, links)
  }

  const interpretabilityByTrial = new Map<string, ProgrammeTrialReadModel['interpretability']>()
  for (const row of interpretabilityRows) {
    const links = assessmentClaims.get(row.id) ?? {
      supporting: [],
      contradicting: [],
      qualifying: [],
    }
    const assessments = interpretabilityByTrial.get(row.programmeTrialId) ?? []
    assessments.push({
      id: row.id,
      criterion: row.criterion,
      state: row.state,
      revisionNumber: row.revisionNumber,
      explanation: row.explanation,
      lastVerifiedAt: iso(row.lastVerifiedAt),
      publishedAt: requiredIso(row.publishedAt, 'trial_interpretability_assessments.published_at'),
      supportingClaimIds: links.supporting,
      contradictingClaimIds: links.contradicting,
      qualifyingClaimIds: links.qualifying,
    })
    interpretabilityByTrial.set(row.programmeTrialId, assessments)
  }

  const trials: ProgrammeTrialReadModel[] = trialRows.map((row) => {
    const trial = row.trial
    const hasRegistrySnapshot =
      trial.registrySourceId !== null &&
      trial.registrySnapshotId !== null &&
      row.registrySourceType !== null &&
      row.registryCanonicalLocator !== null &&
      row.snapshotContentHash !== null &&
      row.snapshotRetrievedAt !== null

    return {
      id: trial.programmeTrialId,
      trialIdentifier: trial.trialIdentifier,
      title: trial.title,
      phase: trial.phase,
      status: trial.status,
      enrolment: trial.enrolment,
      enrolmentType: trial.enrolmentType,
      startDate: trial.startDate,
      primaryCompletionDate: trial.primaryCompletionDate,
      completionDate: trial.completionDate,
      humanStudyStatus: trial.humanStudyStatus,
      lastVerifiedAt: iso(trial.lastVerifiedAt),
      registrySnapshot: hasRegistrySnapshot
        ? {
            sourceId: trial.registrySourceId!,
            sourceType: row.registrySourceType!,
            externalIdentifier: row.registryExternalIdentifier,
            canonicalLocator: row.registryCanonicalLocator!,
            sourceTitle: row.registrySourceTitle,
            snapshotId: trial.registrySnapshotId!,
            contentHash: row.snapshotContentHash!,
            retrievedAt: row.snapshotRetrievedAt!.toISOString(),
            lastVerifiedAt: iso(row.snapshotLastVerifiedAt),
          }
        : null,
      interpretability: interpretabilityByTrial.get(trial.programmeTrialId) ?? [],
    }
  })

  const reviewers: ProgrammeVerdictReviewReadModel[] = verdictReviewRows.map((row) => ({
    id: row.id,
    reviewerName: row.reviewerName,
    reviewerOrcidSnapshot: row.reviewerOrcidSnapshot,
    expertiseTags: row.expertiseTags,
    decision: row.decision,
    isIndependent: row.isIndependent,
    conflictsOfInterest: row.conflictsOfInterest,
    reviewNote: row.reviewNote,
    reviewedAt: row.reviewedAt.toISOString(),
  }))
  const independentReviewCount = countDistinctIndependentReviewers(verdictReviewRows)

  const verdict: PublishedProgrammeVerdictReadModel | null = verdictRow
    ? {
        id: verdictRow.id,
        revisionNumber: verdictRow.revisionNumber,
        programmeStatusAtReview: verdictRow.programmeStatusAtReview,
        verdictCode: verdictRow.verdictCode,
        publicLabel: verdictRow.publicLabel,
        professionalLabel: verdictRow.professionalLabel,
        indicationScope: verdictRow.indicationScope,
        populationScope: verdictRow.populationScope,
        doseExposureScope: verdictRow.doseExposureScope,
        periodScope: verdictRow.periodScope,
        trialScope: verdictRow.trialScope,
        outcomeScope: verdictRow.outcomeScope,
        plainMechanism: requiredText(
          verdictRow.plainMechanism,
          'programme_verdict_revisions.plain_mechanism',
        ),
        bestSupportedFinding: requiredText(
          verdictRow.bestSupportedFinding,
          'programme_verdict_revisions.best_supported_finding',
        ),
        mainLimitation: requiredText(
          verdictRow.mainLimitation,
          'programme_verdict_revisions.main_limitation',
        ),
        oneSentenceReason: verdictRow.oneSentenceReason,
        whatWasDisproven: verdictRow.whatWasDisproven,
        whatWasNotDisproven: verdictRow.whatWasNotDisproven,
        whatRemainsUnknown: verdictRow.whatRemainsUnknown,
        confidence: verdictRow.confidence,
        confidenceExplanation: verdictRow.confidenceExplanation,
        conditionsThatWouldChangeVerdict: verdictRow.conditionsThatWouldChangeVerdict,
        authorName: verdictRow.authorName,
        ...(verdictAuthorHandle ? { authorHandle: verdictAuthorHandle } : {}),
        conflictsOfInterest: verdictRow.conflictsOfInterest,
        engineVersion: requiredText(
          verdictRow.engineVersion,
          'programme_verdict_revisions.engine_version',
        ),
        inputDigestAlgorithm: verdictRow.inputDigestAlgorithm,
        inputDigest: requiredText(
          verdictRow.inputDigest,
          'programme_verdict_revisions.input_digest',
        ),
        reviewedAt: requiredIso(verdictRow.reviewedAt, 'programme_verdict_revisions.reviewed_at'),
        publishedAt: requiredIso(
          verdictRow.publishedAt,
          'programme_verdict_revisions.published_at',
        ),
        independentReviewCount,
        reviewers,
        claimRelationships: verdictClaimRows.map((row) => ({
          claimId: row.claimId,
          relationship: row.relationship,
        })),
        supportingClaimIds: verdictClaimRows
          .filter((row) => row.relationship === 'SUPPORTING')
          .map((row) => row.claimId),
        contradictoryClaimIds: verdictClaimRows
          .filter((row) => row.relationship === 'CONTRADICTORY')
          .map((row) => row.claimId),
      }
    : null

  const freshness: ProgrammeFreshnessReadModel[] = freshnessRows.map(({ state, ...source }) => ({
    sourceId: state.sourceId,
    sourceTitle: reviewedSourceMetadataById.get(state.sourceId)?.title ?? source.sourceTitle,
    sourceType: reviewedSourceMetadataById.get(state.sourceId)?.sourceType ?? source.sourceType,
    checkStatus: state.checkStatus,
    freshnessStatus: state.freshnessStatus,
    currentSnapshotId: state.currentSnapshotId,
    pendingSnapshotId: state.pendingSnapshotId,
    lastCheckAttemptAt: iso(state.lastCheckAttemptAt),
    lastSuccessfulCheckAt: iso(state.lastSuccessfulCheckAt),
    lastVerifiedAt: iso(state.lastVerifiedAt),
    nextCheckDueAt: iso(state.nextCheckDueAt),
    consecutiveFailures: state.consecutiveFailures,
  }))

  return {
    ...base,
    selectedProgramme: {
      id: selected.id,
      slug: selected.slug,
      title: selected.title,
      indication: selected.indication,
      targetPopulation: selected.targetPopulation,
      jurisdiction: selected.jurisdiction,
      sponsor: selected.sponsor,
      partners: selected.partners,
      status: selected.status,
      highestPhaseReached: selected.highestPhaseReached,
      route: selected.route,
      doseExposureContext: selected.doseExposureContext,
      startDate: selected.startDate,
      endDate: selected.endDate,
      rawStoppingReason: selected.rawStoppingReason,
      stoppingReasonCategory: selected.stoppingReasonCategory,
      updateStatus: selected.updateStatus,
      trials,
      claims: publishedClaims,
      evidenceNodes: publishedNodes,
      verdict,
      summaryFieldDependencies,
      presentation: publicPresentation
        ? {
            schemaVersion: publicPresentation.schemaVersion,
            mechanismSteps: publicPresentation.mechanismSteps,
            timelineEvents: publicPresentation.timelineEvents,
          }
        : null,
      publicationHistory: publicPresentation?.publicationHistory ?? [],
      freshness,
    },
  }
}

/** Reverse dependency lookup used by source monitoring and review-task impact previews. */
export async function listAffectedProgrammeSurfaces(
  claimIds: readonly string[],
): Promise<ProgrammeDependencyReadModel[]> {
  if (claimIds.length === 0) return []

  return db
    .select({
      id: programmeDependencies.id,
      programmeId: programmeDependencies.programmeId,
      claimId: programmeDependencies.claimId,
      dependentSurfaceType: programmeDependencies.dependentSurfaceType,
      evidenceNodeId: programmeDependencies.evidenceNodeId,
      verdictRevisionId: programmeDependencies.verdictRevisionId,
      fieldPath: programmeDependencies.fieldPath,
      impactLevel: programmeDependencies.impactLevel,
    })
    .from(programmeDependencies)
    .where(inArray(programmeDependencies.claimId, [...claimIds]))
    .orderBy(
      asc(programmeDependencies.programmeId),
      asc(programmeDependencies.dependentSurfaceType),
      asc(programmeDependencies.fieldPath),
    )
}
