import {
  PROOF_BOUNDARY_LABELS,
  stageRank,
  type ProofBoundaryStage,
} from './evidence'
import type { regulatoryCategoryEnum } from '@/db/schema'

/**
 * Reader-facing translation of the evidence model. The canonical eight stages in lib/evidence.ts
 * are unchanged and remain the stored value; this module only decides how to say them in public.
 *
 * Every mapping lives here so the homepage, browse list, entity page and search cannot drift into
 * describing the same stage differently.
 */

export const REACH_POSITIONS = [
  'Biological idea',
  'Lab studies',
  'Animal studies',
  'People',
  'Regulatory review',
] as const

export type ReachPosition = (typeof REACH_POSITIONS)[number]

/** Which of the five public positions a stage sits at. */
export function stageToReachIndex(stage: ProofBoundaryStage): number {
  switch (stage) {
    case 'biological_rationale_only':
      return 0
    case 'isolated_cell_evidence':
      return 1
    case 'animal_evidence':
      return 2
    case 'observational_human_evidence':
    case 'uncontrolled_human_intervention':
    case 'controlled_human_evidence':
    case 'independently_supported_controlled_human_evidence':
      return 3
    case 'regulatory_evidence':
      return 4
  }
}

/**
 * The sentence under the visual. Four different stages share position 3 ("People"), and the
 * difference between them is the single most consequential distinction on the site — an
 * uncontrolled study and a replicated controlled trial are not the same claim. The dots cannot
 * carry that, so the sentence does, and it is never optional.
 */
export function reachSentence(stage: ProofBoundaryStage): string {
  switch (stage) {
    case 'biological_rationale_only':
      return 'There is a proposed biological explanation, but it has not been tested in cells, animals or people.'
    case 'isolated_cell_evidence':
      return 'The evidence comes from cells in a dish. It has not been tested in animals or people.'
    case 'animal_evidence':
      return 'The evidence comes from animal studies. No controlled trial has tested this in people.'
    case 'observational_human_evidence':
      return 'Researchers looked at people who were already using it. Nobody decided who received it, so other differences between those people could explain what was seen.'
    case 'uncontrolled_human_intervention':
      return 'People were given it and the results were recorded, but there was no comparison group.'
    case 'controlled_human_evidence':
      return 'This was tested in people against a comparison group. That design can support a result — it does not mean the result was positive.'
    case 'independently_supported_controlled_human_evidence':
      return 'More than one controlled trial, run by separate research groups, has looked at this question.'
    case 'regulatory_evidence':
      return 'A medicines regulator reviewed the evidence and approved the product for a specific use.'
  }
}

/**
 * Whether an evidence position means anything for this claim.
 *
 * The position describes how far testing has gone for an *outcome*. A claim about what a hospital
 * procedure involves, or what a regulator decided, has no evidence ladder — printing one put
 * "a regulator reviewed the evidence and approved it" underneath "what does actually getting
 * treated involve", and filled the ladder to its top rung for a logistics answer.
 */
export function stagePositionApplies(claimType: string): boolean {
  return claimType === 'effectiveness' || claimType === 'safety' || claimType === 'claimed_use'
}

/**
 * Short value for the at-a-glance summary. Deliberately never a bare "tested in people": that
 * phrasing counts an uncontrolled study as human evidence and previously made BPC-157 read as
 * though it had been properly trialled.
 */
export function plainHumanEvidence(stage: ProofBoundaryStage | null): string {
  if (!stage) return 'No published claims yet'
  switch (stage) {
    case 'biological_rationale_only':
      return 'No studies yet'
    case 'isolated_cell_evidence':
      return 'Lab studies only'
    case 'animal_evidence':
      return 'Animal studies only'
    case 'observational_human_evidence':
      return 'Observed in people, not tested'
    case 'uncontrolled_human_intervention':
      return 'Small study without a control group'
    case 'controlled_human_evidence':
      return 'Controlled human trials'
    case 'independently_supported_controlled_human_evidence':
      return 'Controlled trials, repeated independently'
    case 'regulatory_evidence':
      return 'Reviewed by a regulator'
  }
}

type RegulatoryCategory = (typeof regulatoryCategoryEnum.enumValues)[number]

/** Approval state in words a reader already knows. Never the raw enum. */
export function plainApproval(category: RegulatoryCategory): string {
  switch (category) {
    case 'approved_medicine':
      return 'Approved for a defined medical use'
    case 'investigational_medicine':
      return 'Still being studied, not approved'
    case 'compounded_medicine':
      return 'Prepared by a pharmacy, not a standard approved product'
    case 'dietary_supplement':
      return 'Sold as a supplement, not an approved medicine'
    case 'unapproved_therapeutic_substance':
      return 'Not approved for medical use'
    case 'withdrawn_or_restricted':
      return 'Withdrawn or restricted'
  }
}

export function isApproved(category: RegulatoryCategory): boolean {
  return category === 'approved_medicine'
}

/** The exact canonical wording, kept available wherever the detail is expanded. */
export function canonicalStageLabel(stage: ProofBoundaryStage): string {
  return PROOF_BOUNDARY_LABELS[stage]
}

/** Strongest stage across a set of claims, or null when nothing is published. */
export function strongestStage(stages: ProofBoundaryStage[]): ProofBoundaryStage | null {
  if (stages.length === 0) return null
  return stages.reduce((a, b) => (stageRank(b) > stageRank(a) ? b : a))
}

/** "18 August 2026" — readable dates, never ISO, in public copy. */
export function readableDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}
