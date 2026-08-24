# Source checks and evidence freshness

## What is monitored today

The scheduled monitor currently checks ClinicalTrials.gov records with an NCT study identifier.
Other source types may be stored and cited, but they are not yet fetched by the scheduler. The
separate Railway worker runs a bounded batch every six hours; each record keeps its own next-check
time, so a six-hour worker schedule does not mean every source is fetched every six hours.

An evidence source is the stable record identity, such as `NCT03399370`. Every changed retrieval is
saved as a new, read-only snapshot with the retrieval time, the exact structured registry payload
and a SHA-256 content hash. The earlier snapshot is retained. RNAWiki does not copy full copyrighted
articles into these snapshots.

## What happens during a check

1. The worker selects a due programme and ClinicalTrials.gov source pair.
2. It fetches the official structured record and saves or reuses its content-addressed snapshot.
3. It compares the new snapshot with the previously checked snapshot.
4. It finds the stored statements and page sections that depend on the changed source.
5. It records the check result, next due time and retry information.
6. If the change may affect meaning, safety or a conclusion, it keeps the public version unchanged
   and creates a visible review task.

Delivery retries are safe: the same observation key reuses the same monitor run and snapshot.
Failures and retry times are stored separately from evidence. A failed check does not erase the
last known source version and is never treated as a negative scientific result.

## The narrow automatic-refresh case

A newly onboarded, unpublished registry programme may have only a study card and no medical
interpretation. For that limited case, the monitor may refresh exact registry fields such as
recruitment status, phase, enrolment, dates, sponsor and the linked snapshot. It does so only when:

- the programme has no public conclusion;
- it has no claims, evidence-chain answers, study assessments, dependent page fields, contribution
  proposals or open review work; and
- nothing outside the permitted exact registry fields changed.

If any of those conditions is false, the new snapshot stays pending for human review. The monitor
never writes a claim, evidence-chain answer, programme conclusion or public publication pointer.

## What readers see

The dossier turns stored check state and dates into these plain labels:

- **Checked on YYYY-MM-DD** — the last successful check is still within its scheduled interval.
- **New evidence found** — a changed source snapshot is waiting for review.
- **Review in progress** — review work has started but the public evidence has not changed.
- **Evidence may be out of date** — the next check is overdue, a check failed or the stored state is
  otherwise stale.
- **Source unavailable** — the provider could not supply the record.
- **Audit not completed** — there is no reliable completed check to report.

A stored `CURRENT` row is displayed as out of date once its `nextCheckDueAt` time passes. RNAWiki
does not say “up to date” without both a policy deadline and a recorded successful check.

## Review and publication boundary

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
action is `NEEDS_SCIENTIFIC_REVISION`. It cannot enter the exact-refresh submission path. There is no
one-click end-user claim-rewrite form: a steward or administrator must author a complete
source-backed successor evidence record, including its studies, statements, evidence-chain answers,
sources, mechanism map, any sourced timeline events and conclusion. That record then follows the same
qualified two-review publication gate. The monitor does not invent replacement claims or
conclusions.

Simply changing a task status cannot rewrite the medical record. Until the relevant successor is
published, readers continue to see the prior approved version and the new snapshot remains pending.

The technical publication-bundle format, immutable programme/source metadata snapshots and atomic
replacement operation are documented in
[`programme-publication-bundles.md`](programme-publication-bundles.md).

## Operations

The worker command, schedule, retry behavior, alerts and deployment checks are documented in
[`deployment.md`](deployment.md). The onboarding command and its collision and no-invention rules
are documented in
[`clinical-trial-programme-onboarding.md`](clinical-trial-programme-onboarding.md).

The schema began with additive migration `0003_programme_evidence_model.sql`. Later migrations add
publication and contribution safeguards. Before any destructive rollback, stop programme writes,
export programme/source/review history and revert the application to a compatible read path.
