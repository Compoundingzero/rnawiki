/**
 * The Result Debugger: what a steward files when a query returned the wrong reading.
 *
 * Retrieval quality is not a number this project can measure on its own. A benchmark generated from
 * the corpus can say whether a retriever finds the unit a template was built from; it cannot say
 * whether the reading a person was handed answered the question they asked. Only a person can say
 * that, and only about a query they actually ran.
 *
 * So a correction records four things and no opinion: the exact query, the unit ids that came back
 * in the order they came back, what should have come back instead — a named unit, a recorded
 * absence, or both — and the reason in the reviewer's own words. The table is append-only, so a
 * later disagreement is a second row rather than an edit of the first.
 *
 * Nothing here changes a reading unit. The projector stays the only writer of units, and a
 * correction is evidence about the retrieval, kept beside it.
 */

import { z } from 'zod'

import { newId } from '@/lib/ids'
import { SEMANTIC_ENGINE_VERSION } from '@/lib/semantic/search'

export const RESULT_DEBUGGER_QUERY_MAX_LENGTH = 500
export const RESULT_DEBUGGER_REASON_MAX_LENGTH = 2000
export const RESULT_DEBUGGER_RETURNED_MAX = 50

const unitId = z.string().regex(/^[0-9a-f]{64}$/u, 'A unit id is a 64-character SHA-256 digest.')

export const resultDebuggerCorrectionSchema = z
  .object({
    query: z
      .string()
      .trim()
      .min(1, 'The query that was run is required.')
      .max(RESULT_DEBUGGER_QUERY_MAX_LENGTH),
    returnedUnitIds: z.array(unitId).max(RESULT_DEBUGGER_RETURNED_MAX).default([]),
    expectedUnitId: unitId.optional(),
    expectedAbsence: z.boolean().default(false),
    reason: z
      .string()
      .trim()
      .min(1, 'A reason is required; a correction with no reason cannot be reviewed.')
      .max(RESULT_DEBUGGER_REASON_MAX_LENGTH),
  })
  .strict()
  .refine((value) => value.expectedUnitId !== undefined || value.expectedAbsence, {
    message: 'Name the unit that should have come back, or mark the answer as a recorded absence.',
    path: ['expectedUnitId'],
  })
  .refine((value) => new Set(value.returnedUnitIds).size === value.returnedUnitIds.length, {
    message: 'The returned unit ids must be the ranked list as returned, without repeats.',
    path: ['returnedUnitIds'],
  })

export type ResultDebuggerCorrectionInput = z.infer<typeof resultDebuggerCorrectionSchema>

export interface ResultDebuggerCorrectionRow {
  id: string
  query: string
  reviewerUserId: string
  returnedUnitIds: string[]
  expectedUnitId: string | null
  expectedAbsence: boolean
  reason: string
  engineVersion: string
}

/** Turns validated input plus the acting reviewer into the exact row that is stored. */
export function buildCorrectionRow(
  input: ResultDebuggerCorrectionInput,
  reviewerUserId: string,
): ResultDebuggerCorrectionRow {
  return {
    id: newId('rdbg'),
    query: input.query,
    reviewerUserId,
    returnedUnitIds: input.returnedUnitIds,
    expectedUnitId: input.expectedUnitId ?? null,
    expectedAbsence: input.expectedAbsence,
    reason: input.reason,
    engineVersion: SEMANTIC_ENGINE_VERSION,
  }
}
