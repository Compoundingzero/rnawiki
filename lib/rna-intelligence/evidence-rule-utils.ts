import { sha256Hex } from './evidence-digest'
import { resolveSafeSourceLocator } from '@/lib/source-locator'
import {
  EVIDENCE_ENGINE_VERSION,
  EVIDENCE_PRESENTATION_ENGINE_VERSION,
  type DependencyImpact,
  type EvidenceEngineVersion,
  type EvidenceClaim,
  type EvidenceDependency,
  type EvidenceEntityRef,
  type EvidenceFinding,
  type EvidenceFindingLevel,
  type EvidenceIntelligenceInput,
  type EvidenceIntelligencePolicy,
  type EvidenceNode,
  type EvidenceProgramme,
  type EvidenceRuleGroup,
  type EvidenceRuleCode,
  type EvidenceSource,
  type EvidenceSourceSnapshot,
  type EvidenceTrial,
  type PlainLanguageSection,
  type ProgrammeVerdict,
  type TenSecondSummary,
} from './evidence-types'

export const DEFAULT_EVIDENCE_POLICY: EvidenceIntelligencePolicy = {
  freshness: {
    defaultMaxAgeDays: 365,
    maxAgeDaysBySourceType: {},
  },
  readability: {
    maxSentenceWords: 30,
    maxParagraphWords: 80,
    maxFirstScreenWords: 140,
    allowedAcronyms: ['RNA', 'DNA', 'FDA', 'EMA', 'DOI', 'NCT', 'RNAWIKI'],
    complexTerms: [
      'bioavailability',
      'pharmacokinetics',
      'pharmacodynamics',
      'statistical power',
      'surrogate endpoint',
      'hazard ratio',
      'confidence interval',
      'target engagement',
    ],
    absolutePhrases: [
      'always safe',
      'proven harmless',
      'can never work',
      'completely safe',
      'guaranteed to work',
    ],
  },
  vaguePopulationLabels: ['people', 'patients', 'adults', 'children', 'everyone', 'anyone'],
}

export interface EvidenceRuleContext {
  input: EvidenceIntelligenceInput
  policy: EvidenceIntelligencePolicy
  programmes: Map<string, EvidenceProgramme>
  trials: Map<string, EvidenceTrial>
  sources: Map<string, EvidenceSource>
  snapshots: Map<string, EvidenceSourceSnapshot>
  claims: Map<string, EvidenceClaim>
  nodes: Map<string, EvidenceNode>
  verdicts: Map<string, ProgrammeVerdict>
  summaries: Map<string, TenSecondSummary>
  sections: Map<string, PlainLanguageSection>
  snapshotsBySource: Map<string, EvidenceSourceSnapshot[]>
  dependencies: EvidenceDependency[]
  findings: EvidenceFinding[]
}

export function resolveEvidencePolicy(
  input: EvidenceIntelligenceInput,
): EvidenceIntelligencePolicy {
  return {
    freshness: {
      ...DEFAULT_EVIDENCE_POLICY.freshness,
      ...input.policy?.freshness,
      maxAgeDaysBySourceType: {
        ...DEFAULT_EVIDENCE_POLICY.freshness.maxAgeDaysBySourceType,
        ...input.policy?.freshness?.maxAgeDaysBySourceType,
      },
    },
    readability: {
      ...DEFAULT_EVIDENCE_POLICY.readability,
      ...input.policy?.readability,
    },
    vaguePopulationLabels:
      input.policy?.vaguePopulationLabels ?? DEFAULT_EVIDENCE_POLICY.vaguePopulationLabels,
  }
}

function mapById<T extends { id: string }>(values: readonly T[]): Map<string, T> {
  const result = new Map<string, T>()
  for (const value of values) {
    // First record wins. Duplicate identifiers are reported by rules; silently switching to the
    // last record would make every later cross-reference depend on input order.
    if (!result.has(value.id)) result.set(value.id, value)
  }
  return result
}

export function createEvidenceRuleContext(input: EvidenceIntelligenceInput): EvidenceRuleContext {
  const snapshotsBySource = new Map<string, EvidenceSourceSnapshot[]>()
  for (const snapshot of input.sourceSnapshots) {
    const entries = snapshotsBySource.get(snapshot.sourceId) ?? []
    entries.push(snapshot)
    snapshotsBySource.set(snapshot.sourceId, entries)
  }
  for (const entries of snapshotsBySource.values()) {
    entries.sort((a, b) => {
      const date = a.retrievedAt.localeCompare(b.retrievedAt)
      return date === 0 ? a.id.localeCompare(b.id) : date
    })
  }

  return {
    input,
    policy: resolveEvidencePolicy(input),
    programmes: mapById(input.programmes),
    trials: mapById(input.trials),
    sources: mapById(input.sources),
    snapshots: mapById(input.sourceSnapshots),
    claims: mapById(input.claims),
    nodes: mapById(input.evidenceNodes),
    verdicts: mapById(input.verdicts),
    summaries: mapById(input.tenSecondSummaries ?? []),
    sections: mapById(input.plainLanguageSections ?? []),
    snapshotsBySource,
    dependencies: [...(input.dependencies ?? [])],
    findings: [],
  }
}

export function sortedById<T extends { id: string }>(values: readonly T[]): T[] {
  return [...values].sort((a, b) => a.id.localeCompare(b.id))
}

export function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const raw of values) {
    const value = raw.trim().toLowerCase()
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates].sort()
}

export function addFinding(
  ctx: EvidenceRuleContext,
  finding: {
    level: EvidenceFindingLevel
    group: EvidenceRuleGroup
    code: EvidenceRuleCode
    message: string
    entity: EvidenceEntityRef
    field: string
    correctiveAction: string
    sourceId?: string
    claimId?: string
  },
): void {
  ctx.findings.push({
    level: finding.level,
    group: finding.group,
    code: finding.code,
    message: finding.message,
    affectedEntity: finding.entity,
    affectedField: finding.field,
    correctiveAction: finding.correctiveAction,
    ...(finding.sourceId === undefined ? {} : { sourceId: finding.sourceId }),
    ...(finding.claimId === undefined ? {} : { claimId: finding.claimId }),
  })
}

export function ref(
  type: EvidenceEntityRef['type'],
  id: string,
  field?: string,
): EvidenceEntityRef {
  return field === undefined ? { type, id } : { type, id, field }
}

export function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/** Strict enough to reject locale dates while accepting ISO dates and ISO timestamps. */
export function parseIsoDate(value: string | undefined): number | null {
  if (!hasText(value)) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const calendarDate = new Date(Date.UTC(year, month - 1, day))
  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return null
  }
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function elapsedDays(later: number, earlier: number): number {
  return Math.floor((later - earlier) / 86_400_000)
}

export function wordCount(text: string): number {
  return text.trim().length === 0
    ? 0
    : (text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length
}

/**
 * Stable JSON used only for the evidence input digest. Object keys are sorted recursively; arrays
 * retain their submitted order because phase events and prose sections can be order-sensitive.
 * Undefined object fields are omitted exactly as JSON.stringify would omit them.
 */
export function canonicalStringify(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value)
  if (typeof value === 'number') {
    return Number.isFinite(value) ? JSON.stringify(value) : JSON.stringify(String(value))
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => (entry === undefined ? 'null' : canonicalStringify(entry))).join(',')}]`
  }
  if (typeof value === 'object') {
    const object = value as Record<string, unknown>
    const entries = Object.keys(object)
      .filter((key) => object[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalStringify(object[key])}`)
    return `{${entries.join(',')}}`
  }
  return JSON.stringify(String(value))
}

export function evidenceEngineVersionForInput(
  input: EvidenceIntelligenceInput,
): EvidenceEngineVersion {
  return input.presentation?.schemaVersion === 'programme-presentation/v1'
    ? EVIDENCE_PRESENTATION_ENGINE_VERSION
    : EVIDENCE_ENGINE_VERSION
}

export function evidenceInputDigest(input: EvidenceIntelligenceInput): string {
  // There is intentionally no generated-at value. Semantic dates explicitly present in `input`
  // remain part of the evidence record; a runtime clock reading never enters the digest.
  return sha256Hex(
    canonicalStringify({ engineVersion: evidenceEngineVersionForInput(input), input }),
  )
}

export const DEPENDENCY_IMPACT_RANK: Record<DependencyImpact, number> = {
  LOW_RISK_EXACT_DATA: 0,
  INTERPRETIVE_REVIEW_REQUIRED: 1,
  POSSIBLE_VERDICT_IMPACT: 2,
  SAFETY_CRITICAL_REVIEW: 3,
}

export function higherImpact(a: DependencyImpact, b: DependencyImpact): DependencyImpact {
  return DEPENDENCY_IMPACT_RANK[a] >= DEPENDENCY_IMPACT_RANK[b] ? a : b
}

export function entityKey(entity: EvidenceEntityRef): string {
  return `${entity.type}\u0000${entity.id}\u0000${entity.field ?? ''}`
}

export function findingSortKey(finding: EvidenceFinding): string {
  return [
    finding.group,
    finding.code,
    finding.affectedEntity.type,
    finding.affectedEntity.id,
    finding.affectedField,
    finding.sourceId ?? '',
    finding.claimId ?? '',
    finding.level,
  ].join('\u0000')
}

export function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort()
}

export function isValidCanonicalLocator(locator: string): boolean {
  return resolveSafeSourceLocator(locator) !== null
}

export function claimsForNode(ctx: EvidenceRuleContext, node: EvidenceNode): EvidenceClaim[] {
  return uniqueSorted([...node.supportingClaimIds, ...node.contradictingClaimIds])
    .map((id) => ctx.claims.get(id))
    .filter((claim): claim is EvidenceClaim => claim !== undefined)
}

export function nodesForProgramme(ctx: EvidenceRuleContext, programmeId: string): EvidenceNode[] {
  return sortedById(ctx.input.evidenceNodes.filter((node) => node.programmeId === programmeId))
}

export function claimsForProgramme(ctx: EvidenceRuleContext, programmeId: string): EvidenceClaim[] {
  return sortedById(ctx.input.claims.filter((claim) => claim.programmeId === programmeId))
}
