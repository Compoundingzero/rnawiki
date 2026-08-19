// The standard genetic code, published residue masses, and the codon-level helpers Layer 1 runs on.
//
// Everything in this file is either a published constant or a pure function over one. No I/O, no
// clock, no randomness: the same sequence yields the same peptide and the same mass on every
// machine, which is the whole premise of the deterministic sweep.
//
// Sources for the numbers, so they can be re-checked rather than trusted:
//   - Genetic code: NCBI translation table 1 (the Standard Code).
//   - Amino acid residue masses: the classic average/monoisotopic residue table used by mass
//     spectrometry software (residue = free amino acid minus one water, i.e. what the residue
//     contributes to a chain).
//   - Nucleotide residue masses: nucleoside 5'-monophosphate minus one water, matching the values
//     oligo vendors publish for MW calculation (IDT's A 329.21 / U 306.17 / C 305.18 / G 345.21 for
//     RNA, A 313.21 / T 304.20 / C 289.18 / G 329.21 for DNA).

/**
 * NCBI translation table 1. All 64 codons in RNA alphabet; `*` is a stop.
 * Grouped by first base so a transcription error is visible on inspection.
 */
export const STANDARD_GENETIC_CODE: Record<string, string> = {
  // U _ _
  UUU: 'F',
  UUC: 'F',
  UUA: 'L',
  UUG: 'L',
  UCU: 'S',
  UCC: 'S',
  UCA: 'S',
  UCG: 'S',
  UAU: 'Y',
  UAC: 'Y',
  UAA: '*',
  UAG: '*',
  UGU: 'C',
  UGC: 'C',
  UGA: '*',
  UGG: 'W',
  // C _ _
  CUU: 'L',
  CUC: 'L',
  CUA: 'L',
  CUG: 'L',
  CCU: 'P',
  CCC: 'P',
  CCA: 'P',
  CCG: 'P',
  CAU: 'H',
  CAC: 'H',
  CAA: 'Q',
  CAG: 'Q',
  CGU: 'R',
  CGC: 'R',
  CGA: 'R',
  CGG: 'R',
  // A _ _
  AUU: 'I',
  AUC: 'I',
  AUA: 'I',
  AUG: 'M',
  ACU: 'T',
  ACC: 'T',
  ACA: 'T',
  ACG: 'T',
  AAU: 'N',
  AAC: 'N',
  AAA: 'K',
  AAG: 'K',
  AGU: 'S',
  AGC: 'S',
  AGA: 'R',
  AGG: 'R',
  // G _ _
  GUU: 'V',
  GUC: 'V',
  GUA: 'V',
  GUG: 'V',
  GCU: 'A',
  GCC: 'A',
  GCA: 'A',
  GCG: 'A',
  GAU: 'D',
  GAC: 'D',
  GAA: 'E',
  GAG: 'E',
  GGU: 'G',
  GGC: 'G',
  GGA: 'G',
  GGG: 'G',
}

export const START_CODON = 'AUG'

/** Ochre, opal, amber. Typed as `readonly string[]` so `.includes(someString)` type-checks. */
export const STOP_CODONS: readonly string[] = ['UAA', 'UGA', 'UAG']

export const RNA_BASES: readonly string[] = ['A', 'U', 'C', 'G']
export const DNA_BASES: readonly string[] = ['A', 'T', 'C', 'G']

/** The 20 proteinogenic residues, one-letter codes, in alphabetical order. */
export const STANDARD_AMINO_ACIDS: readonly string[] = [
  'A',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'K',
  'L',
  'M',
  'N',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'V',
  'W',
  'Y',
]

/**
 * Average (chemical) residue masses in daltons — free amino acid minus one water.
 * A peptide's average mass is the sum of these plus one water for the free termini.
 */
export const AMINO_ACID_AVERAGE_RESIDUE_MASS: Record<string, number> = {
  G: 57.0519,
  A: 71.0788,
  S: 87.0782,
  P: 97.1167,
  V: 99.1326,
  T: 101.1051,
  C: 103.1388,
  L: 113.1594,
  I: 113.1594,
  N: 114.1038,
  D: 115.0886,
  Q: 128.1307,
  K: 128.1741,
  E: 129.1155,
  M: 131.1926,
  H: 137.1411,
  F: 147.1766,
  R: 156.1875,
  Y: 163.176,
  W: 186.2132,
}

/** Monoisotopic residue masses in daltons — the same table for the most abundant isotopes. */
export const AMINO_ACID_MONOISOTOPIC_RESIDUE_MASS: Record<string, number> = {
  G: 57.02146,
  A: 71.03711,
  S: 87.03203,
  P: 97.05276,
  V: 99.06841,
  T: 101.04768,
  C: 103.00919,
  L: 113.08406,
  I: 113.08406,
  N: 114.04293,
  D: 115.02694,
  Q: 128.05858,
  K: 128.09496,
  E: 129.04259,
  M: 131.04049,
  H: 137.05891,
  F: 147.06841,
  R: 156.10111,
  Y: 163.06333,
  W: 186.07931,
}

/** Terminal correction for a peptide: the H on the N-terminus plus the OH on the C-terminus. */
export const WATER_AVERAGE_MASS = 18.0153
export const WATER_MONOISOTOPIC_MASS = 18.010565

/**
 * Average mass of a chain-internal ribonucleotide residue: the nucleoside 5'-monophosphate minus
 * one water. Despite the name these are *residue* masses, not the free monophosphate — the free
 * AMP is 347.22, and 347.22 - 18.02 = 329.21. The name is kept because that is what the constant
 * is called in the oligo-chemistry literature this table comes from.
 */
export const RIBONUCLEOTIDE_MONOPHOSPHATE_MASS: Record<string, number> = {
  A: 329.21,
  U: 306.17,
  C: 305.18,
  G: 345.21,
}

/** Same convention for cDNA: deoxynucleoside 5'-monophosphate minus one water. */
export const DEOXYRIBONUCLEOTIDE_MONOPHOSPHATE_MASS: Record<string, number> = {
  A: 313.21,
  T: 304.2,
  C: 289.18,
  G: 329.21,
}

/**
 * Atom counts of one chain-internal residue, so the oligo's molecular formula can be built
 * exactly rather than estimated. Derived by taking the nucleoside 5'-monophosphate and removing
 * one water: e.g. AMP C10H14N5O7P minus H2O gives C10H12N5O6P.
 */
export const RIBONUCLEOTIDE_RESIDUE_FORMULA: Record<string, Record<string, number>> = {
  A: { C: 10, H: 12, N: 5, O: 6, P: 1 },
  U: { C: 9, H: 11, N: 2, O: 8, P: 1 },
  C: { C: 9, H: 12, N: 3, O: 7, P: 1 },
  G: { C: 10, H: 12, N: 5, O: 7, P: 1 },
}

export const DEOXYRIBONUCLEOTIDE_RESIDUE_FORMULA: Record<string, Record<string, number>> = {
  A: { C: 10, H: 12, N: 5, O: 5, P: 1 },
  T: { C: 10, H: 13, N: 2, O: 7, P: 1 },
  C: { C: 9, H: 12, N: 3, O: 6, P: 1 },
  G: { C: 10, H: 12, N: 5, O: 6, P: 1 },
}

/** Metaphosphate unit, HPO3. Every terminal correction below is built from this plus water. */
export const HPO3_AVERAGE_MASS = 79.9799

/**
 * Terminal corrections, all applied to the *sum of residue masses*. Stating the baseline matters:
 * "+159 for a triphosphate" is only meaningful once you say what it is added to.
 *
 *   fivePrimeHydroxyl      = + H2O - HPO3   = -61.9646  (a synthetic oligo, 5'-OH / 3'-OH)
 *   fivePrimeMonophosphate = + H2O          = +18.0153
 *   fivePrimeTriphosphate  = + H2O + 2xHPO3 = +177.9751 (i.e. +159.9598 over the monophosphate,
 *                                                        the "add ~159" rule of thumb)
 *
 * The default everywhere in this engine is `five-prime-hydroxyl`, because the sequences RNAwiki
 * stores are synthetic siRNA/ASO strands, which are made 5'-OH. An in-vitro-transcribed mRNA is
 * 5'-triphosphate before capping; pass the terminus explicitly when that is what is meant.
 */
export type NucleicAcidTerminus =
  | 'five-prime-hydroxyl'
  | 'five-prime-monophosphate'
  | 'five-prime-triphosphate'

export const TERMINUS_MASS_CORRECTION: Record<NucleicAcidTerminus, number> = {
  'five-prime-hydroxyl': WATER_AVERAGE_MASS - HPO3_AVERAGE_MASS,
  'five-prime-monophosphate': WATER_AVERAGE_MASS,
  'five-prime-triphosphate': WATER_AVERAGE_MASS + 2 * HPO3_AVERAGE_MASS,
}

/** Atom-count form of the same three corrections: H2O is H2O1, HPO3 is H1P1O3. */
const TERMINUS_ATOM_CORRECTION: Record<NucleicAcidTerminus, Record<string, number>> = {
  'five-prime-hydroxyl': { H: 2 - 1, O: 1 - 3, P: -1 },
  'five-prime-monophosphate': { H: 2, O: 1 },
  'five-prime-triphosphate': { H: 2 + 2, O: 1 + 6, P: 2 },
}

export const DEFAULT_TERMINUS: NucleicAcidTerminus = 'five-prime-hydroxyl'

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/**
 * Average molecular weight of a single-stranded oligonucleotide from its base composition.
 * Returns `null` for an empty composition rather than 0, so a caller cannot mistake "no sequence"
 * for "a molecule that weighs nothing".
 */
export function nucleicAcidAverageMass(
  counts: Record<string, number>,
  isDna = false,
  terminus: NucleicAcidTerminus = DEFAULT_TERMINUS,
): number | null {
  const table = isDna ? DEOXYRIBONUCLEOTIDE_MONOPHOSPHATE_MASS : RIBONUCLEOTIDE_MONOPHOSPHATE_MASS
  let total = 0
  let residues = 0
  for (const base of Object.keys(counts)) {
    const n = counts[base] ?? 0
    if (n === 0) continue
    const mass = table[base]
    // An unknown base makes the total meaningless, and a partial total is worse than no total.
    if (mass === undefined) return null
    total += mass * n
    residues += n
  }
  if (residues === 0) return null
  return roundTo(total + TERMINUS_MASS_CORRECTION[terminus], 2)
}

/**
 * Exact atom counts for the same oligo, ready for Hill-notation formatting. `null` on an unknown
 * base, for the same reason as above.
 */
export function nucleicAcidAtomCounts(
  counts: Record<string, number>,
  isDna = false,
  terminus: NucleicAcidTerminus = DEFAULT_TERMINUS,
): Record<string, number> | null {
  const table = isDna ? DEOXYRIBONUCLEOTIDE_RESIDUE_FORMULA : RIBONUCLEOTIDE_RESIDUE_FORMULA
  const atoms: Record<string, number> = {}
  let residues = 0
  for (const base of Object.keys(counts)) {
    const n = counts[base] ?? 0
    if (n === 0) continue
    const residue = table[base]
    if (residue === undefined) return null
    for (const element of Object.keys(residue)) {
      atoms[element] = (atoms[element] ?? 0) + (residue[element] ?? 0) * n
    }
    residues += n
  }
  if (residues === 0) return null
  const correction = TERMINUS_ATOM_CORRECTION[terminus]
  for (const element of Object.keys(correction)) {
    atoms[element] = (atoms[element] ?? 0) + (correction[element] ?? 0)
  }
  return atoms
}

/**
 * Average mass of a linear peptide from its one-letter sequence. `null` if any residue is outside
 * the 20 standard codes — a modified or non-standard residue has a mass we have not been told.
 */
export function peptideAverageMass(residues: string): number | null {
  if (residues.length === 0) return null
  let total = 0
  for (const residue of residues) {
    const mass = AMINO_ACID_AVERAGE_RESIDUE_MASS[residue]
    if (mass === undefined) return null
    total += mass
  }
  return roundTo(total + WATER_AVERAGE_MASS, 4)
}

/** Monoisotopic counterpart of `peptideAverageMass`. */
export function peptideMonoisotopicMass(residues: string): number | null {
  if (residues.length === 0) return null
  let total = 0
  for (const residue of residues) {
    const mass = AMINO_ACID_MONOISOTOPIC_RESIDUE_MASS[residue]
    if (mass === undefined) return null
    total += mass
  }
  return roundTo(total + WATER_MONOISOTOPIC_MASS, 5)
}

/** Transcribe a cDNA strand to its RNA equivalent. Only T -> U; the rest of the alphabet is shared. */
export function transcribeDnaToRna(sequence: string): string {
  return sequence.replace(/T/g, 'U')
}

export function isStopCodon(codon: string): boolean {
  return STOP_CODONS.includes(codon)
}

/**
 * Single codon lookup. Returns `undefined` for anything that is not one of the 64 RNA codons,
 * so callers must decide what an unknown codon means rather than silently receiving a residue.
 */
export function translateCodon(codon: string): string | undefined {
  return STANDARD_GENETIC_CODE[codon]
}

export interface TranslationResult {
  /** Residues produced before the first stop. `X` marks a codon outside the 64 (bad input). */
  peptide: string
  /** 0-based index of the first base of the terminating stop codon, or `null` if none was hit. */
  stopIndex: number | null
}

/**
 * Translate from index 0 in frame, stopping at the first stop codon.
 *
 * Expects an uppercase A/U/C/G string — feed cDNA through `transcribeDnaToRna` first. A trailing
 * partial codon is ignored rather than padded: two dangling bases encode nothing.
 */
export function translate(sequence: string): TranslationResult {
  let peptide = ''
  for (let i = 0; i + 3 <= sequence.length; i += 3) {
    const codon = sequence.slice(i, i + 3)
    if (isStopCodon(codon)) {
      return { peptide, stopIndex: i }
    }
    peptide += translateCodon(codon) ?? 'X'
  }
  return { peptide, stopIndex: null }
}

export interface OpenReadingFrame {
  /** 0-based index of the A of the first AUG. */
  start: number
  /**
   * Exclusive 0-based end. When an in-frame stop was found this is one past the stop codon, so
   * `end - start` is the full ORF length in nucleotides including the stop. When no in-frame stop
   * exists the frame is open and `end` is one past the last complete codon.
   */
  end: number
  peptide: string
}

/**
 * First AUG to the first in-frame stop.
 *
 * The AUG is searched for at any offset, not only in frame 0 — a 5' UTR is normal, and the
 * reference wireframe's own sample sequences are not all triplet-aligned. `null` only when the
 * sequence contains no AUG at all; an AUG with no downstream stop is still a reading frame, just
 * an open one, and saying so is more useful than saying nothing.
 */
export function findOpenReadingFrame(sequence: string): OpenReadingFrame | null {
  const start = sequence.indexOf(START_CODON)
  if (start === -1) return null
  const { peptide, stopIndex } = translate(sequence.slice(start))
  const end = stopIndex === null ? start + peptide.length * 3 : start + stopIndex + 3
  return { start, end, peptide }
}
