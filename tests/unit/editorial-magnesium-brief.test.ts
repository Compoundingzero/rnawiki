import { describe, expect, it } from 'vitest'

import {
  MAGNESIUM_GLYCINATE_DRAFT,
  eligibleDraftBriefForSlug,
} from '@/lib/editorial/dossier-briefs'

describe('the magnesium glycinate editorial quality gate', () => {
  const brief = MAGNESIUM_GLYCINATE_DRAFT

  it('never bypasses an identity or pipeline hold in preview mode', () => {
    expect(eligibleDraftBriefForSlug(brief.slug, 'correction_hold', true)).toBeNull()
    expect(eligibleDraftBriefForSlug(brief.slug, 'pipeline_failure', true)).toBeNull()
    expect(eligibleDraftBriefForSlug(brief.slug, 'preliminary', false)).toBeNull()
    expect(eligibleDraftBriefForSlug(brief.slug, 'preliminary', true)).toBe(brief)
  })

  it('keeps each useful claim attached to an exact source', () => {
    const lines = [
      brief.identity,
      brief.whyPeopleLook,
      brief.mechanism,
      brief.bottomLine,
      ...brief.safety,
      ...brief.studies.map((study) => study.finding),
      ...brief.interactions,
      ...brief.productChecks,
      ...brief.studyWords.map((item) => item.answer),
      ...brief.whyItMayFeelDifferent.map((item) => item.answer),
      ...brief.suppliedAs.map((item) => item.answer),
      ...brief.measures.map((item) => item.answer),
      ...brief.openQuestions.map((item) => item.answer),
      ...brief.claimChecks.map((item) => item.answer),
      ...brief.evidenceTrail.map((item) => item.answer),
      ...brief.nextQuestions.map((item) => item.answer),
    ]
    expect(lines.length).toBeGreaterThanOrEqual(30)
    for (const line of lines) {
      expect(line.text.length).toBeGreaterThan(30)
      expect(line.source.label.length).toBeGreaterThan(12)
      expect(new URL(line.source.url).protocol).toBe('https:')
    }
    const allSources = lines.flatMap((line) =>
      line.secondarySource ? [line.source, line.secondarySource] : [line.source],
    )
    const urlForMarker = new Map<number, string>()
    for (const source of allSources) {
      expect(source.marker).toBeGreaterThan(0)
      if (urlForMarker.has(source.marker)) {
        expect(urlForMarker.get(source.marker)).toBe(source.url)
      } else {
        urlForMarker.set(source.marker, source.url)
      }
    }
  })

  it('leads with the direct bisglycinate trial and bounds older form comparisons', () => {
    const sleep = brief.studies.find((study) => study.question.includes('sleep'))
    const absorption = brief.studies.find((study) => study.question.includes('absorbed'))
    expect(sleep?.finding.source.url).toContain('PMC12412596')
    expect(sleep?.finding.text).toContain('155 generally healthy adults')
    expect(sleep?.visual).toBe('magnesium-sleep-change')
    expect(sleep?.finding.text).toContain('134 finished')
    expect(sleep?.protocol).toContain('not a suggested dose')
    expect(sleep?.boundary).toContain('not a sleep monitor')
    expect(absorption?.boundary).toContain('not sleep or cramps')
    expect(absorption?.boundary).toContain('lysinate glycinate')
  })

  it('keeps the newer magnesium-wide review distinct from the direct bisglycinate result', () => {
    expect(brief.bottomLine.source.label).toContain('Schuster et al., 2025')
    expect(brief.bottomLine.secondarySource?.url).toBe(
      'https://doi.org/10.1080/19390211.2026.2719670',
    )
    expect(brief.bottomLine.text).toContain('12 sleep trials across magnesium forms')
    expect(brief.bottomLine.text).toContain('low or very low certainty')
    expect(brief.bottomLine.text).toContain('small extra drop')
    expect(brief.bottomLine.text).not.toMatch(/bisglycinate (?:does not work|is ineffective)/i)
    expect(
      brief.openQuestions.find((item) => item.question.includes('low magnesium intake'))?.answer
        .secondarySource?.label,
    ).toContain('2026')
    expect(
      brief.claimChecks.find((item) => item.question.includes('not pass'))?.answer.secondarySource
        ?.label,
    ).toContain('2026')
  })

  it('gives a beginner a product check and safety boundary without a dosing protocol', () => {
    const text = JSON.stringify(brief)
    expect(text).toContain('elemental magnesium')
    expect(text).toMatch(/kidney disease/i)
    expect(text).toContain('antibiotics')
    expect(text).not.toMatch(/\btake \d+\s?(?:mg|g|mcg|ml)\b/i)
    expect(text).not.toMatch(/\bstart (?:with|at|taking) \d/i)
  })

  it('answers every photographed research question with a substance-specific finding', () => {
    expect(brief.studyWords).toHaveLength(4)
    expect(brief.whyItMayFeelDifferent).toHaveLength(3)
    expect(brief.suppliedAs).toHaveLength(3)
    expect(brief.measures).toHaveLength(3)
    expect(brief.openQuestions).toHaveLength(4)
    expect(brief.populationBoundary.notStudied).toContain(
      'Treatment for a sleep disorder or depression',
    )
    expect(brief.claimChecks).toHaveLength(4)
    expect(brief.evidenceTrail).toHaveLength(3)
    expect(brief.nextQuestions).toHaveLength(3)
    const text = JSON.stringify(brief)
    expect(text).toContain('Fewer than one in ten')
    expect(text).toContain('unvalidated diet question')
    expect(text).toContain('FDA does not approve dietary supplements before sale')
    expect(text).toContain('12 April 2023')
    expect(text).not.toContain('Recorded by the evidence model as a gap')
  })
})
