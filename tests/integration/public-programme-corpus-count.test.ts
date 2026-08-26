import { randomUUID } from 'node:crypto'

import { inArray } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { db } from '@/db'
import { developmentProgrammes, drugs, medicineSlugRedirects } from '@/db/schema'
import { countProgrammeEvidence } from '@/lib/queries/drugs'

const runsInDisposableDatabase = process.env.E2E_DISPOSABLE_DATABASE === '1'

describe.skipIf(!runsInDisposableDatabase)('public programme corpus counts', () => {
  it('excludes a programme attached to a retained redirect-source identity', async () => {
    const suffix = randomUUID().replaceAll('-', '').slice(0, 12)
    const oldDrugId = `drg_count_${suffix}_old`
    const targetDrugId = `drg_count_${suffix}_target`
    const oldSlug = `count-old-${suffix}`
    const targetSlug = `count-target-${suffix}`
    const oldProgrammeId = `prg_count_${suffix}_old`
    const targetProgrammeId = `prg_count_${suffix}_target`
    const before = await countProgrammeEvidence()

    try {
      await db.insert(drugs).values([
        {
          id: oldDrugId,
          slug: oldSlug,
          name: `Retained programme-count medicine ${suffix}`,
          modality: 'Small Molecule',
          approvalStatus: 'Pre-clinical / Open Source',
        },
        {
          id: targetDrugId,
          slug: targetSlug,
          name: `Canonical programme-count medicine ${suffix}`,
          modality: 'Small Molecule',
          approvalStatus: 'Pre-clinical / Open Source',
        },
      ])
      await db.insert(developmentProgrammes).values([
        {
          id: oldProgrammeId,
          drugId: oldDrugId,
          slug: `old-use-${suffix}`,
          title: 'Use attached to the retained redirect source',
        },
        {
          id: targetProgrammeId,
          drugId: targetDrugId,
          slug: `target-use-${suffix}`,
          title: 'Use attached to the canonical medicine',
        },
      ])
      await db.insert(medicineSlugRedirects).values({
        oldSlug,
        targetDrugId,
        reason: 'MERGED',
        rationale: 'Owner-verified corpus-count fixture.',
      })

      await expect(countProgrammeEvidence()).resolves.toEqual({
        programmes: before.programmes + 1,
        reviewedProgrammes: before.reviewedProgrammes,
      })
    } finally {
      await db
        .delete(medicineSlugRedirects)
        .where(inArray(medicineSlugRedirects.oldSlug, [oldSlug]))
      await db.delete(drugs).where(inArray(drugs.id, [oldDrugId, targetDrugId]))
    }
  })
})
