import {
  pgTable,
  pgEnum,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  primaryKey,
  customType,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import type {
  AuditPoint,
  ClinicalTrialRecord,
  CommonQuestion,
  ConditionContext,
  DeliverySystem,
  DrugSubstitutes,
  MeasuredVsInferredSummary,
  MechanismStep,
  MolecularSchema,
  PricingTransparency,
  RevisionFieldChange,
} from '@/lib/types'

// A Postgres `tsvector` column. Drizzle has no built-in helper, so it is modelled as a custom
// type. Used only for the generated, indexed full-text search column on `drugs`.
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector'
  },
})

// ---------------------------------------------------------------------------
// Enums — the vocabulary is fixed in lib/types.ts and mirrored here BY HAND.
// A value added to one and not the other is a real bug no lint will catch.
// ---------------------------------------------------------------------------

export const drugModalityEnum = pgEnum('drug_modality', [
  'Small Molecule',
  'Peptide / GLP-1 Agonist',
  'Monoclonal Antibody (mAb)',
  'siRNA (Small Interfering RNA)',
  'ASO (Antisense Oligonucleotide)',
  'mRNA Vaccine / Therapeutic',
  'CRISPR / Gene Therapy',
  'Recombinant Protein / Biologic',
  'Nutraceutical / Botanical',
])

export const approvalStatusEnum = pgEnum('approval_status', [
  'FDA Approved',
  'EMA Approved',
  'Phase 3 Clinical Trial',
  'Phase 2 Investigational',
  'Off-Label / Compounded',
  'Non-FDA / Dietary Supplement',
  'Accelerated Approval',
  'Pre-clinical / Open Source',
  'Controlled / No Approved Use',
  'Withdrawn from Market',
])

export const auditConfidenceEnum = pgEnum('audit_confidence', [
  'High Confidence',
  'Moderate / Debated',
  'Inference Overreach Found',
  'Rigorous Replicated',
])

export const dossierDepthEnum = pgEnum('dossier_depth', ['stub', 'curated', 'flagship'])

export const trustTierEnum = pgEnum('trust_tier', ['new', 'contributor', 'trusted', 'steward'])

export const doctorVerificationStateEnum = pgEnum('doctor_verification_state', [
  'none',
  'pending',
  'verified',
  'rejected',
])

export const revisionStatusEnum = pgEnum('revision_status', [
  'published',
  'pending_review',
  'rejected',
  'machine_rejected',
])

export const noteStatusEnum = pgEnum('note_status', ['published', 'hidden', 'flagged'])

export const feedbackTypeEnum = pgEnum('feedback_type', ['suggestion', 'correction', 'request'])

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    email: varchar('email', { length: 320 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    name: varchar('name', { length: 160 }).notNull(),
    handle: varchar('handle', { length: 64 }).notNull(),

    // ORCID is the researcher identity anchor: contributions are timestamped against it.
    orcid: varchar('orcid', { length: 32 }),

    // Physician credentials. `verificationState` is the only thing that decides whether the
    // blue check renders. Submitting a licence number sets it to 'pending', never 'verified' —
    // a human steward approves. Nothing in the app may write 'verified' on a user's own behalf.
    isDoctor: boolean('is_doctor').notNull().default(false),
    medicalLicenseOrNpi: varchar('medical_license_or_npi', { length: 64 }),
    medicalSpecialty: varchar('medical_specialty', { length: 120 }),
    institution: varchar('institution', { length: 200 }),
    verificationState: doctorVerificationStateEnum('verification_state').notNull().default('none'),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    verificationNote: text('verification_note'),

    // Contribution reputation. `trustTier` is derived from `acceptedEditCount` on every
    // accepted edit (lib/trust.ts) — it is stored so queries need no recomputation, but the
    // count is the source of truth.
    trustTier: trustTierEnum('trust_tier').notNull().default('new'),
    acceptedEditCount: integer('accepted_edit_count').notNull().default(0),
    rejectedEditCount: integer('rejected_edit_count').notNull().default(0),
    noteCount: integer('note_count').notNull().default(0),

    isAdmin: boolean('is_admin').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(sql`lower(${table.email})`),
    uniqueIndex('users_handle_unique').on(sql`lower(${table.handle})`),
    index('users_verification_state_idx').on(table.verificationState),
    index('users_trust_tier_idx').on(table.trustTier),
  ],
)

// ---------------------------------------------------------------------------
// drugs — one row per dossier.
//
// Scalar columns are the ones searched, filtered or sorted. Everything the dossier page renders
// as a nested structure is jsonb, typed through lib/types.ts, because edits replace whole
// sections at a time and revisions diff them as units.
// ---------------------------------------------------------------------------

export const drugs = pgTable(
  'drugs',
  {
    id: varchar('id', { length: 96 }).primaryKey(),
    slug: varchar('slug', { length: 128 }).notNull(),

    name: varchar('name', { length: 300 }).notNull(),
    tradeName: varchar('trade_name', { length: 400 }),
    sponsor: varchar('sponsor', { length: 300 }).notNull().default(''),
    targetGene: varchar('target_gene', { length: 200 }).notNull().default(''),
    targetProtein: varchar('target_protein', { length: 300 }).notNull().default(''),

    modality: drugModalityEnum('modality').notNull(),
    approvalStatus: approvalStatusEnum('approval_status').notNull(),
    approvalYear: integer('approval_year'),

    indication: text('indication').notNull().default(''),
    patientFriendlyIndication: text('patient_friendly_indication').notNull().default(''),

    oneSentenceVerdict: text('one_sentence_verdict').notNull().default(''),
    laymanHowItWorks: text('layman_how_it_works').notNull().default(''),

    auditConfidence: auditConfidenceEnum('audit_confidence')
      .notNull()
      .default('Moderate / Debated'),
    confidenceScore: integer('confidence_score').notNull().default(0),

    anatomicalSite: varchar('anatomical_site', { length: 300 }),
    recentAuditDate: varchar('recent_audit_date', { length: 64 }).notNull().default(''),
    hasDiscrepancy: boolean('has_discrepancy').notNull().default(false),

    dossierDepth: dossierDepthEnum('dossier_depth').notNull().default('stub'),

    // Nested dossier sections. Null means "not documented yet" and renders as the contribute
    // prompt — never as invented content.
    conditionContext: jsonb('condition_context').$type<ConditionContext>(),
    pricing: jsonb('pricing').$type<PricingTransparency>(),
    substitutes: jsonb('substitutes').$type<DrugSubstitutes>(),
    molecularSchema: jsonb('molecular_schema').$type<MolecularSchema>(),
    keyAudits: jsonb('key_audits')
      .$type<AuditPoint[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    mechanismSteps: jsonb('mechanism_steps')
      .$type<MechanismStep[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    trials: jsonb('trials')
      .$type<ClinicalTrialRecord[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    measuredVsInferredSummary: jsonb(
      'measured_vs_inferred_summary',
    ).$type<MeasuredVsInferredSummary>(),
    deliverySystem: jsonb('delivery_system').$type<DeliverySystem>(),
    commonQuestions: jsonb('common_questions')
      .$type<CommonQuestion[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    // Provenance for the ingested identity layer, e.g. ['openFDA Drugs@FDA', 'PubChem PUG-REST'].
    sourceProvenance: jsonb('source_provenance')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    // Set only by a passing deterministic sweep of the RNA Intelligence engine. Never by hand.
    isMachineVerifiedStructure: boolean('is_machine_verified_structure').notNull().default(false),
    verificationHash: varchar('verification_hash', { length: 32 }),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),

    revisionCount: integer('revision_count').notNull().default(0),
    viewCount: integer('view_count').notNull().default(0),
    lastEditedAt: timestamp('last_edited_at', { withTimezone: true }),
    lastEditedBy: varchar('last_edited_by', { length: 160 }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),

    // Generated full-text column. The SQL below uses BARE, UNQUALIFIED column names on purpose:
    // interpolating `${drugs.name}` here reintroduces a TS7022 circular self-reference under
    // strict TypeScript, because the table's type would depend on its own column list. Read this
    // comment before "fixing" it.
    searchVector: tsvector('search_vector').generatedAlwaysAs(
      sql`
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(trade_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(target_gene, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(patient_friendly_indication, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(indication, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(sponsor, '')), 'D')
      `,
    ),
  },
  (table) => [
    uniqueIndex('drugs_slug_unique').on(table.slug),
    index('drugs_search_idx').using('gin', table.searchVector),
    index('drugs_modality_idx').on(table.modality),
    index('drugs_approval_status_idx').on(table.approvalStatus),
    index('drugs_depth_idx').on(table.dossierDepth),
    index('drugs_name_idx').on(table.name),
    index('drugs_view_count_idx').on(table.viewCount),
  ],
)

// ---------------------------------------------------------------------------
// drug_aliases — the names a reader actually types
//
// Search has to reach a substance by the name the reader knows, and that is frequently not the
// name the FDA files it under: paracetamol/acetaminophen, adrenaline/epinephrine,
// salbutamol/albuterol. Those are INN-versus-USAN pairs, not typos, and half the English-speaking
// world uses the side the FDA does not. Aliases live in their own table rather than being appended
// to a displayed field, because a search index is not a place to put text that also gets rendered.
// ---------------------------------------------------------------------------

export const aliasKindEnum = pgEnum('alias_kind', [
  'inn',
  'usan',
  'ban',
  'brand',
  'salt_form',
  'common_name',
  'systematic',
])

export const drugAliases = pgTable(
  'drug_aliases',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    drugId: varchar('drug_id', { length: 96 })
      .notNull()
      .references(() => drugs.id, { onDelete: 'cascade' }),
    alias: varchar('alias', { length: 300 }).notNull(),
    kind: aliasKindEnum('kind').notNull().default('common_name'),
    source: varchar('source', { length: 160 }).notNull().default(''),
  },
  (table) => [
    uniqueIndex('drug_aliases_unique').on(table.drugId, sql`lower(${table.alias})`),
    index('drug_aliases_alias_idx').on(sql`lower(${table.alias})`),
    index('drug_aliases_drug_idx').on(table.drugId),
  ],
)

// ---------------------------------------------------------------------------
// community_notes
// ---------------------------------------------------------------------------

export const communityNotes = pgTable(
  'community_notes',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    drugId: varchar('drug_id', { length: 96 })
      .notNull()
      .references(() => drugs.id, { onDelete: 'cascade' }),
    authorUserId: varchar('author_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'set null',
    }),

    // Denormalised author snapshot so a note keeps the credentials it was signed with even if
    // the account later changes specialty or loses verification.
    authorName: varchar('author_name', { length: 160 }).notNull(),
    role: varchar('role', { length: 160 }).notNull().default('Community Contributor'),
    isVerifiedDoctor: boolean('is_verified_doctor').notNull().default(false),
    medicalSpecialty: varchar('medical_specialty', { length: 120 }),
    institution: varchar('institution', { length: 200 }),
    orcid: varchar('orcid', { length: 32 }),

    content: text('content').notNull(),
    upvotes: integer('upvotes').notNull().default(0),
    status: noteStatusEnum('status').notNull().default('published'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('community_notes_drug_idx').on(table.drugId, table.createdAt),
    index('community_notes_author_idx').on(table.authorUserId),
    index('community_notes_status_idx').on(table.status),
  ],
)

/** One row per (note, user). The unique primary key is what makes an upvote idempotent. */
export const noteUpvotes = pgTable(
  'note_upvotes',
  {
    noteId: varchar('note_id', { length: 64 })
      .notNull()
      .references(() => communityNotes.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.noteId, table.userId] })],
)

// ---------------------------------------------------------------------------
// revisions — immutable, timestamped, attributed. Never updated in place except to record a
// human review decision on a pending row.
// ---------------------------------------------------------------------------

export const revisions = pgTable(
  'revisions',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    drugId: varchar('drug_id', { length: 96 })
      .notNull()
      .references(() => drugs.id, { onDelete: 'cascade' }),

    authorUserId: varchar('author_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    authorName: varchar('author_name', { length: 160 }).notNull(),
    authorOrcid: varchar('author_orcid', { length: 32 }),
    authorTrustTier: trustTierEnum('author_trust_tier').notNull().default('new'),

    status: revisionStatusEnum('status').notNull(),
    summary: text('summary').notNull().default(''),

    changedFields: jsonb('changed_fields')
      .$type<RevisionFieldChange[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    /** The full dossier payload this revision proposes. Applied verbatim on approval. */
    proposedPayload: jsonb('proposed_payload').notNull(),

    /** The deterministic engine report captured at submission. Immutable evidence of the sweep. */
    engineReport: jsonb('engine_report'),
    machineVerified: boolean('machine_verified').notNull().default(false),
    verificationHash: varchar('verification_hash', { length: 32 }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewedByUserId: varchar('reviewed_by_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    reviewedByName: varchar('reviewed_by_name', { length: 160 }),
    reviewNote: text('review_note'),
  },
  (table) => [
    index('revisions_drug_idx').on(table.drugId, table.createdAt),
    index('revisions_status_idx').on(table.status, table.createdAt),
    index('revisions_author_idx').on(table.authorUserId),
  ],
)

// ---------------------------------------------------------------------------
// saved_drugs — a reader's bookmarks.
// ---------------------------------------------------------------------------

export const savedDrugs = pgTable(
  'saved_drugs',
  {
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    drugId: varchar('drug_id', { length: 96 })
      .notNull()
      .references(() => drugs.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.drugId] })],
)

// ---------------------------------------------------------------------------
// feedback — the floating Feedback button writes here.
// ---------------------------------------------------------------------------

export const feedback = pgTable(
  'feedback',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    type: feedbackTypeEnum('type').notNull(),
    message: text('message').notNull(),
    email: varchar('email', { length: 320 }),
    drugSlug: varchar('drug_slug', { length: 128 }),
    userId: varchar('user_id', { length: 64 }).references(() => users.id, { onDelete: 'set null' }),
    /** Coarse anonymous fingerprint for rate limiting. Never the raw IP. */
    sessionHash: varchar('session_hash', { length: 64 }),
    resolved: boolean('resolved').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('feedback_created_idx').on(table.createdAt),
    index('feedback_type_idx').on(table.type),
  ],
)

// ---------------------------------------------------------------------------
// ingest_runs — provenance for the bulk identity layer.
// ---------------------------------------------------------------------------

export const ingestRuns = pgTable('ingest_runs', {
  id: varchar('id', { length: 64 }).primaryKey(),
  source: varchar('source', { length: 120 }).notNull(),
  recordsSeen: integer('records_seen').notNull().default(0),
  recordsWritten: integer('records_written').notNull().default(0),
  recordsSkipped: integer('records_skipped').notNull().default(0),
  notes: text('notes'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
})

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const drugsRelations = relations(drugs, ({ many }) => ({
  notes: many(communityNotes),
  revisions: many(revisions),
  aliases: many(drugAliases),
}))

export const drugAliasesRelations = relations(drugAliases, ({ one }) => ({
  drug: one(drugs, { fields: [drugAliases.drugId], references: [drugs.id] }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  notes: many(communityNotes),
  revisions: many(revisions),
  saved: many(savedDrugs),
}))

export const communityNotesRelations = relations(communityNotes, ({ one, many }) => ({
  drug: one(drugs, { fields: [communityNotes.drugId], references: [drugs.id] }),
  author: one(users, { fields: [communityNotes.authorUserId], references: [users.id] }),
  upvoters: many(noteUpvotes),
}))

export const revisionsRelations = relations(revisions, ({ one }) => ({
  drug: one(drugs, { fields: [revisions.drugId], references: [drugs.id] }),
  author: one(users, { fields: [revisions.authorUserId], references: [users.id] }),
}))

export const noteUpvotesRelations = relations(noteUpvotes, ({ one }) => ({
  note: one(communityNotes, { fields: [noteUpvotes.noteId], references: [communityNotes.id] }),
  user: one(users, { fields: [noteUpvotes.userId], references: [users.id] }),
}))

export const savedDrugsRelations = relations(savedDrugs, ({ one }) => ({
  user: one(users, { fields: [savedDrugs.userId], references: [users.id] }),
  drug: one(drugs, { fields: [savedDrugs.drugId], references: [drugs.id] }),
}))
