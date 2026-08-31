import {
  pgTable,
  pgEnum,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  numeric,
  jsonb,
  index,
  unique,
  uniqueIndex,
  primaryKey,
  foreignKey,
  check,
  customType,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { BACKGROUND_SOURCE_KINDS, type MedicineRecordedBackground } from '@/lib/background/types'
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
import {
  CLAIM_DIRECTIONS,
  CLAIM_NATURES,
  CLAIM_SOURCE_RELATIONSHIPS,
  DEPENDENT_SURFACE_TYPES,
  EVIDENCE_NODE_CLAIM_RELATIONSHIPS,
  EVIDENCE_NODE_TYPES,
  EVIDENCE_REVIEW_STATUSES,
  EVIDENCE_REVIEW_TASK_STATUSES,
  EVIDENCE_SOURCE_TYPES,
  EVIDENCE_STATES,
  HUMAN_STUDY_STATUSES,
  MECHANISM_EVIDENCE_BASES,
  MONITOR_RUN_STATUSES,
  PROGRAMME_TIMELINE_DATE_BASES,
  PROGRAMME_TIMELINE_EVENT_TYPES,
  PROGRAMME_STATUSES,
  PROGRAMME_UPDATE_STATUSES,
  REVIEW_IMPACT_LEVELS,
  SOURCE_CHECK_STATUSES,
  SOURCE_CORRECTION_STATUSES,
  SOURCE_FRESHNESS_STATUSES,
  SOURCE_HIERARCHIES,
  STOPPED_PROGRAMME_VERDICTS,
  STOPPING_REASON_CATEGORIES,
  STUDY_INTERPRETABILITY_CRITERIA,
  STUDY_INTERPRETABILITY_STATES,
  TRIAL_ENROLMENT_TYPES,
  TRIAL_RESULTS_STATUSES,
  TRIAL_STATUSES,
  VERDICT_CLAIM_RELATIONSHIPS,
  VERDICT_CONFIDENCE_LEVELS,
  VERDICT_REVIEW_DECISIONS,
  VERDICT_REVIEWER_EXPERTISE_TAGS,
} from '@/lib/evidence/types'
import {
  CONTRIBUTION_AFFECTS,
  CONTRIBUTION_PROPOSAL_STATUSES,
  CONTRIBUTION_PROPOSAL_TYPES,
  CONTRIBUTION_REVIEW_STATUSES,
  CONTRIBUTION_SELECTED_FIELDS,
  SOURCE_REFRESH_ACTIONS,
  type ContributionCurrentValueSnapshot,
  type ContributionCurrentVerdictSnapshot,
  type ContributionImpactPreview,
  type ContributionMachineChecks,
  type ContributionProposedValue,
  type ContributionSourceRefreshDeltaSnapshot,
  type SourceRefreshAffectedInterpretability,
  type SourceRefreshChangedTrialField,
  type SourceRefreshScientificRevisionRequirement,
} from '@/lib/contributions/types'

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

export const legacyIdentityCorrectionFieldEnum = pgEnum('legacy_identity_correction_field', [
  'name',
  'tradeName',
])

export const noteStatusEnum = pgEnum('note_status', ['published', 'hidden', 'flagged'])

export const feedbackTypeEnum = pgEnum('feedback_type', ['suggestion', 'correction', 'request'])

// Programme evidence vocabulary is defined once in lib/evidence/types.ts and shared here. Unlike
// the legacy dossier enums above, adding a TypeScript value without its PostgreSQL counterpart is
// therefore impossible.
export const programmeStatusEnum = pgEnum('programme_status', PROGRAMME_STATUSES)
export const stoppingReasonCategoryEnum = pgEnum(
  'stopping_reason_category',
  STOPPING_REASON_CATEGORIES,
)
export const stoppedProgrammeVerdictEnum = pgEnum(
  'stopped_programme_verdict',
  STOPPED_PROGRAMME_VERDICTS,
)
export const evidenceNodeTypeEnum = pgEnum('evidence_node_type', EVIDENCE_NODE_TYPES)
export const evidenceStateEnum = pgEnum('evidence_state', EVIDENCE_STATES)
export const claimNatureEnum = pgEnum('claim_nature', CLAIM_NATURES)
export const claimDirectionEnum = pgEnum('claim_direction', CLAIM_DIRECTIONS)
export const evidenceReviewStatusEnum = pgEnum('evidence_review_status', EVIDENCE_REVIEW_STATUSES)
export const verdictConfidenceEnum = pgEnum('verdict_confidence', VERDICT_CONFIDENCE_LEVELS)
export const evidenceSourceTypeEnum = pgEnum('evidence_source_type', EVIDENCE_SOURCE_TYPES)
export const sourceHierarchyEnum = pgEnum('source_hierarchy', SOURCE_HIERARCHIES)
export const sourceCorrectionStatusEnum = pgEnum(
  'source_correction_status',
  SOURCE_CORRECTION_STATUSES,
)
export const claimSourceRelationshipEnum = pgEnum(
  'claim_source_relationship',
  CLAIM_SOURCE_RELATIONSHIPS,
)
export const evidenceNodeClaimRelationshipEnum = pgEnum(
  'evidence_node_claim_relationship',
  EVIDENCE_NODE_CLAIM_RELATIONSHIPS,
)
export const verdictClaimRelationshipEnum = pgEnum(
  'verdict_claim_relationship',
  VERDICT_CLAIM_RELATIONSHIPS,
)
export const verdictReviewDecisionEnum = pgEnum('verdict_review_decision', VERDICT_REVIEW_DECISIONS)
export const verdictReviewerExpertiseEnum = pgEnum(
  'verdict_reviewer_expertise',
  VERDICT_REVIEWER_EXPERTISE_TAGS,
)
export const programmeUpdateStatusEnum = pgEnum(
  'programme_update_status',
  PROGRAMME_UPDATE_STATUSES,
)
export const sourceCheckStatusEnum = pgEnum('source_check_status', SOURCE_CHECK_STATUSES)
export const sourceFreshnessStatusEnum = pgEnum(
  'source_freshness_status',
  SOURCE_FRESHNESS_STATUSES,
)
export const dependentSurfaceTypeEnum = pgEnum('dependent_surface_type', DEPENDENT_SURFACE_TYPES)
export const mechanismEvidenceBasisEnum = pgEnum(
  'mechanism_evidence_basis',
  MECHANISM_EVIDENCE_BASES,
)
export const programmeTimelineEventTypeEnum = pgEnum(
  'programme_timeline_event_type',
  PROGRAMME_TIMELINE_EVENT_TYPES,
)
export const programmeTimelineDateBasisEnum = pgEnum(
  'programme_timeline_date_basis',
  PROGRAMME_TIMELINE_DATE_BASES,
)
export const reviewImpactLevelEnum = pgEnum('review_impact_level', REVIEW_IMPACT_LEVELS)
export const trialStatusEnum = pgEnum('trial_status', TRIAL_STATUSES)
export const trialResultsStatusEnum = pgEnum('trial_results_status', TRIAL_RESULTS_STATUSES)
export const trialEnrolmentTypeEnum = pgEnum('trial_enrolment_type', TRIAL_ENROLMENT_TYPES)
export const humanStudyStatusEnum = pgEnum('human_study_status', HUMAN_STUDY_STATUSES)
export const studyInterpretabilityCriterionEnum = pgEnum(
  'study_interpretability_criterion',
  STUDY_INTERPRETABILITY_CRITERIA,
)
export const studyInterpretabilityStateEnum = pgEnum(
  'study_interpretability_state',
  STUDY_INTERPRETABILITY_STATES,
)
export const monitorRunStatusEnum = pgEnum('monitor_run_status', MONITOR_RUN_STATUSES)
export const evidenceReviewTaskStatusEnum = pgEnum(
  'evidence_review_task_status',
  EVIDENCE_REVIEW_TASK_STATUSES,
)
export const contributionProposalTypeEnum = pgEnum(
  'contribution_proposal_type',
  CONTRIBUTION_PROPOSAL_TYPES,
)
export const sourceRefreshActionEnum = pgEnum('source_refresh_action', SOURCE_REFRESH_ACTIONS)
export const contributionProposalStatusEnum = pgEnum(
  'contribution_proposal_status',
  CONTRIBUTION_PROPOSAL_STATUSES,
)
export const contributionAffectsEnum = pgEnum('contribution_affects', CONTRIBUTION_AFFECTS)
export const contributionSelectedFieldEnum = pgEnum(
  'contribution_selected_field',
  CONTRIBUTION_SELECTED_FIELDS,
)
export const contributionReviewStatusEnum = pgEnum(
  'contribution_review_status',
  CONTRIBUTION_REVIEW_STATUSES,
)

/** The recorded-background source vocabulary is shared with the immutable envelope contract. */
export const backgroundSourceKindEnum = pgEnum('background_source_kind', BACKGROUND_SOURCE_KINDS)

/**
 * A fetch is an operational observation, not an assertion verdict. In particular, an unreachable
 * or unsupported source is never evidence that the recorded assertion drifted.
 */
export const backgroundSourceFetchStatusEnum = pgEnum('background_source_fetch_status', [
  'SUCCEEDED',
  'UNREACHABLE',
  'UNSUPPORTED',
  'FAILED',
])

/** Only a successful fetch can produce one of these deterministic assertion results. */
export const backgroundAssertionResultEnum = pgEnum('background_assertion_result', [
  'CURRENT',
  'NUMBERS_CURRENT',
  'DRIFTED',
])

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

    // Historical editorial standing and counters. Current review paths do not auto-promote an
    // account from these counts; canonical scientific review also requires separate qualification.
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

/**
 * Self-managed public settings for the homepage's weekly contributor spotlight.
 *
 * The spotlight can recognise the handle already attached to a published contribution without a
 * settings row. External profile links are different: they remain private until this account has
 * both supplied them and explicitly enabled their display. Public reads validate the JSON again,
 * so an invalid value written outside the application is omitted instead of becoming a link.
 */
export const contributorPublicSettings = pgTable(
  'contributor_public_settings',
  {
    userId: varchar('user_id', { length: 64 })
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    appearInWeeklySpotlight: boolean('appear_in_weekly_spotlight').notNull().default(true),
    showSocialLinksInSpotlight: boolean('show_social_links_in_spotlight').notNull().default(false),
    socialLinks: jsonb('social_links')
      .$type<Array<{ platform: 'x' | 'linkedin' | 'github' | 'bluesky'; url: string }>>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'contributor_public_settings_social_links_array',
      sql`jsonb_typeof(${table.socialLinks}) = 'array' and jsonb_array_length(${table.socialLinks}) <= 4`,
    ),
    check(
      'contributor_public_settings_social_opt_in',
      sql`not ${table.showSocialLinksInSpotlight} or jsonb_array_length(${table.socialLinks}) > 0`,
    ),
  ],
)

/**
 * One immutable snapshot for each physician-credential submission. The account row carries only
 * the currently reviewed public badge state; private workplace identity and the exact decision
 * trail live here and are never selected by public profile queries.
 */
export const physicianVerificationRequests = pgTable(
  'physician_verification_requests',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    userId: varchar('user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    professionalFullName: varchar('professional_full_name', { length: 160 }).notNull(),
    workEmail: varchar('work_email', { length: 320 }).notNull(),
    medicalLicenseOrNpi: varchar('medical_license_or_npi', { length: 64 }).notNull(),
    medicalSpecialty: varchar('medical_specialty', { length: 120 }).notNull(),
    institution: varchar('institution', { length: 200 }).notNull(),
    status: doctorVerificationStateEnum('status').notNull().default('pending'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    decidedByUserId: varchar('decided_by_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'restrict',
    }),
    decisionReason: text('decision_reason'),
  },
  (table) => [
    uniqueIndex('physician_verification_one_pending_per_user')
      .on(table.userId)
      .where(sql`${table.status} = 'pending'`),
    index('physician_verification_queue_idx').on(table.status, table.submittedAt),
    index('physician_verification_decider_idx').on(table.decidedByUserId, table.decidedAt),
    check(
      'physician_verification_status',
      sql`${table.status} in ('pending', 'verified', 'rejected')`,
    ),
    check(
      'physician_verification_submitted_identity',
      sql`nullif(btrim(${table.professionalFullName}), '') is not null
        and nullif(btrim(${table.workEmail}), '') is not null
        and nullif(btrim(${table.medicalLicenseOrNpi}), '') is not null
        and nullif(btrim(${table.medicalSpecialty}), '') is not null
        and nullif(btrim(${table.institution}), '') is not null`,
    ),
    check(
      'physician_verification_decision_shape',
      sql`(${table.status} = 'pending'
          and ${table.decidedAt} is null
          and ${table.decidedByUserId} is null
          and ${table.decisionReason} is null)
        or (${table.status} in ('verified', 'rejected')
          and ${table.decidedAt} is not null
          and ${table.decidedByUserId} is not null
          and nullif(btrim(${table.decisionReason}), '') is not null)`,
    ),
  ],
)

/**
 * Application-owned account role changes. The first event is a one-time self-bootstrap for an
 * existing account; no signup payload or ordinary route can create an administrator. Later role
 * changes intentionally have no application workflow until their own reviewed event type exists.
 */
export const accountRoleEvents = pgTable(
  'account_role_events',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    targetUserId: varchar('target_user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    actorUserId: varchar('actor_user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    action: varchar('action', { length: 32 }).notNull(),
    previousIsAdmin: boolean('previous_is_admin').notNull(),
    nextIsAdmin: boolean('next_is_admin').notNull(),
    previousTrustTier: trustTierEnum('previous_trust_tier').notNull(),
    nextTrustTier: trustTierEnum('next_trust_tier').notNull(),
    reason: text('reason').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('account_role_events_target_idx').on(table.targetUserId, table.createdAt),
    index('account_role_events_actor_idx').on(table.actorUserId, table.createdAt),
    check('account_role_events_action', sql`${table.action} = 'BOOTSTRAP_ADMIN'`),
    check(
      'account_role_events_bootstrap_shape',
      sql`${table.actorUserId} = ${table.targetUserId}
        and not ${table.previousIsAdmin}
        and ${table.nextIsAdmin}
        and ${table.previousTrustTier} = ${table.nextTrustTier}
        and nullif(btrim(${table.reason}), '') is not null`,
    ),
  ],
)

/**
 * Immutable steward/admin decisions about who may review canonical programme conclusions.
 * Trust tier controls general editorial standing; these events separately record scientific
 * qualification. The latest event for one user/tag determines whether that qualification is
 * active, while every grant and revocation remains auditable.
 */
export const programmeVerdictReviewerQualificationEvents = pgTable(
  'programme_verdict_reviewer_qualification_events',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    reviewerUserId: varchar('reviewer_user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    expertiseTag: verdictReviewerExpertiseEnum('expertise_tag').notNull(),
    action: varchar('action', { length: 16 }).notNull(),
    authorizedByUserId: varchar('authorized_by_user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    reason: text('reason').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('programme_verdict_qualification_reviewer_idx').on(
      table.reviewerUserId,
      table.expertiseTag,
      table.createdAt,
    ),
    index('programme_verdict_qualification_authorizer_idx').on(
      table.authorizedByUserId,
      table.createdAt,
    ),
    check('programme_verdict_qualification_action', sql`${table.action} in ('GRANT', 'REVOKE')`),
    check(
      'programme_verdict_qualification_reason',
      sql`nullif(btrim(${table.reason}), '') is not null`,
    ),
    check(
      'programme_verdict_qualification_no_self_grant',
      sql`${table.reviewerUserId} <> ${table.authorizedByUserId}`,
    ),
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
    // Versioned medicine-background/v1 envelope: label/registry facts fetched at authoring time,
    // validated by the deterministic background engine. Never a reviewed programme conclusion.
    recordedBackground: jsonb('recorded_background').$type<MedicineRecordedBackground>(),
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
// medicine_slug_redirects — deliberate public URL history
//
// A search alias is not evidence that an old URL represented the same public record. Redirects
// therefore live in a separate, owner-curated ledger with an explicit reason and rationale. The
// table starts empty: migration must never guess that two medical identities should be merged.
// ---------------------------------------------------------------------------

export const medicineSlugRedirectReasonEnum = pgEnum('medicine_slug_redirect_reason', [
  'RENAMED',
  'MERGED',
])

export const medicineSlugRedirects = pgTable(
  'medicine_slug_redirects',
  {
    oldSlug: varchar('old_slug', { length: 128 }).primaryKey(),
    targetDrugId: varchar('target_drug_id', { length: 96 })
      .notNull()
      .references(() => drugs.id, { onDelete: 'restrict' }),
    reason: medicineSlugRedirectReasonEnum('reason').notNull(),
    rationale: text('rationale').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('medicine_slug_redirects_target_idx').on(table.targetDrugId),
    check('medicine_slug_redirects_slug_shape', sql`${table.oldSlug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check(
      'medicine_slug_redirects_rationale_nonempty',
      sql`nullif(btrim(${table.rationale}), '') is not null`,
    ),
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
      .references(() => drugs.id, { onDelete: 'restrict' }),

    authorUserId: varchar('author_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'restrict',
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

    /** Historical JSON column. New identity corrections may contain only their one-field payload. */
    proposedPayload: jsonb('proposed_payload').notNull(),

    /** Historical broad-editor fields. Migration 0011 forbids them on new identity corrections. */
    engineReport: jsonb('engine_report'),
    machineVerified: boolean('machine_verified').notNull().default(false),
    verificationHash: varchar('verification_hash', { length: 32 }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewedByUserId: varchar('reviewed_by_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'restrict',
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

/** The strict, immutable contract for identity-only corrections submitted through the old route. */
export const legacyIdentityCorrectionDetails = pgTable(
  'legacy_identity_correction_details',
  {
    revisionId: varchar('revision_id', { length: 64 })
      .primaryKey()
      .references(() => revisions.id, { onDelete: 'restrict' }),
    field: legacyIdentityCorrectionFieldEnum('field').notNull(),
    previousValue: text('previous_value'),
    proposedValue: text('proposed_value'),
    sourceUrl: text('source_url').notNull(),
    sourceTitle: varchar('source_title', { length: 300 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'legacy_identity_correction_previous_value_valid',
      sql`${table.field} = 'tradeName' or nullif(btrim(${table.previousValue}), '') is not null`,
    ),
    check(
      'legacy_identity_correction_proposed_value_valid',
      sql`(${table.field} = 'name'
          and nullif(btrim(${table.proposedValue}), '') is not null
          and ${table.proposedValue} = btrim(${table.proposedValue})
          and char_length(${table.proposedValue}) <= 300)
        or (${table.field} = 'tradeName'
          and (${table.proposedValue} is null
            or (nullif(btrim(${table.proposedValue}), '') is not null
              and ${table.proposedValue} = btrim(${table.proposedValue})
              and char_length(${table.proposedValue}) <= 400)))`,
    ),
    check(
      'legacy_identity_correction_source_title_valid',
      sql`char_length(btrim(${table.sourceTitle})) between 3 and 300
        and ${table.sourceTitle} = btrim(${table.sourceTitle})`,
    ),
    check(
      'legacy_identity_correction_source_url_valid',
      sql`${table.sourceUrl} = btrim(${table.sourceUrl})
        and ${table.sourceUrl} ~* '^https?://[^/?#@:[:space:]][^/?#@[:space:]]*([/?#]|$)'
        and ${table.sourceUrl} !~* '^https?://[^/?#]*@'
        and ${table.sourceUrl} !~ '[[:space:][:cntrl:]]'
        and char_length(${table.sourceUrl}) <= 2048`,
    ),
  ],
)

/** Existing unsafe pending rows stay unchanged and are removed from the live review queue. */
export const legacyRevisionQuarantines = pgTable(
  'legacy_revision_quarantines',
  {
    revisionId: varchar('revision_id', { length: 64 })
      .primaryKey()
      .references(() => revisions.id, { onDelete: 'restrict' }),
    reasonCode: varchar('reason_code', { length: 64 }).notNull(),
    systemReason: text('system_reason').notNull(),
    quarantinedAt: timestamp('quarantined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'legacy_revision_quarantine_reason_code',
      sql`${table.reasonCode} = 'pre_0011_unsafe_pending'`,
    ),
    check(
      'legacy_revision_quarantine_system_reason',
      sql`nullif(btrim(${table.systemReason}), '') is not null`,
    ),
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
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolvedByUserId: varchar('resolved_by_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'restrict',
    }),
    resolutionNote: text('resolution_note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('feedback_created_idx').on(table.createdAt),
    index('feedback_type_idx').on(table.type),
    index('feedback_resolution_queue_idx').on(table.resolved, table.createdAt),
    check(
      'feedback_resolution_shape',
      sql`(not ${table.resolved}
          and ${table.resolvedAt} is null
          and ${table.resolvedByUserId} is null
          and ${table.resolutionNote} is null)
        or (${table.resolved}
          and ${table.resolvedAt} is not null
          and ${table.resolvedByUserId} is not null
          and nullif(btrim(${table.resolutionNote}), '') is not null)`,
    ),
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
// Programme-scoped evidence foundation
//
// These tables are additive. Existing dossier fields remain the compatibility/read fallback until
// a medicine has an explicitly sourced programme. No migration fabricates programmes or claims
// from the legacy JSON because an indication-specific conclusion cannot be inferred safely.
// ---------------------------------------------------------------------------

export const developmentProgrammes = pgTable(
  'development_programmes',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    drugId: varchar('drug_id', { length: 96 })
      .notNull()
      .references(() => drugs.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 128 }).notNull(),
    title: varchar('title', { length: 300 }).notNull(),
    indication: text('indication'),
    targetPopulation: text('target_population'),
    jurisdiction: varchar('jurisdiction', { length: 120 }),
    sponsor: varchar('sponsor', { length: 300 }),
    partners: jsonb('partners')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    status: programmeStatusEnum('status').notNull().default('UNKNOWN'),
    highestPhaseReached: varchar('highest_phase_reached', { length: 80 }),
    route: varchar('route', { length: 160 }),
    doseExposureContext: text('dose_exposure_context'),
    startDate: date('start_date'),
    endDate: date('end_date'),
    rawStoppingReason: text('raw_stopping_reason'),
    stoppingReasonCategory: stoppingReasonCategoryEnum('stopping_reason_category')
      .notNull()
      .default('UNKNOWN'),
    updateStatus: programmeUpdateStatusEnum('update_status').notNull().default('NOT_ASSESSED'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('development_programmes_drug_slug_unique').on(table.drugId, table.slug),
    index('development_programmes_drug_status_idx').on(table.drugId, table.status),
    index('development_programmes_update_idx').on(table.updateStatus, table.updatedAt),
    check(
      'development_programmes_dates_order',
      sql`${table.startDate} is null or ${table.endDate} is null or ${table.endDate} >= ${table.startDate}`,
    ),
  ],
)

export const evidenceSources = pgTable(
  'evidence_sources',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    sourceType: evidenceSourceTypeEnum('source_type').notNull().default('UNKNOWN'),
    // Background freshness stores its canonical KIND:identifier key here; 480 accommodates the
    // 400-character kind-specific identifier plus the longest controlled kind namespace.
    externalIdentifier: varchar('external_identifier', { length: 480 }),
    canonicalLocator: text('canonical_locator').notNull(),
    title: text('title'),
    publisher: varchar('publisher', { length: 300 }),
    sponsor: varchar('sponsor', { length: 300 }),
    publicationDate: date('publication_date'),
    correctionStatus: sourceCorrectionStatusEnum('correction_status').notNull().default('UNKNOWN'),
    jurisdiction: varchar('jurisdiction', { length: 120 }),
    hierarchy: sourceHierarchyEnum('hierarchy').notNull().default('UNKNOWN'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('evidence_sources_identifier_unique')
      .on(table.sourceType, table.externalIdentifier)
      .where(sql`${table.externalIdentifier} is not null`),
    index('evidence_sources_type_idx').on(table.sourceType),
    index('evidence_sources_correction_idx').on(table.correctionStatus),
  ],
)

/**
 * An immutable, content-addressed observation of a source. The SQL migration adds a trigger that
 * rejects UPDATE and DELETE, so a claim always resolves to the exact source material it cited.
 */
export const sourceSnapshots = pgTable(
  'source_snapshots',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    sourceId: varchar('source_id', { length: 64 })
      .notNull()
      .references(() => evidenceSources.id, { onDelete: 'restrict' }),
    previousSnapshotId: varchar('previous_snapshot_id', { length: 64 }),
    retrievedAt: timestamp('retrieved_at', { withTimezone: true }).notNull().defaultNow(),
    sourcePublishedAt: timestamp('source_published_at', { withTimezone: true }),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    hashAlgorithm: varchar('hash_algorithm', { length: 16 }).notNull().default('sha256'),
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    metadataHash: varchar('metadata_hash', { length: 64 }),
    structuredData: jsonb('structured_data')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    permittedExcerpt: text('permitted_excerpt'),
    rawSnapshotLocator: text('raw_snapshot_locator'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('source_snapshots_source_hash_unique').on(table.sourceId, table.contentHash),
    unique('source_snapshots_id_source_unique').on(table.id, table.sourceId),
    index('source_snapshots_source_retrieved_idx').on(table.sourceId, table.retrievedAt),
    index('source_snapshots_previous_idx').on(table.previousSnapshotId),
    foreignKey({
      name: 'source_snapshots_previous_same_source_fk',
      columns: [table.previousSnapshotId, table.sourceId],
      foreignColumns: [table.id, table.sourceId],
    }).onDelete('restrict'),
    check('source_snapshots_hash_algorithm', sql`${table.hashAlgorithm} = 'sha256'`),
    check('source_snapshots_content_hash_format', sql`${table.contentHash} ~ '^[0-9a-f]{64}$'`),
    check(
      'source_snapshots_metadata_hash_format',
      sql`${table.metadataHash} is null or ${table.metadataHash} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      'source_snapshots_previous_not_self',
      sql`${table.previousSnapshotId} is null or ${table.previousSnapshotId} <> ${table.id}`,
    ),
  ],
)

/* ---------------------------------------------------------------------------------------------- */
/* Recorded-background source freshness                                                            */
/*                                                                                                  */
/* These are append-only observations of the existing medicine-background/v1 envelope. They may    */
/* raise a review candidate; they must never update the envelope or select replacement medical text. */
/* A binding is exact, a fetch is operational, and an assertion check exists only for a successful  */
/* immutable source snapshot. Keeping those concepts separate makes network failure unable to become */
/* source drift.                                                                                     */
/* ---------------------------------------------------------------------------------------------- */

/**
 * One content-addressed assertion in the exact recorded-background envelope from which it came.
 * Re-deriving current bindings from `drugs.recorded_background` is what determines whether this
 * historical row is still applicable; no mutable "current" flag is stored here.
 */
export const backgroundSourceBindings = pgTable(
  'background_source_bindings',
  {
    id: varchar('id', { length: 96 }).primaryKey(),
    drugId: varchar('drug_id', { length: 96 })
      .notNull()
      .references(() => drugs.id, { onDelete: 'restrict' }),
    recordedBackgroundDigest: varchar('recorded_background_digest', { length: 71 }).notNull(),
    fieldPath: varchar('field_path', { length: 1000 }).notNull(),
    sourcePath: varchar('source_path', { length: 1000 }).notNull(),
    sourceId: varchar('source_id', { length: 64 })
      .notNull()
      .references(() => evidenceSources.id, { onDelete: 'restrict' }),
    sourceKind: backgroundSourceKindEnum('source_kind').notNull(),
    sourceIdentifier: varchar('source_identifier', { length: 400 }).notNull(),
    /** Canonical, kind-namespaced fetch identity: `${sourceKind}:${sourceIdentifier}`. */
    sourceKey: varchar('source_key', { length: 480 }).notNull(),
    sourceLabel: text('source_label').notNull(),
    sourceLocator: text('source_locator'),
    sourceRetrievedAt: timestamp('source_retrieved_at', { withTimezone: true }).notNull(),
    sourceExcerpt: text('source_excerpt').notNull(),
    assertionDigest: varchar('assertion_digest', { length: 71 }).notNull(),
    /** Null is deliberate: an unmapped assertion can never make a reader question stale. */
    questionIntent: varchar('question_intent', { length: 32 }),
    bindingSchema: varchar('binding_schema', { length: 40 }).notNull(),
    boundAt: timestamp('bound_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('background_source_bindings_assertion_scope_unique').on(
      table.id,
      table.sourceId,
      table.sourceKey,
      table.assertionDigest,
    ),
    index('background_source_bindings_drug_envelope_idx').on(
      table.drugId,
      table.recordedBackgroundDigest,
    ),
    index('background_source_bindings_source_idx').on(table.sourceKey, table.boundAt),
    check(
      'background_source_bindings_id_format',
      sql`${table.id} ~ '^background_binding_[0-9a-f]{64}$'`,
    ),
    check(
      'background_source_bindings_digests',
      sql`${table.recordedBackgroundDigest} ~ '^sha256:[0-9a-f]{64}$'
        and ${table.assertionDigest} ~ '^sha256:[0-9a-f]{64}$'`,
    ),
    check(
      'background_source_bindings_paths',
      sql`nullif(btrim(${table.fieldPath}), '') is not null
        and nullif(btrim(${table.sourcePath}), '') is not null`,
    ),
    check(
      'background_source_bindings_source_identity',
      sql`nullif(btrim(${table.sourceIdentifier}), '') is not null
        and ${table.sourceKey} = ${table.sourceKind}::text || ':' || ${table.sourceIdentifier}`,
    ),
    check(
      'background_source_bindings_source_copy',
      sql`nullif(btrim(${table.sourceLabel}), '') is not null
        and char_length(${table.sourceLabel}) <= 2000
        and (${table.sourceLocator} is null or (
          nullif(btrim(${table.sourceLocator}), '') is not null
          and char_length(${table.sourceLocator}) <= 2000
        ))
        and nullif(btrim(${table.sourceExcerpt}), '') is not null
        and char_length(${table.sourceExcerpt}) <= 400`,
    ),
    check(
      'background_source_bindings_question_intent',
      sql`${table.questionIntent} is null or ${table.questionIntent} in (
        'identity', 'purpose', 'regulatory-status', 'bottom-line', 'evidence-scope',
        'measurement', 'results-magnitude', 'meaning-limitations', 'applicability', 'harms',
        'mechanism', 'evidence-certainty', 'programme-history', 'failure-analysis', 'unknowns',
        'sources', 'review-provenance', 'freshness', 'corrections'
      )`,
    ),
    check(
      'background_source_bindings_schema',
      sql`${table.bindingSchema} = 'background-source-binding/v1'`,
    ),
  ],
)

/**
 * One bounded attempt to fetch a kind-namespaced source. A successful attempt must point at the
 * immutable content snapshot it observed. Every other status is persisted without a snapshot and
 * is therefore structurally ineligible for assertion comparison.
 */
export const backgroundSourceFetches = pgTable(
  'background_source_fetches',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    sourceId: varchar('source_id', { length: 64 })
      .notNull()
      .references(() => evidenceSources.id, { onDelete: 'restrict' }),
    sourceKind: backgroundSourceKindEnum('source_kind').notNull(),
    sourceIdentifier: varchar('source_identifier', { length: 400 }).notNull(),
    sourceKey: varchar('source_key', { length: 480 }).notNull(),
    status: backgroundSourceFetchStatusEnum('status').notNull(),
    sourceSnapshotId: varchar('source_snapshot_id', { length: 64 }),
    fetcherVersion: varchar('fetcher_version', { length: 48 }).notNull(),
    attemptedAt: timestamp('attempted_at', { withTimezone: true }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull(),
    /** Stable, non-secret machine category such as HTTP_503, TIMEOUT, or NO_ADAPTER. */
    failureCode: varchar('failure_code', { length: 64 }),
    /** Sanitized operational detail; never a URL containing credentials or an environment value. */
    failureDetail: text('failure_detail'),
  },
  (table) => [
    unique('background_source_fetches_observation_scope_unique').on(
      table.id,
      table.sourceId,
      table.sourceKey,
      table.sourceSnapshotId,
      table.status,
    ),
    foreignKey({
      name: 'background_source_fetches_snapshot_source_fk',
      columns: [table.sourceSnapshotId, table.sourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    index('background_source_fetches_source_completed_idx').on(table.sourceKey, table.completedAt),
    index('background_source_fetches_status_completed_idx').on(table.status, table.completedAt),
    check('background_source_fetches_id_format', sql`${table.id} ~ '^[0-9a-f]{64}$'`),
    check(
      'background_source_fetches_source_identity',
      sql`nullif(btrim(${table.sourceIdentifier}), '') is not null
        and ${table.sourceKey} = ${table.sourceKind}::text || ':' || ${table.sourceIdentifier}`,
    ),
    check(
      'background_source_fetches_version',
      sql`nullif(btrim(${table.fetcherVersion}), '') is not null`,
    ),
    check(
      'background_source_fetches_time_order',
      sql`${table.completedAt} >= ${table.attemptedAt}`,
    ),
    check(
      'background_source_fetches_result_shape',
      sql`(${table.status} = 'SUCCEEDED'
          and ${table.sourceSnapshotId} is not null
          and ${table.failureCode} is null
          and ${table.failureDetail} is null)
        or (${table.status} in ('UNREACHABLE', 'UNSUPPORTED', 'FAILED')
          and ${table.sourceSnapshotId} is null
          and nullif(btrim(${table.failureCode}), '') is not null
          and nullif(btrim(${table.failureDetail}), '') is not null)`,
    ),
  ],
)

/**
 * A deterministic verdict about one exact binding against one successful fetch. The redundant
 * scope columns are intentional: the composite foreign keys make it impossible to associate a
 * binding with another source, or to evaluate it against another fetch's snapshot.
 */
export const backgroundAssertionChecks = pgTable(
  'background_assertion_checks',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    bindingId: varchar('binding_id', { length: 96 }).notNull(),
    bindingAssertionDigest: varchar('binding_assertion_digest', { length: 71 }).notNull(),
    fetchId: varchar('fetch_id', { length: 64 }).notNull(),
    sourceId: varchar('source_id', { length: 64 }).notNull(),
    sourceKey: varchar('source_key', { length: 480 }).notNull(),
    sourceSnapshotId: varchar('source_snapshot_id', { length: 64 }).notNull(),
    /** Fixed to SUCCEEDED and included in the fetch FK so failed fetches cannot be checked. */
    fetchStatus: backgroundSourceFetchStatusEnum('fetch_status').notNull().default('SUCCEEDED'),
    result: backgroundAssertionResultEnum('result').notNull(),
    checkerVersion: varchar('checker_version', { length: 48 }).notNull(),
    details: jsonb('details')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('background_assertion_checks_observation_unique').on(
      table.bindingId,
      table.fetchId,
      table.checkerVersion,
    ),
    foreignKey({
      name: 'background_assertion_checks_binding_scope_fk',
      columns: [table.bindingId, table.sourceId, table.sourceKey, table.bindingAssertionDigest],
      foreignColumns: [
        backgroundSourceBindings.id,
        backgroundSourceBindings.sourceId,
        backgroundSourceBindings.sourceKey,
        backgroundSourceBindings.assertionDigest,
      ],
    }).onDelete('restrict'),
    foreignKey({
      name: 'background_assertion_checks_fetch_scope_fk',
      columns: [
        table.fetchId,
        table.sourceId,
        table.sourceKey,
        table.sourceSnapshotId,
        table.fetchStatus,
      ],
      foreignColumns: [
        backgroundSourceFetches.id,
        backgroundSourceFetches.sourceId,
        backgroundSourceFetches.sourceKey,
        backgroundSourceFetches.sourceSnapshotId,
        backgroundSourceFetches.status,
      ],
    }).onDelete('restrict'),
    foreignKey({
      name: 'background_assertion_checks_snapshot_source_fk',
      columns: [table.sourceSnapshotId, table.sourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    index('background_assertion_checks_binding_checked_idx').on(table.bindingId, table.checkedAt),
    index('background_assertion_checks_result_checked_idx').on(table.result, table.checkedAt),
    check('background_assertion_checks_id_format', sql`${table.id} ~ '^[0-9a-f]{64}$'`),
    check(
      'background_assertion_checks_digest',
      sql`${table.bindingAssertionDigest} ~ '^sha256:[0-9a-f]{64}$'`,
    ),
    check('background_assertion_checks_successful_fetch', sql`${table.fetchStatus} = 'SUCCEEDED'`),
    check(
      'background_assertion_checks_version',
      sql`nullif(btrim(${table.checkerVersion}), '') is not null`,
    ),
    check(
      'background_assertion_checks_details',
      sql`jsonb_typeof(${table.details}) = 'object'
        and (${table.result} <> 'DRIFTED' or ${table.details} <> '{}'::jsonb)`,
    ),
  ],
)

/** One registry-addressable study inside one medicine-specific development programme. */
export const programmeTrials = pgTable(
  'programme_trials',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    programmeId: varchar('programme_id', { length: 64 })
      .notNull()
      .references(() => developmentProgrammes.id, { onDelete: 'cascade' }),
    trialIdentifier: varchar('trial_identifier', { length: 160 }).notNull(),
    title: text('title'),
    phase: varchar('phase', { length: 80 }),
    status: trialStatusEnum('status').notNull().default('UNKNOWN'),
    resultsStatus: trialResultsStatusEnum('results_status').notNull().default('UNKNOWN'),
    enrolment: integer('enrolment'),
    enrolmentType: trialEnrolmentTypeEnum('enrolment_type').notNull().default('UNKNOWN'),
    startDate: date('start_date'),
    primaryCompletionDate: date('primary_completion_date'),
    completionDate: date('completion_date'),
    humanStudyStatus: humanStudyStatusEnum('human_study_status').notNull().default('UNKNOWN'),
    registrySourceId: varchar('registry_source_id', { length: 64 }).references(
      () => evidenceSources.id,
      { onDelete: 'restrict' },
    ),
    registrySnapshotId: varchar('registry_snapshot_id', { length: 64 }),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('programme_trials_identifier_unique').on(table.programmeId, table.trialIdentifier),
    unique('programme_trials_id_programme_unique').on(table.id, table.programmeId),
    foreignKey({
      name: 'programme_trials_snapshot_source_fk',
      columns: [table.registrySnapshotId, table.registrySourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    index('programme_trials_programme_status_idx').on(table.programmeId, table.status),
    index('programme_trials_registry_source_idx').on(table.registrySourceId),
    check(
      'programme_trials_enrolment_nonnegative',
      sql`${table.enrolment} is null or ${table.enrolment} >= 0`,
    ),
    check(
      'programme_trials_dates_order',
      sql`${table.startDate} is null or ${table.completionDate} is null or ${table.completionDate} >= ${table.startDate}`,
    ),
    check(
      'programme_trials_snapshot_has_source',
      sql`${table.registrySnapshotId} is null or ${table.registrySourceId} is not null`,
    ),
  ],
)

/** Versioned answers to the five "could the test answer the question?" criteria. */
export const trialInterpretabilityAssessments = pgTable(
  'trial_interpretability_assessments',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    programmeTrialId: varchar('programme_trial_id', { length: 64 }).notNull(),
    criterion: studyInterpretabilityCriterionEnum('criterion').notNull(),
    state: studyInterpretabilityStateEnum('state').notNull().default('NOT_REPORTED'),
    revisionNumber: integer('revision_number').notNull(),
    previousAssessmentId: varchar('previous_assessment_id', { length: 64 }),
    reviewStatus: evidenceReviewStatusEnum('review_status').notNull().default('DRAFT'),
    explanation: text('explanation'),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    authorUserId: varchar('author_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    supersededAt: timestamp('superseded_at', { withTimezone: true }),
  },
  (table) => [
    unique('trial_interpretability_id_programme_unique').on(table.id, table.programmeId),
    uniqueIndex('trial_interpretability_trial_criterion_revision_unique').on(
      table.programmeTrialId,
      table.criterion,
      table.revisionNumber,
    ),
    uniqueIndex('trial_interpretability_one_published')
      .on(table.programmeTrialId, table.criterion)
      .where(sql`${table.reviewStatus} = 'PUBLISHED'`),
    foreignKey({
      name: 'trial_interpretability_trial_programme_fk',
      columns: [table.programmeTrialId, table.programmeId],
      foreignColumns: [programmeTrials.id, programmeTrials.programmeId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'trial_interpretability_previous_programme_fk',
      columns: [table.previousAssessmentId, table.programmeId],
      foreignColumns: [table.id, table.programmeId],
    }).onDelete('restrict'),
    index('trial_interpretability_programme_status_idx').on(table.programmeId, table.reviewStatus),
    index('trial_interpretability_previous_idx').on(table.previousAssessmentId),
    check('trial_interpretability_revision_positive', sql`${table.revisionNumber} > 0`),
    check(
      'trial_interpretability_previous_not_self',
      sql`${table.previousAssessmentId} is null or ${table.previousAssessmentId} <> ${table.id}`,
    ),
    check(
      'trial_interpretability_publication_dates',
      sql`(${table.reviewStatus} <> 'PUBLISHED' or ${table.publishedAt} is not null)
        and (${table.reviewStatus} <> 'SUPERSEDED' or ${table.supersededAt} is not null)`,
    ),
  ],
)

/** Each row is one immutable-content claim revision; claimKey identifies its logical lineage. */
export const claims = pgTable(
  'claims',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    programmeId: varchar('programme_id', { length: 64 })
      .notNull()
      .references(() => developmentProgrammes.id, { onDelete: 'cascade' }),
    claimKey: varchar('claim_key', { length: 128 }).notNull(),
    revisionNumber: integer('revision_number').notNull(),
    previousClaimId: varchar('previous_claim_id', { length: 64 }),
    programmeTrialId: varchar('programme_trial_id', { length: 64 }),
    evidenceNodeType: evidenceNodeTypeEnum('evidence_node_type'),
    nature: claimNatureEnum('nature').notNull().default('UNKNOWN'),
    reviewStatus: evidenceReviewStatusEnum('review_status').notNull().default('DRAFT'),
    plainLanguageText: text('plain_language_text').notNull(),
    technicalText: text('technical_text'),
    population: text('population'),
    intervention: text('intervention'),
    comparator: text('comparator'),
    dose: text('dose'),
    route: varchar('route', { length: 160 }),
    duration: varchar('duration', { length: 160 }),
    endpoint: text('endpoint'),
    endpointHierarchy: varchar('endpoint_hierarchy', { length: 160 }),
    outcomeType: varchar('outcome_type', { length: 160 }),
    numericValue: numeric('numeric_value', { precision: 30, scale: 10 }),
    numericUnitRequired: boolean('numeric_unit_required').notNull().default(false),
    numericUnit: varchar('numeric_unit', { length: 120 }),
    resultDate: date('result_date'),
    participantOutcome: boolean('participant_outcome'),
    comparatorValue: text('comparator_value'),
    comparatorGroup: text('comparator_group'),
    presentedAsPatientBenefit: boolean('presented_as_patient_benefit'),
    exploratoryNatureDisclosed: boolean('exploratory_nature_disclosed'),
    stoppingReason: boolean('stopping_reason').notNull().default(false),
    conflictsWithClaimIds: jsonb('conflicts_with_claim_ids')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    uncertaintyInterval: varchar('uncertainty_interval', { length: 240 }),
    direction: claimDirectionEnum('direction').notNull().default('UNKNOWN'),
    timepoint: varchar('timepoint', { length: 200 }),
    reviewerInterpretation: text('reviewer_interpretation'),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    authorUserId: varchar('author_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    supersededAt: timestamp('superseded_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('claims_programme_key_revision_unique').on(
      table.programmeId,
      table.claimKey,
      table.revisionNumber,
    ),
    unique('claims_id_programme_unique').on(table.id, table.programmeId),
    uniqueIndex('claims_one_published_per_key')
      .on(table.programmeId, table.claimKey)
      .where(sql`${table.reviewStatus} = 'PUBLISHED'`),
    index('claims_programme_status_idx').on(table.programmeId, table.reviewStatus),
    index('claims_trial_idx').on(table.programmeTrialId),
    index('claims_previous_idx').on(table.previousClaimId),
    foreignKey({
      name: 'claims_previous_same_programme_fk',
      columns: [table.previousClaimId, table.programmeId],
      foreignColumns: [table.id, table.programmeId],
    }).onDelete('restrict'),
    foreignKey({
      name: 'claims_trial_same_programme_fk',
      columns: [table.programmeTrialId, table.programmeId],
      foreignColumns: [programmeTrials.id, programmeTrials.programmeId],
    }).onDelete('restrict'),
    check('claims_revision_positive', sql`${table.revisionNumber} > 0`),
    check(
      'claims_previous_not_self',
      sql`${table.previousClaimId} is null or ${table.previousClaimId} <> ${table.id}`,
    ),
    check(
      'claims_publication_dates',
      sql`(${table.reviewStatus} <> 'PUBLISHED' or ${table.publishedAt} is not null)
        and (${table.reviewStatus} <> 'SUPERSEDED' or ${table.supersededAt} is not null)`,
    ),
  ],
)

export const evidenceNodes = pgTable(
  'evidence_nodes',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    programmeId: varchar('programme_id', { length: 64 })
      .notNull()
      .references(() => developmentProgrammes.id, { onDelete: 'cascade' }),
    nodeType: evidenceNodeTypeEnum('node_type').notNull(),
    revisionNumber: integer('revision_number').notNull(),
    previousEvidenceNodeId: varchar('previous_evidence_node_id', { length: 64 }),
    state: evidenceStateEnum('state').notNull().default('UNKNOWN'),
    reviewStatus: evidenceReviewStatusEnum('review_status').notNull().default('DRAFT'),
    plainSummary: text('plain_summary'),
    professionalSummary: text('professional_summary'),
    rationale: text('rationale'),
    visible: boolean('visible').notNull().default(true),
    presentedAsPositive: boolean('presented_as_positive'),
    presentedAsNegative: boolean('presented_as_negative'),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    authorUserId: varchar('author_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    supersededAt: timestamp('superseded_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('evidence_nodes_programme_type_revision_unique').on(
      table.programmeId,
      table.nodeType,
      table.revisionNumber,
    ),
    unique('evidence_nodes_id_programme_unique').on(table.id, table.programmeId),
    uniqueIndex('evidence_nodes_one_published_per_type')
      .on(table.programmeId, table.nodeType)
      .where(sql`${table.reviewStatus} = 'PUBLISHED'`),
    index('evidence_nodes_programme_status_idx').on(table.programmeId, table.reviewStatus),
    index('evidence_nodes_previous_idx').on(table.previousEvidenceNodeId),
    foreignKey({
      name: 'evidence_nodes_previous_same_programme_fk',
      columns: [table.previousEvidenceNodeId, table.programmeId],
      foreignColumns: [table.id, table.programmeId],
    }).onDelete('restrict'),
    check('evidence_nodes_revision_positive', sql`${table.revisionNumber} > 0`),
    check(
      'evidence_nodes_previous_not_self',
      sql`${table.previousEvidenceNodeId} is null or ${table.previousEvidenceNodeId} <> ${table.id}`,
    ),
    check(
      'evidence_nodes_publication_dates',
      sql`(${table.reviewStatus} <> 'PUBLISHED' or ${table.publishedAt} is not null)
        and (${table.reviewStatus} <> 'SUPERSEDED' or ${table.supersededAt} is not null)`,
    ),
  ],
)

export const programmeVerdictRevisions = pgTable(
  'programme_verdict_revisions',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    programmeId: varchar('programme_id', { length: 64 })
      .notNull()
      .references(() => developmentProgrammes.id, { onDelete: 'cascade' }),
    revisionNumber: integer('revision_number').notNull(),
    previousVerdictRevisionId: varchar('previous_verdict_revision_id', { length: 64 }),
    reviewStatus: evidenceReviewStatusEnum('review_status').notNull().default('DRAFT'),
    programmeStatusAtReview: programmeStatusEnum('programme_status_at_review').notNull(),
    verdictCode: stoppedProgrammeVerdictEnum('verdict_code'),
    proposalAsOfDate: date('proposal_as_of_date'),
    presentationSchemaVersion: varchar('presentation_schema_version', { length: 64 }),
    publicLabel: text('public_label').notNull(),
    professionalLabel: text('professional_label').notNull(),
    indicationScope: text('indication_scope').notNull(),
    populationScope: text('population_scope').notNull(),
    doseExposureScope: text('dose_exposure_scope').notNull(),
    periodScope: text('period_scope').notNull(),
    trialScope: text('trial_scope').notNull(),
    outcomeScope: text('outcome_scope').notNull(),
    plainMechanism: text('plain_mechanism'),
    bestSupportedFinding: text('best_supported_finding'),
    mainLimitation: text('main_limitation'),
    oneSentenceReason: text('one_sentence_reason').notNull(),
    whatWasDisproven: jsonb('what_was_disproven')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    whatWasNotDisproven: jsonb('what_was_not_disproven')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    whatRemainsUnknown: jsonb('what_remains_unknown')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    confidence: verdictConfidenceEnum('confidence').notNull().default('UNKNOWN'),
    confidenceExplanation: text('confidence_explanation'),
    conditionsThatWouldChangeVerdict: jsonb('conditions_that_would_change_verdict')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    authorUserId: varchar('author_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    authorName: varchar('author_name', { length: 160 }).notNull(),
    conflictsOfInterest: text('conflicts_of_interest'),
    sourceDependent: boolean('source_dependent').notNull().default(true),
    adjudicationRationale: text('adjudication_rationale'),
    adjudicatorUserId: varchar('adjudicator_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'restrict',
    }),
    engineVersion: varchar('engine_version', { length: 64 }),
    inputDigestAlgorithm: varchar('input_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    inputDigest: varchar('input_digest', { length: 64 }),
    proposalDigestAlgorithm: varchar('proposal_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    proposalDigest: varchar('proposal_digest', { length: 64 }),
    proposalPreparedAt: timestamp('proposal_prepared_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    supersededAt: timestamp('superseded_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('programme_verdicts_programme_revision_unique').on(
      table.programmeId,
      table.revisionNumber,
    ),
    unique('programme_verdicts_id_programme_unique').on(table.id, table.programmeId),
    uniqueIndex('programme_verdicts_one_published')
      .on(table.programmeId)
      .where(sql`${table.reviewStatus} = 'PUBLISHED'`),
    index('programme_verdicts_programme_created_idx').on(table.programmeId, table.createdAt),
    index('programme_verdicts_review_status_idx').on(table.reviewStatus, table.createdAt),
    index('programme_verdicts_previous_idx').on(table.previousVerdictRevisionId),
    foreignKey({
      name: 'programme_verdicts_previous_same_programme_fk',
      columns: [table.previousVerdictRevisionId, table.programmeId],
      foreignColumns: [table.id, table.programmeId],
    }).onDelete('restrict'),
    check('programme_verdicts_revision_positive', sql`${table.revisionNumber} > 0`),
    check(
      'programme_verdicts_previous_not_self',
      sql`${table.previousVerdictRevisionId} is null or ${table.previousVerdictRevisionId} <> ${table.id}`,
    ),
    check(
      'programme_verdicts_stopped_scope',
      sql`${table.verdictCode} is null or ${table.programmeStatusAtReview} in ('STOPPED', 'WITHDRAWN')`,
    ),
    check(
      'programme_verdicts_publication_dates',
      sql`(${table.reviewStatus} <> 'PUBLISHED' or (${table.reviewedAt} is not null and ${table.publishedAt} is not null))
        and (${table.reviewStatus} <> 'SUPERSEDED' or ${table.supersededAt} is not null)`,
    ),
    check(
      'programme_verdicts_published_summary',
      sql`${table.reviewStatus} <> 'PUBLISHED' or (
        nullif(btrim(${table.plainMechanism}), '') is not null
        and nullif(btrim(${table.bestSupportedFinding}), '') is not null
        and nullif(btrim(${table.mainLimitation}), '') is not null
      )`,
    ),
    check(
      'programme_verdicts_published_engine_provenance',
      sql`${table.reviewStatus} <> 'PUBLISHED' or (
        nullif(btrim(${table.engineVersion}), '') is not null
        and ${table.inputDigest} ~ '^[0-9a-f]{64}$'
      )`,
    ),
    check(
      'programme_verdicts_published_proposal_provenance',
      sql`${table.reviewStatus} <> 'PUBLISHED' or (
        ${table.proposalAsOfDate} is not null
        and ${table.proposalPreparedAt} is not null
        and ${table.proposalDigest} ~ '^[0-9a-f]{64}$'
      )`,
    ),
    check('programme_verdicts_digest_algorithm', sql`${table.inputDigestAlgorithm} = 'sha256'`),
    check(
      'programme_verdicts_proposal_digest_algorithm',
      sql`${table.proposalDigestAlgorithm} = 'sha256'`,
    ),
    check(
      'programme_verdicts_proposal_digest_format',
      sql`${table.proposalDigest} is null or ${table.proposalDigest} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      'programme_verdicts_presentation_schema_version',
      sql`${table.presentationSchemaVersion} is null or ${table.presentationSchemaVersion} = 'programme-presentation/v1'`,
    ),
    check(
      'programme_verdicts_adjudication_complete',
      sql`(${table.adjudicationRationale} is null and ${table.adjudicatorUserId} is null)
        or (nullif(btrim(${table.adjudicationRationale}), '') is not null and ${table.adjudicatorUserId} is not null)`,
    ),
  ],
)

export const claimSourceLinks = pgTable(
  'claim_source_links',
  {
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    claimId: varchar('claim_id', { length: 64 }).notNull(),
    sourceSnapshotId: varchar('source_snapshot_id', { length: 64 })
      .notNull()
      .references(() => sourceSnapshots.id, { onDelete: 'restrict' }),
    relationship: claimSourceRelationshipEnum('relationship').notNull(),
    sourceLocator: text('source_locator'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'claim_source_links_pk',
      columns: [table.claimId, table.sourceSnapshotId, table.relationship],
    }),
    foreignKey({
      name: 'claim_source_links_claim_programme_fk',
      columns: [table.claimId, table.programmeId],
      foreignColumns: [claims.id, claims.programmeId],
    }).onDelete('cascade'),
    index('claim_source_links_snapshot_idx').on(table.sourceSnapshotId),
    index('claim_source_links_programme_idx').on(table.programmeId),
  ],
)

export const evidenceNodeClaims = pgTable(
  'evidence_node_claims',
  {
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    evidenceNodeId: varchar('evidence_node_id', { length: 64 }).notNull(),
    claimId: varchar('claim_id', { length: 64 }).notNull(),
    relationship: evidenceNodeClaimRelationshipEnum('relationship').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'evidence_node_claims_pk',
      columns: [table.evidenceNodeId, table.claimId, table.relationship],
    }),
    foreignKey({
      name: 'evidence_node_claims_node_programme_fk',
      columns: [table.evidenceNodeId, table.programmeId],
      foreignColumns: [evidenceNodes.id, evidenceNodes.programmeId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'evidence_node_claims_claim_programme_fk',
      columns: [table.claimId, table.programmeId],
      foreignColumns: [claims.id, claims.programmeId],
    }).onDelete('cascade'),
    index('evidence_node_claims_claim_idx').on(table.claimId),
    index('evidence_node_claims_programme_idx').on(table.programmeId),
  ],
)

export const trialInterpretabilityClaims = pgTable(
  'trial_interpretability_claims',
  {
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    assessmentId: varchar('assessment_id', { length: 64 }).notNull(),
    claimId: varchar('claim_id', { length: 64 }).notNull(),
    relationship: evidenceNodeClaimRelationshipEnum('relationship').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'trial_interpretability_claims_pk',
      columns: [table.assessmentId, table.claimId, table.relationship],
    }),
    foreignKey({
      name: 'trial_interpretability_claims_assessment_programme_fk',
      columns: [table.assessmentId, table.programmeId],
      foreignColumns: [
        trialInterpretabilityAssessments.id,
        trialInterpretabilityAssessments.programmeId,
      ],
    }).onDelete('cascade'),
    foreignKey({
      name: 'trial_interpretability_claims_claim_programme_fk',
      columns: [table.claimId, table.programmeId],
      foreignColumns: [claims.id, claims.programmeId],
    }).onDelete('cascade'),
    index('trial_interpretability_claims_claim_idx').on(table.claimId),
    index('trial_interpretability_claims_programme_idx').on(table.programmeId),
  ],
)

export const programmeVerdictClaims = pgTable(
  'programme_verdict_claims',
  {
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    claimId: varchar('claim_id', { length: 64 }).notNull(),
    relationship: verdictClaimRelationshipEnum('relationship').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'programme_verdict_claims_pk',
      columns: [table.verdictRevisionId, table.claimId, table.relationship],
    }),
    foreignKey({
      name: 'programme_verdict_claims_verdict_programme_fk',
      columns: [table.verdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_verdict_claims_claim_programme_fk',
      columns: [table.claimId, table.programmeId],
      foreignColumns: [claims.id, claims.programmeId],
    }).onDelete('cascade'),
    index('programme_verdict_claims_claim_idx').on(table.claimId),
    index('programme_verdict_claims_programme_idx').on(table.programmeId),
  ],
)

/**
 * Ordered, reviewed mechanism presentation for one exact verdict revision. It is intentionally
 * separate from evidence nodes: these rows explain a sequence without asserting new science.
 */
export const programmeVerdictMechanismSteps = pgTable(
  'programme_verdict_mechanism_steps',
  {
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    stepKey: varchar('step_key', { length: 64 }).notNull(),
    stepOrder: integer('step_order').notNull(),
    plainTitle: text('plain_title').notNull(),
    plainDescription: text('plain_description').notNull(),
    technicalDescription: text('technical_description'),
    evidenceBasis: mechanismEvidenceBasisEnum('evidence_basis').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'programme_verdict_mechanism_steps_pk',
      columns: [table.verdictRevisionId, table.stepKey],
    }),
    unique('programme_verdict_mechanism_steps_scope_unique').on(
      table.verdictRevisionId,
      table.stepKey,
      table.programmeId,
    ),
    uniqueIndex('programme_verdict_mechanism_steps_order_unique').on(
      table.verdictRevisionId,
      table.stepOrder,
    ),
    foreignKey({
      name: 'programme_verdict_mechanism_steps_verdict_programme_fk',
      columns: [table.verdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('cascade'),
    index('programme_verdict_mechanism_steps_programme_idx').on(table.programmeId),
    check(
      'programme_verdict_mechanism_steps_key',
      sql`${table.stepKey} ~ '^[a-z0-9][a-z0-9_-]{0,63}$'`,
    ),
    check('programme_verdict_mechanism_steps_order', sql`${table.stepOrder} between 1 and 5`),
    check(
      'programme_verdict_mechanism_steps_copy',
      sql`nullif(btrim(${table.plainTitle}), '') is not null
        and char_length(btrim(${table.plainTitle})) <= 240
        and nullif(btrim(${table.plainDescription}), '') is not null
        and char_length(btrim(${table.plainDescription})) <= 2000
        and (${table.technicalDescription} is null or (
          nullif(btrim(${table.technicalDescription}), '') is not null
          and char_length(btrim(${table.technicalDescription})) <= 4000
        ))`,
    ),
  ],
)

/** Exact claim revisions that justify one reviewed mechanism stage. */
export const programmeVerdictMechanismStepClaims = pgTable(
  'programme_verdict_mechanism_step_claims',
  {
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    stepKey: varchar('step_key', { length: 64 }).notNull(),
    claimId: varchar('claim_id', { length: 64 }).notNull(),
    relationship: evidenceNodeClaimRelationshipEnum('relationship').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'programme_verdict_mechanism_step_claims_pk',
      columns: [table.verdictRevisionId, table.stepKey, table.claimId, table.relationship],
    }),
    unique('programme_verdict_mechanism_step_claims_target_claim_unique').on(
      table.verdictRevisionId,
      table.stepKey,
      table.claimId,
    ),
    foreignKey({
      name: 'programme_verdict_mechanism_step_claims_step_scope_fk',
      columns: [table.verdictRevisionId, table.stepKey, table.programmeId],
      foreignColumns: [
        programmeVerdictMechanismSteps.verdictRevisionId,
        programmeVerdictMechanismSteps.stepKey,
        programmeVerdictMechanismSteps.programmeId,
      ],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_verdict_mechanism_step_claims_claim_programme_fk',
      columns: [table.claimId, table.programmeId],
      foreignColumns: [claims.id, claims.programmeId],
    }).onDelete('cascade'),
    index('programme_verdict_mechanism_step_claims_claim_idx').on(table.claimId),
    index('programme_verdict_mechanism_step_claims_programme_idx').on(table.programmeId),
  ],
)

/**
 * A source-authored event that changed interpretation or development decisions. Publication and
 * revision events are never stored here; public reads derive those from immutable RNAWiki history.
 */
export const programmeVerdictTimelineEvents = pgTable(
  'programme_verdict_timeline_events',
  {
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    eventKey: varchar('event_key', { length: 64 }).notNull(),
    eventDate: date('event_date').notNull(),
    eventType: programmeTimelineEventTypeEnum('event_type').notNull(),
    dateBasis: programmeTimelineDateBasisEnum('date_basis').notNull(),
    plainTitle: text('plain_title').notNull(),
    plainDescription: text('plain_description').notNull(),
    technicalDescription: text('technical_description'),
    programmeTrialId: varchar('programme_trial_id', { length: 64 }),
    sourceId: varchar('source_id', { length: 64 }).notNull(),
    sourceSnapshotId: varchar('source_snapshot_id', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'programme_verdict_timeline_events_pk',
      columns: [table.verdictRevisionId, table.eventKey],
    }),
    unique('programme_verdict_timeline_events_scope_unique').on(
      table.verdictRevisionId,
      table.eventKey,
      table.programmeId,
    ),
    foreignKey({
      name: 'programme_verdict_timeline_events_verdict_programme_fk',
      columns: [table.verdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_verdict_timeline_events_trial_programme_fk',
      columns: [table.programmeTrialId, table.programmeId],
      foreignColumns: [programmeTrials.id, programmeTrials.programmeId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_verdict_timeline_events_snapshot_source_fk',
      columns: [table.sourceSnapshotId, table.sourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    index('programme_verdict_timeline_events_programme_date_idx').on(
      table.programmeId,
      table.eventDate,
    ),
    index('programme_verdict_timeline_events_source_idx').on(table.sourceId),
    check(
      'programme_verdict_timeline_events_key',
      sql`${table.eventKey} ~ '^[a-z0-9][a-z0-9_-]{0,63}$'`,
    ),
    check(
      'programme_verdict_timeline_events_copy',
      sql`nullif(btrim(${table.plainTitle}), '') is not null
        and char_length(btrim(${table.plainTitle})) <= 240
        and nullif(btrim(${table.plainDescription}), '') is not null
        and char_length(btrim(${table.plainDescription})) <= 2000
        and (${table.technicalDescription} is null or (
          nullif(btrim(${table.technicalDescription}), '') is not null
          and char_length(btrim(${table.technicalDescription})) <= 4000
        ))`,
    ),
  ],
)

/** Exact claim revisions that make a timeline event reviewable rather than decorative. */
export const programmeVerdictTimelineEventClaims = pgTable(
  'programme_verdict_timeline_event_claims',
  {
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    eventKey: varchar('event_key', { length: 64 }).notNull(),
    claimId: varchar('claim_id', { length: 64 }).notNull(),
    relationship: evidenceNodeClaimRelationshipEnum('relationship').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'programme_verdict_timeline_event_claims_pk',
      columns: [table.verdictRevisionId, table.eventKey, table.claimId, table.relationship],
    }),
    unique('programme_verdict_timeline_event_claims_target_claim_unique').on(
      table.verdictRevisionId,
      table.eventKey,
      table.claimId,
    ),
    foreignKey({
      name: 'programme_verdict_timeline_event_claims_event_scope_fk',
      columns: [table.verdictRevisionId, table.eventKey, table.programmeId],
      foreignColumns: [
        programmeVerdictTimelineEvents.verdictRevisionId,
        programmeVerdictTimelineEvents.eventKey,
        programmeVerdictTimelineEvents.programmeId,
      ],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_verdict_timeline_event_claims_claim_programme_fk',
      columns: [table.claimId, table.programmeId],
      foreignColumns: [claims.id, claims.programmeId],
    }).onDelete('cascade'),
    index('programme_verdict_timeline_event_claims_claim_idx').on(table.claimId),
    index('programme_verdict_timeline_event_claims_programme_idx').on(table.programmeId),
  ],
)

/** Normalized, immutable trial scope for one verdict proposal/revision. */
export const programmeVerdictTrials = pgTable(
  'programme_verdict_trials',
  {
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    programmeTrialId: varchar('programme_trial_id', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'programme_verdict_trials_pk',
      columns: [table.verdictRevisionId, table.programmeTrialId],
    }),
    foreignKey({
      name: 'programme_verdict_trials_verdict_programme_fk',
      columns: [table.verdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_verdict_trials_trial_programme_fk',
      columns: [table.programmeTrialId, table.programmeId],
      foreignColumns: [programmeTrials.id, programmeTrials.programmeId],
    }).onDelete('cascade'),
    index('programme_verdict_trials_trial_idx').on(table.programmeTrialId),
    index('programme_verdict_trials_programme_idx').on(table.programmeId),
  ],
)

/** Exact published evidence-node revisions reviewed as part of one verdict proposal. */
export const programmeVerdictEvidenceNodes = pgTable(
  'programme_verdict_evidence_nodes',
  {
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    evidenceNodeId: varchar('evidence_node_id', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'programme_verdict_evidence_nodes_pk',
      columns: [table.verdictRevisionId, table.evidenceNodeId],
    }),
    foreignKey({
      name: 'programme_verdict_evidence_nodes_verdict_programme_fk',
      columns: [table.verdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_verdict_evidence_nodes_node_programme_fk',
      columns: [table.evidenceNodeId, table.programmeId],
      foreignColumns: [evidenceNodes.id, evidenceNodes.programmeId],
    }).onDelete('cascade'),
    index('programme_verdict_evidence_nodes_node_idx').on(table.evidenceNodeId),
    index('programme_verdict_evidence_nodes_programme_idx').on(table.programmeId),
  ],
)

/** Exact interpretability revisions reviewed as part of one verdict proposal. */
export const programmeVerdictInterpretabilityAssessments = pgTable(
  'programme_verdict_interpretability_assessments',
  {
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    assessmentId: varchar('assessment_id', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'programme_verdict_interpretability_pk',
      columns: [table.verdictRevisionId, table.assessmentId],
    }),
    foreignKey({
      name: 'programme_verdict_interpretability_verdict_programme_fk',
      columns: [table.verdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_verdict_interpretability_assessment_programme_fk',
      columns: [table.assessmentId, table.programmeId],
      foreignColumns: [
        trialInterpretabilityAssessments.id,
        trialInterpretabilityAssessments.programmeId,
      ],
    }).onDelete('cascade'),
    index('programme_verdict_interpretability_assessment_idx').on(table.assessmentId),
    index('programme_verdict_interpretability_programme_idx').on(table.programmeId),
  ],
)

/** Exact programme scope signed with one verdict proposal and consumed by public reads. */
export const programmeVerdictScopeSnapshots = pgTable(
  'programme_verdict_scope_snapshots',
  {
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).primaryKey(),
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    drugId: varchar('drug_id', { length: 96 }).notNull(),
    slug: varchar('slug', { length: 128 }).notNull(),
    title: varchar('title', { length: 300 }).notNull(),
    indication: text('indication'),
    targetPopulation: text('target_population'),
    jurisdiction: varchar('jurisdiction', { length: 120 }),
    sponsor: varchar('sponsor', { length: 300 }),
    partners: jsonb('partners').$type<string[]>().notNull(),
    status: programmeStatusEnum('status').notNull(),
    highestPhaseReached: varchar('highest_phase_reached', { length: 80 }),
    route: varchar('route', { length: 160 }),
    doseExposureContext: text('dose_exposure_context'),
    startDate: date('start_date'),
    endDate: date('end_date'),
    rawStoppingReason: text('raw_stopping_reason'),
    stoppingReasonCategory: stoppingReasonCategoryEnum('stopping_reason_category').notNull(),
    capturedAt: timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      name: 'programme_verdict_scope_verdict_programme_fk',
      columns: [table.verdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('cascade'),
    index('programme_verdict_scope_programme_idx').on(table.programmeId),
    check(
      'programme_verdict_scope_dates_order',
      sql`${table.startDate} is null or ${table.endDate} is null or ${table.endDate} >= ${table.startDate}`,
    ),
  ],
)

/** Exact normalized trial fields and registry snapshot signed with one verdict proposal. */
export const programmeVerdictTrialSnapshots = pgTable(
  'programme_verdict_trial_snapshots',
  {
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    programmeTrialId: varchar('programme_trial_id', { length: 64 }).notNull(),
    trialIdentifier: varchar('trial_identifier', { length: 160 }).notNull(),
    title: text('title'),
    phase: varchar('phase', { length: 80 }),
    status: trialStatusEnum('status').notNull(),
    resultsStatus: trialResultsStatusEnum('results_status').notNull(),
    enrolment: integer('enrolment'),
    enrolmentType: trialEnrolmentTypeEnum('enrolment_type').notNull(),
    startDate: date('start_date'),
    primaryCompletionDate: date('primary_completion_date'),
    completionDate: date('completion_date'),
    humanStudyStatus: humanStudyStatusEnum('human_study_status').notNull(),
    registrySourceId: varchar('registry_source_id', { length: 64 }).references(
      () => evidenceSources.id,
      { onDelete: 'restrict' },
    ),
    registrySnapshotId: varchar('registry_snapshot_id', { length: 64 }),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    capturedAt: timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'programme_verdict_trial_snapshots_pk',
      columns: [table.verdictRevisionId, table.programmeTrialId],
    }),
    foreignKey({
      name: 'programme_verdict_trial_snapshots_verdict_programme_fk',
      columns: [table.verdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_verdict_trial_snapshots_link_fk',
      columns: [table.verdictRevisionId, table.programmeTrialId],
      foreignColumns: [
        programmeVerdictTrials.verdictRevisionId,
        programmeVerdictTrials.programmeTrialId,
      ],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_verdict_trial_snapshots_registry_snapshot_source_fk',
      columns: [table.registrySnapshotId, table.registrySourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    index('programme_verdict_trial_snapshots_trial_idx').on(table.programmeTrialId),
    index('programme_verdict_trial_snapshots_programme_idx').on(table.programmeId),
    check(
      'programme_verdict_trial_snapshots_enrolment_nonnegative',
      sql`${table.enrolment} is null or ${table.enrolment} >= 0`,
    ),
    check(
      'programme_verdict_trial_snapshots_dates_order',
      sql`${table.startDate} is null or ${table.completionDate} is null or ${table.completionDate} >= ${table.startDate}`,
    ),
    check(
      'programme_verdict_trial_snapshots_snapshot_has_source',
      sql`${table.registrySnapshotId} is null or ${table.registrySourceId} is not null`,
    ),
  ],
)

/** Exact source identity/interpretive metadata signed with one verdict proposal. */
export const programmeVerdictSourceMetadataSnapshots = pgTable(
  'programme_verdict_source_metadata_snapshots',
  {
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    sourceId: varchar('source_id', { length: 64 })
      .notNull()
      .references(() => evidenceSources.id, { onDelete: 'restrict' }),
    sourceType: evidenceSourceTypeEnum('source_type').notNull(),
    externalIdentifier: varchar('external_identifier', { length: 400 }),
    canonicalLocator: text('canonical_locator').notNull(),
    title: text('title'),
    publisher: varchar('publisher', { length: 300 }),
    sponsor: varchar('sponsor', { length: 300 }),
    publicationDate: date('publication_date'),
    correctionStatus: sourceCorrectionStatusEnum('correction_status').notNull(),
    jurisdiction: varchar('jurisdiction', { length: 120 }),
    hierarchy: sourceHierarchyEnum('hierarchy').notNull(),
    capturedAt: timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'programme_verdict_source_metadata_pk',
      columns: [table.verdictRevisionId, table.sourceId],
    }),
    foreignKey({
      name: 'programme_verdict_source_metadata_verdict_programme_fk',
      columns: [table.verdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('cascade'),
    index('programme_verdict_source_metadata_source_idx').on(table.sourceId),
    index('programme_verdict_source_metadata_programme_idx').on(table.programmeId),
  ],
)

/**
 * Non-counting audit preservation for reviews recorded before migration 0004 introduced immutable
 * reviewer principals and proposal/input digests. These rows must never be treated as approvals for
 * a hardened publication because they did not sign an exact proposal.
 */
export const legacyProgrammeVerdictReviews0003 = pgTable(
  'programme_verdict_reviews_legacy_0003',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    reviewerUserId: varchar('reviewer_user_id', { length: 64 }),
    reviewerName: varchar('reviewer_name', { length: 160 }).notNull(),
    decision: verdictReviewDecisionEnum('decision').notNull(),
    isIndependent: boolean('is_independent').notNull().default(false),
    conflictsOfInterest: text('conflicts_of_interest'),
    reviewNote: text('review_note'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }).notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true }).notNull().defaultNow(),
    archiveReason: varchar('archive_reason', { length: 120 })
      .notNull()
      .default('UNBOUND_PRE_0004_REVIEW'),
  },
  (table) => [
    index('programme_verdict_reviews_legacy_revision_idx').on(table.verdictRevisionId),
    check(
      'programme_verdict_reviews_legacy_reason',
      sql`${table.archiveReason} = 'UNBOUND_PRE_0004_REVIEW'`,
    ),
  ],
)

export const programmeVerdictReviews = pgTable(
  'programme_verdict_reviews',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 })
      .notNull()
      .references(() => programmeVerdictRevisions.id, { onDelete: 'cascade' }),
    reviewerUserId: varchar('reviewer_user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    reviewerName: varchar('reviewer_name', { length: 160 }).notNull(),
    reviewerOrcidSnapshot: varchar('reviewer_orcid_snapshot', { length: 32 }),
    expertiseTags: verdictReviewerExpertiseEnum('expertise_tags').array().notNull(),
    decision: verdictReviewDecisionEnum('decision').notNull(),
    isIndependent: boolean('is_independent').notNull().default(false),
    conflictsOfInterest: text('conflicts_of_interest'),
    conflictsOfInterestAttested: boolean('conflicts_of_interest_attested').notNull().default(false),
    proposalDigestAlgorithm: varchar('proposal_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    proposalDigest: varchar('proposal_digest', { length: 64 }).notNull(),
    engineVersion: varchar('engine_version', { length: 64 }).notNull(),
    inputDigestAlgorithm: varchar('input_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    inputDigest: varchar('input_digest', { length: 64 }).notNull(),
    reviewNote: text('review_note'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('programme_verdict_reviews_revision_idx').on(table.verdictRevisionId, table.reviewedAt),
    index('programme_verdict_reviews_reviewer_idx').on(table.reviewerUserId),
    check(
      'programme_verdict_reviews_digest_algorithms',
      sql`${table.proposalDigestAlgorithm} = 'sha256' and ${table.inputDigestAlgorithm} = 'sha256'`,
    ),
    check(
      'programme_verdict_reviews_digest_formats',
      sql`${table.proposalDigest} ~ '^[0-9a-f]{64}$' and ${table.inputDigest} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      'programme_verdict_reviews_expertise_nonempty',
      sql`cardinality(${table.expertiseTags}) > 0`,
    ),
    check(
      'programme_verdict_reviews_orcid_format',
      sql`${table.reviewerOrcidSnapshot} is null or ${table.reviewerOrcidSnapshot} ~ '^\\d{4}-\\d{4}-\\d{4}-\\d{3}[0-9X]$'`,
    ),
  ],
)

/** One immutable qualified resolution when exactly two canonical reviews disagree. */
export const programmeVerdictAdjudications = pgTable(
  'programme_verdict_adjudications',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 })
      .notNull()
      .references(() => programmeVerdictRevisions.id, { onDelete: 'cascade' }),
    adjudicatorUserId: varchar('adjudicator_user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    adjudicatorNameSnapshot: varchar('adjudicator_name_snapshot', { length: 160 }).notNull(),
    adjudicatorOrcidSnapshot: varchar('adjudicator_orcid_snapshot', { length: 32 }),
    expertiseTags: verdictReviewerExpertiseEnum('expertise_tags').array().notNull(),
    decision: verdictReviewDecisionEnum('decision').notNull(),
    rationale: text('rationale').notNull(),
    conflictsOfInterest: text('conflicts_of_interest').notNull(),
    conflictsOfInterestAttested: boolean('conflicts_of_interest_attested').notNull().default(false),
    proposalDigestAlgorithm: varchar('proposal_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    proposalDigest: varchar('proposal_digest', { length: 64 }).notNull(),
    engineVersion: varchar('engine_version', { length: 64 }).notNull(),
    inputDigestAlgorithm: varchar('input_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    inputDigest: varchar('input_digest', { length: 64 }).notNull(),
    adjudicatedAt: timestamp('adjudicated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('programme_verdict_adjudications_revision_unique').on(table.verdictRevisionId),
    index('programme_verdict_adjudications_user_idx').on(table.adjudicatorUserId),
    check(
      'programme_verdict_adjudications_expertise',
      sql`cardinality(${table.expertiseTags}) > 0`,
    ),
    check(
      'programme_verdict_adjudications_complete',
      sql`nullif(btrim(${table.rationale}), '') is not null
        and nullif(btrim(${table.conflictsOfInterest}), '') is not null
        and ${table.conflictsOfInterestAttested}`,
    ),
    check(
      'programme_verdict_adjudications_digest',
      sql`${table.proposalDigestAlgorithm} = 'sha256'
        and ${table.inputDigestAlgorithm} = 'sha256'
        and ${table.proposalDigest} ~ '^[0-9a-f]{64}$'
        and ${table.inputDigest} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      'programme_verdict_adjudications_orcid',
      sql`${table.adjudicatorOrcidSnapshot} is null or ${table.adjudicatorOrcidSnapshot} ~ '^\\d{4}-\\d{4}-\\d{4}-\\d{3}[0-9X]$'`,
    ),
  ],
)

/** The single authoritative pointer used by public reads; publishing updates it transactionally. */
export const programmeCurrentPublications = pgTable(
  'programme_current_publications',
  {
    programmeId: varchar('programme_id', { length: 64 })
      .primaryKey()
      .references(() => developmentProgrammes.id, { onDelete: 'cascade' }),
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex('programme_current_publications_verdict_unique').on(table.verdictRevisionId),
    foreignKey({
      name: 'programme_current_publications_same_programme_fk',
      columns: [table.verdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('restrict'),
  ],
)

/** Claim-to-surface edges drive deterministic impact propagation after a source changes. */
export const programmeDependencies = pgTable(
  'programme_dependencies',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    programmeId: varchar('programme_id', { length: 64 })
      .notNull()
      .references(() => developmentProgrammes.id, { onDelete: 'cascade' }),
    claimId: varchar('claim_id', { length: 64 }).notNull(),
    dependentSurfaceType: dependentSurfaceTypeEnum('dependent_surface_type').notNull(),
    evidenceNodeId: varchar('evidence_node_id', { length: 64 }),
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }),
    fieldPath: varchar('field_path', { length: 240 }).notNull(),
    impactLevel: reviewImpactLevelEnum('impact_level').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      name: 'programme_dependencies_claim_programme_fk',
      columns: [table.claimId, table.programmeId],
      foreignColumns: [claims.id, claims.programmeId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_dependencies_node_programme_fk',
      columns: [table.evidenceNodeId, table.programmeId],
      foreignColumns: [evidenceNodes.id, evidenceNodes.programmeId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_dependencies_verdict_programme_fk',
      columns: [table.verdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('cascade'),
    index('programme_dependencies_claim_idx').on(table.claimId),
    index('programme_dependencies_programme_surface_idx').on(
      table.programmeId,
      table.dependentSurfaceType,
    ),
    index('programme_dependencies_node_idx').on(table.evidenceNodeId),
    index('programme_dependencies_verdict_idx').on(table.verdictRevisionId),
    check(
      'programme_dependencies_target_shape',
      sql`(
          ${table.dependentSurfaceType} = 'EVIDENCE_NODE'
          and ${table.evidenceNodeId} is not null
          and ${table.verdictRevisionId} is null
        ) or (
          ${table.dependentSurfaceType} in ('VERDICT', 'PROGRAMME_SUMMARY', 'MECHANISM_MAP')
          and ${table.verdictRevisionId} is not null
          and ${table.evidenceNodeId} is null
        ) or (
          ${table.dependentSurfaceType} = 'TIMELINE'
          and ${table.evidenceNodeId} is null
        ) or (
          ${table.dependentSurfaceType} not in ('EVIDENCE_NODE', 'VERDICT', 'PROGRAMME_SUMMARY', 'MECHANISM_MAP', 'TIMELINE')
          and ${table.evidenceNodeId} is null
          and ${table.verdictRevisionId} is null
        )`,
    ),
  ],
)

/**
 * Revisioned reader proposals. A DRAFT is editable by its authenticated author; SUBMITTED rows
 * are immutable review inputs. The SQL migration installs the freeze trigger in addition to
 * these declarative constraints.
 */
export const programmeContributionProposals = pgTable(
  'programme_contribution_proposals',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    proposalKey: varchar('proposal_key', { length: 64 }).notNull(),
    revisionNumber: integer('revision_number').notNull().default(1),
    previousProposalId: varchar('previous_proposal_id', { length: 64 }),
    programmeId: varchar('programme_id', { length: 64 })
      .notNull()
      .references(() => developmentProgrammes.id, { onDelete: 'cascade' }),
    authorUserId: varchar('author_user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    proposalType: contributionProposalTypeEnum('proposal_type').notNull(),
    status: contributionProposalStatusEnum('status').notNull().default('DRAFT'),

    selectedField: contributionSelectedFieldEnum('selected_field'),
    proposedText: text('proposed_text'),
    proposedValue: jsonb('proposed_value').$type<ContributionProposedValue>(),
    sourceType: evidenceSourceTypeEnum('source_type'),
    sourceLocator: text('source_locator'),
    sourceIdentifier: varchar('source_identifier', { length: 400 }),
    sourceReviewTaskId: varchar('source_review_task_id', { length: 64 }).references(
      (): AnyPgColumn => evidenceReviewTasks.id,
      { onDelete: 'restrict' },
    ),
    sourceReviewSnapshotId: varchar('source_review_snapshot_id', { length: 64 }).references(
      () => sourceSnapshots.id,
      { onDelete: 'restrict' },
    ),
    sourceRefreshDeltaSnapshot: jsonb(
      'source_refresh_delta_snapshot',
    ).$type<ContributionSourceRefreshDeltaSnapshot>(),
    claimNature: claimNatureEnum('claim_nature'),
    evidenceNodeId: varchar('evidence_node_id', { length: 64 }),
    proposedStoppedVerdict: stoppedProgrammeVerdictEnum('proposed_stopped_verdict'),
    reasoning: text('reasoning'),
    whatWasWrongOrMissing: text('what_was_wrong_or_missing'),
    affects: contributionAffectsEnum('affects'),
    conflictsOfInterest: text('conflicts_of_interest'),
    conflictsOfInterestAttested: boolean('conflicts_of_interest_attested').notNull().default(false),

    // These values are written only by the server during DRAFT -> SUBMITTED. They capture the
    // exact public state the reviewer is comparing, so a later publication cannot silently move
    // the baseline under an already-submitted challenge.
    currentValueSnapshot: jsonb('current_value_snapshot').$type<ContributionCurrentValueSnapshot>(),
    currentVerdictRevisionId: varchar('current_verdict_revision_id', { length: 64 }),
    currentVerdictSnapshot: jsonb(
      'current_verdict_snapshot',
    ).$type<ContributionCurrentVerdictSnapshot>(),
    machineChecks: jsonb('machine_checks').$type<ContributionMachineChecks>(),
    impactPreview: jsonb('impact_preview').$type<ContributionImpactPreview>(),
    contentDigestAlgorithm: varchar('content_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    contentDigest: varchar('content_digest', { length: 64 }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
  },
  (table) => [
    unique('programme_contributions_id_scope_unique').on(
      table.id,
      table.programmeId,
      table.proposalKey,
    ),
    uniqueIndex('programme_contributions_lineage_revision_unique').on(
      table.programmeId,
      table.proposalKey,
      table.revisionNumber,
    ),
    foreignKey({
      name: 'programme_contributions_previous_lineage_fk',
      columns: [table.previousProposalId, table.programmeId, table.proposalKey],
      foreignColumns: [table.id, table.programmeId, table.proposalKey],
    }).onDelete('restrict'),
    foreignKey({
      name: 'programme_contributions_node_programme_fk',
      columns: [table.evidenceNodeId, table.programmeId],
      foreignColumns: [evidenceNodes.id, evidenceNodes.programmeId],
    }).onDelete('restrict'),
    foreignKey({
      name: 'programme_contributions_verdict_programme_fk',
      columns: [table.currentVerdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('restrict'),
    index('programme_contributions_author_status_idx').on(
      table.authorUserId,
      table.status,
      table.updatedAt,
    ),
    index('programme_contributions_review_queue_idx').on(table.status, table.submittedAt),
    index('programme_contributions_programme_idx').on(table.programmeId, table.createdAt),
    uniqueIndex('programme_contributions_previous_unique')
      .on(table.previousProposalId)
      .where(sql`${table.previousProposalId} is not null`),
    index('programme_contributions_node_idx').on(table.evidenceNodeId),
    index('programme_contributions_source_task_idx').on(table.sourceReviewTaskId),
    index('programme_contributions_source_refresh_queue_idx')
      .on(table.programmeId, table.status, table.submittedAt)
      .where(sql`${table.proposalType} = 'SOURCE_REFRESH'`),
    check('programme_contributions_revision_positive', sql`${table.revisionNumber} > 0`),
    check(
      'programme_contributions_previous_not_self',
      sql`${table.previousProposalId} is null or ${table.previousProposalId} <> ${table.id}`,
    ),
    check(
      'programme_contributions_first_revision_shape',
      sql`(${table.revisionNumber} = 1 and ${table.previousProposalId} is null)
        or (${table.revisionNumber} > 1 and ${table.previousProposalId} is not null)`,
    ),
    check(
      'programme_contributions_proposed_value_shape',
      sql`${table.proposedValue} is null or jsonb_typeof(${table.proposedValue}) in ('string', 'array')`,
    ),
    check(
      'programme_contributions_node_target_shape',
      sql`${table.status} <> 'SUBMITTED'
        or (${table.proposalType} = 'VERDICT_CHALLENGE' and ${table.evidenceNodeId} is not null)
        or (${table.proposalType} = 'CORRECTION' and ${table.selectedField}::text like 'evidenceNode.%' and ${table.evidenceNodeId} is not null)
        or (${table.proposalType} = 'CORRECTION' and ${table.selectedField}::text not like 'evidenceNode.%' and ${table.evidenceNodeId} is null)
        or (${table.proposalType} = 'SOURCE_REFRESH' and ${table.evidenceNodeId} is null)`,
    ),
    check(
      'programme_contributions_digest_algorithm',
      sql`${table.contentDigestAlgorithm} = 'sha256'`,
    ),
    check(
      'programme_contributions_digest_format',
      sql`${table.contentDigest} is null or ${table.contentDigest} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      'programme_contributions_submitted_target_type',
      sql`${table.status} <> 'SUBMITTED'
        or (${table.proposalType} = 'CORRECTION' and (${table.selectedField}::text like 'programme.%' or ${table.selectedField}::text like 'evidenceNode.%'))
        or (${table.proposalType} = 'VERDICT_CHALLENGE' and (${table.selectedField}::text like 'summary.%' or ${table.selectedField}::text like 'verdict.%'))
        or (${table.proposalType} = 'SOURCE_REFRESH' and ${table.selectedField} is null)`,
    ),
    check(
      'programme_contributions_verdict_baseline_shape',
      sql`((${table.currentVerdictRevisionId} is null and ${table.currentVerdictSnapshot} is null)
        or (${table.currentVerdictRevisionId} is not null and ${table.currentVerdictSnapshot} is not null))
        and (${table.status} <> 'SUBMITTED' or ${table.proposalType} not in ('VERDICT_CHALLENGE', 'SOURCE_REFRESH') or ${table.currentVerdictRevisionId} is not null)`,
    ),
    check(
      'programme_contributions_source_review_shape',
      sql`((${table.sourceReviewTaskId} is null and ${table.sourceReviewSnapshotId} is null)
        or (${table.sourceReviewTaskId} is not null and ${table.sourceReviewSnapshotId} is not null))
        and (${table.proposalType} <> 'SOURCE_REFRESH' or ${table.sourceReviewTaskId} is not null)`,
    ),
    check(
      'programme_contributions_source_refresh_shape',
      sql`(
          ${table.proposalType} = 'SOURCE_REFRESH'
          and ${table.sourceRefreshDeltaSnapshot} is not null
          and jsonb_typeof(${table.sourceRefreshDeltaSnapshot}) = 'object'
          and ${table.selectedField} is null
          and nullif(btrim(${table.proposedText}), '') is null
          and ${table.proposedValue} is null
          and ${table.evidenceNodeId} is null
          and ${table.proposedStoppedVerdict} is null
          and ${table.claimNature} is null
          and nullif(btrim(${table.reasoning}), '') is null
          and nullif(btrim(${table.whatWasWrongOrMissing}), '') is null
          and ${table.affects} is null
          and ${table.currentValueSnapshot} is null
          and ${table.sourceReviewTaskId} is not null
          and ${table.sourceReviewSnapshotId} is not null
        ) or (
          ${table.proposalType} <> 'SOURCE_REFRESH'
          and ${table.sourceRefreshDeltaSnapshot} is null
        )`,
    ),
    check(
      'programme_contributions_stopped_verdict_proposal_shape',
      sql`${table.status} <> 'SUBMITTED' or (
        (${table.proposalType} = 'SOURCE_REFRESH'
          and ${table.selectedField} is null
          and ${table.proposedStoppedVerdict} is null)
        or (${table.selectedField} = 'verdict.verdictCode'
          and ${table.proposalType} = 'VERDICT_CHALLENGE'
          and ${table.proposedStoppedVerdict} is not null
          and nullif(btrim(${table.proposedText}), '') is null
          and ${table.proposedValue} is null)
        or (${table.selectedField} <> 'verdict.verdictCode' and ${table.proposedStoppedVerdict} is null)
      )`,
    ),
    check(
      'programme_contributions_submitted_replacement_shape',
      sql`${table.status} <> 'SUBMITTED' or (
        (${table.proposalType} = 'SOURCE_REFRESH'
          and ${table.selectedField} is null
          and nullif(btrim(${table.proposedText}), '') is null
          and ${table.proposedValue} is null
          and ${table.proposedStoppedVerdict} is null)
        or (${table.selectedField} in ('verdict.whatWasDisproven', 'verdict.whatWasNotDisproven', 'verdict.whatRemainsUnknown', 'verdict.conditionsThatWouldChangeVerdict')
          and nullif(btrim(${table.proposedText}), '') is null
          and jsonb_typeof(${table.proposedValue}) = 'array'
          and jsonb_array_length(${table.proposedValue}) > 0
          and ${table.proposedStoppedVerdict} is null)
        or (${table.selectedField} in ('programme.status', 'programme.stoppingReasonCategory', 'verdict.confidence', 'evidenceNode.state')
          and nullif(btrim(${table.proposedText}), '') is null
          and jsonb_typeof(${table.proposedValue}) = 'string'
          and nullif(btrim(${table.proposedValue} #>> '{}'), '') is not null
          and ${table.proposedStoppedVerdict} is null)
        or (${table.selectedField} = 'verdict.verdictCode'
          and nullif(btrim(${table.proposedText}), '') is null
          and ${table.proposedValue} is null
          and ${table.proposedStoppedVerdict} is not null)
        or (${table.selectedField} not in ('verdict.whatWasDisproven', 'verdict.whatWasNotDisproven', 'verdict.whatRemainsUnknown', 'verdict.conditionsThatWouldChangeVerdict', 'programme.status', 'programme.stoppingReasonCategory', 'verdict.confidence', 'evidenceNode.state', 'verdict.verdictCode')
          and nullif(btrim(${table.proposedText}), '') is not null
          and ${table.proposedValue} is null
          and ${table.proposedStoppedVerdict} is null)
      )`,
    ),
    check(
      'programme_contributions_submitted_complete',
      sql`${table.status} <> 'SUBMITTED' or (
        ${table.proposalType} <> 'SOURCE_REFRESH'
        and ${table.selectedField} is not null
        and (${table.proposedText} is not null or ${table.proposedValue} is not null or ${table.proposedStoppedVerdict} is not null)
        and ${table.sourceType} is not null
        and nullif(btrim(${table.sourceLocator}), '') is not null
        and nullif(btrim(${table.sourceIdentifier}), '') is not null
        and ${table.claimNature} is not null
        and nullif(btrim(${table.reasoning}), '') is not null
        and nullif(btrim(${table.whatWasWrongOrMissing}), '') is not null
        and ${table.affects} is not null
        and nullif(btrim(${table.conflictsOfInterest}), '') is not null
        and ${table.conflictsOfInterestAttested}
        and ${table.currentValueSnapshot} is not null
        and ${table.machineChecks} is not null
        and ${table.impactPreview} is not null
        and ${table.contentDigest} is not null
        and ${table.submittedAt} is not null
      ) or (
        ${table.proposalType} = 'SOURCE_REFRESH'
        and ${table.sourceType} = 'CLINICAL_TRIAL_REGISTRY'
        and nullif(btrim(${table.sourceLocator}), '') is not null
        and nullif(btrim(${table.sourceIdentifier}), '') is not null
        and ${table.sourceReviewTaskId} is not null
        and ${table.sourceReviewSnapshotId} is not null
        and ${table.sourceRefreshDeltaSnapshot} is not null
        and nullif(btrim(${table.conflictsOfInterest}), '') is not null
        and ${table.conflictsOfInterestAttested}
        and ${table.currentVerdictRevisionId} is not null
        and ${table.currentVerdictSnapshot} is not null
        and ${table.machineChecks} is not null
        and ${table.impactPreview} is not null
        and ${table.contentDigest} is not null
        and ${table.submittedAt} is not null
      )`,
    ),
  ],
)

/** Mutable only through the deterministic review/adjudication transition functions in 0006. */
export const programmeContributionReviewStates = pgTable(
  'programme_contribution_review_states',
  {
    proposalId: varchar('proposal_id', { length: 64 })
      .primaryKey()
      .references(() => programmeContributionProposals.id, { onDelete: 'cascade' }),
    status: contributionReviewStatusEnum('status').notNull().default('AWAITING_REVIEWS'),
    reviewCount: integer('review_count').notNull().default(0),
    // Review policy frozen at row creation. Rows opened before migration 0015 resolve at two
    // agreeing reviews; rows opened afterwards require three.
    requiredApprovals: integer('required_approvals').notNull().default(3),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  },
  (table) => [
    index('programme_contribution_review_states_queue_idx').on(table.status, table.updatedAt),
    check(
      'programme_contribution_review_states_count',
      sql`${table.reviewCount} >= 0 and ${table.reviewCount} <= ${table.requiredApprovals}`,
    ),
    check(
      'programme_contribution_review_states_required_approvals',
      sql`${table.requiredApprovals} in (2, 3)`,
    ),
    check(
      'programme_contribution_review_states_resolution',
      sql`(${table.status} in ('ACCEPTED_FOR_IMPLEMENTATION', 'CHANGES_REQUESTED', 'REJECTED') and ${table.resolvedAt} is not null)
        or (${table.status} not in ('ACCEPTED_FOR_IMPLEMENTATION', 'CHANGES_REQUESTED', 'REJECTED') and ${table.resolvedAt} is null)`,
    ),
  ],
)

/** One immutable, digest-bound decision per authenticated independent reviewer. */
export const programmeContributionReviews = pgTable(
  'programme_contribution_reviews',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    proposalId: varchar('proposal_id', { length: 64 })
      .notNull()
      .references(() => programmeContributionProposals.id, { onDelete: 'cascade' }),
    reviewerUserId: varchar('reviewer_user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    reviewerNameSnapshot: varchar('reviewer_name_snapshot', { length: 160 }).notNull(),
    reviewerOrcidSnapshot: varchar('reviewer_orcid_snapshot', { length: 32 }),
    expertiseTags: verdictReviewerExpertiseEnum('expertise_tags').array().notNull(),
    decision: verdictReviewDecisionEnum('decision').notNull(),
    independenceAttested: boolean('independence_attested').notNull().default(false),
    conflictsOfInterest: text('conflicts_of_interest').notNull(),
    conflictsOfInterestAttested: boolean('conflicts_of_interest_attested').notNull().default(false),
    reviewNote: text('review_note'),
    contentDigestAlgorithm: varchar('content_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    contentDigest: varchar('content_digest', { length: 64 }).notNull(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('programme_contribution_reviews_reviewer_unique').on(
      table.proposalId,
      table.reviewerUserId,
    ),
    index('programme_contribution_reviews_proposal_idx').on(table.proposalId, table.reviewedAt),
    index('programme_contribution_reviews_reviewer_idx').on(table.reviewerUserId),
    check('programme_contribution_reviews_expertise', sql`cardinality(${table.expertiseTags}) > 0`),
    check(
      'programme_contribution_reviews_attestations',
      sql`${table.independenceAttested} and ${table.conflictsOfInterestAttested} and nullif(btrim(${table.conflictsOfInterest}), '') is not null`,
    ),
    check(
      'programme_contribution_reviews_decision_note',
      sql`${table.decision} = 'APPROVE' or nullif(btrim(${table.reviewNote}), '') is not null`,
    ),
    check(
      'programme_contribution_reviews_digest',
      sql`${table.contentDigestAlgorithm} = 'sha256' and ${table.contentDigest} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      'programme_contribution_reviews_orcid',
      sql`${table.reviewerOrcidSnapshot} is null or ${table.reviewerOrcidSnapshot} ~ '^\\d{4}-\\d{4}-\\d{4}-\\d{3}[0-9X]$'`,
    ),
  ],
)

/** A single immutable steward/admin resolution when the two ordinary reviews disagree. */
export const programmeContributionAdjudications = pgTable(
  'programme_contribution_adjudications',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    proposalId: varchar('proposal_id', { length: 64 })
      .notNull()
      .references(() => programmeContributionProposals.id, { onDelete: 'cascade' }),
    adjudicatorUserId: varchar('adjudicator_user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    adjudicatorNameSnapshot: varchar('adjudicator_name_snapshot', { length: 160 }).notNull(),
    adjudicatorOrcidSnapshot: varchar('adjudicator_orcid_snapshot', { length: 32 }),
    expertiseTags: verdictReviewerExpertiseEnum('expertise_tags').array().notNull(),
    decision: verdictReviewDecisionEnum('decision').notNull(),
    rationale: text('rationale').notNull(),
    conflictsOfInterest: text('conflicts_of_interest').notNull(),
    conflictsOfInterestAttested: boolean('conflicts_of_interest_attested').notNull().default(false),
    contentDigestAlgorithm: varchar('content_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    contentDigest: varchar('content_digest', { length: 64 }).notNull(),
    adjudicatedAt: timestamp('adjudicated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('programme_contribution_adjudications_proposal_unique').on(table.proposalId),
    index('programme_contribution_adjudications_user_idx').on(table.adjudicatorUserId),
    check(
      'programme_contribution_adjudications_expertise',
      sql`cardinality(${table.expertiseTags}) > 0`,
    ),
    check(
      'programme_contribution_adjudications_complete',
      sql`nullif(btrim(${table.rationale}), '') is not null
        and nullif(btrim(${table.conflictsOfInterest}), '') is not null
        and ${table.conflictsOfInterestAttested}`,
    ),
    check(
      'programme_contribution_adjudications_digest',
      sql`${table.contentDigestAlgorithm} = 'sha256' and ${table.contentDigest} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      'programme_contribution_adjudications_orcid',
      sql`${table.adjudicatorOrcidSnapshot} is null or ${table.adjudicatorOrcidSnapshot} ~ '^\\d{4}-\\d{4}-\\d{4}-\\d{3}[0-9X]$'`,
    ),
  ],
)

/** One monitoring state per programme/source pair; attempts are distinct from evidence content. */
export const programmeFreshnessStates = pgTable(
  'programme_freshness_states',
  {
    programmeId: varchar('programme_id', { length: 64 })
      .notNull()
      .references(() => developmentProgrammes.id, { onDelete: 'cascade' }),
    sourceId: varchar('source_id', { length: 64 })
      .notNull()
      .references(() => evidenceSources.id, { onDelete: 'restrict' }),
    currentSnapshotId: varchar('current_snapshot_id', { length: 64 }),
    pendingSnapshotId: varchar('pending_snapshot_id', { length: 64 }),
    checkStatus: sourceCheckStatusEnum('check_status').notNull().default('NOT_CHECKED'),
    freshnessStatus: sourceFreshnessStatusEnum('freshness_status')
      .notNull()
      .default('NOT_ASSESSED'),
    lastCheckAttemptAt: timestamp('last_check_attempt_at', { withTimezone: true }),
    lastSuccessfulCheckAt: timestamp('last_successful_check_at', { withTimezone: true }),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    nextCheckDueAt: timestamp('next_check_due_at', { withTimezone: true }),
    consecutiveFailures: integer('consecutive_failures').notNull().default(0),
    lastErrorCode: varchar('last_error_code', { length: 120 }),
    lastErrorMessage: text('last_error_message'),
    newEvidenceDetectedAt: timestamp('new_evidence_detected_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'programme_freshness_states_pk',
      columns: [table.programmeId, table.sourceId],
    }),
    foreignKey({
      name: 'programme_freshness_current_snapshot_source_fk',
      columns: [table.currentSnapshotId, table.sourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    foreignKey({
      name: 'programme_freshness_pending_snapshot_source_fk',
      columns: [table.pendingSnapshotId, table.sourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    index('programme_freshness_status_idx').on(table.freshnessStatus, table.nextCheckDueAt),
    index('programme_freshness_source_idx').on(table.sourceId),
    check('programme_freshness_failures_nonnegative', sql`${table.consecutiveFailures} >= 0`),
    check(
      'programme_freshness_distinct_snapshots',
      sql`${table.pendingSnapshotId} is null or ${table.pendingSnapshotId} <> ${table.currentSnapshotId}`,
    ),
  ],
)

/** Observable, retryable source-adapter executions. No medical interpretation is stored here. */
export const evidenceMonitorRuns = pgTable(
  'evidence_monitor_runs',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    adapterKey: varchar('adapter_key', { length: 120 }).notNull(),
    sourceId: varchar('source_id', { length: 64 })
      .notNull()
      .references(() => evidenceSources.id, { onDelete: 'restrict' }),
    programmeId: varchar('programme_id', { length: 64 }).references(
      () => developmentProgrammes.id,
      { onDelete: 'set null' },
    ),
    snapshotId: varchar('snapshot_id', { length: 64 }),
    status: monitorRunStatusEnum('status').notNull().default('QUEUED'),
    attemptNumber: integer('attempt_number').notNull().default(1),
    maxAttempts: integer('max_attempts').notNull().default(3),
    changedFieldCount: integer('changed_field_count').notNull().default(0),
    startedAt: timestamp('started_at', { withTimezone: true }),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
    errorCode: varchar('error_code', { length: 120 }),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      name: 'evidence_monitor_runs_snapshot_source_fk',
      columns: [table.snapshotId, table.sourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    index('evidence_monitor_runs_status_retry_idx').on(table.status, table.nextRetryAt),
    index('evidence_monitor_runs_source_created_idx').on(table.sourceId, table.createdAt),
    index('evidence_monitor_runs_programme_created_idx').on(table.programmeId, table.createdAt),
    check(
      'evidence_monitor_runs_attempts_valid',
      sql`${table.attemptNumber} > 0 and ${table.maxAttempts} > 0 and ${table.attemptNumber} <= ${table.maxAttempts}`,
    ),
    check('evidence_monitor_runs_changes_nonnegative', sql`${table.changedFieldCount} >= 0`),
    check(
      'evidence_monitor_runs_finished_at',
      sql`${table.status} not in ('SUCCEEDED', 'FAILED', 'SOURCE_UNAVAILABLE', 'CANCELLED') or ${table.finishedAt} is not null`,
    ),
  ],
)

/** Durable human-review work created when a source diff affects interpretive content. */
export const evidenceReviewTasks = pgTable(
  'evidence_review_tasks',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    programmeId: varchar('programme_id', { length: 64 })
      .notNull()
      .references(() => developmentProgrammes.id, { onDelete: 'cascade' }),
    sourceId: varchar('source_id', { length: 64 })
      .notNull()
      .references(() => evidenceSources.id, { onDelete: 'restrict' }),
    triggerSnapshotId: varchar('trigger_snapshot_id', { length: 64 }).notNull(),
    monitorRunId: varchar('monitor_run_id', { length: 64 }).references(
      () => evidenceMonitorRuns.id,
      { onDelete: 'set null' },
    ),
    impactLevel: reviewImpactLevelEnum('impact_level').notNull(),
    status: evidenceReviewTaskStatusEnum('status').notNull().default('OPEN'),
    reason: text('reason').notNull(),
    affectedClaimIds: jsonb('affected_claim_ids')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    affectedSurfacePaths: jsonb('affected_surface_paths')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    assignedReviewerUserId: varchar('assigned_reviewer_user_id', { length: 64 }).references(
      () => users.id,
      { onDelete: 'set null' },
    ),
    resolutionNote: text('resolution_note'),
    resolvedByUserId: varchar('resolved_by_user_id', { length: 64 }).references(() => users.id, {
      onDelete: 'restrict',
    }),
    resolutionVerdictRevisionId: varchar('resolution_verdict_revision_id', {
      length: 64,
    }).references(() => programmeVerdictRevisions.id, { onDelete: 'restrict' }),
    resolutionContributionProposalId: varchar('resolution_contribution_proposal_id', {
      length: 64,
    }).references((): AnyPgColumn => programmeContributionProposals.id, {
      onDelete: 'restrict',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  },
  (table) => [
    unique('evidence_review_tasks_source_delta_identity_unique').on(
      table.id,
      table.programmeId,
      table.sourceId,
      table.triggerSnapshotId,
    ),
    foreignKey({
      name: 'evidence_review_tasks_snapshot_source_fk',
      columns: [table.triggerSnapshotId, table.sourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    index('evidence_review_tasks_status_impact_idx').on(
      table.status,
      table.impactLevel,
      table.createdAt,
    ),
    index('evidence_review_tasks_programme_idx').on(table.programmeId, table.createdAt),
    index('evidence_review_tasks_snapshot_idx').on(table.triggerSnapshotId),
    index('evidence_review_tasks_assignee_idx').on(table.assignedReviewerUserId, table.status),
    index('evidence_review_tasks_resolution_verdict_idx').on(table.resolutionVerdictRevisionId),
    index('evidence_review_tasks_resolution_contribution_idx').on(
      table.resolutionContributionProposalId,
    ),
    check(
      'evidence_review_tasks_resolution_date',
      sql`${table.status} not in ('RESOLVED', 'DISMISSED') or ${table.resolvedAt} is not null`,
    ),
    check(
      'evidence_review_tasks_published_resolution',
      sql`${table.status} <> 'RESOLVED' or (
        ${table.resolvedByUserId} is not null
        and (
          (${table.resolutionVerdictRevisionId} is not null and ${table.resolutionContributionProposalId} is null)
          or (${table.resolutionVerdictRevisionId} is null and ${table.resolutionContributionProposalId} is not null)
        )
        and nullif(btrim(${table.resolutionNote}), '') is not null
      )`,
    ),
  ],
)

/** Parser-derived, immutable before/after facts and graph impact for one exact source task. */
export const evidenceReviewTaskSourceDeltas = pgTable(
  'evidence_review_task_source_deltas',
  {
    reviewTaskId: varchar('review_task_id', { length: 64 }).primaryKey(),
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    sourceId: varchar('source_id', { length: 64 }).notNull(),
    baselineSnapshotId: varchar('baseline_snapshot_id', { length: 64 }).notNull(),
    pendingSnapshotId: varchar('pending_snapshot_id', { length: 64 }).notNull(),
    adapterKey: varchar('adapter_key', { length: 120 }).notNull(),
    schemaVersion: varchar('schema_version', { length: 64 })
      .notNull()
      .default('rna-intelligence/source-refresh-delta-v1'),
    action: sourceRefreshActionEnum('action').notNull(),
    changedTrialFields: jsonb('changed_trial_fields')
      .$type<SourceRefreshChangedTrialField[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    affectedClaimIds: jsonb('affected_claim_ids')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    affectedInterpretability: jsonb('affected_interpretability')
      .$type<SourceRefreshAffectedInterpretability[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    affectedSurfacePaths: jsonb('affected_surface_paths')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    scientificRevisionRequirements: jsonb('scientific_revision_requirements')
      .$type<SourceRefreshScientificRevisionRequirement[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    deltaDigestAlgorithm: varchar('delta_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    deltaDigest: varchar('delta_digest', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      name: 'evidence_review_task_source_deltas_task_identity_fk',
      columns: [table.reviewTaskId, table.programmeId, table.sourceId, table.pendingSnapshotId],
      foreignColumns: [
        evidenceReviewTasks.id,
        evidenceReviewTasks.programmeId,
        evidenceReviewTasks.sourceId,
        evidenceReviewTasks.triggerSnapshotId,
      ],
    }).onDelete('restrict'),
    foreignKey({
      name: 'evidence_review_task_source_deltas_freshness_fk',
      columns: [table.programmeId, table.sourceId],
      foreignColumns: [programmeFreshnessStates.programmeId, programmeFreshnessStates.sourceId],
    }).onDelete('restrict'),
    foreignKey({
      name: 'evidence_review_task_source_deltas_baseline_source_fk',
      columns: [table.baselineSnapshotId, table.sourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    foreignKey({
      name: 'evidence_review_task_source_deltas_pending_source_fk',
      columns: [table.pendingSnapshotId, table.sourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    index('evidence_review_task_source_deltas_programme_action_idx').on(
      table.programmeId,
      table.action,
      table.createdAt,
    ),
    index('evidence_review_task_source_deltas_source_created_idx').on(
      table.sourceId,
      table.createdAt,
    ),
    check(
      'evidence_review_task_source_deltas_distinct_snapshots',
      sql`${table.baselineSnapshotId} <> ${table.pendingSnapshotId}`,
    ),
    check(
      'evidence_review_task_source_deltas_schema',
      sql`${table.schemaVersion} = 'rna-intelligence/source-refresh-delta-v1'`,
    ),
    check(
      'evidence_review_task_source_deltas_json_shape',
      sql`jsonb_typeof(${table.changedTrialFields}) = 'array'
        and jsonb_array_length(${table.changedTrialFields}) > 0
        and jsonb_typeof(${table.affectedClaimIds}) = 'array'
        and jsonb_typeof(${table.affectedInterpretability}) = 'array'
        and jsonb_typeof(${table.affectedSurfacePaths}) = 'array'
        and jsonb_typeof(${table.scientificRevisionRequirements}) = 'array'`,
    ),
    check(
      'evidence_review_task_source_deltas_action_shape',
      sql`(${table.action} = 'CANONICAL_REFRESH' and jsonb_array_length(${table.scientificRevisionRequirements}) = 0)
        or (${table.action} = 'NEEDS_SCIENTIFIC_REVISION' and jsonb_array_length(${table.scientificRevisionRequirements}) > 0)`,
    ),
    check(
      'evidence_review_task_source_deltas_digest',
      sql`${table.deltaDigestAlgorithm} = 'sha256' and ${table.deltaDigest} ~ '^[0-9a-f]{64}$'`,
    ),
  ],
)

/**
 * Immutable audit bridge from one accepted reader proposal to one canonical candidate. The bridge
 * records who performed the mechanical implementation, but the contribution author remains the
 * scientific author of the candidate. Optional source-task columns bind one exact monitored
 * snapshot; they are never inferred from a citation string.
 */
export const programmeContributionImplementations = pgTable(
  'programme_contribution_implementations',
  {
    proposalId: varchar('proposal_id', { length: 64 }).primaryKey(),
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    proposalKey: varchar('proposal_key', { length: 64 }).notNull(),
    verdictRevisionId: varchar('verdict_revision_id', { length: 64 }).notNull(),
    implementedByUserId: varchar('implemented_by_user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    contributionDigestAlgorithm: varchar('contribution_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    contributionDigest: varchar('contribution_digest', { length: 64 }).notNull(),
    sourceReviewTaskId: varchar('source_review_task_id', { length: 64 }).references(
      () => evidenceReviewTasks.id,
      { onDelete: 'cascade' },
    ),
    sourceId: varchar('source_id', { length: 64 }).references(() => evidenceSources.id, {
      onDelete: 'restrict',
    }),
    sourceSnapshotId: varchar('source_snapshot_id', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      name: 'programme_contribution_implementations_proposal_scope_fk',
      columns: [table.proposalId, table.programmeId, table.proposalKey],
      foreignColumns: [
        programmeContributionProposals.id,
        programmeContributionProposals.programmeId,
        programmeContributionProposals.proposalKey,
      ],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_contribution_implementations_verdict_programme_fk',
      columns: [table.verdictRevisionId, table.programmeId],
      foreignColumns: [programmeVerdictRevisions.id, programmeVerdictRevisions.programmeId],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_contribution_implementations_snapshot_source_fk',
      columns: [table.sourceSnapshotId, table.sourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    uniqueIndex('programme_contribution_implementations_verdict_unique').on(
      table.verdictRevisionId,
    ),
    uniqueIndex('programme_contribution_implementations_source_task_unique')
      .on(table.sourceReviewTaskId)
      .where(sql`${table.sourceReviewTaskId} is not null`),
    index('programme_contribution_implementations_programme_idx').on(
      table.programmeId,
      table.createdAt,
    ),
    check(
      'programme_contribution_implementations_digest',
      sql`${table.contributionDigestAlgorithm} = 'sha256'
        and ${table.contributionDigest} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      'programme_contribution_implementations_source_shape',
      sql`(
          ${table.sourceReviewTaskId} is null
          and ${table.sourceId} is null
          and ${table.sourceSnapshotId} is null
        ) or (
          ${table.sourceReviewTaskId} is not null
          and ${table.sourceId} is not null
          and ${table.sourceSnapshotId} is not null
        )`,
    ),
  ],
)

/**
 * Accepted, task-bound exact source correction for a strictly empty/unpublished programme. This
 * closes monitored onboarding metadata without creating a claim, evidence node, or conclusion.
 */
export const programmeContributionSourceTaskResolutions = pgTable(
  'programme_contribution_source_task_resolutions',
  {
    proposalId: varchar('proposal_id', { length: 64 }).primaryKey(),
    programmeId: varchar('programme_id', { length: 64 }).notNull(),
    proposalKey: varchar('proposal_key', { length: 64 }).notNull(),
    sourceReviewTaskId: varchar('source_review_task_id', { length: 64 })
      .notNull()
      .references(() => evidenceReviewTasks.id, { onDelete: 'cascade' }),
    sourceId: varchar('source_id', { length: 64 })
      .notNull()
      .references(() => evidenceSources.id, { onDelete: 'restrict' }),
    sourceSnapshotId: varchar('source_snapshot_id', { length: 64 }).notNull(),
    resolvedByUserId: varchar('resolved_by_user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    contributionDigestAlgorithm: varchar('contribution_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    contributionDigest: varchar('contribution_digest', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      name: 'programme_source_task_resolutions_proposal_scope_fk',
      columns: [table.proposalId, table.programmeId, table.proposalKey],
      foreignColumns: [
        programmeContributionProposals.id,
        programmeContributionProposals.programmeId,
        programmeContributionProposals.proposalKey,
      ],
    }).onDelete('cascade'),
    foreignKey({
      name: 'programme_source_task_resolutions_snapshot_source_fk',
      columns: [table.sourceSnapshotId, table.sourceId],
      foreignColumns: [sourceSnapshots.id, sourceSnapshots.sourceId],
    }).onDelete('restrict'),
    uniqueIndex('programme_source_task_resolutions_task_unique').on(table.sourceReviewTaskId),
    index('programme_source_task_resolutions_programme_idx').on(table.programmeId, table.createdAt),
    check(
      'programme_source_task_resolutions_digest',
      sql`${table.contributionDigestAlgorithm} = 'sha256'
        and ${table.contributionDigest} ~ '^[0-9a-f]{64}$'`,
    ),
  ],
)

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const drugsRelations = relations(drugs, ({ many }) => ({
  notes: many(communityNotes),
  revisions: many(revisions),
  aliases: many(drugAliases),
  programmes: many(developmentProgrammes),
  backgroundSourceBindings: many(backgroundSourceBindings),
}))

export const drugAliasesRelations = relations(drugAliases, ({ one }) => ({
  drug: one(drugs, { fields: [drugAliases.drugId], references: [drugs.id] }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  notes: many(communityNotes),
  revisions: many(revisions),
  saved: many(savedDrugs),
  physicianVerificationRequests: many(physicianVerificationRequests, {
    relationName: 'physician_verification_subject',
  }),
  physicianVerificationDecisions: many(physicianVerificationRequests, {
    relationName: 'physician_verification_decider',
  }),
  roleEventsReceived: many(accountRoleEvents, { relationName: 'account_role_target' }),
  roleEventsAuthorized: many(accountRoleEvents, { relationName: 'account_role_actor' }),
  contributionProposals: many(programmeContributionProposals),
  contributionReviews: many(programmeContributionReviews),
  contributionAdjudications: many(programmeContributionAdjudications),
}))

export const physicianVerificationRequestsRelations = relations(
  physicianVerificationRequests,
  ({ one }) => ({
    user: one(users, {
      relationName: 'physician_verification_subject',
      fields: [physicianVerificationRequests.userId],
      references: [users.id],
    }),
    decidedBy: one(users, {
      relationName: 'physician_verification_decider',
      fields: [physicianVerificationRequests.decidedByUserId],
      references: [users.id],
    }),
  }),
)

export const accountRoleEventsRelations = relations(accountRoleEvents, ({ one }) => ({
  target: one(users, {
    relationName: 'account_role_target',
    fields: [accountRoleEvents.targetUserId],
    references: [users.id],
  }),
  actor: one(users, {
    relationName: 'account_role_actor',
    fields: [accountRoleEvents.actorUserId],
    references: [users.id],
  }),
}))

export const communityNotesRelations = relations(communityNotes, ({ one, many }) => ({
  drug: one(drugs, { fields: [communityNotes.drugId], references: [drugs.id] }),
  author: one(users, { fields: [communityNotes.authorUserId], references: [users.id] }),
  upvoters: many(noteUpvotes),
}))

export const revisionsRelations = relations(revisions, ({ one }) => ({
  drug: one(drugs, { fields: [revisions.drugId], references: [drugs.id] }),
  author: one(users, { fields: [revisions.authorUserId], references: [users.id] }),
  identityCorrection: one(legacyIdentityCorrectionDetails, {
    fields: [revisions.id],
    references: [legacyIdentityCorrectionDetails.revisionId],
  }),
  quarantine: one(legacyRevisionQuarantines, {
    fields: [revisions.id],
    references: [legacyRevisionQuarantines.revisionId],
  }),
}))

export const legacyIdentityCorrectionDetailsRelations = relations(
  legacyIdentityCorrectionDetails,
  ({ one }) => ({
    revision: one(revisions, {
      fields: [legacyIdentityCorrectionDetails.revisionId],
      references: [revisions.id],
    }),
  }),
)

export const legacyRevisionQuarantinesRelations = relations(
  legacyRevisionQuarantines,
  ({ one }) => ({
    revision: one(revisions, {
      fields: [legacyRevisionQuarantines.revisionId],
      references: [revisions.id],
    }),
  }),
)

export const noteUpvotesRelations = relations(noteUpvotes, ({ one }) => ({
  note: one(communityNotes, { fields: [noteUpvotes.noteId], references: [communityNotes.id] }),
  user: one(users, { fields: [noteUpvotes.userId], references: [users.id] }),
}))

export const savedDrugsRelations = relations(savedDrugs, ({ one }) => ({
  user: one(users, { fields: [savedDrugs.userId], references: [users.id] }),
  drug: one(drugs, { fields: [savedDrugs.drugId], references: [drugs.id] }),
}))

export const developmentProgrammesRelations = relations(developmentProgrammes, ({ one, many }) => ({
  drug: one(drugs, {
    fields: [developmentProgrammes.drugId],
    references: [drugs.id],
  }),
  trials: many(programmeTrials),
  interpretabilityAssessments: many(trialInterpretabilityAssessments),
  claims: many(claims),
  evidenceNodes: many(evidenceNodes),
  verdictRevisions: many(programmeVerdictRevisions),
  currentPublication: one(programmeCurrentPublications),
  dependencies: many(programmeDependencies),
  freshnessStates: many(programmeFreshnessStates),
  monitorRuns: many(evidenceMonitorRuns),
  reviewTasks: many(evidenceReviewTasks),
  contributionProposals: many(programmeContributionProposals),
}))

export const evidenceSourcesRelations = relations(evidenceSources, ({ many }) => ({
  snapshots: many(sourceSnapshots),
  backgroundBindings: many(backgroundSourceBindings),
  backgroundFetches: many(backgroundSourceFetches),
  programmeTrials: many(programmeTrials),
  programmeFreshnessStates: many(programmeFreshnessStates),
  monitorRuns: many(evidenceMonitorRuns),
  reviewTasks: many(evidenceReviewTasks),
}))

export const sourceSnapshotsRelations = relations(sourceSnapshots, ({ one, many }) => ({
  source: one(evidenceSources, {
    fields: [sourceSnapshots.sourceId],
    references: [evidenceSources.id],
  }),
  claimLinks: many(claimSourceLinks),
  backgroundFetches: many(backgroundSourceFetches),
  backgroundAssertionChecks: many(backgroundAssertionChecks),
}))

export const backgroundSourceBindingsRelations = relations(
  backgroundSourceBindings,
  ({ one, many }) => ({
    drug: one(drugs, {
      fields: [backgroundSourceBindings.drugId],
      references: [drugs.id],
    }),
    source: one(evidenceSources, {
      fields: [backgroundSourceBindings.sourceId],
      references: [evidenceSources.id],
    }),
    assertionChecks: many(backgroundAssertionChecks),
  }),
)

export const backgroundSourceFetchesRelations = relations(
  backgroundSourceFetches,
  ({ one, many }) => ({
    source: one(evidenceSources, {
      fields: [backgroundSourceFetches.sourceId],
      references: [evidenceSources.id],
    }),
    snapshot: one(sourceSnapshots, {
      fields: [backgroundSourceFetches.sourceSnapshotId],
      references: [sourceSnapshots.id],
    }),
    assertionChecks: many(backgroundAssertionChecks),
  }),
)

export const backgroundAssertionChecksRelations = relations(
  backgroundAssertionChecks,
  ({ one }) => ({
    binding: one(backgroundSourceBindings, {
      fields: [backgroundAssertionChecks.bindingId],
      references: [backgroundSourceBindings.id],
    }),
    fetch: one(backgroundSourceFetches, {
      fields: [backgroundAssertionChecks.fetchId],
      references: [backgroundSourceFetches.id],
    }),
    source: one(evidenceSources, {
      fields: [backgroundAssertionChecks.sourceId],
      references: [evidenceSources.id],
    }),
    snapshot: one(sourceSnapshots, {
      fields: [backgroundAssertionChecks.sourceSnapshotId],
      references: [sourceSnapshots.id],
    }),
  }),
)

export const claimsRelations = relations(claims, ({ one, many }) => ({
  programme: one(developmentProgrammes, {
    fields: [claims.programmeId],
    references: [developmentProgrammes.id],
  }),
  sourceLinks: many(claimSourceLinks),
  programmeTrial: one(programmeTrials, {
    fields: [claims.programmeTrialId],
    references: [programmeTrials.id],
  }),
  evidenceNodeLinks: many(evidenceNodeClaims),
  interpretabilityLinks: many(trialInterpretabilityClaims),
  verdictLinks: many(programmeVerdictClaims),
  mechanismStepLinks: many(programmeVerdictMechanismStepClaims),
  timelineEventLinks: many(programmeVerdictTimelineEventClaims),
  dependencies: many(programmeDependencies),
}))

export const evidenceNodesRelations = relations(evidenceNodes, ({ one, many }) => ({
  programme: one(developmentProgrammes, {
    fields: [evidenceNodes.programmeId],
    references: [developmentProgrammes.id],
  }),
  claimLinks: many(evidenceNodeClaims),
  dependencies: many(programmeDependencies),
  verdictLinks: many(programmeVerdictEvidenceNodes),
  contributionProposals: many(programmeContributionProposals),
}))

export const programmeVerdictRevisionsRelations = relations(
  programmeVerdictRevisions,
  ({ one, many }) => ({
    programme: one(developmentProgrammes, {
      fields: [programmeVerdictRevisions.programmeId],
      references: [developmentProgrammes.id],
    }),
    claimLinks: many(programmeVerdictClaims),
    mechanismSteps: many(programmeVerdictMechanismSteps),
    timelineEvents: many(programmeVerdictTimelineEvents),
    trialLinks: many(programmeVerdictTrials),
    evidenceNodeLinks: many(programmeVerdictEvidenceNodes),
    interpretabilityLinks: many(programmeVerdictInterpretabilityAssessments),
    reviews: many(programmeVerdictReviews),
    currentPublication: one(programmeCurrentPublications),
    dependencies: many(programmeDependencies),
    contributionBaselines: many(programmeContributionProposals),
  }),
)

export const claimSourceLinksRelations = relations(claimSourceLinks, ({ one }) => ({
  claim: one(claims, { fields: [claimSourceLinks.claimId], references: [claims.id] }),
  sourceSnapshot: one(sourceSnapshots, {
    fields: [claimSourceLinks.sourceSnapshotId],
    references: [sourceSnapshots.id],
  }),
}))

export const evidenceNodeClaimsRelations = relations(evidenceNodeClaims, ({ one }) => ({
  evidenceNode: one(evidenceNodes, {
    fields: [evidenceNodeClaims.evidenceNodeId],
    references: [evidenceNodes.id],
  }),
  claim: one(claims, { fields: [evidenceNodeClaims.claimId], references: [claims.id] }),
}))

export const programmeTrialsRelations = relations(programmeTrials, ({ one, many }) => ({
  programme: one(developmentProgrammes, {
    fields: [programmeTrials.programmeId],
    references: [developmentProgrammes.id],
  }),
  registrySource: one(evidenceSources, {
    fields: [programmeTrials.registrySourceId],
    references: [evidenceSources.id],
  }),
  registrySnapshot: one(sourceSnapshots, {
    fields: [programmeTrials.registrySnapshotId],
    references: [sourceSnapshots.id],
  }),
  claims: many(claims),
  interpretabilityAssessments: many(trialInterpretabilityAssessments),
  verdictLinks: many(programmeVerdictTrials),
  verdictSnapshots: many(programmeVerdictTrialSnapshots),
}))

export const trialInterpretabilityAssessmentsRelations = relations(
  trialInterpretabilityAssessments,
  ({ one, many }) => ({
    programme: one(developmentProgrammes, {
      fields: [trialInterpretabilityAssessments.programmeId],
      references: [developmentProgrammes.id],
    }),
    trial: one(programmeTrials, {
      fields: [trialInterpretabilityAssessments.programmeTrialId],
      references: [programmeTrials.id],
    }),
    claimLinks: many(trialInterpretabilityClaims),
    verdictLinks: many(programmeVerdictInterpretabilityAssessments),
  }),
)

export const trialInterpretabilityClaimsRelations = relations(
  trialInterpretabilityClaims,
  ({ one }) => ({
    assessment: one(trialInterpretabilityAssessments, {
      fields: [trialInterpretabilityClaims.assessmentId],
      references: [trialInterpretabilityAssessments.id],
    }),
    claim: one(claims, {
      fields: [trialInterpretabilityClaims.claimId],
      references: [claims.id],
    }),
  }),
)

export const programmeVerdictClaimsRelations = relations(programmeVerdictClaims, ({ one }) => ({
  verdictRevision: one(programmeVerdictRevisions, {
    fields: [programmeVerdictClaims.verdictRevisionId],
    references: [programmeVerdictRevisions.id],
  }),
  claim: one(claims, { fields: [programmeVerdictClaims.claimId], references: [claims.id] }),
}))

export const programmeVerdictMechanismStepsRelations = relations(
  programmeVerdictMechanismSteps,
  ({ one, many }) => ({
    verdictRevision: one(programmeVerdictRevisions, {
      fields: [programmeVerdictMechanismSteps.verdictRevisionId],
      references: [programmeVerdictRevisions.id],
    }),
    claimLinks: many(programmeVerdictMechanismStepClaims),
  }),
)

export const programmeVerdictMechanismStepClaimsRelations = relations(
  programmeVerdictMechanismStepClaims,
  ({ one }) => ({
    step: one(programmeVerdictMechanismSteps, {
      fields: [
        programmeVerdictMechanismStepClaims.verdictRevisionId,
        programmeVerdictMechanismStepClaims.stepKey,
      ],
      references: [
        programmeVerdictMechanismSteps.verdictRevisionId,
        programmeVerdictMechanismSteps.stepKey,
      ],
    }),
    claim: one(claims, {
      fields: [programmeVerdictMechanismStepClaims.claimId],
      references: [claims.id],
    }),
  }),
)

export const programmeVerdictTimelineEventsRelations = relations(
  programmeVerdictTimelineEvents,
  ({ one, many }) => ({
    verdictRevision: one(programmeVerdictRevisions, {
      fields: [programmeVerdictTimelineEvents.verdictRevisionId],
      references: [programmeVerdictRevisions.id],
    }),
    programmeTrial: one(programmeTrials, {
      fields: [programmeVerdictTimelineEvents.programmeTrialId],
      references: [programmeTrials.id],
    }),
    source: one(evidenceSources, {
      fields: [programmeVerdictTimelineEvents.sourceId],
      references: [evidenceSources.id],
    }),
    sourceSnapshot: one(sourceSnapshots, {
      fields: [programmeVerdictTimelineEvents.sourceSnapshotId],
      references: [sourceSnapshots.id],
    }),
    claimLinks: many(programmeVerdictTimelineEventClaims),
  }),
)

export const programmeVerdictTimelineEventClaimsRelations = relations(
  programmeVerdictTimelineEventClaims,
  ({ one }) => ({
    event: one(programmeVerdictTimelineEvents, {
      fields: [
        programmeVerdictTimelineEventClaims.verdictRevisionId,
        programmeVerdictTimelineEventClaims.eventKey,
      ],
      references: [
        programmeVerdictTimelineEvents.verdictRevisionId,
        programmeVerdictTimelineEvents.eventKey,
      ],
    }),
    claim: one(claims, {
      fields: [programmeVerdictTimelineEventClaims.claimId],
      references: [claims.id],
    }),
  }),
)

export const programmeVerdictTrialsRelations = relations(programmeVerdictTrials, ({ one }) => ({
  verdictRevision: one(programmeVerdictRevisions, {
    fields: [programmeVerdictTrials.verdictRevisionId],
    references: [programmeVerdictRevisions.id],
  }),
  programmeTrial: one(programmeTrials, {
    fields: [programmeVerdictTrials.programmeTrialId],
    references: [programmeTrials.id],
  }),
  snapshot: one(programmeVerdictTrialSnapshots),
}))

export const programmeVerdictTrialSnapshotsRelations = relations(
  programmeVerdictTrialSnapshots,
  ({ one }) => ({
    verdictRevision: one(programmeVerdictRevisions, {
      fields: [programmeVerdictTrialSnapshots.verdictRevisionId],
      references: [programmeVerdictRevisions.id],
    }),
    programmeTrial: one(programmeTrials, {
      fields: [programmeVerdictTrialSnapshots.programmeTrialId],
      references: [programmeTrials.id],
    }),
    registrySource: one(evidenceSources, {
      fields: [programmeVerdictTrialSnapshots.registrySourceId],
      references: [evidenceSources.id],
    }),
    registrySnapshot: one(sourceSnapshots, {
      fields: [programmeVerdictTrialSnapshots.registrySnapshotId],
      references: [sourceSnapshots.id],
    }),
  }),
)

export const programmeVerdictEvidenceNodesRelations = relations(
  programmeVerdictEvidenceNodes,
  ({ one }) => ({
    verdictRevision: one(programmeVerdictRevisions, {
      fields: [programmeVerdictEvidenceNodes.verdictRevisionId],
      references: [programmeVerdictRevisions.id],
    }),
    evidenceNode: one(evidenceNodes, {
      fields: [programmeVerdictEvidenceNodes.evidenceNodeId],
      references: [evidenceNodes.id],
    }),
  }),
)

export const programmeVerdictInterpretabilityAssessmentsRelations = relations(
  programmeVerdictInterpretabilityAssessments,
  ({ one }) => ({
    verdictRevision: one(programmeVerdictRevisions, {
      fields: [programmeVerdictInterpretabilityAssessments.verdictRevisionId],
      references: [programmeVerdictRevisions.id],
    }),
    assessment: one(trialInterpretabilityAssessments, {
      fields: [programmeVerdictInterpretabilityAssessments.assessmentId],
      references: [trialInterpretabilityAssessments.id],
    }),
  }),
)

export const programmeVerdictReviewsRelations = relations(programmeVerdictReviews, ({ one }) => ({
  verdictRevision: one(programmeVerdictRevisions, {
    fields: [programmeVerdictReviews.verdictRevisionId],
    references: [programmeVerdictRevisions.id],
  }),
  reviewer: one(users, {
    fields: [programmeVerdictReviews.reviewerUserId],
    references: [users.id],
  }),
}))

export const programmeCurrentPublicationsRelations = relations(
  programmeCurrentPublications,
  ({ one }) => ({
    programme: one(developmentProgrammes, {
      fields: [programmeCurrentPublications.programmeId],
      references: [developmentProgrammes.id],
    }),
    verdictRevision: one(programmeVerdictRevisions, {
      fields: [programmeCurrentPublications.verdictRevisionId],
      references: [programmeVerdictRevisions.id],
    }),
  }),
)

export const programmeDependenciesRelations = relations(programmeDependencies, ({ one }) => ({
  programme: one(developmentProgrammes, {
    fields: [programmeDependencies.programmeId],
    references: [developmentProgrammes.id],
  }),
  claim: one(claims, {
    fields: [programmeDependencies.claimId],
    references: [claims.id],
  }),
  evidenceNode: one(evidenceNodes, {
    fields: [programmeDependencies.evidenceNodeId],
    references: [evidenceNodes.id],
  }),
  verdictRevision: one(programmeVerdictRevisions, {
    fields: [programmeDependencies.verdictRevisionId],
    references: [programmeVerdictRevisions.id],
  }),
}))

export const programmeContributionProposalsRelations = relations(
  programmeContributionProposals,
  ({ one, many }) => ({
    programme: one(developmentProgrammes, {
      fields: [programmeContributionProposals.programmeId],
      references: [developmentProgrammes.id],
    }),
    author: one(users, {
      fields: [programmeContributionProposals.authorUserId],
      references: [users.id],
    }),
    previousProposal: one(programmeContributionProposals, {
      relationName: 'programmeContributionLineage',
      fields: [programmeContributionProposals.previousProposalId],
      references: [programmeContributionProposals.id],
    }),
    nextRevisions: many(programmeContributionProposals, {
      relationName: 'programmeContributionLineage',
    }),
    evidenceNode: one(evidenceNodes, {
      fields: [programmeContributionProposals.evidenceNodeId],
      references: [evidenceNodes.id],
    }),
    currentVerdictRevision: one(programmeVerdictRevisions, {
      fields: [programmeContributionProposals.currentVerdictRevisionId],
      references: [programmeVerdictRevisions.id],
    }),
    reviewState: one(programmeContributionReviewStates),
    reviews: many(programmeContributionReviews),
    adjudications: many(programmeContributionAdjudications),
  }),
)

export const programmeContributionReviewStatesRelations = relations(
  programmeContributionReviewStates,
  ({ one }) => ({
    proposal: one(programmeContributionProposals, {
      fields: [programmeContributionReviewStates.proposalId],
      references: [programmeContributionProposals.id],
    }),
  }),
)

export const programmeContributionReviewsRelations = relations(
  programmeContributionReviews,
  ({ one }) => ({
    proposal: one(programmeContributionProposals, {
      fields: [programmeContributionReviews.proposalId],
      references: [programmeContributionProposals.id],
    }),
    reviewer: one(users, {
      fields: [programmeContributionReviews.reviewerUserId],
      references: [users.id],
    }),
  }),
)

export const programmeContributionAdjudicationsRelations = relations(
  programmeContributionAdjudications,
  ({ one }) => ({
    proposal: one(programmeContributionProposals, {
      fields: [programmeContributionAdjudications.proposalId],
      references: [programmeContributionProposals.id],
    }),
    adjudicator: one(users, {
      fields: [programmeContributionAdjudications.adjudicatorUserId],
      references: [users.id],
    }),
  }),
)

export const programmeFreshnessStatesRelations = relations(programmeFreshnessStates, ({ one }) => ({
  programme: one(developmentProgrammes, {
    fields: [programmeFreshnessStates.programmeId],
    references: [developmentProgrammes.id],
  }),
  source: one(evidenceSources, {
    fields: [programmeFreshnessStates.sourceId],
    references: [evidenceSources.id],
  }),
}))

export const evidenceMonitorRunsRelations = relations(evidenceMonitorRuns, ({ one, many }) => ({
  source: one(evidenceSources, {
    fields: [evidenceMonitorRuns.sourceId],
    references: [evidenceSources.id],
  }),
  programme: one(developmentProgrammes, {
    fields: [evidenceMonitorRuns.programmeId],
    references: [developmentProgrammes.id],
  }),
  snapshot: one(sourceSnapshots, {
    fields: [evidenceMonitorRuns.snapshotId],
    references: [sourceSnapshots.id],
  }),
  reviewTasks: many(evidenceReviewTasks),
}))

export const evidenceReviewTasksRelations = relations(evidenceReviewTasks, ({ one }) => ({
  programme: one(developmentProgrammes, {
    fields: [evidenceReviewTasks.programmeId],
    references: [developmentProgrammes.id],
  }),
  source: one(evidenceSources, {
    fields: [evidenceReviewTasks.sourceId],
    references: [evidenceSources.id],
  }),
  triggerSnapshot: one(sourceSnapshots, {
    fields: [evidenceReviewTasks.triggerSnapshotId],
    references: [sourceSnapshots.id],
  }),
  monitorRun: one(evidenceMonitorRuns, {
    fields: [evidenceReviewTasks.monitorRunId],
    references: [evidenceMonitorRuns.id],
  }),
  assignedReviewer: one(users, {
    fields: [evidenceReviewTasks.assignedReviewerUserId],
    references: [users.id],
  }),
  sourceDelta: one(evidenceReviewTaskSourceDeltas, {
    fields: [evidenceReviewTasks.id],
    references: [evidenceReviewTaskSourceDeltas.reviewTaskId],
  }),
}))

export const evidenceReviewTaskSourceDeltasRelations = relations(
  evidenceReviewTaskSourceDeltas,
  ({ one }) => ({
    reviewTask: one(evidenceReviewTasks, {
      fields: [evidenceReviewTaskSourceDeltas.reviewTaskId],
      references: [evidenceReviewTasks.id],
    }),
    programme: one(developmentProgrammes, {
      fields: [evidenceReviewTaskSourceDeltas.programmeId],
      references: [developmentProgrammes.id],
    }),
    source: one(evidenceSources, {
      fields: [evidenceReviewTaskSourceDeltas.sourceId],
      references: [evidenceSources.id],
    }),
  }),
)

/* ---------------------------------------------------------------------------------------------- */
/* Agent review memory                                                                              */
/*                                                                                                  */
/* The documented compounding advantage — "every accept, reject and correction a reviewer makes"    */
/* — had no substrate. AgentInput carried no channel a decision could arrive through, ReviewCandidate*/
/* had no identity to record one against, and the 2,005 items the agents emit landed in JSON files  */
/* that no route reads and every rerun overwrites. A decision made on one was lost the moment the   */
/* reviewer closed the file.                                                                        */
/*                                                                                                  */
/* These three tables are that substrate. The line they must hold is narrow and absolute: a recorded*/
/* decision may change WHICH RECORDS REACH A HUMAN. It may never change a recorded value, resolve a */
/* source disagreement, or assert anything about a medicine.                                        */
/* ---------------------------------------------------------------------------------------------- */

export const agentRunStatusEnum = pgEnum('agent_run_status', ['COMPLETED', 'FAILED'])

/**
 * Four outcomes rather than two, because the third carries the most information and a binary
 * accept/reject destroys it.
 *
 * CORRECTION_NEEDED    the record is wrong and should be re-authored.
 * NOT_A_PROBLEM        the screen was wrong to raise this; it is not worth a person's time.
 * CONFIRMED_AS_RECORDED  "I read the excerpt. The value is extreme, and the source really prints it."
 *                      Lanthanum carbonate really does have 0.002% bioavailability. This is a label
 *                      saying "extreme and correct", which is exactly what an extremeness screen has
 *                      no other way to learn, and folding it into NOT_A_PROBLEM throws that away.
 * NEEDS_MORE_EVIDENCE  cannot be settled from what is recorded; needs a fresh artifact or a
 *                      specialist. Not a verdict either way.
 */
export const agentQueueDecisionEnum = pgEnum('agent_queue_decision', [
  'CORRECTION_NEEDED',
  'NOT_A_PROBLEM',
  'CONFIRMED_AS_RECORDED',
  'NEEDS_MORE_EVIDENCE',
])

export const agentRuns = pgTable(
  'agent_runs',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    agentName: varchar('agent_name', { length: 64 }).notNull(),
    agentVersion: varchar('agent_version', { length: 16 }).notNull(),
    /** Bumped only when the MEANING of the agent's reasons changes. See lib/agents/core/identity.ts. */
    reasonSchemaVersion: varchar('reason_schema_version', { length: 16 }).notNull(),
    corpusVersion: varchar('corpus_version', { length: 64 }).notNull(),
    inputDigest: varchar('input_digest', { length: 64 }).notNull(),
    outputDigest: varchar('output_digest', { length: 64 }).notNull(),
    /** Supplied to the agent rather than read from a clock, so a rerun reproduces the run exactly. */
    runDate: date('run_date').notNull(),
    seed: integer('seed').notNull(),
    recordsConsidered: integer('records_considered').notNull(),
    recordsUsed: integer('records_used').notNull(),
    candidatesEmitted: integer('candidates_emitted').notNull(),
    status: agentRunStatusEnum('status').notNull(),
    failureDetail: text('failure_detail'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('agent_runs_agent_idx').on(table.agentName, table.runDate),
    check(
      'agent_runs_digests',
      sql`${table.inputDigest} ~ '^[0-9a-f]{64}$' and ${table.outputDigest} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      'agent_runs_failure_detail',
      sql`${table.status} = 'COMPLETED' or nullif(btrim(${table.failureDetail}), '') is not null`,
    ),
  ],
)

export const agentReviewCandidates = pgTable(
  'agent_review_candidates',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    /** Stable while the QUESTION is the same. Never derived from prose, counts or a patch version. */
    candidateKey: varchar('candidate_key', { length: 64 }).notNull(),
    /** Changes when the value, a source, the parser or the corpus changes. */
    occurrenceKey: varchar('occurrence_key', { length: 64 }).notNull(),
    runId: varchar('run_id', { length: 64 })
      .notNull()
      .references(() => agentRuns.id, { onDelete: 'cascade' }),
    agentName: varchar('agent_name', { length: 64 }).notNull(),
    subjectType: varchar('subject_type', { length: 24 }).notNull(),
    subjectId: varchar('subject_id', { length: 160 }).notNull(),
    fieldPath: varchar('field_path', { length: 200 }).notNull(),
    reason: varchar('reason', { length: 48 }).notNull(),
    /** The agent's own ranking key. Its meaning is agent-specific and stated in `basis`. */
    priority: numeric('priority').notNull(),
    basis: text('basis').notNull(),
    /** Phrased as a question about the RECORD, never as a finding about the medicine. */
    question: text('question').notNull(),
    /** What the agent observed, kept so a reviewer sees the evidence rather than re-deriving it. */
    evidence: jsonb('evidence').$type<Record<string, unknown>>(),
    sourceIds: text('source_ids').array().notNull(),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('agent_review_candidates_occurrence_unique').on(table.occurrenceKey),
    index('agent_review_candidates_candidate_idx').on(table.candidateKey),
    index('agent_review_candidates_agent_idx').on(table.agentName, table.reason),
    index('agent_review_candidates_subject_idx').on(table.subjectType, table.subjectId),
    check(
      'agent_review_candidates_keys',
      sql`${table.candidateKey} ~ '^[0-9a-f]{64}$' and ${table.occurrenceKey} ~ '^[0-9a-f]{64}$'`,
    ),
  ],
)

export const agentQueueDecisions = pgTable(
  'agent_queue_decisions',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    candidateKey: varchar('candidate_key', { length: 64 }).notNull(),
    /** The exact observation judged. A later occurrence reopens rather than inheriting this. */
    occurrenceKey: varchar('occurrence_key', { length: 64 }).notNull(),
    decidedByUserId: varchar('decided_by_user_id', { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    decision: agentQueueDecisionEnum('decision').notNull(),
    /** Free prose is required on everything except NOT_A_PROBLEM, which needs no defence. */
    explanation: text('explanation'),
    /** Digest of the evidence the reviewer was actually shown, so the decision stays interpretable. */
    evidenceDigest: varchar('evidence_digest', { length: 64 }).notNull(),
    conflictsOfInterest: text('conflicts_of_interest'),
    decidedAt: timestamp('decided_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    /* One decision per reviewer per observation. A changed observation is a new row, never an edit. */
    uniqueIndex('agent_queue_decisions_reviewer_unique').on(
      table.occurrenceKey,
      table.decidedByUserId,
    ),
    index('agent_queue_decisions_candidate_idx').on(table.candidateKey, table.decidedAt),
    index('agent_queue_decisions_reviewer_idx').on(table.decidedByUserId),
    check(
      'agent_queue_decisions_keys',
      sql`${table.candidateKey} ~ '^[0-9a-f]{64}$' and ${table.occurrenceKey} ~ '^[0-9a-f]{64}$' and ${table.evidenceDigest} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      'agent_queue_decisions_explanation',
      sql`${table.decision} = 'NOT_A_PROBLEM' or nullif(btrim(${table.explanation}), '') is not null`,
    ),
  ],
)

/* ---------------------------------------------------------------------------------------------- */
/* Engine findings                                                                                  */
/*                                                                                                  */
/* The engine computed 149 rules' worth of blocks and warnings, handed them to a reviewer, and       */
/* persisted a 64-character hash. The WARNING list — the part where a human's agreement or           */
/* disagreement carries information — was destroyed at the end of the request, so per-rule precision */
/* was unmeasurable forever. This table is an audit record of checks. It is never the source of      */
/* truth for a medicine fact.                                                                        */
/* ---------------------------------------------------------------------------------------------- */

export const engineFindings = pgTable(
  'engine_findings',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    /** `background`, `evidence` or `molecular` — which of the three engines produced this. */
    engineFamily: varchar('engine_family', { length: 32 }).notNull(),
    engineVersion: varchar('engine_version', { length: 48 }).notNull(),
    inputDigest: varchar('input_digest', { length: 64 }).notNull(),
    subjectType: varchar('subject_type', { length: 24 }).notNull(),
    subjectId: varchar('subject_id', { length: 160 }).notNull(),
    /** The run this finding belongs to. Nullable only for rows written before runs existed. */
    runId: varchar('run_id', { length: 64 }),
    ruleCode: varchar('rule_code', { length: 64 }).notNull(),
    level: varchar('level', { length: 16 }).notNull(),
    fieldPath: varchar('field_path', { length: 200 }).notNull(),
    message: text('message').notNull(),
    /** Whether this finding blocked publication, warned, or only recorded a review impact. */
    publicationEffect: varchar('publication_effect', { length: 24 }).notNull(),
    corpusVersion: varchar('corpus_version', { length: 64 }).notNull(),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('engine_findings_run_idx').on(table.runId),
    index('engine_findings_rule_idx').on(table.ruleCode, table.recordedAt),
    index('engine_findings_subject_idx').on(table.subjectType, table.subjectId),
    index('engine_findings_engine_idx').on(table.engineFamily, table.engineVersion),
    check('engine_findings_input_digest', sql`${table.inputDigest} ~ '^[0-9a-f]{64}$'`),
  ],
)

/* ---------------------------------------------------------------------------------------------- */
/* Engine validation runs                                                                           */
/*                                                                                                  */
/* `engine_findings` records what a check FOUND. On its own that leaves the most common outcome     */
/* invisible: a record that passed with zero findings writes nothing, and is therefore              */
/* indistinguishable from a record nobody ever checked. Per-rule precision is not computable from   */
/* failures alone -- the denominator is the number of times a rule ran and stayed silent.           */
/*                                                                                                  */
/* So the run is the row, and findings hang off it. A passing run with zero findings is still a row.*/
/* ---------------------------------------------------------------------------------------------- */

export const engineRunStatusEnum = pgEnum('engine_run_status', ['PASSED', 'FAILED'])

export const engineValidationRuns = pgTable(
  'engine_validation_runs',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    subjectType: varchar('subject_type', { length: 24 }).notNull(),
    subjectId: varchar('subject_id', { length: 160 }).notNull(),
    /** `background` today. `evidence` and `molecular` reuse this table when they gain a live path. */
    engineFamily: varchar('engine_family', { length: 32 }).notNull(),
    engineVersion: varchar('engine_version', { length: 48 }).notNull(),
    inputDigestAlgorithm: varchar('input_digest_algorithm', { length: 16 })
      .notNull()
      .default('sha256'),
    inputDigest: varchar('input_digest', { length: 64 }).notNull(),
    /** Which generated corpus the validated input came from, so a run is traceable to a release. */
    corpusVersion: varchar('corpus_version', { length: 64 }).notNull(),
    status: engineRunStatusEnum('status').notNull(),
    passed: boolean('passed').notNull(),
    findingCount: integer('finding_count').notNull().default(0),
    /** The command that produced the run, e.g. `apply:background`. */
    operation: varchar('operation', { length: 64 }).notNull(),
    validatedAt: timestamp('validated_at', { withTimezone: true }).notNull().defaultNow(),
    /** Set only when the validated input was actually written onto the medicine row. */
    appliedAt: timestamp('applied_at', { withTimezone: true }),
  },
  (table) => [
    /*
     * The idempotency rule. Re-running the apply command over an unchanged corpus must not create a
     * second identical run, while a changed input or a new engine version must create a new one --
     * so history accumulates on real change and not on repetition.
     */
    uniqueIndex('engine_validation_runs_identity').on(
      table.subjectType,
      table.subjectId,
      table.engineFamily,
      table.engineVersion,
      table.inputDigest,
    ),
    index('engine_validation_runs_subject_idx').on(table.subjectType, table.subjectId),
    index('engine_validation_runs_status_idx').on(table.status, table.validatedAt),
    check(
      'engine_validation_runs_digest',
      sql`${table.inputDigestAlgorithm} = 'sha256' and ${table.inputDigest} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      'engine_validation_runs_status_agrees',
      sql`(${table.status} = 'PASSED') = ${table.passed}`,
    ),
    check(
      'engine_validation_runs_finding_count',
      sql`${table.findingCount} >= 0 and (${table.passed} or ${table.findingCount} > 0)`,
    ),
  ],
)
