CREATE TABLE "page_registry_aggregate" (
	"key" varchar(200) PRIMARY KEY NOT NULL,
	"aggregate" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "corpus_pages" ADD COLUMN "present_applicable_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "page_patent" ADD COLUMN "absence" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "page_registration" ADD COLUMN "absence" varchar(32);--> statement-breakpoint
ALTER TABLE "page_registry_aggregate" ADD CONSTRAINT "page_registry_aggregate_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corpus_pages" ADD CONSTRAINT "corpus_pages_present_applicable_count" CHECK ("corpus_pages"."present_applicable_count" >= 0 and "corpus_pages"."present_applicable_count" <= "corpus_pages"."present_field_count");