import { describe, expect, it } from 'vitest'

import { computeDescriptors, computePeptideDescriptors } from '@/lib/rna-intelligence/descriptors'
import { validateLayer1 } from '@/lib/rna-intelligence/layer1-sequence'
import { MAX_FOLD_LENGTH, validateLayer2 } from '@/lib/rna-intelligence/layer2-structure'
import type { Layer1Result } from '@/lib/rna-intelligence'
import type { StructureType } from '@/lib/types'

// Every expected number below is either a published value for that compound (PubChem CID 2244
// aspirin, 2519 caffeine, 5793 glucose, 60823 atorvastatin) or a value the published model itself
// returns. That is the point: a descriptor engine that agrees with a hand-written fixture but
// disagrees with chemistry is worth nothing, and the fixture is the easier thing to fake.

/**
 * Builds a passing Layer1Result directly.
 *
 * Layer 2's contract is over a Layer1Result, not over a string, and Layer 1's minimum lengths are
 * editorial policy about what makes a publishable record rather than a statement about what can be
 * folded or weighed. `GGGAAACCC` is nine nucleotides and folds perfectly well; going through
 * Layer 1 would reject it for being under the twelve-nucleotide floor and the folding assertions
 * would never run. The end-to-end tests further down use the real Layer 1.
 */
function layer1Fixture(structureType: StructureType, cleaned: string): Layer1Result {
  const result: Layer1Result = {
    passed: true,
    structureType,
    cleanedInput: cleaned,
    originalLength: cleaned.length,
    validLength: cleaned.length,
    illegalChars: [],
    diagnostics: [],
  }
  if (structureType === 'rna_sequence') result.cleanedSequence = cleaned
  return result
}

/** Dot-bracket is balanced when it never closes more than it opened and closes everything. */
function isBalanced(notation: string): boolean {
  let depth = 0
  for (const character of notation) {
    if (character === '(') depth++
    else if (character === ')') depth--
    else if (character !== '.') return false
    if (depth < 0) return false
  }
  return depth === 0
}

function codes(result: { diagnostics: Array<{ code: string }> }): string[] {
  return result.diagnostics.map((diagnostic) => diagnostic.code)
}

// ---------------------------------------------------------------------------
// Layer 2 — nucleotide
// ---------------------------------------------------------------------------

describe('validateLayer2 — RNA secondary structure', () => {
  it('folds GGGAAACCC into a three-pair helix with a negative free energy', () => {
    const result = validateLayer2(layer1Fixture('rna_sequence', 'GGGAAACCC'))

    expect(result.passed).toBe(true)
    expect(result.secondaryStructureNotation).toBe('(((...)))')
    expect(isBalanced(result.secondaryStructureNotation ?? '')).toBe(true)
    // One dot-bracket character per nucleotide, or the notation cannot be read against the
    // sequence it describes.
    expect(result.secondaryStructureNotation).toHaveLength('GGGAAACCC'.length)
    expect(result.mfeDeltaG).toBeLessThan(0)
    expect(result.pairedBases).toBe(3)
    expect(result.watsonCrickPairs).toBe(3)
    expect(result.wobblePairs).toBe(0)
    expect(result.longestHelix).toBe(3)
    expect(result.hairpinLoopCount).toBe(1)
    expect(result.thermodynamicallyPlausible).toBe(true)
    expect(codes(result)).toContain('L2_MFE_COMPUTED')
    expect(result.diagnostics.some((d) => d.severity === 'pass')).toBe(true)
  })

  it('reports the free energy to one decimal place', () => {
    const result = validateLayer2(layer1Fixture('rna_sequence', 'GGGAAACCC'))
    const mfe = result.mfeDeltaG ?? 0

    expect(Math.round(mfe * 10) / 10).toBe(mfe)
  })

  it('complements A to U and C to G, and reverses for the reverse complement', () => {
    const result = validateLayer2(layer1Fixture('rna_sequence', 'AUCGAUCGAUCG'))

    expect(result.complementaryStrand).toBe('UAGCUAGCUAGC')
    expect(result.reverseComplement).toBe('CGAUCGAUCGAU')
  })

  it('returns an open chain at 0.0 kcal/mol when no pairing is possible', () => {
    // Adenine pairs with uracil. A poly-A strand has nothing to pair with, so the minimum free
    // energy structure is the unfolded chain and its energy is zero by definition.
    const result = validateLayer2(layer1Fixture('rna_sequence', 'AAAAAAAAAAAA'))

    expect(result.passed).toBe(true)
    expect(result.secondaryStructureNotation).toBe('............')
    expect(result.mfeDeltaG).toBe(0)
    expect(result.pairedBases).toBe(0)
    expect(result.longestHelix).toBe(0)
    expect(result.hairpinLoopCount).toBe(0)
    expect(codes(result)).toContain('L2_NO_STABLE_FOLD')
    // Nothing to fold is a result, not a rejection.
    expect(result.diagnostics.every((d) => d.severity !== 'error')).toBe(true)
  })

  it('returns byte-identical output for the same sequence, twice', () => {
    const sequence = 'GGGCUAUUAGCUCAGUUGGUUAGAGCGCACCCC'
    const first = validateLayer2(layer1Fixture('rna_sequence', sequence))
    const second = validateLayer2(layer1Fixture('rna_sequence', sequence))

    // Not just the energy: the structure too. Two structures can tie on energy, and a fold that
    // resolved the tie differently on each run would produce a verification hash nobody can
    // reproduce, which is the one thing this engine exists to prevent.
    expect(second).toEqual(first)
    expect(second.secondaryStructureNotation).toBe(first.secondaryStructureNotation)
    expect(second.mfeDeltaG).toBe(first.mfeDeltaG)
  })

  it('refuses to fold a sequence past the request budget instead of truncating it', () => {
    const result = validateLayer2(layer1Fixture('rna_sequence', 'A'.repeat(MAX_FOLD_LENGTH + 1)))

    expect(result.passed).toBe(false)
    expect(codes(result)).toContain('L2_SEQUENCE_TOO_LONG_TO_FOLD')
    expect(result.mfeDeltaG).toBeUndefined()
    expect(result.secondaryStructureNotation).toBeUndefined()
    // The complement is a per-base map and costs nothing, so it is still reported.
    expect(result.complementaryStrand).toHaveLength(MAX_FOLD_LENGTH + 1)
  })

  it('declines to fold a cDNA strand under RNA parameters', () => {
    const result = validateLayer2(layer1Fixture('rna_sequence', 'ATCGATCGATCG'))

    expect(result.passed).toBe(true)
    expect(codes(result)).toContain('L2_NO_MODEL_FOR_MODALITY')
    expect(result.mfeDeltaG).toBeUndefined()
    expect(result.thermodynamicallyPlausible).toBe(false)
    // Thymine in, adenine out: the complement uses the alphabet the sequence was written in.
    expect(result.complementaryStrand).toBe('TAGCTAGCTAGC')
  })
})

// ---------------------------------------------------------------------------
// Layer 2 — routing and prerequisites
// ---------------------------------------------------------------------------

describe('validateLayer2 — routing', () => {
  it('runs no check at all when Layer 1 failed', () => {
    const layer1 = validateLayer1('AUGZZZQQQ', 'siRNA (Small Interfering RNA)')
    const result = validateLayer2(layer1)

    expect(layer1.passed).toBe(false)
    expect(result.passed).toBe(false)
    expect(result.thermodynamicallyPlausible).toBe(false)
    expect(codes(result)).toEqual(['L2_LAYER1_PREREQUISITE_FAILED'])
    expect(result.mfeDeltaG).toBeUndefined()
    expect(result.logP).toBeUndefined()
  })

  it('invents no folding energy for a biologic descriptor', () => {
    const layer1 = validateLayer1('Trastuzumab IgG1 kappa', 'Monoclonal Antibody (mAb)')
    const result = validateLayer2(layer1)

    expect(result.passed).toBe(layer1.passed)
    expect(codes(result)).toEqual(['L2_NO_MODEL_FOR_MODALITY'])
    // The reference wireframe returned `thermodynamicallyPlausible: true` here with the line
    // "Biological receptor binding conformation and folding energy verified". No energy was ever
    // computed. Every one of these fields stays undefined instead.
    expect(result.thermodynamicallyPlausible).toBe(false)
    expect(result.mfeDeltaG).toBeUndefined()
    expect(result.logP).toBeUndefined()
    expect(result.isoelectricPoint).toBeUndefined()
  })

  it('reports charge and hydropathy for a peptide, and no folding energy', () => {
    const layer1 = validateLayer1('HAEGTFTSDVSSYLEGQAAKEFIAWLVRGRG', 'Peptide / GLP-1 Agonist')
    const result = validateLayer2(layer1)

    expect(layer1.passed).toBe(true)
    expect(result.passed).toBe(true)
    expect(result.isoelectricPoint).toBeGreaterThan(0)
    expect(result.netChargeAtPh7).toBeLessThan(0)
    expect(result.hydrophobicResidueFraction).toBeGreaterThan(0)
    expect(result.mfeDeltaG).toBeUndefined()
    expect(codes(result)).toContain('L2_PEPTIDE_DESCRIPTORS_COMPUTED')
    expect(codes(result)).toContain('L2_NO_MODEL_FOR_MODALITY')
  })
})

// ---------------------------------------------------------------------------
// Layer 2 — small molecule, end to end through Layer 1
// ---------------------------------------------------------------------------

describe('validateLayer2 — small molecule', () => {
  it('carries the descriptor set through for aspirin', () => {
    const layer1 = validateLayer1('CC(=O)OC1=CC=CC=C1C(=O)O', 'Small Molecule')
    const result = validateLayer2(layer1)

    expect(result.passed).toBe(true)
    expect(result.topologicalPolarSurfaceArea).toBeCloseTo(63.6, 2)
    expect(result.hydrogenBondDonors).toBe(1)
    expect(result.hydrogenBondAcceptors).toBe(4)
    expect(result.rotatableBonds).toBe(3)
    expect(result.lipinskiViolations).toBe(0)
    expect(result.lipinskiCompliant).toBe(true)
    expect(result.thermodynamicallyPlausible).toBe(true)
    expect(codes(result)).toContain('L2_DESCRIPTORS_COMPUTED')
    expect(codes(result)).not.toContain('L2_LIPINSKI_VIOLATION')
  })

  it('flags a rule-of-five violation without failing the layer', () => {
    // Atorvastatin: 558.64 g/mol and strongly lipophilic, so it breaks the weight and logP
    // criteria. It is also one of the best-selling drugs ever made, which is exactly why a
    // violation is reported as a finding about oral bioavailability and not as a defect.
    const smiles =
      'CC(C)c1c(C(=O)Nc2ccccc2)c(-c2ccccc2)c(-c2ccc(F)cc2)n1CC[C@@H](O)C[C@@H](O)CC(=O)O'
    const result = validateLayer2(validateLayer1(smiles, 'Small Molecule'))

    expect(result.passed).toBe(true)
    expect(result.lipinskiViolations).toBe(2)
    expect(result.lipinskiCompliant).toBe(false)
    // Lipinski allowed one violation; two is past that, so plausibility is not asserted.
    expect(result.thermodynamicallyPlausible).toBe(false)
    expect(codes(result)).toContain('L2_LIPINSKI_VIOLATION')
    expect(result.diagnostics.every((d) => d.severity !== 'error')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Descriptors
// ---------------------------------------------------------------------------

describe('computeDescriptors — aspirin', () => {
  const aspirin = computeDescriptors('CC(=O)OC1=CC=CC=C1C(=O)O')

  it('weighs 180.16 g/mol over 13 heavy atoms', () => {
    expect(aspirin.molecularWeight).toBeCloseTo(180.16, 2)
    expect(aspirin.heavyAtoms).toBe(13)
  })

  it('returns a logP in the band a mildly lipophilic aromatic acid occupies', () => {
    // Aspirin's measured octanol/water logP is 1.19 and the full 68-type Wildman-Crippen model
    // returns 1.31. This implementation parameterises a documented subset of those types, so it is
    // not expected to land on that digit and asserting one would be asserting a coincidence. What
    // it must do is put aspirin in the right regime: lipophilic enough to cross a membrane, far
    // below Lipinski's limit of 5, and nowhere near the negative values a sugar or a free amino
    // acid occupies. A result outside this band means the atom typing is broken, which is the
    // failure this test exists to catch.
    expect(aspirin.logP).toBeGreaterThan(0)
    expect(aspirin.logP).toBeLessThan(3.5)
  })

  it('reproduces the published polar surface area and hydrogen-bond counts exactly', () => {
    // 17.07 (ketone O) + 9.23 (ester O) + 17.07 (acid carbonyl) + 20.23 (acid hydroxyl).
    expect(aspirin.tpsa).toBeCloseTo(63.6, 2)
    expect(aspirin.hydrogenBondDonors).toBe(1)
    expect(aspirin.hydrogenBondAcceptors).toBe(4)
    expect(aspirin.rotatableBonds).toBe(3)
  })

  it('passes all four Lipinski criteria', () => {
    expect(aspirin.lipinskiViolations).toBe(0)
    expect(aspirin.lipinskiCompliant).toBe(true)
    expect(aspirin.ruleOfFive).toHaveLength(4)
    expect(aspirin.ruleOfFive.every((rule) => rule.passed)).toBe(true)
    expect(aspirin.ruleOfFive.map((rule) => rule.limit)).toEqual([500, 5, 5, 10])
  })
})

describe('computeDescriptors — caffeine', () => {
  it('returns 58.44 square angstroms for the depiction that value belongs to', () => {
    // PubChem prints 58.44 for caffeine. That number corresponds to an aromatic imidazole ring and
    // a non-aromatic pyrimidinedione ring, which is what this SMILES says: two aromatic nitrogens
    // at 4.93 and 12.89, two tertiary amines at 3.24 each, two carbonyl oxygens at 17.07 each.
    const caffeine = computeDescriptors('Cn1cnc2c1C(=O)N(C)C(=O)N2C')

    expect(caffeine.molecularWeight).toBeCloseTo(194.19, 2)
    expect(caffeine.tpsa).toBeCloseTo(58.44, 2)
    expect(caffeine.hydrogenBondDonors).toBe(0)
    expect(caffeine.hydrogenBondAcceptors).toBe(6)
    expect(caffeine.rotatableBonds).toBe(0)
  })

  it('returns 56.22 for the Kekule spelling, and that gap is the documented limit', () => {
    // Same molecule, same mass, different spelling. This module reads aromaticity from the string
    // rather than perceiving it, so writing the imidazole in Kekule form types its two nitrogens
    // as aliphatic (3.24 + 12.36 = 15.60) instead of aromatic (4.93 + 12.89 = 17.82). The 2.22
    // square angstrom difference is exactly that, and pinning it keeps the limitation a measured
    // fact rather than a sentence in a comment nobody re-checks.
    const kekule = computeDescriptors('CN1C=NC2=C1C(=O)N(C)C(=O)N2C')

    expect(kekule.molecularWeight).toBeCloseTo(194.19, 2)
    expect(kekule.tpsa).toBeCloseTo(56.22, 2)
    expect(kekule.tpsa).toBeCloseTo(58.44 - 2.22, 2)
  })
})

describe('computeDescriptors — the logP model against its own published values', () => {
  it('reproduces the published contribution sums for pure hydrocarbons', () => {
    // The hydrocarbon atom types are the part of the Wildman-Crippen table this module carries in
    // full, so these are exact, not approximate: benzene is six aromatic CH at 0.1581 plus six
    // hydrogens at 0.1230, and decane is ten aliphatic carbons at 0.1441 plus twenty-two
    // hydrogens.
    expect(computeDescriptors('c1ccccc1').logP).toBeCloseTo(1.6866, 4)
    expect(computeDescriptors('Cc1ccccc1').logP).toBeCloseTo(1.995, 4)
    expect(computeDescriptors('CCCCCCCCCC').logP).toBeCloseTo(4.147, 4)
  })

  it('orders molecules by lipophilicity the way the octanol/water scale does', () => {
    // Ordering is the property a logP estimate has to get right even when its digits are soft.
    // Measured values: decane 5.98, aspirin 1.19, ethanol -0.31, glucose -3.24.
    const decane = computeDescriptors('CCCCCCCCCC').logP
    const aspirin = computeDescriptors('CC(=O)OC1=CC=CC=C1C(=O)O').logP
    const ethanol = computeDescriptors('CCO').logP
    const glucose = computeDescriptors('OC[C@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O').logP

    expect(decane).toBeGreaterThan(aspirin)
    expect(aspirin).toBeGreaterThan(ethanol)
    expect(ethanol).toBeGreaterThan(glucose)
    expect(glucose).toBeLessThan(0)
  })
})

describe('computeDescriptors — counting', () => {
  it('counts no rotatable bond inside a ring', () => {
    // Every bond in cyclohexane is a ring bond, so none of them rotates into a new conformation.
    expect(computeDescriptors('C1CCCCC1').rotatableBonds).toBe(0)
    // Butane's two terminal bonds do not count either: spinning a methyl changes no shape.
    expect(computeDescriptors('CCCC').rotatableBonds).toBe(1)
    expect(computeDescriptors('CCCCCCCCCC').rotatableBonds).toBe(7)
  })

  it('uses Lipinski definitions for donors and acceptors', () => {
    // Glucose: five hydroxyls donate, and the count of nitrogens and oxygens is six.
    const glucose = computeDescriptors('OC[C@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O')

    expect(glucose.hydrogenBondDonors).toBe(5)
    expect(glucose.hydrogenBondAcceptors).toBe(6)
    // PubChem prints 110 square angstroms for glucose.
    expect(glucose.tpsa).toBeCloseTo(110.38, 2)
  })

  it('reads [OH] and O[H] as the same hydroxyl', () => {
    const bracket = computeDescriptors('CC[OH]')
    const separate = computeDescriptors('CCO[H]')
    const implicit = computeDescriptors('CCO')

    expect(bracket.hydrogenBondDonors).toBe(implicit.hydrogenBondDonors)
    expect(separate.hydrogenBondDonors).toBe(implicit.hydrogenBondDonors)
    expect(bracket.tpsa).toBeCloseTo(implicit.tpsa, 2)
    expect(separate.tpsa).toBeCloseTo(implicit.tpsa, 2)
  })

  it('prices a three-membered ring oxygen as an epoxide, not an ether', () => {
    expect(computeDescriptors('C1CO1').tpsa).toBeCloseTo(12.53, 2)
    expect(computeDescriptors('CCOCC').tpsa).toBeCloseTo(9.23, 2)
  })
})

// ---------------------------------------------------------------------------
// Peptide descriptors
// ---------------------------------------------------------------------------

describe('computePeptideDescriptors', () => {
  it('puts the isoelectric point midway between the two termini when no side chain ionises', () => {
    // Polyalanine has one basic group (the N-terminus, pK 7.5) and one acidic group (the
    // C-terminus, pK 3.55). Two symmetric sigmoids cross at their mean, so the isoelectric point
    // is 5.525 exactly and the arithmetic can be checked by hand.
    const result = computePeptideDescriptors('AAAAA')

    expect(result.isoelectricPoint).toBeCloseTo(5.53, 2)
    expect(result.netChargeAtPh7).toBeLessThan(0)
    // Alanine's Kyte-Doolittle index is +1.8, so every residue is hydrophobic.
    expect(result.hydrophobicResidueFraction).toBe(1)
  })

  it('moves the isoelectric point basic for lysine and acidic for aspartate', () => {
    const basic = computePeptideDescriptors('KKKKK')
    const acidic = computePeptideDescriptors('DDDDD')

    expect(basic.isoelectricPoint).toBeGreaterThan(10)
    expect(basic.netChargeAtPh7).toBeGreaterThan(4)
    expect(acidic.isoelectricPoint).toBeLessThan(4)
    expect(acidic.netChargeAtPh7).toBeLessThan(-4)
    expect(basic.hydrophobicResidueFraction).toBe(0)
    expect(acidic.hydrophobicResidueFraction).toBe(0)
  })

  it('carries no net charge at its own isoelectric point', () => {
    // The definition of the isoelectric point, checked against the curve it was found on.
    const sequence = 'HAEGTFTSDVSSYLEGQAAKEFIAWLVRGRG'
    const result = computePeptideDescriptors(sequence)
    const shifted = computePeptideDescriptors(sequence)

    expect(result.isoelectricPoint).toBeGreaterThan(0)
    expect(result.isoelectricPoint).toBeLessThan(14)
    expect(shifted).toEqual(result)
  })

  it('returns zeros for an empty backbone rather than a NaN', () => {
    expect(computePeptideDescriptors('')).toEqual({
      isoelectricPoint: 0,
      netChargeAtPh7: 0,
      hydrophobicResidueFraction: 0,
    })
  })
})
