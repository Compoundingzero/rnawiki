import { z } from 'zod'

import { VERDICT_REVIEW_DECISIONS, VERDICT_REVIEWER_EXPERTISE_TAGS } from '@/lib/evidence/types'

const expertiseTagsSchema = z
  .array(z.enum(VERDICT_REVIEWER_EXPERTISE_TAGS))
  .min(1)
  .max(VERDICT_REVIEWER_EXPERTISE_TAGS.length)
  .refine((values) => new Set(values).size === values.length, {
    message: 'Expertise tags must not contain duplicates.',
  })

export const contributionReviewDecisionSchema = z
  .object({
    decision: z.enum(VERDICT_REVIEW_DECISIONS),
    expertiseTags: expertiseTagsSchema,
    independenceAttested: z.literal(true),
    conflictsOfInterest: z.string().trim().min(1).max(4_000),
    conflictsOfInterestAttested: z.literal(true),
    reviewNote: z.string().trim().min(1).max(8_000).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.decision !== 'APPROVE' && !value.reviewNote) {
      context.addIssue({
        code: 'custom',
        path: ['reviewNote'],
        message: 'A change request or rejection must explain what needs to change.',
      })
    }
  })

export const contributionAdjudicationDecisionSchema = z
  .object({
    decision: z.enum(VERDICT_REVIEW_DECISIONS),
    rationale: z.string().trim().min(1).max(12_000),
    expertiseTags: expertiseTagsSchema,
    conflictsOfInterest: z.string().trim().min(1).max(4_000),
    conflictsOfInterestAttested: z.literal(true),
  })
  .strict()

export type ContributionReviewDecisionInput = z.infer<typeof contributionReviewDecisionSchema>
export type ContributionAdjudicationDecisionInput = z.infer<
  typeof contributionAdjudicationDecisionSchema
>
