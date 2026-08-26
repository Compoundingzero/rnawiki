import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8').replace(/\s+/g, ' ')
}

describe('single-account workflow documentation', () => {
  it('keeps the project overview aligned with attributed notes and edit proposals', () => {
    const readme = source('README.md')
    for (const phrase of [
      'One account, attributed work',
      'one signup and sign-in path',
      'derives the author from the authenticated account',
      'Trust standing and scientific-review qualifications are additional permissions on the same account',
      'attributes it to the signed-in account',
    ]) {
      expect(readme).toContain(phrase)
    }
    expect(readme.toLowerCase()).not.toContain('physician badge')
  })

  it('records the attribution and RNA Intelligence boundaries in technical documentation', () => {
    const intelligence = source('docs/rna-intelligence-v2.md')
    const proposals = source('docs/contribution-proposals.md')
    const dossier = source('docs/dossier-v2-product-spec.md')
    const api = source('docs/api-contract.md')

    for (const phrase of [
      'Community notes do not enter any RNA Intelligence check',
      'RNAWiki has one account type',
      'Every note, identity correction and programme proposal takes its author from the authenticated server session',
      'Draft proposals are private to their author and become immutable when submitted',
    ]) {
      expect(intelligence).toContain(phrase)
    }
    expect(proposals).toContain('no separate contributor or professional account type')
    expect(proposals).toContain('cannot be replaced through the draft payload')
    expect(dossier).toContain('attributes a note to the signed-in account')
    expect(api).toContain('RNAWiki has one account type')
    expect(api).toContain('a request body cannot choose another author')
  })

  it('does not document removed physician account endpoints or badges', () => {
    const api = source('docs/api-contract.md')
    for (const removed of [
      '/api/auth/doctor-verification',
      '/api/physician-verifications',
      'physician badge',
      'verified physician',
    ]) {
      expect(api.toLowerCase()).not.toContain(removed.toLowerCase())
    }
  })
})
