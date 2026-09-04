/**
 * Phase 2 step `registry-match` — match the ClinicalTrials.gov snapshot to canonical pages.
 *
 * Reuses the exact-name matching contract of scripts/dossier-completion/match-trial-registry.ts:
 * the same `normalizeInterventionName` (salt, dose and dosage-form words stripped), the same
 * four-character minimum key length, the same `summarizeStudy` shape. Nothing fuzzy.
 *
 * The key set is different: it is keyed on canonical pages, not on database entities, and it uses
 * only the page's displayName plus synonyms recorded as inn / usan / ban / brand / salt / code.
 * The `common` synonym kind is excluded on purpose: it carries collected free text (sirolimus
 * lists "everolimus" and "mtor inhibitors" under it) and matching on it would attribute one
 * registration to the wrong compound.
 *
 * Existing pages keep the matches already stored against their slug (the same snapshot, capped at
 * 250 studies per record by the earlier run) and gain whatever this pass adds.
 *
 *   npx tsx scripts/corpus-20k/registry/match.ts
 */
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline'

import {
  MINIMUM_MATCH_KEY_LENGTH,
  normalizeInterventionName,
  summarizeStudy,
  type RegistryStudySummary,
} from '@/lib/dossier-completion/trial-registry-match'

const ROOT = process.cwd()
const SNAPSHOT = join(ROOT, '..', 'rnawiki-ingest-data', 'clinicaltrials', '20260901T090005')
const STORED_TSV =
  '/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/944e8731-0646-45f5-ba76-96bc86e4e6b6/scratchpad/stored-matches.tsv'
const OUT = join(ROOT, 'data', 'corpus-20k', 'registry')
const MATCH_KINDS = new Set(['inn', 'usan', 'ban', 'brand', 'salt', 'code'])
const BATCH = 250
const LIST_CAP = 500
const TWO_YEARS_MS = 2 * 365.25 * 24 * 3600 * 1000
const ACTIVE_STATUSES = new Set([
  'RECRUITING',
  'NOT_YET_RECRUITING',
  'ENROLLING_BY_INVITATION',
  'ACTIVE_NOT_RECRUITING',
  'AVAILABLE',
])

interface Page {
  key: string
  displayName: string
  existingSlug: string | null
}
type Hit = { nct: string; matchedName: string; role: string }

/** Every registered intervention name and other-name, with where it was printed. */
function namedInterventions(
  raw: unknown,
): Array<{ name: string; role: 'intervention' | 'otherName' }> {
  const study = raw as {
    protocolSection?: {
      armsInterventionsModule?: { interventions?: Array<{ name?: string; otherNames?: string[] }> }
    }
  }
  const out: Array<{ name: string; role: 'intervention' | 'otherName' }> = []
  for (const intervention of study.protocolSection?.armsInterventionsModule?.interventions ?? []) {
    if (typeof intervention?.name === 'string' && intervention.name.trim())
      out.push({ name: intervention.name.trim(), role: 'intervention' })
    for (const other of intervention?.otherNames ?? [])
      if (typeof other === 'string' && other.trim())
        out.push({ name: other.trim(), role: 'otherName' })
  }
  return out
}

function parseDate(value: string | null): number | null {
  if (!value) return null
  const match = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/u.exec(value)
  if (!match) return null
  return Date.UTC(Number(match[1]), Number(match[2] ?? '01') - 1, Number(match[3] ?? '01'))
}

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1
    ? sorted[middle]!
    : Math.round(((sorted[middle - 1]! + sorted[middle]!) / 2) * 100) / 100
}

async function main(): Promise<void> {
  mkdirSync(join(OUT, 'matches'), { recursive: true })
  mkdirSync(join(OUT, 'aggregates'), { recursive: true })

  // ---------------------------------------------------------------- pages and wanted keys
  const pages: Page[] = []
  const wanted = new Map<string, number[]>()
  const bySlug = new Map<string, number>()
  let nameCount = 0
  {
    const text = readFileSync(
      join(ROOT, 'data', 'corpus-20k', 'identity', 'canonical.ndjson'),
      'utf8',
    )
    for (const line of text.split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as {
        key: string
        displayName: string
        existingSlug: string | null
        synonyms?: Array<{ name: string; kind: string }>
      }
      const index = pages.length
      pages.push({
        key: record.key,
        displayName: record.displayName,
        existingSlug: record.existingSlug ?? null,
      })
      if (record.existingSlug) bySlug.set(record.existingSlug, index)
      const names = [record.displayName]
      for (const synonym of record.synonyms ?? [])
        if (MATCH_KINDS.has(synonym.kind) && typeof synonym.name === 'string')
          names.push(synonym.name)
      const seen = new Set<string>()
      for (const name of names) {
        const key = normalizeInterventionName(name)
        if (key.length < MINIMUM_MATCH_KEY_LENGTH || seen.has(key)) continue
        seen.add(key)
        nameCount += 1
        const owners = wanted.get(key) ?? []
        owners.push(index)
        wanted.set(key, owners)
      }
    }
  }
  // Reconciliation collapses several existing slugs onto one canonical page.
  {
    const path = join(ROOT, 'data', 'corpus-20k', 'reconciliation', 'matched.ndjson')
    const byKey = new Map(pages.map((page, index) => [page.key, index]))
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as {
        key: string
        existingSlugs?: string[]
        pageSlug?: string
      }
      const index = byKey.get(record.key)
      if (index === undefined) continue
      for (const slug of record.existingSlugs ?? []) if (!bySlug.has(slug)) bySlug.set(slug, index)
      if (record.pageSlug && !bySlug.has(record.pageSlug)) bySlug.set(record.pageSlug, index)
    }
  }
  const ambiguousKeys = [...wanted.values()].filter((owners) => owners.length > 1).length
  console.log(
    `[registry-match] ${pages.length} pages · ${nameCount} names · ${wanted.size} distinct keys (${ambiguousKeys} owned by more than one page)`,
  )

  // ---------------------------------------------------------------- already-stored matches
  const stored = new Map<number, Map<string, Hit>>()
  const neededNct = new Set<string>()
  let storedPairs = 0
  let storedUnmappedSlugs = 0
  const unmappedSlugSet = new Set<string>()
  if (existsSync(STORED_TSV)) {
    for (const line of readFileSync(STORED_TSV, 'utf8').split('\n')) {
      if (!line.trim()) continue
      const [slug, nct, matchedName] = line.split('\t')
      if (!slug || !nct) continue
      const index = bySlug.get(slug)
      if (index === undefined) {
        storedPairs += 1
        if (!unmappedSlugSet.has(slug)) {
          unmappedSlugSet.add(slug)
          storedUnmappedSlugs += 1
        }
        continue
      }
      const perPage = stored.get(index) ?? new Map<string, Hit>()
      if (!perPage.has(nct))
        perPage.set(nct, { nct, matchedName: matchedName ?? '', role: 'stored' })
      stored.set(index, perPage)
      neededNct.add(nct)
      storedPairs += 1
    }
  }
  console.log(
    `[registry-match] ${storedPairs} stored pairs over ${stored.size} pages (${storedUnmappedSlugs} slugs not mapped to a canonical page)`,
  )

  // ---------------------------------------------------------------- stream the snapshot
  const manifest = JSON.parse(readFileSync(join(SNAPSHOT, 'manifest.json'), 'utf8')) as {
    schema: string
    consistent: boolean
    studies: number
    dataTimestamp: string
    studiesSha256: string
  }
  if (manifest.schema !== 'rnawiki-clinicaltrials-snapshot/v1' || !manifest.consistent)
    throw new Error(`${SNAPSHOT} is not a consistent snapshot`)

  const matches = new Map<number, Map<string, Hit>>()
  const summaries = new Map<string, RegistryStudySummary>()
  let offered = 0
  const reader = createInterface({
    input: createReadStream(join(SNAPSHOT, 'studies.ndjson'), { encoding: 'utf8' }),
    crlfDelay: Number.POSITIVE_INFINITY,
  })
  for await (const line of reader) {
    if (!line.trim()) continue
    offered += 1
    if (offered % 100_000 === 0) console.log(`[registry-match] ${offered} studies read`)
    const raw = JSON.parse(line) as unknown
    const names = namedInterventions(raw)
    const nct = (raw as { protocolSection?: { identificationModule?: { nctId?: string } } })
      .protocolSection?.identificationModule?.nctId
    const isStored = typeof nct === 'string' && neededNct.has(nct)
    if (names.length === 0 && !isStored) continue
    const hits = new Map<number, Hit>()
    const allNames: string[] = []
    for (const { name, role } of names) {
      const key = normalizeInterventionName(name)
      if (key.length < MINIMUM_MATCH_KEY_LENGTH) continue
      const owners = wanted.get(key)
      if (!owners) continue
      allNames.push(name)
      for (const owner of owners) {
        const existing = hits.get(owner)
        // Deterministic pick: an intervention name beats an other-name, then the smallest string.
        if (
          !existing ||
          (existing.role === 'otherName' && role === 'intervention') ||
          (existing.role === role && name < existing.matchedName)
        )
          hits.set(owner, { nct: '', matchedName: name, role })
      }
    }
    if (hits.size === 0 && !isStored) continue
    const summary = summarizeStudy(raw, allNames)
    if (!summary) continue
    if (hits.size > 0 || isStored) summaries.set(summary.nctId, summary)
    for (const [index, hit] of hits) {
      const perPage = matches.get(index) ?? new Map<string, Hit>()
      perPage.set(summary.nctId, { ...hit, nct: summary.nctId })
      matches.set(index, perPage)
    }
  }
  if (offered !== manifest.studies)
    throw new Error(`snapshot holds ${offered} studies but its manifest says ${manifest.studies}`)

  // ---------------------------------------------------------------- union and aggregate
  const now = Date.now()
  let pagesWithStudies = 0
  let studiesMatched = 0
  let newPairs = 0
  let storedOnlyPairs = 0
  let over250 = 0
  let missingSummary = 0
  const matchRows: string[] = []
  const aggregateRows: string[] = []
  const rowPageIndex: number[] = []

  for (let index = 0; index < pages.length; index += 1) {
    const fresh = matches.get(index)
    const prior = stored.get(index)
    if (!fresh && !prior) continue
    const union = new Map<string, Hit>()
    for (const [nct, hit] of fresh ?? []) union.set(nct, hit)
    for (const [nct, hit] of prior ?? []) {
      if (union.has(nct)) continue
      union.set(nct, hit)
      storedOnlyPairs += 1
    }
    newPairs += fresh?.size ?? 0
    const nctIds = [...union.values()].sort((a, b) => a.nct.localeCompare(b.nct))
    if (nctIds.length === 0) continue
    pagesWithStudies += 1
    studiesMatched += nctIds.length
    if (nctIds.length > 250) over250 += 1
    const page = pages[index]!
    matchRows.push(JSON.stringify({ key: page.key, nctIds }))
    rowPageIndex.push(index)

    // ---- aggregates
    const studies = nctIds
      .map((hit) => summaries.get(hit.nct))
      .filter((study): study is RegistryStudySummary => {
        if (!study) missingSummary += 1
        return Boolean(study)
      })
    const byPhase: Record<string, number> = {}
    const byOverallStatus: Record<string, number> = {}
    const stopped: Array<{ nct: string; status: string | null; whyStopped: string }> = []
    const enrolments: number[] = []
    const conditions = new Map<string, true>()
    const outcomes: Array<{ nct: string; measure: string; timeFrame: string | null }> = []
    const outcomeSeen = new Set<string>()
    const completedNoResults: Array<{ nct: string; completionDate: string | null }> = []
    const ongoing: Array<{
      nct: string
      title: string | null
      n: number | null
      primaryOutcome: string | null
      completionDate: string | null
    }> = []
    let hasResults = 0
    let firstStart: string | null = null
    let firstStartMs: number | null = null
    let longest: { nct: string; days: number; startDate: string; completionDate: string } | null =
      null
    let conditionsTruncated = false
    let outcomesTruncated = false

    for (const study of studies) {
      const phases = study.phases.length > 0 ? study.phases : ['NA_OR_UNSTATED']
      for (const phase of phases) byPhase[phase] = (byPhase[phase] ?? 0) + 1
      const status = study.overallStatus ?? 'UNSTATED'
      byOverallStatus[status] = (byOverallStatus[status] ?? 0) + 1
      if (study.whyStopped)
        stopped.push({
          nct: study.nctId,
          status: study.overallStatus,
          whyStopped: study.whyStopped,
        })
      if (typeof study.enrollment.count === 'number') enrolments.push(study.enrollment.count)
      if (study.hasResults) hasResults += 1
      for (const condition of study.conditions) {
        if (conditions.size >= LIST_CAP) {
          conditionsTruncated = true
          break
        }
        conditions.set(condition, true)
      }
      for (const outcome of study.primaryOutcomes) {
        if (outcomeSeen.has(outcome.measure)) continue
        if (outcomes.length >= LIST_CAP) {
          outcomesTruncated = true
          break
        }
        outcomeSeen.add(outcome.measure)
        outcomes.push({ nct: study.nctId, measure: outcome.measure, timeFrame: outcome.timeFrame })
      }
      const startMs = parseDate(study.startDate)
      if (startMs !== null && (firstStartMs === null || startMs < firstStartMs)) {
        firstStartMs = startMs
        firstStart = study.startDate
      }
      const endMs = parseDate(study.completionDate)
      if (startMs !== null && endMs !== null && endMs >= startMs) {
        const days = Math.round((endMs - startMs) / 86_400_000)
        if (!longest || days > longest.days)
          longest = {
            nct: study.nctId,
            days,
            startDate: study.startDate!,
            completionDate: study.completionDate!,
          }
      }
      if (
        study.overallStatus === 'COMPLETED' &&
        !study.hasResults &&
        endMs !== null &&
        now - endMs > TWO_YEARS_MS
      )
        completedNoResults.push({ nct: study.nctId, completionDate: study.completionDate })
      if (study.overallStatus && ACTIVE_STATUSES.has(study.overallStatus))
        ongoing.push({
          nct: study.nctId,
          title: study.briefTitle,
          n: study.enrollment.count,
          primaryOutcome: study.primaryOutcomes[0]?.measure ?? null,
          completionDate: study.completionDate,
        })
    }

    aggregateRows.push(
      JSON.stringify({
        key: page.key,
        displayName: page.displayName,
        studies: nctIds.length,
        summarised: studies.length,
        byPhase,
        byOverallStatus,
        stopped,
        enrolment: {
          max: enrolments.length ? Math.max(...enrolments) : null,
          median: median(enrolments),
          n: enrolments.length,
        },
        longestDuration: longest,
        hasResults,
        completedOverTwoYearsWithoutResults: completedNoResults,
        primaryOutcomes: outcomes,
        primaryOutcomesTruncated: outcomesTruncated,
        conditions: [...conditions.keys()],
        conditionsTruncated,
        ongoing,
        firstStartDate: firstStart,
      }),
    )
  }

  const files: Array<{ path: string; records: number }> = []
  const writeBatches = (rows: string[], kind: string): void => {
    for (let start = 0, batch = 1; start < rows.length; start += BATCH, batch += 1) {
      const slice = rows.slice(start, start + BATCH)
      const path = join(OUT, kind, `batch-${String(batch).padStart(4, '0')}.ndjson`)
      writeFileSync(path, `${slice.join('\n')}\n`, 'utf8')
      files.push({ path: path.slice(ROOT.length + 1), records: slice.length })
    }
  }
  writeBatches(matchRows, 'matches')
  writeBatches(aggregateRows, 'aggregates')

  const summary = {
    schema: 'rnawiki-corpus-20k-registry-match/v1',
    snapshot: `clinicaltrials.gov/api/v2 studies snapshot ${manifest.dataTimestamp} sha256:${manifest.studiesSha256}`,
    studiesInSnapshot: offered,
    pages: pages.length,
    matchKeys: wanted.size,
    ambiguousKeys,
    pagesWithStudies,
    studiesMatched,
    distinctStudiesMatched: summaries.size,
    freshPairs: newPairs,
    storedOnlyPairs,
    storedPairs,
    storedSlugsNotMappedToAPage: storedUnmappedSlugs,
    pagesOver250Studies: over250,
    nctsWithoutASummary: missingSummary,
    listCap: LIST_CAP,
    files,
  }
  writeFileSync(join(OUT, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify({ ...summary, files: files.length }))
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exit(1)
})
