CREATE TYPE "public"."claim_type" AS ENUM('mechanism', 'effectiveness', 'safety', 'regulatory', 'access', 'claimed_use');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('peptide', 'supplement_ingredient', 'investigational_medicine', 'approved_medicine', 'gene_editing_treatment', 'rna_treatment', 'other_emerging_therapy');--> statement-breakpoint
CREATE TYPE "public"."evidence_change_type" AS ENUM('new_controlled_trial', 'regulatory_decision', 'safety_warning', 'retraction_or_correction', 'independent_study', 'boundary_moved');--> statement-breakpoint
CREATE TYPE "public"."evidence_relationship" AS ENUM('supports', 'contradicts', 'limits', 'contextualizes');--> statement-breakpoint
CREATE TYPE "public"."evidence_status" AS ENUM('measured', 'inferred', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('pending', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."proof_boundary_stage" AS ENUM('biological_rationale_only', 'isolated_cell_evidence', 'animal_evidence', 'observational_human_evidence', 'uncontrolled_human_intervention', 'controlled_human_evidence', 'independently_supported_controlled_human_evidence', 'regulatory_evidence');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'editorially_complete', 'scientific_review_required', 'approved', 'published', 'needs_update', 're_review');--> statement-breakpoint
CREATE TYPE "public"."regulatory_category" AS ENUM('approved_medicine', 'investigational_medicine', 'compounded_medicine', 'dietary_supplement', 'unapproved_therapeutic_substance', 'withdrawn_or_restricted');--> statement-breakpoint
CREATE TYPE "public"."review_decision" AS ENUM('approved', 'rejected', 'needs_changes');--> statement-breakpoint
CREATE TYPE "public"."reviewable_type" AS ENUM('claim', 'entity');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('administrator', 'editor', 'scientific_reviewer');--> statement-breakpoint
CREATE TABLE "claim_evidence" (
	"id" serial PRIMARY KEY NOT NULL,
	"claim_id" integer NOT NULL,
	"evidence_source_id" integer NOT NULL,
	"relationship" "evidence_relationship" NOT NULL,
	"claim_part_addressed" text NOT NULL,
	"directly_measured_result" text NOT NULL,
	"editorial_notes" text,
	"independent_group_status" boolean DEFAULT false NOT NULL,
	"display_priority" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_id" integer NOT NULL,
	"slug" varchar(200) NOT NULL,
	"claim_type" "claim_type" NOT NULL,
	"consumer_question" text NOT NULL,
	"direct_answer" text NOT NULL,
	"measured_finding" text NOT NULL,
	"inference" text NOT NULL,
	"proof_boundary_stage" "proof_boundary_stage" NOT NULL,
	"proof_boundary_explanation" text NOT NULL,
	"remaining_unknown" text NOT NULL,
	"evidence_needed_next" text NOT NULL,
	"mechanism_summary" text,
	"outcome_summary" text,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"reviewer_id" integer,
	"last_reviewed_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"display_priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comprehension_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"claim_id" integer NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_option_index" integer NOT NULL,
	"explanation" text NOT NULL,
	"active_version" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comprehension_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"claim_version" integer NOT NULL,
	"selected_option_index" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"session_hash" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "correction_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_id" integer,
	"claim_id" integer,
	"category" varchar(100) NOT NULL,
	"message" text NOT NULL,
	"proposed_source" text,
	"moderation_status" "moderation_status" DEFAULT 'pending' NOT NULL,
	"resolution" text,
	"public_correction_entry" text,
	"session_hash" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entities" (
	"id" serial PRIMARY KEY NOT NULL,
	"canonical_name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"short_description" text NOT NULL,
	"bottom_line" text NOT NULL,
	"regulatory_category" "regulatory_category" NOT NULL,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"access_reality_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "evidence_changes" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_id" integer,
	"claim_id" integer,
	"change_type" "evidence_change_type" NOT NULL,
	"previous_boundary" "proof_boundary_stage",
	"new_boundary" "proof_boundary_stage",
	"explanation" text NOT NULL,
	"source" text NOT NULL,
	"publication_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"authors" text,
	"publication_year" integer,
	"journal_or_issuer" varchar(300),
	"doi" varchar(200),
	"pmid" varchar(50),
	"clinical_trial_id" varchar(50),
	"regulatory_url" text,
	"source_type" varchar(100) NOT NULL,
	"study_design" varchar(200),
	"experimental_model" varchar(200),
	"species" varchar(100),
	"sample_size" integer,
	"endpoint" text,
	"retraction_status" varchar(100),
	"bibliographic_metadata" jsonb,
	"date_checked" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legacy_redirects" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_path" varchar(300) NOT NULL,
	"to_path" varchar(300),
	"status_code" integer NOT NULL,
	"note" text,
	CONSTRAINT "legacy_redirects_from_path_unique" UNIQUE("from_path")
);
--> statement-breakpoint
CREATE TABLE "mechanism_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"claim_id" integer NOT NULL,
	"display_order" integer NOT NULL,
	"technical_label" varchar(200) NOT NULL,
	"plain_language_explanation" text NOT NULL,
	"evidence_context" text NOT NULL,
	"status" "evidence_status" NOT NULL,
	"source_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"illustration_metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "regulatory_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_id" integer NOT NULL,
	"jurisdiction" varchar(100) NOT NULL,
	"legal_category" "regulatory_category" NOT NULL,
	"approved_indications" text,
	"status_statement" text NOT NULL,
	"source" text NOT NULL,
	"checked_date" timestamp with time zone NOT NULL,
	"editor_id" integer,
	"review_status" "publication_status" DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"reviewable_type" "reviewable_type" NOT NULL,
	"reviewable_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"decision" "review_decision" NOT NULL,
	"comments" text,
	"reviewed_version" integer NOT NULL,
	"review_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"reviewable_type" "reviewable_type" NOT NULL,
	"reviewable_id" integer NOT NULL,
	"changed_by_user_id" integer NOT NULL,
	"field_changed" varchar(200) NOT NULL,
	"previous_value" text,
	"new_value" text,
	"reason" text,
	"review_status_affected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_id" integer NOT NULL,
	"email" varchar(320) NOT NULL,
	"confirmed_at" timestamp with time zone,
	"unsubscribe_token" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(200) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"credentials" text,
	"relevant_field" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_evidence" ADD CONSTRAINT "claim_evidence_evidence_source_id_evidence_sources_id_fk" FOREIGN KEY ("evidence_source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comprehension_questions" ADD CONSTRAINT "comprehension_questions_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comprehension_responses" ADD CONSTRAINT "comprehension_responses_question_id_comprehension_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."comprehension_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "correction_submissions" ADD CONSTRAINT "correction_submissions_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "correction_submissions" ADD CONSTRAINT "correction_submissions_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_changes" ADD CONSTRAINT "evidence_changes_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_changes" ADD CONSTRAINT "evidence_changes_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mechanism_steps" ADD CONSTRAINT "mechanism_steps_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regulatory_statuses" ADD CONSTRAINT "regulatory_statuses_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regulatory_statuses" ADD CONSTRAINT "regulatory_statuses_editor_id_users_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "claim_evidence_claim_idx" ON "claim_evidence" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "claim_evidence_evidence_idx" ON "claim_evidence" USING btree ("evidence_source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "claims_entity_slug_idx" ON "claims" USING btree ("entity_id","slug");--> statement-breakpoint
CREATE INDEX "claims_status_idx" ON "claims" USING btree ("publication_status");--> statement-breakpoint
CREATE INDEX "comprehension_questions_claim_idx" ON "comprehension_questions" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "comprehension_responses_question_idx" ON "comprehension_responses" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "comprehension_responses_dedupe_idx" ON "comprehension_responses" USING btree ("question_id","session_hash");--> statement-breakpoint
CREATE INDEX "correction_submissions_status_idx" ON "correction_submissions" USING btree ("moderation_status");--> statement-breakpoint
CREATE UNIQUE INDEX "entities_slug_idx" ON "entities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "entities_type_idx" ON "entities" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "evidence_changes_date_idx" ON "evidence_changes" USING btree ("publication_date");--> statement-breakpoint
CREATE INDEX "evidence_sources_doi_idx" ON "evidence_sources" USING btree ("doi");--> statement-breakpoint
CREATE INDEX "evidence_sources_pmid_idx" ON "evidence_sources" USING btree ("pmid");--> statement-breakpoint
CREATE INDEX "mechanism_steps_claim_order_idx" ON "mechanism_steps" USING btree ("claim_id","display_order");--> statement-breakpoint
CREATE INDEX "regulatory_statuses_entity_idx" ON "regulatory_statuses" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "reviews_reviewable_idx" ON "reviews" USING btree ("reviewable_type","reviewable_id");--> statement-breakpoint
CREATE INDEX "revisions_reviewable_idx" ON "revisions" USING btree ("reviewable_type","reviewable_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_entity_email_idx" ON "subscriptions" USING btree ("entity_id","email");