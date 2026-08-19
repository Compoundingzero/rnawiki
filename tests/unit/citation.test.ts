import { describe, expect, it } from 'vitest'
import { formatCitation, type CitableClaim } from '@/lib/citation'
import { entityUrl } from '@/lib/canonical'

const baseClaim: CitableClaim = {
  directAnswer:
    'BPC-157 has produced tissue-healing effects in rat and cell studies, but no controlled human trial has confirmed it speeds healing in people.',
  entitySlug: 'bpc-157',
  claimSlug: 'tendon-healing',
  lastCheckedAt: new Date('2026-03-14T00:00:00Z'),
  checkedAt: new Date('2026-03-14T00:00:00Z'),
  approvedReviewDate: null,
}

describe('formatCitation', () => {
  it('keeps the direct answer (claim + caveat, already one sentence) intact and unsplit', () => {
    const result = formatCitation(baseClaim)
    expect(result.startsWith(baseClaim.directAnswer)).toBe(true)
    // The caveat clause must never be separated onto its own trailing fragment — it's still part
    // of the same directAnswer string that opens the citation.
    expect(result.indexOf('no controlled human trial')).toBeLessThan(result.indexOf('RNAwiki'))
  })

  it('appends a URL pointing at the specific claim anchor on its entity page', () => {
    const result = formatCitation(baseClaim)
    expect(result).toContain('/r/bpc-157#claim-tendon-healing')
  })

  it('says "checked", never "reviewed", when no approved review covers the claim', () => {
    const result = formatCitation(baseClaim)
    expect(result).toContain('RNAwiki, checked 2026-03-14')
    expect(result).not.toContain('reviewed')
  })

  it('never emits the old "pending review" placeholder in place of a date', () => {
    // A date is always available from claims.updatedAt, so there is no missing-date branch left.
    expect(formatCitation(baseClaim)).not.toContain('pending review')
    expect(
      formatCitation({ ...baseClaim, approvedReviewDate: new Date('2026-03-14T00:00:00Z') })
    ).not.toContain('pending review')
  })

  it('upgrades to "reviewed" only for a claim carrying a current approved review', () => {
    const result = formatCitation({ ...baseClaim, approvedReviewDate: new Date('2026-03-14T00:00:00Z') })
    expect(result).toContain('RNAwiki, reviewed 2026-03-14')
  })

  /**
   * REGRESSION. The "reviewed" branch used to take its date from `lastCheckedAt`, which is
   * `claims.updatedAt` — a database write timestamp. A claim approved on 15 January and republished
   * on 18 August then printed "RNAwiki, reviewed 2026-08-18" in the one string designed to be
   * pasted onto pages RNAwiki does not control, while the record's own provenance line on the same
   * page correctly said 15 January. The old tests could not catch it because they set
   * `lastCheckedAt` and `checkedAt` to the same value and supplied no review date at all.
   */
  it('prints the review date, never the write timestamp, when an approved review exists', () => {
    const result = formatCitation({
      ...baseClaim,
      lastCheckedAt: new Date('2026-08-18T20:03:26Z'),
      checkedAt: new Date('2026-08-18T00:00:00Z'),
      approvedReviewDate: new Date('2026-01-15T12:00:00Z'),
    })
    expect(result).toContain('RNAwiki, reviewed 2026-01-15')
    expect(result).not.toContain('2026-08-18')
  })

  it('falls back to the check verb and date when no approved review covers the claim', () => {
    const result = formatCitation({
      ...baseClaim,
      lastCheckedAt: new Date('2026-08-18T20:03:26Z'),
      checkedAt: new Date('2026-08-18T00:00:00Z'),
      approvedReviewDate: null,
    })
    expect(result).toContain('RNAwiki, checked 2026-08-18')
    expect(result).not.toContain('reviewed')
  })

  /**
   * The verb has to be earned. `lastCheckedAt` is `claims.updatedAt`, a database write timestamp;
   * a citation that says "checked" on the strength of a row being written asserts an editorial act
   * on someone else's page. With no recorded editorial check the citation drops to "edited" and
   * carries the write date, which is all `updatedAt` can support.
   */
  it('says "edited", not "checked", when no editorial check date is recorded', () => {
    const result = formatCitation({ ...baseClaim, checkedAt: null })
    expect(result).toContain('RNAwiki, edited 2026-03-14')
    expect(result).not.toContain('checked')
  })

  it('prints the recorded editorial check date, not the write timestamp, when both exist', () => {
    const result = formatCitation({
      ...baseClaim,
      lastCheckedAt: new Date('2026-08-19T00:00:00Z'),
      checkedAt: new Date('2026-08-18T00:00:00Z'),
    })
    expect(result).toContain('RNAwiki, checked 2026-08-18')
    expect(result).not.toContain('2026-08-19')
  })

  it('produces the exact expected format: "<answer> RNAwiki, checked <date>: <url>"', () => {
    const result = formatCitation(baseClaim)
    const expectedUrl = `${entityUrl(baseClaim.entitySlug)}#claim-${baseClaim.claimSlug}`
    expect(result).toBe(`${baseClaim.directAnswer} RNAwiki, checked 2026-03-14: ${expectedUrl}`)
  })
})
