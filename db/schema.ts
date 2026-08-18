import {
  pgTable,
  pgEnum,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const entityTypeEnum = pgEnum('entity_type', [
  'peptide',
  'supplement_ingredient',
  'investigational_medicine',
  'approved_medicine',
  'gene_editing_treatment',
  'rna_treatment',
  'other_emerging_therapy',
])

export const regulatoryCategoryEnum = pgEnum('regulatory_category', [
  'approved_medicine',
  'investigational_medicine',
  'compounded_medicine',
  'dietary_supplement',
  'unapproved_therapeutic_substance',
  'withdrawn_or_restricted',
])

export const publicationStatusEnum = pgEnum('publication_status', [
  'draft',
  'editorially_complete',
  'scientific_review_required',
  'approved',
  'published',
  'needs_update',
  're_review',
])

export const claimTypeEnum = pgEnum('claim_type', [
  'mechanism',
  'effectiveness',
  'safety',
  'regulatory',
  'access',
  'claimed_use',
])

// Ordered weakest -> strongest. Stored as text, ordering enforced in application code
// (PROOF_BOUNDARY_STAGES in lib/evidence.ts) rather than relying on enum declaration order.
export const proofBoundaryStageEnum = pgEnum('proof_boundary_stage', [
  'biological_rationale_only',
  'isolated_cell_evidence',
  'animal_evidence',
  'observational_human_evidence',
  'uncontrolled_human_intervention',
  'controlled_human_evidence',
  'independently_supported_controlled_human_evidence',
  'regulatory_evidence',
])

export const evidenceStatusEnum = pgEnum('evidence_status', ['measured', 'inferred', 'unknown'])

export const evidenceRelationshipEnum = pgEnum('evidence_relationship', [
  'supports',
  'contradicts',
  'limits',
  'contextualizes',
])

export const reviewDecisionEnum = pgEnum('review_decision', ['approved', 'rejected', 'needs_changes'])

export const userRoleEnum = pgEnum('user_role', ['administrator', 'editor', 'scientific_reviewer'])

export const moderationStatusEnum = pgEnum('moderation_status', ['pending', 'resolved', 'dismissed'])

export const evidenceChangeTypeEnum = pgEnum('evidence_change_type', [
  'new_controlled_trial',
  'regulatory_decision',
  'safety_warning',
  'retraction_or_correction',
  'independent_study',
  'boundary_moved',
])

export const reviewableTypeEnum = pgEnum('reviewable_type', ['claim', 'entity'])

// ---------------------------------------------------------------------------
// Accounts (internal only — administrator / editor / scientific_reviewer)
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull(),
  credentials: text('credentials'), // e.g. "MD, PhD — clinical pharmacology"
  relevantField: varchar('relevant_field', { length: 200 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------

export const entities = pgTable('entities', {
  id: serial('id').primaryKey(),
  canonicalName: varchar('canonical_name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  aliases: jsonb('aliases').$type<string[]>().notNull().default([]),
  entityType: entityTypeEnum('entity_type').notNull(),
  shortDescription: text('short_description').notNull(),
  bottomLine: text('bottom_line').notNull(), // 2-3 sentence answer, caveat in the same sentence
  regulatoryCategory: regulatoryCategoryEnum('regulatory_category').notNull(),
  publicationStatus: publicationStatusEnum('publication_status').notNull().default('draft'),
  accessRealityNote: text('access_reality_note'), // delivery burden, no self-use instructions
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  slugIdx: uniqueIndex('entities_slug_idx').on(t.slug),
  typeIdx: index('entities_type_idx').on(t.entityType),
}))

export const entitiesRelations = relations(entities, ({ many }) => ({
  regulatoryStatuses: many(regulatoryStatuses),
  claims: many(claims),
  evidenceChanges: many(evidenceChanges),
  subscriptions: many(subscriptions),
}))

// ---------------------------------------------------------------------------
// Regulatory status (one entity, many jurisdictions)
// ---------------------------------------------------------------------------

export const regulatoryStatuses = pgTable('regulatory_statuses', {
  id: serial('id').primaryKey(),
  entityId: integer('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  jurisdiction: varchar('jurisdiction', { length: 100 }).notNull(), // e.g. "United States", "Singapore"
  legalCategory: regulatoryCategoryEnum('legal_category').notNull(),
  approvedIndications: text('approved_indications'),
  statusStatement: text('status_statement').notNull(),
  source: text('source').notNull(), // URL to primary regulatory source
  checkedDate: timestamp('checked_date', { withTimezone: true }).notNull(),
  editorId: integer('editor_id').references(() => users.id),
  reviewStatus: publicationStatusEnum('review_status').notNull().default('draft'),
}, (t) => ({
  entityIdx: index('regulatory_statuses_entity_idx').on(t.entityId),
}))

// ---------------------------------------------------------------------------
// Claim
// ---------------------------------------------------------------------------

export const claims = pgTable('claims', {
  id: serial('id').primaryKey(),
  entityId: integer('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 200 }).notNull(), // unique per entity, e.g. "tendon-healing"
  claimType: claimTypeEnum('claim_type').notNull(),
  consumerQuestion: text('consumer_question').notNull(), // "Does it improve tendon healing?"
  directAnswer: text('direct_answer').notNull(), // 1-2 sentences, caveat included
  measuredFinding: text('measured_finding').notNull(),
  inference: text('inference').notNull(),
  proofBoundaryStage: proofBoundaryStageEnum('proof_boundary_stage').notNull(),
  proofBoundaryExplanation: text('proof_boundary_explanation').notNull(),
  remainingUnknown: text('remaining_unknown').notNull(),
  evidenceNeededNext: text('evidence_needed_next').notNull(),
  mechanismSummary: text('mechanism_summary'),
  outcomeSummary: text('outcome_summary'),
  publicationStatus: publicationStatusEnum('publication_status').notNull().default('draft'),
  reviewerId: integer('reviewer_id').references(() => users.id),
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  version: integer('version').notNull().default(1),
  displayPriority: integer('display_priority').notNull().default(0), // for "most searched claims" ordering
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  entitySlugIdx: uniqueIndex('claims_entity_slug_idx').on(t.entityId, t.slug),
  statusIdx: index('claims_status_idx').on(t.publicationStatus),
}))

export const claimsRelations = relations(claims, ({ one, many }) => ({
  entity: one(entities, { fields: [claims.entityId], references: [entities.id] }),
  mechanismSteps: many(mechanismSteps),
  evidenceLinks: many(claimEvidence),
  reviews: many(reviews),
  revisions: many(revisions),
  comprehensionQuestions: many(comprehensionQuestions),
}))

// ---------------------------------------------------------------------------
// Mechanism step (ordered causal chain for a claim)
// ---------------------------------------------------------------------------

export const mechanismSteps = pgTable('mechanism_steps', {
  id: serial('id').primaryKey(),
  claimId: integer('claim_id').notNull().references(() => claims.id, { onDelete: 'cascade' }),
  displayOrder: integer('display_order').notNull(),
  technicalLabel: varchar('technical_label', { length: 200 }).notNull(),
  plainLanguageExplanation: text('plain_language_explanation').notNull(),
  evidenceContext: text('evidence_context').notNull(),
  status: evidenceStatusEnum('status').notNull(),
  sourceLinks: jsonb('source_links').$type<string[]>().notNull().default([]),
  illustrationMetadata: jsonb('illustration_metadata').$type<Record<string, unknown> | null>(),
}, (t) => ({
  claimOrderIdx: index('mechanism_steps_claim_order_idx').on(t.claimId, t.displayOrder),
}))

// ---------------------------------------------------------------------------
// Evidence source
// ---------------------------------------------------------------------------

export const evidenceSources = pgTable('evidence_sources', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  authors: text('authors'),
  publicationYear: integer('publication_year'),
  journalOrIssuer: varchar('journal_or_issuer', { length: 300 }),
  doi: varchar('doi', { length: 200 }),
  pmid: varchar('pmid', { length: 50 }),
  clinicalTrialId: varchar('clinical_trial_id', { length: 50 }), // e.g. NCT number
  regulatoryUrl: text('regulatory_url'),
  sourceType: varchar('source_type', { length: 100 }).notNull(), // cell study, animal study, RCT, systematic review, regulatory doc, etc.
  studyDesign: varchar('study_design', { length: 200 }),
  experimentalModel: varchar('experimental_model', { length: 200 }), // e.g. "rat Achilles tendon"
  species: varchar('species', { length: 100 }),
  sampleSize: integer('sample_size'),
  endpoint: text('endpoint'),
  retractionStatus: varchar('retraction_status', { length: 100 }), // null, "corrected", "retracted"
  bibliographicMetadata: jsonb('bibliographic_metadata').$type<Record<string, unknown> | null>(),
  dateChecked: timestamp('date_checked', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  doiIdx: index('evidence_sources_doi_idx').on(t.doi),
  pmidIdx: index('evidence_sources_pmid_idx').on(t.pmid),
}))

// ---------------------------------------------------------------------------
// Claim <-> Evidence relationship
// ---------------------------------------------------------------------------

export const claimEvidence = pgTable('claim_evidence', {
  id: serial('id').primaryKey(),
  claimId: integer('claim_id').notNull().references(() => claims.id, { onDelete: 'cascade' }),
  evidenceSourceId: integer('evidence_source_id').notNull().references(() => evidenceSources.id, { onDelete: 'cascade' }),
  relationship: evidenceRelationshipEnum('relationship').notNull(),
  claimPartAddressed: text('claim_part_addressed').notNull(),
  directlyMeasuredResult: text('directly_measured_result').notNull(),
  editorialNotes: text('editorial_notes'),
  independentGroupStatus: boolean('independent_group_status').notNull().default(false),
  displayPriority: integer('display_priority').notNull().default(0),
}, (t) => ({
  claimIdx: index('claim_evidence_claim_idx').on(t.claimId),
  evidenceIdx: index('claim_evidence_evidence_idx').on(t.evidenceSourceId),
}))

// ---------------------------------------------------------------------------
// Review (of a claim or entity version)
// ---------------------------------------------------------------------------

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  reviewableType: reviewableTypeEnum('reviewable_type').notNull(),
  reviewableId: integer('reviewable_id').notNull(),
  reviewerId: integer('reviewer_id').notNull().references(() => users.id),
  decision: reviewDecisionEnum('decision').notNull(),
  comments: text('comments'),
  reviewedVersion: integer('reviewed_version').notNull(),
  reviewDate: timestamp('review_date', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  reviewableIdx: index('reviews_reviewable_idx').on(t.reviewableType, t.reviewableId),
}))

// ---------------------------------------------------------------------------
// Revision / audit history
// ---------------------------------------------------------------------------

export const revisions = pgTable('revisions', {
  id: serial('id').primaryKey(),
  reviewableType: reviewableTypeEnum('reviewable_type').notNull(),
  reviewableId: integer('reviewable_id').notNull(),
  changedByUserId: integer('changed_by_user_id').notNull().references(() => users.id),
  fieldChanged: varchar('field_changed', { length: 200 }).notNull(),
  previousValue: text('previous_value'),
  newValue: text('new_value'),
  reason: text('reason'),
  reviewStatusAffected: boolean('review_status_affected').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  reviewableIdx: index('revisions_reviewable_idx').on(t.reviewableType, t.reviewableId),
}))

// ---------------------------------------------------------------------------
// Public correction submissions (moderation queue — never auto-applied)
// ---------------------------------------------------------------------------

export const correctionSubmissions = pgTable('correction_submissions', {
  id: serial('id').primaryKey(),
  entityId: integer('entity_id').references(() => entities.id, { onDelete: 'set null' }),
  claimId: integer('claim_id').references(() => claims.id, { onDelete: 'set null' }),
  category: varchar('category', { length: 100 }).notNull(), // confusing_sentence, broken_source, undefined_term, new_source, other
  message: text('message').notNull(),
  proposedSource: text('proposed_source'),
  moderationStatus: moderationStatusEnum('moderation_status').notNull().default('pending'),
  resolution: text('resolution'),
  publicCorrectionEntry: text('public_correction_entry'), // set when published to /updates as a correction
  sessionHash: varchar('session_hash', { length: 128 }), // rate-limit / dedupe only, not identifying
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  statusIdx: index('correction_submissions_status_idx').on(t.moderationStatus),
}))

// ---------------------------------------------------------------------------
// Evidence change (the public "what changed" feed)
// ---------------------------------------------------------------------------

export const evidenceChanges = pgTable('evidence_changes', {
  id: serial('id').primaryKey(),
  entityId: integer('entity_id').references(() => entities.id, { onDelete: 'cascade' }),
  claimId: integer('claim_id').references(() => claims.id, { onDelete: 'cascade' }),
  changeType: evidenceChangeTypeEnum('change_type').notNull(),
  previousBoundary: proofBoundaryStageEnum('previous_boundary'),
  newBoundary: proofBoundaryStageEnum('new_boundary'),
  explanation: text('explanation').notNull(),
  source: text('source').notNull(),
  publicationDate: timestamp('publication_date', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  dateIdx: index('evidence_changes_date_idx').on(t.publicationDate),
}))

// ---------------------------------------------------------------------------
// Comprehension testing (teach-back, anonymous)
// ---------------------------------------------------------------------------

export const comprehensionQuestions = pgTable('comprehension_questions', {
  id: serial('id').primaryKey(),
  claimId: integer('claim_id').notNull().references(() => claims.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  options: jsonb('options').$type<string[]>().notNull(),
  correctOptionIndex: integer('correct_option_index').notNull(),
  explanation: text('explanation').notNull(),
  activeVersion: integer('active_version').notNull().default(1),
  displayOrder: integer('display_order').notNull().default(0),
}, (t) => ({
  claimIdx: index('comprehension_questions_claim_idx').on(t.claimId),
}))

export const comprehensionResponses = pgTable('comprehension_responses', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id').notNull().references(() => comprehensionQuestions.id, { onDelete: 'cascade' }),
  claimVersion: integer('claim_version').notNull(), // ties response to the exact content version tested
  selectedOptionIndex: integer('selected_option_index').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  sessionHash: varchar('session_hash', { length: 128 }).notNull(), // short-lived hash, dedupe only
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  questionIdx: index('comprehension_responses_question_idx').on(t.questionId),
  dedupeIdx: index('comprehension_responses_dedupe_idx').on(t.questionId, t.sessionHash),
}))

// ---------------------------------------------------------------------------
// Subscriptions (follow an entity for material evidence changes only)
// ---------------------------------------------------------------------------

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  entityId: integer('entity_id').notNull().references(() => entities.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 320 }).notNull(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  unsubscribeToken: varchar('unsubscribe_token', { length: 128 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  entityEmailIdx: uniqueIndex('subscriptions_entity_email_idx').on(t.entityId, t.email),
}))

// ---------------------------------------------------------------------------
// Legacy redirects (Section 21 — legacy route handling)
// ---------------------------------------------------------------------------

export const legacyRedirects = pgTable('legacy_redirects', {
  id: serial('id').primaryKey(),
  fromPath: varchar('from_path', { length: 300 }).notNull().unique(),
  toPath: varchar('to_path', { length: 300 }), // null => 410 Gone, no legitimate replacement
  statusCode: integer('status_code').notNull(), // 301 or 410
  note: text('note'),
})
