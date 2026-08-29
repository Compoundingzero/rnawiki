import 'dotenv/config'
import { createReadStream, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import { alternativeNames } from '@/lib/background/name-normalization'
import { RANKS_NAMING_ONE_ORGANISM } from '@/lib/background/types'
import type { MedicineRecordedBackground, RecordedBiologicalIdentity } from '@/lib/background/types'
import { RECORDED_BACKGROUND } from '../seed-data/background'

/**
 * Records what organism a medicine row is, from the NCBI Taxonomy dump.
 *
 * A large part of this corpus is not a molecule. It is a plant, a fungus, an insect, a bacterium or
 * an animal tissue — "Solenopsis Richteri", "Gliocladium Viride", "Curcuma Longa Leaf",
 * "Wuchereria Bancrofti", "Oryctolagus Cuniculus Uterus". PubChem has nothing for any of them,
 * correctly, because none of them is a compound; the supplement database has nothing for most of
 * them; and their labels carry no prose. The page could say nothing at all about what the thing is.
 *
 * A taxonomy answers exactly that and stops. It states the accepted scientific name, the rank, the
 * ranked lineage and the other names the organism is known by. Those are facts about biological
 * nomenclature. Nothing here says an organism treats anything, and the module carries no claim that
 * could be read that way.
 *
 * TWO GUARDS DO THE WORK.
 *
 * A name is matched only when it resolves to exactly ONE taxon. "Bean" names dozens of plants and is
 * refused; "Solenopsis richteri" names one and is recorded. This is the same rule that governs
 * substance identity, for the same reason: an ambiguous identity is not an identity.
 *
 * A trailing part word is separated before matching and recorded on its own. "Curcuma Longa Leaf" is
 * about the leaf of a plant whose taxon is "Curcuma longa", and recording the part separately is
 * what stops the record claiming the row and the organism are the same thing.
 *
 * Source: `https://ftp.ncbi.nlm.nih.gov/pub/taxonomy/new_taxdump/new_taxdump.tar.gz`, a public-domain
 * bulk file rebuilt daily. There is no API here and nothing to rate-limit. `images.dmp` carries its
 * own per-row licence and is not read.
 *
 * Usage:
 *   tsx scripts/background/build-biological-identity.ts <taxdumpDir>
 */

/**
 * Name classes worth indexing.
 *
 * "authority" is a citation ("Linnaeus, 1758") rather than a name. "includes" and "in-part" describe
 * a relationship to another taxon and would map a corpus row to the wrong organism. "acronym" and
 * "blast name" are database shorthand.
 */
const INDEXED_NAME_CLASSES = new Set([
  'scientific name',
  'genbank common name',
  'common name',
  'equivalent name',
  'synonym',
])

/** Name classes a reader would recognise as another name for the organism. */
const COMMON_NAME_CLASSES = new Set(['genbank common name', 'common name'])

/**
 * Words that name a part of an organism rather than the organism.
 *
 * A corpus row is frequently "<taxon> <part>": the leaf, the root, the whole plant, the pollen, an
 * animal organ. The part is stripped so the taxon can be matched, and recorded so the page says
 * which part the row is about.
 */
const PART_WORDS = [
  'flowering top',
  'aerial parts',
  'aerial part',
  'leafy twig',
  'flowering twig',
  'leaf bud',
  'whole',
  'root',
  'roots',
  'leaf',
  'leaves',
  'bark',
  'flower',
  'flowers',
  'fruit',
  'fruits',
  'seed',
  'seeds',
  'oil',
  'pollen',
  'twig',
  'bud',
  'stem',
  'stems',
  'rhizome',
  'bulb',
  'herb',
  'top',
  'tops',
  'resin',
  'gum',
  'sap',
  'tuber',
  'peel',
  'juice',
  'shoot',
  'berry',
  'wood',
  'branch',
  'nut',
  'kernel',
  'hull',
  'husk',
  'venom',
  'venom protein',
  'uterus',
  'duodenum',
  'trachea',
  'ureter',
  'liver',
  'kidney',
  'heart',
  'thymus',
  'spleen',
  'pancreas',
  'placenta',
  'cartilage',
  'collagen',
  'milk',
  'egg',
  'skin',
  'hair',
  'bone',
  'blood',
  'serum',
  'brain',
] as const

/**
 * Groups whose genus names do not read as ordinary English or as chemicals.
 *
 * A bare one-word corpus row matched to a genus is the collision class, and the collisions are not
 * spread evenly. Checked against the 245 such matches this corpus produces, every wrong one sat in
 * the animals or the protists: *Lithium* is a genus of moths, *Trachea* another, *Manna* and
 * *Galanga* are arthropods, *Palmyra* is a worm, *Castor* is the beaver, *Ammonia* is a
 * foraminiferan. Zoological nomenclature parked short Latin words that read in English as elements,
 * anatomy and plant products.
 *
 * The 223 matches inside plants and fungi were correct without exception, as were the bacterial and
 * algal genera. So a bare one-word row is admitted for those groups and refused for the rest.
 *
 * The cost is stated rather than hidden: six correct rows — cicada, cuttlefish, deer, gecko,
 * haliotis, molluscs — are refused along with the seven wrong ones. Those rows keep their archive
 * presence, and a page missing a lineage is a smaller failure than a page saying lithium is a moth.
 */
const GROUPS_WHOSE_GENUS_NAMES_ARE_UNAMBIGUOUS = [
  'Viridiplantae',
  'Fungi',
  'Bacteria',
  'Archaea',
  'Rhodophyta',
  'Phaeophyceae',
  'Chlorophyta',
  'Viruses',
]

/** Whether a bare one-word row may take this taxon's name. */
function bareNameMayTakeTaxon(lineage: readonly string[]): boolean {
  return lineage.some((level) => GROUPS_WHOSE_GENUS_NAMES_ARE_UNAMBIGUOUS.includes(level))
}

interface CompoundCacheEntry {
  state: string
}

/**
 * Names a compound database already resolved to a compound.
 *
 * The strongest available evidence that a row is a chemical rather than an organism, and it costs
 * nothing: the lookup was already done and cached when chemical identity was built.
 */
function chemicalNames(cachePath: string | undefined): Set<string> {
  const names = new Set<string>()
  if (!cachePath || !existsSync(cachePath)) return names
  const cache = JSON.parse(readFileSync(cachePath, 'utf8')) as Record<string, CompoundCacheEntry>
  for (const [name, entry] of Object.entries(cache)) {
    if (entry.state === 'RECORDED') names.add(normalizeTaxonName(name))
  }
  return names
}

/** Lowercased, punctuation collapsed. Matches how the taxonomy writes a name. */
function normalizeTaxonName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, ' ')
    .trim()
}

/** Splits a corpus name into the organism part and the anatomical part it may name. */
function splitPart(name: string): { organism: string; part?: string } {
  const normalized = normalizeTaxonName(name)
  for (const part of PART_WORDS) {
    const suffix = ` ${part}`
    if (normalized.endsWith(suffix) && normalized.length > suffix.length + 2) {
      return { organism: normalized.slice(0, -suffix.length).trim(), part }
    }
  }
  return { organism: normalized }
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

/** The dump's rows are `field\t|\t` separated with a trailing separator. */
function dumpFields(line: string): string[] {
  return line
    .replace(/\t\|\s*$/u, '')
    .split('\t|\t')
    .map((field) => field.trim())
}

async function main() {
  const dumpDir = process.argv[2]
  if (!dumpDir) {
    console.error('usage: tsx scripts/background/build-biological-identity.ts <taxdumpDir>')
    process.exit(1)
  }

  const compoundCache = process.argv
    .find((value) => value.startsWith('--compound-cache='))
    ?.slice('--compound-cache='.length)
  const chemical = chemicalNames(compoundCache)
  console.log(`[taxonomy] ${chemical.size} name(s) a compound database already resolved`)

  const rows = medicineRows()
  // Only the names some corpus row asks for are held. The taxonomy names three million organisms
  // and this corpus asks about a few thousand.
  const wanted = new Map<string, { slug: string; part?: string }[]>()
  for (const row of rows) {
    // Every name the title offers, not only the whole string. A title written
    // "Kratom (Mitragyna speciosa) and Mitragynine" carries the binomial in the bracket, and the
    // normalizations that strip parentheticals discard exactly the part a taxonomy can match.
    for (const candidate of alternativeNames(row.name)) {
      const { organism, part } = splitPart(candidate)
      if (organism.length < 4) continue
      const held = wanted.get(organism)
      const entry = { slug: row.slug, ...(part ? { part } : {}) }
      if (held) {
        if (!held.some((existing) => existing.slug === row.slug)) held.push(entry)
      } else wanted.set(organism, [entry])
    }
  }
  console.log(`[taxonomy] ${rows.length} medicine row(s) · ${wanted.size} organism name(s) sought`)

  // Pass one: every taxon each wanted name could mean, plus the common names of those taxa.
  const taxaForName = new Map<string, Set<string>>()
  const commonNames = new Map<string, Set<string>>()
  const scientificName = new Map<string, string>()
  const scientificNames = new Set<string>()
  let nameRows = 0
  const names = createInterface({
    input: createReadStream(join(dumpDir, 'names.dmp'), { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of names) {
    if (!line.trim()) continue
    nameRows += 1
    const [taxid, name, , nameClass] = dumpFields(line)
    if (!taxid || !name || !nameClass) continue
    if (nameClass === 'scientific name') scientificName.set(taxid, name)
    if (!INDEXED_NAME_CLASSES.has(nameClass)) continue
    const key = normalizeTaxonName(name)
    if (key.length < 4) continue
    if (wanted.has(key)) {
      const held = taxaForName.get(key)
      if (held) held.add(taxid)
      else taxaForName.set(key, new Set([taxid]))
      if (nameClass === 'scientific name') scientificNames.add(`${key} ${taxid}`)
    }
    if (COMMON_NAME_CLASSES.has(nameClass)) {
      const held = commonNames.get(taxid)
      if (held) held.add(name)
      else commonNames.set(taxid, new Set([name]))
    }
  }
  console.log(`[taxonomy] ${nameRows} name row(s) read`)

  // Pass two: the rank of each taxon that survived, from nodes.dmp.
  const resolved = new Map<string, string>()
  for (const [key, taxids] of taxaForName) {
    if (taxids.size === 1) resolved.set(key, [...taxids][0]!)
  }
  const neededTaxids = new Set(resolved.values())
  const rankByTaxid = new Map<string, string>()
  const nodes = createInterface({
    input: createReadStream(join(dumpDir, 'nodes.dmp'), { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of nodes) {
    if (!line.trim()) continue
    const [taxid, , rank] = dumpFields(line)
    if (taxid && rank && neededTaxids.has(taxid)) rankByTaxid.set(taxid, rank)
  }

  // Pass three: the ranked lineage, which is what places the organism for a reader.
  const lineageByTaxid = new Map<string, string[]>()
  const lineage = createInterface({
    input: createReadStream(join(dumpDir, 'rankedlineage.dmp'), { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of lineage) {
    if (!line.trim()) continue
    const fields = dumpFields(line)
    const taxid = fields[0]
    if (!taxid || !neededTaxids.has(taxid)) continue
    // Columns after the name run species, genus, family, order, class, phylum, kingdom, domain.
    // Reversed so a reader meets the broadest level first, and blanks dropped: the taxonomy leaves
    // a rank empty when it does not assign one, and an empty string is not a level.
    const ranked = fields.slice(2, 10).filter((value) => value.length > 0)
    lineageByTaxid.set(taxid, ranked.reverse())
  }

  const retrievedAt = new Date().toISOString().slice(0, 10)
  const dataset: Record<string, MedicineRecordedBackground> = {}
  const stats = {
    rows: rows.length,
    namesSought: wanted.size,
    namesWithNoTaxon: 0,
    namesAmbiguous: 0,
    namesResolved: 0,
    noLineage: 0,
    weakMatchRefusedAsChemical: 0,
    bareNameRefusedOutsidePlantsAndMicrobes: 0,
    engineRejected: 0,
    written: 0,
  }
  for (const taxids of taxaForName.values()) {
    if (taxids.size > 1) stats.namesAmbiguous += 1
  }
  stats.namesWithNoTaxon = wanted.size - taxaForName.size
  stats.namesResolved = resolved.size

  for (const [key, entries] of wanted) {
    const taxid = resolved.get(key)
    if (!taxid) continue
    const lineageAsRecorded = lineageByTaxid.get(taxid) ?? []
    if (lineageAsRecorded.length === 0) {
      stats.noLineage += 1
      continue
    }
    const accepted = scientificName.get(taxid)
    const rank = rankByTaxid.get(taxid)
    if (!accepted || !rank) continue

    for (const entry of entries) {
      // A name that identifies a group rather than one organism is admitted only where nothing else
      // says this row is a chemical. Both signals are direct: a compound database that resolved the
      // same name, or a person having filed the row as a medicine.
      if (!RANKS_NAMING_ONE_ORGANISM.has(rank)) {
        if (chemical.has(key) || RECORDED_BACKGROUND[entry.slug]) {
          stats.weakMatchRefusedAsChemical += 1
          continue
        }
        // A row naming a part, or naming more than one word, carries its own evidence of being an
        // organism. A bare single word does not, and is admitted only for the groups whose genus
        // names are not also ordinary English.
        const bareSingleWord = !entry.part && !key.includes(' ')
        if (bareSingleWord && !bareNameMayTakeTaxon(lineageAsRecorded)) {
          stats.bareNameRefusedOutsidePlantsAndMicrobes += 1
          continue
        }
      }
      const identity: RecordedBiologicalIdentity = {
        scientificName: accepted,
        rankAsRecorded: rank,
        lineageAsRecorded,
        commonNamesAsRecorded: [...(commonNames.get(taxid) ?? [])].sort().slice(0, 8),
        ...(entry.part ? { partAsRecorded: entry.part } : {}),
        matchedOn: scientificNames.has(`${key} ${taxid}`) ? 'SCIENTIFIC_NAME' : 'COMMON_NAME',
        source: {
          kind: 'NCBI_TAXONOMY',
          identifier: taxid,
          label: `NCBI Taxonomy record for ${accepted}`,
          retrievedAt,
        },
      }
      const background: MedicineRecordedBackground = {
        version: 'medicine-background/v1',
        authoredAt: retrievedAt,
        provenanceTier: 'transcribed',
        biologicalIdentity: identity,
      }
      const report = runBackgroundIntelligence(background)
      if (!report.passed) {
        stats.engineRejected += 1
        if (stats.engineRejected <= 3) {
          console.error(
            `[taxonomy] rejected ${entry.slug}: ${report.findings.map((finding) => `${finding.code} at ${finding.path}`).join(', ')}`,
          )
        }
        continue
      }
      dataset[entry.slug] = background
      stats.written += 1
    }
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'biological-identity.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[taxonomy] ${JSON.stringify(stats)}`)
  console.log(`[taxonomy] wrote ${stats.written} record(s) to ${outPath}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
