import { describe, expect, it } from 'vitest'

import {
  candidateKey,
  occurrenceKey,
  shouldResurface,
  valueDigest,
  type CandidateObservation,
  type CandidateSubject,
} from '@/lib/agents/core/identity'

/**
 * These keys are the substrate the whole review loop stands on. Every property asserted here is one
 * that, if it silently broke, would make the loop look like it was working while throwing away the
 * only asset a competitor cannot copy — so each test names the failure it prevents rather than
 * describing the function.
 */

const SUBJECT: CandidateSubject = {
  agent: 'peer-group-anomaly-screen',
  reasonSchemaVersion: '1',
  subjectType: 'medicine',
  subjectId: 'lanthanum-carbonate',
  fieldPath: 'pharmacokinetics.bioavailability',
  reason: 'UNUSUAL_FOR_PEER_GROUP',
}

const OBSERVATION: CandidateObservation = {
  valueDigest: valueDigest({ display: '0.002%', numeric: 0.002 }),
  sourceDigests: ['FDA_LABEL:abc123', 'FDA_LABEL:def456'],
  parserVersion: 'label-extraction/2.4.0',
  corpusVersion: 'corpus/2026-08-30',
}

describe('candidateKey identifies the question, not the wording', () => {
  it('is stable when only the rendered question text would have changed', () => {
    // The failure this prevents: agent questions embed run-specific counts ("while 1,628 of 9,855
    // records hold one"), so a key derived from the prose changes on every corpus refresh and
    // orphans every decision ever recorded.
    expect(candidateKey(SUBJECT)).toBe(candidateKey({ ...SUBJECT }))
  })

  it('is stable across an agent patch release', () => {
    // reasonSchemaVersion is bumped only when the MEANING of the reason changes. Fixing a typo in a
    // caveat must not reset the review history.
    const afterPatchRelease = { ...SUBJECT }
    expect(candidateKey(afterPatchRelease)).toBe(candidateKey(SUBJECT))
  })

  it('changes when the question genuinely becomes a different question', () => {
    expect(candidateKey({ ...SUBJECT, reasonSchemaVersion: '2' })).not.toBe(candidateKey(SUBJECT))
    expect(candidateKey({ ...SUBJECT, reason: 'SOURCES_DISAGREE' })).not.toBe(candidateKey(SUBJECT))
    expect(candidateKey({ ...SUBJECT, fieldPath: 'pharmacokinetics.halfLife' })).not.toBe(
      candidateKey(SUBJECT),
    )
    expect(candidateKey({ ...SUBJECT, subjectId: 'risedronate' })).not.toBe(candidateKey(SUBJECT))
  })

  /**
   * The collision this prevents is a decision recorded against the wrong record, with nothing
   * anywhere to reveal it. Concatenating fields would let a slug ending in a digit and a field path
   * beginning with one produce the same digest as a different pair.
   */
  it('cannot collide by shifting a character between adjacent fields', () => {
    const left = candidateKey({ ...SUBJECT, subjectId: 'metopro', fieldPath: 'lol.halfLife' })
    const right = candidateKey({ ...SUBJECT, subjectId: 'metoprolol', fieldPath: '.halfLife' })
    expect(left).not.toBe(right)
  })

  it('treats a whole-record question as a real state rather than a missing value', () => {
    const wholeRecord = candidateKey({ ...SUBJECT, fieldPath: '' })
    expect(wholeRecord).toMatch(/^[0-9a-f]{64}$/u)
    expect(wholeRecord).not.toBe(candidateKey(SUBJECT))
  })
})

describe('occurrenceKey identifies the observation', () => {
  const key = candidateKey(SUBJECT)

  it('is stable when nothing observed has changed', () => {
    expect(occurrenceKey(key, OBSERVATION)).toBe(occurrenceKey(key, { ...OBSERVATION }))
  })

  it('does not change when the sources are listed in a different order', () => {
    // Source ordering is an artefact of iteration, not a change in what was observed. Without the
    // sort, every rerun would reopen every item and no decision would ever stick.
    expect(
      occurrenceKey(key, {
        ...OBSERVATION,
        sourceDigests: ['FDA_LABEL:def456', 'FDA_LABEL:abc123'],
      }),
    ).toBe(occurrenceKey(key, OBSERVATION))
  })

  it('changes when the value, a source, the parser or the corpus changes', () => {
    const base = occurrenceKey(key, OBSERVATION)
    expect(
      occurrenceKey(key, { ...OBSERVATION, valueDigest: valueDigest({ display: '89%' }) }),
    ).not.toBe(base)
    expect(occurrenceKey(key, { ...OBSERVATION, sourceDigests: ['FDA_LABEL:abc123'] })).not.toBe(
      base,
    )
    expect(
      occurrenceKey(key, { ...OBSERVATION, parserVersion: 'label-extraction/2.5.0' }),
    ).not.toBe(base)
    expect(occurrenceKey(key, { ...OBSERVATION, corpusVersion: 'corpus/2026-09-30' })).not.toBe(
      base,
    )
  })

  it('cannot collide by shifting a source between list entries', () => {
    const left = occurrenceKey(key, { ...OBSERVATION, sourceDigests: ['aa', 'bb'] })
    const right = occurrenceKey(key, { ...OBSERVATION, sourceDigests: ['aabb'] })
    expect(left).not.toBe(right)
  })
})

describe('valueDigest is stable under serialization noise', () => {
  it('ignores key order', () => {
    expect(valueDigest({ a: 1, b: 2 })).toBe(valueDigest({ b: 2, a: 1 }))
  })

  it('treats an absent field and an explicitly undefined field as the same absence', () => {
    expect(valueDigest({ a: 1 })).toBe(valueDigest({ a: 1, b: undefined }))
  })

  it('does not treat null as absent, because a recorded null is a recorded value', () => {
    expect(valueDigest({ a: 1, b: null })).not.toBe(valueDigest({ a: 1 }))
  })

  it('distinguishes a nested change', () => {
    expect(valueDigest({ a: { b: 1 } })).not.toBe(valueDigest({ a: { b: 2 } }))
  })
})

describe('resurfacing', () => {
  const key = candidateKey(SUBJECT)
  const current = occurrenceKey(key, OBSERVATION)

  it('keeps an unchanged decided occurrence answered', () => {
    expect(
      shouldResurface({ currentOccurrenceKey: current, decidedOccurrenceKeys: [current] }),
    ).toBe(false)
  })

  it('reopens when the source behind a confirmed value has moved', () => {
    // A value confirmed against a label in August is not confirmed against what that label became in
    // November. Presenting it as still-answered would be the corpus going stale behind a green tick.
    const afterDrift = occurrenceKey(key, { ...OBSERVATION, sourceDigests: ['FDA_LABEL:xyz789'] })
    expect(
      shouldResurface({ currentOccurrenceKey: afterDrift, decidedOccurrenceKeys: [current] }),
    ).toBe(true)
  })

  it('shows an item nobody has judged', () => {
    expect(shouldResurface({ currentOccurrenceKey: current, decidedOccurrenceKeys: [] })).toBe(true)
  })
})
