import 'dotenv/config'
import { sql } from 'drizzle-orm'

import { db } from '@/db'
import { newId } from '@/lib/ids'

import { slugify } from '@/lib/ids'

import { baseMoiety, titleCaseDrugName } from './normalise'

/**
 * Removes the pages that a naming fix has just turned into duplicates.
 *
 * When `baseMoiety` learns to strip a salt it did not know about, the record it was producing
 * yesterday — Levocetirizine Dihydrochloride — stops being generated, and the record it produces
 * today — Levocetirizine — is written alongside it. Neither is wrong; there are simply two pages
 * for one drug, and the old one will sit there indefinitely because `pruneStaleStubs` only removes
 * stubs and this one is fully enriched.
 *
 * Nothing unique is lost by removing it. Every field on the old page was derived from the same FDA
 * records that now aggregate under the merged name, and the merged page sees more of them, not
 * fewer. What IS unique — an editorial dossier, a reader's note, an edit someone made — is not
 * derived from anything and cannot be regenerated, so a row carrying any of it is never folded.
 * The old name is kept as a search alias, because it is a real name for the drug and someone will
 * type it.
 */

interface Candidate {
  id: string
  name: string
  slug: string
  depth: string
  successorId: string
  successorName: string
  successorSlug: string
}

async function findCandidates(): Promise<{ fold: Candidate[]; held: string[] }> {
  const result = await db.execute(
    sql`SELECT id, name, slug, dossier_depth AS depth FROM drugs ORDER BY name`,
  )
  const rows = result.rows as Array<{ id: string; name: string; slug: string; depth: string }>

  const byLowerName = new Map(rows.map((row) => [row.name.toLowerCase(), row]))
  const bySlug = new Map(rows.map((row) => [row.slug, row]))
  const fold: Candidate[] = []
  const held: string[] = []

  for (const row of rows) {
    const merged = titleCaseDrugName(baseMoiety(row.name.toUpperCase()))
    if (!merged) continue

    // Two ways a row stops being generated, and the name-based test only sees one of them.
    //
    // A salt form changes NAME: "Levocetirizine Dihydrochloride" now normalises to
    // "Levocetirizine". But a merged duplicate keeps its name and loses its SLUG — `vitamin-c-2`
    // was still called "Vitamin C", so comparing names found nothing and the second page stayed.
    const successor =
      merged.toLowerCase() !== row.name.toLowerCase()
        ? byLowerName.get(merged.toLowerCase())
        : row.slug !== slugify(merged)
          ? bySlug.get(slugify(merged))
          : undefined
    if (!successor || successor.id === row.id) continue

    // An editorial dossier is written by a person and is not reproducible from any source.
    if (row.depth === 'flagship') {
      held.push(`${row.name} — flagship dossier, would fold into ${successor.name}`)
      continue
    }

    const contributions = await db.execute(
      sql`SELECT
            (SELECT count(*) FROM community_notes WHERE drug_id = ${row.id}) AS notes,
            (SELECT count(*) FROM revisions WHERE drug_id = ${row.id}) AS revisions,
            (SELECT count(*) FROM saved_drugs WHERE drug_id = ${row.id}) AS saves`,
    )
    const counts = contributions.rows[0] as { notes: string; revisions: string; saves: string }
    const total = Number(counts.notes) + Number(counts.revisions) + Number(counts.saves)
    if (total > 0) {
      held.push(
        `${row.name} — carries ${counts.notes} notes, ${counts.revisions} revisions, ` +
          `${counts.saves} saves; would fold into ${successor.name}`,
      )
      continue
    }

    fold.push({
      id: row.id,
      name: row.name,
      slug: row.slug,
      depth: row.depth,
      successorId: successor.id,
      successorName: successor.name,
      successorSlug: successor.slug,
    })
  }

  return { fold, held }
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const { fold, held } = await findCandidates()

  console.log(`[fold] ${fold.length} duplicate pages, ${held.length} held back`)
  for (const candidate of fold) {
    console.log(`   ${candidate.name} [${candidate.depth}] -> ${candidate.successorName}`)
  }
  for (const line of held) console.log(`   HELD  ${line}`)

  if (!apply) {
    console.log('\n[fold] dry run. Pass --apply to remove them.')
    process.exit(0)
  }

  let aliased = 0
  for (const candidate of fold) {
    // The alias first: if the delete succeeds and this fails, the name becomes unfindable. Skipped
    // when the two rows share a name, since the survivor already answers to it.
    if (candidate.name.toLowerCase() !== candidate.successorName.toLowerCase()) {
      await db.execute(
        sql`INSERT INTO drug_aliases (id, drug_id, alias, kind, source)
            VALUES (${newId('alias')}, ${candidate.successorId}, ${candidate.name}, 'salt_form',
                    'merged onto the base moiety')
            ON CONFLICT DO NOTHING`,
      )
      aliased += 1
    }
    await db.execute(sql`DELETE FROM drugs WHERE id = ${candidate.id}`)
  }

  console.log(`[fold] removed ${fold.length} pages, kept ${aliased} names as search aliases`)
  process.exit(0)
}

main()
