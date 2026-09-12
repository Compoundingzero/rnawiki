# Dossier v4 — production runbook

## Where the work is

Branch `rebuild/biohacker-dossier`, pushed. Pull request 19, draft, base `revamp/2026-09`.

The compass code is inert until `DOSSIER_V4_SLUGS` is set. It is unset in every environment, so
deploying the branch changes no reader-facing page until someone sets it.

## The release path, and why it is not a merge to main

Production deploys on a merge to `main`. My branch is **68 commits and 1,316 files ahead of main**,
and only 13 of those commits are the dossier rebuild. The rest is the September corpus revamp and
the dossier v3 foundation: 9 migrations, 113 changed code files and about 1.1 million lines of
corpus data and documents that I did not write and have not reviewed.

Merging this branch to `main` would not deploy a dossier redesign. It would ship an entire
unreviewed corpus revamp to a live medical-evidence site under the cover of one. The brief's own
release rule says not to include unrelated work accidentally, and this would not be accidental.

Two paths are open, and the choice belongs to the repository owner.

**Path A — release the revamp, then the dossier.** Merge PR 19 into `revamp/2026-09`, run the gate
against the whole revamp branch, then open a separate release pull request from `revamp/2026-09` to
`main` and review that diff on its own terms. The dossier work is a small part of that release and
should be reviewed as such.

**Path B — a dossier-only release branch.** Cut a branch from `main`, take migrations 0026 to 0034
and the dossier code, resolve what the corpus tables need, and release only that. This is smaller to
review but needs the corpus data that the revamp produces, so it is only smaller if production
already holds a compatible corpus load. That cannot be established without production database
access.

## What blocks a production rollout today

1. **No page is in the reviewed state.** `reviewed_claims` is empty for every medicine, so a rollout
   would show 6,896 pages of explicitly unreviewed wording and 3,351 near-empty ones. The pages say
   so honestly, which is the right behaviour and not a reason to publish them at scale.
2. **No staging environment exists.** Confirmed again on 2026-09-11: `railway status --json`
   reports one environment, `production`, and three services (`RNAwiki`, `Postgres`, `RNA
Intelligence Source Sync`). Creating a second environment with its own database is a billing
   action for the account owner.
3. **Production's migration state cannot be verified from here.** `main` carries 26 migrations and
   this branch carries 36, so ten would replay against the live database. The live deployment is
   from 2026-09-04 and predates all of them. That has not been rehearsed against production data
   anywhere.

4. **`DOSSIER_V4_SLUGS` is unset in production**, confirmed on 2026-09-11:
   `railway variables --service RNAwiki` lists no `DOSSIER_*` variable, and
   `curl -sI https://rnawiki.com/d/creatine-monohydrate` returns no `x-rnawiki-dossier` header. The
   live site serves the previous surface. Deploying this branch changes no reader-facing page until
   someone sets that variable.

## What community review adds, and what it does not

Community review ships with the compass and is inert with it. A member may propose a better wording
for one of seven named sentences on a medicine page; three independent eligible members approve the
exact wording; the approved wording becomes the public answer inside the approving transaction.

Nothing about that needs a deployment. The wording is an overlay the page reads per request, so a
publication is a row and a pointer, and a rollback is the pointer moving back. `drugs`,
`corpus_pages`, `page_fields`, `reviewed_claims` and every source snapshot are untouched by the
workflow, which is why migration 0035 is additive and rolling it back loses no medical content.

### The switches

| Variable                     | Unset means                                  | Set to `off`                                         |
| ---------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `DOSSIER_V4_SLUGS`           | The compass is off, so review is off with it | —                                                    |
| `DOSSIER_COMMUNITY_REVIEW`   | Follows `DOSSIER_V4_SLUGS`                   | The control disappears; every write path refuses     |
| `DOSSIER_REVIEW_PROPOSALS`   | On where review is on                        | No new proposals; the ones in flight stay reviewable |
| `DOSSIER_REVIEW_DECISIONS`   | On where review is on                        | No decisions recorded; the queue stays readable      |
| `DOSSIER_REVIEW_AUTOPUBLISH` | On where review is on                        | Approvals still recorded; the pointer stops moving   |

Set `DOSSIER_COMMUNITY_REVIEW=on` to keep review running if the compass itself is rolled back.

There is no variable for the number of approvals. Three is a CHECK on
`page_statement_review_states` and is frozen per row when the row is created, so a setting that
appeared to change it would be ignored or would produce a row the database refuses.

A wording approved while `DOSSIER_REVIEW_AUTOPUBLISH=off` is not lost. It sits at `approved`, and a
steward releases it with `POST /api/page-statements/proposals/<id>/publish`, which runs the same
gates the third approval would have run.

### Verified locally, against the real 10,250-page corpus

```
DOSSIER_V4_SLUGS=all                                    → control renders, compass renders
DOSSIER_V4_SLUGS=all DOSSIER_COMMUNITY_REVIEW=off       → control gone, compass and copy intact
DOSSIER_V4_SLUGS=                                       → previous surface, no v4 header
DOSSIER_REVIEW_PROPOSALS=off                            → POST proposals  503 proposals_disabled
DOSSIER_REVIEW_DECISIONS=off                            → POST reviews    503 decisions_disabled
DOSSIER_REVIEW_AUTOPUBLISH=off                          → 3 approvals recorded, 0 pointer rows
steward release, then rollback                          → page changes and returns; both in the ledger
```

## Turning the compass on, once those are resolved

```bash
# one page, checked first
npx tsx scripts/dossier-v4/check-gate.ts --slugs creatine-monohydrate
railway variables --set DOSSIER_V4_SLUGS=creatine-monohydrate --service RNAwiki

# a prefix, or the whole corpus
railway variables --set DOSSIER_V4_SLUGS='*' --service RNAwiki
```

Verify after each change:

```bash
curl -sI https://rnawiki.com/d/creatine-monohydrate | grep -i x-rnawiki-dossier   # expect: v4
curl -s https://rnawiki.com/d/creatine-monohydrate | grep -o 'data-publication-state="[a-z_]*"'
```

## Rollback

```bash
# the whole reader surface, compass and review together
railway variables --unset DOSSIER_V4_SLUGS --service RNAwiki

# or one layer at a time, keeping the compass
railway variables --set DOSSIER_REVIEW_AUTOPUBLISH=off --service RNAwiki   # freeze publication
railway variables --set DOSSIER_REVIEW_DECISIONS=off  --service RNAwiki   # stop approvals
railway variables --set DOSSIER_REVIEW_PROPOSALS=off  --service RNAwiki   # stop new proposals
railway variables --set DOSSIER_COMMUNITY_REVIEW=off  --service RNAwiki   # withdraw review entirely
```

The next request serves the previous surface. No database change, no migration rollback, no data
loss: v4 adds no table and no column. Confirm with the same `curl` above, which should stop
reporting `v4`.

Migration 0034 has its own rollback SQL in `docs/worklogs/biohacker-rebuild-2026-09.md`. It is
additive and is not required to roll back the reader surface. Migration 0035 is additive too, and
its rollback notes are in the migration itself: export the six `page_statement_*` tables and
`account_restriction_events` first, because they are the only record of who decided what. Dropping
them returns every page to its built-in wording and loses no medical content, because the workflow
never writes to one.

## After any deploy

- `curl` the four gold slugs and confirm the dossier header and publication state.
- Confirm a limited record renders rather than falling back: `/d/acacia-fiber`.
- Confirm no unreviewed page is indexable: the validation asserts this, and the sitemap should not
  gain entries.
- Re-run `npx tsx scripts/dossier-v4/validate-corpus.ts` against the deployed database.
