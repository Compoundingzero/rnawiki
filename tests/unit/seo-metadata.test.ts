import { describe, expect, it } from 'vitest'

import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import {
  dossierDiscoveryProjection,
  dossierMetadataDescription,
  dossierMetadataTitle,
  dossierSocialPreview,
  HOME_METADATA,
} from '@/lib/seo/metadata'
import type { DrugDossier } from '@/lib/types'

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

function publishedProgrammeDrug(): DrugDossier {
  return {
    id: 'example-medicine',
    name: 'Example medicine',
    hasDiscrepancy: false,
  } as DrugDossier
}

/** Mirrors the adapter fixture in dossier-indexability.test.ts: a complete reviewed publication. */
function publishedProgrammeDossier(
  overrides: Partial<MedicineDossierViewModel> = {},
): MedicineDossierViewModel {
  return {
    slug: 'example-medicine',
    bindingState: 'published_programme',
    readerSummary: {
      basis: 'published_programme',
      usedFor: 'One reviewed use in one defined group.',
      whatStudiesFound: 'The reviewed studies measured one specific lowered laboratory value.',
      biggestLimit: 'The studies did not measure how people felt.',
      takeaway: 'The reviewed studies measured one specific lowered laboratory value.',
      simplified: true,
      contextItems: [],
    },
    mechanismSummary: {
      change: 'Exact stored plain mechanism.',
      observed: 'Exact stored best-supported finding.',
    },
    mainLimitation: 'The studies did not measure how people felt.',
    sources: [{ id: 'signed-source-snapshot' }],
    freshness: 'current',
    review: {
      publishedAt: '2026-08-25T00:00:00.000Z',
      reviewedAt: '2026-08-24T00:00:00.000Z',
    },
    conclusion: {
      publicLabel: 'Reviewed public conclusion.',
      independentReviewCount: 2,
      reviewers: [],
    },
    ...overrides,
  } as unknown as MedicineDossierViewModel
}

describe('shared dossier discovery projection', () => {
  it('feeds the description and the social card the same reviewed answer fields', () => {
    const { decision, input } = dossierDiscoveryProjection(
      publishedProgrammeDrug(),
      publishedProgrammeDossier(),
    )

    expect(decision?.index).toBe(true)
    expect(input.reviewed).toBe(true)
    expect(input.finding).toBe(
      'The reviewed studies measured one specific lowered laboratory value.',
    )

    const description = dossierMetadataDescription(input)
    const preview = dossierSocialPreview(input)
    expect(description).toContain('lowered laboratory value')
    expect(preview.reviewedAnswer).toBe(true)
    expect(preview.badgeLabel).toBe('Reviewed evidence answer')
    // Identical single-sourced sentence: whatever the description quotes, the card quotes.
    expect(preview.finding).toBe(input.finding)
  })

  it('refuses the reviewed badge and finding when the same publication fails the shared policy', () => {
    // Tempting-but-wrong input: the publication, conclusion and plain-language finding all still
    // exist, but source monitoring is stale, so the shared policy fails closed. Before this
    // projection existed, the social image quoted the reviewed conclusion here while the meta
    // description said no reviewed conclusion was published.
    const { decision, input } = dossierDiscoveryProjection(
      publishedProgrammeDrug(),
      publishedProgrammeDossier({ freshness: 'stale' } as Partial<MedicineDossierViewModel>),
    )

    expect(decision?.index).toBe(false)
    expect(input.reviewed).toBe(false)

    const description = dossierMetadataDescription(input)
    const preview = dossierSocialPreview(input)
    expect(description).toContain('No reviewed conclusion')
    expect(description).not.toContain('lowered laboratory value')
    expect(preview.reviewedAnswer).toBe(false)
    expect(preview.badgeLabel).toBe('Medicine evidence record')
    expect(preview.finding).toBeNull()
  })

  it('shows a provenance-bound legacy answer without claiming a reviewed programme', () => {
    const drug = {
      id: 'bound-legacy',
      name: 'Bound legacy medicine',
      hasDiscrepancy: false,
      dossierDepth: 'flagship',
      sourceProvenance: ['Exact stored provenance'],
      recentAuditDate: 'August 2026',
    } as DrugDossier
    const dossier = {
      slug: 'bound-legacy',
      bindingState: 'legacy_record',
      readerSummary: {
        basis: 'older_record',
        usedFor: 'Used for one recorded purpose.',
        whatStudiesFound: 'The stored research reported one measured result.',
        biggestLimit: 'The main unanswered question remains recorded.',
        authoredEvidenceBinding: {
          kind: 'legacy_answer_and_evidence_fingerprint',
          version: 'legacy-ten-second-answer/v2',
          fingerprint: `sha256:${'c'.repeat(64)}`,
        },
        takeaway: 'The stored research reported one measured result.',
        simplified: true,
        contextItems: [],
      },
      sources: [],
    } as unknown as MedicineDossierViewModel

    const { input } = dossierDiscoveryProjection(drug, dossier)
    expect(input.provenanceBoundLegacy).toBe(true)
    expect(input.reviewed).toBe(false)

    const preview = dossierSocialPreview(input)
    expect(preview.finding).toBe('The stored research reported one measured result.')
    expect(preview.reviewedAnswer).toBe(false)
    expect(preview.badgeLabel).toBe('Medicine evidence record')
  })

  it('shows no answer text at all for a medicine with no dossier view', () => {
    const { decision, input } = dossierDiscoveryProjection(publishedProgrammeDrug(), null)

    expect(decision).toBeNull()
    expect(input.reviewed).toBe(false)
    expect(dossierSocialPreview(input)).toEqual({
      reviewedAnswer: false,
      badgeLabel: 'Medicine evidence record',
      finding: null,
    })
  })

  it('bounds an overlong finding on the social card without inventing words', () => {
    const longFinding = `The reviewed studies measured ${'a very specific laboratory value '.repeat(12)}in one defined group.`
    const preview = dossierSocialPreview({
      name: 'Example medicine',
      reviewed: true,
      finding: longFinding,
    })

    expect(preview.finding).not.toBeNull()
    expect(preview.finding?.length).toBeLessThanOrEqual(220)
    expect(preview.finding?.endsWith('…')).toBe(true)
    expect(longFinding.startsWith(preview.finding!.slice(0, -1))).toBe(true)
  })
})
