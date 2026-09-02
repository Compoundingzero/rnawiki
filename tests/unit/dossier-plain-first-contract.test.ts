import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { safeStoredReaderSentence } from '@/lib/public-medicine-language'

function source(file: string): string {
  return readFileSync(join(process.cwd(), file), 'utf8')
}

describe('medicine dossier plain-first contract', () => {
  it('keeps the dense inclisiran example and technical result notation out of the first read', () => {
    const denseInclisiranResult =
      'A GalNAc-tagged siRNA that makes liver cells destroy their own PCSK9 messenger RNA cut LDL cholesterol by 52.3% and 49.9% against placebo at day 510 in ORION-10 and ORION-11.'

    expect(safeStoredReaderSentence(denseInclisiranResult)).toBeUndefined()
    expect(
      safeStoredReaderSentence('A GalNAc tag carries this medicine into liver cells.'),
    ).toBeUndefined()
    expect(
      safeStoredReaderSentence('An siRNA lowers a measurement made by liver cells.'),
    ).toBeUndefined()
    expect(
      safeStoredReaderSentence(
        'NCT03399370 reported a 51% reduction compared with placebo after 510 days.',
      ),
    ).toBeUndefined()
    expect(
      safeStoredReaderSentence(
        'The result was 51% lower compared with placebo after 510 days (P<0.001).',
      ),
    ).toBeUndefined()
    expect(
      safeStoredReaderSentence(
        'PCSK9 was 51% lower compared with the inactive treatment after 510 days.',
      ),
    ).toBeUndefined()
  })

  it('requires both a comparison and a time point before one result magnitude can lead', () => {
    const complete =
      'The blood measurement was 51% lower compared with the inactive treatment after 510 days.'
    const completeThanWith =
      'The blood measurement was 51 percentage points lower with the medicine than with the inactive treatment after 510 days.'

    expect(safeStoredReaderSentence(complete)).toBe(complete)
    expect(safeStoredReaderSentence(completeThanWith)).toBe(completeThanWith)
    expect(
      safeStoredReaderSentence(
        'The blood measurement was 51% lower compared with the inactive treatment.',
      ),
    ).toBeUndefined()
    expect(
      safeStoredReaderSentence('The blood measurement was 51% lower after 510 days.'),
    ).toBeUndefined()
    expect(
      safeStoredReaderSentence(
        'The blood measurement was 51% lower than the inactive treatment after 510 days.',
      ),
    ).toBeUndefined()
    expect(
      safeStoredReaderSentence(
        'The blood measurement was 51% lower and another result was 49% lower compared with the inactive treatment after 510 days.',
      ),
    ).toBeUndefined()
  })

  it('allows the PCSK9 name only when the same first-read sentence explains it plainly', () => {
    const nameFirst =
      'PCSK9, a protein that raises LDL cholesterol, was 51% lower compared with the inactive treatment after 510 days.'
    const plainFirst =
      'A protein called PCSK9 that raises LDL cholesterol was 51% lower compared with the inactive treatment after 510 days.'

    expect(safeStoredReaderSentence(nameFirst)).toBe(nameFirst)
    expect(safeStoredReaderSentence(plainFirst)).toBe(plainFirst)
    expect(
      safeStoredReaderSentence(
        'The PCSK9 protein was 51% lower compared with the inactive treatment after 510 days.',
      ),
    ).toBeUndefined()
  })

  it('specifies medicine-wide background as a sibling, not evidence for the conclusion', () => {
    const specification = source('docs/dossier-v2-product-spec.md').replace(/\s+/g, ' ')

    expect(specification).toContain('A separate collapsed **More about this medicine** section')
    expect(specification).toContain(
      'It is a sibling of the evidence disclosure, not part of the proof for the selected reviewed answer.',
    )
    expect(specification).toContain(
      'none is used to construct or support a reviewed answer for one specific use',
    )
  })

  it('binds the completeness states to the sources read rather than to the medicine', () => {
    const specification = source('docs/dossier-v2-product-spec.md').replace(/\s+/g, ' ')

    expect(specification).toContain('## Record completeness')
    expect(specification).toContain(
      '**A state describes the sources that were read, never the medicine.**',
    )
    expect(specification).toContain('**No record is shown in relation to another record.**')
    expect(specification).toContain('It never names, counts or links the other records')
  })

  it('keeps direct evidence hashes keyboard-usable after opening the disclosure', () => {
    const disclosure = source('components/AdvancedEvidenceDisclosure.tsx')
    const nestedDisclosure = source('components/dossier/disclosure-deep-link.ts')

    expect(disclosure).toContain("window.addEventListener('hashchange', openForCurrentHash)")
    expect(disclosure).toContain('details.contains(target)')
    expect(disclosure).toContain('details.open = true')
    expect(disclosure).toContain('window.requestAnimationFrame')
    expect(disclosure).toContain('focusDisclosureTarget(details, target)')
    expect(disclosure).toContain("target.scrollIntoView({ block: 'start' })")
    expect(nestedDisclosure).toContain('while (nested && nested !== outerDetails')
    expect(nestedDisclosure).toContain('nested.open = true')
    expect(nestedDisclosure).toContain("':scope > summary'")
    expect(nestedDisclosure).toContain('focusTarget.focus({ preventScroll: true })')
  })

  it('keeps medicine-background hashes keyboard-usable after opening the sibling disclosure', () => {
    const disclosure = source('components/MedicineBackgroundDisclosure.tsx')
    const nestedDisclosure = source('components/dossier/disclosure-deep-link.ts')

    expect(disclosure).toContain("window.addEventListener('hashchange', openForHash)")
    expect(disclosure).toContain('details.contains(target)')
    expect(disclosure).toContain('details.open = true')
    expect(disclosure).toContain('window.requestAnimationFrame')
    expect(disclosure).toContain('focusDisclosureTarget(details, target)')
    expect(disclosure).toContain("target.scrollIntoView({ block: 'start' })")
    expect(nestedDisclosure).toContain('nearestSummary ??= directSummary(nested)')
    expect(nestedDisclosure).toContain('nested.open = true')
  })
})
