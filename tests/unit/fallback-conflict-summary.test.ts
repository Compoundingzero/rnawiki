import { describe, expect, it } from 'vitest'
import { fallbackConflictSummary } from '@/lib/evidence-view'
import type { ClaimEvidenceView, EvidenceSourceView } from '@/lib/types'
import type { EvidenceRelationship } from '@/lib/evidence'

/**
 * The stand-in paragraph for "What did not work or conflicts with this answer" on a claim that
 * carries no recorded `claim_events` but does have curated evidence that conflicts with or limits
 * the answer.
 *
 * The property under test is that it is DETERMINISTIC. It joins stored strings — the source title
 * and `directlyMeasuredResult`, written by an editor against a real source and already through the
 * prose gate — and nothing about it is generated at request time. That matters for two reasons: the
 * same claim must produce the same sentence on every request (a paragraph about what failed cannot
 * be allowed to drift between page loads), and a sentence assembled at request time could not be
 * reviewed before publication.
 *
 * It returns null when no `contradicts` or `limits` relationship exists, which is also the signal
 * the caller uses to drop the whole section rather than print an empty state. "None recorded"
 * under this heading would read as a positive finding about a question nobody asked.
 *
 * The load-bearing assertion in this file is the one about a limits-only claim. This paragraph
 * prints under a heading whose first four words are "What did not work", and a `limits` source is
 * routinely a null-for-harm result (an off-target screen that found nothing) or an absence of
 * evidence (a review reporting that no safety study exists). Neither is a failure, and neither may
 * be filed as one: the paragraph must open by saying plainly that nothing conflicts.
 */

function source(id: number, title: string): EvidenceSourceView {
  return {
    id,
    title,
    authors: null,
    publicationYear: null,
    journalOrIssuer: null,
    doi: null,
    pmid: null,
    clinicalTrialId: null,
    regulatoryUrl: null,
    sourceType: 'fixture source',
    studyDesign: null,
    species: null,
    sampleSize: null,
    endpoint: null,
    retractionStatus: null,
  }
}

function link(
  relationship: EvidenceRelationship,
  claimPartAddressed: string,
  directlyMeasuredResult: string,
  id = 1
): ClaimEvidenceView {
  return {
    relationship,
    claimPartAddressed,
    directlyMeasuredResult,
    independentGroupStatus: false,
    source: source(id, `Fixture source ${id}`),
  }
}

describe('fallbackConflictSummary returns null rather than an empty state', () => {
  it('is null for a claim with no linked evidence at all', () => {
    expect(fallbackConflictSummary([])).toBeNull()
  })

  it('is null when every linked source only supports the answer', () => {
    expect(
      fallbackConflictSummary([
        link('supports', 'tendon healing', 'Healing was faster in treated rats.', 1),
        link('supports', 'tendon healing', 'The same effect appeared in a second rat model.', 2),
      ])
    ).toBeNull()
  })

  it('is null when the only non-supporting evidence is background context', () => {
    // `contextualizes` is background. Treating it as a conflict would print a failure section for
    // a claim where nothing failed.
    expect(
      fallbackConflictSummary([
        link('supports', 'tendon healing', 'Healing was faster in treated rats.', 1),
        link('contextualizes', 'regulatory status', 'The compound is not approved in any market.', 2),
      ])
    ).toBeNull()
  })
})

describe('fallbackConflictSummary is a deterministic join of stored strings', () => {
  const evidence = [
    link('supports', 'tendon healing', 'Healing was faster in treated rats.', 1),
    link('limits', 'human relevance', 'No controlled human trial has published a result.', 2),
    link('contradicts', 'the healing effect', 'A second rat model showed no difference from control.', 3),
  ]

  it('returns the same string every time it is called with the same input', () => {
    const first = fallbackConflictSummary(evidence)
    const second = fallbackConflictSummary(evidence)
    const third = fallbackConflictSummary([...evidence])
    expect(first).not.toBeNull()
    expect(second).toBe(first)
    expect(third).toBe(first)
  })

  it('reproduces the editor-written results verbatim, adding no claim of its own', () => {
    const summary = fallbackConflictSummary(evidence)!
    expect(summary).toContain('No controlled human trial has published a result.')
    expect(summary).toContain('A second rat model showed no difference from control.')
    // The supporting source's result must not be dragged into a section about what did not work.
    expect(summary).not.toContain('Healing was faster in treated rats.')
  })

  it('names the source each result came from, so the reader can follow it up', () => {
    const summary = fallbackConflictSummary(evidence)!
    expect(summary).toContain('Fixture source 2')
    expect(summary).toContain('Fixture source 3')
    // "One cited source" told the reader nothing they could act on, and two links joined into
    // "One cited source… One cited source…".
    expect(summary).not.toContain('One cited source')
  })

  it('quotes the title and never lets it become the subject of the sentence', () => {
    // A journal title is sentence-shaped. Printed first and unquoted, "Emerging Use of BPC-157
    // in Orthopaedic Sports Medicine: A Systematic Review limits how far this answer reaches"
    // parses as "A Systematic Review limits how far this answer reaches", which no source said.
    const summary = fallbackConflictSummary([
      link('limits', 'human relevance', 'No clinical safety data exist.', 1),
    ])!
    expect(summary).toContain('“Fixture source 1”')
    // The relationship is stated before the title, in RNAwiki's own words.
    expect(summary.indexOf('limits how far this answer reaches')).toBeLessThan(
      summary.indexOf('Fixture source 1')
    )
    // And no sentence in the paragraph opens with the stored title.
    for (const part of summary.split('. ')) {
      expect(part.startsWith('Fixture source')).toBe(false)
    }
  })

  it('never prints the internal claimPartAddressed field as prose', () => {
    // A stored routing field, slash-joined in the corpus ("precision of the CRISPR-Cas9 edit /
    // off-target risk"). Concatenated into a sentence it reads as a database column.
    const summary = fallbackConflictSummary(evidence)!
    expect(summary).not.toContain('human relevance')
    expect(summary).not.toContain('the healing effect')
  })

  it('says plainly that nothing conflicts when every non-supporting row only limits', () => {
    const summary = fallbackConflictSummary([
      link('supports', 'tendon healing', 'Healing was faster in treated rats.', 1),
      link('limits', 'human relevance', 'No human trial has published a result.', 2),
    ])!
    expect(summary.startsWith('No recorded result conflicts with this answer.')).toBe(true)
    expect(summary).toContain('limits how far this answer reaches')
    // The bare "limits this answer on X" sentence may never stand alone under a heading that
    // says something did not work.
    expect(summary).not.toMatch(/^[^.]*limits this answer/)
  })

  it('does not claim nothing conflicts when a conflicting row exists', () => {
    const summary = fallbackConflictSummary([
      link('contradicts', 'the healing effect', 'No difference from control.', 1),
      link('limits', 'human relevance', 'No human trial has published a result.', 2),
    ])!
    expect(summary).not.toContain('No recorded result conflicts')
  })

  it('names conflicting evidence before limiting evidence, whatever order the rows arrive in', () => {
    // Reading order is fixed by the function, not by claimEvidence.displayPriority, so two records
    // with the same relationships always read the same way.
    const summary = fallbackConflictSummary(evidence)!
    const reversed = fallbackConflictSummary([...evidence].reverse())!
    expect(summary.indexOf('conflicts with')).toBeLessThan(summary.indexOf('limits'))
    expect(reversed.indexOf('conflicts with')).toBeLessThan(reversed.indexOf('limits'))
  })

  it('uses the plain verb for each relationship and never the raw relationship value', () => {
    const contradicts = fallbackConflictSummary([
      link('contradicts', 'the healing effect', 'No difference from control.', 1),
    ])!
    const limits = fallbackConflictSummary([
      link('limits', 'human relevance', 'No human trial has published a result.', 1),
    ])!
    expect(contradicts).toContain('conflicts with this answer')
    expect(limits).toContain('limits how far this answer reaches')
    expect(contradicts).not.toContain('contradicts this')
    // No raw enum, no underscore-joined token, anywhere in the assembled paragraph.
    expect(contradicts).not.toMatch(/\b[a-z]+(?:_[a-z]+)+\b/)
    expect(limits).not.toMatch(/\b[a-z]+(?:_[a-z]+)+\b/)
  })

  it('trims stored whitespace so a padded field cannot produce a double space mid-sentence', () => {
    const summary = fallbackConflictSummary([
      link('limits', '  human relevance  ', '  No human trial has published a result.  ', 1),
    ])!
    expect(summary).toBe(
      'No recorded result conflicts with this answer. A cited source limits how far this answer reaches: “Fixture source 1”. No human trial has published a result.'
    )
    expect(summary).not.toMatch(/ {2}/)
  })

  it('covers every conflicting and limiting row, not just the first', () => {
    const summary = fallbackConflictSummary([
      link('limits', 'part one', 'Result one.', 1),
      link('limits', 'part two', 'Result two.', 2),
      link('contradicts', 'part three', 'Result three.', 3),
    ])!
    expect(summary).toContain('Result one.')
    expect(summary).toContain('Result two.')
    expect(summary).toContain('Result three.')
    expect(summary).toContain('Fixture source 1')
    expect(summary).toContain('Fixture source 2')
    expect(summary).toContain('Fixture source 3')
  })

  it('never states a score, a percentage or a verdict about the treatment', () => {
    const summary = fallbackConflictSummary(evidence)!
    expect(summary).not.toMatch(/\d+\s*%/)
    expect(summary).not.toMatch(/\b(disproved|does not work|ineffective|confidence)\b/i)
  })
})
