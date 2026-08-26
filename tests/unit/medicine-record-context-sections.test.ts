import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  hasMedicineRecordContext,
  MedicineRecordContextSections,
} from '@/components/MedicineRecordContextSections'
import type { MedicineRecordContextView } from '@/lib/medicine-dossier-view-model'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

const boundary =
  'This is general background. It may cover information beyond the selected use and is not part of the reviewed answer above.'

function renderContext(context: MedicineRecordContextView): string {
  return renderToStaticMarkup(
    React.createElement(MedicineRecordContextSections, {
      bindingState: 'legacy_record',
      context,
      contextItems: [],
    }),
  )
}

function fullContext(): MedicineRecordContextView {
  return {
    condition: {
      conditionExplainer: 'A stored explanation of the condition.',
      whyItMatters: 'A stored explanation of why it matters.',
      whoWasApprovedOrStudied: 'The people described in the stored record.',
      studyOrLabelGoal: 'The question the stored record says researchers asked.',
    },
    safetyAndAdministration: {
      administrationAndDosing: 'Stored general administration wording.',
      safetyInformation: 'Stored general safety wording.',
      deliveryForm: 'Stored technical delivery name.',
    },
    alternativesSummary: 'Stored treatment-context summary.',
    conventionalAlternatives: [
      {
        name: 'Recorded medical treatment',
        comparison: 'Stored comparison wording.',
        reportedCost: 'DO-NOT-RENDER-ALTERNATIVE-COST',
        tradeoffs: 'Stored differences and limits.',
      },
    ],
    foodSupplementContext: [
      {
        name: 'Zinc entry',
        recordedEvidenceLabel: 'Recorded label Z',
        sourceStatus: 'not_linked',
        activeCompound: 'DO-NOT-RENDER-ACTIVE-COMPOUND',
        mechanism: 'DO-NOT-RENDER-MECHANISM',
        dailyUsage: 'DO-NOT-RENDER-DAILY-USAGE',
        monthlyCost: 'DO-NOT-RENDER-MONTHLY-COST',
        homeRemedies: 'DO-NOT-RENDER-HOME-REMEDY',
      } as unknown as NonNullable<MedicineRecordContextView['foodSupplementContext']>[number],
      {
        name: 'Apple pectin entry',
        recordedEvidenceLabel: 'Recorded label A',
        sourceStatus: 'not_linked',
      },
    ],
    pricing: {
      reportedRetailOrListPrice: 'Stored price context.',
      reportedComparison: 'DO-NOT-RENDER-UNBOUND-COMPARISON',
      manufacturingComplexity: 'DO-NOT-RENDER-UNBOUND-COMPLEXITY',
      recordNote: 'DO-NOT-RENDER-UNBOUND-PRICE-NOTE',
      sources: [
        {
          label: 'Stored public price source',
          identifier: 'price-source-1',
          href: 'https://example.test/price-source-1',
        },
      ],
      reports: [
        {
          kind: 'reported_retail_or_list_price',
          value: 'Stored price context.',
          source: {
            label: 'Stored public price source',
            identifier: 'price-source-1',
            href: 'https://example.test/price-source-1',
          },
        },
      ],
    },
    commonQuestions: [{ question: 'A stored common question?', answer: 'A stored common answer.' }],
    molecular: {
      format: 'A stored molecular format',
      structureCheck: 'passed',
      identifiers: [
        {
          label: 'Genetic instruction sequence',
          value: 'ACGTACGTACGTACGT',
          kind: 'nucleotide_sequence',
        },
        {
          label: 'Structure string',
          value: 'C1=CC=CC=C1',
          kind: 'smiles',
        },
        { label: 'Chemical formula', value: 'C6H6', kind: 'formula' },
      ],
      laboratoryWorkflow: 'DO-NOT-RENDER-LAB-WORKFLOW',
    } as unknown as MedicineRecordContextView['molecular'],
    communityNotes: [],
  }
}

/** Focused contract tests for the closed-by-default, medicine-wide background layer. */
describe('MedicineRecordContextSections', () => {
  it('renders one quiet disclosure list in the required reader order', () => {
    const html = renderContext(fullContext())
    const orderedIds = [
      'why-developed',
      'safety-and-administration',
      'other-approaches',
      'food-and-supplement-context',
      'cost-context',
      'common-questions',
      'molecular-record',
    ]

    let previous = -1
    for (const id of orderedIds) {
      const index = html.indexOf(`id="${id}"`)
      expect(index).toBeGreaterThan(previous)
      previous = index
    }

    expect(html.match(/group\/record-row/g)).toHaveLength(7)
    expect(html).not.toMatch(/<details[^>]*group\/record-row[^>]*open/)
    expect(html).toContain('min-h-14')
    expect(html).toContain('focus-visible:ring-2')
    expect(html).not.toContain('sm:grid-cols-2')
  })

  it('shows the general-background boundary once and gives safety a useful preview', () => {
    const html = renderContext(fullContext())

    expect(html.split(boundary)).toHaveLength(2)
    expect(html).toContain(
      'How it is given and the important safety information stored with this record.',
    )
    expect(html).toContain('How it is given')
    expect(html).toContain('Important safety information')
    expect(html).toContain('Technical delivery name')
  })

  it('renders only neutral, alphabetized food and supplement fields', () => {
    const html = renderContext(fullContext())

    expect(html.indexOf('Apple pectin entry')).toBeLessThan(html.indexOf('Zinc entry'))
    expect(html).toContain('Recorded label A')
    expect(html).toContain('Recorded label Z')
    expect(html.match(/Source not yet linked/g)).toHaveLength(2)
    expect(html).toContain('not treatment recommendations')
    expect(html).toContain('not provide complete safety or source context')
    expect(html).not.toMatch(
      /DO-NOT-RENDER-(ACTIVE-COMPOUND|MECHANISM|DAILY-USAGE|MONTHLY-COST|HOME-REMEDY)/,
    )
  })

  it('keeps identity data while omitting shopping and laboratory-workflow fields', () => {
    const html = renderContext(fullContext())

    expect(html).toContain('ACGTACGTACGTACGT')
    expect(html).toContain('C1=CC=CC=C1')
    expect(html).toContain('C6H6')
    expect(html).toContain('internally consistent')
    expect(html).toContain('does not show whether the medicine works or is safe')
    expect(html).toContain('Laboratory and manufacturing instructions are not displayed here')
    expect(html).not.toContain('DO-NOT-RENDER-ALTERNATIVE-COST')
    expect(html).not.toContain('DO-NOT-RENDER-LAB-WORKFLOW')
  })

  it('shows only field-specific sourced cost reports and never borrows a nearby source', () => {
    const html = renderContext(fullContext())

    expect(html).toContain('Stored price context.')
    expect(html).toContain('Stored public price source')
    expect(html).toContain('does not show a regional comparison unless')
    expect(html).not.toMatch(/DO-NOT-RENDER-UNBOUND-(COMPARISON|COMPLEXITY|PRICE-NOTE)/)

    const context = fullContext()
    context.pricing = {
      reportedRetailOrListPrice: 'A price with only a generic nearby source.',
      sources: [{ label: 'A generic nearby source' }],
      reports: [],
    }
    expect(hasMedicineRecordContext(context)).toBe(true)
    expect(renderContext(context)).not.toContain('id="cost-context"')
  })

  it('treats safe food or supplement context as enough to show the background disclosure', () => {
    const context: MedicineRecordContextView = {
      conventionalAlternatives: [],
      foodSupplementContext: [{ name: 'Stored food entry', sourceStatus: 'not_linked' }],
      commonQuestions: [],
      communityNotes: [],
    }

    expect(hasMedicineRecordContext(context)).toBe(true)
    expect(renderContext(context)).toContain('Foods and supplements mentioned in this record')

    expect(
      hasMedicineRecordContext({
        conventionalAlternatives: [],
        foodSupplementContext: [],
        commonQuestions: [],
        communityNotes: [],
      }),
    ).toBe(false)
  })
})
