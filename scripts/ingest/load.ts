import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { drugs, ingestRuns } from '@/db/schema'
import { newId } from '@/lib/ids'
import type { DrugInsert } from './build-dossier'

/**
 * Writes ingested rows to Postgres.
 *
 * THE MOST IMPORTANT LINE IN THIS FILE is the WHERE clause on the upsert: a re-ingest must never
 * touch a curated dossier's narrative fields. Someone spends an hour writing a mechanism for
 * semaglutide; openFDA publishes a routine update; a careless upsert erases the hour with no
 * warning and no way back, because ingestion has nothing to restore from. So a row whose
 * dossierDepth is 'curated' or 'flagship' gets its identity and regulatory columns refreshed and
 * everything else left exactly as the contributor left it.
 */

const BATCH_SIZE = 500

export interface LoadResult {
  inserted: number
  updated: number
  batches: number
  runId: string
}

export async function loadDrugs(
  rows: readonly DrugInsert[],
  options: { dryRun?: boolean; note?: string } = {},
): Promise<LoadResult> {
  const runId = newId('ingest')

  if (options.dryRun) {
    console.log(`[load] dry run: would write ${rows.length.toLocaleString()} rows, touching nothing`)
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
          // Identity and regulatory facts are always refreshed: they come from the source of
          // record and a contributor does not own them.
          name: sql`excluded.name`,
          tradeName: sql`excluded.trade_name`,
          sponsor: sql`excluded.sponsor`,
          approvalYear: sql`excluded.approval_year`,
          approvalStatus: sql`excluded.approval_status`,
          sourceProvenance: sql`excluded.source_provenance`,
          updatedAt: sql`now()`,

          // Everything below is refreshed ONLY on a stub. On a curated or flagship row the
          // existing value is written back to itself, which is how a single upsert statement can
          // hold two different policies at once.
          modality: sql`case when ${drugs.dossierDepth} = 'stub' then excluded.modality else ${drugs.modality} end`,
          indication: sql`case when ${drugs.dossierDepth} = 'stub' then excluded.indication else ${drugs.indication} end`,
          patientFriendlyIndication: sql`case when ${drugs.dossierDepth} = 'stub' then excluded.patient_friendly_indication else ${drugs.patientFriendlyIndication} end`,
          targetGene: sql`case when ${drugs.dossierDepth} = 'stub' then excluded.target_gene else ${drugs.targetGene} end`,
          // A curated dossier's structure may have been swept by the engine and carry a
          // verification hash. Overwriting it with a PubChem SMILES would invalidate that hash
          // while leaving it displayed — a badge asserting a check that no longer matches.
          molecularSchema: sql`case when ${drugs.dossierDepth} = 'stub' then excluded.molecular_schema else ${drugs.molecularSchema} end`,
        },
      })

    written += batch.length
    batches += 1

    if (batches % 5 === 0 || offset + BATCH_SIZE >= rows.length) {
      console.log(`[load] ${written.toLocaleString()}/${rows.length.toLocaleString()} rows`)
    }
  }

  const [{ total } = { total: 0 }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(drugs)

  await db
    .update(ingestRuns)
    .set({ recordsWritten: written, finishedAt: new Date() })
    .where(sql`${ingestRuns.id} = ${runId}`)

  console.log(`[load] done · ${written.toLocaleString()} rows written · ${total.toLocaleString()} rows in table`)

  return { inserted: written, updated: 0, batches, runId }
}
