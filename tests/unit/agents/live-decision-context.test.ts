import { describe, expect, it } from 'vitest'

import { reviewEvidenceSource } from '@/lib/agents/core/evidence'
import {
  agentLiveDecisionRelevantMedicineSlugs,
  buildAgentLiveDecisionContext,
  resolveAgentStoredField,
} from '@/lib/agents/core/live-decision-context'
import type { BackgroundSource, MedicineRecordedBackground } from '@/lib/background/types'

const SOURCE: BackgroundSource = {
  kind: 'FDA_LABEL',
  identifier: 'fixture-label',
  label: 'Fixture label',
  retrievedAt: '2026-08-31T00:00:00.000Z',
  excerpt: 'The terminal half-life was 10 hours.',
}

function background(
  overrides: Record<string, unknown> = {},
  source: BackgroundSource = SOURCE,
): MedicineRecordedBackground {
  return {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-31T00:00:00.000Z',
    pharmacokinetics: {
      routeAsRecorded: 'oral',
      halfLife: {
        display: '10 hours',
        numeric: 10,
        unit: 'hours',
        populationContext: 'fixture population',
        source,
      },
    },
    commonAdverseReactions: {
      eventsAsRecorded: ['nausea (68%)', 'headache (12%)'],
      populationContext: 'fixture population',
      source,
    },
    ...overrides,
  } as unknown as MedicineRecordedBackground
}

function evidence(
  source: BackgroundSource = SOURCE,
  observation: Record<string, unknown> = { recordedValue: '10 hours' },
): Record<string, unknown> {
  return { observation, sourceReadings: [reviewEvidenceSource(source)] }
}

function context(
  input: {
    fieldPath?: string
    evidence?: Record<string, unknown>
    medicines?: readonly { slug: string; recordedBackground: MedicineRecordedBackground | null }[]
  } = {},
) {
  return buildAgentLiveDecisionContext({
    candidateKey: '1'.repeat(64),
    occurrenceKey: '2'.repeat(64),
    evidenceDigest: '3'.repeat(64),
    subjectId: 'fixture-medicine',
    fieldPath: input.fieldPath ?? 'pharmacokinetics.halfLife',
    evidence: input.evidence ?? evidence(),
    medicines: input.medicines ?? [{ slug: 'fixture-medicine', recordedBackground: background() }],
  })
}

describe('agent live decision context', () => {
  it('preserves source-controlled version dates without inventing them when absent', () => {
    expect(
      reviewEvidenceSource({
        ...SOURCE,
        version: 'label-revision-7',
        effectiveDate: '2026-08-15',
      }),
    ).toMatchObject({ version: 'label-revision-7', effectiveDate: '2026-08-15' })
    expect(reviewEvidenceSource(SOURCE)).not.toHaveProperty('version')
    expect(reviewEvidenceSource(SOURCE)).not.toHaveProperty('effectiveDate')
  })

  it('resolves only exact stored JSON paths, including literal array selectors', () => {
    expect(resolveAgentStoredField(background(), 'pharmacokinetics.halfLife')).toMatchObject({
      state: 'present',
      value: { display: '10 hours', numeric: 10, unit: 'hours' },
    })
    expect(
      resolveAgentStoredField(
        background(),
        'commonAdverseReactions.eventsAsRecorded["nausea (68%)"]',
      ),
    ).toEqual({ state: 'present', value: 'nausea (68%)' })
  })

  it('reports detector-only semantic paths as absent instead of substituting the observation', () => {
    const result = context({
      fieldPath: 'silenceQuestions.routeEvidence',
      evidence: evidence(SOURCE, { routeEvidence: 'Agent-derived explanation' }),
    })

    expect(result.storedField).toMatchObject({
      state: 'absent',
      value: null,
      guardScope: 'relevant_medicine_backgrounds_and_sources',
    })
  })

  it('binds every candidate reading to its exact current medicine path', () => {
    const result = context()

    expect(result.allSourcesBound).toBe(true)
    expect(result.sourceBindings).toEqual([
      expect.objectContaining({
        sourceKey: 'FDA_LABEL:fixture-label',
        matches: expect.arrayContaining([
          {
            medicineSlug: 'fixture-medicine',
            path: 'recordedBackground.pharmacokinetics.halfLife.source',
          },
        ]),
      }),
    ])
  })

  it('matches kind-specific canonical source identifiers without weakening snapshot equality', () => {
    const uppercaseSource = { ...SOURCE, identifier: 'FIXTURE-LABEL' }
    const canonicalReading = {
      ...reviewEvidenceSource(uppercaseSource),
      sourceKey: 'FDA_LABEL:fixture-label',
      identifier: 'fixture-label',
    }
    const result = context({
      evidence: { observation: {}, sourceReadings: [canonicalReading] },
      medicines: [
        { slug: 'fixture-medicine', recordedBackground: background({}, uppercaseSource) },
      ],
    })

    expect(result.allSourcesBound).toBe(true)
  })

  it('changes the guard for an exact value or source change but not an unrelated field change', () => {
    const before = context()
    const unrelated = context({
      medicines: [
        {
          slug: 'fixture-medicine',
          recordedBackground: background({ unrelatedFixtureNote: 'changed' }),
        },
      ],
    })
    const changedValue = context({
      medicines: [
        {
          slug: 'fixture-medicine',
          recordedBackground: background({
            pharmacokinetics: {
              routeAsRecorded: 'oral',
              halfLife: {
                display: '11 hours',
                numeric: 11,
                unit: 'hours',
                populationContext: 'fixture population',
                source: SOURCE,
              },
            },
          }),
        },
      ],
    })
    const changedSource = { ...SOURCE, excerpt: 'The terminal half-life was 11 hours.' }
    const changedSourceContext = context({
      medicines: [
        {
          slug: 'fixture-medicine',
          recordedBackground: background({}, changedSource),
        },
      ],
    })

    expect(unrelated.digest).toBe(before.digest)
    expect(changedValue.digest).not.toBe(before.digest)
    expect(changedSourceContext.digest).not.toBe(before.digest)
    expect(changedSourceContext.allSourcesBound).toBe(false)
  })

  it('conservatively guards the complete relevant envelope when a semantic path is absent', () => {
    const before = context({ fieldPath: 'silenceQuestions.routeEvidence' })
    const changed = context({
      fieldPath: 'silenceQuestions.routeEvidence',
      medicines: [
        {
          slug: 'fixture-medicine',
          recordedBackground: background({ unrelatedFixtureNote: 'changed' }),
        },
      ],
    })

    expect(changed.digest).not.toBe(before.digest)
  })

  it('includes cross-medicine member slugs and binds their source readings', () => {
    const memberSource = { ...SOURCE, identifier: 'member-label' }
    const candidateEvidence = {
      observation: { members: [{ slug: 'fixture-medicine' }, { slug: 'member-medicine' }] },
      sourceReadings: [reviewEvidenceSource(SOURCE), reviewEvidenceSource(memberSource)],
    }
    const result = context({
      evidence: candidateEvidence,
      medicines: [
        { slug: 'fixture-medicine', recordedBackground: background() },
        { slug: 'member-medicine', recordedBackground: background({}, memberSource) },
      ],
    })

    expect(agentLiveDecisionRelevantMedicineSlugs('fixture-medicine', candidateEvidence)).toEqual([
      'fixture-medicine',
      'member-medicine',
    ])
    expect(result.relevantMedicineSlugs).toEqual(['fixture-medicine', 'member-medicine'])
    expect(result.allSourcesBound).toBe(true)
  })
})
