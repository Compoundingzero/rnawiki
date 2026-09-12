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

## Phases 11–12 — the footer, and the pages that had no job

Written up in full in `docs/site-content-pruning-2026-09.md`. In short: both footers now render one
shared list of five links; `/editorial-policy` is gone and 308s to
`/how-it-works#review-and-corrections`; `/privacy` is new and carries the consent control with the
explanation beside it; and `Public datasets` moved out of the footer into How RNAWiki works.

Giving footer links a 44-pixel target cleared the axe `target-size` failures this branch had
recorded as known. Medicine pages now report **zero** violations at 1440, 390 and 320 px, down from
two and three nodes.

Two defects surfaced while getting the gate green, both real and both fixed:

- **The rate limiter's buckets are keyed on one anonymous fingerprint, which the whole browser suite
  shares.** Adding seven reviewer sign-ins pushed it over and specs began failing with 429s for
  reasons unrelated to the change under test. The allowances are now raised only when the process is
  connected to a `rnawiki_test_*` database on a loopback host, read from `DATABASE_URL` rather than
  from a flag anyone can export. A reader's numbers are unchanged and pinned by a test.
- **Two specs hard-coded `localhost:3000` in a browser context.** Once `playwright.config.ts` became
  port-configurable they were talking to whatever else was listening on that port. They inherit the
  suite's base URL now.

## Phases 13–16 — accessibility, tests, visual regression

`tests/e2e/dossier-v4-community-review.spec.ts` checks the control at 1440, 1024, 768, 390 and
320 px: visible, a 44-pixel target, a visible focus ring, an accessible name that reads as a
sentence, no animation, no horizontal overflow, and axe clean over the identity strip at 320 px. It
also asserts the approved layout survived — the strip, the promise, the purpose controls, the left
rail, the hero, both right-hand components, the technical record below them and the section order.

Before and after captures are in `data/dossier-v4/benchmark/community-review-{before,after}/` at
1440×1200, 390×844 and 320×800, with the site pages under each `site/` directory.

| Page | Headline y, before | after | axe before | after |
| --- | --- | --- | --- | --- |
| creatine-monohydrate | 468 px | 360 px | 2 / 3 nodes | 0 |
| semaglutide | — | — | 2 / 3 nodes | 0 |
| inclisiran | — | — | 2 / 3 nodes | 0 |
| 1-2-hexanediol | — | — | 2 / 3 nodes | 0 |

## Phase 17 — the release rehearsal

There is no staging environment to deploy to. `railway status --json` reports one environment,
`production`, and creating a second with its own database is a billing action for the account owner.
So the rehearsal was run locally against a production build and the real 10,250-page corpus, which
is closer to production data than any staging environment would have been.

Every step of the brief's workflow, through the real HTTP API and the real UI, with accounts that
had the right trust tiers and one recorded qualification:

1. Opened `/d/creatine-monohydrate`. 2. Followed "Review or improve · 0/3".
3. Submitted a wording for "Where it acts". 4–6. Approved from three different members.
7. Publication confirmed in the same transaction. 8. Reloaded the page.
9. The approved wording is what it says, marked "✎✓ Community approved 3/3", and the pill reads
"Community approved · 3/3". 10. The old wording, the reason, the count and the date are under
"What changed". 11. Rolled back as a steward. 12. The earlier wording returned, the pill returned
to 0/3. 13. Every revision, decision and event still present: one revision, three decisions, two
publication events, `publish` and `rollback`, both attributed.

An ordinary reviewer attempting the rollback got `403`. All five switches were verified against the
running build, including the freeze: three approvals recorded, zero pointer rows, the page
unchanged, and a steward releasing it afterwards through the same publishing function.

The rehearsal rows were then removed; the local database holds no review data.

### The corpus crawl

`scripts/dossier-v4/crawl-review-surface.ts` is new, because `validate-corpus.ts` builds the view
model and cannot see what a component renders — and what this release changed is exactly that. It
asks the server for every public medicine page and checks the reader-visible text, with the content
of closed disclosures removed innermost-first, since that is where the long provenance explanation
deliberately moved.

**10,250 pages crawled over HTTP. Zero findings.** No page serves "Preliminary, awaiting review",
"Read it as a working draft", the repeated provenance paragraph, or any removed footer label; every
compass page carries the review control and its `/review-queue?slug=` link.

## Phase 18 — production

Not deployed, and not deployable from here. The blockers are in
`docs/dossier-v4-production-runbook.md` and were re-confirmed on 2026-09-11 rather than taken on
trust:

1. **No staging environment.** One Railway environment exists: `production`.
2. **Production deploys on a merge to `main`, and this branch is 72 commits and 1,426 files ahead of
   it** — 1.37 million insertions, of which 16 commits are this work. Merging would ship the
   September corpus revamp to a live medical-evidence site under cover of a dossier change. The
   release path is the owner's decision and both options are written up in the runbook.
3. **Ten migrations would replay against production.** `main` carries 26, this branch carries 36,
   and the live deployment is from 2026-09-04 — it predates all of them.
4. **`DOSSIER_V4_SLUGS` is unset in production.** No `DOSSIER_*` variable exists on the service, and
   `curl -sI https://rnawiki.com/d/creatine-monohydrate` returns no `x-rnawiki-dossier` header. The
   live site serves the previous surface, and deploying this branch changes no reader-facing page
   until someone sets that variable.

Two of those four are decisions that are not mine to make: creating a Railway environment is a
billing action, and choosing the release path means choosing what else ships.
