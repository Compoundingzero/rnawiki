import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  ENGINE_VERSION,
  runFullDeterministicSweep,
  summariseReport,
  verificationHashFor,
} from '@/lib/rna-intelligence'
import type { Diagnostic } from '@/lib/rna-intelligence'
import type { LaboratoryProtocolStep, ProtocolPhase } from '@/lib/types'

// A 30-nucleotide reading frame, no premature stop: AUG GCA UCC GGC AAC UUC GCA GCA CUG UAA.
const SEQUENCE = 'AUGGCAUCCGGCAACUUCGCAGCACUGUAA'
// One base changed, nothing else: CUG -> CUC in the ninth codon.
const SEQUENCE_ONE_BASE_CHANGED = 'AUGGCAUCCGGCAACUUCGCAGCACUCUAA'

function step(
  id: string,
  stepNumber: number,
  phase: ProtocolPhase,
  dependsOnStepId?: string,
): LaboratoryProtocolStep {
  return {
    id,
    stepNumber,
    phase,
    name: `Step ${id}`,
    description: 'Reaction conditions omitted for the fixture.',
    reagentsAndBuffer: 'Standard buffer (pH 7.4)',
    ...(dependsOnStepId === undefined ? {} : { dependsOnStepId }),
  }
}

const WORKFLOW: LaboratoryProtocolStep[] = [
  step('qc', 1, 'QC'),
  step('synth', 2, 'Synthesis'),
  step('purify', 3, 'Purification'),
]

afterEach(() => {
  vi.useRealTimers()
})

describe('runFullDeterministicSweep', () => {
  it('produces an identical verification hash for identical input', () => {
    const first = runFullDeterministicSweep({
      structureString: SEQUENCE,
      modality: 'mRNA Vaccine / Therapeutic',
      workflow: WORKFLOW,
    })
    const second = runFullDeterministicSweep({
      structureString: SEQUENCE,
      modality: 'mRNA Vaccine / Therapeutic',
      workflow: WORKFLOW,
    })

    expect(first.verificationHash).toBe(second.verificationHash)
    expect(first.verificationHash).toMatch(/^MVS-[0-9A-F]{4}-[0-9A-F]{4}$/)
    expect(first.engineVersion).toBe(ENGINE_VERSION)
  })

  it('produces a different hash when one base of the sequence changes', () => {
    const original = runFullDeterministicSweep({
      structureString: SEQUENCE,
      modality: 'mRNA Vaccine / Therapeutic',
      workflow: WORKFLOW,
    })
    const edited = runFullDeterministicSweep({
      structureString: SEQUENCE_ONE_BASE_CHANGED,
      modality: 'mRNA Vaccine / Therapeutic',
      workflow: WORKFLOW,
    })

    expect(edited.verificationHash).not.toBe(original.verificationHash)
  })

  it('hashes the input and not the clock', () => {
    vi.useFakeTimers()

    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    const first = runFullDeterministicSweep({
      structureString: SEQUENCE,
      modality: 'mRNA Vaccine / Therapeutic',
      workflow: WORKFLOW,
    })

    vi.setSystemTime(new Date('2027-06-15T12:34:56.000Z'))
    const second = runFullDeterministicSweep({
      structureString: SEQUENCE,
      modality: 'mRNA Vaccine / Therapeutic',
      workflow: WORKFLOW,
    })

    expect(first.timestamp).toBe('2026-01-01T00:00:00.000Z')
    expect(second.timestamp).toBe('2027-06-15T12:34:56.000Z')
    expect(second.verificationHash).toBe(first.verificationHash)
  })

  it('accepts the positional call shape and agrees with the object shape', () => {
    const positional = runFullDeterministicSweep(SEQUENCE, 'mRNA Vaccine / Therapeutic', WORKFLOW)
    const objectForm = runFullDeterministicSweep({
      structureString: SEQUENCE,
      modality: 'mRNA Vaccine / Therapeutic',
      workflow: WORKFLOW,
    })

    expect(positional.verificationHash).toBe(objectForm.verificationHash)
    expect(positional.overallPassed).toBe(objectForm.overallPassed)
  })

  it('changes the hash when the workflow changes, not just the sequence', () => {
    const base = runFullDeterministicSweep({
      structureString: SEQUENCE,
      modality: 'mRNA Vaccine / Therapeutic',
      workflow: WORKFLOW,
    })
    const reordered = runFullDeterministicSweep({
      structureString: SEQUENCE,
      modality: 'mRNA Vaccine / Therapeutic',
      // Same three steps, resequenced: a different protocol, so a different badge.
      workflow: [
        step('qc', 1, 'QC'),
        step('purify', 2, 'Purification'),
        step('synth', 3, 'Synthesis'),
      ],
    })
    const shorter = runFullDeterministicSweep({
      structureString: SEQUENCE,
      modality: 'mRNA Vaccine / Therapeutic',
      workflow: [step('qc', 1, 'QC')],
    })

    expect(reordered.verificationHash).not.toBe(base.verificationHash)
    expect(shorter.verificationHash).not.toBe(base.verificationHash)
  })

  it('collects diagnostics from every layer in layer order and splits them by severity', () => {
    const report = runFullDeterministicSweep({
      structureString: SEQUENCE,
      modality: 'mRNA Vaccine / Therapeutic',
      workflow: WORKFLOW,
    })

    const layers = report.diagnostics.map((d) => d.layer)
    expect(layers).toEqual([...layers].sort((a, b) => a - b))
    expect(report.diagnostics).toHaveLength(
      report.layer1.diagnostics.length +
        report.layer2.diagnostics.length +
        report.layer3.diagnostics.length,
    )
    expect(report.errors.every((d) => d.severity === 'error')).toBe(true)
    expect(report.warnings.every((d) => d.severity === 'warning')).toBe(true)
  })

  it('fails overall when Layer 3 finds a cycle, whatever the sequence says', () => {
    const report = runFullDeterministicSweep({
      structureString: SEQUENCE,
      modality: 'mRNA Vaccine / Therapeutic',
      workflow: [step('a', 1, 'Synthesis', 'b'), step('b', 2, 'Purification', 'a')],
    })

    expect(report.overallPassed).toBe(false)
    expect(report.errors.map((d) => d.code)).toContain('L3_CYCLE_DETECTED')
    expect(summariseReport(report).tone).toBe('fail')
  })

  it('warns rather than fails when a record has no documented protocol', () => {
    const report = runFullDeterministicSweep({
      structureString: SEQUENCE,
      modality: 'mRNA Vaccine / Therapeutic',
      workflow: [],
    })

    expect(report.layer3.passed).toBe(true)
    expect(report.warnings.map((d) => d.code)).toContain('L3_NO_WORKFLOW')
    expect(report.errors.map((d) => d.code)).not.toContain('L3_NO_WORKFLOW')
  })

  it('refuses the positional shape without a modality', () => {
    // Only reachable from untyped callers; the point is that it throws rather than inventing one.
    const untyped = runFullDeterministicSweep as unknown as (structure: string) => unknown
    expect(() => untyped(SEQUENCE)).toThrow(TypeError)
  })
})

describe('summariseReport', () => {
  const base = runFullDeterministicSweep({
    structureString: SEQUENCE,
    modality: 'mRNA Vaccine / Therapeutic',
    workflow: WORKFLOW,
  })

  const warning: Diagnostic = {
    layer: 3,
    severity: 'warning',
    code: 'L3_MISSING_PHASES',
    message: 'This protocol documents no step for: Conjugation.',
  }
  const error: Diagnostic = {
    layer: 1,
    severity: 'error',
    code: 'L1_ILLEGAL_CHARACTER',
    message: 'Character "Z" is not a nucleotide.',
  }

  it('reports a clean pass', () => {
    const summary = summariseReport({ ...base, overallPassed: true, errors: [], warnings: [] })

    expect(summary.tone).toBe('pass')
    expect(summary.errorCount).toBe(0)
    expect(summary.warningCount).toBe(0)
    expect(summary.headline.endsWith('.')).toBe(true)
  })

  it('reports a pass carrying warnings', () => {
    const summary = summariseReport({
      ...base,
      overallPassed: true,
      errors: [],
      warnings: [warning],
    })

    expect(summary.tone).toBe('warn')
    expect(summary.warningCount).toBe(1)
    expect(summary.headline).toContain('1 warning')
  })

  it('reports a failure and counts the failing checks', () => {
    const summary = summariseReport({
      ...base,
      overallPassed: false,
      errors: [error, { ...error, code: 'L1_TOO_SHORT' }],
      warnings: [warning],
    })

    expect(summary.tone).toBe('fail')
    expect(summary.errorCount).toBe(2)
    expect(summary.headline).toContain('2 checks failed')
  })
})

describe('verificationHashFor', () => {
  it('does not collide when a field boundary moves', () => {
    // The framing exists for exactly this pair: naive concatenation flattens both to 'AUGCAUG'.
    expect(verificationHashFor(['AUG', 'CAUG'])).not.toBe(verificationHashFor(['AUGC', 'AUG']))
  })
})

describe('structureType overrides modality routing', () => {
  // Modality answers what kind of drug this is. That usually also answers what kind of string was
  // submitted, and stops doing so the moment the two diverge — which they do for any modified
  // peptide recorded as a connection table. Ipamorelin is the real case: a pentapeptide whose
  // residues are three quarters non-proteinogenic, so it is stored as a SMILES. Routed on its
  // modality it reached the peptide branch, which counted three standard letters in a SMILES
  // string and rejected the structure as a two-residue backbone.
  const IPAMORELIN_SMILES =
    'CC(C)(C(=O)N[C@@H](CC1=CN=CN1)C(=O)N[C@H](CC2=CC3=CC=CC=C3C=C2)C(=O)N[C@H](CC4=CC=CC=C4)C(=O)N[C@@H](CCCCN)C(=O)N)N'

  it('recovers a peptide-modality SMILES even with no structureType given', () => {
    const report = runFullDeterministicSweep({
      structureString: IPAMORELIN_SMILES,
      modality: 'Peptide / GLP-1 Agonist',
      workflow: [],
    })

    // Layer 1 used to route on modality alone, send this to the peptide branch, find the three
    // characters in a SMILES that happen to be one-letter residue codes and call it a backbone.
    // It now reads the brackets and stereochemistry markers, recognises a connection table, and
    // says so instead of answering a question nobody asked.
    expect(report.layer1.structureType).toBe('small_molecule_smiles')
    expect(report.layer1.chemicalFormula).toBe('C38H49N9O5')
    expect(report.diagnostics.map((d) => d.code)).toContain('L1_STRUCTURE_TYPE_CORRECTED')
  })

  it('accepts the same string when the record states its structure type', () => {
    const report = runFullDeterministicSweep({
      structureString: IPAMORELIN_SMILES,
      modality: 'Peptide / GLP-1 Agonist',
      workflow: [],
      structureType: 'small_molecule_smiles',
    })

    expect(report.layer1.structureType).toBe('small_molecule_smiles')
    expect(report.layer1.chemicalFormula).toBe('C38H49N9O5')
    expect(report.overallPassed).toBe(true)
  })
})
