import 'dotenv/config'
import { createReadStream, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import {
  alternativeNames,
  normalizeContentName,
  normalizeIdentityName,
} from '@/lib/background/name-normalization'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type { MedicineRecordedBackground, RecordedSourceMaterial } from '@/lib/background/types'

/**
 * Records what kind of material each substance is, from FDA's substance registry.
 *
 * The registry answers a question nothing else in this corpus could: whether a substance is a
 * chemical, a protein, a polymer, a mixture, or material taken from an organism — and where an
 * organism is involved, which organism and which part of it.
 *
 * The part is why this exists. Kew's Medicinal Plant Names Services holds the plant part used for
 * medicinal botanicals and cannot be used: no published licence, ClaudeBot disallowed in its
 * robots.txt, rights reserved under EU DSM Article 4. The FDA registry carries the same fact as a
 * US Government work, and carries it better, because it is the registry the labels are keyed to.
 *
 * The taxonomy module infers a part by stripping a trailing word from the row's name — "Curcuma
 * Longa Leaf" ends in "leaf" — which works and is inference. This is the registry saying so.
 *
 * A name is matched only where it resolves to exactly ONE substance record. The registry holds
 * 167,385 substances and its names collide with each other; an ambiguous identity is not an
 * identity, which is the rule the taxonomy and identity matches already run on.
 *
 * Source: `https://download.open.fda.gov/other/substance/other-substance-0001-of-0001.json.zip`,
 * one public-domain bulk file of about 317 MB, reduced by
 * `scripts/background/index-openfda-substances.py`. No API, nothing to rate-limit.
 *
 * Usage:
 *   tsx scripts/background/build-source-material.ts <substances.ndjson>
 */

interface SubstanceLine {
  unii: string
  preferredName: string
  names: string[]
  substanceClass?: string | null
  part: string[]
  parentSubstance?: string | null
  sourceMaterialClass?: string | null
  sourceMaterialType?: string | null
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

async function main() {
  const path = process.argv[2]
  if (!path) {
    console.error('usage: tsx scripts/background/build-source-material.ts <substances.ndjson>')
    process.exit(1)
  }

  const rows = medicineRows()
  const wanted = new Set<string>()
  for (const row of rows) {
    for (const candidate of alternativeNames(row.name)) {
      for (const key of [normalizeContentName(candidate), normalizeIdentityName(candidate)]) {
        if (key.length >= 3) wanted.add(key)
      }
    }
  }
  console.log(`[material] ${rows.length} medicine row(s) · ${wanted.size} name key(s) sought`)

  // Every substance each wanted name could mean. A name claimed by more than one is dropped rather
  // than guessed at.
  const candidates = new Map<string, Map<string, SubstanceLine>>()
  let read = 0
  const reader = createInterface({
    input: createReadStream(path, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of reader) {
    if (!line.trim()) continue
    read += 1
    const substance = JSON.parse(line) as SubstanceLine
    for (const name of [substance.preferredName, ...substance.names]) {
      for (const key of [normalizeContentName(name), normalizeIdentityName(name)]) {
        if (!wanted.has(key)) continue
        const held = candidates.get(key) ?? new Map<string, SubstanceLine>()
        if (!held.has(substance.unii)) held.set(substance.unii, substance)
        candidates.set(key, held)
      }
    }
    if (read % 50_000 === 0) console.log(`[material] ${read} substance record(s) read`)
  }
  console.log(`[material] ${read} substance record(s) read`)

  const resolved = new Map<string, SubstanceLine>()
  let ambiguous = 0
  for (const [key, byUnii] of candidates) {
    if (byUnii.size === 1) resolved.set(key, [...byUnii.values()][0]!)
    else ambiguous += 1
  }

  const retrievedAt = new Date().toISOString().slice(0, 10)
  const dataset: Record<string, MedicineRecordedBackground> = {}
  const stats = {
    substances: read,
    namesAmbiguous: ambiguous,
    namesResolved: resolved.size,
    noClass: 0,
    partWithoutParent: 0,
    engineRejected: 0,
    withPart: 0,
    written: 0,
  }

  for (const row of rows) {
    // Alternatives are tried longest first, so the most specific name a title offers wins.
    let substance: SubstanceLine | undefined
    for (const candidate of alternativeNames(row.name)) {
      substance =
        resolved.get(normalizeContentName(candidate)) ??
        resolved.get(normalizeIdentityName(candidate))
      if (substance) break
    }
    if (!substance) continue
    const substanceClass = substance.substanceClass?.trim()
    if (!substanceClass) {
      stats.noClass += 1
      continue
    }
    const parent = substance.parentSubstance?.trim()
    const parts = substance.part.filter((value) => value.trim().length > 0)
    // A part with no organism beside it states half a fact, and the engine refuses it. Dropping the
    // part rather than the record keeps the substance class, which is worth having on its own.
    const keepParts = parts.length > 0 && Boolean(parent)
    if (parts.length > 0 && !parent) stats.partWithoutParent += 1

    const material: RecordedSourceMaterial = {
      substanceClassAsRecorded: substanceClass,
      ...(substance.sourceMaterialClass
        ? { sourceMaterialClassAsRecorded: substance.sourceMaterialClass }
        : {}),
      ...(substance.sourceMaterialType
        ? { sourceMaterialTypeAsRecorded: substance.sourceMaterialType }
        : {}),
      ...(parent ? { parentSubstanceAsRecorded: parent } : {}),
      partsAsRecorded: keepParts ? parts : [],
      source: {
        kind: 'FDA_UNII',
        identifier: substance.unii,
        label: `Substance registry record for ${substance.preferredName}`,
        retrievedAt,
      },
    }
    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      provenanceTier: 'transcribed',
      sourceMaterial: material,
    }
    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      stats.engineRejected += 1
      if (stats.engineRejected <= 3) {
        console.error(
          `[material] rejected ${row.slug}: ${report.findings.map((f) => `${f.code} at ${f.path}`).join(', ')}`,
        )
      }
      continue
    }
    if (keepParts) stats.withPart += 1
    dataset[row.slug] = background
    stats.written += 1
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'source-material.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[material] ${JSON.stringify(stats)}`)
  console.log(`[material] wrote ${stats.written} record(s) to ${outPath}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
