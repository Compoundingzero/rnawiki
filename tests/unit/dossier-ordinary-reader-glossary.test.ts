import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DossierAudienceLensSelector } from '@/components/dossier/DossierAudienceLensSelector'
import type { DossierAudienceLensProjection } from '@/lib/dossier-audience-lenses'
import {
  ORDINARY_READER_GLOSSARY,
  ordinaryReaderGlossaryEntriesForProjection,
  ordinaryReaderGlossaryEntriesForText,
} from '@/lib/dossier-ordinary-reader-glossary'

// Next preserves JSX for its compiler; this direct server render uses the classic runtime.
;(globalThis as typeof globalThis & { React: typeof React }).React = React

function ordinaryProjection(): DossierAudienceLensProjection {
  return {
    lens: 'ordinary',
    label: 'Ordinary reader',
    description: 'Six everyday questions, limits and safety',
    href: '#what-it-is',
    orderedSections: [],
    sourceBoundMedicalEvidenceRecords: 1,
    sections: [
      {
        id: 'ordinary-result-size',
        heading: 'How large was the measured result?',
        description: 'The saved result keeps its original wording.',
        requiredFields: ['keyOutcomes[].uncertaintyInterval'],
        records: [
          {
            id: 'ordinary-result',
            recordKind: 'medical_evidence',
            heading: 'Change in LDL cholesterol',
            summary: 'The comparator was placebo.',
            facts: [
              {
                label: 'Uncertainty',
                value: '48.8 to 55.7 percentage points lower (95% confidence interval)',
              },
            ],
            canonicalFields: ['keyOutcomes[]'],
            scope: 'Adults in the cited study',
            evidenceState: 'measured',
            evidenceStateLabel: 'Measured result',
            sources: [
              {
                id: 'source-1',
                label: 'Exact study source',
                identifier: 'NCT00000001',
                freshness: 'current',
                excerpt:
                  'LDL cholesterol was 52.3 percentage points lower than with placebo (95% confidence interval 48.8 to 55.7).',
              },
            ],
          },
        ],
      },
    ],
  }
}

function normalized(value: string): string {
  return value.toLocaleLowerCase('en-US')
}

function containsWholeTerm(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  return new RegExp(`(^|[^\\p{L}\\p{N}_])${escaped}([^\\p{L}\\p{N}_]|$)`, 'iu').test(text)
}

describe('ordinary-reader glossary contract', () => {
  it('returns only finite reviewed definitions for literal known terms', () => {
    expect(
      ordinaryReaderGlossaryEntriesForText([
        'LDL cholesterol changed by 52.3 percentage points versus placebo (95% CI).',
      ]).map((entry) => entry.id),
    ).toEqual(['ldl-cholesterol', 'placebo', 'percentage-points', 'confidence-interval'])

    expect(
      ordinaryReaderGlossaryEntriesForText([
        'An unreviewed technical expression and incidental wording appear here.',
      ]),
    ).toEqual([])
  })

  it('keeps every definition free of another glossary term', () => {
    for (const entry of ORDINARY_READER_GLOSSARY) {
      for (const other of ORDINARY_READER_GLOSSARY) {
        if (other.id === entry.id) continue
        for (const matchTerm of other.matchTerms) {
          expect(
            containsWholeTerm(normalized(entry.definition), normalized(matchTerm)),
            `${entry.id} must not require the nested term ${other.id}`,
          ).toBe(false)
        }
      }
    }
  })

  it('does not offer ordinary-reader definitions in a specialist projection', () => {
    expect(
      ordinaryReaderGlossaryEntriesForProjection({
        ...ordinaryProjection(),
        lens: 'biotech',
        label: 'Biotech researcher',
      }),
    ).toEqual([])
  })

  it('renders native, closed, touch-sized disclosures without changing the source quote', () => {
    const projection = ordinaryProjection()
    const html = renderToStaticMarkup(
      React.createElement(DossierAudienceLensSelector, { projections: [projection] }),
    )
    const exactQuote = projection.sections[0]!.records[0]!.sources[0]!.excerpt!

    expect(html).toContain('data-testid="ordinary-reader-glossary"')
    expect(html).toContain('aria-label="Explain LDL cholesterol"')
    expect(html).toContain('data-glossary-term="confidence-interval"')
    expect(html).toContain('min-h-11')
    expect(html).not.toMatch(/<details[^>]*data-glossary-entry="[^"]+"[^>]*\sopen(?:=|\s|>)/u)
    expect(html).toContain(exactQuote)
    expect(html).toContain(
      'A range that shows how precise the study’s measured answer is. A wider range means the answer is less precise.',
    )
  })
})
