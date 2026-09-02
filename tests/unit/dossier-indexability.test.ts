import { describe, expect, it } from 'vitest'

import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import {
  canonicalRecordProjection,
  decideDossierIndexability,
} from '@/lib/seo/dossier-indexability'
import type { DrugDossier } from '@/lib/types'

describe('dossier indexability adapter', () => {
  it('uses the exact stored best-supported finding when reader wording is withheld', () => {
    const drug = {
      id: 'example-medicine',
      hasDiscrepancy: false,
    } as DrugDossier
    const dossier = {
      slug: 'example-medicine',
      bindingState: 'published_programme',
      readerSummary: {
        basis: 'published_programme',
        usedFor: 'One reviewed use.',
        takeaway: 'Reader wording is deliberately limited.',
        simplified: false,
        contextItems: [],
        // `whatStudiesFound` is absent because reader-level citation projection withheld it.
      },
      mechanismSummary: {
        change: 'Exact stored plain mechanism.',
        observed: 'Exact stored best-supported finding.',
      },
      mainLimitation: 'Exact stored main limitation.',
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
    } as unknown as MedicineDossierViewModel

    expect(decideDossierIndexability(drug, dossier)).toMatchObject({
      index: true,
      reason: 'indexable_reviewed_publication',
      canonicalSlug: 'example-medicine',
    })
  })

  it('uses the same provenance-bound flagship decision for a legacy route', () => {
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

    expect(decideDossierIndexability(drug, dossier)).toEqual({
      index: true,
      follow: true,
      reason: 'indexable_provenance_bound_legacy_flagship',
      canonicalSlug: 'bound-legacy',
      lastPublicContentUpdate: new Date('2026-08-01T00:00:00.000Z'),
    })
  })

  it('carries the stored resolution and assessment onto the canonical-record path', () => {
    const drug = {
      id: 'plain-record',
      name: 'Plain record',
      hasDiscrepancy: false,
      dossierDepth: 'stub',
      inventoryResolution: {
        resolutionStatus: 'CANONICAL_ENTITY',
        entityClass: 'APPROVED_MEDICINE',
        canonicalSlug: 'plain-record',
        redirectTargetSlug: null,
        identityConfidence: 'REGISTRY_IDENTIFIER_RECORDED',
        identifierSharedWithOtherRecords: false,
        resolverVersion: 'inventory-resolution/v1',
      },
      completionAssessment: {
        status: 'INCOMPLETE',
        applicableSectionCount: 16,
        terminalSectionCount: 14,
        contentChangedAt: '2026-08-22T00:00:00.000Z',
        sections: [],
      },
    } as unknown as DrugDossier
    const dossier = {
      slug: 'plain-record',
      bindingState: 'legacy_record',
      readerSummary: { basis: 'older_record', takeaway: '', simplified: true, contextItems: [] },
      sources: [],
    } as unknown as MedicineDossierViewModel

    expect(canonicalRecordProjection(drug)).toEqual({
      resolutionStatus: 'CANONICAL_ENTITY',
      assessmentStatus: 'INCOMPLETE',
      contentChangedAt: new Date('2026-08-22T00:00:00.000Z'),
      applicableSectionCount: 16,
      terminalSectionCount: 14,
    })
    expect(decideDossierIndexability(drug, dossier)).toEqual({
      index: true,
      follow: true,
      reason: 'indexable_canonical_record',
      canonicalSlug: 'plain-record',
      lastPublicContentUpdate: new Date('2026-08-22T00:00:00.000Z'),
    })
  })

  it('offers no canonical-record path to a record with no stored inventory resolution', () => {
    const drug = { id: 'unresolved', name: 'Unresolved', hasDiscrepancy: false } as DrugDossier
    expect(canonicalRecordProjection(drug)).toBeNull()
  })

  it('lets an explicit projection override the record-derived one', () => {
    const drug = { id: 'scalar-only', name: 'Scalar only', hasDiscrepancy: false } as DrugDossier
    const dossier = {
      slug: 'scalar-only',
      bindingState: 'legacy_record',
      readerSummary: { basis: 'older_record', takeaway: '', simplified: true, contextItems: [] },
      sources: [],
    } as unknown as MedicineDossierViewModel

    expect(
      decideDossierIndexability(drug, dossier, {
        canonicalRecord: {
          resolutionStatus: 'CANONICAL_ENTITY',
          assessmentStatus: 'COMPLETE',
          contentChangedAt: new Date('2026-08-23T00:00:00.000Z'),
          applicableSectionCount: 12,
          terminalSectionCount: 12,
        },
      }),
    ).toMatchObject({ index: true, reason: 'indexable_canonical_record' })
  })
})
