import { describe, expect, it } from 'vitest'
import { PROOF_BOUNDARY_STAGES, type ProofBoundaryStage } from '@/lib/evidence'
import {
  recordEvidenceLine,
  mixedRecordEvidenceLine,
  plainHumanEvidence,
  stageToReachIndex,
} from '@/lib/evidence-view'

/**
 * The BLOCKING SAFETY RULE on `recordEvidenceLine` (lib/evidence-view.ts), pinned by test.
 *
 * The defect it exists to prevent: a record-level evidence line that aggregated the strongest
 * claim anywhere on the record made /r/bpc-157 announce human evidence — carried entirely by a
 * two-person intravenous safety pilot — directly above a tendon claim with no human data of any
 * kind. The same aggregate made rapamycin-for-longevity read identically to an approved gene
 * therapy, and let Casgevy's "what does treatment involve" logistics answer inherit
 * "reviewed by a regulator".
 *
 * So the rule is: ONE value prints only when every published outcome claim sits at the same
 * stage. Mixed stages print the deferral sentence and nothing stronger. The Evidence Record
 * refinement moved this line into the `.record-meta` strip on the record page and deleted the
 * "At a glance" heading; the function and its rule are unchanged, which is the point of testing
 * the function rather than the markup.
 *
 * This file must never be relaxed to accommodate a nicer-looking summary.
 */

const DEFERRAL = 'Depends on the question — see below'

describe('recordEvidenceLine — a single value only when every claim agrees', () => {
  it('returns null when there are no published outcome claims, so the row drops entirely', () => {
    // Never "N/A", never "No evidence" — a missing value drops its row.
    expect(recordEvidenceLine([])).toBeNull()
  })

  it('prints the one stage when a single claim is published', () => {
    expect(recordEvidenceLine(['animal_evidence'])).toBe(plainHumanEvidence('animal_evidence'))
  })

  it('prints one value when several claims all stop at the same stage', () => {
    expect(
      recordEvidenceLine(['animal_evidence', 'animal_evidence', 'animal_evidence'])
    ).toBe(plainHumanEvidence('animal_evidence'))
  })

  it('defers when any two claims differ — the BPC-157 defect', () => {
    // A two-person IV safety pilot (uncontrolled_human_intervention) beside a tendon claim with
    // animal data only. The record must not announce human evidence over the tendon claim.
    const line = recordEvidenceLine(['uncontrolled_human_intervention', 'animal_evidence'])
    expect(line).toBe(DEFERRAL)
    expect(line).not.toBe(plainHumanEvidence('uncontrolled_human_intervention'))
  })

  it('never picks the strongest stage on a mixed record, in either argument order', () => {
    const strongestFirst = recordEvidenceLine(['regulatory_evidence', 'animal_evidence'])
    const strongestLast = recordEvidenceLine(['animal_evidence', 'regulatory_evidence'])
    expect(strongestFirst).toBe(DEFERRAL)
    expect(strongestLast).toBe(DEFERRAL)
    expect(strongestFirst).toBe(strongestLast)
  })

  it('never picks the weakest stage on a mixed record either', () => {
    expect(recordEvidenceLine(['animal_evidence', 'controlled_human_evidence'])).not.toBe(
      plainHumanEvidence('animal_evidence')
    )
  })

  /**
   * Stricter than grouping by the five public reach positions, deliberately. Four canonical
   * stages share the "People" position, and printing the strongest of those would reintroduce
   * exactly the overstatement this rule exists to prevent — an uncontrolled study and a
   * replicated controlled trial are not the same claim.
   */
  it('defers even when every claim shares the same public reach position', () => {
    const sharedPosition: ProofBoundaryStage[] = [
      'observational_human_evidence',
      'uncontrolled_human_intervention',
      'controlled_human_evidence',
      'independently_supported_controlled_human_evidence',
    ]
    const positions = new Set(sharedPosition.map(stageToReachIndex))
    expect(positions.size, 'these four stages should share one public reach position').toBe(1)

    expect(recordEvidenceLine(sharedPosition)).toBe(DEFERRAL)
  })

  it('defers for every unordered pair of distinct stages, across the whole ladder', () => {
    for (const a of PROOF_BOUNDARY_STAGES) {
      for (const b of PROOF_BOUNDARY_STAGES) {
        if (a === b) continue
        expect(recordEvidenceLine([a, b]), `[${a}, ${b}] must defer`).toBe(DEFERRAL)
      }
    }
  })

  it('prints a stage-appropriate value for every stage when the record is uniform', () => {
    for (const stage of PROOF_BOUNDARY_STAGES) {
      const line = recordEvidenceLine([stage, stage])
      expect(line, `uniform record at ${stage}`).toBe(plainHumanEvidence(stage))
      // No raw enum reaches the reader from this path either.
      expect(line).not.toContain('_')
    }
  })

  it('never prints a score, percentage or rating in any branch', () => {
    const outputs = [
      recordEvidenceLine([]),
      ...PROOF_BOUNDARY_STAGES.map((s) => recordEvidenceLine([s])),
      recordEvidenceLine(['animal_evidence', 'regulatory_evidence']),
    ]
    for (const value of outputs) {
      if (value === null) continue
      expect(value).not.toMatch(/\d+\s*%/)
      expect(value).not.toMatch(/\b(score|rating|confidence|out of \d)\b/i)
    }
  })
})

/**
 * The only statement a MIXED record may print in its metadata strip.
 *
 * `recordEvidenceLine` refuses to name a stage when the claims disagree; the strip then printed
 * nothing, which left /r/bpc-157 spending a full phone screen on an approval sentence already
 * under the h1 and a date. This function fills that row — but only with a statement that is true
 * of EVERY claim on the record, which by construction cannot overstate any of them.
 *
 * These assertions are the same safety rule as the ones above, in its other direction: nothing
 * this function returns may be derived from the strongest claim on the record.
 */
describe('mixedRecordEvidenceLine — a universal negative, or nothing', () => {
  it('says nothing for a uniform record, which recordEvidenceLine already answers', () => {
    expect(mixedRecordEvidenceLine(['animal_evidence', 'animal_evidence'])).toBeNull()
    expect(mixedRecordEvidenceLine(['animal_evidence'])).toBeNull()
    expect(mixedRecordEvidenceLine([])).toBeNull()
  })

  it('states the shared negative when every claim stops short of a controlled trial', () => {
    // The BPC-157 record: two animal claims and two uncontrolled human claims.
    const line = mixedRecordEvidenceLine([
      'animal_evidence',
      'animal_evidence',
      'uncontrolled_human_intervention',
      'uncontrolled_human_intervention',
    ])
    expect(line).toBe('No controlled human trial on any question here')
  })

  it('says nothing as soon as one claim reaches a controlled trial or beyond', () => {
    // Casgevy: an approved gene therapy beside claims that stop well below approval. A shared
    // negative about controlled trials is false there, so there is no row.
    for (const strong of [
      'controlled_human_evidence',
      'independently_supported_controlled_human_evidence',
      'regulatory_evidence',
    ] as const) {
      expect(mixedRecordEvidenceLine(['animal_evidence', strong]), strong).toBeNull()
      expect(mixedRecordEvidenceLine([strong, 'animal_evidence']), strong).toBeNull()
    }
  })

  it('never names a stage, a strongest claim or a range', () => {
    const line = mixedRecordEvidenceLine(['biological_rationale_only', 'uncontrolled_human_intervention'])!
    for (const stage of PROOF_BOUNDARY_STAGES) {
      expect(line).not.toContain(plainHumanEvidence(stage))
      expect(line).not.toContain(stage)
    }
    expect(line).not.toMatch(/\d+\s*%/)
  })

  it('is order independent', () => {
    const a = mixedRecordEvidenceLine(['animal_evidence', 'uncontrolled_human_intervention'])
    const b = mixedRecordEvidenceLine(['uncontrolled_human_intervention', 'animal_evidence'])
    expect(a).toBe(b)
    expect(a).not.toBeNull()
  })
})
