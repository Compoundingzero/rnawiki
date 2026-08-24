# First canonical programme-verdict authoring

This workflow is only for a normalized programme with no public conclusion. Once a programme has a
current publication, use the complete-successor workflow in
[`programme-publication-bundles.md`](programme-publication-bundles.md):
`POST /api/programme-verdicts/successors` or the rollback-only-by-default
`npm run draft:successor-bundle` command. Use clone-current only for an exact starting copy and a
presentation-only replacement; it does not replace the scientific graph.

This operator workflow creates the first reviewable canonical conclusion for a development
programme that has no current public conclusion. It does not generate medical text, infer a
mechanism, choose a verdict, or publish anything. A steward supplies a complete structured bundle;
RNA Intelligence checks the resulting exact database graph before any row can commit.

## Operator command

The command defaults to a rollback-only validation. `WOULD_CREATE` means the complete import passed
the exact proposal builder and RNA Intelligence, and the transaction then deliberately rolled back.

```bash
npm run draft:first-publication -- \
  --bundle-file /absolute/path/to/first-verdict-bundle.json \
  --actor-user-id steward_user_id
```

After inspecting the dry-run result, repeat the same command with `--commit`:

```bash
npm run draft:first-publication -- \
  --bundle-file /absolute/path/to/first-verdict-bundle.json \
  --actor-user-id steward_user_id \
  --commit
```

The actor is deliberately supplied outside the JSON. The service verifies that the user exists and
is a steward or administrator. The committed result is still an unprepared `DRAFT`; its engine,
input-digest, proposal-digest and preparation fields remain empty. Use the existing protected
prepare, independent-review and publish workflow afterward.

Start from the
[non-importable JSONC contract template](./first-programme-verdict-authoring-template.jsonc). It
lists every field, dependency path and enum family without pretending that placeholder text is
evidence. The strict importer intentionally rejects that file until its comments and
`_templateOnly` guard are removed and every placeholder is replaced with human-authored,
source-verified content.

## Bundle contract

The root object is strict and uses
`schemaVersion: "programme-first-verdict-authoring/v1"`. Unknown keys are rejected at the root and
inside every nested object. The bundle contains:

- the exact `programmeId`, the current UTC `proposalAsOfDate`, and the author's conflict-of-interest
  statement;
- one or more existing normalized `programmeTrialIds` from that programme; every scoped trial must
  already bind an exact registry source and immutable registry snapshot;
- one or more fully written claims, identified inside the file by stable `claimKey` values, with
  structured claim fields and exact immutable `sourceSnapshotIds`;
- exactly one fully written node for each of the five evidence-chain types—human exposure, useful
  exposure, target engagement, biological response and patient outcome—with explicit claim
  relationships; `UNKNOWN` and `NOT_MEASURED` are authored, source-backed states, not omitted rows;
- either no interpretability assessments, or all five criteria for each trial that is assessed;
  missing knowledge stays missing instead of becoming an invented `UNKNOWN` row;
- every conclusion and 10-second-summary field, plus explicit supporting, contradictory and
  candidate-limitation claim relationships;
- a `dependencies.summary` object containing every path exported by
  `PROGRAMME_SUMMARY_FIELD_PATHS`, and a `dependencies.verdict` object containing every path
  exported by `PROGRAMME_VERDICT_FIELD_PATHS`; every path names at least one authored claim;
- a complete `programme-presentation/v1` mechanism sequence of three to five stages; and
- zero to 100 source-authored timeline events. An empty timeline is valid and remains hidden in the
  dossier. Each event that is present names the exact snapshot cited by one linked `SUPPORTS` claim.

Every authored claim must be reachable from the reviewed graph. Claim citations are persisted as
`SUPPORTS`; contradiction and qualification belong on the claim-to-node, claim-to-verdict,
claim-to-mechanism or claim-to-event relationship. This keeps “the source supports this statement”
separate from “this statement contradicts the conclusion.”

Authored numeric values must fit the database exactly: no more than 20 integer digits and 10
meaningful fractional digits after leading and trailing zero normalization. Values that PostgreSQL
would round or reject are refused before any insert. Claim, node and assessment verification times
must be no later than both the as-of date and the server's transaction authoring time.

## Existing rows and source currency

The import references existing rows for the actor, programme, normalized trials, evidence sources
and immutable source snapshots. It creates new scientific revisions rather than editing those rows.
Every directly used snapshot must be the programme/source freshness row's exact current snapshot,
with no pending snapshot, a successful check, a recorded last successful check, and a next-check due
time that has not elapsed by the end of the as-of date. Retracted and withdrawn sources are rejected.
The same checks apply to each scoped trial's registry snapshot, even when no authored claim cites
that registry snapshot separately.

The service freezes the current programme and normalized-trial fields into verdict-scoped snapshots
and freezes source identity metadata. These are provenance copies, not newly authored medical facts.

## Rows created on commit

One successful commit creates, in a single transaction:

- one verdict revision with `previousVerdictRevisionId = null` and server-owned revision number;
- one programme-scope snapshot and one snapshot/link for each explicitly scoped trial;
- server-ID-owned claim, evidence-node and optional interpretability revisions and their exact link
  rows;
- conclusion links and all explicit summary/verdict dependencies;
- mechanism and optional timeline rows, links and deterministic dependencies for every displayed
  supporting, qualifying or contradictory relationship; and
- one verdict-scoped metadata snapshot for every cited source.

IDs are deterministic hashes of the canonical bundle and server-owned lineage context. The service
also hashes a normalized, order-insensitive representation of the whole authored bundle. An
identical `--commit` retry reconstructs the persisted graph and reuses the same unprepared draft
only when the reconstructed digest and server-owned row invariants still match. A different bundle,
an edited row under the same deterministic ID, or an active competing claim/node/assessment lineage
fails with a conflict.

Replay also compares the frozen programme, trial and source metadata to the locked live catalogue,
checks every import-owned timestamp, and confirms that preparation fields remain empty. If either
the draft provenance or its live catalogue context changed, replay fails closed instead of calling
the altered graph idempotent.

If an earlier first-publication candidate completed review with `CHANGES_REQUESTED`, a later bundle
may create the next revision number. Because there is still no public pointer, its
`previousVerdictRevisionId` remains `null`. Scientific row lineages may advance only from an
unambiguous row belonging to that terminal candidate or from a published/superseded predecessor;
the service never branches an unrelated active draft. Terminal-candidate reachability includes
claims used only by explicit summary, verdict or evidence-node dependency rows.

## Transaction and validation boundary

The service takes a programme advisory lock, verifies that the current-publication pointer is
absent, writes the complete candidate graph, and calls `buildLockedProgrammeVerdictProposal` inside
the same transaction. That builder loads only the exact persisted links and snapshots, constructs
the RNA Intelligence input, and runs every blocking rule. A missing dependency, stale source,
invalid presentation, unbound claim, or other blocker throws and rolls back every new row. Warnings
remain visible for human review; they do not silently become medical conclusions.

Successful dry runs throw an internal rollback signal after validation and return `WOULD_CREATE`.
Successful commits return `CREATED`. An unchanged retry returns `ALREADY_EXISTS`. None of these
outcomes prepares, approves or publishes the draft.

The normal prepare operation is safe after this import: it reuses the already frozen scope, trial
and source metadata rows with conflict-safe inserts, then signs the exact rebuilt proposal rather
than creating a second snapshot set.
