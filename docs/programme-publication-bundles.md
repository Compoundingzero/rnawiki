# Programme publication bundles

The public programme dossier is a versioned publication, not a query over every row whose status
happens to be `PUBLISHED`. Migration `0008_programme_publication_bundles.sql` makes that boundary
explicit; migration `0009_canonical_publication_bridge.sql` adds the protected, reviewed path from
accepted community work to a replacement bundle. Migration
`0010_programme_presentation_bundle.sql` adds a verdict-scoped mechanism map and optional sourced
timeline to that same publication boundary.

## What one publication contains

`programme_current_publications` selects one verdict revision for a programme. That verdict owns
the exact public bundle:

- the programme scope captured in `programme_verdict_scope_snapshots`;
- the trial identities linked through `programme_verdict_trials` and their normalized reviewed fields
  in `programme_verdict_trial_snapshots`;
- the evidence-node revisions linked through `programme_verdict_evidence_nodes`;
- the interpretability revisions linked through
  `programme_verdict_interpretability_assessments`;
- direct verdict claims plus claims linked to those exact node and interpretability revisions; and
- source identity and citation metadata captured in
  `programme_verdict_source_metadata_snapshots`; and
- for `programme-presentation/v1`, three to five ordered rows in
  `programme_verdict_mechanism_steps` with their exact claim links, plus zero or more sourced rows
  in `programme_verdict_timeline_events` with their exact claim links.

Presentation rows are not a parallel editable page. Each mechanism claim must be supported by an
exact saved source snapshot; each stage needs a `SUPPORTS` or `QUALIFIES` claim and a verdict-scoped
dependency. A timeline event additionally requires a `SUPPORTS` claim citing the same snapshot
stored on the event. RNAWiki never stores author-supplied publication/revision events. Those dates
are derived from immutable verdict history and are merged into the dossier only when a real sourced
timeline exists. An empty sourced timeline is valid and hidden.

The public read starts with that pointer, the trial snapshots and those links. It does not include unrelated
programme-global `PUBLISHED` claims, nodes or assessments. Live programme and source rows are
authoring and monitoring inputs for the next proposal; editing them cannot rewrite the current
public bundle. The same is true of live `programme_trials`: a registry refresh may stage changed
trial fields and a later source snapshot, while readers keep the reviewed trial snapshot until a new
bundle is approved.

Source retrieval snapshots remain independently append-only. The source monitor may store a new
retrieval, freshness result or review task without changing the public citation metadata or medical
interpretation.

## Preparation, review and publication

For a programme that already has a published conclusion, the supported authored path is:

There are two deliberate entry points. `POST /api/programme-verdicts/drafts` makes an exact clone
when only the presentation will be replaced. `POST /api/programme-verdicts/successors` accepts one
strict, complete human-authored bundle when the scientific graph or conclusion must change. The
second path replaces the candidate's claims, trial scope, five nodes, interpretability rows,
conclusion, all three summary and fifteen conclusion-field dependencies, mechanism and timeline
together. It resolves exact existing normalized ids and current source snapshots, assigns all new
ids and lineage on the server, validates the full
proposal in the transaction and leaves an unprepared private draft. It is not the one-field
community correction path, and neither entry point changes the public pointer.

1. A steward or administrator calls `POST /api/programme-verdicts/drafts` with the programme id and
   their conflict-of-interest disclosure. The server clones the exact current public scope, trials,
   graph links, dependencies, source metadata and presentation into one unprepared `DRAFT` whose
   predecessor is the current public verdict. The operation is idempotent for the same steward and
   disclosure and refuses a competing active successor. It does not create a first conclusion for a
   source-only programme. Operators can call the same service with `npm run draft:clone-current --
--programme-id <id> --actor-user-id <id> --conflicts-of-interest <statement>`.
2. For a versioned presentation, an administrator or steward sends the complete presentation to
   `PUT /api/programme-verdicts/:id/presentation`. This endpoint replaces the whole mechanism and
   timeline presentation only while the candidate is an unprepared `DRAFT`; it validates exact
   programme claim/source scope and creates the required verdict-scoped dependency rows. Partial
   field edits are not supported.
3. Call the protected `POST /api/programme-verdicts/:id/prepare` for a presentation candidate, or
   `prepareProgrammeVerdictProposal(revisionId)` from
   `lib/queries/programme-verdict-proposal.ts`. It locks and re-reads the stored graph, runs RNA
   Intelligence Groups B–H, captures programme/source metadata, and stores the proposal and input
   digests before moving the verdict to `AWAITING_REVIEW`.
4. Record exactly two independent reviews in `programme_verdict_reviews`, bound to the stored
   proposal digest and engine/input digests. Each expertise tag must have an active, separately
   steward-granted qualification. A reviewer can record only one immutable decision for a version,
   and a second reviewer cannot see the first decision before signing the same bundle. If the two
   decisions differ, a different qualified steward must record an attributed adjudication.
   Two approvals, or an approving adjudication, move the version to `APPROVED`. Matching adverse
   decisions or an adverse adjudication move it to the terminal `CHANGES_REQUESTED` state. That
   version cannot publish or accept another decision; a correction must be prepared as a new
   numbered version against the still-current public predecessor.
5. Call `publishProgrammeVerdictRevision({ revisionId, publisherUserId, expectedProposalDigest })` from
   `lib/queries/programme-verdict-publication.ts`.

These operations are available to signed-in, authorized people through the default review queue
and protected routes: `POST /api/programme-verdicts/drafts`, `POST
/api/programme-verdicts/successors`, `PUT
/api/programme-verdicts/:id/presentation`, `POST /api/programme-verdicts/:id/prepare`, `POST
/api/contributions/:id/implementation`, `GET|POST
/api/programme-verdicts/:id/reviews`, `POST /api/programme-verdicts/:id/adjudication`, and `POST
/api/programme-verdicts/:id/publish`. Stewards manage the append-only qualification roster through
`GET|POST /api/reviewer-qualifications`. The review screen shows the complete digest-bound candidate,
including programme scope, public conclusion wording, studies, evidence nodes, claims, source
snapshots, the complete resolved presentation, Groups B–H findings, and changes from the current
public version. Every resolved presentation source includes the saved source-version id, safe
canonical locator, retrieval time and content hash; review and history do not substitute a live
source row or a title-only citation.

Operators can run the complete-successor import without persisting anything:

```text
npm run draft:successor-bundle -- --bundle-file ./successor.json \
  --actor-user-id <steward-or-admin-id>
```

The default is rollback-only after full proposal and RNA Intelligence validation. Add `--commit`
only after inspecting that output. A committed result is still only an unprepared `DRAFT`; it
cannot publish itself. Repeating the exact request reuses the same untampered draft, while a changed
bundle, disclosure, public predecessor or persisted row fails closed instead of creating a branch.

`programme-presentation/v1` uses proposal schema `programme-verdict-proposal/v2` and engine
`rna-intelligence/evidence-2.1.0`. A revision whose `presentation_schema_version` is `NULL` keeps
the proposal-v1 and `rna-intelligence/evidence-2.0.1` byte contract. Migration 0010 does not backfill
or reinterpret legacy conclusions, and an already prepared legacy candidate remains publishable
with its original digest.

Publication re-locks and rebuilds the proposal, reruns the deterministic engine, and rejects a stale
digest or review. In one transaction it promotes the candidate's exact
`DRAFT`/`MACHINE_CHECKED`/`APPROVED` claims, nodes and assessments; supersedes only the earlier
published revisions with the same logical key; supersedes the previous verdict; publishes the new
verdict; and advances the current-publication pointer. A failed step rolls back the complete swap.

Database triggers freeze prepared bundle links, captured metadata and evidence content. Deferred
guards prevent a current bundle member from being deleted or leaving `PUBLISHED` unless the public
pointer moves to a valid replacement in the same transaction. Deleting the whole parent programme
remains the explicit aggregate-cascade exception. PostgreSQL owners and superusers remain an
infrastructure trust root because they can disable or replace database guards.

## Contribution and source-review boundary

An accepted correction/challenge means **accepted for implementation**, not published. Migration
0009 implements the bridge without weakening that boundary:

1. A steward materializes an unchanged, accepted contribution from its locked database digest.
2. When the programme already has a public conclusion, the service copies that exact published
   scope, trials, claims, nodes, assessments, source metadata, mechanism stages and timeline events
   into a new draft, applies only the selected correction, runs Groups B–H, and freezes a new
   proposal digest. The old public version remains visible. Summary and verdict contribution fields
   do not edit the mechanism map or timeline; presentation is an explicitly unsupported
   contribution target in this release.
3. If the contribution cites a source-monitor task, the candidate is bound to that task's exact
   pending snapshot. A separate accepted claim or parser-exact trial cites the new snapshot;
   unchanged statements and sourced timeline events keep the exact source version that supported
   them. The publication boundary permits only the new version's immediate predecessor, only on a
   binding copied exactly from the previous public verdict. It never silently re-cites an unchanged
   statement against changed source content. For one unambiguous ClinicalTrials.gov study,
   parser-normalized status, enrolment, results and dates replace the candidate's trial snapshot
   together. Unclassified, ambiguous or multi-study bindings stop for further review.
4. Two separately qualified, independent people review the complete candidate. A disagreement
   requires independent qualified adjudication. Only then can a steward publish the exact reviewed
   bundle.
5. Successful publication atomically advances the public pointer, copies the reviewed scope/trial/
   source metadata into the live monitoring catalogue, advances `currentSnapshotId`, clears the
   matching `pendingSnapshotId`, and resolves only the bound task. Any other open high-impact task
   remains blocking. Direct task-status edits cannot imitate this transaction.

There is one deliberately narrower first-publication exception. A programme created by source
onboarding can have one normalized study but no claims, evidence nodes, assessments, dependencies,
verdicts or public pointer. After an exact task-bound registry correction passes the existing
two-person contribution review, a steward may apply parser-verified programme, trial and source
metadata, advance freshness and resolve that task. The immutable
`programme_contribution_source_task_resolutions` row records the actor, accepted proposal digest,
task and snapshot. This path creates no conclusion. If any scientific graph exists, the request
stops with an explicit full-evidence-workflow requirement.

The remaining boundary is intentional: a newly cited or unverified source is not silently created
or treated as evidence. It must first enter source review and acquire a verified current snapshot.
The bridge also never turns a factual registry correction into a clinical interpretation; a new or
changed conclusion always uses the full candidate, Groups B–H, qualified review and publication
path above.

## Historical 0003 reviews

Reviews created under migration 0003 could have a null reviewer principal and did not carry the
proposal, engine or input digests required by migration 0004. Migration 0004 moves those rows to
`programme_verdict_reviews_legacy_0003` before tightening the active review table. They remain an
audit record with reason `UNBOUND_PRE_0004_REVIEW` and never count as publication approval. This is
safer than inventing reviewer identity or cryptographic provenance during upgrade.

## Migration 0010 rollback and forward restore

0010 is additive to publication data but replaces the `dependent_surface_type` enum and redefines
publication validation functions. There is no automatic destructive down migration. The supported
response to a deployment fault is a **forward restore**:

1. stop presentation authoring, preparation and publication workers;
2. keep the four presentation tables and `presentation_schema_version` column intact so no reviewed
   source links, digests or history are lost;
3. run the last application version only with canonical publication disabled, because code before
   0010 does not understand `MECHANISM_MAP` dependencies or digest-bound presentation rows; and
4. deploy a corrected forward migration, then rebuild and compare a known NULL-presentation v1
   proposal and a presentation/v1 proposal before re-enabling publication.

Before any manual downgrade, take and verify a full database backup and export these tables with
keys and timestamps intact:

- `programme_verdict_mechanism_steps`;
- `programme_verdict_mechanism_step_claims`;
- `programme_verdict_timeline_events`; and
- `programme_verdict_timeline_event_claims`.

A tested manual downgrade must first remove
`programme_current_publications_presentation_validate` and
`programme_verdict_revisions_presentation_validate`, then the four presentation immutability
triggers. Restore the exact 0009 definitions of `rnawiki_reviewed_verdict_claim_ids`, the current
publication validator and the verdict state-entry/immutability functions before dropping
`rnawiki_assert_programme_presentation_v1` and
`rnawiki_validate_programme_presentation_state_entry`. Drop the four presentation tables in link
then parent order, remove `presentation_schema_version`, and restore the 0009
`dependent_surface_type` enum and `programme_dependencies_target_shape` constraint before dropping
`mechanism_evidence_basis`, `programme_timeline_date_basis` and
`programme_timeline_event_type`. Validate every surviving current pointer and run the 0009
publication/read regression suite before commit.

Never delete presentation rows merely to make an old binary start. Those rows can be part of a
reviewed SHA-256 proposal, and removing them destroys the content reviewers actually signed.

## Rollback and restore

0008 is additive for audit data but deliberately changes publication guards and read semantics, so
there is no automatic destructive down migration. The preferred rollback is a **forward restore**:
stop publication workers, deploy the last known-good application while leaving the 0008 tables and
rows intact, diagnose the failure, then deploy a corrected forward migration. Keep canonical
publication disabled while an older application is running because that application neither creates
verdict snapshots nor reads exact bundles.

Before any manual database downgrade, take and verify a database backup and separately export these
audit tables with primary keys and timestamps intact:

- `programme_verdict_scope_snapshots`;
- `programme_verdict_trial_snapshots`;
- `programme_verdict_source_metadata_snapshots`; and
- `programme_verdict_reviews_legacy_0003`.

Do not treat the legacy-review export as an approval source. Those records lack a bound reviewer
principal and proposal/engine/input digests; restoring them into `programme_verdict_reviews` would
manufacture publication authority.

If an operator must remove 0008 after restoring matching pre-0008 application code, use a tested
maintenance transaction and this dependency order:

1. Stop all writers and lock the programme publication, verdict, graph-link and snapshot tables.
2. Drop `claims_current_bundle_guard`, `evidence_nodes_current_bundle_guard` and
   `trial_interpretability_current_bundle_guard`, then drop
   `programme_current_publications_bundle_validate`.
3. Drop `programme_verdict_scope_snapshots_immutable`,
   `programme_verdict_trial_snapshots_immutable` and
   `programme_verdict_source_metadata_snapshots_immutable`.
4. Restore the exact pre-0008 definitions of `rnawiki_guard_verdict_bundle_link`,
   `rnawiki_guard_published_evidence_revision` and `rnawiki_guard_reviewed_graph_link` from the
   checked release artifact. Recreate `programme_current_publications_validate` against
   `rnawiki_validate_current_programme_publication`; recreate the 0003 published-status constraint
   guard and the 0004 scoped-trial guard before enabling pre-0008 publication.
5. Only after those functions no longer depend on the exact-bundle helper, drop the three snapshot
   tables in source-metadata, trial, then scope order; then drop
   `rnawiki_require_current_bundle_member`, `rnawiki_validate_current_bundle_members` and
   `rnawiki_reviewed_verdict_claim_ids`.
6. Validate every existing current pointer with the restored pre-0008 validator before commit, then
   run the pre-0008 publication and public-read regression suites.

Retain the exported snapshot and legacy-review files under the project's medical audit retention
policy even after a downgrade. Dropping those tables without an export destroys the exact reviewed
scope/source/trial history and is not a supported rollback.
