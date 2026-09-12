# Dossier v4 — community review, 2026-09

Turning the compass from a page that opens with a warning into a page that opens with its answer,
and building the review system that makes that honest: a member may propose better wording, three
independent eligible members approve the exact revision, and the approved wording becomes the
public answer through a database publication event with no deployment.

Branch `rebuild/biohacker-dossier`, worktree `RNAwiki-biohacker-rebuild`, PR #19.

---

## Phase 0 — verify and checkpoint

Starting commit `fb4ad49` (`feat(dossier-v4): build the navigator from what each page rendered`),
the head of `rebuild/biohacker-dossier` and of PR #19. Working tree clean.

Worktrees:

| Path | Branch | Head |
| --- | --- | --- |
| `Project RNAwiki` | `release-b2/medicine-dossier-v3` | `f39b604` |
| `Project RNAwiki/RNAwiki-biohacker-rebuild` | `rebuild/biohacker-dossier` | `fb4ad49` |
| `Project RNAwiki/RNAwiki-corpus-completion` | `revamp/2026-09` | `55d07db` |

PR #19 is a draft against `revamp/2026-09`, 431,298 additions. It is not merged, and its own
description says why: against `main` the diff is 68 commits and 1,316 files, of which 13 are this
work.

### Local environment

`DATABASE_URL=postgresql://admin@localhost:5432/rnawiki_rebuild`, 35 migrations applied
(`0000`–`0034`), 9,859 legacy medicines, 1,698 corpus pages, 0 reviewed claims, 0 user accounts.
A dev server was already running on port 3100 from this worktree with `DOSSIER_V4_SLUGS` set;
`GET /d/creatine-monohydrate` answers `200` with `x-rnawiki-dossier: v4`.

The three named reference pages are `creatine-monohydrate`, `semaglutide` and `inclisiran`.
`creatine` is not a slug: the record is `creatine-monohydrate`.

### Before screenshots

`npx tsx scripts/dossier-v4/capture.ts --base http://localhost:3100 --label community-review-before
--slugs creatine-monohydrate,semaglutide,inclisiran,1-2-hexanediol --out data/dossier-v4/benchmark`

Written to `data/dossier-v4/benchmark/community-review-before/`, three viewports each
(1440×1200, 390×844, 320×800), with an axe run and a plain-language audit per page.

| Page | State | Headings | Sections | 320 px overflow | axe (mobile / narrow) |
| --- | --- | --- | --- | --- | --- |
| creatine-monohydrate | preliminary | 90 | 37 | none | 2 / 3 `target-size` |
| semaglutide | preliminary | 82 | 37 | none | 2 / 3 `target-size` |
| inclisiran | preliminary | 81 | 36 | none | 2 / 3 `target-size` |
| 1-2-hexanediol | limited | 49 | 24 | none | 2 / 3 `target-size` |

The `target-size` violations pre-date this work and are recorded here as the baseline the new
control must not add to.

Footer, review queue, editorial policy, how-it-works and home were captured separately at 1440 px
and 320 px into `data/dossier-v4/benchmark/community-review-before/site/`.

### What the reader currently sees first

Above the fold on `/d/creatine-monohydrate`, in order: the identity strip
("Creatine · Dietary supplement · Sold without a prescription in SG, US, AU, UK, EU, JP, CA,
OTHER · ✓ Identity checked · Sources last checked 2026-09-06"), the page promise, then a bordered
block roughly 160 px tall:

> **PRELIMINARY, AWAITING REVIEW**
> Everything here is linked to a source, and nobody has signed it off yet. Read it as a working
> draft.
> Source-linked wording exists on this record, and nobody has signed it off.

and only then "What brought you here?" and the headline. That block is what Phase 1 removes.

The same sentence is repeated further down under each statement:

> ✎ Written into the record, not signed off. A person wrote this into the record with the study
> named beside it. No reviewer has signed it off.

That is the Phase 3 microcopy target.

### The current footer

Both footers carry the same seven items. `components/SiteFooter.tsx`: Browse all medicines ·
Compare by target, class or pathway · Public datasets · How this works · Editorial policy ·
Review queue, plus an `AnalyticsPreferencesButton`. `components/document/DocumentFooter.tsx` adds
"Sign in on the front page" and appends the analytics control from the document's own script.

### Blockers carried in from the previous phase

`data/dossier-v4/full-rollout-state.json` records three, unchanged by this work:

1. No page is in the reviewed state; `reviewed_claims` is empty for every medicine.
2. No staging environment exists. The Railway project has one environment, production.
3. Merging this branch to `main` would ship 68 commits including an unreviewed corpus revamp.

New this session: the Railway MCP connection is unauthorized (`Unauthorized. Please run
`railway login` again`), so neither the staging environment nor the production deployment can be
inspected or changed from here.

### Files created

- `docs/worklogs/dossier-v4-community-review-2026-09.md` (this file)
- `data/dossier-v4/community-review-state.json`

---

## Phases 1–3 — the banner, the control, the microcopy

`components/dossier/v4/Orientation.tsx` still exports `PublicationBanner`, and it still renders —
for `correction_hold` and `pipeline_failure` only. Those two states are the page saying something is
wrong with itself, which belongs at the top. `preliminary` and `limited` no longer produce a block.

`publication.bannerRequired` is untouched. It is what `scripts/dossier-v4/validate-corpus.ts:232`
reads, and flipping it to remove the banner would have failed that check on 10,247 pages while
also changing the indexing decision, which is derived from the same call. Only the presentation
moved.

In its place, `ReviewControl` renders one line inside the identity strip, beneath the page promise
and above "What brought you here?":

> ✎ Review or improve · 0/3

Its accessible name is a sentence — "Review or improve the wording on this page. No change is
proposed, so nothing has been approved yet." — because "0/3" does not read as speech. A limited
record keeps its one explanatory sentence beside the control as ordinary quiet text rather than
losing it with the block.

The repeated provenance paragraph is gone from the reader layer. `OriginNote` now renders a short
label and, where a community wording applies, its review count:

> ✎ Source-linked record

The forty-word explanation moved into the "Where this came from" disclosure directly beneath, which
already carried the provenance and the sources.

### Measured

| Page | Headline y before | after |
| --- | --- | --- |
| creatine-monohydrate (1440 px) | 468 px | 360 px |

The three locked reference sentences are unchanged, verified against the running server:

- creatine-monohydrate — "Taken for strength and power output in short, hard efforts"
- semaglutide — "Used for type 2 diabetes, obesity, and related heart or kidney risk."
- inclisiran — "Used with diet and exercise to lower LDL, often called 'bad' cholesterol."

## Phases 4–10 — the review system

### Where the wording actually lives

The decisive finding of the survey: reader-visible first-read text has two origins, and only one of
them is the database. `semaglutide` and `inclisiran` take their opening sentence, their result and
their limit from `lib/ten-second-answer-overrides-a.ts` — 506 hand-authored records across 196 KB of
TypeScript, released only when a sha256 over the copy plus 25 live fields of the record matches an
approved digest. `creatine-monohydrate`'s fingerprint no longer matches, so its opening sentence is
the database column `drugs.patient_friendly_indication`.

A publication path that wrote to either of those would have failed: editing a TypeScript literal
needs a deploy, and editing a stored field would rewrite a medical record to change how a sentence
reads. So a published revision is an **overlay**. `buildHero` computes every sentence exactly as it
did, then swaps in an approved wording at the end. Nothing in `drugs`, `corpus_pages`, `page_fields`,
`reviewed_claims` or any source snapshot is touched, which is why rolling back is moving one pointer.

### What the overlay does not do

`withApprovedWording` replaces the text and the origin. It does not touch `Statement.state`. A
sentence describing an animal result still reads as an animal result after three members have agreed
on its wording, and a page does not become a reviewed page because a sentence on it was reworded.
The e2e suite asserts both.

### The rules, and where each one lives

| Rule | Enforced by |
| --- | --- |
| Three independent approvals | `rnawiki_expected_page_statement_review_state`, derived, trigger-checked |
| The author cannot approve | `rnawiki_guard_page_statement_review` |
| One vote per account | `page_statement_reviews_reviewer_unique` |
| One vote per person across duplicate accounts | `page_statement_reviews_identity_unique` on `orcid:`/`user:` |
| Editing resets approvals | the content digest: a review row cannot bind to text it was not given |
| A source change stales approvals | the per-statement source digest, re-checked at the third approval |
| Restricted accounts cannot review | `users.restricted_at`, new, with an append-only ledger |
| A qualified reviewer where the risk needs one | refused at the last slot, with a reason, not deadlocked |
| Two concurrent third approvals publish once | `rnawiki_lock_page_statement_subject` |

There is no adjudication state, deliberately. One request for changes, or one rejection, resolves
the proposal: on a medical page the safe answer to a split is not to publish.

### Automatic gates

`lib/page-statements/gates.ts` registers 24 stable codes, every one with a focused case, following
the RNA Intelligence contract. Verified live against creatine: a proposal reading "About three in
eight people in the biopsy studies…" was accepted and its `plain_language_contract` gate failed on
the word "biopsy", which the first read explains rather than uses.

### Publication without a deployment

`/d/<slug>` is a Route Handler with `dynamic = 'force-dynamic'` that writes its own HTML and ships
no `Cache-Control`. The overlay is read per request. The third approval commits, and the next
request shows the new sentence — proven end to end in `page-statement-review-journey.spec.ts`.

## Results at this point

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| `eslint .` | 0 errors |
| `prettier --check .` | clean |
| `drizzle-kit check` | clean |
| Unit (dossier v4) | 130 passed |
| Integration (`page-statement-review`) | 24 passed, disposable database |
| Browser (`dossier-v4-community-review` + `page-statement-review-journey`) | 33 passed |
| Clean migration replay | passed |
| Corpus validation | 10,250 pages, 0 critical, 370 with any issue (unchanged) |
| Production build | exit 0 |

One change outside the feature: `playwright.config.ts` reads `E2E_PORT`, defaulting to 3000. Port
3000 on this machine belongs to another project, and the alternative was stopping it.
