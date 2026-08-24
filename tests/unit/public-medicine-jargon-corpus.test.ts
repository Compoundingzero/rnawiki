import { describe, expect, it } from 'vitest'

import { medicineTextContextMatches } from '@/lib/annotated-medicine-text'
import { detectPublicMedicineContextItems } from '@/lib/public-medicine-context'
import { SEED_DOSSIERS } from '@/scripts/seed-data'

const NON_CONCEPTUAL_CONTEXT_KEYS = new Set([
  'percentage',
  'percentage-versus-placebo',
  'percentage-points-versus-placebo',
  'percentage-points',
  'placebo',
  'confidence-interval',
  'statistics-hazard-ratio',
  'statistics-relative-risk',
  'study-baseline',
])

function seededVerdicts() {
  return SEED_DOSSIERS.flatMap((dossier) => {
    const text = dossier.oneSentenceVerdict.trim()
    return text ? [{ slug: dossier.slug, text }] : []
  })
}

describe('seeded medicine jargon corpus', () => {
  it('binds every context that the detector finds in a verdict', () => {
    const misses = seededVerdicts().flatMap(({ slug, text }) => {
      const contexts = detectPublicMedicineContextItems([text])
      const boundKeys = new Set(
        medicineTextContextMatches(text, contexts).map(({ context }) => context.key),
      )

      return contexts.flatMap((context) =>
        boundKeys.has(context.key) ? [] : [`${slug}: ${context.key}`],
      )
    })

    expect(misses).toEqual([])
  })

  it('keeps the conceptual-explanation gap below the audited baseline', () => {
    const verdicts = seededVerdicts()
    const withoutConcept = verdicts.flatMap(({ slug, text }) => {
      const hasConcept = detectPublicMedicineContextItems([text]).some(
        ({ key }) => !NON_CONCEPTUAL_CONTEXT_KEYS.has(key) && !key.startsWith('study-day-'),
      )
      return hasConcept ? [] : [slug]
    })

    // Before the safe general vocabulary was added, 356 of 506 verdicts had no conceptual
    // explanation. Reviewed general phrases reduced that gap to 64; this is a ratchet, not a quota.
    expect(verdicts).toHaveLength(506)
    expect(withoutConcept.length).toBeLessThanOrEqual(64)
  })
})
