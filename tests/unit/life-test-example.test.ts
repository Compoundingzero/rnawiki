import { describe, expect, it } from 'vitest'

import { MAGNESIUM_SLEEP_STUDY as trial } from '@/lib/editorial/dossier-briefs'
import { editorialPreviewEnabled } from '@/lib/editorial/preview-gate'

describe('the evidence-checkpoint worked example', () => {
  it('requires the exact editorial preview flag', () => {
    expect(editorialPreviewEnabled('')).toBe(false)
    expect(editorialPreviewEnabled('0')).toBe(false)
    expect(editorialPreviewEnabled('1')).toBe(true)
  })

  it('keeps its claim, sample, measure and modest result tied to the direct trial', () => {
    expect(trial.source.url).toBe('https://pmc.ncbi.nlm.nih.gov/articles/PMC12412596/')
    expect(trial.registryUrl).toContain('DRKS00031494')
    expect(trial.randomized).toBe(155)
    expect(trial.primaryAnalysis).toBe(153)
    expect(trial.completed).toBe(134)
    expect(trial.durationWeeks).toBe(4)
    expect(trial.measure).toContain('Insomnia Severity Index')
    expect(trial.scoreScaleMax).toBe(28)
    expect(trial.scoreDropMagnesium - trial.scoreDropPlacebo).toBeCloseTo(trial.extraScoreDrop)
    expect(trial.extraScoreDropCiLow).toBe(0)
    expect(trial.extraScoreDropCiHigh).toBe(3.3)
    expect(trial.measuredByDevice).toBe(false)
    expect(trial.showedClearOtherQuestionnaireBenefit).toBe(false)
  })
})
