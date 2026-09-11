# Knowledge graph schema

**Status:** tables created by migration `0034` (`graph_versions`, `graph_nodes`, `graph_edges`,
`model_versions`, `predicted_edges`; the correction ledger is `entity_corrections`). No projector
has written rows yet: the graph is populated only after the identity gate, and the gate is closed
(see `docs/gnn-model-card.md`). The typed tables the site already uses (`page_relations`,
`page_interactions`, `page_trial_roles`, `reviewed_claims`, `claims`, `evidence_nodes`,
`programme_dependencies`) stay the sources of truth for their workflows; the graph tables are a
**projection** of them.

## Why PostgreSQL stays canonical

Measured scale on 2026-09-10: about 29k substance pages, 5.1k identity relations, 623k interaction
rows, 273k reading units, 330k page–trial pairs — under two million edges. Bounded recursive CTEs
over an index on `(src_id, edge_type)` where `valid_to is null` answer 3–5-hop paths in tens of
milliseconds at this size, and migration `0012` already uses a recursive CTE. A dedicated graph
database is justified only by (a) more than about 50 million edges or p95 path latency above 200 ms
after indexing, (b) request-time variable-length patterns with per-hop predicates, or (c) online
GNN inference needing neighbourhood sampling at request time. None holds. Offline analysis exports
to Parquet (pyarrow is in the corpus environment) for NetworkX or, when the gate opens, PyG.

## Layers

| Layer     | Nodes (`graph_node_type`)                                                                                                                                                                                                                                        | Edges (`edge_type`)                                                                                                                                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| identity  | substance, ingredient, botanical, salt, isomer, metabolite, formulation, product, combination, class, external_identifier                                                                                                                                        | SAME_ENTITY_AS, HAS_SYNONYM, SALT_OF, ISOMER_OF, METABOLITE_OF, PRODRUG_OF, FORMULATION_OF, ACTIVE_INGREDIENT_OF, COMPONENT_OF, MEMBER_OF_CLASS, EXTRACT_OF, POSSIBLY_MATCHES                                                                |
| mechanism | gene, protein, receptor, enzyme, rna_target, cell_type, tissue, organ, pathway, biological_process, biomarker, phenotype, condition, user_goal                                                                                                                   | BINDS, AGONIZES, ANTAGONIZES, INHIBITS, ACTIVATES, SILENCES, DEGRADES, UPREGULATES, DOWNREGULATES, EXPRESSED_IN, PARTICIPATES_IN, AFFECTS, MEASURED_BY, ASSOCIATED_WITH, HYPOTHESIZED_TO_AFFECT                                              |
| evidence  | claim, trial, study_arm, regimen, population, outcome, result, publication, regulatory_document, source_snapshot, reviewer, correction, model_version                                                                                                            | ADMINISTERED_IN_ARM, ACTIVE_COMPARATOR_IN_ARM, BACKGROUND_THERAPY_IN_ARM, MENTIONED_ONLY_IN_TRIAL, MEASURED_OUTCOME, OBSERVED_RESULT, SUPPORTS, CONTRADICTS, CONTEXTUALIZES, EXTRACTED_FROM, REVIEWED_BY, CORRECTED_BY, SUPERSEDES, RETRACTS |
| safety    | adverse_event, interaction, lab_test, procedure, population                                                                                                                                                                                                      | HAS_CONTROLLED_TRIAL_EVENT, HAS_LABEL_WARNING, HAS_SPONTANEOUS_SIGNAL, HAS_CASE_REPORT, INTERACTS_WITH, MAY_AFFECT_TEST, MAY_AFFECT_PROCEDURE, CONTRAINDICATED_IN, REQUIRES_CAUTION_IN                                                       |
| user      | **not stored here.** The private user graph (goals, stack items, measurements, observations, experiments) lives in the reader's browser (`localStorage`) and is never sent to the server or used for training (`docs/privacy-and-medical-safety-boundaries.md`). |

`graph_edges.layer` is checked to `identity | mechanism | evidence | safety`. Edge types are text
constrained by the projector and the validator tests rather than by an enum, so a new relation can
be added without a migration; every type in use must be listed in this document.

## Edge properties (columns on `graph_edges`)

direction (`directed`), polarity (`v3_effect_direction`), species, cell_or_tissue_context,
population, condition_or_goal, dose_as_studied, route, frequency, duration, comparator, outcome,
effect_value + effect_unit, ci_low + ci_high, absolute_events (jsonb counts), study_design
(`v3_evidence_class`), trial_role (`v3_trial_role`), source_snapshot_id (FK `source_snapshots`),
source_locator, extraction_confidence (0–1), origin (`verified | recorded | predicted`),
rule_or_model_id, review_state (`v3_reviewer_state`), valid_from, valid_to, deprecated_reason,
graph_version, properties (jsonb, type-specific extras only).

Constraints: no self-edge; a predicted edge names its rule or model; a verified edge is reviewed;
`valid_to ≥ valid_from`; confidence in [0, 1].

## Versions, predictions, corrections

- `graph_versions`: one row per projection, digest id, corpus snapshot, node and edge counts, and
  the two gates `identity_gate_passed` and `completion_gate_passed`. A training command refuses a
  version whose identity gate is false.
- `predicted_edges`: model or rule outputs, with model version, graph version, task, score,
  calibrated probability and calibration state, supporting and contradicting subgraphs (concrete
  source-backed paths, never attention weights alone), reasons, a candidate correction and a review
  state. Never joined to a public page unless reviewed; never copied into `graph_edges` except by
  a reviewed correction.
- `entity_corrections`: the immutable ledger for every repair; accepted rows are the labelled data
  a scheduled retraining reads.
- `model_versions`: family, task, training graph version, evaluation set id, metrics, calibration
  state, card path.

## Projection order (when the gate opens)

1. `graph_versions` row from the corpus digest.
2. Substance nodes from `corpus_pages` (`sub:<key>`), identifier nodes from UNII/InChIKey/ChEMBL/CAS/RxCUI.
3. Identity edges from `page_relations` (keep the `rule` and `evidence` columns the current loader
   drops), `SAME_ENTITY_AS` only from two-identifier merges.
4. Trial nodes from `page_registry_studies`; `tested_in`-family edges from `page_trial_roles` with
   `trial_role`; `MENTIONED_ONLY_IN_TRIAL` for `unclear`/`mention_only`.
5. Safety edges from label fields (`HAS_LABEL_WARNING`, `CONTRAINDICATED_IN`) and Open Targets terms
   (`HAS_SPONTANEOUS_SIGNAL`, count in `properties`, never a rate).
6. Interaction edges from `page_interactions`: tier A/B `origin = recorded`, tier C
   `origin = predicted` with `rule_or_model_id = <rule id>`.
7. Claim nodes and `SUPPORTS`/`CONTRADICTS` edges from `reviewed_claims` (reviewed only).

Validators (unit tests, to be extended into the projector): no self-edge; predicted needs a rule;
`SUPPORTS` from a `tested_in` edge needs `trial_role = experimental_intervention`; identity edges
symmetric where `SAME_ENTITY_AS`; every edge names a source snapshot or a recorded source.
