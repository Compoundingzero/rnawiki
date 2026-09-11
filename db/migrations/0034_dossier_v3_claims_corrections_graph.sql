CREATE TYPE "public"."graph_edge_origin" AS ENUM('verified', 'recorded', 'predicted');--> statement-breakpoint
CREATE TYPE "public"."graph_node_type" AS ENUM('substance', 'ingredient', 'botanical', 'salt', 'isomer', 'metabolite', 'formulation', 'product', 'combination', 'class', 'external_identifier', 'gene', 'protein', 'receptor', 'enzyme', 'rna_target', 'cell_type', 'tissue', 'organ', 'pathway', 'biological_process', 'biomarker', 'phenotype', 'condition', 'user_goal', 'claim', 'trial', 'study_arm', 'regimen', 'population', 'outcome', 'result', 'publication', 'regulatory_document', 'source_snapshot', 'reviewer', 'correction', 'model_version', 'adverse_event', 'interaction', 'lab_test', 'procedure');--> statement-breakpoint
CREATE TYPE "public"."v3_causality_level" AS ENUM('causal_randomized', 'causal_controlled', 'associational', 'mechanistic', 'anecdotal', 'predicted', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."v3_claim_kind" AS ENUM('effect', 'mechanism_stage', 'safety', 'interaction', 'regulatory_fact', 'recorded_use', 'identity_fact', 'unknown_statement');--> statement-breakpoint
CREATE TYPE "public"."v3_completion_state" AS ENUM('verified_evidence_present', 'no_qualifying_evidence_after_search', 'not_applicable', 'ambiguous_quarantined', 'awaiting_human_review', 'source_unavailable', 'legally_unavailable', 'pipeline_failure');--> statement-breakpoint
CREATE TYPE "public"."v3_contradiction_state" AS ENUM('none_found', 'contradicted', 'mixed', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."v3_effect_direction" AS ENUM('increase', 'decrease', 'no_change', 'mixed', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."v3_evidence_class" AS ENUM('regulatory_label', 'randomized_trial', 'controlled_trial', 'uncontrolled_human_study', 'observational', 'mechanism_study', 'spontaneous_report', 'case_report', 'community_anecdote', 'model_prediction');--> statement-breakpoint
CREATE TYPE "public"."v3_outcome_class" AS ENUM('clinical_event', 'function_performance', 'symptom_quality_of_life', 'biomarker_surrogate', 'mechanistic_measurement', 'safety_tolerability', 'longevity_mortality', 'unknown_outcome');--> statement-breakpoint
CREATE TYPE "public"."v3_reviewer_state" AS ENUM('draft', 'awaiting_review', 'reviewed', 'rejected', 'superseded', 'retracted');--> statement-breakpoint
CREATE TYPE "public"."v3_trial_role" AS ENUM('experimental_intervention', 'active_comparator', 'placebo', 'background_therapy', 'rescue_therapy', 'concomitant_medication', 'eligibility_criterion', 'exclusion_criterion', 'outcome_measurement', 'mention_only', 'observational_exposure', 'administered_role_unclear', 'unclear');--> statement-breakpoint
CREATE TYPE "public"."v3_uncertainty_level" AS ENUM('low', 'moderate', 'high', 'unknown');--> statement-breakpoint
CREATE TABLE "dossier_field_states" (
	"key" varchar(200) NOT NULL,
	"field" varchar(64) NOT NULL,
	"state" "v3_completion_state" NOT NULL,
	"claim_id" varchar(64),
	"basis" text NOT NULL,
	"sources_checked" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"resolver_version" varchar(120) NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dossier_field_states_pk" PRIMARY KEY("key","field"),
	CONSTRAINT "dossier_field_states_verified_has_claim" CHECK ("dossier_field_states"."state" <> 'verified_evidence_present' or "dossier_field_states"."claim_id" is not null),
	CONSTRAINT "dossier_field_states_basis_nonempty" CHECK (nullif(btrim("dossier_field_states"."basis"), '') is not null)
);
--> statement-breakpoint
CREATE TABLE "entity_corrections" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"subject_kind" varchar(32) NOT NULL,
	"subject_key" varchar(200),
	"subject_ref" text NOT NULL,
	"action" varchar(48) NOT NULL,
	"before" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"after" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"reason" text NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"decided_by_user_id" varchar(64),
	"operator" varchar(160),
	"rule_or_classifier_version" varchar(120),
	"graph_version" varchar(64),
	"accepted" boolean DEFAULT true NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entity_corrections_id_digest" CHECK ("entity_corrections"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "entity_corrections_decider" CHECK ("entity_corrections"."decided_by_user_id" is not null or nullif(btrim("entity_corrections"."operator"), '') is not null),
	CONSTRAINT "entity_corrections_reason_nonempty" CHECK (nullif(btrim("entity_corrections"."reason"), '') is not null)
);
--> statement-breakpoint
CREATE TABLE "graph_edges" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"layer" varchar(16) NOT NULL,
	"edge_type" varchar(48) NOT NULL,
	"src_id" varchar(240) NOT NULL,
	"dst_id" varchar(240) NOT NULL,
	"directed" boolean DEFAULT true NOT NULL,
	"polarity" "v3_effect_direction",
	"species" varchar(80),
	"cell_or_tissue_context" text,
	"population" text,
	"condition_or_goal" text,
	"dose_as_studied" text,
	"route" varchar(80),
	"frequency" text,
	"duration" text,
	"comparator" text,
	"outcome" text,
	"effect_value" numeric(30, 10),
	"effect_unit" varchar(80),
	"ci_low" numeric(30, 10),
	"ci_high" numeric(30, 10),
	"absolute_events" jsonb,
	"study_design" "v3_evidence_class",
	"trial_role" "v3_trial_role",
	"source_snapshot_id" varchar(64),
	"source_locator" text,
	"extraction_confidence" numeric(5, 4),
	"origin" "graph_edge_origin" NOT NULL,
	"rule_or_model_id" varchar(120),
	"review_state" "v3_reviewer_state" DEFAULT 'draft' NOT NULL,
	"graph_version" varchar(64) NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_to" timestamp with time zone,
	"deprecated_reason" text,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "graph_edges_id_digest" CHECK ("graph_edges"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "graph_edges_not_self" CHECK ("graph_edges"."src_id" <> "graph_edges"."dst_id"),
	CONSTRAINT "graph_edges_layer" CHECK ("graph_edges"."layer" in ('identity', 'mechanism', 'evidence', 'safety')),
	CONSTRAINT "graph_edges_predicted_has_rule" CHECK ("graph_edges"."origin" <> 'predicted' or "graph_edges"."rule_or_model_id" is not null),
	CONSTRAINT "graph_edges_verified_is_reviewed" CHECK ("graph_edges"."origin" <> 'verified' or "graph_edges"."review_state" = 'reviewed'),
	CONSTRAINT "graph_edges_confidence_range" CHECK ("graph_edges"."extraction_confidence" is null or ("graph_edges"."extraction_confidence" >= 0 and "graph_edges"."extraction_confidence" <= 1)),
	CONSTRAINT "graph_edges_valid_window" CHECK ("graph_edges"."valid_to" is null or "graph_edges"."valid_to" >= "graph_edges"."valid_from")
);
--> statement-breakpoint
CREATE TABLE "graph_nodes" (
	"id" varchar(240) PRIMARY KEY NOT NULL,
	"node_type" "graph_node_type" NOT NULL,
	"label" text NOT NULL,
	"corpus_key" varchar(200),
	"identifiers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"graph_version" varchar(64) NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_to" timestamp with time zone,
	"deprecated_reason" text
);
--> statement-breakpoint
CREATE TABLE "graph_versions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"corpus_snapshot" text NOT NULL,
	"identity_gate_passed" boolean DEFAULT false NOT NULL,
	"completion_gate_passed" boolean DEFAULT false NOT NULL,
	"node_count" integer DEFAULT 0 NOT NULL,
	"edge_count" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "graph_versions_id_digest" CHECK ("graph_versions"."id" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "model_versions" (
	"id" varchar(120) PRIMARY KEY NOT NULL,
	"family" varchar(32) NOT NULL,
	"task" varchar(64) NOT NULL,
	"trained_on_graph_version" varchar(64),
	"eval_set_id" varchar(120),
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"calibration_state" varchar(32) DEFAULT 'uncalibrated' NOT NULL,
	"card_path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "model_versions_family" CHECK ("model_versions"."family" in ('rules', 'lexical', 'embedding', 'distmult', 'complex', 'rotate', 'rgcn', 'hgt'))
);
--> statement-breakpoint
CREATE TABLE "page_registry_role_aggregates" (
	"key" varchar(200) PRIMARY KEY NOT NULL,
	"aggregate" jsonb NOT NULL,
	"classifier_version" varchar(64) NOT NULL,
	"snapshot_date" date NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_trial_roles" (
	"key" varchar(200) NOT NULL,
	"nct" varchar(16) NOT NULL,
	"role" "v3_trial_role" NOT NULL,
	"basis" text NOT NULL,
	"administered" boolean NOT NULL,
	"supports_tested_claim" boolean NOT NULL,
	"synonym_matched" boolean DEFAULT false NOT NULL,
	"excluded_from_size_statistics" boolean DEFAULT false NOT NULL,
	"completion_is_planned" boolean DEFAULT false NOT NULL,
	"reviewed_by_user_id" varchar(64),
	"classifier_version" varchar(64) NOT NULL,
	"snapshot_date" date NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_trial_roles_pk" PRIMARY KEY("key","nct"),
	CONSTRAINT "page_trial_roles_nct_shape" CHECK ("page_trial_roles"."nct" ~ '^NCT[0-9]{8}$'),
	CONSTRAINT "page_trial_roles_tested_only_experimental" CHECK ("page_trial_roles"."supports_tested_claim" = false or "page_trial_roles"."role" = 'experimental_intervention')
);
--> statement-breakpoint
CREATE TABLE "predicted_edges" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"model_version" varchar(120) NOT NULL,
	"graph_version" varchar(64) NOT NULL,
	"task" varchar(64) NOT NULL,
	"src_id" varchar(240) NOT NULL,
	"dst_id" varchar(240) NOT NULL,
	"edge_type" varchar(48) NOT NULL,
	"score" numeric(10, 6) NOT NULL,
	"calibrated_probability" numeric(10, 6),
	"calibration_state" varchar(32) DEFAULT 'uncalibrated' NOT NULL,
	"supporting_subgraph" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"contradicting_subgraph" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"reasons" text[] DEFAULT '{}'::text[] NOT NULL,
	"candidate_correction" jsonb,
	"review_state" "v3_reviewer_state" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "predicted_edges_id_digest" CHECK ("predicted_edges"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "predicted_edges_probability_range" CHECK ("predicted_edges"."calibrated_probability" is null or ("predicted_edges"."calibrated_probability" >= 0 and "predicted_edges"."calibrated_probability" <= 1))
);
--> statement-breakpoint
CREATE TABLE "reviewed_claims" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"subject_key" varchar(200) NOT NULL,
	"kind" "v3_claim_kind" NOT NULL,
	"predicate" varchar(80) NOT NULL,
	"object_text" text NOT NULL,
	"plain_language_version" text NOT NULL,
	"technical_version" text NOT NULL,
	"analogy" text,
	"analogy_breaks" text,
	"evidence_class" "v3_evidence_class" NOT NULL,
	"outcome_class" "v3_outcome_class" NOT NULL,
	"applicable_population" text NOT NULL,
	"indication_or_goal" varchar(160) NOT NULL,
	"formulation" text,
	"route" varchar(80),
	"dose_as_studied" text,
	"duration" text,
	"comparator" text,
	"direction" "v3_effect_direction" NOT NULL,
	"effect_estimate" text,
	"effect_value" numeric(30, 10),
	"effect_unit" varchar(80),
	"absolute_effect" text,
	"ci_low" numeric(30, 10),
	"ci_high" numeric(30, 10),
	"ci_level" numeric(5, 2),
	"study_design" text,
	"causality" "v3_causality_level" NOT NULL,
	"uncertainty" "v3_uncertainty_level" NOT NULL,
	"uncertainty_reasons" text[] DEFAULT '{}'::text[] NOT NULL,
	"source_snapshot_ids" text[] NOT NULL,
	"source_locators" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"contradiction_state" "v3_contradiction_state" DEFAULT 'unknown' NOT NULL,
	"reviewer_state" "v3_reviewer_state" DEFAULT 'draft' NOT NULL,
	"structure" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"risk_tier" varchar(16) DEFAULT 'standard' NOT NULL,
	"content_version" integer DEFAULT 1 NOT NULL,
	"supersedes_claim_id" varchar(64),
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_to" timestamp with time zone,
	"last_checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"authored_by_user_id" varchar(64),
	"reviewed_by_user_id" varchar(64),
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviewed_claims_id_digest" CHECK ("reviewed_claims"."id" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "reviewed_claims_one_source" CHECK (cardinality("reviewed_claims"."source_snapshot_ids") >= 1),
	CONSTRAINT "reviewed_claims_version_positive" CHECK ("reviewed_claims"."content_version" >= 1),
	CONSTRAINT "reviewed_claims_analogy_breaks" CHECK ("reviewed_claims"."analogy" is null or nullif(btrim("reviewed_claims"."analogy_breaks"), '') is not null),
	CONSTRAINT "reviewed_claims_uncertainty_reasons" CHECK ("reviewed_claims"."uncertainty" = 'low' or cardinality("reviewed_claims"."uncertainty_reasons") >= 1),
	CONSTRAINT "reviewed_claims_reviewed_has_reviewer" CHECK ("reviewed_claims"."reviewer_state" <> 'reviewed' or ("reviewed_claims"."reviewed_by_user_id" is not null and "reviewed_claims"."reviewed_at" is not null)),
	CONSTRAINT "reviewed_claims_reviewer_not_author" CHECK ("reviewed_claims"."reviewed_by_user_id" is null or "reviewed_claims"."authored_by_user_id" is null or "reviewed_claims"."reviewed_by_user_id" <> "reviewed_claims"."authored_by_user_id"),
	CONSTRAINT "reviewed_claims_risk_tier" CHECK ("reviewed_claims"."risk_tier" in ('standard', 'elevated', 'high'))
);
--> statement-breakpoint
ALTER TABLE "dossier_field_states" ADD CONSTRAINT "dossier_field_states_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossier_field_states" ADD CONSTRAINT "dossier_field_states_claim_id_reviewed_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."reviewed_claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_corrections" ADD CONSTRAINT "entity_corrections_decided_by_user_id_users_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "graph_edges" ADD CONSTRAINT "graph_edges_src_id_graph_nodes_id_fk" FOREIGN KEY ("src_id") REFERENCES "public"."graph_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "graph_edges" ADD CONSTRAINT "graph_edges_dst_id_graph_nodes_id_fk" FOREIGN KEY ("dst_id") REFERENCES "public"."graph_nodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "graph_edges" ADD CONSTRAINT "graph_edges_source_snapshot_id_source_snapshots_id_fk" FOREIGN KEY ("source_snapshot_id") REFERENCES "public"."source_snapshots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "graph_edges" ADD CONSTRAINT "graph_edges_graph_version_graph_versions_id_fk" FOREIGN KEY ("graph_version") REFERENCES "public"."graph_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "graph_nodes" ADD CONSTRAINT "graph_nodes_corpus_key_corpus_pages_key_fk" FOREIGN KEY ("corpus_key") REFERENCES "public"."corpus_pages"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "graph_nodes" ADD CONSTRAINT "graph_nodes_graph_version_graph_versions_id_fk" FOREIGN KEY ("graph_version") REFERENCES "public"."graph_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_versions" ADD CONSTRAINT "model_versions_trained_on_graph_version_graph_versions_id_fk" FOREIGN KEY ("trained_on_graph_version") REFERENCES "public"."graph_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_registry_role_aggregates" ADD CONSTRAINT "page_registry_role_aggregates_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_trial_roles" ADD CONSTRAINT "page_trial_roles_key_corpus_pages_key_fk" FOREIGN KEY ("key") REFERENCES "public"."corpus_pages"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_trial_roles" ADD CONSTRAINT "page_trial_roles_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predicted_edges" ADD CONSTRAINT "predicted_edges_model_version_model_versions_id_fk" FOREIGN KEY ("model_version") REFERENCES "public"."model_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predicted_edges" ADD CONSTRAINT "predicted_edges_graph_version_graph_versions_id_fk" FOREIGN KEY ("graph_version") REFERENCES "public"."graph_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviewed_claims" ADD CONSTRAINT "reviewed_claims_subject_key_corpus_pages_key_fk" FOREIGN KEY ("subject_key") REFERENCES "public"."corpus_pages"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviewed_claims" ADD CONSTRAINT "reviewed_claims_authored_by_user_id_users_id_fk" FOREIGN KEY ("authored_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviewed_claims" ADD CONSTRAINT "reviewed_claims_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dossier_field_states_state_idx" ON "dossier_field_states" USING btree ("state");--> statement-breakpoint
CREATE INDEX "entity_corrections_subject_idx" ON "entity_corrections" USING btree ("subject_kind","subject_key");--> statement-breakpoint
CREATE INDEX "entity_corrections_recorded_idx" ON "entity_corrections" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "graph_edges_src_idx" ON "graph_edges" USING btree ("src_id","edge_type");--> statement-breakpoint
CREATE INDEX "graph_edges_dst_idx" ON "graph_edges" USING btree ("dst_id","edge_type");--> statement-breakpoint
CREATE INDEX "graph_edges_snapshot_idx" ON "graph_edges" USING btree ("source_snapshot_id");--> statement-breakpoint
CREATE INDEX "graph_edges_version_idx" ON "graph_edges" USING btree ("graph_version");--> statement-breakpoint
CREATE INDEX "graph_nodes_type_idx" ON "graph_nodes" USING btree ("node_type");--> statement-breakpoint
CREATE INDEX "graph_nodes_corpus_key_idx" ON "graph_nodes" USING btree ("corpus_key");--> statement-breakpoint
CREATE INDEX "graph_nodes_version_idx" ON "graph_nodes" USING btree ("graph_version");--> statement-breakpoint
CREATE INDEX "page_trial_roles_nct_idx" ON "page_trial_roles" USING btree ("nct");--> statement-breakpoint
CREATE INDEX "page_trial_roles_role_idx" ON "page_trial_roles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "predicted_edges_task_idx" ON "predicted_edges" USING btree ("task","review_state");--> statement-breakpoint
CREATE INDEX "predicted_edges_src_idx" ON "predicted_edges" USING btree ("src_id");--> statement-breakpoint
CREATE INDEX "reviewed_claims_subject_idx" ON "reviewed_claims" USING btree ("subject_key","kind");--> statement-breakpoint
CREATE INDEX "reviewed_claims_state_idx" ON "reviewed_claims" USING btree ("reviewer_state");--> statement-breakpoint
CREATE INDEX "reviewed_claims_goal_idx" ON "reviewed_claims" USING btree ("indication_or_goal");--> statement-breakpoint
CREATE OR REPLACE FUNCTION entity_corrections_append_only() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'entity_corrections is append-only; record a new correction instead';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER entity_corrections_immutable
BEFORE UPDATE OR DELETE ON "entity_corrections"
FOR EACH ROW EXECUTE FUNCTION entity_corrections_append_only();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION reviewed_claims_frozen_once_reviewed() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'reviewed_claims rows are never deleted; supersede or retract the claim instead';
  END IF;
  IF OLD.reviewer_state = 'reviewed' THEN
    -- A reviewed claim's content is frozen. Only its lifecycle columns may move, and only forward.
    IF NEW.subject_key IS DISTINCT FROM OLD.subject_key
      OR NEW.kind IS DISTINCT FROM OLD.kind
      OR NEW.predicate IS DISTINCT FROM OLD.predicate
      OR NEW.object_text IS DISTINCT FROM OLD.object_text
      OR NEW.plain_language_version IS DISTINCT FROM OLD.plain_language_version
      OR NEW.technical_version IS DISTINCT FROM OLD.technical_version
      OR NEW.analogy IS DISTINCT FROM OLD.analogy
      OR NEW.analogy_breaks IS DISTINCT FROM OLD.analogy_breaks
      OR NEW.evidence_class IS DISTINCT FROM OLD.evidence_class
      OR NEW.outcome_class IS DISTINCT FROM OLD.outcome_class
      OR NEW.applicable_population IS DISTINCT FROM OLD.applicable_population
      OR NEW.indication_or_goal IS DISTINCT FROM OLD.indication_or_goal
      OR NEW.formulation IS DISTINCT FROM OLD.formulation
      OR NEW.route IS DISTINCT FROM OLD.route
      OR NEW.dose_as_studied IS DISTINCT FROM OLD.dose_as_studied
      OR NEW.duration IS DISTINCT FROM OLD.duration
      OR NEW.comparator IS DISTINCT FROM OLD.comparator
      OR NEW.direction IS DISTINCT FROM OLD.direction
      OR NEW.effect_estimate IS DISTINCT FROM OLD.effect_estimate
      OR NEW.effect_value IS DISTINCT FROM OLD.effect_value
      OR NEW.effect_unit IS DISTINCT FROM OLD.effect_unit
      OR NEW.absolute_effect IS DISTINCT FROM OLD.absolute_effect
      OR NEW.ci_low IS DISTINCT FROM OLD.ci_low
      OR NEW.ci_high IS DISTINCT FROM OLD.ci_high
      OR NEW.ci_level IS DISTINCT FROM OLD.ci_level
      OR NEW.study_design IS DISTINCT FROM OLD.study_design
      OR NEW.causality IS DISTINCT FROM OLD.causality
      OR NEW.uncertainty IS DISTINCT FROM OLD.uncertainty
      OR NEW.uncertainty_reasons IS DISTINCT FROM OLD.uncertainty_reasons
      OR NEW.source_snapshot_ids IS DISTINCT FROM OLD.source_snapshot_ids
      OR NEW.source_locators IS DISTINCT FROM OLD.source_locators
      OR NEW.structure IS DISTINCT FROM OLD.structure
      OR NEW.risk_tier IS DISTINCT FROM OLD.risk_tier
      OR NEW.content_version IS DISTINCT FROM OLD.content_version
      OR NEW.authored_by_user_id IS DISTINCT FROM OLD.authored_by_user_id
      OR NEW.reviewed_by_user_id IS DISTINCT FROM OLD.reviewed_by_user_id
      OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
      OR NEW.created_at IS DISTINCT FROM OLD.created_at
    THEN
      RAISE EXCEPTION 'reviewed claim % is frozen; create a new content version that supersedes it', OLD.id;
    END IF;
    IF NEW.reviewer_state NOT IN ('reviewed', 'superseded', 'retracted') THEN
      RAISE EXCEPTION 'a reviewed claim may only move to superseded or retracted';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER reviewed_claims_frozen
BEFORE UPDATE OR DELETE ON "reviewed_claims"
FOR EACH ROW EXECUTE FUNCTION reviewed_claims_frozen_once_reviewed();
