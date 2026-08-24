import { describe, expect, it } from 'vitest'

import { runEvidenceIntelligence, type EvidenceIntelligenceInput } from '@/lib/rna-intelligence'
import { cloneEvidenceInput } from './evidence-fixture'

function codes(input: EvidenceIntelligenceInput, level?: 'BLOCK' | 'WARNING' | 'REVIEW_IMPACT') {
  return runEvidenceIntelligence(input)
    .findings.filter((finding) => level === undefined || finding.level === level)
    .map((finding) => finding.code)
}

describe('Group E — evidence-chain consistency and unknown safeguards', () => {
  it('blocks visible, confirmed, contradicted, mixed, unknown, and not-measured state contradictions', () => {
    const visible = cloneEvidenceInput()
    visible.evidenceNodes.find((node) => node.id === 'node-target')!.supportingClaimIds = []
    expect(codes(visible, 'BLOCK')).toContain('E_VISIBLE_NODE_WITHOUT_CLAIM')

    const confirmed = cloneEvidenceInput()
    const confirmedNode = confirmed.evidenceNodes.find((node) => node.id === 'node-target')!
    const confirmedClaim = confirmed.claims.find((claim) => claim.id === 'claim-target-unknown')!
    confirmedNode.state = 'CONFIRMED'
    confirmedNode.supportingClaimIds = []
    confirmedNode.contradictingClaimIds = [confirmedClaim.id]
    expect(codes(confirmed, 'BLOCK')).toContain('E_CONFIRMED_WITHOUT_SUPPORT')

    const contradicted = cloneEvidenceInput()
    contradicted.evidenceNodes.find((node) => node.id === 'node-target')!.state = 'CONTRADICTED'
    expect(codes(contradicted, 'BLOCK')).toContain('E_CONTRADICTED_WITHOUT_EVIDENCE')

    const mixed = cloneEvidenceInput()
    mixed.evidenceNodes.find((node) => node.id === 'node-target')!.state = 'MIXED'
    expect(codes(mixed, 'BLOCK')).toContain('E_MIXED_WITHOUT_BOTH_DIRECTIONS')

    const unknownPositive = cloneEvidenceInput()
    unknownPositive.evidenceNodes.find((node) => node.id === 'node-target')!.presentedAsPositive =
      true
    expect(codes(unknownPositive, 'BLOCK')).toContain('E_UNKNOWN_PRESENTED_AS_POSITIVE')

    const notMeasuredNegative = cloneEvidenceInput()
    notMeasuredNegative.evidenceNodes.find((node) => node.id === 'node-bio')!.presentedAsNegative =
      true
    expect(codes(notMeasuredNegative, 'BLOCK')).toContain('E_NOT_MEASURED_PRESENTED_AS_NEGATIVE')
  })

  it('warns when target engagement is assumed rather than measured', () => {
    const input = cloneEvidenceInput()
    const node = input.evidenceNodes.find((entry) => entry.id === 'node-target')!
    const claim = input.claims.find((entry) => entry.id === 'claim-target-unknown')!
    node.state = 'CONFIRMED'
    claim.nature = 'RNAWIKI_JUDGEMENT'

    expect(codes(input, 'WARNING')).toContain('E_TARGET_ENGAGEMENT_ASSUMED')
  })

  it('warns about downstream assertions after useful-exposure failure', () => {
    const input = cloneEvidenceInput()
    const exposure = input.evidenceNodes.find((node) => node.id === 'node-useful')!
    const exposureClaim = input.claims.find((claim) => claim.id === 'claim-useful')!
    exposure.state = 'CONTRADICTED'
    exposure.supportingClaimIds = []
    exposure.contradictingClaimIds = [exposureClaim.id]

    const target = input.evidenceNodes.find((node) => node.id === 'node-target')!
    const targetClaim = input.claims.find((claim) => claim.id === 'claim-target-unknown')!
    target.state = 'CONFIRMED'
    targetClaim.nature = 'MEASURED'
    targetClaim.sourceIds = ['source-primary']

    expect(codes(input, 'WARNING')).toContain('E_DOWNSTREAM_ASSERTED_AFTER_EXPOSURE_FAILURE')
  })

  it('warns when a surrogate or exploratory result is presented as patient benefit', () => {
    const input = cloneEvidenceInput()
    const claim = input.claims.find((entry) => entry.id === 'claim-outcome-unknown')!
    claim.nature = 'MEASURED'
    claim.sourceIds = ['source-primary']
    claim.outcomeType = 'SURROGATE'
    claim.presentedAsPatientBenefit = true
    claim.endpointHierarchy = 'EXPLORATORY'
    claim.exploratoryNatureDisclosed = false

    const reportCodes = codes(input, 'WARNING')
    expect(reportCodes).toContain('E_SURROGATE_PRESENTED_AS_PATIENT_OUTCOME')
    expect(reportCodes).toContain('E_EXPLORATORY_BENEFIT_UNDISCLOSED')
  })

  it('warns when an evidence node carries both support and contradiction', () => {
    const input = cloneEvidenceInput()
    const node = input.evidenceNodes.find((entry) => entry.id === 'node-human')!
    const contradiction = input.claims.find((claim) => claim.id === 'claim-useful')!
    contradiction.evidenceNodeType = 'HUMAN_EXPOSURE'
    node.contradictingClaimIds = [contradiction.id]

    expect(codes(input, 'WARNING')).toContain('E_MATERIALLY_CONFLICTING_CLAIMS')
  })

  it('blocks one claim being linked as both support and contradiction', () => {
    const input = cloneEvidenceInput()
    const node = input.evidenceNodes.find((entry) => entry.id === 'node-human')!
    node.contradictingClaimIds = [node.supportingClaimIds[0]!]

    expect(codes(input, 'BLOCK')).toContain('E_CLAIM_LINKED_AS_SUPPORT_AND_CONTRADICTION')
  })
})

function makeIdeaFailedValid(input: EvidenceIntelligenceInput): void {
  input.verdicts[0]!.code = 'IDEA_FAILED'
  input.verdicts[0]!.supportingClaimIds = ['claim-outcome-unknown']
  input.programmes[0]!.stoppingReasonCategory = 'EFFICACY'
  input.programmes[0]!.studyInterpretability = {
    statisticalPower: 'YES',
    populationSelection: 'YES',
    exposureAdequacy: 'YES',
    endpointValidity: 'YES',
    durationAndOperationalIntegrity: 'YES',
    supportingClaimIdsByCriterion: {
      STATISTICAL_POWER: ['claim-unanswered'],
      POPULATION_SELECTION: ['claim-unanswered'],
      DOSE_EXPOSURE_ADEQUACY: ['claim-unanswered'],
      ENDPOINT_VALIDITY: ['claim-unanswered'],
      DURATION_OPERATIONAL_INTEGRITY: ['claim-unanswered'],
    },
  }

  const target = input.evidenceNodes.find((node) => node.id === 'node-target')!
  const targetClaim = input.claims.find((claim) => claim.id === 'claim-target-unknown')!
  target.state = 'CONFIRMED'
  targetClaim.nature = 'MEASURED'
  targetClaim.sourceIds = ['source-primary']

  const outcome = input.evidenceNodes.find((node) => node.id === 'node-outcome')!
  const outcomeClaim = input.claims.find((claim) => claim.id === 'claim-outcome-unknown')!
  outcome.state = 'CONTRADICTED'
  outcome.supportingClaimIds = []
  outcome.contradictingClaimIds = [outcomeClaim.id]
  outcomeClaim.nature = 'MEASURED'
  outcomeClaim.sourceIds = ['source-primary']
}

describe('Group F — verdict eligibility without machine-authored judgement', () => {
  it('accepts a structurally consistent IDEA_FAILED rubric without selecting it', () => {
    const input = cloneEvidenceInput()
    makeIdeaFailedValid(input)
    const report = runEvidenceIntelligence(input)

    expect(report.blocks.map((finding) => finding.code)).not.toContain(
      'F_IDEA_FAILED_RUBRIC_MISMATCH',
    )
    expect(report.humanJudgment.verdictSelectedByEngine).toBe(false)
  })

  it('blocks inconsistent IDEA_FAILED, MOLECULE_FAILED, and TEST_UNANSWERED rubrics', () => {
    const idea = cloneEvidenceInput()
    idea.verdicts[0]!.code = 'IDEA_FAILED'
    expect(codes(idea, 'BLOCK')).toContain('F_IDEA_FAILED_RUBRIC_MISMATCH')

    const molecule = cloneEvidenceInput()
    molecule.verdicts[0]!.code = 'MOLECULE_FAILED'
    expect(codes(molecule, 'BLOCK')).toContain('F_MOLECULE_FAILED_RUBRIC_MISMATCH')

    const unanswered = cloneEvidenceInput()
    unanswered.programmes[0]!.stoppingReasonCategory = 'EFFICACY'
    unanswered.programmes[0]!.studyInterpretability = {
      statisticalPower: 'YES',
      populationSelection: 'YES',
      exposureAdequacy: 'YES',
      endpointValidity: 'YES',
      durationAndOperationalIntegrity: 'YES',
      supportingClaimIdsByCriterion: {
        STATISTICAL_POWER: ['claim-unanswered'],
        POPULATION_SELECTION: ['claim-unanswered'],
        DOSE_EXPOSURE_ADEQUACY: ['claim-unanswered'],
        ENDPOINT_VALIDITY: ['claim-unanswered'],
        DURATION_OPERATIONAL_INTEGRITY: ['claim-unanswered'],
      },
    }
    for (const node of unanswered.evidenceNodes) {
      if (node.type === 'HUMAN_EXPOSURE' || node.type === 'USEFUL_EXPOSURE') continue
      const linked = unanswered.claims.find((claim) => claim.id === node.supportingClaimIds[0])!
      node.state = 'CONFIRMED'
      linked.nature = 'MEASURED'
      linked.sourceIds = ['source-primary']
    }
    expect(codes(unanswered, 'BLOCK')).toContain('F_TEST_UNANSWERED_RUBRIC_MISMATCH')
  })

  it('allows a complete adjudicated exception but records review impact', () => {
    const input = cloneEvidenceInput()
    input.verdicts[0]!.code = 'IDEA_FAILED'
    input.verdicts[0]!.adjudicatedException = {
      adjudicatorId: 'reviewer-adjudicator-1',
      rationale: 'A documented programme-specific exception to the normal rubric.',
    }
    const report = runEvidenceIntelligence(input)

    expect(report.blocks.map((finding) => finding.code)).not.toContain(
      'F_IDEA_FAILED_RUBRIC_MISMATCH',
    )
    expect(report.reviewImpacts.map((finding) => finding.code)).toContain(
      'F_ADJUDICATED_RUBRIC_EXCEPTION',
    )
  })

  it('blocks incomplete adjudication, stopping-reason-only support, and unknown-as-failure', () => {
    const incomplete = cloneEvidenceInput()
    incomplete.verdicts[0]!.adjudicatedException = { adjudicatorId: '', rationale: 'Because.' }
    expect(codes(incomplete, 'BLOCK')).toContain('F_ADJUDICATED_EXCEPTION_INCOMPLETE')

    const stoppingOnly = cloneEvidenceInput()
    const stopping = stoppingOnly.claims.find((claim) => claim.id === 'claim-unanswered')!
    stopping.nature = 'SPONSOR_REPORTED'
    stopping.stoppingReason = true
    expect(codes(stoppingOnly, 'BLOCK')).toContain('F_STOPPING_REASON_ONLY')

    const unknown = cloneEvidenceInput()
    unknown.verdicts[0]!.code = 'IDEA_FAILED'
    unknown.verdicts[0]!.supportingClaimIds = ['claim-target-unknown']
    expect(codes(unknown, 'BLOCK')).toContain('F_UNKNOWN_USED_AS_FAILURE_EVIDENCE')
  })
})

describe('Group G — deterministic 10-second and readability checks', () => {
  it('checks summary completeness, claim dependencies, and first-screen size', () => {
    const input = cloneEvidenceInput()
    input.policy = {
      readability: {
        maxFirstScreenWords: 5,
      },
    }
    input.tenSecondSummaries![0]!.mainLimitation.text = ''
    input.tenSecondSummaries![0]!.bestSupportedFinding.supportingClaimIds = []

    const reportCodes = codes(input)
    expect(reportCodes).toEqual(
      expect.arrayContaining([
        'G_TEN_SECOND_PART_MISSING',
        'G_TEN_SECOND_PART_UNSUPPORTED',
        'G_FIRST_SCREEN_WORD_LIMIT',
      ]),
    )
  })

  it('warns without rewriting acronyms, long prose, jargon, absolutes, advice, and vague outcomes', () => {
    const input = cloneEvidenceInput()
    input.policy = {
      readability: {
        maxSentenceWords: 5,
        maxParagraphWords: 8,
        maxFirstScreenWords: 140,
        allowedAcronyms: [],
        complexTerms: ['pharmacokinetics'],
        absolutePhrases: ['always safe'],
      },
    }
    input.plainLanguageSections = [
      {
        id: 'plain-1',
        entity: { type: 'SUMMARY', id: 'summary-1', field: 'mainLimitation' },
        kind: 'TEN_SECOND',
        text: 'PK pharmacokinetics changed substantially and this medicine is always safe. You should start taking it. It failed. It worked.',
        numericStatements: [{ value: '12%' }],
      },
    ]

    const reportCodes = codes(input, 'WARNING')
    expect(reportCodes).toEqual(
      expect.arrayContaining([
        'G_SENTENCE_TOO_LONG',
        'G_PARAGRAPH_TOO_LONG',
        'G_ACRONYM_NOT_INTRODUCED',
        'G_COMPLEX_TERM_UNEXPLAINED',
        'G_ABSOLUTE_MEDICAL_LANGUAGE',
        'G_TREATMENT_RECOMMENDATION_LANGUAGE',
        'G_NUMBER_CONTEXT_MISSING',
        'G_FAILED_WITHOUT_SUBJECT',
        'G_WORKED_WITHOUT_OUTCOME',
      ]),
    )
  })
})

describe('Group H — freshness, snapshots, and dependency propagation', () => {
  it('propagates a source change through claims, nodes, summary, and metadata', () => {
    const input = cloneEvidenceInput()
    input.dependencies = [
      {
        from: { type: 'SOURCE', id: 'source-primary' },
        to: { type: 'CLAIM', id: 'claim-human' },
        impact: 'INTERPRETIVE_REVIEW_REQUIRED',
      },
      {
        from: { type: 'CLAIM', id: 'claim-human' },
        to: { type: 'EVIDENCE_NODE', id: 'node-human' },
        impact: 'INTERPRETIVE_REVIEW_REQUIRED',
      },
      {
        from: { type: 'EVIDENCE_NODE', id: 'node-human' },
        to: { type: 'SUMMARY', id: 'summary-1' },
        impact: 'POSSIBLE_VERDICT_IMPACT',
      },
      {
        from: { type: 'SUMMARY', id: 'summary-1' },
        to: { type: 'METADATA', id: 'medicine-1' },
        impact: 'POSSIBLE_VERDICT_IMPACT',
      },
    ]
    input.changes = [
      {
        entity: { type: 'SOURCE', id: 'source-primary' },
        changedFields: ['resultsStatus'],
        snapshotId: 'snapshot-1',
      },
    ]

    const report = runEvidenceIntelligence(input)
    expect(report.reviewImpacts.map((finding) => finding.code)).toContain(
      'H_DEPENDENT_CONTENT_AFFECTED',
    )
    expect(report.impactPlan.affectedClaimIds).toContain('claim-human')
    expect(report.impactPlan.affectedEvidenceNodeIds).toContain('node-human')
    expect(report.impactPlan.affectedProgrammeIds).toContain('programme-1')
    expect(report.impactPlan.affectedSurfaces).toContainEqual({
      type: 'METADATA',
      id: 'medicine-1',
    })
    expect(report.impactPlan.highestImpact).toBe('POSSIBLE_VERDICT_IMPACT')
    expect(report.impactPlan.requiresHumanReview).toBe(true)
    expect(report.impactPlan.preserveCurrentPublishedRevisionUntilReview).toBe(true)
  })

  it('requires source snapshots and a dependency path for changed sources', () => {
    const input = cloneEvidenceInput()
    input.changes = [
      {
        entity: { type: 'SOURCE', id: 'source-primary' },
        changedFields: ['resultsStatus'],
      },
    ]

    expect(codes(input)).toEqual(
      expect.arrayContaining(['H_SOURCE_CHANGE_WITHOUT_SNAPSHOT', 'H_DEPENDENCY_PATH_MISSING']),
    )
  })

  it('blocks invalid dependency references and cycles', () => {
    const input = cloneEvidenceInput()
    input.dependencies = [
      {
        from: { type: 'CLAIM', id: 'claim-human' },
        to: { type: 'EVIDENCE_NODE', id: 'node-human' },
        impact: 'INTERPRETIVE_REVIEW_REQUIRED',
      },
      {
        from: { type: 'EVIDENCE_NODE', id: 'node-human' },
        to: { type: 'CLAIM', id: 'claim-human' },
        impact: 'INTERPRETIVE_REVIEW_REQUIRED',
      },
      {
        from: { type: 'CLAIM', id: 'missing-claim' },
        to: { type: 'EVIDENCE_NODE', id: 'missing-node' },
        impact: 'LOW_RISK_EXACT_DATA',
      },
    ]

    expect(codes(input, 'BLOCK')).toEqual(
      expect.arrayContaining([
        'H_DEPENDENCY_CYCLE',
        'H_DEPENDENCY_SOURCE_NOT_FOUND',
        'H_DEPENDENCY_TARGET_NOT_FOUND',
      ]),
    )
  })

  it('returns understandable deterministic freshness states', () => {
    const stale = cloneEvidenceInput()
    stale.asOfDate = '2028-08-22'
    expect(runEvidenceIntelligence(stale).freshness[0]).toMatchObject({
      sourceId: 'source-primary',
      state: 'EVIDENCE_MAY_BE_OUT_OF_DATE',
      maxAgeDays: 365,
    })

    const unavailable = cloneEvidenceInput()
    unavailable.sources[0]!.resolutionStatus = 'TEMPORARILY_UNAVAILABLE'
    expect(runEvidenceIntelligence(unavailable).freshness[0]?.state).toBe('SOURCE_UNAVAILABLE')

    const incomplete = cloneEvidenceInput()
    incomplete.sourceSnapshots = []
    expect(runEvidenceIntelligence(incomplete).freshness[0]?.state).toBe('AUDIT_NOT_COMPLETED')

    const invalidDate = cloneEvidenceInput()
    invalidDate.asOfDate = 'today'
    expect(codes(invalidDate, 'BLOCK')).toContain('H_AS_OF_DATE_INVALID')
  })
})
