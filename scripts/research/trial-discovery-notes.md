# Bounded trial discovery from the mapped registry snapshot

This read-only queue starts from any exact page slug, joins it to `data/revamp/identity/page-slugs.csv` to get the page key, and reads only that key's `registry.hasResults` row in `data/sources/clinicaltrials/mapped.parquet`. It does **not** use the sparse, hand-curated `pivotalResults` field as its universe. DuckDB is required to query the Parquet file.

```bash
python3 scripts/research/trial-discovery-queue.py --slug dapagliflozin --limit 20
python3 scripts/research/trial-discovery-queue.py --slug dapagliflozin --limit 20 --offset 20
```

Each result is `NAME_CANDIDATE_UNVERIFIED`. The mapper's links are normalized intervention-name matches, not confirmed substance/product identity. A `hasResults`/`resultsPosted` flag says only that summary results were posted for that NCT in the dated snapshot; it does not supply an outcome or show that the requested product was tested for a particular condition. The queue emits NCT pointers, posting dates, provenance, full candidate counts and a bounded page (maximum 100). It never writes files or publishes evidence.

For the 2026-09-01 mapped snapshot, `dapagliflozin` resolves to page key `COMBO:{IK:DNIAPMSPPWPWGF-VKHMYHEASA-N,K1:1ULL0QJ8UC}`. Its `registry.hasResults` value records **323** name-matched trials and **116** results-posted candidates. A request for three returns three NCT pointers and `remainingAfterPage: 113`, preserving the source record ID, date, mapped field, match rule and path. The default order is most recent results posting date first for browsing only, not a relevance or evidence-quality rank.

After selecting a candidate, a reviewer must inspect that same NCT's registered conditions, actual intervention/product form/route, population, outcome groups, comparator, timepoint, numeric estimate and uncertainty. The separate `trial-candidate-queue.ts` can assist with _existing_ registry-cited pivotal rows, but neither queue establishes a programme claim. ClinicalTrials.gov's [API study data structure](https://clinicaltrials.gov/data-api/about-api/study-data-structure) distinguishes protocol and posted-results modules; the [registry API information](https://clinicaltrials.gov/data-about-studies/learn-about-api) explains the changing data timestamp. The mapper's own provenance and name-only limitation are documented in `scripts/revamp/clinicaltrials_map.py`.
