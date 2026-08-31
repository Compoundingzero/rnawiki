# Release A.1 implementation and preproduction worklog

**Date:** 2026-08-31
**Status:** implementation and preproduction; this is not a production deployment record

This worklog records the Release A.1 changes and the gates that must be completed before release. It
does not copy counts from the Release A handoff and does not claim that a migration, worker run,
dataset publication or public page has been verified in production. Production results belong here
only after direct measurement, with the deployed commit and UTC time recorded beside them.

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

The Railway source-check service was identified by its exact display name, **RNA Intelligence Source
Sync**. Its service-level **Custom Config Path** must be `/railway.source-sync.toml`; the CLI has no
per-upload config-path flag, and the setting must be read back before a targeted upload.

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

Railway must show `/railway.source-sync.toml` as **RNA Intelligence Source Sync**'s Custom Config
Path before upload, and deployment details must attribute these values to that file. The service
remains private with no domain. Background drift and handled background fetch failures are
successful operational runs; ClinicalTrials item failures and fatal worker/persistence errors exit
non-zero and receive the configured retry.

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

Complete these against the intended release commit before deployment:

- [ ] Confirm the working tree contains only intended Release A.1 changes and both pre-existing
      stashes remain untouched.
- [ ] Run the exact repair dry-runs; apply only against expected values and confirm a second apply is
      a no-op.
- [ ] Run `npm run check:copy` against the full checked-in export.
- [ ] Run `npm run gate`, including disposable-database integration and end-to-end tests.
- [ ] Run `npx drizzle-kit check` and migration tests from a clean database.
- [ ] Review focused commits and push without force or history rewriting.
- [ ] Read back the worker's Custom Config Path and confirm the deployment uses the source-sync file
      and has no domain.
- [ ] Confirm deployment reaches terminal `SUCCESS`; a queued build is not a deployment result.

## Production verification to record after deployment

Do not fill this section from historical counts. Record the deployed commit, UTC time and direct
observations for each item:

- web and worker migration completion;
- exact Railway service settings, six-hour schedule and terminal worker summary;
- persisted binding, fetch and assertion history counts by status without exposing source bodies or
  credentials;
- no assertion rows for failed fetches;
- no stale question without a current-envelope exact binding and latest successful `DRIFTED` check;
- deterministic `SOURCE_DRIFT` candidates for confirmed drift only;
- no automatic change to `drugs.recorded_background`, conclusions or publication pointers;
- full public-copy gate in the dataset publication job; and
- public health, search, dataset manifest and representative dossier checks.

If production verification fails, stop the private worker where necessary, preserve all immutable
history and deploy a corrected forward version. Do not delete freshness rows, weaken TLS, edit a
source excerpt or rewrite medical content to make a check pass.
