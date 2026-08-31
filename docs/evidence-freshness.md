# Source checks and evidence freshness

## Two monitors, one private worker

RNAWiki has two independent freshness contracts. They share the private Railway cron entry point in
`scripts/source-sync-worker.ts`, but they do not share state or silently convert one kind of result
into the other.

| Monitor                     | Scope                                                                 | Durable result                                                                                 |
| --------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Programme source monitor    | Due ClinicalTrials.gov records attached to development programmes     | Registry snapshot, programme freshness state and, when needed, a source-review task            |
| Recorded-background monitor | Excerpt-bearing sources in current `medicine-background/v1` envelopes | Exact binding, fetch attempt, assertion check and, on confirmed drift, a candidate-memory item |

Both are deterministic and bounded. Neither monitor uses an LLM, authors medical prose, chooses a
replacement source, resolves disagreement or changes a conclusion.

## Shared failure boundary

A fetch result is an operational observation, not a scientific conclusion. Temporary network
failure, a timeout, an HTTP error, an unsupported source kind or an unreadable response is retained
as operational history. It is never treated as evidence against a medicine assertion.

Changed source material is review input. The monitors may store a new immutable snapshot, a frozen
delta, an assertion result, a task or a candidate. They never use that observation to rewrite a
public medical value automatically.

## Programme source monitoring

### What is monitored

The programme monitor checks due ClinicalTrials.gov records with an NCT study identifier. Other
programme source types may be stored and cited, but this monitor does not yet fetch them. Each
programme/source pair retains its own next-check time, so the six-hour worker schedule does not mean
every registered study is fetched every six hours.

An evidence source is the stable record identity, such as `NCT03399370`. Every changed retrieval is
saved as a new, read-only snapshot with its retrieval time, exact structured registry payload and a
SHA-256 content hash. The earlier snapshot is retained. RNAWiki does not copy full copyrighted
articles into these snapshots.

### What happens during a programme check

1. The monitor selects at most 25 due programme and ClinicalTrials.gov source pairs and uses at most
   four concurrent requests.
2. It fetches the official structured record and saves or reuses its content-addressed snapshot.
3. It compares the new snapshot with the previously checked snapshot.
4. It finds the stored statements and page sections that depend on a changed source.
5. It records the check result, next due time and retry information.
6. If the change may affect meaning, safety or a conclusion, it leaves the public version unchanged
   and creates a source-review task.

Delivery retries are safe: the same observation key reuses the same monitor run and snapshot.
Failures and retry times are stored separately from evidence. A failed check does not erase the last
known source version and is never treated as a negative scientific result.

### The narrow automatic-refresh case

A newly onboarded, unpublished registry programme may have only a study card and no medical
interpretation. For that limited case, the monitor may refresh exact registry fields such as
recruitment status, phase, enrolment, dates, sponsor and the linked snapshot. It does so only when:

- the programme has no public conclusion;
- it has no claims, evidence-chain answers, study assessments, dependent page fields, contribution
  proposals or open review work; and
- nothing outside the permitted exact registry fields changed.

If any condition is false, the new snapshot stays pending for human review. The monitor never writes
a claim, evidence-chain answer, programme conclusion or public publication pointer.

### What readers see for programme freshness

The dossier turns stored programme check state and dates into these plain labels:

- **Checked on YYYY-MM-DD** — the last successful check is still within its scheduled interval.
- **New evidence found** — a changed source snapshot is waiting for review.
- **Review in progress** — review work has started but the public evidence has not changed.
- **Evidence may be out of date** — the next check is overdue, a check failed or the stored state is
  otherwise stale.
- **Source unavailable** — the provider could not supply the record.
- **Audit not completed** — there is no reliable completed check to report.

A stored `CURRENT` programme row is displayed as out of date once its `nextCheckDueAt` time passes.
RNAWiki does not say “up to date” without both a policy deadline and a recorded successful check.

### Programme review and publication

The source-review queue shows the exact parser-produced before-and-after fields and records which
stored statements, study assessments and page sections may be affected. The comparison is frozen to
one task, the still-approved baseline snapshot and one pending snapshot. A later pending snapshot
dismisses the older task as superseded without deleting its audit history.

If every changed field is an exact normalized registry fact and the source is not linked to a claim
or interpretability assessment, an authenticated contributor can create a `SOURCE_REFRESH` draft.
The server—not the browser—fills its source identity and frozen delta. The contributor can disclose
conflicts of interest but cannot choose an unrelated field, edit medical prose or supply a
replacement value. After two independent contribution reviews, a steward or administrator may
materialize a complete replacement evidence record. The server clones the current publication and
changes only the parser-normalized registry fields and exact source binding; it does not invent
evidence statements, presentation text or a conclusion. The current studies, statements,
evidence-chain answers, sources and conclusion move together, while a reviewed mechanism map and any
sourced timeline events are inherited only when the current publication already contains them. The
exact proposed record runs the normal RNA Intelligence checks and still requires two independent
qualified reviews before the public pointer can move.

If a source change touches a scientific claim, interpretability assessment or non-exact field, its
action is `NEEDS_SCIENTIFIC_REVISION`. It cannot enter the exact-refresh submission path; a steward
or administrator must author a complete source-backed successor evidence record, including its
studies, statements, evidence-chain answers, sources, mechanism map, any sourced timeline events and
conclusion. That record then follows the same qualified two-review publication gate. The monitor
does not invent replacement claims or conclusions. Simply changing a task status cannot rewrite the
medical record. Until the relevant successor is published, readers continue to see the prior
approved version and the new snapshot remains pending.

The technical publication-bundle format, immutable programme/source metadata snapshots and atomic
replacement operation are documented in
[`programme-publication-bundles.md`](programme-publication-bundles.md).

## Recorded-background source assertions

### Exact bindings

The background monitor does not trust a dossier-wide “last checked” flag. It traverses every current
database envelope and creates one content-addressed binding for each excerpt-bearing source and the
complete local assertion it supports. Each binding retains:

- the medicine and exact envelope digest;
- the exact field path and source path;
- the canonical kind-namespaced source identity;
- the source label, locator, recorded retrieval date and excerpt; and
- the complete assertion digest and an explicit reader-question intent, when one is defined.

One canonical source fetch can serve many bindings, but its assertion results remain separate. A
change to the value, path, source, excerpt or envelope creates a new identity. Unknown field paths
fail closed without a question intent.

### Durable fetch and check history

Migration 0019 adds three immutable observation tables beside the existing `evidence_sources` and
`source_snapshots` tables:

- `background_source_bindings` contains exact source-to-field bindings.
- `background_source_fetches` contains every completed fetch attempt and sanitized failure detail.
- `background_assertion_checks` links one exact binding to one successful fetch and immutable source
  snapshot.

A raw response is held only long enough to hash and compare it. The snapshot stores the content hash,
locator, media type and fetcher version; it does not persist a full second copy of the source body.
JSON endpoints are decoded into their string values before comparison, so JSON escape sequences are
not mistaken for source text.

Fetch results have four meanings:

- `SUCCEEDED` — a non-empty, decodable current artifact was fetched and linked to a snapshot.
- `UNREACHABLE` — the request failed, timed out or returned a non-success HTTP status.
- `UNSUPPORTED` — there is no stable machine-readable adapter for the source kind.
- `FAILED` — a response arrived but could not safely be read or compared, for example empty or
  malformed JSON.

Only `SUCCEEDED` can produce an assertion result:

- `CURRENT` — normalized current text contains the complete recorded excerpt.
- `NUMBERS_CURRENT` — the complete excerpt moved or was reformatted, but every printed number is
  still present by numeric value.
- `DRIFTED` — neither test holds. This is a review signal, not a diagnosis of why the source changed.

The schema reinforces the boundary with composite foreign keys: an assertion check cannot point to
another source's binding, fetch or snapshot, and its fetch status is fixed to `SUCCEEDED`.

### Exact binding to question-level `stale`

The public read path re-derives bindings from the current envelope. It accepts history only when the
drug, full envelope digest and content-addressed binding all match. For each binding it ranks the
latest successful assertion check first and only then asks whether the result is `DRIFTED`.

Consequences:

- A later `CURRENT` or `NUMBERS_CURRENT` check clears an earlier drift.
- A later `UNREACHABLE`, `UNSUPPORTED` or `FAILED` fetch creates no assertion row, so it neither
  creates nor clears drift.
- An edited envelope has new bindings and starts with no stale question until one receives a
  successful confirmed-drift check.
- A binding without an explicit question intent cannot mark a question stale.

The dossier issue boundary additionally requires correctly shaped binding and assertion-check IDs.
Only then can the mapped question receive `stale`. This does not say that two sources disagree:
`not_comparable` remains distinct from disagreement, and a question can retain both `conflicting`
and `stale` issues when both independently apply. Where a consumer can show one coverage state,
`conflicting` takes precedence without deleting the stale issue.

### Drift candidates and the no-rewrite rule

A confirmed `DRIFTED` check emits a deterministic `SOURCE_DRIFT` occurrence into the existing agent
candidate memory. The stable candidate identity is the medicine and semantic field; the occurrence
identity includes the exact envelope/assertion and fetched content hashes plus the checker version.
Retries of the same observation therefore do not invent new review questions, while changed content
resurfaces as a new occurrence.

The candidate records binding, check, fetch and snapshot IDs for a reviewer. It never changes
`drugs.recorded_background`, chooses a replacement source, selects a preferred reading, resolves a
disagreement, changes a conclusion or publishes a correction. The post-repair review-queue project
will provide the broader human workflow; Release A.1 supplies its durable source-drift input.

## Operations and rollback

The combined worker command, exact Railway service name and configuration, schedule, retry behavior
and deployment checks are documented in [`deployment.md`](deployment.md). ClinicalTrials onboarding
and its no-invention rules are documented in
[`clinical-trial-programme-onboarding.md`](clinical-trial-programme-onboarding.md).

The programme schema began with additive migration `0003_programme_evidence_model.sql`. Recorded
background history is added by `0019_recorded_background_freshness.sql`. Before an incompatible
rollback, stop the private worker and preserve source, snapshot, binding, fetch, check, task and
candidate history. Do not delete audit rows or rewrite medical content to make an older image appear
compatible; deploy a corrected forward version.
