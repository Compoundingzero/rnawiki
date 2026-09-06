CREATE TYPE "public"."corpus_interaction_row_kind" AS ENUM('interaction', 'sources-checked');--> statement-breakpoint
CREATE TYPE "public"."corpus_interaction_tier" AS ENUM('A', 'B', 'C');--> statement-breakpoint
ALTER TYPE "public"."corpus_relation_kind" ADD VALUE 'form-of';--> statement-breakpoint
ALTER TYPE "public"."corpus_relation_kind" ADD VALUE 'related-form-of';--> statement-breakpoint
ALTER TYPE "public"."corpus_relation_kind" ADD VALUE 'ionised-form-of';--> statement-breakpoint
ALTER TYPE "public"."corpus_relation_kind" ADD VALUE 'component-of';--> statement-breakpoint
ALTER TYPE "public"."corpus_relation_kind" ADD VALUE 'active-moiety-of';--> statement-breakpoint
ALTER TYPE "public"."corpus_relation_kind" ADD VALUE 'same-structure-as';--> statement-breakpoint
ALTER TYPE "public"."corpus_relation_kind" ADD VALUE 'originator-of';--> statement-breakpoint
ALTER TYPE "public"."corpus_relation_kind" ADD VALUE 'parent-of';--> statement-breakpoint
ALTER TYPE "public"."corpus_synonym_kind" ADD VALUE 'merged-page';--> statement-breakpoint
CREATE TABLE "page_controlled" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"key" varchar(200) NOT NULL,
	"jurisdiction" varchar(16) NOT NULL,
	"list" text NOT NULL,
	"class_or_schedule" text NOT NULL,
	"schedule_code" varchar(64),
	"item_number" varchar(32),
	"substance_as_listed" text,
	"statute" text,
	"statute_url" text,
	"version_date" varchar(32),
	"source" text,
	"provenance" text,
	CONSTRAINT "page_controlled_id_digest" CHECK ("page_controlled"."id" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "page_display_names" (
	"key" varchar(200) PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"disambiguator" text,
	"basis" text,
	"collides_on" text,
	CONSTRAINT "page_display_names_nonempty" CHECK (nullif(btrim("page_display_names"."display_name"), '') is not null)
);
--> statement-breakpoint
CREATE TABLE "page_interactions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"key" varchar(200) NOT NULL,
	"kind" "corpus_interaction_row_kind" DEFAULT 'interaction' NOT NULL,
	"tier" "corpus_interaction_tier",
	"ordinal" integer DEFAULT 0 NOT NULL,
	"disclosed" boolean DEFAULT false NOT NULL,
	"total_in_tier" integer,
	"counterpart_key" varchar(200),
	"counterpart_name" text,
	"direction" text,
	"mechanism" text,
	"source" varchar(64),
	"source_record_id" varchar(200),
	"source_url" text,
	"source_date" varchar(32),
	"set_id" varchar(64),
	"effective_time" varchar(32),
	"label_section" varchar(64),
	"licence" text,
	"rule_id" varchar(64),
	"confidence" varchar(24),
	"sentence" text,
	"derivation" text,
	"line" text NOT NULL,
	"sources_checked" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"provenance" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "page_interactions_id_digest" CHECK ("page_interactions"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "page_interactions_line_nonempty" CHECK (nullif(btrim("page_interactions"."line"), '') is not null),
	CONSTRAINT "page_interactions_tier_by_kind" CHECK (("page_interactions"."kind" = 'interaction' and "page_interactions"."tier" is not null) or ("page_interactions"."kind" = 'sources-checked' and "page_interactions"."tier" is null))
);
--> statement-breakpoint
CREATE TABLE "page_patent" (
	"key" varchar(200) PRIMARY KEY NOT NULL,
	"eligible" boolean NOT NULL,
	"register" text,
	"rld" boolean,
	"earliest_unexpired_patent_expiry" varchar(32),
	"exclusivity_end" varchar(32),
	"generic_available" boolean,
	"first_generic_approval" varchar(32),
	"te_code" varchar(16),
	"no_record_line" text,
	"reason" text,
	"line" text NOT NULL,
	"source" text,
	"date_checked" varchar(32),
	"disclosure" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"provenance" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "page_patent_line_nonempty" CHECK (nullif(btrim("page_patent"."line"), '') is not null),
	CONSTRAINT "page_patent_no_record_has_line" CHECK ("page_patent"."eligible" or "page_patent"."no_record_line" is not null)
);
--> statement-breakpoint
CREATE TABLE "page_registration" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"key" varchar(200) NOT NULL,
	"jurisdiction" varchar(16) NOT NULL,
	"label" text NOT NULL,
	"status" text NOT NULL,
	"detail" text,
	"source" text,
	"date_checked" varchar(32),
	"ordinal" integer DEFAULT 0 NOT NULL,
	"component" text,
	"line" text NOT NULL,
	"disclosure" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"provenance" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "page_registration_id_digest" CHECK ("page_registration"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "page_registration_line_nonempty" CHECK (nullif(btrim("page_registration"."line"), '') is not null),
	CONSTRAINT "page_registration_date_shape" CHECK ("page_registration"."date_checked" is null or "page_registration"."date_checked" ~ '^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$')
);
--> statement-breakpoint
CREATE TABLE "page_sections" (
	"key" varchar(200) NOT NULL,
	"section" varchar(32) NOT NULL,
	"ordinal" integer DEFAULT 0 NOT NULL,
	"template_id" varchar(64),
	"sentence" text NOT NULL,
	"values" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"provenance" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "page_sections_key_section_ordinal_pk" PRIMARY KEY("key","section","ordinal"),
	CONSTRAINT "page_sections_ordinal" CHECK ("page_sections"."ordinal" >= 0),
	CONSTRAINT "page_sections_sentence_nonempty" CHECK (nullif(btrim("page_sections"."sentence"), '') is not null)
);
--> statement-breakpoint
ALTER TABLE "corpus_pages" ADD COLUMN "controlled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "corpus_pages" ADD COLUMN "controlled_basis" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "page_relations" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "page_controlled" ADD CONSTRAINT "page_controlled_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_display_names" ADD CONSTRAINT "page_display_names_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_interactions" ADD CONSTRAINT "page_interactions_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_patent" ADD CONSTRAINT "page_patent_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_registration" ADD CONSTRAINT "page_registration_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "page_controlled_key_idx" ON "page_controlled" USING btree ("key","jurisdiction");--> statement-breakpoint
CREATE INDEX "page_interactions_key_idx" ON "page_interactions" USING btree ("key","tier","ordinal");--> statement-breakpoint
CREATE INDEX "page_interactions_counterpart_idx" ON "page_interactions" USING btree ("counterpart_key") WHERE "page_interactions"."counterpart_key" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "page_interactions_checked_once" ON "page_interactions" USING btree ("key") WHERE "page_interactions"."kind" = 'sources-checked';--> statement-breakpoint
CREATE INDEX "page_patent_eligible_idx" ON "page_patent" USING btree ("eligible") WHERE "page_patent"."eligible";--> statement-breakpoint
CREATE INDEX "page_registration_key_idx" ON "page_registration" USING btree ("key","ordinal");--> statement-breakpoint
CREATE INDEX "page_registration_jurisdiction_idx" ON "page_registration" USING btree ("jurisdiction");--> statement-breakpoint
CREATE INDEX "page_sections_section_idx" ON "page_sections" USING btree ("section");--> statement-breakpoint
CREATE INDEX "corpus_pages_controlled_idx" ON "corpus_pages" USING btree ("tier") WHERE "corpus_pages"."controlled";--> statement-breakpoint

-- The suppression guard, extended to the controlled-substance trigger.
--
-- docs/specs/revamp-2026-09.md Operating Rule 9 and docs/specs/phase4-generators.md §4: a substance
-- carrying a Singapore Misuse of Drugs Act or Poisons Act schedule, a United States DEA schedule or
-- an Australian Poisons Standard Schedule 8 or 9 entry renders regulatory status, pharmacology,
-- mechanism and interaction evidence, and never dose, timing, route, frequency or combination text.
--
-- The generator has no code path that writes one (scripts/corpus-20k/questions/derive.ts withholds
-- the four blocks before a page is rendered, and scripts/revamp/page_text_v5.ts asserts it). This is
-- the second lock, in the database, so a future loader cannot put one there by accident: the four
-- blocks are seeds 1 (bioavailability gap), 2 (n-of-1 designability) and 6 (time-to-signal), and the
-- `dose-studied` question block, which quotes a recorded dose and asks how long it ran.
--
-- Enforced from both sides, exactly as migration 0024 enforces R2: the child row cannot be written
-- for a controlled page, and a page cannot be marked controlled while it still holds one. The loader
-- deletes a page's child rows before it upserts the page, so a page that becomes controlled drops
-- its withheld blocks in the same transaction rather than failing.

CREATE OR REPLACE FUNCTION rnawiki_guard_suppressed_page_seed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  page_is_suppressed boolean;
  page_is_controlled boolean;
BEGIN
  IF NEW.seed NOT IN (1, 2, 6) THEN
    RETURN NEW;
  END IF;

  SELECT suppressed, controlled INTO page_is_suppressed, page_is_controlled
  FROM corpus_pages WHERE key = NEW.key;

  IF COALESCE(page_is_suppressed, false) THEN
    RAISE EXCEPTION
      'seed % cannot be stored for suppressed page %: R2 removes seeds 1, 2 and 6 absolutely',
      NEW.seed, NEW.key
      USING ERRCODE = '23514';
  END IF;

  IF COALESCE(page_is_controlled, false) THEN
    RAISE EXCEPTION
      'seed % cannot be stored for controlled-substance page %: a page carrying a controlled-substance schedule holds no dose, bioavailability, self-experiment design or time-to-signal block',
      NEW.seed, NEW.key
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_controlled_page_question()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  page_is_controlled boolean;
BEGIN
  IF NEW.block NOT IN ('dose-studied', 'bioavailability', 'n-of-1', 'time-to-signal') THEN
    RETURN NEW;
  END IF;

  SELECT controlled INTO page_is_controlled FROM corpus_pages WHERE key = NEW.key;

  IF COALESCE(page_is_controlled, false) THEN
    RAISE EXCEPTION
      'question block "%" cannot be stored for controlled-substance page %: a page carrying a controlled-substance schedule holds no dose, bioavailability, self-experiment design or time-to-signal block',
      NEW.block, NEW.key
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER page_questions_controlled_guard
BEFORE INSERT OR UPDATE ON page_questions
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_controlled_page_question();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_page_controlled_blocks()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  forbidden_seed integer;
  forbidden_block varchar;
BEGIN
  SELECT seed INTO forbidden_seed
  FROM page_seeds
  WHERE key = NEW.key AND seed IN (1, 2, 6)
  LIMIT 1;

  IF forbidden_seed IS NOT NULL THEN
    RAISE EXCEPTION
      'page % cannot be marked controlled while it holds seed %: delete the seed row first',
      NEW.key, forbidden_seed
      USING ERRCODE = '23514';
  END IF;

  SELECT block INTO forbidden_block
  FROM page_questions
  WHERE key = NEW.key
    AND block IN ('dose-studied', 'bioavailability', 'n-of-1', 'time-to-signal')
  LIMIT 1;

  IF forbidden_block IS NOT NULL THEN
    RAISE EXCEPTION
      'page % cannot be marked controlled while it holds the "%" block: delete the question row first',
      NEW.key, forbidden_block
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER corpus_pages_controlled_guard
BEFORE INSERT OR UPDATE ON corpus_pages
FOR EACH ROW WHEN (NEW.controlled) EXECUTE FUNCTION rnawiki_guard_page_controlled_blocks();
