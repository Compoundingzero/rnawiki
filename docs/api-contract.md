# RNAWiki API contract

Every route below is the single agreed shape between the client components and the route handlers.
Change it in one place and both sides break, so change it here first.

All responses are JSON. Errors are always `{ error: string, code?: string, details?: unknown }` with
a real HTTP status — never a 200 carrying an error body.

Rate limits come from `lib/rate-limit.ts`. A limited request returns 429 with
`Retry-After` in seconds.

## Conventions

- A drug is addressed by its **slug** everywhere. The slug is the public id.
- Authentication is the `rnawiki_session` iron-session cookie. Absent or invalid → 401.
- RNAWiki has one account type. Every authenticated write takes its actor from the server session;
  a request body cannot choose another author. Trust standing and scientific-review
  qualifications control later review permissions on that same account.
- Timestamps are ISO 8601 UTC strings.

---

## Search and read

### `GET /api/search?q=<query>&limit=<n>`

Public. Rate limit PUBLIC_API. `limit` defaults 10, max 25.

```
200 { results: SearchHit[] }
SearchHit = { slug, name, tradeName?, modality, approvalStatus, patientFriendlyIndication,
              dossierDepth, summaryBinding, summaryContext }
summaryBinding =
  | { type: 'programme_publication', programmeSlug, programmeTitle,
      verdictRevisionId, inputDigest }
  | { type: 'programme', programmeSlug, programmeTitle }
  | { type: 'medicine_identity' }
```

`patientFriendlyIndication` is the compact public-summary slot retained for compatibility. Its
value is now selected by the same projection as home, browse and the dataset export. When it comes
from a programme, `summaryBinding.programmeSlug` identifies the shareable dossier URL; reviewed
copy also carries the exact verdict revision and RNA Intelligence input digest. It never borrows
the old medicine-wide verdict. `summaryContext` tells the reader whether the sentence is a reviewed
conclusion for a named programme, a programme's listed use, or a medicine-record indication.

Empty query returns `{ results: [] }` without touching the database.

### `GET /api/drugs/:slug`

Public. `?programme=<programme-slug>` selects the same shareable development programme as the web
page. The response includes `programmeDossier`, the programme-aware public view used by the page;
it is `legacy_record`, `programme_unpublished`, or `published_programme`. A normalized but unpublished
programme never inherits the old medicine-wide conclusion.

For a programme-based response, `evidenceAuthority.authoritativeObject` is `programmeDossier`.
`drug` then contains medicine identity and technical-identity fields only. The older medicine-wide
trials, mechanism, confidence, pricing, questions and other evidence-bearing fields move to
`legacyMedicineRecord.fields`, under the explicit status
`legacy_unscoped_not_authoritative`. They remain available for compatibility and audit, but the
response warns that they were not reviewed for the selected use and must not be combined with the
programme dossier. This allow-list boundary also prevents a new legacy evidence field from leaking
into `drug` by default. Legacy-only records retain their original `drug` shape.

`programmeDossier.medicineRecord` is the bounded public projection used to retain useful
medicine-wide context without combining it with the programme conclusion. It can contain populated
condition background, reported pricing with stored citations, conventional comparisons, common
questions, non-operational molecular identifiers, and published community commentary. It never
contains natural-food use, home remedies, or laboratory workflow. The page labels the whole object
as older medicine-wide context; it is not evidence authority for the selected programme.

Operational laboratory workflow
steps are not part of the public payload: for anonymous users and signed-in non-stewards,
`molecularSchema.laboratoryWorkflow` is absent rather than represented by a misleading empty
array. The `access` object states that the field was intentionally restricted. An authenticated
steward or administrator receives the full workflow so the editor can reload the record.

```
200 {
  drug: PublicDrugDossier | DrugDossier | ProgrammeScopedMedicineIdentity,
  access: DossierAccessMetadata,
  programmeDossier: MedicineDossierViewModel | null,
  evidenceAuthority:
    | { scope: 'programme', authoritativeObject: 'programmeDossier', selectedProgrammeId }
    | { scope: 'legacy_medicine_record', authoritativeObject: 'drug' },
  legacyMedicineRecord:
    | null
    | { status: 'legacy_unscoped_not_authoritative',
        authoritativeForSelectedProgramme: false, warning, fields }
}
404 { error: 'No dossier with that slug' }

PublicDrugDossier = DrugDossier with molecularSchema.laboratoryWorkflow omitted
DossierAccessMetadata = {
  laboratoryWorkflow:
    | { status: 'restricted', included: false, reason: 'steward_or_admin_required' }
    | { status: 'full', included: true }
}
```

Legacy `ClinicalTrialRecord` values may include
`endpointStatus: 'met' | 'not_met' | 'not_reported'`. An absent or `not_reported` result must not be
interpreted as a failed endpoint.

### `GET /api/drugs/:slug/evidence?programme=<programme-slug>`

Public. Returns the programme selector and only published claims, evidence nodes, source snapshots,
interpretability assessments, and the authoritative current programme verdict. A known programme
may have `verdict: null`; that means no reviewed programme conclusion is public, not that the
programme failed.

```
200 { evidence: ProgrammeEvidenceReadModel }
404 { error: 'No dossier with that slug' }
```

### `GET /api/drugs?modality=&approvalStatus=&depth=&limit=&offset=`

Public, paginated browse. `limit` max 60.

```
200 { drugs: SearchHit[], total: number, limit: number, offset: number }
```

---

## Accounts

### `POST /api/auth/register`

Body `{ name, email, password, handle?, orcid? }`. Rate limit AUTH.

```
201 { user: PublicUser }
409 { error: 'That email is already registered' }
422 { error, details }   // zod issues
```

### `POST /api/auth/login`

Body `{ email, password }`. Rate limit AUTH. Timing-safe: the same 401 message for an unknown
email and a wrong password.

```
200 { user: PublicUser }
401 { error: 'Email or password is incorrect' }
```

### `POST /api/auth/logout` → `200 { ok: true }`

### `GET /api/auth/me` → `200 { user: PublicUser | null }`

`PublicUser` is the client-safe account shape: no password hash or private operational fields, and
no email for anyone but the account owner. Reviewer standing and scientific qualifications are not
alternative account or login payloads.

### `GET /api/me/contributor-settings`

Authenticated. Rate limit PUBLIC_API. Returns the signed-in account's homepage spotlight controls;
it never returns another account's settings.

```
200 {
  settings: {
    appearInWeeklySpotlight: boolean,
    showSocialLinksInSpotlight: boolean,
    socialLinks: Array<{ platform: 'x' | 'linkedin' | 'github' | 'bluesky', url: string }>
  }
}
```

### `PATCH /api/me/contributor-settings`

Authenticated. Rate limit WRITE. Replaces the same settings object. Social URLs must be canonical
HTTPS profile links on the allowlisted platform host, with at most one per platform. Saving a link
does not make it public: `showSocialLinksInSpotlight` must also be true. The public spotlight labels
these links as supplied by the account and does not treat them as verified identity.

The weekly handle list itself uses current published medicine-answer changes only. A handle already
present in public attribution is eligible by default; `appearInWeeklySpotlight: false` removes it
from the homepage list without removing factual attribution from history.

---

## Community notes

### `POST /api/drugs/:slug/notes`

Authenticated. Rate limit WRITE. Body `{ content }` (1–4000 chars).

```
201 { note: CommunityNote }
401 { error: 'Sign in to post a note' }
```

### `POST /api/notes/:id/upvote`

Authenticated. Toggles. Rate limit WRITE.

```
200 { upvotes: number, hasUpvoted: boolean }
```

---

## Legacy medicine identity corrections

### `POST /api/drugs/:slug/revisions`

Authenticated. Rate limit WRITE. This legacy endpoint accepts one identity field only:

```
Body = {
  field: 'name' | 'tradeName',
  proposedValue: string | null,
  sourceUrl: string,
  sourceTitle: string,
  explanation: string
}
```

`proposedValue` must be a non-empty string for `name`. It may be `null` for `tradeName`, where null
means an explicit removal rather than an omitted field. `sourceUrl` must be an HTTP(S) page on a
public host, without credentials, spaces, control characters, or a local/private/reserved network
address. RNAWiki validates and stores the address but never fetches it.

The route works only for a legacy medicine record with no identified development programme. Any
whole-dossier, trial, mechanism, sponsor, pricing, molecular, safety, effectiveness, evidence, or
conclusion field returns `programme_required`. Those changes must name a development programme so
the use, group of people, dose and studies are explicit.

Every valid correction enters review, including submissions by trusted editors, stewards and
administrators. An identical retry by the same author, against the same baseline and with the same
proposal/source/explanation, returns the existing pending revision instead of creating a duplicate.
No identity correction increments scientific contribution counters.

```
202 { outcome: 'pending_review', revisionId, itemsWaiting, revision: Revision }
401 { error: 'Sign in to continue.', code: 'unauthenticated' }
422 { error, code: 'invalid_input' | 'invalid_source_url' | 'no_change' |
                     'programme_required' }
```

`Revision.identityCorrection` contains the exact immutable `field`, `previousValue`,
`proposedValue`, `sourceUrl`, and `sourceTitle`. `Revision.summary` is the contributor's immutable
plain explanation. The revision and source-detail times are assigned by the database.
`itemsWaiting` is the total live queue size at response time, including this correction. It is not
a durable rank because reviews and new submissions can change the order immediately afterward.

### `GET /api/review-queue?limit=&offset=`

Public. Old unsafe pending revisions are excluded through the quarantine table; their original
rows remain visible in record history.

```
200 { revisions: PendingRevision[], total }
PendingRevision = { id, drugSlug, drugName, authorName, authorHandle?, authorTrustTier,
                    summary, identityCorrection, changedFields, createdAt }
```

### `POST /api/revisions/:id/review`

Requires a current trusted editor, steward, or administrator. Body is strict:
`{ decision: 'approve' | 'reject', note? }`. A decline requires a plain reason; approval omits the
note rather than silently discarding text. The reviewer must be a different person from the author.
Quarantined older rows and revisions without the strict identity detail cannot use this endpoint.

Approval locks the revision and medicine, rejects a stale before-value, and lets the database apply
exactly the one stored identity field in the same transaction as the terminal review decision. The
database assigns the review time and verifies the current reviewer's name and standing. A second
decision returns 409 and terminal history cannot be edited or deleted.

```
200 approval: { revision, drug: PublicDrugDossier | DrugDossier,
                access: DossierAccessMetadata }
200 decline: { revision }
403 { error, code: 'forbidden' | 'self_review' }
409 { error: 'That revision has already been reviewed' }
422 { error, code: 'stale_identity' }
```

## Programme corrections and verdict challenges

These endpoints persist reader proposals for review. None of them writes a claim, evidence node,
verdict revision, public pointer, or dossier prose. All author workspace endpoints require an
authenticated account. The public queue uses safe public-profile attribution (name, handle, and
optional ORCID) while omitting raw user ids and private account fields.

### `GET /api/drugs/:slug/programmes/:programme/contributions`

Authenticated. `programme` accepts the programme id or slug. Returns the canonical persisted
programme/verdict/node context plus every revision authored by the current account, newest first.
If a string matches one row's id and another row's slug, the explicit id match wins. Draft rows
include all editable fields so a browser refresh can resume work. Submitted owner rows also include
safe attributed review feedback as
`review: { reviewState, reviews, adjudication } | null` without reviewer account ids.

```
200 { context: ProgrammeContributionContext,
      proposals: ProgrammeContributionProposalReadModel[] }
404 { error, code: 'programme_not_found' }
```

`context.currentValues[fieldPath]` is the canonical current value for programme, summary, and
verdict fields. Evidence-node values are scoped under
`context.evidenceNodes[n].currentValues[fieldPath]`; a generic node field is never resolved against
the wrong node.

### `POST /api/drugs/:slug/programmes/:programme/contributions`

Authenticated. Creates a `DRAFT` only. Draft content may be partial.

```
body = {
  proposalType: 'CORRECTION' | 'VERDICT_CHALLENGE' | 'SOURCE_REFRESH',
  selectedField?, proposedText?, proposedValue?: string | string[],
  source?: { type?, locator?, identifier?, reviewTaskId?, reviewSnapshotId? },
  claimNature?, evidenceNodeId?,
  proposedStoppedVerdict?: 'IDEA_FAILED' | 'MOLECULE_FAILED' | 'TEST_UNANSWERED',
  reasoning?, whatWasWrongOrMissing?, affects?: 'DISPROVEN' | 'OPEN_QUESTIONS' | 'BOTH',
  conflictsOfInterest?, conflictsOfInterestAttested?
}
201 { proposal, preview: { machineChecks, impactPreview } }
```

A correction targets `programme.*` or `evidenceNode.*`. A verdict challenge targets `summary.*`
or `verdict.*` and must name the published evidence-chain node it says would change. A stopped
verdict code is accepted only for a STOPPED/WITHDRAWN programme. Cross-programme and unpublished
node ids are rejected.

`SOURCE_REFRESH` is the narrow task-bound exception. Its body supplies only the exact current
`reviewTaskId`/`reviewSnapshotId` plus the contributor's conflict disclosure. The server loads the
ClinicalTrials.gov identity and immutable parser comparison from that task; browser-supplied source
identity, target fields, values, claims and prose are not authoritative. A task marked
`NEEDS_SCIENTIFIC_REVISION` remains visible with structured reasons but cannot enter this submission
path. It requires a complete human-authored successor evidence bundle.

### `PATCH /api/contributions/:id`

Authenticated owner, `DRAFT` only. Body is the partial draft shape above without `proposalType`.
Returns `{ proposal, preview: { machineChecks, impactPreview } }`. Server-owned keys such as
`machineChecks`, `impactPreview`, snapshots, status, and digest are rejected by the strict schema.
For `SOURCE_REFRESH`, only the conflict-of-interest text and attestation are editable; the saved
registry comparison and task binding are read-only.

### `POST /api/contributions/:id/submit`

Authenticated owner. Body must be empty. Inside one transaction the server locks/re-reads the
current programme, publication/verdict, selected node, and dependency rows; computes checks and
impact from persisted state; and stores immutable current-value and verdict snapshots. The `0007`
database trigger independently validates that frozen bundle and assigns its canonical SHA-256
digest. The request cannot supply any of those values.

```
200 { proposal }
409 { error, code: 'machine_checks_failed',
      details: { machineChecks, impactPreview } }
409 { error, code: 'stale_public_baseline' | 'proposal_frozen' }
```

Submission requires the selected field, proposed content, complete typed source citation, known
claim nature, reasoning, what was wrong/missing, conclusion scope, and attested COI disclosure.
Warnings about missing dependency coverage do not invent impact; they leave an explicit zero-edge
preview for reviewers.

A source refresh additionally rechecks that the task is still current, the pending snapshot still
matches, the source identity is the exact task source and the saved delta remains
`CANONICAL_REFRESH`. A newer source version makes the old draft stale. The submitted row freezes
eight fixed source-refresh checks and the database-owned delta and contribution digests; it contains
no authored replacement medical text.

### `POST /api/contributions/:id/revise`

Authenticated owner; body empty. Creates (or idempotently returns) the single next `DRAFT`
revision only when the predecessor is `CHANGES_REQUESTED` or `REJECTED`. Submitted content is never
edited in place. `AWAITING_REVIEWS`/`AWAITING_SECOND_REVIEW`, `DISAGREEMENT`, and
`ACCEPTED_FOR_IMPLEMENTATION` return `409` with `review_in_progress`, `adjudication_required`, and
`proposal_accepted`, respectively.

```
200 { proposal: { status: 'DRAFT', proposalKey, previousProposalId,
                  revisionNumber, programmeId, proposalType, ... },
      preview: { machineChecks, impactPreview } }
```

### `GET /api/contribution-review-queue?limit=&offset=&type=&status=`

Public. Drafts never appear. Without `status`, this is the unresolved queue only:
`AWAITING_REVIEWS`, `AWAITING_SECOND_REVIEW`, and `DISAGREEMENT`, oldest first. An explicit
`status=ACCEPTED_FOR_IMPLEMENTATION|CHANGES_REQUESTED|REJECTED` reads terminal public audit
history rather than leaving resolved work in the pending queue. Terminal status filters retain
older lineage rows even after an N+1 revision is submitted; latest-open-leaf suppression applies
only to the default unresolved projection.

Rows return proposed content, typed source, structured current/proposed diff, the frozen
checks/impact/digest, attested contributor COI, safe contributor attribution, a human-readable
frozen evidence-node target, and aggregate review state. The first reviewer decision remains
hidden while the second reviewer is pending. Once two reviews agree or disagree, the safe
attributed reviewer decisions are public; a completed adjudication also exposes its rationale and
safe adjudicator attribution. Raw user ids, email, password data, and private credentials are
never returned.

```
200 { proposals: PublicContributionProposal[], total: number }
```

### `GET /api/contributions/:id/reviews`

Authenticated. Returns the review state and caller eligibility. A potential second reviewer who
has not decided receives `reviews: []`; after the caller submits their own review, or after the
proposal reaches disagreement/terminal state, the attributed decisions are visible.

```
200 {
  reviewState: { status, reviewCount, requiredReviewCount: 2, consensus,
                 updatedAt, resolvedAt },
  eligibility: { canReview, reason },
  adjudicationEligibility: { canAdjudicate, reason },
  myReview: ContributionReviewView | null,
  reviews: ContributionReviewView[],
  adjudication: ContributionAdjudicationView | null
}
```

Review attribution is `{ name, handle, orcid? }`. A review includes expertise tags, decision,
independence and COI attestations/disclosure, optional `reviewNote`, and `reviewedAt`; no raw
reviewer id is serialized.

### `POST /api/contributions/:id/reviews`

Authenticated trusted editor, steward, or administrator; never the proposal author. One immutable
decision per account and at most two decisions per proposal.

```
body = {
  decision: 'APPROVE' | 'CHANGES_REQUESTED' | 'REJECT',
  expertiseTags: VerdictReviewerExpertiseTag[],
  independenceAttested: true,
  conflictsOfInterest: string,
  conflictsOfInterestAttested: true,
  reviewNote?: string
}
201 ContributionReviewReadResponse
```

`reviewNote` is required for `CHANGES_REQUESTED` and `REJECT`, and optional for `APPROVE`. The
digest, reviewer identity, attribution snapshots, and timestamps are server-owned; unknown keys
are rejected.

### `POST /api/contributions/:id/adjudication`

Authenticated steward/administrator, only for `DISAGREEMENT`, and never the author or either
ordinary reviewer.

```
body = {
  decision: 'APPROVE' | 'CHANGES_REQUESTED' | 'REJECT',
  rationale: string,
  expertiseTags: VerdictReviewerExpertiseTag[],
  conflictsOfInterest: string,
  conflictsOfInterestAttested: true
}
201 ContributionReviewReadResponse
```

`APPROVE` resolves to `ACCEPTED_FOR_IMPLEMENTATION`; it does not auto-publish. Applying an
accepted proposal requires a separate canonical programme/verdict publication operation.

## Canonical mechanism and timeline presentation

These routes are for steward/administrator publication work, not community draft editing. They
operate only on an unprepared canonical `DRAFT` verdict revision. The request cannot supply an
engine report, digest, review, publication date or public pointer.

### `POST /api/programme-verdicts/drafts`

Authenticated steward or administrator. Clones the exact current public canonical bundle into one
editable, unprepared successor. This is the production entry point for the whole-presentation
`PUT` below; it does not invent a first conclusion.

```text
body = { programmeId: string, conflictsOfInterest: string }
201 { draft: { revisionId, programmeId, previousVerdictRevisionId, revisionNumber,
               presentationSchemaVersion, reviewStatus: 'DRAFT',
               proposalPreparedAt: null, reused } }
403 { error, code: 'draft_not_authorized' }
409 { error, code: 'current_publication_required' | 'successor_candidate_exists' |
                     'draft_request_conflict' | 'current_publication_incomplete' }
```

The body is strict. The server owns author, lineage, version, digests and timestamps. Repeating the
same request by the same steward reuses the sole matching unprepared draft; a changed disclosure or
any competing active successor fails instead of branching the canonical lineage. The same service
is available to operators through:

```text
npm run draft:clone-current -- --programme-id <id> --actor-user-id <id> \
  --conflicts-of-interest <statement>
```

### `POST /api/programme-verdicts/successors`

Authenticated steward or administrator. Authors a complete replacement candidate against the
exact current publication. The strict body uses the complete
`programme-first-verdict-authoring/v1` bundle contract: programme id, current UTC as-of date,
conflict disclosure, exact normalized trial ids, every new claim and source-snapshot id, exactly
five evidence nodes, complete per-trial interpretability sets when present, every conclusion and
summary field dependency, three to five mechanism steps, and the complete sourced timeline.

```text
body = ProgrammeFirstVerdictAuthoringBundle
200|201 { draft: { schemaVersion, mode: 'COMMIT',
                    outcome: 'CREATED' | 'ALREADY_EXISTS', programmeId, revisionId,
                    revisionNumber, previousVerdictRevisionId, bundleDigest,
                    reviewStatus: 'DRAFT', proposalPreparedAt: null, reused,
                    validation: { engineVersion, inputDigest, proposalDigest } } }
403 { error, code: 'successor_draft_not_authorized' }
409 { error, code: 'successor_draft_current_publication_required' |
                     'successor_draft_candidate_conflict' |
                     'successor_draft_idempotency_conflict' | ... }
422 { error, code: 'invalid_input' | 'successor_draft_trial_scope_mismatch' |
                     'successor_draft_snapshot_not_current' |
                     'successor_draft_source_unusable' |
                     'successor_draft_validation_*' | ... }
```

Caller-owned ids, lineage, timestamps, statuses, digests and review state are not body fields. The
server accepts only trials from the named programme and only exact current, fully checked source
snapshots with no pending version; stale, pending, retracted, withdrawn and cross-programme inputs
roll back. It creates new versioned graph rows, runs the canonical proposal builder and RNA
Intelligence validation in the same transaction, and does not prepare or publish the result. The
old public pointer and bundle stay authoritative until the separate prepare, qualified-review and
publish routes succeed.

The operator CLI consumes the same strict JSON and is rollback-only unless `--commit` is supplied:

```text
npm run draft:successor-bundle -- --bundle-file ./successor.json \
  --actor-user-id <steward-or-admin-id> [--commit]
```

Use this whole-bundle path for broad scientific revision. Use the community correction/challenge
workflow for a supported small field change, and clone-current plus the presentation `PUT` when
only mechanism/timeline presentation changes.

### `PUT /api/programme-verdicts/:id/presentation`

Authenticated steward or administrator. Replaces the complete presentation; there is no partial
patch route.

```text
body = {
  mechanismSteps: Array<{
    stepKey, stepOrder: 1..5, plainTitle, plainDescription,
    technicalDescription?: string | null,
    evidenceBasis: 'MEASURED_IN_PEOPLE' | 'MEASURED_OUTSIDE_PEOPLE' | 'PREDICTED' | 'UNKNOWN',
    claimLinks: Array<{ claimId, relationship }>
  }>, // exactly 3..5, contiguous order; each has SUPPORTS or QUALIFIES
  timelineEvents: Array<{
    eventKey, eventDate, eventType, dateBasis, plainTitle, plainDescription,
    technicalDescription?: string | null, programmeTrialId?: string | null,
    sourceId, sourceSnapshotId,
    claimLinks: Array<{ claimId, relationship }>
  }> // may be empty; each event has SUPPORTS
}
200 { presentation: { revisionId, programmeId,
                      presentationSchemaVersion: 'programme-presentation/v1' } }
```

Every claim must belong to the candidate programme and have an exact immutable
`claim_source_links` row whose relationship is `SUPPORTS`. A mechanism stage requires at least one
target relationship of `SUPPORTS` or `QUALIFIES`; contradictory claims remain visible with their
own exact source and statement rather than being relabelled as support. An event's `sourceId` and
`sourceSnapshotId` must match the exact snapshot cited by one of its `SUPPORTS` claims. The server
replaces the stored rows and their verdict-scoped dependencies transactionally. Frozen, wrong-scope,
partial or non-supporting bundles return a typed `403`, `409` or `422` error.

### `POST /api/programme-verdicts/:id/prepare`

Authenticated steward or administrator. Body must be `{}`. Requires a complete
`programme-presentation/v1` bundle. The server re-reads the stored graph, runs RNA Intelligence
2.1, computes the input and proposal digests and freezes the candidate for review.

```text
200 { prepared: { revisionId, programmeId, proposalDigestAlgorithm, proposalDigest,
                  engineVersion: 'rna-intelligence/evidence-2.1.0',
                  inputDigestAlgorithm, inputDigest } }
422 { error, code: 'presentation_not_attached' | 'presentation_prepare_engine_blocked' | ... }
```

The later review and publish routes use this exact digest-bound presentation. Public reads resolve
saved source-version ids, retrieval dates, content hashes and safe canonical locators; they do not
replace them with the latest live source.

## Canonical implementation, review and publication

These authenticated routes operate on the complete programme bundle. Request bodies are strict;
the server owns identities, timestamps, evidence-check results and digests.

### `POST /api/contributions/:id/implementation`

Steward or administrator; body `{}`. The contribution must already be
`ACCEPTED_FOR_IMPLEMENTATION`. For a programme with a public conclusion, the server applies the
accepted field to a complete cloned bundle, runs RNA Intelligence, and freezes one canonical
candidate in the same transaction. For an unpublished source-only programme, the narrowly allowed
registry update can be resolved without creating a conclusion.

```text
200|201 {
  implementation:
    { outcome: 'CANONICAL_CANDIDATE', revisionId, proposalDigest, reused }
    | { outcome: 'UNPUBLISHED_SOURCE_TASK_RESOLVED', sourceReviewTaskId,
        sourceSnapshotId, resolvedAt, reused, createsConclusion: false },
  candidate,
  sourceTaskResolution
}
```

Accepted contribution reviews remain provenance; they are not copied into the canonical verdict
review. Any stale public baseline, source task, saved source version or proposal digest fails the
transaction without changing the public record.

### `GET /api/programme-verdicts/:id/reviews`

Authenticated. Returns the complete digest-bound public-field preview, deterministic findings,
changes from the current public version, caller qualifications and eligibility, and the canonical
review state. A second reviewer cannot see the first person’s identity or decision before recording
their own. Raw account ids and credentials are not returned.

### `POST /api/programme-verdicts/:id/reviews`

One immutable decision from each of exactly two qualified, independent reviewers. The caller must
be a trusted editor, steward or administrator with a separate active qualification and cannot be
the candidate or contribution author.

```text
body = {
  expectedProposalDigest: sha256,
  decision: 'APPROVE' | 'CHANGES_REQUESTED' | 'REJECT',
  expertiseTags: VerdictReviewerExpertiseTag[],
  isIndependent: true,
  conflictsOfInterest: string,
  conflictsOfInterestAttested: true,
  reviewNote?: string | null
}
201 { review }
```

### `POST /api/programme-verdicts/:id/adjudication`

Qualified steward or administrator, only after the two canonical reviewers disagree and never the
author or either reviewer. The immutable body has the same exact proposal digest, decision and
qualification fields as a review, plus a required `rationale`. The public history retains the two
reviews and this final decision.

### `POST /api/programme-verdicts/:id/publish`

Steward or administrator. Body `{ expectedProposalDigest: sha256 }`. Rebuilds and rechecks the
complete stored proposal, exact reviewer standing, source freshness and review result inside one
transaction. It publishes the linked graph, advances the one public pointer, supersedes the former
bundle, and resolves a bound source task together. A failure changes none of them.

### `GET|POST /api/reviewer-qualifications`

Steward or administrator only. `GET` returns the safe qualification roster. `POST` appends one
grant or revoke event:

```text
body = { reviewerUserId, expertiseTag, action: 'GRANT' | 'REVOKE', reason }
201 { event }
```

An authorizer cannot change their own qualification. Account profile interests or a self-selected
expertise label do not substitute for this separate qualification record.

---

## Feedback

### `POST /api/feedback`

Public. Rate limit FEEDBACK, keyed on `sessionHash` (never the raw IP).
Body `{ type: 'suggestion' | 'correction' | 'request', message, email?, drugSlug? }`.

```
201 { ok: true }
```

### `GET /api/feedback?status=open|resolved&limit=1..100`

Authenticated steward or administrator only. Returns the submitted message, optional contact
email/account, medicine slug and audited resolution fields. The day-scoped abuse-control
`sessionHash` is never selected into this response.

### `POST /api/feedback/:id/resolve`

Authenticated steward or administrator only. Body `{ note }`, where the note is 8–2,000 characters.
An open report can be resolved exactly once. PostgreSQL supplies `resolvedAt`, records the current
reviewer and rejects later mutation or deletion of the audit row.

```
200 { item: FeedbackRecord }
403 { error, code: 'forbidden' | 'not_authorized' }
404 { error, code: 'not_found' }
409 { error, code: 'already_resolved' }
422 { error, code: 'invalid_input' | 'invalid_resolution' }
```

---

## Bookmarks

### `POST /api/drugs/:slug/save` — authenticated, toggles. `200 { saved: boolean }`

### `GET /api/me/saved` — authenticated. `200 { drugs: SearchHit[] }`
