import { safePublicSocialLinks, type PublicSocialLink } from './contributor-public-settings'

const DAY_MS = 24 * 60 * 60 * 1000
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export interface UtcPublicationWeek {
  start: Date
  endExclusive: Date
  /** Human-readable Monday-through-Sunday dates. All boundaries are UTC. */
  label: string
}

export interface HomepageContributorImpactRow {
  contributorId: string
  handle: string
  proposalKey: string
  programmeId: string
  programmeSlug: string
  programmeTitle: string
  medicineName: string
  medicineSlug: string
  publishedAt: Date
  appearInWeeklySpotlight: boolean | null
  showSocialLinksInSpotlight: boolean | null
  socialLinks: unknown
}

export interface HomepageContributorPublishedAnswer {
  medicineName: string
  programmeTitle: string
  href: string
  publishedAt: string
}

export interface HomepageContributorSpotlightEntry {
  rank: 1 | 2 | 3
  handle: string
  profileHref: string
  publishedChangeCount: number
  firstPublishedAt: string
  publishedAnswers: HomepageContributorPublishedAnswer[]
  socialLinks: PublicSocialLink[]
}

export interface HomepageContributorSpotlightView {
  week: {
    start: string
    endExclusive: string
    label: string
  }
  entries: HomepageContributorSpotlightEntry[]
}

function weekLabel(start: Date, endExclusive: Date): string {
  const sunday = new Date(endExclusive.getTime() - DAY_MS)
  const startDay = start.getUTCDate()
  const endDay = sunday.getUTCDate()
  const startMonth = MONTHS[start.getUTCMonth()]
  const endMonth = MONTHS[sunday.getUTCMonth()]
  const startYear = start.getUTCFullYear()
  const endYear = sunday.getUTCFullYear()

  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay}–${endDay} ${startMonth} ${startYear}`
  }
  if (startYear === endYear) {
    return `${startDay} ${startMonth}–${endDay} ${endMonth} ${startYear}`
  }
  return `${startDay} ${startMonth} ${startYear}–${endDay} ${endMonth} ${endYear}`
}

/** The UTC Monday containing `instant`, through the following Monday (exclusive). */
export function utcPublicationWeek(instant: Date = new Date()): UtcPublicationWeek {
  if (Number.isNaN(instant.getTime())) throw new RangeError('A valid date is required.')

  const start = new Date(
    Date.UTC(instant.getUTCFullYear(), instant.getUTCMonth(), instant.getUTCDate()),
  )
  const daysSinceMonday = (start.getUTCDay() + 6) % 7
  start.setUTCDate(start.getUTCDate() - daysSinceMonday)
  const endExclusive = new Date(start.getTime() + 7 * DAY_MS)

  return { start, endExclusive, label: weekLabel(start, endExclusive) }
}

function compareText(left: string, right: string): number {
  const a = left.toLowerCase()
  const b = right.toLowerCase()
  if (a < b) return -1
  if (a > b) return 1
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

function programmeHref(row: HomepageContributorImpactRow): string {
  return `/d/${encodeURIComponent(row.medicineSlug)}?programme=${encodeURIComponent(row.programmeSlug)}`
}

/**
 * Aggregate publication-bound contribution rows into the deterministic weekly top three.
 *
 * One change is one accepted proposal lineage implemented into one current programme publication.
 * Duplicate join rows cannot increase the count. Equal counts use the earliest qualifying
 * publication, then the handle, so database row order never decides who appears.
 */
export function buildHomepageContributorSpotlight(
  rows: HomepageContributorImpactRow[],
  week: UtcPublicationWeek,
): HomepageContributorSpotlightView {
  const contributors = new Map<
    string,
    {
      handle: string
      firstPublishedAt: Date
      impacts: Map<string, HomepageContributorPublishedAnswer>
      socialLinks: PublicSocialLink[]
    }
  >()

  for (const row of rows) {
    if (
      row.appearInWeeklySpotlight === false ||
      row.publishedAt < week.start ||
      row.publishedAt >= week.endExclusive
    ) {
      continue
    }

    const impactKey = `${row.programmeId}\u0000${row.proposalKey}`
    let contributor = contributors.get(row.contributorId)
    if (!contributor) {
      contributor = {
        handle: row.handle,
        firstPublishedAt: row.publishedAt,
        impacts: new Map(),
        socialLinks:
          row.showSocialLinksInSpotlight === true ? safePublicSocialLinks(row.socialLinks) : [],
      }
      contributors.set(row.contributorId, contributor)
    }

    if (row.publishedAt < contributor.firstPublishedAt) {
      contributor.firstPublishedAt = row.publishedAt
    }
    if (!contributor.impacts.has(impactKey)) {
      contributor.impacts.set(impactKey, {
        medicineName: row.medicineName,
        programmeTitle: row.programmeTitle,
        href: programmeHref(row),
        publishedAt: row.publishedAt.toISOString(),
      })
    }
  }

  const ranked = [...contributors.values()]
    .filter((contributor) => contributor.impacts.size > 0)
    .sort((left, right) => {
      const count = right.impacts.size - left.impacts.size
      if (count !== 0) return count
      const firstPublication = left.firstPublishedAt.getTime() - right.firstPublishedAt.getTime()
      if (firstPublication !== 0) return firstPublication
      return compareText(left.handle, right.handle)
    })
    .slice(0, 3)

  return {
    week: {
      start: week.start.toISOString(),
      endExclusive: week.endExclusive.toISOString(),
      label: week.label,
    },
    entries: ranked.map((contributor, index) => ({
      rank: (index + 1) as 1 | 2 | 3,
      handle: contributor.handle,
      profileHref: `/u/${encodeURIComponent(contributor.handle)}`,
      publishedChangeCount: contributor.impacts.size,
      firstPublishedAt: contributor.firstPublishedAt.toISOString(),
      publishedAnswers: [...contributor.impacts.values()].sort((left, right) => {
        const date = Date.parse(left.publishedAt) - Date.parse(right.publishedAt)
        if (date !== 0) return date
        const medicine = compareText(left.medicineName, right.medicineName)
        return medicine !== 0 ? medicine : compareText(left.programmeTitle, right.programmeTitle)
      }),
      socialLinks: contributor.socialLinks,
    })),
  }
}
