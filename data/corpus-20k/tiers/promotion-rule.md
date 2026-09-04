# Tier promotion rule

**Fixed 2026-09-04 (Phase 2, coverage stage).** Machine inputs: `data/corpus-20k/tiers/model-assignment.ndjson`
(one row per canonical page: `key`, `model`, `reasons[]`, `withdrawn`, `withdrawnReasonSource`) and
`data/corpus-20k/suppression/assignments.ndjson`. Measured result of applying this rule:
`data/corpus-20k/fields/coverage-summary.json` and `coverage-report.md`.

A tier is a **deployment and indexing** grouping (R6, R13). It is not a quality score and it is not a
field-count threshold. **A page's tier follows its model assignment**, with one promotion: a withdrawn
page is Tier 1 whatever its model, because R11 requires the withdrawal record and its reason coverage to
be published and verified in the first tier.

## Exact conditions

Evaluated in order; the first matching row wins, so every page holds exactly one tier.

| Order | Tier | Condition (all clauses must hold) |
| ---: | --- | --- |
| 1 | Tier 1 | `model == "LONGEVITY"` **or** `withdrawn == true` |
| 2 | Tier 2 | `model == "CLINICAL"` **and** `withdrawn == false` |
| 3 | Tier 3 | `model == "DEVELOPMENT"` **and** `withdrawn == false` |

No other clause enters. In particular:

| Not a tier condition | Why |
| --- | --- |
| Present-field count | Coverage is measured per model, never used to move a page between tiers. A Tier 3 page with 7 present fields stays Tier 3; a Tier 1 page with 1 present field stays Tier 1 and renders what it holds. |
| Suppression class | Suppression removes seeds and sections (R2). It never changes the tier; suppressed counts are reported per tier instead. |
| Stub status (< 3 present fields) | A stub is a rendering and indexing decision inside its tier (R15), not a demotion. |
| Existing slug or traffic | R8 reconciliation governs slugs and redirects, not tiering. |

## The `withdrawn` flag

`withdrawn == true` is set only by the model-assignment stage, and only on one of the four grounds
fixed in `docs/specs/field-models.md` ("The `withdrawn` flag", 2026-09-05): every cleared register
that holds the moiety records it as gone **and** none of them records a remaining active, approved or
marketed entry; or a register's own status text states a safety withdrawal (Health Canada
`CANCELLED (SAFETY ISSUE)`); or ChEMBL records `withdrawn_flag` or a `drug_warning` of type
Withdrawn; or the existing corpus's entity class is `WITHDRAWN_MEDICINE`. The last three state the
withdrawal and stand alone; the first infers it from an absence and is guarded by every other
register. A Drugs@FDA `None (Tentative Approval)` product and a Health Canada `CANCELLED PRE MARKET`
status never set it. A combination product's withdrawal is never carried onto an ingredient page.
`withdrawnReasonSource.reason` holds the register's own reason text, verbatim, or `null` where the
register states a status and no reason.

## Recomputation

The tier assignment is **derived, never stored by hand**. Recompute the whole rule, for every page, when
any of the following changes:

| Trigger | Effect |
| --- | --- |
| A model assignment reason is added, removed or re-cut (for example narrowing `registry-ageing-term` so age-related-condition programmes stop entering LONGEVITY) | Pages move between Tier 1 and Tiers 2/3 |
| A new source sets or clears `withdrawn` (a cleared TGA, PMDA or WHO withdrawn list; a new ChEMBL `drug_warning` release; an EMA or Health Canada status change) | Pages move into or out of Tier 1 |
| A field extractor re-runs and coverage changes | Tiers do not move, but `coverage-summary.json`, the stub counts and the per-tier suppression counts are restated |
| Suppression classes are re-applied (as S1 was at the start of Phase 2) | Tiers do not move; the per-tier suppressed and unknown-class counts are restated |
| Identity resolution merges or splits a page (R1) | The merged key inherits the union of the source pages' assignment reasons and `withdrawn` flags, then the rule is re-evaluated |

Recomputation is a full re-derivation from `model-assignment.ndjson`, never an in-place edit of a tier
value. A page that leaves Tier 1 or Tier 2 keeps its URL; R8 governs the redirect and the sitemap
rebuild, and R6 governs the indexing change that follows a move into or out of Tier 3.

## Measured result (2026-09-05, after the Phase 5a withdrawn rule and identity pass 3)

| Tier | Pages |
| --- | ---: |
| 1 — LONGEVITY model (1,109) ∪ withdrawn (663) | 1,719 |
| 2 — CLINICAL model, not withdrawn | 4,477 |
| 3 — DEVELOPMENT model, not withdrawn | 22,636 |
| **Total** | **28,832** |

Two changes produced it, in this order. The withdrawn rule was narrowed and re-derived over the
28,943-page corpus: withdrawn 438 → 668, Tier 1 1,498 → 1,726 (310 pages gained the flag, almost
all moieties whose every Drugs@FDA application is discontinued; 88 lost it, 75 of them on the EMA
reading the rule now guards, amlodipine among them). Identity pass 3 then merged 111 salt-named
structureless records into their parent moiety, taking the corpus to 28,832 pages and the withdrawn
count to 663.

Superseded (2026-09-04, before the withdrawn rule was narrowed): Tier 1 1,498 · Tier 2 4,724 ·
Tier 3 22,721 over 28,943 pages, on a withdrawn count of 438.
