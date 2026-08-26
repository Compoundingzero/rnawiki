import { describe, expect, it } from 'vitest'

import {
  canonicalPublicSocialProfileUrl,
  contributorPublicSettingsUpdateSchema,
  safePublicSocialLinks,
} from '@/lib/contributor-public-settings'

describe('contributor public social links', () => {
  it('accepts only allowlisted profile paths and stores canonical URLs', () => {
    expect(canonicalPublicSocialProfileUrl('x', 'https://twitter.com/RNAWiki')).toBe(
      'https://x.com/RNAWiki',
    )
    expect(
      canonicalPublicSocialProfileUrl('linkedin', 'https://linkedin.com/in/example-person/'),
    ).toBe('https://www.linkedin.com/in/example-person')
    expect(canonicalPublicSocialProfileUrl('github', 'https://www.github.com/example-user')).toBe(
      'https://github.com/example-user',
    )
    expect(
      canonicalPublicSocialProfileUrl('bluesky', 'https://bsky.app/profile/Example.Bsky.Social'),
    ).toBe('https://bsky.app/profile/example.bsky.social')
  })

  it('rejects misleading hosts, non-profile paths, tracking URLs and credentials', () => {
    expect(
      canonicalPublicSocialProfileUrl('github', 'https://github.com.evil.test/example'),
    ).toBeNull()
    expect(canonicalPublicSocialProfileUrl('x', 'https://x.com/intent/post')).toBeNull()
    expect(
      canonicalPublicSocialProfileUrl('linkedin', 'https://linkedin.com/company/example'),
    ).toBeNull()
    expect(
      canonicalPublicSocialProfileUrl('github', 'https://github.com/example?tab=stars'),
    ).toBeNull()
    expect(canonicalPublicSocialProfileUrl('x', 'https://user:pass@x.com/example')).toBeNull()
  })

  it('requires an explicit display opt-in and at most one profile per platform', () => {
    expect(() =>
      contributorPublicSettingsUpdateSchema.parse({
        appearInWeeklySpotlight: true,
        showSocialLinksInSpotlight: true,
        socialLinks: [],
      }),
    ).toThrow()

    expect(() =>
      contributorPublicSettingsUpdateSchema.parse({
        appearInWeeklySpotlight: true,
        showSocialLinksInSpotlight: true,
        socialLinks: [
          { platform: 'github', url: 'https://github.com/one-user' },
          { platform: 'github', url: 'https://github.com/another-user' },
        ],
      }),
    ).toThrow()

    expect(
      contributorPublicSettingsUpdateSchema.parse({
        appearInWeeklySpotlight: true,
        showSocialLinksInSpotlight: false,
        socialLinks: [{ platform: 'x', url: 'https://twitter.com/example_user' }],
      }),
    ).toEqual({
      appearInWeeklySpotlight: true,
      showSocialLinksInSpotlight: false,
      socialLinks: [{ platform: 'x', url: 'https://x.com/example_user' }],
    })
  })

  it('omits malformed database values from the public read', () => {
    expect(
      safePublicSocialLinks([
        { platform: 'github', url: 'https://github.com/valid-user' },
        { platform: 'github', url: 'https://github.com/duplicate-user' },
        { platform: 'x', url: 'https://evil.test/not-x' },
        { platform: 'linkedin', url: 'javascript:alert(1)' },
      ]),
    ).toEqual([{ platform: 'github', url: 'https://github.com/valid-user' }])
  })
})
