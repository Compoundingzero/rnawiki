import { describe, expect, it } from 'vitest'

import { programmePresentationReplaceSchema } from '@/lib/queries/programme-presentation'

function validPresentation() {
  return {
    mechanismSteps: ['delivery', 'target', 'outcome'].map((stepKey, index) => ({
      stepKey,
      stepOrder: index + 1,
      plainTitle: `Reviewed stage ${index + 1}`,
      plainDescription: 'This stage says only what the exact reviewed evidence supports.',
      evidenceBasis: 'UNKNOWN' as const,
      claimLinks: [{ claimId: `claim-${index + 1}`, relationship: 'SUPPORTS' as const }],
    })),
    timelineEvents: [],
  }
}

describe('programme presentation authoring schema', () => {
  it('accepts one complete strict whole-presentation replacement', () => {
    expect(programmePresentationReplaceSchema.parse(validPresentation())).toEqual(
      validPresentation(),
    )
  })

  it.each(['root', 'step', 'event', 'link'] as const)('rejects an unknown %s key', (level) => {
    const input: Record<string, unknown> = structuredClone(validPresentation())
    if (level === 'root') input.serverOwned = true
    if (level === 'step') {
      ;(input.mechanismSteps as Array<Record<string, unknown>>)[0]!.serverOwned = true
    }
    if (level === 'link') {
      const firstStep = (input.mechanismSteps as Array<Record<string, unknown>>)[0]!
      ;(firstStep.claimLinks as Array<Record<string, unknown>>)[0]!.serverOwned = true
    }
    if (level === 'event') {
      input.timelineEvents = [
        {
          eventKey: 'important-result',
          eventDate: '2026-08-20',
          eventType: 'IMPORTANT_RESULT',
          dateBasis: 'ACTUAL',
          plainTitle: 'A result changed the reviewed programme record',
          plainDescription: 'This event cites one exact saved source version.',
          sourceId: 'source-1',
          sourceSnapshotId: 'snapshot-1',
          claimLinks: [{ claimId: 'claim-1', relationship: 'SUPPORTS' }],
          serverOwned: true,
        },
      ]
    }
    expect(programmePresentationReplaceSchema.safeParse(input).success).toBe(false)
  })

  it('rejects conflicting relationships for the same target and claim', () => {
    const input = validPresentation()
    ;(
      input.mechanismSteps[0]!.claimLinks as Array<{
        claimId: string
        relationship: 'SUPPORTS' | 'CONTRADICTS'
      }>
    ).push({
      claimId: input.mechanismSteps[0]!.claimLinks[0]!.claimId,
      relationship: 'CONTRADICTS',
    })
    expect(programmePresentationReplaceSchema.safeParse(input).success).toBe(false)
  })
})
