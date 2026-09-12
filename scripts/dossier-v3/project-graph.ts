/**
 * Project the loaded corpus into the typed evidence graph (docs/knowledge-graph-schema.md).
 *
 *   npx tsx scripts/dossier-v3/project-graph.ts --dry-run
 *   npx tsx scripts/dossier-v3/project-graph.ts --apply
 *
 * Writes one `graph_versions` row (identity gate FALSE — the graph is known to be contaminated
 * and nothing may train on it), substance and trial nodes, and edges of origin `recorded` or
 * `predicted`, never `verified`: identity relations from `page_relations`, trial roles from
 * `page_trial_roles` (edge type by role; only `experimental_intervention` carries
 * `trial_role = experimental_intervention`), label warnings and contraindications from
 * `page_fields`, and interaction lines from `page_interactions` (tier C as `predicted` with its
 * rule id). Reviewed claims become `SUPPORTS` edges only when `reviewer_state = 'reviewed'`.
 *
 * Deterministic: ids are digests of their content; re-running replaces the same version. Nothing
 * here decides anything about a medicine.
 */
import 'dotenv/config'
import { createHash } from 'node:crypto'

import { eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  corpusPages,
  graphEdges,
  graphNodes,
  graphVersions,
  pageFields,
  pageInteractions,
  pageRelations,
  pageTrialRoles,
  reviewedClaims,
} from '@/db/schema'

const sha = (...parts: string[]): string =>
  createHash('sha256').update(parts.join('|')).digest('hex')

const RELATION_EDGE: Record<string, string> = {
  'ester-of': 'PRODRUG_OF',
  'prodrug-of': 'PRODRUG_OF',
  'stereoisomer-of': 'ISOMER_OF',
  'racemate-of': 'ISOMER_OF',
  'biosimilar-of': 'SAME_ENTITY_AS',
  contains: 'COMPONENT_OF',
  'component-of': 'COMPONENT_OF',
  'same-target': 'MEMBER_OF_CLASS',
  'isotopologue-of': 'ISOMER_OF',
}

const ROLE_EDGE: Record<string, string> = {
  experimental_intervention: 'ADMINISTERED_IN_ARM',
  active_comparator: 'ACTIVE_COMPARATOR_IN_ARM',
  background_therapy: 'BACKGROUND_THERAPY_IN_ARM',
  administered_role_unclear: 'ADMINISTERED_IN_ARM',
  observational_exposure: 'MENTIONED_ONLY_IN_TRIAL',
  placebo: 'MENTIONED_ONLY_IN_TRIAL',
  mention_only: 'MENTIONED_ONLY_IN_TRIAL',
  unclear: 'MENTIONED_ONLY_IN_TRIAL',
}

interface Node {
  id: string
  nodeType: (typeof graphNodes.$inferInsert)['nodeType']
  label: string
  corpusKey?: string
}

interface Edge {
  id: string
  layer: 'identity' | 'mechanism' | 'evidence' | 'safety'
  edgeType: string
  srcId: string
  dstId: string
  origin: 'recorded' | 'predicted'
  trialRole?: (typeof graphEdges.$inferInsert)['trialRole']
  ruleOrModelId?: string
  studyDesign?: (typeof graphEdges.$inferInsert)['studyDesign']
  properties: Record<string, unknown>
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const pages = await db
    .select({
      key: corpusPages.key,
      name: corpusPages.displayName,
      digest: corpusPages.corpusDigest,
    })
    .from(corpusPages)
  const keys = new Set(pages.map((page) => page.key))
  const nodes = new Map<string, Node>()
  const edges = new Map<string, Edge>()
  const addNode = (node: Node): string => {
    if (!nodes.has(node.id)) nodes.set(node.id, node)
    return node.id
  }
  const addEdge = (edge: Omit<Edge, 'id'>): void => {
    if (edge.srcId === edge.dstId) return
    const id = sha(
      edge.layer,
      edge.edgeType,
      edge.srcId,
      edge.dstId,
      JSON.stringify(edge.properties),
    )
    if (!edges.has(id)) edges.set(id, { id, ...edge })
  }

  for (const page of pages)
    addNode({ id: `sub:${page.key}`, nodeType: 'substance', label: page.name, corpusKey: page.key })

  const relations = await db.select().from(pageRelations)
  let relationsSkipped = 0
  for (const row of relations) {
    const type = RELATION_EDGE[row.relation]
    if (!type || !keys.has(row.key) || !keys.has(row.targetKey)) {
      relationsSkipped += 1
      continue
    }
    addEdge({
      layer: 'identity',
      edgeType: type,
      srcId: `sub:${row.key}`,
      dstId: `sub:${row.targetKey}`,
      origin: 'recorded',
      properties: { relation: row.relation },
    })
  }

  const roles = await db.select().from(pageTrialRoles)
  for (const row of roles) {
    if (!keys.has(row.key)) continue
    const trial = addNode({ id: `trial:${row.nct}`, nodeType: 'trial', label: row.nct })
    addEdge({
      layer: 'evidence',
      edgeType: ROLE_EDGE[row.role] ?? 'MENTIONED_ONLY_IN_TRIAL',
      srcId: `sub:${row.key}`,
      dstId: trial,
      origin: 'recorded',
      trialRole: row.role,
      ruleOrModelId: row.classifierVersion,
      studyDesign: 'registered_trial_no_result',
      properties: {
        basis: row.basis,
        synonymMatched: row.synonymMatched,
        completionIsPlanned: row.completionIsPlanned,
      },
    })
  }

  const fields = await db
    .select({
      key: pageFields.key,
      field: pageFields.field,
      value: pageFields.value,
      sourceId: pageFields.sourceId,
      sourceDate: pageFields.sourceDate,
    })
    .from(pageFields)
    .where(sql`${pageFields.field} in ('boxedWarning', 'contraindications')`)
  for (const row of fields) {
    if (!keys.has(row.key)) continue
    const value = row.value as { statements?: unknown[]; labelStatements?: unknown[] } | null
    const statements = [...(value?.statements ?? []), ...(value?.labelStatements ?? [])]
    for (const statement of statements) {
      const text = (statement as { statement?: string })?.statement
      if (!text) continue
      const warning = addNode({
        id: `warn:${sha(text).slice(0, 32)}`,
        nodeType: 'regulatory_document',
        label: text.slice(0, 160),
      })
      addEdge({
        layer: 'safety',
        edgeType: row.field === 'boxedWarning' ? 'HAS_LABEL_WARNING' : 'CONTRAINDICATED_IN',
        srcId: `sub:${row.key}`,
        dstId: warning,
        origin: 'recorded',
        studyDesign: 'regulatory_label',
        properties: { sourceId: row.sourceId, sourceDate: row.sourceDate },
      })
    }
  }

  const interactions = await db.select().from(pageInteractions)
  let interactionsWithoutCounterpart = 0
  for (const row of interactions) {
    if (!keys.has(row.key)) continue
    const counterpartKey = (row as { counterpartKey?: string | null }).counterpartKey
    if (!counterpartKey || !keys.has(counterpartKey)) {
      interactionsWithoutCounterpart += 1
      continue
    }
    const tier = String((row as { tier?: string }).tier ?? 'C')
    addEdge({
      layer: 'safety',
      edgeType: 'INTERACTS_WITH',
      srcId: `sub:${row.key}`,
      dstId: `sub:${counterpartKey}`,
      origin: tier === 'C' ? 'predicted' : 'recorded',
      ...(tier === 'C'
        ? { ruleOrModelId: String((row as { ruleId?: string }).ruleId ?? 'interaction-rule') }
        : {}),
      studyDesign:
        tier === 'A' ? 'regulatory_label' : tier === 'B' ? 'observational' : 'model_prediction',
      properties: { tier },
    })
  }

  const claims = await db
    .select()
    .from(reviewedClaims)
    .where(eq(reviewedClaims.reviewerState, 'reviewed'))
  for (const claim of claims) {
    if (!keys.has(claim.subjectKey)) continue
    const claimNode = addNode({
      id: `claim:${claim.id}`,
      nodeType: 'claim',
      label: claim.plainLanguageVersion.slice(0, 160),
    })
    addEdge({
      layer: 'evidence',
      edgeType: 'SUPPORTS',
      srcId: claimNode,
      dstId: `sub:${claim.subjectKey}`,
      origin: 'recorded',
      studyDesign: claim.evidenceClass,
      properties: { outcomeClass: claim.outcomeClass, claimStrength: claim.claimStrength },
    })
  }

  const versionId = sha('graph', ...[...edges.keys()].sort(), ...[...nodes.keys()].sort())
  const summary = {
    versionId,
    nodes: nodes.size,
    edges: edges.size,
    byLayer: [...edges.values()].reduce<Record<string, number>>(
      (acc, edge) => ({ ...acc, [edge.layer]: (acc[edge.layer] ?? 0) + 1 }),
      {},
    ),
    predicted: [...edges.values()].filter((edge) => edge.origin === 'predicted').length,
    relationsSkipped,
    interactionsWithoutCounterpart,
    identityGatePassed: false,
    apply,
  }
  console.log(JSON.stringify(summary))
  if (!apply) return

  await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: graphVersions.id })
      .from(graphVersions)
      .where(eq(graphVersions.id, versionId))
    if (existing.length > 0) {
      console.log(
        JSON.stringify({ note: 'graph version already projected; nothing written', versionId }),
      )
      return
    }
    await tx.insert(graphVersions).values({
      id: versionId,
      corpusSnapshot: `corpus_pages ${pages.length} rows; digest of ${nodes.size} nodes and ${edges.size} edges`,
      identityGatePassed: false,
      completionGatePassed: false,
      nodeCount: nodes.size,
      edgeCount: edges.size,
      notes:
        'Projected by scripts/dossier-v3/project-graph.ts. The identity gate is closed: no model may train on this version (docs/gnn-model-card.md).',
    })
    const nodeRows = [...nodes.values()].map((node) => ({
      id: node.id,
      nodeType: node.nodeType,
      label: node.label,
      ...(node.corpusKey ? { corpusKey: node.corpusKey } : {}),
      graphVersion: versionId,
    }))
    for (let i = 0; i < nodeRows.length; i += 500) {
      await tx
        .insert(graphNodes)
        .values(nodeRows.slice(i, i + 500))
        .onConflictDoNothing()
    }
    const edgeRows = [...edges.values()].map((edge) => ({
      id: edge.id,
      layer: edge.layer,
      edgeType: edge.edgeType,
      srcId: edge.srcId,
      dstId: edge.dstId,
      origin: edge.origin,
      ...(edge.trialRole ? { trialRole: edge.trialRole } : {}),
      ...(edge.ruleOrModelId ? { ruleOrModelId: edge.ruleOrModelId } : {}),
      ...(edge.studyDesign ? { studyDesign: edge.studyDesign } : {}),
      reviewState: 'draft' as const,
      graphVersion: versionId,
      properties: edge.properties,
    }))
    for (let i = 0; i < edgeRows.length; i += 500) {
      await tx
        .insert(graphEdges)
        .values(edgeRows.slice(i, i + 500))
        .onConflictDoNothing()
    }
  })
  console.log(JSON.stringify({ written: true, versionId }))
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.stack : String(error))
    process.exit(1)
  })
