import { describe, expect, it } from 'vitest'

import type { DossierV3ViewModel } from '@/lib/dossier-v3/view-model'
import type { DossierV4Inputs } from '@/lib/dossier-v4/view-model'
import { buildSafety } from '@/lib/dossier-v4/view-model'
import { EMPTY_RECORDED_LABEL } from '@/lib/dossier-v4/recorded-label'

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
})
