import 'dotenv/config'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { drugs } from '@/db/schema'
import { runFullDeterministicSweep } from '@/lib/rna-intelligence'
import type { MolecularSchema, PricingTransparency } from '@/lib/types'
import { aggregateOpenFda } from '../ingest/openfda'
import { enrichFromLabel } from './from-labels'
import { formatNadacPrice, loadNadac, nadacNote, type NadacPrice } from './nadac'
import { fetchTrials, flushTrialCache, trialCacheStats } from './trials'
import { mergeProvenance, SOURCE_LABELS } from './provenance'

/**
 * Fills every field on every record that has a real public source behind it.
 *
 *   npm run enrich                    everything
 *   npm run enrich -- --limit 500     a sample
 *   npm run enrich -- --skip-trials   no network calls to ClinicalTrials.gov
 *   npm run enrich -- --dry-run       report what would change, write nothing
 *
 * It never touches a record a person wrote. `dossierDepth = 'flagship'` is the mark of hand
 * research and this pipeline stops at it — an enrichment that overwrote a researched mechanism with
 * a quoted label paragraph would be a straight downgrade, and there would be nothing to restore it
 * from.
 */

interface Options {
  dryRun: boolean
  limit: number | null
  skipTrials: boolean
  only: string | null
}

function parseArgs(argv: readonly string[]): Options {
  const limitIndex = argv.indexOf('--limit')
  const onlyIndex = argv.indexOf('--only')
  return {
    dryRun: argv.includes('--dry-run'),
    skipTrials: argv.includes('--skip-trials'),
    limit: limitIndex >= 0 ? Number.parseInt(argv[limitIndex + 1] ?? '0', 10) || null : null,
    only: onlyIndex >= 0 ? (argv[onlyIndex + 1] ?? null) : null,
  }
}

/**
 * Normalises an NDC product code to the 5-4 form both sides can be compared in.
 *
 * NADAC publishes an 11-digit code in 5-4-2 segments with no punctuation. openFDA publishes
 * "76354-523", where the segments are 5-3 and are NOT zero-padded. Stripping punctuation from both
 * and comparing the first nine digits therefore compares "763540" against "76354523" — it fails
 * for every labeler whose code is not already 5-4, which is most of them, and it fails silently as
 * a suspiciously low match rate rather than as an error.
 */
function normaliseProductNdc(raw: string): string {
  const parts = raw.split('-')
  if (parts.length >= 2) {
    const labeler = (parts[0] ?? '').padStart(5, '0')
    const product = (parts[1] ?? '').padStart(4, '0')
    return `${labeler}${product}`
  }
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 9 ? digits.slice(0, 9).padStart(9, '0') : digits
}

/** The first nine digits of an 11-digit package NDC are its 5-4 product code. */
function productCodeFromPackageNdc(ndc11: string): string {
  const digits = ndc11.replace(/\D/g, '').padStart(11, '0')
  return digits.slice(0, 9)
}

function medianPrice(prices: readonly NadacPrice[]): NadacPrice | null {
  if (prices.length === 0) return null
  const sorted = [...prices].sort((a, b) => a.perUnit - b.perUnit)
  return sorted[Math.floor(sorted.length / 2)] ?? null
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  console.log('[enrich] options:', options)

  console.log('[enrich] reading source records…')
  const openFda = aggregateOpenFda()

  // NDC prefix -> moiety, so a NADAC row can find the drug it belongs to without name matching.
  const ndcToMoiety = new Map<string, string>()
  for (const [moiety, substance] of openFda) {
    for (const code of substance.ndcProductCodes ?? []) {
      ndcToMoiety.set(normaliseProductNdc(code), moiety)
    }
  }
  console.log(`[enrich] ${ndcToMoiety.size.toLocaleString()} NDC codes mapped to substances`)

  const nadac = await loadNadac()
  const pricesByMoiety = new Map<string, NadacPrice[]>()
  for (const price of nadac.values()) {
    const moiety = ndcToMoiety.get(productCodeFromPackageNdc(price.ndc))
    if (!moiety) continue
    const list = pricesByMoiety.get(moiety) ?? []
    list.push(price)
    pricesByMoiety.set(moiety, list)
  }
  console.log(`[enrich] ${pricesByMoiety.size.toLocaleString()} substances have a published price`)

  // Only records nobody has researched. Ordered so the most-listed drugs are enriched first: an
  // interrupted run should have covered the pages people actually open.
  const rows = await db
    .select({
      id: drugs.id,
      slug: drugs.slug,
      name: drugs.name,
      modality: drugs.modality,
      depth: drugs.dossierDepth,
      targetGene: drugs.targetGene,
      laymanHowItWorks: drugs.laymanHowItWorks,
      conditionContext: drugs.conditionContext,
      pricing: drugs.pricing,
      trials: drugs.trials,
      molecularSchema: drugs.molecularSchema,
      deliverySystem: drugs.deliverySystem,
      sourceProvenance: drugs.sourceProvenance,
      viewCount: drugs.viewCount,
    })
    .from(drugs)
    .where(sql`${drugs.dossierDepth} <> 'flagship'`)
    // Order by how much there is to say, not alphabetically. Nothing has view counts yet, so an
    // alphabetical run spends its first thousand records on chemical-catalogue entries beginning
    // with a digit. A drug with label text and a brand name is one somebody actually takes.
    .orderBy(
      sql`(case when ${drugs.indication} <> '' then 0 else 1 end)`,
      sql`(case when ${drugs.tradeName} is not null then 0 else 1 end)`,
      sql`(case when ${drugs.approvalStatus} = 'FDA Approved' then 0 else 1 end)`,
      sql`${drugs.viewCount} desc`,
      drugs.name,
    )

  const work = options.only
    ? rows.filter((row) => row.slug.includes(options.only ?? ''))
    : options.limit
      ? rows.slice(0, options.limit)
      : rows

  console.log(`[enrich] ${work.length.toLocaleString()} records to enrich\n`)

  const counts = {
    mechanism: 0,
    context: 0,
    target: 0,
    delivery: 0,
    price: 0,
    trials: 0,
    verified: 0,
    promoted: 0,
    untouched: 0,
  }

  for (const [index, row] of work.entries()) {
    // The ingest keys everything on the moiety; recover it from the display name.
    const moiety = row.name.toUpperCase()
    const substance = openFda.get(moiety)

    const patch: Record<string, unknown> = {}
    let provenance = row.sourceProvenance ?? []

    // --- Label text -------------------------------------------------------
    const fromLabel = enrichFromLabel(moiety, {
      routes: substance ? [...substance.routes.keys()] : [],
      dosageForms: substance ? [...substance.dosageForms.keys()] : [],
    })
    if (fromLabel) {
      if (fromLabel.laymanHowItWorks && !row.laymanHowItWorks) {
        patch.laymanHowItWorks = fromLabel.laymanHowItWorks
        counts.mechanism += 1
      }
      if (fromLabel.conditionContext && !row.conditionContext) {
        patch.conditionContext = fromLabel.conditionContext
        counts.context += 1
      }
      if (fromLabel.targetGene && !row.targetGene) {
        patch.targetGene = fromLabel.targetGene
        counts.target += 1
      }
      if (fromLabel.deliverySystem && !row.deliverySystem) {
        patch.deliverySystem = fromLabel.deliverySystem
        counts.delivery += 1
      }
      provenance = mergeProvenance(provenance, fromLabel.sources)
    }

    // --- Price ------------------------------------------------------------
    const prices = pricesByMoiety.get(moiety)
    if (prices && prices.length > 0 && !row.pricing) {
      const median = medianPrice(prices)
      if (median) {
        const pricing: PricingTransparency = {
          // What it costs to MAKE is a different figure and a researched one. This is what a
          // pharmacy pays to buy it, which is the only price anyone publishes.
          synthesisCostPerDose: '',
          retailPricePerDoseOrYear: formatNadacPrice(median),
          markupEstimate: '',
          openPatentNotes: nadacNote(median, prices.length),
          synthesisComplexity: 'Moderate',
        }
        patch.pricing = pricing
        provenance = mergeProvenance(provenance, [SOURCE_LABELS.nadac])
        counts.price += 1
      }
    }

    // --- Trials -----------------------------------------------------------
    if (!options.skipTrials && (row.trials as unknown[]).length === 0) {
      const trials = await fetchTrials(row.name)
      if (trials.length > 0) {
        patch.trials = trials
        provenance = mergeProvenance(provenance, [SOURCE_LABELS.clinicalTrials])
        counts.trials += 1
      }
    }

    // --- Run the engine over whatever structure the record holds ----------
    const schema = row.molecularSchema as MolecularSchema | null
    const structure = schema?.smilesString ?? schema?.sequence5to3
    if (structure && !schema?.isMachineVerified) {
      const report = runFullDeterministicSweep({
        structureString: structure,
        modality: row.modality,
        workflow: schema?.laboratoryWorkflow ?? [],
        structureType: schema?.structureType,
      })
      if (report.overallPassed) {
        patch.molecularSchema = {
          ...schema,
          chemicalFormula: report.layer1.chemicalFormula ?? schema?.chemicalFormula,
          gcContentPercent: report.layer1.gcContentPercent,
          readingFrameValid: report.layer1.isMultipleOfThree,
          startCodonFound: report.layer1.hasStartCodon,
          stopCodonFound: report.layer1.hasStopCodon,
          mfeDeltaG: report.layer2.mfeDeltaG,
          complementaryStrand: report.layer2.complementaryStrand,
          logP: report.layer2.logP,
          isMachineVerified: true,
          verificationHash: report.verificationHash,
          lastVerifiedTimestamp: report.timestamp,
          laboratoryWorkflow: schema?.laboratoryWorkflow ?? [],
        } satisfies MolecularSchema
        patch.isMachineVerifiedStructure = true
        patch.verificationHash = report.verificationHash
        patch.lastVerifiedAt = new Date()
        provenance = mergeProvenance(provenance, [SOURCE_LABELS.engine])
        counts.verified += 1
      }
    }

    if (Object.keys(patch).length === 0) {
      counts.untouched += 1
    } else {
      // A record with a sourced mechanism and a real price is no longer a stub. It is not a
      // researched dossier either, and `curated` is the level that says so.
      if (row.depth === 'stub' && (patch.laymanHowItWorks || patch.pricing || patch.trials)) {
        patch.dossierDepth = 'curated'
        counts.promoted += 1
      }
      patch.sourceProvenance = provenance
      patch.updatedAt = new Date()

      if (!options.dryRun) {
        await db.update(drugs).set(patch).where(eq(drugs.id, row.id))
      }
    }

    if ((index + 1) % 250 === 0) {
      flushTrialCache()
      console.log(
        `[enrich] ${index + 1}/${work.length} · mechanism ${counts.mechanism} · price ${counts.price} · trials ${counts.trials} · verified ${counts.verified}`,
      )
    }
  }

  flushTrialCache()
  const trialStats = trialCacheStats()

  console.log('\n[enrich] done')
  console.log(`   mechanism text added   ${counts.mechanism.toLocaleString()}`)
  console.log(`   condition context      ${counts.context.toLocaleString()}`)
  console.log(`   target identified      ${counts.target.toLocaleString()}`)
  console.log(`   how it is given        ${counts.delivery.toLocaleString()}`)
  console.log(`   published price        ${counts.price.toLocaleString()}`)
  console.log(`   real trials attached   ${counts.trials.toLocaleString()}`)
  console.log(`   structures verified    ${counts.verified.toLocaleString()}`)
  console.log(`   promoted from stub     ${counts.promoted.toLocaleString()}`)
  console.log(`   nothing to add         ${counts.untouched.toLocaleString()}`)
  console.log(
    `   trial lookups cached   ${trialStats.total.toLocaleString()} (${trialStats.withTrials.toLocaleString()} had trials)`,
  )
  process.exit(0)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
