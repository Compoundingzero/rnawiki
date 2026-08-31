-- Release B1: immutable agent occurrences, per-run membership, active-run pointers and append-only decisions.
CREATE TYPE "public"."agent_audience_lane" AS ENUM('ordinary', 'biotech', 'chemist', 'quantitative');--> statement-breakpoint
CREATE TYPE "public"."agent_review_severity" AS ENUM('low', 'medium', 'high', 'blocking');--> statement-breakpoint
CREATE TABLE "agent_current_runs" (
	"agent_name" varchar(64) PRIMARY KEY NOT NULL,
	"run_id" varchar(64) NOT NULL,
	"activated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_run_candidates" (
	"run_id" varchar(64) NOT NULL,
	"candidate_key" varchar(64) NOT NULL,
	"occurrence_key" varchar(64) NOT NULL,
	"priority" numeric NOT NULL,
	"basis" text NOT NULL,
	"question" text NOT NULL,
	"evidence_digest" varchar(64) NOT NULL,
	"audience_lane" "agent_audience_lane" NOT NULL,
	"severity" "agent_review_severity" NOT NULL,
	"provenance_tier" varchar(24) NOT NULL,
	"ranking_features" jsonb NOT NULL,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_run_candidates_run_id_occurrence_key_pk" PRIMARY KEY("run_id","occurrence_key"),
	CONSTRAINT "agent_run_candidates_evidence_digest" CHECK ("agent_run_candidates"."evidence_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "agent_run_candidates_copy" CHECK (nullif(btrim("agent_run_candidates"."basis"), '') is not null and nullif(btrim("agent_run_candidates"."question"), '') is not null)
);
--> statement-breakpoint
ALTER TABLE "agent_queue_decisions" DROP CONSTRAINT "agent_queue_decisions_explanation";--> statement-breakpoint
ALTER TABLE "agent_review_candidates" DROP CONSTRAINT "agent_review_candidates_run_id_agent_runs_id_fk";
--> statement-breakpoint
DROP INDEX "agent_queue_decisions_reviewer_unique";--> statement-breakpoint
ALTER TABLE "agent_review_candidates" ADD COLUMN "evidence_digest" varchar(64);--> statement-breakpoint
ALTER TABLE "agent_review_candidates" ADD COLUMN "source_snapshot_digests" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_review_candidates" ADD COLUMN "audience_lane" "agent_audience_lane";--> statement-breakpoint
ALTER TABLE "agent_review_candidates" ADD COLUMN "severity" "agent_review_severity";--> statement-breakpoint
ALTER TABLE "agent_review_candidates" ADD COLUMN "provenance_tier" varchar(24);--> statement-breakpoint
ALTER TABLE "agent_review_candidates" ADD COLUMN "candidate_agent_version" varchar(16);--> statement-breakpoint
ALTER TABLE "agent_review_candidates" ADD COLUMN "candidate_reason_schema_version" varchar(16);--> statement-breakpoint
ALTER TABLE "agent_current_runs" ADD CONSTRAINT "agent_current_runs_run_id_agent_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."agent_runs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_run_candidates" ADD CONSTRAINT "agent_run_candidates_run_id_agent_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."agent_runs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agent_current_runs_run_unique" ON "agent_current_runs" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "agent_run_candidates_candidate_idx" ON "agent_run_candidates" USING btree ("candidate_key","run_id");--> statement-breakpoint
ALTER TABLE "agent_review_candidates" ADD CONSTRAINT "agent_review_candidates_run_id_agent_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."agent_runs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_queue_decisions_reviewer_occurrence_idx" ON "agent_queue_decisions" USING btree ("occurrence_key","decided_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agent_review_candidates_candidate_occurrence_unique" ON "agent_review_candidates" USING btree ("candidate_key","occurrence_key");--> statement-breakpoint
ALTER TABLE "agent_run_candidates" ADD CONSTRAINT "agent_run_candidates_candidate_key_occurrence_key_agent_review_candidates_candidate_key_occurrence_key_fk" FOREIGN KEY ("candidate_key","occurrence_key") REFERENCES "public"."agent_review_candidates"("candidate_key","occurrence_key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "agent_queue_decisions" decision
		LEFT JOIN "agent_review_candidates" candidate
			ON candidate."candidate_key" = decision."candidate_key"
			AND candidate."occurrence_key" = decision."occurrence_key"
		WHERE candidate."occurrence_key" IS NULL
	) THEN
		RAISE EXCEPTION 'Release B1 found a legacy agent decision without its exact candidate occurrence. Preserve and review that audit row before retrying migration 0020.'
			USING ERRCODE = '23503';
	END IF;
END;
$$;--> statement-breakpoint
ALTER TABLE "agent_queue_decisions" ADD CONSTRAINT "agent_queue_decisions_candidate_key_occurrence_key_agent_review_candidates_candidate_key_occurrence_key_fk" FOREIGN KEY ("candidate_key","occurrence_key") REFERENCES "public"."agent_review_candidates"("candidate_key","occurrence_key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM "agent_queue_decisions"
		WHERE nullif(btrim("explanation"), '') IS NULL
	) THEN
		RAISE EXCEPTION 'Release B1 cannot require explanations while legacy agent decisions still have no explanation. Review those decisions explicitly before retrying migration 0020.'
			USING ERRCODE = '23514';
	END IF;
END;
$$;--> statement-breakpoint
ALTER TABLE "agent_queue_decisions" ADD CONSTRAINT "agent_queue_decisions_explanation" CHECK (nullif(btrim("agent_queue_decisions"."explanation"), '') is not null) NOT VALID;--> statement-breakpoint
ALTER TABLE "agent_queue_decisions" VALIDATE CONSTRAINT "agent_queue_decisions_explanation";--> statement-breakpoint
ALTER TABLE "agent_review_candidates" ADD CONSTRAINT "agent_review_candidates_evidence_digest" CHECK ("agent_review_candidates"."evidence_digest" is null or "agent_review_candidates"."evidence_digest" ~ '^[0-9a-f]{64}$');--> statement-breakpoint

CREATE FUNCTION "rnawiki_reject_agent_memory_mutation"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	RAISE EXCEPTION '% is an immutable append-only agent-memory record', TG_TABLE_NAME
		USING ERRCODE = '55000';
END;
$$;--> statement-breakpoint

CREATE TRIGGER "agent_runs_immutable"
BEFORE UPDATE OR DELETE ON "agent_runs"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_reject_agent_memory_mutation"();--> statement-breakpoint

CREATE TRIGGER "agent_run_candidates_immutable"
BEFORE UPDATE OR DELETE ON "agent_run_candidates"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_reject_agent_memory_mutation"();--> statement-breakpoint

CREATE TRIGGER "agent_queue_decisions_immutable"
BEFORE UPDATE OR DELETE ON "agent_queue_decisions"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_reject_agent_memory_mutation"();--> statement-breakpoint

CREATE FUNCTION "rnawiki_protect_agent_candidate_occurrence"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	IF TG_OP = 'DELETE' THEN
		RAISE EXCEPTION '% is an immutable agent occurrence', TG_TABLE_NAME
			USING ERRCODE = '55000';
	END IF;
	IF (to_jsonb(NEW) - 'last_seen_at') IS DISTINCT FROM (to_jsonb(OLD) - 'last_seen_at')
		OR NEW.last_seen_at < OLD.last_seen_at THEN
		RAISE EXCEPTION '% permits only a monotonic last_seen_at update', TG_TABLE_NAME
			USING ERRCODE = '55000';
	END IF;
	RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER "agent_review_candidates_occurrence_immutable"
BEFORE UPDATE OR DELETE ON "agent_review_candidates"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_protect_agent_candidate_occurrence"();
