# Programme contribution proposals

`programme_contribution_proposals` is the intake boundary for **Suggest a correction** and
**Challenge this conclusion**. It is intentionally separate from claims, evidence nodes, and
programme verdict revisions: submission creates review work, never public medical content.

## Boundary with older medicine records

The legacy `POST /api/drugs/:slug/revisions` route is not a second way to edit programme evidence.
For a medicine with no identified programme, it accepts exactly one medicine-name or trade-name
correction with a public HTTP(S) source and a short explanation. Every signed-in account may submit
one, and every submitted correction enters one-person independent review. The author cannot review
their own correction, and trust standing never publishes it automatically. The source is stored but
never fetched.

Trials, mechanisms, sponsors, pricing, safety, effectiveness, evidence and conclusions are rejected
at that boundary. They require an identified programme and this proposal workflow so the intended
use, group of people, dose and studies are explicit. Pre-0011 pending revisions that lacked the new
identity/source contract stay in history but are quarantined from the live queue.

## Lifecycle and trust boundary

1. An authenticated account creates a programme-scoped `DRAFT`.
2. Draft writes may change only contributor-authored fields. Programme, author, proposal type,
   proposal key, and revision identity cannot change.
3. Submission re-reads persisted programme evidence. It never accepts machine checks, impact,
   current values, a verdict snapshot, a digest, status, or timestamps from the request.
4. The server locks the current baseline, derives dependency impact, and runs deterministic shape
   and scope rules. Migration `0007` independently validates the frozen row against persisted
   programme state and replaces the digest with PostgreSQL's canonical SHA-256 value.
5. `SUBMITTED` rows are immutable. The only correction path is a new revision linked to the exact
   submitted predecessor, and only after that predecessor resolves to `CHANGES_REQUESTED` or
   `REJECTED`. In-progress review, unadjudicated disagreement, and accepted work cannot be
   superseded.
6. Migration `0006` creates an `AWAITING_REVIEWS` state atomically with submission. It also
   backfills that state for submitted `0005` rows that existed before the review migration.
7. Eligible, non-author reviewers append independent digest-bound decisions. Each review state
   row freezes its own `required_approvals` policy at creation: rows opened before migration
   `0015` resolve at two agreeing reviews, and rows opened afterwards require three. A reviewer
   cannot see any earlier decision until their own decision is committed.
8. Unanimous agreement across the row's required number of reviews resolves deterministically;
   under the three-review policy, two agreeing decisions wait in `AWAITING_THIRD_REVIEW`. Any
   disagreement once at least two decisions exist is public and requires one independent
   steward/administrator adjudication with rationale; an author or any of the reviewers cannot
   adjudicate.
9. `APPROVE` means `ACCEPTED_FOR_IMPLEMENTATION`. It never edits or publishes a programme, claim,
   node, dossier sentence, verdict revision, or current-publication pointer.
10. The public queue exposes frozen COI and safe public-profile attribution (name, handle, and
    optional ORCID), but never raw user ids, email, password data, or private credentials.
11. Every submission, review, adjudication, and revision operation takes the same
    programme/proposal-key advisory lock. A review decision cannot race a new submitted lineage
    leaf, and a disagreement remains in the unresolved public queue until adjudicated.

There is no runtime AI step. The machine checks validate source completeness, field/proposal type,
programme/node scope, current-verdict availability, stopped-verdict applicability, reasoning, and
COI attestation. They do not decide whether a medical claim is true.

There is also no separate contributor or professional account type. The authenticated account id is
written as the proposal author and cannot be replaced through the draft payload. Trust standing and
scientific-review qualifications control later review permissions on that same account; they do not
change who authored the proposal.

## Presentation is not a contribution edit target

The 0010 mechanism map and timeline are whole, digest-bound presentation objects. Contribution
proposals in this release cannot select a mechanism stage, evidence-basis label, timeline event or
presentation source link. Editing `summary.*` or `verdict.*` changes only that selected summary or
conclusion field; it does not silently rewrite the map or timeline.

When accepted work is materialized against an existing public conclusion, the server clones the
current presentation rows and links unchanged and immediately prepares the complete replacement.
There is no presentation-edit window inside contribution materialization. If a steward needs a
deliberate map or timeline revision, they must start the separate clone-current authored workflow,
replace the whole presentation while that new candidate is still an unprepared draft, and prepare
it for independent review. That separate workflow does not silently apply a community proposal.
The service never infers presentation copy from contributor prose.

## Impact preview

Impact is derived only from `programme_dependencies` and the authoritative
`programme_current_publications` pointer:

- a programme correction matches its exact stable field path;
- an evidence-node correction follows every dependency for that exact node revision;
- a verdict challenge unions the exact current verdict/summary field dependencies with the
  dependencies of the selected evidence-chain node.

An empty match is stored as `noDependencyMatch: true`, not replaced with guessed claim ids. This is
a graph-coverage warning for reviewers, not a claim that nothing downstream can change.

## Database guards and rollback

Migration `0005_programme_contribution_proposals.sql` is additive and safe with existing rows. Its
trigger permits draft edits, blocks direct deletion/mutation after submission, enforces exact
non-branching revision lineage, and permits deletion only through the sanctioned parent
programme/medicine aggregate cascade.

Before rollback, export submitted proposals because they are audit records. Then drop the trigger
and guard function, drop the table, and finally drop the four contribution enums. No existing
programme, claim, source, evidence-node, or verdict data needs rewriting.

Migration `0006_programme_contribution_reviews.sql` is additive. PostgreSQL serializes the
reviewer slots, checks reviewer trust and author exclusion, binds each decision to the exact
submitted SHA-256 digest, and derives the review status from immutable review/adjudication rows.
Directly forging `ACCEPTED_FOR_IMPLEMENTATION`, changing/deleting a review, exceeding the row's
required number of reviews, or adjudicating without a recorded disagreement fails at the database
boundary. The only delete exception is the same sanctioned whole-programme aggregate cascade used
by `0005`.

Before rolling back `0006`, export review state, decisions, and adjudications. Then drop its
triggers/functions, three tables, and review-status enum. Rollback does not require changing any
public medical record because `0006` itself never writes one. Current deployments also include the
separate `0009` canonical-publication bridge, so operators must stop its implementation and
publication routes and retain its audit rows before rolling back the contribution-review layer.

Migration `0007_programme_contribution_hardening.sql` is a sequential hardening migration; it
does not rewrite an already-applied `0006`. It adds the shared lineage lock, permits a revision
only after `CHANGES_REQUESTED`/`REJECTED`, validates the authoritative programme/publication/node
snapshots and dependency-derived impact at the database boundary, and assigns the digest from the
canonical validated row. It also makes review, adjudication, and derived-state audit clocks
database-owned. Explicit terminal-status reads remain audit history and therefore retain older
lineage revisions after a corrected child is submitted.

Rollback of `0007` means restoring the `0006` guard function definitions and removing the two
additional proposal triggers/functions. Export immutable proposal/review audit rows first. The
trust boundary assumes normal application/database roles cannot alter functions or disable
triggers; a PostgreSQL superuser remains an infrastructure trust root.

Migration `0015_three_review_consensus.sql` raises the consensus requirement from two agreeing
reviews to three for newly opened review states, with the policy versioned per row. Every review
state row carries an immutable `required_approvals` value (2 or 3) frozen at creation; the
migration backfills all pre-existing rows to 2 so decisions reached under the two-review policy
stay valid without reinterpretation. The derived-state function, the state guard, the review
guard, and the adjudication guard all read the row's own policy: a legacy row still resolves at
two agreeing reviews, a new row waits in `AWAITING_THIRD_REVIEW` after two agreeing decisions,
and any disagreement among at least two recorded decisions still requires one independent steward
adjudication. Rollback of `0015` means restoring the `0007` function definitions, dropping
`required_approvals`, and restoring the fixed two-review count check after exporting any rows
resolved under the three-review policy; the `AWAITING_THIRD_REVIEW` enum value cannot be removed
in place while any row still holds it.

## Accepted work and canonical publication

Migration `0009_canonical_publication_bridge.sql` connects accepted work to the separate canonical
programme-verdict workflow. A steward can materialize the exact accepted proposal, but cannot
publish it directly. Materialization clones the current public bundle from verdict-scoped snapshots,
including its presentation when one exists, applies only the accepted field change, runs RNA
Intelligence Groups B–H, and freezes a new digest.
The replacement then needs exactly two active, steward-qualified independent reviewers who sign that
digest. Disagreement requires a different qualified steward's adjudication. Publication rechecks the
whole bundle and performs one atomic pointer swap; until that commit, the old version stays public.
Two approvals, or an approving adjudication after disagreement, close a version as ready to publish.
Two matching requests for changes, two matching rejections, or an adverse adjudication close that
exact version permanently and leave the public pointer unchanged. Corrected work starts a new
numbered candidate; an adverse decision can never be overwritten by a later approval on the same
version.

A proposal may cite an exact open source-review task and its immutable trigger snapshot. A
ClinicalTrials.gov binding also replaces the candidate trial snapshot with parser-normalized facts;
the task and freshness pointer move only when that same reviewed bundle is published. A strict empty,
unpublished onboarding record can instead resolve parser-verified registry metadata without creating
a conclusion, with its own immutable proposal/task/snapshot audit row. Unknown sources, ambiguous
study matches, multiple trial matches, an existing evidence graph, or unrelated open review tasks do
not take either shortcut.
