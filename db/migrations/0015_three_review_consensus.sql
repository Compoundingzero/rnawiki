-- RNAWiki three-review contribution consensus with per-row policy versioning.
--
-- Rollback notes: review and adjudication rows stay immutable audit records; export all three
-- programme_contribution_review* tables before rollback. Rolling back means restoring the 0007
-- guard/sync function definitions and the one-argument expected-state function, then dropping
-- required_approvals and restoring the fixed review_count <= 2 check. Rows resolved while 0015 was
-- active under the three-review policy must keep their exported decisions. AWAITING_THIRD_REVIEW
-- cannot be removed from the enum in place; a rollback must first resolve or export any row in
-- that state. This migration never mutates a public programme, evidence node, claim,
-- current-publication pointer, or verdict revision.
--
-- The new enum label is not consumed by any statement in this migration, so ALTER TYPE ... ADD
-- VALUE is safe both on a clean replay (enum created in the same transaction) and on an upgrade
-- (label referenced only from function bodies, which PostgreSQL stores as text).
ALTER TYPE "public"."contribution_review_status" ADD VALUE 'AWAITING_THIRD_REVIEW' BEFORE 'DISAGREEMENT';--> statement-breakpoint
ALTER TABLE "programme_contribution_review_states" DROP CONSTRAINT "programme_contribution_review_states_count";--> statement-breakpoint
-- Policy versioning: every existing row was opened (and possibly resolved) under the two-review
-- policy, so the add-column default backfills all of them to 2 without firing the state guard.
-- Only rows created after this migration take the three-review default.
ALTER TABLE "programme_contribution_review_states" ADD COLUMN "required_approvals" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "programme_contribution_review_states" ALTER COLUMN "required_approvals" SET DEFAULT 3;--> statement-breakpoint
ALTER TABLE "programme_contribution_review_states" ADD CONSTRAINT "programme_contribution_review_states_required_approvals" CHECK ("programme_contribution_review_states"."required_approvals" in (2, 3));--> statement-breakpoint
ALTER TABLE "programme_contribution_review_states" ADD CONSTRAINT "programme_contribution_review_states_count" CHECK ("programme_contribution_review_states"."review_count" >= 0 and "programme_contribution_review_states"."review_count" <= "programme_contribution_review_states"."required_approvals");--> statement-breakpoint

-- The derived-state function is now parameterized by the row's frozen review policy. The
-- one-argument 0006 signature is removed so no caller can bypass the policy argument.
DROP FUNCTION rnawiki_expected_programme_contribution_review_state(varchar);--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_expected_programme_contribution_review_state(
  target_proposal_id varchar,
  approvals_required integer
)
RETURNS TABLE(expected_status contribution_review_status, expected_review_count integer)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  distinct_decisions integer;
  unanimous_decision verdict_review_decision;
  adjudicated_decision verdict_review_decision;
BEGIN
  IF approvals_required IS NULL OR approvals_required NOT IN (2, 3) THEN
    RAISE EXCEPTION 'a contribution review policy must require two or three approvals';
  END IF;

  SELECT count(*)::integer,
         count(DISTINCT decision)::integer,
         min(decision::text)::verdict_review_decision
  INTO expected_review_count, distinct_decisions, unanimous_decision
  FROM programme_contribution_reviews
  WHERE proposal_id = target_proposal_id;

  IF expected_review_count > approvals_required THEN
    RAISE EXCEPTION 'a contribution proposal may not exceed its required number of independent reviews';
  END IF;

  SELECT decision INTO adjudicated_decision
  FROM programme_contribution_adjudications
  WHERE proposal_id = target_proposal_id;

  IF adjudicated_decision IS NOT NULL THEN
    IF expected_review_count < 2 OR distinct_decisions < 2 THEN
      RAISE EXCEPTION 'an adjudication may resolve only disagreeing contribution reviews';
    END IF;
    expected_status := rnawiki_contribution_terminal_review_status(adjudicated_decision);
  ELSIF expected_review_count = 0 THEN
    expected_status := 'AWAITING_REVIEWS';
  ELSIF expected_review_count = 1 THEN
    expected_status := 'AWAITING_SECOND_REVIEW';
  ELSIF distinct_decisions > 1 THEN
    expected_status := 'DISAGREEMENT';
  ELSIF expected_review_count = approvals_required THEN
    expected_status := rnawiki_contribution_terminal_review_status(unanimous_decision);
  ELSE
    expected_status := 'AWAITING_THIRD_REVIEW';
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

  -- Decisions already recorded were made under the policy the row was opened with, so the
  -- policy itself is immutable once the row exists.
  IF TG_OP = 'UPDATE' AND NEW.required_approvals IS DISTINCT FROM OLD.required_approvals THEN
    RAISE EXCEPTION 'a contribution review policy is fixed when the review state is created';
  END IF;

  SELECT expected_status, expected_review_count
  INTO derived_status, derived_count
  FROM rnawiki_expected_programme_contribution_review_state(NEW.proposal_id, NEW.required_approvals);
  IF NEW.status IS DISTINCT FROM derived_status
     OR NEW.review_count IS DISTINCT FROM derived_count THEN
    RAISE EXCEPTION 'contribution review state must equal the state derived from immutable decisions';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.proposal_id IS DISTINCT FROM OLD.proposal_id THEN
    RAISE EXCEPTION 'contribution review state identity is immutable';
  END IF;

  -- Audit clocks are database-owned. Caller timestamps are ignored rather than authenticated.
  NEW.updated_at := clock_timestamp();
  NEW.resolved_at := CASE
    WHEN derived_status IN ('ACCEPTED_FOR_IMPLEMENTATION', 'CHANGES_REQUESTED', 'REJECTED')
      THEN CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.resolved_at, clock_timestamp())
                ELSE clock_timestamp() END
    ELSE NULL
  END;
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_sync_programme_contribution_review_state(
  target_proposal_id varchar
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  approvals_required integer;
  derived_status contribution_review_status;
  derived_count integer;
BEGIN
  SELECT required_approvals INTO approvals_required
  FROM programme_contribution_review_states
  WHERE proposal_id = target_proposal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'submitted contribution proposal is missing its review state';
  END IF;

  SELECT expected_status, expected_review_count
  INTO derived_status, derived_count
  FROM rnawiki_expected_programme_contribution_review_state(target_proposal_id, approvals_required);

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
END;
$$;--> statement-breakpoint

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
  PERFORM rnawiki_lock_programme_contribution_lineage(
    proposal_row.programme_id,
    proposal_row.proposal_key
  );

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
  IF NOT FOUND
     OR state_row.status NOT IN ('AWAITING_REVIEWS', 'AWAITING_SECOND_REVIEW', 'AWAITING_THIRD_REVIEW') THEN
    RAISE EXCEPTION 'this contribution proposal is not accepting independent reviews';
  END IF;
  IF state_row.review_count >= state_row.required_approvals THEN
    RAISE EXCEPTION 'a contribution proposal may not exceed its required number of independent reviews';
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

  NEW.reviewed_at := clock_timestamp();
  RETURN NEW;
END;
$$;--> statement-breakpoint

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
  PERFORM rnawiki_lock_programme_contribution_lineage(
    proposal_row.programme_id,
    proposal_row.proposal_key
  );

  SELECT * INTO state_row
  FROM programme_contribution_review_states
  WHERE proposal_id = NEW.proposal_id
  FOR UPDATE;
  IF NOT FOUND
     OR state_row.status <> 'DISAGREEMENT'
     OR state_row.review_count < 2
     OR state_row.review_count > state_row.required_approvals THEN
    RAISE EXCEPTION 'only disagreeing contribution reviews may be adjudicated';
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

  NEW.adjudicated_at := clock_timestamp();
  RETURN NEW;
END;
$$;--> statement-breakpoint
