import { describe, expect, it } from 'vitest'

import { minimumCalibrationSize } from '@/lib/agents/core/conformal'
import { findForbiddenPhrases, type AgentCorpusEntry } from '@/lib/agents/core/types'
import { peerAnomalyAgent, type PeerGroupAnomalyScreen } from '@/lib/agents/dataset/peer-anomaly'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * The screen is tested against the real corpus, not a fixture. A fixture would prove the arithmetic
 * and prove nothing about the thing that actually matters: that on 3,008 real records the agent
 * flags real values, phrases every one of them as a question about a record, and stays silent where
 * the peer group is too small to say anything.
 */

/** Display name from the slug. The corpus is keyed by slug and carries no display name of its own. */
function nameFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length > 0 ? `${part[0]!.toUpperCase()}${part.slice(1)}` : part))
    .join(' ')
}

const CORPUS: readonly AgentCorpusEntry[] = Object.entries(ALL_RECORDED_BACKGROUND)
  .map(([slug, background]) => ({ slug, name: nameFromSlug(slug), background }))
  .sort((left, right) => (left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0))

const INPUT = { corpus: CORPUS, seed: 20260828, runDate: '2026-08-28' }

const RUN = peerAnomalyAgent.run(INPUT)
const SCREEN: PeerGroupAnomalyScreen = RUN.output

/** Every string a reader could ever see, gathered by walking the run. */
function collectStrings(value: unknown, into: string[] = []): string[] {
  if (typeof value === 'string') into.push(value)
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, into)
  else if (value !== null && typeof value === 'object') {
    for (const item of Object.values(value)) collectStrings(item, into)
  }
  return into
}

/**
 * The fetched wording carried on each flag's source. It is quoted, not authored: one FDA label in
 * this corpus prints "the estimated half-life of gilteritinib is 113 hours", which the phrase
 * screen catches by design. Screening a label's own sentence would mean the agent could not show
 * the evidence behind a flag, so excerpts are held apart and everything the agent writes is
 * screened.
 */
const QUOTED_EXCERPTS = new Set(
  SCREEN.quantities.flatMap((quantity) =>
    quantity.flags.flatMap((flag) => (flag.source.excerpt ? [flag.source.excerpt] : [])),
  ),
)

const AUTHORED_STRINGS = collectStrings(RUN).filter((text) => !QUOTED_EXCERPTS.has(text))

describe('peer-group anomaly screen over the real corpus', () => {
  it('draws on the corpus and reports its coverage honestly', () => {
    expect(RUN.coverage.considered).toBe(CORPUS.length)
    expect(RUN.coverage.used).toBeGreaterThan(0)
    expect(RUN.coverage.used).toBeLessThan(RUN.coverage.considered)
    expect(SCREEN.totals.valuesScreened).toBeGreaterThan(0)
    expect(SCREEN.totals.flagCount).toBeGreaterThan(0)
    expect(RUN.queue?.length).toBe(SCREEN.totals.flagCount)
  })

  it('is reproducible: the same corpus and seed give byte-identical output', () => {
    const again = peerAnomalyAgent.run({ corpus: CORPUS, seed: 20260828, runDate: '2026-08-28' })
    expect(JSON.stringify(again)).toBe(JSON.stringify(RUN))
  })

  it('never pools two units of the same quantity into one screen', () => {
    const keys = SCREEN.quantities.map((quantity) => quantity.screenKey)
    expect(new Set(keys).size).toBe(keys.length)

    const volumeScreens = SCREEN.quantities.filter(
      (quantity) => quantity.field === 'volumeOfDistribution',
    )
    // Both units are present in the corpus, so this is a real separation and not a vacuous one.
    expect(volumeScreens.map((screen) => screen.unit).sort()).toEqual(['L', 'L/kg'])
    for (const screen of volumeScreens) {
      for (const flag of screen.flags) expect(flag.unit).toBe(screen.unit)
    }
  })

  it('carries the chance-flag arithmetic into the output and the caveats', () => {
    for (const quantity of SCREEN.quantities) {
      expect(quantity.expectedFalseFlags).toBeCloseTo(quantity.testCount * quantity.alpha, 10)
      expect(quantity.falseDiscoveryControl.explanation.length).toBeGreaterThan(0)
    }
    const caveats = RUN.caveats.join(' ')
    expect(caveats).toContain(`${SCREEN.totals.testCount} tests`)
    expect(caveats).toContain('expected to look this unusual purely by chance')
    for (const quantity of SCREEN.quantities.filter((entry) => entry.powered)) {
      expect(caveats).toContain(quantity.falseDiscoveryControl.explanation)
    }
  })

  it('emits review candidates as questions about the record, ranked by 1 - p', () => {
    const queue = RUN.queue ?? []
    for (const candidate of queue) {
      expect(candidate.reason).toBe('UNUSUAL_FOR_PEER_GROUP')
      expect(candidate.question.trimEnd().endsWith('?')).toBe(true)
      expect(candidate.priority).toBeGreaterThan(0)
      expect(candidate.priority).toBeLessThanOrEqual(1)
      expect(candidate.sources.length).toBeGreaterThan(0)
    }
    for (let index = 1; index < queue.length; index += 1) {
      expect(queue[index - 1]!.priority).toBeGreaterThanOrEqual(queue[index]!.priority)
    }
    const flagPriorities = SCREEN.quantities
      .flatMap((quantity) => quantity.flags.map((flag) => 1 - flag.pValue))
      .sort((left, right) => right - left)
    expect(queue.map((candidate) => candidate.priority)).toEqual(flagPriorities)
  })
})

describe('the boundary the screen has to hold', () => {
  it('puts no advice and no claim about a medicine in any string it writes', () => {
    expect(AUTHORED_STRINGS.length).toBeGreaterThan(100)
    for (const text of AUTHORED_STRINGS) {
      expect(findForbiddenPhrases(text)).toEqual([])
    }
  })

  it('carries source excerpts verbatim rather than editing them to pass the screen', () => {
    // At least one excerpt in this corpus would fail the phrase screen. It is still shown exactly
    // as fetched, because a flag a reviewer cannot check against the source sentence is useless.
    const failing = [...QUOTED_EXCERPTS].filter((text) => findForbiddenPhrases(text).length > 0)
    expect(failing.length).toBeGreaterThan(0)
  })

  it('never emits a flag from a peer group below the resolution limit', () => {
    const required = minimumCalibrationSize(0.05)
    for (const quantity of SCREEN.quantities) {
      const underpowered = new Set(quantity.underpoweredGroups.map((group) => group.group))
      for (const flag of quantity.flags) {
        expect(flag.calibrationSize).toBeGreaterThanOrEqual(required)
        expect(flag.resolutionLimit).toBeLessThanOrEqual(quantity.alpha)
        expect(flag.pValue).toBeLessThanOrEqual(quantity.alpha)
        expect(underpowered.has(flag.group)).toBe(false)
      }
      // The groups reported as underpowered really are the ones a flag cannot come from.
      for (const group of quantity.underpoweredGroups) {
        expect(group.size - 1).toBeLessThan(required)
      }
    }
  })

  it('describes the known-correct extremes as unusual, never as mistaken', () => {
    // Lanthanum carbonate is recorded at 0.002% bioavailability because it is built not to be
    // absorbed; risedronate is recorded at a 561-hour terminal half-life because bisphosphonates
    // deposit in bone. Both are as extreme as any mis-read value and both are faithful records.
    const knownCorrect = ['lanthanum-carbonate', 'risedronate']
    const forbiddenWords = /\b(?:wrong|error|errors|erroneous|incorrect|mistaken|invalid)\b/iu

    const flags = SCREEN.quantities.flatMap((quantity) => quantity.flags)
    const candidates = RUN.queue ?? []

    for (const slug of knownCorrect) {
      const theirFlags = flags.filter((flag) => flag.slug === slug)
      const theirCandidates = candidates.filter((candidate) => candidate.slug === slug)
      // Not asserting that they are flagged — that is the corpus's business, not the contract's.
      // Asserting that if they are, the language holds.
      for (const flag of [...theirFlags]) {
        expect(findForbiddenPhrases(flag.note)).toEqual([])
        expect(flag.note).not.toMatch(forbiddenWords)
        expect(flag.note).toContain('worth a human look')
      }
      for (const candidate of theirCandidates) {
        expect(candidate.question).not.toMatch(forbiddenWords)
        expect(candidate.basis).not.toMatch(forbiddenWords)
      }
    }

    // The corpus does in fact contain both, so the assertions above are not vacuous.
    expect(flags.some((flag) => flag.slug === 'lanthanum-carbonate')).toBe(true)
    expect(flags.some((flag) => flag.slug === 'risedronate')).toBe(true)
  })

  it('keeps every emitted string clear of the words that would turn a flag into a verdict', () => {
    const forbiddenWords = /\b(?:wrong|error|errors|erroneous|incorrect|mistaken|invalid)\b/iu
    for (const text of AUTHORED_STRINGS) {
      expect(text).not.toMatch(forbiddenWords)
    }
  })

  it('scores only values the sources put a number and a unit on', () => {
    expect(SCREEN.excluded.displayOnlyValues).toBeGreaterThan(0)
    for (const quantity of SCREEN.quantities) {
      for (const flag of quantity.flags) {
        expect(Number.isFinite(flag.numeric)).toBe(true)
        expect(flag.unit.length).toBeGreaterThan(0)
        expect(flag.display.length).toBeGreaterThan(0)
        expect(flag.populationContext.length).toBeGreaterThan(0)
        expect(flag.source.identifier.length).toBeGreaterThan(0)
      }
    }
  })
})
