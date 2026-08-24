import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  cleanLegacyPublicNarrative,
  cleanPublicLabelFields,
  isPlaceholderMedicineIdentity,
  removeEmptyObjectShells,
} from '@/lib/public-data-integrity'
import { stableJsonStringify } from '@/lib/stable-json'
import { extractPatientFriendlyIndication } from '@/scripts/ingest/normalise'

/**
 * Repairs already-generated public snapshots after an ingest integrity rule is tightened.
 *
 * This never reads or writes seed files and never invents medical text. It removes placeholder
 * identities, strips exact known editorial wording, and re-extracts a short label phrase only when
 * the previously exported phrase is a provable truncation or came exclusively from a negated
 * limitation. It also removes unrecoverable empty-object shells left by the legacy serializer.
 */

const DATA_DIR = join(process.cwd(), 'data')
const MANIFEST_PATH = join(DATA_DIR, 'manifest.json')

interface PublicRecord {
  id: string
  name: string
  indication?: string
  patientFriendlyIndication?: string
  dossierDepth?: 'stub' | 'curated' | 'flagship'
  molecularSchema?: { smilesString?: string }
  trials?: unknown[]
  pricing?: unknown
  isMachineVerifiedStructure?: boolean
  aliases?: unknown[]
  oneSentenceVerdict?: string
  sourceProvenance?: string[]
  programmeEvidence?: { programmes?: Array<{ currentPublication?: unknown }> }
  [key: string]: unknown
}

const LEGACY_SOURCE_LABEL_REEXTRACTION_SLUGS = new Set([
  'depemokimab',
  'berotralstat',
  'deoxycholic-acid',
  'mepolizumab',
  'metreleptin',
  'reslizumab',
  'setmelanotide',
  'tezepelumab',
  'zolmitriptan',
])

interface ManifestFile {
  path: string
  rows: number
  bytes: number
  sha256: string
}

interface Manifest {
  generatedAt: string
  source: string
  licence: string
  counts: Record<string, number>
  files: ManifestFile[]
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

function repairRecord(record: PublicRecord): { record: PublicRecord; repairedShortLabel: boolean } {
  const originalShortLabel = record.patientFriendlyIndication ?? ''
  const cleaned = cleanPublicLabelFields({
    medicineSlug: record.id,
    indication: record.indication ?? '',
    patientFriendlyIndication: originalShortLabel,
  })
  const knownSourceDerivedLegacyRow =
    LEGACY_SOURCE_LABEL_REEXTRACTION_SLUGS.has(record.id) &&
    record.dossierDepth === 'curated' &&
    !record.oneSentenceVerdict?.trim() &&
    record.sourceProvenance?.includes('FDA label (openFDA SPL)')
  const repairedShortLabel =
    (Boolean(originalShortLabel.trim()) && !cleaned.patientFriendlyIndication) ||
    Boolean(knownSourceDerivedLegacyRow)
  const repaired = removeEmptyObjectShells({
    ...record,
    indication: cleaned.indication,
    laymanHowItWorks: cleanLegacyPublicNarrative(
      record.id,
      typeof record.laymanHowItWorks === 'string' ? record.laymanHowItWorks : '',
    ),
    ...(typeof record.targetProtein === 'string'
      ? {
          targetProtein: cleanLegacyPublicNarrative(record.id, record.targetProtein),
        }
      : {}),
    ...(typeof record.anatomicalSite === 'string'
      ? {
          anatomicalSite: cleanLegacyPublicNarrative(record.id, record.anatomicalSite),
        }
      : {}),
    patientFriendlyIndication: repairedShortLabel
      ? extractPatientFriendlyIndication(cleaned.indication)
      : cleaned.patientFriendlyIndication,
  }) as PublicRecord
  // The legacy sentence describes a medicine as a whole, so it cannot be published as a reviewed
  // conclusion for one indication, population, dose and trial set. It remains in the database and
  // revision history; this generated public snapshot omits it just like the canonical exporter.
  delete repaired.oneSentenceVerdict
  return {
    record: repaired,
    repairedShortLabel,
  }
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      fields.push(field)
      field = ''
    } else {
      field += char
    }
  }
  fields.push(field)
  return fields
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function main(): void {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Manifest
  const shardEntries = manifest.files.filter((file) => file.path.endsWith('.ndjson'))
  const keptRecords: PublicRecord[] = []
  const shortLabelsBySlug = new Map<string, string>()
  let placeholdersRemoved = 0
  let shortLabelsRepaired = 0
  let recordsCleaned = 0
  let changed = false

  for (const entry of shardEntries) {
    const path = join(process.cwd(), entry.path)
    const original = readFileSync(path, 'utf8')
    const output: string[] = []

    for (const line of original.split('\n')) {
      if (!line) continue
      const parsed = JSON.parse(line) as PublicRecord
      if (isPlaceholderMedicineIdentity({ slug: parsed.id, name: parsed.name })) {
        placeholdersRemoved += 1
        changed = true
        continue
      }

      const { record, repairedShortLabel } = repairRecord(parsed)
      if (repairedShortLabel) shortLabelsRepaired += 1
      const serialized = stableJsonStringify(record)
      if (serialized !== line) {
        recordsCleaned += 1
        changed = true
      }
      output.push(serialized)
      keptRecords.push(record)
      shortLabelsBySlug.set(record.id, record.patientFriendlyIndication ?? '')
    }

    const body = `${output.join('\n')}\n`
    if (body !== original) writeFileSync(path, body)
    entry.rows = output.length
    entry.bytes = Buffer.byteLength(body)
    entry.sha256 = sha256(body)
  }

  const csvEntry = manifest.files.find((file) => file.path === 'data/drugs.csv')
  if (!csvEntry) throw new Error('data/drugs.csv is missing from the public manifest')
  const csvPath = join(process.cwd(), csvEntry.path)
  const originalCsv = readFileSync(csvPath, 'utf8')
  const [headerLine = '', ...dataLines] = originalCsv.trimEnd().split('\n')
  const header = parseCsvLine(headerLine)
  const slugIndex = header.indexOf('slug')
  const nameIndex = header.indexOf('name')
  const shortLabelIndex = header.indexOf('patient_friendly_indication')
  if (slugIndex < 0 || nameIndex < 0 || shortLabelIndex < 0) {
    throw new Error('data/drugs.csv is missing a required public identity or indication column')
  }

  const csvRows: string[] = []
  for (const line of dataLines) {
    const fields = parseCsvLine(line)
    const slug = fields[slugIndex] ?? ''
    const name = fields[nameIndex] ?? ''
    if (isPlaceholderMedicineIdentity({ slug, name })) continue
    fields[shortLabelIndex] = shortLabelsBySlug.get(slug) ?? ''
    csvRows.push(fields.map(csvEscape).join(','))
  }
  const csvBody = `${headerLine}\n${csvRows.join('\n')}\n`
  if (csvBody !== originalCsv) {
    writeFileSync(csvPath, csvBody)
    changed = true
  }
  csvEntry.rows = csvRows.length
  csvEntry.bytes = Buffer.byteLength(csvBody)
  csvEntry.sha256 = sha256(csvBody)

  if (!changed) {
    console.log('[snapshot-repair] no changes needed')
    return
  }

  const counts = {
    total: keptRecords.length,
    flagship: keptRecords.filter((record) => record.dossierDepth === 'flagship').length,
    curated: keptRecords.filter((record) => record.dossierDepth === 'curated').length,
    stub: keptRecords.filter((record) => record.dossierDepth === 'stub').length,
  }
  // Counts of aliases and nested content came from the database during the original export. The
  // legacy serializer discarded those nested values, so preserve the database-derived counts;
  // they cannot be reconstructed from the repaired snapshot without inventing data.
  for (const key of Object.keys(manifest.counts)) {
    if (key in counts) manifest.counts[key] = counts[key as keyof typeof counts]
  }
  manifest.generatedAt = new Date().toISOString()
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)

  console.log(
    `[snapshot-repair] ${placeholdersRemoved} placeholder removed; ` +
      `${shortLabelsRepaired} invalid source-derived short labels re-extracted; ` +
      `${recordsCleaned} records cleaned`,
  )
}

main()
