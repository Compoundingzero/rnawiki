import { describe, expect, it } from 'vitest'

import {
  buildHomepageContributorSpotlight,
  utcPublicationWeek,
  type HomepageContributorImpactRow,
} from '@/lib/homepage-contributor-spotlight'

function impact(
  contributorId: string,
  handle: string,
  programmeId: string,
  publishedAt: string,
  overrides: Partial<HomepageContributorImpactRow> = {},
): HomepageContributorImpactRow {
  return {
    contributorId,
    handle,
    proposalKey: `proposal-${programmeId}`,
    programmeId,
    programmeSlug: `use-${programmeId}`,
    programmeTitle: `Use ${programmeId}`,
    medicineName: `Medicine ${programmeId}`,
    medicineSlug: `medicine-${programmeId}`,
    publishedAt: new Date(publishedAt),
    appearInWeeklySpotlight: null,
    showSocialLinksInSpotlight: null,
    socialLinks: [],
    ...overrides,
  }
}

describe('UTC publication week', () => {
  it('runs from Monday inclusive through the following Monday exclusive', () => {
    const week = utcPublicationWeek(new Date('2026-08-30T23:59:59.999Z'))
    expect(week.start.toISOString()).toBe('2026-08-24T00:00:00.000Z')
    expect(week.endExclusive.toISOString()).toBe('2026-08-31T00:00:00.000Z')
    expect(week.label).toBe('24–30 August 2026')

    const nextWeek = utcPublicationWeek(new Date('2026-08-31T00:00:00.000Z'))
    expect(nextWeek.start.toISOString()).toBe('2026-08-31T00:00:00.000Z')
    expect(nextWeek.label).toBe('31 August–6 September 2026')
  })
})

describe('homepage contributor spotlight ranking', () => {
  const week = utcPublicationWeek(new Date('2026-08-26T12:00:00.000Z'))

  it('counts distinct published lineages and applies count, earliest-publication and handle ties', () => {
    const rows = [
      impact('user-a', 'zeta-two', 'a1', '2026-08-26T08:00:00.000Z'),
      impact('user-a', 'zeta-two', 'a2', '2026-08-27T08:00:00.000Z'),
      impact('user-b', 'beta-one', 'b1', '2026-08-25T08:00:00.000Z'),
      impact('user-b', 'beta-one', 'b2', '2026-08-28T08:00:00.000Z'),
      // A duplicate join row for the same proposal lineage cannot inflate the count.
      impact('user-b', 'beta-one', 'b2', '2026-08-28T08:00:00.000Z'),
      impact('user-c', 'zulu-three', 'c1', '2026-08-24T10:00:00.000Z'),
      impact('user-d', 'alpha-three', 'd1', '2026-08-24T10:00:00.000Z'),
      // Explicit homepage opt-out, even with a larger count.
      impact('hidden', 'hidden-user', 'h1', '2026-08-24T01:00:00.000Z', {
        appearInWeeklySpotlight: false,
      }),
      impact('hidden', 'hidden-user', 'h2', '2026-08-24T02:00:00.000Z', {
        appearInWeeklySpotlight: false,
      }),
      impact('hidden', 'hidden-user', 'h3', '2026-08-24T03:00:00.000Z', {
        appearInWeeklySpotlight: false,
      }),
      // The exclusive next-Monday boundary belongs to the next list.
      impact('outside', 'outside-user', 'o1', '2026-08-31T00:00:00.000Z'),
    ]

    const result = buildHomepageContributorSpotlight(rows, week)

    expect(
      result.entries.map((entry) => [entry.rank, entry.handle, entry.publishedChangeCount]),
    ).toEqual([
      [1, 'beta-one', 2],
      [2, 'zeta-two', 2],
      [3, 'alpha-three', 1],
    ])
    expect(result.entries[0]?.publishedAnswers).toHaveLength(2)
    expect(result.entries[0]?.publishedAnswers[0]?.href).toBe('/d/medicine-b1?programme=use-b1')
  })

  it('shows canonical social profiles only after the account enables their display', () => {
    const hidden = buildHomepageContributorSpotlight(
      [
        impact('user-a', 'plain-handle', 'a1', '2026-08-26T08:00:00.000Z', {
          showSocialLinksInSpotlight: false,
          socialLinks: [{ platform: 'github', url: 'https://github.com/example-user' }],
        }),
      ],
      week,
    )
    expect(hidden.entries[0]?.socialLinks).toEqual([])

    const publicResult = buildHomepageContributorSpotlight(
      [
        impact('user-a', 'plain-handle', 'a1', '2026-08-26T08:00:00.000Z', {
          showSocialLinksInSpotlight: true,
          socialLinks: [
            { platform: 'x', url: 'https://twitter.com/example_user' },
            { platform: 'github', url: 'https://github.com.evil.test/example-user' },
          ],
        }),
      ],
      week,
    )
    expect(publicResult.entries[0]?.socialLinks).toEqual([
      { platform: 'x', url: 'https://x.com/example_user' },
    ])
  })
})
