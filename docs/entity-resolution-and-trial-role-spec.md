# Entity resolution and trial-role specification

**Status:** the trial-role half is implemented (2026-09-10): `lib/dossier-v3/trial-roles.ts`,
`scripts/dossier-v3/backfill-trial-roles.ts`, tables `page_trial_roles` and
`page_registry_role_aggregates`. The identity half adds rules to `docs/specs/identity-resolution.md`
and a correction ledger (`entity_corrections`, `scripts/dossier-v3/apply-identity-corrections.ts`);
the pipeline rule changes it names are listed as required work, not as done.

## Part 1 — Identity

### Required distinctions

Exact active substance · drug or substance class · salt · base compound · stereoisomer · metabolite
· prodrug · formulation · brand product · combination product · ingredient · botanical species ·
extract · target · biomarker · condition · user goal. `IDENTITY_RELATIONS` in the taxonomy:
`SAME_ENTITY_AS`, `HAS_SYNONYM`, `SALT_OF`, `ISOMER_OF`, `METABOLITE_OF`, `PRODRUG_OF`,
`FORMULATION_OF`, `ACTIVE_INGREDIENT_OF`, `COMPONENT_OF`, `MEMBER_OF_CLASS`, `EXTRACT_OF`,
`POSSIBLY_MATCHES`. Only `SAME_ENTITY_AS` may carry evidence between nodes
(`EVIDENCE_TRANSFERRING_RELATIONS`).

### Merge rule

A merge needs **two independent matching identifiers** (UNII + InChIKey parent, or UNII + ChEMBL
parent) **or one exact high-authority identifier with a valid transformation rule** (a GSRS
`SALT/SOLVATE → PARENT` relationship). A synonym is never sufficient. A PubChem _name_ lookup on a
keyless record yields a `POSSIBLY_MATCHES` candidate only, never a key (this is the rule that was
missing: audit finding on creatine ↔ Tribulus terrestris, root cause in
`scripts/corpus-20k/identity/resolve.py:795-816` and the `M-SALT` rule at `:966-970`).

Uncertain candidates are stored apart from accepted edges (`graph_edges.origin = 'recorded'` with
`review_state = 'draft'`, or `predicted_edges`), never as synonyms of kind `common`.

### The correction ledger

Every repair writes to `entity_corrections` first (append-only; trigger
`entity_corrections_immutable`). A row names the subject kind (`page`, `synonym`,
`registry_match`, `relation`, `claim`, `graph_edge`, `predicted_edge`), the exact subject, the
action, `before`, `after`, the reason, the evidence, the decider (a user or a named operator) and
the rule or classifier version. The first recorded corrections (2026-09-10, local rebuild database):
the removal of "Tribulus Terrestris" from creatine's synonyms and of five stored Tribulus studies
from creatine's registry set, with the evidence chain in
`data/dossier-v3/corrections/creatine-tribulus.json`.

### Required pipeline changes (not yet applied to the Python identity stage)

1. `resolve.py`: a multi-component PubChem name-lookup result never sets `k1`/`k2`; tag
   `keyFrom: 'pubchem-name'`; exclude such records from `M-SALT`.
2. `match.ts:263-270`: a stored legacy pair is kept only if its `matchedName` normalises to a key
   the page owns (otherwise counted as `storedRejected`).
3. `docs/specs/identity-resolution.md`: add "§2.5 name lookup yields K4 candidates only".
4. `creatine-gluconate` (`K4:creatine gluconate`) inherits creatine's registry set through legacy
   aliases; it must merge into `K1:MU72812GK0` as a salt or lose the inherited set (fixture 3).

## Part 2 — Trial roles

### What the snapshot holds

The 2026-09-01 ClinicalTrials.gov snapshot (`rnawiki-ingest-data/clinicaltrials/20260901T090005`,
601,158 studies) carries study type, phase, status, enrolment count and type, start / primary
completion / completion dates, intervention `name`, `type` and `otherNames`, conditions, primary
outcomes, allocation, masking and primary purpose. It holds **no arm groups**
(`ArmGroupType`, `ArmGroupInterventionName` were not among the fetched fields), so a comparator
cannot be told from the tested treatment when several active interventions are registered.

### Deterministic classifier (`classifyTrialRole`, version `trial-role-classifier/v1`)

1. No intervention entry reduces to the matched name → `unclear` (a stored legacy pair with no
   entry naming the substance, or an endpoint-only mention).
2. Every matching entry is placebo-like → `placebo`.
3. `studyType = OBSERVATIONAL` → `observational_exposure` (not administered by the study).
4. Any other non-interventional study type → `unclear`.
5. Interventional and the substance is the only active intervention (everything else placebo,
   sham or no treatment) → `experimental_intervention`.
6. Interventional with other active interventions → `administered_role_unclear`.

Every assignment also records `synonymMatched` (matched through an other-name),
`excludedFromSizeStatistics` (withdrawn, or zero or missing enrolment) and `completionIsPlanned`
(registered completion after the snapshot date, or status not completed/terminated).

### Role-aware aggregate (`roleAwareRegistryAggregate`)

Counts by role; `tested.studies`; `tested.largest` (tested, enrolment above zero, actual preferred
by value only — the enrolment _type_ is shown beside the number); `tested.longestCompletedWindow`
(tested, completed, registered start to registered end — labelled as a study window, never as
exposure); `tested.medianEnrollment`; `plannedCompletionIgnored`. Only
`experimental_intervention` counts towards "tested".

### Results on the four gold pages (local, 2026-09-10)

| Page                 | Matched | Tested | Role unclear | Observational | Largest tested           | Longest completed window | Planned ignored |
| -------------------- | ------- | ------ | ------------ | ------------- | ------------------------ | ------------------------ | --------------- |
| semaglutide          | 550     | 218    | 256          | 76            | 21,296 (NCT05441267)     | 1,919 d (NCT04596631)    | 255             |
| metformin            | 1,693   | 441    | 1,209        | 43            | 5,160 est. (NCT05182970) | 4,753 d (NCT01101438)    | 546             |
| inclisiran           | 60      | 31     | 17           | 12            | 17,004 (NCT05030428)     | 1,400 d (NCT04652726)    | 32              |
| creatine-monohydrate | 129     | 69     | 59           | 1             | 1,741 (NCT00449865)      | 4,595 d (NCT00081250)    | 49              |

The live "largest trial (887,132 people)" for semaglutide was NCT07096063, an observational cohort;
the live "31 years" for inclisiran was a study registered to end in 2049.

### Regression fixtures (all executable)

`tests/unit/dossier-v3-trial-roles.test.ts` and `tests/unit/dossier-v3-phase0-generator.test.ts`
cover: observational ≠ tested (7), comparator ≠ tested (5), stored/endpoint mention ≠ administered
(10), withdrawn zero-enrolment ≠ smallest (8), planned window ≠ duration (9), synonym match flagged
(1), internal keys never rendered (11), spontaneous counts never rates (12).
`tests/integration/dossier-v3-ledger-and-roles.test.ts` covers the ledger's immutability, the
strength cap and the tested-role constraint at the database. The identity fixtures 2 (mixture ≠
ingredient), 3 (combination ≠ component) and 4 (class ≠ substance) are specified in
`docs/rnawiki-biohacker-rebuild-audit.md` §F7 with record ids and remain to be executed against
the Python identity stage.

### Outlier checks (deterministic, to run in the full-corpus backfill)

Implausible N (enrolment > 100,000 on a tested study → hold), implausible window (> 25 years →
hold), endpoint/substance mismatch (matched name absent from every intervention entry → `unclear`),
status inconsistency (COMPLETED with completion after snapshot → planned), duplicate study ids per
page, duplicate publications, combination leakage (a `COMBO:` page inheriting a component's whole
set), cross-species leakage (an animal-only abstract feeding a human rung), population/indication
mismatch (a paediatric or off-target condition set on a page whose recorded uses are adult-only).
Counts from the tracked aggregates on 2026-09-10: 286 pages with enrolment.max > 100,000; 2,627
with a zero-enrolment minimum; 2,290 with a planned "longest" completion (125 beyond 2040).

### Resumable commands

```bash
# classify the four gold pages (idempotent; --force to recompute)
npx tsx scripts/dossier-v3/backfill-trial-roles.ts --slugs semaglutide,metformin,inclisiran,creatine-monohydrate
# whole loaded corpus, 500 pages per batch, resumable
npx tsx scripts/dossier-v3/backfill-trial-roles.ts --all --batch-size 500
# apply a reviewed identity correction (dry run by default)
npx tsx scripts/dossier-v3/apply-identity-corrections.ts data/dossier-v3/corrections/creatine-tribulus.json --apply
```
