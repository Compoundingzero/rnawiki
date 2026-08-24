-- RNAWiki independent contribution review workflow (forward-only migration).
--
-- Rollback notes: review and adjudication rows are immutable audit records. Export all three
-- programme_contribution_review* tables before rollback. After that export, drop the 0006
-- triggers/functions, then the adjudication, review, and state tables, and finally
-- contribution_review_status. This migration never mutates a public programme, evidence node,
-- claim, current-publication pointer, or verdict revision.
CREATE TYPE "public"."contribution_review_status" AS ENUM('AWAITING_REVIEWS', 'AWAITING_SECOND_REVIEW', 'DISAGREEMENT', 'ACCEPTED_FOR_IMPLEMENTATION', 'CHANGES_REQUESTED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "programme_contribution_adjudications" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"proposal_id" varchar(64) NOT NULL,
	"adjudicator_user_id" varchar(64) NOT NULL,
	"adjudicator_name_snapshot" varchar(160) NOT NULL,
	"adjudicator_orcid_snapshot" varchar(32),
	"expertise_tags" "verdict_reviewer_expertise"[] NOT NULL,
	"decision" "verdict_review_decision" NOT NULL,
	"rationale" text NOT NULL,
	"conflicts_of_interest" text NOT NULL,
	"conflicts_of_interest_attested" boolean DEFAULT false NOT NULL,
	"content_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"content_digest" varchar(64) NOT NULL,
	"adjudicated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_contribution_adjudications_expertise" CHECK (cardinality("programme_contribution_adjudications"."expertise_tags") > 0),
	CONSTRAINT "programme_contribution_adjudications_complete" CHECK (nullif(btrim("programme_contribution_adjudications"."rationale"), '') is not null
        and nullif(btrim("programme_contribution_adjudications"."conflicts_of_interest"), '') is not null
        and "programme_contribution_adjudications"."conflicts_of_interest_attested"),
	CONSTRAINT "programme_contribution_adjudications_digest" CHECK ("programme_contribution_adjudications"."content_digest_algorithm" = 'sha256' and "programme_contribution_adjudications"."content_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "programme_contribution_adjudications_orcid" CHECK ("programme_contribution_adjudications"."adjudicator_orcid_snapshot" is null or "programme_contribution_adjudications"."adjudicator_orcid_snapshot" ~ '^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$')
);
--> statement-breakpoint
CREATE TABLE "programme_contribution_review_states" (
	"proposal_id" varchar(64) PRIMARY KEY NOT NULL,
	"status" "contribution_review_status" DEFAULT 'AWAITING_REVIEWS' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "programme_contribution_review_states_count" CHECK ("programme_contribution_review_states"."review_count" >= 0 and "programme_contribution_review_states"."review_count" <= 2),
	CONSTRAINT "programme_contribution_review_states_resolution" CHECK (("programme_contribution_review_states"."status" in ('ACCEPTED_FOR_IMPLEMENTATION', 'CHANGES_REQUESTED', 'REJECTED') and "programme_contribution_review_states"."resolved_at" is not null)
        or ("programme_contribution_review_states"."status" not in ('ACCEPTED_FOR_IMPLEMENTATION', 'CHANGES_REQUESTED', 'REJECTED') and "programme_contribution_review_states"."resolved_at" is null))
);
--> statement-breakpoint
CREATE TABLE "programme_contribution_reviews" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"proposal_id" varchar(64) NOT NULL,
	"reviewer_user_id" varchar(64) NOT NULL,
	"reviewer_name_snapshot" varchar(160) NOT NULL,
	"reviewer_orcid_snapshot" varchar(32),
	"expertise_tags" "verdict_reviewer_expertise"[] NOT NULL,
	"decision" "verdict_review_decision" NOT NULL,
	"independence_attested" boolean DEFAULT false NOT NULL,
	"conflicts_of_interest" text NOT NULL,
	"conflicts_of_interest_attested" boolean DEFAULT false NOT NULL,
	"review_note" text,
	"content_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"content_digest" varchar(64) NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_contribution_reviews_expertise" CHECK (cardinality("programme_contribution_reviews"."expertise_tags") > 0),
	CONSTRAINT "programme_contribution_reviews_attestations" CHECK ("programme_contribution_reviews"."independence_attested" and "programme_contribution_reviews"."conflicts_of_interest_attested" and nullif(btrim("programme_contribution_reviews"."conflicts_of_interest"), '') is not null),
	CONSTRAINT "programme_contribution_reviews_decision_note" CHECK ("programme_contribution_reviews"."decision" = 'APPROVE' or nullif(btrim("programme_contribution_reviews"."review_note"), '') is not null),
	CONSTRAINT "programme_contribution_reviews_digest" CHECK ("programme_contribution_reviews"."content_digest_algorithm" = 'sha256' and "programme_contribution_reviews"."content_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "programme_contribution_reviews_orcid" CHECK ("programme_contribution_reviews"."reviewer_orcid_snapshot" is null or "programme_contribution_reviews"."reviewer_orcid_snapshot" ~ '^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$')
);
--> statement-breakpoint
ALTER TABLE "programme_contribution_adjudications" ADD CONSTRAINT "programme_contribution_adjudications_proposal_id_programme_contribution_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."programme_contribution_proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_adjudications" ADD CONSTRAINT "programme_contribution_adjudications_adjudicator_user_id_users_id_fk" FOREIGN KEY ("adjudicator_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_review_states" ADD CONSTRAINT "programme_contribution_review_states_proposal_id_programme_contribution_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."programme_contribution_proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_reviews" ADD CONSTRAINT "programme_contribution_reviews_proposal_id_programme_contribution_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."programme_contribution_proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_reviews" ADD CONSTRAINT "programme_contribution_reviews_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "programme_contribution_adjudications_proposal_unique" ON "programme_contribution_adjudications" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "programme_contribution_adjudications_user_idx" ON "programme_contribution_adjudications" USING btree ("adjudicator_user_id");--> statement-breakpoint
CREATE INDEX "programme_contribution_review_states_queue_idx" ON "programme_contribution_review_states" USING btree ("status","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "programme_contribution_reviews_reviewer_unique" ON "programme_contribution_reviews" USING btree ("proposal_id","reviewer_user_id");--> statement-breakpoint
CREATE INDEX "programme_contribution_reviews_proposal_idx" ON "programme_contribution_reviews" USING btree ("proposal_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "programme_contribution_reviews_reviewer_idx" ON "programme_contribution_reviews" USING btree ("reviewer_user_id");--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_contribution_terminal_review_status(
  review_decision verdict_review_decision
)
RETURNS contribution_review_status
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT CASE review_decision
    WHEN 'APPROVE' THEN 'ACCEPTED_FOR_IMPLEMENTATION'::contribution_review_status
    WHEN 'CHANGES_REQUESTED' THEN 'CHANGES_REQUESTED'::contribution_review_status
    WHEN 'REJECT' THEN 'REJECTED'::contribution_review_status
  END
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_expected_programme_contribution_review_state(
  target_proposal_id varchar
)
RETURNS TABLE(expected_status contribution_review_status, expected_review_count integer)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  first_decision verdict_review_decision;
  second_decision verdict_review_decision;
  adjudicated_decision verdict_review_decision;
BEGIN
  SELECT count(*)::integer,
         min(decision::text)::verdict_review_decision,
         max(decision::text)::verdict_review_decision
  INTO expected_review_count, first_decision, second_decision
  FROM programme_contribution_reviews
  WHERE proposal_id = target_proposal_id;

  IF expected_review_count > 2 THEN
    RAISE EXCEPTION 'a contribution proposal may have at most two independent reviews';
  END IF;

  SELECT decision INTO adjudicated_decision
  FROM programme_contribution_adjudications
  WHERE proposal_id = target_proposal_id;

  IF adjudicated_decision IS NOT NULL THEN
    IF expected_review_count <> 2 OR first_decision = second_decision THEN
      RAISE EXCEPTION 'an adjudication may resolve only two disagreeing contribution reviews';
    END IF;
    expected_status := rnawiki_contribution_terminal_review_status(adjudicated_decision);
  ELSIF expected_review_count = 0 THEN
    expected_status := 'AWAITING_REVIEWS';
  ELSIF expected_review_count = 1 THEN
    expected_status := 'AWAITING_SECOND_REVIEW';
  ELSIF first_decision = second_decision THEN
    expected_status := rnawiki_contribution_terminal_review_status(first_decision);
  ELSE
    expected_status := 'DISAGREEMENT';
  END IF;

  RETURN NEXT;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_programme_contribution_review_state()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  derived_status contribution_review_status;
  derived_count integer;
  proposal_status contribution_proposal_status;
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Direct deletion is forbidden. A medicine/programme deletion may remove the whole aggregate;
    -- in that sanctioned cascade either the proposal or its programme is already absent.
    IF NOT EXISTS (
      SELECT 1
      FROM programme_contribution_proposals proposal
      JOIN development_programmes programme ON programme.id = proposal.programme_id
      WHERE proposal.id = OLD.proposal_id
    ) THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'contribution review state cannot be deleted directly';
  END IF;

  SELECT status INTO proposal_status
  FROM programme_contribution_proposals
  WHERE id = NEW.proposal_id;
  IF proposal_status IS DISTINCT FROM 'SUBMITTED'::contribution_proposal_status THEN
    RAISE EXCEPTION 'review state requires a submitted contribution proposal';
  END IF;

  SELECT expected_status, expected_review_count
  INTO derived_status, derived_count
  FROM rnawiki_expected_programme_contribution_review_state(NEW.proposal_id);

  IF NEW.status IS DISTINCT FROM derived_status
     OR NEW.review_count IS DISTINCT FROM derived_count THEN
    RAISE EXCEPTION 'contribution review state must equal the state derived from immutable decisions';
  END IF;

  IF derived_status IN ('ACCEPTED_FOR_IMPLEMENTATION', 'CHANGES_REQUESTED', 'REJECTED') THEN
    IF NEW.resolved_at IS NULL THEN
      RAISE EXCEPTION 'a resolved contribution review state requires resolved_at';
    END IF;
  ELSIF NEW.resolved_at IS NOT NULL THEN
    RAISE EXCEPTION 'an unresolved contribution review state cannot set resolved_at';
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.proposal_id IS DISTINCT FROM OLD.proposal_id THEN
    RAISE EXCEPTION 'contribution review state identity is immutable';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER programme_contribution_review_states_guard_trigger
BEFORE INSERT OR UPDATE OR DELETE ON programme_contribution_review_states
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_programme_contribution_review_state();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_sync_programme_contribution_review_state(
  target_proposal_id varchar
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  derived_status contribution_review_status;
  derived_count integer;
BEGIN
  SELECT expected_status, expected_review_count
  INTO derived_status, derived_count
  FROM rnawiki_expected_programme_contribution_review_state(target_proposal_id);

  UPDATE programme_contribution_review_states
  SET status = derived_status,
      review_count = derived_count,
      updated_at = clock_timestamp(),
      resolved_at = CASE
        WHEN derived_status IN ('ACCEPTED_FOR_IMPLEMENTATION', 'CHANGES_REQUESTED', 'REJECTED')
          THEN COALESCE(resolved_at, clock_timestamp())
        ELSE NULL
      END
  WHERE proposal_id = target_proposal_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'submitted contribution proposal is missing its review state';
  END IF;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_initialize_programme_contribution_review_state()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'SUBMITTED' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO programme_contribution_review_states (proposal_id)
    VALUES (NEW.id)
    ON CONFLICT (proposal_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER programme_contribution_review_state_initialize_trigger
AFTER UPDATE OF status ON programme_contribution_proposals
FOR EACH ROW EXECUTE FUNCTION rnawiki_initialize_programme_contribution_review_state();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_programme_contribution_review()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  proposal_row programme_contribution_proposals%ROWTYPE;
  reviewer_row users%ROWTYPE;
  state_row programme_contribution_review_states%ROWTYPE;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    IF TG_OP = 'DELETE' AND NOT EXISTS (
      SELECT 1
      FROM programme_contribution_proposals proposal
      JOIN development_programmes programme ON programme.id = proposal.programme_id
      WHERE proposal.id = OLD.proposal_id
    ) THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'contribution reviews are immutable append-only decisions';
  END IF;

  SELECT * INTO proposal_row
  FROM programme_contribution_proposals
  WHERE id = NEW.proposal_id
  FOR SHARE;
  IF NOT FOUND OR proposal_row.status <> 'SUBMITTED' OR proposal_row.content_digest IS NULL THEN
    RAISE EXCEPTION 'a review requires a submitted, digest-bound contribution proposal';
  END IF;

  IF EXISTS (
    SELECT 1 FROM programme_contribution_proposals newer
    WHERE newer.programme_id = proposal_row.programme_id
      AND newer.proposal_key = proposal_row.proposal_key
      AND newer.status = 'SUBMITTED'
      AND newer.revision_number > proposal_row.revision_number
  ) THEN
    RAISE EXCEPTION 'a superseded contribution proposal revision cannot receive a review';
  END IF;

  SELECT * INTO state_row
  FROM programme_contribution_review_states
  WHERE proposal_id = NEW.proposal_id
  FOR UPDATE;
  IF NOT FOUND OR state_row.status NOT IN ('AWAITING_REVIEWS', 'AWAITING_SECOND_REVIEW') THEN
    RAISE EXCEPTION 'this contribution proposal is not accepting independent reviews';
  END IF;
  IF state_row.review_count >= 2 THEN
    RAISE EXCEPTION 'a contribution proposal may have at most two independent reviews';
  END IF;

  IF NEW.reviewer_user_id = proposal_row.author_user_id THEN
    RAISE EXCEPTION 'a contribution proposal author cannot review their own proposal';
  END IF;
  IF NEW.content_digest_algorithm <> proposal_row.content_digest_algorithm
     OR NEW.content_digest <> proposal_row.content_digest THEN
    RAISE EXCEPTION 'a contribution review must bind the exact frozen proposal digest';
  END IF;

  SELECT * INTO reviewer_row FROM users WHERE id = NEW.reviewer_user_id FOR SHARE;
  IF NOT FOUND OR NOT (reviewer_row.is_admin OR reviewer_row.trust_tier IN ('trusted', 'steward')) THEN
    RAISE EXCEPTION 'contribution reviews require a trusted editor, steward, or administrator';
  END IF;
  IF NEW.reviewer_name_snapshot IS DISTINCT FROM reviewer_row.name
     OR NEW.reviewer_orcid_snapshot IS DISTINCT FROM reviewer_row.orcid THEN
    RAISE EXCEPTION 'contribution reviewer attribution must match the authenticated public profile';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER programme_contribution_reviews_guard_trigger
BEFORE INSERT OR UPDATE OR DELETE ON programme_contribution_reviews
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_programme_contribution_review();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_after_programme_contribution_review()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM rnawiki_sync_programme_contribution_review_state(NEW.proposal_id);
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER programme_contribution_reviews_state_trigger
AFTER INSERT ON programme_contribution_reviews
FOR EACH ROW EXECUTE FUNCTION rnawiki_after_programme_contribution_review();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_programme_contribution_adjudication()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  proposal_row programme_contribution_proposals%ROWTYPE;
  adjudicator_row users%ROWTYPE;
  state_row programme_contribution_review_states%ROWTYPE;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    IF TG_OP = 'DELETE' AND NOT EXISTS (
      SELECT 1
      FROM programme_contribution_proposals proposal
      JOIN development_programmes programme ON programme.id = proposal.programme_id
      WHERE proposal.id = OLD.proposal_id
    ) THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'contribution adjudications are immutable append-only decisions';
  END IF;

  SELECT * INTO proposal_row
  FROM programme_contribution_proposals
  WHERE id = NEW.proposal_id
  FOR SHARE;
  IF NOT FOUND OR proposal_row.status <> 'SUBMITTED' OR proposal_row.content_digest IS NULL THEN
    RAISE EXCEPTION 'an adjudication requires a submitted, digest-bound contribution proposal';
  END IF;

  SELECT * INTO state_row
  FROM programme_contribution_review_states
  WHERE proposal_id = NEW.proposal_id
  FOR UPDATE;
  IF NOT FOUND OR state_row.status <> 'DISAGREEMENT' OR state_row.review_count <> 2 THEN
    RAISE EXCEPTION 'only two disagreeing contribution reviews may be adjudicated';
  END IF;

  IF NEW.adjudicator_user_id = proposal_row.author_user_id
     OR EXISTS (
       SELECT 1 FROM programme_contribution_reviews review
       WHERE review.proposal_id = NEW.proposal_id
         AND review.reviewer_user_id = NEW.adjudicator_user_id
     ) THEN
    RAISE EXCEPTION 'a contribution adjudicator must be independent of the author and reviewers';
  END IF;
  IF NEW.content_digest_algorithm <> proposal_row.content_digest_algorithm
     OR NEW.content_digest <> proposal_row.content_digest THEN
    RAISE EXCEPTION 'a contribution adjudication must bind the exact frozen proposal digest';
  END IF;

  SELECT * INTO adjudicator_row FROM users WHERE id = NEW.adjudicator_user_id FOR SHARE;
  IF NOT FOUND OR NOT (adjudicator_row.is_admin OR adjudicator_row.trust_tier = 'steward') THEN
    RAISE EXCEPTION 'contribution adjudication requires a steward or administrator';
  END IF;
  IF NEW.adjudicator_name_snapshot IS DISTINCT FROM adjudicator_row.name
     OR NEW.adjudicator_orcid_snapshot IS DISTINCT FROM adjudicator_row.orcid THEN
    RAISE EXCEPTION 'contribution adjudicator attribution must match the authenticated public profile';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER programme_contribution_adjudications_guard_trigger
BEFORE INSERT OR UPDATE OR DELETE ON programme_contribution_adjudications
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_programme_contribution_adjudication();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_after_programme_contribution_adjudication()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM rnawiki_sync_programme_contribution_review_state(NEW.proposal_id);
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER programme_contribution_adjudications_state_trigger
AFTER INSERT ON programme_contribution_adjudications
FOR EACH ROW EXECUTE FUNCTION rnawiki_after_programme_contribution_adjudication();--> statement-breakpoint

-- Existing submitted 0005 rows predate this state table. Backfill them without fabricating a
-- human decision so every item enters the new workflow at AWAITING_REVIEWS.
INSERT INTO programme_contribution_review_states (proposal_id)
SELECT id
FROM programme_contribution_proposals
WHERE status = 'SUBMITTED'
ON CONFLICT (proposal_id) DO NOTHING;
