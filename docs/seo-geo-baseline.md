# SEO and GEO baseline

Snapshot: 2026-08-25

This is the code-grounded discovery baseline for RNAWiki after the first technical SEO/GEO pass.
It records what the application does now, including known performance constraints; it is not a
claim that every page is indexed or that Core Web Vitals pass in field data.

Before the 2026-08-25 implementation slice, `npm run typecheck` passed, the focused SEO suite
passed 54 tests, and the full unit suite passed 1,001 tests across 70 files. Those commands were run
before the freshness, canonical-history, exact-citation and live-origin-audit changes described
below. Later counts belong in the implementation report, not in this pre-change measurement.

## Route and indexability matrix

| Route family                              | Canonical/indexing rule                                                                                                                                                                   | Sitemap                          |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `/`                                       | Canonical `/`; indexable only on canonical production                                                                                                                                     | Yes                              |
| `/browse`                                 | Only the parameter-free first page is indexable and canonical                                                                                                                             | Yes, base only                   |
| `/browse?...`                             | Valid filters/pages are `noindex,follow` with canonical `/browse`; unknown, duplicate, empty or invalid parameters and empty filtered results return 404                                  | No                               |
| `/d/{slug}`                               | Alias/case variants permanently redirect to the canonical slug. The canonical page is indexable only when `decideMedicineIndexability` accepts its current reviewed programme publication | Eligible canonical dossiers only |
| `/d/{slug}?programme=...`                 | Shareable UI state; always `noindex,follow`, canonical `/d/{slug}`                                                                                                                        | No                               |
| `/d/{slug}/history` and programme history | `noindex,follow`; the public audit trail remains crawlable for link discovery                                                                                                             | No                               |
| `/review-queue`                           | `noindex,follow`; operational workflow, not a search landing page                                                                                                                         | No                               |
| `/review-queue/search-indexing`           | Steward/admin-only, `noindex,nofollow` report of every shared-policy exclusion reason                                                                                                     | No                               |
| `/editorial-policy`, `/how-it-works`      | Self-canonical, indexable on canonical production                                                                                                                                         | Yes                              |
| `/u/{handle}`                             | Self-canonical; indexable only after at least one accepted contribution                                                                                                                   | Eligible profiles                |
| `/api/**`, `/healthz`                     | Not content; disallowed in production `robots.txt`                                                                                                                                        | No                               |
| `/indexnow-key.txt`                       | Public ownership key only when IndexNow is enabled on canonical production; `noindex`                                                                                                     | No                               |
| Retired legacy families                   | Exact medicine successors receive 301; routes without a safe successor receive 410 + `X-Robots-Tag: noindex`                                                                              | No                               |

The root layout supplies a production-only indexing default. A non-production build receives
`noindex,nofollow,nocache`, the response headers add `X-Robots-Tag: noindex, nofollow, noarchive`,
and `robots.txt` serves `Disallow: /` without a sitemap. Production requires `NODE_ENV=production`,
an explicit `SITE_URL` of `https://rnawiki.com` (optionally with its root slash only), and an
explicit `production` value from
`SEO_DEPLOYMENT_ENV`, `RAILWAY_ENVIRONMENT_NAME` or `VERCEL_ENV`. An unidentified production-mode
build fails closed.

On canonical production, the wildcard crawler group, `OAI-SearchBot` and the currently allowed
`GPTBot` can crawl public content. `/api/` and `/healthz` remain disallowed. Page-level `noindex`
routes such as histories and the review queue are deliberately not disallowed: a crawler must be
able to fetch a page to observe its directive.

Canonical production metadata permits Googlebot `max-image-preview:large`. Non-production
metadata explicitly keeps Googlebot at `noindex,nofollow,noimageindex`, in addition to the response
header and robots.txt guards.

## Sitemap and canonical source of truth

`app/sitemap.ts` emits one `/sitemap.xml` containing the six static discovery routes, eligible
canonical dossiers and contributor profiles with an accepted public contribution. It emits no
query strings, aliases, histories, queues or identity-only records.
For a medicine with several programmes, the latest published programme is the canonical dossier's
default and must itself pass the eligibility policy. Its
`programme_current_publications.published_at` becomes `lastmod`; an older eligible programme cannot
admit a newer fail-closed default page. The sitemap never uses ingest/seed `drugs.updated_at` as a
publication date.

The current corpus fits within the 50,000-URL XML limit. If eligible canonical dossiers approach
that limit, shard the eligible projection and advertise every shard; do not return to sharding the
full identity table.

## Entity and publication fields

| Layer                                              | Fields that matter to discovery                                                                                                                                                                                                                                                                             |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Medicine identity (`drugs`)                        | `id` is the internal primary key; `slug` is the canonical public identifier; `name` describes the entity. `has_discrepancy` records a scientific, regulatory, or source-record disagreement; it is not an identity-dispute flag. `dossier_depth` describes amount written and is not a review-quality gate. |
| Public application model                           | `rowToDossier()` intentionally maps `DrugDossier.id` to `drugs.slug`, not `drugs.id`. This is why existing `drug.id` URL construction currently produces public slugs; preserve or make this mapping explicit in any serializer refactor.                                                                   |
| Programme scope (`development_programmes`)         | `id`, `drug_id`, `slug`, indication, target population, status and exposure context define the claim scope. Programme IDs/slugs are not separate sitemap landing pages in this release.                                                                                                                     |
| Current pointer (`programme_current_publications`) | `programme_id`, `verdict_revision_id`, and real `published_at` select the one authoritative public verdict for a programme.                                                                                                                                                                                 |
| Verdict (`programme_verdict_revisions`)            | `review_status=PUBLISHED`, `reviewed_at`, public label, plain mechanism, best-supported finding, main limitation, and signed engine/proposal provenance are required public invariants.                                                                                                                     |
| Provenance and review                              | At least one `programme_verdict_source_metadata_snapshots` row and two distinct independent rows in `programme_verdict_reviews` are required by the conservative search policy. `review_status=PUBLISHED` proves that two approvals or an approving adjudication resolved those reviews.                    |
| Programme freshness (`programme_freshness_states`) | The selected programme is indexable only when every monitoring row aggregates to `current` under dossier semantics. An overdue `CURRENT` row is stale; review-required outranks stale; zero rows and unassessed/unknown states are `unknown` and fail closed.                                               |

The shared pure policy is `lib/seo/indexability.ts`; `lib/seo/freshness.ts` supplies the exact
monitoring aggregate, and `lib/seo/publication-indexability.ts` supplies the safe database
projection used by both sitemap generation and the editor diagnostic. Dossier metadata passes its
already-rendered aggregate into the same policy so discovery and page-level robots cannot drift.
Retained rows whose slug appears as `medicine_slug_redirects.old_slug` are explicitly excluded;
only the verified target remains eligible for discovery.

## IndexNow baseline

IndexNow is off unless canonical-production deployment checks pass and
`INDEXNOW_ENABLED=true` plus a valid public key are configured. The app serves the key at
`/indexnow-key.txt`. A newly committed, non-idempotent programme publication schedules a full
shared-eligibility re-query after the response, then submits only its eligible canonical base
dossier. Requests are same-origin HTTPS only, deduplicated, capped at 10,000 URLs per batch and
bounded by timeout. Failures are logged but cannot alter publication. A generic explicit-change
helper exists for future verified redirect/removal/deletion workflows; no speculative hooks exist.

## Rendering, session and cache baseline

Important public content is server-rendered, including evidence inside native `<details>` elements.
That is valuable for both search and answer-engine extraction and should be preserved.

The current rendering path is nevertheless account-coupled:

- `getCurrentUser()` reads `cookies()` and, for a signed-in request, queries `users`;
- `AppShell` requires an `initialUser`, so home, browse, dossier, trust pages, profiles and histories
  perform per-request session work;
- home, browse, how-it-works, the trust pages and sitemap are explicitly `force-dynamic`; cookie
  access also makes other public routes dynamic;
- dossier loaders use React `cache()` to deduplicate work within one request, but the repository has
  no persistent `unstable_cache`/tagged public projection or publication-driven cache invalidation.

This is the main remaining technical performance risk. A published dossier currently assembles
roughly 25 SQL statements over about 12 sequential waves against a pool capped at 10 connections.
The next architecture pass should split cacheable anonymous evidence from the authenticated account
island and serve a denormalized or tagged, publication-invalidated public read model. Do not solve
this by client-rendering the evidence.

## Statement-level citation boundary

The current programme read now carries published dependencies for `plainMechanism`,
`bestSupportedFinding` and `mainLimitation` through an exact field → claim → immutable source path.
The server-rendered dossier places numbered relationship-labelled sources beside a displayed field
only when that complete chain exists. It does not substitute every verdict source, and it withholds
the adjacent citation when reader wording came from a different fallback field or any dependent
claim/source link is missing.

Mechanism steps and timeline events keep their own exact bindings. These field citations improve
attribution and extraction; they do not assert that a source independently proves the programme
conclusion.

## Measurement baseline and next checks

- Focused technical policy: `npm run check:seo`.
- No field Core Web Vitals baseline is present yet; add production RUM before claiming CWV success.
- Search Console should track indexed versus submitted canonical URLs, legacy 301/410 recrawls,
  canonical selection and crawl errors.
- Server logs should separate Googlebot, Bingbot, OAI-SearchBot and GPTBot status/latency, without
  treating crawler user-agent strings alone as authentication.
- Highest measured-code follow-ups: cache/session separation, published-dossier query collapse,
  CommunityCommentary hydration/CLS, lean browse rows, lazy client editors/modals, and accessible
  search combobox behavior.
