/**
 * Deterministic measurement of the corpus properties the Denial Corpus audit reasoned about.
 *
 * Every number the audit and the documentation quote must come from here rather than from a person
 * typing a count into prose. Three separate figures in `docs/` had drifted behind the generated
 * data before this script existed — `sourceMaterial` understated by 1,483 rows, the agent tables
 * describing a corpus one third the real size, and a connection-table count wrong by a factor of
 * 22 — and each of them was a number someone had written down once and never re-derived.
 *
 * The `measurements` object is a pure function of the checked-in generated data. It contains no
 * clock reading, no random draw and no network result, so two runs on the same tree produce
 * byte-identical output and a diff means the corpus changed. Anything that cannot be reproduced —
 * the run timestamp, the commit SHA, whether a database was reachable — lives under `provenance`
 * and is excluded from the measurement digest.
 *
 * Usage:
 *   npx tsx scripts/audit/denial-corpus/measure.ts [--out=<dir>] [--json-only]
 */

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import { ALL_RECORDED_BACKGROUND } from '../../seed-data/background'
import { MOLECULAR_PROPERTIES } from '../../seed-data/background/molecular-properties.generated'
import { RECORDED_BACKGROUND } from '../../seed-data/background/index'
import { RECORDED_BACKGROUND_MODULES } from '@/lib/background/types'
import { PRINTED_NUMBER } from '@/lib/background/printed-numbers'
import type { MedicineRecordedBackground, RecordedValue } from '@/lib/background/types'

const REPO = process.cwd()

/* ---------------------------------------------------------------------------------------------- */
/* Small helpers                                                                                    */
/* ---------------------------------------------------------------------------------------------- */

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

function sortedCounts(counts: Map<string, number>): Record<string, number> {
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

function increment(counts: Map<string, number>, key: string, by = 1): void {
  counts.set(key, (counts.get(key) ?? 0) + by)
}

/** Quantiles by the type-7 definition, matching `lib/agents/core/statistics.ts`. */
function quantile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) return Number.NaN
  if (sorted.length === 1) return sorted[0]!
  const h = (sorted.length - 1) * p
  const lo = Math.floor(h)
  const hi = Math.ceil(h)
  return sorted[lo]! + (h - lo) * (sorted[hi]! - sorted[lo]!)
}

/* ---------------------------------------------------------------------------------------------- */
/* Module classification                                                                            */
/* ---------------------------------------------------------------------------------------------- */

/**
 * Modules that say something about what the medicine DOES, as opposed to what it is called, how it
 * is classified, or how many products contain it. The split decides the headline coverage number,
 * so it is declared once here rather than re-derived by each consumer.
 */
const CLINICAL_MODULES = [
  'pharmacokinetics',
  'mechanism',
  'safety',
  'commonAdverseReactions',
  'populationStatements',
  'interactionSignals',
  'recordedUses',
  'pivotalResults',
  'titration',
  'anatomyTargets',
  'applicability',
] as const

/**
 * Pharmacology is the clinical set minus `recordedUses`, which is a quoted INDICATIONS sentence and
 * the lowest bar in the group — 928 records hold it and nothing else clinical, so counting it as
 * pharmacology would overstate the corpus by roughly half.
 */
const PHARMACOLOGY_MODULES = CLINICAL_MODULES.filter((m) => m !== 'recordedUses')

function heldModules(background: MedicineRecordedBackground): string[] {
  return RECORDED_BACKGROUND_MODULES.filter((module) => {
    const value = (background as unknown as Record<string, unknown>)[module]
    if (value === undefined || value === null) return false
    if (Array.isArray(value)) return value.length > 0
    return true
  })
}

function tierOf(background: MedicineRecordedBackground): string {
  return background.provenanceTier ?? 'curated'
}

/* ---------------------------------------------------------------------------------------------- */
/* Recorded-value walking                                                                           */
/* ---------------------------------------------------------------------------------------------- */

const PK_VALUE_FIELDS = [
  'bioavailability',
  'tMax',
  'halfLife',
  'proteinBinding',
  'volumeOfDistribution',
] as const

const DISPERSION = new RegExp(
  String.raw`(${PRINTED_NUMBER})\s*(?:±|\+/-|\+-|\+/−)\s*(${PRINTED_NUMBER})`,
  'u',
)

interface DispersionDefect {
  slug: string
  field: string
  recorded: string
  estimateInExcerpt: string
  excerpt: string
}

/* ---------------------------------------------------------------------------------------------- */
/* The measurement                                                                                  */
/* ---------------------------------------------------------------------------------------------- */

function measure() {
  const entries = Object.entries(ALL_RECORDED_BACKGROUND)

  /* -------------------------------------------------- corpus shape */
  const tierCounts = new Map<string, number>()
  const moduleCounts = new Map<string, number>()
  const modulesPerRow: number[] = []
  const clinicalPerRow: number[] = []
  let rowsWithAnyClinical = 0
  let rowsWithAnyPharmacology = 0
  let rowsWithQuotableExcerpt = 0
  let rowsWithNoQuotableExcerpt = 0

  /* -------------------------------------------------- evidence states */
  let explicitDenials = 0
  let polarityAsserted = 0
  let polarityNotRecorded = 0
  let interactionSignalsTotal = 0
  const recordsAtInteractionCap: string[] = []
  let explicitNonEstablishment = 0
  let populationStatementsTotal = 0

  /* -------------------------------------------------- consensus */
  let consensusFields = 0
  let consensusMultiReading = 0
  let consensusBelowUnanimity = 0
  let consensusNumericallyDisjoint = 0
  let consensusDisjointAcrossUnits = 0
  let consensusDisjointSameUnit = 0

  /* -------------------------------------------------- measurement integrity */
  let numericPkValues = 0
  let excerptsContainingDispersion = 0
  const dispersionDefects: DispersionDefect[] = []

  const INTERACTION_CAP = 12

  for (const [slug, background] of entries) {
    const modules = heldModules(background)
    modulesPerRow.push(modules.length)
    increment(tierCounts, tierOf(background))
    for (const held of modules) increment(moduleCounts, held)

    const clinical = modules.filter((m) => (CLINICAL_MODULES as readonly string[]).includes(m))
    clinicalPerRow.push(clinical.length)
    if (clinical.length > 0) rowsWithAnyClinical += 1
    if (modules.some((m) => (PHARMACOLOGY_MODULES as readonly string[]).includes(m))) {
      rowsWithAnyPharmacology += 1
    }

    /* quotable excerpt anywhere in the record */
    const serialized = JSON.stringify(background)
    if (serialized.includes('"excerpt"')) rowsWithQuotableExcerpt += 1
    else rowsWithNoQuotableExcerpt += 1

    /* interaction polarity and truncation */
    const signals = background.interactionSignals ?? []
    interactionSignalsTotal += signals.length
    if (signals.length === INTERACTION_CAP) recordsAtInteractionCap.push(slug)
    for (const signal of signals) {
      if (signal.polarity === 'NEGATED') explicitDenials += 1
      else if (signal.polarity === 'ASSERTED') polarityAsserted += 1
      else polarityNotRecorded += 1
    }

    /* explicit non-establishment */
    for (const statement of background.populationStatements ?? []) {
      populationStatementsTotal += 1
      if (statement.state === 'NOT_ESTABLISHED') explicitNonEstablishment += 1
    }

    /* consensus */
    for (const field of background.sourceConsensus?.fields ?? []) {
      consensusFields += 1
      if (field.readings.length > 1) consensusMultiReading += 1
      if (field.agreementRate < 1) consensusBelowUnanimity += 1
      if (field.numericallyDisjoint) {
        consensusNumericallyDisjoint += 1
        const units = new Set(
          field.readings.map((reading) => unitOfReading(reading.display)).filter(Boolean),
        )
        if (units.size > 1) consensusDisjointAcrossUnits += 1
        else consensusDisjointSameUnit += 1
      }
    }

    /* measurement integrity: is a stored estimate actually its own dispersion? */
    const pk = background.pharmacokinetics
    if (pk) {
      for (const fieldName of PK_VALUE_FIELDS) {
        const value = (pk as unknown as Record<string, RecordedValue | undefined>)[fieldName]
        if (!value?.numeric) continue
        numericPkValues += 1
        const excerpt = value.source.excerpt ?? ''
        const match = DISPERSION.exec(excerpt)
        if (!match) continue
        excerptsContainingDispersion += 1
        const estimate = Number(match[1]!.replace(/,/gu, ''))
        const spread = Number(match[2]!.replace(/,/gu, ''))
        if (value.numeric === spread && value.numeric !== estimate) {
          dispersionDefects.push({
            slug,
            field: fieldName,
            recorded: value.display,
            estimateInExcerpt: match[1]!,
            excerpt: excerpt.slice(0, 200),
          })
        }
      }
    }
  }

  /* -------------------------------------------------- public-boundary surfaces */
  const publicBoundary = measurePublicBoundary()

  /* -------------------------------------------------- agent candidates */
  const agents = measureAgents()

  /* -------------------------------------------------- molecular */
  const molecular = measureMolecular()

  /* -------------------------------------------------- public export */
  const publicExport = measurePublicExport()

  const sortedModules = [...modulesPerRow].sort((a, b) => a - b)

  return {
    corpus: {
      recordsInMergedCorpus: entries.length,
      recordsByProvenanceTier: sortedCounts(tierCounts),
      rowsHoldingModules: sortedCounts(moduleCounts),
      modulesPerRow: {
        min: sortedModules[0] ?? 0,
        p25: quantile(sortedModules, 0.25),
        median: quantile(sortedModules, 0.5),
        p75: quantile(sortedModules, 0.75),
        max: sortedModules[sortedModules.length - 1] ?? 0,
        distribution: sortedCounts(
          modulesPerRow.reduce((map, n) => {
            increment(map, String(n))
            return map
          }, new Map<string, number>()),
        ),
      },
      rowsWithAnyClinicalModule: rowsWithAnyClinical,
      rowsWithNoClinicalModule: entries.length - rowsWithAnyClinical,
      rowsWithAnyPharmacologyModule: rowsWithAnyPharmacology,
      rowsWithQuotableExcerpt,
      rowsWithNoQuotableExcerpt,
      curatedRecordsHoldingModule: measureCuratedModuleHoldings(),
    },
    evidenceStates: {
      interactionSignalsTotal,
      polarityAsserted,
      polarityNegated: explicitDenials,
      polarityNotRecorded,
      populationStatementsTotal,
      explicitNonEstablishment,
    },
    disagreement: {
      consensusFields,
      consensusMultiReading,
      consensusBelowUnanimity,
      consensusNumericallyDisjoint,
      consensusDisjointSameUnit,
      consensusDisjointAcrossUnits,
    },
    measurementIntegrity: {
      numericPkValues,
      excerptsContainingDispersion,
      valuesEqualToOwnDispersion: dispersionDefects.length,
      defects: dispersionDefects.sort(
        (a, b) => a.slug.localeCompare(b.slug) || a.field.localeCompare(b.field),
      ),
    },
    truncation: {
      interactionSignalCap: INTERACTION_CAP,
      recordsAtInteractionCap: recordsAtInteractionCap.length,
      recordsAtInteractionCapSlugs: recordsAtInteractionCap.sort(),
    },
    publicBoundary,
    agents,
    molecular,
    publicExport,
  }
}

/** Unit token at the end of a printed reading, used only to partition comparable readings. */
function unitOfReading(display: string): string {
  const trimmed = display.trim()
  if (/%\s*$/u.test(trimmed)) return '%'
  const match = /([A-Za-z/µ]+(?:\s*\/\s*[A-Za-z]+)?)\s*$/u.exec(trimmed)
  return match ? match[1]!.replace(/\s+/gu, '').toLowerCase() : ''
}

/** Which modules the 155 hand-authored records actually hold. */
function measureCuratedModuleHoldings(): Record<string, number> {
  const counts = new Map<string, number>()
  for (const background of Object.values(RECORDED_BACKGROUND)) {
    for (const held of heldModules(background)) increment(counts, held)
  }
  return sortedCounts(counts)
}

/**
 * The two `substitutes` surfaces the audit found on the public API, measured from seed data because
 * that is what reaches the database. A non-zero count here is only a defect if the public serializer
 * lets it out; the serializer test proves it does not.
 */
function measurePublicBoundary() {
  const dir = join(REPO, 'scripts', 'seed-data')
  let patientActionEntries = 0
  let prosAndConsEntries = 0
  let recordsWithSubstitutes = 0
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.ts')) continue
    const text = readFileSync(join(dir, file), 'utf8')
    patientActionEntries += (text.match(/clinicalPrecaution:/gu) ?? []).length
    prosAndConsEntries += (text.match(/prosAndCons:/gu) ?? []).length
    recordsWithSubstitutes += (text.match(/conventionalRx:/gu) ?? []).length
  }
  return {
    recordsWithSubstitutes,
    storedPatientActionEntries: patientActionEntries,
    storedProsAndConsEntries: prosAndConsEntries,
    note: 'Stored counts. The public serializer withholds both; see tests/unit/dossier-read-serializer.test.ts.',
  }
}

function measureAgents() {
  const dir = join(REPO, 'data', 'agents')
  if (!existsSync(dir)) return { generatedFiles: 0, byAgent: {}, candidatesByReason: {} }
  const byAgent: Record<
    string,
    { version: string; used: number; considered: number; queue: number }
  > = {}
  const reasons = new Map<string, number>()
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith('.json')) continue
    const run = JSON.parse(readFileSync(join(dir, file), 'utf8')) as {
      agent: string
      version: string
      coverage: { used: number; considered: number }
      queue?: { reason: string }[]
    }
    byAgent[run.agent] = {
      version: run.version,
      used: run.coverage.used,
      considered: run.coverage.considered,
      queue: run.queue?.length ?? 0,
    }
    for (const item of run.queue ?? []) increment(reasons, item.reason)
  }
  return {
    generatedFiles: Object.keys(byAgent).length,
    byAgent,
    candidatesByReason: sortedCounts(reasons),
    totalCandidates: [...reasons.values()].reduce((a, b) => a + b, 0),
  }
}

function measureMolecular() {
  const records = Object.entries(MOLECULAR_PROPERTIES)
  let withSmiles = 0
  let withStereoSmiles = 0
  let withInchiKey = 0
  for (const [, value] of records) {
    const smiles = (value as { smiles?: string }).smiles
    if (smiles) {
      withSmiles += 1
      if (/[@/\\]/u.test(smiles)) withStereoSmiles += 1
    }
    if ((value as { inchiKey?: string }).inchiKey) withInchiKey += 1
  }

  /* the legacy CSV carries far more connection tables than molecular-properties/v1 */
  let legacySmiles = 0
  let legacyStereo = 0
  let legacyRows = 0
  const csv = join(REPO, 'data', 'drugs.csv')
  if (existsSync(csv)) {
    const lines = readFileSync(csv, 'utf8').split('\n')
    const header = (lines[0] ?? '').split(',')
    const smilesIndex = header.indexOf('smiles')
    for (const line of lines.slice(1)) {
      if (!line.trim()) continue
      legacyRows += 1
      if (smilesIndex < 0) continue
      const cells = line.split(',')
      const value = cells[smilesIndex] ?? ''
      if (value.trim()) {
        legacySmiles += 1
        if (/[@/\\]/u.test(value)) legacyStereo += 1
      }
    }
  }

  return {
    molecularPropertiesRecords: records.length,
    withSmiles,
    withStereochemistry: withStereoSmiles,
    withInchiKey,
    legacyRows,
    legacySmilesPopulated: legacySmiles,
    legacySmilesWithStereochemistry: legacyStereo,
  }
}

function measurePublicExport() {
  const manifestPath = join(REPO, 'data', 'manifest.json')
  if (!existsSync(manifestPath)) return { present: false }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    counts?: Record<string, number>
    licence?: string
    files?: { path: string; rows: number }[]
  }
  const exporter = readFileSync(join(REPO, 'scripts', 'export', 'dataset.ts'), 'utf8')
  return {
    present: true,
    declaredLicence: manifest.licence ?? null,
    counts: manifest.counts ?? {},
    files: manifest.files?.length ?? 0,
    exporterMentionsRecordedBackground: /recordedBackground/u.test(exporter),
    exporterMentionsSourceConsensus: /sourceConsensus/u.test(exporter),
  }
}

/* ---------------------------------------------------------------------------------------------- */
/* Licence consistency — measured, because the declarations currently disagree                      */
/* ---------------------------------------------------------------------------------------------- */

function measureLicenceDeclarations() {
  const targets = [
    'LICENSE-DATA',
    'README.md',
    'data/README.md',
    'data/manifest.json',
    'scripts/export/dataset.ts',
  ]
  const declarations: Record<string, string[]> = {}
  for (const target of targets) {
    const path = join(REPO, target)
    if (!existsSync(path)) continue
    const text = readFileSync(path, 'utf8')
    const found = new Set<string>()
    if (/Creative Commons Attribution 4\.0 International Public License/u.test(text)) {
      found.add('CC-BY-4.0 (legal text)')
    }
    if (/CC[- ]BY[- ]SA[- ]?4\.0/u.test(text)) found.add('CC-BY-SA-4.0 (declared)')
    if (/CC[- ]BY[- ]?4\.0/u.test(text) && !/CC[- ]BY[- ]SA/u.test(text)) {
      found.add('CC-BY-4.0 (declared)')
    }
    declarations[target] = [...found].sort()
  }
  const distinct = new Set(
    Object.values(declarations)
      .flat()
      .map((d) => d.split(' ')[0]),
  )
  return { declarations, consistent: distinct.size <= 1, distinctFamilies: [...distinct].sort() }
}

/* ---------------------------------------------------------------------------------------------- */
/* Entry point                                                                                      */
/* ---------------------------------------------------------------------------------------------- */

function main() {
  const outFlag = process.argv.find((a) => a.startsWith('--out='))
  const outDir = outFlag
    ? outFlag.slice('--out='.length)
    : join(REPO, 'data', 'audits', 'denial-corpus')
  mkdirSync(outDir, { recursive: true })

  const measurements = { ...measure(), licensing: measureLicenceDeclarations() }
  const measurementJson = `${JSON.stringify(measurements, null, 2)}\n`
  const digest = sha256(measurementJson)

  const inputs: Record<string, string> = {}
  for (const relative of [
    'scripts/seed-data/background/extracted-background.generated.ts',
    'scripts/seed-data/background/source-consensus.generated.ts',
    'scripts/seed-data/background/molecular-properties.generated.ts',
    'data/manifest.json',
    'LICENSE-DATA',
  ]) {
    const path = join(REPO, relative)
    if (existsSync(path)) inputs[relative] = sha256(readFileSync(path, 'utf8'))
  }

  writeFileSync(join(outDir, 'baseline.json'), measurementJson)
  writeFileSync(
    join(outDir, 'input-manifest.json'),
    `${JSON.stringify({ measurementDigest: digest, inputs }, null, 2)}\n`,
  )

  if (!process.argv.includes('--json-only')) {
    writeFileSync(join(outDir, 'baseline.md'), renderMarkdown(measurements, digest))
  }

  console.log(`[audit] measurement digest ${digest}`)
  console.log(`[audit] records ${measurements.corpus.recordsInMergedCorpus}`)
  console.log(`[audit] tiers ${JSON.stringify(measurements.corpus.recordsByProvenanceTier)}`)
  console.log(
    `[audit] clinical ${measurements.corpus.rowsWithAnyClinicalModule} · pharmacology ${measurements.corpus.rowsWithAnyPharmacologyModule} · no quotable sentence ${measurements.corpus.rowsWithNoQuotableExcerpt}`,
  )
  console.log(
    `[audit] polarity asserted ${measurements.evidenceStates.polarityAsserted} · negated ${measurements.evidenceStates.polarityNegated} · not recorded ${measurements.evidenceStates.polarityNotRecorded}`,
  )
  console.log(
    `[audit] explicit non-establishment ${measurements.evidenceStates.explicitNonEstablishment}`,
  )
  console.log(
    `[audit] disjoint consensus fields ${measurements.disagreement.consensusNumericallyDisjoint} (same unit ${measurements.disagreement.consensusDisjointSameUnit}, across units ${measurements.disagreement.consensusDisjointAcrossUnits})`,
  )
  console.log(
    `[audit] values equal to own dispersion ${measurements.measurementIntegrity.valuesEqualToOwnDispersion}`,
  )
  console.log(
    `[audit] records at interaction cap ${measurements.truncation.recordsAtInteractionCap}`,
  )
  console.log(
    `[audit] licence declarations consistent: ${measurements.licensing.consistent} ${JSON.stringify(measurements.licensing.distinctFamilies)}`,
  )
  console.log(`[audit] written to ${outDir}`)

  /* The audit reports; it does not gate. Callers decide what a non-zero count means. */
}

function renderMarkdown(
  m: ReturnType<typeof measure> & { licensing: unknown },
  digest: string,
): string {
  const l = m.licensing as ReturnType<typeof measureLicenceDeclarations>
  const rows = (obj: Record<string, number>) =>
    Object.entries(obj)
      .map(([k, v]) => `| \`${k}\` | ${v} |`)
      .join('\n')

  return `# Denial Corpus baseline

Generated by \`npm run audit:denial-corpus\`. Every figure here is a pure function of the checked-in
generated data; the measurement digest below changes only when the corpus does.

**Measurement digest:** \`${digest}\`

## Corpus shape

| Fact | Value |
| ---- | ----- |
| Records in merged corpus | ${m.corpus.recordsInMergedCorpus} |
| Rows with any clinical module | ${m.corpus.rowsWithAnyClinicalModule} |
| Rows with no clinical module | ${m.corpus.rowsWithNoClinicalModule} |
| Rows with any pharmacology module | ${m.corpus.rowsWithAnyPharmacologyModule} |
| Rows with a quotable excerpt | ${m.corpus.rowsWithQuotableExcerpt} |
| Rows with no quotable sentence anywhere | ${m.corpus.rowsWithNoQuotableExcerpt} |
| Modules per row (min/p25/median/p75/max) | ${m.corpus.modulesPerRow.min} / ${m.corpus.modulesPerRow.p25} / ${m.corpus.modulesPerRow.median} / ${m.corpus.modulesPerRow.p75} / ${m.corpus.modulesPerRow.max} |

### Records by provenance tier

${rows(m.corpus.recordsByProvenanceTier)}

### Rows holding each module

${rows(m.corpus.rowsHoldingModules)}

### Modules held by the hand-authored tier

${rows(m.corpus.curatedRecordsHoldingModule)}

## Evidence states

| Fact | Value |
| ---- | ----- |
| Interaction signals | ${m.evidenceStates.interactionSignalsTotal} |
| Role asserted | ${m.evidenceStates.polarityAsserted} |
| Role denied | ${m.evidenceStates.polarityNegated} |
| Polarity not recorded | ${m.evidenceStates.polarityNotRecorded} |
| Population statements | ${m.evidenceStates.populationStatementsTotal} |
| Explicit non-establishment | ${m.evidenceStates.explicitNonEstablishment} |

## Disagreement

| Fact | Value |
| ---- | ----- |
| Consensus fields | ${m.disagreement.consensusFields} |
| Fields with more than one reading | ${m.disagreement.consensusMultiReading} |
| Fields below unanimity | ${m.disagreement.consensusBelowUnanimity} |
| Marked numerically disjoint | ${m.disagreement.consensusNumericallyDisjoint} |
| — of which readings share a unit | ${m.disagreement.consensusDisjointSameUnit} |
| — of which readings span units (not comparable) | ${m.disagreement.consensusDisjointAcrossUnits} |

## Measurement integrity

| Fact | Value |
| ---- | ----- |
| Numeric pharmacokinetic values | ${m.measurementIntegrity.numericPkValues} |
| Excerpts containing a dispersion construction | ${m.measurementIntegrity.excerptsContainingDispersion} |
| **Values equal to their own dispersion** | **${m.measurementIntegrity.valuesEqualToOwnDispersion}** |

${
  m.measurementIntegrity.defects.length === 0
    ? 'No stored estimate equals a dispersion number in its own excerpt.'
    : m.measurementIntegrity.defects
        .map(
          (d) =>
            `- \`${d.slug}\` · \`${d.field}\` — recorded ${d.recorded}, excerpt states ${d.estimateInExcerpt}`,
        )
        .join('\n')
}

## Truncation

| Fact | Value |
| ---- | ----- |
| Interaction-signal cap | ${m.truncation.interactionSignalCap} |
| Records sitting exactly at the cap | ${m.truncation.recordsAtInteractionCap} |

## Public boundary

| Fact | Value |
| ---- | ----- |
| Records with \`substitutes.conventionalRx\` | ${m.publicBoundary.recordsWithSubstitutes} |
| Stored patient-action entries | ${m.publicBoundary.storedPatientActionEntries} |
| Stored pros-and-cons entries | ${m.publicBoundary.storedProsAndConsEntries} |

${m.publicBoundary.note}

## Molecular

| Fact | Value |
| ---- | ----- |
| \`molecular-properties/v1\` records | ${m.molecular.molecularPropertiesRecords} |
| — with SMILES | ${m.molecular.withSmiles} |
| — with stereochemistry | ${m.molecular.withStereochemistry} |
| Legacy CSV rows | ${m.molecular.legacyRows} |
| — with SMILES | ${m.molecular.legacySmilesPopulated} |
| — with stereochemistry | ${m.molecular.legacySmilesWithStereochemistry} |

## Public export

| Fact | Value |
| ---- | ----- |
| Declared licence | ${m.publicExport.declaredLicence ?? 'n/a'} |
| Exporter emits \`recordedBackground\` | ${m.publicExport.exporterMentionsRecordedBackground} |
| Exporter emits \`sourceConsensus\` | ${m.publicExport.exporterMentionsSourceConsensus} |

## Licence declarations

Consistent: **${l.consistent}** — families found: ${l.distinctFamilies.join(', ') || 'none'}

${Object.entries(l.declarations)
  .map(([file, found]) => `- \`${file}\` → ${found.join(', ') || 'no declaration found'}`)
  .join('\n')}

## Agents

${Object.entries(m.agents.byAgent ?? {})
  .map(
    ([name, a]) =>
      `- \`${name}\` v${a.version} — ${a.used}/${a.considered} used, ${a.queue} queued`,
  )
  .join('\n')}

Candidates by reason:

${rows((m.agents.candidatesByReason ?? {}) as Record<string, number>)}
`
}

main()
