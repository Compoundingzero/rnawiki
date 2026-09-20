import { describe, expect, it } from 'vitest'

import { buildSourceBoundCheckpoint } from '@/lib/dossier-v4/source-bound-checkpoint'
import type { RecordedTrialSnapshot } from '@/lib/dossier-v4/recorded-facts'
import type { RecordedLabel } from '@/lib/dossier-v4/recorded-label'
import type { SourceCitation } from '@/lib/dossier-v3/fields'

const trialSource: SourceCitation = {
  label: 'ClinicalTrials.gov',
  id: 'NCT03036124',
  url: 'https://clinicaltrials.gov/study/NCT03036124?tab=results',
  binding: 'record',
}
const labelSource: SourceCitation = {
  label: 'US prescribing information',
  id: 'fb296500-55cb-45ce-be0c-59aa2e3d4624',
  url: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=fb296500-55cb-45ce-be0c-59aa2e3d4624',
  binding: 'record',
}

function label(uses: string): RecordedLabel {
  return {
    uses: uses ? [{ text: uses, citation: labelSource }] : [],
    mechanism: [],
    targets: [],
    safety: [],
    contraindications: [],
    pharmacokinetics: [],
    adverseReactions: [],
    interactions: [],
    boxedWarning: null,
    empty: !uses,
  }
}

function snapshot(): RecordedTrialSnapshot {
  return {
    trialIdentifier: 'NCT03036124',
    condition: 'symptomatic heart failure with reduced ejection fraction',
    testedIntervention: 'dapagliflozin',
    formulationAndRoute: 'oral tablet',
    population: 'adults receiving standard heart-failure care',
    included: [],
    excluded: ['type 1 diabetes'],
    endpoint: 'cardiovascular death or worsening heart failure',
    activeResult: '386 of 2,373 (16.3%)',
    comparatorResult: '502 of 2,371 (21.2%)',
    difference: '4.9 percentage points',
    uncertainty: 'HR 0.74; 95% CI 0.65–0.85',
    timepoint: 'median 18.2 months',
    citation: trialSource,
    contextCitation: trialSource,
    populationCitation: trialSource,
  }
}

describe('source-bound evidence checkpoint', () => {
  it('keeps the study result, studied people, endpoint, boundary and source together', () => {
    const result = buildSourceBoundCheckpoint({
      label: label(''),
      trialSnapshots: [snapshot()],
      exactSupply: [],
    })
    expect(result.kind).toBe('human_result')
    expect(result.claim?.text).toContain('386 of 2,373 (16.3%) versus 502 of 2,371 (21.2%)')
    expect(result.tested?.text).toContain('dapagliflozin (oral tablet)')
    expect(result.studied?.text).toContain('adults receiving standard heart-failure care')
    expect(result.measured?.text).toContain('median 18.2 months')
    expect(result.boundary?.text).toContain('type 1 diabetes')
    expect(result.claim?.sources[0]?.url).toBe(trialSource.url)
  })

  it('does not promote a source use statement into an exact product label or human result', () => {
    const use = 'Used with diet and exercise for type 2 diabetes.'
    const result = buildSourceBoundCheckpoint({
      label: label(use),
      trialSnapshots: [],
      exactSupply: [
        {
          text: 'Metformin oral tablets are recorded in one US label.',
          citation: labelSource,
          origin: 'derived_count',
        },
      ],
    })
    expect(result.kind).toBe('source_statement')
    expect(result.claim?.text).toBe(use)
    expect(result.claim?.label).toBe('What one source says about use')
    expect(result.studied).toBeNull()
    expect(result.tested).toBeNull()
    expect(result.measured).toBeNull()
    expect(result.product?.text).toBe('Metformin oral tablets are recorded in one US label.')
    expect(result.product?.label).toBe('One recorded product form')
  })

  it('does not assign a population to a result without a linked population source', () => {
    const result = buildSourceBoundCheckpoint({
      label: label(''),
      trialSnapshots: [{ ...snapshot(), populationCitation: null }],
      exactSupply: [],
    })
    expect(result.claim).not.toBeNull()
    expect(result.studied).toBeNull()
    expect(result.boundary).toBeNull()
  })

  it('refuses unmatched trial context and unsafe links', () => {
    const result = buildSourceBoundCheckpoint({
      label: label(''),
      trialSnapshots: [
        {
          ...snapshot(),
          contextCitation: { ...trialSource, url: 'https://clinicaltrials.gov/study/NCT99999999' },
        },
      ],
      exactSupply: [
        {
          text: 'A product lists it.',
          citation: { ...labelSource, url: 'javascript:alert(1)' },
          origin: 'derived_count',
        },
      ],
    })
    expect(result.kind).toBe('no_source_claim')
    expect(result.claim).toBeNull()
    expect(result.product).toBeNull()
  })

  it('refuses a result attached to a different registry ID even when its URL matches', () => {
    const result = buildSourceBoundCheckpoint({
      label: label(''),
      trialSnapshots: [
        {
          ...snapshot(),
          contextCitation: { ...trialSource, id: 'NCT99999999' },
        },
      ],
      exactSupply: [],
    })
    expect(result.kind).toBe('no_source_claim')
  })

  it('requires the exact ClinicalTrials.gov study path, not a look-alike host', () => {
    const lookalike = {
      ...trialSource,
      url: 'https://example.org/study/NCT03036124',
    }
    const result = buildSourceBoundCheckpoint({
      label: label(''),
      trialSnapshots: [{ ...snapshot(), citation: lookalike, contextCitation: lookalike }],
      exactSupply: [],
    })
    expect(result.kind).toBe('no_source_claim')
  })
})
