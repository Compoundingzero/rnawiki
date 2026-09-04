# Trial results ingestion — running log

Fetching posted results from ClinicalTrials.gov for trial identifiers already matched to canonical
records, surfacing the stated values, and measuring whether that changes page-to-page overlap.
Operating context for this work is `docs/worklogs/trial-results-BRIEF.md`.

<!-- RESUME BLOCK — keep at the top, rewrite after every phase -->

## RESUME

**Next step: none. Phase 5 stopped on its own stopping rule and is waiting on Felix.**

Overlap did not fall by 0.05 against control on any measure. Phase 6 (verify, deploy, resubmit) was
NOT begun, and must not be until Felix decides whether to ship this anyway, change the strategy, or
drop it. Everything through Phase 4 is built, tested and committed; nothing is deployed and
production is untouched.

**What is already true and does not need redoing**

- 101,831 studies fetched, 0 missing, `failed.ndjson` empty
- 29,240 studies qualified; 2,408 records have a results block attached in the working database
- The surface renders, is typed, lints, and has 15 passing unit tests
- The measurement code and its samples are fixed on disk and reproducible

```bash
cd "/Users/admin/ClaudeRepo/Claude Projects/RNAwiki-corpus-completion"
npx tsx scripts/trial-results/phase5-measure.ts   # re-runs from pages already on disk
```

**If Felix says ship it anyway**, Phase 6 is: full suite, browser verification at 320px and
desktop, then the deploy order below, then IndexNow only once the deploy is verified live.

**Where the machine state lives:** `data/trial-results/state.json` (cursor, counts, verified API
paths), `raw/` (fetched payloads), `extracted/` (transcribed values), `pages/` (2,674 fetched HTML
pages for the measurement), `phase5-measurements.json`, `failed.ndjson` (empty). Every phase is
idempotent; `--force` redoes one deliberately.

**Working database:** `postgresql://admin@localhost:5432/rnawiki_corpus_completion`. Worktree is
`RNAwiki-corpus-completion` on `main`. The `rnawiki_dev` database is drifted and must not be used.

**Deploy order — do not vary it.** `agents:run` READS `data/recorded-background.ndjson`;
`export:dataset` WRITES it; the manifest digest is checked against the **committed** corpus. Three
deployments have already failed on this.

```bash
npm run apply:background
npm run export:dataset -- --output-dir data
git add data && git commit -m "Publish corpus"     # COMMIT before the package is attached
npm run agents:run
npm run attach:agent-datasets
```

**Phase status**

| Phase | What it does                                  | State                     |
| ----- | --------------------------------------------- | ------------------------- |
| 0     | Verify the API results contract                | ✅ complete               |
| 1     | Reconcile counts, build the prioritised queue  | ✅ complete               |
| 2     | Fetch in resumable batches of 250              | ✅ complete               |
| 3     | Extract stated values only                     | ✅ complete               |
| 4     | Attach to records and render                   | ✅ complete, not deployed |
| 5     | Re-measure overlap against control             | ✅ complete — did not clear the bar |
| 6     | Verify, deploy, resubmit                       | ⛔ stopped, awaiting Felix |

<!-- END RESUME BLOCK -->

---

## Phase 0 — API contract verified against real responses (2026-09-03)

Nothing below is remembered. Three studies known to have posted results were fetched live
(`NCT00688597` small terminated phase 2, `NCT01352715` mid-size randomised phase 3, `NCT03014167`
large phase 3), one full payload was written to
`data/trial-results/phase0-specimen-NCT01352715.json`, and the field dictionary was pulled from
`/api/v2/studies/metadata` (342 leaf fields). The shape was then confirmed as a union over a real
250-study batch drawn from our own matched set — `data/trial-results/phase0-union-shape.json`,
200 distinct leaf paths.

**All five required field groups are present.** Exact paths are recorded in `state.json` under
`api.paths`; the load-bearing ones:

- **Reported value:** `resultsSection.outcomeMeasuresModule.outcomeMeasures[].classes[].categories[].measurements[].value`,
  with `spread` for dispersion, `lowerLimit`/`upperLimit` for an interval, and `groupId` pointing at
  the sibling `.groups[]` entry that names the arm. Unit is on the measure
  (`.unitOfMeasure`), as are `.paramType`, `.dispersionType`, `.type` (PRIMARY/SECONDARY) and
  `.reportingStatus`.
- **Participant flow:** `resultsSection.participantFlowModule.periods[].milestones[].type` with
  `.achievements[].{groupId,numSubjects}` — `numSubjects` is a string. Enrolled comes from
  `protocolSection.designModule.enrollmentInfo.{count,type}`.
- **Adverse events:** `resultsSection.adverseEventsModule.eventGroups[].{seriousNumAffected,
  seriousNumAtRisk,otherNumAffected,otherNumAtRisk,deathsNumAffected,deathsNumAtRisk}` per arm, with
  `.frequencyThreshold` governing which `otherEvents[]` are listed at all.
- **Arm definitions:** each results module carries its own `groups[]` with **module-local** ids —
  `OG###` outcome, `FG###` flow, `EG###` adverse events, `BG###` baseline. They do not join across
  modules. Protocol-side arms are `protocolSection.armsInterventionsModule.armGroups[]`. A value is
  tied to an arm through the same module's `groups[]`, never by id across modules.
- **Posting date and certification:** `hasResults`, `statusModule.resultsFirstPostDateStruct.date`,
  `resultsFirstSubmitDate`, `resultsFirstSubmitQcDate`. `statusModule.delayedPosting` exists in the
  field dictionary but was absent from all 250 sampled studies; absence means not delayed.

**A sixth thing the API supplies that the brief did not anticipate.**
`outcomeMeasures[].analyses[]` carries a **registry-stated** between-group difference:
`paramType` + `paramValue`, confidence interval, `pValue`, `statisticalMethod` and a
`groupDescription` naming the comparison in the submitter's own words. Present in **30.0%** of the
sample. This is a stated value, not a computed one, so the editorial rule permits carrying it across
verbatim with its attribution. Nothing is derived from it.

**Transport, measured not assumed**

- Batch lookup **is** supported: `GET /studies?filter.ids=<250 comma-separated NCT ids>` → HTTP 200,
  URL 3,078 chars, 250 studies, ~2.1 s. Per-study fetch is unnecessary.
- `pageSize` caps at **1000**; asking for 1001 silently returns 1000 rather than erroring.
- `fields=` accepts **module names** (`NCTId|HasResults|IdentificationModule|StatusModule|DesignModule|ArmsInterventionsModule|ReferencesModule|ResultsSection`).
  Dotted PascalCase paths are rejected with HTTP 400. Restricting fields cuts a 250-study batch from
  20.1 MB to 15.6 MB.
- **No rate limit is published and none is exposed in headers** — the only `x-` headers are
  `x-envoy-upstream-service-time`, `x-frame-options`, `x-ua-compatible`, `x-xss-protection`. Eight
  back-to-back requests at zero delay all returned 200. The chosen pace (250 ids per request,
  1,500 ms between requests, exponential backoff from 2 s on 429/5xx) is therefore a courtesy, not a
  discovered ceiling.

**What the 250-study sample says about yield** — all drawn from our own matched set with
`hasResults` true:

| Property                                          | Share |
| ------------------------------------------------- | ----: |
| `resultsSection` present                           | 100.0% |
| Outcome measures / participant flow / adverse events | 100.0% |
| Enrolment count present, and `ACTUAL`               | 100.0% |
| At least one PRIMARY outcome measure               | 100.0% |
| At least one PRIMARY outcome **with a value**       | 94.8% |
| **Qualifies** (primary value **and** enrolment)     | **94.8%** |
| Carries a stated between-group analysis            | 30.0% |
| Serious adverse events per arm                     | 100.0% |
| A reference with a PubMed id                       | 64.0% |
| `delayedPosting` true                              | 0.0% |

The 5.2% that fail the bar have a results section whose primary measure is `NOT_POSTED` or carries
no measurement value. That gap is the honest one to report later against the whole set.

---

## Phase 1 — reconciliation (2026-09-03)

**Every figure in the brief reconciles against the database.** Including the one the brief flagged
as unreconciled.

| Figure                                        | Brief   | Database |
| --------------------------------------------- | ------: | -------: |
| Search records                                 |   9,852 |    9,852 |
| Records with at least one match                |   3,569 |    3,569 |
| Registrations matched, uncapped                | 224,946 |  224,946 |
| Stored study rows                              | 148,733 |  148,733 |
| Distinct studies                                | 101,831 |  101,831 |
| Distinct studies with results posted            |  30,556 |   30,556 |
| Records reaching at least one results study     |   2,431 |    2,431 |
| Records with three or more                      |   1,767 |    1,767 |

**148,733 and 224,946 were never in conflict.** They are the same `completion:match-trials` pass
counted two ways. `match-trial-registry.ts` stores at most `MAX_STORED_STUDIES = 250` studies per
record: `result_count` holds the uncapped total (224,946) and the stored `matched[0].studies` array
holds what survived the cap (148,733). The brief's Discrepancies entry can be closed.

**What the cap withheld.** 197 records matched more than 250 registrations, and 76,213
registrations were not stored. The matcher sorts by `nctId` before slicing, so each of those records
kept its **250 lowest NCT ids** — the oldest registrations — and lost the newer tail. All 197 are
records that reach posted results, so their candidate pool for Phase 4 ranking is biased toward
older trials. This is a limit of the stored snapshot, not of this ingestion.

**The queue.** 101,831 distinct studies, sorted by tier then NCT id so the cursor means the same
thing in every session:

- **Tier 1 — 30,556 studies** the 2026-09-01 snapshot recorded as having posted results. These
  reach all 2,431 records. Fetched first, so a run cut off early has still delivered them.
- **Tier 2 — 71,275 studies** the snapshot recorded as having none. Re-checked live, because a
  study may have posted results in the two days since.

## Phase 2 — fetch log

One line per batch. `req` requested, `ret` returned by the registry, `res` carrying a results
section, `miss` requested but not returned (appended to `failed.ndjson`, retried in a separate pass).

| batch | tier | req | ret | res | miss | elapsed |
| ----- | ---- | --- | --- | --- | ---- | ------- |
| 00000 | 1 | 250 | 250 | 250 | 0 | 2.3s |
| 00001 | 1 | 250 | 250 | 250 | 0 | 2.3s |
| 00002 | 1 | 250 | 250 | 250 | 0 | 2.5s |
| 00003 | 1 | 250 | 250 | 250 | 0 | 2.1s |
| 00004 | 1 | 250 | 250 | 250 | 0 | 2.4s |
| 00005 | 1 | 250 | 250 | 250 | 0 | 2.2s |
| 00006 | 1 | 250 | 250 | 250 | 0 | 2.0s |
| 00007 | 1 | 250 | 250 | 250 | 0 | 2.2s |
| 00008 | 1 | 250 | 250 | 250 | 0 | 2.2s |
| 00009 | 1 | 250 | 250 | 250 | 0 | 2.2s |
| 00010 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00011 | 1 | 250 | 250 | 250 | 0 | 2.3s |
| 00012 | 1 | 250 | 250 | 250 | 0 | 2.2s |
| 00013 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00014 | 1 | 250 | 250 | 250 | 0 | 2.1s |
| 00015 | 1 | 250 | 250 | 250 | 0 | 2.0s |
| 00016 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00017 | 1 | 250 | 250 | 250 | 0 | 2.2s |
| 00018 | 1 | 250 | 250 | 250 | 0 | 1.6s |
| 00019 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00020 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00021 | 1 | 250 | 250 | 250 | 0 | 1.9s |
| 00022 | 1 | 250 | 250 | 250 | 0 | 1.9s |
| 00023 | 1 | 250 | 250 | 250 | 0 | 1.9s |
| 00024 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00025 | 1 | 250 | 250 | 250 | 0 | 2.2s |
| 00026 | 1 | 250 | 250 | 250 | 0 | 2.0s |
| 00027 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00028 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00029 | 1 | 250 | 250 | 250 | 0 | 1.9s |
| 00030 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00031 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00032 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00033 | 1 | 250 | 250 | 250 | 0 | 0.9s |
| 00034 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00035 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00036 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00037 | 1 | 250 | 250 | 250 | 0 | 2.2s |
| 00038 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00039 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00040 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00041 | 1 | 250 | 250 | 250 | 0 | 0.9s |
| 00042 | 1 | 250 | 250 | 250 | 0 | 2.3s |
| 00043 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00044 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00045 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00046 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00047 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00048 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00049 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00050 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00051 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00052 | 1 | 250 | 250 | 250 | 0 | 2.2s |
| 00053 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00054 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00055 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00056 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00057 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00058 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00059 | 1 | 250 | 250 | 250 | 0 | 2.1s |
| 00060 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00061 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00062 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00063 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00064 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00065 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00066 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00067 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00068 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00069 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00070 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00071 | 1 | 250 | 250 | 250 | 0 | 1.4s |
| 00072 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00073 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00074 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00075 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00076 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00077 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00078 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00079 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00080 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00081 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00082 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00083 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00084 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00085 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00086 | 1 | 250 | 250 | 250 | 0 | 1.6s |
| 00087 | 1 | 250 | 250 | 250 | 0 | 1.6s |
| 00088 | 1 | 250 | 250 | 250 | 0 | 1.7s |
| 00089 | 1 | 250 | 250 | 250 | 0 | 1.5s |
| 00090 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00091 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00092 | 1 | 250 | 250 | 250 | 0 | 1.4s |
| 00093 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00094 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00095 | 1 | 250 | 250 | 250 | 0 | 1.4s |
| 00096 | 1 | 250 | 250 | 250 | 0 | 1.4s |
| 00097 | 1 | 250 | 250 | 250 | 0 | 1.5s |
| 00098 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00099 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00100 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00101 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00102 | 1 | 250 | 250 | 250 | 0 | 1.4s |
| 00103 | 1 | 250 | 250 | 250 | 0 | 1.4s |
| 00104 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00105 | 1 | 250 | 250 | 250 | 0 | 1.4s |
| 00106 | 1 | 250 | 250 | 250 | 0 | 1.4s |
| 00107 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00108 | 1 | 250 | 250 | 250 | 0 | 1.3s |
| 00109 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00110 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00111 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00112 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00113 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00114 | 1 | 250 | 250 | 250 | 0 | 1.4s |
| 00115 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00116 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00117 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00118 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00119 | 1 | 250 | 250 | 250 | 0 | 1.2s |
| 00120 | 1 | 250 | 250 | 250 | 0 | 1.1s |
| 00121 | 1 | 250 | 250 | 250 | 0 | 1.0s |
| 00122 | 1+2 | 250 | 250 | 56 | 0 | 0.7s |
| 00123 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00124 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00125 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00126 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00127 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00128 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00129 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00130 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00131 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00132 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00133 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00134 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00135 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00136 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00137 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00138 | 2 | 250 | 250 | 0 | 0 | 1.0s |
| 00139 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00140 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00141 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00142 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00143 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00144 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00145 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00146 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00147 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00148 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00149 | 2 | 250 | 250 | 0 | 0 | 0.8s |
| 00150 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00151 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00152 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00153 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00154 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00155 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00156 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00157 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00158 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00159 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00160 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00161 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00162 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00163 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00164 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00165 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00166 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00167 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00168 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00169 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00170 | 2 | 250 | 250 | 0 | 0 | 0.7s |
| 00171 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00172 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00173 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00174 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00175 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00176 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00177 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00178 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00179 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00180 | 2 | 250 | 250 | 0 | 0 | 0.9s |
| 00181 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00182 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00183 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00184 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00185 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00186 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00187 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00188 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00189 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00190 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00191 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00192 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00193 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00194 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00195 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00196 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00197 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00198 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00199 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00200 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00201 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00202 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00203 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00204 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00205 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00206 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00207 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00208 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00209 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00210 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00211 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00212 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00213 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00214 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00215 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00216 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00217 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00218 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00219 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00220 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00221 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00222 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00223 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00224 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00225 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00226 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00227 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00228 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00229 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00230 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00231 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00232 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00233 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00234 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00235 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00236 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00237 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00238 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00239 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00240 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00241 | 2 | 250 | 250 | 0 | 0 | 1.9s |
| 00242 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00243 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00244 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00245 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00246 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00247 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00248 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00249 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00250 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00251 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00252 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00253 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00254 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00255 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00256 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00257 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00258 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00259 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00260 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00261 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00262 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00263 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00264 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00265 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00266 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00267 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00268 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00269 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00270 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00271 | 2 | 250 | 250 | 0 | 0 | 0.8s |
| 00272 | 2 | 250 | 250 | 0 | 0 | 0.7s |
| 00273 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00274 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00275 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00276 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00277 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00278 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00279 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00280 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00281 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00282 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00283 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00284 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00285 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00286 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00287 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00288 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00289 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00290 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00291 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00292 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00293 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00294 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00295 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00296 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00297 | 2 | 250 | 250 | 1 | 0 | 1.2s |
| 00298 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00299 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00300 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00301 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00302 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00303 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00304 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00305 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00306 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00307 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00308 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00309 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00310 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00311 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00312 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00313 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00314 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00315 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00316 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00317 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00318 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00319 | 2 | 250 | 250 | 1 | 0 | 0.5s |
| 00320 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00321 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00322 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00323 | 2 | 250 | 250 | 1 | 0 | 0.5s |
| 00324 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00325 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00326 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00327 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00328 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00329 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00330 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00331 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00332 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00333 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00334 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00335 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00336 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00337 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00338 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00339 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00340 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00341 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00342 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00343 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00344 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00345 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00346 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00347 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00348 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00349 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00350 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00351 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00352 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00353 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00354 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00355 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00356 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00357 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00358 | 2 | 250 | 250 | 1 | 0 | 0.5s |
| 00359 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00360 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00361 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00362 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00363 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00364 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00365 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00366 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00367 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00368 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00369 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00370 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00371 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00372 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00373 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00374 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00375 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00376 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00377 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00378 | 2 | 250 | 250 | 0 | 0 | 0.7s |
| 00379 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00380 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00381 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00382 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00383 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00384 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00385 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00386 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00387 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00388 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00389 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00390 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00391 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00392 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00393 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00394 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00395 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00396 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00397 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00398 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00399 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00400 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00401 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00402 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00403 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00404 | 2 | 250 | 250 | 0 | 0 | 0.4s |
| 00405 | 2 | 250 | 250 | 0 | 0 | 0.5s |
| 00406 | 2 | 250 | 250 | 0 | 0 | 0.6s |
| 00407 | 2 | 81 | 81 | 0 | 0 | 0.3s |

---

## Phase 3 — transcription (2026-09-03)

| Outcome                                          |  Count |
| ------------------------------------------------ | -----: |
| Studies fetched                                   | 101,831 |
| Carrying a results section                        | 30,560 |
| **Qualified** — a primary outcome with a value, and an enrolment count | **29,240** |
| Had a results section but no primary outcome value |  1,320 |
| Had no results section                             | 71,271 |
| Carrying a registry-stated between-group comparison | 11,260 |
| Carrying per-arm serious adverse event counts       | 30,428 |
| Carrying a linked PubMed identifier                 | 41,947 |

30,560 is **four more** than the 30,556 the 2026-09-01 snapshot recorded. Four studies posted
results in the two days between the snapshot and this fetch, and the tier-2 re-check found them.

Nothing was missing: every one of the 101,831 identifiers was returned, `failed.ndjson` is empty,
and the whole fetch took 15.3 minutes with no 429 and no 5xx.

## Phase 4 — attachment (2026-09-03)

2,408 records gain a results block. 1,161 have registrations but nothing that qualified, and their
section says so rather than disappearing.

**2,408, not the 2,431 the brief predicted.** 23 records reach a study the snapshot flagged as
results-posted whose actual results carry no primary outcome value. The brief's 2,431 counts
records reaching a *flag*; this counts records reaching a *usable value*.

Registered titles are **not** printed. 18.1% of the 29,240 qualifying studies carry a title such as
"A Study to Evaluate the Efficacy and Safety of …", and printing one would put a characterisation
of a result on the page in the sponsor's words. The registrations surface withholds titles for the
same reason. Each study is named by its registration identifier and links to the full record.

## Phase 5 — the measurement, and it does not support shipping this for overlap

**The measurement code reproduces the baseline.** POD's 324-record member list was never preserved, so its
design was rebuilt with a fixed seed. The rebuilt corpus sample gives a median page of **5,031
words** against POD's 5,138, and a median nearest-neighbour overlap of **0.867** against POD's
0.877. Close enough to trust the comparison; not the identical sample, so the small gap stands.

**The first control was wrong and was rebuilt.** It sampled every 37th word across the corpus,
which produces word salad — "studied a groups programme the and a supports other of or this status"
— and word salad shares almost no five-word sequence with anything, so it broke positional overlap
better than any real writing could. Three controls replace it: `other` adds contiguous passages from
other pages (the honest like-for-like), `self` adds passages of the page's own text (pure length
effect), and `shuffled` is kept only as a bound.

### Affected sample — 324 records, all gained text, median 8,708 words before, +1,514 added

| Measure                         | before | after | control: other pages | control: own text |
| ------------------------------- | -----: | ----: | -------------------: | ----------------: |
| Lexical, shared vocabulary      |  0.533 | 0.500 |                0.463 |             0.533 |
| Positional, five-word sequences |  0.577 | 0.524 |                0.537 |             0.567 |
| Semantic, embedding cosine      |  0.884 | 0.882 |                0.902 |             0.874 |
| Nearest-neighbour overlap       |  0.735 | 0.714 |                0.719 |             0.728 |

### Corpus-wide sample — 324 records, only 115 of them gained text

| Measure                         | before | after | control: other pages | control: own text |
| ------------------------------- | -----: | ----: | -------------------: | ----------------: |
| Lexical, shared vocabulary      |  0.625 | 0.612 |                0.614 |             0.625 |
| Positional, five-word sequences |  0.672 | 0.671 |                0.694 |             0.672 |
| Semantic, embedding cosine      |  0.914 | 0.911 |                0.917 |             0.910 |
| Nearest-neighbour overlap       |  0.867 | 0.868 |                0.870 |             0.867 |

### Every affected record — 2,431, five-gram containment, 1-in-4 sketch

| | before | after | control: other pages |
| --- | ---: | ---: | ---: |
| Median nearest-neighbour overlap | 0.767 | 0.738 | 0.740 |
| Records below 0.70 | 102 | **355** | 214 |
| Records that did not move at all | — | **0** | — |

Median fall: **0.0286** for the results text, **0.0292** for an equal volume of other pages' text.

### The finding

**Overlap did not fall by 0.05 against control on any measure.** The best like-for-like margin is
positional overlap on the affected sample, where the results text falls 0.053 where other-page text
falls 0.040 — a margin of **0.013**, a quarter of the bar. On the headline nearest-neighbour measure
across all 2,431 records the results text performs **marginally worse** than the control: it moves
the median 0.0286 where an equal volume of other pages' text moves it 0.0292.

Corpus-wide, nothing moved: 0.867 to 0.868, inside noise, because only 2,408 of 9,852 records can
gain anything at all.

The one place the results text clearly beats control is the tail. It pushes **355 records below
0.70** where the control pushes 214 and only 102 started there — 253 records moved across that line
against the control's 112. Every one of the 2,431 moved by some amount; none was untouched.

Why the effect is small is not that the text is boilerplate: only **10.7%** of the added section is
five-word sequences appearing on more than 90% of the other sections. It is that a median affected
page already carried 8,708 words, so 1,514 more is a 17% increase against a page whose overlap is
dominated by what was already there. The measured ceiling POD recorded still governs: removing
shared copy is what moves this number, and adding distinct copy underneath it does not.
