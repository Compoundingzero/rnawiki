-- Accepted contributions become exact canonical candidates; they never publish directly.
CREATE TABLE "programme_contribution_implementations" (
	"proposal_id" varchar(64) PRIMARY KEY NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"proposal_key" varchar(64) NOT NULL,
	"verdict_revision_id" varchar(64) NOT NULL,
	"implemented_by_user_id" varchar(64) NOT NULL,
	"contribution_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"contribution_digest" varchar(64) NOT NULL,
	"source_review_task_id" varchar(64),
	"source_id" varchar(64),
	"source_snapshot_id" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_contribution_implementations_digest" CHECK ("programme_contribution_implementations"."contribution_digest_algorithm" = 'sha256'
        and "programme_contribution_implementations"."contribution_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "programme_contribution_implementations_source_shape" CHECK ((
          "programme_contribution_implementations"."source_review_task_id" is null
          and "programme_contribution_implementations"."source_id" is null
          and "programme_contribution_implementations"."source_snapshot_id" is null
        ) or (
          "programme_contribution_implementations"."source_review_task_id" is not null
          and "programme_contribution_implementations"."source_id" is not null
          and "programme_contribution_implementations"."source_snapshot_id" is not null
        ))
);
--> statement-breakpoint
CREATE TABLE "programme_contribution_source_task_resolutions" (
	"proposal_id" varchar(64) PRIMARY KEY NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"proposal_key" varchar(64) NOT NULL,
	"source_review_task_id" varchar(64) NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"source_snapshot_id" varchar(64) NOT NULL,
	"resolved_by_user_id" varchar(64) NOT NULL,
	"contribution_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"contribution_digest" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_source_task_resolutions_digest" CHECK ("programme_contribution_source_task_resolutions"."contribution_digest_algorithm" = 'sha256'
        and "programme_contribution_source_task_resolutions"."contribution_digest" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "programme_verdict_adjudications" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"verdict_revision_id" varchar(64) NOT NULL,
	"adjudicator_user_id" varchar(64) NOT NULL,
	"adjudicator_name_snapshot" varchar(160) NOT NULL,
	"adjudicator_orcid_snapshot" varchar(32),
	"expertise_tags" "verdict_reviewer_expertise"[] NOT NULL,
	"decision" "verdict_review_decision" NOT NULL,
	"rationale" text NOT NULL,
	"conflicts_of_interest" text NOT NULL,
	"conflicts_of_interest_attested" boolean DEFAULT false NOT NULL,
	"proposal_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"proposal_digest" varchar(64) NOT NULL,
	"engine_version" varchar(64) NOT NULL,
	"input_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL,
	"input_digest" varchar(64) NOT NULL,
	"adjudicated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_adjudications_expertise" CHECK (cardinality("programme_verdict_adjudications"."expertise_tags") > 0),
	CONSTRAINT "programme_verdict_adjudications_complete" CHECK (nullif(btrim("programme_verdict_adjudications"."rationale"), '') is not null
        and nullif(btrim("programme_verdict_adjudications"."conflicts_of_interest"), '') is not null
        and "programme_verdict_adjudications"."conflicts_of_interest_attested"),
	CONSTRAINT "programme_verdict_adjudications_digest" CHECK ("programme_verdict_adjudications"."proposal_digest_algorithm" = 'sha256'
        and "programme_verdict_adjudications"."input_digest_algorithm" = 'sha256'
        and "programme_verdict_adjudications"."proposal_digest" ~ '^[0-9a-f]{64}$'
        and "programme_verdict_adjudications"."input_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "programme_verdict_adjudications_orcid" CHECK ("programme_verdict_adjudications"."adjudicator_orcid_snapshot" is null or "programme_verdict_adjudications"."adjudicator_orcid_snapshot" ~ '^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$')
);
--> statement-breakpoint
CREATE TABLE "programme_verdict_reviewer_qualification_events" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"reviewer_user_id" varchar(64) NOT NULL,
	"expertise_tag" "verdict_reviewer_expertise" NOT NULL,
	"action" varchar(16) NOT NULL,
	"authorized_by_user_id" varchar(64) NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_qualification_action" CHECK ("programme_verdict_reviewer_qualification_events"."action" in ('GRANT', 'REVOKE')),
	CONSTRAINT "programme_verdict_qualification_reason" CHECK (nullif(btrim("programme_verdict_reviewer_qualification_events"."reason"), '') is not null),
	CONSTRAINT "programme_verdict_qualification_no_self_grant" CHECK ("programme_verdict_reviewer_qualification_events"."reviewer_user_id" <> "programme_verdict_reviewer_qualification_events"."authorized_by_user_id")
);
--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD COLUMN "resolved_by_user_id" varchar(64);--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD COLUMN "resolution_verdict_revision_id" varchar(64);--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD COLUMN "resolution_contribution_proposal_id" varchar(64);--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD COLUMN "source_review_task_id" varchar(64);--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD COLUMN "source_review_snapshot_id" varchar(64);--> statement-breakpoint
ALTER TABLE "programme_contribution_implementations" ADD CONSTRAINT "programme_contribution_implementations_implemented_by_user_id_users_id_fk" FOREIGN KEY ("implemented_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_implementations" ADD CONSTRAINT "programme_contribution_implementations_source_review_task_id_evidence_review_tasks_id_fk" FOREIGN KEY ("source_review_task_id") REFERENCES "public"."evidence_review_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_implementations" ADD CONSTRAINT "programme_contribution_implementations_source_id_evidence_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_implementations" ADD CONSTRAINT "programme_contribution_implementations_proposal_scope_fk" FOREIGN KEY ("proposal_id","programme_id","proposal_key") REFERENCES "public"."programme_contribution_proposals"("id","programme_id","proposal_key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_implementations" ADD CONSTRAINT "programme_contribution_implementations_verdict_programme_fk" FOREIGN KEY ("verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_implementations" ADD CONSTRAINT "programme_contribution_implementations_snapshot_source_fk" FOREIGN KEY ("source_snapshot_id","source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_source_task_resolutions" ADD CONSTRAINT "programme_contribution_source_task_resolutions_source_review_task_id_evidence_review_tasks_id_fk" FOREIGN KEY ("source_review_task_id") REFERENCES "public"."evidence_review_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_source_task_resolutions" ADD CONSTRAINT "programme_contribution_source_task_resolutions_source_id_evidence_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_source_task_resolutions" ADD CONSTRAINT "programme_contribution_source_task_resolutions_resolved_by_user_id_users_id_fk" FOREIGN KEY ("resolved_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_source_task_resolutions" ADD CONSTRAINT "programme_source_task_resolutions_proposal_scope_fk" FOREIGN KEY ("proposal_id","programme_id","proposal_key") REFERENCES "public"."programme_contribution_proposals"("id","programme_id","proposal_key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_source_task_resolutions" ADD CONSTRAINT "programme_source_task_resolutions_snapshot_source_fk" FOREIGN KEY ("source_snapshot_id","source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_adjudications" ADD CONSTRAINT "programme_verdict_adjudications_verdict_revision_id_programme_verdict_revisions_id_fk" FOREIGN KEY ("verdict_revision_id") REFERENCES "public"."programme_verdict_revisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_adjudications" ADD CONSTRAINT "programme_verdict_adjudications_adjudicator_user_id_users_id_fk" FOREIGN KEY ("adjudicator_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_reviewer_qualification_events" ADD CONSTRAINT "programme_verdict_reviewer_qualification_events_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_reviewer_qualification_events" ADD CONSTRAINT "programme_verdict_reviewer_qualification_events_authorized_by_user_id_users_id_fk" FOREIGN KEY ("authorized_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "programme_contribution_implementations_verdict_unique" ON "programme_contribution_implementations" USING btree ("verdict_revision_id");--> statement-breakpoint
CREATE UNIQUE INDEX "programme_contribution_implementations_source_task_unique" ON "programme_contribution_implementations" USING btree ("source_review_task_id") WHERE "programme_contribution_implementations"."source_review_task_id" is not null;--> statement-breakpoint
CREATE INDEX "programme_contribution_implementations_programme_idx" ON "programme_contribution_implementations" USING btree ("programme_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "programme_source_task_resolutions_task_unique" ON "programme_contribution_source_task_resolutions" USING btree ("source_review_task_id");--> statement-breakpoint
CREATE INDEX "programme_source_task_resolutions_programme_idx" ON "programme_contribution_source_task_resolutions" USING btree ("programme_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "programme_verdict_adjudications_revision_unique" ON "programme_verdict_adjudications" USING btree ("verdict_revision_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_adjudications_user_idx" ON "programme_verdict_adjudications" USING btree ("adjudicator_user_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_qualification_reviewer_idx" ON "programme_verdict_reviewer_qualification_events" USING btree ("reviewer_user_id","expertise_tag","created_at");--> statement-breakpoint
CREATE INDEX "programme_verdict_qualification_authorizer_idx" ON "programme_verdict_reviewer_qualification_events" USING btree ("authorized_by_user_id","created_at");--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD CONSTRAINT "evidence_review_tasks_resolved_by_user_id_users_id_fk" FOREIGN KEY ("resolved_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD CONSTRAINT "evidence_review_tasks_resolution_verdict_revision_id_programme_verdict_revisions_id_fk" FOREIGN KEY ("resolution_verdict_revision_id") REFERENCES "public"."programme_verdict_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD CONSTRAINT "evidence_review_tasks_resolution_contribution_proposal_id_programme_contribution_proposals_id_fk" FOREIGN KEY ("resolution_contribution_proposal_id") REFERENCES "public"."programme_contribution_proposals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contribution_proposals_source_review_task_id_evidence_review_tasks_id_fk" FOREIGN KEY ("source_review_task_id") REFERENCES "public"."evidence_review_tasks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contribution_proposals_source_review_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("source_review_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evidence_review_tasks_resolution_verdict_idx" ON "evidence_review_tasks" USING btree ("resolution_verdict_revision_id");--> statement-breakpoint
CREATE INDEX "evidence_review_tasks_resolution_contribution_idx" ON "evidence_review_tasks" USING btree ("resolution_contribution_proposal_id");--> statement-breakpoint
CREATE INDEX "programme_contributions_source_task_idx" ON "programme_contribution_proposals" USING btree ("source_review_task_id");--> statement-breakpoint
ALTER TABLE "evidence_review_tasks" ADD CONSTRAINT "evidence_review_tasks_published_resolution" CHECK ("evidence_review_tasks"."status" <> 'RESOLVED' or (
        "evidence_review_tasks"."resolved_by_user_id" is not null
        and (
          ("evidence_review_tasks"."resolution_verdict_revision_id" is not null and "evidence_review_tasks"."resolution_contribution_proposal_id" is null)
          or ("evidence_review_tasks"."resolution_verdict_revision_id" is null and "evidence_review_tasks"."resolution_contribution_proposal_id" is not null)
        )
        and nullif(btrim("evidence_review_tasks"."resolution_note"), '') is not null
      ));--> statement-breakpoint
ALTER TABLE "programme_contribution_proposals" ADD CONSTRAINT "programme_contributions_source_review_shape" CHECK (("programme_contribution_proposals"."source_review_task_id" is null and "programme_contribution_proposals"."source_review_snapshot_id" is null)
        or ("programme_contribution_proposals"."source_review_task_id" is not null and "programme_contribution_proposals"."source_review_snapshot_id" is not null));
--> statement-breakpoint

-- Scientific qualification is an independently authorized, append-only fact. It is never
-- inferred from trust tier or a self-selected profile tag.
CREATE OR REPLACE FUNCTION "rnawiki_guard_verdict_qualification_event"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	latest_action varchar;
	authorizer_ok boolean;
BEGIN
	IF TG_OP <> 'INSERT' THEN
		RAISE EXCEPTION 'canonical reviewer qualification events are append-only'
			USING ERRCODE = '55000';
	END IF;

	PERFORM pg_advisory_xact_lock(
		hashtextextended('verdict-qualification:' || NEW."reviewer_user_id" || ':' || NEW."expertise_tag"::text, 0)
	);
	SELECT ("is_admin" OR "trust_tier" = 'steward') INTO authorizer_ok
	FROM "users"
	WHERE "id" = NEW."authorized_by_user_id"
	FOR SHARE;
	IF authorizer_ok IS DISTINCT FROM true THEN
		RAISE EXCEPTION 'canonical reviewer qualifications require a steward or administrator'
			USING ERRCODE = '42501';
	END IF;
	IF NEW."reviewer_user_id" = NEW."authorized_by_user_id"
		OR NOT EXISTS (SELECT 1 FROM "users" WHERE "id" = NEW."reviewer_user_id") THEN
		RAISE EXCEPTION 'qualification decisions require a different existing reviewer'
			USING ERRCODE = '23514';
	END IF;

	SELECT event."action" INTO latest_action
	FROM "programme_verdict_reviewer_qualification_events" event
	WHERE event."reviewer_user_id" = NEW."reviewer_user_id"
		AND event."expertise_tag" = NEW."expertise_tag"
	ORDER BY event."created_at" DESC, event."id" DESC
	LIMIT 1;
	IF (NEW."action" = 'GRANT' AND latest_action = 'GRANT')
		OR (NEW."action" = 'REVOKE' AND latest_action IS DISTINCT FROM 'GRANT') THEN
		RAISE EXCEPTION 'qualification event does not change the active qualification state'
			USING ERRCODE = '23514';
	END IF;

	NEW."created_at" := clock_timestamp();
	RETURN NEW;
END;
$$;--> statement-breakpoint
DROP TRIGGER IF EXISTS "programme_verdict_qualification_events_append_only"
ON "programme_verdict_reviewer_qualification_events";--> statement-breakpoint
CREATE TRIGGER "programme_verdict_qualification_events_append_only"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_reviewer_qualification_events"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_qualification_event"();--> statement-breakpoint

-- Existing pre-0009 duplicates are never silently collapsed into a canonical quorum. Publication
-- explicitly rejects them; all new inserts are serialized and limited to one decision per person
-- and two decisions in total.
CREATE OR REPLACE FUNCTION "rnawiki_guard_verdict_review_append"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	verdict_row "programme_verdict_revisions"%ROWTYPE;
	reviewer_row "users"%ROWTYPE;
	review_count integer;
	contribution_author_id varchar;
	tag "verdict_reviewer_expertise";
	latest_action varchar;
BEGIN
	IF TG_OP IN ('UPDATE', 'DELETE') THEN
		SELECT * INTO verdict_row
		FROM "programme_verdict_revisions"
		WHERE "id" = OLD."verdict_revision_id";
		IF TG_OP = 'DELETE' AND (
			NOT FOUND OR NOT EXISTS (
				SELECT 1 FROM "development_programmes" WHERE "id" = verdict_row."programme_id"
			)
		) THEN
			RETURN OLD;
		END IF;
		RAISE EXCEPTION 'canonical programme-conclusion reviews are immutable append-only decisions'
			USING ERRCODE = '55000';
	END IF;

	PERFORM pg_advisory_xact_lock(
		hashtextextended('canonical-review:' || NEW."verdict_revision_id", 0)
	);
	SELECT * INTO verdict_row
	FROM "programme_verdict_revisions"
	WHERE "id" = NEW."verdict_revision_id"
	FOR SHARE;
	IF NOT FOUND OR verdict_row."review_status" NOT IN ('AWAITING_REVIEW', 'APPROVED')
		OR verdict_row."proposal_digest" IS NULL OR verdict_row."input_digest" IS NULL THEN
		RAISE EXCEPTION 'reviews require one prepared, unpublished canonical candidate'
			USING ERRCODE = '23514';
	END IF;

	SELECT count(*) INTO review_count
	FROM "programme_verdict_reviews"
	WHERE "verdict_revision_id" = NEW."verdict_revision_id";
	IF review_count >= 2 THEN
		RAISE EXCEPTION 'a canonical candidate accepts exactly two review decisions at most'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1 FROM "programme_verdict_reviews"
		WHERE "verdict_revision_id" = NEW."verdict_revision_id"
			AND "reviewer_user_id" = NEW."reviewer_user_id"
	) THEN
		RAISE EXCEPTION 'each reviewer may sign a canonical candidate exactly once'
			USING ERRCODE = '23505';
	END IF;

	SELECT * INTO reviewer_row FROM "users"
	WHERE "id" = NEW."reviewer_user_id"
	FOR SHARE;
	SELECT proposal."author_user_id" INTO contribution_author_id
	FROM "programme_contribution_implementations" implementation
	INNER JOIN "programme_contribution_proposals" proposal
		ON proposal."id" = implementation."proposal_id"
	WHERE implementation."verdict_revision_id" = NEW."verdict_revision_id";
	IF NOT FOUND THEN
		contribution_author_id := NULL;
	END IF;
	IF reviewer_row."id" IS NULL
		OR NOT (reviewer_row."is_admin" OR reviewer_row."trust_tier" IN ('trusted', 'steward'))
		OR NEW."reviewer_user_id" = verdict_row."author_user_id"
		OR NEW."reviewer_user_id" = contribution_author_id
		OR NEW."is_independent" IS DISTINCT FROM true THEN
		RAISE EXCEPTION 'canonical reviewers must be qualified, trusted, and independent of every author'
			USING ERRCODE = '23514';
	END IF;
	IF NEW."reviewer_name" IS DISTINCT FROM reviewer_row."name"
		OR NEW."reviewer_orcid_snapshot" IS DISTINCT FROM reviewer_row."orcid" THEN
		RAISE EXCEPTION 'canonical reviewer attribution must match the authenticated public profile'
			USING ERRCODE = '23514';
	END IF;
	IF NEW."proposal_digest_algorithm" <> 'sha256'
		OR NEW."proposal_digest" IS DISTINCT FROM verdict_row."proposal_digest"
		OR NEW."engine_version" IS DISTINCT FROM verdict_row."engine_version"
		OR NEW."input_digest_algorithm" <> 'sha256'
		OR NEW."input_digest" IS DISTINCT FROM verdict_row."input_digest" THEN
		RAISE EXCEPTION 'canonical review signature does not match the exact prepared bundle'
			USING ERRCODE = '23514';
	END IF;
	IF cardinality(NEW."expertise_tags") = 0
		OR NEW."conflicts_of_interest_attested" IS DISTINCT FROM true
		OR nullif(btrim(NEW."conflicts_of_interest"), '') IS NULL
		OR (NEW."decision" <> 'APPROVE' AND nullif(btrim(NEW."review_note"), '') IS NULL) THEN
		RAISE EXCEPTION 'canonical review requires expertise, conflict attestation, and an adverse-decision rationale'
			USING ERRCODE = '23514';
	END IF;

	FOREACH tag IN ARRAY NEW."expertise_tags" LOOP
		SELECT event."action" INTO latest_action
		FROM "programme_verdict_reviewer_qualification_events" event
		WHERE event."reviewer_user_id" = NEW."reviewer_user_id"
			AND event."expertise_tag" = tag
		ORDER BY event."created_at" DESC, event."id" DESC
		LIMIT 1;
		IF latest_action IS DISTINCT FROM 'GRANT' THEN
			RAISE EXCEPTION 'every canonical review expertise tag requires an active steward-granted qualification'
				USING ERRCODE = '23514';
		END IF;
	END LOOP;

	NEW."reviewed_at" := clock_timestamp();
	RETURN NEW;
END;
$$;--> statement-breakpoint
DROP TRIGGER IF EXISTS "programme_verdict_reviews_append_only" ON "programme_verdict_reviews";--> statement-breakpoint
CREATE TRIGGER "programme_verdict_reviews_append_only"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_reviews"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_review_append"();--> statement-breakpoint

CREATE OR REPLACE FUNCTION "rnawiki_guard_verdict_adjudication"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	verdict_row "programme_verdict_revisions"%ROWTYPE;
	adjudicator_row "users"%ROWTYPE;
	contribution_author_id varchar;
	tag "verdict_reviewer_expertise";
	latest_action varchar;
	review_count integer;
	decision_count integer;
BEGIN
	IF TG_OP <> 'INSERT' THEN
		IF TG_OP = 'DELETE' AND NOT EXISTS (
			SELECT 1 FROM "programme_verdict_revisions" WHERE "id" = OLD."verdict_revision_id"
		) THEN
			RETURN OLD;
		END IF;
		RAISE EXCEPTION 'canonical adjudications are immutable append-only decisions'
			USING ERRCODE = '55000';
	END IF;

	PERFORM pg_advisory_xact_lock(
		hashtextextended('canonical-review:' || NEW."verdict_revision_id", 0)
	);
	SELECT * INTO verdict_row FROM "programme_verdict_revisions"
	WHERE "id" = NEW."verdict_revision_id"
	FOR SHARE;
	IF NOT FOUND OR verdict_row."review_status" NOT IN ('AWAITING_REVIEW', 'APPROVED') THEN
		RAISE EXCEPTION 'adjudication requires a prepared unpublished canonical candidate'
			USING ERRCODE = '23514';
	END IF;
	SELECT count(*), count(DISTINCT "decision")
	INTO review_count, decision_count
	FROM "programme_verdict_reviews"
	WHERE "verdict_revision_id" = NEW."verdict_revision_id";
	IF review_count <> 2 OR decision_count <> 2 THEN
		RAISE EXCEPTION 'adjudication is allowed only after exactly two reviewers disagree'
			USING ERRCODE = '23514';
	END IF;

	SELECT * INTO adjudicator_row FROM "users"
	WHERE "id" = NEW."adjudicator_user_id"
	FOR SHARE;
	SELECT proposal."author_user_id" INTO contribution_author_id
	FROM "programme_contribution_implementations" implementation
	INNER JOIN "programme_contribution_proposals" proposal
		ON proposal."id" = implementation."proposal_id"
	WHERE implementation."verdict_revision_id" = NEW."verdict_revision_id";
	IF NOT FOUND THEN
		contribution_author_id := NULL;
	END IF;
	IF adjudicator_row."id" IS NULL
		OR NOT (adjudicator_row."is_admin" OR adjudicator_row."trust_tier" = 'steward')
		OR NEW."adjudicator_user_id" = verdict_row."author_user_id"
		OR NEW."adjudicator_user_id" = contribution_author_id
		OR EXISTS (
			SELECT 1 FROM "programme_verdict_reviews"
			WHERE "verdict_revision_id" = NEW."verdict_revision_id"
				AND "reviewer_user_id" = NEW."adjudicator_user_id"
		) THEN
		RAISE EXCEPTION 'canonical adjudication requires a qualified independent steward'
			USING ERRCODE = '23514';
	END IF;
	IF NEW."adjudicator_name_snapshot" IS DISTINCT FROM adjudicator_row."name"
		OR NEW."adjudicator_orcid_snapshot" IS DISTINCT FROM adjudicator_row."orcid"
		OR NEW."proposal_digest_algorithm" <> 'sha256'
		OR NEW."proposal_digest" IS DISTINCT FROM verdict_row."proposal_digest"
		OR NEW."engine_version" IS DISTINCT FROM verdict_row."engine_version"
		OR NEW."input_digest_algorithm" <> 'sha256'
		OR NEW."input_digest" IS DISTINCT FROM verdict_row."input_digest" THEN
		RAISE EXCEPTION 'adjudication identity or signature does not match the exact prepared bundle'
			USING ERRCODE = '23514';
	END IF;

	FOREACH tag IN ARRAY NEW."expertise_tags" LOOP
		SELECT event."action" INTO latest_action
		FROM "programme_verdict_reviewer_qualification_events" event
		WHERE event."reviewer_user_id" = NEW."adjudicator_user_id"
			AND event."expertise_tag" = tag
		ORDER BY event."created_at" DESC, event."id" DESC
		LIMIT 1;
		IF latest_action IS DISTINCT FROM 'GRANT' THEN
			RAISE EXCEPTION 'every adjudicator expertise tag requires an active steward-granted qualification'
				USING ERRCODE = '23514';
		END IF;
	END LOOP;
	NEW."adjudicated_at" := clock_timestamp();
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "programme_verdict_adjudications_append_only"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_adjudications"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_adjudication"();--> statement-breakpoint

-- Prepared conclusion versions close from immutable review facts. Two approvals make the version
-- publication-eligible; matching adverse decisions, or an adverse adjudication after disagreement,
-- close it for changes. Application code cannot forge either state without the exact audit rows.
CREATE OR REPLACE FUNCTION "rnawiki_guard_verdict_revision_immutability"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	review_count integer;
	distinct_reviewer_count integer;
	distinct_decision_count integer;
BEGIN
	IF TG_OP = 'DELETE' THEN
		IF NOT EXISTS (
			SELECT 1 FROM "development_programmes" WHERE "id" = OLD."programme_id"
		) THEN
			RETURN OLD;
		END IF;
		IF OLD."proposal_prepared_at" IS NOT NULL
			OR OLD."review_status" IN (
				'AWAITING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED', 'PUBLISHED', 'SUPERSEDED'
			) THEN
			RAISE EXCEPTION 'prepared, reviewed, published and superseded verdict revisions are append-only'
				USING ERRCODE = '55000';
		END IF;
		RETURN OLD;
	END IF;

	IF OLD."review_status" = 'PUBLISHED' THEN
		IF NEW."review_status" <> 'SUPERSEDED'
			OR (to_jsonb(NEW) - ARRAY['review_status', 'superseded_at']::text[])
				IS DISTINCT FROM
				(to_jsonb(OLD) - ARRAY['review_status', 'superseded_at']::text[]) THEN
			RAISE EXCEPTION 'a PUBLISHED verdict may only transition intact to SUPERSEDED'
				USING ERRCODE = '55000';
		END IF;
		RETURN NEW;
	END IF;

	IF OLD."review_status" IN ('SUPERSEDED', 'CHANGES_REQUESTED') THEN
		RAISE EXCEPTION 'closed verdict revisions are immutable; prepare a new version instead'
			USING ERRCODE = '55000';
	END IF;

	IF OLD."review_status" = 'AWAITING_REVIEW' THEN
		IF NEW."review_status" NOT IN ('APPROVED', 'CHANGES_REQUESTED') THEN
			RAISE EXCEPTION 'a reviewed verdict must close from its immutable review decisions'
				USING ERRCODE = '55000';
		END IF;
		SELECT count(*), count(DISTINCT review."reviewer_user_id"), count(DISTINCT review."decision")
		INTO review_count, distinct_reviewer_count, distinct_decision_count
		FROM "programme_verdict_reviews" review
		WHERE review."verdict_revision_id" = OLD."id";
		IF review_count <> 2 OR distinct_reviewer_count <> 2 THEN
			RAISE EXCEPTION 'a verdict review state requires exactly two immutable independent decisions'
				USING ERRCODE = '23514';
		END IF;
		IF NEW."review_status" = 'APPROVED' AND NOT (
			(
				distinct_decision_count = 1
				AND NOT EXISTS (
					SELECT 1 FROM "programme_verdict_reviews" review
					WHERE review."verdict_revision_id" = OLD."id"
						AND review."decision" <> 'APPROVE'
				)
			)
			OR (
				distinct_decision_count = 2
				AND EXISTS (
					SELECT 1 FROM "programme_verdict_adjudications" adjudication
					WHERE adjudication."verdict_revision_id" = OLD."id"
						AND adjudication."decision" = 'APPROVE'
				)
			)
		) THEN
			RAISE EXCEPTION 'APPROVED must be derived from two approvals or an approving adjudication'
				USING ERRCODE = '23514';
		END IF;
		IF NEW."review_status" = 'CHANGES_REQUESTED' AND NOT (
			(
				distinct_decision_count = 1
				AND EXISTS (
					SELECT 1 FROM "programme_verdict_reviews" review
					WHERE review."verdict_revision_id" = OLD."id"
						AND review."decision" <> 'APPROVE'
				)
			)
			OR (
				distinct_decision_count = 2
				AND EXISTS (
					SELECT 1 FROM "programme_verdict_adjudications" adjudication
					WHERE adjudication."verdict_revision_id" = OLD."id"
						AND adjudication."decision" <> 'APPROVE'
				)
			)
		) THEN
			RAISE EXCEPTION 'CHANGES_REQUESTED must be derived from matching adverse reviews or adverse adjudication'
				USING ERRCODE = '23514';
		END IF;
		NEW."reviewed_at" := clock_timestamp();
		IF (to_jsonb(NEW) - ARRAY['review_status', 'reviewed_at']::text[])
			IS DISTINCT FROM
			(to_jsonb(OLD) - ARRAY['review_status', 'reviewed_at']::text[]) THEN
			RAISE EXCEPTION 'review closure may change only status and the database-owned review time'
				USING ERRCODE = '55000';
		END IF;
		RETURN NEW;
	END IF;

	IF OLD."review_status" = 'APPROVED' THEN
		IF NEW."review_status" <> 'PUBLISHED'
			OR (to_jsonb(NEW) - ARRAY['review_status', 'reviewed_at', 'published_at', 'superseded_at']::text[])
				IS DISTINCT FROM
				(to_jsonb(OLD) - ARRAY['review_status', 'reviewed_at', 'published_at', 'superseded_at']::text[]) THEN
			RAISE EXCEPTION 'an approved verdict may only publish intact'
				USING ERRCODE = '55000';
		END IF;
		RETURN NEW;
	END IF;

	IF OLD."proposal_prepared_at" IS NOT NULL THEN
		RAISE EXCEPTION 'a prepared verdict proposal is frozen; create a new version for content changes'
			USING ERRCODE = '55000';
	END IF;

	RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "rnawiki_guard_contribution_implementation"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	proposal_row "programme_contribution_proposals"%ROWTYPE;
	candidate_row "programme_verdict_revisions"%ROWTYPE;
	actor_ok boolean;
	current_verdict_id varchar;
BEGIN
	IF TG_OP <> 'INSERT' THEN
		IF TG_OP = 'DELETE' AND NOT EXISTS (
			SELECT 1 FROM "development_programmes" WHERE "id" = OLD."programme_id"
		) THEN
			RETURN OLD;
		END IF;
		RAISE EXCEPTION 'accepted-contribution implementation records are immutable'
			USING ERRCODE = '55000';
	END IF;
	PERFORM rnawiki_lock_programme_contribution_lineage(NEW."programme_id", NEW."proposal_key");
	PERFORM pg_advisory_xact_lock(
		hashtextextended('canonical-review:' || NEW."verdict_revision_id", 0)
	);

	SELECT * INTO proposal_row FROM "programme_contribution_proposals"
	WHERE "id" = NEW."proposal_id"
	FOR SHARE;
	SELECT * INTO candidate_row FROM "programme_verdict_revisions"
	WHERE "id" = NEW."verdict_revision_id"
	FOR SHARE;
	SELECT ("is_admin" OR "trust_tier" = 'steward') INTO actor_ok
	FROM "users" WHERE "id" = NEW."implemented_by_user_id" FOR SHARE;
	SELECT "verdict_revision_id" INTO current_verdict_id
	FROM "programme_current_publications"
	WHERE "programme_id" = NEW."programme_id"
	FOR SHARE;

	IF proposal_row."id" IS NULL
		OR proposal_row."status" <> 'SUBMITTED'
		OR proposal_row."content_digest" IS NULL
		OR NOT EXISTS (
			SELECT 1 FROM "programme_contribution_review_states" state
			WHERE state."proposal_id" = proposal_row."id"
				AND state."status" = 'ACCEPTED_FOR_IMPLEMENTATION'
		)
		OR NEW."programme_id" IS DISTINCT FROM proposal_row."programme_id"
		OR NEW."proposal_key" IS DISTINCT FROM proposal_row."proposal_key"
		OR NEW."contribution_digest_algorithm" IS DISTINCT FROM proposal_row."content_digest_algorithm"
		OR NEW."contribution_digest" IS DISTINCT FROM proposal_row."content_digest" THEN
		RAISE EXCEPTION 'canonical implementation requires the exact unchanged accepted contribution'
			USING ERRCODE = '23514';
	END IF;
	IF actor_ok IS DISTINCT FROM true THEN
		RAISE EXCEPTION 'canonical implementation requires a steward or administrator'
			USING ERRCODE = '42501';
	END IF;
	IF candidate_row."id" IS NULL
		OR candidate_row."programme_id" IS DISTINCT FROM NEW."programme_id"
		OR candidate_row."author_user_id" IS DISTINCT FROM proposal_row."author_user_id"
		OR candidate_row."review_status" <> 'DRAFT'
		OR candidate_row."previous_verdict_revision_id" IS DISTINCT FROM current_verdict_id
		OR proposal_row."current_verdict_revision_id" IS DISTINCT FROM current_verdict_id
		OR current_verdict_id IS NULL THEN
		RAISE EXCEPTION 'canonical candidate lineage must begin at the exact current public conclusion'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1 FROM "programme_contribution_source_task_resolutions" resolution
		WHERE resolution."proposal_id" = NEW."proposal_id"
	) THEN
		RAISE EXCEPTION 'one accepted proposal cannot both create a candidate and resolve metadata only'
			USING ERRCODE = '23514';
	END IF;

	IF NEW."source_review_task_id" IS NULL THEN
		IF proposal_row."source_review_task_id" IS NOT NULL
			OR proposal_row."source_review_snapshot_id" IS NOT NULL THEN
			RAISE EXCEPTION 'a task-bound contribution must retain its exact task and snapshot'
				USING ERRCODE = '23514';
		END IF;
	ELSE
		IF proposal_row."source_review_task_id" IS DISTINCT FROM NEW."source_review_task_id"
			OR proposal_row."source_review_snapshot_id" IS DISTINCT FROM NEW."source_snapshot_id"
			OR NOT EXISTS (
				SELECT 1
				FROM "evidence_review_tasks" task
				INNER JOIN "programme_freshness_states" freshness
					ON freshness."programme_id" = task."programme_id"
					AND freshness."source_id" = task."source_id"
				WHERE task."id" = NEW."source_review_task_id"
					AND task."programme_id" = NEW."programme_id"
					AND task."source_id" = NEW."source_id"
					AND task."trigger_snapshot_id" = NEW."source_snapshot_id"
					AND task."status" IN ('OPEN', 'IN_REVIEW', 'BLOCKED')
					AND freshness."pending_snapshot_id" = NEW."source_snapshot_id"
			)
			OR NOT EXISTS (
				SELECT 1 FROM "programme_verdict_trial_snapshots" trial
				WHERE trial."verdict_revision_id" = NEW."verdict_revision_id"
					AND trial."programme_id" = NEW."programme_id"
					AND trial."registry_source_id" = NEW."source_id"
					AND trial."registry_snapshot_id" = NEW."source_snapshot_id"
			) THEN
			RAISE EXCEPTION 'canonical implementation must bind the exact open task, pending snapshot, and reviewed trial snapshot'
				USING ERRCODE = '23514';
		END IF;
	END IF;

	NEW."created_at" := clock_timestamp();
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "programme_contribution_implementations_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_contribution_implementations"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_contribution_implementation"();--> statement-breakpoint

CREATE OR REPLACE FUNCTION "rnawiki_guard_unpublished_source_resolution"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	proposal_row "programme_contribution_proposals"%ROWTYPE;
	task_row "evidence_review_tasks"%ROWTYPE;
	source_row "evidence_sources"%ROWTYPE;
	snapshot_row "source_snapshots"%ROWTYPE;
	programme_row "development_programmes"%ROWTYPE;
	trial_row "programme_trials"%ROWTYPE;
	actor_ok boolean;
	nct_id text;
	brief_title text;
	registry_status text;
	expected_programme_status text;
	expected_trial_status text;
	expected_indication text;
	expected_phase text;
	expected_value jsonb;
	proposed_value jsonb;
	trial_count integer;
BEGIN
	IF TG_OP <> 'INSERT' THEN
		IF TG_OP = 'DELETE' AND NOT EXISTS (
			SELECT 1 FROM "development_programmes" WHERE "id" = OLD."programme_id"
		) THEN
			RETURN OLD;
		END IF;
		RAISE EXCEPTION 'unpublished source-task resolutions are immutable audit records'
			USING ERRCODE = '55000';
	END IF;
	PERFORM rnawiki_lock_programme_contribution_lineage(NEW."programme_id", NEW."proposal_key");
	PERFORM pg_advisory_xact_lock(
		hashtextextended('source-task:' || NEW."source_review_task_id", 0)
	);

	SELECT * INTO proposal_row FROM "programme_contribution_proposals"
	WHERE "id" = NEW."proposal_id" FOR SHARE;
	SELECT * INTO task_row FROM "evidence_review_tasks"
	WHERE "id" = NEW."source_review_task_id" FOR UPDATE;
	SELECT * INTO source_row FROM "evidence_sources"
	WHERE "id" = NEW."source_id" FOR SHARE;
	SELECT * INTO snapshot_row FROM "source_snapshots"
	WHERE "id" = NEW."source_snapshot_id" AND "source_id" = NEW."source_id" FOR SHARE;
	SELECT * INTO programme_row FROM "development_programmes"
	WHERE "id" = NEW."programme_id" FOR SHARE;
	SELECT count(*) INTO trial_count FROM "programme_trials"
	WHERE "programme_id" = NEW."programme_id";
	IF trial_count = 1 THEN
		SELECT * INTO trial_row FROM "programme_trials"
		WHERE "programme_id" = NEW."programme_id" FOR SHARE;
	END IF;
	SELECT ("is_admin" OR "trust_tier" = 'steward') INTO actor_ok
	FROM "users" WHERE "id" = NEW."resolved_by_user_id" FOR SHARE;

	IF proposal_row."id" IS NULL
		OR proposal_row."status" <> 'SUBMITTED'
		OR proposal_row."content_digest" IS NULL
		OR NOT EXISTS (
			SELECT 1 FROM "programme_contribution_review_states" state
			WHERE state."proposal_id" = NEW."proposal_id"
				AND state."status" = 'ACCEPTED_FOR_IMPLEMENTATION'
		)
		OR proposal_row."programme_id" IS DISTINCT FROM NEW."programme_id"
		OR proposal_row."proposal_key" IS DISTINCT FROM NEW."proposal_key"
		OR proposal_row."source_review_task_id" IS DISTINCT FROM NEW."source_review_task_id"
		OR proposal_row."source_review_snapshot_id" IS DISTINCT FROM NEW."source_snapshot_id"
		OR proposal_row."content_digest_algorithm" IS DISTINCT FROM NEW."contribution_digest_algorithm"
		OR proposal_row."content_digest" IS DISTINCT FROM NEW."contribution_digest"
		OR proposal_row."current_verdict_revision_id" IS NOT NULL
		OR proposal_row."selected_field"::text NOT IN (
			'programme.title', 'programme.indication', 'programme.status', 'programme.highestPhaseReached'
		) THEN
		RAISE EXCEPTION 'metadata-only resolution requires one exact accepted task-bound correction'
			USING ERRCODE = '23514';
	END IF;
	IF actor_ok IS DISTINCT FROM true OR EXISTS (
		SELECT 1 FROM "programme_contribution_implementations" implementation
		WHERE implementation."proposal_id" = NEW."proposal_id"
	) THEN
		RAISE EXCEPTION 'metadata-only resolution requires a steward and cannot also create a conclusion'
			USING ERRCODE = '23514';
	END IF;
	IF task_row."id" IS NULL
		OR task_row."programme_id" IS DISTINCT FROM NEW."programme_id"
		OR task_row."source_id" IS DISTINCT FROM NEW."source_id"
		OR task_row."trigger_snapshot_id" IS DISTINCT FROM NEW."source_snapshot_id"
		OR task_row."status" NOT IN ('OPEN', 'IN_REVIEW', 'BLOCKED')
		OR source_row."source_type" <> 'CLINICAL_TRIAL_REGISTRY'
		OR snapshot_row."id" IS NULL
		OR NOT EXISTS (
			SELECT 1 FROM "programme_freshness_states" freshness
			WHERE freshness."programme_id" = NEW."programme_id"
				AND freshness."source_id" = NEW."source_id"
				AND freshness."pending_snapshot_id" = NEW."source_snapshot_id"
		) THEN
		RAISE EXCEPTION 'metadata-only resolution must own the exact open task and pending ClinicalTrials.gov snapshot'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (SELECT 1 FROM "programme_current_publications" WHERE "programme_id" = NEW."programme_id")
		OR EXISTS (SELECT 1 FROM "programme_verdict_revisions" WHERE "programme_id" = NEW."programme_id")
		OR EXISTS (SELECT 1 FROM "claims" WHERE "programme_id" = NEW."programme_id")
		OR EXISTS (SELECT 1 FROM "evidence_nodes" WHERE "programme_id" = NEW."programme_id")
		OR EXISTS (SELECT 1 FROM "trial_interpretability_assessments" WHERE "programme_id" = NEW."programme_id")
		OR EXISTS (SELECT 1 FROM "programme_dependencies" WHERE "programme_id" = NEW."programme_id")
		OR trial_count <> 1 THEN
		RAISE EXCEPTION 'metadata-only resolution is restricted to a strictly empty unpublished evidence graph with one trial'
			USING ERRCODE = '23514';
	END IF;

	nct_id := upper(nullif(btrim(snapshot_row."structured_data" #>> '{protocolSection,identificationModule,nctId}'), ''));
	brief_title := nullif(btrim(snapshot_row."structured_data" #>> '{protocolSection,identificationModule,briefTitle}'), '');
	registry_status := upper(nullif(btrim(snapshot_row."structured_data" #>> '{protocolSection,statusModule,overallStatus}'), ''));
	expected_programme_status := CASE registry_status
		WHEN 'NOT_YET_RECRUITING' THEN 'PLANNED'
		WHEN 'RECRUITING' THEN 'RECRUITING'
		WHEN 'ENROLLING_BY_INVITATION' THEN 'RECRUITING'
		WHEN 'ACTIVE_NOT_RECRUITING' THEN 'ACTIVE'
		WHEN 'COMPLETED' THEN 'COMPLETED'
		WHEN 'SUSPENDED' THEN 'PAUSED'
		WHEN 'TERMINATED' THEN 'STOPPED'
		WHEN 'WITHDRAWN' THEN 'WITHDRAWN'
		ELSE 'UNKNOWN'
	END;
	expected_trial_status := CASE WHEN registry_status IN (
		'NOT_YET_RECRUITING', 'RECRUITING', 'ENROLLING_BY_INVITATION',
		'ACTIVE_NOT_RECRUITING', 'COMPLETED', 'SUSPENDED', 'TERMINATED', 'WITHDRAWN'
	) THEN registry_status ELSE 'UNKNOWN' END;
	SELECT string_agg(value, '; ' ORDER BY ordinality) INTO expected_indication
	FROM jsonb_array_elements_text(
		COALESCE(snapshot_row."structured_data" #> '{protocolSection,conditionsModule,conditions}', '[]'::jsonb)
	) WITH ORDINALITY condition(value, ordinality)
	WHERE nullif(btrim(value), '') IS NOT NULL;
	SELECT string_agg(
		CASE phase
			WHEN 'NA' THEN 'Not applicable'
			WHEN 'EARLY_PHASE1' THEN 'Early Phase 1'
			WHEN 'PHASE1' THEN 'Phase 1'
			WHEN 'PHASE2' THEN 'Phase 2'
			WHEN 'PHASE3' THEN 'Phase 3'
			WHEN 'PHASE4' THEN 'Phase 4'
			ELSE phase
		END,
		' / ' ORDER BY ordinality
	) INTO expected_phase
	FROM jsonb_array_elements_text(
		COALESCE(snapshot_row."structured_data" #> '{protocolSection,designModule,phases}', '[]'::jsonb)
	) WITH ORDINALITY phases(phase, ordinality)
	WHERE nullif(btrim(phase), '') IS NOT NULL;

	IF nct_id IS NULL OR nct_id !~ '^NCT[0-9]{8}$'
		OR nct_id IS DISTINCT FROM upper(source_row."external_identifier")
		OR nct_id IS DISTINCT FROM upper(trial_row."trial_identifier")
		OR brief_title IS NULL
		OR NOT EXISTS (
			SELECT 1
			FROM jsonb_array_elements(
				COALESCE(snapshot_row."structured_data" #> '{protocolSection,armsInterventionsModule,interventions}', '[]'::jsonb)
			) intervention
			WHERE EXISTS (
				SELECT 1
				FROM (
					SELECT programme_drug."name" AS medicine_name
					FROM "drugs" programme_drug WHERE programme_drug."id" = programme_row."drug_id"
					UNION ALL
					SELECT alias."alias" FROM "drug_aliases" alias
					WHERE alias."drug_id" = programme_row."drug_id"
				) medicine
				WHERE regexp_replace(lower(intervention ->> 'name'), '[^a-z0-9]+', ' ', 'g')
					LIKE '%' || regexp_replace(lower(medicine.medicine_name), '[^a-z0-9]+', ' ', 'g') || '%'
			)
		) THEN
		RAISE EXCEPTION 'registry payload identity is invalid or does not name this medicine intervention'
			USING ERRCODE = '23514';
	END IF;

	proposed_value := COALESCE(proposal_row."proposed_value", to_jsonb(btrim(proposal_row."proposed_text")));
	expected_value := CASE proposal_row."selected_field"::text
		WHEN 'programme.title' THEN to_jsonb(brief_title)
		WHEN 'programme.indication' THEN to_jsonb(expected_indication)
		WHEN 'programme.status' THEN to_jsonb(expected_programme_status)
		WHEN 'programme.highestPhaseReached' THEN to_jsonb(expected_phase)
	END;
	IF proposed_value IS DISTINCT FROM expected_value
		OR programme_row."title" IS DISTINCT FROM brief_title
		OR programme_row."indication" IS DISTINCT FROM expected_indication
		OR programme_row."status"::text IS DISTINCT FROM expected_programme_status
		OR programme_row."highest_phase_reached" IS DISTINCT FROM expected_phase
		OR trial_row."title" IS DISTINCT FROM brief_title
		OR trial_row."phase" IS DISTINCT FROM expected_phase
		OR trial_row."status"::text IS DISTINCT FROM expected_trial_status
		OR trial_row."registry_source_id" IS DISTINCT FROM NEW."source_id"
		OR trial_row."registry_snapshot_id" IS DISTINCT FROM NEW."source_snapshot_id"
		OR source_row."title" IS DISTINCT FROM brief_title THEN
		RAISE EXCEPTION 'metadata-only resolution must apply the exact parser-derived programme, trial, and source values first'
			USING ERRCODE = '23514';
	END IF;

	NEW."created_at" := clock_timestamp();
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "programme_source_task_resolutions_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_contribution_source_task_resolutions"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_unpublished_source_resolution"();--> statement-breakpoint

CREATE OR REPLACE FUNCTION "rnawiki_guard_freshness_resolution"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	IF TG_OP = 'UPDATE'
		AND OLD."pending_snapshot_id" IS NOT NULL
		AND NEW."pending_snapshot_id" IS NULL THEN
		IF NEW."current_snapshot_id" IS DISTINCT FROM OLD."pending_snapshot_id" THEN
			RAISE EXCEPTION 'resolving source freshness must promote the exact pending snapshot'
				USING ERRCODE = '23514';
		END IF;
		IF NOT EXISTS (
			SELECT 1
			FROM "programme_contribution_implementations" implementation
			INNER JOIN "programme_verdict_revisions" verdict
				ON verdict."id" = implementation."verdict_revision_id"
			INNER JOIN "programme_verdict_trial_snapshots" trial
				ON trial."verdict_revision_id" = implementation."verdict_revision_id"
				AND trial."programme_id" = implementation."programme_id"
				AND trial."registry_source_id" = implementation."source_id"
				AND trial."registry_snapshot_id" = implementation."source_snapshot_id"
			INNER JOIN "evidence_review_tasks" task
				ON task."id" = implementation."source_review_task_id"
			WHERE implementation."programme_id" = NEW."programme_id"
				AND implementation."source_id" = NEW."source_id"
				AND implementation."source_snapshot_id" = NEW."current_snapshot_id"
				AND verdict."review_status" = 'PUBLISHED'
				AND task."status" IN ('OPEN', 'IN_REVIEW', 'BLOCKED')
		) AND NOT EXISTS (
			SELECT 1
			FROM "programme_contribution_source_task_resolutions" resolution
			INNER JOIN "evidence_review_tasks" task
				ON task."id" = resolution."source_review_task_id"
			INNER JOIN "programme_trials" trial
				ON trial."programme_id" = resolution."programme_id"
				AND trial."registry_source_id" = resolution."source_id"
				AND trial."registry_snapshot_id" = resolution."source_snapshot_id"
			WHERE resolution."programme_id" = NEW."programme_id"
				AND resolution."source_id" = NEW."source_id"
				AND resolution."source_snapshot_id" = NEW."current_snapshot_id"
				AND task."status" IN ('OPEN', 'IN_REVIEW', 'BLOCKED')
		) THEN
			RAISE EXCEPTION 'pending source evidence can be cleared only by its exact reviewed canonical bundle or audited unpublished metadata resolution'
				USING ERRCODE = '23514';
		END IF;
	END IF;
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "programme_freshness_reviewed_resolution"
BEFORE UPDATE ON "programme_freshness_states"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_freshness_resolution"();--> statement-breakpoint

CREATE OR REPLACE FUNCTION "rnawiki_guard_evidence_task_resolution"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	IF TG_OP = 'DELETE' THEN
		IF NOT EXISTS (SELECT 1 FROM "development_programmes" WHERE "id" = OLD."programme_id") THEN
			RETURN OLD;
		END IF;
		RAISE EXCEPTION 'source-review tasks are retained as audit records'
			USING ERRCODE = '55000';
	END IF;
	IF TG_OP = 'UPDATE' AND OLD."status" IN ('RESOLVED', 'DISMISSED') THEN
		IF NEW IS DISTINCT FROM OLD THEN
			RAISE EXCEPTION 'resolved or dismissed source-review tasks are immutable'
				USING ERRCODE = '55000';
		END IF;
		RETURN NEW;
	END IF;
	IF TG_OP = 'UPDATE' AND (
		NEW."programme_id" IS DISTINCT FROM OLD."programme_id"
		OR NEW."source_id" IS DISTINCT FROM OLD."source_id"
		OR NEW."trigger_snapshot_id" IS DISTINCT FROM OLD."trigger_snapshot_id"
	) THEN
		RAISE EXCEPTION 'source-review task identity is immutable'
			USING ERRCODE = '55000';
	END IF;
	IF TG_OP = 'UPDATE' AND NEW."status" = 'DISMISSED' AND EXISTS (
		SELECT 1 FROM "programme_freshness_states" freshness
		WHERE freshness."programme_id" = NEW."programme_id"
			AND freshness."source_id" = NEW."source_id"
			AND freshness."pending_snapshot_id" = NEW."trigger_snapshot_id"
	) THEN
		RAISE EXCEPTION 'a task owning a pending snapshot requires an audited reviewed resolution'
			USING ERRCODE = '23514';
	END IF;
	IF TG_OP = 'UPDATE' AND NEW."status" = 'RESOLVED' THEN
		IF NEW."resolution_verdict_revision_id" IS NOT NULL THEN
			IF NOT EXISTS (
				SELECT 1
				FROM "programme_contribution_implementations" implementation
				INNER JOIN "programme_verdict_revisions" verdict
					ON verdict."id" = implementation."verdict_revision_id"
				INNER JOIN "programme_freshness_states" freshness
					ON freshness."programme_id" = implementation."programme_id"
					AND freshness."source_id" = implementation."source_id"
				INNER JOIN "programme_verdict_trial_snapshots" trial
					ON trial."verdict_revision_id" = implementation."verdict_revision_id"
					AND trial."registry_source_id" = implementation."source_id"
					AND trial."registry_snapshot_id" = implementation."source_snapshot_id"
				WHERE implementation."source_review_task_id" = NEW."id"
					AND implementation."verdict_revision_id" = NEW."resolution_verdict_revision_id"
					AND implementation."programme_id" = NEW."programme_id"
					AND implementation."source_id" = NEW."source_id"
					AND implementation."source_snapshot_id" = NEW."trigger_snapshot_id"
					AND verdict."review_status" = 'PUBLISHED'
					AND freshness."current_snapshot_id" = NEW."trigger_snapshot_id"
					AND freshness."pending_snapshot_id" IS NULL
			) THEN
				RAISE EXCEPTION 'task resolution must follow publication of its exact reviewed trial/source bundle'
					USING ERRCODE = '23514';
			END IF;
		ELSIF NEW."resolution_contribution_proposal_id" IS NOT NULL THEN
			IF NOT EXISTS (
				SELECT 1
				FROM "programme_contribution_source_task_resolutions" resolution
				INNER JOIN "programme_freshness_states" freshness
					ON freshness."programme_id" = resolution."programme_id"
					AND freshness."source_id" = resolution."source_id"
				INNER JOIN "programme_trials" trial
					ON trial."programme_id" = resolution."programme_id"
					AND trial."registry_source_id" = resolution."source_id"
					AND trial."registry_snapshot_id" = resolution."source_snapshot_id"
				WHERE resolution."source_review_task_id" = NEW."id"
					AND resolution."proposal_id" = NEW."resolution_contribution_proposal_id"
					AND resolution."programme_id" = NEW."programme_id"
					AND resolution."source_id" = NEW."source_id"
					AND resolution."source_snapshot_id" = NEW."trigger_snapshot_id"
					AND resolution."resolved_by_user_id" = NEW."resolved_by_user_id"
					AND freshness."current_snapshot_id" = NEW."trigger_snapshot_id"
					AND freshness."pending_snapshot_id" IS NULL
					AND NOT EXISTS (
						SELECT 1 FROM "programme_current_publications" publication
						WHERE publication."programme_id" = NEW."programme_id"
					)
			) THEN
				RAISE EXCEPTION 'metadata-only task resolution requires its exact accepted proposal audit and registry update'
					USING ERRCODE = '23514';
			END IF;
		ELSE
			RAISE EXCEPTION 'resolved source-review tasks require exactly one immutable resolution lineage'
				USING ERRCODE = '23514';
		END IF;
	END IF;
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "evidence_review_tasks_resolution_guard"
BEFORE INSERT OR UPDATE OR DELETE ON "evidence_review_tasks"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_evidence_task_resolution"();--> statement-breakpoint

-- Replaces the 0008 exact-bundle validator with the same snapshot/graph/freshness gates plus the
-- 0009 qualification and disagreement-adjudication rules. Public reads cannot advance until every
-- member below is already in its final state in this transaction.
CREATE OR REPLACE FUNCTION "rnawiki_validate_current_bundle_members"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	verdict_row "programme_verdict_revisions"%ROWTYPE;
	reviewed_programme_status "programme_status";
	required_path text;
	review_count integer;
	distinct_reviewer_count integer;
	distinct_decision_count integer;
	contribution_author_id varchar;
BEGIN
	SELECT * INTO verdict_row
	FROM "programme_verdict_revisions"
	WHERE "id" = NEW."verdict_revision_id" AND "programme_id" = NEW."programme_id";
	IF NOT FOUND THEN
		RAISE EXCEPTION 'current publication must reference a verdict revision from the same programme'
			USING ERRCODE = '23503';
	END IF;

	SELECT scope."status" INTO reviewed_programme_status
	FROM "programme_verdict_scope_snapshots" scope
	WHERE scope."verdict_revision_id" = NEW."verdict_revision_id"
		AND scope."programme_id" = NEW."programme_id";
	IF NOT FOUND OR reviewed_programme_status IS DISTINCT FROM verdict_row."programme_status_at_review" THEN
		RAISE EXCEPTION 'current publication requires its exact reviewed programme-scope snapshot'
			USING ERRCODE = '23514';
	END IF;
	IF verdict_row."review_status" <> 'PUBLISHED'
		OR verdict_row."published_at" IS DISTINCT FROM NEW."published_at" THEN
		RAISE EXCEPTION 'current publication must reference the exact PUBLISHED verdict timestamp'
			USING ERRCODE = '23514';
	END IF;
	IF reviewed_programme_status IN ('STOPPED', 'WITHDRAWN') AND verdict_row."verdict_code" IS NULL THEN
		RAISE EXCEPTION 'a stopped or withdrawn programme requires an explicit verdict classification'
			USING ERRCODE = '23514';
	END IF;
	IF reviewed_programme_status NOT IN ('STOPPED', 'WITHDRAWN') AND verdict_row."verdict_code" IS NOT NULL THEN
		RAISE EXCEPTION 'a stopped-programme verdict cannot classify an active programme'
			USING ERRCODE = '23514';
	END IF;
	IF verdict_row."proposal_as_of_date" IS NULL
		OR verdict_row."proposal_prepared_at" IS NULL
		OR verdict_row."proposal_digest_algorithm" <> 'sha256'
		OR verdict_row."proposal_digest" !~ '^[0-9a-f]{64}$'
		OR nullif(btrim(verdict_row."engine_version"), '') IS NULL
		OR verdict_row."input_digest_algorithm" <> 'sha256'
		OR verdict_row."input_digest" !~ '^[0-9a-f]{64}$' THEN
		RAISE EXCEPTION 'published verdict requires deterministic proposal and RNA Intelligence provenance'
			USING ERRCODE = '23514';
	END IF;

	SELECT proposal."author_user_id" INTO contribution_author_id
	FROM "programme_contribution_implementations" implementation
	INNER JOIN "programme_contribution_proposals" proposal
		ON proposal."id" = implementation."proposal_id"
	INNER JOIN "programme_contribution_review_states" state
		ON state."proposal_id" = proposal."id"
	WHERE implementation."verdict_revision_id" = NEW."verdict_revision_id"
		AND proposal."status" = 'SUBMITTED'
		AND state."status" = 'ACCEPTED_FOR_IMPLEMENTATION'
		AND implementation."contribution_digest" = proposal."content_digest";
	IF EXISTS (
		SELECT 1 FROM "programme_contribution_implementations" implementation
		WHERE implementation."verdict_revision_id" = NEW."verdict_revision_id"
	) AND contribution_author_id IS NULL THEN
		RAISE EXCEPTION 'accepted-contribution candidate lineage is incomplete or no longer exact'
			USING ERRCODE = '23514';
	END IF;

	SELECT count(*), count(DISTINCT review."reviewer_user_id"), count(DISTINCT review."decision")
	INTO review_count, distinct_reviewer_count, distinct_decision_count
	FROM "programme_verdict_reviews" review
	WHERE review."verdict_revision_id" = NEW."verdict_revision_id";
	IF review_count <> 2 OR distinct_reviewer_count <> 2 THEN
		RAISE EXCEPTION 'canonical publication preflight requires exactly two immutable decisions from two people; legacy duplicates must be remediated explicitly'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_reviews" review
		LEFT JOIN "users" reviewer ON reviewer."id" = review."reviewer_user_id"
		WHERE review."verdict_revision_id" = NEW."verdict_revision_id"
			AND (
				reviewer."id" IS NULL
				OR NOT (reviewer."is_admin" OR reviewer."trust_tier" IN ('trusted', 'steward'))
				OR review."reviewer_user_id" = verdict_row."author_user_id"
				OR review."reviewer_user_id" = contribution_author_id
				OR review."is_independent" IS DISTINCT FROM true
				OR review."conflicts_of_interest_attested" IS DISTINCT FROM true
				OR nullif(btrim(review."conflicts_of_interest"), '') IS NULL
				OR cardinality(review."expertise_tags") = 0
				OR review."proposal_digest_algorithm" <> 'sha256'
				OR review."proposal_digest" IS DISTINCT FROM verdict_row."proposal_digest"
				OR review."engine_version" IS DISTINCT FROM verdict_row."engine_version"
				OR review."input_digest_algorithm" <> 'sha256'
				OR review."input_digest" IS DISTINCT FROM verdict_row."input_digest"
				OR EXISTS (
					SELECT 1 FROM unnest(review."expertise_tags") tag
					WHERE (
						SELECT event."action"
						FROM "programme_verdict_reviewer_qualification_events" event
						WHERE event."reviewer_user_id" = review."reviewer_user_id"
							AND event."expertise_tag" = tag
						ORDER BY event."created_at" DESC, event."id" DESC
						LIMIT 1
					) IS DISTINCT FROM 'GRANT'
				)
			)
	) THEN
		RAISE EXCEPTION 'every canonical review must remain qualified, independent, conflict-attested, and bound to this exact digest'
			USING ERRCODE = '23514';
	END IF;

	IF distinct_decision_count = 1 THEN
		IF EXISTS (
			SELECT 1 FROM "programme_verdict_reviews"
			WHERE "verdict_revision_id" = NEW."verdict_revision_id"
				AND "decision" <> 'APPROVE'
		) THEN
			RAISE EXCEPTION 'two matching adverse reviews cannot publish a canonical conclusion'
				USING ERRCODE = '23514';
		END IF;
	ELSIF distinct_decision_count = 2 THEN
		IF NOT EXISTS (
			SELECT 1
			FROM "programme_verdict_adjudications" adjudication
			INNER JOIN "users" adjudicator ON adjudicator."id" = adjudication."adjudicator_user_id"
			WHERE adjudication."verdict_revision_id" = NEW."verdict_revision_id"
				AND adjudication."decision" = 'APPROVE'
				AND (adjudicator."is_admin" OR adjudicator."trust_tier" = 'steward')
				AND adjudication."adjudicator_user_id" IS DISTINCT FROM verdict_row."author_user_id"
				AND (
					contribution_author_id IS NULL
					OR adjudication."adjudicator_user_id" <> contribution_author_id
				)
				AND NOT EXISTS (
					SELECT 1 FROM "programme_verdict_reviews" review
					WHERE review."verdict_revision_id" = NEW."verdict_revision_id"
						AND review."reviewer_user_id" = adjudication."adjudicator_user_id"
				)
				AND adjudication."conflicts_of_interest_attested" = true
				AND nullif(btrim(adjudication."conflicts_of_interest"), '') IS NOT NULL
				AND cardinality(adjudication."expertise_tags") > 0
				AND adjudication."proposal_digest_algorithm" = 'sha256'
				AND adjudication."proposal_digest" = verdict_row."proposal_digest"
				AND adjudication."engine_version" = verdict_row."engine_version"
				AND adjudication."input_digest_algorithm" = 'sha256'
				AND adjudication."input_digest" = verdict_row."input_digest"
				AND NOT EXISTS (
					SELECT 1 FROM unnest(adjudication."expertise_tags") tag
					WHERE (
						SELECT event."action"
						FROM "programme_verdict_reviewer_qualification_events" event
						WHERE event."reviewer_user_id" = adjudication."adjudicator_user_id"
							AND event."expertise_tag" = tag
						ORDER BY event."created_at" DESC, event."id" DESC
						LIMIT 1
					) IS DISTINCT FROM 'GRANT'
				)
		) THEN
			RAISE EXCEPTION 'reviewer disagreement requires one qualified independent digest-bound approving adjudication'
				USING ERRCODE = '23514';
		END IF;
	ELSE
		RAISE EXCEPTION 'canonical review decision set is invalid'
			USING ERRCODE = '23514';
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM "programme_verdict_claims" verdict_claim
		INNER JOIN "claims" claim ON claim."id" = verdict_claim."claim_id"
		WHERE verdict_claim."verdict_revision_id" = NEW."verdict_revision_id"
			AND verdict_claim."relationship" = 'SUPPORTING'
			AND claim."programme_id" = NEW."programme_id"
			AND claim."review_status" = 'PUBLISHED'
	) THEN
		RAISE EXCEPTION 'a published programme verdict requires a PUBLISHED supporting claim revision'
			USING ERRCODE = '23514';
	END IF;
	IF NOT EXISTS (
		SELECT 1 FROM "programme_verdict_trials"
		WHERE "verdict_revision_id" = NEW."verdict_revision_id"
	) THEN
		RAISE EXCEPTION 'a published programme verdict requires normalized trial scope'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "rnawiki_reviewed_verdict_claim_ids"(NEW."verdict_revision_id") reviewed_claim
		LEFT JOIN "claims" claim ON claim."id" = reviewed_claim."claim_id"
			AND claim."programme_id" = NEW."programme_id"
		WHERE claim."id" IS NULL OR claim."review_status" <> 'PUBLISHED'
	) OR EXISTS (
		SELECT 1
		FROM "programme_verdict_evidence_nodes" link
		LEFT JOIN "evidence_nodes" node ON node."id" = link."evidence_node_id"
			AND node."programme_id" = NEW."programme_id"
		WHERE link."verdict_revision_id" = NEW."verdict_revision_id"
			AND (node."id" IS NULL OR node."review_status" <> 'PUBLISHED')
	) OR EXISTS (
		SELECT 1
		FROM "programme_verdict_interpretability_assessments" link
		LEFT JOIN "trial_interpretability_assessments" assessment
			ON assessment."id" = link."assessment_id"
			AND assessment."programme_id" = NEW."programme_id"
		WHERE link."verdict_revision_id" = NEW."verdict_revision_id"
			AND (assessment."id" IS NULL OR assessment."review_status" <> 'PUBLISHED')
	) THEN
		RAISE EXCEPTION 'current publication graph members must be exact PUBLISHED revisions'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_trials" link
		LEFT JOIN "programme_verdict_trial_snapshots" trial
			ON trial."verdict_revision_id" = link."verdict_revision_id"
			AND trial."programme_trial_id" = link."programme_trial_id"
			AND trial."programme_id" = NEW."programme_id"
		WHERE link."verdict_revision_id" = NEW."verdict_revision_id"
			AND trial."programme_trial_id" IS NULL
	) THEN
		RAISE EXCEPTION 'current publication trials must resolve to exact reviewed snapshots'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT reviewed_source."source_id"
		FROM (
			SELECT snapshot."source_id"
			FROM "rnawiki_reviewed_verdict_claim_ids"(NEW."verdict_revision_id") reviewed_claim
			INNER JOIN "claim_source_links" claim_source
				ON claim_source."claim_id" = reviewed_claim."claim_id"
			INNER JOIN "source_snapshots" snapshot
				ON snapshot."id" = claim_source."source_snapshot_id"
			UNION
			SELECT trial."registry_source_id"
			FROM "programme_verdict_trial_snapshots" trial
			WHERE trial."verdict_revision_id" = NEW."verdict_revision_id"
				AND trial."registry_source_id" IS NOT NULL
		) reviewed_source
		WHERE NOT EXISTS (
			SELECT 1 FROM "programme_verdict_source_metadata_snapshots" source_metadata
			WHERE source_metadata."verdict_revision_id" = NEW."verdict_revision_id"
				AND source_metadata."programme_id" = NEW."programme_id"
				AND source_metadata."source_id" = reviewed_source."source_id"
		)
	) THEN
		RAISE EXCEPTION 'current publication requires exact reviewed metadata for every source'
			USING ERRCODE = '23514';
	END IF;

	FOREACH required_path IN ARRAY ARRAY[
		'summary.plainMechanism', 'summary.bestSupportedFinding', 'summary.mainLimitation'
	] LOOP
		IF NOT EXISTS (
			SELECT 1
			FROM "programme_dependencies" dependency
			INNER JOIN "claims" claim ON claim."id" = dependency."claim_id"
			INNER JOIN "programme_verdict_claims" verdict_claim
				ON verdict_claim."verdict_revision_id" = NEW."verdict_revision_id"
				AND verdict_claim."claim_id" = dependency."claim_id"
			WHERE dependency."programme_id" = NEW."programme_id"
				AND dependency."verdict_revision_id" = NEW."verdict_revision_id"
				AND dependency."dependent_surface_type" = 'PROGRAMME_SUMMARY'
				AND dependency."field_path" = required_path
				AND dependency."impact_level" <> 'LOW_RISK_EXACT_DATA'
				AND claim."review_status" = 'PUBLISHED'
		) THEN
			RAISE EXCEPTION 'published programme summary field % requires a revision-scoped claim dependency', required_path
				USING ERRCODE = '23514';
		END IF;
	END LOOP;
	FOREACH required_path IN ARRAY ARRAY[
		'verdict.publicLabel', 'verdict.professionalLabel', 'verdict.oneSentenceReason',
		'verdict.scope.indication', 'verdict.scope.population', 'verdict.scope.doseExposure',
		'verdict.scope.period', 'verdict.scope.trials', 'verdict.scope.outcome',
		'verdict.whatWasDisproven', 'verdict.whatWasNotDisproven', 'verdict.whatRemainsUnknown',
		'verdict.confidence', 'verdict.confidenceExplanation',
		'verdict.conditionsThatWouldChangeVerdict'
	] LOOP
		IF NOT EXISTS (
			SELECT 1
			FROM "programme_dependencies" dependency
			INNER JOIN "claims" claim ON claim."id" = dependency."claim_id"
			INNER JOIN "programme_verdict_claims" verdict_claim
				ON verdict_claim."verdict_revision_id" = NEW."verdict_revision_id"
				AND verdict_claim."claim_id" = dependency."claim_id"
			WHERE dependency."programme_id" = NEW."programme_id"
				AND dependency."verdict_revision_id" = NEW."verdict_revision_id"
				AND dependency."dependent_surface_type" = 'VERDICT'
				AND dependency."field_path" = required_path
				AND dependency."impact_level" <> 'LOW_RISK_EXACT_DATA'
				AND claim."review_status" = 'PUBLISHED'
		) THEN
			RAISE EXCEPTION 'published verdict field % requires a revision-scoped claim dependency', required_path
				USING ERRCODE = '23514';
		END IF;
	END LOOP;

	IF EXISTS (
		WITH reviewed_snapshots AS (
			SELECT snapshot."source_id", link."source_snapshot_id" AS snapshot_id
			FROM "rnawiki_reviewed_verdict_claim_ids"(NEW."verdict_revision_id") reviewed_claim
			INNER JOIN "claim_source_links" link ON link."claim_id" = reviewed_claim."claim_id"
			INNER JOIN "source_snapshots" snapshot ON snapshot."id" = link."source_snapshot_id"
			UNION
			SELECT trial."registry_source_id", trial."registry_snapshot_id"
			FROM "programme_verdict_trial_snapshots" trial
			WHERE trial."verdict_revision_id" = NEW."verdict_revision_id"
				AND trial."registry_source_id" IS NOT NULL
				AND trial."registry_snapshot_id" IS NOT NULL
		)
		SELECT 1
		FROM reviewed_snapshots reviewed
		LEFT JOIN "programme_freshness_states" freshness
			ON freshness."programme_id" = NEW."programme_id"
			AND freshness."source_id" = reviewed."source_id"
		WHERE freshness."current_snapshot_id" IS NULL
			OR freshness."pending_snapshot_id" IS NOT NULL
			OR reviewed.snapshot_id IS DISTINCT FROM freshness."current_snapshot_id"
	) THEN
		RAISE EXCEPTION 'published sources must be the exact current snapshots with no pending review'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1 FROM "evidence_review_tasks" task
		WHERE task."programme_id" = NEW."programme_id"
			AND task."status" IN ('OPEN', 'IN_REVIEW', 'BLOCKED')
			AND task."impact_level" IN (
				'INTERPRETIVE_REVIEW_REQUIRED', 'POSSIBLE_VERDICT_IMPACT', 'SAFETY_CRITICAL_REVIEW'
			)
	) THEN
		RAISE EXCEPTION 'every open high-impact task for this programme must be resolved before publication'
			USING ERRCODE = '23514';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "programme_contribution_implementations" implementation
		WHERE implementation."verdict_revision_id" = NEW."verdict_revision_id"
			AND implementation."source_review_task_id" IS NOT NULL
			AND NOT EXISTS (
				SELECT 1 FROM "evidence_review_tasks" task
				WHERE task."id" = implementation."source_review_task_id"
					AND task."status" = 'RESOLVED'
					AND task."resolution_verdict_revision_id" = NEW."verdict_revision_id"
					AND task."resolution_contribution_proposal_id" IS NULL
					AND task."trigger_snapshot_id" = implementation."source_snapshot_id"
			)
	) THEN
		RAISE EXCEPTION 'task-bound canonical publication requires the exact task resolution in the same bundle'
			USING ERRCODE = '23514';
	END IF;

	IF TG_OP = 'INSERT'
		OR (TG_OP = 'UPDATE' AND NEW."verdict_revision_id" IS DISTINCT FROM OLD."verdict_revision_id") THEN
		IF EXISTS (
		SELECT 1
		FROM "programme_verdict_scope_snapshots" scope
		INNER JOIN "development_programmes" programme ON programme."id" = scope."programme_id"
		WHERE scope."verdict_revision_id" = NEW."verdict_revision_id"
			AND (
				programme."drug_id" IS DISTINCT FROM scope."drug_id"
				OR programme."slug" IS DISTINCT FROM scope."slug"
				OR programme."title" IS DISTINCT FROM scope."title"
				OR programme."indication" IS DISTINCT FROM scope."indication"
				OR programme."target_population" IS DISTINCT FROM scope."target_population"
				OR programme."jurisdiction" IS DISTINCT FROM scope."jurisdiction"
				OR programme."sponsor" IS DISTINCT FROM scope."sponsor"
				OR programme."partners" IS DISTINCT FROM scope."partners"
				OR programme."status" IS DISTINCT FROM scope."status"
				OR programme."highest_phase_reached" IS DISTINCT FROM scope."highest_phase_reached"
				OR programme."route" IS DISTINCT FROM scope."route"
				OR programme."dose_exposure_context" IS DISTINCT FROM scope."dose_exposure_context"
				OR programme."start_date" IS DISTINCT FROM scope."start_date"
				OR programme."end_date" IS DISTINCT FROM scope."end_date"
				OR programme."raw_stopping_reason" IS DISTINCT FROM scope."raw_stopping_reason"
				OR programme."stopping_reason_category" IS DISTINCT FROM scope."stopping_reason_category"
			)
	) OR EXISTS (
		SELECT 1
		FROM "programme_verdict_trial_snapshots" snapshot
		LEFT JOIN "programme_trials" trial
			ON trial."id" = snapshot."programme_trial_id"
			AND trial."programme_id" = snapshot."programme_id"
		WHERE snapshot."verdict_revision_id" = NEW."verdict_revision_id"
			AND (
				trial."id" IS NULL
				OR trial."trial_identifier" IS DISTINCT FROM snapshot."trial_identifier"
				OR trial."title" IS DISTINCT FROM snapshot."title"
				OR trial."phase" IS DISTINCT FROM snapshot."phase"
				OR trial."status" IS DISTINCT FROM snapshot."status"
				OR trial."results_status" IS DISTINCT FROM snapshot."results_status"
				OR trial."enrolment" IS DISTINCT FROM snapshot."enrolment"
				OR trial."enrolment_type" IS DISTINCT FROM snapshot."enrolment_type"
				OR trial."start_date" IS DISTINCT FROM snapshot."start_date"
				OR trial."primary_completion_date" IS DISTINCT FROM snapshot."primary_completion_date"
				OR trial."completion_date" IS DISTINCT FROM snapshot."completion_date"
				OR trial."human_study_status" IS DISTINCT FROM snapshot."human_study_status"
				OR trial."registry_source_id" IS DISTINCT FROM snapshot."registry_source_id"
				OR trial."registry_snapshot_id" IS DISTINCT FROM snapshot."registry_snapshot_id"
				OR trial."last_verified_at" IS DISTINCT FROM snapshot."last_verified_at"
			)
	) THEN
			RAISE EXCEPTION 'live staging must atomically match the newly published programme and trial snapshots'
				USING ERRCODE = '23514';
		END IF;
	END IF;

	RETURN NEW;
END;
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_programme_contribution_submission_payload(
  proposal programme_contribution_proposals
)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT jsonb_build_object(
    'version', 'rna-intelligence/contribution-submission-v2',
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

CREATE OR REPLACE FUNCTION rnawiki_guard_programme_contribution_submission_integrity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	live_programme_row development_programmes%ROWTYPE;
	public_scope_row programme_verdict_scope_snapshots%ROWTYPE;
	verdict_row programme_verdict_revisions%ROWTYPE;
	node_row evidence_nodes%ROWTYPE;
	authoritative_verdict_id varchar;
	baseline_programme_status text;
	expected_current_value jsonb;
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
	PERFORM rnawiki_lock_programme_contribution_lineage(NEW.programme_id, NEW.proposal_key);

	SELECT * INTO live_programme_row
	FROM development_programmes
	WHERE id = NEW.programme_id
	FOR SHARE;
	IF NOT FOUND THEN
		RAISE EXCEPTION 'contribution submission programme is missing';
	END IF;
	SELECT verdict_revision_id INTO authoritative_verdict_id
	FROM programme_current_publications
	WHERE programme_id = NEW.programme_id
	FOR SHARE;
	IF NEW.current_verdict_revision_id IS DISTINCT FROM authoritative_verdict_id THEN
		RAISE EXCEPTION 'contribution verdict snapshot is not the authoritative current publication';
	END IF;
	IF (NEW.selected_field::text LIKE 'summary.%' OR NEW.selected_field::text LIKE 'verdict.%')
		AND authoritative_verdict_id IS NULL THEN
		RAISE EXCEPTION 'summary and verdict contributions require an authoritative current publication';
	END IF;

	IF authoritative_verdict_id IS NOT NULL THEN
		SELECT * INTO verdict_row
		FROM programme_verdict_revisions
		WHERE id = authoritative_verdict_id
			AND programme_id = NEW.programme_id
			AND review_status = 'PUBLISHED'
		FOR SHARE;
		SELECT * INTO public_scope_row
		FROM programme_verdict_scope_snapshots
		WHERE verdict_revision_id = authoritative_verdict_id
			AND programme_id = NEW.programme_id
		FOR SHARE;
		IF verdict_row.id IS NULL OR public_scope_row.verdict_revision_id IS NULL
			OR NEW.current_verdict_snapshot ->> 'id' IS DISTINCT FROM verdict_row.id
			OR NEW.current_verdict_snapshot ->> 'revisionNumber' IS DISTINCT FROM verdict_row.revision_number::text THEN
			RAISE EXCEPTION 'contribution current verdict and programme scope must match the exact public bundle';
		END IF;
		baseline_programme_status := public_scope_row.status::text;
	ELSIF NEW.current_verdict_snapshot IS NOT NULL THEN
		RAISE EXCEPTION 'contribution cannot snapshot a verdict when no current publication exists';
	ELSE
		baseline_programme_status := live_programme_row.status::text;
	END IF;

	IF NEW.evidence_node_id IS NOT NULL THEN
		IF authoritative_verdict_id IS NOT NULL THEN
			SELECT node.* INTO node_row
			FROM programme_verdict_evidence_nodes link
			INNER JOIN evidence_nodes node ON node.id = link.evidence_node_id
			WHERE link.verdict_revision_id = authoritative_verdict_id
				AND link.programme_id = NEW.programme_id
				AND node.id = NEW.evidence_node_id
				AND node.programme_id = NEW.programme_id
				AND node.review_status = 'PUBLISHED'
			FOR SHARE;
		ELSE
			SELECT * INTO node_row FROM evidence_nodes
			WHERE id = NEW.evidence_node_id
				AND programme_id = NEW.programme_id
				AND review_status = 'PUBLISHED'
			FOR SHARE;
		END IF;
		IF node_row.id IS NULL THEN
			RAISE EXCEPTION 'contribution evidence-node snapshot is outside the exact public programme graph';
		END IF;
	END IF;

	IF NEW.current_value_snapshot ->> 'version' IS DISTINCT FROM 'rna-intelligence/contribution-current-value-v1'
		OR NEW.current_value_snapshot ->> 'programmeId' IS DISTINCT FROM NEW.programme_id
		OR NEW.current_value_snapshot ->> 'programmeStatus' IS DISTINCT FROM baseline_programme_status
		OR NEW.current_value_snapshot ->> 'selectedField' IS DISTINCT FROM NEW.selected_field::text THEN
		RAISE EXCEPTION 'contribution current-value snapshot metadata is not authoritative';
	END IF;
	IF NEW.evidence_node_id IS NULL THEN
		IF NEW.current_value_snapshot -> 'evidenceNode' IS DISTINCT FROM 'null'::jsonb THEN
			RAISE EXCEPTION 'non-node contribution snapshot cannot claim an evidence node';
		END IF;
	ELSIF NEW.current_value_snapshot -> 'evidenceNode' ->> 'id' IS DISTINCT FROM node_row.id
		OR NEW.current_value_snapshot -> 'evidenceNode' ->> 'nodeType' IS DISTINCT FROM node_row.node_type::text
		OR NEW.current_value_snapshot -> 'evidenceNode' ->> 'revisionNumber' IS DISTINCT FROM node_row.revision_number::text THEN
		RAISE EXCEPTION 'contribution evidence-node snapshot metadata is stale or fabricated';
	END IF;

	expected_current_value := CASE NEW.selected_field::text
		WHEN 'programme.title' THEN to_jsonb(CASE WHEN authoritative_verdict_id IS NULL THEN live_programme_row.title ELSE public_scope_row.title END)
		WHEN 'programme.indication' THEN to_jsonb(CASE WHEN authoritative_verdict_id IS NULL THEN live_programme_row.indication ELSE public_scope_row.indication END)
		WHEN 'programme.targetPopulation' THEN to_jsonb(CASE WHEN authoritative_verdict_id IS NULL THEN live_programme_row.target_population ELSE public_scope_row.target_population END)
		WHEN 'programme.status' THEN to_jsonb(CASE WHEN authoritative_verdict_id IS NULL THEN live_programme_row.status ELSE public_scope_row.status END)
		WHEN 'programme.highestPhaseReached' THEN to_jsonb(CASE WHEN authoritative_verdict_id IS NULL THEN live_programme_row.highest_phase_reached ELSE public_scope_row.highest_phase_reached END)
		WHEN 'programme.route' THEN to_jsonb(CASE WHEN authoritative_verdict_id IS NULL THEN live_programme_row.route ELSE public_scope_row.route END)
		WHEN 'programme.doseExposureContext' THEN to_jsonb(CASE WHEN authoritative_verdict_id IS NULL THEN live_programme_row.dose_exposure_context ELSE public_scope_row.dose_exposure_context END)
		WHEN 'programme.rawStoppingReason' THEN to_jsonb(CASE WHEN authoritative_verdict_id IS NULL THEN live_programme_row.raw_stopping_reason ELSE public_scope_row.raw_stopping_reason END)
		WHEN 'programme.stoppingReasonCategory' THEN to_jsonb(CASE WHEN authoritative_verdict_id IS NULL THEN live_programme_row.stopping_reason_category ELSE public_scope_row.stopping_reason_category END)
		WHEN 'summary.plainMechanism' THEN to_jsonb(verdict_row.plain_mechanism)
		WHEN 'summary.bestSupportedFinding' THEN to_jsonb(verdict_row.best_supported_finding)
		WHEN 'summary.mainLimitation' THEN to_jsonb(verdict_row.main_limitation)
		WHEN 'verdict.verdictCode' THEN to_jsonb(verdict_row.verdict_code)
		WHEN 'verdict.publicLabel' THEN to_jsonb(verdict_row.public_label)
		WHEN 'verdict.professionalLabel' THEN to_jsonb(verdict_row.professional_label)
		WHEN 'verdict.oneSentenceReason' THEN to_jsonb(verdict_row.one_sentence_reason)
		WHEN 'verdict.scope.indication' THEN to_jsonb(verdict_row.indication_scope)
		WHEN 'verdict.scope.population' THEN to_jsonb(verdict_row.population_scope)
		WHEN 'verdict.scope.doseExposure' THEN to_jsonb(verdict_row.dose_exposure_scope)
		WHEN 'verdict.scope.period' THEN to_jsonb(verdict_row.period_scope)
		WHEN 'verdict.scope.trials' THEN to_jsonb(verdict_row.trial_scope)
		WHEN 'verdict.scope.outcome' THEN to_jsonb(verdict_row.outcome_scope)
		WHEN 'verdict.whatWasDisproven' THEN to_jsonb(verdict_row.what_was_disproven)
		WHEN 'verdict.whatWasNotDisproven' THEN to_jsonb(verdict_row.what_was_not_disproven)
		WHEN 'verdict.whatRemainsUnknown' THEN to_jsonb(verdict_row.what_remains_unknown)
		WHEN 'verdict.confidence' THEN to_jsonb(verdict_row.confidence)
		WHEN 'verdict.confidenceExplanation' THEN to_jsonb(verdict_row.confidence_explanation)
		WHEN 'verdict.conditionsThatWouldChangeVerdict' THEN to_jsonb(verdict_row.conditions_that_would_change_verdict)
		WHEN 'evidenceNode.state' THEN to_jsonb(node_row.state)
		WHEN 'evidenceNode.plainSummary' THEN to_jsonb(node_row.plain_summary)
		WHEN 'evidenceNode.professionalSummary' THEN to_jsonb(node_row.professional_summary)
		WHEN 'evidenceNode.rationale' THEN to_jsonb(node_row.rationale)
	END;
	expected_current_value := COALESCE(expected_current_value, 'null'::jsonb);
	IF NEW.current_value_snapshot -> 'value' IS DISTINCT FROM expected_current_value THEN
		RAISE EXCEPTION 'contribution current-value snapshot does not match the exact public programme bundle';
	END IF;

	IF NEW.source_type = 'UNKNOWN' OR NEW.source_locator !~* '^https?://'
		OR NEW.claim_nature = 'UNKNOWN' THEN
		RAISE EXCEPTION 'contribution machine-pass fields fail deterministic source or claim-nature rules';
	END IF;
	IF NEW.source_review_task_id IS NOT NULL AND NOT EXISTS (
		SELECT 1
		FROM evidence_review_tasks task
		INNER JOIN evidence_sources source ON source.id = task.source_id
		INNER JOIN programme_freshness_states freshness
			ON freshness.programme_id = task.programme_id AND freshness.source_id = task.source_id
		WHERE task.id = NEW.source_review_task_id
			AND task.programme_id = NEW.programme_id
			AND task.trigger_snapshot_id = NEW.source_review_snapshot_id
			AND task.status IN ('OPEN', 'IN_REVIEW', 'BLOCKED')
			AND freshness.pending_snapshot_id = NEW.source_review_snapshot_id
			AND source.source_type = NEW.source_type
			AND lower(source.external_identifier) = lower(NEW.source_identifier)
			AND regexp_replace(source.canonical_locator, '/+$', '') = regexp_replace(NEW.source_locator, '/+$', '')
	) THEN
		RAISE EXCEPTION 'contribution source-task binding is not the exact open pending source snapshot';
	END IF;
	IF NEW.selected_field = 'verdict.verdictCode'
		AND baseline_programme_status NOT IN ('STOPPED', 'WITHDRAWN') THEN
		RAISE EXCEPTION 'stopped-programme verdict target is invalid for the exact public programme status';
	END IF;

	IF NEW.machine_checks ->> 'version' IS DISTINCT FROM 'rna-intelligence/contribution-checks-v1'
		OR NEW.machine_checks ->> 'passed' IS DISTINCT FROM 'true'
		OR jsonb_typeof(NEW.machine_checks -> 'checks') IS DISTINCT FROM 'array'
		OR jsonb_array_length(NEW.machine_checks -> 'checks') <> 15 THEN
		RAISE EXCEPTION 'contribution machine-check bundle is not canonical';
	END IF;
	SELECT count(DISTINCT check_item ->> 'code') INTO machine_code_count
	FROM jsonb_array_elements(NEW.machine_checks -> 'checks') check_item;
	IF machine_code_count <> 15 OR EXISTS (
		SELECT 1 FROM jsonb_array_elements(NEW.machine_checks -> 'checks') check_item
		WHERE check_item ->> 'code' NOT IN (
			'selected_field_present', 'proposal_target_matches_type', 'evidence_node_scope',
			'current_verdict_available', 'proposed_content_present', 'proposed_value_shape',
			'source_complete', 'claim_nature_known', 'reasoning_complete',
			'conclusion_scope_declared', 'coi_attested', 'stopped_verdict_scope',
			'stopped_verdict_target', 'stopped_verdict_value_shape', 'dependency_graph_coverage'
		)
		OR (check_item ->> 'code' = 'dependency_graph_coverage'
			AND check_item ->> 'status' NOT IN ('PASS', 'WARN'))
		OR (check_item ->> 'code' <> 'dependency_graph_coverage'
			AND check_item ->> 'status' <> 'PASS')
	) THEN
		RAISE EXCEPTION 'contribution machine-check results do not contain the canonical passing rule set';
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
				(NEW.selected_field::text LIKE 'evidenceNode.%'
					AND dependency.evidence_node_id = NEW.evidence_node_id)
				OR ((NEW.selected_field::text LIKE 'summary.%' OR NEW.selected_field::text LIKE 'verdict.%')
					AND (
						(dependency.verdict_revision_id = authoritative_verdict_id
							AND dependency.field_path = NEW.selected_field::text)
						OR (NEW.proposal_type = 'VERDICT_CHALLENGE'
							AND dependency.evidence_node_id = NEW.evidence_node_id)
					))
				OR ((NEW.selected_field::text NOT LIKE 'evidenceNode.%'
					AND NEW.selected_field::text NOT LIKE 'summary.%'
					AND NEW.selected_field::text NOT LIKE 'verdict.%')
					AND dependency.field_path = NEW.selected_field::text)
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
		OR NEW.impact_preview -> 'currentVerdictRevisionId'
			IS DISTINCT FROM COALESCE(to_jsonb(authoritative_verdict_id), 'null'::jsonb)
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
		RAISE EXCEPTION 'contribution impact preview does not match persisted public programme dependencies';
	END IF;

	expected_digest := rnawiki_programme_contribution_digest_payload(
		rnawiki_programme_contribution_submission_payload(NEW)
	);
	NEW.content_digest_algorithm := 'sha256';
	NEW.content_digest := expected_digest;
	RETURN NEW;
END;
$$;
