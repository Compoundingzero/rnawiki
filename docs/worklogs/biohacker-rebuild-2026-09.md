# Biohacker rebuild — worklog and resume brief

Branch `rebuild/biohacker-dossier` (from `revamp/2026-09` @ 55d07db), worktree
`Project RNAwiki/RNAwiki-biohacker-rebuild`, private database `rnawiki_rebuild` (a copy of
`rnawiki_corpus_completion` migrated to 0034). Production is `main` @ 524aeb6; nothing here is
deployed. Untracked corpus inputs are symlinked from the sibling worktree
(`data/revamp/{fields-v2,derived-v2,questions-v2,page-blocks,hubs/load}`,
`data/corpus-20k/{registry,raw}`; excluded from git in `.git/info/exclude`).

## Session protocol

On resume: read this file, `docs/rnawiki-biohacker-rebuild-audit.md` §Status, and
`git log --oneline -12` on the branch. Announce the step being resumed. Never restart a completed
step; every command below is idempotent or dry-run by default.

## Done (2026-09-10 → 11)

1. Six independent specialist audits (product, clinical evidence, data quality, graph ML,
   full-stack, medical safety) inspected the live site and the code; reports consolidated in
   `docs/rnawiki-biohacker-rebuild-audit.md`.
2. Phase 0 trust patches in the shared generator (`scripts/corpus-20k/render/page-text.ts`):
   seed keys humanised; spontaneous-report framing above counts; reaction sums no longer called
   reports; registered-study block reads role-aware counts or qualifies the old ones.
3. Migration 0034: `reviewed_claims` (frozen once reviewed, strength cap, tested-role rule),
   `entity_corrections` (append-only), `dossier_field_states`, `page_trial_roles`,
   `page_registry_role_aggregates`, `graph_versions`, `graph_nodes`, `graph_edges`,
   `model_versions`, `predicted_edges`.
4. Libraries under `lib/dossier-v3/`: taxonomy, copy contract, claim validator, trial-role
   classifier, stored-key words, goals, fields, view model, loader, document.
5. Operator commands: `scripts/dossier-v3/backfill-trial-roles.ts`,
   `scripts/dossier-v3/apply-identity-corrections.ts`, `scripts/dossier-v3/capture.ts`.
6. Creatine ↔ Tribulus correction applied locally (6 ledger rows); trial roles classified for the
   four gold pages and creatine-gluconate; headings rewritten (4 ledger rows).
7. Dossier v3 reader surface (`components/dossier/v3/`, `lib/dossier-v3/dossier-v3.css`) behind
   `DOSSIER_V3_SLUGS`, served for the four gold pages locally.
8. Tests: unit (copy contract, trial roles, Phase 0 generator, view model), integration (ledger,
   strength cap, tested-role rule, field-state rule), browser (v3 journey with axe), capture
   before/after (`data/dossier-v3/benchmark/`).
9. Docs: audit, information architecture, plain-language contract, taxonomy, entity resolution
   and trial roles, knowledge-graph schema, model card, data card, privacy and safety boundaries.
10. Goal-first entry: homepage strip and `/goals/<goal>` registry-fact pages (568 loaded records
    under "Glucose or metabolic health" on the tier-1 load).
11. Data-quality dashboard at `/review-queue/dossier-v3` (steward guard, same as completion review).
12. Graph projection: `scripts/dossier-v3/project-graph.ts --apply` wrote version `7987e517…`
    (5,151 nodes, 6,334 edges, identity gate closed) into the local database.

## Not done (see the audit §Remaining)

Identity pipeline rule changes in Python; corpus-wide correction of the other name-lookup merges;
full-corpus role backfill (only five pages classified locally); reviewed claims for any medicine
(none exist; four gold Decision Cards render honest absences); natural-language search, same-goal
comparison beyond hub membership, the stack checker and the single-person planner interfaces
(Phase 4; the goal entry is a registry-fact seed only); the frozen evaluation set and any learned
model (Phase 5, gated; the projector runs but the identity gate is closed); production deployment.

## Exact next commands

```bash
cd "Project RNAwiki/RNAwiki-biohacker-rebuild"
# full-corpus trial-role backfill on the loaded tier (resumable, 500 pages per batch)
npx tsx scripts/dossier-v3/backfill-trial-roles.ts --all --batch-size 500
# load tiers 2 and 3 locally (same loader flags as the audit §Commands), then re-run the backfill
# apply a reviewed identity correction
npx tsx scripts/dossier-v3/apply-identity-corrections.ts data/dossier-v3/corrections/<file>.json --apply
# render the four gold pages with the flag and re-run the benchmark
PORT=3100 DOSSIER_V3_SLUGS=semaglutide,metformin,inclisiran,creatine-monohydrate npm run start
npx tsx scripts/dossier-v3/capture.ts --base http://localhost:3100 --label after --slugs semaglutide,metformin,inclisiran,creatine-monohydrate --out data/dossier-v3/benchmark
# project the typed graph (identity gate stays closed; dry run without --apply)
npx tsx scripts/dossier-v3/project-graph.ts --apply
# the gate
npm run gate
```

## Rollback of migration 0034 (local or any environment)

```sql
BEGIN;
DROP TABLE IF EXISTS predicted_edges, model_versions, graph_edges, graph_nodes, graph_versions,
  page_registry_role_aggregates, page_trial_roles, dossier_field_states, entity_corrections,
  reviewed_claims CASCADE;
DROP FUNCTION IF EXISTS entity_corrections_append_only();
DROP FUNCTION IF EXISTS reviewed_claims_frozen_once_reviewed();
DROP TYPE IF EXISTS v3_evidence_class, v3_outcome_class, v3_reviewer_state, v3_contradiction_state,
  v3_causality_level, v3_uncertainty_level, v3_effect_direction, v3_completion_state, v3_trial_role,
  v3_claim_kind, v3_claim_strength, v3_effect_scale, graph_node_type, graph_edge_origin;
DELETE FROM drizzle.__drizzle_migrations WHERE id = (SELECT max(id) FROM drizzle.__drizzle_migrations);
COMMIT;
```

Unsetting `DOSSIER_V3_SLUGS` rolls back the reader surface without touching the database.
