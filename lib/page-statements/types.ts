/**
 * The vocabulary for community review of a Substance Compass sentence.
 *
 * A compass page is built from stored records, and a reader meets it as a small number of named
 * sentences. This file names those sentences, the kinds of change a member may propose to one, and
 * how much review each kind needs before it becomes the public wording.
 *
 * Two rules shape everything here and are repeated in the database, the API and the interface:
 *
 *   1. Approval is about words, not about whether a substance works. A revision carries the
 *      evidence state of the sentence it replaces, and no number of approvals changes it.
 *   2. A statement key addresses a position on the page, never a stored medical record. Publishing
 *      a revision overlays what a reader is shown. It never edits `drugs`, `corpus_pages`,
 *      `reviewed_claims` or any source snapshot.
 *
 * The arrays are the single definition; `db/schema.ts` builds its enums from them, so a value
 * added here and not migrated fails the migration check rather than drifting silently.
 */

/* ------------------------------------------------------------- statements */

/**
 * Every sentence on a compass page a member may propose a better wording for.
 *
 * These are the first-read sentences: what a reader meets before deciding whether to keep reading.
 * Everything below them on the page is a stored record rendered with its own provenance, and is
 * corrected through the record's own path (a medicine-identity correction, a programme
 * contribution, a source refresh), not by rewording a sentence.
 */
export const PAGE_STATEMENT_KEYS = [
  'hero.opening',
  'hero.explanation',
  'hero.why_people_take_it',
  'hero.strongest_result',
  'hero.principal_limit',
  'hero.where_it_acts',
  'hero.immediate_change',
] as const

export type PageStatementKey = (typeof PAGE_STATEMENT_KEYS)[number]

export interface PageStatementDefinition {
  key: PageStatementKey
  /** What a reader sees above or around this sentence. */
  label: string
  /** The compass section it belongs to, for the queue and for a deep link. */
  sectionId: string
  /** One sentence telling a member what this position is for. */
  purpose: string
  /** Longest a proposal for this position may be, in words. */
  wordLimit: number
}

export const PAGE_STATEMENT_DEFINITIONS: ReadonlyArray<PageStatementDefinition> = [
  {
    key: 'hero.opening',
    label: 'The opening line',
    sectionId: 'substance-action',
    purpose:
      'The first sentence of the page: what this substance is taken for, or what it changes.',
    wordLimit: 24,
  },
  {
    key: 'hero.explanation',
    label: 'The explanation under the opening line',
    sectionId: 'substance-action',
    purpose: 'The recorded explanation of what happens in the body, in reader language.',
    wordLimit: 90,
  },
  {
    key: 'hero.why_people_take_it',
    label: 'Why people take it',
    sectionId: 'substance-action',
    purpose: 'The reason someone reaches for this substance, when that is not the opening line.',
    wordLimit: 24,
  },
  {
    key: 'hero.strongest_result',
    label: 'What happened in people',
    sectionId: 'substance-action',
    purpose: 'The strongest result on this record, named without exaggeration.',
    wordLimit: 30,
  },
  {
    key: 'hero.principal_limit',
    label: 'The limit that matters most',
    sectionId: 'substance-action',
    purpose: 'The one boundary a reader most needs beside that result.',
    wordLimit: 26,
  },
  {
    key: 'hero.where_it_acts',
    label: 'Where it acts',
    sectionId: 'substance-action',
    purpose: 'The place in the body the record names.',
    wordLimit: 20,
  },
  {
    key: 'hero.immediate_change',
    label: 'The change it makes',
    sectionId: 'substance-action',
    purpose: 'The first change this substance makes once it reaches where it acts.',
    wordLimit: 40,
  },
]

const DEFINITION_BY_KEY = new Map<string, PageStatementDefinition>(
  PAGE_STATEMENT_DEFINITIONS.map((definition) => [definition.key, definition]),
)

export function isPageStatementKey(value: string): value is PageStatementKey {
  return DEFINITION_BY_KEY.has(value)
}

export function pageStatementDefinition(key: PageStatementKey): PageStatementDefinition {
  const definition = DEFINITION_BY_KEY.get(key)
  if (!definition) throw new Error(`unknown statement key: ${key}`)
  return definition
}

export function pageStatementLabel(key: string): string {
  return DEFINITION_BY_KEY.get(key)?.label ?? key
}

/* -------------------------------------------------------- change category */

export const PAGE_STATEMENT_CHANGE_CATEGORIES = [
  'plain_language_clarity',
  'factual_accuracy',
  'missing_limitation',
  'evidence_classification',
  'source_correction',
  'identity_correction',
  'safety_correction',
  'interaction_correction',
  'formulation_correction',
  'spelling_or_grammar',
  'accessibility',
  'other',
] as const

export type PageStatementChangeCategory = (typeof PAGE_STATEMENT_CHANGE_CATEGORIES)[number]

export const CHANGE_CATEGORY_LABELS: Record<PageStatementChangeCategory, string> = {
  plain_language_clarity: 'Clearer wording, same meaning',
  factual_accuracy: 'The sentence states something incorrect',
  missing_limitation: 'A limit a reader needs is missing',
  evidence_classification: 'The kind of evidence is described wrongly',
  source_correction: 'The source behind it is wrong or has moved',
  identity_correction: 'It describes the wrong substance or form',
  safety_correction: 'A safety point is wrong or missing',
  interaction_correction: 'What it mixes with is wrong or missing',
  formulation_correction: 'It confuses one preparation with another',
  spelling_or_grammar: 'Spelling or grammar',
  accessibility: 'Hard to read or hard to use',
  other: 'Something else',
}

/* ------------------------------------------------------------- risk class */

/**
 * How much a change can move a reader's understanding, and therefore how much review it needs.
 *
 * The class is proposed by the member and re-derived on the server from the change category and
 * the text itself. The server's answer wins: a safety edit filed as a typo is still a safety edit.
 */
export const PAGE_STATEMENT_RISK_CLASSES = ['copy_only', 'scientific_meaning', 'high_risk'] as const

export type PageStatementRiskClass = (typeof PAGE_STATEMENT_RISK_CLASSES)[number]

export const RISK_CLASS_LABELS: Record<PageStatementRiskClass, string> = {
  copy_only: 'Wording only',
  scientific_meaning: 'Changes what the evidence says',
  high_risk: 'Touches safety or how the medicine is used',
}

export const RISK_CLASS_PLAIN: Record<PageStatementRiskClass, string> = {
  copy_only: 'The meaning stays the same. Three trusted members have to agree on the wording.',
  scientific_meaning:
    'This changes what the page says the evidence shows. Three members have to agree, and at least one of them needs a recorded qualification in a relevant field.',
  high_risk:
    'This touches safety, interactions, pregnancy or how the medicine is used. Three members have to agree, and at least two need a recorded qualification relevant to the claim.',
}

/** How many approving reviewers must hold a relevant recorded qualification. */
export const QUALIFIED_APPROVALS_REQUIRED: Record<PageStatementRiskClass, number> = {
  copy_only: 0,
  scientific_meaning: 1,
  high_risk: 2,
}

/** Every risk class needs the same number of independent approving members. */
export const PAGE_STATEMENT_APPROVALS_REQUIRED = 3

/* ---------------------------------------------------------------- statuses */

export const PAGE_STATEMENT_PROPOSAL_STATUSES = [
  'draft',
  'submitted',
  'open',
  'changes_requested',
  'rejected',
  'approved',
  'published',
  'superseded',
  'stale_source',
  'withdrawn',
  'safety_hold',
] as const

export type PageStatementProposalStatus = (typeof PAGE_STATEMENT_PROPOSAL_STATUSES)[number]

export const PROPOSAL_STATUS_LABELS: Record<PageStatementProposalStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  open: 'Open for review',
  changes_requested: 'Changes requested',
  rejected: 'Rejected',
  approved: 'Approved',
  published: 'Published',
  superseded: 'Replaced by a newer wording',
  stale_source: 'The record changed under it',
  withdrawn: 'Withdrawn by the author',
  safety_hold: 'Held for a safety check',
}

/** A proposal in one of these states is still collecting reviews. */
export const OPEN_PROPOSAL_STATUSES: ReadonlyArray<PageStatementProposalStatus> = [
  'submitted',
  'open',
]

/**
 * The review state of one proposal, derived in the database from the decisions recorded against it.
 *
 * There is no adjudication state here, and that is deliberate. On a medical page the safe answer to
 * a split is not to publish: one recorded request for changes, or one rejection, resolves the
 * proposal immediately rather than waiting for two more members to agree around it. The author
 * revises and the revised wording collects its own three approvals from zero.
 */
export const PAGE_STATEMENT_REVIEW_STATUSES = [
  'awaiting_reviews',
  'awaiting_second_review',
  'awaiting_third_review',
  'approved',
  'changes_requested',
  'rejected',
] as const

export type PageStatementReviewStatus = (typeof PAGE_STATEMENT_REVIEW_STATUSES)[number]

export const REVIEW_STATUS_LABELS: Record<PageStatementReviewStatus, string> = {
  awaiting_reviews: 'Waiting for a first reviewer',
  awaiting_second_review: 'One approval recorded',
  awaiting_third_review: 'Two approvals recorded',
  approved: 'Approved',
  changes_requested: 'Changes requested',
  rejected: 'Rejected',
}

/* --------------------------------------------------------------- events */

export const PAGE_STATEMENT_PUBLICATION_EVENTS = [
  'publish',
  'rollback',
  'safety_hold',
  'release_hold',
] as const

export type PageStatementPublicationEvent = (typeof PAGE_STATEMENT_PUBLICATION_EVENTS)[number]

export const PUBLICATION_EVENT_LABELS: Record<PageStatementPublicationEvent, string> = {
  publish: 'Approved wording became the public answer',
  rollback: 'Rolled back to the earlier wording',
  safety_hold: 'Held for a safety check',
  release_hold: 'Safety hold lifted',
}

/* ----------------------------------------------------------- reviewer view */

/**
 * Why a viewer may or may not record a decision on a revision. The reasons are ordered: the first
 * one that applies is the one shown, so a member is never told about the second problem while the
 * first one still stands.
 */
export const PAGE_STATEMENT_REVIEW_ELIGIBILITY_REASONS = [
  'eligible',
  'signed_out',
  'author_cannot_review',
  'account_restricted',
  'insufficient_trust',
  'already_reviewed',
  'duplicate_identity',
  'review_complete',
  'not_open',
] as const

export type PageStatementReviewEligibilityReason =
  (typeof PAGE_STATEMENT_REVIEW_ELIGIBILITY_REASONS)[number]

export const REVIEW_ELIGIBILITY_PLAIN: Record<PageStatementReviewEligibilityReason, string> = {
  eligible: 'You can record a decision on this wording.',
  signed_out: 'Sign in to record a decision. Reading needs no account.',
  author_cannot_review: 'You proposed this wording, so you cannot approve it.',
  account_restricted: 'This account is restricted and cannot record review decisions.',
  insufficient_trust:
    'Recording a decision needs a trusted editor, steward or administrator account.',
  already_reviewed: 'You have already recorded a decision on this exact wording.',
  duplicate_identity:
    'Another account with the same researcher identifier has already decided this wording.',
  review_complete: 'This wording already has every decision it needs.',
  not_open: 'This wording is not open for review.',
}
