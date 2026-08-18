// Shared data access for the /updates page and /updates/feed.xml route — both render the same
// evidenceChanges rows, so the query and the changeType vocabulary live here once rather than
// being duplicated across the two files. Not a route itself (no page/route/layout export), so
// the App Router ignores it as a segment.

import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { claims, entities, evidenceChanges, evidenceChangeTypeEnum } from '@/db/schema'
import type { ProofBoundaryStage } from '@/lib/evidence'

export type EvidenceChangeType = (typeof evidenceChangeTypeEnum.enumValues)[number]

// changeType is application vocabulary, like the Proof Boundary/evidence-status labels in
// lib/evidence.ts, but scoped to this feed — it has no other reader, so it stays local here
// rather than growing lib/evidence.ts's shared surface.
export const EVIDENCE_CHANGE_TYPE_LABELS: Record<EvidenceChangeType, string> = {
  new_controlled_trial: 'New controlled trial',
  regulatory_decision: 'Regulatory decision',
  safety_warning: 'Safety warning',
  retraction_or_correction: 'Retraction or correction',
  independent_study: 'Independent study',
  boundary_moved: 'Proof Boundary moved',
}

export interface EvidenceChangeItem {
  id: number
  changeType: EvidenceChangeType
  previousBoundary: ProofBoundaryStage | null
  newBoundary: ProofBoundaryStage | null
  explanation: string
  source: string
  publicationDate: Date
  entitySlug: string | null
  entityName: string | null
  claimSlug: string | null
  claimQuestion: string | null
}

/**
 * Most recent evidence changes, newest first. The entity/claim join carries an extra
 * publicationStatus === 'published' condition in the ON clause (not a WHERE filter) so a
 * change row is never dropped just because its entity or claim isn't public — it just renders
 * without a link to that content, instead of linking to a page a reader can't see.
 */
export async function getRecentEvidenceChanges(limit = 100): Promise<EvidenceChangeItem[]> {
  const rows = await db
    .select({
      id: evidenceChanges.id,
      changeType: evidenceChanges.changeType,
      previousBoundary: evidenceChanges.previousBoundary,
      newBoundary: evidenceChanges.newBoundary,
      explanation: evidenceChanges.explanation,
      source: evidenceChanges.source,
      publicationDate: evidenceChanges.publicationDate,
      entitySlug: entities.slug,
      entityName: entities.canonicalName,
      claimSlug: claims.slug,
      claimQuestion: claims.consumerQuestion,
    })
    .from(evidenceChanges)
    .leftJoin(entities, and(eq(evidenceChanges.entityId, entities.id), eq(entities.publicationStatus, 'published')))
    .leftJoin(claims, and(eq(evidenceChanges.claimId, claims.id), eq(claims.publicationStatus, 'published')))
    .orderBy(desc(evidenceChanges.publicationDate))
    .limit(limit)

  return rows.map((row) => ({
    ...row,
    entitySlug: row.entitySlug ?? null,
    entityName: row.entityName ?? null,
    claimSlug: row.claimSlug ?? null,
    claimQuestion: row.claimQuestion ?? null,
  }))
}
