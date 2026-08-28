import 'dotenv/config'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { normalizeContentName, normalizeIdentityName } from '@/lib/background/name-normalization'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type { MedicineRecordedBackground, RecordedIngredient } from '@/lib/background/types'
import { SUBSTANCE_REGISTRY } from '../seed-data/background/registries'

/**
 * Fills the ingredient breakdown for corpus rows that are themselves combination products.
 *
 * "Carbidopa, Levodopa", "Amlodipine / Valsartan", "Dapagliflozin, Metformin" and
 * "Abacavir, Dolutegravir, Lamivudine" are single rows naming several active substances. Their pages
 * showed a product variant and a count of labels and nothing about what is in the box — even though
 * the substance registry already held every one of those ingredients separately.
 *
 * Each ingredient's data comes from the substance registry, which is built exclusively from labels
 * declaring one active substance. That is what makes this sound: nothing is read off the
 * combination's own label and attributed to one of its ingredients, which is the mis-attribution the
 * record model exists to prevent. The combination's label supplies only the fact that these
 * substances are in it.
 *
 * Usage:
 *   tsx scripts/background/build-combination-row-composition.ts
 */

/**
 * Words that follow a comma or slash without naming a second active substance.
 *
 * A naive split turned "Barium Phosphate, Dibasic" into barium phosphate plus "dibasic" and
 * "Carboxymethylcellulose Sodium, Unspecified Form" into a two-ingredient product. Both are one
 * substance with a qualifier after the comma, and a page claiming otherwise would be inventing an
 * ingredient.
 */
const QUALIFIER_PARTS = new Set([
  'dibasic',
  'monobasic',
  'tribasic',
  'anhydrous',
  'unspecified form',
  'unspecified',
  'usp',
  'nf',
  'micronized',
  'hydrous',
  'basic',
  'acid',
  'salt',
  'as base',
  'base',
  'kit',
  'and',
])

/** Separators a label uses between the active substances of a combination. */
const SEPARATOR = /\s*(?:,|\/|\band\b|\bwith\b|\bplus\b|\+)\s*/iu

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
    console.error('[combo-rows] substance registry is empty; run build-substance-registry.ts')
    process.exit(1)
  }

  const byName = new Map<string, (typeof registry)[number]>()
  for (const substance of registry) {
    for (const name of [substance.ingredientName, ...substance.printedNamesAsRecorded]) {
      for (const key of [normalizeIdentityName(name), normalizeContentName(name)]) {
        if (key.length >= 3 && !byName.has(key)) byName.set(key, substance)
      }
    }
  }

  const retrievedAt = new Date().toISOString().slice(0, 10)
  const dataset: Record<string, MedicineRecordedBackground> = {}
  const stats = {
    rows: 0,
    joinedNames: 0,
    rejectedQualifier: 0,
    rejectedUnresolved: 0,
    rejectedDuplicateSubstance: 0,
    rejectedNoSubstanceData: 0,
    engineRejected: 0,
    written: 0,
  }

  for (const row of medicineRows()) {
    stats.rows += 1
    const parts = row.name
      .split(SEPARATOR)
      .map((part) => part.trim())
      .filter((part) => part.length >= 3)
    if (parts.length < 2) continue
    stats.joinedNames += 1

    if (parts.some((part) => QUALIFIER_PARTS.has(part.toLowerCase()))) {
      stats.rejectedQualifier += 1
      continue
    }

    const resolved = parts.map(
      (part) => byName.get(normalizeIdentityName(part)) ?? byName.get(normalizeContentName(part)),
    )
    if (resolved.some((substance) => substance === undefined)) {
      stats.rejectedUnresolved += 1
      continue
    }
    const substances = resolved as NonNullable<(typeof resolved)[number]>[]

    // "Ampicillin/Ampicillin" and "Cefadroxil/Cefadroxil" are labelling artefacts, not two-substance
    // products. A product cannot contain the same active substance twice, and the engine refuses a
    // composition that says so.
    const keys = new Set(substances.map((substance) => substance.ingredientRxcui))
    if (keys.size !== substances.length) {
      stats.rejectedDuplicateSubstance += 1
      continue
    }

    const ingredients: RecordedIngredient[] = substances.map((substance) => {
      const hasData = Boolean(
        substance.recordedUses ??
        substance.mechanism ??
        substance.pharmacokinetics ??
        substance.molecularIdentity ??
        substance.interactionSignals?.length,
      )
      return {
        nameAsRecorded: substance.printedNamesAsRecorded[0] ?? substance.ingredientName,
        substanceKey: substance.ingredientRxcui,
        ...(substance.unii ? { unii: substance.unii } : {}),
        substanceDataState: hasData ? 'RECORDED' : 'NO_SOURCE_ABOUT_THIS_SUBSTANCE_ALONE',
        ...(substance.recordedUses ? { recordedUses: substance.recordedUses } : {}),
        ...(substance.mechanism ? { mechanism: substance.mechanism } : {}),
        ...(substance.pharmacokinetics ? { pharmacokinetics: substance.pharmacokinetics } : {}),
        ...(substance.molecularIdentity ? { molecularIdentity: substance.molecularIdentity } : {}),
        ...(substance.interactionSignals?.length
          ? { interactionSignals: substance.interactionSignals }
          : {}),
      }
    })

    if (!ingredients.some((ingredient) => ingredient.substanceDataState === 'RECORDED')) {
      // A composition where no ingredient has any data tells a reader nothing they could not see
      // from the name, and the name is already on the page.
      stats.rejectedNoSubstanceData += 1
      continue
    }

    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      provenanceTier: 'extracted',
      composition: {
        ingredients,
        declaredIngredientCount: ingredients.length,
        ingredientsWithoutSubstanceData: ingredients.filter(
          (ingredient) => ingredient.substanceDataState !== 'RECORDED',
        ).length,
      },
    }

    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      stats.engineRejected += 1
      console.error(
        `[combo-rows] rejected ${row.slug}: ${report.findings
          .map((finding) => `${finding.code} at ${finding.path}`)
          .join(', ')}`,
      )
      continue
    }
    dataset[row.slug] = background
    stats.written += 1
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'combination-row-composition.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[combo-rows] ${JSON.stringify(stats)}`)
  console.log(`[combo-rows] wrote ${stats.written} record(s) to ${outPath}`)
}

main()
