import { describe, expect, it } from 'vitest'
import type { Diagnostic } from '@/lib/rna-intelligence/types'
import {
  findOpenReadingFrame,
  nucleicAcidAtomCounts,
  nucleicAcidAverageMass,
  peptideAverageMass,
  STANDARD_GENETIC_CODE,
  STOP_CODONS,
  translate,
  translateCodon,
} from '@/lib/rna-intelligence/genetic-code'
import { validateLayer1 } from '@/lib/rna-intelligence/layer1-sequence'
import { STANDARD_ATOMIC_WEIGHTS } from '@/lib/rna-intelligence/smiles'

/** The 19-mer the reference wireframe carries for its siRNA record. */
const SIRNA = 'AUGUCAUUGGAUCACUGCU'

/** Semaglutide as the reference writes it, conjugate and all. */
const SEMAGLUTIDE = 'HAEGTFTSDVSSYLEGQAAK(AEEAc-AEEAc-γ-Glu-17-carboxyheptadecanoyl)EFIAWLVRGRG'

const ASPIRIN = 'CC(=O)OC1=CC=CC=C1C(=O)O'

function codes(diagnostics: Diagnostic[]): string[] {
  return diagnostics.map((d) => d.code)
}

describe('standard genetic code', () => {
  it('has all 64 codons', () => {
    expect(Object.keys(STANDARD_GENETIC_CODE)).toHaveLength(64)
  })

  it('maps every codon over the RNA alphabet and nothing else', () => {
    for (const first of ['U', 'C', 'A', 'G']) {
      for (const second of ['U', 'C', 'A', 'G']) {
        for (const third of ['U', 'C', 'A', 'G']) {
          expect(translateCodon(`${first}${second}${third}`)).toBeDefined()
        }
      }
    }
    expect(translateCodon('AUX')).toBeUndefined()
    expect(translateCodon('ATG')).toBeUndefined()
  })

  it('marks exactly the three stop codons', () => {
    const stops = Object.keys(STANDARD_GENETIC_CODE).filter(
      (codon) => STANDARD_GENETIC_CODE[codon] === '*',
    )
    expect(stops.sort()).toEqual(['UAA', 'UAG', 'UGA'])
    expect([...STOP_CODONS].sort()).toEqual(['UAA', 'UAG', 'UGA'])
  })

  it('gets the textbook codons right', () => {
    expect(translateCodon('AUG')).toBe('M')
    expect(translateCodon('UGG')).toBe('W')
    expect(translateCodon('UUU')).toBe('F')
    expect(translateCodon('GGG')).toBe('G')
    // The six-fold degenerate families: leucine, serine, arginine.
    expect(['UUA', 'UUG', 'CUU', 'CUC', 'CUA', 'CUG'].map(translateCodon)).toEqual(
      Array(6).fill('L'),
    )
    expect(['UCU', 'UCC', 'UCA', 'UCG', 'AGU', 'AGC'].map(translateCodon)).toEqual(
      Array(6).fill('S'),
    )
    expect(['CGU', 'CGC', 'CGA', 'CGG', 'AGA', 'AGG'].map(translateCodon)).toEqual(
      Array(6).fill('R'),
    )
  })
})

describe('translate', () => {
  it('translates AUGGCCUAA to MA and stops', () => {
    const result = translate('AUGGCCUAA')
    expect(result.peptide).toBe('MA')
    expect(result.stopIndex).toBe(6)
  })

  it('reports no stop when the frame runs off the end', () => {
    expect(translate('AUGGCC')).toEqual({ peptide: 'MA', stopIndex: null })
  })

  it('ignores a trailing partial codon rather than padding it', () => {
    expect(translate('AUGGCCU').peptide).toBe('MA')
  })

  it('marks an unreadable codon X rather than dropping it', () => {
    expect(translate('AUGNNNGCC').peptide).toBe('MXA')
  })
})

describe('findOpenReadingFrame', () => {
  it('opens at the first AUG wherever it sits and closes on the first in-frame stop', () => {
    const orf = findOpenReadingFrame('GGGAUGGCCUAAUU')
    expect(orf).not.toBeNull()
    expect(orf?.start).toBe(3)
    expect(orf?.peptide).toBe('MA')
    // 3 (start) + 6 (two coding codons) + 3 (the stop) = 12, exclusive.
    expect(orf?.end).toBe(12)
  })

  it('returns null only when there is no AUG at all', () => {
    expect(findOpenReadingFrame('GGGCCCUUU')).toBeNull()
    expect(findOpenReadingFrame('AUGGCC')).not.toBeNull()
  })

  it('does not read a stop that is out of frame', () => {
    // UAA sits at index 4, one base out of the frame opened at index 0.
    const orf = findOpenReadingFrame('AUGCUAAGCUAA')
    expect(orf?.peptide).toBe('MLS')
    expect(orf?.end).toBe(12)
  })
})

describe('nucleotide mass and formula', () => {
  it('agrees with the atomic weight table to within the vendor table rounding', () => {
    const composition = { A: 4, U: 7, C: 4, G: 4 }
    const fromResidueMasses = nucleicAcidAverageMass(composition)
    const atoms = nucleicAcidAtomCounts(composition)

    expect(fromResidueMasses).not.toBeNull()
    expect(atoms).not.toBeNull()

    let fromFormula = 0
    for (const [element, count] of Object.entries(atoms ?? {})) {
      fromFormula += (STANDARD_ATOMIC_WEIGHTS[element] ?? 0) * count
    }
    // Two independent routes to the same number: the published residue masses (2 decimal places,
    // hence the 0.1 Da tolerance) and an atom-by-atom sum over the IUPAC weights.
    expect(Math.abs(fromFormula - (fromResidueMasses ?? 0))).toBeLessThan(0.1)
  })

  it('refuses to weigh an empty or unknown composition instead of returning zero', () => {
    expect(nucleicAcidAverageMass({})).toBeNull()
    expect(nucleicAcidAverageMass({ A: 1, X: 2 })).toBeNull()
    expect(nucleicAcidAtomCounts({ A: 1, X: 2 })).toBeNull()
  })
})

describe('validateLayer1 — nucleotide', () => {
  it('accepts the reference siRNA and computes its composition exactly', () => {
    const result = validateLayer1(SIRNA, 'siRNA (Small Interfering RNA)')

    expect(result.passed).toBe(true)
    expect(result.structureType).toBe('rna_sequence')
    expect(result.cleanedSequence).toBe(SIRNA)
    expect(result.validLength).toBe(19)
    expect(result.baseCounts).toEqual({ A: 4, U: 7, C: 4, G: 4, illegal: 0 })
    expect(result.gcContentPercent).toBeCloseTo(42.1, 1)
    expect(result.isMultipleOfThree).toBe(false)
    expect(result.hasStartCodon).toBe(true)
    expect(result.transcribedThymineCount).toBe(0)
    expect(result.illegalChars).toEqual([])
    expect(result.chemicalFormula).toBe('C179H222N66O134P18')
    expect(result.molecularWeightDaltons).toBeCloseTo(5999.63, 2)
    expect(codes(result.diagnostics)).toContain('L1_NUCLEOTIDE_PASS')
  })

  it('skips whitespace and hyphens without counting them', () => {
    const spaced = validateLayer1('AUG UCA-UUG GAU\nCAC UGC U', 'mRNA Vaccine / Therapeutic')
    const plain = validateLayer1(SIRNA, 'mRNA Vaccine / Therapeutic')

    expect(spaced.cleanedSequence).toBe(plain.cleanedSequence)
    expect(spaced.validLength).toBe(19)
    expect(spaced.baseCounts).toEqual(plain.baseCounts)
    expect(spaced.originalLength).toBe('AUG UCA-UUG GAU\nCAC UGC U'.length)
  })

  it('transcribes thymine to uracil and says so', () => {
    const result = validateLayer1('AUGTCAUUGGAUCACUGCU', 'siRNA (Small Interfering RNA)')

    expect(result.passed).toBe(true)
    expect(result.cleanedSequence).toBe(SIRNA)
    expect(result.transcribedThymineCount).toBe(1)
    expect(result.baseCounts?.U).toBe(7)
    const thymine = result.diagnostics.find((d) => d.code === 'L1_THYMINE_TRANSCRIBED')
    expect(thymine?.severity).toBe('warning')
    expect(thymine?.position).toBe(4)
  })

  it('treats thymine as legal and uracil as the error in cDNA mode', () => {
    const cdna = validateLayer1('ATGTCATTGGATCACTGCT', 'siRNA (Small Interfering RNA)', true)

    expect(cdna.passed).toBe(true)
    expect(cdna.cleanedSequence).toBe('ATGTCATTGGATCACTGCT')
    expect(cdna.transcribedThymineCount).toBe(0)
    // BaseCounts has no T member; in cDNA mode the thymine tally rides in the U field.
    expect(cdna.baseCounts).toEqual({ A: 4, U: 7, C: 4, G: 4, illegal: 0 })
    expect(cdna.hasStartCodon).toBe(true)
    expect(codes(cdna.diagnostics)).not.toContain('L1_THYMINE_TRANSCRIBED')

    const withUracil = validateLayer1(SIRNA, 'siRNA (Small Interfering RNA)', true)
    expect(withUracil.passed).toBe(false)
    expect(codes(withUracil.diagnostics)).toContain('L1_URACIL_IN_CDNA')
  })

  it('positions an illegal character on the character the contributor typed', () => {
    const result = validateLayer1('  AUGXCAUUGGAUCACUGCU', 'ASO (Antisense Oligonucleotide)')

    expect(result.passed).toBe(false)
    expect(result.illegalChars).toHaveLength(1)
    expect(result.baseCounts?.illegal).toBe(1)
    const illegal = result.diagnostics.find((d) => d.code === 'L1_ILLEGAL_CHARACTER')
    expect(illegal?.severity).toBe('error')
    // Two spaces of padding, then A U G at 3-5, so the X is the sixth character of the raw string.
    expect(illegal?.position).toBe(6)
  })

  it('rejects a sequence shorter than twelve bases', () => {
    const result = validateLayer1('AUGCA', 'siRNA (Small Interfering RNA)')

    expect(result.passed).toBe(false)
    expect(codes(result.diagnostics)).toContain('L1_SEQUENCE_TOO_SHORT')
  })

  it('does not lecture a short oligo about reading frames', () => {
    const result = validateLayer1('CCCCCCCCCCCCCCCCCCCC', 'ASO (Antisense Oligonucleotide)')

    expect(result.passed).toBe(true)
    expect(codes(result.diagnostics)).toContain('L1_OLIGO_NOT_CODING')
    expect(codes(result.diagnostics)).not.toContain('L1_NO_START_CODON')
    // The fields are still computed; only the noise is withheld.
    expect(result.hasStartCodon).toBe(false)
    expect(result.openReadingFrameLength).toBe(0)
  })

  it('finds a premature in-frame stop in a coding-length sequence', () => {
    const sequence = `AUG${'GCC'.repeat(9)}UAA${'GCC'.repeat(9)}UAA`
    const result = validateLayer1(sequence, 'mRNA Vaccine / Therapeutic')

    expect(result.validLength).toBe(63)
    expect(result.isMultipleOfThree).toBe(true)
    expect(result.hasStartCodon).toBe(true)
    expect(result.hasStopCodon).toBe(true)
    expect(result.translatedPeptide).toBe(`M${'A'.repeat(9)}`)
    expect(result.openReadingFrameLength).toBe(33)
    expect(result.prematureStopAt).toBe(31)
    const premature = result.diagnostics.find((d) => d.code === 'L1_PREMATURE_STOP')
    expect(premature?.severity).toBe('warning')
    expect(premature?.position).toBe(31)
  })

  it('reports the coding-frame findings once the sequence is long enough to have one', () => {
    const result = validateLayer1('GCC'.repeat(21), 'mRNA Vaccine / Therapeutic')

    expect(result.validLength).toBe(63)
    expect(codes(result.diagnostics)).toContain('L1_NO_START_CODON')
    expect(codes(result.diagnostics)).toContain('L1_NO_STOP_CODON')
    expect(codes(result.diagnostics)).toContain('L1_NO_OPEN_READING_FRAME')
    expect(codes(result.diagnostics)).not.toContain('L1_FRAME_NOT_TRIPLET')
  })

  it('routes CRISPR guides to the nucleotide branch', () => {
    const result = validateLayer1(
      'CUAACAGUUGACUAGUCCAGGUUUUAGAGCUAGAAAUAGCAAGUUAAAAUAAGGCUAGUCCGUUAUCAACUUGAAAAAGUGGCACCGAGUCGGUGCUUUU',
      'CRISPR / Gene Therapy',
    )

    expect(result.structureType).toBe('rna_sequence')
    expect(result.passed).toBe(true)
    expect(result.validLength).toBe(100)
  })
})

describe('validateLayer1 — SMILES', () => {
  it('accepts aspirin and reports the real formula and mass', () => {
    const result = validateLayer1(ASPIRIN, 'Small Molecule')

    expect(result.passed).toBe(true)
    expect(result.structureType).toBe('small_molecule_smiles')
    expect(result.chemicalFormula).toBe('C9H8O4')
    expect(result.molecularWeightDaltons).toBeCloseTo(180.16, 2)
    expect(result.molecularWeightEstimate).toBe('180.16 g/mol')
    expect(result.atomCounts).toEqual({ C: 9, O: 4, H: 8 })
    expect(result.ringClosures).toBe(1)
    expect(result.unmatchedRingBonds).toEqual([])
    expect(codes(result.diagnostics)).toContain('L1_SMILES_PASS')
  })

  it('routes nutraceuticals to the SMILES branch too', () => {
    const result = validateLayer1('CN(C)C(=N)NC(=N)N', 'Nutraceutical / Botanical')

    expect(result.structureType).toBe('small_molecule_smiles')
    expect(result.chemicalFormula).toBe('C4H11N5')
    expect(result.molecularWeightEstimate).toBe('129.16 g/mol')
  })

  it('groups thousands in the displayed mass', () => {
    // An 80-carbon chain is not a drug; it is the cheapest string that certainly exceeds
    // 1,000 g/mol, and the display must read "1,124.14 g/mol" rather than "1124.14 g/mol".
    const result = validateLayer1('C'.repeat(80), 'Small Molecule')

    expect(result.passed).toBe(true)
    expect(result.chemicalFormula).toBe('C80H162')
    expect(result.molecularWeightEstimate).toBe('1,124.14 g/mol')
  })

  it('reports the reference dataset macrolide as structurally unclosed', () => {
    // Same finding as the SMILES suite, exercised through the layer so the diagnostic code is
    // pinned too: the wireframe's rapamycin string never closes ring-bond 1.
    const result = validateLayer1(
      'CC1CCC2CC(=O)C(=C)C(C(C(=CC(=O)OC(CC(=O)C(C(C(C(C(C(=O)C(C(C(=O)O2)O)C)O)C)OC)C)O)C)C)C)OC',
      'Small Molecule',
    )

    expect(result.passed).toBe(false)
    expect(result.unmatchedRingBonds).toEqual([1])
    expect(codes(result.diagnostics)).toContain('L1_SMILES_UNMATCHED_RING_BOND')
    expect(result.molecularWeightDaltons).toBeUndefined()
  })

  it('fails an unbalanced SMILES string and computes no mass for it', () => {
    const result = validateLayer1('CC(=O', 'Small Molecule')

    expect(result.passed).toBe(false)
    expect(codes(result.diagnostics)).toContain('L1_SMILES_UNBALANCED_PARENS')
    expect(result.molecularWeightDaltons).toBeUndefined()
    expect(result.chemicalFormula).toBeUndefined()
    expect(result.molecularWeightEstimate).toBeUndefined()
  })

  it('names an unmatched ring bond', () => {
    const result = validateLayer1('C1CCCCC', 'Small Molecule')

    expect(result.passed).toBe(false)
    expect(result.unmatchedRingBonds).toEqual([1])
    expect(codes(result.diagnostics)).toContain('L1_SMILES_UNMATCHED_RING_BOND')
  })
})

describe('validateLayer1 — peptide', () => {
  it('accepts semaglutide with its documented side-chain conjugate', () => {
    const result = validateLayer1(SEMAGLUTIDE, 'Peptide / GLP-1 Agonist')

    expect(result.passed).toBe(true)
    expect(result.structureType).toBe('peptide_sequence')
    expect(result.cleanedInput).toBe('HAEGTFTSDVSSYLEGQAAKEFIAWLVRGRG')
    expect(result.aminoAcidCount).toBe(31)
    expect(result.validLength).toBe(31)
    expect(result.illegalChars).toEqual([])

    const modification = result.nonStandardResidues?.find((entry) =>
      entry.startsWith('side-chain modification'),
    )
    expect(modification).toBeDefined()
    expect(modification).toContain('AEEAc-AEEAc-γ-Glu-17-carboxyheptadecanoyl')
    // The conjugate hangs off the lysine at position 20 — the K of ...QAAK(...).
    expect(modification).toContain('residue 20 (K)')

    const note = result.diagnostics.find((d) => d.code === 'L1_PEPTIDE_MODIFICATION')
    expect(note?.severity).toBe('warning')
    expect(note?.message).toContain('excludes this group')
  })

  it('weighs the peptide backbone from residue masses, not from its length', () => {
    const result = validateLayer1(SEMAGLUTIDE, 'Peptide / GLP-1 Agonist')
    const expected = peptideAverageMass('HAEGTFTSDVSSYLEGQAAKEFIAWLVRGRG')

    expect(expected).not.toBeNull()
    expect(result.molecularWeightDaltons).toBeCloseTo(expected ?? 0, 1)
    // The wireframe's placeholder was 110.1 Da per residue, i.e. 3413 Da for 31 residues. The real
    // composition-derived mass differs, which is the whole reason for replacing it.
    expect(result.molecularWeightDaltons).not.toBe(31 * 110.1)
  })

  it('rejects a non-standard backbone residue and points at it', () => {
    const result = validateLayer1('HAEGTFXTSDVSS', 'Peptide / GLP-1 Agonist')

    expect(result.passed).toBe(false)
    const finding = result.diagnostics.find((d) => d.code === 'L1_NON_STANDARD_RESIDUE')
    expect(finding?.severity).toBe('error')
    expect(finding?.position).toBe(7)
    expect(result.nonStandardResidues?.[0]).toContain("'X'")
  })

  // The floor used to be five, which rejected epitalon (a real tetrapeptide) and carnosine (a real
  // dipeptide) in order to filter noise the alphabet check already catches.
  it('rejects a single residue, which is not a peptide', () => {
    const result = validateLayer1('H', 'Peptide / GLP-1 Agonist')

    expect(result.passed).toBe(false)
    expect(codes(result.diagnostics)).toContain('L1_SEQUENCE_TOO_SHORT')
  })

  it('rejects an unclosed modification group', () => {
    const result = validateLayer1('HAEGTFTSDV(AEEAc', 'Peptide / GLP-1 Agonist')

    expect(result.passed).toBe(false)
    expect(codes(result.diagnostics)).toContain('L1_PEPTIDE_UNBALANCED_PARENS')
  })
})

describe('validateLayer1 — biologics and other descriptors', () => {
  it('accepts an antibody descriptor without inventing a molecular weight', () => {
    const result = validateLayer1('Trastuzumab IgG1 kappa, humanised', 'Monoclonal Antibody (mAb)')

    expect(result.passed).toBe(true)
    expect(result.structureType).toBe('antibody_structure')
    expect(result.molecularWeightDaltons).toBeUndefined()
    expect(result.molecularWeightEstimate).toBeUndefined()
    const note = result.diagnostics.find((d) => d.code === 'L1_MASS_NOT_DERIVABLE')
    expect(note).toBeDefined()
    expect(note?.message).not.toMatch(/148/)
  })

  it('sends recombinant proteins down the same branch', () => {
    const result = validateLayer1('Recombinant human factor VIII', 'Recombinant Protein / Biologic')
    expect(result.structureType).toBe('antibody_structure')
    expect(result.passed).toBe(true)
  })

  it('rejects a descriptor of fewer than three characters', () => {
    const result = validateLayer1('Ab', 'Monoclonal Antibody (mAb)')
    expect(result.passed).toBe(false)
    expect(codes(result.diagnostics)).toContain('L1_STRUCTURE_TOO_SHORT')
  })
})

describe('validateLayer1 — contract', () => {
  it('reports an empty structure rather than passing it', () => {
    const result = validateLayer1('   \n ', 'Small Molecule')

    expect(result.passed).toBe(false)
    expect(result.validLength).toBe(0)
    expect(codes(result.diagnostics)).toEqual(['L1_STRUCTURE_EMPTY'])
  })

  it('stamps every diagnostic with layer 1 and a stable L1_ code', () => {
    const inputs: Array<[string, Parameters<typeof validateLayer1>[1]]> = [
      [SIRNA, 'siRNA (Small Interfering RNA)'],
      ['AUGXCAUUG', 'ASO (Antisense Oligonucleotide)'],
      [ASPIRIN, 'Small Molecule'],
      ['CC(=O', 'Small Molecule'],
      [SEMAGLUTIDE, 'Peptide / GLP-1 Agonist'],
      ['Trastuzumab IgG1', 'Monoclonal Antibody (mAb)'],
    ]

    for (const [structure, modality] of inputs) {
      const result = validateLayer1(structure, modality)
      expect(result.diagnostics.length).toBeGreaterThan(0)
      for (const finding of result.diagnostics) {
        expect(finding.layer).toBe(1)
        expect(finding.code).toMatch(/^L1_[A-Z0-9_]+$/)
        expect(['pass', 'warning', 'error']).toContain(finding.severity)
        expect(finding.message.length).toBeGreaterThan(0)
      }
    }
  })

  it('always emits an affirmative diagnostic on success', () => {
    const passing = [
      validateLayer1(SIRNA, 'siRNA (Small Interfering RNA)'),
      validateLayer1(ASPIRIN, 'Small Molecule'),
      validateLayer1(SEMAGLUTIDE, 'Peptide / GLP-1 Agonist'),
      validateLayer1('Trastuzumab IgG1', 'Monoclonal Antibody (mAb)'),
    ]

    for (const result of passing) {
      expect(result.passed).toBe(true)
      expect(result.diagnostics.some((d) => d.severity === 'pass')).toBe(true)
    }
  })

  it('produces byte-identical output for the same input', () => {
    const inputs: Array<[string, Parameters<typeof validateLayer1>[1]]> = [
      [SIRNA, 'siRNA (Small Interfering RNA)'],
      [ASPIRIN, 'Small Molecule'],
      [SEMAGLUTIDE, 'Peptide / GLP-1 Agonist'],
    ]

    for (const [structure, modality] of inputs) {
      const first = JSON.stringify(validateLayer1(structure, modality))
      const second = JSON.stringify(validateLayer1(structure, modality))
      expect(second).toBe(first)
    }
  })
})

describe('multi-chain peptides and short peptides', () => {
  // Insulin is two chains held together by disulfide bonds and cannot be written as one
  // uninterrupted string. Read character by character, the separator and the chain letter both
  // looked like illegal residues, which rejected the most-prescribed biologic in the corpus.
  const GLARGINE = 'A-chain GIVEQCCTSICSLYQLENYCG | B-chain FVNQHLCGSHLVEALYLVCGERGFFYTPKTRR'

  it('reads both chains of insulin glargine as one 53-residue molecule', () => {
    const result = validateLayer1(
      GLARGINE,
      'Recombinant Protein / Biologic',
      false,
      'peptide_sequence',
    )

    expect(result.passed).toBe(true)
    expect(result.aminoAcidCount).toBe(53)
    expect(result.diagnostics.map((d) => d.code)).toContain('L1_MULTI_CHAIN_PEPTIDE')
  })

  it('accepts a labelled chain separator', () => {
    const result = validateLayer1(
      'chain A: GIVEQ | chain B: FVNQH',
      'Peptide / GLP-1 Agonist',
      false,
      'peptide_sequence',
    )

    expect(result.passed).toBe(true)
    expect(result.aminoAcidCount).toBe(10)
  })

  // A label must announce itself. An earlier pattern treated any leading letter as one, so
  // epitalon AEDG lost its alanine and came back a tripeptide.
  it('does not mistake a first residue for a chain label', () => {
    const result = validateLayer1('AEDG', 'Peptide / GLP-1 Agonist', false, 'peptide_sequence')

    expect(result.passed).toBe(true)
    expect(result.aminoAcidCount).toBe(4)
  })

  it('accepts a dipeptide, because a dipeptide is a peptide', () => {
    const result = validateLayer1('AH', 'Nutraceutical / Botanical', false, 'peptide_sequence')

    expect(result.passed).toBe(true)
    expect(result.aminoAcidCount).toBe(2)
  })

  it('still keeps a side-chain conjugate out of the backbone count', () => {
    const result = validateLayer1(
      'HAEGTFTSDVSSYLEGQAAK(AEEAc-AEEAc-gamma-Glu-17-carboxyheptadecanoyl)EFIAWLVRGRG',
      'Peptide / GLP-1 Agonist',
      false,
      'peptide_sequence',
    )

    expect(result.passed).toBe(true)
    expect(result.aminoAcidCount).toBe(31)
  })
})
