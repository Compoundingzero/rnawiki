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
