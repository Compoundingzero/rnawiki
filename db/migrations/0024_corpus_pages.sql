CREATE TYPE "public"."corpus_field_state" AS ENUM('present', 'absent', 'not-applicable');--> statement-breakpoint
CREATE TYPE "public"."corpus_page_model" AS ENUM('LONGEVITY', 'CLINICAL', 'DEVELOPMENT');--> statement-breakpoint
CREATE TYPE "public"."corpus_page_type" AS ENUM('longevity', 'clinical', 'withdrawn', 'development', 'stub');--> statement-breakpoint
CREATE TYPE "public"."corpus_relation_kind" AS ENUM('ester-of', 'prodrug-of', 'stereoisomer-of', 'racemate-of', 'biosimilar-of', 'contains', 'isotopologue-of', 'same-target', 'shares-enzyme');--> statement-breakpoint
CREATE TYPE "public"."corpus_synonym_kind" AS ENUM('inn', 'usan', 'ban', 'jan', 'brand', 'salt', 'code', 'fragment', 'common', 'display');--> statement-breakpoint
CREATE TABLE "corpus_pages" (
	"key" varchar(200) PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"display_name" text NOT NULL,
	"model" "corpus_page_model" NOT NULL,
	"tier" integer NOT NULL,
	"page_type" "corpus_page_type" NOT NULL,
	"indexable" boolean DEFAULT false NOT NULL,
	"suppressed" boolean DEFAULT false NOT NULL,
	"suppression_classes" text[] DEFAULT '{}'::text[] NOT NULL,
	"withdrawn" boolean DEFAULT false NOT NULL,
	"present_field_count" integer DEFAULT 0 NOT NULL,
	"applicable_field_count" integer DEFAULT 0 NOT NULL,
	"structure_inchikey" varchar(27),
	"unii" varchar(20),
	"chembl_id" varchar(24),
	"pubchem_cid" varchar(24),
	"cas" varchar(32),
	"rxcui" varchar(24),
	"legacy_drug_id" varchar(96),
	"identity_rank" varchar(16) NOT NULL,
	"identity_rule" varchar(40) NOT NULL,
	"licence_notes" text[] DEFAULT '{}'::text[] NOT NULL,
	"corpus_digest" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "corpus_pages_tier_range" CHECK ("corpus_pages"."tier" between 1 and 3),
	CONSTRAINT "corpus_pages_slug_shape" CHECK ("corpus_pages"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "corpus_pages_digest" CHECK ("corpus_pages"."corpus_digest" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "corpus_pages_display_name_nonempty" CHECK (nullif(btrim("corpus_pages"."display_name"), '') is not null),
	CONSTRAINT "corpus_pages_field_counts" CHECK ("corpus_pages"."present_field_count" >= 0 and "corpus_pages"."applicable_field_count" >= 0 and "corpus_pages"."present_field_count" <= "corpus_pages"."applicable_field_count"),
	CONSTRAINT "corpus_pages_stub_not_indexable" CHECK (not ("corpus_pages"."indexable" and ("corpus_pages"."page_type" = 'stub' or "corpus_pages"."tier" = 3)))
);
--> statement-breakpoint
CREATE TABLE "page_fields" (
	"key" varchar(200) NOT NULL,
	"field" varchar(64) NOT NULL,
	"ordinal" integer DEFAULT 0 NOT NULL,
	"state" "corpus_field_state" NOT NULL,
	"value" jsonb,
	"source_kind" varchar(64),
	"source_id" varchar(200),
	"source_url" text,
	"source_date" varchar(32),
	"last_verified" varchar(32),
	"verbatim" boolean DEFAULT false NOT NULL,
	"note" text,
	CONSTRAINT "page_fields_key_field_ordinal_pk" PRIMARY KEY("key","field","ordinal"),
	CONSTRAINT "page_fields_value_state" CHECK (("page_fields"."state" = 'present') or "page_fields"."source_kind" is null),
	CONSTRAINT "page_fields_source_date_shape" CHECK ("page_fields"."source_date" is null or "page_fields"."source_date" ~ '^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$'),
	CONSTRAINT "page_fields_last_verified_shape" CHECK ("page_fields"."last_verified" is null or "page_fields"."last_verified" ~ '^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$'),
	CONSTRAINT "page_fields_ordinal" CHECK ("page_fields"."ordinal" >= 0)
);
--> statement-breakpoint
CREATE TABLE "page_questions" (
	"key" varchar(200) NOT NULL,
	"ordinal" integer NOT NULL,
	"block" varchar(48) NOT NULL,
	"template" varchar(64) NOT NULL,
	"text" text NOT NULL,
	"paragraph_1" text,
	"paragraph_2" text,
	"anchors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"revealed" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "page_questions_key_ordinal_pk" PRIMARY KEY("key","ordinal"),
	CONSTRAINT "page_questions_ordinal" CHECK ("page_questions"."ordinal" >= 0),
	CONSTRAINT "page_questions_text_nonempty" CHECK (nullif(btrim("page_questions"."text"), '') is not null)
);
--> statement-breakpoint
CREATE TABLE "page_registry_studies" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"key" varchar(200) NOT NULL,
	"nct" varchar(16) NOT NULL,
	"role" varchar(32) NOT NULL,
	"matched_name" text,
	CONSTRAINT "page_registry_studies_id_digest" CHECK ("page_registry_studies"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "page_registry_studies_nct_shape" CHECK ("page_registry_studies"."nct" ~ '^NCT[0-9]{8}$')
);
--> statement-breakpoint
CREATE TABLE "page_relations" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"key" varchar(200) NOT NULL,
	"relation" "corpus_relation_kind" NOT NULL,
	"target_key" varchar(200) NOT NULL,
	"label" text,
	"source" varchar(64) NOT NULL,
	CONSTRAINT "page_relations_id_digest" CHECK ("page_relations"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "page_relations_not_self" CHECK ("page_relations"."key" <> "page_relations"."target_key")
);
--> statement-breakpoint
CREATE TABLE "page_seeds" (
	"key" varchar(200) NOT NULL,
	"seed" integer NOT NULL,
	"values" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_seeds_key_seed_pk" PRIMARY KEY("key","seed"),
	CONSTRAINT "page_seeds_seed_range" CHECK ("page_seeds"."seed" between 1 and 17)
);
--> statement-breakpoint
CREATE TABLE "page_sources" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"key" varchar(200) NOT NULL,
	"source_kind" varchar(64) NOT NULL,
	"source_id" varchar(200) NOT NULL,
	"source_url" text,
	"source_date" varchar(32),
	"title" text,
	"licence" text,
	CONSTRAINT "page_sources_id_digest" CHECK ("page_sources"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "page_sources_source_date_shape" CHECK ("page_sources"."source_date" is null or "page_sources"."source_date" ~ '^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$')
);
--> statement-breakpoint
CREATE TABLE "page_synonyms" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"key" varchar(200) NOT NULL,
	"name" text NOT NULL,
	"kind" "corpus_synonym_kind" NOT NULL,
	"source" varchar(64) NOT NULL,
	CONSTRAINT "page_synonyms_id_digest" CHECK ("page_synonyms"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "page_synonyms_name_nonempty" CHECK (nullif(btrim("page_synonyms"."name"), '') is not null)
);
--> statement-breakpoint
ALTER TABLE "corpus_pages" ADD CONSTRAINT "corpus_pages_legacy_drug_id_drugs_id_fk" FOREIGN KEY ("legacy_drug_id") REFERENCES "public"."drugs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_fields" ADD CONSTRAINT "page_fields_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_questions" ADD CONSTRAINT "page_questions_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_registry_studies" ADD CONSTRAINT "page_registry_studies_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_relations" ADD CONSTRAINT "page_relations_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_seeds" ADD CONSTRAINT "page_seeds_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_sources" ADD CONSTRAINT "page_sources_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_synonyms" ADD CONSTRAINT "page_synonyms_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "corpus_pages_slug_key" ON "corpus_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "corpus_pages_indexable_tier_idx" ON "corpus_pages" USING btree ("indexable","tier");--> statement-breakpoint
CREATE INDEX "corpus_pages_sitemap_idx" ON "corpus_pages" USING btree ("tier","updated_at") WHERE "corpus_pages"."indexable";--> statement-breakpoint
CREATE INDEX "corpus_pages_tier_model_idx" ON "corpus_pages" USING btree ("tier","model");--> statement-breakpoint
CREATE INDEX "corpus_pages_page_type_idx" ON "corpus_pages" USING btree ("page_type","tier");--> statement-breakpoint
CREATE INDEX "corpus_pages_withdrawn_idx" ON "corpus_pages" USING btree ("tier") WHERE "corpus_pages"."withdrawn";--> statement-breakpoint
CREATE INDEX "corpus_pages_suppressed_idx" ON "corpus_pages" USING btree ("tier") WHERE "corpus_pages"."suppressed";--> statement-breakpoint
CREATE INDEX "corpus_pages_unii_idx" ON "corpus_pages" USING btree ("unii") WHERE "corpus_pages"."unii" is not null;--> statement-breakpoint
CREATE INDEX "corpus_pages_chembl_idx" ON "corpus_pages" USING btree ("chembl_id") WHERE "corpus_pages"."chembl_id" is not null;--> statement-breakpoint
CREATE INDEX "corpus_pages_pubchem_idx" ON "corpus_pages" USING btree ("pubchem_cid") WHERE "corpus_pages"."pubchem_cid" is not null;--> statement-breakpoint
CREATE INDEX "corpus_pages_cas_idx" ON "corpus_pages" USING btree ("cas") WHERE "corpus_pages"."cas" is not null;--> statement-breakpoint
CREATE INDEX "corpus_pages_rxcui_idx" ON "corpus_pages" USING btree ("rxcui") WHERE "corpus_pages"."rxcui" is not null;--> statement-breakpoint
CREATE INDEX "corpus_pages_inchikey_idx" ON "corpus_pages" USING btree ("structure_inchikey") WHERE "corpus_pages"."structure_inchikey" is not null;--> statement-breakpoint
CREATE INDEX "corpus_pages_legacy_drug_idx" ON "corpus_pages" USING btree ("legacy_drug_id") WHERE "corpus_pages"."legacy_drug_id" is not null;--> statement-breakpoint
CREATE INDEX "corpus_pages_display_name_idx" ON "corpus_pages" USING btree (lower("display_name"));--> statement-breakpoint
CREATE INDEX "page_fields_field_state_idx" ON "page_fields" USING btree ("field","state");--> statement-breakpoint
CREATE INDEX "page_fields_present_idx" ON "page_fields" USING btree ("key") WHERE "page_fields"."state" = 'present';--> statement-breakpoint
CREATE INDEX "page_fields_freshness_idx" ON "page_fields" USING btree ("source_kind","source_date");--> statement-breakpoint
CREATE INDEX "page_questions_block_idx" ON "page_questions" USING btree ("block");--> statement-breakpoint
CREATE INDEX "page_questions_template_idx" ON "page_questions" USING btree ("template");--> statement-breakpoint
CREATE INDEX "page_registry_studies_key_idx" ON "page_registry_studies" USING btree ("key");--> statement-breakpoint
CREATE INDEX "page_registry_studies_nct_idx" ON "page_registry_studies" USING btree ("nct");--> statement-breakpoint
CREATE UNIQUE INDEX "page_relations_unique" ON "page_relations" USING btree ("key","relation","target_key");--> statement-breakpoint
CREATE INDEX "page_relations_target_idx" ON "page_relations" USING btree ("target_key");--> statement-breakpoint
CREATE INDEX "page_relations_relation_idx" ON "page_relations" USING btree ("relation");--> statement-breakpoint
CREATE INDEX "page_seeds_seed_idx" ON "page_seeds" USING btree ("seed");--> statement-breakpoint
CREATE INDEX "page_sources_key_idx" ON "page_sources" USING btree ("key");--> statement-breakpoint
CREATE INDEX "page_sources_kind_idx" ON "page_sources" USING btree ("source_kind","source_id");--> statement-breakpoint
CREATE INDEX "page_synonyms_key_idx" ON "page_synonyms" USING btree ("key");--> statement-breakpoint
CREATE INDEX "page_synonyms_name_idx" ON "page_synonyms" USING btree (lower(left("name", 120)));--> statement-breakpoint

-- R2 (docs/specs/suppression-classes.md, docs/specs/derived-content.md): suppression removes seeds
-- 1 (bioavailability gap), 2 (n-of-1 designability) and 6 (time-to-signal) absolutely. A CHECK
-- cannot read another table, so the rule is a trigger, enforced from both sides: a seed row cannot
-- be written for a suppressed page, and a page cannot be marked suppressed while it still holds
-- one. The loader deletes a page's seed rows before it upserts the page, so a page that becomes
-- suppressed drops its forbidden seeds in the same transaction rather than failing.

CREATE OR REPLACE FUNCTION rnawiki_guard_suppressed_page_seed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  page_is_suppressed boolean;
BEGIN
  IF NEW.seed NOT IN (1, 2, 6) THEN
    RETURN NEW;
  END IF;

  SELECT suppressed INTO page_is_suppressed FROM corpus_pages WHERE key = NEW.key;

  IF COALESCE(page_is_suppressed, false) THEN
    RAISE EXCEPTION
      'seed % cannot be stored for suppressed page %: R2 removes seeds 1, 2 and 6 absolutely',
      NEW.seed, NEW.key
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER page_seeds_suppression_guard
BEFORE INSERT OR UPDATE ON page_seeds
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_suppressed_page_seed();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_page_suppression_seeds()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  forbidden_seed integer;
BEGIN
  SELECT seed INTO forbidden_seed
  FROM page_seeds
  WHERE key = NEW.key AND seed IN (1, 2, 6)
  LIMIT 1;

  IF forbidden_seed IS NOT NULL THEN
    RAISE EXCEPTION
      'page % cannot be marked suppressed while it holds seed %: delete the seed row first',
      NEW.key, forbidden_seed
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER corpus_pages_suppression_guard
BEFORE INSERT OR UPDATE ON corpus_pages
FOR EACH ROW WHEN (NEW.suppressed) EXECUTE FUNCTION rnawiki_guard_page_suppression_seeds();
