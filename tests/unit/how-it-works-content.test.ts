import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(join(process.cwd(), 'app/how-it-works/page.tsx'), 'utf8')
const normalizedSource = source.replace(/\s+/g, ' ')
const intelligenceDoc = readFileSync(join(process.cwd(), 'docs/rna-intelligence-v2.md'), 'utf8')
const normalizedIntelligenceDoc = intelligenceDoc.replace(/\s+/g, ' ')
const freshnessDoc = readFileSync(join(process.cwd(), 'docs/evidence-freshness.md'), 'utf8')
const normalizedFreshnessDoc = freshnessDoc.replace(/\s+/g, ' ')

describe('How this works copy contract', () => {
  it('explains the plain-first reading path without making technical detail hover-only', () => {
    for (const phrase of [
      'Plain first. Exact when you need it.',
      'the intended use, the clearest recorded result and the biggest unanswered question',
      'the explanation is attached to that phrase',
      'Hover or keyboard focus previews it',
      'click or tap keeps it open',
      'starts with everyday meaning',
      'More about this medicine',
      'general safety and how the medicine was given',
      'not mixed into the short evidence conclusion',
      'personal dosing advice',
      'See how we know',
      'Simpler wording changes the reading order, not the underlying evidence',
    ]) {
      expect(normalizedSource).toContain(phrase)
    }
  })

  it('states the material RNA Intelligence 2.0 improvements and the human boundary', () => {
    for (const phrase of [
      'What changed in version 2.0',
      'Conclusions are limited to one use',
      'Sources are saved as dated versions',
      'The full conclusion changes together',
      'Reviews are tied to the exact version',
      'New evidence creates follow-up work',
      'It does not write medicine facts or decide what the evidence means',
      'named checks covering sources, scope, dates, evidence links, conclusion consistency, plain language and source updates',
      'one focused case that makes each named check run',
    ]) {
      expect(normalizedSource).toContain(phrase)
    }
    expect(normalizedSource).toContain('supports the statement, contradicts it, or adds context')
    expect(normalizedSource).toContain('a human reviewer’s interpretation')
  })

  it('explains rollout and current monitoring limits instead of presenting target architecture as universal', () => {
    expect(normalizedSource).toContain('Current coverage:')
    expect(normalizedSource).toContain('one verified source at a time')
    expect(normalizedSource).toContain('currently checks ClinicalTrials.gov records')
    expect(normalizedSource).toContain('Other source types are not yet scheduled')
    expect(normalizedSource).toContain('Accepting a proposal does not by itself rewrite')
    expect(normalizedSource).toContain('development programmes recorded')
    expect(source).toContain('EVIDENCE_RULE_CODES.length')
  })

  it('documents the 2.1 mechanism and timeline checks in ordinary language', () => {
    for (const phrase of [
      'New in RNA Intelligence 2.1',
      'three to five ordered stages',
      'Measured in people',
      'that report alone is not labelled as a direct measurement',
      'If there are no reviewed source events, RNAWiki hides the timeline',
      'it does not write the map or decide the medical meaning',
      'does not invent either one to make coverage look complete',
    ]) {
      expect(normalizedSource).toContain(phrase)
    }
    expect(normalizedSource).toContain('Dose means the amount given')
    expect(normalizedSource).toContain('sponsor—the company or organisation running the study')
    expect(normalizedSource).toContain('makes the final decision and explains it')
  })

  it('explains exact registry refreshes and the scientific-revision stop without implying a dead action', () => {
    for (const phrase of [
      'only exact registry facts',
      'without writing medical text',
      'Two independent people review that submission',
      'A steward or administrator can then build a complete proposed successor',
      'two independent qualified reviewers before publication',
      'There is no one-click claim-rewrite form',
      'When that version uses the reviewed presentation format',
      'any sourced timeline events are included too',
      'RNAWiki never invents the replacement wording',
    ]) {
      expect(normalizedSource).toContain(phrase)
    }
    expect(normalizedSource).not.toContain(
      'saved sources, mechanism map and timeline, and conclusion',
    )
    expect(normalizedSource).not.toContain(
      'source links, mechanism map, timeline and conclusion are checked together',
    )
    expect(normalizedSource).not.toContain('When the parser finds')
    expect(normalizedSource).toContain(
      'When RNAWiki finds that only exact registry facts have changed',
    )
  })

  it('does not claim a source refresh invents presentation content for an older publication', () => {
    expect(normalizedIntelligenceDoc).toContain(
      'A reviewed mechanism map and any sourced timeline events are inherited only when they are present in the current publication',
    )
    expect(normalizedIntelligenceDoc).toContain(
      'the source-refresh path does not invent either one',
    )
    expect(normalizedIntelligenceDoc).not.toContain(
      'saved sources, mechanism map and timeline, and conclusion',
    )
    expect(normalizedFreshnessDoc).toContain(
      'changes only the parser-normalized registry fields and exact source binding',
    )
    expect(normalizedFreshnessDoc).toContain(
      'a reviewed mechanism map and any sourced timeline events are inherited only when the current publication already contains them',
    )
    expect(normalizedFreshnessDoc).toContain('a steward or administrator must author')
    expect(normalizedFreshnessDoc).not.toContain(
      'saved sources, mechanism map and timeline, and conclusion',
    )
  })

  it('explains the sourced identity-only path without claiming machine verification', () => {
    for (const phrase of [
      'Correcting older records',
      'either the medicine name or its trade or brand name',
      'waits for one independent human reviewer',
      'People cannot review their own correction',
      'does not fetch that page or claim that RNA Intelligence proved the name is true',
      'database checks that the old name still matches',
      'Evidence, safety, effectiveness, trials, mechanisms and conclusions cannot use this small correction path',
      'remain visible in the public history but are archived',
    ]) {
      expect(normalizedSource).toContain(phrase)
    }
  })

  it('avoids unexplained system jargon in reader-facing copy', () => {
    expect(source).not.toContain('checks the wiring')
    expect(source).not.toContain('dependency-derived')
    expect(source).not.toContain('provenance')
    expect(source).not.toContain('canonical graph')
    expect(source).not.toContain('atomic publication')
    expect(normalizedSource).toContain('US National Provider Identifier (NPI)')
    expect(normalizedSource).toContain('The original internet address is never stored')
  })
})
