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
2. **No staging environment exists.** The Railway project has one environment, production. Creating
   a second one with its own database is a billing action for the account owner.
3. **Production's migration state cannot be verified from here.** Nine migrations would have to
   replay against it, and that has not been rehearsed anywhere.

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
railway variables --unset DOSSIER_V4_SLUGS --service RNAwiki
```

The next request serves the previous surface. No database change, no migration rollback, no data
loss: v4 adds no table and no column. Confirm with the same `curl` above, which should stop
reporting `v4`.

Migration 0034 has its own rollback SQL in `docs/worklogs/biohacker-rebuild-2026-09.md`. It is
additive and is not required to roll back the reader surface.

## After any deploy

- `curl` the four gold slugs and confirm the dossier header and publication state.
- Confirm a limited record renders rather than falling back: `/d/acacia-fiber`.
- Confirm no unreviewed page is indexable: the validation asserts this, and the sitemap should not
  gain entries.
- Re-run `npx tsx scripts/dossier-v4/validate-corpus.ts` against the deployed database.
