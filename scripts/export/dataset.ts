import 'dotenv/config'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { asc } from 'drizzle-orm'
import { db } from '@/db'
import { dossierCompletionAssessments, drugAliases, drugs, inventoryResolutions } from '@/db/schema'
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
import { loadCompletionSurfaces } from '@/lib/queries/dossier-completion'
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

/**
 * Publication writes to the repository's `data/` directory. Integration tests use an explicit
 * disposable output directory so exercising the exporter can neither compare a fixture database
 * to the production-backed manifest nor replace checked-in artifacts.
 */
function exportDirectoryFromArguments(args: readonly string[]): string {
  let outputDirectory: string | undefined
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!
    if (argument === '--allow-shrinkage') continue
    if (argument !== '--output-dir') throw new TypeError(`Unknown export argument: ${argument}`)
    const value = args[index + 1]
    if (!value?.trim()) throw new TypeError('--output-dir requires a path.')
    if (outputDirectory) throw new TypeError('--output-dir may be provided only once.')
    outputDirectory = resolve(process.cwd(), value)
    index += 1
  }
  return outputDirectory ?? join(process.cwd(), 'data')
}

const EXPORT_DIR = exportDirectoryFromArguments(process.argv.slice(2))
const DRUGS_DIR = join(EXPORT_DIR, 'drugs')

/**
 * The completion corpus is sharded exactly like the medicine corpus, for the same reason: one line
 * per canonical record carrying every applicable section, its basis sentence and its source refs
 * reaches roughly 10 KB, so a single file passes 100 MB at this corpus size and GitHub refuses to
 * store it. A reader streams `dossier-completion/*.ndjson` the same way they already stream
 * `drugs/*.ndjson`, and every shard stays small enough to download, diff and review on its own.
 */
const COMPLETION_DIR = join(EXPORT_DIR, 'dossier-completion')

/** The pre-shard single-file path, removed on export so a stale copy cannot be served or committed. */
const LEGACY_COMPLETION_FILE = join(EXPORT_DIR, 'dossier-completion.ndjson')

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

/** The previously published record count, or null when nothing has been published yet. */
function previouslyPublishedTotal(): number | null {
  const manifestPath = join(EXPORT_DIR, 'manifest.json')
  if (!existsSync(manifestPath)) return null
  try {
    const total = JSON.parse(readFileSync(manifestPath, 'utf8'))?.counts?.total
    if (!Number.isSafeInteger(total) || total < 1) {
      throw new Error('counts.total is not a positive safe integer')
    }
    return total
  } catch (error) {
    throw new Error(
      `Refusing to replace an unreadable prior manifest at ${manifestPath}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

function assertCorpusDidNotShrink(rowCount: number): void {
  const previous = previouslyPublishedTotal()
  if (previous === null) return

  if (rowCount >= previous) return

  if (process.argv.includes('--allow-shrinkage')) {
    console.warn(
      `[export] WARNING: publishing ${rowCount} records, down from ${previous}. Allowed by --allow-shrinkage.`,
    )
    return
  }

  throw new Error(
    `Refusing to publish a shrunken corpus: ${rowCount} records, down from ${previous}. ` +
      `Even one silently missing medicine is forbidden: a partial read and a genuine withdrawal ` +
      `look identical once written, so this stops before overwriting the published dataset. ` +
      `Check the database and the export role's grants. If the loss is real, re-run with --allow-shrinkage.`,
  )
}

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
    /** Original records that answer at their own address. */
    canonicalEntities: number
    /** Original records that redirect to the canonical record for the same entity. */
    redirectedIdentities: number
    /** Original records that never identified a medicine and are withdrawn with a reason. */
    goneIdentities: number
    completeDossiers: number
    incompleteDossiers: number
  }
  files: Array<{
    path: string
    rows: number
    bytes: number
    sha256: string
    /** Bumped when a file's shape changes, so a consumer can tell a reshape from new rows. */
    schemaVersion: string
    mediaType: string
    licence: string
    description: string
    limitations: string
  }>
}

type CoreManifest = Omit<Manifest, 'generatedAt'>

const DERIVED_MANIFEST_COUNT_KEYS = ['agentRuns', 'agentCandidates', 'agentFindings'] as const
const DERIVED_MANIFEST_FILE = 'data/agents/current/manifest.json'

/**
 * Every key of `counts` is core metadata this exporter owns, so the five identity and completion
 * counts added above are compared like the rest. Only the derived-agent keys named here may appear
 * in a published manifest without being written by this file.
 *
 * A published manifest may also contain the derived-agent attachment added after the corpus commit.
 * Compare only the core fields this exporter owns. When those are byte-for-byte equivalent, keeping
 * the prior manifest preserves both its truthful generation time and its still-valid derived links.
 */
function priorManifestHasSameCore(prior: unknown, next: CoreManifest): boolean {
  if (!prior || typeof prior !== 'object' || Array.isArray(prior)) return false
  const record = prior as Record<string, unknown>
  const allowedTopLevelKeys = new Set(['generatedAt', 'source', 'licence', 'counts', 'files'])
  if (Object.keys(record).some((key) => !allowedTopLevelKeys.has(key))) return false
  if (typeof record.generatedAt !== 'string' || !record.generatedAt.trim()) return false
  if (!record.counts || typeof record.counts !== 'object' || Array.isArray(record.counts))
    return false
  if (!Array.isArray(record.files)) return false

  const priorCounts = record.counts as Record<string, unknown>
  const coreCountKeys = new Set(Object.keys(next.counts))
  const derivedCountKeys = new Set<string>(DERIVED_MANIFEST_COUNT_KEYS)
  if (
    Object.keys(priorCounts).some((key) => !coreCountKeys.has(key) && !derivedCountKeys.has(key))
  ) {
    return false
  }
  const presentDerivedCountKeys = DERIVED_MANIFEST_COUNT_KEYS.filter(
    (key) => priorCounts[key] !== undefined,
  )
  if (
    presentDerivedCountKeys.some(
      (key) => !Number.isSafeInteger(priorCounts[key]) || Number(priorCounts[key]) < 0,
    )
  ) {
    return false
  }
  const coreCounts = Object.fromEntries(
    Object.keys(next.counts).map((key) => [key, priorCounts[key]]),
  )
  const corePaths = new Set(next.files.map((file) => file.path))
  const coreFiles: Manifest['files'] = []
  let derivedFileCount = 0
  for (const file of record.files) {
    if (!file || typeof file !== 'object' || Array.isArray(file)) return false
    const path = (file as { path?: unknown }).path
    if (typeof path !== 'string') return false
    if (corePaths.has(path)) coreFiles.push(file as Manifest['files'][number])
    else if (path === DERIVED_MANIFEST_FILE) derivedFileCount += 1
    else return false
  }
  const hasAnyDerivedCounts = presentDerivedCountKeys.length > 0
  const hasCompleteDerivedCounts =
    presentDerivedCountKeys.length === DERIVED_MANIFEST_COUNT_KEYS.length
  if (
    (hasAnyDerivedCounts && !hasCompleteDerivedCounts) ||
    derivedFileCount > 1 ||
    (derivedFileCount === 1) !== hasCompleteDerivedCounts
  ) {
    return false
  }

  return (
    stableJsonStringify({
      source: record.source,
      licence: record.licence,
      counts: coreCounts,
      files: coreFiles,
    }) === stableJsonStringify(next)
  )
}

/** Metadata every artifact carries, so a downloader never has to guess what a file is. */
const FILE_META = {
  drugsNdjson: {
    schemaVersion: 'drugs/2',
    mediaType: 'application/x-ndjson',
    licence: CORE_DATASET_LICENCE,
    description:
      'Legacy medicine-wide records in the snapshot shape, each carrying its identity resolution and a compact summary of its dossier completion assessment.',
    limitations:
      'Object-valued fields can be absent on a repaired snapshot. An empty field means no recorded value, never zero or none. A record that resolves to another address is still published here, with the address it resolves to, so a reader who held the old identifier can follow it. dossierCompletion carries one state per applicable section and no basis sentence or source ref; the full assessment is in data/dossier-completion/. A completion state describes the sources RNAWiki read for that section, never the medicine.',
  },
  drugsCsv: {
    schemaVersion: 'drugs-csv/1',
    mediaType: 'text/csv',
    licence: CORE_DATASET_LICENCE,
    description: 'Flat identity, regulatory, structure and URL columns.',
    limitations:
      'Deliberately flatter than the NDJSON. Use the NDJSON when you need nested detail.',
  },
  recordedBackground: {
    schemaVersion: 'recorded-background/2',
    mediaType: 'application/x-ndjson',
    licence: CORE_DATASET_LICENCE,
    description:
      'The source-bound recorded-background corpus, including complete cross-source reading groups, explicit structured-context status, and source excerpts.',
    limitations:
      'A source count is not a count of independent experiments. Consensus population/formulation context is explicitly unknown until structurally extracted, so distinct readings are not source conflicts. An absent module means only that this corpus does not fill it.',
  },
  inventoryResolution: {
    schemaVersion: 'inventory-resolution/1',
    mediaType: 'application/x-ndjson',
    licence: CORE_DATASET_LICENCE,
    description:
      'One identity resolution for every original medicine record, with the class rule that fired, the kinds of registry identifier recorded on the row, and the exact evidence behind a non-canonical outcome.',
    limitations:
      'A resolution states which public address a stored record answers at. It is not a medical statement and it is not a quality ranking. A registry identifier held by more than one record is published as a warning code only; the other records are never named. resolutionEvidence can name the record a duplicate resolves to, because both describe one entity.',
  },
  dossierCompletion: {
    schemaVersion: 'dossier-completion/1',
    mediaType: 'application/x-ndjson',
    licence: CORE_DATASET_LICENCE,
    description:
      'One completion assessment per canonical entity: every section that applies to the record, the state it reached, what that state rests on, and the exact sources read.',
    limitations:
      'A section state describes the sources RNAWiki read, never the medicine. "Searched; no qualifying record found" and "not measured in the recorded sources" are statements about this corpus and its dated searches. A record that resolves to another address carries no separate assessment row; read the row for the record it resolves to.',
  },
  sourceConsensus: {
    schemaVersion: 'source-consensus/2',
    mediaType: 'application/x-ndjson',
    licence: CORE_DATASET_LICENCE,
    description:
      'Complete cross-source readings per field, including printed value, unit, explicit structured-context status, comparison reasons, and every represented source record.',
    limitations:
      'Current label parsing does not structurally extract population or formulation context. Distinct otherwise-comparable readings are therefore insufficient_context, never differ; agree may mean printed-reading agreement only. Source records are complete but are not independent-experiment counts.',
  },
} as const

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

/**
 * What a medicine row says about completion.
 *
 * WHY THE MEDICINE ROW CARRIES A SUMMARY RATHER THAN THE ASSESSMENT. Embedding the whole
 * assessment — twenty sections, each with a basis sentence, its reader-facing labels and its source
 * refs — more than doubled `data/drugs/`, from about 110 MB to 234 MB, to restate bytes the
 * completion corpus already publishes in full. The medicine row keeps the part a reader of the
 * medicine files actually needs to answer "which sections have reached a state": the status, the
 * two counts, the resolver, the date the inputs last moved, and one state per applicable section.
 * The basis sentence, the counts behind it and the exact sources read live in
 * `data/dossier-completion/`, keyed by the same slug.
 */
function compactCompletionSummary(assessment: {
  status: string
  resolverVersion: string
  contentChangedAt: string
  applicableSectionCount: number
  terminalSectionCount: number
  sections: ReadonlyArray<{ id: string; state: string }>
}): Record<string, unknown> {
  return {
    status: assessment.status,
    contentChangedAt: assessment.contentChangedAt,
    resolverVersion: assessment.resolverVersion,
    applicableSectionCount: assessment.applicableSectionCount,
    terminalSectionCount: assessment.terminalSectionCount,
    sectionStates: Object.fromEntries(
      assessment.sections.map((section) => [section.id, section.state]),
    ),
  }
}

async function main(): Promise<void> {
  console.log('[export] reading the corpus…')

  // The normalized projection loader uses one corpus query plus one fixed-size bulk snapshot
  // stage. It never performs a programme, publication, claim, or snapshot query per medicine.
  const [
    drugRows,
    aliasRows,
    publicProjections,
    completionSurfaces,
    resolutionRows,
    assessmentRows,
  ] = await Promise.all([
    db.select().from(drugs).orderBy(asc(drugs.slug)),
    db
      .select({ drugId: drugAliases.drugId, alias: drugAliases.alias, kind: drugAliases.kind })
      .from(drugAliases)
      .orderBy(asc(drugAliases.drugId), asc(drugAliases.alias)),
    getPublicMedicineProjections(),
    // The reader-facing subset attached to every medicine row.
    loadCompletionSurfaces(),
    // The stored rows behind the two identity and completion artifacts. They carry fields the
    // reader-facing subset deliberately drops, such as the rule that fired and the basis kind.
    db.select().from(inventoryResolutions),
    db.select().from(dossierCompletionAssessments),
  ])
  const inventoryRecords = drugRows as unknown as DrugRow[]
  const rows = inventoryRecords.filter(
    (row) => !isPlaceholderMedicineIdentity({ slug: row.slug, name: row.name }),
  )
  /*
   * Identity for the resolution artifact comes from the whole `drugs` table, not from the public
   * subset. A placeholder row is not published as a medicine, but the record that it is a
   * placeholder — and that its address is gone — is exactly what the inventory artifact is for.
   */
  const identityByRecordId = new Map(
    inventoryRecords.map((row) => [row.id, { slug: row.slug, name: row.name }] as const),
  )
  // Check before the first destructive filesystem call below, while the previous manifest still
  // describes what is published.
  assertCorpusDidNotShrink(rows.length)

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
  rmSync(COMPLETION_DIR, { recursive: true, force: true })
  mkdirSync(COMPLETION_DIR, { recursive: true })
  rmSync(LEGACY_COMPLETION_FILE, { force: true })

  /*
   * The identity and completion artifacts, built before the shards so their counts can be declared
   * in the same manifest. Every row is a statement about a record, never about a medicine.
   */
  const canonicalRecords = new Map<string, { slug: string; name: string; entityClass: string }>()
  const resolutionLines: Array<{ originalSlug: string; line: string }> = []
  const resolutionStatusCounts = new Map<string, number>()

  for (const resolution of resolutionRows) {
    const identity = identityByRecordId.get(resolution.drugId)
    if (!identity) continue
    resolutionStatusCounts.set(
      resolution.resolutionStatus,
      (resolutionStatusCounts.get(resolution.resolutionStatus) ?? 0) + 1,
    )
    if (resolution.resolutionStatus === 'CANONICAL_ENTITY') {
      canonicalRecords.set(resolution.drugId, {
        slug: identity.slug,
        name: identity.name,
        entityClass: resolution.entityClass,
      })
    }
    resolutionLines.push({
      originalSlug: identity.slug,
      line: stableJsonStringify({
        originalRecordId: resolution.drugId,
        originalSlug: identity.slug,
        originalName: identity.name,
        entityClass: resolution.entityClass,
        entityClassRule: resolution.entityClassRule,
        resolutionStatus: resolution.resolutionStatus,
        canonicalSlug: resolution.canonicalSlug,
        redirectTargetSlug: resolution.redirectTargetSlug,
        identityConfidence: resolution.identityConfidence,
        // Kinds only. Publishing the identifier values here would restate the registry columns
        // already carried on the medicine row.
        identitySourceKinds: [
          ...new Set(resolution.identitySources.map((source) => source.kind)),
        ].sort(),
        // Codes only. A warning's `relatedSlugs` name other records on the strength of a shared
        // registry identifier, which is not merge evidence, so they never leave the database.
        attributionWarningCodes: [
          ...new Set(resolution.attributionWarnings.map((warning) => warning.code)),
        ].sort(),
        resolutionEvidence: resolution.resolutionEvidence,
        contentDigest: resolution.contentDigest,
        resolverVersion: resolution.resolverVersion,
      }),
    })
  }
  resolutionLines.sort((left, right) => left.originalSlug.localeCompare(right.originalSlug))

  const completionLines: Array<{ slug: string; line: string }> = []
  let completeDossiers = 0
  let incompleteDossiers = 0

  for (const assessment of assessmentRows) {
    const canonical = canonicalRecords.get(assessment.drugId)
    // A record that resolves elsewhere has no address of its own to describe.
    if (!canonical) continue
    if (assessment.status === 'COMPLETE') completeDossiers += 1
    else incompleteDossiers += 1
    completionLines.push({
      slug: canonical.slug,
      line: stableJsonStringify({
        slug: canonical.slug,
        name: canonical.name,
        entityClass: canonical.entityClass,
        status: assessment.status,
        resolverVersion: assessment.resolverVersion,
        inputDigest: assessment.inputDigest,
        contentChangedAt: new Date(assessment.contentChangedAt).toISOString(),
        applicableSectionCount: assessment.applicableSectionCount,
        terminalSectionCount: assessment.terminalSectionCount,
        nonTerminalSectionIds: assessment.nonTerminalSectionIds,
        humanReadSuggestedSectionIds: assessment.humanReadSuggestedSectionIds,
        sections: assessment.sections.map((section) => ({
          sectionId: section.sectionId,
          state: section.state,
          basisKind: section.basisKind,
          basis: section.basis,
          ...(section.counts ? { counts: section.counts } : {}),
          sourceRefs: section.sourceRefs,
        })),
      }),
    })
  }
  completionLines.sort((left, right) => left.slug.localeCompare(right.slug))

  const resolutionCountFor = (...states: readonly string[]): number =>
    states.reduce((total, state) => total + (resolutionStatusCounts.get(state) ?? 0), 0)

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
    canonicalEntities: resolutionCountFor('CANONICAL_ENTITY'),
    redirectedIdentities: resolutionCountFor(
      'DUPLICATE_OF_CANONICAL_ENTITY',
      'ALIAS_OF_CANONICAL_ENTITY',
      'HISTORICAL_REDIRECT',
    ),
    goneIdentities: resolutionCountFor('INVALID_IDENTITY_GONE'),
    completeDossiers,
    incompleteDossiers,
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

      // Both are absent, rather than empty, on a record the resolver has not reached yet. An
      // absent field says nothing was recorded; a present one names no other record. The identity
      // subset is the one the page shows; completion is summarized to one state per section.
      const resolution = completionSurfaces.resolutions.get(row.id)
      if (resolution) record.inventoryResolution = resolution
      const completion = completionSurfaces.assessments.get(row.id)
      if (completion) record.dossierCompletion = compactCompletionSummary(completion)

      // One object per line, keys sorted, so a diff between two exports shows what actually
      // changed rather than a reshuffle of key order.
      lines.push(stableJsonStringify(removeEmptyObjectShells(record)))
    }

    const name = `drugs-${String(shard + 1).padStart(3, '0')}.ndjson`
    const body = `${lines.join('\n')}\n`
    writeFileSync(join(DRUGS_DIR, name), body)
    files.push({
      ...FILE_META.drugsNdjson,
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
    ...FILE_META.drugsCsv,
    path: 'data/drugs.csv',
    rows: rows.length,
    bytes: Buffer.byteLength(csvBody),
    sha256: sha256(csvBody),
  })

  /*
   * The recorded-background corpus, which is the asset this project actually has and which was
   * absent from every bulk artifact it published. Until now the only way to get it was one row at a
   * time through a rate-limited API.
   *
   * Emitted as its own NDJSON rather than folded into the drugs rows, because the envelope is deep
   * and nesting it would make the flat file unreadable for the consumers who only want identity.
   * Nothing is reshaped on the way out: what is written is the stored envelope, so every value
   * arrives with the exact fetched sentence it was read from, its population context, its source
   * identity and its retrieval date.
   */
  const backgroundLines: string[] = []
  const consensusLines: Array<{ slug: string; field: string; line: string }> = []
  let backgroundRows = 0
  let consensusRows = 0
  const comparisonStateCounts = new Map<string, number>()

  for (const row of rows) {
    const background = row.recordedBackground
    if (!background) continue
    backgroundRows += 1
    backgroundLines.push(
      stableJsonStringify({
        id: row.id,
        slug: row.slug,
        name: row.name,
        provenanceTier: background.provenanceTier ?? 'curated',
        parserVersion: background.version,
        recordedBackground: background,
        url: `https://rnawiki.com/d/${row.slug}`,
      }),
    )

    for (const field of background.sourceConsensus?.fields ?? []) {
      consensusRows += 1
      const state = field.comparisonState ?? 'not_classified'
      comparisonStateCounts.set(state, (comparisonStateCounts.get(state) ?? 0) + 1)
      consensusLines.push({
        slug: row.slug,
        field: field.field,
        line: stableJsonStringify({
          slug: row.slug,
          field: field.field,
          documentsExamined: background.sourceConsensus?.documentsExamined ?? 0,
          sourceCount: field.sourceCount,
          agreementRate: field.agreementRate,
          comparisonState: field.comparisonState,
          comparisonReasons: field.comparisonReasons,
          readings: field.readings,
        }),
      })
    }
  }

  if (backgroundRows === 0) {
    // A successful export carrying none of the corpus is a failure wearing a green exit code.
    throw new Error(
      '[export] no recorded-background rows found. Refusing to publish an export without the corpus.',
    )
  }

  const backgroundBody = `${backgroundLines.join('\n')}\n`
  writeFileSync(join(EXPORT_DIR, 'recorded-background.ndjson'), backgroundBody)
  files.push({
    ...FILE_META.recordedBackground,
    path: 'data/recorded-background.ndjson',
    rows: backgroundRows,
    bytes: Buffer.byteLength(backgroundBody),
    sha256: sha256(backgroundBody),
  })

  consensusLines.sort(
    (left, right) => left.slug.localeCompare(right.slug) || left.field.localeCompare(right.field),
  )
  const consensusBody = `${consensusLines.map(({ line }) => line).join('\n')}\n`
  writeFileSync(join(EXPORT_DIR, 'source-consensus.ndjson'), consensusBody)
  files.push({
    ...FILE_META.sourceConsensus,
    path: 'data/source-consensus.ndjson',
    rows: consensusRows,
    bytes: Buffer.byteLength(consensusBody),
    sha256: sha256(consensusBody),
  })

  console.log(
    `[export] recorded background ${backgroundRows} row(s) · consensus ${consensusRows} field(s) · states ${JSON.stringify(Object.fromEntries([...comparisonStateCounts.entries()].sort()))}`,
  )

  const resolutionBody =
    resolutionLines.length > 0 ? `${resolutionLines.map(({ line }) => line).join('\n')}\n` : ''
  writeFileSync(join(EXPORT_DIR, 'inventory-resolution.ndjson'), resolutionBody)
  files.push({
    ...FILE_META.inventoryResolution,
    path: 'data/inventory-resolution.ndjson',
    rows: resolutionLines.length,
    bytes: Buffer.byteLength(resolutionBody),
    sha256: sha256(resolutionBody),
  })

  /*
   * One shard per thousand assessments, named and counted exactly like the medicine shards. An
   * export that produced no assessment still writes shard 001, empty, so the published layout is
   * the same shape whether or not the resolver has reached anything yet.
   */
  const completionShardCount = Math.max(1, Math.ceil(completionLines.length / SHARD_SIZE))
  for (let shard = 0; shard < completionShardCount; shard += 1) {
    const slice = completionLines.slice(shard * SHARD_SIZE, (shard + 1) * SHARD_SIZE)
    const name = `dossier-completion-${String(shard + 1).padStart(3, '0')}.ndjson`
    const body = slice.length > 0 ? `${slice.map(({ line }) => line).join('\n')}\n` : ''
    writeFileSync(join(COMPLETION_DIR, name), body)
    files.push({
      ...FILE_META.dossierCompletion,
      path: `data/dossier-completion/${name}`,
      rows: slice.length,
      bytes: Buffer.byteLength(body),
      sha256: sha256(body),
    })
    console.log(
      `[export] ${name} · ${slice.length} rows · ${(Buffer.byteLength(body) / 1e6).toFixed(1)} MB`,
    )
  }

  console.log(
    `[export] identity ${resolutionLines.length} row(s) · ${JSON.stringify(Object.fromEntries([...resolutionStatusCounts.entries()].sort()))} · ` +
      `completion ${completionLines.length} row(s) · ${completeDossiers} complete · ${incompleteDossiers} incomplete`,
  )

  const coreManifest: CoreManifest = {
    source: 'https://rnawiki.com',
    licence: CORE_DATASET_LICENCE,
    counts,
    files,
  }
  const manifestPath = join(EXPORT_DIR, 'manifest.json')
  const priorManifest = existsSync(manifestPath)
    ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown)
    : null
  if (priorManifestHasSameCore(priorManifest, coreManifest)) {
    console.log('[export] core corpus unchanged; preserving the published manifest byte-for-byte')
  } else {
    const manifest: Manifest = { generatedAt: new Date().toISOString(), ...coreManifest }
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  }

  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0)
  // The largest file is reported on every run because a single artifact over 100 MB is refused by
  // the host and would fail the publication after the export appears to have succeeded.
  // `scripts/check/dataset-export.ts` enforces the bound.
  const largest = [...files].sort((left, right) => right.bytes - left.bytes)[0]
  console.log(`\n[export] done · ${files.length} files · ${(totalBytes / 1e6).toFixed(1)} MB`)
  if (largest) {
    console.log(`[export] largest file ${largest.path} · ${(largest.bytes / 1e6).toFixed(1)} MB`)
  }
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
