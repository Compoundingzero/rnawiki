import type { EvidenceClaim, EvidenceIntelligenceInput, EvidenceNode } from '@/lib/rna-intelligence'

const SOURCE_ID = 'source-primary'
const PROGRAMME_ID = 'programme-1'
const TRIAL_ID = 'trial-1'

function claim(id: string, overrides: Partial<EvidenceClaim>): EvidenceClaim {
  return {
    id,
    medicineId: 'medicine-1',
    programmeId: PROGRAMME_ID,
    isProgrammeLevel: true,
    trialId: TRIAL_ID,
    nature: 'MEASURED',
    direction: 'INCREASE',
    plainLanguageText: `Evidence recorded for ${id}.`,
    sourceIds: [SOURCE_ID],
    resultDate: '2025-06-01',
    ...overrides,
  }
}

function node(
  id: string,
  type: EvidenceNode['type'],
  state: EvidenceNode['state'],
  claimId: string,
): EvidenceNode {
  return {
    id,
    programmeId: PROGRAMME_ID,
    type,
    state,
    visible: true,
    supportingClaimIds: [claimId],
    contradictingClaimIds: [],
  }
}

export function validEvidenceInput(): EvidenceIntelligenceInput {
  return {
    asOfDate: '2026-08-22',
    medicine: { id: 'medicine-1' },
    programmes: [
      {
        id: PROGRAMME_ID,
        medicineId: 'medicine-1',
        indication: 'Condition alpha',
        population: 'Adults with confirmed condition alpha after prior standard therapy',
        doseOrExposure: 'Studied intravenous exposure range',
        jurisdiction: 'United States',
        approvalIsJurisdictionSpecific: false,
        status: 'STOPPED',
        startDate: '2024-01-01',
        endDate: '2026-01-01',
        currentVerdictId: 'verdict-1',
        stoppingReasonCategory: 'OPERATIONAL_EXECUTION',
        stoppingReasonClaimIds: ['claim-unanswered'],
        phaseEvents: [
          { id: 'phase-1', phase: 'PHASE_1', date: '2024-02-01' },
          { id: 'phase-2', phase: 'PHASE_2', date: '2025-02-01' },
        ],
        studyInterpretability: {
          statisticalPower: 'YES',
          populationSelection: 'YES',
          exposureAdequacy: 'YES',
          endpointValidity: 'NO',
          durationAndOperationalIntegrity: 'YES',
          supportingClaimIdsByCriterion: {
            STATISTICAL_POWER: ['claim-unanswered'],
            POPULATION_SELECTION: ['claim-unanswered'],
            DOSE_EXPOSURE_ADEQUACY: ['claim-unanswered'],
            ENDPOINT_VALIDITY: ['claim-unanswered'],
            DURATION_OPERATIONAL_INTEGRITY: ['claim-unanswered'],
          },
        },
      },
    ],
    trials: [
      {
        id: TRIAL_ID,
        registrationId: 'NCT00000001',
        medicineId: 'medicine-1',
        programmeId: PROGRAMME_ID,
        indication: 'Condition alpha',
        subjectType: 'HUMAN',
        startDate: '2025-01-01',
        endDate: '2025-12-01',
        resultsStatus: 'AVAILABLE',
      },
    ],
    sources: [
      {
        id: SOURCE_ID,
        sourceType: 'CLINICAL_TRIAL_REGISTRY',
        externalIdentifier: 'NCT00000001',
        canonicalLocator: 'https://clinicaltrials.gov/study/NCT00000001',
        title: 'Study record for NCT00000001',
        publisher: 'ClinicalTrials.gov',
        hierarchy: 'PRIMARY',
        resolutionStatus: 'RESOLVABLE',
        publicationDate: '2025-12-15',
        programmeId: PROGRAMME_ID,
        trialId: TRIAL_ID,
      },
    ],
    sourceSnapshots: [
      {
        id: 'snapshot-1',
        sourceId: SOURCE_ID,
        retrievedAt: '2026-08-01',
        contentHash: 'sha256:fixture-snapshot-1',
      },
    ],
    claims: [
      claim('claim-human', {
        evidenceNodeType: 'HUMAN_EXPOSURE',
        participantOutcome: true,
      }),
      claim('claim-useful', { evidenceNodeType: 'USEFUL_EXPOSURE' }),
      claim('claim-target-unknown', {
        evidenceNodeType: 'TARGET_ENGAGEMENT',
        nature: 'UNKNOWN',
        direction: 'UNKNOWN',
        sourceIds: [],
      }),
      claim('claim-bio-not-measured', {
        evidenceNodeType: 'BIOLOGICAL_RESPONSE',
        nature: 'UNKNOWN',
        direction: 'UNKNOWN',
        sourceIds: [],
      }),
      claim('claim-outcome-unknown', {
        evidenceNodeType: 'PATIENT_OUTCOME',
        nature: 'UNKNOWN',
        direction: 'UNKNOWN',
        sourceIds: [],
      }),
      claim('claim-unanswered', {
        trialId: undefined,
        evidenceNodeType: undefined,
        nature: 'RNAWIKI_JUDGEMENT',
        direction: 'NOT_APPLICABLE',
        resultDate: undefined,
      }),
    ],
    evidenceNodes: [
      node('node-human', 'HUMAN_EXPOSURE', 'CONFIRMED', 'claim-human'),
      node('node-useful', 'USEFUL_EXPOSURE', 'CONFIRMED', 'claim-useful'),
      node('node-target', 'TARGET_ENGAGEMENT', 'UNKNOWN', 'claim-target-unknown'),
      node('node-bio', 'BIOLOGICAL_RESPONSE', 'NOT_MEASURED', 'claim-bio-not-measured'),
      node('node-outcome', 'PATIENT_OUTCOME', 'UNKNOWN', 'claim-outcome-unknown'),
    ],
    verdicts: [
      {
        id: 'verdict-1',
        medicineId: 'medicine-1',
        programmeId: PROGRAMME_ID,
        code: 'TEST_UNANSWERED',
        scope: {
          indication: 'Condition alpha',
          population: 'Adults with confirmed condition alpha after prior standard therapy',
          doseOrExposure: 'Studied intravenous exposure range',
          period: '2024 to 2026',
          trialIds: [TRIAL_ID],
          outcome: 'Prespecified patient outcome at the primary timepoint',
        },
        supportingClaimIds: ['claim-unanswered'],
        contradictoryClaimIds: [],
        candidateLimitationClaimIds: [],
        reviewStatus: 'AWAITING_REVIEW',
      },
    ],
    tenSecondSummaries: [
      {
        id: 'summary-1',
        programmeId: PROGRAMME_ID,
        plainMechanism: {
          text: 'The programme was designed to change the intended biological pathway',
          supportingClaimIds: ['claim-useful'],
        },
        bestSupportedFinding: {
          text: 'people received the medicine and useful exposure was recorded',
          supportingClaimIds: ['claim-human', 'claim-useful'],
        },
        mainLimitation: {
          text: 'the study design did not give a clear patient-outcome answer',
          supportingClaimIds: ['claim-unanswered'],
        },
      },
    ],
    plainLanguageSections: [],
    dependencies: [],
    changes: [],
  }
}

export function cloneEvidenceInput(): EvidenceIntelligenceInput {
  return structuredClone(validEvidenceInput())
}
