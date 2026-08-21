// Layer 1 — mathematical and string sequence validation.
//
// Same modality routing as the master reference wireframe (src/utils/rnaIntelligenceEngine.ts),
// same shape of answer, but every number here is computed rather than estimated. The wireframe
// guessed a small molecule's mass at `length * 14.2 + 80` and every antibody's at 148 kDa; those
// are placeholders that read as facts, which is exactly the failure mode this product exists to
// call out. Where a value cannot be derived from the submitted string, this layer says so in a
// diagnostic and leaves the field undefined.

import type { DrugModality, StructureType } from '@/lib/types'
import type { BaseCounts, Diagnostic, DiagnosticSeverity, Layer1Result } from './types'
import {
  findOpenReadingFrame,
  nucleicAcidAtomCounts,
  nucleicAcidAverageMass,
  peptideAverageMass,
  STANDARD_AMINO_ACIDS,
  STOP_CODONS,
  START_CODON,
  transcribeDnaToRna,
} from './genetic-code'
import { hillFormula, parseSmiles } from './smiles'

/** Shortest sequence Layer 1 will accept as a real oligonucleotide. Matches the reference. */
export const MIN_NUCLEOTIDE_LENGTH = 12

/** Shortest sequence Layer 1 will accept as a real peptide backbone. Matches the reference. */
/**
 * Two, not five.
 *
 * The floor existed to reject noise, but the alphabet check already does that: a string of random
 * letters fails on its non-standard residues, not on its length. What five actually rejected was
 * real drugs — epitalon is the tetrapeptide Ala-Glu-Asp-Gly and carnosine is a dipeptide, and both
 * are in this corpus. A dipeptide is a peptide.
 */
export const MIN_PEPTIDE_LENGTH = 2

/** Shortest descriptor Layer 1 will accept for a biologic. Matches the reference. */
export const MIN_DESCRIPTOR_LENGTH = 3

/**
 * Below this length a nucleotide sequence is an oligonucleotide — an siRNA guide strand, an ASO —
 * and reading-frame questions do not apply to it. The frame fields are still computed and
 * returned; only the *diagnostics* are gated, so that a 21-mer siRNA is not flagged three times
 * for lacking a start codon it was never meant to have. 60 nt is the shortest length at which a
 * construct plausibly carries a coding sequence (a 20-residue peptide inside a start and stop).
 */
export const CODING_FRAME_MIN_LENGTH = 60

const WHITESPACE_OR_SEPARATOR = new Set([' ', '\t', '\n', '\r', '\f', '\v', '-'])

/**
 * Separates the chains of a multi-chain peptide.
 *
 * Insulin is two chains held together by disulfide bonds and cannot be written as one
 * uninterrupted string. This corpus records it as "A-chain GIVEQ… | B-chain FVNQH…", which a
 * parser reading one residue at a time saw as an illegal '|' followed by an illegal 'B'. Chains
 * are a property of real peptides, not a formatting quirk: the separator and any chain label are
 * removed before the residues are read, and the chain count is reported.
 */
const CHAIN_SEPARATORS = /[|/;+]/
/**
 * A chain label must announce itself. The bare-letter alternative this pattern used to carry
 * ("A", "B") matched the first residue of any sequence that happened to start with one — epitalon
 * AEDG lost its alanine and came back a tripeptide. A label is now only a label when it says
 * "chain" or ends in a colon or full stop.
 */
const CHAIN_LABEL = /^\s*(?:[A-Za-z]\s*-?\s*chain|chain\s*[A-Za-z]?|[A-Za-z]\s*[:.])\s*[:.]?\s*/i

/** Splits a peptide string into chains and strips each chain's label. */
export function splitPeptideChains(sequence: string): string[] {
  return sequence
    .split(CHAIN_SEPARATORS)
    .map((chain) => chain.replace(CHAIN_LABEL, '').trim())
    .filter((chain) => chain.length > 0)
}

function diagnostic(
  severity: DiagnosticSeverity,
  code: string,
  message: string,
  position?: number,
): Diagnostic {
  return position === undefined
    ? { layer: 1, severity, code, message }
    : { layer: 1, severity, code, message, position }
}

/** Thousands separators without Intl, whose grouping depends on the runtime's ICU build. */
function groupThousands(value: string): string {
  const parts = value.split('.')
  const whole = parts[0] ?? ''
  const fraction = parts[1]
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return fraction === undefined ? grouped : `${grouped}.${fraction}`
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/**
 * Modality routing, in the reference's order. Nucleotide is tested first because
 * 'siRNA (Small Interfering RNA)' and 'mRNA Vaccine / Therapeutic' both contain 'RNA' and would
 * otherwise be caught by a broader test later in the chain.
 */
export function structureTypeForModality(modality: DrugModality): StructureType {
  if (
    modality.includes('RNA') ||
    modality.includes('siRNA') ||
    modality.includes('ASO') ||
    modality.includes('mRNA') ||
    modality.includes('CRISPR')
  ) {
    return 'rna_sequence'
  }
  if (modality.includes('Small Molecule') || modality.includes('Nutraceutical')) {
    return 'small_molecule_smiles'
  }
  if (modality.includes('Peptide') || modality.includes('GLP-1')) {
    return 'peptide_sequence'
  }
  return 'antibody_structure'
}

/**
 * Layer 1 entry point.
 *
 * `cdnaMode` flips the legal alphabet: off (the default) the sequence is RNA, thymine is a
 * data-entry error and is transcribed to uracil with a warning; on, the sequence is cDNA, thymine
 * is legal and uracil is the illegal symbol. The structure type stays `rna_sequence` either way —
 * the published `StructureType` union has no DNA member and inventing one here would break the
 * contract other layers and the database read against.
 */
/**
 * Works out what a structure string actually IS, regardless of what it was labelled.
 *
 * Three real drugs have now been rejected for the same reason: a cyclic or modified peptide —
 * desmopressin, ipamorelin, bivalirudin — cannot be written as one-letter residues, so it is
 * recorded as a connection table while the record still says `peptide_sequence`. Routed on the
 * label, the peptide branch reads the brackets and stereochemistry markers as illegal residues and
 * refuses a perfectly good molecule.
 *
 * A connection table is unmistakable: bracket atoms, stereochemistry markers, bond symbols, ring
 * digits. None of those appear in a residue sequence. Where the content is that clear the content
 * wins, and the mismatch is reported rather than swallowed, so whoever wrote the record can fix the
 * label.
 */
export function detectStructureType(raw: string): StructureType | null {
  const trimmed = raw.trim()
  if (trimmed.length < MIN_DESCRIPTOR_LENGTH) return null

  // Bracket atoms, stereochemistry markers and bond symbols. These are the only characters that
  // cannot appear in a residue sequence.
  //
  // Digits and parentheses are NOT among them, and an earlier version of this that treated them as
  // evidence broke semaglutide: its side-chain conjugate is written
  // "K(AEEAc-AEEAc-gamma-Glu-17-carboxyheptadecanoyl)", which has both. A rule that misreads the
  // reference implementation's own worked example is a rule that is wrong.
  if (/[[\]@=#]/.test(trimmed)) return 'small_molecule_smiles'

  return null
}

export function validateLayer1(
  rawStructure: string,
  modality: DrugModality,
  cdnaMode = false,
  /**
   * Overrides the routing that modality would otherwise imply.
   *
   * Modality answers "what kind of drug is this", and for most records that also answers "what
   * kind of string is this". It stops answering the second question the moment the two diverge,
   * and they diverge for real molecules: ipamorelin is a pentapeptide whose residues are three
   * quarters non-proteinogenic, so it is recorded as a connection table rather than a shorthand
   * no parser could read. Routed on modality it went to the peptide branch, which counted three
   * standard letters in a SMILES string and rejected the structure as too short.
   *
   * When a record states its own structureType, that is a fact about the string in front of us
   * and it wins.
   */
  structureTypeOverride?: StructureType,
): Layer1Result {
  const declared = structureTypeOverride ?? structureTypeForModality(modality)
  const detected = detectStructureType(rawStructure)

  // The content overrules the label, but only when the content is unambiguous and only when the two
  // actually disagree.
  const structureType =
    detected && detected !== declared && declared !== 'small_molecule_smiles' ? detected : declared
  const typeWasCorrected = structureType !== declared
  const trimmed = rawStructure.trim()
  // Positions in diagnostics are 1-based indices into `rawStructure`, so a UI can highlight the
  // character the contributor actually typed rather than an offset into some cleaned copy.
  const offset = rawStructure.length - rawStructure.trimStart().length

  if (trimmed.length === 0) {
    return {
      passed: false,
      structureType,
      cleanedInput: '',
      originalLength: rawStructure.length,
      validLength: 0,
      illegalChars: [],
      diagnostics: [
        diagnostic('error', 'L1_STRUCTURE_EMPTY', 'No structure was supplied to validate.'),
      ],
    }
  }

  const result = ((): Layer1Result => {
    switch (structureType) {
      case 'rna_sequence':
        return validateNucleotide(rawStructure, trimmed, offset, cdnaMode)
      case 'small_molecule_smiles':
        return validateSmiles(rawStructure, trimmed)
      case 'peptide_sequence':
        return validatePeptide(rawStructure, trimmed, offset)
      default:
        return validateDescriptor(rawStructure, trimmed, structureType)
    }
  })()

  // Reported rather than swallowed: the record's label is wrong and somebody should fix it, even
  // though reading the content instead has just saved the structure from a spurious rejection.
  if (typeWasCorrected) {
    result.diagnostics.unshift(
      diagnostic(
        'warning',
        'L1_STRUCTURE_TYPE_CORRECTED',
        `This record calls the structure a ${declared.replace(/_/g, ' ')}, but the text is a ` +
          `${structureType.replace(/_/g, ' ')} and has been read as one. Cyclic and modified ` +
          "peptides are usually recorded this way; correcting the record's structureType would " +
          'remove this notice.',
      ),
    )
  }

  return result
}

// ---------------------------------------------------------------------------
// Nucleotide
// ---------------------------------------------------------------------------

function validateNucleotide(
  rawStructure: string,
  trimmed: string,
  offset: number,
  cdnaMode: boolean,
): Layer1Result {
  const diagnostics: Diagnostic[] = []
  const illegalChars: string[] = []
  const upper = trimmed.toUpperCase()

  const counts: Record<string, number> = { A: 0, U: 0, C: 0, G: 0, T: 0 }
  const legalBases = cdnaMode ? ['A', 'T', 'C', 'G'] : ['A', 'U', 'C', 'G']

  let cleaned = ''
  let illegalCount = 0
  let transcribedThymineCount = 0
  let firstThyminePosition: number | undefined
  // Cleaning drops whitespace and hyphens, so an index into the cleaned sequence no longer lines
  // up with the raw string. This keeps the raw 1-based position of every base that survived, so a
  // finding about codon 14 can still point at the character the contributor typed.
  const rawPositionOfBase: number[] = []

  for (let i = 0; i < upper.length; i++) {
    const char = upper.charAt(i)
    const position = offset + i + 1

    if (WHITESPACE_OR_SEPARATOR.has(char)) continue

    if (legalBases.includes(char)) {
      cleaned += char
      counts[char] = (counts[char] ?? 0) + 1
      rawPositionOfBase.push(position)
      continue
    }

    // Thymine in an RNA sequence is a transcription slip, not a corrupt file: fix it, keep the
    // base, and report the fix. In cDNA mode the same courtesy is not extended to uracil — a U in
    // a cDNA strand is a genuine alphabet error, not a notation habit.
    if (!cdnaMode && char === 'T') {
      cleaned += 'U'
      counts['U'] = (counts['U'] ?? 0) + 1
      transcribedThymineCount++
      rawPositionOfBase.push(position)
      if (firstThyminePosition === undefined) firstThyminePosition = position
      continue
    }

    illegalCount++
    illegalChars.push(`Non-canonical symbol '${char}' at position ${position}`)
    diagnostics.push(
      diagnostic(
        'error',
        'L1_ILLEGAL_CHARACTER',
        `'${char}' is not part of the ${cdnaMode ? 'cDNA (A/T/C/G)' : 'RNA (A/U/C/G)'} alphabet.`,
        position,
      ),
    )
    if (cdnaMode && char === 'U') {
      // Give the contributor the actual fix rather than only the rejection.
      diagnostics.push(
        diagnostic(
          'warning',
          'L1_URACIL_IN_CDNA',
          'Uracil appears in a sequence validated as cDNA. Submit the RNA strand, or replace U with T.',
          position,
        ),
      )
    }
  }

  if (transcribedThymineCount > 0) {
    diagnostics.push(
      diagnostic(
        'warning',
        'L1_THYMINE_TRANSCRIBED',
        `${transcribedThymineCount} thymine ${
          transcribedThymineCount === 1 ? 'base was' : 'bases were'
        } transcribed to uracil. Submit the RNA strand, or validate in cDNA mode.`,
        firstThyminePosition,
      ),
    )
  }

  const validLength = cleaned.length
  const gcCount = (counts['G'] ?? 0) + (counts['C'] ?? 0)
  const gcContentPercent = validLength > 0 ? roundTo((gcCount / validLength) * 100, 1) : 0

  // In cDNA mode the thymine tally is carried in the `U` field: `BaseCounts` has no T member, and
  // adding one would change a published type that the database and Layer 2 both read.
  const baseCounts: BaseCounts = {
    A: counts['A'] ?? 0,
    U: cdnaMode ? (counts['T'] ?? 0) : (counts['U'] ?? 0),
    C: counts['C'] ?? 0,
    G: counts['G'] ?? 0,
    illegal: illegalCount,
  }

  const massComposition: Record<string, number> = cdnaMode
    ? { A: counts['A'] ?? 0, T: counts['T'] ?? 0, C: counts['C'] ?? 0, G: counts['G'] ?? 0 }
    : { A: counts['A'] ?? 0, U: counts['U'] ?? 0, C: counts['C'] ?? 0, G: counts['G'] ?? 0 }
  const molecularWeightDaltons = nucleicAcidAverageMass(massComposition, cdnaMode) ?? undefined
  const atomCounts = nucleicAcidAtomCounts(massComposition, cdnaMode)
  const chemicalFormula = atomCounts === null ? undefined : hillFormula(atomCounts)

  // Codon arithmetic is defined on RNA. A cDNA strand is transcribed for this purpose only; the
  // cleaned sequence handed to Layer 2 keeps the alphabet the contributor submitted.
  const rnaEquivalent = cdnaMode ? transcribeDnaToRna(cleaned) : cleaned
  const isMultipleOfThree = validLength > 0 && validLength % 3 === 0
  const hasStartCodon = rnaEquivalent.startsWith(START_CODON)
  const hasStopCodon = validLength >= 3 && STOP_CODONS.includes(rnaEquivalent.slice(-3))

  const orf = findOpenReadingFrame(rnaEquivalent)
  const openReadingFrameLength = orf === null ? 0 : orf.end - orf.start
  const translatedPeptide = orf === null ? '' : orf.peptide
  // An ORF that ends on a stop codon is three bases longer than its peptide; that is how we know a
  // stop was reached rather than the sequence simply running out.
  const orfEndsOnStop = orf !== null && orf.end - orf.start === orf.peptide.length * 3 + 3
  // Premature only if at least one whole codon follows the stop. One or two ragged trailing bases
  // are a truncated submission, not an internal stop. The reported value is a 1-based position in
  // the *cleaned* sequence, because that is the sequence the reading frame was computed over.
  const prematureStopAt =
    orf !== null && orfEndsOnStop && validLength - orf.end >= 3 ? orf.end - 2 : undefined

  if (validLength === 0) {
    diagnostics.push(
      diagnostic('error', 'L1_SEQUENCE_EMPTY', 'No legal bases remained after cleaning.'),
    )
  } else if (validLength < MIN_NUCLEOTIDE_LENGTH) {
    diagnostics.push(
      diagnostic(
        'error',
        'L1_SEQUENCE_TOO_SHORT',
        `Sequence is ${validLength} nt; Layer 1 requires at least ${MIN_NUCLEOTIDE_LENGTH} nt.`,
      ),
    )
  }

  if (validLength >= CODING_FRAME_MIN_LENGTH) {
    if (!isMultipleOfThree) {
      diagnostics.push(
        diagnostic(
          'warning',
          'L1_FRAME_NOT_TRIPLET',
          `Length ${validLength} nt is not a multiple of three, so the sequence cannot be a complete reading frame.`,
        ),
      )
    }
    if (!hasStartCodon) {
      diagnostics.push(
        diagnostic(
          'warning',
          'L1_NO_START_CODON',
          'Sequence does not open with AUG. Any coding claim rests on an upstream start not shown here.',
        ),
      )
    }
    if (!hasStopCodon) {
      diagnostics.push(
        diagnostic('warning', 'L1_NO_STOP_CODON', 'Sequence does not end on UAA, UGA or UAG.'),
      )
    }
    if (orf === null) {
      diagnostics.push(
        diagnostic(
          'warning',
          'L1_NO_OPEN_READING_FRAME',
          'No AUG anywhere in the sequence, so no reading frame could be opened.',
        ),
      )
    }
  } else if (validLength > 0) {
    diagnostics.push(
      diagnostic(
        'pass',
        'L1_OLIGO_NOT_CODING',
        `At ${validLength} nt this is an oligonucleotide; reading-frame checks were computed but are not treated as findings.`,
      ),
    )
  }

  if (prematureStopAt !== undefined) {
    diagnostics.push(
      diagnostic(
        'warning',
        'L1_PREMATURE_STOP',
        `In-frame stop codon at base ${prematureStopAt} truncates the reading frame ${
          validLength - (prematureStopAt + 2)
        } bases before the end of the sequence.`,
        rawPositionOfBase[prematureStopAt - 1],
      ),
    )
  }

  const passed = illegalCount === 0 && validLength >= MIN_NUCLEOTIDE_LENGTH

  if (passed) {
    diagnostics.push(
      diagnostic(
        'pass',
        'L1_NUCLEOTIDE_PASS',
        `${validLength} nt over the ${cdnaMode ? 'A/T/C/G' : 'A/U/C/G'} alphabet, ` +
          `GC ${gcContentPercent}%` +
          (molecularWeightDaltons === undefined
            ? '.'
            : `, ${groupThousands(molecularWeightDaltons.toFixed(2))} Da.`),
      ),
    )
  }

  const result: Layer1Result = {
    passed,
    structureType: 'rna_sequence',
    cleanedInput: cleaned,
    cleanedSequence: cleaned,
    originalLength: rawStructure.length,
    validLength,
    baseCounts,
    gcContentPercent,
    transcribedThymineCount,
    illegalChars,
    isMultipleOfThree,
    hasStartCodon,
    hasStopCodon,
    openReadingFrameLength,
    translatedPeptide,
    diagnostics,
  }

  if (molecularWeightDaltons !== undefined) {
    result.molecularWeightDaltons = molecularWeightDaltons
    result.molecularWeightEstimate = `${groupThousands(molecularWeightDaltons.toFixed(2))} Da`
  }
  if (chemicalFormula !== undefined && chemicalFormula !== '') {
    result.chemicalFormula = chemicalFormula
  }
  if (prematureStopAt !== undefined) {
    result.prematureStopAt = prematureStopAt
  }

  return result
}

// ---------------------------------------------------------------------------
// Small molecule
// ---------------------------------------------------------------------------

function validateSmiles(rawStructure: string, trimmed: string): Layer1Result {
  const diagnostics: Diagnostic[] = []
  const illegalChars: string[] = []
  // SMILES has no significant whitespace; a pasted string routinely carries a newline.
  const cleaned = trimmed.replace(/\s+/g, '')
  const parsed = parseSmiles(cleaned)

  if (parsed.unbalancedParens) {
    illegalChars.push('Unbalanced parentheses in SMILES string')
    diagnostics.push(
      diagnostic(
        'error',
        'L1_SMILES_UNBALANCED_PARENS',
        'Branch parentheses do not balance, so the connection table cannot be built.',
      ),
    )
  }
  if (parsed.unbalancedBrackets) {
    illegalChars.push('Unbalanced square brackets in SMILES string')
    diagnostics.push(
      diagnostic(
        'error',
        'L1_SMILES_UNBALANCED_BRACKETS',
        'Square brackets do not balance, so at least one atom specification is incomplete.',
      ),
    )
  }
  if (parsed.unmatchedRingBonds.length > 0) {
    illegalChars.push(`Unmatched ring-bond ${parsed.unmatchedRingBonds.join(', ')}`)
    diagnostics.push(
      diagnostic(
        'error',
        'L1_SMILES_UNMATCHED_RING_BOND',
        `Ring-bond ${
          parsed.unmatchedRingBonds.length === 1 ? 'digit' : 'digits'
        } ${parsed.unmatchedRingBonds.join(', ')} never close, so the ring system is not defined.`,
      ),
    )
  }

  // Everything the parser could not account for, verbatim. When the string parsed anyway these are
  // notes (an isotope outside the nuclide table), not defects, so they are downgraded to warnings.
  for (const message of parsed.errors) {
    diagnostics.push(
      diagnostic(parsed.valid ? 'warning' : 'error', 'L1_SMILES_PARSE_ERROR', message),
    )
  }

  if (parsed.heavyAtomCount === 0) {
    diagnostics.push(
      diagnostic('error', 'L1_SMILES_NO_ATOMS', 'No heavy atoms were found in the SMILES string.'),
    )
  }

  const passed = parsed.valid && parsed.heavyAtomCount >= 1

  if (passed) {
    diagnostics.push(
      diagnostic(
        'pass',
        'L1_SMILES_PASS',
        `${parsed.molecularFormula}, ${parsed.heavyAtomCount} heavy atoms, ` +
          `${groupThousands(parsed.molecularWeight.toFixed(2))} g/mol.`,
      ),
    )
  }

  const result: Layer1Result = {
    passed,
    structureType: 'small_molecule_smiles',
    cleanedInput: cleaned,
    originalLength: rawStructure.length,
    validLength: cleaned.length,
    illegalChars,
    atomCounts: parsed.atomCounts,
    ringClosures: parsed.ringClosures,
    unmatchedRingBonds: parsed.unmatchedRingBonds,
    diagnostics,
  }

  // A formula and a mass are only meaningful once the string parsed. Reporting "0.00 g/mol" for a
  // broken SMILES would be a fabricated measurement, which is the one thing this engine must not do.
  if (parsed.valid && parsed.heavyAtomCount > 0) {
    result.chemicalFormula = parsed.molecularFormula
    result.molecularWeightDaltons = parsed.molecularWeight
    result.molecularWeightEstimate = `${groupThousands(parsed.molecularWeight.toFixed(2))} g/mol`
  }

  return result
}

// ---------------------------------------------------------------------------
// Peptide
// ---------------------------------------------------------------------------

interface SideChainModification {
  /** Verbatim text inside the parentheses, case and diacritics preserved. */
  group: string
  /** 1-based index of the backbone residue the group hangs off, 0 if it precedes every residue. */
  residueIndex: number
  residue: string
}

/**
 * `_offset` is unused since chain resolution moved ahead of the residue scan. Positions in this
 * branch now index the residues after chain labels and separators have been removed, because a
 * position pointing into the raw string would name a character that is no longer part of the
 * sequence being read. Kept in the signature so every branch of Layer 1 takes the same arguments.
 */
function validatePeptide(rawStructure: string, trimmed: string, _offset: number): Layer1Result {
  const diagnostics: Diagnostic[] = []
  const illegalChars: string[] = []
  const nonStandardResidues: string[] = []
  const modifications: SideChainModification[] = []

  let backbone = ''
  let depth = 0
  let group = ''
  let nonStandardCount = 0
  let unbalancedParens = false

  // Chains are resolved before residues are read. Insulin's two chains arrive as
  // "A-chain GIVEQ… | B-chain FVNQH…"; read character by character, the separator and the chain
  // letter both look like illegal residues, which is how the most-prescribed biologic in the
  // corpus came to be rejected as malformed.
  const chains = splitPeptideChains(trimmed)
  const scanned = chains.join('')
  const chainCount = chains.length
  if (chainCount > 1) {
    diagnostics.push(
      diagnostic(
        'pass',
        'L1_MULTI_CHAIN_PEPTIDE',
        `Read as ${chainCount} chains. Residue counts and mass cover every chain; the disulfide ` +
          'bonds that join them are not described by a sequence and are not checked here.',
      ),
    )
  }

  for (let i = 0; i < scanned.length; i++) {
    const char = scanned.charAt(i)
    // Positions index the scanned residues rather than the raw string once chain labels have been
    // removed, so a diagnostic points at a residue rather than at an offset that no longer exists.
    const position = i + 1

    if (char === '(') {
      depth++
      if (depth > 1) group += char
      continue
    }

    if (char === ')') {
      if (depth === 0) {
        unbalancedParens = true
        illegalChars.push(`Unmatched closing parenthesis at position ${position}`)
        diagnostics.push(
          diagnostic(
            'error',
            'L1_PEPTIDE_UNBALANCED_PARENS',
            'A modification group closes without opening.',
            position,
          ),
        )
        continue
      }
      depth--
      if (depth === 0) {
        modifications.push({
          group,
          residueIndex: backbone.length,
          residue: backbone.charAt(backbone.length - 1),
        })
        group = ''
      } else {
        group += char
      }
      continue
    }

    // Inside a modification group nothing is validated and nothing is uppercased: 'AEEAc' and the
    // gamma of 'γ-Glu' are the chemist's notation, and mangling them loses the provenance of the
    // conjugate.
    if (depth > 0) {
      group += char
      continue
    }

    if (WHITESPACE_OR_SEPARATOR.has(char)) continue

    const residue = char.toUpperCase()
    if (STANDARD_AMINO_ACIDS.includes(residue)) {
      backbone += residue
      continue
    }

    nonStandardCount++
    nonStandardResidues.push(`non-standard residue '${char}' at position ${position}`)
    illegalChars.push(`Non-standard amino acid code '${char}' at position ${position}`)
    diagnostics.push(
      diagnostic(
        'error',
        'L1_NON_STANDARD_RESIDUE',
        `'${char}' is not one of the 20 standard one-letter amino acid codes.`,
        position,
      ),
    )
  }

  if (depth > 0) {
    unbalancedParens = true
    illegalChars.push(`${depth} unclosed modification group in peptide sequence`)
    diagnostics.push(
      diagnostic(
        'error',
        'L1_PEPTIDE_UNBALANCED_PARENS',
        'A modification group opens and never closes.',
      ),
    )
  }

  for (const modification of modifications) {
    const anchor =
      modification.residueIndex === 0
        ? 'the N-terminus'
        : `residue ${modification.residueIndex} (${modification.residue})`
    nonStandardResidues.push(`side-chain modification at ${anchor}: ${modification.group}`)
    diagnostics.push(
      diagnostic(
        'warning',
        'L1_PEPTIDE_MODIFICATION',
        `Documented conjugate at ${anchor}: ${modification.group}. The backbone is validated and ` +
          'weighed; the mass below excludes this group.',
      ),
    )
  }

  const aminoAcidCount = backbone.length

  if (aminoAcidCount < MIN_PEPTIDE_LENGTH) {
    diagnostics.push(
      diagnostic(
        'error',
        'L1_SEQUENCE_TOO_SHORT',
        `Backbone is ${aminoAcidCount} residues; Layer 1 requires at least ${MIN_PEPTIDE_LENGTH}.`,
      ),
    )
  }

  const mass = peptideAverageMass(backbone)
  const passed = nonStandardCount === 0 && !unbalancedParens && aminoAcidCount >= MIN_PEPTIDE_LENGTH

  if (passed) {
    diagnostics.push(
      diagnostic(
        'pass',
        'L1_PEPTIDE_PASS',
        `${aminoAcidCount} standard residues` +
          (mass === null ? '.' : `, backbone mass ${groupThousands(mass.toFixed(2))} Da.`),
      ),
    )
  }

  const result: Layer1Result = {
    passed,
    structureType: 'peptide_sequence',
    cleanedInput: backbone,
    originalLength: rawStructure.length,
    validLength: aminoAcidCount,
    illegalChars,
    aminoAcidCount,
    nonStandardResidues,
    diagnostics,
  }

  if (mass !== null) {
    result.molecularWeightDaltons = roundTo(mass, 2)
    result.molecularWeightEstimate = `${groupThousands(mass.toFixed(2))} Da (${(
      mass / 1000
    ).toFixed(2)} kDa)`
  }

  return result
}

// ---------------------------------------------------------------------------
// Antibody / biologic / anything else
// ---------------------------------------------------------------------------

function validateDescriptor(
  rawStructure: string,
  trimmed: string,
  structureType: StructureType,
): Layer1Result {
  const diagnostics: Diagnostic[] = []
  const passed = trimmed.length >= MIN_DESCRIPTOR_LENGTH

  if (!passed) {
    diagnostics.push(
      diagnostic(
        'error',
        'L1_STRUCTURE_TOO_SHORT',
        `Descriptor is ${trimmed.length} characters; Layer 1 requires at least ${MIN_DESCRIPTOR_LENGTH}.`,
      ),
    )
  }

  // The reference wireframe printed "~148,000 Da (148 kDa)" for every biologic. That is the
  // textbook mass of a generic IgG, not a measurement of the molecule in front of us, and a
  // stated number is read as a fact. An antibody descriptor is a name or an identifier, not a
  // sequence, so no mass is derivable from it and none is reported.
  diagnostics.push(
    diagnostic(
      'warning',
      'L1_MASS_NOT_DERIVABLE',
      'Molecular weight is not derivable from this descriptor. A mass would need the full heavy and light chain sequences with their glycosylation.',
    ),
  )

  if (passed) {
    diagnostics.push(
      diagnostic(
        'pass',
        'L1_DESCRIPTOR_PASS',
        `Biologic descriptor accepted (${trimmed.length} characters). Structure-level checks do not apply.`,
      ),
    )
  }

  return {
    passed,
    structureType,
    cleanedInput: trimmed,
    originalLength: rawStructure.length,
    validLength: trimmed.length,
    illegalChars: [],
    diagnostics,
  }
}
