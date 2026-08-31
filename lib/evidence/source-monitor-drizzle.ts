import { and, desc, eq, inArray, ne } from 'drizzle-orm'

import type { Db } from '@/db'
import {
  claimSourceLinks,
  developmentProgrammes,
  evidenceMonitorRuns,
  evidenceReviewTaskSourceDeltas,
  evidenceReviewTasks,
  evidenceSources,
  programmeDependencies,
  programmeFreshnessStates,
  programmeTrials,
  sourceSnapshots,
  trialInterpretabilityAssessments,
  trialInterpretabilityClaims,
} from '@/db/schema'
import { ClinicalTrialsGovAdapter } from './adapters/clinical-trials-gov'
import type { EvidenceSourceAdapter } from './source-adapter'
import {
  runSourceMonitor,
  type AffectedProgrammeDependency,
  type AffectedSourceInterpretability,
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
