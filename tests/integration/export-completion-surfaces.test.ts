import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { inArray } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/db'
import { dossierCompletionAssessments, drugs, inventoryResolutions } from '@/db/schema'
import type { MedicineRecordedBackground } from '@/lib/background/types'
import type { SectionAssessment } from '@/lib/dossier-completion/types'
import type { AttributionWarning, IdentitySource } from '@/lib/inventory/types'

/**
 * Identity and completion have to survive the trip out of the database, and two of the things that
 * must survive are absences.
 *
 * The published identity artifact carries the warning that a registry identifier is shared and does
 * not carry the rows it is shared with, because a shared identifier is not evidence that two rows
 * are one substance. The published completion artifact carries states such as "searched, nothing
 * qualified" as outcomes rather than as gaps. This suite runs the real exporter against a disposable
 * database, into a temporary directory, and reads what a downloader would receive.
 */

const runsInDisposableDatabase = process.env.E2E_DISPOSABLE_DATABASE === '1'

const EXPORT_DIR = mkdtempSync(join(tmpdir(), 'rnawiki-completion-export-'))
/** The exporter writes the completion corpus in 1,000-row shards, like the medicine corpus. */
const COMPLETION_SHARD = 'data/dossier-completion/dossier-completion-001.ndjson'

const CANONICAL_ID = 'completion-surfaces-canonical'
const DUPLICATE_ID = 'completion-surfaces-duplicate'
const CANONICAL_SLUG = 'completion-surfaces-canonical'
const DUPLICATE_SLUG = 'completion-surfaces-duplicate'

const FIXTURE_SOURCE = {
  kind: 'FDA_LABEL',
  identifier: 'COMPLETION-SURFACES-INTEGRATION',
  label: 'Completion surfaces integration label',
  locator: 'section 12.3',
  retrievedAt: '2026-09-01',
  excerpt: 'The mean elimination half-life was 8 hours.',
} as const

const FIXTURE_BACKGROUND: MedicineRecordedBackground = {
  version: 'medicine-background/v1',
  authoredAt: '2026-09-01',
  pharmacokinetics: {
    routeAsRecorded: 'oral',
    halfLife: {
      display: '8 hours',
      numeric: 8,
      unit: 'hours',
      populationContext: 'adults after one oral dose',
      source: FIXTURE_SOURCE,
    },
  },
}

const IDENTITY_SOURCES: IdentitySource[] = [
  { kind: 'UNII', identifier: 'COMPLETION0X', path: '$.uniiCode' },
]

/** The stored warning names the other row. The published artifact must not. */
const SHARED_IDENTIFIER_WARNING: AttributionWarning[] = [
  {
    code: 'SHARED_REGISTRY_IDENTIFIER',
    detail: 'Another record carries the same registry identifier.',
    relatedSlugs: [DUPLICATE_SLUG],
  },
]

const SECTIONS: SectionAssessment[] = [
  {
    sectionId: 'identity',
    state: 'EXACT_STRUCTURED_SOURCE_DATA',
    basisKind: 'REGISTRY_IDENTIFIER',
    basis: 'One registry identifier is recorded on this record.',
    sourceRefs: [{ kind: 'UNII', identifier: 'COMPLETION0X' }],
  },
  {
    sectionId: 'literature-search',
    state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
    basisKind: 'PUBMED_SEARCH_RECORD',
    basis: 'A dated search returned no report that met the recorded rule.',
    counts: { searchHits: 3, qualifying: 0 },
    sourceRefs: [
      {
        kind: 'PUBMED_SEARCH',
        identifier: 'completion-surfaces-2026-09-01',
        retrievedAt: '2026-09-01',
      },
    ],
    humanReadSuggested: true,
  },
]

interface ManifestFile {
  path: string
  rows: number
  bytes: number
  sha256: string
  schemaVersion: string
  mediaType: string
  licence: string
  description: string
  limitations: string
}

let manifest: {
  generatedAt: string
  counts: Record<string, number>
  files: ManifestFile[]
}

function exportedPath(manifestPath: string): string {
  if (!manifestPath.startsWith('data/')) {
    throw new Error(`Unexpected dataset manifest path: ${manifestPath}`)
  }
  return join(EXPORT_DIR, manifestPath.slice('data/'.length))
}

function artifact(path: string): ManifestFile {
  const entry = manifest.files.find((file) => file.path === path)
  if (!entry) throw new Error(`${path} is not in the manifest`)
  return entry
}

function rowsOf(path: string): Array<Record<string, unknown>> {
  return readFileSync(exportedPath(path), 'utf8')
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as Record<string, unknown>)
}

describe.skipIf(!runsInDisposableDatabase)(
  'identity and completion reach the published files',
  () => {
    beforeAll(async () => {
      await db.insert(drugs).values([
        {
          id: CANONICAL_ID,
          slug: CANONICAL_SLUG,
          name: 'Completion surfaces canonical fixture',
          sponsor: 'Integration test',
          modality: 'Small Molecule',
          approvalStatus: 'FDA Approved',
          indication: 'Integration-test fixture',
          auditConfidence: 'Moderate / Debated',
          confidenceScore: 50,
          recordedBackground: FIXTURE_BACKGROUND,
        },
        {
          id: DUPLICATE_ID,
          slug: DUPLICATE_SLUG,
          name: 'Completion surfaces canonical fixture',
          sponsor: 'Integration test',
          modality: 'Small Molecule',
          approvalStatus: 'FDA Approved',
          indication: 'Integration-test fixture',
          auditConfidence: 'Moderate / Debated',
          confidenceScore: 50,
        },
      ])

      await db.insert(inventoryResolutions).values([
        {
          drugId: CANONICAL_ID,
          resolverVersion: 'inventory-resolution/v1',
          resolutionStatus: 'CANONICAL_ENTITY',
          entityClass: 'APPROVED_MEDICINE',
          entityClassRule: 'approval-status-is-fda-approved',
          canonicalDrugId: CANONICAL_ID,
          canonicalSlug: CANONICAL_SLUG,
          redirectTargetSlug: null,
          identityConfidence: 'REGISTRY_IDENTIFIER_RECORDED',
          identitySources: IDENTITY_SOURCES,
          attributionWarnings: SHARED_IDENTIFIER_WARNING,
          resolutionEvidence: [],
          contentDigest: 'a'.repeat(64),
        },
        {
          drugId: DUPLICATE_ID,
          resolverVersion: 'inventory-resolution/v1',
          resolutionStatus: 'DUPLICATE_OF_CANONICAL_ENTITY',
          entityClass: 'APPROVED_MEDICINE',
          entityClassRule: 'approval-status-is-fda-approved',
          canonicalDrugId: CANONICAL_ID,
          canonicalSlug: CANONICAL_SLUG,
          redirectTargetSlug: CANONICAL_SLUG,
          identityConfidence: 'NAME_ONLY',
          identitySources: [],
          attributionWarnings: [],
          resolutionEvidence: [
            `Identical name after punctuation removal: ${CANONICAL_SLUG} and ${DUPLICATE_SLUG}`,
          ],
          contentDigest: 'b'.repeat(64),
        },
      ])

      await db.insert(dossierCompletionAssessments).values({
        drugId: CANONICAL_ID,
        resolverVersion: 'dossier-completion/v1',
        status: 'COMPLETE',
        inputDigest: 'c'.repeat(64),
        sections: SECTIONS,
        applicableSectionCount: SECTIONS.length,
        terminalSectionCount: SECTIONS.length,
        nonTerminalSectionIds: [],
        humanReadSuggestedSectionIds: ['literature-search'],
      })

      execFileSync('npx', ['tsx', 'scripts/export/dataset.ts', '--output-dir', EXPORT_DIR], {
        stdio: 'pipe',
      })
      manifest = JSON.parse(readFileSync(join(EXPORT_DIR, 'manifest.json'), 'utf8'))
    }, 300_000)

    afterAll(async () => {
      await db
        .delete(inventoryResolutions)
        .where(inArray(inventoryResolutions.drugId, [DUPLICATE_ID, CANONICAL_ID]))
      await db.delete(drugs).where(inArray(drugs.id, [DUPLICATE_ID, CANONICAL_ID]))
      rmSync(EXPORT_DIR, { recursive: true, force: true })
    })

    it('declares both artifacts with a schema, a licence and a limitation', () => {
      for (const [path, schemaVersion] of [
        ['data/inventory-resolution.ndjson', 'inventory-resolution/1'],
        [COMPLETION_SHARD, 'dossier-completion/1'],
      ] as const) {
        const entry = artifact(path)
        expect(entry.schemaVersion).toBe(schemaVersion)
        expect(entry.mediaType).toBe('application/x-ndjson')
        expect(entry.licence).toContain('CC BY 4.0')
        expect(entry.description).toBeTruthy()
        expect(entry.limitations).toBeTruthy()
        expect(existsSync(exportedPath(path))).toBe(true)

        const body = readFileSync(exportedPath(path))
        expect(createHash('sha256').update(body).digest('hex')).toBe(entry.sha256)
        expect(body.byteLength).toBe(entry.bytes)
        expect(body.toString('utf8').split('\n').filter(Boolean)).toHaveLength(entry.rows)
      }
      expect(artifact('data/drugs/drugs-001.ndjson').schemaVersion).toBe('drugs/2')
    })

    it('shards the completion corpus the way the medicine corpus is sharded', () => {
      // A two-row fixture corpus fits in one shard, and the single-file path is gone entirely, so
      // no published file can grow past what the host will store.
      const shards = manifest.files.filter((file) =>
        file.path.startsWith('data/dossier-completion/'),
      )
      expect(shards.map((file) => file.path)).toEqual([COMPLETION_SHARD])
      expect(manifest.files.some((file) => file.path === 'data/dossier-completion.ndjson')).toBe(
        false,
      )
      expect(existsSync(join(EXPORT_DIR, 'dossier-completion.ndjson'))).toBe(false)
      for (const file of manifest.files) {
        expect(file.bytes).toBeLessThan(90_000_000)
      }
    })

    it('publishes one identity row per stored record, sorted, without naming another record', () => {
      const rows = rowsOf('data/inventory-resolution.ndjson')
      const slugs = rows.map((row) => String(row.originalSlug))
      expect([...slugs].sort((left, right) => left.localeCompare(right))).toEqual(slugs)

      const canonical = rows.find((row) => row.originalSlug === CANONICAL_SLUG)
      expect(canonical).toMatchObject({
        originalRecordId: CANONICAL_ID,
        entityClass: 'APPROVED_MEDICINE',
        resolutionStatus: 'CANONICAL_ENTITY',
        canonicalSlug: CANONICAL_SLUG,
        redirectTargetSlug: null,
        identityConfidence: 'REGISTRY_IDENTIFIER_RECORDED',
        identitySourceKinds: ['UNII'],
        attributionWarningCodes: ['SHARED_REGISTRY_IDENTIFIER'],
        resolverVersion: 'inventory-resolution/v1',
      })
      // The stored warning names the duplicate. The published row says only that a shared
      // identifier exists, because a shared identifier is not evidence of one substance.
      expect(JSON.stringify(canonical)).not.toContain(DUPLICATE_SLUG)
      expect(readFileSync(exportedPath('data/inventory-resolution.ndjson'), 'utf8')).not.toContain(
        'relatedSlugs',
      )

      const duplicate = rows.find((row) => row.originalSlug === DUPLICATE_SLUG)
      expect(duplicate).toMatchObject({
        resolutionStatus: 'DUPLICATE_OF_CANONICAL_ENTITY',
        redirectTargetSlug: CANONICAL_SLUG,
      })
      // Evidence may name the address a duplicate resolves to: one entity, described twice.
      expect(
        String((duplicate as { resolutionEvidence: string[] }).resolutionEvidence[0]),
      ).toContain(CANONICAL_SLUG)
    })

    it('publishes one completion row per canonical entity, with its basis and sources', () => {
      const rows = rowsOf(COMPLETION_SHARD)
      expect(rows.map((row) => row.slug)).not.toContain(DUPLICATE_SLUG)
      const row = rows.find((candidate) => candidate.slug === CANONICAL_SLUG)
      expect(row).toMatchObject({
        name: 'Completion surfaces canonical fixture',
        entityClass: 'APPROVED_MEDICINE',
        status: 'COMPLETE',
        applicableSectionCount: 2,
        terminalSectionCount: 2,
        nonTerminalSectionIds: [],
        humanReadSuggestedSectionIds: ['literature-search'],
        resolverVersion: 'dossier-completion/v1',
      })
      const sections = (row as { sections: Array<Record<string, unknown>> }).sections
      expect(sections.map((section) => section.sectionId)).toEqual([
        'identity',
        'literature-search',
      ])
      expect(sections[1]).toMatchObject({
        state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
        basisKind: 'PUBMED_SEARCH_RECORD',
        counts: { searchHits: 3, qualifying: 0 },
      })
      expect(sections[1]!.sourceRefs).toEqual([
        {
          kind: 'PUBMED_SEARCH',
          identifier: 'completion-surfaces-2026-09-01',
          retrievedAt: '2026-09-01',
        },
      ])
    })

    it('carries both answers on the medicine row a reader downloads', () => {
      // The published medicine record identifies itself by `id` and `url`; the slug is the id.
      const rows = rowsOf('data/drugs/drugs-001.ndjson')
      const canonical = rows.find((row) => row.id === CANONICAL_ID)
      expect(canonical?.url).toBe(`https://rnawiki.com/d/${CANONICAL_SLUG}`)
      expect(canonical?.inventoryResolution).toEqual({
        resolutionStatus: 'CANONICAL_ENTITY',
        entityClass: 'APPROVED_MEDICINE',
        canonicalSlug: CANONICAL_SLUG,
        redirectTargetSlug: null,
        identityConfidence: 'REGISTRY_IDENTIFIER_RECORDED',
        identifierSharedWithOtherRecords: true,
        resolverVersion: 'inventory-resolution/v1',
      })
      // The medicine row carries a summary, not the assessment: one state per applicable section,
      // and no basis sentence or source ref. Those are published in full in the completion shards,
      // keyed by the same slug, and restating them on every medicine row more than doubled the
      // medicine corpus.
      const completion = canonical?.dossierCompletion as Record<string, unknown>
      expect(completion).toEqual({
        status: 'COMPLETE',
        contentChangedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/u),
        resolverVersion: 'dossier-completion/v1',
        applicableSectionCount: 2,
        terminalSectionCount: 2,
        sectionStates: {
          identity: 'EXACT_STRUCTURED_SOURCE_DATA',
          'literature-search': 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
        },
      })
      const shardRow = rowsOf(COMPLETION_SHARD).find((row) => row.slug === CANONICAL_SLUG)
      expect(JSON.stringify(shardRow)).toContain('A dated search returned no report')
      expect(JSON.stringify(completion)).not.toContain('A dated search returned no report')

      // A record that resolves elsewhere is still published, carrying the address it resolves to,
      // so a reader holding the old identifier can follow it.
      const duplicate = rows.find((row) => row.id === DUPLICATE_ID)
      expect(duplicate?.inventoryResolution).toMatchObject({
        resolutionStatus: 'DUPLICATE_OF_CANONICAL_ENTITY',
        redirectTargetSlug: CANONICAL_SLUG,
      })
      expect(duplicate?.dossierCompletion).toBeUndefined()
    })

    it('declares identity and completion counts that match the published rows', () => {
      const identityRows = rowsOf('data/inventory-resolution.ndjson')
      const completionRows = rowsOf(COMPLETION_SHARD)
      const withStatus = (status: string) =>
        identityRows.filter((row) => row.resolutionStatus === status).length

      expect(manifest.counts.canonicalEntities).toBe(withStatus('CANONICAL_ENTITY'))
      expect(manifest.counts.redirectedIdentities).toBe(withStatus('DUPLICATE_OF_CANONICAL_ENTITY'))
      expect(manifest.counts.goneIdentities).toBe(withStatus('INVALID_IDENTITY_GONE'))
      expect(manifest.counts.completeDossiers).toBe(
        completionRows.filter((row) => row.status === 'COMPLETE').length,
      )
      expect(manifest.counts.incompleteDossiers).toBe(
        completionRows.filter((row) => row.status === 'INCOMPLETE').length,
      )
      const accounted = ['canonicalEntities', 'redirectedIdentities', 'goneIdentities'].reduce(
        (total, key) => total + (manifest.counts[key] ?? 0),
        0,
      )
      expect(accounted).toBe(identityRows.length)
      expect(artifact('data/inventory-resolution.ndjson').rows).toBe(identityRows.length)
    })
  },
)
