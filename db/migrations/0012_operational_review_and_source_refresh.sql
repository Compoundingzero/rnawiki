-- RNAWiki operational review, contribution accounting, and parser-exact source refresh.
--
-- Rollback notes: physician decisions, feedback resolutions, account-role events, source deltas,
-- and accepted/rejected contribution counters are audit-bearing records. Export them before any
-- rollback. This migration does not invent or rewrite scientific prose; registry deltas that need
-- interpretation stop at NEEDS_SCIENTIFIC_REVISION.
CREATE TYPE "public"."source_refresh_action" AS ENUM('CANONICAL_REFRESH', 'NEEDS_SCIENTIFIC_REVISION');--> statement-breakpoint
-- PostgreSQL cannot consume an ALTER TYPE ... ADD VALUE later in the same migration transaction.
-- Replace this one-column enum transactionally so the new value is available to constraints,
-- indexes, and trigger functions below on both a clean install and an 0011 upgrade.
ALTER TABLE "programme_contribution_proposals" DROP CONSTRAINT "programme_contributions_node_target_shape";--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" DROP CONSTRAINT "programme_contributions_submitted_target_type";--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" DROP CONSTRAINT "programme_contributions_verdict_baseline_shape";--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" DROP CONSTRAINT "programme_contributions_source_review_shape";--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" DROP CONSTRAINT "programme_contributions_stopped_verdict_proposal_shape";--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" DROP CONSTRAINT "programme_contributions_submitted_replacement_shape";--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" DROP CONSTRAINT "programme_contributions_submitted_complete";--> statement-breakpoint
ALTER TYPE "public"."contribution_proposal_type" RENAME TO "contribution_proposal_type_0011";--> statement-breakpoint
CREATE TYPE "public"."contribution_proposal_type" AS ENUM('CORRECTION', 'VERDICT_CHALLENGE', 'SOURCE_REFRESH');--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ALTER COLUMN "proposal_type"
	TYPE "public"."contribution_proposal_type"
	USING "proposal_type"::text::"public"."contribution_proposal_type";--> statement-breakpoint
DROP TYPE "public"."contribution_proposal_type_0011";--> statement-breakpoint
CREATE TABLE "account_role_events" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"target_user_id" varchar(64) NOT NULL,
	"actor_user_id" varchar(64) NOT NULL,
	"action" varchar(32) NOT NULL,
	"previous_is_admin" boolean NOT NULL,
	"next_is_admin" boolean NOT NULL,
	"previous_trust_tier" "trust_tier" NOT NULL,
	"next_trust_tier" "trust_tier" NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_role_events_action" CHECK ("account_role_events"."action" = 'BOOTSTRAP_ADMIN'),
	CONSTRAINT "account_role_events_bootstrap_shape" CHECK ("account_role_events"."actor_user_id" = "account_role_events"."target_user_id"
        and not "account_role_events"."previous_is_admin"
        and "account_role_events"."next_is_admin"
        and "account_role_events"."previous_trust_tier" = "account_role_events"."next_trust_tier"
        and nullif(btrim("account_role_events"."reason"), '') is not null)
);
--> statement-breakpoint
CREATE TABLE "evidence_review_task_source_deltas" (
	"review_task_id" varchar(64) PRIMARY KEY NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"baseline_snapshot_id" varchar(64) NOT NULL,
	"pending_snapshot_id" varchar(64) NOT NULL,
	"adapter_key" varchar(120) NOT NULL,
	"schema_version" varchar(64) DEFAULT 'rna-intelligence/source-refresh-delta-v1' NOT NULL,
	"action" "source_refresh_action" NOT NULL,
	"changed_trial_fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"affected_claim_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"affected_interpretability" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"affected_surface_paths" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"scientific_revision_requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"delta_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"delta_digest" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evidence_review_task_source_deltas_distinct_snapshots" CHECK ("evidence_review_task_source_deltas"."baseline_snapshot_id" <> "evidence_review_task_source_deltas"."pending_snapshot_id"),
	CONSTRAINT "evidence_review_task_source_deltas_schema" CHECK ("evidence_review_task_source_deltas"."schema_version" = 'rna-intelligence/source-refresh-delta-v1'),
	CONSTRAINT "evidence_review_task_source_deltas_json_shape" CHECK (jsonb_typeof("evidence_review_task_source_deltas"."changed_trial_fields") = 'array'
        and jsonb_array_length("evidence_review_task_source_deltas"."changed_trial_fields") > 0
        and jsonb_typeof("evidence_review_task_source_deltas"."affected_claim_ids") = 'array'
        and jsonb_typeof("evidence_review_task_source_deltas"."affected_interpretability") = 'array'
        and jsonb_typeof("evidence_review_task_source_deltas"."affected_surface_paths") = 'array'
        and jsonb_typeof("evidence_review_task_source_deltas"."scientific_revision_requirements") = 'array'),
	CONSTRAINT "evidence_review_task_source_deltas_action_shape" CHECK (("evidence_review_task_source_deltas"."action" = 'CANONICAL_REFRESH' and jsonb_array_length("evidence_review_task_source_deltas"."scientific_revision_requirements") = 0)
        or ("evidence_review_task_source_deltas"."action" = 'NEEDS_SCIENTIFIC_REVISION' and jsonb_array_length("evidence_review_task_source_deltas"."scientific_revision_requirements") > 0)),
	CONSTRAINT "evidence_review_task_source_deltas_digest" CHECK ("evidence_review_task_source_deltas"."delta_digest_algorithm" = 'sha256' and "evidence_review_task_source_deltas"."delta_digest" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "physician_verification_requests" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"professional_full_name" varchar(160) NOT NULL,
	"work_email" varchar(320) NOT NULL,
	"medical_license_or_npi" varchar(64) NOT NULL,
	"medical_specialty" varchar(120) NOT NULL,
	"institution" varchar(200) NOT NULL,
	"status" "doctor_verification_state" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	"decided_by_user_id" varchar(64),
	"decision_reason" text,
	CONSTRAINT "physician_verification_status" CHECK ("physician_verification_requests"."status" in ('pending', 'verified', 'rejected')),
	CONSTRAINT "physician_verification_submitted_identity" CHECK (nullif(btrim("physician_verification_requests"."professional_full_name"), '') is not null
        and nullif(btrim("physician_verification_requests"."work_email"), '') is not null
        and nullif(btrim("physician_verification_requests"."medical_license_or_npi"), '') is not null
        and nullif(btrim("physician_verification_requests"."medical_specialty"), '') is not null
        and nullif(btrim("physician_verification_requests"."institution"), '') is not null),
	CONSTRAINT "physician_verification_decision_shape" CHECK (("physician_verification_requests"."status" = 'pending'
          and "physician_verification_requests"."decided_at" is null
          and "physician_verification_requests"."decided_by_user_id" is null
          and "physician_verification_requests"."decision_reason" is null)
        or ("physician_verification_requests"."status" in ('verified', 'rejected')
          and "physician_verification_requests"."decided_at" is not null
          and "physician_verification_requests"."decided_by_user_id" is not null
          and nullif(btrim("physician_verification_requests"."decision_reason"), '') is not null))
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "resolved_by_user_id" varchar(64);--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "resolution_note" text;--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD COLUMN "source_refresh_delta_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "account_role_events" ADD CONSTRAINT "account_role_events_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_role_events" ADD CONSTRAINT "account_role_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD CONSTRAINT "evidence_review_tasks_source_delta_identity_unique" UNIQUE("id","programme_id","source_id","trigger_snapshot_id");--> statement-breakpoint
ALTER TABLE "evidence_review_task_source_deltas" ADD CONSTRAINT "evidence_review_task_source_deltas_task_identity_fk" FOREIGN KEY ("review_task_id","programme_id","source_id","pending_snapshot_id") REFERENCES "public"."evidence_review_tasks"("id","programme_id","source_id","trigger_snapshot_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_review_task_source_deltas" ADD CONSTRAINT "evidence_review_task_source_deltas_freshness_fk" FOREIGN KEY ("programme_id","source_id") REFERENCES "public"."programme_freshness_states"("programme_id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_review_task_source_deltas" ADD CONSTRAINT "evidence_review_task_source_deltas_baseline_source_fk" FOREIGN KEY ("baseline_snapshot_id","source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_review_task_source_deltas" ADD CONSTRAINT "evidence_review_task_source_deltas_pending_source_fk" FOREIGN KEY ("pending_snapshot_id","source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "physician_verification_requests" ADD CONSTRAINT "physician_verification_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "physician_verification_requests" ADD CONSTRAINT "physician_verification_requests_decided_by_user_id_users_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_role_events_target_idx" ON "account_role_events" USING btree ("target_user_id","created_at");--> statement-breakpoint
CREATE INDEX "account_role_events_actor_idx" ON "account_role_events" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "evidence_review_task_source_deltas_programme_action_idx" ON "evidence_review_task_source_deltas" USING btree ("programme_id","action","created_at");--> statement-breakpoint
CREATE INDEX "evidence_review_task_source_deltas_source_created_idx" ON "evidence_review_task_source_deltas" USING btree ("source_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "physician_verification_one_pending_per_user" ON "physician_verification_requests" USING btree ("user_id") WHERE "physician_verification_requests"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "physician_verification_queue_idx" ON "physician_verification_requests" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "physician_verification_decider_idx" ON "physician_verification_requests" USING btree ("decided_by_user_id","decided_at");--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_resolved_by_user_id_users_id_fk" FOREIGN KEY ("resolved_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_resolution_queue_idx" ON "feedback" USING btree ("resolved","created_at");--> statement-breakpoint
CREATE INDEX "programme_contributions_source_refresh_queue_idx" ON "programme_contribution_proposals" USING btree ("programme_id","status","submitted_at") WHERE "programme_contribution_proposals"."proposal_type" = 'SOURCE_REFRESH';--> statement-breakpoint
-- A pre-0012 `resolved=true` row has no actor, time, or reason and therefore cannot honestly be
-- represented as an audited resolution. Reopen it for review instead of inventing those facts.
UPDATE feedback
SET resolved = false,
    resolved_at = NULL,
    resolved_by_user_id = NULL,
    resolution_note = NULL
WHERE resolved;--> statement-breakpoint
-- The former route discarded professional name and workplace email, so no pre-0012 decision can
-- satisfy the complete audit contract. Remove the old badge state and ask for a fresh submission;
-- do not invent the missing identity fields or silently preserve/grant/reject a badge.
UPDATE users
SET verification_state = 'none',
    verified_at = NULL,
    verification_note = 'Credential resubmission required after the auditable review workflow upgrade.'
WHERE verification_state <> 'none';--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_resolution_shape" CHECK ((not "feedback"."resolved"
          and "feedback"."resolved_at" is null
          and "feedback"."resolved_by_user_id" is null
          and "feedback"."resolution_note" is null)
        or ("feedback"."resolved"
          and "feedback"."resolved_at" is not null
          and "feedback"."resolved_by_user_id" is not null
          and nullif(btrim("feedback"."resolution_note"), '') is not null));--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contributions_source_refresh_shape" CHECK ((
          "programme_contribution_proposals"."proposal_type" = 'SOURCE_REFRESH'
          and "programme_contribution_proposals"."source_refresh_delta_snapshot" is not null
          and jsonb_typeof("programme_contribution_proposals"."source_refresh_delta_snapshot") = 'object'
          and "programme_contribution_proposals"."selected_field" is null
          and nullif(btrim("programme_contribution_proposals"."proposed_text"), '') is null
          and "programme_contribution_proposals"."proposed_value" is null
          and "programme_contribution_proposals"."evidence_node_id" is null
          and "programme_contribution_proposals"."proposed_stopped_verdict" is null
          and "programme_contribution_proposals"."claim_nature" is null
          and nullif(btrim("programme_contribution_proposals"."reasoning"), '') is null
          and nullif(btrim("programme_contribution_proposals"."what_was_wrong_or_missing"), '') is null
          and "programme_contribution_proposals"."affects" is null
          and "programme_contribution_proposals"."current_value_snapshot" is null
          and "programme_contribution_proposals"."source_review_task_id" is not null
          and "programme_contribution_proposals"."source_review_snapshot_id" is not null
        ) or (
          "programme_contribution_proposals"."proposal_type" <> 'SOURCE_REFRESH'
          and "programme_contribution_proposals"."source_refresh_delta_snapshot" is null
        ));--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contributions_node_target_shape" CHECK ("programme_contribution_proposals"."status" <> 'SUBMITTED'
        or ("programme_contribution_proposals"."proposal_type" = 'VERDICT_CHALLENGE' and "programme_contribution_proposals"."evidence_node_id" is not null)
        or ("programme_contribution_proposals"."proposal_type" = 'CORRECTION' and "programme_contribution_proposals"."selected_field"::text like 'evidenceNode.%' and "programme_contribution_proposals"."evidence_node_id" is not null)
        or ("programme_contribution_proposals"."proposal_type" = 'CORRECTION' and "programme_contribution_proposals"."selected_field"::text not like 'evidenceNode.%' and "programme_contribution_proposals"."evidence_node_id" is null)
        or ("programme_contribution_proposals"."proposal_type" = 'SOURCE_REFRESH' and "programme_contribution_proposals"."evidence_node_id" is null));--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contributions_submitted_target_type" CHECK ("programme_contribution_proposals"."status" <> 'SUBMITTED'
        or ("programme_contribution_proposals"."proposal_type" = 'CORRECTION' and ("programme_contribution_proposals"."selected_field"::text like 'programme.%' or "programme_contribution_proposals"."selected_field"::text like 'evidenceNode.%'))
        or ("programme_contribution_proposals"."proposal_type" = 'VERDICT_CHALLENGE' and ("programme_contribution_proposals"."selected_field"::text like 'summary.%' or "programme_contribution_proposals"."selected_field"::text like 'verdict.%'))
        or ("programme_contribution_proposals"."proposal_type" = 'SOURCE_REFRESH' and "programme_contribution_proposals"."selected_field" is null));--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contributions_verdict_baseline_shape" CHECK ((("programme_contribution_proposals"."current_verdict_revision_id" is null and "programme_contribution_proposals"."current_verdict_snapshot" is null)
        or ("programme_contribution_proposals"."current_verdict_revision_id" is not null and "programme_contribution_proposals"."current_verdict_snapshot" is not null))
        and ("programme_contribution_proposals"."status" <> 'SUBMITTED' or "programme_contribution_proposals"."proposal_type" not in ('VERDICT_CHALLENGE', 'SOURCE_REFRESH') or "programme_contribution_proposals"."current_verdict_revision_id" is not null));--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contributions_source_review_shape" CHECK ((("programme_contribution_proposals"."source_review_task_id" is null and "programme_contribution_proposals"."source_review_snapshot_id" is null)
        or ("programme_contribution_proposals"."source_review_task_id" is not null and "programme_contribution_proposals"."source_review_snapshot_id" is not null))
        and ("programme_contribution_proposals"."proposal_type" <> 'SOURCE_REFRESH' or "programme_contribution_proposals"."source_review_task_id" is not null));--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contributions_stopped_verdict_proposal_shape" CHECK ("programme_contribution_proposals"."status" <> 'SUBMITTED' or (
        ("programme_contribution_proposals"."proposal_type" = 'SOURCE_REFRESH'
          and "programme_contribution_proposals"."selected_field" is null
          and "programme_contribution_proposals"."proposed_stopped_verdict" is null)
        or ("programme_contribution_proposals"."selected_field" = 'verdict.verdictCode'
          and "programme_contribution_proposals"."proposal_type" = 'VERDICT_CHALLENGE'
          and "programme_contribution_proposals"."proposed_stopped_verdict" is not null
          and nullif(btrim("programme_contribution_proposals"."proposed_text"), '') is null
          and "programme_contribution_proposals"."proposed_value" is null)
        or ("programme_contribution_proposals"."selected_field" <> 'verdict.verdictCode' and "programme_contribution_proposals"."proposed_stopped_verdict" is null)
      ));--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contributions_submitted_replacement_shape" CHECK ("programme_contribution_proposals"."status" <> 'SUBMITTED' or (
        ("programme_contribution_proposals"."proposal_type" = 'SOURCE_REFRESH'
          and "programme_contribution_proposals"."selected_field" is null
          and nullif(btrim("programme_contribution_proposals"."proposed_text"), '') is null
          and "programme_contribution_proposals"."proposed_value" is null
          and "programme_contribution_proposals"."proposed_stopped_verdict" is null)
        or ("programme_contribution_proposals"."selected_field" in ('verdict.whatWasDisproven', 'verdict.whatWasNotDisproven', 'verdict.whatRemainsUnknown', 'verdict.conditionsThatWouldChangeVerdict')
          and nullif(btrim("programme_contribution_proposals"."proposed_text"), '') is null
          and jsonb_typeof("programme_contribution_proposals"."proposed_value") = 'array'
          and jsonb_array_length("programme_contribution_proposals"."proposed_value") > 0
          and "programme_contribution_proposals"."proposed_stopped_verdict" is null)
        or ("programme_contribution_proposals"."selected_field" in ('programme.status', 'programme.stoppingReasonCategory', 'verdict.confidence', 'evidenceNode.state')
          and nullif(btrim("programme_contribution_proposals"."proposed_text"), '') is null
          and jsonb_typeof("programme_contribution_proposals"."proposed_value") = 'string'
          and nullif(btrim("programme_contribution_proposals"."proposed_value" #>> '{}'), '') is not null
          and "programme_contribution_proposals"."proposed_stopped_verdict" is null)
        or ("programme_contribution_proposals"."selected_field" = 'verdict.verdictCode'
          and nullif(btrim("programme_contribution_proposals"."proposed_text"), '') is null
          and "programme_contribution_proposals"."proposed_value" is null
          and "programme_contribution_proposals"."proposed_stopped_verdict" is not null)
        or ("programme_contribution_proposals"."selected_field" not in ('verdict.whatWasDisproven', 'verdict.whatWasNotDisproven', 'verdict.whatRemainsUnknown', 'verdict.conditionsThatWouldChangeVerdict', 'programme.status', 'programme.stoppingReasonCategory', 'verdict.confidence', 'evidenceNode.state', 'verdict.verdictCode')
          and nullif(btrim("programme_contribution_proposals"."proposed_text"), '') is not null
          and "programme_contribution_proposals"."proposed_value" is null
          and "programme_contribution_proposals"."proposed_stopped_verdict" is null)
      ));--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contributions_submitted_complete" CHECK ("programme_contribution_proposals"."status" <> 'SUBMITTED' or (
        "programme_contribution_proposals"."proposal_type" <> 'SOURCE_REFRESH'
        and "programme_contribution_proposals"."selected_field" is not null
        and ("programme_contribution_proposals"."proposed_text" is not null or "programme_contribution_proposals"."proposed_value" is not null or "programme_contribution_proposals"."proposed_stopped_verdict" is not null)
        and "programme_contribution_proposals"."source_type" is not null
        and nullif(btrim("programme_contribution_proposals"."source_locator"), '') is not null
        and nullif(btrim("programme_contribution_proposals"."source_identifier"), '') is not null
        and "programme_contribution_proposals"."claim_nature" is not null
        and nullif(btrim("programme_contribution_proposals"."reasoning"), '') is not null
        and nullif(btrim("programme_contribution_proposals"."what_was_wrong_or_missing"), '') is not null
        and "programme_contribution_proposals"."affects" is not null
        and nullif(btrim("programme_contribution_proposals"."conflicts_of_interest"), '') is not null
        and "programme_contribution_proposals"."conflicts_of_interest_attested"
        and "programme_contribution_proposals"."current_value_snapshot" is not null
        and "programme_contribution_proposals"."machine_checks" is not null
        and "programme_contribution_proposals"."impact_preview" is not null
        and "programme_contribution_proposals"."content_digest" is not null
        and "programme_contribution_proposals"."submitted_at" is not null
      ) or (
        "programme_contribution_proposals"."proposal_type" = 'SOURCE_REFRESH'
        and "programme_contribution_proposals"."source_type" = 'CLINICAL_TRIAL_REGISTRY'
        and nullif(btrim("programme_contribution_proposals"."source_locator"), '') is not null
        and nullif(btrim("programme_contribution_proposals"."source_identifier"), '') is not null
        and "programme_contribution_proposals"."source_review_task_id" is not null
        and "programme_contribution_proposals"."source_review_snapshot_id" is not null
        and "programme_contribution_proposals"."source_refresh_delta_snapshot" is not null
        and nullif(btrim("programme_contribution_proposals"."conflicts_of_interest"), '') is not null
        and "programme_contribution_proposals"."conflicts_of_interest_attested"
        and "programme_contribution_proposals"."current_verdict_revision_id" is not null
        and "programme_contribution_proposals"."current_verdict_snapshot" is not null
        and "programme_contribution_proposals"."machine_checks" is not null
        and "programme_contribution_proposals"."impact_preview" is not null
        and "programme_contribution_proposals"."content_digest" is not null
        and "programme_contribution_proposals"."submitted_at" is not null
      ));

-- ---------------------------------------------------------------------------
-- Private physician-verification workflow.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION rnawiki_guard_physician_verification_request()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  actor users%ROWTYPE;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'physician verification requests are immutable audit records';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'pending'::doctor_verification_state
       OR NEW.decided_at IS NOT NULL
       OR NEW.decided_by_user_id IS NOT NULL
       OR NEW.decision_reason IS NOT NULL THEN
      RAISE EXCEPTION USING
        ERRCODE = '23514',
        MESSAGE = 'a physician verification request must begin pending without a decision';
    END IF;
    NEW.submitted_at := clock_timestamp();
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.professional_full_name IS DISTINCT FROM OLD.professional_full_name
     OR NEW.work_email IS DISTINCT FROM OLD.work_email
     OR NEW.medical_license_or_npi IS DISTINCT FROM OLD.medical_license_or_npi
     OR NEW.medical_specialty IS DISTINCT FROM OLD.medical_specialty
     OR NEW.institution IS DISTINCT FROM OLD.institution
     OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'submitted physician identity and credentials are immutable';
  END IF;
  IF OLD.status IS DISTINCT FROM 'pending'::doctor_verification_state
     OR NEW.status NOT IN ('verified', 'rejected') THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'a physician verification request may be decided only once';
  END IF;
  IF NEW.decided_by_user_id IS NULL
     OR NEW.decided_by_user_id = OLD.user_id
     OR nullif(btrim(NEW.decision_reason), '') IS NULL
     OR char_length(btrim(NEW.decision_reason)) NOT BETWEEN 8 AND 2000 THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'a physician decision requires an independent reviewer and a reason';
  END IF;

  SELECT * INTO actor FROM users WHERE id = NEW.decided_by_user_id FOR SHARE;
  IF NOT FOUND OR NOT (actor.is_admin OR actor.trust_tier = 'steward') THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'only a steward or administrator can decide physician credentials';
  END IF;

  NEW.decided_at := clock_timestamp();
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER physician_verification_requests_guard_trigger
BEFORE INSERT OR UPDATE OR DELETE ON physician_verification_requests
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_physician_verification_request();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_physician_account_state()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  latest_request physician_verification_requests%ROWTYPE;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_doctor
       OR NEW.medical_license_or_npi IS NOT NULL
       OR NEW.medical_specialty IS NOT NULL
       OR NEW.institution IS NOT NULL
       OR NEW.verification_state IS DISTINCT FROM 'none'::doctor_verification_state
       OR NEW.verified_at IS NOT NULL
       OR NEW.verification_note IS NOT NULL THEN
      RAISE EXCEPTION USING
        ERRCODE = '23514',
        MESSAGE = 'a new account cannot create its own physician credential state';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.verification_state = 'none'::doctor_verification_state THEN
    IF NEW.is_doctor
       OR NEW.medical_license_or_npi IS NOT NULL
       OR NEW.medical_specialty IS NOT NULL
       OR NEW.institution IS NOT NULL
       OR NEW.verified_at IS NOT NULL
       OR NEW.verification_note IS NOT NULL THEN
      RAISE EXCEPTION USING
        ERRCODE = '23514',
        MESSAGE = 'an unverified account cannot carry physician credential state';
    END IF;
    RETURN NEW;
  END IF;

  SELECT * INTO latest_request
  FROM physician_verification_requests request
  WHERE request.user_id = NEW.id
  ORDER BY request.submitted_at DESC, request.id DESC
  LIMIT 1;

  IF NOT FOUND
     OR NOT NEW.is_doctor
     OR NEW.verification_state IS DISTINCT FROM latest_request.status
     OR NEW.medical_license_or_npi IS DISTINCT FROM latest_request.medical_license_or_npi
     OR NEW.medical_specialty IS DISTINCT FROM latest_request.medical_specialty
     OR NEW.institution IS DISTINCT FROM latest_request.institution
     OR (
       latest_request.status = 'verified'::doctor_verification_state
       AND NEW.verified_at IS DISTINCT FROM latest_request.decided_at
     )
     OR (
       latest_request.status <> 'verified'::doctor_verification_state
       AND NEW.verified_at IS NOT NULL
     )
     OR (
       latest_request.status = 'pending'::doctor_verification_state
       AND NEW.verification_note IS NOT NULL
     )
     OR (
       latest_request.status <> 'pending'::doctor_verification_state
       AND NEW.verification_note IS DISTINCT FROM latest_request.decision_reason
     ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'physician account state must match the latest immutable credential request';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER users_physician_verification_guard_trigger
BEFORE INSERT OR UPDATE OF is_doctor, medical_license_or_npi, medical_specialty, institution,
  verification_state, verified_at, verification_note ON users
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_physician_account_state();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_sync_physician_verification_account()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users
  SET is_doctor = true,
      medical_license_or_npi = NEW.medical_license_or_npi,
      medical_specialty = NEW.medical_specialty,
      institution = NEW.institution,
      verification_state = NEW.status,
      verified_at = CASE WHEN NEW.status = 'verified' THEN NEW.decided_at ELSE NULL END,
      verification_note = NEW.decision_reason
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER physician_verification_requests_account_insert_sync_trigger
AFTER INSERT ON physician_verification_requests
FOR EACH ROW EXECUTE FUNCTION rnawiki_sync_physician_verification_account();--> statement-breakpoint

CREATE TRIGGER physician_verification_requests_account_sync_trigger
AFTER UPDATE OF status ON physician_verification_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION rnawiki_sync_physician_verification_account();--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- Private feedback-resolution workflow.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION rnawiki_guard_feedback_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  actor users%ROWTYPE;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'feedback records are append-only';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.resolved
       OR NEW.resolved_at IS NOT NULL
       OR NEW.resolved_by_user_id IS NOT NULL
       OR NEW.resolution_note IS NOT NULL THEN
      RAISE EXCEPTION USING
        ERRCODE = '23514',
        MESSAGE = 'new feedback cannot arrive already resolved';
    END IF;
    NEW.created_at := clock_timestamp();
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.type IS DISTINCT FROM OLD.type
     OR NEW.message IS DISTINCT FROM OLD.message
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.drug_slug IS DISTINCT FROM OLD.drug_slug
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.session_hash IS DISTINCT FROM OLD.session_hash
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'submitted feedback is immutable';
  END IF;
  IF OLD.resolved OR NOT NEW.resolved THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'feedback may make exactly one open-to-resolved transition';
  END IF;
  IF NEW.resolved_by_user_id IS NULL
     OR nullif(btrim(NEW.resolution_note), '') IS NULL
     OR char_length(btrim(NEW.resolution_note)) NOT BETWEEN 8 AND 2000 THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'feedback resolution requires a reviewer and an explanatory note';
  END IF;

  SELECT * INTO actor FROM users WHERE id = NEW.resolved_by_user_id FOR SHARE;
  IF NOT FOUND OR NOT (actor.is_admin OR actor.trust_tier = 'steward') THEN
    RAISE EXCEPTION USING
      ERRCODE = '42501',
      MESSAGE = 'only a steward or administrator can resolve feedback';
  END IF;

  NEW.resolved_at := clock_timestamp();
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER feedback_transition_guard_trigger
BEFORE INSERT OR UPDATE OR DELETE ON feedback
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_feedback_transition();--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- One-time first-administrator bootstrap ledger.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION rnawiki_guard_account_role_event()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target users%ROWTYPE;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'account role events are append-only';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('rnawiki:first-admin-bootstrap', 0));
  IF EXISTS (SELECT 1 FROM users WHERE is_admin)
     OR EXISTS (SELECT 1 FROM account_role_events WHERE action = 'BOOTSTRAP_ADMIN') THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'the one-time administrator bootstrap path is closed';
  END IF;

  SELECT * INTO target FROM users WHERE id = NEW.target_user_id FOR UPDATE;
  IF NOT FOUND
     OR NEW.actor_user_id IS DISTINCT FROM target.id
     OR target.is_admin
     OR NEW.action IS DISTINCT FROM 'BOOTSTRAP_ADMIN'
     OR NEW.previous_is_admin
     OR NOT NEW.next_is_admin
     OR NEW.previous_trust_tier IS DISTINCT FROM target.trust_tier
     OR NEW.next_trust_tier IS DISTINCT FROM target.trust_tier
     OR nullif(btrim(NEW.reason), '') IS NULL
     OR char_length(btrim(NEW.reason)) NOT BETWEEN 8 AND 500 THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'administrator bootstrap event does not match the existing target account';
  END IF;

  NEW.created_at := clock_timestamp();
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER account_role_events_guard_trigger
BEFORE INSERT OR UPDATE OR DELETE ON account_role_events
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_account_role_event();--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- Exact normalized contribution accounting. Counts never confer trust or qualifications.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION rnawiki_expected_user_contribution_counts(target_user_id varchar)
RETURNS TABLE(accepted_count integer, rejected_count integer)
LANGUAGE sql
STABLE
STRICT
AS $$
  SELECT
    count(*) FILTER (WHERE state.status = 'ACCEPTED_FOR_IMPLEMENTATION')::integer,
    count(*) FILTER (WHERE state.status = 'REJECTED')::integer
  FROM programme_contribution_proposals proposal
  JOIN programme_contribution_review_states state ON state.proposal_id = proposal.id
  WHERE proposal.author_user_id = target_user_id
$$;--> statement-breakpoint

UPDATE users account
SET accepted_edit_count = (
      SELECT count(*)::integer
      FROM programme_contribution_proposals proposal
      JOIN programme_contribution_review_states state ON state.proposal_id = proposal.id
      WHERE proposal.author_user_id = account.id
        AND state.status = 'ACCEPTED_FOR_IMPLEMENTATION'
    ),
    rejected_edit_count = (
      SELECT count(*)::integer
      FROM programme_contribution_proposals proposal
      JOIN programme_contribution_review_states state ON state.proposal_id = proposal.id
      WHERE proposal.author_user_id = account.id
        AND state.status = 'REJECTED'
    );--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_user_contribution_counts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  expected_accepted integer;
  expected_rejected integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    expected_accepted := 0;
    expected_rejected := 0;
  ELSE
    SELECT accepted_count, rejected_count
    INTO expected_accepted, expected_rejected
    FROM rnawiki_expected_user_contribution_counts(NEW.id);
  END IF;

  IF NEW.accepted_edit_count IS DISTINCT FROM expected_accepted
     OR NEW.rejected_edit_count IS DISTINCT FROM expected_rejected THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'contribution counters must equal normalized terminal review states';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER users_contribution_counts_guard_trigger
BEFORE INSERT OR UPDATE OF accepted_edit_count, rejected_edit_count ON users
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_user_contribution_counts();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_refresh_user_contribution_counts(target_user_id varchar)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  expected_accepted integer;
  expected_rejected integer;
BEGIN
  SELECT accepted_count, rejected_count
  INTO expected_accepted, expected_rejected
  FROM rnawiki_expected_user_contribution_counts(target_user_id);

  UPDATE users
  SET accepted_edit_count = expected_accepted,
      rejected_edit_count = expected_rejected
  WHERE id = target_user_id;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_sync_user_contribution_counts_from_state()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target_author_id varchar;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT author_user_id INTO target_author_id
    FROM programme_contribution_proposals
    WHERE id = OLD.proposal_id;
  ELSE
    SELECT author_user_id INTO target_author_id
    FROM programme_contribution_proposals
    WHERE id = NEW.proposal_id;
  END IF;
  IF target_author_id IS NOT NULL THEN
    PERFORM rnawiki_refresh_user_contribution_counts(target_author_id);
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER programme_contribution_review_states_accounting_trigger
AFTER INSERT OR UPDATE OF status OR DELETE ON programme_contribution_review_states
FOR EACH ROW EXECUTE FUNCTION rnawiki_sync_user_contribution_counts_from_state();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_sync_user_contribution_counts_after_proposal_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM rnawiki_refresh_user_contribution_counts(OLD.author_user_id);
  RETURN OLD;
END;
$$;--> statement-breakpoint

CREATE TRIGGER programme_contributions_delete_accounting_trigger
AFTER DELETE ON programme_contribution_proposals
FOR EACH ROW EXECUTE FUNCTION rnawiki_sync_user_contribution_counts_after_proposal_delete();--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- Immutable parser-owned source delta.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION rnawiki_source_refresh_delta_payload(
  delta evidence_review_task_source_deltas
)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT jsonb_build_object(
    'version', delta.schema_version,
    'reviewTaskId', delta.review_task_id,
    'programmeId', delta.programme_id,
    'sourceId', delta.source_id,
    'baselineSnapshotId', delta.baseline_snapshot_id,
    'pendingSnapshotId', delta.pending_snapshot_id,
    'adapterKey', delta.adapter_key,
    'action', delta.action,
    'changedTrialFields', delta.changed_trial_fields,
    'affectedClaimIds', delta.affected_claim_ids,
    'affectedInterpretability', delta.affected_interpretability,
    'affectedSurfacePaths', delta.affected_surface_paths,
    'scientificRevisionRequirements', delta.scientific_revision_requirements
  )
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_source_refresh_delta_snapshot(
  delta evidence_review_task_source_deltas
)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT rnawiki_source_refresh_delta_payload(delta)
    || jsonb_build_object(
      'deltaDigestAlgorithm', delta.delta_digest_algorithm,
      'deltaDigest', delta.delta_digest
    )
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_source_refresh_delta()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  task evidence_review_tasks%ROWTYPE;
  freshness programme_freshness_states%ROWTYPE;
  source evidence_sources%ROWTYPE;
  run evidence_monitor_runs%ROWTYPE;
  lineage_is_valid boolean;
  expected_requirements jsonb;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION USING
      ERRCODE = '55000',
      MESSAGE = 'source-refresh deltas are immutable parser records';
  END IF;

  SELECT * INTO freshness
  FROM programme_freshness_states
  WHERE programme_id = NEW.programme_id AND source_id = NEW.source_id
  FOR UPDATE;
  SELECT * INTO task FROM evidence_review_tasks WHERE id = NEW.review_task_id FOR UPDATE;
  SELECT * INTO source FROM evidence_sources WHERE id = NEW.source_id FOR SHARE;
  IF task.monitor_run_id IS NOT NULL THEN
    SELECT * INTO run FROM evidence_monitor_runs WHERE id = task.monitor_run_id FOR SHARE;
  END IF;

  IF NOT FOUND
     OR task.id IS NULL
     OR freshness.programme_id IS NULL
     OR source.id IS NULL
     OR task.programme_id IS DISTINCT FROM NEW.programme_id
     OR task.source_id IS DISTINCT FROM NEW.source_id
     OR task.trigger_snapshot_id IS DISTINCT FROM NEW.pending_snapshot_id
     OR task.status NOT IN ('OPEN', 'IN_REVIEW', 'BLOCKED')
     OR freshness.current_snapshot_id IS DISTINCT FROM NEW.baseline_snapshot_id
     OR freshness.pending_snapshot_id IS DISTINCT FROM NEW.pending_snapshot_id
     OR source.source_type IS DISTINCT FROM 'CLINICAL_TRIAL_REGISTRY'
     OR NEW.adapter_key IS DISTINCT FROM 'clinicaltrials.gov/v2'
     OR run.adapter_key IS DISTINCT FROM NEW.adapter_key
     OR task.affected_claim_ids IS DISTINCT FROM NEW.affected_claim_ids
     OR task.affected_surface_paths IS DISTINCT FROM NEW.affected_surface_paths THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'source-refresh delta does not match the actionable monitor task and freshness state';
  END IF;

  WITH RECURSIVE lineage AS (
    SELECT id, previous_snapshot_id
    FROM source_snapshots
    WHERE id = NEW.pending_snapshot_id AND source_id = NEW.source_id
    UNION ALL
    SELECT parent.id, parent.previous_snapshot_id
    FROM source_snapshots parent
    JOIN lineage child ON child.previous_snapshot_id = parent.id
    WHERE parent.source_id = NEW.source_id
  )
  SELECT EXISTS (SELECT 1 FROM lineage WHERE id = NEW.baseline_snapshot_id)
  INTO lineage_is_valid;
  IF NOT lineage_is_valid THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'pending source snapshot does not descend from the accepted baseline';
  END IF;

  IF EXISTS (
       SELECT 1
       FROM jsonb_array_elements(NEW.changed_trial_fields) item
       WHERE jsonb_typeof(item) <> 'object'
          OR nullif(btrim(item ->> 'path'), '') IS NULL
          OR item ->> 'path' NOT IN (
            'trial.identifier', 'trial.overallStatus', 'trial.hasResults',
            'trial.enrollment.count', 'trial.enrollment.type', 'trial.phases',
            'trial.startDate', 'trial.primaryCompletionDate', 'trial.completionDate',
            'trial.sponsor.name', 'trial.sponsor.class', 'trial.registryRecord'
          )
          OR item ->> 'risk' NOT IN ('LOW_RISK_EXACT', 'INTERPRETIVE_REVIEW_REQUIRED')
          OR NOT (item ? 'before')
          OR NOT (item ? 'after')
     )
     OR (SELECT count(*) FROM jsonb_array_elements(NEW.changed_trial_fields))
        <> (SELECT count(DISTINCT item ->> 'path') FROM jsonb_array_elements(NEW.changed_trial_fields) item)
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(NEW.affected_claim_ids) item
       WHERE jsonb_typeof(item) <> 'string' OR nullif(btrim(item #>> '{}'), '') IS NULL
     )
     OR (SELECT count(*) FROM jsonb_array_elements(NEW.affected_claim_ids))
        <> (SELECT count(DISTINCT item #>> '{}') FROM jsonb_array_elements(NEW.affected_claim_ids) item)
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(NEW.affected_surface_paths) item
       WHERE jsonb_typeof(item) <> 'string' OR nullif(btrim(item #>> '{}'), '') IS NULL
     )
     OR (SELECT count(*) FROM jsonb_array_elements(NEW.affected_surface_paths))
        <> (SELECT count(DISTINCT item #>> '{}') FROM jsonb_array_elements(NEW.affected_surface_paths) item)
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(NEW.affected_interpretability) item
       WHERE jsonb_typeof(item) <> 'object'
          OR nullif(btrim(item ->> 'assessmentId'), '') IS NULL
          OR nullif(btrim(item ->> 'criterion'), '') IS NULL
          OR nullif(btrim(item ->> 'reasonCode'), '') IS NULL
          OR NOT EXISTS (
            SELECT 1
            FROM trial_interpretability_assessments assessment
            WHERE assessment.id = item ->> 'assessmentId'
              AND assessment.programme_id = NEW.programme_id
              AND assessment.criterion::text = item ->> 'criterion'
          )
     )
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(NEW.scientific_revision_requirements) item
       WHERE jsonb_typeof(item) <> 'object'
          OR item ->> 'kind' NOT IN (
            'CLAIM', 'INTERPRETABILITY', 'PRESENTATION', 'UNCLASSIFIED_SOURCE_CHANGE'
          )
          OR NOT (item ? 'id')
          OR nullif(btrim(item ->> 'fieldPath'), '') IS NULL
          OR nullif(btrim(item ->> 'reasonCode'), '') IS NULL
     ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'source-refresh delta contains a field outside the parser-owned normalized contract';
  END IF;

  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(NEW.affected_claim_ids) claim_id
    WHERE NOT EXISTS (
      SELECT 1 FROM claims claim
      WHERE claim.id = claim_id AND claim.programme_id = NEW.programme_id
    )
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'source-refresh delta names a claim outside the programme graph';
  END IF;

  WITH expected AS (
    SELECT jsonb_build_object(
      'kind', CASE WHEN item ->> 'path' = 'trial.registryRecord'
        THEN 'UNCLASSIFIED_SOURCE_CHANGE' ELSE 'PRESENTATION' END,
      'id', NULL,
      'fieldPath', item ->> 'path',
      'reasonCode', 'SOURCE_FIELD_NOT_NORMALIZED_EXACT'
    ) requirement
    FROM jsonb_array_elements(NEW.changed_trial_fields) item
    WHERE item ->> 'risk' = 'INTERPRETIVE_REVIEW_REQUIRED'
    UNION ALL
    SELECT jsonb_build_object(
      'kind', 'CLAIM',
      'id', claim_id,
      'fieldPath', 'claim.sourceSnapshot',
      'reasonCode', 'LINKED_CLAIM_SOURCE_CHANGED'
    )
    FROM jsonb_array_elements_text(NEW.affected_claim_ids) claim_id
    UNION ALL
    SELECT jsonb_build_object(
      'kind', 'INTERPRETABILITY',
      'id', item ->> 'assessmentId',
      'fieldPath', 'interpretability.' || (item ->> 'criterion'),
      'reasonCode', 'LINKED_CLAIM_SOURCE_CHANGED'
    )
    FROM jsonb_array_elements(NEW.affected_interpretability) item
  )
  SELECT COALESCE(
    jsonb_agg(
      requirement
      ORDER BY requirement ->> 'kind', COALESCE(requirement ->> 'id', ''), requirement ->> 'fieldPath'
    ),
    '[]'::jsonb
  ) INTO expected_requirements
  FROM expected;

  IF NEW.scientific_revision_requirements IS DISTINCT FROM expected_requirements
     OR (NEW.action = 'CANONICAL_REFRESH' AND jsonb_array_length(expected_requirements) <> 0)
     OR (NEW.action = 'NEEDS_SCIENTIFIC_REVISION' AND jsonb_array_length(expected_requirements) = 0) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'source-refresh action does not match the parser risk and revision requirements';
  END IF;

  NEW.schema_version := 'rna-intelligence/source-refresh-delta-v1';
  NEW.delta_digest_algorithm := 'sha256';
  NEW.delta_digest := rnawiki_programme_contribution_digest_payload(
    rnawiki_source_refresh_delta_payload(NEW)
  );
  NEW.created_at := clock_timestamp();
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER evidence_review_task_source_deltas_guard_trigger
BEFORE INSERT OR UPDATE OR DELETE ON evidence_review_task_source_deltas
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_source_refresh_delta();--> statement-breakpoint

-- Freeze all new contributions with the v3 payload. Existing submitted rows retain their stored
-- v1/v2 digest and are never rewritten.
CREATE OR REPLACE FUNCTION rnawiki_programme_contribution_submission_payload(
  proposal programme_contribution_proposals
)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT jsonb_build_object(
    'version', 'rna-intelligence/contribution-submission-v3',
    'proposal', jsonb_build_object(
      'id', proposal.id,
      'proposalKey', proposal.proposal_key,
      'revisionNumber', proposal.revision_number,
      'previousProposalId', proposal.previous_proposal_id,
      'programmeId', proposal.programme_id,
      'authorUserId', proposal.author_user_id,
      'proposalType', proposal.proposal_type,
      'selectedField', proposal.selected_field,
      'proposedText', proposal.proposed_text,
      'proposedValue', proposal.proposed_value,
      'sourceType', proposal.source_type,
      'sourceLocator', proposal.source_locator,
      'sourceIdentifier', proposal.source_identifier,
      'sourceReviewTaskId', proposal.source_review_task_id,
      'sourceReviewSnapshotId', proposal.source_review_snapshot_id,
      'sourceRefreshDeltaSnapshot', proposal.source_refresh_delta_snapshot,
      'claimNature', proposal.claim_nature,
      'evidenceNodeId', proposal.evidence_node_id,
      'proposedStoppedVerdict', proposal.proposed_stopped_verdict,
      'reasoning', proposal.reasoning,
      'whatWasWrongOrMissing', proposal.what_was_wrong_or_missing,
      'affects', proposal.affects,
      'conflictsOfInterest', proposal.conflicts_of_interest,
      'conflictsOfInterestAttested', proposal.conflicts_of_interest_attested
    ),
    'currentValueSnapshot', proposal.current_value_snapshot,
    'currentVerdictSnapshot', proposal.current_verdict_snapshot,
    'machineChecks', proposal.machine_checks,
    'impactPreview', proposal.impact_preview
  )
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_contribution_current_verdict_snapshot(
  verdict programme_verdict_revisions
)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT jsonb_build_object(
    'id', verdict.id,
    'revisionNumber', verdict.revision_number,
    'publishedAt', to_char(
      verdict.published_at AT TIME ZONE 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
    ),
    'programmeStatusAtReview', verdict.programme_status_at_review,
    'verdictCode', verdict.verdict_code,
    'publicLabel', verdict.public_label,
    'professionalLabel', verdict.professional_label,
    'oneSentenceReason', verdict.one_sentence_reason,
    'indicationScope', verdict.indication_scope,
    'populationScope', verdict.population_scope,
    'doseExposureScope', verdict.dose_exposure_scope,
    'periodScope', verdict.period_scope,
    'trialScope', verdict.trial_scope,
    'outcomeScope', verdict.outcome_scope,
    'plainMechanism', verdict.plain_mechanism,
    'bestSupportedFinding', verdict.best_supported_finding,
    'mainLimitation', verdict.main_limitation,
    'whatWasDisproven', verdict.what_was_disproven,
    'whatWasNotDisproven', verdict.what_was_not_disproven,
    'whatRemainsUnknown', verdict.what_remains_unknown,
    'confidence', verdict.confidence,
    'confidenceExplanation', verdict.confidence_explanation,
    'conditionsThatWouldChangeVerdict', verdict.conditions_that_would_change_verdict
  )
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_source_refresh_submission_integrity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  authoritative_verdict_id varchar;
  verdict programme_verdict_revisions%ROWTYPE;
  task evidence_review_tasks%ROWTYPE;
  source evidence_sources%ROWTYPE;
  freshness programme_freshness_states%ROWTYPE;
  delta evidence_review_task_source_deltas%ROWTYPE;
  expected_digest varchar;
  expected_impact_count integer;
  expected_claim_ids jsonb;
  expected_surfaces jsonb;
  expected_highest_impact text;
  machine_code_count integer;
BEGIN
  IF TG_OP <> 'UPDATE' OR OLD.status <> 'DRAFT' OR NEW.status <> 'SUBMITTED' THEN
    RETURN NEW;
  END IF;
  IF NEW.proposal_type IS DISTINCT FROM 'SOURCE_REFRESH'::contribution_proposal_type THEN
    RETURN NEW;
  END IF;

  PERFORM rnawiki_lock_programme_contribution_lineage(NEW.programme_id, NEW.proposal_key);

  SELECT verdict_revision_id INTO authoritative_verdict_id
  FROM programme_current_publications
  WHERE programme_id = NEW.programme_id
  FOR SHARE;
  IF authoritative_verdict_id IS NULL
     OR NEW.current_verdict_revision_id IS DISTINCT FROM authoritative_verdict_id THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'source refresh requires the exact current public conclusion';
  END IF;
  SELECT * INTO verdict
  FROM programme_verdict_revisions
  WHERE id = authoritative_verdict_id
    AND programme_id = NEW.programme_id
    AND review_status = 'PUBLISHED'
  FOR SHARE;
  IF verdict.id IS NULL
     OR NEW.current_verdict_snapshot IS DISTINCT FROM rnawiki_contribution_current_verdict_snapshot(verdict)
     OR NEW.current_value_snapshot IS NOT NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'source refresh verdict snapshot is not the exact current public bundle';
  END IF;

  SELECT * INTO freshness
  FROM programme_freshness_states
  WHERE programme_id = NEW.programme_id
    AND pending_snapshot_id = NEW.source_review_snapshot_id
  FOR SHARE;
  SELECT * INTO task
  FROM evidence_review_tasks
  WHERE id = NEW.source_review_task_id
  FOR SHARE;
  SELECT * INTO delta
  FROM evidence_review_task_source_deltas
  WHERE review_task_id = NEW.source_review_task_id
  FOR SHARE;
  IF task.source_id IS NOT NULL THEN
    SELECT * INTO source FROM evidence_sources WHERE id = task.source_id FOR SHARE;
  END IF;

  IF freshness.programme_id IS NULL
     OR task.id IS NULL
     OR delta.review_task_id IS NULL
     OR source.id IS NULL
     OR task.programme_id IS DISTINCT FROM NEW.programme_id
     OR task.source_id IS DISTINCT FROM freshness.source_id
     OR task.trigger_snapshot_id IS DISTINCT FROM NEW.source_review_snapshot_id
     OR task.status NOT IN ('OPEN', 'IN_REVIEW', 'BLOCKED')
     OR delta.programme_id IS DISTINCT FROM NEW.programme_id
     OR delta.source_id IS DISTINCT FROM task.source_id
     OR delta.pending_snapshot_id IS DISTINCT FROM NEW.source_review_snapshot_id
     OR freshness.current_snapshot_id IS DISTINCT FROM delta.baseline_snapshot_id
     OR freshness.pending_snapshot_id IS DISTINCT FROM delta.pending_snapshot_id
     OR delta.action IS DISTINCT FROM 'CANONICAL_REFRESH'::source_refresh_action
     OR jsonb_array_length(delta.scientific_revision_requirements) <> 0
     OR source.source_type IS DISTINCT FROM 'CLINICAL_TRIAL_REGISTRY'
     OR NEW.source_type IS DISTINCT FROM source.source_type
     OR NEW.source_identifier IS DISTINCT FROM source.external_identifier
     OR NEW.source_locator IS DISTINCT FROM source.canonical_locator
     OR NEW.source_refresh_delta_snapshot IS DISTINCT FROM rnawiki_source_refresh_delta_snapshot(delta) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'source refresh is stale or does not match the exact parser-owned task delta';
  END IF;

  IF NEW.machine_checks ->> 'version' IS DISTINCT FROM 'rna-intelligence/contribution-checks-v1'
     OR NEW.machine_checks ->> 'passed' IS DISTINCT FROM 'true'
     OR jsonb_typeof(NEW.machine_checks -> 'checks') IS DISTINCT FROM 'array'
     OR jsonb_array_length(NEW.machine_checks -> 'checks') <> 8 THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'source-refresh machine checks are incomplete';
  END IF;
  SELECT count(DISTINCT check_item ->> 'code') INTO machine_code_count
  FROM jsonb_array_elements(NEW.machine_checks -> 'checks') check_item;
  IF machine_code_count <> 8 OR EXISTS (
    SELECT 1 FROM jsonb_array_elements(NEW.machine_checks -> 'checks') check_item
    WHERE check_item ->> 'code' NOT IN (
      'source_refresh_exact_task_binding', 'source_refresh_structured_delta',
      'source_refresh_no_authored_replacement', 'current_verdict_available',
      'source_complete', 'source_refresh_action_ready', 'coi_attested',
      'dependency_graph_coverage'
    )
    OR (check_item ->> 'code' = 'dependency_graph_coverage'
      AND check_item ->> 'status' NOT IN ('PASS', 'WARN'))
    OR (check_item ->> 'code' <> 'dependency_graph_coverage'
      AND check_item ->> 'status' <> 'PASS')
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'source-refresh machine checks do not match the canonical rule set';
  END IF;

  WITH matched AS MATERIALIZED (
    SELECT dependency.*,
      jsonb_build_object(
        'dependentSurfaceType', dependency.dependent_surface_type,
        'fieldPath', dependency.field_path,
        'evidenceNodeId', dependency.evidence_node_id,
        'verdictRevisionId', dependency.verdict_revision_id,
        'impactLevel', dependency.impact_level
      ) AS surface
    FROM programme_dependencies dependency
    WHERE dependency.programme_id = NEW.programme_id
      AND (
        delta.affected_claim_ids @> jsonb_build_array(dependency.claim_id)
        OR delta.affected_surface_paths @> jsonb_build_array(dependency.field_path)
        OR delta.affected_surface_paths @> jsonb_build_array(
          CASE
            WHEN COALESCE(dependency.evidence_node_id, dependency.verdict_revision_id) IS NULL
              THEN dependency.dependent_surface_type::text || ':' || dependency.field_path
            ELSE dependency.dependent_surface_type::text || ':'
              || COALESCE(dependency.evidence_node_id, dependency.verdict_revision_id)
              || ':' || dependency.field_path
          END
        )
      )
  )
  SELECT count(*)::integer,
    COALESCE((
      SELECT jsonb_agg(claim_id ORDER BY claim_id)
      FROM (SELECT DISTINCT claim_id FROM matched) claims
    ), '[]'::jsonb),
    COALESCE((
      SELECT jsonb_agg(surface ORDER BY surface::text)
      FROM (SELECT DISTINCT surface FROM matched) surfaces
    ), '[]'::jsonb),
    (
      SELECT impact_level::text FROM matched
      ORDER BY CASE impact_level
        WHEN 'SAFETY_CRITICAL_REVIEW' THEN 3
        WHEN 'POSSIBLE_VERDICT_IMPACT' THEN 2
        WHEN 'INTERPRETIVE_REVIEW_REQUIRED' THEN 1
        ELSE 0
      END DESC, impact_level::text
      LIMIT 1
    )
  INTO expected_impact_count, expected_claim_ids, expected_surfaces, expected_highest_impact
  FROM matched;

  IF NEW.impact_preview ->> 'version' IS DISTINCT FROM 'rna-intelligence/contribution-impact-v1'
     OR NEW.impact_preview ->> 'matchedDependencyCount' IS DISTINCT FROM expected_impact_count::text
     OR NEW.impact_preview ->> 'noDependencyMatch' IS DISTINCT FROM (expected_impact_count = 0)::text
     OR NEW.impact_preview ->> 'highestImpactLevel' IS DISTINCT FROM expected_highest_impact
     OR NEW.impact_preview -> 'currentVerdictRevisionId' IS DISTINCT FROM to_jsonb(authoritative_verdict_id)
     OR jsonb_typeof(NEW.impact_preview -> 'affectedClaimIds') IS DISTINCT FROM 'array'
     OR jsonb_array_length(NEW.impact_preview -> 'affectedClaimIds') <> jsonb_array_length(expected_claim_ids)
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(NEW.impact_preview -> 'affectedClaimIds') item
       WHERE NOT expected_claim_ids @> jsonb_build_array(item)
     )
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(expected_claim_ids) item
       WHERE NOT (NEW.impact_preview -> 'affectedClaimIds') @> jsonb_build_array(item)
     )
     OR jsonb_typeof(NEW.impact_preview -> 'affectedSurfaces') IS DISTINCT FROM 'array'
     OR jsonb_array_length(NEW.impact_preview -> 'affectedSurfaces') <> jsonb_array_length(expected_surfaces)
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(NEW.impact_preview -> 'affectedSurfaces') item
       WHERE NOT expected_surfaces @> jsonb_build_array(item)
     )
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(expected_surfaces) item
       WHERE NOT (NEW.impact_preview -> 'affectedSurfaces') @> jsonb_build_array(item)
     ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'source-refresh impact preview does not match persisted programme dependencies';
  END IF;

  expected_digest := rnawiki_programme_contribution_digest_payload(
    rnawiki_programme_contribution_submission_payload(NEW)
  );
  NEW.content_digest_algorithm := 'sha256';
  NEW.content_digest := expected_digest;
  RETURN NEW;
END;
$$;--> statement-breakpoint

DROP TRIGGER IF EXISTS programme_contribution_submission_integrity_trigger
ON programme_contribution_proposals;--> statement-breakpoint
CREATE TRIGGER programme_contribution_submission_integrity_trigger
BEFORE UPDATE OF status ON programme_contribution_proposals
FOR EACH ROW
WHEN (NEW.proposal_type <> 'SOURCE_REFRESH')
EXECUTE FUNCTION rnawiki_guard_programme_contribution_submission_integrity();--> statement-breakpoint
CREATE TRIGGER programme_source_refresh_submission_integrity_trigger
BEFORE UPDATE OF status ON programme_contribution_proposals
FOR EACH ROW
WHEN (NEW.proposal_type = 'SOURCE_REFRESH')
EXECUTE FUNCTION rnawiki_guard_source_refresh_submission_integrity();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_source_task_is_actionable(
  target_task_id varchar,
  target_programme_id varchar,
  target_snapshot_id varchar,
  target_source_id varchar DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT target_task_id IS NULL OR EXISTS (
    SELECT 1
    FROM evidence_review_tasks task
    JOIN programme_freshness_states freshness
      ON freshness.programme_id = task.programme_id
      AND freshness.source_id = task.source_id
    LEFT JOIN evidence_review_task_source_deltas delta
      ON delta.review_task_id = task.id
    WHERE task.id = target_task_id
      AND task.programme_id = target_programme_id
      AND task.trigger_snapshot_id = target_snapshot_id
      AND (target_source_id IS NULL OR task.source_id = target_source_id)
      AND task.status IN ('OPEN', 'IN_REVIEW', 'BLOCKED')
      AND freshness.pending_snapshot_id = target_snapshot_id
      AND (
        delta.review_task_id IS NULL
        OR (
          delta.programme_id = task.programme_id
          AND delta.source_id = task.source_id
          AND delta.pending_snapshot_id = target_snapshot_id
          AND freshness.current_snapshot_id = delta.baseline_snapshot_id
        )
      )
  )
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_contribution_source_task_decision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  proposal programme_contribution_proposals%ROWTYPE;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RETURN NEW;
  END IF;
  SELECT * INTO proposal
  FROM programme_contribution_proposals
  WHERE id = NEW.proposal_id
  FOR SHARE;

  IF proposal.source_review_task_id IS NOT NULL THEN
    -- Hold the task and freshness rows so a monitor cannot supersede the task between this check
    -- and the immutable decision insert.
    PERFORM 1
    FROM evidence_review_tasks task
    JOIN programme_freshness_states freshness
      ON freshness.programme_id = task.programme_id
      AND freshness.source_id = task.source_id
    WHERE task.id = proposal.source_review_task_id
      AND task.programme_id = proposal.programme_id
    FOR SHARE OF task, freshness;

    IF NOT rnawiki_source_task_is_actionable(
      proposal.source_review_task_id,
      proposal.programme_id,
      proposal.source_review_snapshot_id,
      NULL
    ) THEN
      RAISE EXCEPTION USING
        ERRCODE = '23514',
        MESSAGE = 'source task was superseded; stale proposal cannot be reviewed or adjudicated';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER programme_contribution_reviews_source_task_guard_trigger
BEFORE INSERT ON programme_contribution_reviews
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_contribution_source_task_decision();--> statement-breakpoint
CREATE TRIGGER programme_contribution_adjudications_source_task_guard_trigger
BEFORE INSERT ON programme_contribution_adjudications
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_contribution_source_task_decision();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_canonical_source_task_decision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  implementation programme_contribution_implementations%ROWTYPE;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RETURN NEW;
  END IF;
  SELECT * INTO implementation
  FROM programme_contribution_implementations
  WHERE verdict_revision_id = NEW.verdict_revision_id
  FOR SHARE;

  IF implementation.source_review_task_id IS NOT NULL THEN
    PERFORM 1
    FROM evidence_review_tasks task
    JOIN programme_freshness_states freshness
      ON freshness.programme_id = task.programme_id
      AND freshness.source_id = task.source_id
    WHERE task.id = implementation.source_review_task_id
      AND task.programme_id = implementation.programme_id
      AND task.source_id = implementation.source_id
    FOR SHARE OF task, freshness;

    IF NOT rnawiki_source_task_is_actionable(
      implementation.source_review_task_id,
      implementation.programme_id,
      implementation.source_snapshot_id,
      implementation.source_id
    ) THEN
      RAISE EXCEPTION USING
        ERRCODE = '23514',
        MESSAGE = 'source task was superseded; stale canonical candidate cannot be reviewed or adjudicated';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER programme_verdict_reviews_source_task_guard_trigger
BEFORE INSERT ON programme_verdict_reviews
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_canonical_source_task_decision();--> statement-breakpoint
CREATE TRIGGER programme_verdict_adjudications_source_task_guard_trigger
BEFORE INSERT ON programme_verdict_adjudications
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_canonical_source_task_decision();
