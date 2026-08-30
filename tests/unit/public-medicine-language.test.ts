import { describe, expect, it } from 'vitest'

import {
  buildLegacyReaderSummary,
  buildPublishedProgrammeReaderSummary,
  buildUnpublishedProgrammeReaderSummary,
  GENERAL_RESEARCH_SUMMARY_COPY,
  publicApprovalStatusLabel,
  publicMedicineTypeLabel,
  safeStoredReaderSentence,
} from '@/lib/public-medicine-language'
import { APPROVAL_STATUSES, DRUG_MODALITIES } from '@/lib/types'

describe('reader-facing medicine vocabulary', () => {
  it('names medicine-wide research without exposing database migration jargon', () => {
    expect(GENERAL_RESEARCH_SUMMARY_COPY).toEqual({
      label: 'General research summary',
      heading: 'What the research reports',
      boundary:
        'This combines research on different uses and groups. It is background, not a reviewed answer for one specific use.',
      technicalBoundary:
        'These details come from research gathered for the medicine as a whole. They have not been linked to one specific use.',
      findingLabel: 'Research finding',
      professionalFindingLabel: 'Medicine-wide research finding',
    })
    expect(JSON.stringify(GENERAL_RESEARCH_SUMMARY_COPY).toLowerCase()).not.toMatch(
      /older|legacy|record|programme|scope/,
    )
  })

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

  it('gives legacy Inclisiran a static purpose, result, and limit without research shorthand', () => {
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
    expect(summary.usedFor).toBe(
      'Used or studied for people with high LDL (“bad”) cholesterol that stays high despite cholesterol-lowering medicines.',
    )
    expect(summary.whatStudiesFound).toBe(
      'The LDL (“bad”) cholesterol level fell by about half compared with a dummy treatment.',
    )
    expect(summary.biggestLimit).toBe(
      'Studies have not yet shown whether heart attacks are prevented.',
    )
    expect(summary.takeaway).toBe(summary.whatStudiesFound)
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
    const firstRead = [summary.usedFor, summary.whatStudiesFound, summary.biggestLimit].join(' ')
    expect(firstRead).not.toMatch(
      /\b(?:audit|endpoint|phase\s*3|placebo|programme|record|ORION-10|ORION-11|NCT\d{8})\b/iu,
    )
    expect(summary).not.toHaveProperty('terms')
  })

  it('turns both day-510 forms into one familiar 17-month timepoint', () => {
    const shared = {
      medicineName: 'Inclisiran',
      modality: 'siRNA (Small Interfering RNA)',
      trialIdentifiers: ['ORION-10 (NCT03399370)'],
      selectedUse: 'High LDL cholesterol',
    }
    const atDay = buildLegacyReaderSummary({
      ...shared,
      measuredFinding:
        'At day 510, LDL cholesterol was 52.3% lower compared with placebo in ORION-10.',
    })
    const afterDays = buildLegacyReaderSummary({
      ...shared,
      measuredFinding:
        'LDL cholesterol was 49.9% lower compared with placebo after 510 days in ORION-10.',
    })

    expect(atDay.whatStudiesFound).toBe(
      'After about 17 months, LDL (“bad”) cholesterol was 52.3% lower compared with a dummy treatment.',
    )
    expect(afterDays.whatStudiesFound).toBe(
      'LDL (“bad”) cholesterol was 49.9% lower compared with a dummy treatment after about 17 months.',
    )
    for (const firstRead of [atDay.whatStudiesFound, afterDays.whatStudiesFound]) {
      expect(firstRead).not.toMatch(
        /\b(?:at after|day 510|510 days|ORION-10|NCT03399370|phase\s*3|placebo)\b/iu,
      )
    }
  })

  it('keeps dummy-treatment wording grammatical for people, groups, and comparisons', () => {
    const vutrisiran = buildLegacyReaderSummary({
      medicineName: 'Vutrisiran',
      modality: 'siRNA (Small Interfering RNA)',
      selectedUse: 'Nerve damage caused by hereditary amyloidosis',
      mainUncertainty:
        'The neuropathy trial that won the first approval was open-label and compared its results against the placebo patients from a different, earlier trial.',
    })

    expect(vutrisiran.biggestLimit).toBe(
      'The neuropathy study that won the first approval let everyone know which treatment was given and used people from a different, earlier study as its dummy-treatment group.',
    )

    const examples = [
      [
        'Treated patients improved more than the placebo group.',
        'Treated patients improved more than the dummy-treatment group.',
      ],
      ['People on placebo did not improve.', 'People given a dummy treatment did not improve.'],
      [
        'The medicine reduced pain compared with a placebo.',
        'The medicine reduced pain compared with a dummy treatment.',
      ],
      [
        'The medicine reduced pain compared with placebo.',
        'The medicine reduced pain compared with a dummy treatment.',
      ],
    ] as const

    for (const [stored, expected] of examples) {
      const summary = buildLegacyReaderSummary({
        medicineName: 'Example Medicine',
        modality: 'Small Molecule',
        selectedUse: 'One use',
        measuredFinding: stored,
      })
      expect(summary.whatStudiesFound).toBe(expected)
      expect(summary.whatStudiesFound).not.toMatch(/\bplacebo\b|\ba dummy treatment patients\b/iu)
    }
  })

  it('keeps singular study wording natural and removes study-design shorthand', () => {
    const examples = [
      ['A placebo-controlled trial found less pain.', 'A study found less pain.'],
      ['A Phase 3 trial found less pain.', 'A study found less pain.'],
      ['Two Phase III trials found less pain.', 'Two studies found less pain.'],
      ['A randomised double-blind trial found less pain.', 'A study found less pain.'],
      [
        'A randomized, double-blind, placebo-controlled trial found less pain.',
        'A study found less pain.',
      ],
    ] as const

    for (const [stored, expected] of examples) {
      const summary = buildLegacyReaderSummary({
        medicineName: 'Example Medicine',
        modality: 'Small Molecule',
        selectedUse: 'Pain relief',
        measuredFinding: stored,
      })
      expect(summary.whatStudiesFound).toBe(expected)
      expect(summary.whatStudiesFound).not.toMatch(
        /\b(?:double-blind|phase\s*(?:3|III)|placebo|randomi[sz]ed|trial)\b/iu,
      )
    }
  })

  it('does not label treatment assignment as a result and preserves concurrent comparison timing', () => {
    const injections = buildLegacyReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'One use',
      measuredFinding: 'People received placebo injections.',
    })
    const improvement = buildLegacyReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'One use',
      measuredFinding: 'Symptoms improved on placebo.',
    })

    expect(injections.whatStudiesFound).toBeUndefined()
    expect(improvement.whatStudiesFound).toBe('Symptoms improved with a dummy treatment.')
  })

  it('checks a “That …” uncertainty with the same molecular safety gate', () => {
    const unsafe = buildLegacyReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'siRNA (Small Interfering RNA)',
      selectedUse: 'One use',
      mainUncertainty:
        'That a GalNAc-tagged siRNA can change PCSK9 messenger RNA inside liver cells.',
    })
    const safe = buildLegacyReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'One use',
      mainUncertainty: 'That the medicine prevents heart attacks.',
    })

    expect(unsafe.biggestLimit).toBeUndefined()
    expect(safe.biggestLimit).toBe(
      'Studies have not shown that the medicine prevents heart attacks.',
    )
  })

  it('prefers the stored main uncertainty over a negative adverse-event sentence', () => {
    const summary = buildPublishedProgrammeReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'Pain relief',
      exactText:
        'The medicine reduced pain. Some people did not finish the study because they felt sick.',
      bestSupportedFinding: 'The medicine reduced pain in the study.',
      mainUncertainty: 'Whether the benefit lasts beyond three months remains unknown.',
    })

    expect(summary.biggestLimit).toBe(
      'Whether the benefit lasts beyond three months remains unknown.',
    )
    expect(summary.biggestLimitSourceFieldPath).toBe('summary.mainLimitation')
    expect(summary.biggestLimit).not.toContain('felt sick')
  })

  it('does not label an exact-verdict fallback as evidence for the stored limitation field', () => {
    const summary = buildPublishedProgrammeReaderSummary({
      medicineName: 'Creatine monohydrate',
      modality: 'Nutraceutical / Botanical',
      selectedUse: 'Strength and power',
      exactText: 'The neuroprotection claim failed two large studies and remains unsupported.',
      bestSupportedFinding: 'Studies found improved power during short, hard efforts.',
      mainUncertainty: 'Whether a different outcome changes remains unknown.',
    })

    expect(summary.biggestLimit).toBe(
      'Two large studies found no evidence that creatine slowed Parkinson’s or Huntington’s disease.',
    )
    expect(summary.biggestLimitSourceFieldPath).toBeUndefined()
  })

  it('makes the Creatine first read understandable while preserving the professional verdict', () => {
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

    expect(summary.usedFor).toBe('Used for strength and power during short, hard efforts.')
    expect(summary.whatStudiesFound).toBe(
      'Tests of small muscle samples taken before and after showed that creatine taken by mouth reaches the muscles, and that people who started with the least had the biggest increase.',
    )
    expect(summary.biggestLimit).toBe(
      'Two large studies found no evidence that creatine slowed Parkinson’s or Huntington’s disease.',
    )
    expect(summary.exactText).toBe(exactText)
    const firstRead = [summary.usedFor, summary.whatStudiesFound, summary.biggestLimit].join(' ')
    const firstReadWordCount = firstRead.split(/\s+/u).length
    expect(firstReadWordCount).toBeGreaterThanOrEqual(25)
    expect(firstReadWordCount).toBeLessThanOrEqual(60)
    expect(firstRead).not.toMatch(
      /\b(?:audit|biops(?:y|ies)|neuroprotection|phase\s*3|phosphocreatine|trial)\b/iu,
    )
    expect(summary).not.toHaveProperty('terms')
  })

  it('prefers an explicit plain measured finding over a heuristic reading of a long verdict', () => {
    const measuredFinding =
      'Studies found that creatine builds up in muscle and improves performance during short, hard efforts.'
    const summary = buildLegacyReaderSummary({
      medicineName: 'Creatine test record',
      modality: 'Nutraceutical / Botanical',
      selectedUse: 'Short bursts of strength and power',
      measuredFinding,
      exactText:
        'One of the few supplements whose central claim survives audit — muscle creatine and short-duration power rise — while a brain-protection claim failed later studies.',
    })

    expect(summary.whatStudiesFound).toBe(measuredFinding)
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

    expect(summary.usedFor).toBe('Used or studied for a recorded condition.')
    expect(summary.whatStudiesFound).toBeUndefined()
    expect(summary.biggestLimit).toBeUndefined()
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

    expect(summary.whatStudiesFound).toBeUndefined()
    expect(summary.contextItems).toContainEqual({
      label: 'What was measured',
      text: measuredFinding,
    })
    expect(summary.takeaway).not.toContain(`${measuredFinding.slice(0, 30)}`)
  })

  it('structures reviewed fields without exposing internal workflow words', () => {
    const summary = buildPublishedProgrammeReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'ASO (Antisense Oligonucleotide)',
      selectedUse: 'One selected use',
      exactText: 'The reviewed programme answer remains unchanged.',
      plainMechanism: 'The reviewed mechanism summary.',
      bestSupportedFinding: 'The reviewed strongest finding.',
      mainUncertainty: 'The reviewed main uncertainty.',
    })

    expect(summary.basis).toBe('published_programme')
    expect(summary.usedFor).toBe('Used or studied for one selected use.')
    expect(summary.whatStudiesFound).toBeUndefined()
    expect(summary.biggestLimit).toBeUndefined()
    expect(summary.takeaway).toBe(
      'A reviewed study result is available, but it still needs a short plain-language explanation.',
    )
    expect(summary.exactText).toBe('The reviewed programme answer remains unchanged.')
    expect(summary.contextItems).toEqual([
      { label: 'What this page covers', text: 'One selected use' },
      { label: 'How it is meant to work', text: 'The reviewed mechanism summary.' },
      { label: 'Best-supported finding', text: 'The reviewed strongest finding.' },
      { label: 'What remains uncertain', text: 'The reviewed main uncertainty.' },
    ])
    expect(summary.simplified).toBe(false)
  })

  it('turns the normalized Inclisiran fields into a MedlinePlus-style first read', () => {
    const summary = buildPublishedProgrammeReaderSummary({
      medicineName: 'Inclisiran',
      modality: 'siRNA (Small Interfering RNA)',
      selectedUse: 'Inclisiran study in adults with artery disease and high LDL cholesterol',
      exactText:
        'Inclisiran lowered LDL cholesterol in a reviewed study but did not show fewer heart attacks.',
      bestSupportedFinding:
        'After about 17 months, inclisiran lowered LDL (“bad”) cholesterol by about half compared with a dummy treatment.',
      mainUncertainty:
        'The study measured LDL cholesterol, not whether people had fewer heart attacks or strokes.',
    })

    expect(summary).toMatchObject({
      usedFor: 'Studied in adults with artery disease and high LDL (“bad”) cholesterol.',
      whatStudiesFound:
        'After about 17 months, inclisiran lowered LDL (“bad”) cholesterol by about half compared with a dummy treatment.',
      whatStudiesFoundSourceFieldPath: 'summary.bestSupportedFinding',
      biggestLimit:
        'The study measured LDL (“bad”) cholesterol, not whether people had fewer heart attacks or strokes.',
      biggestLimitSourceFieldPath: 'summary.mainLimitation',
    })
    const firstRead = [summary.usedFor, summary.whatStudiesFound, summary.biggestLimit].join(' ')
    expect(firstRead).not.toMatch(
      /\b(?:audit|endpoint|phase\s*3|placebo|programme|record|NCT\d{8})\b/iu,
    )
  })

  it('separates a practical use note from the main purpose', () => {
    const summary = buildLegacyReaderSummary({
      medicineName: 'Inclisiran',
      modality: 'siRNA (Small Interfering RNA)',
      selectedUse:
        'High LDL cholesterol in adults, and inherited high cholesterol from age 12; used alongside diet and exercise',
      measuredFinding: 'LDL cholesterol fell in the studies.',
    })

    expect(summary.usedFor).toBe(
      'Used for adults with high LDL (“bad”) cholesterol and people age 12 or older with inherited high cholesterol.',
    )
    expect(summary.practicalNote).toBe('It is used alongside diet and exercise.')
  })

  it('omits an overlong practical note from the first screen without discarding the stored use', () => {
    const summary = buildLegacyReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: `Pain relief; ${Array.from({ length: 20 }, () => 'additional').join(' ')} detail`,
      measuredFinding: 'The study measured less pain.',
    })

    expect(summary.usedFor).toBe('Used or studied for pain relief.')
    expect(summary.practicalNote).toBeUndefined()
    expect(summary.contextItems[0]?.text).toContain('additional')
  })

  it('uses the first genuine result sentence instead of a preceding study-setup sentence', () => {
    const summary = buildLegacyReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'Pain relief',
      measuredFinding:
        'The study enrolled 200 people and assigned them by chance. Pain scores fell by four points with the medicine.',
    })

    expect(summary.whatStudiesFound).toBe('Pain scores fell by four points with the medicine.')
  })

  it('does not present a positive or procedural inference as the main limitation', () => {
    const positive = buildLegacyReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'Pain relief',
      mainUncertainty: 'The study reported a positive result in 2023.',
    })
    const genuineLimit = buildLegacyReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'Pain relief',
      mainUncertainty: 'Whether the benefit lasts beyond a year remains unknown.',
    })

    expect(positive.biggestLimit).toBeUndefined()
    expect(genuineLimit.biggestLimit).toBe(
      'Whether the benefit lasts beyond a year remains unknown.',
    )
  })

  it('keeps ordinary adrenal wording and uppercase medical abbreviations intact', () => {
    const adrenal = buildLegacyReaderSummary({
      medicineName: 'Hydrocortisone',
      modality: 'Small Molecule',
      trialIdentifiers: ['ADRENAL (NCT00115479)'],
      selectedUse: 'Replacing the cortisol that the adrenal glands cannot make',
    })
    const hiv = buildLegacyReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'HIV-1 treatment',
    })

    expect(adrenal.usedFor).toContain('adrenal glands')
    expect(adrenal.usedFor).not.toContain('the study glands')
    expect(hiv.usedFor).toContain('HIV-1')
    expect(hiv.usedFor).not.toContain('hIV-1')
  })

  it('does not turn a semicolon aside into an administration instruction', () => {
    const summary = buildLegacyReaderSummary({
      medicineName: 'Example Supplement',
      modality: 'Nutraceutical / Botanical',
      selectedUse: 'Stress; legal status differs between countries',
    })

    expect(summary.usedFor).toBe('Used for stress.')
    expect(summary.practicalNote).toBeUndefined()
  })

  it('does not replace an unsafe best finding with an unrelated sentence from the conclusion', () => {
    const denseFinding = `${Array.from({ length: 40 }, () => 'technical').join(' ')}.`
    const summary = buildPublishedProgrammeReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'Pain relief',
      exactText: 'The medicine reaches the blood. The main study did not reduce pain.',
      bestSupportedFinding: denseFinding,
      mainUncertainty: 'Whether it reduces pain remains unknown.',
    })

    expect(summary.whatStudiesFound).toBeUndefined()
    expect(summary.whatStudiesFoundSourceFieldPath).toBeUndefined()
    expect(summary.takeaway).toBe(
      'A reviewed study result is available, but it still needs a short plain-language explanation.',
    )
    expect(summary.exactText).toContain('reaches the blood')
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

    expect(summary.whatStudiesFound).toBeUndefined()
    expect(summary.takeaway).toBe(
      'A reviewed study result is available, but it still needs a short plain-language explanation.',
    )
    expect(summary.takeaway).not.toContain('technical-1')
    expect(summary.exactText).toBe(dense)
    expect(summary.contextItems).toContainEqual({
      label: 'Best-supported finding',
      text: dense,
    })
    expect(summary.simplified).toBe(false)
  })

  it('states the unpublished-programme boundary without borrowing legacy evidence', () => {
    const summary = buildUnpublishedProgrammeReaderSummary({
      medicineName: 'Example Medicine',
      modality: 'Small Molecule',
      selectedUse: 'One identified use',
    })

    expect(summary).toMatchObject({
      basis: 'unpublished_programme',
      usedFor: 'Used or studied for one identified use.',
      takeaway: 'No reviewed plain-language answer has been published for this use.',
      simplified: false,
    })
    expect(summary.exactText).toBeUndefined()
    expect(summary.contextItems).toEqual([
      { label: 'What this page covers', text: 'One identified use' },
    ])
  })

  describe('the first screen never speaks an instruction in the site’s own voice', () => {
    const NEEDS_DESCRIPTION =
      'This page discusses a use that still needs a clear, short description.'

    function usedFor(selectedUse: string, modality = 'Nutraceutical / Botanical'): string {
      return buildLegacyReaderSummary({
        medicineName: 'Example Substance',
        modality,
        trialIdentifiers: [],
        selectedUse,
      }).usedFor
    }

    // Each of these is a real stored indication, and each rendered as the answer to
    // "What is it for?" in the site's own voice before the guard existed.
    it.each([
      ['Take 15 minutes before meals.', 'anisum'],
      [
        'Dissolve 5 pellets under the tongue once a day until symptons are relieved.',
        'artemisia-cina-flower',
      ],
      [
        'Apply a thin layer to cleansed face or affected areas morning and evening.',
        'asiaticoside',
      ],
      [
        'Spray the spray directly on your shoes or feet to make odors disappear quickly.',
        'eucalyptus-globulus-leaf-oil',
      ],
    ])('refuses the copied instruction %j (%s)', (stored) => {
      expect(usedFor(stored)).toBe(NEEDS_DESCRIPTION)
    })

    it('refuses an instruction on a medicine whose lead-in is "Used or studied for"', () => {
      expect(usedFor('Take 15 minutes before meals', 'Small Molecule')).toBe(NEEDS_DESCRIPTION)
    })

    it.each([
      'INDICATIONS Allergies.',
      'INDICATIONS Late growth, fracture consolidation.',
      'directions: FOR ORAL USE ONLY.',
      'Condition listed above or as directed by the physician.',
    ])('refuses the label furniture %j', (stored) => {
      expect(usedFor(stored)).toBe(NEEDS_DESCRIPTION)
    })

    // The control that decides whether the guard is written correctly. This is a genuine FDA
    // monograph sunscreen indication: it contains the words "as directed" and "Directions", and it
    // is a real answer to "what is it for?". A case-insensitive heading match would delete it.
    it('keeps a genuine monograph use that merely mentions directions', () => {
      const stored =
        'Helps prevent sunburn. If used as directed with other sun protection measures (see Directions), decreases the risk of skin cancer.'
      expect(usedFor(stored)).not.toBe(NEEDS_DESCRIPTION)
      expect(usedFor(stored)).toMatch(/prevent sunburn/iu)
    })

    it.each([
      ['High blood pressure in adults', 'Small Molecule'],
      ['Loss of appetite', 'Nutraceutical / Botanical'],
    ])('keeps the ordinary use %j', (stored, modality) => {
      expect(usedFor(stored, modality)).not.toBe(NEEDS_DESCRIPTION)
    })

    it('drops a footnote marker whose footnote is not on the page', () => {
      // The disclaimer the marker points at is split off by the sentence split, so the marker would
      // otherwise promise a qualification the reader can never reach.
      const line = usedFor(
        'Hives*; *Claims based on traditional homeopathic practice, not accepted medical evidence.',
      )
      expect(line).not.toMatch(/[*†‡]/u)
      expect(line).toMatch(/hives/iu)
    })

    it('screens the practical note as well as the use line', () => {
      const summary = buildLegacyReaderSummary({
        medicineName: 'Example Substance',
        modality: 'Nutraceutical / Botanical',
        trialIdentifiers: [],
        selectedUse: 'Occasional sleeplessness; take 2 tablets once daily as directed by a doctor',
      })
      expect(summary.practicalNote).toBeUndefined()
    })
  })
})
