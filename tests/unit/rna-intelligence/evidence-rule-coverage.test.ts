import { describe, expect, it } from 'vitest'

import {
  EVIDENCE_RULE_CODES,
  runEvidenceIntelligence,
  type EvidenceFindingLevel,
  type EvidenceIntelligenceInput,
  type EvidenceRuleCode,
  type EvidenceSource,
  type EvidenceTrial,
} from '@/lib/rna-intelligence'
import { cloneEvidenceInput } from './evidence-fixture'

interface RuleCase {
  level: EvidenceFindingLevel
  mutate: (input: EvidenceIntelligenceInput) => void
}

function addProgramme(input: EvidenceIntelligenceInput, id = 'programme-2') {
  const programme = structuredClone(input.programmes[0]!)
  programme.id = id
  programme.currentVerdictId = undefined
  input.programmes.push(programme)
  return programme
}

function addTrial(
  input: EvidenceIntelligenceInput,
  id = 'trial-2',
  programmeId = 'programme-1',
): EvidenceTrial {
  const programme = input.programmes.find((item) => item.id === programmeId)!
  const trial: EvidenceTrial = {
    ...structuredClone(input.trials[0]!),
    id,
    registrationId: `NCT${id === 'trial-2' ? '00000002' : '00000003'}`,
    medicineId: programme.medicineId,
    programmeId,
    indication: programme.indication,
  }
  input.trials.push(trial)
  return trial
}

function addSource(
  input: EvidenceIntelligenceInput,
  id = 'source-2',
  trialId = 'trial-1',
  programmeId = 'programme-1',
): EvidenceSource {
  const source: EvidenceSource = {
    ...structuredClone(input.sources[0]!),
    id,
    externalIdentifier: `${id}-identifier`,
    canonicalLocator: `https://example.org/source/${id}`,
    trialId,
    programmeId,
  }
  input.sources.push(source)
  input.sourceSnapshots.push({
    id: `snapshot-${id}`,
    sourceId: id,
    retrievedAt: '2026-08-02',
    contentHash: `sha256:${id}`,
  })
  return source
}

function setPlainText(
  input: EvidenceIntelligenceInput,
  text: string,
  options: {
    definedTerms?: string[]
    numericStatements?: Array<{ value: string; comparator?: string; timepoint?: string }>
  } = {},
): void {
  input.plainLanguageSections = [
    {
      id: 'plain-1',
      entity: { type: 'SUMMARY', id: 'summary-1', field: 'mainLimitation' },
      kind: 'TEN_SECOND',
      text,
      ...options,
    },
  ]
}

function attachValidPresentation(input: EvidenceIntelligenceInput): void {
  input.presentation = {
    schemaVersion: 'programme-presentation/v1',
    verdictRevisionId: 'verdict-1',
    programmeId: 'programme-1',
    mechanismSteps: [
      {
        id: 'delivery',
        programmeId: 'programme-1',
        order: 1,
        plainTitle: 'The medicine reaches people',
        plainDescription: 'The study recorded exposure after the medicine was given.',
        evidenceBasis: 'MEASURED_IN_PEOPLE',
        claimLinks: [
          {
            claimId: 'claim-human',
            relationship: 'SUPPORTS',
            supportingSourceSnapshotIds: ['snapshot-1'],
          },
        ],
      },
      {
        id: 'exposure',
        programmeId: 'programme-1',
        order: 2,
        plainTitle: 'Useful exposure was measured',
        plainDescription: 'The measured amount reached the study exposure range.',
        evidenceBasis: 'MEASURED_IN_PEOPLE',
        claimLinks: [
          {
            claimId: 'claim-useful',
            relationship: 'SUPPORTS',
            supportingSourceSnapshotIds: ['snapshot-1'],
          },
        ],
      },
      {
        id: 'outcome',
        programmeId: 'programme-1',
        order: 3,
        plainTitle: 'The patient outcome remains uncertain',
        plainDescription: 'The study design did not provide a clear patient-outcome answer.',
        evidenceBasis: 'UNKNOWN',
        claimLinks: [
          {
            claimId: 'claim-unanswered',
            relationship: 'QUALIFIES',
            supportingSourceSnapshotIds: ['snapshot-1'],
          },
        ],
      },
    ],
    timelineEvents: [
      {
        id: 'first-dose',
        programmeId: 'programme-1',
        date: '2025-01-15',
        eventType: 'FIRST_HUMAN_ADMINISTRATION',
        dateBasis: 'ACTUAL',
        plainTitle: 'The first participant received the medicine',
        plainDescription: 'The registry reports that human dosing began.',
        trialId: 'trial-1',
        sourceId: 'source-primary',
        sourceSnapshotId: 'snapshot-1',
        claimLinks: [
          {
            claimId: 'claim-human',
            relationship: 'SUPPORTS',
            supportingSourceSnapshotIds: ['snapshot-1'],
          },
        ],
      },
    ],
  }
  input.dependencies?.push(
    {
      from: { type: 'CLAIM', id: 'claim-human' },
      to: { type: 'MECHANISM_STEP', id: 'verdict-1:mechanism:delivery' },
      impact: 'INTERPRETIVE_REVIEW_REQUIRED',
    },
    {
      from: { type: 'CLAIM', id: 'claim-useful' },
      to: { type: 'MECHANISM_STEP', id: 'verdict-1:mechanism:exposure' },
      impact: 'INTERPRETIVE_REVIEW_REQUIRED',
    },
    {
      from: { type: 'CLAIM', id: 'claim-unanswered' },
      to: { type: 'MECHANISM_STEP', id: 'verdict-1:mechanism:outcome' },
      impact: 'INTERPRETIVE_REVIEW_REQUIRED',
    },
    {
      from: { type: 'CLAIM', id: 'claim-human' },
      to: { type: 'TIMELINE_EVENT', id: 'verdict-1:timeline:first-dose' },
      impact: 'INTERPRETIVE_REVIEW_REQUIRED',
    },
  )
}

const ruleCases = {
  B_APPROVAL_JURISDICTION_MISSING: {
    level: 'WARNING',
    mutate: (input) => {
      input.programmes[0]!.approvalIsJurisdictionSpecific = true
      input.programmes[0]!.jurisdiction = ''
    },
  },
  B_CLAIM_MEDICINE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims[0]!.medicineId = 'medicine-2'
    },
  },
  B_CLAIM_PROGRAMME_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims[0]!.programmeId = 'missing-programme'
    },
  },
  B_CURRENT_VERDICT_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes[0]!.currentVerdictId = 'missing-verdict'
    },
  },
  B_CURRENT_VERDICT_PROGRAMME_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes[0]!.currentVerdictId = undefined
      addProgramme(input).currentVerdictId = 'verdict-1'
    },
  },
  B_DISTINCT_POPULATIONS_COMBINED: {
    level: 'WARNING',
    mutate: (input) => {
      input.programmes[0]!.combinesDistinctPopulations = true
    },
  },
  B_DOSE_CONTEXT_MISSING: {
    level: 'WARNING',
    mutate: (input) => {
      input.programmes[0]!.doseOrExposure = ''
    },
  },
  B_DUPLICATE_PROGRAMME_ID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes.push(structuredClone(input.programmes[0]!))
    },
  },
  B_DUPLICATE_TRIAL_ID: {
    level: 'BLOCK',
    mutate: (input) => {
      const duplicate = structuredClone(input.trials[0]!)
      duplicate.registrationId = 'NCT00000002'
      input.trials.push(duplicate)
    },
  },
  B_DUPLICATE_VERDICT_ID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts.push(structuredClone(input.verdicts[0]!))
    },
  },
  B_MUTABLE_VERDICT_SHARED: {
    level: 'BLOCK',
    mutate: (input) => {
      addProgramme(input).currentVerdictId = 'verdict-1'
    },
  },
  B_POPULATION_SCOPE_VAGUE: {
    level: 'WARNING',
    mutate: (input) => {
      input.programmes[0]!.population = 'Patients'
    },
  },
  B_PROGRAMME_CLAIM_MISSING_PROGRAMME: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims[0]!.programmeId = undefined
    },
  },
  B_PROGRAMME_MEDICINE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes[0]!.medicineId = 'medicine-2'
    },
  },
  B_PRESENTATION_STRUCTURE_INVALID: {
    level: 'BLOCK',
    mutate: (input) => {
      attachValidPresentation(input)
      input.presentation!.mechanismSteps.pop()
    },
  },
  B_STOPPED_VERDICT_ON_ACTIVE_PROGRAMME: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes[0]!.status = 'ACTIVE'
    },
  },
  B_TRIAL_INDICATION_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.trials[0]!.indication = 'Another condition'
    },
  },
  B_TRIAL_MEDICINE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.trials[0]!.medicineId = 'medicine-2'
    },
  },
  B_TRIAL_PROGRAMME_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.trials[0]!.programmeId = 'missing-programme'
    },
  },
  B_VERDICT_ATTACHED_TO_MEDICINE: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.programmeId = undefined
    },
  },
  B_VERDICT_DOSE_SCOPE_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.scope.doseOrExposure = ''
    },
  },
  B_VERDICT_INDICATION_SCOPE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.scope.indication = 'Another condition'
    },
  },
  B_VERDICT_INDICATION_SCOPE_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.scope.indication = ''
    },
  },
  B_VERDICT_MEDICINE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.medicineId = 'medicine-2'
    },
  },
  B_VERDICT_OUTCOME_SCOPE_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.scope.outcome = ''
    },
  },
  B_VERDICT_PERIOD_SCOPE_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.scope.period = ''
    },
  },
  B_VERDICT_POPULATION_SCOPE_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.scope.population = ''
    },
  },
  B_VERDICT_PROGRAMME_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.programmeId = 'missing-programme'
    },
  },
  B_VERDICT_TRIAL_SCOPE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.scope.trialIds = ['missing-trial']
    },
  },
  B_VERDICT_TRIAL_SCOPE_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.scope.trialIds = []
    },
  },

  C_CLAIM_SOURCE_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims[0]!.sourceIds = ['missing-source']
    },
  },
  C_CLAIM_SOURCE_SNAPSHOT_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sourceSnapshots = []
    },
  },
  C_CONFLICTING_CLAIM_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims[0]!.conflictsWithClaimIds = ['missing-claim']
    },
  },
  C_DUPLICATE_SNAPSHOT_ID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sourceSnapshots.push(structuredClone(input.sourceSnapshots[0]!))
    },
  },
  C_DUPLICATE_SOURCE_ID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sources.push(structuredClone(input.sources[0]!))
    },
  },
  C_IMPORTANT_SOURCES_CONFLICT: {
    level: 'WARNING',
    mutate: (input) => {
      input.claims[0]!.conflictsWithClaimIds = ['claim-useful']
    },
  },
  C_MEASURED_CLAIM_SOURCE_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims[0]!.sourceIds = []
    },
  },
  C_PRESENTATION_SOURCE_UNBOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      attachValidPresentation(input)
      input.presentation!.timelineEvents[0]!.sourceSnapshotId = 'missing-snapshot'
    },
  },
  C_NUMERIC_CLAIM_UNIT_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims[0]!.numericValue = 12
      input.claims[0]!.numericUnitRequired = true
    },
  },
  C_PREVIOUS_SNAPSHOT_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sourceSnapshots[0]!.previousSnapshotId = 'missing-snapshot'
    },
  },
  C_PREVIOUS_SNAPSHOT_SOURCE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      addSource(input)
      input.sourceSnapshots[0]!.previousSnapshotId = 'snapshot-source-2'
    },
  },
  C_PRIMARY_RESULTS_UNAVAILABLE: {
    level: 'WARNING',
    mutate: (input) => {
      input.trials[0]!.resultsStatus = 'NOT_POSTED'
    },
  },
  C_SECONDARY_SOURCE_WHEN_PRIMARY_AVAILABLE: {
    level: 'WARNING',
    mutate: (input) => {
      input.sources[0]!.hierarchy = 'SECONDARY'
      addSource(input, 'source-primary-2').hierarchy = 'PRIMARY'
    },
  },
  C_SNAPSHOT_HASH_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sourceSnapshots[0]!.contentHash = ''
    },
  },
  C_SNAPSHOT_RETRIEVED_DATE_INVALID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sourceSnapshots[0]!.retrievedAt = 'yesterday'
    },
  },
  C_SNAPSHOT_SOURCE_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sourceSnapshots[0]!.sourceId = 'missing-source'
    },
  },
  C_SOURCE_CORRECTION_OR_RETRACTION: {
    level: 'WARNING',
    mutate: (input) => {
      input.sources[0]!.correctionStatus = 'RETRACTED'
    },
  },
  C_SOURCE_DEPENDENT_VERDICT_NO_CLAIMS: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.supportingClaimIds = []
    },
  },
  C_SOURCE_IDENTIFIER_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sources[0]!.externalIdentifier = ''
    },
  },
  C_SOURCE_LOCATOR_MALFORMED: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sources[0]!.canonicalLocator = 'not a locator'
    },
  },
  C_SOURCE_METADATA_INCOMPLETE: {
    level: 'WARNING',
    mutate: (input) => {
      input.sources[0]!.title = ''
    },
  },
  C_SOURCE_PROGRAMME_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      addProgramme(input)
      input.sources[0]!.programmeId = 'programme-2'
    },
  },
  C_SOURCE_PROGRAMME_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sources[0]!.programmeId = 'missing-programme'
    },
  },
  C_SOURCE_SNAPSHOT_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sourceSnapshots = []
    },
  },
  C_SOURCE_STALE: {
    level: 'WARNING',
    mutate: (input) => {
      input.asOfDate = '2028-08-22'
    },
  },
  C_SOURCE_TEMPORARILY_UNAVAILABLE: {
    level: 'WARNING',
    mutate: (input) => {
      input.sources[0]!.resolutionStatus = 'TEMPORARILY_UNAVAILABLE'
    },
  },
  C_SOURCE_TRIAL_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      addTrial(input)
      input.sources[0]!.trialId = 'trial-2'
    },
  },
  C_SOURCE_TRIAL_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sources[0]!.trialId = 'missing-trial'
    },
  },
  C_SOURCE_TRIAL_PROGRAMME_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      addProgramme(input)
      addTrial(input, 'trial-2', 'programme-2')
      input.sources[0]!.trialId = 'trial-2'
    },
  },
  C_SOURCE_UNRESOLVABLE: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sources[0]!.resolutionStatus = 'UNRESOLVABLE'
    },
  },
  C_STOPPING_REASON_CLAIM_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes[0]!.stoppingReasonClaimIds = ['missing-claim']
    },
  },
  C_STOPPING_REASON_SPONSOR_ONLY: {
    level: 'WARNING',
    mutate: (input) => {
      input.claims.find((claim) => claim.id === 'claim-unanswered')!.nature = 'SPONSOR_REPORTED'
    },
  },
  C_VERDICT_CLAIM_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.supportingClaimIds = ['missing-claim']
    },
  },

  D_CLAIM_TRIAL_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims[0]!.trialId = 'missing-trial'
    },
  },
  D_CLAIM_TRIAL_PROGRAMME_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      addProgramme(input)
      addTrial(input, 'trial-2', 'programme-2')
      input.claims[0]!.trialId = 'trial-2'
    },
  },
  D_COMPARATOR_GROUP_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims[0]!.comparatorResult = { value: 7 }
    },
  },
  D_DATE_INVALID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes[0]!.startDate = '2025-02-30'
    },
  },
  D_DUPLICATE_CLAIM_ID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims.push(structuredClone(input.claims[0]!))
    },
  },
  D_DUPLICATE_PHASE_EVENT_ID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes[0]!.phaseEvents!.push({
        id: 'phase-1',
        phase: 'PHASE_3',
        date: '2025-06-01',
      })
    },
  },
  D_DUPLICATE_TRIAL_IDENTIFIER: {
    level: 'BLOCK',
    mutate: (input) => {
      addTrial(input).registrationId = input.trials[0]!.registrationId
    },
  },
  D_PARTICIPANT_OUTCOME_ON_NON_HUMAN_TRIAL: {
    level: 'BLOCK',
    mutate: (input) => {
      input.trials[0]!.subjectType = 'ANIMAL'
    },
  },
  D_TIMELINE_DATE_INVALID: {
    level: 'BLOCK',
    mutate: (input) => {
      attachValidPresentation(input)
      input.presentation!.timelineEvents[0]!.date = '2027-01-01'
    },
  },
  D_PHASE_ORDER_EXCEPTION_RECORDED: {
    level: 'WARNING',
    mutate: (input) => {
      input.programmes[0]!.phaseEvents = [
        { id: 'phase-3', phase: 'PHASE_3', date: '2024-01-01' },
        {
          id: 'phase-1',
          phase: 'PHASE_1',
          date: '2025-01-01',
          orderingExceptionReason: 'A separate sourced formulation entered phase 1 later.',
        },
      ]
    },
  },
  D_PHASE_ORDER_IMPOSSIBLE: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes[0]!.phaseEvents = [
        { id: 'phase-3', phase: 'PHASE_3', date: '2024-01-01' },
        { id: 'phase-1', phase: 'PHASE_1', date: '2025-01-01' },
      ]
    },
  },
  D_PROGRAMME_END_BEFORE_START: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes[0]!.endDate = '2023-01-01'
    },
  },
  D_RESULT_BEFORE_TRIAL_START: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims[0]!.resultDate = '2024-12-01'
    },
  },
  D_RESULT_DATE_IN_FUTURE: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims[0]!.resultDate = '2027-01-01'
    },
  },
  D_SNAPSHOT_CHAIN_NOT_CHRONOLOGICAL: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sourceSnapshots.push({
        id: 'snapshot-2',
        sourceId: 'source-primary',
        retrievedAt: '2026-07-01',
        contentHash: 'sha256:snapshot-2',
        previousSnapshotId: 'snapshot-1',
      })
    },
  },
  D_SNAPSHOT_DATE_IN_FUTURE: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sourceSnapshots[0]!.retrievedAt = '2027-01-01'
    },
  },
  D_SOURCE_PUBLISHED_AFTER_RETRIEVAL: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sources[0]!.publicationDate = '2027-01-01'
    },
  },
  D_TRIAL_END_BEFORE_START: {
    level: 'BLOCK',
    mutate: (input) => {
      input.trials[0]!.endDate = '2024-01-01'
    },
  },
  D_TRIAL_IDENTIFIER_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.trials[0]!.registrationId = ''
    },
  },

  E_CLAIM_LINKED_AS_SUPPORT_AND_CONTRADICTION: {
    level: 'BLOCK',
    mutate: (input) => {
      const node = input.evidenceNodes[0]!
      node.contradictingClaimIds = [node.supportingClaimIds[0]!]
    },
  },
  E_CONFIRMED_WITHOUT_SUPPORT: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims.find((claim) => claim.id === 'claim-human')!.nature = 'UNKNOWN'
    },
  },
  E_CONTRADICTED_WITHOUT_EVIDENCE: {
    level: 'BLOCK',
    mutate: (input) => {
      const node = input.evidenceNodes.find((item) => item.id === 'node-target')!
      node.state = 'CONTRADICTED'
      node.supportingClaimIds = []
      node.contradictingClaimIds = ['claim-target-unknown']
    },
  },
  E_DOWNSTREAM_ASSERTED_AFTER_EXPOSURE_FAILURE: {
    level: 'WARNING',
    mutate: (input) => {
      const exposure = input.evidenceNodes.find((item) => item.id === 'node-useful')!
      exposure.state = 'CONTRADICTED'
      exposure.supportingClaimIds = []
      exposure.contradictingClaimIds = ['claim-useful']
      const target = input.evidenceNodes.find((item) => item.id === 'node-target')!
      target.state = 'CONFIRMED'
      input.claims.find((claim) => claim.id === 'claim-target-unknown')!.nature = 'MEASURED'
      input.claims.find((claim) => claim.id === 'claim-target-unknown')!.sourceIds = [
        'source-primary',
      ]
    },
  },
  E_DUPLICATE_NODE_ID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.evidenceNodes.push(structuredClone(input.evidenceNodes[0]!))
    },
  },
  E_DUPLICATE_NODE_TYPE: {
    level: 'BLOCK',
    mutate: (input) => {
      input.evidenceNodes.push({ ...structuredClone(input.evidenceNodes[0]!), id: 'node-human-2' })
    },
  },
  E_EXPLORATORY_BENEFIT_UNDISCLOSED: {
    level: 'WARNING',
    mutate: (input) => {
      const claim = input.claims[0]!
      claim.endpointHierarchy = 'EXPLORATORY'
      claim.outcomeType = 'PATIENT_OUTCOME'
      claim.exploratoryNatureDisclosed = false
    },
  },
  E_MATERIALLY_CONFLICTING_CLAIMS: {
    level: 'WARNING',
    mutate: (input) => {
      const node = input.evidenceNodes[0]!
      const claim = input.claims.find((item) => item.id === 'claim-useful')!
      claim.evidenceNodeType = node.type
      node.contradictingClaimIds = [claim.id]
    },
  },
  E_MIXED_WITHOUT_BOTH_DIRECTIONS: {
    level: 'BLOCK',
    mutate: (input) => {
      input.evidenceNodes[0]!.state = 'MIXED'
    },
  },
  E_MEASURED_IN_PEOPLE_UNSUPPORTED: {
    level: 'BLOCK',
    mutate: (input) => {
      attachValidPresentation(input)
      input.presentation!.mechanismSteps[0]!.claimLinks[0]!.claimId = 'claim-unanswered'
    },
  },
  E_MEASURED_OUTSIDE_PEOPLE_UNSUPPORTED: {
    level: 'BLOCK',
    mutate: (input) => {
      attachValidPresentation(input)
      input.presentation!.mechanismSteps[0]!.evidenceBasis = 'MEASURED_OUTSIDE_PEOPLE'
    },
  },
  E_NODE_CLAIM_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.evidenceNodes[0]!.supportingClaimIds = ['missing-claim']
    },
  },
  E_NODE_CLAIM_PROGRAMME_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      addProgramme(input)
      input.claims[0]!.programmeId = 'programme-2'
    },
  },
  E_NODE_CLAIM_TYPE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.claims[0]!.evidenceNodeType = 'TARGET_ENGAGEMENT'
    },
  },
  E_NODE_PROGRAMME_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.evidenceNodes[0]!.programmeId = 'missing-programme'
    },
  },
  E_NOT_MEASURED_PRESENTED_AS_NEGATIVE: {
    level: 'BLOCK',
    mutate: (input) => {
      input.evidenceNodes.find((node) => node.id === 'node-bio')!.presentedAsNegative = true
    },
  },
  E_PRESENTATION_CLAIM_UNSUPPORTED: {
    level: 'BLOCK',
    mutate: (input) => {
      attachValidPresentation(input)
      input.presentation!.mechanismSteps[0]!.claimLinks[0]!.relationship = 'CONTRADICTS'
    },
  },
  E_PRESENTATION_RELATIONSHIP_CONFLICT: {
    level: 'BLOCK',
    mutate: (input) => {
      attachValidPresentation(input)
      input.presentation!.mechanismSteps[0]!.claimLinks.push({
        ...input.presentation!.mechanismSteps[0]!.claimLinks[0]!,
        relationship: 'CONTRADICTS',
      })
    },
  },
  E_SURROGATE_PRESENTED_AS_PATIENT_OUTCOME: {
    level: 'WARNING',
    mutate: (input) => {
      input.claims[0]!.outcomeType = 'SURROGATE'
      input.claims[0]!.presentedAsPatientBenefit = true
    },
  },
  E_TARGET_ENGAGEMENT_ASSUMED: {
    level: 'WARNING',
    mutate: (input) => {
      input.evidenceNodes.find((node) => node.id === 'node-target')!.state = 'CONFIRMED'
      input.claims.find((claim) => claim.id === 'claim-target-unknown')!.nature =
        'RNAWIKI_JUDGEMENT'
    },
  },
  E_UNKNOWN_PRESENTED_AS_POSITIVE: {
    level: 'BLOCK',
    mutate: (input) => {
      input.evidenceNodes.find((node) => node.id === 'node-target')!.presentedAsPositive = true
    },
  },
  E_VISIBLE_NODE_WITHOUT_CLAIM: {
    level: 'BLOCK',
    mutate: (input) => {
      input.evidenceNodes[0]!.supportingClaimIds = []
    },
  },

  F_ADJUDICATED_EXCEPTION_INCOMPLETE: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.adjudicatedException = { adjudicatorId: '', rationale: 'Because.' }
    },
  },
  F_ADJUDICATED_RUBRIC_EXCEPTION: {
    level: 'REVIEW_IMPACT',
    mutate: (input) => {
      input.verdicts[0]!.code = 'IDEA_FAILED'
      input.verdicts[0]!.adjudicatedException = {
        adjudicatorId: 'reviewer-3',
        rationale: 'A documented programme-specific exception to the normal rubric.',
      }
    },
  },
  F_IDEA_FAILED_RUBRIC_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.code = 'IDEA_FAILED'
    },
  },
  F_INTERPRETABILITY_CLAIM_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes[0]!.studyInterpretability!.supportingClaimIdsByCriterion.STATISTICAL_POWER =
        ['missing-claim']
    },
  },
  F_INTERPRETABILITY_CLAIM_SCOPE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      addProgramme(input)
      input.claims.find((claim) => claim.id === 'claim-unanswered')!.programmeId = 'programme-2'
    },
  },
  F_INTERPRETABILITY_UNSUPPORTED: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes[0]!.studyInterpretability!.supportingClaimIdsByCriterion.ENDPOINT_VALIDITY =
        []
    },
  },
  F_MOLECULE_FAILED_RUBRIC_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.code = 'MOLECULE_FAILED'
    },
  },
  F_STOPPING_REASON_ONLY: {
    level: 'BLOCK',
    mutate: (input) => {
      const claim = input.claims.find((item) => item.id === 'claim-unanswered')!
      claim.nature = 'SPONSOR_REPORTED'
      claim.stoppingReason = true
    },
  },
  F_TEST_UNANSWERED_RUBRIC_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.programmes[0]!.stoppingReasonCategory = 'EFFICACY'
      const interpretability = input.programmes[0]!.studyInterpretability!
      interpretability.statisticalPower = 'YES'
      interpretability.populationSelection = 'YES'
      interpretability.exposureAdequacy = 'YES'
      interpretability.endpointValidity = 'YES'
      interpretability.durationAndOperationalIntegrity = 'YES'
      for (const node of input.evidenceNodes) {
        node.state = 'CONFIRMED'
        node.contradictingClaimIds = []
        const claim = input.claims.find((item) => item.id === node.supportingClaimIds[0])!
        claim.nature = 'MEASURED'
        claim.sourceIds = ['source-primary']
      }
    },
  },
  F_UNKNOWN_USED_AS_FAILURE_EVIDENCE: {
    level: 'BLOCK',
    mutate: (input) => {
      input.verdicts[0]!.code = 'IDEA_FAILED'
      input.verdicts[0]!.supportingClaimIds = ['claim-target-unknown']
    },
  },
  F_VERDICT_CANDIDATE_CLAIM_SCOPE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      addProgramme(input)
      input.claims.find((claim) => claim.id === 'claim-useful')!.programmeId = 'programme-2'
      input.verdicts[0]!.candidateLimitationClaimIds = ['claim-useful']
    },
  },
  F_VERDICT_CONTRADICTORY_CLAIM_SCOPE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      addProgramme(input)
      input.claims.find((claim) => claim.id === 'claim-useful')!.programmeId = 'programme-2'
      input.verdicts[0]!.contradictoryClaimIds = ['claim-useful']
    },
  },
  F_VERDICT_SUPPORT_CLAIM_SCOPE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      addProgramme(input)
      input.claims.find((claim) => claim.id === 'claim-unanswered')!.programmeId = 'programme-2'
    },
  },

  G_ABSOLUTE_MEDICAL_LANGUAGE: {
    level: 'WARNING',
    mutate: (input) => {
      setPlainText(input, 'This medicine is always safe.')
    },
  },
  G_ACRONYM_NOT_INTRODUCED: {
    level: 'WARNING',
    mutate: (input) => {
      input.policy = { readability: { allowedAcronyms: [] } }
      setPlainText(input, 'The LDL result changed.')
    },
  },
  G_COMPLEX_TERM_UNEXPLAINED: {
    level: 'WARNING',
    mutate: (input) => {
      setPlainText(input, 'The pharmacokinetics differed between groups.')
    },
  },
  G_DUPLICATE_PLAIN_SECTION_ID: {
    level: 'BLOCK',
    mutate: (input) => {
      setPlainText(input, 'A clear sentence.')
      input.plainLanguageSections!.push(structuredClone(input.plainLanguageSections![0]!))
    },
  },
  G_DUPLICATE_SUMMARY_ID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.tenSecondSummaries!.push(structuredClone(input.tenSecondSummaries![0]!))
    },
  },
  G_FAILED_WITHOUT_SUBJECT: {
    level: 'WARNING',
    mutate: (input) => {
      setPlainText(input, 'It failed.')
    },
  },
  G_FIRST_SCREEN_WORD_LIMIT: {
    level: 'WARNING',
    mutate: (input) => {
      input.policy = { readability: { maxFirstScreenWords: 3 } }
    },
  },
  G_NUMBER_CONTEXT_MISSING: {
    level: 'WARNING',
    mutate: (input) => {
      setPlainText(input, 'The reported value was 12%.', {
        numericStatements: [{ value: '12%' }],
      })
    },
  },
  G_PARAGRAPH_TOO_LONG: {
    level: 'WARNING',
    mutate: (input) => {
      input.policy = { readability: { maxParagraphWords: 2 } }
      setPlainText(input, 'One two three.')
    },
  },
  G_READABILITY_POLICY_INVALID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.policy = { readability: { maxSentenceWords: 0 } }
    },
  },
  G_SENTENCE_TOO_LONG: {
    level: 'WARNING',
    mutate: (input) => {
      input.policy = { readability: { maxSentenceWords: 2 } }
      setPlainText(input, 'One two three.')
    },
  },
  G_SUMMARY_PROGRAMME_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.tenSecondSummaries![0]!.programmeId = 'missing-programme'
    },
  },
  G_TEN_SECOND_CLAIM_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.tenSecondSummaries![0]!.plainMechanism.supportingClaimIds = ['missing-claim']
    },
  },
  G_TEN_SECOND_CLAIM_SCOPE_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      addProgramme(input)
      input.claims.find((claim) => claim.id === 'claim-useful')!.programmeId = 'programme-2'
    },
  },
  G_TEN_SECOND_PART_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.tenSecondSummaries![0]!.mainLimitation.text = ''
    },
  },
  G_TEN_SECOND_PART_UNSUPPORTED: {
    level: 'BLOCK',
    mutate: (input) => {
      input.tenSecondSummaries![0]!.mainLimitation.supportingClaimIds = []
    },
  },
  G_TEN_SECOND_TOO_MANY_SENTENCES: {
    level: 'WARNING',
    mutate: (input) => {
      const summary = input.tenSecondSummaries![0]!
      summary.plainMechanism.text = 'First sentence.'
      summary.bestSupportedFinding.text = 'Second sentence.'
      summary.mainLimitation.text = 'Third sentence.'
    },
  },
  G_TREATMENT_RECOMMENDATION_LANGUAGE: {
    level: 'WARNING',
    mutate: (input) => {
      setPlainText(input, 'You should start taking it.')
    },
  },
  G_WORKED_WITHOUT_OUTCOME: {
    level: 'WARNING',
    mutate: (input) => {
      setPlainText(input, 'It worked.')
    },
  },

  H_AS_OF_DATE_INVALID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.asOfDate = 'today'
    },
  },
  H_CHANGED_ENTITY_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.changes = [
        { entity: { type: 'CLAIM', id: 'missing-claim' }, changedFields: ['direction'] },
      ]
    },
  },
  H_CHANGE_FIELDS_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      input.changes = [{ entity: { type: 'CLAIM', id: 'claim-human' }, changedFields: [] }]
    },
  },
  H_DEPENDENCY_CYCLE: {
    level: 'BLOCK',
    mutate: (input) => {
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
      ]
    },
  },
  H_DEPENDENCY_PATH_MISSING: {
    level: 'WARNING',
    mutate: (input) => {
      input.changes = [
        { entity: { type: 'CLAIM', id: 'claim-human' }, changedFields: ['direction'] },
      ]
    },
  },
  H_DEPENDENCY_SOURCE_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.dependencies = [
        {
          from: { type: 'CLAIM', id: 'missing-claim' },
          to: { type: 'SUMMARY', id: 'summary-1' },
          impact: 'LOW_RISK_EXACT_DATA',
        },
      ]
    },
  },
  H_DEPENDENCY_TARGET_NOT_FOUND: {
    level: 'BLOCK',
    mutate: (input) => {
      input.dependencies = [
        {
          from: { type: 'CLAIM', id: 'claim-human' },
          to: { type: 'SUMMARY', id: 'missing-summary' },
          impact: 'LOW_RISK_EXACT_DATA',
        },
      ]
    },
  },
  H_DEPENDENT_CONTENT_AFFECTED: {
    level: 'REVIEW_IMPACT',
    mutate: (input) => {
      input.dependencies = [
        {
          from: { type: 'CLAIM', id: 'claim-human' },
          to: { type: 'SUMMARY', id: 'summary-1' },
          impact: 'POSSIBLE_VERDICT_IMPACT',
        },
      ]
      input.changes = [
        { entity: { type: 'CLAIM', id: 'claim-human' }, changedFields: ['direction'] },
      ]
    },
  },
  H_FRESHNESS_POLICY_INVALID: {
    level: 'BLOCK',
    mutate: (input) => {
      input.policy = {
        freshness: { maxAgeDaysBySourceType: { CLINICAL_TRIAL_REGISTRY: 0 } },
      }
    },
  },
  H_PRESENTATION_DEPENDENCY_MISSING: {
    level: 'BLOCK',
    mutate: (input) => {
      attachValidPresentation(input)
      input.dependencies = input.dependencies!.filter(
        (dependency) => dependency.to.id !== 'verdict-1:mechanism:delivery',
      )
    },
  },
  H_SOURCE_CHANGE_SNAPSHOT_MISMATCH: {
    level: 'BLOCK',
    mutate: (input) => {
      input.changes = [
        {
          entity: { type: 'SOURCE', id: 'source-primary' },
          changedFields: ['title'],
          snapshotId: 'missing-snapshot',
        },
      ]
    },
  },
  H_SOURCE_CHANGE_SNAPSHOT_NOT_LATEST: {
    level: 'BLOCK',
    mutate: (input) => {
      input.sourceSnapshots.push({
        id: 'snapshot-2',
        sourceId: 'source-primary',
        retrievedAt: '2026-08-15',
        contentHash: 'sha256:snapshot-2',
        previousSnapshotId: 'snapshot-1',
      })
      input.changes = [
        {
          entity: { type: 'SOURCE', id: 'source-primary' },
          changedFields: ['title'],
          snapshotId: 'snapshot-1',
        },
      ]
    },
  },
  H_SOURCE_CHANGE_WITHOUT_SNAPSHOT: {
    level: 'BLOCK',
    mutate: (input) => {
      input.changes = [
        {
          entity: { type: 'SOURCE', id: 'source-primary' },
          changedFields: ['title'],
        },
      ]
    },
  },
} satisfies Record<EvidenceRuleCode, RuleCase>

describe('RNA Intelligence Groups B-H stable rule-code coverage', () => {
  it('has one executable focused case for every registered stable code', () => {
    expect(new Set(EVIDENCE_RULE_CODES).size).toBe(EVIDENCE_RULE_CODES.length)
    expect(Object.keys(ruleCases).sort()).toEqual([...EVIDENCE_RULE_CODES].sort())
  })

  for (const code of EVIDENCE_RULE_CODES) {
    const testCase = ruleCases[code]
    it(`${code} is reachable and preserves its finding contract`, () => {
      const input = cloneEvidenceInput()
      testCase.mutate(input)
      const finding = runEvidenceIntelligence(input).findings.find((item) => item.code === code)

      expect(finding, `${code} did not emit`).toBeDefined()
      expect(finding).toMatchObject({
        code,
        group: code.slice(0, 1),
        level: testCase.level,
      })
      expect(finding!.message.trim().length).toBeGreaterThan(10)
      expect(finding!.affectedEntity.id.trim().length).toBeGreaterThan(0)
      expect(finding!.affectedField.trim().length).toBeGreaterThan(0)
      expect(finding!.correctiveAction.trim().length).toBeGreaterThan(10)
    })
  }
})

describe('closed rule-engine escape paths', () => {
  it('lints the actual 10-second summary even when no duplicate plain-language section is supplied', () => {
    const input = cloneEvidenceInput()
    input.policy = { readability: { allowedAcronyms: [] } }
    input.tenSecondSummaries![0]!.plainMechanism.text = 'XYZ changes the intended pathway'

    expect(runEvidenceIntelligence(input).warnings.map((finding) => finding.code)).toContain(
      'G_ACRONYM_NOT_INTRODUCED',
    )
  })

  it('keeps the highest-impact causal source when two changes reach the same dependent content', () => {
    const input = cloneEvidenceInput()
    addSource(input, 'source-secondary')
    input.dependencies = [
      {
        from: { type: 'SOURCE', id: 'source-primary' },
        to: { type: 'SUMMARY', id: 'summary-1' },
        impact: 'SAFETY_CRITICAL_REVIEW',
      },
      {
        from: { type: 'SOURCE', id: 'source-secondary' },
        to: { type: 'SUMMARY', id: 'summary-1' },
        impact: 'LOW_RISK_EXACT_DATA',
      },
    ]
    input.changes = [
      {
        entity: { type: 'SOURCE', id: 'source-primary' },
        changedFields: ['title'],
        snapshotId: 'snapshot-1',
      },
      {
        entity: { type: 'SOURCE', id: 'source-secondary' },
        changedFields: ['title'],
        snapshotId: 'snapshot-source-secondary',
      },
    ]

    expect(runEvidenceIntelligence(input).impactPlan.affected).toContainEqual({
      entity: { type: 'SUMMARY', id: 'summary-1' },
      impact: 'SAFETY_CRITICAL_REVIEW',
      via: { type: 'SOURCE', id: 'source-primary' },
    })
  })

  it('does not treat an impossible calendar date as a valid ISO date', () => {
    const input = cloneEvidenceInput()
    input.trials[0]!.startDate = '2025-02-30'
    expect(runEvidenceIntelligence(input).blocks.map((finding) => finding.code)).toContain(
      'D_DATE_INVALID',
    )
  })
})
