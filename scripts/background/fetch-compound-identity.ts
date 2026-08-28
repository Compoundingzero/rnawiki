import 'dotenv/config'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/**
 * Fetches chemical identity for corpus rows that no label source reaches.
 *
 * A large part of this corpus is neither a prescription drug nor a marketed supplement: single
 * chemicals, cosmetic ingredients, isolated compounds. No drug label describes them and the
 * supplement database does not list them, so both pipelines find nothing and the row stays empty.
 *
 * What is knowable about a named compound is its chemistry, and PubChem holds exactly that. A
 * molecular formula and weight is thin next to a pharmacology section, and it is also true,
 * sourced, and more than the nothing that was there. A botanical or a homeopathic preparation has
 * no single compound behind it and gets no entry here, which is the correct answer rather than a
 * gap to paper over.
 *
 * Nothing derived, nothing predicted: the formula and weight are the values PubChem returns for the
 * compound the name resolved to, recorded with the compound id so anyone can check them.
 *
 * PubChem asks for no more than five requests per second and this stays under it deliberately. The
 * supplement fetcher learned that lesson the expensive way, by exhausting a public service's quota
 * and then waiting hours for it to clear.
 *
 * Usage:
 *   tsx scripts/background/fetch-compound-identity.ts [--limit=N]
 */

const PUBCHEM = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound'
const CONCURRENCY = 3
const PAUSE_BETWEEN_REQUESTS_MS = 120
const RETRY_LIMIT = 3

export interface CompoundIdentityEntry {
  queriedName: string
  cid?: string
  molecularFormula?: string
  molecularWeight?: number
  iupacName?: string
  state: 'RECORDED' | 'NO_COMPOUND' | 'LOOKUP_FAILED'
}

type Cache = Record<string, CompoundIdentityEntry>

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function get(url: string): Promise<Response | null> {
  for (let attempt = 0; attempt < RETRY_LIMIT; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
      // 404 is a real answer — PubChem knows no compound by that name — and must not be retried.
      if (response.status === 404) return response
      if (response.status === 429 || response.status === 503) {
        await sleep(5000 * (attempt + 1))
        continue
      }
      return response
    } catch {
      await sleep(1000 * (attempt + 1))
    }
  }
  return null
}

async function lookup(name: string): Promise<CompoundIdentityEntry> {
  const encoded = encodeURIComponent(name)
  const response = await get(
    `${PUBCHEM}/name/${encoded}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`,
  )
  if (!response) return { queriedName: name, state: 'LOOKUP_FAILED' }
  if (response.status === 404) return { queriedName: name, state: 'NO_COMPOUND' }
  if (!response.ok) return { queriedName: name, state: 'LOOKUP_FAILED' }

  const payload = (await response.json()) as {
    PropertyTable?: {
      Properties?: Array<{
        CID?: number
        MolecularFormula?: string
        MolecularWeight?: string | number
        IUPACName?: string
      }>
    }
  }
  const first = payload.PropertyTable?.Properties?.[0]
  if (!first?.CID) return { queriedName: name, state: 'NO_COMPOUND' }
  const weight = Number(first.MolecularWeight)
  return {
    queriedName: name,
    cid: String(first.CID),
    ...(first.MolecularFormula ? { molecularFormula: first.MolecularFormula } : {}),
    ...(Number.isFinite(weight) ? { molecularWeight: weight } : {}),
    ...(first.IUPACName ? { iupacName: first.IUPACName } : {}),
    state: 'RECORDED',
  }
}

/** Rows the label and supplement pipelines do not reach. */
async function namesNeedingIdentity(): Promise<string[]> {
  const { ALL_RECORDED_BACKGROUND } = (await import('../seed-data/background')) as {
    ALL_RECORDED_BACKGROUND: Record<string, unknown>
  }
  const covered = new Set(Object.keys(ALL_RECORDED_BACKGROUND))
  const dir = join(process.cwd(), 'data', 'drugs')
  const names: string[] = []
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith('.ndjson'))
    .sort()) {
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as { id?: string; name?: string }
      if (!record.id || !record.name || covered.has(record.id)) continue
      const name = record.name.trim().replace(/\)+$/u, '')
      if (name.length >= 3) names.push(name)
    }
  }
  return [...new Set(names)]
}

async function main() {
  const limitFlag = process.argv.find((value) => value.startsWith('--limit='))
  const limit = limitFlag ? Number(limitFlag.split('=')[1]) : Infinity

  const cachePath =
    process.env.RNAWIKI_PUBCHEM_CACHE ??
    '/private/tmp/claude-501/-Users-admin-ClaudeRepo-Claude-Projects-RNAwiki/pubchem-identity.json'
  mkdirSync(dirname(cachePath), { recursive: true })
  const cache: Cache = existsSync(cachePath)
    ? (JSON.parse(readFileSync(cachePath, 'utf8')) as Cache)
    : {}

  const names = await namesNeedingIdentity()
  const outstanding = names.filter((name) => !cache[name] || cache[name]!.state === 'LOOKUP_FAILED')
  console.log(
    `[pubchem] ${names.length} uncovered row name(s) · ${Object.keys(cache).length} cached · ${outstanding.length} outstanding`,
  )

  const queue = outstanding.slice(0, Math.min(outstanding.length, limit))
  let next = 0
  let done = 0
  let lastSave = Date.now()
  const worker = async (): Promise<void> => {
    for (;;) {
      const index = next
      next += 1
      const name = queue[index]
      if (name === undefined) return
      cache[name] = await lookup(name)
      done += 1
      await sleep(PAUSE_BETWEEN_REQUESTS_MS)
      if (Date.now() - lastSave > 20_000) {
        writeFileSync(cachePath, JSON.stringify(cache))
        lastSave = Date.now()
      }
      if (done % 250 === 0) console.log(`[pubchem] ${done}/${queue.length}`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))
  writeFileSync(cachePath, JSON.stringify(cache))

  const states = new Map<string, number>()
  for (const entry of Object.values(cache)) {
    states.set(entry.state, (states.get(entry.state) ?? 0) + 1)
  }
  console.log(`[pubchem] ${JSON.stringify(Object.fromEntries(states))}`)
  console.log(`[pubchem] cache written to ${cachePath}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
