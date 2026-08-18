import { describe, expect, it } from 'vitest'
import { formatCitation, type CitableClaim } from '@/lib/citation'
import { entityUrl } from '@/lib/canonical'

const baseClaim: CitableClaim = {
  directAnswer:
    'BPC-157 has produced tissue-healing effects in rat and cell studies, but no controlled human trial has confirmed it speeds healing in people.',
  entitySlug: 'bpc-157',
  claimSlug: 'tendon-healing',
  lastReviewedAt: new Date('2026-03-14T00:00:00Z'),
}

describe('formatCitation', () => {
  it('keeps the direct answer (claim + caveat, already one sentence) intact and unsplit', () => {
    const result = formatCitation(baseClaim)
    expect(result.startsWith(baseClaim.directAnswer)).toBe(true)
    // The caveat clause must never be separated onto its own trailing fragment — it's still part
    // of the same directAnswer string that opens the citation.
    expect(result.indexOf('no controlled human trial')).toBeLessThan(
      result.indexOf('RNAwiki')
    )
  })

  it('appends RNAwiki attribution with the reviewed date after the direct answer', () => {
    const result = formatCitation(baseClaim)
    expect(result).toContain('RNAwiki, reviewed 2026-03-14')
  })

  it('appends a URL pointing at the specific claim anchor on its entity page', () => {
    const result = formatCitation(baseClaim)
    expect(result).toContain('/r/bpc-157#claim-tendon-healing')
  })

  it('uses "pending review" in place of a date when lastReviewedAt is null', () => {
    const result = formatCitation({ ...baseClaim, lastReviewedAt: null })
    expect(result).toContain('RNAwiki, reviewed pending review')
    expect(result).not.toMatch(/reviewed \d{4}-\d{2}-\d{2}/)
  })

  it('produces the exact expected format: "<answer> RNAwiki, reviewed <date>: <url>"', () => {
    const result = formatCitation(baseClaim)
    const expectedUrl = `${entityUrl(baseClaim.entitySlug)}#claim-${baseClaim.claimSlug}`
    expect(result).toBe(`${baseClaim.directAnswer} RNAwiki, reviewed 2026-03-14: ${expectedUrl}`)
  })
})
