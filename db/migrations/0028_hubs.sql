CREATE TYPE "public"."corpus_hub_member_role" AS ENUM('approved', 'clinical', 'development', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."corpus_hub_type" AS ENUM('target', 'class', 'pathway');--> statement-breakpoint
CREATE TABLE "hub_members" (
	"hub_id" varchar(200) NOT NULL,
	"key" varchar(200) NOT NULL,
	"ordinal" integer NOT NULL,
	"member_role" "corpus_hub_member_role" NOT NULL,
	"membership_evidence" text NOT NULL,
	"approval_sg" text NOT NULL,
	"approval_us" text NOT NULL,
	"approval_au" text NOT NULL,
	"approval_uk" text NOT NULL,
	"approval_eu" text NOT NULL,
	"approval_jp" text NOT NULL,
	"approval_ca" text NOT NULL,
	"sg_forensic_class" text NOT NULL,
	"generic_available" text NOT NULL,
	"potency" text NOT NULL,
	"indications" text NOT NULL,
	"indication_count" integer NOT NULL,
	"withdrawn_reason" text NOT NULL,
	"withdrawn_where" text NOT NULL,
	"trials_count" integer NOT NULL,
	"results_posted_share" text NOT NULL,
	"tier" integer NOT NULL,
	"first_question" text NOT NULL,
	CONSTRAINT "hub_members_hub_key_pk" PRIMARY KEY("hub_id","key"),
	CONSTRAINT "hub_members_ordinal" CHECK ("hub_members"."ordinal" >= 0),
	CONSTRAINT "hub_members_tier" CHECK ("hub_members"."tier" between 0 and 3),
	CONSTRAINT "hub_members_trials" CHECK ("hub_members"."trials_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "hub_syntheses" (
	"hub_id" varchar(200) NOT NULL,
	"ordinal" integer NOT NULL,
	"template_id" varchar(4) NOT NULL,
	"sentence" text NOT NULL,
	"provenance" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "hub_syntheses_hub_ordinal_pk" PRIMARY KEY("hub_id","ordinal"),
	CONSTRAINT "hub_syntheses_ordinal" CHECK ("hub_syntheses"."ordinal" >= 0),
	CONSTRAINT "hub_syntheses_template" CHECK ("hub_syntheses"."template_id" in ('H1','H2','H3','H4','H5','H6','H7')),
	CONSTRAINT "hub_syntheses_sentence_nonempty" CHECK (nullif(btrim("hub_syntheses"."sentence"), '') is not null)
);
--> statement-breakpoint
CREATE TABLE "hubs" (
	"hub_id" varchar(200) PRIMARY KEY NOT NULL,
	"type" "corpus_hub_type" NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(200) NOT NULL,
	"definition" text NOT NULL,
	"definition_source" text NOT NULL,
	"member_count" integer NOT NULL,
	"approved_count" integer NOT NULL,
	"relevance" numeric(4, 2) NOT NULL,
	"rank_score" numeric(10, 2) NOT NULL,
	"first_batch" boolean DEFAULT false NOT NULL,
	CONSTRAINT "hubs_type_slug_unique" UNIQUE("type","slug"),
	CONSTRAINT "hubs_member_count" CHECK ("hubs"."member_count" >= 5),
	CONSTRAINT "hubs_approved_count" CHECK ("hubs"."approved_count" >= 0),
	CONSTRAINT "hubs_slug_shape" CHECK ("hubs"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
ALTER TABLE "hub_members" ADD CONSTRAINT "hub_members_hub_id_hubs_hub_id_fk" FOREIGN KEY ("hub_id") REFERENCES "public"."hubs"("hub_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hub_members" ADD CONSTRAINT "hub_members_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hub_syntheses" ADD CONSTRAINT "hub_syntheses_hub_id_hubs_hub_id_fk" FOREIGN KEY ("hub_id") REFERENCES "public"."hubs"("hub_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hub_members_key_idx" ON "hub_members" USING btree ("key");--> statement-breakpoint
CREATE INDEX "hub_members_hub_ordinal_idx" ON "hub_members" USING btree ("hub_id","ordinal");--> statement-breakpoint
CREATE INDEX "hub_syntheses_template_idx" ON "hub_syntheses" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "hubs_type_name_idx" ON "hubs" USING btree ("type","name");--> statement-breakpoint
CREATE INDEX "hubs_rank_idx" ON "hubs" USING btree ("rank_score");