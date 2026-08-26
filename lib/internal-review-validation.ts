import { z } from 'zod'

export const feedbackResolutionSchema = z
  .object({
    note: z
      .string()
      .trim()
      .min(8, 'Record how this feedback was handled in at least 8 characters.')
      .max(2000, 'Resolution notes are limited to 2,000 characters.'),
  })
  .strict()
