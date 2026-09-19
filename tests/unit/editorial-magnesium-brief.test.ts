import { describe, expect, it } from 'vitest'

import { MAGNESIUM_GLYCINATE_DRAFT } from '@/lib/editorial/dossier-briefs'

describe('the magnesium glycinate editorial quality gate', () => {
  const brief = MAGNESIUM_GLYCINATE_DRAFT

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
    ]
    expect(lines.length).toBeGreaterThanOrEqual(10)
    for (const line of lines) {
      expect(line.text.length).toBeGreaterThan(30)
      expect(line.source.label.length).toBeGreaterThan(12)
      expect(new URL(line.source.url).protocol).toBe('https:')
    }
  })

  it('does not transfer magnesium oxide or diglycinate results to the glycinate product', () => {
    const sleep = brief.studies.find((study) => study.question.includes('sleep'))
    const absorption = brief.studies.find((study) => study.question.includes('absorbed'))
    expect(sleep?.finding.text).toContain('magnesium oxide, not glycinate')
    expect(absorption?.boundary).toContain('not sleep or cramps')
    expect(absorption?.boundary).toContain('lysinate glycinate')
  })

  it('gives a beginner a product check and safety boundary without a dosing protocol', () => {
    const text = JSON.stringify(brief)
    expect(text).toContain('elemental magnesium')
    expect(text).toContain('Kidney disease')
    expect(text).toContain('antibiotics')
    expect(text).not.toMatch(/\btake \d+\s?(?:mg|g|mcg|ml)\b/i)
    expect(text).not.toMatch(/\bstart (?:with|at|taking) \d/i)
  })
})
