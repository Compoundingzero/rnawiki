# SEO and GEO implementation report

Snapshot: 2026-08-25

This report describes the SEO/GEO changes visible in the current RNAWiki worktree. It does not
claim that a search engine has indexed the pages, that rankings improved, or that the Core Web
Vitals goals pass. Production crawl, indexing and field-performance checks remain external release
work.

## Scope boundary

The worktree also contains a separate owner-authored account and authentication refactor. Deleted
physician-verification routes and components, the single-account UI, session reconciliation, note
attribution, and their tests are not SEO/GEO deliverables. A few shared files contain both bodies of
work; the file inventory below names the SEO/GEO responsibility in those files rather than
attributing every changed line to this project.

The two specialist roles now have durable contracts in
[`seo-geo-agent-charters.md`](./seo-geo-agent-charters.md): the SEO agent owns eligibility,
canonicals, crawler behavior, migrations and notification behavior, while the GEO agent owns
answer-first structure, exact citation dependencies, structured-data parity and safe public
projections. Both fail closed on unknown evidence or provenance and preserve programme scope.

## 1. Executive summary of the original defects

The original implementation had several material discovery and answer-readiness defects:

- the sitemap selected almost every public medicine identity, including stubs, and used
  `drugs.updated_at` as `lastmod`; it also included `/review-queue`;
- `robots.txt` queried the database to count shards, had no canonical-production guard, blocked only
  `/api/`, and did not express separate OAI-SearchBot and GPTBot policies;
- root metadata declared `index,follow` on every deployment, including preview and staging builds;
- dossier metadata depended on the signed-in viewer read, admitted legacy/unreviewed descriptions,
  and could canonicalize to an internal-id/programme-query representation;
- there was no single fail-closed publication/freshness policy shared by page metadata and the
  sitemap;
- case variants, aliases, renames and merges had no durable one-hop public-identity resolver;
- retired compound and protocol-era URLs could fall through without a documented 301/410 migration
  contract;
- arbitrary browse parameters, duplicate keys and empty filter results could create duplicate 200
  surfaces;
- histories, the review queue and empty profiles did not have a complete explicit noindex policy;
- dossier JSON-LD was one isolated `Drug`/`DietarySupplement` object, including on pages that had
  not passed a reviewed-publication boundary;
- the ten-second finding and limitation did not carry their exact saved claim/source dependency
  path into adjacent citations;
- published-programme pages could inherit legacy medicine-wide pricing, acquisition, protocol,
  dosing-adjacent and other unreviewed context; and
- there was no built-route search audit, public migration runbook, or field-performance runbook.

The current worktree replaces those behaviors with a conservative shared dossier policy, a
publication-derived sitemap, environment-aware crawler guards, canonical identity history,
documented 301/410 handling, strict browse parameters, connected JSON-LD, answer-first dossier
sections, exact adjacent citations when the stored dependency exists, and an executable search
audit.

Important boundaries remain. The repository does not yet have a persistent tagged public-content
cache, a session-independent public shell, complete publication-driven invalidation, field Web
Vitals data, or substantive reviewed content for the requested condition/target/trial/glossary/data
hubs. Those omissions are recorded below rather than represented as completed work.

## 2. Exact SEO/GEO files added and modified

### Added: shared policy, crawler and migration implementation

- `lib/seo/canonical-production-origin.mjs` and its TypeScript declaration — one exact, fail-closed
  canonical-production predicate shared by Next configuration and runtime metadata.
- `lib/seo/deployment.ts` — canonical-production detection and fail-closed root/page robots
  metadata, including `max-image-preview: large` in production.
- `lib/seo/freshness.ts` — exact programme monitoring aggregation shared with indexing.
- `lib/seo/indexability.ts` — pure typed medicine decision and all-issues editor report.
- `lib/seo/dossier-indexability.ts` — rendered dossier adapter into the shared policy.
- `lib/seo/publication-indexability.ts` — safe database projection used by sitemap and editor
  diagnostics.
- `lib/seo/metadata.ts` — bounded home/dossier title and safe description builders.
- `lib/seo/indexnow.ts` — canonical-production-only IndexNow configuration, URL validation,
  10,000-URL batching, timeouts, failure logging and shared-policy publication notification.
- `lib/seo/legacy-routes.ts` — retired route-family and verified exception map.
- `lib/seo/legacy-response.ts` — exact legacy resolver, 301/410 behavior and privacy-minimal logging.
- `middleware.ts` — real 410 responses for retired unsafe or obsolete route families.
- `app/c/[slug]/route.ts` and `app/t/compound/[slug]/route.ts` — GET/HEAD one-hop legacy
  compound resolution.
- `app/r/[slug]/route.ts` — database-backed GET/HEAD resolution directly to a terminal canonical
  dossier or privacy-minimal 410.
- `app/review-queue/search-indexing/page.tsx` — steward/admin-only all-reasons indexability report.
- `app/indexnow-key.txt/route.ts` — runtime ownership-key GET/HEAD route; 404 outside an enabled
  canonical production deployment.
- `db/migrations/0013_canonical_slug_history.sql` and
  `db/migrations/meta/0013_snapshot.json` — owner-curated canonical slug/merge ledger.

### Added: public discovery, trust and social surfaces

- `app/editorial-policy/page.tsx` — a public trust page grounded in the existing publication
  model.
- `app/llms.txt/route.ts` — visible plain-text discovery and citation guidance; it is documented as
  optional discovery, not a ranking requirement.
- `app/opengraph-image.tsx` and `app/d/[slug]/opengraph-image.tsx` — default and dynamic dossier
  social images using visible public projection data.
- `app/icon.tsx` and `app/manifest.ts` — generated icon and web manifest.

### Added: diagnostics, documentation and tests

- `scripts/quality/audit-public-search.ts` — read-only crawl/audit of a running origin.
- `docs/seo-geo-baseline.md`, `docs/seo-indexing-policy.md`,
  `docs/search-migration-runbook.md`, `docs/public-search-audit.md`,
  `docs/performance-runbook.md`, `docs/seo-geo-agent-charters.md`, and this
  `docs/seo-geo-implementation-report.md`.
- `tests/integration/canonical-slug-history.test.ts` and
  `tests/integration/public-programme-corpus-count.test.ts`.
- `tests/unit/seo-indexability.test.ts`, `tests/unit/seo-freshness.test.ts`,
  `tests/unit/seo-publication-indexability.test.ts`, `tests/unit/seo-sitemap.test.ts`,
  `tests/unit/seo-deployment.test.ts`, `tests/unit/root-site-url-fallback.test.ts`,
  `tests/unit/seo-route-metadata.test.ts`,
  `tests/unit/seo-metadata.test.ts`, `tests/unit/dossier-indexability.test.ts`,
  `tests/unit/next-config-seo.test.ts`, `tests/unit/legacy-record-route.test.ts`,
  `tests/unit/indexnow.test.ts`, `tests/unit/indexnow-key-route.test.ts`,
  `tests/unit/programme-publication-indexnow-route.test.ts`,
  `tests/unit/public-medicine-discovery.test.ts`,
  `tests/unit/legacy-search-routes.test.ts`, `tests/unit/legacy-response.test.ts`, and
  `tests/unit/public-search-audit.test.ts`.

### Modified for SEO/GEO behavior

- `.env.example` — documented `SEO_DEPLOYMENT_ENV` fail-closed marker and disabled-by-default
  IndexNow configuration.
- `app/layout.tsx` — category metadata, manifest, Open Graph/Twitter defaults and deployment-aware
  robots metadata.
- `app/page.tsx` — canonical home metadata and connected Organization/WebSite JSON-LD.
- `app/robots.ts` and `app/sitemap.ts` — runtime-safe robots rules and eligible canonical sitemap.
- `app/browse/page.tsx` — strict parameter validation, 404 empty combinations, and facet noindex.
- `app/d/[slug]/page.tsx` — canonical resolver/redirect, anonymous metadata read, shared eligibility,
  safe metadata and eligible-only JSON-LD.
- `app/d/[slug]/history/page.tsx` and
  `app/d/[slug]/programme/[programme]/history/page.tsx` — explicit noindex; programme history also
  links a recorded author handle when present.
- `app/review-queue/page.tsx` and `app/not-found.tsx` — explicit guarded noindex.
- `app/api/programme-verdicts/[id]/publish/route.ts` — schedules the eligible-publication IndexNow
  re-query after a newly committed, non-idempotent publication without changing the response.
- `app/u/[handle]/page.tsx` — unique metadata, empty-profile noindex and eligible ProfilePage graph.
- `components/MedicineDossierV2.tsx` — breadcrumbs, trust strip, stable answer anchors, exact adjacent
  source lists, source anchors and safe server-rendered evidence text.
- `components/dossier/DossierHeader.tsx` and `components/dossier/TenSecondAnswer.tsx` — extracted,
  server-rendered medicine identity and ten-second answer surfaces; the latter owns the stable
  `#what-it-is` fragment while the parent retains exact field-bound citations and trust details.
- `components/SiteFooter.tsx` — crawlable links to the added trust pages.
- `components/SiteHeader.tsx` — the SEO/GEO hunks make search results real links and connect dossier
  navigation to `/browse`; the account-state hunks in this file belong to the separate auth work.
- `db/schema.ts` and `db/migrations/meta/_journal.json` — migration 0013 schema and journal entry.
- `lib/evidence/types.ts`, `lib/queries/programme-evidence.ts`,
  `lib/programme-dossier-view.ts`, `lib/medicine-dossier-view-model.ts`, and
  `lib/public-medicine-language.ts` — typed summary-field dependency path, exact citation projection,
  source-field markers, and safe published-programme context.
- `lib/queries/drugs.ts` — anonymous public reads and canonical/historical/case/unique-alias route
  resolution, plus a discovery-only SQL boundary that excludes redirect-source identities before
  browse/search ranking, limiting and counting.
- `lib/json-ld.ts` — typed connected site, dossier and profile graphs.
- `next.config.mjs` — non-production `X-Robots-Tag` and retained verified permanent redirects.
- `package.json` — `check:seo`, `audit:search`, and `check:seo` in `gate`.
- `tests/unit/json-ld.test.ts`, `tests/unit/medicine-dossier-component.test.ts`,
  `tests/unit/medicine-dossier-view-model.test.ts`, `tests/unit/programme-dossier-view.test.ts`, and
  `tests/unit/public-medicine-language.test.ts` — graph parity, trust/citation HTML, and unsafe-field
  exclusion contracts.
- `tests/integration/programme-verdict-publication-adversarial.test.ts` — the GEO-owned hunk proves
  the three current summary-field dependencies survive the real publication/read path; the broader
  scientific publication test predates this work.

The current auth/account files, physician-verification deletions, note-attribution tests, session
tests, and unrelated API changes are deliberately excluded from this inventory.

## 3. Database migration and backfill behavior

Migration `0013_canonical_slug_history.sql` adds:

- enum `medicine_slug_redirect_reason` with `RENAMED` and `MERGED`;
- table `medicine_slug_redirects` with lowercase `old_slug` primary key, stable
  `target_drug_id`, required reason, non-empty rationale, and creation timestamp;
- a restrictive foreign key to `drugs.id`; and
- slug-shape, rationale and target lookup constraints/indexes.

The migration is schema-only. It intentionally inserts zero mappings and performs no guessed
backfill. Similar spellings and search aliases are not evidence that two medical identities are the
same public resource. An owner must verify each old slug and rationale before inserting it.

The resolver checks ledger existence before a retained old `drugs` row, then separately validates
the target as a public medicine. A missing or newly hidden target is authoritative-invalid and
cannot fall through to expose the retained old identity. The resolver also rejects a target whose
canonical slug is itself an `old_slug`. This enforces one hop and fails closed on a hidden target,
chain or loop. The integration fixture also proves that an internal medicine id can differ from its
public slug. The shared publication projection separately marks a retained old-slug row as a
redirect source, so it cannot re-enter the sitemap even if it still has otherwise eligible
publication data; the canonical target is evaluated normally.

Current publication ownership and freshness are associated with a medicine through the immutable
`programme_verdict_scope_snapshots.drug_id` captured for the published verdict. A later edit to the
live staging programme's `drug_id` cannot move a signed publication, sitemap decision or IndexNow
notification to another medicine.

No publication/editorial-state columns were added to `drugs`. Existing normalized publication,
review, source-snapshot, current-pointer and freshness tables were sufficient for the implemented
policy, and no unknown legacy state was backfilled as reviewed.

## 4. Final implemented indexability rules

`explainMedicineIndexability()` and `decideMedicineIndexability()` are the pure source of truth for
medicine dossier eligibility. The selected dossier is indexable only when all of the following are
true:

1. its canonical slug is non-empty and matches the lowercase public slug shape;
2. its retained slug is not an owner-curated old/merged redirect source;
3. the medicine has no recorded identity discrepancy;
4. it has an authoritative current programme publication;
5. the selected verdict state is exactly `PUBLISHED`;
6. genuine publication and review timestamps are present and valid;
7. public label, exact stored plain mechanism, exact stored best-supported finding and main
   limitation are all non-empty;
8. at least one signed source-metadata snapshot exists;
9. at least two distinct independent reviewer accounts are recorded; and
10. every monitoring row aggregates to `current`.

Freshness precedence is exact and fail-closed:

- `NEW_EVIDENCE` or `REVIEW_IN_PROGRESS` produces `review_required`;
- `DUE`, `STALE`, `SOURCE_UNAVAILABLE`, `CHECK_FAILED`, or an overdue stored `CURRENT` row produces
  `stale`;
- a non-empty all-`CURRENT` set produces `current`; and
- zero rows, `NOT_ASSESSED`, `UNKNOWN`, or another unresolved state produces `unknown`.

Only `current` may index. `lastPublicContentUpdate` is the real
`programme_current_publications.published_at` event. It never uses `drugs.updated_at`, a page view or
an ingestion timestamp. If several programmes have current publications, the latest published
programme is the default dossier; a newer ineligible default cannot be replaced in search by an
older eligible programme. Equal publication timestamps use stable programme identity as the final
tie-break in the dossier, public projection and indexability report; mutable live titles cannot
change the selected canonical answer.

The route adapter supplies this decision to dossier robots metadata and eligible-only dossier
JSON-LD. The safe database projection supplies the same decision to the sitemap and the
editor-facing report. Programme query state can only narrow the result to noindex; it cannot broaden
the policy.

Crawler indexing can broaden only when `NODE_ENV` and the explicit deployment marker are both
`production` and `SITE_URL` is exactly `https://rnawiki.com` or its root-slash equivalent. Missing,
malformed, HTTP, credential-bearing, port-bearing, path, query, fragment, whitespace and case-variant
spellings fail closed in both route metadata and the global `X-Robots-Tag` configuration. Root
metadata and site JSON-LD also construct URLs through the normalized configured-origin helper, so a
malformed value cannot crash module evaluation or leak malformed graph identifiers.

The implemented policy detects an owner-ledger redirect source, but it does not yet have independent
stored lifecycle, general duplicate-canonical, unsafe-content or manual-index-override fields.
Safety is currently enforced at the public projection/metadata boundary: eligible programme
metadata accepts only visible reviewed summary fields, and the published-programme view excludes
legacy pricing, alternatives, common questions, molecular details, community notes and the delivery
description that can contain dosing text. The reviewed programme's exact dose/exposure scope remains
visible because it defines the conclusion's scope. A future explicit safety/lifecycle flag must be
added to the shared policy before it can control discovery.

## 5. Legacy redirect and 410 map

| Incoming route                                                                                                                                   | Implemented response                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `/d/{oldSlug}` with a valid owner ledger row                                                                                                     | Next.js permanent redirect to `/d/{canonicalSlug}`; one hop only                                           |
| `/d/{caseVariant}` or one unique slug-shaped alias                                                                                               | Next.js permanent redirect to the canonical lowercase slug                                                 |
| `/c/{slug}` and `/t/compound/{slug}` with an exact safe resolution                                                                               | Explicit HTTP 301 to `/d/{canonicalSlug}`, with legacy query parameters removed                            |
| `/c/rapamycin-sirolimus`                                                                                                                         | Verified exception, HTTP 301 to `/d/rapamycin` when the target resolves                                    |
| Unresolved exact `/c/{slug}` or `/t/compound/{slug}`                                                                                             | HTTP 410, `X-Robots-Tag: noindex`, one-day public cache, and a privacy-minimal unresolved-path event       |
| Bare/deep `/c` and `/t/compound` forms                                                                                                           | HTTP 410                                                                                                   |
| `/protocol*`, `/target*`, `/goal*`, `/exercise*`, `/pathway*`, `/pathways*`, `/learn*`, `/solve*`, `/plan*`, `/p*`, `/interest*`, `/newsletter*` | HTTP 410; no unsafe protocol or unrelated homepage replacement                                             |
| `/r/{slug}`                                                                                                                                      | Resolve through the terminal identity ledger; one HTTP 301 directly to `/d/{canonicalSlug}`, otherwise 410 |
| `/compounds`                                                                                                                                     | Existing permanent redirect to `/browse`                                                                   |
| `/evidence`, `/methodology`, `/how-editing-works`                                                                                                | Existing permanent redirect to `/how-it-works`                                                             |

`NextResponse.redirect(..., 301)` is used for the compound and former-record route handlers. Next.js
`permanentRedirect()` and `permanent: true` redirects use the framework's permanent status; release
validation must record the actual deployed status rather than labelling every permanent response a 301.

No legacy URL, redirect, 410 route or query-string variant enters the sitemap. Unknown retired
compound paths log only event, family and pathname—never query strings, cookies, headers,
referrers, user agents or IP addresses.

## 6. Final route and hub architecture

### Implemented canonical discovery surfaces

- `/` — search-first home and connected site graph.
- `/browse` — canonical medicine library; only the unfiltered implicit first page is indexable.
- `/d/{canonicalSlug}` — one medicine identity with the latest published programme as the default
  answer; eligibility remains record-specific.
- `/how-it-works` and `/editorial-policy` — factual methodology/trust pages.
- `/u/{handle}` — contributor profile; indexable only after at least one accepted contribution.
- `/llms.txt` — plain-text discovery/citation guidance, not an indexability signal.

The sitemap currently contains four static discovery URLs (`/`, `/browse`, `/how-it-works`, and
`/editorial-policy`), only eligible canonical dossiers, and contributor profiles with at least one
accepted contribution. Profile `lastmod` comes from the latest public acceptance resolution, not
account activity. The eligible corpus fits one standards-compliant `/sitemap.xml`; speculative
sharding was removed.

Homepage medicine and programme counts use the same discovery exclusion. Published programmes are
owned through their immutable verdict scope snapshot; unpublished programmes use their live owner.
Retained redirect sources and hidden placeholder identities cannot inflate the visible corpus claim.

The dossier's server HTML now links Home -> Medicines -> dossier with visible breadcrumbs and puts
the direct programme answer near the H1. Implemented stable fragments include `#what-it-is`,
`#what-the-evidence-shows`, `#what-remains-unknown`, `#approval-status`, and `#sources`, alongside
the visible author/reviewer/date/source trust strip. Population/study design, the first-read
mechanism and review history also expose `#who-was-studied`, `#how-it-works` and `#review-history`;
the deeper views retain `#evidence-depth` and `#mechanism-map`.

### Programme architecture

Programme selection remains a UI state at `/d/{medicine}?programme={programme}`. It is
`noindex,follow` and canonicalizes to the base dossier. The repository does not claim a dedicated
indexable `/d/{medicine}/programme/{programme}` evidence landing page. Programme conclusion history
does exist at `/d/{medicine}/programme/{programme}/history`, but is intentionally noindex.

### Intentionally absent thin hubs

No new `/conditions`, `/targets`, `/mechanisms`, `/medicine-classes`, `/trials`, `/glossary`,
`/evidence-updates`, or editorial-report pages were generated because the current public projections
do not yet provide unique reviewed definitions, authorship, methodology, dates, limitations and
child eligibility for those surfaces. The singular legacy `/target/*` family remains 410; it was not
recreated as an empty SEO directory.

There is also no public `/data` page in this slice. See the licence blocker in sections 7 and 14.

## 7. Structured-data types implemented

`lib/json-ld.ts` now emits connected, typed graphs with stable fragment `@id` values:

- home: `Organization` and `WebSite`;
- eligible dossier: `Organization`, `WebSite`, `MedicalWebPage` + `WebPage`, `Drug` or
  `DietarySupplement`, `BreadcrumbList`, actual author `Person`, recorded reviewer `Person` nodes,
  visible-source `CreativeWork` nodes, and nested `PropertyValue` identifiers for recorded ORCID or
  snapshot hashes; and
- eligible contributor profile: `Organization`, `WebSite`, `ProfilePage`, `Person`, and a recorded
  ORCID `PropertyValue`/`sameAs` only when its stored format is valid.

Dossier graph emission repeats the eligibility gate and additionally requires a published programme,
conclusion, visible sources, actual author, reviewer(s), programme label, genuine published date and
genuine reviewed date. It returns `null` for a stub, unpublished programme, query-state variant or
missing provenance. Claim-like description and mechanism fields require their exact summary-field
dependency to close over curated claim/source bindings whose labeled source nodes are emitted;
dangling or page-wide-only citations suppress those fields. The graph uses the same normalized
canonical dossier URL as metadata and breadcrumbs, including when `SITE_URL` has a trailing slash.

The graph deliberately does not emit `AggregateRating`, `Product`, `Offer`, `Review`, `HowTo`,
`FAQPage`, invented `sameAs`, invented logo/funding facts, or hidden unsafe fields. `dateModified`
currently equals the recorded publication event because no separate verified public-content
modification event is available in the projection.

No `Dataset` graph is emitted and no `/data` page was added. `README.md`, `data/README.md` and
`data/manifest.json` declare **CC BY-SA 4.0**, while the text in `LICENSE-DATA` is **Creative Commons
Attribution 4.0 (CC BY 4.0)**. Until the owner resolves which licence is legally intended, RNAWiki
must not publish a Dataset licence assertion or a licence-bearing `/data` structured-data graph.

No `Article`, trial, target, mechanism, condition or evidence-update graph was added because the
matching substantive public route does not yet exist.

## 8. Actual caching and invalidation behavior

The current behavior is deliberately narrower than the target architecture:

- database-backed routes remain runtime dynamic, so Railway builds do not need the private
  production database;
- dossier metadata no longer reads `getCurrentUser()` or viewer-specific community-note vote state;
- `getPublicDrugBySlug()` supplies an anonymous medicine record to metadata;
- React `cache()` deduplicates canonical route, public dossier and evidence reads only within one
  server request;
- the dossier page still reads the viewer for `AppShell` and loads a viewer-specific dossier body,
  so the complete public HTML response remains session-coupled;
- `void incrementViewCount()` keeps the counter out of the awaited render path and does not modify
  `updated_at`, but it has not been moved to a durable queue/after-response job; and
- there is no persistent `unstable_cache`, tagged public projection, cache-tag invalidation, or
  publication/correction/merge/retirement/source-refresh revalidation implementation yet.

IndexNow notification is separate from application caching. After a newly committed,
non-idempotent programme publication, the API uses Next.js `after()` to re-read the complete shared
eligibility projection and notify only if that programme is the indexable default canonical
dossier. The notifier is disabled by default and never blocks or rolls back publication. It does
not invalidate a Next.js data cache because no persistent public cache exists yet.

Consequently there is no claim of a persistent cache hit rate or performance gain. The next safe
boundary is a purpose-built anonymous projection keyed by canonical medicine/programme/trial ids,
with explicit tags invalidated only after committed publication changes. It must not cache the
current personalised `getDrugBySlug()` result.

[`performance-runbook.md`](./performance-runbook.md) records the unmeasured field goals at the 75th
percentile: LCP <= 2.5 s, INP <= 200 ms, and CLS <= 0.1. RNAWiki has no production RUM dataset yet.

## 9. Tests added or extended

### Shared policy and crawl behavior

- valid and invalid canonical slug decisions;
- all publication, source, reviewer and freshness exclusions;
- editor reporting of every simultaneous failure;
- distinct-independent-reviewer counting;
- overdue-current, stale, review-required and zero-row freshness behavior;
- newest-current-programme selection and real publication `lastmod`;
- immutable published scope ownership after the mutable live programme is reassigned;
- equal-timestamp default selection shared by dossier, public projection and indexability report;
- retained historical-source exclusion without suppressing its canonical target;
- retained historical-source omission from browse, public list API, search, featured, popular and
  corpus counts while its one-hop resolver still works;
- sitemap omission of stale/noindex/query/history/review-queue routes;
- exact canonical-production, staging, preview, malformed-origin and missing-marker behavior;
- exact runtime/Next-config parity for missing URL, protocol, credentials, port, path, query, hash
  and root-slash cases;
- OAI-SearchBot/GPTBot rules and Google `max-image-preview: large`;
- browse canonical first page, filter/page noindex, and invalid/duplicate/empty parameter rejection;
- safe bounded metadata without unreviewed or actionable inputs; and
- legacy 301/410 responses, query stripping and privacy-minimal logging.

IndexNow unit/route tests cover disabled and missing-key no-ops, canonical-production key serving,
staging 404, same-origin canonical URL filtering, query/fragment rejection, deduplication,
10,000-URL batching, timeout/failure logging, shared-policy suppression, eligibility re-query
failure, successful canonical dossier submission, after-response scheduling and idempotent
publication retry suppression.

### Canonical identity and database behavior

`tests/integration/canonical-slug-history.test.ts` uses the disposable PostgreSQL path to prove:

- migration 0013 starts with an empty ledger;
- internal id and public slug can differ;
- an explicit historical mapping wins even while the old medicine row remains;
- an alias owned by that retained row and `/r/{oldSlug}` both resolve directly to the terminal
  target in one response;
- the canonical target still resolves normally;
- a redirect chain fails closed; and
- a ledger target that later becomes a hidden placeholder makes the old route, its retained-row
  alias and `/r/{oldSlug}` fail closed, then resolves normally again after the target is restored.

### GEO, visible parity and structured data

Extended tests cover stable connected graph ids, canonical URLs, actual authors/reviewers/dates,
profile ORCID handling, no empty/undefined graph values, absent fabricated people/dates, graph
suppression for ineligible pages, visible trust-strip facts, exact finding/limitation adjacent
citations, no verdict-wide source fallback, and omission of unreviewed legacy actionable fields from
published-programme server HTML. They also cover trailing-slash origin normalization and suppression
of claim-like JSON-LD fields when exact field-to-claim-to-source evidence is missing or dangling.

### Built-route audit

`npm run audit:search` and `tests/unit/public-search-audit.test.ts` cover duplicate title/description,
missing H1/canonical, redirecting canonicals, sitemap inclusion disagreements, broken internal links,
wrong-origin and fragment-bearing canonicals, invalid JSON-LD, unsafe metadata, evidence pages without visible source or
review status, missing production sitemap directives in `robots.txt`, and site-wide disallows for
the wildcard, Googlebot, Bingbot or OAI-SearchBot groups, including equal-specificity `Allow`
precedence. The command is read-only, never follows an external canonical, and defaults to a
loopback origin.

There is not yet a new Playwright matrix for every route/state listed in the assignment. The existing
representative browser suite remains the release-level regression journey, while alias/stub/profile/
preview combinations are currently covered mainly at unit/integration level. This is a remaining
test-depth gap, not a completed browser claim.

## 10. Commands run and verified results

The final combined worktree completed the full release gate on 2026-08-25:

| Command / gate stage       | Final recorded result                           |
| -------------------------- | ----------------------------------------------- |
| `npm run typecheck`        | Passed                                          |
| `npm run lint`             | Passed                                          |
| `npm run check:copy`       | Passed, 0 matched patterns                      |
| `npm run check:seo`        | Passed, 16 files and 115 tests                  |
| `npm run format`           | Passed                                          |
| `npx drizzle-kit check`    | Passed                                          |
| `npm run test:unit`        | Passed, 81 files and 1,067 tests                |
| `npm run test:integration` | Passed, 14 files and 88 tests; database dropped |
| `npm run build`            | Passed without build-time production DB access  |
| `npm run test:e2e`         | Passed, 14/14 Playwright tests                  |
| `npm run gate`             | Passed end to end                               |

Migration 0013 was generated with:

```sh
npm run db:generate -- --name canonical_slug_history
```

and Drizzle produced the SQL, metadata snapshot and journal entry without inserting data.

The gate used a disposable migrated PostgreSQL database for integration and browser tests and
removed it after each stage. Production crawler, indexing and field-performance observations remain
separate deployment checks.

## 11. Remaining production-only checks

1. Set `SITE_URL=https://rnawiki.com` and `SEO_DEPLOYMENT_ENV=production` only on the canonical
   production service; confirm preview/staging use a non-production marker.
2. Deploy migration 0013 before application code that queries `medicine_slug_redirects`; its clean
   disposable-database replay has passed.
3. Repeat the passing combined release gate in the deployment CI environment and retain its logs.
4. Fetch production `/robots.txt`, `/sitemap.xml`, `/`, one eligible dossier, one noindex dossier,
   filtered browse, both history routes, review queue, an empty profile, an accepted profile, each
   legacy response class and an unknown URL using GET and HEAD.
5. Confirm status, canonical, robots meta, `X-Robots-Tag`, Open Graph image, JSON-LD, source links and
   final redirect hop from the deployed CDN—not only the Next.js process.
6. Run `npm run audit:search -- --origin https://rnawiki.com --json` and archive the report.
7. Validate representative graphs in Google's Rich Results Test and the generic Schema Markup
   Validator. Validation is syntax/parity evidence, not a rich-result promise.
8. Diff the deployed legacy responses against the archived 641-URL crawl; resolve only
   owner-verified high-value mappings.
9. Confirm the Railway build completes while its private production database host is unavailable.
10. Add privacy-appropriate production RUM and collect 28 days of p75 mobile/desktop field data
    before making any Core Web Vitals statement.
11. Inspect CDN/WAF rules and status/latency logs for Googlebot, Bingbot and OAI-SearchBot. A
    user-agent string is not authentication, but legitimate public fetches must not be blocked.
12. Verify the public dossier, API/export binding, source freshness and review history all reference
    the same current publication revision after deployment.

## 12. Google Search Console deployment checklist

1. Export dated pre-release Performance, Page Indexing, Links and Crawl Stats reports.
2. Deploy crawler guards, canonical behavior, sitemap and 301/410 responses together.
3. Ensure Googlebot can fetch noindex/retired URLs to see their directives or 410; do not hide them
   behind a `robots.txt` disallow.
4. Submit `https://rnawiki.com/sitemap.xml` and verify every submitted URL is 200,
   self-canonical and eligible.
5. Live-test representative canonical dossier, stale/unreviewed dossier, browse, filtered browse,
   history, review queue, profile, owner-ledger old slug, safe compound 301, unresolved compound 410
   and retired protocol 410 in URL Inspection.
6. Confirm Google-selected canonical agrees with the declared `/d/{canonicalSlug}` URL and no
   query-state variant is selected.
7. Request indexing only for a small important canonical sample; use the sitemap for discovery and
   do not interpret submission as guaranteed indexing.
8. Start **Validate fix** only after representative live tests pass; retain the validation history.
9. Use Temporary Removals only for an urgent retired URL with no successor. It does not replace the
   permanent 410 and should not be used for mapped redirects whose signals should transfer.
10. Monitor weekly for redirect/not-found transitions, canonical disagreements, submitted-but-
    excluded spikes, crawl errors and 5xx responses.

## 13. Bing Webmaster Tools and IndexNow checklist

IndexNow is a notification channel, not a replacement for the sitemap, internal links, HTTP
responses or Google Search Console.

The code implementation is present and disabled by default. It requires the canonical-production
guard, `INDEXNOW_ENABLED=true`, and a valid `INDEXNOW_KEY`. When enabled, GET/HEAD
`/indexnow-key.txt` serves the public key; otherwise it returns a no-store 404. The notifier accepts
only same-origin HTTPS URLs without queries or fragments, deduplicates them, batches at most 10,000,
uses a bounded timeout and logs sanitized failures without blocking publication.

The wired event is a newly committed, non-idempotent programme publication. `after()` re-queries
the full shared medicine publication report, then submits only when that exact programme is the
eligible default canonical dossier. Draft edits, idempotent publication retries and page views do
not notify. An explicit helper exists for verified redirect/removal/deletion URL batches, but it is
not yet wired to merge, retirement or deletion workflows; those events must not be represented as
automated until a transactional caller is added.

The owner/release operator must:

1. verify the canonical site in Bing Webmaster Tools;
2. submit and validate `https://rnawiki.com/sitemap.xml`;
3. inspect a representative eligible dossier, old-slug redirect and 410 URL in Bing's URL tools;
4. generate and securely configure an IndexNow key, expose the matching key file at the exact
   production origin, and confirm it is not present on preview deployments;
5. publish a fresh eligible programme and verify one after-response POST contains only its canonical
   base dossier URL;
6. verify an ineligible/stale publication and an idempotent retry send nothing;
7. review failure logs and operational retry handling without rolling back a medical publication;
8. wire merge/retirement/deletion notifications only inside a verified committed workflow, including
   the old URL where required and never a draft or page view; and
9. archive accepted response codes and the one-time 641-route migration manifest.

Do not claim IndexNow is live merely because the code, route or environment names exist. Production
key ownership and an observed accepted request are separate checks.

## 14. Editorial facts and owner decisions still required

- **Dataset licence:** resolve the CC BY-SA 4.0 declarations versus the CC BY 4.0 legal text in
  `LICENSE-DATA`. This blocks `/data` Dataset licence markup and publication of a licence claim.
- **Dataset release facts:** after the licence is resolved, approve version semantics, safe public
  distributions, update cadence, creator, citation wording, provenance statement and excluded
  unsafe fields.
- **Organization facts:** provide the legal/operator identity, contact route, funding and
  independence statement, conflict policy, logo identity and any genuine official profiles before
  they enter visible trust pages or Organization schema.
- **Policies/pages:** provide approved privacy, terms, contact, source standards, review standards,
  conflicts/funding and author-directory content where the current facts are insufficient.
- **Crawler policy:** explicitly confirm or change GPTBot access independently from OAI-SearchBot.
  The current code allows both on canonical public content.
- **Historical identities:** approve every `medicine_slug_redirects` row with old slug, target,
  `RENAMED`/`MERGED` reason and non-empty rationale. Do not bulk-infer from aliases.
- **Freshness operations:** ensure every intended indexable programme has real monitoring rows and
  approved check deadlines. Zero/unknown monitoring rows intentionally exclude it.
- **Per-record accountability:** supply only genuine author, reviewer, reviewed date, ORCID,
  credential and conflict facts. Missing facts stay absent and can keep a graph or trust strip from
  appearing.
- **Entity/report expansion:** approve authors, methods, source sets, dates, limitations and
  correction paths before creating condition, target, trial, glossary or evidence-update landings.
- **IndexNow operations:** configure the production key and notification environment only after the
  deployed implementation and shared-eligibility tests pass.

## 15. Records and routes intentionally noindex

| Surface/state                                                             | Directive or response                                                               | Reason                                                                           |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Every preview, staging, branch or unidentified production-mode deployment | `noindex,nofollow,nocache`, response `X-Robots-Tag`, and `robots.txt` `Disallow: /` | Prevent deployment copies entering search                                        |
| Medicine with invalid canonical slug                                      | `noindex,follow`                                                                    | No durable public identity                                                       |
| Retained medicine whose slug is an owner-ledger redirect source           | `noindex,follow` and permanent redirect when requested                              | Only the target is canonical; prevents old-row sitemap duplication               |
| Medicine with identity discrepancy                                        | `noindex,follow`                                                                    | Unresolved identity dispute                                                      |
| Identity stub/no current programme publication                            | `noindex,follow`                                                                    | Identity is not reviewed evidence                                                |
| Non-`PUBLISHED` current verdict                                           | `noindex,follow`                                                                    | Publication transaction incomplete                                               |
| Missing genuine publication/review date                                   | `noindex,follow`                                                                    | Accountability/public date unknown                                               |
| Missing public label, mechanism, finding or limitation                    | `noindex,follow`                                                                    | No complete substantive plain-language answer                                    |
| No signed source snapshot                                                 | `noindex,follow`                                                                    | Important conclusion lacks stored provenance                                     |
| Fewer than two distinct independent reviews                               | `noindex,follow`                                                                    | Review boundary incomplete                                                       |
| Stale, review-required, unknown or zero-row source monitoring             | `noindex,follow`                                                                    | Public content is not demonstrably current                                       |
| `/d/{slug}?programme=...` and other dossier presentation/query state      | `noindex,follow`, canonical base dossier                                            | UI state is not an independent landing page                                      |
| Valid filtered or paginated `/browse?...`                                 | `noindex,follow`, canonical `/browse`                                               | Prevent faceted/pagination search-page factory                                   |
| Invalid, duplicate, empty or out-of-range browse state                    | 404                                                                                 | Not a valid result surface                                                       |
| Medicine and programme history routes                                     | `noindex,follow`                                                                    | Audit trail remains public/crawlable without competing with the canonical answer |
| `/review-queue`                                                           | `noindex,follow`                                                                    | Operational workflow, removed from sitemap                                       |
| `/review-queue/search-indexing`                                           | `noindex,nofollow` plus authorization                                               | Internal editor diagnostic                                                       |
| `/indexnow-key.txt` when enabled                                          | HTTP 200 + `X-Robots-Tag: noindex`; otherwise no-store 404                          | Public ownership proof is not a search landing page                              |
| Profile with zero accepted contributions                                  | `noindex,follow`                                                                    | Empty/community-only placeholder profile                                         |
| 404 page                                                                  | `noindex,follow`                                                                    | No public resource                                                               |
| Unresolved compound and retired unsafe/obsolete route families            | HTTP 410 + `X-Robots-Tag: noindex`                                                  | No safe equivalent; do not preserve protocol/acquisition intent                  |
| Absent entity/data/report hubs                                            | No route                                                                            | Avoid thin, invented or legally unsupported pages                                |

History and other noindex pages remain crawlable in production so a crawler can observe `noindex`
and follow links to canonical records. They are not hidden through production `robots.txt`.

## Release conclusion

The work establishes a materially safer SEO/GEO foundation, but it does not guarantee rankings,
citations, rich results, indexing or Core Web Vitals. The combined code gate passes. Production
release still requires observing robots/sitemap/canonical/legacy behavior, verifying IndexNow key
ownership and an accepted request, and keeping Dataset licence claims excluded until the owner
resolves the licence conflict.
