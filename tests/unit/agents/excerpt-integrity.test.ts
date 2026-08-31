import { describe, expect, it } from 'vitest'

import {
  displayNumerals,
  excerptIntegrityAgent,
  NUMERAL_NORMALISATION_RULES,
  normaliseNumerals,
} from '@/lib/agents/dataset/excerpt-integrity'
import { authoredStrings, findForbiddenPhrases } from '@/lib/agents/core/types'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'
import type { AgentCorpusEntry } from '@/lib/agents/core/types'
import type { MedicineRecordedBackground } from '@/lib/background/types'

const CORPUS: AgentCorpusEntry[] = Object.entries(ALL_RECORDED_BACKGROUND).map(
  ([slug, background]) => ({ slug, name: slug.replace(/-/gu, ' '), background }),
)
const INPUT = { corpus: CORPUS, seed: 20260828, runDate: '2026-08-28' }
const RUN = excerptIntegrityAgent.run(INPUT)

describe('numeral normalisation', () => {
  it('folds the typographic forms labels actually use', () => {
    expect(normaliseNumerals('5–7 hours')).toContain('5-7')
    expect(normaliseNumerals('5 to 7 hours')).toContain('5-7')
    expect(normaliseNumerals('1,234 mg')).toContain('1234')
    expect(normaliseNumerals('.5 mg')).toContain('0.5')
    expect(normaliseNumerals('5.0 hours')).toContain('5 hours')
  })

  it('reads the numerals a display commits the record to', () => {
    expect(displayNumerals('3.2 to 5.6 L/kg')).toEqual(['3.2', '5.6'])
    expect(displayNumerals('oral')).toEqual([])
  })

  it('publishes its rules so a third party can reproduce the check', () => {
    expect(NUMERAL_NORMALISATION_RULES.length).toBeGreaterThanOrEqual(6)
    for (const entry of NUMERAL_NORMALISATION_RULES) {
      expect(entry.rule.length).toBeGreaterThan(10)
      expect(entry.why.length).toBeGreaterThan(10)
    }
  })
})

describe('excerpt integrity over the real corpus', () => {
  it('reports a real pass rate over a real number of values', () => {
    expect(RUN.output.totalChecked).toBeGreaterThan(5000)
    expect(RUN.output.overallVerifiedShare).toBeGreaterThan(0.99)
    expect(RUN.output.statementsChecked).toBeGreaterThan(10000)
    expect(RUN.queue).toHaveLength(
      RUN.output.entries.filter((entry) => entry.state === 'NUMBER_ABSENT').length,
    )
    expect(RUN.queueSelection).toBeUndefined()
  })

  it('is deterministic', () => {
    const second = excerptIntegrityAgent.run(INPUT)
    expect(JSON.stringify(second.output.byModule)).toEqual(JSON.stringify(RUN.output.byModule))
  })

  it('keeps every authored string clear of advice and invented values', () => {
    const offending = authoredStrings({
      output: RUN.output,
      queue: RUN.queue,
      caveats: RUN.caveats,
    }).flatMap((text) => findForbiddenPhrases(text))
    expect(offending).toEqual([])
  })

  it('disclaims any verdict on the source, rather than merely avoiding the words', () => {
    // The queue is where a verdict would leak, so that is what must be clean.
    for (const item of RUN.queue ?? []) {
      expect(item.question).not.toMatch(
        /\bthe (?:source|label) is (?:wrong|incorrect|mistaken)\b/iu,
      )
    }
    // And the caveats must say so outright, since a reader seeing a failed check will otherwise
    // read it as the label being at fault.
    const caveats = RUN.caveats.join(' ')
    expect(caveats).toMatch(/never a statement that the source is wrong/iu)
    expect(caveats).toMatch(/transcription fidelity/iu)
  })
})

describe('the check can actually fail', () => {
  /**
   * A pass rate of 100% is only meaningful if the check is capable of reporting less. This plants
   * a number that its excerpt does not contain and requires the ledger to find it — otherwise a
   * silently broken check and a clean corpus look identical.
   */
  function corrupted(): AgentCorpusEntry[] {
    const original = CORPUS.find((entry) => entry.background.pharmacokinetics?.halfLife?.numeric)!
    const background: MedicineRecordedBackground = structuredClone(original.background)
    background.pharmacokinetics!.halfLife!.display = '99999 hours'
    return [{ ...original, slug: 'synthetic-corrupted', background }]
  }

  it('detects a number that its excerpt does not print', () => {
    const run = excerptIntegrityAgent.run({ ...INPUT, corpus: corrupted() })
    const absent = run.output.entries.filter((entry) => entry.state === 'NUMBER_ABSENT')
    expect(absent.length).toBeGreaterThan(0)
    expect(absent[0]!.missingNumerals).toContain('99999')
    expect(run.output.overallVerifiedShare).toBeLessThan(1)
  })

  it('routes the corruption to a person as a question about the record', () => {
    const run = excerptIntegrityAgent.run({ ...INPUT, corpus: corrupted() })
    const item = run.queue?.[0]
    expect(item).toBeDefined()
    expect(item!.question).toContain('99999')
    // Phrased as a question about this corpus, never as a verdict on the source.
    expect(item!.question).toMatch(/\?$/u)
    expect(findForbiddenPhrases(item!.question)).toEqual([])
  })

  it('agrees with the background engine, and reports it rather than assuming it', () => {
    expect(RUN.output.engineComparison.recordsCompared).toBe(CORPUS.length)
    expect(RUN.output.engineComparison.agreementRate).toBeGreaterThan(0.99)
    // Agreement is only meaningful because the two checks are written separately.
    expect(RUN.output.engineComparison.note).toContain('independently')
  })
})
