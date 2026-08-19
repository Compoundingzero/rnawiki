// Public comprehension testing ("teach-back"): anonymous readers answer up to three short
// single-choice questions per claim to check whether the Proof Boundary explanation was clear.
// This is never a scientific validation of the claim itself — see formatComprehensionAggregate
// below, and Section 14 of the spec. Vocabulary and the clarity-tested gate (CLARITY_MIN_RESPONSES,
// CLARITY_MIN_CORRECT_RATE, isClarityTested, comprehensionRate) live in lib/evidence.ts and are
// imported, never redeclared.

import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { claims, comprehensionQuestions, comprehensionResponses } from '@/db/schema'
import {
  comprehensionRate,
  isClarityTested as isClarityTestedGate,
  type ComprehensionAggregateInput,
} from '@/lib/evidence'

const MAX_QUESTIONS_PER_CLAIM = 3

export interface ComprehensionQuestionView {
  id: number
  claimId: number
  question: string
  options: string[]
  explanation: string
  displayOrder: number
  activeVersion: number
}

export interface ComprehensionAggregate {
  totalResponses: number
  correctResponses: number
  rate: number
  isClarityTested: boolean
}

export interface RecordResponseInput {
  questionId: number
  claimVersion: number
  selectedOptionIndex: number
  sessionHash: string
}

export interface RecordResponseResult {
  isCorrect: boolean
  explanation: string
  claimId: number
}

/**
 * Public-facing questions for a claim's teach-back test, ordered by displayOrder, capped at
 * three per the spec. `correctOptionIndex` is deliberately excluded from this view — it is
 * only ever read server-side, inside recordResponse — so the answer key is never present in the
 * page payload sent to an anonymous reader before they answer.
 */
export async function getQuestionsForClaim(claimId: number): Promise<ComprehensionQuestionView[]> {
  return db
    .select({
      id: comprehensionQuestions.id,
      claimId: comprehensionQuestions.claimId,
      question: comprehensionQuestions.question,
      options: comprehensionQuestions.options,
      explanation: comprehensionQuestions.explanation,
      displayOrder: comprehensionQuestions.displayOrder,
      activeVersion: comprehensionQuestions.activeVersion,
    })
    .from(comprehensionQuestions)
    .where(eq(comprehensionQuestions.claimId, claimId))
    // asc(id) is the tiebreak, and it is not cosmetic: displayOrder is an editorial convention
    // rather than a unique constraint, so two questions can share a value. Without a second key
    // Postgres returns heap order, which changes on any row rewrite, VACUUM or restore — silently
    // reordering the test a reader sees. See getAggregateForClaim below for the worse half.
    .orderBy(asc(comprehensionQuestions.displayOrder), asc(comprehensionQuestions.id))
    .limit(MAX_QUESTIONS_PER_CLAIM)
}

/**
 * Full question row, including the answer key. Server-side use only (the API route and
 * recordResponse) — never pass this straight through to a client component.
 */
export async function getQuestionById(questionId: number) {
  const [row] = await db
    .select()
    .from(comprehensionQuestions)
    .where(eq(comprehensionQuestions.id, questionId))
    .limit(1)
  return row ?? null
}

/** Current version of the claim a question belongs to, for stamping onto the response row. */
export async function getCurrentClaimVersion(claimId: number): Promise<number | null> {
  const [row] = await db.select({ version: claims.version }).from(claims).where(eq(claims.id, claimId)).limit(1)
  return row?.version ?? null
}

/**
 * Records one anonymous teach-back answer. `correctOptionIndex` is always re-derived here from
 * the stored question row — a client never supplies (or can even see) the correct answer.
 *
 * `comprehension_responses_dedupe_idx` is a plain (non-unique) index on (questionId, sessionHash),
 * meant to make this existence check fast rather than to enforce uniqueness at the database
 * layer — see db/schema.ts. So the no-op-on-duplicate behaviour is enforced here: an identical
 * (questionId, sessionHash) pair — the same anonymous reader re-submitting, most likely a
 * double-click or page refresh — returns the existing outcome instead of inserting a second row.
 */
export async function recordResponse(input: RecordResponseInput): Promise<RecordResponseResult> {
  const { questionId, claimVersion, selectedOptionIndex, sessionHash } = input

  const question = await getQuestionById(questionId)
  if (!question) {
    throw new Error(`recordResponse: no comprehension question with id ${questionId}`)
  }

  const [existing] = await db
    .select({ isCorrect: comprehensionResponses.isCorrect })
    .from(comprehensionResponses)
    .where(
      and(eq(comprehensionResponses.questionId, questionId), eq(comprehensionResponses.sessionHash, sessionHash))
    )
    .limit(1)

  if (existing) {
    return { isCorrect: existing.isCorrect, explanation: question.explanation, claimId: question.claimId }
  }

  const isCorrect = selectedOptionIndex === question.correctOptionIndex

  await db.insert(comprehensionResponses).values({
    questionId,
    claimVersion,
    selectedOptionIndex,
    isCorrect,
    sessionHash,
  })

  return { isCorrect, explanation: question.explanation, claimId: question.claimId }
}

/**
 * Aggregate comprehension stats for a claim, computed from its central Proof Boundary question
 * only — by editorial convention, displayOrder 0 (the first question, ordered ascending, in a
 * claim's set). Design choice, documented here because it isn't encoded in the schema: a claim's
 * up-to-two remaining questions probe comprehension of supporting detail, not the Proof Boundary
 * itself, so mixing their responses into the published aggregate would let an easy detail
 * question inflate — or a hard one deflate — the one number this product shows publicly.
 */
export async function getAggregateForClaim(claimId: number): Promise<ComprehensionAggregate> {
  const [central] = await db
    .select({ id: comprehensionQuestions.id })
    .from(comprehensionQuestions)
    .where(eq(comprehensionQuestions.claimId, claimId))
    // Same tiebreak as getQuestionsForClaim, and here it decides which response set backs the one
    // number this product is allowed to publish. With two questions tied at displayOrder 0 — which
    // is what the seeder used to produce for every claim — "the central question" was whichever
    // row Postgres happened to return first, and a single row rewrite flipped it, reassigning the
    // published percentage to a different question's responses with nothing to show for it.
    .orderBy(asc(comprehensionQuestions.displayOrder), asc(comprehensionQuestions.id))
    .limit(1)

  if (!central) {
    return { totalResponses: 0, correctResponses: 0, rate: 0, isClarityTested: false }
  }

  const responses = await db
    .select({ isCorrect: comprehensionResponses.isCorrect })
    .from(comprehensionResponses)
    .where(eq(comprehensionResponses.questionId, central.id))

  const totalResponses = responses.length
  const correctResponses = responses.filter((r) => r.isCorrect).length
  const input: ComprehensionAggregateInput = { totalResponses, correctResponses }

  return {
    totalResponses,
    correctResponses,
    rate: comprehensionRate(input),
    isClarityTested: isClarityTestedGate(input),
  }
}

/**
 * The only public framing of comprehension data: "86% of 47 readers correctly identified where
 * the evidence ends." Returns null until the clarity-tested gate (lib/evidence.ts) is met —
 * callers MUST treat null as "show nothing, or a neutral not-enough-responses state" and must
 * never fall back to displaying a small-sample percentage. This measures whether the explanation
 * read clearly. It is never scientific validation of the claim, and copy built on top of this
 * string must not imply otherwise.
 */
export function formatComprehensionAggregate(aggregate: ComprehensionAggregate): string | null {
  if (!aggregate.isClarityTested) return null
  const percent = Math.round(aggregate.rate * 100)
  return `${percent}% of ${aggregate.totalResponses} readers correctly identified where the evidence ends`
}
