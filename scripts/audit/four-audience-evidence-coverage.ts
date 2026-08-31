/**
 * Deterministic coverage audit for the four-audience evidence contract.
 *
 * This measures source-bound evidence eligibility, not the number of fixed question-registry rows.
 * Every record receives every ordinary-reader question, including an explicit non-answer, so using
 * registry rows as the numerator would turn navigation completeness into false clinical coverage.
 *
 * Usage:
 *   node --import tsx scripts/audit/four-audience-evidence-coverage.ts --write
 *   node --import tsx scripts/audit/four-audience-evidence-coverage.ts --check
 */

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { format } from 'prettier'

import { BACKGROUND_SOURCE_KINDS } from '@/lib/background/types'
import type { BackgroundSource, MedicineRecordedBackground } from '@/lib/background/types'
import { buildQuestionIssueIndex, type StaleSourceSummary } from '@/lib/dossier-question-issues'
import { stableJsonStringify } from '@/lib/stable-json'

const CONTRACT_SCHEMA = 'four-audience-evidence-contract/v1' as const
const REPORT_SCHEMA = 'four-audience-evidence-coverage/v1' as const
const SOURCE_KINDS = new Set<string>(BACKGROUND_SOURCE_KINDS)
const PRINTED_NUMBER = /[-+]?\d(?:[\d,.]*\d)?/u

export const ORDINARY_QUESTION_IDS = [
  'purpose',
  'people-result',
  'result-magnitude',
  'harm-or-limitation',
  'applicability',
  'unknown-conflicting-stale',
] as const
export type OrdinaryQuestionId = (typeof ORDINARY_QUESTION_IDS)[number]

interface ContractQuestion {
  id: OrdinaryQuestionId
  prompt: string
  questionIntents: string[]
  eligibilityRule: string
}

interface FourAudienceContract {
  schema: typeof CONTRACT_SCHEMA
  canonicalRecord: 'MedicineDossierViewModel'
  ordinaryQuestions: ContractQuestion[]
}

interface RecordedBackgroundRow {
  slug: string
  name: string
  recordedBackground: MedicineRecordedBackground
}

interface SourceConsensusRow {
  slug: string
  field: string
  comparisonState?: 'agree' | 'differ' | 'not_comparable' | 'insufficient_context'
  comparisonReasons?: string[]
  readings: Array<{
    display: string
    sourceCount?: number
    sources: Array<{
      label: string
      identifier: string
      retrievedAt: string
      excerpt?: string
    }>
  }>
}

interface Manifest {
  generatedAt: string
  counts: {
    total: number
    currentProgrammePublications: number
  }
  files: Array<{ path: string; rows: number; sha256: string }>
}

interface BackgroundMeasurements {
  slugs: Set<string>
  eligible: Record<OrdinaryQuestionId, Set<string>>
  sourceBoundMolecularIdentity: Set<string>
  sourceBoundMechanism: Set<string>
  sourceExcerptRecords: number
  noSourceExcerptRecords: number
  qualifyingSourceRecords: number
  noQualifyingSourceRecords: number
  pivotalResultRecords: number
  pivotalResults: number
  quantitativeUncertaintyRecords: number
  quantitativeUncertaintyResults: number
}

interface MolecularMeasurements {
  csvRowsInRecordedBackgroundCorpus: number
  smilesRecords: number
  formulaRecords: number
  legacyMolecularRecords: Set<string>
}

interface ConflictMeasurements {
  fields: number
  records: Set<string>
  comparisonStates: Record<string, number>
  unmappedDifferFields: string[]
}

interface StaleMeasurements {
  projectionRecordsObserved: number
  validBindings: number | null
  records: Set<string>
  measurementState: 'observed' | 'not_observable_in_checked_in_public_snapshot'
}

export interface FourAudienceCoverageReport {
  schema: typeof REPORT_SCHEMA
  contractSchema: typeof CONTRACT_SCHEMA
  measurementDigest: string
  generatedFrom: {
    snapshotGeneratedAt: string
    inputs: Record<string, string>
  }
  denominators: {
    publicMedicineRows: number
    recordedBackgroundRecords: number
    publicRowsOutsideRecordedBackground: number
  }
  registryBoundary: {
    ordinaryQuestions: number
    fixedRegistryPairs: number
    observedSourceBoundEligiblePairs: number
    note: string
  }
  ordinaryQuestions: Array<{
    id: OrdinaryQuestionId
    prompt: string
    questionIntents: string[]
    eligibilityRule: string
    measurementState: 'exact_for_checked_in_snapshot' | 'partial_lower_bound'
    observedEligibleRecords: number
    notEligibleRecords: number | null
    shareOfRecordedBackgroundCorpus: number
  }>
  allSixOrdinaryQuestions: {
    recordsEligibleForFirstFive: number
    observedEligibleForAllSix: number
    measurementState: 'exact_zero' | 'exact' | 'partial_lower_bound'
    note: string
  }
  chemistryIdentity: {
    sourceBoundBackgroundRecords: number
    legacyMolecularRecords: number
    legacySmilesRecords: number
    legacyFormulaRecords: number
    unionRecords: number
    shareOfRecordedBackgroundCorpus: number
  }
  biotechResearchCoverage: {
    sourceBoundRecordedUseRecords: number
    sourceBoundMechanismRecords: number
    sourceBoundPivotalResultRecords: number
    sourceBoundApplicabilityRecords: number
    recordsWithUseMechanismResultAndApplicability: number
    shareOfRecordedBackgroundCorpus: number
  }
  quantitativeUncertainty: {
    pivotalResultRecords: number
    pivotalResults: number
    recordsWithPrintedUncertainty: number
    resultsWithPrintedUncertainty: number
    shareOfPivotalResults: number
  }
  sourceConflict: {
    comparableDifferFields: number
    recordsWithComparableDifference: number
    comparisonStates: Record<string, number>
    notComparableFieldsExcluded: number
    unmappedDifferFields: string[]
  }
  staleExactBindings: {
    measurementState: StaleMeasurements['measurementState']
    projectionRecordsObserved: number
    confirmedExactBindings: number | null
    recordsWithConfirmedDrift: number | null
    note: string
  }
  sourceRead: {
    recordsWithQualifyingSourceExcerpt: number
    noSourceExcerptRead: number
    recordsWithQualifyingSourceRecorded: number
    noQualifyingSourceRecorded: number
    note: string
  }
  limitations: string[]
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function nonBlank(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function share(numerator: number, denominator: number): number {
  return denominator > 0 ? Number((numerator / denominator).toFixed(6)) : 0
}

function isQualifyingSource(value: unknown): value is BackgroundSource {
  const source = objectValue(value)
  return Boolean(
    source &&
    nonBlank(source.kind) &&
    SOURCE_KINDS.has(source.kind) &&
    nonBlank(source.identifier) &&
    nonBlank(source.label) &&
    nonBlank(source.retrievedAt),
  )
}

function sourceCoverage(background: MedicineRecordedBackground): {
  qualifyingSource: boolean
  sourceExcerpt: boolean
} {
  let qualifyingSource = false
  let sourceExcerpt = false

  function visit(value: unknown): void {
    if (isQualifyingSource(value)) {
      qualifyingSource = true
      if (nonBlank(value.excerpt)) sourceExcerpt = true
      return
    }
    if (Array.isArray(value)) {
      for (const child of value) visit(child)
      return
    }
    const record = objectValue(value)
    if (record) for (const child of Object.values(record)) visit(child)
  }

  visit(background)
  return { qualifyingSource, sourceExcerpt }
}

function sourceBoundStatement(value: unknown): boolean {
  const statement = objectValue(value)
  return Boolean(
    statement && nonBlank(statement.textAsRecorded) && isQualifyingSource(statement.source),
  )
}

function sourceBoundPivotalResult(value: unknown): boolean {
  const result = objectValue(value)
  return Boolean(
    result &&
    nonBlank(result.trialIdentifier) &&
    nonBlank(result.endpointAsRecorded) &&
    nonBlank(result.activeResultAsRecorded) &&
    nonBlank(result.timepointAsRecorded) &&
    isQualifyingSource(result.source),
  )
}

function pivotalMagnitude(value: unknown): boolean {
  if (!sourceBoundPivotalResult(value)) return false
  const result = value as Record<string, unknown>
  return [result.activeResultAsRecorded, result.differenceAsRecorded].some(
    (printed) => nonBlank(printed) && PRINTED_NUMBER.test(printed) && /[%\p{L}]/u.test(printed),
  )
}

function seriousHarm(value: MedicineRecordedBackground): boolean {
  if (sourceBoundStatement(value.safety?.boxedWarning)) return true
  return (value.safety?.contraindications ?? []).some(sourceBoundStatement)
}

function sourceBoundApplicability(value: unknown): boolean {
  const applicability = objectValue(value)
  return Boolean(
    applicability &&
    nonBlank(applicability.trialIdentifier) &&
    Array.isArray(applicability.includedAsRecorded) &&
    applicability.includedAsRecorded.some(nonBlank) &&
    isQualifyingSource(applicability.source),
  )
}

function sourceBoundMolecularIdentity(value: unknown): boolean {
  const identity = objectValue(value)
  if (!identity) return false
  for (const key of ['molecularFormula', 'molecularWeight']) {
    const recordedValue = objectValue(identity[key])
    if (
      recordedValue &&
      nonBlank(recordedValue.display) &&
      isQualifyingSource(recordedValue.source)
    ) {
      return true
    }
  }
  return false
}

function makeEligibilitySets(): Record<OrdinaryQuestionId, Set<string>> {
  return Object.fromEntries(ORDINARY_QUESTION_IDS.map((id) => [id, new Set<string>()])) as Record<
    OrdinaryQuestionId,
    Set<string>
  >
}

function parseNdjson(path: string, visit: (value: unknown) => void): void {
  const text = readFileSync(path, 'utf8')
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    visit(JSON.parse(line) as unknown)
  }
}

function measureBackground(path: string): BackgroundMeasurements {
  const measurements: BackgroundMeasurements = {
    slugs: new Set(),
    eligible: makeEligibilitySets(),
    sourceBoundMolecularIdentity: new Set(),
    sourceBoundMechanism: new Set(),
    sourceExcerptRecords: 0,
    noSourceExcerptRecords: 0,
    qualifyingSourceRecords: 0,
    noQualifyingSourceRecords: 0,
    pivotalResultRecords: 0,
    pivotalResults: 0,
    quantitativeUncertaintyRecords: 0,
    quantitativeUncertaintyResults: 0,
  }

  parseNdjson(path, (raw) => {
    const row = raw as RecordedBackgroundRow
    if (!nonBlank(row.slug) || !row.recordedBackground) {
      throw new TypeError('Recorded-background row is missing its slug or envelope.')
    }
    const { slug, recordedBackground: background } = row
    if (measurements.slugs.has(slug))
      throw new TypeError(`Duplicate recorded-background slug: ${slug}`)
    measurements.slugs.add(slug)

    const recordedUses = background.recordedUses?.statements ?? []
    if (recordedUses.some(sourceBoundStatement)) measurements.eligible.purpose.add(slug)

    if ((background.mechanism?.statements ?? []).some(sourceBoundStatement)) {
      measurements.sourceBoundMechanism.add(slug)
    }

    const pivotalResults = (background.pivotalResults ?? []).filter(sourceBoundPivotalResult)
    if (pivotalResults.length > 0) {
      measurements.eligible['people-result'].add(slug)
      measurements.pivotalResultRecords += 1
      measurements.pivotalResults += pivotalResults.length
    }
    if (pivotalResults.some(pivotalMagnitude)) {
      measurements.eligible['result-magnitude'].add(slug)
    }

    if (seriousHarm(background)) measurements.eligible['harm-or-limitation'].add(slug)
    if (sourceBoundApplicability(background.applicability)) {
      measurements.eligible.applicability.add(slug)
    }

    if (sourceBoundMolecularIdentity(background.molecularIdentity)) {
      measurements.sourceBoundMolecularIdentity.add(slug)
    }

    const uncertaintyResults = pivotalResults.filter((result) =>
      nonBlank((result as unknown as Record<string, unknown>).uncertaintyAsRecorded),
    )
    if (uncertaintyResults.length > 0) {
      measurements.quantitativeUncertaintyRecords += 1
      measurements.quantitativeUncertaintyResults += uncertaintyResults.length
    }

    const source = sourceCoverage(background)
    if (source.qualifyingSource) measurements.qualifyingSourceRecords += 1
    else measurements.noQualifyingSourceRecords += 1
    if (source.sourceExcerpt) measurements.sourceExcerptRecords += 1
    else measurements.noSourceExcerptRecords += 1
  })

  return measurements
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]!
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          cell += '"'
          index += 1
        } else quoted = false
      } else cell += character
      continue
    }
    if (character === '"') quoted = true
    else if (character === ',') {
      row.push(cell)
      cell = ''
    } else if (character === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (character !== '\r') cell += character
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  if (quoted) throw new TypeError('Unterminated quoted CSV cell.')
  return rows
}

function measureMolecularCsv(
  path: string,
  includedSlugs: ReadonlySet<string>,
): MolecularMeasurements {
  const [header, ...rows] = parseCsv(readFileSync(path, 'utf8'))
  if (!header) throw new TypeError('Public medicine CSV has no header.')
  const index = new Map(header.map((column, position) => [column, position]))
  const slugIndex = index.get('slug')
  const smilesIndex = index.get('smiles')
  const formulaIndex = index.get('chemical_formula')
  if (slugIndex === undefined || smilesIndex === undefined || formulaIndex === undefined) {
    throw new TypeError('Public medicine CSV is missing slug, smiles or chemical_formula.')
  }

  const legacyMolecularRecords = new Set<string>()
  let csvRowsInRecordedBackgroundCorpus = 0
  let smilesRecords = 0
  let formulaRecords = 0
  for (const row of rows) {
    const slug = row[slugIndex]?.trim()
    if (!slug || !includedSlugs.has(slug)) continue
    csvRowsInRecordedBackgroundCorpus += 1
    const smiles = row[smilesIndex]?.trim() ?? ''
    const formula = row[formulaIndex]?.trim() ?? ''
    if (smiles) smilesRecords += 1
    if (formula) formulaRecords += 1
    if (smiles || formula) legacyMolecularRecords.add(slug)
  }
  return {
    csvRowsInRecordedBackgroundCorpus,
    smilesRecords,
    formulaRecords,
    legacyMolecularRecords,
  }
}

function measureConflicts(path: string): ConflictMeasurements {
  const bySlug = new Map<string, SourceConsensusRow[]>()
  const comparisonStates: Record<string, number> = {
    agree: 0,
    differ: 0,
    not_comparable: 0,
    insufficient_context: 0,
    not_classified: 0,
  }
  parseNdjson(path, (raw) => {
    const row = raw as SourceConsensusRow
    if (!nonBlank(row.slug) || !nonBlank(row.field) || !Array.isArray(row.readings)) {
      throw new TypeError('Source-consensus row is incomplete.')
    }
    comparisonStates[row.comparisonState ?? 'not_classified'] =
      (comparisonStates[row.comparisonState ?? 'not_classified'] ?? 0) + 1
    const fields = bySlug.get(row.slug) ?? []
    fields.push(row)
    bySlug.set(row.slug, fields)
  })

  let fields = 0
  const records = new Set<string>()
  const unmapped = new Set<string>()
  for (const [slug, consensusFields] of bySlug) {
    const issueIndex = buildQuestionIssueIndex({ consensusFields })
    fields += issueIndex.conflicting.length
    if (issueIndex.conflicting.length > 0) records.add(slug)
    for (const field of issueIndex.unmappedFields) unmapped.add(field)
  }
  return {
    fields,
    records,
    comparisonStates,
    unmappedDifferFields: [...unmapped].sort(),
  }
}

function arrayAt(value: unknown, path: readonly string[]): unknown[] | undefined {
  let current: unknown = value
  for (const part of path) current = objectValue(current)?.[part]
  return Array.isArray(current) ? current : undefined
}

function measureStaleProjection(drugsDirectory: string): StaleMeasurements {
  const records = new Set<string>()
  const bindings = new Set<string>()
  let projectionRecordsObserved = 0
  const paths = [
    ['medicineRecord', 'background', 'driftedSources'],
    ['recordedBackground', 'driftedSources'],
    ['driftedSources'],
  ] as const

  for (const file of readdirSync(drugsDirectory)
    .filter((name) => name.endsWith('.ndjson'))
    .sort()) {
    parseNdjson(join(drugsDirectory, file), (raw) => {
      const row = objectValue(raw)
      if (!row) return
      const observed = paths.flatMap((path) => arrayAt(row, path) ?? [])
      const hasProjection = paths.some((path) => arrayAt(row, path) !== undefined)
      if (!hasProjection) return
      projectionRecordsObserved += 1
      const index = buildQuestionIssueIndex({
        driftedSources: observed as unknown as readonly StaleSourceSummary[],
      })
      if (index.stale.length > 0 && nonBlank(row.id)) records.add(row.id)
      for (const stale of index.stale) bindings.add(`${stale.bindingId}:${stale.assertionCheckId}`)
    })
  }

  if (projectionRecordsObserved === 0) {
    return {
      projectionRecordsObserved,
      validBindings: null,
      records,
      measurementState: 'not_observable_in_checked_in_public_snapshot',
    }
  }
  return {
    projectionRecordsObserved,
    validBindings: bindings.size,
    records,
    measurementState: 'observed',
  }
}

function loadContract(path: string): FourAudienceContract {
  const contract = JSON.parse(readFileSync(path, 'utf8')) as FourAudienceContract
  if (
    contract.schema !== CONTRACT_SCHEMA ||
    contract.canonicalRecord !== 'MedicineDossierViewModel'
  ) {
    throw new TypeError('Unexpected four-audience contract schema or canonical record.')
  }
  const ids = contract.ordinaryQuestions.map((question) => question.id)
  if (JSON.stringify(ids) !== JSON.stringify(ORDINARY_QUESTION_IDS)) {
    throw new TypeError(
      `Ordinary question contract must be exactly: ${ORDINARY_QUESTION_IDS.join(', ')}`,
    )
  }
  return contract
}

function intersection(sets: readonly ReadonlySet<string>[]): Set<string> {
  const [first, ...rest] = sets
  if (!first) return new Set()
  return new Set([...first].filter((value) => rest.every((set) => set.has(value))))
}

function aggregateFileDigest(paths: readonly string[]): string {
  const digest = createHash('sha256')
  for (const path of paths) digest.update(readFileSync(path))
  return digest.digest('hex')
}

export function buildFourAudienceCoverageReport(
  repoRoot: string = process.cwd(),
): FourAudienceCoverageReport {
  const contractPath = join(repoRoot, 'docs', 'product', 'four-audience-evidence-contract.json')
  const backgroundPath = join(repoRoot, 'data', 'recorded-background.ndjson')
  const consensusPath = join(repoRoot, 'data', 'source-consensus.ndjson')
  const csvPath = join(repoRoot, 'data', 'drugs.csv')
  const manifestPath = join(repoRoot, 'data', 'manifest.json')
  const drugsDirectory = join(repoRoot, 'data', 'drugs')
  for (const path of [contractPath, backgroundPath, consensusPath, csvPath, manifestPath]) {
    if (!existsSync(path)) throw new TypeError(`Required coverage input is missing: ${path}`)
  }

  const contract = loadContract(contractPath)
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest
  const background = measureBackground(backgroundPath)
  const molecular = measureMolecularCsv(csvPath, background.slugs)
  const conflicts = measureConflicts(consensusPath)
  const stale = measureStaleProjection(drugsDirectory)

  for (const slug of conflicts.records) {
    if (!background.slugs.has(slug)) {
      throw new TypeError(`Source-consensus slug is outside recorded-background corpus: ${slug}`)
    }
    background.eligible['unknown-conflicting-stale'].add(slug)
  }
  if (stale.measurementState === 'observed') {
    for (const slug of stale.records) {
      if (background.slugs.has(slug)) background.eligible['unknown-conflicting-stale'].add(slug)
    }
  }

  const recordedBackgroundRecords = background.slugs.size
  if (molecular.csvRowsInRecordedBackgroundCorpus !== recordedBackgroundRecords) {
    throw new TypeError(
      `Molecular CSV join covered ${molecular.csvRowsInRecordedBackgroundCorpus} of ${recordedBackgroundRecords} recorded-background rows.`,
    )
  }
  const firstFive = intersection(
    ORDINARY_QUESTION_IDS.slice(0, 5).map((id) => background.eligible[id]),
  )
  const allSix = intersection(ORDINARY_QUESTION_IDS.map((id) => background.eligible[id]))
  const q6Partial = stale.measurementState !== 'observed'
  const allSixState =
    firstFive.size === 0 ? 'exact_zero' : q6Partial ? 'partial_lower_bound' : 'exact'
  const observedSourceBoundEligiblePairs = ORDINARY_QUESTION_IDS.reduce(
    (total, id) => total + background.eligible[id].size,
    0,
  )
  const chemistryUnion = new Set([
    ...background.sourceBoundMolecularIdentity,
    ...molecular.legacyMolecularRecords,
  ])
  const biotechCore = intersection([
    background.eligible.purpose,
    background.sourceBoundMechanism,
    background.eligible['people-result'],
    background.eligible.applicability,
  ])

  const shardPaths = readdirSync(drugsDirectory)
    .filter((name) => name.endsWith('.ndjson'))
    .sort()
    .map((name) => join(drugsDirectory, name))
  const inputs: Record<string, string> = {
    'data/drugs.csv': sha256(readFileSync(csvPath, 'utf8')),
    'data/drugs/*.ndjson': aggregateFileDigest(shardPaths),
    'data/manifest.json': sha256(readFileSync(manifestPath, 'utf8')),
    'data/recorded-background.ndjson': sha256(readFileSync(backgroundPath, 'utf8')),
    'data/source-consensus.ndjson': sha256(readFileSync(consensusPath, 'utf8')),
    'docs/product/four-audience-evidence-contract.json': sha256(readFileSync(contractPath, 'utf8')),
  }

  const measurements = {
    denominators: {
      publicMedicineRows: manifest.counts.total,
      recordedBackgroundRecords,
      publicRowsOutsideRecordedBackground: manifest.counts.total - recordedBackgroundRecords,
    },
    registryBoundary: {
      ordinaryQuestions: ORDINARY_QUESTION_IDS.length,
      fixedRegistryPairs: recordedBackgroundRecords * ORDINARY_QUESTION_IDS.length,
      observedSourceBoundEligiblePairs,
      note: 'A fixed question entry can be an explicit non-answer. Registry pairs are never counted as clinical answers.',
    },
    ordinaryQuestions: contract.ordinaryQuestions.map((question) => {
      const observedEligibleRecords = background.eligible[question.id].size
      const partial = question.id === 'unknown-conflicting-stale' && q6Partial
      return {
        id: question.id,
        prompt: question.prompt,
        questionIntents: question.questionIntents,
        eligibilityRule: question.eligibilityRule,
        measurementState: partial
          ? ('partial_lower_bound' as const)
          : ('exact_for_checked_in_snapshot' as const),
        observedEligibleRecords,
        notEligibleRecords: partial ? null : recordedBackgroundRecords - observedEligibleRecords,
        shareOfRecordedBackgroundCorpus: share(observedEligibleRecords, recordedBackgroundRecords),
      }
    }),
    allSixOrdinaryQuestions: {
      recordsEligibleForFirstFive: firstFive.size,
      observedEligibleForAllSix: allSix.size,
      measurementState: allSixState,
      note:
        firstFive.size === 0
          ? 'No record meets the first five rules, so the all-six count is exactly zero even though runtime stale bindings are not exported.'
          : q6Partial
            ? 'This is a lower bound because exact runtime stale bindings are not exported.'
            : 'Every one of the six source-bound eligibility rules is observed.',
    },
    chemistryIdentity: {
      sourceBoundBackgroundRecords: background.sourceBoundMolecularIdentity.size,
      legacyMolecularRecords: molecular.legacyMolecularRecords.size,
      legacySmilesRecords: molecular.smilesRecords,
      legacyFormulaRecords: molecular.formulaRecords,
      unionRecords: chemistryUnion.size,
      shareOfRecordedBackgroundCorpus: share(chemistryUnion.size, recordedBackgroundRecords),
    },
    biotechResearchCoverage: {
      sourceBoundRecordedUseRecords: background.eligible.purpose.size,
      sourceBoundMechanismRecords: background.sourceBoundMechanism.size,
      sourceBoundPivotalResultRecords: background.eligible['people-result'].size,
      sourceBoundApplicabilityRecords: background.eligible.applicability.size,
      recordsWithUseMechanismResultAndApplicability: biotechCore.size,
      shareOfRecordedBackgroundCorpus: share(biotechCore.size, recordedBackgroundRecords),
    },
    quantitativeUncertainty: {
      pivotalResultRecords: background.pivotalResultRecords,
      pivotalResults: background.pivotalResults,
      recordsWithPrintedUncertainty: background.quantitativeUncertaintyRecords,
      resultsWithPrintedUncertainty: background.quantitativeUncertaintyResults,
      shareOfPivotalResults: share(
        background.quantitativeUncertaintyResults,
        background.pivotalResults,
      ),
    },
    sourceConflict: {
      comparableDifferFields: conflicts.fields,
      recordsWithComparableDifference: conflicts.records.size,
      comparisonStates: conflicts.comparisonStates,
      notComparableFieldsExcluded: conflicts.comparisonStates.not_comparable ?? 0,
      unmappedDifferFields: conflicts.unmappedDifferFields,
    },
    staleExactBindings: {
      measurementState: stale.measurementState,
      projectionRecordsObserved: stale.projectionRecordsObserved,
      confirmedExactBindings: stale.validBindings,
      recordsWithConfirmedDrift: stale.measurementState === 'observed' ? stale.records.size : null,
      note:
        stale.measurementState === 'observed'
          ? 'Only valid exact binding IDs and persisted successful assertion-check IDs are counted.'
          : 'The checked-in public snapshot does not export the runtime driftedSources projection. Absence is not reported as zero.',
    },
    sourceRead: {
      recordsWithQualifyingSourceExcerpt: background.sourceExcerptRecords,
      noSourceExcerptRead: background.noSourceExcerptRecords,
      recordsWithQualifyingSourceRecorded: background.qualifyingSourceRecords,
      noQualifyingSourceRecorded: background.noQualifyingSourceRecords,
      note: 'A qualifying source object without a quotable excerpt remains provenance, but it is not counted as a clinical source read.',
    },
    limitations: [
      'The report measures the checked-in public snapshot, not scientific knowledge outside the sources RNAWiki recorded.',
      'The source-bound eligibility counts are not claims that every eligible field is already rendered as an answered registry passage.',
      `The snapshot has ${manifest.counts.currentProgrammePublications} current programme publications; the recorded-background rules therefore provide the observable ordinary-question evidence in this run.`,
      'Question-level stale is database-backed runtime state and is not observable in this checked-in public snapshot unless driftedSources is explicitly exported.',
      'A registry pointer without a source excerpt never counts as a clinical source read.',
      'not_comparable remains separate from source conflict.',
    ],
  } satisfies Omit<
    FourAudienceCoverageReport,
    'schema' | 'contractSchema' | 'measurementDigest' | 'generatedFrom'
  >

  return {
    schema: REPORT_SCHEMA,
    contractSchema: CONTRACT_SCHEMA,
    measurementDigest: sha256(stableJsonStringify(measurements)),
    generatedFrom: {
      snapshotGeneratedAt: manifest.generatedAt,
      inputs,
    },
    ...measurements,
  }
}

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function renderFourAudienceCoverageMarkdown(report: FourAudienceCoverageReport): string {
  const ordinaryRows = report.ordinaryQuestions
    .map(
      (question) =>
        `| ${question.prompt} | ${question.questionIntents.map((intent) => `\`${intent}\``).join(', ')} | ${question.observedEligibleRecords.toLocaleString('en-US')} | ${percent(question.shareOfRecordedBackgroundCorpus)} | ${question.measurementState === 'partial_lower_bound' ? 'Lower bound' : 'Exact for snapshot'} |`,
    )
    .join('\n')
  const states = Object.entries(report.sourceConflict.comparisonStates)
    .map(([state, count]) => `| \`${state}\` | ${count.toLocaleString('en-US')} |`)
    .join('\n')
  const fixedRegistryPairs = report.registryBoundary.fixedRegistryPairs.toLocaleString('en-US')
  const recordedBackgroundRecords =
    report.denominators.recordedBackgroundRecords.toLocaleString('en-US')
  const observedEligiblePairs =
    report.registryBoundary.observedSourceBoundEligiblePairs.toLocaleString('en-US')
  const allSix = report.allSixOrdinaryQuestions.observedEligibleForAllSix.toLocaleString('en-US')
  const pivotalResults = report.quantitativeUncertainty.pivotalResults.toLocaleString('en-US')
  const pivotalResultRecords =
    report.quantitativeUncertainty.pivotalResultRecords.toLocaleString('en-US')
  const uncertaintyResults =
    report.quantitativeUncertainty.resultsWithPrintedUncertainty.toLocaleString('en-US')
  const uncertaintyRecords =
    report.quantitativeUncertainty.recordsWithPrintedUncertainty.toLocaleString('en-US')
  const conflictFields = report.sourceConflict.comparableDifferFields.toLocaleString('en-US')
  const conflictRecords =
    report.sourceConflict.recordsWithComparableDifference.toLocaleString('en-US')
  const notComparable = report.sourceConflict.notComparableFieldsExcluded.toLocaleString('en-US')
  const staleState = report.staleExactBindings.measurementState.replaceAll('_', ' ')

  return `# Four-audience evidence coverage

Generated deterministically from the checked-in public snapshot by
\`scripts/audit/four-audience-evidence-coverage.ts\`.

**Snapshot generated:** ${report.generatedFrom.snapshotGeneratedAt}

**Measurement digest:** \`${report.measurementDigest}\`

This is a source-bound evidence eligibility report. It is not an answer-rate claim. The fixed six
questions produce ${fixedRegistryPairs} registry pairs over ${recordedBackgroundRecords} records,
but a registry pair may be an explicit non-answer. Only ${observedEligiblePairs} observed pairs meet
the conservative source-bound rules below.

## Ordinary-reader questions

| Question | Canonical intent | Eligible records | Share | Measurement |
| --- | --- | ---: | ---: | --- |
${ordinaryRows}

**All six:** ${allSix} records. ${report.allSixOrdinaryQuestions.note}

## Chemistry identity

| Measure | Records |
| --- | ---: |
| Source-bound recorded-background formula or weight | ${report.chemistryIdentity.sourceBoundBackgroundRecords.toLocaleString('en-US')} |
| Legacy molecular formula or structure | ${report.chemistryIdentity.legacyMolecularRecords.toLocaleString('en-US')} |
| — with SMILES | ${report.chemistryIdentity.legacySmilesRecords.toLocaleString('en-US')} |
| — with formula | ${report.chemistryIdentity.legacyFormulaRecords.toLocaleString('en-US')} |
| Union available to the canonical dossier | ${report.chemistryIdentity.unionRecords.toLocaleString('en-US')} (${percent(report.chemistryIdentity.shareOfRecordedBackgroundCorpus)}) |

The union keeps both canonical identity paths. It does not count a name or registry identifier as a
chemical structure.

## Biotech research coverage

| Source-bound field set | Records |
| --- | ---: |
| Recorded use or studied purpose | ${report.biotechResearchCoverage.sourceBoundRecordedUseRecords.toLocaleString('en-US')} |
| Recorded mechanism statement | ${report.biotechResearchCoverage.sourceBoundMechanismRecords.toLocaleString('en-US')} |
| Pivotal endpoint and result | ${report.biotechResearchCoverage.sourceBoundPivotalResultRecords.toLocaleString('en-US')} |
| Study applicability and population | ${report.biotechResearchCoverage.sourceBoundApplicabilityRecords.toLocaleString('en-US')} |
| All four conservative core sets | ${report.biotechResearchCoverage.recordsWithUseMechanismResultAndApplicability.toLocaleString('en-US')} (${percent(report.biotechResearchCoverage.shareOfRecordedBackgroundCorpus)}) |

This is a conservative structured-coverage measure, not a claim that the full biotech lens is
complete. Dose, comparator, endpoint hierarchy, adverse events, failures, unreported outcomes,
freshness and review history remain visible as recorded or explicitly absent in the projection.

## Quantitative uncertainty

The corpus holds ${pivotalResults} qualifying key-study results across ${pivotalResultRecords} records.
${uncertaintyResults} results across ${uncertaintyRecords} records carry uncertainty printed by their
source (${percent(report.quantitativeUncertainty.shareOfPivotalResults)} of qualifying results).

## Source conflict

Only comparable readings with \`comparisonState: differ\` count: **${conflictFields} fields** across
**${conflictRecords} records**. The ${notComparable} \`not_comparable\` fields remain separate and
are not disagreements.

| Comparison state | Fields |
| --- | ---: |
${states}

Unmapped differing fields: ${report.sourceConflict.unmappedDifferFields.length === 0 ? 'none' : report.sourceConflict.unmappedDifferFields.map((field) => `\`${field}\``).join(', ')}.

## Exact stale bindings

Measurement state: **${staleState}**.
${report.staleExactBindings.note}

| Measure | Value |
| --- | ---: |
| Public rows exposing the exact runtime projection | ${report.staleExactBindings.projectionRecordsObserved.toLocaleString('en-US')} |
| Confirmed exact bindings | ${report.staleExactBindings.confirmedExactBindings === null ? 'not observable' : report.staleExactBindings.confirmedExactBindings.toLocaleString('en-US')} |
| Records with confirmed drift | ${report.staleExactBindings.recordsWithConfirmedDrift === null ? 'not observable' : report.staleExactBindings.recordsWithConfirmedDrift.toLocaleString('en-US')} |

## Source-read boundary

| Measure | Records |
| --- | ---: |
| At least one qualifying source excerpt | ${report.sourceRead.recordsWithQualifyingSourceExcerpt.toLocaleString('en-US')} |
| **No source excerpt read** | **${report.sourceRead.noSourceExcerptRead.toLocaleString('en-US')}** |
| At least one qualifying source object recorded | ${report.sourceRead.recordsWithQualifyingSourceRecorded.toLocaleString('en-US')} |
| **No qualifying source recorded** | **${report.sourceRead.noQualifyingSourceRecorded.toLocaleString('en-US')}** |

${report.sourceRead.note}

## Denominators and limits

- Public medicine rows: ${report.denominators.publicMedicineRows.toLocaleString('en-US')}.
- Recorded-background records measured: ${report.denominators.recordedBackgroundRecords.toLocaleString('en-US')}.
- Deliberate public rows outside the recorded-background export: ${report.denominators.publicRowsOutsideRecordedBackground.toLocaleString('en-US')}.
${report.limitations.map((limitation) => `- ${limitation}`).join('\n')}

## Reproduce

\`node --import tsx scripts/audit/four-audience-evidence-coverage.ts --check\`

Input hashes are recorded in the generated JSON report.
`
}

export async function generatedFourAudienceCoverageFiles(
  repoRoot: string = process.cwd(),
): Promise<{
  json: string
  markdown: string
}> {
  const report = buildFourAudienceCoverageReport(repoRoot)
  return {
    json: await format(JSON.stringify(report), {
      filepath: 'four-audience-evidence-coverage.json',
    }),
    markdown: await format(renderFourAudienceCoverageMarkdown(report), {
      filepath: 'four-audience-evidence-coverage.md',
    }),
  }
}

async function main(): Promise<void> {
  const arguments_ = process.argv.slice(2)
  if (arguments_.length !== 1 || (arguments_[0] !== '--write' && arguments_[0] !== '--check')) {
    throw new TypeError(
      'Usage: node --import tsx scripts/audit/four-audience-evidence-coverage.ts --write|--check',
    )
  }
  const repoRoot = process.cwd()
  const jsonPath = join(repoRoot, 'docs', 'product', 'four-audience-evidence-coverage.json')
  const markdownPath = join(repoRoot, 'docs', 'product', 'four-audience-evidence-coverage.md')
  const generated = await generatedFourAudienceCoverageFiles(repoRoot)

  if (arguments_[0] === '--check') {
    const errors: string[] = []
    if (!existsSync(jsonPath) || readFileSync(jsonPath, 'utf8') !== generated.json) {
      errors.push('four-audience-evidence-coverage.json is missing or stale')
    }
    if (!existsSync(markdownPath) || readFileSync(markdownPath, 'utf8') !== generated.markdown) {
      errors.push('four-audience-evidence-coverage.md is missing or stale')
    }
    if (errors.length > 0) throw new TypeError(errors.join('; '))
    console.log(`[four-audience] coverage is current · ${generated.json.length} JSON bytes`)
    return
  }

  mkdirSync(dirname(jsonPath), { recursive: true })
  writeFileSync(jsonPath, generated.json)
  writeFileSync(markdownPath, generated.markdown)
  console.log(`[four-audience] wrote ${jsonPath}`)
  console.log(`[four-audience] wrote ${markdownPath}`)
}

const entryPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null
if (entryPath === import.meta.url) await main()
