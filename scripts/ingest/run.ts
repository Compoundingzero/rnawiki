import 'dotenv/config'
import { readFileSync, existsSync } from 'node:fs'
import { aggregateOpenFda, summariseAggregate, type AggregatedSubstance } from './openfda'
import { loadSupplementIngredients, SUPPLEMENT_DRUG_ALIASES, type SupplementIngredient } from './dsld'
import { assignUniqueSlugs, buildDossierRow, shouldIngest, type DrugInsert, type IngestStructure } from './build-dossier'
import { baseMoiety } from './normalise'
import { loadDrugs } from './load'
import { CACHE_FILES } from './paths'

/**
 * The ingest CLI.
 *
 *   npm run ingest -- --dry-run           report what would be written, touch nothing
 *   npm run ingest -- --limit 500         sample the first N substances
 *   npm run ingest -- --only metformin    one substance, for debugging a classification
 *   npm run ingest -- --skip-structures   ignore the PubChem cache
 */

interface Options {
  dryRun: boolean
  limit: number | null
  only: string | null
  skipStructures: boolean
  refreshSupplements: boolean
}

function parseArgs(argv: readonly string[]): Options {
  const options: Options = {
    dryRun: argv.includes('--dry-run'),
    limit: null,
    only: null,
    skipStructures: argv.includes('--skip-structures'),
    refreshSupplements: argv.includes('--refresh-supplements'),
  }
  const limitIndex = argv.indexOf('--limit')
  if (limitIndex >= 0) {
    const raw = argv[limitIndex + 1]
    if (raw) options.limit = Number.parseInt(raw, 10)
  }
  const onlyIndex = argv.indexOf('--only')
  if (onlyIndex >= 0) options.only = argv[onlyIndex + 1] ?? null
  return options
}

function loadStructures(skip: boolean): Map<string, IngestStructure> {
  const structures = new Map<string, IngestStructure>()
  if (skip || !existsSync(CACHE_FILES.structureIndex)) return structures

  const raw = JSON.parse(readFileSync(CACHE_FILES.structureIndex, 'utf8')) as Record<
    string,
    { smiles?: string; formula?: string; molecularWeight?: number; iupacName?: string; xlogp?: number } | null
  >
  for (const [moiety, value] of Object.entries(raw)) {
    if (!value?.smiles) continue
    structures.set(moiety, { ...value, source: 'PubChem PUG-REST' })
  }
  console.log(`[run] loaded ${structures.size.toLocaleString()} cached structures`)
  return structures
}

/**
 * Merge the supplement list into the drug map. A substance in both sources is ONE dossier carrying
 * both provenances — melatonin, magnesium and niacin are all simultaneously an FDA-listed product
 * and a supplement ingredient, and two pages for one molecule would be the worst kind of duplicate.
 */
function mergeSupplements(
  index: Map<string, AggregatedSubstance>,
  supplements: Map<string, SupplementIngredient>,
): Map<string, SupplementIngredient> {
  const attached = new Map<string, SupplementIngredient>()
  const aliasToMoiety = new Map(SUPPLEMENT_DRUG_ALIASES.map(([supplement, moiety]) => [supplement, moiety]))

  // DSLD writes "Alpha Lipoic Acid"; openFDA writes "ALPHA-LIPOIC ACID". Exact-key matching gave
  // each of them its own page, and the slug resolver then papered over the duplicate by appending
  // "-2". Comparing on a punctuation-free key merges them into the one dossier they should be.
  const loose = (value: string): string => value.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  const looseIndex = new Map<string, string>()
  for (const moiety of index.keys()) {
    const key = loose(moiety)
    // Prefer the shortest spelling as the canonical one; it is nearly always the plain name.
    const existing = looseIndex.get(key)
    if (!existing || moiety.length < existing.length) looseIndex.set(key, moiety)
  }

  for (const [group, supplement] of supplements) {
    const aliased = aliasToMoiety.get(group)
    const candidate = aliased ?? looseIndex.get(loose(group)) ?? baseMoiety(group)

    const existing = index.get(candidate)
    if (existing) {
      existing.sources.add('NIH Dietary Supplement Label Database')
      attached.set(candidate, supplement)
      continue
    }

    // Not in the FDA data at all — a supplement-only substance. Create a bare entry so it becomes
    // a dossier with an honest, supplement-only provenance.
    index.set(candidate, {
      moiety: candidate,
      rawNames: new Map([[group.toUpperCase(), supplement.labelCount]]),
      brands: supplement.brands.map(([name, count]) => ({ name, singleIngredient: false, count })),
      sponsors: [],
      routes: new Map(),
      dosageForms: new Map(),
      firstApprovalYear: null,
      applicationKinds: {},
      marketingStatuses: {},
      marketingCategories: {},
      unii: new Set(),
      productCount: 0,
      sources: new Set(['NIH Dietary Supplement Label Database']),
    })
    looseIndex.set(loose(candidate), candidate)
    attached.set(candidate, supplement)
  }

  return attached
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  console.log('[run] options:', options)

  console.log('[run] reading openFDA corpora…')
  const index = aggregateOpenFda()
  console.log(`[run] ${summariseAggregate(index)}`)

  console.log('[run] loading supplement ingredients…')
  const supplements = await loadSupplementIngredients({ force: options.refreshSupplements })
  const supplementByMoiety = mergeSupplements(index, supplements)
  console.log(`[run] corpus after supplement merge: ${index.size.toLocaleString()} substances`)

  const structures = loadStructures(options.skipStructures)

  const rows: DrugInsert[] = []
  const skips = new Map<string, number>()

  for (const substance of index.values()) {
    if (options.only && !substance.moiety.toLowerCase().includes(options.only.toLowerCase())) continue

    const input = {
      substance,
      supplement: supplementByMoiety.get(substance.moiety),
      structure: structures.get(substance.moiety),
    }

    const decision = shouldIngest(input)
    if (!decision.keep) {
      skips.set(decision.reason, (skips.get(decision.reason) ?? 0) + 1)
      continue
    }

    rows.push(buildDossierRow(input))
    if (options.limit && rows.length >= options.limit) break
  }

  // Most-listed substances first, so the slug collision resolver gives the plain slug to the
  // better-known drug: "vitamin-d" should be the one on 5,000 labels, not the one on two.
  rows.sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name))
  assignUniqueSlugs(rows)

  console.log(`\n[run] built ${rows.length.toLocaleString()} dossiers`)
  console.log('[run] skipped:')
  for (const [reason, count] of [...skips.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`   ${String(count).padStart(6)}  ${reason}`)
  }

  const byModality = new Map<string, number>()
  const byApproval = new Map<string, number>()
  let withStructure = 0
  let withIndication = 0
  for (const row of rows) {
    byModality.set(row.modality, (byModality.get(row.modality) ?? 0) + 1)
    byApproval.set(row.approvalStatus, (byApproval.get(row.approvalStatus) ?? 0) + 1)
    if (row.molecularSchema?.smilesString) withStructure += 1
    if (row.indication) withIndication += 1
  }

  console.log('\n[run] modality breakdown:')
  for (const [modality, count] of [...byModality.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`   ${String(count).padStart(6)}  ${modality}`)
  }
  console.log('[run] approval status breakdown:')
  for (const [status, count] of [...byApproval.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`   ${String(count).padStart(6)}  ${status}`)
  }
  console.log(
    `[run] with a structure: ${withStructure.toLocaleString()} · with label indication text: ${withIndication.toLocaleString()}`,
  )

  if (options.dryRun) {
    console.log('\n[run] sample of what would be written:')
    for (const row of rows.slice(0, 10)) {
      console.log(
        `   ${row.slug.padEnd(28)} ${row.modality.padEnd(34)} ${row.approvalStatus.padEnd(30)} ${row.sponsor || '(no sponsor)'}`,
      )
    }
  }

  await loadDrugs(rows, { dryRun: options.dryRun, note: `limit=${options.limit ?? 'none'}` })
  process.exit(0)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
