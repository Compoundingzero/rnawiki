/**
 * What a request is allowed to say.
 *
 * Strict schemas throughout, so an unknown key is a refusal rather than a value silently dropped.
 * Nothing here accepts a risk class, a digest, an approval count, a reviewer role or a publication
 * state from the caller: every one of those is derived on the server, because a browser is free to
 * claim anything and a review system that believes it is not a review system.
 */
import { z } from 'zod'

import { PAGE_STATEMENT_CHANGE_CATEGORIES, PAGE_STATEMENT_KEYS } from './types'

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max)

/** A source a member attached. RNAWiki stores the URL and never fetches it. */
export const pageStatementSourceSchema = z
  .object({
    url: z
      .string()
      .trim()
      .max(2000)
      .regex(/^https?:\/\/[^\s<>"'\\^`{|}]+$/u, 'A source link must be a plain http or https URL.')
      .optional(),
    title: trimmed(1, 300).optional(),
    excerpt: trimmed(1, 2000).optional(),
  })
  .strict()
  .refine(
    (value) => Boolean(value.url) || Boolean(value.excerpt),
    'A source needs either a link or the exact wording it supports.',
  )

export const evidencePacketSchema = z
  .object({
    population: trimmed(1, 600).optional(),
    intervention: trimmed(1, 600).optional(),
    comparator: trimmed(1, 600).optional(),
    outcome: trimmed(1, 600).optional(),
    effect: trimmed(1, 600).optional(),
    limitations: trimmed(1, 1200).optional(),
    doesNotProve: trimmed(1, 1200).optional(),
  })
  .strict()

export const createProposalSchema = z
  .object({
    slug: trimmed(1, 128),
    statementKey: z.enum(PAGE_STATEMENT_KEYS),
    proposedText: trimmed(1, 4000),
    reason: trimmed(10, 4000),
    changeCategory: z.enum(PAGE_STATEMENT_CHANGE_CATEGORIES),
    /**
     * What the member believes the change touches. It never lowers the bar: the server derives the
     * risk class from the category and the text, and takes the higher of the two.
     */
    declaredImpact: z.enum([
      'clarity_only',
      'scientific_meaning',
      'safety_meaning',
      'evidence_classification',
    ]),
    evidencePacket: evidencePacketSchema.default({}),
    sources: z.array(pageStatementSourceSchema).max(10).default([]),
    /**
     * The wording the member was looking at. A mismatch means the page moved under them, and the
     * proposal is refused rather than written against a sentence that is no longer there.
     */
    expectedCurrentText: z.string().max(4000),
  })
  .strict()

export type CreateProposalBody = z.infer<typeof createProposalSchema>

export const reviewDecisionSchema = z
  .object({
    decision: z.enum(['APPROVE', 'CHANGES_REQUESTED', 'REJECT']),
    /** The four things a reviewer confirms they looked at. All four are required to record a vote. */
    checkedWording: z.literal(true),
    checkedSource: z.literal(true),
    checkedLimitation: z.literal(true),
    conflictsOfInterestAttested: z.literal(true),
    conflictsOfInterest: trimmed(1, 4000),
    /** A declared conflict still records the decision; it stops counting toward the three. */
    conflictDeclared: z.boolean(),
    reason: trimmed(1, 8000).optional(),
    expectedContentDigest: z.string().regex(/^[0-9a-f]{64}$/),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.decision !== 'APPROVE' && !value.reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reason'],
        message: 'Say what has to change, or why this is being rejected.',
      })
    }
  })

export type ReviewDecisionBody = z.infer<typeof reviewDecisionSchema>

export const withdrawReviewSchema = z.object({ reason: trimmed(4, 2000) }).strict()

export const rollbackSchema = z
  .object({
    slug: trimmed(1, 128),
    statementKey: z.enum(PAGE_STATEMENT_KEYS),
    reason: trimmed(10, 4000),
  })
  .strict()

/* -------------------------------------------------------------- abuse checks */

const ABUSE_PATTERNS: ReadonlyArray<{ pattern: RegExp; message: string }> = [
  { pattern: /<[a-z!/][^>]*>/i, message: 'A proposal is plain text. Remove the markup.' },
  { pattern: /javascript:|data:text\/html|on\w+\s*=/i, message: 'That link cannot be used here.' },
  {
    pattern: /\b(?:buy|order|shop|discount|coupon|promo code|affiliate|referral link)\b/i,
    message: 'RNAWiki carries no advertising, and a wording is not a place to start.',
  },
  {
    pattern: /\b(?:you should take|i recommend you|stop taking your|start taking)\b/i,
    message: 'RNAWiki records what was studied. It does not advise one person what to do.',
  },
  {
    pattern: /\b(?:idiot|moron|stupid|shut up|scam artist)\b/i,
    message: 'Keep the reason about the wording and the evidence.',
  },
]

/** Returns the first reason this submission is refused, or null when it is acceptable. */
export function abuseRefusal(...values: ReadonlyArray<string | undefined>): string | null {
  const joined = values.filter(Boolean).join('\n')
  for (const entry of ABUSE_PATTERNS) {
    if (entry.pattern.test(joined)) return entry.message
  }
  return null
}
