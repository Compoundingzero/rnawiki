import { beforeEach, describe, expect, it, vi } from 'vitest'

const { projections } = vi.hoisted(() => ({ projections: new Map<string, unknown>() }))

vi.mock('@/lib/queries/public-medicine-projection', () => ({
  getPublicMedicineProjections: vi.fn(async () => projections),
}))

import { bindPublicSearchSummaries } from '@/lib/queries/public-search-hit-projection'

const baseHit = {
  slug: 'medicine-a',
  patientFriendlyIndication: 'Older medicine-wide indication',
}

describe('public search summary binding', () => {
  beforeEach(() => projections.clear())

  it('uses the exact published programme summary and carries its revision binding', async () => {
    projections.set('medicine-a', {
      cardSummary: {
        kind: 'reviewed_programme',
        text: 'Reviewed answer for this use.',
        programmeTitle: 'Programme A',
        binding: {
          type: 'programme_publication',
          medicineSlug: 'medicine-a',
          programmeId: 'programme-a',
          programmeSlug: 'programme-a',
          verdictRevisionId: 'verdict-a',
          revisionNumber: 2,
          inputDigestAlgorithm: 'sha256',
          inputDigest: 'a'.repeat(64),
        },
      },
    })

    await expect(bindPublicSearchSummaries([baseHit])).resolves.toEqual([
      {
        ...baseHit,
        patientFriendlyIndication: 'Reviewed answer for this use.',
        summaryBinding: {
          type: 'programme_publication',
          programmeSlug: 'programme-a',
          programmeTitle: 'Programme A',
          verdictRevisionId: 'verdict-a',
          inputDigest: 'a'.repeat(64),
        },
        summaryContext: 'Reviewed answer for: Programme A',
      },
    ])
  })

  it('uses a source-identified programme indication without borrowing a legacy conclusion', async () => {
    projections.set('medicine-a', {
      cardSummary: {
        kind: 'programme_indication',
        text: 'Registered use A',
        programmeTitle: 'Programme A',
        binding: {
          type: 'programme',
          medicineSlug: 'medicine-a',
          programmeId: 'programme-a',
          programmeSlug: 'programme-a',
        },
      },
    })

    await expect(bindPublicSearchSummaries([baseHit])).resolves.toEqual([
      {
        ...baseHit,
        patientFriendlyIndication: 'Registered use A',
        summaryBinding: {
          type: 'programme',
          programmeSlug: 'programme-a',
          programmeTitle: 'Programme A',
        },
        summaryContext: 'Specific use: Programme A',
      },
    ])
  })

  it('keeps the identity-layer indication only when no programme summary exists', async () => {
    projections.set('medicine-a', {
      cardSummary: {
        kind: 'medicine_indication',
        text: 'Older medicine-wide indication',
        binding: { type: 'medicine_identity', medicineSlug: 'medicine-a' },
      },
    })

    await expect(bindPublicSearchSummaries([baseHit])).resolves.toEqual([
      {
        ...baseHit,
        summaryBinding: { type: 'medicine_identity' },
        summaryContext: 'Use listed on the medicine record',
      },
    ])
  })

  it('uses an explicit identity fallback when no projection row exists', async () => {
    await expect(bindPublicSearchSummaries([baseHit])).resolves.toEqual([
      {
        ...baseHit,
        summaryBinding: { type: 'medicine_identity' },
        summaryContext: null,
      },
    ])
  })
})
