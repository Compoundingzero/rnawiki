CREATE TABLE IF NOT EXISTS "programme_verdict_reviews_legacy_0003" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"verdict_revision_id" varchar(64) NOT NULL,
	"reviewer_user_id" varchar(64),
	"reviewer_name" varchar(160) NOT NULL,
	"decision" "verdict_review_decision" NOT NULL,
	"is_independent" boolean DEFAULT false NOT NULL,
	"conflicts_of_interest" text,
	"review_note" text,
	"reviewed_at" timestamp with time zone NOT NULL,
	"archived_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archive_reason" varchar(120) DEFAULT 'UNBOUND_PRE_0004_REVIEW' NOT NULL,
	CONSTRAINT "programme_verdict_reviews_legacy_reason" CHECK ("programme_verdict_reviews_legacy_0003"."archive_reason" = 'UNBOUND_PRE_0004_REVIEW')
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "programme_verdict_reviews_legacy_revision_idx" ON "programme_verdict_reviews_legacy_0003" USING btree ("verdict_revision_id");--> statement-breakpoint
CREATE TABLE "programme_verdict_scope_snapshots" (
	"verdict_revision_id" varchar(64) PRIMARY KEY NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"drug_id" varchar(96) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" varchar(300) NOT NULL,
	"indication" text,
	"target_population" text,
	"jurisdiction" varchar(120),
	"sponsor" varchar(300),
	"partners" jsonb NOT NULL,
	"status" "programme_status" NOT NULL,
	"highest_phase_reached" varchar(80),
	"route" varchar(160),
	"dose_exposure_context" text,
	"start_date" date,
	"end_date" date,
	"raw_stopping_reason" text,
	"stopping_reason_category" "stopping_reason_category" NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_scope_dates_order" CHECK ("programme_verdict_scope_snapshots"."start_date" is null or "programme_verdict_scope_snapshots"."end_date" is null or "programme_verdict_scope_snapshots"."end_date" >= "programme_verdict_scope_snapshots"."start_date")
);--> statement-breakpoint
CREATE TABLE "programme_verdict_source_metadata_snapshots" (
	"verdict_revision_id" varchar(64) NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"source_type" "evidence_source_type" NOT NULL,
	"external_identifier" varchar(400),
	"canonical_locator" text NOT NULL,
	"title" text,
	"publisher" varchar(300),
	"sponsor" varchar(300),
	"publication_date" date,
	"correction_status" "source_correction_status" NOT NULL,
	"jurisdiction" varchar(120),
	"hierarchy" "source_hierarchy" NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_source_metadata_pk" PRIMARY KEY("verdict_revision_id","source_id")
);--> statement-breakpoint
CREATE TABLE "programme_verdict_trial_snapshots" (
	"verdict_revision_id" varchar(64) NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"programme_trial_id" varchar(64) NOT NULL,
	"trial_identifier" varchar(160) NOT NULL,
	"title" text,
	"phase" varchar(80),
	"status" "trial_status" NOT NULL,
	"results_status" "trial_results_status" NOT NULL,
	"enrolment" integer,
	"enrolment_type" "trial_enrolment_type" NOT NULL,
	"start_date" date,
	"primary_completion_date" date,
	"completion_date" date,
	"human_study_status" "human_study_status" NOT NULL,
	"registry_source_id" varchar(64),
	"registry_snapshot_id" varchar(64),
	"last_verified_at" timestamp with time zone,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_trial_snapshots_pk" PRIMARY KEY("verdict_revision_id","programme_trial_id"),
	CONSTRAINT "programme_verdict_trial_snapshots_enrolment_nonnegative" CHECK ("programme_verdict_trial_snapshots"."enrolment" is null or "programme_verdict_trial_snapshots"."enrolment" >= 0),
	CONSTRAINT "programme_verdict_trial_snapshots_dates_order" CHECK ("programme_verdict_trial_snapshots"."start_date" is null or "programme_verdict_trial_snapshots"."completion_date" is null or "programme_verdict_trial_snapshots"."completion_date" >= "programme_verdict_trial_snapshots"."start_date"),
	CONSTRAINT "programme_verdict_trial_snapshots_snapshot_has_source" CHECK ("programme_verdict_trial_snapshots"."registry_snapshot_id" is null or "programme_verdict_trial_snapshots"."registry_source_id" is not null)
);--> statement-breakpoint
ALTER TABLE "programme_verdict_scope_snapshots" ADD CONSTRAINT "programme_verdict_scope_verdict_programme_fk" FOREIGN KEY ("verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_source_metadata_snapshots" ADD CONSTRAINT "programme_verdict_source_metadata_snapshots_source_id_evidence_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_source_metadata_snapshots" ADD CONSTRAINT "programme_verdict_source_metadata_verdict_programme_fk" FOREIGN KEY ("verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_trial_snapshots" ADD CONSTRAINT "programme_verdict_trial_snapshots_registry_source_id_evidence_sources_id_fk" FOREIGN KEY ("registry_source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_trial_snapshots" ADD CONSTRAINT "programme_verdict_trial_snapshots_verdict_programme_fk" FOREIGN KEY ("verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_trial_snapshots" ADD CONSTRAINT "programme_verdict_trial_snapshots_link_fk" FOREIGN KEY ("verdict_revision_id","programme_trial_id") REFERENCES "public"."programme_verdict_trials"("verdict_revision_id","programme_trial_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_trial_snapshots" ADD CONSTRAINT "programme_verdict_trial_snapshots_registry_snapshot_source_fk" FOREIGN KEY ("registry_snapshot_id","registry_source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "programme_verdict_scope_programme_idx" ON "programme_verdict_scope_snapshots" USING btree ("programme_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_source_metadata_source_idx" ON "programme_verdict_source_metadata_snapshots" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_source_metadata_programme_idx" ON "programme_verdict_source_metadata_snapshots" USING btree ("programme_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_trial_snapshots_trial_idx" ON "programme_verdict_trial_snapshots" USING btree ("programme_trial_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_trial_snapshots_programme_idx" ON "programme_verdict_trial_snapshots" USING btree ("programme_id");--> statement-breakpoint

-- One verdict bundle includes direct verdict claims plus the claims attached to its exact evidence
-- node and interpretability revisions. Centralising that definition keeps the public read, guards,
-- and publication transition aligned.
CREATE OR REPLACE FUNCTION "rnawiki_reviewed_verdict_claim_ids"("target_verdict_id" varchar(64))
RETURNS TABLE("claim_id" varchar(64))
LANGUAGE sql
STABLE
AS $$
	SELECT link."claim_id"
	FROM "programme_verdict_claims" link
	WHERE link."verdict_revision_id" = "target_verdict_id"
	UNION
	SELECT node_claim."claim_id"
	FROM "programme_verdict_evidence_nodes" verdict_node
	INNER JOIN "evidence_node_claims" node_claim
		ON node_claim."evidence_node_id" = verdict_node."evidence_node_id"
		AND node_claim."programme_id" = verdict_node."programme_id"
	WHERE verdict_node."verdict_revision_id" = "target_verdict_id"
	UNION
	SELECT assessment_claim."claim_id"
	FROM "programme_verdict_interpretability_assessments" verdict_assessment
	INNER JOIN "trial_interpretability_claims" assessment_claim
		ON assessment_claim."assessment_id" = verdict_assessment."assessment_id"
		AND assessment_claim."programme_id" = verdict_assessment."programme_id"
	WHERE verdict_assessment."verdict_revision_id" = "target_verdict_id";
$$;--> statement-breakpoint

-- Freeze every edge that determines a prepared proposal's exact evidence graph. The 0004 guard
-- only followed direct programme_verdict_claims, which left a claim cited solely through a reviewed
-- node or interpretability assessment able to change its source links. Prepared-at is included as
-- the primary boundary so a proposal remains frozen even if its workflow status is later repaired.
CREATE OR REPLACE FUNCTION "rnawiki_guard_reviewed_graph_link"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	old_payload jsonb;
	new_payload jsonb;
	programme_id varchar(64);
	is_frozen boolean := false;
BEGIN
	old_payload := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END;
	new_payload := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END;
	programme_id := coalesce(old_payload->>'programme_id', new_payload->>'programme_id');
	IF TG_OP = 'DELETE' AND NOT EXISTS (
		SELECT 1 FROM "development_programmes" WHERE "id" = programme_id
	) THEN
		RETURN OLD;
	END IF;

	IF TG_TABLE_NAME = 'claim_source_links' THEN
		SELECT EXISTS (
			SELECT 1
			FROM "programme_verdict_revisions" verdict
			INNER JOIN "rnawiki_reviewed_verdict_claim_ids"(verdict."id") reviewed_claim
				ON reviewed_claim."claim_id" IN (
					old_payload->>'claim_id',
					new_payload->>'claim_id'
				)
			WHERE verdict."proposal_prepared_at" IS NOT NULL
				OR verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
		) INTO is_frozen;
	ELSIF TG_TABLE_NAME = 'evidence_node_claims' THEN
		SELECT EXISTS (
			SELECT 1
			FROM "programme_verdict_evidence_nodes" link
			INNER JOIN "programme_verdict_revisions" verdict ON verdict."id" = link."verdict_revision_id"
			WHERE link."evidence_node_id" IN (
					old_payload->>'evidence_node_id',
					new_payload->>'evidence_node_id'
				)
				AND (
					verdict."proposal_prepared_at" IS NOT NULL
					OR verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
				)
		) INTO is_frozen;
	ELSE
		SELECT EXISTS (
			SELECT 1
			FROM "programme_verdict_interpretability_assessments" link
			INNER JOIN "programme_verdict_revisions" verdict ON verdict."id" = link."verdict_revision_id"
			WHERE link."assessment_id" IN (
					old_payload->>'assessment_id',
					new_payload->>'assessment_id'
				)
				AND (
					verdict."proposal_prepared_at" IS NOT NULL
					OR verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
				)
		) INTO is_frozen;
	END IF;

	IF is_frozen THEN
		RAISE EXCEPTION 'claim and interpretation links in a prepared verdict graph are immutable'
			USING ERRCODE = '55000';
	END IF;
	IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
	RETURN NEW;
END;
$$;--> statement-breakpoint

-- Backfill exact scope/source metadata for already prepared or published verdicts. These values were
-- part of the existing proposal digest; 0008 makes that reviewed state explicit and readable.
INSERT INTO "programme_verdict_scope_snapshots" (
	"verdict_revision_id", "programme_id", "drug_id", "slug", "title", "indication",
	"target_population", "jurisdiction", "sponsor", "partners", "status",
	"highest_phase_reached", "route", "dose_exposure_context", "start_date", "end_date",
	"raw_stopping_reason", "stopping_reason_category", "captured_at"
)
SELECT
	verdict."id", programme."id", programme."drug_id", programme."slug", programme."title",
	programme."indication", programme."target_population", programme."jurisdiction",
	programme."sponsor", programme."partners", programme."status", programme."highest_phase_reached",
	programme."route", programme."dose_exposure_context", programme."start_date", programme."end_date",
	programme."raw_stopping_reason", programme."stopping_reason_category",
	coalesce(verdict."proposal_prepared_at", verdict."published_at", verdict."created_at")
FROM "programme_verdict_revisions" verdict
INNER JOIN "development_programmes" programme ON programme."id" = verdict."programme_id"
WHERE verdict."proposal_prepared_at" IS NOT NULL
	OR verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
ON CONFLICT ("verdict_revision_id") DO NOTHING;--> statement-breakpoint
INSERT INTO "programme_verdict_trial_snapshots" (
	"verdict_revision_id", "programme_id", "programme_trial_id", "trial_identifier", "title",
	"phase", "status", "results_status", "enrolment", "enrolment_type", "start_date",
	"primary_completion_date", "completion_date", "human_study_status", "registry_source_id",
	"registry_snapshot_id", "last_verified_at", "captured_at"
)
SELECT
	verdict."id", verdict."programme_id", trial."id", trial."trial_identifier", trial."title",
	trial."phase", trial."status", trial."results_status", trial."enrolment", trial."enrolment_type",
	trial."start_date", trial."primary_completion_date", trial."completion_date",
	trial."human_study_status", trial."registry_source_id", trial."registry_snapshot_id",
	trial."last_verified_at", coalesce(verdict."proposal_prepared_at", verdict."published_at", verdict."created_at")
FROM "programme_verdict_revisions" verdict
INNER JOIN "programme_verdict_trials" verdict_trial ON verdict_trial."verdict_revision_id" = verdict."id"
INNER JOIN "programme_trials" trial
	ON trial."id" = verdict_trial."programme_trial_id"
	AND trial."programme_id" = verdict_trial."programme_id"
WHERE verdict."proposal_prepared_at" IS NOT NULL
	OR verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
ON CONFLICT ("verdict_revision_id", "programme_trial_id") DO NOTHING;--> statement-breakpoint
WITH verdict_sources AS (
	SELECT verdict."id" AS "verdict_revision_id", verdict."programme_id", snapshot."source_id"
	FROM "programme_verdict_revisions" verdict
	INNER JOIN "rnawiki_reviewed_verdict_claim_ids"(verdict."id") reviewed_claim ON true
	INNER JOIN "claim_source_links" claim_source ON claim_source."claim_id" = reviewed_claim."claim_id"
	INNER JOIN "source_snapshots" snapshot ON snapshot."id" = claim_source."source_snapshot_id"
	WHERE verdict."proposal_prepared_at" IS NOT NULL
		OR verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
	UNION
	SELECT verdict."id", verdict."programme_id", trial."registry_source_id"
	FROM "programme_verdict_revisions" verdict
	INNER JOIN "programme_verdict_trial_snapshots" trial
		ON trial."verdict_revision_id" = verdict."id"
		AND trial."programme_id" = verdict."programme_id"
	WHERE trial."registry_source_id" IS NOT NULL
		AND (
			verdict."proposal_prepared_at" IS NOT NULL
			OR verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
		)
)
INSERT INTO "programme_verdict_source_metadata_snapshots" (
	"verdict_revision_id", "programme_id", "source_id", "source_type", "external_identifier",
	"canonical_locator", "title", "publisher", "sponsor", "publication_date",
	"correction_status", "jurisdiction", "hierarchy"
)
SELECT
	verdict_source."verdict_revision_id", verdict_source."programme_id", source."id",
	source."source_type", source."external_identifier", source."canonical_locator", source."title",
	source."publisher", source."sponsor", source."publication_date", source."correction_status",
	source."jurisdiction", source."hierarchy"
FROM verdict_sources verdict_source
INNER JOIN "evidence_sources" source ON source."id" = verdict_source."source_id"
ON CONFLICT ("verdict_revision_id", "source_id") DO NOTHING;--> statement-breakpoint

-- Public scope is now verdict-scoped. Live catalogue rows may evolve as staging inputs without
-- rewriting the current reviewed record; only publishing a new verdict advances public scope.
DROP TRIGGER IF EXISTS "development_programmes_published_status_guard" ON "development_programmes";--> statement-breakpoint

DROP TRIGGER IF EXISTS "development_programmes_reviewed_scope_immutable" ON "development_programmes";--> statement-breakpoint
DROP TRIGGER IF EXISTS "evidence_sources_reviewed_metadata_immutable" ON "evidence_sources";--> statement-breakpoint
DROP TRIGGER IF EXISTS "programme_trials_scoped_immutable" ON "programme_trials";--> statement-breakpoint

-- A prior local-only draft installed guards on the live staging rows. Drop those names if present:
-- reviewed public metadata now lives in verdict-scoped snapshots, so programme/trial/source staging
-- rows remain editable inputs for the next reviewed publication.
CREATE OR REPLACE FUNCTION "rnawiki_guard_verdict_bundle_link"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	old_payload jsonb;
	new_payload jsonb;
	programme_id varchar(64);
	is_frozen boolean := false;
BEGIN
	old_payload := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END;
	new_payload := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END;
	programme_id := coalesce(old_payload->>'programme_id', new_payload->>'programme_id');

	IF TG_OP = 'DELETE' AND NOT EXISTS (
		SELECT 1 FROM "development_programmes" WHERE "id" = programme_id
	) THEN
		RETURN OLD;
	END IF;

	SELECT EXISTS (
		SELECT 1
		FROM "programme_verdict_revisions" verdict
		WHERE verdict."id" IN (
				old_payload->>'verdict_revision_id',
				new_payload->>'verdict_revision_id'
			)
			AND (
				verdict."proposal_prepared_at" IS NOT NULL
				OR verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
			)
		UNION ALL
		SELECT 1
		FROM "programme_verdict_evidence_nodes" link
		INNER JOIN "programme_verdict_revisions" verdict
			ON verdict."id" = link."verdict_revision_id"
		WHERE TG_TABLE_NAME = 'programme_dependencies'
			AND link."evidence_node_id" IN (
				old_payload->>'evidence_node_id',
				new_payload->>'evidence_node_id'
			)
			AND (
				verdict."proposal_prepared_at" IS NOT NULL
				OR verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
			)
	) INTO is_frozen;

	IF is_frozen THEN
		RAISE EXCEPTION 'prepared verdict proposal links and snapshots are immutable'
			USING ERRCODE = '55000';
	END IF;

	IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "programme_verdict_scope_snapshots_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_scope_snapshots"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_bundle_link"();--> statement-breakpoint
CREATE TRIGGER "programme_verdict_trial_snapshots_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_trial_snapshots"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_bundle_link"();--> statement-breakpoint
CREATE TRIGGER "programme_verdict_source_metadata_snapshots_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_source_metadata_snapshots"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_bundle_link"();--> statement-breakpoint

-- Freeze exact evidence revisions as soon as their parent proposal is prepared. Publication may
-- change only review_status and publication timestamps. A current member may become SUPERSEDED only
-- when the public pointer leaves its verdict in the same transaction (enforced below).
CREATE OR REPLACE FUNCTION "rnawiki_guard_published_evidence_revision"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	payload jsonb;
	programme_id varchar(64);
	row_id varchar(64);
	old_status text;
	is_reviewed boolean := false;
BEGIN
	payload := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
	programme_id := payload->>'programme_id';
	row_id := to_jsonb(OLD)->>'id';
	old_status := to_jsonb(OLD)->>'review_status';

	IF TG_OP = 'DELETE' AND NOT EXISTS (
		SELECT 1 FROM "development_programmes" WHERE "id" = programme_id
	) THEN
		RETURN OLD;
	END IF;

	IF TG_TABLE_NAME = 'claims' THEN
		SELECT EXISTS (
			SELECT 1
			FROM "programme_verdict_revisions" verdict
			INNER JOIN "rnawiki_reviewed_verdict_claim_ids"(verdict."id") reviewed_claim
				ON reviewed_claim."claim_id" = row_id
			WHERE verdict."proposal_prepared_at" IS NOT NULL
				OR verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
		) INTO is_reviewed;
	ELSIF TG_TABLE_NAME = 'evidence_nodes' THEN
		SELECT EXISTS (
			SELECT 1
			FROM "programme_verdict_evidence_nodes" link
			INNER JOIN "programme_verdict_revisions" verdict ON verdict."id" = link."verdict_revision_id"
			WHERE link."evidence_node_id" = row_id
				AND (
					verdict."proposal_prepared_at" IS NOT NULL
					OR verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
				)
		) INTO is_reviewed;
	ELSE
		SELECT EXISTS (
			SELECT 1
			FROM "programme_verdict_interpretability_assessments" link
			INNER JOIN "programme_verdict_revisions" verdict ON verdict."id" = link."verdict_revision_id"
			WHERE link."assessment_id" = row_id
				AND (
					verdict."proposal_prepared_at" IS NOT NULL
					OR verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
				)
		) INTO is_reviewed;
	END IF;

	IF TG_OP = 'DELETE' AND (is_reviewed OR old_status IN ('PUBLISHED', 'SUPERSEDED')) THEN
		RAISE EXCEPTION 'reviewed evidence revisions are append-only'
			USING ERRCODE = '55000';
	END IF;
	IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;

	IF old_status = 'SUPERSEDED' THEN
		RAISE EXCEPTION 'superseded evidence revisions are immutable'
			USING ERRCODE = '55000';
	END IF;

	IF is_reviewed THEN
		IF old_status = 'PUBLISHED' THEN
			IF to_jsonb(NEW)->>'review_status' <> 'SUPERSEDED'
				OR (to_jsonb(NEW) - ARRAY['review_status', 'superseded_at']::text[])
					IS DISTINCT FROM
					(to_jsonb(OLD) - ARRAY['review_status', 'superseded_at']::text[]) THEN
				RAISE EXCEPTION 'a reviewed PUBLISHED evidence revision may only transition intact to SUPERSEDED'
					USING ERRCODE = '55000';
			END IF;
		ELSIF to_jsonb(NEW)->>'review_status' <> 'PUBLISHED'
			OR old_status NOT IN ('DRAFT', 'MACHINE_CHECKED', 'APPROVED')
			OR (to_jsonb(NEW) - ARRAY['review_status', 'published_at', 'superseded_at']::text[])
				IS DISTINCT FROM
				(to_jsonb(OLD) - ARRAY['review_status', 'published_at', 'superseded_at']::text[]) THEN
			RAISE EXCEPTION 'a prepared evidence revision is frozen until atomic publication'
				USING ERRCODE = '55000';
		END IF;
		RETURN NEW;
	END IF;

	IF old_status = 'PUBLISHED' THEN
		IF to_jsonb(NEW)->>'review_status' <> 'SUPERSEDED'
			OR (to_jsonb(NEW) - ARRAY['review_status', 'superseded_at']::text[])
				IS DISTINCT FROM
				(to_jsonb(OLD) - ARRAY['review_status', 'superseded_at']::text[]) THEN
			RAISE EXCEPTION 'a published evidence revision may only transition intact to SUPERSEDED'
				USING ERRCODE = '55000';
		END IF;
	END IF;

	RETURN NEW;
END;
$$;--> statement-breakpoint

-- A pointer can reference only a completely published exact graph. This replaces the 0004 pointer
-- trigger because programme status is now read from the verdict snapshot, never the mutable live
-- authoring row. All earlier digest, review, dependency and freshness gates remain enforced here.
CREATE OR REPLACE FUNCTION "rnawiki_validate_current_bundle_members"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	verdict_row "programme_verdict_revisions"%ROWTYPE;
	reviewed_programme_status "programme_status";
	required_path text;
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
	IF verdict_row."review_status" <> 'PUBLISHED' THEN
		RAISE EXCEPTION 'current publication must reference a PUBLISHED verdict revision'
			USING ERRCODE = '23514';
	END IF;
	IF verdict_row."published_at" IS DISTINCT FROM NEW."published_at" THEN
		RAISE EXCEPTION 'current publication timestamp must match the verdict revision timestamp'
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
		SELECT 1 FROM "programme_verdict_reviews" review
		WHERE review."verdict_revision_id" = NEW."verdict_revision_id"
			AND (
				review."reviewer_user_id" IS NULL
				OR review."proposal_digest_algorithm" <> 'sha256'
				OR review."proposal_digest" IS DISTINCT FROM verdict_row."proposal_digest"
				OR review."engine_version" IS DISTINCT FROM verdict_row."engine_version"
				OR review."input_digest_algorithm" <> 'sha256'
				OR review."input_digest" IS DISTINCT FROM verdict_row."input_digest"
			)
	) THEN
		RAISE EXCEPTION 'all reviews must sign the exact current proposal and engine input'
			USING ERRCODE = '23514';
	END IF;

	IF (
		WITH latest_reviews AS (
			SELECT review.*,
				row_number() OVER (
					PARTITION BY review."reviewer_user_id"
					ORDER BY review."reviewed_at" DESC, review."id" DESC
				) AS reviewer_rank
			FROM "programme_verdict_reviews" review
			WHERE review."verdict_revision_id" = NEW."verdict_revision_id"
		)
		SELECT count(*) FROM latest_reviews
		WHERE reviewer_rank = 1
			AND "decision" = 'APPROVE'
			AND "is_independent" = true
			AND "conflicts_of_interest_attested" = true
			AND cardinality("expertise_tags") > 0
			AND "reviewer_user_id" IS DISTINCT FROM verdict_row."author_user_id"
	) < 2 THEN
		RAISE EXCEPTION 'a published verdict requires two distinct authenticated independent approvals'
			USING ERRCODE = '23514';
	END IF;

	IF EXISTS (
		WITH latest_reviews AS (
			SELECT review.*,
				row_number() OVER (
					PARTITION BY review."reviewer_user_id"
					ORDER BY review."reviewed_at" DESC, review."id" DESC
				) AS reviewer_rank
			FROM "programme_verdict_reviews" review
			WHERE review."verdict_revision_id" = NEW."verdict_revision_id"
		)
		SELECT 1 FROM latest_reviews
		WHERE reviewer_rank = 1 AND "decision" IN ('REJECT', 'CHANGES_REQUESTED')
	) THEN
		RAISE EXCEPTION 'a programme verdict cannot publish with an unresolved rejection or change request'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "rnawiki_reviewed_verdict_claim_ids"(NEW."verdict_revision_id") reviewed_claim
		LEFT JOIN "claims" claim
			ON claim."id" = reviewed_claim."claim_id"
			AND claim."programme_id" = NEW."programme_id"
		WHERE claim."id" IS NULL OR claim."review_status" <> 'PUBLISHED'
	) THEN
		RAISE EXCEPTION 'current publication claims must be exact PUBLISHED revisions'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_evidence_nodes" link
		LEFT JOIN "evidence_nodes" node
			ON node."id" = link."evidence_node_id"
			AND node."programme_id" = NEW."programme_id"
		WHERE link."verdict_revision_id" = NEW."verdict_revision_id"
			AND (node."id" IS NULL OR node."review_status" <> 'PUBLISHED')
	) THEN
		RAISE EXCEPTION 'current publication evidence nodes must be exact PUBLISHED revisions'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_interpretability_assessments" link
		LEFT JOIN "trial_interpretability_assessments" assessment
			ON assessment."id" = link."assessment_id"
			AND assessment."programme_id" = NEW."programme_id"
		WHERE link."verdict_revision_id" = NEW."verdict_revision_id"
			AND (assessment."id" IS NULL OR assessment."review_status" <> 'PUBLISHED')
	) THEN
		RAISE EXCEPTION 'current publication interpretability answers must be exact PUBLISHED revisions'
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
		SELECT source_id
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
			SELECT 1
			FROM "programme_verdict_source_metadata_snapshots" source_metadata
			WHERE source_metadata."verdict_revision_id" = NEW."verdict_revision_id"
				AND source_metadata."programme_id" = NEW."programme_id"
				AND source_metadata."source_id" = reviewed_source."source_id"
		)
	) THEN
		RAISE EXCEPTION 'current publication requires exact reviewed metadata for every source'
			USING ERRCODE = '23514';
	END IF;

	FOREACH required_path IN ARRAY ARRAY[
		'summary.plainMechanism',
		'summary.bestSupportedFinding',
		'summary.mainLimitation'
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
		'verdict.publicLabel',
		'verdict.professionalLabel',
		'verdict.oneSentenceReason',
		'verdict.scope.indication',
		'verdict.scope.population',
		'verdict.scope.doseExposure',
		'verdict.scope.period',
		'verdict.scope.trials',
		'verdict.scope.outcome',
		'verdict.whatWasDisproven',
		'verdict.whatWasNotDisproven',
		'verdict.whatRemainsUnknown',
		'verdict.confidence',
		'verdict.confidenceExplanation',
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
		WITH cited_snapshots AS (
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
		), cited_sources AS (
			SELECT DISTINCT "source_id" FROM cited_snapshots
		)
		SELECT 1
		FROM cited_sources cited
		LEFT JOIN "programme_freshness_states" freshness
			ON freshness."programme_id" = NEW."programme_id"
			AND freshness."source_id" = cited."source_id"
		WHERE freshness."current_snapshot_id" IS NULL
			OR freshness."pending_snapshot_id" IS NOT NULL
			OR NOT EXISTS (
				SELECT 1 FROM cited_snapshots snapshot
				WHERE snapshot."source_id" = cited."source_id"
					AND snapshot.snapshot_id = freshness."current_snapshot_id"
			)
	) THEN
		RAISE EXCEPTION 'published verdict sources must resolve to exact current snapshots with no pending review'
			USING ERRCODE = '23514';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "evidence_review_tasks" task
		WHERE task."programme_id" = NEW."programme_id"
			AND task."status" IN ('OPEN', 'IN_REVIEW', 'BLOCKED')
			AND task."impact_level" IN (
				'INTERPRETIVE_REVIEW_REQUIRED',
				'POSSIBLE_VERDICT_IMPACT',
				'SAFETY_CRITICAL_REVIEW'
			)
			AND (
				EXISTS (
					SELECT 1
					FROM jsonb_array_elements_text(task."affected_claim_ids") affected("claim_id")
					INNER JOIN "rnawiki_reviewed_verdict_claim_ids"(NEW."verdict_revision_id") reviewed_claim
						ON reviewed_claim."claim_id" = affected."claim_id"
				)
				OR EXISTS (
					SELECT 1
					FROM jsonb_array_elements_text(task."affected_surface_paths") affected("field_path")
					INNER JOIN "programme_dependencies" dependency
						ON dependency."field_path" = affected."field_path"
					WHERE dependency."verdict_revision_id" = NEW."verdict_revision_id"
				)
				OR EXISTS (
					SELECT 1
					FROM "rnawiki_reviewed_verdict_claim_ids"(NEW."verdict_revision_id") reviewed_claim
					INNER JOIN "claim_source_links" link ON link."claim_id" = reviewed_claim."claim_id"
					INNER JOIN "source_snapshots" snapshot ON snapshot."id" = link."source_snapshot_id"
					WHERE snapshot."source_id" = task."source_id"
				)
			)
	) THEN
		RAISE EXCEPTION 'high-impact evidence review tasks must be resolved before publication'
			USING ERRCODE = '23514';
	END IF;

	RETURN NEW;
END;
$$;--> statement-breakpoint
DROP TRIGGER IF EXISTS "programme_current_publications_validate" ON "programme_current_publications";--> statement-breakpoint
DROP TRIGGER IF EXISTS "programme_current_publications_bundle_validate" ON "programme_current_publications";--> statement-breakpoint
CREATE TRIGGER "programme_current_publications_bundle_validate"
BEFORE INSERT OR UPDATE ON "programme_current_publications"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_validate_current_bundle_members"();--> statement-breakpoint

-- The status-only transition needed to replace a bundle is legal only if, by commit, the exact row
-- is no longer a member of the authoritative pointer. Direct SQL cannot leave a current verdict
-- pointing at a SUPERSEDED or deleted member.
CREATE OR REPLACE FUNCTION "rnawiki_require_current_bundle_member"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	row_id varchar(64);
	target_programme_id varchar(64);
	is_current boolean := false;
BEGIN
	row_id := to_jsonb(OLD)->>'id';
	target_programme_id := to_jsonb(OLD)->>'programme_id';
	IF NOT EXISTS (SELECT 1 FROM "development_programmes" WHERE "id" = target_programme_id) THEN
		IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
		RETURN NEW;
	END IF;

	IF TG_TABLE_NAME = 'claims' THEN
		SELECT EXISTS (
			SELECT 1
			FROM "programme_current_publications" publication
			INNER JOIN "rnawiki_reviewed_verdict_claim_ids"(publication."verdict_revision_id") reviewed_claim
				ON reviewed_claim."claim_id" = row_id
			WHERE publication."programme_id" = target_programme_id
		) INTO is_current;
	ELSIF TG_TABLE_NAME = 'evidence_nodes' THEN
		SELECT EXISTS (
			SELECT 1
			FROM "programme_current_publications" publication
			INNER JOIN "programme_verdict_evidence_nodes" link
				ON link."verdict_revision_id" = publication."verdict_revision_id"
			WHERE publication."programme_id" = target_programme_id
				AND link."evidence_node_id" = row_id
		) INTO is_current;
	ELSE
		SELECT EXISTS (
			SELECT 1
			FROM "programme_current_publications" publication
			INNER JOIN "programme_verdict_interpretability_assessments" link
				ON link."verdict_revision_id" = publication."verdict_revision_id"
			WHERE publication."programme_id" = target_programme_id
				AND link."assessment_id" = row_id
		) INTO is_current;
	END IF;

	IF is_current AND (TG_OP = 'DELETE' OR to_jsonb(NEW)->>'review_status' <> 'PUBLISHED') THEN
		RAISE EXCEPTION 'a current publication bundle member must remain PUBLISHED until the pointer advances'
			USING ERRCODE = '23514';
	END IF;

	IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
	RETURN NEW;
END;
$$;--> statement-breakpoint
DROP TRIGGER IF EXISTS "claims_current_bundle_guard" ON "claims";--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "claims_current_bundle_guard"
AFTER UPDATE OR DELETE ON "claims"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "rnawiki_require_current_bundle_member"();--> statement-breakpoint
DROP TRIGGER IF EXISTS "evidence_nodes_current_bundle_guard" ON "evidence_nodes";--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "evidence_nodes_current_bundle_guard"
AFTER UPDATE OR DELETE ON "evidence_nodes"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "rnawiki_require_current_bundle_member"();--> statement-breakpoint
DROP TRIGGER IF EXISTS "trial_interpretability_current_bundle_guard" ON "trial_interpretability_assessments";--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "trial_interpretability_current_bundle_guard"
AFTER UPDATE OR DELETE ON "trial_interpretability_assessments"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION "rnawiki_require_current_bundle_member"();--> statement-breakpoint
-- Fail the migration rather than carrying forward a pointer that violates the exact-bundle
-- contract. The value is unchanged; the replacement exact-bundle validator still executes.
UPDATE "programme_current_publications" SET "published_at" = "published_at";
