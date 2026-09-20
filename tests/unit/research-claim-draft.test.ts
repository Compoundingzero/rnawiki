import { describe, expect, it } from 'vitest'
import {
  assessResearchDraft,
  type BoundField,
  type ProductLabelDraft,
  type TrialResultDraft,
} from '../../lib/research/claim-draft'

const labelSetId = '11111111-1111-1111-1111-111111111111'
const labelExcerpt =
  'Example Tablets contain example drug 10 mg. Dosage form: tablet. Route: oral. Indicated for condition X.'
const labelField = (value: string): BoundField => ({ value, sourceId: 'label', quote: value })

function productDraft(): ProductLabelDraft {
  return {
    schemaVersion: 1,
    status: 'DRAFT',
    kind: 'product_label',
    subjectSlug: 'example-drug',
    subjectName: 'Example drug',
    jurisdiction: 'US',
    productSetId: labelSetId,
    productName: labelField('Example Tablets'),
    activeIngredient: labelField('example drug 10 mg'),
    dosageForm: labelField('tablet'),
    route: labelField('oral'),
    section: 'indications_and_usage',
    claimScope: 'this_product_only',
    sources: [
      {
        id: 'label',
        kind: 'FDA_SPL',
        documentId: labelSetId,
        url: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${labelSetId}`,
        title: 'Example Tablets label',
        version: '2025-01-01',
        checkedAt: '2026-09-19',
        locator: 'description and indications_and_usage',
        excerpt: labelExcerpt,
      },
    ],
    sentences: [
      {
        text: 'This oral tablet label lists condition X as an approved use.',
        sourceId: 'label',
        quote: 'Indicated for condition X.',
        layer: 'first_read',
      },
    ],
  }
}

const nctId = 'NCT12345678'
const registryExcerpt =
  'NCT12345678. Adults with condition X received example drug oral tablets or placebo. The primary outcome was symptom score at Week 12. The mean difference was -2 points; 95% CI -3 to -1.'
const registryField = (value: string): BoundField => ({ value, sourceId: 'registry', quote: value })

function trialDraft(): TrialResultDraft {
  return {
    schemaVersion: 1,
    status: 'DRAFT',
    kind: 'trial_result',
    subjectSlug: 'example-drug',
    subjectName: 'Example drug',
    trialId: registryField(nctId),
    condition: registryField('condition X'),
    intervention: registryField('example drug'),
    dosageFormAndRoute: registryField('oral tablets'),
    population: registryField('Adults with condition X'),
    comparator: registryField('placebo'),
    outcome: registryField('symptom score'),
    timepoint: registryField('Week 12'),
    result: registryField('mean difference was -2 points'),
    uncertainty: registryField('95% CI -3 to -1'),
    claimScope: 'this_study_only',
    sources: [
      {
        id: 'registry',
        kind: 'CLINICALTRIALS_GOV',
        documentId: nctId,
        url: `https://clinicaltrials.gov/study/${nctId}`,
        title: 'Example study',
        version: '2025-01-01',
        checkedAt: '2026-09-19',
        locator: 'protocolSection and resultsSection',
        excerpt: registryExcerpt,
      },
    ],
    sentences: [
      {
        text: 'In this study, the symptom score differed by two points after 12 weeks.',
        sourceId: 'registry',
        quote: 'mean difference was -2 points',
        layer: 'first_read',
      },
    ],
  }
}

describe('source-bound research drafts', () => {
  it('accepts a complete product-specific label draft without treating it as an ingredient-wide claim', () => {
    expect(assessResearchDraft(productDraft())).toEqual([])
  })

  it('requires route, actual source words, and the same SPL set ID', () => {
    const draft = productDraft()
    draft.route = { value: null, sourceId: null, quote: null }
    draft.activeIngredient.quote = 'different active ingredient'
    draft.sources[0]!.documentId = '22222222-2222-2222-2222-222222222222'
    expect(assessResearchDraft(draft)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'missing_field', field: 'route' }),
        expect.objectContaining({ code: 'quote_not_in_source', field: 'activeIngredient' }),
        expect.objectContaining({ code: 'source_record_mismatch', field: 'sources.0' }),
      ]),
    )
  })

  it('accepts a completed study with condition, comparison, outcome, time and uncertainty bound to one NCT', () => {
    expect(assessResearchDraft(trialDraft())).toEqual([])
  })

  it('rejects an NCT mismatch and unsupported numeric wording', () => {
    const draft = trialDraft()
    draft.sources[0]!.documentId = 'NCT00000001'
    draft.sentences[0]!.quote = 'mean difference was -20 points'
    expect(assessResearchDraft(draft)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'source_record_mismatch', field: 'sources.0' }),
        expect.objectContaining({ code: 'quote_not_in_source', field: 'sentences.0' }),
      ]),
    )
  })

  it('allows separate exact field excerpts from the same registry study', () => {
    const draft = trialDraft()
    draft.sources.push({
      ...draft.sources[0]!,
      id: 'outcome',
      locator: 'resultsSection.outcomeMeasuresModule.outcomeMeasures[0]',
      excerpt: 'The mean difference was -2 points; 95% CI -3 to -1.',
    })
    draft.result.sourceId = 'outcome'
    draft.uncertainty.sourceId = 'outcome'
    expect(assessResearchDraft(draft)).toEqual([])
  })

  it('keeps absent forms and missing reader copy visible as draft blockers', () => {
    const draft = trialDraft()
    draft.dosageFormAndRoute = { value: null, sourceId: null, quote: null }
    draft.sentences = []
    expect(assessResearchDraft(draft)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'missing_field', field: 'dosageFormAndRoute' }),
        expect.objectContaining({ code: 'no_reader_sentence', field: 'sentences' }),
      ]),
    )
  })

  it('blocks unsafe links and long first-read sentences', () => {
    const draft = trialDraft()
    draft.sources[0]!.url = 'http://example.com'
    draft.sentences[0]!.text = 'word '.repeat(31).trim()
    expect(assessResearchDraft(draft)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'unsafe_source_url', field: 'sources.0.url' }),
        expect.objectContaining({ code: 'first_read_too_long', field: 'sentences.0' }),
      ]),
    )
  })
})
