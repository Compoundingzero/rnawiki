// Layer 2 — topological and base-pairing verification.
//
// Layer 1 asked whether the string is a legal structure. Layer 2 asks whether the molecule that
// string describes is physically coherent, and it answers with a different model per modality:
//
//   rna_sequence          minimum free energy fold, Turner 2004 nearest-neighbour parameters
//   small_molecule_smiles Wildman-Crippen logP, Ertl polar surface area, Lipinski's rule of five
//   peptide_sequence      Bjellqvist isoelectric point, net charge, Kyte-Doolittle hydropathy
//   anything else         no model, said out loud
//
// WHAT CHANGED FROM THE REFERENCE WIREFRAME. The wireframe's `validateLayer2`
// (src/utils/rnaIntelligenceEngine.ts) is where this port diverges hardest, and every divergence
// is a deletion of an invented number:
//
//   - Its "MFE" was `-1.2` with a fixed penalty per adjacent doublet, walked left to right. That
//     is not a fold. It cannot form a hairpin, it has no loop-initiation cost, and it returns a
//     large negative energy for a sequence that in fact cannot pair with itself at all. This layer
//     calls `foldRna`, which runs the real Zuker dynamic program over the real parameter set.
//   - Its `watsonCrickPairs` counted every base that has a complement, so the answer was always
//     the length of the sequence. Here the pair counts come from the predicted structure, so they
//     describe pairs that the model says actually form.
//   - Its `logP` was `input.length * 0.12 - 1.2` and its hydrogen-bond donors were `count of N or
//     O characters, divided by two`. Those are string-length heuristics wearing chemistry's
//     clothes. Here they are atom-environment sums over published tables — see `descriptors.ts`,
//     which is honest about which of them is an estimate.
//   - For a peptide or an antibody it returned `thermodynamicallyPlausible: true` with the line
//     "Biological receptor binding conformation and folding energy verified." No folding energy
//     was computed and nothing was verified. This layer computes what a backbone actually
//     supports, and for a biologic descriptor it reports that no model applies.
//
// `thermodynamicallyPlausible` is only ever true where a thermodynamic model ran and did not
// object. False means "this layer did not establish plausibility", which for a peptide or an
// antibody is the truth, not a finding against the molecule. The diagnostics carry that
// distinction in words; the boolean cannot.
//
// Pure function of its input: no clock, no randomness, no I/O. Same Layer1Result in, same
// Layer2Result out, forever — which is what makes the verification hash in `index.ts` mean
// anything.

import type { Diagnostic, DiagnosticSeverity, Layer1Result, Layer2Result } from './types'
import { computeDescriptors, computePeptideDescriptors } from './descriptors'
import type { FoldResult } from './fold'
import { foldRna } from './fold'

/**
 * Longest sequence Layer 2 will fold inside one request.
 *
 * Folding is O(n^3) in time and O(n^2) in memory. `MEASURED_FOLD_MILLISECONDS` in `fold.ts`
 * records the real curve on the development machine: 400 nt costs about 65 ms, 1000 nt about
 * 800 ms, and the two matrices at 1000 nt are 8 MB. 1000 is therefore the point where one sweep
 * still fits in a request budget alongside everything else the page does. A longer construct — a
 * full-length mRNA is several thousand nucleotides — is refused rather than truncated: the
 * fold of the first 1000 bases is the fold of a molecule that does not exist.
 */
export const MAX_FOLD_LENGTH = 1000

function diagnostic(severity: DiagnosticSeverity, code: string, message: string): Diagnostic {
  return { layer: 2, severity, code, message }
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

// ---------------------------------------------------------------------------
// Nucleotide
// ---------------------------------------------------------------------------

const RNA_COMPLEMENT: Record<string, string> = { A: 'U', U: 'A', C: 'G', G: 'C' }
const DNA_COMPLEMENT: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' }

/**
 * Base-for-base complement, 5' to 3' order preserved.
 *
 * The alphabet is chosen once from the sequence rather than per character, so a cDNA strand
 * validated in Layer 1's `cdnaMode` complements A to T and an RNA strand complements A to U. A
 * symbol with no complement becomes 'N'; Layer 1 guarantees a clean alphabet when it passed, so
 * that branch is unreachable from the pipeline and exists only so a direct caller never receives
 * a complement string shorter than the sequence it describes.
 */
function complementOf(sequence: string): string {
  const table = sequence.includes('T') ? DNA_COMPLEMENT : RNA_COMPLEMENT
  let complement = ''
  for (const base of sequence) {
    complement += table[base] ?? 'N'
  }
  return complement
}

function reverseOf(sequence: string): string {
  let reversed = ''
  for (let index = sequence.length - 1; index >= 0; index--) {
    reversed += sequence.charAt(index)
  }
  return reversed
}

function validateNucleotide(layer1: Layer1Result): Layer2Result {
  const diagnostics: Diagnostic[] = []
  // `cleanedSequence` is what Layer 1 promises for nucleotide input; `cleanedInput` is the same
  // string there, and is the fallback so a hand-built Layer1Result still works.
  const sequence = layer1.cleanedSequence ?? layer1.cleanedInput
  const complementaryStrand = complementOf(sequence)
  const reverseComplement = reverseOf(complementaryStrand)

  // Turner 2004 is a parameter set for RNA. A cDNA strand is a different polymer with different
  // stacking energies, and `encodeBase` in `turner-params.ts` deliberately treats thymine as
  // unpairable rather than transcribing it silently. Folding it anyway would return 0.0 kcal/mol
  // for every cDNA sequence and print it as a measurement, so this layer declines instead.
  if (!/^[ACGU]*$/.test(sequence)) {
    diagnostics.push(
      diagnostic(
        'warning',
        'L2_NO_MODEL_FOR_MODALITY',
        'This sequence carries symbols outside A, C, G and U, so the Turner 2004 RNA ' +
          'nearest-neighbour parameters do not describe it. The complementary strand is ' +
          'reported; no folding energy is.',
      ),
    )
    return {
      passed: true,
      complementaryStrand,
      reverseComplement,
      thermodynamicallyPlausible: false,
      diagnostics,
    }
  }

  let fold: FoldResult
  try {
    fold = foldRna(sequence, { maxLength: MAX_FOLD_LENGTH })
  } catch {
    diagnostics.push(
      diagnostic(
        'error',
        'L2_SEQUENCE_TOO_LONG_TO_FOLD',
        `This sequence is ${sequence.length} nt. Layer 2 folds up to ${MAX_FOLD_LENGTH} nt ` +
          'inside a request; the dynamic program is cubic in length, so beyond that it cannot ' +
          'finish. No minimum free energy is reported for this record.',
      ),
    )
    return {
      passed: false,
      complementaryStrand,
      reverseComplement,
      thermodynamicallyPlausible: false,
      diagnostics,
    }
  }

  // One decimal place, matching how a folding energy is quoted everywhere in the literature and
  // in ViennaRNA's own output. The underlying dynamic program works in integer dekacalories, so
  // this is a display rounding of an exact value and not a tolerance.
  const mfeDeltaG = roundTo(fold.mfeKcalPerMol, 1)

  if (fold.pairedBases === 0) {
    diagnostics.push(
      diagnostic(
        'warning',
        'L2_NO_STABLE_FOLD',
        'No base pair lowers the free energy of this sequence, so the predicted structure is the ' +
          'open chain at 0.0 kcal/mol. That is a real result, not a failure: a sequence with no ' +
          'self-complementary stretch has nothing to fold into.',
      ),
    )
  }

  diagnostics.push(
    diagnostic(
      'pass',
      'L2_MFE_COMPUTED',
      `Minimum free energy ${mfeDeltaG.toFixed(1)} kcal/mol at 37 degrees C over ` +
        `${fold.pairedBases} base ${fold.pairedBases === 1 ? 'pair' : 'pairs'} ` +
        `(${fold.watsonCrickPairs} Watson-Crick, ${fold.wobblePairs} G-U wobble), longest helix ` +
        `${fold.longestHelix}, ${fold.hairpinLoopCount} hairpin ` +
        `${fold.hairpinLoopCount === 1 ? 'loop' : 'loops'}.`,
    ),
  )

  return {
    passed: true,
    complementaryStrand,
    reverseComplement,
    watsonCrickPairs: fold.watsonCrickPairs,
    wobblePairs: fold.wobblePairs,
    pairedBases: fold.pairedBases,
    secondaryStructureNotation: fold.dotBracket,
    mfeDeltaG,
    longestHelix: fold.longestHelix,
    hairpinLoopCount: fold.hairpinLoopCount,
    // The fold returned, and a structure that cannot beat the open chain scores 0. Both halves are
    // stated because the second is the physical claim and the first is the engineering one.
    thermodynamicallyPlausible: mfeDeltaG <= 0,
    diagnostics,
  }
}

// ---------------------------------------------------------------------------
// Small molecule
// ---------------------------------------------------------------------------

function validateSmallMolecule(layer1: Layer1Result): Layer2Result {
  const diagnostics: Diagnostic[] = []
  const descriptors = computeDescriptors(layer1.cleanedInput)
  const failed = descriptors.ruleOfFive.filter((rule) => !rule.passed)

  if (failed.length > 0) {
    const detail = failed.map((rule) => `${rule.rule} (observed ${rule.value})`).join('; ')
    diagnostics.push(
      diagnostic(
        'warning',
        'L2_LIPINSKI_VIOLATION',
        `${failed.length} of Lipinski's four criteria are exceeded: ${detail}. Lipinski ` +
          'describes oral bioavailability, so a violation is a route-of-administration finding ' +
          'and not a defect in the structure.',
      ),
    )
  }

  diagnostics.push(
    diagnostic(
      'pass',
      'L2_DESCRIPTORS_COMPUTED',
      `${descriptors.heavyAtoms} heavy atoms, polar surface area ${descriptors.tpsa} square ` +
        `angstroms, ${descriptors.hydrogenBondDonors} hydrogen bond ` +
        `${descriptors.hydrogenBondDonors === 1 ? 'donor' : 'donors'}, ` +
        `${descriptors.hydrogenBondAcceptors} acceptors, ${descriptors.rotatableBonds} rotatable ` +
        `bonds, estimated logP ${descriptors.logP.toFixed(2)}.`,
    ),
  )

  return {
    passed: true,
    logP: descriptors.logP,
    topologicalPolarSurfaceArea: descriptors.tpsa,
    hydrogenBondDonors: descriptors.hydrogenBondDonors,
    hydrogenBondAcceptors: descriptors.hydrogenBondAcceptors,
    rotatableBonds: descriptors.rotatableBonds,
    lipinskiViolations: descriptors.lipinskiViolations,
    lipinskiCompliant: descriptors.lipinskiCompliant,
    // Lipinski himself allowed one violation before a compound is considered unlikely to be
    // orally available, so one is the threshold here rather than zero.
    thermodynamicallyPlausible: descriptors.lipinskiViolations <= 1,
    diagnostics,
  }
}

// ---------------------------------------------------------------------------
// Peptide
// ---------------------------------------------------------------------------

function validatePeptide(layer1: Layer1Result): Layer2Result {
  const diagnostics: Diagnostic[] = []
  const descriptors = computePeptideDescriptors(layer1.cleanedInput)

  diagnostics.push(
    diagnostic(
      'warning',
      'L2_NO_MODEL_FOR_MODALITY',
      'No folding energy was computed. Predicting the fold of a peptide backbone needs a ' +
        'structure model, which this engine does not carry, so what follows is the charge and ' +
        'hydropathy the sequence supports and nothing further.',
    ),
  )
  diagnostics.push(
    diagnostic(
      'pass',
      'L2_PEPTIDE_DESCRIPTORS_COMPUTED',
      `Isoelectric point ${descriptors.isoelectricPoint.toFixed(2)}, net charge ` +
        `${descriptors.netChargeAtPh7.toFixed(2)} at pH 7.0, hydrophobic residue fraction ` +
        `${descriptors.hydrophobicResidueFraction.toFixed(3)} on the Kyte-Doolittle scale.`,
    ),
  )

  return {
    passed: true,
    isoelectricPoint: descriptors.isoelectricPoint,
    netChargeAtPh7: descriptors.netChargeAtPh7,
    hydrophobicResidueFraction: descriptors.hydrophobicResidueFraction,
    // No thermodynamic model ran. See this file's header: false records that plausibility was not
    // established, never that the molecule was found implausible.
    thermodynamicallyPlausible: false,
    diagnostics,
  }
}

// ---------------------------------------------------------------------------
// Biologic descriptor and anything else
// ---------------------------------------------------------------------------

function validateWithoutModel(layer1: Layer1Result): Layer2Result {
  return {
    passed: layer1.passed,
    thermodynamicallyPlausible: false,
    diagnostics: [
      diagnostic(
        'warning',
        'L2_NO_MODEL_FOR_MODALITY',
        'No thermodynamic model applies to this descriptor. A folding energy needs a ' +
          'structure: a nucleotide sequence, a connection table or a peptide backbone. A ' +
          'biologic named by an identifier is none of those, so nothing is reported in its ' +
          'place.',
      ),
    ],
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Layer 2 entry point. Routes on the structure type Layer 1 settled, never on the modality string
 * again: two modalities that resolve to the same structure type must get the same physics, and
 * re-deciding here is how they would drift apart.
 *
 * Diagnostic codes emitted by this layer:
 *   L2_LAYER1_PREREQUISITE_FAILED   Layer 1 rejected the input, so nothing downstream is defined
 *   L2_MFE_COMPUTED                 a fold ran and its energy is reported
 *   L2_NO_STABLE_FOLD               the fold ran and found nothing better than the open chain
 *   L2_SEQUENCE_TOO_LONG_TO_FOLD    the sequence exceeds MAX_FOLD_LENGTH
 *   L2_DESCRIPTORS_COMPUTED         small-molecule descriptors are reported
 *   L2_LIPINSKI_VIOLATION           one or more rule-of-five criteria are exceeded
 *   L2_PEPTIDE_DESCRIPTORS_COMPUTED peptide charge and hydropathy are reported
 *   L2_NO_MODEL_FOR_MODALITY        no model in this engine describes the submitted structure
 */
export function validateLayer2(layer1: Layer1Result): Layer2Result {
  if (!layer1.passed) {
    // Every Layer 2 answer is a statement about the molecule Layer 1 said it read. If Layer 1
    // rejected the string, there is no molecule to make statements about, and computing over the
    // cleaned remains would produce descriptors for something nobody submitted.
    return {
      passed: false,
      thermodynamicallyPlausible: false,
      diagnostics: [
        diagnostic(
          'error',
          'L2_LAYER1_PREREQUISITE_FAILED',
          'Layer 1 rejected this structure, so no Layer 2 check was run. Fix the sequence or ' +
            'connection-table errors above and the structural checks will follow.',
        ),
      ],
    }
  }

  switch (layer1.structureType) {
    case 'rna_sequence':
      return validateNucleotide(layer1)
    case 'small_molecule_smiles':
      return validateSmallMolecule(layer1)
    case 'peptide_sequence':
      return validatePeptide(layer1)
    default:
      return validateWithoutModel(layer1)
  }
}
