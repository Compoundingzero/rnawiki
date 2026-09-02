/**
 * One function that answers an evidence question, and nothing that writes one.
 *
 * `answerEvidenceQuery` retrieves reading units lexically, applies the deterministic scope gates,
 * and hands back what survived together with the record's recorded absences. There is no language
 * model in this path, no generated sentence, and no ranking of one source above another beyond the
 * text-search score, which is returned so a reviewer can see it.
 *
 * The result is deliberately not a paragraph. It is a list of readings, each carrying its exact
 * sources and whether it asserts, denies or records an absence — the same three states the rest of
 * the corpus keeps apart. A caller that wants prose has to write it and own it.
 *
 * Nothing here is wired into a page. It is reached from scripts/semantic/query.ts and from tests
 * until the site owner decides where, if anywhere, it belongs.
 */

import type { RankedUnit } from '@/lib/semantic/lexical'
import { LEXICAL_ENGINE_VERSION } from '@/lib/semantic/lexical'
import {
  SCOPE_GATE_VERSION,
  applyScopeGates,
  type EntityIndex,
  type ScopeRefusal,
} from '@/lib/semantic/scope-gates'
import type { EvidenceReadingUnit, FormulationScope, PopulationScope } from '@/lib/semantic/units'

export const SEMANTIC_SEARCH_VERSION = 'semantic-search/v1' as const

/** The full version string recorded with a Result Debugger correction. */
export const SEMANTIC_ENGINE_VERSION =
  `${SEMANTIC_SEARCH_VERSION}+${LEXICAL_ENGINE_VERSION}+${SCOPE_GATE_VERSION}` as const

export interface EvidenceQueryDependencies {
  retrieve: (query: string, limit: number) => Promise<RankedUnit[]>
  entityIndex: EntityIndex
}

export interface EvidenceQueryOptions {
  /** How many units to retrieve before the gates run. Defaults to 50. */
  retrieveLimit?: number
  /** How many units to return after the gates run. Defaults to 10. */
  limit?: number
}

export interface EvidenceQueryResult {
  query: string
  status: 'ANSWERED' | 'NO_MATCH' | 'REFUSED'
  refusal: ScopeRefusal | null
  slug: string | null
  populationScope: PopulationScope | null
  formulationScope: FormulationScope | null
  /** Readings that assert or deny something, highest text-search score first. */
  units: RankedUnit[]
  /** Recorded absences for the same record, returned beside the readings, never instead of them. */
  absences: EvidenceReadingUnit[]
  /** Unit id to the reason its scope gate dropped it. */
  dropped: Array<{ unitId: string; reason: string }>
  engineVersion: typeof SEMANTIC_ENGINE_VERSION
}

/**
 * Retrieval, then gates, then an explicit split between readings and recorded absences.
 *
 * A query naming two medicines, or a name that answers to more than one record, comes back as
 * `REFUSED` with the reason and the candidates. That is a result, not an error.
 */
export async function answerEvidenceQuery(
  query: string,
  deps: EvidenceQueryDependencies,
  options: EvidenceQueryOptions = {},
): Promise<EvidenceQueryResult> {
  const retrieveLimit = options.retrieveLimit ?? 50
  const limit = options.limit ?? 10
  const trimmed = query.trim()

  const base: Omit<EvidenceQueryResult, 'status' | 'refusal' | 'units' | 'absences'> = {
    query: trimmed,
    slug: null,
    populationScope: null,
    formulationScope: null,
    dropped: [],
    engineVersion: SEMANTIC_ENGINE_VERSION,
  }

  if (trimmed.length === 0) {
    return { ...base, status: 'NO_MATCH', refusal: null, units: [], absences: [] }
  }

  const retrieved = await deps.retrieve(trimmed, retrieveLimit)
  const scoreById = new Map(retrieved.map((hit) => [hit.unit.id, hit.score]))
  const gated = applyScopeGates(
    trimmed,
    retrieved.map((hit) => hit.unit),
    deps.entityIndex,
  )

  const dropped = [...gated.dropped].map(([unitId, reason]) => ({ unitId, reason }))

  if (gated.refusal) {
    return {
      ...base,
      status: 'REFUSED',
      refusal: gated.refusal,
      units: [],
      absences: [],
      dropped,
    }
  }

  const kept = gated.kept.map((unit) => ({ unit, score: scoreById.get(unit.id) ?? 0 }))
  const readings = kept.filter((hit) => hit.unit.assertion !== 'ABSENT').slice(0, limit)
  const absences = kept
    .filter((hit) => hit.unit.assertion === 'ABSENT')
    .slice(0, limit)
    .map((hit) => hit.unit)

  return {
    ...base,
    slug: gated.slug,
    populationScope: gated.populationScope,
    formulationScope: gated.formulationScope,
    status: readings.length > 0 || absences.length > 0 ? 'ANSWERED' : 'NO_MATCH',
    refusal: null,
    units: readings,
    absences,
    dropped,
  }
}
