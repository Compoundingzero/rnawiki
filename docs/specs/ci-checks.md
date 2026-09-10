# CI checks for the revamp run

Phase 6.3 of `docs/specs/revamp-2026-09.md`. Workflow: `.github/workflows/revamp-checks.yml`.

The release gate in `.github/workflows/ci.yml` is untouched by this run: it still runs the whole
`npm run gate` contract against a PostgreSQL service. The checks below are a second workflow, and a
pull request must pass both.

## What CI can read

A GitHub Actions runner holds only what this repository carries. The corpus does not travel with it:
`data/revamp/render-*/`, `data/revamp/fields-v2/`, `data/revamp/page-blocks/` and the raw pulls under
`data/sources/**/raw/` are gitignored — they run to hundreds of megabytes and their builders rewrite
them wholesale — and the DVC remote is not reachable until Felix supplies the credentials named in
`docs/revamp/BLOCKERS.md` under 6.4. So every pre-merge check reads a committed input:

| Input | Written by | Read by |
| --- | --- | --- |
| `data/revamp/hubs/{hubs,members,tables}.parquet` | `scripts/revamp/hubs_build.py` | link graph |
| `data/revamp/identity/redirect-plan-v5.csv` | `scripts/revamp/identity_apply.py` | redirects |
| `data/revamp/identity/legacy-redirects.csv` | the identity work, from the production table | redirects |
| `data/revamp/identity/canonical-v5.ndjson`, `page-slugs.csv` | `scripts/revamp/identity_apply.py` | redirects, link graph |
| `data/corpus-20k/reconciliation/dispositions.ndjson` | the corpus-20k run | redirects |
| `data/revamp/ci-sample/slug-union.csv` | `scripts/revamp/ci_slug_union.py` | redirects |
| `data/revamp/ci-sample/thresholds-v12.json` + `presence-applicable-v12-hub-members.ndjson` | `scripts/revamp/ci_sample.py` | link graph |
| `data/revamp/ci-sample/render/*.ndjson.gz` (200 pages) | `scripts/revamp/ci_sample.py` | render safety |
| `data/revamp/ci-sample/robots.ts.snapshot` | `scripts/revamp/ci_sample.py` | sitemap invariants |

The two writers have a `--check` mode that fails when a committed input no longer matches the
corpus on the workstation, so a stale sample is a red check rather than a quiet one. The samples are
regenerated with `npm run revamp:ci:sample`, which reads the corpus and therefore runs on the
workstation only. **Phase 7 refreshes the ruler pair** when the settled ruler lands, and refreshes the render sample
from the render that ships with it. Measure 8 (v12) did that: the pair is `thresholds-v12.json` and
`presence-applicable-v12-hub-members.ndjson`, and the render sample is drawn from
`data/revamp/render-v12`.

Everything each check cannot see from CI is named under it, with the command that checks it on the
workstation. Nothing required by the spec is quietly reduced to advisory.

`data/revamp/ci-sample/local-run.json` records the last run of the four required pre-merge checks
outside this repository's working copy: `git archive HEAD` into a temporary directory, the files
this change adds copied in beside it, a virtual environment built from
`scripts/revamp/requirements-ci.txt`, and no corpus. It carries the exit code, the duration and the
last line of each check, and one negative probe per check with the message it fails with.

## Required, before a merge

Every one of these fails the workflow and names the offending page, pair or slug on stderr.

### 1. Redirects: the plan over the committed slug union

Reads `data/revamp/ci-sample/slug-union.csv` (9,907 slugs: the 9,857 the site has published, plus
the 50 the plan introduces), the plan, the recorded production redirect rows, the canonical identity
revision and the page-slug route map. Fails on an orphan, on a redirect chain of two hops, or on a
plan row that contradicts a recorded production row.

```
npm run revamp:ci:slug-union      # scripts/revamp/ci_slug_union.py --check
npm run revamp:ci:redirect-plan   # scripts/revamp/ci_redirect_check.py --plan
```

`scripts/revamp/redirect_check.py` reads the live `medicine_slug_redirects` table through the
Railway CLI before it simulates anything, which a runner cannot do. `ci_redirect_check.py` calls
that script's own `read_plan`, `surviving_slugs` and `check_plan` — imported, not copied — with the
committed union and `data/revamp/identity/legacy-redirects.csv` in place of the two live reads. Both
runs report the same numbers on this plan: universe 9,907, served directly 8,863, served by one hop
1,044, zero orphans, zero chains, zero conflicts.

Not visible from CI: whether the live table still holds those 870 rows. The post-deploy job requests
every slug in the union against the deployed site, which is where a drifted row shows up as a status
code.

### 2. Hub link graph

Reads the three hub parquet files in full and the committed ruler pair.

```
npm run revamp:ci:link-graph
# scripts/revamp/link_graph_check.py --data-only \
#   --thresholds "$PWD/data/revamp/ci-sample/thresholds-v12.json" \
#   --presence "$PWD/data/revamp/ci-sample/presence-applicable-v12-hub-members.ndjson"
```

Rules 1, 3 and 4 are checked over every hub and every member: no hub under five leaves (923 hubs),
no hub whose `(type, slug)` pair the `/h` route cannot resolve, every member link on a slug the
corpus publishes (13,121 members). Rule 2 — no indexable leaf without a hub or a recorded reason —
is checked over the 271 indexable leaves the hub build recorded as members.

Not visible from CI: rule 2's second half. A leaf with no hub passes only where its stored fields
name no target, no ATC level-4 code and no pathway, or where every group they name is under the
five-member floor, and both answers are read from `data/revamp/fields-v2/`. The committed presence
rows are the hub members alone, so in CI rule 2 asks the first half — a member the hub build drops
fails by name — and the whole rule runs on the workstation:

```
.venv-corpus/bin/python scripts/revamp/link_graph_check.py --data-only
```

A leaf that leaves the hub set is reported in CI as `<key> is indexable and has no stored field
record`, which is the second half saying that it has no field records to read there. The key it
names is the leaf that left.

The three build rules (`/h` links every hub, every hub answers 200, every member link answers 200)
need a running site and are in the post-deploy job.

### 3. Sitemap, noindex and robots invariants

A Vitest file over `lib/corpus/sitemap.ts` with fixture records, so it needs no database.

```
npm run revamp:ci:sitemap   # vitest run tests/unit/ci-sitemap-invariants.test.ts
```

Four cases, one per invariant in Operating Rule 7:

- **Tier 3 is in no sitemap child.** The fixture includes a Tier 3 record whose `indexable` flag is
  true, so what the case measures is the sitemap's own rule rather than the loader's; every child is
  generated and asserted free of both Tier 3 URLs, and `SITEMAP_CHILDREN` is asserted to have no
  `tier-3` member at all. The pages child is given a legacy publication for a Tier 3 slug, so the
  rule that defers to the corpus record is exercised too.
- **The hubs child carries hubs and nothing else**, and is advertised only where hubs exist: `/h`
  and one URL per hub route, no `/d/` URL, and `populatedSitemapChildren()` drops `hubs` when the
  hub table is empty.
- **No child over 50,000 URLs.** `cappedEntries` truncates at the protocol limit and logs
  `[seo.sitemap_over_protocol_limit]` with the count; at exactly the limit it drops nothing and logs
  nothing.
- **`app/robots.ts` is byte-identical** to `data/revamp/ci-sample/robots.ts.snapshot`. The failure
  message names the snapshot and the command that refreshes it.

### 4. Rendering rules over the committed sample

```
npm run revamp:ci:render-safety
# .venv-corpus/bin/python -m pytest tests/test_render_safety.py \
#     --sample data/revamp/ci-sample/render -q
```

`tests/test_render_safety.py` reads the render the workstation wrote. `tests/conftest.py` adds one
option, `--sample`, which points its four stream constants at
`data/revamp/ci-sample/render/{text,text-with-furniture,provenance-with-furniture,blocks}.ndjson.gz`
and reads each as one gzipped file instead of a directory of batches. Every rule, pattern and
assertion is the test file's own; nothing about what a rule accepts is changed. Read a stream with
`gzip -dc`.

The 200 pages are not a plain random draw. `ci_sample.py` first draws pages for each rule that
asserts it saw something to check — a controlled-substance page, a Poisons Standard row with a
substance as listed, a quoted label sentence on an interaction line, a supervision block on each of
its two branches, a not-found register line, an absence table, a trial row — and fills the rest by a
seeded per-tier draw. `render/manifest.json` records which page was drawn for which rule, the seed,
the tier counts and a SHA256 per file. The draw covers 59 Tier 1, 69 Tier 2 and 72 Tier 3 pages.

The rules of `tests/test_render_safety.py` run here. Four cannot, and `conftest.py` prints each one
with its reason at the start of the run rather than letting it skip quietly. Any other skip is turned into a failure, so a sample
that lost a stream reports red instead of green over nothing.

| Rule | Why not here | Where it runs |
| --- | --- | --- |
| `test_the_trace_of_an_absence_names_paths_the_record_does_not_carry` | resolves every absence trace against the stored field record of its page and asserts it read more than 1,000 records, from `data/revamp/fields-v2/` | `.venv-corpus/bin/python -m pytest tests/test_render_safety.py -k absence` |
| `test_every_trace_on_a_sampled_page_resolves` | runs `slop_draw`'s resolver, which loads those same field records and reads `corpus_pages` from a loaded database | the same command with `DATABASE_URL` set |
| `test_the_render_and_the_painted_page_agree` | asserts the result of `scripts/revamp/dom_parity.py`, which renders against a running build | `dom_parity.py --base-url http://127.0.0.1:3142`, then the same command |
| `test_the_provenance_timeline_fires_only_on_three_dated_events_in_order` | reads seed 8's own records in `data/revamp/derived-v2/`, which is gitignored; the rule is about what the derivation wrote, not about what a page painted, so no render sample can carry it | `.venv-corpus/bin/python -m pytest tests/test_render_safety.py -k provenance_timeline` |

Phase 7 runs the whole file, with no `--sample`, from the workstation before the deploy.

## Required, after a deployment

One job, `post-deploy`, on `workflow_dispatch`, on a `deployment_status` event whose state is
`success` (Railway emits one for a finished deployment), and nightly at 02:25 UTC so a site that
drifts between deploys is still measured. Chromium is installed with
`python -m playwright install --with-deps chromium`. Every result is uploaded as an artefact,
including the request log the checks append to.

```
python scripts/revamp/ci_redirect_check.py --live --base-url https://rnawiki.com
python scripts/revamp/rendered_dup_check.py --base-url https://rnawiki.com \
    --fail-on-indexable --sample 200 --concurrency 4
python scripts/revamp/link_graph_check.py --base-url https://rnawiki.com \
    --thresholds "$PWD/data/revamp/ci-sample/thresholds-v12.json" \
    --presence "$PWD/data/revamp/ci-sample/presence-applicable-v12-hub-members.ndjson"
```

- **Redirects, live half.** Every slug in the committed union requested against the site, four at a
  time, redirect not followed; a slug passes on 200, 301 or 308 and any other status is named.
- **Rendered duplicates.** The indexable set comes from the live sitemap children; pages are
  rendered in headless Chromium at 390 px and 1280 px, cut into five-word shingles and scored on
  exact Jaccard. `--fail-on-indexable` exits non-zero naming the first indexable pair at or above
  0.5. The 200-page noindex draw is seeded, so a re-run measures the same pages.
- **Hub link graph against the site.** The data rules again, plus the three the build answers: `/h`
  links every hub it publishes, every published hub answers 200, and every member link a published
  hub page carries answers 200.

## Advisory

These report and do not block a merge. Both are `continue-on-error`.

- **Slop draw**, on `workflow_dispatch` and the nightly schedule:
  `slop_draw.py --base-url https://rnawiki.com --per-tier 5`, a 15-page draw. It needs the loaded
  page list from `corpus_pages` over `DATABASE_URL` and the render whose text the corpus-wide
  template census of check (b) is computed from. Where either is missing the job prints which one
  and the workstation command that produces it, and stops without failing. The gate that decides
  Phase 4 is the full draw on the workstation, not this job.
- **Field census delta**, on a pull request, and only where the diff touches
  `data/revamp/field-census-*.csv`: `census_delta.py` over the two committed census files and
  `data/revamp/fields-v2/integration-summary.json`, the field integration's record of which source
  filled which field. Where no census file changed, or where that summary is absent —
  `data/revamp/fields-v2/` is gitignored — the job says which and stops. `field_census.py` itself
  reads the field records and runs on the workstation only.

## Adding a check

A check belongs in this workflow when it reads files the repository carries and fails with the page,
pair or slug named. A check that needs the corpus, a database or a build belongs in the post-deploy
job or in the Phase 7 run-book in `docs/specs/deployment-plan.md`, and its row here says so. A check
is never left advisory because it is inconvenient to make it pass: either it blocks, or this file
records what it cannot see and which command sees it.
