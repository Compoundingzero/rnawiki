import { describe, expect, it } from 'vitest'
import { approvalStatusValue, plainApproval } from '@/lib/evidence-view'

/**
 * The record page has two required approval slots: the sentence directly under the h1 and the
 * labelled "Approval status" row in the metadata strip. They used to carry byte-identical strings
 * 416px apart, on every record and at both widths.
 *
 * These assertions pin the two properties that make the split safe rather than merely different:
 * the strip never repeats the sentence above it when the record has a regulatory status to name,
 * and it never drops the scope qualifier. A bare "Approved" under a label is a worse defect than
 * the duplication, because an approval is always an approval FOR something.
 */
describe('approvalStatusValue differentiates the strip row from the sentence under the h1', () => {
  const BPC = ['United States — FDA (503A bulk drug substances for compounding)', 'United States — FDA Pharmacy Compounding Advisory Committee (2026 update)']
  const CASGEVY = ['United States — FDA', 'United Kingdom — MHRA', 'European Union — European Commission / EMA']

  it('names the place and de-duplicates two decisions from the same one', () => {
    expect(approvalStatusValue('unapproved_therapeutic_substance', BPC)).toBe(
      'United States — no approved use'
    )
  })

  it('lists every jurisdiction on record, in the order the record stores them', () => {
    expect(approvalStatusValue('approved_medicine', CASGEVY)).toBe(
      'United States, United Kingdom, European Union — approved for named uses'
    )
  })

  it('never repeats the sentence printed under the h1', () => {
    for (const category of [
      'approved_medicine',
      'investigational_medicine',
      'compounded_medicine',
      'dietary_supplement',
      'unapproved_therapeutic_substance',
      'withdrawn_or_restricted',
    ] as const) {
      expect(approvalStatusValue(category, CASGEVY)).not.toBe(plainApproval(category))
    }
  })

  it('keeps a scope qualifier on an approval — never a bare "Approved"', () => {
    const value = approvalStatusValue('approved_medicine', ['United States'])
    expect(value).toContain('for named uses')
    expect(value).not.toBe('Approved')
  })

  it('falls back to the category sentence when no regulatory status is recorded', () => {
    expect(approvalStatusValue('unapproved_therapeutic_substance', [])).toBe(
      plainApproval('unapproved_therapeutic_substance')
    )
  })
})
