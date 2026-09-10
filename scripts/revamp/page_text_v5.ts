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
 *   npx tsx scripts/revamp/page_text_v5.ts --with-furniture
 *   npx tsx scripts/revamp/page_text_v5.ts --limit 200 --out data/revamp/render-v8-smoke
 *
 * Furniture (docs/specs/phase4-generators.md §11). By default the text is written without it: the
 * register rows whose status is an absence, the checked-sources statement on a page holding no
 * interaction row, the patent no-record line and the S10-only classification line are on the page
 * and are not in the measured text, because before Phase 4 an absence rendered nothing and was not
 * in the measured text either. `--with-furniture` writes the page as the browser paints it, which
 * is what the DOM parity check and the rendering-safety rules read; its default output directory is
 * `data/revamp/render-v7-with-furniture`, so the two runs never overwrite one another.
 *
 * Outputs, under `--out` (default `data/revamp/render-v8`), with `-with-furniture` appended to
 * every name on the furniture run:
 *   text/batch-0001.ndjson …   one `RenderedPage` per line, the shape the overlap ruler reads
 *   pages-all.ndjson           every rendered page in one file, key-sorted
 *   provenance/batch-0001.ndjson …  `{key, provenance: [{sentence, fields}]}` per page (4.7)
 *   summary.json               counts, and what the inputs did not supply
 *
 * Trial reassignment. `data/revamp/identity/trial-reassignments-v5.csv` moves a registry study from
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
import type { SuppressionEvidence } from '../../lib/corpus/suppression-labels'
import {
  aggregateWithoutMovedStudies,
  printedDisplayName,
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

/* ------------------------------------------------------------------ the run */

interface Written {
  file: string
  records: number
}

async function main(): Promise<void> {
  const fieldsDir = arg('fields') ?? 'data/revamp/fields-v2'
  const seedsDir = arg('seeds') ?? 'data/revamp/derived-v2'
  const questionsDir = arg('questions') ?? 'data/revamp/questions-v2'
  const identityFile = arg('identity') ?? 'data/revamp/identity/canonical-v7.ndjson'
  // §15(3): the v2 tier map, in which a DailyMed SPL with no application number is not a
  // register approval and so does not make a page CLINICAL.
  const tiersFile = arg('tiers') ?? 'data/revamp/tiers/model-assignment-v3.ndjson'
  const suppressionFile = arg('suppression') ?? 'data/revamp/suppression/assignments-v2.ndjson'
  const registryDir = arg('registry') ?? 'data/corpus-20k/registry/aggregates'
  const blocksDir = arg('blocks') ?? 'data/revamp/page-blocks'
  const reassignmentsFile =
    arg('reassignments') ?? 'data/revamp/identity/trial-reassignments-v5.csv'
  const displayNamesFile = arg('display-names') ?? 'data/revamp/identity/display-names-v5.csv'
  const withFurniture = process.argv.includes('--with-furniture')
  const outDir = arg('out') ?? 'data/revamp/render-v9'
  /*
   * The two runs share one output directory and never overwrite one another: the furniture run
   * writes `text-with-furniture` and `summary-with-furniture.json` beside the furniture-free ones.
   * `tests/test_render_safety.py` reads both out of the same directory, and until this was here
   * the two names were produced by moving files by hand after the run.
   *
   * The provenance map is written once, by the furniture-free run, and the furniture run does not
   * write a second copy. `renderPage` records every line it wrote in the map, furniture included
   * and marked `furniture: true`; `--with-furniture` decides only what `text` and `proseText`
   * carry. The two directories were byte-identical over all 28,832 pages and the second was 264 MB.
   * `pages-all` is likewise the furniture-free run's, because it is the file the duplicate check
   * resolves page tiers from and that check reads the furniture-free text.
   */
  const suffix = withFurniture ? '-with-furniture' : ''
  const writeProvenance = !withFurniture
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

  /*
   * The name each page prints, where Phase 3 disambiguated two pages that print the same one
   * (§11). The loader writes the disambiguated name into `corpus_pages.display_name`, so the page
   * links a counterpart by that name; this map is what the measured text names it by, and the two
   * have to be the same name.
   */
  /*
   * §10, applied here as well as in the loader: a page whose recorded name is an all-caps register
   * string prints the readable synonym of the same record instead. The loader writes the same name
   * into `corpus_pages.display_name`, so the page, the hub and this measured text all print one
   * name; doing it in only one of them was tried in Phase 5 and made the hub print "clobetasol"
   * while the page it linked printed "CLOBETASOL".
   *
   * This map is what every page's *counterparts* are named by, so the rule is applied to the whole
   * map before any page renders, not per shard.
   */
  let readableNames = 0
  await eachLine(identityFile, (line, key) => {
    if (!key) return
    const row = JSON.parse(line) as Record<string, unknown>
    const recorded = names.get(key) ?? asString(row.displayName)
    if (!recorded) return
    const synonyms = asArray(row.synonyms)
      .map((item) => {
        const record = asObject(item)
        const name = asString(record?.name)
        const kind = asString(record?.kind)
        return name ? { name, ...(kind ? { kind } : {}) } : undefined
      })
      .filter((item): item is Synonym => item !== undefined)
    const printed = printedDisplayName(recorded, synonyms)
    if (printed !== recorded) readableNames += 1
    names.set(key, printed)
  })
  note(`${readableNames} pages print a readable synonym in place of an all-caps register string`)

  try {
    for (const row of readCsv(await fs.readFile(displayNamesFile, 'utf8'))) {
      const disambiguated = row.disambiguated_display_name
      if (row.key && disambiguated) names.set(row.key, disambiguated)
    }
  } catch {
    note(`no display names read from ${displayNamesFile}`)
  }

  const suppressed = new Set<string>()
  const classes = new Map<string, string[]>()
  /*
   * §15(1): the supervision answer is one clause per recorded class, built from that class's own
   * evidence. The suppression pass recorded that evidence beside the classes, so it is read here
   * and put on the bundle; the loader writes the same rows onto `corpus_pages.suppression_evidence`
   * (migration 0033), and the render and the page therefore build the same clauses.
   */
  const evidence = new Map<string, SuppressionEvidence[]>()
  await eachLine(suppressionFile, (line, key) => {
    if (!key) return
    const row = JSON.parse(line) as Record<string, unknown>
    if (row.suppressed === true) suppressed.add(key)
    const recorded = asArray(row.classes)
      .map(asString)
      .filter((value): value is string => Boolean(value))
    if (recorded.length > 0) classes.set(key, recorded)
    const rows = asArray(row.evidence)
      .map(asObject)
      .filter((entry): entry is Record<string, unknown> => entry !== undefined)
      .map((entry) => ({
        test: asString(entry.test) ?? '',
        ...(asString(entry.source) ? { source: asString(entry.source) } : {}),
        ...(asString(entry.value) ? { value: asString(entry.value) } : {}),
        ...(asString(entry.label) ? { label: asString(entry.label) } : {}),
      }))
      .filter((entry) => entry.test.length > 0)
    if (rows.length > 0) evidence.set(key, rows)
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

  /*
   * The corpus this render covers is the corpus the loader loads: every key `--identity` holds.
   *
   * `data/revamp/tiers/model-assignment-v3.ndjson` is the tier map and still names every page the
   * corpus-20k run created, including the 123 the Phase 3 and §12 merges have since absorbed. The
   * loader writes `corpus_pages` from the identity revision, so a page absent from that revision is
   * not served, is not linked, and must not be in the measured text or in a counterpart name — the
   * parity check found the render naming `Insulin Lispro-Aabc` as an interaction counterpart on a
   * page whose own record had merged into `Insulin lispro`.
   */
  const liveKeys = new Set<string>()
  await eachLine(identityFile, (_line, key) => {
    if (key) liveKeys.add(key)
  })
  const absorbed = [...tier.keys()].filter((key) => !liveKeys.has(key)).length
  if (absorbed > 0) note(`${absorbed} pages in the tier map are absent from ${identityFile}`)
  const allKeys = [...tier.keys()]
    .filter((key) => liveKeys.has(key))
    .sort()
    .slice(0, limit ?? Number.MAX_SAFE_INTEGER)
  for (const key of [...names.keys()]) if (!liveKeys.has(key)) names.delete(key)
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

  const textDir = path.join(outDir, `text${suffix}`)
  const provenanceDir = path.join(outDir, 'provenance')
  await fs.mkdir(textDir, { recursive: true })
  if (writeProvenance) await fs.mkdir(provenanceDir, { recursive: true })
  for (const directory of writeProvenance ? [textDir, provenanceDir] : [textDir]) {
    for (const name of await fs.readdir(directory).catch(() => [])) {
      if (/^batch-\d+\.ndjson$/.test(name)) await fs.rm(path.join(directory, name))
    }
  }
  const allFile = path.join(outDir, 'pages-all.ndjson')
  if (writeProvenance) await fs.rm(allFile, { force: true })

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
    furnitureLines: 0,
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
      if (writeProvenance) {
        await fs.appendFile(
          allFile,
          `${textSlice.map((record) => JSON.stringify(record)).join('\n')}\n`,
          'utf8',
        )
      }
      textFiles.push({ file: textFile, records: textSlice.length })
      if (writeProvenance) {
        const provenanceFile = path.join(provenanceDir, suffix)
        await fs.writeFile(
          provenanceFile,
          `${provenanceSlice.map((record) => JSON.stringify(record)).join('\n')}\n`,
          'utf8',
        )
        provenanceFiles.push({ file: provenanceFile, records: provenanceSlice.length })
      }
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
        suppressionEvidence: evidence.get(key) ?? [],
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
      const rendered = renderPage(bundle, { provenance: true, withFurniture })
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
      stats.furnitureLines += rendered.furnitureLines
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
    withFurniture,
    pagesWithMovedStudies: movedOut.size,
    ...stats,
    meanWordCount: stats.pages > 0 ? Number((stats.words / stats.pages).toFixed(1)) : 0,
    textFiles: textFiles.length,
    provenanceFiles: provenanceFiles.length,
    notes: Object.fromEntries([...notes.entries()].sort()),
  }
  await fs.writeFile(
    path.join(outDir, `summary${suffix}.json`),
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
