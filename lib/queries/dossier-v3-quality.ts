/**
 * The data-quality dashboard's reads (docs/rnawiki-biohacker-rebuild-audit.md, "Data-quality
 * dashboard"). Counts only; every number names the table it comes from so a steward can check it.
 * Nothing here writes, and nothing here is reader-facing.
 */
import { sql } from 'drizzle-orm'

import { db } from '@/db'

export interface DossierV3Quality {
  corpusPages: number
  indexablePages: number
  pagesWithRoleAggregate: number
  trialRoleRows: number
  rolesByKind: Array<{ role: string; count: number }>
  synonymMatchedRoles: number
  plannedCompletionRows: number
  corrections: number
  correctionsByAction: Array<{ action: string; count: number }>
  reviewedClaims: number
  claimsByState: Array<{ state: string; count: number }>
  fieldStates: Array<{ state: string; count: number }>
  pagesMissingFieldStates: number
  graphVersions: Array<{
    id: string
    nodes: number
    edges: number
    identityGate: boolean
    createdAt: Date
  }>
  predictedEdges: number
}

async function count(query: string): Promise<number> {
  const rows = await db.execute(sql.raw(query))
  const first =
    (rows as unknown as { rows?: Array<Record<string, unknown>> }).rows?.[0] ??
    (rows as unknown as Array<Record<string, unknown>>)[0]
  return Number(first?.count ?? 0)
}

async function grouped(
  query: string,
  key: string,
): Promise<Array<{ [k: string]: string } & { count: number }>> {
  const rows = await db.execute(sql.raw(query))
  const list =
    (rows as unknown as { rows?: Array<Record<string, unknown>> }).rows ??
    (rows as unknown as Array<Record<string, unknown>>)
  return list.map((row) => ({ [key]: String(row[key]), count: Number(row.count) })) as Array<
    { [k: string]: string } & { count: number }
  >
}

export async function loadDossierV3Quality(): Promise<DossierV3Quality> {
  const [
    corpusPages,
    indexablePages,
    pagesWithRoleAggregate,
    trialRoleRows,
    rolesByKind,
    synonymMatchedRoles,
    plannedCompletionRows,
    corrections,
    correctionsByAction,
    reviewedClaims,
    claimsByState,
    fieldStates,
    pagesMissingFieldStates,
    predictedEdges,
  ] = await Promise.all([
    count('select count(*)::int as count from corpus_pages'),
    count('select count(*)::int as count from corpus_pages where indexable'),
    count('select count(*)::int as count from page_registry_role_aggregates'),
    count('select count(*)::int as count from page_trial_roles'),
    grouped(
      'select role, count(*)::int as count from page_trial_roles group by role order by count desc',
      'role',
    ),
    count('select count(*)::int as count from page_trial_roles where synonym_matched'),
    count('select count(*)::int as count from page_trial_roles where completion_is_planned'),
    count('select count(*)::int as count from entity_corrections'),
    grouped(
      'select action, count(*)::int as count from entity_corrections group by action order by count desc',
      'action',
    ),
    count('select count(*)::int as count from reviewed_claims'),
    grouped(
      'select reviewer_state as state, count(*)::int as count from reviewed_claims group by reviewer_state order by count desc',
      'state',
    ),
    grouped(
      'select state, count(*)::int as count from dossier_field_states group by state order by count desc',
      'state',
    ),
    count(
      'select count(*)::int as count from corpus_pages p where not exists (select 1 from dossier_field_states s where s.key = p.key)',
    ),
    count('select count(*)::int as count from predicted_edges'),
  ])
  const versions = await db.execute(
    sql.raw(
      'select id, node_count, edge_count, identity_gate_passed, created_at from graph_versions order by created_at desc limit 5',
    ),
  )
  const versionRows =
    (versions as unknown as { rows?: Array<Record<string, unknown>> }).rows ??
    (versions as unknown as Array<Record<string, unknown>>)
  return {
    corpusPages,
    indexablePages,
    pagesWithRoleAggregate,
    trialRoleRows,
    rolesByKind: rolesByKind as unknown as Array<{ role: string; count: number }>,
    synonymMatchedRoles,
    plannedCompletionRows,
    corrections,
    correctionsByAction: correctionsByAction as unknown as Array<{ action: string; count: number }>,
    reviewedClaims,
    claimsByState: claimsByState as unknown as Array<{ state: string; count: number }>,
    fieldStates: fieldStates as unknown as Array<{ state: string; count: number }>,
    pagesMissingFieldStates,
    graphVersions: versionRows.map((row) => ({
      id: String(row.id),
      nodes: Number(row.node_count),
      edges: Number(row.edge_count),
      identityGate: row.identity_gate_passed === true,
      createdAt: new Date(String(row.created_at)),
    })),
    predictedEdges,
  }
}
