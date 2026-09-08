/**
 * Reads for the hub routes (docs/specs/hubs.md §2, §3).
 *
 * A hub page is three reads: the hub row, its members in comparison-table order joined to the page
 * rows that supply the link and the printed name, and its synthesis sentences in template order.
 * No read here computes a value; every value was written by `scripts/revamp/hubs_load.ts` from
 * `data/revamp/hubs/`.
 */
import { and, asc, count, eq } from 'drizzle-orm'

import { db } from '@/db'
import { corpusPages, hubAliases, hubMembers, hubSyntheses, hubs } from '@/db/schema'
import {
  type HubIndexRow,
  type HubMemberRecord,
  type HubMemberRole,
  type HubPage,
  type HubRecord,
  type HubSynthesisRecord,
  type HubType,
} from '@/lib/hubs/types'

function toHubRecord(row: typeof hubs.$inferSelect): HubRecord {
  return {
    hubId: row.hubId,
    type: row.type,
    name: row.name,
    slug: row.slug,
    definition: row.definition,
    definitionSource: row.definitionSource,
    memberCount: row.memberCount,
    approvedCount: row.approvedCount,
    relevance: Number(row.relevance),
    rankScore: Number(row.rankScore),
    firstBatch: row.firstBatch,
  }
}

/** Every hub, for the `/h` index: alphabetical inside each type, with its member counts. */
export async function listHubs(): Promise<HubIndexRow[]> {
  const rows = await db
    .select({
      hubId: hubs.hubId,
      type: hubs.type,
      name: hubs.name,
      slug: hubs.slug,
      memberCount: hubs.memberCount,
      approvedCount: hubs.approvedCount,
    })
    .from(hubs)
    .orderBy(asc(hubs.type), asc(hubs.name))
  return rows.map((row) => ({ ...row, type: row.type as HubType }))
}

/** One hub with its comparison table and its synthesis, or null where the slug names no hub. */
export async function loadHubPage(type: HubType, slug: string): Promise<HubPage | null> {
  const [hub] = await db
    .select()
    .from(hubs)
    .where(and(eq(hubs.type, type), eq(hubs.slug, slug)))
    .limit(1)
  if (!hub) return null

  const [memberRows, synthesisRows] = await Promise.all([
    db
      .select({
        key: hubMembers.key,
        ordinal: hubMembers.ordinal,
        memberRole: hubMembers.memberRole,
        membershipEvidence: hubMembers.membershipEvidence,
        approvalSg: hubMembers.approvalSg,
        approvalUs: hubMembers.approvalUs,
        approvalAu: hubMembers.approvalAu,
        approvalUk: hubMembers.approvalUk,
        approvalEu: hubMembers.approvalEu,
        approvalJp: hubMembers.approvalJp,
        approvalCa: hubMembers.approvalCa,
        sgForensicClass: hubMembers.sgForensicClass,
        genericAvailable: hubMembers.genericAvailable,
        potency: hubMembers.potency,
        indications: hubMembers.indications,
        indicationCount: hubMembers.indicationCount,
        withdrawnReason: hubMembers.withdrawnReason,
        withdrawnWhere: hubMembers.withdrawnWhere,
        trialsCount: hubMembers.trialsCount,
        resultsPostedShare: hubMembers.resultsPostedShare,
        tier: hubMembers.tier,
        firstQuestion: hubMembers.firstQuestion,
        slug: corpusPages.slug,
        name: corpusPages.displayName,
      })
      .from(hubMembers)
      .innerJoin(corpusPages, eq(corpusPages.key, hubMembers.key))
      .where(eq(hubMembers.hubId, hub.hubId))
      .orderBy(asc(hubMembers.ordinal)),
    db
      .select({
        ordinal: hubSyntheses.ordinal,
        templateId: hubSyntheses.templateId,
        sentence: hubSyntheses.sentence,
        provenance: hubSyntheses.provenance,
      })
      .from(hubSyntheses)
      .where(eq(hubSyntheses.hubId, hub.hubId))
      .orderBy(asc(hubSyntheses.ordinal)),
  ])

  const members: HubMemberRecord[] = memberRows.map((row) => ({
    ...row,
    memberRole: row.memberRole as HubMemberRole,
  }))
  const syntheses: HubSynthesisRecord[] = synthesisRows.map((row) => ({
    ordinal: row.ordinal,
    templateId: row.templateId,
    sentence: row.sentence,
    provenance: (row.provenance ?? {}) as Record<string, unknown>,
  }))
  return { hub: toHubRecord(hub), members, syntheses }
}

/**
 * The hub an absorbed slug redirects to (docs/specs/phase4-generators.md §13 item 13).
 *
 * Hubs whose member sets overlapped at 0.5 Jaccard were nearly the same page, and only the largest
 * member set is published. The others answer here, with the survivor's own route, so a link into
 * the corpus never dies and a reader never lands on two pages listing the same compounds.
 */
export async function hubAliasTarget(
  type: HubType,
  slug: string,
): Promise<{ type: HubType; slug: string } | null> {
  const [row] = await db
    .select({ type: hubs.type, slug: hubs.slug })
    .from(hubAliases)
    .innerJoin(hubs, eq(hubs.hubId, hubAliases.hubId))
    .where(and(eq(hubAliases.aliasType, type), eq(hubAliases.aliasSlug, slug)))
    .limit(1)
  if (!row) return null
  return { type: row.type as HubType, slug: row.slug }
}

/** Every hub slug, for the `hubs.xml` sitemap child and for the link-graph check. */
export async function listHubRoutes(): Promise<Array<{ type: HubType; slug: string }>> {
  const rows = await db
    .select({ type: hubs.type, slug: hubs.slug })
    .from(hubs)
    .orderBy(asc(hubs.type), asc(hubs.slug))
  return rows.map((row) => ({ type: row.type as HubType, slug: row.slug }))
}

/**
 * The hubs one page belongs to, for the member page's "Hubs" row (§3).
 *
 * The row is markup: the caller renders a list of links, never a sentence, so a leaf below its
 * tier's threshold can be `noindex,follow` and still reach every hub it belongs to.
 */
export async function hubsForPage(key: string): Promise<HubIndexRow[]> {
  const rows = await db
    .select({
      hubId: hubs.hubId,
      type: hubs.type,
      name: hubs.name,
      slug: hubs.slug,
      memberCount: hubs.memberCount,
      approvedCount: hubs.approvedCount,
    })
    .from(hubMembers)
    .innerJoin(hubs, eq(hubs.hubId, hubMembers.hubId))
    .where(eq(hubMembers.key, key))
    .orderBy(asc(hubs.type), asc(hubs.name))
  return rows.map((row) => ({ ...row, type: row.type as HubType }))
}

/** How many hubs the database holds, for the sitemap index (docs/specs/hubs.md §3). */
export async function countHubs(): Promise<number> {
  const [row] = await db.select({ value: count() }).from(hubs)
  return row?.value ?? 0
}
