CREATE TYPE "public"."legacy_identity_correction_field" AS ENUM('name', 'tradeName');--> statement-breakpoint
CREATE TABLE "legacy_identity_correction_details" (
	"revision_id" varchar(64) PRIMARY KEY NOT NULL,
	"field" "legacy_identity_correction_field" NOT NULL,
	"previous_value" text,
	"proposed_value" text,
	"source_url" text NOT NULL,
	"source_title" varchar(300) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legacy_identity_correction_previous_value_valid" CHECK ("legacy_identity_correction_details"."field" = 'tradeName' or nullif(btrim("legacy_identity_correction_details"."previous_value"), '') is not null),
	CONSTRAINT "legacy_identity_correction_proposed_value_valid" CHECK (("legacy_identity_correction_details"."field" = 'name'
          and nullif(btrim("legacy_identity_correction_details"."proposed_value"), '') is not null
          and "legacy_identity_correction_details"."proposed_value" = btrim("legacy_identity_correction_details"."proposed_value")
          and char_length("legacy_identity_correction_details"."proposed_value") <= 300)
        or ("legacy_identity_correction_details"."field" = 'tradeName'
          and ("legacy_identity_correction_details"."proposed_value" is null
            or (nullif(btrim("legacy_identity_correction_details"."proposed_value"), '') is not null
              and "legacy_identity_correction_details"."proposed_value" = btrim("legacy_identity_correction_details"."proposed_value")
              and char_length("legacy_identity_correction_details"."proposed_value") <= 400)))),
	CONSTRAINT "legacy_identity_correction_source_title_valid" CHECK (char_length(btrim("legacy_identity_correction_details"."source_title")) between 3 and 300
	        and "legacy_identity_correction_details"."source_title" = btrim("legacy_identity_correction_details"."source_title")),
	CONSTRAINT "legacy_identity_correction_source_url_valid" CHECK ("legacy_identity_correction_details"."source_url" = btrim("legacy_identity_correction_details"."source_url")
        and "legacy_identity_correction_details"."source_url" ~* '^https?://[^/?#@:[:space:]][^/?#@[:space:]]*([/?#]|$)'
        and "legacy_identity_correction_details"."source_url" !~* '^https?://[^/?#]*@'
        and "legacy_identity_correction_details"."source_url" !~ '[[:space:][:cntrl:]]'
        and char_length("legacy_identity_correction_details"."source_url") <= 2048)
);
--> statement-breakpoint
CREATE TABLE "legacy_revision_quarantines" (
	"revision_id" varchar(64) PRIMARY KEY NOT NULL,
	"reason_code" varchar(64) NOT NULL,
	"system_reason" text NOT NULL,
	"quarantined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legacy_revision_quarantine_reason_code" CHECK ("legacy_revision_quarantines"."reason_code" = 'pre_0011_unsafe_pending'),
	CONSTRAINT "legacy_revision_quarantine_system_reason" CHECK (nullif(btrim("legacy_revision_quarantines"."system_reason"), '') is not null)
);
--> statement-breakpoint
ALTER TABLE "revisions" DROP CONSTRAINT "revisions_drug_id_drugs_id_fk";
--> statement-breakpoint
ALTER TABLE "revisions" DROP CONSTRAINT "revisions_author_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "revisions" DROP CONSTRAINT "revisions_reviewed_by_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "legacy_identity_correction_details" ADD CONSTRAINT "legacy_identity_correction_details_revision_id_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_revision_quarantines" ADD CONSTRAINT "legacy_revision_quarantines_revision_id_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

INSERT INTO "legacy_revision_quarantines" (
	"revision_id",
	"reason_code",
	"system_reason"
)
SELECT
	"id",
	'pre_0011_unsafe_pending',
	'This older pending edit did not use the identity-only source and review safeguards now required. The original entry remains in history, but it cannot be reviewed or published. Submit a new medicine-name correction here, or use an identified development programme for evidence and conclusion changes.'
FROM "revisions"
WHERE "status" = 'pending_review'
ON CONFLICT ("revision_id") DO NOTHING;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "legacy_identity_revision_contract_validate"(
	target_revision_id varchar,
	require_current_baseline boolean
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
	revision_row "revisions"%ROWTYPE;
	detail_row "legacy_identity_correction_details"%ROWTYPE;
	current_name text;
	current_trade_name text;
	expected_payload jsonb;
	expected_changes jsonb;
	field_label text;
	before_text text;
	after_text text;
BEGIN
	SELECT * INTO revision_row
	FROM "revisions"
	WHERE "id" = target_revision_id;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'identity correction points at a missing revision'
			USING ERRCODE = '23514';
	END IF;

	SELECT * INTO detail_row
	FROM "legacy_identity_correction_details"
	WHERE "revision_id" = target_revision_id;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'new legacy revisions require one immutable identity correction detail'
			USING ERRCODE = '23514';
	END IF;

	IF EXISTS (
		SELECT 1 FROM "legacy_revision_quarantines"
		WHERE "revision_id" = target_revision_id
	) THEN
		RAISE EXCEPTION 'a revision cannot be both an identity correction and quarantined'
			USING ERRCODE = '23514';
	END IF;

	IF revision_row."author_user_id" IS NULL THEN
		RAISE EXCEPTION 'identity corrections require an attributed account'
			USING ERRCODE = '23514';
	END IF;

	IF char_length(btrim(revision_row."summary")) < 10
		OR revision_row."summary" <> btrim(revision_row."summary")
		OR char_length(revision_row."summary") > 300 THEN
		RAISE EXCEPTION 'identity correction explanation must contain 10 to 300 characters'
			USING ERRCODE = '23514';
	END IF;

	IF revision_row."engine_report" IS NOT NULL
		OR revision_row."machine_verified"
		OR revision_row."verification_hash" IS NOT NULL THEN
		RAISE EXCEPTION 'identity corrections cannot claim scientific engine verification'
			USING ERRCODE = '23514';
	END IF;

	IF require_current_baseline AND EXISTS (
		SELECT 1 FROM "development_programmes"
		WHERE "drug_id" = revision_row."drug_id"
	) THEN
		RAISE EXCEPTION 'legacy identity corrections require a medicine with no identified programme'
			USING ERRCODE = '23514';
	END IF;

	SELECT "name", "trade_name"
	INTO current_name, current_trade_name
	FROM "drugs"
	WHERE "id" = revision_row."drug_id"
	FOR UPDATE;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'identity correction points at a missing medicine'
			USING ERRCODE = '23514';
	END IF;

	IF detail_row."field" = 'name' THEN
		IF detail_row."proposed_value" IS NULL THEN
			RAISE EXCEPTION 'medicine name cannot be removed'
				USING ERRCODE = '23514';
		END IF;
		IF require_current_baseline
			AND detail_row."previous_value" IS DISTINCT FROM current_name THEN
			RAISE EXCEPTION 'identity correction baseline is stale'
				USING ERRCODE = '23514';
		END IF;
		field_label := 'Medicine name';
		expected_payload := jsonb_build_object('name', detail_row."proposed_value");
	ELSE
		IF require_current_baseline
			AND detail_row."previous_value" IS DISTINCT FROM current_trade_name THEN
			RAISE EXCEPTION 'identity correction baseline is stale'
				USING ERRCODE = '23514';
		END IF;
		field_label := 'Trade or brand name';
		expected_payload := jsonb_build_object('tradeName', detail_row."proposed_value");
	END IF;

	IF detail_row."previous_value" IS NOT DISTINCT FROM detail_row."proposed_value" THEN
		RAISE EXCEPTION 'identity correction must change the selected value'
			USING ERRCODE = '23514';
	END IF;

	before_text := coalesce(detail_row."previous_value", 'Not recorded');
	after_text := coalesce(detail_row."proposed_value", 'Not recorded');
	expected_changes := jsonb_build_array(jsonb_build_object(
		'field', detail_row."field"::text,
		'label', field_label,
		'before', before_text,
		'after', after_text
	));

	IF revision_row."proposed_payload" IS DISTINCT FROM expected_payload
		OR revision_row."changed_fields" IS DISTINCT FROM expected_changes THEN
		RAISE EXCEPTION 'revision payload must exactly match its one identity correction detail'
			USING ERRCODE = '23514';
	END IF;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "legacy_revision_row_guard"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	author_account_name text;
	author_account_orcid text;
	author_account_trust "trust_tier";
	reviewer_account_name text;
	reviewer_account_trust "trust_tier";
	reviewer_is_admin boolean;
	published_row_count integer;
BEGIN
	IF TG_OP = 'DELETE' THEN
		RAISE EXCEPTION 'legacy revision history is append-only'
			USING ERRCODE = '23514';
	END IF;

	IF TG_OP = 'INSERT' THEN
		NEW."created_at" := statement_timestamp();
		IF NEW."status" <> 'pending_review'
			OR NEW."author_user_id" IS NULL
			OR NEW."reviewed_at" IS NOT NULL
			OR NEW."reviewed_by_user_id" IS NOT NULL
			OR NEW."reviewed_by_name" IS NOT NULL
			OR NEW."review_note" IS NOT NULL THEN
			RAISE EXCEPTION 'new legacy revisions must begin as attributed, unreviewed identity corrections'
				USING ERRCODE = '23514';
		END IF;
		IF char_length(btrim(NEW."summary")) < 10
			OR NEW."summary" <> btrim(NEW."summary")
			OR char_length(NEW."summary") > 300 THEN
			RAISE EXCEPTION 'identity correction explanation must contain 10 to 300 characters'
				USING ERRCODE = '23514';
		END IF;
		IF NEW."engine_report" IS NOT NULL
			OR NEW."machine_verified"
			OR NEW."verification_hash" IS NOT NULL THEN
			RAISE EXCEPTION 'identity corrections cannot claim scientific engine verification'
				USING ERRCODE = '23514';
		END IF;

		SELECT "name", "orcid", "trust_tier"
		INTO author_account_name, author_account_orcid, author_account_trust
		FROM "users"
		WHERE "id" = NEW."author_user_id";

		IF NOT FOUND
			OR NEW."author_name" IS DISTINCT FROM author_account_name
			OR NEW."author_orcid" IS DISTINCT FROM author_account_orcid
			OR NEW."author_trust_tier" IS DISTINCT FROM author_account_trust THEN
			RAISE EXCEPTION 'identity correction author snapshots must match the attributed account'
				USING ERRCODE = '23514';
		END IF;
		RETURN NEW;
	END IF;

	IF OLD."status" <> 'pending_review' THEN
		RAISE EXCEPTION 'terminal legacy revision history is immutable'
			USING ERRCODE = '23514';
	END IF;

	IF EXISTS (
		SELECT 1 FROM "legacy_revision_quarantines"
		WHERE "revision_id" = OLD."id"
	) THEN
		RAISE EXCEPTION 'quarantined legacy revisions cannot be reviewed or changed'
			USING ERRCODE = '23514';
	END IF;

	IF NEW."status" NOT IN ('published', 'rejected') THEN
		RAISE EXCEPTION 'a pending identity correction allows one terminal review decision'
			USING ERRCODE = '23514';
	END IF;

	NEW."reviewed_at" := statement_timestamp();

	IF NEW."id" IS DISTINCT FROM OLD."id"
		OR NEW."drug_id" IS DISTINCT FROM OLD."drug_id"
		OR NEW."author_user_id" IS DISTINCT FROM OLD."author_user_id"
		OR NEW."author_name" IS DISTINCT FROM OLD."author_name"
		OR NEW."author_orcid" IS DISTINCT FROM OLD."author_orcid"
		OR NEW."author_trust_tier" IS DISTINCT FROM OLD."author_trust_tier"
		OR NEW."summary" IS DISTINCT FROM OLD."summary"
		OR NEW."changed_fields" IS DISTINCT FROM OLD."changed_fields"
		OR NEW."proposed_payload" IS DISTINCT FROM OLD."proposed_payload"
		OR NEW."engine_report" IS DISTINCT FROM OLD."engine_report"
		OR NEW."machine_verified" IS DISTINCT FROM OLD."machine_verified"
		OR NEW."verification_hash" IS DISTINCT FROM OLD."verification_hash"
		OR NEW."created_at" IS DISTINCT FROM OLD."created_at" THEN
		RAISE EXCEPTION 'identity correction content is immutable after submission'
			USING ERRCODE = '23514';
	END IF;

	IF NEW."reviewed_at" IS NULL
		OR NEW."reviewed_at" < NEW."created_at"
		OR NEW."reviewed_by_user_id" IS NULL
		OR nullif(btrim(NEW."reviewed_by_name"), '') IS NULL THEN
		RAISE EXCEPTION 'a terminal identity correction requires one attributed human review'
			USING ERRCODE = '23514';
	END IF;

	IF NEW."reviewed_by_user_id" = NEW."author_user_id" THEN
		RAISE EXCEPTION 'identity correction authors cannot review their own submission'
			USING ERRCODE = '23514';
	END IF;

	SELECT "name", "trust_tier", "is_admin"
	INTO reviewer_account_name, reviewer_account_trust, reviewer_is_admin
	FROM "users"
	WHERE "id" = NEW."reviewed_by_user_id";

	IF NOT FOUND
		OR NEW."reviewed_by_name" IS DISTINCT FROM reviewer_account_name
		OR (reviewer_account_trust NOT IN ('trusted', 'steward') AND NOT reviewer_is_admin) THEN
		RAISE EXCEPTION 'identity corrections require a current trusted editor, steward or administrator reviewer'
			USING ERRCODE = '23514';
	END IF;

	IF NEW."status" = 'rejected'
		AND nullif(btrim(NEW."review_note"), '') IS NULL THEN
		RAISE EXCEPTION 'a declined identity correction requires a reason'
			USING ERRCODE = '23514';
	END IF;

	IF NEW."status" = 'published' AND NEW."review_note" IS NOT NULL THEN
		RAISE EXCEPTION 'an approved identity correction does not accept a decline reason'
			USING ERRCODE = '23514';
	END IF;

	PERFORM "legacy_identity_revision_contract_validate"(
		OLD."id",
		NEW."status" = 'published'
	);

	IF NEW."status" = 'published' THEN
		UPDATE "drugs" AS medicine
		SET
			"name" = CASE
				WHEN detail."field" = 'name' THEN detail."proposed_value"
				ELSE medicine."name"
			END,
			"trade_name" = CASE
				WHEN detail."field" = 'tradeName' THEN detail."proposed_value"
				ELSE medicine."trade_name"
			END,
			"revision_count" = medicine."revision_count" + 1,
			"last_edited_at" = NEW."reviewed_at",
			"last_edited_by" = OLD."author_name",
			"updated_at" = NEW."reviewed_at"
		FROM "legacy_identity_correction_details" AS detail
		WHERE medicine."id" = OLD."drug_id"
			AND detail."revision_id" = OLD."id";

		GET DIAGNOSTICS published_row_count = ROW_COUNT;
		IF published_row_count <> 1 THEN
			RAISE EXCEPTION 'identity correction publication must update exactly one medicine'
				USING ERRCODE = '23514';
		END IF;
	END IF;

	RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "legacy_identity_detail_guard"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	IF TG_OP <> 'INSERT' THEN
		RAISE EXCEPTION 'identity correction details are immutable'
			USING ERRCODE = '23514';
	END IF;

	IF TG_WHEN = 'BEFORE' THEN
		SELECT "created_at" INTO NEW."created_at"
		FROM "revisions"
		WHERE "id" = NEW."revision_id";

		IF NOT FOUND THEN
			RAISE EXCEPTION 'identity correction points at a missing revision'
				USING ERRCODE = '23514';
		END IF;
		RETURN NEW;
	END IF;

	PERFORM "legacy_identity_revision_contract_validate"(NEW."revision_id", true);
	RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "legacy_revision_quarantine_guard"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	revision_status "revision_status";
BEGIN
	IF TG_OP <> 'INSERT' THEN
		RAISE EXCEPTION 'legacy revision quarantine history is immutable'
			USING ERRCODE = '23514';
	END IF;

	IF TG_WHEN = 'BEFORE' THEN
		NEW."quarantined_at" := statement_timestamp();
	END IF;

	SELECT "status" INTO revision_status
	FROM "revisions"
	WHERE "id" = NEW."revision_id";

	IF NOT FOUND OR revision_status <> 'pending_review' THEN
		RAISE EXCEPTION 'only an existing pending legacy revision can be quarantined'
			USING ERRCODE = '23514';
	END IF;

	IF EXISTS (
		SELECT 1 FROM "legacy_identity_correction_details"
		WHERE "revision_id" = NEW."revision_id"
	) THEN
		RAISE EXCEPTION 'an identity correction cannot be quarantined'
			USING ERRCODE = '23514';
	END IF;

	RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION "legacy_new_revision_contract_guard"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	PERFORM "legacy_identity_revision_contract_validate"(NEW."id", true);
	RETURN NULL;
END;
$$;--> statement-breakpoint

CREATE TRIGGER "legacy_revisions_append_only"
BEFORE INSERT OR UPDATE OR DELETE ON "revisions"
FOR EACH ROW
EXECUTE FUNCTION "legacy_revision_row_guard"();--> statement-breakpoint

CREATE TRIGGER "legacy_identity_details_immutable"
AFTER INSERT OR UPDATE OR DELETE ON "legacy_identity_correction_details"
FOR EACH ROW
EXECUTE FUNCTION "legacy_identity_detail_guard"();--> statement-breakpoint

CREATE TRIGGER "legacy_identity_details_database_clock"
BEFORE INSERT ON "legacy_identity_correction_details"
FOR EACH ROW
EXECUTE FUNCTION "legacy_identity_detail_guard"();--> statement-breakpoint

CREATE TRIGGER "legacy_revision_quarantines_immutable"
AFTER INSERT OR UPDATE OR DELETE ON "legacy_revision_quarantines"
FOR EACH ROW
EXECUTE FUNCTION "legacy_revision_quarantine_guard"();--> statement-breakpoint

CREATE TRIGGER "legacy_revision_quarantines_database_clock"
BEFORE INSERT ON "legacy_revision_quarantines"
FOR EACH ROW
EXECUTE FUNCTION "legacy_revision_quarantine_guard"();--> statement-breakpoint

CREATE CONSTRAINT TRIGGER "legacy_new_revision_requires_identity_detail"
AFTER INSERT ON "revisions"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION "legacy_new_revision_contract_guard"();
