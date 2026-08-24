CREATE TYPE "public"."claim_direction" AS ENUM('INCREASE', 'DECREASE', 'NO_CHANGE', 'MIXED', 'NOT_APPLICABLE', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."claim_nature" AS ENUM('MEASURED', 'SPONSOR_REPORTED', 'REGULATORY_FINDING', 'RNAWIKI_JUDGEMENT', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."claim_source_relationship" AS ENUM('SUPPORTS', 'CONTRADICTS', 'CONTEXT');--> statement-breakpoint
CREATE TYPE "public"."dependent_surface_type" AS ENUM('PROGRAMME_SUMMARY', 'PROGRAMME_STATUS', 'EVIDENCE_NODE', 'TIMELINE', 'VERDICT', 'SAFETY_LANGUAGE', 'SEARCH_DOCUMENT', 'BROWSE_CARD', 'HOMEPAGE_CARD', 'METADATA', 'STRUCTURED_DATA', 'API_OUTPUT');--> statement-breakpoint
CREATE TYPE "public"."evidence_node_claim_relationship" AS ENUM('SUPPORTS', 'CONTRADICTS', 'QUALIFIES');--> statement-breakpoint
CREATE TYPE "public"."evidence_node_type" AS ENUM('HUMAN_EXPOSURE', 'USEFUL_EXPOSURE', 'TARGET_ENGAGEMENT', 'BIOLOGICAL_RESPONSE', 'PATIENT_OUTCOME');--> statement-breakpoint
CREATE TYPE "public"."evidence_review_status" AS ENUM('DRAFT', 'MACHINE_CHECKED', 'AWAITING_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'SUPERSEDED');--> statement-breakpoint
CREATE TYPE "public"."evidence_review_task_status" AS ENUM('OPEN', 'IN_REVIEW', 'BLOCKED', 'RESOLVED', 'DISMISSED');--> statement-breakpoint
CREATE TYPE "public"."evidence_source_type" AS ENUM('CLINICAL_TRIAL_REGISTRY', 'REGULATORY_RECORD', 'REGULATORY_SAFETY_COMMUNICATION', 'PEER_REVIEWED_PUBLICATION', 'PUBLICATION_METADATA', 'SPONSOR_DISCLOSURE', 'MOLECULAR_DATABASE', 'OTHER', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."evidence_state" AS ENUM('CONFIRMED', 'CONTRADICTED', 'UNKNOWN', 'NOT_MEASURED', 'MIXED');--> statement-breakpoint
CREATE TYPE "public"."human_study_status" AS ENUM('YES', 'NO', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."monitor_run_status" AS ENUM('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'SOURCE_UNAVAILABLE', 'CANCELLED', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."programme_status" AS ENUM('PLANNED', 'RECRUITING', 'ACTIVE', 'COMPLETED', 'APPROVED', 'PAUSED', 'STOPPED', 'WITHDRAWN', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."programme_update_status" AS ENUM('NOT_ASSESSED', 'CURRENT', 'NEW_EVIDENCE', 'REVIEW_REQUIRED', 'REVIEW_IN_PROGRESS', 'OUTDATED', 'SOURCE_UNAVAILABLE', 'CHECK_FAILED');--> statement-breakpoint
CREATE TYPE "public"."review_impact_level" AS ENUM('LOW_RISK_EXACT_DATA', 'INTERPRETIVE_REVIEW_REQUIRED', 'POSSIBLE_VERDICT_IMPACT', 'SAFETY_CRITICAL_REVIEW');--> statement-breakpoint
CREATE TYPE "public"."source_check_status" AS ENUM('NOT_CHECKED', 'SUCCEEDED', 'FAILED', 'SOURCE_UNAVAILABLE', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."source_correction_status" AS ENUM('CURRENT', 'CORRECTED', 'RETRACTED', 'WITHDRAWN', 'EXPRESSION_OF_CONCERN', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."source_freshness_status" AS ENUM('NOT_ASSESSED', 'CURRENT', 'DUE', 'STALE', 'NEW_EVIDENCE', 'REVIEW_IN_PROGRESS', 'SOURCE_UNAVAILABLE', 'CHECK_FAILED', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."source_hierarchy" AS ENUM('PRIMARY', 'SECONDARY', 'TERTIARY', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."stopped_programme_verdict" AS ENUM('IDEA_FAILED', 'MOLECULE_FAILED', 'TEST_UNANSWERED');--> statement-breakpoint
CREATE TYPE "public"."stopping_reason_category" AS ENUM('EFFICACY', 'SAFETY', 'CANDIDATE_PHARMACOKINETICS', 'TISSUE_DELIVERY', 'SELECTIVITY_OR_OFF_TARGET', 'RECRUITMENT', 'FUNDING', 'BUSINESS_STRATEGY', 'ACQUISITION_OR_PORTFOLIO_REPRIORITISATION', 'DOSE_SELECTION', 'POPULATION_SELECTION', 'ENDPOINT_SELECTION', 'OPERATIONAL_EXECUTION', 'RESULTS_UNAVAILABLE', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."study_interpretability_criterion" AS ENUM('STATISTICAL_POWER', 'POPULATION_SELECTION', 'DOSE_EXPOSURE_ADEQUACY', 'ENDPOINT_VALIDITY', 'DURATION_OPERATIONAL_INTEGRITY');--> statement-breakpoint
CREATE TYPE "public"."study_interpretability_state" AS ENUM('YES', 'NO', 'UNCLEAR', 'NOT_REPORTED');--> statement-breakpoint
CREATE TYPE "public"."trial_enrolment_type" AS ENUM('ACTUAL', 'ESTIMATED', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."trial_status" AS ENUM('NOT_YET_RECRUITING', 'RECRUITING', 'ENROLLING_BY_INVITATION', 'ACTIVE_NOT_RECRUITING', 'COMPLETED', 'SUSPENDED', 'TERMINATED', 'WITHDRAWN', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."verdict_claim_relationship" AS ENUM('SUPPORTING', 'CONTRADICTORY');--> statement-breakpoint
CREATE TYPE "public"."verdict_confidence" AS ENUM('HIGH', 'MODERATE', 'LOW', 'VERY_LOW', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."verdict_review_decision" AS ENUM('APPROVE', 'CHANGES_REQUESTED', 'REJECT');--> statement-breakpoint
CREATE TABLE "claim_source_links" (
	"programme_id" varchar(64) NOT NULL,
	"claim_id" varchar(64) NOT NULL,
	"source_snapshot_id" varchar(64) NOT NULL,
	"relationship" "claim_source_relationship" NOT NULL,
	"source_locator" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "claim_source_links_pk" PRIMARY KEY("claim_id","source_snapshot_id","relationship")
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"claim_key" varchar(128) NOT NULL,
	"revision_number" integer NOT NULL,
	"previous_claim_id" varchar(64),
	"programme_trial_id" varchar(64),
	"evidence_node_type" "evidence_node_type",
	"nature" "claim_nature" DEFAULT 'UNKNOWN' NOT NULL,
	"review_status" "evidence_review_status" DEFAULT 'DRAFT' NOT NULL,
	"plain_language_text" text NOT NULL,
	"technical_text" text,
	"population" text,
	"intervention" text,
	"comparator" text,
	"dose" text,
	"route" varchar(160),
	"duration" varchar(160),
	"endpoint" text,
	"endpoint_hierarchy" varchar(160),
	"outcome_type" varchar(160),
	"numeric_value" numeric(30, 10),
	"numeric_unit" varchar(120),
	"uncertainty_interval" varchar(240),
	"direction" "claim_direction" DEFAULT 'UNKNOWN' NOT NULL,
	"timepoint" varchar(200),
	"reviewer_interpretation" text,
	"last_verified_at" timestamp with time zone,
	"author_user_id" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	"superseded_at" timestamp with time zone,
	CONSTRAINT "claims_id_programme_unique" UNIQUE("id","programme_id"),
	CONSTRAINT "claims_revision_positive" CHECK ("claims"."revision_number" > 0),
	CONSTRAINT "claims_previous_not_self" CHECK ("claims"."previous_claim_id" is null or "claims"."previous_claim_id" <> "claims"."id"),
	CONSTRAINT "claims_publication_dates" CHECK (("claims"."review_status" <> 'PUBLISHED' or "claims"."published_at" is not null)
        and ("claims"."review_status" <> 'SUPERSEDED' or "claims"."superseded_at" is not null))
);
--> statement-breakpoint
CREATE TABLE "development_programmes" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"drug_id" varchar(96) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" varchar(300) NOT NULL,
	"indication" text,
	"target_population" text,
	"jurisdiction" varchar(120),
	"sponsor" varchar(300),
	"partners" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "programme_status" DEFAULT 'UNKNOWN' NOT NULL,
	"highest_phase_reached" varchar(80),
	"route" varchar(160),
	"dose_exposure_context" text,
	"start_date" date,
	"end_date" date,
	"raw_stopping_reason" text,
	"stopping_reason_category" "stopping_reason_category" DEFAULT 'UNKNOWN' NOT NULL,
	"update_status" "programme_update_status" DEFAULT 'NOT_ASSESSED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "development_programmes_dates_order" CHECK ("development_programmes"."start_date" is null or "development_programmes"."end_date" is null or "development_programmes"."end_date" >= "development_programmes"."start_date")
);
--> statement-breakpoint
CREATE TABLE "evidence_monitor_runs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"adapter_key" varchar(120) NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"programme_id" varchar(64),
	"snapshot_id" varchar(64),
	"status" "monitor_run_status" DEFAULT 'QUEUED' NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"changed_field_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"next_retry_at" timestamp with time zone,
	"error_code" varchar(120),
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evidence_monitor_runs_attempts_valid" CHECK ("evidence_monitor_runs"."attempt_number" > 0 and "evidence_monitor_runs"."max_attempts" > 0 and "evidence_monitor_runs"."attempt_number" <= "evidence_monitor_runs"."max_attempts"),
	CONSTRAINT "evidence_monitor_runs_changes_nonnegative" CHECK ("evidence_monitor_runs"."changed_field_count" >= 0),
	CONSTRAINT "evidence_monitor_runs_finished_at" CHECK ("evidence_monitor_runs"."status" not in ('SUCCEEDED', 'FAILED', 'SOURCE_UNAVAILABLE', 'CANCELLED') or "evidence_monitor_runs"."finished_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "evidence_node_claims" (
	"programme_id" varchar(64) NOT NULL,
	"evidence_node_id" varchar(64) NOT NULL,
	"claim_id" varchar(64) NOT NULL,
	"relationship" "evidence_node_claim_relationship" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evidence_node_claims_pk" PRIMARY KEY("evidence_node_id","claim_id","relationship")
);
--> statement-breakpoint
CREATE TABLE "evidence_nodes" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"node_type" "evidence_node_type" NOT NULL,
	"revision_number" integer NOT NULL,
	"previous_evidence_node_id" varchar(64),
	"state" "evidence_state" DEFAULT 'UNKNOWN' NOT NULL,
	"review_status" "evidence_review_status" DEFAULT 'DRAFT' NOT NULL,
	"plain_summary" text,
	"professional_summary" text,
	"rationale" text,
	"last_verified_at" timestamp with time zone,
	"author_user_id" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	"superseded_at" timestamp with time zone,
	CONSTRAINT "evidence_nodes_id_programme_unique" UNIQUE("id","programme_id"),
	CONSTRAINT "evidence_nodes_revision_positive" CHECK ("evidence_nodes"."revision_number" > 0),
	CONSTRAINT "evidence_nodes_previous_not_self" CHECK ("evidence_nodes"."previous_evidence_node_id" is null or "evidence_nodes"."previous_evidence_node_id" <> "evidence_nodes"."id"),
	CONSTRAINT "evidence_nodes_publication_dates" CHECK (("evidence_nodes"."review_status" <> 'PUBLISHED' or "evidence_nodes"."published_at" is not null)
        and ("evidence_nodes"."review_status" <> 'SUPERSEDED' or "evidence_nodes"."superseded_at" is not null))
);
--> statement-breakpoint
CREATE TABLE "evidence_review_tasks" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"trigger_snapshot_id" varchar(64) NOT NULL,
	"monitor_run_id" varchar(64),
	"impact_level" "review_impact_level" NOT NULL,
	"status" "evidence_review_task_status" DEFAULT 'OPEN' NOT NULL,
	"reason" text NOT NULL,
	"affected_claim_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"affected_surface_paths" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"assigned_reviewer_user_id" varchar(64),
	"resolution_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "evidence_review_tasks_resolution_date" CHECK ("evidence_review_tasks"."status" not in ('RESOLVED', 'DISMISSED') or "evidence_review_tasks"."resolved_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "evidence_sources" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"source_type" "evidence_source_type" DEFAULT 'UNKNOWN' NOT NULL,
	"external_identifier" varchar(400),
	"canonical_locator" text NOT NULL,
	"title" text,
	"publisher" varchar(300),
	"sponsor" varchar(300),
	"publication_date" date,
	"correction_status" "source_correction_status" DEFAULT 'UNKNOWN' NOT NULL,
	"jurisdiction" varchar(120),
	"hierarchy" "source_hierarchy" DEFAULT 'UNKNOWN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programme_current_publications" (
	"programme_id" varchar(64) PRIMARY KEY NOT NULL,
	"verdict_revision_id" varchar(64) NOT NULL,
	"published_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programme_dependencies" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"claim_id" varchar(64) NOT NULL,
	"dependent_surface_type" "dependent_surface_type" NOT NULL,
	"evidence_node_id" varchar(64),
	"verdict_revision_id" varchar(64),
	"field_path" varchar(240) NOT NULL,
	"impact_level" "review_impact_level" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_dependencies_target_shape" CHECK ((
          "programme_dependencies"."dependent_surface_type" = 'EVIDENCE_NODE'
          and "programme_dependencies"."evidence_node_id" is not null
          and "programme_dependencies"."verdict_revision_id" is null
        ) or (
          "programme_dependencies"."dependent_surface_type" = 'VERDICT'
          and "programme_dependencies"."verdict_revision_id" is not null
          and "programme_dependencies"."evidence_node_id" is null
        ) or (
          "programme_dependencies"."dependent_surface_type" not in ('EVIDENCE_NODE', 'VERDICT')
          and "programme_dependencies"."evidence_node_id" is null
          and "programme_dependencies"."verdict_revision_id" is null
        ))
);
--> statement-breakpoint
CREATE TABLE "programme_freshness_states" (
	"programme_id" varchar(64) NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"current_snapshot_id" varchar(64),
	"pending_snapshot_id" varchar(64),
	"check_status" "source_check_status" DEFAULT 'NOT_CHECKED' NOT NULL,
	"freshness_status" "source_freshness_status" DEFAULT 'NOT_ASSESSED' NOT NULL,
	"last_check_attempt_at" timestamp with time zone,
	"last_successful_check_at" timestamp with time zone,
	"last_verified_at" timestamp with time zone,
	"next_check_due_at" timestamp with time zone,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"last_error_code" varchar(120),
	"last_error_message" text,
	"new_evidence_detected_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_freshness_states_pk" PRIMARY KEY("programme_id","source_id"),
	CONSTRAINT "programme_freshness_failures_nonnegative" CHECK ("programme_freshness_states"."consecutive_failures" >= 0),
	CONSTRAINT "programme_freshness_distinct_snapshots" CHECK ("programme_freshness_states"."pending_snapshot_id" is null or "programme_freshness_states"."pending_snapshot_id" <> "programme_freshness_states"."current_snapshot_id")
);
--> statement-breakpoint
CREATE TABLE "programme_trials" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"trial_identifier" varchar(160) NOT NULL,
	"title" text,
	"phase" varchar(80),
	"status" "trial_status" DEFAULT 'UNKNOWN' NOT NULL,
	"enrolment" integer,
	"enrolment_type" "trial_enrolment_type" DEFAULT 'UNKNOWN' NOT NULL,
	"start_date" date,
	"primary_completion_date" date,
	"completion_date" date,
	"human_study_status" "human_study_status" DEFAULT 'UNKNOWN' NOT NULL,
	"registry_source_id" varchar(64),
	"registry_snapshot_id" varchar(64),
	"last_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_trials_id_programme_unique" UNIQUE("id","programme_id"),
	CONSTRAINT "programme_trials_enrolment_nonnegative" CHECK ("programme_trials"."enrolment" is null or "programme_trials"."enrolment" >= 0),
	CONSTRAINT "programme_trials_dates_order" CHECK ("programme_trials"."start_date" is null or "programme_trials"."completion_date" is null or "programme_trials"."completion_date" >= "programme_trials"."start_date"),
	CONSTRAINT "programme_trials_snapshot_has_source" CHECK ("programme_trials"."registry_snapshot_id" is null or "programme_trials"."registry_source_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "programme_verdict_claims" (
	"programme_id" varchar(64) NOT NULL,
	"verdict_revision_id" varchar(64) NOT NULL,
	"claim_id" varchar(64) NOT NULL,
	"relationship" "verdict_claim_relationship" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_claims_pk" PRIMARY KEY("verdict_revision_id","claim_id","relationship")
);
--> statement-breakpoint
CREATE TABLE "programme_verdict_reviews" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"verdict_revision_id" varchar(64) NOT NULL,
	"reviewer_user_id" varchar(64),
	"reviewer_name" varchar(160) NOT NULL,
	"decision" "verdict_review_decision" NOT NULL,
	"is_independent" boolean DEFAULT false NOT NULL,
	"conflicts_of_interest" text,
	"review_note" text,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programme_verdict_revisions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"revision_number" integer NOT NULL,
	"previous_verdict_revision_id" varchar(64),
	"review_status" "evidence_review_status" DEFAULT 'DRAFT' NOT NULL,
	"programme_status_at_review" "programme_status" NOT NULL,
	"verdict_code" "stopped_programme_verdict",
	"public_label" text NOT NULL,
	"professional_label" text NOT NULL,
	"indication_scope" text NOT NULL,
	"population_scope" text NOT NULL,
	"dose_exposure_scope" text NOT NULL,
	"period_scope" text NOT NULL,
	"trial_scope" text NOT NULL,
	"outcome_scope" text NOT NULL,
	"plain_mechanism" text,
	"best_supported_finding" text,
	"main_limitation" text,
	"one_sentence_reason" text NOT NULL,
	"what_was_disproven" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"what_was_not_disproven" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"what_remains_unknown" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confidence" "verdict_confidence" DEFAULT 'UNKNOWN' NOT NULL,
	"confidence_explanation" text,
	"conditions_that_would_change_verdict" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"author_user_id" varchar(64),
	"author_name" varchar(160) NOT NULL,
	"conflicts_of_interest" text,
	"engine_version" varchar(64),
	"input_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"input_digest" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"superseded_at" timestamp with time zone,
	CONSTRAINT "programme_verdicts_id_programme_unique" UNIQUE("id","programme_id"),
	CONSTRAINT "programme_verdicts_revision_positive" CHECK ("programme_verdict_revisions"."revision_number" > 0),
	CONSTRAINT "programme_verdicts_previous_not_self" CHECK ("programme_verdict_revisions"."previous_verdict_revision_id" is null or "programme_verdict_revisions"."previous_verdict_revision_id" <> "programme_verdict_revisions"."id"),
	CONSTRAINT "programme_verdicts_stopped_scope" CHECK ("programme_verdict_revisions"."verdict_code" is null or "programme_verdict_revisions"."programme_status_at_review" in ('STOPPED', 'WITHDRAWN')),
	CONSTRAINT "programme_verdicts_publication_dates" CHECK (("programme_verdict_revisions"."review_status" <> 'PUBLISHED' or ("programme_verdict_revisions"."reviewed_at" is not null and "programme_verdict_revisions"."published_at" is not null))
        and ("programme_verdict_revisions"."review_status" <> 'SUPERSEDED' or "programme_verdict_revisions"."superseded_at" is not null)),
	CONSTRAINT "programme_verdicts_published_summary" CHECK ("programme_verdict_revisions"."review_status" <> 'PUBLISHED' or (
        nullif(btrim("programme_verdict_revisions"."plain_mechanism"), '') is not null
        and nullif(btrim("programme_verdict_revisions"."best_supported_finding"), '') is not null
        and nullif(btrim("programme_verdict_revisions"."main_limitation"), '') is not null
      )),
	CONSTRAINT "programme_verdicts_published_engine_provenance" CHECK ("programme_verdict_revisions"."review_status" <> 'PUBLISHED' or (
        nullif(btrim("programme_verdict_revisions"."engine_version"), '') is not null
        and "programme_verdict_revisions"."input_digest" ~ '^[0-9a-f]{64}$'
      )),
	CONSTRAINT "programme_verdicts_digest_algorithm" CHECK ("programme_verdict_revisions"."input_digest_algorithm" = 'sha256')
);
--> statement-breakpoint
CREATE TABLE "source_snapshots" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"previous_snapshot_id" varchar(64),
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_published_at" timestamp with time zone,
	"last_verified_at" timestamp with time zone,
	"hash_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"metadata_hash" varchar(64),
	"structured_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"permitted_excerpt" text,
	"raw_snapshot_locator" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_snapshots_id_source_unique" UNIQUE("id","source_id"),
	CONSTRAINT "source_snapshots_hash_algorithm" CHECK ("source_snapshots"."hash_algorithm" = 'sha256'),
	CONSTRAINT "source_snapshots_content_hash_format" CHECK ("source_snapshots"."content_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "source_snapshots_metadata_hash_format" CHECK ("source_snapshots"."metadata_hash" is null or "source_snapshots"."metadata_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "source_snapshots_previous_not_self" CHECK ("source_snapshots"."previous_snapshot_id" is null or "source_snapshots"."previous_snapshot_id" <> "source_snapshots"."id")
);
--> statement-breakpoint
CREATE TABLE "trial_interpretability_assessments" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"programme_trial_id" varchar(64) NOT NULL,
	"criterion" "study_interpretability_criterion" NOT NULL,
	"state" "study_interpretability_state" DEFAULT 'NOT_REPORTED' NOT NULL,
	"revision_number" integer NOT NULL,
	"previous_assessment_id" varchar(64),
	"review_status" "evidence_review_status" DEFAULT 'DRAFT' NOT NULL,
	"explanation" text,
	"last_verified_at" timestamp with time zone,
	"author_user_id" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	"superseded_at" timestamp with time zone,
	CONSTRAINT "trial_interpretability_id_programme_unique" UNIQUE("id","programme_id"),
	CONSTRAINT "trial_interpretability_revision_positive" CHECK ("trial_interpretability_assessments"."revision_number" > 0),
	CONSTRAINT "trial_interpretability_previous_not_self" CHECK ("trial_interpretability_assessments"."previous_assessment_id" is null or "trial_interpretability_assessments"."previous_assessment_id" <> "trial_interpretability_assessments"."id"),
	CONSTRAINT "trial_interpretability_publication_dates" CHECK (("trial_interpretability_assessments"."review_status" <> 'PUBLISHED' or "trial_interpretability_assessments"."published_at" is not null)
        and ("trial_interpretability_assessments"."review_status" <> 'SUPERSEDED' or "trial_interpretability_assessments"."superseded_at" is not null))
);
--> statement-breakpoint
CREATE TABLE "trial_interpretability_claims" (
	"programme_id" varchar(64) NOT NULL,
	"assessment_id" varchar(64) NOT NULL,
	"claim_id" varchar(64) NOT NULL,
	"relationship" "evidence_node_claim_relationship" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trial_interpretability_claims_pk" PRIMARY KEY("assessment_id","claim_id","relationship")
);
--> statement-breakpoint
ALTER TABLE "claim_source_links" ADD CONSTRAINT "claim_source_links_source_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("source_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_source_links" ADD CONSTRAINT "claim_source_links_claim_programme_fk" FOREIGN KEY ("claim_id","programme_id") REFERENCES "public"."claims"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_programme_id_development_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."development_programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_previous_same_programme_fk" FOREIGN KEY ("previous_claim_id","programme_id") REFERENCES "public"."claims"("id","programme_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_trial_same_programme_fk" FOREIGN KEY ("programme_trial_id","programme_id") REFERENCES "public"."programme_trials"("id","programme_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "development_programmes" ADD CONSTRAINT "development_programmes_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_monitor_runs" ADD CONSTRAINT "evidence_monitor_runs_source_id_evidence_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_monitor_runs" ADD CONSTRAINT "evidence_monitor_runs_programme_id_development_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."development_programmes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_monitor_runs" ADD CONSTRAINT "evidence_monitor_runs_snapshot_source_fk" FOREIGN KEY ("snapshot_id","source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_node_claims" ADD CONSTRAINT "evidence_node_claims_node_programme_fk" FOREIGN KEY ("evidence_node_id","programme_id") REFERENCES "public"."evidence_nodes"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_node_claims" ADD CONSTRAINT "evidence_node_claims_claim_programme_fk" FOREIGN KEY ("claim_id","programme_id") REFERENCES "public"."claims"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_nodes" ADD CONSTRAINT "evidence_nodes_programme_id_development_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."development_programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_nodes" ADD CONSTRAINT "evidence_nodes_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_nodes" ADD CONSTRAINT "evidence_nodes_previous_same_programme_fk" FOREIGN KEY ("previous_evidence_node_id","programme_id") REFERENCES "public"."evidence_nodes"("id","programme_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD CONSTRAINT "evidence_review_tasks_programme_id_development_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."development_programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD CONSTRAINT "evidence_review_tasks_source_id_evidence_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD CONSTRAINT "evidence_review_tasks_monitor_run_id_evidence_monitor_runs_id_fk" FOREIGN KEY ("monitor_run_id") REFERENCES "public"."evidence_monitor_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD CONSTRAINT "evidence_review_tasks_assigned_reviewer_user_id_users_id_fk" FOREIGN KEY ("assigned_reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD CONSTRAINT "evidence_review_tasks_snapshot_source_fk" FOREIGN KEY ("trigger_snapshot_id","source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_current_publications" ADD CONSTRAINT "programme_current_publications_programme_id_development_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."development_programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_current_publications" ADD CONSTRAINT "programme_current_publications_same_programme_fk" FOREIGN KEY ("verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_dependencies" ADD CONSTRAINT "programme_dependencies_programme_id_development_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."development_programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_dependencies" ADD CONSTRAINT "programme_dependencies_claim_programme_fk" FOREIGN KEY ("claim_id","programme_id") REFERENCES "public"."claims"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_dependencies" ADD CONSTRAINT "programme_dependencies_node_programme_fk" FOREIGN KEY ("evidence_node_id","programme_id") REFERENCES "public"."evidence_nodes"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_dependencies" ADD CONSTRAINT "programme_dependencies_verdict_programme_fk" FOREIGN KEY ("verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_freshness_states" ADD CONSTRAINT "programme_freshness_states_programme_id_development_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."development_programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_freshness_states" ADD CONSTRAINT "programme_freshness_states_source_id_evidence_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_freshness_states" ADD CONSTRAINT "programme_freshness_current_snapshot_source_fk" FOREIGN KEY ("current_snapshot_id","source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_freshness_states" ADD CONSTRAINT "programme_freshness_pending_snapshot_source_fk" FOREIGN KEY ("pending_snapshot_id","source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_trials" ADD CONSTRAINT "programme_trials_programme_id_development_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."development_programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_trials" ADD CONSTRAINT "programme_trials_registry_source_id_evidence_sources_id_fk" FOREIGN KEY ("registry_source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_trials" ADD CONSTRAINT "programme_trials_snapshot_source_fk" FOREIGN KEY ("registry_snapshot_id","registry_source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_claims" ADD CONSTRAINT "programme_verdict_claims_verdict_programme_fk" FOREIGN KEY ("verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_claims" ADD CONSTRAINT "programme_verdict_claims_claim_programme_fk" FOREIGN KEY ("claim_id","programme_id") REFERENCES "public"."claims"("id","programme_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD CONSTRAINT "programme_verdict_reviews_verdict_revision_id_programme_verdict_revisions_id_fk" FOREIGN KEY ("verdict_revision_id") REFERENCES "public"."programme_verdict_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD CONSTRAINT "programme_verdict_reviews_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD CONSTRAINT "programme_verdict_revisions_programme_id_development_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."development_programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD CONSTRAINT "programme_verdict_revisions_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD CONSTRAINT "programme_verdicts_previous_same_programme_fk" FOREIGN KEY ("previous_verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_snapshots" ADD CONSTRAINT "source_snapshots_source_id_evidence_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_snapshots" ADD CONSTRAINT "source_snapshots_previous_same_source_fk" FOREIGN KEY ("previous_snapshot_id","source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trial_interpretability_assessments" ADD CONSTRAINT "trial_interpretability_assessments_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trial_interpretability_assessments" ADD CONSTRAINT "trial_interpretability_trial_programme_fk" FOREIGN KEY ("programme_trial_id","programme_id") REFERENCES "public"."programme_trials"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trial_interpretability_assessments" ADD CONSTRAINT "trial_interpretability_previous_programme_fk" FOREIGN KEY ("previous_assessment_id","programme_id") REFERENCES "public"."trial_interpretability_assessments"("id","programme_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trial_interpretability_claims" ADD CONSTRAINT "trial_interpretability_claims_assessment_programme_fk" FOREIGN KEY ("assessment_id","programme_id") REFERENCES "public"."trial_interpretability_assessments"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trial_interpretability_claims" ADD CONSTRAINT "trial_interpretability_claims_claim_programme_fk" FOREIGN KEY ("claim_id","programme_id") REFERENCES "public"."claims"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "claim_source_links_snapshot_idx" ON "claim_source_links" USING btree ("source_snapshot_id");--> statement-breakpoint
CREATE INDEX "claim_source_links_programme_idx" ON "claim_source_links" USING btree ("programme_id");--> statement-breakpoint
CREATE UNIQUE INDEX "claims_programme_key_revision_unique" ON "claims" USING btree ("programme_id","claim_key","revision_number");--> statement-breakpoint
CREATE UNIQUE INDEX "claims_one_published_per_key" ON "claims" USING btree ("programme_id","claim_key") WHERE "claims"."review_status" = 'PUBLISHED';--> statement-breakpoint
CREATE INDEX "claims_programme_status_idx" ON "claims" USING btree ("programme_id","review_status");--> statement-breakpoint
CREATE INDEX "claims_trial_idx" ON "claims" USING btree ("programme_trial_id");--> statement-breakpoint
CREATE INDEX "claims_previous_idx" ON "claims" USING btree ("previous_claim_id");--> statement-breakpoint
CREATE UNIQUE INDEX "development_programmes_drug_slug_unique" ON "development_programmes" USING btree ("drug_id","slug");--> statement-breakpoint
CREATE INDEX "development_programmes_drug_status_idx" ON "development_programmes" USING btree ("drug_id","status");--> statement-breakpoint
CREATE INDEX "development_programmes_update_idx" ON "development_programmes" USING btree ("update_status","updated_at");--> statement-breakpoint
CREATE INDEX "evidence_monitor_runs_status_retry_idx" ON "evidence_monitor_runs" USING btree ("status","next_retry_at");--> statement-breakpoint
CREATE INDEX "evidence_monitor_runs_source_created_idx" ON "evidence_monitor_runs" USING btree ("source_id","created_at");--> statement-breakpoint
CREATE INDEX "evidence_monitor_runs_programme_created_idx" ON "evidence_monitor_runs" USING btree ("programme_id","created_at");--> statement-breakpoint
CREATE INDEX "evidence_node_claims_claim_idx" ON "evidence_node_claims" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "evidence_node_claims_programme_idx" ON "evidence_node_claims" USING btree ("programme_id");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_nodes_programme_type_revision_unique" ON "evidence_nodes" USING btree ("programme_id","node_type","revision_number");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_nodes_one_published_per_type" ON "evidence_nodes" USING btree ("programme_id","node_type") WHERE "evidence_nodes"."review_status" = 'PUBLISHED';--> statement-breakpoint
CREATE INDEX "evidence_nodes_programme_status_idx" ON "evidence_nodes" USING btree ("programme_id","review_status");--> statement-breakpoint
CREATE INDEX "evidence_nodes_previous_idx" ON "evidence_nodes" USING btree ("previous_evidence_node_id");--> statement-breakpoint
CREATE INDEX "evidence_review_tasks_status_impact_idx" ON "evidence_review_tasks" USING btree ("status","impact_level","created_at");--> statement-breakpoint
CREATE INDEX "evidence_review_tasks_programme_idx" ON "evidence_review_tasks" USING btree ("programme_id","created_at");--> statement-breakpoint
CREATE INDEX "evidence_review_tasks_snapshot_idx" ON "evidence_review_tasks" USING btree ("trigger_snapshot_id");--> statement-breakpoint
CREATE INDEX "evidence_review_tasks_assignee_idx" ON "evidence_review_tasks" USING btree ("assigned_reviewer_user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_sources_identifier_unique" ON "evidence_sources" USING btree ("source_type","external_identifier") WHERE "evidence_sources"."external_identifier" is not null;--> statement-breakpoint
CREATE INDEX "evidence_sources_type_idx" ON "evidence_sources" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "evidence_sources_correction_idx" ON "evidence_sources" USING btree ("correction_status");--> statement-breakpoint
CREATE UNIQUE INDEX "programme_current_publications_verdict_unique" ON "programme_current_publications" USING btree ("verdict_revision_id");--> statement-breakpoint
CREATE INDEX "programme_dependencies_claim_idx" ON "programme_dependencies" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "programme_dependencies_programme_surface_idx" ON "programme_dependencies" USING btree ("programme_id","dependent_surface_type");--> statement-breakpoint
CREATE INDEX "programme_dependencies_node_idx" ON "programme_dependencies" USING btree ("evidence_node_id");--> statement-breakpoint
CREATE INDEX "programme_dependencies_verdict_idx" ON "programme_dependencies" USING btree ("verdict_revision_id");--> statement-breakpoint
CREATE INDEX "programme_freshness_status_idx" ON "programme_freshness_states" USING btree ("freshness_status","next_check_due_at");--> statement-breakpoint
CREATE INDEX "programme_freshness_source_idx" ON "programme_freshness_states" USING btree ("source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "programme_trials_identifier_unique" ON "programme_trials" USING btree ("programme_id","trial_identifier");--> statement-breakpoint
CREATE INDEX "programme_trials_programme_status_idx" ON "programme_trials" USING btree ("programme_id","status");--> statement-breakpoint
CREATE INDEX "programme_trials_registry_source_idx" ON "programme_trials" USING btree ("registry_source_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_claims_claim_idx" ON "programme_verdict_claims" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_claims_programme_idx" ON "programme_verdict_claims" USING btree ("programme_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_reviews_revision_idx" ON "programme_verdict_reviews" USING btree ("verdict_revision_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "programme_verdict_reviews_reviewer_idx" ON "programme_verdict_reviews" USING btree ("reviewer_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "programme_verdicts_programme_revision_unique" ON "programme_verdict_revisions" USING btree ("programme_id","revision_number");--> statement-breakpoint
CREATE UNIQUE INDEX "programme_verdicts_one_published" ON "programme_verdict_revisions" USING btree ("programme_id") WHERE "programme_verdict_revisions"."review_status" = 'PUBLISHED';--> statement-breakpoint
CREATE INDEX "programme_verdicts_programme_created_idx" ON "programme_verdict_revisions" USING btree ("programme_id","created_at");--> statement-breakpoint
CREATE INDEX "programme_verdicts_review_status_idx" ON "programme_verdict_revisions" USING btree ("review_status","created_at");--> statement-breakpoint
CREATE INDEX "programme_verdicts_previous_idx" ON "programme_verdict_revisions" USING btree ("previous_verdict_revision_id");--> statement-breakpoint
CREATE UNIQUE INDEX "source_snapshots_source_hash_unique" ON "source_snapshots" USING btree ("source_id","content_hash");--> statement-breakpoint
CREATE INDEX "source_snapshots_source_retrieved_idx" ON "source_snapshots" USING btree ("source_id","retrieved_at");--> statement-breakpoint
CREATE INDEX "source_snapshots_previous_idx" ON "source_snapshots" USING btree ("previous_snapshot_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trial_interpretability_trial_criterion_revision_unique" ON "trial_interpretability_assessments" USING btree ("programme_trial_id","criterion","revision_number");--> statement-breakpoint
CREATE UNIQUE INDEX "trial_interpretability_one_published" ON "trial_interpretability_assessments" USING btree ("programme_trial_id","criterion") WHERE "trial_interpretability_assessments"."review_status" = 'PUBLISHED';--> statement-breakpoint
CREATE INDEX "trial_interpretability_programme_status_idx" ON "trial_interpretability_assessments" USING btree ("programme_id","review_status");--> statement-breakpoint
CREATE INDEX "trial_interpretability_previous_idx" ON "trial_interpretability_assessments" USING btree ("previous_assessment_id");--> statement-breakpoint
CREATE INDEX "trial_interpretability_claims_claim_idx" ON "trial_interpretability_claims" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "trial_interpretability_claims_programme_idx" ON "trial_interpretability_claims" USING btree ("programme_id");
--> statement-breakpoint
CREATE FUNCTION "rnawiki_reject_source_snapshot_mutation"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	RAISE EXCEPTION 'source_snapshots are immutable; create a new snapshot linked by previous_snapshot_id'
		USING ERRCODE = '55000';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "source_snapshots_immutable"
BEFORE UPDATE OR DELETE ON "source_snapshots"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_reject_source_snapshot_mutation"();
--> statement-breakpoint
CREATE FUNCTION "rnawiki_validate_current_programme_publication"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	verdict_status "evidence_review_status";
	verdict_programme_status "programme_status";
	current_programme_status "programme_status";
	verdict_published_at timestamp with time zone;
	summary_path text;
BEGIN
	SELECT "review_status", "programme_status_at_review", "published_at"
	INTO verdict_status, verdict_programme_status, verdict_published_at
	FROM "programme_verdict_revisions"
	WHERE "id" = NEW."verdict_revision_id" AND "programme_id" = NEW."programme_id";

	IF NOT FOUND THEN
		RAISE EXCEPTION 'current publication must reference a verdict revision from the same programme'
			USING ERRCODE = '23503';
	END IF;

	SELECT "status" INTO current_programme_status
	FROM "development_programmes"
	WHERE "id" = NEW."programme_id";

	IF verdict_status <> 'PUBLISHED' THEN
		RAISE EXCEPTION 'current publication must reference a PUBLISHED verdict revision'
			USING ERRCODE = '23514';
	END IF;

	IF verdict_published_at IS DISTINCT FROM NEW."published_at" THEN
		RAISE EXCEPTION 'current publication timestamp must match the verdict revision timestamp'
			USING ERRCODE = '23514';
	END IF;

	IF verdict_programme_status IS DISTINCT FROM current_programme_status THEN
		RAISE EXCEPTION 'published verdict programme status must match the current programme status'
			USING ERRCODE = '23514';
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM "programme_verdict_claims"
		WHERE "verdict_revision_id" = NEW."verdict_revision_id" AND "relationship" = 'SUPPORTING'
	) THEN
		RAISE EXCEPTION 'a published programme verdict requires at least one supporting claim'
			USING ERRCODE = '23514';
	END IF;

	IF (
		WITH latest_reviews AS (
			SELECT review.*,
				row_number() OVER (
					PARTITION BY coalesce(
						'user:' || review."reviewer_user_id",
						'name:' || lower(btrim(review."reviewer_name"))
					)
					ORDER BY review."reviewed_at" DESC, review."id" DESC
				) AS reviewer_rank
			FROM "programme_verdict_reviews" review
			WHERE review."verdict_revision_id" = NEW."verdict_revision_id"
		)
		SELECT count(*) FROM latest_reviews
		WHERE reviewer_rank = 1 AND "decision" = 'APPROVE' AND "is_independent" = true
	) < 2 THEN
		RAISE EXCEPTION 'a published programme verdict requires two distinct independent approving reviewers'
			USING ERRCODE = '23514';
	END IF;

	IF EXISTS (
		WITH latest_reviews AS (
			SELECT review.*,
				row_number() OVER (
					PARTITION BY coalesce(
						'user:' || review."reviewer_user_id",
						'name:' || lower(btrim(review."reviewer_name"))
					)
					ORDER BY review."reviewed_at" DESC, review."id" DESC
				) AS reviewer_rank
			FROM "programme_verdict_reviews" review
			WHERE review."verdict_revision_id" = NEW."verdict_revision_id"
		)
		SELECT 1 FROM latest_reviews
		WHERE reviewer_rank = 1 AND "decision" IN ('REJECT', 'CHANGES_REQUESTED')
	) THEN
		RAISE EXCEPTION 'a programme verdict cannot publish with an unresolved rejection or change request'
			USING ERRCODE = '23514';
	END IF;

	FOREACH summary_path IN ARRAY ARRAY[
		'summary.plainMechanism',
		'summary.bestSupportedFinding',
		'summary.mainLimitation'
	] LOOP
		IF NOT EXISTS (
			SELECT 1
			FROM "programme_dependencies" dependency
			INNER JOIN "claims" claim ON claim."id" = dependency."claim_id"
			WHERE dependency."programme_id" = NEW."programme_id"
				AND dependency."dependent_surface_type" = 'PROGRAMME_SUMMARY'
				AND dependency."field_path" = summary_path
				AND claim."review_status" = 'PUBLISHED'
		) THEN
			RAISE EXCEPTION 'published programme summary field % requires a published supporting claim dependency', summary_path
				USING ERRCODE = '23514';
		END IF;
	END LOOP;

	RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "programme_current_publications_validate"
BEFORE INSERT OR UPDATE ON "programme_current_publications"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_validate_current_programme_publication"();
--> statement-breakpoint
CREATE FUNCTION "rnawiki_enforce_programme_publication_pointer"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	row_id varchar(64);
	row_programme_id varchar(64);
	row_status "evidence_review_status";
	row_programme_status "programme_status";
	actual_programme_status "programme_status";
BEGIN
	IF TG_OP = 'DELETE' THEN
		row_id := OLD."id";
		row_programme_id := OLD."programme_id";
		row_status := OLD."review_status";
		row_programme_status := OLD."programme_status_at_review";
	ELSE
		row_id := NEW."id";
		row_programme_id := NEW."programme_id";
		row_status := NEW."review_status";
		row_programme_status := NEW."programme_status_at_review";
	END IF;

	SELECT "status" INTO actual_programme_status
	FROM "development_programmes"
	WHERE "id" = row_programme_id;

	-- Deleting a programme deliberately cascades its complete evidence lineage.
	IF NOT FOUND THEN
		IF TG_OP = 'DELETE' THEN
			RETURN OLD;
		END IF;
		RETURN NEW;
	END IF;

	IF row_status = 'PUBLISHED' AND NOT EXISTS (
		SELECT 1 FROM "programme_current_publications"
		WHERE "programme_id" = row_programme_id AND "verdict_revision_id" = row_id
	) THEN
		RAISE EXCEPTION 'a PUBLISHED verdict revision must be the programme current publication'
			USING ERRCODE = '23514';
	END IF;

	IF row_status <> 'PUBLISHED' AND EXISTS (
		SELECT 1 FROM "programme_current_publications"
		WHERE "programme_id" = row_programme_id AND "verdict_revision_id" = row_id
	) THEN
		RAISE EXCEPTION 'a current publication cannot reference a non-PUBLISHED verdict revision'
			USING ERRCODE = '23514';
	END IF;

	IF row_status = 'PUBLISHED' AND row_programme_status IS DISTINCT FROM actual_programme_status THEN
		RAISE EXCEPTION 'a PUBLISHED verdict revision must match the current programme status'
			USING ERRCODE = '23514';
	END IF;

	IF TG_OP = 'DELETE' THEN
		RETURN OLD;
	END IF;
	RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "programme_verdict_publication_pointer_guard"
AFTER INSERT OR UPDATE OR DELETE ON "programme_verdict_revisions"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "rnawiki_enforce_programme_publication_pointer"();
--> statement-breakpoint
CREATE FUNCTION "rnawiki_guard_current_publication_removal"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM "programme_verdict_revisions"
		WHERE "id" = OLD."verdict_revision_id" AND "review_status" = 'PUBLISHED'
	) AND NOT EXISTS (
		SELECT 1 FROM "programme_current_publications"
		WHERE "verdict_revision_id" = OLD."verdict_revision_id"
	) THEN
		RAISE EXCEPTION 'cannot remove the pointer while its verdict revision remains PUBLISHED'
			USING ERRCODE = '23514';
	END IF;

	RETURN OLD;
END;
$$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "programme_current_publication_removal_guard"
AFTER DELETE ON "programme_current_publications"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_current_publication_removal"();
--> statement-breakpoint
CREATE FUNCTION "rnawiki_guard_published_programme_status"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "programme_current_publications" publication
		INNER JOIN "programme_verdict_revisions" verdict
			ON verdict."id" = publication."verdict_revision_id"
		WHERE publication."programme_id" = NEW."id"
			AND verdict."programme_status_at_review" IS DISTINCT FROM NEW."status"
	) THEN
		RAISE EXCEPTION 'programme status and its current published verdict must change atomically'
			USING ERRCODE = '23514';
	END IF;

	RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "development_programmes_published_status_guard"
AFTER UPDATE OF "status" ON "development_programmes"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_published_programme_status"();
--> statement-breakpoint
CREATE FUNCTION "rnawiki_require_measured_claim_source"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	claim_row "claims"%ROWTYPE;
BEGIN
	IF TG_TABLE_NAME = 'claims' THEN
		claim_row := NEW;
	ELSE
		SELECT * INTO claim_row FROM "claims" WHERE "id" = OLD."claim_id";
		IF NOT FOUND THEN RETURN OLD; END IF;
	END IF;

	IF claim_row."review_status" = 'PUBLISHED' AND claim_row."nature" = 'MEASURED'
		AND NOT EXISTS (SELECT 1 FROM "claim_source_links" WHERE "claim_id" = claim_row."id") THEN
		RAISE EXCEPTION 'a published MEASURED claim requires an immutable source snapshot link'
			USING ERRCODE = '23514';
	END IF;

	IF TG_TABLE_NAME = 'claims' THEN RETURN NEW; END IF;
	RETURN OLD;
END;
$$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "claims_measured_source_guard"
AFTER INSERT OR UPDATE ON "claims"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "rnawiki_require_measured_claim_source"();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "claim_source_links_delete_guard"
AFTER DELETE ON "claim_source_links"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "rnawiki_require_measured_claim_source"();
--> statement-breakpoint
CREATE FUNCTION "rnawiki_guard_verdict_review_append"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	verdict_status "evidence_review_status";
BEGIN
	IF TG_OP = 'UPDATE' THEN
		RAISE EXCEPTION 'programme verdict reviews are append-only; record a later decision instead'
			USING ERRCODE = '55000';
	END IF;

	-- The share lock serializes a last-moment review against publication's FOR UPDATE lock. A
	-- reviewer that started after publication waits, sees PUBLISHED, and cannot alter consensus.
	SELECT "review_status" INTO verdict_status
	FROM "programme_verdict_revisions"
	WHERE "id" = NEW."verdict_revision_id"
	FOR SHARE;

	IF verdict_status IN ('PUBLISHED', 'SUPERSEDED') THEN
		RAISE EXCEPTION 'reviews cannot be added after a verdict revision is published'
			USING ERRCODE = '23514';
	END IF;

	RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "programme_verdict_reviews_append_only"
BEFORE INSERT OR UPDATE ON "programme_verdict_reviews"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_review_append"();
--> statement-breakpoint
CREATE FUNCTION "rnawiki_require_interpretability_claim"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	assessment_row "trial_interpretability_assessments"%ROWTYPE;
BEGIN
	IF TG_TABLE_NAME = 'trial_interpretability_assessments' THEN
		assessment_row := NEW;
	ELSE
		SELECT * INTO assessment_row
		FROM "trial_interpretability_assessments" WHERE "id" = OLD."assessment_id";
		IF NOT FOUND THEN RETURN OLD; END IF;
	END IF;

	IF assessment_row."review_status" = 'PUBLISHED' AND NOT EXISTS (
		SELECT 1 FROM "trial_interpretability_claims"
		WHERE "assessment_id" = assessment_row."id"
	) THEN
		RAISE EXCEPTION 'a published study interpretability answer requires a supporting claim link'
			USING ERRCODE = '23514';
	END IF;

	IF TG_TABLE_NAME = 'trial_interpretability_assessments' THEN RETURN NEW; END IF;
	RETURN OLD;
END;
$$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "trial_interpretability_claim_guard"
AFTER INSERT OR UPDATE ON "trial_interpretability_assessments"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "rnawiki_require_interpretability_claim"();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "trial_interpretability_link_delete_guard"
AFTER DELETE ON "trial_interpretability_claims"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "rnawiki_require_interpretability_claim"();
