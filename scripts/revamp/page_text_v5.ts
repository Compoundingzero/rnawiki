/**
 * Phase 4 — render the reading text of every corpus page from the v3 corpus.
 *
 * This is the corpus-20k page-text step (`scripts/corpus-20k/render/page-text.ts`) run over the
 * revamp inputs, with the Phase 4 blocks in place: where it's registered, the interactions and the
 * checked-sources statement, generic and patent, the controlled-substance schedules, and the Tier 3
 * computed sections. It calls the same `renderPage` the React template calls, so the words the
 * overlap ruler measures and the words a reader sees are one function's output, not two.
 *
 *   npx tsx scripts/revamp/page_text_v5.ts
 *   npx tsx scripts/revamp/page_text_v5.ts --limit 200 --out data/revamp/render-v5-smoke
 *
 * Outputs, under `--out` (default `data/revamp/render-v5`):
 *   text/batch-0001.ndjson …   one `RenderedPage` per line, the shape the overlap ruler reads
 *   pages-all.ndjson           every rendered page in one file, key-sorted
 *   provenance/batch-0001.ndjson …  `{key, provenance: [{sentence, fields}]}` per page (4.7)
 *   summary.json               counts, and what the inputs did not supply
 *
 * Trial reassignment. `data/revamp/identity/trial-reassignments-v3.csv` moves a registry study from
 * a salt, ester or stereoisomer page to the parent the registry actually named (Phase 3 R14, extended
 * in §6). The registry aggregate this renderer reads was computed before that move, so a moved study
 * is removed here: every per-trial list is filtered by NCT identifier, and the counts that can be
 * recomputed from the aggregate's own `perTrial` array are recomputed. A count that cannot be
 * recomputed from what the aggregate holds — `hasResults`, which carries no per-trial flag — is
 * dropped rather than restated with studies in it that belong to another page.
 *
 * Memory. The inputs total roughly 500 MB of NDJSON. Pages are assembled in contiguous shards of
 * the sorted key list; each shard rereads the inputs and parses only its own rows.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  canonicalSeedId,
  type FieldEntry,
  type QuestionBlock,
} from '../corpus-20k/questions/derive'
import {
  renderPage,
  type PageBlocks,
  type PageBundle,
  type ProvenanceEntry,
  type Relation,
  type RenderedPage,
  type Synonym,
} from '../corpus-20k/render/page-text'

/* ------------------------------------------------------------------ small accessors */

function asObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null) return []
  return [value]
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.replace(/\s+/g, ' ').trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : undefined
}

const KEY_RE = /"key"\s*:\s*"((?:[^"\\]|\\.)*)"/

function lineKey(line: string): string | undefined {
  const match = KEY_RE.exec(line)
  if (!match || match[1] === undefined) return undefined
  try {
    return JSON.parse(`"${match[1]}"`) as string
  } catch {
    return match[1]
  }
}

async function listNdjson(dir: string): Promise<string[]> {
  const out: string[] = []
  let entries: import('node:fs').Dirent[]
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await listNdjson(full)))
    else if (entry.isFile() && entry.name.endsWith('.ndjson')) out.push(full)
  }
  return out
}

async function eachLine(
  file: string,
  fn: (line: string, key: string | undefined) => void,
): Promise<void> {
  const text = await fs.readFile(file, 'utf8')
  let start = 0
  while (start < text.length) {
    let end = text.indexOf('\n', start)
    if (end === -1) end = text.length
    const line = text.slice(start, end)
    start = end + 1
    if (line.length < 2) continue
    fn(line, lineKey(line))
  }
}

/** A minimal CSV reader for the two identity files: a header row and quoted commas. */
function readCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"'
          index += 1
        } else quoted = false
      } else field += character
      continue
    }
    if (character === '"') quoted = true
    else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (character !== '\r') field += character
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  const header = rows.shift() ?? []
  return rows
    .filter((values) => values.some((value) => value.length > 0))
    .map((values) => {
      const record: Record<string, string> = {}
      header.forEach((name, index) => {
        record[name] = values[index] ?? ''
      })
      return record
    })
}

/* ------------------------------------------------------------------ trial reassignment */

/**
 * The registry aggregate with the studies Phase 3 moved to another page removed.
 *
 * Every list in the aggregate carries the NCT identifier, so the lists are filtered exactly. The
 * derived counts are recomputed from `perTrial`, which the v3 aggregate carries for 8,615 of the
 * 8,663 pages that have one; where `perTrial` is absent, only `studies` is reduced by the number of
 * identifiers removed, and every count that cannot be recomputed is dropped.
 */
export function aggregateWithoutMovedStudies(
  aggregate: Record<string, unknown>,
  moved: ReadonlySet<string>,
): Record<string, unknown> {
  if (moved.size === 0) return aggregate
  const out: Record<string, unknown> = { ...aggregate }
  const keeps = (item: unknown): boolean => {
    const nct = asString(asObject(item)?.nct)
    return nct === undefined || !moved.has(nct)
  }
  for (const field of [
    'perTrial',
    'stopped',
    'primaryOutcomes',
    'completedOverTwoYearsWithoutResults',
    'ongoing',
    'trials',
  ]) {
    const held = aggregate[field]
    if (Array.isArray(held)) out[field] = held.filter(keeps)
  }
  const perTrial = Array.isArray(out.perTrial) ? out.perTrial : undefined
  if (perTrial !== undefined) {
    out.studies = perTrial.length
    out.summarised = perTrial.length
    const byPhase: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    const enrolments: number[] = []
    for (const item of perTrial) {
      const row = asObject(item)
      if (!row) continue
      const phase = asString(row.phase)
      if (phase) byPhase[phase] = (byPhase[phase] ?? 0) + 1
      const status = asString(row.status)
      if (status) byStatus[status] = (byStatus[status] ?? 0) + 1
      const enrolment = asNumber(row.enrollment) ?? asNumber(row.enrolment)
      if (enrolment !== undefined) enrolments.push(enrolment)
    }
    out.byPhase = byPhase
    out.byOverallStatus = byStatus
    if (enrolments.length > 0) {
      const sorted = [...enrolments].sort((a, b) => a - b)
      const middle = Math.floor(sorted.length / 2)
      out.enrolment = {
        max: sorted[sorted.length - 1],
        min: sorted[0],
        median:
          sorted.length % 2 === 1
            ? sorted[middle]
            : Math.round((((sorted[middle - 1] as number) + (sorted[middle] as number)) / 2) * 10) /
              10,
        n: sorted.length,
      }
      out.enrolmentMin = sorted[0]
    } else {
      delete out.enrolment
      delete out.enrolmentMin
    }
    // The longest run is a named study; where that study moved, the page no longer holds a longest
    // run it can name, and the field goes rather than pointing at another page's trial.
    const heldNct = asString(asObject(aggregate.longestDuration)?.nct)
    if (heldNct !== undefined && moved.has(heldNct)) delete out.longestDuration
  } else {
    const studies = asNumber(aggregate.studies)
    if (studies !== undefined) out.studies = Math.max(0, studies - moved.size)
  }
  // A count with no per-trial flag behind it cannot be recomputed, and restating it would count
  // studies that belong to another page. It is dropped: the page then says less, not something false.
  delete out.hasResults
  return out
}

/* ------------------------------------------------------------------ the run */

interface Written {
  file: string
  records: number
}

async function main(): Promise<void> {
  const fieldsDir = arg('fields') ?? 'data/revamp/fields-v2'
  const seedsDir = arg('seeds') ?? 'data/revamp/derived-v2'
  const questionsDir = arg('questions') ?? 'data/revamp/questions-v2'
  const identityFile = arg('identity') ?? 'data/revamp/identity/canonical-v3.ndjson'
  const tiersFile = arg('tiers') ?? 'data/corpus-20k/tiers/model-assignment.ndjson'
  const suppressionFile = arg('suppression') ?? 'data/revamp/suppression/assignments-v2.ndjson'
  const registryDir = arg('registry') ?? 'data/corpus-20k/registry/aggregates'
  const blocksDir = arg('blocks') ?? 'data/revamp/page-blocks'
  const reassignmentsFile =
    arg('reassignments') ?? 'data/revamp/identity/trial-reassignments-v3.csv'
  const outDir = arg('out') ?? 'data/revamp/render-v5'
  const shards = Number(arg('shards') ?? 8)
  const batchSize = Number(arg('batch-size') ?? 1000)
  const limit = arg('limit') ? Number(arg('limit')) : undefined

  const notes = new Map<string, number>()
  const note = (label: string): void => {
    notes.set(label, (notes.get(label) ?? 0) + 1)
  }

  /* ---- small, resident inputs -------------------------------------------------------------- */
  const tier = new Map<string, 1 | 2 | 3>()
  const model = new Map<string, string>()
  const withdrawn = new Set<string>()
  const names = new Map<string, string>()
  await eachLine(tiersFile, (line, key) => {
    if (!key) return
    const row = JSON.parse(line) as Record<string, unknown>
    const assigned = asString(row.model) ?? 'DEVELOPMENT'
    const isWithdrawn = row.withdrawn === true
    model.set(key, assigned)
    if (isWithdrawn) withdrawn.add(key)
    tier.set(key, assigned === 'LONGEVITY' || isWithdrawn ? 1 : assigned === 'CLINICAL' ? 2 : 3)
    const display = asString(row.displayName)
    if (display) names.set(key, display)
  })

  const suppressed = new Set<string>()
  const classes = new Map<string, string[]>()
  await eachLine(suppressionFile, (line, key) => {
    if (!key) return
    const row = JSON.parse(line) as Record<string, unknown>
    if (row.suppressed === true) suppressed.add(key)
    const recorded = asArray(row.classes)
      .map(asString)
      .filter((value): value is string => Boolean(value))
    if (recorded.length > 0) classes.set(key, recorded)
  })

  /* Trials this run moved off a page, so the aggregate can be corrected before it is read. */
  const movedOut = new Map<string, Set<string>>()
  try {
    for (const row of readCsv(await fs.readFile(reassignmentsFile, 'utf8'))) {
      if (row.action !== 'move') continue
      const from = row.from_key
      const nct = row.nct
      if (!from || !nct) continue
      const held = movedOut.get(from) ?? new Set<string>()
      held.add(nct)
      movedOut.set(from, held)
    }
  } catch {
    note('trial reassignments file absent; no registry study was moved')
  }

  /* Every page's Phase 4 blocks. One line per page; the whole set is ~120 MB and is read once. */
  const blocksByKey = new Map<string, PageBlocks>()
  for (const file of await listNdjson(blocksDir)) {
    await eachLine(file, (line, key) => {
      if (!key) return
      blocksByKey.set(key, JSON.parse(line) as PageBlocks)
    })
  }
  if (blocksByKey.size === 0) note('Phase 4 block bundles absent; no block was rendered')

  const allKeys = [...tier.keys()].sort().slice(0, limit ?? Number.MAX_SAFE_INTEGER)
  const seedFiles = (await fs.readdir(seedsDir, { withFileTypes: true }).catch(() => []))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.ndjson'))
    .map((entry) => path.join(seedsDir, entry.name))
    .sort()
  const fieldFiles = await listNdjson(fieldsDir)
  const registryFiles = await listNdjson(registryDir)
  const questionFiles = (await fs.readdir(questionsDir))
    .filter((name) => /^batch-\d+\.ndjson$/.test(name))
    .sort()
    .map((name) => path.join(questionsDir, name))

  const textDir = path.join(outDir, 'text')
  const provenanceDir = path.join(outDir, 'provenance')
  await fs.mkdir(textDir, { recursive: true })
  await fs.mkdir(provenanceDir, { recursive: true })
  for (const directory of [textDir, provenanceDir]) {
    for (const name of await fs.readdir(directory).catch(() => [])) {
      if (/^batch-\d+\.ndjson$/.test(name)) await fs.rm(path.join(directory, name))
    }
  }
  const allFile = path.join(outDir, 'pages-all.ndjson')
  await fs.rm(allFile, { force: true })

  const shardSize = Math.ceil(allKeys.length / shards)
  const textBuffer: RenderedPage[] = []
  const provenanceBuffer: Array<{ key: string; provenance: ProvenanceEntry[] }> = []
  let batchNumber = 0
  const textFiles: Written[] = []
  const provenanceFiles: Written[] = []

  const stats = {
    pages: 0,
    withQuestions: 0,
    withoutQuestions: 0,
    controlled: 0,
    withRegistrationLines: 0,
    withInteractionLines: 0,
    withCheckedStatement: 0,
    withPatentLine: 0,
    withComputedSections: 0,
    withFormOfNote: 0,
    controlledPagesWithAWithheldDoseLine: 0,
    withheldDoseLines: 0,
    sentencesWithProvenance: 0,
    sentencesWithoutProvenance: 0,
    words: 0,
    byTier: { 1: 0, 2: 0, 3: 0 } as Record<number, number>,
  }

  const flush = async (force: boolean): Promise<void> => {
    while (textBuffer.length >= batchSize || (force && textBuffer.length > 0)) {
      const textSlice = textBuffer.splice(0, batchSize)
      const provenanceSlice = provenanceBuffer.splice(0, batchSize)
      batchNumber += 1
      const suffix = `batch-${String(batchNumber).padStart(4, '0')}.ndjson`
      const textFile = path.join(textDir, suffix)
      await fs.writeFile(
        textFile,
        `${textSlice.map((record) => JSON.stringify(record)).join('\n')}\n`,
        'utf8',
      )
      await fs.appendFile(
        allFile,
        `${textSlice.map((record) => JSON.stringify(record)).join('\n')}\n`,
        'utf8',
      )
      textFiles.push({ file: textFile, records: textSlice.length })
      const provenanceFile = path.join(provenanceDir, suffix)
      await fs.writeFile(
        provenanceFile,
        `${provenanceSlice.map((record) => JSON.stringify(record)).join('\n')}\n`,
        'utf8',
      )
      provenanceFiles.push({ file: provenanceFile, records: provenanceSlice.length })
    }
  }

  for (let shard = 0; shard < shards; shard += 1) {
    const shardKeyList = allKeys.slice(shard * shardSize, (shard + 1) * shardSize)
    if (shardKeyList.length === 0) continue
    const shardKeys = new Set(shardKeyList)
    const bundles = new Map<string, PageBundle>()
    for (const key of shardKeys) {
      const blocks = blocksByKey.get(key)
      bundles.set(key, {
        key,
        displayName: names.get(key) ?? key,
        model: model.get(key) ?? 'DEVELOPMENT',
        tier: tier.get(key) ?? 3,
        withdrawn: withdrawn.has(key),
        suppressed: suppressed.has(key),
        suppressionClasses: classes.get(key) ?? [],
        stub: false,
        presentFields: 0,
        fields: {},
        seeds: {},
        identity: { synonyms: [], relations: [] },
        questions: [],
        names,
        ...(blocks ? { blocks } : {}),
      })
    }

    for (const file of fieldFiles) {
      await eachLine(file, (line, key) => {
        if (!key || !shardKeys.has(key)) return
        const row = JSON.parse(line) as Record<string, unknown>
        const bundle = bundles.get(key) as PageBundle
        const fields = asObject(row.fields) ?? {}
        for (const [name, value] of Object.entries(fields)) {
          const entry = asObject(value)
          if (entry && typeof entry.state === 'string')
            bundle.fields[name] = entry as unknown as FieldEntry
        }
        for (const [name, value] of Object.entries(row)) {
          if (name === 'fields') continue
          const entry = asObject(value)
          if (entry && typeof entry.state === 'string' && bundle.fields[name] === undefined)
            bundle.fields[name] = entry as unknown as FieldEntry
        }
        const display = asString(row.displayName)
        if (display && bundle.displayName === key) bundle.displayName = display
      })
    }

    for (const file of registryFiles) {
      await eachLine(file, (line, key) => {
        if (!key || !shardKeys.has(key)) return
        const bundle = bundles.get(key) as PageBundle
        const aggregate = JSON.parse(line) as Record<string, unknown>
        const moved = movedOut.get(key)
        bundle.registry = moved ? aggregateWithoutMovedStudies(aggregate, moved) : aggregate
      })
    }

    for (const file of seedFiles) {
      const seedId = canonicalSeedId(path.basename(file, '.ndjson'))
      await eachLine(file, (line, key) => {
        if (!key || !shardKeys.has(key)) return
        const row = JSON.parse(line) as Record<string, unknown>
        const bundle = bundles.get(key) as PageBundle
        bundle.seeds[seedId] = {
          fires: typeof row.fires === 'boolean' ? row.fires : true,
          ...(asObject(row.slots) ? { slots: asObject(row.slots) as Record<string, unknown> } : {}),
          ...(asObject(row.values)
            ? { values: asObject(row.values) as Record<string, unknown> }
            : {}),
        }
      })
    }

    await eachLine(identityFile, (line, key) => {
      if (!key || !shardKeys.has(key)) return
      const row = JSON.parse(line) as Record<string, unknown>
      const bundle = bundles.get(key) as PageBundle
      bundle.identity = {
        synonyms: asArray(row.synonyms)
          .map((item) => {
            const record = asObject(item)
            const name = asString(record?.name)
            const kind = asString(record?.kind)
            return name ? { name, ...(kind ? { kind } : {}) } : undefined
          })
          .filter((item): item is Synonym => item !== undefined),
        relations: asArray(row.relations)
          .map((item) => {
            const record = asObject(item)
            const type = asString(record?.type)
            const targetKey = asString(record?.targetKey)
            return type && targetKey ? { type, targetKey } : undefined
          })
          .filter((item): item is Relation => item !== undefined),
        unii: asString(row.unii) ?? null,
        chemblId: asString(row.chemblId) ?? null,
        cid: asString(row.cid) ?? null,
        cas: asString(row.cas) ?? null,
        rxcui: asString(row.rxcui) ?? null,
        drugbankId: asString(row.drugbankId) ?? null,
      }
      const display = asString(row.displayName)
      if (display && bundle.displayName === key) bundle.displayName = display
    })

    for (const file of questionFiles) {
      await eachLine(file, (line, key) => {
        if (!key || !shardKeys.has(key)) return
        const row = JSON.parse(line) as Record<string, unknown>
        const bundle = bundles.get(key) as PageBundle
        bundle.questions = asArray(row.questions) as QuestionBlock[]
        if (row.stub === true) bundle.stub = true
      })
    }

    for (const key of shardKeyList) {
      const bundle = bundles.get(key) as PageBundle
      bundle.presentFields = Object.values(bundle.fields).filter(
        (entry) => entry && entry.state === 'present',
      ).length
      const rendered = renderPage(bundle, { provenance: true })
      const provenance = rendered.provenance ?? []
      delete rendered.provenance

      stats.pages += 1
      stats.words += rendered.wordCount
      stats.byTier[bundle.tier] = (stats.byTier[bundle.tier] ?? 0) + 1
      if (bundle.questions.length > 0) stats.withQuestions += 1
      else stats.withoutQuestions += 1
      const blocks = bundle.blocks
      if (blocks?.controlled) stats.controlled += 1
      if ((blocks?.registration.length ?? 0) > 0) stats.withRegistrationLines += 1
      if (Object.keys(blocks?.interactions.tiers ?? {}).length > 0) stats.withInteractionLines += 1
      if (blocks?.interactions.checked) stats.withCheckedStatement += 1
      if (blocks?.patent) stats.withPatentLine += 1
      if (
        (blocks?.sections.neighbour?.length ?? 0) +
          (blocks?.sections.potency?.length ?? 0) +
          (blocks?.sections.timeline?.length ?? 0) >
        0
      )
        stats.withComputedSections += 1
      if ((blocks?.sections.formOf?.length ?? 0) > 0) stats.withFormOfNote += 1
      if (rendered.withheldDoseLines !== undefined) {
        stats.controlledPagesWithAWithheldDoseLine += 1
        stats.withheldDoseLines += rendered.withheldDoseLines
      }
      for (const entry of provenance) {
        if (entry.fields.length > 0) stats.sentencesWithProvenance += 1
        else stats.sentencesWithoutProvenance += 1
      }
      if (!blocks) note('pages with no Phase 4 block bundle')

      textBuffer.push(rendered)
      provenanceBuffer.push({ key, provenance })
    }

    bundles.clear()
    await flush(false)
    process.stderr.write(`shard ${shard + 1}/${shards} rendered (${stats.pages} pages)\n`)
  }
  await flush(true)

  const summary = {
    generatedBy: 'scripts/revamp/page_text_v5.ts',
    spec: ['docs/specs/phase4-generators.md', 'docs/specs/revamp-2026-09.md#phase-4'],
    inputs: {
      fieldsDir,
      seedsDir,
      questionsDir,
      identityFile,
      tiersFile,
      suppressionFile,
      registryDir,
      blocksDir,
      reassignmentsFile,
    },
    pagesWithMovedStudies: movedOut.size,
    ...stats,
    meanWordCount: stats.pages > 0 ? Number((stats.words / stats.pages).toFixed(1)) : 0,
    textFiles: textFiles.length,
    provenanceFiles: provenanceFiles.length,
    notes: Object.fromEntries([...notes.entries()].sort()),
  }
  await fs.writeFile(
    path.join(outDir, 'summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8',
  )
  console.log(JSON.stringify(summary, null, 2))
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (invokedDirectly) {
  await main()
}
