import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import {
  JURISDICTION_LABELS,
  JURISDICTION_ORDER,
  JURISDICTION_SOURCE_STRINGS,
  resolveJurisdiction,
} from '@/lib/corpus/jurisdictions'

/**
 * `docs/specs/phase4-generators.md` §2 fixes the map "once, in lib/corpus/jurisdictions.ts". The
 * corpus-scale builder (`scripts/revamp/build_blocks.py`) has to hold the same table to map
 * 28,832 pages outside a Node process, and it writes what it used to
 * `data/revamp/blocks/jurisdiction-map.json`. This test is the join between the two: the moment
 * either side gains a string the other does not have, one page and one hub can disagree about
 * what "GB" means, and this fails instead.
 */
const builderMap = JSON.parse(readFileSync('data/revamp/blocks/jurisdiction-map.json', 'utf8')) as {
  order: string[]
  labels: Record<string, string>
  sourceStrings: Record<string, string>
}

describe('the jurisdiction map (phase4-generators §2)', () => {
  it('renders the page order the spec fixes', () => {
    expect([...JURISDICTION_ORDER]).toEqual(['SG', 'US', 'AU', 'UK', 'EU', 'JP', 'CA'])
  })

  it('labels every jurisdiction in ordinary language, never as a code', () => {
    for (const code of JURISDICTION_ORDER) {
      expect(JURISDICTION_LABELS[code]).toBeTruthy()
      expect(JURISDICTION_LABELS[code]).not.toBe(code)
    }
  })

  it('maps the source strings the spec table names', () => {
    expect(resolveJurisdiction('Drugs@FDA')).toBe('US')
    expect(resolveJurisdiction('Orange Book')).toBe('US')
    expect(resolveJurisdiction('GB')).toBe('UK')
    expect(resolveJurisdiction('Great Britain')).toBe('UK')
    expect(resolveJurisdiction('European Medicines Agency')).toBe('EU')
    expect(resolveJurisdiction('Japan (PMDA)')).toBe('JP')
    expect(resolveJurisdiction('Health Canada')).toBe('CA')
    expect(resolveJurisdiction('SUSMP')).toBe('AU')
    expect(resolveJurisdiction('Poisons Standard')).toBe('AU')
  })

  it('is case- and whitespace-insensitive', () => {
    expect(resolveJurisdiction('  united   states ')).toBe('US')
  })

  it('returns null for a string it does not carry, rather than guessing', () => {
    expect(resolveJurisdiction('France')).toBeNull()
    expect(resolveJurisdiction('unspecified')).toBeNull()
    expect(resolveJurisdiction('')).toBeNull()
    expect(resolveJurisdiction(undefined)).toBeNull()
  })

  it('holds exactly the table the corpus-scale builder used', () => {
    expect(builderMap.order).toEqual([...JURISDICTION_ORDER])
    expect(builderMap.labels).toEqual(JURISDICTION_LABELS)
    expect(builderMap.sourceStrings).toEqual(JURISDICTION_SOURCE_STRINGS)
  })
})
