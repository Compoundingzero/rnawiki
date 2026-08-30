CREATE TYPE "public"."agent_queue_decision" AS ENUM('CORRECTION_NEEDED', 'NOT_A_PROBLEM', 'CONFIRMED_AS_RECORDED', 'NEEDS_MORE_EVIDENCE');--> statement-breakpoint
CREATE TYPE "public"."agent_run_status" AS ENUM('COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE "agent_queue_decisions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"candidate_key" varchar(64) NOT NULL,
	"occurrence_key" varchar(64) NOT NULL,
	"decided_by_user_id" varchar(64) NOT NULL,
	"decision" "agent_queue_decision" NOT NULL,
	"explanation" text,
	"evidence_digest" varchar(64) NOT NULL,
	"conflicts_of_interest" text,
	"decided_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_queue_decisions_keys" CHECK ("agent_queue_decisions"."candidate_key" ~ '^[0-9a-f]{64}$' and "agent_queue_decisions"."occurrence_key" ~ '^[0-9a-f]{64}$' and "agent_queue_decisions"."evidence_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "agent_queue_decisions_explanation" CHECK ("agent_queue_decisions"."decision" = 'NOT_A_PROBLEM' or nullif(btrim("agent_queue_decisions"."explanation"), '') is not null)
);
--> statement-breakpoint
CREATE TABLE "agent_review_candidates" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"candidate_key" varchar(64) NOT NULL,
	"occurrence_key" varchar(64) NOT NULL,
	"run_id" varchar(64) NOT NULL,
	"agent_name" varchar(64) NOT NULL,
	"subject_type" varchar(24) NOT NULL,
	"subject_id" varchar(160) NOT NULL,
	"field_path" varchar(200) NOT NULL,
	"reason" varchar(48) NOT NULL,
	"priority" numeric NOT NULL,
	"basis" text NOT NULL,
	"question" text NOT NULL,
	"evidence" jsonb,
	"source_ids" text[] NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_review_candidates_keys" CHECK ("agent_review_candidates"."candidate_key" ~ '^[0-9a-f]{64}$' and "agent_review_candidates"."occurrence_key" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "agent_runs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"agent_name" varchar(64) NOT NULL,
	"agent_version" varchar(16) NOT NULL,
	"reason_schema_version" varchar(16) NOT NULL,
	"corpus_version" varchar(64) NOT NULL,
	"input_digest" varchar(64) NOT NULL,
	"output_digest" varchar(64) NOT NULL,
	"run_date" date NOT NULL,
	"seed" integer NOT NULL,
	"records_considered" integer NOT NULL,
	"records_used" integer NOT NULL,
	"candidates_emitted" integer NOT NULL,
	"status" "agent_run_status" NOT NULL,
	"failure_detail" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_runs_digests" CHECK ("agent_runs"."input_digest" ~ '^[0-9a-f]{64}$' and "agent_runs"."output_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "agent_runs_failure_detail" CHECK ("agent_runs"."status" = 'COMPLETED' or nullif(btrim("agent_runs"."failure_detail"), '') is not null)
);
--> statement-breakpoint
CREATE TABLE "engine_findings" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"engine_family" varchar(32) NOT NULL,
	"engine_version" varchar(48) NOT NULL,
	"input_digest" varchar(64) NOT NULL,
	"subject_type" varchar(24) NOT NULL,
	"subject_id" varchar(160) NOT NULL,
	"rule_code" varchar(64) NOT NULL,
	"level" varchar(16) NOT NULL,
	"field_path" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"publication_effect" varchar(24) NOT NULL,
	"corpus_version" varchar(64) NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "engine_findings_input_digest" CHECK ("engine_findings"."input_digest" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
ALTER TABLE "agent_queue_decisions" ADD CONSTRAINT "agent_queue_decisions_decided_by_user_id_users_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_review_candidates" ADD CONSTRAINT "agent_review_candidates_run_id_agent_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."agent_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agent_queue_decisions_reviewer_unique" ON "agent_queue_decisions" USING btree ("occurrence_key","decided_by_user_id");--> statement-breakpoint
CREATE INDEX "agent_queue_decisions_candidate_idx" ON "agent_queue_decisions" USING btree ("candidate_key","decided_at");--> statement-breakpoint
CREATE INDEX "agent_queue_decisions_reviewer_idx" ON "agent_queue_decisions" USING btree ("decided_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agent_review_candidates_occurrence_unique" ON "agent_review_candidates" USING btree ("occurrence_key");--> statement-breakpoint
CREATE INDEX "agent_review_candidates_candidate_idx" ON "agent_review_candidates" USING btree ("candidate_key");--> statement-breakpoint
CREATE INDEX "agent_review_candidates_agent_idx" ON "agent_review_candidates" USING btree ("agent_name","reason");--> statement-breakpoint
CREATE INDEX "agent_review_candidates_subject_idx" ON "agent_review_candidates" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "agent_runs_agent_idx" ON "agent_runs" USING btree ("agent_name","run_date");--> statement-breakpoint
CREATE INDEX "engine_findings_rule_idx" ON "engine_findings" USING btree ("rule_code","recorded_at");--> statement-breakpoint
CREATE INDEX "engine_findings_subject_idx" ON "engine_findings" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "engine_findings_engine_idx" ON "engine_findings" USING btree ("engine_family","engine_version");