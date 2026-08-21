import { eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/db'
import { drugAliases, drugs, ingestRuns } from '@/db/schema'
import { newId } from '@/lib/ids'
import type { DrugInsert } from './build-dossier'
import { aliasRowsFor } from './aliases'

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

/**
 * Aliases are rebuilt wholesale rather than diffed: they are derived entirely from the source data,
 * there is nothing a contributor can lose, and a delete-then-insert is far simpler to reason about
 * than reconciling a set. Scoped to the drugs in this run so a --limit ingest does not wipe the
 * aliases of everything it did not touch.
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

  // An alias must never be another substance's own name.
  //
  // openFDA lists "Creatine" and "Creatine Monohydrate" among the ingredient spellings on products
  // whose moiety normalised to Creatine Gluconate, so the alias builder handed that stub both
  // names — and a search for "creatine" then ranked it above the written Creatine Monohydrate
  // dossier, because an exact alias hit outranks a prefix hit on a name.
  //
  // The rule is not a ranking tweak: an alias claiming a name that belongs to a different record
  // is wrong on its own terms, and it would keep surfacing as long as it existed.
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
 * Removes stub rows a previous ingest created that this one no longer produces.
 *
 * Without this, every normalisation fix leaves its mistakes behind for ever: the run that stopped
 * splitting "Abacavir || Dolutegravir || Lamivudine" into three moieties still left the combined
 * row on the site, indistinguishable from a real page.
 *
 * The guard is absolute: `dossierDepth = 'stub'` only. A curated or flagship dossier is never
 * deleted by an ingest, whatever the sources say — someone wrote it, ingestion has nothing to
 * restore it from, and a page disappearing because a regulator reorganised a field would be the
 * worst kind of data loss.
 *
 * Skipped entirely for a partial run (--limit / --only), where "not produced by this run" carries
 * no information about whether a row is stale.
 */
async function pruneStaleStubs(rows: readonly DrugInsert[]): Promise<void> {
  const keep = new Set(rows.map((row) => row.slug))

  const existing = await db
    .select({ slug: drugs.slug })
    .from(drugs)
    .where(eq(drugs.dossierDepth, 'stub'))

  const stale = existing.map((row) => row.slug).filter((slug) => !keep.has(slug))
  if (stale.length === 0) return

  for (let offset = 0; offset < stale.length; offset += BATCH_SIZE) {
    await db.delete(drugs).where(inArray(drugs.slug, stale.slice(offset, offset + BATCH_SIZE)))
  }
  console.log(`[load] pruned ${stale.length.toLocaleString()} stale stub rows`)
}

export async function loadDrugs(
  rows: readonly DrugInsert[],
  options: { dryRun?: boolean; note?: string; prune?: boolean } = {},
): Promise<LoadResult> {
  // Postgres answers a batch containing one slug twice with "ON CONFLICT DO UPDATE command cannot
  // affect row a second time", a hint about nodeModifyTable.c, and no indication of which slug or
  // which stage produced it. It happened once, when a change to the deduplicator started returning
  // a filtered list while the caller went on discarding the return value. Say it in English, name
  // the slugs, and stop before writing anything.
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

  await loadAliases(rows)
  if (options.prune !== false) await pruneStaleStubs(rows)

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
