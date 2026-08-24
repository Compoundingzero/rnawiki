import { and, eq, inArray, isNull, sql } from 'drizzle-orm'
import { db } from '@/db'
import {
  drugAliases,
  drugs,
  ingestRuns,
  legacyIdentityCorrectionDetails,
  revisions,
} from '@/db/schema'
import { newId } from '@/lib/ids'
import { PUBLIC_PLACEHOLDER_MEDICINE_SLUGS } from '@/lib/public-data-integrity'
import type { DrugInsert } from './build-dossier'
import { aliasRowsFor } from './aliases'

/**
 * Write ingested rows to Postgres. Re-ingestion refreshes identity and regulatory fields but does
 * not overwrite curated or flagship narrative content.
 */

const BATCH_SIZE = 500

export interface LoadResult {
  inserted: number
  updated: number
  batches: number
  runId: string
}

/**
 * Rebuild source-derived aliases for records in this run. Scope deletion to those records so a
 * partial ingest does not affect unrelated aliases.
 */
async function loadAliases(rows: readonly DrugInsert[]): Promise<void> {
  const aliasRows = rows.flatMap((row) =>
    aliasRowsFor({
      drugId: row.id,
      name: row.name,
      moiety: row.moiety,
      saltForms: row.saltForms,
      brands: row.brandNames,
    }),
  )
  if (aliasRows.length === 0) return

  // Do not assign an alias that is another record's canonical name.
  const canonicalNames = new Map<string, string>()
  for (const row of rows) canonicalNames.set(row.name.toLowerCase(), row.id)

  const kept = aliasRows.filter((alias) => {
    const owner = canonicalNames.get(alias.alias.toLowerCase())
    return owner === undefined || owner === alias.drugId
  })
  const stolen = aliasRows.length - kept.length
  if (stolen > 0) {
    console.log(
      `[load] dropped ${stolen.toLocaleString()} aliases that named a different substance`,
    )
  }
  aliasRows.length = 0
  aliasRows.push(...kept)

  const drugIds = rows.map((row) => row.id)
  for (let offset = 0; offset < drugIds.length; offset += BATCH_SIZE) {
    await db
      .delete(drugAliases)
      .where(inArray(drugAliases.drugId, drugIds.slice(offset, offset + BATCH_SIZE)))
  }

  for (let offset = 0; offset < aliasRows.length; offset += BATCH_SIZE) {
    await db
      .insert(drugAliases)
      .values(aliasRows.slice(offset, offset + BATCH_SIZE))
      .onConflictDoNothing()
  }
  console.log(`[load] ${aliasRows.length.toLocaleString()} search aliases written`)
}

/**
 * Remove stale stub rows after a full ingest. Curated and flagship rows are never pruned, rows
 * with revision history stay intact, and partial runs skip pruning because absence from a limited
 * result does not imply staleness.
 */
export async function pruneStaleStubs(rows: readonly Pick<DrugInsert, 'slug'>[]): Promise<void> {
  const keep = new Set(rows.map((row) => row.slug))

  const existing = await db
    .select({ slug: drugs.slug })
    .from(drugs)
    .leftJoin(revisions, eq(revisions.drugId, drugs.id))
    .where(and(eq(drugs.dossierDepth, 'stub'), isNull(revisions.id)))

  const stale = existing.map((row) => row.slug).filter((slug) => !keep.has(slug))
  if (stale.length === 0) return

  for (let offset = 0; offset < stale.length; offset += BATCH_SIZE) {
    await db.delete(drugs).where(inArray(drugs.slug, stale.slice(offset, offset + BATCH_SIZE)))
  }
  console.log(`[load] pruned ${stale.length.toLocaleString()} stale stub rows`)
}

/**
 * Remove old placeholder records rejected by the current ingest rules. Revision history protects
 * a row from automatic deletion, even when its slug is a placeholder, so a reviewed record still
 * requires an explicit steward decision.
 */
export async function pruneRejectedPlaceholderMedicines(): Promise<void> {
  const rejected = await db
    .select({ slug: drugs.slug })
    .from(drugs)
    .leftJoin(revisions, eq(revisions.drugId, drugs.id))
    .where(and(inArray(drugs.slug, [...PUBLIC_PLACEHOLDER_MEDICINE_SLUGS]), isNull(revisions.id)))

  const slugs = [...new Set(rejected.map((row) => row.slug))]
  if (slugs.length === 0) return
  await db.delete(drugs).where(inArray(drugs.slug, slugs))
  console.log(`[load] pruned ${slugs.length.toLocaleString()} rejected placeholder records`)
}

export async function loadDrugs(
  rows: readonly DrugInsert[],
  options: { dryRun?: boolean; note?: string; prune?: boolean } = {},
): Promise<LoadResult> {
  // Report duplicate slugs before Postgres rejects the batch with an opaque conflict error.
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const row of rows) {
    if (seen.has(row.slug)) repeated.add(row.slug)
    seen.add(row.slug)
  }
  if (repeated.size > 0) {
    const sample = [...repeated].slice(0, 10).join(', ')
    throw new Error(
      `[load] ${repeated.size} slugs appear on more than one row, so deduplication did not run ` +
        `or its result was discarded: ${sample}${repeated.size > 10 ? ', …' : ''}`,
    )
  }

  const runId = newId('ingest')

  if (options.dryRun) {
    console.log(
      `[load] dry run: would write ${rows.length.toLocaleString()} rows, touching nothing`,
    )
    return { inserted: 0, updated: 0, batches: 0, runId }
  }

  await db.insert(ingestRuns).values({
    id: runId,
    source: 'openFDA + NIH DSLD + PubChem',
    recordsSeen: rows.length,
    notes: options.note ?? null,
  })

  let written = 0
  let batches = 0

  for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
    const batch = rows.slice(offset, offset + BATCH_SIZE)

    await db
      .insert(drugs)
      .values(
        batch.map((row) => ({
          id: row.id,
          slug: row.slug,
          name: row.name,
          tradeName: row.tradeName,
          sponsor: row.sponsor,
          targetGene: row.targetGene,
          targetProtein: row.targetProtein,
          modality: row.modality,
          approvalStatus: row.approvalStatus,
          approvalYear: row.approvalYear,
          indication: row.indication,
          patientFriendlyIndication: row.patientFriendlyIndication,
          oneSentenceVerdict: row.oneSentenceVerdict,
          laymanHowItWorks: row.laymanHowItWorks,
          dossierDepth: row.dossierDepth,
          molecularSchema: row.molecularSchema,
          sourceProvenance: row.sourceProvenance,
          viewCount: 0,
        })),
      )
      .onConflictDoUpdate({
        target: drugs.slug,
        set: {
          // A published, independently reviewed identity correction outranks later bulk-source
          // refreshes for that one field. The other identity field may still refresh when it has
          // no published correction of its own. Revision counters and editor attribution are
          // deliberately absent from this update, so ingest cannot rewrite review history.
          name: sql`case
            when exists (
              select 1
              from ${revisions}
              inner join ${legacyIdentityCorrectionDetails}
                on ${legacyIdentityCorrectionDetails.revisionId} = ${revisions.id}
              where ${revisions.drugId} = ${drugs.id}
                and ${revisions.status} = 'published'
                and ${legacyIdentityCorrectionDetails.field} = 'name'
            ) then ${drugs.name}
            else excluded.name
          end`,
          tradeName: sql`case
            when exists (
              select 1
              from ${revisions}
              inner join ${legacyIdentityCorrectionDetails}
                on ${legacyIdentityCorrectionDetails.revisionId} = ${revisions.id}
              where ${revisions.drugId} = ${drugs.id}
                and ${revisions.status} = 'published'
                and ${legacyIdentityCorrectionDetails.field} = 'tradeName'
            ) then ${drugs.tradeName}
            else excluded.trade_name
          end`,
          sponsor: sql`excluded.sponsor`,
          approvalYear: sql`excluded.approval_year`,
          approvalStatus: sql`excluded.approval_status`,
          sourceProvenance: sql`excluded.source_provenance`,
          updatedAt: sql`now()`,

          // Refresh narrative-adjacent fields only while the record remains a stub.
          modality: sql`case when ${drugs.dossierDepth} = 'stub' then excluded.modality else ${drugs.modality} end`,
          indication: sql`case when ${drugs.dossierDepth} = 'stub' then excluded.indication else ${drugs.indication} end`,
          patientFriendlyIndication: sql`case when ${drugs.dossierDepth} = 'stub' then excluded.patient_friendly_indication else ${drugs.patientFriendlyIndication} end`,
          targetGene: sql`case when ${drugs.dossierDepth} = 'stub' then excluded.target_gene else ${drugs.targetGene} end`,
          // Preserve curated structures so an existing verification hash remains tied to its input.
          molecularSchema: sql`case when ${drugs.dossierDepth} = 'stub' then excluded.molecular_schema else ${drugs.molecularSchema} end`,
        },
      })

    written += batch.length
    batches += 1

    if (batches % 5 === 0 || offset + BATCH_SIZE >= rows.length) {
      console.log(`[load] ${written.toLocaleString()}/${rows.length.toLocaleString()} rows`)
    }
  }

  await loadAliases(rows)
  if (options.prune !== false) {
    await pruneRejectedPlaceholderMedicines()
    await pruneStaleStubs(rows)
  }

  const [{ total } = { total: 0 }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(drugs)

  await db
    .update(ingestRuns)
    .set({ recordsWritten: written, finishedAt: new Date() })
    .where(sql`${ingestRuns.id} = ${runId}`)

  console.log(
    `[load] done · ${written.toLocaleString()} rows written · ${total.toLocaleString()} rows in table`,
  )

  return { inserted: written, updated: 0, batches, runId }
}
