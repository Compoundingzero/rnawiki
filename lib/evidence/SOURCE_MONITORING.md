# Evidence source monitoring

`runSourceMonitor(...)` is the provider-neutral orchestration API. It accepts an
`EvidenceSourceAdapter`, a transactional `SourceMonitorRepository`, and a required scheduler
`idempotencyKey`. `monitorClinicalTrialsSource(...)` is the Drizzle-backed callable entrypoint for a
stored ClinicalTrials.gov source.

The workflow records or reclaims the logical monitor run, fetches outside the database transaction,
then atomically:

1. inserts or reuses the content-addressed source snapshot;
2. computes a normalized field-level diff from the prior observed snapshot;
3. resolves claims citing that source and their programme dependencies;
4. advances current/pending freshness pointers;
5. creates a deterministic, de-duplicated review task for any non-low-risk impact; and
6. completes the observable monitor run.

Interpretive changes leave the existing current snapshot in place and put the new snapshot in
`pendingSnapshotId`. The service never updates claims, evidence nodes, verdict revisions, programme
current-publication pointers, or public prose. A separate reviewed publication workflow must resolve
the task and publish atomically.

Snapshot, monitor-run, and review-task IDs are derived from stable source/job inputs, while row
locks serialize freshness updates. Redelivery returns the stored terminal outcome without fetching
again. Retryable failures record the next attempt time, and a configurable worker lease lets a later
attempt recover a run abandoned in `RUNNING` state.

Use a new idempotency key for each scheduled observation, for example a durable queue job ID. Reuse
the same key only for delivery retries of that logical observation.

## Scheduled ClinicalTrials.gov sync

`runDueClinicalTrialsSourceBatch(...)` is the dependency-injected batch boundary. Its production
query reads normalized `programme_trials.registry_source_id` links to ClinicalTrials.gov evidence
sources and selects at most the requested limit:

- programme/source pairs with no freshness row yet;
- pairs whose check status is `NOT_CHECKED` and which have no scheduled deadline yet; and
- pairs whose persisted `nextCheckDueAt` is at or before the batch observation time.

A future deadline always wins, including for `NOT_CHECKED` and failed rows, so the batch does not
poll early or bypass persisted retry backoff.

An exhausted failed check with no next deadline is not silently rescheduled. It needs an explicit
operator decision. Rows are de-duplicated at the programme/source boundary even when more than one
programme trial points to the same registry source.

Each batch item derives `ctgov_observation_<sha256>` from the engine version, programme ID, source
ID, normalized NCT identifier, and `lastSuccessfulCheckAt` (or `NEVER_SUCCEEDED`). The mutable retry
deadline and batch execution timestamp are excluded. This means scheduler redelivery and persisted
adapter retries reclaim the same monitor run; a successful observation advances the watermark and
therefore the next cycle's key.

Run one bounded production batch with:

```sh
npm run sync:clinical-trials -- --limit 25 --concurrency 4
```

The CLI writes exactly one JSON summary to stdout. A source-level failure is isolated, appears in
the result array, and does not prevent remaining due sources from running. The process exits nonzero
when any item failed or when the due query/batch itself failed. `IN_PROGRESS` leased runs are
reported separately and do not fail the batch. Limits are capped at 100 rows and concurrency at 10.

The scheduled entrypoint calls only the source monitor. It does not write claims, evidence nodes,
verdict revisions, publication pointers, or public prose, and it never promotes a pending snapshot.
