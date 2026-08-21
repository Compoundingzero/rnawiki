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
import { mergeProvenance, SOURCE_LABELS, trimToSentence } from './provenance'
import {
  botanicalCacheStats,
  flushBotanicalCache,
  looksBinomial,
  lookupBotanical,
  lookupLiterature,
  splitPlantName,
  warmCache,
} from './botanicals'
import { type SubstanceRecord, substanceContext } from './substance-context'
import { biologicStem, isKnownBiologicStem, suffixedBiologicContext } from './suffixed-biologics'
import { botanicalContext } from './botanical-context'

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
  skipBotanicals: boolean
  only: string | null
  /**
   * Re-derive machine-written fields even where a value is already stored.
   *
   * Off by default, because the normal rule is that this pipeline fills gaps and never overwrites.
   * It exists for the case where the DERIVATION changed rather than the source — a cleaner that
   * strips a section heading the SPL author retyped, a sentence that told supplements they had an
   * FDA record — and the stored value is then stale in a way no gap-filling run will ever reach.
   * It skips any record a person has edited.
   */
  refreshDerived: boolean
}

function parseArgs(argv: readonly string[]): Options {
  const limitIndex = argv.indexOf('--limit')
  const onlyIndex = argv.indexOf('--only')
  return {
    dryRun: argv.includes('--dry-run'),
    skipTrials: argv.includes('--skip-trials'),
    skipBotanicals: argv.includes('--skip-botanicals'),
    refreshDerived: argv.includes('--refresh-derived') || argv.includes('--refresh-labels'),
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

/** Map keys ordered by how many products carried them, most common first. */
function rankedKeys(counts: Map<string, number>): string[] {
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([key]) => key)
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
      indication: drugs.indication,
      modality: drugs.modality,
      depth: drugs.dossierDepth,
      approvalStatus: drugs.approvalStatus,
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
    botanical: 0,
    reclassified: 0,
    substance: 0,
    suffixed: 0,
    price: 0,
    trials: 0,
    verified: 0,
    promoted: 0,
    untouched: 0,
  }

  // Records a person has edited are never re-derived, whatever the flags say. A revision is the
  // one thing on this site that no pipeline can reproduce.
  const editedByAPerson = new Set<string>()
  if (options.refreshDerived) {
    const edited = await db.execute(sql`SELECT DISTINCT drug_id FROM revisions`)
    for (const row of edited.rows as Array<{ drug_id: string }>) editedByAPerson.add(row.drug_id)
    console.log(`[enrich] ${editedByAPerson.size} records have edits and will not be re-derived`)
  }

  // Every network lookup the loop below would make, made first and in parallel. The loop then
  // reads the cache; see warmCache.
  if (!options.skipBotanicals) {
    type WarmJob = { name: string; kind: 'organism' | 'literature' }
    const jobs = work.flatMap<WarmJob>((row) => {
      if (looksBinomial(splitPlantName(row.name).binomial)) {
        return [{ name: row.name, kind: 'organism' }]
      }
      // Only the records that will reach the substance pass. A row that already has a mechanism or
      // a context is not going to ask for its publication count, and there are five thousand of
      // them.
      if (!row.conditionContext && !row.laymanHowItWorks) {
        return [{ name: row.name, kind: 'literature' }]
      }
      return []
    })
    console.log(
      `[enrich] warming taxonomy and literature for ${jobs.length.toLocaleString()} names…`,
    )
    await warmCache(jobs, (done, total) => {
      console.log(`[enrich]   ${done.toLocaleString()}/${total.toLocaleString()} looked up`)
    })
  }

  for (const [index, row] of work.entries()) {
    // The ingest keys everything on the moiety; recover it from the display name.
    const moiety = row.name.toUpperCase()
    const substance = openFda.get(moiety)

    const patch: Record<string, unknown> = {}
    let provenance = row.sourceProvenance ?? []
    const refreshable = options.refreshDerived && !editedByAPerson.has(row.id)

    // --- Label text -------------------------------------------------------
    const fromLabel = enrichFromLabel(moiety, {
      routes: substance ? [...substance.routes.keys()] : [],
      dosageForms: substance ? [...substance.dosageForms.keys()] : [],
    })
    if (fromLabel) {
      const refresh = refreshable
      if (fromLabel.laymanHowItWorks && (refresh || !row.laymanHowItWorks)) {
        patch.laymanHowItWorks = fromLabel.laymanHowItWorks
        counts.mechanism += 1
      }
      if (fromLabel.conditionContext && (refresh || !row.conditionContext)) {
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

    // --- Plants and homeopathic listings -----------------------------------
    //
    // Everything above comes back empty for these: no application, no mechanism section, no price
    // survey. What does exist is which species it is and what the literature actually contains,
    // and for a reader deciding whether to believe a supplement label those are the two facts that
    // matter most.
    //
    // The gate is the NAME, not the stored modality. Gating on modality assumed the classifier had
    // already recognised these, and it had not: "Acacia Longifolia Pollen" and "Melopsittacus
    // Undulatus Feather" were filed as Recombinant Protein / Biologic and "Betula Alba Juice" as
    // Small Molecule, so the one pass that could have said anything about them never ran. A name
    // shaped like a binomial is asked about regardless of how it was classified; GBIF returns
    // matchType NONE for every chemical name tested against it, so a wrong guess costs a lookup
    // rather than a wrong page.
    if (!options.skipBotanicals && looksBinomial(splitPlantName(row.name).binomial)) {
      const facts = await lookupBotanical(row.name)
      // The label purpose keeps its place under "who takes this", where it reads as the claim it
      // is. It does NOT stay in the explainer: on a homeopathic listing that slot was carrying
      // "may help temporarily relieve allergy symptoms", which on a reference page reads as the
      // site saying so. What belongs there is which species this is and what the literature
      // actually contains.
      const existing = (patch.conditionContext ?? row.conditionContext) as {
        whoTakesThis?: string
      } | null
      const purpose = trimToSentence(existing?.whoTakesThis || row.indication || '', 300)
      const context = botanicalContext(facts, row.name, purpose)
      if (context) {
        patch.conditionContext = context.conditionContext
        provenance = mergeProvenance(provenance, context.sources)
        counts.botanical += 1
      }
      // A resolved species IS the classification. When GBIF returns a species-rank match for a
      // record the classifier filed as a chemical or a biologic, the classifier was wrong and the
      // taxonomy is the better evidence.
      const rank = facts.taxonomy?.rank
      if (
        facts.taxonomy &&
        (rank === 'SPECIES' || rank === 'SUBSPECIES' || rank === 'VARIETY') &&
        row.modality !== 'Nutraceutical / Botanical'
      ) {
        patch.modality = 'Nutraceutical / Botanical'
        counts.reclassified += 1
      }
    }

    // --- Suffixed biologics -------------------------------------------------
    const stem = biologicStem(row.name)
    if (stem && !row.conditionContext && !patch.conditionContext) {
      const parentRows = await db
        .select({ name: drugs.name, slug: drugs.slug, indication: drugs.patientFriendlyIndication })
        .from(drugs)
        .where(sql`lower(${drugs.name}) = ${stem}`)
        .limit(1)
      const parent = parentRows[0] ?? null
      // Either the molecule is on this site, or its name ends in an INN stem the scheme is applied
      // to. Without one of the two, a hyphenated four-letter ending is just a hyphenated name, and
      // describing it as a version of a molecule that does not exist is worse than leaving it empty.
      if (parent || isKnownBiologicStem(stem)) {
        const context = suffixedBiologicContext(row.name, stem, parent)
        patch.conditionContext = context.conditionContext
        provenance = mergeProvenance(provenance, context.sources)
        counts.suffixed += 1
      }
    }

    // --- Everything else ---------------------------------------------------
    //
    // Whatever is left after the label, the taxonomy and the biosimilar passes. These have no
    // label section, no species and no parent molecule, and they were being published as a name
    // and a modality. What is still true about them is what the FDA's product records say and how
    // much has been published — including, often, that almost nothing has.
    if (
      !options.skipBotanicals &&
      !patch.conditionContext &&
      !patch.laymanHowItWorks &&
      (refreshable || (!row.conditionContext && !row.laymanHowItWorks))
    ) {
      const literature = await lookupLiterature(row.name)
      const record: SubstanceRecord | null = substance
        ? {
            routes: rankedKeys(substance.routes),
            dosageForms: rankedKeys(substance.dosageForms),
            marketingStatuses: Object.keys(substance.marketingStatuses),
            productCount: substance.productCount,
            firstApprovalYear: substance.firstApprovalYear,
          }
        : null
      const context = substanceContext(
        row.name,
        literature,
        record,
        row.approvalStatus === 'Non-FDA / Dietary Supplement',
      )
      if (context) {
        patch.conditionContext = context.conditionContext
        provenance = mergeProvenance(provenance, context.sources)
        counts.substance += 1
      }
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
      if (
        row.depth === 'stub' &&
        (patch.laymanHowItWorks || patch.pricing || patch.trials || patch.conditionContext)
      ) {
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
      flushBotanicalCache()
      console.log(
        `[enrich] ${index + 1}/${work.length} · mechanism ${counts.mechanism} · price ${counts.price} · trials ${counts.trials} · verified ${counts.verified}`,
      )
    }
  }

  flushTrialCache()
  flushBotanicalCache()
  const trialStats = trialCacheStats()
  const botanicalStats = botanicalCacheStats()

  console.log('\n[enrich] done')
  console.log(`   mechanism text added   ${counts.mechanism.toLocaleString()}`)
  console.log(`   condition context      ${counts.context.toLocaleString()}`)
  console.log(`   target identified      ${counts.target.toLocaleString()}`)
  console.log(`   how it is given        ${counts.delivery.toLocaleString()}`)
  console.log(`   species + literature   ${counts.botanical.toLocaleString()}`)
  console.log(`   reclassified as plant  ${counts.reclassified.toLocaleString()}`)
  console.log(`   record + literature    ${counts.substance.toLocaleString()}`)
  console.log(`   suffixed biologics     ${counts.suffixed.toLocaleString()}`)
  console.log(`   published price        ${counts.price.toLocaleString()}`)
  console.log(`   real trials attached   ${counts.trials.toLocaleString()}`)
  console.log(`   structures verified    ${counts.verified.toLocaleString()}`)
  console.log(`   promoted from stub     ${counts.promoted.toLocaleString()}`)
  console.log(`   nothing to add         ${counts.untouched.toLocaleString()}`)
  console.log(
    `   trial lookups cached   ${trialStats.total.toLocaleString()} (${trialStats.withTrials.toLocaleString()} had trials)`,
  )
  console.log(
    `   plants resolved        ${botanicalStats.resolved.toLocaleString()}/${botanicalStats.total.toLocaleString()} (${botanicalStats.withPapers.toLocaleString()} had papers)`,
  )
  process.exit(0)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
