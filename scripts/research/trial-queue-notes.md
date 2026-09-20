# Trial-result candidate queue (research only)

Run from the repository root:

```bash
npx tsx scripts/research/trial-candidate-queue.ts --output /tmp/trial-candidate-queue.json
```

`--study-dir DIR` switches to offline input (`DIR/NCT########.json`); `--source PATH` selects a different recorded-background NDJSON. The default reads `data/recorded-background.ndjson` and fetches each distinct NCT from the ClinicalTrials.gov API v2. Output is a review queue, not a corpus update. No outcome interpretation, programme assignment, or publication occurs.

## Contract and guardrails

The queue starts only with `pivotalResults` whose cited source kind is `CLINICALTRIALS`. An exact NCT must agree across the row's trial identifier, cited source identifier, and API study identifier before any API content is used. The three current `FDA_LABEL` rows are counted as excluded, not silently augmented from a different source.

Each candidate carries the same-NCT source URL, registered condition candidates, protocol intervention/arm descriptions, explicit product-form/route evidence if found, eligibility population, and a ranked outcome list. Where one posted outcome is uniquely supported by title and recorded primary/secondary type, the queue includes its timepoint, unit, module-local group measurements and denominators, statistical estimates and intervals, and field paths. Numeric strings in the old row are checked for presence within that _selected outcome_; they are never the source of a new number. Analyses referring to group IDs absent from that outcome are blocked. A comparator or active-arm selection remains for a reviewer, even when text-overlap hints are present.

Every candidate's status is `REVIEW_ONLY`, including those with no machine-detected blockers. A zero-blocker row means these bounded checks found no gap; it does **not** mean the scope, clinical interpretation, or publication has been approved. Ambiguous condition, intervention/arm, formulation, route, outcome, missing results, and mismatched numeric strings become explicit blocker codes.

## Live audit, 2026-09-19

The current NDJSON has **22** pivotal-result entries across **18** records: **19** registry-cited rows (16 distinct NCTs) and **3** FDA-label rows outside this path. All 16 NCT API requests succeeded. Fourteen of the 19 registry rows have at least one machine blocker. The most common are missing exact product form in the matched protocol intervention/arm (7), multiple condition labels needing selection (6), and multiple arms needing selection (5). Four outcome matches are not unique enough to select.

Examples that demonstrate the intended queue behavior:

- [NCT01394952](https://clinicaltrials.gov/study/NCT01394952), dulaglutide: the API gives the CV composite outcome, 594/4,949 and 663/4,952 event measurements, plus submitter-reported HR 0.88 with 95.33% CI 0.79–0.99. The queue does **not** choose between the registry's two condition labels or invent a product form from the subcutaneous route.
- [NCT04523129](https://clinicaltrials.gov/study/NCT04523129), cyclosporine/CyclASol: two different co-primary outcomes remain two rows. The registry's branded intervention, ophthalmic solution and topical ocular/eye-drop route are retained as source text; the two group measurements are tied to their outcome-local `OG` IDs. There is no submitter-reported between-group estimate in these selected outcome entries, so none is created.
- [NCT01131676](https://clinicaltrials.gov/study/NCT01131676), empagliflozin: primary/secondary typing prevents an unsafe lexical match to the _silent MI_ secondary outcome. The primary composite is selected, but the protocol intervention is filed under development code `BI 10773`, so exact product identity and form/route remain review blockers. The result groups show the pooled empagliflozin group for human reconciliation.
- [NCT02273180](https://clinicaltrials.gov/study/NCT02273180), insulin lispro: the result is not auto-selected because the old endpoint wording does not uniquely resolve the registry outcome. No stored number is promoted while that match is unresolved.
- [NCT03954834](https://clinicaltrials.gov/study/NCT03954834), tirzepatide: the primary HbA1c outcome and its 5 mg versus placebo analysis are visible, but the intervention has three dose arms. Exact active-arm selection remains a review task.

## Primary-source model

The paths and distinctions follow ClinicalTrials.gov's [Study Data Structure](https://clinicaltrials.gov/data-api/about-api/study-data-structure) and [Results Data Element Definitions](https://clinicaltrials.gov/policy/results-definitions): protocol conditions, eligibility, arms and interventions are separate from results outcome groups, measurements and analyses. The API's `hasResults` flag and each outcome's `reportingStatus` are checked separately. The [ClinicalTrials.gov API information](https://clinicaltrials.gov/data-about-studies/learn-about-api) says to check its data timestamp for current refresh status; this queue fetches current v2 records and records its own generation time, but should be rerun for a time-sensitive editorial review.
