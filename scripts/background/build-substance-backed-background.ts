import 'dotenv/config'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { normalizeContentName, normalizeIdentityName } from '@/lib/background/name-normalization'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type { MedicineRecordedBackground, RecordedIngredient } from '@/lib/background/types'
import { SUBSTANCE_REGISTRY } from '../seed-data/background/registries'

/**
 * Fills medicine rows from the substance registry.
 *
 * The registry was built for combination products and then only used there, which left single
 * substances reading from the older extraction path alone. That path predates recorded uses, so a
 * row whose label carries only an indications section — every homeopathic preparation, most
 * botanicals, many minerals — came out empty even though the registry had already read it.
 *
 * A single-substance product is a composition of one ingredient, and is recorded as one. The shape
 * is the same as a combination's, because a page should not have two shapes depending on how many
 * things are in the box.
 *
 * This never overwrites: a row that already has recorded background keeps it, and this fills only
 * what is empty. The corpus aggregator applies the same precedence.
 *
 * Usage:
 *   tsx scripts/background/build-substance-backed-background.ts
 */

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
  const registry = Object.values(SUBSTANCE_REGISTRY)
  if (registry.length === 0) {
    console.error('[substance-backed] substance registry is empty; run build-substance-registry.ts')
    process.exit(1)
  }

  /**
   * Names a substance answers to.
   *
   * Both forms are indexed: the identity form so "metoprolol succinate" reaches the succinate entry
   * where one exists, and the content form so a row filed under a base name still reaches a
   * substance the labels only ever spell with its salt.
   */
  const byName = new Map<string, (typeof registry)[number]>()
  for (const substance of registry) {
    const names = [substance.ingredientName, ...substance.printedNamesAsRecorded]
    for (const name of names) {
      for (const key of [normalizeIdentityName(name), normalizeContentName(name)]) {
        if (key.length >= 3 && !byName.has(key)) byName.set(key, substance)
      }
    }
  }

  const retrievedAt = new Date().toISOString().slice(0, 10)
  const dataset: Record<string, MedicineRecordedBackground> = {}
  const stats = { rows: 0, matched: 0, noSubstanceData: 0, engineRejected: 0, written: 0 }

  for (const row of medicineRows()) {
    stats.rows += 1
    const substance =
      byName.get(normalizeIdentityName(row.name)) ?? byName.get(normalizeContentName(row.name))
    if (!substance) continue
    stats.matched += 1

    const hasData = Boolean(
      substance.recordedUses ??
      substance.mechanism ??
      substance.pharmacokinetics ??
      substance.molecularIdentity ??
      substance.interactionSignals?.length,
    )
    if (!hasData) {
      stats.noSubstanceData += 1
      continue
    }

    const ingredient: RecordedIngredient = {
      nameAsRecorded: substance.printedNamesAsRecorded[0] ?? substance.ingredientName,
      substanceKey: substance.ingredientRxcui,
      ...(substance.unii ? { unii: substance.unii } : {}),
      substanceDataState: 'RECORDED',
      ...(substance.recordedUses ? { recordedUses: substance.recordedUses } : {}),
      ...(substance.mechanism ? { mechanism: substance.mechanism } : {}),
      ...(substance.pharmacokinetics ? { pharmacokinetics: substance.pharmacokinetics } : {}),
      ...(substance.molecularIdentity ? { molecularIdentity: substance.molecularIdentity } : {}),
      ...(substance.interactionSignals?.length
        ? { interactionSignals: substance.interactionSignals }
        : {}),
    }

    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      provenanceTier: 'extracted',
      // One ingredient is still a composition. A page that changed shape depending on how many
      // things are in the box would make the reader work out which shape they were looking at.
      composition: {
        ingredients: [ingredient],
        declaredIngredientCount: 1,
        ingredientsWithoutSubstanceData: 0,
      },
    }

    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      stats.engineRejected += 1
      if (stats.engineRejected <= 3) {
        console.error(
          `[substance-backed] ${row.slug}: ${report.findings.map((finding) => finding.code).join(', ')}`,
        )
      }
      continue
    }
    dataset[row.slug] = background
    stats.written += 1
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'substance-backed-background.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[substance-backed] ${JSON.stringify(stats)}`)
  console.log(`[substance-backed] wrote ${stats.written} record(s) to ${outPath}`)
}

main()
