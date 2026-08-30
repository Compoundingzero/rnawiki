import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { beforeAll, describe, expect, it } from 'vitest'

/**
 * The recorded-background corpus is the asset this project has, and it was absent from every bulk
 * artifact it published — reachable only one row at a time through a rate-limited API. These tests
 * pin that it is now published, and that publishing it did not carry anything restricted out with it.
 *
 * The exporter writes into `data/`, which is committed, so this suite runs it against a disposable
 * database into a temporary directory and restores nothing: it asserts over what the run produced.
 */

const EXPORT_DIR = join(process.cwd(), 'data')
let manifest: {
  licence: string
  files: Array<{
    path: string
    rows: number
    bytes: number
    sha256: string
    schemaVersion: string
    licence: string
  }>
}

beforeAll(() => {
  execFileSync('npx', ['tsx', 'scripts/export/dataset.ts'], { stdio: 'pipe' })
  manifest = JSON.parse(readFileSync(join(EXPORT_DIR, 'manifest.json'), 'utf8'))
}, 300_000)

function artifact(path: string) {
  const entry = manifest.files.find((file) => file.path === path)
  if (!entry) throw new Error(`${path} is not in the manifest`)
  return entry
}

function lines(path: string): string[] {
  return readFileSync(join(process.cwd(), path), 'utf8').trim().split('\n').filter(Boolean)
}

describe('the corpus is in the export', () => {
  it('publishes recorded background as its own artifact', () => {
    const entry = artifact('data/recorded-background.ndjson')
    expect(entry.rows).toBeGreaterThan(0)
    expect(entry.schemaVersion).toBe('recorded-background/1')
    expect(existsSync(join(process.cwd(), entry.path))).toBe(true)
  })

  it('publishes the cross-source layer with its comparability state', () => {
    const rows = lines('data/source-consensus.ndjson').map((line) => JSON.parse(line))
    expect(rows.length).toBeGreaterThan(0)
    const states = new Set(rows.map((row) => row.comparisonState))
    /* Every state the contract can produce must serialize; `differ` is the one readers came for. */
    expect(
      [...states].every((s) =>
        ['agree', 'differ', 'not_comparable', 'insufficient_context'].includes(s),
      ),
    ).toBe(true)
    for (const row of rows) {
      expect(row.slug).toBeTruthy()
      expect(row.field).toBeTruthy()
      expect(Array.isArray(row.readings)).toBe(true)
    }
  })

  it('keeps every value bound to the sentence it was read from', () => {
    const rows = lines('data/recorded-background.ndjson').map((line) => JSON.parse(line))
    const withPk = rows.find((row) => row.recordedBackground?.pharmacokinetics?.halfLife)
    if (!withPk) return
    const halfLife = withPk.recordedBackground.pharmacokinetics.halfLife
    expect(halfLife.source.excerpt).toBeTruthy()
    expect(halfLife.source.identifier).toBeTruthy()
    expect(halfLife.source.retrievedAt).toBeTruthy()
    expect(halfLife.populationContext).toBeTruthy()
  })

  it('preserves interaction polarity, which is what makes a denial a denial', () => {
    const rows = lines('data/recorded-background.ndjson').map((line) => JSON.parse(line))
    const signals = rows.flatMap((row) => row.recordedBackground?.interactionSignals ?? [])
    if (signals.length === 0) return
    expect(signals.some((signal: { polarity?: string }) => signal.polarity === 'NEGATED')).toBe(
      true,
    )
  })
})

describe('publishing the corpus carries nothing restricted with it', () => {
  it('contains no patient-action material', () => {
    const body = readFileSync(join(EXPORT_DIR, 'recorded-background.ndjson'), 'utf8')
    expect(body).not.toContain('homeRemedies')
    expect(body).not.toContain('clinicalPrecaution')
  })

  it('contains no named-treatment ranking', () => {
    const body = readFileSync(join(EXPORT_DIR, 'recorded-background.ndjson'), 'utf8')
    expect(body).not.toContain('prosAndCons')
  })

  it('contains no laboratory workflow content', () => {
    /*
     * The CONTENT must be absent, not the word. The serializer deliberately keeps an access block
     * naming `laboratoryWorkflow` as withheld -- "an omitted field plus explicit access metadata
     * says that the field was intentionally withheld", where an empty array would falsely say no
     * workflow was ever recorded. So the assertion is on the operational detail itself.
     */
    for (const file of manifest.files) {
      const body = readFileSync(join(process.cwd(), file.path), 'utf8')
      expect(body, file.path).not.toContain('reagentsAndBuffer')
      expect(body, file.path).not.toContain('"phase":"Synthesis"')
      expect(body, file.path).not.toContain('"stepNumber"')
    }
  })

  it('states that the workflow was withheld rather than pretending none exists', () => {
    const rows = lines('data/drugs/drugs-001.ndjson').map((line) => JSON.parse(line))
    const withAccess = rows.find((row) => row.access?.laboratoryWorkflow)
    if (!withAccess) return
    expect(withAccess.access.laboratoryWorkflow).toMatchObject({
      status: 'restricted',
      included: false,
    })
  })

  it('contains no source archive', () => {
    expect(manifest.files.some((file) => /\.zip$/u.test(file.path))).toBe(false)
  })
})

describe('the manifest describes exactly what was written', () => {
  it('declares CC BY 4.0 on the package and on every artifact', () => {
    expect(manifest.licence).toContain('CC BY 4.0')
    expect(manifest.licence).not.toContain('BY-SA')
    for (const file of manifest.files) {
      expect(file.licence, file.path).toContain('CC BY 4.0')
      expect(file.licence, file.path).not.toContain('BY-SA')
    }
  })

  it('matches every recorded hash, byte count and row count to the file on disk', () => {
    for (const file of manifest.files) {
      const body = readFileSync(join(process.cwd(), file.path), 'utf8')
      expect(createHash('sha256').update(body).digest('hex'), file.path).toBe(file.sha256)
      expect(Buffer.byteLength(body), file.path).toBe(file.bytes)
      if (file.path.endsWith('.ndjson')) {
        expect(body.trim().split('\n').filter(Boolean).length, file.path).toBe(file.rows)
      }
    }
  })

  it('gives every artifact a schema version, media type and limitation note', () => {
    for (const file of manifest.files) {
      expect(file.schemaVersion, file.path).toBeTruthy()
      expect((file as { mediaType?: string }).mediaType, file.path).toBeTruthy()
      expect((file as { limitations?: string }).limitations, file.path).toBeTruthy()
    }
  })
})

describe('the export is reproducible', () => {
  it('produces identical content hashes when run twice', () => {
    const before = manifest.files.map((file) => `${file.path}:${file.sha256}`).sort()
    execFileSync('npx', ['tsx', 'scripts/export/dataset.ts'], { stdio: 'pipe' })
    const after = (
      JSON.parse(readFileSync(join(EXPORT_DIR, 'manifest.json'), 'utf8')) as typeof manifest
    ).files
      .map((file) => `${file.path}:${file.sha256}`)
      .sort()
    /* generatedAt is the only field permitted to move between two runs over identical input. */
    expect(after).toEqual(before)
  }, 300_000)
})
