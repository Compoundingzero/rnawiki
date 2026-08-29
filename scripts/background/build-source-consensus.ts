import 'dotenv/config'
import { printedSpan } from '@/lib/background/printed-numbers'
import { execFileSync } from 'node:child_process'
import { createReadStream, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import { extractPharmacokinetics, type LabelArtifact } from '@/lib/background/label-extraction'
import { normalizeContentName as normalizeName } from '@/lib/background/name-normalization'
import type {
  BackgroundSource,
  ConsensusReading,
  RecordedFieldConsensus,
  RecordedSourceConsensus,
} from '@/lib/background/types'

/**
 * Builds the cross-source consensus dataset.
 *
 * The extraction pipeline picks one label per medicine — the one carrying the most extractable
 * sections — and discards the rest. That throws away the corpus's strongest available signal.
 * Gabapentin is covered by more than four hundred published labels, metoprolol by over three
 * hundred, because every manufacturer publishes its own; and there are roughly 48,000 such extra
 * documents across the corpus. Whether seventeen labels agree on a half-life, or two of them state
 * something different, is a fact no other public drug resource reports and one that only exists if
 * every document is read rather than the best one.
 *
 * What this does NOT do, and the reason it is shaped this way: it never resolves a difference.
 * Where two readings disagree, both are kept with their own excerpts and neither is preferred. The
 * dominant failure mode for a dataset like this is false conflict — most apparent numeric
 * disagreement between labels is a genuine difference in population or formulation, fed against
 * fasted or immediate against extended release, not one label being wrong. Marking a pair as
 * numerically disjoint says a person should look, and says nothing about which reading is right.
 *
 * Only documents declaring a single active substance are read, for the same reason the rest of the
 * pipeline requires it: a combination product's pharmacokinetics section describes its substances
 * together and belongs to none of them individually.
 *
 * Usage:
 *   tsx scripts/background/build-source-consensus.ts <labelIndex.ndjson>
 */

interface IndexedLabel {
  setId: string
  declaredSubstanceCount?: number
  effectiveTime?: string
  brandNames: string[]
  genericNames: string[]
  routes: string[]
  sections: Record<string, string>
}

/** Fields read from every document. Each is extracted independently, never pooled. */
const CONSENSUS_FIELDS = [
  'halfLife',
  'bioavailability',
  'tMax',
  'proteinBinding',
  'volumeOfDistribution',
] as const
type ConsensusField = (typeof CONSENSUS_FIELDS)[number]

/** Sources kept per distinct reading. The count reported is always the full count. */
const MAX_SOURCES_PER_READING = 4
/** Readings kept per field, most-supported first. */
const MAX_READINGS_PER_FIELD = 5
/**
 * Documents read per medicine. Some medicines have hundreds of labels and the marginal document
 * adds nothing once agreement is established, while the generated file would grow without bound.
 * The number examined is reported so the cap is visible rather than silent.
 */
const MAX_DOCUMENTS_PER_MEDICINE = 60

/**
 * A reading's identity for grouping. Two labels stating "5 to 7 hours" and "5-7 hours" have said
 * the same thing, and treating them as different readings would manufacture disagreement out of
 * typography.
 */
function readingKey(display: string, unit: string | undefined): string {
  const normalized = display
    .toLowerCase()
    .replace(/–|—|−/gu, '-')
    .replace(/\s*(?:to|-)\s*/gu, '-')
    .replace(/\s+/gu, '')
    .replace(/hours?|hrs?\b/gu, 'h')
  return `${normalized}|${unit ?? ''}`
}

/**
 * The numeric span a reading covers, for deciding whether two readings can both be true.
 *
 * Read whole: the local regex could not cross a thousands separator, so "5,800 L" became the span
 * 5 to 800 and two readings that agreed were reported as disagreeing.
 */
function numericSpan(display: string): { low: number; high: number } | null {
  return printedSpan(display)
}

interface Accumulated {
  display: string
  numeric?: number
  unit?: string
  sources: BackgroundSource[]
  count: number
}

function loadMedicineNames(): Map<string, { slug: string; name: string }> {
  const dir = join(process.cwd(), 'data', 'drugs')
  const byName = new Map<string, { slug: string; name: string }>()
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith('.ndjson'))
    .sort()) {
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as { id?: string; name?: string }
      if (!record.id || !record.name) continue
      const key = normalizeName(record.name)
      if (key.length >= 3 && !byName.has(key))
        byName.set(key, { slug: record.id, name: record.name })
    }
  }
  return byName
}

function serialize(dataset: Record<string, RecordedSourceConsensus>): string {
  const entries = Object.keys(dataset)
    .sort()
    .map(
      (slug) =>
        `  ${JSON.stringify(slug)}: ${JSON.stringify(dataset[slug], null, 2).replace(/\n/gu, '\n  ')},`,
    )
    .join('\n')
  return `// Generated by scripts/background/build-source-consensus.ts — do not edit by hand.
//
// What every published label in the corpus states for a field, rather than what one of them
// states. Readings that differ are all kept, each with its own excerpt, and none is preferred:
// most apparent disagreement between labels is a real difference in population or formulation,
// and choosing between them is a judgement this record presents rather than makes.

import type { RecordedSourceConsensus } from '@/lib/background/types'

export const SOURCE_CONSENSUS: Record<string, RecordedSourceConsensus> = {
${entries}
}
`
}

async function main() {
  const [indexPath] = process.argv.slice(2).filter((value) => !value.startsWith('--'))
  if (!indexPath || !existsSync(indexPath)) {
    console.error('Usage: tsx scripts/background/build-source-consensus.ts <labelIndex.ndjson>')
    process.exit(1)
  }
  const retrievedAt = new Date().toISOString().slice(0, 10)
  const medicines = loadMedicineNames()
  console.log(`[consensus] ${medicines.size} distinct medicine names`)

  // Readings accumulate per medicine and field; only the extracted values are held, never the
  // label text, so reading every document costs no more memory than reading one.
  const readings = new Map<string, Map<ConsensusField, Map<string, Accumulated>>>()
  const examined = new Map<string, number>()
  let documentsRead = 0
  let documentsUsed = 0

  const reader = createInterface({
    input: createReadStream(indexPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })

  for await (const line of reader) {
    if (!line.trim()) continue
    const label = JSON.parse(line) as IndexedLabel
    documentsRead += 1
    // A combination product's pharmacokinetics belongs to its substances jointly and to none of
    // them individually, which is the same rule the rest of the pipeline applies.
    if (label.declaredSubstanceCount !== 1) continue

    let matched: { slug: string; name: string } | undefined
    for (const candidate of label.genericNames) {
      matched = medicines.get(normalizeName(candidate))
      if (matched) break
    }
    if (!matched) continue

    const seen = examined.get(matched.slug) ?? 0
    if (seen >= MAX_DOCUMENTS_PER_MEDICINE) continue
    examined.set(matched.slug, seen + 1)

    const artifact: LabelArtifact = {
      setId: label.setId,
      declaredSubstanceCount: label.declaredSubstanceCount,
      effectiveTime: label.effectiveTime,
      brandNames: label.brandNames,
      genericNames: label.genericNames,
      routes: label.routes,
      sections: label.sections,
    }
    const pharmacokinetics = extractPharmacokinetics(artifact, {
      retrievedAt,
      sourceLabel: `${matched.name} label`,
    })
    if (!pharmacokinetics) continue
    documentsUsed += 1

    const forMedicine = readings.get(matched.slug) ?? new Map()
    for (const field of CONSENSUS_FIELDS) {
      const value = pharmacokinetics[field]
      if (!value) continue
      const byReading = forMedicine.get(field) ?? new Map<string, Accumulated>()
      const key = readingKey(value.display, value.unit)
      const existing = byReading.get(key)
      if (existing) {
        existing.count += 1
        if (existing.sources.length < MAX_SOURCES_PER_READING) existing.sources.push(value.source)
      } else {
        byReading.set(key, {
          display: value.display,
          ...(value.numeric !== undefined ? { numeric: value.numeric } : {}),
          ...(value.unit ? { unit: value.unit } : {}),
          sources: [value.source],
          count: 1,
        })
      }
      forMedicine.set(field, byReading)
    }
    readings.set(matched.slug, forMedicine)
  }

  const dataset: Record<string, RecordedSourceConsensus> = {}
  let multiSourceFields = 0
  let disjointFields = 0

  for (const [slug, byField] of readings) {
    const fields: RecordedFieldConsensus[] = []
    for (const field of CONSENSUS_FIELDS) {
      const byReading = byField.get(field)
      if (!byReading) continue
      const ordered = [...byReading.values()].sort(
        (left, right) => right.count - left.count || left.display.localeCompare(right.display),
      )
      const sourceCount = ordered.reduce((total, entry) => total + entry.count, 0)
      if (sourceCount < 2) continue
      multiSourceFields += 1

      // Two readings can both be true when their numeric spans overlap; only genuinely disjoint
      // spans are marked, and even then only as something for a person to look at.
      const spans = ordered.map((entry) => numericSpan(entry.display)).filter(Boolean)
      let numericallyDisjoint = false
      for (let a = 0; a < spans.length && !numericallyDisjoint; a += 1) {
        for (let b = a + 1; b < spans.length; b += 1) {
          const left = spans[a]!
          const right = spans[b]!
          if (left.high < right.low || right.high < left.low) {
            numericallyDisjoint = true
            break
          }
        }
      }
      if (numericallyDisjoint) disjointFields += 1

      const readingList: ConsensusReading[] = ordered
        .slice(0, MAX_READINGS_PER_FIELD)
        .map((entry) => ({
          display: entry.display,
          ...(entry.numeric !== undefined ? { numeric: entry.numeric } : {}),
          ...(entry.unit ? { unit: entry.unit } : {}),
          sourceCount: entry.count,
          sources: entry.sources,
        }))

      fields.push({
        field,
        sourceCount,
        readings: readingList,
        agreementRate: (ordered[0]?.count ?? 0) / sourceCount,
        numericallyDisjoint,
      })
    }
    if (fields.length === 0) continue
    dataset[slug] = { documentsExamined: examined.get(slug) ?? 0, fields }
  }

  const outPath = join(
    process.cwd(),
    'scripts',
    'seed-data',
    'background',
    'source-consensus.generated.ts',
  )
  writeFileSync(outPath, serialize(dataset))
  execFileSync('npx', ['prettier', '--write', outPath], { stdio: 'ignore' })

  console.log(
    `[consensus] read ${documentsRead} documents · ${documentsUsed} carried pharmacokinetics`,
  )
  console.log(
    `[consensus] ${Object.keys(dataset).length} medicines with a multi-source field · ${multiSourceFields} such fields · ${disjointFields} carry readings that do not overlap`,
  )
  console.log(`[consensus] wrote ${outPath}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
