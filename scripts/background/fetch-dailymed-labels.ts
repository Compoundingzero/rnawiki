import 'dotenv/config'
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { eq, sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { drugs } from '@/db/schema'
import { extractBackgroundFromLabel, type LabelArtifact } from '@/lib/background/label-extraction'
import type { MedicineRecordedBackground } from '@/lib/background/types'

/**
 * Fill thin medicine records from DailyMed, one label at a time.
 *
 * `build-extracted-background.ts` already does this from openFDA's bulk archive, and it is the
 * right tool when the archive is on disk: one download, one reduction pass, no API calls. It left
 * 1,475 FDA-approved medicines with no mechanism text, and the cause is not the parser — the
 * parser handles a label that carries its mechanism inside Clinical Pharmacology rather than in a
 * dedicated section. The cause is that those medicines never had a label artifact built for them,
 * because the bulk index matched on name and their name did not match.
 *
 * For 727 of them we already recorded that a label exists and which set ids it has, in
 * `recorded_background.labelPresence.sampleLabelIds`. That is a retrieval key sitting unused. This
 * script uses it, falls back to DailyMed's own name search for the rest, fetches the SPL document,
 * turns it into the same `LabelArtifact` the bulk path produces, and runs it through the same
 * extractor — so every value still arrives with the label sentence it was read out of, and every
 * envelope still has to pass the background engine before it is written.
 *
 * What it will not do: write a sentence that was not printed on a label. Every string this script
 * stores is `textAsRecorded`, copied verbatim, with `source.excerpt` proving it was read rather
 * than remembered and the SPL set id naming the document it came from.
 *
 *   npx tsx scripts/background/fetch-dailymed-labels.ts --limit 50 --dry-run
 *   npx tsx scripts/background/fetch-dailymed-labels.ts --concurrency 6
 *   npx tsx scripts/background/fetch-dailymed-labels.ts --status 'Withdrawn from Market'
 */

/**
 * LOINC section codes to the openFDA field names the extractor reads.
 *
 * DailyMed publishes Structured Product Labeling, where each section carries a LOINC code rather
 * than a name. openFDA's JSON flattens the same documents into named fields. Mapping one to the
 * other is what lets a document fetched here go through the extractor written for the other.
 */
const SECTION_BY_LOINC: Record<string, string> = {
  '34067-9': 'indications_and_usage',
  '43679-0': 'mechanism_of_action',
  '34090-1': 'clinical_pharmacology',
  '43682-4': 'pharmacokinetics',
  '34070-3': 'contraindications',
  '34071-8': 'warnings_and_cautions',
  '43685-7': 'warnings_and_cautions',
  '34084-4': 'adverse_reactions',
  '34066-1': 'boxed_warning',
  '34089-3': 'description',
  '43678-2': 'dosage_forms_and_strengths',
  '34069-5': 'how_supplied',
  '43684-0': 'use_in_specific_populations',
}

/** Modules a curated record owns outright; an extracted pass never touches them. */
const CURATED_WINS = true

interface Target {
  slug: string
  name: string
  tradeName: string | null
  approvalStatus: string
  background: MedicineRecordedBackground | null
}

interface Args {
  limit: number
  concurrency: number
  dryRun: boolean
  statuses: string[]
  out: string
}

function parseArgs(argv: readonly string[]): Args {
  const args: Args = {
    limit: Number.POSITIVE_INFINITY,
    concurrency: 5,
    dryRun: false,
    statuses: [
      'FDA Approved',
      'Accelerated Approval',
      'EMA Approved',
      'Withdrawn from Market',
      'Controlled / No Approved Use',
      'Off-Label / Compounded',
      'Phase 3 Clinical Trial',
      'Phase 2 Investigational',
    ],
    out: 'data/background/dailymed-acquisition.ndjson',
  }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const next = argv[index + 1]
    if (flag === '--limit' && next) ((args.limit = Number.parseInt(next, 10)), (index += 1))
    else if (flag === '--concurrency' && next)
      ((args.concurrency = Number.parseInt(next, 10)), (index += 1))
    else if (flag === '--dry-run') args.dryRun = true
    else if (flag === '--status' && next) ((args.statuses = [next]), (index += 1))
    else if (flag === '--out' && next) ((args.out = next), (index += 1))
  }
  return args
}

/* --------------------------------------------------------------- fetching */

async function getJson<T>(url: string, attempt = 0): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'rnawiki-background-acquisition (+https://rnawiki.com)' },
      signal: AbortSignal.timeout(45_000),
    })
    // openFDA answers 404 for "no results", which is an absence rather than a failure.
    if (response.status === 404) return null
    if (response.status === 429 || response.status >= 500) {
      if (attempt >= 3) return null
      await new Promise((done) => setTimeout(done, 2000 * (attempt + 1)))
      return getJson<T>(url, attempt + 1)
    }
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    if (attempt >= 2) return null
    await new Promise((done) => setTimeout(done, 1500 * (attempt + 1)))
    return getJson<T>(url, attempt + 1)
  }
}

interface OpenFdaLabel {
  set_id?: string
  effective_time?: string
  openfda?: {
    brand_name?: string[]
    generic_name?: string[]
    substance_name?: string[]
    route?: string[]
    unii?: string[]
    rxcui?: string[]
  }
  [section: string]: unknown
}

/**
 * Labels that name this substance and nothing else.
 *
 * openFDA returns each label's sections under the same field names the extractor reads, and
 * `openfda.substance_name` says how many active substances the document declares. Filtering on a
 * single name here is the same boundary the extractor enforces internally, applied before the
 * network cost rather than after it: a sentence printed on a thirty-one-ingredient label belongs
 * to none of those ingredients individually.
 */
async function singleSubstanceLabels(name: string): Promise<OpenFdaLabel[]> {
  const quoted = `"${name.replace(/"/gu, ' ').trim()}"`
  const queries = [
    `openfda.generic_name:${encodeURIComponent(quoted)}`,
    `openfda.substance_name:${encodeURIComponent(quoted)}`,
    `openfda.brand_name:${encodeURIComponent(quoted)}`,
  ]
  for (const query of queries) {
    const body = await getJson<{ results?: OpenFdaLabel[] }>(
      `https://api.fda.gov/drug/label.json?search=${query}&limit=8`,
    )
    const results = (body?.results ?? []).filter(
      (label) => (label.openfda?.substance_name ?? []).length === 1,
    )
    if (results.length > 0) return results
  }
  return []
}

/* ---------------------------------------------------------------- parsing */

/**
 * openFDA prints the section's own heading as the first words of the section text, so a sentence
 * lifted from the top of Clinical Pharmacology arrives as "CLINICAL PHARMACOLOGY Atenolol is a…".
 * That is faithful to the document and wrong to show a reader, so the heading is dropped before the
 * extractor sees it. Only a leading run of capitals or a "Pharmacodynamics:"-style label is removed;
 * the sentence itself is untouched.
 */
function stripSectionHeading(text: string): string {
  return text
    .replace(/^(?:[A-Z][A-Z0-9 ,/&'’()-]{6,80}?)(?=\s+[A-Z][a-z])/u, '')
    .replace(
      /^\s*(?:Pharmacodynamics|Pharmacokinetics|Mechanism of Action|General|Introduction)\s*:?\s*/u,
      '',
    )
    .trim()
}

function sectionText(value: unknown): string | undefined {
  if (typeof value === 'string') return value.replace(/\s+/gu, ' ').trim() || undefined
  if (Array.isArray(value)) {
    const joined = value
      .filter((part): part is string => typeof part === 'string')
      .join(' ')
      .replace(/\s+/gu, ' ')
      .trim()
    return joined || undefined
  }
  return undefined
}

/** The section names the extractor reads, in the order a label usually carries them. */
const WANTED_SECTIONS = [
  'indications_and_usage',
  'mechanism_of_action',
  'clinical_pharmacology',
  'pharmacokinetics',
  'contraindications',
  'warnings_and_cautions',
  'adverse_reactions',
  'boxed_warning',
  'description',
  'dosage_forms_and_strengths',
  'how_supplied',
  'use_in_specific_populations',
] as const

/** Turn one openFDA label record into the artifact shape the extractor expects. */
function artifactFromLabel(label: OpenFdaLabel): LabelArtifact | null {
  const sections: Record<string, string> = {}
  for (const field of WANTED_SECTIONS) {
    const text = sectionText(label[field])
    if (!text) continue
    const cleaned = stripSectionHeading(text)
    if (cleaned.length >= 40) sections[field] = cleaned
  }
  if (Object.keys(sections).length === 0) return null
  const setId = label.set_id
  if (!setId) return null
  const openfda = label.openfda ?? {}
  return {
    setId,
    declaredSubstanceCount: (openfda.substance_name ?? []).length || 1,
    ...(label.effective_time ? { effectiveTime: label.effective_time } : {}),
    brandNames: (openfda.brand_name ?? []).slice(0, 12),
    genericNames: (openfda.generic_name ?? []).slice(0, 12),
    routes: (openfda.route ?? []).slice(0, 8),
    ...(openfda.unii?.[0] ? { unii: openfda.unii[0] } : {}),
    ...(openfda.rxcui?.[0] ? { rxcui: openfda.rxcui[0] } : {}),
    sections,
  }
}

/* ---------------------------------------------------------------- merging */

/**
 * Merge an extracted envelope into whatever the record already holds.
 *
 * A curated record always wins: hand-authored work is never replaced by a parser, which is the
 * same boundary `build-extracted-background.ts` keeps. Within an extracted record, a module that
 * already has content is left alone and only genuinely absent modules are filled, so re-running
 * this is safe and the yield figure means what it says.
 */
function mergeBackground(
  existing: MedicineRecordedBackground | null,
  incoming: MedicineRecordedBackground,
): { merged: MedicineRecordedBackground; gained: string[] } {
  if (!existing) {
    return { merged: incoming, gained: Object.keys(incoming).filter(isModuleKey) }
  }
  if (CURATED_WINS && existing.provenanceTier === 'curated') {
    return { merged: existing, gained: [] }
  }
  const merged = { ...existing } as Record<string, unknown>
  const gained: string[] = []
  for (const [key, value] of Object.entries(incoming)) {
    if (!isModuleKey(key)) continue
    if (merged[key] !== undefined && merged[key] !== null) continue
    merged[key] = value
    gained.push(key)
  }
  // The record now rests on a second document, so say when it was read.
  if (gained.length > 0) merged['authoredAt'] = incoming.authoredAt
  return { merged: merged as unknown as MedicineRecordedBackground, gained }
}

const ENVELOPE_KEYS = new Set(['version', 'authoredAt', 'provenanceTier'])
function isModuleKey(key: string): boolean {
  return !ENVELOPE_KEYS.has(key)
}

/* ------------------------------------------------------------------- main */

interface Outcome {
  slug: string
  name: string
  status: 'filled' | 'no_label' | 'label_without_content' | 'unreachable' | 'curated'
  setIds: string[]
  gained: string[]
  triedSearch: boolean
}

async function processTarget(target: Target, retrievedAt: string): Promise<Outcome> {
  const base: Outcome = {
    slug: target.slug,
    name: target.name,
    status: 'no_label',
    setIds: [],
    gained: [],
    triedSearch: true,
  }
  if (target.background?.provenanceTier === 'curated') return { ...base, status: 'curated' }

  let labels = await singleSubstanceLabels(target.name)
  if (labels.length === 0 && target.tradeName) {
    labels = await singleSubstanceLabels(target.tradeName)
  }
  if (labels.length === 0) return base
  base.setIds = labels.flatMap((label) => (label.set_id ? [label.set_id] : [])).slice(0, 4)

  let background = target.background
  const gained: string[] = []

  for (const label of labels) {
    const artifact = artifactFromLabel(label)
    if (!artifact) continue
    const { background: extracted } = extractBackgroundFromLabel({
      artifact,
      options: { retrievedAt, sourceLabel: `${target.name} label` },
    })
    if (!extracted) continue
    const result = mergeBackground(background, extracted)
    background = result.merged
    gained.push(...result.gained)
    const filled = background as unknown as Record<string, unknown>
    if (filled['mechanism'] && filled['recordedUses']) break
  }

  if (gained.length === 0) return { ...base, status: 'label_without_content' }
  return {
    ...base,
    status: 'filled',
    gained: [...new Set(gained)],
    ...{ background },
  } as Outcome & { background: MedicineRecordedBackground }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const retrievedAt = new Date().toISOString().slice(0, 10)

  const rows = await db
    .select({
      slug: drugs.slug,
      name: drugs.name,
      tradeName: drugs.tradeName,
      approvalStatus: drugs.approvalStatus,
      background: drugs.recordedBackground,
    })
    .from(drugs)
    .where(
      sql`${drugs.approvalStatus}::text = any(${sql.raw(
        `array[${args.statuses.map((value) => `'${value.replace(/'/gu, "''")}'`).join(',')}]`,
      )})
        and (${drugs.recordedBackground} is null
             or not jsonb_exists(${drugs.recordedBackground}, 'mechanism')
             or not jsonb_exists(${drugs.recordedBackground}, 'recordedUses'))`,
    )
    /*
     * Ordered by how likely the fetch is to yield anything, because the alphabet is not.
     *
     * The first pass ran alphabetically and spent its first hundred requests on cosmetic
     * excipients — "0.01-0.2 Mole Percent Bisacrylamide", "1,2-Hexanediol" — whose only labels name
     * thirty-one ingredients. The extractor refuses those, correctly: a sentence printed on a
     * thirty-one-ingredient label belongs to none of them individually. `singleSubstanceLabelCount`
     * is already recorded and says how many labels name this substance alone, which is exactly the
     * condition the extractor needs, so it leads.
     */
    .orderBy(
      sql`coalesce((${drugs.recordedBackground}->'labelPresence'->>'singleSubstanceLabelCount')::int, 0) desc,
          case when ${drugs.recordedBackground}->'labelPresence' is null then 1 else 2 end,
          ${drugs.slug}`,
    )

  const targets = (rows as Target[]).slice(0, Number.isFinite(args.limit) ? args.limit : undefined)
  process.stdout.write(
    `${targets.length} medicines to try · concurrency ${args.concurrency}${args.dryRun ? ' · dry run' : ''}\n`,
  )

  const outPath = resolve(args.out)
  mkdirSync(dirname(outPath), { recursive: true })
  if (!existsSync(outPath)) writeFileSync(outPath, '')

  const counts = new Map<string, number>()
  const moduleGain = new Map<string, number>()
  let done = 0
  let cursor = 0
  const started = Date.now()

  const worker = async (): Promise<void> => {
    for (;;) {
      const target = targets[cursor]
      if (!target) return
      cursor += 1
      const outcome = (await processTarget(target, retrievedAt)) as Outcome & {
        background?: MedicineRecordedBackground
      }
      done += 1
      counts.set(outcome.status, (counts.get(outcome.status) ?? 0) + 1)
      for (const gained of outcome.gained) {
        moduleGain.set(gained, (moduleGain.get(gained) ?? 0) + 1)
      }
      appendFileSync(
        outPath,
        `${JSON.stringify({
          slug: outcome.slug,
          name: outcome.name,
          status: outcome.status,
          setIds: outcome.setIds,
          gained: outcome.gained,
          triedSearch: outcome.triedSearch,
        })}\n`,
      )
      if (!args.dryRun && outcome.status === 'filled' && outcome.background) {
        await db
          .update(drugs)
          .set({ recordedBackground: outcome.background })
          .where(eq(drugs.slug, outcome.slug))
      }
      if (done % 25 === 0) {
        const rate = done / ((Date.now() - started) / 1000)
        process.stdout.write(
          `${done}/${targets.length} · ${rate.toFixed(1)}/s · ${JSON.stringify(Object.fromEntries(counts))}\n`,
        )
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, args.concurrency) }, worker))

  const summary = {
    attempted: targets.length,
    byOutcome: Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1])),
    modulesGained: Object.fromEntries([...moduleGain.entries()].sort((a, b) => b[1] - a[1])),
    report: args.out,
  }
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
  writeFileSync(
    resolve('data/background/dailymed-acquisition-summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
  )
}

void main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDatabasePool()
  })
