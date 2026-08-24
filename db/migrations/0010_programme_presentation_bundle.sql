-- Immutable verdict-scoped mechanism and decision-changing timeline presentation.
CREATE TYPE "public"."mechanism_evidence_basis" AS ENUM('MEASURED_IN_PEOPLE', 'MEASURED_OUTSIDE_PEOPLE', 'PREDICTED', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."programme_timeline_date_basis" AS ENUM('ACTUAL', 'PLANNED', 'REPORTED_UNCLEAR');--> statement-breakpoint
CREATE TYPE "public"."programme_timeline_event_type" AS ENUM('PROGRAMME_MILESTONE', 'FIRST_HUMAN_ADMINISTRATION', 'PHASE_PROGRESSION', 'IMPORTANT_RESULT', 'SAFETY_SIGNAL', 'REGULATORY_ACTION', 'PAUSE_OR_TERMINATION', 'LICENSING_OR_ACQUISITION');--> statement-breakpoint
-- PostgreSQL cannot consume an ALTER TYPE ... ADD VALUE later in the same migration transaction.
-- Replace this one-column enum transactionally so the new value can be used by constraints below.
ALTER TABLE "programme_dependencies" DROP CONSTRAINT "programme_dependencies_target_shape";--> statement-breakpoint
ALTER TYPE "public"."dependent_surface_type" RENAME TO "dependent_surface_type_0009";--> statement-breakpoint
CREATE TYPE "public"."dependent_surface_type" AS ENUM(
	'PROGRAMME_SUMMARY', 'PROGRAMME_STATUS', 'EVIDENCE_NODE', 'MECHANISM_MAP', 'TIMELINE',
	'VERDICT', 'SAFETY_LANGUAGE', 'SEARCH_DOCUMENT', 'BROWSE_CARD', 'HOMEPAGE_CARD',
	'METADATA', 'STRUCTURED_DATA', 'API_OUTPUT'
);--> statement-breakpoint
ALTER TABLE "programme_dependencies" ALTER COLUMN "dependent_surface_type"
	TYPE "public"."dependent_surface_type"
	USING "dependent_surface_type"::text::"public"."dependent_surface_type";--> statement-breakpoint
DROP TYPE "public"."dependent_surface_type_0009";--> statement-breakpoint
CREATE TABLE "programme_verdict_mechanism_step_claims" (
	"verdict_revision_id" varchar(64) NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"step_key" varchar(64) NOT NULL,
	"claim_id" varchar(64) NOT NULL,
	"relationship" "evidence_node_claim_relationship" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_mechanism_step_claims_pk" PRIMARY KEY("verdict_revision_id","step_key","claim_id","relationship"),
	CONSTRAINT "programme_verdict_mechanism_step_claims_target_claim_unique" UNIQUE("verdict_revision_id","step_key","claim_id")
);
--> statement-breakpoint
CREATE TABLE "programme_verdict_mechanism_steps" (
	"verdict_revision_id" varchar(64) NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"step_key" varchar(64) NOT NULL,
	"step_order" integer NOT NULL,
	"plain_title" text NOT NULL,
	"plain_description" text NOT NULL,
	"technical_description" text,
	"evidence_basis" "mechanism_evidence_basis" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_mechanism_steps_pk" PRIMARY KEY("verdict_revision_id","step_key"),
	CONSTRAINT "programme_verdict_mechanism_steps_scope_unique" UNIQUE("verdict_revision_id","step_key","programme_id"),
	CONSTRAINT "programme_verdict_mechanism_steps_key" CHECK ("programme_verdict_mechanism_steps"."step_key" ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
	CONSTRAINT "programme_verdict_mechanism_steps_order" CHECK ("programme_verdict_mechanism_steps"."step_order" between 1 and 5),
	CONSTRAINT "programme_verdict_mechanism_steps_copy" CHECK (nullif(btrim("programme_verdict_mechanism_steps"."plain_title"), '') is not null
	        and char_length(btrim("programme_verdict_mechanism_steps"."plain_title")) <= 240
	        and nullif(btrim("programme_verdict_mechanism_steps"."plain_description"), '') is not null
	        and char_length(btrim("programme_verdict_mechanism_steps"."plain_description")) <= 2000
	        and ("programme_verdict_mechanism_steps"."technical_description" is null or (
	          nullif(btrim("programme_verdict_mechanism_steps"."technical_description"), '') is not null
	          and char_length(btrim("programme_verdict_mechanism_steps"."technical_description")) <= 4000
	        )))
);
--> statement-breakpoint
CREATE TABLE "programme_verdict_timeline_event_claims" (
	"verdict_revision_id" varchar(64) NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"event_key" varchar(64) NOT NULL,
	"claim_id" varchar(64) NOT NULL,
	"relationship" "evidence_node_claim_relationship" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_timeline_event_claims_pk" PRIMARY KEY("verdict_revision_id","event_key","claim_id","relationship"),
	CONSTRAINT "programme_verdict_timeline_event_claims_target_claim_unique" UNIQUE("verdict_revision_id","event_key","claim_id")
);
--> statement-breakpoint
CREATE TABLE "programme_verdict_timeline_events" (
	"verdict_revision_id" varchar(64) NOT NULL,
	"programme_id" varchar(64) NOT NULL,
	"event_key" varchar(64) NOT NULL,
	"event_date" date NOT NULL,
	"event_type" "programme_timeline_event_type" NOT NULL,
	"date_basis" "programme_timeline_date_basis" NOT NULL,
	"plain_title" text NOT NULL,
	"plain_description" text NOT NULL,
	"technical_description" text,
	"programme_trial_id" varchar(64),
	"source_id" varchar(64) NOT NULL,
	"source_snapshot_id" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_timeline_events_pk" PRIMARY KEY("verdict_revision_id","event_key"),
	CONSTRAINT "programme_verdict_timeline_events_scope_unique" UNIQUE("verdict_revision_id","event_key","programme_id"),
	CONSTRAINT "programme_verdict_timeline_events_key" CHECK ("programme_verdict_timeline_events"."event_key" ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
	CONSTRAINT "programme_verdict_timeline_events_copy" CHECK (nullif(btrim("programme_verdict_timeline_events"."plain_title"), '') is not null
	        and char_length(btrim("programme_verdict_timeline_events"."plain_title")) <= 240
	        and nullif(btrim("programme_verdict_timeline_events"."plain_description"), '') is not null
	        and char_length(btrim("programme_verdict_timeline_events"."plain_description")) <= 2000
	        and ("programme_verdict_timeline_events"."technical_description" is null or (
	          nullif(btrim("programme_verdict_timeline_events"."technical_description"), '') is not null
	          and char_length(btrim("programme_verdict_timeline_events"."technical_description")) <= 4000
	        )))
);
--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD COLUMN "presentation_schema_version" varchar(64);--> statement-breakpoint
ALTER TABLE "programme_verdict_mechanism_step_claims" ADD CONSTRAINT "programme_verdict_mechanism_step_claims_step_scope_fk" FOREIGN KEY ("verdict_revision_id","step_key","programme_id") REFERENCES "public"."programme_verdict_mechanism_steps"("verdict_revision_id","step_key","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_mechanism_step_claims" ADD CONSTRAINT "programme_verdict_mechanism_step_claims_claim_programme_fk" FOREIGN KEY ("claim_id","programme_id") REFERENCES "public"."claims"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_mechanism_steps" ADD CONSTRAINT "programme_verdict_mechanism_steps_verdict_programme_fk" FOREIGN KEY ("verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_timeline_event_claims" ADD CONSTRAINT "programme_verdict_timeline_event_claims_event_scope_fk" FOREIGN KEY ("verdict_revision_id","event_key","programme_id") REFERENCES "public"."programme_verdict_timeline_events"("verdict_revision_id","event_key","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_timeline_event_claims" ADD CONSTRAINT "programme_verdict_timeline_event_claims_claim_programme_fk" FOREIGN KEY ("claim_id","programme_id") REFERENCES "public"."claims"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_timeline_events" ADD CONSTRAINT "programme_verdict_timeline_events_verdict_programme_fk" FOREIGN KEY ("verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_timeline_events" ADD CONSTRAINT "programme_verdict_timeline_events_trial_programme_fk" FOREIGN KEY ("programme_trial_id","programme_id") REFERENCES "public"."programme_trials"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_timeline_events" ADD CONSTRAINT "programme_verdict_timeline_events_snapshot_source_fk" FOREIGN KEY ("source_snapshot_id","source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "programme_verdict_mechanism_step_claims_claim_idx" ON "programme_verdict_mechanism_step_claims" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_mechanism_step_claims_programme_idx" ON "programme_verdict_mechanism_step_claims" USING btree ("programme_id");--> statement-breakpoint
CREATE UNIQUE INDEX "programme_verdict_mechanism_steps_order_unique" ON "programme_verdict_mechanism_steps" USING btree ("verdict_revision_id","step_order");--> statement-breakpoint
CREATE INDEX "programme_verdict_mechanism_steps_programme_idx" ON "programme_verdict_mechanism_steps" USING btree ("programme_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_timeline_event_claims_claim_idx" ON "programme_verdict_timeline_event_claims" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_timeline_event_claims_programme_idx" ON "programme_verdict_timeline_event_claims" USING btree ("programme_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_timeline_events_programme_date_idx" ON "programme_verdict_timeline_events" USING btree ("programme_id","event_date");--> statement-breakpoint
CREATE INDEX "programme_verdict_timeline_events_source_idx" ON "programme_verdict_timeline_events" USING btree ("source_id");--> statement-breakpoint
ALTER TABLE "programme_dependencies" ADD CONSTRAINT "programme_dependencies_target_shape" CHECK ((
          "programme_dependencies"."dependent_surface_type" = 'EVIDENCE_NODE'
          and "programme_dependencies"."evidence_node_id" is not null
          and "programme_dependencies"."verdict_revision_id" is null
        ) or (
          "programme_dependencies"."dependent_surface_type" in ('VERDICT', 'PROGRAMME_SUMMARY', 'MECHANISM_MAP')
          and "programme_dependencies"."verdict_revision_id" is not null
          and "programme_dependencies"."evidence_node_id" is null
        ) or (
          "programme_dependencies"."dependent_surface_type" = 'TIMELINE'
          and "programme_dependencies"."evidence_node_id" is null
        ) or (
          "programme_dependencies"."dependent_surface_type" not in ('EVIDENCE_NODE', 'VERDICT', 'PROGRAMME_SUMMARY', 'MECHANISM_MAP', 'TIMELINE')
          and "programme_dependencies"."evidence_node_id" is null
          and "programme_dependencies"."verdict_revision_id" is null
        ));--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD CONSTRAINT "programme_verdicts_presentation_schema_version" CHECK ("programme_verdict_revisions"."presentation_schema_version" is null or "programme_verdict_revisions"."presentation_schema_version" = 'programme-presentation/v1');--> statement-breakpoint

-- Presentation claim links are part of the exact reviewed graph. Extending the one canonical
-- helper automatically subjects them to claim immutability, source snapshot/metadata checks,
-- freshness gates and current-publication validation installed by migrations 0008 and 0009.
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
	WHERE verdict_assessment."verdict_revision_id" = "target_verdict_id"
	UNION
	SELECT mechanism_claim."claim_id"
	FROM "programme_verdict_mechanism_step_claims" mechanism_claim
	WHERE mechanism_claim."verdict_revision_id" = "target_verdict_id"
	UNION
	SELECT timeline_claim."claim_id"
	FROM "programme_verdict_timeline_event_claims" timeline_claim
	WHERE timeline_claim."verdict_revision_id" = "target_verdict_id";
$$;--> statement-breakpoint

-- The shared verdict-bundle guard makes all four presentation tables editable only while their
-- parent is an unprepared DRAFT. The cascade escape remains limited to an authorized whole-
-- programme deletion, as implemented by the existing guard.
CREATE TRIGGER "programme_verdict_mechanism_steps_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_mechanism_steps"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_bundle_link"();--> statement-breakpoint
CREATE TRIGGER "programme_verdict_mechanism_step_claims_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_mechanism_step_claims"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_bundle_link"();--> statement-breakpoint
CREATE TRIGGER "programme_verdict_timeline_events_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_timeline_events"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_bundle_link"();--> statement-breakpoint
CREATE TRIGGER "programme_verdict_timeline_event_claims_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_timeline_event_claims"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_bundle_link"();--> statement-breakpoint

-- Validate only explicitly versioned presentation/v1 bundles. Existing NULL-version prepared,
-- reviewed and published proposals retain their byte-for-byte proposal/input contract.
CREATE OR REPLACE FUNCTION "rnawiki_assert_programme_presentation_v1"("target_verdict_id" varchar(64))
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
	verdict_row "programme_verdict_revisions"%ROWTYPE;
	mechanism_count integer;
	timeline_count integer;
BEGIN
	SELECT * INTO verdict_row
	FROM "programme_verdict_revisions"
	WHERE "id" = "target_verdict_id";

	IF NOT FOUND THEN
		RAISE EXCEPTION 'presentation validation requires an existing verdict revision'
			USING ERRCODE = '23503';
	END IF;
	SELECT count(*) INTO mechanism_count
	FROM "programme_verdict_mechanism_steps"
	WHERE "verdict_revision_id" = verdict_row."id"
		AND "programme_id" = verdict_row."programme_id";
	IF mechanism_count < 3 OR mechanism_count > 5 THEN
		RAISE EXCEPTION 'programme-presentation/v1 requires three to five mechanism stages'
			USING ERRCODE = '23514';
	END IF;
	SELECT count(*) INTO timeline_count
	FROM "programme_verdict_timeline_events"
	WHERE "verdict_revision_id" = verdict_row."id"
		AND "programme_id" = verdict_row."programme_id";
	IF timeline_count > 100 THEN
		RAISE EXCEPTION 'programme-presentation/v1 permits at most one hundred sourced timeline events'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_mechanism_step_claims" link
		WHERE link."verdict_revision_id" = verdict_row."id"
		GROUP BY link."step_key", link."claim_id"
		HAVING count(*) > 1
	) OR EXISTS (
		SELECT 1
		FROM "programme_verdict_timeline_event_claims" link
		WHERE link."verdict_revision_id" = verdict_row."id"
		GROUP BY link."event_key", link."claim_id"
		HAVING count(*) > 1
	) THEN
		RAISE EXCEPTION 'each presentation target may assign only one relationship to one claim'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM generate_series(1, mechanism_count) expected("step_order")
		LEFT JOIN "programme_verdict_mechanism_steps" step
			ON step."verdict_revision_id" = verdict_row."id"
			AND step."programme_id" = verdict_row."programme_id"
			AND step."step_order" = expected."step_order"
		WHERE step."step_key" IS NULL
	) THEN
		RAISE EXCEPTION 'mechanism stage order must be contiguous from one'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_mechanism_steps" step
		WHERE step."verdict_revision_id" = verdict_row."id"
			AND NOT EXISTS (
				SELECT 1
				FROM "programme_verdict_mechanism_step_claims" link
				WHERE link."verdict_revision_id" = step."verdict_revision_id"
					AND link."step_key" = step."step_key"
					AND link."relationship" IN ('SUPPORTS', 'QUALIFIES')
			)
	) THEN
		RAISE EXCEPTION 'each mechanism stage requires a SUPPORTS or QUALIFIES claim; contradiction alone is not evidence for displayed mechanism text'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_mechanism_step_claims" link
		WHERE link."verdict_revision_id" = verdict_row."id"
			AND NOT EXISTS (
			SELECT 1 FROM "claim_source_links" citation
				WHERE citation."claim_id" = link."claim_id"
					AND citation."relationship" = 'SUPPORTS'
			)
	) THEN
		RAISE EXCEPTION 'every mechanism claim requires an exact immutable source citation that supports the claim'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_mechanism_step_claims" link
		WHERE link."verdict_revision_id" = verdict_row."id"
			AND NOT EXISTS (
				SELECT 1
				FROM "programme_dependencies" dependency
				WHERE dependency."programme_id" = verdict_row."programme_id"
					AND dependency."verdict_revision_id" = verdict_row."id"
					AND dependency."claim_id" = link."claim_id"
					AND dependency."dependent_surface_type" = 'MECHANISM_MAP'
					AND dependency."field_path" = ('mechanism.' || link."step_key" || '.plainDescription')
					AND dependency."impact_level" <> 'LOW_RISK_EXACT_DATA'
			)
	) THEN
		RAISE EXCEPTION 'every mechanism relationship requires an exact verdict-scoped claim dependency'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_mechanism_steps" step
		WHERE step."verdict_revision_id" = verdict_row."id"
			AND step."evidence_basis" = 'MEASURED_IN_PEOPLE'
			AND NOT EXISTS (
				SELECT 1
				FROM "programme_verdict_mechanism_step_claims" link
				INNER JOIN "claims" claim ON claim."id" = link."claim_id"
				INNER JOIN "programme_trials" trial
					ON trial."id" = claim."programme_trial_id"
					AND trial."programme_id" = verdict_row."programme_id"
				INNER JOIN "programme_verdict_trials" verdict_trial
					ON verdict_trial."verdict_revision_id" = verdict_row."id"
					AND verdict_trial."programme_trial_id" = trial."id"
				WHERE link."verdict_revision_id" = step."verdict_revision_id"
					AND link."step_key" = step."step_key"
					AND link."relationship" IN ('SUPPORTS', 'QUALIFIES')
					AND trial."human_study_status" = 'YES'
					AND claim."nature" IN ('MEASURED', 'REGULATORY_FINDING')
			)
	) THEN
		RAISE EXCEPTION 'MEASURED_IN_PEOPLE requires a measured claim from an exact scoped human trial'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_mechanism_steps" step
		WHERE step."verdict_revision_id" = verdict_row."id"
			AND step."evidence_basis" = 'MEASURED_OUTSIDE_PEOPLE'
			AND NOT EXISTS (
				SELECT 1
				FROM "programme_verdict_mechanism_step_claims" link
				INNER JOIN "claims" claim ON claim."id" = link."claim_id"
				INNER JOIN "programme_trials" trial
					ON trial."id" = claim."programme_trial_id"
					AND trial."programme_id" = verdict_row."programme_id"
				INNER JOIN "programme_verdict_trials" verdict_trial
					ON verdict_trial."verdict_revision_id" = verdict_row."id"
					AND verdict_trial."programme_trial_id" = trial."id"
				WHERE link."verdict_revision_id" = step."verdict_revision_id"
					AND link."step_key" = step."step_key"
					AND link."relationship" IN ('SUPPORTS', 'QUALIFIES')
					AND trial."human_study_status" = 'NO'
					AND claim."nature" = 'MEASURED'
			)
	) THEN
		RAISE EXCEPTION 'MEASURED_OUTSIDE_PEOPLE requires a measured claim from an exact scoped non-human or laboratory trial'
			USING ERRCODE = '23514';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_timeline_events" event
		WHERE event."verdict_revision_id" = verdict_row."id"
			AND event."programme_trial_id" IS NOT NULL
			AND NOT EXISTS (
				SELECT 1 FROM "programme_verdict_trials" verdict_trial
				WHERE verdict_trial."verdict_revision_id" = verdict_row."id"
					AND verdict_trial."programme_trial_id" = event."programme_trial_id"
			)
	) THEN
		RAISE EXCEPTION 'timeline trial references must be inside the exact reviewed trial scope'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_timeline_events" event
		WHERE event."verdict_revision_id" = verdict_row."id"
			AND NOT EXISTS (
				SELECT 1
				FROM "programme_verdict_timeline_event_claims" link
				INNER JOIN "claim_source_links" citation
					ON citation."claim_id" = link."claim_id"
					AND citation."source_snapshot_id" = event."source_snapshot_id"
					AND citation."relationship" = 'SUPPORTS'
				WHERE link."verdict_revision_id" = event."verdict_revision_id"
					AND link."event_key" = event."event_key"
					AND link."relationship" = 'SUPPORTS'
			)
	) THEN
		RAISE EXCEPTION 'each timeline event requires a SUPPORTS claim citing the exact event source snapshot'
			USING ERRCODE = '23514';
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_timeline_event_claims" link
		WHERE link."verdict_revision_id" = verdict_row."id"
			AND NOT EXISTS (
				SELECT 1
				FROM "programme_dependencies" dependency
				WHERE dependency."programme_id" = verdict_row."programme_id"
					AND dependency."verdict_revision_id" = verdict_row."id"
					AND dependency."claim_id" = link."claim_id"
					AND dependency."dependent_surface_type" = 'TIMELINE'
					AND dependency."field_path" = ('timeline.' || link."event_key" || '.plainDescription')
					AND dependency."impact_level" <> 'LOW_RISK_EXACT_DATA'
			)
	) THEN
		RAISE EXCEPTION 'every timeline relationship requires an exact verdict-scoped claim dependency'
			USING ERRCODE = '23514';
	END IF;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "rnawiki_validate_programme_presentation_state_entry"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	IF NEW."presentation_schema_version" = 'programme-presentation/v1'
		AND (
			NEW."proposal_prepared_at" IS NOT NULL
			OR NEW."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
		) THEN
		PERFORM "rnawiki_assert_programme_presentation_v1"(NEW."id");
	END IF;
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "programme_verdict_revisions_presentation_validate"
BEFORE INSERT OR UPDATE ON "programme_verdict_revisions"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_validate_programme_presentation_state_entry"();--> statement-breakpoint

CREATE OR REPLACE FUNCTION "rnawiki_validate_current_programme_presentation"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	presentation_version varchar(64);
BEGIN
	SELECT verdict."presentation_schema_version" INTO presentation_version
	FROM "programme_verdict_revisions" verdict
	WHERE verdict."id" = NEW."verdict_revision_id"
		AND verdict."programme_id" = NEW."programme_id";
	IF presentation_version = 'programme-presentation/v1' THEN
		PERFORM "rnawiki_assert_programme_presentation_v1"(NEW."verdict_revision_id");
	END IF;
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "programme_current_publications_presentation_validate"
BEFORE INSERT OR UPDATE ON "programme_current_publications"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_validate_current_programme_presentation"();
--> statement-breakpoint

-- Extends the canonical publication boundary for scientifically safe source refreshes. A newly
-- accepted statement or parser-exact trial must cite the current snapshot. An unchanged statement,
-- trial, or sourced timeline binding may retain only that snapshot's immediate predecessor, and
-- only when the exact same binding is present in the previous immutable public verdict.
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
	previous_public_revision_id varchar;
BEGIN
	IF TG_OP = 'UPDATE' THEN
		previous_public_revision_id := OLD."verdict_revision_id";
	END IF;
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
		WITH reviewed_bindings AS (
			SELECT
				'CLAIM'::text AS binding_kind,
				snapshot."source_id",
				link."source_snapshot_id" AS snapshot_id,
				link."claim_id",
				link."relationship"::text AS relationship,
				link."source_locator",
				NULL::varchar AS programme_trial_id,
				NULL::varchar AS event_key
			FROM "rnawiki_reviewed_verdict_claim_ids"(NEW."verdict_revision_id") reviewed_claim
			INNER JOIN "claim_source_links" link ON link."claim_id" = reviewed_claim."claim_id"
			INNER JOIN "source_snapshots" snapshot ON snapshot."id" = link."source_snapshot_id"
			UNION ALL
			SELECT
				'TRIAL'::text,
				trial."registry_source_id",
				trial."registry_snapshot_id",
				NULL::varchar,
				NULL::text,
				NULL::text,
				trial."programme_trial_id",
				NULL::varchar
			FROM "programme_verdict_trial_snapshots" trial
			WHERE trial."verdict_revision_id" = NEW."verdict_revision_id"
				AND trial."registry_source_id" IS NOT NULL
				AND trial."registry_snapshot_id" IS NOT NULL
			UNION ALL
			SELECT
				'TIMELINE'::text,
				event."source_id",
				event."source_snapshot_id",
				NULL::varchar,
				NULL::text,
				NULL::text,
				NULL::varchar,
				event."event_key"
			FROM "programme_verdict_timeline_events" event
			WHERE event."verdict_revision_id" = NEW."verdict_revision_id"
		),
		reviewed_sources AS (
			SELECT DISTINCT binding."source_id"
			FROM reviewed_bindings binding
		)
		SELECT 1
		FROM reviewed_sources reviewed
		LEFT JOIN "programme_freshness_states" freshness
			ON freshness."programme_id" = NEW."programme_id"
			AND freshness."source_id" = reviewed."source_id"
		LEFT JOIN "source_snapshots" current_snapshot
			ON current_snapshot."id" = freshness."current_snapshot_id"
		WHERE freshness."current_snapshot_id" IS NULL
			OR freshness."pending_snapshot_id" IS NOT NULL
			OR current_snapshot."source_id" IS DISTINCT FROM reviewed."source_id"
			OR NOT EXISTS (
				SELECT 1
				FROM reviewed_bindings current_binding
				WHERE current_binding."source_id" = reviewed."source_id"
					AND current_binding.snapshot_id = freshness."current_snapshot_id"
					AND current_binding.binding_kind IN ('CLAIM', 'TRIAL')
			)
			OR EXISTS (
				SELECT 1
				FROM reviewed_bindings historical
				WHERE historical."source_id" = reviewed."source_id"
					AND historical.snapshot_id IS DISTINCT FROM freshness."current_snapshot_id"
					AND (
						previous_public_revision_id IS NULL
						OR current_snapshot."previous_snapshot_id" IS NULL
						OR historical.snapshot_id IS DISTINCT FROM current_snapshot."previous_snapshot_id"
						OR CASE historical.binding_kind
							WHEN 'CLAIM' THEN NOT EXISTS (
								SELECT 1
								FROM "rnawiki_reviewed_verdict_claim_ids"(previous_public_revision_id) old_reviewed_claim
								INNER JOIN "claim_source_links" old_link
									ON old_link."claim_id" = old_reviewed_claim."claim_id"
								WHERE old_link."claim_id" = historical."claim_id"
									AND old_link."source_snapshot_id" = historical.snapshot_id
									AND old_link."relationship"::text = historical.relationship
									AND old_link."source_locator" IS NOT DISTINCT FROM historical.source_locator
							)
							WHEN 'TRIAL' THEN NOT EXISTS (
								SELECT 1
								FROM "programme_verdict_trial_snapshots" old_trial
								WHERE old_trial."verdict_revision_id" = previous_public_revision_id
									AND old_trial."programme_id" = NEW."programme_id"
									AND old_trial."programme_trial_id" = historical.programme_trial_id
									AND old_trial."registry_source_id" = historical."source_id"
									AND old_trial."registry_snapshot_id" = historical.snapshot_id
							)
							WHEN 'TIMELINE' THEN NOT EXISTS (
								SELECT 1
								FROM "programme_verdict_timeline_events" old_event
								WHERE old_event."verdict_revision_id" = previous_public_revision_id
									AND old_event."programme_id" = NEW."programme_id"
									AND old_event."event_key" = historical.event_key
									AND old_event."source_id" = historical."source_id"
									AND old_event."source_snapshot_id" = historical.snapshot_id
							)
							ELSE true
						END
					)
			)
	) THEN
		RAISE EXCEPTION 'published sources require a directly cited current snapshot; only an unchanged binding to its exact immediate predecessor may carry forward from the previous publication'
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
