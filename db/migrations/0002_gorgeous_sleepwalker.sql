CREATE TYPE "public"."claim_event_type" AS ENUM('contradictory_result', 'null_result', 'safety_limited', 'exposure_or_delivery_limit', 'target_engagement_not_shown', 'target_engagement_shown_no_clinical_benefit', 'trial_design_limit', 'program_stopped_scientific', 'program_stopped_commercial', 'regulatory_or_safety_change', 'retraction_or_correction', 'other');--> statement-breakpoint
CREATE TYPE "public"."development_gate" AS ENUM('human_biology', 'intervention_direction', 'delivery_or_exposure', 'target_engagement', 'pathway_response', 'patient_selection', 'clinical_outcome', 'safety', 'trial_design', 'manufacturing', 'commercial', 'unknown');--> statement-breakpoint
CREATE TABLE "claim_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"claim_id" integer NOT NULL,
	"evidence_source_id" integer NOT NULL,
	"event_type" "claim_event_type" NOT NULL,
	"development_gate" "development_gate" NOT NULL,
	"plain_summary" text NOT NULL,
	"what_it_suggests" text NOT NULL,
	"what_it_does_not_establish" text NOT NULL,
	"event_date" timestamp with time zone,
	"display_priority" integer DEFAULT 0 NOT NULL,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "claim_events" ADD CONSTRAINT "claim_events_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_events" ADD CONSTRAINT "claim_events_evidence_source_id_evidence_sources_id_fk" FOREIGN KEY ("evidence_source_id") REFERENCES "public"."evidence_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "claim_events_claim_idx" ON "claim_events" USING btree ("claim_id","display_priority");--> statement-breakpoint
CREATE INDEX "claim_events_status_idx" ON "claim_events" USING btree ("publication_status");--> statement-breakpoint
CREATE INDEX "evidence_changes_claim_idx" ON "evidence_changes" USING btree ("claim_id");