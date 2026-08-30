import 'dotenv/config'
import { createHash } from 'node:crypto'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { asc } from 'drizzle-orm'
import { db } from '@/db'
import { drugAliases, drugs } from '@/db/schema'
import { rowToDossier, type DrugRow } from '@/lib/dossier'
import { serializePublicDossier } from '@/lib/dossier-read-serializer'
import {
  cleanPublicLabelFields,
  isPlaceholderMedicineIdentity,
  removeEmptyObjectShells,
} from '@/lib/public-data-integrity'
import {
  buildLegacyMedicineProjection,
  toPublicDatasetProgrammeEvidence,
  type PublicMedicineProjection,
} from '@/lib/public-medicine-projection'
import { getPublicMedicineProjections } from '@/lib/queries/public-medicine-projection'
import { stableJsonStringify } from '@/lib/stable-json'
import { extractPatientFriendlyIndication } from '@/scripts/ingest/normalise'

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

/**
 * The one place the core dataset licence is written down, so every regenerated manifest agrees.
 *
 * WHY THIS IS A CONSTANT AND WHY IT SAYS CC BY. `LICENSE-DATA` has always carried the Creative
 * Commons Attribution 4.0 International text and imposes no copyleft obligation at all, yet this
 * manifest field, both READMEs and every manifest generated from it declared the copyleft variant
 * instead. That is precisely the contradiction for which this project refuses to ingest ChEBI: a
 * permissive licence file sitting beside a README claiming a stricter one, where a reader cannot
 * tell from the outside which governs. A careful downstream user applying RNAWiki's own published
 * standard to RNAWiki would have declined to use this dataset, and would have been right to. The
 * legal text is what was actually granted, so the legal text wins.
 *
 * The identifier for the copyleft variant is deliberately absent from this whole file. The audit
 * harness in `scripts/audit/denial-corpus/measure.ts` pattern-matches this file for a licence
 * identifier and cannot tell a historical mention from a live declaration, so naming it even in a
 * comment would report the exporter as declaring it. The history lives in
 * `docs/data-licensing-policy.md`; `tests/unit/data-licence-consistency.test.ts` reads the real
 * files from disk and fails if these declarations ever drift apart again.
 */
const CORE_DATASET_LICENCE = 'CC BY 4.0 — see LICENSE-DATA'

/** Internal plumbing plus the superseded medicine-wide verdict, which has no safe public scope. */
const OMITTED_PUBLIC_FIELDS = new Set([
  'searchVector',
  'viewCount',
  'lastEditedBy',
  'lastEditedAt',
  'oneSentenceVerdict',
])

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
    programmes: number
    currentProgrammePublications: number
  }
  files: Array<{ path: string; rows: number; bytes: number; sha256: string }>
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

async function main(): Promise<void> {
  console.log('[export] reading the corpus…')

  // The normalized projection loader uses one corpus query plus one fixed-size bulk snapshot
  // stage. It never performs a programme, publication, claim, or snapshot query per medicine.
  const [drugRows, aliasRows, publicProjections] = await Promise.all([
    db.select().from(drugs).orderBy(asc(drugs.slug)),
    db
      .select({ drugId: drugAliases.drugId, alias: drugAliases.alias, kind: drugAliases.kind })
      .from(drugAliases)
      .orderBy(asc(drugAliases.drugId), asc(drugAliases.alias)),
    getPublicMedicineProjections(),
  ])
  const rows = (drugRows as unknown as DrugRow[]).filter(
    (row) => !isPlaceholderMedicineIdentity({ slug: row.slug, name: row.name }),
  )
  const publicDrugIds = new Set(rows.map((row) => row.id))
  const publicAliasRows = aliasRows.filter((row) => publicDrugIds.has(row.drugId))

  const publicLabelFields = new Map(
    rows.map((row) => {
      const cleaned = cleanPublicLabelFields({
        medicineSlug: row.slug,
        indication: row.indication,
        patientFriendlyIndication: row.patientFriendlyIndication,
      })
      // Re-extract only when the stored short phrase was rejected as a negated limitation. This
      // repairs older ingests without replacing an empty or human-edited field with new prose.
      const repairedPatientFriendlyIndication =
        !cleaned.patientFriendlyIndication && row.patientFriendlyIndication.trim()
          ? extractPatientFriendlyIndication(cleaned.indication)
          : cleaned.patientFriendlyIndication
      return [
        row.slug,
        { ...cleaned, patientFriendlyIndication: repairedPatientFriendlyIndication },
      ] as const
    }),
  )

  const aliasesByDrug = new Map<string, Array<{ alias: string; kind: string }>>()
  for (const row of publicAliasRows) {
    const list = aliasesByDrug.get(row.drugId) ?? []
    list.push({ alias: row.alias, kind: row.kind })
    aliasesByDrug.set(row.drugId, list)
  }

  console.log(
    `[export] ${rows.length.toLocaleString()} records, ${publicAliasRows.length.toLocaleString()} aliases`,
  )

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
    aliases: publicAliasRows.length,
    programmes: rows.reduce(
      (total, row) => total + (publicProjections.get(row.slug)?.programmes.length ?? 0),
      0,
    ),
    currentProgrammePublications: rows.reduce(
      (total, row) =>
        total +
        (publicProjections
          .get(row.slug)
          ?.programmes.filter((programme) => programme.currentPublication !== null).length ?? 0),
      0,
    ),
  }

  const projectionFor = (row: DrugRow): PublicMedicineProjection =>
    publicProjections.get(row.slug) ??
    buildLegacyMedicineProjection({
      medicineSlug: row.slug,
      patientFriendlyIndication: publicLabelFields.get(row.slug)?.patientFriendlyIndication ?? '',
      indication: publicLabelFields.get(row.slug)?.indication ?? '',
    })

  for (let shard = 0; shard * SHARD_SIZE < rows.length; shard += 1) {
    const slice = rows.slice(shard * SHARD_SIZE, (shard + 1) * SHARD_SIZE)
    const lines: string[] = []

    for (const row of slice) {
      const labelFields = publicLabelFields.get(row.slug) ?? {
        indication: '',
        patientFriendlyIndication: '',
      }
      const dossier = { ...rowToDossier(row), ...labelFields }
      if (row.dossierDepth === 'flagship') counts.flagship += 1
      else if (row.dossierDepth === 'curated') counts.curated += 1
      else counts.stub += 1
      if (dossier.molecularSchema?.smilesString) counts.withStructure += 1
      if (dossier.trials.length > 0) counts.withTrials += 1
      if (dossier.pricing) counts.withPrice += 1
      if (row.isMachineVerifiedStructure) counts.machineVerified += 1

      const publicPayload = serializePublicDossier(dossier)
      const programmeEvidence = toPublicDatasetProgrammeEvidence(projectionFor(row))
      const record: Record<string, unknown> = {
        ...publicPayload.drug,
        access: publicPayload.access,
        programmeEvidence,
      }
      for (const field of OMITTED_PUBLIC_FIELDS) delete record[field]
      record.aliases = aliasesByDrug.get(row.id) ?? []
      record.url = `https://rnawiki.com/d/${row.slug}`

      // One object per line, keys sorted, so a diff between two exports shows what actually
      // changed rather than a reshuffle of key order.
      lines.push(stableJsonStringify(removeEmptyObjectShells(record)))
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
    console.log(
      `[export] ${name} · ${slice.length} rows · ${(Buffer.byteLength(body) / 1e6).toFixed(1)} MB`,
    )
  }

  // A flat CSV of the columns most people want, for anyone who would rather open a spreadsheet
  // than parse newline-delimited JSON.
  const csvHeader = [
    'slug',
    'name',
    'trade_name',
    'sponsor',
    'modality',
    'approval_status',
    'approval_year',
    'target_gene',
    'patient_friendly_indication',
    'dossier_depth',
    'machine_verified',
    'smiles',
    'chemical_formula',
    'trial_count',
    'selected_programme_slug',
    'current_publication_revision_id',
    'current_publication_revision_number',
    'current_publication_input_digest',
    'current_publication_source_snapshot_ids',
    'url',
  ]
  const csvEscape = (value: unknown): string => {
    const text = value === null || value === undefined ? '' : String(value)
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const csvLines = [csvHeader.join(',')]
  for (const row of rows) {
    const labelFields = publicLabelFields.get(row.slug) ?? {
      indication: '',
      patientFriendlyIndication: '',
    }
    const dossier = { ...rowToDossier(row), ...labelFields }
    const projection = projectionFor(row)
    const selectedBinding = projection.cardSummary.binding
    const selectedProgramme =
      selectedBinding.type === 'medicine_identity'
        ? (projection.programmes[0] ?? null)
        : (projection.programmes.find(
            (programme) => programme.id === selectedBinding.programmeId,
          ) ?? null)
    const publication = selectedProgramme?.currentPublication ?? null
    csvLines.push(
      [
        row.slug,
        row.name,
        row.tradeName,
        row.sponsor,
        row.modality,
        row.approvalStatus,
        row.approvalYear,
        row.targetGene,
        labelFields.patientFriendlyIndication,
        row.dossierDepth,
        row.isMachineVerifiedStructure,
        dossier.molecularSchema?.smilesString,
        dossier.molecularSchema?.chemicalFormula,
        dossier.trials.length,
        selectedProgramme?.slug,
        publication?.verdictRevisionId,
        publication?.revisionNumber,
        publication?.inputDigest,
        publication?.sourceSnapshotIds.join(';'),
        `https://rnawiki.com/d/${row.slug}`,
      ]
        .map(csvEscape)
        .join(','),
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
    licence: CORE_DATASET_LICENCE,
    counts,
    files,
  }
  writeFileSync(join(EXPORT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0)
  console.log(`\n[export] done · ${files.length} files · ${(totalBytes / 1e6).toFixed(1)} MB`)
  console.log(
    `[export] ${counts.flagship} flagship · ${counts.curated} curated · ${counts.stub} stub · ` +
      `${counts.programmes} programmes · ${counts.currentProgrammePublications} current publications · ` +
      `${counts.machineVerified} machine-verified structures`,
  )
  process.exit(0)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
