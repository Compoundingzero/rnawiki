import { describe, expect, it } from 'vitest'

import {
  PAGE_STATEMENT_GATES,
  failedGates,
  gatesPassed,
  runPageStatementGates,
  type GateInput,
} from '@/lib/page-statements/gates'
import {
  derivePageStatementRiskClass,
  pageStatementReviewEligibility,
  qualificationIsRelevant,
  requiredQualifiedApprovals,
  reviewerIdentityKey,
  mayReviewPageStatements,
} from '@/lib/page-statements/policy'
import {
  PAGE_STATEMENT_APPROVALS_REQUIRED,
  PAGE_STATEMENT_KEYS,
  pageStatementDefinition,
} from '@/lib/page-statements/types'
import { pageReviewPill } from '@/lib/page-statements/overlay'
import { wordDiff } from '@/lib/page-statements/current'

/**
 * The checks that decide whether three approvals are enough.
 *
 * `docs/rna-intelligence-v2.md` makes the rule catalog part of the contract: every stable code a
 * check can emit has to be registered and has to have an executable focused case. The first test
 * below enforces that for this catalog, so a gate added without a case fails here rather than
 * reaching a reviewer as an unexplained refusal.
 */

const BASE: GateInput = {
  statementKey: 'hero.strongest_result',
  currentText: 'Fixture strength rose over twelve weeks compared with a dummy treatment.',
  proposedText: 'Fixture strength rose over twelve weeks against a dummy treatment.',
  changeCategory: 'plain_language_clarity',
  riskClass: 'copy_only',
  evidenceState: 'source_checked_draft',
  sources: [],
  evidencePacket: {},
  identityWarning: false,
  sourceDigestCurrent: true,
  medicineName: 'Fixturine',
  medicineAliases: ['fixturine-sulfate'],
}

const run = (overrides: Partial<GateInput>) => runPageStatementGates({ ...BASE, ...overrides })
const failed = (overrides: Partial<GateInput>): string[] =>
  failedGates(run(overrides)).map((gate) => gate.code)

describe('the gate catalog', () => {
  it('registers every code exactly once', () => {
    const codes = PAGE_STATEMENT_GATES.map((gate) => gate.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('runs every registered gate on every proposal', () => {
    const results = run({})
    expect(results.map((result) => result.code).sort()).toEqual(
      PAGE_STATEMENT_GATES.map((gate) => gate.code).sort(),
    )
  })

  it('gives every gate a title and a reason a reader could check', () => {
    for (const gate of PAGE_STATEMENT_GATES) {
      expect(gate.title.length).toBeGreaterThan(10)
      expect(gate.rationale.length).toBeGreaterThan(20)
      expect(gate.rationale).toMatch(/\.$/)
    }
  })

  it('passes a plain rewording that changes nothing about the claim', () => {
    expect(gatesPassed(run({}))).toBe(true)
  })

  it('says what triggered a failure, and says nothing when it passed', () => {
    const results = run({ proposedText: 'It causes strength in everyone.' })
    for (const result of results) {
      if (result.passed) expect(result.detail).toBe('')
      else expect(result.detail.length).toBeGreaterThan(0)
    }
  })
})

describe('each gate, on the thing it exists to catch', () => {
  it('medical_claim_without_source', () => {
    expect(
      failed({
        riskClass: 'scientific_meaning',
        changeCategory: 'factual_accuracy',
        proposedText: 'Fixture strength rose by one fifth over twelve weeks.',
      }),
    ).toContain('medical_claim_without_source')
  })

  it('population_broadened', () => {
    expect(
      failed({ proposedText: 'Fixture strength rose in everyone over twelve weeks.' }),
    ).toContain('population_broadened')
  })

  it('association_became_cause', () => {
    expect(
      failed({
        currentText: 'Higher intake was associated with greater strength in one cohort study.',
        proposedText: 'Higher intake causes greater strength.',
      }),
    ).toContain('association_became_cause')
  })

  it('hedge_removed', () => {
    expect(
      failed({
        currentText: 'It may raise strength over twelve weeks.',
        proposedText: 'It does raise strength over twelve weeks.',
      }),
    ).toContain('hedge_removed')
  })

  it('biomarker_as_outcome', () => {
    expect(
      failed({
        currentText: 'Cholesterol levels fell by about half over seventeen months.',
        proposedText: 'Heart attacks fell by about half over seventeen months.',
      }),
    ).toContain('biomarker_as_outcome')
  })

  it('animal_as_human', () => {
    expect(
      failed({
        currentText: 'Strength rose in mice over twelve weeks.',
        proposedText: 'Strength rose in people over twelve weeks.',
      }),
    ).toContain('animal_as_human')
  })

  it('prediction_as_observation', () => {
    expect(
      failed({
        currentText: 'A model predicted a fall in the waste chemical.',
        proposedText: 'The waste chemical fell.',
      }),
    ).toContain('prediction_as_observation')
  })

  it('limitation_removed', () => {
    expect(
      failed({
        riskClass: 'scientific_meaning',
        currentText: 'Strength rose, but only in one small study.',
        proposedText: 'Strength rose over twelve weeks.',
      }),
    ).toContain('limitation_removed')
  })

  it('formulation_broadened', () => {
    expect(
      failed({ proposedText: 'Strength rose over twelve weeks with all forms of it.' }),
    ).toContain('formulation_broadened')
  })

  it('class_became_specific', () => {
    expect(
      failed({
        currentText: 'Statins reduce this risk in large trials.',
        proposedText: 'Fixturine reduces this risk.',
      }),
    ).toContain('class_became_specific')
  })

  it('component_became_combination', () => {
    expect(
      failed({ proposedText: 'Strength rose over twelve weeks combined with a second compound.' }),
    ).toContain('component_became_combination')
  })

  it('absence_became_safe', () => {
    expect(
      failed({
        currentText: 'No evidence was found about taking it during pregnancy.',
        proposedText: 'It is safe to take during pregnancy.',
      }),
    ).toContain('absence_became_safe')
  })

  it('individual_dosing', () => {
    expect(failed({ proposedText: 'Take 5 g of it each day for twelve weeks.' })).toContain(
      'individual_dosing',
    )
  })

  it('start_or_stop_instruction', () => {
    expect(failed({ proposedText: 'Stop taking your medication before starting this.' })).toContain(
      'start_or_stop_instruction',
    )
  })

  it('rate_without_denominator', () => {
    expect(failed({ proposedText: 'Strength rose in 38% of them over twelve weeks.' })).toContain(
      'rate_without_denominator',
    )
  })

  it('boxed_warning_weakened', () => {
    expect(
      failed({
        currentText: 'It carries a boxed warning because the reaction can be fatal.',
        proposedText: 'It carries a boxed warning, though the reaction is rare.',
      }),
    ).toContain('boxed_warning_weakened')
  })

  it('conflict_hidden', () => {
    expect(
      failed({
        currentText: 'Results are mixed across the completed trials.',
        proposedText: 'Results favour it across the completed trials.',
      }),
    ).toContain('conflict_hidden')
  })

  it('wrong_medicine', () => {
    expect(
      failed({
        currentText: 'Fixturine raised strength over twelve weeks.',
        proposedText: 'Metformin raised strength over twelve weeks.',
      }),
    ).toContain('wrong_medicine')
  })

  it('stale_source_surface', () => {
    expect(failed({ sourceDigestCurrent: false })).toContain('stale_source_surface')
  })

  it('unresolved_identity_warning', () => {
    expect(failed({ identityWarning: true })).toContain('unresolved_identity_warning')
  })

  it('plain_language_contract, on length', () => {
    const limit = pageStatementDefinition('hero.strongest_result').wordLimit
    const long = Array.from({ length: limit + 5 }, (_, index) => `word${index}`).join(' ')
    expect(failed({ proposedText: long })).toContain('plain_language_contract')
  })

  it('plain_language_contract, on a term the first read explains rather than uses', () => {
    expect(failed({ proposedText: 'Strength rose against placebo over twelve weeks.' })).toContain(
      'plain_language_contract',
    )
  })

  it('internal_field_exposed', () => {
    expect(failed({ proposedText: 'Strength rose per the layman_how_it_works field.' })).toContain(
      'internal_field_exposed',
    )
  })

  it('markup_or_script', () => {
    expect(
      failed({ proposedText: 'Strength rose <script>alert(1)</script> over twelve weeks.' }),
    ).toContain('markup_or_script')
  })

  it('promotion_or_referral', () => {
    expect(failed({ proposedText: 'Strength rose. Buy it with our discount code.' })).toContain(
      'promotion_or_referral',
    )
  })

  it('evidence_fields_missing', () => {
    expect(
      failed({
        riskClass: 'scientific_meaning',
        changeCategory: 'factual_accuracy',
        sources: [{ url: 'https://example.invalid/trial' }],
        evidencePacket: {},
      }),
    ).toContain('evidence_fields_missing')
  })

  it('passes a complete scientific change with its evidence and source attached', () => {
    const results = run({
      riskClass: 'scientific_meaning',
      changeCategory: 'factual_accuracy',
      currentText: 'Fixture strength rose over twelve weeks compared with a dummy treatment.',
      proposedText: 'Fixture strength rose over twelve weeks compared with a look-alike treatment.',
      sources: [{ url: 'https://example.invalid/trial', excerpt: 'strength rose over 12 weeks' }],
      evidencePacket: {
        population: '120 adults with no recorded condition',
        outcome: 'One-repetition maximum',
        limitations: 'One study, twelve weeks, no follow-up.',
      },
    })
    expect(failedGates(results)).toEqual([])
  })
})

describe('medical safety: what approval can and cannot do', () => {
  it('three approvals do not turn a biomarker into a clinical outcome', () => {
    expect(
      failed({
        currentText: 'Cholesterol levels fell by about half.',
        proposedText: 'Deaths fell by about half.',
      }),
    ).toContain('biomarker_as_outcome')
  })

  it('three approvals do not turn animal evidence into human evidence', () => {
    expect(
      failed({
        currentText: 'The effect was measured in rats.',
        proposedText: 'The effect was measured in adults.',
      }),
    ).toContain('animal_as_human')
  })

  it('three approvals do not turn a model prediction into an observation', () => {
    expect(
      failed({
        currentText: 'A simulated cohort suggested the fall.',
        proposedText: 'The fall was recorded.',
      }),
    ).toContain('prediction_as_observation')
  })

  it('no source means no medical publication', () => {
    const results = run({
      riskClass: 'scientific_meaning',
      changeCategory: 'evidence_classification',
      proposedText: 'Fixture strength rose over twelve weeks in a second trial.',
    })
    expect(gatesPassed(results)).toBe(false)
  })

  it('“no interaction evidence” does not become “safe together”', () => {
    expect(
      failed({
        currentText: 'No studies have measured the two taken together.',
        proposedText: 'The two are safe together.',
      }),
    ).toContain('absence_became_safe')
  })
})

describe('risk classification', () => {
  it('treats a safety category as high risk whatever the wording', () => {
    expect(
      derivePageStatementRiskClass({
        statementKey: 'hero.principal_limit',
        changeCategory: 'safety_correction',
        currentText: 'One thing.',
        proposedText: 'Another thing.',
      }),
    ).toBe('high_risk')
  })

  it('treats safety wording as high risk whatever the category the member picked', () => {
    expect(
      derivePageStatementRiskClass({
        statementKey: 'hero.principal_limit',
        changeCategory: 'spelling_or_grammar',
        currentText: 'It is not recommended in pregnancy.',
        proposedText: 'It is not recommended during pregnancy.',
      }),
    ).toBe('high_risk')
  })

  it('treats a changed evidence word as a change of meaning, not of style', () => {
    expect(
      derivePageStatementRiskClass({
        statementKey: 'hero.strongest_result',
        changeCategory: 'plain_language_clarity',
        currentText: 'Strength rose in one study.',
        proposedText: 'Strength rose in one trial and improved further after.',
      }),
    ).toBe('scientific_meaning')
  })

  it('leaves a genuine rewording as wording only', () => {
    expect(
      derivePageStatementRiskClass({
        statementKey: 'hero.where_it_acts',
        changeCategory: 'plain_language_clarity',
        currentText: 'Skeletal muscle cytosol.',
        proposedText: 'The fluid inside skeletal muscle.',
      }),
    ).toBe('copy_only')
  })

  it('asks for more qualified reviewers as the risk rises', () => {
    expect(requiredQualifiedApprovals('copy_only')).toBe(0)
    expect(requiredQualifiedApprovals('scientific_meaning')).toBe(1)
    expect(requiredQualifiedApprovals('high_risk')).toBe(2)
  })

  it('counts only a qualification relevant to the claim', () => {
    expect(
      qualificationIsRelevant(['BIOSTATISTICS'], 'scientific_meaning', 'factual_accuracy'),
    ).toBe(true)
    // A statistics qualification is not what judges an interaction.
    expect(qualificationIsRelevant(['BIOSTATISTICS'], 'high_risk', 'interaction_correction')).toBe(
      false,
    )
    expect(
      qualificationIsRelevant(['PHARMACOKINETICS'], 'high_risk', 'interaction_correction'),
    ).toBe(true)
    // A wording change needs no speciality, so none is relevant to it.
    expect(qualificationIsRelevant(['TOXICOLOGY'], 'copy_only', 'spelling_or_grammar')).toBe(false)
  })
})

describe('who may review', () => {
  const trusted = { id: 'u1', name: 'One', trustTier: 'trusted', isAdmin: false }

  it('needs a trusted editor, a steward or an administrator', () => {
    expect(mayReviewPageStatements(trusted)).toBe(true)
    expect(mayReviewPageStatements({ ...trusted, trustTier: 'new' })).toBe(false)
    expect(mayReviewPageStatements({ ...trusted, trustTier: 'contributor' })).toBe(false)
    expect(mayReviewPageStatements({ ...trusted, trustTier: 'new', isAdmin: true })).toBe(true)
    expect(mayReviewPageStatements(null)).toBe(false)
  })

  it('refuses a restricted account whatever its standing', () => {
    expect(mayReviewPageStatements({ ...trusted, restrictedAt: new Date() })).toBe(false)
    expect(mayReviewPageStatements({ ...trusted, isAdmin: true, restrictedAt: new Date() })).toBe(
      false,
    )
  })

  it('counts one person once, by researcher identifier where there is one', () => {
    expect(reviewerIdentityKey({ id: 'a', orcid: '0000-0002-1825-0097' })).toBe(
      'orcid:0000-0002-1825-0097',
    )
    expect(reviewerIdentityKey({ id: 'b', orcid: '0000-0002-1825-0097' })).toBe(
      reviewerIdentityKey({ id: 'a', orcid: '0000-0002-1825-0097' }),
    )
    expect(reviewerIdentityKey({ id: 'a', orcid: null })).toBe('user:a')
  })

  it('reports the first problem that applies and no other', () => {
    const base = {
      authorUserId: 'author',
      reviewStatus: 'awaiting_reviews',
      proposalStatus: 'open',
      recordedReviewers: [],
    }
    expect(pageStatementReviewEligibility({ ...base, viewer: null }).reason).toBe('signed_out')
    expect(
      pageStatementReviewEligibility({ ...base, viewer: { id: 'author', name: 'A' } }).reason,
    ).toBe('author_cannot_review')
    expect(
      pageStatementReviewEligibility({
        ...base,
        viewer: { id: 'u1', name: 'One', trustTier: 'new' },
      }).reason,
    ).toBe('insufficient_trust')
    expect(
      pageStatementReviewEligibility({
        ...base,
        viewer: trusted,
        recordedReviewers: [{ userId: 'u1', identityKey: 'user:u1' }],
      }).reason,
    ).toBe('already_reviewed')
    expect(
      pageStatementReviewEligibility({
        ...base,
        viewer: { ...trusted, id: 'u2', orcid: '0000-0002-1825-0097' },
        recordedReviewers: [{ userId: 'u1', identityKey: 'orcid:0000-0002-1825-0097' }],
      }).reason,
    ).toBe('duplicate_identity')
    expect(
      pageStatementReviewEligibility({ ...base, viewer: trusted, reviewStatus: 'approved' }).reason,
    ).toBe('review_complete')
    expect(
      pageStatementReviewEligibility({ ...base, viewer: trusted, proposalStatus: 'withdrawn' })
        .reason,
    ).toBe('not_open')
  })
})

describe('the public control', () => {
  const summary = {
    slug: 'creatine-monohydrate',
    approvals: 0,
    required: PAGE_STATEMENT_APPROVALS_REQUIRED,
    openProposals: 0,
    changesRequested: false,
    publishedRevisions: 0,
  }

  it('reads 0 of 3 with nothing proposed', () => {
    const pill = pageReviewPill(summary)
    expect(pill.label).toBe('Review or improve · 0/3')
    expect(pill.state).toBe('no_proposal')
    expect(pill.href).toBe('/review-queue?slug=creatine-monohydrate')
  })

  it('counts up as approvals land', () => {
    for (const approvals of [0, 1, 2]) {
      expect(pageReviewPill({ ...summary, openProposals: 1, approvals }).label).toBe(
        `Review or improve · ${approvals}/3`,
      )
    }
  })

  it('says community approved once a wording is published', () => {
    const pill = pageReviewPill({ ...summary, publishedRevisions: 1 })
    expect(pill.label).toBe('Community approved · 3/3')
    expect(pill.accessibleName).toContain('not about whether this works')
  })

  it('says a revision needs changes', () => {
    expect(pageReviewPill({ ...summary, changesRequested: true }).label).toBe(
      'Revision needs changes',
    )
  })

  it('never claims peer review, and always reads as a sentence', () => {
    for (const variant of [
      summary,
      { ...summary, openProposals: 1, approvals: 2 },
      { ...summary, publishedRevisions: 2 },
      { ...summary, changesRequested: true },
    ]) {
      const pill = pageReviewPill(variant)
      expect(pill.accessibleName.toLowerCase()).not.toContain('peer review')
      expect(pill.accessibleName).toMatch(/\.$/)
      expect(pill.accessibleName.split(' ').length).toBeGreaterThan(6)
    }
  })

  it('escapes a slug into the link', () => {
    expect(pageReviewPill({ ...summary, slug: 'a b/c' }).href).toBe('/review-queue?slug=a%20b%2Fc')
  })
})

describe('the diff a reviewer reads', () => {
  it('marks what was removed and what was added', () => {
    const tokens = wordDiff('Roughly three in eight people', 'About three in eight people')
    expect(tokens.filter((token) => token.kind === 'removed').map((t) => t.value)).toEqual([
      'Roughly',
    ])
    expect(tokens.filter((token) => token.kind === 'added').map((t) => t.value)).toEqual(['About'])
  })

  it('marks nothing when nothing changed', () => {
    expect(wordDiff('same words', 'same words').every((token) => token.kind === 'same')).toBe(true)
  })
})

describe('the addressable sentences', () => {
  it('names seven positions, each with a purpose and a word limit', () => {
    expect(PAGE_STATEMENT_KEYS).toHaveLength(7)
    for (const key of PAGE_STATEMENT_KEYS) {
      const definition = pageStatementDefinition(key)
      expect(definition.label.length).toBeGreaterThan(3)
      expect(definition.purpose).toMatch(/\.$/)
      expect(definition.wordLimit).toBeGreaterThan(15)
    }
  })
})
