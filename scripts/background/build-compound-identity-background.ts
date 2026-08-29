import 'dotenv/config'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { alternativeNames } from '@/lib/background/name-normalization'
import { MOLECULAR_FORMULA_SHAPE } from '@/lib/background/types'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type { MedicineRecordedBackground } from '@/lib/background/types'

/**
 * Builds records for corpus rows whose only knowable facts are chemical.
 *
 * These are the rows neither label pipeline reaches: single compounds, cosmetic ingredients,
 * isolated molecules that no prescription label describes and no supplement label lists. Both
 * pipelines were finding nothing for them, every run, which is what a reader saw.
 *
 * A formula and a molecular weight is a thin record. It is also true, checkable against a named
 * compound id, and more than the blank page that preceded it. Nothing is inferred from it: a
 * formula is not a mechanism, and this file adds no other module.
 *
 * These values are `transcribed` — the compound database returns structured fields with no sentence
 * behind them, so there is no excerpt to quote and the compound id stands in its place.
 *
 * Usage:
 *   tsx scripts/background/build-compound-identity-background.ts
 */

interface CompoundIdentityEntry {
  queriedName: string
  cid?: string
  molecularFormula?: string
  molecularWeight?: number
  state: 'RECORDED' | 'NO_COMPOUND' | 'LOOKUP_FAILED'
}

/** Bounds a molecular weight must fall inside to be a medicine-scale compound. */
const MIN_WEIGHT = 1
const MAX_WEIGHT = 500_000

function main(): void {
  const cachePath =
    process.env.RNAWIKI_PUBCHEM_CACHE ??
    '/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/pubchem-identity.json'
  if (!existsSync(cachePath)) {
    console.error(`[identity] no cache at ${cachePath}. Run fetch-compound-identity.ts first.`)
    process.exit(1)
  }
  const cache = JSON.parse(readFileSync(cachePath, 'utf8')) as Record<string, CompoundIdentityEntry>

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
    noCompound: 0,
    unusableValues: 0,
    engineRejected: 0,
    written: 0,
  }

  for (const row of rows) {
    // Alternatives are tried longest first, so the most specific name a title offers wins.
    let entry: CompoundIdentityEntry | undefined
    for (const candidate of alternativeNames(row.name)) {
      entry = cache[candidate.trim()] ?? cache[candidate.trim().replace(/\)+$/u, '')]
      if (entry?.state === 'RECORDED') break
    }
    if (!entry) {
      stats.noLookup += 1
      continue
    }
    if (entry.state !== 'RECORDED' || !entry.cid) {
      stats.noCompound += 1
      continue
    }

    const formula = entry.molecularFormula?.trim()
    const weight = entry.molecularWeight
    const formulaUsable = Boolean(formula && MOLECULAR_FORMULA_SHAPE.test(formula))
    const weightUsable = weight !== undefined && weight >= MIN_WEIGHT && weight <= MAX_WEIGHT
    if (!formulaUsable && !weightUsable) {
      stats.unusableValues += 1
      continue
    }

    const source = {
      kind: 'PUBCHEM' as const,
      identifier: entry.cid,
      label: `Compound record for ${entry.queriedName}`,
      retrievedAt,
    }
    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      provenanceTier: 'transcribed',
      molecularIdentity: {
        ...(formulaUsable && formula
          ? {
              molecularFormula: {
                display: formula,
                populationContext: 'as the compound record states it',
                source,
                provenanceTier: 'transcribed' as const,
              },
            }
          : {}),
        ...(weightUsable && weight !== undefined
          ? {
              molecularWeight: {
                display: String(weight),
                numeric: weight,
                unit: 'g/mol',
                populationContext: 'as the compound record states it',
                source,
                provenanceTier: 'transcribed' as const,
              },
            }
          : {}),
      },
    }

    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      stats.engineRejected += 1
      if (stats.engineRejected <= 3) {
        console.error(
          `[identity] ${row.slug}: ${report.findings.map((finding) => finding.code).join(', ')}`,
        )
      }
      continue
    }
    dataset[row.slug] = background
    stats.written += 1
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'compound-identity-background.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[identity] ${JSON.stringify(stats)}`)
  console.log(`[identity] wrote ${stats.written} record(s) to ${outPath}`)
}

main()
