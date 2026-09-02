/**
 * The lexical baseline, at the level a reader actually asks a question.
 *
 * The public site already has a lexical search, and it ranks DOSSIERS. That is a different task
 * from the one measured here: a person asking for a half-life wants one recorded reading, not a
 * document that contains one among two hundred others. So the baseline below runs PostgreSQL full
 * text search over the same reading units a dense model would be given, with the same candidate
 * pool and the same scope gates applied afterwards. Beating a weak baseline proves nothing, and a
 * document-level baseline would have been a weak one.
 *
 * `websearch_to_tsquery` is tried first because it accepts the punctuation people type and never
 * raises on a malformed query; `plainto_tsquery` is the fallback when the first parse produces no
 * lexemes. Ranking is `ts_rank_cd` with normalisation 32 (rank / (rank + 1)), which keeps a long
 * basis sentence from outranking a short recorded value purely by length.
 */

import { sql } from 'drizzle-orm'

import { db } from '@/db'
import type { ReadingComparisonState } from '@/lib/background/reading-comparison'
import type { DossierSectionId } from '@/lib/dossier-completion/types'
import type { EvidenceReadingUnit, UnitAssertion, UnitKind } from '@/lib/semantic/units'

export const LEXICAL_ENGINE_VERSION = 'semantic-lexical/v1' as const

export interface RankedUnit {
  unit: EvidenceReadingUnit
  score: number
}

export interface LexicalSearchOptions {
  limit?: number
  /** When present, the search is restricted to these unit ids — the benchmark's candidate pool. */
  candidateIds?: readonly string[]
}

interface UnitRow {
  id: string
  drug_id: string
  canonical_slug: string
  unit_kind: UnitKind
  assertion: UnitAssertion
  section_id: DossierSectionId
  field_path: string
  population_scope: string | null
  formulation_scope: string | null
  text: string
  source_refs: EvidenceReadingUnit['sourceRefs']
  comparison_state: ReadingComparisonState | null
  projector_version: EvidenceReadingUnit['projectorVersion']
  content_digest: string
  score: number
}

export function rowToUnit(row: UnitRow): EvidenceReadingUnit {
  return {
    id: row.id,
    drugId: row.drug_id,
    canonicalSlug: row.canonical_slug,
    unitKind: row.unit_kind,
    assertion: row.assertion,
    sectionId: row.section_id,
    fieldPath: row.field_path,
    populationScope: row.population_scope,
    formulationScope: row.formulation_scope,
    text: row.text,
    sourceRefs: row.source_refs,
    comparisonState: row.comparison_state,
    projectorVersion: row.projector_version,
    contentDigest: row.content_digest,
  }
}

async function run(
  query: string,
  parser: 'websearch_to_tsquery' | 'plainto_tsquery',
  options: LexicalSearchOptions,
): Promise<RankedUnit[]> {
  const limit = options.limit ?? 20
  const ids = options.candidateIds
  const parsed =
    parser === 'websearch_to_tsquery'
      ? sql`websearch_to_tsquery('english', ${query})`
      : sql`plainto_tsquery('english', ${query})`
  // One bound parameter, not one per id: drizzle expands a bare array into a parameter tuple, and
  // a 2,000-element tuple is both slower to plan and capped by the protocol's parameter limit.
  const restriction = ids ? sql` and u.id = any(${sql.param([...ids])}::text[])` : sql``
  const result = await db.execute(sql`
    select u.id, u.drug_id, u.canonical_slug, u.unit_kind, u.assertion, u.section_id, u.field_path,
      u.population_scope, u.formulation_scope, u.text, u.source_refs, u.comparison_state,
      u.projector_version, u.content_digest,
      ts_rank_cd(u.search_vector, q, 32) as score
    from evidence_reading_units u, ${parsed} q
    where u.search_vector @@ q${restriction}
    order by score desc, u.id asc
    limit ${limit}
  `)
  return (result.rows as unknown as UnitRow[]).map((row) => ({
    unit: rowToUnit(row),
    score: Number(row.score),
  }))
}

/**
 * Ranked reading units for one query. Deterministic: ties break on unit id, so two runs over the
 * same rows return the same order.
 */
export async function lexicalSearch(
  query: string,
  options: LexicalSearchOptions = {},
): Promise<RankedUnit[]> {
  const primary = await run(query, 'websearch_to_tsquery', options)
  if (primary.length > 0) return primary
  return run(query, 'plainto_tsquery', options)
}

export type LexicalRetriever = (
  query: string,
  options?: LexicalSearchOptions,
) => Promise<RankedUnit[]>
