import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  reactionCooccurrenceAgent,
  type ReactionTermProfile,
} from '@/lib/agents/dataset/reaction-cooccurrence'
import { findForbiddenPhrases, type AgentCorpusEntry } from '@/lib/agents/core/types'
import type { MedicineRecordedBackground } from '@/lib/background/types'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * The agent is run against the whole recorded corpus rather than a fixture. Its subject is the
 * vocabulary of a thousand label sentences — which event terms recur, at which cut-offs each
 * sponsor printed them, and which pairs survive being tested against how common each term is — and
 * none of that is observable on a handful of synthetic records.
 */

const CORPUS: AgentCorpusEntry[] = Object.entries(ALL_RECORDED_BACKGROUND).map(
  ([slug, background]) => ({ slug, name: slug.replace(/-/gu, ' '), background }),
)

const SEED = 20260828
const RUN_DATE = '2026-08-28'
const RUN = reactionCooccurrenceAgent.run({ corpus: CORPUS, seed: SEED, runDate: RUN_DATE })

const AGENT_SOURCE = readFileSync(
  path.resolve(__dirname, '../../../lib/agents/dataset/reaction-cooccurrence.ts'),
  'utf8',
)

/**
 * Comments are stripped before the source is inspected. The file explains at length why it does not
 * project the bipartite structure onto medicines, and that explanation necessarily uses the
 * vocabulary the code is forbidden to use.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^[^\n]*?\/\/[^\n]*$/gmu, '')
}

const AGENT_CODE = stripComments(AGENT_SOURCE)

function declaredInterfaces(code: string): Array<{ name: string; properties: string[] }> {
  const found: Array<{ name: string; properties: string[] }> = []
  const blocks = code.matchAll(/(?:export\s+)?interface\s+(\w+)\s*\{([\s\S]*?)\n\}/gu)
  for (const block of blocks) {
    const properties = [...(block[2] ?? '').matchAll(/^\s{2}(\w+)\??:/gmu)].map(
      (match) => match[1] ?? '',
    )
    found.push({ name: block[1] ?? '', properties })
  }
  return found
}

/** Every string the dataset would show a reader, including the source excerpts it republishes. */
function collectStrings(value: unknown, into: string[]): string[] {
  if (typeof value === 'string') into.push(value)
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, into)
  else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectStrings(item, into)
  }
  return into
}

/** Every plain object in the output tree, so each row can be inspected on its own. */
function collectObjects(
  value: unknown,
  into: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  if (Array.isArray(value)) for (const item of value) collectObjects(item, into)
  else if (value && typeof value === 'object') {
    into.push(value as Record<string, unknown>)
    for (const item of Object.values(value)) collectObjects(item, into)
  }
  return into
}

describe('adverse-reaction term structure agent', () => {
  it('describes the terms the corpus actually prints', () => {
    expect(RUN.agent).toBe('adverse-reaction-term-structure')
    expect(RUN.output.terms.length).toBeGreaterThan(900)
    expect(RUN.output.recordsConsidered).toBe(CORPUS.length)
    expect(RUN.output.labelsWithAMostCommonList).toBeGreaterThan(600)
    expect(RUN.output.recordsWithoutAMostCommonList).toBe(
      RUN.output.recordsConsidered -
        CORPUS.filter((entry) => entry.background.commonAdverseReactions).length,
    )
    expect(RUN.output.validatedPairs.length).toBeGreaterThan(0)
  })

  it('reruns identically for the same seed and corpus', () => {
    const again = reactionCooccurrenceAgent.run({ corpus: CORPUS, seed: SEED, runDate: RUN_DATE })
    expect(JSON.stringify(again)).toBe(JSON.stringify(RUN))
  })

  it('lets the seed move only the randomised reference, never the recorded dataset', () => {
    const other = reactionCooccurrenceAgent.run({ corpus: CORPUS, seed: 11, runDate: RUN_DATE })
    expect(JSON.stringify(other.output.terms)).toBe(JSON.stringify(RUN.output.terms))
    expect(JSON.stringify(other.output.validatedPairs)).toBe(
      JSON.stringify(RUN.output.validatedPairs),
    )
    expect(JSON.stringify(other.queue)).toBe(JSON.stringify(RUN.queue))
  })

  it('keeps every reader-facing string clear of advice and of invented values', () => {
    const strings = [
      reactionCooccurrenceAgent.description,
      ...collectStrings(RUN, []),
      ...Object.values(RUN.parameters).map((value) => String(value)),
    ]
    expect(strings.length).toBeGreaterThan(4000)
    for (const text of strings) {
      expect(findForbiddenPhrases(text), text.slice(0, 160)).toEqual([])
    }
  })
})

/**
 * The property this agent exists to guarantee, in three parts: a pair that sits exactly where
 * independence puts it is never reported, no medicine's threshold is ever combined with another's,
 * and the output holds no medicine-to-medicine structure.
 */
describe('no validated pair survives at exact independence', () => {
  it('reports nothing on a corpus built so that every pair matches its expectation exactly', () => {
    // Four terms carried by the multiples of 2, 3, 5 and 7 over 210 labels. Because the moduli are
    // coprime and 210 is their product, every pair co-occurs on exactly the number of labels
    // independence predicts: 105 x 70 / 210 = 35 labels carry both the first and the second, and so
    // on for all six pairs. A filler term on every label keeps each list non-empty, so the
    // population the test divides by really is 210.
    const terms: Array<{ term: string; divisor: number }> = [
      { term: 'even finding', divisor: 2 },
      { term: 'third finding', divisor: 3 },
      { term: 'fifth finding', divisor: 5 },
      { term: 'seventh finding', divisor: 7 },
    ]
    const corpus: AgentCorpusEntry[] = []
    for (let index = 0; index < 210; index += 1) {
      const present = [
        'filler finding',
        ...terms.filter((t) => index % t.divisor === 0).map((t) => t.term),
      ]
      const threshold = 'incidence of 5% or more'
      const background: MedicineRecordedBackground = {
        version: 'medicine-background/v1',
        authoredAt: RUN_DATE,
        commonAdverseReactions: {
          thresholdAsRecorded: threshold,
          eventsAsRecorded: present,
          source: {
            kind: 'FDA_LABEL',
            identifier: `synthetic-${index}`,
            label: `Synthetic label ${index}`,
            retrievedAt: RUN_DATE,
            excerpt: `The most common adverse reactions (${threshold}) were ${present.join(', ')}.`,
          },
        },
      }
      corpus.push({ slug: `synthetic-${index}`, name: `synthetic ${index}`, background })
    }

    const run = reactionCooccurrenceAgent.run({ corpus, seed: SEED, runDate: RUN_DATE })
    expect(run.output.labelsWithAMostCommonList).toBe(210)
    expect(run.output.termsEnteringPairTesting).toBe(5)
    expect(run.output.pairsTested).toBe(10)

    // Every pair is exactly at its expectation, which is the state the agent must never report.
    for (const leader of run.output.rawCountLeaders) {
      expect(leader.labelsPrintingBothTerms).toBe(leader.expectedUnderRecordedFrequencies)
      expect(leader.survivedValidation).toBe(false)
    }
    expect(run.output.validatedPairs).toEqual([])
  })

  it('validates only pairs recorded together more often than their frequencies predict', () => {
    expect(RUN.output.validatedPairs.length).toBeGreaterThan(0)
    for (const pair of RUN.output.validatedPairs) {
      expect(
        pair.labelsPrintingBothTerms,
        `${pair.firstTerm} + ${pair.secondTerm}`,
      ).toBeGreaterThan(pair.expectedUnderRecordedFrequencies)
      expect(pair.observedOverExpected).toBeGreaterThan(1)
      expect(pair.pValue).toBeLessThan(RUN.output.falseDiscoveryRate)
      expect(pair.firstTerm).not.toBe(pair.secondTerm)
    }
  })

  it('separates the validated set from the raw co-occurrence ranking it is not', () => {
    const leaders = RUN.output.rawCountLeaders
    expect(leaders.length).toBe(10)
    // The raw ranking is dominated by the commonest term. Whether a given leader survives the
    // frequency-preserving test is a fact about the corpus that the caveat reports; the contract
    // is that every raw leader carries the expectation the validation was measured against.
    expect(leaders.every((pair) => pair.expectedUnderRecordedFrequencies > 0)).toBe(true)
    expect(leaders.every((pair) => pair.labelsPrintingBothTerms > 0)).toBe(true)
    const commonest = RUN.output.terms[0]?.term
    expect(
      leaders.filter((pair) => pair.firstTerm === commonest || pair.secondTerm === commonest)
        .length,
    ).toBeGreaterThan(3)
  })

  it('checks the frequency-preserving procedure against a null that also fixes list lengths', () => {
    const reference = RUN.output.marginPreservingReference
    expect(reference.draws).toBe(25)
    expect(reference.validatedPairsPerDraw.length).toBe(25)
    expect(reference.medianValidatedPairs).toBeLessThan(RUN.output.validatedPairs.length / 10)
    expect(reference.maximumValidatedPairs).toBeLessThan(RUN.output.validatedPairs.length)
  })
})

describe('thresholds are kept per label and never pooled', () => {
  it('reports only threshold strings the corpus actually printed', () => {
    const recorded = new Set<string>()
    for (const entry of CORPUS) {
      const list = entry.background.commonAdverseReactions
      if (list) recorded.add(list.thresholdAsRecorded)
    }
    let checked = 0
    for (const profile of RUN.output.terms) {
      for (const tally of profile.thresholds) {
        expect(recorded.has(tally.thresholdAsRecorded), tally.thresholdAsRecorded).toBe(true)
        checked += 1
      }
      for (const listing of profile.listings) {
        expect(recorded.has(listing.thresholdAsRecorded)).toBe(true)
      }
    }
    expect(checked).toBeGreaterThan(1000)
    expect(RUN.output.distinctThresholdsRecorded).toBeGreaterThan(200)
  })

  it('keeps each label’s own threshold on its own listing', () => {
    const thresholdOf = new Map<string, string>()
    for (const entry of CORPUS) {
      const list = entry.background.commonAdverseReactions
      if (list) thresholdOf.set(entry.slug, list.thresholdAsRecorded)
    }
    for (const profile of RUN.output.terms) {
      for (const listing of profile.listings) {
        expect(listing.thresholdAsRecorded).toBe(thresholdOf.get(listing.slug))
      }
    }
  })

  it('tallies thresholds without combining them into any single value', () => {
    let multiThreshold = 0
    for (const profile of RUN.output.terms) {
      const tallied = profile.thresholds.reduce(
        (sum, tally) => sum + tally.labelsPrintingTermAtThisThreshold,
        0,
      )
      expect(tallied, profile.term).toBe(profile.labelsPrintingTerm)
      expect(profile.distinctThresholdsPrinted).toBe(profile.thresholds.length)
      if (profile.distinctThresholdsPrinted > 1) multiThreshold += 1
    }
    // The situation the rule exists for is the common one, not a corner case.
    expect(multiThreshold).toBeGreaterThan(100)
  })

  it('emits no averaged, parsed or pooled threshold anywhere in the output', () => {
    // A threshold VALUE may never be numeric, because a number can be averaged across labels and
    // one label's threshold is not commensurable with another's. Keys that COUNT thresholds are a
    // different thing and stay numeric — they report the spread rather than collapsing it, which
    // is the point of the rule. So the check names the value-carrying keys precisely instead of
    // matching any key that mentions the word.
    const carriesAThresholdValue = /^thresholds?$|^thresholdAsRecorded$|^thresholdPrinted$/u
    for (const node of collectObjects(RUN, [])) {
      for (const key of Object.keys(node)) {
        if (!carriesAThresholdValue.test(key)) continue
        const value = node[key]
        const values = Array.isArray(value) ? value : [value]
        for (const entry of values) {
          expect(typeof entry, key).not.toBe('number')
        }
      }
    }
    for (const forbidden of [/parseFloat/u, /parseInt/u, /Number\(\s*threshold/u]) {
      expect(forbidden.test(AGENT_CODE), `${forbidden.source} appears in code`).toBe(false)
    }
  })
})

describe('no medicine-to-medicine structure', () => {
  it('declares no type that can hold two medicine identifiers', () => {
    const interfaces = declaredInterfaces(AGENT_CODE)
    expect(interfaces.length).toBeGreaterThan(5)
    for (const declared of interfaces) {
      const identifiers = declared.properties.filter((property) => /slug/iu.test(property))
      expect(
        identifiers.length,
        `${declared.name} declares ${identifiers.join(', ')}`,
      ).toBeLessThan(2)
    }
    const naming = interfaces
      .filter((declared) => declared.properties.some((property) => /slug/iu.test(property)))
      .map((declared) => declared.name)
      .sort()
    expect(naming).toEqual(['AdmittedList', 'TermListing', 'WithheldListing'])
  })

  it('names no medicine-pairing identifier in code', () => {
    for (const forbidden of [
      /\bslugs\b/u,
      /\botherSlug\b/u,
      /\bslug[AB]\b/u,
      /\bmedicinePair\w*\b/u,
      /\b\w*Similarity\w*\b/u,
      /\b\w*RelatedMedicines?\w*\b/u,
    ]) {
      expect(forbidden.test(AGENT_CODE), `${forbidden.source} appears in code`).toBe(false)
    }
  })

  /**
   * A key that names a medicine, as opposed to a key that quotes one.
   *
   * The first version of this test treated any string equal to a corpus name as a reference to that
   * medicine, whichever key held it. That worked while the corpus was small and stopped working the
   * moment it was not: this corpus contains rows called "skin", "bean", "gold" and "ureter", so a
   * recorded reaction term of "skin" read as a reference to a medicine and the agent was accused of
   * relating deuruxolitinib to a body part it had merely quoted.
   *
   * The invariant that actually matters is about identification, not coincidence of spelling. An
   * object may quote any word a label printed; it may not identify two medicines. The companion
   * test above forbids the agent's code from naming a pairing at all.
   */
  const identifiesAMedicine = (key: string) => key === 'slug' || /slug$/iu.test(key)

  it('emits no object that refers to two different medicines', () => {
    const identityOf = new Map<string, string>()
    for (const entry of CORPUS) {
      identityOf.set(entry.slug, entry.slug)
      identityOf.set(entry.name, entry.slug)
    }

    for (const node of collectObjects(RUN, [])) {
      const referenced = new Set<string>()
      for (const [key, value] of Object.entries(node)) {
        if (typeof value !== 'string' || !identifiesAMedicine(key)) continue
        const identity = identityOf.get(value)
        if (identity) referenced.add(identity)
      }
      expect(referenced.size, JSON.stringify(node).slice(0, 200)).toBeLessThan(2)
    }
  })

  it('carries no key that could hold a second medicine', () => {
    // The counterpart to the check above: an object with one identifying key cannot pair anything,
    // whatever its other keys happen to contain.
    for (const node of collectObjects(RUN, [])) {
      const identifying = Object.keys(node).filter(identifiesAMedicine)
      expect(identifying.length, JSON.stringify(node).slice(0, 200)).toBeLessThan(2)
    }
  })

  it('pairs only reaction terms, never a term the agent treated as a medicine', () => {
    const pairedTerms = new Set(
      RUN.output.terms.filter((profile) => profile.enteredPairTesting).map((p) => p.term),
    )
    for (const pair of RUN.output.validatedPairs) {
      expect(pairedTerms.has(pair.firstTerm)).toBe(true)
      expect(pairedTerms.has(pair.secondTerm)).toBe(true)
    }
  })
})

describe('every listing is answerable to its own sentence', () => {
  const byTerm = new Map<string, ReactionTermProfile>(
    RUN.output.terms.map((profile) => [profile.term, profile]),
  )

  it('contains the recorded term verbatim in the excerpt of every listing', () => {
    let checked = 0
    for (const profile of RUN.output.terms) {
      for (const listing of profile.listings) {
        expect(
          listing.excerpt.toLowerCase().includes(profile.term),
          `${profile.term} -> ${listing.slug}`,
        ).toBe(true)
        if (listing.matchesSourceCasing) expect(listing.excerpt).toContain(listing.termAsRecorded)
        checked += 1
      }
    }
    expect(checked).toBe(RUN.output.listingsAdmitted)
  })

  it('counts a term once for a label that prints it twice in its own list', () => {
    expect(RUN.output.listingsCollapsedAsRepeatWithinOneList).toBeGreaterThan(0)
    for (const profile of RUN.output.terms) {
      const slugsSeen = new Set(profile.listings.map((listing) => listing.slug))
      expect(slugsSeen.size).toBe(profile.listings.length)
      expect(profile.labelsPrintingTerm).toBe(profile.listings.length)
    }
  })

  it('folds letter case and nothing else', () => {
    for (const profile of RUN.output.terms) {
      expect(profile.term).toBe(profile.term.trim().toLowerCase())
      for (const spelling of profile.recordedSpellings) {
        expect(spelling.toLowerCase()).toBe(profile.term)
      }
    }
    // Terms that a synonym table would have merged are still separate entries.
    expect(byTerm.has('nausea')).toBe(true)
    expect(byTerm.has('vomiting')).toBe(true)
    expect(byTerm.get('nausea')?.longerRecordedTerms.length).toBeGreaterThan(0)
  })

  it('routes joined and truncated-looking terms to a person instead of repairing them', () => {
    const queue = RUN.queue ?? []
    expect(queue.length).toBeGreaterThan(0)
    for (const item of queue) {
      expect(item.question.endsWith('?')).toBe(true)
      expect(item.sources.length).toBeGreaterThan(0)
      expect(findForbiddenPhrases(item.question)).toEqual([])
    }
    expect(queue.some((item) => item.question.includes('joined in one string'))).toBe(true)
  })
})

describe('honesty of the run record', () => {
  it('reports coverage against the whole corpus, not against what it used', () => {
    expect(RUN.coverage.considered).toBe(CORPUS.length)
    expect(RUN.coverage.used).toBe(RUN.output.labelsWithAMostCommonList)
    expect(RUN.coverage.used).toBeLessThan(RUN.coverage.considered)
    expect(RUN.coverage.reason).toContain('no most-common adverse reaction sentence')
  })

  it('states the limits a reader of the dataset needs', () => {
    const caveats = RUN.caveats.join(' ')
    expect(caveats).toContain('not a coded vocabulary')
    expect(caveats).toContain('how often the term is REPORTED')
    expect(caveats).toContain('never pooled into a rate')
    expect(caveats).toContain('no relation between one medicine and another')
    expect(caveats).toContain('neither reassurance nor alarm')
    expect(RUN.caveats.length).toBeGreaterThanOrEqual(10)
  })
})
