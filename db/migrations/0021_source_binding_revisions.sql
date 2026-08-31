ALTER TABLE "background_source_bindings" ADD COLUMN "source_version" text;--> statement-breakpoint
ALTER TABLE "background_source_bindings" ADD COLUMN "source_effective_date" text;--> statement-breakpoint
ALTER TABLE "background_source_bindings" ADD CONSTRAINT "background_source_bindings_source_revision_copy" CHECK (("background_source_bindings"."source_version" is null or (
          nullif(btrim("background_source_bindings"."source_version"), '') is not null
          and char_length("background_source_bindings"."source_version") <= 2000
        ))
        and ("background_source_bindings"."source_effective_date" is null or (
          nullif(btrim("background_source_bindings"."source_effective_date"), '') is not null
          and char_length("background_source_bindings"."source_effective_date") <= 2000
        )));
