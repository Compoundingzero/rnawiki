import { randomUUID } from 'node:crypto'

import { eq, inArray, sql } from 'drizzle-orm'
import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { GET as resolveLegacyRecordGet } from '@/app/r/[slug]/route'
import { db } from '@/db'
import { drugAliases, drugs, medicineSlugRedirects } from '@/db/schema'
import {
  countDrugs,
  getFeaturedDrug,
  getPopularDrugs,
  listDrugs,
  resolvePublicMedicineRoute,
  searchDrugs,
} from '@/lib/queries/drugs'

const runsInDisposableDatabase = process.env.E2E_DISPOSABLE_DATABASE === '1'

describe.skipIf(!runsInDisposableDatabase)('owner-curated canonical medicine slug history', () => {
  it('starts empty, prefers an explicit retained-row mapping, and rejects redirect chains', async () => {
    const suffix = randomUUID().replaceAll('-', '').slice(0, 12)
    const oldDrugId = `drg_history_${suffix}_old`
    const targetDrugId = `drg_history_${suffix}_target`
    const nextTargetDrugId = `drg_history_${suffix}_next`
    const oldSlug = `history-old-${suffix}`
    const targetSlug = `history-target-${suffix}`
    const nextTargetSlug = `history-next-${suffix}`
    const oldName = `Retained historical medicine ${suffix}`
    const targetName = `Canonical medicine ${suffix}`
    const oldAlias = `History alias ${suffix}`
    const oldAliasSlug = oldAlias.toLowerCase().replaceAll(' ', '-')
    const drugIds = [oldDrugId, targetDrugId, nextTargetDrugId]
    const redirectSlugs = [oldSlug, targetSlug]

    try {
      const initialLedger = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(medicineSlugRedirects)
      expect(initialLedger[0]?.count).toBe(0)

      await db.insert(drugs).values([
        {
          id: oldDrugId,
          slug: oldSlug,
          name: oldName,
          modality: 'Small Molecule',
          approvalStatus: 'Pre-clinical / Open Source',
          dossierDepth: 'flagship',
          viewCount: 2_147_483_647,
        },
        {
          id: targetDrugId,
          slug: targetSlug,
          name: targetName,
          modality: 'Small Molecule',
          approvalStatus: 'Pre-clinical / Open Source',
          dossierDepth: 'flagship',
          viewCount: 2_147_483_646,
        },
        {
          id: nextTargetDrugId,
          slug: nextTargetSlug,
          name: `Chain target medicine ${suffix}`,
          modality: 'Small Molecule',
          approvalStatus: 'Pre-clinical / Open Source',
        },
      ])

      const identities = await db
        .select({ id: drugs.id, slug: drugs.slug })
        .from(drugs)
        .where(inArray(drugs.id, drugIds))
      const targetIdentity = identities.find(({ id }) => id === targetDrugId)
      expect(targetIdentity).toEqual({ id: targetDrugId, slug: targetSlug })
      expect(targetIdentity?.id).not.toBe(targetIdentity?.slug)

      expect(await resolvePublicMedicineRoute(targetSlug)).toEqual({
        canonicalSlug: targetSlug,
        matchedBy: 'canonical',
      })

      await db.insert(medicineSlugRedirects).values({
        oldSlug,
        targetDrugId,
        reason: 'RENAMED',
        rationale: 'Owner-verified rename fixture; the retained row must not win URL resolution.',
      })
      await db.insert(drugAliases).values({
        id: `alias_${suffix}`,
        drugId: oldDrugId,
        alias: oldAlias,
        source: 'Owner-verified retained-row alias fixture.',
      })

      expect(await resolvePublicMedicineRoute(oldSlug)).toEqual({
        canonicalSlug: targetSlug,
        matchedBy: 'historical',
      })
      expect(await resolvePublicMedicineRoute(oldAliasSlug)).toEqual({
        canonicalSlug: targetSlug,
        matchedBy: 'alias',
      })

      vi.stubEnv('SITE_URL', 'https://rnawiki.com')
      try {
        const legacyRecordResponse = await resolveLegacyRecordGet(
          new NextRequest(`https://rnawiki.com/r/${oldSlug}?campaign=legacy`),
          { params: Promise.resolve({ slug: oldSlug }) },
        )
        expect(legacyRecordResponse.status).toBe(301)
        expect(legacyRecordResponse.headers.get('location')).toBe(
          `https://rnawiki.com/d/${targetSlug}`,
        )
      } finally {
        vi.unstubAllEnvs()
      }

      // The ledger remains authoritative if its target is later hidden. The retained old row and
      // its alias must not reappear as fallbacks, and the former /r URL must stop with a 410 rather
      // than redirecting to nonpublic content. Restore the target before the remaining assertions.
      await db.update(drugs).set({ name: 'Unknown' }).where(eq(drugs.id, targetDrugId))
      const unresolvedLog = vi.spyOn(console, 'info').mockImplementation(() => undefined)
      try {
        expect(await resolvePublicMedicineRoute(oldSlug)).toBeNull()
        expect(await resolvePublicMedicineRoute(oldAliasSlug)).toBeNull()
        expect(await resolvePublicMedicineRoute(targetSlug)).toBeNull()

        const hiddenTargetResponse = await resolveLegacyRecordGet(
          new NextRequest(`https://rnawiki.com/r/${oldSlug}?campaign=legacy`),
          { params: Promise.resolve({ slug: oldSlug }) },
        )
        expect(hiddenTargetResponse.status).toBe(410)
        expect(hiddenTargetResponse.headers.get('location')).toBeNull()
        expect(hiddenTargetResponse.headers.get('x-robots-tag')).toBe('noindex')
      } finally {
        unresolvedLog.mockRestore()
        await db.update(drugs).set({ name: targetName }).where(eq(drugs.id, targetDrugId))
      }

      expect(await resolvePublicMedicineRoute(oldSlug)).toEqual({
        canonicalSlug: targetSlug,
        matchedBy: 'historical',
      })
      expect(await resolvePublicMedicineRoute(oldAliasSlug)).toEqual({
        canonicalSlug: targetSlug,
        matchedBy: 'alias',
      })

      const browse = await listDrugs({ limit: 20, offset: 0, sort: 'popular' })
      const oldSearch = await searchDrugs(oldName, 20)
      const targetSearch = await searchDrugs(targetName, 20)
      const featured = await getFeaturedDrug()
      const popular = await getPopularDrugs(20)
      expect(browse.items[0]?.id).toBe(targetSlug)
      expect(browse.items.map((medicine) => medicine.id)).not.toContain(oldSlug)
      expect(oldSearch.map((medicine) => medicine.slug)).not.toContain(oldSlug)
      expect(targetSearch.map((medicine) => medicine.slug)).toContain(targetSlug)
      expect(featured?.id).toBe(targetSlug)
      expect(popular[0]?.slug).toBe(targetSlug)
      expect(popular.map((medicine) => medicine.slug)).not.toContain(oldSlug)
      await expect(countDrugs(eq(drugs.slug, oldSlug))).resolves.toBe(0)

      // Discovery suppression must not erase the owner-verified direct-route contract.
      expect(await resolvePublicMedicineRoute(oldSlug)).toEqual({
        canonicalSlug: targetSlug,
        matchedBy: 'historical',
      })

      await db.insert(medicineSlugRedirects).values({
        oldSlug: targetSlug,
        targetDrugId: nextTargetDrugId,
        reason: 'MERGED',
        rationale: 'Deliberate invalid chain fixture used to verify fail-closed route resolution.',
      })

      expect(await resolvePublicMedicineRoute(oldSlug)).toBeNull()
      expect(await resolvePublicMedicineRoute(oldAliasSlug)).toBeNull()
    } finally {
      await db
        .delete(medicineSlugRedirects)
        .where(inArray(medicineSlugRedirects.oldSlug, redirectSlugs))
      await db.delete(drugs).where(inArray(drugs.id, drugIds))
    }
  })
})
