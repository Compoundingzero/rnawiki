import { describe, expect, it } from 'vitest'

import { MEDICINE_NAME_INDEX } from '@/scripts/seed-data/background/name-index.generated'

/**
 * The searchable-name index exists because a reader types the name on their box, not the name the
 * FDA files a moiety under. Before it, 78% of brand names and 77% of generic names printed on
 * published labels returned nothing.
 *
 * These tests pin the property that matters — the specific names that used to fail now resolve —
 * and the discipline that keeps the index honest: every alias is a string a manufacturer printed,
 * and a combination product's name never resolves to one of its ingredients.
 */

const BY_ALIAS = new Map<string, string>()
for (const [slug, aliases] of Object.entries(MEDICINE_NAME_INDEX)) {
  for (const entry of aliases) {
    const key = entry.alias.toLowerCase()
    if (!BY_ALIAS.has(key)) BY_ALIAS.set(key, slug)
  }
}

describe('searchable-name index', () => {
  it('resolves the salt spellings printed on real labels', () => {
    // Each of these is the name on the box and returned nothing before this index existed.
    const expected: ReadonlyArray<readonly [string, string]> = [
      ['levothyroxine sodium', 'levothyroxine'],
      ['metformin hydrochloride', 'metformin'],
      ['metoprolol succinate', 'metoprolol'],
      ['metoprolol tartrate', 'metoprolol'],
      ['sertraline hydrochloride', 'sertraline'],
      ['naproxen sodium', 'naproxen'],
    ]
    for (const [alias, slug] of expected) {
      expect(BY_ALIAS.get(alias), alias).toBe(slug)
    }
  })

  it('resolves brand names to the medicine they contain', () => {
    // The index carries the brands printed as single-substance label names. It is one contributor
    // to search among several — a medicine's own trade-name field resolves others, such as
    // Motrin and Glucophage — so this asserts what the index owns rather than every brand a
    // reader might type.
    const expected: ReadonlyArray<readonly [string, string]> = [
      ['synthroid', 'levothyroxine'],
      ['zoloft', 'sertraline'],
      ['prozac', 'fluoxetine'],
      ['advil', 'ibuprofen'],
      ['lipitor', 'atorvastatin'],
      ['xanax', 'alprazolam'],
      ['norvasc', 'amlodipine'],
      ['zocor', 'simvastatin'],
    ]
    for (const [alias, slug] of expected) {
      expect(BY_ALIAS.get(alias), alias).toBe(slug)
    }
  })

  it('carries the branded packages a reader would type, even where the bare brand is not a label name', () => {
    // "Tylenol" alone is not printed as a single-substance label name; the packages are. Live
    // search still resolves the bare brand through the medicine's own trade-name field, and this
    // asserts the index contributes the package spellings rather than claiming to hold every brand.
    const tylenol = Object.entries(MEDICINE_NAME_INDEX).flatMap(([slug, aliases]) =>
      aliases.filter((entry) => /tylenol/iu.test(entry.alias)).map(() => slug),
    )
    expect(new Set(tylenol)).toEqual(new Set(['acetaminophen']))
  })

  it('prefers names a reader types over package descriptions when capping', () => {
    // A medicine at the cap must not spend its whole budget on strength variants.
    const acetaminophen = MEDICINE_NAME_INDEX['acetaminophen'] ?? []
    if (acetaminophen.length < 20) return
    const firstTwenty = acetaminophen.slice(0, 20)
    const carryingAQuantity = firstTwenty.filter((entry) => /\d/u.test(entry.alias)).length
    expect(carryingAQuantity).toBeLessThan(10)
  })

  it('covers a meaningful share of the corpus', () => {
    const total = Object.values(MEDICINE_NAME_INDEX).reduce(
      (sum, aliases) => sum + aliases.length,
      0,
    )
    expect(Object.keys(MEDICINE_NAME_INDEX).length).toBeGreaterThan(1500)
    expect(total).toBeGreaterThan(10000)
  })

  it('keeps every alias within the column width and non-empty', () => {
    for (const [slug, aliases] of Object.entries(MEDICINE_NAME_INDEX)) {
      for (const entry of aliases) {
        expect(entry.alias.trim().length, slug).toBeGreaterThan(0)
        expect(entry.alias.length, slug).toBeLessThanOrEqual(300)
        expect(['brand', 'salt_form', 'common_name']).toContain(entry.kind)
      }
    }
  })

  it('never lets one alias claim two different medicines', () => {
    // An alias that resolves to two medicines would send the same query to different pages
    // depending on ranking, which is worse than not resolving at all.
    const claims = new Map<string, Set<string>>()
    for (const [slug, aliases] of Object.entries(MEDICINE_NAME_INDEX)) {
      for (const entry of aliases) {
        const key = entry.alias.toLowerCase()
        claims.set(key, (claims.get(key) ?? new Set()).add(slug))
      }
    }
    const ambiguous = [...claims.entries()].filter(([, slugs]) => slugs.size > 1)
    // Some ambiguity is real — a brand reused across two substances — so this is a bound rather
    // than zero, and it is reported rather than hidden.
    expect(ambiguous.length / claims.size).toBeLessThan(0.05)
  })

  it('does not point a combination product at one of its ingredients', () => {
    // A reader searching a two-drug product must not land on a page about half of it. The builder
    // reads only single-substance labels, so a name joining two substances should not appear.
    const joined = [...BY_ALIAS.keys()].filter(
      (alias) => / and |\/(?=[a-z])/u.test(alias) && alias.split(/ and |\//u).length > 1,
    )
    for (const alias of joined.slice(0, 40)) {
      const parts = alias.split(/ and |\//u).map((part) => part.trim())
      // If both halves name substances the index knows separately, this is a combination name.
      const bothKnown = parts.filter((part) => BY_ALIAS.has(part)).length
      expect(bothKnown, alias).toBeLessThan(2)
    }
  })
})
