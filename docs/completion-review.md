# Completion and identity review

A private steward workflow for the two deterministic resolvers that describe a record rather than
its medicine: the dossier-completion resolver (`lib/dossier-completion/`) and the inventory identity
resolver (`lib/inventory/`). Both write stored rows. Neither writes medical prose, and neither picks
a verdict.

This document describes what a person does with those rows, what a recorded decision claims, and —
at least as important — what it does not claim.

## Where it lives

| Piece                                 | Path                                                   |
| ------------------------------------- | ------------------------------------------------------ |
| Role and payload rules (pure)         | `lib/completion-review-policy.ts`                      |
| Queue reads and the append-only write | `lib/queries/completion-review.ts`                     |
| Protected API                         | `app/api/completion-review/route.ts`                   |
| Steward screen                        | `app/review-queue/completion/page.tsx`                 |
| Stored decisions                      | `dossier_completion_review_decisions` (migration 0022) |

## Who may open it

A current steward or administrator, decided by `canManageInternalReview` in
`lib/internal-review-policy.ts` — the same boundary as `/review-queue/search-indexing` and the
private feedback queue. Anyone else, signed in or not, gets the page's `notFound()` response, and
the API answers 401 or 403 before it reads a single row. Recording a decision needs no further
privilege than reading the queue, and the reviewer id always comes from the session cookie: a
`reviewerUserId` in the request body is refused by the strict payload schema.

The screen and the API are `noindex, nofollow` and `Cache-Control: no-store`.

## The three queues

1. **Records with an open section.** The completion assessment is `INCOMPLETE`: at least one section
   that applies to the record has not reached one of the ten terminal states. Each open section is
   listed with its state, the basis the resolver recorded, and the blocked reason saying what has to
   happen before it can settle.
2. **Records where reading a named source could add something.** Every applicable section already has
   a state, and the resolver also set `humanReadSuggested` on one or more of them — a person opening
   the source named in the basis may read something the parser could not. This never blocks
   completion.
3. **Records with an identity warning.** The identity resolver recorded an attribution warning, such
   as a registry identifier that a second record also carries. A warning is a reason to look. It is
   never evidence on its own that two records are one thing.

Every read is bounded: at most 100 records per page, at most 20 recorded decisions per record.

### Why this screen may name a second record

The identity warnings stored in `inventory_resolutions.attribution_warnings` can carry
`relatedSlugs` — the other records that share the identifier a person has to check. This screen shows
them, and says on the page that it does so, because a reviewer cannot check a shared identifier
without knowing what it is shared with.

That is the only place those names may appear. `lib/queries/dossier-completion.ts` is the public
projection of the same rows, and it reduces the warnings to one boolean,
`identifierSharedWithOtherRecords`. No public page, dataset, export or API response names one
medicine in relation to another.

## What a decision records

Four outcomes, stored as an enum, each bound to one section of one record:

| Outcome                 | What it claims                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ACKNOWLEDGED`          | A reviewer has read this section and is leaving the recorded state as it is.                                                                          |
| `SOURCE_READ_NO_CHANGE` | A reviewer opened the source named in the section basis and found nothing the record should say differently.                                          |
| `CORRECTION_PROPOSED`   | A reviewer has opened a correction through the ordinary contribution path. The note records that a correction exists; the note is not the correction. |
| `IDENTITY_DISPUTED`     | A reviewer disagrees with the recorded identity resolution.                                                                                           |

Each decision also carries a non-empty explanation of up to 4,000 characters, the reviewer's account
id, and the `assessmentInputDigest` of the assessment it answered.

## What a decision does not do

- It does not change a completion assessment. The resolver keeps sole authorship of section states,
  bases and counts; a re-run reads its own inputs and nothing else.
- It does not change an inventory resolution, a redirect, a canonical slug or a `drugs` row.
- It does not change any public page, dataset or export. Nothing recorded here is reader-facing.
- It does not become medical content, and it never turns an absence, a registration or a search count
  into a finding.
- It cannot be edited or withdrawn. The table is append-only, and PostgreSQL enforces that from
  below: the `dossier_completion_review_decisions_immutable` trigger raises on UPDATE and DELETE.
  A reviewer who changes their mind records a second decision.

## Binding a decision to one exact assessment

A decision names the assessment it answered through `assessmentInputDigest`, a SHA-256 over every
input the resolver read for that record. The write path locks the assessment row for the length of
the transaction and compares the submitted digest with the stored one. When they differ the decision
is refused with a 409 and the message asks the reviewer to reload and read the current sections.

That is the whole point of the digest: a re-run that changes what a section says must not inherit an
answer written about the previous text. Older decisions stay readable and are shown as answering an
earlier assessment.

The decision id is itself a SHA-256 over the record id, section id, reviewer id, assessment digest,
explanation and timestamp, so the same reviewer submitting the same words twice in the same instant
produces one row rather than two.

## Identity disputes and the redirect ledger

An `IDENTITY_DISPUTED` note changes no redirect. It is a signal that a person disagrees with a
resolver output.

Redirects stay owner-curated. Someone has to read the dispute, check the identifiers and names for
themselves, and decide whether the ledger changes. Nothing in this workflow, and no scheduled job,
writes a redirect because a dispute was recorded. Salts, stereoisomers, metabolites, formulations,
combinations, brands, botanical preparations, organisms, biologics, vaccines and RNA constructs are
never merged automatically, and a recorded dispute does not weaken that rule.

## Using the API directly

`GET /api/completion-review?kind=incomplete|human-read|identity&offset=0&limit=25` returns one page
of a queue with counts for all three. `POST /api/completion-review` records one decision from a JSON
body of `drugId`, `sectionId`, `decision`, `explanation` and `assessmentInputDigest`, and answers
201 with the recorded note.

Error statuses: 401 when signed out, 403 for an account that is not a steward or administrator, 404
when the record has no stored assessment, 409 for a stale assessment digest, 422 for a body that
fails the schema, 429 when the write limit is reached.

The steward screen posts the same fields as an ordinary HTML form, so the workflow runs with
client-side JavaScript switched off; a form post is answered with a 303 back to the queue. The
session cookie is `SameSite=Lax`, so a form submitted from another site arrives without it and is
refused as unauthenticated.

## Tests

- `tests/unit/completion-review-policy.test.ts` — roles, payload shape, digest binding, labels.
- `tests/unit/internal-review-routes.test.ts` — the routes refuse an unauthenticated caller before
  any query runs, take the reviewer id from the session, and map a stale digest to 409.
- `tests/integration/completion-review.test.ts` — the queues, the recorded decision, the refusal of a
  stale digest, and the database-level append-only trigger. Run it with:

  ```bash
  npx tsx scripts/with-disposable-database.ts -- npx vitest run tests/integration/completion-review.test.ts
  ```
