import { describe, expect, it } from 'vitest'
import {
  CLAIM_EVENT_TYPES,
  CLAIM_EVENT_TYPE_ADMIN_LABELS,
  CLAIM_EVENT_TYPE_PUBLIC,
  DEVELOPMENT_GATES,
  DEVELOPMENT_GATE_ADMIN_LABELS,
  DEVELOPMENT_GATE_PUBLIC,
  isScientificFailure,
} from '@/lib/claim-events'

/**
 * lib/claim-events.ts is the only place a stored `claim_events` enum is allowed to become words.
 * Everything here guards one of two failure modes that have real precedent in this codebase:
 *
 * 1. A stored value reaching a reader verbatim. `target_engagement_not_shown` is a database
 *    token, not English, and CLAUDE.md forbids printing it. This is the same class of defect as
 *    the raw stage strings that search.spec.ts still scans result text for.
 * 2. A map going out of sync with its enum. `PROOF_BOUNDARY_STAGES` and the Postgres enum in
 *    db/schema.ts are synced by hand and nothing lints it; these two arrays inherit exactly that
 *    hazard. A missing key is not a type error at the point of use — `Record<K, string>` is
 *    satisfied at declaration, but a value added to db/schema.ts and not to the array here
 *    produces an `undefined` that renders as nothing at all.
 *
 * Every assertion iterates the FULL array rather than sampling, because the whole point is that
 * the twelfth member is as covered as the first.
 */

/**
 * Every enum token this codebase must never print, from both enums at once.
 *
 * Restricted to the multi-word values. Several single-word members (`safety`, `commercial`,
 * `other`, `unknown`) are also ordinary English words that legitimately appear in the copy —
 * "Development stopped for commercial reasons" is the correct sentence, not a leaked token. The
 * exact-match check below still covers those, so a map that returns its own key unchanged fails
 * whether the key is one word or five.
 */
const ALL_ENUM_TOKENS: readonly string[] = [...CLAIM_EVENT_TYPES, ...DEVELOPMENT_GATES].filter((v) =>
  v.includes('_')
)

/**
 * A raw enum value is an underscore-joined lowercase token. Public copy in this repo contains no
 * underscores at all, so the presence of one is the signal — this catches a stored value that was
 * interpolated into an otherwise hand-written sentence, not only a map that returns the value
 * unchanged.
 */
const RAW_ENUM_SHAPE = /\b[a-z]+(?:_[a-z]+)+\b/

function expectPublicSentence(value: string | undefined, key: string): void {
  expect(value, `no public sentence for "${key}"`).toBeTruthy()
  const sentence = value as string
  expect(sentence, `"${key}" prints its own raw enum value`).not.toBe(key)
  expect(sentence, `"${key}" leaks an underscore-joined enum token`).not.toMatch(RAW_ENUM_SHAPE)
  for (const token of ALL_ENUM_TOKENS) {
    expect(sentence, `"${key}" contains the raw enum token "${token}"`).not.toContain(token)
  }
  // A sentence, not a label: a fragment reads as a badge, and a badge beside a treatment name
  // reads as a verdict.
  expect(sentence.trim().endsWith('.'), `"${key}" is not written as a sentence`).toBe(true)
  expect(sentence.trim().length, `"${key}" is too short to define itself`).toBeGreaterThan(30)
}

describe('CLAIM_EVENT_TYPE_PUBLIC covers every event type and never returns a raw enum', () => {
  it('has a public sentence for every member of CLAIM_EVENT_TYPES and no extra keys', () => {
    expect(Object.keys(CLAIM_EVENT_TYPE_PUBLIC).sort()).toEqual([...CLAIM_EVENT_TYPES].sort())
  })

  for (const type of CLAIM_EVENT_TYPES) {
    it(`${type} maps to a plain sentence, not its stored value`, () => {
      expectPublicSentence(CLAIM_EVENT_TYPE_PUBLIC[type], type)
    })
  }
})

describe('DEVELOPMENT_GATE_PUBLIC covers every gate and never returns a raw enum', () => {
  it('has a public sentence for every member of DEVELOPMENT_GATES and no extra keys', () => {
    expect(Object.keys(DEVELOPMENT_GATE_PUBLIC).sort()).toEqual([...DEVELOPMENT_GATES].sort())
  })

  for (const gate of DEVELOPMENT_GATES) {
    it(`${gate} maps to a plain sentence, not its stored value`, () => {
      expectPublicSentence(DEVELOPMENT_GATE_PUBLIC[gate], gate)
    })
  }
})

describe('admin label maps stay complete', () => {
  // Admin labels are never rendered publicly, but an editor picking from a dropdown with a blank
  // option cannot tell which event type they selected, and a mislabelled event is published copy.
  it('CLAIM_EVENT_TYPE_ADMIN_LABELS has exactly one label per event type', () => {
    expect(Object.keys(CLAIM_EVENT_TYPE_ADMIN_LABELS).sort()).toEqual([...CLAIM_EVENT_TYPES].sort())
    for (const type of CLAIM_EVENT_TYPES) {
      expect(CLAIM_EVENT_TYPE_ADMIN_LABELS[type], `no admin label for "${type}"`).toBeTruthy()
    }
  })

  it('DEVELOPMENT_GATE_ADMIN_LABELS has exactly one label per gate', () => {
    expect(Object.keys(DEVELOPMENT_GATE_ADMIN_LABELS).sort()).toEqual([...DEVELOPMENT_GATES].sort())
    for (const gate of DEVELOPMENT_GATES) {
      expect(DEVELOPMENT_GATE_ADMIN_LABELS[gate], `no admin label for "${gate}"`).toBeTruthy()
    }
  })
})

/**
 * These five strings are specified verbatim in the build contract because getting them slightly
 * wrong is how this section becomes an accusation. They are pinned here so a rewrite has to be a
 * deliberate decision rather than a passing edit.
 */
describe('the safety-critical public sentences are exact', () => {
  it('target_engagement_not_shown defines target engagement in the same sentence it uses it', () => {
    expect(CLAIM_EVENT_TYPE_PUBLIC.target_engagement_not_shown).toBe(
      'Target engagement — whether the treatment actually reached and acted on its intended biological target — was never measured.'
    )
  })

  it('target_engagement_shown_no_clinical_benefit separates the target from the outcome', () => {
    expect(CLAIM_EVENT_TYPE_PUBLIC.target_engagement_shown_no_clinical_benefit).toBe(
      'The treatment was shown to act on its intended target, but the expected clinical benefit did not follow.'
    )
  })

  it('program_stopped_commercial states that no scientific result caused it', () => {
    expect(CLAIM_EVENT_TYPE_PUBLIC.program_stopped_commercial).toBe(
      'Development stopped for commercial reasons. No scientific result is recorded as the cause.'
    )
  })

  it('program_stopped_scientific points at the recorded result rather than asserting one', () => {
    expect(CLAIM_EVENT_TYPE_PUBLIC.program_stopped_scientific).toBe(
      'Development stopped after a scientific result, recorded below.'
    )
  })

  it('the unknown gate admits the gap instead of guessing at one', () => {
    expect(DEVELOPMENT_GATE_PUBLIC.unknown).toBe(
      'Public information does not show where the development chain broke.'
    )
  })

  /**
   * BLOCKING — an absolute negative about the research literature must say what it is a negative
   * OF.
   *
   * `trial_design_limit` read "No study built to answer this question has been run." and rendered
   * on the BPC-157 gut-healing record directly under that page's own statement that a company-run
   * human trial programme in inflammatory bowel disease "was registered but never published
   * results", and on the safety claim whose corpus carries NCT02637284, a registered Phase I
   * record with no results ever posted. Both studies were run. The site was denying the existence
   * of research its own sources record, which is the highest-severity defect this product can
   * carry: it is docs/evidence-classification.md's "silence read as disproof" written by the site
   * itself.
   *
   * So a sentence in either map may deny that a study, trial, result or dataset exists only when
   * the same sentence says it is denying a REPORTED, PUBLISHED or RECORDED one. A study that ran
   * and never reported is still a study, and every one of these strings prints on records whose
   * sources include exactly that.
   *
   * Scope note, deliberate: this rule is about the existence of RESEARCH, not about what a piece
   * of research measured. `target_engagement_not_shown` says target engagement "was never
   * measured", which is an absence inside the work an event cites rather than a claim that no
   * work exists, and it is pinned verbatim above by the build contract. Widening this pattern to
   * catch it would force that caveat to be narrowed, which is a weakening, not a fix.
   */
  const DENIES_RESEARCH_EXISTS: RegExp[] = [
    /\bno (?:study|studies|trial|trials|result|results|data|evidence|research)\b/i,
    /\bnone of the (?:studies|trials|evidence)\b/i,
    /\bnever (?:been )?(?:run|conducted|carried out|done|performed|tested|studied)\b/i,
    /\bhas (?:ever )?been run\b/i,
  ]

  /** What makes such a negative checkable: it is scoped to what reached the public record. */
  const SCOPED_TO_THE_RECORD = /\b(?:reported|published|posted|recorded|on record|public information)\b/i

  it('no public sentence denies that a study exists without scoping it to what was reported', () => {
    for (const [key, sentence] of Object.entries({
      ...CLAIM_EVENT_TYPE_PUBLIC,
      ...DEVELOPMENT_GATE_PUBLIC,
    })) {
      const absolute = DENIES_RESEARCH_EXISTS.find((pattern) => pattern.test(sentence))
      if (!absolute) continue
      expect(
        SCOPED_TO_THE_RECORD.test(sentence),
        `"${key}" asserts an unqualified absolute (${absolute}) about the existence of research: ` +
          `"${sentence}". A study that was registered, run and never reported is still a study. ` +
          `Say that nothing has REPORTED, PUBLISHED or RECORDED a result, or say nothing.`
      ).toBe(true)
    }
  })

  it('the two trial-design sentences state absence of a reported result, not absence of a study', () => {
    expect(CLAIM_EVENT_TYPE_PUBLIC.trial_design_limit).toBe(
      'No study designed to settle this question has reported its results.'
    )
    expect(DEVELOPMENT_GATE_PUBLIC.trial_design).toBe(
      'The chain stops at study design: no study with the size, length, comparison group and chosen measure this question needs has published its results.'
    )
  })

  it('no public sentence says a target or treatment was disproved by a missed endpoint', () => {
    // "Never say a target, mechanism or treatment is invalid because a trial missed its endpoint"
    // is rule 1 of the SAFETY RULE block on DEVELOPMENT_GATE_PUBLIC. A gate names an unresolved
    // step; it is not a verdict on the biology.
    const forbidden = /\b(disproved|disproven|does not work|doesn't work|invalid|ineffective|refuted)\b/i
    for (const [key, sentence] of Object.entries({
      ...CLAIM_EVENT_TYPE_PUBLIC,
      ...DEVELOPMENT_GATE_PUBLIC,
    })) {
      expect(sentence, `"${key}" states a verdict on the treatment rather than naming the gap`).not.toMatch(
        forbidden
      )
    }
  })
})

/**
 * A programme shelved for funding, portfolio, patent or market reasons produced no evidence about
 * whether the treatment works. Presenting one as a scientific failure invents a result no source
 * recorded, which is the fabrication rule in CLAUDE.md.
 */
describe('isScientificFailure keeps commercial discontinuation out of the science', () => {
  it('is false for program_stopped_commercial', () => {
    expect(isScientificFailure('program_stopped_commercial')).toBe(false)
  })

  it('is false for other — the category carries no recorded scientific finding by definition', () => {
    expect(isScientificFailure('other')).toBe(false)
  })

  it('is true for program_stopped_scientific, which is the same event with a recorded cause', () => {
    expect(isScientificFailure('program_stopped_scientific')).toBe(true)
  })

  it('is true for every remaining event type', () => {
    const nonScientific = new Set(['program_stopped_commercial', 'other'])
    for (const type of CLAIM_EVENT_TYPES) {
      expect(isScientificFailure(type), `isScientificFailure("${type}")`).toBe(!nonScientific.has(type))
    }
  })

  it('returns a boolean for every member, so no event type falls through undefined', () => {
    for (const type of CLAIM_EVENT_TYPES) {
      expect(typeof isScientificFailure(type)).toBe('boolean')
    }
  })
})
