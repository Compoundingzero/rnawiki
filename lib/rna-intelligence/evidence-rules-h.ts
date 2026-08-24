import type {
  DependencyImpact,
  DependencyImpactResult,
  EvidenceChange,
  EvidenceDependency,
  EvidenceEntityRef,
  EvidenceImpactPlan,
  SourceFreshnessResult,
} from './evidence-types'
import type { EvidenceRuleContext } from './evidence-rule-utils'
import {
  DEPENDENCY_IMPACT_RANK,
  addFinding,
  elapsedDays,
  entityKey,
  hasText,
  higherImpact,
  parseIsoDate,
  ref,
  sortedById,
  uniqueSorted,
} from './evidence-rule-utils'

const SURFACE_TYPES = new Set<EvidenceEntityRef['type']>([
  'TIMELINE',
  'METADATA',
  'SEARCH_DOCUMENT',
  'HOMEPAGE_CARD',
  'API_DOCUMENT',
  'COUNT',
])

function dependencySort(a: EvidenceDependency, b: EvidenceDependency): number {
  return `${entityKey(a.from)}\u0000${entityKey(a.to)}\u0000${a.impact}`.localeCompare(
    `${entityKey(b.from)}\u0000${entityKey(b.to)}\u0000${b.impact}`,
  )
}

function changeSort(a: EvidenceChange, b: EvidenceChange): number {
  return entityKey(a.entity).localeCompare(entityKey(b.entity))
}

function entityExists(ctx: EvidenceRuleContext, entity: EvidenceEntityRef): boolean {
  if (!hasText(entity.id)) return false
  switch (entity.type) {
    case 'MEDICINE':
      return entity.id === ctx.input.medicine.id
    case 'PROGRAMME':
      return ctx.programmes.has(entity.id)
    case 'TRIAL':
      return ctx.trials.has(entity.id)
    case 'CLAIM':
      return ctx.claims.has(entity.id)
    case 'EVIDENCE_NODE':
      return ctx.nodes.has(entity.id)
    case 'MECHANISM_STEP':
      return (
        ctx.input.presentation?.mechanismSteps.some(
          (step) =>
            `${ctx.input.presentation?.verdictRevisionId}:mechanism:${step.id}` === entity.id,
        ) ?? false
      )
    case 'SOURCE':
      return ctx.sources.has(entity.id)
    case 'SOURCE_SNAPSHOT':
      return ctx.snapshots.has(entity.id)
    case 'VERDICT':
      // Active programmes have a public conclusion record but deliberately no stopped-programme
      // classification. Its summary id is derived from the same canonical revision id, so it is
      // an exact materialized verdict target without inventing a failure code.
      return ctx.verdicts.has(entity.id) || ctx.summaries.has(`${entity.id}:summary`)
    case 'SUMMARY':
      return ctx.summaries.has(entity.id)
    case 'TIMELINE':
    case 'TIMELINE_EVENT':
      return entity.type === 'TIMELINE'
        ? true
        : (ctx.input.presentation?.timelineEvents.some(
            (event) =>
              `${ctx.input.presentation?.verdictRevisionId}:timeline:${event.id}` === entity.id,
          ) ?? false)
    case 'METADATA':
    case 'SEARCH_DOCUMENT':
    case 'HOMEPAGE_CARD':
    case 'API_DOCUMENT':
    case 'COUNT':
      // These are materialized/publication targets rather than input entity collections.
      return true
    case 'DEPENDENCY':
    case 'ENGINE_INPUT':
      return true
  }
}

function edgeMatchesChange(edge: EvidenceDependency, change: EvidenceChange): boolean {
  if (edge.from.type !== change.entity.type || edge.from.id !== change.entity.id) return false
  if (!edge.from.field) return true
  if (change.entity.field === edge.from.field) return true
  return change.changedFields.includes(edge.from.field)
}

function edgeMatchesEntity(edge: EvidenceDependency, entity: EvidenceEntityRef): boolean {
  if (edge.from.type !== entity.type || edge.from.id !== entity.id) return false
  return !edge.from.field || !entity.field || edge.from.field === entity.field
}

function impactAction(impact: DependencyImpact): string {
  switch (impact) {
    case 'LOW_RISK_EXACT_DATA':
      return 'Create an audited exact-data revision and refresh this dependent surface after validation.'
    case 'INTERPRETIVE_REVIEW_REQUIRED':
      return 'Create a human-review task and keep the current published interpretation visible meanwhile.'
    case 'POSSIBLE_VERDICT_IMPACT':
      return 'Require verdict-impact review before atomically publishing the programme revision.'
    case 'SAFETY_CRITICAL_REVIEW':
      return 'Escalate to safety-critical human review and preserve the current published revision until approval.'
  }
}

function detectDependencyCycles(ctx: EvidenceRuleContext, edges: EvidenceDependency[]): void {
  const adjacency = new Map<string, string[]>()
  const refs = new Map<string, EvidenceEntityRef>()
  for (const edge of edges) {
    const from = entityKey(edge.from)
    const to = entityKey(edge.to)
    refs.set(from, edge.from)
    refs.set(to, edge.to)
    const next = adjacency.get(from) ?? []
    next.push(to)
    adjacency.set(from, next)
  }
  for (const next of adjacency.values()) next.sort()

  const state = new Map<string, 0 | 1 | 2>()
  const reported = new Set<string>()

  const visit = (key: string): void => {
    state.set(key, 1)
    for (const next of adjacency.get(key) ?? []) {
      if ((state.get(next) ?? 0) === 0) {
        visit(next)
      } else if (state.get(next) === 1) {
        const cycleKey = [key, next].sort().join('\u0000')
        if (!reported.has(cycleKey)) {
          reported.add(cycleKey)
          const entity = refs.get(next) ?? ref('DEPENDENCY', next)
          addFinding(ctx, {
            level: 'BLOCK',
            group: 'H',
            code: 'H_DEPENDENCY_CYCLE',
            message: `The evidence dependency graph contains a cycle involving ${entity.type} "${entity.id}".`,
            entity,
            field: entity.field ?? 'dependencies',
            correctiveAction:
              'Remove the circular dependency so update impact can be calculated in one direction.',
          })
        }
      }
    }
    state.set(key, 2)
  }

  for (const key of [...refs.keys()].sort()) {
    if ((state.get(key) ?? 0) === 0) visit(key)
  }
}

function programmeIdForImpact(ctx: EvidenceRuleContext, entity: EvidenceEntityRef): string | null {
  switch (entity.type) {
    case 'PROGRAMME':
      return entity.id
    case 'TRIAL':
      return ctx.trials.get(entity.id)?.programmeId ?? null
    case 'CLAIM':
      return ctx.claims.get(entity.id)?.programmeId ?? null
    case 'EVIDENCE_NODE':
      return ctx.nodes.get(entity.id)?.programmeId ?? null
    case 'VERDICT':
      return ctx.verdicts.get(entity.id)?.programmeId ?? null
    case 'SUMMARY':
      return ctx.summaries.get(entity.id)?.programmeId ?? null
    default:
      return null
  }
}

function propagateChanges(
  ctx: EvidenceRuleContext,
  edges: EvidenceDependency[],
): DependencyImpactResult[] {
  const affected = new Map<string, DependencyImpactResult>()

  for (const change of [...(ctx.input.changes ?? [])].sort(changeSort)) {
    const first = edges.filter((edge) => edgeMatchesChange(edge, change))
    if (first.length === 0) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'H',
        code: 'H_DEPENDENCY_PATH_MISSING',
        message: `${change.entity.type} "${change.entity.id}" changed but has no dependency path.`,
        entity: change.entity,
        field: change.entity.field ?? change.changedFields[0] ?? 'dependencies',
        correctiveAction:
          'Link the changed field to every claim, evidence node, summary, verdict, and public surface that depends on it.',
      })
    }

    const queue: Array<{ entity: EvidenceEntityRef; impact: DependencyImpact }> = first.map(
      (edge) => ({ entity: edge.to, impact: edge.impact }),
    )
    const bestSeen = new Map<string, DependencyImpact>()

    while (queue.length > 0) {
      const current = queue.shift()
      if (!current) continue
      const key = entityKey(current.entity)
      const previous = bestSeen.get(key)
      if (previous && DEPENDENCY_IMPACT_RANK[previous] >= DEPENDENCY_IMPACT_RANK[current.impact]) {
        continue
      }
      bestSeen.set(key, current.impact)

      const existing = affected.get(key)
      const candidate: DependencyImpactResult = {
        entity: current.entity,
        impact: current.impact,
        via: change.entity,
      }
      if (
        !existing ||
        DEPENDENCY_IMPACT_RANK[candidate.impact] > DEPENDENCY_IMPACT_RANK[existing.impact] ||
        (candidate.impact === existing.impact &&
          entityKey(candidate.via).localeCompare(entityKey(existing.via)) < 0)
      ) {
        affected.set(key, candidate)
      }

      for (const edge of edges.filter((candidate) =>
        edgeMatchesEntity(candidate, current.entity),
      )) {
        queue.push({ entity: edge.to, impact: higherImpact(current.impact, edge.impact) })
      }
    }
  }

  return [...affected.values()].sort((a, b) =>
    entityKey(a.entity).localeCompare(entityKey(b.entity)),
  )
}

function buildImpactPlan(
  ctx: EvidenceRuleContext,
  affected: DependencyImpactResult[],
): EvidenceImpactPlan {
  let highestImpact: DependencyImpact | null = null
  for (const item of affected) {
    highestImpact = highestImpact === null ? item.impact : higherImpact(highestImpact, item.impact)
  }
  const requiresHumanReview = affected.some((item) => item.impact !== 'LOW_RISK_EXACT_DATA')

  return {
    affected,
    affectedClaimIds: uniqueSorted(
      affected.filter((item) => item.entity.type === 'CLAIM').map((item) => item.entity.id),
    ),
    affectedEvidenceNodeIds: uniqueSorted(
      affected.filter((item) => item.entity.type === 'EVIDENCE_NODE').map((item) => item.entity.id),
    ),
    affectedProgrammeIds: uniqueSorted(
      affected
        .map((item) => programmeIdForImpact(ctx, item.entity))
        .filter((id): id is string => id !== null),
    ),
    affectedSurfaces: affected
      .filter((item) => SURFACE_TYPES.has(item.entity.type))
      .map((item) => item.entity)
      .sort((a, b) => entityKey(a).localeCompare(entityKey(b))),
    highestImpact,
    requiresHumanReview,
    preserveCurrentPublishedRevisionUntilReview: requiresHumanReview,
  }
}

function freshnessResults(ctx: EvidenceRuleContext): SourceFreshnessResult[] {
  const asOf = parseIsoDate(ctx.input.asOfDate)
  if (asOf === null) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'H',
      code: 'H_AS_OF_DATE_INVALID',
      message: 'Evidence freshness cannot be checked because asOfDate is not a valid ISO date.',
      entity: ref('ENGINE_INPUT', 'evidence', 'asOfDate'),
      field: 'asOfDate',
      correctiveAction:
        'Supply the explicit review date in ISO format; do not use the runtime clock.',
    })
  }
  const invalidFreshnessFields = [
    {
      field: 'policy.freshness.defaultMaxAgeDays',
      value: ctx.policy.freshness.defaultMaxAgeDays,
    },
    ...Object.entries(ctx.policy.freshness.maxAgeDaysBySourceType ?? {}).map(
      ([sourceType, value]) => ({
        field: `policy.freshness.maxAgeDaysBySourceType.${sourceType}`,
        value,
      }),
    ),
  ].filter(({ value }) => !Number.isFinite(value) || value < 1)
  for (const invalid of invalidFreshnessFields) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'H',
      code: 'H_FRESHNESS_POLICY_INVALID',
      message: `Source freshness setting "${invalid.field}" must be at least one day.`,
      entity: ref('ENGINE_INPUT', 'evidence', invalid.field),
      field: invalid.field,
      correctiveAction: 'Configure a positive maximum source age.',
    })
  }

  return sortedById(ctx.input.sources).map((source) => {
    const maxAgeDays =
      ctx.policy.freshness.maxAgeDaysBySourceType?.[source.sourceType] ??
      ctx.policy.freshness.defaultMaxAgeDays
    const latest = ctx.snapshotsBySource.get(source.id)?.at(-1)
    const retrieved = parseIsoDate(latest?.retrievedAt)

    if (source.resolutionStatus !== 'RESOLVABLE') {
      return {
        sourceId: source.id,
        state: 'SOURCE_UNAVAILABLE',
        ...(latest ? { lastCheckedDate: latest.retrievedAt } : {}),
        maxAgeDays,
      }
    }
    if (!latest || retrieved === null || asOf === null) {
      return { sourceId: source.id, state: 'AUDIT_NOT_COMPLETED', maxAgeDays }
    }

    const ageDays = elapsedDays(asOf, retrieved)
    return {
      sourceId: source.id,
      state: ageDays > maxAgeDays ? 'EVIDENCE_MAY_BE_OUT_OF_DATE' : 'CHECKED',
      lastCheckedDate: latest.retrievedAt,
      ageDays,
      maxAgeDays,
    }
  })
}

export function runGroupHFreshnessDependencies(ctx: EvidenceRuleContext): {
  freshness: SourceFreshnessResult[]
  impactPlan: EvidenceImpactPlan
} {
  const freshness = freshnessResults(ctx)
  const edges = [...ctx.dependencies].sort(dependencySort)

  for (const edge of edges) {
    if (!entityExists(ctx, edge.from)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'H',
        code: 'H_DEPENDENCY_SOURCE_NOT_FOUND',
        message: `Dependency source ${edge.from.type} "${edge.from.id}" is not present.`,
        entity: ref('DEPENDENCY', entityKey(edge.from), 'from'),
        field: 'from',
        correctiveAction: 'Restore the source entity or remove the invalid dependency edge.',
      })
    }
    if (!entityExists(ctx, edge.to)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'H',
        code: 'H_DEPENDENCY_TARGET_NOT_FOUND',
        message: `Dependency target ${edge.to.type} "${edge.to.id}" is not present.`,
        entity: ref('DEPENDENCY', entityKey(edge.to), 'to'),
        field: 'to',
        correctiveAction: 'Restore the dependent entity or remove the invalid dependency edge.',
      })
    }
  }

  detectDependencyCycles(ctx, edges)

  for (const change of [...(ctx.input.changes ?? [])].sort(changeSort)) {
    if (!entityExists(ctx, change.entity)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'H',
        code: 'H_CHANGED_ENTITY_NOT_FOUND',
        message: `Changed ${change.entity.type} "${change.entity.id}" is not present.`,
        entity: change.entity,
        field: change.entity.field ?? 'id',
        correctiveAction: 'Normalize the change against a stored evidence entity.',
      })
    }
    if (
      change.changedFields.length === 0 ||
      change.changedFields.some((field) => !hasText(field))
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'H',
        code: 'H_CHANGE_FIELDS_MISSING',
        message: `Change to ${change.entity.type} "${change.entity.id}" does not identify the fields that changed.`,
        entity: change.entity,
        field: 'changedFields',
        correctiveAction:
          'Record the normalized field-level diff before calculating review impact.',
      })
    }
    if (change.entity.type === 'SOURCE') {
      if (!change.snapshotId) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'H',
          code: 'H_SOURCE_CHANGE_WITHOUT_SNAPSHOT',
          message: `Source "${change.entity.id}" changed without an immutable snapshot.`,
          entity: change.entity,
          field: change.entity.field ?? change.changedFields[0] ?? 'snapshotId',
          correctiveAction:
            'Create and hash the new source snapshot before diffing dependent content.',
          sourceId: change.entity.id,
        })
      } else {
        const snapshot = ctx.snapshots.get(change.snapshotId)
        if (!snapshot || snapshot.sourceId !== change.entity.id) {
          addFinding(ctx, {
            level: 'BLOCK',
            group: 'H',
            code: 'H_SOURCE_CHANGE_SNAPSHOT_MISMATCH',
            message: `Source change for "${change.entity.id}" does not point to a snapshot of that source.`,
            entity: change.entity,
            field: 'snapshotId',
            correctiveAction: 'Attach the new immutable snapshot created for this source.',
            sourceId: change.entity.id,
          })
        } else {
          const latest = ctx.snapshotsBySource.get(change.entity.id)?.at(-1)
          if (latest && latest.id !== snapshot.id) {
            addFinding(ctx, {
              level: 'BLOCK',
              group: 'H',
              code: 'H_SOURCE_CHANGE_SNAPSHOT_NOT_LATEST',
              message: `Source change for "${change.entity.id}" points to an older snapshot.`,
              entity: change.entity,
              field: 'snapshotId',
              correctiveAction:
                'Attach the newest immutable snapshot created by this source check.',
              sourceId: change.entity.id,
            })
          }
        }
      }
    }
  }

  const affected = propagateChanges(ctx, edges)
  for (const item of affected) {
    addFinding(ctx, {
      level: 'REVIEW_IMPACT',
      group: 'H',
      code: 'H_DEPENDENT_CONTENT_AFFECTED',
      message: `${item.entity.type} "${item.entity.id}" is affected by a change to ${item.via.type} "${item.via.id}" (${item.impact}).`,
      entity: item.entity,
      field: item.entity.field ?? 'content',
      correctiveAction: impactAction(item.impact),
      ...(item.via.type === 'SOURCE' ? { sourceId: item.via.id } : {}),
      ...(item.via.type === 'CLAIM' ? { claimId: item.via.id } : {}),
    })
  }

  return { freshness, impactPlan: buildImpactPlan(ctx, affected) }
}
