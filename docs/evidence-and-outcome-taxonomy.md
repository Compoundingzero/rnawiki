# Evidence and outcome taxonomy

**Status:** implemented 2026-09-10 in `lib/dossier-v3/taxonomy.ts` (the code is the contract; this
page explains it). Stored as PostgreSQL enums by migration `0034` (`v3_outcome_class`,
`v3_evidence_class`, `v3_claim_strength`, `v3_trial_role`, `v3_completion_state`).

## Why two axes

A single "evidence score" hides the two questions a reader must keep apart: _what was measured_
(the outcome class) and _how it was measured_ (the evidence class). A biomarker measured in a
randomised trial is strong evidence that the biomarker moved and no evidence at all that anyone
felt, functioned or lived better. The Decision Card therefore carries a **claim strength** that is
capped by both axes (`maximumClaimStrength`) and enforced by a database `CHECK`
(`reviewed_claims_strength_cap`).

## Outcome classes (A–H)

| Letter | Code                      | Reader label                | Importance |
| ------ | ------------------------- | --------------------------- | ---------- |
| A      | `clinical_event`          | Meaningful clinical event   | 5          |
| B      | `function_performance`    | Function or performance     | 4          |
| C      | `symptom_quality_of_life` | Symptom or quality of life  | 4          |
| D      | `biomarker_surrogate`     | Biomarker or surrogate      | 2          |
| E      | `mechanistic_measurement` | Mechanistic measurement     | 1          |
| F      | `safety_tolerability`     | Safety or tolerability      | 3          |
| G      | `longevity_mortality`     | Longevity or mortality      | 5          |
| H      | `unknown_outcome`         | Unknown or poorly specified | 0          |

Each carries a one-sentence plain definition shown inline the first time it appears. Importance is
displayed as a dimension, never folded into a score.

## Evidence classes

`regulatory_label`, `randomized_trial`, `controlled_trial`, `uncontrolled_human_study`,
`observational`, `systematic_review`, `registered_trial_no_result`, `animal_study`,
`mechanism_study` (cells or laboratory), `spontaneous_report`, `case_report`,
`community_anecdote`, `model_prediction`. Each carries `human: true|false` and a plain definition.
The page keeps these visually separate (`EvidenceLabel`, words plus glyph, never colour alone).

## Claim strength vocabulary (the only status words a Decision Card may use)

| Code                        | Words                                                                       |
| --------------------------- | --------------------------------------------------------------------------- |
| `strong_human_specific_use` | Strong human evidence for this specific use                                 |
| `promising_short_studies`   | Promising, but based mainly on short studies                                |
| `biomarker_only`            | A biomarker changed; meaningful health improvement has not been established |
| `animal_or_cell_only`       | Only animal or cellular evidence was found                                  |
| `mixed_or_contradicted`     | Studies disagree; no single conclusion is supported                         |
| `no_reviewed_conclusion`    | No reviewed conclusion yet                                                  |

**Cap rules** (`maximumClaimStrength`, mirrored in SQL):

- outcome D or E → at most `biomarker_only`;
- evidence `animal_study` or `mechanism_study` → at most `animal_or_cell_only`;
- evidence `model_prediction` or `community_anecdote` → `no_reviewed_conclusion` only;
- outcome H → at most `mixed_or_contradicted`;
- an `effect` claim read from a trial needs `trial_role = experimental_intervention`
  (`reviewed_claims_benefit_needs_tested_role`).

## Deterministic mapping from stored corpus values

| Stored value                                                         | Outcome class                            | Evidence class                     | Note                                                                   |
| -------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| Ladder kind `lifespan` from a registry primary-outcome string        | H (`unknown_outcome`)                    | `registered_trial_no_result`       | A registered endpoint word is not a result (audit F1, clinical report) |
| Ladder kind `healthspan` / `biomarker` from a registry string        | H                                        | `registered_trial_no_result`       | same                                                                   |
| Ladder rung from a Europe PMC abstract, non-human                    | E                                        | `animal_study` / `mechanism_study` | by organism                                                            |
| Registry study, INTERVENTIONAL, allocation RANDOMIZED, posted result | by primary outcome text (see below)      | `randomized_trial`                 | only when a result is stored; else `registered_trial_no_result`        |
| Registry study, OBSERVATIONAL                                        | H unless a result is stored              | `observational`                    | substance role `observational_exposure`                                |
| Open Targets adverse-event term counts                               | F                                        | `spontaneous_report`               | counts are reaction mentions, never rates                              |
| openFDA label indication / boxed warning / contraindication          | — (fact, not an outcome)                 | `regulatory_label`                 | `recorded_use` / `safety` claim kinds                                  |
| PubMed title/abstract mention only                                   | H                                        | `mechanism_study` or `unknown`     | a mention is not evidence                                              |
| ITP cohort (mouse lifespan)                                          | G in mice                                | `animal_study`                     | never promoted to a human strength                                     |
| Stored posted result with a numeric percent change                   | D unless the measure is a clinical event | by design                          | `effect_scale` = relative unless an absolute value is stored           |

Primary-outcome text → outcome class uses only unambiguous words: mortality/death/survival → G;
myocardial infarction/stroke/fracture/hospitalisation → A; a named questionnaire or symptom scale →
C; strength/walk/VO₂/cognition test → B; a laboratory analyte or imaging value → D; enzyme,
receptor or gene measurements → E. Anything else → H. The mapping is a reviewed proposal only:
the view model never derives a public benefit sentence from it; a reviewer writes the claim.

## Trial roles

`experimental_intervention` (the only role that supports "tested"), `active_comparator`, `placebo`,
`background_therapy`, `rescue_therapy`, `concomitant_medication`, `eligibility_criterion`,
`exclusion_criterion`, `outcome_measurement`, `mention_only`, `observational_exposure`,
`administered_role_unclear`, `unclear`. See `docs/entity-resolution-and-trial-role-spec.md`.

## Completion states (no silent blank)

`verified_evidence_present`, `no_qualifying_evidence_after_search`, `not_applicable`,
`ambiguous_quarantined`, `awaiting_human_review`, `source_unavailable`, `legally_unavailable`,
`pipeline_failure`. Mapping from the legacy completion resolver's ten terminal states:
`EXACT_STRUCTURED_SOURCE_DATA`, `SOURCE_QUOTED_STATEMENT` → `verified_evidence_present`;
`NO_QUALIFYING_EVIDENCE_AFTER_SEARCH`, `RESULTS_NOT_POSTED`, `SOURCE_STATED_NOT_ESTABLISHED` →
`no_qualifying_evidence_after_search` (the resolver's own basis sentence is kept as `basis`);
`NOT_APPLICABLE`, `NO_PROGRAMME_DEFINED` → `not_applicable`; `NOT_MEASURED` →
`no_qualifying_evidence_after_search` with basis "not measured" (kept distinct in the basis text,
as CLAUDE.md boundary 6 requires); the legacy resolver has no counterpart for
`ambiguous_quarantined`, `legally_unavailable` or `pipeline_failure`, which are new.

## Interaction categories (stack checker results)

1 documented, clinically important · 2 documented, usually manageable · 3 plausible mechanistic
concern with limited clinical evidence · 4 conflicting evidence · 5 no interaction evidence located
· 6 insufficient information · 7 input could not be confidently identified. Category 5 is never
rendered as "safe together" (`interactionAbsenceLine`).
