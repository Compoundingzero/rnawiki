import { describe, expect, it } from 'vitest'

import {
  EVIDENCE_ENGINE_VERSION,
  EVIDENCE_PRESENTATION_ENGINE_VERSION,
  runEvidenceIntelligence,
  type EvidenceIntelligenceInput,
} from '@/lib/rna-intelligence'
import { cloneEvidenceInput } from './evidence-fixture'

function presentationInput(): EvidenceIntelligenceInput {
  const input = cloneEvidenceInput()
  input.presentation = {
    schemaVersion: 'programme-presentation/v1',
    verdictRevisionId: 'verdict-1',
    programmeId: 'programme-1',
    mechanismSteps: [
      {
        id: 'delivery',
        programmeId: 'programme-1',
        order: 1,
        plainTitle: 'The medicine reached participants',
        plainDescription: 'The clinical study recorded exposure after the medicine was given.',
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
  input.dependencies = [
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
  ]
  return input
}

describe('RNA Intelligence presentation/v1', () => {
  it('selects engine 2.1 only for presentation input and remains deterministic', () => {
    expect(runEvidenceIntelligence(cloneEvidenceInput()).engineVersion).toBe(
      EVIDENCE_ENGINE_VERSION,
    )
    const input = presentationInput()
    const first = runEvidenceIntelligence(input)
    const second = runEvidenceIntelligence(structuredClone(input))
    expect(first.engineVersion).toBe(EVIDENCE_PRESENTATION_ENGINE_VERSION)
    expect(first.canPublish).toBe(true)
    expect(second).toEqual(first)
  })

  it.each([
    [
      'copy',
      (input: EvidenceIntelligenceInput) =>
        (input.presentation!.mechanismSteps[0]!.plainDescription += ' More context.'),
    ],
    [
      'order',
      (input: EvidenceIntelligenceInput) =>
        ([
          input.presentation!.mechanismSteps[0]!.order,
          input.presentation!.mechanismSteps[1]!.order,
        ] = [2, 1]),
    ],
    [
      'basis',
      (input: EvidenceIntelligenceInput) =>
        (input.presentation!.mechanismSteps[2]!.evidenceBasis = 'PREDICTED'),
    ],
    [
      'claim',
      (input: EvidenceIntelligenceInput) =>
        (input.presentation!.mechanismSteps[2]!.claimLinks[0]!.claimId = 'claim-human'),
    ],
    [
      'snapshot',
      (input: EvidenceIntelligenceInput) =>
        (input.presentation!.timelineEvents[0]!.sourceSnapshotId = 'snapshot-other'),
    ],
    [
      'date',
      (input: EvidenceIntelligenceInput) =>
        (input.presentation!.timelineEvents[0]!.date = '2025-01-16'),
    ],
    [
      'event type',
      (input: EvidenceIntelligenceInput) =>
        (input.presentation!.timelineEvents[0]!.eventType = 'IMPORTANT_RESULT'),
    ],
  ])('changes the signed input digest when %s changes', (_label, mutate) => {
    const baseline = presentationInput()
    const changed = structuredClone(baseline)
    mutate(changed)
    expect(runEvidenceIntelligence(changed).inputDigest).not.toBe(
      runEvidenceIntelligence(baseline).inputDigest,
    )
  })

  it('blocks a measured-in-people label without a human measurement', () => {
    const input = presentationInput()
    input.presentation!.mechanismSteps[0]!.claimLinks[0]!.claimId = 'claim-unanswered'
    expect(runEvidenceIntelligence(input).blocks.map((finding) => finding.code)).toContain(
      'E_MEASURED_IN_PEOPLE_UNSUPPORTED',
    )
  })

  it('does not treat a sponsor-reported claim as a direct human measurement', () => {
    const input = presentationInput()
    const humanClaim = input.claims.find((claim) => claim.id === 'claim-human')
    if (!humanClaim) throw new Error('Expected the human claim fixture.')
    humanClaim.nature = 'SPONSOR_REPORTED'

    expect(runEvidenceIntelligence(input).blocks.map((finding) => finding.code)).toContain(
      'E_MEASURED_IN_PEOPLE_UNSUPPORTED',
    )
  })

  it('blocks a measured-outside-people label backed only by a human study', () => {
    const input = presentationInput()
    input.presentation!.mechanismSteps[0]!.evidenceBasis = 'MEASURED_OUTSIDE_PEOPLE'

    expect(runEvidenceIntelligence(input).blocks.map((finding) => finding.code)).toContain(
      'E_MEASURED_OUTSIDE_PEOPLE_UNSUPPORTED',
    )
  })

  it('blocks two relationships from the same claim to one presentation target', () => {
    const input = presentationInput()
    input.presentation!.mechanismSteps[0]!.claimLinks.push({
      ...input.presentation!.mechanismSteps[0]!.claimLinks[0]!,
      relationship: 'CONTRADICTS',
    })

    expect(runEvidenceIntelligence(input).blocks.map((finding) => finding.code)).toContain(
      'E_PRESENTATION_RELATIONSHIP_CONFLICT',
    )
  })

  it('rejects a mechanism claim without a source snapshot that supports that claim', () => {
    const input = presentationInput()
    input.presentation!.mechanismSteps[0]!.claimLinks[0]!.supportingSourceSnapshotIds = []

    expect(runEvidenceIntelligence(input).blocks.map((finding) => finding.code)).toContain(
      'C_PRESENTATION_SOURCE_UNBOUND',
    )
  })
})
