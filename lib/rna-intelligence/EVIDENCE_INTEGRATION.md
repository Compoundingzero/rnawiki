# RNA Intelligence 2.0/2.1 evidence integration

`runEvidenceIntelligence(input)` is the deterministic Groups B–H companion to the existing Group A
`runFullDeterministicSweep(...)` API. It has no database, network, UI, model, or system-clock access.
Callers must normalize persisted evidence into `EvidenceIntelligenceInput` and supply an explicit
`asOfDate`.

## Record mapping

| Engine input         | Persistence responsibility                                                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `medicine`           | Stable medicine identity only; do not copy indication-specific conclusions here.                                                                                                                            |
| `programmes`         | One development programme per indication/population/dose/route context, including status and current verdict pointer.                                                                                       |
| `trials`             | Normalized trial records linked to both medicine and programme by stable identifiers.                                                                                                                       |
| `sources`            | Source records with external identifier, canonical locator, hierarchy, resolution, and correction status.                                                                                                   |
| `sourceSnapshots`    | Immutable retrieval snapshots with content/metadata hash and previous-snapshot link.                                                                                                                        |
| `claims`             | Immutable claim revisions, including canonical result direction (`INCREASE`/`DECREASE`/etc.), nature, sources, scope, and result structure. Node/source support relationships remain on their link records. |
| `evidenceNodes`      | Current programme evidence-chain node revisions linked to supporting and contradicting claim IDs.                                                                                                           |
| `verdicts`           | Human-authored programme verdict revisions and their complete scope/supporting-claim links.                                                                                                                 |
| `tenSecondSummaries` | Three separately editable summary parts, each linked to its supporting claim revisions.                                                                                                                     |
| `dependencies`       | Directed source/fact → claim → node → summary/verdict/surface edges with review-impact classification.                                                                                                      |
| `changes`            | A source-monitoring or edit diff for this run; source changes must name the new immutable snapshot.                                                                                                         |
| `presentation`       | Optional `programme-presentation/v1` mechanism/timeline input built only from verdict-scoped rows. Every claim link carries only exact snapshot ids whose claim-source relationship is `SUPPORTS`.          |

The current medicine-global `DrugDossier` cannot be losslessly mapped to programmes. Until normalized
programme records exist, keep legacy content as an explicitly labelled fallback. Do not manufacture a
programme, population, dose, trial result, claim, source, evidence state, or verdict to make the engine
pass.

## Where it runs today

This is an implementation map, not a list of future intentions:

| Boundary                                   | Check that actually runs                                                                      | Stored proof                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Ingestion and enrichment, where applicable | Group A `runFullDeterministicSweep(...)`                                                      | Structure report/hash for the stored molecular or sequence input        |
| Correction or conclusion-challenge draft   | The narrower contribution shape, source, scope and conflict-of-interest rules                 | Frozen contribution checks, impact preview and SHA-256 content digest   |
| Programme-verdict preparation              | Full Groups B–H `runEvidenceIntelligence(...)` over the locked database graph                 | Engine version, input digest and complete proposal digest               |
| Programme-verdict publication              | Rebuilds the same graph and reruns Groups B–H; a digest mismatch stops publication            | The signed digests, reviewer records and immutable public revision      |
| ClinicalTrials.gov monitor                 | Provider-specific exact-field normalization plus full-record hash/diff and dependency lookup  | Immutable source snapshot, monitor run, freshness state and review task |
| Exact task-bound source-refresh intake     | Server-owned parser delta, current task/source/freshness binding and eight fixed intake rules | Immutable delta digest, contribution digest and two-person review state |

Contribution checks and the source monitor deliberately do **not** claim to be full Groups B–H
runs. A contribution is intake for review, not published medical content. The monitor identifies
what changed; it does not decide what that change means.

A `SOURCE_REFRESH` intake exists only for a current ClinicalTrials.gov task whose cumulative
baseline-to-pending comparison contains parser-exact registry fields and no linked claim or study
interpretability change. The server supplies that comparison; the contributor cannot add a selected
field, replacement value or prose. The narrow intake rules and two contribution decisions are not
the full engine. After acceptance, `materializeAcceptedContributionCandidate(...)` applies only the
saved normalized fields to a clone of the current bundle; that candidate then runs Groups B–H and
the ordinary two-qualified-review publication gate. A `NEEDS_SCIENTIFIC_REVISION` task cannot enter
this path and must use a complete human-authored successor bundle instead.

When `presentation` is absent, the engine remains
`rna-intelligence/evidence-2.0.1` and the proposal remains
`programme-verdict-proposal/v1`. When a complete `programme-presentation/v1` input is present, the
engine selects `rna-intelligence/evidence-2.1.0` and proposal v2. The presentation input includes
the exact copy, order, evidence basis, claim relationships, `SUPPORTS` source snapshots, timeline
dates/types and verdict-scoped dependency entities. Callers must not add live source metadata,
decorative timeline events or generated mechanism text.

Future call sites should not be documented here until the code invokes the engine and persists its
result. If a new boundary runs the full engine, it must rebuild input from stored rows rather than
accepting a browser-supplied report.

## Output handling

- `BLOCK`: the structured revision is internally inconsistent and is not publication-eligible.
- `WARNING`: publication may be possible, but a reviewer should read the named limitation.
- `REVIEW_IMPACT`: a changed fact affects the named dependent content. Use `impactPlan` to create the
  correct exact-data, interpretive, verdict-impact, or safety-critical task.
- `canPublish`: means only “no deterministic blocker.” It never means clinically correct.
- `humanJudgment.verdictSelectedByEngine` is always `false`.

The report intentionally contains no generated timestamp. Semantic dates and the caller-supplied
`asOfDate` are input facts; the deterministic digest is derived only from engine version plus canonical
input. Store operational run timestamps outside the report if needed.

Canonical enum tuples and types come from `lib/evidence/types.ts`. The integration adapter must map
node-claim links to `supportingClaimIds` / `contradictingClaimIds`; it must not reinterpret the claim's
scientific result `direction` as a support relationship. `SPONSOR_DISCLOSURE` is a source type, not a
source-hierarchy tier. The four canonical review-impact values pass through unchanged.

## Publication dependency targets

Dependency edges should cover, where applicable: programme summary, evidence nodes, timeline, verdict,
selected-programme metadata, search document, browse/API output, homepage card, structured metadata,
counts, and revision history. For any impact above `LOW_RISK_EXACT_DATA`, keep the current published
programme revision public until a reviewed replacement can be published atomically.

Presentation mechanism dependencies use `MECHANISM_STEP` entities and presentation timeline
dependencies use `TIMELINE_EVENT` entities whose ids include the verdict revision and stable item
key. Migration-0009 trial/source-monitor `TIMELINE` dependencies with no verdict id remain valid for
legacy change tracking, but they cannot satisfy a presentation event's 2.1 rule.

## Persisted publication boundary

The public programme query follows `programme_current_publications` to one verdict and reads only
that verdict's exact trial, evidence-node, interpretability and claim links. It reads normalized
trial fields, programme scope and source identity from verdict-scoped snapshots captured at proposal
preparation, not from mutable live catalogue rows. Therefore an unrelated programme-global row with
`PUBLISHED` status, a new source retrieval, or an edit staged for the next review cannot silently
enter the public record.

`prepareProgrammeVerdictProposal(revisionId)` remains the canonical internal preparation entry
point. For an already published programme, `createProgrammeVerdictDraftFromCurrentPublication(...)`
is the production entry point: it clones the exact current bundle into an editable, unprepared
successor and refuses to invent a first conclusion. A broad, deliberately authored scientific
replacement uses `authorSuccessorProgrammeVerdictDraft(...)` instead. It takes the same strict
complete bundle contract used for first publication, binds it to the exact current public
predecessor under one programme lock, creates new versioned graph rows from exact normalized trials
and current saved source snapshots, and transactionally rebuilds Groups B–H. Its default CLI mode
rolls the validated import back. A committed import remains unprepared and private until the normal
review path succeeds. For a presentation-only candidate, the supported
external path then replaces the complete unprepared draft through
`replaceDraftProgrammePresentation(...)` and calls
`prepareDraftProgrammePresentation(...)` through the protected route. Partial presentation patches
are intentionally unsupported.
`materializeAcceptedContributionCandidate(...)` now reaches it from an unchanged accepted
contribution after cloning the current snapshot-backed public bundle, including its presentation
rows and links when present, and prepares that contribution candidate immediately; it has no
presentation-edit window. A task-bound ClinicalTrials.gov
candidate also normalizes the exact pending registry snapshot into its reviewed trial snapshot before
Groups B–H run. `publishProgrammeVerdictRevision({ revisionId, publisherUserId,
expectedProposalDigest })` is the canonical atomic publication entry point. It promotes the exact
eligible graph revisions, supersedes replaced logical revisions, synchronizes reviewed live staging
metadata, resolves only a bound source task, advances freshness and moves the public pointer in one
transaction. Exactly two active, steward-qualified independent digest-bound reviews are required;
disagreement adds an independent qualified adjudication. A strictly empty unpublished onboarding
record has a separate audited parser-exact metadata resolution that creates no verdict. Full storage
invariants and the explicit source boundaries are documented in
[`docs/programme-publication-bundles.md`](../../docs/programme-publication-bundles.md).
