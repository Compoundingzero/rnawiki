import 'dotenv/config'
import { aggregateOpenFda } from './openfda'
import { resolveStructure, StructureCache } from './pubchem'

/**
 * Walks the corpus and resolves a chemical structure for every substance PubChem knows.
 *
 * Safe to interrupt: the cache flushes every 50 lookups and a restart skips everything already
 * answered, positively or negatively.
 *
 *   npm run ingest:structures -- --limit 2000
 */
async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  const limitIndex = argv.indexOf('--limit')
  const limit = limitIndex >= 0 ? Number.parseInt(argv[limitIndex + 1] ?? '0', 10) : 0

  const index = aggregateOpenFda()
  const cache = new StructureCache()

  // Most-listed substances first: an interrupted run should have resolved the drugs people
  // actually look up, not an alphabetical prefix.
  const substances = [...index.values()].sort((a, b) => b.productCount - a.productCount)
  const work = limit > 0 ? substances.slice(0, limit) : substances

  console.log(`[structures] ${work.length.toLocaleString()} substances to resolve`)
  console.log(`[structures] cache already holds ${cache.stats().total.toLocaleString()} answers`)

  let resolved = 0
  let missing = 0
  let skipped = 0

  for (const [i, substance] of work.entries()) {
    if (cache.has(substance.moiety)) {
      skipped += 1
      continue
    }

    const saltForms = [...substance.rawNames.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
    const brands = substance.brands.map((brand) => brand.name)

    const record = await resolveStructure(substance.moiety, { saltForms, brands, cache })
    if (record) resolved += 1
    else missing += 1

    if ((i + 1) % 100 === 0) {
      const rate = resolved + missing > 0 ? Math.round((resolved / (resolved + missing)) * 100) : 0
      console.log(
        `[structures] ${i + 1}/${work.length} · resolved ${resolved} · not in PubChem ${missing} · cached ${skipped} · hit rate ${rate}%`,
      )
      cache.flush()
    }
  }

  cache.flush()
  const stats = cache.stats()
  console.log(
    `\n[structures] done · resolved ${resolved} · not in PubChem ${missing} · already cached ${skipped}`,
  )
  console.log(
    `[structures] cache: ${stats.total.toLocaleString()} answers · ${stats.hits.toLocaleString()} with a structure · ${stats.negatives.toLocaleString()} negative`,
  )
  process.exit(0)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
