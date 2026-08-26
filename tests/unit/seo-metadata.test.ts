import { describe, expect, it } from 'vitest'

import { dossierMetadataDescription, dossierMetadataTitle, HOME_METADATA } from '@/lib/seo/metadata'

describe('safe SEO metadata builders', () => {
  it('expresses evidence intent and bounds long dossier titles', () => {
    const title = dossierMetadataTitle(
      'An exceptionally long medicine identity whose complete database name cannot fit in a useful search title',
    )

    expect(title.length).toBeLessThanOrEqual(64)
    expect(title).toContain('Evidence')
    expect(title).not.toContain('RNAWiki')
  })

  it('uses only the supplied visible reviewed answer fields', () => {
    const description = dossierMetadataDescription({
      name: 'Example medicine',
      reviewed: true,
      usedFor: 'Studied for one defined use and population',
      finding: 'The measured result was lower than with the comparison treatment',
      limitation: 'The study did not establish whether people felt better',
    })

    expect(description).toContain('Studied for one defined use and population')
    expect(description).toContain('measured result')
    expect(description).toContain('Main limitation')
    expect(description.length).toBeLessThanOrEqual(158)
  })

  it('does not promote an unreviewed record as a clinical conclusion', () => {
    const description = dossierMetadataDescription({
      name: 'Example medicine',
      reviewed: false,
      finding: 'Unreviewed legacy claim that must be ignored',
    })

    expect(description).toContain('No reviewed conclusion')
    expect(description).not.toContain('Unreviewed legacy claim')
  })

  it('uses a visible flagship legacy answer only when the route confirms its provenance binding', () => {
    const description = dossierMetadataDescription({
      name: 'Example medicine',
      reviewed: false,
      provenanceBoundLegacy: true,
      usedFor: 'Used for one recorded purpose',
      finding: 'The exact bound answer reports one measured result',
      limitation: 'The main unanswered question remains recorded',
    })

    expect(description).toContain('Used for one recorded purpose')
    expect(description).toContain('exact bound answer')
    expect(description).not.toContain('No reviewed conclusion')
  })

  it('states the home category in ordinary language', () => {
    expect(HOME_METADATA.title).toContain('Medicine Evidence')
    expect(HOME_METADATA.description).toContain('Source-linked')
  })
})
