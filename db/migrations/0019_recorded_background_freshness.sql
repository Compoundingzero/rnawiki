CREATE TYPE "public"."background_assertion_result" AS ENUM('CURRENT', 'NUMBERS_CURRENT', 'DRIFTED');--> statement-breakpoint
CREATE TYPE "public"."background_source_fetch_status" AS ENUM('SUCCEEDED', 'UNREACHABLE', 'UNSUPPORTED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."background_source_kind" AS ENUM('FDA_LABEL', 'DAILYMED', 'EMA_SMPC', 'PUBMED', 'CLINICALTRIALS', 'PUBCHEM', 'RXNORM', 'NADAC', 'NICE_BNF', 'PUBLISHED_ANALYSIS', 'DSLD', 'NCBI_TAXONOMY', 'FDA_NDC', 'FDA_DRUGSFDA', 'FDA_UNII');--> statement-breakpoint
ALTER TABLE "evidence_sources" ALTER COLUMN "external_identifier" SET DATA TYPE varchar(480);--> statement-breakpoint
CREATE TABLE "background_assertion_checks" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"binding_id" varchar(96) NOT NULL,
	"binding_assertion_digest" varchar(71) NOT NULL,
	"fetch_id" varchar(64) NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"source_key" varchar(480) NOT NULL,
	"source_snapshot_id" varchar(64) NOT NULL,
	"fetch_status" "background_source_fetch_status" DEFAULT 'SUCCEEDED' NOT NULL,
	"result" "background_assertion_result" NOT NULL,
	"checker_version" varchar(48) NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "background_assertion_checks_id_format" CHECK ("background_assertion_checks"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "background_assertion_checks_digest" CHECK ("background_assertion_checks"."binding_assertion_digest" ~ '^sha256:[0-9a-f]{64}$'),
	CONSTRAINT "background_assertion_checks_successful_fetch" CHECK ("background_assertion_checks"."fetch_status" = 'SUCCEEDED'),
	CONSTRAINT "background_assertion_checks_version" CHECK (nullif(btrim("background_assertion_checks"."checker_version"), '') is not null),
	CONSTRAINT "background_assertion_checks_details" CHECK (jsonb_typeof("background_assertion_checks"."details") = 'object'
        and ("background_assertion_checks"."result" <> 'DRIFTED' or "background_assertion_checks"."details" <> '{}'::jsonb))
);
--> statement-breakpoint
CREATE TABLE "background_source_bindings" (
	"id" varchar(96) PRIMARY KEY NOT NULL,
	"drug_id" varchar(96) NOT NULL,
	"recorded_background_digest" varchar(71) NOT NULL,
	"field_path" varchar(1000) NOT NULL,
	"source_path" varchar(1000) NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"source_kind" "background_source_kind" NOT NULL,
	"source_identifier" varchar(400) NOT NULL,
	"source_key" varchar(480) NOT NULL,
	"source_label" text NOT NULL,
	"source_locator" text,
	"source_retrieved_at" timestamp with time zone NOT NULL,
	"source_excerpt" text NOT NULL,
	"assertion_digest" varchar(71) NOT NULL,
	"question_intent" varchar(32),
	"binding_schema" varchar(40) NOT NULL,
	"bound_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "background_source_bindings_assertion_scope_unique" UNIQUE("id","source_id","source_key","assertion_digest"),
	CONSTRAINT "background_source_bindings_id_format" CHECK ("background_source_bindings"."id" ~ '^background_binding_[0-9a-f]{64}$'),
	CONSTRAINT "background_source_bindings_digests" CHECK ("background_source_bindings"."recorded_background_digest" ~ '^sha256:[0-9a-f]{64}$'
        and "background_source_bindings"."assertion_digest" ~ '^sha256:[0-9a-f]{64}$'),
	CONSTRAINT "background_source_bindings_paths" CHECK (nullif(btrim("background_source_bindings"."field_path"), '') is not null
        and nullif(btrim("background_source_bindings"."source_path"), '') is not null),
	CONSTRAINT "background_source_bindings_source_identity" CHECK (nullif(btrim("background_source_bindings"."source_identifier"), '') is not null
        and "background_source_bindings"."source_key" = "background_source_bindings"."source_kind"::text || ':' || "background_source_bindings"."source_identifier"),
	CONSTRAINT "background_source_bindings_source_copy" CHECK (nullif(btrim("background_source_bindings"."source_label"), '') is not null
        and char_length("background_source_bindings"."source_label") <= 2000
        and ("background_source_bindings"."source_locator" is null or (
          nullif(btrim("background_source_bindings"."source_locator"), '') is not null
          and char_length("background_source_bindings"."source_locator") <= 2000
        ))
        and nullif(btrim("background_source_bindings"."source_excerpt"), '') is not null
        and char_length("background_source_bindings"."source_excerpt") <= 400),
	CONSTRAINT "background_source_bindings_question_intent" CHECK ("background_source_bindings"."question_intent" is null or "background_source_bindings"."question_intent" in (
        'identity', 'purpose', 'regulatory-status', 'bottom-line', 'evidence-scope',
        'measurement', 'results-magnitude', 'meaning-limitations', 'applicability', 'harms',
        'mechanism', 'evidence-certainty', 'programme-history', 'failure-analysis', 'unknowns',
        'sources', 'review-provenance', 'freshness', 'corrections'
      )),
	CONSTRAINT "background_source_bindings_schema" CHECK ("background_source_bindings"."binding_schema" = 'background-source-binding/v1')
);
--> statement-breakpoint
CREATE TABLE "background_source_fetches" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"source_id" varchar(64) NOT NULL,
	"source_kind" "background_source_kind" NOT NULL,
	"source_identifier" varchar(400) NOT NULL,
	"source_key" varchar(480) NOT NULL,
	"status" "background_source_fetch_status" NOT NULL,
	"source_snapshot_id" varchar(64),
	"fetcher_version" varchar(48) NOT NULL,
	"attempted_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"failure_code" varchar(64),
	"failure_detail" text,
	CONSTRAINT "background_source_fetches_observation_scope_unique" UNIQUE("id","source_id","source_key","source_snapshot_id","status"),
	CONSTRAINT "background_source_fetches_id_format" CHECK ("background_source_fetches"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "background_source_fetches_source_identity" CHECK (nullif(btrim("background_source_fetches"."source_identifier"), '') is not null
        and "background_source_fetches"."source_key" = "background_source_fetches"."source_kind"::text || ':' || "background_source_fetches"."source_identifier"),
	CONSTRAINT "background_source_fetches_version" CHECK (nullif(btrim("background_source_fetches"."fetcher_version"), '') is not null),
	CONSTRAINT "background_source_fetches_time_order" CHECK ("background_source_fetches"."completed_at" >= "background_source_fetches"."attempted_at"),
	CONSTRAINT "background_source_fetches_result_shape" CHECK (("background_source_fetches"."status" = 'SUCCEEDED'
          and "background_source_fetches"."source_snapshot_id" is not null
          and "background_source_fetches"."failure_code" is null
          and "background_source_fetches"."failure_detail" is null)
        or ("background_source_fetches"."status" in ('UNREACHABLE', 'UNSUPPORTED', 'FAILED')
          and "background_source_fetches"."source_snapshot_id" is null
          and nullif(btrim("background_source_fetches"."failure_code"), '') is not null
          and nullif(btrim("background_source_fetches"."failure_detail"), '') is not null))
);
--> statement-breakpoint
ALTER TABLE "background_assertion_checks" ADD CONSTRAINT "background_assertion_checks_binding_scope_fk" FOREIGN KEY ("binding_id","source_id","source_key","binding_assertion_digest") REFERENCES "public"."background_source_bindings"("id","source_id","source_key","assertion_digest") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_assertion_checks" ADD CONSTRAINT "background_assertion_checks_fetch_scope_fk" FOREIGN KEY ("fetch_id","source_id","source_key","source_snapshot_id","fetch_status") REFERENCES "public"."background_source_fetches"("id","source_id","source_key","source_snapshot_id","status") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_assertion_checks" ADD CONSTRAINT "background_assertion_checks_snapshot_source_fk" FOREIGN KEY ("source_snapshot_id","source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_source_bindings" ADD CONSTRAINT "background_source_bindings_drug_id_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."drugs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_source_bindings" ADD CONSTRAINT "background_source_bindings_source_id_evidence_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_source_fetches" ADD CONSTRAINT "background_source_fetches_source_id_evidence_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_source_fetches" ADD CONSTRAINT "background_source_fetches_snapshot_source_fk" FOREIGN KEY ("source_snapshot_id","source_id") REFERENCES "public"."source_snapshots"("id","source_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "background_assertion_checks_observation_unique" ON "background_assertion_checks" USING btree ("binding_id","fetch_id","checker_version");--> statement-breakpoint
CREATE INDEX "background_assertion_checks_binding_checked_idx" ON "background_assertion_checks" USING btree ("binding_id","checked_at");--> statement-breakpoint
CREATE INDEX "background_assertion_checks_result_checked_idx" ON "background_assertion_checks" USING btree ("result","checked_at");--> statement-breakpoint
CREATE INDEX "background_source_bindings_drug_envelope_idx" ON "background_source_bindings" USING btree ("drug_id","recorded_background_digest");--> statement-breakpoint
CREATE INDEX "background_source_bindings_source_idx" ON "background_source_bindings" USING btree ("source_key","bound_at");--> statement-breakpoint
CREATE INDEX "background_source_fetches_source_completed_idx" ON "background_source_fetches" USING btree ("source_key","completed_at");--> statement-breakpoint
CREATE INDEX "background_source_fetches_status_completed_idx" ON "background_source_fetches" USING btree ("status","completed_at");
--> statement-breakpoint
CREATE FUNCTION "rnawiki_reject_background_freshness_mutation"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	RAISE EXCEPTION '% is an immutable append-only freshness record', TG_TABLE_NAME
		USING ERRCODE = '55000';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "background_source_bindings_immutable"
BEFORE UPDATE OR DELETE ON "background_source_bindings"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_reject_background_freshness_mutation"();
--> statement-breakpoint
CREATE TRIGGER "background_source_fetches_immutable"
BEFORE UPDATE OR DELETE ON "background_source_fetches"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_reject_background_freshness_mutation"();
--> statement-breakpoint
CREATE TRIGGER "background_assertion_checks_immutable"
BEFORE UPDATE OR DELETE ON "background_assertion_checks"
FOR EACH ROW EXECUTE FUNCTION "rnawiki_reject_background_freshness_mutation"();
