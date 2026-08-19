// Layer 3 — laboratory protocol workflow validation.
//
// A protocol is a directed graph: node = step, edge = "this step cannot start until that one
// finished". The reference wireframe approximated this by comparing each step's phase with the
// phase of the step printed above it, which is not a graph check at all — it cannot see a cycle,
// cannot see a dependency pointing at a step that was deleted, and reports a false violation for
// two genuinely parallel branches that happen to be listed in an inconvenient order. This module
// builds the real graph, topologically sorts it with Kahn's algorithm, and checks phase
// progression along each dependency edge rather than along the printed order.
//
// Everything here is a pure function of the steps passed in. No clock, no randomness, no I/O:
// the same workflow yields the same Layer3Result forever, which is what makes the verification
// hash in index.ts meaningful.

import type { LaboratoryProtocolStep, ProtocolPhase } from '@/lib/types'
import type { Diagnostic, Layer3Result, ProtocolGraphEdge } from './types'

/**
 * The order laboratory phases must progress in. Membership matches `PROTOCOL_PHASES` in
 * `lib/types.ts`, but this array is deliberately a separate declaration: `PROTOCOL_PHASES` is the
 * list a form renders, and a UI is entitled to reorder its picker. The engine's ordering is a
 * scientific rule — purified material cannot be fed back into synthesis — so it must not move
 * because a dropdown was rearranged. `PHASE_INDEX` below is the compile-time guard that the two
 * never drift in *membership*: adding a phase to `ProtocolPhase` without listing it here fails to
 * typecheck.
 */
export const CANONICAL_PHASE_ORDER: ProtocolPhase[] = [
  'QC',
  'Synthesis',
  'Purification',
  'Conjugation',
  'Cellular_Delivery',
  'Assay_Quantification',
]

/**
 * Position of each phase in the canonical order. A `Record` over the union rather than a lookup
 * into `CANONICAL_PHASE_ORDER` with `indexOf`, for two reasons: it is exhaustive (a new
 * `ProtocolPhase` breaks the build here, loudly, at the one place that would otherwise silently
 * treat it as unknown), and indexing a `Record` keyed by a finite union returns `number` rather
 * than `number | undefined` under `noUncheckedIndexedAccess`.
 */
const PHASE_INDEX: Record<ProtocolPhase, number> = {
  QC: 0,
  Synthesis: 1,
  Purification: 2,
  Conjugation: 3,
  Cellular_Delivery: 4,
  Assay_Quantification: 5,
}

/**
 * -1 for a phase outside the canonical set. TypeScript says that cannot happen, but these steps
 * arrive from a database row and a contributor's form, so a string that is not a `ProtocolPhase`
 * is reachable at runtime. An unorderable phase is warned about and excluded from the progression
 * check rather than silently sorted to position 0, which would invent a violation.
 */
function phaseIndexOf(phase: ProtocolPhase): number {
  const index: number | undefined = PHASE_INDEX[phase]
  return index === undefined ? -1 : index
}

interface OrderedStep {
  step: LaboratoryProtocolStep
  /** Position in the array as submitted, used to break `stepNumber` ties deterministically. */
  declarationIndex: number
}

/**
 * Steps in declared workflow order: by `stepNumber`, then by submission order when two steps claim
 * the same number. Sorting a freshly mapped array leaves the caller's array untouched, and the
 * explicit tie-break means the result does not depend on the engine's sort being stable.
 */
function inWorkflowOrder(steps: LaboratoryProtocolStep[]): OrderedStep[] {
  return steps
    .map((step, declarationIndex) => ({ step, declarationIndex }))
    .sort((a, b) =>
      a.step.stepNumber === b.step.stepNumber
        ? a.declarationIndex - b.declarationIndex
        : a.step.stepNumber - b.step.stepNumber,
    )
}

function hasDeclaredDependency(step: LaboratoryProtocolStep): boolean {
  return typeof step.dependsOnStepId === 'string' && step.dependsOnStepId.length > 0
}

function emptyResult(diagnostics: Diagnostic[]): Layer3Result {
  return {
    passed: true,
    isDagValid: true,
    totalSteps: 0,
    topologicalOrder: [],
    cycleMembers: [],
    danglingDependencies: [],
    orphanSteps: [],
    brokenDependencies: [],
    missingPhases: [],
    edges: [],
    diagnostics,
  }
}

export function validateLayer3(steps: LaboratoryProtocolStep[]): Layer3Result {
  const diagnostics: Diagnostic[] = []

  // An undocumented protocol is not an invalid protocol. RNAwiki is a wiki: most records start as
  // stubs and gain a workflow later, so an empty workflow warns and passes. Failing here would
  // block every edit to every record that has not been curated yet.
  if (steps.length === 0) {
    diagnostics.push({
      layer: 3,
      severity: 'warning',
      code: 'L3_NO_WORKFLOW',
      message: 'No laboratory protocol is documented for this record, so nothing was verified.',
    })
    return emptyResult(diagnostics)
  }

  const ordered = inWorkflowOrder(steps)
  const totalSteps = ordered.length

  // Missing phases are computed before any early return: "this protocol documents purification
  // only" is useful information even when the graph itself is broken.
  const presentPhases = new Set<ProtocolPhase>(ordered.map(({ step }) => step.phase))
  const missingPhases: string[] = CANONICAL_PHASE_ORDER.filter(
    (phase) => !presentPhases.has(phase),
  )

  // --- Node identity -------------------------------------------------------------------------
  // Duplicate ids make the graph unresolvable rather than merely wrong: an edge naming "step-2"
  // cannot be attached to one of two nodes called "step-2", so in-degree, topological order and
  // phase progression would all be computed against an arbitrary choice. Bail out with the one
  // finding a contributor can act on instead of reporting downstream noise derived from a guess.
  const byId = new Map<string, LaboratoryProtocolStep>()
  const duplicateIds: string[] = []
  for (const { step } of ordered) {
    if (byId.has(step.id)) {
      if (!duplicateIds.includes(step.id)) duplicateIds.push(step.id)
      continue
    }
    byId.set(step.id, step)
  }

  if (duplicateIds.length > 0) {
    for (const id of duplicateIds) {
      diagnostics.push({
        layer: 3,
        severity: 'error',
        code: 'L3_DUPLICATE_STEP_ID',
        message: `Two or more protocol steps share the id "${id}". Step ids must be unique before dependencies can be resolved.`,
      })
    }
    return {
      passed: false,
      isDagValid: false,
      totalSteps,
      topologicalOrder: [],
      cycleMembers: [],
      danglingDependencies: [],
      orphanSteps: [],
      brokenDependencies: duplicateIds.map(
        (id) => `Duplicate step id "${id}" makes the dependency graph unresolvable.`,
      ),
      missingPhases,
      edges: [],
      diagnostics,
    }
  }

  // --- Edges ---------------------------------------------------------------------------------
  // Edge direction is dependency -> dependent: `from` must finish before `to` may start.
  //
  // THE IMPLICIT CHAIN, and why it is decided per workflow rather than per step. A protocol
  // written as a numbered list with no `dependsOnStepId` anywhere is a pipeline whose author
  // expressed the ordering through the numbering; treating it as six disconnected nodes would
  // report every step as an orphan and verify nothing. So when *no* step in the workflow declares
  // a dependency, step n is taken to depend on step n-1 in `stepNumber` order.
  //
  // The moment any step declares one, the author has chosen to describe the graph explicitly and
  // the fallback switches off entirely — a step left without a parent is then a genuine root or a
  // parallel branch, not an omission. Applying the fallback per step instead would be actively
  // wrong: in a workflow where step 1 explicitly depends on step 2, step 2 would implicitly gain a
  // dependency on step 1 and the validator would report a cycle the author never wrote. It would
  // also make `orphanSteps` unreachable, since every step but the first would always have an
  // in-edge.
  const explicitMode = ordered.some(({ step }) => hasDeclaredDependency(step))

  const edges: ProtocolGraphEdge[] = []
  const brokenDependencies: string[] = []
  const danglingDependencies: string[] = []

  if (explicitMode) {
    for (const { step } of ordered) {
      const dependsOn = step.dependsOnStepId
      if (dependsOn === undefined || dependsOn.length === 0) continue

      const predecessor = byId.get(dependsOn)
      if (predecessor === undefined) {
        // Recorded once per distinct missing id in the field, but described once per offending
        // step in `brokenDependencies` — the id alone does not tell the contributor which step to
        // open.
        if (!danglingDependencies.includes(dependsOn)) danglingDependencies.push(dependsOn)
        brokenDependencies.push(
          `Step "${step.name}" depends on step id "${dependsOn}", which is not part of this workflow.`,
        )
        diagnostics.push({
          layer: 3,
          severity: 'error',
          code: 'L3_DANGLING_DEPENDENCY',
          message: `Step "${step.name}" depends on step id "${dependsOn}", which is not part of this workflow. The step it referred to was renamed or deleted.`,
        })
        continue
      }

      // A self-dependency is kept as a self-edge on purpose: it never reaches in-degree zero, so
      // Kahn's algorithm reports it as the one-member cycle it is, with no special case here.
      edges.push({ from: predecessor.id, to: step.id })
    }
  } else {
    for (let i = 1; i < ordered.length; i += 1) {
      const previous = ordered[i - 1]
      const current = ordered[i]
      if (previous === undefined || current === undefined) continue
      edges.push({ from: previous.step.id, to: current.step.id })
    }
  }

  // --- Kahn's algorithm ----------------------------------------------------------------------
  const inDegree = new Map<string, number>()
  const outDegree = new Map<string, number>()
  const successors = new Map<string, string[]>()
  for (const { step } of ordered) {
    inDegree.set(step.id, 0)
    outDegree.set(step.id, 0)
    successors.set(step.id, [])
  }
  for (const edge of edges) {
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1)
    outDegree.set(edge.from, (outDegree.get(edge.from) ?? 0) + 1)
    const list = successors.get(edge.from)
    if (list !== undefined) list.push(edge.to)
  }

  // Seeding the queue in workflow order, and appending successors in edge-construction order,
  // makes the topological order itself deterministic. Kahn's algorithm otherwise admits several
  // valid orders for the same graph, and a hash or a rendered list built on an arbitrary one would
  // change between runs. `head` is an index rather than `shift()`, which is O(n) per call.
  const remainingInDegree = new Map(inDegree)
  const queue: string[] = ordered
    .filter(({ step }) => (remainingInDegree.get(step.id) ?? 0) === 0)
    .map(({ step }) => step.id)
  const topologicalOrder: string[] = []
  let head = 0
  while (head < queue.length) {
    const id = queue[head]
    head += 1
    if (id === undefined) continue
    topologicalOrder.push(id)
    for (const next of successors.get(id) ?? []) {
      const left = (remainingInDegree.get(next) ?? 0) - 1
      remainingInDegree.set(next, left)
      if (left === 0) queue.push(next)
    }
  }

  // Anything still holding an in-degree cannot be scheduled. Strictly this set is the cycle plus
  // everything downstream of it; separating the two needs a strongly-connected-component pass and
  // would not change the answer a contributor needs, which is that none of these steps can be
  // ordered until the loop is broken.
  const cycleMembers: string[] = ordered
    .filter(({ step }) => (remainingInDegree.get(step.id) ?? 0) > 0)
    .map(({ step }) => step.id)

  if (cycleMembers.length > 0) {
    const names = cycleMembers.map((id) => byId.get(id)?.name ?? id)
    diagnostics.push({
      layer: 3,
      severity: 'error',
      code: 'L3_CYCLE_DETECTED',
      message: `These protocol steps depend on each other in a loop and can never be scheduled: ${names.join(', ')}.`,
    })
  }

  // --- Phase progression along dependency edges ----------------------------------------------
  for (const { step } of ordered) {
    if (phaseIndexOf(step.phase) >= 0) continue
    diagnostics.push({
      layer: 3,
      severity: 'warning',
      code: 'L3_UNKNOWN_PHASE',
      message: `Step "${step.name}" declares phase "${String(step.phase)}", which is not one of the canonical laboratory phases. Its ordering was not checked.`,
    })
  }

  let phaseRegressions = 0
  for (const edge of edges) {
    const predecessor = byId.get(edge.from)
    const successor = byId.get(edge.to)
    if (predecessor === undefined || successor === undefined) continue

    const predecessorIndex = phaseIndexOf(predecessor.phase)
    const successorIndex = phaseIndexOf(successor.phase)
    if (predecessorIndex < 0 || successorIndex < 0) continue

    // Equal indices are fine: several steps of one phase in sequence is ordinary. Only moving
    // backwards is a broken protocol.
    if (successorIndex >= predecessorIndex) continue

    phaseRegressions += 1
    const sentence = `Step "${successor.name}" (${successor.phase}) depends on step "${predecessor.name}" (${predecessor.phase}), which runs later in the canonical phase order.`
    brokenDependencies.push(sentence)
    diagnostics.push({
      layer: 3,
      severity: 'error',
      code: 'L3_PHASE_REGRESSION',
      message: sentence,
    })
  }

  // --- Orphans and coverage ------------------------------------------------------------------
  // A single-step workflow is a complete description of a one-step protocol, so orphan detection
  // starts at two steps. Above that, a step nothing depends on and which depends on nothing is
  // almost always a dependency the author forgot to wire up — but it is legitimately a parallel
  // branch often enough that it warns rather than fails.
  const orphanSteps: string[] =
    totalSteps >= 2
      ? ordered
          .filter(
            ({ step }) =>
              (inDegree.get(step.id) ?? 0) === 0 && (outDegree.get(step.id) ?? 0) === 0,
          )
          .map(({ step }) => step.id)
      : []

  for (const id of orphanSteps) {
    const name = byId.get(id)?.name ?? id
    diagnostics.push({
      layer: 3,
      severity: 'warning',
      code: 'L3_ORPHAN_STEP',
      message: `Step "${name}" is connected to nothing: no step depends on it and it depends on no step.`,
    })
  }

  // Coverage is a warning and never a failure. A record documenting only purification is a
  // legitimate partial protocol, and most stubs will be exactly that.
  if (missingPhases.length > 0) {
    diagnostics.push({
      layer: 3,
      severity: 'warning',
      code: 'L3_MISSING_PHASES',
      message: `This protocol documents no step for: ${missingPhases.join(', ')}.`,
    })
  }

  // `isDagValid` is about the graph alone — unique nodes, resolvable edges, no cycle. Phase
  // regression is a separate, semantic failure: the graph is a perfectly good DAG, it just
  // describes chemistry that cannot happen. Both block the edit; keeping them apart lets the UI
  // say which one it is.
  const isDagValid =
    duplicateIds.length === 0 && cycleMembers.length === 0 && danglingDependencies.length === 0
  const passed = isDagValid && phaseRegressions === 0

  if (passed) {
    diagnostics.push({
      layer: 3,
      severity: 'pass',
      code: 'L3_DAG_VALID',
      message: `Protocol graph is acyclic and every dependency moves forward through the laboratory phases (${totalSteps} ${totalSteps === 1 ? 'step' : 'steps'}).`,
    })
  }

  return {
    passed,
    isDagValid,
    totalSteps,
    // A cycle leaves the graph unorderable, and a partial order would read as a complete protocol.
    topologicalOrder: cycleMembers.length > 0 ? [] : topologicalOrder,
    cycleMembers,
    danglingDependencies,
    orphanSteps,
    brokenDependencies,
    missingPhases,
    edges,
    diagnostics,
  }
}
