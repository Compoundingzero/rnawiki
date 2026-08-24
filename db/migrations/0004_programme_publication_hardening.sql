CREATE TYPE "public"."trial_results_status" AS ENUM('AVAILABLE', 'UNAVAILABLE', 'NOT_POSTED', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."verdict_reviewer_expertise" AS ENUM('CLINICAL_PHARMACOLOGY', 'THERAPEUTIC_AREA_MEDICINE', 'BIOSTATISTICS', 'TOXICOLOGY', 'PHARMACOKINETICS', 'REGULATORY_SCIENCE', 'CLINICAL_DEVELOPMENT');--> statement-breakpoint
ALTER TYPE "public"."verdict_claim_relationship" ADD VALUE 'CANDIDATE_LIMITATION';--> statement-breakpoint
-- Reviews written before this hardening migration did not carry an immutable reviewer principal,
-- proposal digest, engine version, or input digest. They cannot be upgraded into cryptographic
-- approvals without inventing provenance. Preserve them in an explicitly non-counting audit table
-- before the active table becomes strict.
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
	CONSTRAINT "programme_verdict_reviews_legacy_reason" CHECK ("archive_reason" = 'UNBOUND_PRE_0004_REVIEW')
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "programme_verdict_reviews_legacy_revision_idx" ON "programme_verdict_reviews_legacy_0003" USING btree ("verdict_revision_id");--> statement-breakpoint
INSERT INTO "programme_verdict_reviews_legacy_0003" (
	"id", "verdict_revision_id", "reviewer_user_id", "reviewer_name", "decision",
	"is_independent", "conflicts_of_interest", "review_note", "reviewed_at"
)
SELECT
	"id", "verdict_revision_id", "reviewer_user_id", "reviewer_name", "decision",
	"is_independent", "conflicts_of_interest", "review_note", "reviewed_at"
FROM "programme_verdict_reviews"
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
DELETE FROM "programme_verdict_reviews";--> statement-breakpoint
CREATE TABLE "programme_verdict_evidence_nodes" (
	"programme_id" varchar(64) NOT NULL,
	"verdict_revision_id" varchar(64) NOT NULL,
	"evidence_node_id" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_evidence_nodes_pk" PRIMARY KEY("verdict_revision_id","evidence_node_id")
);
--> statement-breakpoint
CREATE TABLE "programme_verdict_interpretability_assessments" (
	"programme_id" varchar(64) NOT NULL,
	"verdict_revision_id" varchar(64) NOT NULL,
	"assessment_id" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_interpretability_pk" PRIMARY KEY("verdict_revision_id","assessment_id")
);
--> statement-breakpoint
CREATE TABLE "programme_verdict_trials" (
	"programme_id" varchar(64) NOT NULL,
	"verdict_revision_id" varchar(64) NOT NULL,
	"programme_trial_id" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programme_verdict_trials_pk" PRIMARY KEY("verdict_revision_id","programme_trial_id")
);
--> statement-breakpoint
ALTER TABLE "programme_dependencies" DROP CONSTRAINT "programme_dependencies_target_shape";--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" DROP CONSTRAINT "programme_verdict_reviews_reviewer_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "programme_verdict_claims" DROP CONSTRAINT "programme_verdict_claims_claim_programme_fk";--> statement-breakpoint
ALTER TABLE "programme_verdict_claims" ADD CONSTRAINT "programme_verdict_claims_claim_programme_fk" FOREIGN KEY ("claim_id","programme_id") REFERENCES "public"."claims"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ALTER COLUMN "reviewer_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "numeric_unit_required" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "result_date" date;--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "participant_outcome" boolean;--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "comparator_value" text;--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "comparator_group" text;--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "presented_as_patient_benefit" boolean;--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "exploratory_nature_disclosed" boolean;--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "stopping_reason" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "claims" ADD COLUMN "conflicts_with_claim_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "evidence_nodes" ADD COLUMN "visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "evidence_nodes" ADD COLUMN "presented_as_positive" boolean;--> statement-breakpoint
ALTER TABLE "evidence_nodes" ADD COLUMN "presented_as_negative" boolean;--> statement-breakpoint
ALTER TABLE "programme_trials" ADD COLUMN "results_status" "trial_results_status" DEFAULT 'UNKNOWN' NOT NULL;--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD COLUMN "reviewer_orcid_snapshot" varchar(32);--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD COLUMN "expertise_tags" "verdict_reviewer_expertise"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD COLUMN "conflicts_of_interest_attested" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD COLUMN "proposal_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL;--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD COLUMN "proposal_digest" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD COLUMN "engine_version" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD COLUMN "input_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL;--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD COLUMN "input_digest" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD COLUMN "proposal_as_of_date" date;--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD COLUMN "source_dependent" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD COLUMN "adjudication_rationale" text;--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD COLUMN "adjudicator_user_id" varchar(64);--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD COLUMN "proposal_digest_algorithm" varchar(16) DEFAULT 'sha256' NOT NULL;--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD COLUMN "proposal_digest" varchar(64);--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD COLUMN "proposal_prepared_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "programme_verdict_evidence_nodes" ADD CONSTRAINT "programme_verdict_evidence_nodes_verdict_programme_fk" FOREIGN KEY ("verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_evidence_nodes" ADD CONSTRAINT "programme_verdict_evidence_nodes_node_programme_fk" FOREIGN KEY ("evidence_node_id","programme_id") REFERENCES "public"."evidence_nodes"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_interpretability_assessments" ADD CONSTRAINT "programme_verdict_interpretability_verdict_programme_fk" FOREIGN KEY ("verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_interpretability_assessments" ADD CONSTRAINT "programme_verdict_interpretability_assessment_programme_fk" FOREIGN KEY ("assessment_id","programme_id") REFERENCES "public"."trial_interpretability_assessments"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_trials" ADD CONSTRAINT "programme_verdict_trials_verdict_programme_fk" FOREIGN KEY ("verdict_revision_id","programme_id") REFERENCES "public"."programme_verdict_revisions"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_trials" ADD CONSTRAINT "programme_verdict_trials_trial_programme_fk" FOREIGN KEY ("programme_trial_id","programme_id") REFERENCES "public"."programme_trials"("id","programme_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "programme_verdict_evidence_nodes_node_idx" ON "programme_verdict_evidence_nodes" USING btree ("evidence_node_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_evidence_nodes_programme_idx" ON "programme_verdict_evidence_nodes" USING btree ("programme_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_interpretability_assessment_idx" ON "programme_verdict_interpretability_assessments" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_interpretability_programme_idx" ON "programme_verdict_interpretability_assessments" USING btree ("programme_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_trials_trial_idx" ON "programme_verdict_trials" USING btree ("programme_trial_id");--> statement-breakpoint
CREATE INDEX "programme_verdict_trials_programme_idx" ON "programme_verdict_trials" USING btree ("programme_id");--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD CONSTRAINT "programme_verdict_reviews_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD CONSTRAINT "programme_verdict_revisions_adjudicator_user_id_users_id_fk" FOREIGN KEY ("adjudicator_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programme_dependencies" ADD CONSTRAINT "programme_dependencies_target_shape" CHECK ((
          "programme_dependencies"."dependent_surface_type" = 'EVIDENCE_NODE'
          and "programme_dependencies"."evidence_node_id" is not null
          and "programme_dependencies"."verdict_revision_id" is null
        ) or (
          "programme_dependencies"."dependent_surface_type" in ('VERDICT', 'PROGRAMME_SUMMARY')
          and "programme_dependencies"."verdict_revision_id" is not null
          and "programme_dependencies"."evidence_node_id" is null
        ) or (
          "programme_dependencies"."dependent_surface_type" not in ('EVIDENCE_NODE', 'VERDICT', 'PROGRAMME_SUMMARY')
          and "programme_dependencies"."evidence_node_id" is null
          and "programme_dependencies"."verdict_revision_id" is null
        ));--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD CONSTRAINT "programme_verdict_reviews_digest_algorithms" CHECK ("programme_verdict_reviews"."proposal_digest_algorithm" = 'sha256' and "programme_verdict_reviews"."input_digest_algorithm" = 'sha256');--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD CONSTRAINT "programme_verdict_reviews_digest_formats" CHECK ("programme_verdict_reviews"."proposal_digest" ~ '^[0-9a-f]{64}$' and "programme_verdict_reviews"."input_digest" ~ '^[0-9a-f]{64}$');--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD CONSTRAINT "programme_verdict_reviews_expertise_nonempty" CHECK (cardinality("programme_verdict_reviews"."expertise_tags") > 0);--> statement-breakpoint
ALTER TABLE "programme_verdict_reviews" ADD CONSTRAINT "programme_verdict_reviews_orcid_format" CHECK ("programme_verdict_reviews"."reviewer_orcid_snapshot" is null or "programme_verdict_reviews"."reviewer_orcid_snapshot" ~ '^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$');--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD CONSTRAINT "programme_verdicts_proposal_digest_algorithm" CHECK ("programme_verdict_revisions"."proposal_digest_algorithm" = 'sha256');--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD CONSTRAINT "programme_verdicts_proposal_digest_format" CHECK ("programme_verdict_revisions"."proposal_digest" is null or "programme_verdict_revisions"."proposal_digest" ~ '^[0-9a-f]{64}$');--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD CONSTRAINT "programme_verdicts_adjudication_complete" CHECK (("programme_verdict_revisions"."adjudication_rationale" is null and "programme_verdict_revisions"."adjudicator_user_id" is null)
        or (nullif(btrim("programme_verdict_revisions"."adjudication_rationale"), '') is not null and "programme_verdict_revisions"."adjudicator_user_id" is not null));--> statement-breakpoint
ALTER TABLE "programme_verdict_revisions" ADD CONSTRAINT "programme_verdicts_published_proposal_provenance" CHECK ("programme_verdict_revisions"."review_status" <> 'PUBLISHED' or (
        "programme_verdict_revisions"."proposal_as_of_date" is not null
        and "programme_verdict_revisions"."proposal_prepared_at" is not null
        and "programme_verdict_revisions"."proposal_digest" ~ '^[0-9a-f]{64}$'
      ));--> statement-breakpoint
CREATE OR REPLACE FUNCTION "rnawiki_validate_current_programme_publication"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	verdict_row "programme_verdict_revisions"%ROWTYPE;
	current_programme_status "programme_status";
	required_path text;
BEGIN
	SELECT * INTO verdict_row
	FROM "programme_verdict_revisions"
	WHERE "id" = NEW."verdict_revision_id" AND "programme_id" = NEW."programme_id";

	IF NOT FOUND THEN
		RAISE EXCEPTION 'current publication must reference a verdict revision from the same programme'
			USING ERRCODE = '23503';
	END IF;

	SELECT "status" INTO current_programme_status
	FROM "development_programmes"
	WHERE "id" = NEW."programme_id";

	IF verdict_row."review_status" <> 'PUBLISHED' THEN
		RAISE EXCEPTION 'current publication must reference a PUBLISHED verdict revision'
			USING ERRCODE = '23514';
	END IF;
	IF verdict_row."published_at" IS DISTINCT FROM NEW."published_at" THEN
		RAISE EXCEPTION 'current publication timestamp must match the verdict revision timestamp'
			USING ERRCODE = '23514';
	END IF;
	IF verdict_row."programme_status_at_review" IS DISTINCT FROM current_programme_status THEN
		RAISE EXCEPTION 'published verdict programme status must match the current programme status'
			USING ERRCODE = '23514';
	END IF;
	IF current_programme_status IN ('STOPPED', 'WITHDRAWN') AND verdict_row."verdict_code" IS NULL THEN
		RAISE EXCEPTION 'a stopped or withdrawn programme requires an explicit verdict classification'
			USING ERRCODE = '23514';
	END IF;
	IF current_programme_status NOT IN ('STOPPED', 'WITHDRAWN') AND verdict_row."verdict_code" IS NOT NULL THEN
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
			FROM "programme_verdict_claims" verdict_claim
			INNER JOIN "claim_source_links" link ON link."claim_id" = verdict_claim."claim_id"
			INNER JOIN "source_snapshots" snapshot ON snapshot."id" = link."source_snapshot_id"
			WHERE verdict_claim."verdict_revision_id" = NEW."verdict_revision_id"
			UNION
			SELECT trial."registry_source_id", trial."registry_snapshot_id"
			FROM "programme_verdict_trials" verdict_trial
			INNER JOIN "programme_trials" trial ON trial."id" = verdict_trial."programme_trial_id"
			WHERE verdict_trial."verdict_revision_id" = NEW."verdict_revision_id"
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
					INNER JOIN "programme_verdict_claims" verdict_claim
						ON verdict_claim."claim_id" = affected."claim_id"
					WHERE verdict_claim."verdict_revision_id" = NEW."verdict_revision_id"
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
					FROM "programme_verdict_claims" verdict_claim
					INNER JOIN "claim_source_links" link ON link."claim_id" = verdict_claim."claim_id"
					INNER JOIN "source_snapshots" snapshot ON snapshot."id" = link."source_snapshot_id"
					WHERE verdict_claim."verdict_revision_id" = NEW."verdict_revision_id"
						AND snapshot."source_id" = task."source_id"
				)
			)
	) THEN
		RAISE EXCEPTION 'high-impact evidence review tasks must be resolved before publication'
			USING ERRCODE = '23514';
	END IF;

	RETURN NEW;
END;
$$;--> statement-breakpoint
DROP TRIGGER IF EXISTS "programme_verdict_reviews_append_only" ON "programme_verdict_reviews";--> statement-breakpoint
CREATE OR REPLACE FUNCTION "rnawiki_guard_verdict_review_append"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	verdict_row "programme_verdict_revisions"%ROWTYPE;
BEGIN
	IF TG_OP IN ('UPDATE', 'DELETE') THEN
		SELECT * INTO verdict_row
		FROM "programme_verdict_revisions"
		WHERE "id" = OLD."verdict_revision_id";

		-- A deliberate programme/drug deletion cascades the complete lineage.
		IF TG_OP = 'DELETE' AND (
			NOT FOUND OR NOT EXISTS (
				SELECT 1 FROM "development_programmes" WHERE "id" = verdict_row."programme_id"
			)
		) THEN
			RETURN OLD;
		END IF;

		RAISE EXCEPTION 'programme verdict reviews are append-only; record a later signed decision instead'
			USING ERRCODE = '55000';
	END IF;

	SELECT * INTO verdict_row
	FROM "programme_verdict_revisions"
	WHERE "id" = NEW."verdict_revision_id"
	FOR SHARE;

	IF NOT FOUND OR verdict_row."review_status" NOT IN ('AWAITING_REVIEW', 'APPROVED') THEN
		RAISE EXCEPTION 'reviews may be added only to a prepared unpublished verdict proposal'
			USING ERRCODE = '23514';
	END IF;
	IF NEW."reviewer_user_id" IS NULL OR NEW."reviewer_user_id" = verdict_row."author_user_id" THEN
		RAISE EXCEPTION 'a review requires an authenticated principal distinct from the author'
			USING ERRCODE = '23514';
	END IF;
	IF NEW."proposal_digest_algorithm" <> 'sha256'
		OR NEW."proposal_digest" IS DISTINCT FROM verdict_row."proposal_digest"
		OR NEW."engine_version" IS DISTINCT FROM verdict_row."engine_version"
		OR NEW."input_digest_algorithm" <> 'sha256'
		OR NEW."input_digest" IS DISTINCT FROM verdict_row."input_digest" THEN
		RAISE EXCEPTION 'review signature does not match the prepared proposal and engine input'
			USING ERRCODE = '23514';
	END IF;
	IF cardinality(NEW."expertise_tags") = 0 THEN
		RAISE EXCEPTION 'programme verdict reviews require at least one persisted expertise tag'
			USING ERRCODE = '23514';
	END IF;

	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "programme_verdict_reviews_append_only"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_reviews"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_review_append"();--> statement-breakpoint
CREATE OR REPLACE FUNCTION "rnawiki_guard_verdict_revision_immutability"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	IF TG_OP = 'DELETE' THEN
		IF NOT EXISTS (
			SELECT 1 FROM "development_programmes" WHERE "id" = OLD."programme_id"
		) THEN
			RETURN OLD;
		END IF;
		IF OLD."proposal_prepared_at" IS NOT NULL
			OR OLD."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED') THEN
			RAISE EXCEPTION 'prepared, published and superseded verdict revisions are append-only'
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

	IF OLD."review_status" = 'SUPERSEDED' THEN
		RAISE EXCEPTION 'SUPERSEDED verdict revisions are immutable'
			USING ERRCODE = '55000';
	END IF;

	IF OLD."proposal_prepared_at" IS NOT NULL
		OR OLD."review_status" IN ('AWAITING_REVIEW', 'APPROVED') THEN
		IF NEW."review_status" NOT IN ('APPROVED', 'PUBLISHED')
			OR (to_jsonb(NEW) - ARRAY['review_status', 'reviewed_at', 'published_at', 'superseded_at']::text[])
				IS DISTINCT FROM
				(to_jsonb(OLD) - ARRAY['review_status', 'reviewed_at', 'published_at', 'superseded_at']::text[]) THEN
			RAISE EXCEPTION 'a prepared verdict proposal is frozen; create a new revision for content changes'
				USING ERRCODE = '55000';
		END IF;
	END IF;

	RETURN NEW;
END;
$$;--> statement-breakpoint
DROP TRIGGER IF EXISTS "programme_verdict_revisions_immutable" ON "programme_verdict_revisions";--> statement-breakpoint
CREATE TRIGGER "programme_verdict_revisions_immutable"
BEFORE UPDATE OR DELETE ON "programme_verdict_revisions"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_revision_immutability"();--> statement-breakpoint
CREATE OR REPLACE FUNCTION "rnawiki_guard_verdict_bundle_link"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	payload jsonb;
	verdict_id varchar(64);
	programme_id varchar(64);
	verdict_status "evidence_review_status";
BEGIN
	payload := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
	verdict_id := payload->>'verdict_revision_id';
	programme_id := payload->>'programme_id';

	IF TG_OP = 'DELETE' AND NOT EXISTS (
		SELECT 1 FROM "development_programmes" WHERE "id" = programme_id
	) THEN
		RETURN OLD;
	END IF;

	IF verdict_id IS NULL AND TG_TABLE_NAME = 'programme_dependencies' THEN
		SELECT link."verdict_revision_id" INTO verdict_id
		FROM "programme_verdict_evidence_nodes" link
		INNER JOIN "programme_verdict_revisions" verdict
			ON verdict."id" = link."verdict_revision_id"
		WHERE link."evidence_node_id" = payload->>'evidence_node_id'
			AND verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
		LIMIT 1;
	END IF;

	IF verdict_id IS NULL THEN
		IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
		RETURN NEW;
	END IF;

	SELECT "review_status" INTO verdict_status
	FROM "programme_verdict_revisions"
	WHERE "id" = verdict_id;
	IF verdict_status IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED') THEN
		RAISE EXCEPTION 'prepared verdict proposal links and dependencies are immutable'
			USING ERRCODE = '55000';
	END IF;

	IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "programme_verdict_claims_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_claims"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_bundle_link"();--> statement-breakpoint
CREATE TRIGGER "programme_verdict_trials_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_trials"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_bundle_link"();--> statement-breakpoint
CREATE TRIGGER "programme_verdict_evidence_nodes_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_evidence_nodes"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_bundle_link"();--> statement-breakpoint
CREATE TRIGGER "programme_verdict_interpretability_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_verdict_interpretability_assessments"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_bundle_link"();--> statement-breakpoint
CREATE TRIGGER "programme_verdict_dependencies_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "programme_dependencies"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_verdict_bundle_link"();--> statement-breakpoint
CREATE OR REPLACE FUNCTION "rnawiki_guard_published_evidence_revision"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	payload jsonb;
	programme_id varchar(64);
	old_status text;
BEGIN
	payload := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
	programme_id := payload->>'programme_id';
	old_status := to_jsonb(OLD)->>'review_status';

	IF TG_OP = 'DELETE' AND NOT EXISTS (
		SELECT 1 FROM "development_programmes" WHERE "id" = programme_id
	) THEN
		RETURN OLD;
	END IF;
	IF TG_OP = 'DELETE' AND old_status IN ('PUBLISHED', 'SUPERSEDED') THEN
		RAISE EXCEPTION 'published evidence revisions are append-only'
			USING ERRCODE = '55000';
	END IF;
	IF TG_OP = 'UPDATE' AND old_status = 'PUBLISHED' THEN
		IF to_jsonb(NEW)->>'review_status' <> 'SUPERSEDED'
			OR (to_jsonb(NEW) - ARRAY['review_status', 'superseded_at']::text[])
				IS DISTINCT FROM
				(to_jsonb(OLD) - ARRAY['review_status', 'superseded_at']::text[]) THEN
			RAISE EXCEPTION 'a published evidence revision may only transition intact to SUPERSEDED'
				USING ERRCODE = '55000';
		END IF;
	END IF;
	IF TG_OP = 'UPDATE' AND old_status = 'SUPERSEDED' THEN
		RAISE EXCEPTION 'superseded evidence revisions are immutable'
			USING ERRCODE = '55000';
	END IF;

	IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "claims_published_revision_immutable"
BEFORE UPDATE OR DELETE ON "claims"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_published_evidence_revision"();--> statement-breakpoint
CREATE TRIGGER "evidence_nodes_published_revision_immutable"
BEFORE UPDATE OR DELETE ON "evidence_nodes"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_published_evidence_revision"();--> statement-breakpoint
CREATE TRIGGER "trial_interpretability_published_revision_immutable"
BEFORE UPDATE OR DELETE ON "trial_interpretability_assessments"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_published_evidence_revision"();--> statement-breakpoint
CREATE OR REPLACE FUNCTION "rnawiki_guard_scoped_trial_mutation"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	IF TG_OP = 'DELETE' AND NOT EXISTS (
		SELECT 1 FROM "development_programmes" WHERE "id" = OLD."programme_id"
	) THEN
		RETURN OLD;
	END IF;
	IF EXISTS (
		SELECT 1
		FROM "programme_verdict_trials" link
		INNER JOIN "programme_verdict_revisions" verdict ON verdict."id" = link."verdict_revision_id"
		WHERE link."programme_trial_id" = OLD."id"
			AND verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
	) THEN
		RAISE EXCEPTION 'a trial scoped by a prepared verdict proposal is immutable'
			USING ERRCODE = '55000';
	END IF;
	IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "programme_trials_scoped_immutable"
BEFORE UPDATE OR DELETE ON "programme_trials"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_scoped_trial_mutation"();--> statement-breakpoint
CREATE OR REPLACE FUNCTION "rnawiki_guard_reviewed_graph_link"() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	payload jsonb;
	programme_id varchar(64);
	is_frozen boolean;
BEGIN
	payload := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
	programme_id := payload->>'programme_id';
	IF TG_OP = 'DELETE' AND NOT EXISTS (
		SELECT 1 FROM "development_programmes" WHERE "id" = programme_id
	) THEN
		RETURN OLD;
	END IF;

	IF TG_TABLE_NAME = 'claim_source_links' THEN
		SELECT EXISTS (
			SELECT 1
			FROM "programme_verdict_claims" link
			INNER JOIN "programme_verdict_revisions" verdict ON verdict."id" = link."verdict_revision_id"
			WHERE link."claim_id" = payload->>'claim_id'
				AND verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
		) INTO is_frozen;
	ELSIF TG_TABLE_NAME = 'evidence_node_claims' THEN
		SELECT EXISTS (
			SELECT 1
			FROM "programme_verdict_evidence_nodes" link
			INNER JOIN "programme_verdict_revisions" verdict ON verdict."id" = link."verdict_revision_id"
			WHERE link."evidence_node_id" = payload->>'evidence_node_id'
				AND verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
		) INTO is_frozen;
	ELSE
		SELECT EXISTS (
			SELECT 1
			FROM "programme_verdict_interpretability_assessments" link
			INNER JOIN "programme_verdict_revisions" verdict ON verdict."id" = link."verdict_revision_id"
			WHERE link."assessment_id" = payload->>'assessment_id'
				AND verdict."review_status" IN ('AWAITING_REVIEW', 'APPROVED', 'PUBLISHED', 'SUPERSEDED')
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
CREATE TRIGGER "claim_source_links_reviewed_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "claim_source_links"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_reviewed_graph_link"();--> statement-breakpoint
CREATE TRIGGER "evidence_node_claims_reviewed_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "evidence_node_claims"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_reviewed_graph_link"();--> statement-breakpoint
CREATE TRIGGER "trial_interpretability_claims_reviewed_immutable"
BEFORE INSERT OR UPDATE OR DELETE ON "trial_interpretability_claims"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_guard_reviewed_graph_link"();
