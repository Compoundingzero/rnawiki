import 'dotenv/config'
import { execFileSync } from 'node:child_process'
import { createReadStream, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import { extractBackgroundFromLabel, type LabelArtifact } from '@/lib/background/label-extraction'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import {
  normalizeContentName as normalizeName,
  normalizeIdentityName,
} from '@/lib/background/name-normalization'
import type { MedicineRecordedBackground } from '@/lib/background/types'
import { RECORDED_BACKGROUND } from '../seed-data/background'

/**
 * Builds `extracted`-tier recorded background for the whole medicine corpus from openFDA's bulk
 * label archive.
 *
 * Hand-authoring reached 155 medicines. This reaches every medicine whose name matches a published
 * FDA label, because the parser satisfies the dataset's evidence guarantee by construction: it
 * reads each value out of a label sentence and stores that sentence as the excerpt.
 *
 * Two boundaries are absolute. A curated record is never overwritten — the hand-authored corpus
 * always wins on a slug it already covers. And every extracted envelope must pass the background
 * engine before it is written, so an extraction that produced something structurally wrong is
 * dropped rather than published.
 *
 * Usage:
 *   tsx scripts/background/build-extracted-background.ts <labelIndex.ndjson> [--limit=N] [--retrieved-at=YYYY-MM-DD]
 *
 * The index is produced by scripts/background/index-openfda-labels.py from openFDA's bulk
 * `drug-label-*.json.zip` partitions (https://api.fda.gov/download.json) — one download and one
 * reduction pass, rather than thousands of API calls. The reduction runs in Python because a
 * decompressed partition exceeds the maximum string length a Node process can hold.
 */

interface MedicineRow {
  slug: string
  name: string
  tradeName?: string
}

interface IndexedLabel {
  setId: string
  /** Distinct active substances the document declares, after salt forms collapse. */
  declaredSubstanceCount?: number
  effectiveTime?: string
  brandNames: string[]
  genericNames: string[]
  /** Active-substance names, which reach salt-form and combination rows the generic name misses. */
  substanceNames?: string[]
  routes: string[]
  unii?: string
  rxcui?: string
  sections: Record<string, string>
  /** Higher is better when several labels share a name. */
  score: number
}

/**
 * An identity index built exclusively from documents that declare exactly one active substance.
 *
 * On such a document the identifier can only refer to that substance, so the mapping is sound
 * without any positional assumption. A name that resolves to more than one identifier across the
 * corpus is dropped rather than guessed: an ambiguous identity is not an identity.
 */
interface SubstanceIdentity {
  unii?: string
  rxcui?: string
  /** The single-substance label that established this identity, cited as the source. */
  setId: string
}

type IdentityIndex = Map<string, SubstanceIdentity>

/**
 * Which of two labels answering to the same name should supply this medicine's record.
 *
 * A document about one substance wins over a richer document about several, and that ordering
 * matters more than it looks. Every substance-specific module is refused on a multi-substance
 * source, so when a name resolved to a combination label the record came out empty even though a
 * single-substance label for the same name sat in the index beside it. Ranking by section count
 * alone let that happen on every tie: "Actaea Spicata Root" had one label declaring five substances
 * and one declaring one, both scoring 1, and the five-substance one arrived first.
 *
 * 987 rows held a label naming them alone and carried no substance content at all.
 */
function preferred(candidate: IndexedLabel, held: IndexedLabel): boolean {
  const candidateIsSole = candidate.declaredSubstanceCount === 1
  const heldIsSole = held.declaredSubstanceCount === 1
  if (candidateIsSole !== heldIsSole) return candidateIsSole
  return candidate.score > held.score
}

/**
 * Builds the name index by streaming the reduced NDJSON. A medicine is reachable by its generic
 * name and by any brand name on the label; when several labels answer to one name, `preferred`
 * decides between them.
 */
async function buildIndex(
  indexPath: string,
): Promise<{ names: Map<string, IndexedLabel>; identity: IdentityIndex }> {
  const index = new Map<string, IndexedLabel>()
  const candidates = new Map<string, Map<string, SubstanceIdentity>>()
  let lineCount = 0
  // The reduced index is larger than the maximum string a Node process can hold, so it is read a
  // line at a time rather than loaded whole.
  const reader = createInterface({
    input: createReadStream(indexPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of reader) {
    if (!line.trim()) continue
    lineCount += 1
    const entry = JSON.parse(line) as IndexedLabel
    if (!entry.setId) continue
    for (const candidate of [
      ...entry.genericNames,
      ...entry.brandNames,
      ...(entry.substanceNames ?? []),
    ]) {
      const key = normalizeName(candidate)
      if (key.length < 3) continue
      const existing = index.get(key)
      if (!existing || preferred(entry, existing)) index.set(key, entry)
    }

    // Identity is learned only from documents about a single substance, where the document-level
    // identifier can refer to nothing else. Candidates are keyed by the identifier itself so a
    // name claimed by two different substances can be detected and dropped.
    if (entry.declaredSubstanceCount === 1 && entry.unii) {
      for (const name of entry.genericNames) {
        const key = normalizeIdentityName(name)
        if (key.length < 3) continue
        const byUnii = candidates.get(key) ?? new Map<string, SubstanceIdentity>()
        if (!byUnii.has(entry.unii)) {
          byUnii.set(entry.unii, {
            unii: entry.unii,
            ...(entry.rxcui ? { rxcui: entry.rxcui } : {}),
            setId: entry.setId,
          })
        }
        candidates.set(key, byUnii)
      }
    }
  }

  // A name that resolves to more than one substance is dropped: an ambiguous identity is not one.
  const identity: IdentityIndex = new Map()
  for (const [key, byUnii] of candidates) {
    if (byUnii.size === 1) identity.set(key, [...byUnii.values()][0]!)
  }
  console.log(
    `[extract] read ${lineCount} indexed labels · ${index.size} distinct names · ${identity.size} unambiguous substance identities`,
  )
  return { names: index, identity }
}

function loadMedicineRows(): MedicineRow[] {
  const dir = join(process.cwd(), 'data', 'drugs')
  const rows: MedicineRow[] = []
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith('.ndjson'))
    .sort()) {
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as { id?: string; name?: string; tradeName?: string }
      if (record.id && record.name) {
        rows.push({
          slug: record.id,
          name: record.name,
          ...(record.tradeName ? { tradeName: record.tradeName } : {}),
        })
      }
    }
  }
  return rows
}

function serialize(dataset: Record<string, MedicineRecordedBackground>): string {
  const slugs = Object.keys(dataset).sort()
  const entries = slugs
    .map(
      (slug) =>
        `  ${JSON.stringify(slug)}: ${JSON.stringify(dataset[slug], null, 2).replace(/\n/gu, '\n  ')},`,
    )
    .join('\n')
  return `// Generated by scripts/background/build-extracted-background.ts — do not edit by hand.
//
// Every value here was read out of an FDA label sentence by a deterministic parser, which stores
// that sentence as the excerpt; the number is therefore always present in its own excerpt. These
// records are 'extracted' tier: no judgement was applied, and they never overwrite a curated
// record. Re-run the script to refresh, and let \`git diff\` report what changed.

import type { MedicineRecordedBackground } from '@/lib/background/types'

export const EXTRACTED_BACKGROUND: Record<string, MedicineRecordedBackground> = {
${entries}
}
`
}

async function main() {
  const [indexPath] = process.argv.slice(2).filter((value) => !value.startsWith('--'))
  if (!indexPath || !existsSync(indexPath)) {
    console.error(
      'Usage: tsx scripts/background/build-extracted-background.ts <labelIndex.ndjson> [--limit=N]',
    )
    process.exit(1)
  }
  const limitFlag = process.argv.find((value) => value.startsWith('--limit='))
  const limit = limitFlag ? Number(limitFlag.split('=')[1]) : Infinity

  /**
   * When the SOURCE was retrieved, which is not when this parser ran.
   *
   * Re-parsing a cached archive with a corrected pattern does not make the labels newer, and
   * stamping today's date on every record would claim it did — while burying the actual change in
   * an 80,000-line diff of dates. `--retrieved-at=` pins it to the archive's own download date.
   */
  const retrievedAtFlag = process.argv.find((value) => value.startsWith('--retrieved-at='))
  const retrievedAt = retrievedAtFlag
    ? retrievedAtFlag.slice('--retrieved-at='.length)
    : new Date().toISOString().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(retrievedAt)) {
    console.error(`[extract] --retrieved-at must be YYYY-MM-DD, got "${retrievedAt}"`)
    process.exit(1)
  }
  const { names: index, identity } = await buildIndex(indexPath)
  const rows = loadMedicineRows()
  console.log(`[extract] ${rows.length} medicine rows · ${index.size} indexed label names`)

  const dataset: Record<string, MedicineRecordedBackground> = {}
  const stats = {
    considered: 0,
    curatedSkipped: 0,
    noLabelMatch: 0,
    nothingExtractable: 0,
    engineRejected: 0,
    written: 0,
  }
  const moduleCounts = new Map<string, number>()
  let multiSubstanceSources = 0

  for (const row of rows) {
    if (stats.written >= limit) break
    stats.considered += 1

    // The hand-authored corpus always wins: extraction never overwrites curated work.
    if (RECORDED_BACKGROUND[row.slug]) {
      stats.curatedSkipped += 1
      continue
    }

    const candidates = [row.name, ...(row.tradeName ? row.tradeName.split(/\s*[/,]\s*/u) : [])]
    let label: IndexedLabel | undefined
    for (const candidate of candidates) {
      label = index.get(normalizeName(candidate))
      if (label) break
    }
    if (!label) {
      stats.noLabelMatch += 1
      continue
    }

    const artifact: LabelArtifact = {
      setId: label.setId,
      declaredSubstanceCount: label.declaredSubstanceCount,
      effectiveTime: label.effectiveTime,
      brandNames: label.brandNames,
      genericNames: label.genericNames,
      routes: label.routes,
      unii: label.unii,
      rxcui: label.rxcui,
      sections: label.sections,
    }
    // This medicine's identifiers come from the identity index, which is built only from documents
    // declaring a single substance — the one situation where a document-level identifier can only
    // belong to one thing. The content label may well be a combination product; its identifiers
    // are never split between its substances, because openFDA's name and identifier arrays are not
    // positionally aligned and doing so assigns one substance's identifier to another.
    const resolved = identity.get(normalizeIdentityName(row.name))
    const ownUnii = resolved?.unii
    const ownRxcui = resolved?.rxcui
    const identifiers =
      ownUnii || ownRxcui
        ? {
            ...(ownUnii ? { unii: ownUnii } : {}),
            ...(ownRxcui ? { rxcui: ownRxcui } : {}),
            source: {
              // The document cited is the one that established the identity: a label naming this
              // substance and nothing else.
              kind: 'FDA_LABEL' as const,
              identifier: resolved!.setId,
              label: `${row.name} label naming this substance alone`,
              retrievedAt,
            },
          }
        : undefined

    const { background, modules } = extractBackgroundFromLabel({
      artifact,
      options: { retrievedAt, sourceLabel: `${row.name} label` },
      registryIdentifiers: identifiers,
    })
    if (!background) {
      stats.nothingExtractable += 1
      continue
    }

    // Nothing reaches the dataset without passing the same engine the curated corpus passes.
    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      stats.engineRejected += 1
      // Reported rather than counted. A rejection is the engine catching an extractor that
      // produced something structurally wrong, and a silent tally of them is a bug nobody reads.
      console.error(
        `[extract] rejected ${row.slug}: ${report.findings
          .map((finding) => `${finding.code} at ${finding.path} — ${finding.message}`)
          .join(' · ')}`,
      )
      continue
    }

    if (label.declaredSubstanceCount !== 1) multiSubstanceSources += 1
    dataset[row.slug] = background
    stats.written += 1
    for (const name of modules) moduleCounts.set(name, (moduleCounts.get(name) ?? 0) + 1)
  }

  const outPath = join(
    process.cwd(),
    'scripts',
    'seed-data',
    'background',
    'extracted-background.generated.ts',
  )
  writeFileSync(outPath, serialize(dataset))
  // Formatting here rather than leaving it to a human step: a regenerated corpus that skipped it
  // would fail `npm run gate` on formatting alone, long after the run that caused it.
  execFileSync('npx', ['prettier', '--write', outPath], { stdio: 'ignore' })
  console.log(`[extract] ${JSON.stringify(stats)}`)
  console.log(`[extract] modules: ${JSON.stringify(Object.fromEntries(moduleCounts))}`)
  // Reported rather than hidden: these records kept only product identity, because their source
  // was a multi-ingredient document that says nothing substance-specific about any one substance.
  console.log(
    `[extract] ${multiSubstanceSources} record(s) came from a multi-substance source and carry product context only`,
  )
  console.log(`[extract] wrote ${stats.written} record(s) to ${outPath}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
