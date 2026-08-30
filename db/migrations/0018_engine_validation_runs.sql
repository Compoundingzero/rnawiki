CREATE TYPE "public"."engine_run_status" AS ENUM('PASSED', 'FAILED');--> statement-breakpoint
CREATE TABLE "engine_validation_runs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"subject_type" varchar(24) NOT NULL,
	"subject_id" varchar(160) NOT NULL,
	"engine_family" varchar(32) NOT NULL,
	"engine_version" varchar(48) NOT NULL,
	"input_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"input_digest" varchar(64) NOT NULL,
	"corpus_version" varchar(64) NOT NULL,
	"status" "engine_run_status" NOT NULL,
	"passed" boolean NOT NULL,
	"finding_count" integer DEFAULT 0 NOT NULL,
	"operation" varchar(64) NOT NULL,
	"validated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_at" timestamp with time zone,
	CONSTRAINT "engine_validation_runs_digest" CHECK ("engine_validation_runs"."input_digest_algorithm" = 'sha256' and "engine_validation_runs"."input_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "engine_validation_runs_status_agrees" CHECK (("engine_validation_runs"."status" = 'PASSED') = "engine_validation_runs"."passed"),
	CONSTRAINT "engine_validation_runs_finding_count" CHECK ("engine_validation_runs"."finding_count" >= 0 and ("engine_validation_runs"."passed" or "engine_validation_runs"."finding_count" > 0))
);
--> statement-breakpoint
ALTER TABLE "engine_findings" ADD COLUMN "run_id" varchar(64);--> statement-breakpoint
CREATE UNIQUE INDEX "engine_validation_runs_identity" ON "engine_validation_runs" USING btree ("subject_type","subject_id","engine_family","engine_version","input_digest");--> statement-breakpoint
CREATE INDEX "engine_validation_runs_subject_idx" ON "engine_validation_runs" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "engine_validation_runs_status_idx" ON "engine_validation_runs" USING btree ("status","validated_at");--> statement-breakpoint
CREATE INDEX "engine_findings_run_idx" ON "engine_findings" USING btree ("run_id");