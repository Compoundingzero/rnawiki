# Release A.1 implementation and production worklog

**Date:** 2026-08-31
**Status:** released and directly production-verified

This worklog records the Release A.1 changes, complete release gate, deployment and direct production
measurements. Counts below came from the 2026-08-31 production deployment, worker run and published
snapshot; they are not copied from the Release A handoff.

## Release scope

Release A.1 has two narrow outcomes:

1. make the public-copy gate meaningful and identical in local release checks, CI and dataset
   publication; and
2. turn recorded-background source checking into bounded, durable review input with exact
   question-level stale projection.

The release does not add a general review-queue UI, import historical candidates, ingest posted
ClinicalTrials.gov results, expand chemistry or introduce an LLM-backed medical pipeline. A source
observation never rewrites medical content automatically.

## Handoff defects reconstructed

The repository and prior release audits showed four distinct gaps:

- The generated-corpus copy scan matched bare words without enough path or sentence context. It
  mixed genuine RNAWiki self-certification with legitimate wording, recorded identity and source
  excerpts.
- Dataset publication could skip the complete generated-corpus copy arm even though the local gate
  ran it.
- The old background verifier read a curated subset and enumerated only selected modules. It printed
  transient states without durable source-to-field history.
- The reader contract could represent question-level `stale`, but no exact persisted current
  binding supplied it.

The Railway source-check service was identified by exact display name and service ID: **RNA
Intelligence Source Sync** (`aeb98ffa-9ad8-46da-9b38-0f6de81eea9d`). Its recurring false failure was
also identified precisely. A CLI upload consumed the web `/railway.toml`, ran the Next.js build and
failed because the private worker correctly has no `SESSION_SECRET`. The persisted Custom Config
Path is `/railway.source-sync.toml`, but Railway CLI uploads were observed to ignore it. Release A.1
therefore ships an isolated clean-HEAD deploy command that stages the worker file at the upload root.

## A. Public-copy gate

### Exact repairs

The one-time repair table names each classified editorial target by stable medicine identity, exact
path, expected value and replacement. Both repair paths consume that same table:

- the database repair locks the expected row, changes only an exact expected value and is
  idempotent; and
- the checked-in public-snapshot repair changes only the same exact values and then regenerates
  manifest integrity data.

Dry-run and apply commands are paired. The one-time repair ratchet is intentionally not part of the
permanent editorial gate.

### Permanent policy

The generated-corpus scanner now operates on individual JSON paths and sentence-like segments. It
requires a self-certifying phrase and an RNAWiki/page referent in the same segment. Recorded medicine
and trade names, aliases, source excerpts, `textAsRecorded` fields, source attribution and machine
bindings are protected paths. A disliked word in a real name or quotation is therefore not an edit
instruction.

`npm run check:copy` is the single permanent command used by:

- `npm run gate`;
- `.github/workflows/ci.yml`; and
- `.github/workflows/publish-dataset.yml` after export and before manifest verification or commit.

The generated-corpus skip and narrower publication substitute have been removed. Wiring tests pin
that equivalence so a future workflow cannot silently restore the bypass.

## B. Durable recorded-background freshness

### Exact binding model

`lib/background/source-assertions.ts` traverses every excerpt-bearing `BackgroundSource` in a current
`medicine-background/v1` envelope. It emits content-addressed bindings carrying exact field/source
paths, canonical source identity, recorded label/locator/date/excerpt, the complete local assertion
digest and an explicit reader-question intent. Nested composition modules have explicit intent
overrides; unknown paths fail closed.

Object key order does not change identity, while changing the medicine, value, source, excerpt,
retrieval date or path does. Fetch identity is deduplicated by the kind-namespaced canonical
`sourceKey`; field assertions are not collapsed merely because they cite the same source.

### Immutable operational history

Migration `0019_recorded_background_freshness.sql` adds:

- `background_source_bindings` for exact envelope/source/assertion relationships;
- `background_source_fetches` for every successful, unavailable, unsupported or failed attempt; and
- `background_assertion_checks` for deterministic checks against successful exact-source snapshots.

The three tables reject updates and deletes. Composite foreign keys prevent a check from borrowing
another source's binding, fetch or snapshot. Existing immutable `source_snapshots` retain fetched
content hashes and non-secret metadata; raw background response bodies are comparison inputs, not a
second stored source corpus.

### Status semantics

Fetch outcomes and assertion conclusions are separate:

- `UNREACHABLE`, `UNSUPPORTED` and `FAILED` are operational fetch outcomes and cannot create an
  assertion check.
- `CURRENT`, `NUMBERS_CURRENT` and `DRIFTED` exist only after a non-empty successful fetch of the
  exact source.
- Numeric fallback compares complete printed values, so 800 does not satisfy 5,800.
- JSON API responses are decoded to text values before comparison.

Temporary failure is not drift. `not_comparable` is not disagreement. Confirmed drift is a review
signal and never a replacement value.

### Candidate memory and public projection

Only a confirmed `DRIFTED` assertion emits a `SOURCE_DRIFT` candidate occurrence. Candidate identity
is stable for the medicine and semantic field; occurrence identity changes with the exact envelope,
assertion, source content or checker version. The evidence payload retains the binding, check, fetch
and snapshot IDs.

The public loader re-derives the current binding set and requires the current drug, full-envelope
digest and exact binding ID. It ranks the latest successful check per binding before filtering for
`DRIFTED`. Therefore:

- a later `CURRENT` or `NUMBERS_CURRENT` check clears an earlier public stale issue;
- a later failed fetch neither creates nor clears it;
- an edited envelope starts unknown rather than inheriting old drift; and
- an unmapped binding cannot mark a question stale.

The issue builder validates persisted binding/check identity again at the dossier boundary. A stale
issue is scoped to the mapped question, not the whole dossier, and remains distinct from a genuine
cross-source conflict.

### Bounded private worker

`scripts/source-sync-worker.ts` combines the existing ClinicalTrials.gov batch with the new
recorded-background batch. Each selects at most 25 source identities with at most four concurrent
requests. Background freshness also has a 20-minute runtime bound. The process emits one sanitized
JSON summary, releases the database pool and exits.

`railway.source-sync.toml` mirrors the required service settings:

- Nixpacks with `./node_modules/.bin/tsc --noEmit`;
- pre-deploy `node --import tsx db/migrate.ts`;
- start `node --import tsx scripts/source-sync-worker.ts`;
- cron `0 */6 * * *`; and
- `ON_FAILURE` with one retry.

Railway shows `/railway.source-sync.toml` as **RNA Intelligence Source Sync**'s Custom Config Path.
For a CLI upload, `npm run deploy:source-sync` archives clean committed `HEAD`, puts that same worker
config at the temporary upload root and uses `--path-as-root`; a bare `railway up` is not permitted.
The service remains private with no domain. Background drift and handled background fetch failures
are successful operational runs; ClinicalTrials item failures and fatal worker/persistence errors
exit non-zero and receive the configured retry.

## Executable coverage added

Focused tests cover:

- path-aware public-copy policy and protected identity/source paths;
- exact guarded repair behavior and workflow wiring;
- exhaustive background-source traversal, stable identity, nested question mapping and no mutation;
- decoded JSON comparison and by-value number matching;
- source fetch status separation and sanitized errors;
- append-only binding/fetch/check persistence, retry safety and cross-source collision resistance;
- `SOURCE_DRIFT` candidate identity and evidence; and
- current-envelope, latest-successful-check question-level stale projection.

These tests are evidence only when run against the release commit. Their presence is not a substitute
for the complete gate.

## Preproduction gates

Completed against release commit `d3b9f469631244d051e4ae7f446f6df9b61fdb5c` before deployment:

- [x] Confirm the working tree contains only intended Release A.1 changes and both pre-existing
      stashes remain untouched.
- [x] Run the exact repair dry-runs; apply only against expected values and confirm a second apply is
      a no-op.
- [x] Run `npm run check:copy` against the full checked-in export: 0 findings.
- [x] Run `npm run gate`: 1,874 unit, 128 integration and 21 browser tests passed; both disposable
      databases were dropped.
- [x] Run `npx drizzle-kit check` and migration tests from clean disposable databases.
- [x] Review focused commits and push without force or history rewriting.
- [x] Read back the worker's Custom Config Path and confirm the deployment carries the exact worker
      build, migration, start, schedule and retry values and has no domain.
- [x] Confirm both web and worker deployments reach terminal `SUCCESS`.

## Production verification

### Deployment identity and guarded medical-copy repair

- Web deployment `8d62334d-ae52-45d8-a40e-61fc770ef815` reached `SUCCESS` on release commit
  `d3b9f469631244d051e4ae7f446f6df9b61fdb5c` on 2026-08-31 UTC. Railway resolved
  `/railway.toml`, Nixpacks, `/healthz` and the intended pre-deploy command.
- Migration `0019_recorded_background_freshness.sql` completed before the web process started.
- The first production copy dry-run reported `repairs=17 wouldApply=17 alreadyApplied=0`; the guarded
  transaction updated exactly 15 medicines; the second dry-run reported
  `wouldApply=0 alreadyApplied=17`. It accepted no unclassified value.
- The same pre-deploy revalidated 9,855 recorded-background envelopes with engine
  `rna-intelligence/background-2.4.0`: 0 failures, 0 new runs and 0 new findings.
- Public `https://rnawiki.com/healthz` returned `ok`. Public caffeine API copy contains the exact
  replacement and not the old self-certification; public search returned five results including
  caffeine.

### Durable worker and immutable history

- **RNA Intelligence Source Sync** deployment `41adc411-a485-4e53-a21c-6ca60fa59507` reached
  `SUCCESS`. It type-checked with `./node_modules/.bin/tsc --noEmit`, ran only migration at
  pre-deploy, starts `node --import tsx scripts/source-sync-worker.ts`, has cron `0 */6 * * *`, one
  `ON_FAILURE` retry and no public domain.
- A preceding upload `ab442b94-6b74-4821-8179-99a1fe081de6` exposed Railway CLI's custom-path bug and
  was stopped during build. It has no deployment-container logs and made no database change.
- The manually triggered bounded run executed from `2026-08-31T10:38:34.237Z` to
  `2026-08-31T10:38:40.281Z`. ClinicalTrials selected 0 due sources. Recorded background saw 5,845
  current source identities, selected and processed 25, and bound 214 exact assertions.
- The run persisted 25 successful fetches and 214 checks: 195 `CURRENT`, 19 `NUMBERS_CURRENT`, 0
  `DRIFTED`; it emitted 0 `SOURCE_DRIFT` candidates and did not hit the runtime bound. There were 0
  failed fetches, so no assertion row could be attached to a failed attempt. With no confirmed
  drift, production question-level `stale` remains empty.
- The worker summary was the sanitized `rnawiki-source-sync/v1` contract; it printed no fetched body,
  source excerpt, URL credential or environment value.

### Production-backed publication and corpus measurements

- GitHub workflow run `33383491462` completed successfully. It exported production, ran the same
  complete `npm run check:copy` policy (0 findings), verified all 13 artifacts, and committed bot
  snapshot `e1c69c5d74ee08213ad32d5209c01d307a2a7843`.
- The snapshot has 9,857 public medicine rows, 9,855 recorded-background envelopes and 1,670
  consensus fields under CC BY 4.0. The exact snapshot repair check reports
  `wouldApply=0 alreadyApplied=17 filesChanged=0`.
- `recorded-background.ndjson` retained SHA-256
  `d8d5a182cd24cff997520205a966bf66de96303211dbd24fda61627870eed0eb` before and after the worker.
  Freshness did not rewrite any recorded medical value.
- The current audit digest is `9bec36d3648101055f39948cc7586e5a65bcca6ddddb39affc8bd4a367d42cf3`:
  consensus is 1,427 agree, 231 differ and 12 not-comparable; values equal to their own dispersion are
  0; 466 records exceed the former twelve-interaction cap; maximum interaction count is 164; licence
  declarations are consistently CC BY 4.0.
- Both pre-existing stashes remain untouched. No local production database was created, no
  production credential was printed, and the preserved openFDA archive and hashes were untouched.

No freshness path writes `drugs.recorded_background`, a conclusion or a publication pointer. A
future verification failure must still preserve immutable history and deploy a corrected forward
version; it must never delete freshness rows, weaken TLS, edit a source excerpt or rewrite medical
content to make a check pass.
