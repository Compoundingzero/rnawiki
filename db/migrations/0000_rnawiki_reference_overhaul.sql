CREATE TYPE "public"."approval_status" AS ENUM('FDA Approved', 'EMA Approved', 'Phase 3 Clinical Trial', 'Phase 2 Investigational', 'Off-Label / Compounded', 'Non-FDA / Dietary Supplement', 'Accelerated Approval', 'Pre-clinical / Open Source');--> statement-breakpoint
CREATE TYPE "public"."audit_confidence" AS ENUM('High Confidence', 'Moderate / Debated', 'Inference Overreach Found', 'Rigorous Replicated');--> statement-breakpoint
CREATE TYPE "public"."doctor_verification_state" AS ENUM('none', 'pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."dossier_depth" AS ENUM('stub', 'curated', 'flagship');--> statement-breakpoint
CREATE TYPE "public"."drug_modality" AS ENUM('Small Molecule', 'Peptide / GLP-1 Agonist', 'Monoclonal Antibody (mAb)', 'siRNA (Small Interfering RNA)', 'ASO (Antisense Oligonucleotide)', 'mRNA Vaccine / Therapeutic', 'CRISPR / Gene Therapy', 'Recombinant Protein / Biologic', 'Nutraceutical / Botanical');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('suggestion', 'correction', 'request');--> statement-breakpoint
CREATE TYPE "public"."note_status" AS ENUM('published', 'hidden', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."revision_status" AS ENUM('published', 'pending_review', 'rejected', 'machine_rejected');--> statement-breakpoint
CREATE TYPE "public"."trust_tier" AS ENUM('new', 'contributor', 'trusted', 'steward');--> statement-breakpoint
CREATE TABLE "community_notes" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"drug_id" varchar(96) NOT NULL,
	"author_user_id" varchar(64),
	"author_name" varchar(160) NOT NULL,
	"role" varchar(160) DEFAULT 'Community Contributor' NOT NULL,
	"is_verified_doctor" boolean DEFAULT false NOT NULL,
	"medical_specialty" varchar(120),
	"institution" varchar(200),
	"orcid" varchar(32),
	"content" text NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"status" "note_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drugs" (
	"id" varchar(96) PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"name" varchar(300) NOT NULL,
	"trade_name" varchar(400),
	"sponsor" varchar(300) DEFAULT '' NOT NULL,
	"target_gene" varchar(200) DEFAULT '' NOT NULL,
	"target_protein" varchar(300) DEFAULT '' NOT NULL,
	"modality" "drug_modality" NOT NULL,
	"approval_status" "approval_status" NOT NULL,
	"approval_year" integer,
	"indication" text DEFAULT '' NOT NULL,
	"patient_friendly_indication" text DEFAULT '' NOT NULL,
	"one_sentence_verdict" text DEFAULT '' NOT NULL,
	"layman_how_it_works" text DEFAULT '' NOT NULL,
	"audit_confidence" "audit_confidence" DEFAULT 'Moderate / Debated' NOT NULL,
	"confidence_score" integer DEFAULT 0 NOT NULL,
	"anatomical_site" varchar(300),
	"recent_audit_date" varchar(64) DEFAULT '' NOT NULL,
	"has_discrepancy" boolean DEFAULT false NOT NULL,
	"dossier_depth" "dossier_depth" DEFAULT 'stub' NOT NULL,
	"condition_context" jsonb,
	"pricing" jsonb,
	"substitutes" jsonb,
	"molecular_schema" jsonb,
	"key_audits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mechanism_steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"trials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"measured_vs_inferred_summary" jsonb,
	"delivery_system" jsonb,
	"common_questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_provenance" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_machine_verified_structure" boolean DEFAULT false NOT NULL,
	"verification_hash" varchar(32),
	"last_verified_at" timestamp with time zone,
	"revision_count" integer DEFAULT 0 NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"last_edited_at" timestamp with time zone,
	"last_edited_by" varchar(160),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(trade_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(target_gene, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(patient_friendly_indication, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(indication, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(sponsor, '')), 'D')
      ) STORED
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"type" "feedback_type" NOT NULL,
	"message" text NOT NULL,
	"email" varchar(320),
	"drug_slug" varchar(128),
	"user_id" varchar(64),
	"session_hash" varchar(64),
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingest_runs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"source" varchar(120) NOT NULL,
	"records_seen" integer DEFAULT 0 NOT NULL,
	"records_written" integer DEFAULT 0 NOT NULL,
	"records_skipped" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "note_upvotes" (
	"note_id" varchar(64) NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "note_upvotes_note_id_user_id_pk" PRIMARY KEY("note_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "revisions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"drug_id" varchar(96) NOT NULL,
	"author_user_id" varchar(64),
	"author_name" varchar(160) NOT NULL,
	"author_orcid" varchar(32),
	"author_trust_tier" "trust_tier" DEFAULT 'new' NOT NULL,
	"status" "revision_status" NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"changed_fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"proposed_payload" jsonb NOT NULL,
	"engine_report" jsonb,
	"machine_verified" boolean DEFAULT false NOT NULL,
	"verification_hash" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by_user_id" varchar(64),
	"reviewed_by_name" varchar(160),
	"review_note" text
);
--> statement-breakpoint
CREATE TABLE "saved_drugs" (
	"user_id" varchar(64) NOT NULL,
	"drug_id" varchar(96) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_drugs_user_id_drug_id_pk" PRIMARY KEY("user_id","drug_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(160) NOT NULL,
	"handle" varchar(64) NOT NULL,
	"orcid" varchar(32),
	"is_doctor" boolean DEFAULT false NOT NULL,
	"medical_license_or_npi" varchar(64),
	"medical_specialty" varchar(120),
	"institution" varchar(200),
	"verification_state" "doctor_verification_state" DEFAULT 'none' NOT NULL,
	"verified_at" timestamp with time zone,
	"verification_note" text,
	"trust_tier" "trust_tier" DEFAULT 'new' NOT NULL,
	"accepted_edit_count" integer DEFAULT 0 NOT NULL,
	"rejected_edit_count" integer DEFAULT 0 NOT NULL,
	"note_count" integer DEFAULT 0 NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "community_notes" ADD CONSTRAINT "community_notes_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_notes" ADD CONSTRAINT "community_notes_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_upvotes" ADD CONSTRAINT "note_upvotes_note_id_community_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."community_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_upvotes" ADD CONSTRAINT "note_upvotes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_drugs" ADD CONSTRAINT "saved_drugs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_drugs" ADD CONSTRAINT "saved_drugs_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "community_notes_drug_idx" ON "community_notes" USING btree ("drug_id","created_at");--> statement-breakpoint
CREATE INDEX "community_notes_author_idx" ON "community_notes" USING btree ("author_user_id");--> statement-breakpoint
CREATE INDEX "community_notes_status_idx" ON "community_notes" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "drugs_slug_unique" ON "drugs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "drugs_search_idx" ON "drugs" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "drugs_modality_idx" ON "drugs" USING btree ("modality");--> statement-breakpoint
CREATE INDEX "drugs_approval_status_idx" ON "drugs" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "drugs_depth_idx" ON "drugs" USING btree ("dossier_depth");--> statement-breakpoint
CREATE INDEX "drugs_name_idx" ON "drugs" USING btree ("name");--> statement-breakpoint
CREATE INDEX "drugs_view_count_idx" ON "drugs" USING btree ("view_count");--> statement-breakpoint
CREATE INDEX "feedback_created_idx" ON "feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "feedback_type_idx" ON "feedback" USING btree ("type");--> statement-breakpoint
CREATE INDEX "revisions_drug_idx" ON "revisions" USING btree ("drug_id","created_at");--> statement-breakpoint
CREATE INDEX "revisions_status_idx" ON "revisions" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "revisions_author_idx" ON "revisions" USING btree ("author_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "users_handle_unique" ON "users" USING btree (lower("handle"));--> statement-breakpoint
CREATE INDEX "users_verification_state_idx" ON "users" USING btree ("verification_state");--> statement-breakpoint
CREATE INDEX "users_trust_tier_idx" ON "users" USING btree ("trust_tier");