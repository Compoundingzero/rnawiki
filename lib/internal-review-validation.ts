import { z } from 'zod'

const physicianDecisionReason = z
  .string()
  .trim()
  .min(8, 'Explain the evidence for this decision in at least 8 characters.')
  .max(2000, 'Decision reasons are limited to 2,000 characters.')

export const physicianVerificationDecisionSchema = z
  .object({
    decision: z.enum(['APPROVE', 'REJECT']),
    reason: physicianDecisionReason,
  })
  .strict()

export const feedbackResolutionSchema = z
  .object({
    note: z
      .string()
      .trim()
      .min(8, 'Record how this feedback was handled in at least 8 characters.')
      .max(2000, 'Resolution notes are limited to 2,000 characters.'),
  })
  .strict()

export type PhysicianVerificationDecisionInput = z.infer<typeof physicianVerificationDecisionSchema>
