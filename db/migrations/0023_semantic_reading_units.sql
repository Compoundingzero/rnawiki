CREATE TYPE "public"."evidence_unit_assertion" AS ENUM('ASSERTED', 'NEGATED', 'ABSENT');--> statement-breakpoint
CREATE TYPE "public"."evidence_unit_kind" AS ENUM('RECORDED_VALUE', 'RECORDED_STATEMENT', 'POPULATION_STATEMENT', 'ADVERSE_REACTION_LIST', 'CONSENSUS_READING', 'SEARCH_RESULT', 'SECTION_STATE');--> statement-breakpoint
CREATE TABLE "evidence_reading_units" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"drug_id" varchar(96) NOT NULL,
	"canonical_slug" varchar(128) NOT NULL,
	"unit_kind" "evidence_unit_kind" NOT NULL,
	"assertion" "evidence_unit_assertion" NOT NULL,
	"section_id" varchar(64) NOT NULL,
	"field_path" text NOT NULL,
	"population_scope" text,
	"formulation_scope" text,
	"text" text NOT NULL,
	"source_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"comparison_state" varchar(24),
	"projector_version" varchar(64) NOT NULL,
	"content_digest" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce("text", ''))) STORED,
	CONSTRAINT "evidence_reading_units_id_digest" CHECK ("evidence_reading_units"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "evidence_reading_units_content_digest" CHECK ("evidence_reading_units"."content_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "evidence_reading_units_text" CHECK (nullif(btrim("evidence_reading_units"."text"), '') is not null),
	CONSTRAINT "evidence_reading_units_comparison_state" CHECK ("evidence_reading_units"."comparison_state" is null or "evidence_reading_units"."comparison_state" in ('agree', 'differ', 'not_comparable', 'insufficient_context'))
);
--> statement-breakpoint
CREATE TABLE "result_debugger_corrections" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"reviewer_user_id" varchar(64) NOT NULL,
	"returned_unit_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"expected_unit_id" varchar(64),
	"expected_absence" boolean DEFAULT false NOT NULL,
	"reason" text NOT NULL,
	"engine_version" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "result_debugger_corrections_query" CHECK (nullif(btrim("result_debugger_corrections"."query"), '') is not null),
	CONSTRAINT "result_debugger_corrections_reason" CHECK (nullif(btrim("result_debugger_corrections"."reason"), '') is not null),
	CONSTRAINT "result_debugger_corrections_expected_unit" CHECK ("result_debugger_corrections"."expected_unit_id" is null or "result_debugger_corrections"."expected_unit_id" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
ALTER TABLE "evidence_reading_units" ADD CONSTRAINT "evidence_reading_units_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result_debugger_corrections" ADD CONSTRAINT "result_debugger_corrections_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evidence_reading_units_drug_idx" ON "evidence_reading_units" USING btree ("drug_id");--> statement-breakpoint
CREATE INDEX "evidence_reading_units_section_idx" ON "evidence_reading_units" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "evidence_reading_units_kind_idx" ON "evidence_reading_units" USING btree ("unit_kind");--> statement-breakpoint
CREATE INDEX "evidence_reading_units_search_idx" ON "evidence_reading_units" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "result_debugger_corrections_created_idx" ON "result_debugger_corrections" USING btree ("created_at");--> statement-breakpoint
CREATE OR REPLACE FUNCTION result_debugger_corrections_append_only() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'result_debugger_corrections is append-only; record a new correction instead';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER result_debugger_corrections_immutable
BEFORE UPDATE OR DELETE ON "result_debugger_corrections"
FOR EACH ROW EXECUTE FUNCTION result_debugger_corrections_append_only();
