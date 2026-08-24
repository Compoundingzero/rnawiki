import { and, desc, eq, inArray, ne } from 'drizzle-orm'

import type { Db } from '@/db'
import {
  claimSourceLinks,
  claims,
  developmentProgrammes,
  evidenceMonitorRuns,
  evidenceReviewTaskSourceDeltas,
  evidenceNodes,
  evidenceReviewTasks,
  evidenceSources,
  programmeContributionProposals,
  programmeCurrentPublications,
  programmeDependencies,
  programmeFreshnessStates,
  programmeTrials,
  programmeVerdictRevisions,
  sourceSnapshots,
  trialInterpretabilityAssessments,
  trialInterpretabilityClaims,
} from '@/db/schema'
import {
  clinicalTrialsEnrollmentType,
  clinicalTrialsExactDate,
  clinicalTrialsPhaseLabel,
  clinicalTrialsProgrammeStatus,
  clinicalTrialsResultsStatus,
  clinicalTrialsTrialStatus,
} from '@/lib/evidence/clinical-trial-programme-onboarding'
import { stableJsonStringify } from '@/lib/stable-json'
import { ClinicalTrialsGovAdapter } from './adapters/clinical-trials-gov'
import type { EvidenceSourceAdapter } from './source-adapter'
import {
  runSourceMonitor,
  type AffectedProgrammeDependency,
  type AffectedSourceInterpretability,
  type ExactSourceCacheAdvanceInput,
  type ExactSourceCacheAdvanceResult,
  type NewEvidenceReviewTask,
  type NewStoredSourceReviewTaskDelta,
  type NewStoredSourceSnapshot,
  type RunSourceMonitorInput,
  type SourceMonitorFreshnessRecord,
  type SourceMonitorRepository,
  type SourceMonitorResult,
  type SourceMonitorRunRecord,
  type SourceMonitorTransaction,
  type StoredEvidenceReviewTask,
  type StoredSourceSnapshot,
  type SupersededReviewTaskDismissal,
} from './source-monitor'

type MonitorDatabaseHandle = Pick<Db, 'select' | 'insert' | 'update'>

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function deleteNestedField(value: Record<string, unknown>, path: readonly string[]): void {
  let cursor: Record<string, unknown> | null = value
  const parents: Array<{ parent: Record<string, unknown>; key: string }> = []
  for (const part of path.slice(0, -1)) {
    if (!cursor) return
    parents.push({ parent: cursor, key: part })
    cursor = objectRecord(cursor[part])
    if (!cursor) return
  }
  if (!cursor) return
  delete cursor[path.at(-1)!]
  for (const { parent, key } of parents.reverse()) {
    const nested = objectRecord(parent[key])
    if (nested && Object.keys(nested).length === 0) delete parent[key]
    else break
  }
}

/**
 * Removes exactly the fields normalized by ClinicalTrialsGovAdapter. If anything else in the
 * registry record changed, the remaining payloads differ and automatic cache refresh is blocked.
 */
function clinicalTrialsUnclassifiedPayload(
  value: Record<string, unknown>,
): Record<string, unknown> {
  const projected = structuredClone(value)
  delete projected.derivedSection
  const exactPaths = [
    ['hasResults'],
    ['protocolSection', 'identificationModule', 'nctId'],
    ['protocolSection', 'statusModule', 'overallStatus'],
    ['protocolSection', 'statusModule', 'startDateStruct', 'date'],
    ['protocolSection', 'statusModule', 'primaryCompletionDateStruct', 'date'],
    ['protocolSection', 'statusModule', 'completionDateStruct', 'date'],
    ['protocolSection', 'sponsorCollaboratorsModule', 'leadSponsor', 'name'],
    ['protocolSection', 'sponsorCollaboratorsModule', 'leadSponsor', 'class'],
    ['protocolSection', 'designModule', 'phases'],
    ['protocolSection', 'designModule', 'enrollmentInfo', 'count'],
    ['protocolSection', 'designModule', 'enrollmentInfo', 'type'],
  ] as const
  for (const path of exactPaths) deleteNestedField(projected, path)
  return projected
}

function cacheReviewRequired(
  blockingReasons: string[],
  affectedSurfacePaths: string[],
): ExactSourceCacheAdvanceResult {
  return {
    disposition: 'REVIEW_REQUIRED',
    blockingReasons: [...new Set(blockingReasons)].sort(),
    affectedSurfacePaths: [...new Set(affectedSurfacePaths)].sort(),
  }
}

function monitorRunRecord(row: typeof evidenceMonitorRuns.$inferSelect): SourceMonitorRunRecord {
  return {
    id: row.id,
    adapterKey: row.adapterKey,
    sourceId: row.sourceId,
    programmeId: row.programmeId,
    snapshotId: row.snapshotId,
    status: row.status,
    attemptNumber: row.attemptNumber,
    maxAttempts: row.maxAttempts,
    changedFieldCount: row.changedFieldCount,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    nextRetryAt: row.nextRetryAt,
    errorCode: row.errorCode,
    errorMessage: row.errorMessage,
  }
}

function freshnessRecord(
  row: typeof programmeFreshnessStates.$inferSelect,
): SourceMonitorFreshnessRecord {
  return {
    programmeId: row.programmeId,
    sourceId: row.sourceId,
    currentSnapshotId: row.currentSnapshotId,
    pendingSnapshotId: row.pendingSnapshotId,
    checkStatus: row.checkStatus,
    freshnessStatus: row.freshnessStatus,
    lastCheckAttemptAt: row.lastCheckAttemptAt,
    lastSuccessfulCheckAt: row.lastSuccessfulCheckAt,
    lastVerifiedAt: row.lastVerifiedAt,
    nextCheckDueAt: row.nextCheckDueAt,
    consecutiveFailures: row.consecutiveFailures,
    lastErrorCode: row.lastErrorCode,
    lastErrorMessage: row.lastErrorMessage,
    newEvidenceDetectedAt: row.newEvidenceDetectedAt,
  }
}

function snapshotRecord(row: typeof sourceSnapshots.$inferSelect): StoredSourceSnapshot {
  return {
    id: row.id,
    sourceId: row.sourceId,
    previousSnapshotId: row.previousSnapshotId,
    retrievedAt: row.retrievedAt,
    contentHash: row.contentHash,
    structuredData: row.structuredData,
    rawSnapshotLocator: row.rawSnapshotLocator,
  }
}

class DrizzleSourceMonitorTransaction implements SourceMonitorTransaction {
  constructor(private readonly handle: MonitorDatabaseHandle) {}

  async ensureMonitorRun(run: SourceMonitorRunRecord, createdAt: Date): Promise<void> {
    await this.handle
      .insert(evidenceMonitorRuns)
      .values({ ...run, createdAt, updatedAt: createdAt })
      .onConflictDoNothing({ target: evidenceMonitorRuns.id })
  }

  async getMonitorRunForUpdate(runId: string): Promise<SourceMonitorRunRecord | null> {
    const rows = await this.handle
      .select()
      .from(evidenceMonitorRuns)
      .where(eq(evidenceMonitorRuns.id, runId))
      .limit(1)
      .for('update')
    return rows[0] ? monitorRunRecord(rows[0]) : null
  }

  async updateMonitorRun(
    runId: string,
    patch: Partial<SourceMonitorRunRecord>,
    updatedAt: Date,
  ): Promise<void> {
    await this.handle
      .update(evidenceMonitorRuns)
      .set({ ...patch, updatedAt })
      .where(eq(evidenceMonitorRuns.id, runId))
  }

  async ensureFreshness(programmeId: string, sourceId: string, updatedAt: Date): Promise<void> {
    await this.handle
      .insert(programmeFreshnessStates)
      .values({ programmeId, sourceId, updatedAt })
      .onConflictDoNothing({
        target: [programmeFreshnessStates.programmeId, programmeFreshnessStates.sourceId],
      })
  }

  async getFreshnessForUpdate(
    programmeId: string,
    sourceId: string,
  ): Promise<SourceMonitorFreshnessRecord | null> {
    const rows = await this.handle
      .select()
      .from(programmeFreshnessStates)
      .where(
        and(
          eq(programmeFreshnessStates.programmeId, programmeId),
          eq(programmeFreshnessStates.sourceId, sourceId),
        ),
      )
      .limit(1)
      .for('update')
    return rows[0] ? freshnessRecord(rows[0]) : null
  }

  async updateFreshness(
    programmeId: string,
    sourceId: string,
    patch: Partial<SourceMonitorFreshnessRecord> & { updatedAt: Date },
  ): Promise<void> {
    await this.handle
      .update(programmeFreshnessStates)
      .set(patch)
      .where(
        and(
          eq(programmeFreshnessStates.programmeId, programmeId),
          eq(programmeFreshnessStates.sourceId, sourceId),
        ),
      )
  }

  async updateProgrammeStatus(
    programmeId: string,
    status: Parameters<SourceMonitorTransaction['updateProgrammeStatus']>[1],
    updatedAt: Date,
  ): Promise<void> {
    await this.handle
      .update(developmentProgrammes)
      .set({ updateStatus: status, updatedAt })
      .where(eq(developmentProgrammes.id, programmeId))
  }

  async advanceExactSourceCache(
    input: ExactSourceCacheAdvanceInput,
  ): Promise<ExactSourceCacheAdvanceResult> {
    if (input.adapterKey !== 'clinicaltrials.gov/v2') {
      return { disposition: 'NOT_APPLICABLE', blockingReasons: [], affectedSurfacePaths: [] }
    }

    const programmeRows = await this.handle
      .select({ id: developmentProgrammes.id })
      .from(developmentProgrammes)
      .where(eq(developmentProgrammes.id, input.programmeId))
      .limit(1)
      .for('update')
    if (programmeRows.length === 0) {
      return cacheReviewRequired(
        ['the programme record is unavailable'],
        ['PROGRAMME_SUMMARY:programme'],
      )
    }

    const trialRows = await this.handle
      .select()
      .from(programmeTrials)
      .where(
        and(
          eq(programmeTrials.programmeId, input.programmeId),
          eq(programmeTrials.registrySourceId, input.sourceId),
        ),
      )
      .for('update')
    if (trialRows.length !== 1) {
      return cacheReviewRequired(
        ['the source is not bound to exactly one programme trial'],
        ['TIMELINE:programme.trials'],
      )
    }

    const freshnessRows = await this.handle
      .select({ currentSnapshotId: programmeFreshnessStates.currentSnapshotId })
      .from(programmeFreshnessStates)
      .where(
        and(
          eq(programmeFreshnessStates.programmeId, input.programmeId),
          eq(programmeFreshnessStates.sourceId, input.sourceId),
        ),
      )
      .limit(1)
    const currentSnapshotId = freshnessRows[0]?.currentSnapshotId
    if (!currentSnapshotId) {
      return cacheReviewRequired(
        ['the programme has no accepted baseline snapshot'],
        ['TIMELINE:programme.registrySnapshot'],
      )
    }

    const snapshotRows = await this.handle
      .select({
        id: sourceSnapshots.id,
        sourceId: sourceSnapshots.sourceId,
        structuredData: sourceSnapshots.structuredData,
      })
      .from(sourceSnapshots)
      .where(inArray(sourceSnapshots.id, [currentSnapshotId, input.snapshotId]))
    const currentSnapshot = snapshotRows.find((row) => row.id === currentSnapshotId)
    const nextSnapshot = snapshotRows.find((row) => row.id === input.snapshotId)
    if (
      !currentSnapshot ||
      !nextSnapshot ||
      currentSnapshot.sourceId !== input.sourceId ||
      nextSnapshot.sourceId !== input.sourceId
    ) {
      return cacheReviewRequired(
        ['the old or new immutable source snapshot is unavailable'],
        ['TIMELINE:programme.registrySnapshot'],
      )
    }

    if (
      stableJsonStringify(clinicalTrialsUnclassifiedPayload(currentSnapshot.structuredData)) !==
      stableJsonStringify(clinicalTrialsUnclassifiedPayload(nextSnapshot.structuredData))
    ) {
      return cacheReviewRequired(
        ['other registry content changed alongside the exact cached fields'],
        ['TIMELINE:trial.registryRecord'],
      )
    }

    const blockingReasons: string[] = []
    const affectedSurfacePaths: string[] = []
    const currentPublications = await this.handle
      .select({ programmeId: programmeCurrentPublications.programmeId })
      .from(programmeCurrentPublications)
      .where(eq(programmeCurrentPublications.programmeId, input.programmeId))
      .limit(1)
    if (currentPublications.length > 0) {
      blockingReasons.push('a current public conclusion')
      affectedSurfacePaths.push('VERDICT:current-publication')
    }

    const programmeClaims = await this.handle
      .select({ id: claims.id })
      .from(claims)
      .where(eq(claims.programmeId, input.programmeId))
      .limit(1)
    if (programmeClaims.length > 0) {
      blockingReasons.push('the programme has one or more saved claims')
      affectedSurfacePaths.push('PROGRAMME_SUMMARY:claims')
    }

    const programmeNodes = await this.handle
      .select({ id: evidenceNodes.id })
      .from(evidenceNodes)
      .where(eq(evidenceNodes.programmeId, input.programmeId))
      .limit(1)
    if (programmeNodes.length > 0) {
      blockingReasons.push('the programme has saved evidence-chain answers')
      affectedSurfacePaths.push('EVIDENCE_NODE:programme')
    }

    const assessments = await this.handle
      .select({ id: trialInterpretabilityAssessments.id })
      .from(trialInterpretabilityAssessments)
      .where(eq(trialInterpretabilityAssessments.programmeId, input.programmeId))
      .limit(1)
    if (assessments.length > 0) {
      blockingReasons.push('the programme has saved study-quality assessments')
      affectedSurfacePaths.push('TIMELINE:study-interpretability')
    }

    const verdicts = await this.handle
      .select({ id: programmeVerdictRevisions.id })
      .from(programmeVerdictRevisions)
      .where(eq(programmeVerdictRevisions.programmeId, input.programmeId))
      .limit(1)
    if (verdicts.length > 0) {
      blockingReasons.push('the programme has saved conclusion revisions')
      affectedSurfacePaths.push('VERDICT:programme')
    }

    const dependencies = await this.handle
      .select({ id: programmeDependencies.id })
      .from(programmeDependencies)
      .where(eq(programmeDependencies.programmeId, input.programmeId))
      .limit(1)
    if (dependencies.length > 0) {
      blockingReasons.push('the programme has dependent dossier fields')
      affectedSurfacePaths.push('PROGRAMME_SUMMARY:dependency-graph')
    }

    const contributions = await this.handle
      .select({ id: programmeContributionProposals.id })
      .from(programmeContributionProposals)
      .where(eq(programmeContributionProposals.programmeId, input.programmeId))
      .limit(1)
    if (contributions.length > 0) {
      blockingReasons.push('the programme has saved contribution proposals')
      affectedSurfacePaths.push('PROGRAMME_SUMMARY:contribution-proposals')
    }

    const openSourceReviews = await this.handle
      .select({ id: evidenceReviewTasks.id })
      .from(evidenceReviewTasks)
      .where(
        and(
          eq(evidenceReviewTasks.programmeId, input.programmeId),
          eq(evidenceReviewTasks.sourceId, input.sourceId),
          inArray(evidenceReviewTasks.status, ['OPEN', 'IN_REVIEW', 'BLOCKED']),
        ),
      )
      .limit(1)
    if (openSourceReviews.length > 0) {
      blockingReasons.push('an earlier source review is still open')
      affectedSurfacePaths.push('TIMELINE:source-review')
    }

    if (blockingReasons.length > 0) {
      return cacheReviewRequired(blockingReasons, affectedSurfacePaths)
    }

    const factByPath = new Map<string, ExactSourceCacheAdvanceInput['normalizedFacts'][number]>()
    let malformedFacts = false
    for (const fact of input.normalizedFacts) {
      if (factByPath.has(fact.path) || fact.risk !== 'LOW_RISK_EXACT') malformedFacts = true
      factByPath.set(fact.path, fact)
    }
    const stringFact = (path: string): string | null => {
      const value = factByPath.get(path)?.value
      if (value === undefined || value === null || value === '') return null
      if (typeof value !== 'string') {
        malformedFacts = true
        return null
      }
      return value.trim() || null
    }
    const numberFact = (path: string): number | null => {
      const value = factByPath.get(path)?.value
      if (value === undefined || value === null) return null
      if (
        !Number.isSafeInteger(value) ||
        (value as number) < 0 ||
        (value as number) > 2_147_483_647
      ) {
        malformedFacts = true
        return null
      }
      return value as number
    }
    const booleanFact = (path: string): boolean | null => {
      const value = factByPath.get(path)?.value
      if (value === undefined || value === null) return null
      if (typeof value !== 'boolean') {
        malformedFacts = true
        return null
      }
      return value
    }

    const nctId = stringFact('trial.identifier')?.toUpperCase() ?? null
    const overallStatus = stringFact('trial.overallStatus')?.toUpperCase() ?? null
    const enrollmentType = stringFact('trial.enrollment.type')?.toUpperCase() ?? null
    const phaseCodes = (stringFact('trial.phases') ?? '')
      .split('|')
      .map((phase) => phase.trim())
      .filter(Boolean)
    const startDateValue = stringFact('trial.startDate')
    const primaryCompletionDateValue = stringFact('trial.primaryCompletionDate')
    const completionDateValue = stringFact('trial.completionDate')
    const sponsorName = stringFact('trial.sponsor.name')
    const enrollment = numberFact('trial.enrollment.count')
    const hasResults = booleanFact('trial.hasResults')
    if (!nctId || trialRows[0]!.trialIdentifier.trim().toUpperCase() !== nctId)
      malformedFacts = true

    let startDate: string | null = null
    let primaryCompletionDate: string | null = null
    let completionDate: string | null = null
    try {
      startDate = clinicalTrialsExactDate(startDateValue)
      primaryCompletionDate = clinicalTrialsExactDate(primaryCompletionDateValue)
      completionDate = clinicalTrialsExactDate(completionDateValue)
    } catch {
      malformedFacts = true
    }
    if (startDate && completionDate && completionDate < startDate) malformedFacts = true
    if (malformedFacts) {
      return cacheReviewRequired(
        ['the normalized registry facts are incomplete or invalid'],
        ['TIMELINE:trial.registryRecord'],
      )
    }

    const phase = clinicalTrialsPhaseLabel(phaseCodes)
    await this.handle
      .update(programmeTrials)
      .set({
        phase,
        status: clinicalTrialsTrialStatus(overallStatus),
        resultsStatus: clinicalTrialsResultsStatus(hasResults),
        enrolment: enrollment,
        enrolmentType: clinicalTrialsEnrollmentType(enrollmentType),
        startDate,
        primaryCompletionDate,
        completionDate,
        registrySnapshotId: input.snapshotId,
        lastVerifiedAt: input.verifiedAt,
        updatedAt: input.verifiedAt,
      })
      .where(eq(programmeTrials.id, trialRows[0]!.id))
    await this.handle
      .update(developmentProgrammes)
      .set({
        sponsor: sponsorName,
        status: clinicalTrialsProgrammeStatus(overallStatus),
        highestPhaseReached: phase,
        startDate,
        endDate: completionDate,
        updatedAt: input.verifiedAt,
      })
      .where(eq(developmentProgrammes.id, input.programmeId))

    return {
      disposition: 'ADVANCED',
      blockingReasons: [],
      affectedSurfacePaths: [],
    }
  }

  async getSnapshot(snapshotId: string): Promise<StoredSourceSnapshot | null> {
    const rows = await this.handle
      .select()
      .from(sourceSnapshots)
      .where(eq(sourceSnapshots.id, snapshotId))
      .limit(1)
    return rows[0] ? snapshotRecord(rows[0]) : null
  }

  async getLatestSnapshot(sourceId: string): Promise<StoredSourceSnapshot | null> {
    const rows = await this.handle
      .select()
      .from(sourceSnapshots)
      .where(eq(sourceSnapshots.sourceId, sourceId))
      .orderBy(desc(sourceSnapshots.retrievedAt), desc(sourceSnapshots.id))
      .limit(1)
    return rows[0] ? snapshotRecord(rows[0]) : null
  }

  async findSnapshotByHash(
    sourceId: string,
    contentHash: string,
  ): Promise<StoredSourceSnapshot | null> {
    const rows = await this.handle
      .select()
      .from(sourceSnapshots)
      .where(
        and(eq(sourceSnapshots.sourceId, sourceId), eq(sourceSnapshots.contentHash, contentHash)),
      )
      .limit(1)
    return rows[0] ? snapshotRecord(rows[0]) : null
  }

  async insertSnapshotIfAbsent(snapshot: NewStoredSourceSnapshot): Promise<StoredSourceSnapshot> {
    await this.handle
      .insert(sourceSnapshots)
      .values({
        id: snapshot.id,
        sourceId: snapshot.sourceId,
        previousSnapshotId: snapshot.previousSnapshotId,
        retrievedAt: snapshot.retrievedAt,
        lastVerifiedAt: snapshot.lastVerifiedAt,
        hashAlgorithm: snapshot.hashAlgorithm,
        contentHash: snapshot.contentHash,
        structuredData: snapshot.structuredData,
        rawSnapshotLocator: snapshot.rawSnapshotLocator,
        createdAt: snapshot.lastVerifiedAt,
      })
      .onConflictDoNothing({ target: [sourceSnapshots.sourceId, sourceSnapshots.contentHash] })
    const stored = await this.findSnapshotByHash(snapshot.sourceId, snapshot.contentHash)
    if (!stored) throw new Error('Snapshot insert did not produce a readable immutable row.')
    return stored
  }

  async listAffectedClaimIds(programmeId: string, sourceId: string): Promise<string[]> {
    const rows = await this.handle
      .select({ claimId: claimSourceLinks.claimId })
      .from(claimSourceLinks)
      .innerJoin(sourceSnapshots, eq(claimSourceLinks.sourceSnapshotId, sourceSnapshots.id))
      .where(
        and(eq(claimSourceLinks.programmeId, programmeId), eq(sourceSnapshots.sourceId, sourceId)),
      )
    return [...new Set(rows.map((row) => row.claimId))].sort()
  }

  async listDependencies(
    programmeId: string,
    claimIds: readonly string[],
  ): Promise<AffectedProgrammeDependency[]> {
    if (claimIds.length === 0) return []
    return this.handle
      .select({
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
          eq(programmeDependencies.programmeId, programmeId),
          inArray(programmeDependencies.claimId, [...claimIds]),
        ),
      )
      .orderBy(programmeDependencies.claimId, programmeDependencies.fieldPath)
  }

  async listAffectedInterpretability(
    programmeId: string,
    sourceId: string,
    affectedClaimIds: readonly string[],
  ): Promise<AffectedSourceInterpretability[]> {
    if (affectedClaimIds.length === 0) return []
    const rows = await this.handle
      .select({
        assessmentId: trialInterpretabilityAssessments.id,
        criterion: trialInterpretabilityAssessments.criterion,
      })
      .from(trialInterpretabilityAssessments)
      .innerJoin(
        programmeTrials,
        and(
          eq(programmeTrials.id, trialInterpretabilityAssessments.programmeTrialId),
          eq(programmeTrials.programmeId, trialInterpretabilityAssessments.programmeId),
        ),
      )
      .innerJoin(
        trialInterpretabilityClaims,
        and(
          eq(trialInterpretabilityClaims.assessmentId, trialInterpretabilityAssessments.id),
          eq(trialInterpretabilityClaims.programmeId, trialInterpretabilityAssessments.programmeId),
        ),
      )
      .where(
        and(
          eq(trialInterpretabilityAssessments.programmeId, programmeId),
          eq(trialInterpretabilityAssessments.reviewStatus, 'PUBLISHED'),
          eq(programmeTrials.registrySourceId, sourceId),
          inArray(trialInterpretabilityClaims.claimId, [...affectedClaimIds]),
        ),
      )
      .orderBy(trialInterpretabilityAssessments.id, trialInterpretabilityAssessments.criterion)
    const unique = new Map(
      rows.map((row) => [`${row.assessmentId}:${row.criterion}`, row] as const),
    )
    return [...unique.values()]
  }

  async insertReviewTaskIfAbsent(task: NewEvidenceReviewTask): Promise<void> {
    await this.handle
      .insert(evidenceReviewTasks)
      .values(task)
      .onConflictDoNothing({ target: evidenceReviewTasks.id })
  }

  async insertSourceReviewTaskDeltaIfAbsent(delta: NewStoredSourceReviewTaskDelta): Promise<void> {
    await this.handle
      .insert(evidenceReviewTaskSourceDeltas)
      .values(delta)
      .onConflictDoNothing({ target: evidenceReviewTaskSourceDeltas.reviewTaskId })
  }

  async dismissSupersededReviewTasks(input: SupersededReviewTaskDismissal): Promise<string[]> {
    const rows = await this.handle
      .update(evidenceReviewTasks)
      .set({
        status: 'DISMISSED',
        resolutionNote: input.activeReviewTaskId
          ? `Superseded by review task ${input.activeReviewTaskId} for newer pending source snapshot ${input.supersedingSnapshotId}.`
          : `The source returned to verified baseline snapshot ${input.supersedingSnapshotId}; this pending review is no longer actionable.`,
        resolvedAt: input.dismissedAt,
        updatedAt: input.dismissedAt,
      })
      .where(
        and(
          eq(evidenceReviewTasks.programmeId, input.programmeId),
          eq(evidenceReviewTasks.sourceId, input.sourceId),
          input.activeReviewTaskId
            ? ne(evidenceReviewTasks.id, input.activeReviewTaskId)
            : undefined,
          inArray(evidenceReviewTasks.status, ['OPEN', 'IN_REVIEW', 'BLOCKED']),
        ),
      )
      .returning({ id: evidenceReviewTasks.id })
    return rows.map((row) => row.id).sort()
  }

  async listReviewTasksForRun(
    programmeId: string,
    sourceId: string,
    snapshotId: string,
    monitorRunId: string,
  ): Promise<StoredEvidenceReviewTask[]> {
    return this.handle
      .select({
        id: evidenceReviewTasks.id,
        programmeId: evidenceReviewTasks.programmeId,
        sourceId: evidenceReviewTasks.sourceId,
        triggerSnapshotId: evidenceReviewTasks.triggerSnapshotId,
        monitorRunId: evidenceReviewTasks.monitorRunId,
        impactLevel: evidenceReviewTasks.impactLevel,
        affectedClaimIds: evidenceReviewTasks.affectedClaimIds,
        affectedSurfacePaths: evidenceReviewTasks.affectedSurfacePaths,
      })
      .from(evidenceReviewTasks)
      .where(
        and(
          eq(evidenceReviewTasks.programmeId, programmeId),
          eq(evidenceReviewTasks.sourceId, sourceId),
          eq(evidenceReviewTasks.triggerSnapshotId, snapshotId),
          eq(evidenceReviewTasks.monitorRunId, monitorRunId),
        ),
      )
      .orderBy(evidenceReviewTasks.id)
  }
}

export class DrizzleSourceMonitorRepository implements SourceMonitorRepository {
  constructor(private readonly database: Db) {}

  transaction<T>(work: (transaction: SourceMonitorTransaction) => Promise<T>): Promise<T> {
    return this.database.transaction((transaction) =>
      work(new DrizzleSourceMonitorTransaction(transaction)),
    )
  }
}

export interface MonitorClinicalTrialsSourceInput extends Omit<
  RunSourceMonitorInput,
  'repository' | 'adapter' | 'identifier' | 'now'
> {
  database: Db
  adapter?: EvidenceSourceAdapter
  now?: () => Date
}

/** Callable ClinicalTrials.gov vertical slice; pass a fake adapter to keep tests offline. */
export async function monitorClinicalTrialsSource(
  input: MonitorClinicalTrialsSourceInput,
): Promise<SourceMonitorResult> {
  const sourceRows = await input.database
    .select({
      sourceType: evidenceSources.sourceType,
      externalIdentifier: evidenceSources.externalIdentifier,
    })
    .from(evidenceSources)
    .where(eq(evidenceSources.id, input.sourceId))
    .limit(1)
  const source = sourceRows[0]
  if (!source) throw new Error(`Evidence source ${input.sourceId} does not exist.`)
  if (source.sourceType !== 'CLINICAL_TRIAL_REGISTRY') {
    throw new TypeError(
      `Evidence source ${input.sourceId} is not a clinical-trial registry source.`,
    )
  }
  if (!source.externalIdentifier) {
    throw new TypeError(`Evidence source ${input.sourceId} has no trial registration identifier.`)
  }

  const {
    database,
    adapter = new ClinicalTrialsGovAdapter(),
    sourceId,
    programmeId,
    idempotencyKey,
    maxAttempts,
    retryDelayMs,
    runningLeaseMs,
    nextCheckAfterMs,
    now,
  } = input
  return runSourceMonitor({
    repository: new DrizzleSourceMonitorRepository(database),
    adapter,
    identifier: { kind: 'NCT', value: source.externalIdentifier },
    sourceId,
    programmeId,
    idempotencyKey,
    ...(maxAttempts === undefined ? {} : { maxAttempts }),
    ...(retryDelayMs === undefined ? {} : { retryDelayMs }),
    ...(runningLeaseMs === undefined ? {} : { runningLeaseMs }),
    ...(nextCheckAfterMs === undefined ? {} : { nextCheckAfterMs }),
    ...(now === undefined ? {} : { now }),
  })
}
