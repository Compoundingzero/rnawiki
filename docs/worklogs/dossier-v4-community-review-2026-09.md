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
