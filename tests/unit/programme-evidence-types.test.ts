import { getTableName } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import {
  claimNatureEnum,
  claims,
  developmentProgrammes,
  evidenceNodeTypeEnum,
  evidenceNodes,
  evidenceMonitorRuns,
  evidenceReviewTasks,
  evidenceSources,
  programmeCurrentPublications,
  programmeDependencies,
  programmeFreshnessStates,
  programmeTrials,
  programmeStatusEnum,
  programmeVerdictRevisions,
  sourceCheckStatusEnum,
  sourceSnapshots,
  trialInterpretabilityAssessments,
  trialInterpretabilityClaims,
} from '@/db/schema'
import {
  CLAIM_NATURES,
  EVIDENCE_NODE_TYPES,
  EVIDENCE_STATES,
  MONITOR_RUN_STATUSES,
  PROGRAMME_STATUSES,
  SOURCE_CHECK_STATUSES,
  STUDY_INTERPRETABILITY_CRITERIA,
  STUDY_INTERPRETABILITY_STATES,
  isStoppedProgramme,
  isTerminalSourceCheckFailure,
  type ProgrammeEvidenceReadModel,
} from '@/lib/evidence/types'

describe('programme evidence vocabulary', () => {
  it('uses the same enum tuples in TypeScript and Drizzle', () => {
    expect(programmeStatusEnum.enumValues).toEqual(PROGRAMME_STATUSES)
    expect(evidenceNodeTypeEnum.enumValues).toEqual(EVIDENCE_NODE_TYPES)
    expect(claimNatureEnum.enumValues).toEqual(CLAIM_NATURES)
    expect(sourceCheckStatusEnum.enumValues).toEqual(SOURCE_CHECK_STATUSES)
  })

  it('never conflates missing evidence with contradictory evidence', () => {
    expect(EVIDENCE_STATES).toContain('UNKNOWN')
    expect(EVIDENCE_STATES).toContain('NOT_MEASURED')
    expect(EVIDENCE_STATES).toContain('CONTRADICTED')
    expect(new Set(EVIDENCE_STATES).size).toBe(EVIDENCE_STATES.length)
  })

  it('distinguishes an unknown source-check result from a known failure', () => {
    expect(isTerminalSourceCheckFailure('UNKNOWN')).toBe(false)
    expect(isTerminalSourceCheckFailure('NOT_CHECKED')).toBe(false)
    expect(isTerminalSourceCheckFailure('FAILED')).toBe(true)
    expect(isTerminalSourceCheckFailure('SOURCE_UNAVAILABLE')).toBe(true)
  })

  it('models all five study-interpretability questions without a guessed default', () => {
    expect(STUDY_INTERPRETABILITY_CRITERIA).toHaveLength(5)
    expect(STUDY_INTERPRETABILITY_STATES).toEqual(['YES', 'NO', 'UNCLEAR', 'NOT_REPORTED'])
  })

  it('keeps monitor failure distinct from an unknown monitor outcome', () => {
    expect(MONITOR_RUN_STATUSES).toContain('FAILED')
    expect(MONITOR_RUN_STATUSES).toContain('UNKNOWN')
    expect(MONITOR_RUN_STATUSES.indexOf('FAILED')).not.toBe(MONITOR_RUN_STATUSES.indexOf('UNKNOWN'))
  })

  it('limits stopped-programme semantics to stopped and withdrawn programmes', () => {
    for (const status of PROGRAMME_STATUSES) {
      expect(isStoppedProgramme(status)).toBe(status === 'STOPPED' || status === 'WITHDRAWN')
    }
  })
})

describe('programme evidence schema contract', () => {
  it('exposes every normalized foundation table under its stable SQL name', () => {
    expect([
      getTableName(developmentProgrammes),
      getTableName(evidenceSources),
      getTableName(sourceSnapshots),
      getTableName(claims),
      getTableName(evidenceNodes),
      getTableName(programmeVerdictRevisions),
      getTableName(programmeCurrentPublications),
      getTableName(programmeDependencies),
      getTableName(programmeFreshnessStates),
      getTableName(programmeTrials),
      getTableName(trialInterpretabilityAssessments),
      getTableName(trialInterpretabilityClaims),
      getTableName(evidenceMonitorRuns),
      getTableName(evidenceReviewTasks),
    ]).toEqual([
      'development_programmes',
      'evidence_sources',
      'source_snapshots',
      'claims',
      'evidence_nodes',
      'programme_verdict_revisions',
      'programme_current_publications',
      'programme_dependencies',
      'programme_freshness_states',
      'programme_trials',
      'trial_interpretability_assessments',
      'trial_interpretability_claims',
      'evidence_monitor_runs',
      'evidence_review_tasks',
    ])
  })

  it('keeps legacy medicines representable before any programme is sourced', () => {
    const legacyRead: ProgrammeEvidenceReadModel = {
      medicine: {
        id: 'drug_existing',
        slug: 'existing-medicine',
        name: 'Existing medicine',
        modality: 'Small Molecule',
      },
      programmes: [],
      selectedProgramme: null,
    }

    expect(legacyRead.selectedProgramme).toBeNull()
    expect(legacyRead.programmes).toEqual([])
  })
})
