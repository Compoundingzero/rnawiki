import { describe, expect, it } from 'vitest'

import type { DossierV3ViewModel } from '@/lib/dossier-v3/view-model'
import type { DossierV4Inputs } from '@/lib/dossier-v4/view-model'
import { buildSafety } from '@/lib/dossier-v4/view-model'
import { EMPTY_RECORDED_LABEL, recordedLabelFor } from '@/lib/dossier-v4/recorded-label'
import type { MedicineRecordedBackground } from '@/lib/background/types'

const source = {
  label: 'US prescribing information',
  id: '12345678-1234-1234-1234-123456789abc',
  url: 'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=12345678-1234-1234-1234-123456789abc',
  binding: 'record' as const,
}

describe('recorded product-label safety', () => {
  it('puts the exact boxed warning first, keeps its source, and does not repeat it', () => {
    const warning = 'WARNING: A source-recorded boxed warning.'
    const safety = buildSafety(
      { legacyRecord: null } as DossierV4Inputs,
      { safety: { items: [] } } as unknown as DossierV3ViewModel,
      {
        ...EMPTY_RECORDED_LABEL,
        boxedWarning: { text: warning, citation: source },
        safety: [
          { text: `  ${warning}  `, citation: source },
          { text: 'A separate label precaution.', citation: source },
        ],
        interactions: [{ text: 'A labelled interaction.', citation: source }],
        adverseReactions: [{ text: 'A listed adverse reaction.', citation: source }],
      },
    )

    expect(safety.entries.map((entry) => entry.text)).toEqual([
      warning,
      'A separate label precaution.',
      'A labelled interaction.',
      'A listed adverse reaction.',
    ])
    expect(safety.entries[0]).toMatchObject({
      actionLabel: 'Boxed warning on a recorded product label',
      urgent: false,
      sources: [source],
    })
    expect(safety.entries[1]?.actionLabel).toBe('Warning on a recorded product label')
    expect(safety.entries[2]?.actionLabel).toBe('Interaction noted on a recorded product label')
    expect(safety.entries[3]?.actionLabel).toBe(
      'Adverse reaction listed on a recorded product label',
    )
  })

  it('keeps every sourced contraindication visible ahead of routine warnings', () => {
    const contraindications = Array.from({ length: 6 }, (_, index) => ({
      textAsRecorded: `Do not use this named product in group ${index + 1}.`,
      source: {
        kind: 'FDA_LABEL',
        identifier: '12345678-1234-1234-1234-123456789abc',
        label: 'Example product label',
      },
    }))
    const label = recordedLabelFor({
      safety: {
        contraindications,
      },
    } as unknown as MedicineRecordedBackground)
    expect(label.contraindications).toHaveLength(6)
    expect(label.empty).toBe(false)

    const safety = buildSafety(
      { legacyRecord: null } as DossierV4Inputs,
      { safety: { items: [] } } as unknown as DossierV3ViewModel,
      {
        ...label,
        safety: [{ text: 'Another label precaution.', citation: source }],
      },
    )

    expect(safety.entries.slice(0, 6).map((entry) => entry.text)).toEqual(
      contraindications.map((item) => item.textAsRecorded),
    )
    expect(safety.entries[0]).toMatchObject({
      actionLabel: 'Who the recorded product label says should not use it',
      evidenceSource: 'product_label',
    })
    expect(safety.entries[0]?.sources[0]?.url).toContain('dailymed.nlm.nih.gov')
    expect(safety.entries[6]?.text).toBe('Another label precaution.')
  })
})
