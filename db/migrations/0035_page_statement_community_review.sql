-- RNAWiki community review of a Substance Compass sentence.
--
-- A member proposes a better wording for one named sentence on one medicine page, three
-- independent eligible members approve that exact wording, and the approved wording becomes the
-- public answer inside one transaction. No deployment is involved, because the wording is an
-- overlay the page reads at request time rather than a string in the application.
--
-- Rollback notes: export page_statement_revisions, page_statement_reviews,
-- page_statement_publications, page_statement_publication_events, page_statement_moderation_events
-- and account_restriction_events before rollback; every one of them is an audit record and the
-- review decisions cannot be reconstructed from anything else. Rolling back drops the overlay, so
-- every page returns to its built-in wording on the next request — no public medical record is
-- restored or lost, because this migration never writes to drugs, corpus_pages, page_fields,
-- reviewed_claims, source_snapshots or any programme table, and nothing outside these tables reads
-- them. users.restricted_at / users.restriction_reason must be exported with the ledger if any
-- account is restricted at rollback time. This migration mutates no public medical content.
CREATE TYPE "public"."page_statement_change_category" AS ENUM('plain_language_clarity', 'factual_accuracy', 'missing_limitation', 'evidence_classification', 'source_correction', 'identity_correction', 'safety_correction', 'interaction_correction', 'formulation_correction', 'spelling_or_grammar', 'accessibility', 'other');--> statement-breakpoint
CREATE TYPE "public"."page_statement_key" AS ENUM('hero.opening', 'hero.explanation', 'hero.why_people_take_it', 'hero.strongest_result', 'hero.principal_limit', 'hero.where_it_acts', 'hero.immediate_change');--> statement-breakpoint
CREATE TYPE "public"."page_statement_proposal_status" AS ENUM('draft', 'submitted', 'open', 'changes_requested', 'rejected', 'approved', 'published', 'superseded', 'stale_source', 'withdrawn', 'safety_hold');--> statement-breakpoint
CREATE TYPE "public"."page_statement_publication_event" AS ENUM('publish', 'rollback', 'safety_hold', 'release_hold');--> statement-breakpoint
CREATE TYPE "public"."page_statement_review_status" AS ENUM('awaiting_reviews', 'awaiting_second_review', 'awaiting_third_review', 'approved', 'changes_requested', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."page_statement_risk_class" AS ENUM('copy_only', 'scientific_meaning', 'high_risk');--> statement-breakpoint
CREATE TABLE "account_restriction_events" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"target_user_id" varchar(64) NOT NULL,
	"actor_user_id" varchar(64) NOT NULL,
	"action" varchar(16) NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_restriction_events_action" CHECK ("account_restriction_events"."action" in ('RESTRICT', 'LIFT')),
	CONSTRAINT "account_restriction_events_reason" CHECK (nullif(btrim("account_restriction_events"."reason"), '') is not null),
	CONSTRAINT "account_restriction_events_not_self" CHECK ("account_restriction_events"."target_user_id" <> "account_restriction_events"."actor_user_id")
);
--> statement-breakpoint
CREATE TABLE "page_statement_moderation_events" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"revision_id" varchar(64) NOT NULL,
	"action" varchar(32) NOT NULL,
	"actor_user_id" varchar(64),
	"detail" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_statement_moderation_events_action" CHECK ("page_statement_moderation_events"."action" in ('REPORTED', 'REJECTED_BY_MODERATOR', 'SAFETY_HOLD', 'HOLD_RELEASED', 'RATE_LIMITED'))
);
--> statement-breakpoint
CREATE TABLE "page_statement_publication_events" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"medicine_id" varchar(96) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"statement_key" "page_statement_key" NOT NULL,
	"event" "page_statement_publication_event" NOT NULL,
	"revision_id" varchar(64) NOT NULL,
	"previous_revision_id" varchar(64),
	"approvals_recorded" integer DEFAULT 0 NOT NULL,
	"qualified_approvals" integer DEFAULT 0 NOT NULL,
	"automated_checks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cache_invalidation" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"content_digest" varchar(64) NOT NULL,
	"actor_user_id" varchar(64),
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_statement_publication_events_digest" CHECK ("page_statement_publication_events"."content_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "page_statement_publication_events_actor" CHECK ("page_statement_publication_events"."event" = 'publish' or "page_statement_publication_events"."actor_user_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "page_statement_publications" (
	"medicine_id" varchar(96) NOT NULL,
	"statement_key" "page_statement_key" NOT NULL,
	"revision_id" varchar(64) NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_statement_publications_medicine_id_statement_key_pk" PRIMARY KEY("medicine_id","statement_key")
);
--> statement-breakpoint
CREATE TABLE "page_statement_review_states" (
	"revision_id" varchar(64) PRIMARY KEY NOT NULL,
	"status" "page_statement_review_status" DEFAULT 'awaiting_reviews' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"qualified_approvals" integer DEFAULT 0 NOT NULL,
	"required_approvals" integer DEFAULT 3 NOT NULL,
	"required_qualified_approvals" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "page_statement_review_states_count" CHECK ("page_statement_review_states"."review_count" >= 0 and "page_statement_review_states"."review_count" <= "page_statement_review_states"."required_approvals"),
	CONSTRAINT "page_statement_review_states_required" CHECK ("page_statement_review_states"."required_approvals" = 3),
	CONSTRAINT "page_statement_review_states_required_qualified" CHECK ("page_statement_review_states"."required_qualified_approvals" between 0 and "page_statement_review_states"."required_approvals"),
	CONSTRAINT "page_statement_review_states_qualified_count" CHECK ("page_statement_review_states"."qualified_approvals" >= 0 and "page_statement_review_states"."qualified_approvals" <= "page_statement_review_states"."review_count")
);
--> statement-breakpoint
CREATE TABLE "page_statement_reviews" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"revision_id" varchar(64) NOT NULL,
	"reviewer_user_id" varchar(64) NOT NULL,
	"reviewer_name_snapshot" varchar(160) NOT NULL,
	"reviewer_orcid_snapshot" varchar(32),
	"reviewer_identity_key" varchar(80) NOT NULL,
	"reviewer_trust_tier_snapshot" "trust_tier" NOT NULL,
	"qualification_snapshot" "verdict_reviewer_expertise"[] DEFAULT '{}'::verdict_reviewer_expertise[] NOT NULL,
	"qualification_relevant" boolean DEFAULT false NOT NULL,
	"decision" "verdict_review_decision" NOT NULL,
	"checked_wording" boolean DEFAULT false NOT NULL,
	"checked_source" boolean DEFAULT false NOT NULL,
	"checked_limitation" boolean DEFAULT false NOT NULL,
	"conflicts_of_interest" text NOT NULL,
	"conflicts_of_interest_attested" boolean DEFAULT false NOT NULL,
	"conflict_declared" boolean DEFAULT false NOT NULL,
	"reason" text,
	"content_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"content_digest" varchar(64) NOT NULL,
	"source_digest" varchar(64) NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"withdrawn_at" timestamp with time zone,
	"withdrawn_reason" text,
	CONSTRAINT "page_statement_reviews_confirmations" CHECK ("page_statement_reviews"."checked_wording" and "page_statement_reviews"."checked_source" and "page_statement_reviews"."checked_limitation" and "page_statement_reviews"."conflicts_of_interest_attested" and nullif(btrim("page_statement_reviews"."conflicts_of_interest"), '') is not null),
	CONSTRAINT "page_statement_reviews_decision_reason" CHECK ("page_statement_reviews"."decision" = 'APPROVE' or nullif(btrim("page_statement_reviews"."reason"), '') is not null),
	CONSTRAINT "page_statement_reviews_digest" CHECK ("page_statement_reviews"."content_digest_algorithm" = 'sha256' and "page_statement_reviews"."content_digest" ~ '^[0-9a-f]{64}$' and "page_statement_reviews"."source_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "page_statement_reviews_withdrawal" CHECK (("page_statement_reviews"."withdrawn_at" is null and "page_statement_reviews"."withdrawn_reason" is null)
        or ("page_statement_reviews"."withdrawn_at" is not null and nullif(btrim("page_statement_reviews"."withdrawn_reason"), '') is not null)),
	CONSTRAINT "page_statement_reviews_orcid" CHECK ("page_statement_reviews"."reviewer_orcid_snapshot" is null or "page_statement_reviews"."reviewer_orcid_snapshot" ~ '^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$')
);
--> statement-breakpoint
CREATE TABLE "page_statement_revisions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"medicine_id" varchar(96) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"statement_key" "page_statement_key" NOT NULL,
	"claim_id" varchar(64),
	"parent_revision_id" varchar(64),
	"baseline_revision_id" varchar(64),
	"current_text" text NOT NULL,
	"proposed_text" text NOT NULL,
	"reason" text NOT NULL,
	"change_category" "page_statement_change_category" NOT NULL,
	"risk_class" "page_statement_risk_class" NOT NULL,
	"evidence_state" varchar(64) NOT NULL,
	"evidence_packet" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gate_results" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"content_digest" varchar(64) NOT NULL,
	"source_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"source_digest" varchar(64) NOT NULL,
	"author_user_id" varchar(64) NOT NULL,
	"status" "page_statement_proposal_status" DEFAULT 'draft' NOT NULL,
	"status_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"superseded_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_statement_revisions_subject_unique" UNIQUE("id","medicine_id","statement_key"),
	CONSTRAINT "page_statement_revisions_text_present" CHECK (nullif(btrim("page_statement_revisions"."proposed_text"), '') is not null and nullif(btrim("page_statement_revisions"."reason"), '') is not null),
	CONSTRAINT "page_statement_revisions_text_changed" CHECK (btrim("page_statement_revisions"."proposed_text") <> btrim("page_statement_revisions"."current_text")),
	CONSTRAINT "page_statement_revisions_content_digest" CHECK ("page_statement_revisions"."content_digest_algorithm" = 'sha256' and "page_statement_revisions"."content_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "page_statement_revisions_source_digest" CHECK ("page_statement_revisions"."source_digest_algorithm" = 'sha256' and "page_statement_revisions"."source_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "page_statement_revisions_published_clock" CHECK (("page_statement_revisions"."status" = 'published' and "page_statement_revisions"."published_at" is not null)
        or ("page_statement_revisions"."status" = 'superseded' and "page_statement_revisions"."published_at" is not null)
        or ("page_statement_revisions"."status" not in ('published', 'superseded') and "page_statement_revisions"."published_at" is null)),
	CONSTRAINT "page_statement_revisions_submitted_clock" CHECK ("page_statement_revisions"."status" = 'draft' or "page_statement_revisions"."submitted_at" is not null),
	CONSTRAINT "page_statement_revisions_no_self_parent" CHECK ("page_statement_revisions"."parent_revision_id" is null or "page_statement_revisions"."parent_revision_id" <> "page_statement_revisions"."id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "restricted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "restriction_reason" text;--> statement-breakpoint
ALTER TABLE "account_restriction_events" ADD CONSTRAINT "account_restriction_events_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_restriction_events" ADD CONSTRAINT "account_restriction_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_moderation_events" ADD CONSTRAINT "page_statement_moderation_events_revision_id_page_statement_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."page_statement_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_moderation_events" ADD CONSTRAINT "page_statement_moderation_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_publication_events" ADD CONSTRAINT "page_statement_publication_events_medicine_id_drugs_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."drugs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_publication_events" ADD CONSTRAINT "page_statement_publication_events_revision_id_page_statement_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."page_statement_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_publication_events" ADD CONSTRAINT "page_statement_publication_events_previous_revision_id_page_statement_revisions_id_fk" FOREIGN KEY ("previous_revision_id") REFERENCES "public"."page_statement_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_publication_events" ADD CONSTRAINT "page_statement_publication_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_publications" ADD CONSTRAINT "page_statement_publications_medicine_id_drugs_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."drugs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_publications" ADD CONSTRAINT "page_statement_publications_revision_fk" FOREIGN KEY ("revision_id","medicine_id","statement_key") REFERENCES "public"."page_statement_revisions"("id","medicine_id","statement_key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_review_states" ADD CONSTRAINT "page_statement_review_states_revision_id_page_statement_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."page_statement_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_reviews" ADD CONSTRAINT "page_statement_reviews_revision_id_page_statement_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."page_statement_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_reviews" ADD CONSTRAINT "page_statement_reviews_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_revisions" ADD CONSTRAINT "page_statement_revisions_medicine_id_drugs_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."drugs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_revisions" ADD CONSTRAINT "page_statement_revisions_claim_id_reviewed_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."reviewed_claims"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_revisions" ADD CONSTRAINT "page_statement_revisions_parent_revision_id_page_statement_revisions_id_fk" FOREIGN KEY ("parent_revision_id") REFERENCES "public"."page_statement_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_revisions" ADD CONSTRAINT "page_statement_revisions_baseline_revision_id_page_statement_revisions_id_fk" FOREIGN KEY ("baseline_revision_id") REFERENCES "public"."page_statement_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_statement_revisions" ADD CONSTRAINT "page_statement_revisions_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_restriction_events_target_idx" ON "account_restriction_events" USING btree ("target_user_id","created_at");--> statement-breakpoint
CREATE INDEX "page_statement_moderation_events_revision_idx" ON "page_statement_moderation_events" USING btree ("revision_id","created_at");--> statement-breakpoint
CREATE INDEX "page_statement_publication_events_subject_idx" ON "page_statement_publication_events" USING btree ("medicine_id","statement_key","created_at");--> statement-breakpoint
CREATE INDEX "page_statement_publication_events_slug_idx" ON "page_statement_publication_events" USING btree ("slug","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "page_statement_publications_revision_unique" ON "page_statement_publications" USING btree ("revision_id");--> statement-breakpoint
CREATE INDEX "page_statement_review_states_queue_idx" ON "page_statement_review_states" USING btree ("status","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "page_statement_reviews_reviewer_unique" ON "page_statement_reviews" USING btree ("revision_id","reviewer_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "page_statement_reviews_identity_unique" ON "page_statement_reviews" USING btree ("revision_id","reviewer_identity_key") WHERE withdrawn_at is null;--> statement-breakpoint
CREATE INDEX "page_statement_reviews_revision_idx" ON "page_statement_reviews" USING btree ("revision_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "page_statement_reviews_reviewer_idx" ON "page_statement_reviews" USING btree ("reviewer_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "page_statement_revisions_one_open" ON "page_statement_revisions" USING btree ("medicine_id","statement_key") WHERE status in ('draft', 'submitted', 'open', 'changes_requested', 'safety_hold');--> statement-breakpoint
CREATE UNIQUE INDEX "page_statement_revisions_one_published" ON "page_statement_revisions" USING btree ("medicine_id","statement_key") WHERE status = 'published';--> statement-breakpoint
CREATE UNIQUE INDEX "page_statement_revisions_parent_unique" ON "page_statement_revisions" USING btree ("parent_revision_id") WHERE parent_revision_id is not null;--> statement-breakpoint
CREATE INDEX "page_statement_revisions_queue_idx" ON "page_statement_revisions" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "page_statement_revisions_slug_idx" ON "page_statement_revisions" USING btree ("slug","status");--> statement-breakpoint
CREATE INDEX "page_statement_revisions_author_idx" ON "page_statement_revisions" USING btree ("author_user_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_restriction_shape" CHECK (("users"."restricted_at" is null and "users"."restriction_reason" is null)
        or ("users"."restricted_at" is not null and nullif(btrim("users"."restriction_reason"), '') is not null));--> statement-breakpoint

-- One lock per sentence. Every write that can change what a page shows for one statement takes it
-- first, so two members approving at the same moment are serialised rather than both publishing.
CREATE OR REPLACE FUNCTION rnawiki_lock_page_statement_subject(
  target_medicine_id varchar,
  target_statement_key page_statement_key
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtextextended('page-statement:' || target_medicine_id || ':' || target_statement_key::text, 0)
  );
END;
$$;--> statement-breakpoint

-- The derived review state of one revision, computed only from immutable decision rows.
--
-- A decision stops counting when it is withdrawn or when the reviewer declared a conflict. A
-- conflicted member may still comment and their decision stays in the audit; it simply does not
-- reach the threshold.
--
-- There is no adjudication. On a medical page a split resolves by not publishing: one request for
-- changes, or one rejection, ends the proposal immediately. Two approvals do not outvote a
-- rejection, and the author revises instead of waiting for a tie-break.
CREATE OR REPLACE FUNCTION rnawiki_expected_page_statement_review_state(
  target_revision_id varchar,
  approvals_required integer,
  qualified_required integer
)
RETURNS TABLE(
  expected_status page_statement_review_status,
  expected_review_count integer,
  expected_qualified_approvals integer
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  approve_count integer;
  changes_count integer;
  reject_count integer;
BEGIN
  IF approvals_required IS DISTINCT FROM 3 THEN
    RAISE EXCEPTION 'a page statement review policy requires three approvals';
  END IF;
  IF qualified_required IS NULL OR qualified_required < 0 OR qualified_required > approvals_required THEN
    RAISE EXCEPTION 'a page statement review policy names an impossible qualified quota';
  END IF;

  SELECT count(*)::integer,
         count(*) FILTER (WHERE decision = 'APPROVE')::integer,
         count(*) FILTER (WHERE decision = 'CHANGES_REQUESTED')::integer,
         count(*) FILTER (WHERE decision = 'REJECT')::integer,
         count(*) FILTER (WHERE decision = 'APPROVE' AND qualification_relevant)::integer
  INTO expected_review_count, approve_count, changes_count, reject_count, expected_qualified_approvals
  FROM page_statement_reviews
  WHERE revision_id = target_revision_id
    AND withdrawn_at IS NULL
    AND conflict_declared = false;

  IF expected_review_count > approvals_required THEN
    RAISE EXCEPTION 'a page statement revision may not exceed its required number of independent reviews';
  END IF;

  IF reject_count > 0 THEN
    expected_status := 'rejected';
  ELSIF changes_count > 0 THEN
    expected_status := 'changes_requested';
  ELSIF approve_count = approvals_required THEN
    IF expected_qualified_approvals < qualified_required THEN
      RAISE EXCEPTION 'a page statement revision reached three approvals without its required qualified reviewers';
    END IF;
    expected_status := 'approved';
  ELSIF approve_count = 2 THEN
    expected_status := 'awaiting_third_review';
  ELSIF approve_count = 1 THEN
    expected_status := 'awaiting_second_review';
  ELSE
    expected_status := 'awaiting_reviews';
  END IF;

  RETURN NEXT;
END;
$$;--> statement-breakpoint

-- The review state row is derived, never authored. A value that disagrees with the decisions is
-- refused rather than accepted and reconciled later.
CREATE OR REPLACE FUNCTION rnawiki_guard_page_statement_review_state()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  revision_row page_statement_revisions%ROWTYPE;
  derived_status page_statement_review_status;
  derived_count integer;
  derived_qualified integer;
  expected_qualified_required integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF NOT EXISTS (SELECT 1 FROM page_statement_revisions WHERE id = OLD.revision_id) THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'page statement review state cannot be deleted directly';
  END IF;

  SELECT * INTO revision_row FROM page_statement_revisions WHERE id = NEW.revision_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'a review state requires a page statement revision';
  END IF;

  expected_qualified_required := CASE revision_row.risk_class
    WHEN 'copy_only' THEN 0
    WHEN 'scientific_meaning' THEN 1
    WHEN 'high_risk' THEN 2
  END;
  IF NEW.required_qualified_approvals IS DISTINCT FROM expected_qualified_required THEN
    RAISE EXCEPTION 'a page statement qualified quota must match the revision risk class';
  END IF;

  -- Decisions already recorded were made under the policy the row opened with.
  IF TG_OP = 'UPDATE' AND (
       NEW.required_approvals IS DISTINCT FROM OLD.required_approvals
       OR NEW.required_qualified_approvals IS DISTINCT FROM OLD.required_qualified_approvals
       OR NEW.revision_id IS DISTINCT FROM OLD.revision_id
     ) THEN
    RAISE EXCEPTION 'a page statement review policy is fixed when the review state is created';
  END IF;

  SELECT expected_status, expected_review_count, expected_qualified_approvals
  INTO derived_status, derived_count, derived_qualified
  FROM rnawiki_expected_page_statement_review_state(
    NEW.revision_id,
    NEW.required_approvals,
    NEW.required_qualified_approvals
  );

  IF NEW.status IS DISTINCT FROM derived_status
     OR NEW.review_count IS DISTINCT FROM derived_count
     OR NEW.qualified_approvals IS DISTINCT FROM derived_qualified THEN
    RAISE EXCEPTION 'page statement review state must equal the state derived from immutable decisions';
  END IF;

  -- Audit clocks are database-owned. Caller timestamps are ignored rather than authenticated.
  NEW.updated_at := clock_timestamp();
  NEW.resolved_at := CASE
    WHEN derived_status IN ('approved', 'changes_requested', 'rejected')
      THEN CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.resolved_at, clock_timestamp())
                ELSE clock_timestamp() END
    ELSE NULL
  END;
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_sync_page_statement_review_state(target_revision_id varchar)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  state_row page_statement_review_states%ROWTYPE;
  derived_status page_statement_review_status;
  derived_count integer;
  derived_qualified integer;
BEGIN
  SELECT * INTO state_row FROM page_statement_review_states WHERE revision_id = target_revision_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'an open page statement revision is missing its review state';
  END IF;

  SELECT expected_status, expected_review_count, expected_qualified_approvals
  INTO derived_status, derived_count, derived_qualified
  FROM rnawiki_expected_page_statement_review_state(
    target_revision_id,
    state_row.required_approvals,
    state_row.required_qualified_approvals
  );

  UPDATE page_statement_review_states
  SET status = derived_status,
      review_count = derived_count,
      qualified_approvals = derived_qualified,
      updated_at = clock_timestamp(),
      resolved_at = CASE
        WHEN derived_status IN ('approved', 'changes_requested', 'rejected')
          THEN COALESCE(resolved_at, clock_timestamp())
        ELSE NULL
      END
  WHERE revision_id = target_revision_id;
END;
$$;--> statement-breakpoint

-- Every rule that decides whether one person may sign one wording, in the database rather than only
-- in the interface. A request that reaches Postgres with a forged role, a stale digest or somebody
-- else's name is refused here.
CREATE OR REPLACE FUNCTION rnawiki_guard_page_statement_review()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  revision_row page_statement_revisions%ROWTYPE;
  reviewer_row users%ROWTYPE;
  state_row page_statement_review_states%ROWTYPE;
  approve_count integer;
  qualified_count integer;
  expected_identity_key varchar;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF NOT EXISTS (SELECT 1 FROM page_statement_revisions WHERE id = OLD.revision_id) THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'page statement reviews are immutable append-only decisions';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- A reviewer may take a decision back before publication. Nothing else about the row moves,
    -- and the decision itself stays readable in the audit.
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.revision_id IS DISTINCT FROM OLD.revision_id
       OR NEW.reviewer_user_id IS DISTINCT FROM OLD.reviewer_user_id
       OR NEW.decision IS DISTINCT FROM OLD.decision
       OR NEW.content_digest IS DISTINCT FROM OLD.content_digest
       OR NEW.source_digest IS DISTINCT FROM OLD.source_digest
       OR NEW.qualification_snapshot IS DISTINCT FROM OLD.qualification_snapshot
       OR NEW.qualification_relevant IS DISTINCT FROM OLD.qualification_relevant
       OR NEW.conflict_declared IS DISTINCT FROM OLD.conflict_declared
       OR NEW.reviewer_identity_key IS DISTINCT FROM OLD.reviewer_identity_key
       OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at THEN
      RAISE EXCEPTION 'only a withdrawal may change a recorded page statement review';
    END IF;
    IF OLD.withdrawn_at IS NOT NULL THEN
      RAISE EXCEPTION 'a withdrawn page statement review cannot be changed again';
    END IF;
    IF NEW.withdrawn_at IS NULL THEN
      RAISE EXCEPTION 'a recorded page statement review cannot be un-withdrawn';
    END IF;
    SELECT * INTO revision_row FROM page_statement_revisions WHERE id = NEW.revision_id FOR SHARE;
    IF revision_row.status IN ('published', 'superseded') THEN
      RAISE EXCEPTION 'a review cannot be withdrawn after the wording has been published';
    END IF;
    NEW.withdrawn_at := clock_timestamp();
    RETURN NEW;
  END IF;

  SELECT * INTO revision_row FROM page_statement_revisions WHERE id = NEW.revision_id FOR SHARE;
  IF NOT FOUND OR revision_row.status NOT IN ('submitted', 'open') THEN
    RAISE EXCEPTION 'a review requires a page statement revision that is open for review';
  END IF;
  PERFORM rnawiki_lock_page_statement_subject(revision_row.medicine_id, revision_row.statement_key);

  SELECT * INTO state_row FROM page_statement_review_states WHERE revision_id = NEW.revision_id FOR UPDATE;
  IF NOT FOUND
     OR state_row.status NOT IN ('awaiting_reviews', 'awaiting_second_review', 'awaiting_third_review') THEN
    RAISE EXCEPTION 'this page statement revision is not accepting reviews';
  END IF;

  IF NEW.reviewer_user_id = revision_row.author_user_id THEN
    RAISE EXCEPTION 'the author of a wording cannot approve their own wording';
  END IF;

  -- Approvals are signed against an exact revision. Editing a proposal writes a new row with a new
  -- digest, so the old approvals cannot follow the text they were not given for.
  IF NEW.content_digest_algorithm <> revision_row.content_digest_algorithm
     OR NEW.content_digest <> revision_row.content_digest THEN
    RAISE EXCEPTION 'a page statement review must bind the exact frozen wording digest';
  END IF;
  IF NEW.source_digest <> revision_row.source_digest THEN
    RAISE EXCEPTION 'a page statement review must bind the exact recorded surface the wording was judged against';
  END IF;

  SELECT * INTO reviewer_row FROM users WHERE id = NEW.reviewer_user_id FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'a page statement review requires an existing account';
  END IF;
  IF reviewer_row.restricted_at IS NOT NULL THEN
    RAISE EXCEPTION 'a restricted account cannot record a page statement review';
  END IF;
  IF NOT (reviewer_row.is_admin OR reviewer_row.trust_tier IN ('trusted', 'steward')) THEN
    RAISE EXCEPTION 'page statement reviews require a trusted editor, steward, or administrator';
  END IF;
  IF NEW.reviewer_name_snapshot IS DISTINCT FROM reviewer_row.name
     OR NEW.reviewer_orcid_snapshot IS DISTINCT FROM reviewer_row.orcid
     OR NEW.reviewer_trust_tier_snapshot IS DISTINCT FROM reviewer_row.trust_tier THEN
    RAISE EXCEPTION 'page statement reviewer attribution must match the authenticated public profile';
  END IF;

  -- One person, one vote. An ORCID identifies a person; a user id only identifies an account, so
  -- two accounts sharing an ORCID are one reviewer and the partial unique index refuses the second.
  expected_identity_key := CASE
    WHEN reviewer_row.orcid IS NULL THEN 'user:' || reviewer_row.id
    ELSE 'orcid:' || lower(reviewer_row.orcid)
  END;
  IF NEW.reviewer_identity_key IS DISTINCT FROM expected_identity_key THEN
    RAISE EXCEPTION 'a page statement review must carry the reviewer identity the account resolves to';
  END IF;

  -- A qualification is snapshotted with the vote and never re-read later, so a grant or a
  -- revocation after the fact cannot rewrite what a published wording was approved against.
  IF NEW.qualification_relevant AND cardinality(NEW.qualification_snapshot) = 0 THEN
    RAISE EXCEPTION 'a relevant qualification claim needs a recorded qualification behind it';
  END IF;

  SELECT count(*) FILTER (WHERE decision = 'APPROVE')::integer,
         count(*) FILTER (WHERE decision = 'APPROVE' AND qualification_relevant)::integer
  INTO approve_count, qualified_count
  FROM page_statement_reviews
  WHERE revision_id = NEW.revision_id AND withdrawn_at IS NULL AND conflict_declared = false;

  -- Refuse the approval that would fill the last slot while leaving the qualified quota short,
  -- rather than accepting it and deadlocking a proposal that can never reach its own bar.
  IF NEW.decision = 'APPROVE' AND NEW.conflict_declared = false THEN
    IF approve_count >= state_row.required_approvals THEN
      RAISE EXCEPTION 'a page statement revision may not exceed its required number of independent reviews';
    END IF;
    IF approve_count + 1 = state_row.required_approvals
       AND qualified_count + (CASE WHEN NEW.qualification_relevant THEN 1 ELSE 0 END)
           < state_row.required_qualified_approvals THEN
      RAISE EXCEPTION 'this wording still needs an approval from a member with a relevant recorded qualification';
    END IF;
  END IF;

  NEW.reviewed_at := clock_timestamp();
  NEW.withdrawn_at := NULL;
  NEW.withdrawn_reason := NULL;
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_after_page_statement_review()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF EXISTS (SELECT 1 FROM page_statement_review_states WHERE revision_id = OLD.revision_id) THEN
      PERFORM rnawiki_sync_page_statement_review_state(OLD.revision_id);
    END IF;
    RETURN OLD;
  END IF;
  PERFORM rnawiki_sync_page_statement_review_state(NEW.revision_id);
  RETURN NEW;
END;
$$;--> statement-breakpoint

-- A submitted wording is frozen. Its text, its digests, its category and its risk class cannot
-- move; only its place in the workflow can. An edit is a new revision, which is what resets the
-- approvals to zero.
CREATE OR REPLACE FUNCTION rnawiki_guard_page_statement_revision()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'page statement revisions are an audit record and cannot be deleted';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('draft', 'submitted', 'open') THEN
      RAISE EXCEPTION 'a page statement revision starts as a draft or an open proposal';
    END IF;
    NEW.created_at := clock_timestamp();
    NEW.updated_at := clock_timestamp();
    RETURN NEW;
  END IF;

  IF OLD.status <> 'draft' AND (
       NEW.proposed_text IS DISTINCT FROM OLD.proposed_text
       OR NEW.current_text IS DISTINCT FROM OLD.current_text
       OR NEW.reason IS DISTINCT FROM OLD.reason
       OR NEW.change_category IS DISTINCT FROM OLD.change_category
       OR NEW.risk_class IS DISTINCT FROM OLD.risk_class
       OR NEW.evidence_state IS DISTINCT FROM OLD.evidence_state
       OR NEW.content_digest IS DISTINCT FROM OLD.content_digest
       OR NEW.source_digest IS DISTINCT FROM OLD.source_digest
       OR NEW.statement_key IS DISTINCT FROM OLD.statement_key
       OR NEW.medicine_id IS DISTINCT FROM OLD.medicine_id
       OR NEW.author_user_id IS DISTINCT FROM OLD.author_user_id
       OR NEW.sources IS DISTINCT FROM OLD.sources
       OR NEW.evidence_packet IS DISTINCT FROM OLD.evidence_packet
     ) THEN
    RAISE EXCEPTION 'a submitted page statement wording is frozen; an edit is a new revision';
  END IF;

  IF OLD.status = 'published' AND NEW.status NOT IN ('published', 'superseded') THEN
    RAISE EXCEPTION 'a published wording leaves publication only by being superseded';
  END IF;

  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END;
$$;--> statement-breakpoint

-- The public pointer may name only a published revision, and only one of this medicine's own.
CREATE OR REPLACE FUNCTION rnawiki_guard_page_statement_publication()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  revision_row page_statement_revisions%ROWTYPE;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  SELECT * INTO revision_row FROM page_statement_revisions WHERE id = NEW.revision_id FOR SHARE;
  IF NOT FOUND OR revision_row.status <> 'published' THEN
    RAISE EXCEPTION 'a page statement publication pointer requires a published revision';
  END IF;
  IF revision_row.medicine_id <> NEW.medicine_id OR revision_row.statement_key <> NEW.statement_key THEN
    RAISE EXCEPTION 'a page statement publication pointer cannot name another subject';
  END IF;
  NEW.published_at := clock_timestamp();
  RETURN NEW;
END;
$$;--> statement-breakpoint

-- Ledgers. A correction to one of these is a new row, never an edit.
CREATE OR REPLACE FUNCTION rnawiki_reject_page_statement_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'this ledger is append-only';
END;
$$;--> statement-breakpoint

-- The restriction ledger and the standing on the account move together, so a restriction cannot be
-- applied without a reason anyone can read back.
CREATE OR REPLACE FUNCTION rnawiki_after_account_restriction_event()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.action = 'RESTRICT' THEN
    UPDATE users
    SET restricted_at = clock_timestamp(), restriction_reason = NEW.reason
    WHERE id = NEW.target_user_id;
  ELSE
    UPDATE users
    SET restricted_at = NULL, restriction_reason = NULL
    WHERE id = NEW.target_user_id;
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER page_statement_revisions_guard_trigger
BEFORE INSERT OR UPDATE OR DELETE ON page_statement_revisions
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_page_statement_revision();--> statement-breakpoint

CREATE TRIGGER page_statement_review_states_guard_trigger
BEFORE INSERT OR UPDATE OR DELETE ON page_statement_review_states
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_page_statement_review_state();--> statement-breakpoint

CREATE TRIGGER page_statement_reviews_guard_trigger
BEFORE INSERT OR UPDATE OR DELETE ON page_statement_reviews
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_page_statement_review();--> statement-breakpoint

CREATE TRIGGER page_statement_reviews_sync_trigger
AFTER INSERT OR UPDATE OR DELETE ON page_statement_reviews
FOR EACH ROW EXECUTE FUNCTION rnawiki_after_page_statement_review();--> statement-breakpoint

CREATE TRIGGER page_statement_publications_guard_trigger
BEFORE INSERT OR UPDATE OR DELETE ON page_statement_publications
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_page_statement_publication();--> statement-breakpoint

CREATE TRIGGER page_statement_publication_events_append_only_trigger
BEFORE UPDATE OR DELETE ON page_statement_publication_events
FOR EACH ROW EXECUTE FUNCTION rnawiki_reject_page_statement_ledger_mutation();--> statement-breakpoint

CREATE TRIGGER page_statement_moderation_events_append_only_trigger
BEFORE UPDATE OR DELETE ON page_statement_moderation_events
FOR EACH ROW EXECUTE FUNCTION rnawiki_reject_page_statement_ledger_mutation();--> statement-breakpoint

CREATE TRIGGER account_restriction_events_append_only_trigger
BEFORE UPDATE OR DELETE ON account_restriction_events
FOR EACH ROW EXECUTE FUNCTION rnawiki_reject_page_statement_ledger_mutation();--> statement-breakpoint

CREATE TRIGGER account_restriction_events_apply_trigger
AFTER INSERT ON account_restriction_events
FOR EACH ROW EXECUTE FUNCTION rnawiki_after_account_restriction_event();
