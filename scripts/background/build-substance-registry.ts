import 'dotenv/config'
import { createReadStream, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import {
  extractInteractionSignals,
  extractRecordedUses,
  extractMechanism,
  extractMolecularIdentity,
  extractPharmacokinetics,
  pharmacokineticsWithinPlausibleRange,
  type LabelArtifact,
} from '@/lib/background/label-extraction'
import { normalizeContentName } from '@/lib/background/name-normalization'
import type {
  RecordedInteractionSignal,
  RecordedUses,
  RecordedMechanism,
  RecordedMolecularIdentity,
  RecordedPharmacokinetics,
} from '@/lib/background/types'

/**
 * Builds the substance registry: what is known about each active ingredient, keyed by ingredient
 * rather than by product.
 *
 * This is the half of the product model that makes combinations possible. A mechanism belongs to a
 * substance, not to a carton: amoxicillin's mechanism is the same fact whether it is sold alone or
 * with clavulanate, and re-deriving it per product would mean the same substance carried different
 * facts on different pages and a correction reached only one of them. Recorded once here, an
 * ingredient composes into every product containing it.
 *
 * Only labels about a single substance are read, which is the attribution guarantee applied where
 * it belongs. A combination label discusses its substances together, so nothing on it is a
 * statement about any one of them; a substance whose only sources are combination labels therefore
 * gets no entry, and the product page says so rather than leaving a silent gap.
 *
 * Requires the ingredient mapping from resolve-active-moieties.ts, because the registry is keyed on
 * the RxNorm ingredient concept: "clavulanate potassium" and "clavulanic acid" must reach one
 * entry, not two.
 *
 * Usage:
 *   tsx scripts/background/build-substance-registry.ts <labelIndex.ndjson>
 */

interface IndexedLabel {
  setId: string
  declaredSubstanceCount?: number
  effectiveTime?: string
  brandNames: string[]
  genericNames: string[]
  substanceNames?: string[]
  routes: string[]
  unii?: string
  rxcui?: string
  sections: Record<string, string>
  score: number
}

interface ResolvedIngredient {
  ingredientRxcui?: string
  ingredientName?: string
  state: string
}

export interface RegisteredSubstance {
  ingredientRxcui: string
  ingredientName: string
  /** Spellings labels printed for this ingredient, so the mapping stays inspectable. */
  printedNamesAsRecorded: string[]
  unii?: string
  /** Single-substance labels available for it; more means the entry could be corroborated. */
  sourceLabelCount: number
  recordedUses?: RecordedUses
  mechanism?: RecordedMechanism
  pharmacokinetics?: RecordedPharmacokinetics
  molecularIdentity?: RecordedMolecularIdentity
  interactionSignals?: RecordedInteractionSignal[]
}

/** Printed spellings kept per substance. */
const MAX_PRINTED_NAMES = 12

function main(): void {
  const [indexPath] = process.argv.slice(2).filter((value) => !value.startsWith('--'))
  if (!indexPath || !existsSync(indexPath)) {
    console.error('Usage: tsx scripts/background/build-substance-registry.ts <labelIndex.ndjson>')
    process.exit(1)
  }
  const cachePath =
    process.env.RNAWIKI_MOIETY_CACHE ??
    '/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/rxnorm-ingredients.json'
  if (!existsSync(cachePath)) {
    console.error(
      `[substances] no ingredient cache at ${cachePath}. Run resolve-active-moieties.ts first.`,
    )
    process.exit(1)
  }
  void build(
    indexPath,
    JSON.parse(readFileSync(cachePath, 'utf8')) as Record<string, ResolvedIngredient>,
  )
}

async function build(
  indexPath: string,
  resolved: Record<string, ResolvedIngredient>,
): Promise<void> {
  const retrievedAt = new Date().toISOString().slice(0, 10)

  interface Candidate {
    label: IndexedLabel
    printedName: string
    ingredientName: string
  }
  /** The best single-substance label seen for each ingredient, plus what it was called. */
  const best = new Map<string, Candidate>()
  const printedNames = new Map<string, Set<string>>()
  const labelCounts = new Map<string, number>()
  const stats = { labelsRead: 0, singleSubstance: 0, resolvedToIngredient: 0 }

  const reader = createInterface({
    input: createReadStream(indexPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })

  for await (const line of reader) {
    if (!line.trim()) continue
    const label = JSON.parse(line) as IndexedLabel
    stats.labelsRead += 1
    // The attribution guarantee: only a document about one substance says anything about it alone.
    if (label.declaredSubstanceCount !== 1) continue
    stats.singleSubstance += 1

    const printed = (label.substanceNames?.length ? label.substanceNames : label.genericNames) ?? []
    const first = printed.find((name) => normalizeContentName(name).length >= 3)
    if (!first) continue
    const entry = resolved[first.trim()]
    if (!entry?.ingredientRxcui) continue
    stats.resolvedToIngredient += 1

    const key = entry.ingredientRxcui
    labelCounts.set(key, (labelCounts.get(key) ?? 0) + 1)
    const names = printedNames.get(key) ?? new Set<string>()
    if (names.size < MAX_PRINTED_NAMES) names.add(first.trim())
    printedNames.set(key, names)

    // The label carrying the most extractable sections wins, so a substance is described by the
    // richest source available rather than by whichever was read first.
    const held = best.get(key)
    if (!held || label.score > held.label.score) {
      best.set(key, {
        label,
        printedName: first.trim(),
        ingredientName: entry.ingredientName ?? first.trim().toLowerCase(),
      })
    }
  }

  const registry: Record<string, RegisteredSubstance> = {}
  const moduleCounts = new Map<string, number>()
  for (const [key, candidate] of best) {
    const artifact: LabelArtifact = {
      setId: candidate.label.setId,
      declaredSubstanceCount: candidate.label.declaredSubstanceCount,
      effectiveTime: candidate.label.effectiveTime,
      brandNames: candidate.label.brandNames,
      genericNames: candidate.label.genericNames,
      routes: candidate.label.routes,
      unii: candidate.label.unii,
      rxcui: candidate.label.rxcui,
      sections: candidate.label.sections,
    }
    const options = { retrievedAt, sourceLabel: `${candidate.printedName} label` }

    const pharmacokinetics = extractPharmacokinetics(artifact, options)
    const gated = pharmacokinetics ? pharmacokineticsWithinPlausibleRange(pharmacokinetics) : null
    const hasPk = gated && Object.keys(gated).some((field) => field !== 'routeAsRecorded')
    const mechanism = extractMechanism(artifact, options)
    const molecularIdentity = extractMolecularIdentity(artifact, options)
    const interactionSignals = extractInteractionSignals(artifact, options)
    // The indications section is on 99.8% of single-substance labels and is the only section a
    // homeopathic preparation, a botanical extract or a mineral usually has. Without it those
    // substances are blank in a record whose source plainly says something.
    const recordedUses = extractRecordedUses(artifact, options)

    const substance: RegisteredSubstance = {
      ingredientRxcui: key,
      ingredientName: candidate.ingredientName,
      printedNamesAsRecorded: [...(printedNames.get(key) ?? [])].sort(),
      ...(candidate.label.unii ? { unii: candidate.label.unii } : {}),
      sourceLabelCount: labelCounts.get(key) ?? 1,
      ...(recordedUses ? { recordedUses } : {}),
      ...(mechanism ? { mechanism } : {}),
      ...(hasPk && gated ? { pharmacokinetics: gated } : {}),
      ...(molecularIdentity ? { molecularIdentity } : {}),
      ...(interactionSignals.length > 0 ? { interactionSignals } : {}),
    }
    for (const moduleName of [
      'recordedUses',
      'mechanism',
      'pharmacokinetics',
      'molecularIdentity',
      'interactionSignals',
    ] as const) {
      if (substance[moduleName]) {
        moduleCounts.set(moduleName, (moduleCounts.get(moduleName) ?? 0) + 1)
      }
    }
    registry[key] = substance
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'substance-registry.json')
  writeFileSync(outPath, `${JSON.stringify(registry, null, 1)}\n`)

  console.log(`[substances] ${JSON.stringify(stats)}`)
  console.log(`[substances] ${Object.keys(registry).length} ingredient(s) registered`)
  console.log(`[substances] modules: ${JSON.stringify(Object.fromEntries(moduleCounts))}`)
  console.log(`[substances] wrote ${outPath}`)
}

main()
