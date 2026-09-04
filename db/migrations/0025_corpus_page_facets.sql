ALTER TABLE "corpus_pages" ADD COLUMN "atc_codes" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "corpus_pages" ADD COLUMN "entity_class" text;--> statement-breakpoint
ALTER TABLE "corpus_pages" ADD COLUMN "top_rung" text;--> statement-breakpoint
ALTER TABLE "corpus_pages" ADD COLUMN "human_data" boolean;--> statement-breakpoint
ALTER TABLE "corpus_pages" ADD COLUMN "evidence_tier" text;