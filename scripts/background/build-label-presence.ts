import 'dotenv/config'
import { createReadStream, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import { normalizeContentName, normalizeIdentityName } from '@/lib/background/name-normalization'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type { MedicineRecordedBackground, RecordedLabelPresence } from '@/lib/background/types'

/**
 * Counts where each medicine in the corpus appears in the published drug-label archive.
 *
 * The extraction pipeline keeps only labels carrying prose an extractor reads, which is correct for
 * extraction and useless as a measure of what is knowable. Roughly half of this corpus is
 * botanicals, homeopathic preparations, allergenic extracts and animal-derived materials, and their
 * labels carry no clinical pharmacology at all — so extraction scored them zero and left the rows
 * blank. Sampling forty of those blank rows against the archive found twenty of them named on
 * published labels. The information was there; nothing was counting it.
 *
 * What this records is a count of labels, the forms and routes those labels state, and the label
 * identifiers behind the count. It is a fact about the archive. It is not a claim about the
 * substance, not a statement that anything was approved, and not evidence that anything works —
 * unapproved homeopathic products are published in the same archive as approved medicines.
 *
 * `singleSubstanceLabelCount` is the number that makes the rest of a thin record legible. A
 * substance named only ever alongside thirty others has no source about it alone, which is exactly
 * why its mechanism and pharmacokinetics are empty, and saying so is better than a blank page.
 *
 * These values are `transcribed`: the archive returns structured fields with no sentence behind
 * them, so there is no excerpt to quote and the set ids stand in its place.
 *
 * Usage:
 *   tsx scripts/background/build-label-presence.ts <presence.ndjson>
 */

interface PresenceLine {
  setId: string
  /** Content-normalized substance and generic names, produced by the Python indexer. */
  names: string[]
  declared: number
  productTypes: string[]
  routes: string[]
  effectiveTime?: string | null
}

interface Aggregate {
  labelCount: number
  singleSubstanceLabelCount: number
  productTypes: Set<string>
  routes: Set<string>
  mostRecentEffectiveTime?: string
  sampleLabelIds: string[]
}

/** Kept per medicine: enough to check a count, not a product directory. */
const MAX_SAMPLE_IDS = 8
const MAX_LIST_VALUES = 12

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

function empty(): Aggregate {
  return {
    labelCount: 0,
    singleSubstanceLabelCount: 0,
    productTypes: new Set(),
    routes: new Set(),
    sampleLabelIds: [],
  }
}

async function main() {
  const presencePath = process.argv[2]
  if (!presencePath) {
    console.error('usage: tsx scripts/background/build-label-presence.ts <presence.ndjson>')
    process.exit(1)
  }

  const rows = medicineRows()
  // Only keys some corpus row asks for are aggregated. The archive holds far more substances than
  // this corpus does, and holding all of them in memory buys nothing.
  const wanted = new Map<string, Aggregate>()
  for (const row of rows) {
    for (const key of [normalizeContentName(row.name), normalizeIdentityName(row.name)]) {
      if (key.length >= 3 && !wanted.has(key)) wanted.set(key, empty())
    }
  }
  console.log(`[presence] ${rows.length} medicine row(s) · ${wanted.size} name key(s) sought`)

  let lines = 0
  const reader = createInterface({
    input: createReadStream(presencePath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of reader) {
    if (!line.trim()) continue
    lines += 1
    const label = JSON.parse(line) as PresenceLine
    // A label is counted once per medicine it names, never once per spelling of that medicine.
    const matched = new Set<Aggregate>()
    for (const name of label.names) {
      const aggregate = wanted.get(name)
      if (aggregate) matched.add(aggregate)
    }
    for (const aggregate of matched) {
      aggregate.labelCount += 1
      if (label.declared === 1) aggregate.singleSubstanceLabelCount += 1
      for (const type of label.productTypes) aggregate.productTypes.add(type)
      for (const route of label.routes) aggregate.routes.add(route)
      const effective = label.effectiveTime ?? undefined
      if (
        effective &&
        (!aggregate.mostRecentEffectiveTime || effective > aggregate.mostRecentEffectiveTime)
      ) {
        aggregate.mostRecentEffectiveTime = effective
      }
      // Sampled by taking the first identifiers the stream offers, which is deterministic because
      // the archive partitions are read in order.
      if (aggregate.sampleLabelIds.length < MAX_SAMPLE_IDS)
        aggregate.sampleLabelIds.push(label.setId)
    }
    if (lines % 50_000 === 0) console.log(`[presence] ${lines} label(s) read`)
  }
  console.log(`[presence] ${lines} label(s) read`)

  const retrievedAt = new Date().toISOString().slice(0, 10)
  const dataset: Record<string, MedicineRecordedBackground> = {}
  const stats = { rows: rows.length, noPresence: 0, engineRejected: 0, written: 0 }

  for (const row of rows) {
    const aggregate =
      wanted.get(normalizeContentName(row.name)) ?? wanted.get(normalizeIdentityName(row.name))
    if (!aggregate || aggregate.labelCount === 0 || aggregate.sampleLabelIds.length === 0) {
      stats.noPresence += 1
      continue
    }

    const presence: RecordedLabelPresence = {
      labelCount: aggregate.labelCount,
      singleSubstanceLabelCount: aggregate.singleSubstanceLabelCount,
      productTypesAsRecorded: [...aggregate.productTypes].sort().slice(0, MAX_LIST_VALUES),
      routesAsRecorded: [...aggregate.routes].sort().slice(0, MAX_LIST_VALUES),
      ...(aggregate.mostRecentEffectiveTime
        ? { mostRecentEffectiveTime: aggregate.mostRecentEffectiveTime }
        : {}),
      sampleLabelIds: aggregate.sampleLabelIds,
      source: {
        kind: 'FDA_LABEL',
        // The identifier cites one of the counted labels, so the count has a document behind it
        // rather than a claim about a database.
        identifier: aggregate.sampleLabelIds[0]!,
        label: `Published labels naming ${row.name} as an active ingredient`,
        retrievedAt,
      },
    }

    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      provenanceTier: 'transcribed',
      labelPresence: presence,
    }

    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      stats.engineRejected += 1
      if (stats.engineRejected <= 3) {
        console.error(
          `[presence] ${row.slug}: ${report.findings.map((finding) => finding.code).join(', ')}`,
        )
      }
      continue
    }
    dataset[row.slug] = background
    stats.written += 1
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'label-presence.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[presence] ${JSON.stringify(stats)}`)
  console.log(`[presence] wrote ${stats.written} record(s) to ${outPath}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
