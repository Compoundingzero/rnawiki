/**
 * Apply a reviewed identity correction to the corpus tables, recording it first in the immutable
 * `entity_corrections` ledger (docs/entity-resolution-and-trial-role-spec.md).
 *
 *   npx tsx scripts/dossier-v3/apply-identity-corrections.ts data/dossier-v3/corrections/creatine-tribulus.json
 *   npx tsx scripts/dossier-v3/apply-identity-corrections.ts <file> --apply
 *
 * A correction file is a JSON array of corrections. Each names one page key, the exact synonym
 * names to remove, the exact registry studies to remove, the reason and the evidence. The command
 * never guesses a name or a study: what is not named is not touched. It is idempotent — a
 * correction whose ledger id already exists is skipped — and it defaults to a dry run.
 *
 * It does not repair the identity pipeline. The pipeline rule that produced the defect is fixed in
 * `scripts/corpus-20k/identity/resolve.py` and `scripts/corpus-20k/registry/match.ts`; this command
 * repairs the loaded rows a reader sees today and leaves an auditable record of doing so.
 */
import 'dotenv/config'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

import { and, eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db'
import { corpusPages, entityCorrections, pageRegistryStudies, pageSynonyms } from '@/db/schema'

const correctionSchema = z.object({
  pageKey: z.string().min(1),
  removeSynonyms: z.array(z.string().min(1)).default([]),
  removeRegistryStudies: z.array(z.string().regex(/^NCT\d{8}$/)).default([]),
  reason: z.string().min(20),
  evidence: z.array(z.record(z.unknown())).min(1),
  ruleOrClassifierVersion: z.string().min(1),
  /** Where the removed things belong instead, when known. Recorded, not acted on. */
  belongsTo: z.string().optional(),
})

type Correction = z.infer<typeof correctionSchema>

function ledgerId(correction: Correction, subjectKind: string, subjectRef: string): string {
  return createHash('sha256')
    .update(
      [correction.pageKey, subjectKind, subjectRef, correction.ruleOrClassifierVersion].join('|'),
    )
    .digest('hex')
}

async function main(): Promise<void> {
  const [file, ...flags] = process.argv.slice(2)
  if (!file) throw new Error('usage: apply-identity-corrections.ts <corrections.json> [--apply]')
  const apply = flags.includes('--apply')
  const operator = process.env.USER
    ? `operator:${process.env.USER}`
    : 'operator:apply-identity-corrections'
  const corrections = z.array(correctionSchema).parse(JSON.parse(readFileSync(file, 'utf8')))

  const summary = {
    corrections: corrections.length,
    synonymsRemoved: 0,
    studiesRemoved: 0,
    ledgerRows: 0,
    skipped: 0,
  }

  for (const correction of corrections) {
    const [page] = await db
      .select({ key: corpusPages.key, slug: corpusPages.slug, name: corpusPages.displayName })
      .from(corpusPages)
      .where(eq(corpusPages.key, correction.pageKey))
    if (!page) {
      console.log(
        JSON.stringify({ skipped: correction.pageKey, reason: 'page not loaded in this database' }),
      )
      summary.skipped += 1
      continue
    }
    const synonymRows =
      correction.removeSynonyms.length > 0
        ? await db
            .select({
              id: pageSynonyms.id,
              name: pageSynonyms.name,
              kind: pageSynonyms.kind,
              source: pageSynonyms.source,
            })
            .from(pageSynonyms)
            .where(
              and(
                eq(pageSynonyms.key, page.key),
                inArray(
                  sql`lower(${pageSynonyms.name})`,
                  correction.removeSynonyms.map((name) => name.toLowerCase()),
                ),
              ),
            )
        : []
    const studyRows =
      correction.removeRegistryStudies.length > 0
        ? await db
            .select({
              id: pageRegistryStudies.id,
              nct: pageRegistryStudies.nct,
              role: pageRegistryStudies.role,
              matchedName: pageRegistryStudies.matchedName,
            })
            .from(pageRegistryStudies)
            .where(
              and(
                eq(pageRegistryStudies.key, page.key),
                inArray(pageRegistryStudies.nct, correction.removeRegistryStudies),
              ),
            )
        : []

    console.log(
      JSON.stringify({
        page: page.slug,
        synonymsFound: synonymRows.map((row) => `${row.name} (${row.kind}, ${row.source})`),
        studiesFound: studyRows.map((row) => `${row.nct} (${row.role}: ${row.matchedName ?? ''})`),
        apply,
      }),
    )
    if (!apply) continue

    await db.transaction(async (tx) => {
      for (const row of synonymRows) {
        const id = ledgerId(correction, 'synonym', row.name)
        const exists = await tx
          .select({ id: entityCorrections.id })
          .from(entityCorrections)
          .where(eq(entityCorrections.id, id))
        if (exists.length > 0) {
          summary.skipped += 1
          continue
        }
        await tx.insert(entityCorrections).values({
          id,
          subjectKind: 'synonym',
          subjectKey: page.key,
          subjectRef: row.name,
          action: 'remove_synonym',
          before: { name: row.name, kind: row.kind, source: row.source, page: page.slug },
          after: {
            removed: true,
            ...(correction.belongsTo ? { belongsTo: correction.belongsTo } : {}),
          },
          reason: correction.reason,
          evidence: correction.evidence,
          operator,
          ruleOrClassifierVersion: correction.ruleOrClassifierVersion,
        })
        await tx.delete(pageSynonyms).where(eq(pageSynonyms.id, row.id))
        summary.ledgerRows += 1
        summary.synonymsRemoved += 1
      }
      for (const row of studyRows) {
        const id = ledgerId(correction, 'registry_match', row.nct)
        const exists = await tx
          .select({ id: entityCorrections.id })
          .from(entityCorrections)
          .where(eq(entityCorrections.id, id))
        if (exists.length > 0) {
          summary.skipped += 1
          continue
        }
        await tx.insert(entityCorrections).values({
          id,
          subjectKind: 'registry_match',
          subjectKey: page.key,
          subjectRef: row.nct,
          action: 'remove_registry_match',
          before: { nct: row.nct, role: row.role, matchedName: row.matchedName, page: page.slug },
          after: {
            removed: true,
            ...(correction.belongsTo ? { belongsTo: correction.belongsTo } : {}),
          },
          reason: correction.reason,
          evidence: correction.evidence,
          operator,
          ruleOrClassifierVersion: correction.ruleOrClassifierVersion,
        })
        await tx.delete(pageRegistryStudies).where(eq(pageRegistryStudies.id, row.id))
        summary.ledgerRows += 1
        summary.studiesRemoved += 1
      }
    })
  }
  console.log(JSON.stringify({ summary, apply }))
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.stack : String(error))
    process.exit(1)
  })
