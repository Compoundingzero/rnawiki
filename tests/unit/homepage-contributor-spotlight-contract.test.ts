import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(file: string): string {
  return readFileSync(join(process.cwd(), file), 'utf8')
}

describe('homepage contributor spotlight contract', () => {
  it('uses only accepted, implemented, current published programme changes', () => {
    const query = source('lib/queries/homepage-contributor-spotlight.ts')

    expect(query).toContain('programmeContributionImplementations')
    expect(query).toContain('programmeCurrentPublications')
    expect(query).toContain('programmeVerdictScopeSnapshots')
    expect(query).toContain('programmeCurrentPublications.publishedAt')
    expect(query).toContain('programmeVerdictRevisions.publishedAt')
    expect(query).toContain(
      "eq(programmeContributionReviewStates.status, 'ACCEPTED_FOR_IMPLEMENTATION')",
    )
    expect(query).toContain("eq(programmeVerdictRevisions.reviewStatus, 'PUBLISHED')")
    expect(query).toContain('gte(programmeVerdictRevisions.publishedAt, week.start)')
    expect(query).toContain('lt(programmeVerdictRevisions.publishedAt, week.endExclusive)')

    expect(query).not.toContain('communityNotes')
    expect(query).not.toContain('acceptedEditCount')
    expect(query).not.toContain('programmeContributionReviews')
  })

  it('takes the use label and link slug from the immutable publication snapshot', () => {
    const query = source('lib/queries/homepage-contributor-spotlight.ts')

    expect(query).toContain('programmeSlug: programmeVerdictScopeSnapshots.slug')
    expect(query).toContain('programmeTitle: programmeVerdictScopeSnapshots.title')
    expect(query).not.toContain('developmentProgrammes.slug')
    expect(query).not.toContain('developmentProgrammes.title')
    // The snapshot is an inner join, so a publication without its signed scope fails closed.
    expect(query).toContain('.innerJoin(\n      programmeVerdictScopeSnapshots')
  })

  it('projects handles without names, credentials or prestige metadata', () => {
    const query = source('lib/queries/homepage-contributor-spotlight.ts')
    const component = source('components/home/HomepageContributorSpotlight.tsx')

    expect(query).toContain('handle: users.handle')
    expect(query).not.toContain('users.name')
    expect(query).not.toContain('users.orcid')
    expect(query).not.toContain('users.trustTier')
    expect(component).not.toMatch(/doctor|physician|certificate|doi|award|gold|silver|bronze/i)
    expect(component).toContain('Top contributors this week')
    expect(component).toContain('They do not measure medical expertise.')
    expect(component).toContain('@{entry.handle}')
    expect(component).toContain('publishedChangeLabel(entry.publishedChangeCount)')
  })

  it('labels account-supplied social links as unverified user-generated links', () => {
    const component = source('components/home/HomepageContributorSpotlight.tsx')
    const route = source('app/api/me/contributor-settings/route.ts')

    expect(component).toContain('rel="ugc nofollow noopener noreferrer"')
    expect(component).toContain('Social links supplied by this account')
    expect(component).toContain('ownership is not verified')
    expect(route).toContain('requireUser()')
    expect(route).not.toContain('requireAdmin')
  })
})
