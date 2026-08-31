import { describe, expect, it } from 'vitest'

// The production CLI is plain Node ESM, so its shared policy intentionally remains an `.mjs`
// module. Vitest executes that module directly; no runtime shim or second implementation exists.
// @ts-expect-error The JavaScript policy module has no separate declaration file.
import * as publicCopyPolicy from '../../scripts/quality/public-copy-policy.mjs'

const {
  findPublicCopyFindings,
  isSelfCertifyingPublicCopy,
  normalizePublicCopyPath,
  publicCopySegments,
} = publicCopyPolicy

describe('generated-corpus copy policy', () => {
  it('normalizes array positions without losing the field path', () => {
    expect(normalizePublicCopyPath(['commonQuestions', 4, 'a'])).toBe('commonQuestions.*.a')
  })

  it.each([
    'This page gives the honest answer.',
    'RNAWiki records the honest verdict for this dossier.',
    'We state the honest limit of this record.',
    'Nobody knows yet, and saying so plainly is the honest position.',
    'The odd shape of this record is worth stating plainly.',
    'The result is narrow, and this page states that plainly.',
    'This record records the limitation plainly for readers.',
  ])('detects a same-segment self-certifying claim: %s', (value) => {
    expect(isSelfCertifyingPublicCopy(value)).toBe(true)
  })

  it.each([
    'No binding affinity can honestly be stated, because no target has been established.',
    'The authors state plainly that the clinical relevance is unknown.',
    'The honest position is that the absolute risk is small and uncertain.',
    'A drug being old is not evidence, which is worth saying as plainly as the negative findings elsewhere in this file.',
    'Its label restricts the indication, records that a comparison was lost, and states plainly that only the comparator has shown the outcome.',
  ])('does not turn legitimate/source-attributed wording into a violation: %s', (value) => {
    expect(isSelfCertifyingPublicCopy(value)).toBe(false)
  })

  it('keeps matching inside one value and includes an unpunctuated final segment', () => {
    const value =
      'The pooled result is positive and this page records that plainly, with its limitations stated'
    expect(publicCopySegments(value)).toEqual([value])
    expect(
      findPublicCopyFindings({
        id: 'collagen-fixture',
        measuredVsInferredSummary: { realWorldOutcome: [value] },
      }),
    ).toEqual([
      {
        recordId: 'collagen-fixture',
        path: 'measuredVsInferredSummary.realWorldOutcome.*',
        match: value,
        value,
      },
    ])
  })

  it('does not combine a claim in one field with a project referent in another', () => {
    expect(
      findPublicCopyFindings({
        id: 'separate-fields',
        first: 'The honest answer is not known.',
        second: 'This page reports the available measurements.',
      }),
    ).toEqual([])
  })

  it('reports the medicine and normalized path for editorial copy', () => {
    expect(
      findPublicCopyFindings({
        id: 'fixture-medicine',
        commonQuestions: [{ a: 'This page gives the honest answer.' }],
      }),
    ).toEqual([
      {
        recordId: 'fixture-medicine',
        path: 'commonQuestions.*.a',
        match: 'This page gives the honest answer.',
        value: 'This page gives the honest answer.',
      },
    ])
  })

  it('protects recorded identity, source excerpts, attribution and named alternatives by path', () => {
    const forbiddenIfEditorial = 'RNAWiki gives the honest answer on this page.'
    expect(
      findPublicCopyFindings({
        id: 'protected-paths',
        name: forbiddenIfEditorial,
        tradeName: forbiddenIfEditorial,
        aliases: [{ alias: forbiddenIfEditorial, kind: 'trade' }],
        sourceProvenance: [forbiddenIfEditorial],
        substitutes: {
          conventionalRx: [{ name: forbiddenIfEditorial }],
          naturalFoods: [{ name: forbiddenIfEditorial }],
        },
        keyAudits: [{ evidenceSource: forbiddenIfEditorial, doi: forbiddenIfEditorial }],
        pricing: {
          priceSource: { label: forbiddenIfEditorial },
          costSource: { excerpt: forbiddenIfEditorial },
        },
        recordedBackground: {
          mechanism: {
            statements: [
              {
                textAsRecorded: forbiddenIfEditorial,
                source: { excerpt: forbiddenIfEditorial },
              },
            ],
          },
          productVariants: [{ brandName: 'Honest Med Capsaicin Patch' }],
        },
      }),
    ).toEqual([])
  })

  it('does not flag the recorded Honest Med trade identity', () => {
    expect(
      findPublicCopyFindings({
        id: 'capsaicin',
        name: 'Capsaicin',
        tradeName: 'Honest Med Capsaicin Patch',
        aliases: [{ alias: 'Honest Med Capsaicin Patch', kind: 'trade' }],
      }),
    ).toEqual([])
  })
})
