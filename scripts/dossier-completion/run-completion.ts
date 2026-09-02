import 'dotenv/config'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { dossierCompletionAssessments } from '@/db/schema'
import { normalizeContentName, normalizeIdentityName } from '@/lib/background/name-normalization'
import type { MedicineRecordedBackground } from '@/lib/background/types'
import {
  assessDossierCompletion,
  type CompletionInput,
  type LabelMatch,
  type SearchRecordInput,
} from '@/lib/dossier-completion/resolve'
import {
  DOSSIER_COMPLETION_RESOLVER_VERSION,
  DOSSIER_SECTION_IDS,
  SECTION_STATES,
  type DossierCompletionAssessment,
  type DossierCompletionSummary,
  type DossierSectionId,
  type SectionState,
} from '@/lib/dossier-completion/types'
import type { AttributionWarning, EntityClass, IdentitySource } from '@/lib/inventory/types'
import { stableJsonStringify } from '@/lib/stable-json'

import type { LabelSectionsIndex } from './build-label-sections-index'

/**
 * Assesses every canonical entity and writes one completion row per record.
 *
 * Idempotent and resumable: every row is an upsert keyed by drug id, and `content_changed_at`
 * moves only when the input digest moves, so re-running over unchanged inputs changes no public
 * date. `--check` re-derives every assessment and reports how many stored rows differ without
 * writing. `--slugs=a,b` limits a run to named records.
 *
 *   npx tsx scripts/dossier-completion/run-completion.ts [--check] [--slugs=a,b] [--limit=N]
 */

const CLINICALTRIALS_SEARCH_KIND = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION'
const PUBMED_SEARCH_KIND = 'PUBMED_ESEARCH_CLINICAL_TRIAL'
const CHUNK = 100

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

interface DrugRow {
  id: string
  slug: string
  name: string
  dossier_depth: 'stub' | 'curated' | 'flagship'
  modality: string
  approval_status: string
  recorded_background: MedicineRecordedBackground | null
  trials: Array<{ trialId?: string; phase?: string; endpointStatus?: string }> | null
  key_audits: Array<{ evidenceSource?: string; doi?: string }> | null
  source_provenance: string[] | null
  molecular_schema: {
    smilesString?: string
    chemicalFormula?: string
    sequence5to3?: string
  } | null
  aliases: Array<{ alias: string; kind: string }>
}

interface ResolutionRow {
  drug_id: string
  resolution_status: string
  entity_class: EntityClass
  canonical_drug_id: string
  identity_sources: IdentitySource[]
  attribution_warnings: AttributionWarning[]
}

interface SearchRow {
  drug_id: string
  search_kind: string
  source_identifier: string
  requested_at: string
  status: 'SUCCEEDED' | 'UNREACHABLE' | 'FAILED'
  result_count: number | null
  matched: unknown[]
  error: string | null
}

function registryDate(file: string): string {
  const path = join(process.cwd(), 'data', 'registries', file)
  if (!existsSync(path)) return 'unknown'
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as
    Record<string, { authoredAt?: string }> | Array<{ background?: { authoredAt?: string } }>
  const dates = Array.isArray(parsed)
    ? parsed
        .map((row) => row.background?.authoredAt)
        .filter((d): d is string => typeof d === 'string')
    : Object.values(parsed)
        .map((row) => row.authoredAt)
        .filter((d): d is string => typeof d === 'string')
  return dates.sort().at(-1) ?? 'unknown'
}

function buildLabelLookup(index: LabelSectionsIndex): Map<string, LabelMatch[]> {
  const byName = new Map<string, LabelMatch[]>()
  for (const entry of index.entries) {
    const match: LabelMatch = {
      setId: entry.setId,
      declared: entry.declared,
      sections: entry.sections,
      productTypes: entry.productTypes,
    }
    for (const name of entry.names) {
      const list = byName.get(name) ?? []
      list.push(match)
      byName.set(name, list)
    }
  }
  return byName
}

function labelsFor(names: readonly string[], lookup: Map<string, LabelMatch[]>): LabelMatch[] {
  const seen = new Map<string, LabelMatch>()
  for (const name of names) {
    for (const key of new Set([normalizeContentName(name), normalizeIdentityName(name)])) {
      if (key.length < 3) continue
      for (const match of lookup.get(key) ?? []) seen.set(match.setId, match)
    }
  }
  return [...seen.values()].sort((left, right) => left.setId.localeCompare(right.setId))
}

function searchInput(row: SearchRow | undefined): SearchRecordInput | null {
  if (!row) return null
  return {
    status: row.status,
    sourceIdentifier: row.source_identifier,
    requestedAt: new Date(row.requested_at).toISOString(),
    resultCount: row.result_count,
    error: row.error,
    matched: row.matched,
  }
}

function emptyStateCounts(): Record<SectionState, number> {
  return Object.fromEntries(SECTION_STATES.map((state) => [state, 0])) as Record<
    SectionState,
    number
  >
}

async function main(): Promise<void> {
  const checkOnly = process.argv.includes('--check')
  const onlySlugs = new Set(
    (flag('slugs') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  )
  const limit = Number(flag('limit') ?? Number.POSITIVE_INFINITY)
  const dataDir = process.env.RNAWIKI_INGEST_DATA ?? join(process.cwd(), 'tmp')
  const indexPath = flag('label-index') ?? join(dataDir, 'label-sections-index.json')
  // Audit artifacts live under docs/audits; data/ is regenerated wholesale by the exporter.
  const outDir = join(process.cwd(), 'docs', 'audits', 'dossier-completion')

  const labelIndex = JSON.parse(readFileSync(indexPath, 'utf8')) as LabelSectionsIndex
  if (labelIndex.schema !== 'rnawiki-label-sections-index/v1')
    throw new Error('unexpected label index schema')
  // The curated-gap builder runs the label extractor over every hand-curated record and writes this
  // registry (scripts/background/build-curated-gap-extraction.ts). Its presence means the extractor
  // has been run for the curated tier; without it, a curated record's label sections are unread.
  const curatedGapPath = join(process.cwd(), 'data', 'registries', 'curated-gap-extraction.json')
  const curatedGapExtractionBuilt =
    existsSync(curatedGapPath) &&
    Object.keys(JSON.parse(readFileSync(curatedGapPath, 'utf8')) as object).length > 0
  const labelLookup = buildLabelLookup(labelIndex)
  const archives: CompletionInput['archives'] = {
    labelArchive: registryDate('label-presence.json'),
    ndcDirectory: registryDate('product-listing.json'),
    drugsAtFda: registryDate('regulatory-approval.json'),
    supplementDatabase: registryDate('supplement-ingredient.json'),
    pricingFile: registryDate('acquisition-cost.json'),
    compoundDatabase: registryDate('compound-identity-background.json'),
    taxonomy: registryDate('biological-identity.json'),
    substanceRegistry: registryDate('source-material.json'),
  }

  try {
    const [drugResult, resolutionResult, searchResult, programmeResult, existingResult] =
      await Promise.all([
        db.execute(sql`
        select d.id, d.slug, d.name, d.dossier_depth, d.modality, d.approval_status, d.recorded_background,
          d.trials, d.key_audits, d.source_provenance, d.molecular_schema,
          coalesce((select jsonb_agg(jsonb_build_object('alias', a.alias, 'kind', a.kind) order by a.alias)
                    from drug_aliases a where a.drug_id = d.id), '[]'::jsonb) as aliases
        from drugs d order by d.slug
      `),
        db.execute(sql`
        select drug_id, resolution_status, entity_class, canonical_drug_id, identity_sources, attribution_warnings
        from inventory_resolutions
      `),
        db.execute(sql`
        select distinct on (drug_id, search_kind) drug_id, search_kind, source_identifier, requested_at, status, result_count, matched, error
        from source_search_records
        order by drug_id, search_kind, (status = 'SUCCEEDED') desc, requested_at desc
      `),
        db.execute(sql`
        select p.drug_id, count(*)::int as total,
          count(*) filter (where exists (select 1 from programme_current_publications c where c.programme_id = p.id))::int as published
        from development_programmes p group by p.drug_id
      `),
        db.execute(sql`select drug_id, input_digest, status from dossier_completion_assessments`),
      ])
    const drugs = drugResult.rows as unknown as DrugRow[]
    const resolutions = new Map(
      (resolutionResult.rows as unknown as ResolutionRow[]).map((row) => [row.drug_id, row]),
    )
    const searches = new Map<string, SearchRow>()
    for (const row of searchResult.rows as unknown as SearchRow[])
      searches.set(`${row.drug_id}|${row.search_kind}`, row)
    const programmes = new Map(
      (
        programmeResult.rows as unknown as Array<{
          drug_id: string
          total: number
          published: number
        }>
      ).map((row) => [row.drug_id, row]),
    )
    const existing = new Map(
      (
        existingResult.rows as unknown as Array<{
          drug_id: string
          input_digest: string
          status: string
        }>
      ).map((row) => [row.drug_id, row]),
    )
    const drugsById = new Map(drugs.map((drug) => [drug.id, drug]))
    const duplicatesByCanonical = new Map<string, DrugRow[]>()
    for (const resolution of resolutions.values()) {
      if (resolution.resolution_status !== 'DUPLICATE_OF_CANONICAL_ENTITY') continue
      const duplicate = drugsById.get(resolution.drug_id)
      if (!duplicate) continue
      const list = duplicatesByCanonical.get(resolution.canonical_drug_id) ?? []
      list.push(duplicate)
      duplicatesByCanonical.set(resolution.canonical_drug_id, list)
    }

    const canonical = drugs.filter(
      (drug) => resolutions.get(drug.id)?.resolution_status === 'CANONICAL_ENTITY',
    )
    const selected = canonical
      .filter((drug) => onlySlugs.size === 0 || onlySlugs.has(drug.slug))
      .slice(0, limit)
    console.log(
      `[completion] ${selected.length} canonical record(s) to assess · label index ${labelIndex.labels} labels (sha ${labelIndex.labelIndexSha256?.slice(0, 12) ?? 'none'}) · archives ${JSON.stringify(archives)}`,
    )

    const assessments: DossierCompletionAssessment[] = []
    let unchanged = 0
    let changed = 0
    let written = 0
    for (let start = 0; start < selected.length; start += CHUNK) {
      const chunk = selected.slice(start, start + CHUNK)
      const chunkAssessments = chunk.map((drug) => {
        const resolution = resolutions.get(drug.id)!
        const duplicates = duplicatesByCanonical.get(drug.id) ?? []
        const names = [
          drug.name,
          ...duplicates.map((duplicate) => duplicate.name),
          ...drug.aliases
            .filter((alias) => alias.kind === 'salt_form' || alias.kind === 'inn')
            .map((alias) => alias.alias),
        ]
        const programme = programmes.get(drug.id)
        const input: CompletionInput = {
          drug: {
            id: drug.id,
            slug: drug.slug,
            name: drug.name,
            dossierDepth: drug.dossier_depth,
            modality: drug.modality,
            approvalStatus: drug.approval_status,
            recordedBackground: drug.recorded_background,
            legacyTrials: (drug.trials ?? [])
              .filter((trial) => typeof trial.trialId === 'string')
              .map((trial) => ({
                trialId: trial.trialId!,
                phase: trial.phase,
                endpointStatus: trial.endpointStatus,
              })),
            keyAudits: (drug.key_audits ?? []).map((audit) => ({
              evidenceSource: audit.evidenceSource,
              doi: audit.doi,
            })),
            sourceProvenance: drug.source_provenance ?? [],
            molecularSchema: drug.molecular_schema
              ? {
                  smilesString: drug.molecular_schema.smilesString,
                  chemicalFormula: drug.molecular_schema.chemicalFormula,
                  sequence5to3: drug.molecular_schema.sequence5to3,
                }
              : null,
          },
          resolution: {
            entityClass: resolution.entity_class,
            identitySources: resolution.identity_sources,
            attributionWarnings: resolution.attribution_warnings,
          },
          duplicateRecords: duplicates.map((duplicate) => ({
            slug: duplicate.slug,
            recordedBackground: duplicate.recorded_background,
          })),
          labels: labelsFor(names, labelLookup),
          readLabelSections: labelIndex.readSections,
          archives,
          registrySearch: searchInput(searches.get(`${drug.id}|${CLINICALTRIALS_SEARCH_KIND}`)),
          literatureSearch: searchInput(searches.get(`${drug.id}|${PUBMED_SEARCH_KIND}`)),
          programmes: { total: programme?.total ?? 0, published: programme?.published ?? 0 },
          labelExtractorRan:
            drug.recorded_background?.provenanceTier === 'extracted' ||
            drug.recorded_background?.provenanceTier === 'transcribed' ||
            curatedGapExtractionBuilt,
        }
        return assessDossierCompletion(input)
      })
      assessments.push(...chunkAssessments)
      for (const assessment of chunkAssessments) {
        const prior = existing.get(assessment.drugId)
        if (
          prior &&
          prior.input_digest === assessment.inputDigest &&
          prior.status === assessment.status
        )
          unchanged += 1
        else changed += 1
      }
      if (!checkOnly) {
        await Promise.all(
          chunkAssessments.map(async (assessment) => {
            const values = {
              drugId: assessment.drugId,
              resolverVersion: assessment.resolverVersion,
              status: assessment.status,
              inputDigest: assessment.inputDigest,
              sections: assessment.sections,
              applicableSectionCount: assessment.applicableSectionCount,
              terminalSectionCount: assessment.terminalSectionCount,
              nonTerminalSectionIds: assessment.nonTerminalSectionIds,
              humanReadSuggestedSectionIds: assessment.humanReadSuggestedSectionIds,
            }
            await db
              .insert(dossierCompletionAssessments)
              .values(values)
              .onConflictDoUpdate({
                target: dossierCompletionAssessments.drugId,
                set: {
                  ...values,
                  assessedAt: sql`now()`,
                  contentChangedAt: sql`case when ${dossierCompletionAssessments.inputDigest} <> ${assessment.inputDigest} then now() else ${dossierCompletionAssessments.contentChangedAt} end`,
                },
              })
            written += 1
          }),
        )
      }
      if ((start + CHUNK) % 1000 === 0 || start + CHUNK >= selected.length) {
        console.log(
          `[completion] ${Math.min(start + CHUNK, selected.length)}/${selected.length} assessed`,
        )
      }
    }

    const byState = emptyStateCounts()
    const bySection = Object.fromEntries(
      DOSSIER_SECTION_IDS.map((id) => [id, emptyStateCounts()]),
    ) as Record<DossierSectionId, Record<SectionState, number>>
    const nonTerminalBySection = Object.fromEntries(
      DOSSIER_SECTION_IDS.map((id) => [id, 0]),
    ) as Record<DossierSectionId, number>
    let complete = 0
    let humanRead = 0
    for (const assessment of assessments) {
      if (assessment.status === 'COMPLETE') complete += 1
      if (assessment.humanReadSuggestedSectionIds.length > 0) humanRead += 1
      for (const section of assessment.sections) {
        byState[section.state] += 1
        bySection[section.sectionId][section.state] += 1
      }
      for (const id of assessment.nonTerminalSectionIds) nonTerminalBySection[id] += 1
    }
    const summary: DossierCompletionSummary & {
      inputDigest: string
      assessedAt: string
      check: boolean
    } = {
      resolverVersion: DOSSIER_COMPLETION_RESOLVER_VERSION,
      assessedRecords: assessments.length,
      complete,
      incomplete: assessments.length - complete,
      byState,
      bySection,
      nonTerminalBySection,
      humanReadSuggestedRecords: humanRead,
      inputDigest: createHash('sha256')
        .update(assessments.map((a) => a.inputDigest).join('\n'))
        .digest('hex'),
      assessedAt: new Date().toISOString().slice(0, 10),
      check: checkOnly,
    }
    console.log(
      `[completion] ${summary.complete} complete · ${summary.incomplete} incomplete · ${unchanged} unchanged · ${changed} changed · ${checkOnly ? 'check only' : `${written} rows upserted`} · ${humanRead} records with a suggested human read`,
    )
    if (onlySlugs.size === 0 && !Number.isFinite(limit) && !checkOnly) {
      mkdirSync(outDir, { recursive: true })
      writeFileSync(join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
      const incomplete = assessments
        .filter((a) => a.status !== 'COMPLETE')
        .map((a) =>
          stableJsonStringify({
            slug: a.canonicalSlug,
            entityClass: a.entityClass,
            nonTerminal: a.nonTerminalSectionIds,
            blocked: a.sections
              .filter((s) => s.blockedReason)
              .map((s) => ({ section: s.sectionId, reason: s.blockedReason })),
          }),
        )
      writeFileSync(
        join(outDir, 'incomplete.ndjson'),
        incomplete.length > 0 ? `${incomplete.join('\n')}\n` : '',
      )
      console.log(
        `[completion] wrote ${outDir}/summary.json and incomplete.ndjson (${incomplete.length} rows)`,
      )
    }
    if (checkOnly && changed > 0) {
      process.exitCode = 1
      console.error(`[completion] ${changed} stored assessment(s) differ from a fresh assessment`)
    }
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
