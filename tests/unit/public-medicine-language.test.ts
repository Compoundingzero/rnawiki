import { describe, expect, it } from 'vitest'

import {
  buildLegacyReaderSummary,
  buildPublishedProgrammeReaderSummary,
  buildUnpublishedProgrammeReaderSummary,
  publicApprovalStatusLabel,
  publicMedicineTypeLabel,
  safeStoredReaderSentence,
} from '@/lib/public-medicine-language'
import { APPROVAL_STATUSES, DRUG_MODALITIES } from '@/lib/types'

describe('reader-facing medicine vocabulary', () => {
  it('gives every stored medicine type a short first-glance label without abbreviations', () => {
    for (const type of DRUG_MODALITIES) {
      expect(publicMedicineTypeLabel(type)).not.toBe(type)
      expect(publicMedicineTypeLabel(type)).not.toMatch(/[()]/)
    }

    expect(publicMedicineTypeLabel('siRNA (Small Interfering RNA)')).toBe('RNA-silencing medicine')
    expect(publicMedicineTypeLabel('ASO (Antisense Oligonucleotide)')).toBe(
      'Gene-silencing medicine',
    )
    expect(publicMedicineTypeLabel('Monoclonal Antibody (mAb)')).toBe('Antibody medicine')
  })

  it('makes jurisdiction, trial phase, and lack of approval explicit for every status', () => {
    for (const status of APPROVAL_STATUSES) {
      expect(publicApprovalStatusLabel(status)).not.toBe(status)
    }

    expect(publicApprovalStatusLabel('FDA Approved')).toContain('United States')
    expect(publicApprovalStatusLabel('EMA Approved')).toContain('European Union')
    expect(publicApprovalStatusLabel('Controlled / No Approved Use')).toContain(
      'no approved US use',
    )
    expect(publicApprovalStatusLabel('Non-FDA / Dietary Supplement')).toContain('not FDA-approved')
    expect(publicApprovalStatusLabel('Accelerated Approval')).toContain(
      'follow-up evidence may be required',
    )
  })

  it('keeps an unknown future value off the first screen until plain copy is added', () => {
    expect(publicMedicineTypeLabel('Future medicine type')).toBe('Other recorded medicine type')
    expect(publicApprovalStatusLabel('Future status')).toBe('Other recorded medicine status')
  })

  it('selects only a complete stored sentence inside the first-read word budget', () => {
    expect(
      safeStoredReaderSentence(
        'The measured blood result fell by about half. Whether that prevents heart attacks is still unknown.',
      ),
    ).toBe('The measured blood result fell by about half.')
    expect(safeStoredReaderSentence('A complete recorded result without final punctuation')).toBe(
      'A complete recorded result without final punctuation',
    )
    expect(safeStoredReaderSentence('A result measured in')).toBeUndefined()

    const overLimit = `${Array.from({ length: 41 }, () => 'word').join(' ')}.`
    expect(safeStoredReaderSentence(overLimit)).toBeUndefined()
    expect(safeStoredReaderSentence('One complete result.', 0)).toBeUndefined()
  })

  it('keeps dense statistical and molecular detail out of the first read', () => {
    expect(
      safeStoredReaderSentence(
        'A GalNAc-tagged siRNA changed PCSK9 messenger RNA, lowering LDL by 52.3% and 49.9% against placebo at day 510.',
      ),
    ).toBeUndefined()
    expect(
      safeStoredReaderSentence(
        'The blood measurement was 51% lower compared with the inactive treatment after 510 days.',
      ),
    ).toBe(
      'The blood measurement was 51% lower compared with the inactive treatment after 510 days.',
    )
    expect(
      safeStoredReaderSentence(
        'The blood measurement was 52.3% lower in one study and 49.9% lower in another compared with the inactive treatment after 510 days.',
      ),
    ).toBeUndefined()
    expect(
      safeStoredReaderSentence(
        'The study reported a difference at day 510 (P<0.001; 95% CI 48 to 55).',
      ),
    ).toBeUndefined()
    expect(
      safeStoredReaderSentence('NCT03399370 reported its main result after 510 days.'),
    ).toBeUndefined()
    expect(
      safeStoredReaderSentence(
        'The result was 20%, 30%, and 40% lower compared with placebo after one year.',
      ),
    ).toBeUndefined()
  })

  it('accepts an explicit “than with” comparison only when its result and time are complete', () => {
    const complete =
      'After 510 days, the average percentage change in the blood measurement was 52.3 percentage points lower with the medicine than with the inactive treatment.'

    expect(safeStoredReaderSentence(complete)).toBe(complete)
    expect(
      safeStoredReaderSentence(
        'After 510 days, the average percentage change in the blood measurement was 52.3 percentage points lower than the inactive treatment.',
      ),
    ).toBeUndefined()
    expect(
      safeStoredReaderSentence(
        'The average percentage change in the blood measurement was 52.3 percentage points lower with the medicine than with the inactive treatment.',
      ),
    ).toBeUndefined()
  })

  it('assembles a short legacy first read without rewriting the stored finding', () => {
    const exactText =
      'A GalNAc-tagged siRNA changes PCSK9 messenger RNA and produced 52.3% and 49.9% results against placebo at day 510 in ORION-10 and ORION-11, with further technical qualifications in the exact record.'
    const measuredFinding =
      'The LDL cholesterol measurement fell by about half compared with placebo in ORION-10 and ORION-11.'
    const summary = buildLegacyReaderSummary({
      medicineName: 'Inclisiran',
      modality: 'siRNA (Small Interfering RNA)',
      targetGene: 'PCSK9',
      targetProtein: 'Proprotein convertase subtilisin/kexin type 9',
      trialIdentifiers: ['ORION-10 (NCT03399370)', 'ORION-11 (NCT03400800)'],
      selectedUse: 'High LDL cholesterol that stays high despite statins',
      exactText,
      measuredFinding,
      mainUncertainty: 'The record does not yet show whether heart attacks are prevented.',
    })

    expect(summary.basis).toBe('older_record')
    expect(summary.takeaway).toBe(measuredFinding)
    expect(summary.exactText).toBe(exactText)
    expect(summary.simplified).toBe(true)
    expect(summary.contextItems).toEqual([
      {
        label: 'What this page covers',
        text: 'High LDL cholesterol that stays high despite statins',
      },
      { label: 'What was measured', text: measuredFinding },
      {
        label: 'What remains uncertain',
        text: 'The record does not yet show whether heart attacks are prevented.',
      },
    ])
    expect(summary.terms.map((term) => term.key)).toEqual(
      expect.arrayContaining([
        'percentage-versus-placebo',
        'ldl-cholesterol',
        'modality:siRNA (Small Interfering RNA)',
        'pcsk9',
        'sirna',
        'messenger-rna',
        'galnac',
        'study-day-510',
        'study:orion-10',
        'study:orion-11',
      ]),
    )
    expect(
      summary.terms.find((term) => term.key === 'percentage-versus-placebo')?.definition,
    ).toContain('It does not mean half of the people were cured or helped')
    expect(summary.terms.find((term) => term.key.startsWith('study:'))).toMatchObject({
      technicalTerm: 'ORION-10',
      plainMeaning: 'The name researchers gave one study',
    })
    expect(summary.terms.find((term) => term.key.startsWith('modality:'))?.definition).toContain(
      'GalNAc is a sugar-based tag',
    )
  })

  it('keeps the Creatine verdict in exact wording and carries every local explanation with it', () => {
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
    const keys = summary.terms.map(({ key }) => key)

    expect(summary.takeaway).toBe(measuredFinding)
    expect(summary.takeaway).not.toContain('central claim survives audit')
    expect(summary.exactText).toBe(exactText)
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
  })

  it('does not leak a dense verdict into the first read when no concise measured finding exists', () => {
    const denseExactText = Array.from({ length: 60 }, (_, index) => `technical-${index + 1}`).join(
      ' ',
    )
    const summary = buildLegacyReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'a recorded condition',
      exactText: denseExactText,
    })

    expect(summary.takeaway).toBe(
      'This page covers one use of Example Medicine: a recorded condition. A measured result is not recorded here.',
    )
    expect(summary.takeaway).not.toContain('technical-1')
    expect(summary.exactText).toBe(denseExactText)
    expect(summary.simplified).toBe(false)
  })

  it('keeps an overlong measured finding in context without cutting it halfway', () => {
    const measuredFinding = `${Array.from({ length: 45 }, () => 'measured').join(' ')}.`
    const summary = buildLegacyReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'a recorded condition',
      measuredFinding,
    })

    expect(summary.takeaway).toContain(
      'A measured result is recorded, but a short plain-language version is not available yet.',
    )
    expect(summary.contextItems).toContainEqual({
      label: 'What was measured',
      text: measuredFinding,
    })
    expect(summary.takeaway).not.toContain(`${measuredFinding.slice(0, 30)}`)
  })

  it('preserves reviewed programme wording and only structures its authored summary fields', () => {
    const summary = buildPublishedProgrammeReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'ASO (Antisense Oligonucleotide)',
      selectedUse: 'The selected programme',
      exactText: 'The reviewed programme answer remains unchanged.',
      plainMechanism: 'The reviewed mechanism summary.',
      bestSupportedFinding: 'The reviewed strongest finding.',
      mainUncertainty: 'The reviewed main uncertainty.',
    })

    expect(summary.basis).toBe('published_programme')
    expect(summary.takeaway).toBe('The reviewed strongest finding.')
    expect(summary.exactText).toBe('The reviewed programme answer remains unchanged.')
    expect(summary.contextItems).toEqual([
      { label: 'What this page covers', text: 'The selected programme' },
      { label: 'How it is meant to work', text: 'The reviewed mechanism summary.' },
      { label: 'Best-supported finding', text: 'The reviewed strongest finding.' },
      { label: 'What remains uncertain', text: 'The reviewed main uncertainty.' },
    ])
    expect(summary.simplified).toBe(true)
  })

  it('keeps a dense reviewed conclusion in expansion instead of copying it into the first read', () => {
    const dense = `${Array.from({ length: 45 }, (_, index) => `technical-${index + 1}`).join(' ')}.`
    const summary = buildPublishedProgrammeReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'One reviewed use',
      exactText: dense,
      bestSupportedFinding: dense,
      mainUncertainty: 'A stored uncertainty.',
    })

    expect(summary.takeaway).toBe(
      'This page covers one use of Example Medicine: One reviewed use. A short plain-language result is not available yet.',
    )
    expect(summary.takeaway).not.toContain('technical-1')
    expect(summary.exactText).toBe(dense)
    expect(summary.contextItems).toContainEqual({
      label: 'Best-supported finding',
      text: dense,
    })
    expect(summary.simplified).toBe(false)
  })

  it('collapses an identical gene and protein name into one target explanation', () => {
    const summary = buildLegacyReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      targetGene: 'TARGET1',
      targetProtein: 'TARGET1',
      measuredFinding: 'The TARGET1 measurement changed in the recorded study.',
    })
    const targetTerms = summary.terms.filter((term) => /^(?:gene|protein|target):/u.test(term.key))

    expect(targetTerms).toEqual([
      expect.objectContaining({
        key: 'target:target1',
        technicalTerm: 'TARGET1',
        plainMeaning: 'Gene and protein named as the medicine’s target',
      }),
    ])
  })

  it('states the unpublished-programme boundary without borrowing legacy evidence', () => {
    const summary = buildUnpublishedProgrammeReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'One identified use',
    })

    expect(summary).toMatchObject({
      basis: 'unpublished_programme',
      takeaway: 'No reviewed plain-language answer has been published for this use.',
      simplified: false,
    })
    expect(summary.exactText).toBeUndefined()
    expect(summary.contextItems).toEqual([
      { label: 'What this page covers', text: 'One identified use' },
    ])
  })
})
