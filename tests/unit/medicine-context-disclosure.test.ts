import fs from 'node:fs'
import path from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MedicineContextDisclosure } from '@/components/MedicineContextDisclosure'
import {
  collectPublicMedicineText,
  dedupePublicMedicineContextItems,
  detectPublicMedicineContextItems,
  endpointHierarchyContextItem,
  outcomeTypeContextItem,
  studyReviewContextItem,
  type PublicMedicineContextItem,
} from '@/lib/public-medicine-context'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

const primaryEndpoint = endpointHierarchyContextItem('PRIMARY')
const biomarker = outcomeTypeContextItem('BIOMARKER')

function render(items: readonly PublicMedicineContextItem[] = [primaryEndpoint, biomarker]) {
  return renderToStaticMarkup(
    React.createElement(MedicineContextDisclosure, {
      label: 'Understand the study language',
      items,
      variant: 'section',
      testId: 'study-language',
    }),
  )
}

describe('MedicineContextDisclosure', () => {
  it('uses native disclosure semantics and puts everyday wording before technical terminology', () => {
    const html = render()

    expect(html).toContain('<details')
    expect(html).toContain('<summary')
    expect(html).toContain('Understand the study language')
    expect(html).not.toContain(' open=""')
    expect(html.indexOf(primaryEndpoint.plainMeaning)).toBeLessThan(
      html.indexOf(`Technical term: ${primaryEndpoint.technicalTerm}`),
    )
    expect(html.indexOf(`Technical term: ${primaryEndpoint.technicalTerm}`)).toBeLessThan(
      html.indexOf(primaryEndpoint.definition),
    )
  })

  it('stays in normal document flow and wraps long terms on narrow screens', () => {
    const html = render([
      {
        key: 'long-term',
        plainMeaning: 'A plain explanation that can wrap',
        technicalTerm: 'EXTREMELYLONGTECHNICALIDENTIFIERWITHOUTBREAKS0123456789',
        definition: 'Stored context that can wrap safely too.',
      },
    ])

    expect(html).toContain('min-h-11')
    expect(html).toContain('min-w-0')
    expect(html).toContain('max-w-full')
    expect(html).toContain('[overflow-wrap:anywhere]')
    expect(html).not.toContain('absolute')
    expect(html).not.toContain('title=')
  })

  it('is server-renderable and has no hover-only interaction code', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'components/MedicineContextDisclosure.tsx'),
      'utf8',
    )

    expect(source).not.toMatch(/^['"]use client['"]/m)
    expect(source).not.toContain('onMouseEnter')
    expect(source).not.toContain('onPointerEnter')
    expect(source).not.toContain('useState')
  })

  it('renders nothing when there are no terms to explain', () => {
    expect(render([])).toBe('')
  })
})

describe('public medicine context mapping', () => {
  it('maps stored categories to plain meaning while preserving the technical term', () => {
    expect(endpointHierarchyContextItem('PRIMARY')).toMatchObject({
      plainMeaning: 'The study’s main planned result',
      technicalTerm: 'Primary endpoint',
    })
    expect(outcomeTypeContextItem('BIOMARKER')).toMatchObject({
      plainMeaning: 'A measurement from the body, such as a laboratory value',
      technicalTerm: 'Biomarker outcome',
    })
    expect(studyReviewContextItem('Were the groups comparable?', 'Selection bias')).toMatchObject({
      plainMeaning: 'Were the groups comparable?',
      technicalTerm: 'Selection bias',
    })
  })

  it('detects concrete medicine, statistical, and price terms conservatively', () => {
    const detected = detectPublicMedicineContextItems([
      'Inclisiran uses a GalNAc tag to reduce PCSK9 and measured LDL-C.',
      'The placebo-adjusted reduction was 52.3% (95% confidence interval; p-value 0.01).',
      'Coverage may require prior authorization and a copay.',
    ])
    const keys = detected.map(({ key }) => key)

    expect(keys).toEqual(
      expect.arrayContaining([
        'percentage-versus-placebo',
        'ldl-cholesterol',
        'pcsk9',
        'galnac',
        'placebo-adjusted',
        'confidence-interval',
        'p-value',
        'pricing-prior-authorisation',
        'pricing-copay',
      ]),
    )
    expect(keys).not.toContain('percentage')
    expect(keys).not.toContain('placebo')
    expect(detected.find(({ key }) => key === 'galnac')?.definition).toContain(
      'Liver cells recognise the tag and pull the medicine inside',
    )
    expect(detectPublicMedicineContextItems(['This sentence contains no mapped term.'])).toEqual([])
  })

  it('maps each dense Creatine evidence phrase only in its medically specific context', () => {
    const exactText =
      'One of the few supplements whose central claim survives audit — muscle creatine, phosphocreatine resynthesis and short-duration power all rise, replicated across decades — while the neuroprotection claim it is increasingly sold on failed two Phase 3 trials totalling 2,294 patients.'
    const detected = detectPublicMedicineContextItems([exactText])
    const keys = detected.map(({ key }) => key)

    expect(keys).toEqual(
      expect.arrayContaining([
        'evidence-claim-survives-audit',
        'muscle-creatine',
        'phosphocreatine-resynthesis',
        'exercise-short-duration-power',
        'evidence-replicated-across-time',
        'neuroprotection',
        'evidence-failed-two-phase-3-trials',
        'study-participant-total-2294',
      ]),
    )
    expect(keys).not.toContain('study-phase-3')
    expect(detected.find(({ key }) => key === 'muscle-creatine')).toMatchObject({
      plainMeaning: 'The amount of creatine stored inside muscle tissue',
      definition: expect.stringContaining('does not show that a person is stronger or healthier'),
    })
    expect(detected.find(({ key }) => key === 'neuroprotection')?.definition).toContain(
      'A laboratory mechanism alone does not establish that benefit in people',
    )
  })

  it('detects Phase 3 in a study-design field but rejects unrelated partial phrases', () => {
    expect(
      detectPublicMedicineContextItems([
        'Phase 3, randomised, double-blind, placebo-controlled',
      ]).map(({ key }) => key),
    ).toContain('study-phase-3')
    expect(
      detectPublicMedicineContextItems(['A treatment entered Phase III testing.']).map(
        ({ key }) => key,
      ),
    ).toContain('study-phase-3')

    const unrelated = [
      'The finance team completed an audit.',
      'A DNA sample was replicated across decades of stored records.',
      'The short-duration symptom resolved.',
      'Phosphocreatine concentration changed.',
      'The report lists Phase 3 without naming a trial.',
      'Two trials were discussed. Separately, 2,294 patients visited clinics.',
    ]
    const unrelatedKeys = detectPublicMedicineContextItems(unrelated).map(({ key }) => key)

    expect(unrelatedKeys).not.toEqual(
      expect.arrayContaining([
        'evidence-claim-survives-audit',
        'muscle-creatine',
        'phosphocreatine-resynthesis',
        'exercise-short-duration-power',
        'evidence-replicated-across-time',
        'neuroprotection',
        'evidence-failed-two-phase-3-trials',
        'study-phase-3',
        'study-participant-total-2294',
      ]),
    )
  })

  it('deduplicates equivalent technical terms, preserves order, and caps first-read lists', () => {
    const dynamicPcsk9: PublicMedicineContextItem = {
      key: 'protein:pcsk9',
      plainMeaning: 'Gene target',
      technicalTerm: 'PCSK9',
      definition: 'Duplicate dynamic definition.',
    }
    const items = detectPublicMedicineContextItems(['PCSK9 and LDL-C'])

    expect(dedupePublicMedicineContextItems([...items, dynamicPcsk9], 1)).toEqual([items[0]])
  })

  it('collects public string leaves without inventing text or looping on cycles', () => {
    const value: { summary: string; nested: Array<{ label: string }>; self?: unknown } = {
      summary: 'Stored summary',
      nested: [{ label: 'Stored label' }],
    }
    value.self = value

    expect(collectPublicMedicineText(value)).toEqual(['Stored summary', 'Stored label'])
  })
})
