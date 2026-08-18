# Editorial methodology

This describes how a claim or entity actually moves from nothing to a published page, who is
allowed to move it, and the two places where automation is deliberately kept out of the editorial
judgment: bibliographic import and comprehension testing. It is a description of the real code
paths in `app/admin/(protected)/**/actions.ts`, not an aspirational process — if this document and
the code disagree, the code is right and this document needs fixing.

## Roles

Three internal roles exist (`users.role`, `lib/auth.ts`), and every admin action is gated by
`requireUser(allowedRoles)`:

- **`editor`** — writes and edits entity and claim content, evidence sources, and mechanism
  steps. Cannot publish anything, and cannot record a scientific review decision.
- **`scientific_reviewer`** — records review decisions (approve / reject / needs changes) on
  claims and entities. Can also do everything an editor can do on content, since the review-queue
  role check is `['administrator', 'scientific_reviewer']` and the content-edit check is
  `['administrator', 'editor']` — the two grants are separate and an account only has one role, so
  in practice a reviewer account edits content by asking an editor/administrator, or an
  administrator account is used for both.
- **`administrator`** — everything above, plus the two actions nobody else can do: publish
  (moving `approved` → `published`), and triage public correction submissions is open to any
  authenticated internal role, not restricted to administrators (see below).

## The publication-status workflow

`publicationStatus` (`entities` and `claims`, `db/schema.ts`) is one of: `draft`,
`editorially_complete`, `scientific_review_required`, `approved`, `published`, `needs_update`,
`re_review`.

**Editorial drafting (editor or administrator).** `createClaim` / `updateClaim` and
`createEntity` / `updateEntity` (`app/admin/(protected)/claims/actions.ts`,
`.../entities/actions.ts`) let an editor or administrator set `publicationStatus` to any value in
the enum, with one hard-coded exception: **only an administrator can set it to `published`** — an
editor attempting to save with `publicationStatus: 'published'` is rejected server-side with
"Only administrators can publish." An editor moves a claim through `draft` →
`editorially_complete` → `scientific_review_required` by editing the same status field once the
content is ready for the next stage. `needs_update` and `re_review` are available in that same
dropdown for an editor or administrator to apply to an already-published claim once new evidence
(tracked in `evidenceChanges`) warrants a re-look — this is currently an editorial judgment call
made by hand, not an automated trigger off `evidenceChanges` inserts.

**Scientific review (scientific_reviewer or administrator).** `/admin/review-queue` lists every
claim and entity with `publicationStatus = 'scientific_review_required'`. `reviewClaim` /
`reviewEntity` (`app/admin/(protected)/review-queue/actions.ts`) record an immutable row in
`reviews` — reviewer id, decision, comments, and the exact version reviewed
(`reviews.reviewedVersion`) — then update the underlying row's status:

- decision `approved` → status becomes `approved`
- decision `rejected` or `needs_changes` → status goes back to `draft` for editorial rework

The review row itself is never edited or deleted after the fact; a changed mind means a new
review, not a rewritten old one. This is also the row `lib/queries/entities.ts` reads to populate
`ProofCardView.review`, and the only source `components/ProofCard.tsx`'s `reviewStatusCopy()` is
allowed to say "Reviewed by [name]" from — see the non-negotiable rule in the repo-root
`CLAUDE.md`.

**Publishing (administrator only).** `publishClaim` (and the entity equivalent) is a dedicated
action, separate from the general edit form, that requires `publicationStatus === 'approved'` on
the current row before it will move it to `published` — "Only claims with status 'approved' can be
published" otherwise. This is the intended path to production. (The general edit form also lets an
administrator set `publicationStatus` to `published` directly, without that approved-only check —
an administrator can, mechanically, skip the review queue. Don't do this outside of legitimate
editorial emergencies; it bypasses the audit trail a review row provides.)

**Corrections triage (any authenticated internal role).** `resolveCorrection`
(`app/admin/(protected)/corrections/actions.ts`) only requires `requireUser()` with no role
restriction — "any authenticated internal role may triage corrections... this is lower-stakes
moderation work, not the publish/review-decision actions that are role-gated," per the code
comment. A resolution can optionally be published to the public `/updates` feed via
`publicCorrectionEntry`.

Every content change — creation, field-level edit, status transition, mechanism-step reorder,
evidence link/unlink, correction resolution — is written to `revisions` (`lib/admin/audit.ts`) with
the changing user, the field, the previous and new values, and whether it affected review status.
This is the audit trail; nothing here is a soft, best-effort log.

## The DOI/PMID import boundary

`lib/metadata-import.ts` provides `fetchMetadataByDoi` (Crossref's public REST API) and
`fetchMetadataByPmid` (NCBI E-utilities `esummary`, using `NCBI_EUTILS_API_KEY` if set for a
higher rate limit) for the admin "import from DOI/PMID" flow when creating an evidence source.

The boundary is exact and intentional: these functions return **only** bibliographic metadata —
`title`, `authors`, `publicationYear`, `journalOrIssuer`, `doi`, `pmid`. They never return, infer,
or pre-fill `sourceType`, `studyDesign`, `species`, `sampleSize`, `endpoint`, or
`retractionStatus` — the fields on `evidenceSources` that require reading and judging the actual
paper. Those stay a human editorial decision every time, made by whoever is entering the evidence
source, after they've actually looked at the study. Nothing in this module writes to the database;
it only returns a value for a human to review in a form before that human decides what to save.
This boundary exists so that "imported metadata" can never quietly become "imported evaluation" —
a DOI lookup can tell you *what a paper is*, never *what it found* or *how good it is*.

## Comprehension testing, and why it is not scientific validation

Every published claim can carry up to three short single-choice "teach-back" questions
(`comprehensionQuestions`, capped by `MAX_QUESTIONS_PER_CLAIM = 3` in `lib/comprehension.ts`), and
an anonymous reader can answer them after reading the claim. This tests one thing only: **did the
Proof Boundary explanation on this claim read clearly enough that a reader can correctly locate
where the evidence stops?**

By editorial convention (not schema-enforced — see the comment in `lib/comprehension.ts`), the
first question for a claim (`displayOrder: 0`) is the *central* Proof Boundary question, and only
responses to that question feed the public aggregate. Up to two further questions may probe
comprehension of supporting detail; mixing their responses into the published number would let an
easy detail question inflate it, or a hard one deflate it, so they're excluded from the number the
site actually shows.

The public framing is exactly one sentence, produced only by `formatComprehensionAggregate`:
*"X% of N readers correctly identified where the evidence ends."* Two structural facts keep this
honest:

1. **It is gated.** `isClarityTested` (`lib/evidence.ts`) requires at least
   `CLARITY_MIN_RESPONSES = 20` valid responses **and** at least `CLARITY_MIN_CORRECT_RATE = 0.8`
   (80%) correct before the aggregate is shown at all. Below threshold, the function returns
   `null`, and every caller must treat `null` as "show nothing, or a neutral not-enough-responses
   state" — never fall back to displaying a small-sample percentage just because a number exists.
2. **It cannot be answered by guessing the "right" opinion.** `correctOptionIndex` is never sent
   to the client — `getQuestionsForClaim` explicitly excludes it from the public view, and it is
   only ever read server-side inside `recordResponse`, which re-derives correctness from the
   stored question row rather than trusting anything the client submits.

What this number does **not** mean, and must never be described as meaning: that the claim itself
is correct, that the underlying research is sound, that the compound works, or that any scientific
question has been settled. A claim can have a perfectly clear, well-comprehended explanation of
very weak evidence — "94% of readers correctly identified that this rests on animal evidence only"
is a comprehension success story about a claim that remains, correctly, unproven in humans. Never
let this metric or copy built on top of it drift toward implying validation. That conflation is
exactly the kind of collapse the Proof Boundary exists to prevent — see
[`docs/product-principles.md`](product-principles.md).

Responses are deduplicated per (question, anonymous session hash) pair — see
`comprehension_responses_dedupe_idx` in `db/schema.ts` and `lib/session-hash.ts` — so a refresh or
double-click returns the reader's existing outcome rather than inserting a second row, without
storing anything that identifies the reader.
