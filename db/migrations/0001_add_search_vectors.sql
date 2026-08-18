-- Search support (lib/search.ts): pg_trgm for typo-tolerant / alias matching, plus generated
-- tsvector columns + GIN indexes for full-text search. No external service, no vector DB.
--
-- drizzle-kit cannot emit CREATE EXTENSION / CREATE FUNCTION on its own (they aren't part of the
-- schema.ts DSL), so this file is `drizzle-kit generate`'s output hand-edited to add the two
-- statements below before the generated columns that depend on them. Everything else in this
-- file is what `npx drizzle-kit generate` produced from db/schema.ts unmodified.

CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint

-- jsonb_text_agg: flattens a jsonb array of strings (entities.aliases) into a single
-- space-joined text value, e.g. '["BPC 157", "PL 14736"]' -> 'BPC 157 PL 14736'. Marked
-- IMMUTABLE so it can be used inside a generated column expression and an expression index.
-- jsonb_array_elements_text is itself IMMUTABLE, so this holds.
CREATE OR REPLACE FUNCTION jsonb_text_agg(j jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT coalesce(string_agg(value, ' '), '') FROM jsonb_array_elements_text(coalesce(j, '[]'::jsonb));
$$;--> statement-breakpoint

ALTER TABLE "claims" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce(consumer_question, '') || ' ' || coalesce(direct_answer, ''))) STORED;--> statement-breakpoint
ALTER TABLE "entities" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce(canonical_name, '') || ' ' || jsonb_text_agg(aliases))) STORED;--> statement-breakpoint
CREATE INDEX "claims_search_vector_idx" ON "claims" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "claims_consumer_question_trgm_idx" ON "claims" USING gin ("consumer_question" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "entities_search_vector_idx" ON "entities" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "entities_canonical_name_trgm_idx" ON "entities" USING gin ("canonical_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "entities_aliases_trgm_idx" ON "entities" USING gin ((jsonb_text_agg("aliases")) gin_trgm_ops);
