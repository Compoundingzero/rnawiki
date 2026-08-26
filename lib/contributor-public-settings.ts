import { z } from 'zod'

export const PUBLIC_SOCIAL_PLATFORMS = ['x', 'linkedin', 'github', 'bluesky'] as const

export type PublicSocialPlatform = (typeof PUBLIC_SOCIAL_PLATFORMS)[number]

export interface PublicSocialLink {
  platform: PublicSocialPlatform
  url: string
}

export interface ContributorPublicSettings {
  appearInWeeklySpotlight: boolean
  showSocialLinksInSpotlight: boolean
  socialLinks: PublicSocialLink[]
}

export const PUBLIC_SOCIAL_PLATFORM_LABEL: Record<PublicSocialPlatform, string> = {
  x: 'X',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  bluesky: 'Bluesky',
}

export const DEFAULT_CONTRIBUTOR_PUBLIC_SETTINGS: ContributorPublicSettings = {
  appearInWeeklySpotlight: true,
  showSocialLinksInSpotlight: false,
  socialLinks: [],
}

const X_RESERVED_PATHS = new Set([
  'compose',
  'explore',
  'home',
  'i',
  'intent',
  'messages',
  'search',
  'settings',
  'share',
])

const GITHUB_RESERVED_PATHS = new Set([
  'about',
  'collections',
  'events',
  'features',
  'join',
  'login',
  'marketplace',
  'organizations',
  'orgs',
  'pricing',
  'security',
  'settings',
  'site',
  'sponsors',
  'topics',
])

function safeProfileUrl(value: string): URL | null {
  let parsed: URL
  try {
    parsed = new URL(value.trim())
  } catch {
    return null
  }

  if (
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    parsed.search ||
    parsed.hash
  ) {
    return null
  }
  return parsed
}

function plainPathParts(url: URL): string[] | null {
  const parts = url.pathname.split('/').filter(Boolean)
  return parts.some((part) => part.includes('%')) ? null : parts
}

/**
 * Accept one profile URL only when the platform, host and profile-path shape agree, then return a
 * stable canonical URL. This prevents a user-supplied link labelled "GitHub" from pointing to an
 * unrelated host or to a sign-in/share endpoint on the right host.
 */
export function canonicalPublicSocialProfileUrl(
  platform: PublicSocialPlatform,
  value: string,
): string | null {
  const url = safeProfileUrl(value)
  if (!url) return null

  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  const parts = plainPathParts(url)
  if (!parts) return null

  if (platform === 'x') {
    if (host !== 'x.com' && host !== 'twitter.com') return null
    const handle = parts.length === 1 ? parts[0] : undefined
    if (!handle || !/^[A-Za-z0-9_]{1,15}$/.test(handle)) return null
    if (X_RESERVED_PATHS.has(handle.toLowerCase())) return null
    return `https://x.com/${handle}`
  }

  if (platform === 'linkedin') {
    if (host !== 'linkedin.com') return null
    const slug = parts.length === 2 && parts[0]?.toLowerCase() === 'in' ? parts[1] : undefined
    if (!slug || !/^[A-Za-z0-9-]{3,100}$/.test(slug)) return null
    return `https://www.linkedin.com/in/${slug}`
  }

  if (platform === 'github') {
    if (host !== 'github.com') return null
    const handle = parts.length === 1 ? parts[0] : undefined
    if (
      !handle ||
      !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(handle) ||
      GITHUB_RESERVED_PATHS.has(handle.toLowerCase())
    ) {
      return null
    }
    return `https://github.com/${handle}`
  }

  if (host !== 'bsky.app') return null
  const identifier =
    parts.length === 2 && parts[0]?.toLowerCase() === 'profile' ? parts[1] : undefined
  if (
    !identifier ||
    !/^[A-Za-z0-9:._-]{3,253}$/.test(identifier) ||
    (!identifier.includes('.') && !identifier.toLowerCase().startsWith('did:'))
  ) {
    return null
  }
  return `https://bsky.app/profile/${identifier.toLowerCase()}`
}

const rawSocialLinkSchema = z
  .object({
    platform: z.enum(PUBLIC_SOCIAL_PLATFORMS),
    url: z.string().trim().min(1).max(500),
  })
  .strict()

export const contributorPublicSettingsUpdateSchema = z
  .object({
    appearInWeeklySpotlight: z.boolean(),
    showSocialLinksInSpotlight: z.boolean(),
    socialLinks: z.array(rawSocialLinkSchema).max(PUBLIC_SOCIAL_PLATFORMS.length),
  })
  .strict()
  .superRefine((value, context) => {
    const seen = new Set<PublicSocialPlatform>()
    value.socialLinks.forEach((link, index) => {
      if (seen.has(link.platform)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['socialLinks', index, 'platform'],
          message: 'Include at most one profile for each social platform.',
        })
      }
      seen.add(link.platform)

      if (!canonicalPublicSocialProfileUrl(link.platform, link.url)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['socialLinks', index, 'url'],
          message: `Enter a public ${PUBLIC_SOCIAL_PLATFORM_LABEL[link.platform]} profile URL.`,
        })
      }
    })

    if (value.showSocialLinksInSpotlight && value.socialLinks.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['showSocialLinksInSpotlight'],
        message: 'Add at least one social profile before making social links public.',
      })
    }
  })
  .transform((value): ContributorPublicSettings => ({
    appearInWeeklySpotlight: value.appearInWeeklySpotlight,
    showSocialLinksInSpotlight: value.showSocialLinksInSpotlight,
    socialLinks: value.socialLinks.flatMap((link) => {
      const url = canonicalPublicSocialProfileUrl(link.platform, link.url)
      return url ? [{ platform: link.platform, url }] : []
    }),
  }))

/**
 * Defensive public-read parser. The self-service write route stores only canonical entries, but a
 * direct database write must not be able to turn malformed JSON into a homepage link.
 */
export function safePublicSocialLinks(value: unknown): PublicSocialLink[] {
  if (!Array.isArray(value) || value.length > PUBLIC_SOCIAL_PLATFORMS.length) return []

  const links: PublicSocialLink[] = []
  const seen = new Set<PublicSocialPlatform>()
  for (const candidate of value) {
    const parsed = rawSocialLinkSchema.safeParse(candidate)
    if (!parsed.success || seen.has(parsed.data.platform)) continue
    const url = canonicalPublicSocialProfileUrl(parsed.data.platform, parsed.data.url)
    if (!url) continue
    seen.add(parsed.data.platform)
    links.push({ platform: parsed.data.platform, url })
  }
  return links
}
