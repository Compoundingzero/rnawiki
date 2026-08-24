// RNA Intelligence — public API.
//
// Callers import from '@/lib/rna-intelligence' and nothing else. The three layer modules are
// implementation detail: an edit form, an API route and a seed script must all sweep an input the
// same way, and that only stays true while there is one entry point to sweep it through.

import type { DrugModality, LaboratoryProtocolStep } from '@/lib/types'
import type { Diagnostic, RnaIntelligenceReport, SweepInput } from './types'
import { validateLayer1 } from './layer1-sequence'
import { validateLayer2 } from './layer2-structure'
import { validateLayer3 } from './layer3-protocol'
import { verificationHashFor } from './hash'

export * from './types'
export * from './evidence-types'
export { runEvidenceIntelligence } from './evidence-engine'
export { validateLayer1 } from './layer1-sequence'
export { validateLayer2 } from './layer2-structure'
export { validateLayer3, CANONICAL_PHASE_ORDER } from './layer3-protocol'
export { verificationHashFor, fnv1a64 } from './hash'

/**
 * Identifies the parameter set a stored hash was produced under. It belongs in the hash input, not
 * beside it: a badge computed under Turner 2004 nearest-neighbour parameters and one computed under
 * a future revision must not be able to collide, or a record would look verified against rules that
 * no longer exist. Bump this whenever a layer's output changes for unchanged input.
 */
export const ENGINE_VERSION = 'rna-intelligence/1.1.0+turner2004'

export function runFullDeterministicSweep(input: SweepInput): RnaIntelligenceReport
export function runFullDeterministicSweep(
  structureString: string,
  modality: DrugModality,
  workflow: LaboratoryProtocolStep[],
): RnaIntelligenceReport
/** Run all Group A layers. The object form also carries cDNA mode. */
export function runFullDeterministicSweep(
  inputOrStructure: SweepInput | string,
  modality?: DrugModality,
  workflow?: LaboratoryProtocolStep[],
): RnaIntelligenceReport {
  let input: SweepInput
  if (typeof inputOrStructure === 'string') {
    if (modality === undefined) {
      // Reachable only from JavaScript or a cast. Throwing beats defaulting: a sweep run against a
      // modality nobody chose would produce a verification badge nobody can reproduce.
      throw new TypeError(
        'runFullDeterministicSweep(structureString, modality, workflow): modality is required',
      )
    }
    // An absent workflow is a legitimate state (an undocumented protocol on a stub record), so it
    // becomes an empty array and Layer 3 warns. An absent modality is not.
    input = { structureString: inputOrStructure, modality, workflow: workflow ?? [] }
  } else {
    input = inputOrStructure
  }

  const steps = input.workflow
  const layer1 = validateLayer1(
    input.structureString,
    input.modality,
    input.cdnaMode ?? false,
    input.structureType,
  )
  const layer2 = validateLayer2(layer1)
  const layer3 = validateLayer3(steps)

  // Layer order, then within a layer the order that layer emitted. The list is read top to bottom
  // by a contributor fixing an edit, and a finding about the sequence should precede a finding
  // about the protocol that consumes it.
  const diagnostics: Diagnostic[] = [
    ...layer1.diagnostics,
    ...layer2.diagnostics,
    ...layer3.diagnostics,
  ]
  const errors = diagnostics.filter((d) => d.severity === 'error')
  const warnings = diagnostics.filter((d) => d.severity === 'warning')

  // Both halves matter. A layer's `passed` is its own summary judgement; `errors.length === 0`
  // catches the case where a layer emits an error diagnostic and still returns passed — the
  // diagnostic is the evidence, so it wins.
  const overallPassed = layer1.passed && layer2.passed && layer3.passed && errors.length === 0

  // HASH INPUT — input only, never output, never the clock. Deriving it from the report would
  // make the badge change whenever a diagnostic's wording is improved, silently invalidating every
  // stored badge; deriving it from the timestamp would make it unverifiable by definition.
  //
  // Every workflow field validated by Layer 3 goes in, in submitted order. Hashing only ids and
  // phases would let a dependency, step number, condition, or reagent change while retaining the
  // old verification badge. `verificationHashFor` length-prefixes each part, so empty optional
  // fields and neighbouring values cannot be framed ambiguously.
  const stepParts: string[] = []
  for (const step of steps) {
    stepParts.push(
      step.id,
      String(step.stepNumber),
      step.phase,
      step.name,
      step.description,
      step.dependsOnStepId ?? '',
      step.reagentsAndBuffer,
    )
  }
  const verificationHash = verificationHashFor([
    ENGINE_VERSION,
    layer1.structureType,
    layer1.cleanedInput,
    input.modality,
    input.cdnaMode ? 'cdna-mode:on' : 'cdna-mode:off',
    String(steps.length),
    ...stepParts,
  ])

  return {
    overallPassed,
    verificationHash,
    engineVersion: ENGINE_VERSION,
    // Metadata: when this sweep ran. It is recorded beside the hash and never inside it.
    timestamp: new Date().toISOString(),
    layer1,
    layer2,
    layer3,
    diagnostics,
    errors,
    warnings,
  }
}

/**
 * One sentence and a tone for the banner above the diagnostic list. Kept here rather than in a
 * component so the editor modal, the review queue and the API all describe the same report the same
 * way.
 */
export function summariseReport(report: RnaIntelligenceReport): {
  headline: string
  tone: 'pass' | 'warn' | 'fail'
  errorCount: number
  warningCount: number
} {
  const errorCount = report.errors.length
  const warningCount = report.warnings.length

  if (!report.overallPassed) {
    const headline =
      errorCount > 0
        ? `${errorCount} ${errorCount === 1 ? 'check' : 'checks'} failed, so this edit cannot carry a verification badge yet.`
        : 'A validation layer rejected this edit without naming a specific failing check.'
    return { headline, tone: 'fail', errorCount, warningCount }
  }

  if (warningCount > 0) {
    return {
      headline: `Every check passed, with ${warningCount} ${warningCount === 1 ? 'warning' : 'warnings'} worth reading before you publish.`,
      tone: 'warn',
      errorCount,
      warningCount,
    }
  }

  return {
    headline: 'Every check passed: sequence, structure and laboratory protocol are all consistent.',
    tone: 'pass',
    errorCount,
    warningCount,
  }
}
