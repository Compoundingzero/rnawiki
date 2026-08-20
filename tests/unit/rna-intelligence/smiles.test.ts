import { describe, expect, it } from 'vitest'
import { hillFormula, parseSmiles, STANDARD_ATOMIC_WEIGHTS } from '@/lib/rna-intelligence/smiles'

// Every expected formula and mass below is the published value for that compound (PubChem CID
// 2244 aspirin, 2519 caffeine, 4091 metformin, and so on). They are the point of the test: a
// parser that agrees with a hand-written fixture but disagrees with chemistry is worthless.

describe('hillFormula', () => {
  it('puts carbon first, hydrogen second, the rest alphabetical', () => {
    expect(hillFormula({ O: 2, C: 2, N: 1, H: 5 })).toBe('C2H5NO2')
  })

  it('drops the count for a single atom', () => {
    expect(hillFormula({ C: 1, H: 4 })).toBe('CH4')
  })

  it('sorts everything alphabetically when there is no carbon', () => {
    expect(hillFormula({ O: 1, H: 2 })).toBe('H2O')
    expect(hillFormula({ Na: 1, Cl: 1 })).toBe('ClNa')
  })

  it('ignores elements present with a zero count', () => {
    expect(hillFormula({ C: 1, H: 4, N: 0 })).toBe('CH4')
  })
})

describe('parseSmiles — known drugs', () => {
  it('parses aspirin to C9H8O4 at 180.16 g/mol', () => {
    const result = parseSmiles('CC(=O)OC1=CC=CC=C1C(=O)O')

    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.molecularFormula).toBe('C9H8O4')
    expect(result.molecularWeight).toBeCloseTo(180.16, 2)
    expect(result.heavyAtomCount).toBe(13)
    expect(result.atomCounts).toEqual({ C: 9, O: 4, H: 8 })
    expect(result.implicitHydrogens).toBe(8)
    expect(result.explicitHydrogens).toBe(0)
    expect(result.ringClosures).toBe(1)
    expect(result.unmatchedRingBonds).toEqual([])
    expect(result.bondCounts).toEqual({ single: 8, double: 5, triple: 0, aromatic: 0 })
  })

  it('gives the aromatic spelling of aspirin the same formula and mass', () => {
    const kekule = parseSmiles('CC(=O)OC1=CC=CC=C1C(=O)O')
    const aromatic = parseSmiles('CC(=O)Oc1ccccc1C(=O)O')

    expect(aromatic.valid).toBe(true)
    expect(aromatic.molecularFormula).toBe(kekule.molecularFormula)
    expect(aromatic.molecularWeight).toBeCloseTo(kekule.molecularWeight, 6)
    expect(aromatic.aromaticAtoms).toBe(6)
    expect(aromatic.bondCounts.aromatic).toBe(6)
  })

  it('parses caffeine to C8H10N4O2 at 194.19 g/mol', () => {
    const result = parseSmiles('CN1C=NC2=C1C(=O)N(C)C(=O)N2C')

    expect(result.valid).toBe(true)
    expect(result.molecularFormula).toBe('C8H10N4O2')
    expect(result.molecularWeight).toBeCloseTo(194.19, 2)
    expect(result.heavyAtomCount).toBe(14)
    expect(result.ringClosures).toBe(2)
    expect(result.bondCounts).toEqual({ single: 11, double: 4, triple: 0, aromatic: 0 })
  })

  it('parses metformin to C4H11N5 at 129.16 g/mol', () => {
    const result = parseSmiles('CN(C)C(=N)NC(=N)N')

    expect(result.valid).toBe(true)
    expect(result.molecularFormula).toBe('C4H11N5')
    expect(result.molecularWeight).toBeCloseTo(129.16, 2)
    expect(result.heavyAtomCount).toBe(9)
    expect(result.ringClosures).toBe(0)
    expect(result.atomCounts).toEqual({ C: 4, N: 5, H: 11 })
  })

  it('parses nicotinamide riboside phosphate, charges and all', () => {
    // From the reference wireframe's own dataset: a zwitterion with a bracket cation and anion.
    const result = parseSmiles('C1=CC(=C[N+](=C1)C2C(C(C(O2)COP(=O)([O-])O)O)O)C(=O)N')

    expect(result.valid).toBe(true)
    expect(result.molecularFormula).toBe('C11H15N2O8P')
    expect(result.molecularWeight).toBeCloseTo(334.22, 2)
    expect(result.ringClosures).toBe(2)
  })
})

describe('parseSmiles — the organic subset and its traps', () => {
  it('reads two-letter halogens before their one-letter prefixes', () => {
    const result = parseSmiles('ClCCBr')

    expect(result.valid).toBe(true)
    expect(result.atomCounts).toEqual({ C: 2, Br: 1, Cl: 1, H: 4 })
    expect(result.molecularFormula).toBe('C2H4BrCl')
    expect(result.molecularWeight).toBeCloseTo(143.41, 2)
  })

  it('does not mistake boron for the B of Br', () => {
    const result = parseSmiles('BBr')

    expect(result.valid).toBe(true)
    expect(result.atomCounts['B']).toBe(1)
    expect(result.atomCounts['Br']).toBe(1)
    // Boron's normal valence is 3, so one bond to bromine leaves room for two hydrogens.
    expect(result.implicitHydrogens).toBe(2)
  })

  it('gives benzene one hydrogen per aromatic carbon', () => {
    const result = parseSmiles('c1ccccc1')

    expect(result.valid).toBe(true)
    expect(result.molecularFormula).toBe('C6H6')
    expect(result.aromaticAtoms).toBe(6)
    expect(result.bondCounts.aromatic).toBe(6)
    expect(result.molecularWeight).toBeCloseTo(78.11, 2)
  })

  it('gives pyridine nitrogen no hydrogen', () => {
    const result = parseSmiles('c1ccncc1')

    expect(result.valid).toBe(true)
    expect(result.molecularFormula).toBe('C5H5N')
    expect(result.molecularWeight).toBeCloseTo(79.1, 2)
  })

  it('reads [nH] as an aromatic nitrogen carrying exactly one hydrogen', () => {
    const result = parseSmiles('c1cc[nH]c1')

    expect(result.valid).toBe(true)
    expect(result.molecularFormula).toBe('C4H5N')
    expect(result.explicitHydrogens).toBe(1)
    expect(result.implicitHydrogens).toBe(4)
    expect(result.aromaticAtoms).toBe(5)
  })

  it('leaves furan oxygen with no hydrogen rather than a negative count', () => {
    const result = parseSmiles('c1ccoc1')

    expect(result.valid).toBe(true)
    expect(result.molecularFormula).toBe('C4H4O')
  })

  it('counts triple bonds', () => {
    const result = parseSmiles('CC#N')

    expect(result.valid).toBe(true)
    expect(result.molecularFormula).toBe('C2H3N')
    expect(result.bondCounts.triple).toBe(1)
  })

  it('never gives a bracket atom implicit hydrogens', () => {
    const explicit = parseSmiles('[CH4]')
    expect(explicit.valid).toBe(true)
    expect(explicit.explicitHydrogens).toBe(4)
    expect(explicit.implicitHydrogens).toBe(0)
    expect(explicit.molecularFormula).toBe('CH4')

    const bare = parseSmiles('[C]')
    expect(bare.valid).toBe(true)
    expect(bare.explicitHydrogens).toBe(0)
    expect(bare.implicitHydrogens).toBe(0)
    expect(bare.molecularFormula).toBe('C')
  })

  it('reads [Na+] as sodium, not as nitrogen with a stray a', () => {
    const result = parseSmiles('[Na+].[Cl-]')

    expect(result.valid).toBe(true)
    expect(result.atomCounts).toEqual({ Na: 1, Cl: 1 })
    expect(result.molecularFormula).toBe('ClNa')
    expect(result.molecularWeight).toBeCloseTo(58.44, 2)
    // The dot separates components: no bond is formed across it.
    expect(result.bondCounts).toEqual({ single: 0, double: 0, triple: 0, aromatic: 0 })
  })

  it('parses chirality and isotope tags without disturbing the formula', () => {
    const plain = parseSmiles('CC(N)C(=O)O')
    const chiral = parseSmiles('C[C@@H](N)C(=O)O')

    expect(chiral.valid).toBe(true)
    expect(chiral.molecularFormula).toBe('C3H7NO2')
    expect(chiral.molecularFormula).toBe(plain.molecularFormula)
    expect(chiral.explicitHydrogens).toBe(1)
  })

  it('uses the real nuclide mass for a labelled atom', () => {
    const natural = parseSmiles('CO')
    const labelled = parseSmiles('[13CH3]O')
    const carbon = STANDARD_ATOMIC_WEIGHTS['C']

    expect(natural.molecularFormula).toBe('CH4O')
    expect(labelled.valid).toBe(true)
    expect(labelled.molecularFormula).toBe('CH4O')
    expect(carbon).toBeDefined()
    // 13C is 13.003355 against natural carbon's 12.0107: the labelled methanol is 0.99 Da heavier
    // for the same formula, which is exactly why the standard weight must not be substituted.
    expect(labelled.molecularWeight - natural.molecularWeight).toBeCloseTo(
      13.003355 - (carbon ?? 0),
      3,
    )
  })

  it('closes two-digit ring bonds written with %', () => {
    const plain = parseSmiles('C1CCCCC1')
    const twoDigit = parseSmiles('C%10CCCCC%10')

    expect(twoDigit.valid).toBe(true)
    expect(twoDigit.molecularFormula).toBe('C6H12')
    expect(twoDigit.molecularFormula).toBe(plain.molecularFormula)
    expect(twoDigit.ringClosures).toBe(1)
  })

  it('ignores whitespace inside a pasted string', () => {
    const clean = parseSmiles('CC(=O)OC1=CC=CC=C1C(=O)O')
    const pasted = parseSmiles('  CC(=O)OC1=CC=CC=C1\n  C(=O)O  ')

    expect(pasted.valid).toBe(true)
    expect(pasted.molecularFormula).toBe(clean.molecularFormula)
  })
})

describe('parseSmiles — failure is reported, not smoothed over', () => {
  it('rejects an unbalanced opening parenthesis', () => {
    const result = parseSmiles('CC(=O')

    expect(result.valid).toBe(false)
    expect(result.unbalancedParens).toBe(true)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('rejects an unmatched closing parenthesis', () => {
    const result = parseSmiles('CC)O')

    expect(result.valid).toBe(false)
    expect(result.unbalancedParens).toBe(true)
  })

  it('rejects an unclosed bracket atom', () => {
    const result = parseSmiles('C[NH2')

    expect(result.valid).toBe(false)
    expect(result.unbalancedBrackets).toBe(true)
  })

  it('names the ring-bond digits that never close', () => {
    const result = parseSmiles('C1CCCCC2')

    expect(result.valid).toBe(false)
    expect(result.unmatchedRingBonds).toEqual([1, 2])
    expect(result.ringClosures).toBe(0)
  })

  it('rejects a character that is not SMILES at all', () => {
    const result = parseSmiles('CC?O')

    expect(result.valid).toBe(false)
    expect(result.errors.some((message) => message.includes("'?'"))).toBe(true)
  })

  it('rejects an empty string without pretending it weighs nothing', () => {
    const result = parseSmiles('   ')

    expect(result.valid).toBe(false)
    expect(result.heavyAtomCount).toBe(0)
    expect(result.molecularFormula).toBe('')
  })

  it('refuses to weigh a wildcard atom', () => {
    const result = parseSmiles('C*C')

    expect(result.valid).toBe(false)
    expect(result.errors.some((message) => message.includes('Wildcard'))).toBe(true)
  })
})

describe('parseSmiles — determinism and self-consistency', () => {
  it('returns byte-identical results for repeated calls', () => {
    const smiles = 'C1=CC(=C[N+](=C1)C2C(C(C(O2)COP(=O)([O-])O)O)O)C(=O)N'
    const first = parseSmiles(smiles)
    const second = parseSmiles(smiles)

    expect(first.valid).toBe(true)
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
  })

  it('catches the unclosed ring bond in the wireframe dataset macrolide', () => {
    // The reference wireframe carries this string as rapamycin and labels it C51H79NO13. It is
    // neither: ring-bond digit 1 is opened at the second carbon and never closed, and there is no
    // nitrogen anywhere in it. This test exists to pin that finding — it is exactly the class of
    // unchecked structural claim the audit layer is for.
    const result = parseSmiles(
      'CC1CCC2CC(=O)C(=C)C(C(C(=CC(=O)OC(CC(=O)C(C(C(C(C(C(=O)C(C(C(=O)O2)O)C)O)C)OC)C)O)C)C)C)OC',
    )

    expect(result.valid).toBe(false)
    expect(result.unmatchedRingBonds).toEqual([1])
    expect(result.atomCounts['N']).toBeUndefined()
  })

  it('keeps its own counts internally consistent on a deeply nested string', () => {
    const result = parseSmiles(
      'CC1CCC2CC(=O)C(=C)C(C(C(=CC(=O)OC(CC(=O)C(C(C(C(C(C(=O)C(C(C(=O)O2)O)C)O)C)OC)C)O)C)C)C1)OC',
    )

    expect(result.valid).toBe(true)
    expect(result.ringClosures).toBe(2)
    expect(result.unmatchedRingBonds).toEqual([])
    const heavyFromCounts = Object.entries(result.atomCounts)
      .filter(([element]) => element !== 'H')
      .reduce((total, [, count]) => total + count, 0)
    expect(heavyFromCounts).toBe(result.heavyAtomCount)
    expect(result.atomCounts['H']).toBe(result.implicitHydrogens + result.explicitHydrogens)
  })
})
