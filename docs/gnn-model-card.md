# Model card — graph intelligence baseline

**Model id:** `rules/v1` (no learned model). **Date:** 2026-09-10. **Owner:** RNAWiki.

## Summary

No graph neural network, knowledge-graph embedding or classifier has been trained. The only
"models" in operation are deterministic rules:

| Task                              | Baseline in operation                                                                                      | Where                                                                             |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1 Entity anomaly detection        | Identity rules R0–R14 (`docs/specs/identity-resolution.md`), held/conflict lists, the new name-lookup rule | `scripts/corpus-20k/identity/*`, `data/revamp/identity/*`                         |
| 2 Trial relevance and role        | `trial-role-classifier/v1` (six deterministic rules over study type and intervention entries)              | `lib/dossier-v3/trial-roles.ts`                                                   |
| 3 Evidence-path ranking           | None. The page ranks nothing; it lists reviewed claims by claim strength and outcome class.                | `lib/dossier-v3/view-model.ts`                                                    |
| 4 Interaction signal discovery    | Rule classes C1/C3 (CYP inhibitor/substrate, additive class), validated against openFDA and Inxight        | `scripts/revamp/interactions_build.py`, `data/revamp/interaction-validation.json` |
| 5 Contradiction and gap discovery | Deterministic unknowns list (surrogate-only, unposted results, missing interactions, planned windows)      | `unknownsFrom` in the view model                                                  |
| 6 Alternative discovery           | Hub membership (same target / class), a comparison set, not a ranking                                      | `hubs`, `hub_members`                                                             |
| 7 Temporal staleness              | Source dates and last-checked dates on every row; `completionIsPlanned`; `valid_to` on graph edges         | corpus tables, `graph_edges`                                                      |

## Why no model was trained

The graph is identity-contaminated (audit: the creatine ↔ Tribulus terrestris merge, 173 legacy
rows keyed by a PubChem name lookup, 127 cross-family salt merges, 94 pages with truncated registry
matches). Training on it would learn the contamination. `graph_versions.identity_gate_passed`
stays false until the identity corrections have been applied corpus-wide and the rendered
duplicate check has run; every training command must refuse a graph version whose gate is false.

The corpus Python environment (`.venv-corpus`) holds rdkit, networkx, numpy, pandas, pyarrow and
duckdb; it does not hold torch, scikit-learn, PyG, pykeen or transformers. They are not to be added
before the gate passes.

## Baseline versus learned model: the comparison rule

A learned model (DistMult / ComplEx / RotatE, then R-GCN, then HGT only if justified) may be
registered in `model_versions` only when, on the frozen evaluation set below, it beats the rule
baseline on the task metric **and** is calibrated (Brier score reported; reliability plotted), with
leakage controls: temporal holdout, whole source-family holdout, related trial–publication family
holdout, near-duplicate removal, typed negative sampling, separate train/validation/test graph
snapshots.

Metrics by task: precision / recall / F1 (roles, anomalies); AUROC and AUPRC (interactions,
imbalanced); MRR and Hits@K (link prediction); recall at an acceptable false-positive rate and the
critical-interaction false-negative rate (interactions); reviewer acceptance rate, reviewer time
saved, damaging identity errors caught, misleading public claims prevented (all tasks, from the
correction ledger).

## Evaluation set (to freeze at `data/graph/eval/v1` when the gate opens)

- Identity: the adjudicated pairs in `data/revamp/identity/adjudication-summary.json`,
  `apply-list.csv` and the hold lists (about 680 adjudicated, 64 held); negatives from the
  rendered-duplicate check's clean pairs.
- Interactions: the label-adjudicated pairs and negatives behind
  `data/revamp/interaction-validation.json` (openFDA and Inxight; DDInter is validation-only under
  its non-commercial licence and is never joined to a page or a release).
- Trial roles: none exist yet. A labelled set of about 1,000 (page, study) pairs must be reviewed
  before any role classifier is trained; until then `trial-role-classifier/v1` is the only role
  source and `administered_role_unclear` stays unresolved.
- Corrections: every accepted `entity_corrections` row, by `rule_or_classifier_version`.

## Known failures of the baseline (catalogue)

1. Two active interventions without arm groups → `administered_role_unclear` (cannot separate
   comparator from tested treatment). Fix: fetch `ArmGroupType` and `ArmGroupInterventionName`.
2. A synonym-matched study is flagged but not removed; a wrong synonym still brings its studies
   until a correction is applied.
3. Estimated enrolment counts feed "largest" with their type shown; they are not excluded.
4. Interaction rule recall is 0.12 at precision 0.98 (validation file): most documented
   interactions are not predicted by C1/C3.
5. The unknowns list cannot detect a contradiction between two reviewed claims across pages.

## Correction-driven learning loop (design, not yet running)

prediction → human review → accepted or rejected correction (`entity_corrections`) → labelled
dataset version → scheduled retraining → offline evaluation on the frozen set → safety gate
(`graph_versions.identity_gate_passed`, calibration, baseline comparison) → `model_versions`
registry → controlled deployment (predictions to `predicted_edges` only) → monitoring. One
correction never changes production behaviour by itself. Private user data is never training data.
