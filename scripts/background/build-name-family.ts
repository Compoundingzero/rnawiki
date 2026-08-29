import 'dotenv/config'
import { createReadStream, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import { normalizeIdentityName } from '@/lib/background/name-normalization'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type { MedicineRecordedBackground, RecordedNameFamily } from '@/lib/background/types'
import { ALL_RECORDED_BACKGROUND } from '../seed-data/background'

/**
 * Records the substances a row's name is shared with, for rows nothing could identify.
 *
 * Some rows are filed under a name that opens a family rather than naming a member of it.
 * "Ethylhexyl" is the start of 69 registered substances, led by ethylhexyl salicylate on 40 marketed
 * products and ethylhexyl methoxycinnamate on 36 — two ultraviolet filters four products apart.
 * "Acebutolol" is shared by the base and its hydrochloride, which are different registered
 * substances with different identifiers.
 *
 * There are three things one can do with such a row, and two of them are bad. Leaving it blank
 * teaches a reader nothing. Picking the most-marketed member puts one substance's data on a page
 * that may mean another, which is the mis-attribution this record model exists to prevent. The
 * third is to record the ambiguity itself: the name is incomplete, these are the substances that
 * share it, and this is how many marketed products each has. That is true, checkable, and more
 * useful than either alternative.
 *
 * It runs LAST, over rows that every identifying source has already failed on. A row whose substance
 * is known does not need to be told its name is shared.
 *
 * Usage:
 *   tsx scripts/background/build-name-family.ts <substances.ndjson> <drug-ndc.json>
 */

interface SubstanceLine {
  unii: string
  preferredName: string
  names: string[]
}

/** Members listed per row: enough to disambiguate, not a catalogue. */
const MAX_MEMBERS = 10
/** Below this a family is small enough that the sources simply disagree, not that a name is a stem. */
const MIN_MEMBERS = 2

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

/** Whether any source has already said what substance this row is. */
function alreadyIdentified(slug: string): boolean {
  const background = ALL_RECORDED_BACKGROUND[slug]
  if (!background) return false
  return Boolean(
    background.sourceMaterial ?? background.biologicalIdentity ?? background.molecularIdentity,
  )
}

async function main() {
  const substancePath = process.argv[2]
  const ndcPath = process.argv[3]
  if (!substancePath || !ndcPath) {
    console.error(
      'usage: tsx scripts/background/build-name-family.ts <substances.ndjson> <drug-ndc.json>',
    )
    process.exit(1)
  }

  const rows = medicineRows().filter((row) => !alreadyIdentified(row.slug))
  const wanted = new Map<string, string>()
  for (const row of rows) {
    const key = normalizeIdentityName(row.name)
    // Three characters is the floor every matcher here uses; below it a "family" is everything.
    if (key.length >= 4 && !wanted.has(key)) wanted.set(key, row.slug)
  }
  console.log(
    `[family] ${rows.length} unidentified row(s) · ${wanted.size} name(s) to test for sharing`,
  )

  // Members: a registered substance whose name equals the row's name, or begins with it followed by
  // a space. Both mean the row's name does not pick one substance out.
  const members = new Map<string, Map<string, string>>()
  let read = 0
  const reader = createInterface({
    input: createReadStream(substancePath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of reader) {
    if (!line.trim()) continue
    read += 1
    const substance = JSON.parse(line) as SubstanceLine
    const seen = new Set<string>()
    for (const name of [substance.preferredName, ...substance.names]) {
      const key = normalizeIdentityName(name)
      if (key.length < 4) continue
      for (const [wantedKey] of wanted) {
        if (seen.has(wantedKey)) continue
        if (key === wantedKey || key.startsWith(`${wantedKey} `)) {
          seen.add(wantedKey)
          const held = members.get(wantedKey) ?? new Map<string, string>()
          if (!held.has(substance.unii)) held.set(substance.unii, substance.preferredName)
          members.set(wantedKey, held)
        }
      }
    }
    if (read % 50_000 === 0) console.log(`[family] ${read} substance record(s) read`)
  }
  console.log(`[family] ${read} substance record(s) read`)

  // How many marketed products list each member, so the list can be ordered by something real.
  const ndc = JSON.parse(readFileSync(ndcPath, 'utf8')) as {
    results: { active_ingredients?: { name?: string }[] }[]
  }
  const productsByName = new Map<string, number>()
  for (const product of ndc.results) {
    for (const ingredient of product.active_ingredients ?? []) {
      const key = normalizeIdentityName(ingredient.name ?? '')
      if (key) productsByName.set(key, (productsByName.get(key) ?? 0) + 1)
    }
  }

  const retrievedAt = new Date().toISOString().slice(0, 10)
  const dataset: Record<string, MedicineRecordedBackground> = {}
  const stats = { tested: wanted.size, tooFewMembers: 0, engineRejected: 0, written: 0 }

  for (const [key, slug] of wanted) {
    const found = members.get(key)
    if (!found || found.size < MIN_MEMBERS) {
      stats.tooFewMembers += 1
      continue
    }
    const ranked = [...found.entries()]
      .map(([unii, name]) => ({
        nameAsRecorded: name,
        unii,
        productCount: productsByName.get(normalizeIdentityName(name)) ?? 0,
      }))
      // Most-marketed first, which is a count rather than an opinion. Ties break on name so a
      // rebuild produces the same list.
      .sort(
        (left, right) =>
          right.productCount - left.productCount ||
          left.nameAsRecorded.localeCompare(right.nameAsRecorded),
      )

    const family: RecordedNameFamily = {
      memberCount: found.size,
      members: ranked.slice(0, MAX_MEMBERS),
      source: {
        kind: 'FDA_UNII',
        identifier: ranked[0]!.unii,
        label: `Registered substances whose name begins with ${key}`,
        retrievedAt,
      },
    }
    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      provenanceTier: 'transcribed',
      nameFamily: family,
    }
    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      stats.engineRejected += 1
      if (stats.engineRejected <= 3) {
        console.error(
          `[family] rejected ${slug}: ${report.findings.map((f) => `${f.code} at ${f.path}`).join(', ')}`,
        )
      }
      continue
    }
    dataset[slug] = background
    stats.written += 1
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'name-family.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[family] ${JSON.stringify(stats)}`)
  console.log(`[family] wrote ${stats.written} record(s) to ${outPath}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
