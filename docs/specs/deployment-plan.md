# Deployment plan (Phase 5; R6, R8, R13)

**Status:** designed 2026-09-04 (Fable). Executed by Opus tier by tier; each tier is its own
deployment, verified live before the next starts.

## Order, refined 2026-09-04 (code first, rows second)

The dossier route renders the new template only when a `corpus_pages` row exists for the slug, and
the sitemap index reads `indexable` rows. So:

0. Pre-release backup of production PostgreSQL over the CA-pinned TLS connection
   (`/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/rnawiki-backups/railway/postgres-root.crt`, `PGSSLSERVERNAME=localhost`) into
   `/Users/admin/ClaudeRepo/Claude Projects/RNAwiki/rnawiki-backups/corpus-20k-<date>/` with the PG18 `pg_dump`; verify the archive lists.
1. Deploy the code and migrations 0024–0025 with EMPTY corpus tables: every existing page keeps its
   legacy rendering, the sitemap index serves the legacy population, redirects table unchanged.
   Verify live (verify-live.ts against production) before any row is written.
2. Load Tier 1 from the workstation against production (loader over TLS, batches of 250,
   checkpointed under phase 5, `--allow-working-database` is NOT the flag for production: the loader
   takes an explicit production URL and refuses without `--production-confirmed`), including the
   864 redirect rows whose targets are in Tier 1. Pages switch to the new template as rows land.
3. Verify live per tier (the seven sample URLs that fall in the tier, a Tier 3 noindex check once
   Tier 3 loads, sitemap children, 20 redirects 301|308, robots, no vendor hosts, suppression),
   IndexNow the tier's indexable URLs, orphan audit + click depth.
4. Repeat for Tier 2, then Tier 3.
5. The export/agents chain (`export:dataset` → commit → `agents:run` → `attach:agent-datasets`)
   runs after the code deploy exactly as documented; the corpus tables are outside its digest.

## Order, per tier (original)

1. Materialise the tier's pages into the database from `data/corpus-20k/fields/*` and the derived
   seeds (migration adds `corpus_pages`, `page_fields`, `page_questions`, `page_relations`,
   `page_sources` with per-field source/verified dates; existing `drugs` rows stay and are linked by
   slug; nothing reviewed is overwritten).
2. Write the 864 `medicine_slug_redirects` rows (R8) in the same change as the sitemap rebuild;
   301s verified before the old sitemap is replaced.
3. `export:dataset` → commit the export → `agents:run` → `attach:agent-datasets` (the digest chain;
   exact order, no shortcut).
4. `npm run gate` locally (typecheck, lint, copy checks, unit, integration on a disposable
   database, build, Playwright at 320 px and desktop on the tier's sample pages).
5. Push branch, CI, merge to main, Railway deploy; record render throughput (pages/second) from the
   build log.
6. Verify live: the seven sample URLs; a Tier 3 page carries noindex and is absent from every
   sitemap; the sitemap index resolves and each child ≤ 50,000; 20 random redirects answer 301 or 308 (Next's permanentRedirect emits 308; crawler semantics are equivalent); robots.txt
   still allows the dossiers.
7. Submit the tier's sitemap URLs to IndexNow (existing `discovery:indexnow`).
8. Re-run the orphan audit (`discovery:monitor`) and the click-depth report; fix before the next tier.
9. Measure the deployed tier against baseline with the R3 overlap measure at matched sample sizes.

Tier 1 first (Longevity + withdrawn arcs), then Tier 2, then Tier 3. A failure in a later tier never
rolls back an earlier one.

## Safety checks that block a deploy

Any suppressed page rendering a seed 1/2/6 block; any page with a placeholder or empty heading; any
vendor/retailer/affiliate host in a link; any Tier 3 URL in a sitemap; any previously indexed slug
without a 200, 301 or 308; render throughput below 1 page/second (investigate before scaling).

## Phase 7 (revamp 2026-09): the load procedure, with the hub tables

**Status:** fixed 2026-09-08 by the lead (Fable), from `data/revamp/hubs/integration-plan.md` §3.

The revamp load is the same procedure with one more step, and the step has an order it cannot be
run out of. `hub_members.key` is a foreign key onto `corpus_pages.key`, so a hub loaded before its
members' pages exist would drop every member it names.

Run, per database, in this order:

1. `npm run db:migrate` — migrations `0026`–`0030` (the Phase 4 block tables, the ruler numerator,
   the hub tables, the seed-slot parity and the question-value parity).
2. `npx tsx scripts/corpus-20k/load/materialise.ts --tier 1 --revamp --thresholds
   data/revamp/thresholds-v7.json`, then `--tier 3`, then `--tier 2`. Tier 3 loads before Tier 2
   because a Tier 2 page's relations name Tier 3 records.
3. `npx tsx scripts/revamp/hubs_load.ts` — **after** every tier, never before or between them.
   A member whose page is not loaded is skipped and counted; a hub left under five loadable members
   is skipped whole rather than published short. Re-running it prints "already loaded" and does no
   database work.

The hub loader is kept separate from `materialise.ts` rather than spawned by it. `materialise.ts`
runs once per tier and the hub load runs once for the corpus, so calling it from inside the tier
loader would either run it three times or make one tier's invocation special. The ordering
constraint is stated here, in the runbook that already sequences the tiers, and the loader's own
guards — the working-database refusal, the `--production-confirmed` refusal for any non-local host,
the fingerprinted marker, the single transaction — are the same ones `materialise.ts` applies.

**Check it landed**, against a disposable database: `select count(*) from hubs` returns the hub
count `data/revamp/hubs/counts.json` records, or fewer with the skip counted in the loader's own
output; `/sitemap.xml` lists `sitemaps/hubs.xml`; `/h` answers 200 and is linked from the site
footer; a member page — `/d/bicalutamide` is in `target/ar` — shows a Hubs row whose link answers
200. Tier 3 slugs appear in no sitemap child, `hubs.xml` included.

## The corpus document (step 6.1): what deploying `/d/*` and `/h/*` now involves

Step 6.1 measured what an App Router page costs on this corpus. On the 108-page set of
`data/revamp/payload-audit-before.json` the React Server Components stream Next.js inlines into
every page was a median **54.5 %** of the served document's bytes and repeated **100 %** of the
rendered record's text, and live text-to-HTML was **0.048** against the step's 0.15 floor. No
configuration removes that second copy: `createInlinedDataReadableStream` is called unconditionally
in `next/dist/server/app-render/app-render.js` on every render path a page can take. Removing it
alone would still not have reached the floor — the counterfactual, measured page by page on the
same set, was **0.108** — so the markup was cut as well.

`/d/<slug>` and `/h/**` are therefore no longer pages. They are route handlers that render the
record on the server once and write the whole document themselves
(`lib/corpus/document.tsx`, `lib/hubs/document.tsx`, `components/document/DocumentShell.tsx`). The
result is **0.15517** on the same 108 pages, **0.15399** on the 100-page indexable draw and
**0.17639** on the eight named samples, with the flight stream at **0**
(`data/revamp/payload-audit-after.json`).

**The build step.** `npm run build` runs `scripts/build-island.mjs` first, through `prebuild`;
`npm run dev` runs it through `predev`. It bundles `lib/island/` with esbuild to
`public/island/rnawiki-document.js` — the one script a corpus document loads, carrying the header
search field, the contents rail's active marker and the analytics choice. It is a build artefact,
gitignored, and **a deploy that skips it serves documents whose search field does not answer, whose
rail marker does not move and which never offer the analytics choice**. Nothing else in the build
changes; Railway's build command is still `npm run build`.

**What the deployment must now be true of.**

- **The build directory must be present and readable at run time.** The document reads
  `.next/app-build-manifest.json` once per process to find the stylesheets the root layout emits,
  which are the same files the React shell links (`lib/document/stylesheets.ts`). A server started
  against a stale or absent `.next` raises the failure by name rather than serving an unstyled
  page. Build and serve from the same directory, as `next start` already requires.
- **`PORT` must be set, or the server must be reached on loopback.** A medicine the corpus does not
  hold — 29 slugs on the 2026-09-08 load, and every fixture the end-to-end suite installs — is
  still the React dossier with its comment thread, its correction controls and its programme
  selector, and a route handler cannot render an App Router page. `/d/<slug>` forwards those to
  `/legacy-record/<slug>` over the loopback interface and returns exactly what that page answered,
  including its 308 to a canonical slug and its 404 (`lib/document/legacy-forward.ts`). The
  loopback address comes from the `host` header when the request arrived on loopback, and from
  `PORT` otherwise. Railway sets `PORT`; `npm run start` passes it to `next start`. With `PORT`
  unset behind a proxy the forward would target port 3000 and those 29 URLs would fail while every
  corpus record kept working.
- **`/legacy-record/*` is not a public URL.** It is in no sitemap, is linked from nothing, and
  answers 404 unless the request carries the token the route handler mints for the forward. Its
  canonical, its indexing decision and its redirects are all about `/d/<slug>`.
- **The corpus document is the same bytes for every reader.** It carries no account control and no
  session read, so it can be cached whole. The header's account and feedback controls belong to the
  React shell; the document's footer links to the front page, where signing in is one click. A
  reader signed in on another page is not named in a corpus document's header.
- **Analytics is unchanged in policy and different in code path.** `lib/island/analytics.ts` and
  `components/GoogleAnalytics.tsx` read the same rules from `lib/google-analytics.ts` — the stored
  consent key, the measurement-id shape, the path sanitiser and the paths never measured — so a
  reader's choice, the cookie names and the fields sent are one policy. No tag loads and no cookie
  is written before a reader has allowed it.

**Check it landed**, against the deployed host: `/d/<an indexable slug>` contains no
`self.__next_f.push`; `/island/rnawiki-document.js` answers 200; `/d/<a legacy-only slug>` answers
200 and `/legacy-record/<the same slug>` answers 404; `/h` and `/h/<type>/<slug>` answer 200 and an
absorbed hub slug answers 308; `scripts/revamp/payload_audit.py --base-url <host>` reports a live
text-to-HTML median at or above 0.15 and an RSC share of 0.

## Phase 7 run-book (revamp 2026-09; fixed by the lead 2026-09-09)

Every step produces an artefact path; a step without one did not happen. Order is binding.

0. **Backup.** `pg_dump -Fc` of production over the CA-pinned connection to
   `rnawiki-backups/revamp-2026-09-deploy/rnawiki-pre-revamp.pgcustom`, size and sha256 recorded;
   table-data entry count compared with the 2026-09-05 backup (must be ≥ 70 + the corpus tables).
1. **Code first, rows second.** Open the PR `revamp/2026-09` → `main`; CI green (release gate +
   revamp-checks); merge; watch the Railway deployment to SUCCESS; `preDeployCommand` replays
   migrations 0026–0031 (read the count after: 32). `PORT` behind the proxy per §6.1's document
   architecture (the legacy-record forward needs it) — verify one legacy-only slug answers 200
   before any load.
2. **Verify with the old rows.** The corpus tables still hold the corpus-20k load: every one of
   the eight samples answers 200 on the new document renderer; `verify-live.ts --require-all` on
   the pre-load state; robots unchanged; frozen bar 0.00 px; JSON-LD one block; sitemap index
   children present (tier-1, tier-2, browse, hubs (empty until step 4), pages).
3. **Load tiers in order** from the workstation with `materialise.ts --production-confirmed
   --thresholds data/revamp/thresholds-v9.json` (the settled ruler), applying redirect plan v5,
   trial reassignments v5 and duplicate holds, Tier 1 → verify → Tier 2 → verify → Tier 3 →
   verify; each verify = `verify-live.ts --require-all` after the 15-minute sitemap cache,
   `redirect_check.py --base-url https://rnawiki.com` (all 9,857 legacy slugs 200/301/308),
   `rendered_dup_check.py --base-url https://rnawiki.com --fail-on-indexable`, 20 random pages
   per tier compared with the build output (h1, block count, first block), frozen bar, JSON-LD.
   Markers carry the production fingerprint; a re-run is a no-op.
4. **Hubs.** `hubs_load.ts --production-confirmed` (aliases, members, syntheses); verify 10 random
   hubs against the build; `link_graph_check.py --base-url https://rnawiki.com` (all rules);
   `hubs.xml` count equals the surviving hub count.
5. **IndexNow.** `npm run discovery:indexnow -- --tier 1`, `--tier 2`, and `--hubs` (the
   corpus-aware submitter reads the sitemap children; Tier 3 refused by design); ledger lines in
   `docs/audits/discovery/indexnow-submissions.ndjson`; `SEO_DEPLOYMENT_ENV=production` for the
   run.
6. **Orphan audit.** `discovery:monitor` over the whole index (scoped per child to stay within
   memory), 0 unreachable, click depth ≤ 3 for every indexed record and hub.
7. **After.** `data/revamp/after.json` with every `baseline.json` measurement re-run by the same
   scripts and samples against the live site, plus the Phase 4–6 measures (thresholds v9 on the
   live text, rendered duplicates on the live indexable set, payload on the 108 pages,
   text-to-HTML, common-line share, median words); `data/revamp/before-after.md` in the corpus-20k
   FINAL REPORT layout.
8. **FINAL REPORT 2** appended to `docs/worklogs/revamp-2026-09.md` from
   `data/revamp/final/final-report-2-draft.md` with every [Phase 7] slot filled; `state.json`
   gates set; the records PR opened and merged on green.

Rollback: `pg_restore` of step 0's dump over the CA-pinned connection restores rows; the code
deploy is reverted by redeploying the previous Railway deployment id (recorded in step 1).
