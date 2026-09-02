CREATE TYPE "public"."dossier_completion_review_decision" AS ENUM('ACKNOWLEDGED', 'SOURCE_READ_NO_CHANGE', 'CORRECTION_PROPOSED', 'IDENTITY_DISPUTED');--> statement-breakpoint
CREATE TYPE "public"."dossier_completion_status" AS ENUM('COMPLETE', 'INCOMPLETE');--> statement-breakpoint
CREATE TYPE "public"."inventory_entity_class" AS ENUM('APPROVED_MEDICINE', 'APPROVED_BIOLOGIC', 'INVESTIGATIONAL_MEDICINE', 'OFF_LABEL_OR_COMPOUNDED', 'WITHDRAWN_MEDICINE', 'CONTROLLED_NO_APPROVED_USE', 'COMBINATION_PRODUCT', 'BOTANICAL_OR_ORGANISM_PREPARATION', 'SUPPLEMENT_INGREDIENT', 'MARKETED_PRODUCT_INGREDIENT', 'REGISTRY_ONLY_IDENTITY', 'PLACEHOLDER');--> statement-breakpoint
CREATE TYPE "public"."inventory_resolution_status" AS ENUM('CANONICAL_ENTITY', 'ALIAS_OF_CANONICAL_ENTITY', 'DUPLICATE_OF_CANONICAL_ENTITY', 'HISTORICAL_REDIRECT', 'INVALID_IDENTITY_GONE', 'MANUAL_IDENTITY_REVIEW_REQUIRED');--> statement-breakpoint
CREATE TYPE "public"."source_search_status" AS ENUM('SUCCEEDED', 'UNREACHABLE', 'FAILED');--> statement-breakpoint
CREATE TABLE "dossier_completion_assessments" (
	"drug_id" varchar(96) PRIMARY KEY NOT NULL,
	"resolver_version" varchar(64) NOT NULL,
	"status" "dossier_completion_status" NOT NULL,
	"input_digest" varchar(64) NOT NULL,
	"sections" jsonb NOT NULL,
	"applicable_section_count" integer NOT NULL,
	"terminal_section_count" integer NOT NULL,
	"non_terminal_section_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"human_read_suggested_section_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dossier_completion_assessments_digest" CHECK ("dossier_completion_assessments"."input_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "dossier_completion_assessments_counts" CHECK ("dossier_completion_assessments"."applicable_section_count" >= 0 and "dossier_completion_assessments"."terminal_section_count" >= 0 and "dossier_completion_assessments"."terminal_section_count" <= "dossier_completion_assessments"."applicable_section_count"),
	CONSTRAINT "dossier_completion_assessments_status_agrees" CHECK (("dossier_completion_assessments"."status" = 'COMPLETE') = ("dossier_completion_assessments"."terminal_section_count" = "dossier_completion_assessments"."applicable_section_count" and jsonb_array_length("dossier_completion_assessments"."non_terminal_section_ids") = 0)),
	CONSTRAINT "dossier_completion_assessments_sections_shape" CHECK (jsonb_typeof("dossier_completion_assessments"."sections") = 'array' and jsonb_array_length("dossier_completion_assessments"."sections") = "dossier_completion_assessments"."applicable_section_count")
);
--> statement-breakpoint
CREATE TABLE "dossier_completion_review_decisions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"drug_id" varchar(96) NOT NULL,
	"section_id" varchar(64) NOT NULL,
	"decision" "dossier_completion_review_decision" NOT NULL,
	"reviewer_user_id" varchar(64) NOT NULL,
	"explanation" text NOT NULL,
	"assessment_input_digest" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dossier_completion_review_decisions_explanation" CHECK (nullif(btrim("dossier_completion_review_decisions"."explanation"), '') is not null),
	CONSTRAINT "dossier_completion_review_decisions_digest" CHECK ("dossier_completion_review_decisions"."assessment_input_digest" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "inventory_resolutions" (
	"drug_id" varchar(96) PRIMARY KEY NOT NULL,
	"resolver_version" varchar(64) NOT NULL,
	"resolution_status" "inventory_resolution_status" NOT NULL,
	"entity_class" "inventory_entity_class" NOT NULL,
	"entity_class_rule" text NOT NULL,
	"canonical_drug_id" varchar(96) NOT NULL,
	"canonical_slug" varchar(128) NOT NULL,
	"redirect_target_slug" varchar(128),
	"identity_confidence" varchar(40) NOT NULL,
	"identity_sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"attribution_warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"resolution_evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content_digest" varchar(64) NOT NULL,
	"resolved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_resolutions_redirect_shape" CHECK (("inventory_resolutions"."redirect_target_slug" is null) = ("inventory_resolutions"."resolution_status" in ('CANONICAL_ENTITY', 'INVALID_IDENTITY_GONE', 'MANUAL_IDENTITY_REVIEW_REQUIRED'))),
	CONSTRAINT "inventory_resolutions_canonical_self" CHECK ("inventory_resolutions"."resolution_status" in ('DUPLICATE_OF_CANONICAL_ENTITY', 'ALIAS_OF_CANONICAL_ENTITY', 'HISTORICAL_REDIRECT') or "inventory_resolutions"."canonical_drug_id" = "inventory_resolutions"."drug_id"),
	CONSTRAINT "inventory_resolutions_redirect_target_matches_canonical" CHECK ("inventory_resolutions"."redirect_target_slug" is null or "inventory_resolutions"."redirect_target_slug" = "inventory_resolutions"."canonical_slug"),
	CONSTRAINT "inventory_resolutions_digest" CHECK ("inventory_resolutions"."content_digest" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "source_search_records" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"drug_id" varchar(96) NOT NULL,
	"search_kind" varchar(64) NOT NULL,
	"source_identifier" text NOT NULL,
	"query" text NOT NULL,
	"requested_at" timestamp with time zone NOT NULL,
	"status" "source_search_status" NOT NULL,
	"result_count" integer,
	"matched" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"response_digest" varchar(64),
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_search_records_outcome_shape" CHECK (("source_search_records"."status" = 'SUCCEEDED' and "source_search_records"."result_count" is not null and "source_search_records"."result_count" >= 0 and "source_search_records"."error" is null)
        or ("source_search_records"."status" <> 'SUCCEEDED' and "source_search_records"."result_count" is null and nullif(btrim("source_search_records"."error"), '') is not null)),
	CONSTRAINT "source_search_records_digest" CHECK ("source_search_records"."response_digest" is null or "source_search_records"."response_digest" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
ALTER TABLE "dossier_completion_assessments" ADD CONSTRAINT "dossier_completion_assessments_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossier_completion_review_decisions" ADD CONSTRAINT "dossier_completion_review_decisions_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossier_completion_review_decisions" ADD CONSTRAINT "dossier_completion_review_decisions_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_resolutions" ADD CONSTRAINT "inventory_resolutions_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_resolutions" ADD CONSTRAINT "inventory_resolutions_canonical_drug_id_drugs_id_fk" FOREIGN KEY ("canonical_drug_id") REFERENCES "public"."drugs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_search_records" ADD CONSTRAINT "source_search_records_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dossier_completion_assessments_status_idx" ON "dossier_completion_assessments" USING btree ("status","content_changed_at");--> statement-breakpoint
CREATE INDEX "dossier_completion_review_decisions_drug_idx" ON "dossier_completion_review_decisions" USING btree ("drug_id","created_at");--> statement-breakpoint
CREATE INDEX "inventory_resolutions_status_idx" ON "inventory_resolutions" USING btree ("resolution_status");--> statement-breakpoint
CREATE INDEX "inventory_resolutions_canonical_idx" ON "inventory_resolutions" USING btree ("canonical_drug_id");--> statement-breakpoint
CREATE INDEX "inventory_resolutions_entity_class_idx" ON "inventory_resolutions" USING btree ("entity_class");--> statement-breakpoint
CREATE UNIQUE INDEX "source_search_records_identity" ON "source_search_records" USING btree ("drug_id","search_kind","source_identifier");--> statement-breakpoint
CREATE INDEX "source_search_records_drug_idx" ON "source_search_records" USING btree ("drug_id");--> statement-breakpoint
CREATE INDEX "source_search_records_kind_status_idx" ON "source_search_records" USING btree ("search_kind","status");--> statement-breakpoint
CREATE OR REPLACE FUNCTION dossier_completion_review_decisions_append_only() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'dossier_completion_review_decisions is append-only; record a new decision instead';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER dossier_completion_review_decisions_immutable
BEFORE UPDATE OR DELETE ON "dossier_completion_review_decisions"
FOR EACH ROW EXECUTE FUNCTION dossier_completion_review_decisions_append_only();
