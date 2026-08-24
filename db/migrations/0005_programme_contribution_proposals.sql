-- RNAWiki contribution proposals (forward-only migration).
--
-- Rollback notes: submitted proposals are audit records and must be exported before rollback.
-- After that export, drop programme_contribution_proposals_freeze_trigger and
-- rnawiki_guard_programme_contribution(), drop the table, then drop the four contribution enums.
-- The migration is additive and does not rewrite existing programme, verdict, claim, or source rows.
CREATE TYPE "public"."contribution_affects" AS ENUM('DISPROVEN', 'OPEN_QUESTIONS', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."contribution_proposal_status" AS ENUM('DRAFT', 'SUBMITTED');--> statement-breakpoint
CREATE TYPE "public"."contribution_proposal_type" AS ENUM('CORRECTION', 'VERDICT_CHALLENGE');--> statement-breakpoint
CREATE TYPE "public"."contribution_selected_field" AS ENUM('programme.title', 'programme.indication', 'programme.targetPopulation', 'programme.status', 'programme.highestPhaseReached', 'programme.route', 'programme.doseExposureContext', 'programme.rawStoppingReason', 'programme.stoppingReasonCategory', 'summary.plainMechanism', 'summary.bestSupportedFinding', 'summary.mainLimitation', 'verdict.verdictCode', 'verdict.publicLabel', 'verdict.professionalLabel', 'verdict.oneSentenceReason', 'verdict.scope.indication', 'verdict.scope.population', 'verdict.scope.doseExposure', 'verdict.scope.period', 'verdict.scope.trials', 'verdict.scope.outcome', 'verdict.whatWasDisproven', 'verdict.whatWasNotDisproven', 'verdict.whatRemainsUnknown', 'verdict.confidence', 'verdict.confidenceExplanation', 'verdict.conditionsThatWouldChangeVerdict', 'evidenceNode.state', 'evidenceNode.plainSummary', 'evidenceNode.professionalSummary', 'evidenceNode.rationale');--> statement-breakpoint
CREATE TABLE "programme_contribution_proposals" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"proposal_key" varchar(64) NOT NULL,
	"revision_number" integer DEFAULT 1 NOT NULL,
	"previous_proposal_id" varchar(64),
	"programme_id" varchar(64) NOT NULL,
	"author_user_id" varchar(64) NOT NULL,
	"proposal_type" "contribution_proposal_type" NOT NULL,
	"status" "contribution_proposal_status" DEFAULT 'DRAFT' NOT NULL,
	"selected_field" "contribution_selected_field",
	"proposed_text" text,
	"proposed_value" jsonb,
	"source_type" "evidence_source_type",
	"source_locator" text,
	"source_identifier" varchar(400),
	"claim_nature" "claim_nature",
	"evidence_node_id" varchar(64),
	"proposed_stopped_verdict" "stopped_programme_verdict",
	"reasoning" text,
	"what_was_wrong_or_missing" text,
	"affects" "contribution_affects",
	"conflicts_of_interest" text,
	"conflicts_of_interest_attested" boolean DEFAULT false NOT NULL,
	"current_value_snapshot" jsonb,
	"current_verdict_revision_id" varchar(64),
	"current_verdict_snapshot" jsonb,
	"machine_checks" jsonb,
	"impact_preview" jsonb,
	"content_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"content_digest" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	CONSTRAINT "programme_contributions_id_scope_unique" UNIQUE("id","programme_id","proposal_key"),
	CONSTRAINT "programme_contributions_revision_positive" CHECK ("programme_contribution_proposals"."revision_number" > 0),
	CONSTRAINT "programme_contributions_previous_not_self" CHECK ("programme_contribution_proposals"."previous_proposal_id" is null or "programme_contribution_proposals"."previous_proposal_id" <> "programme_contribution_proposals"."id"),
	CONSTRAINT "programme_contributions_first_revision_shape" CHECK (("programme_contribution_proposals"."revision_number" = 1 and "programme_contribution_proposals"."previous_proposal_id" is null)
        or ("programme_contribution_proposals"."revision_number" > 1 and "programme_contribution_proposals"."previous_proposal_id" is not null)),
	CONSTRAINT "programme_contributions_proposed_value_shape" CHECK ("programme_contribution_proposals"."proposed_value" is null or jsonb_typeof("programme_contribution_proposals"."proposed_value") in ('string', 'array')),
	CONSTRAINT "programme_contributions_node_target_shape" CHECK ("programme_contribution_proposals"."status" <> 'SUBMITTED'
		or ("programme_contribution_proposals"."proposal_type" = 'VERDICT_CHALLENGE' and "programme_contribution_proposals"."evidence_node_id" is not null)
		or ("programme_contribution_proposals"."proposal_type" = 'CORRECTION' and "programme_contribution_proposals"."selected_field"::text like 'evidenceNode.%' and "programme_contribution_proposals"."evidence_node_id" is not null)
		or ("programme_contribution_proposals"."proposal_type" = 'CORRECTION' and "programme_contribution_proposals"."selected_field"::text not like 'evidenceNode.%' and "programme_contribution_proposals"."evidence_node_id" is null)),
	CONSTRAINT "programme_contributions_digest_algorithm" CHECK ("programme_contribution_proposals"."content_digest_algorithm" = 'sha256'),
	CONSTRAINT "programme_contributions_digest_format" CHECK ("programme_contribution_proposals"."content_digest" is null or "programme_contribution_proposals"."content_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "programme_contributions_submitted_target_type" CHECK ("programme_contribution_proposals"."status" <> 'SUBMITTED'
		or ("programme_contribution_proposals"."proposal_type" = 'CORRECTION' and ("programme_contribution_proposals"."selected_field"::text like 'programme.%' or "programme_contribution_proposals"."selected_field"::text like 'evidenceNode.%'))
		or ("programme_contribution_proposals"."proposal_type" = 'VERDICT_CHALLENGE' and ("programme_contribution_proposals"."selected_field"::text like 'summary.%' or "programme_contribution_proposals"."selected_field"::text like 'verdict.%'))),
	CONSTRAINT "programme_contributions_verdict_baseline_shape" CHECK ((("programme_contribution_proposals"."current_verdict_revision_id" is null and "programme_contribution_proposals"."current_verdict_snapshot" is null)
		or ("programme_contribution_proposals"."current_verdict_revision_id" is not null and "programme_contribution_proposals"."current_verdict_snapshot" is not null))
		and ("programme_contribution_proposals"."status" <> 'SUBMITTED' or "programme_contribution_proposals"."proposal_type" <> 'VERDICT_CHALLENGE' or "programme_contribution_proposals"."current_verdict_revision_id" is not null)),
	CONSTRAINT "programme_contributions_stopped_verdict_proposal_shape" CHECK ("programme_contribution_proposals"."status" <> 'SUBMITTED' or (
		("programme_contribution_proposals"."selected_field" = 'verdict.verdictCode'
			and "programme_contribution_proposals"."proposal_type" = 'VERDICT_CHALLENGE'
			and "programme_contribution_proposals"."proposed_stopped_verdict" is not null
			and nullif(btrim("programme_contribution_proposals"."proposed_text"), '') is null
			and "programme_contribution_proposals"."proposed_value" is null)
		or ("programme_contribution_proposals"."selected_field" <> 'verdict.verdictCode' and "programme_contribution_proposals"."proposed_stopped_verdict" is null)
	)),
	CONSTRAINT "programme_contributions_submitted_replacement_shape" CHECK ("programme_contribution_proposals"."status" <> 'SUBMITTED' or (
		("programme_contribution_proposals"."selected_field" in ('verdict.whatWasDisproven', 'verdict.whatWasNotDisproven', 'verdict.whatRemainsUnknown', 'verdict.conditionsThatWouldChangeVerdict')
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
	)),
	CONSTRAINT "programme_contributions_submitted_complete" CHECK ("programme_contribution_proposals"."status" <> 'SUBMITTED' or (
        "programme_contribution_proposals"."selected_field" is not null
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
      ))
);
--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contribution_proposals_programme_id_development_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."development_programmes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contribution_proposals_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contributions_previous_lineage_fk" FOREIGN KEY ("previous_proposal_id","programme_id","proposal_key") REFERENCES "public"."programme_contribution_proposals"("id","programme_id","proposal_key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contributions_node_programme_fk" FOREIGN KEY ("evidence_node_id","programme_id") REFERENCES "public"."evidence_nodes"("id","programme_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contributions_verdict_programme_fk" FOREIGN KEY ("current_verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "programme_contributions_lineage_revision_unique" ON "programme_contribution_proposals" USING btree ("programme_id","proposal_key","revision_number");--> statement-breakpoint
CREATE INDEX "programme_contributions_author_status_idx" ON "programme_contribution_proposals" USING btree ("author_user_id","status","updated_at");--> statement-breakpoint
CREATE INDEX "programme_contributions_review_queue_idx" ON "programme_contribution_proposals" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "programme_contributions_programme_idx" ON "programme_contribution_proposals" USING btree ("programme_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "programme_contributions_previous_unique" ON "programme_contribution_proposals" USING btree ("previous_proposal_id") WHERE "programme_contribution_proposals"."previous_proposal_id" is not null;--> statement-breakpoint
CREATE INDEX "programme_contributions_node_idx" ON "programme_contribution_proposals" USING btree ("evidence_node_id");--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_programme_contribution()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  previous_row programme_contribution_proposals%ROWTYPE;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'DRAFT' THEN
      RAISE EXCEPTION 'contribution proposals must be created as DRAFT';
    END IF;
    IF NEW.current_value_snapshot IS NOT NULL
       OR NEW.current_verdict_revision_id IS NOT NULL
       OR NEW.current_verdict_snapshot IS NOT NULL
       OR NEW.machine_checks IS NOT NULL
       OR NEW.impact_preview IS NOT NULL
       OR NEW.content_digest IS NOT NULL
       OR NEW.submitted_at IS NOT NULL THEN
      RAISE EXCEPTION 'submission provenance is server-owned and must be empty on a new draft';
    END IF;
    IF NEW.previous_proposal_id IS NULL THEN
      IF NEW.revision_number <> 1 OR NEW.proposal_key <> NEW.id THEN
        RAISE EXCEPTION 'a first contribution revision must use revision 1 and its own id as proposal key';
      END IF;
    ELSE
      SELECT * INTO previous_row
      FROM programme_contribution_proposals
      WHERE id = NEW.previous_proposal_id
      FOR SHARE;
      IF NOT FOUND
         OR previous_row.status <> 'SUBMITTED'
         OR NEW.revision_number <> previous_row.revision_number + 1
         OR NEW.programme_id <> previous_row.programme_id
         OR NEW.proposal_key <> previous_row.proposal_key
         OR NEW.author_user_id <> previous_row.author_user_id
         OR NEW.proposal_type <> previous_row.proposal_type THEN
        RAISE EXCEPTION 'a contribution revision must extend the exact submitted author/type/programme lineage';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    -- A deliberate medicine/programme deletion may cascade the complete aggregate. Direct deletion
    -- while the parent is still present remains forbidden for submitted audit records.
    IF NOT EXISTS (
      SELECT 1 FROM development_programmes WHERE id = OLD.programme_id
    ) THEN
      RETURN OLD;
    END IF;
    IF OLD.status <> 'DRAFT' THEN
      RAISE EXCEPTION 'submitted contribution proposals are immutable';
    END IF;
    RETURN OLD;
  END IF;

  IF OLD.status <> 'DRAFT' THEN
    RAISE EXCEPTION 'submitted contribution proposals are immutable';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.proposal_key IS DISTINCT FROM OLD.proposal_key
     OR NEW.revision_number IS DISTINCT FROM OLD.revision_number
     OR NEW.previous_proposal_id IS DISTINCT FROM OLD.previous_proposal_id
     OR NEW.programme_id IS DISTINCT FROM OLD.programme_id
     OR NEW.author_user_id IS DISTINCT FROM OLD.author_user_id
     OR NEW.proposal_type IS DISTINCT FROM OLD.proposal_type
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'contribution proposal identity and lineage are immutable';
  END IF;

  IF NEW.status = 'DRAFT' THEN
    IF NEW.current_value_snapshot IS NOT NULL
       OR NEW.current_verdict_revision_id IS NOT NULL
       OR NEW.current_verdict_snapshot IS NOT NULL
       OR NEW.machine_checks IS NOT NULL
       OR NEW.impact_preview IS NOT NULL
       OR NEW.content_digest IS NOT NULL
       OR NEW.submitted_at IS NOT NULL THEN
      RAISE EXCEPTION 'submission provenance must remain empty while a proposal is a draft';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status <> 'SUBMITTED' THEN
    RAISE EXCEPTION 'invalid contribution proposal status transition';
  END IF;

  IF COALESCE(NEW.machine_checks ->> 'passed', 'false') <> 'true' THEN
    RAISE EXCEPTION 'a contribution proposal cannot be submitted with failed machine checks';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER programme_contribution_proposals_freeze_trigger
BEFORE INSERT OR UPDATE OR DELETE ON programme_contribution_proposals
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_programme_contribution();
