import 'dotenv/config'
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { createRng, shuffleInPlace } from '@/lib/agents/core/rng'
import { LEXICAL_ENGINE_VERSION, lexicalSearch, rowToUnit } from '@/lib/semantic/lexical'
import {
  SCOPE_GATE_VERSION,
  applyScopeGates,
  buildEntityIndex,
  type EntityIndex,
} from '@/lib/semantic/scope-gates'
import {
  FIELD_LABELS,
  POPULATION_SCOPE_LABELS,
  SEARCH_LABELS,
  SECTION_LABELS,
  SEMANTIC_PROJECTOR_VERSION,
  type EvidenceReadingUnit,
  type PopulationScope,
} from '@/lib/semantic/units'

/**
 * Measures retrieval over evidence reading units, lexical against dense, on the same candidate pool
 * and with the same deterministic scope gates.
 *
 * WHAT THIS BENCHMARK IS. A template-generated retrieval set. Every query is built mechanically
 * from a record's name and the section or field label of one sampled unit, and the correct answer
 * is that unit. It measures whether a retriever can find the right recorded reading when a person
 * asks for it in the wording the corpus itself uses.
 *
 * WHAT IT IS NOT. It is not a measure of answer quality, of whether the recorded reading is right,
 * or of how real people phrase questions — nobody typed any of these queries. It does not measure
 * the full corpus either: the candidate pool is the sampled units, identical for both retrievers,
 * because giving one method 250,000 candidates and the other 2,000 would compare pool sizes rather
 * than methods.
 *
 *   npx tsx scripts/semantic/benchmark.ts [--dense] [--drugs=N] [--per-drug=N] [--seed=N]
 */

const DEFAULT_SEED = 20260902
const DEFAULT_DRUGS = 400
const DEFAULT_PER_DRUG = 5
const DENSE_MODEL = 'Xenova/bge-small-en-v1.5'
const CUTOFFS = [1, 5, 20] as const
const TOP_K = 20

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

interface BenchmarkItem {
  query: string
  goldUnitId: string
  unitKind: string
  sectionId: string
  slug: string
}

interface Metrics {
  queries: number
  recallAt1: number
  recallAt5: number
  recallAt20: number
  mrr: number
  refusedQueries: number
}

/* ------------------------------------------------------------------------------------------- */
/* Query templates                                                                              */
/* ------------------------------------------------------------------------------------------- */

const STATEMENT_TEMPLATES: Readonly<Record<string, (name: string) => string>> = {
  'mechanism.statements': (name) => `how ${name} works`,
  'recordedUses.statements': (name) => `what ${name} is used for`,
  'safety.boxedWarning': (name) => `boxed warning for ${name}`,
  'safety.contraindications': (name) => `contraindications for ${name}`,
  interactionSignals: (name) => `enzyme and transporter signals of ${name}`,
}

function basePath(fieldPath: string): string {
  return fieldPath.replace(/\[\d+\]$/u, '')
}

function consensusField(text: string): string | null {
  const match = /^[^\n]* — source agreement on ([^:]+):/u.exec(text)
  return match ? match[1]!.trim() : null
}

/** The query a person would type for this unit, built only from the name and the field label. */
function templateFor(unit: EvidenceReadingUnit, name: string): string | null {
  switch (unit.unitKind) {
    case 'RECORDED_VALUE': {
      const label = FIELD_LABELS[unit.fieldPath]
      return label ? `${label} of ${name}` : null
    }
    case 'RECORDED_STATEMENT': {
      const template = STATEMENT_TEMPLATES[basePath(unit.fieldPath)]
      return template ? template(name) : null
    }
    case 'POPULATION_STATEMENT': {
      const scope = unit.populationScope as PopulationScope | null
      if (!scope || !(scope in POPULATION_SCOPE_LABELS)) return null
      return `is ${name} studied in ${POPULATION_SCOPE_LABELS[scope]}`
    }
    case 'ADVERSE_REACTION_LIST':
      return `most common adverse reactions of ${name}`
    case 'CONSENSUS_READING': {
      const field = consensusField(unit.text)
      return field ? `source agreement on ${field} for ${name}` : null
    }
    case 'SEARCH_RESULT': {
      const kind = /^sourceSearchRecords\[(.+)\]$/u.exec(unit.fieldPath)?.[1]
      const label = kind ? SEARCH_LABELS[kind] : undefined
      return label ? `${label} of ${name}` : null
    }
    case 'SECTION_STATE': {
      const label = SECTION_LABELS[unit.sectionId]
      return label ? `${label} for ${name}` : null
    }
    default:
      return null
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Sampling                                                                                     */
/* ------------------------------------------------------------------------------------------- */

interface SampledUnit {
  unit: EvidenceReadingUnit
  name: string
}

async function sampleUnits(
  seed: number,
  drugCount: number,
  perDrug: number,
): Promise<SampledUnit[]> {
  const eligible = await db.execute(sql`
    select u.drug_id, d.name, count(*)::int as units
    from evidence_reading_units u
    join drugs d on d.id = u.drug_id
    group by u.drug_id, d.name
    having count(*) >= ${perDrug}
    order by u.drug_id
  `)
  const rows = eligible.rows as unknown as Array<{ drug_id: string; name: string; units: number }>
  const shuffled = shuffleInPlace([...rows], createRng(seed))
  const chosen = shuffled
    .slice(0, drugCount)
    .sort((left, right) => left.drug_id.localeCompare(right.drug_id))
  if (chosen.length === 0) return []

  const nameById = new Map(chosen.map((row) => [row.drug_id, row.name]))
  const result = await db.execute(sql`
    select id, drug_id, canonical_slug, unit_kind, assertion, section_id, field_path,
      population_scope, formulation_scope, text, source_refs, comparison_state,
      projector_version, content_digest, 0 as score
    from evidence_reading_units
    where drug_id = any(${sql.param(chosen.map((row) => row.drug_id))}::text[])
    order by id
  `)
  const byDrug = new Map<string, EvidenceReadingUnit[]>()
  for (const row of result.rows as unknown as Parameters<typeof rowToUnit>[0][]) {
    const unit = rowToUnit(row)
    const list = byDrug.get(unit.drugId) ?? []
    list.push(unit)
    byDrug.set(unit.drugId, list)
  }

  const sampled: SampledUnit[] = []
  for (const [index, row] of chosen.entries()) {
    const units = byDrug.get(row.drug_id) ?? []
    const picked = shuffleInPlace([...units], createRng(seed + index + 1)).slice(0, perDrug)
    for (const unit of picked.sort((left, right) => left.id.localeCompare(right.id))) {
      sampled.push({ unit, name: nameById.get(row.drug_id) ?? unit.canonicalSlug })
    }
  }
  return sampled
}

function buildItems(sampled: readonly SampledUnit[]): BenchmarkItem[] {
  const byQuery = new Map<string, BenchmarkItem>()
  const ambiguous = new Set<string>()
  for (const { unit, name } of sampled) {
    const query = templateFor(unit, name)
    if (!query) continue
    if (byQuery.has(query)) {
      ambiguous.add(query)
      continue
    }
    byQuery.set(query, {
      query,
      goldUnitId: unit.id,
      unitKind: unit.unitKind,
      sectionId: unit.sectionId,
      slug: unit.canonicalSlug,
    })
  }
  // A template that two sampled units answer has no single correct answer, so it is dropped
  // outright rather than scored against an arbitrary one of them.
  for (const query of ambiguous) byQuery.delete(query)
  return [...byQuery.values()].sort((left, right) => left.query.localeCompare(right.query))
}

/* ------------------------------------------------------------------------------------------- */
/* Scoring                                                                                      */
/* ------------------------------------------------------------------------------------------- */

function scoreRanks(ranks: Array<number | null>, refused: number): Metrics {
  const queries = ranks.length
  const recall = (cutoff: number): number =>
    queries === 0 ? 0 : ranks.filter((rank) => rank !== null && rank <= cutoff).length / queries
  const mrr =
    queries === 0
      ? 0
      : ranks.reduce<number>((total, rank) => total + (rank ? 1 / rank : 0), 0) / queries
  const round = (value: number): number => Number(value.toFixed(4))
  return {
    queries,
    recallAt1: round(recall(CUTOFFS[0])),
    recallAt5: round(recall(CUTOFFS[1])),
    recallAt20: round(recall(CUTOFFS[2])),
    mrr: round(mrr),
    refusedQueries: refused,
  }
}

function rankOf(ids: readonly string[], goldUnitId: string): number | null {
  const index = ids.indexOf(goldUnitId)
  return index < 0 ? null : index + 1
}

interface RefusedQuery {
  query: string
  code: string
  candidates: string[]
}

function gatedIds(
  query: string,
  units: readonly EvidenceReadingUnit[],
  index: EntityIndex,
  refusals: RefusedQuery[],
): { ids: string[]; refused: boolean } {
  const gated = applyScopeGates(query, units, index)
  if (gated.refusal) {
    refusals.push({
      query,
      code: gated.refusal.code,
      candidates: gated.refusal.candidates,
    })
    return { ids: [], refused: true }
  }
  return { ids: gated.kept.map((unit) => unit.id), refused: false }
}

/* ------------------------------------------------------------------------------------------- */
/* Dense retrieval                                                                              */
/* ------------------------------------------------------------------------------------------- */

interface DenseOutcome {
  status: 'MEASURED' | 'SOURCE_UNAVAILABLE'
  model: string
  cacheDir: string
  error?: string
  raw?: Metrics
  gated?: Metrics
}

function dot(left: Float32Array, right: Float32Array): number {
  let total = 0
  for (let index = 0; index < left.length; index += 1) total += left[index]! * right[index]!
  return total
}

async function embedAll(texts: readonly string[], cacheDir: string): Promise<Float32Array[]> {
  const { pipeline, env } = await import('@huggingface/transformers')
  env.cacheDir = cacheDir
  env.allowLocalModels = false
  const extractor = await pipeline('feature-extraction', DENSE_MODEL, { cache_dir: cacheDir })
  const vectors: Float32Array[] = []
  const batch = 32
  for (let start = 0; start < texts.length; start += batch) {
    const slice = texts.slice(start, start + batch)
    const output = await extractor(slice as string[], { pooling: 'cls', normalize: true })
    const dims = output.dims as number[]
    const width = dims[dims.length - 1]!
    const data = output.data as Float32Array
    for (let row = 0; row < slice.length; row += 1) {
      vectors.push(Float32Array.from(data.slice(row * width, (row + 1) * width)))
    }
    if (start % 512 === 0) {
      console.log(`[semantic] embedded ${Math.min(start + batch, texts.length)}/${texts.length}`)
    }
  }
  return vectors
}

async function runDense(
  items: readonly BenchmarkItem[],
  pool: readonly EvidenceReadingUnit[],
  index: EntityIndex,
  cacheDir: string,
  refusals: RefusedQuery[],
): Promise<DenseOutcome> {
  try {
    const unitVectors = await embedAll(
      pool.map((unit) => unit.text),
      cacheDir,
    )
    const queryVectors = await embedAll(
      items.map((item) => item.query),
      cacheDir,
    )
    const rawRanks: Array<number | null> = []
    const gatedRanks: Array<number | null> = []
    let refused = 0
    for (const [position, item] of items.entries()) {
      const queryVector = queryVectors[position]!
      const scored = pool
        .map((unit, unitIndex) => ({ unit, score: dot(queryVector, unitVectors[unitIndex]!) }))
        .sort((left, right) =>
          right.score === left.score
            ? left.unit.id.localeCompare(right.unit.id)
            : right.score - left.score,
        )
      const top = scored.slice(0, TOP_K)
      rawRanks.push(
        rankOf(
          top.map((hit) => hit.unit.id),
          item.goldUnitId,
        ),
      )
      const gate = gatedIds(
        item.query,
        top.map((hit) => hit.unit),
        index,
        refusals,
      )
      if (gate.refused) refused += 1
      gatedRanks.push(rankOf(gate.ids, item.goldUnitId))
    }
    return {
      status: 'MEASURED',
      model: DENSE_MODEL,
      cacheDir,
      raw: scoreRanks(rawRanks, 0),
      gated: scoreRanks(gatedRanks, refused),
    }
  } catch (error) {
    return {
      status: 'SOURCE_UNAVAILABLE',
      model: DENSE_MODEL,
      cacheDir,
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    }
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Report                                                                                       */
/* ------------------------------------------------------------------------------------------- */

/** Which named records drove the refusals, most often first. Counts only, never a query text. */
function refusalTable(refusals: readonly RefusedQuery[]): string {
  const counts = new Map<string, number>()
  for (const refusal of refusals) {
    for (const candidate of refusal.candidates) {
      counts.set(candidate, (counts.get(candidate) ?? 0) + 1)
    }
  }
  const ranked = [...counts]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 10)
  if (ranked.length === 0) return 'No query was refused.'
  return [
    '| Record named in the query | Refusals it appeared in |',
    '| --- | ---: |',
    ...ranked.map(([slug, count]) => `| \`${slug}\` | ${count} |`),
  ].join('\n')
}

function table(rows: Array<[string, Metrics]>): string {
  const header = '| Retriever | Queries | Recall@1 | Recall@5 | Recall@20 | MRR | Refused |'
  const rule = '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'
  const body = rows.map(
    ([label, metrics]) =>
      `| ${label} | ${metrics.queries} | ${metrics.recallAt1.toFixed(3)} | ${metrics.recallAt5.toFixed(3)} | ${metrics.recallAt20.toFixed(3)} | ${metrics.mrr.toFixed(3)} | ${metrics.refusedQueries} |`,
  )
  return [header, rule, ...body].join('\n')
}

async function main(): Promise<void> {
  const seed = Number(flag('seed') ?? DEFAULT_SEED)
  const drugCount = Number(flag('drugs') ?? DEFAULT_DRUGS)
  const perDrug = Number(flag('per-drug') ?? DEFAULT_PER_DRUG)
  const withDense = process.argv.includes('--dense')
  const dataDir = process.env.RNAWIKI_INGEST_DATA ?? join(process.cwd(), 'tmp')
  const cacheDir = join(dataDir, 'models')
  const outDir = join(process.cwd(), 'docs', 'audits', 'semantic')

  try {
    const totals = await db.execute(sql`select count(*)::int as units from evidence_reading_units`)
    const corpusUnits = (totals.rows as unknown as Array<{ units: number }>)[0]?.units ?? 0
    if (corpusUnits === 0)
      throw new Error('no reading units are stored; run scripts/semantic/project-units.ts first')

    const entityRows = await db.execute(sql`
      select d.slug, d.name,
        coalesce((select jsonb_agg(a.alias order by a.alias) from drug_aliases a where a.drug_id = d.id), '[]'::jsonb) as aliases
      from drugs d
      join inventory_resolutions r on r.drug_id = d.id and r.resolution_status = 'CANONICAL_ENTITY'
      order by d.slug
    `)
    const index = buildEntityIndex(
      entityRows.rows as unknown as Array<{ slug: string; name: string; aliases: string[] }>,
    )

    const sampled = await sampleUnits(seed, drugCount, perDrug)
    const items = buildItems(sampled)
    const pool = sampled.map((entry) => entry.unit)
    const poolIds = pool.map((unit) => unit.id)
    console.log(
      `[semantic] pool ${pool.length} unit(s) from ${new Set(pool.map((unit) => unit.drugId)).size} record(s) · ${items.length} query(ies)`,
    )

    const rawRanks: Array<number | null> = []
    const gatedRanks: Array<number | null> = []
    const lexicalRefusals: RefusedQuery[] = []
    let refused = 0
    for (const [position, item] of items.entries()) {
      const hits = await lexicalSearch(item.query, { limit: TOP_K, candidateIds: poolIds })
      rawRanks.push(
        rankOf(
          hits.map((hit) => hit.unit.id),
          item.goldUnitId,
        ),
      )
      const gate = gatedIds(
        item.query,
        hits.map((hit) => hit.unit),
        index,
        lexicalRefusals,
      )
      if (gate.refused) refused += 1
      gatedRanks.push(rankOf(gate.ids, item.goldUnitId))
      if (position % 250 === 0) console.log(`[semantic] lexical ${position}/${items.length}`)
    }
    const lexicalRaw = scoreRanks(rawRanks, 0)
    const lexicalGated = scoreRanks(gatedRanks, refused)

    const denseRefusals: RefusedQuery[] = []
    const dense = withDense
      ? await runDense(items, pool, index, cacheDir, denseRefusals)
      : {
          status: 'SOURCE_UNAVAILABLE' as const,
          model: DENSE_MODEL,
          cacheDir,
          error: 'the dense benchmark was not requested; re-run with --dense',
        }

    const passRuleMet =
      dense.status === 'MEASURED' && dense.gated
        ? dense.gated.recallAt5 - lexicalGated.recallAt5 >= 0.05
        : false

    const extension = await db.execute(
      sql`select count(*)::int as available from pg_available_extensions where name = 'vector'`,
    )
    const pgvectorAvailable =
      ((extension.rows as unknown as Array<{ available: number }>)[0]?.available ?? 0) > 0

    const byKind = new Map<string, number>()
    for (const item of items) byKind.set(item.unitKind, (byKind.get(item.unitKind) ?? 0) + 1)

    const report = {
      benchmark: 'semantic-retrieval/v1',
      generated: 'template-generated from the corpus; no query was written by a person',
      projectorVersion: SEMANTIC_PROJECTOR_VERSION,
      lexicalEngineVersion: LEXICAL_ENGINE_VERSION,
      scopeGateVersion: SCOPE_GATE_VERSION,
      seed,
      sampledRecords: new Set(pool.map((unit) => unit.drugId)).size,
      unitsPerRecord: perDrug,
      candidatePoolUnits: pool.length,
      corpusUnits,
      queries: items.length,
      queriesByUnitKind: Object.fromEntries([...byKind].sort()),
      topK: TOP_K,
      lexical: { raw: lexicalRaw, gated: lexicalGated },
      refusedByScopeGates: lexicalRefusals,
      dense,
      passRule: {
        statement:
          'dense must beat lexical on recall@5 by at least 5 points absolute, with the scope gates applied',
        lexicalRecallAt5: lexicalGated.recallAt5,
        denseRecallAt5: dense.status === 'MEASURED' ? (dense.gated?.recallAt5 ?? null) : null,
        met: passRuleMet,
      },
      pgvectorAvailable,
      vectorIndexAdded: passRuleMet && pgvectorAvailable,
      queryDigest: createHash('sha256')
        .update(items.map((item) => item.query).join('\n'))
        .digest('hex'),
    }

    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, 'lexical-benchmark.json'), `${JSON.stringify(report, null, 2)}\n`)

    const rows: Array<[string, Metrics]> = [
      ['Lexical, no gates', lexicalRaw],
      ['Lexical, scope gates', lexicalGated],
    ]
    if (dense.status === 'MEASURED' && dense.raw && dense.gated) {
      rows.push(['Dense, no gates', dense.raw], ['Dense, scope gates', dense.gated])
    }

    const markdown = [
      '# Retrieval benchmark for evidence reading units',
      '',
      `Benchmark \`${report.benchmark}\` · projector \`${SEMANTIC_PROJECTOR_VERSION}\` · lexical \`${LEXICAL_ENGINE_VERSION}\` · gates \`${SCOPE_GATE_VERSION}\` · seed \`${seed}\`.`,
      '',
      '## What this measures',
      '',
      'Every query below was generated by template from one record name and one section or field',
      'label; the correct answer is the sampled unit the template was built from. No person wrote a',
      'query, so this measures retrieval over the corpus wording, not how people ask questions and',
      'not whether a recorded reading is right.',
      '',
      `The candidate pool is ${pool.length} units drawn from ${report.sampledRecords} records, ${perDrug} units each, with a fixed`,
      `seed. Both retrievers see that same pool. The corpus holds ${corpusUnits} units in total.`,
      `A template answered by two sampled units was dropped, which is why ${items.length} queries remain.`,
      '',
      '## Results',
      '',
      table(rows),
      '',
      '## Queries the scope gates refused',
      '',
      `${lexicalRefusals.length} of ${items.length} queries were refused rather than answered. A refusal counts as a miss in`,
      'the gated rows above, and both retrievers pay it identically. The names that caused them, most',
      'often first:',
      '',
      refusalTable(lexicalRefusals),
      '',
      'A refusal here is the gate working: the corpus files single English words as substances, so a',
      'query holding one of those words beside another record name genuinely names two records.',
      '',
      '## Pass rule for a vector index',
      '',
      'A pgvector shadow index is added only when dense retrieval beats lexical retrieval on',
      'recall@5 by at least 5 points absolute with the scope gates applied.',
      '',
      `- Lexical recall@5 with gates: ${lexicalGated.recallAt5.toFixed(3)}`,
      `- Dense recall@5 with gates: ${dense.status === 'MEASURED' ? (dense.gated?.recallAt5.toFixed(3) ?? 'not measured') : 'SOURCE_UNAVAILABLE'}`,
      `- Pass rule met: ${passRuleMet ? 'yes' : 'no'}`,
      `- pgvector extension available on this server: ${pgvectorAvailable ? 'yes' : 'no'}`,
      `- Vector index added: ${report.vectorIndexAdded ? 'yes' : 'no'}`,
      '',
      dense.status === 'SOURCE_UNAVAILABLE'
        ? `The dense measurement is recorded as \`SOURCE_UNAVAILABLE\`. Exact error: \`${dense.error ?? 'none recorded'}\`. No dense number is stated above, because none was produced.`
        : `Dense embeddings came from \`${DENSE_MODEL}\` run on the local CPU, cached under \`${cacheDir}\`. Cosine similarity was computed by brute force over the pool.`,
      '',
    ].join('\n')
    writeFileSync(join(outDir, 'lexical-benchmark.md'), `${markdown}\n`)

    console.log(table(rows))
    console.log(
      `[semantic] pass rule met: ${passRuleMet} · pgvector available: ${pgvectorAvailable} · wrote ${join(outDir, 'lexical-benchmark.json')}`,
    )
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
