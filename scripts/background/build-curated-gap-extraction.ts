import 'dotenv/config'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import type { MedicineRecordedBackground } from '@/lib/background/types'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'

import { RECORDED_BACKGROUND } from '../seed-data/background'
import { buildIndex, extractRowBackground, loadMedicineRows } from './build-extracted-background'

/**
 * Runs the deterministic label extractor over the rows it was never pointed at: the hand-curated
 * ones.
 *
 * The recorded-background corpus has tiers, and the tiers were built in the wrong order for one
 * class of row. `build-extracted-background.ts` skips every slug the curated corpus covers —
 * correctly, because extraction must never overwrite a person's judgement — and nothing ever came
 * back to ask the narrower question: does the curated envelope have a GAP the same extractor could
 * fill? It does, and the gap is on the most-read pages in the corpus. Metformin has 390 published
 * labels, 316 of which name it as their only active substance, and its page states no mechanism,
 * no recorded uses, no safety statements, no population statements and no common adverse
 * reactions, while thousands of thinner rows state all five. Not one of the 155 curated records
 * carries any of those modules.
 *
 * What this script produces is therefore additive by construction:
 * - The extraction is the same extraction, not a second implementation of it. `extractRowBackground`
 *   is imported from the extracted-tier builder, so the name matching, the identity resolution and
 *   the attribution rules in `lib/background/types.ts` — substance-specific modules only from a
 *   label declaring exactly one active substance, product-level modules from a label naming the
 *   product — are literally the same code path.
 * - A module the curated envelope already holds is discarded here and never written. The registry
 *   carries only what a curator left absent, so the merge in
 *   `scripts/seed-data/background/index.ts` cannot overwrite curated work even if it tried to.
 * - Every value keeps `provenanceTier: 'extracted'` and its own source excerpt and label set id,
 *   so a reader is told which sentences a parser read and which a person judged.
 *
 * Nothing is written that the background engine has not passed twice: once on the registry value
 * standing alone, and once on the envelope the merge will actually produce. A module implicated in
 * a finding is dropped rather than repaired.
 *
 * Usage:
 *   RNAWIKI_INGEST_DATA=/path/to/ingest-data \
 *     tsx scripts/background/build-curated-gap-extraction.ts [labelIndex.ndjson] \
 *       [--limit=N] [--retrieved-at=YYYY-MM-DD]
 *
 * The index is the same reduced NDJSON the extracted tier reads, produced by
 * `scripts/background/index-openfda-labels.py`. It is streamed a line at a time: the file is larger
 * than the maximum string a Node process can hold.
 */

/**
 * The modules this registry may carry, in the order the extractor produces them.
 *
 * These are the extractor's modules minus two, and the omission is the point. A record here is
 * attached to an envelope that stays CURATED tier, so the only thing telling a reader which values
 * a parser read is the `provenanceTier` on each value. `productVariants` and `registryIdentifiers`
 * have no per-value tier field — `RecordedProductVariant` and `RecordedRegistryIdentifiers` carry a
 * source and nothing else — so attaching either would put an unmarked machine-read value inside a
 * record a person authored, which is the one thing the tier model exists to prevent. They stay in
 * the extracted tier, where the whole envelope is marked, and they are refused here.
 */
const ATTACHABLE_MODULES = [
  'pharmacokinetics',
  'recordedUses',
  'mechanism',
  'molecularIdentity',
  'interactionSignals',
  'safety',
  'populationStatements',
  'commonAdverseReactions',
] as const
type ExtractableModule = (typeof ATTACHABLE_MODULES)[number]

const OUTPUT_PATH = join(process.cwd(), 'data', 'registries', 'curated-gap-extraction.json')

/** Whether an envelope actually holds this module. An empty array holds nothing. */
function holds(background: MedicineRecordedBackground, moduleName: ExtractableModule): boolean {
  const value = background[moduleName]
  return Array.isArray(value) ? value.length > 0 : value !== undefined
}

/**
 * Builds the registry value for one row: the extraction envelope reduced to the modules named.
 *
 * `attribution` travels with it because it is what makes the value checkable on its own — the
 * engine refuses a substance-specific module on an extracted record unless the source declared
 * exactly one substance, and that count is the declaration. It is deliberately NOT attached to the
 * curated envelope during the merge: a count describing one extraction source would be a false
 * statement about a record whose other values came from sources a person chose.
 */
function registryValue(
  extraction: MedicineRecordedBackground,
  keep: ReadonlySet<ExtractableModule>,
): MedicineRecordedBackground {
  const value: MedicineRecordedBackground = {
    version: extraction.version,
    authoredAt: extraction.authoredAt,
    provenanceTier: 'extracted',
    ...(extraction.attribution ? { attribution: extraction.attribution } : {}),
  }
  for (const moduleName of ATTACHABLE_MODULES) {
    if (!keep.has(moduleName)) continue
    // Assigning through a narrowed key: the module names are keys of the same envelope type on
    // both sides, so the value carried across is the value the extractor produced, unchanged.
    Object.assign(value, { [moduleName]: extraction[moduleName] })
  }
  return value
}

/** The envelope the merge step will produce: the curated record plus the modules it lacked. */
function mergedEnvelope(
  curated: MedicineRecordedBackground,
  value: MedicineRecordedBackground,
  keep: ReadonlySet<ExtractableModule>,
): MedicineRecordedBackground {
  const merged: MedicineRecordedBackground = { ...curated }
  for (const moduleName of keep) Object.assign(merged, { [moduleName]: value[moduleName] })
  return merged
}

async function main() {
  const positional = process.argv.slice(2).filter((value) => !value.startsWith('--'))
  const ingestDir = process.env.RNAWIKI_INGEST_DATA
  const indexPath = positional[0] ?? (ingestDir ? join(ingestDir, 'label-index.ndjson') : undefined)
  if (!indexPath || !existsSync(indexPath)) {
    console.error(
      'Usage: RNAWIKI_INGEST_DATA=<dir> tsx scripts/background/build-curated-gap-extraction.ts [labelIndex.ndjson] [--limit=N] [--retrieved-at=YYYY-MM-DD]',
    )
    process.exit(1)
  }

  const limitFlag = process.argv.find((value) => value.startsWith('--limit='))
  const limit = limitFlag ? Number(limitFlag.split('=')[1]) : Infinity

  // When the SOURCE was retrieved, not when this parser ran — the same distinction the extracted
  // tier draws, for the same reason: re-parsing a cached archive does not make its labels newer.
  const retrievedAtFlag = process.argv.find((value) => value.startsWith('--retrieved-at='))
  const retrievedAt = retrievedAtFlag
    ? retrievedAtFlag.slice('--retrieved-at='.length)
    : new Date().toISOString().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(retrievedAt)) {
    console.error(`[curated-gap] --retrieved-at must be YYYY-MM-DD, got "${retrievedAt}"`)
    process.exit(1)
  }

  const { names: index, identity } = await buildIndex(indexPath)
  const rows = loadMedicineRows()
  /*
   * The rows this script is for: those whose envelope is curated, which the tier field states and
   * absence means. `RECORDED_BACKGROUND` is the hand-authored corpus itself rather than the merged
   * one, which matters twice — it is exactly the set the database reports as curated tier, and it
   * does not contain this script's own output, so a second run over an unchanged archive produces
   * the same file rather than an empty one.
   */
  const curatedRows = rows.filter((row) => {
    const curated = RECORDED_BACKGROUND[row.slug]
    return curated !== undefined && (curated.provenanceTier ?? 'curated') === 'curated'
  })
  console.log(
    `[curated-gap] ${curatedRows.length} curated row(s) of ${rows.length} · ${index.size} indexed label names`,
  )

  const dataset: Record<string, MedicineRecordedBackground> = {}
  const stats = {
    curatedConsidered: 0,
    noLabelMatch: 0,
    nothingExtractable: 0,
    noGapToFill: 0,
    modulesDroppedByEngine: 0,
    rowsRefusedByEngine: 0,
    rowsGained: 0,
  }
  const moduleCounts = new Map<string, number>()
  let multiSubstanceSources = 0

  for (const row of curatedRows) {
    if (stats.rowsGained >= limit) break
    stats.curatedConsidered += 1
    const curated = RECORDED_BACKGROUND[row.slug]!

    const { label, background, modules } = extractRowBackground({
      row,
      index,
      identity,
      retrievedAt,
    })
    if (!label) {
      stats.noLabelMatch += 1
      continue
    }
    if (!background) {
      stats.nothingExtractable += 1
      continue
    }

    // Only the gap. A module the curator wrote is discarded here and never reaches the registry.
    let keep = new Set<ExtractableModule>(
      ATTACHABLE_MODULES.filter(
        (moduleName) =>
          modules.includes(moduleName) &&
          !holds(curated, moduleName) &&
          holds(background, moduleName),
      ),
    )
    if (keep.size === 0) {
      stats.noGapToFill += 1
      continue
    }

    /*
     * Validated as the registry value AND as the envelope the merge will build, because those are
     * two different records and either can fail. A module named by a finding is dropped and the
     * pair is checked again; a finding that names nothing droppable refuses the whole row, because
     * this script is not allowed to guess which part of a record it does not own is at fault.
     */
    let value = registryValue(background, keep)
    for (;;) {
      const findings = [
        ...runBackgroundIntelligence(value).findings,
        ...runBackgroundIntelligence(mergedEnvelope(curated, value, keep)).findings,
      ]
      if (findings.length === 0) break
      const offending = new Set(
        findings
          .map((finding) => finding.path.split('.')[0] as ExtractableModule)
          .filter((moduleName) => keep.has(moduleName)),
      )
      if (offending.size === 0) {
        console.error(
          `[curated-gap] refused ${row.slug}: ${findings
            .map((finding) => `${finding.code} at ${finding.path} — ${finding.message}`)
            .join(' · ')}`,
        )
        keep = new Set()
        break
      }
      for (const moduleName of offending) {
        console.error(
          `[curated-gap] dropped ${row.slug}.${moduleName}: ${findings
            .filter((finding) => finding.path.startsWith(moduleName))
            .map((finding) => finding.code)
            .join(', ')}`,
        )
        keep.delete(moduleName)
        stats.modulesDroppedByEngine += 1
      }
      if (keep.size === 0) break
      value = registryValue(background, keep)
    }
    if (keep.size === 0) {
      stats.rowsRefusedByEngine += 1
      continue
    }

    if (label.declaredSubstanceCount !== 1) multiSubstanceSources += 1
    dataset[row.slug] = value
    stats.rowsGained += 1
    for (const moduleName of keep)
      moduleCounts.set(moduleName, (moduleCounts.get(moduleName) ?? 0) + 1)
  }

  mkdirSync(join(process.cwd(), 'data', 'registries'), { recursive: true })
  // Key order is sorted so a rebuild of an unchanged archive produces an unchanged file and
  // `git diff` reports only what actually moved.
  const sorted: Record<string, MedicineRecordedBackground> = {}
  for (const slug of Object.keys(dataset).sort()) sorted[slug] = dataset[slug]!
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(sorted, null, 1)}\n`)

  console.log(`[curated-gap] ${JSON.stringify(stats)}`)
  console.log(
    `[curated-gap] modules gained: ${JSON.stringify(
      Object.fromEntries([...moduleCounts].sort((a, b) => b[1] - a[1])),
    )}`,
  )
  console.log(
    `[curated-gap] ${multiSubstanceSources} row(s) matched a multi-substance label and gained product-level context only`,
  )
  console.log(`[curated-gap] wrote ${stats.rowsGained} record(s) to ${OUTPUT_PATH}`)
}

const entryPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null
if (entryPath === import.meta.url) {
  void main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
