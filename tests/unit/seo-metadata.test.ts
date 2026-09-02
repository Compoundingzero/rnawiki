import { describe, expect, it } from 'vitest'

import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import { ENTITY_CLASSES } from '@/lib/inventory/entity-class-types'
import {
  dossierCanonicalRecordSummary,
  dossierDiscoveryProjection,
  dossierMetadataDescription,
  dossierMetadataTitle,
  dossierSocialPreview,
  ENTITY_CLASS_PHRASES,
  HOME_METADATA,
} from '@/lib/seo/metadata'
import type { DrugDossier } from '@/lib/types'

describe('safe SEO metadata builders', () => {
  it('bounds a long dossier title and spends the room on the name', () => {
    const title = dossierMetadataTitle(
      'An exceptionally long medicine identity whose complete database name cannot fit in a useful search title',
    )

    expect(title.length).toBeLessThanOrEqual(64)
    expect(title).not.toContain('RNAWiki')
    // A name this long takes the whole budget, so the descriptive suffix gives way.
    expect(title).not.toContain('evidence record')
    expect(title.startsWith('An exceptionally long medicine')).toBe(true)
    expect(title.endsWith('search title')).toBe(true)
  })

  it('names what the page is when the record name leaves room', () => {
    expect(dossierMetadataTitle('Metformin')).toBe('Metformin — evidence record')
    expect(dossierMetadataTitle('  Metformin  ')).toBe('Metformin — evidence record')
    expect(dossierMetadataTitle('')).toBe('Medicine — evidence record')
  })

  it('keeps both ends of a long name so records that differ only at the end differ in the title', () => {
    // These two records are distinct and their names diverge only after sixty characters. Cutting
    // the end alone gave 1,982 records a title they shared with another record.
    const shorter = dossierMetadataTitle(
      'Streptococcus Pneumoniae Type 19a Capsular Polysaccharide Antigen',
    )
    const longer = dossierMetadataTitle(
      'Streptococcus Pneumoniae Type 19a Capsular Polysaccharide Diphtheria Crm197 Protein Conjugate Antigen',
    )

    expect(shorter).not.toBe(longer)
    for (const title of [shorter, longer]) {
      expect(title.length).toBeLessThanOrEqual(64)
      expect(title.startsWith('Streptococcus Pneumoniae Type 19a')).toBe(true)
      expect(title.endsWith('Antigen')).toBe(true)
    }
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

function canonicalRecordDrug(name: string, entityClass = 'APPROVED_MEDICINE'): DrugDossier {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    hasDiscrepancy: false,
    inventoryResolution: {
      resolutionStatus: 'CANONICAL_ENTITY',
      entityClass,
      canonicalSlug: name.toLowerCase().replace(/\s+/g, '-'),
      redirectTargetSlug: null,
      identityConfidence: 'REGISTRY_IDENTIFIER_RECORDED',
      identifierSharedWithOtherRecords: false,
      resolverVersion: 'inventory-resolution/v1',
    },
    completionAssessment: {
      status: 'INCOMPLETE',
      applicableSectionCount: 18,
      terminalSectionCount: 16,
      contentChangedAt: '2026-08-22T00:00:00.000Z',
      sections: [
        { id: 'trial-registry', state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH' },
        { id: 'reviewed-conclusion', state: 'UNASSESSED' },
      ],
    },
  } as unknown as DrugDossier
}

describe('canonical-record discovery description', () => {
  it('gives every entity class a short ordinary-language phrase', () => {
    for (const entityClass of ENTITY_CLASSES) {
      const phrase = ENTITY_CLASS_PHRASES[entityClass]
      expect(phrase.length).toBeGreaterThan(0)
      expect(phrase.length).toBeLessThanOrEqual(52)
      expect(phrase).toBe(phrase.toLowerCase())
    }
  })

  it('describes the record from its class, counts and search outcomes, never a finding', () => {
    const description = dossierMetadataDescription({
      name: 'Sodium cromoglicate',
      reviewed: false,
      canonicalRecord: {
        entityClass: 'APPROVED_MEDICINE',
        applicableSectionCount: 18,
        terminalSectionCount: 16,
        registeredTrials: false,
        reviewedConclusion: false,
      },
    })

    expect(description).toContain('Sodium cromoglicate')
    expect(description).toContain('an approved medicine record')
    expect(description).toContain('16/18 sections have a recorded state')
    expect(description).toContain('registry snapshot searched, none found')
    expect(description).toContain('no reviewed conclusion yet')
    expect(description).not.toMatch(/effective|works|safe|proven|benefit/i)
    expect(description.length).toBeLessThanOrEqual(158)
  })

  it('keeps the 158-character bound for a long name and a full clause set', () => {
    const description = dossierMetadataDescription({
      name: 'An exceptionally long recorded medicine identity that will not fit in a search snippet',
      reviewed: false,
      canonicalRecord: {
        entityClass: 'BOTANICAL_OR_ORGANISM_PREPARATION',
        applicableSectionCount: 20,
        terminalSectionCount: 20,
        registeredTrials: true,
        reviewedConclusion: true,
      },
    })
    expect(description.length).toBeLessThanOrEqual(158)
  })

  it('gives two different records two different descriptions', () => {
    const first = dossierMetadataDescription(
      dossierDiscoveryProjection(canonicalRecordDrug('Aspirin'), null).input,
    )
    const second = dossierMetadataDescription(
      dossierDiscoveryProjection(canonicalRecordDrug('Ibuprofen'), null).input,
    )
    expect(first).not.toBe(second)
    expect(first).toContain('Aspirin')
    expect(second).toContain('Ibuprofen')
  })

  it('reads the trial-registry and reviewed-conclusion states from the stored assessment', () => {
    const { input } = dossierDiscoveryProjection(canonicalRecordDrug('Aspirin'), null)
    expect(input.canonicalRecord).toEqual({
      entityClass: 'APPROVED_MEDICINE',
      applicableSectionCount: 18,
      terminalSectionCount: 16,
      registeredTrials: false,
      reviewedConclusion: false,
    })
  })

  it('shows no answer text on the social card for a canonical record with no reviewed answer', () => {
    const { input } = dossierDiscoveryProjection(canonicalRecordDrug('Aspirin'), null)
    expect(dossierSocialPreview(input)).toEqual({
      reviewedAnswer: false,
      badgeLabel: 'Medicine evidence record',
      finding: null,
    })
    expect(
      dossierCanonicalRecordSummary('Aspirin', input.canonicalRecord!).startsWith('Aspirin:'),
    ).toBe(true)
  })

  it('keeps the reviewed answer ahead of the canonical-record wording', () => {
    const description = dossierMetadataDescription({
      name: 'Example medicine',
      reviewed: true,
      usedFor: 'Studied for one defined use and population',
      finding: 'The measured result was lower than with the comparison treatment',
      canonicalRecord: {
        entityClass: 'APPROVED_MEDICINE',
        applicableSectionCount: 18,
        terminalSectionCount: 18,
        registeredTrials: true,
        reviewedConclusion: true,
      },
    })
    expect(description).toContain('Studied for one defined use')
    expect(description).not.toContain('sections have a recorded state')
  })
})
