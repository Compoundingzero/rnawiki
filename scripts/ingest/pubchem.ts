import { readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs'
import { CACHE_FILES } from './paths'

/**
 * Chemical structures from PubChem PUG-REST. Public domain, no key, and the only free source that
 * covers the whole small-molecule corpus.
 *
 * A TRAP WORTH RECORDING: PubChem renamed its SMILES properties in 2025. Requesting
 * `CanonicalSMILES` still returns HTTP 200 — the property is simply absent from the response — so
 * a resolver written against the old name fills the database with nulls and reports success.
 * Verified against the live API on 2026-08-20: the properties that come back are `SMILES` and
 * `ConnectivitySMILES`. Re-check before changing this list.
 */
const PROPERTIES = [
  'MolecularFormula',
  'MolecularWeight',
  'SMILES',
  'ConnectivitySMILES',
  'IUPACName',
  'XLogP',
  'TPSA',
  'HBondDonorCount',
  'HBondAcceptorCount',
  'RotatableBondCount',
] as const

export interface PubChemRecord {
  cid: number
  smiles: string
  formula: string
  molecularWeight: number
  iupacName?: string
  xlogp?: number
  tpsa?: number
  hbd?: number
  hba?: number
  rotatableBonds?: number
  /** Which name variant actually matched, so a surprising structure can be traced. */
  matchedVariant: string
  source: 'PubChem PUG-REST'
}

interface CacheEntry {
  record: PubChemRecord | null
  fetchedAt: string
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

/**
 * PubChem publishes a hard limit of 5 requests/second and 400 requests/minute. A fixed sleep
 * either wastes hours or trips the limit on a burst; a token bucket tracks both windows and only
 * waits when it must. Exceeding the limit gets the caller blocked, and a block would end the crawl
 * for everyone on this IP.
 */
class TokenBucket {
  private secondWindow: number[] = []
  private minuteWindow: number[] = []

  constructor(
    private readonly perSecond = 5,
    private readonly perMinute = 400,
  ) {}

  async take(): Promise<void> {
    for (;;) {
      const now = Date.now()
      this.secondWindow = this.secondWindow.filter((t) => now - t < 1000)
      this.minuteWindow = this.minuteWindow.filter((t) => now - t < 60_000)

      if (this.secondWindow.length < this.perSecond && this.minuteWindow.length < this.perMinute) {
        this.secondWindow.push(now)
        this.minuteWindow.push(now)
        return
      }

      const secondWait =
        this.secondWindow.length >= this.perSecond
          ? 1000 - (now - (this.secondWindow[0] ?? now))
          : 0
      const minuteWait =
        this.minuteWindow.length >= this.perMinute
          ? 60_000 - (now - (this.minuteWindow[0] ?? now))
          : 0
      await sleep(Math.max(25, secondWait, minuteWait))
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

/**
 * A full crawl of 10,000 names takes over half an hour at PubChem's rate limit, so a re-run must
 * resume rather than start over. Negative results are cached too: without that, every biologic in
 * the corpus is re-queried on every run to be told again that PubChem has no small-molecule entry
 * for pembrolizumab.
 */
export class StructureCache {
  private entries = new Map<string, CacheEntry>()
  private dirty = 0

  constructor(private readonly path: string = CACHE_FILES.structureIndex) {
    if (existsSync(this.path)) {
      try {
        const raw = JSON.parse(readFileSync(this.path, 'utf8')) as Record<string, CacheEntry>
        for (const [key, value] of Object.entries(raw)) this.entries.set(key, value)
      } catch {
        console.warn(`[pubchem] cache at ${this.path} is unreadable; starting fresh`)
      }
    }
  }

  has(key: string): boolean {
    return this.entries.has(key)
  }

  get(key: string): PubChemRecord | null | undefined {
    return this.entries.get(key)?.record
  }

  set(key: string, record: PubChemRecord | null): void {
    this.entries.set(key, { record, fetchedAt: new Date().toISOString() })
    this.dirty += 1
    // Flush periodically so a Ctrl-C costs at most the last 50 lookups.
    if (this.dirty >= 50) this.flush()
  }

  flush(): void {
    if (this.dirty === 0) return
    const payload: Record<string, CacheEntry> = {}
    for (const [key, value] of this.entries) payload[key] = value
    // Write-then-rename: a process killed mid-write must not leave a truncated cache behind.
    const temp = `${this.path}.tmp`
    writeFileSync(temp, JSON.stringify(payload))
    renameSync(temp, this.path)
    this.dirty = 0
  }

  stats(): { total: number; hits: number; negatives: number } {
    let hits = 0
    let negatives = 0
    for (const entry of this.entries.values()) {
      if (entry.record) hits += 1
      else negatives += 1
    }
    return { total: this.entries.size, hits, negatives }
  }
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

const bucket = new TokenBucket()

interface PropertyRow {
  CID?: number
  MolecularFormula?: string
  MolecularWeight?: string | number
  SMILES?: string
  ConnectivitySMILES?: string
  IUPACName?: string
  XLogP?: number
  TPSA?: number
  HBondDonorCount?: number
  HBondAcceptorCount?: number
  RotatableBondCount?: number
}

async function fetchProperties(name: string): Promise<PropertyRow | null> {
  const url =
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}` +
    `/property/${PROPERTIES.join(',')}/JSON`

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await bucket.take()
    let response: Response
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
    } catch {
      await sleep(500 * 2 ** attempt)
      continue
    }

    // 404 means PubChem has no compound of that name. That is an ANSWER, not a failure, and it is
    // the correct answer for every antibody and gene therapy in the corpus.
    if (response.status === 404) return null
    if (response.status === 503 || response.status === 429) {
      await sleep(1000 * 2 ** attempt)
      continue
    }
    if (!response.ok) return null

    // Body reading needs the same guard as the request. PubChem closes sockets mid-response under
    // load, and an UND_ERR_SOCKET thrown here escaped the retry loop entirely — the crawl died on
    // the first flaky connection rather than backing off and continuing.
    try {
      const body = (await response.json()) as { PropertyTable?: { Properties?: PropertyRow[] } }
      return body.PropertyTable?.Properties?.[0] ?? null
    } catch {
      await sleep(500 * 2 ** attempt)
      continue
    }
  }
  return null
}

/**
 * Name variants to try, in order. A moiety stripped of its salt often has no PubChem entry under
 * the bare name while the salt form does, and vice versa, so both are worth a lookup — but only in
 * that order, because the bare moiety is the molecule the page is about.
 */
export function nameVariants(
  moiety: string,
  saltForms: readonly string[],
  brands: readonly string[],
): string[] {
  const variants = [moiety]
  for (const salt of saltForms.slice(0, 2)) {
    if (salt.toUpperCase() !== moiety.toUpperCase()) variants.push(salt)
  }
  const brand = brands[0]
  if (brand) variants.push(brand)
  return [...new Set(variants.map((v) => v.trim()).filter(Boolean))]
}

export async function resolveStructure(
  moiety: string,
  options: {
    saltForms?: readonly string[]
    brands?: readonly string[]
    cache?: StructureCache
  } = {},
): Promise<PubChemRecord | null> {
  const cache = options.cache
  if (cache?.has(moiety)) return cache.get(moiety) ?? null

  for (const variant of nameVariants(moiety, options.saltForms ?? [], options.brands ?? [])) {
    const row = await fetchProperties(variant)
    if (!row) continue

    const smiles = row.SMILES ?? row.ConnectivitySMILES
    const formula = row.MolecularFormula
    const weight =
      typeof row.MolecularWeight === 'string'
        ? Number.parseFloat(row.MolecularWeight)
        : row.MolecularWeight

    // A row with no structure is not a match. Writing a formula with no SMILES would leave the
    // dossier claiming a structure the page cannot display.
    if (!smiles || !formula || !Number.isFinite(weight)) continue

    const record: PubChemRecord = {
      cid: row.CID ?? 0,
      smiles,
      formula,
      molecularWeight: weight as number,
      iupacName: row.IUPACName,
      xlogp: row.XLogP,
      tpsa: row.TPSA,
      hbd: row.HBondDonorCount,
      hba: row.HBondAcceptorCount,
      rotatableBonds: row.RotatableBondCount,
      matchedVariant: variant,
      source: 'PubChem PUG-REST',
    }
    cache?.set(moiety, record)
    return record
  }

  cache?.set(moiety, null)
  return null
}
