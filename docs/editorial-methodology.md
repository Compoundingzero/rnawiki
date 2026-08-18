# Editorial methodology

Canonical home for the editorial workflow: how a claim gets published, who may move it, and the two
places automation is kept out of editorial judgment. It describes the real code paths in
`app/admin/(protected)/**/actions.ts` — if the code and this file disagree, the code is right.
Vocabulary lives in [`docs/evidence-classification.md`](evidence-classification.md).

## Roles

Three roles (`users.role`, `lib/auth.ts`); every admin action is gated by
`requireUser(allowedRoles)`.

| Role | May do | May not do |
|---|---|---|
| `editor` | Write and edit entities, claims, evidence sources, mechanism steps | Publish; record a review decision |
| `scientific_reviewer` | Record approve / reject / needs-changes decisions | Publish; edit content (see below) |
| `administrator` | Everything, including publish | — |

The two grants are separate checks — `['administrator', 'scientific_reviewer']` for the review
queue, `['administrator', 'editor']` for content edits — and an account holds one role. So a
reviewer account cannot edit content; in practice an administrator account does both, or a reviewer
asks an editor.

## The publication-status workflow

`publicationStatus` (on `entities` and `claims`) is one of `draft`, `editorially_complete`,
`scientific_review_required`, `approved`, `published`, `needs_update`, `re_review`.

**Drafting — editor or administrator.** `createClaim`/`updateClaim` and
`createEntity`/`updateEntity` let either role set any status, with one hard-coded exception: **only
an administrator can set `published`**, and an editor trying it is rejected server-side with "Only
administrators can publish." An editor walks a claim `draft` → `editorially_complete` →
`scientific_review_required` by editing that field. `needs_update` and `re_review` are in the same
dropdown for flagging a published claim when new evidence lands (tracked in `evidenceChanges`) — a
hand-made judgment, not an automated trigger.

**Review — scientific_reviewer or administrator.** `/admin/review-queue` lists everything at
`scientific_review_required`. `reviewClaim`/`reviewEntity` write an immutable `reviews` row —
reviewer id, decision, comments, exact version reviewed (`reviews.reviewedVersion`) — then set
status: `approved` → `approved`; `rejected` or `needs_changes` → back to `draft`. Review rows are
never edited or deleted; a changed mind is a new review. `lib/queries/entities.ts` reads this row
into `ProofCardView.review`, and it is the only thing `components/ProofCard.tsx`'s
`reviewStatusCopy()` may say "Reviewed by [name]" from.

**Publishing — administrator only.** `publishClaim` and its entity equivalent require the current
row to be `approved`, else "Only claims with status 'approved' can be published". An administrator
*can* mechanically skip it by setting `published` in the general edit form, which has no
approved-only check. Don't, outside a real editorial emergency: it bypasses the audit trail a
review row provides.

**Corrections triage — any authenticated internal role.** `resolveCorrection` calls bare
`requireUser()` with no role list, because triage is lower-stakes moderation, not a publish or
review decision. A resolution can go to the public `/updates` feed via `publicCorrectionEntry`.

Every content change — creation, field edit, status transition, mechanism-step reorder, evidence
link/unlink, correction resolution — is written to `revisions` (`lib/admin/audit.ts`) with the user,
the field, both values, and whether review status was affected. It is an audit trail, not a
best-effort log.

## The DOI/PMID import boundary

`lib/metadata-import.ts` provides `fetchMetadataByDoi` (Crossref REST) and `fetchMetadataByPmid`
(NCBI E-utilities `esummary`, using `NCBI_EUTILS_API_KEY` if set) for the admin import flow.

They return **only** `title`, `authors`, `publicationYear`, `journalOrIssuer`, `doi`, `pmid`. They
never return, infer or pre-fill `sourceType`, `studyDesign`, `species`, `sampleSize`, `endpoint` or
`retractionStatus` — those need someone to read and judge the paper. Nothing in the module writes to
the database; it returns a value for a human to review in a form. A DOI lookup can say *what a paper
is*, never *what it found* or *how good it is*.

## Comprehension testing, and why it is not validation

A published claim can carry up to three anonymous single-choice teach-back questions
(`MAX_QUESTIONS_PER_CLAIM = 3`). They test one thing: **did this claim's Proof Boundary explanation
read clearly enough that a reader can locate where the evidence stops?**

By editorial convention, not schema enforcement, the first question (`displayOrder: 0`) is the
central Proof Boundary question and only its responses feed the public aggregate. The other two
probe supporting detail; mixing them in would let an easy question inflate the number or a hard one
deflate it.

The public framing is one sentence, produced only by `formatComprehensionAggregate`: *"X% of N
readers correctly identified where the evidence ends."* Two things keep it honest:

1. **It is gated.** `isClarityTested` requires `CLARITY_MIN_RESPONSES = 20` valid responses **and**
   `CLARITY_MIN_CORRECT_RATE = 0.8`. Below either it returns `null`, and every caller must treat
   `null` as "show nothing" — never fall back to a small-sample percentage.
2. **It cannot be gamed from the client.** `correctOptionIndex` is excluded from
   `getQuestionsForClaim`'s public view and read only server-side in `recordResponse`, which
   re-derives correctness from the stored row.

The number does not mean the claim is correct, the research is sound, or anything is settled. "94%
of readers correctly identified that this rests on animal evidence only" is a comprehension success
about a claim that remains, correctly, unproven in humans. Copy built on this metric must never
drift toward implying validation — that conflation is what the Proof Boundary exists to prevent.

Responses are deduplicated per (question, session hash) pair — `comprehension_responses_dedupe_idx`
plus `lib/session-hash.ts` — so a refresh returns the reader's existing outcome instead of a second
row, without storing anything identifying.
