import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { drugs } from '@/db/schema'
import { decideMedicinePageIndexing } from '@/lib/dossier-v4/indexability'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'

/**
 * Every medicine whose page now says information is unavailable.
 *
 * The page's own assessment decides this, not a separate rule: `assessRecordSubstance` looks at what
 * the built page actually holds — an opening sentence, an explanation, a result measured in people,
 * a mechanism — and `decideMedicinePageIndexing` turns that into the notice the reader sees and the
 * instruction the crawler reads, from the same answer, so the two cannot disagree. This walks the
 * whole corpus through that assessment and writes down every record that fails it, with what is
 * missing, which sources were tried, and what the record does hold.
 *
 * The point of the list is that it is actionable. "Nothing found" is not a finding; "no label exists
 * because this is a cosmetic ingredient the corpus classed as a drug" and "the label is withdrawn
 * and the approval record is all that remains" and "the parser could not read this label" are three
 * different problems with three different fixes.
 *
 *   npx tsx --tsconfig tsconfig.render-scripts.json \
 *     scripts/dossier-v4/list-unavailable-records.ts
 */

interface Row {
  slug: string
  name: string
  approvalStatus: string | null
  /** Which of the four things a reader came for the page holds. */
  has: { opening: boolean; explanation: boolean; humanEvidence: boolean; mechanism: boolean }
  /** Register facts the record does hold, which is what makes the absence diagnosable. */
  holds: string[]
  /** What it would take to fill it. */
  remedy: string
  indexed: boolean
  reason: string
}

/**
 * What it would take to fill this record, read from what the record already holds.
 *
 * These are the four cases the corpus actually contains, in the order that decides them. Each is
 * evidence-based rather than a guess: a substance with a supplement-market record and no drug label
 * is not a drug; an approved application with no current label is a discontinued medicine; a
 * single-substance label that produced no text is a parser problem; and everything else has simply
 * not been fetched.
 */
function remedyFor(background: Record<string, unknown> | null): string {
  if (!background) {
    return 'Nothing has been fetched for this record at all. Run the label and register passes against it.'
  }
  const labels = background['labelPresence'] as { singleSubstanceLabelCount?: number } | undefined
  const approval = background['regulatoryApproval'] as { applicationCount?: number } | undefined
  const market = background['supplementMarket'] as { labelCount?: number } | undefined
  const ingredient = background['supplementIngredient'] as object | undefined

  if ((labels?.singleSubstanceLabelCount ?? 0) > 0) {
    /*
     * This bucket was first written as "a parser fix", on the reasoning that a single-substance
     * label had been found and no text came out of it. Checking fifteen of them against the live
     * openFDA record showed that was wrong for most: twelve had labels whose
     * `indications_and_usage`, `purpose`, `description`, `clinical_pharmacology` and
     * `mechanism_of_action` fields were all empty — not short, empty. They are homeopathic OTC
     * products, whose SPL carries ingredient and packaging data and no clinical text at all. The
     * three that did carry something carried directions ("Take 15 minutes before meals", "See
     * symptoms on front panel"), which the extractor is right to refuse as an indication.
     *
     * So the remedy is a reading of the label rather than a change to the parser, and for most of
     * these there will be nothing in it to read.
     */
    return `A label exists and carries no clinical text. ${labels?.singleSubstanceLabelCount} published label describes this substance alone; a sample of fifteen records in this group found twelve whose label had no indication, purpose, description or pharmacology field at all — homeopathic products whose label is ingredients and packaging. Confirming each one means opening the label, and for most there is nothing in it to extract.`
  }
  if ((approval?.applicationCount ?? 0) > 0) {
    return 'A manual extraction from the historical label. The medicine was approved and is no longer marketed, so no current label exists to fetch; the approval record is what remains, and the withdrawn label would have to come from the FDA archive rather than the live endpoint.'
  }
  if ((market?.labelCount ?? 0) > 0 || ingredient) {
    return 'Genuinely nothing published. This is a supplement or cosmetic ingredient that the corpus classes as a medicine; no regulator has ever assessed it, so no label, approval or trial exists to find. The honest end state for this record is the notice it now shows.'
  }
  return 'Acquisition has not reached it. No label, approval, product listing or supplement record was found under any name the corpus holds for it — the next step is a name-resolution pass rather than another fetch under the same name.'
}

async function main(): Promise<void> {
  const rows = await db
    .select({
      slug: drugs.slug,
      name: drugs.name,
      approvalStatus: sql<string | null>`${drugs.approvalStatus}::text`,
      background: drugs.recordedBackground,
    })
    .from(drugs)
    .orderBy(drugs.slug)

  process.stdout.write(`assessing ${rows.length} medicines\n`)

  const empty: Row[] = []
  let assessed = 0
  let cursor = 0

  const worker = async (): Promise<void> => {
    for (;;) {
      const row = rows[cursor]
      if (!row) return
      cursor += 1
      const inputs = await loadDossierV4Inputs(row.slug)
      if (!inputs) continue
      const model = buildDossierV4(inputs)
      assessed += 1
      if (assessed % 500 === 0) process.stdout.write(`${assessed}/${rows.length}\n`)
      if (!model.substance.empty) continue

      const background = (row.background ?? null) as Record<string, unknown> | null
      const indexing = decideMedicinePageIndexing(model)
      empty.push({
        slug: row.slug,
        name: row.name,
        approvalStatus: row.approvalStatus,
        has: {
          opening: model.substance.hasOpening,
          explanation: model.substance.hasExplanation,
          humanEvidence: model.substance.hasHumanEvidence,
          mechanism: model.substance.hasMechanism,
        },
        holds: background
          ? Object.keys(background).filter(
              (key) => !['version', 'authoredAt', 'provenanceTier'].includes(key),
            )
          : [],
        remedy: remedyFor(background),
        indexed: indexing.index,
        reason: indexing.reason,
      })
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))

  empty.sort((left, right) => left.slug.localeCompare(right.slug))

  const byRemedy = new Map<string, number>()
  for (const row of empty) byRemedy.set(row.remedy, (byRemedy.get(row.remedy) ?? 0) + 1)

  const summary = {
    assessed,
    empty: empty.length,
    stillIndexed: empty.filter((row) => row.indexed).length,
    byReason: Object.fromEntries(
      [
        ...empty.reduce(
          (counts, row) => counts.set(row.reason, (counts.get(row.reason) ?? 0) + 1),
          new Map<string, number>(),
        ),
      ].sort((a, b) => b[1] - a[1]),
    ),
    byApprovalStatus: Object.fromEntries(
      [
        ...empty.reduce(
          (counts, row) =>
            counts.set(
              row.approvalStatus ?? 'none',
              (counts.get(row.approvalStatus ?? 'none') ?? 0) + 1,
            ),
          new Map<string, number>(),
        ),
      ].sort((a, b) => b[1] - a[1]),
    ),
    byRemedy: Object.fromEntries([...byRemedy.entries()].sort((a, b) => b[1] - a[1])),
  }

  const outPath = resolve('data/dossier-v4/unavailable-records.json')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, `${JSON.stringify({ summary, records: empty }, null, 2)}\n`)
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
}

void main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDatabasePool()
  })
