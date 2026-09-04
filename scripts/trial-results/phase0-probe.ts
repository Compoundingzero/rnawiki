import 'dotenv/config'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { readState, writeState, STATE_DIR } from './state'

/**
 * PHASE 0 — verify the ClinicalTrials.gov v2 results contract against real responses.
 *
 * Nothing here trusts a remembered field path. Three studies known to have posted results are
 * fetched live, one full payload is written to disk, and the paths for every field group the
 * ingestion depends on are derived from the response that actually came back. What is absent is
 * recorded as absent.
 *
 *   npx tsx scripts/trial-results/phase0-probe.ts [--force]
 */

const API_ROOT = 'https://clinicaltrials.gov/api/v2'
const PROBE_IDS = ['NCT00688597', 'NCT01352715', 'NCT03014167'] as const

interface Probe {
  url: string
  status: number
  ms: number
  headers: Record<string, string>
  bytes: number
}

async function get(url: string): Promise<{ probe: Probe; body: unknown }> {
  const started = Date.now()
  const response = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': 'RNAWiki trial results ingestion' },
    signal: AbortSignal.timeout(120_000),
  })
  const text = await response.text()
  const headers: Record<string, string> = {}
  for (const [key, value] of response.headers.entries()) {
    if (/rate|limit|retry|quota|x-/i.test(key)) headers[key] = value
  }
  return {
    probe: {
      url,
      status: response.status,
      ms: Date.now() - started,
      headers,
      bytes: text.length,
    },
    body: response.ok ? JSON.parse(text) : text.slice(0, 400),
  }
}

/** Every leaf path in an object, arrays collapsed to `[]`, so the shape is visible without values. */
function paths(value: unknown, prefix = '', out = new Set<string>(), depth = 0): Set<string> {
  if (depth > 8 || value === null || value === undefined) return out
  if (Array.isArray(value)) {
    if (value.length === 0) out.add(`${prefix}[] (empty)`)
    else paths(value[0], `${prefix}[]`, out, depth + 1)
    return out
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const next = prefix ? `${prefix}.${key}` : key
      if (child !== null && typeof child === 'object') paths(child, next, out, depth + 1)
      else out.add(`${next}: ${child === null ? 'null' : typeof child}`)
    }
    return out
  }
  out.add(`${prefix}: ${typeof value}`)
  return out
}

function at(root: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (node === null || node === undefined) return undefined
    return (node as Record<string, unknown>)[key]
  }, root)
}

async function main(): Promise<void> {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true })
  const state = readState()
  const force = process.argv.includes('--force')
  if (state.api?.verified_at && !force) {
    console.log(`[phase0] already done — API contract verified at ${state.api.verified_at}`)
    console.log(`[phase0] re-run with --force to re-probe`)
    return
  }

  const probes: Probe[] = []
  const bodies: Record<string, unknown> = {}

  // 1. Single-study endpoint, one request per study.
  for (const id of PROBE_IDS) {
    const { probe, body } = await get(`${API_ROOT}/studies/${id}?format=json`)
    probes.push(probe)
    bodies[id] = body
    console.log(`[phase0] GET /studies/${id} -> ${probe.status} ${probe.bytes}B ${probe.ms}ms`)
    await new Promise((r) => setTimeout(r, 500))
  }

  // 2. Batch lookup by ID list — is it supported, and how many IDs per request?
  const batchTests: Array<{ query: string; status: number; returned: number | string }> = []
  for (const query of [`filter.ids=${PROBE_IDS.join(',')}`, `query.id=${PROBE_IDS.join(' OR ')}`]) {
    const { probe, body } = await get(`${API_ROOT}/studies?${query}&format=json&pageSize=10`)
    const studies = at(body, 'studies')
    batchTests.push({
      query: query.split('=')[0] ?? query,
      status: probe.status,
      returned: Array.isArray(studies) ? studies.length : String(body).slice(0, 120),
    })
    console.log(
      `[phase0] batch ${query.split('=')[0]} -> ${probe.status} returned ${batchTests.at(-1)!.returned}`,
    )
    await new Promise((r) => setTimeout(r, 500))
  }

  // 3. Page-size ceiling.
  const pageSizeTests: Array<{ asked: number; status: number; got: number | string }> = []
  for (const asked of [1000, 1001]) {
    const { probe, body } = await get(
      `${API_ROOT}/studies?filter.advanced=AREA[HasResults]true&pageSize=${asked}&fields=NCTId&format=json`,
    )
    const studies = at(body, 'studies')
    pageSizeTests.push({
      asked,
      status: probe.status,
      got: Array.isArray(studies) ? studies.length : String(body).slice(0, 120),
    })
    console.log(`[phase0] pageSize=${asked} -> ${probe.status} got ${pageSizeTests.at(-1)!.got}`)
    await new Promise((r) => setTimeout(r, 500))
  }

  // Full payload of the mid-size randomized trial, for inspection on disk.
  const specimenId = 'NCT01352715'
  const specimenPath = join(STATE_DIR, `phase0-specimen-${specimenId}.json`)
  writeFileSync(specimenPath, JSON.stringify(bodies[specimenId], null, 2))

  const shapes: Record<string, string[]> = {}
  for (const id of PROBE_IDS) {
    const results = at(bodies[id], 'resultsSection')
    shapes[id] = results ? [...paths(results)].sort() : ['ABSENT: resultsSection']
  }
  writeFileSync(join(STATE_DIR, 'phase0-result-shapes.json'), JSON.stringify(shapes, null, 2))
  writeFileSync(
    join(STATE_DIR, 'phase0-probes.json'),
    JSON.stringify({ probes, batchTests, pageSizeTests }, null, 2),
  )

  writeState({
    ...state,
    phase: '0-probe',
    api: {
      ...(state.api ?? {}),
      verified_at: new Date().toISOString(),
      api_root: API_ROOT,
      probe_ids: [...PROBE_IDS],
      specimen: specimenPath,
      batch_lookup: batchTests,
      page_size: pageSizeTests,
      observed_headers: probes[0]?.headers ?? {},
    },
  })
  console.log(`[phase0] wrote ${specimenPath}`)
  console.log(`[phase0] wrote result shapes for ${PROBE_IDS.length} studies`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
