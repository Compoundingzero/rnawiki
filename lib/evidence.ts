// Central definitions for the Proof Boundary system. Any page or component that renders
// an evidence stage, a measured/inferred/unknown label, or a claim-evidence relationship
// must import from here rather than re-declaring the labels — this is the one place the
// wording is allowed to live, per docs/evidence-classification.md.

export const PROOF_BOUNDARY_STAGES = [
  'biological_rationale_only',
  'isolated_cell_evidence',
  'animal_evidence',
  'observational_human_evidence',
  'uncontrolled_human_intervention',
  'controlled_human_evidence',
  'independently_supported_controlled_human_evidence',
  'regulatory_evidence',
] as const

export type ProofBoundaryStage = (typeof PROOF_BOUNDARY_STAGES)[number]

export const PROOF_BOUNDARY_LABELS: Record<ProofBoundaryStage, string> = {
  biological_rationale_only: 'Biological rationale only',
  isolated_cell_evidence: 'Cell evidence',
  animal_evidence: 'Animal evidence',
  observational_human_evidence: 'Observational human evidence',
  uncontrolled_human_intervention: 'Uncontrolled human evidence',
  controlled_human_evidence: 'Controlled human evidence',
  independently_supported_controlled_human_evidence: 'Independently supported controlled human evidence',
  regulatory_evidence: 'Regulatory evidence',
}

/** True human-tested stages, for "has this been tested in people?" style questions. */
export const HUMAN_TESTED_STAGES: ReadonlySet<ProofBoundaryStage> = new Set([
  'observational_human_evidence',
  'uncontrolled_human_intervention',
  'controlled_human_evidence',
  'independently_supported_controlled_human_evidence',
  'regulatory_evidence',
])

export function isHumanTested(stage: ProofBoundaryStage): boolean {
  return HUMAN_TESTED_STAGES.has(stage)
}

/** Ordinal position for comparisons ("did the boundary move forward or back?"). Higher = stronger. */
export function stageRank(stage: ProofBoundaryStage): number {
  return PROOF_BOUNDARY_STAGES.indexOf(stage)
}

export function boundaryMovedForward(previous: ProofBoundaryStage, next: ProofBoundaryStage): boolean {
  return stageRank(next) > stageRank(previous)
}

/**
 * How to summarise a record's human evidence in one phrase.
 *
 * Deliberately three states, not two. `isHumanTested` is true from
 * `observational_human_evidence` upward, which includes uncontrolled studies — so a two-state
 * "tested in people / not tested" label announced "tested in people" for BPC-157, whose whole
 * record exists to say no controlled human trial has ever published a result. The split that
 * matters to a reader is whether there was a control group, so that is where this splits.
 *
 * Shared by the compound index and the entity page so the two cannot drift apart.
 */
export function humanEvidenceSummary(stage: ProofBoundaryStage | null): string {
  if (!stage) return 'No published claims recorded'
  if (stageRank(stage) >= stageRank('controlled_human_evidence')) return 'Human evidence: controlled'
  if (isHumanTested(stage)) return 'Human evidence: uncontrolled only'
  return 'Human evidence: none recorded'
}

export const EVIDENCE_STATUSES = ['measured', 'inferred', 'unknown'] as const
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number]

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  measured: 'Measured',
  inferred: 'Inferred',
  unknown: 'Unknown',
}

export const EVIDENCE_STATUS_DEFINITIONS: Record<EvidenceStatus, string> = {
  measured: 'The experiment directly observed this result under the stated conditions.',
  inferred: 'The conclusion may be scientifically plausible, but it goes beyond what was directly measured.',
  unknown: 'The evidence needed to establish the claim is not currently available or convincing.',
}

export const EVIDENCE_RELATIONSHIPS = ['supports', 'contradicts', 'limits', 'contextualizes'] as const
export type EvidenceRelationship = (typeof EVIDENCE_RELATIONSHIPS)[number]

export const EVIDENCE_RELATIONSHIP_LABELS: Record<EvidenceRelationship, string> = {
  supports: 'Supports',
  contradicts: 'Contradicts',
  limits: 'Limits',
  contextualizes: 'Contextualizes',
}

/**
 * Comprehension "clarity tested" gate (spec section 14):
 * at least 20 valid responses AND at least 80% correct on the central Proof Boundary question.
 */
export const CLARITY_MIN_RESPONSES = 20
export const CLARITY_MIN_CORRECT_RATE = 0.8

export interface ComprehensionAggregateInput {
  totalResponses: number
  correctResponses: number
}

export function isClarityTested({ totalResponses, correctResponses }: ComprehensionAggregateInput): boolean {
  if (totalResponses < CLARITY_MIN_RESPONSES) return false
  return correctResponses / totalResponses >= CLARITY_MIN_CORRECT_RATE
}

export function comprehensionRate({ totalResponses, correctResponses }: ComprehensionAggregateInput): number {
  if (totalResponses === 0) return 0
  return correctResponses / totalResponses
}

/**
 * Evidence change types — the public "how this answer changed" history (`evidence_changes`).
 *
 * Same hand-sync rule as `PROOF_BOUNDARY_STAGES`: these values mirror `evidenceChangeTypeEnum` in
 * db/schema.ts and nothing enforces that they stay in step.
 */
export const EVIDENCE_CHANGE_TYPES = [
  'new_controlled_trial',
  'regulatory_decision',
  'safety_warning',
  'retraction_or_correction',
  'independent_study',
  'boundary_moved',
] as const

export type EvidenceChangeType = (typeof EVIDENCE_CHANGE_TYPES)[number]

/**
 * Public sentence for one change entry. The stored enum value is never printed.
 *
 * Each sentence says what happened and nothing about whether the claim got stronger. A change
 * entry records that the evidence moved; the direction it moved is carried by the recorded
 * previous and new evidence positions, not by this wording.
 */
export const EVIDENCE_CHANGE_TYPE_PUBLIC: Record<EvidenceChangeType, string> = {
  new_controlled_trial:
    'A controlled trial, meaning one with a comparison group, published a result bearing on this answer.',
  regulatory_decision: 'A regulator made a decision about this treatment for a defined use.',
  safety_warning: 'A safety warning about this treatment was issued or updated.',
  retraction_or_correction:
    'A source behind this answer was retracted or corrected by the journal that published it.',
  independent_study:
    'A group unconnected to the original researchers published a result on the same question.',
  boundary_moved:
    'The recorded evidence position changed, because the strongest directly relevant evidence changed.',
}
