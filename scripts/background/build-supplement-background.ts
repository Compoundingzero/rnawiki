import 'dotenv/config'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type { MedicineRecordedBackground } from '@/lib/background/types'

/**
 * Builds recorded background for the supplement rows, which were the emptiest part of the corpus.
 *
 * 6,846 of 9,858 medicine rows held nothing at all, and the concentration was stark: dietary
 * supplements sat at 11% coverage against 67% for FDA-approved drugs. The cause is structural
 * rather than an oversight — supplements are absent from the drug-label archive, so a pipeline
 * built on it reaches them and finds nothing, every time, forever.
 *
 * What this records is what the supplement label database holds and a reader can check: how many
 * marketed products list the ingredient, what categories they fall into, what kinds of claim those
 * labels carry, which brands, and the label identifiers behind every count.
 *
 * What it does NOT record, and will not: a mechanism, a pharmacokinetic value, or any suggestion
 * that a claim on a supplement label has been evaluated. A structure/function claim is made
 * unilaterally by the manufacturer under FFDCA 403(r)(6). Recording that such a claim exists on a
 * label is a fact about the label and is presented as nothing more.
 *
 * Usage:
 *   tsx scripts/background/build-supplement-background.ts
 */

interface SupplementMarketEntry {
  queriedName: string
  labelCount: number
  categoriesAsRecorded: string[]
  claimTypesAsRecorded: string[]
  exampleBrands: string[]
  sampleLabelIds: string[]
  state: 'RECORDED' | 'NO_MARKETED_LABEL' | 'LOOKUP_FAILED'
}

/**
 * Marketed labels an ingredient needs before a record is written.
 *
 * One. A single marketed product is still a product on a shelf, and a reader who searched for it
 * deserves to be told what the database holds rather than nothing.
 */
const MIN_LABELS = 1

function main(): void {
  const cachePath =
    process.env.RNAWIKI_DSLD_CACHE ??
    '/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/dsld-market.json'
  if (!existsSync(cachePath)) {
    console.error(`[supplements] no cache at ${cachePath}. Run fetch-supplement-market.ts first.`)
    process.exit(1)
  }
  const cache = JSON.parse(readFileSync(cachePath, 'utf8')) as Record<string, SupplementMarketEntry>
  console.log(`[supplements] ${Object.keys(cache).length} looked-up name(s)`)

  // Corpus rows, so a record is only written for a medicine that exists.
  const rows: Array<{ slug: string; name: string }> = []
  const dir = join(process.cwd(), 'data', 'drugs')
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith('.ndjson'))
    .sort()) {
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as { id?: string; name?: string }
      if (record.id && record.name) rows.push({ slug: record.id, name: record.name })
    }
  }

  const retrievedAt = new Date().toISOString().slice(0, 10)
  const dataset: Record<string, MedicineRecordedBackground> = {}
  const stats = {
    rows: rows.length,
    noLookup: 0,
    noMarketedLabel: 0,
    lookupFailed: 0,
    belowFloor: 0,
    engineRejected: 0,
    written: 0,
  }

  for (const row of rows) {
    const entry = cache[row.name.trim()] ?? cache[row.name.trim().replace(/\)+$/u, '')]
    if (!entry) {
      stats.noLookup += 1
      continue
    }
    if (entry.state === 'LOOKUP_FAILED') {
      stats.lookupFailed += 1
      continue
    }
    if (entry.state === 'NO_MARKETED_LABEL') {
      stats.noMarketedLabel += 1
      continue
    }
    if (entry.labelCount < MIN_LABELS || entry.sampleLabelIds.length === 0) {
      stats.belowFloor += 1
      continue
    }

    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      // Transcribed rather than extracted: the database returns structured fields, and there is no
      // sentence to quote. The label identifiers are what make the counts checkable instead.
      provenanceTier: 'transcribed',
      supplementMarket: {
        labelCount: entry.labelCount,
        categoriesAsRecorded: entry.categoriesAsRecorded,
        claimTypesAsRecorded: entry.claimTypesAsRecorded,
        exampleBrands: entry.exampleBrands,
        sampleLabelIds: entry.sampleLabelIds,
        source: {
          kind: 'DSLD',
          identifier: entry.sampleLabelIds[0]!,
          label: `Supplement label database records listing ${entry.queriedName}`,
          retrievedAt,
        },
      },
    }

    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      stats.engineRejected += 1
      if (stats.engineRejected <= 3) {
        console.error(
          `[supplements] ${row.slug}: ${report.findings.map((finding) => finding.code).join(', ')}`,
        )
      }
      continue
    }
    dataset[row.slug] = background
    stats.written += 1
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'supplement-background.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[supplements] ${JSON.stringify(stats)}`)
  console.log(`[supplements] wrote ${stats.written} record(s) to ${outPath}`)
}

main()
