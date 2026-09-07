ALTER TABLE "page_questions" ADD COLUMN "values" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "page_questions" ADD COLUMN "sources" jsonb DEFAULT '[]'::jsonb NOT NULL;