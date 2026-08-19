// RNA Intelligence — the deterministic validation pipeline.
//
// The contract in this file is the whole point of the engine: every proposed edit is swept by the
// same three layers, in the same order, with the same parameters, and the result is reproducible
// from the input alone. No generative model is involved anywhere in this directory, and none may
// be introduced: a diagnostic that cannot be recomputed byte-for-byte from the submitted structure
// is not a diagnostic, it is an opinion.
//
// Layer 1  Mathematical and string sequence validation.
// Layer 2  Topological and base-pairing verification (thermodynamics).
// Layer 3  Laboratory protocol workflow validation (directed acyclic graph).

import type { DrugModality, LaboratoryProtocolStep, StructureType } from '@/lib/types'

export type DiagnosticSeverity = 'pass' | 'warning' | 'error'

/**
 * One machine-checked finding. `code` is stable and greppable; `message` is what the contributor
 * reads when an edit is rejected, so it states the rule and the observed value, never a guess.
 */
export interface Diagnostic {
  layer: 1 | 2 | 3
  severity: DiagnosticSeverity
  code: string
  message: string
  /** 1-based position in the submitted string, when the finding is positional. */
  position?: number
}

export interface BaseCounts {
  A: number
  U: number
  C: number
  G: number
  illegal: number
}

export interface Layer1Result {
  passed: boolean
  structureType: StructureType
  /** The input after legal-character enforcement. This is what Layer 2 consumes. */
  cleanedInput: string
  /** Present only for nucleotide input. Identical to `cleanedInput` in that case. */
  cleanedSequence?: string
  originalLength: number
  validLength: number

  baseCounts?: BaseCounts
  gcContentPercent?: number

  /** Exact, computed from composition — never estimated by string length. */
  molecularWeightEstimate?: string
  molecularWeightDaltons?: number
  chemicalFormula?: string

  /** Thymine occurrences transcribed to uracil, reported rather than silently swallowed. */
  transcribedThymineCount?: number

  illegalChars: string[]

  // Coding-sequence checks. Undefined when the structure is not a nucleotide sequence.
  isMultipleOfThree?: boolean
  hasStartCodon?: boolean
  hasStopCodon?: boolean
  /** Codons from the first AUG to the first in-frame stop. Empty when no ORF is found. */
  openReadingFrameLength?: number
  translatedPeptide?: string
  /** A stop codon inside the reading frame that is not the terminal one. */
  prematureStopAt?: number

  // Peptide checks.
  aminoAcidCount?: number
  nonStandardResidues?: string[]

  // SMILES checks.
  atomCounts?: Record<string, number>
  ringClosures?: number
  unmatchedRingBonds?: number[]

  diagnostics: Diagnostic[]
}

export interface Layer2Result {
  passed: boolean

  // Nucleotide.
  complementaryStrand?: string
  reverseComplement?: string
  watsonCrickPairs?: number
  wobblePairs?: number
  /** Total base pairs in the predicted minimum-free-energy secondary structure. */
  pairedBases?: number
  /** Dot-bracket notation of the MFE fold. */
  secondaryStructureNotation?: string
  /** Minimum free energy in kcal/mol at 37 degrees C, Turner 2004 nearest-neighbour parameters. */
  mfeDeltaG?: number
  /** Longest run of consecutive paired bases — the dominant helix. */
  longestHelix?: number
  hairpinLoopCount?: number

  // Small molecule.
  logP?: number
  topologicalPolarSurfaceArea?: number
  hydrogenBondDonors?: number
  hydrogenBondAcceptors?: number
  rotatableBonds?: number
  lipinskiViolations?: number
  lipinskiCompliant?: boolean

  // Peptide / biologic.
  isoelectricPoint?: number
  netChargeAtPh7?: number
  hydrophobicResidueFraction?: number

  thermodynamicallyPlausible: boolean
  diagnostics: Diagnostic[]
}

export interface ProtocolGraphEdge {
  from: string
  to: string
}

export interface Layer3Result {
  passed: boolean
  isDagValid: boolean
  totalSteps: number
  /** Kahn's-algorithm order. Empty when a cycle makes the graph unorderable. */
  topologicalOrder: string[]
  /** Step ids that form a dependency cycle. */
  cycleMembers: string[]
  /** `dependsOnStepId` values pointing at a step that is not in the workflow. */
  danglingDependencies: string[]
  /** Steps no other step depends on and which depend on nothing — orphans in a multi-step graph. */
  orphanSteps: string[]
  brokenDependencies: string[]
  /** Canonical phases absent from a workflow that claims to be complete. */
  missingPhases: string[]
  edges: ProtocolGraphEdge[]
  diagnostics: Diagnostic[]
}

export interface RnaIntelligenceReport {
  overallPassed: boolean
  /** Deterministic FNV-1a digest of the swept input. Same input, same hash, every time. */
  verificationHash: string
  /** Parameter-set identifier, so an old hash can be told apart from a new one. */
  engineVersion: string
  timestamp: string
  layer1: Layer1Result
  layer2: Layer2Result
  layer3: Layer3Result
  /** Every diagnostic from all three layers, in layer order. */
  diagnostics: Diagnostic[]
  errors: Diagnostic[]
  warnings: Diagnostic[]
}

export interface SweepInput {
  structureString: string
  modality: DrugModality
  workflow: LaboratoryProtocolStep[]
  /**
   * When true, thymine is legal and the input is validated as cDNA rather than RNA.
   * Off by default: the platform stores RNA, and a silent T is a data-entry error worth surfacing.
   */
  cdnaMode?: boolean
}
