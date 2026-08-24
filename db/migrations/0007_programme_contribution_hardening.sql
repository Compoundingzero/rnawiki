-- RNAWiki contribution hardening after the deployed 0006 review workflow.
--
-- Rollback notes: these functions and triggers do not add or rewrite medical data. Rolling back
-- removes the lineage/integrity triggers and restores the 0006 guard function definitions, but
-- immutable decisions created while 0007 was active must still be exported and retained.
CREATE OR REPLACE FUNCTION rnawiki_lock_programme_contribution_lineage(
  target_programme_id varchar,
  target_proposal_key varchar
)
RETURNS void
LANGUAGE sql
VOLATILE
STRICT
AS $$
  SELECT pg_advisory_xact_lock(
    hashtextextended(target_programme_id || chr(31) || target_proposal_key, 0)
  )
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_programme_contribution_submission_payload(
  proposal programme_contribution_proposals
)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT jsonb_build_object(
    'version', 'rna-intelligence/contribution-submission-v1',
    'proposal', jsonb_build_object(
      'id', proposal.id,
      'proposalKey', proposal.proposal_key,
      'revisionNumber', proposal.revision_number,
      'previousProposalId', proposal.previous_proposal_id,
      'programmeId', proposal.programme_id,
      'authorUserId', proposal.author_user_id,
      'proposalType', proposal.proposal_type,
      'selectedField', proposal.selected_field,
      'proposedText', proposal.proposed_text,
      'proposedValue', proposal.proposed_value,
      'sourceType', proposal.source_type,
      'sourceLocator', proposal.source_locator,
      'sourceIdentifier', proposal.source_identifier,
      'claimNature', proposal.claim_nature,
      'evidenceNodeId', proposal.evidence_node_id,
      'proposedStoppedVerdict', proposal.proposed_stopped_verdict,
      'reasoning', proposal.reasoning,
      'whatWasWrongOrMissing', proposal.what_was_wrong_or_missing,
      'affects', proposal.affects,
      'conflictsOfInterest', proposal.conflicts_of_interest,
      'conflictsOfInterestAttested', proposal.conflicts_of_interest_attested
    ),
    'currentValueSnapshot', proposal.current_value_snapshot,
    'currentVerdictSnapshot', proposal.current_verdict_snapshot,
    'machineChecks', proposal.machine_checks,
    'impactPreview', proposal.impact_preview
  )
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_programme_contribution_digest_payload(payload jsonb)
RETURNS varchar
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT encode(sha256(convert_to(payload::text, 'UTF8')), 'hex')
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_programme_contribution_lineage_review()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  previous_review_status contribution_review_status;
BEGIN
  PERFORM rnawiki_lock_programme_contribution_lineage(NEW.programme_id, NEW.proposal_key);

  IF NEW.previous_proposal_id IS NOT NULL THEN
    SELECT status INTO previous_review_status
    FROM programme_contribution_review_states
    WHERE proposal_id = NEW.previous_proposal_id;

    IF previous_review_status NOT IN ('CHANGES_REQUESTED', 'REJECTED') THEN
      RAISE EXCEPTION 'a contribution revision requires a final CHANGES_REQUESTED or REJECTED predecessor';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'DRAFT' AND NEW.status = 'SUBMITTED' AND EXISTS (
    SELECT 1
    FROM programme_contribution_proposals older
    LEFT JOIN programme_contribution_review_states review_state
      ON review_state.proposal_id = older.id
    WHERE older.programme_id = NEW.programme_id
      AND older.proposal_key = NEW.proposal_key
      AND older.status = 'SUBMITTED'
      AND older.revision_number < NEW.revision_number
      AND (
        review_state.proposal_id IS NULL
        OR review_state.status NOT IN ('CHANGES_REQUESTED', 'REJECTED')
      )
  ) THEN
    RAISE EXCEPTION 'a contribution revision cannot supersede an unresolved or accepted predecessor';
  END IF;

  RETURN NEW;
END;
$$;--> statement-breakpoint

DROP TRIGGER IF EXISTS programme_contribution_lineage_review_guard_trigger
ON programme_contribution_proposals;--> statement-breakpoint
CREATE TRIGGER programme_contribution_lineage_review_guard_trigger
BEFORE INSERT OR UPDATE OF status ON programme_contribution_proposals
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_programme_contribution_lineage_review();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_programme_contribution_submission_integrity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  programme_row development_programmes%ROWTYPE;
  verdict_row programme_verdict_revisions%ROWTYPE;
  node_row evidence_nodes%ROWTYPE;
  authoritative_verdict_id varchar;
  expected_current_value jsonb;
  expected_digest varchar;
  expected_impact_count integer;
  expected_claim_ids jsonb;
  expected_surfaces jsonb;
  expected_highest_impact text;
  machine_code_count integer;
BEGIN
  IF TG_OP <> 'UPDATE' OR OLD.status <> 'DRAFT' OR NEW.status <> 'SUBMITTED' THEN
    RETURN NEW;
  END IF;

  PERFORM rnawiki_lock_programme_contribution_lineage(NEW.programme_id, NEW.proposal_key);

  SELECT * INTO programme_row
  FROM development_programmes
  WHERE id = NEW.programme_id
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'contribution submission programme is missing';
  END IF;

  SELECT verdict_revision_id INTO authoritative_verdict_id
  FROM programme_current_publications
  WHERE programme_id = NEW.programme_id
  FOR SHARE;
  IF NEW.current_verdict_revision_id IS DISTINCT FROM authoritative_verdict_id THEN
    RAISE EXCEPTION 'contribution verdict snapshot is not the authoritative current publication';
  END IF;
  IF (NEW.selected_field::text LIKE 'summary.%' OR NEW.selected_field::text LIKE 'verdict.%')
     AND authoritative_verdict_id IS NULL THEN
    RAISE EXCEPTION 'summary and verdict contributions require an authoritative current publication';
  END IF;

  IF authoritative_verdict_id IS NOT NULL THEN
    SELECT * INTO verdict_row
    FROM programme_verdict_revisions
    WHERE id = authoritative_verdict_id
      AND programme_id = NEW.programme_id
      AND review_status = 'PUBLISHED'
    FOR SHARE;
    IF NOT FOUND
       OR NEW.current_verdict_snapshot ->> 'id' IS DISTINCT FROM verdict_row.id
       OR NEW.current_verdict_snapshot ->> 'revisionNumber' IS DISTINCT FROM verdict_row.revision_number::text THEN
      RAISE EXCEPTION 'contribution current verdict snapshot does not match the published revision';
    END IF;
  ELSIF NEW.current_verdict_snapshot IS NOT NULL THEN
    RAISE EXCEPTION 'contribution cannot snapshot a verdict when no current publication exists';
  END IF;

  IF NEW.evidence_node_id IS NOT NULL THEN
    SELECT * INTO node_row
    FROM evidence_nodes
    WHERE id = NEW.evidence_node_id
      AND programme_id = NEW.programme_id
      AND review_status = 'PUBLISHED'
    FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'contribution evidence-node snapshot is outside the published programme graph';
    END IF;
  END IF;

  IF NEW.current_value_snapshot ->> 'version' IS DISTINCT FROM 'rna-intelligence/contribution-current-value-v1'
     OR NEW.current_value_snapshot ->> 'programmeId' IS DISTINCT FROM NEW.programme_id
     OR NEW.current_value_snapshot ->> 'programmeStatus' IS DISTINCT FROM programme_row.status::text
     OR NEW.current_value_snapshot ->> 'selectedField' IS DISTINCT FROM NEW.selected_field::text THEN
    RAISE EXCEPTION 'contribution current-value snapshot metadata is not authoritative';
  END IF;

  IF NEW.evidence_node_id IS NULL THEN
    IF NEW.current_value_snapshot -> 'evidenceNode' IS DISTINCT FROM 'null'::jsonb THEN
      RAISE EXCEPTION 'non-node contribution snapshot cannot claim an evidence node';
    END IF;
  ELSIF NEW.current_value_snapshot -> 'evidenceNode' ->> 'id' IS DISTINCT FROM node_row.id
     OR NEW.current_value_snapshot -> 'evidenceNode' ->> 'nodeType' IS DISTINCT FROM node_row.node_type::text
     OR NEW.current_value_snapshot -> 'evidenceNode' ->> 'revisionNumber' IS DISTINCT FROM node_row.revision_number::text THEN
    RAISE EXCEPTION 'contribution evidence-node snapshot metadata is stale or fabricated';
  END IF;

  expected_current_value := CASE NEW.selected_field::text
    WHEN 'programme.title' THEN to_jsonb(programme_row.title)
    WHEN 'programme.indication' THEN to_jsonb(programme_row.indication)
    WHEN 'programme.targetPopulation' THEN to_jsonb(programme_row.target_population)
    WHEN 'programme.status' THEN to_jsonb(programme_row.status)
    WHEN 'programme.highestPhaseReached' THEN to_jsonb(programme_row.highest_phase_reached)
    WHEN 'programme.route' THEN to_jsonb(programme_row.route)
    WHEN 'programme.doseExposureContext' THEN to_jsonb(programme_row.dose_exposure_context)
    WHEN 'programme.rawStoppingReason' THEN to_jsonb(programme_row.raw_stopping_reason)
    WHEN 'programme.stoppingReasonCategory' THEN to_jsonb(programme_row.stopping_reason_category)
    WHEN 'summary.plainMechanism' THEN to_jsonb(verdict_row.plain_mechanism)
    WHEN 'summary.bestSupportedFinding' THEN to_jsonb(verdict_row.best_supported_finding)
    WHEN 'summary.mainLimitation' THEN to_jsonb(verdict_row.main_limitation)
    WHEN 'verdict.verdictCode' THEN to_jsonb(verdict_row.verdict_code)
    WHEN 'verdict.publicLabel' THEN to_jsonb(verdict_row.public_label)
    WHEN 'verdict.professionalLabel' THEN to_jsonb(verdict_row.professional_label)
    WHEN 'verdict.oneSentenceReason' THEN to_jsonb(verdict_row.one_sentence_reason)
    WHEN 'verdict.scope.indication' THEN to_jsonb(verdict_row.indication_scope)
    WHEN 'verdict.scope.population' THEN to_jsonb(verdict_row.population_scope)
    WHEN 'verdict.scope.doseExposure' THEN to_jsonb(verdict_row.dose_exposure_scope)
    WHEN 'verdict.scope.period' THEN to_jsonb(verdict_row.period_scope)
    WHEN 'verdict.scope.trials' THEN to_jsonb(verdict_row.trial_scope)
    WHEN 'verdict.scope.outcome' THEN to_jsonb(verdict_row.outcome_scope)
    WHEN 'verdict.whatWasDisproven' THEN to_jsonb(verdict_row.what_was_disproven)
    WHEN 'verdict.whatWasNotDisproven' THEN to_jsonb(verdict_row.what_was_not_disproven)
    WHEN 'verdict.whatRemainsUnknown' THEN to_jsonb(verdict_row.what_remains_unknown)
    WHEN 'verdict.confidence' THEN to_jsonb(verdict_row.confidence)
    WHEN 'verdict.confidenceExplanation' THEN to_jsonb(verdict_row.confidence_explanation)
    WHEN 'verdict.conditionsThatWouldChangeVerdict' THEN to_jsonb(verdict_row.conditions_that_would_change_verdict)
    WHEN 'evidenceNode.state' THEN to_jsonb(node_row.state)
    WHEN 'evidenceNode.plainSummary' THEN to_jsonb(node_row.plain_summary)
    WHEN 'evidenceNode.professionalSummary' THEN to_jsonb(node_row.professional_summary)
    WHEN 'evidenceNode.rationale' THEN to_jsonb(node_row.rationale)
  END;
  expected_current_value := COALESCE(expected_current_value, 'null'::jsonb);
  IF NEW.current_value_snapshot -> 'value' IS DISTINCT FROM expected_current_value THEN
    RAISE EXCEPTION 'contribution current-value snapshot does not match persisted programme evidence';
  END IF;

  IF NEW.source_type = 'UNKNOWN'
     OR NEW.source_locator !~* '^https?://'
     OR NEW.claim_nature = 'UNKNOWN' THEN
    RAISE EXCEPTION 'contribution machine-pass fields fail deterministic source or claim-nature rules';
  END IF;
  IF NEW.selected_field = 'verdict.verdictCode'
     AND programme_row.status NOT IN ('STOPPED', 'WITHDRAWN') THEN
    RAISE EXCEPTION 'stopped-programme verdict target is invalid for the persisted programme status';
  END IF;

  IF NEW.machine_checks ->> 'version' IS DISTINCT FROM 'rna-intelligence/contribution-checks-v1'
     OR NEW.machine_checks ->> 'passed' IS DISTINCT FROM 'true'
     OR jsonb_typeof(NEW.machine_checks -> 'checks') IS DISTINCT FROM 'array'
     OR jsonb_array_length(NEW.machine_checks -> 'checks') <> 15 THEN
    RAISE EXCEPTION 'contribution machine-check bundle is not canonical';
  END IF;

  SELECT count(DISTINCT check_item ->> 'code') INTO machine_code_count
  FROM jsonb_array_elements(NEW.machine_checks -> 'checks') check_item;
  IF machine_code_count <> 15
     OR EXISTS (
       SELECT 1
       FROM jsonb_array_elements(NEW.machine_checks -> 'checks') check_item
       WHERE check_item ->> 'code' NOT IN (
         'selected_field_present', 'proposal_target_matches_type', 'evidence_node_scope',
         'current_verdict_available', 'proposed_content_present', 'proposed_value_shape',
         'source_complete', 'claim_nature_known', 'reasoning_complete',
         'conclusion_scope_declared', 'coi_attested', 'stopped_verdict_scope',
         'stopped_verdict_target', 'stopped_verdict_value_shape', 'dependency_graph_coverage'
       )
       OR (check_item ->> 'code' = 'dependency_graph_coverage'
           AND check_item ->> 'status' NOT IN ('PASS', 'WARN'))
       OR (check_item ->> 'code' <> 'dependency_graph_coverage'
           AND check_item ->> 'status' <> 'PASS')
     ) THEN
    RAISE EXCEPTION 'contribution machine-check results do not contain the canonical passing rule set';
  END IF;

  WITH matched AS MATERIALIZED (
    SELECT dependency.*,
      jsonb_build_object(
        'dependentSurfaceType', dependency.dependent_surface_type,
        'fieldPath', dependency.field_path,
        'evidenceNodeId', dependency.evidence_node_id,
        'verdictRevisionId', dependency.verdict_revision_id,
        'impactLevel', dependency.impact_level
      ) AS surface
    FROM programme_dependencies dependency
    WHERE dependency.programme_id = NEW.programme_id
      AND (
        (NEW.selected_field::text LIKE 'evidenceNode.%'
          AND dependency.evidence_node_id = NEW.evidence_node_id)
        OR ((NEW.selected_field::text LIKE 'summary.%' OR NEW.selected_field::text LIKE 'verdict.%')
          AND (
            (dependency.verdict_revision_id = authoritative_verdict_id
              AND dependency.field_path = NEW.selected_field::text)
            OR (NEW.proposal_type = 'VERDICT_CHALLENGE'
              AND dependency.evidence_node_id = NEW.evidence_node_id)
          ))
        OR ((NEW.selected_field::text NOT LIKE 'evidenceNode.%'
             AND NEW.selected_field::text NOT LIKE 'summary.%'
             AND NEW.selected_field::text NOT LIKE 'verdict.%')
          AND dependency.field_path = NEW.selected_field::text)
      )
  )
  SELECT
    count(*)::integer,
    COALESCE((
      SELECT jsonb_agg(claim_id ORDER BY claim_id)
      FROM (SELECT DISTINCT claim_id FROM matched) claims
    ), '[]'::jsonb),
    COALESCE((
      SELECT jsonb_agg(surface ORDER BY surface::text)
      FROM (SELECT DISTINCT surface FROM matched) surfaces
    ), '[]'::jsonb),
    (
      SELECT impact_level::text
      FROM matched
      ORDER BY CASE impact_level
        WHEN 'SAFETY_CRITICAL_REVIEW' THEN 3
        WHEN 'POSSIBLE_VERDICT_IMPACT' THEN 2
        WHEN 'INTERPRETIVE_REVIEW_REQUIRED' THEN 1
        ELSE 0
      END DESC, impact_level::text
      LIMIT 1
    )
  INTO expected_impact_count, expected_claim_ids, expected_surfaces, expected_highest_impact
  FROM matched;

  IF NEW.impact_preview ->> 'version' IS DISTINCT FROM 'rna-intelligence/contribution-impact-v1'
     OR NEW.impact_preview ->> 'matchedDependencyCount' IS DISTINCT FROM expected_impact_count::text
     OR NEW.impact_preview ->> 'noDependencyMatch' IS DISTINCT FROM (expected_impact_count = 0)::text
     OR NEW.impact_preview ->> 'highestImpactLevel' IS DISTINCT FROM expected_highest_impact
     OR NEW.impact_preview -> 'currentVerdictRevisionId'
        IS DISTINCT FROM COALESCE(to_jsonb(authoritative_verdict_id), 'null'::jsonb)
     OR jsonb_typeof(NEW.impact_preview -> 'affectedClaimIds') IS DISTINCT FROM 'array'
     OR jsonb_array_length(NEW.impact_preview -> 'affectedClaimIds') <> jsonb_array_length(expected_claim_ids)
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(NEW.impact_preview -> 'affectedClaimIds') item
       WHERE NOT expected_claim_ids @> jsonb_build_array(item)
     )
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(expected_claim_ids) item
       WHERE NOT (NEW.impact_preview -> 'affectedClaimIds') @> jsonb_build_array(item)
     )
     OR jsonb_typeof(NEW.impact_preview -> 'affectedSurfaces') IS DISTINCT FROM 'array'
     OR jsonb_array_length(NEW.impact_preview -> 'affectedSurfaces') <> jsonb_array_length(expected_surfaces)
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(NEW.impact_preview -> 'affectedSurfaces') item
       WHERE NOT expected_surfaces @> jsonb_build_array(item)
     )
     OR EXISTS (
       SELECT 1 FROM jsonb_array_elements(expected_surfaces) item
       WHERE NOT (NEW.impact_preview -> 'affectedSurfaces') @> jsonb_build_array(item)
     ) THEN
    RAISE EXCEPTION 'contribution impact preview does not match persisted programme dependencies';
  END IF;

  expected_digest := rnawiki_programme_contribution_digest_payload(
    rnawiki_programme_contribution_submission_payload(NEW)
  );
  -- The digest is database-owned: overwrite any shape-valid sentinel/caller value with the
  -- canonical digest of the exact bundle that this trigger has independently validated.
  NEW.content_digest_algorithm := 'sha256';
  NEW.content_digest := expected_digest;

  RETURN NEW;
END;
$$;--> statement-breakpoint

DROP TRIGGER IF EXISTS programme_contribution_submission_integrity_trigger
ON programme_contribution_proposals;--> statement-breakpoint
CREATE TRIGGER programme_contribution_submission_integrity_trigger
BEFORE UPDATE OF status ON programme_contribution_proposals
FOR EACH ROW EXECUTE FUNCTION rnawiki_guard_programme_contribution_submission_integrity();--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_programme_contribution_review_state()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  derived_status contribution_review_status;
  derived_count integer;
  proposal_status contribution_proposal_status;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM programme_contribution_proposals proposal
      JOIN development_programmes programme ON programme.id = proposal.programme_id
      WHERE proposal.id = OLD.proposal_id
    ) THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'contribution review state cannot be deleted directly';
  END IF;

  SELECT status INTO proposal_status
  FROM programme_contribution_proposals
  WHERE id = NEW.proposal_id;
  IF proposal_status IS DISTINCT FROM 'SUBMITTED'::contribution_proposal_status THEN
    RAISE EXCEPTION 'review state requires a submitted contribution proposal';
  END IF;

  SELECT expected_status, expected_review_count
  INTO derived_status, derived_count
  FROM rnawiki_expected_programme_contribution_review_state(NEW.proposal_id);
  IF NEW.status IS DISTINCT FROM derived_status
     OR NEW.review_count IS DISTINCT FROM derived_count THEN
    RAISE EXCEPTION 'contribution review state must equal the state derived from immutable decisions';
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.proposal_id IS DISTINCT FROM OLD.proposal_id THEN
    RAISE EXCEPTION 'contribution review state identity is immutable';
  END IF;

  -- Audit clocks are database-owned. Caller timestamps are ignored rather than authenticated.
  NEW.updated_at := clock_timestamp();
  NEW.resolved_at := CASE
    WHEN derived_status IN ('ACCEPTED_FOR_IMPLEMENTATION', 'CHANGES_REQUESTED', 'REJECTED')
      THEN CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.resolved_at, clock_timestamp())
                ELSE clock_timestamp() END
    ELSE NULL
  END;
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_programme_contribution_review()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  proposal_row programme_contribution_proposals%ROWTYPE;
  reviewer_row users%ROWTYPE;
  state_row programme_contribution_review_states%ROWTYPE;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    IF TG_OP = 'DELETE' AND NOT EXISTS (
      SELECT 1
      FROM programme_contribution_proposals proposal
      JOIN development_programmes programme ON programme.id = proposal.programme_id
      WHERE proposal.id = OLD.proposal_id
    ) THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'contribution reviews are immutable append-only decisions';
  END IF;

  SELECT * INTO proposal_row
  FROM programme_contribution_proposals
  WHERE id = NEW.proposal_id
  FOR SHARE;
  IF NOT FOUND OR proposal_row.status <> 'SUBMITTED' OR proposal_row.content_digest IS NULL THEN
    RAISE EXCEPTION 'a review requires a submitted, digest-bound contribution proposal';
  END IF;
  PERFORM rnawiki_lock_programme_contribution_lineage(
    proposal_row.programme_id,
    proposal_row.proposal_key
  );

  IF EXISTS (
    SELECT 1 FROM programme_contribution_proposals newer
    WHERE newer.programme_id = proposal_row.programme_id
      AND newer.proposal_key = proposal_row.proposal_key
      AND newer.status = 'SUBMITTED'
      AND newer.revision_number > proposal_row.revision_number
  ) THEN
    RAISE EXCEPTION 'a superseded contribution proposal revision cannot receive a review';
  END IF;

  SELECT * INTO state_row
  FROM programme_contribution_review_states
  WHERE proposal_id = NEW.proposal_id
  FOR UPDATE;
  IF NOT FOUND OR state_row.status NOT IN ('AWAITING_REVIEWS', 'AWAITING_SECOND_REVIEW') THEN
    RAISE EXCEPTION 'this contribution proposal is not accepting independent reviews';
  END IF;
  IF state_row.review_count >= 2 THEN
    RAISE EXCEPTION 'a contribution proposal may have at most two independent reviews';
  END IF;
  IF NEW.reviewer_user_id = proposal_row.author_user_id THEN
    RAISE EXCEPTION 'a contribution proposal author cannot review their own proposal';
  END IF;
  IF NEW.content_digest_algorithm <> proposal_row.content_digest_algorithm
     OR NEW.content_digest <> proposal_row.content_digest THEN
    RAISE EXCEPTION 'a contribution review must bind the exact frozen proposal digest';
  END IF;

  SELECT * INTO reviewer_row FROM users WHERE id = NEW.reviewer_user_id FOR SHARE;
  IF NOT FOUND OR NOT (reviewer_row.is_admin OR reviewer_row.trust_tier IN ('trusted', 'steward')) THEN
    RAISE EXCEPTION 'contribution reviews require a trusted editor, steward, or administrator';
  END IF;
  IF NEW.reviewer_name_snapshot IS DISTINCT FROM reviewer_row.name
     OR NEW.reviewer_orcid_snapshot IS DISTINCT FROM reviewer_row.orcid THEN
    RAISE EXCEPTION 'contribution reviewer attribution must match the authenticated public profile';
  END IF;

  NEW.reviewed_at := clock_timestamp();
  RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION rnawiki_guard_programme_contribution_adjudication()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  proposal_row programme_contribution_proposals%ROWTYPE;
  adjudicator_row users%ROWTYPE;
  state_row programme_contribution_review_states%ROWTYPE;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    IF TG_OP = 'DELETE' AND NOT EXISTS (
      SELECT 1
      FROM programme_contribution_proposals proposal
      JOIN development_programmes programme ON programme.id = proposal.programme_id
      WHERE proposal.id = OLD.proposal_id
    ) THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'contribution adjudications are immutable append-only decisions';
  END IF;

  SELECT * INTO proposal_row
  FROM programme_contribution_proposals
  WHERE id = NEW.proposal_id
  FOR SHARE;
  IF NOT FOUND OR proposal_row.status <> 'SUBMITTED' OR proposal_row.content_digest IS NULL THEN
    RAISE EXCEPTION 'an adjudication requires a submitted, digest-bound contribution proposal';
  END IF;
  PERFORM rnawiki_lock_programme_contribution_lineage(
    proposal_row.programme_id,
    proposal_row.proposal_key
  );

  SELECT * INTO state_row
  FROM programme_contribution_review_states
  WHERE proposal_id = NEW.proposal_id
  FOR UPDATE;
  IF NOT FOUND OR state_row.status <> 'DISAGREEMENT' OR state_row.review_count <> 2 THEN
    RAISE EXCEPTION 'only two disagreeing contribution reviews may be adjudicated';
  END IF;
  IF NEW.adjudicator_user_id = proposal_row.author_user_id
     OR EXISTS (
       SELECT 1 FROM programme_contribution_reviews review
       WHERE review.proposal_id = NEW.proposal_id
         AND review.reviewer_user_id = NEW.adjudicator_user_id
     ) THEN
    RAISE EXCEPTION 'a contribution adjudicator must be independent of the author and reviewers';
  END IF;
  IF NEW.content_digest_algorithm <> proposal_row.content_digest_algorithm
     OR NEW.content_digest <> proposal_row.content_digest THEN
    RAISE EXCEPTION 'a contribution adjudication must bind the exact frozen proposal digest';
  END IF;

  SELECT * INTO adjudicator_row FROM users WHERE id = NEW.adjudicator_user_id FOR SHARE;
  IF NOT FOUND OR NOT (adjudicator_row.is_admin OR adjudicator_row.trust_tier = 'steward') THEN
    RAISE EXCEPTION 'contribution adjudication requires a steward or administrator';
  END IF;
  IF NEW.adjudicator_name_snapshot IS DISTINCT FROM adjudicator_row.name
     OR NEW.adjudicator_orcid_snapshot IS DISTINCT FROM adjudicator_row.orcid THEN
    RAISE EXCEPTION 'contribution adjudicator attribution must match the authenticated public profile';
  END IF;

  NEW.adjudicated_at := clock_timestamp();
  RETURN NEW;
END;
$$;--> statement-breakpoint
