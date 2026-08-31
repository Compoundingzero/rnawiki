import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { drugs } from '@/db/schema'
import type { MedicineRecordedBackground } from '@/lib/background/types'

/**
 * The recorded-background corpus is the asset this project has, and it was absent from every bulk
 * artifact it published — reachable only one row at a time through a rate-limited API. These tests
 * pin that it is now published, and that publishing it did not carry anything restricted out with it.
 *
 * Production publication writes into committed `data/`. This suite instead passes an explicit
 * empty temporary output directory while it runs against a disposable database. The production
 * shrinkage guard remains armed, the checked-in dataset is never a test output, and the temporary
 * fixture export is removed when the suite finishes.
 */

const EXPORT_DIR = mkdtempSync(join(tmpdir(), 'rnawiki-dataset-export-'))
const EXPORT_COMMAND = ['tsx', 'scripts/export/dataset.ts', '--output-dir', EXPORT_DIR] as const
const FIXTURE_ID = 'dataset-export-recorded-background-fixture'
const FIXTURE_SOURCE = {
  kind: 'FDA_LABEL',
  identifier: 'DATASET-EXPORT-INTEGRATION',
  label: 'Dataset export integration label',
  locator: 'section 12.3',
  retrievedAt: '2026-08-31',
  excerpt: 'The mean elimination half-life was 10 hours.',
} as const
const FIXTURE_BACKGROUND: MedicineRecordedBackground = {
  version: 'medicine-background/v1',
  authoredAt: '2026-08-31',
  pharmacokinetics: {
    routeAsRecorded: 'oral',
    halfLife: {
      display: '10 hours',
      numeric: 10,
      unit: 'hours',
      populationContext: 'adults after one oral dose',
      source: FIXTURE_SOURCE,
    },
  },
  interactionSignals: [
    {
      counterpartyAsRecorded: 'CYP3A4',
      kind: 'ENZYME',
      polarity: 'NEGATED',
      labelSection: 'clinical_pharmacology',
      source: {
        ...FIXTURE_SOURCE,
        locator: 'section 12.2',
        excerpt: 'The medicine does not inhibit CYP3A4.',
      },
    },
  ],
  sourceConsensus: {
    documentsExamined: 2,
    fields: [
      {
        field: 'halfLife',
        sourceCount: 2,
        agreementRate: 1,
        numericallyDisjoint: false,
        comparisonState: 'agree',
        readings: [
          {
            display: '10 hours',
            numeric: 10,
            unit: 'hours',
            populationContext: 'adults after one oral dose',
            sourceCount: 2,
            sources: [
              FIXTURE_SOURCE,
              {
                ...FIXTURE_SOURCE,
                identifier: 'DATASET-EXPORT-INTEGRATION-SECONDARY',
                label: 'Dataset export integration secondary label',
              },
            ],
          },
        ],
      },
    ],
  },
}
let manifest: {
  generatedAt: string
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

beforeAll(async () => {
  await db
    .insert(drugs)
    .values({
      id: FIXTURE_ID,
      slug: FIXTURE_ID,
      name: 'Dataset export recorded-background fixture',
      sponsor: 'Integration test',
      modality: 'Small Molecule',
      approvalStatus: 'FDA Approved',
      indication: 'Integration-test fixture',
      auditConfidence: 'Moderate / Debated',
      confidenceScore: 50,
      recordedBackground: FIXTURE_BACKGROUND,
    })
    .onConflictDoUpdate({
      target: drugs.id,
      set: { recordedBackground: FIXTURE_BACKGROUND },
    })

  execFileSync('npx', [...EXPORT_COMMAND], { stdio: 'pipe' })
  manifest = JSON.parse(readFileSync(join(EXPORT_DIR, 'manifest.json'), 'utf8'))
}, 300_000)

afterAll(() => {
  rmSync(EXPORT_DIR, { recursive: true, force: true })
})

function exportedPath(manifestPath: string): string {
  if (!manifestPath.startsWith('data/')) {
    throw new Error(`Unexpected dataset manifest path: ${manifestPath}`)
  }
  return join(EXPORT_DIR, manifestPath.slice('data/'.length))
}

function artifact(path: string) {
  const entry = manifest.files.find((file) => file.path === path)
  if (!entry) throw new Error(`${path} is not in the manifest`)
  return entry
}

function lines(path: string): string[] {
  return readFileSync(exportedPath(path), 'utf8').trim().split('\n').filter(Boolean)
}

describe('the corpus is in the export', () => {
  it('publishes recorded background as its own artifact', () => {
    const entry = artifact('data/recorded-background.ndjson')
    expect(entry.rows).toBeGreaterThan(0)
    expect(entry.schemaVersion).toBe('recorded-background/2')
    expect(existsSync(exportedPath(entry.path))).toBe(true)
  })

  it('publishes the cross-source layer with its comparability state', () => {
    expect(artifact('data/source-consensus.ndjson').schemaVersion).toBe('source-consensus/2')
    const rows = lines('data/source-consensus.ndjson').map((line) => JSON.parse(line))
    expect(rows.length).toBeGreaterThan(0)
    const states = new Set(rows.map((row) => row.comparisonState))
    /* Every state the contract can produce must serialize, including conservative context refusal. */
    expect(
      [...states].every((s) =>
        ['agree', 'differ', 'not_comparable', 'insufficient_context'].includes(s),
      ),
    ).toBe(true)
    for (const row of rows) {
      expect(row.slug).toBeTruthy()
      expect(row.field).toBeTruthy()
      expect(Array.isArray(row.readings)).toBe(true)
      expect(
        row.readings.reduce(
          (sum: number, reading: { sourceCount: number }) => sum + reading.sourceCount,
          0,
        ),
      ).toBe(row.sourceCount)
      for (const reading of row.readings) {
        expect(reading.populationContext).toBeTruthy()
        expect(reading.sources).toHaveLength(reading.sourceCount)
      }
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
      const body = readFileSync(exportedPath(file.path), 'utf8')
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
      const body = readFileSync(exportedPath(file.path), 'utf8')
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
  it('refuses even one silently missing medicine and an unreadable prior manifest', () => {
    const manifestPath = join(EXPORT_DIR, 'manifest.json')
    const original = readFileSync(manifestPath, 'utf8')
    const current = JSON.parse(original) as { counts: { total: number } }
    const failureText = (run: () => void): string => {
      try {
        run()
      } catch (error) {
        return `${String(error)}\n${String((error as { stderr?: unknown }).stderr ?? '')}`
      }
      throw new Error('Expected dataset export to refuse the fixture')
    }

    try {
      writeFileSync(
        manifestPath,
        `${JSON.stringify({ ...current, counts: { ...current.counts, total: current.counts.total + 1 } })}\n`,
      )
      expect(
        failureText(() => execFileSync('npx', [...EXPORT_COMMAND], { stdio: 'pipe' })),
      ).toContain('Even one silently missing medicine is forbidden')

      writeFileSync(manifestPath, 'not valid json\n')
      expect(
        failureText(() => execFileSync('npx', [...EXPORT_COMMAND], { stdio: 'pipe' })),
      ).toContain('Refusing to replace an unreadable prior manifest')
    } finally {
      writeFileSync(manifestPath, original)
    }
  }, 300_000)

  it('preserves the complete manifest and its approved derived attachment on identical input', () => {
    const manifestPath = join(EXPORT_DIR, 'manifest.json')
    const original = readFileSync(manifestPath, 'utf8')
    const before = JSON.parse(original) as typeof manifest & {
      counts: Record<string, number>
    }
    const attached = `${JSON.stringify(
      {
        ...before,
        counts: {
          ...before.counts,
          agentRuns: 10,
          agentCandidates: 2041,
          agentFindings: 42555,
        },
        files: [
          ...before.files,
          {
            path: 'data/agents/current/manifest.json',
            rows: 10,
            bytes: 1234,
            sha256: 'a'.repeat(64),
            schemaVersion: 'rnawiki-current-agent-manifest/v1',
            mediaType: 'application/json',
            licence: 'CC BY 4.0 — see LICENSE-DATA',
            description: 'Approved deterministic agent attachment.',
            limitations: 'Fixture metadata only.',
          },
        ],
      },
      null,
      2,
    )}\n`

    try {
      writeFileSync(manifestPath, attached)
      execFileSync('npx', [...EXPORT_COMMAND], { stdio: 'pipe' })
      expect(readFileSync(manifestPath, 'utf8')).toBe(attached)
    } finally {
      writeFileSync(manifestPath, original)
    }
  }, 300_000)

  it('drops unapproved or incomplete derived metadata when the core corpus is unchanged', () => {
    const manifestPath = join(EXPORT_DIR, 'manifest.json')
    const original = readFileSync(manifestPath, 'utf8')
    const before = JSON.parse(original) as typeof manifest & {
      counts: Record<string, number>
    }
    const staleTimestamp = '2000-01-01T00:00:00.000Z'
    const unexpected = {
      ...before,
      generatedAt: staleTimestamp,
      counts: { ...before.counts, unapprovedRows: 1 },
      files: [
        ...before.files,
        {
          path: 'data/unapproved-publication.json',
          rows: 1,
          bytes: 2,
          sha256: 'b'.repeat(64),
          schemaVersion: 'unapproved/v1',
          mediaType: 'application/json',
          licence: 'CC BY 4.0 — see LICENSE-DATA',
          description: 'This path is intentionally outside the publication contract.',
          limitations: 'Fixture metadata only.',
        },
      ],
    }

    try {
      writeFileSync(manifestPath, `${JSON.stringify(unexpected, null, 2)}\n`)
      execFileSync('npx', [...EXPORT_COMMAND], { stdio: 'pipe' })

      const repaired = JSON.parse(readFileSync(manifestPath, 'utf8')) as typeof unexpected
      expect(repaired.generatedAt).not.toBe(staleTimestamp)
      expect(repaired.counts).not.toHaveProperty('unapprovedRows')
      expect(repaired.files).not.toContainEqual(
        expect.objectContaining({ path: 'data/unapproved-publication.json' }),
      )
      expect(repaired.files.map((file) => `${file.path}:${file.sha256}`)).toEqual(
        before.files.map((file) => `${file.path}:${file.sha256}`),
      )

      writeFileSync(
        manifestPath,
        `${JSON.stringify(
          {
            ...before,
            generatedAt: staleTimestamp,
            counts: { ...before.counts, agentRuns: 10 },
          },
          null,
          2,
        )}\n`,
      )
      execFileSync('npx', [...EXPORT_COMMAND], { stdio: 'pipe' })
      const repairedPartialCounts = JSON.parse(
        readFileSync(manifestPath, 'utf8'),
      ) as typeof unexpected
      expect(repairedPartialCounts.generatedAt).not.toBe(staleTimestamp)
      expect(repairedPartialCounts.counts).not.toHaveProperty('agentRuns')
      expect(repairedPartialCounts.files.map((file) => `${file.path}:${file.sha256}`)).toEqual(
        before.files.map((file) => `${file.path}:${file.sha256}`),
      )
    } finally {
      writeFileSync(manifestPath, original)
    }
  }, 300_000)

  it('replaces core metadata and drops a stale derived attachment after a real corpus change', async () => {
    const manifestPath = join(EXPORT_DIR, 'manifest.json')
    const original = readFileSync(manifestPath, 'utf8')
    const before = JSON.parse(original) as typeof manifest & {
      counts: Record<string, number>
    }
    const staleTimestamp = '2000-01-01T00:00:00.000Z'
    const stale = {
      ...before,
      generatedAt: staleTimestamp,
      counts: {
        ...before.counts,
        agentRuns: 10,
        agentCandidates: 2041,
        agentFindings: 42555,
      },
      files: [
        ...before.files,
        {
          path: 'data/agents/current/manifest.json',
          rows: 10,
          bytes: 1234,
          sha256: 'a'.repeat(64),
          schemaVersion: 'rnawiki-current-agent-manifest/v1',
          mediaType: 'application/json',
          licence: 'CC BY 4.0 — see LICENSE-DATA',
          description: 'Stale deterministic agent attachment.',
          limitations: 'Fixture metadata only.',
        },
      ],
    }

    try {
      writeFileSync(manifestPath, `${JSON.stringify(stale, null, 2)}\n`)
      await db
        .update(drugs)
        .set({ sponsor: 'Integration test — changed core value' })
        .where(eq(drugs.id, FIXTURE_ID))
      execFileSync('npx', [...EXPORT_COMMAND], { stdio: 'pipe' })

      const changed = JSON.parse(readFileSync(manifestPath, 'utf8')) as typeof stale
      expect(changed.generatedAt).not.toBe(staleTimestamp)
      expect(changed.counts).not.toHaveProperty('agentRuns')
      expect(changed.counts).not.toHaveProperty('agentCandidates')
      expect(changed.counts).not.toHaveProperty('agentFindings')
      expect(changed.files).not.toContainEqual(
        expect.objectContaining({ path: 'data/agents/current/manifest.json' }),
      )
      expect(changed.files.find((file) => file.path.startsWith('data/drugs/'))?.sha256).not.toBe(
        before.files.find((file) => file.path.startsWith('data/drugs/'))?.sha256,
      )
    } finally {
      await db.update(drugs).set({ sponsor: 'Integration test' }).where(eq(drugs.id, FIXTURE_ID))
      execFileSync('npx', [...EXPORT_COMMAND], { stdio: 'pipe' })
    }
  }, 300_000)
})
