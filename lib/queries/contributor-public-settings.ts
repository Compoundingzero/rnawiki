import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { contributorPublicSettings } from '@/db/schema'
import {
  DEFAULT_CONTRIBUTOR_PUBLIC_SETTINGS,
  safePublicSocialLinks,
  type ContributorPublicSettings,
} from '@/lib/contributor-public-settings'

function settingsView(row: {
  appearInWeeklySpotlight: boolean
  showSocialLinksInSpotlight: boolean
  socialLinks: unknown
}): ContributorPublicSettings {
  const socialLinks = safePublicSocialLinks(row.socialLinks)
  return {
    appearInWeeklySpotlight: row.appearInWeeklySpotlight,
    showSocialLinksInSpotlight: row.showSocialLinksInSpotlight && socialLinks.length > 0,
    socialLinks,
  }
}

/** The signed-in account's own settings. No email, name, title or credential is selected. */
export async function getContributorPublicSettings(
  userId: string,
): Promise<ContributorPublicSettings> {
  const rows = await db
    .select({
      appearInWeeklySpotlight: contributorPublicSettings.appearInWeeklySpotlight,
      showSocialLinksInSpotlight: contributorPublicSettings.showSocialLinksInSpotlight,
      socialLinks: contributorPublicSettings.socialLinks,
    })
    .from(contributorPublicSettings)
    .where(eq(contributorPublicSettings.userId, userId))
    .limit(1)

  return rows[0]
    ? settingsView(rows[0])
    : {
        ...DEFAULT_CONTRIBUTOR_PUBLIC_SETTINGS,
        socialLinks: [],
      }
}

/** Full replacement from the authenticated self-service route; no admin/public writer exists. */
export async function updateContributorPublicSettings(
  userId: string,
  input: ContributorPublicSettings,
): Promise<ContributorPublicSettings> {
  const rows = await db
    .insert(contributorPublicSettings)
    .values({
      userId,
      appearInWeeklySpotlight: input.appearInWeeklySpotlight,
      showSocialLinksInSpotlight: input.showSocialLinksInSpotlight,
      socialLinks: input.socialLinks,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: contributorPublicSettings.userId,
      set: {
        appearInWeeklySpotlight: input.appearInWeeklySpotlight,
        showSocialLinksInSpotlight: input.showSocialLinksInSpotlight,
        socialLinks: input.socialLinks,
        updatedAt: new Date(),
      },
    })
    .returning({
      appearInWeeklySpotlight: contributorPublicSettings.appearInWeeklySpotlight,
      showSocialLinksInSpotlight: contributorPublicSettings.showSocialLinksInSpotlight,
      socialLinks: contributorPublicSettings.socialLinks,
    })

  const row = rows[0]
  if (!row) throw new Error('Contributor public settings were not written.')
  return settingsView(row)
}
