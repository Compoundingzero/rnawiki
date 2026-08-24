import { z } from 'zod'

import { VERDICT_REVIEW_DECISIONS, VERDICT_REVIEWER_EXPERTISE_TAGS } from '@/lib/evidence/types'

const digest = z.string().regex(/^[0-9a-f]{64}$/)
const expertiseTags = z.array(z.enum(VERDICT_REVIEWER_EXPERTISE_TAGS)).min(1).max(7)

export const materializeContributionSchema = z.object({}).strict()

export const programmeVerdictReviewSchema = z
  .object({
    expectedProposalDigest: digest,
    decision: z.enum(VERDICT_REVIEW_DECISIONS),
    expertiseTags,
    isIndependent: z.literal(true),
    conflictsOfInterest: z.string().trim().min(1).max(4_000),
    conflictsOfInterestAttested: z.literal(true),
    reviewNote: z.string().trim().max(12_000).nullable().optional(),
  })
  .strict()

export const programmeVerdictAdjudicationSchema = z
  .object({
    expectedProposalDigest: digest,
    decision: z.enum(VERDICT_REVIEW_DECISIONS),
    expertiseTags,
    rationale: z.string().trim().min(1).max(20_000),
    conflictsOfInterest: z.string().trim().min(1).max(4_000),
    conflictsOfInterestAttested: z.literal(true),
  })
  .strict()

export const programmeVerdictPublishSchema = z.object({ expectedProposalDigest: digest }).strict()

export const reviewerQualificationSchema = z
  .object({
    reviewerUserId: z.string().trim().min(1).max(64),
    expertiseTag: z.enum(VERDICT_REVIEWER_EXPERTISE_TAGS),
    action: z.enum(['GRANT', 'REVOKE']),
    reason: z.string().trim().min(1).max(8_000),
  })
  .strict()
