import { describe, expect, it } from 'vitest'

import {
  countDistinctIndependentReviewers,
  decideMedicineIndexability,
  explainMedicineIndexability,
  MINIMUM_INDEPENDENT_PROGRAMME_REVIEWS,
  resolveLegacyPublicContentDate,
  type MedicineIndexingInput,
} from '@/lib/seo/indexability'

const publicationDate = new Date('2026-08-20T10:00:00.000Z')

function eligibleInput(): MedicineIndexingInput {
  return {
    canonicalSlug: 'inclisiran',
    isRedirectSource: false,
    publication: {
      reviewStatus: 'PUBLISHED',
      publishedAt: publicationDate,
      reviewedAt: new Date('2026-08-19T10:00:00.000Z'),
      publicLabel: 'Reviewed conclusion',
      plainMechanism: 'A plain-language explanation.',
      bestSupportedFinding: 'The strongest supported result.',
      mainLimitation: 'The main uncertainty.',
      sourceCount: 3,
      independentReviewCount: MINIMUM_INDEPENDENT_PROGRAMME_REVIEWS,
      freshness: 'current',
    },
  }
}

describe('medicine search indexability', () => {
  it('counts distinct independent reviewer accounts, not duplicate review rows', () => {
    expect(
      countDistinctIndependentReviewers([
        { reviewerUserId: 'reviewer-a', isIndependent: true },
        { reviewerUserId: 'reviewer-a', isIndependent: true },
        { reviewerUserId: 'reviewer-b', isIndependent: true },
        { reviewerUserId: 'reviewer-c', isIndependent: false },
      ]),
    ).toBe(2)
  })

  it('admits only a canonical dossier backed by a complete current reviewed publication', () => {
    expect(decideMedicineIndexability(eligibleInput())).toEqual({
      index: true,
      follow: true,
      reason: 'indexable_reviewed_publication',
      canonicalSlug: 'inclisiran',
      lastPublicContentUpdate: publicationDate,
    })
  })

  it.each([
    ['invalid slug', { canonicalSlug: 'Inclisiran?draft=1' }, 'invalid_canonical_slug'],
    ['retained redirect source', { isRedirectSource: true }, 'canonical_identity_redirected'],
    ['explicit identity dispute', { hasIdentityDispute: true }, 'identity_discrepancy'],
    ['no current publication', { publication: null }, 'no_current_publication'],
  ] as const)('fails closed for %s', (_label, patch, reason) => {
    expect(decideMedicineIndexability({ ...eligibleInput(), ...patch })).toMatchObject({
      index: false,
      follow: true,
      reason,
      lastPublicContentUpdate: null,
    })
  })

  it.each([
    ['wrong status', { reviewStatus: 'APPROVED' }, 'publication_not_published'],
    ['no publication timestamp', { publishedAt: null }, 'missing_publication_timestamp'],
    [
      'invalid publication timestamp',
      { publishedAt: new Date('invalid') },
      'missing_publication_timestamp',
    ],
    ['no review timestamp', { reviewedAt: null }, 'missing_review_timestamp'],
    ['no public label', { publicLabel: '  ' }, 'missing_public_explanation'],
    ['no mechanism', { plainMechanism: null }, 'missing_public_explanation'],
    ['no finding', { bestSupportedFinding: '' }, 'missing_public_explanation'],
    ['no limitation', { mainLimitation: '\n' }, 'missing_public_explanation'],
    ['no signed sources', { sourceCount: 0 }, 'missing_source_provenance'],
    [
      'one independent review',
      { independentReviewCount: MINIMUM_INDEPENDENT_PROGRAMME_REVIEWS - 1 },
      'insufficient_independent_review',
    ],
    ['stale sources', { freshness: 'stale' }, 'public_content_not_current'],
    ['source review pending', { freshness: 'review_required' }, 'public_content_not_current'],
    ['unknown freshness', { freshness: 'unknown' }, 'public_content_not_current'],
  ] as const)('excludes a current row with %s', (_label, patch, reason) => {
    const input = eligibleInput()
    expect(
      decideMedicineIndexability({
        ...input,
        publication: { ...input.publication!, ...patch },
      }),
    ).toMatchObject({ index: false, reason })
  })

  it('reports every applicable editor-facing exclusion without inventing an evidence grade', () => {
    const input = eligibleInput()
    const report = explainMedicineIndexability({
      ...input,
      hasIdentityDispute: true,
      publication: {
        ...input.publication!,
        mainLimitation: null,
        sourceCount: 0,
        independentReviewCount: 1,
        freshness: 'unknown',
      },
    })

    expect(report.decision.reason).toBe('identity_discrepancy')
    expect(report.issues.map((issue) => issue.code)).toEqual([
      'identity_discrepancy',
      'missing_public_explanation',
      'missing_source_provenance',
      'insufficient_independent_review',
      'public_content_not_current',
    ])
    expect(report.issues.map((issue) => issue.explanation).join(' ')).not.toMatch(
      /effective|safe|recommended|quality/i,
    )
  })

  it('admits only an active flagship legacy record with an exact v2 answer binding', () => {
    const publicContentDate = new Date('2026-08-01T00:00:00.000Z')
    const decision = decideMedicineIndexability({
      canonicalSlug: 'creatine-monohydrate',
      isRedirectSource: false,
      publication: null,
      legacy: {
        bindingState: 'legacy_record',
        dossierDepth: 'flagship',
        authoredEvidenceBinding: {
          kind: 'legacy_answer_and_evidence_fingerprint',
          version: 'legacy-ten-second-answer/v2',
          fingerprint: `sha256:${'a'.repeat(64)}`,
        },
        usedFor: 'Used for one recorded purpose.',
        bestSupportedFinding: 'The stored studies reported a measured result.',
        mainLimitation: 'The most important boundary remains recorded.',
        sourceCount: 2,
        publicContentDate,
      },
    })

    expect(decision).toEqual({
      index: true,
      follow: true,
      reason: 'indexable_provenance_bound_legacy_flagship',
      canonicalSlug: 'creatine-monohydrate',
      lastPublicContentUpdate: publicContentDate,
    })
  })

  it.each([
    ['non-legacy route', { bindingState: 'programme_unpublished' }, 'legacy_record_not_active'],
    ['curated import', { dossierDepth: 'curated' }, 'legacy_dossier_not_flagship'],
    ['missing binding', { authoredEvidenceBinding: null }, 'missing_legacy_evidence_binding'],
    ['missing finding', { bestSupportedFinding: ' ' }, 'missing_legacy_public_explanation'],
    ['missing source', { sourceCount: 0 }, 'missing_source_provenance'],
    ['missing date', { publicContentDate: null }, 'missing_legacy_public_content_date'],
  ] as const)('excludes a legacy candidate with %s', (_label, patch, reason) => {
    const report = explainMedicineIndexability({
      canonicalSlug: 'legacy-example',
      isRedirectSource: false,
      publication: null,
      legacy: {
        bindingState: 'legacy_record',
        dossierDepth: 'flagship',
        authoredEvidenceBinding: {
          kind: 'legacy_answer_and_evidence_fingerprint',
          version: 'legacy-ten-second-answer/v2',
          fingerprint: `sha256:${'b'.repeat(64)}`,
        },
        usedFor: 'One use.',
        bestSupportedFinding: 'One finding.',
        mainLimitation: 'One limitation.',
        sourceCount: 1,
        publicContentDate: new Date('2026-08-01T00:00:00.000Z'),
        ...patch,
      },
    })

    expect(report.decision).toMatchObject({ index: false, reason })
    expect(report.issues.map((entry) => entry.code)).toContain(reason)
  })

  it('keeps the current publication path authoritative when legacy input is also present', () => {
    const input = eligibleInput()
    expect(
      decideMedicineIndexability({
        ...input,
        legacy: {
          bindingState: 'programme_unpublished',
          dossierDepth: 'stub',
          authoredEvidenceBinding: null,
          usedFor: null,
          bestSupportedFinding: null,
          mainLimitation: null,
          sourceCount: 0,
          publicContentDate: null,
        },
      }),
    ).toEqual({
      index: true,
      follow: true,
      reason: 'indexable_reviewed_publication',
      canonicalSlug: 'inclisiran',
      lastPublicContentUpdate: publicationDate,
    })
  })

  it('parses only explicit legacy public dates and chooses the latest real content date', () => {
    expect(resolveLegacyPublicContentDate(null, 'August 2026')?.toISOString()).toBe(
      '2026-08-01T00:00:00.000Z',
    )
    expect(
      resolveLegacyPublicContentDate('2026-08-21T09:30:00.000Z', 'August 2026')?.toISOString(),
    ).toBe('2026-08-21T09:30:00.000Z')
    expect(resolveLegacyPublicContentDate(null, 'recently')).toBeNull()
    expect(resolveLegacyPublicContentDate(null, '2026-02-30')).toBeNull()
    expect(resolveLegacyPublicContentDate(null, '2026-02-30T12:00:00.000Z')).toBeNull()
    expect(
      resolveLegacyPublicContentDate(
        '2099-01-01T00:00:00.000Z',
        'August 2026',
        new Date('2026-08-26T00:00:00.000Z'),
      )?.toISOString(),
    ).toBe('2026-08-01T00:00:00.000Z')
  })
})
