/**
 * The dossier v3 view model over hand-built inputs. Every case asserts a truth rule from the
 * mission: a biomarker is never promoted to a benefit, an absence is a sentence, no raw key
 * reaches a reader, a comparator or observed exposure never counts as "tested", and a
 * prescription medicine gets clinician questions rather than a self-experiment plan.
 *
 * Fixtures only: nothing here is seed data and no sentence here is about a real result.
 */
import { describe, expect, it } from 'vitest'

import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import { auditCopy, copyPasses } from '@/lib/dossier-v3/copy-contract'
import { NO_REVIEWED_CONCLUSION_SENTENCE } from '@/lib/dossier-v3/taxonomy'
import type { RoleAwareRegistryAggregate } from '@/lib/dossier-v3/trial-roles'
import {
  buildDossierV3,
  type DossierV3Inputs,
  type ReviewedClaimInput,
} from '@/lib/dossier-v3/view-model'

function corpus(overrides: Partial<CorpusDossier> = {}): CorpusDossier {
  return {
    key: 'K1:TEST',
    slug: 'testamab',
    displayName: 'Testamab',
    model: 'LONGEVITY',
    tier: 1,
    pageType: 'longevity',
    indexable: true,
    suppressed: false,
    suppressionClasses: [],
    suppressionEvidence: [],
    withdrawn: false,
    presentFieldCount: 8,
    applicableFieldCount: 12,
    synonyms: [{ kind: 'salt', label: 'Salt form', names: ['Testamab sodium'] }],
    register: 'test register',
    lastVerified: '2026-09-04',
    humanData: true,
    ladder: [],
    blocks: [],
    registerEvents: [],
    identifiers: [],
    relations: [],
    hubs: [],
    sources: [
      { label: 'ClinicalTrials.gov', kind: 'registry', id: 'x', sourceDate: '2026-09-01' },
    ] as CorpusDossier['sources'],
    licenceNotes: [],
    registeredStudies: 3,
    controlled: false,
    controlledBasis: [],
    registration: [
      {
        id: 'US',
        jurisdiction: 'US',
        label: 'United States',
        status: 'Approved',
        ordinal: 0,
        line: 'Approved · 2 applications: prescription · checked 2026-08-28',
        disclosed: false,
        upstreamRegisters: [],
        applications: [],
        dateChecked: '2026-08-28',
      },
    ],
    controlledSchedules: [],
    interactions: {
      lines: [],
      sourcesChecked: ['register A', 'register B'],
      date: '2026-09-06',
      totals: {},
      predictedOnly: false,
    },
    computedSections: [],
    formOfNotes: [],
    relationNotes: [],
    ...overrides,
  } as CorpusDossier
}

const AGGREGATE: RoleAwareRegistryAggregate = {
  classifierVersion: 'trial-role-classifier/v1',
  snapshotDate: '2026-09-01',
  matchedStudies: 3,
  byRole: { experimental_intervention: 1, administered_role_unclear: 1, observational_exposure: 1 },
  synonymMatched: 0,
  excludedFromSizeStatistics: 0,
  plannedCompletionIgnored: 1,
  tested: {
    studies: 1,
    largest: { nctId: 'NCT00000001', enrollment: 120, enrollmentType: 'ACTUAL' },
    longestCompletedWindow: {
      nctId: 'NCT00000001',
      days: 365,
      startDate: '2020-01',
      completionDate: '2021-01',
    },
    medianEnrollment: 120,
    completedWithPostedResults: 0,
  },
  administeredRoleUnclear: 1,
  observationalExposure: 1,
  rows: [],
}

function inputs(overrides: Partial<DossierV3Inputs> = {}): DossierV3Inputs {
  return {
    corpus: corpus(),
    claims: [],
    fieldStates: [],
    roleAggregate: AGGREGATE,
    registryConditions: ['Type 2 Diabetes', 'Obesity', 'Healthy'],
    registryCompletedNoResults: [{ nct: 'NCT00000002', completionDate: '2019-01' }],
    corrections: [],
    legacy: {
      modality: 'Small Molecule',
      approvalStatus: 'FDA Approved',
      indication: 'Adjunct to diet and exercise in adults with type 2 diabetes.',
      entityClass: 'APPROVED_MEDICINE',
      sourceProvenance: ['Label 2026'],
    },
    fields: {},
    reviewedConclusionState: 'NOT_APPLICABLE',
    hubs: [],
    now: new Date('2026-09-10T00:00:00Z'),
    ...overrides,
  }
}

function claim(overrides: Partial<ReviewedClaimInput> = {}): ReviewedClaimInput {
  return {
    id: 'a'.repeat(64),
    kind: 'effect',
    predicate: 'lowers',
    objectText: 'a laboratory value',
    plainLanguageVersion: 'A laboratory value fell in adults with the condition over 26 weeks.',
    technicalVersion: 'Mean difference versus placebo at week 26 in adults with the condition.',
    analogy: null,
    analogyBreaks: null,
    evidenceClass: 'randomized_trial',
    outcomeClass: 'biomarker_surrogate',
    claimStrength: 'biomarker_only',
    trialIdentifier: 'NCT00000001',
    trialRole: 'experimental_intervention',
    participants: 120,
    applicablePopulation: 'adults with the condition',
    indicationOrGoal: 'glucose_metabolic',
    formulation: null,
    route: 'oral',
    doseAsStudied: null,
    duration: '26 weeks',
    comparator: 'placebo',
    direction: 'decrease',
    effectScale: 'absolute',
    baselineValue: null,
    comparatorValue: null,
    effectEstimate: '-1.1 units',
    absoluteEffect: '-1.1 units',
    ciLow: null,
    ciHigh: null,
    ciLevel: null,
    studyDesign: 'randomised, placebo-controlled',
    causality: 'causal_randomized',
    uncertainty: 'moderate',
    uncertaintyReasons: ['one trial'],
    sourceSnapshotIds: ['b'.repeat(64)],
    sourceLocators: [],
    contradictionState: 'none_found',
    reviewerState: 'reviewed',
    structure: { goals: ['glucose_metabolic'], replication: 'single_study' },
    riskTier: 'elevated',
    contentVersion: 1,
    lastCheckedAt: '2026-09-01',
    ...overrides,
  }
}

describe('the Decision Card without any reviewed claim', () => {
  const model = buildDossierV3(inputs())

  it('says there is no reviewed conclusion instead of filling the gap', () => {
    const best = model.decisionCard.fields.find((field) => field.field === 'best_supported_result')
    expect(best?.text).toBe(NO_REVIEWED_CONCLUSION_SENTENCE)
    expect(best?.filled).toBe(false)
    expect(model.decisionCard.noReviewedConclusion).toBe(true)
    expect(model.decisionCard.evidenceStatus.label).toBe('No reviewed conclusion yet')
  })

  it('shows the legacy indication only as a recorded, unreviewed statement', () => {
    const why = model.decisionCard.fields.find((field) => field.field === 'why_people_use_it')
    expect(why?.state).toBe('awaiting_human_review')
    expect(why?.text).toContain('not yet reviewed')
  })

  it('gives every field an explicit state and never a silent blank', () => {
    for (const field of model.decisionCard.fields) {
      expect(field.state).toBeTruthy()
      expect(field.text.trim().length).toBeGreaterThan(0)
      expect(field.basis.trim().length).toBeGreaterThan(0)
    }
  })

  it('classes the substance as a prescription medicine from the register and requires supervision', () => {
    expect(model.substanceType.code).toBe('prescription_medicine')
    expect(model.supervision.level).toBe('required')
    expect(model.measure.mode).toBe('clinician_questions')
    expect(model.measure.nOf1Refusals).toContain('prescription or clinician-supervised medicine')
  })

  it('reads the role-aware registry and never calls an observed exposure a test', () => {
    expect(model.doesItWork.registry?.tested).toBe(1)
    expect(model.doesItWork.registry?.observational).toBe(1)
    expect(model.doesItWork.registry?.text).toContain('tested treatment in 1 of 3')
    expect(model.doesItWork.registry?.longestWindow).toContain('not the time anyone took it')
  })

  it('offers goal lenses from registered conditions, labelled as registered only', () => {
    const goals = model.goals.map((goal) => `${goal.code}:${goal.basis}`)
    expect(goals).toContain('glucose_metabolic:registered')
    expect(goals).toContain('body_fat_weight:registered')
  })

  it('lists unknowns as first-class results', () => {
    const codes = model.unknowns.map((item) => item.code)
    expect(codes).toContain('no_reviewed_conclusion')
    expect(codes).toContain('unpublished')
    expect(codes).toContain('formulation')
    expect(codes).toContain('interactions')
  })

  it('states the interaction absence without saying safe', () => {
    expect(model.interactions.statement).toMatch(
      /^No interaction found in register A and register B as of 2026-09-06/,
    )
    expect(model.interactions.statement).not.toMatch(/\bsafe\b/i)
  })

  it('passes the copy contract on every reader-facing sentence', () => {
    const text = [
      ...model.decisionCard.fields.map((field) => `${field.text} ${field.basis}`),
      model.supervision.text,
      model.doesItWork.registry?.text ?? '',
      ...model.unknowns.map((item) => item.text),
      model.safety.underrepresented,
      model.safety.longTerm,
      model.measure.reason,
      ...model.measure.clinicianQuestions,
    ].join('\n')
    const report = auditCopy(text)
    expect(report.internalKeys).toEqual([])
    expect(report.forbiddenPhrases).toEqual([])
    expect(report.unscopedCertainty).toEqual([])
    expect(copyPasses(report)).toBe(true)
  })
})

describe('a reviewed biomarker claim', () => {
  const model = buildDossierV3(inputs({ claims: [claim()] }))

  it('fills the best-supported result but keeps the biomarker status words', () => {
    const best = model.decisionCard.fields.find((field) => field.field === 'best_supported_result')
    expect(best?.filled).toBe(true)
    expect(model.decisionCard.evidenceStatus.label).toBe(
      'A biomarker changed; meaningful health improvement has not been established',
    )
  })

  it('puts the claim under its goal lens as a reviewed goal', () => {
    expect(model.goals.find((goal) => goal.code === 'glucose_metabolic')?.basis).toBe('reviewed')
    const panel = model.doesItWork.byGoal.find((entry) => entry.goal === 'glucose_metabolic')
    expect(panel?.cards).toHaveLength(1)
    expect(panel?.cards[0]?.outcomeLetter).toBe('D')
  })

  it('reports surrogate-only results as an unknown', () => {
    expect(model.unknowns.map((item) => item.code)).toContain('surrogate_only')
  })
})

describe('draft claims never reach the page', () => {
  it('ignores a draft effect claim entirely', () => {
    const model = buildDossierV3(inputs({ claims: [claim({ reviewerState: 'draft' })] }))
    expect(model.decisionCard.noReviewedConclusion).toBe(true)
    expect(model.doesItWork.byGoal[0]?.cards).toHaveLength(0)
  })
})

describe('a supplement gets a structured observation plan, never an amount', () => {
  const model = buildDossierV3(
    inputs({
      corpus: corpus({ registration: [] }),
      legacy: {
        modality: 'Nutraceutical / Botanical',
        approvalStatus: 'Non-FDA / Dietary Supplement',
        indication: null,
        entityClass: 'SUPPLEMENT_INGREDIENT',
        sourceProvenance: [],
      },
    }),
  )
  it('classes it as a supplement with no supervision requirement, as a legal category', () => {
    expect(model.substanceType.code).toBe('supplement')
    expect(model.supervision.text).toContain('legal category, not a safety judgement')
    expect(model.measure.mode).toBe('n_of_1_planning')
    expect(model.measure.reason).toContain('never calculates an amount')
  })
})
