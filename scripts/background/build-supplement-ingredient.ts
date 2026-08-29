import 'dotenv/config'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { normalizeContentName, normalizeIdentityName } from '@/lib/background/name-normalization'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type {
  MedicineRecordedBackground,
  RecordedSupplementIngredient,
} from '@/lib/background/types'

/**
 * Records how the supplement label database files each ingredient, from its own vocabulary.
 *
 * This is the payoff from asking the database for its vocabulary instead of interrogating it one
 * corpus row at a time. A keyword search of PRODUCT text cannot find "18-Hydroxyeicosahexaenoic
 * Acid", because no product is named that — and 9,772 such searches is how the previous approach
 * spent its way to two rate-limit incidents. The database holds the substance as an ingredient
 * group all the same, classified, with every label spelling it has collected.
 *
 * 1,038 rows that carried nothing at all are ingredient groups in this vocabulary.
 *
 * A category is a filing decision by the database, not a finding about the substance.
 * "Non-nutrient/non-botanical" says where the database put it and nothing about what it does, and
 * the recorded caveat says so.
 *
 * Source: `/v9/ingredient-groups?method=by_letter`, twenty-seven requests for the whole vocabulary,
 * fetched by `fetch-supplement-vocabulary.ts`. Licence: CC0 1.0 Universal, declared by the API's own
 * documentation.
 *
 * Usage:
 *   tsx scripts/background/build-supplement-ingredient.ts [vocabulary.json]
 */

interface IngredientGroup {
  groupId: string
  groupName: string
  categories: string[]
  synonyms: string[]
}

interface MedicineRow {
  slug: string
  name: string
}

function medicineRows(): MedicineRow[] {
  const dir = join(process.cwd(), 'data', 'drugs')
  const rows: MedicineRow[] = []
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith('.ndjson'))
    .sort()) {
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as { id?: string; name?: string }
      if (record.id && record.name) rows.push({ slug: record.id, name: record.name })
    }
  }
  return rows
}

function main(): void {
  const path =
    process.argv[2] ??
    process.env.RNAWIKI_DSLD_VOCABULARY ??
    '/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/dsld-vocabulary.json'

  const vocabulary = JSON.parse(readFileSync(path, 'utf8')) as Record<string, IngredientGroup>
  const groups = Object.values(vocabulary)
  if (groups.length === 0) {
    console.error('[ingredients] vocabulary is empty; run fetch-supplement-vocabulary.ts')
    process.exit(1)
  }

  /**
   * Every spelling an ingredient answers to.
   *
   * First writer wins, so a name claimed by two groups keeps the first alphabetically rather than
   * whichever happened to be read last. That is a weaker guarantee than the one-taxon rule the
   * taxonomy match uses, and it is why nothing substance-specific is recorded from this source —
   * only the database's own filing decision, which is what a collision would at worst mis-file.
   */
  const byName = new Map<string, IngredientGroup>()
  for (const group of groups) {
    for (const name of [group.groupName, ...group.synonyms]) {
      for (const key of [normalizeContentName(name), normalizeIdentityName(name)]) {
        if (key.length >= 3 && !byName.has(key)) byName.set(key, group)
      }
    }
  }

  const rows = medicineRows()
  console.log(
    `[ingredients] ${groups.length} ingredient group(s) · ${byName.size} name key(s) · ${rows.length} medicine row(s)`,
  )

  const retrievedAt = new Date().toISOString().slice(0, 10)
  const dataset: Record<string, MedicineRecordedBackground> = {}
  const stats = { matched: 0, engineRejected: 0, written: 0 }

  for (const row of rows) {
    const group =
      byName.get(normalizeContentName(row.name)) ?? byName.get(normalizeIdentityName(row.name))
    if (!group) continue
    stats.matched += 1

    const ingredient: RecordedSupplementIngredient = {
      groupNameAsRecorded: group.groupName,
      categoriesAsRecorded: group.categories,
      recordedSpellingCount: group.synonyms.length,
      source: {
        kind: 'DSLD',
        identifier: group.groupId,
        label: `Supplement label database ingredient group for ${group.groupName}`,
        retrievedAt,
      },
    }
    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      provenanceTier: 'transcribed',
      supplementIngredient: ingredient,
    }
    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      stats.engineRejected += 1
      if (stats.engineRejected <= 3) {
        console.error(
          `[ingredients] rejected ${row.slug}: ${report.findings.map((f) => `${f.code} at ${f.path}`).join(', ')}`,
        )
      }
      continue
    }
    dataset[row.slug] = background
    stats.written += 1
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'supplement-ingredient.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[ingredients] ${JSON.stringify(stats)}`)
  console.log(`[ingredients] wrote ${stats.written} record(s) to ${outPath}`)
}

main()
