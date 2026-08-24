import { z } from 'zod'

import {
  CONTRIBUTION_AFFECTS,
  CONTRIBUTION_PROPOSAL_TYPES,
  CONTRIBUTION_SELECTED_FIELDS,
} from '@/lib/contributions/types'
import {
  CLAIM_NATURES,
  EVIDENCE_SOURCE_TYPES,
  STOPPED_PROGRAMME_VERDICTS,
} from '@/lib/evidence/types'

const optionalText = (maximum: number) => z.string().trim().max(maximum).nullable().optional()

const proposedValueSchema = z.union([
  z.string().trim().min(1).max(12_000),
  z.array(z.string().trim().min(1).max(4_000)).min(1).max(100),
])

const sourcePatchSchema = z
  .object({
    type: z.enum(EVIDENCE_SOURCE_TYPES).nullable().optional(),
    locator: optionalText(4_000),
    identifier: optionalText(400),
    reviewTaskId: optionalText(64),
    reviewSnapshotId: optionalText(64),
  })
  .strict()
  .refine(
    (source) => Boolean(source.reviewTaskId) === Boolean(source.reviewSnapshotId),
    'A monitored source change requires both its review task and exact trigger snapshot.',
  )

export const contributionDraftPatchSchema = z
  .object({
    selectedField: z.enum(CONTRIBUTION_SELECTED_FIELDS).nullable().optional(),
    proposedText: optionalText(12_000),
    proposedValue: proposedValueSchema.nullable().optional(),
    source: sourcePatchSchema.nullable().optional(),
    claimNature: z.enum(CLAIM_NATURES).nullable().optional(),
    evidenceNodeId: optionalText(64),
    proposedStoppedVerdict: z.enum(STOPPED_PROGRAMME_VERDICTS).nullable().optional(),
    reasoning: optionalText(20_000),
    whatWasWrongOrMissing: optionalText(12_000),
    affects: z.enum(CONTRIBUTION_AFFECTS).nullable().optional(),
    conflictsOfInterest: optionalText(4_000),
    conflictsOfInterestAttested: z.boolean().optional(),
  })
  .strict()

export const createContributionDraftSchema = contributionDraftPatchSchema.extend({
  proposalType: z.enum(CONTRIBUTION_PROPOSAL_TYPES),
})

export const emptyContributionActionSchema = z.object({}).strict()

export type ContributionDraftPatch = z.infer<typeof contributionDraftPatchSchema>
export type CreateContributionDraftInput = z.infer<typeof createContributionDraftSchema>
