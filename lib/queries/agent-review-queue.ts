import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  ne,
  or,
  sql,
  type SQL,
} from 'drizzle-orm'

import { db } from '@/db'
import {
  agentCurrentRuns,
  agentQueueDecisions,
  agentReviewCandidates,
  agentRunCandidates,
  agentRuns,
  drugs,
  users,
} from '@/db/schema'
import {
  AGENT_REVIEW_DECISIONS,
  AGENT_REVIEW_CALIBRATION_INACTIVE_MESSAGE,
  AGENT_REVIEW_EXPLANATION_MAX_LENGTH,
  canReviewAgentEvidence,
  type AgentReviewDecision,
  type AgentReviewLane,
  type AgentReviewOccurrenceState,
  type AgentReviewOccurrenceStateFilter,
  type AgentReviewSeverity,
  type AgentReviewStateFilter,
} from '@/lib/agent-review-policy'
import { valueDigest } from '@/lib/agents/core/identity'
import {
  agentLiveDecisionBaselineDigest,
  agentLiveDecisionRelevantMedicineSlugs,
  buildAgentLiveDecisionContext,
  type AgentLiveSourceBinding,
  type AgentLiveStoredField,
} from '@/lib/agents/core/live-decision-context'
import { canonicalLocatorForBackgroundSource } from '@/lib/background/source-fetch'
import { BACKGROUND_SOURCE_KINDS, type BackgroundSourceKind } from '@/lib/background/types'
import { newId } from '@/lib/ids'
import { resolveSafeSourceLocator } from '@/lib/source-locator'
import { stableJsonStringify } from '@/lib/stable-json'

const DEFAULT_LIMIT = 40
const MAX_LIMIT = 100
const MAX_OFFSET = 10_000
const HISTORY_PAGE_LIMIT = 50
const DIGEST_PATTERN = /^[0-9a-f]{64}$/u

export type AgentReviewQueueErrorCode =
  | 'not_authorized'
  | 'not_found'
  | 'stale_occurrence'
  | 'stale_evidence'
  | 'invalid_decision'
  | 'invalid_explanation'

export class AgentReviewQueueError extends Error {
  constructor(
    readonly code: AgentReviewQueueErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'AgentReviewQueueError'
  }
}

export type AgentReviewQueueState = 'AWAITING_REVIEW' | 'DECIDED' | 'EVIDENCE_CHANGED'

export interface AgentReviewDecisionRecord {
  id: string
  candidateKey: string
  occurrenceKey: string
  decision: AgentReviewDecision
  explanation: string
  evidenceDigest: string
  evidenceChanged: boolean
  decidedAt: string
  reviewer: { id: string; name: string; handle: string }
}

export interface AgentReviewQueueItem {
  candidateKey: string
  occurrenceKey: string
  medicine: { slug: string; name: string }
  fieldPath: string
  agent: { id: string; version: string; reasonSchemaVersion: string }
  reason: string
  severity: AgentReviewSeverity | 'not_recorded'
  lane: AgentReviewLane | 'not_recorded'
  provenanceTier: string
  occurrenceState: AgentReviewOccurrenceState
  state: AgentReviewQueueState
  evidenceChanged: boolean
  score: number
  scoreExplanation: string
  rankingFeatures: Record<string, unknown>
  calibrationMessage: string | null
  question: string
  sourceCount: number
  decisionEventCount: number
  latestDecision: AgentReviewDecisionRecord | null
  evidenceDigest: string
  corpusVersion: string
  timestamps: {
    firstSeenAt: string
    lastSeenAt: string
    observedAt: string
    activatedAt: string
    runStartedAt: string
    runDate: string
  }
}

export interface AgentReviewQueueList {
  items: readonly AgentReviewQueueItem[]
  limit: number
  offset: number
  hasMore: boolean
}

export interface AgentReviewQueueFilters {
  limit?: number
  offset?: number
  agent?: string
  reason?: string
  severity?: AgentReviewSeverity
  lane?: AgentReviewLane
  provenanceTier?: string
  state?: AgentReviewStateFilter
  occurrenceState?: AgentReviewOccurrenceStateFilter
  sourceChanged?: boolean
  conflict?: boolean
  freshnessDrift?: boolean
  coverageGap?: boolean
  chemistryIdentity?: boolean
  quantitativeIntegrity?: boolean
  query?: string
}

export interface AgentEvidenceChangeFlags {
  evidence: boolean
  observation: boolean
  sources: boolean
  agentVersion: boolean
  corpusVersion: boolean
}

export interface AgentReviewPriorOccurrence {
  occurrenceKey: string
  evidenceDigest: string | null
  agentVersion: string
  reasonSchemaVersion: string
  corpusVersion: string
  sourceCount: number
  firstSeenAt: string
  lastSeenAt: string
  changesFromCurrent: AgentEvidenceChangeFlags
}

export interface AgentReviewSourceMetadata {
  /** Exact source-controlled version. Null means it was not recorded; no proxy is fabricated. */
  version: string | null
  /** Exact source-controlled effective date. Null means it was not recorded. */
  effectiveDate: string | null
}

export interface AgentReviewQueueDetail extends AgentReviewQueueItem {
  basis: string
  rankingFeatures: Record<string, unknown>
  evidence: {
    digest: string
    canonical: Record<string, unknown>
    observation: Record<string, unknown>
    sourceReadings: readonly Record<string, unknown>[]
    sourceMetadata: readonly AgentReviewSourceMetadata[]
    sourceLinks: readonly (string | null)[]
    sourceReadingDigests: readonly string[]
    sourceSnapshotDigests: readonly string[]
  }
  liveDecision: {
    contextDigest: string
    baselineDigest: string | null
    ready: boolean
    staleReason:
      | null
      | 'baseline_missing'
      | 'medicine_binding_missing'
      | 'source_binding_missing'
      | 'stored_value_or_source_changed'
    storedField: AgentLiveStoredField
    relevantMedicineSlugs: readonly string[]
    missingMedicineSlugs: readonly string[]
    sourceBindings: readonly AgentLiveSourceBinding[]
    allSourcesBound: boolean
  }
  priorOccurrences: readonly AgentReviewPriorOccurrence[]
  decisions: readonly AgentReviewDecisionRecord[]
  historyPagination: {
    occurrences: { offset: number; limit: number; hasMore: boolean }
    decisions: { offset: number; limit: number; hasMore: boolean }
  }
  historyTruncated: { occurrences: boolean; decisions: boolean }
}

export interface AgentReviewHistoryOptions {
  occurrenceOffset?: number
  decisionOffset?: number
}

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function asSourceReadings(evidence: Record<string, unknown>): Record<string, unknown>[] {
  const value = evidence.sourceReadings
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    const record = asRecord(entry)
    return Object.keys(record).length === 0 ? [] : [record]
  })
}

const BACKGROUND_SOURCE_KIND_SET = new Set<string>(BACKGROUND_SOURCE_KINDS)

function sourceReadingLink(reading: Record<string, unknown>): string | null {
  const kind = reading.kind
  const identifier = reading.identifier
  if (
    typeof kind !== 'string' ||
    !BACKGROUND_SOURCE_KIND_SET.has(kind) ||
    typeof identifier !== 'string' ||
    !identifier.trim()
  ) {
    return null
  }
  const canonical = canonicalLocatorForBackgroundSource({
    kind: kind as BackgroundSourceKind,
    identifier,
  })
  const recordedLocator = typeof reading.locator === 'string' ? reading.locator : null
  return resolveSafeSourceLocator(canonical ?? recordedLocator ?? '')?.href ?? null
}

function numberFromNumeric(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function sortedStrings(values: readonly string[]): string[] {
  return [...values].sort()
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return stableJsonStringify(sortedStrings(left)) === stableJsonStringify(sortedStrings(right))
}

function rankingFeatureText(features: Record<string, unknown>): string {
  const entries = Object.entries(features).sort(([left], [right]) => left.localeCompare(right))
  if (entries.length === 0) return 'No deterministic ranking features were persisted.'
  return `Deterministic ranking features: ${entries
    .map(([key, value]) => `${key}=${stableJsonStringify(value)}`)
    .join('; ')}.`
}

function calibrationMessage(features: Record<string, unknown>): string | null {
  return features.calibration === 'INSUFFICIENT_REVIEW_HISTORY'
    ? AGENT_REVIEW_CALIBRATION_INACTIVE_MESSAGE
    : null
}

function boundedLimit(value: number | undefined): number {
  return Math.min(MAX_LIMIT, Math.max(1, Math.trunc(value ?? DEFAULT_LIMIT)))
}

function boundedOffset(value: number | undefined): number {
  return Math.min(MAX_OFFSET, Math.max(0, Math.trunc(value ?? 0)))
}

function historyOffset(value: number | undefined): number {
  if (value === undefined || !Number.isSafeInteger(value)) return 0
  return Math.max(0, value)
}

const exactDecisionExists = sql<boolean>`exists (
  select 1 from agent_queue_decisions exact_decision
  where exact_decision.occurrence_key = ${agentReviewCandidates.occurrenceKey}
)`

const changedEvidenceExists = sql<boolean>`exists (
  select 1 from agent_review_candidates prior_occurrence
  where prior_occurrence.candidate_key = ${agentReviewCandidates.candidateKey}
    and prior_occurrence.occurrence_key <> ${agentReviewCandidates.occurrenceKey}
    and prior_occurrence.evidence_digest is distinct from ${agentReviewCandidates.evidenceDigest}
)`

const sourceChangedFeature = sql<boolean>`coalesce(${agentRunCandidates.rankingFeatures}->>'sourceChanged', 'false') = 'true'`
const sourceDisagreementFeature = sql<boolean>`coalesce(${agentRunCandidates.rankingFeatures}->>'sourceDisagreement', 'false') = 'true'`
const freshnessDriftFeature = sql<boolean>`coalesce(${agentRunCandidates.rankingFeatures}->>'confirmedSourceDrift', 'false') = 'true'`
const coverageGapFeature = sql<boolean>`coalesce(${agentRunCandidates.rankingFeatures}->>'highValueCoverageGap', 'false') = 'true'`
const deterministicBlockFeature = sql<boolean>`coalesce(${agentRunCandidates.rankingFeatures}->>'deterministicBlock', 'false') = 'true'`
const changedOccurrenceFeature = sql<boolean>`coalesce(${agentRunCandidates.rankingFeatures}->>'changedOccurrence', 'false') = 'true'`
const neverReviewedFeature = sql<boolean>`coalesce(${agentRunCandidates.rankingFeatures}->>'neverReviewed', 'false') = 'true'`
const publicVisibilityFeature = sql<boolean>`coalesce(${agentRunCandidates.rankingFeatures}->>'publicVisibility', 'false') = 'true'`
const severityWeightFeature = sql<number>`case
  when coalesce(${agentRunCandidates.rankingFeatures}->>'severityWeight', '') ~ '^-?[0-9]+(?:\.[0-9]+)?$'
    then (${agentRunCandidates.rankingFeatures}->>'severityWeight')::numeric
  else 0
end`
const occurrenceStateFeature = sql<AgentReviewOccurrenceState>`${agentRunCandidates.rankingFeatures}->>'occurrenceState'`

function queueConditions(
  filters: AgentReviewQueueFilters,
  options: { suppressDecidedByDefault?: boolean } = {},
): SQL[] {
  const conditions: SQL[] = [
    eq(agentRuns.status, 'COMPLETED'),
    eq(agentCurrentRuns.agentName, agentRuns.agentName),
    eq(agentReviewCandidates.subjectType, 'medicine'),
    isNotNull(agentReviewCandidates.evidence),
    isNotNull(agentReviewCandidates.evidenceDigest),
    eq(agentReviewCandidates.evidenceDigest, agentRunCandidates.evidenceDigest),
    sql`${occurrenceStateFeature} in ('new', 'reopened', 'unchanged')`,
  ]
  if (filters.agent) conditions.push(eq(agentReviewCandidates.agentName, filters.agent))
  if (filters.reason) conditions.push(eq(agentReviewCandidates.reason, filters.reason))
  if (filters.severity) conditions.push(eq(agentRunCandidates.severity, filters.severity))
  if (filters.lane) conditions.push(eq(agentRunCandidates.audienceLane, filters.lane))
  if (filters.provenanceTier) {
    conditions.push(eq(agentRunCandidates.provenanceTier, filters.provenanceTier))
  }
  if (!filters.state && options.suppressDecidedByDefault !== false) {
    conditions.push(sql`not ${exactDecisionExists}`)
  }
  if (filters.state === 'unreviewed') conditions.push(sql`not ${exactDecisionExists}`)
  if (filters.state === 'decided') conditions.push(exactDecisionExists)
  if (filters.state === 'evidence_changed') {
    conditions.push(and(changedEvidenceExists, sql`not ${exactDecisionExists}`) as SQL)
  }
  if (filters.occurrenceState) {
    conditions.push(sql`${occurrenceStateFeature} = ${filters.occurrenceState}`)
  }
  if (filters.sourceChanged) conditions.push(sourceChangedFeature)
  if (filters.conflict) {
    conditions.push(
      or(eq(agentReviewCandidates.reason, 'SOURCES_DISAGREE'), sourceDisagreementFeature) as SQL,
    )
  }
  if (filters.freshnessDrift) {
    conditions.push(
      or(eq(agentReviewCandidates.reason, 'SOURCE_DRIFT'), freshnessDriftFeature) as SQL,
    )
  }
  if (filters.coverageGap) {
    conditions.push(or(eq(agentReviewCandidates.reason, 'COVERAGE_GAP'), coverageGapFeature) as SQL)
  }
  if (filters.chemistryIdentity) {
    conditions.push(
      or(
        eq(agentReviewCandidates.reason, 'POSSIBLE_DUPLICATE_SUBSTANCE'),
        eq(agentRunCandidates.audienceLane, 'chemist'),
      ) as SQL,
    )
  }
  if (filters.quantitativeIntegrity) {
    conditions.push(eq(agentRunCandidates.audienceLane, 'quantitative'))
  }
  const query = filters.query?.trim()
  if (query) {
    const pattern = `%${query}%`
    conditions.push(
      or(
        ilike(drugs.name, pattern),
        ilike(drugs.slug, pattern),
        ilike(agentReviewCandidates.agentName, pattern),
        ilike(agentReviewCandidates.reason, pattern),
        ilike(agentReviewCandidates.fieldPath, pattern),
      ) as SQL,
    )
  }
  return conditions
}

const activeColumns = {
  candidateKey: agentReviewCandidates.candidateKey,
  occurrenceKey: agentReviewCandidates.occurrenceKey,
  medicineSlug: drugs.slug,
  medicineName: drugs.name,
  fieldPath: agentReviewCandidates.fieldPath,
  agentName: agentReviewCandidates.agentName,
  candidateAgentVersion: agentReviewCandidates.agentVersion,
  candidateReasonSchemaVersion: agentReviewCandidates.reasonSchemaVersion,
  runAgentVersion: agentRuns.agentVersion,
  runReasonSchemaVersion: agentRuns.reasonSchemaVersion,
  reason: agentReviewCandidates.reason,
  severity: agentRunCandidates.severity,
  lane: agentRunCandidates.audienceLane,
  provenanceTier: agentRunCandidates.provenanceTier,
  occurrenceState: occurrenceStateFeature,
  score: agentRunCandidates.priority,
  basis: agentRunCandidates.basis,
  question: agentRunCandidates.question,
  evidenceDigest: agentRunCandidates.evidenceDigest,
  sourceIds: agentReviewCandidates.sourceIds,
  sourceSnapshotDigests: agentReviewCandidates.sourceSnapshotDigests,
  rankingFeatures: agentRunCandidates.rankingFeatures,
  evidenceChanged: changedEvidenceExists,
  corpusVersion: agentRuns.corpusVersion,
  firstSeenAt: agentReviewCandidates.firstSeenAt,
  lastSeenAt: agentReviewCandidates.lastSeenAt,
  observedAt: agentRunCandidates.observedAt,
  activatedAt: agentCurrentRuns.activatedAt,
  runStartedAt: agentRuns.startedAt,
  runDate: agentRuns.runDate,
}

type ActiveRow = Awaited<ReturnType<typeof selectActiveRows>>[number]

async function selectActiveRows(filters: AgentReviewQueueFilters) {
  const limit = boundedLimit(filters.limit)
  const offset = boundedOffset(filters.offset)
  return db
    .select(activeColumns)
    .from(agentCurrentRuns)
    .innerJoin(agentRuns, eq(agentRuns.id, agentCurrentRuns.runId))
    .innerJoin(agentRunCandidates, eq(agentRunCandidates.runId, agentCurrentRuns.runId))
    .innerJoin(
      agentReviewCandidates,
      and(
        eq(agentReviewCandidates.candidateKey, agentRunCandidates.candidateKey),
        eq(agentReviewCandidates.occurrenceKey, agentRunCandidates.occurrenceKey),
        eq(agentReviewCandidates.agentName, agentCurrentRuns.agentName),
      ),
    )
    .innerJoin(drugs, eq(drugs.slug, agentReviewCandidates.subjectId))
    .where(and(...queueConditions(filters)))
    .orderBy(
      desc(deterministicBlockFeature),
      desc(freshnessDriftFeature),
      desc(sourceDisagreementFeature),
      desc(coverageGapFeature),
      desc(changedOccurrenceFeature),
      desc(sourceChangedFeature),
      desc(neverReviewedFeature),
      desc(publicVisibilityFeature),
      desc(severityWeightFeature),
      desc(agentRunCandidates.priority),
      asc(agentReviewCandidates.agentName),
      asc(agentReviewCandidates.occurrenceKey),
    )
    .limit(limit + 1)
    .offset(offset)
}

function decisionRecord(
  row: {
    id: string
    candidateKey: string
    occurrenceKey: string
    decision: AgentReviewDecision
    explanation: string | null
    evidenceDigest: string
    decidedAt: Date
    reviewerId: string
    reviewerName: string
    reviewerHandle: string
  },
  currentEvidenceDigest: string,
): AgentReviewDecisionRecord {
  return {
    id: row.id,
    candidateKey: row.candidateKey,
    occurrenceKey: row.occurrenceKey,
    decision: row.decision,
    explanation: row.explanation ?? '',
    evidenceDigest: row.evidenceDigest,
    evidenceChanged: row.evidenceDigest !== currentEvidenceDigest,
    decidedAt: iso(row.decidedAt),
    reviewer: { id: row.reviewerId, name: row.reviewerName, handle: row.reviewerHandle },
  }
}

const decisionColumns = {
  id: agentQueueDecisions.id,
  candidateKey: agentQueueDecisions.candidateKey,
  occurrenceKey: agentQueueDecisions.occurrenceKey,
  decision: agentQueueDecisions.decision,
  explanation: agentQueueDecisions.explanation,
  evidenceDigest: agentQueueDecisions.evidenceDigest,
  decidedAt: agentQueueDecisions.decidedAt,
  reviewerId: users.id,
  reviewerName: users.name,
  reviewerHandle: users.handle,
}

async function listDecisionSummaries(rows: readonly ActiveRow[]) {
  if (rows.length === 0) {
    return {
      counts: new Map<string, number>(),
      latest: new Map<string, AgentReviewDecisionRecord>(),
    }
  }
  const candidateKeys = [...new Set(rows.map((row) => row.candidateKey))]
  const occurrenceKeys = [...new Set(rows.map((row) => row.occurrenceKey))]
  const [countRows, latestRows] = await Promise.all([
    db
      .select({ candidateKey: agentQueueDecisions.candidateKey, value: count() })
      .from(agentQueueDecisions)
      .where(inArray(agentQueueDecisions.candidateKey, candidateKeys))
      .groupBy(agentQueueDecisions.candidateKey),
    db
      .selectDistinctOn([agentQueueDecisions.occurrenceKey], decisionColumns)
      .from(agentQueueDecisions)
      .innerJoin(users, eq(users.id, agentQueueDecisions.decidedByUserId))
      .where(inArray(agentQueueDecisions.occurrenceKey, occurrenceKeys))
      .orderBy(
        agentQueueDecisions.occurrenceKey,
        desc(agentQueueDecisions.decidedAt),
        desc(agentQueueDecisions.id),
      ),
  ])
  const evidenceByOccurrence = new Map(rows.map((row) => [row.occurrenceKey, row.evidenceDigest]))
  return {
    counts: new Map(countRows.map((row) => [row.candidateKey, row.value])),
    latest: new Map(
      latestRows.map((row) => [
        row.occurrenceKey,
        decisionRecord(row, evidenceByOccurrence.get(row.occurrenceKey) ?? row.evidenceDigest),
      ]),
    ),
  }
}

function itemFromRow(
  row: ActiveRow,
  summaries: Awaited<ReturnType<typeof listDecisionSummaries>>,
): AgentReviewQueueItem {
  const latestDecision = summaries.latest.get(row.occurrenceKey) ?? null
  const evidenceChanged = Boolean(row.evidenceChanged)
  const rankingFeatures = asRecord(row.rankingFeatures)
  return {
    candidateKey: row.candidateKey,
    occurrenceKey: row.occurrenceKey,
    medicine: { slug: row.medicineSlug, name: row.medicineName },
    fieldPath: row.fieldPath,
    agent: {
      id: row.agentName,
      version: row.candidateAgentVersion ?? row.runAgentVersion,
      reasonSchemaVersion: row.candidateReasonSchemaVersion ?? row.runReasonSchemaVersion,
    },
    reason: row.reason,
    severity: row.severity ?? 'not_recorded',
    lane: row.lane ?? 'not_recorded',
    provenanceTier: row.provenanceTier ?? 'not_recorded',
    occurrenceState: row.occurrenceState,
    state: latestDecision ? 'DECIDED' : evidenceChanged ? 'EVIDENCE_CHANGED' : 'AWAITING_REVIEW',
    evidenceChanged,
    score: numberFromNumeric(row.score),
    scoreExplanation: rankingFeatureText(rankingFeatures),
    rankingFeatures,
    calibrationMessage: calibrationMessage(rankingFeatures),
    question: row.question,
    sourceCount: row.sourceSnapshotDigests.length,
    decisionEventCount: summaries.counts.get(row.candidateKey) ?? 0,
    latestDecision,
    evidenceDigest: row.evidenceDigest,
    corpusVersion: row.corpusVersion,
    timestamps: {
      firstSeenAt: iso(row.firstSeenAt),
      lastSeenAt: iso(row.lastSeenAt),
      observedAt: iso(row.observedAt),
      activatedAt: iso(row.activatedAt),
      runStartedAt: iso(row.runStartedAt),
      runDate: row.runDate,
    },
  }
}

/** Only occurrences belonging to each agent's current immutable run can enter this projection. */
export async function listAgentReviewQueue(
  filters: AgentReviewQueueFilters = {},
): Promise<AgentReviewQueueList> {
  const limit = boundedLimit(filters.limit)
  const offset = boundedOffset(filters.offset)
  const selected = await selectActiveRows({ ...filters, limit, offset })
  const hasMore = selected.length > limit
  const rows = selected.slice(0, limit)
  const summaries = await listDecisionSummaries(rows)
  return { items: rows.map((row) => itemFromRow(row, summaries)), limit, offset, hasMore }
}

async function activeDetailRow(occurrenceKey: string) {
  const rows = await db
    .select({
      ...activeColumns,
      evidence: agentReviewCandidates.evidence,
      rankingFeatures: agentRunCandidates.rankingFeatures,
    })
    .from(agentCurrentRuns)
    .innerJoin(agentRuns, eq(agentRuns.id, agentCurrentRuns.runId))
    .innerJoin(agentRunCandidates, eq(agentRunCandidates.runId, agentCurrentRuns.runId))
    .innerJoin(
      agentReviewCandidates,
      and(
        eq(agentReviewCandidates.candidateKey, agentRunCandidates.candidateKey),
        eq(agentReviewCandidates.occurrenceKey, agentRunCandidates.occurrenceKey),
        eq(agentReviewCandidates.agentName, agentCurrentRuns.agentName),
      ),
    )
    .innerJoin(drugs, eq(drugs.slug, agentReviewCandidates.subjectId))
    .where(
      and(
        ...queueConditions({}, { suppressDecidedByDefault: false }),
        eq(agentReviewCandidates.occurrenceKey, occurrenceKey),
      ),
    )
    .limit(1)
  return rows[0]
}

export async function getAgentReviewQueueDetail(
  occurrenceKey: string,
  history: AgentReviewHistoryOptions = {},
): Promise<AgentReviewQueueDetail | null> {
  if (!DIGEST_PATTERN.test(occurrenceKey)) return null
  const current = await activeDetailRow(occurrenceKey)
  if (!current) return null
  const occurrenceOffset = historyOffset(history.occurrenceOffset)
  const decisionOffset = historyOffset(history.decisionOffset)

  const [summary, occurrenceRows, decisionRows] = await Promise.all([
    listDecisionSummaries([current]),
    db
      .select({
        occurrenceKey: agentReviewCandidates.occurrenceKey,
        evidenceDigest: agentReviewCandidates.evidenceDigest,
        evidence: agentReviewCandidates.evidence,
        sourceSnapshotDigests: agentReviewCandidates.sourceSnapshotDigests,
        agentVersion: agentReviewCandidates.agentVersion,
        reasonSchemaVersion: agentReviewCandidates.reasonSchemaVersion,
        runAgentVersion: agentRuns.agentVersion,
        runReasonSchemaVersion: agentRuns.reasonSchemaVersion,
        corpusVersion: agentRuns.corpusVersion,
        firstSeenAt: agentReviewCandidates.firstSeenAt,
        lastSeenAt: agentReviewCandidates.lastSeenAt,
      })
      .from(agentReviewCandidates)
      .innerJoin(agentRuns, eq(agentRuns.id, agentReviewCandidates.runId))
      .where(
        and(
          eq(agentReviewCandidates.candidateKey, current.candidateKey),
          ne(agentReviewCandidates.occurrenceKey, current.occurrenceKey),
        ),
      )
      .orderBy(desc(agentReviewCandidates.lastSeenAt), desc(agentReviewCandidates.occurrenceKey))
      .limit(HISTORY_PAGE_LIMIT + 1)
      .offset(occurrenceOffset),
    db
      .select(decisionColumns)
      .from(agentQueueDecisions)
      .innerJoin(users, eq(users.id, agentQueueDecisions.decidedByUserId))
      .where(eq(agentQueueDecisions.candidateKey, current.candidateKey))
      .orderBy(desc(agentQueueDecisions.decidedAt), desc(agentQueueDecisions.id))
      .limit(HISTORY_PAGE_LIMIT + 1)
      .offset(decisionOffset),
  ])

  const item = itemFromRow(current, summary)
  const canonical = asRecord(current.evidence)
  const observation = asRecord(canonical.observation)
  const currentSources = asSourceReadings(canonical)
  const sourceMetadata = currentSources.map((source): AgentReviewSourceMetadata => ({
    version: typeof source.version === 'string' && source.version.trim() ? source.version : null,
    effectiveDate:
      typeof source.effectiveDate === 'string' && source.effectiveDate.trim()
        ? source.effectiveDate
        : null,
  }))
  const relevantMedicineSlugs = agentLiveDecisionRelevantMedicineSlugs(
    current.medicineSlug,
    canonical,
  )
  const liveMedicines = await db
    .select({ slug: drugs.slug, recordedBackground: drugs.recordedBackground })
    .from(drugs)
    .where(inArray(drugs.slug, relevantMedicineSlugs))
    .orderBy(asc(drugs.slug))
  const liveContext = buildAgentLiveDecisionContext({
    candidateKey: current.candidateKey,
    occurrenceKey: current.occurrenceKey,
    evidenceDigest: current.evidenceDigest,
    subjectId: current.medicineSlug,
    fieldPath: current.fieldPath,
    evidence: canonical,
    medicines: liveMedicines,
  })
  const baselineDigest = agentLiveDecisionBaselineDigest(asRecord(current.rankingFeatures))
  const staleReason =
    baselineDigest === null
      ? 'baseline_missing'
      : liveContext.missingMedicineSlugs.length > 0
        ? 'medicine_binding_missing'
        : !liveContext.allSourcesBound
          ? 'source_binding_missing'
          : baselineDigest !== liveContext.digest
            ? 'stored_value_or_source_changed'
            : null
  const priorOccurrences = occurrenceRows
    .slice(0, HISTORY_PAGE_LIMIT)
    .map((row): AgentReviewPriorOccurrence => {
      const priorEvidence = asRecord(row.evidence)
      return {
        occurrenceKey: row.occurrenceKey,
        evidenceDigest: row.evidenceDigest,
        agentVersion: row.agentVersion ?? row.runAgentVersion,
        reasonSchemaVersion: row.reasonSchemaVersion ?? row.runReasonSchemaVersion,
        corpusVersion: row.corpusVersion,
        sourceCount: row.sourceSnapshotDigests.length,
        firstSeenAt: iso(row.firstSeenAt),
        lastSeenAt: iso(row.lastSeenAt),
        changesFromCurrent: {
          evidence: row.evidenceDigest !== current.evidenceDigest,
          observation:
            stableJsonStringify(asRecord(priorEvidence.observation)) !==
            stableJsonStringify(observation),
          sources: !sameStrings(row.sourceSnapshotDigests, current.sourceSnapshotDigests),
          agentVersion: (row.agentVersion ?? row.runAgentVersion) !== item.agent.version,
          corpusVersion: row.corpusVersion !== current.corpusVersion,
        },
      }
    })

  return {
    ...item,
    basis: current.basis,
    evidence: {
      digest: current.evidenceDigest,
      canonical,
      observation,
      sourceReadings: currentSources,
      sourceMetadata,
      sourceLinks: currentSources.map(sourceReadingLink),
      sourceReadingDigests: currentSources.map(valueDigest),
      sourceSnapshotDigests: current.sourceSnapshotDigests,
    },
    liveDecision: {
      contextDigest: liveContext.digest,
      baselineDigest,
      ready: staleReason === null,
      staleReason,
      storedField: liveContext.storedField,
      relevantMedicineSlugs: liveContext.relevantMedicineSlugs,
      missingMedicineSlugs: liveContext.missingMedicineSlugs,
      sourceBindings: liveContext.sourceBindings,
      allSourcesBound: liveContext.allSourcesBound,
    },
    priorOccurrences,
    decisions: decisionRows
      .slice(0, HISTORY_PAGE_LIMIT)
      .map((row) => decisionRecord(row, current.evidenceDigest)),
    historyPagination: {
      occurrences: {
        offset: occurrenceOffset,
        limit: HISTORY_PAGE_LIMIT,
        hasMore: occurrenceRows.length > HISTORY_PAGE_LIMIT,
      },
      decisions: {
        offset: decisionOffset,
        limit: HISTORY_PAGE_LIMIT,
        hasMore: decisionRows.length > HISTORY_PAGE_LIMIT,
      },
    },
    historyTruncated: {
      occurrences: occurrenceOffset > 0 || occurrenceRows.length > HISTORY_PAGE_LIMIT,
      decisions: decisionOffset > 0 || decisionRows.length > HISTORY_PAGE_LIMIT,
    },
  }
}

export interface RecordAgentReviewDecisionInput {
  occurrenceKey: string
  evidenceDigest: string
  liveContextDigest: string
  decision: AgentReviewDecision
  explanation: string
  actorUserId: string
}

/**
 * Revalidates exact current membership while holding its current-run row lock, then appends one
 * decision event. No medicine, source, verdict, candidate, membership, or publication table is
 * writable from this function.
 */
export async function recordAgentReviewDecision(
  input: RecordAgentReviewDecisionInput,
): Promise<AgentReviewDecisionRecord> {
  const explanation = input.explanation.trim()
  if (!AGENT_REVIEW_DECISIONS.includes(input.decision)) {
    throw new AgentReviewQueueError('invalid_decision', 'The review outcome is not valid.')
  }
  if (
    !DIGEST_PATTERN.test(input.occurrenceKey) ||
    !DIGEST_PATTERN.test(input.evidenceDigest) ||
    !DIGEST_PATTERN.test(input.liveContextDigest)
  ) {
    throw new AgentReviewQueueError('invalid_decision', 'The review identity is not valid.')
  }
  if (explanation.length === 0 || explanation.length > AGENT_REVIEW_EXPLANATION_MAX_LENGTH) {
    throw new AgentReviewQueueError(
      'invalid_explanation',
      `An explanation of 1 to ${AGENT_REVIEW_EXPLANATION_MAX_LENGTH} characters is required.`,
    )
  }

  return db.transaction(async (tx) => {
    const actorRows = await tx
      .select({
        id: users.id,
        name: users.name,
        handle: users.handle,
        isAdmin: users.isAdmin,
        trustTier: users.trustTier,
      })
      .from(users)
      .where(eq(users.id, input.actorUserId))
      .limit(1)
    const actor = actorRows[0]
    if (!actor || !canReviewAgentEvidence(actor)) {
      throw new AgentReviewQueueError(
        'not_authorized',
        'Only a steward or administrator may record an agent evidence decision.',
      )
    }

    const activeRows = await tx
      .select({
        candidateKey: agentRunCandidates.candidateKey,
        occurrenceKey: agentRunCandidates.occurrenceKey,
        membershipEvidenceDigest: agentRunCandidates.evidenceDigest,
        candidateEvidenceDigest: agentReviewCandidates.evidenceDigest,
        subjectId: agentReviewCandidates.subjectId,
        fieldPath: agentReviewCandidates.fieldPath,
        evidence: agentReviewCandidates.evidence,
        rankingFeatures: agentRunCandidates.rankingFeatures,
      })
      .from(agentCurrentRuns)
      .innerJoin(agentRuns, eq(agentRuns.id, agentCurrentRuns.runId))
      .innerJoin(agentRunCandidates, eq(agentRunCandidates.runId, agentCurrentRuns.runId))
      .innerJoin(
        agentReviewCandidates,
        and(
          eq(agentReviewCandidates.candidateKey, agentRunCandidates.candidateKey),
          eq(agentReviewCandidates.occurrenceKey, agentRunCandidates.occurrenceKey),
          eq(agentReviewCandidates.agentName, agentCurrentRuns.agentName),
        ),
      )
      .where(
        and(
          eq(agentRuns.status, 'COMPLETED'),
          eq(agentReviewCandidates.occurrenceKey, input.occurrenceKey),
        ),
      )
      .limit(1)
      .for('update')
    const active = activeRows[0]
    if (!active) {
      const known = await tx
        .select({ occurrenceKey: agentReviewCandidates.occurrenceKey })
        .from(agentReviewCandidates)
        .where(eq(agentReviewCandidates.occurrenceKey, input.occurrenceKey))
        .limit(1)
      if (known[0]) {
        throw new AgentReviewQueueError(
          'stale_occurrence',
          'This occurrence is no longer part of the agent’s current run. Reload before deciding.',
        )
      }
      throw new AgentReviewQueueError('not_found', 'No agent review occurrence matches this id.')
    }
    if (
      active.membershipEvidenceDigest !== input.evidenceDigest ||
      active.candidateEvidenceDigest !== input.evidenceDigest
    ) {
      throw new AgentReviewQueueError(
        'stale_evidence',
        'The evidence shown for this occurrence has changed. Reload before deciding.',
      )
    }

    const evidence = asRecord(active.evidence)
    const relevantMedicineSlugs = agentLiveDecisionRelevantMedicineSlugs(active.subjectId, evidence)
    const liveMedicines = await tx
      .select({ slug: drugs.slug, recordedBackground: drugs.recordedBackground })
      .from(drugs)
      .where(inArray(drugs.slug, relevantMedicineSlugs))
      .orderBy(asc(drugs.slug))
      .for('share')
    const liveContext = buildAgentLiveDecisionContext({
      candidateKey: active.candidateKey,
      occurrenceKey: active.occurrenceKey,
      evidenceDigest: active.candidateEvidenceDigest,
      subjectId: active.subjectId,
      fieldPath: active.fieldPath,
      evidence,
      medicines: liveMedicines,
    })
    const baselineDigest = agentLiveDecisionBaselineDigest(asRecord(active.rankingFeatures))
    if (
      baselineDigest === null ||
      baselineDigest !== liveContext.digest ||
      input.liveContextDigest !== liveContext.digest ||
      liveContext.missingMedicineSlugs.length > 0 ||
      !liveContext.allSourcesBound
    ) {
      throw new AgentReviewQueueError(
        'stale_evidence',
        'The stored medicine value or exact source binding shown for this occurrence has changed. Reload before deciding.',
      )
    }

    const inserted = await tx
      .insert(agentQueueDecisions)
      .values({
        id: newId('agdec'),
        candidateKey: active.candidateKey,
        occurrenceKey: active.occurrenceKey,
        decidedByUserId: actor.id,
        decision: input.decision,
        explanation,
        evidenceDigest: input.evidenceDigest,
      })
      .returning({
        id: agentQueueDecisions.id,
        candidateKey: agentQueueDecisions.candidateKey,
        occurrenceKey: agentQueueDecisions.occurrenceKey,
        decision: agentQueueDecisions.decision,
        explanation: agentQueueDecisions.explanation,
        evidenceDigest: agentQueueDecisions.evidenceDigest,
        decidedAt: agentQueueDecisions.decidedAt,
      })
    const row = inserted[0]
    if (!row) throw new AgentReviewQueueError('not_found', 'The decision could not be recorded.')
    return decisionRecord(
      {
        ...row,
        reviewerId: actor.id,
        reviewerName: actor.name,
        reviewerHandle: actor.handle,
      },
      input.evidenceDigest,
    )
  })
}
