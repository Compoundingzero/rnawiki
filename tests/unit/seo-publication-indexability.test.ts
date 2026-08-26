import { describe, expect, it } from 'vitest'

import {
  buildLegacyFlagshipIndexabilityReports,
  buildMedicinePublicationIndexabilityReports,
  type CurrentPublicationIndexingRow,
  type MedicineIdentityIndexingRow,
  type ProgrammeFreshnessIndexingRow,
} from '@/lib/seo/publication-indexability'
import { SEED_DOSSIERS } from '@/scripts/seed-data'
import type { SeedDossier } from '@/lib/seed-types'
import type { DrugDossier } from '@/lib/types'

function runtimeSeedDossier(seed: SeedDossier): DrugDossier {
  return {
    ...seed,
    id: seed.slug,
    molecularSchema: undefined,
    dossierDepth: 'flagship',
    sourceProvenance: seed.sources.map((source) =>
      `${source.label} (${source.identifier})`.slice(0, 300),
    ),
    auditPointsCount: {
      measured: seed.keyAudits.filter((audit) => audit.category === 'measured').length,
      inferred: seed.keyAudits.filter((audit) => audit.category === 'inferred').length,
      failed: seed.keyAudits.filter((audit) => audit.category === 'failed').length,
      conclusionShift: seed.keyAudits.filter((audit) => audit.category === 'conclusion_shift')
        .length,
    },
  }
}

const evaluatedAt = new Date('2026-08-25T00:00:00.000Z')

const medicine: MedicineIdentityIndexingRow = {
  medicineId: 'internal-medicine-42',
  medicineName: 'Example medicine',
  canonicalSlug: 'example-medicine',
  isRedirectSource: false,
}

function publication(
  patch: Partial<CurrentPublicationIndexingRow> = {},
): CurrentPublicationIndexingRow {
  return {
    medicineId: medicine.medicineId,
    programmeId: 'programme-current',
    programmeTitle: 'Current programme',
    reviewStatus: 'PUBLISHED',
    publishedAt: new Date('2026-08-20T00:00:00.000Z'),
    reviewedAt: new Date('2026-08-19T00:00:00.000Z'),
    publicLabel: 'Reviewed conclusion',
    plainMechanism: 'Plain-language mechanism.',
    bestSupportedFinding: 'Best-supported finding.',
    mainLimitation: 'Main limitation.',
    sourceCount: 2,
    independentReviewCount: 2,
    ...patch,
  }
}

function freshness(
  programmeId: string,
  patch: Partial<ProgrammeFreshnessIndexingRow> = {},
): ProgrammeFreshnessIndexingRow {
  return {
    programmeId,
    freshnessStatus: 'CURRENT',
    nextCheckDueAt: new Date('2026-09-01T00:00:00.000Z'),
    ...patch,
  }
}

describe('shared current-publication indexability projection', () => {
  it('constructs the public decision from canonical slug even when the internal id differs', () => {
    const reports = buildMedicinePublicationIndexabilityReports(
      [medicine],
      [publication()],
      [freshness('programme-current')],
      evaluatedAt,
    )

    expect(reports).toHaveLength(1)
    expect(reports[0]).toMatchObject({
      medicineId: 'internal-medicine-42',
      canonicalSlug: 'example-medicine',
      selectedProgrammeId: 'programme-current',
      freshness: 'current',
      decision: {
        index: true,
        canonicalSlug: 'example-medicine',
        lastPublicContentUpdate: new Date('2026-08-20T00:00:00.000Z'),
      },
    })
  })

  it('uses the newest published programme even when an older programme remains eligible', () => {
    const older = publication({
      programmeId: 'programme-older',
      programmeTitle: 'Older programme',
      publishedAt: new Date('2026-07-01T00:00:00.000Z'),
    })
    const newer = publication({
      programmeId: 'programme-newer',
      programmeTitle: 'Newer programme',
      publishedAt: new Date('2026-08-24T00:00:00.000Z'),
    })
    const [report] = buildMedicinePublicationIndexabilityReports(
      [medicine],
      [older, newer],
      [
        freshness('programme-older'),
        freshness('programme-newer', {
          nextCheckDueAt: new Date('2026-08-24T23:59:59.000Z'),
        }),
      ],
      evaluatedAt,
    )

    expect(report?.selectedProgrammeId).toBe('programme-newer')
    expect(report?.freshness).toBe('stale')
    expect(report?.decision).toMatchObject({
      index: false,
      reason: 'public_content_not_current',
    })
  })

  it('fails closed when a publication has zero monitoring rows', () => {
    const [report] = buildMedicinePublicationIndexabilityReports(
      [medicine],
      [publication()],
      [],
      evaluatedAt,
    )

    expect(report?.freshness).toBe('unknown')
    expect(report?.issues.map((issue) => issue.code)).toContain('public_content_not_current')
    expect(report?.decision.index).toBe(false)
  })

  it('reports identity-only medicines instead of silently dropping them from editor diagnostics', () => {
    const [report] = buildMedicinePublicationIndexabilityReports([medicine], [], [], evaluatedAt)

    expect(report).toMatchObject({
      selectedProgrammeId: null,
      freshness: 'unknown',
      decision: { index: false, reason: 'no_current_publication' },
    })
  })

  it('excludes a retained historical row without hiding its canonical target', () => {
    const retained = { ...medicine, isRedirectSource: true }
    const target = {
      ...medicine,
      medicineId: 'internal-target-43',
      medicineName: 'Canonical target',
      canonicalSlug: 'canonical-target',
    }
    const reports = buildMedicinePublicationIndexabilityReports(
      [retained, target],
      [
        publication(),
        publication({
          medicineId: target.medicineId,
          programmeId: 'programme-target',
          programmeTitle: 'Target programme',
        }),
      ],
      [freshness('programme-current'), freshness('programme-target')],
      evaluatedAt,
    )

    expect(
      reports.find((report) => report.medicineId === retained.medicineId)?.decision,
    ).toMatchObject({
      index: false,
      reason: 'canonical_identity_redirected',
    })
    expect(reports.find((report) => report.medicineId === target.medicineId)?.decision.index).toBe(
      true,
    )
  })
})

describe('provenance-bound flagship legacy projection', () => {
  const flagshipSeed = SEED_DOSSIERS.find((dossier) => dossier.slug === 'caffeine')
  if (!flagshipSeed) throw new Error('Expected the caffeine flagship fixture.')
  const flagship = runtimeSeedDossier(flagshipSeed)

  it('admits the exact bound flagship but not a thin imported variant', () => {
    const reports = buildLegacyFlagshipIndexabilityReports([
      {
        medicineId: 'internal-caffeine',
        drug: flagship,
        isRedirectSource: false,
        hasAnyProgramme: false,
      },
      {
        medicineId: 'internal-thin-import',
        drug: {
          ...flagship,
          id: 'thin-import',
          name: 'Thin import',
          dossierDepth: 'stub',
        },
        isRedirectSource: false,
        hasAnyProgramme: false,
      },
    ])

    expect(reports.find((report) => report.canonicalSlug === 'caffeine')?.decision).toMatchObject({
      index: true,
      reason: 'indexable_provenance_bound_legacy_flagship',
      lastPublicContentUpdate: new Date('2026-08-01T00:00:00.000Z'),
    })
    expect(reports.find((report) => report.canonicalSlug === 'caffeine')?.medicineId).toBe(
      'internal-caffeine',
    )
    expect(
      reports.find((report) => report.canonicalSlug === 'thin-import')?.decision,
    ).toMatchObject({
      index: false,
      reason: 'legacy_dossier_not_flagship',
    })
  })

  it('never falls back to legacy indexing once the canonical route has a programme', () => {
    const [report] = buildLegacyFlagshipIndexabilityReports([
      {
        medicineId: 'internal-caffeine',
        drug: flagship,
        isRedirectSource: false,
        hasAnyProgramme: true,
      },
    ])

    expect(report?.decision).toMatchObject({ index: false, reason: 'legacy_record_not_active' })
  })
})
