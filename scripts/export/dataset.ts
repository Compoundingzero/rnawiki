import 'dotenv/config'
import { createHash } from 'node:crypto'
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { asc, sql } from 'drizzle-orm'
import { db } from '@/db'
import { drugAliases, drugs } from '@/db/schema'
import { rowToDossier, type DrugRow } from '@/lib/dossier'

/**
 * Publishes the whole corpus to `data/` so the database is open, checkable and forkable.
 *
 * WHY A DUMP RATHER THAN A LIVE MIRROR. The site is the only place an edit happens: every change
 * runs through the automatic check and, for most contributors, a human reviewer. A GitHub copy
 * anyone could push to would be a second, unchecked way in, and the two would diverge the first
 * time someone edited both. So this directory is a SNAPSHOT — generated, overwritten wholesale on
 * every export, and never a source of truth. `data/README.md` says so to anyone who opens it.
 *
 * The point of publishing it is that a claim you cannot check is not evidence. Anyone can take this
 * dataset, re-run the sums, disagree, and show their work.
 */

const SHARD_SIZE = 1000
const EXPORT_DIR = join(process.cwd(), 'data')
const DRUGS_DIR = join(EXPORT_DIR, 'drugs')

/** Fields that exist for the site's plumbing and mean nothing to anyone reading the dataset. */
const INTERNAL_FIELDS = new Set(['searchVector', 'viewCount', 'lastEditedBy', 'lastEditedAt'])

interface Manifest {
  generatedAt: string
  source: string
  licence: string
  counts: {
    total: number
    flagship: number
    curated: number
    stub: number
    withStructure: number
    withTrials: number
    withPrice: number
    machineVerified: number
    aliases: number
  }
  files: Array<{ path: string; rows: number; bytes: number; sha256: string }>
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

async function main(): Promise<void> {
  console.log('[export] reading the corpus…')

  const rows = (await db.select().from(drugs).orderBy(asc(drugs.slug))) as unknown as DrugRow[]
  const aliasRows = await db
    .select({ drugId: drugAliases.drugId, alias: drugAliases.alias, kind: drugAliases.kind })
    .from(drugAliases)
    .orderBy(asc(drugAliases.drugId), asc(drugAliases.alias))

  const aliasesByDrug = new Map<string, Array<{ alias: string; kind: string }>>()
  for (const row of aliasRows) {
    const list = aliasesByDrug.get(row.drugId) ?? []
    list.push({ alias: row.alias, kind: row.kind })
    aliasesByDrug.set(row.drugId, list)
  }

  console.log(`[export] ${rows.length.toLocaleString()} records, ${aliasRows.length.toLocaleString()} aliases`)

  // Wipe and rebuild, so a record deleted upstream disappears here rather than lingering as a
  // file nobody notices is stale.
  rmSync(DRUGS_DIR, { recursive: true, force: true })
  mkdirSync(DRUGS_DIR, { recursive: true })

  const files: Manifest['files'] = []
  const counts = {
    total: rows.length,
    flagship: 0,
    curated: 0,
    stub: 0,
    withStructure: 0,
    withTrials: 0,
    withPrice: 0,
    machineVerified: 0,
    aliases: aliasRows.length,
  }

  for (let shard = 0; shard * SHARD_SIZE < rows.length; shard += 1) {
    const slice = rows.slice(shard * SHARD_SIZE, (shard + 1) * SHARD_SIZE)
    const lines: string[] = []

    for (const row of slice) {
      const dossier = rowToDossier(row)
      if (row.dossierDepth === 'flagship') counts.flagship += 1
      else if (row.dossierDepth === 'curated') counts.curated += 1
      else counts.stub += 1
      if (dossier.molecularSchema?.smilesString) counts.withStructure += 1
      if (dossier.trials.length > 0) counts.withTrials += 1
      if (dossier.pricing) counts.withPrice += 1
      if (row.isMachineVerifiedStructure) counts.machineVerified += 1

      const record: Record<string, unknown> = { ...dossier }
      for (const field of INTERNAL_FIELDS) delete record[field]
      record.aliases = aliasesByDrug.get(row.id) ?? []
      record.url = `https://rnawiki.com/d/${row.slug}`

      // One object per line, keys sorted, so a diff between two exports shows what actually
      // changed rather than a reshuffle of key order.
      lines.push(JSON.stringify(record, Object.keys(record).sort()))
    }

    const name = `drugs-${String(shard + 1).padStart(3, '0')}.ndjson`
    const body = `${lines.join('\n')}\n`
    writeFileSync(join(DRUGS_DIR, name), body)
    files.push({
      path: `data/drugs/${name}`,
      rows: slice.length,
      bytes: Buffer.byteLength(body),
      sha256: sha256(body),
    })
    console.log(`[export] ${name} · ${slice.length} rows · ${(Buffer.byteLength(body) / 1e6).toFixed(1)} MB`)
  }

  // A flat CSV of the columns most people want, for anyone who would rather open a spreadsheet
  // than parse newline-delimited JSON.
  const csvHeader = [
    'slug', 'name', 'trade_name', 'sponsor', 'modality', 'approval_status', 'approval_year',
    'target_gene', 'patient_friendly_indication', 'dossier_depth', 'machine_verified',
    'smiles', 'chemical_formula', 'trial_count', 'url',
  ]
  const csvEscape = (value: unknown): string => {
    const text = value === null || value === undefined ? '' : String(value)
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const csvLines = [csvHeader.join(',')]
  for (const row of rows) {
    const dossier = rowToDossier(row)
    csvLines.push(
      [
        row.slug, row.name, row.tradeName, row.sponsor, row.modality, row.approvalStatus,
        row.approvalYear, row.targetGene, row.patientFriendlyIndication, row.dossierDepth,
        row.isMachineVerifiedStructure, dossier.molecularSchema?.smilesString,
        dossier.molecularSchema?.chemicalFormula, dossier.trials.length,
        `https://rnawiki.com/d/${row.slug}`,
      ].map(csvEscape).join(','),
    )
  }
  const csvBody = `${csvLines.join('\n')}\n`
  writeFileSync(join(EXPORT_DIR, 'drugs.csv'), csvBody)
  files.push({
    path: 'data/drugs.csv',
    rows: rows.length,
    bytes: Buffer.byteLength(csvBody),
    sha256: sha256(csvBody),
  })

  const manifest: Manifest = {
    generatedAt: new Date().toISOString(),
    source: 'https://rnawiki.com',
    licence: 'CC BY-SA 4.0 — see LICENSE-DATA',
    counts,
    files,
  }
  writeFileSync(join(EXPORT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0)
  console.log(`\n[export] done · ${files.length} files · ${(totalBytes / 1e6).toFixed(1)} MB`)
  console.log(
    `[export] ${counts.flagship} flagship · ${counts.curated} curated · ${counts.stub} stub · ` +
      `${counts.machineVerified} machine-verified`,
  )
  process.exit(0)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
