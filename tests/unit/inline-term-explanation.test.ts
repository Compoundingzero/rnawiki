import fs from 'node:fs'
import path from 'node:path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AnnotatedMedicineText } from '@/components/AnnotatedMedicineText'
import { InlineTermExplanation, PlainLanguageText } from '@/components/InlineTermExplanation'
import {
  annotateMedicineText,
  medicineTextContextMatches,
  type AnnotatedMedicineTextPart,
  type MedicineTextContextMatch,
} from '@/lib/annotated-medicine-text'
import {
  COMMON_PUBLIC_MEDICINE_CONTEXT,
  detectPublicMedicineContextItems,
  publicMedicineStudyDayContextItems,
  type PublicMedicineContextItem,
} from '@/lib/public-medicine-context'
import { buildLegacyReaderSummary } from '@/lib/public-medicine-language'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

const placebo: PublicMedicineContextItem = {
  key: 'placebo',
  plainMeaning: 'An inactive comparison treatment',
  technicalTerm: 'Placebo',
  definition:
    'It looks like the treatment being studied but does not contain that active treatment.',
}

const ldl: PublicMedicineContextItem = {
  key: 'ldl',
  plainMeaning: 'A blood measurement often called bad cholesterol',
  technicalTerm: 'LDL cholesterol (LDL-C)',
  definition: 'Higher levels can contribute to fatty build-up in arteries.',
}

const rna: PublicMedicineContextItem = {
  key: 'rna',
  plainMeaning: 'A molecule cells use to carry or control genetic instructions',
  technicalTerm: 'RNA',
  definition: 'Cells use it as a working copy or control signal.',
}

function visiblePartText(parts: readonly AnnotatedMedicineTextPart[]) {
  return parts.map((part) => (typeof part === 'string' ? part : part.text)).join('')
}

describe('annotateMedicineText', () => {
  it('preserves every character while annotating only explicit whole-term aliases', () => {
    const text = 'Placebo was compared with LDL-C; LDLR and siRNA stayed unmarked.'
    const contexts: MedicineTextContextMatch[] = [
      { context: placebo, matchTerms: ['placebo'] },
      { context: ldl, matchTerms: ['LDL', 'LDL-C'] },
      { context: rna, matchTerms: ['RNA'] },
    ]
    const parts = annotateMedicineText(text, contexts)
    const explained = parts.filter((part) => typeof part !== 'string')

    expect(visiblePartText(parts)).toBe(text)
    expect(explained.map((part) => part.text)).toEqual(['Placebo', 'LDL-C'])
    expect(explained.map((part) => part.context.key)).toEqual(['placebo', 'ldl'])
  })

  it('prefers the longest alias at the same position and explains a context only once', () => {
    const parts = annotateMedicineText('LDL-C changed, while later LDL-C did not.', [
      { context: ldl, matchTerms: ['LDL', 'LDL-C'] },
    ])
    const explained = parts.filter((part) => typeof part !== 'string')

    expect(explained).toHaveLength(1)
    expect(explained[0]).toMatchObject({ text: 'LDL-C', context: ldl })
    expect(visiblePartText(parts)).toBe('LDL-C changed, while later LDL-C did not.')
  })

  it('uses the complete technical term as the conservative default match', () => {
    expect(annotateMedicineText('Placebo and placebo were named.', [{ context: placebo }])).toEqual(
      [expect.objectContaining({ text: 'Placebo', context: placebo }), ' and placebo were named.'],
    )
    expect(annotateMedicineText('No mapped language.', [{ context: placebo }])).toEqual([
      'No mapped language.',
    ])
    expect(annotateMedicineText('', [{ context: placebo }])).toEqual([])
  })

  it('binds familiar aliases and exact study numbers without changing the sentence', () => {
    const text =
      'LDL (“bad”) cholesterol fell by about half compared with a dummy treatment after about 17 months.'
    const contexts = detectPublicMedicineContextItems([text])
    const parts = annotateMedicineText(text, medicineTextContextMatches(text, contexts))
    const explained = parts.filter((part) => typeof part !== 'string')

    expect(visiblePartText(parts)).toBe(text)
    expect(explained.map((part) => part.text)).toEqual([
      'LDL (“bad”) cholesterol',
      'about half',
      'dummy treatment',
    ])
  })

  it('explains an NCT registry number and a study day as identifiers rather than results', () => {
    const text = 'NCT03399370 measured the result at day 510.'
    const contexts = detectPublicMedicineContextItems([text])
    const matches = medicineTextContextMatches(text, [
      COMMON_PUBLIC_MEDICINE_CONTEXT.studyIdentifier,
      ...contexts,
    ])
    const explained = annotateMedicineText(text, matches).filter((part) => typeof part !== 'string')

    expect(explained.map((part) => part.text)).toEqual(['NCT03399370', 'day 510'])
    expect(contexts.find((context) => context.key === 'study-day-510')).toMatchObject({
      plainMeaning: '510 days after the study started — about 17 months',
    })
  })

  it('uses the comparison-specific number explanation for both real first-read phrasings', () => {
    for (const [text, expectedKey] of [
      [
        'In two large studies, LDL cholesterol fell by about half compared with people given a dummy treatment after about 17 months.',
        'percentage-versus-placebo',
      ],
      [
        'After 510 days, the average percentage change in LDL cholesterol was 52.3 percentage points lower with inclisiran than with a dummy treatment.',
        'percentage-points-versus-placebo',
      ],
    ] as const) {
      const contexts = detectPublicMedicineContextItems([text])
      const explained = annotateMedicineText(
        text,
        medicineTextContextMatches(text, contexts),
      ).filter((part) => typeof part !== 'string')
      const number = explained.find(
        (part) => part.text === 'about half' || part.text === '52.3 percentage points',
      )

      expect(contexts.map((context) => context.key)).toContain(expectedKey)
      expect(contexts.map((context) => context.key)).not.toContain('percentage')
      expect(number?.context.key).toBe(expectedKey)
      expect(explained.find((part) => part.text === 'dummy treatment')?.context.key).toBe('placebo')
    }
  })

  it('does not leak a result comparison definition into safety rates or a standalone change', () => {
    const result =
      'LDL cholesterol fell by about half compared with a dummy treatment after about 17 months.'
    const safety =
      'Injection-site reactions occurred in 2.6% and 4.7% of people given the medicine, compared with 0.9% and 0.5% given a dummy treatment.'
    const protein = 'PCSK9 fell by 60.6%.'
    const dossierContexts = detectPublicMedicineContextItems([result, safety, protein])

    const resultNumber = annotateMedicineText(
      result,
      medicineTextContextMatches(result, dossierContexts),
    ).find((part) => typeof part !== 'string' && part.text === 'about half')
    const safetyNumber = annotateMedicineText(
      safety,
      medicineTextContextMatches(safety, dossierContexts),
    ).find((part) => typeof part !== 'string' && part.text === '2.6% and 4.7%')
    const proteinNumber = annotateMedicineText(
      protein,
      medicineTextContextMatches(protein, dossierContexts),
    ).find((part) => typeof part !== 'string' && part.text === '60.6%')

    expect(resultNumber).toMatchObject({ context: { key: 'percentage-versus-placebo' } })
    expect(safetyNumber).toMatchObject({ context: { key: 'percentage' } })
    expect(proteinNumber).toMatchObject({ context: { key: 'percentage' } })
  })

  it('explains “after 510 days” on the number of days itself', () => {
    const text = 'After 510 days, researchers measured LDL cholesterol.'
    const contexts = detectPublicMedicineContextItems([text])
    const explained = annotateMedicineText(text, medicineTextContextMatches(text, contexts)).filter(
      (part) => typeof part !== 'string',
    )

    expect(explained.find((part) => part.text === '510 days')?.context).toMatchObject({
      key: 'study-day-510',
      plainMeaning: '510 days after the study started — about 17 months',
    })
  })

  it('does not mistake dosing days for result-measurement days', () => {
    const dosing = 'One injection under the skin on day 1, at month 3, and then every 6 months.'
    const dosingBesideResult =
      'The goal is about a 50% drop in LDL cholesterol, with injections on day 1, at month 3, and then every 6 months.'
    for (const text of [dosing, dosingBesideResult]) {
      expect(detectPublicMedicineContextItems([text]).map((context) => context.key)).not.toContain(
        'study-day-1',
      )
    }

    expect(publicMedicineStudyDayContextItems('Day 1')[0]).toMatchObject({
      key: 'study-day-1',
      plainMeaning: '1 day after the study started',
      definition: expect.stringContaining('this result was measured 1 day later'),
    })
  })

  it('explains a technical delivery name term by term', () => {
    const text = 'GalNAc-conjugated siRNA, subcutaneous prefilled syringe'
    const contexts = detectPublicMedicineContextItems([text])
    const explained = annotateMedicineText(text, medicineTextContextMatches(text, contexts)).filter(
      (part) => typeof part !== 'string',
    )

    expect(explained.map((part) => [part.text, part.context.key])).toEqual([
      ['GalNAc', 'galnac'],
      ['siRNA', 'sirna'],
      ['subcutaneous', 'route-subcutaneous'],
    ])
  })

  it('explains percentage points and uncertainty ranges inside professional result detail', () => {
    const text =
      'The difference between groups could be 48.8 to 55.7 percentage points lower (95% confidence interval).'
    const contexts = detectPublicMedicineContextItems([text])
    const explained = annotateMedicineText(text, medicineTextContextMatches(text, contexts)).filter(
      (part) => typeof part !== 'string',
    )

    expect(explained.map((part) => [part.text, part.context.key])).toEqual([
      ['48.8 to 55.7 percentage points', 'percentage-points'],
      ['95% confidence interval', 'confidence-interval'],
    ])
  })

  it('gives every unfamiliar idea in the original dense example its own local explanation', () => {
    const exactText =
      'A GalNAc-tagged siRNA that makes liver cells destroy their own PCSK9 messenger RNA, cutting LDL cholesterol by 52.3% and 49.9% against placebo at day 510 in ORION-10 and ORION-11 — a blood measurement, not yet a demonstrated reduction in heart attacks.'
    const summary = buildLegacyReaderSummary({
      medicineName: 'Inclisiran',
      modality: 'siRNA (Small Interfering RNA)',
      targetProtein: 'PCSK9',
      trialIdentifiers: ['ORION-10 (NCT03399370)', 'ORION-11 (NCT03400800)'],
      selectedUse: 'Adults with high LDL cholesterol',
      measuredFinding:
        'In two large studies, inclisiran lowered LDL cholesterol by about half compared with a dummy treatment after about 17 months.',
      mainUncertainty:
        'The studies did not show whether inclisiran prevents heart attacks or strokes.',
      exactText,
    })
    const explained = annotateMedicineText(
      exactText,
      medicineTextContextMatches(exactText, summary.terms),
    ).filter((part) => typeof part !== 'string')

    expect(
      visiblePartText(
        annotateMedicineText(exactText, medicineTextContextMatches(exactText, summary.terms)),
      ),
    ).toBe(exactText)
    expect(explained.map((part) => part.text)).toEqual([
      'GalNAc',
      'siRNA',
      'PCSK9',
      'messenger RNA',
      'LDL cholesterol',
      '52.3% and 49.9%',
      'placebo',
      'day 510',
      'ORION-10',
      'ORION-11',
    ])
  })

  it('explains the complete stored Creatine verdict without changing or fragmenting it', () => {
    const exactText =
      'One of the few supplements whose central claim survives audit — muscle creatine, phosphocreatine resynthesis and short-duration power all rise, replicated across decades — while the neuroprotection claim it is increasingly sold on failed two Phase 3 trials totalling 2,294 patients.'
    const measuredFinding =
      'Muscle biopsies before and after showed that swallowed creatine really does end up inside muscle, and that people with the least to begin with gained the most.'
    const summary = buildLegacyReaderSummary({
      medicineName: 'Creatine monohydrate',
      modality: 'Nutraceutical / Botanical',
      selectedUse: 'Strength and power during short, hard efforts',
      measuredFinding,
      exactText,
    })
    const parts = annotateMedicineText(
      exactText,
      medicineTextContextMatches(exactText, summary.terms),
    )
    const explained = parts.filter((part) => typeof part !== 'string')

    expect(summary.takeaway).toBe(measuredFinding)
    expect(visiblePartText(parts)).toBe(exactText)
    expect(explained.map((part) => [part.text, part.context.key])).toEqual([
      ['central claim survives audit', 'evidence-claim-survives-audit'],
      ['muscle creatine', 'muscle-creatine'],
      ['phosphocreatine resynthesis', 'phosphocreatine-resynthesis'],
      ['short-duration power', 'exercise-short-duration-power'],
      ['replicated across decades', 'evidence-replicated-across-time'],
      ['neuroprotection', 'neuroprotection'],
      ['failed two Phase 3 trials', 'evidence-failed-two-phase-3-trials'],
      ['2,294 patients', 'study-participant-total-2294'],
    ])
    expect(
      explained.find((part) => part.context.key === 'evidence-claim-survives-audit')?.context
        .definition,
    ).toContain('not a financial audit')
    expect(
      explained.find((part) => part.context.key === 'evidence-failed-two-phase-3-trials')?.context
        .definition,
    ).toContain('does not mean the studies were badly designed')
    expect(
      explained.find((part) => part.context.key === 'evidence-replicated-across-time')?.context
        .definition,
    ).toContain('does not mean every study was independent or identical')
    expect(
      explained.find((part) => part.context.key === 'study-participant-total-2294')?.context
        .definition,
    ).toContain('not the number who benefited')
  })

  it('lets complete evidence phrases win over unsafe generic substring meanings', () => {
    const text =
      'The central claim survives audit: muscle creatine rose, replicated across decades, but the claim failed two Phase 3 trials.'
    const genericContexts: PublicMedicineContextItem[] = [
      {
        key: 'generic-audit',
        plainMeaning: 'Generic audit meaning',
        technicalTerm: 'audit',
        definition: 'This deliberately broad test definition must not be selected.',
      },
      {
        key: 'generic-creatine',
        plainMeaning: 'Generic creatine meaning',
        technicalTerm: 'creatine',
        definition: 'This deliberately broad test definition must not be selected.',
      },
      {
        key: 'generic-replicated',
        plainMeaning: 'Generic replicated meaning',
        technicalTerm: 'replicated',
        definition: 'This deliberately broad test definition must not be selected.',
      },
      {
        key: 'generic-failed',
        plainMeaning: 'Generic failed meaning',
        technicalTerm: 'failed',
        definition: 'This deliberately broad test definition must not be selected.',
      },
      {
        key: 'generic-phase-3',
        plainMeaning: 'Generic phase meaning',
        technicalTerm: 'Phase 3',
        definition: 'This deliberately broad test definition must not be selected.',
      },
      {
        key: 'generic-trials',
        plainMeaning: 'Generic trials meaning',
        technicalTerm: 'trials',
        definition: 'This deliberately broad test definition must not be selected.',
      },
    ]
    const explained = annotateMedicineText(
      text,
      medicineTextContextMatches(text, genericContexts),
    ).filter((part) => typeof part !== 'string')

    expect(explained.map((part) => [part.text, part.context.key])).toEqual([
      ['central claim survives audit', 'evidence-claim-survives-audit'],
      ['muscle creatine', 'muscle-creatine'],
      ['replicated across decades', 'evidence-replicated-across-time'],
      ['failed two Phase 3 trials', 'evidence-failed-two-phase-3-trials'],
    ])
    expect(explained.map((part) => part.context.key)).not.toEqual(
      expect.arrayContaining(genericContexts.map((context) => context.key)),
    )
  })

  it('annotates bare Phase 3 in a study-design string without expanding beyond those words', () => {
    for (const text of [
      'Phase 3, randomised, double-blind, placebo-controlled',
      'Phase III, multicentre, active-controlled',
    ]) {
      const contexts = detectPublicMedicineContextItems([text])
      const parts = annotateMedicineText(text, medicineTextContextMatches(text, contexts))
      const phase = parts.find(
        (part) => typeof part !== 'string' && part.context.key === 'study-phase-3',
      )

      expect(visiblePartText(parts)).toBe(text)
      expect(phase).toMatchObject({ text: expect.stringMatching(/^Phase (?:3|III)$/u) })
    }
  })
})

describe('inline medicine explanations', () => {
  it('server-renders real controls, assistive context, and a no-JavaScript fallback', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        InlineTermExplanation,
        { context: placebo } as React.ComponentProps<typeof InlineTermExplanation>,
        'dummy treatment',
      ),
    )

    expect(html).toContain('<button type="button"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-controls=')
    expect(html).toContain('aria-describedby=')
    expect(html).toContain('role="tooltip"')
    expect(html).toContain('<noscript>')
    expect(html).toContain(placebo.plainMeaning)
    expect(html).toContain(placebo.technicalTerm)
    expect(html).toContain(placebo.definition)
    expect(html).not.toContain('title=')
  })

  it('uses one quiet, content-width in-flow explanation after all phrases in a sentence', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlainLanguageText, {
        parts: [
          'Compared with ',
          { text: 'a dummy treatment', context: placebo },
          ', ',
          { text: 'bad cholesterol', context: ldl },
          ' fell.',
        ],
      }),
    )

    expect(html.match(/role="tooltip"/g)).toHaveLength(1)
    expect(html.match(/<button type="button"/g)).toHaveLength(2)
    expect(html.indexOf('bad cholesterol')).toBeLessThan(html.indexOf('role="tooltip"'))
    expect(html).toContain('data-inline-term-panel=""')
    expect(html).toContain('w-fit')
    expect(html).toContain('max-w-full')
    expect(html).toContain('[overflow-wrap:anywhere]')
    expect(html).toContain('text-sm')
    expect(html).not.toMatch(/class="[^"]*\sw-full(?:\s|\")/)
    expect(html).not.toMatch(/\bfixed\b/)
    expect(html).not.toContain('rounded-[16px]')
    expect(html).not.toContain('shadow-[0_8px_24px')
  })

  it('renders exact stored wording through AnnotatedMedicineText', () => {
    const text = 'Compared with placebo, LDL-C fell.'
    const html = renderToStaticMarkup(
      React.createElement(AnnotatedMedicineText, {
        text,
        contexts: [
          { context: placebo, matchTerms: ['placebo'] },
          { context: ldl, matchTerms: ['LDL-C'] },
        ],
      }),
    )

    expect(html).toContain('Compared with ')
    expect(html).toContain('placebo')
    expect(html).toContain(', ')
    expect(html).toContain('LDL-C')
    expect(html).toContain(' fell.')
  })

  it('contains the pointer, focus, tap, outside-press, and Escape interaction paths', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'components/InlineTermExplanation.tsx'),
      'utf8',
    )

    expect(source).toContain('onPointerEnter')
    expect(source).toContain('In technical writing')
    expect(source).toContain("window.matchMedia('(pointer: coarse)')")
    expect(source).toContain("panel.scrollIntoView({ behavior: 'auto', block: 'nearest' })")
    expect(source).toContain("event.pointerType !== 'touch'")
    expect(source).toContain('onFocus')
    expect(source).toContain('onClick')
    expect(source).toContain("active?.reason === 'pinned'")
    expect(source).toContain("event.key === 'Escape'")
    expect(source).toContain("document.addEventListener('pointerdown'")
    expect(source).toContain('openInlineTermController')
    expect(source).toContain('event.composedPath()')
  })

  it('subscribes to outside press and Escape only while an explanation is active', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'components/InlineTermExplanation.tsx'),
      'utf8',
    )

    expect(source).toContain('if (!enabled || !active) return')
    expect(source).not.toContain('new CustomEvent')
    expect(source).not.toContain('document.dispatchEvent')
  })
})
