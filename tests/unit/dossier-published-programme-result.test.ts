import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PublishedProgrammeResult } from '@/components/dossier/v4/PublishedProgrammeResult'
import type { ProgrammeEvidenceReadModel } from '@/lib/evidence/types'

type Programme = NonNullable<ProgrammeEvidenceReadModel['selectedProgramme']>

beforeEach(() => vi.stubGlobal('React', React))
afterEach(() => vi.unstubAllGlobals())

function programme(): Programme {
  return {
    slug: 'inclisiran-cvd',
    title: 'Inclisiran for cardiovascular risk',
    verdict: {
      id: 'verdict-1',
      bestSupportedFinding: 'In this programme, LDL cholesterol fell.',
      mainLimitation: 'A cholesterol change does not by itself establish fewer heart attacks.',
      populationScope: 'Adults with raised LDL cholesterol.',
      outcomeScope: 'Change in LDL cholesterol.',
      periodScope: '18 months.',
    },
    summaryFieldDependencies: [
      {
        verdictRevisionId: 'verdict-1',
        fieldPath: 'summary.bestSupportedFinding',
        claimId: 'finding-claim',
      },
      {
        verdictRevisionId: 'verdict-1',
        fieldPath: 'summary.mainLimitation',
        claimId: 'limit-claim',
      },
    ],
    claims: [
      {
        id: 'finding-claim',
        sources: [
          {
            id: 'finding-source',
            title: 'Measured LDL result',
            canonicalLocator: 'nct:NCT03159416',
            relationship: 'SUPPORTS',
          },
        ],
      },
      {
        id: 'limit-claim',
        sources: [
          {
            id: 'limit-source',
            title: 'Outcome limitation',
            canonicalLocator: 'pmid:12345678',
            relationship: 'SUPPORTS',
          },
        ],
      },
      {
        id: 'unrelated-claim',
        sources: [
          {
            id: 'unrelated-source',
            title: 'Unrelated finding',
            canonicalLocator: 'pmid:99999999',
            relationship: 'SUPPORTS',
          },
        ],
      },
    ],
  } as unknown as Programme
}

describe('published programme result on medicine page', () => {
  it('shows the exact use, study scope, uncertainty and only field-bound sources', () => {
    const html = renderToStaticMarkup(
      React.createElement(PublishedProgrammeResult, {
        medicineSlug: 'inclisiran',
        programme: programme(),
      }),
    )

    expect(html).toContain('Inclisiran for cardiovascular risk')
    expect(html).toContain('In this programme, LDL cholesterol fell.')
    expect(html).toContain('A cholesterol change does not by itself establish fewer heart attacks.')
    expect(html).toContain('Who was studied')
    expect(html).toContain('What was measured')
    expect(html).toContain('Over what period')
    expect(html).toContain('https://clinicaltrials.gov/study/NCT03159416')
    expect(html).toContain('https://pubmed.ncbi.nlm.nih.gov/12345678/')
    expect(html).not.toContain('https://pubmed.ncbi.nlm.nih.gov/99999999/')
    expect(html).toContain('/d/inclisiran/programme/inclisiran-cvd/history')
  })

  it('withholds the conclusion when one of its field dependencies has no saved claim', () => {
    const record = programme()
    record.summaryFieldDependencies.push({
      verdictRevisionId: 'verdict-1',
      fieldPath: 'summary.bestSupportedFinding',
      claimId: 'missing-claim',
    } as Programme['summaryFieldDependencies'][number])

    const html = renderToStaticMarkup(
      React.createElement(PublishedProgrammeResult, {
        medicineSlug: 'inclisiran',
        programme: record,
      }),
    )

    expect(html).toContain('The published summary cannot be shown here')
    expect(html).not.toContain('In this programme, LDL cholesterol fell.')
    expect(html).not.toContain('https://clinicaltrials.gov/study/NCT03159416')
    expect(html).not.toContain('https://pubmed.ncbi.nlm.nih.gov/12345678/')
  })
})
