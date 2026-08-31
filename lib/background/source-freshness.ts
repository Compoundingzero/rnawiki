import { createHash, randomUUID } from 'node:crypto'

import { and, asc, desc, eq, gt, inArray, isNotNull, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  agentReviewCandidates,
  agentRuns,
  backgroundAssertionChecks,
  backgroundSourceBindings,
  backgroundSourceFetches,
  drugs,
  evidenceSources,
  sourceSnapshots,
} from '@/db/schema'
import { candidateKey, occurrenceKey, valueDigest } from '@/lib/agents/core/identity'
import type { StaleSourceSummary } from '@/lib/dossier-question-issues'
import { stableJsonStringify } from '@/lib/stable-json'

import {
  BACKGROUND_SOURCE_BINDING_SCHEMA,
  collectBackgroundSourceAssertionBindings,
  evaluateBackgroundSourceAssertion,
  type BackgroundSourceAssertionBinding,
  type SourceAssertionResult,
} from './source-assertions'
import {
  BACKGROUND_SOURCE_FETCHER_VERSION,
  backgroundEvidenceSourceId,
  backgroundFreshnessJobKey,
  backgroundSourceFetchAttemptId,
  backgroundSourceSnapshotId,
  evidenceSourceTypeForBackgroundKind,
  fetchBackgroundSource,
  type BackgroundFetchImplementation,
  type BackgroundSourceFetchOutcome,
} from './source-fetch'
import type { MedicineRecordedBackground } from './types'

export const BACKGROUND_ASSERTION_CHECKER_VERSION = 'background-assertion/1.0.0' as const
export const BACKGROUND_DRIFT_AGENT = 'source-drift-monitor' as const
export const BACKGROUND_DRIFT_AGENT_VERSION = '1.0.0' as const
export const BACKGROUND_DRIFT_REASON_SCHEMA_VERSION = '1' as const

const PAGE_SIZE = 250

interface CurrentBackgroundRow {
  id: string
  slug: string
  recordedBackground: MedicineRecordedBackground
}

export interface PreparedBackgroundBinding {
  drugId: string
  recordedBackgroundDigest: string
  binding: BackgroundSourceAssertionBinding
}

export interface BackgroundSourceBindingGroup {
  sourceKey: string
  sourceIdentity: BackgroundSourceAssertionBinding['sourceIdentity']
  bindings: PreparedBackgroundBinding[]
}

export interface PersistedBackgroundAssertionCheck {
  id: string
  /** Exact append-only database binding, including the current recorded-background digest. */
  persistedBindingId: string
  binding: PreparedBackgroundBinding
  fetchId: string
  sourceId: string
  sourceSnapshotId: string
  sourceContentHash: string
  result: SourceAssertionResult
  checkedAt: Date
}

export interface BackgroundFreshnessRunSummary {
  jobKey: string
  currentSourceCount: number
  selectedSourceCount: number
  processedSourceCount: number
  bindingCount: number
  fetchCounts: Record<BackgroundSourceFetchOutcome['status'], number>
  assertionCounts: Record<SourceAssertionResult, number>
  candidatesEmitted: number
  stoppedAtRuntimeBound: boolean
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function prefixedDigest(value: unknown): string {
  return `sha256:${sha256(stableJsonStringify(value))}`
}

function assertPersistedFields(
  tableName: string,
  rowId: string,
  actual: object | undefined,
  expected: Record<string, unknown>,
): void {
  if (!actual) {
    throw new Error(
      `Stable identity collision for ${tableName} ${rowId}: the expected row was not persisted.`,
    )
  }
  const actualFields = actual as Record<string, unknown>
  const mismatches = Object.entries(expected)
    .filter(
      ([field, expectedValue]) =>
        stableJsonStringify(actualFields[field]) !== stableJsonStringify(expectedValue),
    )
    .map(([field]) => field)
  if (mismatches.length > 0) {
    throw new Error(
      `Stable identity collision for ${tableName} ${rowId}: ${mismatches.join(', ')} differed.`,
    )
  }
}

/** Exact current-envelope identity used both by persisted bindings and the public stale loader. */
export function recordedBackgroundDigest(background: MedicineRecordedBackground): string {
  return prefixedDigest(background)
}

/**
 * The collector's binding ID is stable while one assertion is unchanged. Persistence additionally
 * binds it to the complete current envelope, so an unrelated envelope edit never reuses an
 * append-only row carrying an older `recorded_background_digest`.
 */
export function persistedBackgroundBindingId(binding: PreparedBackgroundBinding): string {
  return `background_binding_${sha256(
    [
      'persisted-background-binding/v1',
      binding.drugId,
      binding.recordedBackgroundDigest,
      binding.binding.bindingId,
    ].join('\u001f'),
  )}`
}

export function backgroundAssertionCheckId(input: {
  bindingId: string
  fetchId: string
  checkerVersion: string
}): string {
  return sha256(
    ['background-assertion-check/v1', input.bindingId, input.fetchId, input.checkerVersion].join(
      '\u001f',
    ),
  )
}

function parsedRecordedAt(value: string): Date {
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/u.test(value) ? `${value}T00:00:00.000Z` : value)
  if (Number.isNaN(parsed.getTime())) throw new TypeError(`Invalid recorded source date: ${value}`)
  return parsed
}

async function visitCurrentBackgrounds(
  visit: (row: CurrentBackgroundRow) => void | Promise<void>,
): Promise<void> {
  let afterSlug: string | undefined
  while (true) {
    const rows = await db
      .select({ id: drugs.id, slug: drugs.slug, recordedBackground: drugs.recordedBackground })
      .from(drugs)
      .where(
        afterSlug
          ? and(isNotNull(drugs.recordedBackground), gt(drugs.slug, afterSlug))
          : isNotNull(drugs.recordedBackground),
      )
      .orderBy(asc(drugs.slug))
      .limit(PAGE_SIZE)

    if (rows.length === 0) return
    for (const row of rows) {
      if (!row.recordedBackground) continue
      await visit(row as CurrentBackgroundRow)
    }
    afterSlug = rows.at(-1)?.slug
    if (rows.length < PAGE_SIZE) return
  }
}

async function latestAttemptBySourceKey(): Promise<Map<string, Date>> {
  const result = await db.execute<{ source_key: string; completed_at: Date | string }>(sql`
    SELECT DISTINCT ON (source_key) source_key, completed_at
    FROM ${backgroundSourceFetches}
    ORDER BY source_key, completed_at DESC, id DESC
  `)
  return new Map(result.rows.map((row) => [row.source_key, new Date(row.completed_at)]))
}

async function scheduledSourceKeys(limit: number): Promise<{
  currentSourceCount: number
  selected: string[]
}> {
  const keys = new Set<string>()
  await visitCurrentBackgrounds((row) => {
    for (const binding of collectBackgroundSourceAssertionBindings(
      row.slug,
      row.recordedBackground,
    )) {
      keys.add(binding.sourceKey)
    }
  })

  const latest = await latestAttemptBySourceKey()
  const selected = [...keys]
    .sort((left, right) => {
      const leftAttempt = latest.get(left)
      const rightAttempt = latest.get(right)
      if (!leftAttempt && rightAttempt) return -1
      if (leftAttempt && !rightAttempt) return 1
      if (leftAttempt && rightAttempt) {
        const byTime = leftAttempt.getTime() - rightAttempt.getTime()
        if (byTime !== 0) return byTime
      }
      return left.localeCompare(right)
    })
    .slice(0, limit)

  return { currentSourceCount: keys.size, selected }
}

async function bindingsForSourceKeys(
  sourceKeys: readonly string[],
): Promise<BackgroundSourceBindingGroup[]> {
  const selected = new Set(sourceKeys)
  const bySource = new Map<string, BackgroundSourceBindingGroup>()

  await visitCurrentBackgrounds((row) => {
    const envelopeDigest = recordedBackgroundDigest(row.recordedBackground)
    for (const binding of collectBackgroundSourceAssertionBindings(
      row.slug,
      row.recordedBackground,
    )) {
      if (!selected.has(binding.sourceKey)) continue
      const group = bySource.get(binding.sourceKey) ?? {
        sourceKey: binding.sourceKey,
        sourceIdentity: binding.sourceIdentity,
        bindings: [],
      }
      group.bindings.push({
        drugId: row.id,
        recordedBackgroundDigest: envelopeDigest,
        binding,
      })
      bySource.set(binding.sourceKey, group)
    }
  })

  const missing = sourceKeys.filter((sourceKey) => !bySource.has(sourceKey))
  if (missing.length > 0) {
    throw new Error(`Scheduled background sources disappeared: ${missing.join(', ')}`)
  }
  return sourceKeys.map((sourceKey) => bySource.get(sourceKey)!)
}

export async function persistBackgroundSourceAttempt(input: {
  jobKey: string
  group: BackgroundSourceBindingGroup
  outcome: BackgroundSourceFetchOutcome
}): Promise<PersistedBackgroundAssertionCheck[]> {
  const { group, outcome } = input
  const representative = group.bindings[0]?.binding
  if (!representative) throw new Error(`No bindings exist for ${group.sourceKey}.`)
  if (outcome.sourceKey !== group.sourceKey) {
    throw new Error(`Fetcher returned the wrong source for ${group.sourceKey}.`)
  }

  const expectedSourceType = evidenceSourceTypeForBackgroundKind(group.sourceIdentity.kind)
  const deterministicSourceId = backgroundEvidenceSourceId(group.sourceKey)
  const fetchId = backgroundSourceFetchAttemptId({
    jobKey: input.jobKey,
    sourceKey: group.sourceKey,
    attemptNumber: 1,
  })
  const completedAt = new Date(outcome.fetchedAt.getTime() + outcome.durationMs)

  return db.transaction(async (tx) => {
    const sourceIdentityRows = await tx
      .select({
        id: evidenceSources.id,
        sourceType: evidenceSources.sourceType,
        externalIdentifier: evidenceSources.externalIdentifier,
      })
      .from(evidenceSources)
      .where(
        and(
          eq(evidenceSources.sourceType, expectedSourceType),
          eq(evidenceSources.externalIdentifier, group.sourceKey),
        ),
      )
      .limit(1)
    let sourceId = sourceIdentityRows[0]?.id ?? deterministicSourceId

    if (!sourceIdentityRows[0]) {
      await tx
        .insert(evidenceSources)
        .values({
          id: sourceId,
          sourceType: expectedSourceType,
          // Kind-namespaced on purpose; the coarse source type is not a safe identity namespace.
          externalIdentifier: group.sourceKey,
          canonicalLocator: outcome.canonicalLocator,
          title: representative.sourceLabel,
          hierarchy: 'PRIMARY',
        })
        .onConflictDoNothing()

      const persistedSources = await tx
        .select({
          id: evidenceSources.id,
          sourceType: evidenceSources.sourceType,
          externalIdentifier: evidenceSources.externalIdentifier,
        })
        .from(evidenceSources)
        .where(
          and(
            eq(evidenceSources.sourceType, expectedSourceType),
            eq(evidenceSources.externalIdentifier, group.sourceKey),
          ),
        )
        .limit(1)
      const persistedSource = persistedSources[0]
      assertPersistedFields('evidence_sources', deterministicSourceId, persistedSource, {
        sourceType: expectedSourceType,
        externalIdentifier: group.sourceKey,
      })
      sourceId = persistedSource!.id
    } else {
      assertPersistedFields('evidence_sources', sourceId, sourceIdentityRows[0], {
        sourceType: expectedSourceType,
        externalIdentifier: group.sourceKey,
      })
    }

    const bindingRows = group.bindings.map((prepared) => ({
      id: persistedBackgroundBindingId(prepared),
      drugId: prepared.drugId,
      recordedBackgroundDigest: prepared.recordedBackgroundDigest,
      fieldPath: prepared.binding.fieldPath,
      sourcePath: prepared.binding.sourcePath,
      sourceId,
      sourceKind: prepared.binding.sourceIdentity.kind,
      sourceIdentifier: prepared.binding.sourceIdentity.identifier,
      sourceKey: prepared.binding.sourceKey,
      sourceLabel: prepared.binding.sourceLabel,
      sourceLocator: prepared.binding.sourceLocator ?? null,
      sourceRetrievedAt: parsedRecordedAt(prepared.binding.retrievedAt),
      sourceExcerpt: prepared.binding.excerpt,
      assertionDigest: prepared.binding.assertionDigest,
      questionIntent: prepared.binding.questionIntent ?? null,
      bindingSchema: BACKGROUND_SOURCE_BINDING_SCHEMA,
    }))
    await tx.insert(backgroundSourceBindings).values(bindingRows).onConflictDoNothing()

    const persistedBindings = await tx
      .select({
        id: backgroundSourceBindings.id,
        drugId: backgroundSourceBindings.drugId,
        recordedBackgroundDigest: backgroundSourceBindings.recordedBackgroundDigest,
        fieldPath: backgroundSourceBindings.fieldPath,
        sourcePath: backgroundSourceBindings.sourcePath,
        sourceId: backgroundSourceBindings.sourceId,
        sourceKind: backgroundSourceBindings.sourceKind,
        sourceIdentifier: backgroundSourceBindings.sourceIdentifier,
        sourceKey: backgroundSourceBindings.sourceKey,
        sourceLabel: backgroundSourceBindings.sourceLabel,
        sourceLocator: backgroundSourceBindings.sourceLocator,
        sourceRetrievedAt: backgroundSourceBindings.sourceRetrievedAt,
        sourceExcerpt: backgroundSourceBindings.sourceExcerpt,
        assertionDigest: backgroundSourceBindings.assertionDigest,
        questionIntent: backgroundSourceBindings.questionIntent,
        bindingSchema: backgroundSourceBindings.bindingSchema,
      })
      .from(backgroundSourceBindings)
      .where(
        inArray(
          backgroundSourceBindings.id,
          bindingRows.map((row) => row.id),
        ),
      )
    const persistedBindingById = new Map(persistedBindings.map((row) => [row.id, row]))
    for (const expected of bindingRows) {
      assertPersistedFields(
        'background_source_bindings',
        expected.id,
        persistedBindingById.get(expected.id),
        expected,
      )
    }

    let sourceSnapshotId: string | null = null
    if (outcome.status === 'SUCCEEDED') {
      const deterministicSnapshotId = backgroundSourceSnapshotId(sourceId, outcome.contentHash)
      let persistedSnapshots = await tx
        .select({
          id: sourceSnapshots.id,
          sourceId: sourceSnapshots.sourceId,
          contentHash: sourceSnapshots.contentHash,
        })
        .from(sourceSnapshots)
        .where(
          and(
            eq(sourceSnapshots.sourceId, sourceId),
            eq(sourceSnapshots.contentHash, outcome.contentHash),
          ),
        )
        .limit(1)
      if (!persistedSnapshots[0]) {
        const previous = await tx
          .select({ id: sourceSnapshots.id })
          .from(sourceSnapshots)
          .where(eq(sourceSnapshots.sourceId, sourceId))
          .orderBy(desc(sourceSnapshots.retrievedAt), desc(sourceSnapshots.id))
          .limit(1)
        await tx
          .insert(sourceSnapshots)
          .values({
            id: deterministicSnapshotId,
            sourceId,
            previousSnapshotId: previous[0]?.id ?? null,
            retrievedAt: outcome.fetchedAt,
            hashAlgorithm: 'sha256',
            contentHash: outcome.contentHash,
            structuredData: {
              fetcherVersion: outcome.fetcherVersion,
              mediaType: outcome.mediaType,
            },
            rawSnapshotLocator: outcome.canonicalLocator,
          })
          .onConflictDoNothing()

        persistedSnapshots = await tx
          .select({
            id: sourceSnapshots.id,
            sourceId: sourceSnapshots.sourceId,
            contentHash: sourceSnapshots.contentHash,
          })
          .from(sourceSnapshots)
          .where(
            and(
              eq(sourceSnapshots.sourceId, sourceId),
              eq(sourceSnapshots.contentHash, outcome.contentHash),
            ),
          )
          .limit(1)
      }
      const persistedSnapshot = persistedSnapshots[0]
      assertPersistedFields('source_snapshots', deterministicSnapshotId, persistedSnapshot, {
        sourceId,
        contentHash: outcome.contentHash,
      })
      sourceSnapshotId = persistedSnapshot!.id
    }

    const fetchRow =
      outcome.status === 'SUCCEEDED'
        ? {
            id: fetchId,
            sourceId,
            sourceKind: group.sourceIdentity.kind,
            sourceIdentifier: group.sourceIdentity.identifier,
            sourceKey: group.sourceKey,
            status: outcome.status,
            sourceSnapshotId,
            fetcherVersion: outcome.fetcherVersion,
            attemptedAt: outcome.fetchedAt,
            completedAt,
            failureCode: null,
            failureDetail: null,
          }
        : {
            id: fetchId,
            sourceId,
            sourceKind: group.sourceIdentity.kind,
            sourceIdentifier: group.sourceIdentity.identifier,
            sourceKey: group.sourceKey,
            status: outcome.status,
            sourceSnapshotId: null,
            fetcherVersion: outcome.fetcherVersion,
            attemptedAt: outcome.fetchedAt,
            completedAt,
            failureCode: outcome.errorCode,
            failureDetail: outcome.errorMessage,
          }
    await tx.insert(backgroundSourceFetches).values(fetchRow).onConflictDoNothing()

    const persistedFetchRows = await tx
      .select({
        id: backgroundSourceFetches.id,
        sourceId: backgroundSourceFetches.sourceId,
        sourceKind: backgroundSourceFetches.sourceKind,
        sourceIdentifier: backgroundSourceFetches.sourceIdentifier,
        sourceKey: backgroundSourceFetches.sourceKey,
        status: backgroundSourceFetches.status,
        sourceSnapshotId: backgroundSourceFetches.sourceSnapshotId,
        fetcherVersion: backgroundSourceFetches.fetcherVersion,
        attemptedAt: backgroundSourceFetches.attemptedAt,
        completedAt: backgroundSourceFetches.completedAt,
        failureCode: backgroundSourceFetches.failureCode,
        failureDetail: backgroundSourceFetches.failureDetail,
      })
      .from(backgroundSourceFetches)
      .where(eq(backgroundSourceFetches.id, fetchId))
      .limit(1)
    assertPersistedFields('background_source_fetches', fetchId, persistedFetchRows[0], fetchRow)

    if (outcome.status !== 'SUCCEEDED' || !sourceSnapshotId) return []

    const checks = group.bindings.map((prepared, index) => {
      const persistedBindingId = bindingRows[index]!.id
      const result = evaluateBackgroundSourceAssertion(prepared.binding, {
        status: 'SUCCEEDED',
        sourceKey: group.sourceKey,
        text: outcome.comparisonText,
      })
      return {
        id: backgroundAssertionCheckId({
          bindingId: persistedBindingId,
          fetchId,
          checkerVersion: BACKGROUND_ASSERTION_CHECKER_VERSION,
        }),
        persistedBindingId,
        binding: prepared,
        fetchId,
        sourceId,
        sourceSnapshotId,
        sourceContentHash: outcome.contentHash,
        result,
        checkedAt: completedAt,
      } satisfies PersistedBackgroundAssertionCheck
    })

    if (checks.length > 0) {
      const checkRows = checks.map((check) => ({
        id: check.id,
        bindingId: check.persistedBindingId,
        bindingAssertionDigest: check.binding.binding.assertionDigest,
        fetchId: check.fetchId,
        sourceId: check.sourceId,
        sourceKey: group.sourceKey,
        sourceSnapshotId: check.sourceSnapshotId,
        fetchStatus: 'SUCCEEDED' as const,
        result: check.result,
        checkerVersion: BACKGROUND_ASSERTION_CHECKER_VERSION,
        details: {
          sourceContentHash: check.sourceContentHash,
          recordedExcerptDigest: prefixedDigest(check.binding.binding.excerpt),
        },
        checkedAt: check.checkedAt,
      }))
      await tx.insert(backgroundAssertionChecks).values(checkRows).onConflictDoNothing()

      const persistedCheckRows = await tx
        .select({
          id: backgroundAssertionChecks.id,
          bindingId: backgroundAssertionChecks.bindingId,
          bindingAssertionDigest: backgroundAssertionChecks.bindingAssertionDigest,
          fetchId: backgroundAssertionChecks.fetchId,
          sourceId: backgroundAssertionChecks.sourceId,
          sourceKey: backgroundAssertionChecks.sourceKey,
          sourceSnapshotId: backgroundAssertionChecks.sourceSnapshotId,
          fetchStatus: backgroundAssertionChecks.fetchStatus,
          result: backgroundAssertionChecks.result,
          checkerVersion: backgroundAssertionChecks.checkerVersion,
          details: backgroundAssertionChecks.details,
          checkedAt: backgroundAssertionChecks.checkedAt,
        })
        .from(backgroundAssertionChecks)
        .where(
          inArray(
            backgroundAssertionChecks.id,
            checkRows.map((row) => row.id),
          ),
        )
      const persistedCheckById = new Map(persistedCheckRows.map((row) => [row.id, row]))
      for (const expected of checkRows) {
        assertPersistedFields(
          'background_assertion_checks',
          expected.id,
          persistedCheckById.get(expected.id),
          expected,
        )
      }
    }
    return checks
  })
}

export async function persistBackgroundDriftCandidateRun(input: {
  jobKey: string
  startedAt: Date
  checks: readonly PersistedBackgroundAssertionCheck[]
}): Promise<number> {
  const observations = input.checks
    .map((check) => ({
      bindingId: check.persistedBindingId,
      checkId: check.id,
      result: check.result,
      sourceContentHash: check.sourceContentHash,
    }))
    .sort((left, right) => left.bindingId.localeCompare(right.bindingId))
  const inputDigest = sha256(stableJsonStringify(observations))
  const corpusVersion = sha256(
    stableJsonStringify(
      [...new Set(input.checks.map((check) => check.binding.recordedBackgroundDigest))].sort(),
    ),
  )
  const drifted = input.checks.filter((check) => check.result === 'DRIFTED')
  const candidateRows = drifted.map((check) => {
    const binding = check.binding.binding
    const stableCandidateKey = candidateKey({
      agent: BACKGROUND_DRIFT_AGENT,
      reasonSchemaVersion: BACKGROUND_DRIFT_REASON_SCHEMA_VERSION,
      subjectType: 'medicine',
      subjectId: binding.slug,
      fieldPath: binding.fieldPath,
      reason: 'SOURCE_DRIFT',
    })
    const stableOccurrenceKey = occurrenceKey(stableCandidateKey, {
      valueDigest: valueDigest({
        assertionDigest: binding.assertionDigest,
        recordedBackgroundDigest: check.binding.recordedBackgroundDigest,
      }),
      sourceDigests: [`${binding.sourceKey}:sha256:${check.sourceContentHash}`],
      parserVersion: BACKGROUND_ASSERTION_CHECKER_VERSION,
      // Exact envelope identity, not a global corpus timestamp or retry identity.
      corpusVersion: check.binding.recordedBackgroundDigest,
    })
    return {
      id: stableOccurrenceKey,
      candidateKey: stableCandidateKey,
      occurrenceKey: stableOccurrenceKey,
      agentName: BACKGROUND_DRIFT_AGENT,
      subjectType: 'medicine',
      subjectId: binding.slug,
      fieldPath: binding.fieldPath,
      reason: 'SOURCE_DRIFT',
      priority: '1',
      basis:
        'A successful deterministic fetch no longer reproduced the exact recorded source assertion.',
      question: `Does the current source still support the recorded assertion at ${binding.fieldPath}?`,
      evidence: {
        bindingId: check.persistedBindingId,
        assertionCheckId: check.id,
        fetchId: check.fetchId,
        sourceSnapshotId: check.sourceSnapshotId,
        sourceContentHash: check.sourceContentHash,
        recordedBackgroundDigest: check.binding.recordedBackgroundDigest,
        assertionDigest: binding.assertionDigest,
        result: check.result,
      },
      sourceIds: [binding.sourceKey] as string[],
      lastSeenAt: check.checkedAt,
    } as const
  })
  const outputDigest = sha256(
    stableJsonStringify(candidateRows.map((candidate) => candidate.occurrenceKey).sort()),
  )
  const runId = sha256(
    ['background-drift-agent-run/v1', input.jobKey, inputDigest, outputDigest].join('\u001f'),
  )
  const runRow = {
    id: runId,
    agentName: BACKGROUND_DRIFT_AGENT,
    agentVersion: BACKGROUND_DRIFT_AGENT_VERSION,
    reasonSchemaVersion: BACKGROUND_DRIFT_REASON_SCHEMA_VERSION,
    corpusVersion,
    inputDigest,
    outputDigest,
    runDate: input.startedAt.toISOString().slice(0, 10),
    seed: 0,
    recordsConsidered: input.checks.length,
    recordsUsed: input.checks.length,
    candidatesEmitted: candidateRows.length,
    status: 'COMPLETED' as const,
    failureDetail: null,
    startedAt: input.startedAt,
  }

  await db.transaction(async (tx) => {
    await tx.insert(agentRuns).values(runRow).onConflictDoNothing()
    const persistedRunRows = await tx
      .select({
        id: agentRuns.id,
        agentName: agentRuns.agentName,
        agentVersion: agentRuns.agentVersion,
        reasonSchemaVersion: agentRuns.reasonSchemaVersion,
        corpusVersion: agentRuns.corpusVersion,
        inputDigest: agentRuns.inputDigest,
        outputDigest: agentRuns.outputDigest,
        runDate: agentRuns.runDate,
        seed: agentRuns.seed,
        recordsConsidered: agentRuns.recordsConsidered,
        recordsUsed: agentRuns.recordsUsed,
        candidatesEmitted: agentRuns.candidatesEmitted,
        status: agentRuns.status,
        failureDetail: agentRuns.failureDetail,
        startedAt: agentRuns.startedAt,
      })
      .from(agentRuns)
      .where(eq(agentRuns.id, runId))
      .limit(1)
    assertPersistedFields('agent_runs', runId, persistedRunRows[0], runRow)

    for (const candidate of candidateRows) {
      const candidateRow = { ...candidate, runId }
      await tx.insert(agentReviewCandidates).values(candidateRow).onConflictDoNothing()
      const persistedCandidateRows = await tx
        .select({
          id: agentReviewCandidates.id,
          candidateKey: agentReviewCandidates.candidateKey,
          occurrenceKey: agentReviewCandidates.occurrenceKey,
          agentName: agentReviewCandidates.agentName,
          subjectType: agentReviewCandidates.subjectType,
          subjectId: agentReviewCandidates.subjectId,
          fieldPath: agentReviewCandidates.fieldPath,
          reason: agentReviewCandidates.reason,
          priority: agentReviewCandidates.priority,
          basis: agentReviewCandidates.basis,
          question: agentReviewCandidates.question,
          evidence: agentReviewCandidates.evidence,
          sourceIds: agentReviewCandidates.sourceIds,
        })
        .from(agentReviewCandidates)
        .where(eq(agentReviewCandidates.occurrenceKey, candidate.occurrenceKey))
        .limit(1)
      const persistedCandidate = persistedCandidateRows[0]
      assertPersistedFields(
        'agent_review_candidates',
        candidate.occurrenceKey,
        persistedCandidate,
        {
          id: candidate.id,
          candidateKey: candidate.candidateKey,
          occurrenceKey: candidate.occurrenceKey,
          agentName: candidate.agentName,
          subjectType: candidate.subjectType,
          subjectId: candidate.subjectId,
          fieldPath: candidate.fieldPath,
          reason: candidate.reason,
          priority: candidate.priority,
          basis: candidate.basis,
          question: candidate.question,
          sourceIds: candidate.sourceIds,
        },
      )
      const persistedEvidence = persistedCandidate?.evidence as Record<string, unknown> | undefined
      assertPersistedFields(
        'agent_review_candidates.evidence',
        candidate.occurrenceKey,
        persistedEvidence,
        {
          bindingId: candidate.evidence.bindingId,
          sourceSnapshotId: candidate.evidence.sourceSnapshotId,
          sourceContentHash: candidate.evidence.sourceContentHash,
          recordedBackgroundDigest: candidate.evidence.recordedBackgroundDigest,
          assertionDigest: candidate.evidence.assertionDigest,
          result: candidate.evidence.result,
        },
      )
      await tx
        .update(agentReviewCandidates)
        .set({
          lastSeenAt: sql`greatest(${agentReviewCandidates.lastSeenAt}, ${candidate.lastSeenAt})`,
        })
        .where(eq(agentReviewCandidates.occurrenceKey, candidate.occurrenceKey))
    }
  })
  return candidateRows.length
}

/**
 * Bounded production loop. It scans the current envelopes twice in small pages: once to choose the
 * least-recently-attempted source identities, then to retain only exact bindings for that small
 * set. Network work is outside transactions and failures are persisted as fetch results only.
 */
export async function runBackgroundFreshness(
  options: {
    limit?: number
    concurrency?: number
    maxRuntimeMs?: number
    fetchImplementation?: BackgroundFetchImplementation
    now?: () => Date
    nonce?: string
  } = {},
): Promise<BackgroundFreshnessRunSummary> {
  const limit = options.limit ?? 25
  const concurrency = options.concurrency ?? 4
  const maxRuntimeMs = options.maxRuntimeMs ?? 20 * 60_000
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new TypeError('Background freshness limit must be an integer from 1 to 100.')
  }
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) {
    throw new TypeError('Background freshness concurrency must be an integer from 1 to 8.')
  }
  if (!Number.isFinite(maxRuntimeMs) || maxRuntimeMs < 60_000 || maxRuntimeMs > 55 * 60_000) {
    throw new TypeError('Background freshness runtime must be from 1 to 55 minutes.')
  }

  const now = options.now ?? (() => new Date())
  const startedAt = now()
  const deadline = startedAt.getTime() + maxRuntimeMs
  const jobKey = backgroundFreshnessJobKey(startedAt, options.nonce ?? randomUUID())
  const schedule = await scheduledSourceKeys(limit)
  if (now().getTime() >= deadline) {
    throw new Error('Background freshness discovery exceeded its bounded runtime.')
  }
  const groups = await bindingsForSourceKeys(schedule.selected)

  const fetchCounts: BackgroundFreshnessRunSummary['fetchCounts'] = {
    SUCCEEDED: 0,
    UNREACHABLE: 0,
    UNSUPPORTED: 0,
    FAILED: 0,
  }
  const assertionCounts: BackgroundFreshnessRunSummary['assertionCounts'] = {
    CURRENT: 0,
    NUMBERS_CURRENT: 0,
    DRIFTED: 0,
  }
  const allChecks: PersistedBackgroundAssertionCheck[] = []
  let nextIndex = 0
  let stoppedAtRuntimeBound = false
  let processedSourceCount = 0

  const worker = async (): Promise<void> => {
    while (true) {
      const index = nextIndex
      nextIndex += 1
      const group = groups[index]
      if (!group) return
      if (now().getTime() >= deadline) {
        stoppedAtRuntimeBound = true
        return
      }
      const outcome = await fetchBackgroundSource(
        { sourceIdentity: group.sourceIdentity, sourceKey: group.sourceKey },
        { fetchImplementation: options.fetchImplementation, now },
      )
      const checks = await persistBackgroundSourceAttempt({ jobKey, group, outcome })
      fetchCounts[outcome.status] += 1
      processedSourceCount += 1
      for (const check of checks) assertionCounts[check.result] += 1
      allChecks.push(...checks)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, groups.length) }, () => worker()))
  const candidatesEmitted = await persistBackgroundDriftCandidateRun({
    jobKey,
    startedAt,
    checks: allChecks,
  })

  return {
    jobKey,
    currentSourceCount: schedule.currentSourceCount,
    selectedSourceCount: groups.length,
    processedSourceCount,
    bindingCount: groups.reduce((sum, group) => sum + group.bindings.length, 0),
    fetchCounts,
    assertionCounts,
    candidatesEmitted,
    stoppedAtRuntimeBound,
  }
}

/**
 * Public projection for one current envelope. Ranking precedes drift filtering: a later successful
 * CURRENT check clears an earlier drift, while a later failed fetch has no assertion row and leaves
 * the last decisive result untouched.
 */
export async function currentBackgroundDriftSummaries(input: {
  drugId: string
  slug: string
  background: MedicineRecordedBackground | null | undefined
}): Promise<StaleSourceSummary[]> {
  if (!input.background) return []
  const envelopeDigest = recordedBackgroundDigest(input.background)
  const currentBindings = collectBackgroundSourceAssertionBindings(input.slug, input.background)
  if (currentBindings.length === 0) return []
  const byId = new Map(
    currentBindings.map((binding) => {
      const persistedId = persistedBackgroundBindingId({
        drugId: input.drugId,
        recordedBackgroundDigest: envelopeDigest,
        binding,
      })
      return [persistedId, binding] as const
    }),
  )
  const rows = await db
    .select({
      bindingId: backgroundAssertionChecks.bindingId,
      assertionCheckId: backgroundAssertionChecks.id,
      result: backgroundAssertionChecks.result,
      checkedAt: backgroundAssertionChecks.checkedAt,
    })
    .from(backgroundAssertionChecks)
    .innerJoin(
      backgroundSourceBindings,
      eq(backgroundSourceBindings.id, backgroundAssertionChecks.bindingId),
    )
    .where(
      and(
        eq(backgroundSourceBindings.drugId, input.drugId),
        eq(backgroundSourceBindings.recordedBackgroundDigest, envelopeDigest),
        inArray(backgroundSourceBindings.id, [...byId.keys()]),
      ),
    )
    .orderBy(desc(backgroundAssertionChecks.checkedAt), desc(backgroundAssertionChecks.id))

  const decisive = new Set<string>()
  const stale: StaleSourceSummary[] = []
  for (const row of rows) {
    if (decisive.has(row.bindingId)) continue
    decisive.add(row.bindingId)
    if (row.result !== 'DRIFTED') continue
    const binding = byId.get(row.bindingId)
    if (!binding?.questionIntent) continue
    stale.push({
      bindingId: row.bindingId,
      assertionCheckId: row.assertionCheckId,
      intent: binding.questionIntent,
      sourceIdentifier: binding.sourceIdentity.identifier,
      sourceLabel: binding.sourceLabel,
      recordedAt: binding.retrievedAt,
      freshnessState: 'drifted',
      fieldPath: binding.fieldPath,
    })
  }
  return stale.sort(
    (left, right) =>
      left.intent.localeCompare(right.intent) ||
      left.fieldPath.localeCompare(right.fieldPath) ||
      left.sourceIdentifier.localeCompare(right.sourceIdentifier),
  )
}

/** Exported for operational reporting without exposing any fetched source body. */
export const backgroundFreshnessVersions = {
  fetcher: BACKGROUND_SOURCE_FETCHER_VERSION,
  checker: BACKGROUND_ASSERTION_CHECKER_VERSION,
} as const
