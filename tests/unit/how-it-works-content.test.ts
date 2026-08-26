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
  it('explains the static plain-first reading path while preserving exact detail', () => {
    for (const phrase of [
      'Plain first. Exact when you need it.',
      'the intended use, the clearest research result and the biggest unanswered question',
      'The short answer must make sense without a glossary',
      'its familiar meaning appears in the same sentence',
      'Readers do not need to hover or tap to understand the main point',
      'More about this medicine',
      'safety information and how the medicine was given',
      'not mixed into the short evidence conclusion',
      'personal dosing advice',
      'See how we know',
      'Simpler wording changes the reading order, not the underlying evidence',
    ]) {
      expect(normalizedSource).toContain(phrase)
    }
    expect(normalizedSource).not.toContain('Hover or keyboard focus previews it')
    expect(normalizedSource).not.toContain('click or tap keeps it open')
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
    expect(normalizedSource).toContain(
      'does not automatically fetch or verify a web page merely because a contributor entered its address',
    )
    expect(normalizedSource).not.toContain('broken links')
  })

  it('describes one attributed account without inventing direct edit or publication access', () => {
    for (const phrase of [
      'RNAWiki has one account type',
      'Every signed-in account can post a community note',
      'permissions on the same account, not different kinds of login',
      'takes the author’s account identity and name from the signed-in session',
      'A note or edit request cannot supply a different author',
      'become unchangeable when submitted',
      'show the contributor in the public review queue or history',
      'RNA Intelligence does not check or fact-check it',
      'signing in never gives anyone direct publication access',
    ]) {
      expect(normalizedSource).toContain(phrase)
    }
    for (const removedClaim of [
      'physician badge',
      'verified physician',
      'medical licence',
      'National Provider Identifier',
    ]) {
      expect(normalizedSource.toLowerCase()).not.toContain(removedClaim.toLowerCase())
    }
  })

  it('separates proposal checks, full RNA Intelligence and human materialization', () => {
    for (const phrase of [
      'A contributor proposes a sourced change',
      'Saving or submitting a proposal changes nothing public',
      'does not add a fact to the medicine record',
      'A contributor draft first receives smaller checks',
      'do not run the full evidence engine',
      'The complete checks run again from locked database rows during publication',
      'a steward or administrator can ask RNAWiki to build a complete replacement',
      'Two scientifically qualified reviewers sign that exact replacement before it can be published',
    ]) {
      expect(normalizedSource).toContain(phrase)
    }
    expect(normalizedSource).not.toContain('Someone adds a fact and its source')
    expect(normalizedSource).not.toContain(
      'If they accept a change to a public conclusion, RNAWiki builds a complete replacement',
    )
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
      'Correcting medicine names',
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
    expect(normalizedSource).not.toContain('older record')
    expect(normalizedSource).not.toContain('legacy summary')
  })

  it('avoids unexplained system jargon in reader-facing copy', () => {
    expect(source).not.toContain('checks the wiring')
    expect(source).not.toContain('dependency-derived')
    expect(source).not.toContain('provenance')
    expect(source).not.toContain('canonical graph')
    expect(source).not.toContain('atomic publication')
    expect(normalizedSource).toContain('The original internet address is never stored')
  })

  it('documents stored source checks without claiming remote-link verification', () => {
    expect(normalizedIntelligenceDoc).toContain('malformed or internally unresolved source records')
    expect(normalizedIntelligenceDoc).toContain(
      'entering a web address does not make RNA Intelligence fetch or verify that page',
    )
    expect(normalizedIntelligenceDoc).not.toContain('broken source links')
  })
})
